import os

from quart import Quart
from quart_cors import cors

from .routes.websocket import register_socketio
from .routes import api_bp, frontend_bp
from .logging import load_logging


def create_app() -> Quart:
    app = Quart(__name__)
    load_logging()
    app.config["FRONTEND_DIST_DIR"] = "../frontend/dist"
    app.config["GAMDL_DIR"] = os.environ.get("GAMDL_DIR", ".")
    app.config["DEBUG"] = False
    app = cors(app)

    app.register_blueprint(frontend_bp)
    app.register_blueprint(api_bp, url_prefix="/api")

    register_socketio(app)
    return app


def run() -> None:
    app = create_app()
    app.run(debug=True)
