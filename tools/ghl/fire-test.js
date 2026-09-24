// Fires one synthetic Instantly "lead_interested" payload at the client's GHL inbound webhook
// (instantly.webhookUrl in the client's config), to test the workflow "Instantly - Interested
// Partner Reply" end to end before the real Instantly webhook exists. It is also how the workflow's
// trigger gets its first sample: the trigger will not save until it has seen one request.
//
// WRITES TO GHL: the workflow creates a contact, a deal, a note, a task and an alert email.
// It prints the account first, and refuses to run when the webhook URL belongs to another location.
// The lead must use an @example.com address (reserved for examples: mail to it goes nowhere); the
// phone is a fictional 555-01xx number. The key names follow Instantly's webhook payload;
// reply_text, company_name and phone are sent as extra lead keys, whose names Instantly's docs do
// not pin down (process/7-instantly.md says how to remap them).
//
//   node tools/ghl/fire-test.js --client <slug> test.instantly1@example.com
//   Fire the same email twice to test that a repeat keeps one contact and one deal.
'use strict';
const { die, banner, client, args, isTestEmail, isPlaceholder, UA, run } = require('./ghl.js');

run(async () => {
  const url = client.instantly && client.instantly.webhookUrl;
  if (!url) die(`${client.where} has no instantly.webhookUrl: the Inbound Webhook URL from the trigger of "Instantly - Interested Partner Reply".`);
  if (isPlaceholder(url)) die(`instantly.webhookUrl in ${client.where} is still the placeholder ${url}. Copy the URL from the workflow's Inbound Webhook trigger.`);
  const email = args.positional[0];
  if (!email || !isTestEmail(email)) die(`Usage: node tools/ghl/fire-test.js ${client.cli} <name>@example.com  (test leads use @example.com only)`);
  const m = /\/hooks\/([^/]+)\//.exec(url);
  if (m && m[1] !== client.locationId) die(`Refused: the webhook URL belongs to location ${m[1]}, but ${client.where} is for location ${client.locationId}.`);
  if (!m) console.log('note: the webhook URL has no /hooks/<location id>/ part, so it cannot be matched to the config\'s location. Check it by hand.');

  await banner('Fire test (WRITES: the workflow creates a contact and a deal)');
  const payload = {
    timestamp: new Date().toISOString(),
    event_type: 'lead_interested',
    workspace: 'test',
    campaign_id: '11111111-1111-1111-1111-111111111111',
    campaign_name: 'TEST - Partner Recruiting',
    lead_email: email,
    email_account: 'sender@example.com',
    first_name: 'Test',
    last_name: 'Partner',
    company_name: 'Test Partner Co',
    website: 'example.com',
    phone: '+15555550123',
    reply_subject: 'Re: partner program',
    reply_text: 'TEST - Sounds interesting, happy to hear more about the referral program.',
    unibox_url: 'https://app.instantly.ai/app/unibox',
  };

  console.log(`POST ${url}`);
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': UA },
    body: JSON.stringify(payload),
  });
  const text = await r.text();
  console.log(r.status, text);
  if (r.status >= 300) process.exit(1);
  console.log(`Sent at ${payload.timestamp} for ${email}. Check it: node tools/ghl/verify-test.js ${client.cli} ${email}`);
});
