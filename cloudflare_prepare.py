from pathlib import Path
import base64
import hashlib
import json
import re
import shutil

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "index.html"
ASSET_SOURCE = ROOT / "assets"
DIST = ROOT / "dist"
DIST_ASSETS = DIST / "assets"
MAX_CF_ASSET = 25 * 1024 * 1024

MIME_EXT = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
    "image/avif": ".avif",
    "font/woff": ".woff",
    "font/woff2": ".woff2",
    "application/font-woff": ".woff",
    "application/font-woff2": ".woff2",
}

DATA_URI = re.compile(
    r"data:(?P<mime>(?:image|font|application)/[A-Za-z0-9.+-]+);base64,(?P<data>[A-Za-z0-9+/=\\r\\n]+)"
)

def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def rel_web(path: Path) -> str:
    return path.relative_to(DIST).as_posix()

def main():
    if not SOURCE.exists():
        raise SystemExit("ERROR: index.html was not found.")

    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()

    if ASSET_SOURCE.exists():
        shutil.copytree(ASSET_SOURCE, DIST_ASSETS)
    else:
        DIST_ASSETS.mkdir(parents=True, exist_ok=True)

    existing = {}
    for p in DIST_ASSETS.rglob("*"):
        if not p.is_file():
            continue
        size = p.stat().st_size
        if size > MAX_CF_ASSET:
            raise SystemExit(
                f"ERROR: Existing asset exceeds Cloudflare's 25 MiB limit: {rel_web(p)} ({size / 1024 / 1024:.1f} MiB)"
            )
        try:
            existing[sha256_bytes(p.read_bytes())] = rel_web(p)
        except OSError:
            pass

    text = SOURCE.read_text(encoding="utf-8")
    # First structural extraction. Keep the oversized legacy source intact.
    # The extracted stylesheet is assembled at the exact original position.
    css_pattern = re.compile(r'(<style id="dexDetailPrevNext20260818">)([\\s\\S]*?)(</style>)')
    css_matches = list(css_pattern.finditer(text))
    if len(css_matches) != 1:
        raise SystemExit("ERROR: Expected exactly one Dex navigation stylesheet.")
    css_match = css_matches[0]
    css = (ROOT / "styles" / "dex-detail-navigation.css").read_text(encoding="utf-8")
    if css_match.group(2) != css:
        raise SystemExit("ERROR: Extracted Dex navigation CSS differs from the legacy source; review before deploying.")
    text = text[:css_match.start(2)] + css + text[css_match.end(2):]
    # Keep the oversized source file intact while applying the reviewed event patch.
    # Exact context checks prevent silently applying it to incompatible future edits.
    patch_file = ROOT / "pokemon-special-event-controls.patch.json"
    for change in json.loads(patch_file.read_text(encoding="utf-8")):
        if text.count(change["old"]) != 1:
            raise SystemExit("ERROR: Special Event patch context changed; review the source before deploying.")
        text = text.replace(change["old"], change["new"])

    extracted_dir = DIST_ASSETS / "extracted-inline"
    extracted_dir.mkdir(parents=True, exist_ok=True)

    def replace(match):
        mime = match.group("mime").lower()
        ext = MIME_EXT.get(mime)
        if not ext:
            return match.group(0)

        raw_b64 = re.sub(r"\\s+", "", match.group("data"))
        try:
            data = base64.b64decode(raw_b64, validate=True)
        except Exception:
            return match.group(0)

        if len(data) > MAX_CF_ASSET:
            raise RuntimeError(
                f"Decoded inline asset exceeds Cloudflare's 25 MiB limit: {mime} ({len(data) / 1024 / 1024:.1f} MiB)"
            )

        digest = sha256_bytes(data)
        if digest in existing:
            return existing[digest]

        out = extracted_dir / f"{digest[:24]}{ext}"
        if not out.exists():
            out.write_bytes(data)
        web_path = rel_web(out)
        existing[digest] = web_path
        return web_path

    try:
        processed = DATA_URI.sub(replace, text)
    except RuntimeError as exc:
        raise SystemExit(f"ERROR: {exc}")

    # Optional Pumpkin Hunt runs separately after the challenge loads.
    processed = re.sub(r"RF_BUILD:\d+", "RF_BUILD:20261002184000", processed, count=1)
    processed = re.sub(r'const RF_BUILD="\d+";', 'const RF_BUILD="20261002184000";', processed, count=1)
    processed = re.sub(r"RF_PATCH_NAME:[^<]+? -->", "RF_PATCH_NAME:Patch #279 — One-time Admin Pumpkin Spawns -->", processed, count=1)
    processed = re.sub(r'const RF_PATCH_NAME="[^"]+";', 'const RF_PATCH_NAME="Patch #279 — One-time Admin Pumpkin Spawns";', processed, count=1)
    script = '<script async src="rf-pumpkin-hunt.js?v=20261002184000" data-rf-challenge="pokemon"></script>'
    if "</body>" not in processed:
        raise SystemExit("ERROR: Expected a body closing tag for the optional pumpkin script.")
    body_end = processed.rfind("</body>")
    processed = processed[:body_end] + script + processed[body_end:]
    shutil.copyfile(ROOT / "rf-pumpkin-hunt.js", DIST / "rf-pumpkin-hunt.js")

    out_index = DIST / "index.html"
    out_index.write_text(processed, encoding="utf-8")

    if out_index.stat().st_size > MAX_CF_ASSET:
        raise SystemExit(
            "ERROR: Prepared index.html is still over 25 MiB. Stop here; another embedded source needs to be isolated."
        )

    print("SUCCESS: dist/ is ready for hidden /pokemon/ Cloudflare deployment.")

if __name__ == "__main__":
    main()
