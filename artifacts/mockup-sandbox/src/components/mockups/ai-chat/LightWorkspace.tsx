import { useState } from 'react';
import {
  Plus, Search,
  Settings, ArrowUp, ChevronDown, Paperclip, Mic,
  Sparkles, User, Share, MoreHorizontal,
} from 'lucide-react';

/* ─── Design 4 palette ──────────────────────────────────
   Primary:      #4F46E5  (deep indigo)
   Gold:         #D4930A  (warm amber)
   Bg main:      #F9F8FF  / White
   Sidebar:      #F9F8FF
   Border:       #E4E2F0
   Text primary: #1A1826
   Text muted:   #6B6882
   Text subtle:  #A8A6C0
   Active bg:    #F0EEFF  (indigo tint)
─────────────────────────────────────────────────────── */

/* ─── Side Panel ─────────────────────────────────────── */

const FEATURED = [
  {
    label: 'AI 글쓰기',
    sub: '블로그·기획서·이메일',
    grad: 'from-pink-500 to-rose-400',
    icon: '✍️',
  },
  {
    label: '코드 도우미',
    sub: '분석·디버깅·리뷰',
    grad: 'from-[#4F46E5] to-[#818CF8]',
    icon: '💻',
  },
];

const RECENT = [
  { id: 1, title: '마케팅 기획서 초안 작성', time: '방금 전', active: true },
  { id: 2, title: 'React 성능 최적화 방법', time: '1시간 전' },
  { id: 3, title: '영문 이메일 번역 요청', time: '어제' },
  { id: 4, title: '파이썬 크롤러 코드 리뷰', time: '2일 전' },
];

function SidePanel() {
  return (
    <aside
      aria-label="사이드 패널"
      className="w-[256px] h-full bg-[#F9F8FF] border-r border-[#E4E2F0] flex flex-col flex-shrink-0"
    >
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

      {/* New chat button */}
      <div className="p-4">
        <button
          type="button"
          className="w-full flex items-center gap-2.5 bg-white border border-[#E4E2F0] hover:border-[#4F46E5]/40 hover:shadow-sm text-[#1A1826] px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group"
        >
          <span className="w-6 h-6 bg-[#F0EEFF] group-hover:bg-[#4F46E5] rounded-lg flex items-center justify-center transition-colors">
            <Plus className="w-3.5 h-3.5 text-[#4F46E5] group-hover:text-white transition-colors" />
          </span>
          새 채팅 시작
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A6C0]" aria-hidden="true" />
          <input
            type="text"
            aria-label="대화 검색"
            placeholder="대화 검색..."
            className="w-full bg-white border border-[#E4E2F0] rounded-lg py-2 pl-8 pr-3 text-xs text-[#1A1826] placeholder:text-[#A8A6C0] focus:outline-none focus:border-[#4F46E5]/50 transition-all"
          />
        </div>
      </div>

      {/* Featured shortcuts */}
      <div className="px-4 pb-4">
        <h3 className="text-[10px] font-semibold text-[#A8A6C0] uppercase tracking-wider mb-2.5 px-0.5">
          즐겨찾기
        </h3>
        <div className="space-y-2">
          {FEATURED.map(f => (
            <button
              key={f.label}
              type="button"
              className="w-full flex items-center gap-3 p-2.5 bg-white rounded-xl border border-[#E4E2F0] hover:border-[#4F46E5]/30 hover:shadow-sm text-left transition-all duration-200 group"
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${f.grad} flex items-center justify-center text-base flex-shrink-0 shadow-sm`}>
                <span role="img" aria-hidden="true">{f.icon}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#1A1826] group-hover:text-[#4F46E5] transition-colors">{f.label}</p>
                <p className="text-[10px] text-[#A8A6C0] truncate">{f.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-[#E4E2F0] mx-4" />

      {/* Recent chats */}
      <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#E4E2F0] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        <h3 className="text-[10px] font-semibold text-[#A8A6C0] uppercase tracking-wider mb-2.5 px-0.5">
          최근 대화
        </h3>
        <div className="space-y-0.5">
          {RECENT.map(c => (
            <button
              key={c.id}
              type="button"
              aria-current={c.active ? 'page' : undefined}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                c.active
                  ? 'bg-[#F0EEFF] text-[#4F46E5]'
                  : 'hover:bg-white text-[#1A1826]'
              }`}
            >
              <p className={`text-xs font-medium truncate ${c.active ? 'text-[#4F46E5]' : 'text-[#1A1826] group-hover:text-[#4F46E5]'} transition-colors`}>
                {c.title}
              </p>
              <p className="text-[10px] text-[#A8A6C0] mt-0.5">{c.time}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="p-4 border-t border-[#E4E2F0]">
        <button type="button" aria-label="설정" className="flex items-center gap-2 text-[#A8A6C0] hover:text-[#4F46E5] transition-colors text-xs">
          <Settings className="w-4 h-4" />
          설정
        </button>
      </div>
    </aside>
  );
}

/* ─── Main Area ──────────────────────────────────────── */

const TABS = ['회의록 문장정리', '이메일 문체변경', '번역', '보도자료'] as const;

const SHORTCUTS = [
  { label: 'AI 글쓰기',   icon: '✍️', from: '#f472b6', to: '#ec4899' },
  { label: '코드 분석',   icon: '💻', from: '#4F46E5', to: '#818CF8' },
  { label: '번역',        icon: '🌐', from: '#34d399', to: '#10b981' },
  { label: '문서 요약',   icon: '📄', from: '#D4930A', to: '#F59E0B' },
  { label: '유튜브 요약', icon: '▶️', from: '#f87171', to: '#ef4444' },
  { label: '이미지 생성', icon: '🎨', from: '#818CF8', to: '#4F46E5' },
] as const;

function MainArea() {
  const [activeTab, setActiveTab] = useState<string>('채팅');

  return (
    <main className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
      {/* Subtle bg gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(79,70,229,0.04) 0%, transparent 70%)',
        }}
      />

      {/* Topbar */}
      <div className="relative z-10 h-12 flex items-center justify-end gap-2 px-6 border-b border-[#E4E2F0] bg-white shrink-0">
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

      {/* Hero */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 pb-12 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#E4E2F0] [&::-webkit-scrollbar-thumb]:rounded-full">
        {/* Hero headline */}
        <div className="flex flex-col items-center mb-8">
          <h1 className="font-['Jeju_Samdasoo',sans-serif] font-bold tracking-tight text-center leading-[1.1] mb-3">
            <span className="block text-[52px] text-[#1A1826]">무엇을</span>
            <span className="block text-[52px] text-[#4F46E5]">만들어볼까요?</span>
          </h1>
        </div>

        {/* Tab bar */}
        <div
          role="tablist"
          aria-label="대화 모드"
          className="flex items-center gap-1 bg-[#F0EEFF] p-1 rounded-2xl mb-6 shadow-inner"
        >
          {TABS.map(tab => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-white text-[#4F46E5] shadow-sm shadow-[#4F46E5]/10 font-semibold'
                  : 'text-[#6B6882] hover:text-[#4F46E5]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="w-full max-w-[680px] mb-8">
          <div className="relative bg-white rounded-2xl border border-[#E4E2F0] shadow-[0_4px_24px_rgba(79,70,229,0.10)] hover:shadow-[0_4px_32px_rgba(79,70,229,0.16)] focus-within:border-[#4F46E5]/50 focus-within:shadow-[0_4px_32px_rgba(79,70,229,0.18)] transition-all duration-300">
            <textarea
              aria-label="메시지 입력"
              placeholder="무엇이든 물어보세요..."
              rows={3}
              className="w-full bg-transparent text-[#1A1826] text-sm leading-relaxed p-5 pb-3 resize-none focus:outline-none placeholder:text-[#A8A6C0] font-['Jeju_Samdasoo',sans-serif]"
            />
            <div className="flex items-center justify-between px-4 pb-3 pt-1">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="파일 첨부"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A8A6C0] hover:text-[#4F46E5] hover:bg-[#F0EEFF] transition-all"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-label="음성 입력"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A8A6C0] hover:text-[#4F46E5] hover:bg-[#F0EEFF] transition-all"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-label="역할 선택"
                  className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[#6B6882] hover:text-[#4F46E5] hover:bg-[#F0EEFF] transition-all text-xs font-medium"
                >
                  <User className="w-3.5 h-3.5" />
                  역할 선택
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
              <button
                type="submit"
                aria-label="메시지 전송"
                className="w-9 h-9 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] flex items-center justify-center text-white transition-all duration-200 shadow-md shadow-[#4F46E5]/30 hover:shadow-lg hover:shadow-[#4F46E5]/40"
              >
                <ArrowUp className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>

          {/* Notice */}
          <div className="flex justify-center mt-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#F0EEFF] border border-[#4F46E5]/20 text-[#4F46E5] text-[12px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-pulse shrink-0" aria-hidden="true" />
              회의록 문장정리 비서가 업데이트 되었습니다.
            </div>
          </div>
        </div>

        {/* Shortcut grid */}
        <div className="w-full max-w-[680px]">
          <p className="text-[11px] font-semibold text-[#A8A6C0] uppercase tracking-wider text-center mb-4">
            바로가기
          </p>
          <div className="grid grid-cols-6 gap-3">
            {SHORTCUTS.map(s => (
              <button
                key={s.label}
                type="button"
                className="flex flex-col items-center gap-2 group"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200"
                  style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})` }}
                >
                  <span role="img" aria-hidden="true">{s.icon}</span>
                </div>
                <span className="text-[11px] font-medium text-[#6B6882] group-hover:text-[#4F46E5] transition-colors text-center leading-tight">
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

/* ─── Export ─────────────────────────────────────────── */

export function LightWorkspace() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white font-['Jeju_Samdasoo',sans-serif]">
      <SidePanel />
      <MainArea />
    </div>
  );
}
