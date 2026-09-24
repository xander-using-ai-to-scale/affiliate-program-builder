# Workflow 8b: Referral Engine - Commission 3: Paid (one fee per closed deal)

**Only for the "one fee per closed deal" variant** ([variants.md](../variants.md#one-fee-per-closed-deal)). It replaces [8-commission-3-paid-monthly.md](8-commission-3-paid-monthly.md): build this one **instead of** the monthly workflow, never both. For the monthly percentage (the default), build the monthly file.

**Not yet built with a client.** It is the monthly workflow minus its wait and its loop. Every setting below is copied unchanged from the monthly file, which the first build proved on Sep 21 2026, except where a row says **Changed**.

| | |
|---|---|
| **GHL name** | `Referral Engine - Commission 3: Paid`. **Changed**: no ", monthly repeat" |
| **Purpose** | Staff drag the deal to `Commission Paid` after paying the partner their one fee. The workflow records the payment. Nothing repeats: the fee for this deal is closed |
| **Trigger** | Type **Pipeline Stage Changed**. Search word: `pipeline stage changed` (unchanged) |
| **Trigger name** | `Pipeline Stage Changed` (GHL's default, unchanged) |
| **Filters** | **In pipeline** = `Referred Leads` · **Pipeline stage** = `Commission Paid` (unchanged). If the blueprint renames the pipeline or the stage ([variants.md](../variants.md), the lender example), use the new names |
| **Settings tab** | Allow re-entry **On** · Allow multiple opportunities **On** · Stop on response **Off** (unchanged: GHL's defaults, the same as every workflow). Re-entry does no harm: a deal reaches `Commission Paid` once |
| **Depends on** | Workflows 6 and 7 (built with the fee changes in [variants.md](../variants.md#one-fee-per-closed-deal)); the deal fields `Commission Status` and `Last Commission Payment Date` |
| **In the config** | `"remove": { "workflows": ["Referral Engine - Commission 3: Paid, monthly repeat"] }` and `"workflows": ["Referral Engine - Commission 3: Paid"]`, inside `structure` ([3-structure](../../process/3-structure.md), section 3.1, action 5), so `double-check.js` looks for this name |
| **Built with a client** | Not yet |

## How to build it

Build it from scratch with [5-workflows](../../process/5-workflows.md), section 5.2: actions 1 to 4 with the name above, the trigger and filters above, then the one step below, then actions 13 to 17. Do not duplicate the monthly workflow: it would carry the wait and the If / else.

## Steps

| # | Action Name | Action type (search word) | Settings (exact) | Notes / traps |
|---|---|---|---|---|
| 1 | `Record payment` | **Update opportunity** (`update opportunity`) | ALLOW OPPORTUNITY TO MOVE TO ANY PREVIOUS STAGE IN PIPELINE: **Off** · Fields: **Commission Status** = `Paid` (dropdown) · **Last Commission Payment Date** = dynamic **Right now . Date** | Unchanged from the monthly step 1. No Pipeline or Stage row: the deal stays at `Commission Paid`. Right now . Date: ⋮ → **Dynamic** → tag icon → **Right now** → **Date** (picker label) |
| – | END | | | **Changed**: no `Wait 30 days`, no `Still a paying client?`, no branches, no task |

**No task, so no person slot.** Step 9's placeholder swap has 8 task steps in this variant (7 without Instantly), not 9 ([9-handover](../../process/9-handover.md), section 9.7).

## Test

Test 5 in [8-test](../../process/8-test.md), section 8.7, as [variants.md](../variants.md#one-fee-per-closed-deal) changes it, on the `<OPP_ID>` of `test.referral2@example.com`. There is no wait to shorten, so 8.7 actions 5 and 13 are skipped.

1. After test 5's move to `Commission Approved`: `node tools/ghl/move-stage.js --client <CLIENT_SLUG> <OPP_ID> "Commission Paid"`, then `verify-test.js` right away. Expected: `Commission Status` `Paid`, `Last Commission Payment Date` today, the deal at `Commission Paid`.
2. Wait 2 minutes, then run `verify-test.js` again. Expected: the deal is still at `Commission Paid`, `Commission Status` is still `Paid`, and no new task appeared.
3. Open this workflow's execution log for the contact. Expected: one run, one step, then the end.
4. `double-check.js` shows `Referral Engine - Commission 3: Paid` as `published`, and does not look for `... Commission 3: Paid, monthly repeat`.

## Client-specific values

| Setting | Per client |
|---|---|
| Trigger stage | `Commission Paid`, unless the blueprint renames it ([variants.md](../variants.md)) |
| Everything else | The same in every fee build. There is no rate, no fee and no person in this workflow |
