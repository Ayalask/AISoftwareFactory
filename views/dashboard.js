const { escapeHtml, priorityLabel } = require('./html');
const { renderLayout } = require('./layout');

function renderDashboard({ todos, filter, priorities, defaultPriority }) {
  const visible = filter ? todos.filter((todo) => todo.priority === filter) : todos;
  const items = visible
    .map((todo) => `    <li data-id="${todo.id}" data-priority="${todo.priority}">
      <span class="title">${escapeHtml(todo.title)}</span>
      <span class="priority priority-${todo.priority}">${priorityLabel(todo.priority)}</span>
      <select class="priority-select">
${priorities.map((p) => `        <option value="${p}"${p === todo.priority ? ' selected' : ''}>${priorityLabel(p)}</option>`).join('\n')}
      </select>
    </li>`)
    .join('\n');
  const newPriorityOptions = priorities
    .map((p) => `      <option value="${p}"${p === defaultPriority ? ' selected' : ''}>${priorityLabel(p)}</option>`)
    .join('\n');
  const filterLinks = [
    `    <a href="/dashboard"${!filter ? ' aria-current="page"' : ''}>All</a>`,
    ...priorities.map((p) => `    <a href="/dashboard?priority=${p}"${filter === p ? ' aria-current="page"' : ''}>${priorityLabel(p)}</a>`),
  ].join('\n');

  const main = `  <section id="dashboard" class="container">
    <div class="dashboard-intro">
      <h1>Your Todos</h1>
      <p>Create tasks, set a priority, and filter the list below.</p>
    </div>
    <div class="todo-card">
      <form id="todo-form">
        <input type="text" id="title" name="title" placeholder="What needs doing?" required>
        <select id="new-priority" name="priority">
${newPriorityOptions}
        </select>
        <button type="submit" class="btn btn-primary">Add Todo</button>
      </form>
      <nav id="priority-filter">
${filterLinks}
      </nav>
      <ul id="todo-list">
${items}
      </ul>
    </div>
  </section>`;

  return renderLayout({
    title: 'Dashboard - TodoApp',
    description: 'Manage your todos by priority.',
    activeHref: '/dashboard',
    main,
    scripts: ['/js/todo.js'],
  });
}

module.exports = { renderDashboard };
