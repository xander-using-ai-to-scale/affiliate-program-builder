# dist/

The release zip, for AI agents that cannot clone GitHub.

**What is here:** this README and `affiliate-program-builder-v<version>.zip`, the current version only.
**What does not belong here:** anything else: no older zips, no client files.

## What the zip is

The whole repo as git would commit it, in one folder `affiliate-program-builder/`: every tracked file except `clients/` (client work, never committed) and `dist/` itself. Unzip it anywhere and start with `README.md`, or give an agent `BUILD-PROMPT.md`. The scripts in `tools/` work from the unzipped folder as from a clone.

The zip is **tracked in git on purpose**: `.gitignore` excludes `clients/` and `*.tmp`, not `dist/*.zip`. Its version is the first `## x.y.z` heading of `CHANGELOG.md`.

## Building it

```
node tools/build-zip.js
```

It writes `dist/affiliate-program-builder-v<version>.zip`, reads it back and checks every file. Every entry carries the same timestamp (the date on the CHANGELOG heading), so the same files always give the same zip. It does not delete older zips: when you release a new version, delete the old zip, because `dist/` holds only the current one.

Then run `node tools/check-repo.js --strict`. Its rule 5 checks that the zip's version matches `CHANGELOG.md` and `README.md`, and that the zip holds exactly the current files. If you change any file after building the zip, build it again.

To look inside: `tar -tf dist/affiliate-program-builder-v<version>.zip` (Windows 10 and later have `tar`), or `Expand-Archive` in PowerShell.
