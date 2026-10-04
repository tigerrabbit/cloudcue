# Content provenance

## Included material

The 60 CCSP questions, four choices per question, explanations, and topic labels were authored with Codex assistance on October 4, 2026 for an independent study application. The authoring record identifies them as original practice scenarios, not copied official exam questions or material from a purchased bank. The project owner confirmed that Codex created the bank and authorized offering the project-authored material under MIT.

`data/ccsp.psv` preserves the authoring rows. `scripts/build-bank.py` deterministically generates `CCSP-001` through `CCSP-060`, shuffles choices by question ID, and attaches the retained references from `data/sources.json`. Tests verify that the generated questions, correct answers, and explanations match those rows and that every retained reference is used.

The bank has ten items per domain and is a foundation baseline with uneven difficulty. It does not cover every objective or supply an official readiness threshold. Its outline reference is dated August 1, 2026; linked pages can change independently.

## References and redistribution limits

The 20 retained references point to ISC2, NIST, OWASP, Microsoft, AWS, the Cloud Security Alliance, and the European Commission. They support the concepts behind the original questions. The app includes short reference titles and URLs, not copies of source pages, PDFs, courses, or official exam questions. Those external materials retain their own copyrights, licenses, and terms; the project's MIT license does not relicense them.

Local review confirmed that all 60 generated question objects match their authored rows, and that the public bank contains only its referenced sources. This establishes the authoring chain; it is not a legal guarantee of originality, ownership, or universal clearance. Contributors must preserve attribution and independently check rights before adding or copying material.

## Shared-bank review policy

The curated shared bank accepts original practice questions and redistribution-authorized material with documented rights. Submissions must include a rationale for the correct answer, suitable distractors, and a public source supporting the underlying concept. An external source supports a concept; it does not grant permission to copy its question text, explanation, or other content.

For original contributions, the contributor must have authority to offer the material under the repository's MIT license. For third-party material, contributors must identify the owner, applicable license or permission, redistribution evidence, and required attribution or notices. Maintainers check compatibility with inclusion in this project and preserve applicable third-party terms. AI-assisted authorship and contributor declarations do not guarantee originality or rights clearance.

Human maintainer review is required before a submission enters the shared bank. Review covers provenance and rights, factual accuracy, answer rationale, source relevance, duplication, and the foundation-study scope. Real, recalled, leaked, or confidential exam questions, reconstructed exam items, and exam dumps are prohibited. Reported or identified policy violations are removed from the shared bank and its generated copy. Reports should identify the question and the concern without reproducing restricted content.

CloudCue remains independent and is not affiliated with, endorsed by, or sponsored by ISC2. References to ISC2 or CCSP identify the study subject and source material, not an endorsement or claim that the questions reproduce an official exam.

## Private local-bank boundary

Private JSON banks are supplied by the user and stored locally, with a separate question namespace and scores from the curated bank. Importing does not add material to the repository or submit it for human review. The app has no backend or accounts and does not automatically upload private questions, progress, or exports. Import replacement requires explicit confirmation. Export opens a read-only JSON preview and requires a separate, explicit download or copy action.

Users are responsible for having the rights to possess and use their imported material. Private storage does not grant redistribution permission, and exported JSON should be shared only when authorized. Private banks, scores, and exports are not encrypted; clearing the app's webview data can remove local records. The [synthetic example](ui/private-bank-example.json) demonstrates schema version 1 and is separate from personal study material. See the [README](README.md#private-local-question-bank) for validation limits.

## Other assets

`icon.svg` is an original geometric cloud-and-check illustration created for CloudCue. The bundled PNG and ICNS files are rendered from it. No certification branding or third-party illustration is included. Dependencies retain their own licenses and notices, described in `THIRD_PARTY_NOTICES.md`.
