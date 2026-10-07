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

test('task priority', async (t) => {
  await t.test('defaults to medium when priority is omitted', async () => {
    const res = await fetch(`${baseUrl}/api/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Medium task' }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.priority, 'medium');
  });

  await t.test('accepts an explicit lowercase priority', async () => {
    const res = await fetch(`${baseUrl}/api/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'High task', priority: 'high' }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.priority, 'high');
  });

  await t.test('accepts a capitalized priority case-insensitively', async () => {
    const res = await fetch(`${baseUrl}/api/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Low task', priority: 'Low' }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.priority, 'low');
  });

  await t.test('rejects an unknown priority on create', async () => {
    const res = await fetch(`${baseUrl}/api/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Bad priority task', priority: 'urgent' }),
    });
    assert.equal(res.status, 400);
  });

  await t.test('rejects a non-string priority on create', async () => {
    const res = await fetch(`${baseUrl}/api/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Numeric priority task', priority: 5 }),
    });
    assert.equal(res.status, 400);
  });

  await t.test('GET / shows each todo label and data-priority attribute', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Medium task/);
    assert.match(html, /Low task/);
    assert.match(html, /High task/);
    assert.match(html, /data-priority="medium"/);
    assert.match(html, /data-priority="low"/);
    assert.match(html, /data-priority="high"/);
  });

  await t.test('GET /?priority=high returns only high-priority todos', async () => {
    const res = await fetch(`${baseUrl}/?priority=high`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /High task/);
    assert.doesNotMatch(html, /Low task/);
    assert.doesNotMatch(html, /Medium task/);
  });

  await t.test('GET /?priority=urgent rejects an unknown filter value', async () => {
    const res = await fetch(`${baseUrl}/?priority=urgent`);
    assert.equal(res.status, 400);
  });

  let lowTaskId;

  await t.test('PATCH updates the priority of an existing todo', async () => {
    const created = await fetch(`${baseUrl}/api/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Needs repriority', priority: 'low' }),
    });
    const { id } = await created.json();
    lowTaskId = id;

    const res = await fetch(`${baseUrl}/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority: 'high' }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.priority, 'high');

    const follow = await fetch(`${baseUrl}/?priority=high`);
    const html = await follow.text();
    assert.match(html, /Needs repriority/);
  });

  await t.test('PATCH rejects an unknown priority and leaves the stored value unchanged', async () => {
    const res = await fetch(`${baseUrl}/api/todos/${lowTaskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority: 'nope' }),
    });
    assert.equal(res.status, 400);

    const follow = await fetch(`${baseUrl}/?priority=high`);
    const html = await follow.text();
    assert.match(html, /Needs repriority/);
  });

  await t.test('PATCH rejects a missing priority field', async () => {
    const res = await fetch(`${baseUrl}/api/todos/${lowTaskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(res.status, 400);
  });

  await t.test('PATCH returns 404 for an unknown todo id', async () => {
    const res = await fetch(`${baseUrl}/api/todos/00000000-0000-0000-0000-000000000000`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority: 'high' }),
    });
    assert.equal(res.status, 404);
  });

  await t.test('GET / shows the create-form priority select and default filter nav', async () => {
    const res = await fetch(`${baseUrl}/`);
    const html = await res.text();
    assert.match(html, /id="new-priority"/);
    assert.match(html, /<option value="medium" selected>Medium<\/option>/);
    assert.match(html, /<a href="\/" aria-current="page">All<\/a>/);
  });
});
