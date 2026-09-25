# ApniBus E-Commerce Command Center
> **"From Traffic to Orders — One Intelligent View of Your Business"**

Dedicated Intelligence & Analytics Platform for **ApniBus Smart Bus Ticketing POS / ETM Machine** (₹4,998).

---

## 🎯 Core Capabilities

1. **Executive Command Center**:
   - Tier 1 Commercial KPIs (Orders, Gross Revenue, Bank Settlement, Multi-Channel Ad Spend, Cost Per Order, Blended ROAS).
   - **"WHAT SHOULD I DO TODAY?"**: Top 3 prioritized, evidence-backed actions with confidence scores, impact projections, risk analysis, and direct drilldowns.
   - Dynamic AI Summary with live anomaly ticker.
2. **Multi-Channel Sales & Verified Settlement**:
   - Source of truth: Google Sheet Orders Master (Reconciled ₹29,921 Gross Revenue, ₹26,298 Net Settlement).
   - Platform deductions analysis (Flipkart ~18.2% avg fee vs Amazon).
   - Cancelled order isolation & audit compliance.
3. **Advertising Intelligence**:
   - **Flipkart High-Intent Ads**: Tracking `ApniBus_BusTicket_HighIntent_Sep26` (16-Sep converted order with 18.5x ROI).
   - **Amazon Ads**: Sponsored Products analysis, high CTR (18.25%) vs Add-to-Cart (3) and purchase lag analysis.
   - **Meta Traffic Matrix**: Regional analysis across 36 Indian states/UTs at ultra-low CPC (₹0.33–₹0.42).
4. **Marketplace Funnels**:
   - Separate step-by-step conversion funnels for Flipkart and Amazon with explicit *"DATA NOT AVAILABLE"* tags for unmeasured stages.
5. **Regional & Hourly Analytics**:
   - Strict separation of Customer State, Targeted State, and Tracker State.
   - 24-hour traffic & order cluster heatmap with 2–4 hour lag association analysis.
6. **AI Statistical Order Forecasting**:
   - Poisson Rate arrival model + post-13-Sep velocity weighting (+166.7% uplift).
   - 1-Day, 3-Day, and 7-Day prediction intervals with small-sample guardrails.
7. **Listing & Business Change Log**:
   - Statistical evaluation of 13-Sep-2026 Listing Image Update (Pre vs Transition vs Post periods).
   - Manual change logging interface.
8. **Data Quality & Ingestion Hub**:
   - Live CSV URL sync for Metabase tracker (10,700+ clicks) and Google Sheet orders.
   - Direct CSV upload drag-and-drop for Amazon, Flipkart, and Meta reports.

---

## 🚀 Quick Start

### 1. Launch the Application
```bash
./start.sh
```
Open **http://localhost:8000** in your browser.

### 2. Run Automated Verification Tests
```bash
PYTHONPATH=. backend/venv/bin/python3 test_backend.py
```
