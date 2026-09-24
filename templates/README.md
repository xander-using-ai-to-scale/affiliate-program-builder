# templates/: the files every build copies

Each template is copied into `clients/<CLIENT_SLUG>/` at a set step, then filled for that client. Never fill a template here: this folder stays blank and generic.

**What does not belong here:** anything about a real client (it goes in `clients/<CLIENT_SLUG>/`, which is never committed), exact build settings (`spec/`), and build steps (`process/`).

## The templates

| Template | Copied to | When | Who fills it |
|---|---|---|---|
| [client-brief.md](client-brief.md) | `brief.md` | Step 0 ([0-intake](../process/0-intake.md)) | The AI session, from the client's context and the operator's answers |
| [blueprint.md](blueprint.md) | `blueprint.md` | Copied in step 0, filled in step 1 ([1-blueprint](../process/1-blueprint.md)) | The AI session drafts it; the operator approves it |
| [build-record.md](build-record.md) | `build-record.md` | Copied in step 0, kept up to date through every step, finished in step 9 | The AI session |
| [client-config.json](client-config.json) | `config.json` | Step 2 ([2-access-and-survey](../process/2-access-and-survey.md)); steps 3 to 6 add the structure and the ids | The AI session. Its own notes explain each key. It is owned with the tools: see [tools/README.md](../tools/README.md) |
| [flowcharts-data.js](flowcharts-data.js) | `flowcharts-data.js` | Step 9 ([9-handover](../process/9-handover.md)) | The AI session. The notes at its top say what to change. It is owned with the tools: see [tools/flowcharts/README.md](../tools/flowcharts/README.md) |
| [walkthrough-video.md](walkthrough-video.md) | `walkthrough-video.md` | Step 9 | The AI session writes the script; the approver approves the message; the operator records and sends the video |
| [partner-emails-DRAFT.md](partner-emails-DRAFT.md) | `partner-emails-DRAFT.md` | Step 9 | The AI session drafts them; the approver approves them. Not wired in v1 |

Blanks to fill are marked `<!-- FILL: ... -->`. A filled file has none left. Dates are written `YYYY-MM-DD`, and times `HH:MM` in the client's time zone.

The worked example, `examples/example-seo-agency/`, holds the first build's files filled in with the identifying details removed. See [examples/README.md](../examples/README.md).

## Placeholders

A placeholder is written in capitals, in angle brackets, and means the same thing in every file of this repo. Replace it with the client's value when you fill a copy.

| Placeholder | Means | Example |
|---|---|---|
| `<CLIENT_NAME>` | The client's business name | Example SEO Agency |
| `<CLIENT_SLUG>` | The client's folder name under `clients/`: lowercase, digits and dashes | `example-seo-agency` |
| `<PROGRAM_NAME>` | `<CLIENT_NAME> Partner Program`, unless the brief names it otherwise. The campaign and the funnel carry it | Example SEO Partner Program |
| `<CLIENT_OWNER>` | The client's owner or main contact | Alex Example |
| `<LOCATION_ID>` | The client's GHL sub-account id: the text after `/location/` in its web address | |
| `<TOKEN_FILE>` | The name of the file in `~/.secrets/` that holds the client's Private Integration token. Never the token | `Example SEO Agency GHL Token.txt` |
| `<PLACEHOLDER_USER>` | The operator's GHL user (name and login email). It holds every task, alert and the calendar until the client has a GHL user | |
| `<CLIENT_USER>` | The client's own GHL user, who takes over those slots in step 9 | |
| `<RATE_PERCENT>` | The partner's percentage, for the monthly percentage variant: a plain number, no `%` (texts add it) | `15` |
| `<FEE_AMOUNT>` | The fee, for the one-fee-per-closed-deal and pay-per-lead variants. Two forms: in a **field** (`Reward Amount`, the campaign's per-lead amount) the number only; in any **text** (task descriptions, the blueprint, flowcharts, emails, the walkthrough) with its currency sign, and never a `%` after it ([spec/variants.md](../spec/variants.md)) | field `250`; text `$250` |
| `<PAYOUT_DAY>` | The day a client who pays partners in one monthly run pays them, in the client's words ([spec/variants.md](../spec/variants.md), "A monthly payout run") | `the 15th` |
| `<REFER_FORM_ID>` | The id of the Refer a Client form | |
| `<SIGNUP_FORM_ID>` | The id of the Partner Sign-Up form | |
| `<STAFF_FORM_ID>` | The id of the Staff Attribution form | |
| `<FORM_ID>` | Any one form's id, where a step applies to each form | |
| `<INSTANTLY_WEBHOOK_URL>` | The URL of workflow 1's Inbound Webhook trigger (`instantly.webhookUrl` in the config) | |
| `<CLIENT_DOMAIN>` | The client's domain, once connected to GHL | |
| `<PAGE_ID>` | The id in the Become a Partner page's preview link | |
| `<OPP_ID>` | A test deal's id, in the commission test (step 8) | |
| `<VIDEO_LINK>` | The walkthrough video's link | |
| `<REPO_LOCATION>` | Where the session finds this repo: a GitHub link, a folder path or the release zip (`BUILD-PROMPT.md`) | |
| `<USES_INSTANTLY>` | Whether the client runs cold email in Instantly: yes, no or not sure (`BUILD-PROMPT.md`) | |
| `<PLACEHOLDER_USER_ID>` | The GHL user id of `<PLACEHOLDER_USER>`: `calendarOwnerUserId` in `client-config.json` (`survey.js` lists it) | |
| `<PARTNER_TYPE_1>`, `<PARTNER_TYPE_2>`, ... | The client's partner types, in `client-config.json` | Web Design / Development |
| `<SEGMENT_1>`, `<SEGMENT_2>`, ... | The client's segment tag names after `segment/`, in `client-config.json` | `web-design` |
| `<PAYOUT_TERMS>` | The Affiliate Manager campaign's payout terms, as the flowcharts print them (`flowcharts-data.js`) | `Net-15` |
| `<BUILD_DATE>` | The day or days the build was done, as the flowcharts print them (`flowcharts-data.js`) | `Sep 21–22 2026` |
| `<TEST_DATE>` | The day the step 8 tests passed, as the flowcharts print it (`flowcharts-data.js`) | `Sep 22` |
| `<N>`, `<M>` | A number the session fills in when it writes the line: a count (questions, workflows, items created or skipped), a section number in a "Blocked at step" message, or a workflow version (`published v<N>`) | `3` |

Placeholders added after `docs/REPO-SPEC.md` §5: `<CLIENT_OWNER>`, `<FEE_AMOUNT>`, `<PAYOUT_DAY>`, `<FORM_ID>`, `<PAGE_ID>`, `<OPP_ID>`, `<VIDEO_LINK>`, `<REPO_LOCATION>`, `<USES_INSTANTLY>`, `<PLACEHOLDER_USER_ID>`, `<PARTNER_TYPE_n>`, `<SEGMENT_n>`, `<PAYOUT_TERMS>`, `<BUILD_DATE>`, `<TEST_DATE>`, `<N>`, `<M>`. Any new one is added to this table.

Not a placeholder: `<X_1>` in `tools/ghl/selftest.js` is test data that checks the placeholder finder. Never fill it.
