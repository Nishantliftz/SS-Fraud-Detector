"""
Template Service — STUB (Second Half)
==========================================
This is a placeholder for the payment platform template comparison module.

SECOND HALF TODO:
─────────────────
1. Build Reference Template Database
   - Collect authentic screenshots from:
     * Google Pay (dark/light theme, success/failure states)
     * PhonePe (various screen states)
     * Paytm (payment success, wallet, bank transfer)
     * BHIM UPI (success confirmation)
     * Bank apps (SBI, HDFC, ICICI, Axis, etc.)
   - Store as grayscale normalized templates in /templates/ directory

2. Template Matching Pipeline
   a. Detect which payment platform the image belongs to
      - Use ORB feature detector to match against platform logos
      - Or train a lightweight CNN classifier (MobileNetV2)
   b. Align the uploaded image to the matched template
      - Homography estimation using matched keypoints
   c. Compute structural similarity (SSIM) on aligned pair
      - skimage.metrics.structural_similarity()
   d. Detect UI element deviations
      - Compare bounding boxes of key UI elements (amount box, header, etc.)

3. ML Forgery Detector (PyTorch/TensorFlow)
   - Train binary classifier: genuine vs. fake payment screenshots
   - Architecture: EfficientNet-B0 fine-tuned on custom dataset
   - Features: frequency domain + spatial features
   - Return: probability of being fake

INTEGRATION:
    The `match_template()` function should return:
    {
        "score": int (0-100, higher = more similar to authentic template),
        "detected_platform": str,  # "gpay" | "phonepe" | "paytm" | "bhim" | "unknown"
        "ssim_score": float,
        "ui_deviations": [{"element": str, "deviation": float}],
        "ml_fake_probability": float,
        "issues": [str],
    }
"""

from typing import Dict, Any


def match_template(filepath: str) -> Dict[str, Any]:
    """
    STUB — returns placeholder data.
    Replace with full implementation in Second Half.
    """
    return {
        "status": "not_implemented",
        "score": None,
        "message": (
            "Template comparison engine (GPay, PhonePe, Paytm, BHIM) and ML forgery "
            "detector will be implemented in Second Half."
        ),
        "detected_platform": None,
        "ssim_score": None,
        "ui_deviations": [],
        "ml_fake_probability": None,
        "issues": [],
    }
