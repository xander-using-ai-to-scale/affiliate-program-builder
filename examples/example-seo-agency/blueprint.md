# Program blueprint: Example SEO Partner Program

> **Approved (section 15).** The worked example's blueprint: the first build's program, anonymised. The first build had no written blueprint; this one was reconstructed on 2026-09-25 from what was built and approved, in the shape step 1 (`process/1-blueprint.md`) produces.

- **Client:** Example SEO Agency (`example-seo-agency`) · **Owner:** Alex Example
- **Written:** 2026-09-25 (reconstructed) · **Repo version:** 1.0.0

The standard program is fixed in `spec/`. This blueprint records only the client's values and any change the brief asks for.

## 1. The program in one paragraph

Businesses that already serve local businesses (web designers, ad agencies, printers, coaches, accountants and others) refer their clients to Example SEO Agency for local SEO. A partner signs up on the Become a Partner page, gets a partner portal login and one personal link, and registers each client through that link. The first partner to register a client is credited with them. When a referred client signs and pays, the partner earns 15% of each monthly payment, for as long as the client stays. The agency's staff approve and pay each month's commission by hand.

## 2. Commission

| Item | Choice | From the brief |
|---|---|---|
| Variant (`spec/variants.md`) | Monthly percentage (default) | Field 5 |
| Rate or fee | 15% of each monthly payment (`<RATE_PERCENT>` = `15`) | Field 5 |
| `Reward Model` value | `Revenue Share` | Field 5 |
| When a commission is due | Each month the referred client has paid | Field 5 |
| How partners are paid | ACH, check, PayPal, gift card, service credit or other, as the partner chose on the sign-up form; paid by the client's staff | Field 6 |
| Payout terms in the campaign | Net-15 | Field 6 |
| Changes to the standard workflows for this variant | None | |

## 3. Partners

- **`Partner Type` options** (in this order, `Other` last): Web Design / Development · Graphic Design / Branding · Print Shop / Commercial Printer · PPC / Paid Ads Agency · Social Media Agency · Email Marketing / Newsletter Agency · PR Firm / Publicist · Marketing Consultant / Fractional CMO · Business Coach · GHL / CRM Agency · Reputation / Review Management · Web Hosting · App Developer · Bookkeeper / CPA · Commercial Real Estate · Local Business Publication · Photographer / Video Production · Business Broker · Other
- **`Partner Tier` options:** Tier 1 / Tier 2 / Tier 3
- **`Partnership Type` options:** Referral / White Label
- **`segment/` tags:** `segment/web-design`, `segment/graphic-design`, `segment/print-shop`, `segment/ppc-agency`, `segment/social-media-agency`, `segment/email-marketing`, `segment/pr-publicist`, `segment/other`
- **`Lost Reason` options:** the standard options, plus: `Already has an SEO partner` (placed before `Do not contact`)

## 4. Pipelines

Standard (`spec/structure.json`): **Partner Recruiting**, **Partner Lifecycle**, **Referred Leads**.

Changes: none. The approver's spec also had a "Referral Partners" pipeline; it is not built, because Partner Recruiting and Partner Lifecycle carry the same stages, split before and after the partner signs (brief, gap 2).

## 5. Fields and tags

Standard (`spec/structure.json`): 29 contact fields, 7 deal fields, 24 tags, plus the client's values in section 3.

Changes: none beyond section 3.

## 6. Forms

Standard (`spec/forms.md`): **Refer a Client** (hidden fields filled from the partner's link), **Partner Sign-Up**, **Staff Attribution** (internal).

Changes: none. The Refer a Client placeholders are written for this client's customers: `e.g. Smith Dental` and `e.g. wants to rank higher on Google Maps; best time to call` (**DRAFT**).

## 7. Workflows

| # | Workflow | Build it? | Changes for this client |
|---|---|---|---|
| 1 | `Instantly - Interested Partner Reply` | Yes (the client recruits partners by cold email in Instantly) | None |
| 2 | `Referral Engine - Referral Capture` | Yes | None |
| 3 | `Referral Engine - Staff Attribution` | Yes | None |
| 4 | `Referral Engine - Partner Sign-Up` | Yes | `Revenue Share Percent` = `15` |
| 5 | `Referral Engine - Affiliate Link` | Yes | None |
| 6 | `Referral Engine - Commission 1: Sale` | Yes | The rate in the task text: 15% |
| 7 | `Referral Engine - Commission 2: Approved` | Yes | The rate in the task text: 15% |
| 8 | `Referral Engine - Commission 3: Paid, monthly repeat` | Yes | The rate in the task text: 15% |

Every task and alert goes to `<PLACEHOLDER_USER>` (the operator) until Example SEO Agency has a GHL user. No workflow emails or texts a partner or a client.

## 8. Affiliate Manager

- **Campaign:** `Example SEO Partner Program`. Its links lead to the `Refer a Client` form, tracked with `?am_id`.
- **Commission in the campaign:** Pay Per Lead, with the per-lead amount off.
- **GHL's standard affiliate invite email:** on. It is GHL's own text, and it gives each partner their portal login the moment they are added.
- **Cookie life:** 365 days. **Payout terms:** Net-15.
- **What partners see in the portal:** their link and their leads. Not their earnings: that needs Stripe (section 13).
- **Leads are credited** by custom mapping on the lead's Referral Code (the approver's choice, brief gap 3).

## 9. The Become a Partner page

A funnel named `Example SEO Partner Program` with one step, `/become-a-partner`: a headline, one line of copy and the Partner Sign-Up form (layout in `spec/affiliate-manager.md`). It is built and saved in step 6, and published once the client's domain is connected and the approver has approved the text.

- **Headline (DRAFT):** Become an Example SEO Partner
- **Copy line (DRAFT):** Refer local businesses to Example SEO Agency. Sign up below and we'll email you your partner account and your personal referral link.

## 10. Calendar

**Partner Intro Call**, standard settings from `spec/structure.json`.

- **Slug:** `example-seo-agency-partner-intro-call`
- **Description:** A 20-minute intro call with a prospective referral partner for the Example SEO Partner Program.
- **Changes to the standard length or days:** none (20 minutes, Monday and Tuesday).
- **Placeholders until the client sets them in step 9:** the hours (10 AM–5 PM ET), the owner (`<PLACEHOLDER_USER>`), the video link (empty).

## 11. People

- **Placeholder user:** `<PLACEHOLDER_USER>` (the operator) holds every task, alert and the calendar until Example SEO Agency has a GHL user.
- **The client's staff who take over:** Alex Example, the owner.

## 12. Not in this build

- A prospect-facing intake page and QR codes (they need the client's domain).
- Emails and texts to partners or clients. Drafts are written in step 9 for approval; wiring them in is a later change. This includes the branded welcome email the approver mentioned.
- Appointment automations, a reporting dashboard, and partner reactivation.
- SMS of any kind, until A2P is approved.
- Commissions shown in the partner portal (they need the client's Stripe and a sales campaign).
- The approver's "Referral Partners" pipeline, and the extra form fields of the approver's spec (terms acknowledgment, preferred contact method, service area, estimated volume; "who referred you", referral source type, consent text; contact lookup, method, confidence, staff member, override reason).

## 13. What the client must provide

| Item | Needed by | Blocks |
|---|---|---|
| An admin user in their sub-account for `<PLACEHOLDER_USER>` | Step 2 | The whole build (done: the operator is an agency admin) |
| A sub-account Private Integration token | Step 2 | The whole build (done) |
| Instantly on the Hyper Growth plan | Step 7 | The Instantly webhook only |
| Their own GHL user | Step 9 | The placeholder swap |
| The calendar rules | Step 9 | The calendar's hours and video link |
| Their domain connected to GHL | After handover | The Become a Partner page going live |
| A2P approval (the client's registration is not finished) | Later | Any SMS |
| Stripe (optional) | Later | Commissions in the partner portal |
| **Referral fees:** written confirmation, per partner type, that it may legally receive a referral fee. Still open: all 19 types (not asked in the first build) | Before launch | **Launch**: recruiting that partner type |
| The partner agreement new partners sign (not asked in the first build) | Before launch | Onboarding the first partner |

## 14. Open questions

| Question | Who answers | Blocks |
|---|---|---|
| Which domain or subdomain will carry the forms and the Become a Partner page? | Alex Example | Publishing the page |
| The calendar's hours, daily maximum, video link and blocked dates | Alex Example | The calendar at handover |
| Upgrade Instantly to Hyper Growth before its trial ends? | Alex Example | Step 7 |

## 15. Approval

Approving this blueprint lets the AI session build and publish everything above in Example SEO Agency's GHL sub-account. Nothing a partner or the client reads goes live or is sent until the approver approves its text.

- **Approved by:** the operator
- **Date:** 2026-09-21 (the referral engine) and 2026-09-22 (the Affiliate Manager)
- **Their words:** not recorded as a blueprint approval. The first build had no blueprint step: the operator directed each part during the build, and the approver asked for the Affiliate Manager on the build's second day. A real build records the operator's written approval here, word for word.
