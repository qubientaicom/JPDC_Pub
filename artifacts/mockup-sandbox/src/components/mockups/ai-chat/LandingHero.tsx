import { useState } from 'react';
import { Sparkles, Share, MoreHorizontal } from 'lucide-react';

/* ─── Design tokens ────────────────────────────────────────
   Split-layout landing page (inspired by ZEUS AI reference)
   Left:  #1C2C3E  dark navy panel  (hero + orbital + stats)
   Right: #DDE5F0  light blue-gray  (step-flow chat UI)
   Accent blue:  #3B82F6
   Accent light: #60A5FA
─────────────────────────────────────────────────────────── */

const SUGGESTIONS = [
  '휴가 신청서는 며칠 전까지 제출해야 해?',
  '출장비 정산은 복귀 후 며칠 이내에 신청해야 해?',
  '공문서 결재 라인은 몇 단계까지 올려야 해?',
];

const ASSISTANTS = [
  {
    emoji: '📝',
    label: '회의록 문장정리',
    desc: '회의 내용을 구조화된 문서로',
    grad: 'from-blue-500 to-indigo-500',
  },
  {
    emoji: '✉️',
    label: '이메일 문체변경',
    desc: '격식·비격식 문체 자동 변환',
    grad: 'from-violet-500 to-purple-500',
  },
  {
    emoji: '🌐',
    label: '번역',
    desc: '다국어 고품질 정확 번역',
    grad: 'from-emerald-500 to-teal-400',
  },
  {
    emoji: '📰',
    label: '보도자료',
    desc: '전문 보도자료 자동 작성',
    grad: 'from-orange-400 to-amber-400',
  },
];

/* ── Orbital dot visualization (SVG) ── */
function OrbitalViz() {
  return (
    <div className="flex-1 flex items-center justify-center overflow-hidden px-6 py-2 min-h-0">
      <svg viewBox="0 0 200 200" className="w-full max-w-[260px] max-h-[260px]" aria-hidden="true">
        {/* Background grid cross */}
        <line x1="100" y1="10" x2="100" y2="190" stroke="#2A4560" strokeWidth="0.6" />
        <line x1="10"  y1="100" x2="190" y2="100" stroke="#2A4560" strokeWidth="0.6" />

        {/* Outer ellipse */}
        <ellipse cx="100" cy="100" rx="84" ry="64"
          fill="none" stroke="#2E4E6E" strokeWidth="0.8" strokeDasharray="3 5" />
        {/* Mid ellipse */}
        <ellipse cx="100" cy="100" rx="56" ry="42"
          fill="none" stroke="#2E4E6E" strokeWidth="0.8" strokeDasharray="3 6" />
        {/* Inner circle */}
        <circle cx="100" cy="100" r="24"
          fill="none" stroke="#3A5F80" strokeWidth="0.8" />

        {/* Outer ellipse dots */}
        <circle cx="100" cy="36"  r="3"   fill="#4A7AA0" />
        <circle cx="176" cy="68"  r="2.5" fill="#4A7AA0" />
        <circle cx="184" cy="100" r="3"   fill="#5A90B8" />
        <circle cx="170" cy="134" r="2"   fill="#4A7AA0" />
        <circle cx="130" cy="158" r="2.5" fill="#4A7AA0" />
        <circle cx="100" cy="164" r="3"   fill="#4A7AA0" />
        <circle cx="60"  cy="156" r="2"   fill="#4A7AA0" />
        <circle cx="26"  cy="130" r="2.5" fill="#4A7AA0" />
        <circle cx="16"  cy="100" r="3"   fill="#5A90B8" />
        <circle cx="30"  cy="66"  r="2"   fill="#4A7AA0" />
        <circle cx="64"  cy="40"  r="2.5" fill="#4A7AA0" />

        {/* Mid ellipse dots */}
        <circle cx="100" cy="58"  r="2"   fill="#5A8AAA" />
        <circle cx="148" cy="72"  r="1.5" fill="#5A8AAA" />
        <circle cx="156" cy="100" r="2"   fill="#5A8AAA" />
        <circle cx="142" cy="128" r="1.5" fill="#5A8AAA" />
        <circle cx="100" cy="142" r="2"   fill="#5A8AAA" />
        <circle cx="58"  cy="128" r="1.5" fill="#5A8AAA" />
        <circle cx="44"  cy="100" r="2"   fill="#5A8AAA" />
        <circle cx="58"  cy="72"  r="1.5" fill="#5A8AAA" />

        {/* Inner circle dots */}
        <circle cx="100" cy="76"  r="1.5" fill="#6AA0C0" />
        <circle cx="120" cy="112" r="1.5" fill="#6AA0C0" />
        <circle cx="80"  cy="112" r="1.5" fill="#6AA0C0" />

        {/* Spoke lines from center */}
        <line x1="100" y1="100" x2="176" y2="68"  stroke="#3A6080" strokeWidth="0.6" opacity="0.7" />
        <line x1="100" y1="100" x2="26"  y2="130" stroke="#3A6080" strokeWidth="0.6" opacity="0.7" />
        <line x1="100" y1="100" x2="100" y2="164" stroke="#3A6080" strokeWidth="0.6" opacity="0.5" />
        <line x1="100" y1="100" x2="184" y2="100" stroke="#3A6080" strokeWidth="0.6" opacity="0.5" />

        {/* Center glow */}
        <circle cx="100" cy="100" r="10" fill="#1C3A54" />
        <circle cx="100" cy="100" r="6"  fill="#2A5A80" />
        <circle cx="100" cy="100" r="3"  fill="#60A5FA" />
      </svg>
    </div>
  );
}

/* ── Stats Card ── */
function StatsCard() {
  return (
    <div className="mx-5 mb-5 rounded-xl bg-[#16253380] border border-[#2A3D52] backdrop-blur-sm p-4 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[9px] text-[#5A7A9A] uppercase tracking-widest font-bold">STATISTICS</p>
          <p className="text-sm font-bold text-white leading-snug mt-0.5">주요 통계</p>
        </div>
        {/* 전체 비서 건수 — hero number */}
        <div className="text-right">
          <p className="text-[9px] text-[#5A7A9A] uppercase tracking-widest">전체 비서 건수</p>
          <p className="text-[22px] font-bold text-[#60A5FA] tabular-nums leading-tight mt-0.5">
            48<span className="text-base font-semibold">개</span>
          </p>
        </div>
      </div>

      {/* 2×2 grid */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="bg-[#1E3348] rounded-lg px-3 py-2">
          <p className="text-[9px] text-[#5A7A9A] mb-1">오늘 대화수</p>
          <p className="text-base font-bold text-white tabular-nums">8,432<span className="text-[10px] font-normal text-[#5A7A9A] ml-0.5">건</span></p>
        </div>
        <div className="bg-[#1E3348] rounded-lg px-3 py-2">
          <p className="text-[9px] text-[#5A7A9A] mb-1">오늘 사용자수</p>
          <p className="text-base font-bold text-white tabular-nums">3,187<span className="text-[10px] font-normal text-[#5A7A9A] ml-0.5">명</span></p>
        </div>
      </div>

      {/* 누적 대화수 — full-width highlight */}
      <div className="bg-[#1A3B5C] rounded-lg px-3 py-2 flex items-center justify-between">
        <p className="text-[10px] text-[#60A5FA] font-semibold">누적 대화수</p>
        <p className="text-lg font-bold text-[#60A5FA] tabular-nums">1,284,710<span className="text-[10px] font-normal ml-0.5">건</span></p>
      </div>
    </div>
  );
}

/* ── Left Panel ── */
function LeftPanel() {
  return (
    <div className="w-[400px] shrink-0 bg-[#1C2C3E] flex flex-col h-full font-['Jeju_Samdasoo',sans-serif]">
      {/* Topbar */}
      <div className="h-11 flex items-center gap-2 px-5 border-b border-[#253545] shrink-0">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center shadow-sm shadow-[#3B82F6]/40">
          <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5" aria-hidden="true">
            <path d="M7 1.5l1.2 3.3H12L9.2 6.8l1 3.2L7 8.2 3.8 10l1-3.2L2 4.8h3.8L7 1.5z"
              fill="white" fillOpacity="0.95" />
          </svg>
        </div>
        <span className="text-white font-bold text-sm tracking-tight">JPDC AI</span>
        <span className="text-[9px] font-bold text-[#3B82F6] bg-[#1A3050] border border-[#2A4A78] px-1.5 py-0.5 rounded-md">
          베타오픈
        </span>
        <span className="text-[10px] text-[#4A6A8A] ml-1 truncate">정식 오픈까지 무료로 사용해 보세요.</span>
      </div>

      {/* Hero text */}
      <div className="px-6 pt-8 shrink-0">
        <p className="text-[10px] text-[#3B82F6] font-bold uppercase tracking-widest mb-4 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] inline-block" aria-hidden="true" />
          GENERATIVE AI ASSISTANT
        </p>
        <h1 className="font-bold leading-[1.1] tracking-tight">
          <span className="block text-[34px] text-white">모든 작업을</span>
          <span className="block text-[34px] text-[#60A5FA]">대화로 해결하다.</span>
        </h1>
        <p className="mt-4 text-[13px] text-[#7A9AB8] leading-relaxed">
          흩어진 정보를 자연어 한 문장으로 탐색하고,<br />
          분석과 작성까지 한 번에 답해드립니다.
        </p>
      </div>

      {/* Orbital visualization fills remaining space */}
      <OrbitalViz />

      {/* Stats card */}
      <StatsCard />
    </div>
  );
}

/* ── Right Panel ── */
function RightPanel() {
  const [query, setQuery] = useState('');

  return (
    <div className="flex-1 bg-white flex flex-col h-full min-w-0 font-['Jeju_Samdasoo',sans-serif] relative">

      {/* Top-right action group */}
      <div className="absolute top-4 right-6 z-10 flex items-center gap-2">
        <button
          type="button"
          className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#3B82F6] hover:bg-[#2563EB] text-white text-[11px] font-bold transition-colors shadow-sm shadow-[#3B82F6]/30"
        >
          <Sparkles className="w-3.5 h-3.5" />
          브리핑
        </button>
        <button type="button" aria-label="공유" className="text-[#8AABBB] hover:text-[#3B82F6] transition-colors p-2 rounded-md hover:bg-[#EBF3FF]">
          <Share className="w-4 h-4" />
        </button>
        <button type="button" aria-label="더 보기" className="text-[#8AABBB] hover:text-[#3B82F6] transition-colors p-2 rounded-md hover:bg-[#EBF3FF]">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

        {/* Step 01 */}
        <div className="px-10 pt-10 pb-0">
          <p className="text-[10px] text-[#7090AA] font-bold tracking-widest uppercase mb-3">
            01 · 무엇을 도와드릴까요?
          </p>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-bold text-[#1A2D3D]">AI에게 질문하기</h2>
          </div>

          {/* Input card */}
          <div className="bg-white rounded-xl border border-[#C0D0E0] shadow-sm overflow-hidden">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-5 pt-5 pb-3 bg-transparent border-none outline-none text-[#1A2D3D] placeholder:text-[#A0B8CC] resize-none text-sm leading-relaxed font-['Jeju_Samdasoo',sans-serif]"
              placeholder="분석하고 싶은 내용을 자유롭게 입력하세요..."
              rows={4}
              aria-label="질문 입력"
            />
            <div className="flex items-center justify-end px-4 pb-4 pt-1">
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-bold transition-colors shadow-sm shadow-[#3B82F6]/30"
              >
                질문하기
                <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Step 02 */}
        <div className="px-10 pt-12">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] text-[#7090AA] font-bold tracking-widest uppercase">
              02 · 이런 질문은 어떠세요?
            </p>
            <span className="text-[10px] text-[#8AABBB]">클릭해서 바로 사용</span>
          </div>

          <div className="flex flex-col gap-2">
            {SUGGESTIONS.map((chip, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setQuery(chip)}
                className="text-left w-full px-4 py-3 bg-white/60 hover:bg-white border border-[#C0D0E0] hover:border-[#3B82F6] rounded-xl text-[13px] text-[#2A4060] leading-snug transition-all hover:shadow-sm font-['Jeju_Samdasoo',sans-serif]"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Step 03 — Assistant cards */}
        <div className="px-10 pt-12 pb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] text-[#7090AA] font-bold tracking-widest uppercase">
              03 · 비서를 선택하세요
            </p>
            <span className="text-[10px] text-[#8AABBB]">총 48개 비서 운영 중</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {ASSISTANTS.map((a) => (
              <button
                key={a.label}
                type="button"
                className="flex items-center gap-3.5 p-4 bg-white/70 hover:bg-white border border-[#C0D0E0] hover:border-[#3B82F6] rounded-xl transition-all hover:shadow-md group text-left"
              >
                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${a.grad} flex items-center justify-center text-xl shadow-sm shrink-0`}>
                  {a.emoji}
                </div>
                {/* Text */}
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-[#1A2D3D] group-hover:text-[#1A6DF0] transition-colors leading-snug">
                    {a.label}
                  </p>
                  <p className="text-[11px] text-[#6A8AA8] mt-0.5 leading-snug">{a.desc}</p>
                </div>
                {/* Arrow */}
                <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-[#A0B8CC] group-hover:text-[#3B82F6] transition-colors ml-auto shrink-0" aria-hidden="true">
                  <path d="M4 8h8M9 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* LIVE indicator footer — always visible */}
      <div className="px-10 py-4 shrink-0 flex items-center gap-2.5 border-t border-[#C8D5E4]">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D0E8FF] border border-[#A8CCEE]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" aria-hidden="true" />
          <span className="text-[10px] text-[#3B82F6] font-bold tracking-wider">LIVE</span>
        </span>
        <span className="text-[11px] text-[#7090AA] font-['Jeju_Samdasoo',sans-serif]">
          실시간 데이터 연동 · ICP-MS로 수용액 금속이온 정량 분석 중
        </span>
      </div>
    </div>
  );
}

/* ── Export ── */
export function LandingHero() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <LeftPanel />
      <RightPanel />
    </div>
  );
}
