import { useState, useEffect } from 'react';
import { Bell, X, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import Tooltip from './Tooltip';

export const INITIAL_UNREAD = 2;

interface NotifItem {
  id: number;
  kind: 'alert' | 'info' | 'success';
  title: string;
  body: string;
  ts: string;
  read: boolean;
}

const INITIAL_NOTIFS: NotifItem[] = [
  { id: 1, kind: 'alert',   title: '보안 알림',          body: '어제 외부 IP에서 로그인 시도가 감지되었습니다.',           ts: '2026-07-23T08:12:00', read: false },
  { id: 2, kind: 'info',    title: '비서 업데이트',        body: '회의록 문장정리 비서가 v1.3으로 업데이트되었습니다.',       ts: '2026-07-23T07:40:00', read: false },
  { id: 3, kind: 'success', title: '답변 저장 완료',       body: '계약 협상 관련 답변이 저장 목록에 추가되었습니다.',         ts: '2026-07-22T17:05:00', read: true  },
  { id: 4, kind: 'info',    title: '브리핑 게시됨',        body: '오늘 오전 8:30 AI 브리핑이 게시되었습니다.',               ts: '2026-07-22T08:30:00', read: true  },
];

const KIND_ICON = {
  alert:   { Icon: AlertCircle,  bg: '#FEF2F2', color: '#EF4444' },
  info:    { Icon: Info,         bg: '#EEEEFF', color: '#4F46E5' },
  success: { Icon: CheckCircle2, bg: '#ECFDF5', color: '#10B981' },
};

export default function NotifPanel({ open, onClose, onUnreadChange }: {
  open: boolean;
  onClose: () => void;
  onUnreadChange?: (n: number) => void;
}) {
  const [items, setItems] = useState<NotifItem[]>(INITIAL_NOTIFS);
  const unread = items.filter(i => !i.read).length;

  useEffect(() => { onUnreadChange?.(unread); }, [unread, onUnreadChange]);

  const markAllRead = () => setItems(prev => prev.map(i => ({ ...i, read: true })));

  return (
    <>
      {/* 모바일 백드롭 */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 sm:hidden transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* 패널 */}
      <div
        className={`
          fixed inset-y-0 right-0 z-50 w-[85vw] max-w-[300px]
          sm:relative sm:inset-auto sm:z-auto sm:h-full
          flex flex-col bg-[#F9F8FF] border-l border-[#E4E2F0] shrink-0
          transition-all duration-300 ease-in-out overflow-hidden
          ${open ? 'translate-x-0 opacity-100 sm:w-[300px]' : 'translate-x-full opacity-0 sm:translate-x-0 sm:w-0'}
        `}
      >
        {/* 헤더 */}
        <div className="h-12 flex items-center justify-between px-4 border-b border-[#E4E2F0] shrink-0">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#4F46E5]" strokeWidth={1.8} />
            <span className="text-base font-semibold text-[#1A1826]">알림 센터</span>
            {unread > 0 && (
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-[#4F46E5] text-white">
                {unread}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unread > 0 && (
              <Tooltip label="모두 읽음 처리" position="left">
                <button
                  type="button"
                  onClick={markAllRead}
                  className="px-2 py-1 rounded-lg text-[11px] font-semibold text-[#4F46E5] hover:bg-[#EEEEFF] transition-colors"
                >
                  모두 읽음
                </button>
              </Tooltip>
            )}
            <Tooltip label="알림 센터 닫기" position="left">
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#A8A6C0] hover:text-[#1A1826] hover:bg-[#E4E2F0] transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={1.8} />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* 목록 */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5" style={{ scrollbarWidth: 'none' }}>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-[#A8A6C0]">
              <Bell className="w-8 h-8" strokeWidth={1.3} />
              <p className="text-sm text-center">알림이 없습니다</p>
            </div>
          ) : items.map((item) => {
            const { Icon, bg, color } = KIND_ICON[item.kind];
            return (
              <div
                key={item.id}
                className="group/notif flex items-start gap-2.5 px-3 py-2.5 rounded-xl border border-[#E4E2F0] bg-white hover:border-[#C7C3F7] transition-colors cursor-pointer"
                onClick={() => setItems(prev => prev.map(i => i.id === item.id ? { ...i, read: true } : i))}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: bg }}>
                  <Icon style={{ width: 14, height: 14, color }} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="flex-1 min-w-0 text-[13px] font-semibold text-[#1A1826] truncate">{item.title}</p>
                    {!item.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] shrink-0" />
                    )}
                  </div>
                  <p className="text-[12px] text-[#6B6882] leading-snug line-clamp-2">{item.body}</p>
                  <p className="text-[11px] text-[#A8A6C0] mt-1">
                    {new Date(item.ts).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setItems(prev => prev.filter(i => i.id !== item.id));
                  }}
                  aria-label="알림 삭제"
                  className="shrink-0 mt-[-2px] mr-[-4px] p-1 rounded-md text-[#C7C3F7] hover:text-[#EF4444] hover:bg-[#FFF0F0]
                             opacity-0 group-hover/notif:opacity-100 transition-all duration-150">
                  <X className="w-3 h-3" strokeWidth={2} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
