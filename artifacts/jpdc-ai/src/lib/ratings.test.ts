import assert from 'node:assert/strict';
import { test } from 'node:test';
import { summarizeRatings } from './ratings';

test('positive 4 and negative 10 produce a total of negative 6', () => {
  assert.deepEqual(summarizeRatings({ 4: 1, [-5]: 2 }), {
    positiveScore: 4, negativeScore: -10, total: -6, count: 3,
  });
});

test('cancelled-out scores remain evaluated rather than empty', () => {
  const summary = summarizeRatings({ 3: 2, [-2]: 3 });
  assert.equal(summary.total, 0);
  assert.equal(summary.count, 5);
});

test('negative-only evaluations are counted and remain negative', () => {
  assert.equal(summarizeRatings({ [-1]: 2, [-4]: 1 }).total, -6);
});

test('legacy positive distributions are still supported', () => {
  assert.equal(summarizeRatings({ 5: 2, 4: 1, 3: 0, 2: 0, 1: 1 }).total, 15);
});

test('missing and empty distributions have no evaluations', () => {
  assert.deepEqual(summarizeRatings(), { positiveScore: 0, negativeScore: 0, total: 0, count: 0 });
  assert.equal(summarizeRatings({}).count, 0);
});
