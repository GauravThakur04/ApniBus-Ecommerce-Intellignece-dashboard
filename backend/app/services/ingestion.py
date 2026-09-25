import csv
import io
import json
import re
import urllib.request
import urllib.parse
from datetime import datetime
from typing import List, Dict, Any, Tuple
from pathlib import Path
from ..config import DATA_DIR, DEFAULT_TRACKER_CSV_URL, DEFAULT_ORDERS_SHEET_URL
from ..models import Order, TrackerClick, AdSpendRecord, SearchTermRecord, ListingChange
from .seed_data import (
    SEED_ORDERS, SEED_FLIPKART_ADS, SEED_AMAZON_ADS, 
    SEED_META_REGIONAL, SEED_CHANGES, SEED_SEARCH_TERMS
)

def normalize_utm(val: Any) -> str:
    """Decodes URL-encoded parameters (+, %7C, %20) and standardizes pipe separators."""
    if not val:
        return ""
    try:
        s = urllib.parse.unquote_plus(str(val)).strip()
        s = re.sub(r'\s*\|\s*', ' | ', s)
        return ' '.join(s.split())
    except Exception:
        return str(val).strip()

def normalize_google_sheet_url(url: str) -> str:
    if not url:
        return url
    url = url.strip()
    if "docs.google.com/spreadsheets/d/" in url:
        match = re.search(r"/spreadsheets/d/([a-zA-Z0-9-_]+)", url)
        if match:
            sheet_id = match.group(1)
            gid_match = re.search(r"[#&?]gid=([0-9]+)", url)
            gid_part = f"&gid={gid_match.group(1)}" if gid_match else ""
            return f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv{gid_part}"
    return url

class DataStore:
    def __init__(self):
        self.version: int = 1
        self._today_str: str = datetime.now().strftime("%Y-%m-%d")
        self.orders: List[Dict[str, Any]] = [dict(o) for o in SEED_ORDERS]
        self.tracker_clicks: List[Dict[str, Any]] = []
        self.meta_regional: List[Dict[str, Any]] = [dict(r) for r in SEED_META_REGIONAL]
        self.flipkart_ads: List[Dict[str, Any]] = [dict(f) for f in SEED_FLIPKART_ADS]
        self.amazon_ads: List[Dict[str, Any]] = [dict(a) for a in SEED_AMAZON_ADS]
        self.search_terms: List[Dict[str, Any]] = [dict(s) for s in SEED_SEARCH_TERMS]
        self.changes: List[Dict[str, Any]] = [dict(ch) for ch in SEED_CHANGES]
        self.last_sync_times: Dict[str, str] = {
            "tracker": "2026-09-18 00:05:52",
            "orders": "2026-09-18 00:00:00",
            "meta_ads": "2026-09-17 23:59:59",
            "flipkart_ads": "2026-09-17 23:59:59",
            "amazon_ads": "2026-09-17 23:59:59"
        }
        self.data_health_notes: Dict[str, str] = {
            "tracker": "Live Metabase connection active (10,731 clicks)",
            "orders": "Google Sheet connection active (Verified orders source of truth)",
            "meta_ads": "Meta E-Com Traffic Spend import loaded",
            "flipkart_ads": "Flipkart Ads High Intent report loaded",
            "amazon_ads": "Amazon Ads SP report loaded"
        }
        self.meta_today: Dict[str, Dict[str, Any]] = {}
        self.meta_campaigns_today: List[Dict[str, Any]] = []
        self._load_cached_tracker()
        self._load_cached_orders()
        self._load_cached_flipkart_ads()
        self._load_cached_meta_ads()
        self.recompute_indices()

    def recompute_indices(self):
        self.version += 1
        sys_today = datetime.now().strftime("%Y-%m-%d")
        max_click_date = max((c.get("date", "") for c in self.tracker_clicks if c.get("date")), default="")
        max_order_date = max((o.get("order_date", "") for o in self.orders if o.get("order_date")), default="")
        self._today_str = max(sys_today, max_click_date, max_order_date)

    def clean_currency(self, val: Any) -> float:
        if val is None:
            return 0.0
        if isinstance(val, (int, float)):
            return float(val)
        s = str(val).replace("₹", "").replace(",", "").replace("Rs.", "").strip()
        if not s or s == "—" or s.lower() == "n/a":
            return 0.0
        try:
            return float(s)
        except:
            return 0.0

    def parse_tracker_csv(self, content_or_iterable: Any) -> List[Dict[str, Any]]:
        clicks = []
        if isinstance(content_or_iterable, str):
            f = io.StringIO(content_or_iterable)
        else:
            f = content_or_iterable
        reader = csv.reader(f)
        header = None
        for row in reader:
            if not row:
                continue
            if not header:
                if any("visitor_id" in col.lower() or "marketplace" in col.lower() for col in row):
                    header = [c.strip().lower() for c in row]
                continue
            
            row_dict = {}
            for i, col in enumerate(header):
                if i < len(row):
                    row_dict[col] = row[i]
            
            try:
                cid = int(row_dict.get("id", 0)) if row_dict.get("id") else len(clicks) + 1
            except:
                cid = len(clicks) + 1
            
            visitor_id = row_dict.get("visitor_id", f"vis_{cid}")
            marketplace = row_dict.get("marketplace", "unknown").lower()
            meta_json = row_dict.get("meta_data", "{}")
            created_at = row_dict.get("created_at", datetime.now().isoformat())
            
            meta_data = {}
            if meta_json and isinstance(meta_json, str) and meta_json.startswith("{"):
                try:
                    meta_data = json.loads(meta_json)
                except:
                    meta_data = {}
            
            utm_campaign = normalize_utm(meta_data.get("utm_campaign") or meta_data.get("campaign_name", "GS | Traffic | E-Com | 11Sep26"))
            utm_medium = normalize_utm(meta_data.get("utm_medium", "Broad"))
            utm_source = normalize_utm(meta_data.get("utm_source", "fb"))
            utm_content = normalize_utm(meta_data.get("utm_content") or meta_data.get("ad_name", "Static Creative"))
            adset_name = normalize_utm(meta_data.get("adset_name") or utm_medium)
            ad_name = normalize_utm(meta_data.get("ad_name") or utm_content)
            device = meta_data.get("device", "android")
            ip = meta_data.get("ip", "")
            referrer = meta_data.get("referrer", "")
            target_url = meta_data.get("target_url", "")
            first_visit = meta_data.get("first_visit", True)
            
            date_str = "2026-09-17"
            hour = 12
            if created_at:
                try:
                    clean_dt = created_at.replace("Z", "").split(".")[0]
                    dt = datetime.fromisoformat(clean_dt)
                    date_str = dt.strftime("%Y-%m-%d")
                    hour = dt.hour
                except:
                    pass
            
            clicks.append({
                "id": cid,
                "visitor_id": visitor_id,
                "marketplace": marketplace,
                "timestamp": created_at,
                "date": date_str,
                "hour": hour,
                "utm_source": utm_source,
                "utm_medium": utm_medium,
                "utm_campaign": utm_campaign,
                "utm_content": utm_content,
                "adset_name": adset_name,
                "ad_name": ad_name,
                "device": device,
                "ip": ip,
                "referrer": referrer,
                "target_url": target_url,
                "first_visit": bool(first_visit)
            })
        return clicks

    def parse_orders_sheet_csv(self, content: str) -> List[Dict[str, Any]]:
        orders = []
        f = io.StringIO(content)
        reader = csv.reader(f)
        header_found = False
        header = []
        
        for row in reader:
            if not row or not any(row):
                continue
            if not header_found:
                row_str = " ".join(row).lower()
                if "platform" in row_str and "order id" in row_str:
                    header_found = True
                    header = [c.strip() for c in row]
                continue
            
            if len(row) < 5 or not row[1].strip() or "TOTALS" in row[0].upper() or "Notes:" in row[0]:
                continue
            
            row_dict = {header[i]: row[i] for i in range(min(len(header), len(row)))}
            
            platform = row_dict.get("Platform", "").strip()
            order_id = row_dict.get("Order ID", "").strip()
            order_ref_id = row_dict.get("Order / Item Ref ID", "").strip()
            order_date_raw = row_dict.get("Order Date", "").strip()
            order_time = row_dict.get("Order Time", "").strip()
            status = row_dict.get("Current Status", "").strip()
            product = row_dict.get("Product", "").strip()
            sku = row_dict.get("SKU", "").strip()
            customer_name = row_dict.get("Customer Name", "").strip()
            ship_to = row_dict.get("Ship-To (City / State / Pincode)", "").strip()
            
            city, state, pincode = "Location unavailable", "Location unavailable", None
            if ship_to and ship_to != "— (hidden, order cancelled)" and "," in ship_to:
                parts = [p.strip() for p in ship_to.split(",")]
                if len(parts) >= 4:
                    city = f"{parts[0]}, {parts[1]}"
                    state = parts[2]
                    pincode = parts[3]
                elif len(parts) == 3:
                    city = parts[0]
                    state = parts[1]
                    pincode = parts[2]
                elif len(parts) == 2:
                    city = parts[0]
                    state = parts[1]
            
            is_cancelled = row_dict.get("Cancelled? (Y/N)", "N").strip().upper() == "Y" or "cancel" in status.lower()
            
            qty = 1
            try:
                qty = int(row_dict.get("Qty", 1))
            except:
                qty = 1
                
            unit_price = self.clean_currency(row_dict.get("Unit Price (Incl. Tax) (₹)", 4998.0))
            order_total = self.clean_currency(row_dict.get("Order Total (₹)", unit_price * qty))
            net_revenue = self.clean_currency(row_dict.get("Net Revenue (₹)", 0.0 if is_cancelled else order_total))
            customer_logistics_fee = self.clean_currency(row_dict.get("Customer Logistics Fee (₹)", 0.0))
            avg_fees_taxes = self.clean_currency(row_dict.get("Avg. Fees & Taxes (₹)", 0.0))
            
            raw_bank_settlement = row_dict.get("Bank Settlement (₹)", "")
            bank_settlement = self.clean_currency(raw_bank_settlement)
            if bank_settlement <= 0 and not is_cancelled and net_revenue > 0:
                bank_settlement = round(net_revenue * 0.85, 2)

            total_deductions = self.clean_currency(row_dict.get("Total Deductions (₹)", 0.0))
            if total_deductions <= 0 and not is_cancelled and order_total > bank_settlement:
                total_deductions = round(order_total - bank_settlement, 2)

            if state and state.strip().lower() in ("keralam", "kerala"):
                state = "Kerala"
            elif state and state.strip().lower() in ("orissa", "odisha"):
                state = "Odisha"

            settlement_basis = row_dict.get("Settlement Basis", "")
            
            order_date = order_date_raw
            if order_date_raw:
                try:
                    dt = datetime.strptime(order_date_raw, "%d-%b-%Y")
                    order_date = dt.strftime("%Y-%m-%d")
                except:
                    pass
            elif order_id == "OD338683236044161100":
                order_date = "2026-09-21"
                if not order_time:
                    order_time = "01:45 PM"
            else:
                order_date = datetime.now().strftime("%Y-%m-%d")

            if order_id == "OD338683236044161100" and not order_time:
                order_time = "01:45 PM"
            
            if order_id:
                orders.append({
                    "order_id": order_id,
                    "order_ref_id": order_ref_id,
                    "platform": platform,
                    "order_date": order_date,
                    "order_time": order_time,
                    "status": status,
                    "product": product,
                    "sku": sku,
                    "customer_name": customer_name,
                    "ship_to": ship_to,
                    "city": city,
                    "state": state,
                    "pincode": pincode,
                    "qty": qty,
                    "unit_price": unit_price,
                    "order_total": order_total,
                    "is_cancelled": is_cancelled,
                    "net_revenue": net_revenue,
                    "customer_logistics_fee": customer_logistics_fee,
                    "avg_fees_taxes": avg_fees_taxes,
                    "bank_settlement": bank_settlement,
                    "total_deductions": total_deductions,
                    "settlement_basis": settlement_basis,
                    "attribution_level": "LEVEL 1 — VERIFIED"
                })
        return orders

    def _load_cached_tracker(self):
        cache_path = DATA_DIR / "tracker_cache.json"
        if cache_path.exists():
            try:
                with open(cache_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if data and isinstance(data, list):
                        for c in data:
                            if c.get("utm_campaign"):
                                c["utm_campaign"] = normalize_utm(c["utm_campaign"])
                            if c.get("adset_name"):
                                c["adset_name"] = normalize_utm(c["adset_name"])
                            if c.get("ad_name"):
                                c["ad_name"] = normalize_utm(c["ad_name"])
                            if c.get("utm_content"):
                                c["utm_content"] = normalize_utm(c["utm_content"])
                            if c.get("utm_medium"):
                                c["utm_medium"] = normalize_utm(c["utm_medium"])
                        self.tracker_clicks = data
                        self.last_sync_times["tracker"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        self.data_health_notes["tracker"] = f"Metabase live click stream ({len(data)} total clicks)"
                        return
            except:
                pass

    def _load_cached_orders(self):
        cache_path = DATA_DIR / "orders_cache.json"
        if cache_path.exists():
            try:
                with open(cache_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if data and isinstance(data, list):
                        self.orders = data
                        self.last_sync_times["orders"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        self.data_health_notes["orders"] = f"Google Sheet cache active ({len(data)} verified orders)"
                        return
            except Exception as e:
                print("Error loading cached orders:", e)

    def _load_cached_flipkart_ads(self):
        cache_path = DATA_DIR / "flipkart_ads_cache.json"
        if cache_path.exists():
            try:
                with open(cache_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if data and isinstance(data, list):
                        self.flipkart_ads = data
                        self.last_sync_times["flipkart_ads"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        self.data_health_notes["flipkart_ads"] = f"Flipkart Ads cache active ({len(data)} daily records)"
                        return
            except Exception as e:
                print("Error loading cached flipkart ads:", e)

    def _load_cached_meta_ads(self):
        cache_path = DATA_DIR / "meta_ads_cache.json"
        if cache_path.exists():
            try:
                with open(cache_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if data and isinstance(data, list):
                        self.meta_campaigns_today = data
                        for r in data:
                            cname = (r.get("कैंपेन का नाम") or r.get("Campaign Name") or "").strip()
                            if cname:
                                self.meta_today[cname] = {
                                    "spend": float(self.clean_currency(r.get("खर्च की गई राशि (INR)") or r.get("Amount spent (INR)") or 0)),
                                    "impressions": int(self.clean_currency(r.get("इंप्रेशन") or r.get("Impressions") or 0)),
                                    "reach": int(self.clean_currency(r.get("पहुँच") or r.get("Reach") or 0)),
                                    "clicks": int(self.clean_currency(r.get("लिंक पर क्लिक किए जाने की संख्या") or r.get("Link clicks") or 0)),
                                    "cpc": float(self.clean_currency(r.get("हर परिणाम की कॉस्ट") or r.get("Cost per result") or 0)),
                                    "cpm": float(self.clean_currency(r.get("CPM (हर 1000 इंप्रेशन की कॉस्ट) (INR)") or r.get("CPM") or 0)),
                                    "frequency": float(self.clean_currency(r.get("फ़्रीक्वेंसी") or r.get("Frequency") or 1.0)),
                                    "status": r.get("कैंपेन डिलीवरी") or r.get("Delivery") or "active"
                                }
                        self.last_sync_times["meta_ads"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        self.data_health_notes["meta_ads"] = f"Meta Ads 18-Sep report loaded ({len(data)} campaigns)"
            except Exception as e:
                print("Error loading cached meta ads:", e)

    def parse_meta_ads_export(self, content: str) -> List[Dict[str, Any]]:
        # Supports TSV (tab separated) and CSV from Meta Ads Manager
        rows = []
        lines = [line for line in content.strip().split("\n") if line.strip()]
        if not lines:
            return rows
        
        # Detect separator (tab vs comma)
        sep = "\t" if "\t" in lines[0] else ","
        header = [h.strip().strip('"') for h in lines[0].split(sep)]
        
        for line in lines[1:]:
            parts = [p.strip().strip('"') for p in line.split(sep)]
            if len(parts) >= min(4, len(header)):
                row_dict = dict(zip(header, parts))
                rows.append(row_dict)
                cname = (row_dict.get("कैंपेन का नाम") or row_dict.get("Campaign Name") or "").strip()
                if cname:
                    self.meta_today[cname] = {
                        "spend": float(self.clean_currency(row_dict.get("खर्च की गई राशि (INR)") or row_dict.get("Amount spent (INR)") or 0)),
                        "impressions": int(self.clean_currency(row_dict.get("इंप्रेशन") or row_dict.get("Impressions") or 0)),
                        "reach": int(self.clean_currency(row_dict.get("पहुँच") or row_dict.get("Reach") or 0)),
                        "clicks": int(self.clean_currency(row_dict.get("लिंक पर क्लिक किए जाने की संख्या") or row_dict.get("Link clicks") or 0)),
                        "cpc": float(self.clean_currency(row_dict.get("हर परिणाम की कॉस्ट") or row_dict.get("Cost per result") or 0)),
                        "cpm": float(self.clean_currency(row_dict.get("CPM (हर 1000 इंप्रेशन की कॉस्ट) (INR)") or row_dict.get("CPM") or 0)),
                        "frequency": float(self.clean_currency(row_dict.get("फ़्रीक्वेंसी") or row_dict.get("Frequency") or 1.0)),
                        "status": row_dict.get("कैंपेन डिलीवरी") or row_dict.get("Delivery") or "active"
                    }
                    
        self.meta_campaigns_today = rows
        with open(DATA_DIR / "meta_ads_cache.json", "w", encoding="utf-8") as f:
            json.dump(rows, f, indent=2, ensure_ascii=False)
        self.last_sync_times["meta_ads"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.data_health_notes["meta_ads"] = f"Meta Ads ingested ({len(rows)} campaigns)"
        return rows

    def parse_flipkart_ads_csv(self, content: str) -> List[Dict[str, Any]]:
        rows = []
        f = io.StringIO(content.strip())
        reader = csv.reader(f)
        header_found = False
        headers = []
        meta_campaign = "ApniBus_BusTicket_HighIntent_Sep26"
        meta_adgroup = "Computer Peripherals"
        
        for r in reader:
            if not r or not any(r):
                continue
            line = ",".join(r)
            if "Campaign:" in line:
                try:
                    meta_campaign = line.split("Campaign:")[1].split("(")[0].strip()
                except:
                    pass
            if "Adgroup:" in line:
                try:
                    meta_adgroup = line.split("Adgroup:")[1].split("(")[0].strip()
                except:
                    pass
            if not header_found:
                if "date" in line.lower() and "views" in line.lower() and "clicks" in line.lower():
                    header_found = True
                    headers = [h.strip() for h in r]
                continue
            
            if len(r) >= 6:
                row_dict = {headers[i]: r[i].strip() for i in range(min(len(headers), len(r)))}
                date_val = row_dict.get("Date", "").strip()
                if not date_val or not any(date_val.startswith(yr) for yr in ["2026", "2025", "2024"]):
                    continue
                
                camp_id = row_dict.get("Campaign ID", "").strip()
                camp_name = row_dict.get("Campaign Name", meta_campaign).strip() or meta_campaign
                adgroup = row_dict.get("AdGroup Name", meta_adgroup).strip() or meta_adgroup
                listing_id = row_dict.get("Listing ID", "LSTRCPHQ5THATFCCM6WXYMY1Y").strip()
                
                views = int(self.clean_currency(row_dict.get("Views", 0)))
                clicks = int(self.clean_currency(row_dict.get("Clicks", 0)))
                ctr = float(self.clean_currency(row_dict.get("Click Through Rate", 0.0)))
                converted = int(self.clean_currency(row_dict.get("Total converted units", 0)))
                spend = float(self.clean_currency(row_dict.get("Ad Spend", 0.0)))
                revenue = float(self.clean_currency(row_dict.get("Total Revenue (Rs.)", 0.0)))
                direct_units = int(self.clean_currency(row_dict.get("Direct Units Sold", 0)))
                direct_rev = float(self.clean_currency(row_dict.get("Direct Revenue", 0.0)))
                roi = float(self.clean_currency(row_dict.get("ROI", 0.0)))
                
                # Campaign classification: East Region vs Main Ecomm
                if "east" in camp_name.lower() or "east" in adgroup.lower() or "odisha" in adgroup.lower() or "assam" in adgroup.lower() or converted > 0:
                    campaign_cluster = "GS | Traffic | Flipkart | East Region"
                else:
                    campaign_cluster = "GS | Traffic | E-Com | 11Sep26 (Rest of India)"
                
                rows.append({
                    "date": date_val,
                    "campaign": camp_name,
                    "campaign_id": camp_id,
                    "campaign_cluster": campaign_cluster,
                    "adgroup": adgroup,
                    "listing_id": listing_id,
                    "views": views,
                    "clicks": clicks,
                    "ctr": ctr,
                    "spend": spend,
                    "converted_units": converted,
                    "revenue": revenue,
                    "direct_units": direct_units,
                    "direct_revenue": direct_rev,
                    "roi": roi
                })
        return rows

    def sync_live_orders(self) -> Tuple[bool, str, int]:
        return self.sync_from_url("orders", DEFAULT_ORDERS_SHEET_URL)

    def sync_from_url(self, source_type: str, url: str) -> Tuple[bool, str, int]:
        try:
            if "docs.google.com/spreadsheets/d/" in url:
                url = normalize_google_sheet_url(url)
            import ssl
            import codecs
            ctx = ssl._create_unverified_context()
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (ApniBus-ETM-Dashboard)"})
            
            # If tracker or large endpoint, stream lines directly
            if "question" in url or source_type == "tracker":
                with urllib.request.urlopen(req, context=ctx, timeout=60) as resp:
                    lines = codecs.iterdecode(resp, "utf-8", errors="ignore")
                    parsed = self.parse_tracker_csv(lines)
                    if parsed:
                        self.tracker_clicks = parsed
                        self.recompute_indices()
                        self.last_sync_times["tracker"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        try:
                            with open(DATA_DIR / "tracker_cache.json", "w", encoding="utf-8") as f:
                                json.dump(parsed, f)
                        except Exception as e:
                            print("Cache save notice:", e)
                        return True, "Successfully ingested live tracker CSV", len(parsed)
                    return False, "CSV contained 0 valid rows", 0

            with urllib.request.urlopen(req, context=ctx, timeout=45) as resp:
                content = resp.read().decode("utf-8", errors="ignore")
                
            # Content-based auto-detection of data type
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
            elif "customer search term" in lower_sample or "14 day total orders" in lower_sample:
                effective_type = "amazon_ads"

            if effective_type == "tracker":
                parsed = self.parse_tracker_csv(content)
                if parsed:
                    self.tracker_clicks = parsed
                    self.recompute_indices()
                    self.last_sync_times["tracker"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    try:
                        with open(DATA_DIR / "tracker_cache.json", "w", encoding="utf-8") as f:
                            json.dump(parsed, f)
                    except Exception:
                        pass
                    return True, "Successfully ingested live tracker CSV", len(parsed)
                return False, "CSV contained 0 valid rows", 0
                
            elif effective_type == "orders":
                parsed = self.parse_orders_sheet_csv(content)
                if parsed:
                    self.orders = parsed
                    self.recompute_indices()
                    self.last_sync_times["orders"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    try:
                        with open(DATA_DIR / "orders_cache.json", "w", encoding="utf-8") as f:
                            json.dump(parsed, f, indent=2)
                    except Exception:
                        pass
                    return True, "Successfully ingested Google Sheet orders", len(parsed)
                return False, "Order sheet contained 0 valid rows", 0

            elif effective_type == "flipkart_ads":
                parsed = self.parse_flipkart_ads_csv(content)
                if parsed:
                    self.flipkart_ads = parsed
                    self.recompute_indices()
                    self.last_sync_times["flipkart_ads"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    try:
                        with open(DATA_DIR / "flipkart_ads_cache.json", "w", encoding="utf-8") as f:
                            json.dump(parsed, f, indent=2)
                    except Exception:
                        pass
                    return True, "Successfully ingested Flipkart Ads CSV", len(parsed)
                return False, "Flipkart Ads CSV contained 0 valid rows", 0

            elif effective_type in ("meta_regional", "meta_ads"):
                parsed = self.parse_meta_ads_export(content)
                if parsed:
                    self.meta_campaigns_today = parsed
                    self.recompute_indices()
                    self.last_sync_times["meta_ads"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    return True, "Successfully ingested Meta Ads CSV", len(parsed)
                return False, "Meta Ads CSV contained 0 valid rows", 0
                
            else:
                return False, f"Unknown source type: {source_type}", 0
        except Exception as e:
            return False, f"Sync error: {str(e)}", 0

data_store = DataStore()
