# Pokémon index structural audit — 2026-10-02

Baseline: main commit `a17e7a3cd002c4b590efcb343b43b60e6bfcbab4`.
Branch: `refactor-pokemon-index-20261002`.
Runtime build remains Patch #279 / RF_BUILD 20261002184000. This branch is not a release.

## Structure

| Component | Observation |
| --- | --- |
| index.html | 26,682,475 bytes; 12,227 lines |
| Embedded assets | 117 data URIs, occupying 25,913,585 bytes of source text (97.1%) |
| CSS | 54 inline style blocks, including repeated historical patch layers and embedded backgrounds |
| Scripts | Four script elements: two external libraries, early build/theme globals, and one 24,054,845-byte application script element |
| HTML | 89,373 bytes after removing script/style elements; includes navigation, challenge pages, dialogs, and inline handlers |
| Deployment | cloudflare_prepare.py applies exact-context Special Events changes, extracts embedded assets, sets current build markers, and injects the independent pumpkin loader |
| Routing/auth shell | pokemon-worker.js rewrites /pokemon/ asset paths and injects shared authentication and Hub UI; left unchanged |

The large script combines application logic, static catalogs, artwork, authentication, saving, Safari, shiny/catch behavior, teams, achievements, and admin tools. Moving it into a deferred/module script would change execution timing and global scope. CSS order and existing style IDs must also be preserved. Direct index edits must remain compatible with the Special Events patch contexts.

## First extraction

A 549-byte stylesheet for individual Pokédex Previous/Next navigation is copied verbatim into `styles/dex-detail-navigation.css`.

The build reads that file and assembles it at the original inline location, retaining the existing style element, ID, cascade position, and URLs. It adds no runtime request or JavaScript.

The GitHub connector rejected the oversized index write at its 16 MiB request limit. Consequently this first branch deliberately retains index.html byte-for-byte and uses a guarded build-time extraction. It is a preparatory extraction, not a reduction of the checked-in index size. The original block remains as the comparison reference. The build fails if the extracted CSS and original block differ, or if the block is missing/duplicated. Removing that original block is a later step requiring a supported large-file write path.

## Validation

Run:
```sh
python scripts/validate_first_extraction.py /path/to/baseline-checkout
```

The validator confirms unchanged index source and exact extracted CSS, runs baseline and branch preparation with identical asset inputs, and compares every dist file by SHA-256.

Local validation passed: prepared HTML and all 117 generated output files match main. The local comparison used embedded assets and the unchanged pumpkin script, without downloading the repository's pre-existing artwork directory. When a baseline checkout includes assets/, the validator copies the same complete directory into both builds. No authenticated gameplay test or live deployment was performed.

## Next candidates, for separate reviewed changes

1. Establish a supported large-file source editing path, then replace only this CSS block with an explicit build include and prove identical output.
2. Inventory static image/catalog boundaries and dependencies before moving any large data.
3. Extract additional isolated styles one block at a time, preserving order.
4. Leave authentication, shared state, Safari/shiny/catch code, event mappings, and startup order until a dedicated behavior test baseline exists.

Do not combine cleanup of historical patches with an extraction. Stage, compare against current main, and obtain explicit merge authorization.
