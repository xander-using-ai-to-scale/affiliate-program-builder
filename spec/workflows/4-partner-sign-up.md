# Workflow 4: Referral Engine - Partner Sign-Up

| | |
|---|---|
| **GHL name** | `Referral Engine - Partner Sign-Up` |
| **Purpose** | Sets up each new partner: role, Partner ID, commission terms, a first personal link, tags, a deal at `Partner Lifecycle` → `Onboarding` and an onboarding task. Then makes them an affiliate in GHL's Affiliate Manager and adds them to the campaign, which sends GHL's portal invite and starts workflow 5 |
| **Trigger** | Type **Form Submitted**. Search word: `form submitted` |
| **Trigger name** | `Form Submitted` (GHL's default) |
| **Filters** | `Form is` → `Partner Sign-Up` |
| **Settings tab** | Allow re-entry **On** · Allow multiple opportunities **On** · Stop on response **Off**. Not looked at in the first build; GHL's defaults (confidence high). Check them |
| **Depends on** | The form `Partner Sign-Up`; the form `Refer a Client` and its id `<REFER_FORM_ID>` (for the first link); the pipeline `Partner Lifecycle`; the tags `referral-partner` and `partner-onboarding`; for steps 5 and 6, the Affiliate Manager campaign `<PROGRAM_NAME>` (step 6) |
| **Published in the first build** | Sep 21 2026; steps 5 and 6 added Sep 22; version 4 |

This file is the **monthly percentage** variant. For another variant, [variants.md](../variants.md) says what changes in steps 1 and 4.

## Steps

| # | Action Name | Action type (search word) | Settings (exact) | Notes / traps |
|---|---|---|---|---|
| 1 | `Set up as partner` | **Update contact field** (`update contact field`) → **Update field data** | 5 rows, in order: **Contact Role** = `Referral Partner` (dropdown) · **Partner ID** = `{{contact.id}}` · **Reward Model** = `Revenue Share` (dropdown) · **Revenue Share Percent** = `<RATE_PERCENT>` as a plain number (`15` in the first build) · **Affiliate Link** = `https://api.leadconnectorhq.com/widget/form/<REFER_FORM_ID>?claimed_partner_id={{contact.id}}&claimed_partner_name={{contact.first_name}}%20{{contact.last_name}}` | Replace `<REFER_FORM_ID>` with the Refer a Client form's id from the config. Type the link in 6 pieces, one after the other with no spaces: the text up to `claimed_partner_id=`, then `{{contact.id}}`, then `&claimed_partner_name=`, then `{{contact.first_name}}`, then `%20`, then `{{contact.last_name}}`. This first link has no `am_id`: workflow 5 overwrites it seconds later |
| 2 | `Add Tag` | **Add contact tag** (`tag`) | Tags: `referral-partner`, `partner-onboarding` | One tag at a time; wait for the list |
| 3 | `Open partner deal` | **Create opportunity** (`create opportunity`) | Pipeline: `Partner Lifecycle` · Duplicate opportunity: **Disabled** · Fields: **Pipeline Stage** = `Onboarding` · **Opportunity Name** = `{{contact.email}}` · **Opportunity Source** = `Partner sign-up form` | Delete the pre-filled Contact Source chip before typing the source |
| 4 | `Onboarding task` | **Add task** (`add task`) | **Title**: `Onboard new referral partner: {{contact.email}}` · **Description** (`</>` source view): `<p>A new referral partner signed up through the Partner Sign-Up form. Their answers are on the contact: partner type, partnership type, who their clients are, and payment preference.</p><p><strong>Their referral link</strong> (Affiliate Link field): {{contact.affiliate_link}}</p><p><strong>To onboard:</strong> 1) Check they are a fit. 2) Send the partner agreement (<RATE_PERCENT>% recurring for the life of each referred client) and fill in Agreement Signed Date. 3) Send them their referral link. 4) Optional: give them a short Referral Code. 5) When they are set up, move their deal from Onboarding to Activated.</p><p>No welcome email goes out automatically yet: that copy needs approval first.</p>` · **Assign to**: `<PLACEHOLDER_USER>` · **Due date**: `1` `Days`, no time · **Skip weekends**: **On** | Replace `<RATE_PERCENT>` with the rate (the first build: `15% recurring`). The task shows the link as it stood when the task was made: the first link, before workflow 5 rewrote it. The partner's `Affiliate Link` field holds the final one. Item 4) was written before the Affiliate Manager was added. A partner's `Referral Code` is now their Referral ID, written by workflow 5. If staff change it, they change the Referral ID on the partner's affiliate profile (**Customize**) and update `Referral Code` and `Affiliate Link` to match ([affiliate-manager.md](../affiliate-manager.md)) |
| 5 | `Add to affiliate manager` | **Add to affiliate manager** (`affiliate`): "Adds the contact to an affiliate manager" | Only the Action Name. There is no campaign field | **Added in step 6** ([6-affiliate-manager](../../process/6-affiliate-manager.md), section 6.3). `Add to affiliate manager` is GHL's default Action Name: keep it |
| 6 | `Add to affiliate campaign` | **Add to affiliate campaign** (`affiliate`): "Adds the contact to an affiliate campaign" | **Affiliate campaign** = `<PROGRAM_NAME>` (picked from the list) | **Added in step 6**, directly under step 5. `Add to affiliate campaign` is GHL's default Action Name: keep it. Because the campaign's "Send affiliate email notification" is on, GHL emails the partner an invite to the affiliate portal (their login), and the enrolment starts workflow 5 |
| – | END | | | |

Step 1's first link and step 4's description are internal: not DRAFT. The onboarding steps in the description are the first build's; the operator may reword them for the client.

## Test

Tests 4 and 6 in [8-test](../../process/8-test.md): `enroll.js partnerD`, then `enroll.js partnerE`. Read back with `verify-test.js`.

| Scenario | Expected readback |
|---|---|
| `partnerD` → `test.partner.d@example.com` | `Contact Role` `Referral Partner`; `Partner ID` = the contact's own id; `Reward Model` `Revenue Share`; `Revenue Share Percent` `<RATE_PERCENT>`; `Partner Type`, `Partnership Type`, `Partner Notes`, `Payment Preference` as `enroll.js` wrote them; tags `referral-partner`, `partner-onboarding`; one deal `Partner Lifecycle` / `Onboarding`, named `test.partner.d@example.com`, source `Partner sign-up form`; task `Onboard new referral partner: test.partner.d@example.com` on `<PLACEHOLDER_USER>`. After a minute, `Affiliate Link` holds GHL's affiliate link (with `?am_id=`) plus `&claimed_partner_id=` and `&claimed_partner_name=` (workflow 5 rewrote it) |
| `partnerE` → `test.partner.e@example.com` | The same as partnerD for this contact, and in **Marketing → Affiliate Manager** the partner is listed under the campaign `<PROGRAM_NAME>`. Workflow 5's checks follow ([5-affiliate-link.md](5-affiliate-link.md)) |

The execution log shows all six steps ran. In the first build, test 4 ran on Sep 21 before steps 5 and 6 existed, and gave the first link: `https://api.leadconnectorhq.com/widget/form/<REFER_FORM_ID>?claimed_partner_id=<contact id>&claimed_partner_name=Test%20Partner D` (a space in the last name is not encoded: hence `enroll.js` uses the last name `PartnerE` for partner E).

Not yet proven: GHL's invite email. The test partners use `@example.com`, so no invite arrived anywhere. Its text is GHL's **Default Template**, never opened (confidence high that it is GHL's default).

## Client-specific values

| Setting | Per client |
|---|---|
| Step 1, `Revenue Share Percent` | `<RATE_PERCENT>`. For another variant: [variants.md](../variants.md) |
| Step 1, `Reward Model` | `Revenue Share` for monthly percentage; [variants.md](../variants.md) for the others |
| Step 1, `Affiliate Link` | The client's `<REFER_FORM_ID>` |
| Step 4 description | The rate and its terms (`<RATE_PERCENT>% recurring for the life of each referred client`) |
| Step 4 assignee | `<PLACEHOLDER_USER>`, then `<CLIENT_USER>` at handover |
| Step 6 campaign | `<PROGRAM_NAME>` |
