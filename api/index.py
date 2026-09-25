import sys
import os

root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from backend.app.main import app as fastapi_app

# ASGI wrapper to reliably reconstruct original request path on Vercel serverless runtime
async def app(scope, receive, send):
    if scope.get("type") == "http":
        headers = dict(scope.get("headers", []))
        # Vercel supplies the original requested path in x-matched-path or x-forwarded-uri
        matched_path = headers.get(b"x-matched-path", b"").decode("utf-8")
        forwarded_uri = headers.get(b"x-forwarded-uri", b"").decode("utf-8")
        
        target_path = matched_path or forwarded_uri or scope.get("path", "")
        if "?" in target_path:
            target_path = target_path.split("?")[0]
            
        if target_path and target_path != "/api/index.py" and target_path != "/api/index":
            scope["path"] = target_path
            
        if not scope["path"].startswith("/api") and not scope["path"].startswith("/docs") and not scope["path"].startswith("/openapi.json"):
            scope["path"] = f"/api{scope['path']}"
            
    await fastapi_app(scope, receive, send)
