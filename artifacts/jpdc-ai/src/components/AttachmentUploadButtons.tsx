import { useRef } from 'react';
import { FileText, Paperclip } from 'lucide-react';
import { MAX_KNOWLEDGE_ATTACHMENTS, MAX_TEMPLATE_ATTACHMENTS, type AttachmentRole } from '../types/conversation';

interface Props {
  knowledgeCount: number;
  templateCount: number;
  onSelect: (files: File[], role: AttachmentRole) => void;
}

export default function AttachmentUploadButtons({ knowledgeCount, templateCount, onSelect }: Props) {
  const knowledgeInput = useRef<HTMLInputElement>(null);
  const templateInput = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-wrap items-center gap-1">
      {(['knowledge', 'template'] as const).map(role => {
        const isTemplate = role === 'template';
        const input = isTemplate ? templateInput : knowledgeInput;
        const full = isTemplate ? templateCount >= MAX_TEMPLATE_ATTACHMENTS : knowledgeCount >= MAX_KNOWLEDGE_ATTACHMENTS;
        const Icon = isTemplate ? FileText : Paperclip;
        const label = isTemplate ? '서식 첨부' : '지식 첨부';
        return (
          <div key={role}>
            <input ref={input} type="file" multiple={!isTemplate} className="hidden"
              aria-label={`${label} 파일 선택`}
              onChange={e => {
                const files = Array.from(e.currentTarget.files ?? []);
                e.currentTarget.value = '';
                if (files.length) onSelect(files, role);
              }} />
            <button type="button" disabled={full} onClick={() => input.current?.click()}
              title={isTemplate
                ? full ? '서식을 교체하려면 기존 서식을 제거하세요.' : '출력 구조·목차·문체 참조용 · 최대 1개'
                : '답변의 근거·인용 자료 · 최대 10개'}
              className={`flex items-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] ${isTemplate ? 'border-amber-200 text-amber-800 hover:bg-amber-50' : 'border-[#E4E2F0] text-[#4F46E5] hover:bg-[#F4F3FC]'}`}>
              <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
              {label}
            </button>
          </div>
        );
      })}
    </div>
  );
}
