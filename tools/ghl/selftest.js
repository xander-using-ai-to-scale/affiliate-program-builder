// OFFLINE self-test for tools/ghl: no network, no GHL account, no real token. Changes nothing
// outside a temporary folder, which it deletes at the end.
//
//   node tools/ghl/selftest.js            run every test; prints "N/N passed"; exit code 1 on any failure
//   node tools/ghl/selftest.js --keep     keep the temporary folder, to look at what the scripts did
//
// How it works:
//   - It makes a throwaway copy of the repo in the system's temp folder: the scripts, a stub
//     docs/REPO-SPEC.md and clients/demo/config.json.
//   - It makes a fake home folder with a fake token in .secrets/, so the real ~/.secrets is never read.
//   - It runs the real scripts as separate processes, with fetch() replaced by a fake GHL account.
//     The fake is this same file, loaded first with "node -r" while GHL_SELFTEST_MOCK is set. It
//     keeps the account in a JSON file, so what one script writes, the next one reads.
//   - It checks: config resolution (--client, --config, GHL_CLIENT), the structure merge, the
//     dry-run and offline plans, skip-if-exists, the guards (non-example emails, a token pasted as
//     tokenFile, a webhook for another location, real deals), the double-check PASS/FAIL logic, the
//     enroll scenarios, and that the token is never printed.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

// =============================================================================================
// The fake GHL account (used only inside the child processes)
// =============================================================================================
function installMock() {
  const statePath = process.env.GHL_SELFTEST_MOCK;
  const logPath = process.env.GHL_SELFTEST_LOG;
  const expected = `Bearer ${process.env.GHL_SELFTEST_TOKEN}`;
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  const log = [];
  const newId = (prefix) => `${prefix}${crypto.randomBytes(6).toString('hex')}`;
  const snake = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

  function route(method, u, body) {
    const p = u.pathname.replace(/\/+$/, '') || '/';
    const q = u.searchParams;
    const LOC = state.location.id;
    let m;
    if (u.host !== 'services.leadconnectorhq.com') return [404, { message: `mock: unknown host ${u.host}` }];
    if (method === 'POST' && /^\/hooks\/[^/]+\/webhook-trigger\/[^/]+$/.test(p)) {
      state.webhookPosts.push(body);
      return [200, { status: 'Success: request sent to trigger execution server' }];
    }
    if (method === 'GET' && p === `/locations/${LOC}`) return [200, { location: state.location }];
    if (method === 'GET' && p === '/users') return [200, { users: state.users }];
    if (method === 'GET' && p === '/opportunities/pipelines') return [200, { pipelines: state.pipelines }];
    if (p === `/locations/${LOC}/customFields`) {
      if (method === 'GET') return [200, { customFields: state.customFields.filter((f) => f.model === (q.get('model') || 'contact')) }];
      if (method === 'POST') {
        const f = { id: newId('cf'), name: body.name, model: body.model, dataType: body.dataType, fieldKey: `${body.model}.${snake(body.name)}`, picklistOptions: body.options || [] };
        state.customFields.push(f);
        return [201, { customField: f }];
      }
    }
    if (p === `/locations/${LOC}/tags`) {
      if (method === 'GET') return [200, { tags: state.tags }];
      if (method === 'POST') { const t = { id: newId('tag'), name: body.name }; state.tags.push(t); return [201, { tag: t }]; }
    }
    if (method === 'POST' && p === '/opportunities/pipelines') {
      const pl = { id: newId('pl'), name: body.name, stages: body.stages.map((s) => ({ id: newId('st'), name: s.name, position: s.position })) };
      state.pipelines.push(pl);
      return [201, { pipeline: pl }];
    }
    if (p === '/calendars') {
      if (method === 'GET') return [200, { calendars: state.calendars }];
      if (method === 'POST') { const c = { ...body, id: newId('cal') }; state.calendars.push(c); return [201, { calendar: c }]; }
    }
    if (method === 'GET' && p === '/workflows') return [200, { workflows: state.workflows }];
    if (method === 'GET' && p === '/forms') {
      const skip = Number(q.get('skip') || 0);
      const limit = Number(q.get('limit') || 10);
      return [200, { forms: state.forms.slice(skip, skip + limit), total: state.forms.length }];
    }
    if (method === 'GET' && p === '/opportunities/search') {
      const list = state.opportunities.filter((o) => !q.get('contact_id') || o.contactId === q.get('contact_id'));
      return [200, { opportunities: list, meta: { total: list.length } }];
    }
    if ((m = /^\/opportunities\/([^/]+)$/.exec(p))) {
      const o = state.opportunities.find((x) => x.id === m[1]);
      if (!o) return [404, { message: 'Opportunity not found' }];
      if (method === 'GET') return [200, { opportunity: o }];
      if (method === 'PUT') {
        if (body.pipelineId) o.pipelineId = body.pipelineId;
        if (body.pipelineStageId) o.pipelineStageId = body.pipelineStageId;
        if (body.customFields) o.customFields = body.customFields.map((cf) => ({ id: cf.id, fieldValue: cf.field_value }));
        state.puts.push({ id: o.id, body });
        return [200, { opportunity: o }];
      }
    }
    if (method === 'GET' && p === '/contacts') {
      const query = (q.get('query') || '').toLowerCase();
      // Like GHL's search: the names come back in lower case.
      const list = state.contacts
        .filter((c) => !query || (c.email || '').toLowerCase().includes(query))
        .map((c) => ({ ...c, firstName: (c.firstName || '').toLowerCase(), lastName: (c.lastName || '').toLowerCase() }));
      return [200, { contacts: list, meta: { total: list.length } }];
    }
    if (method === 'POST' && p === '/contacts/upsert') {
      let c = state.contacts.find((x) => (x.email || '').toLowerCase() === String(body.email || '').toLowerCase());
      const isNew = !c;
      if (!c) { c = { id: newId('ct'), email: body.email, tags: [], customFields: [] }; state.contacts.push(c); }
      for (const k of ['firstName', 'lastName', 'phone', 'companyName', 'website']) if (body[k] !== undefined) c[k] = body[k];
      for (const cf of body.customFields || []) {
        const i = c.customFields.findIndex((x) => x.id === cf.id);
        const v = { id: cf.id, value: cf.field_value };
        if (i >= 0) c.customFields[i] = v; else c.customFields.push(v);
      }
      state.upserts.push(body);
      return [isNew ? 201 : 200, { new: isNew, contact: c }];
    }
    if (method === 'POST' && (m = /^\/contacts\/([^/]+)\/workflow\/([^/]+)$/.exec(p))) {
      state.enrollments.push({ contactId: m[1], workflowId: m[2] });
      return [200, { succeded: true }];
    }
    if (method === 'GET' && (m = /^\/contacts\/([^/]+)\/(notes|tasks)$/.exec(p))) return [200, { [m[2]]: [] }];
    if (method === 'GET' && (m = /^\/contacts\/([^/]+)$/.exec(p))) {
      const c = state.contacts.find((x) => x.id === m[1]);
      return c ? [200, { contact: c }] : [404, { message: 'Contact not found' }];
    }
    return [404, { message: `mock: no route for ${method} ${p}` }];
  }

  globalThis.fetch = async (url, opts = {}) => {
    const u = new URL(url);
    const method = (opts.method || 'GET').toUpperCase();
    const h = opts.headers || {};
    const header = (k) => { const key = Object.keys(h).find((x) => x.toLowerCase() === k.toLowerCase()); return key ? h[key] : undefined; };
    const body = opts.body ? JSON.parse(opts.body) : undefined;
    const auth = header('Authorization');
    // The log never holds the token: only whether it was right.
    log.push({ method, host: u.host, path: u.pathname, ua: header('User-Agent') || null, auth: auth === undefined ? 'none' : auth === expected ? 'ok' : 'wrong', body });
    const [status, json] = route(method, u, body);
    return new Response(JSON.stringify(json), { status, headers: { 'Content-Type': 'application/json' } });
  };
  process.on('exit', () => {
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
    fs.writeFileSync(logPath, log.map((x) => JSON.stringify(x)).join('\n'));
  });
}

// =============================================================================================
// The tests
// =============================================================================================
function main() {
  const G = require('./ghl.js');
  const KEEP = process.argv.includes('--keep');
  const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'ghl-selftest-'));
  const REPO = path.join(TMP, 'repo');
  const HOME = path.join(TMP, 'home');
  const STATE = path.join(TMP, 'account.json');
  const LOG = path.join(TMP, 'requests.jsonl');
  const LOC = 'LOCselftest000000001';
  const OWNER = 'USERselftest00000001';
  const WEBHOOK = `https://services.leadconnectorhq.com/hooks/${LOC}/webhook-trigger/00000000-0000-4000-8000-000000000001`;
  const TOKEN_FILE = 'Selftest GHL Token.txt';
  const FAKE_TOKEN = ['selftest', 'token', crypto.randomBytes(12).toString('hex')].join('-'); // never a real token
  const TOKENISH = ['pit', crypto.randomUUID()].join('-'); // what a pasted token looks like
  const OUTPUTS = [];
  const REQUESTS = [];
  let passed = 0;
  let failed = 0;

  const check = (name, cond, detail) => {
    const n = passed + failed + 1;
    if (cond) { passed++; console.log(`ok    ${String(n).padStart(2)}  ${name}`); return true; }
    failed++;
    console.log(`FAIL  ${String(n).padStart(2)}  ${name}`);
    if (detail !== undefined) console.log(`          ${String(detail).split('\n').slice(0, 25).join('\n          ')}`);
    return false;
  };
  const test = (name, fn) => {
    try { const r = fn(); if (r !== true && r !== false) check(name, false, `the test returned ${r}`); } catch (e) { check(name, false, e.stack || e.message); }
  };
  const throws = (fn, re) => { try { fn(); return `did not refuse`; } catch (e) { return re.test(e.message) ? true : `wrong message: ${e.message}`; } };
  const writeJson = (file, v) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(v, null, 2)); return file; };
  const copy = (v) => JSON.parse(JSON.stringify(v));

  // ---- the sandbox repo, the fake home, the demo client -----------------------------------
  fs.mkdirSync(path.join(REPO, 'tools', 'ghl'), { recursive: true });
  for (const f of fs.readdirSync(__dirname)) {
    if (/\.(js|json)$/.test(f) && f !== 'selftest.js') fs.copyFileSync(path.join(__dirname, f), path.join(REPO, 'tools', 'ghl', f));
  }
  fs.mkdirSync(path.join(REPO, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(REPO, 'docs', 'REPO-SPEC.md'), '# A stub, so the scripts find this folder as the repo root.\n');
  fs.mkdirSync(path.join(HOME, '.secrets'), { recursive: true });
  fs.writeFileSync(path.join(HOME, '.secrets', TOKEN_FILE), `${FAKE_TOKEN}\n`);

  const PARTNER_TYPES = ['Web Design Agency', 'Marketing Consultant', 'Other'];
  const SEGMENTS = ['segment/web-design', 'segment/marketing', 'segment/other'];
  const demoConfig = {
    client: 'Example SEO Agency',
    locationId: LOC,
    tokenFile: TOKEN_FILE,
    calendarOwnerUserId: OWNER,
    instantly: { webhookUrl: WEBHOOK },
    structure: {
      fields: { contact: [{ name: 'Partner Type', dataType: 'SINGLE_OPTIONS', options: PARTNER_TYPES }] },
      tags: SEGMENTS,
      calendar: { slug: 'example-seo-agency-partner-intro-call', description: 'A 20-minute intro call with a prospective referral partner for the Example SEO Partner Program.' },
    },
    ids: {},
  };
  const DEMO = writeJson(path.join(REPO, 'clients', 'demo', 'config.json'), demoConfig);
  const ELSEWHERE = path.join(TMP, 'elsewhere');

  const emptyAccount = () => ({
    location: { id: LOC, name: 'Example SEO Agency (selftest account)', timezone: 'America/New_York', email: 'owner@example.com' },
    users: [{ id: OWNER, name: 'Test Operator', email: 'operator@example.com', roles: { type: 'account', role: 'admin' } }],
    customFields: [], tags: [], pipelines: [], calendars: [], workflows: [], forms: [], contacts: [], opportunities: [],
    upserts: [], enrollments: [], puts: [], webhookPosts: [],
  });

  // Runs a script of the sandbox repo as its own process, against the fake account.
  // `account` replaces the fake account first; without it, the last run's account carries on.
  const runScript = (script, args, { account, env = {} } = {}) => {
    if (account) writeJson(STATE, account);
    fs.writeFileSync(LOG, '');
    const childEnv = { ...process.env, HOME, USERPROFILE: HOME, GHL_SELFTEST_MOCK: STATE, GHL_SELFTEST_LOG: LOG, GHL_SELFTEST_TOKEN: FAKE_TOKEN };
    delete childEnv.GHL_CLIENT;
    Object.assign(childEnv, env);
    const r = spawnSync(process.execPath, ['-r', __filename, path.join(REPO, 'tools', 'ghl', script), ...args], { cwd: REPO, env: childEnv, encoding: 'utf8', timeout: 60000 });
    const text = fs.existsSync(LOG) ? fs.readFileSync(LOG, 'utf8') : '';
    const log = text.split('\n').filter(Boolean).map((l) => JSON.parse(l));
    const res = { code: r.status, stdout: r.stdout || '', stderr: r.stderr || '', log, state: JSON.parse(fs.readFileSync(STATE, 'utf8')) };
    res.out = res.stdout + res.stderr;
    res.writes = log.filter((x) => x.method !== 'GET');
    OUTPUTS.push(res.out);
    REQUESTS.push(...log);
    return res;
  };
  const show = (res) => `exit ${res.code}\n${res.out.trim()}`;

  // The standard structure's size (REPO-SPEC §4) plus the demo client's changes.
  const STD = { contact: 29, opportunity: 7, tags: 24, pipelines: 3, workflows: 8, forms: 3 };
  const PLAN = STD.contact + STD.opportunity + STD.tags + SEGMENTS.length + STD.pipelines + 1; // + 1 calendar

  try {
    console.log(`tools/ghl selftest · sandbox ${TMP}\n`);

    // ---- plain functions (ghl.js) ----------------------------------------------------------
    test('parseArgs reads --client, flags, --flag=value and positionals', () => {
      const a = G.parseArgs(['--client', 'demo', '--dry-run', '--x=1', 'pos1', 'Sold / Enrolled']);
      const b = G.parseArgs(['--config=a/b.json']);
      return check('parseArgs reads --client, flags, --flag=value and positionals',
        a.client === 'demo' && a.flags['dry-run'] === true && a.flags.x === '1' && a.positional.join('|') === 'pos1|Sold / Enrolled' && b.config === 'a/b.json',
        JSON.stringify({ a, b }));
    });
    test('parseArgs refuses --client with no value', () => check('parseArgs refuses --client with no value', throws(() => G.parseArgs(['--client']), /needs a value/) === true));
    test('the repo root is the folder with docs/REPO-SPEC.md', () => check('the repo root is the folder with docs/REPO-SPEC.md',
      G.findRepoRoot(path.join(REPO, 'tools', 'ghl')) === REPO && G.findRepoRoot(TMP) === null && G.ROOT !== null));
    test('--client <slug> reads clients/<slug>/config.json', () => {
      const r = G.resolveConfig({ client: 'demo' }, {}, REPO);
      return check('--client <slug> reads clients/<slug>/config.json', r.file === DEMO && r.slug === 'demo' && r.cli === '--client demo', JSON.stringify(r));
    });
    test('GHL_CLIENT stands in for --client', () => check('GHL_CLIENT stands in for --client', G.resolveConfig({}, { GHL_CLIENT: 'demo' }, REPO).file === DEMO));
    test('--config <path> reads any file; the slug comes from its folder or name', () => {
      const a = G.resolveConfig({ config: DEMO }, {}, REPO);
      const other = writeJson(path.join(ELSEWHERE, 'acme.json'), { ...demoConfig });
      const b = G.resolveConfig({ config: other }, {}, null);
      return check('--config <path> reads any file; the slug comes from its folder or name', a.slug === 'demo' && b.slug === 'acme' && b.file === other, JSON.stringify({ a, b }));
    });
    test('--client and --config together are refused', () => check('--client and --config together are refused', throws(() => G.resolveConfig({ client: 'demo', config: DEMO }, {}, REPO), /not both/) === true));
    test('a slug with a path in it is refused', () => check('a slug with a path in it is refused', throws(() => G.resolveConfig({ client: '../evil' }, {}, REPO), /lowercase letters/) === true));
    test('an unknown client is refused and the known ones are listed', () => {
      const r = throws(() => G.resolveConfig({ client: 'nosuch' }, {}, REPO), /No config at clients\/nosuch\/config\.json.*demo/);
      return check('an unknown client is refused and the known ones are listed', r === true, r);
    });
    test('a copied client-config.json is caught: rename it to config.json', () => {
      writeJson(path.join(REPO, 'clients', 'copied', 'client-config.json'), demoConfig);
      const r = throws(() => G.resolveConfig({ client: 'copied' }, {}, REPO), /Rename it to config\.json/);
      fs.rmSync(path.join(REPO, 'clients', 'copied'), { recursive: true, force: true });
      return check('a copied client-config.json is caught: rename it to config.json', r === true, r);
    });
    test('looksLikeToken spots tokens and passes file names', () => {
      const jwt = ['eyJhbGciOiJIUzI1NiJ9', 'eyJzdWIiOiJ4In0', 'c2lnbmF0dXJl'].join('.');
      return check('looksLikeToken spots tokens and passes file names',
        G.looksLikeToken(TOKENISH) && G.looksLikeToken(jwt) && G.looksLikeToken('x'.repeat(41)) && !G.looksLikeToken('Example GHL Token.txt') && !G.looksLikeToken('<TOKEN_FILE>'));
    });
    test('a token pasted as tokenFile is refused, even offline', () => {
      const f = writeJson(path.join(ELSEWHERE, 'leaky.json'), { ...demoConfig, tokenFile: TOKENISH });
      const a = throws(() => G.loadConfig(f), /looks like a token/);
      const b = throws(() => G.loadConfig(f, {}, { account: false }), /looks like a token/);
      return check('a token pasted as tokenFile is refused, even offline', a === true && b === true, `${a} / ${b}`);
    });
    test('a tokenFile that is a path is refused', () => {
      const a = throws(() => G.loadConfig(writeJson(path.join(ELSEWHERE, 'p1.json'), { ...demoConfig, tokenFile: '../secrets/x.txt' })), /not a path/);
      const b = throws(() => G.loadConfig(writeJson(path.join(ELSEWHERE, 'p2.json'), { ...demoConfig, tokenFile: 'sub\\x.txt' })), /not a path/);
      return check('a tokenFile that is a path is refused', a === true && b === true, `${a} / ${b}`);
    });
    test('placeholders in the config are refused for account work, allowed offline', () => {
      const f = writeJson(path.join(ELSEWHERE, 'template-like.json'), { ...demoConfig, locationId: '<LOCATION_ID>', tokenFile: '<TOKEN_FILE>' });
      const a = throws(() => G.loadConfig(f), /still the placeholder <LOCATION_ID>/);
      let b;
      try { b = G.loadConfig(f, {}, { account: false }).locationId === '<LOCATION_ID>'; } catch (e) { b = e.message; }
      return check('placeholders in the config are refused for account work, allowed offline', a === true && b === true, `${a} / ${b}`);
    });
    test('a config without locationId is refused', () => {
      const { locationId, ...rest } = demoConfig;
      const r = throws(() => G.loadConfig(writeJson(path.join(ELSEWHERE, 'noloc.json'), rest)), /"locationId" is missing/);
      return check('a config without locationId is refused', r === true && !!locationId, r);
    });

    const fallback = { file: G.DEFAULT_STRUCTURE, fallback: true };
    test('the standard structure: 29 + 7 fields, 24 tags, 3 pipelines, the calendar, 8 workflows, 3 forms', () => {
      const s = G.loadStructure({}, fallback);
      const days = [...new Set(s.calendar.openHours.flatMap((o) => o.daysOfTheWeek))].join(',');
      const ok = s.fields.contact.length === STD.contact && s.fields.opportunity.length === STD.opportunity && s.tags.length === STD.tags &&
        s.pipelines.map((p) => p.stages.length).join(',') === '6,5,13' && s.calendar.name === 'Partner Intro Call' && s.calendar.slotDuration === 20 && days === '1,2' &&
        s.workflows.length === STD.workflows && s.workflows.includes('Referral Engine - Affiliate Link') && s.forms.join('|') === 'Refer a Client|Partner Sign-Up|Staff Attribution';
      return check('the standard structure: 29 + 7 fields, 24 tags, 3 pipelines, the calendar, 8 workflows, 3 forms', ok,
        JSON.stringify({ contact: s.fields.contact.length, opportunity: s.fields.opportunity.length, tags: s.tags.length, workflows: s.workflows, forms: s.forms }));
    });
    test('spec/structure.json and the fallback copy agree', () => {
      const spec = G.ROOT && path.join(G.ROOT, 'spec', 'structure.json');
      if (!spec || !fs.existsSync(spec)) return check('spec/structure.json and the fallback copy agree (spec/structure.json not written yet: the fallback is in use)', true);
      const diff = structureDiff(G.loadStructure({}, { file: spec, fallback: false }), G.loadStructure({}, fallback));
      return check('spec/structure.json and the fallback copy agree', !diff.length, `They differ. Make tools/ghl/structure.default.json match spec/structure.json:\n${diff.join('\n')}`);
    });
    test('merge: same name replaces, new name adds, remove drops, tags and lists do not double', () => {
      const s = G.loadStructure({ structure: {
        remove: { fields: ['Instantly Campaign'], tags: ['source/instantly'], workflows: ['Instantly - Interested Partner Reply'] },
        fields: { contact: [{ name: 'Partner Type', dataType: 'SINGLE_OPTIONS', options: ['A', 'B'] }, { name: 'Loan Amount', dataType: 'MONETORY' }] },
        tags: ['segment/a', 'referral-partner'],
        pipelines: [{ name: 'Referred Leads', stages: ['Received', 'Funded'] }, { name: 'Brokers', stages: ['New'] }],
        calendar: { slug: 'x-partner-intro-call', slotDuration: 30 },
        workflows: ['Custom Workflow'],
        forms: ['Broker Application'],
      } }, fallback);
      const c = s.fields.contact;
      const ok = !c.some((f) => f.name === 'Instantly Campaign') && c.find((f) => f.name === 'Partner Type').options.join() === 'A,B' &&
        c[c.length - 1].name === 'Loan Amount' && c.length === STD.contact && s.tags.includes('segment/a') && !s.tags.includes('source/instantly') &&
        s.tags.filter((t) => t === 'referral-partner').length === 1 && s.tags.length === STD.tags &&
        s.pipelines.find((p) => p.name === 'Referred Leads').stages.join() === 'Received,Funded' && s.pipelines.length === 4 &&
        s.calendar.name === 'Partner Intro Call' && s.calendar.slotDuration === 30 && s.calendar.slug === 'x-partner-intro-call' &&
        !s.workflows.includes('Instantly - Interested Partner Reply') && s.workflows.includes('Custom Workflow') && s.forms.length === 4;
      return check('merge: same name replaces, new name adds, remove drops, tags and lists do not double', ok, JSON.stringify({ tags: s.tags.length, pipelines: s.pipelines.map((p) => p.name), workflows: s.workflows }));
    });
    test('merge: "calendar": null means no calendar', () => check('merge: "calendar": null means no calendar', G.loadStructure({ structure: { calendar: null } }, fallback).calendar === null));
    test('validation: the standard structure alone is incomplete (partner types, calendar slug, owner)', () => {
      const p = G.validateStructure(G.loadStructure({}, fallback), { where: 'x' });
      const ok = p.some((x) => /Partner Type" has no options/.test(x)) && p.some((x) => /calendar has no slug/.test(x)) && p.some((x) => /calendarOwnerUserId/.test(x));
      return check('validation: the standard structure alone is incomplete (partner types, calendar slug, owner)', ok, p.join('\n'));
    });
    test('validation: the demo config is complete', () => {
      const p = G.validateStructure(G.loadStructure(demoConfig, fallback), demoConfig);
      return check('validation: the demo config is complete', !p.length, p.join('\n'));
    });
    test('validation: upper-case tags and leftover placeholders are problems; offline needs no owner', () => {
      const cfg = copy(demoConfig);
      cfg.structure.tags = ['segment/Web-Design', 'segment/<SEGMENT_1>'];
      cfg.structure.fields.contact[0].options = ['<PARTNER_TYPE_1>', 'Other'];
      const p = G.validateStructure(G.loadStructure(cfg, fallback), cfg);
      const off = { ...demoConfig, calendarOwnerUserId: '<PLACEHOLDER_USER_ID>' };
      const p2 = G.validateStructure(G.loadStructure(off, fallback), off, { offline: true });
      const ok = p.some((x) => /segment\/Web-Design.*lower case/.test(x)) && p.some((x) => /<SEGMENT_1>/.test(x)) && p.some((x) => /<PARTNER_TYPE_1>/.test(x)) && !p2.length;
      return check('validation: upper-case tags and leftover placeholders are problems; offline needs no owner', ok, `${p.join('\n')}\n-- offline: ${p2.join('\n')}`);
    });
    test('isTestEmail accepts only @example.com', () => {
      const yes = ['test.referral1@example.com', 'A@EXAMPLE.COM'].every(G.isTestEmail);
      const no = ['x@example.com.evil.test', 'x@notexample.com', 'x@sub.example.com', 'example.com', '', 'a b@example.com'].some(G.isTestEmail);
      return check('isTestEmail accepts only @example.com', yes && !no);
    });
    test('findPlaceholders skips notes (keys that start with _)', () => {
      const hits = G.findPlaceholders({ _readme: 'use <CLIENT_SLUG>', a: { b: ['<X_1>', 'fine'] }, c: 'ok {{contact.name}}' });
      return check('findPlaceholders skips notes (keys that start with _)', hits.length === 1 && hits[0].path === 'a.b[0]', JSON.stringify(hits));
    });
    test('templates/client-config.json: valid JSON with every section, refused unfilled, clean once filled', () => {
      const file = G.ROOT && path.join(G.ROOT, 'templates', 'client-config.json');
      if (!file || !fs.existsSync(file)) return check('templates/client-config.json exists', false, 'missing');
      const text = fs.readFileSync(file, 'utf8');
      const t = JSON.parse(text);
      const sections = t._readme && t.client && t.locationId && t.tokenFile && t.calendarOwnerUserId && t.instantly && t.instantly._readme && t.instantly.webhookUrl &&
        t.structure && t.structure._readme && t.structure.fields.contact.some((f) => f.name === 'Partner Type') && t.structure.tags.length && t.structure.calendar.slug &&
        t.structure.calendar.description && t.ids && t.ids._readme && t.ids.pipelines && t.ids.fields.contact && t.ids.fields.opportunity && t.ids.calendars && t.ids.workflows && t.ids.forms;
      const unfilled = throws(() => G.loadConfig(file), /still the placeholder/);
      const fills = {
        '<CLIENT_NAME>': 'Example SEO Agency', '<LOCATION_ID>': LOC, '<TOKEN_FILE>': TOKEN_FILE, '<PLACEHOLDER_USER_ID>': OWNER, '<PLACEHOLDER_USER>': 'the operator',
        '<INSTANTLY_WEBHOOK_URL>': WEBHOOK, '<PARTNER_TYPE_1>': 'Web Design Agency', '<PARTNER_TYPE_2>': 'Marketing Consultant',
        '<SEGMENT_1>': 'web-design', '<SEGMENT_2>': 'marketing', '<CLIENT_SLUG>': 'example-seo-agency', '<PROGRAM_NAME>': 'Example SEO Partner Program',
      };
      let filledText = text;
      for (const [k, v] of Object.entries(fills)) filledText = filledText.split(k).join(v);
      const left = [...new Set(G.findPlaceholders(JSON.parse(filledText)).map((h) => h.value))];
      const filledFile = path.join(TMP, 'filled', 'config.json');
      fs.mkdirSync(path.dirname(filledFile), { recursive: true });
      fs.writeFileSync(filledFile, filledText);
      let problems;
      try { const cfg = G.loadConfig(filledFile); problems = G.validateStructure(G.loadStructure(cfg, fallback), cfg); } catch (e) { problems = [e.message]; }
      return check('templates/client-config.json: valid JSON with every section, refused unfilled, clean once filled',
        !!sections && unfilled === true && !left.length && !problems.length,
        `sections ${!!sections} · unfilled refused: ${unfilled} · placeholders the selftest does not know: ${left.join(', ') || 'none'} · problems once filled: ${problems.join('; ') || 'none'}`);
    });

    // ---- the scripts, run against the fake account -----------------------------------------
    let r = runScript('survey.js', ['--client', 'demo'], { account: emptyAccount() });
    check('survey --client demo: the banner names the account first, and it only reads',
      r.code === 0 && /^Survey \(read-only\) · client "demo" · Example SEO Agency \(selftest account\) \(LOCselftest000000001\)/.test(r.stdout) && !r.writes.length && r.log[0].path === `/locations/${LOC}`, show(r));
    r = runScript('survey.js', [], { env: { GHL_CLIENT: 'demo' } });
    check('GHL_CLIENT=demo works in place of --client', r.code === 0 && /client "demo"/.test(r.stdout), show(r));
    r = runScript('survey.js', ['--config', path.join(ELSEWHERE, 'acme.json')]);
    check('--config <path> works for a config outside clients/', r.code === 0 && /client "acme"/.test(r.stdout), show(r));
    r = runScript('survey.js', ['--client', 'nosuch']);
    check('an unknown client stops the script before any request', r.code === 1 && /No config at clients\/nosuch\/config\.json/.test(r.stderr) && /demo/.test(r.stderr) && !r.log.length, show(r));
    r = runScript('survey.js', ['--config', path.join(ELSEWHERE, 'leaky.json')]);
    check('a token pasted as tokenFile stops the script before any request', r.code === 1 && /looks like a token/.test(r.stderr) && !r.log.length, show(r));
    writeJson(path.join(ELSEWHERE, 'notoken.json'), { ...demoConfig, tokenFile: 'Missing Token.txt' });
    r = runScript('survey.js', ['--config', path.join(ELSEWHERE, 'notoken.json')]);
    check('a missing token file stops the script before any request', r.code === 1 && /Token file not found: ~\/\.secrets\/Missing Token\.txt/.test(r.stderr) && !r.log.length, show(r));

    const incomplete = copy(demoConfig);
    delete incomplete.structure.fields;
    writeJson(path.join(ELSEWHERE, 'incomplete.json'), incomplete);
    r = runScript('build-structure.js', ['--config', path.join(ELSEWHERE, 'incomplete.json')], { account: emptyAccount() });
    check('build-structure refuses an incomplete structure before any request', r.code === 1 && /Nothing built/.test(r.stderr) && /Partner Type" has no options/.test(r.stderr) && !r.log.length, show(r));

    r = runScript('build-structure.js', ['--client', 'demo', '--dry-run'], { account: emptyAccount() });
    const firstPlan = r.stdout.split('\n').findIndex((l) => /would create/.test(l));
    const bannerAt = r.stdout.split('\n').findIndex((l) => /^Build plan, dry run \(reads only\) · client "demo"/.test(l));
    check(`dry run on an empty account: ${PLAN} to create, nothing written, the banner first`,
      r.code === 0 && new RegExp(`Plan: ${PLAN} to create, 0 already there\\. Nothing was written\\.`).test(r.stdout) && !r.writes.length && bannerAt >= 0 && bannerAt < firstPlan, show(r));
    check('without spec/structure.json the fallback is used, and the scripts say so', /structure\.default\.json \(the fallback: spec\/structure\.json is missing\)/.test(r.stdout), show(r));

    const specStructure = JSON.parse(fs.readFileSync(G.DEFAULT_STRUCTURE, 'utf8'));
    specStructure.tags.push('selftest-extra-tag');
    writeJson(path.join(REPO, 'spec', 'structure.json'), specStructure);
    r = runScript('build-structure.js', ['--client', 'demo', '--dry-run'], { account: emptyAccount() });
    fs.rmSync(path.join(REPO, 'spec'), { recursive: true, force: true });
    check('spec/structure.json, when present, wins over the fallback', r.code === 0 && /Standard structure: spec\/structure\.json/.test(r.stdout) && /tag +selftest-extra-tag +→ would create/.test(r.stdout) && new RegExp(`Plan: ${PLAN + 1} to create`).test(r.stdout), show(r));

    writeJson(path.join(ELSEWHERE, 'example-like.json'), { ...demoConfig, locationId: '<LOCATION_ID>', tokenFile: '<TOKEN_FILE>', calendarOwnerUserId: '<PLACEHOLDER_USER_ID>' });
    r = runScript('build-structure.js', ['--config', path.join(ELSEWHERE, 'example-like.json'), '--offline'], { account: emptyAccount() });
    check('--offline plans from a config with placeholder ids, with no token and no request', r.code === 0 && new RegExp(`Offline plan: ${PLAN} items`).test(r.stdout) && !r.log.length, show(r));

    const partial = emptyAccount();
    partial.customFields.push({ id: 'cfPartnerId', name: 'Partner ID', model: 'contact', dataType: 'TEXT', fieldKey: 'contact.partner_id', picklistOptions: [] });
    partial.customFields.push({ id: 'cfLostReason', name: 'Lost Reason', model: 'contact', dataType: 'TEXT', fieldKey: 'contact.lost_reason', picklistOptions: [] });
    partial.tags.push({ id: 'tagRP', name: 'referral-partner' });
    partial.pipelines.push({ id: 'plLife', name: 'Partner Lifecycle', stages: [{ id: 'st1', name: 'Signed', position: 0 }, { id: 'st2', name: 'Active', position: 1 }] });
    partial.calendars.push({ id: 'calOld', name: 'Partner Intro Call', slotDuration: 30, openHours: [], widgetSlug: 'old-slug', isActive: true });
    r = runScript('build-structure.js', ['--client', 'demo'], { account: partial });
    const kept = r.state.customFields.find((f) => f.id === 'cfLostReason');
    check(`build on a partly built account: ${PLAN - 5} created, 5 skipped, nothing edited or deleted`,
      r.code === 0 && new RegExp(`Done: ${PLAN - 5} created, 5 skipped, 0 failed\\.`).test(r.stdout) && r.writes.length === PLAN - 5 && r.writes.every((x) => x.method === 'POST') &&
      kept.dataType === 'TEXT' && r.state.pipelines.find((p) => p.id === 'plLife').stages.length === 2 && r.state.calendars.length === 1 && r.log[0].path === `/locations/${LOC}`, show(r));
    check('existing items with another type or other stages are flagged, not changed', /Lost Reason +→ exists, skipped +⚠ it is TEXT, the structure says SINGLE_OPTIONS/.test(r.stdout) && /Partner Lifecycle +→ exists, skipped +⚠ its stages differ: Signed → Active/.test(r.stdout), show(r));
    r = runScript('build-structure.js', ['--client', 'demo']);
    check('a second build run creates nothing (skip-if-exists)', r.code === 0 && new RegExp(`Done: 0 created, ${PLAN} skipped, 0 failed\\.`).test(r.stdout) && !r.writes.length, show(r));

    // A complete account: build on an empty account, then add the UI-built workflows and forms.
    r = runScript('build-structure.js', ['--client', 'demo'], { account: emptyAccount() });
    const complete = r.state;
    const std = G.loadStructure({}, fallback);
    complete.workflows = std.workflows.map((name, i) => ({ id: `wf${i}${crypto.randomBytes(4).toString('hex')}`, name, status: 'published', version: 1 }));
    complete.forms = std.forms.map((name, i) => ({ id: `form${i}${crypto.randomBytes(4).toString('hex')}`, name }));
    r = runScript('survey.js', ['--client', 'demo', '--ids'], { account: complete });
    let ids = null;
    try { ids = JSON.parse(r.stdout); } catch (e) { /* checked below */ }
    check('survey --ids prints only JSON on stdout, with every id', r.code === 0 && ids && Object.keys(ids.pipelines).length === 3 && Object.keys(ids.fields.contact).length === STD.contact &&
      Object.keys(ids.fields.opportunity).length === STD.opportunity && Object.keys(ids.calendars).length === 1 && Object.keys(ids.workflows).length === STD.workflows &&
      Object.keys(ids.forms).length === STD.forms && /Survey --ids \(read-only\) · client "demo"/.test(r.stderr) && !r.writes.length, show(r));
    writeJson(DEMO, { ...demoConfig, ids });

    r = runScript('double-check.js', ['--client', 'demo'], { account: complete });
    check('double-check on a complete account: ALL CHECKS PASS, reads only', r.code === 0 && /ALL CHECKS PASS/.test(r.stdout) && !/^FAIL/m.test(r.stdout) && !r.writes.length, show(r));

    const broken = copy(complete);
    broken.workflows.find((w) => w.name === 'Referral Engine - Affiliate Link').status = 'draft';
    broken.tags = broken.tags.filter((t) => t.name !== 'referral-partner');
    const life = broken.pipelines.find((p) => p.name === 'Partner Lifecycle');
    life.stages[0].position = 1; life.stages[1].position = 0;
    broken.customFields.find((f) => f.name === 'Partner ID').dataType = 'LARGE_TEXT';
    const brokenIds = copy(ids);
    brokenIds.pipelines['Referred Leads'] = 'wrongPipelineId';
    writeJson(path.join(REPO, 'clients', 'demo-broken', 'config.json'), { ...demoConfig, ids: brokenIds });
    r = runScript('double-check.js', ['--client', 'demo-broken'], { account: broken });
    const expectFails = [
      /^FAIL {2}workflow "Referral Engine - Affiliate Link": draft v1 — status draft/m,
      new RegExp(`^FAIL {2}all ${STD.tags + SEGMENTS.length} tags present — missing: referral-partner`, 'm'),
      /^FAIL {2}pipeline "Partner Lifecycle": Onboarding → Signed .*— stages should be: Signed → Onboarding/m,
      /^FAIL {2}contact field "Partner ID" LARGE_TEXT .*— type is LARGE_TEXT, expected TEXT/m,
      /^FAIL {2}pipeline "Referred Leads": .*— the config says id wrongPipelineId/m,
    ];
    check('double-check on a broken account: exactly the 5 problems FAIL, exit code 1',
      r.code === 1 && expectFails.every((re) => re.test(r.stdout)) && /\n5 FAIL\(S\)/.test(r.stdout) && (r.stdout.match(/^FAIL/gm) || []).length === 5, show(r));

    // ---- the test scenarios ---------------------------------------------------------------
    r = runScript('enroll.js', ['--client', 'demo', 'nosuch'], { account: complete });
    check('enroll: an unknown scenario lists the six, in order, and makes no request',
      r.code === 1 && /Scenarios, in order: claimA, claimB, staffC, partnerD, partnerE, claimE/.test(r.stderr) && !r.log.length, show(r));
    r = runScript('enroll.js', ['--client', 'demo', 'partnerD']);
    let up = r.state.upserts[r.state.upserts.length - 1];
    const cf = (body, field) => ((body.customFields || []).find((x) => x.id === ids.fields.contact[field]) || {}).field_value;
    check('enroll partnerD: upserts the sign-up fields, then enrolls in Partner Sign-Up',
      r.code === 0 && up.email === 'test.partner.d@example.com' && cf(up, 'Partner Type') === PARTNER_TYPES[0] && cf(up, 'Partnership Type') === 'Referral' && cf(up, 'Payment Preference') === 'ACH' &&
      r.state.enrollments.slice(-1)[0].workflowId === ids.workflows['Referral Engine - Partner Sign-Up'] && /^Enroll test "partnerD"/.test(r.stdout), show(r));
    const checkOnly = copy(demoConfig);
    checkOnly.structure.fields.contact.push({ name: 'Payment Preference', dataType: 'SINGLE_OPTIONS', options: ['Check', 'Other'] });
    writeJson(path.join(REPO, 'clients', 'demo-check', 'config.json'), { ...checkOnly, ids });
    r = runScript('enroll.js', ['--client', 'demo-check', 'partnerD']);
    up = r.state.upserts[r.state.upserts.length - 1];
    check('enroll partnerD with Payment Preference narrowed to Check / Other: writes "Check", the first option',
      r.code === 0 && cf(up, 'Payment Preference') === 'Check', show(r));
    r = runScript('enroll.js', ['--client', 'demo', 'partnerE']);
    up = r.state.upserts[r.state.upserts.length - 1];
    check('enroll partnerE: last name "PartnerE" with no space', r.code === 0 && up.email === 'test.partner.e@example.com' && up.lastName === 'PartnerE', show(r));
    r = runScript('enroll.js', ['--client', 'demo', 'claimE']);
    check('enroll claimE waits for partner E\'s Referral Code, and writes nothing until then',
      r.code === 1 && /has no Partner ID or Referral Code yet/.test(r.stderr) && !r.writes.length, show(r));
    const acct = JSON.parse(fs.readFileSync(STATE, 'utf8'));
    const partnerE = acct.contacts.find((c) => c.email === 'test.partner.e@example.com');
    partnerE.customFields.push({ id: ids.fields.contact['Partner ID'], value: partnerE.id }, { id: ids.fields.contact['Referral Code'], value: 'testpartnere123' });
    writeJson(STATE, acct);
    r = runScript('enroll.js', ['--client', 'demo', 'claimE']);
    up = r.state.upserts[r.state.upserts.length - 1];
    check('enroll claimE reads the claim off partner E, names in proper case (the search gives lower case)',
      r.code === 0 && up.email === 'test.referral3@example.com' && cf(up, 'Claimed Partner Name') === 'Test PartnerE' && cf(up, 'Claimed Partner ID') === partnerE.id &&
      cf(up, 'Claimed Referral Code') === 'testpartnere123' && r.state.enrollments.slice(-1)[0].workflowId === ids.workflows['Referral Engine - Referral Capture'], show(r));
    const runs = ['claimA', 'claimB', 'staffC'].map((s) => runScript('enroll.js', ['--client', 'demo', s]));
    const last = runs[2].state;
    const ups = last.upserts.slice(-3);
    check('enroll claimA, claimB, staffC: the right contacts and workflows',
      runs.every((x) => x.code === 0) && ups.map((u) => u.email).join() === 'test.referral1@example.com,test.referral1@example.com,test.referral2@example.com' &&
      cf(ups[1], 'Claimed Partner ID') === 'TEST-PARTNER-B' && last.enrollments.slice(-1)[0].workflowId === ids.workflows['Referral Engine - Staff Attribution'],
      runs.map(show).join('\n---\n'));
    check('every test contact is on @example.com and every phone is a fictional 555-01xx number',
      last.upserts.every((u) => G.isTestEmail(u.email) && (!u.phone || /^\+1555555(01\d\d)$/.test(u.phone))), JSON.stringify(last.upserts.map((u) => [u.email, u.phone])));

    r = runScript('fire-test.js', ['--client', 'demo', 'someone@realbusiness.test']);
    check('fire-test refuses a lead that is not @example.com, before any request', r.code === 1 && /@example\.com only/.test(r.stderr) && !r.log.length, show(r));
    writeJson(path.join(ELSEWHERE, 'otherhook.json'), { ...demoConfig, instantly: { webhookUrl: WEBHOOK.replace(LOC, 'LOCsomeoneelse000001') } });
    r = runScript('fire-test.js', ['--config', path.join(ELSEWHERE, 'otherhook.json'), 'test.instantly1@example.com']);
    check('fire-test refuses a webhook of another location, before any request', r.code === 1 && /belongs to location LOCsomeoneelse000001/.test(r.stderr) && !r.log.length, show(r));
    const { instantly, ...noHook } = demoConfig;
    writeJson(path.join(ELSEWHERE, 'nohook.json'), noHook);
    r = runScript('fire-test.js', ['--config', path.join(ELSEWHERE, 'nohook.json'), 'test.instantly1@example.com']);
    check('fire-test needs instantly.webhookUrl in the config', r.code === 1 && /has no instantly\.webhookUrl/.test(r.stderr) && !r.log.length && !!instantly, show(r));
    r = runScript('fire-test.js', ['--client', 'demo', 'test.instantly1@example.com']);
    const hook = r.log.find((x) => x.path.includes('/webhook-trigger/'));
    check('fire-test posts the synthetic lead to the webhook: browser User-Agent, no token',
      r.code === 0 && hook && hook.body.lead_email === 'test.instantly1@example.com' && hook.body.event_type === 'lead_interested' && hook.ua === G.UA && hook.auth === 'none' && /^Fire test/.test(r.stdout), show(r));

    const acct2 = JSON.parse(fs.readFileSync(STATE, 'utf8'));
    const referred = acct2.pipelines.find((p) => p.name === 'Referred Leads');
    const stageId = (n) => referred.stages.find((s) => s.name === n).id;
    acct2.contacts.push({ id: 'ctRealClient', email: 'owner@realbusiness.test', firstName: 'Real', lastName: 'Client', customFields: [], tags: [] });
    const testContact = acct2.contacts.find((c) => c.email === 'test.referral2@example.com');
    acct2.opportunities.push(
      { id: 'oppReal', name: 'owner@realbusiness.test', pipelineId: referred.id, pipelineStageId: stageId('Referral Received'), status: 'open', contactId: 'ctRealClient' },
      { id: 'oppTest', name: testContact.email, pipelineId: referred.id, pipelineStageId: stageId('Referral Received'), status: 'open', contactId: testContact.id },
    );
    writeJson(STATE, acct2);
    r = runScript('move-stage.js', ['--client', 'demo', 'oppReal', 'Sold / Enrolled']);
    check('move-stage refuses a deal whose contact is not @example.com', r.code === 1 && /Refused: deal oppReal belongs to owner@realbusiness\.test/.test(r.stderr) && !r.writes.length, show(r));
    r = runScript('move-stage.js', ['--client', 'demo', 'oppTest', 'No Such Stage']);
    check('move-stage refuses an unknown stage and lists the real ones', r.code === 1 && /No stage "No Such Stage" in Referred Leads\. Its stages: Referral Received/.test(r.stderr) && !r.writes.length, show(r));
    r = runScript('move-stage.js', ['--client', 'demo', 'oppTest', 'Sold / Enrolled', '2000']);
    const put = r.state.puts.slice(-1)[0];
    check('move-stage moves a test deal and writes Client Monthly Revenue',
      r.code === 0 && put && put.id === 'oppTest' && put.body.pipelineStageId === stageId('Sold / Enrolled') && put.body.customFields[0].id === ids.fields.opportunity['Client Monthly Revenue'] &&
      put.body.customFields[0].field_value === 2000 && r.writes.length === 1, show(r));

    r = runScript('verify-test.js', ['--client', 'demo', 'test.referral3@example.com']);
    check('verify-test shows the contact in proper case, reads only', r.code === 0 && /\| Test Referral Three \| test\.referral3@example\.com/.test(r.stdout) && !r.writes.length, show(r));

    // ---- across every run ------------------------------------------------------------------
    check('the token never appears in any output', OUTPUTS.every((o) => !o.includes(FAKE_TOKEN)));
    const apiCalls = REQUESTS.filter((x) => !x.path.includes('/webhook-trigger/'));
    check(`every API call (${apiCalls.length}) sent the browser User-Agent and the right token`, apiCalls.length > 0 && apiCalls.every((x) => x.ua === G.UA && x.auth === 'ok'),
      JSON.stringify(apiCalls.filter((x) => x.ua !== G.UA || x.auth !== 'ok').slice(0, 5)));
  } catch (e) {
    check('the selftest itself ran to the end', false, e.stack || e.message);
  } finally {
    if (KEEP) console.log(`\nKept the sandbox: ${TMP}`);
    else fs.rmSync(TMP, { recursive: true, force: true });
  }
  const total = passed + failed;
  console.log(`\n${passed}/${total} passed${failed ? ` · ${failed} FAILED` : ''}`);
  process.exit(failed ? 1 : 0);
}

// The differences that matter between two standard structures: names, types, options, stages,
// calendar settings (not its slug or description), workflows and forms.
function structureDiff(a, b) {
  const out = [];
  const byName = (list) => new Map(list.map((f) => [f.name, JSON.stringify([f.dataType, f.options || []])]));
  for (const model of ['contact', 'opportunity']) {
    const x = byName(a.fields[model]);
    const y = byName(b.fields[model]);
    for (const [n, v] of x) if (!y.has(n)) out.push(`${model} field "${n}" only in spec/structure.json`); else if (y.get(n) !== v) out.push(`${model} field "${n}" differs: ${v} vs ${y.get(n)}`);
    for (const n of y.keys()) if (!x.has(n)) out.push(`${model} field "${n}" only in the fallback`);
  }
  const sets = (label, x, y) => {
    for (const n of x) if (!y.includes(n)) out.push(`${label} "${n}" only in spec/structure.json`);
    for (const n of y) if (!x.includes(n)) out.push(`${label} "${n}" only in the fallback`);
  };
  sets('tag', a.tags, b.tags);
  sets('workflow', a.workflows, b.workflows);
  sets('form', a.forms, b.forms);
  const pipes = (s) => new Map(s.pipelines.map((p) => [p.name, p.stages.join(' → ')]));
  const pa = pipes(a);
  const pb = pipes(b);
  for (const [n, v] of pa) if (!pb.has(n)) out.push(`pipeline "${n}" only in spec/structure.json`); else if (pb.get(n) !== v) out.push(`pipeline "${n}" stages differ: ${v} vs ${pb.get(n)}`);
  for (const n of pb.keys()) if (!pa.has(n)) out.push(`pipeline "${n}" only in the fallback`);
  const cal = (s) => JSON.stringify(s.calendar && Object.fromEntries(Object.entries(s.calendar).filter(([k]) => !k.startsWith('_') && k !== 'slug' && k !== 'description').sort()));
  if (cal(a) !== cal(b)) out.push(`calendar settings differ: ${cal(a)} vs ${cal(b)}`);
  return out;
}

// Loaded with "node -r" by the test runs: become the fake account. Run directly: run the tests.
if (process.env.GHL_SELFTEST_MOCK) installMock();
else if (require.main === module) main();
