# Client brief: Example SEO Agency

> The worked example's brief: the first build's context, anonymised. The first build had no written brief: this one was reconstructed on 2026-09-25 from the build record and the program terms, in the shape step 0 (`process/0-intake.md`) produces.

- **Client slug:** `example-seo-agency`
- **Written:** 2026-09-25, by the AI session (reconstructed after the build)
- **Context read:**
  - The approver's Referral Partner Engine build spec (a GHL build spec for referral programs), 2026-09-21.
  - The operator's deliverables checklist for the client, 2026-09-21.
  - A team call transcript in which the partner program was discussed.
  - The operator's answers during the build, 2026-09-21 and 2026-09-22.

**How to fill each field.**
- **Answer:** specific and short, in the client's own words. Write numbers, names and lists out in full.
- **Source:** the context file plus a quote of 15 words or fewer, or `operator answer, YYYY-MM-DD`, or `default`.
- **Confidence:** `confirmed` (stated plainly), `inferred` (concluded from the context) or `default` (from `process/0-intake.md`, section 0.3). Never mark a guess `confirmed`.

Fields marked **Blocking** must be `confirmed` before the blueprint is written.

---

## 1. The client · Blocking (the name)

- **Answer:**
  - Business name (`<CLIENT_NAME>`): Example SEO Agency
  - Owner or main contact (`<CLIENT_OWNER>`): Alex Example
  - Program name (`<PROGRAM_NAME>`): Example SEO Partner Program
  - Time zone: America/New_York (the GHL sub-account's)
- **Source:** operator answer, 2026-09-21; the sub-account's settings
- **Confidence:** confirmed

## 2. Business and offer · Blocking

- **Answer:**
  - What they sell, and to whom: SEO for local businesses (ranking on Google and Google Maps).
  - How a client pays them: a monthly retainer.
  - One line on the offer, as a partner would repeat it: "They get local businesses found on Google."
- **Source:** operator answer, 2026-09-21
- **Confidence:** confirmed (the one-line offer: inferred)

## 3. Ideal partners (partner types) · Blocking

- **Answer:**
  - Partner types, one per line: Web Design / Development · Graphic Design / Branding · Print Shop / Commercial Printer · PPC / Paid Ads Agency · Social Media Agency · Email Marketing / Newsletter Agency · PR Firm / Publicist · Marketing Consultant / Fractional CMO · Business Coach · GHL / CRM Agency · Reputation / Review Management · Web Hosting · App Developer · Bookkeeper / CPA · Commercial Real Estate · Local Business Publication · Photographer / Video Production · Business Broker · Other (19)
  - Groups to target first in outreach (for the `segment/` tags): web design, graphic design, print shops, PPC agencies, social media agencies, email marketing agencies, PR and publicists, and other.
  - A reason prospects give for saying no that is specific to this industry: "Already has an SEO partner".
- **Source:** the operator's deliverables checklist, 2026-09-21
- **Confidence:** confirmed

## 4. Tiers and partnership kinds

- **Answer:**
  - Tiers: Tier 1 / Tier 2 / Tier 3
  - Partnership kinds: Referral / White Label
- **Source:** default
- **Confidence:** default

## 5. Commission model and rate · Blocking

- **Answer:**
  - What a partner is paid for a referred client: 15% of what the client pays each month.
  - For how long: every month the client pays, for the life of the client.
  - Conditions or waiting period before a commission is due: the client has paid for the month; the credit is not in dispute.
- **Source:** operator answer, 2026-09-21
- **Confidence:** confirmed

## 6. How and when partners are paid

- **Answer:**
  - Payment methods offered: ACH, Check, PayPal, Gift Card, Service Credit, Other.
  - Timing: Net-15 after the month ends.
  - Who pays partners: the client's staff, by hand, from the payout task.
- **Source:** default
- **Confidence:** default

## 7. Who handles partners, and their GHL users

- **Answer:**
  - Who runs partner recruiting, the approval and payout tasks, and conflict reviews: Alex Example, the owner.
  - Does each have a GHL user? No. The operator's user holds every task, alert and the calendar until Alex has one.
- **Source:** operator answer, 2026-09-21
- **Confidence:** confirmed

## 8. Intro-call calendar rules

- **Answer:**
  - Days and hours for intro calls, and the time zone: Monday and Tuesday. Hours not given: 10 AM–5 PM, America/New_York, as a placeholder.
  - Call length: 20 minutes.
  - Daily maximum: not given.
  - Video meeting link: not given.
  - Dates to block: not given.
  - Who hosts the calls: Alex Example, once they have a GHL user.
- **Source:** the operator's deliverables checklist, 2026-09-21: 20-minute calls, Monday and Tuesday
- **Confidence:** confirmed for the length and days; default for the rest

## 9. Domain

- **Answer:**
  - The client's website domain (`<CLIENT_DOMAIN>`): not connected to GHL.
  - Can a domain or subdomain be connected to GHL, and who manages its DNS: not yet decided.
- **Source:** operator answer, 2026-09-22
- **Confidence:** confirmed

## 10. Cold email tool

- **Answer:**
  - Cold email tool used to recruit partners: Instantly.
  - If Instantly: on a free trial that ends soon; webhooks need the Hyper Growth plan, not bought yet. The workspace runs the partner-recruiting campaigns.
- **Source:** operator answer, 2026-09-21
- **Confidence:** confirmed

## 11. GHL plan and access

- **Answer:**
  - Does the client have a GHL sub-account? Yes, under our agency.
  - Can they invite `<PLACEHOLDER_USER>` as an admin user, and create a Private Integration token? The operator is an agency admin on it; the operator created the sub-account token.
  - Does **Marketing → Affiliate Manager** show in their sub-account? Yes (enabled on the plan).
- **Source:** operator answer, 2026-09-21; the survey, 2026-09-21
- **Confidence:** confirmed

## 12. A2P status (SMS)

- **Answer:** pending: the client's A2P registration is not finished. No SMS.
- **Source:** operator answer, 2026-09-21
- **Confidence:** confirmed

## 13. Stripe

- **Answer:** not connected. Commissions in the partner portal are optional, later.
- **Source:** the team call transcript: Stripe is "for payouts"
- **Confidence:** confirmed

## 14. Compliance limits for their industry

- **Answer:**
  - Is the industry regulated? No.
  - Words or claims the client must not use: the standard rules: no earnings promises, no income claims, no medical claims, never "franchise".
  - Referral fees, per partner type: not asked in the first build (the question was added to the brief afterwards). Open: ask the client, per type, in writing. It matters most for the licensed roles among the 19 types: Bookkeeper / CPA, Commercial Real Estate, Business Broker.
- **Source:** default
- **Confidence:** default

## 15. What is already in their GHL

- **Answer:**
  - Pipelines, forms and workflows in use: none. Only GHL's demo data: a "Marketing Pipeline" with 4 "(Example)" deals, 5 "(example)" contacts and 3 demo tags. No custom fields, calendars or workflows.
  - Where their leads land today: nowhere in GHL yet.
  - Anything named like the standard build's items: no.
- **Source:** the survey, 2026-09-21
- **Confidence:** confirmed

## 16. Anything else they asked for

- **Answer:**
  - A real affiliate program: each partner has their own account and tracking link (the team call transcript). Built with the Affiliate Manager.
  - Does the client have a partner agreement for new partners to sign? Not asked in the first build (the question was added to the brief afterwards): ask the client.
  - A branded welcome email per partner: not built (the copy needs approval first).
- **Source:** the team call transcript
- **Confidence:** confirmed

---

## Gaps and answers

| # | Question | Asked | Answer | Answered by, date |
|---|---|---|---|---|
| 1 | Does the monthly commission run for the life of the client? | 2026-09-21 | Yes, 15% recurring for the life of each referred client | The operator, 2026-09-21 |
| 2 | Should the Referral Partners pipeline from the approver's spec be built too? | 2026-09-21 | No: Partner Recruiting and Partner Lifecycle cover it | The operator, 2026-09-21 |
| 3 | How should referred leads be credited in the Affiliate Manager? | 2026-09-22 | Custom mapping on the Referral ID | The approver, 2026-09-22 |

## Ask the client

- The calendar hours, daily maximum, video link and dates to block.
- Their own GHL user.
- The domain to connect, for the Become a Partner page.
- The Instantly upgrade to Hyper Growth, before its trial ends.
- For each partner type: can it legally receive a referral fee? (Field 14. Not asked in the first build.)

## Context not used

- The approver's own internal sales CRM (Part I of the spec): a separate project.
- Appointment automations, a reporting dashboard and partner reactivation: parked.
