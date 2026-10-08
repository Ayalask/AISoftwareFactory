const PRIORITIES = ['low', 'medium', 'high'];
const DEFAULT_PRIORITY = 'medium';

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

module.exports = { PRIORITIES, DEFAULT_PRIORITY, normalizePriority, priorityLabel };
