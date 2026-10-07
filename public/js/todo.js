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
