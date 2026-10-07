const express = require('express');
const { randomUUID } = require('crypto');
const { execFileSync } = require('child_process');

const PORT = process.env.PORT || 8000;
const MAX_TITLE_LENGTH = 200;
const MAX_TODOS = 100;
const PRIORITIES = ['low', 'medium', 'high'];
const DEFAULT_PRIORITY = 'medium';

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

function normalizePriority(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  return PRIORITIES.includes(normalized) ? normalized : null;
}

function priorityLabel(priority) {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function renderPage(filter) {
  const visible = filter ? todos.filter((todo) => todo.priority === filter) : todos;
  const items = visible
    .map((todo) => `    <li data-id="${todo.id}" data-priority="${todo.priority}">
      <span class="title">${escapeHtml(todo.title)}</span>
      <span class="priority priority-${todo.priority}">${priorityLabel(todo.priority)}</span>
      <select class="priority-select">
${PRIORITIES.map((p) => `        <option value="${p}"${p === todo.priority ? ' selected' : ''}>${priorityLabel(p)}</option>`).join('\n')}
      </select>
    </li>`)
    .join('\n');
  const newPriorityOptions = PRIORITIES
    .map((p) => `      <option value="${p}"${p === DEFAULT_PRIORITY ? ' selected' : ''}>${priorityLabel(p)}</option>`)
    .join('\n');
  const filterLinks = [
    `    <a href="/"${!filter ? ' aria-current="page"' : ''}>All</a>`,
    ...PRIORITIES.map((p) => `    <a href="/?priority=${p}"${filter === p ? ' aria-current="page"' : ''}>${priorityLabel(p)}</a>`),
  ].join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Todo List</title>
  <style>
    .priority { font-weight: bold; }
    .priority-low { color: #2a7a2a; }
    .priority-medium { color: #b8860b; }
    .priority-high { color: #c0392b; }
  </style>
</head>
<body>
  <h1>Todo List</h1>
  <form id="todo-form">
    <input type="text" id="title" name="title" placeholder="What needs doing?" required>
    <select id="new-priority" name="priority">
${newPriorityOptions}
    </select>
    <button type="submit">Add Todo</button>
  </form>
  <nav id="priority-filter">
${filterLinks}
  </nav>
  <ul id="todo-list">
${items}
  </ul>
  <script>
    document.getElementById('todo-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const input = document.getElementById('title');
      const priority = document.getElementById('new-priority');
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: input.value, priority: priority.value }),
      });
      if (response.ok) {
        window.location.reload();
      }
    });

    document.getElementById('todo-list').addEventListener('change', async (event) => {
      if (!event.target.classList.contains('priority-select')) {
        return;
      }
      const id = event.target.closest('li').dataset.id;
      const response = await fetch('/api/todos/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: event.target.value }),
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
  const requested = req.query.priority;
  const filter = requested === undefined ? null : normalizePriority(requested);
  if (filter === null && requested !== undefined) {
    return res.status(400).type('html').send(
      `<!DOCTYPE html>\n<html lang="en"><body><h1>Invalid priority</h1>` +
      `<p>priority must be one of ${PRIORITIES.join(', ')}</p></body></html>\n`);
  }
  res.type('html').send(renderPage(filter));
});

app.post('/api/todos', (req, res) => {
  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';

  if (!title) {
    return res.status(400).json({ error: 'title must not be empty' });
  }
  if (title.length >= MAX_TITLE_LENGTH) {
    return res.status(400).json({ error: `title must be shorter than ${MAX_TITLE_LENGTH} characters` });
  }

  const requestedPriority = req.body?.priority;
  const priority = requestedPriority === undefined ? DEFAULT_PRIORITY : normalizePriority(requestedPriority);
  if (priority === null) {
    return res.status(400).json({ error: `priority must be one of ${PRIORITIES.join(', ')}` });
  }

  if (todos.length >= MAX_TODOS) {
    return res.status(400).json({ error: `cannot store more than ${MAX_TODOS} todos` });
  }

  const todo = { id: randomUUID(), title, priority, created: new Date().toISOString() };
  todos.push(todo);
  res.status(201).json(todo);
});

app.patch('/api/todos/:id', (req, res) => {
  const todo = todos.find((item) => item.id === req.params.id);
  if (!todo) {
    return res.status(404).json({ error: 'todo not found' });
  }
  const priority = normalizePriority(req.body?.priority);
  if (priority === null) {
    return res.status(400).json({ error: `priority must be one of ${PRIORITIES.join(', ')}` });
  }
  todo.priority = priority;
  res.json(todo);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}

module.exports = app;
