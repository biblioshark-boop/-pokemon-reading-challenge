"""Compare the structural extraction with an explicit baseline checkout.

Usage: python scripts/validate_first_extraction.py /path/to/main-checkout
No network access, authentication, or deployment is performed.
"""
from pathlib import Path
import hashlib
import shutil
import re
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
BADGE_DECLARATION = rb'const SPECIAL_BADGE_IMAGES=([^\n]+);'


def manifest(directory):
    return {
        p.relative_to(directory).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
        for p in directory.rglob("*") if p.is_file()
    }


def main():
    if len(sys.argv) != 2:
        raise SystemExit("Usage: validate_first_extraction.py /path/to/main-checkout")
    baseline = Path(sys.argv[1]).resolve()
    def reconstructed(checkout):
        source = (checkout / "index.html").read_bytes()
        markers = re.findall(rb'/\* RF_INCLUDE:(source-fragments/[a-z-]+\.js) \*/', source)
        assert len(markers) == len(set(markers)), "Duplicate fragment marker"
        for path in markers:
            source = source.replace(b"/* RF_INCLUDE:" + path + b" */", (checkout / path.decode()).read_bytes())
        assert b"/* RF_INCLUDE:" not in source, "Unknown fragment marker"
        css_paths = re.findall(rb'/\* RF_CSS_INCLUDE:(styles/[a-z0-9/-]+\.css) \*/', source)
        assert len(css_paths) == len(set(css_paths)), "Duplicate CSS include marker"
        for path in css_paths:
            marker = b"/* RF_CSS_INCLUDE:" + path + b" */"
            source = source.replace(marker, (checkout / path.decode()).read_bytes())
        assert b"/* RF_CSS_INCLUDE:" not in source, "Unknown CSS marker"
        return source

    source = reconstructed(ROOT)
    assert source == reconstructed(baseline), "Reconstructed source differs from main"
    matches = re.findall(BADGE_DECLARATION, source)
    assert len(matches) == 1, "Expected one badge catalog"
    assert b"const SPECIAL_BADGE_IMAGES=" + matches[0] + b";" == (ROOT / "source-fragments/special-badge-images.js").read_bytes(), "Extracted badge catalog differs"
    print("PASS: reconstructed source unchanged; extracted badge catalog matches main byte for byte")

    # Use the same asset inputs for both builds, including deduplication inputs.
    with tempfile.TemporaryDirectory(prefix="pokemon-extraction-") as tmp:
        outputs = []
        for label, checkout in [("main", baseline), ("branch", ROOT)]:
            target = Path(tmp) / label
            target.mkdir()
            for name in ["index.html", "cloudflare_prepare.py", "cloudflare_prepare_base.py", "pokemon-save-conflict-guard.patch.json", "pokemon-special-event-controls.patch.json", "rf-pumpkin-hunt.js"]:
                shutil.copyfile(checkout / name, target / name)
            if (checkout / "source-fragments").exists():
                shutil.copytree(checkout / "source-fragments", target / "source-fragments")
            if (checkout / "styles").exists():
                shutil.copytree(checkout / "styles", target / "styles")
            if (baseline / "assets").exists():
                shutil.copytree(baseline / "assets", target / "assets")
            subprocess.run([sys.executable, str(target / "cloudflare_prepare.py")], check=True)
            outputs.append(manifest(target / "dist"))
        assert outputs[0] == outputs[1], "Prepared HTML or asset manifest differs from main"
        print(f"PASS: prepared HTML and all {len(outputs[0])} output files match main by SHA-256")


if __name__ == "__main__":
    main()
