import type { LucideProps } from 'lucide-react';
import type { FC } from 'react';
import {
  Plus, Search, Settings, Paperclip, ArrowUp,
  Share, Sparkles, MoreHorizontal, Store,
  ChevronDown, CircleCheck, FileSearch, ListTree, PenLine,
} from 'lucide-react';

/* ─── Design 4 확장 — 질의 후 답변 화면 ───────────────────────────
   Landing Hero(Design 4)와 동일한 팔레트/컨셉으로 통일:
   Left panel:   #1C2C3E  dark navy (LandingHero LeftPanel과 동일)
   Right panel:  #FFFFFF  light, blue-gray text
   Accent blue:  #3B82F6
   Accent light: #60A5FA
   Text primary: #1A2D3D
   Text muted:   #7090AA / #6A8AA8
   Text subtle:  #8AABBB / #A0B8CC
   Border:       #C0D0E0
─────────────────────────────────────────────────────────────── */

const SidebarItem = ({ title, active = false }: { title: string; active?: boolean }) => {
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      className={`w-full text-left px-3 py-2 rounded-md text-[13px] truncate transition-all duration-200 ${
        active
          ? 'bg-[#1A3050] text-[#60A5FA] font-medium border border-[#2A4A78]'
          : 'text-[#7A9AB8] hover:bg-[#1E3348] hover:text-white'
      }`}
    >
      {title}
    </button>
  );
};

const Sidebar = () => {
  return (
    <div className="w-[280px] flex-shrink-0 bg-[#1C2C3E] flex flex-col h-full font-['Jeju_Samdasoo',sans-serif]">
      <div className="h-11 flex items-center gap-2 px-5 border-b border-[#253545] shrink-0">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center shadow-sm shadow-[#3B82F6]/40">
          <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5" aria-hidden="true">
            <path d="M7 1.5l1.2 3.3H12L9.2 6.8l1 3.2L7 8.2 3.8 10l1-3.2L2 4.8h3.8L7 1.5z" fill="white" fillOpacity="0.95" />
          </svg>
        </div>
        <span className="text-white font-bold text-sm tracking-tight">JPDC AI</span>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1 overflow-hidden">
        <button type="button" className="w-full flex items-center justify-start gap-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-3 rounded-xl transition-all duration-300 text-sm font-bold shadow-sm shadow-[#3B82F6]/30">
          <Plus className="w-4 h-4" />
          새 대화
        </button>

        <button type="button" className="w-full flex items-center justify-start gap-3 text-[#7A9AB8] hover:bg-[#1E3348] hover:text-white px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium group">
          <Store className="w-4 h-4 text-[#5A7A9A] group-hover:text-[#60A5FA] transition-colors" />
          비서마켓
        </button>

        <div className="relative mt-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A7A9A]" aria-hidden="true" />
          <input
            type="text"
            aria-label="대화 내역 검색"
            placeholder="대화 검색..."
            className="w-full bg-[#1E3348] border border-[#2A3D52] rounded-lg py-2 pl-9 pr-3 text-sm text-white placeholder:text-[#5A7A9A] focus:outline-none focus:border-[#3B82F6]/60 focus:ring-1 focus:ring-[#3B82F6]/40 transition-all"
          />
        </div>

        <div className="flex-1 overflow-y-auto -mx-2 px-2 mt-2 pb-4 space-y-8 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#2A3D52] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-semibold text-[#5A7A9A] px-3 pb-1 uppercase tracking-wider">오늘</h3>
            <SidebarItem title="인천에서 예약 가능한 전자현미경 목록" active={true} />
            <SidebarItem title="React Query 아키텍처 패턴" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-[11px] font-semibold text-[#5A7A9A] px-3 pb-1 uppercase tracking-wider">어제</h3>
            <SidebarItem title="퀀트 투자 알고리즘 리뷰" />
            <SidebarItem title="PostgreSQL 성능 튜닝" />
            <SidebarItem title="다크모드 UI 색채 이론" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-[11px] font-semibold text-[#5A7A9A] px-3 pb-1 uppercase tracking-wider">지난 7일</h3>
            <SidebarItem title="실시간 채팅 시스템 설계" />
            <SidebarItem title="LLM 프롬프트 엔지니어링 가이드" />
            <SidebarItem title="Rust WASM 통합" />
            <SidebarItem title="Next.js 엣지 라우팅 문제" />
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[#253545]">
        <div className="flex items-center justify-between group cursor-pointer p-2 -mx-2 rounded-xl hover:bg-[#1E3348] transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#3B82F6] to-[#60A5FA] flex items-center justify-center text-white font-medium text-sm shadow-lg ring-2 ring-[#1C2C3E]">
              김동
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">김동현</span>
            </div>
          </div>
          <Settings className="w-4 h-4 text-[#5A7A9A] group-hover:text-[#7A9AB8] transition-colors" />
        </div>
      </div>
    </div>
  );
};

type IconComponent = FC<LucideProps>;

const THINK_STEPS: { icon: IconComponent; title: string; desc: string }[] = [
  { icon: FileSearch, title: '1단계 · 자료 조회', desc: '인천 지역에서 온라인 예약이 가능한 전자현미경 장비를 의미검색으로 조회했습니다.' },
  { icon: ListTree, title: '2단계 · 후보 필터링', desc: '보유 기관 6곳 중 예약 시스템이 연동된 4곳을 선별하고 가용 시간대를 대조했습니다.' },
  { icon: PenLine, title: '3단계 · 답변 정리', desc: '장비 사양·예약 방법·예상 대기시간을 표로 정리해 최종 답변을 작성했습니다.' },
];

const EQUIPMENT_ROWS = [
  { name: 'JEM-2100F 투과전자현미경', org: '인천대학교 공동기기원', wait: '평균 2일', tag: '온라인 예약' },
  { name: 'S-4800 주사전자현미경', org: '인천테크노파크', wait: '평균 4시간', tag: '온라인 예약' },
  { name: 'Quanta 250 FEG', org: '한국생산기술연구원 인천본부', wait: '평균 1일', tag: '전화 확인 후 예약' },
];

const ThinkingProcess = () => {
  return (
    <div className="rounded-2xl border border-[#C0D0E0] bg-[#F3F8FF] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#C0D0E0]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-white" aria-hidden="true" />
          </div>
          <span className="text-[13px] font-semibold text-[#1A2D3D]">JPDC AI 사고 과정</span>
          <span className="text-[13px] text-[#7090AA]">· 3단계 분석 완료</span>
        </div>
        <div className="flex items-center gap-2">
          <CircleCheck className="w-4 h-4 text-[#3B82F6]" aria-hidden="true" />
          <ChevronDown className="w-4 h-4 text-[#8AABBB]" aria-hidden="true" />
        </div>
      </div>
      <div className="divide-y divide-[#C0D0E0]/70">
        {THINK_STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="flex items-start gap-3 px-4 py-3">
              <div className="w-6 h-6 rounded-md bg-[#3B82F6]/10 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-3.5 h-3.5 text-[#3B82F6]" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[12.5px] font-semibold text-[#1A2D3D]">{step.title}</p>
                <p className="text-[12.5px] text-[#6A8AA8] leading-relaxed mt-0.5">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MainPanel = () => {
  return (
    <div className="flex-1 flex flex-col h-full bg-white relative z-0 font-['Jeju_Samdasoo',sans-serif]">
      {/* Topbar */}
      <div className="h-14 flex items-center justify-between px-6 flex-shrink-0 z-10 border-b border-[#C8D5E4] bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-[13px] font-bold text-[#1A2D3D] truncate">인천에서 예약 가능한 전자현미경 목록</h2>
          <span className="flex items-center gap-1 text-[11px] text-[#3B82F6] bg-[#EBF3FF] px-2 py-0.5 rounded-full shrink-0 border border-[#C0D0E0]">
            <CircleCheck className="w-3 h-3" aria-hidden="true" />
            답변 완료
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#3B82F6] hover:bg-[#2563EB] text-white text-[11px] font-bold transition-colors shadow-sm shadow-[#3B82F6]/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            브리핑
          </button>
          <button type="button" aria-label="공유" className="text-[#8AABBB] hover:text-[#3B82F6] transition-colors p-2 rounded-md hover:bg-[#EBF3FF]">
            <Share className="w-4 h-4" aria-hidden="true" />
          </button>
          <button type="button" aria-label="더 보기" className="text-[#8AABBB] hover:text-[#3B82F6] transition-colors p-2 rounded-md hover:bg-[#EBF3FF]">
            <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Conversation */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-[#C8D5E4] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">

          {/* User query bubble */}
          <div className="flex justify-end">
            <div className="max-w-[80%] bg-[#3B82F6] text-white rounded-2xl rounded-tr-md px-4 py-3 text-[13.5px] leading-relaxed shadow-sm shadow-[#3B82F6]/25">
              인천에서 예약 가능한 전자현미경 목록 알려줘
            </div>
          </div>

          {/* AI response */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center shrink-0 mt-1">
              <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5" aria-hidden="true">
                <path d="M7 1.5l1.2 3.3H12L9.2 6.8l1 3.2L7 8.2 3.8 10l1-3.2L2 4.8h3.8L7 1.5z" fill="white" fillOpacity="0.95" />
              </svg>
            </div>

            <div className="flex-1 min-w-0 flex flex-col gap-4">
              <ThinkingProcess />

              <div className="text-[13.5px] text-[#1A2D3D] leading-relaxed space-y-3">
                <p>
                  인천 지역에서 온라인으로 예약 가능한 전자현미경 장비 3건을 찾았습니다. 기관별 대기시간과 예약 방식을 함께 정리했습니다.
                </p>

                <div className="rounded-xl border border-[#C0D0E0] overflow-hidden">
                  <table className="w-full text-left text-[12.5px]">
                    <thead>
                      <tr className="bg-[#F3F8FF] text-[#7090AA]">
                        <th className="px-3 py-2 font-semibold">장비</th>
                        <th className="px-3 py-2 font-semibold">보유 기관</th>
                        <th className="px-3 py-2 font-semibold">평균 대기</th>
                        <th className="px-3 py-2 font-semibold">예약 방식</th>
                      </tr>
                    </thead>
                    <tbody>
                      {EQUIPMENT_ROWS.map((row) => (
                        <tr key={row.name} className="border-t border-[#C0D0E0]">
                          <td className="px-3 py-2 font-medium text-[#1A2D3D]">{row.name}</td>
                          <td className="px-3 py-2 text-[#6A8AA8]">{row.org}</td>
                          <td className="px-3 py-2 text-[#6A8AA8]">{row.wait}</td>
                          <td className="px-3 py-2 text-[#6A8AA8]">{row.tag}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-[#6A8AA8]">
                  가장 대기시간이 짧은 곳은 인천테크노파크의 S-4800 주사전자현미경(평균 4시간)입니다. 추가로 예약 링크를 안내해 드릴까요?
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button type="button" className="text-[11.5px] px-3 py-1.5 rounded-full border border-[#C0D0E0] text-[#6A8AA8] hover:border-[#3B82F6]/50 hover:text-[#3B82F6] transition-colors">
                  예약 링크 보내줘
                </button>
                <button type="button" className="text-[11.5px] px-3 py-1.5 rounded-full border border-[#C0D0E0] text-[#6A8AA8] hover:border-[#3B82F6]/50 hover:text-[#3B82F6] transition-colors">
                  타 지역도 검색해줘
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Input bar */}
      <div className="px-6 sm:px-8 pb-6 pt-2 flex-shrink-0">
        <div className="w-full max-w-3xl mx-auto">
          <div className="relative bg-white border border-[#C0D0E0] rounded-2xl flex items-center gap-2 pl-4 pr-2 py-2 shadow-sm focus-within:border-[#3B82F6]/60 transition-all">
            <button type="button" aria-label="파일 첨부" className="p-2 text-[#8AABBB] hover:text-[#3B82F6] hover:bg-[#EBF3FF] rounded-lg transition-all shrink-0">
              <Paperclip className="w-4.5 h-4.5" aria-hidden="true" />
            </button>
            <input
              type="text"
              aria-label="메시지 입력"
              placeholder="추가로 궁금한 점을 물어보세요..."
              className="flex-1 bg-transparent text-[13.5px] text-[#1A2D3D] placeholder:text-[#A0B8CC] focus:outline-none py-2"
            />
            <button type="submit" aria-label="메시지 전송" className="bg-[#3B82F6] hover:bg-[#2563EB] text-white p-2.5 rounded-xl transition-all duration-300 shadow-sm shadow-[#3B82F6]/30 flex items-center justify-center shrink-0">
              <ArrowUp className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export function ConversationView() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <Sidebar />
      <MainPanel />
    </div>
  );
}
