import { useState } from 'react';
import {
  Plus, Search, Settings, ArrowUp, ChevronDown,
  Paperclip, Mic, Sparkles, Share, MoreHorizontal, Star, Users, Store,
} from 'lucide-react';

/* ─── Design 4 — "비서 마켓플레이스" ─────────────────────────────
   Based on Design 2 (Best Of): headline + input pulled up top,
   shortcut tiles replaced with a marketplace-style assistant
   showcase (추천 · 인기 · 신규), like a product storefront.
   Palette matches Design 2:
   Primary: #4F46E5   Gold: #D4930A   Bg: #F9F8FF
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

/* ── Marketplace data ── */
const RECOMMENDED = [
  { label: '회의록 문장정리', desc: '회의 내용을 구조화된 문서로', grad: 'from-blue-500 to-indigo-500', emoji: '📝', rating: 4.9, users: '12.4k' },
  { label: '이메일 문체변경', desc: '격식·비격식 문체 자동 변환', grad: 'from-violet-500 to-purple-500', emoji: '✉️', rating: 4.8, users: '9.1k' },
  { label: '보도자료 초안', desc: '전문 보도자료 자동 작성', grad: 'from-orange-400 to-amber-400', emoji: '📰', rating: 4.7, users: '6.3k' },
  { label: '계약서 검토', desc: '핵심 조항 리스크 자동 점검', grad: 'from-slate-500 to-slate-700', emoji: '📄', rating: 4.9, users: '5.8k' },
];

const POPULAR = [
  { label: '코드 리뷰 비서', desc: '버그·스타일 자동 리뷰', grad: 'from-indigo-500 to-blue-600', emoji: '💻', users: '18.2k' },
  { label: '번역 비서', desc: '다국어 고품질 번역', grad: 'from-emerald-500 to-teal-400', emoji: '🌐', users: '15.7k' },
  { label: '데이터 분석 비서', desc: '차트·인사이트 자동 생성', grad: 'from-cyan-500 to-sky-500', emoji: '📊', users: '11.9k' },
  { label: '마케팅 카피 비서', desc: '광고 문구 A/B 초안 생성', grad: 'from-rose-500 to-pink-500', emoji: '📣', users: '10.4k' },
];

const NEW_ASSISTANTS = [
  { label: '법률 자문 비서', desc: '판례 검색과 조항 해설', grad: 'from-amber-500 to-[#D4930A]', emoji: '⚖️' },
  { label: '회계 정산 비서', desc: '증빙 정리와 정산서 자동화', grad: 'from-lime-500 to-green-600', emoji: '💰' },
  { label: 'HR 채용 비서', desc: '이력서 스크리닝과 질문지', grad: 'from-fuchsia-500 to-purple-600', emoji: '🧑‍💼' },
  { label: '3D 모델링 비서', desc: '설계 도면 기반 목업 생성', grad: 'from-sky-600 to-indigo-600', emoji: '🧊' },
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

/* ── Marketplace row ──────────────────────────────────────── */

function MarketRow({
  title,
  badge,
  items,
  showRank = false,
  showRating = false,
  showNewTag = false,
}: {
  title: string;
  badge: string;
  items: { label: string; desc: string; grad: string; emoji: string; rating?: number; users?: string }[];
  showRank?: boolean;
  showRating?: boolean;
  showNewTag?: boolean;
}) {
  return (
    <div className="mb-7 last:mb-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-[13px] font-bold text-[#1A1826]">{title}</h3>
          <span className="text-[9px] font-bold text-[#4F46E5] bg-[#F0EEFF] px-1.5 py-0.5 rounded-md uppercase tracking-wider">
            {badge}
          </span>
        </div>
        <button type="button" className="text-[11px] text-[#A8A6C0] hover:text-[#4F46E5] transition-colors font-medium">
          전체보기 →
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {items.map((item, i) => (
          <button
            key={item.label}
            type="button"
            className="relative flex flex-col items-start gap-2.5 p-4 bg-white rounded-xl border border-[#E4E2F0] hover:border-[#C7C3F7] hover:shadow-lg hover:shadow-[#4F46E5]/6 hover:-translate-y-0.5 transition-all text-left"
          >
            {showRank && (
              <span className="absolute top-3 right-3 text-[10px] font-bold text-[#A8A6C0]">#{i + 1}</span>
            )}
            {showNewTag && (
              <span className="absolute top-3 right-3 text-[9px] font-bold text-white bg-[#D4930A] px-1.5 py-0.5 rounded-full">
                NEW
              </span>
            )}
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.grad} flex items-center justify-center text-xl shadow-sm`}>
              {item.emoji}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#1A1826] leading-snug">{item.label}</p>
              <p className="text-[10px] text-[#A8A6C0] mt-0.5 leading-snug">{item.desc}</p>
            </div>

            {(showRating || item.users) && (
              <div className="flex items-center gap-2 mt-0.5">
                {showRating && item.rating && (
                  <span className="flex items-center gap-0.5 text-[10px] text-[#D4930A] font-semibold">
                    <Star className="w-3 h-3 fill-[#D4930A]" />
                    {item.rating}
                  </span>
                )}
                {item.users && (
                  <span className="flex items-center gap-0.5 text-[10px] text-[#A8A6C0]">
                    <Users className="w-3 h-3" />
                    {item.users}
                  </span>
                )}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
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

      {/* Content — headline & input pulled up top, marketplace below */}
      <div className="flex-1 flex flex-col items-center px-10 pt-8 pb-8 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>

        {/* Hero headline — compact, top-aligned */}
        <div className="text-center mb-5">
          <h1 className="font-bold tracking-tight leading-[1.1]">
            <span className="block text-[34px] text-[#1A1826]">
              무엇을{' '}
              <span
                style={{
                  background: 'linear-gradient(120deg, #4F46E5 0%, #7C6FF7 60%, #D4930A 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                만들어볼까요?
              </span>
            </span>
          </h1>
        </div>

        {/* Mode tab bar */}
        <div
          role="tablist"
          aria-label="대화 모드"
          className="flex gap-1 p-1 rounded-xl bg-white border border-[#E4E2F0] mb-4 shadow-sm"
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

        {/* Input */}
        <div className="w-full max-w-2xl mb-8">
          <div className="bg-white rounded-2xl border border-[#E4E2F0] shadow-sm hover:border-[#C7C3F7] focus-within:border-[#4F46E5] focus-within:shadow-[0_0_0_3px_rgba(79,70,229,0.08)] transition-all">
            <textarea
              className="w-full px-5 pt-4 pb-2 bg-transparent border-none outline-none text-[#1A1826] placeholder:text-[#A8A6C0] resize-none text-sm leading-relaxed"
              placeholder="작업을 설명하거나, 질문하거나, 파일을 첨부하세요..."
              rows={2}
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

        {/* Marketplace — 비서 스토어 */}
        <div className="w-full max-w-[880px]">
          <div className="relative flex items-center justify-center mb-5">
            <h2 className="text-base font-bold text-[#1A1826]">필요한 비서를 찾아보세요</h2>
            <span className="absolute right-0 text-[11px] text-[#A8A6C0]">총 48개 비서 운영 중</span>
          </div>

          <MarketRow title="추천 비서" badge="RECOMMENDED" items={RECOMMENDED} showRating />
          <MarketRow title="인기 비서" badge="POPULAR" items={POPULAR} showRank />
          <MarketRow title="신규 비서" badge="NEW" items={NEW_ASSISTANTS} showNewTag />
        </div>

      </div>
    </div>
  );
}

/* ── Export ───────────────────────────────────────────────── */

export function MarketplaceHub() {
  const [mode, setMode] = useState(0);
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white font-['Jeju_Samdasoo',sans-serif]">
      <Sidebar />
      <MainArea mode={mode} setMode={setMode} />
    </div>
  );
}
