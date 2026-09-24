# tools/

The scripts that build, check and test a client's affiliate program in GoHighLevel (GHL), draw its flowcharts, and look after this repo.

**What is here:** `ghl/` (the GHL scripts, details in [ghl/README.md](ghl/README.md)), `flowcharts/` (the flowchart renderer, details in [flowcharts/README.md](flowcharts/README.md)), `check-repo.js` (the repo's checker) and `build-zip.js` (the release zip).
**What does not belong here:** client data of any kind (it goes in `clients/<CLIENT_SLUG>/`), tokens, and anything that needs `npm install`.

Every script needs Node 18 or newer and nothing else: no npm installs. Run them from the repo root.

## Every script

"Writes to GHL" means it changes the client's account. Every script that touches GHL prints the account's name and id first. Replace `<CLIENT_SLUG>` with the client's folder name under `clients/`.

| Script | Writes to GHL? | Command | Needs | Prints |
|---|---|---|---|---|
| `ghl/survey.js` | No, reads only | `node tools/ghl/survey.js --client <CLIENT_SLUG>` | The config, the token | The account's users, pipelines, deals, fields, tags, calendars, workflows, forms and contacts |
| | No | `node tools/ghl/survey.js --client <CLIENT_SLUG> --ids` | Same | Only JSON: the `"ids"` block to paste into the config |
| | No | `node tools/ghl/survey.js --client <CLIENT_SLUG> --json` | Same | The raw structure reads, as JSON |
| `ghl/build-structure.js` | No | `node tools/ghl/build-structure.js --client <CLIENT_SLUG> --dry-run` | The config with its `structure` filled in, the token | The plan: each field, tag, pipeline and the calendar, "would create" or "exists, skipped" |
| | **Yes** | `node tools/ghl/build-structure.js --client <CLIENT_SLUG>` | Same | Each item created or skipped, then `Done: N created, N skipped, N failed.` |
| | No, and no token | `node tools/ghl/build-structure.js --config <path> --offline` | A config (ids may be placeholders) | The plan as if the account were empty. Works with `examples/example-seo-agency/config.json` |
| `ghl/double-check.js` | No | `node tools/ghl/double-check.js --client <CLIENT_SLUG>` | The config with `ids`, the token | PASS or FAIL per field, tag, pipeline, calendar, workflow and form, then `ALL CHECKS PASS` or `N FAIL(S)` (exit code 1) |
| `ghl/verify-test.js` | No | `node tools/ghl/verify-test.js --client <CLIENT_SLUG> <email>` | The token | One contact: fields, tags, deals (with their ids), notes, tasks |
| `ghl/fire-test.js` | **Yes** (through the workflow) | `node tools/ghl/fire-test.js --client <CLIENT_SLUG> test.instantly1@example.com` | `instantly.webhookUrl` in the config | The webhook's answer |
| `ghl/enroll.js` | **Yes** | `node tools/ghl/enroll.js --client <CLIENT_SLUG> <scenario>` | The config with `ids` | The upsert and the enrollment. Scenarios: `claimA`, `claimB`, `staffC`, `partnerD`, `partnerE`, `claimE` |
| `ghl/move-stage.js` | **Yes** | `node tools/ghl/move-stage.js --client <CLIENT_SLUG> <opportunityId> "<Stage Name>" [revenue]` | The config with `ids` | The move. Test deals only |
| `ghl/selftest.js` | No, never touches GHL | `node tools/ghl/selftest.js` | Nothing | One line per test, then `N/N passed` (exit code 1 on a failure) |
| `flowcharts/render.js` | No, never touches GHL | `node tools/flowcharts/render.js clients/<CLIENT_SLUG>/flowcharts-data.js --pdf` | Edge or Chrome | The HTML and PDF paths, then a layout check per page ending in `No problems` |
| `check-repo.js` | No, never touches GHL | `node tools/check-repo.js` (`--strict` before a release) | `clients/check-repo.forbidden.txt` | PASS, FAIL or SKIP for each of the 8 rules in [REPO-SPEC §7](../docs/REPO-SPEC.md) |
| `build-zip.js` | No, never touches GHL | `node tools/build-zip.js` | A `## x.y.z` heading in `CHANGELOG.md` | The zip's path and size, and that it read back correctly |

`--client <CLIENT_SLUG>` can also be written `--config <path to a config file>`, or set once with the environment variable `GHL_CLIENT=<CLIENT_SLUG>`.

## The token rules

1. Use the client's **sub-account** Private Integration token (GHL: Settings → Private Integrations), with the scopes in [process/2-access-and-survey.md](../process/2-access-and-survey.md), section 2.2. An agency token fails with "user type mismatch".
2. Save it alone in a file in `~/.secrets/` (on Windows, `C:\Users\<you>\.secrets\`), for example `~/.secrets/Example SEO Agency GHL Token.txt`.
3. The config holds only that file's **name**, in `"tokenFile"`. The scripts refuse a `tokenFile` that looks like a token, or that is a path.
4. The token is never printed, never copied and never committed. If it ever lands in a file anywhere else, rotate it in GHL.

## What a build keeps in `clients/<CLIENT_SLUG>/`

`clients/` is in `.gitignore`: nothing in it is ever committed. The tools read and write these files there:

| File | From | Used by |
|---|---|---|
| `config.json` | A copy of [templates/client-config.json](../templates/client-config.json), renamed | Every script in `ghl/`. It holds `locationId`, `tokenFile`, `calendarOwnerUserId`, `instantly.webhookUrl`, the `structure` changes and the `ids` |
| `flowcharts-data.js` | A copy of [templates/flowcharts-data.js](../templates/flowcharts-data.js) | `flowcharts/render.js`. It reads the ids from `config.json` next to it |
| `flowcharts.html`, `flowcharts.pdf` | Written by `flowcharts/render.js` | The handover |

The other build files there (the brief, the blueprint, the build record) are described in [process/](../process/README.md). `clients/check-repo.forbidden.txt` (the first client's identifiers, one per line) is read by `check-repo.js`.

## The order during a build

The process files say when; this is the order of the commands.

1. `node tools/ghl/survey.js --client <CLIENT_SLUG>`: what the account already has. Nothing is changed.
2. `node tools/ghl/build-structure.js --client <CLIENT_SLUG> --dry-run`: read the plan.
3. `node tools/ghl/build-structure.js --client <CLIENT_SLUG>`: build the fields, tags, pipelines and calendar.
4. `node tools/ghl/survey.js --client <CLIENT_SLUG> --ids`: paste the output into `config.json` as `"ids"`. Again after the forms and workflows are built in the GHL UI.
5. `node tools/ghl/double-check.js --client <CLIENT_SLUG>`: workflows and forms FAIL until they are built; at the end, `ALL CHECKS PASS`.

The tests, in order. After each one, `node tools/ghl/verify-test.js --client <CLIENT_SLUG> <email>` shows what the workflows did.

1. `fire-test.js ... test.instantly1@example.com`, twice (only if the client uses Instantly).
2. `enroll.js ... claimA`, then `claimB`, then `staffC`, then `partnerD`.
3. `move-stage.js ... <the deal id of test.referral2@example.com> "Sold / Enrolled" [revenue]`, then `"Commission Approved"`, then `"Commission Paid"`. The optional revenue (the first build passed `1500`) goes into `Client Monthly Revenue`; omit it for the fee and per-lead variants, where that field has no meaning. The full test 5, per variant, is in [process/8-test.md](../process/8-test.md), section 8.7.
4. `enroll.js ... partnerE`; wait about a minute for the Affiliate Link workflow; then `enroll.js ... claimE`.

Test contacts always use `@example.com`, and every phone number is a fictional 555-01xx number. The scripts never delete anything: test records are deleted by hand in GHL after review.

## Looking after the repo

- `node tools/ghl/selftest.js` after any change to `tools/ghl/`.
- Before a release: bump `CHANGELOG.md`, `node tools/build-zip.js`, then `node tools/check-repo.js --strict`. The zip comes before the checker, because rule 5 compares the zip with the files.
