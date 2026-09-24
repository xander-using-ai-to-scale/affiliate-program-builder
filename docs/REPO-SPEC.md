# REPO-SPEC: affiliate-program-builder v1.0.0

> The contract for this repo. **Change this file first**, then the files it describes, then `CHANGELOG.md`.
> Written Sep 25 2026 from the first build (an SEO agency's partner program, Sep 21–22 2026) and Justin's ask on the Sep 24 huddle: *"a process for that where we can just give it context about the person's business and it just builds out their affiliate program."*

## 1. What this repo is

A reusable, step-by-step process that builds a complete **affiliate (referral-partner) program inside a client's GoHighLevel (GHL) sub-account**. The build is one-to-one with our first build. Only the client-specific values change: partner types, commission model and rate, names, and the people.

**Who reads it**
- **A fresh AI coding session** (Claude Code, Codex, Hermes) that has been handed `BUILD-PROMPT.md` plus a client's context. It must be able to rebuild the program from this repo alone. It has no access to our chat history, our vault or the first client's account.
- **The operator** (at Using AI to Scale: Xander or Justin), who runs that session, gives it access, approves the blueprint and records the walkthrough video.

**The bar:** a session that has never seen the first build finishes the same program, step for step, and never has to guess a setting. If a setting matters, it is written down: field names, merge fields, conditions, texts and toggles.

## 2. Where things live

- Repo: `github.com/xander-using-ai-to-scale/affiliate-program-builder` (**private**). Local copy: `C:\Users\jxrvi\Claude\affiliate-program-builder`.
- **Client work never goes into the committed tree.** A build writes to `clients/<client-slug>/`, which `.gitignore` excludes. This holds the brief, the config with real ids, the build record, and the flowchart data and PDF. Afterwards the operator files the build record in their own records (at Using AI to Scale, the vault).
- **Secrets never go in any file.** A client's GHL Private Integration token lives in a file in `~/.secrets/`, and configs hold only that file's **name** (`tokenFile`).
- **The worked example** (`examples/example-seo-agency/`) is the first build with the identifying details removed. See §8.

## 3. The tree, and who owns each part

```
affiliate-program-builder/
├── README.md               what it is · use it in 3 steps · what the client gets
├── BUILD-PROMPT.md         the message the operator pastes into a new session, with blanks to fill
├── CLAUDE.md               standing rules for any AI session working in this repo (AGENTS.md = same text)
├── AGENTS.md               copy of CLAUDE.md for Codex/Hermes (keep identical)
├── CHANGELOG.md            versions; the rule for changes
├── .gitignore              clients/, dist/*.tmp, OS junk
├── docs/
│   ├── README.md
│   ├── REPO-SPEC.md        this file
│   ├── how-it-works.md     the program in plain words, for the operator and the client
│   └── other-crms.md       the same program mapped onto a CRM other than GHL (one page)
├── process/                THE BUILD, IN ORDER. Every step ends with a **Check:**
│   ├── README.md           the 10 steps, time per step, who does what, what "done" means
│   ├── 0-intake.md         context → client brief + the questions still missing
│   ├── 1-blueprint.md      brief → program blueprint (partner types, commission model, variant) → operator approves
│   ├── 2-access-and-survey.md   the token, the config, a read-only survey of the account
│   ├── 3-structure.md      fields, tags, pipelines, calendar via tools/ghl/build-structure.js
│   ├── 4-forms.md          the 3 forms, built in the UI from spec/forms.md
│   ├── 5-workflows.md      the 8 workflows, built in the UI from spec/workflows/
│   ├── 6-affiliate-manager.md   the campaign, the workflow hooks, the Become a Partner page
│   ├── 7-instantly.md      only if the client runs cold email in Instantly
│   ├── 8-test.md           the test suite (tools/ghl/enroll.js etc.), expected results, cleanup
│   ├── 9-handover.md       build record, flowcharts PDF, the 2-minute walkthrough video, person slots swapped
│   └── ghl-traps.md        every GHL UI trap we hit and exactly how to get past it
├── spec/                   WHAT GETS BUILT, EXACTLY
│   ├── README.md
│   ├── structure.json      the standard fields/tags/pipelines/calendar (read by build-structure.js)
│   ├── forms.md            3 forms: every field (label, type, custom field, required, hidden, query key), settings, share link
│   ├── workflows/
│   │   ├── README.md       the 8 workflows, the order to build them, how they connect
│   │   ├── 1-instantly-interested-reply.md
│   │   ├── 2-referral-capture.md
│   │   ├── 3-staff-attribution.md
│   │   ├── 4-partner-sign-up.md
│   │   ├── 5-affiliate-link.md
│   │   ├── 6-commission-1-sale.md
│   │   ├── 7-commission-2-approved.md
│   │   ├── 8-commission-3-paid-monthly.md
│   │   └── 8b-commission-3-paid-once.md   workflow 8 for the "one fee per closed deal" variant (built instead of 8)
│   ├── affiliate-manager.md   campaign settings, merge fields, the Become a Partner page layout
│   └── variants.md         what changes per commission model: monthly % (default), one fee per closed deal, pay per lead;
│                           plus client differences (homeowner clients, phone-only referrals, one payout method, a payout run)
├── templates/              COPIED INTO clients/<slug>/ AT THE START OF A BUILD
│   ├── README.md
│   ├── client-brief.md     the intake: business, offer, partner types, commission, payouts, people, domain, tools
│   ├── client-config.json  locationId, tokenFile, user ids, structure overrides, ids (filled by survey.js --ids)
│   ├── blueprint.md        the program blueprint the operator approves
│   ├── build-record.md     the client's build document (what was built, ids, tests, open items)
│   ├── flowcharts-data.js  starter data for tools/flowcharts (copy of the example, placeholders)
│   ├── walkthrough-video.md   the 2-minute "here is what we built" script
│   └── partner-emails-DRAFT.md   welcome / "we got your referral" / "commission paid" (DRAFT until approved)
├── tools/
│   ├── README.md           every script: what it does, writes or read-only, how to run
│   ├── ghl/                ghl.js (shared helper) · survey.js · build-structure.js · double-check.js ·
│   │                       verify-test.js · fire-test.js · enroll.js · move-stage.js · selftest.js ·
│   │                       structure.default.json (fallback if spec/structure.json is missing)
│   ├── flowcharts/         render.js (+ README): data file → HTML + PDF flowcharts
│   ├── check-repo.js       the repo's own checker (§7)
│   └── build-zip.js        writes dist/affiliate-program-builder-v<version>.zip
├── dist/                   the release zip (for agents that cannot clone GitHub)
└── examples/
    ├── README.md
    └── example-seo-agency/ the first build, identifying details removed: brief, blueprint, config, build record,
                            flowcharts data + PDF, test log
```

**Every folder has a `README.md`** that says what the folder is for, what is in it (a line per file), and what does not belong there.

## 4. The standard program (what every build contains)

This is the content of `spec/`, summarised. The detail lives in `spec/`.

- **3 pipelines.**
  - Partner Recruiting: New → Working → Engaged → Booked → Showed → Offer Made.
  - Partner Lifecycle: Signed → Onboarding → Activated → Producing → Dormant.
  - Referred Leads, 13 stages: Referral Received → Attempting Contact → Contacted / Nurture → Appointment Booked → Appointment Showed → Qualified / Consult Completed → Sold / Enrolled → Commission Pending → Commission Approved → Commission Paid, plus No Show / Unqualified, Lost / No Sale and Attribution Review.
- **Fields.** 29 contact fields:
  - 10 for recruiting;
  - 14 from the referral spec;
  - 5 "Claimed …" staging fields.

  Plus 7 opportunity fields. Exact names, keys, types and options are in `spec/structure.json`.
- **Tags.** 24 standard tags, plus the client's `segment/` tags.
- **Calendar.** Partner Intro Call: 20 min, Mon/Tue, placeholders for owner, hours and link.
- **3 forms.**
  - Refer a Client: filled by a partner through their link. Hidden fields fill from the link: `claimed_partner_id`, `claimed_partner_name`, `am_id` → Claimed Referral Code.
  - Partner Sign-Up.
  - Staff Attribution: internal.
- **8 workflows**, all published:
  - Instantly - Interested Partner Reply;
  - Referral Engine - Referral Capture;
  - Referral Engine - Staff Attribution;
  - Referral Engine - Partner Sign-Up;
  - Referral Engine - Affiliate Link;
  - Referral Engine - Commission 1: Sale;
  - Referral Engine - Commission 2: Approved;
  - Referral Engine - Commission 3: Paid, monthly repeat.
- **GHL Affiliate Manager.**
  - A campaign "<Client> Partner Program": link destination Forms → Refer a Client, tracked by `?am_id`. Pay Per Lead with the amount off. The standard invite email is on, cookie 365 days, payout terms as the client pays.
  - Partner Sign-Up adds each partner to the manager and the campaign.
  - Affiliate Link writes one link carrying both ids.
  - Referral Capture and Staff Attribution file each first-claim lead under its partner by custom mapping on the lead's Referral Code.
- **The Become a Partner page.** A funnel with one step, `/become-a-partner`: a headline, one line of copy (DRAFT) and the Partner Sign-Up form. It is published once a domain is connected.
- **Rules built in.**
  - No partner type is recruited until the client confirms in writing that it may legally receive a referral fee (brief field 14). The repo never gives legal advice.
  - The first claim on a client wins the credit; later claims go to Attribution Review.
  - Forms write only to "Claimed …" staging fields.
  - The commission is a monthly cycle kept on the deal, with no tags.
  - Nothing reaches GHL from Instantly unless someone marks the lead Interested.
  - Every task and alert goes to a placeholder user until the client has a GHL user.
  - No partner- or client-facing emails are sent until the copy is approved.
- **Known limit.** Without Stripe, the Affiliate Manager tracks partners and leads, not money: partners see leads, not earnings, in the portal.

## 5. Writing rules (all files)

1. **Plain English.** Short sentences. One idea per sentence. Explain any GHL term the first time it appears. Write for a smart reader who has never opened GHL.
2. **Steps are numbered, one action per step.** A step says where to click, what to type or pick, and the exact value. **Every step ends with `**Check:**`**, saying what the builder must see before moving on. Each process file ends with **"If a step fails"**.
3. **Exact values in code format.** Field names, stage names, merge fields (`{{contact.referral_code}}`), URL parameters, file names and commands.
4. **Placeholders are UPPER_SNAKE in angle brackets**, and the same everywhere: `<CLIENT_NAME>`, `<CLIENT_SLUG>`, `<PROGRAM_NAME>` (= "<CLIENT_NAME> Partner Program"), `<LOCATION_ID>`, `<TOKEN_FILE>`, `<PLACEHOLDER_USER>` (the operator, until the client has a GHL user), `<CLIENT_USER>`, `<RATE_PERCENT>`, `<REFER_FORM_ID>`, `<SIGNUP_FORM_ID>`, `<STAFF_FORM_ID>`, `<INSTANTLY_WEBHOOK_URL>`, `<CLIENT_DOMAIN>`. List any new one in `templates/README.md`.
5. **Client-facing copy is marked DRAFT** until the operator's approver (at Using AI to Scale, Justin) approves it. This covers page text, emails and anything a partner or client reads. Compliance: no earnings promises, no income claims, no medical claims, never "franchise".
6. **Confidence is explicit.** If a setting was not proven in the first build, say so: "Not yet proven: …" or "Confirm: …". Never present a guess as fact.
7. **No identifying data from any real client**, anywhere outside `clients/` (§8).
8. **Cross-references are relative links** (`[4-forms](4-forms.md)`) and must resolve.

## 6. Tools (Node 18+, no npm installs)

- `tools/ghl/*` are the scripts from the first build, generalised:
  - A client is chosen with `--client <slug>`, which reads `clients/<slug>/config.json`. `--config <path>` reads any path; `examples/example-seo-agency/config.json` is valid for dry runs.
  - Every API call sends a browser User-Agent, because without it Cloudflare answers error 1010.
  - The token is read from `~/.secrets/<tokenFile>` and never printed.
  - Test scripts refuse any contact that is not on `@example.com`.
  - Scripts that write say so in their header comment and print the account they are about to touch.
- `tools/flowcharts/render.js`: data file → HTML + PDF, through headless Edge or Chrome. PNG previews are optional (Python + PyMuPDF).
- `tools/check-repo.js`: see §7.
- `tools/build-zip.js`: zips the committed tree, without `clients/` and `dist/`, into `dist/`.

## 7. The checker (`node tools/check-repo.js`), all must pass before a release

1. Every folder, except `.git`, `dist` and `clients`, has a `README.md`.
2. Every relative link in every `.md` resolves.
3. No secrets: no `pit-` tokens, no JWTs, no `Bearer <long string>`.
4. No identifying data from the first build: none of the strings in `clients/check-repo.forbidden.txt` (gitignored), or a list passed with `--forbidden <path>`.
5. The version in `CHANGELOG.md`, `README.md` and `dist/` agrees.
6. Every file listed in §3 exists.
7. Every `process/*.md` step block has a `**Check:**`.
8. Every workflow in `spec/workflows/` names its trigger and lists steps in a table.

## 8. The example: the first build, anonymised

| Real | In the repo |
|---|---|
| Client, business, owner names | "Example SEO Agency", owner "Alex Example" |
| Program name | "Example SEO Partner Program" |
| GHL location, form, workflow, pipeline, field, user ids | `<LOCATION_ID>` etc., or omitted |
| Webhook URLs, funnel/page ids, preview links | placeholders |
| Test contacts (`test.*@example.com`) and test ids | may stay: they are fake |
| Operator names (Using AI to Scale's team) | "the operator"; **Justin** as approver may be named in the process docs |
| 15% monthly recurring, the 19 partner types, the stage names | stay: they are the example's program terms |

## 9. Versioning

`1.0.0` is the first release. Change the spec first, then the files, then `CHANGELOG.md`, bump the version, rebuild the zip (`node tools/build-zip.js`), run the checker (`node tools/check-repo.js`; it compares the zip with the files), and push.
