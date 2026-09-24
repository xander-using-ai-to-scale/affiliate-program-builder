# The program on a CRM other than GHL

**For most clients, we recommend GHL.** Justin, Sep 24 2026: most people have to be told to use GHL, "because their CRM is not going to necessarily have it, but we could adapt it for any CRM." GHL has every building block below in one account, including affiliate tracking. Adapt the program to another CRM only when the client will not move, and only after the checks at the bottom pass.

The process in this repo builds GHL only. On another CRM, the rules, the stages, the tests and the handover stay the same; the clicks and the scripts do not.

## The building blocks

| Building block | In GHL | What to look for in the other CRM | What breaks without it |
|---|---|---|---|
| Custom fields on contacts and on deals | 29 contact fields and 7 deal fields: text, number, date, dropdown, long text | Custom fields of those types, on both contacts and deals | The credit fields, the "Claimed ..." holding fields, the commission fields |
| Pipelines with stages | Partner Recruiting, Partner Lifecycle, Referred Leads (13 stages) | Several boards, each with its own stages, and a deal can move back to an earlier stage | The commission cycle, which lives in the stages |
| Forms that write to custom fields | Refer a Client, Partner Sign-Up, Staff Attribution | Web forms that map each field to a contact field | Partner sign-up and referral capture |
| Hidden form fields filled from the link | `claimed_partner_id`, `claimed_partner_name`, `am_id`, each a hidden field's Query Key | A hidden field that takes its value from a URL parameter | The partner's personal link, and so the automatic credit |
| Automations: triggers | Form submitted, pipeline stage changed, inbound webhook, affiliate enrolled | Triggers on a form, on a stage change, and on an incoming webhook | Everything automatic |
| Automations: conditions and steps | If / else, update a field, find and update a deal, add a task, internal alert, wait 30 days | A condition on a field or a stage, "find an existing deal and update it", and a wait of 30 days followed by a check | First-claim-wins, conflict review, the monthly loop |
| Tasks for a person | A task with a title, a due date and one assignee | Tasks assigned to a user, with a due date | The approval, payout and review routines |
| An inbound webhook | Instantly's "Lead is marked as interested" | A URL that turns an incoming request into a contact and a deal | Cold email intake (only if the client uses Instantly) |
| Affiliate tracking | The Affiliate Manager: a campaign, a profile, portal login and link per partner, leads filed per partner | Built-in affiliate or partner tracking, or a separate affiliate tool connected to the CRM | Partner profiles, the portal and leads per partner. The credit and commission still work without it |
| An API with a token | Private Integration token; the scripts in `tools/ghl/` | An API that can create fields, tags and pipelines, and read everything back | The scripted build and the double-check: without it, build by hand and check by eye |

## How the rules map

- **First claim wins:** forms write to holding fields; an automation copies a claim into the credit fields only when the credit fields are empty; otherwise it flags the conflict and moves the deal to review.
- **The monthly cycle:** a stage for each state (Sold, Commission Pending, Commission Approved, Commission Paid), a task at each, and a 30-day wait that sends the deal back to Pending while it is still at Paid.
- **One link with both ids:** only needed when the CRM's affiliate tracking has its own partner id. Otherwise the link carries the Partner ID alone.

## What to check in a new CRM, before promising the program

- Does a form overwrite contact fields at once, before automations run? If yes, the holding fields are needed (they are, in GHL).
- Can a hidden form field take its value from the URL?
- Can one automation find an existing deal and move it, rather than create a second one?
- Can an automation wait 30 days, then check the deal's stage before acting?
- Can a deal move back to an earlier stage by automation?
- Can a task be assigned to one named user, with a due date?
- Does the CRM have affiliate tracking with a partner portal, or does it need a separate tool?
- Can it receive a webhook, if the client uses Instantly?
- Can a script build fields and pipelines through an API, or must everything be built by hand?

If any answer is no, tell the operator which rule it breaks, and recommend GHL.
