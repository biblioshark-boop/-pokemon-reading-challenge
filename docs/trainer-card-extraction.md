# Pokémon cleanup: Step 10 of 16

Moved renderTrainerCardPokemonTeam, fitTrainerMockupText, renderTrainerCardTestMockup, and renderTrainerCard into trainer-card-render.js. Moved both existing Trainer Card download implementations, their adjacent drawing helpers, and the existing downloadTrainerCard reassignment into trainer-card-download.js.

Each fragment preserves the original contents and is restored by the build at its original inline script position. Both existing card layouts, visibility rules, identity text, Pokémon slots, badges, team/leader styling, export iframe, image waits, output filenames, and cleanup behavior are unchanged. The download reassignment remains in its original order. Shared character-image helpers and card editors stay in place. No browser requests, database changes, or changes to other sites are introduced.

Validation against current main: reconstructed source equality, complete prepared output manifest equality, both fragment syntax checks, and hosted preview equality with production. Existing special-event and save-conflict patches remain unchanged and still apply.

After merge: view the Trainer Card on mobile, confirm name/team/character/Pokémon/badges, open and close Edit Trainer Card, and download the card to confirm the saved image matches. Runtime remains Patch #279 / build 20261002184000 because generated output is unchanged.
