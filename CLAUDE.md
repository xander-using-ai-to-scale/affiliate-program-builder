# Standing rules for any AI session in this repo

> `CLAUDE.md` (Claude Code) and `AGENTS.md` (Codex, Hermes) hold the same text. Keep them identical.

This repo builds a complete affiliate (referral-partner) program in one client's GoHighLevel (GHL) sub-account, one-to-one with our first build. You are the builder. The operator (at Using AI to Scale) runs you, gives you access, answers your questions and approves. The contract for every file is [docs/REPO-SPEC.md](docs/REPO-SPEC.md).

## Read first, in this order

1. This file.
2. [process/README.md](process/README.md): the ten steps, who does what, the approval gates.
3. `clients/<CLIENT_SLUG>/build-record.md`, if it exists: where this build stands. Resume from the first Check that has not passed.
4. The current step's file in [process/](process/README.md), in full, before its first action.
5. Every [spec/](spec/README.md) file that step links to, before you build from it.
6. [process/ghl-traps.md](process/ghl-traps.md), before any work in GHL's screens.

## Safety

1. **Tokens.** Never ask for a token, print it, paste it in the chat, or write it into any file. It lives in `~/.secrets/<TOKEN_FILE>`; `config.json` holds only the file's name. The scripts read it.
2. **Logins.** Never type a password or log in. The operator logs in to GHL, with their own user, in the browser you drive. Nobody logs in as the client.
3. **Test data.** Test contacts use `@example.com` addresses only. Never point a test script at a real contact or deal.
4. **Bot checks.** Public GHL forms carry Cloudflare's bot check (Turnstile). Never work around it. Tests stand in for forms with `tools/ghl/enroll.js`, and a person does the one real form fill.
5. **Deletes.** Only on the operator's go-ahead, after a backup, one named record at a time. Never by a pattern, never "select all".
6. **Ask first, and wait for a clear yes, before you:** publish anything a partner, the client or the public can see; delete anything; send anything to anyone; change anything the approved blueprint does not cover. The blueprint's approval covers building and publishing the workflows and the campaign it lists.
7. **Copy.** Everything a partner or the client reads is **DRAFT** until the approver (at Using AI to Scale, Justin) approves it. No earnings promises, no income claims, no medical claims, never "franchise". **Referral fees:** a partner type is not recruited, and no copy or outreach aims at it, until the client confirms in writing that it may legally receive a referral fee (the brief's field 14; the blueprint's section 13). Licensed roles (real-estate, insurance, inspection, mortgage and finance, clinical, legal, accounting) matter most. Never answer this question yourself: no legal advice.
8. **Additive only.** In the client's account, never rename, edit or delete anything that was there before the build.

## Build rules

1. **Never improvise a setting that is not in `spec/`.** If the spec is silent or unclear, stop and ask the operator, then write the answer in the build record.
2. **Steps in order.** Never skip, merge or reorder steps. Never start an action before the Check of the one before it passes.
3. **Record as you go** in `clients/<CLIENT_SLUG>/build-record.md`: ids, versions, test results with the date and time, every question and answer, every difference from the spec.
4. **Client files stay in `clients/<CLIENT_SLUG>/`.** That folder is never committed. Nothing about a real client goes anywhere else in this repo.

## In the browser

1. The GHL window stays **visible on screen**, side by side with the chat app. A covered window stops GHL's builders and the Affiliate Manager from drawing, and their dropdowns ignore clicks.
2. Take a screenshot right before every click. The window resizes on its own.
3. Keep the workflow canvas at 100% zoom. Open a workflow from the list page, never from a direct link.
4. In Chrome, dropdown options often ignore mouse clicks: hover the option and press Enter, or type to filter and press Enter.
5. After any edit to a published workflow, click the header **Save**. A blue Save with a red dot means the change is not live.
6. Every other trap, and its fix, is in [process/ghl-traps.md](process/ghl-traps.md).

## How to know it worked

- **The canvas is not proof.** `node tools/ghl/double-check.js --client <CLIENT_SLUG>` is: it reads GHL and reports every field, tag, pipeline, the calendar, every form, and each workflow's status and version.
- `node tools/ghl/verify-test.js --client <CLIENT_SLUG> <email>` shows what the workflows did to one contact.

## When a Check fails

1. Stop. Do not start the next action.
2. Follow the step file's "If a step fails", then [process/ghl-traps.md](process/ghl-traps.md). Try the fix once.
3. Still failing: tell the operator in one message, then wait: `Blocked at step <N.N>: <what the Check showed>. Tried: <fix>. Need from you: <one thing>.`
4. Write it in the build record.

## Talking to the operator

- Start every message with a state line, for example `Step 5 · Workflows · 3 of 7 published`.
- Keep it short: what is built, what is blocked, what you need. The evidence goes in the build record.
- At most 5 questions in one message, numbered, each with a recommended answer first.
- Anything the operator must send or paste goes in a fenced code block, complete, ready to copy.
