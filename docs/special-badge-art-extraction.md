# Pokémon cleanup — Step 6 of 16: Special badge artwork catalog

Baseline: `0d481569eca111765f68250cf741673b083791e1`.

Moves the exact `SPECIAL_BADGE_IMAGES` declaration to `source-fragments/special-badge-images.js`. The base build restores it at its original script position and validates the catalog JSON. The six badge entries, image bytes, URLs, and query strings are unchanged. No browser requests added.

Current main includes a stale-save conflict guard implemented through a wrapper and patch file. Those files stay unchanged. The comparison script now includes both existing build inputs when validating main and branch.

Validation: reconstructed source is byte-identical; prepared HTML and all 117 output files match by SHA-256, including the save guard. Runtime remains Patch #279, build 20261002184000. Source index.html is approximately 161 KB smaller.

After merge: open the Trainer Card/Badge Case and confirm earned special badges display normally. If available, download the Trainer Card and check the badge images on it. No badge award or gameplay changes.
