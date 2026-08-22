import { useState } from 'react';
import {
  Plus, Search, Settings, ArrowUp, ChevronDown,
  Paperclip, Mic, Sparkles, Share, MoreHorizontal, Store,
  PenTool, Code, Globe, FileText, Zap,
  type LucideIcon,
} from 'lucide-react';

/* ─── 최종 선택안 ──────────────────────────────────────────────
   Base: Design 2 (BestOf) 레이아웃 구조
   Changes vs. Design 2:
   · 아이콘: 이모지 그라디언트 타일 → 루시드 라인 아이콘 단일 체계
   · 색상: 브랜드 #4F46E5 1색 + 보조 #D4930A (알림·업데이트에만)
   · 바로가기 카드: 기본 라벨만, 호버 시 설명 페이드-인
   · 선택 상태·중요 버튼에만 강한 색상 사용

   Primary:      #4F46E5   (deep indigo — main brand)
   Accent:       #D4930A   (warm amber — notice/update only)
   Bg:           #F9F8FF
   Border:       #E4E2F0
   Text primary: #1A1826
   Text muted:   #6B6882
   Text subtle:  #A8A6C0
─────────────────────────────────────────────────────────────── */

const HISTORY_GROUPS = [
  {
    label: '오늘',
    items: [
      { initials: 'KN', title: '한국어 NLP 데이터 구조화', active: true },
      { initials: 'RQ', title: 'React Query 아키텍처 패턴', active: false },
    ],
  },
  {
    label: '어제',
    items: [
      { initials: 'QT', title: '퀀트 투자 알고리즘 리뷰', active: false },
      { initials: 'PG', title: 'PostgreSQL 성능 튜닝', active: false },
      { initials: 'DK', title: '다크모드 UI 색채 이론', active: false },
    ],
  },
  {
    label: '지난 7일',
    items: [
      { initials: 'CT', title: '실시간 채팅 시스템 설계', active: false },
      { initials: 'LM', title: 'LLM 프롬프트 엔지니어링 가이드', active: false },
      { initials: 'RW', title: 'Rust WASM 통합', active: false },
      { initials: 'NE', title: 'Next.js 엣지 라우팅 문제', active: false },
    ],
  },
];

const MODES = ['회의록 문장정리', '이메일 문체변경', '번역', '보도자료'];

/* 바로가기: 아이콘 통일(루시드 라인), 설명은 호버 시 노출 */
const SHORTCUTS: { label: string; desc: string; icon: LucideIcon }[] = [
  { label: 'AI 글쓰기',  desc: '블로그·기획서·이메일 등 다양한 글 작성', icon: PenTool  },
  { label: '코드 분석',  desc: '디버깅·최적화·리뷰로 코드 품질 향상',    icon: Code     },
  { label: '번역',       desc: '다국어 고품질 번역, 자연스러운 문장',      icon: Globe    },
  { label: '문서 요약',  desc: 'PDF·보고서·계약서를 핵심만 간추려 정리',  icon: FileText },
];

/* ── Sidebar ──────────────────────────────────────────────── */

function Sidebar() {
  return (
    <aside className="w-[240px] bg-[#F9F8FF] border-r border-[#E4E2F0] flex flex-col h-full shrink-0">
      {/* Logo row */}
      <div className="h-12 flex items-center gap-2.5 px-4 border-b border-[#E4E2F0] shrink-0">
        <div className="w-7 h-7 rounded-lg bg-[#4F46E5] flex items-center justify-center shadow-sm shadow-[#4F46E5]/30">
          <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
            <circle cx="10" cy="10" r="7" fill="white" fillOpacity="0.2"/>
            <path d="M7 10.5l2.5 2.5 4-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="font-bold text-[#1A1826] text-sm tracking-tight">JPDC AI</span>
      </div>

      {/* New chat + nav + search */}
      <div className="px-3 pt-3 pb-2 shrink-0 flex flex-col gap-1.5">
        <button
          type="button"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white transition-colors text-xs font-semibold shadow-sm shadow-[#4F46E5]/20"
        >
          <Plus className="w-3.5 h-3.5 shrink-0" strokeWidth={2.2} />
          새 대화 시작
        </button>
        <button
          type="button"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#6B6882] hover:bg-[#EEEEFF] hover:text-[#4F46E5] transition-colors text-xs font-medium group"
        >
          <Store className="w-3.5 h-3.5 shrink-0 text-[#A8A6C0] group-hover:text-[#4F46E5] transition-colors" strokeWidth={1.8} />
          비서마켓
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#E4E2F0] text-[#A8A6C0]">
          <Search className="w-3.5 h-3.5 shrink-0" strokeWidth={1.8} />
          <span className="text-xs">대화 검색...</span>
        </div>
      </div>

      {/* History */}
      <div className="flex-1 overflow-y-auto px-2 pb-3" style={{ scrollbarWidth: 'none' }}>
        {HISTORY_GROUPS.map((group) => (
          <div key={group.label} className="mb-3">
            <p className="px-2 py-1 text-[10px] uppercase tracking-widest text-[#A8A6C0] font-semibold">
              {group.label}
            </p>
            {group.items.map((item, idx) => (
              <button
                key={idx}
                type="button"
                className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left transition-all group ${
                  item.active
                    ? 'bg-[#EEEEFF] border border-[#C7C3F7]'
                    : 'hover:bg-[#F4F3FC] border border-transparent'
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 ${
                  item.active
                    ? 'bg-[#4F46E5] text-white'
                    : 'bg-[#F0EEFA] text-[#6B6882] group-hover:bg-[#E4E2F5]'
                }`}>
                  {item.initials}
                </span>
                <span className={`text-xs leading-snug truncate ${
                  item.active ? 'text-[#4F46E5] font-semibold' : 'text-[#6B6882]'
                }`}>
                  {item.title}
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* User footer */}
      <div className="border-t border-[#E4E2F0] px-3 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#4F46E5] flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
            김
          </div>
          <p className="text-xs font-semibold text-[#1A1826] leading-none">김동현</p>
        </div>
        <button type="button" aria-label="설정" className="text-[#A8A6C0] hover:text-[#1A1826] transition-colors">
          <Settings className="w-4 h-4" strokeWidth={1.8} />
        </button>
      </div>
    </aside>
  );
}

/* ── Shortcut card — 기본은 라벨만, 호버에 설명 등장 ───────── */

function ShortcutCard({ label, desc, icon: Icon }: { label: string; desc: string; icon: LucideIcon }) {
  return (
    <button
      type="button"
      className="group/card relative flex flex-col items-center gap-2 px-3 pt-4 pb-3 bg-white rounded-xl border border-[#E4E2F0]
                 hover:border-[#4F46E5]/30 hover:shadow-md hover:shadow-[#4F46E5]/8 hover:-translate-y-0.5
                 transition-all duration-200 text-center overflow-hidden"
    >
      {/* Icon container — neutral at rest, indigo tint on hover */}
      <div className="w-10 h-10 rounded-xl bg-[#F4F3FC] group-hover/card:bg-[#EEF0FF] flex items-center justify-center transition-colors duration-200">
        <Icon
          className="w-5 h-5 text-[#A8A6C0] group-hover/card:text-[#4F46E5] transition-colors duration-200"
          strokeWidth={1.8}
        />
      </div>

      {/* Label — always visible */}
      <span className="text-xs font-semibold text-[#1A1826] leading-snug whitespace-nowrap">
        {label}
      </span>

      {/* Description — hidden by default, slides in on hover */}
      <span
        className="block text-[10.5px] text-[#A8A6C0] leading-snug
                   max-h-0 overflow-hidden opacity-0
                   group-hover/card:max-h-10 group-hover/card:opacity-100
                   transition-all duration-200 ease-out"
      >
        {desc}
      </span>
    </button>
  );
}

/* ── Main Area ────────────────────────────────────────────── */

function MainArea({ mode, setMode }: { mode: number; setMode: (m: number) => void }) {
  return (
    <div className="flex-1 flex flex-col h-full bg-white min-w-0">

      {/* Topbar */}
      <div className="h-12 flex items-center justify-end px-6 bg-white border-b border-[#E4E2F0] shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold transition-colors shadow-sm shadow-[#4F46E5]/20"
          >
            <Sparkles className="w-3.5 h-3.5" strokeWidth={1.8} />
            브리핑
          </button>
          <button type="button" aria-label="공유" className="text-[#A8A6C0] hover:text-[#6B6882] transition-colors p-2 rounded-lg hover:bg-[#F4F3FC]">
            <Share className="w-4 h-4" strokeWidth={1.8} />
          </button>
          <button type="button" aria-label="더 보기" className="text-[#A8A6C0] hover:text-[#6B6882] transition-colors p-2 rounded-lg hover:bg-[#F4F3FC]">
            <MoreHorizontal className="w-4 h-4" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-10 pb-6 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>

        {/* Hero headline */}
        <div className="text-center mb-7">
          <h1 className="font-bold tracking-tight leading-[1.08]">
            <span className="block text-[52px] text-[#1A1826]">무엇을</span>
            <span
              className="block text-[52px]"
              style={{
                background: 'linear-gradient(120deg, #4F46E5 0%, #7C6FF7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              만들어볼까요?
            </span>
          </h1>
        </div>

        {/* Mode tab bar */}
        <div
          role="tablist"
          aria-label="대화 모드"
          className="flex gap-1 p-1 rounded-xl bg-[#F4F3FC] border border-[#E4E2F0] mb-6"
        >
          {MODES.map((m, i) => (
            <button
              key={m}
              role="tab"
              type="button"
              aria-selected={mode === i}
              onClick={() => setMode(i)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                mode === i
                  ? 'bg-[#4F46E5] text-white shadow-sm shadow-[#4F46E5]/25'
                  : 'text-[#6B6882] hover:text-[#1A1826] hover:bg-white/70'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="w-full max-w-2xl mb-3">
          <div className="bg-white rounded-2xl border border-[#E4E2F0] shadow-sm hover:border-[#C7C3F7] focus-within:border-[#4F46E5] focus-within:shadow-[0_0_0_3px_rgba(79,70,229,0.08)] transition-all">
            <textarea
              className="w-full px-5 pt-4 pb-2 bg-transparent border-none outline-none text-[#1A1826] placeholder:text-[#A8A6C0] resize-none text-sm leading-relaxed"
              placeholder="작업을 설명하거나, 질문하거나, 파일을 첨부하세요..."
              rows={3}
              aria-label="메시지 입력"
            />
            <div className="flex items-center justify-between px-4 pb-3">
              <div className="flex items-center gap-0.5">
                <button type="button" aria-label="파일 첨부" className="p-1.5 rounded-lg text-[#A8A6C0] hover:text-[#4F46E5] hover:bg-[#F4F3FC] transition-colors">
                  <Paperclip className="w-[15px] h-[15px]" strokeWidth={1.8} />
                </button>
                <button type="button" aria-label="음성 입력" className="p-1.5 rounded-lg text-[#A8A6C0] hover:text-[#4F46E5] hover:bg-[#F4F3FC] transition-colors">
                  <Mic className="w-[15px] h-[15px]" strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[#6B6882] hover:text-[#4F46E5] hover:bg-[#F4F3FC] transition-colors text-xs"
                >
                  <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" aria-hidden="true">
                    <circle cx="8" cy="5.5" r="2.8" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M2.5 14c0-3 2.46-4.5 5.5-4.5s5.5 1.5 5.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  역할 선택
                  <ChevronDown className="w-3 h-3" strokeWidth={1.8} />
                </button>
              </div>
              <button
                type="submit"
                aria-label="전송"
                className="w-8 h-8 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] flex items-center justify-center text-white transition-colors shadow-sm shadow-[#4F46E5]/25"
              >
                <ArrowUp className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* Update notice — amber accent used sparingly */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFFBF0] border border-[#D4930A]/20 text-[#D4930A] text-[12px] font-medium">
            <Zap className="w-3 h-3 shrink-0 fill-[#D4930A]" strokeWidth={0} />
            회의록 문장정리 비서가 업데이트 되었습니다.
          </div>
        </div>

        {/* Shortcut tiles — 라벨만 기본, 호버 시 설명 등장 */}
        <div className="w-full max-w-2xl">
          <p className="text-[11px] text-[#A8A6C0] font-semibold uppercase tracking-widest mb-3 text-center">바로가기</p>
          <div className="grid grid-cols-4 gap-3">
            {SHORTCUTS.map((s) => (
              <ShortcutCard key={s.label} {...s} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── Export ───────────────────────────────────────────────── */

export function FinalDesign() {
  const [mode, setMode] = useState(0);
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white font-['Jeju_Samdasoo',sans-serif]">
      <Sidebar />
      <MainArea mode={mode} setMode={setMode} />
    </div>
  );
}
