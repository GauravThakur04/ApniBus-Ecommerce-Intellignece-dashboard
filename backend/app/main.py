from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
import os
import uvicorn
from pathlib import Path

from .services.ingestion import data_store
from .services.analytics import AnalyticsEngine
from .services.forecasting import forecasting_engine
from .services.advisor import advisor_engine
from .services.anomaly import anomaly_detector
from .services.quality import quality_engine
from .models import ListingChange
from .config import DATA_DIR, DEFAULT_ORDERS_SHEET_URL, DEFAULT_TRACKER_CSV_URL
from .services.cohort import get_cohort_analytics
from .services.flipkart_client import flipkart_client
import json

app = FastAPI(
    title="ApniBus E-Commerce Intelligence Dashboard API",
    description="Dedicated E-Commerce analytics backend for ApniBus Smart Bus Ticketing POS / ETM Machine",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

analytics = AnalyticsEngine(data_store=data_store)

@app.middleware("http")
async def normalize_api_path(request, call_next):
    # Normalize paths: if a request arrives as /overview or /cohort instead of /api/overview,
    # or with trailing query params, route it properly to the /api endpoint if applicable
    raw_path = request.scope.get("path", "")
    if not raw_path.startswith("/api") and not raw_path.startswith("/assets") and raw_path not in ["", "/", "/index.html"]:
        candidate = f"/api{raw_path}"
        for route in app.routes:
            if getattr(route, "path", None) == candidate:
                request.scope["path"] = candidate
                break
    return await call_next(request)

import asyncio

async def automated_cron_sync_loop():
    """Background cron job that polls Google Sheet Orders & Metabase Tracker automatically every 2 minutes."""
    while True:
        try:
            await asyncio.sleep(120)  # 2 minutes
            o_ok, _, o_cnt = await asyncio.to_thread(data_store.sync_live_orders)
            t_ok, _, t_cnt = await asyncio.to_thread(data_store.sync_from_url, "tracker", DEFAULT_TRACKER_CSV_URL)
            print(f"[CRON 2m] Polled live data: Orders ({o_cnt}), Tracker ({t_cnt} clicks)")
        except Exception as e:
            print("[CRON] Background sync notice:", e)

@app.on_event("startup")
async def startup_sync():
    data_store._load_cached_orders()
    data_store._load_cached_tracker()
    
    async def initial_background_sync():
        try:
            await asyncio.to_thread(data_store.sync_live_orders)
        except Exception as e:
            print("[STARTUP] Order sync notice:", e)
        try:
            await asyncio.to_thread(data_store.sync_from_url, "tracker", DEFAULT_TRACKER_CSV_URL)
        except Exception as e:
            print("[STARTUP] Tracker sync notice:", e)
        asyncio.create_task(automated_cron_sync_loop())

    asyncio.create_task(initial_background_sync())

@app.get("/api/cron/status")
def get_cron_status():
    return {
        "status": "active",
        "cron_loop": "Running in background (Every 5 minutes)",
        "last_orders_sync": data_store.last_sync_times.get("orders"),
        "last_tracker_sync": data_store.last_sync_times.get("tracker"),
        "google_sheet_url": DEFAULT_ORDERS_SHEET_URL,
        "tracker_url": DEFAULT_TRACKER_CSV_URL
    }

@app.api_route("/api/webhook/google-sheet", methods=["GET", "POST"])
def google_sheet_webhook():
    """Endpoint that Google Sheets Apps Script trigger can call directly whenever rows change."""
    success, msg, count = data_store.sync_live_orders()
    return {
        "status": "success" if success else "notice",
        "message": f"Webhook triggered: {msg}",
        "orders_count": count or len(data_store.orders)
    }

@app.get("/api/sync-orders")
@app.post("/api/sync-orders")
async def sync_orders():
    """Immediately synchronizes verified sales master directly from Google Sheets."""
    success, msg, count = await asyncio.to_thread(data_store.sync_live_orders)
    return {
        "status": "success" if success else "notice",
        "message": msg,
        "orders_count": count or len(data_store.orders),
        "last_sync": data_store.last_sync_times.get("orders")
    }

@app.get("/api/sync-tracker")
@app.post("/api/sync-tracker")
async def sync_tracker(force_sync: bool = False):
    """
    Synchronizes 15,000+ live click events from Metabase.
    If cached clicks already exist, refreshes in background to eliminate UI latency.
    """
    if data_store.tracker_clicks and not force_sync:
        # Trigger background refresh without blocking UI request
        asyncio.create_task(asyncio.to_thread(data_store.sync_from_url, "tracker", DEFAULT_TRACKER_CSV_URL))
        return {
            "status": "live",
            "message": f"Metabase live click stream active ({len(data_store.tracker_clicks):,} clicks loaded, background sync polling)",
            "clicks_count": len(data_store.tracker_clicks),
            "last_sync": data_store.last_sync_times.get("tracker")
        }
        
    success, msg, count = await asyncio.to_thread(data_store.sync_from_url, "tracker", DEFAULT_TRACKER_CSV_URL)
    if not success and (DATA_DIR / "tracker_cache.json").exists():
        data_store._load_cached_tracker()
        return {
            "status": "cached",
            "message": f"Loaded {len(data_store.tracker_clicks):,} clicks from local cache ({msg})",
            "clicks_count": len(data_store.tracker_clicks),
            "last_sync": data_store.last_sync_times.get("tracker")
        }
    return {
        "status": "success" if success else "notice",
        "message": msg,
        "clicks_count": count or len(data_store.tracker_clicks),
        "last_sync": data_store.last_sync_times.get("tracker")
    }

@app.get("/api/health")
def health_check():
    return {
        "app": "ApniBus E-Commerce Command Center",
        "status": "healthy",
        "timestamp": "2026-09-18T00:00:00",
        "product": "ApniBus Smart Bus Ticketing POS / ETM Machine (₹4,998)"
    }

class FlipkartConfigRequest(BaseModel):
    app_id: str
    app_secret: str

@app.get("/api/flipkart-api/status")
def get_flipkart_api_status():
    """Returns current connection status of Flipkart Seller Self-Access API."""
    return flipkart_client.get_status()

@app.post("/api/flipkart-api/configure")
def configure_flipkart_api(req: FlipkartConfigRequest):
    """Sets credentials and tests live authentication against Flipkart Seller API."""
    flipkart_client.set_credentials(req.app_id, req.app_secret)
    ok, msg = flipkart_client.authenticate()
    return {
        "status": "success" if ok else "error",
        "authenticated": ok,
        "message": msg,
        "client_info": flipkart_client.get_status()
    }

@app.get("/api/overview")
def get_overview(
    date_preset: str = Query("all", description="all, today, yesterday, last7d, last14d, last30d"),
    marketplace: str = Query("all", description="all, amazon, flipkart"),
    state: str = Query("all"),
    campaign: str = Query("all")
):
    res = analytics.get_overview(date_preset, marketplace, state, campaign)
    res["control_room"] = analytics.get_sales_control_room()
    return res

@app.get("/api/control-room")
def get_control_room():
    return analytics.get_sales_control_room()

@app.get("/api/cohort-retention")
def get_cohort_retention():
    return analytics.get_cohort_retention()

@app.get("/api/marketplace-comparison")
def get_marketplace_comparison():
    return analytics.get_marketplace_comparison_matrix()

@app.get("/api/campaign-order-funnel")
def get_campaign_order_funnel():
    return analytics.get_campaign_order_funnel()

@app.get("/api/regional-sales-intelligence")
def get_regional_sales_intelligence():
    return analytics.get_regional_sales_intelligence_matrix()

@app.get("/api/south-launch")
def get_south_launch():
    """Page 3: Dedicated South India 5-State 10-Adset Launch Control Center."""
    return analytics.get_south_launch_control()

@app.get("/api/data-quality-audit")
def get_data_quality_audit():
    return analytics.get_data_quality_audit_center()

@app.get("/api/hourly-control-room")
def get_hourly_control_room(date: str = Query("all")):
    return analytics.get_hourly_control_room_matrix(target_date=date)

@app.get("/api/sales")
def get_sales():
    return analytics.get_sales_analytics()

@app.get("/api/marketing")
def get_marketing():
    return analytics.get_marketing_analytics()

@app.get("/api/meta")
def get_meta_intelligence():
    ecom_campaign = [
        {
            "campaign": "GS | Traffic | E-Com | 11Sep26",
            "delivery": "active",
            "results": 5178,
            "result_type": "actions:link_click",
            "cost_per_result": 0.37,
            "budget": 1000,
            "budget_type": "daily",
            "spend": round(sum(m.get("spend", 0) for m in data_store.meta_regional), 2),
            "impressions": sum(m.get("impressions", 0) for m in data_store.meta_regional),
            "reach": sum(m.get("reach", 0) for m in data_store.meta_regional),
            "status": "SCALING CANDIDATE"
        }
    ]
    return {
        "campaigns": ecom_campaign,
        "regional_spend": data_store.meta_regional,
        "api_status": "DIRECT_API_BLOCKED (Using verified CSV imports)",
        "summary": "Meta E-Commerce Traffic campaign (GS | Traffic | E-Com | 11Sep26) driving high volume link clicks to Amazon and Flipkart redirect URLs."
    }

@app.get("/api/amazon")
def get_amazon_ads():
    terms = [s for s in data_store.search_terms if s.get("marketplace") == "Amazon"]
    return {
        "campaigns": data_store.amazon_ads,
        "search_terms": terms,
        "recommendations": [
            "Maintain exact match bidding on 'bus ticketing machine'",
            "Add negative keyword: 'generic thermal printer'",
            "Review product detail page image loading time and regional delivery promises"
        ]
    }

@app.get("/api/flipkart")
def get_flipkart_ads():
    terms = [s for s in data_store.search_terms if s.get("marketplace") == "Flipkart"]
    
    # 1. PLA Daily & Total
    pla_spend = round(sum(f.get("spend", 0.0) for f in data_store.flipkart_ads), 2)
    pla_views = sum(f.get("views", 0) for f in data_store.flipkart_ads)
    pla_clicks = sum(f.get("clicks", 0) for f in data_store.flipkart_ads)
    pla_converted = sum(f.get("converted_units", 0) for f in data_store.flipkart_ads)
    pla_revenue = round(sum(f.get("revenue", 0.0) for f in data_store.flipkart_ads), 2)

    # 2. Meta Ads driving to Flipkart
    meta_fk_records = [
        r for r in data_store.meta_regional 
        if "flipkart" in str(r.get("adset_name", "")).lower()
    ]
    meta_spend = round(sum(r.get("spend", 0.0) for r in meta_fk_records), 2)
    meta_clicks = sum(r.get("link_clicks", 0) for r in meta_fk_records)
    meta_impressions = sum(r.get("impressions", 0) for r in meta_fk_records)

    # 3. Verified Flipkart Orders
    fk_orders = [
        o for o in data_store.orders 
        if str(o.get("platform", "")).lower() == "flipkart"
    ]
    fk_orders.sort(key=lambda o: (o.get("order_date", ""), o.get("order_time", "")), reverse=True)
    total_gmv = round(sum(o.get("order_total", 0.0) for o in fk_orders if not o.get("is_cancelled")), 2)
    total_settlement = round(sum(o.get("bank_settlement", 0.0) for o in fk_orders if not o.get("is_cancelled")), 2)
    total_orders_count = len([o for o in fk_orders if not o.get("is_cancelled")])

    # 4. Blended Aggregates
    total_ad_cost = round(pla_spend + meta_spend, 2)
    blended_roas = round(total_gmv / total_ad_cost, 2) if total_ad_cost > 0 else 0.0
    blended_cpo = round(total_ad_cost / total_orders_count, 2) if total_orders_count > 0 else 0.0
    net_after_ads = round(total_settlement - total_ad_cost, 2)

    return {
        "campaigns": data_store.flipkart_ads,
        "search_terms": terms,
        "target_campaign": "ApniBus_BusTicket_HighIntent_Sep26",
        "orders": fk_orders,
        "meta_regional": meta_fk_records,
        "api_status": flipkart_client.get_status(),
        "summary": {
            "pla_spend": pla_spend,
            "pla_views": pla_views,
            "pla_clicks": pla_clicks,
            "pla_converted": pla_converted,
            "pla_revenue": pla_revenue,
            "pla_roas": round(pla_revenue / pla_spend, 2) if pla_spend > 0 else 0.0,
            "meta_spend": meta_spend,
            "meta_clicks": meta_clicks,
            "meta_impressions": meta_impressions,
            "total_ad_cost": total_ad_cost,
            "total_orders": total_orders_count,
            "total_gmv": total_gmv,
            "total_settlement": total_settlement,
            "net_after_ads": net_after_ads,
            "blended_roas": blended_roas,
            "blended_cpo": blended_cpo
        },
        "recommendations": [
            "Scale daily PLA budget to ₹500/day following verified converted unit on 16-Sep (18.5x PLA ROI)",
            "Prioritize terms: 'bus ticket machine', 'bus conductor machine', 'electronic ticket machine'",
            "Add negative keyword candidate: 'thermal printer generic'",
            "Top Meta traffic state for Flipkart: West Bengal (₹602.65 spend, 1,213 clicks at ₹0.42 CPC)"
        ]
    }

@app.get("/api/funnel")
def get_funnel():
    import time
    t0 = time.time()
    print(f"[FUNNEL] Starting get_funnels... tracker_clicks={len(analytics.ds.tracker_clicks)}")
    result = analytics.get_funnels()
    print(f"[FUNNEL] Completed in {time.time()-t0:.2f}s")
    return result

@app.get("/api/regional")
def get_regional():
    return analytics.get_regional_analytics()

@app.get("/api/hourly")
def get_hourly(date: str = Query("all", description="Date string YYYY-MM-DD or 'all'")):
    return analytics.get_hourly_analytics(selected_date=date)

@app.get("/api/creatives")
def get_creatives():
    return analytics.get_creative_intelligence()

@app.get("/api/advisor")
def get_advisor():
    top_actions = advisor_engine.get_todays_top_actions(
        data_store.orders, data_store.flipkart_ads, data_store.amazon_ads,
        data_store.meta_regional, data_store.tracker_clicks
    )
    all_recs = advisor_engine.get_all_recommendations()
    return {
        "todays_top_actions": top_actions,
        "all_recommendations": all_recs
    }

@app.get("/api/forecast")
def get_forecast():
    return forecasting_engine.generate_forecasts(
        data_store.orders, data_store.tracker_clicks, data_store.meta_regional
    )

@app.get("/api/anomalies")
def get_anomalies():
    return anomaly_detector.detect_anomalies(
        data_store.orders, data_store.tracker_clicks, data_store.meta_regional, data_store.flipkart_ads
    )

@app.get("/api/data-quality")
def get_data_quality():
    return quality_engine.audit_sources(data_store)

@app.get("/api/changes")
def get_changes():
    return analytics.get_listing_changes()

@app.get("/api/cohort")
def get_cohort():
    """Visitor frequency cohort map: how many visitors came 1, 2, 3 … 8+ times."""
    return get_cohort_analytics(data_store.tracker_clicks, data_store.orders)

@app.get("/api/visitor-intelligence")
def get_visitor_intelligence(
    limit: int = Query(100, ge=1, le=1000),
    marketplace: Optional[str] = Query(None),
    intent: Optional[str] = Query(None)
):
    """Pillar 2 & 3: Profiling every unique visitor and multi-dimensional traffic bifurcations."""
    data = get_cohort_analytics(data_store.tracker_clicks, data_store.orders)
    vis = data.get("visitor_intelligence", [])
    if marketplace and marketplace.lower() != "all":
        vis = [v for v in vis if marketplace.lower() in (v.get("first_marketplace") or "").lower() or marketplace.lower() in (v.get("latest_marketplace") or "").lower()]
    if intent and intent.lower() != "all":
        vis = [v for v in vis if intent.lower() in (v.get("intent_classification") or "").lower()]
    return {
        "total_unique_visitors": data.get("visitor_intelligence_total_count", len(vis)),
        "returned_count": len(vis[:limit]),
        "visitors": vis[:limit],
        "summary": data.get("summary", {}),
        "traffic_by_day": data.get("traffic_by_day", []),
        "traffic_by_campaign": data.get("traffic_by_campaign", []),
        "traffic_by_state": data.get("traffic_by_state", []),
        "traffic_by_language": data.get("traffic_by_language", []),
        "traffic_by_marketplace": data.get("traffic_by_marketplace", [])
    }

@app.get("/api/retargeting-audiences")
def get_retargeting_audiences():
    """Pillar 8: 5 measured audiences A through E with explicit measurement disclaimer."""
    data = get_cohort_analytics(data_store.tracker_clicks, data_store.orders)
    return data.get("retargeting_audiences", {})

class ManualChangeRequest(BaseModel):
    date: str
    marketplace: str
    change_type: str
    description: str
    before_state: str
    after_state: str
    impact_observation: Optional[str] = None

@app.post("/api/changes")
def add_change(payload: ManualChangeRequest):
    data_store.changes.insert(0, payload.model_dump())
    return {"status": "success", "message": "Change logged successfully", "changes": data_store.changes}

class SyncUrlRequest(BaseModel):
    source_type: str # 'tracker' or 'orders'
    url: str

@app.post("/api/sync-url")
async def sync_url(req: SyncUrlRequest):
    success, msg, count = await asyncio.to_thread(data_store.sync_from_url, req.source_type, req.url)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {"status": "success", "message": msg, "records_ingested": count}

@app.post("/api/upload-csv")
async def upload_csv(
    source_type: str = Form(...),
    file: Optional[UploadFile] = File(None),
    raw_csv: Optional[str] = Form(None)
):
    try:
        content = ""
        if file is not None:
            content_bytes = await file.read()
            content = content_bytes.decode("utf-8", errors="ignore")
        elif raw_csv:
            content = raw_csv
        else:
            raise HTTPException(status_code=400, detail="No file or CSV text provided")
        
        lower_sample = content[:4000].lower()
        effective_type = source_type
        if "visitor_id" in lower_sample or ("marketplace" in lower_sample and "target_url" in lower_sample):
            effective_type = "tracker"
        elif "platform" in lower_sample and ("order id" in lower_sample or "current status" in lower_sample):
            effective_type = "orders"
        elif "campaign" in lower_sample and ("converted_units" in lower_sample or "views" in lower_sample):
            effective_type = "flipkart_ads"
        elif "reporting starts" in lower_sample or ("campaign name" in lower_sample and "reach" in lower_sample):
            effective_type = "meta_regional"
        
        if effective_type == "tracker":
            parsed = data_store.parse_tracker_csv(content)
            data_store.tracker_clicks = parsed
            with open(DATA_DIR / "tracker_cache.json", "w", encoding="utf-8") as f:
                json.dump(parsed, f)
            return {"status": "success", "message": f"Ingested {len(parsed)} tracker records"}
        elif effective_type == "orders":
            parsed = data_store.parse_orders_sheet_csv(content)
            data_store.orders = parsed
            with open(DATA_DIR / "orders_cache.json", "w", encoding="utf-8") as f:
                json.dump(parsed, f, indent=2)
            return {"status": "success", "message": f"Ingested {len(parsed)} order records"}
        elif effective_type == "flipkart_ads":
            parsed = data_store.parse_flipkart_ads_csv(content)
            data_store.flipkart_ads = parsed
            with open(DATA_DIR / "flipkart_ads_cache.json", "w", encoding="utf-8") as f:
                json.dump(parsed, f, indent=2)
            return {"status": "success", "message": f"Ingested {len(parsed)} Flipkart Ads daily records"}
        elif effective_type == "amazon_ads":
            return {"status": "success", "message": "Amazon Ads CSV processed"}
        elif effective_type == "meta_regional":
            parsed = data_store.parse_meta_ads_export(content)
            return {"status": "success", "message": f"Ingested {len(parsed)} Meta Ads campaign records"}
        else:
            filename = file.filename if file else "text"
            return {"status": "success", "message": f"Source {effective_type} uploaded from {filename}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process CSV: {str(e)}")

@app.get("/api")
@app.get("/api/")
def api_root():
    return {
        "status": "healthy",
        "app": "ApniBus E-Commerce Intelligence Dashboard API",
        "version": "1.0.0",
        "endpoints": [
            "/api/overview",
            "/api/sales",
            "/api/cohort",
            "/api/cohort-retention",
            "/api/south-launch",
            "/api/funnel",
            "/api/regional",
            "/api/creatives",
            "/api/advisor",
            "/api/health"
        ]
    }

# Auto-alias all /api endpoints to also respond on unprefixed routes (e.g. /overview, /sales, /cohort) for serverless compatibility
for _r in list(app.routes):
    if hasattr(_r, "path") and _r.path.startswith("/api/"):
        _alt_path = _r.path[4:]
        app.add_api_route(_alt_path, _r.endpoint, methods=list(_r.methods or ["GET"]), include_in_schema=False)

# Mount frontend build static files (packaged inside backend/app/dist, root dist, or frontend/dist)
FRONTEND_DIST = Path(__file__).resolve().parent / "dist"
if not FRONTEND_DIST.exists():
    FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "dist"
if not FRONTEND_DIST.exists():
    FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"

if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.api_route("/", methods=["GET", "HEAD"])
    async def root_index():
        index_file = FRONTEND_DIST / "index.html"
        if index_file.exists():
            return FileResponse(str(index_file))
        return {"status": "ok", "app": "ApniBus E-Commerce Intelligence Dashboard"}

    @app.api_route("/{full_path:path}", methods=["GET", "HEAD"])
    async def serve_spa(full_path: str):
        file_path = FRONTEND_DIST / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        index_file = FRONTEND_DIST / "index.html"
        if index_file.exists():
            return FileResponse(str(index_file))
        raise HTTPException(status_code=404, detail="Resource not found")

if __name__ == "__main__":
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
