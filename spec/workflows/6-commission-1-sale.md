# Workflow 6: Referral Engine - Commission 1: Sale

| | |
|---|---|
| **GHL name** | `Referral Engine - Commission 1: Sale` |
| **Purpose** | Staff drag a referred client's deal to `Sold / Enrolled`. The workflow records the sale, opens the commission (`Commission Status` `Pending`, the deal moved on to `Commission Pending`), locks the credit, and gives staff an approval task |
| **Trigger** | Type **Pipeline Stage Changed**. Search word: `pipeline stage changed` |
| **Trigger name** | `Pipeline Stage Changed` (GHL's default) |
| **Filters** | **In pipeline** = `Referred Leads` · **Pipeline stage** = `Sold / Enrolled`. The canvas shows `In pipeline is "Referred Leads"` and `Pipeline stage is "Sold / Enrolled"` |
| **Settings tab** | Allow re-entry **On** · Allow multiple opportunities **On** · Stop on response **Off**. Not looked at in the first build; GHL's defaults (confidence high). Check them |
| **Depends on** | The pipeline `Referred Leads`; the deal fields `Commission Status` and `Sale Date`; the contact field `Attribution Lock` |
| **Published in the first build** | Sep 21 2026, version 3 |

This file is the **monthly percentage** variant. For another variant, [variants.md](../variants.md) says what changes.

## Steps

| # | Action Name | Action type (search word) | Settings (exact) | Notes / traps |
|---|---|---|---|---|
| 1 | `Record sale, open commission` | **Update opportunity** (`update opportunity`) | ALLOW OPPORTUNITY TO MOVE TO ANY PREVIOUS STAGE IN PIPELINE: **Off** · Fields: **Pipeline** = `Referred Leads` (dropdown) · **Pipeline Stage** = `Commission Pending` (dropdown) · **Commission Status** = `Pending` (dropdown) · **Sale Date** = dynamic **Right now . Date** | Acts on the deal that started the workflow: no Find opportunity needed. For Sale Date: the ⋮ next to the value → **Dynamic** → the tag icon → **Right now** → **Date** (picker label; its raw text was never seen). `Commission Pending` comes after `Sold / Enrolled`, so the previous-stage toggle stays off |
| 2 | `Lock attribution` | **Update contact field** (`update contact field`) → **Update field data** | **Attribution Lock** = `Locked` (dropdown) | |
| 3 | `Approve commission task` | **Add task** (`add task`) | **Title**: `Approve partner commission: {{contact.email}}` · **Description** (`</>` source view): `<p>This referred client just became a paying client, so a partner commission is now pending.</p><p><strong>Partner:</strong> {{contact.referring_partner_name}} (ID {{contact.referring_partner_id}})</p><p><strong>Before approving:</strong> 1) Fill in Client Monthly Revenue on the deal. 2) Confirm the client has paid for this month. 3) Confirm the credit is settled (Attribution Confidence is not Conflicting). 4) Fill in Reward Amount: <RATE_PERCENT>% of what the client paid this month.</p><p><strong>Then:</strong> move the deal to Commission Approved. That creates the payout task.</p>` · **Assign to**: `<PLACEHOLDER_USER>` · **Due date**: `1` `Days`, no time · **Skip weekends**: **On** | Replace `<RATE_PERCENT>` with the rate (`15` in the first build). The Assign to list misbehaved here in the first build: pick the user, click the box again to close it, press Tab, then check the name shown |
| – | END | | | |

## Test

Test 5 in [8-test](../../process/8-test.md), section 8.7, actions 1 and 2. It uses the deal of `test.referral2@example.com` (from `enroll.js staffC`), the `<OPP_ID>`.

1. `node tools/ghl/move-stage.js --client <CLIENT_SLUG> <OPP_ID> "Sold / Enrolled"` (the first build also passed a monthly revenue, `1500`, which `move-stage.js` writes into `Client Monthly Revenue`).
2. After 1 minute, `verify-test.js` on `test.referral2@example.com`. Expected: the deal is at `Commission Pending` (it moved on by itself); `Sale Date` today (the API shows it as midnight UTC in epoch milliseconds); `Commission Status` `Pending`; the contact's `Attribution Lock` `Locked`; a task `Approve partner commission: test.referral2@example.com` on `<PLACEHOLDER_USER>`.

## Client-specific values

| Setting | Per client |
|---|---|
| Step 3 description | The rate: `<RATE_PERCENT>%` |
| Step 3 assignee | `<PLACEHOLDER_USER>`, then `<CLIENT_USER>` at handover |
| Trigger stage, step 1 stages | `Sold / Enrolled`, `Commission Pending`, unless the blueprint renames them ([variants.md](../variants.md)) |
