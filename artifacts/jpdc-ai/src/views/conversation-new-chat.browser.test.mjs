import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import test from 'node:test';
import { createServer } from 'vite';

const appRoot = fileURLToPath(new URL('../..', import.meta.url));
const conversationTurns = ['E2E 첫 질문', 'E2E 두 번째 질문', 'E2E 세 번째 질문'];

async function getFreePort() {
  const net = await import('node:net');
  const server = net.createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  return port;
}

function waitForDevTools(chrome, timeoutMs = 15_000) {
  return new Promise((resolve, reject) => {
    let output = '';
    const timer = setTimeout(() => reject(new Error(`Chromium DevTools did not start. Output: ${output}`)), timeoutMs);
    const onData = chunk => {
      output += chunk.toString();
      const match = output.match(/DevTools listening on (ws:\/\/\S+)/);
      if (match) {
        clearTimeout(timer);
        resolve(match[1]);
      }
    };
    chrome.stdout.on('data', onData);
    chrome.stderr.on('data', onData);
    chrome.once('error', error => {
      clearTimeout(timer);
      reject(error);
    });
    chrome.once('exit', (code, signal) => {
      clearTimeout(timer);
      reject(new Error(`Chromium exited before DevTools started (${code ?? signal}). Output: ${output}`));
    });
  });
}

async function createCdpClient(url) {
  const socket = new WebSocket(url);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });

  let nextId = 0;
  const pending = new Map();
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (!message.id) return;
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    clearTimeout(request.timer);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message);
  });

  return {
    socket,
    send(method, params = {}, sessionId) {
      const id = ++nextId;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(id);
          reject(new Error(`Timed out waiting for Chromium command: ${method}`));
        }, 10_000);
        pending.set(id, { resolve, reject, timer });
        socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
      });
    },
    async evaluate(sessionId, expression) {
      const reply = await this.send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true,
      }, sessionId);
      if (reply.result.exceptionDetails) {
        throw new Error(reply.result.exceptionDetails.text ?? 'Browser evaluation failed');
      }
      return reply.result.result?.value;
    },
  };
}

async function waitUntil(description, predicate, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  let lastValue;
  while (Date.now() < deadline) {
    lastValue = await predicate();
    if (lastValue) return lastValue;
    await delay(100);
  }
  assert.fail(`Timed out waiting for ${description}. Last result: ${JSON.stringify(lastValue)}`);
}

test('the visible new-chat tip button returns a three-turn draft to a fresh home chat', {
  timeout: 90_000,
}, async () => {
  const chromiumPath = process.env.CHROMIUM_PATH
    ?? spawnSync('which', ['chromium'], { encoding: 'utf8' }).stdout.trim();
  assert.ok(chromiumPath, 'Chromium is required; set CHROMIUM_PATH if it is not on PATH');

  const originalPort = process.env.PORT;
  const originalBasePath = process.env.BASE_PATH;
  const port = await getFreePort();
  process.env.PORT = String(port);
  process.env.BASE_PATH = '/';

  let viteServer;
  let chrome;
  let cdp;
  let userDataDir;
  try {
    viteServer = await createServer({
      configFile: path.join(appRoot, 'vite.config.ts'),
      logLevel: 'error',
      server: { host: '127.0.0.1', port, strictPort: true },
    });
    await viteServer.listen();
    const address = viteServer.httpServer.address();
    const appUrl = `http://127.0.0.1:${address.port}/`;

    userDataDir = await mkdtemp(path.join(tmpdir(), 'jpdc-ai-browser-test-'));
    chrome = spawn(chromiumPath, [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--remote-debugging-port=0',
      '--remote-allow-origins=*',
      `--user-data-dir=${userDataDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      'about:blank',
    ], { stdio: ['ignore', 'pipe', 'pipe'] });

    const browserUrl = await waitForDevTools(chrome);
    cdp = await createCdpClient(browserUrl);
    const { result: { targetId } } = await cdp.send('Target.createTarget', { url: 'about:blank' });
    const { result: { sessionId } } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
    await cdp.send('Page.enable', {}, sessionId);
    await cdp.send('Runtime.enable', {}, sessionId);
    await cdp.send('Page.navigate', { url: appUrl }, sessionId);

    await waitUntil('the initial notice', () =>
      cdp.evaluate(sessionId, "Boolean(document.querySelector('[data-testid=\"button-poc-start\"]'))"));
    await cdp.evaluate(sessionId, "document.querySelector('[data-testid=\"button-poc-start\"]').click()");
    await waitUntil('the home composer', () =>
      cdp.evaluate(sessionId, "Boolean(document.querySelector('textarea[aria-label=\"메시지 입력\"]'))"));

    const submitQuestion = async (text, home = false) => {
      const result = await cdp.evaluate(sessionId, `(() => {
        const textarea = ${home
          ? "document.querySelector('textarea[aria-label=\"메시지 입력\"]')"
          : "[...document.querySelectorAll('textarea')].find(el => el.placeholder.includes('추가 질문'))"};
        if (!textarea) return 'composer missing';
        const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
        setter.call(textarea, ${JSON.stringify(text)});
        textarea.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: ${JSON.stringify(text)} }));
        textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true, cancelable: true }));
        return 'submitted';
      })()`);
      assert.equal(result, 'submitted', `Could not submit ${text}`);
      await waitUntil(`the submitted turn "${text}"`, () =>
        cdp.evaluate(sessionId, `document.body.innerText.includes(${JSON.stringify(text)})`));
      await waitUntil(`the response stop button for "${text}"`, () =>
        cdp.evaluate(sessionId, "Boolean(document.querySelector('button[aria-label=\"답변중지\"]'))"));
      await cdp.evaluate(sessionId, "document.querySelector('button[aria-label=\"답변중지\"]').click()");
      await waitUntil('the response to stop', () =>
        cdp.evaluate(sessionId, "Boolean([...document.querySelectorAll('textarea')].find(el => el.placeholder.includes('추가 질문')))"));
    };

    await submitQuestion(conversationTurns[0], true);
    await submitQuestion(conversationTurns[1]);
    await submitQuestion(conversationTurns[2]);

    const allTurnsVisible = await cdp.evaluate(sessionId, `(() => {
      const text = document.body.innerText;
      return ${JSON.stringify(conversationTurns)}.every(turn => text.includes(turn));
    })()`);
    assert.equal(allTurnsVisible, true, 'The conversation should contain all three submitted turns');

    const draftResult = await cdp.evaluate(sessionId, `(() => {
      const textarea = [...document.querySelectorAll('textarea')].find(el => el.placeholder.includes('추가 질문'));
      if (!textarea) return 'composer missing';
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
      setter.call(textarea, 'E2E 네 번째 질문 초안');
      textarea.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: 'E2E 네 번째 질문 초안' }));
      return textarea.value;
    })()`);
    assert.equal(draftResult, 'E2E 네 번째 질문 초안');

    await waitUntil('the new-conversation tip and button', () =>
      cdp.evaluate(sessionId, `(() => {
        const note = [...document.querySelectorAll('[role="note"]')].find(el => el.innerText.includes('보다 나은 성능을 위해 새 대화에서 시작하세요'));
        const button = [...(note?.querySelectorAll('button') ?? [])].find(el => el.innerText.includes('새 대화 시작'));
        return Boolean(note && button);
      })()`));

    await cdp.evaluate(sessionId, `(() => {
      const note = [...document.querySelectorAll('[role="note"]')].find(el => el.innerText.includes('보다 나은 성능을 위해 새 대화에서 시작하세요'));
      [...note.querySelectorAll('button')].find(el => el.innerText.includes('새 대화 시작')).click();
    })()`);

    const freshHome = await waitUntil('the fresh home chat', () =>
      cdp.evaluate(sessionId, `(() => {
        const composer = document.querySelector('textarea[aria-label="메시지 입력"]');
        const text = document.body.innerText;
        return composer
          && composer.value === ''
          && !text.includes('E2E 첫 질문')
          && !text.includes('E2E 두 번째 질문')
          && !text.includes('E2E 세 번째 질문')
          && !text.includes('E2E 네 번째 질문 초안')
          && !text.includes('보다 나은 성능을 위해 새 대화에서 시작하세요');
      })()`));
    assert.ok(freshHome, 'The app should return to an empty home chat without the old conversation or tip');
  } finally {
    cdp?.socket.close();
    if (chrome && chrome.exitCode === null) {
      chrome.kill('SIGTERM');
      await Promise.race([once(chrome, 'exit'), delay(3_000)]);
      if (chrome.exitCode === null) chrome.kill('SIGKILL');
    }
    await viteServer?.close();
    if (userDataDir) await rm(userDataDir, { recursive: true, force: true });
    if (originalPort === undefined) delete process.env.PORT;
    else process.env.PORT = originalPort;
    if (originalBasePath === undefined) delete process.env.BASE_PATH;
    else process.env.BASE_PATH = originalBasePath;
  }
});
