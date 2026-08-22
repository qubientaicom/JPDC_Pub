import { X, BookmarkCheck, Bookmark } from 'lucide-react';
import Tooltip from './Tooltip';

export interface SavedItem { query: string; answer: string; savedAt: Date }

export default function SavedPanel({ items, open, onClose, onRemove }: {
  items: SavedItem[];
  open: boolean;
  onClose: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div
      className={`
        relative h-full flex flex-col shrink-0
        bg-[#F9F8FF] border-r border-[#E4E2F0]
        transition-[width,opacity] duration-300 ease-in-out overflow-hidden
        ${open ? 'w-[280px] opacity-100' : 'w-0 opacity-0'}
      `}
    >
      {/* 헤더 */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-[#E4E2F0] shrink-0 min-w-[280px]">
        <div className="flex items-center gap-2">
          <BookmarkCheck className="w-4 h-4 text-[#4F46E5]" strokeWidth={1.8} />
          <span className="text-base font-semibold text-[#1A1826]">저장 목록</span>
          {items.length > 0 && (
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-[#4F46E5] text-white">
              {items.length}
            </span>
          )}
        </div>
        <Tooltip label="저장 목록 닫기" position="right">
          <button type="button" onClick={onClose}
            className="p-1.5 rounded-lg text-[#A8A6C0] hover:text-[#1A1826] hover:bg-[#E4E2F0] transition-colors">
            <X className="w-4 h-4" strokeWidth={1.8} />
          </button>
        </Tooltip>
      </div>

      {/* 목록 */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 min-w-[280px]" style={{ scrollbarWidth: 'none' }}>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-[#A8A6C0]">
            <Bookmark className="w-8 h-8" strokeWidth={1.3} />
            <p className="text-sm text-center">저장한 답변이 없습니다</p>
          </div>
        ) : (
          [...items].map((item, originalIndex) => ({ item, originalIndex })).reverse().map(({ item, originalIndex }) => (
            <div key={originalIndex} className="group/saved bg-white border border-[#E4E2F0] rounded-xl p-3 hover:border-[#C7C3F7] transition-colors">
              <div className="flex items-start gap-2">
                <p className="flex-1 min-w-0 text-[11.5px] font-semibold text-[#4F46E5] line-clamp-2 leading-snug">
                  {item.query}
                </p>
                <button type="button"
                  onClick={() => onRemove(originalIndex)}
                  aria-label="저장 항목 삭제"
                  className="shrink-0 mt-[-2px] mr-[-4px] p-1 rounded-md text-[#C7C3F7] hover:text-[#EF4444] hover:bg-[#FFF0F0]
                             opacity-0 group-hover/saved:opacity-100 transition-all duration-150">
                  <X className="w-3 h-3" strokeWidth={2} />
                </button>
              </div>
              <p className="text-[12px] text-[#6B6882] leading-relaxed line-clamp-3 mt-2">
                {item.answer.replace(/\*\*([^*]+)\*\*/g, '$1')}
              </p>
              <p className="text-[11px] text-[#A8A6C0] mt-2">
                {item.savedAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
