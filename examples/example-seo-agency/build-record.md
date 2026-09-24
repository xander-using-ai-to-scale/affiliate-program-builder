---
status: live, waiting on the client (domain, Instantly plan, GHL user)
owner: the operator
updated: 2026-09-25
audience: Leadership
---

# Example SEO Agency: GHL partner program, build record

> What we built in Example SEO Agency's GoHighLevel (GHL) sub-account for the Example SEO Partner Program, and how it was tested. The worked example: the first build (Sep 21–22 2026), anonymised. Every GHL id is a placeholder or left out. Times are America/New_York (ET), the account's time zone. The first build ran before this repo existed, so its order differs from `process/` in places; the log says where.

- **Client:** Example SEO Agency (`example-seo-agency`) · **Owner:** Alex Example
- **Started:** 2026-09-21 · **Blueprint approved:** no written blueprint in the first build; the operator directed the build (see [blueprint.md](blueprint.md), section 15)
- **Variant:** monthly percentage · **Rate or fee:** 15% of each monthly payment, for the life of each referred client

## Status, as of 2026-09-25

| Piece | State | Date |
|---|---|---|
| Fields, tags, pipelines | Built over the API, double-checked | 2026-09-21 |
| Partner Intro Call calendar | Built. 20 min, Mon and Tue; the hours (10 AM–5 PM ET), the owner and the video link are placeholders | 2026-09-21 |
| Forms (3) | Built and saved | 2026-09-21; Refer a Client changed 2026-09-22 |
| Workflows (8) | All published | 2026-09-21 and 2026-09-22 |
| Affiliate Manager campaign | Published | 2026-09-22 |
| Become a Partner page | Saved, not published: waits on the domain and the approved copy | 2026-09-22 |
| Instantly webhook | Waits on the Hyper Growth plan (the trial ends soon) | – |
| Tests 0 to 7 | PASS (tests 1–5 before the Affiliate Manager steps existed; see Tests) | 2026-09-21, 2026-09-22 |
| Test 8, one real form fill | Owed | – |
| Test records deleted | Demo data and the first Instantly test deleted 2026-09-21. The referral-engine test records are still in the account for review | – |
| Walkthrough video | Waiting | – |
| Placeholder user swapped for the client's user | Waits on the client's GHL user | – |
| Commissions in the partner portal | Not in v1: needs the client's Stripe and a sales campaign | |

## Log

Newest last. Times ET.

- 2026-09-21 11:46 · Step 2: first token (an agency token) refused on everything but the location read ("Token's user type mismatch"). A sub-account Private Integration token created instead; it works.
- 2026-09-21 11:55 · Step 2: survey. The account holds only GHL's demo data.
- 2026-09-21 12:02 · Step 3 (part 1): the 10 recruiting fields, the 18 recruiting and segment tags, Partner Recruiting and Partner Lifecycle built. Calendar: refused twice (several days in one `openHours` entry: 422; slug `partner-intro-call` already taken across GHL: 400), then built with the slug `example-seo-agency-partner-intro-call`.
- 2026-09-21 12:04–12:58 · Step 5.4: workflow 1 built and published (in this repo's order it comes after the forms).
- 2026-09-21 12:58 · Test 0 PASS; 13:00 the repeat PASS.
- 2026-09-21 13:08 · Calendar changed to 20 minutes, Monday and Tuesday only (it was built as 30 minutes, Monday to Friday). Double-check PASS.
- 2026-09-21 13:24 · The operator's go-ahead to delete the demo data. 13:26 backup saved; 13:27 deleted by id: the demo pipeline, its 4 deals, the 5 demo contacts, the 3 demo tags, and the Instantly test contact and deal. 13:28 read-back and double-check PASS.
- 2026-09-21 13:46 · Step 3 (part 2): the 14 referral-engine fields, the 7 deal fields, the 14 referral-engine tags and Referred Leads built. 13:48 the 5 "Claimed …" staging fields.
- 2026-09-21 13:48–14:15 · Step 4: the three forms built (Staff Attribution as a copy of Refer a Client).
- 2026-09-21 14:17–16:24 · Step 5.5: workflow 2 built and published.
- 2026-09-21 16:25 · An automated fill of Refer a Client was stopped by the bot check ("Please complete the challenge and try again"). Not worked around: the tests use the API.
- 2026-09-21 16:26 · Tests 1 and 2 PASS.
- 2026-09-21 16:29–16:34 · Step 5.6: workflow 3 (a copy of workflow 2) published. 16:34 Test 3 PASS.
- 2026-09-21 16:35–16:55 · Step 5.7: workflow 4 published. 16:55 Test 4 PASS.
- 2026-09-21 16:57–17:56 · Steps 5.8–5.10: workflows 6, 7 and 8 published; Test 5 PASS (the loop with the wait at 1 minute, then the stop); 17:56 the wait set back to 30 days and saved (workflow 8 v4).
- 2026-09-22 11:14–11:20 · Step 6: the Affiliate Manager opened; Settings read, nothing changed. The Portal Settings and Customizations tabs did not draw (the window was covered).
- 2026-09-22 11:39–12:05 · Step 6.2: the campaign built and published (the first Publish click did nothing while the window was covered; it went through once the window was on screen).
- 2026-09-22 12:07–12:08 · Step 6.3: `Add to affiliate manager` and `Add to affiliate campaign` added to workflow 4 (v4).
- 2026-09-22 12:09 · Test 6, first run (Test Partner E): E is an affiliate in the campaign, Referral ID `testpartnere9104`. Its link has no `am_id`: workflow 5 did not exist yet.
- 2026-09-22 12:12–12:13 · Step 6.5: Refer a Client's `Claimed Referral Code` query key changed from `claimed_referral_code` to `am_id`.
- 2026-09-22 12:13–12:21 · Step 6.4: workflow 5 built and published.
- 2026-09-22 12:22–12:25 · Step 6.6: `File the lead under its partner` added to workflows 2 (v6) and 3 (v4).
- 2026-09-22 12:26 · Test 6, second run (Test PartnerF): the link carries both ids. PASS.
- 2026-09-22 12:27 · Test 7 (a referral through F's link): PASS, filed under F.
- 2026-09-22 12:29–12:30 · Checked: Add Manual Commission offers no campaign (no Stripe). Closed without submitting.
- 2026-09-22 12:31–12:36 · Step 6.7: the funnel and the Become a Partner page built and saved.
- 2026-09-22 12:48 · On the operator's request, tried to publish the page: refused, no domain. Left saved.
- 2026-09-25 · The build record written up from the log and a read-only API check (this repo's example).

## The account

- **Sub-account:** Example SEO Agency
- **Location id:** `<LOCATION_ID>`
- **Time zone:** America/New_York
- **Token file:** `~/.secrets/Example Token.txt`. The name only. A **sub-account** Private Integration token with: View and Edit Contacts, Opportunities, Custom Fields, Tags, Calendars; View Users, Workflows, Locations. The same token read forms and funnels.
- **Users:** two agency admins: the approver, and the operator.
- **Placeholder user:** `<PLACEHOLDER_USER>` (the operator), until the client's user `<CLIENT_USER>` takes over (step 9)

## Survey before the build

2026-09-21 11:55 ET: GHL's demo data only. A "Marketing Pipeline" (New Lead → Contacted → Qualified → Proposal Sent → Negotiation → Closed) with 4 "(Example)" deals; 5 "(example)" contacts; the tags `follow-up`, `high priority`, `warm lead`; 0 custom fields, 0 calendars, 0 workflows, 0 forms. The Affiliate Manager is enabled on the plan.

- **In use today:** nothing.
- **Name clashes and decisions:** no clashes. The demo data was deleted on the operator's go-ahead (log, 2026-09-21 13:24).

## What was built

### Structure (step 3)

- **Contact fields:** the 29 standard fields in `spec/structure.json`, with these client values: `Partner Type` with the 19 options in [config.json](config.json); `Lost Reason` with the extra option `Already has an SEO partner`.
- **Deal fields:** the 7 standard fields.
- **Tags:** the 24 standard tags, plus: `segment/web-design`, `segment/graphic-design`, `segment/print-shop`, `segment/ppc-agency`, `segment/social-media-agency`, `segment/email-marketing`, `segment/pr-publicist`, `segment/other`.

| Pipeline | Id | Stages |
|---|---|---|
| Partner Recruiting | (omitted) | New → Working → Engaged → Booked → Showed → Offer Made |
| Partner Lifecycle | (omitted) | Signed → Onboarding → Activated → Producing → Dormant |
| Referred Leads | (omitted) | Referral Received → Attempting Contact → Contacted / Nurture → Appointment Booked → Appointment Showed → Qualified / Consult Completed → Sold / Enrolled → Commission Pending → Commission Approved → Commission Paid, plus No Show / Unqualified, Lost / No Sale, Attribution Review |

- **Calendar, Partner Intro Call:** id (omitted), slug `example-seo-agency-partner-intro-call`. Round robin, 20-minute slots every 30 minutes, 10-minute buffer, 1 booking per slot, 2 hours' notice, up to 30 days ahead, auto-confirm, reschedule and cancel allowed. Placeholders: the hours (Mon and Tue 10:00–17:00 ET), the owner (`<PLACEHOLDER_USER>`), the video link (empty).
- **Double-check after step 3:** PASS on 2026-09-21 at 13:08 and 13:28 ET; 51 checks PASS on 2026-09-22 at 11:36 ET.

### Forms (step 4)

| Form | Id | Share link | Notes |
|---|---|---|---|
| Refer a Client | `<REFER_FORM_ID>` | `https://api.leadconnectorhq.com/widget/form/<REFER_FORM_ID>` | Hidden fields: `claimed_partner_id`, `claimed_partner_name`, `am_id` (the last was `claimed_referral_code` until 2026-09-22) |
| Partner Sign-Up | `<SIGNUP_FORM_ID>` | `https://api.leadconnectorhq.com/widget/form/<SIGNUP_FORM_ID>` | On the Become a Partner page |
| Staff Attribution | `<STAFF_FORM_ID>` | `https://api.leadconnectorhq.com/widget/form/<STAFF_FORM_ID>` | Internal: for staff only. A copy of Refer a Client made before the `am_id` change, so its code field keeps `claimed_referral_code` |

All three as [spec/forms.md](../../spec/forms.md). Form submissions over the life of the build: 0 (every test went in over the API).

### Workflows (steps 5 and 6)

| # | Workflow | Id | Version | Published on |
|---|---|---|---|---|
| 1 | `Instantly - Interested Partner Reply` | (omitted) | 4 | 2026-09-21 |
| 2 | `Referral Engine - Referral Capture` | (omitted) | 6 | 2026-09-21; step added 2026-09-22 |
| 3 | `Referral Engine - Staff Attribution` | (omitted) | 4 | 2026-09-21; step added 2026-09-22 |
| 4 | `Referral Engine - Partner Sign-Up` | (omitted) | 4 | 2026-09-21; steps added 2026-09-22 |
| 5 | `Referral Engine - Affiliate Link` | (omitted) | 3 | 2026-09-22 |
| 6 | `Referral Engine - Commission 1: Sale` | (omitted) | 3 | 2026-09-21 |
| 7 | `Referral Engine - Commission 2: Approved` | (omitted) | 3 | 2026-09-21 |
| 8 | `Referral Engine - Commission 3: Paid, monthly repeat` | (omitted) | 4 | 2026-09-21 |

Every workflow was built as its spec file says; the spec files were written from this build. The rows below list each workflow's steps and the only differences.

#### 1. Instantly - Interested Partner Reply

- **Spec:** `spec/workflows/1-instantly-interested-reply.md` · **Trigger:** Inbound Webhook "Instantly - lead marked interested", no filters
- **Webhook URL:** `<INSTANTLY_WEBHOOK_URL>`

| # | Step | Setting | As spec? |
|---|---|---|---|
| 1–7 | Create contact · Update contact field · Add Tag · Create opportunity · Note · Internal Notification · Add task | As the spec | Yes. The note has no space after each colon (the editor dropped it) |

#### 2. Referral Engine - Referral Capture

- **Spec:** `spec/workflows/2-referral-capture.md` · **Trigger:** Form Submitted, Form is Refer a Client

| # | Step | Setting | As spec? |
|---|---|---|---|
| 1–3 | Mark as Referred Lead · Add Tag · First claim or already claimed? | As the spec | Yes |
| 4a–4d | Record first claim · File the lead under its partner · Open referred-lead deal · Referral follow-up | As the spec | Yes. 4b added 2026-09-22 |
| 5a–5e | Add Tag · Mark attribution conflicting · Attribution review task · Find the referred-lead deal · Move deal to Attribution Review | As the spec | Yes |

#### 3. Referral Engine - Staff Attribution

- **Spec:** `spec/workflows/3-staff-attribution.md` · **Trigger:** Form Submitted, Form is Staff Attribution

| # | Step | Setting | As spec? |
|---|---|---|---|
| All | As workflow 2, method `Staff Entered` | Duplicated from workflow 2 | Partly. `Move deal to Attribution Review` came over by duplication and was never re-added or tested; an orange marker showed next to `Staff Entered`. The spec now says to re-add both |

#### 4. Referral Engine - Partner Sign-Up

- **Spec:** `spec/workflows/4-partner-sign-up.md` · **Trigger:** Form Submitted, Form is Partner Sign-Up

| # | Step | Setting | As spec? |
|---|---|---|---|
| 1–4 | Set up as partner · Add Tag · Open partner deal · Onboarding task | `Revenue Share Percent` = `15` | Yes |
| 5–6 | Add to affiliate manager · Add to affiliate campaign | Campaign `Example SEO Partner Program` | Yes. Added 2026-09-22 |

#### 5. Referral Engine - Affiliate Link

- **Spec:** `spec/workflows/5-affiliate-link.md` · **Trigger:** Affiliate enrolled in campaign, Campaign Is Example SEO Partner Program

| # | Step | Setting | As spec? |
|---|---|---|---|
| 1 | Write the partner's affiliate link | Affiliate Link and Referral Code | Yes. A Split-text formatter step was started and cancelled unsaved |

#### 6. Referral Engine - Commission 1: Sale

- **Spec:** `spec/workflows/6-commission-1-sale.md` · **Trigger:** Pipeline Stage Changed, Referred Leads, Sold / Enrolled

| # | Step | Setting | As spec? |
|---|---|---|---|
| 1–3 | Record sale, open commission · Lock attribution · Approve commission task | 15% in the task | Yes |

#### 7. Referral Engine - Commission 2: Approved

- **Spec:** `spec/workflows/7-commission-2-approved.md` · **Trigger:** Pipeline Stage Changed, Referred Leads, Commission Approved

| # | Step | Setting | As spec? |
|---|---|---|---|
| 1–2 | Record approval · Payout task | Duplicated from workflow 6; rows re-added | Yes |

#### 8. Referral Engine - Commission 3: Paid, monthly repeat

- **Spec:** `spec/workflows/8-commission-3-paid-monthly.md` · **Trigger:** Pipeline Stage Changed, Referred Leads, Commission Paid

| # | Step | Setting | As spec? |
|---|---|---|---|
| 1–4b | Record payment · Wait 30 days · Still a paying client? · Open next month's commission · Next month approval task | Wait back at 30 days after the tests | Yes. The `Commission Status` row in 4a was copied from workflow 6 and shows as text; it worked |

### Affiliate Manager (step 6)

| Piece | Setting |
|---|---|
| Campaign `Example SEO Partner Program` | Published 2026-09-22 12:05 ET. Links lead to Refer a Client, tracked with `?am_id`. Pay Per Lead, per-lead amount off. GHL's invite email on, Default Template. Cookie life 365 days. Payout terms Net-15. No payment gateway (the first-visit page skipped with Skip & Get Started) |
| Partner Sign-Up | `Add to affiliate manager` and `Add to affiliate campaign` added; v4 |
| Affiliate Link workflow | Id (omitted), v3 |
| Refer a Client form | `Claimed Referral Code` fills from `am_id` |
| Referral Capture and Staff Attribution | `File the lead under its partner` added to the first-claim branch; v6 and v4 |
| Become a Partner page | Funnel `Example SEO Partner Program`, step `/become-a-partner`, preview `https://sites.leadconnectorhq.com/preview/<PAGE_ID>`; saved, not published |

**A partner's link** is in their `Affiliate Link` field. It carries both ids, so one link feeds both the referral engine and the Affiliate Manager:
`https://api.leadconnectorhq.com/widget/form/<REFER_FORM_ID>?am_id=<their Referral ID>&claimed_partner_id=<their Partner ID>&claimed_partner_name=<First>%20<Last>`

## Tests (step 8)

Full outputs: [test-log.md](test-log.md), next to this file.

| Test | What it proves | Ran at (date, time, zone) | Result | Notes |
|---|---|---|---|---|
| 0. Instantly reply, and its repeat | An interested lead becomes a contact and a deal at Engaged; a repeat keeps one of each | 2026-09-21 12:58 and 13:00 ET | PASS | Webhook fired by script; the real Instantly webhook is not connected |
| 1. First claim | The first partner gets the credit, and a deal opens | 2026-09-21 16:26 ET | PASS | Ran before `File the lead under its partner` existed |
| 2. Second claim on the same client | A later claim goes to Attribution Review; the credit stays | 2026-09-21 16:27 ET | PASS | |
| 3. Staff-logged introduction | Staff can credit a partner, method Staff Entered | 2026-09-21 16:34 ET | PASS | The conflict branch of workflow 3 was not tested |
| 4. Partner sign-up | Role, Partner ID, rate, link, tags, deal and task; an affiliate | 2026-09-21 16:55 ET | PASS | Ran before the Affiliate Manager steps existed |
| 5. Commission cycle and monthly loop | Sold → Pending → Approved → Paid, back to Pending after the wait, and the stop on Lost / No Sale | 2026-09-21 17:18–17:56 ET | PASS | The wait at 1 minute for the test, set back to 30 days at 17:56. A second month's approval was not run |
| 6. Affiliate sign-up | The partner is in the campaign, with one link carrying both ids | 2026-09-22 12:09 and 12:26 ET | PASS | Partner E (12:09) joined before workflow 5 existed, so E's link has no `am_id`; partner F (12:26) proved the link. Scenario `partnerF` then; `partnerE` in this repo |
| 7. Referral through the link | The lead is credited to the partner and filed under them | 2026-09-22 12:27 ET | PASS | Scenario `claimF` then; `claimE` in this repo |
| 8. One real form fill, by a person | The live form, its hidden fields, and GHL's own tracking | – | Owed | |

## Copy waiting for approval

Everything a partner or the client reads is DRAFT until the approver approves it.

| Text | Where it is | Status |
|---|---|---|
| Headline "Become an Example SEO Partner" | Become a Partner page | DRAFT |
| Copy line "Refer local businesses to Example SEO Agency. Sign up below and we'll email you your partner account and your personal referral link." | Become a Partner page | DRAFT |
| Form labels and placeholders ("Client's business name", "e.g. Smith Dental", "What does this client need? (optional)", "Business name", "Your agency or company", "Who are your clients? (industries, locations)") | Refer a Client, Partner Sign-Up | DRAFT |
| The forms' thank-you message and Submit button (GHL's defaults) | All three forms | DRAFT |
| The walkthrough message and the three partner emails | Not written yet (step 9) | – |

## Design choices, and why

1. **The spec's single "Referral Partners" pipeline is split in two.** Partner Recruiting and Partner Lifecycle carry the same stages, split into before and after the partner signs.
2. **Forms write to "Claimed ..." fields, never to the real credit fields.** A GHL form overwrites contact fields the moment it is submitted, before any workflow runs. So a workflow copies a claim across only on a first claim, and every later claim goes to Attribution Review for a person to decide. That is how "verified attribution cannot be silently overwritten" holds in GHL.
3. **The commission runs as a cycle on the deal** (monthly percentage variant). Its state is the deal's stage plus `Commission Status`. It uses no commission tags, because tags would pile up on a monthly loop.
4. **No partner or client emails in the workflows.** Their text needs approval first. Drafts are in `partner-emails-DRAFT.md`.
5. **The Affiliate Manager holds each partner's profile, portal login, link and leads. The referral engine keeps the credit rules and the commission.** Without Stripe, a campaign can track partners and leads but not sales.
6. **One link carries both ids** (GHL's `am_id`, plus our Partner ID and name). First-claim-wins keeps working, and the lead is filed under the right partner by custom mapping on the `am_id`, whether or not GHL's own tracking picks it up.
7. **Only first claims are filed in the Affiliate Manager.** A disputed lead goes under nobody until a person decides.
8. **Deals are named by the contact's email.** Instantly often sends no names, and Find opportunity matches on the deal's name.
9. **The calendar is 20 minutes on Monday and Tuesday**, from the operator's deliverables checklist. It was first built as 30 minutes, Monday to Friday, and changed the same day.

## Known limits

- **`Reward Amount` is typed by hand each month.** Without Stripe, GHL has no payment to compute it from.
- **No commissions in the partner portal.** Partners see their leads, not their earnings, until the client connects Stripe and a sales campaign is added.
- **The forms use GHL's own link** until the client's domain is connected, and the Become a Partner page waits for it.
- **A space in a partner's last name** breaks the name part of their link in some email apps. The credit still works, because it keys on the Partner ID.
- **A partner who registers the same client twice** is flagged as a conflict too. The review takes seconds.
- **Attribution Review replaces the deal's stage.** The review task says to move the deal back; its history shows the old stage.
- **Staff-logged introductions** are filed in the Affiliate Manager only when staff type the partner's Referral Code into the Staff Attribution form.
- **GHL's invite email is its standard one.** A branded welcome email is drafted in `partner-emails-DRAFT.md`, not wired.
- **The Instantly webhook trigger is a premium trigger:** a small charge per run.
- **Test Partner E's link has no `am_id`**, because E joined before workflow 5 existed. Any partner added before workflow 5 needs their link rewritten.

## Open items

| Item | Owner | Since | Notes |
|---|---|---|---|
| Connect the client's domain, then publish the Become a Partner page and move the forms onto it | The client, then the operator | 2026-09-22 | The copy needs the approver's OK first |
| Instantly on Hyper Growth ($97 a month), then the webhook (step 7) | The client | 2026-09-21 | Before the trial ends |
| The client's own GHL user, then the placeholder swap | The client | 2026-09-21 | Calendar owner, notification recipient, every task assignee |
| The calendar rules (hours, daily maximum, video link, blocked dates) | The client | 2026-09-21 | |
| One real form fill through a partner's link (test 8) | The operator | 2026-09-22 | 1 minute |
| A2P registration before any SMS | The client | 2026-09-21 | The client's registration details are owed |
| Stripe and a sales campaign, for commissions in the portal | The client | 2026-09-22 | Optional |
| Delete the test records below | The operator | 2026-09-22 | After the walkthrough video |

## Test records to delete

| Email | Contact id | Deals | Deleted on |
|---|---|---|---|
| `test.referral1@example.com` | (omitted) | 1, Referred Leads / Attribution Review | – |
| `test.referral2@example.com` | (omitted) | 1, Referred Leads / Lost / No Sale | – |
| `test.referral3@example.com` | (omitted) | 1, Referred Leads / Referral Received | – |
| `test.partner.d@example.com` | (omitted) | 1, Partner Lifecycle / Onboarding | – |
| `test.partner.e@example.com` | (omitted) | 1, Partner Lifecycle / Onboarding | – |
| `test.partner.f@example.com` | (omitted) | 1, Partner Lifecycle / Onboarding | – |

- **Test affiliates to remove from the Affiliate Manager:** Test Partner E, Test PartnerF. (Test Partner D joined before the Affiliate Manager steps existed, so D is not an affiliate.)
- **Go-ahead:** the demo data and the first Instantly test contact were deleted on the operator's go-ahead on 2026-09-21 ("I'm giving you permission to go ahead and delete them yourself"). The records above wait for a new go-ahead.
- **Backup:** a JSON backup of all contacts, deals, pipelines and tags, taken 2026-09-21 13:26 ET before the deletes.
- **Kept on purpose:** the contact GHL made for the alert address (source "notification").

## Handover (step 9)

- **Flowcharts PDF:** `examples/example-seo-agency/flowcharts.pdf`
- **Walkthrough video:** not recorded yet
- **Staff shown the two routines:** not yet
- **Placeholder swap:** waits on the client's GHL user
- **Calendar rules set:** open item
- **Filed in:** the operator's records
