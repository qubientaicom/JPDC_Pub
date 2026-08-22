import { useState } from 'react';
import {
  Plus, Search, Settings, Sparkles, Share, MoreHorizontal, Store,
  PenTool, Code, Globe, FileText, Mic2, BarChart2, BookOpen,
  Clock, TrendingUp, Star, ArrowRight, ChevronLeft, Zap,
  MessageSquare, Timer, Users, LayoutGrid, X, ChevronDown,
  Bell, Monitor, Bot, Gauge,
  type LucideIcon,
} from 'lucide-react';

/* ─── 최종 선택안 — 개인 설정 모달 ───────────────────────────────
   FinalDesignMarket 위에 설정 모달 오버레이
   탭: 표시 / 비서 / 시작 / 알림 / 사용량
   기본 활성: 표시 (색상 테마 / 글꼴 크기 / 표시 밀도)
────────────────────────────────────────────────────────────── */

/* ── Shared sidebar data ──────────────────────────────────── */

const HISTORY_GROUPS = [
  { label: '오늘', items: [
    { initials: 'KN', title: '한국어 NLP 데이터 구조화' },
    { initials: 'RQ', title: 'React Query 아키텍처 패턴' },
  ]},
  { label: '어제', items: [
    { initials: 'QT', title: '퀀트 투자 알고리즘 리뷰' },
    { initials: 'PG', title: 'PostgreSQL 성능 튜닝' },
  ]},
  { label: '지난 7일', items: [
    { initials: 'CT', title: '실시간 채팅 시스템 설계' },
    { initials: 'LM', title: 'LLM 프롬프트 엔지니어링 가이드' },
  ]},
];

/* ── Market data (background decoration) ─────────────────── */

const PROMO_ASSISTANTS = [
  { name: '회의록 문장정리', desc: '회의 내용을 체계적인 문서로 자동 정리', icon: PenTool,  badge: '인기 1위', users: '12.4k' },
  { name: '법률 자문 비서',  desc: '판례 검색과 계약 조항 리스크 자동 점검', icon: BookOpen, badge: 'NEW',    users: '1.2k' },
  { name: '데이터 분석 비서', desc: '엑셀·CSV 파일을 차트와 인사이트로',      icon: BarChart2, badge: '추천',  users: '8.7k' },
];

const RECENT_ASSISTANTS = [
  { name: '회의록 문장정리', icon: PenTool,  when: '3분 전'    },
  { name: '이메일 문체변경', icon: Mic2,     when: '오전 10:22' },
  { name: '번역',            icon: Globe,    when: '어제 오후'  },
  { name: '코드 리뷰',       icon: Code,     when: '어제 오전'  },
];

const FREQUENT: { rank: number; name: string; icon: LucideIcon; count: string; desc: string }[] = [
  { rank: 1, name: '회의록 문장정리', icon: PenTool,  count: '이번달 24회', desc: '회의 내용을 구조화된 문서로 자동 정리' },
  { rank: 2, name: '이메일 문체변경', icon: Mic2,     count: '이번달 18회', desc: '격식·비격식 문체를 자동으로 변환'     },
  { rank: 3, name: '번역',            icon: Globe,    count: '이번달 11회', desc: '다국어 고품질 자연스러운 번역'        },
];

/* ── Sidebar (background, dimmed) ────────────────────────── */

function BgSidebar() {
  return (
    <aside className="w-[240px] bg-[#F9F8FF] border-r border-[#E4E2F0] flex flex-col h-full shrink-0 select-none pointer-events-none">
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
        <div className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#6B6882] text-xs font-medium">
          <Plus className="w-3.5 h-3.5 text-[#A8A6C0]" strokeWidth={2.2} />새 대화 시작
        </div>
        <div className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[#EEEEFF] border border-[#C7C3F7] text-[#4F46E5] text-xs font-semibold">
          <Store className="w-3.5 h-3.5 text-[#4F46E5]" strokeWidth={1.8} />비서마켓
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#E4E2F0] text-[#A8A6C0]">
          <Search className="w-3.5 h-3.5" strokeWidth={1.8} />
          <span className="text-xs">대화 검색...</span>
        </div>
      </div>
      <div className="flex-1 overflow-hidden px-2 pb-3">
        {HISTORY_GROUPS.map((group) => (
          <div key={group.label} className="mb-3">
            <p className="px-2 py-1 text-[10px] uppercase tracking-widest text-[#A8A6C0] font-semibold">{group.label}</p>
            {group.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 bg-[#F0EEFA] text-[#6B6882]">{item.initials}</span>
                <span className="text-xs truncate text-[#6B6882]">{item.title}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="border-t border-[#E4E2F0] px-3 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#4F46E5] flex items-center justify-center text-[11px] font-bold text-white shadow-sm">김</div>
          <p className="text-xs font-semibold text-[#1A1826]">김동현</p>
        </div>
        <Settings className="w-4 h-4 text-[#4F46E5]" strokeWidth={1.8} />
      </div>
    </aside>
  );
}

/* ── Market background (dimmed) ──────────────────────────── */

function BgMarket() {
  return (
    <div className="flex-1 flex flex-col h-full bg-white min-w-0 select-none pointer-events-none">
      {/* Topbar */}
      <div className="h-12 flex items-center justify-between px-6 bg-white border-b border-[#E4E2F0] shrink-0">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-[#4F46E5]" strokeWidth={1.8} />
          <span className="text-sm font-bold text-[#1A1826]">비서마켓</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4F46E5] text-white text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={1.8} />브리핑
          </div>
          <div className="text-[#A8A6C0] p-2 rounded-lg"><Share className="w-4 h-4" strokeWidth={1.8} /></div>
          <div className="text-[#A8A6C0] p-2 rounded-lg"><MoreHorizontal className="w-4 h-4" strokeWidth={1.8} /></div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-8 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 className="w-4 h-4 text-[#4F46E5]" strokeWidth={1.8} />
          <h2 className="text-[13px] font-bold text-[#1A1826]">어제의 비서 이용 통계</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: MessageSquare, label: '총 대화 횟수', value: '12회',    sub: '전날 대비 +3회',   accent: false },
            { icon: Timer,         label: '절약한 시간',  value: '2시간 18분', sub: '자동화 처리 기준', accent: false },
            { icon: Star,          label: '가장 많이 사용', value: '회의록 정리', sub: '5회 사용',       accent: true },
          ].map((stat) => (
            <div key={stat.label} className="flex items-start gap-3 p-4 rounded-xl border border-[#E4E2F0] bg-[#F9F8FF]">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#E4E2F0] flex items-center justify-center shrink-0">
                <stat.icon className={stat.accent ? 'text-[#D4930A]' : 'text-[#4F46E5]'} strokeWidth={1.8} style={{width:'16px',height:'16px'}} />
              </div>
              <div>
                <p className="text-[10px] text-[#A8A6C0] font-medium">{stat.label}</p>
                <p className="text-[13px] font-bold text-[#1A1826] mt-0.5">{stat.value}</p>
                <p className="text-[10px] text-[#A8A6C0] mt-0.5">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 이건 어때요 */}
      <div className="px-8 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-[#4F46E5]" strokeWidth={1.8} />
          <h2 className="text-[13px] font-bold text-[#1A1826]">이건 어때요!</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {PROMO_ASSISTANTS.map((a) => (
            <div key={a.name} className="relative flex flex-col gap-3 p-4 rounded-xl border border-[#E4E2F0] bg-white overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#4F46E5]/60 to-[#7C6FF7]/40 rounded-t-xl" />
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#F0EEFF] flex items-center justify-center">
                  <a.icon className="text-[#4F46E5]" strokeWidth={1.8} style={{width:'20px',height:'20px'}} />
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${a.badge === 'NEW' ? 'bg-[#D4930A]/10 text-[#D4930A]' : 'bg-[#4F46E5]/10 text-[#4F46E5]'}`}>{a.badge}</span>
              </div>
              <p className="text-xs font-bold text-[#1A1826]">{a.name}</p>
              <div className="flex items-center gap-1 text-[10px] text-[#A8A6C0]">
                <Users className="w-3 h-3" strokeWidth={1.8} />{a.users}명 이용 중
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 최근 사용 */}
      <div className="px-8 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-[#4F46E5]" strokeWidth={1.8} />
          <h2 className="text-[13px] font-bold text-[#1A1826]">최근 사용한 비서</h2>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {RECENT_ASSISTANTS.map((a) => (
            <div key={a.name} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-[#E4E2F0] bg-white">
              <div className="w-7 h-7 rounded-lg bg-[#F4F3FC] flex items-center justify-center shrink-0">
                <a.icon className="text-[#A8A6C0]" strokeWidth={1.8} style={{width:'14px',height:'14px'}} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#1A1826]">{a.name}</p>
                <p className="text-[10px] text-[#A8A6C0]">{a.when}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 자주 사용 */}
      <div className="px-8 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-[#4F46E5]" strokeWidth={1.8} />
          <h2 className="text-[13px] font-bold text-[#1A1826]">자주 사용하는 비서</h2>
          <div className="ml-auto flex items-center gap-1 text-[11px] text-[#A8A6C0]">
            더보기 <ArrowRight className="w-3 h-3" strokeWidth={1.8} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          {FREQUENT.map((a) => (
            <div key={a.name} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#E4E2F0] bg-white">
              <span className="text-[11px] font-bold text-[#A8A6C0] w-5 text-center shrink-0">
                {['①','②','③'][a.rank-1]}
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#F4F3FC] flex items-center justify-center shrink-0">
                <a.icon className="text-[#A8A6C0]" strokeWidth={1.8} style={{width:'14px',height:'14px'}} />
              </div>
              <span className="text-xs font-semibold text-[#1A1826] flex-1">{a.name}</span>
              <span className="text-[10px] text-[#A8A6C0]">{a.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Settings tab nav ─────────────────────────────────────── */

type SettingsTab = '표시' | '비서' | '시작' | '알림' | '사용량';

const TABS: { id: SettingsTab; icon: LucideIcon }[] = [
  { id: '표시', icon: Monitor },
  { id: '비서', icon: Bot },
  { id: '시작', icon: Zap },
  { id: '알림', icon: Bell },
  { id: '사용량', icon: Gauge },
];

/* ── Custom select ────────────────────────────────────────── */

function SelectField({ label, options, value, onChange }: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-[#1A1826]">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((p) => !p)}
          className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border border-[#E4E2F0] bg-white
                     hover:border-[#4F46E5]/40 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]
                     text-sm text-[#1A1826] transition-colors"
        >
          <span>{value}</span>
          <ChevronDown className={`w-4 h-4 text-[#A8A6C0] transition-transform duration-150 ${open ? 'rotate-180' : ''}`} strokeWidth={1.8} />
        </button>
        {open && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#E4E2F0] rounded-xl shadow-lg shadow-black/8 z-10 overflow-hidden">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left px-3.5 py-2.5 text-sm transition-colors hover:bg-[#F4F3FC]
                  ${opt === value ? 'text-[#4F46E5] font-semibold bg-[#F0EEFF]' : 'text-[#1A1826]'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Tab content panels ────────────────────────────────────── */

function DisplayPanel() {
  const [theme, setTheme] = useState('라이트 (기본)');
  const [fontSize, setFontSize] = useState('보통 (14px)');
  const [density, setDensity] = useState('표준');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-[13px] font-bold text-[#1A1826] mb-1">화면 표시</h3>
        <p className="text-[11px] text-[#A8A6C0] leading-relaxed">인터페이스의 색상·글꼴·밀도를 조정합니다.</p>
      </div>

      <div className="h-px bg-[#E4E2F0]" />

      <div className="flex flex-col gap-5">
        <SelectField
          label="색상 테마"
          value={theme}
          onChange={setTheme}
          options={['라이트 (기본)', '다크', '시스템 설정 따름']}
        />

        {/* Color theme preview swatches */}
        <div className="flex gap-3">
          {[
            { label: '라이트', bg: 'bg-white', border: 'border-[#4F46E5]', dot: 'bg-[#4F46E5]' },
            { label: '다크',   bg: 'bg-[#1A1826]', border: 'border-[#E4E2F0]', dot: 'bg-[#7C6FF7]' },
            { label: '시스템', bg: 'bg-gradient-to-br from-white to-[#1A1826]', border: 'border-[#E4E2F0]', dot: 'bg-[#A8A6C0]' },
          ].map((sw, i) => (
            <button
              key={sw.label}
              type="button"
              onClick={() => setTheme(['라이트 (기본)', '다크', '시스템 설정 따름'][i])}
              className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all
                ${['라이트 (기본)', '다크', '시스템 설정 따름'][i] === theme ? sw.border + ' shadow-sm shadow-[#4F46E5]/15' : 'border-[#E4E2F0] hover:border-[#C7C3F7]'}`}
            >
              <div className={`w-full h-10 rounded-lg ${sw.bg} border border-[#E4E2F0] flex items-center justify-center`}>
                <div className={`w-3 h-3 rounded-full ${sw.dot}`} />
              </div>
              <span className="text-[10px] font-semibold text-[#6B6882]">{sw.label}</span>
            </button>
          ))}
        </div>

        <SelectField
          label="글꼴 크기"
          value={fontSize}
          onChange={setFontSize}
          options={['작게 (12px)', '보통 (14px)', '크게 (16px)']}
        />

        {/* Font size preview */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#F9F8FF] border border-[#E4E2F0]">
          <span className="text-[10px] text-[#A8A6C0] font-medium w-20 shrink-0">미리보기</span>
          <span className="text-[#1A1826]" style={{ fontSize: fontSize.includes('12') ? 12 : fontSize.includes('16') ? 16 : 14 }}>
            JPDC AI 비서 서비스에 오신 것을 환영합니다.
          </span>
        </div>

        <SelectField
          label="표시 밀도"
          value={density}
          onChange={setDensity}
          options={['넓게', '표준', '좁게']}
        />

        {/* Density preview */}
        <div className="flex flex-col gap-1.5">
          {['넓게', '표준', '좁게'].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDensity(d)}
              className={`flex items-center gap-3 px-3 rounded-xl border-2 transition-all
                ${d === density ? 'border-[#4F46E5] bg-[#F0EEFF]' : 'border-[#E4E2F0] bg-white hover:border-[#C7C3F7]'}
                ${d === '넓게' ? 'py-4' : d === '표준' ? 'py-2.5' : 'py-1.5'}`}
            >
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${d === density ? 'bg-[#4F46E5]' : 'bg-[#D1D0E0]'}`} />
              <span className={`text-xs font-semibold ${d === density ? 'text-[#4F46E5]' : 'text-[#6B6882]'}`}>{d}</span>
              <span className="text-[10px] text-[#A8A6C0] ml-1">
                {d === '넓게' ? '항목 간 여백 넉넉' : d === '표준' ? '기본 여백' : '최대한 많은 항목 표시'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlaceholderPanel({ tab }: { tab: SettingsTab }) {
  const descriptions: Record<string, string> = {
    '비서': '연결된 AI 비서를 관리하고, 기본 비서를 설정합니다.',
    '시작': 'JPDC AI가 시작될 때의 기본 화면과 초기 동작을 설정합니다.',
    '알림': '대화 완료·업데이트·주간 요약 등 알림 수신 방식을 설정합니다.',
    '사용량': '이번 달 AI 사용량, 비용, 남은 크레딧을 확인합니다.',
  };
  const icons: Record<string, LucideIcon> = { '비서': Bot, '시작': Zap, '알림': Bell, '사용량': Gauge };
  const Icon = icons[tab];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-[13px] font-bold text-[#1A1826] mb-1">{tab} 설정</h3>
        <p className="text-[11px] text-[#A8A6C0] leading-relaxed">{descriptions[tab]}</p>
      </div>
      <div className="h-px bg-[#E4E2F0]" />
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#F4F3FC] flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#A8A6C0]" strokeWidth={1.8} />
        </div>
        <p className="text-sm font-semibold text-[#6B6882]">{tab} 설정 준비 중</p>
        <p className="text-[11px] text-[#A8A6C0] text-center max-w-[200px] leading-relaxed">
          이 섹션은 현재 개발 중입니다.<br />곧 업데이트될 예정입니다.
        </p>
      </div>
    </div>
  );
}

/* ── Settings modal ───────────────────────────────────────── */

function SettingsModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('표시');

  return (
    <div
      className="absolute inset-0 flex items-center justify-center z-20"
      style={{ backgroundColor: 'rgba(26,24,38,0.45)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl shadow-black/20 border border-[#E4E2F0] flex overflow-hidden"
        style={{ width: 680, height: 540 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left nav */}
        <div className="w-[176px] bg-[#F9F8FF] border-r border-[#E4E2F0] flex flex-col shrink-0">
          {/* Modal header */}
          <div className="px-5 pt-5 pb-4 border-b border-[#E4E2F0] shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-lg bg-[#4F46E5] flex items-center justify-center shadow-sm">
                <svg viewBox="0 0 20 20" fill="none" className="w-3.5 h-3.5" aria-hidden="true">
                  <circle cx="10" cy="10" r="7" fill="white" fillOpacity="0.2"/>
                  <path d="M7 10.5l2.5 2.5 4-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-xs font-bold text-[#1A1826]">개인 설정</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#F0EEFF] border border-[#C7C3F7] mt-2">
              <div className="w-5 h-5 rounded-full bg-[#4F46E5] flex items-center justify-center text-[9px] font-bold text-white">김</div>
              <span className="text-[10px] font-semibold text-[#4F46E5]">김동현</span>
            </div>
          </div>

          {/* Tab list */}
          <nav className="flex flex-col gap-0.5 px-2 py-3 flex-1">
            {TABS.map(({ id, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 text-left w-full
                  ${activeTab === id
                    ? 'bg-[#4F46E5] text-white shadow-sm shadow-[#4F46E5]/25'
                    : 'text-[#6B6882] hover:bg-[#EEEEFF] hover:text-[#4F46E5]'
                  }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.8} />
                {id}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-[#E4E2F0] shrink-0">
            <p className="text-[9px] text-[#A8A6C0] text-center">JPDC AI v2.4.1</p>
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Panel header */}
          <div className="h-11 flex items-center justify-between px-6 border-b border-[#E4E2F0] shrink-0">
            <span className="text-sm font-bold text-[#1A1826]">{activeTab}</span>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#A8A6C0] hover:text-[#1A1826] hover:bg-[#F4F3FC] transition-colors"
            >
              <X className="w-4 h-4" strokeWidth={1.8} />
            </button>
          </div>

          {/* Scrollable panel body */}
          <div className="flex-1 overflow-y-auto px-6 py-5" style={{ scrollbarWidth: 'none' }}>
            {activeTab === '표시'
              ? <DisplayPanel />
              : <PlaceholderPanel tab={activeTab} />
            }
          </div>

          {/* Footer buttons */}
          <div className="h-12 flex items-center justify-end gap-2 px-6 border-t border-[#E4E2F0] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#E4E2F0] text-xs font-semibold text-[#6B6882] hover:bg-[#F4F3FC] hover:text-[#1A1826] transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              className="px-5 py-2 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold shadow-sm shadow-[#4F46E5]/25 transition-colors"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Export ───────────────────────────────────────────────── */

export function FinalDesignSettings() {
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-white font-['Jeju_Samdasoo',sans-serif]">
      {/* Background: FinalDesignMarket layout */}
      <BgSidebar />
      <BgMarket />

      {/* Modal overlay */}
      {modalOpen && <SettingsModal onClose={() => setModalOpen(false)} />}

      {/* Re-open hint when closed */}
      {!modalOpen && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4F46E5] text-white text-sm font-semibold shadow-md shadow-[#4F46E5]/30 hover:bg-[#4338CA] transition-colors"
          >
            <Settings className="w-4 h-4" strokeWidth={1.8} />
            설정 다시 열기
          </button>
        </div>
      )}
    </div>
  );
}
