# Step 5 · Workflows

Build the workflows in GHL's workflow builder, node by node, exactly as the files in [spec/workflows/](../spec/workflows/README.md) list them, and publish each one. Workflow 5 (Affiliate Link) is built in step 6, with the Affiliate Manager.

| | |
|---|---|
| **Owner** | The AI session, in the operator's browser |
| **Time** | 3 hours in the first build: about 1 hour for the Instantly workflow, 2 hours for the six referral workflows |
| **Needs** | Step 4 done: the forms exist, so the form triggers can pick them |
| **Makes** | Workflows 1 (only if the client uses Instantly), 2, 3, 4, 6, 7 and 8, published, with their ids in the config |
| **Done when** | `double-check.js` shows each of them `published` |

**Workflows are UI-only.** GHL's API can list workflows but cannot create or edit them. So every workflow is built by hand in the builder.

## The order

| # | Workflow | Spec | Section here |
|---|---|---|---|
| 1 | `Instantly - Interested Partner Reply` (only if the client uses Instantly) | [1-instantly-interested-reply.md](../spec/workflows/1-instantly-interested-reply.md) | 5.4 |
| 2 | `Referral Engine - Referral Capture` | [2-referral-capture.md](../spec/workflows/2-referral-capture.md) | 5.5 |
| 3 | `Referral Engine - Staff Attribution` | [3-staff-attribution.md](../spec/workflows/3-staff-attribution.md) | 5.6 |
| 4 | `Referral Engine - Partner Sign-Up` | [4-partner-sign-up.md](../spec/workflows/4-partner-sign-up.md) | 5.7 |
| 5 | `Referral Engine - Affiliate Link` | [5-affiliate-link.md](../spec/workflows/5-affiliate-link.md) | Step 6, not here |
| 6 | `Referral Engine - Commission 1: Sale` | [6-commission-1-sale.md](../spec/workflows/6-commission-1-sale.md) | 5.8 |
| 7 | `Referral Engine - Commission 2: Approved` | [7-commission-2-approved.md](../spec/workflows/7-commission-2-approved.md) | 5.9 |
| 8 | `Referral Engine - Commission 3: Paid, monthly repeat`. Fee variant: `Referral Engine - Commission 3: Paid` | [8-commission-3-paid-monthly.md](../spec/workflows/8-commission-3-paid-monthly.md). Fee variant: [8b-commission-3-paid-once.md](../spec/workflows/8b-commission-3-paid-once.md) | 5.10 |

**Three steps are left out here and added in step 6**, because they need the Affiliate Manager campaign: `File the lead under its partner` in workflows 2 and 3, and `Add to affiliate manager` and `Add to affiliate campaign` in workflow 4.

**If the blueprint's variant is not monthly percentage**, read that variant's section in [spec/variants.md](../spec/variants.md) before you build workflows 4, 6, 7 and 8, and build the changed version it describes. **If the blueprint lists a client difference** (homeowner clients, phone-only referrals, a monthly payout run), read it in [spec/variants.md](../spec/variants.md), "Client differences", before the workflows it touches. A fee goes into a field as a number (`250`) and into a text with its currency sign (`$250`).

**Rules for every workflow:**
- Every notification and every task goes to `<PLACEHOLDER_USER>` until the client has a GHL user. Step 9 swaps them.
- No email or SMS to a partner or a client. Their copy needs approval first; the drafts wait in `templates/partner-emails-DRAFT.md`, not wired in v1.
- Deals are named by the contact's email (`{{contact.email}}`), because Instantly often sends no names and **Find opportunity** matches on the deal's name.

## 5.1 · Before you start

1. Read [spec/workflows/README.md](../spec/workflows/README.md) in full: how the workflows connect.
   **Check:** you can say which trigger starts each workflow.
2. Read the "Browser and window" and "Workflow builder" tables in [ghl-traps.md](ghl-traps.md).
   **Check:** you know the four big ones: screenshot before every click, 100% zoom, open from the list, click the header Save often.
3. Confirm the GHL window is on screen, side by side with the chat, and logged in to the client's sub-account.
   **Check:** a screenshot shows the client's sub-account name.

## 5.2 · How to build any workflow

Use these actions for every workflow. The sections below say what is special about each one.

1. In the left menu, click **Automation**, then **Workflows**.
   **Check:** the list of workflows shows.
2. Click **+ Create workflow**, then **Start from Scratch**.
   **Check:** an empty canvas opens with an **Add new trigger** box.
3. Click the pencil next to the title at the top, type the workflow's exact name from the spec, and press Enter.
   **Check:** the title shows the exact name, with the same capitals, hyphens and colon.
4. Set the canvas zoom to 100% with the zoom control on the canvas.
   **Check:** the zoom reads 100%. At any other zoom, clicks on the nodes do not register.
5. Click **Add new trigger**. In its search box, type the trigger's search word from the spec (for example `form submitted`), then click the trigger.
   **Check:** the trigger's settings panel opens.
6. Click **Add filters** and add each filter the spec lists (for example `Form is` → `Refer a Client`).
   **Check:** each filter shows with the spec's value.
7. Click **Save trigger**.
   **Check:** the trigger box on the canvas shows its name.
8. Click the **+** under the last box. In the **Actions** search box, type the spec's action (for example `update contact field`), then click it.
   **Check:** the action's settings panel opens. The **+** you clicked was in the branch the spec names.
9. In **Action Name**, type the step's name from the spec.
   **Check:** the name matches the spec's table.
10. Set every field the spec lists for the step, exactly. Section 5.3 says how to set each kind of field.
    **Check:** each field shows the spec's value. Nothing the spec does not list is changed from GHL's default.
11. Click **Save action**.
    **Check:** the new box shows under the one before it, in the right branch.
12. Repeat actions 8 to 11 for every step in the spec's table, in order. After every 5 steps, click the header **Save** at the top right.
    **Check:** after each header Save, the message "Saved! Workflow has been saved." appears.
13. Compare the canvas with the spec's table, row by row.
    **Check:** the same steps, in the same order, in the same branches, with the same names.
14. Open the builder's **Settings** tab and set every option the spec lists (for example **Allow re-entry**). Save.
    **Check:** each option matches the spec.
15. Publish: click the **Draft / Publish** toggle at the top right so it reads Publish, then click the header **Save**.
    **Check:** the toggle shows the workflow as published, and the "Saved!" message appears.
16. Run `node tools/ghl/double-check.js --client <CLIENT_SLUG>`.
    **Check:** this workflow's line reads `published v<N>`. A note that its id is not recorded yet is fine until section 5.11.
17. In the build record, write the workflow's name, its version, the date and time, and any difference from the spec (there should be none).
    **Check:** the entry is in the build record.

**The canvas is not proof.** Only the double-check's status and version show what GHL saved. A blue **Save** button with a red dot means the latest change is not live yet.

## 5.3 · How to set each kind of field

| You need | Do this |
|---|---|
| A merge field (a value GHL fills in when the workflow runs) | Click the tag icon in the value box. **Custom values** opens with groups (Contact, User, and the trigger's own fields). Search by name. Or type the merge field, for example `{{contact.id}}`: it turns into a chip |
| To set a contact field | Use **Update contact field**: **Add field** → **Select field** → search the field's name → set the value |
| Today's date in a date field | It depends on the kind of field; the spec step names the method for each one ([spec/workflows/README.md](../spec/workflows/README.md), "Dates"). A **contact** date field (in **Update contact field**, for example `Next Action Date`, `Referral Date`): pick **Current date** from the field's own dropdown. A **deal** (opportunity) date field (in **Update opportunity**, for example `Sale Date`, `Commission Approval Date`, `Last Commission Payment Date`): click the ⋮ next to the value → **Dynamic** → the tag icon → **Right now** → **Date** (picker label; its raw text was never seen) |
| An If / else | Search `Else` in the Actions box. Set the condition exactly as the spec writes it, and name the branches as the spec does. When you insert an If / else in the middle of a chain, GHL attaches the steps below it to the **first** branch: check each branch before you save |
| To move an existing deal, in a workflow a form or a contact started | **Find opportunity** (filter: the pipeline, plus Opportunity Name = `{{contact.email}}`), then **Update opportunity**. Never "Create opportunity" to move a deal: with duplicates off, it silently does nothing when the deal exists |
| To move the deal that started the workflow | **Update opportunity** acts on that deal directly. To move it to an earlier stage, turn on "allow previous stage" |
| A task | **Add task**: title, description, due date, and **Assign to** = `<PLACEHOLDER_USER>`. After you pick the user, click the Assign to box once more to close it, then press Tab. The list can stay open invisibly and swallow your next click. One task goes to one person |
| An internal notification | The recipient is the user `<PLACEHOLDER_USER>`, picked from the list |
| A rich-text box (a note, an email body, a task description) | Click the `</>` source button. Triple-click the box to select everything, then type the whole text as HTML, with plain `{{merge.fields}}`. Then Save |
| A wait of a month | Wait units stop at days, so a month is `30` days |
| A webhook key GHL has not seen yet | Click right of the existing chip, press Ctrl+A, and type `{{inboundWebhookRequest.<key>}}`. An orange chip is valid and fills in when the workflow runs. The warning "No step provides this data" is expected |

## 5.4 · Workflow 1: Instantly - Interested Partner Reply

**Only if the blueprint builds it** (the client runs cold email in Instantly). Otherwise skip to 5.5. Spec: [1-instantly-interested-reply.md](../spec/workflows/1-instantly-interested-reply.md).

1. Create the workflow with section 5.2, actions 1 to 4, named `Instantly - Interested Partner Reply`.
   **Check:** the title is exact, and the zoom is 100%.
2. Click **Add new trigger**, search `inbound webhook`, and click **Inbound Webhook**.
   **Check:** the trigger panel shows a webhook URL.
3. Copy that URL into the config as `instantly.webhookUrl`. This is the `<INSTANTLY_WEBHOOK_URL>`.
   **Check:** the URL in the config is identical to the one in the panel, and the config is still valid JSON.
4. Send a sample request: `node tools/ghl/fire-test.js --client <CLIENT_SLUG> test.instantly1@example.com`. It does not run the workflow, which is not published yet. It teaches the trigger what Instantly sends.
   **Check:** the script prints a success status (200 to 299).
5. In the trigger panel, click **Fetch sample requests**, then pick the newest sample.
   **Check:** the sample shows `lead_email` with the value `test.instantly1@example.com`.
6. Give the trigger the name the spec gives it, then click **Save trigger**.
   **Check:** the trigger box shows on the canvas. It will not save without a sample.
7. Build the spec's steps with section 5.2, actions 8 to 12. Map each webhook value from the sample's keys. For a key the sample lacks, type the merge field (section 5.3).
   **Check:** the canvas holds the spec's steps, in order.
8. Finish with section 5.2, actions 13 to 17: compare, settings, publish, double-check, record.
   **Check:** the double-check shows `Instantly - Interested Partner Reply` as `published`.

The Inbound Webhook trigger is a premium trigger: GHL charges a small amount per run.

## 5.5 · Workflow 2: Referral Engine - Referral Capture

Spec: [2-referral-capture.md](../spec/workflows/2-referral-capture.md). It runs when a partner registers a client. The first claim on a client gets the credit; any later claim goes to a person for review.

1. Create the workflow with section 5.2, actions 1 to 4, named `Referral Engine - Referral Capture`.
   **Check:** the title is exact, and the zoom is 100%.
2. Add the trigger: search `form submitted`, click **Form Submitted**, add the filter `Form is` → `Refer a Client`, and click **Save trigger**.
   **Check:** the trigger box shows the filter.
3. Build the spec's steps that come before the If / else (section 5.2, actions 8 to 11).
   **Check:** those steps are on the canvas, in order.
4. Add the If / else that asks whether this is the first claim on the contact. Set its condition exactly as the spec writes it, and name the branches as the spec does.
   **Check:** two branches show, with the spec's names.
5. Build the first-claim branch's steps in order, **leaving out** `File the lead under its partner`. Step 6 adds it.
   **Check:** the first-claim branch holds the spec's steps for it, minus that one.
6. Build the later-claim branch's steps in order. It overwrites no credit field. Its deal move is **Find opportunity** then **Update opportunity** (section 5.3).
   **Check:** the later-claim branch holds the spec's steps for it.
7. Look at both branches on the canvas.
   **Check:** every step sits in the branch the spec names. If GHL put a step in the wrong branch, move it before you save.
8. Finish with section 5.2, actions 12 to 17.
   **Check:** the double-check shows `Referral Engine - Referral Capture` as `published`.

## 5.6 · Workflow 3: Referral Engine - Staff Attribution

Spec: [3-staff-attribution.md](../spec/workflows/3-staff-attribution.md). The same as workflow 2, started by the Staff Attribution form, with the method `Staff Entered`. The quickest way is to duplicate workflow 2.

1. On the workflows list, open the **⋮** on `Referral Engine - Referral Capture` and click **Duplicate**. The dialog asks "What should be the name of the copied workflow?" (default `Copy - Referral Engine - Referral Capture`). Type `Referral Engine - Staff Attribution` and click **Create** ([spec/workflows/3-staff-attribution.md](../spec/workflows/3-staff-attribution.md)).
   **Check:** the copy shows in the list as `Referral Engine - Staff Attribution`.
2. Open the copy from the list (click its name; click again if the first click does not open it).
   **Check:** the title is exact. If the dialog kept the default name, rename it with the pencil in the header.
3. Open the trigger and change its filter to `Form is` → `Staff Attribution`. Click **Save trigger**.
   **Check:** the trigger box shows `Staff Attribution`.
4. Make every change the spec lists against workflow 2 (for example `Referral Attribution Method` = `Staff Entered`).
   **Check:** each listed difference is made, and nothing else changed.
5. Open every **Update opportunity** step. Duplicating turns their dropdown values (the pipeline, the stage) into free text. Delete each dropdown row and add it again, picking the value from its list.
   **Check:** each row shows a value picked from a list, not typed text.
6. Compare the canvas with the spec, row by row.
   **Check:** the same steps, in the same branches. `File the lead under its partner` is not there yet (step 6).
7. Finish with section 5.2, actions 14 to 17. The copy starts as a draft, so publish it.
   **Check:** the double-check shows `Referral Engine - Staff Attribution` as `published`.

## 5.7 · Workflow 4: Referral Engine - Partner Sign-Up

Spec: [4-partner-sign-up.md](../spec/workflows/4-partner-sign-up.md). It sets up each new partner: role, Partner ID, rate, first link, tags, a Partner Lifecycle deal and an onboarding task.

1. Create the workflow with section 5.2, actions 1 to 4, named `Referral Engine - Partner Sign-Up`.
   **Check:** the title is exact, and the zoom is 100%.
2. Add the trigger: **Form Submitted**, filter `Form is` → `Partner Sign-Up`, then **Save trigger**.
   **Check:** the trigger box shows the filter.
3. Build the spec's steps in order, **leaving out** `Add to affiliate manager` and `Add to affiliate campaign`. Step 6 adds them.
   **Check:** the canvas holds the spec's steps, minus those two.
4. In the step that sets `Revenue Share Percent`, type the blueprint's rate, `<RATE_PERCENT>`, as a plain number. For another variant, set what [spec/variants.md](../spec/variants.md) says: for a fee, step 1 has 4 rows (no `Revenue Share Percent`), `Reward Model` = `Per Sale` or `Per Lead`, and step 4's description names the fee as text (`$250`).
   **Check:** the value matches the blueprint's section 2.
5. In the step that writes `Affiliate Link`, write the value exactly as the spec does, with `<REFER_FORM_ID>` replaced by the Refer a Client id from the config.
   **Check:** the value matches the spec, with the real form id and no spaces.
6. Finish with section 5.2, actions 13 to 17.
   **Check:** the double-check shows `Referral Engine - Partner Sign-Up` as `published`.

## 5.8 · Workflow 6: Referral Engine - Commission 1: Sale

Spec: [6-commission-1-sale.md](../spec/workflows/6-commission-1-sale.md). It runs when staff drag a referred client's deal to `Sold / Enrolled`.

1. Create the workflow with section 5.2, actions 1 to 4, named `Referral Engine - Commission 1: Sale`.
   **Check:** the title is exact, colon included.
2. Add the trigger: search `pipeline stage changed`, click it, add the filters the spec lists (the pipeline `Referred Leads`, the stage `Sold / Enrolled`), then **Save trigger**.
   **Check:** the trigger box shows both filters.
3. Build the spec's steps in order. The step that moves the deal on to `Commission Pending` is **Update opportunity**, acting on the deal that started the workflow.
   **Check:** the canvas holds the spec's steps.
4. Finish with section 5.2, actions 13 to 17.
   **Check:** the double-check shows it as `published`.

## 5.9 · Workflow 7: Referral Engine - Commission 2: Approved

Spec: [7-commission-2-approved.md](../spec/workflows/7-commission-2-approved.md). It runs when staff drag the deal to `Commission Approved`.

1. Create the workflow with section 5.2, actions 1 to 4, named `Referral Engine - Commission 2: Approved`.
   **Check:** the title is exact.
2. Add the trigger **Pipeline Stage Changed** with the spec's filters (the pipeline `Referred Leads`, the stage `Commission Approved`), then **Save trigger**.
   **Check:** the trigger box shows both filters.
3. Build the spec's steps in order.
   **Check:** the canvas holds the spec's steps.
4. Finish with section 5.2, actions 13 to 17.
   **Check:** the double-check shows it as `published`.

## 5.10 · Workflow 8: Referral Engine - Commission 3: Paid, monthly repeat

Spec: [8-commission-3-paid-monthly.md](../spec/workflows/8-commission-3-paid-monthly.md). It runs when staff drag the deal to `Commission Paid`. It records the payment, waits 30 days, and if the deal is still at `Commission Paid`, moves it back to `Commission Pending` for next month. If the client was moved to `Lost / No Sale` in the meantime, the cycle stops. The cycle keeps its state on the deal (the stage and `Commission Status`), with no tags, because tags would pile up on a monthly loop.

1. Create the workflow with section 5.2, actions 1 to 4, named `Referral Engine - Commission 3: Paid, monthly repeat`.
   **Check:** the title is exact, comma included.
2. Add the trigger **Pipeline Stage Changed** with the spec's filters (the pipeline `Referred Leads`, the stage `Commission Paid`), then **Save trigger**.
   **Check:** the trigger box shows both filters.
3. Build the steps before the wait, then the **Wait** step: `30` days.
   **Check:** the wait box reads 30 days.
4. Add the If / else that asks whether the deal is still at `Commission Paid`, with the spec's exact condition and branch names.
   **Check:** two branches show, with the spec's names.
5. Build the "still paid" branch. Its **Update opportunity** moves the deal back to `Commission Pending`, so turn on "allow previous stage".
   **Check:** the branch holds the spec's steps, and "allow previous stage" is on.
6. Build the other branch as the spec says (it ends the cycle).
   **Check:** each step sits in its spec branch.
7. Finish with section 5.2, actions 13 to 17.
   **Check:** the double-check shows it as `published`.

**For the "one fee per closed deal" variant**, build [8b-commission-3-paid-once.md](../spec/workflows/8b-commission-3-paid-once.md) instead of actions 1 to 7:

1. Create the workflow with section 5.2, actions 1 to 4, named `Referral Engine - Commission 3: Paid`.
   **Check:** the title is exact, with no ", monthly repeat".
2. Add the trigger **Pipeline Stage Changed** with the spec's filters (the pipeline `Referred Leads`, the stage `Commission Paid`), then **Save trigger**.
   **Check:** the trigger box shows both filters.
3. Build its one step, `Record payment`, exactly as the spec says. Add no Wait and no If / else.
   **Check:** the canvas holds the trigger, `Record payment`, and the end.
4. Finish with section 5.2, actions 13 to 17.
   **Check:** the double-check shows `Referral Engine - Commission 3: Paid` as `published`, and no FAIL for `... Commission 3: Paid, monthly repeat` (the config's `remove`, [3-structure](3-structure.md), section 3.1, action 5).

## 5.11 · Record and check

1. Run `node tools/ghl/survey.js --client <CLIENT_SLUG> --ids` and paste the whole block into the config as `"ids"`.
   **Check:** `ids.workflows` holds every workflow built in this step. The config is still valid JSON.
2. Run `node tools/ghl/double-check.js --client <CLIENT_SLUG>`.
   **Check:** `PASS` and `published` for every workflow built in this step. `Referral Engine - Affiliate Link` shows `FAIL` until step 6: that is expected. Everything from steps 3 and 4 still passes.
3. Paste the double-check's output into the build record, and add a log line: `YYYY-MM-DD HH:MM · Step 5 done · <N> workflows published`.
   **Check:** both are in the build record.

## If a step fails

- **Clicks on the canvas do nothing.** Check the zoom is 100%, and that the GHL window is visible on screen. Then see the "Workflow builder" table in [ghl-traps.md](ghl-traps.md).
- **Clicks stop working after many edits, or screenshots time out.** The builder wedges after about 20 edits. Click the header **Save** if it still responds, then reload the page. A reload drops unsaved changes, which also makes it a safe undo.
- **A direct workflow link opens a blank page.** Open the workflow from the list page instead.
- **The Inbound Webhook trigger will not save.** It needs a sample: repeat 5.4, actions 4 and 5.
- **A step landed in the wrong If / else branch.** GHL attached it to the first branch. Move it, or delete it and add it again in the right branch, then check both branches.
- **A value you picked in a dropdown is not the one shown.** The list was still moving, or the click hit the wrong row. Take a screenshot, wait for the list to settle, and pick again. In Chrome, hover the option and press Enter.
- **A task went to the wrong person.** The Assign to list stayed open and took a later click. Fix the step: pick `<PLACEHOLDER_USER>`, click the box once more to close it, then Tab on.
- **The double-check says `draft`, or an old version.** The publish or the last edit was not saved. Open the workflow from the list, check the toggle, and click the header **Save**.
- **The spec does not say how to set something.** Stop and ask the operator. Never improvise a setting. Write the answer in the build record.
- **Anything else.** Retry once. If it fails again, tell the operator: `Blocked at step 5.<N>: <what happened>. Need from you: <one thing>.` Then wait.
