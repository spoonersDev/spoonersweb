const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const jwt = require('jsonwebtoken');

const { createServer } = require('../server');
const pool = require('../config/db');

test('GET /api/menu returns the active menu hierarchy', async () => {
  const server = createServer(0);
  await once(server, 'listening');

  const address = server.address();
  const port = address.port;

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/menu`);

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.items));
  } finally {
    server.close();
    await once(server, 'close').catch(() => {});
  }
});

test('POST /api/menu creates a menu item for admin users', async () => {
  const server = createServer(0);
  await once(server, 'listening');

  const address = server.address();
  const port = address.port;
  const token = jwt.sign({ id: 1, email: 'admin@example.com', role: 'admin' }, process.env.JWT_SECRET || 'dev-secret');

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/menu`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        label: 'Testseite',
        path: '/testseite',
        sortOrder: 1,
        isActive: true
      })
    });

    assert.equal(response.status, 201);
    const body = await response.json();
    assert.equal(body.success, true);
    assert.equal(body.item.label, 'Testseite');
    assert.equal(body.item.path, '/testseite');

    await pool.query('DELETE FROM menu_items WHERE id = $1', [body.item.id]);
  } finally {
    server.close();
    await once(server, 'close').catch(() => {});
  }
});

test('PUT /api/menu/:id updates an existing menu item', async () => {
  const server = createServer(0);
  await once(server, 'listening');

  const address = server.address();
  const port = address.port;
  const token = jwt.sign({ id: 1, email: 'admin@example.com', role: 'admin' }, process.env.JWT_SECRET || 'dev-secret');

  let createdId;

  try {
    const createResponse = await fetch(`http://127.0.0.1:${port}/api/menu`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        label: 'Old Title',
        path: '/old-title',
        sortOrder: 3,
        isActive: true
      })
    });

    assert.equal(createResponse.status, 201);
    const createdBody = await createResponse.json();
    createdId = createdBody.item.id;

    const updateResponse = await fetch(`http://127.0.0.1:${port}/api/menu/${createdId}`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        label: 'New Title',
        path: '/new-title',
        parentId: null,
        sortOrder: 4,
        isActive: true
      })
    });

    assert.equal(updateResponse.status, 200);
    const updatedBody = await updateResponse.json();
    assert.equal(updatedBody.success, true);
    assert.equal(updatedBody.item.label, 'New Title');
    assert.equal(updatedBody.item.path, '/new-title');
  } finally {
    if (createdId) {
      await pool.query('DELETE FROM menu_items WHERE id = $1', [createdId]);
    }
    server.close();
    await once(server, 'close').catch(() => {});
  }
});

test('DELETE /api/menu/:id deletes an existing menu item for admin users', async () => {
  const server = createServer(0);
  await once(server, 'listening');

  const address = server.address();
  const port = address.port;
  const token = jwt.sign({ id: 1, email: 'admin@example.com', role: 'admin' }, process.env.JWT_SECRET || 'dev-secret');

  let createdId;

  try {
    const createResponse = await fetch(`http://127.0.0.1:${port}/api/menu`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        label: 'Delete Test',
        path: '/delete-test',
        sortOrder: 2,
        isActive: true
      })
    });

    assert.equal(createResponse.status, 201);
    const createdBody = await createResponse.json();
    createdId = createdBody.item.id;

    const deleteResponse = await fetch(`http://127.0.0.1:${port}/api/menu/${createdId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    assert.equal(deleteResponse.status, 200);
    const deletedBody = await deleteResponse.json();
    assert.equal(deletedBody.success, true);
    assert.equal(deletedBody.item.id, createdId);
  } finally {
    if (createdId) {
      await pool.query('DELETE FROM menu_items WHERE id = $1', [createdId]);
    }
    server.close();
    await once(server, 'close').catch(() => {});
  }
});
