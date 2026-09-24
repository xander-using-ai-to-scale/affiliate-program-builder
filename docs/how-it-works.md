# How the partner program works

The program in plain words, for the operator and for the client. How to build it is in [process/](../process/README.md); the exact settings are in [spec/](../spec/README.md).

## What it is

A referral-partner program inside the client's own GoHighLevel (GHL) account. Other businesses become the client's partners. Each partner gets a personal link. When they send the client a new customer, the program records who sent them. When that customer pays, GHL reminds the client's staff to approve and pay the partner's commission. GHL tracks and reminds; a person pays the partner.

## Who is who

- **The client:** the business that runs the program.
- **A partner:** a business or person who refers customers to the client. GHL's Affiliate Manager calls them an "affiliate".
- **A referred client:** a customer a partner sent. Each one gets a card (a "deal") in the Referred Leads pipeline. A pipeline is a board of columns (stages) that cards move through.
- **The client's staff:** the people who follow up with referred clients and approve and pay commissions.
- **The placeholder user:** until the client has their own GHL login, every task and alert goes to the operator who built the program. The handover moves them to the client's user.

## A partner's journey

1. **They hear about the program.** By cold email (if the client uses Instantly: only leads someone marks "Interested" reach GHL, landing in Partner Recruiting at `Engaged`), by an intro call on the Partner Intro Call calendar, or by word of mouth.
2. **They sign up** on the Become a Partner page, with the Partner Sign-Up form. GHL records them as a partner at the client's rate, opens a card in Partner Lifecycle at `Onboarding`, and gives staff an onboarding task.
3. **They become an affiliate.** The same sign-up adds them to GHL's Affiliate Manager, in the client's campaign. GHL emails them a login to their partner portal.
4. **They get one link.** It opens the Refer a Client form, and it carries two ids: GHL's Referral ID for the partner (the `am_id`) and the program's own Partner ID. The link is on their contact record and in their portal.
5. **They refer a customer** by opening their link and filling in the customer's details (or by sending the link to the customer). The program credits them, opens a card in Referred Leads at `Referral Received`, gives staff a task to reach out within one business day, and files the customer under the partner in the Affiliate Manager.
6. **Staff can also log a referral by hand**, when it came by phone, email or walk-in, with the Staff Attribution form. To file it in the Affiliate Manager too, staff type the partner's Referral Code into the form.
7. **The customer buys**, and the commission cycle starts (below).

## How the credit works

- **The first claim wins.** The first partner to register a customer gets the credit.
- **A later claim never takes the credit silently.** If a second partner registers the same customer, nothing is overwritten: the card moves to `Attribution Review`, and staff get a task to decide. A partner who registers the same customer twice is flagged the same way; that review takes seconds.
- **Why the forms work this way.** A GHL form writes onto the contact the moment it is sent, before any automation runs. So the forms write only into "Claimed ..." holding fields, and an automation copies a claim into the real credit fields only when it is the first one.
- **The credit locks at the sale.** When the customer buys, the credit is marked `Locked`.
- **A disputed customer is filed under nobody** in the Affiliate Manager until a person decides.

How staff resolve a conflict, step by step: [process/9-handover.md](../process/9-handover.md), section 9.9.

## The commission cycle

The default model (the first build's) pays the partner a percentage of what the customer pays, every month, for as long as the customer stays.

```
Staff drag the card to Sold / Enrolled
        |
        v
Commission Pending ----> staff get an approval task: confirm the customer paid this month,
        ^                fill in the revenue and the partner's amount, drag the card on
        |                           |
        |                           v
        |                Commission Approved ----> staff get a payout task: pay the partner,
        |                                          drag the card on
        |                                                     |
        |                                                     v
        +---- 30 days later, by itself ---------- Commission Paid

The customer cancels: staff drag the card to Lost / No Sale, and the cycle stops.
```

- The cycle lives on the card: its stage plus its `Commission Status` field. No tags are used, so nothing piles up month after month.
- Staff type the partner's amount by hand each month. Without Stripe, GHL has no payment to compute it from.
- Staff pay the partner the way the partner chose on the sign-up form (for example ACH, check or PayPal).

**Other models** (the "variants"), for clients who pay differently:
- **One fee per closed deal**, for example one fee per funded loan: the same approval and payout tasks, once, with no monthly repeat.
- **Pay per lead:** a fee for each referred lead.

What each variant changes is in [spec/variants.md](../spec/variants.md).

## What the Affiliate Manager adds

GHL's Affiliate Manager (in **Marketing**) is GHL's own affiliate tool. In this program it gives:
- every partner a **profile**, a **portal login** and **one link**;
- every referred customer **filed under its partner**, so the partner sees their referrals in the portal.

The program's own automations (the "referral engine") keep doing the credit rules and the commission cycle. The two are joined by the one link, which carries both ids.

## What needs Stripe

Without Stripe connected to GHL, the Affiliate Manager tracks **partners and leads, not money**:
- partners see their leads in the portal, not their earnings;
- commissions are tracked in the Referred Leads pipeline, and a person pays the partner.

Showing commissions in the portal needs the client's Stripe plus a second, sales-based campaign. That is optional and not part of the standard build.

## What the client does after handover

- **Each month:** work the approval and payout tasks, and move the cards (the routine is in [process/9-handover.md](../process/9-handover.md), section 9.9).
- **When a conflict task appears:** decide who sent the customer.
- **To go live on their own domain:** connect it to GHL. Then the Become a Partner page is published and the forms move onto the domain.
- **For SMS:** finish A2P registration first. The standard build sends no SMS.

## Not in the standard build

- Emails or texts to partners and customers. Drafts are written for approval at handover; wiring them in is a later change.
- A prospect-facing intake page and QR codes, a reporting dashboard, appointment automations, and partner reactivation.
- Commissions in the partner portal (needs Stripe).

## Known limits

- A space in a partner's last name can break the name part of their link in some email apps. The credit still works, because it keys on the Partner ID.
- `Attribution Review` replaces the card's stage. The review task says to move the card back; its history shows the old stage.
- If staff change a partner's Referral ID in the Affiliate Manager, the partner's `Referral Code` and `Affiliate Link` fields must be changed to match.
