# Workflow 5: Referral Engine - Affiliate Link

| | |
|---|---|
| **GHL name** | `Referral Engine - Affiliate Link` |
| **Purpose** | Runs when a partner joins the Affiliate Manager campaign. Writes the partner's one link into `Affiliate Link`: GHL's affiliate link (which already ends in `?am_id=<their Referral ID>`) plus our Partner ID and name. Writes their Referral ID into `Referral Code`. It overwrites the first link that workflow 4 wrote |
| **Trigger** | Type **Affiliate enrolled in campaign** ("Runs when a Affiliate will be added in the campaign."). Search word: `affiliate` |
| **Trigger name** | `Affiliate Enrolled In Campaign` (GHL's default) |
| **Filters** | **Campaign** **Is** `<PROGRAM_NAME>` |
| **Settings tab** | Allow re-entry **On** · Allow multiple opportunities **On** · Stop on response **Off**. Not looked at in the first build; GHL's defaults (confidence high). Check them |
| **Depends on** | The Affiliate Manager campaign `<PROGRAM_NAME>`, published ([affiliate-manager.md](../affiliate-manager.md)); the fields `Affiliate Link` and `Referral Code` |
| **Built in** | Step 6 ([6-affiliate-manager](../../process/6-affiliate-manager.md), section 6.4), in the first build on Sep 22 2026; version 3 |

**Build and publish it before any real partner signs up.** A partner who joins the campaign while this workflow does not exist keeps the first link, with no `am_id`, and an empty `Referral Code`. That happened to test partner E in the first build.

## The trigger's merge fields

The trigger adds its own group, **Affiliate enrolled in campaign**, to the tag icon's list. Seen in the first build: Affiliate Name, Affiliate First Name, Affiliate Email, Affiliate Phone, **Affiliate Referral Link**, Affiliate portal link, Affiliate Magic Login Link, and **Am Id**. The full list is in [affiliate-manager.md](../affiliate-manager.md).

Only the labels are known. The raw `{{…}}` text of these merge fields was never seen (the API cannot read workflow steps). **Insert them from the list; never type a guessed `{{…}}`.**

## Steps

| # | Action Name | Action type (search word) | Settings (exact) | Notes / traps |
|---|---|---|---|---|
| 1 | `Write the partner's affiliate link` | **Update contact field** (`update contact field`) → **Update field data** | **Row 1, Affiliate Link.** The value is two parts, with nothing between them: **(a)** from the tag icon, search `affiliate`, pick **Affiliate enrolled in campaign . Affiliate Referral Link** (picker label); **(b)** right after that chip, type exactly: `&claimed_partner_id={{contact.id}}&claimed_partner_name={{contact.first_name}}%20{{contact.last_name}}`. **Row 2, Referral Code.** From the tag icon, search `am id`, pick **Affiliate enrolled in campaign . Am Id** (picker label) | The typed merge fields turn into the chips "Contact . ID", "Contact . First Name", "Contact . Last Name". Searching `affiliate` does not list Am Id: search `am id`. Do not add a "Text formatter → Split text" step to pull the id out of the link: the first build started one and cancelled it once Am Id was found |
| – | END | | | |

**What the value comes out as.** "Affiliate Referral Link" is the campaign's link **including** `?am_id=<Referral ID>`, so the finished field reads:

```
https://api.leadconnectorhq.com/widget/form/<REFER_FORM_ID>?am_id=<Referral ID>&claimed_partner_id=<the partner's contact id>&claimed_partner_name=<First>%20<Last>
```

First build, test partner F: `https://api.leadconnectorhq.com/widget/form/<REFER_FORM_ID>?am_id=testpartnerf409&claimed_partner_id=<partner F's contact id>&claimed_partner_name=Test%20PartnerF`, and `Referral Code` = `testpartnerf409`.

## Test

Test 6 in [8-test](../../process/8-test.md): `node tools/ghl/enroll.js --client <CLIENT_SLUG> partnerE`, wait 1 minute, then `verify-test.js` on `test.partner.e@example.com`.

Expected readback:
- `Affiliate Link` = `https://api.leadconnectorhq.com/widget/form/<REFER_FORM_ID>?am_id=<E's Referral ID>&claimed_partner_id=<E's contact id>&claimed_partner_name=Test%20PartnerE`.
- `Referral Code` = E's Referral ID: GHL makes it from the name plus digits (the first build: `testpartnere9104`, `testpartnerf409`).
- The same Referral ID shows on E's affiliate profile: **Marketing → Affiliate Manager** → E → **Active Referral Links → Customize** → **Referral ID**. Close it without changes.
- This workflow's execution log shows one run for E.

## Client-specific values

| Setting | Per client |
|---|---|
| Trigger filter | `<PROGRAM_NAME>` |
| Everything else | The same in every build. The link's form is whatever the campaign points at (`Refer a Client`) |
