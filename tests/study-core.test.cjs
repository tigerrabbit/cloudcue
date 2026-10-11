const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const core = require('../ui/study-core.js');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../ui/questions.js'), 'utf8'), context);
const bank = JSON.parse(JSON.stringify(context.window.STUDY_BANK));

test('bank has unique IDs, four distinct choices, valid answers, and primary-source URLs', () => {
  assert.equal(bank.questions.length, 60);
  assert.equal(bank.questions.filter(q => q.track === 'ccsp').length, 60);
  assert.equal(new Set(bank.questions.map(q => q.id)).size, 60);
  for (const q of bank.questions) {
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options).size, 4);
    assert.ok(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < 4);
    assert.ok(q.prompt.length > 20 && q.explanation.length > 20);
    const url = new URL(bank.sources[q.source].url);
    assert.equal(url.protocol, 'https:');
    assert.ok(['isc2.org', 'nist.gov', 'owasp.org', 'microsoft.com', 'amazon.com', 'cloudsecurityalliance.org', 'europa.eu'].some(domain => url.hostname === domain || url.hostname.endsWith('.' + domain)));
  }
  assert.equal(new Set(bank.questions.filter(q => q.track === 'ccsp').map(q => q.topic)).size, 6);
});
require('../shared/study-contract.cjs')(core, bank);
function session() { return core.createSession(bank, { track: 'ccsp', topic: 'all', count: '10', mode: 'selftest', missedOnly: false }, core.emptyProgress(), () => 0.3); }

test('generated bank matches the authoring rows and retains only used references', () => {
  const rows = fs.readFileSync(path.join(__dirname, '../data/ccsp.psv'), 'utf8').trim().split(/\r?\n/);
  const sources = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/sources.json'), 'utf8'));
  assert.equal(rows.length, bank.questions.length);
  for (const [index, row] of rows.entries()) {
    const fields = row.split('|');
    assert.equal(fields.length, 8);
    const [topic, source, prompt, answer, w1, w2, w3, explanation] = fields;
    const question = bank.questions[index];
    assert.equal(question.id, `CCSP-${String(index + 1).padStart(3, '0')}`);
    assert.equal(question.track, 'ccsp');
    assert.deepEqual([question.topic, question.source, question.prompt, question.explanation],
      [topic, source, prompt, explanation]);
    assert.equal(question.options[question.correct], answer);
    assert.deepEqual([...question.options].sort(), [answer, w1, w2, w3].sort());
    assert.deepEqual(bank.sources[source], sources[source]);
  }
  assert.deepEqual(Object.keys(bank.sources).sort(), [...new Set(bank.questions.map(q => q.source))].sort());
  for (const source of Object.values(bank.sources)) {
    const url = new URL(source.url);
    assert.equal(url.username, '');
    assert.equal(url.password, '');
  }
});

test('foreign app sessions and progress cannot cross into CCSP state', () => {
  const foreign = session();
  foreign.track = 'unsupported';
  const progress = core.emptyProgress();
  progress.attempts['CCSP-001'] = { attempts: 1, correct: 1, lastCorrect: true };
  progress.attempts['FOREIGN-001'] = { attempts: 2, correct: 1, lastCorrect: false };
  progress.history.push({ id: 'foreign', track: 'unsupported', mode: 'practice',
    finishedAt: new Date().toISOString(), total: 10, answered: 10, correct: 8, percent: 80 });
  const restored = core.restore(bank, JSON.stringify({ version: 1, progress, session: foreign }));
  assert.equal(restored.session, null);
  assert.equal(restored.recovered, true);
  assert.equal(restored.progress.history.length, 0);
  assert.deepEqual(Object.keys(restored.progress.attempts), ['CCSP-001']);
  assert.throws(() => core.createSession(bank, { ...settings, track: 'unsupported' }, progress));
});

test('stale or damaged paused sessions recover without discarding valid scores', () => {
  const progress = core.emptyProgress();
  progress.attempts['CCSP-001'] = { attempts: 3, correct: 2, lastCorrect: true };
  const mutations = [
    saved => { saved.bankVersion++; },
    saved => { saved.entries[1].id = saved.entries[0].id; },
    saved => { saved.entries[0].order = [0, 0, 2, 3]; },
    saved => { saved.entries[0].order = ['0', '1', '2', '3']; },
    saved => { saved.entries[0].order = [[0], [1], [2], [3]]; },
    saved => { saved.entries[0].submitted = true; saved.entries[0].selected = null; },
  ];
  for (const mutate of mutations) {
    const saved = session();
    mutate(saved);
    const restored = core.restore(bank, JSON.stringify({ version: 1, progress, session: saved }));
    assert.equal(restored.session, null);
    assert.equal(restored.recovered, true);
    assert.equal(restored.progress.attempts['CCSP-001'].attempts, 3);
  }
});
