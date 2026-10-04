# Pokémon cleanup — Step 3 of 16: Gym stadium background styles

Baseline: `c755ffad66950d8187b694c89fac4b7743834aef`.

Moves the exact contents of `style#gymStadiumBackground20260818` to `styles/gym-stadium-background.css`, including its embedded background image. The build restores the CSS in the same element and cascade position. Existing iPhone Safari background positioning, page height, layering, and pointer-event rules remain unchanged. No browser requests added.

Validation: reconstructed source, prepared HTML, and all 117 output files match current main byte for byte or by SHA-256. Runtime remains Patch #279, build 20261002184000.

After merge: open Gyms on a phone, scroll the page, and open a Gym. Confirm the stadium background and controls look and work as before; switch back to Pokédex and confirm its background is normal.
