# Workflow 7: Referral Engine - Commission 2: Approved

| | |
|---|---|
| **GHL name** | `Referral Engine - Commission 2: Approved` |
| **Purpose** | Staff drag the deal to `Commission Approved` after checking the client paid. The workflow records the approval and gives staff a payout task. The deal stays at `Commission Approved` |
| **Trigger** | Type **Pipeline Stage Changed**. Search word: `pipeline stage changed` |
| **Trigger name** | `Pipeline Stage Changed` (GHL's default) |
| **Filters** | **In pipeline** = `Referred Leads` · **Pipeline stage** = `Commission Approved` |
| **Settings tab** | **Allow re-entry On** (checked after publishing in the first build: the monthly cycle runs it every month for the same contact) · Allow multiple opportunities **On** · Stop on response **Off** (seen in the first build) |
| **Depends on** | Workflow 6 (the first build made this one by duplicating it); the deal fields `Commission Status` and `Commission Approval Date` |
| **Published in the first build** | Sep 21 2026, version 3 |

**How the first build made it.** Workflows list → **⋮** on `Referral Engine - Commission 1: Sale` → **Duplicate** → named `Referral Engine - Commission 2: Approved`. Then: the trigger's stage changed to `Commission Approved`; the step `Lock attribution` deleted (open it → the red **Delete** at the bottom left → confirm); the Update opportunity step renamed, **all its copied rows deleted and two fresh rows added** (the copied `Commission Status` had turned into free text); the task renamed and rewritten. Building it from scratch with the table below gives the same workflow.

## Steps

| # | Action Name | Action type (search word) | Settings (exact) | Notes / traps |
|---|---|---|---|---|
| 1 | `Record approval` | **Update opportunity** (`update opportunity`) | ALLOW OPPORTUNITY TO MOVE TO ANY PREVIOUS STAGE IN PIPELINE: **Off** · Fields, only these two: **Commission Approval Date** = dynamic **Right now . Date** · **Commission Status** = `Approved` (dropdown) | No Pipeline or Pipeline Stage row: the deal stays where staff put it. Right now . Date: the ⋮ → **Dynamic** → tag icon → **Right now** → **Date** (picker label). If you duplicated workflow 6, delete every copied row and add these two fresh |
| 2 | `Payout task` | **Add task** (`add task`) | **Title**: `Pay partner commission for {{contact.email}}` · **Description** (`</>` source view): `<p>The commission for this client is approved. Pay the partner now.</p><p><strong>Partner:</strong> {{contact.referring_partner_name}} (ID {{contact.referring_partner_id}})</p><p><strong>Amount:</strong> the Reward Amount on this deal (<RATE_PERCENT>% of what the client paid this month).</p><p><strong>How:</strong> open the partner's own contact (search their Partner ID) to see their payment preference: ACH, check, PayPal and so on.</p><p><strong>After paying:</strong> move the deal to Commission Paid. The system then waits one month and opens next month's commission by itself.</p>` · **Assign to**: `<PLACEHOLDER_USER>` · **Due date**: `1` `Days`, no time · **Skip weekends**: **On** | Replace `<RATE_PERCENT>` with the rate (`15` in the first build) |
| – | END | | | |

## Test

Test 5 in [8-test](../../process/8-test.md), section 8.7, actions 3, 4 and 8.

1. `node tools/ghl/move-stage.js --client <CLIENT_SLUG> <OPP_ID> "Commission Approved"`.
2. After 1 minute, `verify-test.js` on `test.referral2@example.com`. Expected: `Commission Status` `Approved`; `Commission Approval Date` today; the deal still at `Commission Approved`; a task `Pay partner commission for test.referral2@example.com` on `<PLACEHOLDER_USER>`.
3. Month two (after workflow 8 has brought the deal back to `Commission Pending`): move it to `Commission Approved` again. Expected: a second payout task, and a second run in this workflow's execution log. Not yet proven: the first build did not run this second approval (it proved the loop back to `Commission Pending`, then the stop). If there is no second run, compare the Settings tab with this file: re-entry must be on.

## Client-specific values

| Setting | Per client |
|---|---|
| Step 2 description | The rate: `<RATE_PERCENT>%` |
| Step 2 assignee | `<PLACEHOLDER_USER>`, then `<CLIENT_USER>` at handover |
| Trigger stage | `Commission Approved`, unless the blueprint renames it ([variants.md](../variants.md)) |
