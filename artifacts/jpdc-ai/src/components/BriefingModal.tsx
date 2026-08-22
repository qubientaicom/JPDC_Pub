import { createContext, useContext, useId, useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { X, RefreshCw, Bell, ChevronLeft, ChevronRight, HelpCircle, Store, Sparkles } from 'lucide-react';
import type { SavedItem } from './SavedPanel';
import Tooltip from './Tooltip';

/* ══════════════════════════════════════════════════════════════
   타입 정의
══════════════════════════════════════════════════════════════ */
type Badge = 'recommend' | 'trending' | 'new' | 'popular';
type EvidenceScope = 'dept' | 'org' | 'curated';

interface QueryItem {
  text: string;
  occurred_at: string;
}

interface BriefItem {
  topic_id: string;
  topic_label: string;
  badge: Badge;
  evidence_scope: EvidenceScope;
  user_count: number;
  query_count: number;
  ratio: number | null;     // null = 신규
  queries: QueryItem[];     // 마스킹 완료, 최신순 정렬, 최대 5건
  query_total: number;      // 중복 제거 후 총 건수
  last_week_count?: number;
  score?: number;
}

/* ══════════════════════════════════════════════════════════════
   목 데이터 (서버 임계값 통과 항목만 포함)
══════════════════════════════════════════════════════════════ */
const BLOCK_A: BriefItem[] = [
  {
    topic_id: 'a1',
    topic_label: '전기사업법 제7조 — 사업허가 요건',
    badge: 'recommend', evidence_scope: 'dept',
    user_count: 8, query_count: 14, ratio: 4.7,
    queries: [
      { text: '전기사업법 7조 사업허가 요건 알려줘', occurred_at: '2026-08-09T09:12:00Z' },
      { text: '전기사업법 7조 허가 기준 정리해줘',   occurred_at: '2026-08-08T14:30:00Z' },
      { text: '발전사업 허가 신청 절차 알려줘',       occurred_at: '2026-08-07T11:05:00Z' },
      { text: '허가 취소 사유 설명해줘',              occurred_at: '2026-08-06T16:40:00Z' },
    ],
    query_total: 14,
    last_week_count: 3, score: 0.960,
  },
  {
    topic_id: 'a2',
    topic_label: '개발행위허가 기준 — 토지형질변경 요건',
    badge: 'recommend', evidence_scope: 'dept',
    user_count: 5, query_count: 9, ratio: 3.2,
    queries: [
      { text: '개발행위허가 토지형질변경 요건',   occurred_at: '2026-08-09T08:55:00Z' },
      { text: '형질변경 허가 절차 알려줘',         occurred_at: '2026-08-08T10:10:00Z' },
      { text: '개발행위 허가 면적 기준 뭐야',       occurred_at: '2026-08-07T09:30:00Z' },
    ],
    query_total: 9,
    last_week_count: 3, score: 0.914,
  },
];

const BLOCK_B: BriefItem[] = [
  {
    topic_id: 'b1',
    topic_label: '허가권자 지역별 차이 — 시·도지사 vs 시장·군수',
    badge: 'new', evidence_scope: 'org',
    user_count: 42, query_count: 21, ratio: null,
    queries: [
      { text: '허가권자가 지역마다 다른 이유',           occurred_at: '2026-08-09T10:20:00Z' },
      { text: '시장·군수와 도지사 허가 권한 차이',        occurred_at: '2026-08-09T09:45:00Z' },
      { text: '광역시 허가권자 기준 알려줘',              occurred_at: '2026-08-08T15:00:00Z' },
      { text: '허가권자 판단 기준 조문 어디야',           occurred_at: '2026-08-08T11:20:00Z' },
      { text: '지방자치법상 허가 위임 규정 설명해줘',     occurred_at: '2026-08-07T14:10:00Z' },
    ],
    query_total: 21,
    last_week_count: 0, score: 0.972,
  },
  {
    topic_id: 'b2',
    topic_label: '재생에너지 설비 인허가 절차 — 풍력·태양광',
    badge: 'trending', evidence_scope: 'dept',
    user_count: 7, query_count: 15, ratio: 2.1,
    queries: [
      { text: '태양광 발전소 인허가 절차',       occurred_at: '2026-08-09T09:30:00Z' },
      { text: '풍력발전 설비 허가 서류',          occurred_at: '2026-08-08T16:20:00Z' },
      { text: '재생에너지 인허가 기간 얼마야',    occurred_at: '2026-08-08T13:50:00Z' },
    ],
    query_total: 15,
    last_week_count: 7, score: 0.886,
  },
  {
    topic_id: 'b3',
    topic_label: '전기설비 사용 전 검사 신청 — 첨부 서류 목록',
    badge: 'trending', evidence_scope: 'dept',
    user_count: 6, query_count: 12, ratio: 3.8,
    queries: [
      { text: '사용 전 검사 신청서 필요 서류',     occurred_at: '2026-08-09T08:40:00Z' },
      { text: '전기설비 검사 신청 절차 알려줘',    occurred_at: '2026-08-08T09:15:00Z' },
    ],
    query_total: 12,
    last_week_count: 3, score: 0.901,
  },
];

const BLOCK_C: BriefItem[] = [
  {
    topic_id: 'c1',
    topic_label: '소각시설 입지선정 절차 — 순환경제법 제11조',
    badge: 'popular', evidence_scope: 'org',
    user_count: 38, query_count: 94, ratio: 1.4,
    queries: [
      { text: '소각시설 입지 선정 기준',           occurred_at: '2026-08-09T10:05:00Z' },
      { text: '순환경제법 11조 내용 알려줘',        occurred_at: '2026-08-09T09:20:00Z' },
      { text: '소각시설 주민 동의 요건',            occurred_at: '2026-08-08T14:00:00Z' },
      { text: '폐기물 처리시설 입지 절차',          occurred_at: '2026-08-08T11:30:00Z' },
    ],
    query_total: 94,
    last_week_count: 67, score: 0.943,
  },
  {
    topic_id: 'c2',
    topic_label: '집단에너지사업 허가 신청 — 필요 서류',
    badge: 'popular', evidence_scope: 'dept',
    user_count: 6, query_count: 18, ratio: 1.8,
    queries: [
      { text: '집단에너지사업 허가 신청 서류 목록',   occurred_at: '2026-08-09T08:30:00Z' },
      { text: '집단에너지 허가 요건 정리해줘',         occurred_at: '2026-08-08T10:45:00Z' },
    ],
    query_total: 18,
    last_week_count: 10, score: 0.877,
  },
];

/* ══════════════════════════════════════════════════════════════
   도움말 팝오버 컴포넌트
══════════════════════════════════════════════════════════════ */
interface HelpLine { label: string; value: string }
interface HelpSection { heading?: string; lines?: HelpLine[]; code?: string; text?: string; note?: string }

interface HelpPopoverContextValue {
  activeId: string | null;
  setActiveId: (id: string | null) => void;
}

const HelpPopoverContext = createContext<HelpPopoverContextValue | null>(null);

function HelpPopoverProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  return (
    <HelpPopoverContext.Provider value={{ activeId, setActiveId }}>
      {children}
    </HelpPopoverContext.Provider>
  );
}

function HelpPopover({ sections, align = 'left' }: { sections: HelpSection[]; align?: 'left' | 'right' }) {
  const tooltipId = useId();
  const helpContext = useContext(HelpPopoverContext);
  const [standaloneOpen, setStandaloneOpen] = useState(false);
  const open = helpContext ? helpContext.activeId === tooltipId : standaloneOpen;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        if (helpContext) helpContext.setActiveId(null);
        else setStandaloneOpen(false);
      }
    }
    function keyHandler(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (helpContext) helpContext.setActiveId(null);
        else setStandaloneOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [open, helpContext]);

  const toggle = () => {
    if (helpContext) {
      helpContext.setActiveId(open ? null : tooltipId);
    } else {
      setStandaloneOpen(v => !v);
    }
  };

  return (
    <div ref={ref} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggle}
        aria-label="도움말"
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        className={`p-0.5 rounded-full transition-colors ${
          open
            ? 'text-[#4F46E5] bg-[#EEEEFF]'
            : 'text-[#C7C3F7] hover:text-[#4F46E5] hover:bg-[#F4F3FC]'
        }`}
      >
        <HelpCircle className="w-3.5 h-3.5" strokeWidth={1.8} />
      </button>

      {open && (
        <div id={tooltipId} role="tooltip"
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-2 z-[9999] w-96 max-w-[calc(100vw-2rem)]
                      bg-white border border-[#E4E2F0] rounded-xl shadow-xl shadow-black/8
                      p-4 flex flex-col gap-3 pointer-events-none`}>
          {/* 말풍선 꼭지 */}
          <div className={`absolute -top-1.5 ${align === 'right' ? 'right-3' : 'left-3'} w-3 h-3 bg-white border-t border-l border-[#E4E2F0] rotate-45`} />

          {sections.map((sec, si) => (
            <div key={si} className="flex flex-col gap-1.5">
              {sec.heading && (
                <p className="text-[11px] font-bold text-[#4F46E5] uppercase tracking-wide">
                  {sec.heading}
                </p>
              )}
              {sec.lines?.map((line, li) => (
                <div key={li} className="flex items-start gap-2">
                  <span className="text-[10.5px] font-semibold text-[#6B6882] shrink-0 w-20 leading-snug">
                    {line.label}
                  </span>
                  <span className="text-[10.5px] text-[#1A1826] leading-snug">{line.value}</span>
                </div>
              ))}
              {sec.code && (
                <pre className="text-[10.5px] font-mono text-[#1A1826] bg-[#F9F8FF] border border-[#E4E2F0]
                                rounded-lg px-3 py-2.5 leading-relaxed whitespace-pre overflow-x-auto">
                  {sec.code}
                </pre>
              )}
              {sec.text && (
                <p className="text-[12px] text-[#3D3A52] leading-relaxed">{sec.text}</p>
              )}
              {sec.note && (
                <p className="text-[11px] text-[#A8A6C0] leading-snug pt-0.5 border-t border-[#F0EFF8]">
                  {sec.note}
                </p>
              )}
              {si < sections.length - 1 && (
                <div className="border-t border-[#F0EFF8]" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* 각 블록 도움말 콘텐츠 정의 */
const HELP_COMMON: HelpSection[] = [
  {
    heading: 'STEP 1. 원본 수집',
    text: '최근 2주치 대화를 가져옵니다. 이번 주와 지난 주를 나란히 놓아야 "늘었는지"를 판단할 수 있기 때문입니다.',
  },
  {
    heading: 'STEP 2. 질의 제외',
    text: '그 자체로는 무슨 내용인지 알 수 없는 질문을 걸러냅니다. 요약해줘, 작성자가 누구야?, 더 자세히 같은 질문은 앞선 대화에 붙어야만 의미가 생깁니다. 이 질문들을 그대로 세면 항상 1위가 되어 정작 무엇에 대한 관심이 늘었는지 알 수 없게 됩니다.',
  },
  {
    heading: 'STEP 3. 주제 묶기',
    text: '표현이 달라도 같은 것을 물은 질문끼리 한 덩어리로 묶습니다. 기준은 무엇을 + 어떻게, 두 가지입니다.',
  },
];

const HELP_A: HelpSection[] = [
  {
    heading: '블록 A — 나에게 관련',
    text: '최근 30일 동안 내가 나눈 대화를 의미 단위로 바꿔 평균을 낸 뒤, 각 주제와 얼마나 가까운지 비교합니다. 여기에 우리 부서가 그 주제를 얼마나 물었는지와 최근에 생긴 주제인지를 더해 순위를 냅니다. 최근 대화가 3건보다 적으면 판단할 근거가 부족해 표시하지 않습니다.',
  },
];

const HELP_B: HelpSection[] = [
  {
    heading: '블록 B — 급상승 주제',
    text: '지난주보다 이번 주에 질문이 크게 늘어난 주제입니다. 이번 주 10회 이상, 지난주 대비 2배 이상, 서로 다른 5명 이상이 물어본 주제만 올라옵니다. 세 조건을 모두 넘어야 하므로 한 사람이 여러 번 물어서 늘어난 주제는 걸러집니다.',
  },
];

const HELP_C: HelpSection[] = [
  {
    heading: '블록 C — 많이 본 주제',
    text: '이번 주에 여러 사람이 반복해서 찾은 주제입니다. 이번 주 5회 이상, 서로 다른 3명 이상이 물어본 주제 중에서 얼마나 많은 사람에게 퍼졌는지를 가장 크게 보고 고릅니다. 우리 부서가 많이 물어본 주제일수록 위로 올라옵니다.',
  },
];

const HELP_QUERY_COUNT: HelpSection[] = [
  { heading: '이번 주 질의', text: "최근 7일 동안 이 주제로 들어온 질문 수입니다. 회사 전체 기준이며, 대화를 새로 시작하는 첫 질문만 셉니다. '더 자세히' 같은 이어지는 질문과 잡담은 빼고 셉니다." },
];

const HELP_USER_COUNT: HelpSection[] = [
  { heading: '질의한 사람', text: '최근 7일 동안 이 주제를 물어본 사람 수입니다. 같은 사람이 여러 번 물어도 1명으로 셉니다. 질문 수보다 이 숫자를 더 중요하게 봅니다 — 한 사람이 반복해서 만든 숫자는 브리핑에 올리지 않기 때문입니다.' },
];

const HELP_RATIO: HelpSection[] = [
  { heading: '지난주 대비', text: "이번 주 질문 수를 지난주 질문 수로 나눈 값입니다. 지난주에 한 건도 없었다면 나눌 수 없으므로 배수 대신 '신규'로 표시합니다." },
];

const HELP_SCORE: HelpSection[] = [
  { heading: '점수', text: '오늘 브리핑에서 어떤 주제를 먼저 보여줄지 정하는 순위 값입니다. 늘어난 정도, 질문 수, 퍼진 정도를 정해진 비율로 합쳐 계산합니다. 오늘 목록 안에서만 비교되는 값이라 어제 점수와 비교하는 의미는 없습니다.' },
];

const HELP_WEEKLY_COMPARE: HelpSection[] = [
  { heading: '주간 비교', text: '지난 7일과 그 앞 7일의 질문 수를 나란히 놓은 것입니다. 막대 길이는 두 값 중 큰 쪽을 가득 찬 기준으로 맞췄습니다.' },
];

const HELP_BADGE: HelpSection[] = [
  { heading: '급상승 / 신규 뱃지', text: "지난주에도 있었는데 이번 주에 늘었으면 '급상승', 지난주에 한 건도 없다가 이번 주에 처음 나타났으면 '신규'입니다." },
];

const HELP_SCOPE: HelpSection[] = [
  { heading: '근거 범위', text: "이 목록을 어느 범위에서 골랐는지 알려줍니다. 우리 부서 질문만으로 개수가 차면 '부서', 모자라면 본부, 그래도 모자라면 전사까지 넓혀 채웁니다. 표시된 숫자는 범위와 상관없이 언제나 회사 전체 기준입니다." },
];

const HELP_QUERY_HISTORY: HelpSection[] = [
  { heading: '질의 이력', text: '실제로 들어온 질문 문장을 최근 순으로 보여줍니다. 같은 문장은 하나로 합쳐 최대 5건까지 전달합니다. 누가 물었는지는 담지 않으며, 사번이나 문서번호처럼 보이는 숫자는 가려서 표시합니다.' },
];

/* ══════════════════════════════════════════════════════════════
   뱃지
══════════════════════════════════════════════════════════════ */
const BADGE_STYLE: Record<Badge, { label: string; bg: string; text: string; border: string }> = {
  recommend: { label: '추천',    bg: '#F0EEFF', text: '#4F46E5', border: '#C7C3F7' },
  trending:  { label: '급상승',  bg: '#FFF1F2', text: '#E11D48', border: '#FECDD3' },
  new:       { label: '신규',    bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
  popular:   { label: '많이 봄', bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
};

function BadgeChip({ badge }: { badge: Badge }) {
  const s = BADGE_STYLE[badge];
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border shrink-0"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}>
      {s.label}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════
   항목 카드
══════════════════════════════════════════════════════════════ */
const DEFAULT_SHOW = 2;
const MAX_SHOW = 5;

function formatQueryTime(iso: string): string {
  const date = new Date(iso);
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hour = String(date.getUTCHours()).padStart(2, '0');
  const minute = String(date.getUTCMinutes()).padStart(2, '0');
  return `${month}/${day} ${hour}:${minute}`;
}

function ItemCard({ item, rank }: { item: BriefItem; rank: number }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? Math.min(item.queries.length, MAX_SHOW) : DEFAULT_SHOW;
  const visibleQueries = item.queries.slice(0, shown);
  const hiddenCount = Math.max(item.queries.length - DEFAULT_SHOW, 0);
  const lastWeekCount = item.last_week_count ?? (
    item.ratio && item.ratio > 0 ? Math.max(1, Math.round(item.query_count / item.ratio)) : 0
  );
  const maxCount = Math.max(item.query_count, lastWeekCount, 1);
  const score = (item.score ?? 0.9).toFixed(3);
  const comparison = item.ratio === null ? '신규' : `${item.ratio.toFixed(1)}배`;

  return (
    <article className="flex flex-col gap-4 px-5 sm:px-7 py-5 rounded-sm border border-[#E4E2F0] bg-white
                        hover:border-[#C7C3F7] hover:shadow-sm transition-all duration-200">
      {/* 순위·주제·상태 */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <span className="font-mono text-[16px] text-[#A8A6C0] leading-tight pt-0.5 shrink-0">
            {String(rank).padStart(2, '0')}
          </span>
          <h3 className="text-[17px] sm:text-[19px] font-bold text-[#1A1826] leading-tight truncate">
            {item.topic_label}
          </h3>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <BadgeChip badge={item.badge} />
          <HelpPopover sections={[...HELP_BADGE, ...HELP_SCOPE]} align="right" />
        </div>
      </div>

      {/* 핵심 지표 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3">
        <div>
          <p className="text-[12px] text-[#A8A6C0] mb-1">이번 주 질의</p>
          <div className="flex items-end gap-1">
            <p className="text-[23px] font-bold text-[#1A1826] leading-none">
              {item.query_count}<span className="ml-1 text-[13px] font-medium text-[#A8A6C0]">회</span>
            </p>
            <HelpPopover sections={HELP_QUERY_COUNT} />
          </div>
        </div>
        <div>
          <p className="text-[12px] text-[#A8A6C0] mb-1">질의한 사람</p>
          <div className="flex items-end gap-1">
            <p className="text-[23px] font-bold text-[#1A1826] leading-none">
              {item.user_count}<span className="ml-1 text-[13px] font-medium text-[#A8A6C0]">명</span>
            </p>
            <HelpPopover sections={HELP_USER_COUNT} />
          </div>
        </div>
        <div>
          <p className="text-[12px] text-[#A8A6C0] mb-1">지난주 대비</p>
          <div className="flex items-end gap-1">
            <p className="text-[23px] font-bold text-[#B45309] leading-none">{comparison}</p>
            <HelpPopover sections={HELP_RATIO} />
          </div>
        </div>
        <div>
          <p className="text-[12px] text-[#A8A6C0] mb-1">점수</p>
          <div className="flex items-end gap-1">
            <p className="text-[23px] font-bold font-mono text-[#1A1826] leading-none">{score}</p>
            <HelpPopover sections={HELP_SCORE} align="right" />
          </div>
        </div>
      </div>

      {/* 지난주·이번 주 비교 */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-1">
          <p className="text-[12px] font-semibold text-[#6B6882]">주간 비교</p>
          <HelpPopover sections={HELP_WEEKLY_COMPARE} />
        </div>
        <div className="flex items-center gap-3">
          <span className="w-12 shrink-0 text-[13px] text-[#A8A6C0]">지난주</span>
          <div className="h-2 flex-1 overflow-hidden border border-[#E4E2F0] bg-[#F4F3FC]">
            <div className="h-full bg-[#C7C3F7]" style={{ width: `${(lastWeekCount / maxCount) * 100}%` }} />
          </div>
          <span className="w-10 shrink-0 text-right text-[13px] font-semibold text-[#6B6882]">{lastWeekCount}회</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-12 shrink-0 text-[13px] text-[#A8A6C0]">이번 주</span>
          <div className="h-2 flex-1 overflow-hidden border border-[#E4E2F0] bg-[#F4F3FC]">
            <div className="h-full bg-[#007C70]" style={{ width: `${(item.query_count / maxCount) * 100}%` }} />
          </div>
          <span className="w-10 shrink-0 text-right text-[13px] font-semibold text-[#1A1826]">{item.query_count}회</span>
        </div>
      </div>

      {/* 질의 이력 */}
      <div className="flex items-center gap-1 pt-2 border-t border-[#E4E2F0]">
        <p className="text-[12px] font-semibold text-[#6B6882]">질의 이력</p>
        <HelpPopover sections={HELP_QUERY_HISTORY} />
      </div>
      <ul role="list" className="flex flex-col gap-1">
        {visibleQueries.map((q, i) => (
          <li key={i} className="flex items-center gap-2.5 min-w-0 py-0.5">
            <span className="text-[#C7C3F7] shrink-0">•</span>
            <button type="button"
              className="flex-1 min-w-0 text-left text-[13px] text-[#6B6882] hover:text-[#4F46E5] truncate transition-colors"
              title={q.text}>
              {q.text}
            </button>
            <time className="shrink-0 text-[12px] text-[#A8A6C0]">{formatQueryTime(q.occurred_at)}</time>
          </li>
        ))}
      </ul>

      {hiddenCount > 0 && (
        <button type="button"
          onClick={() => setExpanded(v => !v)}
          aria-expanded={expanded}
          className="self-start text-[13px] font-semibold text-[#28756C] hover:text-[#005E56] transition-colors">
          {expanded ? '질의 접기' : `질의 ${hiddenCount}건 더보기`}
        </button>
      )}
    </article>
  );
}

/* ══════════════════════════════════════════════════════════════
   블록 헤더
══════════════════════════════════════════════════════════════ */
function BlockHeader({ label, sub, help }: { label: string; sub: string; help: HelpSection[] }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[14px] font-bold text-[#1A1826]">{label}</span>
      <span className="text-[12px] text-[#A8A6C0]">{sub}</span>
      <HelpPopover sections={help} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   브리핑 페이지
══════════════════════════════════════════════════════════════ */
const showA = BLOCK_A.length > 0;
const showB = BLOCK_B.length > 0;
const showC = BLOCK_C.length > 0;

function subtitleText(): string {
  if (showA) return '최근 대화와 관련된 주제를 정리했습니다';
  if (showB || showC) return '이번 주 대화에서 눈에 띄는 주제입니다';
  return '우리 부서에서 이번 주 많이 확인한 주제입니다';
}

function BriefingPage() {
  if (!showA && !showB && !showC) return null;

  return (
    <HelpPopoverProvider>
      <div className="h-full overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="max-w-5xl mx-auto py-2">

          {/* ── 브리핑 카드 ─────────────────────────────────── */}
          <div role="region" aria-label="아침 브리핑"
            className="bg-white border border-[#E4E2F0] rounded-2xl overflow-hidden shadow-sm mb-6">

            {/* 카드 헤더 */}
            <div className="px-6 pt-5 pb-4 border-b border-[#E4E2F0] bg-[#F9F8FF]">
              <p className="text-[12px] text-[#A8A6C0] mb-1 font-medium brief-date">
                2026년 8월 9일 (일)
              </p>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-[19px] font-bold text-[#1A1826] leading-tight brief-title">
                  아침 브리핑
                </h1>
                <HelpPopover sections={HELP_COMMON} />
              </div>
              <p className="text-[12.5px] text-[#6B6882] brief-subtitle">{subtitleText()}</p>
            </div>

            <div className="px-6 py-5 flex flex-col gap-7">

              {/* 블록 A : 나에게 관련 */}
              {showA && (
                <section>
                  <BlockHeader label="나에게 관련" sub={`최대 ${BLOCK_A.length}건`} help={HELP_A} />
                  <div className="grid grid-cols-1 gap-3">
                    {BLOCK_A.map((item, index) => <ItemCard key={item.topic_id} item={item} rank={index + 1} />)}
                  </div>
                </section>
              )}

              {/* 블록 B : 급상승 주제 */}
              {showB && (
                <section>
                  <BlockHeader label="급상승 주제" sub={`최대 ${BLOCK_B.length}건`} help={HELP_B} />
                  <div className="grid grid-cols-1 gap-3">
                    {BLOCK_B.map((item, index) => <ItemCard key={item.topic_id} item={item} rank={index + 1} />)}
                  </div>
                </section>
              )}

              {/* 블록 C : 많이 본 주제 */}
              {showC && (
                <section>
                  <BlockHeader label="많이 본 주제" sub={`최대 ${BLOCK_C.length}건`} help={HELP_C} />
                  <div className="grid grid-cols-1 gap-3">
                    {BLOCK_C.map((item, index) => <ItemCard key={item.topic_id} item={item} rank={index + 1} />)}
                  </div>
                </section>
              )}
            </div>

            {/* 푸터 */}
            <div className="px-6 py-3 bg-[#F9F8FF] border-t border-[#E4E2F0]">
              <p className="text-[10.5px] text-[#A8A6C0] leading-relaxed">
                <span className="font-semibold text-[#6B6882]">안내 기준</span>&nbsp;
                이번 주 대화를 유사 그룹으로 클러스터링하고 전주 대비 증가율·고유사용자 수 기준으로 선별했습니다.
                타인 답변 본문은 표시하지 않으며, '바로 질문하기'로 본인 권한의 신규 대화를 시작합니다.
              </p>
            </div>
          </div>

        </div>
      </div>
    </HelpPopoverProvider>
  );
}

/* ══════════════════════════════════════════════════════════════
   모달 외곽 (상단 topbar + 콘텐츠)
══════════════════════════════════════════════════════════════ */
export default function BriefingModal({
  onClose,
  savedItems = [],
  savedPanelOpen = false,
  onToggleSavedPanel,
  onToggleSidebar,
  sidebarOpen = true,
  notifPanelOpen = false,
  notifUnread = 0,
  onToggleNotifPanel,
  onNavigate,
}: {
  onClose: () => void;
  savedItems?: SavedItem[];
  savedPanelOpen?: boolean;
  onToggleSavedPanel?: () => void;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
  notifPanelOpen?: boolean;
  notifUnread?: number;
  onToggleNotifPanel?: () => void;
  onNavigate?: (view: 'home' | 'market') => void;
}) {
  return (
    <div className="flex-1 flex flex-col h-full bg-white min-w-0 overflow-hidden">
      {/* Topbar */}
      <div className="h-12 flex items-center justify-between px-4 md:px-6 bg-white border-b border-[#E4E2F0] shrink-0">
        <div className="flex items-center gap-2">
          <button type="button" onClick={onToggleSidebar}
            aria-label={sidebarOpen ? '사이드바 접기' : '사이드바 펼치기'}
            className="p-1.5 rounded-lg text-[#A8A6C0] hover:text-[#4F46E5] hover:bg-[#F4F3FC] transition-colors">
            {sidebarOpen
              ? <ChevronLeft className="w-4 h-4" strokeWidth={2} />
              : <ChevronRight className="w-4 h-4" strokeWidth={2} />}
          </button>
          <Sparkles className="w-4 h-4 text-[#4F46E5]" strokeWidth={1.8} />
          <span className="text-base font-bold text-[#1A1826]">아침 브리핑</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 text-[12px] text-[#A8A6C0]">
            <RefreshCw className="w-3 h-3" strokeWidth={1.8} />
            <span>매일 08:30 갱신</span>
          </div>
          <Tooltip label="알림 센터 열기" position="bottom">
            <button type="button" onClick={onToggleNotifPanel}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border ${
                notifPanelOpen
                  ? 'bg-[#EEEEFF] border-[#C7C3F7] text-[#4F46E5]'
                  : 'bg-white border-[#E4E2F0] text-[#6B6882] hover:border-[#C7C3F7] hover:text-[#4F46E5] hover:bg-[#F4F3FC]'
              }`}>
              <Bell className="w-3.5 h-3.5" strokeWidth={1.8} />
              <span className="hidden sm:inline">알림</span>
              {notifUnread > 0 && (
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-[#4F46E5] text-white">
                  {notifUnread}
                </span>
              )}
            </button>
          </Tooltip>
          <Tooltip label="비서마켓 열기" position="bottom">
            <button type="button" onClick={() => onNavigate?.('market')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border bg-white border-[#E4E2F0] text-[#6B6882] hover:border-[#C7C3F7] hover:text-[#4F46E5] hover:bg-[#F4F3FC]">
              <Store className="w-3.5 h-3.5" strokeWidth={1.8} />
              <span className="hidden sm:inline">비서마켓</span>
            </button>
          </Tooltip>
          <Tooltip label="브리핑 닫기" position="bottom">
            <button type="button" onClick={onClose} aria-label="닫기"
              className="p-1.5 rounded-lg text-[#A8A6C0] hover:text-[#1A1826] hover:bg-[#F4F3FC] transition-colors ml-1">
              <X style={{ width: 18, height: 18 }} strokeWidth={1.8} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden px-6 py-6">
        <BriefingPage />
      </div>
    </div>
  );
}
