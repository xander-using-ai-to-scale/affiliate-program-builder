# Step 9 · Handover

Hand the program to the client so they never have to figure out what we built: the flowcharts PDF, a 2-minute walkthrough video, the partner emails for approval, the person slots moved to the client's user, the calendar rules, and the staff routines. Finish and file the build record.

| | |
|---|---|
| **Owner** | The AI session writes everything. The approver approves the copy. The operator records and sends the video, and runs the call with the client |
| **Time** | About 1 hour plus one call with the client (estimate) |
| **Needs** | Step 8 done: tests 0 to 7 pass |
| **Makes** | The flowcharts PDF, `walkthrough-video.md`, `partner-emails-DRAFT.md`, and the finished `build-record.md`, all in `clients/<CLIENT_SLUG>/` |
| **Done when** | The video is sent, the test records are deleted, every person slot holds the client's user (or the swap is an open item), and the build record is complete and filed |

> Justin's rule, from the Sep 24 2026 huddle: "we don't leave it up to a client to figure out what we did." Every build ends with a short video that shows the client where everything is.

## 9.1 · The flowcharts PDF

1. Copy `templates/flowcharts-data.js` to `clients/<CLIENT_SLUG>/flowcharts-data.js`.
   **Check:** the file exists.
2. Read the notes at the top of the file. They say which values are the client's and how pages and boxes are written.
   **Check:** you know every value to change.
3. Change the client's values in the file's CLIENT VALUES block: the client's name and the program name, the rate or fee, the placeholder person's name, the payout terms, the build and test dates, the calendar, and the Instantly and domain switches. The ids, the location id and the segment tags come from `config.json` by themselves; the partner types are not on the pages.
   - Monthly percentage: `VARIANT = 'monthly'`, `RATE` = the percentage as a plain number (`'15'`).
   - One fee per closed deal: `VARIANT = 'fee'`, `RATE` = the fee as text with its currency sign (`'$250'`). The pages change by themselves (the file's notes list them).
   - Pay per lead, a renamed stage or an extra pipeline: change the pages by hand, as the file's notes, [spec/variants.md](../spec/variants.md) and the blueprint describe.
   **Check:** no `<` placeholder from the template is left (search for `<`, then for the placeholder names in [templates/README.md](../templates/README.md)). Every name matches the build record. `VARIANT` matches the blueprint's section 2.
4. Run `node tools/flowcharts/render.js clients/<CLIENT_SLUG>/flowcharts-data.js --pdf`.
   **Check:** it prints `HTML:` and `PDF:` lines, **no `warning:` line** (no placeholders left, no fee printed with a `%` after it), and its layout check ends "No problems: no overlaps, no arrows through boxes, no arrows to nothing, no small text." [tools/flowcharts/README.md](../tools/flowcharts/README.md) explains the check.
5. Open the PDF and page through it.
   **Check:** every pipeline and every workflow built has its page, and every name matches GHL. Close the PDF before any re-run: an open PDF blocks the rewrite.
6. Write the PDF's path into the build record.
   **Check:** the path is in the build record.

## 9.2 · The walkthrough video script (DRAFT)

1. Copy `templates/walkthrough-video.md` to `clients/<CLIENT_SLUG>/walkthrough-video.md`.
   **Check:** the file exists.
2. Fill every `<!-- FILL` marker and every placeholder: the client's names, where each thing is in their GHL, the rate, and the open items the client must act on.
   **Check:** no `<!-- FILL` marker and no placeholder is left. The script stays marked **DRAFT**. It makes no earnings promise.
3. Time the script by reading it aloud at a normal pace.
   **Check:** it runs about 2 minutes. If it runs past 2:30, cut words, not sections.

## 9.3 · The partner emails (DRAFT)

The standard build sends no email to partners or clients. These three drafts are ready for when the client wants them. **None is wired in v1.**

1. Copy `templates/partner-emails-DRAFT.md` to `clients/<CLIENT_SLUG>/partner-emails-DRAFT.md`.
   **Check:** the file exists.
2. Fill every `<!-- FILL` marker and placeholder with the client's names and program terms from the blueprint.
   **Check:** nothing is left to fill. Every email stays marked **DRAFT**, states terms only, and makes no earnings promise or income claim.

## 9.4 · The approver's OK on the copy

Everything a partner or the client reads is **DRAFT** until the operator's approver (at Using AI to Scale, Justin) approves it.

1. Collect every DRAFT text in one list: the walkthrough message (in `walkthrough-video.md`), the Become a Partner page's headline and copy line, the forms' texts from the build record's "Copy waiting for approval", and the three partner emails.
   **Check:** the list names each text and the file it is in.
2. Send the list to the operator, to pass to the approver. Put each text in its own code block, complete, so it can be read and copied as is.
   **Check:** the message is sent.
3. Write the approver's answer into the build record for each text: approved (with the date and their words), or the changes. Make the changes, and send the changed texts again.
   **Check:** each text is approved, or listed as waiting. Nothing waiting goes live or is sent.

## 9.5 · The operator records and sends the video

1. Tell the operator the video is ready to record: the script is `clients/<CLIENT_SLUG>/walkthrough-video.md`, about 2 minutes, a screen recording of the client's GHL. Record it **before** the test records are deleted, so it can show Test Partner E and their referral as examples (say on screen that they are test records).
   **Check:** the operator has the script.
2. The operator records the video and gives you its link.
   **Check:** the link is in the build record.
3. The operator sends the client the video with the approved message from the script. You never send it.
   **Check:** the operator confirms it is sent. Write the date into the build record.

## 9.6 · Clean up the test records

1. Now that the video is recorded, do the cleanup in [8-test.md](8-test.md), section 8.12, with the operator's go-ahead.
   **Check:** the double-check reports 0 test contacts, and the build record says what was deleted and where the backup is.

## 9.7 · Swap the placeholder user for the client's user

Every task, the alert and the calendar go to `<PLACEHOLDER_USER>` until the client has a GHL user. Do this section when the client has one. If they do not have one yet, add "Swap the placeholder user" to the open items, owned by the client, and skip to 9.8.

In the standard build the swap covers the calendar, 1 internal notification and 9 task steps (8 without Instantly). For the "one fee per closed deal" variant, take 1 off: its workflow 8 has no task. For pay per lead, take 2 off: workflows 7 and 8 are not built. The spec files list every task step.

| Workflow | Person slots |
|---|---|
| `Instantly - Interested Partner Reply` (if built) | 1 internal notification, 1 task |
| `Referral Engine - Referral Capture` | 2 tasks: the follow-up, and the conflict review |
| `Referral Engine - Staff Attribution` | 2 tasks: the same two |
| `Referral Engine - Partner Sign-Up` | 1 task |
| `Referral Engine - Commission 1: Sale` | 1 task |
| `Referral Engine - Commission 2: Approved` | 1 task |
| `Referral Engine - Commission 3: Paid, monthly repeat` | 1 task. The fee variant's `Referral Engine - Commission 3: Paid`: none |

1. Ask the operator for the client's GHL user (`<CLIENT_USER>`): the name and email of the person who will run partners. Run `node tools/ghl/survey.js --client <CLIENT_SLUG>`.
   **Check:** `<CLIENT_USER>` is in the survey's users list. Write their user id into the build record.
2. Calendar: open **Calendars**, then the settings of `Partner Intro Call`. In its team members, add `<CLIENT_USER>` and remove `<PLACEHOLDER_USER>`. Save.
   **Check:** the calendar lists only `<CLIENT_USER>` as its team member. Confirm: the menu's names; the first build did not do this swap yet.
3. Put `<CLIENT_USER>`'s id into the config key for the calendar owner (`calendarOwnerUserId`), then run `node tools/ghl/double-check.js --client <CLIENT_SLUG>`.
   **Check:** the calendar line passes, and its owner line names `<CLIENT_USER>`.
4. Open `Instantly - Interested Partner Reply` from the workflows list (skip if not built). In its internal notification step, change the recipient to `<CLIENT_USER>`. Save the action.
   **Check:** the step shows `<CLIENT_USER>`.
5. In the same workflow, open the task step. Set **Assign to** = `<CLIENT_USER>`, then click the Assign to box once more to close it, and press Tab. Save the action, then click the header **Save**.
   **Check:** the step shows `<CLIENT_USER>`, and the "Saved!" message appears.
6. Repeat action 5 for every task step in every workflow in the table above.
   **Check:** every task step shows `<CLIENT_USER>`. Count them: 9 in the standard build (8 without Instantly); 1 fewer for the fee variant, 2 fewer for pay per lead.
7. Run `node tools/ghl/double-check.js --client <CLIENT_SLUG>`.
   **Check:** every workflow you edited is `published`, with a higher version than before.
8. Write the swap into the build record: the date, `<CLIENT_USER>`, and each workflow's new version.
   **Check:** the entry is in the build record.

## 9.8 · The calendar rules, with the client

The Partner Intro Call's hours, owner and video link were placeholders. The client sets the real ones, on a call with the operator or in writing.

1. Get from the client: the days and hours they take intro calls, their time zone, a daily maximum, the video meeting link, and any dates to block.
   **Check:** each item has an answer, or is listed as an open item.
2. Set them on the `Partner Intro Call` calendar in GHL: its availability, its meeting location, its limits and its blocked dates.
   **Check:** the calendar's settings show each answer. Confirm: where GHL puts each setting; the first build left them as placeholders.
3. If the days or the call length changed, update the calendar in the config's `structure` to match, then run the double-check.
   **Check:** the calendar line passes.

## 9.9 · The two staff routines

Walk the client's staff through these two routines: on the call in 9.8, or in a second short video. Also point them to [docs/how-it-works.md](../docs/how-it-works.md).

**Each month: the commission** (monthly percentage variant; the fee variant's table follows it; for pay per lead, use what [spec/variants.md](../spec/variants.md) says)

| When | Staff do | What happens by itself |
|---|---|---|
| A referred client signs | Drag their deal to `Sold / Enrolled` | It moves on to `Commission Pending`, the credit is locked, and an approval task appears |
| The approval task | Confirm the client paid this month. Fill in `Client Monthly Revenue` and `Reward Amount` (the rate of that payment). Drag the deal to `Commission Approved` | A payout task appears |
| The payout task | Pay the partner the way their contact says (ACH, check, PayPal). Drag the deal to `Commission Paid` | 30 days later, the deal returns to `Commission Pending` with next month's approval task |
| The client cancels | Drag the deal to `Lost / No Sale` | The cycle stops |

`Reward Amount` is typed by hand each month: without Stripe, GHL has no payment to compute it from.

**Each closed deal: the fee** (one fee per closed deal variant)

| When | Staff do | What happens by itself |
|---|---|---|
| A referred deal closes and the client has paid | Drag the deal to `Sold / Enrolled` (or the renamed sale stage) | It moves on to `Commission Pending`, the credit is locked, `Reward Amount` is set to the fee, and an approval task appears |
| The approval task | Confirm the deal closed and the client paid. Check `Reward Amount` is the fee (type it if it is empty). Drag the deal to `Commission Approved` | A payout task appears |
| The payout task | Pay the partner the fee the way their contact says. Drag the deal to `Commission Paid` | The payment is recorded. Nothing repeats |

**If the client pays partners in one monthly run** ([spec/variants.md](../spec/variants.md), "A monthly payout run"): payout tasks wait, open, until the payout day. On that day, pay every open payout task, then drag each of those deals to `Commission Paid`. An overdue payout task before the payout day is expected.

**When a "Review attribution conflict" task appears**

| Order | Staff do |
|---|---|
| First | Compare the current credit (`Referring Partner Name` and `Referring Partner ID`) with the new claim (the `Claimed ...` fields and `Claim Notes`) |
| Second | Decide who sent the client. A partner who registered the same client twice is flagged too: that review takes seconds |
| Third | If the new claimant wins: write the old credit into a note on the contact first, then change `Referring Partner Name`, `Referring Partner ID` and `Referral Code` by hand |
| Fourth | Set `Attribution Confidence` to `Verified` or `Claimed`, per the client's policy, and note the reason |
| Last | Move the deal back to the stage it was in before `Attribution Review`. The deal's history shows that stage |

Not settled in the first build: whether staff remove the `referral-attribution-conflict` tag afterwards, and how to file a resolved lead under its partner in the Affiliate Manager by hand (a disputed lead is filed under nobody). Confirm both with the operator.

1. Show both routines to the staff member who will run them.
   **Check:** write their name and the date into the build record.

## 9.10 · Finish and file the build record

1. Fill every section of `clients/<CLIENT_SLUG>/build-record.md`: the status table, the account, what was built with ids, each workflow, the tests, the design choices, the known limits, the open items and the cleanup.
   **Check:** no `<!-- FILL` marker is left, and every status row has a date.
2. Write the open items, each with an owner and a date. The usual ones: connect the client's domain, then publish the Become a Partner page (its copy approved) and move the forms onto the domain; Instantly on Hyper Growth (step 7); A2P approval before any SMS; Stripe, only if the client wants commissions in the partner portal; the placeholder swap, if the client has no user yet; the one real form fill, if still owed; **the referral-fee confirmation for every partner type still open** (the blueprint's section 13: that type is not recruited until the client confirms it in writing); the partner agreement, if the client has none yet.
   **Check:** every open item has an owner (the client, the operator or the approver).
3. Add a log line: `YYYY-MM-DD HH:MM · Step 9 done · handed over`.
   **Check:** the line is in the log.
4. Ask the operator to file the build record and the flowcharts PDF in their own records (at Using AI to Scale, the client's folder in the vault). `clients/` is never committed to this repo.
   **Check:** the operator confirms where they are filed.
5. Send the operator the final message, short: what is built, what is still open (with owners), and what you need from them. Give the paths of the build record, the flowcharts PDF and the walkthrough script.
   **Check:** the message is sent.

## If a step fails

- **`render.js` reports overlaps or cramped text.** Shorten the box texts it names, then run it again. [tools/flowcharts/README.md](../tools/flowcharts/README.md) has the layout rules.
- **`render.js` cannot find a browser.** It prints PDFs through Edge or Chrome. Tell the operator which browser is missing.
- **The approver changes the copy.** Update the file, then send the changed text again. Nothing goes live until it is approved.
- **The client has no GHL user yet.** Leave `<PLACEHOLDER_USER>` in every slot and list the swap as an open item. The handover still finishes.
- **A task's Assign to will not change, or a click lands elsewhere.** See the "Workflow builder" table in [ghl-traps.md](ghl-traps.md).
- **The client's domain is not connected.** The page stays saved and unpublished. List it as an open item.
- **Anything else.** Retry once. If it fails again, tell the operator: `Blocked at step 9.<N>: <what happened>. Need from you: <one thing>.` Then wait.
