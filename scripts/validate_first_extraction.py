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
STYLE = rb'<style id="badgeCaseGymTheme20260818">([\s\S]*?)</style>'


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
        for filename in ["dex-detail-navigation.css", "team-page-backgrounds.css", "safari-zone.css", "badge-case.css"]:
            css_marker = f"/* RF_CSS_INCLUDE:styles/{filename} */".encode()
            if css_marker in source:
                assert source.count(css_marker) == 1, "Duplicate CSS include marker"
                source = source.replace(css_marker, (checkout / "styles" / filename).read_bytes())
        assert b"/* RF_CSS_INCLUDE:" not in source, "Unknown CSS marker"
        return source

    source = reconstructed(ROOT)
    assert source == reconstructed(baseline), "Reconstructed source differs from main"
    matches = re.findall(STYLE, source)
    assert len(matches) == 1, "Expected one stylesheet"
    assert matches[0] == (ROOT / "styles/badge-case.css").read_bytes(), "Extracted CSS differs"
    print("PASS: reconstructed source unchanged; extracted stylesheet matches main byte for byte")

    # Use the same asset inputs for both builds, including deduplication inputs.
    with tempfile.TemporaryDirectory(prefix="pokemon-extraction-") as tmp:
        outputs = []
        for label, checkout in [("main", baseline), ("branch", ROOT)]:
            target = Path(tmp) / label
            target.mkdir()
            for name in ["index.html", "cloudflare_prepare.py", "pokemon-special-event-controls.patch.json", "rf-pumpkin-hunt.js"]:
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
