# Pokémon cleanup — Step 2 of 16: Team Star styles

Baseline: `4bc8841688b2f01fdd54acb9b37e6e2d243376d5`.

Moves the exact contents of `style#teamStarPatch84` into `styles/team-star.css`, including the existing embedded background and decorative artwork. The build restores the CSS in the same element at its original cascade position. No extra browser requests or behavior changes.

Validation: reconstructed source, prepared HTML, and all 117 output files match current main byte for byte or by SHA-256. Runtime remains Patch #279, build 20261002184000.

After merge: check Team Star's My Team background and decorative logo on a phone. If your account belongs to another team, its page should look unchanged; use the existing admin Team Preview only if available.
