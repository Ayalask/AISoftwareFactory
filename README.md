# AI Software Factory - Todo App

This is an example AI Software Factory application. The factory will build features from PRDs.

## Getting Started

Run: `npm start` or `node server.js`

Health check: GET /health
Build ID: GET /build-id
Create a todo: POST /api/todos (accepts an optional `priority` of `low|medium|high`, default `medium`)
Update a todo's priority: PATCH /api/todos/:id
Filter todos by priority: GET /?priority=<level>

