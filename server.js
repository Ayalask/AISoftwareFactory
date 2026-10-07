const express = require('express');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const PORT = process.env.PORT || 8000;
const MAX_TODOS = 100;
const MAX_TITLE_LENGTH = 200;

function resolveBuildId() {
  if (process.env.FACTORY_RUNTIME_CANDIDATE) {
    return process.env.FACTORY_RUNTIME_CANDIDATE;
  }
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: __dirname })
      .toString()
      .trim();
  } catch {
    return 'unknown';
  }
}

const BUILD_ID = resolveBuildId();

function createApp() {
  const todos = [];
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));

  app.post('/api/todos', (req, res) => {
    const title = req.body && req.body.title;
    if (typeof title !== 'string' || title.length === 0 || title.length >= MAX_TITLE_LENGTH) {
      return res.status(400).json({ error: 'title must be a non-empty string under 200 characters' });
    }
    if (todos.length >= MAX_TODOS) {
      return res.status(400).json({ error: 'maximum of 100 todos reached' });
    }
    const todo = {
      id: crypto.randomUUID(),
      title,
      created: new Date().toISOString(),
    };
    todos.push(todo);
    res.status(201).json(todo);
  });

  app.get('/api/todos', (_req, res) => {
    res.json(todos);
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/build-id', (_req, res) => {
    res.json({ id: BUILD_ID });
  });

  return app;
}

if (require.main === module) {
  createApp().listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
  });
}

module.exports = { createApp, MAX_TODOS, MAX_TITLE_LENGTH };
