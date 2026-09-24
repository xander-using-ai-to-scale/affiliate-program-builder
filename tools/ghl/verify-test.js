// READ-ONLY: shows what the workflows did to one contact: its fields, tags, deals (with pipeline,
// stage and deal fields), notes and tasks. GET requests only, nothing is changed. Use it after
// every test step; it also prints each deal's id, which move-stage.js needs.
//
//   node tools/ghl/verify-test.js --client <slug> <email>
'use strict';
const { api, get, banner, die, full, client, LOC, args, run } = require('./ghl.js');

const show = (v) => JSON.stringify(v);
const oppValue = (cf) => [cf.fieldValue, cf.fieldValueString, cf.fieldValueNumber, cf.fieldValueDate, cf.fieldValueArray, cf.value].find((v) => v !== undefined && v !== null);

run(async () => {
  const email = args.positional[0];
  if (!email) die(`Usage: node tools/ghl/verify-test.js ${client.cli} <email>`);
  await banner('Verify (read-only)');
  const nameOf = {};
  for (const m of ['contact', 'opportunity']) {
    for (const f of (await get(`/locations/${LOC}/customFields?model=${m}`)).customFields || []) nameOf[f.id] = f.name;
  }

  const found = await get(`/contacts/?locationId=${LOC}&query=${encodeURIComponent(email)}`);
  const c = (found.contacts || []).find((x) => (x.email || '').toLowerCase() === email.toLowerCase());
  if (!c) die(`CONTACT NOT FOUND: ${email}`);
  // The search result carries names in lower case; the contact read by id has them as typed.
  const contact = (await get(`/contacts/${c.id}`)).contact;
  console.log(`contact ${contact.id} | ${contact.firstName || ''} ${contact.lastName || ''} | ${contact.email} | ${contact.phone || '-'} | ${contact.companyName || '-'}`);
  console.log(`tags ${show(contact.tags)}`);
  for (const cf of contact.customFields || []) console.log(`field ${nameOf[cf.id] || cf.id} = ${show(cf.value)}`);

  const pipes = (await get(`/opportunities/pipelines?locationId=${LOC}`)).pipelines || [];
  const pipeName = {};
  const stageName = {};
  for (const p of pipes) { pipeName[p.id] = p.name; for (const s of p.stages || []) stageName[s.id] = s.name; }
  const opps = (await get(`/opportunities/search?location_id=${LOC}&contact_id=${c.id}&status=all`)).opportunities || [];
  if (!opps.length) console.log('NO OPPORTUNITY');
  for (const o of opps) {
    // The detail read carries the deal's custom fields reliably; the search result is the fallback.
    const d = await api('GET', `/opportunities/${o.id}`);
    const detail = d.ok && d.body && d.body.opportunity;
    if (!detail) console.log(`(detail read failed ${d.status}: ${full(d.body)}; showing the search result)`);
    const opp = detail || o;
    console.log(`opp ${opp.id} | ${opp.name} | ${pipeName[opp.pipelineId]} / ${stageName[opp.pipelineStageId]} | ${opp.status} | source ${opp.source || '-'} | value ${opp.monetaryValue != null ? opp.monetaryValue : '-'} | assigned ${opp.assignedTo || '-'} | contact ${opp.contactId || '-'}`);
    for (const cf of opp.customFields || []) console.log(`  opp field ${nameOf[cf.id] || cf.id} = ${show(oppValue(cf))}`);
  }

  const notes = (await get(`/contacts/${c.id}/notes`)).notes || [];
  if (!notes.length) console.log('NO NOTE');
  for (const n of notes) console.log(`note ${show(n.body).slice(0, 400)}`);

  const tasks = (await get(`/contacts/${c.id}/tasks`)).tasks || [];
  if (!tasks.length) console.log('NO TASK');
  for (const t of tasks) console.log(`task ${t.title} | due ${t.dueDate} | assigned ${t.assignedTo} | completed ${t.completed} | ${show(t.body || '').slice(0, 300)}`);
});
