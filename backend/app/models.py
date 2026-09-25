from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class Order(BaseModel):
    order_id: str
    order_ref_id: Optional[str] = None
    platform: str
    order_date: str
    order_time: Optional[str] = None
    status: str
    product: str
    sku: Optional[str] = None
    customer_name: Optional[str] = None
    ship_to: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    qty: int = 1
    unit_price: float = 4998.0
    order_total: float = 4998.0
    is_cancelled: bool = False
    net_revenue: float = 0.0
    customer_logistics_fee: Optional[float] = 0.0
    avg_fees_taxes: Optional[float] = 0.0
    bank_settlement: Optional[float] = 0.0
    total_deductions: Optional[float] = 0.0
    settlement_basis: Optional[str] = None
    attribution_level: str = "LEVEL 1 — VERIFIED"

class TrackerClick(BaseModel):
    id: int
    visitor_id: str
    marketplace: str
    timestamp: str
    date: str
    hour: int
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    utm_content: Optional[str] = None
    adset_name: Optional[str] = None
    ad_name: Optional[str] = None
    device: Optional[str] = None
    ip: Optional[str] = None
    referrer: Optional[str] = None
    target_url: Optional[str] = None
    first_visit: bool = True

class AdSpendRecord(BaseModel):
    channel: str # 'Meta', 'Amazon', 'Flipkart'
    date: str
    campaign_name: str
    adset_name: Optional[str] = None
    ad_name: Optional[str] = None
    region: Optional[str] = None
    impressions: int = 0
    reach: int = 0
    clicks: int = 0
    spend: float = 0.0
    leads: int = 0
    atc: int = 0
    orders: int = 0
    revenue: float = 0.0
    cpc: float = 0.0
    cpm: float = 0.0
    ctr: float = 0.0
    roas: float = 0.0

class SearchTermRecord(BaseModel):
    marketplace: str # 'Amazon', 'Flipkart'
    campaign_name: str
    keyword: str
    search_term: Optional[str] = None
    views_impressions: int = 0
    clicks: int = 0
    ctr: float = 0.0
    cpc: float = 0.0
    spend: float = 0.0
    converted_units: int = 0
    revenue: float = 0.0
    roi_roas: float = 0.0
    intent_classification: str = "High Intent"
    recommendation: str = "Maintain"

class ListingChange(BaseModel):
    date: str
    marketplace: str
    change_type: str
    description: str
    before_state: str
    after_state: str
    impact_observation: Optional[str] = None

class ActionRecommendation(BaseModel):
    id: str
    priority: int
    title: str
    action: str
    category: str # 'PRICE', 'LISTING', 'META', 'AMAZON', 'FLIPKART', 'REGIONAL'
    why: str
    evidence: str
    expected_impact: str
    confidence: str # 'HIGH', 'MEDIUM', 'LOW'
    risk: str
    test_window: str
    missing_data: Optional[str] = None
    drilldown_path: str
    metric_tags: List[str] = []

class ForecastRange(BaseModel):
    period: str # 'Next 1 Day', 'Next 3 Days', 'Next 7 Days'
    expected_orders_min: int
    expected_orders_max: int
    point_estimate: float
    expected_revenue_min: float
    expected_revenue_max: float
    confidence: str # 'Low', 'Medium', 'High'
    model_used: str
    data_points_count: int
    rationale: str
    caveats: List[str]

class DataQualityItem(BaseModel):
    source_name: str
    status: str # 'HEALTHY', 'WARNING', 'RED', 'MANUAL'
    last_synced: str
    total_records: int
    missing_fields_count: int
    duplicate_records_count: int
    notes: str
