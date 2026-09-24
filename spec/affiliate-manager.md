# The Affiliate Manager and the Become a Partner page

GHL's **Affiliate Manager** (in **Marketing**) gives every partner a profile, a login to GHL's partner portal, one link, and a list of the clients they registered. In this program it holds the partners and their leads. The credit rules and the commission stay in the referral engine (workflows 2–8).

How to click through it: [6-affiliate-manager](../process/6-affiliate-manager.md). **Keep the GHL window visible on screen the whole time**: the Affiliate Manager runs in a frame that stops drawing, and ignores dropdown clicks, when the window is covered.

Source: the first build, Sep 22 2026, from the build log and its screenshots. GHL has no public API for the Affiliate Manager, so nothing here was read back over the API except what the workflows wrote on test contacts.

**What does not belong here:** the workflow steps that use the Affiliate Manager (they are in [workflows/](workflows/README.md): 2, 3, 4 and 5).

## 1. The app

- **Marketing** top menu → **Affiliate Manager**. Its pages: **Dashboard, Campaign, Affiliate, Payout, Media, Settings**.
- **First visit.** GHL shows "Connect a Payment Gateway — To track Affiliate sales and commissions automatically, connect one of the supported payment gateways below": Stripe, NMI, Authorize.Net, PayPal. Click **Skip & Get Started** unless the blueprint says the client connects Stripe (not in v1).
- **Settings page** (read, never changed). Tabs **Default Campaign Settings**, **Affiliate Portal Settings**, **Customizations**. Default Campaign Settings apply only to new campaigns: **Send affiliate email notification** on; **Affiliate Welcome Email Template** `Default Template`; **Cookie life** `365` days; **Payout Terms** `Net-15 (15 days after month ends)`. Change nothing here.
- **Not yet proven: the Affiliate Portal Settings and Customizations tabs.** They were clicked in the first build, but the frame froze before they drew. They hold GHL's defaults, never opened (confidence: medium). Leave them alone; if the operator wants the portal branded, that is a change outside v1.

## 2. The campaign: `<PROGRAM_NAME>`

**Campaign → + Add** opens a wizard with three tabs. A new campaign starts named "Campaign Create 1".

### Tab 1: Campaign Details

| Setting (label in GHL) | Value |
|---|---|
| **Campaign Name*** | `<PROGRAM_NAME>` (edit it in the field or with the pencil in the header) |
| **Choose Where Your Affiliate Links Should Lead** → Track Sales & Leads | **Forms**. The other options (Funnels, Websites, Store, External Website, Surveys, Calendar) are not used. External Website needs Stripe |
| **Pick the Form You Want to Promote** | `Refer a Client`. The list ignores mouse clicks: type `Refer a`, press Down, then Enter |
| **Affiliate Link Shared with Customers** (read-only) | GHL fills it: `https://api.leadconnectorhq.com/widget/form/<REFER_FORM_ID>`, with a Copy button |
| **Unique Tracking** | `?am_id` (the value shown; leave it) |
| Notice | "This is a lead form — There are no products associated with this form." Expected |
| Button | **Set Up Reward** |

### Tab 2: Set Commission

| Setting (label in GHL) | Value |
|---|---|
| **How should Affiliate be Rewarded?** | **Pay Per Lead** ("Reward affiliates for each lead generated."). **Pay Per Sale** is greyed out for a form: expected |
| **Default Commission Value (Per Lead)** | Toggle **Off** (its Flat / amount inputs stay disabled). No per-lead payment. The pay-per-lead variant turns it on: [variants.md](variants.md) |
| **Advanced Commission Settings** | Leave untouched (the first build opened it once and changed nothing) |
| Button | **Assign Affiliate** |

### Tab 3: Assign Affiliate

| Setting (label in GHL) | Value |
|---|---|
| **Select Affiliate** | None ("No affiliate selected…"). Workflow 4 adds each partner |
| **Additional Settings → Send affiliate email notification** ("Send an onboarding email to affiliates when they're added to this campaign") | **On** (the default). This is GHL's own invite email: it gives each partner their portal login |
| **Email Template** | `Default Template` (the default). Not yet proven: its text; it was never opened (confidence high that it is GHL's standard invite) |
| **Cookie life** | `365` days (the default) |
| **Current Payout Terms** | The blueprint's terms, mapped with the rule below. The first build: `Net-15` (15 days after month ends), the default ("This month's commissions will be paid on next month 15th.") |
| Button | **Finish ▾** → **Publish now** ("Publish this and make it live."). Not "Save in draft" |

**Check:** the campaign list shows `<PROGRAM_NAME>` with a start date. If **Publish now** does nothing, the GHL window is covered: bring it on screen and click again.

### Payout Terms: how the client's timing maps to GHL's options

**What a term means.** `Net-15` reads "15 days after month ends": the commissions of one month are paid on the 15th of the next month. So `Net-<N>` means N days after the month ends.

**Which options exist.** Only `Net-15` was seen in the first build (it was the default, and nobody opened the list). Confirm: open the Payout Terms list once and write every option it shows into the build record. Never pick an option you have not seen in the list.

**What the setting does in v1.** Without Stripe, GHL records no commissions for this campaign ([section 7](#7-what-cannot-be-done-without-stripe)), so Payout Terms only states the terms on the campaign and in the partner portal. Staff pay from the payout tasks (workflow 7), whatever the setting says.

| The client says (brief field 6) | Pick | Ask? |
|---|---|---|
| Nothing about timing | `Net-15` | No: it is the default |
| "Monthly", "once a month", "by check each month", with no day named | `Net-15` | No |
| A day of the next month, for example "by the 30th of the following month" | `Net-<that day>` (`Net-30`) if the list has it | Only if the list has no such option: ask the operator, recommending the nearest option that is not later than the client's day |
| "Right away", "as each commission is approved", or a day in the same month | The shortest option in the list | Yes: tell the operator the campaign can only state it approximately, and confirm the pick |

A fixed monthly payout day also changes the payout task's text: [variants.md](variants.md), "A monthly payout run".

## 3. How partners become affiliates

GHL has no page where people sign themselves up to the affiliate portal: the account owner must add each affiliate to an active campaign. So:

1. The partner fills in **Partner Sign-Up** (on the Become a Partner page, or the form's own link).
2. Workflow 4 ends with **Add to affiliate manager** and **Add to affiliate campaign** → `<PROGRAM_NAME>` ([4-partner-sign-up](workflows/4-partner-sign-up.md)).
3. GHL emails the partner the portal invite (the campaign's email notification is on).
4. Joining the campaign starts workflow 5, which writes the partner's link and Referral ID onto their contact ([5-affiliate-link](workflows/5-affiliate-link.md)).

## 4. The affiliate profile

- **The list:** Affiliate Manager → **Affiliate**. Columns: Affiliate Name, Campaign, Clicks, Customers, Leads, Sub…, Owed, Paid, Revenue. Buttons: + Add, a date filter, export, Filters.
- **A profile:** Commission Summary (Total Unpaid, Denied, Approved), Payout Summary (Total Paid, Approved, Completed), **Active Referral Links** ("<PROGRAM_NAME>: **Customize** | the link | copy"), and tabs **Commissions · Leads · Customers · Payout · Payout Methods · Sub Affiliate**.
- **Customize** opens "Advanced Settings for: <affiliate>": Selected Campaign; tabs **Referral Link** / Coupon Code; **Referral ID*** (editable); Link Preview `https://api.leadconnectorhq.com/widget/form/<REFER_FORM_ID>?am_id=<Referral ID>`; Save / Done.
- **The Referral ID is the `am_id`.** GHL makes it from the partner's name, lowercased with the spaces removed, plus digits: Test Partner E → `testpartnere9104`; Test PartnerF → `testpartnerf409`.
- **Changing a Referral ID** (Customize → Referral ID → Save) breaks the partner's stored link. If staff change it, they must also update the partner's `Referral Code` to the new ID and the `am_id=` part of their `Affiliate Link`.

## 5. The "Affiliate enrolled in campaign" merge fields

Workflow 5's trigger adds the group **Affiliate enrolled in campaign** to the tag icon's list. Only the labels are known; insert them from the list, never as typed `{{…}}` text.

| Label in the list | Seen in the first build | Used |
|---|---|---|
| Affiliate Name | Yes | – |
| Affiliate First Name | Yes | – |
| Affiliate Email | Yes | – |
| Affiliate Phone | Yes | – |
| **Affiliate Referral Link** | Yes. Resolves to the campaign's link **including** `?am_id=<Referral ID>` | Workflow 5, `Affiliate Link` |
| Affiliate portal link | Yes | – |
| Affiliate Magic Login Link | Yes | – |
| **Am Id** | Yes. Listed only when you search `am id` (not `affiliate`) | Workflow 5, `Referral Code` |
| Campaign Name, Total Revenue, Commission Earned, Client Portal Link, Magic Login Link | Listed on GHL's help page, not seen in the picker | – |

## 6. How referred leads are filed under partners

- The partner's link opens `Refer a Client` with `?am_id=<Referral ID>&claimed_partner_id=<contact id>&claimed_partner_name=<First>%20<Last>`. The hidden `Claimed Referral Code` has Query Key `am_id` ([forms.md](forms.md)), so the Referral ID lands on the lead.
- On a **first claim**, workflows 2 and 3 copy it into `Referral Code`, then **File the lead under its partner**: **Add leads under an affiliate**, **Custom Mapping**, **AM ID** = Contact → Custom Fields → Referral Code. Custom mapping has no campaign picker: the `am_id` names the affiliate and its campaign.
- A disputed (later) claim is filed under nobody until a person decides.
- **Result in the first build:** the partner's profile → **Leads** tab listed the lead with Source **Forms** and the campaign; the Affiliate list showed Leads 1 for that partner.
- **Not yet proven** (confidence: low): whether GHL also files a lead by itself from the `am_id` in the link on a real form fill. GHL's docs say a lead can be assigned to only one affiliate per campaign, so there should be no double count. No real form fill happened in the first build; [8-test](../process/8-test.md) test 8 checks it.

## 7. What cannot be done without Stripe

- A campaign that leads to a **form** holds leads, not sales. **Pay Per Sale** is greyed out.
- **Add Sales Manually** (the profile's Commissions tab) opens **Add Manual Commission**: search a lead or customer, Affiliate Name, Customer Name, **Campaign Name** (the list shows "No Data"), Event Date, Event ID. No campaign can be picked, so no manual commission can be recorded. Close it without submitting.
- **External Website** as the link destination asks for Stripe ("External Website currently supports automatic tracking of sales and commissions through Stripe only…").
- So partners see their **leads** in the portal, not their earnings. The commission runs in the `Referred Leads` cycle (workflows 6–8), and a person pays partners. Showing commissions in the portal needs the client's Stripe (or another gateway) plus a **sales** campaign with a percentage commission. That is not in v1.
- GHL's docs say payouts can be marked Paid by hand in the Affiliate Manager. Not used in v1.

## 8. The Become a Partner page

GHL has no self sign-up page for the portal, so this page, with the Partner Sign-Up form on it, is the way in.

| Item | Value |
|---|---|
| Funnel | `<PROGRAM_NAME>`. **Sites → Funnels → + New funnel** → dialog "Create new funnel" → **From blank** (not Build with AI, not From templates) → Funnel name → **Create**. GHL gives it the path `/<the name in lowercase with dashes>` |
| Step | Name for page `Become a Partner` · Path `become-a-partner` (clear what GHL filled in first: select all, delete, retype) · the ClickFunnels import box left empty → **Create funnel step** |
| Page | On the step's overview, **Create from blank** (not Use existing). The page builder opens |
| Layout | Page → Section → **1 Column** row (Quick Add → Rows → drag **1 Column** onto the canvas) → in its column, three elements from the row's **+ Add** → Quick Add, top to bottom: **Headline**, **Paragraph**, the form |
| 1. Headline | Element **Headline** (renders as `<h1>`). Text, **DRAFT**: `Become a <CLIENT_NAME> Partner` |
| 2. Paragraph | Element **Paragraph** (Content font, 16 px, weight 400: the defaults). Text, **DRAFT**: `Refer <who the client serves> to <CLIENT_NAME>. Sign up below and we'll email you your partner account and your personal referral link.` The first build's reads "Refer local businesses to …" |
| 3. Form | **Forms And Surveys** → **Add Existing Form** → "Select your form" → `Partner Sign-Up`. Button Actions → Redirect action: **Use action from form builder** (so the form's own thank-you message shows) |
| Styles | GHL's defaults: no element, SEO, favicon or tracking settings were changed (confidence high). The page has no `<title>` |
| Save | The disk icon in the header. The top bar shows "Last saved …". The builder shows "Autosave off" |
| Preview link | Under the builder's top bar: `https://sites.leadconnectorhq.com/preview/<PAGE_ID>`. Record it in the build record |
| Publish | **Not in the build.** Saved, not published. Publishing needs a connected domain: the header **Publish** shows "At least one domain needs to be selected before publishing funnel. You do not have any domains yet. Purchase Domain or Connect Domain", with Publish disabled. It also needs the approver's OK on the copy. The operator publishes it after handover |

The client's own headline and copy line are in the blueprint's section 9, which wins over the text above. Both are **DRAFT** until the approver approves them. Compliance: no earnings promises, no income claims, no medical claims, never "franchise".

Until the page is live, partners sign up through the form's own link: `https://api.leadconnectorhq.com/widget/form/<SIGNUP_FORM_ID>`.

## Client-specific values

| Setting | Per client |
|---|---|
| Campaign name, funnel name | `<PROGRAM_NAME>` |
| Payout Terms | The blueprint's (default Net-15), mapped with the table in section 2 |
| Default Commission Value (Per Lead) | Off, except the pay-per-lead variant ([variants.md](variants.md)) |
| Page headline and copy | The blueprint's section 9 (DRAFT) |
| Everything else | The same in every build |
