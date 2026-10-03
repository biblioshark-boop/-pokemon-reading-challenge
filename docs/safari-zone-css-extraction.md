# Safari Zone stylesheet extraction

Baseline: 8023f68763b3b04be2b65e9a307d8be8b307ebe1 (main).

Move the contents of safariZoneSparseFix20260818 to styles/safari-zone.css. The build reinserts the exact CSS at its original style position before processing inline images. Source index.html drops from 2,880,452 to 2,264,790 bytes. Selectors, cascade, backgrounds, browser requests and runtime behavior remain identical.

Reconstructed source is byte-identical. Prepared HTML and all 117 generated files match baseline by SHA-256 with identical asset inputs. Missing file, duplicate marker and incorrect marker fail the build. Special event database mapping, shiny/catch logic, timers and pumpkin code are unchanged. Runtime remains Patch #279 / build 20261002184000. Authenticated gameplay was not separately exercised.

After merge: view regular Safari and Haunted Safari; check backgrounds, grass tiles and readable text, then refresh. No grass clicks, catches or progress changes required.
