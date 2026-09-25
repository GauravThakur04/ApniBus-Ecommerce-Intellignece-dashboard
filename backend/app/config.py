import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data_storage"
DATA_DIR.mkdir(parents=True, exist_ok=True)

# Default URLs
DEFAULT_TRACKER_CSV_URL = "https://data.apnibus.com/public/question/8659b871-d41c-41fc-b9b3-8df5a49194cf.csv"
DEFAULT_ORDERS_SHEET_URL = "https://docs.google.com/spreadsheets/d/13mPfzdsTS9sFCVWqslItE9Fb_fNMk5nY_50WsKT4_0U/export?format=csv"

PRODUCT_PRICE = 4998.0
PRODUCT_NAME = "ApniBus Smart Bus Ticketing POS / ETM Machine"

# Flipkart Developer Self-Access API Credentials
FLIPKART_APP_ID = os.getenv("FLIPKART_APP_ID", "3655564499145039ab4025262b903691a599")
FLIPKART_APP_SECRET = os.getenv("FLIPKART_APP_SECRET", "2495096124af715bb7546fcd3ff4ee1f0")
