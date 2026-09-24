# Example SEO Agency: the first build, anonymised

The first affiliate program we built in GHL, Sep 21–22 2026, for an SEO agency that serves local businesses. The owner is called "Alex Example" here. Partners (web designers, ad agencies, coaches and 16 other kinds of business) refer clients and earn 15% of every monthly payment for the life of each referred client.

This folder is what `clients/<CLIENT_SLUG>/` holds at the end of a build, with the identifying details removed ([examples/README.md](../README.md) says how).

| File | What it is | Template |
|---|---|---|
| [brief.md](brief.md) | The client brief, as step 0 would fill it | [client-brief.md](../../templates/client-brief.md) |
| [blueprint.md](blueprint.md) | The program blueprint, approved | [blueprint.md](../../templates/blueprint.md) |
| [config.json](config.json) | The config: the 19 partner types, the 8 segment tags, the extra Lost Reason option, the calendar slug. Ids are placeholders. Valid for `node tools/ghl/build-structure.js --config examples/example-seo-agency/config.json --offline` | [client-config.json](../../templates/client-config.json) |
| [build-record.md](build-record.md) | What was built and tested, with dates | [build-record.md](../../templates/build-record.md) |
| [test-log.md](test-log.md) | Every test, what it sent and what came back | – |
| [flowcharts-data.js](flowcharts-data.js) | The flowcharts' data: the template with this example's values | [flowcharts-data.js](../../templates/flowcharts-data.js) |
| `flowcharts.html`, `flowcharts.pdf` | The flowcharts, rendered: `node tools/flowcharts/render.js examples/example-seo-agency/flowcharts-data.js --pdf` | – |

**How the first build differs from the process in this repo.** The repo was written after the build, from it. So the first build had no written brief or blueprint (they were reconstructed here from the program terms), ran some steps in another order (the Instantly workflow came before the referral engine; the Affiliate Manager came a day later), and used earlier names for two test scenarios (`partnerF` and `claimF`, now `partnerE` and `claimE`). The build record says where.

**What does not belong here:** anything that identifies the real client, and anything about another client.
