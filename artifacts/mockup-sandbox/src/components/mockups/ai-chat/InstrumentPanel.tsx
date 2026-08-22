import React, { useState, useEffect } from 'react';

// Icons
const HexagonIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const GearIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChatBubbleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M21 11.5C21 16.1944 16.9706 20 12 20C10.609 20 9.29255 19.7042 8.11545 19.1678C7.63852 18.9507 7.09848 18.9328 6.60803 19.1171L3.92131 20.1264C3.42436 20.3131 2.92482 19.8242 3.10098 19.3248L4.03264 16.6841C4.20573 16.1936 4.18023 15.6548 3.96105 15.1843C3.36192 13.901 3 12.4411 3 10.875C3 6.18056 7.02944 2.375 12 2.375C16.9706 2.375 21 6.18056 21 10.875Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DocumentIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TranslateIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M17 3L21 7L17 11M3 13L7 17L3 21M21 7H7M3 17H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowUpRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const ShareIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 16V4M12 4L7 9M12 4l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MoreIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="5" cy="12" r="1.6"/>
    <circle cx="12" cy="12" r="1.6"/>
    <circle cx="19" cy="12" r="1.6"/>
  </svg>
);

const MODES = [
  { label: 'CHAT',     placeholder: '무엇이든 물어보세요.',              action: 'SEND',     icon: ChatBubbleIcon },
  { label: 'DOCUMENT', placeholder: '작성할 문서의 주제와 형식을 입력하세요.', action: 'GENERATE', icon: DocumentIcon },
  { label: 'TRANSLATE',placeholder: '번역할 텍스트를 붙여넣으세요.',        action: 'EXECUTE',  icon: TranslateIcon },
  { label: 'MINUTES',  placeholder: '회의 내용 또는 녹취록을 붙여넣으세요.', action: 'PROCESS',  icon: ClockIcon },
];

/* ─── Design 4 palette ──────────────────────────────────
   Primary:      #4F46E5  (deep indigo)
   Gold:         #D4930A  (warm amber)
   Bg main:      #F9F8FF
   Sidebar:      #FFFFFF
   Border:       #E4E2F0
   Text primary: #1A1826
   Text muted:   #6B6882
   Text subtle:  #A8A6C0
   Active bg:    #F0EEFF  (indigo-tinted surface)
─────────────────────────────────────────────────────── */

const SEARCH_ICON = (
  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
  </svg>
);

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

function Sidebar() {
  return (
    <div className="w-[240px] bg-[#F9F8FF] border-r border-[#E4E2F0] flex flex-col h-full shrink-0" style={{ scrollbarWidth: 'none' }}>
      {/* Logo row */}
      <div className="h-10 flex items-center gap-2.5 px-4 border-b border-[#E4E2F0] shrink-0">
        <HexagonIcon className="w-4 h-4 text-[#4F46E5]" />
        <span className="font-['Jeju_Samdasoo',sans-serif] font-semibold text-[#1A1826] text-sm tracking-tight">
          JPDC AI
        </span>
      </div>

      {/* New session button */}
      <div className="px-3 pt-3 pb-2 shrink-0">
        <button
          type="button"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E4E2F0] bg-white hover:border-[#4F46E5]/40 hover:bg-[#F0EEFF] text-[#6B6882] hover:text-[#4F46E5] transition-colors text-xs font-['Jeju_Samdasoo',sans-serif] font-medium"
        >
          <PlusIcon className="w-3.5 h-3.5 shrink-0" />
          새 세션
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pb-3 shrink-0">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#E4E2F0] text-[#A8A6C0]">
          {SEARCH_ICON}
          <span className="text-xs font-['Jeju_Samdasoo',sans-serif]">세션 검색...</span>
        </div>
      </div>

      {/* History groups */}
      <div className="flex-1 overflow-y-auto px-2 pb-3" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {HISTORY_GROUPS.map((group) => (
          <div key={group.label} className="mb-3">
            <p className="px-2 py-1 text-[10px] font-['Jeju_Samdasoo',sans-serif] uppercase tracking-widest text-[#A8A6C0]">
              {group.label}
            </p>
            {group.items.map((item, idx) => (
              <button
                key={idx}
                type="button"
                className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left transition-colors group ${
                  item.active
                    ? 'bg-[#F0EEFF] border border-[#4F46E5]/30'
                    : 'hover:bg-[#F9F8FF] border border-transparent'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium font-['Jeju_Samdasoo',sans-serif] shrink-0 ${
                    item.active
                      ? 'bg-[#4F46E5] text-white'
                      : 'bg-[#EEF0FF] text-[#6B6882] group-hover:bg-[#E4E2FF]'
                  }`}
                >
                  {item.initials}
                </span>
                <span
                  className={`text-xs font-['Jeju_Samdasoo',sans-serif] leading-snug truncate ${
                    item.active ? 'text-[#1A1826] font-medium' : 'text-[#6B6882]'
                  }`}
                >
                  {item.title}
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom: settings + user */}
      <div className="border-t border-[#E4E2F0] px-3 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#4F46E5] to-[#818CF8] flex items-center justify-center text-[10px] font-medium font-['Jeju_Samdasoo',sans-serif] text-white">
            U
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-['Jeju_Samdasoo',sans-serif] font-medium text-[#1A1826] leading-none">사용자</span>
          </div>
        </div>
        <button type="button" aria-label="Settings" className="text-[#A8A6C0] hover:text-[#1A1826] transition-colors">
          <GearIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function DialKnob({ mode, setMode }: { mode: number, setMode: React.Dispatch<React.SetStateAction<number>> }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleClick = () => {
    setMode((prev) => (prev + 1) % 4);
  };

  const modeLabel = MODES[mode].label;

  return (
    <div className="w-[72px] h-full flex flex-col items-center justify-center shrink-0 border-r border-[#E4E2F0]">
      <button 
        type="button" 
        onClick={handleClick}
        className="relative w-14 h-14 flex items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
        aria-label={`${modeLabel} mode, click to change mode`}
      >
        <div className="absolute inset-0 rounded-full border border-[#E4E2F0]" />
        
        {/* Tick marks N, E, S, W */}
        <div className={`absolute top-0 w-[2px] h-1 rounded-full ${mode === 0 ? 'bg-[#4F46E5]' : 'bg-[#E4E2F0]'}`} />
        <div className={`absolute right-0 w-1 h-[2px] rounded-full ${mode === 1 ? 'bg-[#D4930A]' : 'bg-[#E4E2F0]'}`} />
        <div className={`absolute bottom-0 w-[2px] h-1 rounded-full ${mode === 2 ? 'bg-[#4F46E5]' : 'bg-[#E4E2F0]'}`} />
        <div className={`absolute left-0 w-1 h-[2px] rounded-full ${mode === 3 ? 'bg-[#D4930A]' : 'bg-[#E4E2F0]'}`} />

        <div 
          className="w-7 h-7 rounded-full bg-[radial-gradient(circle_at_center,#F0EEFF_0%,#E4E2FF_100%)] shadow-sm relative flex items-start justify-center pt-1"
          style={{ 
            transform: `rotate(${mode * 90}deg)`,
            transition: reducedMotion ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] shadow-[0_0_4px_rgba(79,70,229,0.5)]" />
        </div>
      </button>

      <div className="mt-1.5 text-[10px] uppercase font-['Jeju_Samdasoo',sans-serif] text-[#4F46E5] tracking-wider leading-none">
        {modeLabel}
      </div>
    </div>
  );
}

function CommandBar({ mode, setMode }: { mode: number, setMode: React.Dispatch<React.SetStateAction<number>> }) {
  const currentMode = MODES[mode];
  const ModeIcon = currentMode.icon;

  return (
    <div className="h-[96px] bg-white border-t border-[#E4E2F0] flex items-stretch shrink-0 w-full">
      <DialKnob mode={mode} setMode={setMode} />
      
      <div className="flex-1 flex items-center px-4 bg-white border-r border-[#E4E2F0]">
        <div className="text-[#A8A6C0] mr-3">
          <ModeIcon className="w-5 h-5" />
        </div>
        <textarea 
          className="flex-1 bg-transparent border-none outline-none text-[#1A1826] placeholder:text-[#A8A6C0] resize-none h-[64px] font-['Jeju_Samdasoo',sans-serif] text-sm leading-[1.6] py-2"
          placeholder={currentMode.placeholder}
          aria-label={currentMode.label}
        />
      </div>

      <div className="px-4 flex flex-col justify-center items-end bg-white">
        <div className="font-['Jeju_Samdasoo',sans-serif] text-[13px] text-[#1A1826] leading-none mb-1.5">
          1,247
        </div>
        <div className="font-['Jeju_Samdasoo',sans-serif] text-[10px] text-[#A8A6C0] uppercase tracking-wider leading-none">
          tokens
        </div>
      </div>

      <div className="p-3 bg-white flex items-center justify-center shrink-0 w-[96px]">
        <button 
          type="submit"
          className="w-full h-full bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg flex flex-col items-center justify-center gap-1 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2 focus-visible:ring-offset-white shadow-sm shadow-[#4F46E5]/25"
          aria-label={currentMode.action}
        >
          <span className="font-['Jeju_Samdasoo',sans-serif] font-semibold text-xs uppercase leading-none mt-0.5">
            {currentMode.action}
          </span>
          <ArrowUpRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ── Welcome stream (landing / first-open state) ─────────────────── */

const SUGGESTION_CARDS = [
  {
    modeIndex: 0,
    tag: 'CHAT',
    title: '전문가 수준의 분석과 판단',
    desc: '복잡한 기술 문제, 전략적 결정, 심층 리서치 질문을 시작하세요.',
  },
  {
    modeIndex: 1,
    tag: 'DOCUMENT',
    title: '문서 초안을 즉시 생성',
    desc: '보고서, 기획서, 제안서 — 주제와 형식만 입력하면 완성됩니다.',
  },
  {
    modeIndex: 2,
    tag: 'TRANSLATE',
    title: '맥락을 살린 고품질 번역',
    desc: '기술 문서, 계약서, 마케팅 카피를 정확한 맥락으로 번역합니다.',
  },
  {
    modeIndex: 3,
    tag: 'MINUTES',
    title: '회의록 자동 정리',
    desc: '녹취록이나 메모를 붙여넣으면 구조화된 회의록으로 변환됩니다.',
  },
];

function SuggestionCard({
  tag, title, desc, active, onClick,
}: { tag: string; title: string; desc: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full text-left p-5 rounded-lg border transition-all duration-200 outline-none
        focus-visible:ring-2 focus-visible:ring-[#4F46E5]
        ${active
          ? 'bg-[#F0EEFF] border-[#4F46E5]/40'
          : 'bg-white border-[#E4E2F0] hover:bg-[#F0EEFF] hover:border-[#4F46E5]/30'
        }`}
      aria-pressed={active}
    >
      <span className={`inline-block font-['Jeju_Samdasoo',sans-serif] text-[10px] tracking-widest uppercase mb-3 ${
        active ? 'text-[#4F46E5]' : 'text-[#D4930A]'
      }`}>
        {tag}
      </span>
      <p className="font-['Jeju_Samdasoo',sans-serif] font-semibold text-[13px] text-[#1A1826] leading-snug mb-2">
        {title}
      </p>
      <p className="font-['Jeju_Samdasoo',sans-serif] text-[12px] text-[#6B6882] leading-relaxed">
        {desc}
      </p>
    </button>
  );
}

function WelcomeStream({ mode, setMode }: { mode: number; setMode: (m: number) => void }) {
  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <div className="h-10 flex items-center justify-between px-6 border-b border-[#E4E2F0] bg-white shrink-0">
        <div />
        <div className="flex items-center gap-2">
          <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-['Jeju_Samdasoo',sans-serif] font-semibold transition-colors shadow-sm shadow-[#4F46E5]/25">
            <SparklesIcon className="w-3.5 h-3.5" />
            브리핑
          </button>
          <button type="button" aria-label="공유" className="text-[#A8A6C0] hover:text-[#6B6882] transition-colors p-2 rounded-lg hover:bg-[#F0EEFF]">
            <ShareIcon className="w-4 h-4" />
          </button>
          <button type="button" aria-label="더 보기" className="text-[#A8A6C0] hover:text-[#6B6882] transition-colors p-2 rounded-lg hover:bg-[#F0EEFF]">
            <MoreIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero + suggestion grid */}
      <div className="flex-1 flex flex-col items-center justify-center px-12 pb-4 overflow-y-auto">
        {/* Headline */}
        <div className="w-full max-w-2xl mb-10 text-center">
          {/* Decorative gauge line */}
          <div className="flex items-center justify-center gap-3 mb-8" aria-hidden="true">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#E4E2F0]" />
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4, 5, 6].map(i => (
                <div
                  key={i}
                  className="w-px rounded-full bg-[#D0CEED]"
                  style={{ height: i === 3 ? 14 : i === 1 || i === 5 ? 9 : 6 }}
                />
              ))}
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#E4E2F0]" />
          </div>

          <h1 className="font-['Jeju_Samdasoo',sans-serif] font-bold leading-[1.05] tracking-tight">
            <span className="block text-[52px] text-[#1A1826]">무엇을</span>
            <span className="block text-[52px] text-[#4F46E5]">만들겠습니까?</span>
          </h1>
        </div>

        {/* 2 × 2 suggestion grid */}
        <div className="w-full max-w-2xl grid grid-cols-2 gap-3">
          {SUGGESTION_CARDS.map(card => (
            <SuggestionCard
              key={card.tag}
              tag={card.tag}
              title={card.title}
              desc={card.desc}
              active={mode === card.modeIndex}
              onClick={() => setMode(card.modeIndex)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function InstrumentPanel() {
  const [mode, setMode] = useState(0);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F9F8FF]">
      <Sidebar />

      <div className="flex-1 flex flex-col h-full min-w-0">
        <WelcomeStream mode={mode} setMode={setMode} />
        <CommandBar mode={mode} setMode={setMode} />
      </div>
    </div>
  );
}
