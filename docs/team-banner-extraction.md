# Team banner artwork extraction

Baseline: 82f7be0280b5da66093eba05b618a59bbde7bf1b (main).

Move only TEAM_CARD_BANNERS into source-fragments/team-card-banners.js. The existing build inserts its exact declaration in its original script position. Source index.html drops from 13,912,602 to 4,017,568 bytes. Browser payload, requests, execution order and gameplay are unchanged. Serve the built dist/ output.

The validator now reconstructs both checkouts, allowing baselines that already use source fragments. Reconstructed source is byte-identical. Prepared HTML and all 117 generated files match main by SHA-256 with identical asset inputs. Missing, duplicate and invalid-JSON banner fragments fail the build. Runtime remains Patch #279 / build 20261002184000.

After merge: open My Team and confirm team banners display; switch away and back, then refresh. No progress changes are needed. Authenticated gameplay was not separately exercised.
