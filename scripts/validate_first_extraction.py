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
STYLE = rb'<style id="dexDetailPrevNext20260818">([\s\S]*?)</style>'


def manifest(directory):
    return {
        p.relative_to(directory).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
        for p in directory.rglob("*") if p.is_file()
    }


def main():
    if len(sys.argv) != 2:
        raise SystemExit("Usage: validate_first_extraction.py /path/to/main-checkout")
    baseline = Path(sys.argv[1]).resolve()
    source = (ROOT / "index.html").read_bytes()
    assert source == (baseline / "index.html").read_bytes(), "Legacy source differs from main"
    matches = re.findall(STYLE, source)
    assert len(matches) == 1, "Expected one stylesheet"
    assert matches[0] == (ROOT / "styles/dex-detail-navigation.css").read_bytes(), "Extracted CSS differs"
    print("PASS: legacy source unchanged; extracted stylesheet matches main byte for byte")

    # Use the same asset inputs for both builds, including deduplication inputs.
    with tempfile.TemporaryDirectory(prefix="pokemon-extraction-") as tmp:
        outputs = []
        for label, checkout in [("main", baseline), ("branch", ROOT)]:
            target = Path(tmp) / label
            target.mkdir()
            for name in ["index.html", "cloudflare_prepare.py", "pokemon-special-event-controls.patch.json", "rf-pumpkin-hunt.js"]:
                shutil.copyfile(checkout / name, target / name)
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
