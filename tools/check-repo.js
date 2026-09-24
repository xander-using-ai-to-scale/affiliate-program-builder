#!/usr/bin/env node
// The repo's own checker: the 8 rules of docs/REPO-SPEC.md §7. READ-ONLY: it changes nothing and
// never touches GHL. All 8 must pass before a release.
//
//   node tools/check-repo.js                      check this repo
//   node tools/check-repo.js --forbidden <file>   take the forbidden strings from this file
//   node tools/check-repo.js --root <folder>      check another copy (an unzipped release, a temp copy)
//   node tools/check-repo.js --strict             a skipped rule counts as a failure (use before a release)
//
// Prints PASS, FAIL or SKIP per rule, with the details under each FAIL. Exit code 1 on any FAIL.
//
// "The repo" means the files git would commit: everything under the root except .git/, clients/
// and whatever the root .gitignore excludes. build-zip.js uses the same list (it requires this file).
//
// The forbidden strings (rule 4) are the first client's identifiers. They must never be committed,
// so the list lives in clients/check-repo.forbidden.txt (gitignored): one string per line, lines
// starting with # are comments, matched without regard to capitals. --forbidden <file> reads
// another file. tools/check-repo.forbidden.txt is also read, and is gitignored too. With no list
// at all, rule 4 is SKIPPED with a warning; it never passes silently.
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { spawnSync } = require('child_process');

// ------------------------------------------------------------------ the repo's files
function findRepoRoot(start = __dirname) {
  let dir = path.resolve(start);
  for (;;) {
    if (fs.existsSync(path.join(dir, 'docs', 'REPO-SPEC.md'))) return dir;
    const up = path.dirname(dir);
    if (up === dir) return null;
    dir = up;
  }
}

// A glob from .gitignore as a regular expression: * and ? stay inside one folder, ** crosses folders.
function globToRegex(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*') {
      if (glob[i + 1] === '*') {
        if (glob[i + 2] === '/') { re += '(?:.*/)?'; i += 2; } else { re += '.*'; i += 1; }
      } else re += '[^/]*';
    } else if (c === '?') re += '[^/]';
    else if (c === '[') {
      const j = glob.indexOf(']', i + 1);
      if (j > i) { re += `[${glob.slice(i + 1, j).replace(/^!/, '^').replace(/\\/g, '\\\\')}]`; i = j; } else re += '\\[';
    } else re += c.replace(/[.+^${}()|\\]/g, '\\$&');
  }
  return new RegExp(`^${re}$`);
}

// The root .gitignore's rules: blank lines and # comments skipped, ! re-includes, a trailing /
// matches folders only, a / at the start or in the middle ties the pattern to the root.
function compileGitignore(text) {
  const rules = [];
  for (const raw of text.split(/\r?\n/)) {
    let line = raw.replace(/\s+$/, '');
    if (!line || line.startsWith('#')) continue;
    let neg = false;
    if (line.startsWith('!')) { neg = true; line = line.slice(1); }
    if (line.startsWith('\\')) line = line.slice(1);
    let dirOnly = false;
    if (line.endsWith('/')) { dirOnly = true; line = line.slice(0, -1); }
    const anchored = line.includes('/');
    if (line.startsWith('/')) line = line.slice(1);
    rules.push({ neg, dirOnly, anchored, re: globToRegex(line) });
  }
  return rules;
}

function isIgnored(rel, isDir, rules) {
  const base = rel.slice(rel.lastIndexOf('/') + 1);
  let ignored = false;
  for (const r of rules) {
    if (r.dirOnly && !isDir) continue;
    if (r.anchored ? r.re.test(rel) : r.re.test(base)) ignored = !r.neg;
  }
  return ignored;
}

// Every file of the repo, as paths relative to the root with "/" separators, sorted.
// .git/ and the root clients/ folder are always left out, even if .gitignore were missing.
function listRepoFiles(root) {
  const gi = path.join(root, '.gitignore');
  const rules = compileGitignore(fs.existsSync(gi) ? fs.readFileSync(gi, 'utf8') : '');
  const out = [];
  const walk = (dirRel) => {
    const ents = fs.readdirSync(path.join(root, dirRel), { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    for (const ent of ents) {
      const rel = dirRel ? `${dirRel}/${ent.name}` : ent.name;
      if (ent.name === '.git' || rel === 'clients' || ent.isSymbolicLink()) continue;
      const isDir = ent.isDirectory();
      if (isIgnored(rel, isDir, rules)) continue;
      if (isDir) walk(rel); else if (ent.isFile()) out.push(rel);
    }
  };
  walk('');
  return out;
}

// ------------------------------------------------------------------ zip reading (also used by build-zip.js)
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

// Reads every entry of a zip and checks its size and CRC. Throws on anything wrong.
function readZip(buf) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('not a zip file: no end-of-central-directory record');
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const out = [];
  for (let k = 0; k < count; k++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error(`central directory entry ${k} is damaged`);
    const method = buf.readUInt16LE(p + 10);
    const crc = buf.readUInt32LE(p + 16);
    const comp = buf.readUInt32LE(p + 20);
    const size = buf.readUInt32LE(p + 24);
    const nlen = buf.readUInt16LE(p + 28);
    const xlen = buf.readUInt16LE(p + 30);
    const clen = buf.readUInt16LE(p + 32);
    const off = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nlen);
    if (buf.readUInt32LE(off) !== 0x04034b50) throw new Error(`${name}: local header is damaged`);
    const start = off + 30 + buf.readUInt16LE(off + 26) + buf.readUInt16LE(off + 28);
    const raw = buf.subarray(start, start + comp);
    let data;
    if (method === 8) data = zlib.inflateRawSync(raw);
    else if (method === 0) data = Buffer.from(raw);
    else throw new Error(`${name}: unsupported compression method ${method}`);
    if (data.length !== size || crc32(data) !== crc) throw new Error(`${name}: size or CRC does not match`);
    out.push({ name, crc, size, data });
    p += 46 + nlen + xlen + clen;
  }
  return out;
}

// ------------------------------------------------------------------ text helpers
const isBinary = (buf) => buf.subarray(0, 8000).includes(0);

// Blanks out fenced code blocks, inline code and one-line HTML comments, keeping the line count.
function maskCode(text) {
  let fence = null;
  return text.split(/\r?\n/).map((l) => {
    const f = /^\s*(`{3,}|~{3,})/.exec(l);
    if (fence) { if (f && f[1][0] === fence[0] && f[1].length >= fence.length) fence = null; return ''; }
    if (f) { fence = f[1]; return ''; }
    return l.replace(/(`+)[\s\S]*?\1/g, (s) => ' '.repeat(s.length)).replace(/<!--.*?-->/g, (s) => ' '.repeat(s.length));
  }).join('\n');
}

// The files and folders listed in the tree block of REPO-SPEC.md §3. File names written in a
// folder's description (like "ghl/  ghl.js · survey.js ...") count as files in that folder.
function parseSpecTree(text) {
  const lines = text.split(/\r?\n/);
  const h = lines.findIndex((l) => /^##\s+3\./.test(l));
  if (h < 0) return null;
  let i = lines.findIndex((l, k) => k > h && /^\s*(```|~~~)/.test(l));
  if (i < 0) return null;
  const fence = lines[i].trim().slice(0, 3);
  const files = new Set();
  const dirs = new Set();
  const stack = [];
  let last = null;
  const fromDesc = (entry, desc) => {
    if (!entry || !entry.isDir) return;
    for (const m of desc.matchAll(/(?:^|[\s·,(])([A-Za-z0-9_.-]+\.(?:js|json|md|txt|pdf|py|sh|html|csv))\b/g)) files.add(`${entry.path}/${m[1]}`);
  };
  for (i += 1; i < lines.length && !lines[i].trim().startsWith(fence); i++) {
    const line = lines[i].replace(/\s+$/, '');
    if (!line.trim()) continue;
    const m = /^((?:[│|] {3}| {4})*)(?:├──|└──)\s+(\S+)(.*)$/.exec(line);
    if (!m) { if (last) fromDesc(last, line.replace(/^[│|\s]+/, '')); continue; }
    const depth = m[1].length / 4;
    let name = m[2];
    const isDir = name.endsWith('/');
    if (isDir) name = name.slice(0, -1);
    const parent = depth === 0 ? '' : stack[depth - 1];
    const p = parent ? `${parent}/${name}` : name;
    if (isDir) { dirs.add(p); stack[depth] = p; } else files.add(p);
    last = { path: p, isDir };
    fromDesc(last, m[3]);
  }
  return { files: [...files], dirs: [...dirs] };
}

function changelogVersion(text) {
  const m = /^##\s+\[?v?(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)\]?(.*)$/m.exec(text);
  if (!m) return null;
  const d = /(\d{4}-\d{2}-\d{2})/.exec(m[2]);
  return { version: m[1], date: d ? d[1] : null };
}
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SECRET_PATTERNS = [
  { name: 'a GHL Private Integration token (pit-...)', re: /\bpit-[A-Za-z0-9]{8}-?[A-Za-z0-9-]{8,}/ },
  { name: 'a JWT', re: /\beyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/ },
  { name: 'a Bearer token', re: /\bBearer\s+[A-Za-z0-9._~+/=-]{20,}/ },
  { name: 'a GitHub token', re: /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})/ },
  { name: 'a private key', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
];

// PDF text, through Python + PyMuPDF when they are there. Returns { texts, error }.
function pdfTexts(absPaths) {
  if (!absPaths.length) return { texts: {}, error: null };
  const code = [
    'import sys, json',
    'try:\n    import pymupdf\nexcept ImportError:\n    import fitz as pymupdf',
    'out = {}',
    'for p in sys.argv[1:]:\n    out[p] = "\\n".join(pg.get_text() for pg in pymupdf.open(p))',
    'sys.stdout.write(json.dumps(out))',
  ].join('\n');
  let last = 'no Python found';
  for (const py of process.env.PYTHON ? [process.env.PYTHON] : ['python', 'python3']) {
    const r = spawnSync(py, ['-c', code, ...absPaths], { encoding: 'utf8', maxBuffer: 256 << 20 });
    if (r.error) continue;
    if (r.status !== 0) { last = (r.stderr || '').trim().split('\n').pop(); continue; }
    try { return { texts: JSON.parse(r.stdout), error: null }; } catch (e) { last = e.message; }
  }
  return { texts: {}, error: last };
}

// ------------------------------------------------------------------ the checker
function check(root, opts = {}) {
  const files = listRepoFiles(root);
  const fileSet = new Set(files);
  const dirSet = new Set(['']);
  for (const f of files) { const parts = f.split('/'); for (let i = 1; i < parts.length; i++) dirSet.add(parts.slice(0, i).join('/')); }
  const bufCache = new Map();
  const buf = (f) => { if (!bufCache.has(f)) bufCache.set(f, fs.readFileSync(path.join(root, f))); return bufCache.get(f); };
  const text = (f) => (fileSet.has(f) && !isBinary(buf(f)) ? buf(f).toString('utf8') : null);
  const md = files.filter((f) => /\.md$/i.test(f));
  const results = [];
  const warnings = [];
  const add = (n, title, details, passNote, status) => results.push({ n, title, status: status || (details.length ? 'FAIL' : 'PASS'), details, passNote });

  // Rule 1: a README.md in every folder but dist/
  {
    const dirs = [...dirSet].filter((d) => d !== 'dist' && !d.startsWith('dist/')).sort();
    const missing = dirs.filter((d) => !fileSet.has(d ? `${d}/README.md` : 'README.md')).map((d) => `${d || '(the repo root)'}/ has no README.md`);
    add(1, 'Every folder has a README.md', missing, `${dirs.length} folders`);
  }

  // Rule 2: every relative link in every .md resolves to a file or folder of the repo
  {
    const lower = new Map([...fileSet, ...dirSet].map((p) => [p.toLowerCase(), p]));
    const bad = [];
    let count = 0;
    for (const f of md) {
      const lines = maskCode(text(f) || '').split('\n');
      const base = f.includes('/') ? f.slice(0, f.lastIndexOf('/')) : '';
      lines.forEach((line, i) => {
        const targets = [];
        for (const m of line.matchAll(/!?\[((?:[^[\]]|\[[^[\]]*\])*)\]\(\s*(<[^>]*>|[^\s)]*)(?:\s+(?:"[^"]*"|'[^']*'))?\s*\)/g)) targets.push(m[2]);
        const def = /^\s{0,3}\[[^\]]+\]:\s*(<[^>]*>|\S+)/.exec(line);
        if (def) targets.push(def[1]);
        for (const m of line.matchAll(/\[\[([^\]]+)\]\]/g)) bad.push(`${f}:${i + 1}  [[${m[1]}]] is a wikilink; write a relative link like [name](path/file.md)`);
        for (let t of targets) {
          t = t.replace(/^<|>$/g, '');
          if (!t || t.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(t)) continue;
          count++;
          let p = t.split('#')[0].split('?')[0];
          try { p = decodeURIComponent(p); } catch { /* keep as written */ }
          const joined = path.posix.normalize(p.startsWith('/') ? p.slice(1) : path.posix.join(base, p)).replace(/\/$/, '');
          const clean = joined === '.' ? '' : joined;
          if (clean.startsWith('..')) { bad.push(`${f}:${i + 1}  ${t} points outside the repo`); continue; }
          if (fileSet.has(clean) || dirSet.has(clean)) continue;
          const near = lower.get(clean.toLowerCase());
          bad.push(`${f}:${i + 1}  ${t} is not in the repo${near ? ` (check the capitals: ${near} exists)` : ''}`);
        }
      });
    }
    add(2, 'Every relative link in a .md file resolves', bad, `${count} links in ${md.length} files; anchors (#...) are not checked`);
  }

  // The text to scan for rules 3 and 4: text files, PDFs (when PyMuPDF is there), and zip entries.
  const scan = [];
  for (const f of files) {
    const b = buf(f);
    if (!isBinary(b)) scan.push({ where: f, text: b.toString('utf8') });
  }
  const pdfs = files.filter((f) => /\.pdf$/i.test(f));
  const pdf = pdfTexts(pdfs.map((f) => path.join(root, f)));
  if (pdf.error) warnings.push(`PDFs not scanned for rules 3 and 4 (${pdf.error}; needs Python with PyMuPDF): ${pdfs.join(', ')}`);
  for (const f of pdfs) { const t = pdf.texts[path.join(root, f)]; if (t) scan.push({ where: `${f} (PDF text)`, text: t }); }
  for (const z of files.filter((f) => /\.zip$/i.test(f))) {
    try {
      for (const e of readZip(buf(z))) if (!isBinary(e.data)) scan.push({ where: `${z} → ${e.name}`, text: e.data.toString('utf8') });
    } catch (e) { warnings.push(`${z} could not be read: ${e.message}`); }
  }
  const lineOf = (s, idx) => s.slice(0, idx).split('\n').length;

  // Rule 3: no secrets
  {
    const hits = [];
    for (const s of scan) {
      for (const p of SECRET_PATTERNS) {
        const m = p.re.exec(s.text);
        if (m) hits.push(`${s.where}:${lineOf(s.text, m.index)}  looks like ${p.name}. Remove it, and rotate that secret`);
      }
    }
    add(3, 'No secrets (pit- tokens, JWTs, Bearer strings, keys)', hits, `${scan.length} texts scanned`);
  }

  // Rule 4: no identifying data from the first build
  {
    const candidates = opts.forbidden ? [path.resolve(opts.forbidden)] : [path.join(root, 'clients', 'check-repo.forbidden.txt'), path.join(root, 'tools', 'check-repo.forbidden.txt')];
    const listFile = candidates.find((f) => fs.existsSync(f));
    if (opts.forbidden && !listFile) {
      add(4, 'No identifying data from the first build', [`--forbidden ${opts.forbidden}: no such file`]);
    } else if (!listFile) {
      add(4, 'No identifying data from the first build', [
        'WARN: no forbidden-strings list, so this rule was NOT checked. Create clients/check-repo.forbidden.txt (one string per line, # for comments) or pass --forbidden <file>.',
      ], null, 'SKIP');
    } else {
      const strings = fs.readFileSync(listFile, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
      const rel = path.relative(root, listFile).split(path.sep).join('/');
      const hits = [];
      if (fileSet.has(rel)) hits.push(`${rel}: the forbidden list itself would be committed. Keep it in clients/ (gitignored)`);
      for (const s of scan) {
        if (s.where === rel) continue;
        const low = s.text.toLowerCase();
        for (const w of strings) {
          const i = low.indexOf(w.toLowerCase());
          if (i >= 0) hits.push(`${s.where}:${lineOf(s.text, i)}  contains "${w}"`);
        }
      }
      for (const f of files) for (const w of strings) if (f.toLowerCase().includes(w.toLowerCase())) hits.push(`${f}  (the path) contains "${w}"`);
      add(4, 'No identifying data from the first build', hits, `${strings.length} strings from ${path.relative(process.cwd(), listFile) || listFile}`);
    }
  }

  // Rule 5: one version in CHANGELOG.md, README.md and dist/, and the zip matches the tree
  let version = null;
  {
    const d = [];
    const cl = text('CHANGELOG.md');
    version = cl && changelogVersion(cl);
    if (!cl) d.push('CHANGELOG.md is missing');
    else if (!version) d.push('CHANGELOG.md has no "## x.y.z" heading');
    const readme = text('README.md');
    if (!readme) d.push('README.md is missing');
    const want = version && `dist/affiliate-program-builder-v${version.version}.zip`;
    if (readme && version) {
      if (!new RegExp(`(^|[^\\d.])v?${escRe(version.version)}(?![\\d.]*\\d)`).test(readme)) d.push(`README.md does not mention version ${version.version}`);
      const others = [...new Set([...readme.matchAll(/\bv(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)\b/g)].map((m) => m[1]).filter((v) => v !== version.version))];
      if (others.length) d.push(`README.md also names version(s) ${others.join(', ')}`);
    }
    const zips = files.filter((f) => /^dist\/[^/]+\.zip$/i.test(f));
    for (const z of zips) if (z !== want) d.push(`${z} is not the current version: delete it, dist/ holds only the current zip`);
    if (want && !fileSet.has(want)) d.push(`${want} is missing. Build it: node tools/build-zip.js`);
    if (want && fileSet.has(want)) {
      try {
        const prefix = 'affiliate-program-builder/';
        const inZip = new Map(readZip(buf(want)).map((e) => [e.name.startsWith(prefix) ? e.name.slice(prefix.length) : e.name, e.crc]));
        const tree = files.filter((f) => !f.startsWith('dist/'));
        const changed = tree.filter((f) => inZip.has(f) && inZip.get(f) !== crc32(buf(f)));
        const missing = tree.filter((f) => !inZip.has(f));
        const extra = [...inZip.keys()].filter((f) => !fileSet.has(f) || f.startsWith('dist/'));
        if (changed.length + missing.length + extra.length) {
          const list = (label, l) => (l.length ? `${label} ${l.slice(0, 8).join(', ')}${l.length > 8 ? ` and ${l.length - 8} more` : ''}` : '');
          d.push(`${want} is out of date (${[list('changed:', changed), list('not in the zip:', missing), list('only in the zip:', extra)].filter(Boolean).join('; ')}). Rebuild: node tools/build-zip.js`);
        }
      } catch (e) { d.push(`${want} cannot be read: ${e.message}`); }
    }
    add(5, 'The version in CHANGELOG.md, README.md and dist/ agrees', d, version ? `${version.version}; ${want} matches the tree` : '');
  }

  // Rule 6: every file and folder listed in REPO-SPEC.md §3 exists
  {
    const tree = parseSpecTree(text('docs/REPO-SPEC.md') || '');
    if (!tree) add(6, 'Every file listed in REPO-SPEC.md §3 exists', ['cannot find the tree block under "## 3." in docs/REPO-SPEC.md']);
    else {
      const missing = [...tree.dirs.filter((d) => !dirSet.has(d)).map((d) => `${d}/`), ...tree.files.filter((f) => !fileSet.has(f))].sort().map((x) => `${x} is missing`);
      add(6, 'Every file listed in REPO-SPEC.md §3 exists', missing, `${tree.files.length} files, ${tree.dirs.length} folders`);
    }
  }

  // Rule 7: every numbered step in process/*.md has a **Check:** before the next step or heading.
  // Steps are numbered list items at the start of a line. process/README.md (the overview) and the
  // "If a step fails" section are not steps.
  {
    const pf = files.filter((f) => /^process\/[^/]+\.md$/.test(f) && !/\/README\.md$/i.test(f));
    const d = [];
    let steps = 0;
    for (const f of pf) {
      const lines = maskCode(text(f) || '').split('\n');
      let inFails = false;
      let failsLevel = 0;
      let hasFails = false;
      let cur = null;
      const close = () => { if (cur) { steps++; if (!cur.ok) d.push(`${f}:${cur.line}  step "${cur.first.slice(0, 60)}" has no **Check:**`); } cur = null; };
      lines.forEach((line, i) => {
        const h = /^(#{1,6})\s+(.*)$/.exec(line);
        if (h) {
          close();
          if (/if a step fails/i.test(h[2])) { inFails = true; hasFails = true; failsLevel = h[1].length; } else if (inFails && h[1].length <= failsLevel) inFails = false;
          return;
        }
        if (/^\*\*if a step fails/i.test(line.trim())) { close(); inFails = true; hasFails = true; failsLevel = 7; return; }
        if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { close(); return; }
        if (/^\d+[.)]\s+/.test(line)) { close(); if (!inFails) cur = { line: i + 1, first: line, ok: false }; }
        if (cur && /\*\*Check(?::\*\*|\*\*:)/.test(line)) cur.ok = true;
      });
      close();
      if (!hasFails) warnings.push(`${f} has no "If a step fails" section (REPO-SPEC §5.2)`);
    }
    if (!pf.length) d.push('no process/*.md step files found');
    add(7, 'Every process/*.md step has a **Check:**', d, `${steps} steps in ${pf.length} files`);
  }

  // Rule 8: every workflow file in spec/workflows/ names its trigger and has a steps table
  {
    const wf = files.filter((f) => /^spec\/workflows\/[^/]+\.md$/.test(f) && !/\/README\.md$/i.test(f));
    const d = [];
    for (const f of wf) {
      const t = maskCode(text(f) || '');
      const trigger = /^#{1,6}\s.*\btrigger\b/im.test(t) || /\*\*\s*trigger\b[^*]*\*\*/i.test(t) || /^\|\s*\**\s*trigger\b/im.test(t);
      const lines = t.split('\n');
      let table = false;
      for (let i = 0; i + 2 < lines.length && !table; i++) {
        if (!/^\s*\|/.test(lines[i]) || !/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(lines[i + 1]) || !/^\s*\|/.test(lines[i + 2])) continue;
        const head = lines[i].split('|').map((c) => c.replace(/\*/g, '').trim().toLowerCase());
        table = head.some((c) => /^(#|no\.?|n)$/.test(c) || /\bsteps?\b|\bactions?\b/.test(c));
      }
      if (!trigger) d.push(`${f} does not name its trigger (a "Trigger" heading, a **Trigger:** label or a Trigger table row)`);
      if (!table) d.push(`${f} has no steps table (a table whose header has #, Step or Action)`);
    }
    if (!wf.length) d.push('no workflow files in spec/workflows/');
    add(8, 'Every workflow in spec/workflows/ names its trigger and lists steps in a table', d, `${wf.length} workflows`);
  }

  return { files, results, warnings };
}

function main() {
  const argv = process.argv.slice(2);
  const opts = { strict: argv.includes('--strict') };
  const at = (flag) => { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : undefined; };
  opts.forbidden = at('--forbidden');
  const root = at('--root') ? path.resolve(at('--root')) : findRepoRoot();
  if (!root || !fs.existsSync(path.join(root, 'docs', 'REPO-SPEC.md'))) {
    console.error('Cannot find the repo root (a folder with docs/REPO-SPEC.md). Pass --root <folder>.');
    process.exit(1);
  }
  const { files, results, warnings } = check(root, opts);
  console.log(`check-repo · ${root} · ${files.length} files in the repo\n`);
  for (const r of results) {
    console.log(`${r.status.padEnd(4)}  ${r.n}. ${r.title}${r.status === 'PASS' && r.passNote ? `: ${r.passNote}` : r.details.length && r.status === 'FAIL' ? ` (${r.details.length})` : ''}`);
    if (r.status !== 'PASS') for (const x of r.details) console.log(`        - ${x}`);
  }
  for (const w of warnings) console.log(`WARN  ${w}`);
  const n = (s) => results.filter((r) => r.status === s).length;
  console.log(`\nResult: ${n('PASS')} PASS · ${n('FAIL')} FAIL · ${n('SKIP')} SKIP${opts.strict && n('SKIP') ? ' (--strict: a skip counts as a failure)' : ''}`);
  process.exit(n('FAIL') || (opts.strict && n('SKIP')) ? 1 : 0);
}

if (require.main === module) main();

module.exports = { findRepoRoot, listRepoFiles, compileGitignore, isIgnored, crc32, readZip, parseSpecTree, changelogVersion, check };
