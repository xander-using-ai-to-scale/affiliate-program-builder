# Step 3 · Structure

Build the custom fields, tags, pipelines and the Partner Intro Call calendar over GHL's API, with one script. Then record their ids and check them.

| | |
|---|---|
| **Owner** | The AI session |
| **Time** | 30 minutes in the first build |
| **Needs** | `clients/<CLIENT_SLUG>/config.json` from step 2, and the approved blueprint |
| **Makes** | 29 contact fields, 7 deal fields, 24 standard tags plus the client's `segment/` tags, 3 pipelines, the Partner Intro Call calendar, and their ids in the config |
| **Done when** | `double-check.js` passes every field, tag and pipeline and the calendar |

The standard structure is [spec/structure.json](../spec/structure.json). The script reads it and applies the client's changes from the config's `structure` block on top. How that merge works: a change with the same name replaces the standard entry, a new name is added, and a `remove` list drops standard names. The exact keys are in [tools/README.md](../tools/README.md).

The script skips anything that already exists by name, and never renames, edits or deletes. A re-run is safe.

## 3.1 · Set the client's values in the config

Three things are always client-specific: the `Partner Type` options, the `segment/` tags, and the calendar's slug and description. The script refuses to build without the Partner Type options and the calendar slug.

1. In `clients/<CLIENT_SLUG>/config.json`, under `structure`, add the `Partner Type` field with the options from the blueprint's section 3, in order, `Other` last. Copy the field's name and type from [spec/structure.json](../spec/structure.json) exactly.
   **Check:** the options match the blueprint, one for one.
2. Under `structure`, add the `segment/` tags from the blueprint's section 3.
   **Check:** every tag is lowercase, starts with `segment/`, and `segment/other` is there.
3. Under `structure`, set the calendar's `slug` (`<CLIENT_SLUG>-partner-intro-call`) and `description` from the blueprint's section 10.
   **Check:** the slug matches the blueprint.
4. Add every other change from the blueprint's sections 3 to 7, for example the extra `Lost Reason` option, or a narrowed `Payment Preference`. To change a field's options, repeat the whole field with its full new option list. A replaced pipeline (the same name, a new stage list) or a new pipeline goes under `"pipelines"`; a dropped standard pipeline goes in `"remove": { "pipelines": [...] }` ([spec/variants.md](../spec/variants.md), "How to change the structure for a variant").
   **Check:** each change in the blueprint's sections 3 to 7 that touches a field, tag, pipeline or the calendar has a matching entry in `structure`, and nothing is there that the blueprint does not list.
5. Workflow names. The double-check looks for the 8 standard workflow names unless `structure` says otherwise. For every workflow the blueprint's section 7 does not build, or builds under another name, add it here:
   - Not built (no Instantly, or a variant that drops it): its standard name in `"remove": { "workflows": [...] }`.
   - Renamed by the variant: its standard name in `"remove": { "workflows": [...] }` **and** its new name in `"workflows": [...]`.

   For the "one fee per closed deal" variant with Instantly, `structure` holds:

   ```json
   "remove": { "workflows": ["Referral Engine - Commission 3: Paid, monthly repeat"] },
   "workflows": ["Referral Engine - Commission 3: Paid"]
   ```

   Without Instantly, `remove.workflows` also lists `Instantly - Interested Partner Reply`. For pay per lead, `remove.workflows` lists `Referral Engine - Commission 2: Approved` and `Referral Engine - Commission 3: Paid, monthly repeat` ([spec/variants.md](../spec/variants.md)).
   **Check:** every workflow name in the blueprint's section 7 marked `yes` is either a standard name not in `remove.workflows`, or in `structure.workflows`; every name marked `no` or renamed is in `remove.workflows`. No `<...>` placeholder from the template is left in `structure`: the build refuses to run with one.
6. Validate the file: `node -e "JSON.parse(require('fs').readFileSync('clients/<CLIENT_SLUG>/config.json','utf8'))"`.
   **Check:** it prints nothing and exits without an error.

An example of the three always-client-specific values, from the worked example (Example SEO Agency, shortened):

```json
"structure": {
  "fields": {
    "contact": [
      { "name": "Partner Type", "dataType": "SINGLE_OPTIONS",
        "options": ["Web Design / Development", "PPC / Paid Ads Agency", "Business Coach", "Other"] }
    ]
  },
  "tags": ["segment/web-design", "segment/ppc-agency", "segment/other"],
  "calendar": {
    "slug": "example-seo-agency-partner-intro-call",
    "description": "A 20-minute intro call with a prospective referral partner for the Example SEO Partner Program."
  }
}
```

The full example config is in `examples/example-seo-agency/` (see [examples/README.md](../examples/README.md)).

## 3.2 · Dry run

1. Run `node tools/ghl/build-structure.js --client <CLIENT_SLUG> --dry-run`. It only reads.
   **Check:** it does not stop with "Nothing built. Fix ... first". The first line names the client's sub-account and `<LOCATION_ID>`, and the "Standard structure:" line names `spec/structure.json`, not the fallback copy.
2. Read the plan it prints: each item says `would create` or `exists, skipped`, and the last line reads `Plan: <N> to create, <M> already there. Nothing was written.`
   **Check:** the plan covers 29 contact fields, 7 deal fields, the tags, 3 pipelines and 1 calendar. Every `exists, skipped` matches a clash you settled in step 2.5, and no skip carries a ⚠ warning you have not settled.

## 3.3 · Build

1. Run `node tools/ghl/build-structure.js --client <CLIENT_SLUG>`. This writes to the client's GHL.
   **Check:** the first line names the client's sub-account. A closing line reads `Done: <N> created, <M> skipped, 0 failed.` Every error is printed in full: if there is one, see "If a step fails".
2. Record the ids: run `node tools/ghl/survey.js --client <CLIENT_SLUG> --ids`. It prints a JSON block.
   **Check:** the block lists the 3 pipelines, the contact and deal fields, and the calendar. Notes about missing forms and workflows are expected at this step.
3. Paste the whole block into `clients/<CLIENT_SLUG>/config.json` as the value of `"ids"`, replacing what was there.
   **Check:** the file is still valid JSON (the command in 3.1, action 6).

## 3.4 · Double-check

1. Run `node tools/ghl/double-check.js --client <CLIENT_SLUG>`. It only reads.
   **Check:** `PASS` on every contact field, every deal field, the tags line, the 3 pipelines (stages in order) and the calendar. At this step, the workflows and forms show `FAIL`: that is expected until steps 4 to 6.
2. Read the `INFO` lines: fields, tags and pipelines in the account that are not in the structure.
   **Check:** each one is the client's own item from the survey, not a second copy of ours. A line saying a name was found twice is a failure: see "If a step fails".
3. Paste the double-check's output into the build record under "Structure", with the date and time.
   **Check:** the output is in the build record.
4. Add a log line to the build record: `YYYY-MM-DD HH:MM · Step 3 done · structure PASS`.
   **Check:** the line is in the log.

## If a step fails

- **"has no options" or "has no slug".** The Partner Type options or the calendar slug are missing from `structure`. Add them (section 3.1), then run the dry run again.
- **"has no calendarOwnerUserId"** (or a similar message about the placeholder user). Add `<PLACEHOLDER_USER>`'s id from the survey (step 2.4, action 4).
- **A field "found 2 times".** Someone built it twice, or a GHL snapshot loaded the same field. Do not delete anything. Tell the operator which one has data (the survey shows ids), and let them decide.
- **A field has the wrong type or options.** It existed before the build, so the script skipped it. It is a clash: settle it with the operator (step 2.5).
- **A single item failed to build.** Read the printed error. Fix the cause (usually a typo in `structure`), then run the build again. It skips what already exists.
- **Error 1010, 401 or "user type mismatch".** See "If a step fails" in [2-access-and-survey.md](2-access-and-survey.md).
- **Anything else.** Retry once. If it fails again, tell the operator: `Blocked at step 3.<N>: <what happened>. Need from you: <one thing>.` Then wait.
