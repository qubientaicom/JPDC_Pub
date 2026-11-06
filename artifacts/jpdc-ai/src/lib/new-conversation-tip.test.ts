import assert from 'node:assert/strict';
import test from 'node:test';
import {
  shouldShowNewConversationTip,
  startFreshHomeConversation,
} from './new-conversation-tip.ts';

const tipState = (userTurnCount: number, draft = '', attachmentCount = 0) =>
  shouldShowNewConversationTip({ userTurnCount, draft, attachmentCount });

test('the tip stays hidden until the fourth question is being entered', () => {
  assert.equal(tipState(0, 'first question'), false);
  assert.equal(tipState(1, 'second question'), false);
  assert.equal(tipState(2, 'third question'), false);
  assert.equal(tipState(3), false);
  assert.equal(tipState(3, '   '), false);
  assert.equal(tipState(3, 'fourth question'), true);
});

test('the tip remains visible after the fourth question is submitted', () => {
  assert.equal(tipState(4), true);
  assert.equal(tipState(7), true);
});

test('an attachment also reveals the tip while entering the fourth question', () => {
  assert.equal(tipState(3, '', 1), true);
});

test('starting a fresh conversation navigates to the home view', () => {
  let destination: string | undefined;
  startFreshHomeConversation(view => {
    destination = view;
  });
  assert.equal(destination, 'home');
});
