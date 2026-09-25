import sys
import os

root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from backend.app.main import app as fastapi_app

# ASGI wrapper to ensure that when Vercel strips /api, the path is normalized to /api/endpoint
async def app(scope, receive, send):
    if scope.get("type") == "http":
        path = scope.get("path", "")
        if not path.startswith("/api") and not path.startswith("/docs") and not path.startswith("/openapi.json"):
            scope["path"] = f"/api{path}"
    await fastapi_app(scope, receive, send)
