#!/usr/bin/env node
'use strict';
/*
 * tools/flowcharts/render.js - turns a flowchart data file into boxes-and-arrows pages.
 * Node 18+ only: no npm installs, no network. It never touches GHL.
 *
 * Reads a data file (a CommonJS .js file that exports an object, or a .json file) and writes ONE
 * self-contained HTML file: inline CSS, plus a small inline script that measures the laid-out
 * boxes and draws the arrows as SVG. With --pdf it prints that HTML to a PDF with headless Edge or
 * Chrome, then reads back a layout check per page (fit, smallest text, overlaps, arrows that cross
 * boxes or point at nothing). With --png it also renders PNG previews (Python + PyMuPDF).
 *
 *   node tools/flowcharts/render.js <data.js> [--out file.html] [--pdf [file.pdf]] [--check] [--png dir]
 *
 * Output paths: meta.output and meta.pdf in the data file, relative to the data file's folder;
 * without them, <data>.html and <data>.pdf next to the data file. --out and --pdf <file> override.
 * The browser: Edge or Chrome is found by itself; set FLOWCHART_BROWSER to the browser's path to
 * choose one. FLOWCHART_DATE fixes the "generated" date in the footers.
 *
 * Data shape: { meta: {...}, pages: [ {id, type, title, ...}, ... ] }
 *   Page types: map | pipeline | flow | cards. See README.md next to this file.
 *   Box types: trigger | action | condition | wait | task | stage | end | info
 *              (+ planned: true on any box for a dashed "not built yet" box).
 *   Arrow styles: auto (default) | manual (a person does it) | planned (dashed).
 *   Text fields accept **bold**, `code`, and {p:page-id} (becomes "p.N").
 * Placeholders left in the data (<CLIENT_NAME> and the like) are listed as warnings, so a PDF
 * with blanks in it does not reach a client unnoticed. So is a money amount followed by "%"
 * ("$250%"): a fee typed into RATE while the pages still print a monthly percentage.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');
const { pathToFileURL } = require('url');

// ------------------------------------------------------------------ vocabulary
const TYPES = {
  trigger:   { label: 'Trigger',   legend: 'Trigger or form' },
  action:    { label: 'Action',    legend: 'Automatic step' },
  condition: { label: 'If / else', legend: 'If / else split' },
  wait:      { label: 'Wait',      legend: 'Wait' },
  task:      { label: 'Task',      legend: 'Task or alert (a person)' },
  stage:     { label: 'Stage',     legend: 'Pipeline or stage' },
  end:       { label: 'End',       legend: 'End: flow stops' },
  info:      { label: 'Other',     legend: 'Other: tool, calendar' },
};
const EDGE_STYLES = {
  auto:    'Happens automatically',
  manual:  'A person does it',
  planned: 'Planned, not built yet',
};

const ICONS = {
  trigger: '<svg viewBox="0 0 12 12"><path d="M7.2 .7 2.1 6.9h3.3l-.9 4.4 5.4-6.4H6.6z" fill="currentColor"/></svg>',
  action: '<svg viewBox="0 0 12 12"><circle cx="6" cy="6" r="4.9" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M5 3.6 7.4 6 5 8.4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  condition: '<svg viewBox="0 0 12 12"><path d="M6 .9 11.1 6 6 11.1.9 6z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  wait: '<svg viewBox="0 0 12 12"><circle cx="6" cy="6" r="4.9" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M6 3.2V6l2 1.4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  task: '<svg viewBox="0 0 12 12"><rect x="1.2" y="1.2" width="9.6" height="9.6" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M3.6 6.1 5.3 7.8 8.5 4.3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  stage: '<svg viewBox="0 0 12 12"><rect x="1" y="1.5" width="2.7" height="9" rx=".6" fill="currentColor"/><rect x="4.65" y="1.5" width="2.7" height="6.5" rx=".6" fill="currentColor"/><rect x="8.3" y="1.5" width="2.7" height="4" rx=".6" fill="currentColor"/></svg>',
  end: '<svg viewBox="0 0 12 12"><rect x="2" y="2" width="8" height="8" rx="1.4" fill="currentColor"/></svg>',
  info: '<svg viewBox="0 0 12 12"><circle cx="6" cy="6" r="4.9" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M6 5.3v3.3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="6" cy="3.4" r=".9" fill="currentColor"/></svg>',
};

// ------------------------------------------------------------------ CLI
function parseArgs(argv) {
  const a = { data: null, out: null, pdf: undefined, check: false, png: null, help: false };
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i];
    if (x === '--out') a.out = argv[++i];
    else if (x === '--pdf') {
      const n = argv[i + 1];
      if (n && /\.pdf$/i.test(n)) { a.pdf = n; i++; } else a.pdf = true;
    } else if (x === '--check') a.check = true;
    else if (x === '--png') a.png = argv[++i];
    else if (x === '--help' || x === '-h') a.help = true;
    else if (!a.data) a.data = x;
    else throw new Error('Unexpected argument: ' + x);
  }
  return a;
}

function loadData(p) {
  const abs = path.resolve(p);
  if (/\.json$/i.test(abs)) return JSON.parse(fs.readFileSync(abs, 'utf8'));
  delete require.cache[require.resolve(abs)];
  return require(abs);
}

const pad2 = (n) => String(n).padStart(2, '0');
function today() {
  if (process.env.FLOWCHART_DATE) return process.env.FLOWCHART_DATE;
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

// ------------------------------------------------------------------ text helpers
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function makeCtx(data) {
  const pages = data.pages || [];
  const index = new Map(pages.map((p, i) => [p.id, i + 1]));
  const warnings = [];
  const ctx = {
    meta: data.meta || {},
    total: pages.length,
    date: (data.meta && data.meta.generated) || today(),
    warnings,
    pageNo(id) {
      if (!index.has(id)) { warnings.push(`Unknown page reference "${id}"`); return '?'; }
      return index.get(id);
    },
    pageLabel(id) { return 'p.' + ctx.pageNo(id); },
    fmt(text) {
      let s = esc(text);
      s = s.replace(/\{p:([\w-]+)\}/g, (m, id) => ctx.pageLabel(id));
      s = s.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
      s = s.replace(/`([^`]+?)`/g, '<code>$1</code>');
      return s;
    },
  };
  return ctx;
}

const nid = (page, key) => `${page.id}__${String(key).replace(/[^\w-]+/g, '-')}`;
const specScript = (obj) => `<script type="application/json" class="spec">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

// ------------------------------------------------------------------ boxes
function nodeHtml(n, ctx, id, extraHtml, extraStyle) {
  const t = TYPES[n.type] ? n.type : 'action';
  const cls = ['node', 't-' + t];
  if (n.planned) cls.push('planned');
  if (n.diff) cls.push('diff');
  if (t === 'end') cls.push('endpill');
  if (n.className) cls.push(n.className);
  const styles = [];
  if (n.width) styles.push(`width:${n.width}px`);
  if (extraStyle) styles.push(extraStyle);
  const style = styles.length ? ` style="${styles.join(';')}"` : '';
  const idAttr = id ? ` id="${id}"` : '';

  if (t === 'end') {
    return `<div class="${cls.join(' ')}"${idAttr}${style}><div class="t">${ICONS.end}<span>${ctx.fmt(n.title || 'End')}</span></div>` +
      (n.desc ? `<div class="d">${ctx.fmt(n.desc)}</div>` : '') + (extraHtml || '') + '</div>';
  }
  const right = [];
  if (n.diff) right.push(`<span class="dbadge">${esc(n.diffLabel || 'Different')}</span>`);
  if (n.planned && n.plannedBadge !== false) right.push('<span class="pbadge">Planned</span>');
  if (n.ref) right.push(`<a class="ref" href="#${esc(n.ref)}">${esc(ctx.pageLabel(n.ref))}</a>`);
  const kicker = n.kicker != null ? n.kicker : TYPES[t].label;
  let h = `<div class="${cls.join(' ')}"${idAttr}${style}>`;
  h += `<div class="k">${ICONS[t]}<span class="kt">${ctx.fmt(kicker)}</span>${right.length ? `<span class="kr">${right.join('')}</span>` : ''}</div>`;
  if (n.title) h += `<div class="t">${ctx.fmt(n.title)}</div>`;
  if (n.ghlId) h += `<div class="cid">${esc(n.ghlIdLabel || 'id')} ${esc(n.ghlId)}</div>`;
  if (n.desc) h += `<div class="d">${ctx.fmt(n.desc)}</div>`;
  for (const x of [].concat(n.note || [])) h += `<div class="n"><b>Note:</b> ${ctx.fmt(x)}</div>`;
  for (const b of [].concat(n.badges || [])) h += badgeHtml(b, ctx);
  h += (extraHtml || '') + '</div>';
  return h;
}

function badgeHtml(b, ctx) {
  const kinds = {
    set: { icon: ICONS.action, lead: 'Set by' },
    trig: { icon: ICONS.trigger, lead: 'Starts' },
    stop: { icon: ICONS.end, lead: '' },
  };
  const k = kinds[b.kind] || kinds.set;
  const lead = b.lead != null ? b.lead : k.lead;
  return `<div class="badge b-${esc(b.kind || 'set')}">${k.icon}<span>${lead ? esc(lead) + ' ' : ''}${ctx.fmt(b.text)}</span></div>`;
}

function edgeSpec(e, page, ctx, resolve) {
  const r = resolve || ((k) => nid(page, k));
  const out = {
    from: r(e.from), to: r(e.to),
    style: e.style || 'auto',
  };
  for (const k of ['fromSide', 'toSide', 'fromAt', 'toAt', 'midOffset', 'midY', 'clearance', 'labelPos', 'labelAt', 'labelSeg', 'labelDx', 'labelDy', 'labelWidth', 'gutter']) {
    if (e[k] != null) out[k] = e[k];
  }
  if (e.label) out.label = ctx.fmt(e.label);
  return out;
}

// ------------------------------------------------------------------ page type: map
function renderMap(page, ctx) {
  const g = page.grid || {};
  const cols = g.cols || Math.max(...page.nodes.map((n) => n.at[1] + (n.span ? n.span[1] : 1)));
  const tmpl = g.template || `repeat(${cols}, minmax(0, 1fr))`;
  const style = `grid-template-columns:${tmpl};column-gap:${g.colGap != null ? g.colGap : 34}px;row-gap:${g.rowGap != null ? g.rowGap : 44}px`;
  let cells = '';
  for (const n of page.nodes) {
    const [r, c] = n.at;
    const [rs, cs] = n.span || [1, 1];
    cells += `<div class="cell${n.stretch ? ' stretch' : ''}" style="grid-row:${r + 1} / span ${rs};grid-column:${c + 1} / span ${cs}">` +
      nodeHtml(n, ctx, nid(page, n.id)) + '</div>';
  }
  const edges = (page.edges || []).map((e) => edgeSpec(e, page, ctx));
  return { full: true, html: `<div class="dg map" style="${style}">${cells}<svg class="edges"></svg>${specScript({ edges })}</div>` };
}

// ------------------------------------------------------------------ page type: pipeline
function renderPipeline(page, ctx) {
  const stages = page.stages || [];
  const per = page.perRow || stages.length;
  const tmpl = `grid-template-columns:repeat(${per}, minmax(0, 1fr));column-gap:${page.colGap != null ? page.colGap : 26}px`;
  const side = page.side || null;
  const sideStages = side ? side.stages || [] : [];
  const ids = stages.map((s, i) => nid(page, s.id || 'stage' + i));
  const sideIds = sideStages.map((s, i) => nid(page, s.id || 'side' + i));
  const findStage = (key) => {
    let i = stages.findIndex((s) => s.id === key || s.title === key);
    if (i >= 0) return { id: ids[i], idx: i, side: false };
    i = sideStages.findIndex((s) => s.id === key || s.title === key);
    if (i >= 0) return { id: sideIds[i], idx: i, side: true };
    ctx.warnings.push(`${page.id}: unknown stage "${key}"`);
    return { id: nid(page, key), idx: -1, side: false };
  };
  const edges = [];
  const loops = page.loops || [];
  const rows = [];
  for (let i = 0; i < stages.length; i += per) rows.push(stages.slice(i, i + per).map((s, k) => ({ s, i: i + k })));

  const stageNode = (s, i, isSide, id) => {
    const n = {
      type: s.type || 'stage',
      kicker: s.kicker || (isSide ? 'Side stage' : `Stage ${i + 1}`),
      title: s.title,
      desc: s.note,
      note: s.flag,
      planned: s.planned,
      ref: s.ref,
      badges: [].concat(s.setBy ? [{ kind: 'set', text: s.setBy }] : [], s.triggers ? [{ kind: 'trig', text: s.triggers }] : [], s.badges || []),
    };
    return nodeHtml(n, ctx, id);
  };
  const extraRow = (list, keyField, cls, rowStageIdx) => {
    let h = `<div class="prow ${cls}" style="${tmpl}">`;
    for (let c = 0; c < per; c++) {
      const e = list.find((x) => findStage(x[keyField]).idx === rowStageIdx[c]);
      h += '<div class="pcell">';
      if (e) {
        const eid = nid(page, `${cls}-${e[keyField]}`);
        h += nodeHtml(e, ctx, eid);
        const st = findStage(e[keyField]).id;
        const edge = cls === 'entries'
          ? { from: eid, to: st, fromSide: 'bottom', toSide: 'top', style: e.style || 'auto' }
          : { from: st, to: eid, fromSide: 'bottom', toSide: 'top', style: e.style || 'manual' };
        if (e.label) edge.label = ctx.fmt(e.label);
        for (const k of ['labelPos', 'labelWidth', 'labelDx', 'labelDy']) if (e[k] != null) edge[k] = e[k];
        edges.push(edge);
      }
      h += '</div>';
    }
    return h + '</div>';
  };

  let html = '<div class="dg pipe">';
  rows.forEach((row, ri) => {
    const rowIdx = [];
    for (let c = 0; c < per; c++) rowIdx.push(row[c] ? row[c].i : -2);
    const ents = (page.entries || []).filter((e) => row.some((x) => x.i === findStage(e.to).idx && !findStage(e.to).side));
    if (ents.length) html += extraRow(ents, 'to', 'entries', rowIdx);
    const hasLoop = loops.some((l) => row.some((x) => x.i === findStage(l.from).idx));
    html += `<div class="prow stages${hasLoop ? ' has-loop' : ''}" style="${tmpl}">`;
    for (const x of row) html += `<div class="pcell">${stageNode(x.s, x.i, false, ids[x.i])}</div>`;
    html += '</div>';
    const exs = (page.exits || []).filter((e) => row.some((x) => x.i === findStage(e.from).idx));
    if (exs.length) html += extraRow(exs, 'from', 'exits', rowIdx);
  });
  if (side && sideStages.length) {
    html += `<div class="pside">${ctx.fmt(side.label || 'Side stages')}</div><div class="prow stages side" style="${tmpl}">`;
    const used = new Map();
    sideStages.forEach((s, i) => used.set(s.col != null ? s.col : i, i));
    for (let c = 0; c < per; c++) {
      html += '<div class="pcell">';
      if (used.has(c)) { const i = used.get(c); html += stageNode(sideStages[i], i, true, sideIds[i]); }
      html += '</div>';
    }
    html += '</div>';
  }
  // arrows between consecutive main stages
  for (let i = 1; i < stages.length; i++) {
    const wrap = Math.floor((i - 1) / per) !== Math.floor(i / per);
    const e = { from: ids[i - 1], to: ids[i], style: stages[i].arrowIn || page.arrowStyle || 'manual' };
    if (wrap) Object.assign(e, { fromSide: 'bottom', toSide: 'top' });
    if (stages[i].arrowLabel) e.label = ctx.fmt(stages[i].arrowLabel);
    edges.push(e);
  }
  for (const l of loops) {
    edges.push(Object.assign(edgeSpec(Object.assign({ fromSide: 'bottom', toSide: 'bottom', clearance: 24, labelPos: 'below' }, l), page, ctx, (k) => findStage(k).id)));
  }
  for (const e of page.edges || []) edges.push(edgeSpec(e, page, ctx, (k) => findStage(k).id));
  html += `<svg class="edges"></svg>${specScript({ edges })}</div>`;
  return { full: true, html };
}

// ------------------------------------------------------------------ page type: flow
function renderFlow(page, ctx) {
  const L = Object.assign({ nodeWidth: 300, branchWidth: 260, nestedWidth: 210, colGap: 80, branchGap: 22, gap: 26 }, page.layout || {});
  const edges = [];
  let counter = 0;
  const newId = (s) => nid(page, s.id || 's' + (++counter));

  function seq(steps, depth) {
    let html = '<div class="fseq">';
    let first = null;
    let tails = [];
    for (const s of steps) {
      const id = newId(s);
      if (!first) first = id;
      for (const t of tails) edges.push({ from: t, to: id, fromSide: 'bottom', toSide: 'top', style: s.arrowIn || 'auto' });
      html += nodeHtml(s, ctx, id);
      if (s.branches && s.branches.length) {
        const bw = depth === 0 ? L.branchWidth : L.nestedWidth;
        html += `<div class="branches" style="gap:${L.branchGap}px">`;
        tails = [];
        for (const b of s.branches) {
          const w = b.width || bw;
          const r = seq(b.steps || [], depth + 1);
          html += `<div class="branch" style="--nw:${w}px"><div class="blabel">${ctx.fmt(b.label)}${b.sub ? `<span>${ctx.fmt(b.sub)}</span>` : ''}</div>${r.html}</div>`;
          if (r.first) edges.push({ from: id, to: r.first, fromSide: 'bottom', toSide: 'top', fromAt: 0.5, midOffset: 11, style: 'auto' });
          tails.push(...r.tails);
        }
        html += '</div>';
      } else {
        tails = s.type === 'end' ? [] : [id];
      }
    }
    html += '</div>';
    return { html, first, tails };
  }

  const cols = [];
  for (const s of page.steps || []) {
    if (!cols.length || (s.newColumn && cols[cols.length - 1].length)) cols.push([]);
    cols[cols.length - 1].push(s);
  }
  let html = `<div class="dg flow" style="column-gap:${L.colGap}px;--vgap:${L.gap}px">`;
  const info = [];
  cols.forEach((col, ci) => {
    const colId = nid(page, 'col' + ci);
    const w = col[0].colWidth || L.nodeWidth;
    const r = seq(col, 0);
    html += `<div class="fcol" id="${colId}" style="--nw:${w}px">${r.html}</div>`;
    info.push({ colId, first: r.first, tails: r.tails });
  });
  for (let i = 1; i < info.length; i++) {
    for (const t of info[i - 1].tails) {
      edges.push({ from: t, to: info[i].first, fromSide: 'right', toSide: 'left', gutter: [info[i - 1].colId, info[i].colId], style: 'auto' });
    }
  }
  html += `<svg class="edges"></svg>${specScript({ edges })}</div>`;
  return { full: false, html };
}

// ------------------------------------------------------------------ page type: cards
function renderCards(page, ctx) {
  let html = '<div class="dg cardsdg">';
  (page.groups || []).forEach((g, gi) => {
    html += `<section class="cgroup" style="grid-column:span ${g.span || 12}"><h2>${ctx.fmt(g.title)}</h2>`;
    html += `<div class="cards" style="grid-template-columns:repeat(${g.cols || 1}, minmax(0, 1fr))">`;
    (g.cards || []).forEach((c, ci) => {
      let extra = '';
      if (c.chips) {
        extra += '<div class="chips">' + c.chips.map((ch) => {
          const used = /\*$/.test(ch);
          return `<span class="chip${used ? ' used' : ''}">${esc(used ? ch.slice(0, -1) : ch)}</span>`;
        }).join('') + '</div>';
      }
      if (c.foot) extra += `<div class="cfoot">${ctx.fmt(c.foot)}</div>`;
      const n = Object.assign({ type: 'info' }, c);
      html += nodeHtml(n, ctx, nid(page, c.id || `g${gi}c${ci}`), extra, c.span ? `grid-column:span ${c.span}` : '');
    });
    html += '</div>';
    if (g.note) html += `<div class="gnote">${ctx.fmt(g.note)}</div>`;
    html += '</section>';
  });
  html += `<svg class="edges"></svg>${specScript({ edges: [] })}</div>`;
  return { full: true, html };
}

// ------------------------------------------------------------------ page shell
function legendHtml() {
  const items = Object.keys(TYPES).map((t) =>
    `<div class="li"><span class="sw t-${t}">${ICONS[t]}</span><span>${esc(TYPES[t].legend)}</span></div>`);
  items.push(`<div class="li"><span class="sw t-info planned">${ICONS.info}</span><span>Dashed: not built yet</span></div>`);
  for (const [k, text] of Object.entries(EDGE_STYLES)) {
    items.push(`<div class="li"><svg class="ln" viewBox="0 0 26 10"><path class="edge ${k}" d="M1 5H24" marker-end="url(#fc-arrow-${k})"/></svg><span>${esc(text)}</span></div>`);
  }
  return `<div class="legend">${items.join('')}</div>`;
}

function renderPage(page, i, ctx) {
  const renderers = { map: renderMap, pipeline: renderPipeline, flow: renderFlow, cards: renderCards };
  const fn = renderers[page.type];
  if (!fn) throw new Error(`Page "${page.id}": unknown type "${page.type}"`);
  const body = fn(page, ctx);
  const m = ctx.meta;
  const idLine = page.ghlId ? `<div class="ph-id">${esc(page.ghlIdLabel || 'GHL id')} ${esc(page.ghlId)}</div>` : '';
  const right = [m.client, m.built].filter(Boolean).map((x) => ctx.fmt(x)).join(' · ');
  let h = `<section class="page" id="${esc(page.id)}" data-no="${i + 1}">`;
  h += `<header class="ph"><div class="ph-left">${page.kind ? `<div class="ph-kind">${ctx.fmt(page.kind)}</div>` : ''}<h1>${ctx.fmt(page.title)}</h1></div><div class="ph-right"><div>${right}</div>${idLine}</div></header>`;
  if (page.summary) h += `<div class="summary">${ctx.fmt(page.summary)}</div>`;
  if (page.legend) h += legendHtml();
  if (page.banner) h += `<div class="banner${page.planned ? ' planned' : ''}">${ctx.fmt(page.banner)}</div>`;
  h += `<div class="area${page.valign === 'top' ? ' top' : ''}"><div class="fit${body.full ? ' full' : ''}">${body.html}</div></div>`;
  for (const fnote of [].concat(page.footnote || [])) h += `<div class="pnote">${ctx.fmt(fnote)}</div>`;
  const foot = [m.footer, `generated ${ctx.date}`].filter(Boolean).map((x) => ctx.fmt(x)).join(' · ');
  h += `<footer class="pf"><span>${foot}</span><span>Page ${i + 1} of ${ctx.total}</span></footer></section>`;
  return h;
}

const CSS = String.raw`
@page { size: letter landscape; margin: 0.4in; }
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif; color: #1F2430; font-size: 9.5pt; line-height: 1.25; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.fc-defs { position: absolute; width: 0; height: 0; overflow: hidden; }
.page { width: 10.16in; height: 7.64in; position: relative; display: flex; flex-direction: column; overflow: hidden; background: #fff; break-after: page; page-break-after: always; }
.page:last-of-type { break-after: auto; page-break-after: auto; }
@media screen {
  body { background: #D9DBDF; padding: 18px 0 1px; }
  .page { box-sizing: content-box; padding: 0.4in; margin: 0 auto 18px; box-shadow: 0 1px 4px rgba(0,0,0,.22); }
}
.ph { flex: none; display: flex; justify-content: space-between; align-items: flex-end; gap: 18px; border-bottom: 1.6px solid #1F2430; padding-bottom: 5px; }
.ph-kind { font-size: 8.5pt; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; color: #6A707A; }
.ph h1 { margin: 0; font-size: 17pt; line-height: 1.15; font-weight: 700; }
.ph-id { font: 8.5pt/1.3 Consolas, "Courier New", monospace; color: #8C929C; margin-top: 1px; }
.ph-right { text-align: right; font-size: 9pt; color: #5A606A; white-space: nowrap; padding-bottom: 2px; }
.summary { flex: none; margin-top: 6px; font-size: 10.5pt; color: #2C323D; }
.banner { flex: none; margin-top: 7px; border: 1.3px solid #C99A33; background: #FFF7E3; border-radius: 6px; padding: 5px 10px; font-size: 10pt; }
.banner.planned { border-style: dashed; border-color: #5D6B8F; background: #F3F5FA; }
.area { flex: 1 1 auto; min-height: 0; position: relative; display: flex; align-items: center; justify-content: center; padding: 10px 0 8px; }
.area.top { align-items: flex-start; }
.fit { position: relative; flex: none; }
.fit.full { width: 100%; }
.pnote { flex: none; font-size: 9pt; color: #4A505A; margin: 0 0 4px; }
.pf { flex: none; display: flex; justify-content: space-between; border-top: 1px solid #D3D6DB; padding-top: 3px; font-size: 8.5pt; color: #7A808A; }

.legend { flex: none; margin-top: 6px; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 3px 10px; border: 1px solid #DDE0E4; border-radius: 6px; padding: 4px 8px; background: #FAFAFB; }
.li { display: flex; align-items: center; gap: 6px; font-size: 8.5pt; color: #3A404A; line-height: 1.15; white-space: nowrap; }
.sw { flex: none; width: 24px; height: 15px; border: 1.2px solid var(--bd); border-left-width: 4px; border-radius: 3px; background: var(--bg); color: var(--ink); display: inline-flex; align-items: center; justify-content: center; }
.sw svg { width: 9px; height: 9px; }
.sw.planned { border-style: dashed; background: #fff; }
.sw.t-end { border-radius: 8px; border-left-width: 1.2px; }
.ln { flex: none; width: 26px; height: 10px; overflow: visible; }
.ln path { fill: none; stroke-width: 1.7; }

.t-trigger { --bg: #E4F2E8; --bd: #3E8A5B; --ink: #2B6843; }
.t-action { --bg: #E5EDF8; --bd: #3F6EA9; --ink: #2D5787; }
.t-condition { --bg: #FBF0D8; --bd: #B7872A; --ink: #85611A; }
.t-wait { --bg: #EEE9F7; --bd: #7A63A8; --ink: #5C4986; }
.t-task { --bg: #FBE7E0; --bd: #BE6346; --ink: #964830; }
.t-stage { --bg: #E0EFEE; --bd: #3A8782; --ink: #286561; }
.t-end { --bg: #ECEDEF; --bd: #6E7480; --ink: #4A4F58; }
.t-info { --bg: #FFFFFF; --bd: #8A909A; --ink: #555B65; }

.node { position: relative; z-index: 1; width: var(--nw, 280px); background: var(--bg); border: 1.3px solid var(--bd); border-left-width: 5px; border-radius: 6px; padding: 4px 8px 5px; overflow-wrap: break-word; }
.node.planned { border-style: dashed; background: #fff; }
.node .k { display: flex; align-items: flex-start; gap: 4px; font-size: 8.5pt; line-height: 1.25; font-weight: 700; letter-spacing: .035em; text-transform: uppercase; color: var(--ink); }
.node .k svg { width: 10px; height: 10px; flex: none; margin-top: 2px; }
.node .k .kt { flex: 1 1 auto; }
.node .k .kr { display: flex; gap: 4px; flex: none; }
.ref, .pbadge, .dbadge { font-size: 8.5pt; line-height: 1.2; letter-spacing: 0; text-transform: none; font-weight: 700; border-radius: 8px; padding: 0 5px; white-space: nowrap; }
.ref { color: var(--ink); border: 1px solid var(--bd); background: #fff; text-decoration: none; }
.pbadge { color: #fff; background: #5D6B8F; }
.dbadge { color: #5E4300; background: #F6D679; }
.node .t { font-size: 10.5pt; line-height: 1.2; font-weight: 700; margin-top: 1px; }
.node .d { font-size: 9.5pt; line-height: 1.26; margin-top: 2px; color: #262C37; }
.node .n { font-size: 9pt; line-height: 1.24; margin-top: 3px; color: #474D58; font-style: italic; }
.node .n b { font-style: normal; color: #2E343E; }
.node code { font-family: Consolas, "Courier New", monospace; font-size: .93em; background: rgba(255,255,255,.8); border: 1px solid rgba(0,0,0,.13); border-radius: 3px; padding: 0 3px; white-space: nowrap; }
.node.diff { box-shadow: 0 0 0 3px #F3CF5E; }
.node.endpill { width: auto; min-width: 76px; max-width: var(--nw, 220px); border-left-width: 1.3px; border-radius: 999px; padding: 3px 14px 4px; text-align: center; }
.node.endpill .t { display: inline-flex; align-items: center; gap: 5px; color: var(--ink); }
.node.endpill .t svg { width: 9px; height: 9px; }
.badge { display: flex; align-items: flex-start; gap: 4px; margin-top: 5px; font-size: 8.5pt; line-height: 1.22; border-radius: 4px; padding: 2px 5px; background: #fff; border: 1px solid var(--b-bd); color: var(--b-ink); }
.badge svg { width: 9px; height: 9px; flex: none; margin-top: 2px; }
.badge.b-set { --b-bd: #3F6EA9; --b-ink: #2D5787; }
.badge.b-trig { --b-bd: #3E8A5B; --b-ink: #2B6843; }
.badge.b-stop { --b-bd: #6E7480; --b-ink: #4A4F58; }

.dg { position: relative; }
.dg > svg.edges { position: absolute; left: 0; top: 0; overflow: visible; pointer-events: none; z-index: 0; }
svg path.edge { fill: none; stroke-width: 1.7; stroke-linejoin: round; stroke-linecap: round; }
svg path.edge.auto { stroke: #4A505C; }
svg path.edge.manual { stroke: #BF6446; }
svg path.edge.planned { stroke: #5D6B8F; stroke-dasharray: 6 4; stroke-linecap: butt; }
.elabel { position: absolute; z-index: 3; font-size: 8.5pt; line-height: 1.2; color: #3C424D; background: rgba(255,255,255,.95); padding: 1px 3px; border-radius: 3px; max-width: 160px; }
.elabel.manual { color: #96472F; }
.elabel.planned { color: #4B587A; font-style: italic; }

.map { display: grid; width: 100%; }
.map .cell { display: flex; justify-content: center; align-items: center; min-width: 0; }
.map .cell.stretch { align-items: stretch; }
.map .node { width: 100%; }
.map .node .t { font-size: 10pt; }
.map .node .d { font-size: 9pt; }
.map .node .n { font-size: 8.5pt; }

.flow { display: flex; align-items: flex-start; width: max-content; }
.fcol { display: flex; flex-direction: column; align-items: center; }
.fseq { display: flex; flex-direction: column; align-items: center; }
.fseq > * + * { margin-top: var(--vgap, 26px); }
.branches { display: flex; align-items: flex-start; justify-content: center; }
.branch { display: flex; flex-direction: column; align-items: center; }
.blabel { position: relative; z-index: 2; margin-bottom: 10px; background: #fff; border: 1.3px solid #B7872A; border-radius: 9px; padding: 1px 9px 2px; font-size: 9pt; line-height: 1.2; font-weight: 700; color: #7A5812; text-align: center; max-width: var(--nw); }
.blabel span { display: block; font-size: 8.5pt; font-weight: 400; color: #555B65; }

.pipe { width: 100%; }
.prow { display: grid; }
.prow + .prow { margin-top: 30px; }
.prow.stages + .prow.stages { margin-top: 56px; }
.prow.has-loop { margin-bottom: 58px; }
.pcell { display: flex; flex-direction: column; justify-content: flex-end; min-width: 0; }
.prow.stages .pcell > .node { flex: 1 1 auto; }
.prow.exits .pcell { justify-content: flex-start; }
.pipe .node { width: 100%; }
.pipe .prow.stages .node .t { font-size: 11pt; }
.pipe .prow.stages .node .d { font-size: 10pt; }
.pside { margin-top: 12px; margin-bottom: 7px; font-size: 9pt; font-weight: 700; color: #4A505A; text-transform: uppercase; letter-spacing: .05em; border-top: 1px dashed #C5CAD1; padding-top: 7px; }
.pside + .prow { margin-top: 0; }

.cardsdg { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 16px 20px; width: 100%; align-items: start; }
.cgroup h2 { margin: 0 0 6px; font-size: 11pt; font-weight: 700; color: #2C323D; }
.cgroup .cards { display: grid; gap: 10px; align-items: stretch; }
.cgroup .node { width: auto; display: flex; flex-direction: column; }
.gnote { margin-top: 6px; font-size: 9pt; color: #4A505A; font-style: italic; }
.cid { font: 8.5pt/1.3 Consolas, "Courier New", monospace; color: #6E747E; margin-top: 2px; }
.chips { display: flex; flex-wrap: wrap; gap: 3px 4px; margin-top: 5px; }
.chip { font: 8.5pt/1.35 Consolas, "Courier New", monospace; border: 1px solid #C5CAD1; border-radius: 9px; padding: 0 6px; background: #fff; color: #3A404A; }
.chip.used { font-weight: 700; color: #1F3F6B; border-color: #3F6EA9; background: #E5EDF8; }
.cfoot { margin-top: auto; padding-top: 5px; font-size: 9pt; color: #2D5787; font-weight: 700; }
`;

const DEFS = `<svg class="fc-defs" aria-hidden="true"><defs>
<marker id="fc-arrow-auto" viewBox="0 0 10 10" refX="9.6" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,1 L10,5 L0,9 z" fill="#4A505C"/></marker>
<marker id="fc-arrow-manual" viewBox="0 0 10 10" refX="9.6" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,1 L10,5 L0,9 z" fill="#BF6446"/></marker>
<marker id="fc-arrow-planned" viewBox="0 0 10 10" refX="9.6" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,1 L10,5 L0,9 z" fill="#5D6B8F"/></marker>
</defs></svg>`;

// ------------------------------------------------------------------ browser-side layout script
// Runs in the page: draws every arrow from the measured boxes, scales a page down only if it
// would overflow, and writes a JSON report to <html data-report="...">.
function clientMain() {
  var NS = 'http://www.w3.org/2000/svg';
  var MIN_PT = 8.4;
  function rel(el, base) {
    var r = el.getBoundingClientRect(), b = base.getBoundingClientRect();
    var l = r.left - b.left, t = r.top - b.top;
    return { l: l, t: t, r: l + r.width, b: t + r.height, w: r.width, h: r.height, cx: l + r.width / 2, cy: t + r.height / 2 };
  }
  function anchor(rc, side, at) {
    var f = at == null ? 0.5 : at;
    if (side === 'top') return { x: rc.l + rc.w * f, y: rc.t };
    if (side === 'bottom') return { x: rc.l + rc.w * f, y: rc.b };
    if (side === 'left') return { x: rc.l, y: rc.t + rc.h * f };
    return { x: rc.r, y: rc.t + rc.h * f };
  }
  function isV(s) { return s === 'top' || s === 'bottom'; }
  function autoSides(a, b) {
    var ox = Math.min(a.r, b.r) - Math.max(a.l, b.l);
    var oy = Math.min(a.b, b.b) - Math.max(a.t, b.t);
    if (ox > 16) return b.cy >= a.cy ? ['bottom', 'top'] : ['top', 'bottom'];
    if (oy > 8) return b.cx >= a.cx ? ['right', 'left'] : ['left', 'right'];
    if (Math.abs(b.cy - a.cy) >= Math.abs(b.cx - a.cx) * 0.5) return b.cy >= a.cy ? ['bottom', 'top'] : ['top', 'bottom'];
    return b.cx >= a.cx ? ['right', 'left'] : ['left', 'right'];
  }
  function route(e, a, b) {
    var fs = e.fromSide, ts = e.toSide, s;
    if (!fs || !ts) { s = autoSides(a, b); fs = fs || s[0]; ts = ts || s[1]; }
    var p0 = anchor(a, fs, e.fromAt), p3 = anchor(b, ts, e.toAt);
    var free = e.fromAt == null && e.toAt == null;
    var lo, hi;
    if (free && isV(fs) && isV(ts) && fs !== ts) {
      lo = Math.max(a.l, b.l) + 14; hi = Math.min(a.r, b.r) - 14;
      if (hi >= lo) { var x = (a.cx >= lo && a.cx <= hi) ? a.cx : (b.cx >= lo && b.cx <= hi) ? b.cx : (lo + hi) / 2; p0.x = x; p3.x = x; }
    }
    if (free && !isV(fs) && !isV(ts) && fs !== ts) {
      lo = Math.max(a.t, b.t) + 10; hi = Math.min(a.b, b.b) - 10;
      if (hi >= lo) { var y = (a.cy >= lo && a.cy <= hi) ? a.cy : (b.cy >= lo && b.cy <= hi) ? b.cy : (lo + hi) / 2; p0.y = y; p3.y = y; }
    }
    var c;
    if (isV(fs) && isV(ts)) {
      if (fs !== ts) {
        if (Math.abs(p0.x - p3.x) < 0.6) { p3.x = p0.x; return [p0, p3]; }
        var my = e.midY != null ? e.midY : e.midOffset != null ? p0.y + (fs === 'bottom' ? 1 : -1) * e.midOffset : (p0.y + p3.y) / 2;
        return [p0, { x: p0.x, y: my }, { x: p3.x, y: my }, p3];
      }
      c = e.clearance != null ? e.clearance : 20;
      var yy = fs === 'bottom' ? Math.max(p0.y, p3.y) + c : Math.min(p0.y, p3.y) - c;
      return [p0, { x: p0.x, y: yy }, { x: p3.x, y: yy }, p3];
    }
    if (!isV(fs) && !isV(ts)) {
      if (fs !== ts) {
        if (Math.abs(p0.y - p3.y) < 0.6) { p3.y = p0.y; return [p0, p3]; }
        var mx = e.midX != null ? e.midX : e.midOffset != null ? p0.x + (fs === 'right' ? 1 : -1) * e.midOffset : (p0.x + p3.x) / 2;
        return [p0, { x: mx, y: p0.y }, { x: mx, y: p3.y }, p3];
      }
      c = e.clearance != null ? e.clearance : 20;
      var xx = fs === 'right' ? Math.max(p0.x, p3.x) + c : Math.min(p0.x, p3.x) - c;
      return [p0, { x: xx, y: p0.y }, { x: xx, y: p3.y }, p3];
    }
    if (isV(fs)) return [p0, { x: p0.x, y: p3.y }, p3];
    return [p0, { x: p3.x, y: p0.y }, p3];
  }
  function pathD(pts, rad) {
    var d = 'M' + pts[0].x.toFixed(1) + ',' + pts[0].y.toFixed(1);
    for (var i = 1; i < pts.length - 1; i++) {
      var a = pts[i - 1], p = pts[i], n = pts[i + 1];
      var d1 = Math.hypot(p.x - a.x, p.y - a.y), d2 = Math.hypot(n.x - p.x, n.y - p.y);
      if (d1 < 0.5 || d2 < 0.5) continue;
      var r = Math.min(rad, d1 / 2, d2 / 2);
      var ax = p.x - (p.x - a.x) / d1 * r, ay = p.y - (p.y - a.y) / d1 * r;
      var bx = p.x + (n.x - p.x) / d2 * r, by = p.y + (n.y - p.y) / d2 * r;
      d += ' L' + ax.toFixed(1) + ',' + ay.toFixed(1) + ' Q' + p.x.toFixed(1) + ',' + p.y.toFixed(1) + ' ' + bx.toFixed(1) + ',' + by.toFixed(1);
    }
    var l = pts[pts.length - 1];
    return d + ' L' + l.x.toFixed(1) + ',' + l.y.toFixed(1);
  }
  function segHits(p, q, r, m) {
    var l = r.l + m, t = r.t + m, rr = r.r - m, bb = r.b - m;
    if (Math.abs(p.x - q.x) < 0.5) {
      if (p.x <= l || p.x >= rr) return false;
      return Math.max(p.y, q.y) > t && Math.min(p.y, q.y) < bb;
    }
    if (Math.abs(p.y - q.y) < 0.5) {
      if (p.y <= t || p.y >= bb) return false;
      return Math.max(p.x, q.x) > l && Math.min(p.x, q.x) < rr;
    }
    return false;
  }
  function overlap(a, b, m) { return a.l < b.r - m && b.l < a.r - m && a.t < b.b - m && b.t < a.b - m; }
  function name(el) {
    var t = el.querySelector && el.querySelector('.t');
    return (el.id || el.className) + ' "' + (t ? t.textContent : el.textContent).trim().slice(0, 48) + '"';
  }
  function placeLabel(e, pts, dg) {
    var bi = 0, best = -1, i;
    for (i = 0; i < pts.length - 1; i++) {
      var len = Math.abs(pts[i + 1].x - pts[i].x) + Math.abs(pts[i + 1].y - pts[i].y);
      if (len > best) { best = len; bi = i; }
    }
    if (e.labelSeg != null) bi = e.labelSeg < 0 ? pts.length - 1 + e.labelSeg : e.labelSeg;
    var a = pts[bi], b = pts[bi + 1], f = e.labelAt != null ? e.labelAt : 0.5;
    var x = a.x + (b.x - a.x) * f, y = a.y + (b.y - a.y) * f;
    var vert = Math.abs(a.x - b.x) < 0.5;
    var el = document.createElement('div');
    el.className = 'elabel ' + (e.style || 'auto');
    if (e.labelWidth) el.style.maxWidth = e.labelWidth + 'px';
    el.innerHTML = e.label;
    el.style.left = '0px'; el.style.top = '0px';
    dg.appendChild(el);
    var w = el.offsetWidth, h = el.offsetHeight, lx, ly;
    var pos = e.labelPos || (vert ? 'right' : 'above');
    if (pos === 'right') { lx = x + 6; ly = y - h / 2; }
    else if (pos === 'left') { lx = x - 6 - w; ly = y - h / 2; }
    else if (pos === 'below') { lx = x - w / 2; ly = y + 4; }
    else if (pos === 'center') { lx = x - w / 2; ly = y - h / 2; }
    else { lx = x - w / 2; ly = y - 4 - h; }
    lx += e.labelDx || 0; ly += e.labelDy || 0;
    el.style.left = lx + 'px'; el.style.top = ly + 'px';
    return { l: lx, t: ly, r: lx + w, b: ly + h };
  }
  function drawDiagram(dg, pg, rep) {
    var ext = { x0: 0, y0: 0, x1: dg.offsetWidth, y1: dg.offsetHeight };
    var specEl = dg.querySelector(':scope > script.spec');
    var svg = dg.querySelector(':scope > svg.edges');
    if (!specEl || !svg) return ext;
    var spec = JSON.parse(specEl.textContent);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    [].slice.call(dg.querySelectorAll(':scope > .elabel')).forEach(function (n) { n.parentNode.removeChild(n); });
    var nodes = [].slice.call(dg.querySelectorAll('.node')).map(function (n) { return { el: n, r: rel(n, dg) }; });
    (spec.edges || []).forEach(function (e0) {
      var e = {}, k;
      for (k in e0) e[k] = e0[k];
      var A = document.getElementById(e.from), B = document.getElementById(e.to);
      if (!A || !B) { rep.problems.push({ page: pg.id, kind: 'arrow-to-nothing', detail: e.from + ' -> ' + e.to }); return; }
      if (e.gutter) {
        var ca = document.getElementById(e.gutter[0]), cb = document.getElementById(e.gutter[1]);
        if (ca && cb) e.midX = (rel(ca, dg).r + rel(cb, dg).l) / 2;
      }
      var pts = route(e, rel(A, dg), rel(B, dg));
      var p = document.createElementNS(NS, 'path');
      p.setAttribute('d', pathD(pts, 7));
      p.setAttribute('class', 'edge ' + (e.style || 'auto'));
      p.setAttribute('marker-end', 'url(#fc-arrow-' + (e.style || 'auto') + ')');
      svg.appendChild(p);
      pts.forEach(function (q) { ext.x0 = Math.min(ext.x0, q.x); ext.y0 = Math.min(ext.y0, q.y); ext.x1 = Math.max(ext.x1, q.x); ext.y1 = Math.max(ext.y1, q.y); });
      for (var i = 0; i < pts.length - 1; i++) {
        nodes.forEach(function (nr) {
          if (nr.el === A || nr.el === B) return;
          if (segHits(pts[i], pts[i + 1], nr.r, 2)) rep.problems.push({ page: pg.id, kind: 'arrow-crosses-box', detail: e.from + ' -> ' + e.to + ' crosses ' + name(nr.el) });
        });
      }
      if (e.label) {
        var lr = placeLabel(e, pts, dg);
        ext.x0 = Math.min(ext.x0, lr.l); ext.y0 = Math.min(ext.y0, lr.t); ext.x1 = Math.max(ext.x1, lr.r); ext.y1 = Math.max(ext.y1, lr.b);
      }
    });
    svg.setAttribute('width', Math.ceil(Math.max(ext.x1, 1)));
    svg.setAttribute('height', Math.ceil(Math.max(ext.y1, 1)));
    return ext;
  }
  function checkOverlaps(dg, pg, rep) {
    var els = [].slice.call(dg.querySelectorAll('.node, .blabel, .elabel'));
    var rs = els.map(function (el) { return rel(el, dg); });
    for (var i = 0; i < els.length; i++) {
      for (var j = i + 1; j < els.length; j++) {
        if (els[i].contains(els[j]) || els[j].contains(els[i])) continue;
        if (overlap(rs[i], rs[j], 1)) rep.problems.push({ page: pg.id, kind: 'overlap', detail: name(els[i]) + ' / ' + name(els[j]) });
      }
    }
    // text wider than its box (would be cut off or spill)
    [].slice.call(dg.querySelectorAll('.node')).forEach(function (n) {
      if (n.scrollWidth > n.clientWidth + 1) rep.problems.push({ page: pg.id, kind: 'text-spills', detail: name(n) });
    });
  }
  function minFontPt(pg, dg, s) {
    var min = 99, w = document.createTreeWalker(pg, NodeFilter.SHOW_TEXT, null);
    while (w.nextNode()) {
      var t = w.currentNode;
      if (!t.nodeValue.trim()) continue;
      var el = t.parentElement;
      if (!el || el.closest('script,style')) continue;
      var pt = parseFloat(getComputedStyle(el).fontSize) * 0.75 * (dg && dg.contains(el) ? s : 1);
      if (pt < min) min = pt;
    }
    return min;
  }
  function run() {
    var rep = { pages: [], problems: [] };
    [].slice.call(document.querySelectorAll('section.page')).forEach(function (pg) {
      var fit = pg.querySelector('.fit'), dg = fit && fit.querySelector(':scope > .dg');
      if (!dg) return;
      dg.style.transform = ''; dg.style.width = ''; fit.style.width = ''; fit.style.height = '';
      var ext = drawDiagram(dg, pg, rep);
      checkOverlaps(dg, pg, rep);
      var area = fit.parentElement, cs = getComputedStyle(area);
      var aw = area.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      var ah = area.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      var w = ext.x1 - Math.min(0, ext.x0), h = ext.y1 - Math.min(0, ext.y0);
      var s = Math.min(1, aw / w, ah / h);
      if (s < 0.999) {
        // freeze the layout width first, so shrinking the wrapper cannot re-flow the boxes under the arrows
        dg.style.width = dg.offsetWidth + 'px';
        dg.style.transformOrigin = '0 0';
        dg.style.transform = 'scale(' + s + ')';
        fit.style.width = (dg.offsetWidth * s) + 'px';
        fit.style.height = (dg.offsetHeight * s) + 'px';
      } else s = 1;
      var minPt = minFontPt(pg, dg, s);
      rep.pages.push({ no: +pg.getAttribute('data-no'), id: pg.id, scale: +s.toFixed(3), minPt: +minPt.toFixed(2), used: Math.round(w) + 'x' + Math.round(h), room: Math.round(aw) + 'x' + Math.round(ah) });
      if (minPt < MIN_PT) rep.problems.push({ page: pg.id, kind: 'small-text', detail: 'smallest text ' + minPt.toFixed(2) + 'pt after fitting (scale ' + s.toFixed(3) + ')' });
    });
    document.documentElement.setAttribute('data-report', JSON.stringify(rep));
  }
  run();
  window.addEventListener('beforeprint', run);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
}

function buildHtml(data) {
  const ctx = makeCtx(data);
  const pages = (data.pages || []).map((p, i) => renderPage(p, i, ctx)).join('\n');
  const title = esc((data.meta && data.meta.title) || 'Flowcharts');
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>${CSS}</style>
</head>
<body>
${DEFS}
${pages}
<script>(${clientMain.toString()})();</script>
</body>
</html>
`;
  return { html, warnings: ctx.warnings };
}

// ------------------------------------------------------------------ browser helpers
function findBrowser() {
  if (process.env.FLOWCHART_BROWSER) {
    if (fs.existsSync(process.env.FLOWCHART_BROWSER)) return process.env.FLOWCHART_BROWSER;
    throw new Error(`FLOWCHART_BROWSER points to ${process.env.FLOWCHART_BROWSER}, which does not exist.`);
  }
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/microsoft-edge', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium', '/usr/bin/chromium-browser', '/snap/bin/chromium',
  ].filter(Boolean);
  return candidates.find((p) => fs.existsSync(p)) || null;
}

function browserArgs() {
  return [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--disable-extensions', '--disable-background-networking', '--disable-component-update',
    '--disable-sync', '--disable-default-apps', '--no-pings',
    `--user-data-dir=${path.join(os.tmpdir(), 'flowcharts-headless-profile')}`,
    '--virtual-time-budget=8000',
  ];
}

function runBrowser(extra) {
  const exe = findBrowser();
  if (!exe) throw new Error('No Edge or Chrome found. Set FLOWCHART_BROWSER to the browser executable.');
  return spawnSync(exe, [...browserArgs(), ...extra], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, timeout: 240000, windowsHide: true });
}

function readReport(htmlPath) {
  const r = runBrowser(['--dump-dom', pathToFileURL(htmlPath).href]);
  const m = /data-report="([^"]*)"/.exec(r.stdout || '');
  if (!m) return null;
  const json = m[1].replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  return JSON.parse(json);
}

function printReport(rep) {
  if (!rep) { console.log('Layout check: could not read the report from the browser.'); return; }
  console.log('Layout check (scale 1 = no shrinking; smallest text in pt):');
  for (const p of rep.pages) {
    console.log(`  p.${String(p.no).padStart(2)}  ${p.id.padEnd(16)} scale ${p.scale.toFixed(3)}  min ${p.minPt.toFixed(2)}pt  used ${p.used} of ${p.room}`);
  }
  if (!rep.problems.length) console.log('  No problems: no overlaps, no arrows through boxes, no arrows to nothing, no small text.');
  else {
    console.log(`  ${rep.problems.length} problem(s):`);
    for (const x of rep.problems) console.log(`   - [${x.page}] ${x.kind}: ${x.detail}`);
  }
}

function printPdf(htmlPath, pdfPath) {
  const before = fs.existsSync(pdfPath) ? fs.statSync(pdfPath).mtimeMs : 0;
  const r = runBrowser(['--no-pdf-header-footer', '--print-to-pdf-no-header', `--print-to-pdf=${pdfPath}`, pathToFileURL(htmlPath).href]);
  const ok = fs.existsSync(pdfPath) && fs.statSync(pdfPath).mtimeMs > before;
  if (!ok) throw new Error('PDF was not written. Is the PDF open in a viewer? Browser said:\n' + (r.stderr || r.stdout || '').slice(-2000));
}

function renderPngs(pdfPath, dir, dpi) {
  fs.mkdirSync(dir, { recursive: true });
  const code = [
    'import sys',
    'try:\n    import pymupdf\nexcept ImportError:\n    import fitz as pymupdf',
    'doc = pymupdf.open(sys.argv[1])',
    'for i, page in enumerate(doc):\n    page.get_pixmap(dpi=int(sys.argv[3])).save(f"{sys.argv[2]}/page-{i+1:02d}.png")',
    'print(len(doc), doc[0].rect.width, doc[0].rect.height)',
  ].join('\n');
  // PYTHON names the Python to use; otherwise "python", then "python3".
  let r = null;
  for (const py of process.env.PYTHON ? [process.env.PYTHON] : ['python', 'python3']) {
    r = spawnSync(py, ['-c', code, pdfPath, dir, String(dpi || 110)], { encoding: 'utf8' });
    if (!r.error) break;
  }
  if (r.error || r.status !== 0) throw new Error('PNG render failed (needs Python with PyMuPDF: pip install pymupdf): ' + ((r.error && r.error.message) || r.stderr || '').slice(-1000));
  return r.stdout.trim();
}

// Counts the placeholders (<CLIENT_NAME> and the like) left anywhere in the data.
function placeholdersIn(data) {
  const counts = new Map();
  const walk = (v) => {
    if (typeof v === 'string') { for (const m of v.matchAll(/<[A-Z][A-Z0-9_]*>/g)) counts.set(m[0], (counts.get(m[0]) || 0) + 1); }
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  walk(data);
  return counts;
}

// Finds a money amount printed with a "%" after it ("$250%"): a fee put into RATE while the text
// still says `${RATE}%`. RATE is a plain number for a monthly percentage and "$250" for a fee
// (templates/flowcharts-data.js, "Commission variants").
function feeWithPercentIn(data) {
  const hits = [];
  const walk = (v) => {
    if (typeof v === 'string') { for (const m of v.matchAll(/[$€£]\s?\d[\d,.]*\s*%/g)) hits.push(m[0]); }
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  walk(data);
  return hits;
}

// ------------------------------------------------------------------ main
function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.data) {
    console.log('Usage: node tools/flowcharts/render.js <data.js|data.json> [--out file.html] [--pdf [file.pdf]] [--check] [--png dir]');
    process.exit(args.data ? 0 : 1);
  }
  const dataPath = path.resolve(args.data);
  const data = loadData(dataPath);
  const baseDir = path.dirname(dataPath);
  const meta = data.meta || {};
  const out = path.resolve(args.out || (meta.output ? path.resolve(baseDir, meta.output) : dataPath.replace(/\.(js|json)$/i, '.html')));
  const { html, warnings } = buildHtml(data);
  fs.writeFileSync(out, html, 'utf8');
  console.log('HTML: ' + out + ` (${(data.pages || []).length} pages)`);
  for (const w of warnings) console.log('  warning: ' + w);
  const blanks = placeholdersIn(data);
  if (blanks.size) {
    console.log(`  warning: placeholders still in the data: ${[...blanks].map(([k, n]) => `${k} (${n})`).join(', ')}. Fill them in before the PDF goes to anyone.`);
  }
  const feePct = feeWithPercentIn(data);
  if (feePct.length) {
    console.log(`  warning: a fee is printed with "%" after it, ${feePct.length} time(s), for example "${feePct[0]}". For a fee, set VARIANT = 'fee' in the data file (templates/flowcharts-data.js, "Commission variants"). RATE followed by "%" is for a monthly percentage only.`);
  }

  let pdf = null;
  if (args.pdf) {
    pdf = path.resolve(args.pdf === true ? (meta.pdf ? path.resolve(baseDir, meta.pdf) : out.replace(/\.html$/i, '.pdf')) : args.pdf);
    printPdf(out, pdf);
    console.log('PDF:  ' + pdf);
  }
  if (args.check || args.pdf) printReport(readReport(out));
  if (args.png) {
    if (!pdf) throw new Error('--png needs --pdf');
    const info = renderPngs(pdf, path.resolve(args.png), 110);
    console.log('PNG:  ' + path.resolve(args.png) + ' (pages, width pt, height pt: ' + info + ')');
  }
}

if (require.main === module) {
  try { main(); } catch (e) { console.error('Error: ' + e.message); process.exit(1); }
}

module.exports = { buildHtml, TYPES };
