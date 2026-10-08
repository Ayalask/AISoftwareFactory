const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// "This week" is a rolling 7-day window starting today, not the calendar week —
// the issue didn't pin this down, so this is the chosen definition.
const THIS_WEEK_HORIZON_DAYS = 6;

const DUE_FILTERS = ['overdue', 'today', 'this-week', 'no-date'];
const DUE_STATUS_LABELS = {
  overdue: 'Overdue',
  today: 'Today',
  'this-week': 'This Week',
  'no-date': 'No Date',
};

function isValidDueDate(value) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    return false;
  }
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function parseDateUTC(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

function computeDueStatus(dueDate, today = todayDateString()) {
  if (!dueDate) {
    return 'no-date';
  }
  const diffDays = Math.round((parseDateUTC(dueDate) - parseDateUTC(today)) / MS_PER_DAY);
  if (diffDays < 0) {
    return 'overdue';
  }
  if (diffDays === 0) {
    return 'today';
  }
  if (diffDays <= THIS_WEEK_HORIZON_DAYS) {
    return 'this-week';
  }
  return 'future';
}

function normalizeDueFilter(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  return DUE_FILTERS.includes(normalized) ? normalized : null;
}

function dueStatusLabel(status) {
  return DUE_STATUS_LABELS[status];
}

function compareByDueDate(a, b, direction = 'asc') {
  if (a.dueDate === b.dueDate) {
    return 0;
  }
  if (!a.dueDate) {
    return 1;
  }
  if (!b.dueDate) {
    return -1;
  }
  const cmp = a.dueDate < b.dueDate ? -1 : 1;
  return direction === 'desc' ? -cmp : cmp;
}

module.exports = {
  DUE_FILTERS,
  isValidDueDate,
  todayDateString,
  computeDueStatus,
  normalizeDueFilter,
  dueStatusLabel,
  compareByDueDate,
};
