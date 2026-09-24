# Forms: the 3 forms, field by field

Build these in GHL's form builder (**Sites → Forms → Builder**), in this order: `Refer a Client`, `Partner Sign-Up`, `Staff Attribution`. How to click through the builder: [4-forms](../process/4-forms.md). The custom fields must exist first ([structure.json](structure.json), step 3).

Source: the three forms of the first build, read back from their public pages on 2026-09-25 (the whole form definition), plus the build log.

These tables are the standard build. A client whose own clients are households (no business name, a property address) or whose partners often have only a phone number gets the exact changes in [variants.md](variants.md), "Client differences". The client's own placeholders go in the blueprint's section 6, "Form placeholders".

## What every form shares

**How a form starts.** Sites → Forms → **Create form** → **Start from Scratch** → Create. GHL opens a form named "Form 0" that already holds: First Name, Last Name, Phone (required), Email (required), two SMS consent checkboxes, a Submit button, and "Privacy Policy | Terms of Service" links.

- **Delete both SMS consent checkboxes.** SMS stays off until the client's A2P registration is approved, and the boxes carry unfilled `[BUSINESS NAME]` text.
- **Delete the Privacy Policy | Terms of Service links.**
- Keep First Name, Last Name, Phone and Email, and set them as the tables below say.

**Where the elements are.**
- Standard elements (**Organization**, **Website**) are on the builder's **Quick Add** tab. Drag them onto the form: clicking a tile does nothing.
- Custom fields are on the **Add Object Fields** tab: object **Contact**, folder **ADDITIONAL INFO**. Search the name, tick the field (you can tick several), then click **Add N fields**. They land **below Submit**: delete that Submit afterwards and drag a fresh **Submit** from Quick Add to the bottom.
- Field settings: click the field, then its gear icon → **General Settings**: Label, Label Alignment, Placeholder, Short Label, Query Key, Field Width, Required, Hidden.

**Columns in the field tables.**
- **Label**: what the form shows. For a custom field, the label can differ from the field's name.
- **Maps to**: the contact field the answer is saved in. "Standard" = a built-in contact field; otherwise the custom field's name and key.
- **Query key**: the URL parameter that pre-fills the field (`...?claimed_partner_id=abc`). Standard fields keep GHL's key; a custom field's key starts as its field key without `contact.`. Change it only where the table says so.
- **Width**: Field Width. `100%` = GHL's default. `default` = the setting was never touched.
- **Short label**: empty on every field in the first build. Leave it empty.
- **Label alignment**: top (GHL's default) on every field.

**Form-level settings** (identical on all three forms; all are what Start from Scratch gives, and none were changed):

| Setting | Value |
|---|---|
| On submit | **Show a thank-you message** (no redirect URL) |
| Thank-you message | GHL's default, three centred lines: 😊 / **We appreciate your feedback!** / Thank you for taking the time to complete this form. **DRAFT**: a partner or client reads it. The first build kept GHL's default; the approver may ask for a custom one |
| Submit button text | `Submit` (**DRAFT**, same reason). Full width, GHL's default blue, no sub-text |
| Layout | Single column, form width 800, input style "box", GHL's default theme |
| Sticky contact | Off |
| Autoresponder email | Off |
| Email notifications (to users) | Off |
| Show submission in the Conversations feed | Off |
| Generate a submission document | Off |
| GDPR-compliant mode | Off |
| Conditional logic, payment, opportunity settings, form schedule | None / off |
| Language | en-US |
| Folder | None |

Not yet proven: the form builder's **Settings** and **Notifications** tabs were never opened in the first build. The public form data shows the values above; anything else there is GHL's default. Leave those tabs alone.

**Share link** of any form: `https://api.leadconnectorhq.com/widget/form/<FORM_ID>`. Record it in the build record. Every public form carries Cloudflare's bot check (Turnstile), so an automated browser cannot submit it. Never work around it: the tests use `tools/ghl/enroll.js` instead ([8-test](../process/8-test.md)).

**Short names.** A long form name pushes the builder's **Save** button off-screen. Use the exact short names below.

---

## Refer a Client

- **Purpose:** a partner registers a client they refer. The partner's personal link opens it, and the link fills the three hidden fields with the partner's ids.
- **Filled by:** a partner, through their link. Never by staff.
- **Triggers:** `Referral Engine - Referral Capture` ([2-referral-capture](workflows/2-referral-capture.md)).
- **Id placeholder:** `<REFER_FORM_ID>`.

| # | Label | Type | Maps to | Required | Hidden | Query key | Placeholder | Short label | Width | Options |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `First Name` | Text | Standard: first name | No | No | `first_name` | `Enter your first name` | – | 100% | – |
| 2 | `Last Name` | Text | Standard: last name | No | No | `last_name` | `Enter your last name` | – | 100% | – |
| 3 | `Phone` | Phone (country picker off) | Standard: phone | **No**: untick Required. A partner may not have the client's number | No | `phone` | `+1 (555) 000-0000` | – | 100% | – |
| 4 | `Email` | Email | Standard: email | **Yes** | No | `email` | `your@email.com` | – | 100% | – |
| 5 | `Client's business name` | Text | Standard: **Organization** (company name). Quick Add → Organization, dragged below Email, then relabelled | No | No | `organization` | `e.g. Smith Dental` | – | 100% | – |
| 6 | `Claimed Partner ID` | Text | Custom: `Claimed Partner ID` (`contact.claimed_partner_id`) | No | **Yes** | `claimed_partner_id` | – | – | 100% | – |
| 7 | `Claimed Partner Name` | Text | Custom: `Claimed Partner Name` (`contact.claimed_partner_name`) | No | **Yes** | `claimed_partner_name` | – | – | 100% | – |
| 8 | `Claimed Referral Code` | Text | Custom: `Claimed Referral Code` (`contact.claimed_referral_code`) | No | **Yes** | **`am_id`** (see below) | – | – | 100% | – |
| 9 | `What does this client need? (optional)` | Multi-line text | Custom: `Claim Notes` (`contact.claim_notes`) | No | No | `claim_notes` | `e.g. wants to rank higher on Google Maps; best time to call` | – | default | – |
| 10 | `Submit` | Button | – | – | – | – | – | – | 100% | – |

**Client-facing text, DRAFT:** the labels of rows 5 and 9 and both placeholders (`e.g. Smith Dental`, `e.g. wants to rank higher on Google Maps; best time to call`). The placeholders are the first build's, written for an SEO agency's clients: write the client's own in the blueprint's section 6 ("Form placeholders"), and list them under "Copy waiting for approval".

**The Sep 22 change: `Claimed Referral Code` reads `am_id`.** The first build set this hidden field's Query Key to `claimed_referral_code` on Sep 21. On Sep 22, with the Affiliate Manager, it was changed to `am_id`. GHL's affiliate link is this form's share link plus `?am_id=<the partner's Referral ID>`, so the field now captures the partner's Referral ID by itself. Build it with `am_id` from the start. [6-affiliate-manager](../process/6-affiliate-manager.md), section 6.5, checks it.

**Why hidden, and why "Claimed".** The form writes only the staging fields. A GHL form overwrites contact fields the moment it is submitted, before any workflow runs, so a form that wrote the real credit fields would let a second partner silently take the credit. Workflow 2 copies the claim across only on a first claim.

**A partner's link** (written into the partner's `Affiliate Link` field by workflows 4 and 5):

```
https://api.leadconnectorhq.com/widget/form/<REFER_FORM_ID>?am_id=<Referral ID>&claimed_partner_id=<partner's contact id>&claimed_partner_name=<First>%20<Last>
```

---

## Partner Sign-Up

- **Purpose:** a new partner signs up to the program.
- **Filled by:** a new partner, on the Become a Partner page ([affiliate-manager.md](affiliate-manager.md)) or through the form's own share link until that page is live.
- **Triggers:** `Referral Engine - Partner Sign-Up` ([4-partner-sign-up](workflows/4-partner-sign-up.md)).
- **Id placeholder:** `<SIGNUP_FORM_ID>`.

| # | Label | Type | Maps to | Required | Hidden | Query key | Placeholder | Short label | Width | Options |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `First Name` | Text | Standard: first name | No | No | `first_name` | `Enter your first name` | – | 100% | – |
| 2 | `Last Name` | Text | Standard: last name | No | No | `last_name` | `Enter your last name` | – | 100% | – |
| 3 | `Phone` | Phone (country picker off) | Standard: phone | **Yes** (the new form's default, kept) | No | `phone` | `+1 (555) 000-0000` | – | 100% | – |
| 4 | `Email` | Email | Standard: email | **Yes** | No | `email` | `your@email.com` | – | 100% | – |
| 5 | `Business name` | Text | Standard: **Organization**. Quick Add → Organization, dragged below Email, then relabelled | No | No | `organization` | `Your agency or company` | – | 100% | – |
| 6 | `Website` | Text | Standard: **Website**. Quick Add → Website, dragged below Business name | No (never set) | No | `website` | `https://yourwebsite.com` | – | 100% | – |
| 7 | `Partner Type` | Dropdown | Custom: `Partner Type` (`contact.partner_type`) | No | No | `partner_type` | – | – | 100% | The client's partner types, in order, `Other` last. They come from the field: set them in the config before step 3 |
| 8 | `Partnership Type` | Dropdown | Custom: `Partnership Type` (`contact.partnership_type`) | No | No | `partnership_type` | – | – | 100% | `Referral`, `White Label` |
| 9 | `Who are your clients? (industries, locations)` | Multi-line text | Custom: `Partner Notes` (`contact.partner_notes`) | No | No | `partner_notes` | – | – | default | – |
| 10 | `Payment Preference` | Dropdown | Custom: `Payment Preference` (`contact.payment_preference`) | No | No | `payment_preference` | – | – | 100% | `ACH`, `Check`, `PayPal`, `Gift Card`, `Service Credit`, `Other` |
| 11 | `Submit` | Button | – | – | – | – | – | – | 100% | – |

**Client-facing text, DRAFT:** the labels of rows 5 and 9 and the placeholder `Your agency or company`. The placeholder is the first build's, written for an SEO agency's partners: write the client's own in the blueprint's section 6.

Rows 7 to 10 are added from **Add Object Fields**: search `partner`, tick `Partner Type`, `Partnership Type` and `Partner Notes`, click Add; then search `payment`, tick `Payment Preference`, click Add. Then relabel `Partner Notes` as row 9 says. The dropdown options come from the custom fields; do not edit them in the form.

---

## Staff Attribution

- **Purpose:** internal. Staff log a referral that came by an email introduction, a phone call or a walk-in, and name the partner who sent it.
- **Filled by:** the client's staff only. Never shared with partners.
- **Triggers:** `Referral Engine - Staff Attribution` ([3-staff-attribution](workflows/3-staff-attribution.md)).
- **Id placeholder:** `<STAFF_FORM_ID>`.
- **How the first build made it:** by duplicating `Refer a Client` (forms list → **⋮** on Refer a Client → **Duplicate** → dialog "Duplicate form", name it → **Confirm**), then changing rows 7 to 9. Building it from scratch with this table gives the same form.

| # | Label | Type | Maps to | Required | Hidden | Query key | Placeholder | Short label | Width | Options |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `First Name` | Text | Standard: first name | No | No | `first_name` | `Enter your first name` | – | 100% | – |
| 2 | `Last Name` | Text | Standard: last name | No | No | `last_name` | `Enter your last name` | – | 100% | – |
| 3 | `Phone` | Phone (country picker off) | Standard: phone | No | No | `phone` | `+1 (555) 000-0000` | – | 100% | – |
| 4 | `Email` | Email | Standard: email | **Yes** | No | `email` | `your@email.com` | – | 100% | – |
| 5 | `Client's business name` | Text | Standard: **Organization** | No | No | `organization` | `e.g. Smith Dental` | – | 100% | – |
| 6 | `Claimed Partner ID` | Text | Custom: `Claimed Partner ID` (`contact.claimed_partner_id`) | No | **Yes** (stays hidden) | `claimed_partner_id` | – | – | 100% | – |
| 7 | `Who referred them? (partner or business name)` | Text | Custom: `Claimed Partner Name` (`contact.claimed_partner_name`) | No | **No** (untick Hidden) | `claimed_partner_name` | – | – | 100% | – |
| 8 | `Referral code (if they gave one)` | Text | Custom: `Claimed Referral Code` (`contact.claimed_referral_code`) | No | **No** (untick Hidden) | `claimed_referral_code` (**not** `am_id`) | – | – | 100% | – |
| 9 | `How did the referral happen? (evidence)` | Multi-line text | Custom: `Claim Notes` (`contact.claim_notes`) | No | No | `claim_notes` | `e.g. partner emailed an intro on Sep 22; client said Acme Web sent them` | – | default | – |
| 10 | `Submit` | Button | – | – | – | – | – | – | 100% | – |

**Query key of row 8.** In the first build this form was copied before the Sep 22 change, so row 8 kept `claimed_referral_code`. Staff type the code by hand, so the key does not matter to them. If you duplicate `Refer a Client` after it has `am_id`, change row 8's Query Key back to `claimed_referral_code`.

**Row 6 stays hidden.** Staff name the partner in row 7 and, if they know it, the Referral Code in row 8. `Claimed Partner ID` stays empty on a staff entry unless a link fills it, so a staff-logged lead's `Referring Partner ID` is empty. Not yet proven: whether a later claim on a staff-logged lead is then treated as a first claim (workflow 3's If / else tests `Referring Partner ID`). The first build did not test it.

**Filed in the Affiliate Manager only with a code.** Workflow 3 files a first-claim lead under its partner by the lead's `Referral Code`. So a staff-logged lead shows under the partner only if staff type the partner's Referral ID (their `am_id`, for example `testpartnere9104`) into row 8.

Staff-facing text (row 7 to 9 labels, row 9 placeholder) is not partner-facing: no DRAFT mark needed. The placeholder's date and names are the first build's example; replace them with a neutral example for the client if you like (the blueprint's section 6 records it). Row 5's placeholder is the same as Refer a Client's row 5, so it follows the client's own (DRAFT).
