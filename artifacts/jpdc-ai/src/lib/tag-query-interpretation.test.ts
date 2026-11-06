import assert from 'node:assert/strict';
import test from 'node:test';
import { interpretTagQuery } from './tag-query-interpretation.ts';

test('extracts period, Samdasoo volume, pallet grouping, and top-N ranking', () => {
  const result = interpretTagQuery('2025년 3월 제주삼다수 2L 팔렛트 기준 판매량 상위 5개 알려줘');

  assert.ok(result);
  assert.match(result.summary, /2025년 3월 제주삼다수 2L 판매량/);
  assert.match(result.summary, /팔레트 단위로 집계/);
  assert.match(result.summary, /상위 5개/);
  assert.deepEqual(result.conditions, [
    { label: '조회 기간', value: '2025년 3월' },
    { label: '제품', value: '제주삼다수' },
    { label: '용량', value: '2L' },
    { label: '지표', value: '판매량' },
    { label: '집계 기준', value: '팔레트 단위' },
    { label: '결과 범위', value: '상위 5개' },
    { label: '정렬 기준', value: '판매량 내림차순' },
  ]);
});

test('does not invent a year or result count when they are missing', () => {
  const result = interpretTagQuery('3월 삼다수 500ml 팔레트 기준 상위 몇 개');

  assert.ok(result);
  assert.deepEqual(result.conditions[0], { label: '조회 기간', value: '3월 (연도 미지정)' });
  assert.deepEqual(result.conditions.find(condition => condition.label === '용량'), {
    label: '용량',
    value: '500mL',
  });
  assert.deepEqual(result.conditions.find(condition => condition.label === '결과 범위'), {
    label: '결과 범위',
    value: '상위 개수 미지정',
  });
});

test('returns no interpretation when the query contains no extractable TAG criteria', () => {
  assert.equal(interpretTagQuery('입고 처리가 안 된 작업지시가 있어?'), null);
});
