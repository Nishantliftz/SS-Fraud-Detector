import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from db import mongo
from services.ocr_service import run_ocr
from services.metadata_service import analyze_metadata
from services.scoring_service import compute_score
from services.forensics_service import run_forensics  # stub – second half
from services.template_service import match_template   # stub – second half
from datetime import datetime, timezone
from bson import ObjectId

scan_bp = Blueprint("scan", __name__)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "bmp", "gif"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def serialize_doc(doc):
    doc["_id"] = str(doc["_id"])
    return doc


@scan_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_and_scan():
    user_id = get_jwt_identity()

    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files["image"]
    if file.filename == "" or not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400

    # Save uploaded file
    scan_id = str(uuid.uuid4())
    ext = file.filename.rsplit(".", 1)[1].lower()
    filename = secure_filename(f"{scan_id}.{ext}")
    upload_folder = current_app.config["UPLOAD_FOLDER"]
    filepath = os.path.join(upload_folder, filename)
    file.save(filepath)

    try:
        # Run analysis pipeline
        ocr_result = run_ocr(filepath)
        metadata_result = analyze_metadata(filepath)
        forensics_result = run_forensics(filepath)   # stub returns placeholder
        template_result = match_template(filepath)   # stub returns placeholder

        # Compute final score
        score_result = compute_score(ocr_result, metadata_result, forensics_result, template_result)

        scan_doc = {
            "scan_id": scan_id,
            "user_id": user_id,
            "filename": file.filename,
            "filepath": filepath,
            "timestamp": datetime.now(timezone.utc),
            "ocr": ocr_result,
            "metadata_analysis": metadata_result,
            "forensics": forensics_result,
            "template_match": template_result,
            "score": score_result,
        }

        mongo.db.scans.insert_one(scan_doc)
        mongo.db.users.update_one({"_id": ObjectId(user_id)}, {"$inc": {"scans_count": 1}})
        mongo.db.audit_logs.insert_one({
            "event": "scan_completed",
            "scan_id": scan_id,
            "user_id": user_id,
            "risk": score_result["risk_level"],
            "timestamp": datetime.now(timezone.utc),
        })

        return jsonify(serialize_doc(scan_doc)), 200

    except Exception as e:
        # Clean up file on error
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({"error": str(e)}), 500


@scan_bp.route("/demo", methods=["POST"])
def demo_scan():
    """Demo endpoint – no auth required, uses a sample result."""
    return jsonify({
        "scan_id": "demo-001",
        "filename": "demo_payment.jpg",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "score": {
            "authenticity_score": 42,
            "risk_level": "Suspicious",
            "confidence": 0.78,
            "issues": [
                "OCR detected inconsistent amount formatting",
                "Timestamp metadata missing from image",
                "Font rendering anomaly detected near transaction ID",
            ],
            "ocr_score": 55,
            "metadata_score": 30,
            "forensics_score": None,
            "template_score": None,
        },
        "ocr": {
            "text": "UPI Payment\nAmount: ₹5,000.00\nTo: merchant@upi\nRef: 123456789012\nDate: 21/06/2026",
            "suspicious_fields": ["amount_formatting"],
        },
        "metadata_analysis": {
            "has_exif": False,
            "software": None,
            "suspicious": True,
            "issues": ["No EXIF data found – possible metadata stripping"],
        },
        "forensics": {"status": "pending", "message": "Advanced forensics – Second Half"},
        "template_match": {"status": "pending", "message": "Template comparison – Second Half"},
    })
