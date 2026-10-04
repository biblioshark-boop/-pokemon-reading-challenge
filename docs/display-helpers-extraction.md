# Pokémon cleanup: Step 8 of 16

Moved the contiguous esc, title, region, form, image, and gridThumbSrc helpers into source-fragments/display-helpers.js with their exact contents preserved. These helpers format labels, escape HTML, map regional forms, and construct image URLs.

The build restores the fragment at its original position in the same inline script. Names, global scope, ordering, outputs, and existing image URL behavior remain unchanged. No new browser requests or runtime behavior are introduced. Login, save conflict protection, special events, Safari, and other sites are untouched.

Validation: python scripts/validate_first_extraction.py /path/to/current-main-checkout compares reconstructed source and all prepared output files. Also check extracted JavaScript syntax and hosted preview equality with live production.

After merge: check Pokédex names and thumbnails, open a regional form entry, and confirm its image and form label appear. Runtime remains Patch #279 / build 20261002184000 because the generated page is unchanged.
