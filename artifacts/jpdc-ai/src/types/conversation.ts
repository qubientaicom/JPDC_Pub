export type AttachmentRole = 'knowledge' | 'template';

export interface MessageAttachment {
  name: string;
  size: number;
  type: string;
  role?: AttachmentRole;
}

export const MAX_KNOWLEDGE_ATTACHMENTS = 10;
export const MAX_TEMPLATE_ATTACHMENTS = 1;
export const MAX_ATTACHMENTS = MAX_KNOWLEDGE_ATTACHMENTS + MAX_TEMPLATE_ATTACHMENTS;
export const ATTACHMENT_LIMIT_NOTICE = '첨부파일은 총 11개까지 추가할 수 있습니다. (지식 최대 10개 · 서식 최대 1개)';

export function prepareAttachments(
  existing: { file: File; role: AttachmentRole }[],
  incoming: File[],
  role: AttachmentRole,
) {
  const names = new Set(existing.map(entry => `${entry.file.name}:${entry.file.size}`));
  let count = existing.filter(entry => entry.role === role).length;
  const limit = role === 'knowledge' ? MAX_KNOWLEDGE_ATTACHMENTS : MAX_TEMPLATE_ATTACHMENTS;
  const files: { file: File; role: AttachmentRole }[] = [];
  let exceeded = false;
  for (const file of incoming) {
    const key = `${file.name}:${file.size}`;
    if (names.has(key)) continue;
    names.add(key);
    if (count < limit) {
      files.push({ file, role });
      count++;
    } else {
      exceeded = true;
    }
  }
  const notice = exceeded
    ? role === 'knowledge'
      ? '지식은 최대 10개까지 첨부할 수 있습니다. 초과 파일은 추가하지 않았습니다.'
      : '서식은 1개만 첨부할 수 있습니다. 다른 서식을 첨부하려면 기존 서식을 제거하세요.'
    : '';
  return { files, notice };
}