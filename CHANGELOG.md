# Changelog

## 1.0.0 · 2026-09-25

First release, written from the first build (an SEO agency's partner program, Sep 21–22 2026) and Justin's ask on the Sep 24 2026 huddle.

- The build in 10 steps, from intake to handover, with a **Check** on every action and an "If a step fails" section in every file (`process/`).
- Every GHL trap from the first build, with its fix (`process/ghl-traps.md`).
- The standard program, exactly: 3 pipelines, 29 contact and 7 deal fields, 24 tags, the Partner Intro Call calendar, 3 forms, 8 workflows, the Affiliate Manager campaign and the Become a Partner page, plus the three commission variants (`spec/`).
- The scripts: survey, structure build, double-check, the test scripts, the flowcharts renderer, the repo checker and the zip builder (`tools/`).
- Templates for the client brief, the blueprint, the config, the build record, the flowcharts, the walkthrough video and the partner emails (`templates/`).
- The worked example: Example SEO Agency, the first build with its identifying details removed (`examples/`).
- The build prompt, the standing rules for AI sessions (`CLAUDE.md`, `AGENTS.md`), and the docs: how the program works, and how it maps onto another CRM.
- Hardened before release by a fresh-session dry run (a made-up roofing client on the "one fee per closed deal" variant), which found 1 blocker, 13 major and 17 minor gaps. All fixed, with the standard build unchanged:
  - The referral-fee question per partner type, which blocks the launch to that type until the client confirms it in writing (brief field 14, blueprint section 13, `CLAUDE.md` safety rule 7).
  - The fee variant fully specified: its own workflow 8 file (`spec/workflows/8b-commission-3-paid-once.md`), the config steps for renamed workflows (`process/3-structure.md`), the `<FEE_AMOUNT>` format, variant markers in the build record, partner emails, walkthrough and test log, and a `VARIANT = 'fee'` switch in the flowcharts template. `render.js` warns when a fee is printed with a `%` after it.
  - Client differences that combine with any variant (`spec/variants.md`): homeowner clients, phone-only referrals, one payout method, a monthly payout run.
  - The payout-terms mapping rule, the client's invite and token click paths, what to do when the Affiliate Manager is missing, and the form builder's screens as the spec records them.
  - `enroll.js` tests `Payment Preference` with the first option of the client's own list, and the referred test clients carry fictional phones. The selftest has 60 tests.

## The rule for changes

1. Edit `docs/REPO-SPEC.md` first.
2. Edit the files it describes.
3. Add an entry at the top of this file, and bump the version here and in `README.md`. A wording fix is `1.0.x`; a new step, variant or tool is `1.x.0`; a change to what every client gets is `x.0.0`.
4. Run `node tools/check-repo.js`. It must pass.
5. Rebuild the zip: `node tools/build-zip.js`. It writes `dist/affiliate-program-builder-v<version>.zip`.
6. Commit and push.
