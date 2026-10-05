# Pokémon HTML cleanup checkpoint
Inspected main: 5796e986197038f211feb8f62a0a8b0f57ce8a56 (Patch 283).

## Completed original numbered steps
1. Badge Case CSS
2. Team Star CSS
3. Gym stadium CSS
4. Base CSS
5. Remaining CSS
6. Special badge artwork
7. Site configuration
8. Display helpers
9. Pokédex rendering
10. Trainer Card rendering/download

The original notes called this 16 steps but do not record named steps 11–16. Do not invent those original steps or report a fixed count of merges remaining.

## Current work areas
| Area | Status and boundary |
| --- | --- |
| Safari / Special Events | Display fragments completed: encounter card, daily status, Missed Shinies. Patch 284 stages mode controls. After it merges, pause this area at the display extraction checkpoint. |
| Achievements | Next candidate: review dependencies and identify display-only boundaries; do not move claims or saving without gameplay tests. |
| Profile / admin tools | Review display boundaries separately; preserve real admin authorization, profile data and writes. |
| Shiny logic | Defer state/save logic until dedicated gameplay baseline. Preserve regular Safari 1-in-60, Haunted Safari's existing odds, limits and prompt catches 1-in-50. |
| Final review | Check build assembly, existing patches, scope/order and member smoke checks; stop this cleanup phase. |

## Safari dependency review
- Mode UI depends on mode availability, encounter-clear guard and DOM controls. Move unchanged and restore at the same inline location.
- Search depends on pools, event membership, daily rolls, missed-shiny capacity, encounter state and saving.
- Shiny persistence and roll counters depend on challengeData, cloud saves, test sandbox and local storage.
- Event membership/admin functions depend on Supabase catalog mappings, real admin authorization and deployment exact-context patches.
- Keep the latter three groups in place for now. Further extraction needs deterministic gameplay tests across regular/Haunted, normal/admin/Test Mode, save errors/conflicts and shiny awards.
- Do not remove existing deployment patches, alter odds or refactor global execution order as part of display extraction.

## Patch 284 scope and validation
Move setSafariMode and syncSafariModeUi unchanged into safari-mode-controls.js.
Build restoration recreates current source byte-for-byte before existing deployment patches.
No new runtime request, database change or gameplay change.
Test normal/Haunted mode switching, unavailable event fallback, encounter-clear guard and missing DOM.
After merge: switch between regular and Haunted Safari, confirm correct grass/tombstones and controls, then View Pokémon.
No catch or shiny hunt is needed for this display-only patch.

## Standing workflow
Current main → narrow branch → focused patch → validate/compare → explicit merge → verify production.
Report remaining work by these areas, not an endless sequence of unplanned tiny extractions.
