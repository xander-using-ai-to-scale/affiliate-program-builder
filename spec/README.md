# spec/: what gets built, exactly

This folder is the exact content of the standard affiliate program: every field, form field, workflow step, setting and text. It was recovered from the first build (an SEO agency's partner program, Sep 21–22 2026) from the build log, GHL's API and the build's screenshots.

[process/](../process/README.md) says **how** to build: where to click, what to check. This folder says **what** to build. Build exactly what it says. If a value is missing or unclear, stop and ask the operator; never improvise a setting.

**What does not belong here:** click-by-click steps (`process/`), scripts (`tools/`), blank client files (`templates/`), and anything about a real client (`clients/<CLIENT_SLUG>/`, never committed).

## The files

| File | What it holds | Used in |
|---|---|---|
| [structure.json](structure.json) | 29 contact fields and 7 deal fields (names, types, options in order), 24 tags, 3 pipelines (stages in order), the Partner Intro Call calendar, and the names of the forms and workflows. The scripts in `tools/ghl/` read it | [3-structure](../process/3-structure.md) |
| [forms.md](forms.md) | The 3 forms, field by field, with their settings and share links | [4-forms](../process/4-forms.md) |
| [workflows/README.md](workflows/README.md) | The 8 workflows: build order, how they connect, the settings every workflow uses | [5-workflows](../process/5-workflows.md) |
| [workflows/1-instantly-interested-reply.md](workflows/1-instantly-interested-reply.md) … [workflows/8-commission-3-paid-monthly.md](workflows/8-commission-3-paid-monthly.md) | One file per workflow: trigger, every step and setting, test, client-specific values | [5-workflows](../process/5-workflows.md), [6-affiliate-manager](../process/6-affiliate-manager.md) |
| [workflows/8b-commission-3-paid-once.md](workflows/8b-commission-3-paid-once.md) | Workflow 8 for the "one fee per closed deal" variant: `Referral Engine - Commission 3: Paid`, built instead of the monthly one | [5-workflows](../process/5-workflows.md), section 5.10 |
| [affiliate-manager.md](affiliate-manager.md) | The Affiliate Manager campaign, the affiliate profile, its merge fields, what it cannot do without Stripe, and the Become a Partner page | [6-affiliate-manager](../process/6-affiliate-manager.md) |
| [variants.md](variants.md) | What changes per commission model: monthly percentage (the default), one fee per closed deal, pay per lead. Also the client differences that combine with any model: homeowner clients, phone-only referrals, one payout method, a monthly payout run | [1-blueprint](../process/1-blueprint.md), [3-structure](../process/3-structure.md), [4-forms](../process/4-forms.md), [5-workflows](../process/5-workflows.md) |

## The standard names

Every build uses these names exactly: same capitals, hyphens, colons and commas. The double-check (`tools/ghl/double-check.js`) finds each item by its name.

**3 pipelines**

| Pipeline | Stages, in order |
|---|---|
| `Partner Recruiting` | `New` → `Working` → `Engaged` → `Booked` → `Showed` → `Offer Made` |
| `Partner Lifecycle` | `Signed` → `Onboarding` → `Activated` → `Producing` → `Dormant` |
| `Referred Leads` | `Referral Received` → `Attempting Contact` → `Contacted / Nurture` → `Appointment Booked` → `Appointment Showed` → `Qualified / Consult Completed` → `Sold / Enrolled` → `Commission Pending` → `Commission Approved` → `Commission Paid` → `No Show / Unqualified` → `Lost / No Sale` → `Attribution Review` |

**3 forms**

| Form | Filled by | Starts workflow |
|---|---|---|
| `Refer a Client` | A partner, through their personal link | `Referral Engine - Referral Capture` |
| `Partner Sign-Up` | A new partner, on the Become a Partner page | `Referral Engine - Partner Sign-Up` |
| `Staff Attribution` | The client's staff (internal) | `Referral Engine - Staff Attribution` |

**8 workflows**

| # | Workflow | Spec |
|---|---|---|
| 1 | `Instantly - Interested Partner Reply` (only if the client runs cold email in Instantly) | [1-instantly-interested-reply.md](workflows/1-instantly-interested-reply.md) |
| 2 | `Referral Engine - Referral Capture` | [2-referral-capture.md](workflows/2-referral-capture.md) |
| 3 | `Referral Engine - Staff Attribution` | [3-staff-attribution.md](workflows/3-staff-attribution.md) |
| 4 | `Referral Engine - Partner Sign-Up` | [4-partner-sign-up.md](workflows/4-partner-sign-up.md) |
| 5 | `Referral Engine - Affiliate Link` | [5-affiliate-link.md](workflows/5-affiliate-link.md) |
| 6 | `Referral Engine - Commission 1: Sale` | [6-commission-1-sale.md](workflows/6-commission-1-sale.md) |
| 7 | `Referral Engine - Commission 2: Approved` | [7-commission-2-approved.md](workflows/7-commission-2-approved.md) |
| 8 | `Referral Engine - Commission 3: Paid, monthly repeat` | [8-commission-3-paid-monthly.md](workflows/8-commission-3-paid-monthly.md) |

**Also named:** the calendar `Partner Intro Call`; the Affiliate Manager campaign `<PROGRAM_NAME>`; the funnel `<PROGRAM_NAME>` with its step `Become a Partner` at `/become-a-partner`.

## How to read a workflow file

Each file in `workflows/` has the same parts, in this order:

1. **The header block.** The workflow's exact GHL name, its purpose, its **Trigger** (the trigger type, the word to type in the trigger search box, the trigger's name, its exact filters), the **Settings** tab values, and what it depends on.
2. **Steps.** A table, one row per step, top to bottom on the canvas:
   - **#**: the step's place. `4a`, `4b` … are steps inside a branch.
   - **Action Name**: what you type in the step's **Action Name** box. The canvas shows it. GHL puts a number in front of task steps on the canvas ("#1 Referral follow-up"): that number is GHL's, not part of the name.
   - **Action type**: the action to pick, and the word to type in the **Actions** search box.
   - **Settings**: every field and its exact value. Anything not listed stays at GHL's default.
   - **Notes / traps**: what went wrong in the first build and how to avoid it.
3. **Branches.** An If / else or a Find opportunity splits the canvas. Each branch has its own table under a `### Branch: <name>` heading, in the order the branches show on the canvas.
4. **Test.** Which script proves the workflow (`tools/ghl/enroll.js`, `move-stage.js` or `fire-test.js`) and what `verify-test.js` must read back. [8-test](../process/8-test.md) runs them.
5. **Client-specific values.** The settings that change per client. Everything else is the same in every build.

### How values are written

- `{{contact.email}}` and other text in `{{…}}`: a merge field. It was typed exactly so in the first build, and GHL turned it into a chip. You may type it, or insert it from the tag icon's list.
- **"Picker: Right now . Date"** (a label, with no `{{…}}`): a merge field whose raw text was never seen. Insert it from the tag icon's list. The spec says which word to search for. Never type a guessed `{{…}}` for it.
- **Dropdown values** (such as `Referred Lead`, a stage, a user) are picked from the list, never typed.
- **Rich text** (a task description, a notification body): the exact HTML to type in the box's `</>` source view ([5-workflows](../process/5-workflows.md), section 5.3).
- `<PLACEHOLDER_USER>`: the operator's GHL user, until the client has one. `<RATE_PERCENT>`, `<PROGRAM_NAME>`, `<REFER_FORM_ID>` and the other placeholders are defined in [templates/README.md](../templates/README.md).
- **DRAFT**: text a partner or the client reads. It needs the approver's OK before it goes live ([process/README.md](../process/README.md), the approval gates).
- **Not yet proven: …** and **Confirm: …** mark what the first build did not settle. Check it while you build, and write what you find in the build record.
