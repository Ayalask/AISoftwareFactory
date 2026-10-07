const express = require('express');
const path = require('path');
const { randomUUID } = require('crypto');
const { execFileSync } = require('child_process');
const { renderLayout } = require('./views/layout');
const { renderDashboard } = require('./views/dashboard');
const { renderLanding } = require('./views/landing');
const { renderAbout, renderFaq, renderFeatures, renderContact } = require('./views/content');

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

function normalizePriority(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  return PRIORITIES.includes(normalized) ? normalized : null;
}

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/build-id', (req, res) => {
  res.json({ id: BUILD_ID });
});

app.get('/dashboard', (req, res) => {
  const requested = req.query.priority;
  const filter = requested === undefined ? null : normalizePriority(requested);
  if (filter === null && requested !== undefined) {
    return res.status(400).type('html').send(renderLayout({
      title: 'Invalid priority - TodoApp',
      description: 'The requested priority filter is not recognized.',
      activeHref: '/dashboard',
      main: `  <section class="container">
    <h1>Invalid priority</h1>
    <p>priority must be one of ${PRIORITIES.join(', ')}</p>
  </section>`,
    }));
  }
  res.type('html').send(renderDashboard({
    todos,
    filter,
    priorities: PRIORITIES,
    defaultPriority: DEFAULT_PRIORITY,
  }));
});

app.get('/', (req, res) => {
  res.type('html').send(renderLanding());
});

app.get('/about', (req, res) => {
  res.type('html').send(renderAbout());
});

app.get('/faq', (req, res) => {
  res.type('html').send(renderFaq());
});

app.get('/features', (req, res) => {
  res.type('html').send(renderFeatures());
});

app.get('/contact', (req, res) => {
  res.type('html').send(renderContact());
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
