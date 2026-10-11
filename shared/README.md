# Shared study source

This directory is the public source of truth for the study engine, web styles,
curated question data and reusable behavior checks. It contains no personal
integrations, local records or private question banks. The code is covered by
the repository MIT license; question provenance is documented at the repository root.

Edit `study-core.js` and `study.css` here, then run `npm run build:shared`.
Edit curated questions in `data/ccsp.psv` / `data/sources.json`, then run
`python3 scripts/build-bank.py`. Commit both the authored files and generated
`shared/questions.json`, `ui/questions.js`, `ui/study-core.js`, `ui/style.css`.
`npm run check:shared` rejects stale generated files.

## Consumers

Pin this repository to an exact Git commit (for example, a Git submodule).
Copy only the named runtime assets into the consumer bundle during its build;
never fetch code or question data at app runtime. Keep application controllers,
storage namespaces, progress migration and integrations in the consumer.
Run `study-contract.cjs` against the consumer's bundled core and parsed bank.
This checks selection, scoring, feedback timing and saved-session restoration.

The engine keeps the version-1 CCSP data contract. Legacy curated progress with
no top-level bankVersion is accepted. A declared bank-version mismatch is
rejected; private banks require an exact version. Never overwrite a consumer's
storage keys or merge its user records as part of a source update.

Make common fixes here first. Consumers adopt reviewed commits through update
PRs and run their own integration tests before merging. A source update does
not synchronize users' questions, sessions or scores.
