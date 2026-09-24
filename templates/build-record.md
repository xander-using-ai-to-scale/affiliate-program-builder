---
status: building
owner: <!-- FILL: the operator -->
updated: YYYY-MM-DD
audience: Leadership
---

# <CLIENT_NAME>: GHL partner program, build record

> What we built in <CLIENT_NAME>'s GoHighLevel (GHL) sub-account for the <PROGRAM_NAME>, and how it was tested. Built with the Affiliate Program Builder, version <!-- FILL: from CHANGELOG.md -->. Copied to `clients/<CLIENT_SLUG>/build-record.md` in step 0, kept up to date through every step, and finished in step 9. Afterwards the operator files it in their own records. The token is never written here, only its file name.

- **Client:** <CLIENT_NAME> (`<CLIENT_SLUG>`) · **Owner:** <CLIENT_OWNER>
- **Started:** <!-- FILL: YYYY-MM-DD --> · **Blueprint approved:** <!-- FILL: YYYY-MM-DD, by whom -->
- **Variant:** <!-- FILL: monthly percentage / one fee per closed deal / pay per lead --> · **Rate or fee:** <!-- FILL: 15% / $250 -->
- **Client differences** (`spec/variants.md`): <!-- FILL: homeowner clients / phone-only referrals / one payout method / a monthly payout run, or "none" -->

> **Variant markers.** This template is written for the monthly percentage. Every `<!-- FILL: fee variant ... -->` marker below says what to write instead for the "one fee per closed deal" variant; for pay per lead, follow `spec/variants.md` the same way. Delete each marker once it is handled.

## Status, as of YYYY-MM-DD

| Piece | State | Date |
|---|---|---|
| Fields, tags, pipelines | <!-- FILL: built over the API, double-checked --> | |
| Partner Intro Call calendar | <!-- FILL: built; hours, owner and video link are placeholders until step 9 --> | |
| Forms (3) | <!-- FILL --> | |
| Workflows (8, or 7 without Instantly) | <!-- FILL: all published --> | |
| Affiliate Manager campaign | <!-- FILL: published --> | |
| Become a Partner page | <!-- FILL: saved, not published: waits on the domain and the approved copy --> | |
| Instantly webhook | <!-- FILL: live / waits on the Hyper Growth plan / not used --> | |
| Tests 0 to 7 | <!-- FILL --> | |
| Test 8, one real form fill | <!-- FILL: passed / owed --> | |
| Test records deleted | <!-- FILL --> | |
| Walkthrough video | <!-- FILL: sent / waiting --> | |
| Placeholder user swapped for the client's user | <!-- FILL: done / waits on the client's GHL user --> | |
| Commissions in the partner portal | Not in v1: needs the client's Stripe and a sales campaign | |

## Log

Newest last. One line per step started or finished, per question asked and answered, and per decision.

- <!-- FILL: YYYY-MM-DD HH:MM · Step 0 started -->

## The account

- **Sub-account:** <!-- FILL: its name in GHL -->
- **Location id:** `<LOCATION_ID>`
- **Time zone:** <!-- FILL -->
- **Token file:** `~/.secrets/<TOKEN_FILE>`. The name only.
- **Users:** <!-- FILL: name, email and role of each user -->
- **Placeholder user:** `<PLACEHOLDER_USER>`, until the client's user `<CLIENT_USER>` takes over (step 9)

## Survey before the build

<!-- FILL: paste the output of survey.js from step 2.4, with the date and time -->

- **In use today:** <!-- FILL: where the client's leads land, which forms and workflows run, or "none" -->
- **Name clashes and decisions:** <!-- FILL: each clash, what the client has, and the operator's decision, or "no clashes" -->

## What was built

### Structure (step 3)

- **Contact fields:** the 29 standard fields in `spec/structure.json`, with these client values: <!-- FILL: the Partner Type options, and any other change -->
- **Deal fields:** the 7 standard fields.
- **Tags:** the 24 standard tags, plus: <!-- FILL: the segment/ tags -->

| Pipeline | Id | Stages |
|---|---|---|
| Partner Recruiting | <!-- FILL --> | New → Working → Engaged → Booked → Showed → Offer Made |
| Partner Lifecycle | <!-- FILL --> | Signed → Onboarding → Activated → Producing → Dormant |
| Referred Leads | <!-- FILL --> | Referral Received → Attempting Contact → Contacted / Nurture → Appointment Booked → Appointment Showed → Qualified / Consult Completed → Sold / Enrolled → Commission Pending → Commission Approved → Commission Paid, plus No Show / Unqualified, Lost / No Sale, Attribution Review |

- **Calendar, Partner Intro Call:** id <!-- FILL -->, slug `<CLIENT_SLUG>-partner-intro-call`. <!-- FILL: its length, days, buffer, notice and booking window. Placeholders: the hours, the owner, the video link -->
- **Double-check after step 3:** <!-- FILL: the date, time and result, and the output -->

### Forms (step 4)

| Form | Id | Share link | Notes |
|---|---|---|---|
| Refer a Client | `<REFER_FORM_ID>` | `https://api.leadconnectorhq.com/widget/form/<REFER_FORM_ID>` | Hidden fields: `claimed_partner_id`, `claimed_partner_name`, `am_id` |
| Partner Sign-Up | `<SIGNUP_FORM_ID>` | `https://api.leadconnectorhq.com/widget/form/<SIGNUP_FORM_ID>` | On the Become a Partner page |
| Staff Attribution | `<STAFF_FORM_ID>` | `https://api.leadconnectorhq.com/widget/form/<STAFF_FORM_ID>` | Internal: for staff only |

### Workflows (steps 5 and 6)

| # | Workflow | Id | Version | Published on |
|---|---|---|---|---|
| 1 | `Instantly - Interested Partner Reply` | <!-- FILL: or "not built" --> | | |
| 2 | `Referral Engine - Referral Capture` | <!-- FILL --> | | |
| 3 | `Referral Engine - Staff Attribution` | <!-- FILL --> | | |
| 4 | `Referral Engine - Partner Sign-Up` | <!-- FILL --> | | |
| 5 | `Referral Engine - Affiliate Link` | <!-- FILL --> | | |
| 6 | `Referral Engine - Commission 1: Sale` | <!-- FILL --> | | |
| 7 | `Referral Engine - Commission 2: Approved` | <!-- FILL --> | | |
| 8 | `Referral Engine - Commission 3: Paid, monthly repeat` <!-- FILL: fee variant: `Referral Engine - Commission 3: Paid` --> | <!-- FILL --> | | |

For each workflow below: copy the step table from its spec file, then mark each row as built as the spec says (`yes`), or describe the difference and who approved it.

#### 1. Instantly - Interested Partner Reply

- **Spec:** `spec/workflows/1-instantly-interested-reply.md` · **Trigger:** <!-- FILL -->
- **Webhook URL:** `<INSTANTLY_WEBHOOK_URL>`

| # | Step | Setting | As spec? |
|---|---|---|---|
| <!-- FILL: one row per step, or "not built" --> | | | |

#### 2. Referral Engine - Referral Capture

- **Spec:** `spec/workflows/2-referral-capture.md` · **Trigger:** <!-- FILL -->

| # | Step | Setting | As spec? |
|---|---|---|---|
| <!-- FILL: one row per step, both branches, including "File the lead under its partner" --> | | | |

#### 3. Referral Engine - Staff Attribution

- **Spec:** `spec/workflows/3-staff-attribution.md` · **Trigger:** <!-- FILL -->

| # | Step | Setting | As spec? |
|---|---|---|---|
| <!-- FILL --> | | | |

#### 4. Referral Engine - Partner Sign-Up

- **Spec:** `spec/workflows/4-partner-sign-up.md` · **Trigger:** <!-- FILL -->

| # | Step | Setting | As spec? |
|---|---|---|---|
| <!-- FILL: including "Add to affiliate manager" and "Add to affiliate campaign" --> | | | |

#### 5. Referral Engine - Affiliate Link

- **Spec:** `spec/workflows/5-affiliate-link.md` · **Trigger:** <!-- FILL -->

| # | Step | Setting | As spec? |
|---|---|---|---|
| <!-- FILL --> | | | |

#### 6. Referral Engine - Commission 1: Sale

- **Spec:** `spec/workflows/6-commission-1-sale.md` · **Trigger:** <!-- FILL -->

| # | Step | Setting | As spec? |
|---|---|---|---|
| <!-- FILL --> | | | |

#### 7. Referral Engine - Commission 2: Approved

- **Spec:** `spec/workflows/7-commission-2-approved.md` · **Trigger:** <!-- FILL -->

| # | Step | Setting | As spec? |
|---|---|---|---|
| <!-- FILL --> | | | |

#### 8. Referral Engine - Commission 3: Paid, monthly repeat

<!-- FILL: fee variant: rename this heading "8. Referral Engine - Commission 3: Paid", and the spec below `spec/workflows/8b-commission-3-paid-once.md`: one step, no wait -->

- **Spec:** `spec/workflows/8-commission-3-paid-monthly.md` · **Trigger:** <!-- FILL -->

| # | Step | Setting | As spec? |
|---|---|---|---|
| <!-- FILL: the wait must read 30 days after the tests. Fee variant: the one step `Record payment` --> | | | |

### Affiliate Manager (step 6)

| Piece | Setting |
|---|---|
| Campaign `<PROGRAM_NAME>` | <!-- FILL: published on YYYY-MM-DD. Links lead to Refer a Client, tracked with `?am_id`. Pay Per Lead, per-lead amount off. GHL's invite email on. Cookie life 365 days. Payout terms --> |
| Partner Sign-Up | <!-- FILL: "Add to affiliate manager" and "Add to affiliate campaign" added; version --> |
| Affiliate Link workflow | <!-- FILL: id and version --> |
| Refer a Client form | `Claimed Referral Code` fills from `am_id` |
| Referral Capture and Staff Attribution | <!-- FILL: "File the lead under its partner" added to the first-claim branch; versions --> |
| Become a Partner page | <!-- FILL: funnel `<PROGRAM_NAME>`, step `/become-a-partner`, preview `https://sites.leadconnectorhq.com/preview/<PAGE_ID>`; saved, not published --> |

**A partner's link** is in their `Affiliate Link` field. It carries both ids, so one link feeds both the referral engine and the Affiliate Manager:
`https://api.leadconnectorhq.com/widget/form/<REFER_FORM_ID>?am_id=<their Referral ID>&claimed_partner_id=<their Partner ID>&claimed_partner_name=<First>%20<Last>`

## Tests (step 8)

Full outputs: `test-log.md`, next to this file.

| Test | What it proves | Ran at (date, time, zone) | Result | Notes |
|---|---|---|---|---|
| 0. Instantly reply, and its repeat | An interested lead becomes a contact and a deal at Engaged; a repeat keeps one of each | | | <!-- FILL: or "not built" --> |
| 1. First claim | The first partner gets the credit, and a deal opens | | | |
| 2. Second claim on the same client | A later claim goes to Attribution Review; the credit stays | | | |
| 3. Staff-logged introduction | Staff can credit a partner, method Staff Entered | | | |
| 4. Partner sign-up | Role, Partner ID, rate, link, tags, deal and task; an affiliate | | | |
| 5. Commission cycle and monthly loop <!-- FILL: fee variant: "5. The fee cycle" --> | Sold → Pending → Approved → Paid, back to Pending after the wait, month two, and the stop on Lost / No Sale <!-- FILL: fee variant: "Sold → Pending (Reward Amount set) → Approved → Paid; nothing repeats" --> | | | <!-- FILL: note the wait set back to 30 days. Fee variant: note there is no wait and no loop --> |
| 6. Affiliate sign-up | The partner is in the campaign, with one link carrying both ids | | | |
| 7. Referral through the link | The lead is credited to the partner and filed under them | | | |
| 8. One real form fill, by a person | The live form, its hidden fields, and GHL's own tracking | | | <!-- FILL: or "owed" --> |

## Copy waiting for approval

Everything a partner or the client reads is DRAFT until the approver (at Using AI to Scale, Justin) approves it.

| Text | Where it is | Status |
|---|---|---|
| <!-- FILL: one row per text: the form texts, the page's headline and copy line, the walkthrough message, the three partner emails --> | | DRAFT / approved YYYY-MM-DD: "their words" |

## Design choices, and why

1. **The spec's single "Referral Partners" pipeline is split in two.** Partner Recruiting and Partner Lifecycle carry the same stages, split into before and after the partner signs.
2. **Forms write to "Claimed ..." fields, never to the real credit fields.** A GHL form overwrites contact fields the moment it is submitted, before any workflow runs. So a workflow copies a claim across only on a first claim, and every later claim goes to Attribution Review for a person to decide. That is how "verified attribution cannot be silently overwritten" holds in GHL.
3. **The commission runs as a cycle on the deal** (monthly percentage variant). Its state is the deal's stage plus `Commission Status`. It uses no commission tags, because tags would pile up on a monthly loop. <!-- FILL: fee variant: replace with "**The fee is tracked on the deal.** Its state is the deal's stage plus `Commission Status`, with no commission tags. The deal is paid once: workflow 8 is renamed `Referral Engine - Commission 3: Paid` and has no wait and no loop." -->
4. **No partner or client emails in the workflows.** Their text needs approval first. Drafts are in `partner-emails-DRAFT.md`.
5. **The Affiliate Manager holds each partner's profile, portal login, link and leads. The referral engine keeps the credit rules and the commission.** Without Stripe, a campaign can track partners and leads but not sales.
6. **One link carries both ids** (GHL's `am_id`, plus our Partner ID and name). First-claim-wins keeps working, and the lead is filed under the right partner by custom mapping on the `am_id`, whether or not GHL's own tracking picks it up.
7. **Only first claims are filed in the Affiliate Manager.** A disputed lead goes under nobody until a person decides.
8. **Deals are named by the contact's email.** Instantly often sends no names, and Find opportunity matches on the deal's name.
9. <!-- FILL: any client-specific choice, with its reason, or delete this line -->

## Known limits

- **`Reward Amount` is typed by hand each month.** Without Stripe, GHL has no payment to compute it from. <!-- FILL: fee variant: replace with "**`Reward Amount` is written by workflow 6 as the fixed fee** (not yet proven; if the row did not take, staff type it from the approval task)." -->
- **No commissions in the partner portal.** Partners see their leads, not their earnings, until the client connects Stripe and a sales campaign is added.
- **The forms use GHL's own link** until the client's domain is connected, and the Become a Partner page waits for it.
- **A space in a partner's last name** breaks the name part of their link in some email apps. The credit still works, because it keys on the Partner ID.
- **A partner who registers the same client twice** is flagged as a conflict too. The review takes seconds.
- **Attribution Review replaces the deal's stage.** The review task says to move the deal back; its history shows the old stage.
- **Staff-logged introductions** are filed in the Affiliate Manager only when staff type the partner's Referral Code into the Staff Attribution form.
- **GHL's invite email is its standard one.** A branded welcome email is drafted in `partner-emails-DRAFT.md`, not wired.
- **The Instantly webhook trigger is a premium trigger:** a small charge per run.
- <!-- FILL: any client-specific limit, or delete this line -->

## Open items

| Item | Owner | Since | Notes |
|---|---|---|---|
| <!-- FILL: one row per open item. The usual ones: connect the domain, then publish the Become a Partner page and move the forms onto it; Instantly on Hyper Growth; A2P before any SMS; Stripe (optional); the placeholder swap; the one real form fill; the referral-fee confirmation for each partner type still open (blocks recruiting that type); the partner agreement, if the client has none --> | | | |

## Test records to delete

| Email | Contact id | Deals | Deleted on |
|---|---|---|---|
| <!-- FILL: one row per test contact from step 8.11 --> | | | |

- **Test affiliates to remove from the Affiliate Manager:** Test Partner D, Test Partner E.
- **Go-ahead:** <!-- FILL: the operator's words and the date -->
- **Backup:** <!-- FILL: the backup file's name -->
- **Kept on purpose:** the contact GHL made for the alert address (source "notification").

## Handover (step 9)

- **Flowcharts PDF:** <!-- FILL: its path -->
- **Walkthrough video:** <!-- FILL: the link; the date the operator sent it -->
- **Staff shown the two routines:** <!-- FILL: name, date -->
- **Placeholder swap:** <!-- FILL: the date and the new versions, or "waits on the client's GHL user" -->
- **Calendar rules set:** <!-- FILL: the date, or "open item" -->
- **Filed in:** <!-- FILL: where the operator filed this record and the PDF -->
