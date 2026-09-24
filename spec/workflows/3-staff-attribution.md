# Workflow 3: Referral Engine - Staff Attribution

| | |
|---|---|
| **GHL name** | `Referral Engine - Staff Attribution` |
| **Purpose** | Staff log a referral that came by an email introduction, a call or a walk-in. The same rules as workflow 2: the first claim gets the credit (method `Staff Entered`), a later claim goes to `Attribution Review` |
| **Trigger** | Type **Form Submitted**. Search word: `form submitted` |
| **Trigger name** | `Form Submitted` (GHL's default) |
| **Filters** | `Form is` → `Staff Attribution` |
| **Settings tab** | Allow re-entry **On** · Allow multiple opportunities **On** · Stop on response **Off**. Not looked at in the first build; they came over with the copy and are GHL's defaults (confidence high). Check them |
| **Depends on** | Workflow 2, built and published (this one is its copy); the form `Staff Attribution`; for step 4b, the Affiliate Manager campaign (step 6) |
| **Published in the first build** | Sep 21 2026; step 4b added Sep 22; version 4 |

## How to build it: duplicate workflow 2, then check every row

1. On the workflows list, open the **⋮** on `Referral Engine - Referral Capture` → **Duplicate**. The dialog asks "What should be the name of the copied workflow?" (default `Copy - Referral Engine - Referral Capture`). Type `Referral Engine - Staff Attribution` → **Create**.
2. Open the copy from the list. Change the trigger's filter to `Form is` → `Staff Attribution`, and **Save trigger**.
3. In `Record first claim`, change **Referral Attribution Method** to `Staff Entered`. Delete that row and add it again, picking `Staff Entered` from the dropdown (see the duplication gap below).
4. **Check or re-add every Update opportunity row as a dropdown value.** Open `Move deal to Attribution Review` (step 5e). Delete its **Pipeline** row and add it again, picking `Referred Leads` from the list; delete its **Pipeline Stage** row and add it again, picking `Attribution Review` from the list. Save the action.
5. Compare every other step with the tables below: names, values, task texts. They should match workflow 2's exactly.
6. Step 4b (`File the lead under its partner`) is added in step 6, as in workflow 2.

**The duplication gap** (confidence: medium). Duplicating a workflow can turn an Update opportunity row's dropdown value into free text: it happened to `Commission Status` in the first build's workflow 7, whose rows were then re-added. In this workflow, the first build **never re-added or tested** step 5e after duplicating. Whether its `Referred Leads` / `Attribution Review` values survived as dropdown values is unknown. The first build also showed an orange marker next to `Staff Entered` in `Record first claim` after the change; the test wrote `Staff Entered` correctly, so it may be cosmetic, or a sign of a typed value (confidence: medium). Re-adding the rows (actions 3 and 4 above) removes both doubts.

## Steps

The same as workflow 2 ([2-referral-capture.md](2-referral-capture.md)), with the differences in **bold**.

| # | Action Name | Action type (search word) | Settings (exact) | Notes / traps |
|---|---|---|---|---|
| 1 | `Mark as Referred Lead` | **Update contact field** → **Update field data** | **Contact Role** = `Referred Lead` | |
| 2 | `Add Tag` | **Add contact tag** | Tag: `referred-lead` | |
| 3 | `First claim or already claimed?` | **If / else** (`else`) → **Build your own** | Branch `First claim`: **Referring Partner ID** **Is empty**. Other branch: `None` | |

### Branch: First claim

| # | Action Name | Action type (search word) | Settings (exact) | Notes / traps |
|---|---|---|---|---|
| 4a | `Record first claim` | **Update contact field** → **Update field data** | 8 rows, in order: **Referring Partner ID** = `{{contact.claimed_partner_id}}` · **Referring Partner Name** = `{{contact.claimed_partner_name}}` · **Referral Code** = `{{contact.claimed_referral_code}}` · **Referral Evidence** = `{{contact.claim_notes}}` · **Referral Source Type** = `Partner` · **Referral Attribution Method** = **`Staff Entered`** · **Attribution Confidence** = `Claimed` · **Referral Date** = **Current date** | The only step that differs from workflow 2 |
| 4b | `File the lead under its partner` | **Add leads under an affiliate** (`affiliate`) | **Choose action mapping**: `Custom Mapping` · **AM ID**: tag icon → **Contact → Custom Fields → Referral Code** (`{{contact.referral_code}}`) | **Added in step 6**, directly under `Record first claim`. It files the lead only when staff typed the partner's Referral ID into the form's `Referral code (if they gave one)` box. Otherwise it errors: Not yet proven whether GHL then runs 4c and 4d |
| 4c | `Open referred-lead deal` | **Create opportunity** | Pipeline `Referred Leads` · Duplicate opportunity **Disabled** · **Opportunity Name** = `{{contact.email}}` · **Pipeline Stage** = `Referral Received` · **Opportunity Source** = `Partner referral` | The source stays `Partner referral` (the first build did not change it) |
| 4d | `Referral follow-up` | **Add task** | Title, description, assignee, due date and weekend skip exactly as workflow 2's step 4d: title `Contact referred lead {{contact.email}} from partner {{contact.claimed_partner_name}}`, the same HTML description, **Assign to** `<PLACEHOLDER_USER>`, `1` `Days`, **Skip weekends** **On** | The task text still says "partner referral": the first build left it |
| – | END | | | |

### Branch: None (later claim)

| # | Action Name | Action type (search word) | Settings (exact) | Notes / traps |
|---|---|---|---|---|
| 5a | `Add Tag` | **Add contact tag** | Tag: `referral-attribution-conflict` | |
| 5b | `Mark attribution conflicting` | **Update contact field** → **Update field data** | **Attribution Confidence** = `Conflicting` | |
| 5c | `Attribution review task` | **Add task** | Exactly as workflow 2's step 5c: title `Review attribution conflict: {{contact.email}}`, the same HTML description, **Assign to** `<PLACEHOLDER_USER>`, `1` `Days`, **Skip weekends** **On** | |
| 5d | `Find the referred-lead deal` | **Find opportunity** | `Most recently created opportunity` · **Pipeline** **Is** `Referred Leads` · **Opportunity Name** **Is** `{{contact.email}}` | Branches **Opportunity Found** / **Opportunity Not Found** |

#### Branch: Opportunity Found

| # | Action Name | Action type (search word) | Settings (exact) | Notes / traps |
|---|---|---|---|---|
| 5e | `Move deal to Attribution Review` | **Update opportunity** | Previous-stage toggle **Off** · **Pipeline** = `Referred Leads` · **Pipeline Stage** = `Attribution Review`, **both re-added and picked from their lists** after duplicating | The duplication gap, above |
| – | END | | | |

#### Branch: Opportunity Not Found

| # | Action Name | Action type | Settings | Notes |
|---|---|---|---|---|
| – | END | | | |

## Test

Test 3 in [8-test](../../process/8-test.md): `node tools/ghl/enroll.js --client <CLIENT_SLUG> staffC`, then `verify-test.js` on `test.referral2@example.com`.

Expected readback: `Contact Role` `Referred Lead`; tag `referred-lead`; `Referring Partner ID` `TEST-PARTNER-C`, `Referring Partner Name` `Test Partner C`, `Referral Code` `TESTC`; **`Referral Attribution Method` `Staff Entered`**; `Attribution Confidence` `Claimed`; `Referral Source Type` `Partner`; `Referral Date` today; one deal `Referred Leads` / `Referral Received`, named `test.referral2@example.com`, source `Partner referral`; task `Contact referred lead test.referral2@example.com from partner Test Partner C`. Record the deal's id: it is the `<OPP_ID>` for the commission tests.

Not yet proven: the conflict branch of this workflow. The first build never ran a second claim through it. To prove step 5e after re-adding its rows, run `enroll.js staffC` a second time with the operator's OK and check that the deal moves to `Attribution Review` (then move it back with `move-stage.js` to `Referral Received` before the commission tests). The standard test suite does not include this; write the result in the build record if you run it.

## Client-specific values

| Setting | Per client |
|---|---|
| Step 4d and 5c assignee | `<PLACEHOLDER_USER>`, then `<CLIENT_USER>` at handover |
| Everything else | The same in every build, and the same as workflow 2 except the method |
