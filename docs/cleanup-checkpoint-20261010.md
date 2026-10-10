# Pokémon structural cleanup checkpoint

Baseline: `b2022bfe1821b9d4cb0857d1af795b3279897f2e` (runtime Patch 298).
Review: PR 43, structural Patch 297, refreshed against that baseline.

The final pending catch-card catalog extraction moves the existing constants to
`source-fragments/catch-card-type-catalog.js`. Preparation restores their exact
bytes at their original script position. Runtime build metadata remains Patch 298.

## Validation

- Reconstructed index is byte-identical to the baseline source.
- Full Cloudflare preparation succeeds for both baseline and candidate.
- All 455 generated files have identical SHA-256 manifests; prepared index is
  786,166 bytes. This includes all assets and current Patch 298 styles.
- Every generated inline JavaScript block passes `node --check`.
- Existing Stats visibility, prompt-shiny boundary/conflict/reload tests, and
  challenge-worker generated-script/routing tests pass.
- `git diff --check` passes.
- The challenge-welcome browser test could not run because its Playwright
  Chromium executable is absent. No authenticated desktop/iPhone session was
  exercised. Byte equivalence is evidence for this extraction, not a claim that
  every live feature was manually tested.

## Phase boundary

After PR 43 is explicitly approved, merged, and production deployment is checked,
the Pokémon display/static-data extraction phase has reached its stopping point.
Do not add more extraction steps just because functions remain inline. Login,
load/save, reward eligibility, achievements claims, and Safari persistence remain
deliberately deferred as described in `cleanup-plan.md`; changing them is not
required to close this phase. PR 31 is a separate admin feature and is excluded.

Next review Dino, then the Hub, one narrow patch at a time. Their structural
cleanup is still pending and must preserve current main behavior. Finish with a
read-only cross-site audit before beginning Shop changes. Historical bug fixes
and extra layout/features are separate work, not implicit cleanup requirements.
