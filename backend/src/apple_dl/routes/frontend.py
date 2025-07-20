"""The glue between the compiled vite frontend and our backend."""

from quart import Blueprint, send_from_directory, render_template

from ..config import config

frontend_bp = Blueprint("frontend", __name__, static_url_path="",
                  static_folder=str(config.FRONTEND_DIST_DIR),
                  template_folder=str(config.FRONTEND_DIST_DIR))

@frontend_bp.route("/")
async def index():
    return await render_template("index.html")


# Register frontend folder
# basically a reverse proxy for the frontend
# @frontend_bp.route("/", defaults={"path": "index.html"})
# @frontend_bp.route("/<path:path>")
# async def reverse_proxy(path):
#     """Link to vite resources."""
#     # not include assets
#     if not "assets" in path and not path.startswith("favicon.ico"):
#         path = "index.html"
# 
#     # Remove everything infront of assets
#     if "assets" in path:
#         path = path[path.index("assets") :]
# 
#     r = await send_from_directory(config.FRONTEND_DIST_DIR, path)
#     return r
