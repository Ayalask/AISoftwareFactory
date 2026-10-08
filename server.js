const express = require('express');
const path = require('path');
const { randomUUID } = require('crypto');
const { execFileSync } = require('child_process');
const { PRIORITIES, DEFAULT_PRIORITY, normalizePriority } = require('./priority');
const { DUE_FILTERS, isValidDueDate, normalizeDueFilter } = require('./dueDate');
const views = require('./views');

const PORT = process.env.PORT || 8000;
const MAX_TITLE_LENGTH = 200;
const MAX_TODOS = 100;
const MAX_CONTACT_FIELD_LENGTH = 200;
const MAX_CONTACT_MESSAGE_LENGTH = 2000;

function getBuildId() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: __dirname }).toString().trim();
  } catch {
    return 'unknown';
  }
}

const BUILD_ID = getBuildId();
const todos = [];

function invalidPriorityPage() {
  return `<!DOCTYPE html>\n<html lang="en"><body><h1>Invalid priority</h1>` +
    `<p>priority must be one of ${PRIORITIES.join(', ')}</p></body></html>\n`;
}

function resolvePriorityFilter(req, res) {
  const requested = req.query.priority;
  if (requested === undefined) {
    return { filter: null, ok: true };
  }
  const filter = normalizePriority(requested);
  if (filter === null) {
    res.status(400).type('html').send(invalidPriorityPage());
    return { filter: null, ok: false };
  }
  return { filter, ok: true };
}

function invalidDueFilterPage() {
  return `<!DOCTYPE html>\n<html lang="en"><body><h1>Invalid due date filter</h1>` +
    `<p>due must be one of ${DUE_FILTERS.join(', ')}</p></body></html>\n`;
}

function invalidSortPage() {
  return `<!DOCTYPE html>\n<html lang="en"><body><h1>Invalid sort</h1>` +
    `<p>sort must be one of dueDate, -dueDate</p></body></html>\n`;
}

function resolveDueFilter(req, res) {
  const requested = req.query.due;
  if (requested === undefined) {
    return { filter: null, ok: true };
  }
  const filter = normalizeDueFilter(requested);
  if (filter === null) {
    res.status(400).type('html').send(invalidDueFilterPage());
    return { filter: null, ok: false };
  }
  return { filter, ok: true };
}

function resolveSort(req, res) {
  const requested = req.query.sort;
  if (requested === undefined) {
    return { sort: null, ok: true };
  }
  if (requested !== 'dueDate' && requested !== '-dueDate') {
    res.status(400).type('html').send(invalidSortPage());
    return { sort: null, ok: false };
  }
  return { sort: requested, ok: true };
}

function isValidContactEmail(email) {
  const at = email.indexOf('@');
  return at > 0 && at < email.length - 1 && email.indexOf('@', at + 1) === -1;
}

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/build-id', (req, res) => {
  res.json({ id: BUILD_ID });
});

app.get('/', (req, res) => {
  const { filter, ok } = resolvePriorityFilter(req, res);
  if (!ok) {
    return;
  }
  const { filter: dueFilter, ok: dueOk } = resolveDueFilter(req, res);
  if (!dueOk) {
    return;
  }
  const { sort, ok: sortOk } = resolveSort(req, res);
  if (!sortOk) {
    return;
  }
  res.type('html').send(views.renderHome({ todos, filter, dueFilter, sort }));
});

app.get('/dashboard', (req, res) => {
  const { filter, ok } = resolvePriorityFilter(req, res);
  if (!ok) {
    return;
  }
  const { filter: dueFilter, ok: dueOk } = resolveDueFilter(req, res);
  if (!dueOk) {
    return;
  }
  const { sort, ok: sortOk } = resolveSort(req, res);
  if (!sortOk) {
    return;
  }
  res.type('html').send(views.renderDashboard({ todos, filter, dueFilter, sort }));
});

app.get('/about', (req, res) => {
  res.type('html').send(views.renderAbout());
});

app.get('/faq', (req, res) => {
  res.type('html').send(views.renderFaq());
});

app.get('/features', (req, res) => {
  res.type('html').send(views.renderFeatures());
});

app.get('/contact', (req, res) => {
  res.type('html').send(views.renderContact());
});

app.get('/legal', (req, res) => {
  res.type('html').send(views.renderLegal());
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

  const requestedDueDate = req.body?.dueDate;
  let dueDate = null;
  if (requestedDueDate !== undefined && requestedDueDate !== null && requestedDueDate !== '') {
    if (!isValidDueDate(requestedDueDate)) {
      return res.status(400).json({ error: 'dueDate must be a valid date in YYYY-MM-DD format' });
    }
    dueDate = requestedDueDate;
  }

  if (todos.length >= MAX_TODOS) {
    return res.status(400).json({ error: `cannot store more than ${MAX_TODOS} todos` });
  }

  const todo = { id: randomUUID(), title, priority, dueDate, created: new Date().toISOString() };
  todos.push(todo);
  res.status(201).json(todo);
});

app.patch('/api/todos/:id', (req, res) => {
  const todo = todos.find((item) => item.id === req.params.id);
  if (!todo) {
    return res.status(404).json({ error: 'todo not found' });
  }

  const body = req.body ?? {};
  const hasPriority = Object.prototype.hasOwnProperty.call(body, 'priority');
  const hasDueDate = Object.prototype.hasOwnProperty.call(body, 'dueDate');
  if (!hasPriority && !hasDueDate) {
    return res.status(400).json({ error: 'priority or dueDate must be provided' });
  }

  let priority = todo.priority;
  if (hasPriority) {
    priority = normalizePriority(body.priority);
    if (priority === null) {
      return res.status(400).json({ error: `priority must be one of ${PRIORITIES.join(', ')}` });
    }
  }

  let dueDate = todo.dueDate;
  if (hasDueDate) {
    if (body.dueDate === null || body.dueDate === '') {
      dueDate = null;
    } else if (isValidDueDate(body.dueDate)) {
      dueDate = body.dueDate;
    } else {
      return res.status(400).json({ error: 'dueDate must be a valid date in YYYY-MM-DD format' });
    }
  }

  todo.priority = priority;
  todo.dueDate = dueDate;
  res.json(todo);
});

app.post('/api/contact', (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  const subject = typeof req.body?.subject === 'string' ? req.body.subject.trim() : '';
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'name, email, subject, and message are all required' });
  }
  if (name.length > MAX_CONTACT_FIELD_LENGTH || subject.length > MAX_CONTACT_FIELD_LENGTH) {
    return res.status(400).json({ error: `name and subject must be ${MAX_CONTACT_FIELD_LENGTH} characters or fewer` });
  }
  if (message.length > MAX_CONTACT_MESSAGE_LENGTH) {
    return res.status(400).json({ error: `message must be ${MAX_CONTACT_MESSAGE_LENGTH} characters or fewer` });
  }
  if (!isValidContactEmail(email)) {
    return res.status(400).json({ error: 'email must be a valid email address' });
  }

  console.log(`Contact form submission from ${name} <${email}>: ${subject}`);
  res.status(201).json({ status: 'received' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}

module.exports = app;
