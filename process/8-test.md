# Step 8 · Test

Prove every workflow does what the spec says, with test contacts, before anyone real uses the program. Record every result. Then, on the operator's go-ahead, delete the test records.

| | |
|---|---|
| **Owner** | The AI session. A person does the one real form fill (test 8). **The operator approves the cleanup** |
| **Time** | About 2 hours in the first build |
| **Needs** | Steps 3 to 6 done: `double-check.js` passes every line |
| **Makes** | Test results in the build record, full outputs in `clients/<CLIENT_SLUG>/test-log.md`, and later a clean account |
| **Done when** | Tests 0 to 7 pass and are recorded, and test 8 is done or listed as owed. The cleanup (section 8.12) runs later, in step 9, after the walkthrough video |

**How the tests work.** Public GHL forms carry Cloudflare's bot check (Turnstile), which stops an automated form fill. Never work around it. Instead, `tools/ghl/enroll.js` stands in for a form: it writes exactly what the form writes onto an `@example.com` test contact, then starts the form's workflow for that contact. `tools/ghl/move-stage.js` moves a test deal the way a staff member's drag does, so the stage-triggered workflows run. `tools/ghl/verify-test.js` reads one contact back: its fields, tags, deals with their fields, notes and tasks. The test scripts refuse any contact that is not on `@example.com`. Every script takes `--client <CLIENT_SLUG>`; [tools/README.md](../tools/README.md) documents them.

| Scenario | Stands in for | Test contact |
|---|---|---|
| `fire-test.js` | Instantly sending an interested lead | `test.instantly1@example.com` |
| `enroll.js claimA` | Partner A registers a new client through Refer a Client | `test.referral1@example.com` |
| `enroll.js claimB` | Partner B registers the same client | `test.referral1@example.com` |
| `enroll.js staffC` | Staff log partner C's email introduction of a new client | `test.referral2@example.com` |
| `enroll.js partnerD` | A new partner fills Partner Sign-Up | `test.partner.d@example.com` |
| `enroll.js partnerE` | Another new partner, for the Affiliate Manager tests | `test.partner.e@example.com` |
| `enroll.js claimE` | A client registered through partner E's link (the claim is read off E's contact) | `test.referral3@example.com` |
| A person, by hand (test 8) | A real form fill through partner E's link | `test.realfill@example.com` |

If [tools/README.md](../tools/README.md) lists other test emails, it wins. `enroll.js` also prints, on its last line, the `verify-test.js` command for its contact.

**The expected texts below** (task titles, deal sources) are the first build's. If [spec/workflows/](../spec/workflows/README.md) words one differently, the spec wins. Run the tests in order: later tests use earlier ones.

## 8.1 · Before the tests

1. Run `node tools/ghl/double-check.js --client <CLIENT_SLUG>`.
   **Check:** every line passes. Every workflow is `published`.
2. Create `clients/<CLIENT_SLUG>/test-log.md`, with a first line naming the client, today's date and the variant, for example `Example Roofing · 2026-10-01 · variant: one fee per closed deal ($250)`. Add a second line listing any client difference from the blueprint (for example `phone-only referrals`), or `none`.
   **Check:** the file exists. Paste every test command and its full output into it as you go.
3. Note the time zone from the build record's "The account" section. Every time you record is in that zone.
   **Check:** you know the zone.

## 8.2 · Test 0: an Instantly interested reply

**Only if workflow 1 is built.** Proves: an interested lead from Instantly becomes a contact, a deal at `Engaged`, a note, an alert and a reply task, and a repeat keeps one contact and one deal.

1. Run `node tools/ghl/fire-test.js --client <CLIENT_SLUG> test.instantly1@example.com`.
   **Check:** it prints a success status (200 to 299).
2. Wait 1 minute, then run `node tools/ghl/verify-test.js --client <CLIENT_SLUG> test.instantly1@example.com`.
   **Check:** every row of this table matches.

| Where | Expected |
|---|---|
| Contact | The test payload's name, email, phone and company (`Test Partner`, `test.instantly1@example.com`, `+15555550123`, `Test Partner Co`) |
| Tags | `source/instantly`, `interest/partner-program` |
| `Instantly Campaign` | The payload's `campaign_name` |
| `Next Action Date` | Today |
| Deal | `Partner Recruiting` / `Engaged`, named `test.instantly1@example.com`, source `Instantly reply` |
| Note | The reply text, the campaign, and the Unibox link |
| Task | `Reply to test.instantly1@example.com - interested partner`, assigned to `<PLACEHOLDER_USER>`, due the next day, weekends skipped |

3. Open workflow 1's execution log: **Automation → Workflows** → `Instantly - Interested Partner Reply` → the **Execution Logs** tab.
   **Check:** all the spec's steps ran for this contact, and the internal notification step shows Success.
4. Run action 1 again with the same email, wait 1 minute, and run action 2's command again.
   **Check:** still one contact and one deal. A second note and a second task were added: that is intended, since every reply gets its own follow-up.

## 8.3 · Test 1: a first claim

Proves: a partner's first claim on a new client gives them the credit and opens a deal.

1. Run `node tools/ghl/enroll.js --client <CLIENT_SLUG> claimA`.
   **Check:** it prints the upsert and that the contact was enrolled in `Referral Engine - Referral Capture`.
2. Wait 1 minute, then run `node tools/ghl/verify-test.js --client <CLIENT_SLUG> test.referral1@example.com`.
   **Check:** every row of this table matches.

| Where | Expected |
|---|---|
| `Contact Role` | `Referred Lead` |
| Tags | include `referred-lead` |
| `Referring Partner ID`, `Referring Partner Name`, `Referral Code` | The same values as `Claimed Partner ID`, `Claimed Partner Name`, `Claimed Referral Code` (partner A's claim: `TEST-PARTNER-A`, `Test Partner A`, `TESTA` in the first build) |
| `Referral Attribution Method` | `Partner Submission` |
| `Attribution Confidence` | `Claimed` |
| `Referral Source Type` | `Partner` |
| `Referral Date` | Today |
| `Referral Evidence` | The `Claim Notes` text |
| Deal | `Referred Leads` / `Referral Received`, named `test.referral1@example.com`, source `Partner referral` |
| Task | `Contact referred lead test.referral1@example.com from partner Test Partner A`, assigned to `<PLACEHOLDER_USER>`, due in 1 business day |

3. Open the execution log of `Referral Engine - Referral Capture` for this contact.
   **Check:** the first-claim branch ran. `File the lead under its partner` may show an error, because `TESTA` is not a real partner's Referral ID: that is expected. Every step after it ran.

Not yet proven: the first build ran tests 1 to 5 before `File the lead under its partner` existed. If the deal or the task is missing and the log stops at that step, see "If a step fails".

## 8.4 · Test 2: a second claim on the same client

Proves: a later claim cannot take the credit. It goes to a person for review.

1. Run `node tools/ghl/enroll.js --client <CLIENT_SLUG> claimB`.
   **Check:** it prints the upsert and the enrollment.
2. Wait 1 minute, then run `node tools/ghl/verify-test.js --client <CLIENT_SLUG> test.referral1@example.com`.
   **Check:** every row of this table matches.

| Where | Expected |
|---|---|
| `Referring Partner ID`, `Referring Partner Name`, `Referral Code` | Unchanged: still partner A's |
| `Claimed Partner ID`, `Claimed Partner Name`, `Claimed Referral Code` | Now partner B's claim. The form writes the staging fields every time; that is intended |
| Tags | Include `referral-attribution-conflict` |
| `Attribution Confidence` | `Conflicting` |
| Deal | Still one deal, now at `Referred Leads` / `Attribution Review` |
| Task | A new task: `Review attribution conflict: test.referral1@example.com` |

3. Open the workflow's execution log for this contact's second run.
   **Check:** the later-claim branch ran, and `File the lead under its partner` did not run.

## 8.5 · Test 3: a staff-logged introduction

Proves: staff can log a referral that came by email, phone or walk-in, and the credit goes to the named partner.

1. Run `node tools/ghl/enroll.js --client <CLIENT_SLUG> staffC`.
   **Check:** it prints the upsert and the enrollment in `Referral Engine - Staff Attribution`.
2. Wait 1 minute, then run `node tools/ghl/verify-test.js --client <CLIENT_SLUG> test.referral2@example.com`.
   **Check:** the credit fields equal the Claimed fields (partner C's), `Referral Attribution Method` is `Staff Entered`, `Attribution Confidence` is `Claimed`, and the other rows match test 1's table (for this contact's email and partner C).
3. Copy the deal's id from the output: the line that starts with `opp`. This is the `<OPP_ID>` for test 5.
   **Check:** the id is in the test log, next to `test.referral2@example.com`.

## 8.6 · Test 4: a partner sign-up

Proves: a new partner is set up with their role, Partner ID, rate, link, tags, deal and onboarding task, and becomes an affiliate.

1. Run `node tools/ghl/enroll.js --client <CLIENT_SLUG> partnerD`.
   **Check:** it prints the upsert and the enrollment in `Referral Engine - Partner Sign-Up`.
2. Wait 1 minute, then run `node tools/ghl/verify-test.js --client <CLIENT_SLUG> test.partner.d@example.com`.
   **Check:** every row of this table matches.

| Where | Expected |
|---|---|
| `Contact Role` | `Referral Partner` |
| `Partner ID` | The contact's own id (the id on the `contact` line) |
| `Revenue Share Percent` | `<RATE_PERCENT>` for a monthly percentage. **Empty** for the fee and per-lead variants: their workflow 4 has no such row |
| `Reward Model` | The blueprint's value: `Revenue Share` (monthly percentage), `Per Sale` (one fee per closed deal), `Per Lead` (pay per lead) |
| `Partner Type`, `Partnership Type`, `Partner Notes`, `Payment Preference` | The values `enroll.js` wrote: the first option of the client's own list for the three dropdowns (`Payment Preference` = `ACH` in the standard) |
| `Affiliate Link` | GHL's affiliate link (it contains `?am_id=`), then `&claimed_partner_id=` and the contact's id, then `&claimed_partner_name=` and the partner's first name, `%20` and last name. The Affiliate Link workflow overwrote the first link within the minute |
| `Referral Code` | The partner's Referral ID (the `am_id` value in the link) |
| Tags | `referral-partner`, `partner-onboarding` |
| Deal | `Partner Lifecycle` / `Onboarding`, source `Partner sign-up form` |
| Task | `Onboard new referral partner: test.partner.d@example.com`, assigned to `<PLACEHOLDER_USER>` |

3. Open the execution log of `Referral Engine - Partner Sign-Up` for this contact.
   **Check:** every step ran, including the one that wrote the first `Affiliate Link`, and the two Affiliate Manager steps.

## 8.7 · Test 5: the commission cycle and the monthly loop

Proves: a sale opens a commission for approval, approval opens a payout task, payment is recorded, the next month's commission opens by itself, and a lost client stops the cycle. It uses test 3's deal, `<OPP_ID>`.

**For a variant other than monthly percentage**, there is no monthly loop. Test the commission workflows as [spec/variants.md](../spec/variants.md) describes for that variant, instead of this section. For "one fee per closed deal", the test of the renamed workflow 8 is also in [8b-commission-3-paid-once.md](../spec/workflows/8b-commission-3-paid-once.md), "Test". Title the test log's section `Test 5: the commission cycle, <variant>`.

1. Run `node tools/ghl/move-stage.js --client <CLIENT_SLUG> <OPP_ID> "Sold / Enrolled"`.
   **Check:** it prints that the deal moved to `Referred Leads / Sold / Enrolled`.
2. Wait 1 minute, then run `node tools/ghl/verify-test.js --client <CLIENT_SLUG> test.referral2@example.com`.
   **Check:** the deal is at `Commission Pending` (workflow 6 moved it on by itself). `Sale Date` is today. `Commission Status` is `Pending`. The contact's `Attribution Lock` is `Locked`. A task `Approve partner commission: test.referral2@example.com` exists.
3. Run `node tools/ghl/move-stage.js --client <CLIENT_SLUG> <OPP_ID> "Commission Approved"`.
   **Check:** it prints the move.
4. Wait 1 minute, then run the verify command from action 2.
   **Check:** `Commission Status` is `Approved`. `Commission Approval Date` is today. A task `Pay partner commission for test.referral2@example.com` exists.
5. For the loop test, open `Referral Engine - Commission 3: Paid, monthly repeat` from the workflows list. Click its **Wait** box, change `30` days to `1` minute, click **Save action**, then click the header **Save**.
   **Check:** the double-check shows workflow 8 `published` with a higher version, and the wait box reads 1 minute. Write in the test log that the wait is at 1 minute.
6. Run `node tools/ghl/move-stage.js --client <CLIENT_SLUG> <OPP_ID> "Commission Paid"`, then right away the verify command.
   **Check:** `Commission Status` is `Paid`, and `Last Commission Payment Date` is today.
7. Wait 2 minutes, then run the verify command again.
   **Check:** the deal is back at `Commission Pending`. `Commission Status` is `Pending`. A new task `Monthly partner commission due: test.referral2@example.com` exists.
8. Month two: run `node tools/ghl/move-stage.js --client <CLIENT_SLUG> <OPP_ID> "Commission Approved"`, wait 1 minute, and run the verify command.
   **Check:** a second `Pay partner commission for test.referral2@example.com` task exists. Workflow 7's execution log shows a second run for this contact.
9. The stop test: run `node tools/ghl/move-stage.js --client <CLIENT_SLUG> <OPP_ID> "Commission Paid"`.
   **Check:** it prints the move.
10. Within 30 seconds, run `node tools/ghl/move-stage.js --client <CLIENT_SLUG> <OPP_ID> "Lost / No Sale"`.
    **Check:** it prints the move.
11. Wait 2 minutes, then run the verify command.
    **Check:** the deal is still at `Lost / No Sale`. No second `Monthly partner commission due` task was added.
12. Open workflow 8's execution log for this contact.
    **Check:** it shows a second run, and that run took the branch that ends the cycle.
13. Set workflow 8's wait back: open it from the list, click the **Wait** box, change it to `30` days, click **Save action**, then the header **Save**.
    **Check:** the wait box reads 30 days. The double-check shows workflow 8 `published` with a higher version. No blue Save with a red dot is left. Write in the test log that the wait is back at 30 days.

## 8.8 · Test 6: an affiliate sign-up

Proves: a partner who signs up becomes an affiliate in the campaign, and gets one link that carries both ids.

1. Run `node tools/ghl/enroll.js --client <CLIENT_SLUG> partnerE`.
   **Check:** it prints the upsert and the enrollment in `Referral Engine - Partner Sign-Up`.
2. Wait 1 minute, then run `node tools/ghl/verify-test.js --client <CLIENT_SLUG> test.partner.e@example.com`.
   **Check:** every row of test 4's table matches, for this contact.
3. In GHL, open **Marketing → Affiliate Manager** and find Test Partner E among the affiliates.
   **Check:** E is listed, in the campaign `<PROGRAM_NAME>`.
4. Open E's profile, then **Active Referral Links → Customize**.
   **Check:** it shows a Referral ID made of E's name plus digits (for example `testpartnere9104`) and the link. Write the Referral ID in the test log.
5. Compare E's `Affiliate Link` field from action 2 with that Referral ID.
   **Check:** the field reads `https://api.leadconnectorhq.com/widget/form/<REFER_FORM_ID>?am_id=<the Referral ID>&claimed_partner_id=<E's contact id>&claimed_partner_name=` followed by `Test%20PartnerE` (E's last name has no space, on purpose). `Referral Code` equals the Referral ID.

## 8.9 · Test 7: a referral through a partner's link

Proves: a client registered through a partner's link is credited to that partner and filed under them in the Affiliate Manager.

1. Run `node tools/ghl/enroll.js --client <CLIENT_SLUG> claimE`. It reads E's Partner ID, name and Referral ID off E's contact, as E's link would fill them.
   **Check:** it prints the claim it read from E, then the upsert and the enrollment.
2. Wait 1 minute, then run `node tools/ghl/verify-test.js --client <CLIENT_SLUG> test.referral3@example.com`.
   **Check:** `Referring Partner ID` is E's contact id, `Referring Partner Name` is E's name, `Referral Code` is E's Referral ID. The method is `Partner Submission` and the confidence `Claimed`. The deal is at `Referred Leads` / `Referral Received`, and the follow-up task exists.
3. Open the execution log of `Referral Engine - Referral Capture` for this contact.
   **Check:** `File the lead under its partner` ran without an error.
4. In the Affiliate Manager, open Test Partner E.
   **Check:** E shows 1 lead, from Forms, and it is `test.referral3@example.com`.

## 8.10 · Test 8: one real form fill, by a person

The automated tests stand in for the forms. One real fill proves the form itself, its hidden fields and GHL's own tracking. It takes a person 1 minute. **Not yet proven** in the first build. GHL may also file the lead under E by itself, from the `am_id` in the link; it allows one partner per lead per campaign, so there should be no double count.

1. Ask the operator to open E's `Affiliate Link` (from test 6) in a normal browser window, and fill the form with: name `Test RealFill`, email `test.realfill@example.com`, company `Example Real Fill (TEST)`, notes `TEST - real form fill`. The operator completes the bot check and submits.
   **Check:** the operator confirms the form was submitted and shows its thank-you message.
2. Wait 1 minute, then run `node tools/ghl/verify-test.js --client <CLIENT_SLUG> test.realfill@example.com`.
   **Check:** the same results as test 7, for this contact: E has the credit, the deal is at `Referral Received`, the task exists. `Claimed Referral Code` holds E's Referral ID (it came through the `am_id` query key).
3. In the Affiliate Manager, open Test Partner E.
   **Check:** E shows 2 leads, and `test.realfill@example.com` is listed once.

If the operator cannot do the fill now, list "One real form fill through a partner's link" in the build record's open items, owned by the operator.

## 8.11 · Record the results

1. Fill the build record's "Tests" table: each test, the date and time it ran (with the time zone), PASS or FAIL, and a one-line note.
   **Check:** tests 0 to 7 each have a row (test 0 only if workflow 1 is built), and test 8 has a row or an open item.
2. List every test contact in the build record's "Test records to delete": email, contact id, and its deals.
   **Check:** the list matches the double-check's line "test contacts (@example.com) in the account".
3. Add a log line: `YYYY-MM-DD HH:MM · Step 8 done · tests 0-7 PASS · variant: <variant>`. For a variant other than monthly percentage, add what test 5 covered, for example `· test 5: sale, approval, payment; no loop (fee variant)`.
   **Check:** the line is in the log, and it names the variant.

## 8.12 · Cleanup, on the operator's go-ahead

**When:** after the operator has recorded the walkthrough video ([9-handover.md](9-handover.md), section 9.5), because the video shows Test Partner E and its referral. Clean up earlier only if the operator says so.

GHL's contact and deal deletes are soft: the **Restore** tab under Contacts, and the Audit Logs, bring them back for 60 days. Still: back up first, delete one named record at a time, never by a pattern or "select all".

1. Send the operator the list from 8.11, action 2, plus the test affiliates (Test Partner D and E), and ask: "Delete these test records? A backup is saved first; GHL can restore them for 60 days."
   **Check:** the operator answered with a clear yes. Write their words and the date in the build record.
2. Back up: for each test contact, run `node tools/ghl/verify-test.js --client <CLIENT_SLUG> <email>` and add its full output to `clients/<CLIENT_SLUG>/test-backup-YYYY-MM-DD.md`. v1 has no JSON export for contacts: this readback, plus GHL's 60-day restore, is the backup.
   **Check:** the backup file holds one block per test contact, each with the contact id.
3. In GHL, open **Marketing → Affiliate Manager**, find Test Partner D, and remove them from the Affiliate Manager.
   **Check:** D is no longer listed. Confirm: the button's name; the first build removed test affiliates, but the clicks were not recorded.
4. Do the same for Test Partner E.
   **Check:** E is no longer listed.
5. In **Contacts**, search one test email exactly. Open the one result and check that its email and id match the backup. Go back to the list, tick only that contact's checkbox, click the delete (trash) icon in the bar that appears, and confirm.
   **Check:** a search for that email finds nothing. Confirm: the icon's place; the first build deleted over the API.
6. Repeat action 5 for each test contact on the list, one at a time.
   **Check:** every contact on the list is gone.
7. Keep the contact GHL created by itself for the alert address (the placeholder user's email, source "notification"). It logs the alert emails and would come back with the next alert.
   **Check:** it is not on the delete list.
8. Run `node tools/ghl/double-check.js --client <CLIENT_SLUG>`.
   **Check:** "test contacts (@example.com) in the account: 0", and every other line still passes. If a test deal is still listed, open its card in the pipeline and delete it, after checking it is on the list.
9. Write in the build record what was deleted, when, on whose go-ahead, and where the backup is.
   **Check:** the entry is in the build record.

## If a step fails

- **`enroll.js` says an id is missing from the config.** Run `node tools/ghl/survey.js --client <CLIENT_SLUG> --ids`, paste the block into the config, and run the test again.
- **Nothing happened to the contact.** The workflow is not published, or its trigger filter names another form or stage. Run the double-check, then open the workflow's trigger.
- **Test 1: the deal and the task are missing, and the log stops at `File the lead under its partner`.** GHL stopped at the failed step. Do not change the workflow. Tell the operator, with the log's error text.
- **Test 2 made a second deal, or did not move the first one.** The later-claim branch must use **Find opportunity** (the pipeline, plus Opportunity Name = `{{contact.email}}`), then **Update opportunity**. Fix it to match the spec.
- **Test 2 moved the credit to partner B, or test 1 went to review.** The If / else branches are swapped: GHL put the steps in the first branch. Fix the branches to match the spec.
- **Test 5: the deal did not come back after the wait.** The 1-minute wait was not saved (a blue Save with a red dot), or the If / else condition differs from the spec, or "allow previous stage" is off.
- **Test 5, action 8 or 12: no second run.** The workflow does not let a contact run it twice. Compare the workflow's **Settings** tab with its spec. If the spec does not say, stop and ask the operator: without a second run, the monthly cycle stops after the first month.
- **Test 6: E is not in the Affiliate Manager.** The two Affiliate Manager steps in Partner Sign-Up are missing or unsaved (step 6.3). Check the version in the double-check.
- **Test 6: `Affiliate Link` has no `am_id`.** Workflow 5 is not published, or its trigger names another campaign (step 6.4).
- **Test 7: the lead is not under E.** The lead's `Referral Code` differs from E's Referral ID, or the custom mapping points at another field (step 6.6).
- **`verify-test.js` says "CONTACT NOT FOUND".** The workflow did not create or find the contact, or the email is mistyped. Check the workflow's execution log.
- **Anything else.** Retry once. If it fails again, tell the operator: `Blocked at step 8.<N>: <what happened>. Need from you: <one thing>.` Then wait.
