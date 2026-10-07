const express = require('express');
const { randomUUID } = require('crypto');
const { execFileSync } = require('child_process');

const PORT = process.env.PORT || 8000;
const MAX_TITLE_LENGTH = 200;
const MAX_TODOS = 100;

function getBuildId() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: __dirname }).toString().trim();
  } catch {
    return 'unknown';
  }
}

const BUILD_ID = getBuildId();
const todos = [];

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderPage() {
  const items = todos
    .map((todo) => `    <li>${escapeHtml(todo.title)}</li>`)
    .join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Todo List</title>
</head>
<body>
  <h1>Todo List</h1>
  <form id="todo-form">
    <input type="text" id="title" name="title" placeholder="What needs doing?" required>
    <button type="submit">Add Todo</button>
  </form>
  <ul id="todo-list">
${items}
  </ul>
  <script>
    document.getElementById('todo-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const input = document.getElementById('title');
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: input.value }),
      });
      if (response.ok) {
        window.location.reload();
      }
    });
  </script>
</body>
</html>
`;
}

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/build-id', (req, res) => {
  res.json({ id: BUILD_ID });
});

app.get('/', (req, res) => {
  res.type('html').send(renderPage());
});

app.post('/api/todos', (req, res) => {
  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';

  if (!title) {
    return res.status(400).json({ error: 'title must not be empty' });
  }
  if (title.length >= MAX_TITLE_LENGTH) {
    return res.status(400).json({ error: `title must be shorter than ${MAX_TITLE_LENGTH} characters` });
  }
  if (todos.length >= MAX_TODOS) {
    return res.status(400).json({ error: `cannot store more than ${MAX_TODOS} todos` });
  }

  const todo = { id: randomUUID(), title, created: new Date().toISOString() };
  todos.push(todo);
  res.status(201).json(todo);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}

module.exports = app;
