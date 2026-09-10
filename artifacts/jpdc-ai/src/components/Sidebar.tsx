import { useEffect, useRef, useState } from 'react';
import { Plus, Search, Settings, ChevronLeft, ChevronRight, Store, Sun, Moon, LogOut, BookOpen, X, MessageCircle, Clock, BookmarkCheck } from 'lucide-react';
import jpdcLogo from '../assets/jpdc-logo.png';
import { useTheme } from '../context/ThemeContext';
import Tooltip from './Tooltip';

const INITIAL_HISTORY_GROUPS = [
  {
    label: '오늘',
    items: [
      { title: '입고 처리가 안된 작업 방법알려줘', active: false, badge: '지침·ERP 선택' },
      { title: '입고 처리가 안 된 작업지시가 있어?', active: false, badge: 'RAG+TAG+비서' },
      { title: '공공기관 보안 지침에서 외부 반출 금지 자료의 범위는 어디까지인가요?', active: true },
      { title: '계약 협상 중인 단가 정보는 어떤 기준으로 보호되나요?', active: false },
    ],
  },
  {
    label: '어제',
    items: [
      { title: '대외비 문서의 결재 절차와 보관 방법을 알려주세요', active: false },
      { title: '감사 결과 보고서는 내부에서 어떻게 공유하나요?', active: false },
      { title: '회의록 작성 잘 하는법', active: false, badge: '지침+비서' },
      { title: '회의록 작성 어떻게 해? (미식별 후 비서 추천)', active: false, badge: '미식별+비서' },
      { title: '비서 유형 활용 현황 구해줘 (TAG+비서)', active: false, badge: 'TAG+비서' },
      { title: '3월 생산량 합계 보여줘 (TAG/분할/비서)', active: false, badge: 'TAG/분할/비서' },
      { title: '3월 생산량 합계 보여줘', active: false, badge: 'TAG/분할' },
      { title: '5월 생산량 월별 보여줘', active: false, badge: 'TAG' },
    ],
  },
  {
    label: '지난 7일',
    items: [
      { title: '부서장 사전 승인 없이 자료를 반출했을 때 처벌 규정은?', active: false },
      { title: '보안 일지 작성 시 필수 기재 항목이 뭔가요?', active: false },
      { title: '계약 체결 전 단가 정보 유출 시 책임 소재는 어디에 있나요?', active: false },
      { title: '직원 급여 명세를 인사팀 외에 공유하는 게 가능한가요?', active: false },
    ],
  },
];

const CLICKABLE_HISTORIES = new Set([
  '입고 처리가 안된 작업 방법알려줘',
  '입고 처리가 안 된 작업지시가 있어?',
  '계약 협상 중인 단가 정보는 어떤 기준으로 보호되나요?',
  '회의록 작성 잘 하는법',
  '회의록 작성 어떻게 해? (미식별 후 비서 추천)',
  '비서 유형 활용 현황 구해줘 (TAG+비서)',
  '3월 생산량 합계 보여줘 (TAG/분할/비서)',
  '3월 생산량 합계 보여줘',
  '5월 생산량 월별 보여줘',
]);

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  activeView: string;
  onNavigate: (view: 'home' | 'market') => void;
  onOpenSettings: () => void;
  onOpenManual?: () => void;
  onSelectHistory?: (query: string) => void;
  onLogout?: () => void;
  savedPanelOpen?: boolean;
  onToggleSavedPanel?: () => void;
  savedItemCount?: number;
}

/* ── 대화 검색 모달 ── */
function ConversationSearchModal({ onClose, onSelect }: {
  onClose: () => void;
  onSelect: (title: string) => void;
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const allItems = INITIAL_HISTORY_GROUPS.flatMap(g =>
    g.items.map(item => ({ ...item, group: g.label }))
  );
  const q = query.trim().toLowerCase();
  const filtered = q ? allItems.filter(i => i.title.toLowerCase().includes(q)) : allItems;

  const highlight = (text: string) => {
    if (!q) return <>{text}</>;
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return <>{text}</>;
    return (
      <>
        {text.slice(0, idx)}
        <strong className="text-[#1A1826] font-bold">{text.slice(idx, idx + q.length)}</strong>
        {text.slice(idx + q.length)}
      </>
    );
  };

  const groupLabel: Record<string, string> = { '오늘': '오늘', '어제': '어제', '지난 7일': '지난 7일' };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4"
      onClick={onClose}>
      {/* 백드롭 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* 모달 패널 */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl shadow-black/20 border border-[#E4E2F0] overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* 검색 입력 */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-[#F0EEF8]">
          <Search className="w-5 h-5 text-[#4F46E5] shrink-0" strokeWidth={2} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="대화 검색..."
            className="flex-1 text-base text-[#1A1826] placeholder:text-[#C7C3F7] outline-none bg-transparent"
          />
          {query && (
            <button onClick={() => setQuery('')}
              className="w-6 h-6 rounded-full bg-[#A8A6C0] hover:bg-[#6B6882] flex items-center justify-center transition-colors">
              <X className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </button>
          )}
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#A8A6C0] hover:text-[#4F46E5] hover:bg-[#EEF0FF] transition-colors">
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* 결과 목록 */}
        <div className="max-h-[60vh] overflow-y-auto py-2" style={{ scrollbarWidth: 'none' }}>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-[#A8A6C0]">
              <Search className="w-8 h-8 opacity-40" strokeWidth={1.5} />
              <p className="text-sm">검색 결과가 없습니다</p>
            </div>
          ) : (
            <>
              {q && (
                <p className="px-4 py-1.5 text-[11px] font-semibold text-[#A8A6C0] uppercase tracking-widest">
                  검색 결과 {filtered.length}건
                </p>
              )}
              {!q && (
                <p className="px-4 py-1.5 text-[11px] font-semibold text-[#A8A6C0] uppercase tracking-widest">
                  전체 대화
                </p>
              )}
              {filtered.map((item, i) => (
                <button key={`${item.title}-${i}`} type="button"
                  onClick={() => { onSelect(item.title); onClose(); }}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[#F4F3FC] transition-colors text-left group">
                  <MessageCircle className="w-4 h-4 text-[#C7C3F7] group-hover:text-[#4F46E5] shrink-0 mt-0.5 transition-colors" strokeWidth={1.8} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[#4B4A63] leading-snug break-keep">
                      {highlight(item.title)}
                    </p>
                    {'badge' in item && item.badge && (
                      <span className="mt-1 inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-[#F0EEFA] text-[#7C6FF7] border border-[#E4E0FA]">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#C7C3F7] shrink-0 mt-0.5 group-hover:text-[#A8A6C0]">
                    {groupLabel[item.group] ?? item.group}
                  </span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ open, onToggle, activeView, onNavigate, onOpenSettings, onOpenManual, onSelectHistory, onLogout, savedPanelOpen = false, onToggleSavedPanel, savedItemCount = 0 }: SidebarProps) {
  const { theme, toggle: toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [historyGroups, setHistoryGroups] = useState(INITIAL_HISTORY_GROUPS);
  const [searchOpen, setSearchOpen] = useState(false);

  const deleteHistoryItem = (groupLabel: string, title: string) => {
    setHistoryGroups(prev =>
      prev
        .map(g =>
          g.label === groupLabel
            ? { ...g, items: g.items.filter(i => i.title !== title) }
            : g
        )
        .filter(g => g.items.length > 0)
    );
  };

  /* ── 모바일 감지 ── */
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const sidebarWidth = isMobile ? 315 : (open ? 315 : 56);

  return (
    <>
      {/* 모바일 백드롭 */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onToggle}
      />

      <aside
        className={`
          fixed top-0 left-0 h-full z-50
          md:relative md:top-auto md:left-auto md:z-auto md:translate-x-0
          ${!open ? '-translate-x-full' : ''}
          transition-transform md:transition-[width] duration-300 ease-in-out
          bg-[#F9F8FF] border-r border-[#E4E2F0] flex flex-col overflow-hidden
          md:shrink-0
        `}
        style={{ width: sidebarWidth }}
      >
        {/* Logo row + toggle — 순수 flex, absolute 없음 */}
        <div className="h-12 flex items-center gap-2 border-b border-[#E4E2F0] shrink-0 px-3">
          {/* 로고 + 타이틀: 펼쳤을 때만, 클릭 시 홈으로 */}
          {open && (
            <button type="button" onClick={() => onNavigate('home')}
              className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-75 transition-opacity">
              <div className="w-7 h-7 flex items-center justify-center shrink-0">
                <img src={jpdcLogo} alt="JPDC 로고" className="w-7 h-7 rounded-lg object-cover" />
              </div>
              <span className="flex-1 font-bold text-[#1A1826] text-base tracking-tight whitespace-nowrap min-w-0 truncate text-left">
                JPDC AI
              </span>
            </button>
          )}

          {/* 돋보기 버튼: 항상 표시 */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="대화 검색"
            className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[#A8A6C0] hover:text-[#4F46E5] hover:bg-[#EEF0FF] transition-colors ${open ? '' : 'ml-auto -translate-x-[1mm]'}`}
          >
            <Search className="w-3.5 h-3.5" strokeWidth={2} />
          </button>

        </div>

        {/* ── EXPANDED nav ── */}
        <div className={`flex flex-col flex-1 overflow-hidden transition-[opacity] duration-200 ${
          open ? 'opacity-100 delay-100' : 'opacity-0 pointer-events-none'
        }`}>
          <div className="px-3 pt-3 pb-2 shrink-0 flex flex-col gap-1.5">
            <button type="button"
              onClick={() => onNavigate('home')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-semibold bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-sm shadow-[#4F46E5]/20">
              <Plus className="w-3.5 h-3.5 shrink-0" strokeWidth={2.2} />
              새 대화 시작
            </button>

            <button type="button"
              onClick={onToggleSavedPanel}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm group ${
                savedPanelOpen
                  ? 'bg-[#EEEEFF] border border-[#C7C3F7] text-[#4F46E5] font-semibold'
                  : 'text-[#6B6882] hover:bg-[#EEEEFF] hover:text-[#4F46E5] font-medium border border-transparent'
              }`}>
              <BookmarkCheck className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                savedPanelOpen ? 'text-[#4F46E5]' : 'text-[#A8A6C0] group-hover:text-[#4F46E5]'
              }`} strokeWidth={1.8} />
              저장목록
              {savedItemCount > 0 && (
                <span className="ml-auto text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-[#4F46E5] text-white">{savedItemCount}</span>
              )}
            </button>

          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-3" style={{ scrollbarWidth: 'none' }}>
            {historyGroups.map((group) => (
              <div key={group.label} className="mb-3">
                <p className="px-2 py-1 text-[11px] uppercase tracking-widest text-[#A8A6C0] font-semibold">
                  {group.label}
                </p>
                {group.items.map((item) => {
                  const isActive = item.active && activeView === 'home';
                  return (
                    <div key={item.title}
                      className={`group/hist flex items-start rounded-lg transition-all border ${
                        isActive
                          ? 'bg-[#EEEEFF] border-[#C7C3F7]'
                          : 'border-transparent hover:bg-[#EEEEFF] hover:border-[#C7C3F7] hover:shadow-sm'
                      }`}>
                      <button type="button"
                        onClick={() => onSelectHistory?.(item.title)}
                        className="flex-1 min-w-0 px-2 py-2 text-left">
                        <span className={`text-[12.5px] leading-snug line-clamp-2 break-keep transition-colors ${
                          isActive
                            ? 'text-[#4F46E5] font-semibold'
                            : 'text-[#6B6882] group-hover/hist:text-[#4F46E5] group-hover/hist:font-semibold'
                        }`}>
                          {item.title}
                          {'badge' in item && item.badge && (
                            <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-md text-[9.5px] font-semibold bg-[#F0EEFA] text-[#7C6FF7] border border-[#E4E0FA] align-middle">
                              {item.badge}
                            </span>
                          )}
                        </span>
                      </button>
                      <button type="button"
                        onClick={(e) => { e.stopPropagation(); deleteHistoryItem(group.label, item.title); }}
                        aria-label="대화 삭제"
                        className="shrink-0 mt-1.5 mr-1.5 p-1 rounded-md text-[#C7C3F7] hover:text-[#EF4444] hover:bg-[#FFF0F0]
                                   opacity-0 group-hover/hist:opacity-100 transition-all duration-150">
                        <X className="w-3 h-3" strokeWidth={2} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* 이용 매뉴얼 버튼 */}
          <div className="px-3 pb-2 shrink-0">
            <button type="button" onClick={onOpenManual}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E4E2F0] text-[13px] font-semibold text-[#6B6882] hover:border-[#4F46E5] hover:text-[#4F46E5] hover:bg-[#F0EEFF] transition-colors group">
              <BookOpen className="w-3.5 h-3.5 shrink-0 text-[#A8A6C0] group-hover:text-[#4F46E5] transition-colors" strokeWidth={1.8} />
              이용 매뉴얼
            </button>
          </div>

          {/* Footer: 사용자 + 다크모드 토글 + 설정 + 로그아웃 */}
          <div className="border-t border-[#E4E2F0] px-3 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#4F46E5] flex items-center justify-center text-[12px] font-bold text-white shadow-sm shrink-0">
                김
              </div>
              <p className="text-sm font-semibold text-[#1A1826] truncate">김동현</p>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <Tooltip label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'} position="top">
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={isDark ? '라이트 모드' : '다크 모드'}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-[#A8A6C0] hover:text-[#4F46E5] hover:bg-[#EEF0FF] transition-colors"
                >
                  {isDark
                    ? <Sun className="w-4 h-4" strokeWidth={1.8} />
                    : <Moon className="w-4 h-4" strokeWidth={1.8} />
                  }
                </button>
              </Tooltip>
              <Tooltip label="설정 열기" position="top">
                <button type="button" onClick={onOpenSettings} aria-label="설정"
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-[#A8A6C0] hover:text-[#4F46E5] hover:bg-[#EEF0FF] transition-colors">
                  <Settings className="w-4 h-4" strokeWidth={1.8} />
                </button>
              </Tooltip>
              <Tooltip label="로그아웃" position="top">
                <button type="button" onClick={onLogout} aria-label="로그아웃"
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-[#A8A6C0] hover:text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut className="w-4 h-4" strokeWidth={1.8} />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* ── COLLAPSED icon rail ── */}
        <div className={`absolute inset-0 top-12 flex flex-col items-center pt-3 gap-1 transition-[opacity] duration-200 ${
          open ? 'opacity-0 pointer-events-none' : 'opacity-100 delay-100'
        }`}>
          <Tooltip label="새 대화 시작" position="right">
            <button type="button" onClick={() => onNavigate('home')}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white transition-colors shadow-sm shadow-[#4F46E5]/20">
              <Plus className="w-4 h-4" strokeWidth={2.2} />
            </button>
          </Tooltip>

          <Tooltip label="저장목록" position="right">
            <button type="button" onClick={onToggleSavedPanel}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                savedPanelOpen
                  ? 'bg-[#EEEEFF] text-[#4F46E5] border border-[#C7C3F7]'
                  : 'text-[#A8A6C0] hover:bg-[#EEEEFF] hover:text-[#4F46E5] border border-transparent'
              }`}>
              <BookmarkCheck className="w-4 h-4" strokeWidth={1.8} />
            </button>
          </Tooltip>



          <div className="flex-1" />

          {/* 다크모드 토글 (접힌 상태) */}
          <Tooltip label={isDark ? '라이트 모드' : '다크 모드'} position="right">
            <button type="button" onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-[#A8A6C0] hover:bg-[#F4F3FC] hover:text-[#6B6882] transition-colors">
              {isDark ? <Sun className="w-4 h-4" strokeWidth={1.8} /> : <Moon className="w-4 h-4" strokeWidth={1.8} />}
            </button>
          </Tooltip>
          <Tooltip label="설정" position="right">
            <button type="button" onClick={onOpenSettings}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-[#A8A6C0] hover:bg-[#F4F3FC] hover:text-[#6B6882] transition-colors">
              <Settings className="w-4 h-4" strokeWidth={1.8} />
            </button>
          </Tooltip>
          <Tooltip label="로그아웃" position="right">
            <button type="button" onClick={onLogout}
              className="w-9 h-9 mb-3 flex items-center justify-center rounded-lg text-[#A8A6C0] hover:bg-red-50 hover:text-red-500 transition-colors">
              <LogOut className="w-4 h-4" strokeWidth={1.8} />
            </button>
          </Tooltip>
        </div>
      </aside>

      {/* 대화 검색 모달 */}
      {searchOpen && (
        <ConversationSearchModal
          onClose={() => setSearchOpen(false)}
          onSelect={(title) => { onSelectHistory?.(title); setSearchOpen(false); }}
        />
      )}
    </>
  );
}
