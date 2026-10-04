# Contributing

Keep CloudCue small, offline for study, and focused on CCSP foundations. Use plain-text DOM rendering and preserve the restrictive content security policy. Avoid native filesystem, shell, or network capabilities for ordinary study features.

## Curated question submissions

Use the GitHub question-submission form to propose a question, or the pull-request template for a prepared change. The shared bank accepts original practice questions and material with documented permission for redistribution. Supply the topic, prompt, four distinct answer choices, correct answer, explanation, and a reliable public source supporting the concept. Explain why the correct answer is the best choice and why the distractors are less appropriate.

State who authored the material and any AI assistance. For original work, confirm your authority to contribute it under the repository's MIT license. For material from another author, identify the owner, license or permission, required attribution, and evidence that redistribution in this project is authorized. Public access, a citation, purchasing a course or question bank, and AI assistance do not establish redistribution rights. External material retains its applicable terms; the project does not relicense it by linking to it.

Do not submit real, recalled, leaked, or confidential exam questions, including reconstructed exam items or exam dumps. Do not include personal study records, private banks or exports, credentials, or material whose redistribution rights are uncertain. CloudCue is independent and is not affiliated with, endorsed by, or sponsored by ISC2; submissions must not imply official exam content or endorsement.

Every submission requires human maintainer review for rights, provenance, accuracy, rationale, attribution, duplicates, and study scope before inclusion. A submitted issue or passing automated checks does not mean a question is accepted. Maintainers remove reported or identified policy violations from the shared bank and its generated copy. To report a suspected violation, give the question ID and the reason or public evidence without reposting restricted exam content or confidential material.

For an accepted question change, edit `data/ccsp.psv` and the relevant reference metadata in `data/sources.json`. Regenerate the bank with `python3 scripts/build-bank.py` and include both source and generated changes. Preserve attribution and document any applicable notices. See [content provenance](CONTENT_PROVENANCE.md).

## Private local banks

Importing a private JSON bank is a local study feature, separate from the curated contribution process. It does not submit questions for review or share them with maintainers. Use only material you are authorized to possess and use; the prohibition on real, recalled, leaked, or confidential exam questions also applies to private-bank examples and contributions. Do not commit your private bank, exported JSON, or local scores. The repository's [example](ui/private-bank-example.json) contains synthetic practice material for demonstrating the format.

Keep private questions and scores in their own app-local namespace. Preserve explicit confirmation before replacing an imported private bank, and a separate download or copy action after the export preview. Do not add automatic uploads, a backend, accounts, or encryption claims. Private banks and JSON exports are not encrypted. The supported schema and import limits are documented in the [README](README.md#private-local-question-bank).

## Verification and repository hygiene

Run `npm test` and `npm run check` before proposing a change. For native or packaging changes also run the Rust formatting, test, Clippy, and build commands in the README. Exercise answering, delayed Self-test feedback, pause/reopen/resume, early finish, retries, reset confirmation, and the narrow layout for UI changes. State what you could not verify.

Keep dependency lockfiles committed. Do not commit credentials, local toolchains, user progress, private banks or exports, build outputs, logs, or generated schemas. Original contributions are offered under the repository's MIT license; authorized third-party material must retain its approved license, attribution, and notices. Dependencies and external references retain their own licenses.
