# Dex navigation CSS extraction

Baseline main: ddd383c5e9e2c0a45036ad4de9098061807f5264.

The stylesheet was previously copied into styles/dex-detail-navigation.css while still present inline. Replace the inline contents with a build include marker; the existing build reinserts the exact CSS inside the same style element. No stylesheet request, script, selector or visual rule changes.

Reconstructed source and prepared HTML plus all 117 generated files match baseline byte for byte / by SHA-256 using identical asset inputs. Missing CSS and wrong or duplicate markers fail the build. Existing artwork fragments, special-event patch and pumpkin loader remain unchanged. Runtime remains Patch #279 / build 20261002184000.

After merge: open a Pokemon entry from Pokedex, use Previous/Next, and confirm buttons display and navigate properly on a phone. No catch or progress changes needed.
