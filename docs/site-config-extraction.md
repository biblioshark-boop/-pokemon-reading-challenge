# Pokémon cleanup: Step 7 of 16

Moved REGIONS, THEMES, TEAM_THEMES (including the existing Team Star assignment), and DEFAULT_GENRES from index.html into source-fragments/site-config.js without editing their contents.

The build restores the exact fragment at its original script position. There are no new browser requests, runtime changes, database changes, or changes to other sites. The save conflict guard and special event controls remain unchanged.

Validation: run python scripts/validate_first_extraction.py /path/to/current-main-checkout. It compares fully reconstructed source and all prepared output files against current main. JavaScript syntax and deployed preview HTML are also checked.

After merge: check the region filter, current team colors, and genre choices in a book form. Runtime metadata remains Patch #279 / build 20261002184000 because the generated page is unchanged.
