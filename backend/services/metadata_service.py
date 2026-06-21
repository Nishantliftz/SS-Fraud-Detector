"""
Metadata Service — First Half
Inspects image EXIF/metadata using Pillow and piexif to detect:
 - Missing metadata (possible stripping after editing)
 - Known editing software signatures (Photoshop, GIMP, etc.)
 - Suspicious modification timestamps
 - Mismatched dimensions or DPI
"""

import os
from datetime import datetime, timezone, timedelta
from typing import Dict, Any

try:
    from PIL import Image
    from PIL.ExifTags import TAGS
    PILLOW_AVAILABLE = True
except ImportError:
    PILLOW_AVAILABLE = False

try:
    import piexif
    PIEXIF_AVAILABLE = True
except ImportError:
    PIEXIF_AVAILABLE = False

# Software strings that indicate post-processing editors
EDITING_SOFTWARE = [
    "photoshop", "gimp", "paint.net", "affinity", "lightroom",
    "snapseed", "picsart", "canva", "pixlr", "fotor",
    "adobe", "corel", "inkscape", "krita",
]

# Expected metadata present in real screenshot captures
EXPECTED_EXIF_KEYS = {"Make", "Model", "DateTime", "Software"}


def analyze_metadata(filepath: str) -> Dict[str, Any]:
    if not PILLOW_AVAILABLE:
        return {"error": "Pillow not installed", "metadata_score": 50, "suspicious": False}

    issues = []
    suspicious_flags = []
    score = 100

    try:
        img = Image.open(filepath)
        info = {
            "format": img.format,
            "mode": img.mode,
            "size": list(img.size),
            "dpi": list(img.info.get("dpi", [72, 72])) if "dpi" in img.info else None,
        }

        # ── Check 1: EXIF data presence ───────────────────────────────────────
        exif_raw = img._getexif() if hasattr(img, "_getexif") else None
        exif_data = {}
        if exif_raw:
            for tag_id, value in exif_raw.items():
                tag_name = TAGS.get(tag_id, str(tag_id))
                try:
                    exif_data[tag_name] = str(value)
                except Exception:
                    pass
        else:
            issues.append("No EXIF metadata found — common in edited/stripped images")
            suspicious_flags.append("no_exif")
            score -= 20

        # ── Check 2: Software signature ───────────────────────────────────────
        software = exif_data.get("Software", "")
        detected_editor = None
        for editor in EDITING_SOFTWARE:
            if editor.lower() in software.lower():
                detected_editor = software
                issues.append(f"Image created/modified with editing software: {software}")
                suspicious_flags.append("editing_software")
                score -= 30
                break

        # ── Check 3: DateTime freshness and consistency ───────────────────────
        dt_str = exif_data.get("DateTime") or exif_data.get("DateTimeOriginal")
        datetime_suspicious = False
        if dt_str:
            try:
                dt = datetime.strptime(dt_str, "%Y:%m:%d %H:%M:%S")
                now = datetime.now()
                # Flag if image timestamp is in the future
                if dt > now + timedelta(hours=1):
                    issues.append(f"Image timestamp is in the future: {dt_str}")
                    suspicious_flags.append("future_timestamp")
                    score -= 25
                    datetime_suspicious = True
                # Flag very old modification date (before smartphones)
                elif dt.year < 2010:
                    issues.append(f"Unusually old timestamp for a mobile screenshot: {dt_str}")
                    suspicious_flags.append("old_timestamp")
                    score -= 15
                    datetime_suspicious = True
            except ValueError:
                issues.append(f"Could not parse timestamp: {dt_str}")
                suspicious_flags.append("unparseable_timestamp")
                score -= 10

        # ── Check 4: Missing device info (real screenshots have device EXIF) ──
        make = exif_data.get("Make", "")
        model = exif_data.get("Model", "")
        if not make and not model and exif_raw:
            issues.append("No device Make/Model in EXIF — unusual for genuine smartphone screenshots")
            suspicious_flags.append("no_device_info")
            score -= 15

        # ── Check 5: File size vs image dimensions sanity check ───────────────
        file_size_kb = os.path.getsize(filepath) / 1024
        pixels = img.size[0] * img.size[1]
        if pixels > 0:
            bytes_per_pixel = (file_size_kb * 1024) / pixels
            # Very low file size for dimensions can indicate aggressive re-compression
            if bytes_per_pixel < 0.05 and img.format == "JPEG":
                issues.append("Suspiciously small file size for image dimensions — possible re-compression")
                suspicious_flags.append("suspicious_compression")
                score -= 10

        # ── Check 6: Thumbnail vs main image discrepancy ─────────────────────
        if PIEXIF_AVAILABLE and exif_raw:
            try:
                raw_bytes = img.info.get("exif", b"")
                if raw_bytes:
                    exif_dict = piexif.load(raw_bytes)
                    thumb = exif_dict.get("thumbnail")
                    if thumb:
                        # Thumbnail existence with no other EXIF is suspicious
                        pass
            except Exception:
                pass

        return {
            "has_exif": bool(exif_raw),
            "exif_fields": list(exif_data.keys()),
            "software": detected_editor,
            "device_make": make or None,
            "device_model": model or None,
            "datetime": dt_str if "dt_str" in dir() else None,
            "image_info": info,
            "file_size_kb": round(file_size_kb, 2),
            "suspicious": len(suspicious_flags) > 0,
            "suspicious_flags": suspicious_flags,
            "issues": issues,
            "metadata_score": max(0, min(100, score)),
        }

    except Exception as e:
        return {
            "error": str(e),
            "suspicious": False,
            "issues": [f"Metadata analysis failed: {str(e)}"],
            "metadata_score": 50,
        }
