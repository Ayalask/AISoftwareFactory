const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  isValidDueDate,
  computeDueStatus,
  normalizeDueFilter,
  compareByDueDate,
} = require('../dueDate');

test('isValidDueDate', async (t) => {
  await t.test('accepts a well-formed calendar date', () => {
    assert.equal(isValidDueDate('2026-01-05'), true);
  });

  await t.test('rejects malformed strings', () => {
    assert.equal(isValidDueDate('01/05/2026'), false);
    assert.equal(isValidDueDate('2026-1-5'), false);
    assert.equal(isValidDueDate('not-a-date'), false);
  });

  await t.test('rejects a non-string value', () => {
    assert.equal(isValidDueDate(20260105), false);
    assert.equal(isValidDueDate(null), false);
  });

  await t.test('rejects a calendar date that does not exist', () => {
    assert.equal(isValidDueDate('2026-02-30'), false);
  });
});

test('computeDueStatus', async (t) => {
  const today = '2026-06-15';

  await t.test('returns no-date when there is no due date', () => {
    assert.equal(computeDueStatus(null, today), 'no-date');
    assert.equal(computeDueStatus(undefined, today), 'no-date');
  });

  await t.test('returns overdue for a date before today', () => {
    assert.equal(computeDueStatus('2026-06-14', today), 'overdue');
  });

  await t.test('returns today for the current date', () => {
    assert.equal(computeDueStatus('2026-06-15', today), 'today');
  });

  await t.test('returns this-week for the rolling 7-day window after today', () => {
    assert.equal(computeDueStatus('2026-06-16', today), 'this-week');
    assert.equal(computeDueStatus('2026-06-21', today), 'this-week');
  });

  await t.test('returns future beyond the this-week window', () => {
    assert.equal(computeDueStatus('2026-06-22', today), 'future');
  });
});

test('normalizeDueFilter', async (t) => {
  await t.test('accepts known filters case-insensitively', () => {
    assert.equal(normalizeDueFilter('Overdue'), 'overdue');
    assert.equal(normalizeDueFilter('this-week'), 'this-week');
  });

  await t.test('rejects unknown or non-string filters', () => {
    assert.equal(normalizeDueFilter('someday'), null);
    assert.equal(normalizeDueFilter(5), null);
  });
});

test('compareByDueDate', async (t) => {
  await t.test('sorts ascending with no-date todos last', () => {
    const todos = [{ dueDate: '2026-06-20' }, { dueDate: null }, { dueDate: '2026-06-10' }];
    const sorted = [...todos].sort((a, b) => compareByDueDate(a, b, 'asc'));
    assert.deepEqual(sorted.map((t) => t.dueDate), ['2026-06-10', '2026-06-20', null]);
  });

  await t.test('sorts descending with no-date todos still last', () => {
    const todos = [{ dueDate: '2026-06-20' }, { dueDate: null }, { dueDate: '2026-06-10' }];
    const sorted = [...todos].sort((a, b) => compareByDueDate(a, b, 'desc'));
    assert.deepEqual(sorted.map((t) => t.dueDate), ['2026-06-20', '2026-06-10', null]);
  });
});
