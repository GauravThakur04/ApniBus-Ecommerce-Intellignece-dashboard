import os
import json
import base64
import urllib.request
import urllib.error
import ssl
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
from ..config import FLIPKART_APP_ID, FLIPKART_APP_SECRET, DATA_DIR

class FlipkartApiClient:
    def __init__(self, app_id: Optional[str] = None, app_secret: Optional[str] = None):
        self.app_id = (app_id or FLIPKART_APP_ID or os.getenv("FLIPKART_APP_ID", "")).strip()
        self.app_secret = (app_secret or FLIPKART_APP_SECRET or os.getenv("FLIPKART_APP_SECRET", "")).strip()
        self.base_url = "https://api.flipkart.net"
        self.token: Optional[str] = None
        self.token_expiry: Optional[datetime] = None
        self.last_sync_time: Optional[str] = None
        self.last_sync_status: str = "Awaiting Credentials" if not (self.app_id and self.app_secret) else "Configured & Ready"
        self.cached_api_orders: List[Dict[str, Any]] = []

    def is_configured(self) -> bool:
        return bool(self.app_id and self.app_secret)

    def set_credentials(self, app_id: str, app_secret: str):
        self.app_id = app_id.strip()
        self.app_secret = app_secret.strip()
        self.token = None
        self.token_expiry = None
        self.last_sync_status = "Credentials Updated — Ready to Connect"

    def get_status(self) -> Dict[str, Any]:
        has_token = bool(self.token and self.token_expiry and datetime.now() < self.token_expiry)
        return {
            "app_id": (self.app_id[:8] + "..." + self.app_id[-4:]) if len(self.app_id) > 12 else (self.app_id if self.app_id else None),
            "has_app_id": bool(self.app_id),
            "has_secret": bool(self.app_secret),
            "is_ready": self.is_configured(),
            "has_active_token": has_token,
            "token_status": "AUTHENTICATED & ACTIVE ✓" if has_token else "READY TO AUTHENTICATE",
            "last_sync": self.last_sync_time,
            "status_message": "Connected to Flipkart Seller Hub API (Seller_Api Scope Active)" if has_token else ("Credentials Approved & Ready" if self.is_configured() else "Enter App Secret to activate live streaming."),
            "active_skus": ["ETM-AB007", "APNIBUS-TM-001"],
            "cached_orders_count": len(self.cached_api_orders)
        }

    def authenticate(self) -> Tuple[bool, str]:
        if not self.is_configured():
            return False, "Flipkart App ID or App Secret is missing. Please provide both."

        # Check existing valid token
        if self.token and self.token_expiry and datetime.now() < self.token_expiry:
            return True, "Token valid"

        auth_str = f"{self.app_id}:{self.app_secret}"
        b64_auth = base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")
        
        token_url = f"{self.base_url}/oauth-service/oauth/token?grant_type=client_credentials"
        req = urllib.request.Request(
            token_url,
            headers={
                "Authorization": f"Basic {b64_auth}",
                "User-Agent": "ApniBus-ETM-Dashboard"
            }
        )
        
        try:
            ctx = ssl._create_unverified_context()
            with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                self.token = data.get("access_token")
                expires_in = int(data.get("expires_in", 3600))
                self.token_expiry = datetime.now() + timedelta(seconds=expires_in - 120)
                self.last_sync_status = "Connected to Flipkart Seller Hub API (Approved)"
                return True, "Successfully authenticated with Flipkart Seller API"
        except urllib.error.HTTPError as e:
            raw_body = e.read().decode('utf-8', errors='ignore')
            try:
                err_json = json.loads(raw_body)
                err_desc = err_json.get("error_description") or err_json.get("error_msg") or err_json.get("error") or raw_body
            except:
                err_desc = raw_body
            
            if "not in Approved state" in err_desc:
                friendly_msg = "Flipkart Application created! Waiting for Flipkart Approval in Seller Hub."
            else:
                friendly_msg = f"Flipkart Auth Failed: {err_desc}"
                
            self.last_sync_status = friendly_msg
            return False, friendly_msg
        except Exception as e:
            err_msg = f"Flipkart Auth Error: {str(e)}"
            self.last_sync_status = err_msg
            return False, err_msg

    def fetch_orders_search(self, filter_payload: Optional[Dict[str, Any]] = None) -> Tuple[bool, Any]:
        auth_ok, msg = self.authenticate()
        if not auth_ok:
            return False, msg

        search_url = f"{self.base_url}/sellers/v2/orders/search"
        ctx = ssl._create_unverified_context()
        seen_ids: set = set()
        all_order_items: List[Dict[str, Any]] = []

        def _post(payload: dict) -> List[Dict[str, Any]]:
            body = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                search_url,
                data=body,
                headers={
                    "Authorization": f"Bearer {self.token}",
                    "Content-Type": "application/json",
                    "User-Agent": "ApniBus-ETM-Dashboard"
                },
                method="POST"
            )
            try:
                with urllib.request.urlopen(req, context=ctx, timeout=20) as resp:
                    return json.loads(resp.read().decode("utf-8")).get("orderItems", [])
            except Exception:
                return []

        if filter_payload:
            # Caller-supplied custom payload — just use it directly
            items = _post(filter_payload)
            self.last_sync_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            self.cached_api_orders = items
            return True, {"orderItems": items, "total": len(items)}

        # Pass 1: empty filter returns all orders in Flipkart's default window
        pass1 = _post({"filter": {}})
        for o in pass1:
            key = o.get("orderItemId") or o.get("orderId")
            if key and key not in seen_ids:
                seen_ids.add(key)
                all_order_items.append(o)

        # Pass 2: query each active state individually so nothing is missed
        # (RETURN_REQUESTED causes 400 on Flipkart v2 — excluded)
        active_states = [
            "APPROVED",
            "READY_TO_DISPATCH",
            "PACKED",
            "PICKUP_COMPLETE",
            "SHIPPED",
            "DELIVERED",
            "CANCELLED",
        ]
        for state in active_states:
            for o in _post({"filter": {"states": [state]}}):
                key = o.get("orderItemId") or o.get("orderId")
                if key and key not in seen_ids:
                    seen_ids.add(key)
                    all_order_items.append(o)

        # Sort newest first
        all_order_items.sort(key=lambda x: x.get("orderDate", ""), reverse=True)

        self.last_sync_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.cached_api_orders = all_order_items
        return True, {"orderItems": all_order_items, "total": len(all_order_items)}

    def fetch_listing_details(self, sku: str = "ETM-AB007") -> Tuple[bool, Any]:
        auth_ok, msg = self.authenticate()
        if not auth_ok:
            return False, msg

        url = f"{self.base_url}/sellers/listings/v3/{sku}"
        req = urllib.request.Request(
            url,
            headers={
                "Authorization": f"Bearer {self.token}",
                "User-Agent": "ApniBus-ETM-Dashboard"
            }
        )

        try:
            ctx = ssl._create_unverified_context()
            with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return True, data
        except Exception as e:
            return False, str(e)

flipkart_client = FlipkartApiClient()

