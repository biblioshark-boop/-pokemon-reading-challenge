# Team background CSS extraction

Baseline: 6c54d04a59bcbb0307fe6a9deeae2ba3faf36294 (main).

Move only the contents of teamPageBackgroundsVisible20260818 into styles/team-page-backgrounds.css. The build reinserts the exact stylesheet in its existing style element before externalizing inline images. The original cascade, style ID, asset URLs and runtime behavior are preserved. Source index.html drops from 4,017,072 to 2,880,452 bytes. No added browser requests or loading-time changes are claimed.

Reconstructed source is byte-identical to baseline. Prepared HTML and all 117 generated output files match by SHA-256 with identical asset inputs. Missing stylesheet, duplicate marker and wrong marker fail the build. Runtime remains Patch #279 / build 20261002184000. Authenticated gameplay was not separately exercised.

After merge: check your current team's backgrounds on Home, Pokedex, Team Stats and Settings, then refresh. No team switching or progress changes needed.
