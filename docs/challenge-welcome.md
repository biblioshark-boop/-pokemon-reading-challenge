# One-time challenge welcome

Pokémon #290 and DINO-107 add the same popup module, configured separately by each site's existing authenticated worker. It opens on the first challenge visit after release, including for existing participants and direct links. New account-owned dismissal records are independent for Pokémon and Museum; existing FAQ orientation and challenge progression are not reset.

Closing with X or Escape, or following the normal FAQ link, dismisses the notice. The database stores one immutable row per member/challenge. A local account/challenge-scoped cache avoids repeats while offline; a pending write retries online or on a later visit. A successful database dismissal suppresses the popup even when local storage is cleared or unavailable, including on another device. Pokémon permits FAQ navigation before team selection so this link works for new members; all other team requirements remain intact. Reading/dismissing notices never writes challenge saves, points, catches or profiles. A network failure during the initial lookup leaves the existing challenge usable and retries when online.

Copy follows the supplied note: join any time, no completion time limit, one read per prompt/reward. Pokémon includes the 2026-only backlogging allowance; Museum excludes books read before starting. FAQ links use existing native navigation. This is informational copy, not a change to catch validation or existing reread rules.

## Release dependency

Apply sql/rf-challenge-welcome.sql **once** to Supabase yamjfaacvewvrinxytep before merging/deploying the two branches. The identical SQL is included in both repositories for visibility; do not apply it twice. It creates a new RLS-protected table with authenticated owner-only SELECT/INSERT and no anonymous, UPDATE or DELETE privileges. Existing members need no data reset/backfill. Before merge, the schema/policy test transaction was rolled back and table absence verified; production remains unchanged.

## Validation

- Syntax: both build-preparation scripts, both workers and the popup module.
- Worker integration: emitted inline scripts parse, loader/context appear once, challenge-specific asset routes resolve correctly.
- Browser fixtures at 1280px and 390px: eligible existing/new members, early/late auth, X/Escape close, repeat visits, independent challenges/accounts, cleared/blocked local storage, account persistence, native FAQ links and offline dismissal retry. Mobile dialog fits and scrolls within the viewport; native dialog traps focus and restores it on close.
- SQL transaction: own reads/inserts, separate notices, duplicate dismissal safety, cross-user read/insert isolation, unsupported challenge rejection, anonymous and UPDATE/DELETE denial. Rolled back; no member data changed.
- Compared narrow branches to current main. Existing login/catches/shinies/Safari/Museum progress/exporter/pumpkin logic unchanged.

## Manual test after merge

1. Enter Pokémon and check the popup; close X, leave and return/refresh: it must stay closed.
2. Enter Museum: its separate popup should still appear. Test FAQ, then return: it must stay closed.
3. Open either challenge from a second browser/device signed into the same account: dismissed popups must remain closed.

First visits before closing remain eligible. Pokémon's existing FAQ orientation and Museum orientation are preserved; new members may still see those separate onboarding flows.
