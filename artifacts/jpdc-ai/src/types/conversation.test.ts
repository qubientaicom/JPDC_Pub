import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareAttachments, type AttachmentRole } from './conversation';

const file = (name: string) => ({ name, size: 100, type: 'text/plain' }) as File;
const entry = (name: string, role: AttachmentRole) => ({ file: file(name), role });

test('지식 첨부는 최대 10개이며 초과 파일을 서식으로 바꾸지 않는다', () => {
  const result = prepareAttachments([], Array.from({ length: 11 }, (_, i) => file(`${i}.txt`)), 'knowledge');
  assert.equal(result.files.length, 10);
  assert.ok(result.files.every(f => f.role === 'knowledge'));
  assert.match(result.notice, /최대 10개/);
});

test('서식 첨부는 처음부터 서식이며 지식 개수와 무관하게 1개만 허용한다', () => {
  const result = prepareAttachments([], [file('서식.txt'), file('초과.txt')], 'template');
  assert.equal(result.files.length, 1);
  assert.equal(result.files[0].role, 'template');
  assert.match(result.notice, /1개만/);
  assert.equal(prepareAttachments(result.files, [file('다른.txt')], 'template').files.length, 0);
});

test('지식 10개와 서식 1개를 함께 첨부하고 삭제 후 같은 유형으로 다시 첨부한다', () => {
  const knowledge = Array.from({ length: 10 }, (_, i) => entry(`${i}.txt`, 'knowledge'));
  const template = prepareAttachments(knowledge, [file('서식.txt')], 'template');
  assert.equal([...knowledge, ...template.files].length, 11);
  assert.equal(prepareAttachments([...knowledge, ...template.files], [file('초과.txt')], 'knowledge').files.length, 0);
  assert.equal(prepareAttachments(knowledge, [file('교체.txt')], 'template').files.length, 1);
});

test('동일 파일을 중복 첨부하거나 다른 유형으로 자동 전환하지 않는다', () => {
  assert.equal(prepareAttachments([entry('동일.txt', 'knowledge')], [file('동일.txt')], 'template').files.length, 0);
  assert.equal(prepareAttachments([], [file('동일.txt'), file('동일.txt')], 'knowledge').files.length, 1);
});
