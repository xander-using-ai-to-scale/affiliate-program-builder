# tools/flowcharts/

`render.js` turns a flowchart data file into boxes-and-arrows pages: one HTML file and, with `--pdf`, a letter-landscape PDF. The client gets that PDF at handover: every pipeline and workflow of their program, one per page.

**What is here:** `render.js` and this README. The data for a client starts from [templates/flowcharts-data.js](../../templates/flowcharts-data.js).
**What does not belong here:** any client's data or output (it lives in `clients/<CLIENT_SLUG>/`).

Node 18 or newer, no npm installs, no network. It never touches GHL.

## The commands

Run from the repo root.

```
node tools/flowcharts/render.js clients/<CLIENT_SLUG>/flowcharts-data.js --pdf
```

writes `flowcharts.html` and `flowcharts.pdf` next to the data file (the names come from `meta.output` and `meta.pdf` in the data file, relative to its folder), then prints a layout check per page. The bar: the line `No problems: no overlaps, no arrows through boxes, no arrows to nothing, no small text.`, and no `warning:` line.

| Option | What it does |
|---|---|
| `--out <file.html>` | Write the HTML there instead |
| `--pdf` | Also print the PDF |
| `--pdf <file.pdf>` | Print the PDF there instead |
| `--check` | Only the layout check, no PDF |
| `--png <folder>` | Also save one PNG per page (needs `--pdf`, and Python with PyMuPDF) |

To render the template itself without writing into `templates/`, give both paths: `node tools/flowcharts/render.js templates/flowcharts-data.js --out <temp>/t.html --pdf <temp>/t.pdf`.

## The browser

The PDF and the layout check come from headless Edge or Chrome. The script finds the first of these that exists: Edge in `C:\Program Files (x86)\Microsoft\Edge\Application\` or `C:\Program Files\...`, Chrome in `C:\Program Files\Google\Chrome\Application\`, `C:\Program Files (x86)\...` or `%LOCALAPPDATA%\Google\Chrome\Application\`, then the usual macOS and Linux places (Edge, Chrome, Chromium). To choose one, set `FLOWCHART_BROWSER` to the browser's full path, for example in PowerShell: `$env:FLOWCHART_BROWSER = "C:\Program Files\Google\Chrome\Application\chrome.exe"`. It runs with a temporary profile and with background network calls turned off.

## PNG previews (optional)

`--png <folder>` renders each PDF page to `page-01.png`, `page-02.png`, ... with Python and PyMuPDF (`pip install pymupdf`). It tries `python`, then `python3`; set `PYTHON` to use another. Handy for an AI session to look at the pages.

## The layout check

Per page: the scale (1 means nothing had to shrink), the smallest text in points, and the space used. It lists as problems: boxes or labels that overlap, arrows that cross a box, arrows to a box that does not exist, text that spills out of its box, and text under 8.4pt after fitting. It also warns about placeholders left in the data (`<CLIENT_NAME>` and the like), unknown `{p:...}` page references, and a money amount printed with a `%` after it (`$250%`: a fee typed into `RATE` without `VARIANT = 'fee'`). Fix a problem by shortening the text or changing the page's `layout` or `grid` numbers, then render again.

## The data file

`{ meta, pages }`. `meta`: `title`, `client`, `built`, `footer`, `output`, `pdf`, and optionally `generated` (else today; `FLOWCHART_DATE` also sets it).

- **Page types:** `map` (a grid: each node has `at: [row, col]`, optional `span`; `edges` join them), `pipeline` (stages left to right, `perRow` wraps, with `entries`, `exits`, `loops` and `side` stages), `flow` (steps top to bottom; `newColumn: true` wraps; `branches` split side by side), `cards` (groups of cards; `chips` ending in `*` print in bold).
- **Box types:** `trigger`, `action`, `condition`, `wait`, `task`, `stage`, `end`, `info`. `planned: true` makes any box dashed ("not built yet").
- **Arrow styles:** `auto` (happens automatically), `manual` (a person does it), `planned` (dashed: planned, not built yet).
- **Text:** `**bold**`, `` `code` ``, and `{p:page-id}`, which prints that page's number ("p.6"). In map boxes and notes, `code` prints under the 8.4pt floor: write such keys as plain text there.
- **Page header:** `kind`, `title`, `summary`, `banner`, `legend: true`, `ghlId` with `ghlIdLabel`, `footnote`.

The template's top comment says what to set per client and how to adapt it (no Instantly, other commission variants). `VARIANT` is `'monthly'` (the default: `RATE` is a plain number, `'15'`) or `'fee'` (one fee per closed deal: `RATE` is the fee as text, `'$250'`); the fee pages change by themselves.

## If something fails

- `No Edge or Chrome found`: install one, or set `FLOWCHART_BROWSER`.
- `PDF was not written`: the PDF is open in a viewer that locks it. Close it and render again.
- `Layout check: could not read the report`: the browser did not finish in time. Render again.
