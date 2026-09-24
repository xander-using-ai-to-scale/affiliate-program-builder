# Step 0 · Intake

Turn the client's context into a complete client brief. List every gap as a question for the operator. Ask; do not guess.

| | |
|---|---|
| **Owner** | The AI session. The operator answers questions |
| **Time** | Not timed in the first build. Estimate: 15–30 minutes, plus the operator's answers |
| **Needs** | The client's context: call transcripts, notes, emails, the client's website link |
| **Makes** | `clients/<CLIENT_SLUG>/brief.md`, plus `blueprint.md` and `build-record.md` copied there for later steps |
| **Done when** | Every field in the brief has an answer, a source and a confidence, and no blocking field is open |

## 0.1 · Create the client folder

1. Choose the client slug: the client's business name in lowercase, with a dash between words. Example: `example-seo-agency`.
   **Check:** the slug uses only `a`–`z`, `0`–`9` and `-`, and starts with a letter or a digit. The tools refuse any other slug.
2. Create the folder `clients/<CLIENT_SLUG>/` in the repo root.
   **Check:** the folder exists. In a git clone, `git status --short` does not list it, because `.gitignore` keeps `clients/` out of git. If git lists it, stop: see "If a step fails".
3. Copy `templates/client-brief.md` to `clients/<CLIENT_SLUG>/brief.md`.
   **Check:** the file exists and still holds its `<!-- FILL` markers.
4. Copy `templates/blueprint.md` to `clients/<CLIENT_SLUG>/blueprint.md`.
   **Check:** the file exists.
5. Copy `templates/build-record.md` to `clients/<CLIENT_SLUG>/build-record.md`.
   **Check:** the file exists.
6. In `build-record.md`, fill the header: the client's name, the slug, today's date, and the repo version from `CHANGELOG.md`. Add the first log line: `YYYY-MM-DD HH:MM · Step 0 started`.
   **Check:** the header has no `<!-- FILL` marker left, and the log has its first line.

## 0.2 · Read and sort the context

1. Read every context file in full, from start to finish. Transcripts often mention the program only once, late in the call.
   **Check:** you can name each file, its date, and what it is (a call, notes, a website).
2. Mark each passage as **about this client's program** (the business, the offer, partners, commission, payouts, people, calendar, domain, tools, access, compliance) or **not about it** (other projects, other clients, small talk).
   **Check:** every passage you plan to use is about this client's program.
3. Use only the first kind. Write each topic you left out under "Context not used" at the end of the brief, one line each, for example "Content strategy: a separate project".
   **Check:** "Context not used" is filled, or says `none`.
4. Write the context files you read into the brief's "Context read" line.
   **Check:** every file from action 1 is listed.

## 0.3 · Fill the brief

The brief has 16 fields. Each one says why the build needs it.

1. For each field, write the **Answer**: specific and short, in the client's own words.
   **Check:** no answer is vague ("good commission", "some partners"). Numbers, names and lists are written out.
2. For each field, write the **Source**: the context file plus a quote of 15 words or fewer, or `operator answer, YYYY-MM-DD`, or `default`.
   **Check:** every answer has a source.
3. For each field, write the **Confidence**: `confirmed` (stated plainly), `inferred` (you concluded it from the context) or `default` (from the table below).
   **Check:** no guess is marked `confirmed`.
4. Where the context is silent, use the default from the table below, and mark it `default`.
   **Check:** every `default` answer matches the table.

| Field | Default when the context is silent |
|---|---|
| 1. Program name | `<CLIENT_NAME> Partner Program` |
| 1. Time zone | The sub-account's time zone, read in step 2 (the survey prints it). Step 2.4 checks it against the client's |
| 4. Tiers and partnership kinds | The standard options in [spec/structure.json](../spec/structure.json): `Partner Tier` = Tier 1 / Tier 2 / Tier 3; `Partnership Type` = Referral / White Label |
| 6. How partners are paid | Payout terms `Net-15`: the commissions approved in a month are paid on the 15th of the next month (GHL's words: "15 days after month ends"). The client's staff pay partners by hand from the payout task. The `Payment Preference` options stay standard (ACH, Check, PayPal, Gift Card, Service Credit, Other) |
| 7. Who handles partners | `<PLACEHOLDER_USER>` holds every task, alert and the calendar until the client has a GHL user |
| 8. Calendar rules | The standard Partner Intro Call in [spec/structure.json](../spec/structure.json). Hours, owner and video link stay placeholders until the client sets them at handover |
| 9. Domain | None yet. The forms use GHL's own link, and the Become a Partner page waits |
| 12. A2P (SMS) | Not approved. SMS stays off |
| 13. Stripe | Not connected. Commissions run in the Referred Leads pipeline |
| 14. Compliance | The standard rules: no earnings promises, no income claims, no medical claims, never "franchise". The referral-fee question has **no default**: see below |

Fields 1 (the client's name), 2, 3 and 5 have **no default**. They are **blocking**: the blueprint cannot be written without them. Fields 10 (cold email) and 11 (GHL access) have no default either, but they do not block the blueprint: the blueprint lists them as open items, and step 2 settles access.

**How the client pays maps to the campaign's payout terms** with the rule in [spec/affiliate-manager.md](../spec/affiliate-manager.md), section 2, "Payout Terms". "Monthly" with no day named means `Net-15`: do not ask. Ask only when the client names a day that no option matches.

**The referral-fee question (field 14) blocks the launch, not the build.** Some partners hold a licence or owe a duty to the person they refer: real-estate agents and brokers, insurance agents and adjusters, home inspectors, mortgage and finance roles (loan officers, brokers, advisers), clinicians, lawyers, accountants. Their law or licence rules may limit a referral fee, forbid it, or require it to be disclosed. So for **each partner type** in field 3 the brief asks: "Can this partner type legally receive a referral fee in the client's state and industry?" The client answers per type, themselves or with their counsel, in writing. We never answer it, never guess it from the context, and give no legal advice. A type with no written yes may still be built into the dropdown, but it is not recruited and the program does not launch to it: the blueprint lists it in section 13 as a launch blocker.

## 0.4 · Find the gaps

1. List every field that is empty, or `inferred` where a wrong answer would change the blueprint (the variant, the rate, the partner types, the workflows built). These are the gaps. A `default` is not a gap, but the operator sees every default in the blueprint and can change it there.
   **Check:** test each `inferred` field: "If this answer were different, would the blueprint change?" Yes means it is a gap.
2. Mark each gap **blocking** (fields 1, 2, 3, 5), **blocks launch** (field 14's referral-fee answer for a partner type) or **can wait** (any other field). A gap that can wait becomes an open item in the blueprint. A gap that blocks launch becomes a row in the blueprint's section 13; it does not hold up step 1.
   **Check:** every gap is marked. Every partner type in field 3 has a referral-fee answer, or is marked **blocks launch**.

## 0.5 · Ask the operator

1. Write the gap questions: at most 5 in one message, numbered, one decision each. Give each a recommended answer first, marked `(recommended)`, plus 1 to 3 alternatives, so the operator can reply "go" or "2: B". Blocking gaps come first.
   **Check:** 5 questions or fewer, each with a recommended answer. No GHL jargon the operator would have to look up.
2. Start the message with the state line `Step 0 · Intake · <N> questions`, and send it.
   **Check:** the message is sent. Wait for the answer.
3. Write each answer into the brief's "Gaps and answers" table with the date. Update the field: its answer, its source (`operator answer, YYYY-MM-DD`) and its confidence (`confirmed`).
   **Check:** every answered question is in the table, and its field is updated.
4. If the operator does not know an answer, add the question to "Ask the client" in the brief. The operator asks the client.
   **Check:** each unknown answer is in "Ask the client".
5. If a blocking gap is still open, ask a second round with actions 1–4. Never fill a blocking gap with a guess.
   **Check:** every blocking field (1, 2, 3, 5) is `confirmed`. If one is not, wait for the client's answer before step 1.

## 0.6 · Close the brief

1. Reread the brief from top to bottom.
   **Check:** no `<!-- FILL` marker is left. Every field has an answer, a source and a confidence.
2. Add a log line to the build record: `YYYY-MM-DD HH:MM · Step 0 done · brief complete`.
   **Check:** the line is in the log.
3. Send the operator one line: `Step 0 done · brief complete · writing the blueprint now`.
   **Check:** the message is sent.

## If a step fails

- **The context says little or nothing about the program.** Ask the operator for the call transcript or notes where the program was discussed. Do not start the brief from guesses.
- **Two context files disagree** (for example two different rates). Quote both, with their dates, and ask the operator which one is current.
- **git lists `clients/`.** The `.gitignore` is missing or changed. Stop and tell the operator. Never commit a client folder.
- **The operator cannot answer a blocking gap.** It goes to "Ask the client". Wait for the client's answer. Step 1 does not start until every blocking field is `confirmed`.
- **Anything else.** Retry the action once. If it fails again, tell the operator: `Blocked at step 0.<N>: <what happened>. Need from you: <one thing>.` Then wait.
