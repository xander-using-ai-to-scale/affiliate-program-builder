# tools/ghl/

The scripts that build and check the standard affiliate program in a client's GoHighLevel (GHL) sub-account, and stand in for forms during the tests. They are the first build's scripts (Sep 21–22 2026), made reusable. The build steps that use them are in [process/](../../process/README.md).

**What is here:** the scripts below, `structure.default.json` (the fallback copy of the standard structure) and `selftest.js`.
**What does not belong here:** client configs (they go in `clients/<CLIENT_SLUG>/config.json`), tokens, and client-specific code. Anything that differs per client goes in the client's config, never in a script.

Node 18 or newer, no npm installs. Run from the repo root.

## Before you run anything

### 1. The token

- The client's **sub-account** Private Integration token, created in GHL under Settings → Private Integrations. An agency token fails with "user type mismatch".
- Scopes: the one list is in [process/2-access-and-survey.md](../../process/2-access-and-survey.md), section 2.2 (view and edit Contacts, Opportunities, Custom Fields, Tags, Calendars; view Users, Workflows, Locations, Forms). If forms are not readable, the scripts keep the form ids already in the config (a form's id is in its builder's address).
- Save it alone, on one line, in a file in `~/.secrets/`. The config holds only the file's name.
- `ghl.js` reads it at the first API call and never prints it. It refuses a `tokenFile` that looks like a token (it starts with `pit-`, is a JWT, or is 40+ characters with no dot) or that is a path.
- Every call sends a browser User-Agent. Without one, Cloudflare answers **error 1010**, which looks like an auth failure but is not.

### 2. The config

Copy [templates/client-config.json](../../templates/client-config.json) to `clients/<CLIENT_SLUG>/config.json` and fill in every placeholder. Its `_readme` keys explain each part.

| Key | What it is |
|---|---|
| `client` | The business name, for messages |
| `locationId` | The sub-account id: the part after `/location/` in the GHL address |
| `tokenFile` | The name of the token file in `~/.secrets/` |
| `calendarOwnerUserId` | The GHL user id of the placeholder person (`<PLACEHOLDER_USER>`), who owns the calendar until the client has a user. `survey.js` lists the users |
| `instantly.webhookUrl` | Only with Instantly: the Inbound Webhook URL of "Instantly - Interested Partner Reply" |
| `structure` | This client's changes to the standard structure (below) |
| `ids` | What was built, written by `survey.js --ids`, checked by `double-check.js` |

Choosing the config: `--client <CLIENT_SLUG>` reads `clients/<CLIENT_SLUG>/config.json` in the repo root (the folder with `docs/REPO-SPEC.md`). `--config <path>` reads any file. `GHL_CLIENT=<CLIENT_SLUG>` stands in for `--client`. A placeholder still in `client`, `locationId` or `tokenFile` stops every script except `build-structure.js --offline`.

### 3. The structure

The standard structure is `spec/structure.json`: 29 contact fields, 7 opportunity fields, 24 tags, 3 pipelines, the Partner Intro Call calendar, and the names of the 8 workflows and 3 forms. If `spec/structure.json` is missing, the scripts use `tools/ghl/structure.default.json`, the first build's copy, and say so on a line that starts `Standard structure:`. Keep the two the same: `selftest.js` fails when they differ.

A client's `structure` changes it like this:

| Key | Effect |
|---|---|
| `remove.fields` / `.tags` / `.pipelines` / `.workflows` / `.forms` | Drops those names from the standard |
| `fields.contact`, `fields.opportunity`, `pipelines` | The same name replaces the standard entry; a new name is added |
| `tags`, `workflows`, `forms` | Added to the standard list, with no duplicates |
| `calendar` | Its keys replace the standard calendar's; `null` means no calendar |

Example: a client who wants one more Lost Reason option repeats the whole field with its options: `{ "name": "Lost Reason", "dataType": "SINGLE_OPTIONS", "options": ["No fit", "Not interested", "No response", "Bad timing", "Already has a provider", "Do not contact"] }`.

Always client-specific, so the build stops until the config sets them: the Partner Type options, the calendar slug, and `calendarOwnerUserId`. The `segment/` tags are client-specific too. Tags are written in lower case, as GHL stores them. Keys that start with `_` are notes and are never sent to GHL.

## The scripts

| Script | Writes to GHL? | What it does |
|---|---|---|
| `ghl.js` | No | The shared helper: config, token, API calls, the structure merge. Not run on its own |
| `survey.js` | No | Inventory of the account. `--ids` prints only the `"ids"` JSON (notes go to stderr). `--json` prints the raw structure reads |
| `build-structure.js` | **Yes** | Creates the custom fields, tags, pipelines and calendar. Skips anything that exists by name and flags it if its type or stages differ. Never renames, edits or deletes. `--dry-run` reads the account and prints the plan. `--offline` prints the plan with no account and no token |
| `double-check.js` | No | PASS/FAIL: every field (once, type, options), tag, pipeline (stage order), the calendar (length, days, slug, active), every workflow (once, published) and form, and every id in the config against the account. Lists deals and leftover test contacts. Exit code 1 on any FAIL |
| `verify-test.js <email>` | No | One contact as the workflows left it: fields, tags, deals with their ids and fields, notes, tasks |
| `fire-test.js <email>` | **Yes** | Posts a synthetic Instantly "lead_interested" payload to `instantly.webhookUrl`. `@example.com` leads only. Refuses a webhook URL of another location. It also gives the workflow's trigger its first sample |
| `enroll.js <scenario>` | **Yes** | Stands in for a form: upserts an `@example.com` test contact with what the form writes, then enrolls it in the form's workflow. The public forms have a Cloudflare bot check, which we never work around |
| `move-stage.js <oppId> "<Stage>" [revenue]` | **Yes** | Moves a test deal to a stage, as a drag would, so the commission workflows run. Refuses deals whose contact is not `@example.com`. The revenue goes into Client Monthly Revenue |
| `selftest.js` | No | Offline tests of all of the above against a fake account (below) |

### The test scenarios (`enroll.js`)

| Scenario | Contact | Workflow | Expected |
|---|---|---|---|
| `claimA` | `test.referral1@example.com`, phone +1 555-555-0144, claim by TEST-PARTNER-A | Referral Capture | A has the credit; a deal at Referral Received; the follow-up task |
| `claimB` | the same contact, claim by TEST-PARTNER-B | Referral Capture | A keeps the credit; conflict tag, Conflicting; the deal at Attribution Review; the review task |
| `staffC` | `test.referral2@example.com`, phone +1 555-555-0145, claim by TEST-PARTNER-C | Staff Attribution | C has the credit, method Staff Entered |
| `partnerD` | `test.partner.d@example.com`, phone +1 555-555-0142 | Partner Sign-Up | Partner fields, the rate, the link, both tags, the Onboarding deal, the task. `Partner Type`, `Partnership Type` and `Payment Preference` get the first option of the client's own list (`ACH` in the standard) |
| `partnerE` | `test.partner.e@example.com`, last name `PartnerE` (no space), phone +1 555-555-0143 | Partner Sign-Up | As partnerD, plus: E is an affiliate in the campaign, and the Affiliate Link workflow writes E's link and Referral Code |
| `claimE` | `test.referral3@example.com`, phone +1 555-555-0146, claim read off E's contact | Referral Capture | E has the credit; the lead shows under E in the Affiliate Manager |

`claimE` reads E's Partner ID and Referral Code off E's contact, and E's name from the contact read by id (the search returns names in lower case). It stops if the Affiliate Link workflow has not written E's Referral Code yet: wait a minute and run it again.

## The selftest

`node tools/ghl/selftest.js` runs 60 offline tests in about a minute. It copies the scripts into a temporary repo, makes a fake home folder with a fake token, and runs each script as a separate process against a fake GHL account (`fetch` replaced; nothing goes on the network). It proves config resolution, the structure merge, the dry-run and offline plans, skip-if-exists, the guards (non-example emails, a pasted token, a webhook of another location, real deals), the double-check PASS/FAIL logic, every scenario, that every call carries the browser User-Agent, and that the token is never printed. `--keep` keeps the temporary folder.

## If something fails

| You see | Cause and fix |
|---|---|
| `403` with `error code: 1010` | A request without a browser User-Agent. `api()` in `ghl.js` always sends one; a new script must use `api()` |
| `401` | The token file holds the wrong token, an agency token, or a token without the scopes above |
| `forms: not readable with this token` | The token cannot read forms. The form ids stay as they are in the config; take them from each form builder's address |
| `No config at clients/<slug>/config.json` | Copy `templates/client-config.json` there (named `config.json`) |
| `"tokenFile" looks like a token` | The token was pasted into the config. Move it to a file in `~/.secrets/`, put the file's name in the config, and rotate the token |
| `Nothing built. Fix ... first` | The listed parts of the structure are missing or still placeholders |
| `exists, skipped ⚠` | The account already has that name with another type or other stages. The build never changes it: decide with the operator |
| `has no ids...` | Run `survey.js --ids` and paste the block into the config |
