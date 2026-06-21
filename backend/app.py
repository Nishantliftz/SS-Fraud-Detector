import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from db import mongo
from routes.auth import auth_bp
from routes.scan import scan_bp
from routes.history import history_bp

load_dotenv()

def create_app():
    app = Flask(__name__)

    # Config
    app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://localhost:27017/screenshield")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-secret-key")
    app.config["UPLOAD_FOLDER"] = os.getenv("UPLOAD_FOLDER", "uploads")
    app.config["MAX_CONTENT_LENGTH"] = int(os.getenv("MAX_CONTENT_LENGTH", 16 * 1024 * 1024))

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # Extensions
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    JWTManager(app)
    mongo.init_app(app)

    # Blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(scan_bp, url_prefix="/api/scan")
    app.register_blueprint(history_bp, url_prefix="/api/history")

    @app.route("/api/health")
    def health():
        return {"status": "ok", "service": "ScreenShield AI Backend"}

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
