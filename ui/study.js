'use strict';
const curatedBank = { ...window.STUDY_BANK, kind: 'curated' };
const core = window.StudyCore;
const privateBanks = window.PrivateBank;
const KEYS = { curated: 'cloudcue.ccsp.v1', private: 'cloudcue.private.v1',
  bank: 'cloudcue.private-bank.v1', choice: 'cloudcue.bank-choice.v1' };
const $ = selector => document.querySelector(selector);
let storageUnavailable = false;
function readStored(key) {
  try { return localStorage.getItem(key); } catch { storageUnavailable = true; return null; }
}
const restoredBank = privateBanks.restore(readStored(KEYS.bank));
let privateBank = restoredBank.bank;
let bankKind = readStored(KEYS.choice) === 'private' ? 'private' : 'curated';
let bank = bankKind === 'private' ? privateBank : curatedBank;
let questionById = new Map(bank.questions.map(q => [q.id, q]));
const restored = core.restore(bank, readStored(KEYS[bankKind]));
let progress = restored.progress;
let session = restored.session;
let pendingBank = null;
const track = 'ccsp';
const bankLabel = () => bankKind === 'private' ? 'Private CCSP' : 'Curated CCSP';

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function save() {
  try { localStorage.setItem(KEYS[bankKind], JSON.stringify({ version: core.VERSION, bankVersion: bank.version, progress, session })); }
  catch { storageUnavailable = true; }
  $('#storage-note').hidden = !storageUnavailable;
}
function switchBank(kind, skipSave = false) {
  if (!skipSave) save();
  bankKind = kind === 'private' ? 'private' : 'curated';
  bank = bankKind === 'private' ? privateBank : curatedBank;
  questionById = new Map(bank.questions.map(q => [q.id, q]));
  const state = core.restore(bank, readStored(KEYS[bankKind]));
  progress = state.progress; session = state.session;
  $('#recovery-note').hidden = !state.recovered;
  if (session?.completed && !session.scored) { core.recordSession(bank, session, progress); save(); }
  try { localStorage.setItem(KEYS.choice, bankKind); } catch { storageUnavailable = true; }
  $('#study-topic').value = 'all';
  $('#missed-only').checked = false;
  renderHome();
}
function settings() {
  const value = $('#study-topic').value;
  return { track, topic: value === 'all' ? 'all' : value.slice(6), allTopics: value === 'all', count: $('#study-count').value,
    mode: $('#study-mode').value, missedOnly: $('#missed-only').checked };
}
function showPanel(panel) {
  $('#study-home').hidden = panel !== 'home';
  $('#study-session').hidden = panel !== 'session';
  $('#study-results').hidden = panel !== 'results';
}
function trackStats() {
  const questions = bank.questions.filter(q => q.track === track);
  const attempted = questions.filter(q => progress.attempts[q.id]);
  const latestCorrect = attempted.filter(q => progress.attempts[q.id].lastCorrect).length;
  $('#bank-count').textContent = questions.length;
  $('#seen-count').textContent = attempted.length;
  $('#accuracy').textContent = attempted.length ? `${Math.round(latestCorrect / attempted.length * 100)}%` : '—';
  $('#missed-count').textContent = attempted.length - latestCorrect;
}
function updateAvailable() {
  const count = core.pool(bank, settings(), progress).length;
  $('#available-count').textContent = count ? `${count} questions available. Questions and answer choices shuffle each session.`
    : !bank.questions.length ? 'Import a private bank to start practicing.'
      : 'No missed questions in this selection yet. Try a regular session or choose another topic.';
  $('#start-study').disabled = count === 0;
}
function renderHome() {
  showPanel('home');
  $('#bank-kind').value = bankKind;
  $('#private-bank-panel').hidden = bankKind !== 'private';
  $('#private-bank-count').textContent = `${privateBank.questions.length} private questions on this device.`;
  $('#export-private-bank').disabled = !privateBank.questions.length;
  $('#remove-private-bank').disabled = !privateBank.questions.length;
  $('#storage-note').hidden = !storageUnavailable;
  $('#track-description').textContent = bankKind === 'private'
    ? 'Your private question bank · scores and sessions are separate from curated practice.'
    : 'Curated CCSP · All six domains · August 2026 outline. Fixed practice sessions; this is not an adaptive exam simulator.';
  const topicSelect = $('#study-topic');
  const prior = topicSelect.value;
  topicSelect.replaceChildren(new Option('All topics', 'all'));
  for (const topic of new Set(bank.questions.filter(q => q.track === track).map(q => q.topic))) topicSelect.add(new Option(topic, `topic:${topic}`));
  if ([...topicSelect.options].some(option => option.value === prior)) topicSelect.value = prior;
  trackStats();
  updateAvailable();
  const banner = $('#resume-banner');
  banner.hidden = !session || session.completed;
  if (!banner.hidden) $('#resume-description').textContent = `${bankLabel()} · ${session.mode === 'practice' ? 'Practice' : 'Self-test'} · ${session.entries.filter(e => e.submitted).length}/${session.entries.length} answered`;
  $('#last-result').hidden = !session?.completed;
  $('#recent-sessions').replaceChildren();
  const recent = progress.history.filter(s => s.track === track).slice(0, 5);
  $('#recent-empty').hidden = recent.length > 0;
  for (const item of recent) {
    const row = element('li');
    row.append(element('span', `${new Date(item.finishedAt).toLocaleDateString()} · ${item.mode === 'practice' ? 'Practice' : 'Self-test'}`),
      element('strong', `${item.correct}/${item.total} · ${item.percent}%`));
    $('#recent-sessions').append(row);
  }
}
function renderFeedback(container, question, entry, reveal) {
  container.replaceChildren();
  container.hidden = !reveal;
  if (!reveal) return;
  const correct = entry.submitted && entry.selected === question.correct;
  container.className = `feedback ${correct ? 'is-correct' : 'is-incorrect'}`;
  container.append(element('strong', !entry.submitted ? 'Unanswered' : correct ? 'Correct' : 'Review this concept'),
    element('p', `Answer: ${question.options[question.correct]}`), element('p', question.explanation));
  const source = bank.sources[question.source];
  container.append(element('p', source.title, 'source-title'));
  const link = element('a', 'Read source in browser');
  link.href = source.url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  const copy = element('button', 'Copy source link', 'secondary');
  copy.type = 'button';
  const urlField = element('input');
  urlField.value = source.url;
  urlField.readOnly = true;
  urlField.setAttribute('aria-label', 'Source URL');
  copy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(source.url); copy.textContent = 'Link copied'; }
    catch { urlField.focus(); urlField.select(); copy.textContent = 'Select and copy with ⌘C'; }
  });
  const controls = element('div', undefined, 'source-actions');
  controls.append(link, copy);
  container.append(controls, urlField);
}
function renderQuestion() {
  showPanel('session');
  const entry = session.entries[session.index];
  const question = questionById.get(entry.id);
  const answered = session.entries.filter(e => e.submitted).length;
  $('#session-label').textContent = `${bankLabel()} · ${session.mode === 'practice' ? 'Practice' : 'Self-test'}`;
  $('#question-position').textContent = `Question ${session.index + 1} of ${session.entries.length}`;
  $('#session-progress').value = answered;
  $('#session-progress').max = session.entries.length;
  $('#answered-label').textContent = `${answered} answered`;
  $('#question-tag').textContent = `${question.id} · ${question.topic}`;
  $('#question-prompt').textContent = question.prompt;
  $('#question-options').replaceChildren();
  const reveal = core.canReveal(session, entry);
  for (const [index, optionIndex] of entry.order.entries()) {
    const label = element('label', undefined, 'answer-option');
    const radio = element('input');
    radio.type = 'radio';
    radio.name = 'study-answer';
    radio.value = optionIndex;
    radio.checked = entry.selected === optionIndex;
    radio.disabled = entry.submitted;
    radio.addEventListener('change', () => {
      entry.selected = optionIndex;
      save();
      $('#submit-answer').disabled = false;
      for (const item of $('#question-options').children) item.classList.toggle('selected', item.querySelector('input').checked);
    });
    label.classList.toggle('selected', radio.checked);
    if (reveal && optionIndex === question.correct) label.classList.add('correct-option');
    if (reveal && entry.submitted && radio.checked && optionIndex !== question.correct) label.classList.add('incorrect-option');
    label.append(radio, element('span', String.fromCharCode(65 + index), 'option-letter'), element('span', question.options[optionIndex]));
    $('#question-options').append(label);
  }
  $('#submit-answer').hidden = entry.submitted;
  $('#submit-answer').disabled = entry.selected === null;
  $('#next-question').hidden = !entry.submitted;
  $('#next-question').textContent = session.index === session.entries.length - 1 ? 'Finish session' : 'Next question';
  $('#previous-question').disabled = session.index === 0;
  $('#selftest-note').hidden = session.mode !== 'selftest';
  $('#selftest-note').textContent = entry.submitted ? 'Answer recorded. Explanations remain hidden until you finish.' : 'Choose an answer and submit it. Explanations appear after you finish the session.';
  renderFeedback($('#answer-feedback'), question, entry, reveal);
}
function finishSession() {
  session.completed = true;
  core.recordSession(bank, session, progress);
  save();
  renderResults();
  $('#results-title').focus();
}
function renderResults() {
  showPanel('results');
  const result = core.summary(bank, session);
  $('#results-title').textContent = `${bankLabel()} · Session complete`;
  $('#result-score').textContent = `${result.correct} / ${result.total}`;
  $('#result-percent').textContent = `${result.percent}% correct`;
  $('#result-detail').textContent = `${result.incorrect} incorrect · ${result.unanswered} unanswered. Unanswered questions count toward the session total.`;
  $('#retry-missed').disabled = result.incorrect + result.unanswered === 0;
  renderReview();
}
function renderReview() {
  const container = $('#review-list');
  container.replaceChildren();
  for (const entry of session.entries) {
    const q = questionById.get(entry.id);
    const passed = entry.submitted && entry.selected === q.correct;
    if ($('#review-missed-only').checked && passed) continue;
    const card = element('article', undefined, 'review-card');
    card.append(element('p', `${q.id} · ${q.topic}`, 'eyebrow'), element('h3', q.prompt),
      element('p', `Your answer: ${entry.submitted ? q.options[entry.selected] : 'Not submitted'}`));
    const feedback = element('div');
    renderFeedback(feedback, q, entry, true);
    card.append(feedback);
    container.append(card);
  }
}
function startSession() {
  try {
    session = core.createSession(bank, settings(), progress);
    save();
    renderQuestion();
    $('#question-prompt').focus();
  } catch (cause) { $('#available-count').textContent = cause.message; }
}

$('#bank-kind').addEventListener('change', () => switchBank($('#bank-kind').value));
let importGeneration = 0;
$('#private-bank-file').addEventListener('change', async () => {
  const generation = ++importGeneration;
  pendingBank = null;
  if ($('#import-bank-dialog').open) $('#import-bank-dialog').close();
  $('#private-bank-status').textContent = '';
  const file = $('#private-bank-file').files[0];
  if (!file) return;
  if (file.size > privateBanks.MAX_BYTES) {
    $('#private-bank-status').textContent = 'Choose a JSON file no larger than 2 MiB.';
    $('#private-bank-file').value = '';
    return;
  }
  try {
    const input = await file.text();
    if (generation !== importGeneration) return;
    pendingBank = privateBanks.parse(input);
    $('#import-bank-description').textContent = `${pendingBank.questions.length} valid questions are ready to import on this device.`;
    $('#import-bank-dialog').showModal();
  } catch (cause) {
    if (generation !== importGeneration) return;
    pendingBank = null;
    $('#private-bank-status').textContent = cause instanceof Error
      && /^(Choose|The|Use|Question)/.test(cause.message) ? cause.message : 'The selected file could not be read.';
    $('#private-bank-file').value = '';
  }
});
$('#import-bank-cancel').addEventListener('click', () => $('#import-bank-dialog').close());
$('#import-bank-dialog').addEventListener('close', () => { pendingBank = null; $('#private-bank-file').value = ''; });
$('#import-bank-confirm').addEventListener('click', () => {
  if (!pendingBank) return;
  try { localStorage.setItem(KEYS.bank, privateBanks.stored(pendingBank)); }
  catch {
    storageUnavailable = true;
    $('#private-bank-status').textContent = 'The bank could not be saved. Your existing bank was kept. Free local storage and try again.';
    $('#storage-note').hidden = false;
    $('#import-bank-dialog').close();
    return;
  }
  if (bankKind === 'curated') save();
  privateBank = pendingBank;
  try { localStorage.removeItem(KEYS.private); } catch { storageUnavailable = true; }
  switchBank('private', true);
  save();
  $('#private-bank-status').textContent = 'Private questions imported locally. Private progress starts fresh.';
  $('#import-bank-dialog').close();
});
$('#export-private-bank').addEventListener('click', () => {
  if (!privateBank.questions.length) return;
  $('#private-bank-export').value = privateBanks.serialize(privateBank);
  $('#export-bank-status').textContent = '';
  $('#export-bank-dialog').showModal();
});
$('#export-bank-close').addEventListener('click', () => $('#export-bank-dialog').close());
$('#export-bank-dialog').addEventListener('close', () => { $('#private-bank-export').value = ''; });
$('#download-private-bank').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([$('#private-bank-export').value], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url; link.download = 'cloudcue-private-questions.json';
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $('#export-bank-status').textContent = 'Download requested. If your webview does not offer a file, use Copy JSON.';
});
$('#copy-private-bank').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('#private-bank-export').value); $('#export-bank-status').textContent = 'JSON copied. Paste it only where you intend.'; }
  catch { $('#private-bank-export').focus(); $('#private-bank-export').select(); $('#export-bank-status').textContent = 'Select the JSON and copy with your system keyboard shortcut.'; }
});
$('#remove-private-bank').addEventListener('click', () => $('#remove-bank-dialog').showModal());
$('#remove-bank-cancel').addEventListener('click', () => $('#remove-bank-dialog').close());
$('#remove-bank-confirm').addEventListener('click', () => {
  try { localStorage.removeItem(KEYS.bank); }
  catch {
    storageUnavailable = true;
    $('#private-bank-status').textContent = 'The private bank could not be removed from local storage. Try again when storage is available.';
    $('#storage-note').hidden = false;
    $('#remove-bank-dialog').close();
    return;
  }
  try { localStorage.removeItem(KEYS.private); } catch { storageUnavailable = true; }
  privateBank = privateBanks.empty();
  switchBank('private', true);
  $('#private-bank-status').textContent = 'Private questions and progress removed locally.';
  $('#remove-bank-dialog').close();
});

for (const selector of ['#study-topic', '#study-count', '#study-mode', '#missed-only']) $(selector).addEventListener('change', updateAvailable);
$('#start-study').addEventListener('click', () => {
  if (session && !session.completed) {
    $('#replace-dialog').showModal();
  } else startSession();
});
$('#replace-confirm').addEventListener('click', () => { $('#replace-dialog').close(); startSession(); });
$('#replace-cancel').addEventListener('click', () => $('#replace-dialog').close());
$('#resume-study').addEventListener('click', () => { renderQuestion(); $('#question-prompt').focus(); });
$('#pause-study').addEventListener('click', () => { save(); renderHome(); });
$('#submit-answer').addEventListener('click', () => {
  const entry = session.entries[session.index];
  if (entry.selected === null || entry.submitted) return;
  entry.submitted = true;
  save();
  renderQuestion();
  $('#next-question').focus();
});
$('#next-question').addEventListener('click', () => {
  if (session.index === session.entries.length - 1) finishSession();
  else { session.index++; save(); renderQuestion(); $('#question-prompt').focus(); }
});
$('#previous-question').addEventListener('click', () => { session.index--; save(); renderQuestion(); $('#question-prompt').focus(); });
$('#finish-early').addEventListener('click', () => {
  const count = session.entries.filter(e => !e.submitted).length;
  if (!count) { finishSession(); return; }
  $('#finish-description').textContent = `${count} questions are not submitted. They will count as unanswered in your score. You can review all answers after finishing.`;
  $('#finish-dialog').showModal();
});
$('#finish-confirm').addEventListener('click', () => { $('#finish-dialog').close(); finishSession(); });
$('#finish-cancel').addEventListener('click', () => $('#finish-dialog').close());
$('#review-missed-only').addEventListener('change', renderReview);
$('#back-to-setup').addEventListener('click', () => { renderHome(); });
$('#last-result').addEventListener('click', renderResults);
$('#retry-missed').addEventListener('click', () => {
  const missed = session.entries.filter(e => !e.submitted || e.selected !== questionById.get(e.id).correct).map(e => questionById.get(e.id));
  if (!missed.length) return;
  session = core.createSession({ ...bank, questions: missed }, { track: session.track, topic: 'all', count: 'all', mode: 'practice', missedOnly: false }, progress);
  $('#review-missed-only').checked = false;
  save(); renderQuestion(); $('#question-prompt').focus();
});
$('#reset-progress').addEventListener('click', () => {
  $('#reset-description').textContent = `This clears ${bankLabel()} scores, missed-question history, and the saved session on this device. The other bank's progress stays separate; question content is kept.`;
  $('#reset-dialog').showModal();
});
$('#reset-confirm').addEventListener('click', () => {
  progress = core.emptyProgress(); session = null;
  save(); $('#reset-dialog').close(); renderHome();
});
$('#reset-cancel').addEventListener('click', () => $('#reset-dialog').close());
$('#storage-note').hidden = !storageUnavailable;
$('#recovery-note').hidden = !restored.recovered;
if (restoredBank.recovered) $('#private-bank-status').textContent = 'An unreadable private bank was ignored. Import a valid backup to restore its questions.';
if (session?.completed && !session.scored) { core.recordSession(bank, session, progress); save(); }
renderHome();
