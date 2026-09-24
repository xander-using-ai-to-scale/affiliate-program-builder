// Builds a client's GHL structure over the API: custom fields (contact and opportunity), tags,
// pipelines and the calendar, from the standard structure (spec/structure.json) plus the client's
// changes in its config. Workflows and forms are built in the GHL UI (process/4-forms.md, 5-workflows.md).
//
// WRITES TO GHL (without --dry-run or --offline). It prints the account before it writes anything.
// Anything that already exists by name is skipped, so a re-run after a failure is safe. It never
// renames, edits or deletes, so it is also safe in an account that is already in use. Every error
// is printed in full. It stops before writing anything if the client's structure is incomplete.
//
//   node tools/ghl/build-structure.js --client <slug> --dry-run    reads the account, prints the plan, writes nothing
//   node tools/ghl/build-structure.js --client <slug>              builds
//   node tools/ghl/build-structure.js --config <path> --offline    the plan with no account at all (no token,
//                                                                  no API call): everything counts as missing.
//                                                                  Works with examples/example-seo-agency/config.json.
'use strict';
const {
  api, get, banner, die, full, client, LOC, args, offline, loadStructure, validateStructure,
  structureFile, describeStructure, run,
} = require('./ghl.js');

const DRY = !!args.flags['dry-run'] || offline;
const count = { created: 0, skipped: 0, failed: 0, planned: 0 };

async function create(label, p, body) {
  if (DRY) { count.planned++; console.log(`${label}  → would create`); return null; }
  const r = await api('POST', p, body);
  if (!r.ok) { count.failed++; console.log(`${label}  → FAILED ${r.status}\n${full(r.body)}`); return null; }
  count.created++;
  return r.body || {};
}

function skip(label, warning) {
  count.skipped++;
  console.log(`${label}  → exists, skipped${warning ? `  ⚠ ${warning}` : ''}`);
}

// What the account already has. Offline, nothing: every item is planned.
const have = async (p, key) => (offline ? [] : (await get(p))[key] || []);

run(async () => {
  const src = structureFile();
  const s = loadStructure(client, src);
  const problems = validateStructure(s, client, { offline });
  if (problems.length) die(`Nothing built. Fix ${client.where} first:\n- ${problems.join('\n- ')}`);
  if (offline) console.log(`Offline plan (no account read, no token used; everything counts as missing) · client "${client.slug}" · ${client.where}`);
  else await banner(DRY ? 'Build plan, dry run (reads only)' : 'Building structure (WRITES)');
  console.log(describeStructure(src));

  // 1. Custom fields
  for (const model of ['contact', 'opportunity']) {
    const existing = await have(`/locations/${LOC}/customFields?model=${model}`, 'customFields');
    for (const f of s.fields[model]) {
      const label = `field     ${model.padEnd(11)} ${f.name}`;
      const hit = existing.find((x) => x.name === f.name);
      if (hit) { skip(label, hit.dataType !== f.dataType ? `it is ${hit.dataType}, the structure says ${f.dataType}` : ''); continue; }
      const body = { name: f.name, dataType: f.dataType, model };
      if (f.options && f.options.length) body.options = f.options;
      const out = await create(label, `/locations/${LOC}/customFields`, body);
      if (out) { const cf = out.customField || out; console.log(`${label}  → created ${cf.fieldKey || ''} id ${cf.id || '?'}`); }
    }
  }

  // 2. Tags (GHL stores them lower case)
  const tagsHave = new Set((await have(`/locations/${LOC}/tags`, 'tags')).map((t) => t.name));
  for (const t of s.tags) {
    const label = `tag       ${t}`;
    if (tagsHave.has(t)) { skip(label); continue; }
    const out = await create(label, `/locations/${LOC}/tags`, { name: t });
    if (out) console.log(`${label}  → created`);
  }

  // 3. Pipelines
  const pipesHave = await have(`/opportunities/pipelines?locationId=${LOC}`, 'pipelines');
  for (const p of s.pipelines) {
    const label = `pipeline  ${p.name}`;
    const hit = pipesHave.find((x) => x.name === p.name);
    if (hit) {
      const got = (hit.stages || []).slice().sort((a, b) => a.position - b.position).map((x) => x.name);
      skip(label, JSON.stringify(got) !== JSON.stringify(p.stages) ? `its stages differ: ${got.join(' → ')}` : '');
      continue;
    }
    const out = await create(label, '/opportunities/pipelines', {
      locationId: LOC, name: p.name, showInFunnel: true, showInPieChart: true,
      stages: p.stages.map((name, position) => ({ name, position })),
    });
    if (out) console.log(`${label}  → created id ${(out.pipeline && out.pipeline.id) || out.id || '?'}`);
  }

  // 4. Calendar, owned by the placeholder person until the client has a GHL user
  if (s.calendar) {
    const cal = s.calendar;
    const label = `calendar  ${cal.name}`;
    const calsHave = await have(`/calendars/?locationId=${LOC}`, 'calendars');
    if (calsHave.some((c) => c.name === cal.name)) skip(label);
    else {
      // Every calendar key goes to GHL as it is, except notes: keys that start with "_".
      const settings = Object.fromEntries(Object.entries(cal).filter(([k]) => !k.startsWith('_')));
      const out = await create(label, '/calendars/', {
        ...settings,
        locationId: LOC,
        widgetSlug: cal.widgetSlug || cal.slug,
        teamMembers: [{ userId: client.calendarOwnerUserId, priority: 0.5, isPrimary: true }],
      });
      if (out) console.log(`${label}  → created id ${(out.calendar && out.calendar.id) || out.id || '?'}`);
    }
  }

  if (offline) console.log(`\nOffline plan: ${count.planned} items. Nothing was read or written. A real build also skips what the account already has.`);
  else if (DRY) console.log(`\nPlan: ${count.planned} to create, ${count.skipped} already there. Nothing was written.`);
  else console.log(`\nDone: ${count.created} created, ${count.skipped} skipped, ${count.failed} failed.`);
  if (!DRY && count.failed) console.log('Fix the errors above, then run it again: it skips what already exists.');
  if (!DRY) console.log(`Next: node tools/ghl/survey.js ${client.cli} --ids  (paste the block into the config), then double-check.js.`);
  if (count.failed) process.exit(1);
});
