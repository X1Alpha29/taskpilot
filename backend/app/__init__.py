from flask import Flask
from .config import Config 
from .extensions import db, migrate, jwt, bcrypt
from flask_cors import CORS 
from .models import User
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # ✅ ADD HERE
    UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")

    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

    CORS(
        app,
        resources={r"/*": {"origins": "http://localhost:5173"}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"]
    )

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)

    from .routes import main
    app.register_blueprint(main)

    return app