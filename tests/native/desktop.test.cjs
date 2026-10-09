// Real Tauri/WebKit desktop process; no invoke or command mocks and no test plugin.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const base = 'http://127.0.0.1:4444';
let driver, session;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function request(method, route, body) {
  const response = await fetch(base + route, { method, headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(30000) });
  const data = await response.json();
  if (!response.ok || data.value?.error) throw new Error(JSON.stringify(data));
  return data.value;
}
const command = (method, route, body) => request(method, `/session/${session}${route}`, body);
const script = (code, ...args) => command('POST', '/execute/sync', { script: code, args });
async function element(selector) {
  const value = await command('POST', '/element', { using: 'css selector', value: selector });
  return value['element-6066-11e4-a52e-4f735466cecf'];
}
async function click(selector) { await command('POST', `/element/${await element(selector)}/click`, {}); }
async function text(selector) { return command('GET', `/element/${await element(selector)}/text`); }
async function open() {
  const value = await request('POST', '/session', { capabilities: { alwaysMatch: {
    'tauri:options': { application: path.resolve('src-tauri/target/release/cloudcue') },
  } } });
  session = value.sessionId;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (await script('return Boolean(document.querySelector("#start-study") && window.StudyCore);')) return;
    await delay(100);
  }
  throw new Error('Bundled app did not render');
}
async function close() {
  if (session) { await command('DELETE', ''); session = undefined; }
}
async function answer(correct) {
  const value = await script('const id = document.querySelector("#question-tag").textContent.split(" · ")[0]; return window.STUDY_BANK.questions.find(q => q.id === id).correct;');
  await click(`input[name="study-answer"][value="${correct ? value : (value + 1) % 4}"]`);
  await click('#submit-answer');
}
before(async () => {
  driver = spawn('tauri-driver', ['--native-driver', '/usr/bin/WebKitWebDriver'], { stdio: 'inherit' });
  driver.on('error', error => { console.error(error.message); });
  for (let attempt = 0; attempt < 100; attempt++) {
    try { await request('GET', '/status'); return; } catch { await delay(100); }
  }
  throw new Error('Native WebDriver did not start');
});
after(async () => { try { await close(); } finally { driver?.kill(); } });
test('bundled app locks answers, pauses, closes/reopens, scores once and retries misses', async () => {
  await open();
  assert.equal(await command('GET', '/title'), 'CloudCue · CCSP practice');
  assert.equal(await text('#bank-count'), '60');
  await click('#start-study');
  assert.equal(await script('return document.querySelector("#answer-feedback").hidden'), true);
  await answer(true);
  assert.match(await text('#answer-feedback'), /Correct/);
  assert.equal(await script('return document.querySelectorAll("#question-options input:disabled").length'), 4);
  await click('#next-question');
  await answer(false);
  const prompt = await text('#question-prompt');
  await click('#pause-study');
  await close();
  await open();
  await click('#resume-study');
  assert.equal(await text('#question-prompt'), prompt);
  assert.equal(await script('return document.querySelectorAll("#question-options input:disabled").length'), 4);
  await click('#finish-early');
  await click('#finish-confirm');
  assert.equal(await text('#result-score'), '1 / 10');
  assert.match(await text('#result-detail'), /1 incorrect · 8 unanswered/);
  await click('#back-to-setup');
  assert.equal(await text('#seen-count'), '2');
  await click('#last-result');
  assert.equal(await script('return JSON.parse(localStorage.getItem("cloudcue.ccsp.v1")).progress.history.length'), 1);
  await click('#retry-missed');
  assert.equal(await text('#question-position'), 'Question 1 of 9');
  await close();
});
test('native minimum window renders self-test without early answer disclosure', async () => {
  await open();
  await click('#reset-progress'); await click('#reset-confirm');
  await script('const select = document.querySelector("#study-mode"); select.value = "selftest"; select.dispatchEvent(new Event("change"));');
  await click('#start-study');
  await command('POST', '/window/rect', { width: 360, height: 380 });
  await answer(true);
  assert.equal(await script('return document.querySelector("#answer-feedback").hidden'), true);
  assert.equal(await script('return document.querySelectorAll(".correct-option").length'), 0);
  assert.equal(await script('return document.documentElement.scrollWidth > innerWidth'), false);
  const screenshot = await command('GET', '/screenshot');
  fs.mkdirSync('.local/native-e2e', { recursive: true });
  fs.writeFileSync('.local/native-e2e/minimum-window.png', Buffer.from(screenshot, 'base64'));
  await click('#finish-early'); await click('#finish-confirm');
  assert.match(await text('#review-list'), /Answer:/);
});
