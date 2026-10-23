import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FileText } from 'lucide-react';
import { assistantId, loadMyAssistants, markAssistantDeleted, saveMyAssistants, type MyAssistant } from './my-assistants';

const source: MyAssistant = {
  id: 'original', name: '테스트 비서', desc: '보존할 설명', author: '나', icon: FileText,
  scope: '전사', statusBadge: '공식', createdAt: '2026-10-23', updatedAt: '2026-10-23',
  stats: { dialogueCount: 4, messageCount: 8, comments: [] },
};

test('soft deletion preserves the original assistant and its statistics', () => {
  const other = { ...source, id: 'other' };
  const list = markAssistantDeleted([source, other], 'original', '2026-10-24');
  assert.equal(list.length, 2);
  assert.equal(list[0].isDeleted, true);
  assert.equal(list[0].name, source.name);
  assert.deepEqual(list[0].stats, source.stats);
  assert.equal(list[0].updatedAt, '2026-10-24');
  assert.equal(list[1], other);
  assert.equal(source.isDeleted, undefined);
});

test('an unknown ID does not delete a different assistant', () => {
  assert.deepEqual(markAssistantDeleted([source], 'missing', '2026-10-24'), [source]);
  assert.equal(assistantId({ ...source, id: undefined }), 'seed:테스트 비서');
});

test('deleted state survives storage round trip with its icon restored', () => {
  let stored: string | null = null;
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: () => stored,
    setItem: (_key: string, value: string) => { stored = value; },
  } });
  const deleted = markAssistantDeleted([source], 'original', '2026-10-24');
  saveMyAssistants(deleted);
  const restored = loadMyAssistants([]);
  assert.equal(restored[0].isDeleted, true);
  assert.equal(restored[0].icon, FileText);
  assert.equal(restored[0].id, 'original');
});

test('storage failure is propagated so the UI can keep the original state', () => {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    setItem: () => { throw new Error('quota'); },
  } });
  assert.throws(() => saveMyAssistants([source]), /quota/);
});
