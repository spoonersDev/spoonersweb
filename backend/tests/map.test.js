const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');

const { createServer } = require('../server');

test('GET /api/member/entdecken/map-init requires auth', async () => {
  const server = createServer(0);
  await once(server, 'listening');

  const address = server.address();
  const port = address.port;

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/member/entdecken/map-init`);

    assert.equal(response.status, 401);
    const body = await response.json();
    assert.equal(body.success, false);
  } finally {
    server.close();
    await once(server, 'close').catch(() => {});
  }
});

test('POST /api/auth/login followed by GET /api/member/entdecken/map-init returns map config', async () => {
  const server = createServer(0);
  await once(server, 'listening');

  const address = server.address();
  const port = address.port;

  try {
    const loginResponse = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });

    assert.equal(loginResponse.status, 200);
    const loginBody = await loginResponse.json();
    assert.ok(loginBody.token);

    const mapResponse = await fetch(`http://127.0.0.1:${port}/api/member/entdecken/map-init`, {
      headers: {
        authorization: `Bearer ${loginBody.token}`
      }
    });

    assert.equal(mapResponse.status, 200);
    const mapBody = await mapResponse.json();
    assert.equal(mapBody.success, true);
    assert.ok(mapBody.map.styleUrl);
    assert.ok(Array.isArray(mapBody.map.center));
  } finally {
    server.close();
    await once(server, 'close').catch(() => {});
  }
});
