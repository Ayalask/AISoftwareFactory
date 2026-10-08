# AI Software Factory - Todo App

This is an example AI Software Factory application. The factory will build features from PRDs.

## Getting Started

Run: `npm start` or `node server.js`

Health check: GET /health
Build ID: GET /build-id
Create a todo: POST /api/todos (accepts an optional `priority` of `low|medium|high`, default `medium`)
Update a todo's priority: PATCH /api/todos/:id
Filter todos by priority: GET /?priority=<level>
Submit the contact form: POST /api/contact (requires `name`, `email`, `subject`, `message`; logs the submission to the server console, does not send email)

## Pages

- `/` — home page: hero carousel, feature carousel, and the todo list
- `/dashboard` — todo counts by priority, plus the todo list (also supports `?priority=<level>`)
- `/about` — what this app is and its build history
- `/faq` — frequently asked questions
- `/features` — a detailed look at each feature
- `/contact` — the contact form
- `/legal` — privacy policy, terms of service, cookie policy, and disclaimer

