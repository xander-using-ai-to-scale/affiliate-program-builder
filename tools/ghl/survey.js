// READ-ONLY inventory of a client's GHL sub-account: GET requests only, nothing is changed.
// Run it before building anything (to write down what is already there), and again after.
//
//   node tools/ghl/survey.js --client <slug>          the inventory, human-readable
//   node tools/ghl/survey.js --client <slug> --ids    the "ids" block for clients/<slug>/config.json
//   node tools/ghl/survey.js --client <slug> --json   the raw structure reads as JSON (no contacts, no deals)
//
// --ids prints only JSON on stdout (notes go to stderr), so it can be copied or redirected as is.
'use strict';
const { api, banner, client, LOC, args, loadStructure, listForms, full, run } = require('./ghl.js');

const READS = {
  location: `/locations/${LOC}`,
  users: `/users/?locationId=${LOC}`,
  pipelines: `/opportunities/pipelines?locationId=${LOC}`,
  contactFields: `/locations/${LOC}/customFields?model=contact`,
  opportunityFields: `/locations/${LOC}/customFields?model=opportunity`,
  tags: `/locations/${LOC}/tags`,
  calendars: `/calendars/?locationId=${LOC}`,
  workflows: `/workflows/?locationId=${LOC}`,
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const hhmm = (h, m) => `${String(h).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;
const optionsOf = (f) => f.picklistOptions || f.options || [];

async function readAll() {
  const out = {};
  for (const [k, p] of Object.entries(READS)) out[k] = await api('GET', p);
  return out;
}

function failed(label, r) {
  console.log(`${label}: FAILED ${r.status}\n${full(r.body)}`);
}

async function human() {
  await banner('Survey (read-only)');
  const r = await readAll();

  const loc = (r.location.body && r.location.body.location) || {};
  console.log(`time zone ${loc.timezone || '?'} · business email ${loc.email || '-'}`);

  if (r.users.ok) {
    const users = r.users.body.users || [];
    console.log(`\nusers: ${users.length}`);
    for (const u of users) console.log(`  - ${u.name} <${u.email}> id ${u.id} role ${u.roles && u.roles.type}/${u.roles && u.roles.role}`);
  } else failed('users', r.users);

  const pipes = r.pipelines.ok ? r.pipelines.body.pipelines || [] : [];
  if (r.pipelines.ok) {
    console.log(`\npipelines: ${pipes.length}`);
    for (const p of pipes) {
      const stages = (p.stages || []).slice().sort((a, b) => a.position - b.position).map((s) => s.name);
      console.log(`  - ${p.name} (${p.id}): ${stages.join(' → ')}`);
    }
  } else failed('pipelines', r.pipelines);

  const opps = await api('GET', `/opportunities/search?location_id=${LOC}&limit=100&status=all`);
  if (opps.ok) {
    const list = opps.body.opportunities || [];
    const total = (opps.body.meta && opps.body.meta.total) != null ? opps.body.meta.total : list.length;
    const byPipe = {};
    for (const o of list) {
      const n = (pipes.find((p) => p.id === o.pipelineId) || {}).name || o.pipelineId;
      byPipe[n] = (byPipe[n] || 0) + 1;
    }
    console.log(`\nopportunities (all statuses): ${total}${list.length < total ? ` (first ${list.length} read)` : ''}`);
    for (const [n, c] of Object.entries(byPipe)) console.log(`  - ${n}: ${c}`);
    for (const o of list.slice(0, 12)) console.log(`    · ${o.name} · ${o.status} · contact ${(o.contact && o.contact.name) || o.contactId}`);
  } else failed('opportunities', opps);

  for (const [model, key] of [['contact', 'contactFields'], ['opportunity', 'opportunityFields']]) {
    if (!r[key].ok) { failed(`${model} fields`, r[key]); continue; }
    const fields = r[key].body.customFields || [];
    console.log(`\ncustom fields, ${model}: ${fields.length}`);
    for (const f of fields) {
      const n = optionsOf(f).length;
      console.log(`  - ${f.name} (${f.dataType}) ${f.fieldKey} id ${f.id}${n ? ` [${n} options]` : ''}`);
    }
  }

  if (r.tags.ok) {
    const tags = (r.tags.body.tags || []).map((t) => t.name).sort();
    console.log(`\ntags: ${tags.length}: ${tags.join(', ')}`);
  } else failed('tags', r.tags);

  if (r.calendars.ok) {
    const cals = r.calendars.body.calendars || [];
    console.log(`\ncalendars: ${cals.length}`);
    for (const c of cals) {
      const hours = (c.openHours || []).map((o) => `${(o.daysOfTheWeek || []).map((d) => DAYS[d]).join('/')} ${(o.hours || []).map((h) => `${hhmm(h.openHour, h.openMinute)}-${hhmm(h.closeHour, h.closeMinute)}`).join(', ')}`).join('; ');
      const team = (c.teamMembers || []).map((t) => t.userId).join(', ');
      console.log(`  - ${c.name} (${c.id}) type ${c.calendarType} slug ${c.widgetSlug || c.slug} · ${c.slotDuration} ${c.slotDurationUnit || 'mins'} · ${hours || 'no hours'} · team ${team || '-'} · active ${c.isActive}`);
    }
  } else failed('calendars', r.calendars);

  if (r.workflows.ok) {
    const wfs = r.workflows.body.workflows || [];
    console.log(`\nworkflows: ${wfs.length}`);
    for (const w of wfs) console.log(`  - ${w.name} (${w.id}) ${w.status} v${w.version}`);
  } else failed('workflows', r.workflows);

  const forms = await listForms();
  if (forms.ok) {
    console.log(`\nforms: ${forms.body.forms.length}`);
    for (const f of forms.body.forms) console.log(`  - ${f.name} (${f.id})`);
  } else {
    console.log(`\nforms: not readable with this token (${forms.status}). List them in the GHL UI (Sites → Forms); a form's id is in its builder's address.`);
  }

  const contacts = await api('GET', `/contacts/?locationId=${LOC}&limit=100`);
  if (contacts.ok) {
    const list = contacts.body.contacts || [];
    console.log(`\ncontacts: ${(contacts.body.meta && contacts.body.meta.total) != null ? contacts.body.meta.total : list.length}`);
    for (const c of list.slice(0, 12)) console.log(`  - ${c.contactName || c.firstName || '(no name)'} <${c.email || '-'}> tags ${JSON.stringify(c.tags)}`);
  } else failed('contacts', contacts);
}

async function ids() {
  const s = loadStructure();
  await banner('Survey --ids (read-only)', { toStderr: true });
  const r = await readAll();
  for (const [k, v] of Object.entries(r)) if (!v.ok) { failed(k, v); process.exit(1); }
  const warn = (m) => console.error(`note: ${m}`);
  const pick = (list, names, what) => {
    const out = {};
    for (const n of names) {
      const hits = list.filter((x) => x.name === n);
      if (!hits.length) { warn(`${what} "${n}" is not in the account yet`); continue; }
      if (hits.length > 1) warn(`${what} "${n}" exists ${hits.length} times; the first id is used. Fix the duplicate in GHL`);
      out[n] = hits[0].id;
    }
    return out;
  };
  // The first build's token could read forms. If a token cannot, the form ids already in the config
  // are kept (each form's id is in its builder's address).
  const forms = await listForms();
  if (!forms.ok) warn(`forms are not readable with this token (${forms.status}); keeping the form ids already in the config`);
  const block = {
    pipelines: pick(r.pipelines.body.pipelines || [], s.pipelines.map((p) => p.name), 'pipeline'),
    fields: {
      contact: pick(r.contactFields.body.customFields || [], s.fields.contact.map((f) => f.name), 'contact field'),
      opportunity: pick(r.opportunityFields.body.customFields || [], s.fields.opportunity.map((f) => f.name), 'opportunity field'),
    },
    calendars: s.calendar ? pick(r.calendars.body.calendars || [], [s.calendar.name], 'calendar') : {},
    workflows: pick(r.workflows.body.workflows || [], s.workflows, 'workflow'),
    forms: forms.ok ? pick(forms.body.forms, s.forms, 'form') : client.ids.forms || {},
  };
  console.error(`Paste this into ${client.where} as "ids":`);
  console.log(JSON.stringify(block, null, 2));
}

async function raw() {
  const r = await readAll();
  console.log(JSON.stringify(Object.fromEntries(Object.entries(r).map(([k, v]) => [READS[k], v])), null, 2));
}

run(async () => {
  if (args.flags.ids) await ids();
  else if (args.flags.json) await raw();
  else await human();
});
