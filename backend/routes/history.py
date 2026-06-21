from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import mongo
from bson import ObjectId

history_bp = Blueprint("history", __name__)


def serialize(doc):
    doc["_id"] = str(doc["_id"])
    return doc


@history_bp.route("/", methods=["GET"])
@jwt_required()
def get_history():
    user_id = get_jwt_identity()
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))
    skip = (page - 1) * limit

    scans = list(
        mongo.db.scans.find({"user_id": user_id}, {"filepath": 0})
        .sort("timestamp", -1)
        .skip(skip)
        .limit(limit)
    )
    total = mongo.db.scans.count_documents({"user_id": user_id})

    return jsonify({
        "scans": [serialize(s) for s in scans],
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
    })


@history_bp.route("/<scan_id>", methods=["GET"])
@jwt_required()
def get_scan(scan_id):
    user_id = get_jwt_identity()
    scan = mongo.db.scans.find_one({"scan_id": scan_id, "user_id": user_id}, {"filepath": 0})
    if not scan:
        return jsonify({"error": "Scan not found"}), 404
    return jsonify(serialize(scan))


@history_bp.route("/stats", methods=["GET"])
@jwt_required()
def get_stats():
    user_id = get_jwt_identity()
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {
            "_id": "$score.risk_level",
            "count": {"$sum": 1},
            "avg_score": {"$avg": "$score.authenticity_score"},
        }},
    ]
    risk_breakdown = list(mongo.db.scans.aggregate(pipeline))

    total = mongo.db.scans.count_documents({"user_id": user_id})
    return jsonify({
        "total_scans": total,
        "risk_breakdown": risk_breakdown,
    })
