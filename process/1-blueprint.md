# Step 1 · Blueprint

Turn the brief into the program blueprint: the commission variant, the rate, the partner types, what changes from the standard build, and what the client must provide. Present it to the operator and get an explicit approval. **Nothing is built in GHL before that approval.**

| | |
|---|---|
| **Owner** | The AI session drafts. The operator approves |
| **Time** | Not timed in the first build. Estimate: 15–30 minutes, plus the approval |
| **Needs** | `clients/<CLIENT_SLUG>/brief.md` with every blocking field `confirmed` |
| **Makes** | `clients/<CLIENT_SLUG>/blueprint.md`, approved in writing |
| **Done when** | The operator's approval (their name, the date and their words) is in the blueprint and in the build record |

The standard program is fixed. The blueprint only records the client's values and any change the brief asks for. For what every build contains, read [spec/README.md](../spec/README.md) before you start.

## 1.1 · Choose the commission variant

1. Read the brief's field 5 (commission model and rate), then [spec/variants.md](../spec/variants.md) in full.
   **Check:** you can say in one line how this client pays partners.
2. Pick the variant with these rules:
   - The client pays partners every month, for as long as a referred client pays the client: **monthly percentage**. This is the default and the first build's model.
   - The client pays one fee when a referred deal closes (for example one fee per funded loan): **one fee per closed deal**.
   - The client pays for each referred lead, whether or not it buys: **pay per lead**.

   **Check:** the variant matches the brief's field 5 word for word. If the client's model fits none of the three, stop and ask the operator. Never invent a fourth variant.
3. In the blueprint's section 2, write the variant, the rate or fee exactly as the client states it (`<RATE_PERCENT>` or `<FEE_AMOUNT>`), and the `Reward Model` value that [spec/variants.md](../spec/variants.md) gives for the variant.
   **Check:** the rate or fee is a number with its unit ("15% of each monthly payment", "$500 per funded loan"). A fee is written with its currency sign in text (`$500`) and as a plain number in fields (`500`), as [spec/variants.md](../spec/variants.md) ("How the rate or fee is written") says. No example earnings, no income claims.
4. List every change the variant makes to the standard build, as [spec/variants.md](../spec/variants.md) states it (which workflows change, and how). Write them into the blueprint's section 7.
   **Check:** for monthly percentage, the list says "none". For any other variant, each change names a workflow and points to the spec section.

## 1.2 · Fill the rest of the blueprint

1. Section 1: the program in one paragraph. Say who the partners are, what they do, what they are credited for, and how they are paid.
   **Check:** it states program terms only. No earnings examples, no income claims, no medical claims, never "franchise".
2. Section 3: the partner options. Write the `Partner Type` options from the brief's field 3, in the client's words, with `Other` last. Write the `Partner Tier` and `Partnership Type` options (the brief's field 4). The standard `Partnership Type` options are `Referral` and `White Label`. `White Label` means a partner resells the client's service under the partner's own brand: if the brief's field 2 shows the client's work cannot be resold that way (most trades, clinics and local services), write `Referral` only, as a change in section 5 with that reason.
   **Check:** every partner type in the brief appears once. `Other` is the last option. `White Label` is kept, or its removal is in section 5 with a reason from the brief.
3. Section 3: the `segment/` tags. Write one tag for each partner group the client will target in outreach, in lowercase with dashes, plus `segment/other`. The first build had 19 partner types and 8 segment tags.
   **Check:** every tag starts with `segment/`, uses only lowercase letters, digits and dashes, and `segment/other` is included.
4. Section 3: the `Lost Reason` options. Keep the standard options from [spec/structure.json](../spec/structure.json). Add one industry-specific reason if the brief gives one (the first build added "Already has an SEO partner").
   **Check:** the standard options are all there.
5. Sections 4 to 6: pipelines, fields and tags, forms. Write "standard" for each, then list each change, with its reason. A change may come from:
   - a line in the brief;
   - the variant (section 2), exactly as [spec/variants.md](../spec/variants.md) states it;
   - a client difference in [spec/variants.md](../spec/variants.md), "Client differences": homeowner clients, phone-only referrals, one payout method, a monthly payout run. Use the exact change it gives, and name the brief's field that calls for it.

   Also in section 6, always: the **form placeholders (DRAFT)**, written for this client's own clients (the first build's `e.g. Smith Dental` is for an SEO agency's clients). DRAFT copy is the client's wording, not a change: it needs no reason, only the approver's OK in step 9.

   Two defaults to keep unless the brief or the operator asks otherwise: the standard `Payment Preference` options (one payout method does not narrow them: see "One payout method"), and the standard pipeline and stage names (a rename touches workflows 2, 3, 6, 7 and 8 and the flowcharts).
   **Check:** every change traces to the brief, the variant or a client difference, with the exact settings `spec/` gives. A change with no reason is removed. Section 6 lists the form placeholders.
6. Section 7: workflows. Mark workflow 1 (Instantly) `yes` only if the brief's field 10 says the client runs cold email in Instantly. The other seven are always built. For the "one fee per closed deal" variant, row 8 is the renamed `Referral Engine - Commission 3: Paid` ([spec/workflows/8b-commission-3-paid-once.md](../spec/workflows/8b-commission-3-paid-once.md)); for "pay per lead", rows 7 and 8 read `no` ([spec/variants.md](../spec/variants.md)). Write each workflow's changes (the variant's and any client difference's) in its row.
   **Check:** the table has 8 rows, workflow 1 is `yes` or `no`, and every change from section 2 and section 5's list is in the row of the workflow it touches.
7. Sections 8 and 9: the Affiliate Manager and the Become a Partner page. Keep the standard settings from [spec/affiliate-manager.md](../spec/affiliate-manager.md). Map the payout terms from the brief's field 6 with its rule (section 2, "Payout Terms"). Write the page's headline and copy line for this client, marked **DRAFT**.
   **Check:** the payout terms match section 2 and follow the mapping rule. The page copy is marked DRAFT and makes no earnings promise.
8. Section 10: the calendar. Write the slug `<CLIENT_SLUG>-partner-intro-call` and a one-line description. Keep the standard length and days unless the brief says otherwise. Hours, owner and video link stay placeholders.
   **Check:** the slug uses only lowercase letters, digits and dashes.
9. Section 11: people. `<PLACEHOLDER_USER>` holds every task, alert and the calendar until the client has a GHL user. Name the client's staff who will take over (the brief's field 7).
   **Check:** the placeholder user is named.
10. Sections 12 and 13: what is not in this build, and what the client must provide. Keep the standard lists and add the client's own items from the brief. In section 13, fill the **referral-fee** row with every partner type whose referral-fee answer (brief field 14) is not yet a written yes, and the **partner agreement** row from the brief's field 16.
    **Check:** every "can wait" gap from step 0 appears in section 13 or 14. Every "blocks launch" gap is in section 13's referral-fee row.
11. Section 14: open questions. List anything still unanswered that does not block the build.
    **Check:** each question names who answers it (the operator or the client).
12. Reread the whole blueprint.
    **Check:** no `<!-- FILL` marker is left, except the approval lines in section 15.

## 1.3 · Ask for the approval

1. Send the operator one message they can read in two minutes, in this layout (fill every `<...>`):

   ```
   Step 1 · Blueprint · waiting for your approval

   <PROGRAM_NAME>: <one sentence: who the partners are and what they are credited for>

   - Commission: <variant>, <rate or fee>, paid <when and how>. Tracked in the Referred Leads pipeline; <who> pays partners.
   - Partners: <N> partner types (<three examples>, ... Other). Tiers: <...>. Segment tags: <...>.
   - Standard build: 3 pipelines, 29 contact and 7 deal fields, 24 tags, 3 forms, <8 or 7> workflows, the Affiliate Manager campaign and the Become a Partner page. Changes: <none, or a short list>.
   - Cold email intake: <Instantly, "Interested" leads only | none>.
   - People: every task, alert and the calendar go to <PLACEHOLDER_USER> until <CLIENT_NAME> has a GHL user.
   - Not in this build: <short list>.
   - We need from the client: <access, domain, Instantly plan, A2P, calendar rules, the partner agreement>.
   - Before launch: written confirmation that <partner types still open> may legally receive a referral fee (or "all confirmed").

   The full blueprint: clients/<CLIENT_SLUG>/blueprint.md
   Reply "approve", or send changes (for example "Partners: add a Tier 4").
   ```

   **Check:** the message is sent, and every line matches the blueprint file.
2. If the operator sends changes, update the blueprint and send the message again.
   **Check:** each requested change is in the file. Two rounds of changes are normal.
3. Wait for an explicit approval: "approve", "approved", "go" or "yes", clearly about this blueprint. "Looks good, but..." is not an approval. Silence is not an approval.
   **Check:** you have the operator's words.

## 1.4 · Record the approval

1. Fill section 15 of the blueprint: the operator's name, the date, and their words in quotes.
   **Check:** section 15 has no `<!-- FILL` marker left.
2. Add a log line to the build record: `YYYY-MM-DD HH:MM · Step 1 done · blueprint approved by <name>: "<their words>"`.
   **Check:** the line is in the log.
3. Send the operator one line: `Step 1 done · blueprint approved · step 2: access`.
   **Check:** the message is sent.

## If a step fails

- **The client's commission model fits no variant.** Stop. Describe the model to the operator in two lines and ask how to proceed. Do not build a new variant; a new variant is a change to this repo (see `CHANGELOG.md`).
- **The operator asks for something outside the standard program** (an extra pipeline, a partner email wired in, SMS). First look in [spec/variants.md](../spec/variants.md), "Client differences": if it is there, use its exact change. Otherwise write it in the blueprint as a change, with the operator's words as its reason. If [spec/](../spec/README.md) has no settings for it, it cannot be built one-to-one: tell the operator, and list it under "Not in this build" unless they decide otherwise.
- **The operator changes a blocking answer from the brief.** Update the brief first (field, source `operator answer, YYYY-MM-DD`, `confirmed`), then the blueprint.
- **Anything else.** Retry the action once. If it fails again, tell the operator: `Blocked at step 1.<N>: <what happened>. Need from you: <one thing>.` Then wait.
