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
) {
  const names = new Set(existing.map(entry => `${entry.file.name}:${entry.file.size}`));
  let knowledgeCount = existing.filter(entry => entry.role === 'knowledge').length;
  let templateCount = existing.length - knowledgeCount;
  const files: { file: File; role: AttachmentRole }[] = [];
  let exceeded = false;
  let assignedTemplate = false;
  for (const file of incoming) {
    const key = `${file.name}:${file.size}`;
    if (names.has(key)) continue;
    names.add(key);
    if (knowledgeCount < MAX_KNOWLEDGE_ATTACHMENTS) {
      files.push({ file, role: 'knowledge' });
      knowledgeCount++;
    } else if (templateCount < MAX_TEMPLATE_ATTACHMENTS) {
      files.push({ file, role: 'template' });
      templateCount++;
      assignedTemplate = true;
    } else {
      exceeded = true;
    }
  }
  const notice = [
    exceeded ? ATTACHMENT_LIMIT_NOTICE : '',
    assignedTemplate ? '지식 10개 한도에 도달하여 추가 파일을 서식으로 지정했습니다.' : '',
  ].filter(Boolean).join(' ');
  return { files, notice };
}