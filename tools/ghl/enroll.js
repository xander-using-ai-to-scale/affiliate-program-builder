// Stands in for a form when testing the referral-engine workflows. The public GHL forms carry a
// Cloudflare bot check (Turnstile), and we never work around it. So a test upserts an
// @example.com contact with exactly the fields the form writes, then enrolls that contact in the
// form's workflow over the API; the workflow runs from its first step. One real form fill by a
// person is still owed at the end of the tests.
//
// WRITES TO GHL: creates or updates an @example.com test contact and starts a workflow for it.
// It prints the account first. Field and workflow ids come from the client's config ("ids",
// written by survey.js --ids).
//
//   node tools/ghl/enroll.js --client <slug> <scenario>
//
// The scenarios, in the order the tests run them (process/8-test.md):
//   claimA    Partner A registers a new client, test.referral1@example.com: the first claim.
//   claimB    Partner B registers the same client: a second claim, which goes to Attribution Review.
//   staffC    Staff log an email introduction from partner C: test.referral2@example.com.
//   partnerD  A new partner signs up: test.partner.d@example.com.
//   partnerE  A new partner signs up and becomes an affiliate: test.partner.e@example.com.
//             Last name "PartnerE" with no space: a space breaks the name part of the link in some
//             email apps.
//   claimE    A client registers through partner E's link: test.referral3@example.com. The claim is
//             read off E's contact (Partner ID, name, Referral Code), as E's link would fill it, so
//             run it once the Affiliate Link workflow has written E's Referral Code.
// Every phone number is a fictional 555-01xx number. The referred clients carry one too, so the
// "phone-only referrals" change in spec/variants.md (deals named by phone) can be tested.
'use strict';
const {
  api, get, banner, die, full, need, client, LOC, args, loadStructure, isTestEmail, run,
} = require('./ghl.js');

// Marks a field whose test value is the first option the client's structure gives it. Used for
// every dropdown whose options can change per client: Partner Type, Partnership Type and Payment
// Preference (the standard's first option is "ACH"; a client who pays only by check may narrow
// the list, and the test must still pick a value the field accepts).
const FIRST_OPTION = Symbol('the first option of the field');

const SCENARIOS = {
  // First claim: partner A registers a new client. A gets the credit and a deal opens.
  claimA: {
    workflow: 'Referral Engine - Referral Capture',
    contact: { email: 'test.referral1@example.com', firstName: 'Test', lastName: 'Referral One', phone: '+15555550144', companyName: 'Example Bakery (TEST)' },
    fields: { 'Claimed Partner ID': 'TEST-PARTNER-A', 'Claimed Partner Name': 'Test Partner A', 'Claimed Referral Code': 'TESTA', 'Claim Notes': 'TEST - first claim, from partner A' },
  },
  // Second claim on the same client, by partner B: A keeps the credit, the deal goes to Attribution Review.
  claimB: {
    workflow: 'Referral Engine - Referral Capture',
    contact: { email: 'test.referral1@example.com', firstName: 'Test', lastName: 'Referral One', phone: '+15555550144', companyName: 'Example Bakery (TEST)' },
    fields: { 'Claimed Partner ID': 'TEST-PARTNER-B', 'Claimed Partner Name': 'Test Partner B', 'Claimed Referral Code': 'TESTB', 'Claim Notes': 'TEST - B says they sent this client too' },
  },
  // Staff log an email introduction from partner C for a new client: method Staff Entered.
  staffC: {
    workflow: 'Referral Engine - Staff Attribution',
    contact: { email: 'test.referral2@example.com', firstName: 'Test', lastName: 'Referral Two', phone: '+15555550145', companyName: 'Example Plumbing (TEST)' },
    fields: { 'Claimed Partner ID': 'TEST-PARTNER-C', 'Claimed Partner Name': 'Test Partner C', 'Claimed Referral Code': 'TESTC', 'Claim Notes': 'TEST - partner C emailed an introduction' },
  },
  // A new partner fills in the Partner Sign-Up form.
  partnerD: {
    workflow: 'Referral Engine - Partner Sign-Up',
    contact: { email: 'test.partner.d@example.com', firstName: 'Test', lastName: 'Partner D', phone: '+15555550142', companyName: 'Example Partner Co (TEST)', website: 'https://example.com' },
    fields: { 'Partner Type': FIRST_OPTION, 'Partnership Type': FIRST_OPTION, 'Partner Notes': 'TEST - who their clients are', 'Payment Preference': FIRST_OPTION },
  },
  // Affiliate Manager test: a new partner, so the sign-up also makes them an affiliate in the
  // campaign. The Affiliate Link workflow should then write their link into Affiliate Link and
  // their am_id into Referral Code.
  partnerE: {
    workflow: 'Referral Engine - Partner Sign-Up',
    contact: { email: 'test.partner.e@example.com', firstName: 'Test', lastName: 'PartnerE', phone: '+15555550143', companyName: 'Example Affiliate Co (TEST)', website: 'https://example.com' },
    fields: { 'Partner Type': FIRST_OPTION, 'Partnership Type': FIRST_OPTION, 'Partner Notes': 'TEST - Affiliate Manager test partner', 'Payment Preference': FIRST_OPTION },
  },
  // A client registered through partner E's link. The claim is read off E's contact, as the link
  // would fill it, so the lead should be credited to E and filed under E in the Affiliate Manager.
  claimE: {
    workflow: 'Referral Engine - Referral Capture',
    contact: { email: 'test.referral3@example.com', firstName: 'Test', lastName: 'Referral Three', phone: '+15555550146', companyName: 'Example Florist (TEST)' },
    fromPartner: 'test.partner.e@example.com',
    fields: { 'Claim Notes': 'TEST - registered through partner E\'s affiliate link' },
  },
};

// A claim "from a partner" copies what that partner's link carries: their Partner ID, their name
// and their am_id (kept in Referral Code by the Affiliate Link workflow).
async function claimFromPartner(email) {
  const found = await get(`/contacts/?locationId=${LOC}&query=${encodeURIComponent(email)}`);
  const hit = (found.contacts || []).find((c) => (c.email || '').toLowerCase() === email.toLowerCase());
  if (!hit) die(`Partner ${email} not found. Run their sign-up scenario first.`);
  // The search result carries names in lower case. The contact read by id has them as typed,
  // which is what the partner's link carries.
  const p = (await get(`/contacts/${hit.id}`)).contact;
  const value = (field) => ((p.customFields || []).find((f) => f.id === need('fields', field, 'contact')) || {}).value;
  const claim = {
    'Claimed Partner ID': value('Partner ID'),
    'Claimed Partner Name': [p.firstName, p.lastName].filter(Boolean).join(' '),
    'Claimed Referral Code': value('Referral Code'),
  };
  if (!claim['Claimed Partner ID'] || !claim['Claimed Referral Code']) {
    die(`Partner ${email} has no Partner ID or Referral Code yet. Wait for the Partner Sign-Up and Affiliate Link workflows to run, then try again.\n${full(claim)}`);
  }
  console.log(`claim read from ${email}: ${full(claim)}`);
  return claim;
}

run(async () => {
  const name = args.positional[0];
  const s = SCENARIOS[name];
  if (!s) die(`Usage: node tools/ghl/enroll.js ${client.cli} <scenario>\nScenarios, in order: ${Object.keys(SCENARIOS).join(', ')}`);
  if (!isTestEmail(s.contact.email)) die('Test contacts must use an @example.com address.');
  if (s.fromPartner && !isTestEmail(s.fromPartner)) die('Test partners must use an @example.com address.');
  const structure = loadStructure();
  const workflowId = need('workflows', s.workflow);

  await banner(`Enroll test "${name}" (WRITES: upserts ${s.contact.email} and starts "${s.workflow}")`);
  const fields = s.fromPartner ? { ...(await claimFromPartner(s.fromPartner)), ...s.fields } : s.fields;

  const customFields = [];
  for (const [field, raw] of Object.entries(fields)) {
    const def = structure.fields.contact.find((f) => f.name === field);
    if (!def) { console.log(`skip  "${field}": not in this client's structure`); continue; }
    const value = raw === FIRST_OPTION ? (def.options || [])[0] : raw;
    if (value === undefined) die(`"${field}" has no option to test with. Set its options in ${client.where}.`);
    if ((def.options || []).length && !def.options.includes(value)) die(`"${value}" is not an option of "${field}" for this client.`);
    customFields.push({ id: need('fields', field, 'contact'), field_value: value });
  }

  const wf = await api('GET', `/workflows/?locationId=${LOC}`);
  const live = wf.ok && ((wf.body && wf.body.workflows) || []).find((w) => w.id === workflowId);
  if (live && live.status !== 'published') console.log(`note: "${s.workflow}" is ${live.status}, not published; it may not run.`);

  const up = await api('POST', '/contacts/upsert', { locationId: LOC, ...s.contact, customFields });
  const id = up.body && up.body.contact && up.body.contact.id;
  if (!up.ok || !id) die(`upsert FAILED ${up.status}\n${full(up.body)}`);
  console.log(`upsert ${up.status} ${id} ${s.contact.email}${up.body.new === undefined ? '' : ` new=${up.body.new}`}`);

  const en = await api('POST', `/contacts/${id}/workflow/${workflowId}`, {});
  if (!en.ok) die(`enroll FAILED ${en.status}\n${full(en.body)}`);
  console.log(`enrolled in "${s.workflow}" (${en.status})`);
  console.log(`Once the workflow has run (about a minute), check it: node tools/ghl/verify-test.js ${client.cli} ${s.contact.email}`);
});
