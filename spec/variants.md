# Variants: what changes per commission model

The standard program pays partners a **monthly percentage**: that is what the first build built and tested. Two other models are described here for clients who pay differently. The blueprint's section 2 picks one ([1-blueprint](../process/1-blueprint.md)). Everything not listed under a variant stays exactly as the rest of `spec/` says.

| Variant | The partner is paid | `Reward Model` | Rate or fee | Built with a client? |
|---|---|---|---|---|
| [Monthly percentage](#monthly-percentage) (default) | A percentage of every monthly payment, for as long as the referred client pays | `Revenue Share` | `<RATE_PERCENT>` in `Revenue Share Percent` | **Yes**: the first build, Sep 21–22 2026 |
| [One fee per closed deal](#one-fee-per-closed-deal) | One fixed fee when a referred deal closes (for example one fee per funded loan) | `Per Sale` | `<FEE_AMOUNT>` | **Not yet built with a client** |
| [Pay per lead](#pay-per-lead) | One fixed fee for each referred lead that counts, whether or not it buys | `Per Lead` | `<FEE_AMOUNT>` | **Not yet built with a client** |

`Reward Model`'s options are fixed in [structure.json](structure.json): `Per Lead`, `Per Show`, `Per Qualified Consult`, `Per Sale`, `Revenue Share`, `Custom / Non-Cash`. Never invent a fourth variant: if the client's model fits none of the three, stop and ask the operator.

**How the rate or fee is written.**
- `<RATE_PERCENT>` is a plain number with no `%`: `15`. Texts add the `%` themselves (`<RATE_PERCENT>%` → `15%`).
- `<FEE_AMOUNT>` has two forms. In a **field** (`Reward Amount`, the campaign's per-lead amount) type the number only, with no currency sign: `250`. In any **text** (a task description, the blueprint, the flowcharts, an email, the walkthrough) write it with the currency sign and never a `%` after it: `$250`. So `(<FEE_AMOUNT> for each referred deal that closes)` becomes `($250 for each referred deal that closes)`.

**Other client differences** that are not a commission model (homeowner clients, phone-only referrals, one payout method, a monthly payout run) are at the end of this file: [Client differences](#client-differences-not-a-commission-model). They combine with any variant.

**How to change the structure for a variant.** Changes go in the client config's `structure` block, never in `spec/structure.json` ([3-structure](../process/3-structure.md)):
- A pipeline with the same name and a new stage list replaces the standard one. A new pipeline name adds one; `"remove": { "pipelines": ["Referred Leads"] }` drops the standard one.
- A workflow the variant does not build goes in `"remove": { "workflows": [...] }`. A renamed workflow goes in `remove` under its standard name and in `"workflows": [...]` under its new name, so `double-check.js` looks for the right one.
- Renamed stages must be used everywhere the standard names appear: in workflows 2, 3, 6, 7 and 8, and in the flowcharts ([templates/flowcharts-data.js](../templates/flowcharts-data.js) lists the pages to change).

---

## Monthly percentage

**The default and the first build.** Built and tested end to end on Sep 21–22 2026.

| Piece | Setting |
|---|---|
| `Reward Model` | `Revenue Share` (workflow 4, step 1) |
| Rate | `Revenue Share Percent` = `<RATE_PERCENT>`, a plain number (workflow 4, step 1). The first build: `15` |
| Where the rate is written in words | The task descriptions of workflows 4 (`<RATE_PERCENT>% recurring for the life of each referred client`), 6, 7 and 8 (`<RATE_PERCENT>% of what the client paid this month`) |
| Workflow 4 | As [4-partner-sign-up](workflows/4-partner-sign-up.md) |
| Workflows 6, 7, 8 | As [6-commission-1-sale](workflows/6-commission-1-sale.md), [7-commission-2-approved](workflows/7-commission-2-approved.md), [8-commission-3-paid-monthly](workflows/8-commission-3-paid-monthly.md): sale → `Commission Pending` → `Commission Approved` → `Commission Paid` → 30 days → back to `Commission Pending`, until the deal leaves `Commission Paid` |
| Pipeline stages | The standard `Referred Leads` stages. The sale stage is `Sold / Enrolled` |
| Campaign, per lead | **Pay Per Lead**, **Default Commission Value (Per Lead)** off ([affiliate-manager.md](affiliate-manager.md)) |
| Tests | As [8-test](../process/8-test.md): test 5 proves the cycle, the loop (with the wait at 1 minute) and the stop |
| Staff routine each month | [9-handover](../process/9-handover.md), section 9.9 |

---

## One fee per closed deal

**Not yet built with a client.** Every change below is derived from the first build and the vault's lender example; none has run in GHL. Write each one into the blueprint's section 7 and get the operator's approval before building. Record in the build record what actually worked.

**When:** the client earns once per referred deal and pays the partner one fee for it (a lender paying a referral fee per funded loan, a one-off project).

| Piece | Change |
|---|---|
| `Reward Model` | `Per Sale` |
| Fee | `<FEE_AMOUNT>`: the number `250` in the `Reward Amount` field, `$250` in the task texts (see "How the rate or fee is written" above). No contact field holds it; it is written on each deal as `Reward Amount` (workflow 6) and in the task texts |
| Workflow 4, step 1 | 4 rows instead of 5: **Contact Role** = `Referral Partner` · **Partner ID** = `{{contact.id}}` · **Reward Model** = `Per Sale` · **Affiliate Link** as standard. No `Revenue Share Percent` row |
| Workflow 4, step 4 | In the description, replace `(<RATE_PERCENT>% recurring for the life of each referred client)` with `(<FEE_AMOUNT> for each referred deal that closes)` |
| Workflow 6, trigger | **Pipeline stage** = the client's sale stage: `Sold / Enrolled`, or the renamed stage (the lender example: `Funded`) |
| Workflow 6, step 1 | Add a row **Reward Amount** = `<FEE_AMOUNT>` as a typed number (`250`), as the **last** row, after `Sale Date`. Not yet proven: that Update opportunity writes a typed number into a monetary field. If it does not, drop the row and the approval task tells staff to type it |
| Workflow 6, step 3 and workflow 7, step 2: titles | **Unchanged**: `Approve partner commission: {{contact.email}}` and `Pay partner commission for {{contact.email}}`. Only the descriptions below change. The Action Names (`Approve commission task`, `Payout task`) are unchanged too |
| Workflow 6, step 3 description | `<p>This referred deal just closed, so a one-time partner fee is now pending.</p><p><strong>Partner:</strong> {{contact.referring_partner_name}} (ID {{contact.referring_partner_id}})</p><p><strong>Before approving:</strong> 1) Confirm the deal really closed and the client was paid. 2) Confirm the credit is settled (Attribution Confidence is not Conflicting). 3) Check Reward Amount on the deal is <FEE_AMOUNT>.</p><p><strong>Then:</strong> move the deal to Commission Approved. That creates the payout task.</p>` |
| Workflow 7, step 2 description | `<p>The partner fee for this deal is approved. Pay the partner now.</p><p><strong>Partner:</strong> {{contact.referring_partner_name}} (ID {{contact.referring_partner_id}})</p><p><strong>Amount:</strong> the Reward Amount on this deal (<FEE_AMOUNT>).</p><p><strong>How:</strong> open the partner's own contact (search their Partner ID) to see their payment preference: ACH, check, PayPal and so on.</p><p><strong>After paying:</strong> move the deal to Commission Paid. This closes the fee: nothing repeats.</p>` |
| Workflow 8 | **Renamed** `Referral Engine - Commission 3: Paid`, built from its own full spec: [8b-commission-3-paid-once.md](workflows/8b-commission-3-paid-once.md). One step only: `Record payment` (as standard step 1). **No** `Wait 30 days`, **no** `Still a paying client?`, no branches, no task. In the config ([3-structure](../process/3-structure.md), section 3.1, action 5): `"remove": { "workflows": ["Referral Engine - Commission 3: Paid, monthly repeat"] }` and `"workflows": ["Referral Engine - Commission 3: Paid"]` |
| Pipeline stages | The standard stages work as they are. A client may rename them in the config (see the lender example below). Workflows 2 and 3 need `Referral Received` and `Attribution Review` (or their renamed versions) |
| Campaign, per lead | Unchanged: **Pay Per Lead**, **Default Commission Value (Per Lead)** off |
| Campaign, payout terms | As the standard: map the client's payout timing with [affiliate-manager.md](affiliate-manager.md), section 2, "Payout Terms" |
| Flowcharts | In [templates/flowcharts-data.js](../templates/flowcharts-data.js): `VARIANT = 'fee'` and `RATE = '$250'` (the fee as text). Its "one fee per closed deal" notes list every page that changes |
| Handover files | Every `<!-- FILL: fee variant ... -->` marker in the build record, the partner emails and the walkthrough script, and the test-log line in [8-test](../process/8-test.md), section 8.11 |
| Person slots | 8 task steps to swap in step 9, not 9 (7 without Instantly): the renamed workflow 8 has no task ([9-handover](../process/9-handover.md), section 9.7) |
| Staff routine | Sale → approval task → pay → `Commission Paid`. Nothing repeats ([9-handover](../process/9-handover.md), section 9.9, the fee table) |

**Tests.** Test 4 ([8-test](../process/8-test.md), 8.6) expects `Reward Model` `Per Sale` and `Revenue Share Percent` empty. Test 5 (8.7) changes:
1. `move-stage.js ... <OPP_ID> "<the sale stage>"`, with no revenue argument (`Client Monthly Revenue` has no meaning for a fee). Expected: the deal at `Commission Pending` (or its renamed stage), `Commission Status` `Pending`, `Sale Date` today, `Reward Amount` `<FEE_AMOUNT>` (the number, if the row works), `Attribution Lock` `Locked`, the approval task.
2. Move to `Commission Approved`. Expected: `Approved`, the approval date, the payout task.
3. Move to `Commission Paid`. Expected: `Paid`, `Last Commission Payment Date` today. Wait 2 minutes: the deal stays at `Commission Paid`, and no new task appears.
4. There is no wait to shorten and no stop test. Skip 8.7 actions 5, 7, 8, 9 to 13. The same steps are in [8b-commission-3-paid-once.md](workflows/8b-commission-3-paid-once.md), "Test".

**A worked example: a lender** (from the vault's build playbook §11; proposed for a lender client, not built, not confirmed with them).
- The pipeline `Referred Loans` replaces `Referred Leads`: `Referral Received` → `Contacted` → `Quick App Sent` → `Quick App Completed` → `Term Sheet Issued` → `In Processing` → `Clear to Close` → `Funded` → `Referral Fee Pending` → `Referral Fee Approved` → `Referral Fee Paid`, plus `Declined / Withdrawn` and `Attribution Review`.
- Stage mapping in the workflows: `Sold / Enrolled` → `Funded` (workflow 6's trigger); `Commission Pending` → `Referral Fee Pending` (workflow 6, step 1); `Commission Approved` → `Referral Fee Approved` (workflow 7's trigger); `Commission Paid` → `Referral Fee Paid` (the renamed workflow 8's trigger); `Lost / No Sale` → `Declined / Withdrawn`. Workflows 2 and 3 use `Referred Loans`, `Referral Received` and `Attribution Review`.
- In the config: `"remove": { "pipelines": ["Referred Leads"] }` and a new pipeline `Referred Loans` with the stages above.
- Loan fields on the deal (proposed): Loan Type, Asset Class, Loan Amount, Funded Date, Referral Fee, Property State. Partner tiers: Tier 1 Referral Source, Tier 2 Broker. A "Refer a Deal" form with the loan fields, and a Broker Application form. Each is a change outside the standard: it needs its own spec, written and approved before the build.

---

## Pay per lead

**Not yet built with a client.** Every change below is derived, not run. The design is a proposal: the operator confirms it in the blueprint's section 7 before anything is built.

**When:** the client pays a fixed fee for each referred lead that counts (for example, each lead that is reachable and in the client's area), whether or not it buys.

**The design, and why.** The commission stages sit in the same `Referred Leads` pipeline as the sales stages. For a monthly percentage or a closed deal the sale is done when the commission starts, so the deal can move to `Commission Pending`. For a lead fee the sale is not done: moving the deal would take it off the sales track. So in this variant the lead fee is tracked on the deal's `Commission Status` field only, and the deal keeps moving through the sales stages. The Affiliate Manager's own per-lead commission is switched on, so partners can see what they earned in the portal.

| Piece | Change |
|---|---|
| `Reward Model` | `Per Lead` |
| Fee | `<FEE_AMOUNT>` per lead that counts |
| Campaign, per lead | **Pay Per Lead** (as standard), and **Default Commission Value (Per Lead)** **on**: type **Flat**, amount `<FEE_AMOUNT>`. Not yet proven: whether a lead filed by custom mapping (workflows 2 and 3, step 4b) earns this commission, whether it shows in the portal without Stripe, and whether a disputed lead that staff later file by hand earns it. Check all three in test 7 |
| Workflow 4, step 1 | 4 rows: **Contact Role** = `Referral Partner` · **Partner ID** = `{{contact.id}}` · **Reward Model** = `Per Lead` · **Affiliate Link** as standard. No `Revenue Share Percent` row |
| Workflow 4, step 4 | In the description, replace `(<RATE_PERCENT>% recurring for the life of each referred client)` with `(<FEE_AMOUNT> for each referred lead that counts)` |
| Workflow 6, trigger | **Pipeline stage** = the stage at which a lead counts, named in the blueprint's section 2. Confirm: the default proposal is `Contacted / Nurture` (staff reached the lead). Do not use `Referral Received`: workflow 2 creates the deal there, and a created deal may not count as a stage change (not proven) |
| Workflow 6, name | Keep `Referral Engine - Commission 1: Sale`, or rename it `Referral Engine - Commission 1: Lead` with the config's `remove` + `workflows` (the operator decides) |
| Workflow 6, step 1 | **Update opportunity** with **no Pipeline and no Pipeline Stage rows**: **Commission Status** = `Pending` · **Reward Amount** = `<FEE_AMOUNT>` (not yet proven, as in the fee variant). No Sale Date row. The deal stays where staff put it |
| Workflow 6, step 2 | `Lock attribution` stays |
| Workflow 6, step 3 description | `<p>This referred lead counts, so a partner lead fee is now pending.</p><p><strong>Partner:</strong> {{contact.referring_partner_name}} (ID {{contact.referring_partner_id}})</p><p><strong>Before approving:</strong> 1) Confirm the lead is real and meets the program's terms. 2) Confirm the credit is settled (Attribution Confidence is not Conflicting). 3) Check Reward Amount on the deal is <FEE_AMOUNT>.</p><p><strong>Then:</strong> set Commission Status on the deal to Approved, pay the partner the way their contact says, and set Commission Status to Paid. Do not move the deal: it stays in the sales stages.</p>` |
| Workflows 7 and 8 | **Not built**: they trigger on the stages `Commission Approved` and `Commission Paid`, which a lead fee does not use. In the config: `"remove": { "workflows": ["Referral Engine - Commission 2: Approved", "Referral Engine - Commission 3: Paid, monthly repeat"] }`. Staff set `Commission Status` by hand, as the task says |
| Pipeline stages | Standard. `Commission Pending`, `Commission Approved` and `Commission Paid` go unused; they may be removed by replacing the pipeline in the config (the operator decides) |
| Flowcharts | The "pay per lead" notes at the top of [templates/flowcharts-data.js](../templates/flowcharts-data.js), which follow this design: delete the pages of workflows 7 and 8, the loop on the pipeline page, and the overview's commission boxes after workflow 6 |
| Staff routine | Each lead that counts: drag the deal to the counting stage → the approval task → set `Approved` → pay → set `Paid`. A deal dragged back to the counting stage runs workflow 6 again (re-entry is on) and resets `Commission Status` to `Pending`: staff check the field before paying twice |

**Tests.**
1. Test 5 ([8-test](../process/8-test.md), 8.7) becomes one move: `move-stage.js ... <OPP_ID> "<the counting stage>"`. Expected: the deal **stays** at that stage; `Commission Status` `Pending`; `Reward Amount` `<FEE_AMOUNT>` (if the row works); `Attribution Lock` `Locked`; the approval task. Skip the rest of 8.7.
2. Test 7 (8.9): also open partner E's profile in the Affiliate Manager. Expected, not yet proven: the lead shows with a commission of `<FEE_AMOUNT>` under **Commissions**. Record what GHL shows.

---

## Client differences (not a commission model)

These are not variants: they combine with any of the three. Each is a change to the standard build, so it follows the same rules: the brief gives the reason, the blueprint records the change (the section named in each table), and the operator approves it before anything is built. **None has been built with a client yet.** Where the first build never touched a screen, the change says "Confirm:": check it while you build and write what you find in the build record.

Keep the standard names of pipelines and stages unless the client asks for a rename: a renamed stage must be changed in workflows 2, 3, 6, 7 and 8 and in the flowcharts.

### Homeowner clients

**When:** the brief's field 2 says the client's own clients are households (homeowners, patients, consumers), not businesses. A household has no business name, and a trade client usually needs the property's address.

| Piece | Change | Blueprint section |
|---|---|---|
| `Refer a Client`, row 5 | Replace `Client's business name` (Organization) with the standard **Address** element: Quick Add → **Address**, dragged below Email. Label `Property address` (DRAFT) · Placeholder `e.g. 12 Oak Street` (DRAFT) · Maps to: Standard: street address · Query key: GHL's default for the element, left as it is · Required No · Hidden No · Width 100%. Confirm: the element's name in Quick Add and its query key (expected `address`); the first build never added it. If the client needs the city and ZIP code too, add Quick Add → **City** and **Postal Code** below it, with the same settings and the labels `City` and `ZIP code` | 6 |
| `Staff Attribution`, row 5 | The same change | 6 |
| Workflows 2 and 3, step 4d description | Replace `{{contact.company_name}}` with `{{contact.address1}}`, so the third paragraph reads `<p>Client: {{contact.name}} - {{contact.address1}} - {{contact.phone}}</p>`. Confirm: the merge field. If typing it does not turn it into a chip, insert the street address from the tag icon's list (search `address`) | 7 |
| `Partner Sign-Up` | Unchanged: partners are businesses. Only its placeholders are the client's own (blueprint section 6) | 6 |
| Tests | Tests 1 to 3 and 7 are unchanged: `enroll.js` writes a company name, and no expected result reads it. Test 8 (the real form fill) proves the address row: the operator also types `12 Test Street`, and `verify-test.js` must show it as the contact's address | – |

### Phone-only referrals

**When:** the brief says partners often have only the client's phone number, not their email (for example a home inspector passing on a homeowner).

**Why deals change name.** Deals are named by the contact's email, because **Find opportunity** matches on the deal's name. A contact with no email would get a deal with an empty name, and a later claim could not find it. In this change the phone is required and names the deal instead.

| Piece | Change | Blueprint section |
|---|---|---|
| `Refer a Client` and `Staff Attribution`, rows 3 and 4 | Row 3 `Phone`: Required **Yes**. Row 4 `Email`: Required **No** | 6 |
| Workflows 2 and 3, step 4c | **Opportunity Name** = `{{contact.phone}}` | 7 |
| Workflows 2 and 3, step 5d | Filter **Opportunity Name** **Is** `{{contact.phone}}` | 7 |
| Task titles in workflows 2 and 3 (steps 4d, 5c) and 6, 7, 8 | Replace `{{contact.email}}` with `{{contact.name}} {{contact.phone}}`, for example `Contact referred lead {{contact.name}} {{contact.phone}} from partner {{contact.claimed_partner_name}}` | 7 |
| Workflows 1 and 4 | Unchanged: Instantly leads and new partners always have an email | – |
| Tests | Every expected deal name and task title that shows a test email shows the contact's name and phone instead. The claim scenarios carry fictional phones (`enroll.js`), so the deals get a name. Not yet proven: that GHL prints the phone the same way in the deal's name and in Find opportunity's filter. Both use the same merge field, so they should match: test 2 proves it (one deal, moved to `Attribution Review`) | – |

### One payout method

**When:** the brief's field 6 names a single way partners are paid (for example check only).

- **Default: keep the standard `Payment Preference` options.** The dropdown then records how a partner would like to be paid, and the payout task tells staff to open the partner's contact before paying. Nothing else changes.
- **Only if the operator asks** (blueprint section 5): narrow the field in the config's `structure`. Repeat the whole field with its new options, in the standard spelling, `Other` last: `{ "name": "Payment Preference", "dataType": "SINGLE_OPTIONS", "options": ["Check", "Other"] }`. The sign-up form's dropdown follows the field. `enroll.js` tests with the field's first option, so tests 4 and 6 still run.

### A monthly payout run

**When:** the brief's field 6 says the client pays partners once a month, on one day (a check run), not as each commission is approved.

GHL's task due date counts days from when the task is made. It cannot land on a fixed day of the month. So the payout task keeps its standard due date and says when to pay.

| Piece | Change | Blueprint section |
|---|---|---|
| Workflow 7, step 2 description (any variant) | Add one paragraph right before `<p><strong>After paying:</strong>`: `<p><strong>When:</strong> partners are paid once a month, on <PAYOUT_DAY>. Add this payment to that run. This task stays open until then, so an overdue date here is expected.</p>`. `<PAYOUT_DAY>` is the day in the client's words, for example `the 15th` | 7 |
| Task due dates | Unchanged: `1` `Days`, no time, skip weekends | – |
| The campaign's Payout Terms | Mapped from the payout day: [affiliate-manager.md](affiliate-manager.md), section 2, "Payout Terms" | 2, 8 |
| Staff routine | On the payout day, staff pay every open payout task, then drag each deal to `Commission Paid` ([9-handover](../process/9-handover.md), section 9.9). For the monthly percentage, the 30-day wait then starts on the payout day, so the next month's approval task comes about a month later | – |
