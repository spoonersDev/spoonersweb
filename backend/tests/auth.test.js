const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');

const { createServer } = require('../server');

test('POST /api/auth/login returns a token for valid credentials', async () => {
  const server = createServer(0);
  await once(server, 'listening');

  const address = server.address();
  const port = address.port;

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.success, true);
    assert.ok(body.token);
  } finally {
    server.close();
    await once(server, 'close').catch(() => {});
  }
});
