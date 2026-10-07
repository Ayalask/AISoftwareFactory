const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp, MAX_TODOS, MAX_TITLE_LENGTH } = require('../server');

function startServer() {
  const server = createApp().listen(0);
  const { port } = server.address();
  return { server, baseUrl: `http://127.0.0.1:${port}` };
}

async function stopServer(server) {
  await new Promise((resolve) => server.close(resolve));
}

test('POST /api/todos creates a todo', async () => {
  const { server, baseUrl } = startServer();
  try {
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
  } finally {
    await stopServer(server);
  }
});

test('POST /api/todos rejects an empty title', async () => {
  const { server, baseUrl } = startServer();
  try {
    const res = await fetch(`${baseUrl}/api/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '' }),
    });
    assert.equal(res.status, 400);
  } finally {
    await stopServer(server);
  }
});

test('POST /api/todos rejects a title at or over the length limit', async () => {
  const { server, baseUrl } = startServer();
  try {
    const res = await fetch(`${baseUrl}/api/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'a'.repeat(MAX_TITLE_LENGTH) }),
    });
    assert.equal(res.status, 400);
  } finally {
    await stopServer(server);
  }
});

test('POST /api/todos rejects the 101st todo', async () => {
  const { server, baseUrl } = startServer();
  try {
    for (let i = 0; i < MAX_TODOS; i++) {
      const res = await fetch(`${baseUrl}/api/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `todo ${i}` }),
      });
      assert.equal(res.status, 201);
    }
    const overflow = await fetch(`${baseUrl}/api/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'one too many' }),
    });
    assert.equal(overflow.status, 400);
  } finally {
    await stopServer(server);
  }
});

test('created todos are retrievable for the UI to display', async () => {
  const { server, baseUrl } = startServer();
  try {
    await fetch(`${baseUrl}/api/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Walk the dog' }),
    });
    const res = await fetch(`${baseUrl}/api/todos`);
    const todos = await res.json();
    assert.equal(todos.length, 1);
    assert.equal(todos[0].title, 'Walk the dog');
  } finally {
    await stopServer(server);
  }
});

test('GET / serves the todo form page', async () => {
  const { server, baseUrl } = startServer();
  try {
    const res = await fetch(`${baseUrl}/`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /<form/);
    assert.match(html, /Add Todo/);
  } finally {
    await stopServer(server);
  }
});

test('GET /health responds with ok status', async () => {
  const { server, baseUrl } = startServer();
  try {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { status: 'ok' });
  } finally {
    await stopServer(server);
  }
});

test('GET /build-id responds with an id', async () => {
  const { server, baseUrl } = startServer();
  try {
    const res = await fetch(`${baseUrl}/build-id`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(typeof body.id, 'string');
    assert.ok(body.id.length > 0);
  } finally {
    await stopServer(server);
  }
});
