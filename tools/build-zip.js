#!/usr/bin/env node
// Writes dist/affiliate-program-builder-v<version>.zip: the whole repo as git would commit it, for
// AI agents that cannot clone GitHub. It writes only inside dist/ and never touches GHL.
//
//   node tools/build-zip.js                     the version comes from CHANGELOG.md's first "## x.y.z" heading
//   node tools/build-zip.js --version 1.2.3     any version (for a test build; delete that zip afterwards)
//   node tools/build-zip.js --date 2026-09-25   the timestamp inside the zip (default: the CHANGELOG
//                                               heading's date, else today)
//   node tools/build-zip.js --dry-run           list what would go in, write nothing
//
// In the zip: every file of the repo, under one folder "affiliate-program-builder/", except .git/,
// clients/ (client work), dist/ itself and whatever .gitignore excludes. The file list is the one
// check-repo.js uses. Every entry gets the same timestamp, so the same files give the same zip.
// After writing, it reads the zip back and checks every file against the original.
// It does not delete old zips: dist/ must hold only the current one, and check-repo.js says so.
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { findRepoRoot, listRepoFiles, crc32, readZip, changelogVersion } = require('./check-repo.js');

const PREFIX = 'affiliate-program-builder/';

function die(msg) { console.error(msg); process.exit(1); }

// A zip file: a local header + the data for each file, then the central directory, then the end
// record. Deflate when it makes the file smaller, else store. UTF-8 names (flag bit 11).
function buildZip(entries, when) {
  const time = (when.getHours() << 11) | (when.getMinutes() << 5) | Math.floor(when.getSeconds() / 2);
  const date = ((when.getFullYear() - 1980) << 9) | ((when.getMonth() + 1) << 5) | when.getDate();
  const parts = [];
  const central = [];
  let offset = 0;
  for (const e of entries) {
    const name = Buffer.from(e.name, 'utf8');
    const crc = crc32(e.data);
    let method = 0;
    let comp = e.data;
    if (e.data.length) {
      const d = zlib.deflateRawSync(e.data, { level: 9 });
      if (d.length < e.data.length) { method = 8; comp = d; }
    }
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4); // version needed: 2.0
    lh.writeUInt16LE(0x0800, 6); // UTF-8 names
    lh.writeUInt16LE(method, 8);
    lh.writeUInt16LE(time, 10);
    lh.writeUInt16LE(date, 12);
    lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(comp.length, 18);
    lh.writeUInt32LE(e.data.length, 22);
    lh.writeUInt16LE(name.length, 26);
    lh.writeUInt16LE(0, 28);
    parts.push(lh, name, comp);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0);
    ch.writeUInt16LE(0x0314, 4); // made by: Unix, 2.0 (so the file mode below is used)
    ch.writeUInt16LE(20, 6);
    ch.writeUInt16LE(0x0800, 8);
    ch.writeUInt16LE(method, 10);
    ch.writeUInt16LE(time, 12);
    ch.writeUInt16LE(date, 14);
    ch.writeUInt32LE(crc, 16);
    ch.writeUInt32LE(comp.length, 20);
    ch.writeUInt32LE(e.data.length, 24);
    ch.writeUInt16LE(name.length, 28);
    // extra length, comment length, disk number, internal attributes: all 0
    ch.writeUInt32LE((0o100644 << 16) >>> 0, 38); // a regular file, rw-r--r--
    ch.writeUInt32LE(offset, 42);
    central.push(ch, name);
    offset += 30 + name.length + comp.length;
  }
  const cd = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(cd.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...parts, cd, end]);
}

function main() {
  const argv = process.argv.slice(2);
  const at = (flag) => { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : undefined; };
  const root = findRepoRoot();
  if (!root) die('Cannot find the repo root (a folder with docs/REPO-SPEC.md) above tools/.');

  const clFile = path.join(root, 'CHANGELOG.md');
  const cl = fs.existsSync(clFile) ? changelogVersion(fs.readFileSync(clFile, 'utf8')) : null;
  const version = at('--version') || (cl && cl.version);
  if (!version) die('No version: CHANGELOG.md has no "## x.y.z" heading. Add one, or pass --version x.y.z.');
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) die(`"${version}" is not a version like 1.2.3.`);
  if (cl && at('--version') && cl.version !== version) console.log(`note: CHANGELOG.md says ${cl.version}; building ${version} as asked.`);
  const dateText = at('--date') || (cl && !at('--version') && cl.date) || new Date().toISOString().slice(0, 10);
  const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateText);
  if (!dm) die(`"${dateText}" is not a date like 2026-09-25.`);
  const when = new Date(Number(dm[1]), Number(dm[2]) - 1, Number(dm[3]), 12, 0, 0);

  const files = listRepoFiles(root).filter((f) => !f.startsWith('dist/'));
  if (files.length > 65535) die('Too many files for a plain zip.');
  const out = path.join(root, 'dist', `affiliate-program-builder-v${version}.zip`);
  if (argv.includes('--dry-run')) {
    for (const f of files) console.log(`  ${f}`);
    console.log(`\nDry run: ${files.length} files would go into ${path.relative(root, out)}. Nothing was written.`);
    return;
  }

  const entries = files.map((f) => ({ name: PREFIX + f, file: f, data: fs.readFileSync(path.join(root, f)) }));
  const zip = buildZip(entries, when);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const tmp = `${out}.tmp`;
  fs.writeFileSync(tmp, zip);
  fs.renameSync(tmp, out);

  // Read it back: every file present, same bytes.
  const back = readZip(fs.readFileSync(out));
  const byName = new Map(back.map((e) => [e.name, e.data]));
  const wrong = entries.filter((e) => !byName.has(e.name) || !byName.get(e.name).equals(e.data)).map((e) => e.file);
  if (back.length !== entries.length || wrong.length) die(`The zip does not read back correctly: ${wrong.join(', ') || `${back.length} entries, expected ${entries.length}`}`);

  const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
  console.log(`Wrote ${path.relative(root, out).split(path.sep).join('/')}: ${entries.length} files, ${kb(zip.length)} (from ${kb(entries.reduce((s, e) => s + e.data.length, 0))}), dated ${dateText}.`);
  console.log(`Verified: read back, all ${back.length} files match.`);
  const others = fs.readdirSync(path.dirname(out)).filter((f) => /\.zip$/i.test(f) && f !== path.basename(out));
  if (others.length) console.log(`Other zips in dist/: ${others.join(', ')}. Delete them: dist/ holds only the current version (check-repo.js fails otherwise).`);
}

if (require.main === module) main();
module.exports = { buildZip };
