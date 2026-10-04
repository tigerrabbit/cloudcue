(function (root) {
  'use strict';
  const MAX_BYTES = 2 * 1024 * 1024;
  const MAX_QUESTIONS = 500;
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const bytes = text => new TextEncoder().encode(text).length;
  function fail(message) { throw new Error(message); }
  function keys(value, allowed, required, label) {
    if (!object(value) || Object.keys(value).some(key => !allowed.includes(key))
      || required.some(key => !Object.hasOwn(value, key))) fail(`${label} has missing or unsupported fields.`);
  }
  function text(value, max, label) {
    if (typeof value !== 'string' || !value.trim() || value.length > max
      || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) fail(`${label} must be nonempty text within its length limit.`);
    return value.trim();
  }
  function empty() { return { kind: 'private', version: 'private-empty', sources: {}, questions: [] }; }
  function revision() { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`; }
  function parse(input, id = revision()) {
    if (typeof input !== 'string' || bytes(input) > MAX_BYTES) fail('Choose a JSON file no larger than 2 MiB.');
    if (typeof id !== 'string' || !/^[A-Za-z0-9-]{1,100}$/.test(id)) fail('The bank revision is invalid.');
    let data;
    try { data = JSON.parse(input); } catch { fail('The selected file is not valid JSON.'); }
    keys(data, ['schemaVersion', 'questions'], ['schemaVersion', 'questions'], 'The bank');
    if (data.schemaVersion !== 1 || !Array.isArray(data.questions)
      || data.questions.length < 1 || data.questions.length > MAX_QUESTIONS) fail('Use schema version 1 with 1–500 questions.');
    const ids = new Set(), prompts = new Set(), sources = {}, questions = [];
    for (const [index, item] of data.questions.entries()) {
      const label = `Question ${index + 1}`;
      keys(item, ['id', 'topic', 'prompt', 'options', 'correct', 'explanation', 'source'],
        ['topic', 'prompt', 'options', 'correct', 'explanation', 'source'], label);
      const questionId = item.id === undefined ? `private-${String(index + 1).padStart(4, '0')}` : item.id;
      if (typeof questionId !== 'string' || !/^private-[A-Za-z0-9_-]{1,56}$/.test(questionId)
        || ids.has(questionId)) fail(`${label} has an invalid or duplicate private ID.`);
      const prompt = text(item.prompt, 2000, `${label} prompt`);
      const normalized = prompt.replace(/\s+/g, ' ').toLowerCase();
      if (prompts.has(normalized)) fail(`${label} duplicates another question prompt.`);
      if (!Array.isArray(item.options) || item.options.length !== 4) fail(`${label} needs four answer choices.`);
      const options = item.options.map(option => text(option, 1000, `${label} answer choice`));
      if (new Set(options.map(option => option.replace(/\s+/g, ' ').toLowerCase())).size !== 4
        || !Number.isInteger(item.correct) || item.correct < 0 || item.correct > 3) fail(`${label} needs distinct choices and a correct index from 0 to 3.`);
      keys(item.source, ['title', 'url'], ['title', 'url'], `${label} source`);
      const urlText = text(item.source.url, 2048, `${label} source URL`);
      let url;
      try { url = new URL(urlText); } catch { fail(`${label} needs a valid HTTPS source URL.`); }
      if (url.protocol !== 'https:' || url.username || url.password || /\s/.test(urlText)
        || url.href.length > 2048) fail(`${label} needs an HTTPS source URL without credentials or whitespace, within 2048 characters.`);
      const source = `source-${questionId}`;
      sources[source] = { title: text(item.source.title, 300, `${label} source title`), url: url.href };
      questions.push({ id: questionId, track: 'ccsp', topic: text(item.topic, 160, `${label} topic`),
        prompt, options, correct: item.correct, explanation: text(item.explanation, 4000, `${label} explanation`), source });
      ids.add(questionId); prompts.add(normalized);
    }
    const bank = { kind: 'private', version: `private-${id}`, sources, questions };
    if (bytes(serialize(bank)) > MAX_BYTES) fail('The normalized export exceeds 2 MiB. Use fewer or shorter questions.');
    return bank;
  }
  function serialize(bank) {
    return JSON.stringify({ schemaVersion: 1, questions: bank.questions.map(question => ({
      id: question.id, topic: question.topic, prompt: question.prompt, options: question.options,
      correct: question.correct, explanation: question.explanation, source: bank.sources[question.source],
    })) }, null, 2);
  }
  function stored(bank) {
    // Compact storage avoids exporting progress or duplicating internal source mappings.
    return JSON.stringify({ schemaVersion: 1, revision: bank.version.slice(8),
      bank: JSON.parse(serialize(bank)) });
  }
  function restore(raw) {
    if (!raw) return { bank: empty(), recovered: false };
    try {
      if (typeof raw !== 'string' || bytes(raw) > MAX_BYTES + 512) throw new Error();
      const data = JSON.parse(raw);
      keys(data, ['schemaVersion', 'revision', 'bank'], ['schemaVersion', 'revision', 'bank'], 'Saved bank');
      if (data.schemaVersion !== 1 || typeof data.revision !== 'string'
        || !/^[A-Za-z0-9-]{1,100}$/.test(data.revision)) throw new Error();
      return { bank: parse(JSON.stringify(data.bank), data.revision), recovered: false };
    } catch { return { bank: empty(), recovered: true }; }
  }
  const api = { MAX_BYTES, MAX_QUESTIONS, empty, parse, serialize, stored, restore };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PrivateBank = api;
})(typeof window === 'undefined' ? globalThis : window);
