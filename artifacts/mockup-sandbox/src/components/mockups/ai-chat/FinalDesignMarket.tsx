import { useState } from 'react';
import {
  Plus, Search, Settings, Sparkles, Share, MoreHorizontal, Store,
  PenTool, Code, Globe, FileText, Mic2, BarChart2, BookOpen,
  Clock, TrendingUp, Star, ArrowRight, ChevronLeft, Zap,
  MessageSquare, Timer, Users, LayoutGrid, List, SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react';

/* ─── 최종 선택안 — 비서마켓 서브페이지 ───────────────────────────
   FinalDesign 컨셉 유지:
   · 루시드 라인 아이콘 단일 체계 (strokeWidth 1.8)
   · #4F46E5 브랜드 1색 + #D4930A 보조 (최소한으로)
   · 정보 간략, 호버 시 디테일 표출
   · 비서마켓 활성 상태 (사이드바)
   · "전체 비서 보기" → 갤러리 뷰 전환
─────────────────────────────────────────────────────────────── */

/* ── Data ─────────────────────────────────────────────────── */

const HISTORY_GROUPS = [
  { label: '오늘', items: [
    { initials: 'KN', title: '한국어 NLP 데이터 구조화', active: false },
    { initials: 'RQ', title: 'React Query 아키텍처 패턴', active: false },
  ]},
  { label: '어제', items: [
    { initials: 'QT', title: '퀀트 투자 알고리즘 리뷰', active: false },
    { initials: 'PG', title: 'PostgreSQL 성능 튜닝', active: false },
  ]},
  { label: '지난 7일', items: [
    { initials: 'CT', title: '실시간 채팅 시스템 설계', active: false },
    { initials: 'LM', title: 'LLM 프롬프트 엔지니어링 가이드', active: false },
  ]},
];

const PROMO_ASSISTANTS = [
  { name: '회의록 문장정리', desc: '회의 내용을 체계적인 문서로 자동 정리', icon: PenTool,  badge: '인기 1위', users: '12.4k' },
  { name: '법률 자문 비서',  desc: '판례 검색과 계약 조항 리스크 자동 점검', icon: BookOpen, badge: 'NEW',    users: '1.2k' },
  { name: '데이터 분석 비서', desc: '엑셀·CSV 파일을 차트와 인사이트로',       icon: BarChart2, badge: '추천', users: '8.7k' },
];

const RECENT_ASSISTANTS = [
  { name: '회의록 문장정리', icon: PenTool,  when: '3분 전'    },
  { name: '이메일 문체변경', icon: Mic2,     when: '오전 10:22' },
  { name: '번역',            icon: Globe,    when: '어제 오후'  },
  { name: '코드 리뷰',       icon: Code,     when: '어제 오전'  },
];

const RECOMMENDED = [
  { name: '보도자료 초안',   icon: FileText, desc: '전문 보도자료 자동 작성' },
  { name: '코드 리뷰 비서',  icon: Code,     desc: '버그·스타일 자동 리뷰'  },
  { name: '번역 비서',       icon: Globe,    desc: '다국어 고품질 번역'      },
  { name: '문서 요약 비서',  icon: BookOpen, desc: 'PDF·계약서 핵심 요약'   },
];

const FREQUENT = [
  { rank: 1, name: '회의록 문장정리', icon: PenTool,  count: '이번달 24회', desc: '회의 내용을 구조화된 문서로 자동 정리' },
  { rank: 2, name: '이메일 문체변경', icon: Mic2,     count: '이번달 18회', desc: '격식·비격식 문체를 자동으로 변환'     },
  { rank: 3, name: '번역',            icon: Globe,    count: '이번달 11회', desc: '다국어 고품질 자연스러운 번역'        },
  { rank: 4, name: '코드 분석',       icon: Code,     count: '이번달 9회',  desc: '버그·최적화·리뷰 자동 처리'          },
  { rank: 5, name: '문서 요약',       icon: FileText, count: '이번달 6회',  desc: 'PDF·보고서를 핵심만 간추려 정리'     },
];

/* ── All assistants for gallery ────────────────────────────── */

type Category = '전체' | '글쓰기' | '코드' | '번역' | '분석' | '법률·회계';

const ALL_ASSISTANTS: {
  name: string; desc: string; icon: LucideIcon;
  category: Exclude<Category, '전체'>; users: string; isNew?: boolean;
}[] = [
  { name: '회의록 문장정리',  desc: '회의 내용을 체계적인 문서로',  icon: PenTool,   category: '글쓰기', users: '12.4k' },
  { name: '이메일 문체변경',  desc: '격식·비격식 문체 자동 변환',   icon: Mic2,      category: '글쓰기', users: '9.1k'  },
  { name: '보도자료 초안',    desc: '전문 보도자료 자동 작성',       icon: FileText,  category: '글쓰기', users: '6.3k'  },
  { name: '블로그 글쓰기',    desc: 'SEO 최적화된 블로그 포스트',    icon: PenTool,   category: '글쓰기', users: '4.1k', isNew: true },
  { name: '코드 리뷰 비서',   desc: '버그·스타일 자동 리뷰',         icon: Code,      category: '코드',   users: '18.2k' },
  { name: '코드 최적화',      desc: '성능 병목 탐지와 리팩토링',      icon: Code,      category: '코드',   users: '7.4k'  },
  { name: '테스트 코드 생성', desc: '유닛·통합 테스트 자동 생성',     icon: Code,      category: '코드',   users: '5.2k', isNew: true },
  { name: '번역 비서',        desc: '다국어 고품질 번역',             icon: Globe,     category: '번역',   users: '15.7k' },
  { name: '동시통역 비서',    desc: '실시간 대화 동시통역 지원',       icon: Globe,     category: '번역',   users: '3.8k', isNew: true },
  { name: '데이터 분석 비서', desc: '차트·인사이트 자동 생성',        icon: BarChart2, category: '분석',   users: '11.9k' },
  { name: '문서 요약 비서',   desc: 'PDF·보고서·계약서 핵심 요약',    icon: BookOpen,  category: '분석',   users: '8.8k'  },
  { name: '시장조사 비서',    desc: '경쟁사·트렌드 자동 분석 리포트', icon: TrendingUp, category: '분석', users: '4.5k', isNew: true },
  { name: '법률 자문 비서',   desc: '판례 검색과 조항 리스크 점검',    icon: BookOpen,  category: '법률·회계', users: '3.2k', isNew: true },
  { name: '계약서 검토 비서', desc: '핵심 조항 위험도 자동 판별',      icon: FileText,  category: '법률·회계', users: '5.8k' },
  { name: '회계 정산 비서',   desc: '증빙 정리와 정산서 자동화',       icon: BarChart2, category: '법률·회계', users: '2.9k', isNew: true },
];

const CATEGORIES: Category[] = ['전체', '글쓰기', '코드', '번역', '분석', '법률·회계'];

/* ── Sidebar ──────────────────────────────────────────────── */

function Sidebar({ onNewChat }: { onNewChat: () => void }) {
  return (
    <aside className="w-[240px] bg-[#F9F8FF] border-r border-[#E4E2F0] flex flex-col h-full shrink-0">
      <div className="h-12 flex items-center gap-2.5 px-4 border-b border-[#E4E2F0] shrink-0">
        <div className="w-7 h-7 rounded-lg bg-[#4F46E5] flex items-center justify-center shadow-sm shadow-[#4F46E5]/30">
          <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
            <circle cx="10" cy="10" r="7" fill="white" fillOpacity="0.2"/>
            <path d="M7 10.5l2.5 2.5 4-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="font-bold text-[#1A1826] text-sm tracking-tight">JPDC AI</span>
      </div>

      <div className="px-3 pt-3 pb-2 shrink-0 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#6B6882] hover:bg-[#F4F3FC] hover:text-[#1A1826] transition-colors text-xs font-medium group"
        >
          <Plus className="w-3.5 h-3.5 shrink-0 text-[#A8A6C0] group-hover:text-[#6B6882] transition-colors" strokeWidth={2.2} />
          새 대화 시작
        </button>
        {/* 비서마켓 — active */}
        <button
          type="button"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[#EEEEFF] border border-[#C7C3F7] text-[#4F46E5] transition-colors text-xs font-semibold"
        >
          <Store className="w-3.5 h-3.5 shrink-0 text-[#4F46E5]" strokeWidth={1.8} />
          비서마켓
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#E4E2F0] text-[#A8A6C0]">
          <Search className="w-3.5 h-3.5 shrink-0" strokeWidth={1.8} />
          <span className="text-xs">대화 검색...</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3" style={{ scrollbarWidth: 'none' }}>
        {HISTORY_GROUPS.map((group) => (
          <div key={group.label} className="mb-3">
            <p className="px-2 py-1 text-[10px] uppercase tracking-widest text-[#A8A6C0] font-semibold">{group.label}</p>
            {group.items.map((item, idx) => (
              <button key={idx} type="button"
                className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left hover:bg-[#F4F3FC] border border-transparent transition-all group">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 bg-[#F0EEFA] text-[#6B6882] group-hover:bg-[#E4E2F5]">
                  {item.initials}
                </span>
                <span className="text-xs leading-snug truncate text-[#6B6882]">{item.title}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="border-t border-[#E4E2F0] px-3 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#4F46E5] flex items-center justify-center text-[11px] font-bold text-white shadow-sm">김</div>
          <p className="text-xs font-semibold text-[#1A1826]">김동현</p>
        </div>
        <button type="button" aria-label="설정" className="text-[#A8A6C0] hover:text-[#1A1826] transition-colors">
          <Settings className="w-4 h-4" strokeWidth={1.8} />
        </button>
      </div>
    </aside>
  );
}

/* ── Small assistant card — hover reveals desc ─────────────── */

function AssistantCard({ name, desc, icon: Icon, badge, users }: {
  name: string; desc: string; icon: LucideIcon; badge?: string; users?: string;
}) {
  return (
    <button type="button"
      className="group/ac relative flex flex-col items-start gap-2 p-3.5 bg-white rounded-xl border border-[#E4E2F0]
                 hover:border-[#4F46E5]/30 hover:shadow-md hover:shadow-[#4F46E5]/8 hover:-translate-y-0.5
                 transition-all duration-200 text-left overflow-hidden w-full">
      {badge && (
        <span className={`absolute top-2.5 right-2.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
          badge === 'NEW' ? 'bg-[#D4930A]/10 text-[#D4930A]' : 'bg-[#4F46E5]/10 text-[#4F46E5]'
        }`}>{badge}</span>
      )}
      <div className="w-9 h-9 rounded-xl bg-[#F4F3FC] group-hover/ac:bg-[#EEF0FF] flex items-center justify-center transition-colors duration-200 shrink-0">
        <Icon className="w-4.5 h-4.5 text-[#A8A6C0] group-hover/ac:text-[#4F46E5] transition-colors duration-200" strokeWidth={1.8} style={{width:'18px',height:'18px'}} />
      </div>
      <div className="min-w-0 w-full">
        <p className="text-xs font-semibold text-[#1A1826] leading-snug truncate">{name}</p>
        {users && <p className="text-[10px] text-[#A8A6C0] mt-0.5">{users}명 이용</p>}
        <p className="text-[10.5px] text-[#A8A6C0] leading-snug mt-1
                      max-h-0 overflow-hidden opacity-0
                      group-hover/ac:max-h-8 group-hover/ac:opacity-100
                      transition-all duration-200 ease-out">
          {desc}
        </p>
      </div>
    </button>
  );
}

/* ── Section header ────────────────────────────────────────── */

function SectionHeader({ icon: Icon, title, action, onAction }: {
  icon: LucideIcon; title: string; action?: string; onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-[#4F46E5]" strokeWidth={1.8} />
        <h2 className="text-[13px] font-bold text-[#1A1826]">{title}</h2>
      </div>
      {action && (
        <button type="button" onClick={onAction}
          className="flex items-center gap-1 text-[11px] text-[#A8A6C0] hover:text-[#4F46E5] transition-colors font-medium">
          {action} <ArrowRight className="w-3 h-3" strokeWidth={1.8} />
        </button>
      )}
    </div>
  );
}

/* ── Market view ──────────────────────────────────────────── */

function MarketView({ onOpenGallery }: { onOpenGallery: () => void }) {
  return (
    <div className="flex-1 flex flex-col h-full bg-white min-w-0">
      {/* Topbar */}
      <div className="h-12 flex items-center justify-between px-6 bg-white border-b border-[#E4E2F0] shrink-0">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-[#4F46E5]" strokeWidth={1.8} />
          <span className="text-sm font-bold text-[#1A1826]">비서마켓</span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold transition-colors shadow-sm shadow-[#4F46E5]/20">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={1.8} />브리핑
          </button>
          <button type="button" aria-label="공유" className="text-[#A8A6C0] hover:text-[#6B6882] p-2 rounded-lg hover:bg-[#F4F3FC] transition-colors">
            <Share className="w-4 h-4" strokeWidth={1.8} />
          </button>
          <button type="button" aria-label="더 보기" className="text-[#A8A6C0] hover:text-[#6B6882] p-2 rounded-lg hover:bg-[#F4F3FC] transition-colors">
            <MoreHorizontal className="w-4 h-4" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-7" style={{ scrollbarWidth: 'none' }}>

        {/* 어제의 비서 이용 통계 */}
        <section>
          <SectionHeader icon={BarChart2} title="어제의 비서 이용 통계" />
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: MessageSquare, label: '총 대화 횟수', value: '12회',    sub: '전날 대비 +3회',   accent: false },
              { icon: Timer,         label: '절약한 시간',  value: '2시간 18분', sub: '자동화 처리 기준', accent: false },
              { icon: Star,          label: '가장 많이 사용', value: '회의록 정리', sub: '5회 사용',       accent: true  },
            ].map((stat) => (
              <div key={stat.label}
                className="flex items-start gap-3 p-4 rounded-xl border border-[#E4E2F0] bg-[#F9F8FF]">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#E4E2F0] flex items-center justify-center shrink-0">
                  <stat.icon className={stat.accent ? 'text-[#D4930A]' : 'text-[#4F46E5]'} strokeWidth={1.8} style={{width:'16px',height:'16px'}} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-[#A8A6C0] font-medium">{stat.label}</p>
                  <p className="text-[13px] font-bold text-[#1A1826] leading-snug mt-0.5 truncate">{stat.value}</p>
                  <p className="text-[10px] text-[#A8A6C0] mt-0.5">{stat.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 이건 어때요! */}
        <section>
          <SectionHeader icon={Zap} title="이건 어때요!" />
          <div className="grid grid-cols-3 gap-3">
            {PROMO_ASSISTANTS.map((a) => (
              <button key={a.name} type="button"
                className="group/promo relative flex flex-col gap-3 p-4 rounded-xl border border-[#E4E2F0] bg-white
                           hover:border-[#4F46E5]/30 hover:shadow-md hover:shadow-[#4F46E5]/8 hover:-translate-y-0.5
                           transition-all duration-200 text-left overflow-hidden">
                {/* Subtle top accent bar */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#4F46E5]/60 to-[#7C6FF7]/40 rounded-t-xl" />
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#F0EEFF] group-hover/promo:bg-[#EEF0FF] flex items-center justify-center transition-colors">
                    <a.icon className="text-[#4F46E5]" strokeWidth={1.8} style={{width:'20px',height:'20px'}} />
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    a.badge === 'NEW' ? 'bg-[#D4930A]/10 text-[#D4930A]' : 'bg-[#4F46E5]/10 text-[#4F46E5]'
                  }`}>{a.badge}</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1A1826]">{a.name}</p>
                  <p className="text-[10.5px] text-[#A8A6C0] mt-0.5 leading-snug
                                max-h-0 overflow-hidden opacity-0
                                group-hover/promo:max-h-8 group-hover/promo:opacity-100
                                transition-all duration-200">{a.desc}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-[#A8A6C0]">
                  <Users className="w-3 h-3" strokeWidth={1.8} />{a.users}명 이용 중
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 최근 사용한 비서 */}
        <section>
          <SectionHeader icon={Clock} title="최근 사용한 비서" />
          <div className="grid grid-cols-4 gap-3">
            {RECENT_ASSISTANTS.map((a) => (
              <button key={a.name} type="button"
                className="group/rc flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-[#E4E2F0] bg-white
                           hover:border-[#4F46E5]/30 hover:bg-[#F9F8FF] transition-all duration-200 text-left">
                <div className="w-7 h-7 rounded-lg bg-[#F4F3FC] group-hover/rc:bg-[#EEF0FF] flex items-center justify-center shrink-0 transition-colors">
                  <a.icon className="text-[#A8A6C0] group-hover/rc:text-[#4F46E5] transition-colors" strokeWidth={1.8} style={{width:'14px',height:'14px'}} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#1A1826] truncate">{a.name}</p>
                  <p className="text-[10px] text-[#A8A6C0]">{a.when}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 추천 비서 */}
        <section>
          <SectionHeader icon={Sparkles} title="추천 비서" />
          <div className="grid grid-cols-4 gap-3">
            {RECOMMENDED.map((a) => (
              <AssistantCard key={a.name} {...a} />
            ))}
          </div>
        </section>

        {/* 자주 사용하는 비서 */}
        <section>
          <SectionHeader icon={TrendingUp} title="자주 사용하는 비서" />
          <div className="flex flex-col gap-1.5">
            {FREQUENT.map((a) => (
              <button key={a.name} type="button"
                className="group/fr flex items-center gap-3 px-4 py-3 rounded-xl border border-[#E4E2F0] bg-white
                           hover:border-[#4F46E5]/30 hover:shadow-sm hover:shadow-[#4F46E5]/8 transition-all duration-200 text-left">
                <span className="text-[11px] font-bold text-[#A8A6C0] w-5 text-center shrink-0">
                  {a.rank <= 3 ? ['①','②','③'][a.rank-1] : `${a.rank}`}
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#F4F3FC] group-hover/fr:bg-[#EEF0FF] flex items-center justify-center shrink-0 transition-colors">
                  <a.icon className="text-[#A8A6C0] group-hover/fr:text-[#4F46E5] transition-colors" strokeWidth={1.8} style={{width:'14px',height:'14px'}} />
                </div>
                <span className="text-xs font-semibold text-[#1A1826] flex-1 truncate">{a.name}</span>
                <span className="text-[10px] text-[#A8A6C0] shrink-0">{a.count}</span>
                <p className="text-[10.5px] text-[#A8A6C0] ml-2 shrink-0
                              max-w-0 overflow-hidden opacity-0 whitespace-nowrap
                              group-hover/fr:max-w-[180px] group-hover/fr:opacity-100
                              transition-all duration-200 ease-out">{a.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* 전체 비서 보기 */}
        <div className="flex justify-center pt-2 pb-4">
          <button type="button" onClick={onOpenGallery}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[#4F46E5]/30 text-[#4F46E5]
                       hover:bg-[#4F46E5] hover:text-white hover:border-[#4F46E5] hover:shadow-md hover:shadow-[#4F46E5]/25
                       transition-all duration-200 text-sm font-semibold">
            <LayoutGrid className="w-4 h-4" strokeWidth={1.8} />
            전체 비서 보기
            <ArrowRight className="w-4 h-4" strokeWidth={1.8} />
          </button>
        </div>

      </div>
    </div>
  );
}

/* ── Gallery view ─────────────────────────────────────────── */

function GalleryView({ onBack }: { onBack: () => void }) {
  const [activeCategory, setActiveCategory] = useState<Category>('전체');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = activeCategory === '전체'
    ? ALL_ASSISTANTS
    : ALL_ASSISTANTS.filter((a) => a.category === activeCategory);

  return (
    <div className="flex-1 flex flex-col h-full bg-white min-w-0">
      {/* Topbar */}
      <div className="h-12 flex items-center justify-between px-6 bg-white border-b border-[#E4E2F0] shrink-0">
        <div className="flex items-center gap-2">
          <button type="button" onClick={onBack}
            className="flex items-center gap-1 text-[#A8A6C0] hover:text-[#4F46E5] transition-colors text-xs font-medium p-1 rounded-lg hover:bg-[#F4F3FC]">
            <ChevronLeft className="w-4 h-4" strokeWidth={1.8} />
          </button>
          <span className="text-[#A8A6C0] text-xs">/</span>
          <Store className="w-4 h-4 text-[#A8A6C0]" strokeWidth={1.8} />
          <span className="text-xs text-[#A8A6C0]">비서마켓</span>
          <span className="text-[#A8A6C0] text-xs">/</span>
          <span className="text-sm font-bold text-[#1A1826]">전체 비서</span>
          <span className="text-[10px] text-[#A8A6C0] bg-[#F4F3FC] px-1.5 py-0.5 rounded-full ml-1">{filtered.length}개</span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold transition-colors shadow-sm shadow-[#4F46E5]/20">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={1.8} />브리핑
          </button>
          <button type="button" aria-label="공유" className="text-[#A8A6C0] hover:text-[#6B6882] p-2 rounded-lg hover:bg-[#F4F3FC] transition-colors">
            <Share className="w-4 h-4" strokeWidth={1.8} />
          </button>
          <button type="button" aria-label="더 보기" className="text-[#A8A6C0] hover:text-[#6B6882] p-2 rounded-lg hover:bg-[#F4F3FC] transition-colors">
            <MoreHorizontal className="w-4 h-4" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="px-8 pt-4 pb-0 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F4F3FC] border border-[#E4E2F0]">
          {CATEGORIES.map((cat) => (
            <button key={cat} type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                activeCategory === cat
                  ? 'bg-[#4F46E5] text-white shadow-sm shadow-[#4F46E5]/25'
                  : 'text-[#6B6882] hover:text-[#1A1826] hover:bg-white/70'
              }`}>
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E4E2F0] text-[#6B6882] hover:border-[#4F46E5]/30 hover:text-[#4F46E5] transition-colors text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.8} />필터
          </button>
          <div className="flex items-center rounded-lg border border-[#E4E2F0] overflow-hidden">
            <button type="button" onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-[#4F46E5] text-white' : 'text-[#A8A6C0] hover:text-[#6B6882] hover:bg-[#F4F3FC]'}`}>
              <LayoutGrid className="w-3.5 h-3.5" strokeWidth={1.8} />
            </button>
            <button type="button" onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-[#4F46E5] text-white' : 'text-[#A8A6C0] hover:text-[#6B6882] hover:bg-[#F4F3FC]'}`}>
              <List className="w-3.5 h-3.5" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </div>

      {/* Assistant grid / list */}
      <div className="flex-1 overflow-y-auto px-8 py-5" style={{ scrollbarWidth: 'none' }}>
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-4 gap-3">
            {filtered.map((a) => (
              <AssistantCard key={a.name} name={a.name} desc={a.desc} icon={a.icon}
                badge={a.isNew ? 'NEW' : undefined} users={a.users} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {filtered.map((a) => (
              <button key={a.name} type="button"
                className="group/li flex items-center gap-3 px-4 py-3 rounded-xl border border-[#E4E2F0] bg-white
                           hover:border-[#4F46E5]/30 hover:shadow-sm hover:shadow-[#4F46E5]/8 transition-all duration-200 text-left">
                <div className="w-8 h-8 rounded-xl bg-[#F4F3FC] group-hover/li:bg-[#EEF0FF] flex items-center justify-center shrink-0 transition-colors">
                  <a.icon className="text-[#A8A6C0] group-hover/li:text-[#4F46E5] transition-colors" strokeWidth={1.8} style={{width:'16px',height:'16px'}} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-[#1A1826] truncate">{a.name}</p>
                    {a.isNew && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#D4930A]/10 text-[#D4930A] shrink-0">NEW</span>}
                  </div>
                  <p className="text-[10.5px] text-[#A8A6C0] mt-0.5 truncate
                                max-h-0 overflow-hidden opacity-0
                                group-hover/li:max-h-5 group-hover/li:opacity-100
                                transition-all duration-200">{a.desc}</p>
                </div>
                <span className="text-[10px] text-[#A8A6C0] shrink-0">{a.users}명</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Export ───────────────────────────────────────────────── */

export function FinalDesignMarket() {
  const [view, setView] = useState<'market' | 'gallery'>('market');

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white font-['Jeju_Samdasoo',sans-serif]">
      <Sidebar onNewChat={() => {}} />
      {view === 'market'
        ? <MarketView onOpenGallery={() => setView('gallery')} />
        : <GalleryView onBack={() => setView('market')} />
      }
    </div>
  );
}
