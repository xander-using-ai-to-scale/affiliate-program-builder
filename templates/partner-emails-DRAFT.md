# Partner emails: <PROGRAM_NAME> (DRAFT)

> **DRAFT until the approver (at Using AI to Scale, Justin) approves each email.** Copied to `clients/<CLIENT_SLUG>/partner-emails-DRAFT.md` and filled in step 9 (`process/9-handover.md`). **None of these is wired into a workflow in v1.** The standard build sends no email to partners or clients. These drafts are ready for when the client wants them, and wiring one in is a change to the build.

**Rules for every email:**
- State the program terms only. No earnings promises, no income claims, no examples of what a partner could make. No medical claims. Never "franchise".
- Share nothing about a referred client beyond the name the partner gave us: no contact details, no appointment or sales details.
- The merge fields below are GHL's. Pick each one from the tag icon's picker in the email step, so GHL writes it exactly. Where the first build did not prove one, it says **Confirm**.
- `{{contact.…}}` fields were typed in the first build and work typed. The trigger's own fields (the group **Affiliate enrolled in campaign**) are known only by their **picker labels**: in the bodies they are written `[picker: <label>]`. Insert each one from the picker, never as typed `{{…}}` text: their raw text was never seen ([spec/affiliate-manager.md](../spec/affiliate-manager.md), section 5).

---

## 1. Welcome, with the partner's link and portal login

**Would be sent by:** `Referral Engine - Affiliate Link` (workflow 5), as a new last step, after the step that writes the partner's `Affiliate Link`. The workflow's contact is the new partner, so the email goes to them.

**When it is wired:** turn GHL's standard invite email off in the campaign's Additional Settings, so partners do not get two login emails. This email then carries the portal login.

**Subject (DRAFT):** Welcome to the <PROGRAM_NAME>

**Body (DRAFT):**

```
Hi {{contact.first_name}},

Welcome to the <PROGRAM_NAME>. You're set up as a partner.

Your referral link:
{{contact.affiliate_link}}

Send it to a business you think we can help, or open it yourself and fill in their details. When a client comes to us through your link, they are recorded under your name. If two partners register the same client, the first registration counts, and we review any overlap by hand.

Your partner portal:
[picker: Affiliate enrolled in campaign . Affiliate Magic Login Link]
Log in to see your link and the clients you have referred.

How partners are paid: <!-- FILL: the program terms from the blueprint's section 2, as terms only. Monthly percentage, for example "<RATE_PERCENT>% of each monthly payment from a client you refer, for as long as they stay a client, paid by ACH or check". Fee variant, for example "$250 for each referred deal that closes, paid by check once a month" -->

If a client calls us instead of using your link, ask them to mention your referral code: [picker: Affiliate enrolled in campaign . Am Id]

Questions? Just reply to this email.

<CLIENT_OWNER>
<CLIENT_NAME>
```

**Merge fields:**
- `{{contact.first_name}}`: the partner's first name.
- `{{contact.affiliate_link}}`: the partner's one link, written by the step before. **Confirm:** that a later step in the same workflow reads the updated field. If it does not, use the trigger's link instead: insert **Affiliate enrolled in campaign . Affiliate Referral Link** from the picker (search `affiliate`), then type right after it the same ending the Affiliate Link step adds (`&claimed_partner_id={{contact.id}}&claimed_partner_name={{contact.first_name}}%20{{contact.last_name}}`), as in [process/6-affiliate-manager.md](../process/6-affiliate-manager.md), section 6.4.
- **Affiliate enrolled in campaign . Affiliate Magic Login Link** (picker label): the one-click portal login. Insert it from the picker (search `login`). **Confirm:** the label; the first build saw the trigger offer a one-click login link but did not send one. Its raw `{{…}}` text was never seen: never type a guessed one.
- **Affiliate enrolled in campaign . Am Id** (picker label): the partner's Referral ID. Insert it from the picker (search `am id`: searching `affiliate` does not list it). Never type a guessed `{{…}}`.

## 2. We got your referral

**Would be sent by:** `Referral Engine - Referral Capture` (workflow 2), in the first-claim branch, after the deal and the task. Optionally also workflow 3, for staff-logged introductions.

**The catch:** the workflow's contact is the referred client, not the partner, so a plain email step would email the client. Sending it to the partner needs the partner's email on the lead first. **Confirm how** before wiring it (not done in the first build).

**Subject (DRAFT):** We got your referral: {{contact.first_name}} {{contact.last_name}}

**Body (DRAFT):**

```
Hi {{contact.referring_partner_name}},

Thank you for referring {{contact.first_name}} {{contact.last_name}}. We have their details, and we will reach out to them within one business day.

You can see this referral in your partner portal.

<CLIENT_OWNER>
<CLIENT_NAME>
```

**Merge fields:**
- `{{contact.referring_partner_name}}`: the partner's full name, from the lead's credit fields.
- `{{contact.first_name}}`, `{{contact.last_name}}`: the referred client's name, as the partner gave it.

## 3. Commission paid

**Would be sent by:** `Referral Engine - Commission 3: Paid, monthly repeat` (workflow 8), as its first step, before the wait. It runs when staff drag the deal to `Commission Paid`, that is, after they paid the partner. <!-- FILL: fee variant: replace this with "`Referral Engine - Commission 3: Paid` (workflow 8, spec/workflows/8b-commission-3-paid-once.md), after its one step `Record payment`. There is no wait: the email goes once per deal". Monthly percentage: delete this marker -->

**The catch:** the same as email 2. The workflow's contact is the referred client, so the partner's email must be on the lead first. **Confirm how** before wiring it.

**Subject (DRAFT):** Your partner commission has been paid

**Body (DRAFT):**

```
Hi {{contact.referring_partner_name}},

We have paid your partner commission for {{contact.first_name}} {{contact.last_name}}: <!-- FILL: the amount, from the deal's Reward Amount. Fee variant: the fee as text, for example $250 -->, by <!-- FILL: the payment method -->.

Thank you for the referral.

<CLIENT_OWNER>
<CLIENT_NAME>
```

**Merge fields:**
- `{{contact.referring_partner_name}}`, `{{contact.first_name}}`, `{{contact.last_name}}`: as in email 2.
- The amount: the deal's `Reward Amount` field. **Confirm:** its merge field in the picker (under the opportunity's fields).

---

## Approval

| Email | Status |
|---|---|
| 1. Welcome | <!-- FILL: DRAFT, or approved YYYY-MM-DD: "the approver's words" --> |
| 2. We got your referral | <!-- FILL --> |
| 3. Commission paid | <!-- FILL --> |
