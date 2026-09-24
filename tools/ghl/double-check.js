// READ-ONLY PASS/FAIL check of a client's GHL build: GET requests only, nothing is changed.
// It checks the account against the client's structure (the standard structure plus the changes in
// the client's config), and checks the ids recorded in the config against the account.
// Run it after the API build, after the UI build, and at handover. Exit code 1 if anything fails.
//
//   node tools/ghl/double-check.js --client <slug>
//
// Workflows and forms show FAIL until they are built in the GHL UI; that is expected mid-build.
'use strict';
const {
  api, get, banner, client, LOC, loadStructure, structureFile, describeStructure, listForms, OPTION_TYPES, run,
} = require('./ghl.js');

let fails = 0;
const noIds = [];
const ok = (cond, msg) => { console.log(`${cond ? 'PASS' : 'FAIL'}  ${msg}`); if (!cond) fails++; };
const info = (msg) => console.log(`INFO  ${msg}`);
const sortStages = (p) => (p.stages || []).slice().sort((a, b) => a.position - b.position);
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const daysOf = (openHours) => [...new Set((openHours || []).flatMap((o) => o.daysOfTheWeek || []))].sort().map((d) => DAYS[d]).join('/');

// Compares a live item's id with the id recorded in the config; returns a problem or ''.
function idProblem(section, name, liveId, model) {
  const table = model ? (client.ids[section] || {})[model] : client.ids[section];
  const want = table && table[name];
  if (!want) { noIds.push(`${section}${model ? '.' + model : ''} "${name}"`); return ''; }
  return want === liveId ? '' : `the config says id ${want}, the account has ${liveId}`;
}

run(async () => {
  const src = structureFile();
  const s = loadStructure(client, src);
  await banner('Double-check (read-only)');
  console.log(describeStructure(src));

  // Custom fields: each exactly once, the right type, the same options, the id as recorded
  for (const model of ['contact', 'opportunity']) {
    const live = (await get(`/locations/${LOC}/customFields?model=${model}`)).customFields || [];
    for (const f of s.fields[model]) {
      const hits = live.filter((x) => x.name === f.name);
      const h = hits[0];
      const problems = [];
      if (hits.length !== 1) problems.push(`found ${hits.length} times`);
      if (h && h.dataType !== f.dataType) problems.push(`type is ${h.dataType}, expected ${f.dataType}`);
      let optionNote = '';
      if (h && OPTION_TYPES.includes(f.dataType)) {
        const got = h.picklistOptions || h.options || [];
        const want = f.options || [];
        const missing = want.filter((o) => !got.includes(o));
        const extra = got.filter((o) => !want.includes(o));
        if (missing.length) problems.push(`missing options: ${missing.join(', ')}`);
        if (extra.length) problems.push(`extra options: ${extra.join(', ')}`);
        optionNote = `, ${got.length}/${want.length} options`;
      }
      if (h) { const p = idProblem('fields', f.name, h.id, model); if (p) problems.push(p); }
      ok(!problems.length, `${model} field "${f.name}"${h ? ` ${h.dataType}${optionNote} (${h.fieldKey})` : ''}${problems.length ? ' — ' + problems.join('; ') : ''}`);
    }
    const extra = live.filter((x) => !s.fields[model].some((f) => f.name === x.name)).map((x) => x.name);
    info(`${model} fields in the account that are not in the structure: ${extra.join(', ') || 'none'}`);
  }

  // Tags
  const tags = ((await get(`/locations/${LOC}/tags`)).tags || []).map((t) => t.name);
  const missingTags = s.tags.filter((t) => !tags.includes(t));
  ok(!missingTags.length, `all ${s.tags.length} tags present${missingTags.length ? ' — missing: ' + missingTags.join(', ') : ''}`);
  info(`other tags in the account: ${tags.filter((t) => !s.tags.includes(t)).join(', ') || 'none'}`);

  // Pipelines: each exactly once, stages in the same order
  const pipes = (await get(`/opportunities/pipelines?locationId=${LOC}`)).pipelines || [];
  for (const p of s.pipelines) {
    const hits = pipes.filter((x) => x.name === p.name);
    const got = hits[0] ? sortStages(hits[0]).map((x) => x.name) : [];
    const problems = [];
    if (hits.length !== 1) problems.push(`found ${hits.length} times`);
    if (hits[0] && JSON.stringify(got) !== JSON.stringify(p.stages)) problems.push(`stages should be: ${p.stages.join(' → ')}`);
    if (hits[0]) { const q = idProblem('pipelines', p.name, hits[0].id); if (q) problems.push(q); }
    ok(!problems.length, `pipeline "${p.name}": ${got.join(' → ') || '-'}${problems.length ? ' — ' + problems.join('; ') : ''}`);
  }
  info(`all pipelines: ${pipes.map((x) => x.name).join(' | ') || 'none'}`);

  // Calendar
  if (s.calendar) {
    const cals = (await get(`/calendars/?locationId=${LOC}`)).calendars || [];
    const hits = cals.filter((c) => c.name === s.calendar.name);
    const c = hits[0];
    const problems = [];
    if (hits.length !== 1) problems.push(`found ${hits.length} times`);
    if (c) {
      if (c.slotDuration !== s.calendar.slotDuration) problems.push(`${c.slotDuration} minutes, expected ${s.calendar.slotDuration}`);
      if (daysOf(c.openHours) !== daysOf(s.calendar.openHours)) problems.push(`days ${daysOf(c.openHours)}, expected ${daysOf(s.calendar.openHours)}`);
      if ((c.widgetSlug || c.slug) !== s.calendar.slug) problems.push(`slug ${c.widgetSlug || c.slug}, expected ${s.calendar.slug}`);
      if (!c.isActive) problems.push('not active');
      const q = idProblem('calendars', s.calendar.name, c.id); if (q) problems.push(q);
    }
    ok(!problems.length, `calendar "${s.calendar.name}"${c ? `: ${c.slotDuration} min, ${daysOf(c.openHours)}, slug ${c.widgetSlug || c.slug}` : ''}${problems.length ? ' — ' + problems.join('; ') : ''}`);
    if (c) {
      const users = await api('GET', `/users/?locationId=${LOC}`);
      const nameOf = (id) => (((users.body && users.body.users) || []).find((u) => u.id === id) || {}).name || id;
      const team = (c.teamMembers || []).map((t) => nameOf(t.userId)).join(', ') || 'nobody';
      const placeholder = (c.teamMembers || []).some((t) => t.userId === client.calendarOwnerUserId);
      info(`calendar owner: ${team}${placeholder ? ' (the calendarOwnerUserId in the config; at handover it should be the client\'s user)' : ''}`);
    }
  }

  // Workflows (built in the UI): each exactly once and published
  const wfs = (await get(`/workflows/?locationId=${LOC}`)).workflows || [];
  for (const name of s.workflows) {
    const hits = wfs.filter((w) => w.name === name);
    const w = hits[0];
    const problems = [];
    if (hits.length !== 1) problems.push(`found ${hits.length} times`);
    if (w && w.status !== 'published') problems.push(`status ${w.status}`);
    if (w) { const q = idProblem('workflows', name, w.id); if (q) problems.push(q); }
    ok(!problems.length, `workflow "${name}"${w ? `: ${w.status} v${w.version}` : ''}${problems.length ? ' — ' + problems.join('; ') : ''}`);
  }
  info(`other workflows: ${wfs.filter((w) => !s.workflows.includes(w.name)).map((w) => `${w.name} [${w.status}]`).join(' | ') || 'none'}`);

  // Forms (built in the UI)
  const forms = await listForms();
  if (forms.ok) {
    for (const name of s.forms) {
      const hits = forms.body.forms.filter((f) => f.name === name);
      const problems = [];
      if (hits.length !== 1) problems.push(`found ${hits.length} times`);
      if (hits[0]) { const q = idProblem('forms', name, hits[0].id); if (q) problems.push(q); }
      ok(!problems.length, `form "${name}"${hits[0] ? ` (${hits[0].id})` : ''}${problems.length ? ' — ' + problems.join('; ') : ''}`);
    }
  } else {
    info(`forms are not readable with this token (${forms.status}); check ${s.forms.join(', ')} in the GHL UI`);
  }

  // What is in the account: deals, and any test records left
  const o = await api('GET', `/opportunities/search?location_id=${LOC}&limit=100&status=all`);
  if (o.ok) {
    const list = o.body.opportunities || [];
    const stageName = {};
    for (const p of pipes) for (const st of p.stages || []) stageName[st.id] = `${p.name} / ${st.name}`;
    info(`opportunities in the account: ${(o.body.meta && o.body.meta.total) != null ? o.body.meta.total : list.length}`);
    for (const x of list.slice(0, 20)) console.log(`      - ${x.name} · ${x.status} · ${stageName[x.pipelineStageId] || x.pipelineId}`);
  } else info(`opportunities are not readable (${o.status})`);
  const t = await api('GET', `/contacts/?locationId=${LOC}&query=example.com&limit=100`);
  if (t.ok) {
    const test = (t.body.contacts || []).map((c) => c.email || '').filter((e) => /@example\.com$/i.test(e));
    info(`test contacts (@example.com) in the account: ${test.length}${test.length ? ' — ' + test.join(', ') : ''}`);
  }

  if (noIds.length) info(`no id recorded in the config for: ${noIds.join(', ')}. Run survey.js --ids and paste the block.`);
  console.log(fails ? `\n${fails} FAIL(S)` : '\nALL CHECKS PASS');
  if (fails) process.exit(1);
});
