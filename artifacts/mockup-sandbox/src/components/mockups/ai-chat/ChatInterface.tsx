import type { LucideProps } from 'lucide-react';
import type { FC } from 'react';
import { 
  Plus, Search, Settings, Paperclip, ArrowUp, 
  Share, Sparkles, 
  Code, PenTool, Globe, FileText,
  MoreHorizontal, Store
} from 'lucide-react';

/* ─── Design 4 palette ──────────────────────────────────
   Primary:      #4F46E5  (deep indigo)
   Gold:         #D4930A  (warm amber)
   Bg main:      #F9F8FF
   Sidebar:      #FFFFFF
   Border:       #E4E2F0
   Text primary: #1A1826
   Text muted:   #6B6882
   Text subtle:  #A8A6C0
─────────────────────────────────────────────────────── */

const SidebarItem = ({ title, active = false }: { title: string, active?: boolean }) => {
  return (
    <button 
      type="button"
      aria-current={active ? 'page' : undefined}
      className={`w-full text-left px-3 py-2 rounded-md text-sm truncate transition-all duration-200 ${
        active 
          ? 'bg-[#4F46E5]/10 text-[#4F46E5] font-medium' 
          : 'text-[#6B6882] hover:bg-[#F0EEFF] hover:text-[#1A1826]'
      }`}
    >
      {title}
    </button>
  );
};

const Sidebar = () => {
  return (
    <div className="w-[280px] flex-shrink-0 bg-[#F9F8FF] flex flex-col h-full border-r border-[#E4E2F0]">
      <div className="h-12 flex items-center gap-2.5 px-4 border-b border-[#E4E2F0] shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4F46E5] to-[#7C6FF7] flex items-center justify-center shadow-sm shadow-[#4F46E5]/30">
          <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
            <circle cx="10" cy="10" r="7" fill="white" fillOpacity="0.2"/>
            <path d="M7 10.5l2.5 2.5 4-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="font-bold text-[#1A1826] text-sm tracking-tight">JPDC AI</span>
      </div>
      <div className="p-4 flex flex-col gap-4 flex-1 overflow-hidden">
        <button type="button" className="w-full flex items-center justify-start gap-3 bg-[#F0EEFF] hover:bg-[#E8E6FF] text-[#1A1826] px-4 py-3 rounded-xl border border-[#E4E2F0] hover:border-[#4F46E5]/40 transition-all duration-300 text-sm font-medium group shadow-sm">
          <div className="bg-[#E4E2FF] group-hover:bg-[#4F46E5]/20 p-1.5 rounded-md transition-colors">
            <Plus className="w-4 h-4 text-[#4F46E5] transition-colors" />
          </div>
          새 대화
        </button>

        <button type="button" className="w-full flex items-center justify-start gap-3 text-[#6B6882] hover:bg-[#F0EEFF] hover:text-[#1A1826] px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium group">
          <Store className="w-4 h-4 text-[#A8A6C0] group-hover:text-[#4F46E5] transition-colors" />
          비서마켓
        </button>
        
        <div className="relative mt-2">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A6C0]" aria-hidden="true" />
          <input 
            type="text"
            aria-label="대화 내역 검색"
            placeholder="대화 검색..." 
            className="w-full bg-white border border-[#E4E2F0] rounded-lg py-2 pl-9 pr-3 text-sm text-[#1A1826] placeholder:text-[#A8A6C0] focus:outline-none focus:border-[#4F46E5]/60 focus:ring-1 focus:ring-[#4F46E5]/40 transition-all"
          />
        </div>

        <div className="flex-1 overflow-y-auto -mx-2 px-2 mt-2 pb-4 space-y-8 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#E4E2F0] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-semibold text-[#A8A6C0] px-3 pb-1 uppercase tracking-wider">오늘</h3>
            <SidebarItem title="한국어 NLP 데이터 구조화" active={true} />
            <SidebarItem title="React Query 아키텍처 패턴" />
          </div>
          
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-semibold text-[#A8A6C0] px-3 pb-1 uppercase tracking-wider">어제</h3>
            <SidebarItem title="퀀트 투자 알고리즘 리뷰" />
            <SidebarItem title="PostgreSQL 성능 튜닝" />
            <SidebarItem title="다크모드 UI 색채 이론" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-[11px] font-semibold text-[#A8A6C0] px-3 pb-1 uppercase tracking-wider">지난 7일</h3>
            <SidebarItem title="실시간 채팅 시스템 설계" />
            <SidebarItem title="LLM 프롬프트 엔지니어링 가이드" />
            <SidebarItem title="Rust WASM 통합" />
            <SidebarItem title="Next.js 엣지 라우팅 문제" />
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[#E4E2F0] bg-[#F9F8FF]">
        <div className="flex items-center justify-between group cursor-pointer p-2 -mx-2 rounded-xl hover:bg-[#F0EEFF] transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#4F46E5] to-[#818CF8] flex items-center justify-center text-white font-medium text-sm shadow-lg ring-2 ring-white">
              김동
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-[#1A1826]">김동현</span>
            </div>
          </div>
          <Settings className="w-4 h-4 text-[#A8A6C0] group-hover:text-[#6B6882] transition-colors" />
        </div>
      </div>
    </div>
  );
};

type IconComponent = FC<LucideProps>;

const SuggestionCard = ({ title, description, icon: Icon }: { title: string, description: string, icon: IconComponent }) => {
  return (
    <div className="p-4 rounded-xl bg-[#F9F8FF] border border-[#E4E2F0] hover:border-[#4F46E5]/40 hover:bg-white hover:shadow-[0_4px_24px_-4px_rgba(79,70,229,0.12)] cursor-pointer transition-all duration-300 group">
      <div className="flex items-center gap-2 mb-2 text-[#6B6882] group-hover:text-[#4F46E5] transition-colors">
        <Icon className="w-4 h-4" />
        <h4 className="text-sm font-medium text-[#1A1826] group-hover:text-[#1A1826] transition-colors">{title}</h4>
      </div>
      <p className="text-[13px] text-[#A8A6C0] leading-relaxed group-hover:text-[#6B6882] transition-colors">
        {description}
      </p>
    </div>
  );
};

const MainPanel = () => {
  return (
    <div className="flex-1 flex flex-col h-full bg-white relative z-0">
      {/* Topbar */}
      <div className="h-14 flex items-center justify-end px-6 flex-shrink-0 z-10 border-b border-[#E4E2F0] bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold transition-colors shadow-sm shadow-[#4F46E5]/25">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            브리핑
          </button>
          <button type="button" aria-label="대화 공유" className="text-[#A8A6C0] hover:text-[#6B6882] transition-colors p-2 rounded-lg hover:bg-[#F0EEFF]">
            <Share className="w-4 h-4" aria-hidden="true" />
          </button>
          <button type="button" aria-label="더 보기" className="text-[#A8A6C0] hover:text-[#6B6882] transition-colors p-2 rounded-lg hover:bg-[#F0EEFF]">
            <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 sm:p-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-[#E4E2F0] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        <div className="w-full max-w-3xl flex flex-col -mt-20">
          
          <div className="text-center mb-10 space-y-5">
            <h1 className="font-['Jeju_Samdasoo',sans-serif] text-5xl sm:text-6xl font-bold text-[#1A1826] tracking-tight leading-[1.1]">
              오늘 무엇을 <br className="hidden sm:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F46E5] to-[#818CF8]">만들어 볼까요?</span>
            </h1>
          </div>

          <div className="relative group mb-8">
            {/* Subtle glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4F46E5]/15 to-[#818CF8]/15 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition duration-500" aria-hidden="true" />
            
            <div className="relative bg-white border border-[#E4E2F0] rounded-3xl flex flex-col shadow-[0_4px_24px_rgba(79,70,229,0.08)] transition-all duration-300 focus-within:border-[#4F46E5]/60 focus-within:shadow-[0_4px_32px_rgba(79,70,229,0.14)]">
              <textarea 
                aria-label="메시지 입력"
                className="w-full bg-transparent text-[#1A1826] p-5 sm:p-6 min-h-[140px] resize-none focus:outline-none placeholder:text-[#A8A6C0] text-base leading-relaxed"
                placeholder="작업을 설명하거나, 질문하거나, 파일을 첨부하세요..."
              />
              <div className="flex items-center justify-between p-3 sm:px-4 sm:pb-4 pt-0">
                <button type="button" aria-label="파일 첨부" className="p-2 text-[#A8A6C0] hover:text-[#4F46E5] hover:bg-[#4F46E5]/10 rounded-xl transition-all flex items-center gap-2 text-sm font-medium">
                  <Paperclip className="w-5 h-5" aria-hidden="true" />
                  <span className="hidden sm:inline">파일 첨부</span>
                </button>
                <button type="submit" aria-label="메시지 전송" className="bg-[#4F46E5] hover:bg-[#4338CA] text-white p-3 rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(79,70,229,0.25)] hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center justify-center group/btn">
                  <ArrowUp className="w-5 h-5 group-hover/btn:-translate-y-0.5 transition-transform" aria-hidden="true" />
                </button>
              </div>
            </div>
            
            <div className="flex justify-center mt-5">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#F0EEFF] border border-[#4F46E5]/20 text-[#4F46E5] text-[12px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-pulse shrink-0" aria-hidden="true" />
                회의록 문장정리 비서가 업데이트 되었습니다.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-6">
            <SuggestionCard 
              title="AI 글쓰기" 
              description="블로그·기획서·이메일 등 다양한 글을 빠르게 작성해 드립니다."
              icon={PenTool}
            />
            <SuggestionCard 
              title="코드 분석" 
              description="코드 디버깅·최적화·리뷰를 통해 더 나은 코드를 완성해 드립니다."
              icon={Code}
            />
            <SuggestionCard 
              title="번역" 
              description="다국어 고품질 번역으로 자연스러운 문장을 전달해 드립니다."
              icon={Globe}
            />
            <SuggestionCard 
              title="문서 요약" 
              description="PDF·보고서·계약서 등 긴 문서를 핵심만 요약해 드립니다."
              icon={FileText}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export function ChatInterface() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F9F8FF] font-['Jeju_Samdasoo',sans-serif]">
      <Sidebar />
      <MainPanel />
    </div>
  );
}
