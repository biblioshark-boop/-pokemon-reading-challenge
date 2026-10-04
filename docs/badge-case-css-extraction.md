# Pokémon cleanup — Step 1 of 16: Badge Case styles

Baseline: `2d6c2e9c468903b12b74b9513b2ec48d647559de`.

Moves the exact contents of `style#badgeCaseGymTheme20260818` to `styles/badge-case.css`. The build restores the CSS inside the same style element at the same cascade position. No browser requests or runtime behavior changes are introduced. The existing block also contains Haunted Safari appearance overrides; those bytes and their order are preserved.

The validation script compares reconstructed source and prepared output manifests against an explicit current-main checkout. Runtime remains Patch #279, build 20261002184000, because the generated page is unchanged.

After merge: open the Trainer Card Badge Case on a phone and confirm the badges and background look unchanged. Also open Haunted Safari and check the background and encounter card appearance; catching behavior is unchanged.
