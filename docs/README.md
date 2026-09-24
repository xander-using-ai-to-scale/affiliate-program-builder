# docs/: the contract, and the program explained

| File | What it is | Who reads it |
|---|---|---|
| [REPO-SPEC.md](REPO-SPEC.md) | The contract for this repo: what it is, the tree, the standard program, the writing rules, the checker. **Change it first**, before any other file | Anyone changing the repo |
| [how-it-works.md](how-it-works.md) | The program in plain words: the partner's journey, the credit rules, the commission cycle, what the Affiliate Manager adds, what needs Stripe | The operator and the client |
| [other-crms.md](other-crms.md) | One page: the building blocks every CRM needs to run this program, and how each maps from GHL | The operator, when a client will not use GHL |

**What does not belong here:** build steps (they go in `process/`), exact settings (`spec/`), and anything about a real client (`clients/<CLIENT_SLUG>/`, never committed).
