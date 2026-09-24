# Client brief: <CLIENT_NAME>

> Copied to `clients/<CLIENT_SLUG>/brief.md` and filled in step 0 (`process/0-intake.md`). The blueprint (step 1) is written from it.

- **Client slug:** `<CLIENT_SLUG>`
- **Written:** YYYY-MM-DD, by the AI session
- **Context read:** <!-- FILL: one line per file: its name, its date, what it is (a call transcript, notes, the client's website) -->

**How to fill each field.**
- **Answer:** specific and short, in the client's own words. Write numbers, names and lists out in full.
- **Source:** the context file plus a quote of 15 words or fewer, or `operator answer, YYYY-MM-DD`, or `default`.
- **Confidence:** `confirmed` (stated plainly), `inferred` (concluded from the context) or `default` (from `process/0-intake.md`, section 0.3). Never mark a guess `confirmed`.

Fields marked **Blocking** must be `confirmed` before the blueprint is written.

---

## 1. The client · Blocking (the name)

**Why the build needs it:** the names in GHL. The campaign and the funnel are called `<PROGRAM_NAME>`, and the walkthrough and the build record address the owner.

- **Answer:**
  - Business name (`<CLIENT_NAME>`): <!-- FILL -->
  - Owner or main contact (`<CLIENT_OWNER>`): <!-- FILL -->
  - Program name (`<PROGRAM_NAME>`): <!-- FILL: default "<CLIENT_NAME> Partner Program" -->
  - Time zone: <!-- FILL: default the sub-account's time zone, read in step 2 -->
- **Source:** <!-- FILL -->
- **Confidence:** <!-- FILL -->

## 2. Business and offer · Blocking

**Why the build needs it:** the commission variant follows how the client is paid by its own clients (monthly, one-time, per deal). The Become a Partner page and the walkthrough describe the offer in one line.

- **Answer:**
  - What they sell, and to whom: <!-- FILL -->
  - How a client pays them (monthly retainer, one-time fee, per closed deal): <!-- FILL -->
  - One line on the offer, as a partner would repeat it: <!-- FILL -->
- **Source:** <!-- FILL -->
- **Confidence:** <!-- FILL -->

## 3. Ideal partners (partner types) · Blocking

**Why the build needs it:** each partner type becomes an option of the `Partner Type` dropdown (with `Other` last). The groups the client targets in outreach become `segment/` tags.

- **Answer:**
  - Partner types, one per line: <!-- FILL -->
  - Groups to target first in outreach (for the `segment/` tags): <!-- FILL -->
  - A reason prospects give for saying no that is specific to this industry (for the `Lost Reason` options), if any: <!-- FILL: for example "Already has an SEO partner", or "none" -->
- **Source:** <!-- FILL -->
- **Confidence:** <!-- FILL -->

## 4. Tiers and partnership kinds

**Why the build needs it:** the options of the `Partner Tier` and `Partnership Type` fields.

- **Answer:**
  - Tiers: <!-- FILL: default Tier 1 / Tier 2 / Tier 3 -->
  - Partnership kinds: <!-- FILL: default Referral / White Label -->
- **Source:** <!-- FILL -->
- **Confidence:** <!-- FILL -->

## 5. Commission model and rate · Blocking

**Why the build needs it:** it picks the variant in `spec/variants.md` (monthly percentage, one fee per closed deal, or pay per lead). The rate goes into the Partner Sign-Up workflow, and the variant shapes the three commission workflows.

- **Answer:**
  - What a partner is paid for a referred client: <!-- FILL: the exact rate or fee, with its unit -->
  - For how long: <!-- FILL: every month the client pays / once per closed deal / per lead -->
  - Conditions or waiting period before a commission is due: <!-- FILL: or "none" -->
- **Source:** <!-- FILL -->
- **Confidence:** <!-- FILL -->

## 6. How and when partners are paid

**Why the build needs it:** the payout terms in the Affiliate Manager campaign, the `Payment Preference` options on the sign-up form, and what the payout task tells staff to do.

- **Answer:**
  - Payment methods offered: <!-- FILL: default the standard options (ACH, Check, PayPal, Gift Card, Service Credit, Other). One method only: see spec/variants.md, "One payout method" -->
  - Timing: <!-- FILL: default Net-15: the commissions approved in a month are paid on the 15th of the next month. A fixed monthly payout day (a check run): write the day, and see spec/variants.md, "A monthly payout run" -->
  - Who pays partners: <!-- FILL: default the client's staff, by hand, from the payout task -->
- **Source:** <!-- FILL -->
- **Confidence:** <!-- FILL -->

## 7. Who handles partners, and their GHL users

**Why the build needs it:** every task, every alert and the calendar go to `<PLACEHOLDER_USER>` until the client has a GHL user (`<CLIENT_USER>`). Step 9 swaps them, and walks this person through the monthly routine.

- **Answer:**
  - Who runs partner recruiting, the approval and payout tasks, and conflict reviews: <!-- FILL: names and roles -->
  - Does each have a GHL user? Name and email: <!-- FILL: default none yet -->
- **Source:** <!-- FILL -->
- **Confidence:** <!-- FILL -->

## 8. Intro-call calendar rules

**Why the build needs it:** the Partner Intro Call calendar. Its days and length are built in step 3; its hours, owner and video link are set with the client in step 9.

- **Answer:**
  - Days and hours for intro calls, and the time zone: <!-- FILL: default the standard calendar, Monday and Tuesday, placeholders -->
  - Call length: <!-- FILL: default 20 minutes -->
  - Daily maximum: <!-- FILL -->
  - Video meeting link: <!-- FILL -->
  - Dates to block: <!-- FILL -->
  - Who hosts the calls: <!-- FILL -->
- **Source:** <!-- FILL -->
- **Confidence:** <!-- FILL -->

## 9. Domain

**Why the build needs it:** the Become a Partner page cannot be published until a domain is connected to GHL. Until then, the forms use GHL's own link.

- **Answer:**
  - The client's website domain (`<CLIENT_DOMAIN>`): <!-- FILL -->
  - Can a domain or subdomain be connected to GHL, and who manages its DNS: <!-- FILL: default none yet -->
- **Source:** <!-- FILL -->
- **Confidence:** <!-- FILL -->

## 10. Cold email tool

**Why the build needs it:** workflow 1 and step 7 are built only if the client runs cold email in Instantly. Instantly webhooks need its Hyper Growth plan. The webhook trigger in GHL is a premium trigger, with a small charge per run.

- **Answer:**
  - Cold email tool used to recruit partners: <!-- FILL: Instantly / another tool / none -->
  - If Instantly: its plan, who has access, and whether the workspace also runs other offers: <!-- FILL -->
- **Source:** <!-- FILL -->
- **Confidence:** <!-- FILL -->

## 11. GHL plan and access

**Why the build needs it:** step 2. The operator needs their own user in the client's sub-account, a Private Integration token, and the Affiliate Manager in the Marketing menu.

- **Answer:**
  - Does the client have a GHL sub-account? Under whose agency? <!-- FILL -->
  - Can they invite `<PLACEHOLDER_USER>` as an admin user, and create a Private Integration token (alone, or with the operator on a call)? <!-- FILL -->
  - Does **Marketing → Affiliate Manager** show in their sub-account? <!-- FILL: or "unknown, checked in step 2" -->
- **Source:** <!-- FILL -->
- **Confidence:** <!-- FILL -->

## 12. A2P status (SMS)

**Why the build needs it:** SMS stays off until the client's A2P registration is approved. The standard build sends no SMS.

- **Answer:** <!-- FILL: approved / pending (what is owed) / not started. Default: not approved -->
- **Source:** <!-- FILL -->
- **Confidence:** <!-- FILL -->

## 13. Stripe

**Why the build needs it:** without Stripe, the Affiliate Manager tracks partners and leads, not money, so partners see leads in the portal, not earnings. Commissions in the portal need Stripe plus a sales campaign, which is not in v1.

- **Answer:** <!-- FILL: connected to GHL or not; does the client want commissions shown in the partner portal later? Default: not connected -->
- **Source:** <!-- FILL -->
- **Confidence:** <!-- FILL -->

## 14. Compliance limits for their industry

**Why the build needs it:** every DRAFT text the approver reviews (the page, the form texts, the emails, the walkthrough message) must follow them. And a partner type that may not legally take a referral fee must not be recruited: the blueprint's section 13 holds the launch until the client confirms each type.

- **Answer:**
  - Is the industry regulated (health, finance, legal, lending, insurance, real estate)? <!-- FILL -->
  - Words or claims the client must not use: <!-- FILL: default the standard rules: no earnings promises, no income claims, no medical claims, never "franchise" -->
  - **Referral fees, per partner type (blocks launch, not the build).** For each partner type in field 3: "Can this partner type legally receive a referral fee in the client's state and industry?" It matters most for licensed partners: real-estate agents and brokers, insurance agents and adjusters, home inspectors, mortgage and finance roles, clinicians, lawyers, accountants. The client confirms it per type, themselves or with their counsel, in writing. Never answer it from the context or by our own judgment, and give no legal advice. <!-- FILL: one line per partner type: "yes, confirmed in writing by <who>, YYYY-MM-DD", "no: not recruited", or "open: ask the client" (blocks launch to that type) -->
- **Source:** <!-- FILL -->
- **Confidence:** <!-- FILL -->

## 15. What is already in their GHL

**Why the build needs it:** the build is additive. Anything named like ours is a clash, settled with the operator in step 2. From the context only here; the survey in step 2 confirms it.

- **Answer:**
  - Pipelines, forms and workflows in use: <!-- FILL -->
  - Where their leads land today: <!-- FILL -->
  - Anything named like the standard build's items: <!-- FILL: or "unknown until the survey" -->
- **Source:** <!-- FILL -->
- **Confidence:** <!-- FILL -->

## 16. Anything else they asked for

**Why the build needs it:** each request outside the standard program becomes a change in the blueprint (with the operator's OK) or goes under "Not in this build".

- **Answer:**
  - Requests outside the standard program: <!-- FILL: one line per request, or "none" -->
  - Does the client have a partner agreement for new partners to sign? Workflow 4's onboarding task tells staff to send one: <!-- FILL: "yes: <where it is>", or "no: the client provides one before launch" -->
- **Source:** <!-- FILL -->
- **Confidence:** <!-- FILL -->

---

## Gaps and answers

| # | Question | Asked | Answer | Answered by, date |
|---|---|---|---|---|
| <!-- FILL: one row per gap question from step 0.5, or "none" --> | | | | |

## Ask the client

Questions the operator could not answer, for the operator to ask the client.

- <!-- FILL: one line per question, or "none" -->

## Context not used

Topics in the context that are not about this program.

- <!-- FILL: one line per topic, for example "Content strategy: a separate project", or "none" -->
