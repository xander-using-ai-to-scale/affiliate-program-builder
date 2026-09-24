# Program blueprint: <PROGRAM_NAME>

> **DRAFT until the operator approves it (section 15).** Copied to `clients/<CLIENT_SLUG>/blueprint.md` in step 0 and filled in step 1 (`process/1-blueprint.md`), from `brief.md`. Nothing is built in GHL before the approval.

- **Client:** <CLIENT_NAME> (`<CLIENT_SLUG>`) · **Owner:** <CLIENT_OWNER>
- **Written:** YYYY-MM-DD · **Repo version:** <!-- FILL: from CHANGELOG.md -->

The standard program is fixed in `spec/`. This blueprint records only the client's values and any change the brief asks for.

## 1. The program in one paragraph

<!-- FILL: who the partners are, what they do, what they are credited for, and how they are paid. Program terms only: no earnings examples, no income claims, no medical claims, never "franchise". -->

## 2. Commission

| Item | Choice | From the brief |
|---|---|---|
| Variant (`spec/variants.md`) | <!-- FILL: monthly percentage (default) / one fee per closed deal / pay per lead --> | Field 5 |
| Rate or fee | <!-- FILL: `<RATE_PERCENT>`% of each monthly payment, or `<FEE_AMOUNT>` per closed deal or per lead: in text with its currency sign ($250), in fields the number only (250) --> | Field 5 |
| `Reward Model` value | <!-- FILL: as spec/variants.md gives it for the variant (`Revenue Share` for monthly percentage) --> | Field 5 |
| When a commission is due | <!-- FILL: for example "each month the client has paid" --> | Field 5 |
| How partners are paid | <!-- FILL: methods, and who pays --> | Field 6 |
| Payout terms in the campaign | <!-- FILL: default Net-15 (the commissions approved in a month are paid on the 15th of the next month). Mapped with spec/affiliate-manager.md, section 2, "Payout Terms" --> | Field 6 |
| Payout run | <!-- FILL: "as each payout task comes", or the fixed monthly payout day (spec/variants.md, "A monthly payout run") --> | Field 6 |
| Changes to the standard workflows for this variant | <!-- FILL: "none" for monthly percentage; otherwise each change, per spec/variants.md --> | |

## 3. Partners

- **`Partner Type` options** (in this order, `Other` last): <!-- FILL -->
- **`Partner Tier` options:** <!-- FILL: default Tier 1 / Tier 2 / Tier 3 -->
- **`Partnership Type` options:** <!-- FILL: default Referral / White Label -->
- **`segment/` tags:** <!-- FILL: one per group targeted in outreach, lowercase with dashes, plus `segment/other` -->
- **`Lost Reason` options:** the standard options, plus: <!-- FILL: one industry-specific reason, or "none" -->

## 4. Pipelines

Standard (`spec/structure.json`): **Partner Recruiting**, **Partner Lifecycle**, **Referred Leads**.

Changes: <!-- FILL: "none", or each change with its reason from the brief -->

## 5. Fields and tags

Standard (`spec/structure.json`): 29 contact fields, 7 deal fields, 24 tags, plus the client's values in section 3.

Changes: <!-- FILL: "none", or each change with its reason -->

## 6. Forms

Standard (`spec/forms.md`): **Refer a Client** (hidden fields filled from the partner's link), **Partner Sign-Up**, **Staff Attribution** (internal).

Changes: <!-- FILL: "none", or each change with its reason: a brief field, the variant, or a client difference from spec/variants.md (homeowner clients, phone-only referrals) with its exact settings -->

**Form placeholders (DRAFT)**, written for this client's own clients. They need the approver's OK, not a reason:

| Form, row | Standard (the first build's, for an SEO agency) | This client's |
|---|---|---|
| Refer a Client, row 5 | `e.g. Smith Dental` | <!-- FILL --> |
| Refer a Client, row 9 | `e.g. wants to rank higher on Google Maps; best time to call` | <!-- FILL --> |
| Partner Sign-Up, row 5 | `Your agency or company` | <!-- FILL --> |
| Staff Attribution, row 5 | `e.g. Smith Dental` | <!-- FILL: the same as Refer a Client, row 5 --> |
| Staff Attribution, row 9 (staff-facing, not DRAFT) | `e.g. partner emailed an intro on Sep 22; client said Acme Web sent them` | <!-- FILL: a neutral example, or "standard" --> |

## 7. Workflows

| # | Workflow | Build it? | Changes for this client |
|---|---|---|---|
| 1 | `Instantly - Interested Partner Reply` | <!-- FILL: yes only if the client runs cold email in Instantly --> | |
| 2 | `Referral Engine - Referral Capture` | Yes | <!-- FILL: "none" or the change --> |
| 3 | `Referral Engine - Staff Attribution` | Yes | |
| 4 | `Referral Engine - Partner Sign-Up` | Yes | <!-- FILL: the rate or fee from section 2 --> |
| 5 | `Referral Engine - Affiliate Link` | Yes | |
| 6 | `Referral Engine - Commission 1: Sale` | Yes | |
| 7 | `Referral Engine - Commission 2: Approved` | Yes | |
| 8 | `Referral Engine - Commission 3: Paid, monthly repeat` <!-- FILL: fee variant: `Referral Engine - Commission 3: Paid` (spec/workflows/8b-commission-3-paid-once.md); pay per lead: "no" --> | Yes | |

Every task and alert goes to `<PLACEHOLDER_USER>` until the client has a GHL user. No workflow emails or texts a partner or a client.

## 8. Affiliate Manager

- **Campaign:** `<PROGRAM_NAME>`. Its links lead to the `Refer a Client` form, tracked with `?am_id`.
- **Commission in the campaign:** Pay Per Lead, with the per-lead amount off. <!-- FILL: or the variant's setting from spec/variants.md -->
- **Payout terms:** <!-- FILL: from section 2 -->
- **GHL's standard affiliate invite email:** on. It is GHL's own text, and it gives each partner their portal login the moment they are added.
- **Cookie life:** 365 days.
- **What partners see in the portal:** their link and their leads. Not their earnings: that needs Stripe (section 13).

## 9. The Become a Partner page

A funnel named `<PROGRAM_NAME>` with one step, `/become-a-partner`: a headline, one line of copy and the Partner Sign-Up form (layout in `spec/affiliate-manager.md`). It is built and saved in step 6, and published once `<CLIENT_DOMAIN>` is connected and the approver has approved the text.

- **Headline (DRAFT):** <!-- FILL -->
- **Copy line (DRAFT):** <!-- FILL: one sentence, terms only, no earnings promise -->

## 10. Calendar

**Partner Intro Call**, standard settings from `spec/structure.json`.

- **Slug:** `<CLIENT_SLUG>-partner-intro-call`
- **Description:** <!-- FILL: one line -->
- **Changes to the standard length or days:** <!-- FILL: "none", or the change -->
- **Placeholders until the client sets them in step 9:** the hours, the owner (`<PLACEHOLDER_USER>`), the video link.

## 11. People

- **Placeholder user:** `<PLACEHOLDER_USER>` holds every task, alert and the calendar until `<CLIENT_NAME>` has a GHL user.
- **The client's staff who take over:** <!-- FILL: names and roles, from the brief's field 7 -->

## 12. Not in this build

- A prospect-facing intake page and QR codes (they need the client's domain).
- Emails and texts to partners or clients. Drafts are written in step 9 for approval; wiring them in is a later change.
- Appointment automations, a reporting dashboard, and partner reactivation.
- SMS of any kind, until A2P is approved.
- Commissions shown in the partner portal (they need the client's Stripe and a sales campaign).
- <!-- FILL: anything else the client asked for that is not built, or "nothing else" -->

## 13. What the client must provide

| Item | Needed by | Blocks |
|---|---|---|
| An admin user in their sub-account for `<PLACEHOLDER_USER>` | Step 2 | The whole build |
| A sub-account Private Integration token | Step 2 | The whole build |
| Instantly on the Hyper Growth plan <!-- FILL: keep only if workflow 1 is built --> | Step 7 | The Instantly webhook only |
| Their own GHL user | Step 9 | The placeholder swap |
| The calendar rules | Step 9 | The calendar's hours and video link |
| Their domain connected to GHL | After handover | The Become a Partner page going live |
| A2P approval | Later | Any SMS |
| Stripe (optional) | Later | Commissions in the partner portal |
| **Referral fees:** written confirmation, per partner type, that it may legally receive a referral fee in the client's state and industry (the client, or their counsel; never us). Still open: <!-- FILL: the partner types without a written yes (brief field 14), or "none: all confirmed" --> | Before launch | **Launch**: recruiting that partner type, and any outreach or copy aimed at it |
| The partner agreement new partners sign (workflow 4's onboarding task sends it) <!-- FILL: from brief field 16: "the client has one", or "the client provides one" --> | Before launch | Onboarding the first partner |

## 14. Open questions

| Question | Who answers | Blocks |
|---|---|---|
| <!-- FILL: one row per open question, or "none" --> | | |

## 15. Approval

Approving this blueprint lets the AI session build and publish everything above in `<CLIENT_NAME>`'s GHL sub-account. Nothing a partner or the client reads goes live or is sent until the approver (at Using AI to Scale, Justin) approves its text.

- **Approved by:** <!-- FILL: the operator's name -->
- **Date:** <!-- FILL: YYYY-MM-DD -->
- **Their words:** "<!-- FILL: quote the approval -->"
