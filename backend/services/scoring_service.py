"""
Scoring Service — First Half
Combines results from OCR and metadata analysis into a single
Authenticity Score (0–100) and risk classification.

Weights (First Half — rule-based):
  OCR analysis:       40%
  Metadata analysis:  40%
  Forensics:          10%  (stub — Second Half)
  Template match:     10%  (stub — Second Half)

Second Half: Replace with a weighted ML ensemble (neural network fusion).
"""

from typing import Dict, Any


WEIGHT_OCR = 0.40
WEIGHT_METADATA = 0.40
WEIGHT_FORENSICS = 0.10
WEIGHT_TEMPLATE = 0.10


def compute_score(
    ocr: Dict[str, Any],
    metadata: Dict[str, Any],
    forensics: Dict[str, Any],
    template: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Compute the overall Authenticity Score and risk classification.
    Returns a dict with: authenticity_score, risk_level, confidence, breakdown, issues.
    """
    all_issues = []

    # ── Individual scores ─────────────────────────────────────────────────────
    ocr_score = float(ocr.get("ocr_score", 75))
    metadata_score = float(metadata.get("metadata_score", 75))

    # Stubs — these will be real in Second Half
    forensics_score = forensics.get("score")  # None until implemented
    template_score = template.get("score")    # None until implemented

    # Collect issues from each service
    all_issues.extend(ocr.get("issues", []))
    all_issues.extend(metadata.get("issues", []))

    # ── Weighted score (only using available components) ─────────────────────
    if forensics_score is not None and template_score is not None:
        # Full pipeline (Second Half)
        weighted = (
            ocr_score * WEIGHT_OCR +
            metadata_score * WEIGHT_METADATA +
            forensics_score * WEIGHT_FORENSICS +
            template_score * WEIGHT_TEMPLATE
        )
        confidence = 0.95
        active_components = 4
    else:
        # First Half — redistribute weights proportionally
        total_weight = WEIGHT_OCR + WEIGHT_METADATA
        weighted = (ocr_score * WEIGHT_OCR + metadata_score * WEIGHT_METADATA) / total_weight
        confidence = 0.65  # lower confidence without forensics + template
        active_components = 2

    authenticity_score = round(max(0, min(100, weighted)), 1)

    # ── Risk classification ───────────────────────────────────────────────────
    if authenticity_score >= 70:
        risk_level = "Genuine"
        risk_color = "#22c55e"
    elif authenticity_score >= 40:
        risk_level = "Suspicious"
        risk_color = "#f59e0b"
    else:
        risk_level = "Fraudulent"
        risk_color = "#ef4444"

    # ── Severity boost for critical flags ────────────────────────────────────
    critical_flags = set(ocr.get("suspicious_fields", []) + metadata.get("suspicious_flags", []))
    high_severity = {"editing_software", "future_timestamp", "invalid_upi_id"}
    if high_severity & critical_flags:
        # Critical finding — push score down further
        authenticity_score = max(0, authenticity_score - 15)
        if authenticity_score < 40:
            risk_level = "Fraudulent"
        all_issues.insert(0, "⚠ High-severity indicators detected — manual review strongly recommended")

    return {
        "authenticity_score": authenticity_score,
        "risk_level": risk_level,
        "risk_color": risk_color,
        "confidence": confidence,
        "active_components": active_components,
        "breakdown": {
            "ocr_score": round(ocr_score, 1),
            "metadata_score": round(metadata_score, 1),
            "forensics_score": forensics_score,  # None = not yet implemented
            "template_score": template_score,      # None = not yet implemented
        },
        "suspicious_flags": list(critical_flags),
        "issues": all_issues,
        "recommendation": _get_recommendation(risk_level, critical_flags),
    }


def _get_recommendation(risk_level: str, flags: set) -> str:
    if risk_level == "Genuine":
        return "Image appears authentic. No significant manipulation detected."
    elif risk_level == "Suspicious":
        return (
            "Image shows suspicious characteristics. Verify through official payment app "
            "or bank statement before accepting as proof."
        )
    else:
        return (
            "High probability of manipulation detected. Do NOT accept this as valid payment proof. "
            "Report to cybercrime authorities if received as fraud attempt."
        )
