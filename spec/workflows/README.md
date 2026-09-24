# Workflows: the 8 workflows

One file per workflow. Build them in GHL's workflow builder (**Automation → Workflows**), in the order below. How to click through the builder: [5-workflows](../../process/5-workflows.md) (workflows 1–4 and 6–8) and [6-affiliate-manager](../../process/6-affiliate-manager.md) (workflow 5 and the Affiliate Manager steps). How to read each file: [spec/README.md](../README.md#how-to-read-a-workflow-file).

GHL's API lists workflows but cannot read or write their steps. Every setting here comes from the first build's log and screenshots, checked against what the workflows wrote on the test contacts.

**What does not belong here:** the forms ([forms.md](../forms.md)), the fields ([structure.json](../structure.json)), and the Affiliate Manager campaign ([affiliate-manager.md](../affiliate-manager.md)).

## The 8 workflows, in build order

| Build order | # | Workflow (exact GHL name) | Trigger | Built in | Spec |
|---|---|---|---|---|---|
| 1 | 1 | `Instantly - Interested Partner Reply` | Inbound webhook | Step 5.4. Only if the client runs cold email in Instantly | [1-instantly-interested-reply.md](1-instantly-interested-reply.md) |
| 2 | 2 | `Referral Engine - Referral Capture` | Form submitted: `Refer a Client` | Step 5.5; one step added in 6.6 | [2-referral-capture.md](2-referral-capture.md) |
| 3 | 3 | `Referral Engine - Staff Attribution` | Form submitted: `Staff Attribution` | Step 5.6 (a copy of workflow 2); one step added in 6.6 | [3-staff-attribution.md](3-staff-attribution.md) |
| 4 | 4 | `Referral Engine - Partner Sign-Up` | Form submitted: `Partner Sign-Up` | Step 5.7; two steps added in 6.3 | [4-partner-sign-up.md](4-partner-sign-up.md) |
| 5 | 6 | `Referral Engine - Commission 1: Sale` | Pipeline stage changed: `Referred Leads` → `Sold / Enrolled` | Step 5.8 | [6-commission-1-sale.md](6-commission-1-sale.md) |
| 6 | 7 | `Referral Engine - Commission 2: Approved` | Pipeline stage changed: `Referred Leads` → `Commission Approved` | Step 5.9 | [7-commission-2-approved.md](7-commission-2-approved.md) |
| 7 | 8 | `Referral Engine - Commission 3: Paid, monthly repeat` | Pipeline stage changed: `Referred Leads` → `Commission Paid` | Step 5.10 | [8-commission-3-paid-monthly.md](8-commission-3-paid-monthly.md) |
| 8 | 5 | `Referral Engine - Affiliate Link` | Affiliate enrolled in campaign: `<PROGRAM_NAME>` | Step 6.4, after the campaign exists | [5-affiliate-link.md](5-affiliate-link.md) |

**Variant file.** [8b-commission-3-paid-once.md](8b-commission-3-paid-once.md) is workflow 8 for the "one fee per closed deal" variant only: `Referral Engine - Commission 3: Paid`, one step, no wait, no loop. It is built **instead of** workflow 8, never with it ([variants.md](../variants.md)).

Workflow 5 is built last because its trigger needs the Affiliate Manager campaign. It must be published **before** any real partner signs up: a partner added to the campaign before workflow 5 exists keeps the first link, which has no `am_id` (this happened to a test partner in the first build).

**Three steps wait for step 6**, because they need the campaign: `File the lead under its partner` in workflows 2 and 3, and `Add to affiliate manager` and `Add to affiliate campaign` in workflow 4. Each file marks them.

## How they connect

| Trigger | Workflow | Effect | Which starts |
|---|---|---|---|
| Someone marks a lead **Interested** in Instantly | 1 | Contact, tags, a deal at `Partner Recruiting` → `Engaged`, a note, an alert and a reply task | Nothing. Staff work the partner by hand; when they sign, they fill in the sign-up form |
| A partner submits `Refer a Client` | 2 | **First claim:** the credit fields, a deal at `Referred Leads` → `Referral Received`, a follow-up task, and the lead filed under its partner in the Affiliate Manager. **Later claim:** conflict tag, `Conflicting`, the deal moved to `Attribution Review`, a review task | Nothing |
| Staff submit `Staff Attribution` | 3 | The same as workflow 2, with the method `Staff Entered` | Nothing |
| A new partner submits `Partner Sign-Up` | 4 | Partner role, Partner ID, rate, a first link, tags, a deal at `Partner Lifecycle` → `Onboarding`, an onboarding task. Adds the partner to the Affiliate Manager and the campaign | Workflow 5 (joining the campaign). GHL also sends its affiliate invite email |
| The partner joins the campaign `<PROGRAM_NAME>` | 5 | Overwrites `Affiliate Link` with GHL's link plus our ids, and writes the Referral ID into `Referral Code` | Nothing |
| Staff drag a `Referred Leads` deal to `Sold / Enrolled` | 6 | `Sale Date`, `Commission Status` = `Pending`, the deal moved on to `Commission Pending`, the credit locked, an approval task | Nothing: no workflow triggers on `Commission Pending` |
| Staff drag the deal to `Commission Approved` | 7 | `Commission Status` = `Approved`, `Commission Approval Date`, a payout task | Nothing |
| Staff drag the deal to `Commission Paid` | 8 | `Commission Status` = `Paid`, `Last Commission Payment Date`; waits 30 days; if still at `Commission Paid`: back to `Commission Pending`, `Pending`, next month's approval task. If the deal left `Commission Paid` (for example to `Lost / No Sale`): stops | The next month's cycle, when staff drag the deal to `Commission Approved` again |

Not yet proven: whether a stage set by a workflow (workflow 6 → `Commission Pending`, workflow 8 → `Commission Pending`) starts other stage-triggered workflows. None of the 8 triggers on `Commission Pending`, so it does not matter for the standard build.

The data each workflow writes, in one table:

| Field or object | Written by | Value |
|---|---|---|
| `Claimed Partner ID`, `Claimed Partner Name`, `Claimed Referral Code`, `Claim Notes` | The forms `Refer a Client` and `Staff Attribution` | From the link's query keys, or typed by staff |
| `Referring Partner ID`, `Referring Partner Name`, `Referral Code`, `Referral Evidence`, `Referral Source Type`, `Referral Attribution Method`, `Attribution Confidence`, `Referral Date` | Workflows 2 and 3, first claim | The claim, copied; `Partner`; `Partner Submission` or `Staff Entered`; `Claimed`; the current date |
| `Attribution Confidence` = `Conflicting`, tag `referral-attribution-conflict` | Workflows 2 and 3, later claim | |
| `Contact Role` | Workflows 2 and 3 (`Referred Lead`), workflow 4 (`Referral Partner`) | |
| `Partner ID`, `Reward Model`, `Revenue Share Percent`, `Affiliate Link` (first) | Workflow 4 | `{{contact.id}}`, `Revenue Share`, `<RATE_PERCENT>`, the form link with our ids |
| `Affiliate Link` (final), `Referral Code` on a partner | Workflow 5 | GHL's affiliate link plus our ids; the Referral ID |
| A lead under its partner in the Affiliate Manager | Workflows 2 and 3, first claim | Custom mapping on the lead's `Referral Code` |
| Deals, named `{{contact.email}}` | Workflow 1 (`Partner Recruiting`), 2 and 3 (`Referred Leads`), 4 (`Partner Lifecycle`) | |
| `Commission Status`, `Sale Date`, `Commission Approval Date`, `Last Commission Payment Date`, stage moves | Workflows 6, 7, 8 | |
| `Attribution Lock` = `Locked` | Workflow 6 | |
| `Client Monthly Revenue`, `Reward Amount` | Staff, by hand on the deal | The approval task says how |

Built but written by no workflow: `Partner Tier`, `Lost Reason`, `Agreement Signed Date` (staff, at onboarding), `Referrals Sent`, `Last Referral Date`, `Commission Payments Made`. The commission tags (`commission-pending` and so on) are deliberately not used: the cycle's state lives on the deal.

## Settings every workflow uses

Open the builder's **Settings** tab after the steps are built ([5-workflows](../../process/5-workflows.md), section 5.2, action 14).

| Setting (Settings tab → Contact) | Value |
|---|---|
| **Allow re-entry** | **On** |
| **Allow multiple opportunities** | **On** |
| **Stop on response** | **Off** |
| Everything else, including the **Communication** section | GHL's default. Do not change it |

These are GHL's defaults: nobody toggled them in the first build. They were seen on workflows 1, 2 and 7 (screenshots). For workflows 3, 4, 5, 6 and 8 they were not looked at; they are the defaults or copied by duplication (confidence: high). Check them on every workflow anyway. **Allow re-entry must be on for workflows 7 and 8**: the monthly cycle runs them once a month for the same contact.

Not yet proven: the **Communication** section of the Settings tab was never opened in the first build (confidence that it holds GHL's defaults: medium). Leave it as GHL shows it.

## Rules for every workflow

- **The builder.** Automation → Workflows → **+ Create workflow** → **Start from Scratch**. A new workflow is named like `New Workflow : 1790006655225`: rename it with the pencil in the header. On the very first workflow, GHL may show "Introducing auto save in workflow builder": click **Enable auto save now**. Auto save works only on drafts. Once a workflow is published, every edit needs the header **Save**.
- **Publishing.** The **Draft / Publish** toggle in the header, then the header **Save** after any later edit. `double-check.js` shows the status and version.
- **Person slots.** Every task's **Assign to** and every notification's recipient is `<PLACEHOLDER_USER>`, picked from the user list. Step 9 swaps them for `<CLIENT_USER>`.
- **Tasks.** Every **Add task** step in this build has: **Due date** `1` **Days**, no time ("Select time" left empty), **Skip weekends** **On** ("If a due date falls on a weekend, it moves to the next weekday"). The task comes out due the next day at 00:00 in the account's time zone. GHL counts the due date in days from when the task is made: it cannot land on a fixed day of the month. A client who pays partners in one monthly run keeps this due date, and the payout task says when to pay ([variants.md](../variants.md), "A monthly payout run"). The description is typed as HTML in the `</>` source view. GHL stores it with its own styles on each `<p>` and turns each `{{…}}` into a chip; that is expected.
- **Create opportunity** shows "Duplicate opportunity: **Disabled**". Leave it so. With a deal already in the same pipeline, the step then silently does nothing, which keeps one deal per contact. It never updates an existing deal: to move a deal, use **Find opportunity** then **Update opportunity**.
- **Update opportunity** has the toggle **ALLOW OPPORTUNITY TO MOVE TO ANY PREVIOUS STAGE IN PIPELINE**: off unless the file says on. In a form-triggered workflow it acts on the deal the **Find opportunity** above it found; in a stage-triggered workflow it acts on the deal that started the workflow.
- **Dates.** A contact date field in **Update contact field** is set with its dropdown option **Current date**. A deal date field in **Update opportunity** is set with the dynamic value **Right now . Date**: the ⋮ next to the value → **Dynamic** → the tag icon → **Right now** → **Date** (picker label; its raw text was never seen).
- **No emails or texts to partners or clients** in any workflow. Their copy needs approval first (`templates/partner-emails-DRAFT.md`).
- **Deals are named `{{contact.email}}`.** Instantly often sends no names, and **Find opportunity** matches on the deal's name.
