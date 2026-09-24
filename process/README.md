# process/: the build, in order

Ten steps take a client from "here is their context" to a live, tested affiliate program in their GoHighLevel (GHL) sub-account, handed over. Do them in order. Every numbered action ends with a **Check:**. Every step file ends with "If a step fails".

This folder says **how** to build: where to click, what to check, which traps to avoid. The exact values (field names, merge fields, texts, toggles) live in [spec/](../spec/README.md). A step links to the spec file it needs.

**What does not belong here:** exact settings (they go in `spec/`), scripts (`tools/`), and anything about a real client (`clients/<CLIENT_SLUG>/`, never committed).

## Before you start

All of these must be true:

- You have read [CLAUDE.md](../CLAUDE.md) in full.
- Node 18 or newer is installed: `node --version` prints `v18` or higher.
- From step 4 on: you can drive the operator's browser (Claude in Chrome, or the Claude app's browser pane), and the operator is logged in to GHL there with their own login.
- From step 4 on: the GHL window stays visible on screen, side by side with the chat app. A covered window stops GHL's builders from drawing. See the first table in [ghl-traps.md](ghl-traps.md).
- The operator can answer questions and give the three approvals below.

Access to the client's GHL is not needed before step 2. Step 2 collects it.

## The ten steps

| Step | File | Owner | Time in the first build | Needs | Makes | Done when |
|---|---|---|---|---|---|---|
| 0 | [0-intake.md](0-intake.md) | AI session; the operator answers questions | Not timed. Estimate: 15–30 min, plus the answers | The client's context | `brief.md`, plus blank copies of `blueprint.md` and `build-record.md` for later steps | Every brief field has an answer, a source and a confidence |
| 1 | [1-blueprint.md](1-blueprint.md) | AI session drafts; **the operator approves** | Not timed. Estimate: 15–30 min, plus the approval | The brief | `blueprint.md`, approved | The operator's approval is written into the blueprint |
| 2 | [2-access-and-survey.md](2-access-and-survey.md) | The client, the operator, the AI session | Waits on the client; the survey took 15 min | The client's invite and token | `config.json`; the survey in the build record | `survey.js` names the account and lists the operator as a user |
| 3 | [3-structure.md](3-structure.md) | AI session | 30 min | The config and the blueprint | Fields, tags, pipelines, calendar | `double-check.js` passes all of them |
| 4 | [4-forms.md](4-forms.md) | AI session, in the operator's browser | 30 min | Step 3 | The 3 forms | `double-check.js` passes the 3 forms, and their ids are in the config |
| 5 | [5-workflows.md](5-workflows.md) | AI session, in the operator's browser | 3 hours | Step 4 | Workflows 1–4 and 6–8, published | `double-check.js` shows each one published |
| 6 | [6-affiliate-manager.md](6-affiliate-manager.md) | AI session, with the browser on screen | About 1.5 hours | Step 5 | The campaign, workflow 5, the Affiliate Manager steps, the Become a Partner page | `double-check.js` passes every workflow, and the page is saved |
| 7 | [7-instantly.md](7-instantly.md) | The client pays; then the operator or the AI session | 2 min once the plan is upgraded | Instantly on the Hyper Growth plan | The Instantly webhook | A real interested lead lands at `Engaged` |
| 8 | [8-test.md](8-test.md) | AI session; **the operator approves the cleanup** | About 2 hours | Steps 3–6 | Test results in the build record | Every test passes and is recorded |
| 9 | [9-handover.md](9-handover.md) | AI session writes; the operator records and sends | About 1 hour plus one call (estimate) | Step 8 | Build record, flowcharts PDF, walkthrough video | The video is sent, the test records are deleted, and the build record is complete |

The first build took about 1.5 days end to end (Sep 21–22 2026). Most of that was waiting on people.

**Step 7 waits on the client.** Webhooks need the client's Instantly on the Hyper Growth plan. If they have not upgraded yet, go on to step 8 and come back to step 7 later. Skip step 7 entirely if the client does not use Instantly.

## The flow

```
Context
   |
   v
0 Intake ----> 1 Blueprint ----> 2 Access + survey ----> 3 Structure ----> 4 Forms ----> 5 Workflows
brief and      [GATE: the        token, config,          fields, tags,      3 forms       workflows 1-4 and
questions       operator          read-only survey        pipelines,                       6-8, published
                approves]                                 calendar                              |
                                                                                                v
9 Handover <---- 8 Test <-------------- 7 Instantly <-------------- 6 Affiliate Manager
record, PDF,     every test,            only if used; waits          campaign, workflow 5,
2-min video      [GATE: the cleanup]    on the client's plan         the hooks, the page
[GATE: copy]
```

## The approval gates

| Gate | Who approves | Before what |
|---|---|---|
| The blueprint | The operator, in writing | Anything is built in the client's GHL. The approval covers building and publishing everything the blueprint lists |
| Client-facing copy | The operator's approver (at Using AI to Scale, Justin) | Any text a partner or the client reads goes live or is sent: page text, form messages, emails, the walkthrough message. Until then it is marked **DRAFT** |
| Deletes | The operator | Any delete, including the test cleanup in step 8. Always after a backup, one named record at a time |

Nothing else needs an approval. Everything else follows the steps.

## How to read a step file

- The table at the top says who does the step, how long it took in the first build, what it needs, what it makes, and when it is done.
- Sections are numbered (`5.2`). The actions inside a section are numbered too. Do one action, then its **Check:**. Do not start the next action until the Check passes.
- Exact values live in [spec/](../spec/README.md). Build exactly what the spec says. If the spec is silent or unclear, stop and ask the operator.
- If a Check fails, read "If a step fails" at the bottom of the file, then [ghl-traps.md](ghl-traps.md).
- Every result goes into `clients/<CLIENT_SLUG>/build-record.md` as you go: ids, versions, test results with the date and time, questions and answers, and any difference from the spec.

## GHL words used in these files

| Word | Meaning |
|---|---|
| Sub-account (location) | One client's own GHL account. Its id is the `<LOCATION_ID>` |
| Contact | A person in GHL: a partner, a referred client, a test record |
| Custom field | An extra field on a contact or a deal, such as `Referral Code` |
| Tag | A label on a contact, such as `referred-lead` |
| Pipeline, stage | A board of columns (stages). Deals move from stage to stage |
| Deal (opportunity) | A card in a pipeline, tied to one contact. GHL calls it an "opportunity" |
| Workflow | An automation: one trigger, then steps (actions) in order |
| Trigger | The event that starts a workflow, such as "Form submitted" |
| Merge field | A value GHL fills in when the workflow runs, such as `{{contact.email}}` |
| Form | A web form. A hidden field fills from a URL parameter, named by its "Query Key" |
| Affiliate Manager | GHL's own affiliate tool: campaigns, affiliate profiles, links, a partner portal |
| `am_id` | The partner's Referral ID in the Affiliate Manager. It rides in the partner's link |
| Placeholder user | `<PLACEHOLDER_USER>`: the operator's GHL user, holding every task, alert and the calendar until the client has a GHL user |

## Resuming a build

A build often runs over two days. To pick it up again:

- Read `clients/<CLIENT_SLUG>/build-record.md`. Its status table and log say which section passed last.
- Run `node tools/ghl/double-check.js --client <CLIENT_SLUG>` to see what GHL holds now.
- Continue from the first action whose Check has not passed.

## Messages to the operator

Start each message with a state line, for example `Step 5 · Workflows · 3 of 7 published`. Then keep it short: what is built, what is blocked, and what you need from the operator. The evidence goes in the build record.

## If a step fails

- Follow the "If a step fails" section at the bottom of that step's file.
- Then look for the symptom in [ghl-traps.md](ghl-traps.md).
- Still failing after one retry: stop, write it in the build record, and tell the operator in one message: `Blocked at step <N.N>: <what the Check showed>. Tried: <fix>. Need from you: <one thing>.` Do not start the next step while a Check is failing.
