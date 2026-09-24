# examples/: the first build, anonymised

One worked example: the first build of the affiliate program (an SEO agency's partner program, built Sep 21–22 2026), with every identifying detail removed. It shows what each template looks like once filled in, and what a finished build record and test log contain.

| Folder | What it is |
|---|---|
| [example-seo-agency/](example-seo-agency/README.md) | "Example SEO Agency": brief, blueprint, config, build record, test log, and the flowcharts (data, HTML and PDF) |

**How it was anonymised** ([docs/REPO-SPEC.md](../docs/REPO-SPEC.md) §8): the client, the business and the owner became "Example SEO Agency" and "Alex Example"; the program became "Example SEO Partner Program"; every GHL id, webhook URL and preview link became a placeholder or was left out; the operator became "the operator" and the approver "the approver". Kept as they were, because they are the example's program terms: the 15% monthly recurring commission, the 19 partner types, the 8 segment tags, the stage names, and the fake test contacts (`test.*@example.com`) with their test Referral IDs.

**What does not belong here:** a real client's files. They go in `clients/<CLIENT_SLUG>/`, which is never committed. Do not copy this example into a client folder: copy the blank files from [templates/](../templates/README.md).
