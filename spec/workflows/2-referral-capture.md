# Workflow 2: Referral Engine - Referral Capture

| | |
|---|---|
| **GHL name** | `Referral Engine - Referral Capture` |
| **Purpose** | A partner registers a client through their link. The **first** claim on a contact gets the credit: the claim is copied into the real credit fields, the lead is filed under the partner in the Affiliate Manager, a deal opens at `Referred Leads` → `Referral Received`, and staff get a follow-up task. A **later** claim overwrites nothing: it is flagged as a conflict, the deal moves to `Attribution Review`, and staff get a review task |
| **Trigger** | Type **Form Submitted**. Search word: `form submitted` |
| **Trigger name** | `Form Submitted` (GHL's default, unchanged) |
| **Filters** | `Form is` → `Refer a Client`. The canvas shows `Form is is any of "Refer a Client"` |
| **Settings tab** | Allow re-entry **On** · Allow multiple opportunities **On** · Stop on response **Off** (seen in the first build). Re-entry matters: the same contact runs it again on a second claim |
| **Depends on** | The form `Refer a Client`; the 4 claim fields (`Claimed Partner ID`, `Claimed Partner Name`, `Claimed Referral Code`, `Claim Notes`) and the credit fields; the tags `referred-lead` and `referral-attribution-conflict`; the pipeline `Referred Leads`; for step 4b, the Affiliate Manager campaign (step 6) |
| **Published in the first build** | Sep 21 2026; step 4b added Sep 22; version 6 |

## Steps

| # | Action Name | Action type (search word) | Settings (exact) | Notes / traps |
|---|---|---|---|---|
| 1 | `Mark as Referred Lead` | **Update contact field** (`update contact field`) → **Update field data** | **Contact Role** = `Referred Lead` (dropdown) | |
| 2 | `Add Tag` | **Add contact tag** (`tag`) | Tag: `referred-lead` | |
| 3 | `First claim or already claimed?` | **If / else** (search `else`: `If/Else` finds nothing) → scenario recipe **Build your own** | Branch 1, named `First claim`: one condition, **Referring Partner ID** **Is empty**. The other branch is GHL's **`None`** ("When none of the conditions are met") | Name the first branch exactly `First claim`. The condition is on `Referring Partner ID` (the real credit field), never on a Claimed field: the form has just written the Claimed fields |

### Branch: First claim

Runs when `Referring Partner ID` is empty: nobody has the credit yet.

| # | Action Name | Action type (search word) | Settings (exact) | Notes / traps |
|---|---|---|---|---|
| 4a | `Record first claim` | **Update contact field** → **Update field data** | 8 rows, in this order: **Referring Partner ID** = `{{contact.claimed_partner_id}}` · **Referring Partner Name** = `{{contact.claimed_partner_name}}` · **Referral Code** = `{{contact.claimed_referral_code}}` · **Referral Evidence** = `{{contact.claim_notes}}` · **Referral Source Type** = `Partner` (dropdown) · **Referral Attribution Method** = `Partner Submission` (dropdown) · **Attribution Confidence** = `Claimed` (dropdown) · **Referral Date** = **Current date** (the field's dropdown option) | Searching `Referral Code` in Select field lists two fields: pick `Referral Code`, not `Claimed Referral Code` |
| 4b | `File the lead under its partner` | **Add leads under an affiliate** (`affiliate`): "Adds leads under the selected affiliate campaign and affiliate" | **Choose action mapping**: `Custom Mapping` (the other options are Manual and Auto-Track Affiliate Via Attribution) · **AM ID**: from the tag icon, **Contact → Custom Fields → Referral Code**, which gives `{{contact.referral_code}}` | **Added in step 6** ([6-affiliate-manager](../../process/6-affiliate-manager.md), section 6.6), directly under `Record first claim`. With Custom Mapping there is no campaign picker ("When custom mapping is turned on, you can link your own custom fields or values to the affiliate ID (am_id)"): the `am_id` names the affiliate and its campaign. If the code is not a real Referral ID (as in test 1), this step errors. Not yet proven: whether GHL then runs the steps below it (see Test) |
| 4c | `Open referred-lead deal` | **Create opportunity** (`create opportunity`) | Pipeline: `Referred Leads` · Duplicate opportunity: **Disabled** · Fields: **Opportunity Name** = `{{contact.email}}` · **Pipeline Stage** = `Referral Received` · **Opportunity Source** = `Partner referral` | Delete the pre-filled Contact Source chip before typing the source. A composite name (`{{contact.name}} - {{contact.company_name}}`) did not take in the first build: use the email |
| 4d | `Referral follow-up` | **Add task** (`add task`) | **Title**: `Contact referred lead {{contact.email}} from partner {{contact.claimed_partner_name}}` · **Description** (`</>` source view): `<p>New partner referral. Contact them within 1 business day.</p><p>Referred by: {{contact.claimed_partner_name}} (partner ID {{contact.claimed_partner_id}}, code {{contact.claimed_referral_code}})</p><p>Client: {{contact.name}} - {{contact.company_name}} - {{contact.phone}}</p><p>What they need: {{contact.claim_notes}}</p>` · **Assign to**: `<PLACEHOLDER_USER>` · **Due date**: `1` `Days`, no time · **Skip weekends**: **On** | Type the title in pieces (text, then a merge field, then text): typed in one go, it did not take. Close the Assign to list with a click, then Tab |
| – | END | | | |

### Branch: None (later claim)

Runs when `Referring Partner ID` already has a value: another partner (or the same one) claimed this contact before.

| # | Action Name | Action type (search word) | Settings (exact) | Notes / traps |
|---|---|---|---|---|
| 5a | `Add Tag` | **Add contact tag** | Tag: `referral-attribution-conflict` | |
| 5b | `Mark attribution conflicting` | **Update contact field** → **Update field data** | **Attribution Confidence** = `Conflicting` (dropdown) | Overwrites no credit field |
| 5c | `Attribution review task` | **Add task** | **Title**: `Review attribution conflict: {{contact.email}}` · **Description** (`</>` source view): `<p>A second partner claimed this client. Nothing was overwritten: the first partner keeps the credit until you decide.</p><p><strong>Current credit:</strong> {{contact.referring_partner_name}} (ID {{contact.referring_partner_id}})</p><p><strong>New claim:</strong> {{contact.claimed_partner_name}} (ID {{contact.claimed_partner_id}}, code {{contact.claimed_referral_code}})</p><p><strong>Their notes:</strong> {{contact.claim_notes}}</p><p><strong>To resolve:</strong> 1) Decide who gets credit. 2) If the new partner wins, copy their name and ID into Referring Partner Name / ID and add the reason to Referral Evidence. 3) Set Attribution Confidence to Verified. 4) Remove the referral-attribution-conflict tag. 5) Move the deal from Attribution Review back to its stage (the deal's history shows it).</p>` · **Assign to**: `<PLACEHOLDER_USER>` · **Due date**: `1` `Days`, no time · **Skip weekends**: **On** | The canvas shows it as "#2 Attribution review task" |
| 5d | `Find the referred-lead deal` | **Find opportunity** (`find opportunity`) | **Opportunity to be found**: `Most recently created opportunity` · Fields (all must match): **Pipeline** **Is** `Referred Leads` · **Opportunity Name** **Is** `{{contact.email}}` | It splits the canvas into **Opportunity Found** and **Opportunity Not Found**. Never use Create opportunity to move a deal: with duplicates disabled it silently does nothing |

#### Branch: Opportunity Found

| # | Action Name | Action type (search word) | Settings (exact) | Notes / traps |
|---|---|---|---|---|
| 5e | `Move deal to Attribution Review` | **Update opportunity** (`update opportunity`) | ALLOW OPPORTUNITY TO MOVE TO ANY PREVIOUS STAGE IN PIPELINE: **Off** · Fields: **Pipeline** = `Referred Leads` (dropdown) · **Pipeline Stage** = `Attribution Review` (dropdown) | Acts on the deal step 5d found. `Attribution Review` is the last stage, so no "previous stage" toggle is needed |
| – | END | | | |

#### Branch: Opportunity Not Found

| # | Action Name | Action type | Settings | Notes |
|---|---|---|---|---|
| – | END | | | Nothing to move |

**Branch placement.** When you insert an If / else (or a Find opportunity) in the middle of a chain, GHL attaches the steps below it to its **first** branch. Build step 3 before the branch steps, then check every step sits in the branch these tables name.

## Test

Tests 1, 2 and 7 in [8-test](../../process/8-test.md): `enroll.js claimA`, `claimB`, `claimE`. Read back with `verify-test.js`.

| Scenario | Expected readback |
|---|---|
| `claimA` → `test.referral1@example.com` (first claim) | `Contact Role` `Referred Lead`; tag `referred-lead`; `Referring Partner ID` `TEST-PARTNER-A`, `Referring Partner Name` `Test Partner A`, `Referral Code` `TESTA` (the same as the Claimed fields); `Referral Evidence` = the `Claim Notes` text; `Referral Source Type` `Partner`; `Referral Attribution Method` `Partner Submission`; `Attribution Confidence` `Claimed`; `Referral Date` today; one deal `Referred Leads` / `Referral Received`, named `test.referral1@example.com`, source `Partner referral`; task `Contact referred lead test.referral1@example.com from partner Test Partner A` on `<PLACEHOLDER_USER>`, due the next day |
| `claimB` → the same contact (later claim) | Credit fields unchanged (still partner A). Claimed fields now partner B's (`TEST-PARTNER-B`, `Test Partner B`, `TESTB`). Tag `referral-attribution-conflict`; `Attribution Confidence` `Conflicting`; still one deal, now at `Attribution Review`; task `Review attribution conflict: test.referral1@example.com`. The execution log shows the `None` branch, and step 4b did not run |
| `claimE` → `test.referral3@example.com` (through partner E's link) | Credit to partner E (their contact id, their name, their Referral ID in `Referral Code`); `Partner Submission`, `Claimed`; deal at `Referral Received`; follow-up task. Step 4b ran without an error, and the Affiliate Manager shows the lead under E, source Forms |

Not yet proven: the first build ran `claimA` and `claimB` on Sep 21, before step 4b existed. With step 4b in place, `claimA`'s fake code `TESTA` makes step 4b error. If the deal and the task are then missing, GHL stopped at the failed step: tell the operator ([8-test](../../process/8-test.md), "If a step fails").

## Client-specific values

| Setting | Per client |
|---|---|
| Step 4d and 5c assignee | `<PLACEHOLDER_USER>`, then `<CLIENT_USER>` at handover |
| Everything else | The same in every build. If the blueprint renames the `Referred Leads` pipeline or its stages ([variants.md](../variants.md)), use the new names in steps 4c, 5d and 5e. Homeowner clients and phone-only referrals change steps 4c, 4d, 5c and 5d exactly as [variants.md](../variants.md), "Client differences", says |
