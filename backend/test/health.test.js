import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import app from '../src/app.js';

async function withServer(run) {
  const server = createServer(app);
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    await run(baseUrl);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

test('GET /api/health returns a successful health response', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, 'ok');
    assert.equal(body.service, 'florup-api');
    assert.equal(typeof body.timestamp, 'string');
    assert.ok(Number.isFinite(Date.parse(body.timestamp)));
  });
});

test('unknown routes return a JSON 404 response', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/this-route-does-not-exist`);
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.deepEqual(body, { error: 'Маршрут не найден' });
  });
});
