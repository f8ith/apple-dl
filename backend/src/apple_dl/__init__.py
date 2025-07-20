from quart import Quart, render_template
from quart_cors import cors

from .config import config
from .routes.websocket import register_socketio
from .routes import api_bp, frontend_bp
from .logging import load_logging


def create_app() -> Quart:
    app = Quart(__name__, static_url_path="",
                  static_folder=str(config.FRONTEND_DIST_DIR),
                  template_folder=str(config.FRONTEND_DIST_DIR))
    load_logging()
    app.config.from_object(config)
    app = cors(app)

    app.register_blueprint(frontend_bp)
    app.register_blueprint(api_bp, url_prefix="/api")

    register_socketio(app)
    return app


def run() -> None:
    app = create_app()
    app.run(debug=True)
