from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from db import mongo
import bcrypt
from datetime import datetime, timezone

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password required"}), 400

    existing = mongo.db.users.find_one({"email": data["email"]})
    if existing:
        return jsonify({"error": "User already exists"}), 409

    hashed = bcrypt.hashpw(data["password"].encode(), bcrypt.gensalt())
    user = {
        "email": data["email"],
        "name": data.get("name", data["email"].split("@")[0]),
        "password": hashed,
        "role": "analyst",
        "created_at": datetime.now(timezone.utc),
        "scans_count": 0,
    }
    result = mongo.db.users.insert_one(user)

    mongo.db.audit_logs.insert_one({
        "event": "user_registered",
        "user_email": data["email"],
        "timestamp": datetime.now(timezone.utc),
    })

    token = create_access_token(identity=str(result.inserted_id))
    return jsonify({
        "token": token,
        "user": {"email": user["email"], "name": user["name"], "role": user["role"]},
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password required"}), 400

    user = mongo.db.users.find_one({"email": data["email"]})
    if not user or not bcrypt.checkpw(data["password"].encode(), user["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    mongo.db.audit_logs.insert_one({
        "event": "user_login",
        "user_email": data["email"],
        "timestamp": datetime.now(timezone.utc),
    })

    token = create_access_token(identity=str(user["_id"]))
    return jsonify({
        "token": token,
        "user": {"email": user["email"], "name": user["name"], "role": user["role"]},
    }), 200
