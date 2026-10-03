# Static trainer artwork extraction

Two JSON-backed static catalogs are stored in source-fragments and assembled at their original positions by cloudflare_prepare.py. Build before serving: deploy dist/, not source index.html. No browser requests or runtime ordering changes are introduced.

Baseline: 10be625a8d50af5912519b6f4c72f039ee967fd8 (main).
Source index.html shrinks from 26,682,475 to 13,912,602 bytes.
Runtime remains Patch #279 / build 20261002184000.

Validation: python scripts/validate_first_extraction.py /path/to/baseline-checkout
Reconstructed source matches baseline byte for byte; prepared HTML and all 117 generated output files match by SHA-256 using identical asset inputs. Missing, duplicate, and incorrect fragment declarations fail the build. Authenticated gameplay was not separately exercised; browser output is identical.
