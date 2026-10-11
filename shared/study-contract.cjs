// Shared behavior exercised against each consumer's bundled engine and bank.
const test = require('node:test');
const assert = require('node:assert/strict');
module.exports = function studyContract(core, bank) {
const settings = { track: 'ccsp', topic: 'all', count: '10', mode: 'selftest', missedOnly: false };
function session() { return core.createSession(bank, settings, core.emptyProgress(), () => 0.3); }
test('topic selection, session lengths, question uniqueness, and option permutation', () => {
  const s = session();
  assert.equal(s.entries.length, 10);
  assert.equal(new Set(s.entries.map(e => e.id)).size, 10);
  for (const e of s.entries) assert.deepEqual([...e.order].sort(), [0, 1, 2, 3]);
  const small = core.createSession(bank, { ...settings, topic: '1. Cloud Concepts, Architecture and Design', count: '40' }, core.emptyProgress());
  assert.equal(small.entries.length, 10);
  for (const e of small.entries) assert.equal(bank.questions.find(q => q.id === e.id).topic, '1. Cloud Concepts, Architecture and Design');
  const all = core.createSession(bank, { ...settings, track: 'ccsp', count: 'all' }, core.emptyProgress());
  assert.equal(all.entries.length, 60);
});
test('self-test never reveals correctness until completion; practice waits for submission', () => {
  const s = session();
  const e = s.entries[0];
  e.selected = 0;
  assert.equal(core.canReveal(s, e), false);
  e.submitted = true;
  assert.equal(core.canReveal(s, e), false);
  s.completed = true;
  assert.equal(core.canReveal(s, e), true);
  s.completed = false; s.mode = 'practice';
  assert.equal(core.canReveal(s, e), true);
  e.submitted = false;
  assert.equal(core.canReveal(s, e), false);
});
test('scores correct, incorrect, and unanswered separately and records only once', () => {
  const s = session();
  const q0 = bank.questions.find(q => q.id === s.entries[0].id);
  const q1 = bank.questions.find(q => q.id === s.entries[1].id);
  Object.assign(s.entries[0], { selected: q0.correct, submitted: true });
  Object.assign(s.entries[1], { selected: (q1.correct + 1) % 4, submitted: true });
  s.entries[2].selected = 0; // An unsubmitted selection must not count as answered.
  assert.deepEqual(core.summary(bank, s), { correct: 1, answered: 2, total: 10, incorrect: 1, unanswered: 8, percent: 10 });
  const progress = core.emptyProgress();
  assert.throws(() => core.recordSession(bank, s, progress));
  s.completed = true;
  core.recordSession(bank, s, progress);
  core.recordSession(bank, s, progress);
  assert.equal(progress.history.length, 1);
  assert.equal(progress.attempts[q0.id].attempts, 1);
  assert.equal(progress.attempts[q1.id].lastCorrect, false);
  assert.equal(progress.attempts[s.entries[2].id], undefined);
});
test('missed filters use the latest completed answer', () => {
  const progress = core.emptyProgress();
  progress.attempts['CCSP-001'] = { attempts: 2, correct: 1, lastCorrect: false };
  progress.attempts['CCSP-002'] = { attempts: 2, correct: 1, lastCorrect: true };
  assert.deepEqual(core.pool(bank, { ...settings, missedOnly: true }, progress).map(q => q.id), ['CCSP-001']);
  assert.throws(() => core.createSession(bank, { ...settings, missedOnly: true }, core.emptyProgress()));
});
test('paused choices, position, and shuffle survive storage restoration', () => {
  const s = session();
  s.index = 3;
  s.entries[3].selected = 2;
  s.entries[3].submitted = true;
  const restored = core.restore(bank, JSON.stringify({ version: 1, progress: core.emptyProgress(), session: s }));
  assert.deepEqual(restored.session, s);
  assert.equal(restored.recovered, false);
});
test('corrupt storage and invalid saved questions recover without crashing', () => {
  assert.equal(core.restore(bank, '{broken').session, null);
  const s = session();
  s.entries[0].id = 'MISSING';
  const progress = core.emptyProgress();
  progress.attempts['CCSP-001'] = { attempts: 1, correct: 0, lastCorrect: false };
  const result = core.restore(bank, JSON.stringify({ version: 1, progress, session: s }));
  assert.equal(result.session, null);
  assert.equal(result.progress.attempts['CCSP-001'].lastCorrect, false);
  assert.equal(result.recovered, true);
});

};
