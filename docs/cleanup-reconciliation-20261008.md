# Pokémon cleanup reconciliation and Team-page extraction — 2026-10-08

Baseline main: 1640917087ecfd56b1b043b29e92cbfc03f5cd04.
Structural patch: #291. Served metadata remains Patch #290 / RF_BUILD 20261007180000.

The earlier 16-step plan named the remaining areas below. Later display extractions completed portions; deliberately deferred stateful logic is not reported as completed.

| Original step | Current-main status | Remaining boundary |
| --- | --- | --- |
| 11 Team page/statistics | renderMyTeamPage and statistics loaders remain inline | This patch moves renderMyTeamPage unchanged. Statistics loaders remain for separate inspection. |
| 12 Achievements | achievement-shell-render.js is extracted | Eligibility, claims, downloads, and persistence remain inline and deferred pending gameplay baselines. |
| 13 Gym | Artwork/CSS already separated; renderGyms and victory-card rendering remain inline | Inspect pure display boundaries separately; completion/undo/save handlers remain untouched. |
| 14 Safari | Encounter, daily status, missed-shiny menu, and mode controls extracted | Pools, search orchestration, shiny/catch counters, persistence, and event mappings remain inline; stateful work deferred. |
| 15 Login/loading/saving | Shared auth Worker shell and source save logic retained | Deliberately deferred; no authentication, session, save, or conflict-guard extraction in this patch. |
| 16 Remaining markup/final review | Source/live syntax and selected fragments/assets checked | Full build comparison and authenticated desktop/mobile smoke checks are still outstanding. |

PR #31 / Patch #287 is an unmerged admin-card feature/database-read change, not part of this structural patch. Do not merge it automatically.

## This patch
Move only async function renderMyTeamPage into source-fragments/my-team-page-render.js. Restore it byte-for-byte at the original script position through cloudflare_prepare_base.py's existing guarded include list, before existing deployment patches.

The get_team_page_preview RPC call, parameters, error handling, contributors, team totals, existing bonus-point build patches, member list, cheer wall, Poké Dolls layout, banner/leader artwork, activity links, preview restrictions, and DOM markup stay unchanged. No new browser requests, CSS changes, database behavior changes, reward changes, or Worker changes.

## Validation
- Reconstruction replacing the one new marker with the fragment equals the current main source exactly.
- Fragment and Python build syntax pass.
- Nine renderer fixtures produce identical DOM markup and calls: missing DOM, public view, signed out, RPC error, missing summary, competitive team, Poké Dolls, preview mode, and missing optional lists.
- Verify totals, recent activity, preview note, and one unchanged get_team_page_preview read.
- No function declarations added or removed; the moved renderer still has one declaration.
- Existing asset references and mobile markup are byte-for-byte unchanged.

Run node tests/my-team-page-extraction.cjs /path/to/main/index.html.

Limit: two untouched large trainer catalogs exceed connector limits, preventing full prepared-output/asset manifest comparison. Authenticated desktop/mobile browser tests have not been performed. Draft staging does not imply those checks passed.
