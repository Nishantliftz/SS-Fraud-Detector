"""
OCR Service — First Half
Uses EasyOCR to extract text from uploaded images and applies rule-based
heuristics to flag suspicious fields like inconsistent amounts, date formats,
and UPI ID patterns.
"""

import re
from typing import Dict, Any

try:
    import easyocr
    _reader = None

    def get_reader():
        global _reader
        if _reader is None:
            _reader = easyocr.Reader(["en"], gpu=False)
        return _reader

    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False


# ─── Regex patterns for payment screenshots ───────────────────────────────────

UPI_ID_PATTERN = re.compile(r"[\w.\-]+@[\w]+")
AMOUNT_PATTERN = re.compile(r"(?:₹|rs\.?|inr)?\s*[\d,]+(?:\.\d{2})?", re.IGNORECASE)
DATE_PATTERN = re.compile(r"\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b")
REF_PATTERN = re.compile(r"\b\d{10,15}\b")
TIME_PATTERN = re.compile(r"\b\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?\b", re.IGNORECASE)


def run_ocr(filepath: str) -> Dict[str, Any]:
    """Extract text from image and analyze for inconsistencies."""
    if not OCR_AVAILABLE:
        return _fallback_result()

    try:
        reader = get_reader()
        results = reader.readtext(filepath, detail=1)
        full_text = " ".join([r[1] for r in results])
        confidences = [r[2] for r in results]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0

        analysis = _analyze_text(full_text, results)
        analysis["raw_text"] = full_text
        analysis["avg_ocr_confidence"] = round(avg_confidence, 3)
        analysis["word_count"] = len(full_text.split())

        return analysis

    except Exception as e:
        return {"error": str(e), "raw_text": "", "suspicious_fields": [], "ocr_score": 50}


def _analyze_text(text: str, results: list) -> Dict[str, Any]:
    suspicious_fields = []
    issues = []
    score = 100  # start perfect, deduct for issues

    # Extract key fields
    amounts = AMOUNT_PATTERN.findall(text)
    upi_ids = UPI_ID_PATTERN.findall(text)
    dates = DATE_PATTERN.findall(text)
    refs = REF_PATTERN.findall(text)
    times = TIME_PATTERN.findall(text)

    # ── Check 1: Multiple conflicting amounts ─────────────────────────────────
    unique_amounts = list(set(amounts))
    if len(unique_amounts) > 3:
        suspicious_fields.append("multiple_amounts")
        issues.append(f"Unusual number of amount values detected: {unique_amounts}")
        score -= 15

    # ── Check 2: UPI ID validity ──────────────────────────────────────────────
    for uid in upi_ids:
        if len(uid) < 5 or uid.count("@") != 1:
            suspicious_fields.append("invalid_upi_id")
            issues.append(f"Malformed UPI ID: {uid}")
            score -= 10

    # ── Check 3: Amount formatting (₹ vs numeric inconsistency) ──────────────
    raw_amounts = re.findall(r"[\d,]+(?:\.\d{1,2})?", text)
    if raw_amounts:
        for amt in raw_amounts:
            clean = amt.replace(",", "")
            try:
                val = float(clean)
                # Suspicious if ends in .01 or unusual sub-rupee values
                if val > 0 and (val * 100) % 1 != 0:
                    suspicious_fields.append("amount_precision")
                    issues.append(f"Unusual decimal precision in amount: {amt}")
                    score -= 8
                    break
            except ValueError:
                pass

    # ── Check 4: Date consistency ─────────────────────────────────────────────
    if len(dates) > 2:
        suspicious_fields.append("date_inconsistency")
        issues.append(f"Multiple dates found — possible manipulation: {dates}")
        score -= 12

    # ── Check 5: Reference number format ─────────────────────────────────────
    if not refs:
        suspicious_fields.append("missing_reference")
        issues.append("No valid UPI reference/transaction number found")
        score -= 10

    # ── Check 6: Low-confidence OCR regions (possible text overlay) ──────────
    low_conf = [r[1] for r in results if r[2] < 0.4]
    if len(low_conf) > 3:
        suspicious_fields.append("low_confidence_text")
        issues.append(f"Low OCR confidence on {len(low_conf)} text regions — possible overlay")
        score -= 10

    # ── Check 7: Known fraud keywords ────────────────────────────────────────
    fraud_keywords = ["pending", "failed", "processing", "initiated"]
    found_fraud_kw = [kw for kw in fraud_keywords if kw.lower() in text.lower()]
    if found_fraud_kw:
        suspicious_fields.append("fraud_keywords")
        issues.append(f"Status keywords that may indicate incomplete transactions: {found_fraud_kw}")
        score -= 5

    return {
        "suspicious_fields": suspicious_fields,
        "issues": issues,
        "extracted": {
            "amounts": amounts,
            "upi_ids": upi_ids,
            "dates": dates,
            "reference_numbers": refs,
            "times": times,
        },
        "ocr_score": max(0, min(100, score)),
    }


def _fallback_result() -> Dict[str, Any]:
    return {
        "raw_text": "",
        "suspicious_fields": [],
        "issues": ["EasyOCR not available — install with: pip install easyocr"],
        "extracted": {"amounts": [], "upi_ids": [], "dates": [], "reference_numbers": [], "times": []},
        "ocr_score": 50,
        "avg_ocr_confidence": 0.0,
        "word_count": 0,
    }
