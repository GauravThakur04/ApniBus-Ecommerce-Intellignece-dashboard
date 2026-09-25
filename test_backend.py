import sys
import unittest
from fastapi.testclient import TestClient
from backend.app.main import app

class TestApniBusCommandCenter(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_health(self):
        resp = self.client.get("/api/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "healthy")
        print("✓ Health Check Passed")

    def test_overview(self):
        resp = self.client.get("/api/overview")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("tier1_kpis", data)
        self.assertIn("tier2_kpis", data)
        self.assertIn("executive_summary", data)
        self.assertGreaterEqual(data["tier1_kpis"]["total_orders"]["value"], 6)
        print(f"✓ Overview API Passed (Total Orders: {data['tier1_kpis']['total_orders']['value']}, Gross Revenue: ₹{data['tier1_kpis']['gross_revenue']['value']})")

    def test_sales(self):
        resp = self.client.get("/api/sales")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("trend", data)
        self.assertIn("marketplace_comparison", data)
        self.assertIn("orders_table", data)
        self.assertGreaterEqual(len(data["orders_table"]), 7)
        print(f"✓ Sales API Passed (Verified Orders count: {len(data['orders_table'])})")

    def test_marketing(self):
        resp = self.client.get("/api/marketing")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("channels_table", data)
        self.assertGreaterEqual(len(data["channels_table"]), 3)
        print(f"✓ Marketing Matrix API Passed ({len(data['channels_table'])} campaign channels)")

    def test_flipkart(self):
        resp = self.client.get("/api/flipkart")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(data := resp.json(), data)
        self.assertEqual(data["target_campaign"], "ApniBus_BusTicket_HighIntent_Sep26")
        self.assertGreaterEqual(len(data["search_terms"]), 3)
        print("✓ Flipkart High-Intent Ads API Passed")

    def test_amazon(self):
        resp = self.client.get("/api/amazon")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("campaigns", data)
        self.assertIn("search_terms", data)
        print("✓ Amazon Ads API Passed")

    def test_forecast(self):
        resp = self.client.get("/api/forecast")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("forecast_1d", data)
        self.assertIn("forecast_3d", data)
        self.assertIn("forecast_7d", data)
        self.assertIn("timeline", data)
        fc7 = data["forecast_7d"]
        self.assertGreaterEqual(fc7["expected_orders_max"], fc7["expected_orders_min"])
        print(f"✓ 7-Day Order Forecast Passed (Range: {fc7['expected_orders_min']}–{fc7['expected_orders_max']} orders, Confidence: {fc7['confidence']})")

    def test_advisor(self):
        resp = self.client.get("/api/advisor")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("todays_top_actions", data)
        self.assertLessEqual(len(data["todays_top_actions"]), 3)
        print(f"✓ AI Advisor Passed ({len(data['todays_top_actions'])} Top Directives generated)")

    def test_data_quality(self):
        resp = self.client.get("/api/data-quality")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertGreaterEqual(data["overall_health_score"], 95)
        self.assertEqual(len(data["sources"]), 5)
        print(f"✓ Data Quality Audit Passed (Health Score: {data['overall_health_score']}%)")

    def test_changes(self):
        resp = self.client.get("/api/changes")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("statistical_comparison", data)
        uplift = data["statistical_comparison"]["post_change"]["velocity_uplift"]
        self.assertEqual(uplift, "+166.7%")
        print(f"✓ Listing Change Analysis Passed (13-Sep image update uplift: {uplift})")

if __name__ == "__main__":
    unittest.main()
