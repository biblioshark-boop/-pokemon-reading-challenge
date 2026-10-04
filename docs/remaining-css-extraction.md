# Pokémon cleanup — Step 5 of 16: Remaining style blocks

Baseline: `3eba4d88d278733b193afe981588a706bd12885b`.

Moves all 47 remaining inline CSS blocks into individual files under `styles/sections/`. Keeps every original style element, its attributes, its position, and the exact CSS bytes. Includes image-editing controls, dark-mode/mobile overrides, Trainer Card, team, achievement, and late page styles. Build restores all CSS before deployment without additional browser requests.

Validation: reconstructed source and prepared HTML are unchanged; all 117 build output files match main by SHA-256. All 54 style elements keep their attributes and order; markup and scripts outside style bodies are unchanged. Source index.html decreases by about 208 KB. Runtime remains Patch #279, build 20261002184000.

After merge: on a phone check Pokédex (including an individual entry), My Team/Trainer Card, Achievements, and Settings. Toggle light/dark theme, scroll, and confirm navigation and admin image-edit buttons still appear normally. No catching, rewards, or save data changes.
