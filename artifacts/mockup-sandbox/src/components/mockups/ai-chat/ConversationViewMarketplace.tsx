import { useState } from 'react';
import {
  Plus, Search, Settings, ArrowUp, Paperclip, Share, Sparkles, MoreHorizontal, Store,
  ChevronDown, CircleCheck, FileSearch, ListTree, PenLine,
} from 'lucide-react';

/* ─── Design 3 확장 — 질의 후 답변 화면 ───────────────────────────
   Marketplace Hub(Design 3)와 동일한 사이드바/팔레트:
   Primary: #4F46E5   Gold: #D4930A   Bg: #F9F8FF
─────────────────────────────────────────────────────────────── */

const HISTORY_GROUPS = [
  {
    label: '오늘',
    items: [
      { initials: 'KN', title: '한국어 NLP 데이터 구조화', active: false },
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

/* ── Sidebar (Design 2와 동일) ────────────────────────────── */

function Sidebar() {
  return (
    <aside className="w-[240px] bg-[#F9F8FF] border-r border-[#E4E2F0] flex flex-col h-full shrink-0">
      <div className="h-12 flex items-center gap-2.5 px-4 border-b border-[#E4E2F0] shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4F46E5] to-[#7C6FF7] flex items-center justify-center shadow-sm shadow-[#4F46E5]/30">
          <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
            <circle cx="10" cy="10" r="7" fill="white" fillOpacity="0.2"/>
            <path d="M7 10.5l2.5 2.5 4-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="font-bold text-[#1A1826] text-sm tracking-tight">JPDC AI</span>
      </div>

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
                className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left transition-all group hover:bg-[#F4F3FC] border border-transparent"
              >
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 bg-[#F0EEFA] text-[#6B6882] group-hover:bg-[#E4E2F5]">
                  {item.initials}
                </span>
                <span className="text-xs leading-snug truncate text-[#6B6882]">
                  {item.title}
                </span>
              </button>
            ))}
          </div>
        ))}

        <div className="mb-3">
          <p className="px-2 py-1 text-[10px] uppercase tracking-widest text-[#A8A6C0] font-semibold">지금</p>
          <button
            type="button"
            className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left transition-all group bg-[#EEEEFF] border border-[#C7C3F7]"
          >
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 bg-[#4F46E5] text-white">
              인천
            </span>
            <span className="text-xs leading-snug truncate text-[#4F46E5] font-semibold">
              인천에서 예약 가능한 전자현미경 목록
            </span>
          </button>
        </div>
      </div>

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

/* ── Thinking process ─────────────────────────────────────── */

const THINK_STEPS = [
  { icon: FileSearch, title: '1단계 · 자료 조회', desc: '인천 지역에서 온라인 예약이 가능한 전자현미경 장비를 의미검색으로 조회했습니다.' },
  { icon: ListTree, title: '2단계 · 후보 필터링', desc: '보유 기관 6곳 중 예약 시스템이 연동된 4곳을 선별하고 가용 시간대를 대조했습니다.' },
  { icon: PenLine, title: '3단계 · 답변 정리', desc: '장비 사양·예약 방법·예상 대기시간을 표로 정리해 최종 답변을 작성했습니다.' },
];

const EQUIPMENT_ROWS = [
  { name: 'JEM-2100F 투과전자현미경', org: '인천대학교 공동기기원', wait: '평균 2일', tag: '온라인 예약' },
  { name: 'S-4800 주사전자현미경', org: '인천테크노파크', wait: '평균 4시간', tag: '온라인 예약' },
  { name: 'Quanta 250 FEG', org: '한국생산기술연구원 인천본부', wait: '평균 1일', tag: '전화 확인 후 예약' },
];

function ThinkingProcess() {
  return (
    <div className="rounded-2xl border border-[#E4E2F0] bg-[#F9F8FF] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E2F0]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C6FF7] flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-white" aria-hidden="true" />
          </div>
          <span className="text-[13px] font-semibold text-[#1A1826]">JPDC AI 사고 과정</span>
          <span className="text-[13px] text-[#A8A6C0]">· 3단계 분석 완료</span>
        </div>
        <div className="flex items-center gap-2">
          <CircleCheck className="w-4 h-4 text-[#4F46E5]" aria-hidden="true" />
          <ChevronDown className="w-4 h-4 text-[#A8A6C0]" aria-hidden="true" />
        </div>
      </div>
      <div className="divide-y divide-[#E4E2F0]/70">
        {THINK_STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="flex items-start gap-3 px-4 py-3">
              <div className="w-6 h-6 rounded-md bg-[#4F46E5]/10 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-3.5 h-3.5 text-[#4F46E5]" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[12.5px] font-semibold text-[#1A1826]">{step.title}</p>
                <p className="text-[12.5px] text-[#6B6882] leading-relaxed mt-0.5">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main Area ────────────────────────────────────────────── */

function MainArea() {
  return (
    <div className="flex-1 flex flex-col h-full bg-white min-w-0">

      {/* Topbar */}
      <div className="h-12 flex items-center justify-between px-6 bg-white border-b border-[#E4E2F0] shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-[13px] font-bold text-[#1A1826] truncate">인천에서 예약 가능한 전자현미경 목록</h2>
          <span className="flex items-center gap-1 text-[11px] text-[#4F46E5] bg-[#F0EEFF] px-2 py-0.5 rounded-full shrink-0">
            <CircleCheck className="w-3 h-3" aria-hidden="true" />
            답변 완료
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
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

      {/* Conversation */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8" style={{ scrollbarWidth: 'none' }}>
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">

          <div className="flex justify-end">
            <div className="max-w-[80%] bg-[#4F46E5] text-white rounded-2xl rounded-tr-md px-4 py-3 text-[13.5px] leading-relaxed shadow-sm shadow-[#4F46E5]/20">
              인천에서 예약 가능한 전자현미경 목록 알려줘
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C6FF7] flex items-center justify-center shrink-0 mt-1">
              <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
                <circle cx="10" cy="10" r="7" fill="white" fillOpacity="0.2"/>
                <path d="M7 10.5l2.5 2.5 4-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <div className="flex-1 min-w-0 flex flex-col gap-4">
              <ThinkingProcess />

              <div className="text-[13.5px] text-[#1A1826] leading-relaxed space-y-3">
                <p>
                  인천 지역에서 온라인으로 예약 가능한 전자현미경 장비 3건을 찾았습니다. 기관별 대기시간과 예약 방식을 함께 정리했습니다.
                </p>

                <div className="rounded-xl border border-[#E4E2F0] overflow-hidden">
                  <table className="w-full text-left text-[12.5px]">
                    <thead>
                      <tr className="bg-[#F9F8FF] text-[#6B6882]">
                        <th className="px-3 py-2 font-semibold">장비</th>
                        <th className="px-3 py-2 font-semibold">보유 기관</th>
                        <th className="px-3 py-2 font-semibold">평균 대기</th>
                        <th className="px-3 py-2 font-semibold">예약 방식</th>
                      </tr>
                    </thead>
                    <tbody>
                      {EQUIPMENT_ROWS.map((row) => (
                        <tr key={row.name} className="border-t border-[#E4E2F0]">
                          <td className="px-3 py-2 font-medium text-[#1A1826]">{row.name}</td>
                          <td className="px-3 py-2 text-[#6B6882]">{row.org}</td>
                          <td className="px-3 py-2 text-[#6B6882]">{row.wait}</td>
                          <td className="px-3 py-2 text-[#6B6882]">{row.tag}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-[#6B6882]">
                  가장 대기시간이 짧은 곳은 인천테크노파크의 S-4800 주사전자현미경(평균 4시간)입니다. 추가로 예약 링크를 안내해 드릴까요?
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button type="button" className="text-[11.5px] px-3 py-1.5 rounded-full border border-[#E4E2F0] text-[#6B6882] hover:border-[#4F46E5]/40 hover:text-[#4F46E5] transition-colors">
                  예약 링크 보내줘
                </button>
                <button type="button" className="text-[11.5px] px-3 py-1.5 rounded-full border border-[#E4E2F0] text-[#6B6882] hover:border-[#4F46E5]/40 hover:text-[#4F46E5] transition-colors">
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
          <div className="relative bg-white border border-[#E4E2F0] rounded-2xl flex items-center gap-2 pl-4 pr-2 py-2 shadow-sm focus-within:border-[#4F46E5]/60 transition-all">
            <button type="button" aria-label="파일 첨부" className="p-2 text-[#A8A6C0] hover:text-[#4F46E5] hover:bg-[#F4F3FC] rounded-lg transition-all shrink-0">
              <Paperclip className="w-4.5 h-4.5" aria-hidden="true" />
            </button>
            <input
              type="text"
              aria-label="메시지 입력"
              placeholder="추가로 궁금한 점을 물어보세요..."
              className="flex-1 bg-transparent text-[13.5px] text-[#1A1826] placeholder:text-[#A8A6C0] focus:outline-none py-2"
            />
            <button type="submit" aria-label="메시지 전송" className="bg-[#4F46E5] hover:bg-[#4338CA] text-white p-2.5 rounded-xl transition-all duration-300 shadow-sm shadow-[#4F46E5]/30 flex items-center justify-center shrink-0">
              <ArrowUp className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Export ───────────────────────────────────────────────── */

export function ConversationViewMarketplace() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <Sidebar />
      <MainArea />
    </div>
  );
}
