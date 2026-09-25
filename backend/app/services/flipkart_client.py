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
        self.app_id = app_id or FLIPKART_APP_ID or os.getenv("FLIPKART_APP_ID", "")
        self.app_secret = app_secret or FLIPKART_APP_SECRET or os.getenv("FLIPKART_APP_SECRET", "")
        self.base_url = "https://api.flipkart.net"
        self.token: Optional[str] = None
        self.token_expiry: Optional[datetime] = None
        self.last_sync_time: Optional[str] = None
        self.last_sync_status: str = "Awaiting Secret Key" if not self.app_secret else "Ready to Connect"

    def is_configured(self) -> bool:
        return bool(self.app_id and self.app_secret)

    def set_credentials(self, app_id: str, app_secret: str):
        self.app_id = app_id.strip()
        self.app_secret = app_secret.strip()
        self.token = None
        self.token_expiry = None
        self.last_sync_status = "Credentials Updated — Ready to Connect"

    def get_status(self) -> Dict[str, Any]:
        return {
            "app_id": self.app_id[:8] + "..." if self.app_id else None,
            "has_app_id": bool(self.app_id),
            "has_secret": bool(self.app_secret),
            "is_ready": self.is_configured(),
            "has_active_token": bool(self.token and self.token_expiry and datetime.now() < self.token_expiry),
            "last_sync": self.last_sync_time,
            "status_message": "Ready to stream live orders & settlements" if self.is_configured() else "App ID registered. Enter App Secret to activate live streaming."
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
                self.last_sync_status = "Connected to Flipkart Seller Hub API"
                return True, "Successfully authenticated with Flipkart Seller API"
        except urllib.error.HTTPError as e:
            raw_body = e.read().decode('utf-8', errors='ignore')
            try:
                err_json = json.loads(raw_body)
                err_desc = err_json.get("error_description") or err_json.get("error_msg") or err_json.get("error") or raw_body
            except:
                err_desc = raw_body
            
            if "not in Approved state" in err_desc:
                friendly_msg = "Flipkart Application created! Waiting for Flipkart Approval in Seller Hub (Status currently Pending)."
            else:
                friendly_msg = f"Flipkart Auth Failed: {err_desc}"
                
            self.last_sync_status = friendly_msg
            return False, friendly_msg
        except Exception as e:
            err_msg = f"Flipkart Auth Error: {str(e)}"
            self.last_sync_status = err_msg
            return False, err_msg

    def fetch_orders_search(self, from_date: Optional[str] = None, to_date: Optional[str] = None) -> Tuple[bool, Any]:
        auth_ok, msg = self.authenticate()
        if not auth_ok:
            return False, msg

        search_url = f"{self.base_url}/sellers/v3/orders/search"
        now = datetime.now()
        from_dt = from_date or (now - timedelta(days=30)).strftime("%Y-%m-%d")
        to_dt = to_date or now.strftime("%Y-%m-%d")

        body = json.dumps({
            "filter": {
                "orderDate": {
                    "fromDate": f"{from_dt}T00:00:00Z",
                    "toDate": f"{to_dt}T23:59:59Z"
                }
            }
        }).encode("utf-8")

        req = urllib.request.Request(
            search_url,
            data=body,
            headers={
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json",
                "User-Agent": "ApniBus-ETM-Dashboard"
            }
        )

        try:
            ctx = ssl._create_unverified_context()
            with urllib.request.urlopen(req, context=ctx, timeout=20) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                self.last_sync_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                return True, data
        except Exception as e:
            return False, str(e)

    def fetch_listing_details(self, sku: str = "ETM-AB007") -> Tuple[bool, Any]:
        auth_ok, msg = self.authenticate()
        if not auth_ok:
            return False, msg

        url = f"{self.base_url}/sellers/v3/listings/v3/{sku}"
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
