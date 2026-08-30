const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const bcrypt = require('bcryptjs');

const { createServer } = require('../server');
const pool = require('../config/db');

test('POST /api/auth/login returns a token for an active user', async () => {
  const email = `login-test-${Date.now()}@example.com`;
  const password = 'LoginPasswort123!';
  const passwordHash = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO users (first_name, last_name, email, password_hash, status)
     VALUES ($1, $2, $3, $4, 'active')`,
    ['Login', 'Test', email, passwordHash]
  );

  const server = createServer(0);
  await once(server, 'listening');

  const address = server.address();
  const port = address.port;

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.success, true);
    assert.ok(body.token);
  } finally {
    server.close();
    await once(server, 'close').catch(() => {});
    await pool.query('DELETE FROM users WHERE email = $1', [email]);
  }
});
