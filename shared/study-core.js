(function (root) {
  'use strict';
  const VERSION = 1;
  function shuffled(values, random = Math.random) {
    const result = [...values];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function emptyProgress() { return { attempts: {}, history: [] }; }
  function pool(bank, settings, progress) {
    return bank.questions.filter(q => q.track === settings.track
      && (settings.allTopics === true || (settings.allTopics === undefined && settings.topic === 'all') || q.topic === settings.topic)
      && (!settings.missedOnly || progress.attempts[q.id]?.lastCorrect === false));
  }
  function createSession(bank, settings, progress, random = Math.random) {
    if (!['ccsp'].includes(settings.track)
      || !['practice', 'selftest'].includes(settings.mode)) throw new Error('Invalid study settings');
    const candidates = pool(bank, settings, progress);
    if (!candidates.length) throw new Error('No questions match these settings.');
    const count = settings.count === 'all' ? candidates.length : Number(settings.count);
    if (!Number.isInteger(count) || count < 1) throw new Error('Choose a valid session length.');
    return {
      version: VERSION, bankVersion: bank.version,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      track: settings.track, topic: settings.topic, mode: settings.mode,
      index: 0, startedAt: new Date().toISOString(), completed: false, scored: false,
      entries: shuffled(candidates, random).slice(0, count).map(q => ({
        id: q.id, order: shuffled([0, 1, 2, 3], random), selected: null, submitted: false,
      })),
    };
  }
  function summary(bank, session) {
    const byId = new Map(bank.questions.map(q => [q.id, q]));
    let correct = 0, answered = 0;
    for (const entry of session.entries) {
      if (!entry.submitted) continue;
      answered++;
      if (entry.selected === byId.get(entry.id).correct) correct++;
    }
    const total = session.entries.length;
    return { correct, answered, total, incorrect: answered - correct,
      unanswered: total - answered, percent: Math.round(correct / total * 100) };
  }
  function recordSession(bank, session, progress) {
    if (!session.completed) throw new Error('Finish the session before recording it.');
    if (session.scored) return progress;
    const byId = new Map(bank.questions.map(q => [q.id, q]));
    for (const entry of session.entries) {
      if (!entry.submitted) continue;
      const old = progress.attempts[entry.id] || { attempts: 0, correct: 0 };
      const passed = entry.selected === byId.get(entry.id).correct;
      progress.attempts[entry.id] = { attempts: old.attempts + 1,
        correct: old.correct + Number(passed), lastCorrect: passed };
    }
    progress.history.unshift({ id: session.id, track: session.track, mode: session.mode,
      finishedAt: new Date().toISOString(), ...summary(bank, session) });
    progress.history.splice(20);
    session.scored = true;
    return progress;
  }
  function canReveal(session, entry) {
    return session.completed || (session.mode === 'practice' && entry.submitted);
  }
  function restore(bank, raw) {
    const fallback = { progress: emptyProgress(), session: null, recovered: false };
    if (!raw) return fallback;
    try {
      const data = JSON.parse(raw);
      if (data.version !== VERSION || !data.progress || !Array.isArray(data.progress.history)) return { ...fallback, recovered: true };
      if ((data.bankVersion !== undefined && data.bankVersion !== bank.version)
        || (bank.kind === 'private' && data.bankVersion !== bank.version)) return { ...fallback, recovered: true };
      const byId = new Map(bank.questions.map(q => [q.id, q]));
      const progress = emptyProgress();
      for (const [id, item] of Object.entries(data.progress.attempts || {})) {
        if (byId.has(id) && Number.isInteger(item?.attempts) && item.attempts > 0
          && Number.isInteger(item.correct) && item.correct >= 0 && item.correct <= item.attempts
          && typeof item.lastCorrect === 'boolean') progress.attempts[id] = item;
      }
      progress.history = data.progress.history.filter(item => item
        && ['ccsp'].includes(item.track) && ['practice', 'selftest'].includes(item.mode)
        && typeof item.finishedAt === 'string' && Number.isFinite(Date.parse(item.finishedAt))
        && Number.isInteger(item.total) && item.total > 0 && item.total <= bank.questions.length
        && Number.isInteger(item.correct) && item.correct >= 0 && item.correct <= item.total
        && Number.isInteger(item.answered) && item.answered >= item.correct && item.answered <= item.total
        && Number.isInteger(item.percent) && item.percent >= 0 && item.percent <= 100).slice(0, 20);
      let session = data.session;
      const valid = session && session.version === VERSION && session.bankVersion === bank.version
        && typeof session.id === 'string' && ['ccsp'].includes(session.track)
        && ['practice', 'selftest'].includes(session.mode)
        && typeof session.completed === 'boolean' && typeof session.scored === 'boolean'
        && (!session.scored || session.completed)
        && Array.isArray(session.entries) && session.entries.length > 0 && session.entries.length <= bank.questions.length
        && Number.isInteger(session.index) && session.index >= 0 && session.index < session.entries.length
        && new Set(session.entries.map(e => e?.id)).size === session.entries.length
        && session.entries.every(e => e && byId.get(e.id)?.track === session.track
          && Array.isArray(e.order) && e.order.length === 4
          && e.order.every(value => Number.isInteger(value) && value >= 0 && value < 4)
          && new Set(e.order).size === 4
          && (e.selected === null || (Number.isInteger(e.selected) && e.selected >= 0 && e.selected < 4))
          && typeof e.submitted === 'boolean' && (!e.submitted || e.selected !== null));
      if (!valid) session = null;
      return { progress, session, recovered: Boolean(data.session && !valid) };
    } catch { return { ...fallback, recovered: true }; }
  }
  const api = { VERSION, shuffled, emptyProgress, pool, createSession, summary, recordSession, canReveal, restore };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.StudyCore = api;
})(typeof window === 'undefined' ? globalThis : window);
