const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');

const { createServer } = require('../server');

test('GET /api/content/das-sind-wir-1 returns page content', async () => {
  const server = createServer(0);
  await once(server, 'listening');

  const address = server.address();
  const port = address.port;

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/content/das-sind-wir-1`);

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.success, true);
    assert.equal(body.content.slug, 'das-sind-wir-1');
    assert.equal(body.content.title, 'Das sind wir');
    assert.ok(Array.isArray(body.content.paragraphs));
    assert.ok(body.content.paragraphs.length > 0);
  } finally {
    server.close();
    await once(server, 'close').catch(() => {});
  }
});

test('GET /api/content/unknown returns 404', async () => {
  const server = createServer(0);
  await once(server, 'listening');

  const address = server.address();
  const port = address.port;

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/content/unbekannt`);

    assert.equal(response.status, 404);
    const body = await response.json();
    assert.equal(body.success, false);
  } finally {
    server.close();
    await once(server, 'close').catch(() => {});
  }
});
