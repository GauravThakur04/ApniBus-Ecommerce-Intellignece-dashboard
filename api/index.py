import sys
import os
from urllib.parse import parse_qs, urlencode

root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from backend.app.main import app as fastapi_app

async def app(scope, receive, send):
    if scope.get("type") == "http":
        query_bytes = scope.get("query_string", b"")
        query_str = query_bytes.decode("utf-8") if isinstance(query_bytes, bytes) else (query_bytes or "")
        
        parsed_query = parse_qs(query_str, keep_blank_values=True)
        
        # If Vercel passed __route__ query param from rewrite
        if "__route__" in parsed_query:
            subpath = parsed_query.pop("__route__")[0].lstrip("/")
            scope["path"] = f"/api/{subpath}" if subpath else "/api"
            # Reconstruct clean query string without __route__
            new_query = urlencode([(k, v) for k, vs in parsed_query.items() for v in vs])
            scope["query_string"] = new_query.encode("utf-8")
        else:
            path = scope.get("path", "")
            if not path.startswith("/api") and not path.startswith("/docs") and not path.startswith("/openapi.json"):
                scope["path"] = f"/api{path}"
                
    await fastapi_app(scope, receive, send)
