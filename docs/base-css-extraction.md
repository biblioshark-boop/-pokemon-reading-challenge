# Pokémon cleanup — Step 4 of 16: Base page styles

Baseline: `9947002cf89d32f155c9bc582c24d2aa2178949e`.

Moves the first base stylesheet to `styles/base.css` without changing any CSS. The build restores its contents in the original anonymous style element, before all later override styles. This preserves element attributes, selector order, responsive rules, and loading behavior. No browser requests are added.

Validation: reconstructed source is byte-identical; prepared HTML and all 117 output files match main by SHA-256. Runtime remains Patch #279, build 20261002184000.

After merge: on a phone check Home, Pokédex, and Settings; scroll and switch tabs. Cards, buttons, navigation, and layout should look and behave as before.
