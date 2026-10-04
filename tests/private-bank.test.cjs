const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const privateBanks = require('../ui/private-bank.js');
const core = require('../ui/study-core.js');
const sample = JSON.parse(fs.readFileSync(path.join(__dirname, '../ui/private-bank-example.json'), 'utf8'));
const clone = () => structuredClone(sample);
const parse = value => privateBanks.parse(JSON.stringify(value), 'test-revision');

test('example imports, persists and exports only question content, with stable restored revision', () => {
  const bank = parse(sample);
  assert.equal(bank.kind, 'private');
  assert.equal(bank.questions.length, 1);
  const exported = JSON.parse(privateBanks.serialize(bank));
  assert.deepEqual(exported, sample);
  assert.deepEqual(privateBanks.restore(privateBanks.stored(bank)), { bank, recovered: false });
  assert.deepEqual(parse(exported), bank);
  assert.deepEqual(Object.keys(exported).sort(), ['questions', 'schemaVersion']);
  assert.equal(privateBanks.restore(null).recovered, false);
});
test('missing IDs get private IDs; literal HTML is retained as plain question text', () => {
  const data = clone();
  delete data.questions[0].id;
  data.questions[0].prompt = '<img src=x onerror="alert(1)"> & <script>anything</script>';
  const bank = parse(data);
  assert.equal(bank.questions[0].id, 'private-0001');
  assert.equal(bank.questions[0].prompt, data.questions[0].prompt);
  assert.equal({}.polluted, undefined);
});
test('rejects unsupported schema, unknown/prototype fields, missing content and malformed JSON', () => {
  const invalid = [null, [], {}, { ...clone(), schemaVersion: 2 }, { ...clone(), progress: {} },
    JSON.parse('{"schemaVersion":1,"questions":[],"__proto__":{"polluted":true}}')];
  for (const data of invalid) assert.throws(() => parse(data));
  for (const key of ['__proto__', 'constructor', 'unknown']) {
    const data = clone();
    Object.defineProperty(data.questions[0], key, { value: {}, enumerable: true });
    assert.throws(() => parse(data));
  }
  for (const key of ['topic', 'prompt', 'options', 'correct', 'explanation', 'source']) {
    const data = clone(); delete data.questions[0][key]; assert.throws(() => parse(data));
  }
  assert.throws(() => privateBanks.parse('{broken'));
  assert.throws(() => privateBanks.parse(42));
  assert.throws(() => privateBanks.parse(JSON.stringify(sample), '../../bad'));
});
test('rejects duplicate IDs, normalized prompts and normalized choices', () => {
  let data = clone(); data.questions.push(structuredClone(data.questions[0])); assert.throws(() => parse(data), /duplicate private ID/);
  data.questions[1].id = 'private-another';
  data.questions[1].prompt = `  ${data.questions[0].prompt.toUpperCase()}  `;
  assert.throws(() => parse(data), /duplicates another/);
  data = clone(); data.questions[0].options[1] = ` ${data.questions[0].options[0].toUpperCase()} `;
  assert.throws(() => parse(data), /distinct choices/);
});
test('requires four choices, integer correct index and bounded private IDs', () => {
  for (const correct of [-1, 4, 1.5, '0', null]) {
    const data = clone(); data.questions[0].correct = correct; assert.throws(() => parse(data));
  }
  for (const id of ['CCSP-001', '__proto__', 'private-', `private-${'a'.repeat(57)}`, 1]) {
    const data = clone(); data.questions[0].id = id; assert.throws(() => parse(data));
  }
  for (const options of [[], ['one', 'two', 'three'], ['one', 'two', 'three', 'four', 'five'], null]) {
    const data = clone(); data.questions[0].options = options; assert.throws(() => parse(data));
  }
});
test('allows HTTPS public references and rejects dangerous URL forms or credentials', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,test', 'file:///etc/passwd', 'http://example.com',
    'https://name:password@example.com', 'https://example.com/a b', 'not-a-url']) {
    const data = clone(); data.questions[0].source.url = url; assert.throws(() => parse(data));
  }
  const data = clone(); data.questions[0].source.url = 'https://EXAMPLE.COM/docs';
  assert.equal(parse(data).sources['source-private-example-001'].url, 'https://example.com/docs');
  data.questions[0].source.url = 'https://example.com/' + 'é'.repeat(400);
  assert.throws(() => parse(data), /2048 characters/);
  data.questions[0].source.url = 'https://example.com/docs';
  data.questions[0].source.extra = 'ignored'; assert.throws(() => parse(data));
});
test('enforces every text cap and rejects empty values and control characters', () => {
  const fields = [['topic', 160], ['prompt', 2000], ['explanation', 4000]];
  for (const [field, cap] of fields) {
    const data = clone(); data.questions[0][field] = 'a'.repeat(cap); assert.doesNotThrow(() => parse(data));
    data.questions[0][field] += 'a'; assert.throws(() => parse(data));
    data.questions[0][field] = ' '; assert.throws(() => parse(data));
    data.questions[0][field] = 'bad\u0000text'; assert.throws(() => parse(data));
  }
  const data = clone(); data.questions[0].options[0] = 'a'.repeat(1001); assert.throws(() => parse(data));
  data.questions[0].options[0] = 'a'; data.questions[0].source.title = 'a'.repeat(301); assert.throws(() => parse(data));
  data.questions[0].source.title = 'a'; data.questions[0].source.url = 'https://example.com/' + 'a'.repeat(2048); assert.throws(() => parse(data));
});
test('bounds UTF-8 file size, normalized export size and question count', () => {
  assert.throws(() => privateBanks.parse(' '.repeat(privateBanks.MAX_BYTES + 1)), /2 MiB/);
  assert.throws(() => privateBanks.parse('😀'.repeat(privateBanks.MAX_BYTES / 3)), /2 MiB/);
  const data = clone(); data.questions = [];
  assert.throws(() => parse(data));
  for (let i = 0; i < 500; i++) data.questions.push({ ...structuredClone(sample.questions[0]),
    id: `private-${i}`, prompt: `Original concept ${i}` });
  assert.equal(parse(data).questions.length, 500);
  data.questions.push({ ...data.questions[0], id: 'private-500', prompt: 'Extra concept' }); assert.throws(() => parse(data));
  data.questions.pop();
  for (const q of data.questions) q.explanation = 'a'.repeat(3800);
  assert.ok(Buffer.byteLength(JSON.stringify(data)) < privateBanks.MAX_BYTES);
  assert.throws(() => parse(data), /normalized export/);
});
test('corrupt or oversized persisted banks recover to an empty private bank', () => {
  for (const raw of ['{broken', '{}', JSON.stringify({ schemaVersion: 1, revision: '../bad', bank: sample }),
    JSON.stringify({ schemaVersion: 1, revision: 'valid', bank: sample, extra: true }), 'x'.repeat(privateBanks.MAX_BYTES + 513)]) {
    assert.deepEqual(privateBanks.restore(raw), { bank: privateBanks.empty(), recovered: true });
  }
});
test('bank replacements cannot inherit scores or sessions even when question IDs recur', () => {
  const old = parse(sample);
  const s = core.createSession(old, { track: 'ccsp', topic: 'all', count: 'all', mode: 'practice' }, core.emptyProgress());
  s.entries[0].selected = old.questions[0].correct; s.entries[0].submitted = true; s.completed = true;
  const progress = core.recordSession(old, s, core.emptyProgress());
  const raw = JSON.stringify({ version: core.VERSION, bankVersion: old.version, progress, session: s });
  assert.equal(core.restore(old, raw).progress.history.length, 1);
  const replacement = privateBanks.parse(JSON.stringify(sample), 'replacement');
  const reset = core.restore(replacement, raw);
  assert.deepEqual(reset.progress, core.emptyProgress()); assert.equal(reset.session, null); assert.equal(reset.recovered, true);
  const missingVersion = JSON.stringify({ version: core.VERSION, progress, session: s });
  assert.equal(core.restore(old, missingVersion).progress.history.length, 0);
});

test('a private topic named all remains selectable independently', () => {
  const data = clone(); data.questions[0].topic = 'all';
  data.questions.push({ ...structuredClone(data.questions[0]), id: 'private-another', topic: 'Other', prompt: 'Different original concept' });
  const bank = parse(data);
  assert.equal(core.pool(bank, { track: 'ccsp', topic: 'all', allTopics: false }, core.emptyProgress()).length, 1);
  assert.equal(core.pool(bank, { track: 'ccsp', topic: 'all', allTopics: true }, core.emptyProgress()).length, 2);
});
