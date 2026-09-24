# Affiliate Program Builder

A repeatable process that builds a complete affiliate (referral-partner) program inside a client's GoHighLevel (GHL) sub-account. Give a fresh AI coding session this repo and the client's context. It asks what is missing, gets a blueprint approved, builds the program in the client's GHL, tests it, and hands over a build record, flowcharts and a 2-minute walkthrough video script.

Every build is one-to-one with our first build (an SEO agency's partner program, Sep 21–22 2026). Only the client's values change: partner types, commission model and rate, names and people.

> Justin, Sep 24 2026: "a process for that where we can just give it context about the person's business and it just builds out their affiliate program."

**Version 1.0.0** · 2026-09-25 · Private repo. The contract for every file here is [docs/REPO-SPEC.md](docs/REPO-SPEC.md).

---

## Who it is for

| Who | What they do |
|---|---|
| **The operator** (at Using AI to Scale: Xander or Justin) | Runs the session, gets access from the client, answers questions, approves the blueprint, records the walkthrough video |
| **The approver** (at Using AI to Scale: Justin) | Approves every text a partner or the client will read |
| **The AI session** (Claude Code, Codex or Hermes) | Follows [process/](process/README.md) step by step, and builds exactly what [spec/](spec/README.md) says |
| **The client** | Gives access and the program terms; gets the program, the video and the build record |

## Use it in 3 steps

1. Open a new Claude Code chat in an empty folder. (Codex or Hermes work the same way.)
2. Paste the message from [BUILD-PROMPT.md](BUILD-PROMPT.md), with the client's name, the access details and this repo's link filled in. Attach the client's context: call transcripts, notes, their website.
3. Answer its questions and approve the blueprint. It builds and tests the program, then hands you the build record, the flowcharts PDF and the walkthrough video script.

The session drives your browser for GHL's screens (Claude in Chrome, or the Claude app's browser pane), because GHL's API cannot build forms, workflows or the Affiliate Manager. You log in; keep the GHL window visible, side by side with the chat.

## What the client gets

| Piece | What it is |
|---|---|
| Pipelines | **Partner Recruiting** (New → Working → Engaged → Booked → Showed → Offer Made), **Partner Lifecycle** (Signed → Onboarding → Activated → Producing → Dormant), **Referred Leads** (13 stages, from Referral Received to Commission Paid, plus No Show / Unqualified, Lost / No Sale and Attribution Review) |
| Fields and tags | 29 contact fields, 7 deal fields, 24 standard tags, plus the client's `segment/` tags |
| Calendar | **Partner Intro Call**: 20 minutes, Monday and Tuesday. The client sets the hours, the owner and the video link |
| Forms | **Refer a Client** (a partner registers a client, through their personal link), **Partner Sign-Up**, **Staff Attribution** (internal, for referrals by phone, email or walk-in) |
| Workflows | 8, all published: the Instantly interested-reply intake (only if the client uses Instantly), Referral Capture, Staff Attribution, Partner Sign-Up, Affiliate Link, and a 3-step commission cycle |
| Affiliate Manager | GHL's own affiliate tool. A campaign `<PROGRAM_NAME>`, and for each partner a profile, a portal login and one link. Every referred client is filed under its partner |
| Become a Partner page | A one-page funnel with the Partner Sign-Up form. It goes live once the client's domain is connected |
| Commission tracking | A monthly cycle on each referred client's deal: Sold → Commission Pending (approval task) → Commission Approved (payout task) → Commission Paid, and 30 days later back to Pending, until the client leaves. Other variants: one fee per closed deal, or pay per lead |
| Handover | A build record, a flowcharts PDF of every pipeline and workflow, and a 2-minute walkthrough video |

**Rules built in:** the first partner to claim a client gets the credit, and any later claim goes to a person for review. Nothing reaches GHL from Instantly unless someone marks the lead Interested. Every task and alert goes to the operator until the client has a GHL user. No email goes to a partner or a client until its text is approved.

The whole program in plain words: [docs/how-it-works.md](docs/how-it-works.md).

## How a build runs

```
Context --> 0 Intake --> 1 Blueprint --> 2 Access --> 3 Structure --> 4 Forms --> 5 Workflows
            brief and    the operator    token and    fields, tags,    3 forms     7 workflows,
            questions    approves        survey       pipelines,                   published
                                                      calendar                          |
                                                                                        v
            9 Handover <-- 8 Test <------ 7 Instantly <-------------- 6 Affiliate Manager
            record, PDF,   every test,    only if used                campaign, link workflow,
            2-min video    cleanup                                    Become a Partner page
```

Each step is one file in [process/](process/README.md), with numbered actions that each end with a **Check**. The exact settings are in [spec/](spec/README.md). The scripts are in [tools/](tools/README.md).

## Time

The first build took about 1.5 days end to end. Most of that was waiting on people: the client's access, their answers, their plans.

| Step | Hands-on time (first build) |
|---|---|
| 0 Intake and 1 Blueprint | Not timed. Estimate: 30–60 minutes, plus the answers and the approval |
| 2 Survey | 15 minutes, once the client has given access |
| 3 Structure | 30 minutes |
| 4 Forms | 30 minutes |
| 5 Workflows | 3 hours |
| 6 Affiliate Manager and the page | About 1.5 hours |
| 7 Instantly webhook | 2 minutes, once the client has upgraded |
| 8 Tests | About 2 hours |
| 9 Handover | About 1 hour plus one call (estimate) |

## Limits

- **Without Stripe, the Affiliate Manager tracks partners and leads, not money.** Partners see their leads in the portal, not their earnings. Commissions run in the Referred Leads pipeline, and a person pays partners.
- **The Become a Partner page needs the client's domain.** Until it is connected, the page is saved but not published, and the forms use GHL's own link.
- **SMS needs A2P approval.** The build sends no SMS.
- **The Instantly webhook needs Instantly's Hyper Growth plan.**
- **Public GHL forms carry a bot check.** The automated tests stand in for them, and one form fill is done by a person.

## Repo map

```
affiliate-program-builder/
├── README.md               this file
├── BUILD-PROMPT.md         the message the operator pastes into a new session
├── CLAUDE.md, AGENTS.md    standing rules for any AI session (the same text)
├── CHANGELOG.md            versions, and the rule for changes
├── docs/                   the contract (REPO-SPEC.md), how the program works, other CRMs
├── process/                the build, in order: 0-intake.md to 9-handover.md, and ghl-traps.md
├── spec/                   what gets built, exactly: structure, forms, 8 workflows, Affiliate Manager, variants
├── templates/              copied into clients/<CLIENT_SLUG>/ during a build
├── tools/                  ghl/ (survey, build, checks, tests), flowcharts/, check-repo.js, build-zip.js
├── examples/               the first build, anonymised: Example SEO Agency
├── dist/                   the release zip, for agents that cannot clone GitHub
└── clients/                one folder per client build; never committed
```

Start points: [process/README.md](process/README.md) · [spec/README.md](spec/README.md) · [tools/README.md](tools/README.md) · [templates/README.md](templates/README.md) · [docs/README.md](docs/README.md) · [examples/README.md](examples/README.md).

## Changing this repo

1. Edit [docs/REPO-SPEC.md](docs/REPO-SPEC.md) first.
2. Edit the files it describes.
3. Add an entry to [CHANGELOG.md](CHANGELOG.md), and bump the version there and in this file.
4. Run `node tools/check-repo.js` until it passes.
5. Rebuild the zip: `node tools/build-zip.js`.
6. Commit and push.

After every client build, bring back what it taught: a new trap for [process/ghl-traps.md](process/ghl-traps.md), a clearer step, a missing setting. The same six steps apply.

## Versions

**1.0.0** · 2026-09-25 · first release. The history is in [CHANGELOG.md](CHANGELOG.md).
