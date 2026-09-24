# Workflow 8: Referral Engine - Commission 3: Paid, monthly repeat

| | |
|---|---|
| **GHL name** | `Referral Engine - Commission 3: Paid, monthly repeat` |
| **Purpose** | Staff drag the deal to `Commission Paid` after paying the partner. The workflow records the payment, waits 30 days, and if the deal is still at `Commission Paid`, moves it back to `Commission Pending` with next month's approval task. If staff moved the deal elsewhere during the wait (for example to `Lost / No Sale` when the client cancels), the cycle stops. The state lives on the deal (its stage and `Commission Status`), with no tags, because tags would pile up on a monthly loop |
| **Trigger** | Type **Pipeline Stage Changed**. Search word: `pipeline stage changed` |
| **Trigger name** | `Pipeline Stage Changed` (GHL's default) |
| **Filters** | **In pipeline** = `Referred Leads` · **Pipeline stage** = `Commission Paid` |
| **Settings tab** | **Allow re-entry On** (the loop runs it every month for the same contact) · Allow multiple opportunities **On** · Stop on response **Off**. Not looked at in the first build; GHL's defaults or copied from workflow 6 (confidence high). Check them |
| **Depends on** | Workflows 6 and 7; the deal fields `Commission Status` and `Last Commission Payment Date` |
| **Published in the first build** | Sep 21 2026, version 4 (the wait set back to 30 days after the tests) |

This file is the **monthly percentage** variant. For "one fee per closed deal", build [8b-commission-3-paid-once.md](8b-commission-3-paid-once.md) instead (renamed, no wait, no loop). For "pay per lead", workflow 8 is not built ([variants.md](../variants.md)).

**How the first build made it.** It duplicated workflow 6 (named `Referral Engine - Commission 3: Paid, monthly repeat`), changed the trigger's stage to `Commission Paid`, deleted `Lock attribution`, inserted `Record payment` at the top, then the Wait, then the If / else. GHL put the two copied steps into the If / else's first branch, which is where they belong. Building it from scratch with the tables below gives the same workflow, with fresh rows.

## Steps

| # | Action Name | Action type (search word) | Settings (exact) | Notes / traps |
|---|---|---|---|---|
| 1 | `Record payment` | **Update opportunity** (`update opportunity`) | ALLOW OPPORTUNITY TO MOVE TO ANY PREVIOUS STAGE IN PIPELINE: **Off** · Fields: **Commission Status** = `Paid` (dropdown) · **Last Commission Payment Date** = dynamic **Right now . Date** | No Pipeline or Stage row: the deal stays at `Commission Paid`. Right now . Date: ⋮ → **Dynamic** → tag icon → **Right now** → **Date** (picker label) |
| 2 | `Wait 30 days` | **Wait** (`wait`): "Holds a contact for a specific time, until a condition exists, or until the contact replies" | Selected wait type: **For a set period of time** · Time period: `30` · Unit: `days` | Wait units stop at days, so a month is `30` days. For the loop test it is set to `1` minute and set back afterwards ([8-test](../../process/8-test.md), 8.7) |
| 3 | `Still a paying client?` | **If / else** (search `else`) → **Build your own** | Branch 1, named `Yes, still at Paid`: one condition, **Pipeline stage** **Is** `[Referred Leads] - Commission Paid` (the list shows each stage as `[Pipeline] - Stage`). The other branch is GHL's **`None`** ("When no condition is met") | The condition reads the deal's stage **after** the wait |

### Branch: Yes, still at Paid

The client is still active: open next month's commission.

| # | Action Name | Action type (search word) | Settings (exact) | Notes / traps |
|---|---|---|---|---|
| 4a | `Open next month's commission` | **Update opportunity** | ALLOW OPPORTUNITY TO MOVE TO ANY PREVIOUS STAGE IN PIPELINE: **On** · Fields: **Pipeline** = `Referred Leads` (dropdown) · **Pipeline Stage** = `Commission Pending` (dropdown) · **Commission Status** = `Pending` (dropdown) | The toggle must be **on**: `Commission Pending` is before `Commission Paid`. No Sale Date row. In the first build the `Commission Status` row was copied from workflow 6 and showed as a text value; it worked in the test (confidence high). Build it fresh, picking `Pending` from the list |
| 4b | `Next month approval task` | **Add task** (`add task`) | **Title**: `Monthly partner commission due: {{contact.email}}` · **Description** (`</>` source view): `<p>A month has passed since this client's last partner commission was paid, and the client is still active, so this month's commission is now pending.</p><p><strong>Partner:</strong> {{contact.referring_partner_name}} (ID {{contact.referring_partner_id}})</p><p><strong>Before approving:</strong> 1) Confirm the client paid this month. If they cancelled, move the deal to Lost / No Sale instead: that stops the monthly cycle. 2) Update Client Monthly Revenue if their fee changed. 3) Fill in Reward Amount: <RATE_PERCENT>% of this month's payment.</p><p><strong>Then:</strong> move the deal to Commission Approved. That creates the payout task.</p>` · **Assign to**: `<PLACEHOLDER_USER>` · **Due date**: `1` `Days`, no time · **Skip weekends**: **On** | Replace `<RATE_PERCENT>` with the rate (`15` in the first build) |
| – | END | | | |

### Branch: None (no longer at Paid)

The deal left `Commission Paid` during the wait (`Lost / No Sale`, `Attribution Review` or any other stage). The cycle stops.

| # | Action Name | Action type | Settings | Notes |
|---|---|---|---|---|
| – | END | | | No step |

**The loop.** Step 4a moves the deal back to `Commission Pending`. Staff check the payment and drag it to `Commission Approved` (workflow 7 runs), pay, and drag it to `Commission Paid` (this workflow runs again). `Commission Payments Made` is never counted up: no step writes it.

## Test

Test 5 in [8-test](../../process/8-test.md), section 8.7, actions 5 to 13, on the `<OPP_ID>` of `test.referral2@example.com`.

1. Set step 2 to `1` minute (Unit `minutes`), **Save action**, header **Save**. `double-check.js` shows a higher published version.
2. `move-stage.js ... <OPP_ID> "Commission Paid"`, then `verify-test.js` right away. Expected: `Commission Status` `Paid`, `Last Commission Payment Date` today.
3. Wait 2 minutes, `verify-test.js` again. Expected: the deal back at `Commission Pending`, `Commission Status` `Pending`, a new task `Monthly partner commission due: test.referral2@example.com`.
4. The stop: move the deal to `Commission Paid`, then within 30 seconds to `Lost / No Sale`. After 2 minutes: the deal is still at `Lost / No Sale`, `Commission Status` stays `Paid`, and no new `Monthly partner commission due` task. The execution log shows the run took the `None` branch.
5. Set step 2 back to `30` `days`, **Save action**, header **Save**. `double-check.js` shows a higher published version, and no blue Save with a red dot is left.

The first build ran steps 1 to 5 on Sep 21 2026 and all passed.

## Client-specific values

| Setting | Per client |
|---|---|
| Step 4b description | The rate: `<RATE_PERCENT>%` |
| Step 4b assignee | `<PLACEHOLDER_USER>`, then `<CLIENT_USER>` at handover |
| The whole workflow | Only for the monthly percentage variant. [variants.md](../variants.md) replaces it for the other two |
