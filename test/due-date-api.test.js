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

function isoDate(offsetDays) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

test('due date API', async (t) => {
  await t.test('POST /api/todos accepts a valid dueDate', async () => {
    const res = await fetch(`${baseUrl}/api/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Ship the release', dueDate: isoDate(0) }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.dueDate, isoDate(0));
  });

  await t.test('POST /api/todos defaults dueDate to null when omitted', async () => {
    const res = await fetch(`${baseUrl}/api/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'No deadline' }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.dueDate, null);
  });

  await t.test('POST /api/todos rejects a malformed dueDate', async () => {
    const res = await fetch(`${baseUrl}/api/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Bad date', dueDate: '13/02/2026' }),
    });
    assert.equal(res.status, 400);
  });

  let todoId;

  await t.test('PATCH /api/todos/:id sets a dueDate without touching priority', async () => {
    const created = await fetch(`${baseUrl}/api/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Needs a deadline', priority: 'high' }),
    });
    const { id } = await created.json();
    todoId = id;

    const res = await fetch(`${baseUrl}/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dueDate: isoDate(1) }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.dueDate, isoDate(1));
    assert.equal(body.priority, 'high');
  });

  await t.test('PATCH /api/todos/:id clears a dueDate with null', async () => {
    const res = await fetch(`${baseUrl}/api/todos/${todoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dueDate: null }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.dueDate, null);
  });

  await t.test('PATCH /api/todos/:id rejects an invalid dueDate', async () => {
    const res = await fetch(`${baseUrl}/api/todos/${todoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dueDate: 'nonsense' }),
    });
    assert.equal(res.status, 400);
  });

  await t.test('PATCH /api/todos/:id still rejects an empty body', async () => {
    const res = await fetch(`${baseUrl}/api/todos/${todoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(res.status, 400);
  });

  await t.test('GET /?due=overdue filters to only overdue todos', async () => {
    await fetch(`${baseUrl}/api/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Overdue task', dueDate: isoDate(-3) }),
    });
    const res = await fetch(`${baseUrl}/?due=overdue`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Overdue task/);
    assert.doesNotMatch(html, /No deadline/);
  });

  await t.test('GET /?due=bogus rejects an unknown due filter', async () => {
    const res = await fetch(`${baseUrl}/?due=bogus`);
    assert.equal(res.status, 400);
  });

  await t.test('GET /?priority=high&due=overdue combines both filters', async () => {
    await fetch(`${baseUrl}/api/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Overdue low task', priority: 'low', dueDate: isoDate(-1) }),
    });
    const res = await fetch(`${baseUrl}/?priority=low&due=overdue`);
    const html = await res.text();
    assert.match(html, /Overdue low task/);
    assert.doesNotMatch(html, /Overdue task/);
  });

  await t.test('GET /?sort=-dueDate rejects combined with an invalid value', async () => {
    const res = await fetch(`${baseUrl}/?sort=bogus`);
    assert.equal(res.status, 400);
  });

  await t.test('GET /?sort=dueDate orders todos by ascending due date with no-date last', async () => {
    const res = await fetch(`${baseUrl}/?sort=dueDate`);
    assert.equal(res.status, 200);
    const html = await res.text();
    const overdueIndex = html.indexOf('Overdue low task');
    const noDeadlineIndex = html.indexOf('No deadline');
    assert.ok(overdueIndex > -1 && noDeadlineIndex > -1);
    assert.ok(overdueIndex < noDeadlineIndex);
  });

  await t.test('dashboard reports due-date stats', async () => {
    const res = await fetch(`${baseUrl}/dashboard`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /data-stat="overdue"/);
    assert.match(html, /data-stat="due-today"/);
    assert.match(html, /data-stat="due-this-week"/);
    assert.match(html, /data-stat="no-due-date"/);
  });
});
