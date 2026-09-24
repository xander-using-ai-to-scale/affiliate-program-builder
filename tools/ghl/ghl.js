// Shared helper for every script in tools/ghl. It does four jobs:
//
//   1. Finds the client's config.
//        --client <slug>   reads clients/<slug>/config.json in the repo root
//        --config <path>   reads any config file
//        GHL_CLIENT=<slug> (environment variable) stands in for --client
//      The repo root is the folder above tools/ that holds docs/REPO-SPEC.md.
//   2. Reads the client's GHL token from ~/.secrets/<tokenFile> at the first API call. The config
//      holds only that file's NAME. The token is never printed and never written anywhere.
//   3. Makes every API call, always with a browser User-Agent. GHL's API sits behind Cloudflare,
//      which answers error 1010 to a request without one. 1010 looks exactly like an auth failure;
//      it is not.
//   4. Builds the client's structure: the standard one (spec/structure.json, or the fallback copy
//      tools/ghl/structure.default.json) with the client's own changes (the config's "structure").
//
// This file never writes to GHL by itself. Its plain functions (parseArgs, resolveConfig,
// loadConfig, loadStructure, validateStructure, isTestEmail, ...) have no side effects, so
// selftest.js can test them. The current client is read from the command line the first time a
// script asks for `client`, `LOC` or `args`, or makes an API call.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');

const BASE = 'https://services.leadconnectorhq.com';
const API_VERSION = '2021-07-28';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const DEFAULT_STRUCTURE = path.join(__dirname, 'structure.default.json');

// Placeholders look like <CLIENT_NAME>: upper case, digits and underscores in angle brackets.
const PLACEHOLDER = /<[A-Z][A-Z0-9_]*>/;
const isPlaceholder = (v) => typeof v === 'string' && PLACEHOLDER.test(v);

// Test contacts use example.com, a domain reserved for examples: mail to it goes nowhere.
const isTestEmail = (e) => typeof e === 'string' && /^[^\s@]+@example\.com$/i.test(e);

// A problem with the command line, the config or the structure. Scripts print the message and
// stop (exit code 1) instead of showing a stack trace.
class ConfigError extends Error {}
const fail = (msg) => { throw new ConfigError(msg); };

function die(msg) {
  console.error(msg);
  process.exit(1);
}

// Full, untruncated text of a response body, for error messages.
const full = (b) => (typeof b === 'string' ? b : JSON.stringify(b, null, 2));

// A path as the reader should see it: relative to the current folder when it is inside it.
function shown(file) {
  const rel = path.relative(process.cwd(), file);
  if (rel && !rel.startsWith('..') && !path.isAbsolute(rel)) return rel.split(path.sep).join('/');
  return file;
}

function readJson(file) {
  let text;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch (e) {
    return fail(`Cannot read ${shown(file)}: ${e.code || e.message}`);
  }
  try {
    return JSON.parse(text.replace(/^﻿/, '')); // Windows editors sometimes add a byte-order mark
  } catch (e) {
    return fail(`${shown(file)} is not valid JSON: ${e.message}`);
  }
}

// Walks up from `start` to the folder that holds docs/REPO-SPEC.md. Returns null if there is none.
function findRepoRoot(start = __dirname) {
  let dir = path.resolve(start);
  for (;;) {
    if (fs.existsSync(path.join(dir, 'docs', 'REPO-SPEC.md'))) return dir;
    const up = path.dirname(dir);
    if (up === dir) return null;
    dir = up;
  }
}
const ROOT = findRepoRoot();

// --client <slug> and --config <path> (or --client=<slug>, --config=<path>); any other --flag or
// --flag=value goes into `flags`; everything else is positional, in order.
function parseArgs(argv) {
  const out = { client: null, config: null, flags: {}, positional: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const m = /^--(client|config)(?:=(.*))?$/.exec(a);
    if (m) {
      const v = m[2] !== undefined ? m[2] : argv[++i];
      if (!v || v.startsWith('--')) fail(`--${m[1]} needs a value: --${m[1]} ${m[1] === 'client' ? '<slug>' : '<path>'}`);
      out[m[1]] = v;
      continue;
    }
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq > 0) out.flags[a.slice(2, eq)] = a.slice(eq + 1);
      else out.flags[a.slice(2)] = true;
      continue;
    }
    out.positional.push(a);
  }
  return out;
}

// The client folders that hold a config.json.
function listClients(root = ROOT) {
  const dir = root && path.join(root, 'clients');
  if (!dir || !fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(dir, d.name, 'config.json')))
    .map((d) => d.name)
    .sort();
}

// Which config file to read. Returns { file, slug, cli }; `cli` is how to name this client again
// in a command ("--client acme" or --config "<path>").
function resolveConfig(args, env = process.env, root = ROOT) {
  if (args.client && args.config) fail('Pass --client <slug> or --config <path>, not both.');
  if (args.config) {
    const file = path.resolve(args.config);
    if (!fs.existsSync(file)) fail(`No config file at ${args.config}.`);
    const base = path.basename(file, path.extname(file));
    const slug = base === 'config' ? path.basename(path.dirname(file)) : base;
    return { file, slug, cli: `--config "${args.config}"` };
  }
  const slug = args.client || env.GHL_CLIENT;
  const known = () => listClients(root).join(', ') || 'none yet';
  if (!slug) {
    fail(`Which client? Pass --client <slug> (reads clients/<slug>/config.json) or --config <path>, or set GHL_CLIENT. Clients found: ${known()}.`);
  }
  if (!/^[a-z0-9_][a-z0-9_-]*$/.test(slug)) fail(`Client slug "${slug}" must be lowercase letters, digits, dashes and underscores.`);
  if (!root) fail('Cannot find the repo root (the folder with docs/REPO-SPEC.md) above tools/ghl. Use --config <path> instead.');
  const file = path.join(root, 'clients', slug, 'config.json');
  if (!fs.existsSync(file)) {
    if (fs.existsSync(path.join(root, 'clients', slug, 'client-config.json'))) {
      fail(`Found clients/${slug}/client-config.json. Rename it to config.json: the scripts read clients/${slug}/config.json.`);
    }
    fail(`No config at clients/${slug}/config.json. Copy templates/client-config.json there and fill it in. Clients found: ${known()}.`);
  }
  return { file, slug, cli: `--client ${slug}` };
}

// True when a tokenFile value looks like a token rather than a file name.
function looksLikeToken(name) {
  return /^pit-/i.test(name) // GHL Private Integration tokens start with "pit-"
    || /^eyJ[\w-]*\./.test(name) // a JWT (older GHL API keys)
    || /^bearer\s/i.test(name)
    || (!name.includes('.') && name.length > 40);
}

// Reads and checks a config file. `account: false` (build-structure.js --offline) skips the checks
// that only matter when calling GHL: the location id and the token file may still be placeholders.
function loadConfig(file, where = {}, { account = true } = {}) {
  const cfg = readJson(file);
  const at = shown(file);
  if (!cfg || typeof cfg !== 'object' || Array.isArray(cfg)) fail(`${at} must hold one JSON object.`);
  const tf = cfg.tokenFile;
  if (tf !== undefined && typeof tf !== 'string') fail(`${at}: "tokenFile" must be a file name (text).`);
  // Always checked, even offline: a token pasted into a config is a leak wherever the config goes.
  if (tf && looksLikeToken(tf)) {
    fail(`${at}: "tokenFile" looks like a token, not a file name. Put the token in a file in ~/.secrets, write only the file's name here, and rotate the token if this file was ever shared or committed.`);
  }
  if (tf && !isPlaceholder(tf) && (path.basename(tf) !== tf || /[\\/]/.test(tf) || /^\.+$/.test(tf))) {
    fail(`${at}: "tokenFile" must be a file NAME inside ~/.secrets, not a path.`);
  }
  if (account) {
    for (const key of ['client', 'locationId', 'tokenFile']) {
      if (isPlaceholder(cfg[key])) fail(`${at}: "${key}" is still the placeholder ${cfg[key]}. Fill it in first.`);
    }
    if (!cfg.locationId) fail(`${at}: "locationId" is missing. It is the id after /location/ in the sub-account's GHL address.`);
    if (!tf) fail(`${at}: "tokenFile" is missing. It is the NAME of the file in ~/.secrets that holds the sub-account's token.`);
  }
  cfg.slug = where.slug || path.basename(file, path.extname(file));
  cfg.file = file;
  cfg.where = at;
  cfg.cli = where.cli || `--config "${at}"`;
  cfg.ids = cfg.ids || {};
  return cfg;
}

// ---------------------------------------------------------------------------------------------
// The current run: the command line, the client and its location id. Read on first use.
// ---------------------------------------------------------------------------------------------
let CTX = null;
function context() {
  if (CTX) return CTX;
  try {
    const args = parseArgs(process.argv.slice(2));
    const offline = !!args.flags.offline;
    const where = resolveConfig(args);
    const client = loadConfig(where.file, where, { account: !offline });
    CTX = { args, client, LOC: client.locationId, offline };
  } catch (e) {
    if (e instanceof ConfigError) die(e.message);
    throw e;
  }
  return CTX;
}

let TOKEN = null;
function token() {
  if (TOKEN) return TOKEN;
  const { client } = context();
  const file = path.join(os.homedir(), '.secrets', client.tokenFile);
  let text;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch (e) {
    die(e.code === 'ENOENT'
      ? `Token file not found: ~/.secrets/${client.tokenFile} (named in ${client.where}). Save the sub-account's Private Integration token in that file.`
      : `Cannot read the token file ~/.secrets/${client.tokenFile}: ${e.code || 'unknown error'}`);
  }
  const t = text.replace(/^﻿/, '').trim();
  if (!t) die(`The token file ~/.secrets/${client.tokenFile} is empty.`);
  if (/\s/.test(t)) die(`The token file ~/.secrets/${client.tokenFile} must hold only the token: one line, no spaces.`);
  TOKEN = t;
  return TOKEN;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Every call returns { status, ok, body }. Nothing here throws on an HTTP error; callers decide.
// A 429 (too many requests) is retried up to 3 times, after the wait GHL asks for.
async function api(method, p, body) {
  const { offline } = context();
  if (offline) die(`--offline makes no API calls, but the script tried ${method} ${p}. This is a bug in the script.`);
  const headers = {
    Authorization: `Bearer ${token()}`,
    Version: API_VERSION,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': UA,
  };
  for (let attempt = 1; ; attempt++) {
    let r;
    try {
      r = await fetch(BASE + p, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    } catch (e) {
      die(`${method} ${p}: no answer from GHL (${(e.cause && e.cause.code) || e.message}). Check the internet connection, then run the script again.`);
    }
    if (r.status === 429 && attempt <= 3) {
      await sleep(Math.min(Number(r.headers.get('retry-after')) * 1000 || 2000 * attempt, 10000));
      continue;
    }
    const text = await r.text();
    let json;
    try { json = text ? JSON.parse(text) : null; } catch { json = text; }
    return { status: r.status, ok: r.status >= 200 && r.status < 300, body: json };
  }
}

// One extra line for the errors we have seen before.
function hint(r) {
  const s = full(r.body || '');
  if (r.status === 403 && /1010/.test(s)) return '\nCloudflare error 1010: the request was refused as a bot. Every call must send a browser User-Agent (api() in ghl.js does).';
  if (r.status === 401) return '\nThe token was refused. Check that ~/.secrets/<tokenFile> holds the SUB-ACCOUNT Private Integration token (an agency token fails with "user type mismatch") and that it has the scopes listed in tools/ghl/README.md.';
  if (r.status === 403) return '\nThe token may lack a scope for this call. The scopes are listed in tools/ghl/README.md.';
  return '';
}

// A read the script cannot go on without: stop with the full error rather than carry on with an
// empty list. (A build that misreads "nothing exists" would create duplicates.)
async function get(p) {
  const r = await api('GET', p);
  if (!r.ok) die(`GET ${p} failed with ${r.status}:\n${full(r.body)}${hint(r)}`);
  return r.body;
}

// Prints which account a script is about to touch. Every script that reads or writes the account
// calls it first. `toStderr` keeps stdout clean for scripts whose output is JSON.
async function banner(what, { toStderr = false } = {}) {
  const { client, LOC } = context();
  const loc = await get(`/locations/${LOC}`);
  const name = (loc && loc.location && loc.location.name) || '(no name returned)';
  (toStderr ? console.error : console.log)(`${what} · client "${client.slug}" · ${name} (${LOC})`);
  return loc && loc.location;
}

// All forms of the location, 50 per page. Returns { status, ok, body: { forms } }. A token without
// the forms scope gets ok: false; the callers then fall back to the form ids in the config.
async function listForms() {
  const { LOC } = context();
  const first = await api('GET', `/forms/?locationId=${LOC}&limit=50`);
  if (!first.ok) return first;
  const all = [];
  const seen = new Set();
  let page = (first.body && first.body.forms) || [];
  for (let skip = 50; ; skip += 50) {
    const fresh = page.filter((f) => !seen.has(f.id));
    for (const f of fresh) { seen.add(f.id); all.push(f); }
    if (page.length < 50 || !fresh.length || skip > 2000) break;
    const next = await api('GET', `/forms/?locationId=${LOC}&limit=50&skip=${skip}`);
    if (!next.ok) break;
    page = (next.body && next.body.forms) || [];
  }
  return { status: first.status, ok: true, body: { forms: all } };
}

// ---------------------------------------------------------------------------------------------
// Structure = the standard structure with the client's "structure" changes applied.
//   remove.fields / .tags / .pipelines / .workflows / .forms : names dropped from the standard
//   fields.contact / fields.opportunity / pipelines            : same name replaces, new name adds
//   tags / workflows / forms                                   : added (no duplicates)
//   calendar                                                   : its keys replace the standard's; null = no calendar
// ---------------------------------------------------------------------------------------------

// Which standard structure file to use: spec/structure.json, or the fallback copy next to this file.
function structureFile(root = ROOT) {
  const spec = root && path.join(root, 'spec', 'structure.json');
  if (spec && fs.existsSync(spec)) return { file: spec, fallback: false };
  return { file: DEFAULT_STRUCTURE, fallback: true };
}

// One line that says which standard structure a script uses.
function describeStructure(src = structureFile()) {
  return src.fallback
    ? 'Standard structure: tools/ghl/structure.default.json (the fallback: spec/structure.json is missing)'
    : `Standard structure: ${shown(src.file)}`;
}

const nameOf = (x) => (typeof x === 'string' ? x : x && x.name);
const namesOf = (list) => (list || []).map(nameOf).filter(Boolean);

function checkShape(s, file) {
  const at = shown(file);
  const need = (ok, what) => { if (!ok) fail(`${at}: ${what}`); };
  need(s && typeof s === 'object' && !Array.isArray(s), 'must hold one JSON object');
  need(s.fields && Array.isArray(s.fields.contact) && Array.isArray(s.fields.opportunity), '"fields.contact" and "fields.opportunity" must be lists');
  need(Array.isArray(s.tags), '"tags" must be a list');
  need(Array.isArray(s.pipelines), '"pipelines" must be a list');
  need(Array.isArray(s.workflows), '"workflows" must be a list of names');
  need(Array.isArray(s.forms), '"forms" must be a list of names');
  need(s.calendar === null || (s.calendar && typeof s.calendar === 'object'), '"calendar" must be an object or null');
}

function loadStructure(cfg = context().client, source = structureFile()) {
  const src = typeof source === 'string' ? { file: source, fallback: false } : source;
  const base = readJson(src.file);
  checkShape(base, src.file);
  const o = (cfg && cfg.structure) || {};
  const rm = o.remove || {};
  const drop = (list, names) => (list || []).filter((x) => !(names || []).includes(nameOf(x)));
  const merge = (list, adds) => {
    const out = list.slice();
    for (const a of adds || []) {
      const i = out.findIndex((x) => x.name === a.name);
      if (i >= 0) out[i] = a; else out.push(a);
    }
    return out;
  };
  const uniq = (list) => [...new Set(list)];
  const pipes = (list) => (list || []).map((p) => ({ ...p, stages: namesOf(p.stages) }));
  const noCalendar = o.calendar === null || base.calendar === null;
  return {
    fields: {
      contact: merge(drop(base.fields.contact, rm.fields), o.fields && o.fields.contact),
      opportunity: merge(drop(base.fields.opportunity, rm.fields), o.fields && o.fields.opportunity),
    },
    tags: uniq([...namesOf(drop(base.tags, rm.tags)), ...namesOf(o.tags)]),
    pipelines: merge(pipes(drop(base.pipelines, rm.pipelines)), pipes(o.pipelines)),
    calendar: noCalendar ? null : { ...base.calendar, ...(o.calendar || {}) },
    workflows: uniq([...namesOf(drop(base.workflows, rm.workflows)), ...namesOf(o.workflows)]),
    forms: uniq([...namesOf(drop(base.forms, rm.forms)), ...namesOf(o.forms)]),
  };
}

// Every text value that still holds a placeholder, skipping keys that start with "_" (notes).
function findPlaceholders(value, at = '') {
  const hits = [];
  const walk = (v, p) => {
    if (typeof v === 'string') { if (isPlaceholder(v)) hits.push({ path: p, value: v }); return; }
    if (Array.isArray(v)) { v.forEach((x, i) => walk(x, `${p}[${i}]`)); return; }
    if (v && typeof v === 'object') {
      for (const [k, x] of Object.entries(v)) if (!k.startsWith('_')) walk(x, p ? `${p}.${k}` : k);
    }
  };
  walk(value, at);
  return hits;
}

const FIELD_TYPES = [
  'TEXT', 'LARGE_TEXT', 'NUMERICAL', 'PHONE', 'MONETORY', 'CHECKBOX', 'SINGLE_OPTIONS',
  'MULTIPLE_OPTIONS', 'DATE', 'TEXTBOX_LIST', 'FILE_UPLOAD', 'SIGNATURE', 'RADIO', 'EMAIL',
];
const OPTION_TYPES = ['SINGLE_OPTIONS', 'MULTIPLE_OPTIONS', 'RADIO', 'CHECKBOX'];

// Returns a list of problems; an empty list means the structure can be built.
// `offline: true` (the offline plan) does not need the calendar owner's user id yet.
function validateStructure(s, cfg = context().client, { offline = false } = {}) {
  const p = [];
  const at = (cfg && cfg.where) || 'the config';
  for (const model of ['contact', 'opportunity']) {
    const seen = new Set();
    for (const f of s.fields[model]) {
      if (!f.name) { p.push(`a ${model} field has no name`); continue; }
      if (seen.has(f.name)) p.push(`${model} field "${f.name}" is listed twice`);
      seen.add(f.name);
      if (!FIELD_TYPES.includes(f.dataType)) p.push(`${model} field "${f.name}": unknown dataType "${f.dataType}"`);
      if (OPTION_TYPES.includes(f.dataType) && !(f.options || []).length) {
        p.push(`${model} field "${f.name}" has no options. They are client-specific: set them in ${at} under structure.fields.${model}`);
      }
    }
  }
  for (const t of s.tags) {
    if (!isPlaceholder(t) && (t !== t.toLowerCase() || t !== t.trim())) p.push(`tag "${t}": GHL stores tags lower case and trimmed, so write it that way`);
  }
  const pipeNames = new Set();
  for (const pl of s.pipelines) {
    if (pipeNames.has(pl.name)) p.push(`pipeline "${pl.name}" is listed twice`);
    pipeNames.add(pl.name);
    if (!(pl.stages || []).length) p.push(`pipeline "${pl.name}" has no stages`);
    if (new Set(pl.stages).size !== (pl.stages || []).length) p.push(`pipeline "${pl.name}" repeats a stage name`);
  }
  if (s.calendar) {
    if (!s.calendar.name) p.push('the calendar has no name');
    if (!s.calendar.slug) p.push(`the calendar has no slug. Slugs are client-specific: set structure.calendar.slug in ${at}`);
    const owner = cfg && cfg.calendarOwnerUserId;
    if (!offline && (!owner || isPlaceholder(owner))) {
      p.push(`${at} has no "calendarOwnerUserId": the GHL user id of the placeholder person, who owns the calendar until the client has a user (survey.js lists the users)`);
    }
  }
  for (const h of findPlaceholders(s)) p.push(`${h.path} is still a placeholder (${h.value}): set it in ${at}`);
  return p;
}

// Looks up an id recorded in the client config, e.g. need('workflows', 'Referral Engine - Referral Capture').
function need(section, name, model) {
  const { client } = context();
  const table = model ? (client.ids[section] || {})[model] : client.ids[section];
  const id = table && table[name];
  if (!id || isPlaceholder(id)) {
    die(`${client.where} has no ids.${section}${model ? '.' + model : ''}["${name}"]. ` +
      `Run: node tools/ghl/survey.js ${client.cli} --ids  and paste its output into the config as "ids".`);
  }
  return id;
}

// Runs a script's main function: a ConfigError prints its message, anything else its stack.
function run(fn) {
  Promise.resolve()
    .then(fn)
    .catch((e) => {
      if (e instanceof ConfigError) die(e.message);
      console.error((e && e.stack) || e);
      process.exit(1);
    });
}

module.exports = {
  // constants
  BASE, API_VERSION, UA, ROOT, DEFAULT_STRUCTURE, FIELD_TYPES, OPTION_TYPES,
  // plain functions, no side effects
  ConfigError, parseArgs, findRepoRoot, listClients, resolveConfig, loadConfig, looksLikeToken,
  readJson, structureFile, describeStructure, loadStructure, validateStructure, findPlaceholders,
  isPlaceholder, isTestEmail, full, shown,
  // the current run
  api, get, banner, need, listForms, die, run,
  get args() { return context().args; },
  get client() { return context().client; },
  get LOC() { return context().LOC; },
  get offline() { return context().offline; },
};
