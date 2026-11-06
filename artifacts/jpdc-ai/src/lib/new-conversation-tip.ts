export type ConversationView = 'home' | 'market';
export type NavigateConversationView = (view: ConversationView) => void;

export function shouldShowNewConversationTip({
  userTurnCount,
  draft,
  attachmentCount,
}: {
  userTurnCount: number;
  draft: string;
  attachmentCount: number;
}): boolean {
  return userTurnCount >= 4
    || (userTurnCount >= 3 && (draft.trim().length > 0 || attachmentCount > 0));
}

export function startFreshHomeConversation(onNavigate?: NavigateConversationView): void {
  onNavigate?.('home');
}
