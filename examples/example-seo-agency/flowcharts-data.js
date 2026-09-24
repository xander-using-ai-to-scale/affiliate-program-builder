// FLOWCHARTS DATA: the worked example (Example SEO Agency, the first build, anonymised), as data
// for tools/flowcharts/render.js. It is templates/flowcharts-data.js with the CLIENT VALUES block
// filled in; nothing else changed. The GHL ids and the segment tags come from config.json next to
// this file, whose ids are placeholders, so the pages show no ids.
//
// Render, from the repo root:
//   node tools/flowcharts/render.js examples/example-seo-agency/flowcharts-data.js --pdf
// It writes flowcharts.html and flowcharts.pdf next to this file.
//
// ADAPTING IT
// - The client does not run cold email in Instantly: set USES_INSTANTLY = false. The Instantly
//   workflow page, its two overview boxes and its Partner Recruiting entry disappear, and the
//   workflow pages renumber themselves ("Workflow 1 of 7").
// - Commission variants. spec/variants.md has the settings; mirror them here, then render again.
//   * Monthly % (the default, as built in the first build): nothing to change.
//   * One fee per closed deal. Not yet proven in a build. Change:
//       page 'wf-comm3': delete the Wait step and the "Still a paying client?" step, and end with
//         { type: 'end', title: 'End', desc: 'One fee per deal: nothing repeats.' }; reword its summary;
//       page 'pl-referred': delete `loops`; reword the summary and the notes of Commission Pending,
//         Commission Approved and Commission Paid (no "this month");
//       page 'overview': delete the node 'stop' and the edges c3 -> pending and c3 -> stop; reword
//         the summary and the boxes 'pending' and 'c3';
//       every `${RATE}%` text: say the fee instead (search this file for RATE).
//   * Pay per lead. Not yet proven in a build. The same changes as one fee per closed deal, plus:
//       page 'wf-comm1': the stage in the trigger box (spec/variants.md says which stage);
//       page 'affiliate', box 'campaign': the per-lead amount is on, so name the amount.
//
// HOW THE DATA WORKS (tools/flowcharts/README.md has the full list)
// - One page = one entry in `pages`, in print order. `id` is the page's anchor; {p:<id>} in any
//   text prints that page's number ("p.6").
// - One box = one object: type, kicker (the small capitals line), title, desc, note (text or a
//   list, printed as "Note: ..."), ref (a page id: shows a "p.N" link), planned: true (dashed box).
//   Box types: trigger | action | condition | wait | task | stage | end | info.
// - flow pages: `steps` run top to bottom; `newColumn: true` starts the next column; a step with
//   `branches: [{ label, sub, steps: [...] }]` splits side by side.
// - pipeline pages: `stages` run left to right (`perRow` wraps them). Per stage: title, note, setBy,
//   triggers, flag, arrowIn ('auto' when a workflow moves the deal in). `entries` / `exits` sit
//   above / below a stage; `loops` draw an arrow back; `side` holds the off-path stages.
// - map pages: each node has `at: [row, col]` (counted from 0) and an optional `span`; `edges`
//   list { from, to, style: 'auto' | 'manual' | 'planned', label }, with optional fromSide / toSide.
// - In map boxes and in any note, `code` prints below the layout check's 8.4pt floor. Write keys
//   like am_id as plain text there. `code` in a flow or cards desc is fine.

// ================================== CLIENT VALUES ==================================
const CLIENT = 'Example SEO Agency'; //          the business, e.g. 'Example SEO Agency'
const PROGRAM = 'Example SEO Partner Program'; //        '<CLIENT_NAME> Partner Program', e.g. 'Example SEO Partner Program'
const RATE = '15'; //           the monthly commission, a number, e.g. '15'
const PERSON = 'the operator'; //     who gets every task and alert until the client has a GHL user
const PAYOUT_TERMS = 'Net-15'; //   the campaign's payout terms, e.g. 'Net-15'
const BUILD_DATE = 'Sep 21–22 2026'; //       e.g. 'Sep 21–22 2026'
const TEST_DATE = 'Sep 22'; //         the day the tests passed, e.g. 'Sep 22'
const CALENDAR = '20 min, Mon and Tue'; //  the Partner Intro Call's length and days (config: structure.calendar)
const CALENDAR_HOURS = '10 AM–5 PM'; //     its hours, in the account's time zone
const USES_INSTANTLY = true; //             false: the client does not run cold email in Instantly
const INSTANTLY_CONNECTED = false; //       true once the Instantly webhook is live (process/7-instantly.md)
const DOMAIN_CONNECTED = false; //          true once the forms and the Become a Partner page are on the client's domain

// ============================ FROM config.json (leave as is) ============================
const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, 'config.json');
const config = fs.existsSync(CONFIG_FILE) ? JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8').replace(/^﻿/, '')) : {};
const real = (v) => (typeof v === 'string' && v && !/<[A-Z][A-Z0-9_]*>/.test(v) ? v : undefined);
const LOCATION_ID = real(config.locationId);
const ID = (section, name) => real(((config.ids || {})[section] || {})[name]);
const SEGMENTS = ((config.structure || {}).tags || []).filter((t) => /^segment\//.test(t)).map((t) => t.slice('segment/'.length));
if (!SEGMENTS.length) SEGMENTS.push('<SEGMENT_1>', '<SEGMENT_2>', 'other');
if (fs.existsSync(CONFIG_FILE) && !ID('pipelines', 'Referred Leads')) {
  console.log('  note: config.json has no ids yet, so the pages show no GHL ids. Run survey.js --ids first.');
}

const X = `${PERSON} (placeholder)`;
const IF = (cond, ...items) => (cond ? items : []);

// ======================================= PAGES =======================================
const pages = [
  // ================================================================= 1. OVERVIEW
  {
    id: 'overview',
    type: 'map',
    kind: 'Overview · the whole build on one page',
    title: 'How it all fits together',
    ghlIdLabel: 'GHL sub-account',
    ghlId: LOCATION_ID,
    summary: `Partners join ${USES_INSTANTLY ? '(from cold email or the sign-up form)' : 'through the sign-up form'}, refer clients through their personal link, and earn ${RATE}% every month the client pays.`,
    legend: true,
    grid: { cols: 5, colGap: 26, rowGap: 44 },
    nodes: [
      // row 1: recruiting partners
      ...IF(USES_INSTANTLY,
        { id: 'instantly', at: [0, 0], type: 'info', kicker: 'Instantly', title: 'Cold email', desc: `Interested replies go to GHL.${INSTANTLY_CONNECTED ? '' : ' Not connected yet.'}` },
        { id: 'wf-instantly', at: [0, 1], type: 'action', kicker: 'Workflow', title: 'Interested Partner Reply', desc: 'Contact, tags, deal, alert, reply task.', ref: 'wf-instantly' }),
      { id: 'recruiting', at: [0, 2], type: 'stage', kicker: 'Pipeline', title: 'Partner Recruiting', desc: USES_INSTANTLY ? '6 stages. Replies land at **Engaged**.' : '6 stages. Staff add and move prospects.', ref: 'pl-recruiting' },
      { id: 'calendar', at: [0, 3], type: 'info', kicker: 'Calendar', title: 'Partner Intro Call', desc: `Intro calls: ${CALENDAR}.`, ref: 'glance' },
      { id: 'staff-form', at: [0, 4], type: 'trigger', kicker: 'Form', title: 'Staff Attribution', desc: 'Internal: email intros, calls, walk-ins.', ref: 'glance' },
      // row 2: signing partners up
      { id: 'signup-form', at: [1, 0], type: 'trigger', kicker: 'Form', title: 'Partner Sign-Up', desc: `On the Become a Partner page${DOMAIN_CONNECTED ? '.' : ' (not live yet).'}`, ref: 'glance' },
      { id: 'wf-signup', at: [1, 1], type: 'action', kicker: 'Workflow', title: 'Partner Sign-Up', desc: 'Rate, personal link, deal, onboarding task.', ref: 'wf-signup' },
      { id: 'lifecycle', at: [1, 2], type: 'stage', kicker: 'Pipeline', title: 'Partner Lifecycle', desc: '5 stages. Sign-ups land at **Onboarding**.', ref: 'pl-lifecycle' },
      { id: 'refer-form', at: [1, 3], type: 'trigger', kicker: 'Form', title: 'Refer a Client', desc: "The partner's link opens it, with their ID and am_id.", ref: 'glance' },
      { id: 'wf-staff', at: [1, 4], type: 'action', kicker: 'Workflow', title: 'Staff Attribution', desc: 'Like Referral Capture; Method = Staff Entered.', ref: 'wf-staff' },
      // row 3: the Affiliate Manager, and referrals landing
      { id: 'wf-afflink', at: [2, 0], type: 'action', kicker: 'Workflow', title: 'Affiliate Link', desc: "Writes the partner's link and Referral Code.", ref: 'wf-afflink' },
      { id: 'am', at: [2, 1], type: 'info', kicker: 'Marketing', title: 'Affiliate Manager', desc: "Partners' links and leads. Commissions stay in {p:pl-referred}.", ref: 'affiliate' },
      { id: 'wf-capture', at: [2, 3], type: 'action', kicker: 'Workflow', title: 'Referral Capture', desc: 'First claim gets the credit; repeats go to review.', ref: 'wf-capture' },
      { id: 'referred', at: [2, 4], type: 'stage', kicker: 'Pipeline', title: 'Referred Leads', desc: 'Deal opens at **Referral Received**.', ref: 'pl-referred' },
      // rows 4-5: the monthly commission loop
      { id: 'sold', at: [3, 0], type: 'stage', kicker: 'Stage', title: 'Sold / Enrolled', desc: 'The client signed.' },
      { id: 'c1', at: [3, 1], type: 'action', kicker: 'Workflow', title: 'Commission 1: Sale', desc: 'Deal to Pending, credit locked, approval task.', ref: 'wf-comm1' },
      { id: 'pending', at: [3, 2], type: 'stage', kicker: 'Stage', title: 'Commission Pending', desc: 'Staff check the payment, fill in the amount.' },
      { id: 'approved', at: [3, 3], type: 'stage', kicker: 'Stage', title: 'Commission Approved', desc: 'This month approved.' },
      { id: 'c2', at: [3, 4], type: 'action', kicker: 'Workflow', title: 'Commission 2: Approved', desc: 'Records the approval, payout task.', ref: 'wf-comm2' },
      { id: 'stop', at: [4, 1], type: 'end', title: 'Cycle stops', desc: 'Deal moved to Lost / No Sale.' },
      { id: 'c3', at: [4, 2], type: 'action', kicker: 'Workflow', title: 'Commission 3: Paid', desc: 'Records the payment, waits 30 days.', ref: 'wf-comm3' },
      { id: 'paid', at: [4, 3], type: 'stage', kicker: 'Stage', title: 'Commission Paid', desc: 'Partner paid for this month.' },
    ],
    edges: [
      ...IF(USES_INSTANTLY,
        { from: 'instantly', to: 'wf-instantly' },
        { from: 'wf-instantly', to: 'recruiting' }),
      { from: 'recruiting', to: 'calendar', style: 'manual' },
      { from: 'recruiting', to: 'lifecycle', style: 'manual', label: 'partner signs' },
      { from: 'signup-form', to: 'wf-signup' },
      { from: 'wf-signup', to: 'lifecycle' },
      { from: 'lifecycle', to: 'refer-form' },
      { from: 'refer-form', to: 'wf-capture', style: 'manual', label: 'the partner registers a client' },
      { from: 'staff-form', to: 'wf-staff' },
      { from: 'wf-staff', to: 'referred' },
      { from: 'wf-capture', to: 'referred' },
      { from: 'wf-signup', to: 'am', label: 'adds the partner' },
      { from: 'am', to: 'wf-afflink' },
      { from: 'wf-capture', to: 'am', label: 'files the lead under its partner', labelWidth: 200 },
      { from: 'referred', to: 'sold', fromSide: 'bottom', toSide: 'top', style: 'manual', label: 'client signs: staff drag the deal to Sold / Enrolled', labelWidth: 330 },
      { from: 'sold', to: 'c1' },
      { from: 'c1', to: 'pending' },
      { from: 'pending', to: 'approved', style: 'manual' },
      { from: 'approved', to: 'c2' },
      { from: 'c2', to: 'paid', fromSide: 'bottom', toSide: 'right', style: 'manual', label: 'staff pay the partner' },
      { from: 'paid', to: 'c3' },
      { from: 'c3', to: 'pending', label: '30 days later, still Paid: next month opens', labelWidth: 150 },
      { from: 'c3', to: 'stop' },
    ],
  },

  // ================================================================= 2-4. PIPELINES
  {
    id: 'pl-recruiting',
    type: 'pipeline',
    kind: 'Pipeline 1 of 3',
    title: 'Partner Recruiting',
    ghlId: ID('pipelines', 'Partner Recruiting'),
    summary: 'Businesses we are recruiting as partners. A card moves right as the prospect warms up.',
    stages: [
      { title: 'New', note: 'Added, not contacted yet.' },
      { title: 'Working', note: 'First outreach sent: email or call.' },
      USES_INSTANTLY
        ? { id: 'engaged', title: 'Engaged', note: 'Instantly "interested" replies land here automatically.', setBy: 'Interested Partner Reply ({p:wf-instantly})' }
        : { id: 'engaged', title: 'Engaged', note: 'They replied and want to hear more.' },
      { title: 'Booked', note: 'Intro call booked on the Partner Intro Call calendar.' },
      { title: 'Showed', note: 'They joined the intro call.' },
      { id: 'offer', title: 'Offer Made', note: `Program offered: ${RATE}% recurring on referred clients.` },
    ],
    entries: [
      ...IF(USES_INSTANTLY,
        { to: 'engaged', type: 'action', kicker: 'Workflow', title: 'Interested Partner Reply', desc: 'Opens the deal here: one card per lead.', ref: 'wf-instantly' }),
    ],
    exits: [
      { from: 'offer', type: 'stage', kicker: 'Next pipeline', title: 'Partner Lifecycle', desc: 'When the partner signs.', ref: 'pl-lifecycle', label: 'partner signs', labelPos: 'left' },
    ],
    footnote: 'Arrows show the order of stages. A person moves the card unless a box says it happens automatically.',
  },
  {
    id: 'pl-lifecycle',
    type: 'pipeline',
    kind: 'Pipeline 2 of 3',
    title: 'Partner Lifecycle',
    ghlId: ID('pipelines', 'Partner Lifecycle'),
    summary: 'Partners after they sign. Shows who is actually sending clients.',
    stages: [
      { id: 'signed', title: 'Signed', note: 'Agreed to join the program.' },
      { id: 'onboarding', title: 'Onboarding', note: 'The Partner Sign-Up form lands partners here automatically.', setBy: 'Partner Sign-Up ({p:wf-signup})' },
      { title: 'Activated', note: 'Set up, with a personal referral link.' },
      { title: 'Producing', note: 'Sending referrals.' },
      { title: 'Dormant', note: 'Gone quiet.' },
    ],
    entries: [
      { to: 'signed', type: 'stage', kicker: 'From pipeline', title: 'Partner Recruiting', desc: 'The partner signs after the offer.', ref: 'pl-recruiting', style: 'manual' },
      { to: 'onboarding', type: 'trigger', kicker: 'Form + workflow', title: 'Partner Sign-Up', desc: 'The form runs the workflow, which opens the deal here.', ref: 'wf-signup' },
    ],
    footnote: 'Arrows show the order of stages. A person moves the card unless a box says it happens automatically.',
  },
  {
    id: 'pl-referred',
    type: 'pipeline',
    kind: 'Pipeline 3 of 3',
    title: 'Referred Leads',
    ghlId: ID('pipelines', 'Referred Leads'),
    summary: `Clients that partners refer. The last four stages run the ${RATE}% commission, once a month for as long as the client pays.`,
    perRow: 5,
    colGap: 30,
    stages: [
      { id: 'received', title: 'Referral Received', note: 'New referral. Confirm the credit, then reach out.', setBy: 'Referral Capture / Staff Attribution ({p:wf-capture}, {p:wf-staff})' },
      { title: 'Attempting Contact', note: 'Trying to reach the client.' },
      { title: 'Contacted / Nurture', note: 'Reached them; no appointment yet.' },
      { title: 'Appointment Booked', note: 'Consult scheduled.' },
      { title: 'Appointment Showed', note: 'They attended.' },
      { title: 'Qualified / Consult Completed', note: 'A good fit; move to the offer.' },
      { id: 'sold', title: 'Sold / Enrolled', note: 'The client signed.', triggers: 'Commission 1 ({p:wf-comm1}), which moves the deal on' },
      { id: 'pending', title: 'Commission Pending', note: "Staff confirm this month's payment.", setBy: 'Commission 1, then Commission 3 monthly', arrowIn: 'auto' },
      { id: 'approved', title: 'Commission Approved', note: `Client paid; ${RATE}% filled in.`, triggers: 'Commission 2 ({p:wf-comm2})' },
      { id: 'paid', title: 'Commission Paid', note: 'Partner paid for this month.', triggers: 'Commission 3 ({p:wf-comm3})' },
    ],
    loops: [
      { from: 'paid', to: 'pending', style: 'auto', label: '30 days later, Commission 3 moves the deal back to Pending: the next month starts', labelWidth: 480 },
    ],
    side: {
      label: 'Side stages: a deal can move here from the main path',
      stages: [
        { title: 'No Show / Unqualified', note: 'Missed the appointment, or not a fit.', col: 1 },
        { id: 'lost', title: 'Lost / No Sale', note: 'Did not buy, or cancelled.', flag: 'Stops the monthly commission cycle.', col: 2 },
        { id: 'review', title: 'Attribution Review', note: 'Disputed credit, which a person resolves.', setBy: 'the conflict branch ({p:wf-capture})', col: 3 },
      ],
    },
    footnote: 'A person drags the card unless a box says otherwise. Blue box = a workflow puts the deal there. Green box = the stage starts a workflow.',
  },

  // ================================================================= WORKFLOWS ("Workflow N of M" is set at the end)
  ...IF(USES_INSTANTLY, {
    id: 'wf-instantly',
    type: 'flow',
    title: 'Instantly - Interested Partner Reply',
    ghlId: ID('workflows', 'Instantly - Interested Partner Reply'),
    summary: `A prospect replies "interested" to ${CLIENT}'s cold email. GHL files it as a partner prospect and asks ${X} to reply today.`,
    layout: { nodeWidth: 370, colGap: 90 },
    steps: [
      {
        type: 'trigger', kicker: 'Trigger · inbound webhook', title: 'Instantly - lead marked interested', desc: 'Fires when someone marks a lead Interested in the Instantly Unibox. A premium trigger: a small charge per run.',
        note: [
          INSTANTLY_CONNECTED ? 'Connected: marking a lead Interested in Instantly runs this flow.' : `Not connected yet: webhooks need ${CLIENT}'s Instantly on the Hyper Growth plan.`,
          'Re-entry is on: every new interested reply runs the flow again.',
        ],
      },
      { type: 'action', title: 'Create contact', desc: 'Email ← `lead_email`; first and last name, phone; business name ← `company_name`.' },
      { type: 'action', title: 'Update contact field', desc: 'Instantly Campaign ← `campaign_name`; Next Action Date ← today.' },
      { type: 'action', title: 'Add tag', desc: '`source/instantly`, `interest/partner-program`' },
      { newColumn: true, type: 'action', title: 'Create opportunity', desc: 'Partner Recruiting → **Engaged**; name = the email; source "Instantly reply".', note: 'Duplicates are off, so a lead who replies twice keeps one card.' },
      { type: 'action', title: 'Add note', desc: 'The reply text, the campaign and the Instantly Unibox link.' },
      { type: 'task', kicker: 'Notification', title: 'Internal notification', desc: `Email to ${X}, until ${CLIENT} has its own GHL user: "New interested partner reply - act today: {email}".` },
      { type: 'task', kicker: 'Task', title: 'Add task', desc: `"Reply to {email} - interested partner". Assigned to ${X}, due the next day, weekends skipped.` },
    ],
  }),
  {
    id: 'wf-capture',
    type: 'flow',
    title: 'Referral Engine - Referral Capture',
    ghlId: ID('workflows', 'Referral Engine - Referral Capture'),
    summary: 'A partner registers a client through their personal link. The first partner to claim a client gets the credit, in the credit fields and in the Affiliate Manager.',
    layout: { nodeWidth: 240, branchWidth: 280, nestedWidth: 214, colGap: 56, branchGap: 24, gap: 20 },
    steps: [
      { type: 'trigger', kicker: 'Trigger · form submitted', title: 'Form: Refer a Client', desc: 'The partner\'s ID, name and code (the am_id) arrive as hidden fields from their link, into "Claimed" staging fields.' },
      { type: 'action', kicker: 'Update contact field', title: 'Mark as Referred Lead', desc: 'Contact Role = Referred Lead.' },
      { type: 'action', title: 'Add tag', desc: '`referred-lead`' },
      {
        newColumn: true, colWidth: 520, type: 'condition', kicker: 'If / else', title: 'First claim or already claimed?', desc: 'Is Referring Partner ID already filled in?',
        note: 'The first partner keeps the credit. Nothing is overwritten automatically.',
        branches: [
          {
            label: 'First claim', sub: 'Referring Partner ID is empty', steps: [
              { type: 'action', kicker: 'Update contact field', title: 'Record first claim', desc: 'Copies Claimed Partner ID and Name, and the Claimed Referral Code, into the real credit fields. Method = Partner Submission; Source Type = Partner; Confidence = Claimed; Referral Date = today; Evidence = the claim notes.' },
              { type: 'action', kicker: 'Add leads under an affiliate', title: 'File the lead under its partner', desc: "Custom mapping: AM ID = the lead's Referral Code (the partner's am_id)." },
              { type: 'action', kicker: 'Create opportunity', title: 'Open referred-lead deal', desc: 'Referred Leads → **Referral Received**; name = email; source "Partner referral".' },
              { type: 'task', kicker: 'Add task', title: '#1 Referral follow-up', desc: `"Contact referred lead {email} from partner {partner}". ${X}, due in 1 business day.` },
            ],
          },
          {
            label: 'None', sub: 'already claimed by someone', steps: [
              { type: 'action', title: 'Add tag', desc: '`referral-attribution-conflict`' },
              { type: 'action', kicker: 'Update contact field', title: 'Mark attribution conflicting', desc: 'Attribution Confidence = Conflicting.' },
              { type: 'task', kicker: 'Add task', title: '#2 Attribution review task', desc: `Shows both partners and 5 resolution steps. ${X}.` },
              {
                type: 'condition', kicker: 'Find opportunity', title: 'Find the referred-lead deal', desc: "Pipeline = Referred Leads AND Name = the contact's email.",
                branches: [
                  { label: 'Found', steps: [{ type: 'action', kicker: 'Update opportunity', title: 'Move deal to Attribution Review', desc: 'A person decides who gets the credit.' }] },
                  { label: 'Not found', width: 96, steps: [{ type: 'end', title: 'End' }] },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'wf-staff',
    type: 'flow',
    title: 'Referral Engine - Staff Attribution',
    ghlId: ID('workflows', 'Referral Engine - Staff Attribution'),
    summary: 'Staff log a referral that came in by email intro, phone call or walk-in.',
    banner: 'Identical to Referral Capture ({p:wf-capture}) except two things: the trigger form is **Staff Attribution**, and Method = **Staff Entered**. Highlighted boxes are the differences.',
    layout: { nodeWidth: 280, branchWidth: 280, colGap: 60, branchGap: 26, gap: 22 },
    steps: [
      { type: 'trigger', kicker: 'Trigger · form submitted', title: 'Form: Staff Attribution', desc: 'Internal form for email intros, calls and walk-ins.', diff: true },
      { type: 'action', kicker: 'Update contact field + Add tag', title: 'Mark as Referred Lead, add tag', desc: 'Contact Role = Referred Lead; tag `referred-lead`. Same as {p:wf-capture}.' },
      {
        newColumn: true, colWidth: 360, type: 'condition', kicker: 'If / else', title: 'First claim or already claimed?', desc: 'Same check as {p:wf-capture}: is Referring Partner ID already filled in?',
        note: 'The first partner keeps the credit. Nothing is overwritten automatically.',
        branches: [
          {
            label: 'First claim', sub: 'Referring Partner ID is empty', steps: [
              { type: 'action', kicker: 'Update contact field', title: 'Record first claim', desc: 'Same credit fields as {p:wf-capture}, but Method = **Staff Entered**.', diff: true },
              { type: 'action', kicker: 'Add leads under an affiliate', title: 'File the lead under its partner', desc: "Custom mapping: AM ID = the lead's Referral Code (the partner's am_id).", note: "Type the partner's Referral Code into the form, or the lead is not filed in the Affiliate Manager." },
              { type: 'action', kicker: 'Create opportunity', title: 'Open referred-lead deal', desc: 'Referred Leads → Referral Received. Same as {p:wf-capture}.' },
              { type: 'task', kicker: 'Add task', title: '#1 Referral follow-up', desc: `Same as {p:wf-capture}. ${X}, due in 1 business day.` },
            ],
          },
          {
            label: 'None', sub: 'already claimed by someone', steps: [
              { type: 'action', kicker: '4 steps, same as {p:wf-capture}', title: 'Conflict path', desc: `Tag \`referral-attribution-conflict\` · Confidence = Conflicting · #2 review task for ${X} · find the deal and move it to Attribution Review.` },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'wf-signup',
    type: 'flow',
    title: 'Referral Engine - Partner Sign-Up',
    ghlId: ID('workflows', 'Referral Engine - Partner Sign-Up'),
    summary: `A new partner signs up. GHL sets them up at ${RATE}%, gives them their personal referral link and adds them to the Affiliate Manager.`,
    layout: { nodeWidth: 400, colGap: 90 },
    steps: [
      { type: 'trigger', kicker: 'Trigger · form submitted', title: 'Form: Partner Sign-Up', desc: 'A new partner fills in the sign-up form.' },
      { type: 'action', kicker: 'Update contact field', title: 'Set up as partner', desc: `Contact Role = Referral Partner; Partner ID = the contact's ID; Reward Model = Revenue Share; Revenue Share Percent = ${RATE}; Affiliate Link = the Refer a Client form URL, prefilled with the partner's ID and name.`, note: 'A moment later the Affiliate Link workflow ({p:wf-afflink}) replaces this link with one that also carries the am_id.' },
      { type: 'action', title: 'Add tag', desc: '`referral-partner`, `partner-onboarding`' },
      { type: 'action', kicker: 'Create opportunity', title: 'Open partner deal', desc: 'Partner Lifecycle → **Onboarding**; source "Partner sign-up form".' },
      { newColumn: true, type: 'task', kicker: 'Add task', title: '#1 Onboarding task', desc: `"Onboard new referral partner: {email}", with 5 onboarding steps. ${X}, due in 1 business day.` },
      { type: 'action', kicker: 'Add to affiliate manager', title: 'Make the partner an affiliate', desc: 'Adds the contact to the Affiliate Manager as an affiliate.' },
      { type: 'action', kicker: 'Add to affiliate campaign', title: 'Add to the partner program', desc: `Campaign: **${PROGRAM}**.`, note: "Sends GHL's portal invite email and starts the Affiliate Link workflow ({p:wf-afflink}).", ref: 'affiliate' },
    ],
  },
  {
    id: 'wf-afflink',
    type: 'flow',
    title: 'Referral Engine - Affiliate Link',
    ghlId: ID('workflows', 'Referral Engine - Affiliate Link'),
    summary: 'A partner joins the affiliate campaign. GHL writes one link that feeds both systems: the credit fields read the Partner ID, the Affiliate Manager reads the am_id.',
    layout: { nodeWidth: 600 },
    steps: [
      { type: 'trigger', kicker: 'Trigger · affiliate enrolled in campaign', title: `Campaign: ${PROGRAM}`, desc: 'Fires when a partner joins the campaign. The Partner Sign-Up workflow ({p:wf-signup}) adds each new partner.' },
      { type: 'action', kicker: 'Update contact field', title: "Write the partner's affiliate link", desc: "Two fields. **Referral Code** ← their am_id. **Affiliate Link** ← GHL's affiliate referral link (the Refer a Client form + `?am_id=` their Referral ID) + `&claimed_partner_id=` their contact ID + `&claimed_partner_name=` their first and last name.", note: ['It overwrites the link that Partner Sign-Up wrote a moment earlier, which has no am_id.', `Tested ${TEST_DATE}: a test partner got their Referral Code (their am_id) and a link carrying the am_id, their Partner ID and their name.`] },
      { type: 'end', title: 'End' },
    ],
  },
  {
    id: 'wf-comm1',
    type: 'flow',
    title: 'Referral Engine - Commission 1: Sale',
    ghlId: ID('workflows', 'Referral Engine - Commission 1: Sale'),
    summary: "The referred client signed. Opens this month's commission and locks who gets the credit.",
    layout: { nodeWidth: 470 },
    steps: [
      { type: 'trigger', kicker: 'Trigger · pipeline stage changed', title: 'Referred Leads → Sold / Enrolled', desc: "Staff drag the client's deal to Sold / Enrolled." },
      { type: 'action', kicker: 'Update opportunity', title: 'Record sale, open commission', desc: 'Moves the deal to **Commission Pending**; Commission Status = Pending; Sale Date = today.' },
      { type: 'action', kicker: 'Update contact field', title: 'Lock attribution', desc: 'Attribution Lock = Locked, so no automation can change who gets the credit.' },
      { type: 'task', kicker: 'Add task', title: '#1 Approve commission task', desc: `Confirm the client paid; fill in Client Monthly Revenue and Reward Amount (${RATE}%); drag the deal to Commission Approved. ${X}.` },
    ],
  },
  {
    id: 'wf-comm2',
    type: 'flow',
    title: 'Referral Engine - Commission 2: Approved',
    ghlId: ID('workflows', 'Referral Engine - Commission 2: Approved'),
    summary: "Staff approved this month's commission. GHL records it and asks for the payout.",
    layout: { nodeWidth: 470 },
    steps: [
      { type: 'trigger', kicker: 'Trigger · pipeline stage changed', title: 'Referred Leads → Commission Approved', desc: 'Staff drag the deal here after the approval task.' },
      { type: 'action', kicker: 'Update opportunity', title: 'Record approval', desc: 'Commission Status = Approved; Commission Approval Date = today.' },
      { type: 'task', kicker: 'Add task', title: '#1 Payout task', desc: `Pay the partner through their payment preference, then drag the deal to Commission Paid. ${X}.` },
    ],
  },
  {
    id: 'wf-comm3',
    type: 'flow',
    title: 'Referral Engine - Commission 3: Paid, monthly repeat',
    ghlId: ID('workflows', 'Referral Engine - Commission 3: Paid, monthly repeat'),
    summary: 'The partner was paid. A month later the next commission opens by itself, unless the client has left.',
    layout: { nodeWidth: 430, branchWidth: 330, branchGap: 40 },
    steps: [
      { type: 'trigger', kicker: 'Trigger · pipeline stage changed', title: 'Referred Leads → Commission Paid', desc: 'Staff drag the deal here after paying the partner.' },
      { type: 'action', kicker: 'Update opportunity', title: 'Record payment', desc: 'Commission Status = Paid; Last Commission Payment Date = today.' },
      { type: 'wait', title: 'Wait 30 days', desc: 'One month between commissions.', note: `Tested ${TEST_DATE} with the wait at 1 minute. Both the repeat and the stop worked.` },
      {
        type: 'condition', kicker: 'If / else', title: 'Still a paying client?', desc: "Checks the deal's stage after the wait.",
        branches: [
          {
            label: 'Yes, still at Paid', sub: 'stage is still Commission Paid', steps: [
              { type: 'action', kicker: 'Update opportunity', title: "Open next month's commission", desc: 'Allowed to move back: stage → **Commission Pending**; Commission Status = Pending.' },
              { type: 'task', kicker: 'Add task', title: '#1 Next month approval task', desc: `"Monthly partner commission due: {email}". ${X}.` },
            ],
          },
          {
            label: 'None', sub: 'moved to Lost / No Sale or Attribution Review meanwhile', width: 230, steps: [
              { type: 'end', title: 'End', desc: 'The monthly cycle stops.' },
            ],
          },
        ],
      },
    ],
  },

  // ================================================================= AFFILIATE MANAGER
  // Read it as a snake: row 1 left to right (a partner joins), row 2 right to left (their link
  // brings in a client), row 3 left to right (where the lead shows up).
  {
    id: 'affiliate',
    type: 'map',
    kind: `Affiliate Manager · Live, tested ${TEST_DATE}`,
    title: PROGRAM,
    ghlIdLabel: 'GHL sub-account',
    ghlId: LOCATION_ID,
    summary: "GHL's built-in affiliate program, added on top of the referral engine.",
    banner: `Tested ${TEST_DATE}: a test partner signed up and got the combined link. A client referred through it was credited in the referral fields and filed under the partner here. Commissions stay in the Referred Leads cycle ({p:pl-referred}), paid by hand.`,
    grid: { cols: 4, colGap: 48, rowGap: 48 },
    nodes: [
      // row 1: a partner joins
      { id: 'page', at: [0, 0], type: 'info', kicker: 'Funnel page', title: 'Become a Partner', desc: 'A headline, one line of copy and the Partner Sign-Up form, at /become-a-partner.', note: DOMAIN_CONNECTED ? `Live on ${CLIENT}'s domain.` : `Built, not live: it goes live once ${CLIENT}'s domain is connected. The copy is DRAFT until it is approved.` },
      { id: 'signup-form', at: [0, 1], type: 'trigger', kicker: 'Form', title: 'Partner Sign-Up', desc: `A new partner fills it in. ${DOMAIN_CONNECTED ? `Live on ${CLIENT}'s domain.` : "Live today on GHL's default form domain."}`, ref: 'glance' },
      { id: 'wf-signup', at: [0, 2], type: 'action', kicker: 'Workflow', title: 'Partner Sign-Up', desc: 'Its last two steps: Add to affiliate manager, then Add to affiliate campaign.', note: "The campaign step sends GHL's invite email: the partner's login to the affiliate portal.", ref: 'wf-signup' },
      { id: 'campaign', at: [0, 3], type: 'info', kicker: 'Campaign', title: PROGRAM, desc: "In Marketing → Affiliate Manager. Links go to the Refer a Client form, plus ?am_id= the partner's Referral ID.", note: ['Pay per lead, with the amount off: no per-lead payment.', `Invite email on · cookie 365 days · payout terms ${PAYOUT_TERMS}.`] },
      // row 2: the partner's link brings in a client (right to left)
      { id: 'afflink', at: [1, 3], type: 'action', kicker: 'Workflow', title: 'Affiliate Link', desc: "Writes the partner's Affiliate Link and Referral Code onto their contact.", ref: 'wf-afflink' },
      { id: 'link', at: [1, 2], type: 'info', kicker: "On the partner's contact", title: "The partner's link", desc: 'Affiliate Link: the Refer a Client form with their am_id, Partner ID and name. Referral Code: the am_id, for example testpartnere123.', note: 'One link feeds both systems: Partner ID for the credit fields, am_id for the Affiliate Manager.' },
      { id: 'refer', at: [1, 1], type: 'trigger', kicker: 'Form', title: 'Refer a Client', desc: 'The partner registers a client through their link. The am_id fills the hidden Claimed Referral Code.', ref: 'glance' },
      { id: 'file', at: [1, 0], type: 'action', kicker: 'Referral Capture', title: 'File the lead under its partner', desc: "Add leads under an affiliate, AM ID = the lead's Referral Code. Staff Attribution ({p:wf-staff}) does the same.", note: ['First claims only: a disputed lead is filed under no one until a person decides.', "Staff Attribution: staff type the partner's Referral Code into the form."], ref: 'wf-capture' },
      // row 3: where the lead shows up
      { id: 'leads', at: [2, 0], type: 'info', kicker: 'Affiliate Manager', title: "The partner's leads", desc: 'Each lead shows under its partner in the campaign, with source Forms.' },
      { id: 'portal', at: [2, 1], type: 'info', kicker: 'Affiliate portal', title: 'What the partner sees', desc: "Their link and their leads. They log in through GHL's invite email." },
      { id: 'payouts', at: [2, 2], type: 'info', planned: true, kicker: 'Later, optional', title: 'Commissions in the portal', desc: `Needs ${CLIENT}'s Stripe and a sales campaign with a % commission. Until then the ${RATE}% runs in Referred Leads ({p:pl-referred}), paid by hand.` },
    ],
    edges: [
      { from: 'page', to: 'signup-form', style: 'manual' },
      { from: 'signup-form', to: 'wf-signup' },
      { from: 'wf-signup', to: 'campaign' },
      { from: 'campaign', to: 'afflink', label: 'partner joins' },
      { from: 'afflink', to: 'link' },
      { from: 'link', to: 'refer', style: 'manual' },
      { from: 'refer', to: 'file' },
      { from: 'file', to: 'leads' },
      { from: 'leads', to: 'portal' },
      { from: 'portal', to: 'payouts', style: 'planned' },
    ],
  },

  // ================================================================= AT A GLANCE
  {
    id: 'glance',
    type: 'cards',
    kind: 'Reference',
    title: 'Forms, calendar and tags at a glance',
    ghlIdLabel: 'GHL sub-account',
    ghlId: LOCATION_ID,
    groups: [
      {
        title: 'Forms (3)', span: 9, cols: 3,
        note: DOMAIN_CONNECTED ? `All three are on ${CLIENT}'s domain.` : `All three use GHL's default form domain for now. They can move to ${CLIENT}'s domain once it is confirmed.`,
        cards: [
          { type: 'trigger', kicker: 'Form', title: 'Refer a Client', ghlId: ID('forms', 'Refer a Client'), desc: 'The partner registers a client. Hidden fields fill from their personal link: their ID and name, and the Claimed Referral Code from `am_id`.', foot: 'Runs Referral Capture ({p:wf-capture})' },
          { type: 'trigger', kicker: 'Form', title: 'Partner Sign-Up', ghlId: ID('forms', 'Partner Sign-Up'), desc: 'A new partner signs up and gets their personal link.', note: DOMAIN_CONNECTED ? 'Also on the Become a Partner funnel page.' : `Also on the Become a Partner funnel page: built, not live until ${CLIENT}'s domain is connected.`, foot: 'Runs Partner Sign-Up ({p:wf-signup})' },
          { type: 'trigger', kicker: 'Form · internal', title: 'Staff Attribution', ghlId: ID('forms', 'Staff Attribution'), desc: 'Staff log email intros, calls and walk-ins.', note: "Type the partner's Referral Code into Claimed Referral Code, or the lead is not filed in the Affiliate Manager.", foot: 'Runs Staff Attribution ({p:wf-staff})' },
        ],
      },
      {
        title: 'Calendar (1)', span: 3, cols: 1,
        cards: [
          { type: 'info', kicker: 'Calendar', title: 'Partner Intro Call', ghlId: ID('calendars', 'Partner Intro Call'), desc: `${CALENDAR}. 10-min buffer, 2 hours' notice, up to 30 days ahead, auto-confirm.`, note: `Owner: ${X}. The ${CALENDAR_HOURS} hours and the empty meeting link are placeholders too, for ${CLIENT} to set.` },
        ],
      },
      {
        title: `Tags (${24 + SEGMENTS.length})`, span: 12, cols: 4,
        note: 'Bold tags are added by a workflow. The commission tags are not used: the monthly cycle keeps its state on the deal instead.',
        cards: [
          { type: 'info', kicker: 'Tag group · 4', title: 'source/', chips: [USES_INSTANTLY ? 'instantly*' : 'instantly', 'linkedin-outflo', 'referral', 'manual'] },
          { type: 'info', kicker: `Tag group · ${SEGMENTS.length}`, title: 'segment/', chips: SEGMENTS },
          { type: 'info', kicker: 'Tag group · 5', title: 'status/', chips: ['nurture', 'not-now', 'dnc', 'no-show', 'auto-responder'] },
          { type: 'info', kicker: 'Tag group · 1', title: 'interest/', chips: ['partner-program*'] },
          {
            type: 'info', span: 4, kicker: 'Referral engine · 14', title: 'Referral-engine tags',
            chips: ['referral-partner*', 'referred-lead*', 'referral-attribution-pending', 'referral-attribution-conflict*', 'referral-verified', 'commission-pending', 'commission-approved', 'commission-paid', 'needs-reply', 'appointment-booked', 'appointment-showed', 'sales-qualified', 'partner-onboarding*', 'partner-needs-activation'],
          },
        ],
      },
    ],
  },
];

// Number the workflow pages in print order: "Workflow 2 of 8 · Published".
const workflowPages = pages.filter((p) => p.id.startsWith('wf-'));
workflowPages.forEach((p, i) => { p.kind = `Workflow ${i + 1} of ${workflowPages.length} · Published`; });

module.exports = {
  meta: {
    title: `${CLIENT} - GHL Flowcharts`,
    client: CLIENT,
    built: `built ${BUILD_DATE}`,
    footer: `${PROGRAM} · GHL build`,
    output: 'flowcharts.html',
    pdf: 'flowcharts.pdf',
  },
  pages,
};
