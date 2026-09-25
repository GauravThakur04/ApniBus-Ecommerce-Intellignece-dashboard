import sys
import os

# Add parent directory to path so backend can be imported as a package
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from backend.app.main import app as fastapi_app

# ASGI wrapper to ensure both /api/path and /path match FastAPI routes seamlessly on Vercel
async def app(scope, receive, send):
    if scope.get("type") == "http":
        path = scope.get("path", "")
        if not path.startswith("/api") and not path.startswith("/docs") and not path.startswith("/openapi.json"):
            scope["path"] = f"/api{path}"
    await fastapi_app(scope, receive, send)
