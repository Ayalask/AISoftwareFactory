const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server.js');

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  const { port } = server.address();
  baseUrl = `http://localhost:${port}`;
});

after(() => {
  server.close();
});

test('GET /health returns ok status', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: 'ok' });
});

test('GET /build-id returns a commit id', async () => {
  const res = await fetch(`${baseUrl}/build-id`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(typeof body.id, 'string');
  assert.ok(body.id.length > 0);
});

test('todo API', async (t) => {
  await t.test('creates a todo via POST /api/todos', async () => {
    const res = await fetch(`${baseUrl}/api/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Buy milk' }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.title, 'Buy milk');
    assert.equal(typeof body.id, 'string');
    assert.equal(typeof body.created, 'string');
  });

  await t.test('rejects an empty title', async () => {
    const res = await fetch(`${baseUrl}/api/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '   ' }),
    });
    assert.equal(res.status, 400);
  });

  await t.test('rejects a title of 200 characters or more', async () => {
    const res = await fetch(`${baseUrl}/api/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'x'.repeat(200) }),
    });
    assert.equal(res.status, 400);
  });

  await t.test('displays created todos on GET /dashboard', async () => {
    const res = await fetch(`${baseUrl}/dashboard`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Buy milk/);
  });

  await t.test('rejects inserts past 100 stored todos', async () => {
    // One todo ("Buy milk") already exists from the earlier subtest; add 99
    // more to reach the 100-todo cap before asserting the 101st is rejected.
    for (let i = 0; i < 99; i += 1) {
      const res = await fetch(`${baseUrl}/api/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Task ${i}` }),
      });
      assert.equal(res.status, 201);
    }

    const overflow = await fetch(`${baseUrl}/api/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'One too many' }),
    });
    assert.equal(overflow.status, 400);
  });
});
