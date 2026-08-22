import { useState } from 'react';
import {
  Plus, Search, Settings, ArrowUp, ChevronDown,
  Paperclip, Mic, Sparkles, Zap, Globe, Share, MoreHorizontal, Store,
} from 'lucide-react';

/* ─── Design tokens ───────────────────────────────────────────
   Primary:      #4F46E5  (deep indigo)
   Gold:         #D4930A  (warm amber — from Design 2)
   Bg main:      #F9F8FF  (from Design 1)
   Sidebar:      #FFFFFF
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

const SHORTCUTS = [
  { label: 'AI 글쓰기',  sub: '블로그·기획서·이메일', grad: 'from-pink-500 to-rose-400',     emoji: '✍️' },
  { label: '코드 분석',  sub: '디버깅·최적화·리뷰',   grad: 'from-blue-500 to-indigo-500',   emoji: '💻' },
  { label: '번역',       sub: '다국어 고품질 번역',    grad: 'from-emerald-500 to-teal-400',  emoji: '🌐' },
  { label: '문서 요약',  sub: 'PDF·보고서·계약서',     grad: 'from-orange-400 to-amber-400',  emoji: '📄' },
];

/* ── Sidebar ──────────────────────────────────────────────── */

function Sidebar() {
  return (
    <aside className="w-[240px] bg-[#F9F8FF] border-r border-[#E4E2F0] flex flex-col h-full shrink-0">
      {/* Logo row */}
      <div className="h-12 flex items-center gap-2.5 px-4 border-b border-[#E4E2F0] shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4F46E5] to-[#7C6FF7] flex items-center justify-center shadow-sm shadow-[#4F46E5]/30">
          <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
            <circle cx="10" cy="10" r="7" fill="white" fillOpacity="0.2"/>
            <path d="M7 10.5l2.5 2.5 4-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="font-bold text-[#1A1826] text-sm tracking-tight">JPDC AI</span>
      </div>

      {/* New chat + search */}
      <div className="px-3 pt-3 pb-2 shrink-0 flex flex-col gap-2">
        <button
          type="button"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white transition-colors text-xs font-semibold shadow-sm shadow-[#4F46E5]/25"
        >
          <Plus className="w-3.5 h-3.5 shrink-0" />
          새 대화 시작
        </button>
        <button
          type="button"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#6B6882] hover:bg-[#F0EEFF] hover:text-[#1A1826] transition-colors text-xs font-semibold"
        >
          <Store className="w-3.5 h-3.5 shrink-0 text-[#A8A6C0]" />
          비서마켓
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#E4E2F0] text-[#A8A6C0]">
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="text-xs">대화 검색...</span>
        </div>
      </div>

      {/* History groups */}
      <div className="flex-1 overflow-y-auto px-2 pb-3" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C6FF7] flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
            김
          </div>
          <div>
            <p className="text-xs font-semibold text-[#1A1826] leading-none">김동현</p>
          </div>
        </div>
        <button type="button" aria-label="설정" className="text-[#A8A6C0] hover:text-[#1A1826] transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}

/* ── Main Area ────────────────────────────────────────────── */

function MainArea({ mode, setMode }: { mode: number; setMode: (m: number) => void }) {
  return (
    <div className="flex-1 flex flex-col h-full bg-white min-w-0">

      {/* Topbar */}
      <div className="h-12 flex items-center justify-end px-6 bg-white border-b border-[#E4E2F0] shrink-0">
        <div className="flex items-center gap-2">
          <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold transition-colors shadow-sm shadow-[#4F46E5]/25">
            <Sparkles className="w-3.5 h-3.5" />
            브리핑
          </button>
          <button type="button" aria-label="공유" className="text-[#A8A6C0] hover:text-[#6B6882] transition-colors p-2 rounded-lg hover:bg-[#F0EEFF]">
            <Share className="w-4 h-4" />
          </button>
          <button type="button" aria-label="더 보기" className="text-[#A8A6C0] hover:text-[#6B6882] transition-colors p-2 rounded-lg hover:bg-[#F0EEFF]">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-10 pb-6 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>

        {/* Hero headline */}
        <div className="text-center mb-7">
          <h1 className="font-bold tracking-tight leading-[1.08]">
            <span className="block text-[52px] text-[#1A1826]">무엇을</span>
            {/* Gradient text — upgraded from flat color */}
            <span
              className="block text-[52px]"
              style={{
                background: 'linear-gradient(120deg, #4F46E5 0%, #7C6FF7 60%, #D4930A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              만들어볼까요?
            </span>
          </h1>
        </div>

        {/* Mode tab bar — Design 3's best UX */}
        <div
          role="tablist"
          aria-label="대화 모드"
          className="flex gap-1 p-1 rounded-xl bg-white border border-[#E4E2F0] mb-6 shadow-sm"
        >
          {MODES.map((m, i) => (
            <button
              key={m}
              role="tab"
              type="button"
              aria-selected={mode === i}
              onClick={() => setMode(i)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === i
                  ? 'bg-[#4F46E5] text-white shadow-sm shadow-[#4F46E5]/30'
                  : 'text-[#6B6882] hover:text-[#1A1826] hover:bg-[#F4F3FC]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Input — Design 3's toolbar, Design 1's glow */}
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
                  <Paperclip className="w-[15px] h-[15px]" />
                </button>
                <button type="button" aria-label="음성 입력" className="p-1.5 rounded-lg text-[#A8A6C0] hover:text-[#4F46E5] hover:bg-[#F4F3FC] transition-colors">
                  <Mic className="w-[15px] h-[15px]" />
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
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
              <button
                type="submit"
                aria-label="전송"
                className="w-8 h-8 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] flex items-center justify-center text-white transition-colors shadow-sm shadow-[#4F46E5]/30"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Notice */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#F0EEFF] border border-[#4F46E5]/20 text-[#4F46E5] text-[12px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-pulse shrink-0" aria-hidden="true" />
            회의록 문장정리 비서가 업데이트 되었습니다.
          </div>
        </div>

        {/* Shortcut tiles — Design 3's best discoverability */}
        <div className="w-full max-w-2xl">
          <p className="text-[11px] text-[#A8A6C0] font-semibold uppercase tracking-widest mb-3 text-center">바로가기</p>
          <div className="grid grid-cols-4 gap-3">
            {SHORTCUTS.map((s) => (
              <button
                key={s.label}
                type="button"
                className="flex flex-col items-center gap-2.5 p-4 bg-white rounded-xl border border-[#E4E2F0] hover:border-[#C7C3F7] hover:shadow-lg hover:shadow-[#4F46E5]/6 transition-all"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center text-xl shadow-sm`}>
                  {s.emoji}
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-[#1A1826]">{s.label}</p>
                  <p className="text-[10px] text-[#A8A6C0] mt-0.5 leading-snug">{s.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── Export ───────────────────────────────────────────────── */

export function BestOf() {
  const [mode, setMode] = useState(0);
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white font-['Jeju_Samdasoo',sans-serif]">
      <Sidebar />
      <MainArea mode={mode} setMode={setMode} />
    </div>
  );
}
