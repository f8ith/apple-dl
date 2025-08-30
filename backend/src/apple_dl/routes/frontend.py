"""The glue between the compiled vite frontend and our backend."""

from quart import Blueprint, send_from_directory

from ..config import cfg

frontend_bp = Blueprint("frontend", __name__, static_url_path="")


# Register frontend folder
@frontend_bp.route("/", defaults={"path": "index.html"})
@frontend_bp.route("/<path:path>")
async def reverse_proxy(path):
    """Link to vite resources."""
    # not include assets
    if not "assets" in path and not path.startswith("favicon.ico"):
        path = "index.html"

    # Remove everything infront of assets
    if "assets" in path:
        path = path[path.index("assets") :]

    r = await send_from_directory(cfg.FRONTEND_DIST_DIR, path)
    return r
