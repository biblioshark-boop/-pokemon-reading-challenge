# Pokémon cleanup: Step 9 of 16

Moved renderDex, updatePokemonPromptToggles, togglePokemonCardPrompt, and openPokemon to two source fragments: pokedex-grid-render.js and pokedex-detail-render.js. Their exact contents are preserved. Grid batching, filtering, image handling, prompt expansion, entry navigation, and all rendered buttons retain their existing behavior.

The build restores each fragment at its original location in the same inline script. There are no new browser requests or changes to scope/order. Filter state, image preloading, book/catch/save actions, evolution rendering, special-event controls, Safari behavior, and other sites are untouched. The existing save-conflict patch and special-event patch apply after reconstruction as before.

Validation against current main: reconstructed source equality, prepared HTML and complete output manifest equality, extracted JavaScript syntax, and hosted preview equality with live production.

After merge: search/filter the Pokédex, scroll for more cards, expand a long prompt, open an entry and use next/previous, then confirm Books Read and caught/wishlist/planned-book controls still appear. Admins can check that Edit Images still shows its image and Special Events controls. Runtime remains Patch #279 / build 20261002184000 because generated output is unchanged.
