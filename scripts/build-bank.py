"""Regenerate the bundled bank from project-authored CCSP rows; no network access."""
from pathlib import Path
import json
import random

ROOT = Path(__file__).resolve().parents[1]
sources = json.loads((ROOT / 'data/sources.json').read_text())
questions = []
for number, row in enumerate((ROOT / 'data/ccsp.psv').read_text().strip().splitlines(), 1):
    fields = row.split('|')
    if len(fields) != 8:
        raise ValueError(f'Row {number}: expected eight pipe-separated fields')
    topic, source, prompt, answer, wrong1, wrong2, wrong3, explanation = fields
    if source not in sources:
        raise ValueError(f'Row {number}: unknown source key {source}')
    options = [answer, wrong1, wrong2, wrong3]
    if len(set(options)) != 4:
        raise ValueError(f'Row {number}: answer choices must be distinct')
    random.Random(f'CCSP-{number}').shuffle(options)
    questions.append(dict(id=f'CCSP-{number:03d}', track='ccsp', topic=topic, source=source,
                          prompt=prompt, options=options, correct=options.index(answer),
                          explanation=explanation))
used = {q['source'] for q in questions}
bank = dict(version=1, updated='2026-10-04',
            sources={key: value for key, value in sources.items() if key in used},
            questions=questions)
(ROOT / 'ui/questions.js').write_text('window.STUDY_BANK = ' + json.dumps(bank, ensure_ascii=False, indent=2) + ';\n')
print(f'Generated {len(questions)} questions and {len(used)} source references.')
