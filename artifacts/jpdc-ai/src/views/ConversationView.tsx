import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { SavedItem } from '../components/SavedPanel';
import Tooltip from '../components/Tooltip';
import { useTheme } from '../context/ThemeContext';
import jpdcLogo from '../assets/jpdc-logo.png';
import {
  Sparkles, Share, MoreHorizontal, Paperclip, Mic, Menu, Store,
  ChevronDown, ChevronLeft, ChevronRight, ArrowUp, FileText, RotateCcw, ThumbsUp, ThumbsDown,
  Copy, Bookmark, FileDown, MessageSquare, X, BookmarkCheck, Bell,
  PenTool, Code, Globe, BookOpen, BarChart2, Mic2, Users, ClipboardList, CheckCircle2,
  TrendingUp, ArrowRight, Pencil, RefreshCw, Check, Database, Layers, type LucideIcon,
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, ResponsiveContainer, Legend,
} from 'recharts';

/* ── 질의별 답변 맵 ─────────────────────────────────────────── */
const ANSWER_MAP: Record<string, { answer: string; sources: { title: string; type: string }[] }> = {
  '입고 처리가 안 된 작업지시가 있어?': {
    answer: `작업지시의 입고 처리 기준을 확인했습니다.

입고 대상 작업지시는 생산 완료 후 검수와 수량 확인이 끝나야 입고 처리할 수 있습니다. 검수 전이거나 수량이 맞지 않는 경우에는 **입고 미처리** 상태로 유지하고 담당자가 확인해야 합니다.

이번 조회 결과는 TAG 데이터에서 확인하며, 미처리 건은 아래 작업지시 조회 결과와 함께 확인할 수 있습니다.`,
    sources: [
      { title: '자재 입고 처리 업무 지침 제7조', type: '내부지침' },
      { title: '작업지시 및 재고관리 표준 절차서', type: '업무절차' },
      { title: '검수·입고 확인 체크리스트', type: '체크리스트' },
    ],
  },
  '입고 처리가 안된 작업 방법알려줘': {
    answer: `입고 처리가 안 된 작업은 생산 완료 여부와 검수 결과를 먼저 확인한 뒤 처리합니다.

1. 작업지시의 생산 완료 상태와 입고 대상 수량을 확인합니다.
2. 검수 결과 및 실물 수량이 작업지시와 일치하는지 확인합니다.
3. 이상이 없으면 ERP에서 입고 처리하고, 차이가 있으면 담당자 확인 후 보류합니다.

검수 전이거나 수량이 맞지 않는 작업은 임의로 입고 처리하지 않아야 합니다.`,
    sources: [
      { title: '자재 입고 처리 업무 지침 제7조', type: '내부지침' },
      { title: '검수·입고 확인 체크리스트', type: '체크리스트' },
    ],
  },
  '계약 협상 중인 단가 정보는 어떤 기준으로 보호되나요?': {
    answer: `계약 협상 중인 단가 정보는 공공기관 보안업무규정 및 계약사무처리규정에 따라 다음 기준으로 보호됩니다.

**1. 보호 범위**
입찰 진행 중이거나 협상 중인 단가·수량·조건 등 계약 관련 세부 정보는 계약 체결 완료 전까지 대외비로 분류됩니다. 예정가격, 설계금액, 기초금액 등이 여기에 해당합니다.

**2. 열람·공유 제한**
해당 정보는 계약 담당 부서 내 업무 관련자만 열람 가능하며, 타 부서 직원 또는 외부에 공유하는 것은 엄격히 금지됩니다.

**3. 위반 시 제재**
단가 정보를 무단 유출하거나 입찰 참가자에게 제공한 경우, 국가계약법 제27조 및 형법상 입찰방해죄가 적용될 수 있으며 관련자는 징계 조치됩니다.

**4. 정보 공개 시점**
계약 체결 완료 후에는 계약금액이 공개 원칙이나, 단가 세부 내역은 영업비밀 보호 사유로 부분 비공개가 가능합니다.`,
    sources: [
      { title: '국가계약법 제27조 (입찰 참가자격 제한)', type: '법령' },
      { title: '계약사무처리규정 제15조', type: '내부지침' },
      { title: '공공기관 보안업무규정 제18조', type: '법령' },
    ],
  },
};

const DEFAULT_ANSWER = `공공기관 보안업무규정 및 내부 정보보안 지침에 따르면, 외부 반출이 금지되는 자료의 범위는 다음과 같습니다.

**1. 비밀 및 대외비 문서**
보안등급이 부여된 1·2·3급 비밀 문서와 '대외비' 표시가 된 내부 결재 문서는 일체 반출이 금지됩니다. 미결재 기안문·초안도 동일하게 적용됩니다.

**2. 개인정보 포함 자료**
직원 인사기록·급여 명세·건강검진 결과, 민원인의 주민등록번호·연락처 등 개인식별정보가 포함된 자료는 반출 금지 대상입니다.

**3. 업무 관련 내부 자료**
공표 전 예산 편성 세부 내역, 감사 결과 보고서, 징계 관련 자료, 계약 협상 중인 단가·조건 정보가 해당됩니다.

단, 공식 배포된 보도자료·이미 공개된 정책 문서·법령 정보는 반출 제한 대상이 아닙니다.

반출이 필요한 경우 소속 부서장의 **사전 승인**을 받아야 하며, 승인 내역은 보안 일지에 기록해야 합니다.`;

const DEFAULT_SOURCES = [
  { title: '공공기관 보안업무규정 제24조', type: '법령' },
  { title: '내부 정보보안 지침 3-2항', type: '내부지침' },
  { title: '개인정보 보호법 시행령 제29조', type: '법령' },
];

function getAnswerData(query: string) {
  const normalized = normalizeRagTagQuery(query);
  if (normalized.replace(/\s+/g, '') === ROUTE_SELECTION_QUERY.replace(/\s+/g, '')) {
    return ANSWER_MAP[ROUTE_SELECTION_QUERY];
  }
  return ANSWER_MAP[normalized] ?? { answer: DEFAULT_ANSWER, sources: DEFAULT_SOURCES };
}

/* ══════════════════════════════════════════════════════════════
   질의 분류 시스템
══════════════════════════════════════════════════════════════ */
export type QueryKind = 'instruction' | 'assistant-select' | 'tag-stats' | 'tag-assistant' | 'dual-tag' | 'dual-tag-assistant' | 'ambiguous' | 'route-select' | 'rag-ab' | 'rag-tag-assistant' | 'minutes-request' | 'minutes-result' | 'fallback' | 'fallback-assistant';

// 특정 질의 → rag-ab 강제 분류
const RAG_AB_QUERIES = new Set(['삼다수 브랜드 관리 지침 알려줘']);

// 특정 질의 → RAG 지침 + TAG 현황 + 비서 추천 복합 출력
const RAG_TAG_ASSISTANT_QUERY = '입고 처리가 안 된 작업지시가 있어?';
const RAG_TAG_ASSISTANT_QUERIES = new Set([RAG_TAG_ASSISTANT_QUERY]);

const ROUTE_SELECTION_QUERY = '입고 처리가 안된 작업 방법알려줘';

function normalizeRagTagQuery(text: string): string {
  return text
    .replace(/\u200B/g, '')
    .replace(/\s*\(?RAG\+TAG\+비서\)?\s*$/, '')
    .trim();
}

// 특정 질의 → dual-tag-assistant 강제 분류 (분할 통계 후 비서 추천)
const DUAL_TAG_ASSISTANT_QUERIES = new Set(['3월 생산량 합계 보여줘 (TAG/분할/비서)']);

// 특정 질의 → dual-tag 강제 분류
const DUAL_TAG_QUERIES = new Set(['3월 생산량 합계 보여줘']);

// 특정 질의 → tag-assistant 강제 분류 (TAG 통계 후 비서 추천)
const TAG_ASSISTANT_QUERIES = new Set(['비서 유형 활용 현황 구해줘 (TAG+비서)']);

// 특정 질의 → fallback 강제 분류
const FALLBACK_QUERIES = new Set(['회의록 작성 어떻게 해? (미식별 후 비서 추천)']);

// 특정 질의 → fallback-assistant 강제 분류 (비서 찾기 → 지침 찾기 순 이중 출력)
const FALLBACK_ASSISTANT_QUERIES = new Set(['회의록 작성 잘 하는법']);

function classifyQuery(text: string): QueryKind {
  const normalized = normalizeRagTagQuery(text);
  if (normalized.replace(/\s+/g, '') === ROUTE_SELECTION_QUERY.replace(/\s+/g, '')) return 'route-select';
  if (RAG_AB_QUERIES.has(normalized)) return 'rag-ab';
  if (RAG_TAG_ASSISTANT_QUERIES.has(normalized)) return 'rag-tag-assistant';
  if (DUAL_TAG_ASSISTANT_QUERIES.has(normalized)) return 'dual-tag-assistant';
  if (DUAL_TAG_QUERIES.has(normalized)) return 'dual-tag';
  if (TAG_ASSISTANT_QUERIES.has(normalized)) return 'tag-assistant';
  if (FALLBACK_QUERIES.has(normalized)) return 'fallback';
  if (FALLBACK_ASSISTANT_QUERIES.has(normalized)) return 'fallback-assistant';

  const TAG_KWS = [
    '통계', '현황', '추이', '얼마나', '몇 명', '몇명', '몇 건', '몇건',
    '비율', '평균', '월별', '분기', '연도별', '연도', '랭킹', '상위',
    '건수', '사용량', '사용률', '이용률', '집계', '몇회', '몇 회', '얼마',
    '얼마나 됩', '몇 개', '몇개', '추이를', '변화', '합계', '생산량', '보여줘',
  ];
  if (TAG_KWS.some(k => normalized.includes(k))) return 'tag-stats';

  const ASSISTANT_KWS = [
    '작성해', '번역해', '요약해', '리뷰해', '변환해', '분석해',
    '만들어', '해줘', '생성해', '정리해줘', '써줘', '검토해', '교정해',
    '번역', '요약', '리뷰', '정리해', '작성', '만들어줘',
  ];
  const hasAssistant = ASSISTANT_KWS.some(k => normalized.includes(k));

  // 명확한 지침/규정 질의 신호
  const INSTRUCTION_KWS = [
    '규정', '지침', '법령', '절차', '기준', '범위', '금지', '허용',
    '가능', '방법', '안내', '처리', '보호', '확인', '어떻게', '무엇',
    '어디', '어떤', '왜', '언제', '어느', '어떻습니까', '어떻게 되나요',
    '어떻게 해', '어떻게 처리', '어떻게 됩', '어떻게 하면',
    '보안', '비밀', '대외비', '열람', '공개', '반출', '승인', '제재',
  ];
  const hasInstruction = INSTRUCTION_KWS.some(k => normalized.includes(k));

  // 두 신호 동시 → 의도 불명확 (분할 패널)
  if (hasAssistant && hasInstruction) return 'ambiguous';
  if (hasInstruction) return 'instruction';
  if (hasAssistant) return 'assistant-select';

  // 신호 없음 → 의도 불명확
  return 'ambiguous';
}

/* ── 비서 후보 ─────────────────────────────────────────────── */
interface CandidateAssistant {
  id: string;
  name: string;
  desc: string;
  icon: LucideIcon;
  category: string;
  users: string;
  match: number;
}

const ALL_CANDIDATES: CandidateAssistant[] = [
  { id: 'meeting',   name: '회의록 문장정리',  desc: '회의 내용을 체계적인 문서로 자동 정리',    icon: PenTool,   category: '글쓰기', users: '12.4k', match: 88 },
  { id: 'email',     name: '이메일 문체변경',  desc: '격식·비격식 문체를 자동으로 변환',          icon: Mic2,      category: '글쓰기', users: '9.1k',  match: 82 },
  { id: 'translate', name: '번역 비서',         desc: '다국어 고품질 자연스러운 번역',              icon: Globe,     category: '번역',   users: '7.2k',  match: 77 },
  { id: 'code',      name: '코드 리뷰 비서',   desc: '버그·스타일 자동 리뷰 및 개선 제안',        icon: Code,      category: '코드',   users: '5.8k',  match: 72 },
  { id: 'summary',   name: '문서 요약 비서',   desc: 'PDF·계약서를 핵심만 간추려 정리',           icon: BookOpen,  category: '분석',   users: '4.9k',  match: 67 },
  { id: 'data',      name: '데이터 분석 비서', desc: '엑셀·CSV를 차트와 인사이트로 변환',         icon: BarChart2, category: '분석',   users: '8.7k',  match: 63 },
  { id: 'press',     name: '보도자료 초안',    desc: '전문 보도자료 형식으로 자동 작성',           icon: FileText,  category: '글쓰기', users: '6.3k',  match: 59 },
];

const INVENTORY_CANDIDATE: CandidateAssistant = {
  id: 'inventory',
  name: '입고 작업지시 관리 비서',
  desc: '입고 미처리 작업지시를 조회하고 담당 업무를 안내',
  icon: ClipboardList,
  category: '업무관리',
  users: '3.8k',
  match: 98,
};

function getAssistantCandidates(query: string): CandidateAssistant[] {
  const t = query;
  if (t.includes('입고') && (t.includes('작업지시') || t.includes('작업 방법'))) {
    return [INVENTORY_CANDIDATE, ...ALL_CANDIDATES.filter(c => ['meeting', 'press', 'email'].includes(c.id))];
  }
  return ALL_CANDIDATES
    .map(c => {
      let score = c.match;
      if ((t.includes('번역')) && c.id === 'translate') score = 97;
      if ((t.includes('코드') || t.includes('리뷰')) && c.id === 'code') score = 97;
      if ((t.includes('요약') || t.includes('문서')) && c.id === 'summary') score = 97;
      if ((t.includes('분석') || t.includes('데이터')) && c.id === 'data') score = 97;
      if ((t.includes('이메일') || t.includes('문체') || t.includes('글')) && c.id === 'email') score = 97;
      if ((t.includes('회의') || t.includes('정리') || t.includes('회의록')) && c.id === 'meeting') score = 97;
      if ((t.includes('보도') || t.includes('작성')) && c.id === 'press') score = 97;
      return { ...c, match: score };
    })
    .sort((a, b) => b.match - a.match)
    .slice(0, 4);
}

/* ── TAG 통계 데이터 ───────────────────────────────────────── */
interface StatsRow { label: string; value: number; unit: string }
interface StatsData {
  answer: string;
  tableTitle: string;
  rows: StatsRow[];
  chartType: 'bar' | 'line';
  summary: { label: string; value: string; positive?: boolean }[];
}

/* ── Dual TAG 데이터 ────────────────────────────────────────── */
interface DualTagInterpretation {
  title: string;
  description: string;
  params: { key: string; value: string }[];
  sqlQuery: string;
  columns: string[];
  rows: (string | number)[][];
  chartData: { label: string; value: number }[];
  chartUnit: string;
}
interface DualTagData {
  introText: string;
  interpretation1: DualTagInterpretation;
  interpretation2: DualTagInterpretation;
}

function getDualTagData(_query: string): DualTagData {
  return {
    introText: `**3월 생산량** 합계 데이터를 두 가지 관점으로 해석했습니다. 각 해석의 파라미터를 수정하거나 재조회할 수 있습니다.`,
    interpretation1: {
      title: '해석 1 — 제품별 합계',
      description: '3월 제품 유형별 생산량 합계를 조회합니다',
      params: [
        { key: '월', value: '3월' },
        { key: '연도', value: '2026' },
        { key: '집계기준', value: '제품별' },
      ],
      sqlQuery:
        'SELECT product_name,\n       SUM(qty) AS total_qty,\n       ROUND(SUM(qty)*100.0\n         /SUM(SUM(qty)) OVER(), 1) AS ratio\nFROM   production_log\nWHERE  year = 2026 AND month = 3\nGROUP  BY product_name\nORDER  BY total_qty DESC;',
      columns: ['제품명', '생산량 (병)', '비율 (%)'],
      rows: [
        ['제주삼다수 2L',    '1,842,000', '38.4%'],
        ['제주삼다수 500mL', '1,520,000', '31.7%'],
        ['제주삼다수 330mL', '980,000',   '20.4%'],
        ['기타 제품',        '455,000',    '9.5%'],
      ],
      chartData: [
        { label: '2L',    value: 1842000 },
        { label: '500mL', value: 1520000 },
        { label: '330mL', value: 980000  },
        { label: '기타',   value: 455000  },
      ],
      chartUnit: '병',
    },
    interpretation2: {
      title: '해석 2 — 라인별 합계',
      description: '3월 생산 라인별 가동 실적 합계를 조회합니다',
      params: [
        { key: '월', value: '3월' },
        { key: '연도', value: '2026' },
        { key: '집계기준', value: '라인별' },
      ],
      sqlQuery:
        'SELECT line_id, line_name,\n       SUM(qty) AS total_qty\nFROM   production_log\nWHERE  year = 2026 AND month = 3\nGROUP  BY line_id, line_name\nORDER  BY total_qty DESC;',
      columns: ['라인 ID', '라인명', '생산량 (병)'],
      rows: [
        ['L-01', '1라인 (고속)',   '1,650,000'],
        ['L-02', '2라인 (표준)',   '1,420,000'],
        ['L-03', '3라인 (소용량)', '980,000'],
        ['L-04', '4라인 (신규)',   '747,000'],
      ],
      chartData: [
        { label: 'L-01', value: 1650000 },
        { label: 'L-02', value: 1420000 },
        { label: 'L-03', value: 980000  },
        { label: 'L-04', value: 747000  },
      ],
      chartUnit: '병',
    },
  };
}

function getTagStatsData(query: string): StatsData {
  const t = query;
  const compact = t.replace(/\s+/g, '');

  if (compact.includes('입고') && (compact.includes('작업지시') || compact.includes('작업방법'))) {
    return {
      answer: `입고 처리 상태를 작업지시 기준으로 조회했습니다.

현재 **입고 처리가 완료되지 않은 작업지시가 7건** 있습니다. 이 중 3건은 검수 대기, 2건은 수량 확인 필요, 2건은 담당자 처리 대기 상태입니다.`,
      tableTitle: '작업지시 입고 처리 현황',
      rows: [
        { label: '전체 작업지시', value: 30, unit: '건' },
        { label: '입고 처리 완료', value: 23, unit: '건' },
        { label: '입고 미처리', value: 7, unit: '건' },
      ],
      chartType: 'bar',
      summary: [
        { label: '입고 미처리', value: '7건' },
        { label: '처리 완료율', value: '76.7%' },
        { label: '확인 필요', value: '5건' },
      ],
    };
  }

  if (t.includes('사용') || t.includes('이용')) {
    return {
      answer: `JPDC AI **사용 현황**을 조회했습니다.\n\n최근 6개월간 전체 질의 건수는 꾸준한 증가 추세이며, 이번 달(7월)은 전월 대비 **+18.3%** 증가한 4,821건이 접수되었습니다.\n\n부서별로는 정책기획과(32%), 법무담당관실(24%), 민원지원팀(19%) 순으로 이용률이 높게 나타났습니다.`,
      tableTitle: '월별 JPDC AI 사용 건수',
      rows: [
        { label: '2월', value: 1840, unit: '건' }, { label: '3월', value: 2210, unit: '건' },
        { label: '4월', value: 2890, unit: '건' }, { label: '5월', value: 3420, unit: '건' },
        { label: '6월', value: 4077, unit: '건' }, { label: '7월', value: 4821, unit: '건' },
      ],
      chartType: 'bar',
      summary: [
        { label: '이번 달 질의', value: '4,821건', positive: true },
        { label: '전월 대비', value: '+18.3%', positive: true },
        { label: '월 평균', value: '3,210건' },
      ],
    };
  }

  if (t.includes('비서') || t.includes('AI')) {
    return {
      answer: `비서 유형별 **활용 현황**을 분석했습니다.\n\n회의록 문장정리 비서가 이번 달 **2,341건**으로 전체의 34%를 차지하며 1위를 유지하고 있습니다. 법률 자문 비서는 신규 배포 이후 빠르게 성장 중이며, 전월 대비 **+62%** 의 증가율을 보였습니다.`,
      tableTitle: '비서별 월간 사용 현황 (7월)',
      rows: [
        { label: '회의록정리', value: 2341, unit: '건' }, { label: '이메일변경', value: 1820, unit: '건' },
        { label: '번역비서',   value: 1430, unit: '건' }, { label: '법률자문',   value: 980,  unit: '건' },
        { label: '문서요약',   value: 710,  unit: '건' }, { label: '기타',       value: 540,  unit: '건' },
      ],
      chartType: 'bar',
      summary: [
        { label: '전체 비서 수', value: '18종' },
        { label: '최다 사용', value: '회의록정리', positive: true },
        { label: '최고 성장률', value: '법률자문 +62%', positive: true },
      ],
    };
  }

  if (t.includes('5월') && (t.includes('생산량') || t.includes('월별'))) {
    return {
      answer: `**5월 월별 생산량** 현황을 조회했습니다.\n\n5월 총 생산량은 **4,797,000병**으로 전월(4월) 대비 **+9.2%** 증가했습니다. 제주 현장의 성수기 가동률 상승이 주된 요인으로 분석되며, 2라인 증설 효과가 본격 반영된 것으로 보입니다.\n\n월간 목표 대비 달성률은 **102.1%** 로 목표를 초과 달성했습니다.`,
      tableTitle: '월별 생산량 추이 (2026년 1월~5월)',
      rows: [
        { label: '1월', value: 3820000, unit: '병' },
        { label: '2월', value: 3540000, unit: '병' },
        { label: '3월', value: 4797000, unit: '병' },
        { label: '4월', value: 4392000, unit: '병' },
        { label: '5월', value: 4797000, unit: '병' },
      ],
      chartType: 'bar',
      summary: [
        { label: '5월 생산량',  value: '4,797,000병', positive: true },
        { label: '전월 대비',   value: '+9.2%', positive: true },
        { label: '목표 달성률', value: '102.1%', positive: true },
      ],
    };
  }

  if (t.includes('민원') || t.includes('접수')) {
    return {
      answer: `**민원 접수 현황**을 조회했습니다.\n\n올해 상반기 전체 민원 건수는 총 14,832건으로 전년 동기 대비 **+7.4%** 증가했습니다. 5월에 일시적으로 급증한 것은 연간 정기 점검 기간과 맞물린 영향으로 분석됩니다.\n\n처리 완료율은 평균 **94.2%** 로 전년도(91.8%) 대비 개선되었습니다.`,
      tableTitle: '월별 민원 접수 건수 (2026년)',
      rows: [
        { label: '1월', value: 2140, unit: '건' }, { label: '2월', value: 1980, unit: '건' },
        { label: '3월', value: 2450, unit: '건' }, { label: '4월', value: 2620, unit: '건' },
        { label: '5월', value: 3110, unit: '건' }, { label: '6월', value: 2532, unit: '건' },
      ],
      chartType: 'line',
      summary: [
        { label: '상반기 합계', value: '14,832건' },
        { label: '전년 대비', value: '+7.4%', positive: true },
        { label: '처리 완료율', value: '94.2%', positive: true },
      ],
    };
  }

  /* default */
  return {
    answer: `요청하신 **통계 데이터**를 조회했습니다.\n\n분석 결과, 최근 6개월 동안 전반적인 증가 추세가 확인되었으며, 특히 **2분기(4~6월)** 에 집중적인 성장이 있었습니다.\n\n전월 대비 증가율은 평균 **+14.2%** 로, 연간 목표치 대비 현재 **73.4%** 진척률을 기록 중입니다.`,
    tableTitle: '월별 현황 (최근 6개월)',
    rows: [
      { label: '2월', value: 124, unit: '건' }, { label: '3월', value: 189, unit: '건' },
      { label: '4월', value: 241, unit: '건' }, { label: '5월', value: 308, unit: '건' },
      { label: '6월', value: 372, unit: '건' }, { label: '7월', value: 415, unit: '건' },
    ],
    chartType: 'bar',
    summary: [
      { label: '최근 값',    value: '415건' },
      { label: '전월 대비',  value: '+14.2%', positive: true },
      { label: '목표 달성률', value: '73.4%' },
    ],
  };
}

/* ── Markdown-lite 렌더러 ──────────────────────────────────── */
function renderText(text: string) {
  return text.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} className="font-bold text-[#1A1826]">{part.slice(2, -2)}</strong>;
      }
      return <span key={j}>{part}</span>;
    });
    return <p key={i} className={`${line === '' ? 'mt-2' : ''} leading-relaxed`}>{parts}</p>;
  });
}

/* ── 스트리밍 AI 답변 ─────────────────────────────────────── */
function StreamingAnswer({ answer, onDone }: { answer: string; onDone: () => void }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const idx = useRef(0);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      const interval = setInterval(() => {
        if (idx.current >= answer.length) {
          clearInterval(interval);
          setDone(true);
          onDone();
          return;
        }
        const chunk = Math.floor(Math.random() * 3) + 1;
        idx.current = Math.min(idx.current + chunk, answer.length);
        setDisplayed(answer.slice(0, idx.current));
      }, 18);
      return () => clearInterval(interval);
    }, 600);
    return () => clearTimeout(startTimer);
  }, [answer, onDone]);

  return (
    <div className="text-[13.5px] text-[#1A1826] space-y-0.5">
      {renderText(displayed)}
      {!done && (
        <span className="inline-block w-0.5 h-4 bg-[#4F46E5] animate-pulse ml-0.5 align-middle" />
      )}
    </div>
  );
}

/* ── 액션 버튼 바 ─────────────────────────────────────────── */
const FEEDBACK_AXES = [
  { code: 'ACCURACY',      upLabel: '내용이 정확함',          downLabel: '내용이 부정확함' },
  { code: 'SOURCE',        upLabel: '출처·근거가 명확함',      downLabel: '출처가 없거나 잘못됨' },
  { code: 'RELEVANCE',     upLabel: '질문 의도를 정확히 파악함', downLabel: '질문과 무관한 답변임' },
  { code: 'COMPLETENESS',  upLabel: '필요한 내용이 충분함',    downLabel: '핵심 내용이 누락됨' },
  { code: 'RECENCY',       upLabel: '최신 기준이 반영됨',      downLabel: '개정 전·폐지된 내용임' },
  { code: 'DATA',          upLabel: '조회·집계 결과가 유용함', downLabel: '수치·집계 결과가 잘못됨' },
  { code: 'FORMAT',        upLabel: '정리가 잘 되어 읽기 쉬움', downLabel: '형식이 깨지거나 장황함' },
  { code: 'ACTIONABILITY', upLabel: '업무에 바로 활용 가능함', downLabel: '실제 업무에 쓸 수 없음' },
];

function ActionBar({ query, answer, sources, onSave }: {
  query: string;
  answer: string;
  sources: { title: string; type: string }[];
  onSave: () => void;
}) {
  const [liked, setLiked] = useState<'up' | 'down' | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<'up' | 'down' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackHover, setFeedbackHover] = useState(0);
  const [feedbackReasons, setFeedbackReasons] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleReason = (code: string) =>
    setFeedbackReasons(prev => { const s = new Set(prev); s.has(code) ? s.delete(code) : s.add(code); return s; });

  const handleSave = () => { onSave(); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const handleCopy = () => {
    navigator.clipboard.writeText(`Q. ${query}\n\n${answer}`).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handleMD = () => {
    const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
    const md = [`# JPDC AI 대화 기록`, `> 날짜: ${today}`, ``, `---`, ``, `## 질문`, ``, query, ``, `## 답변`, ``, answer, ``, `---`, ``, `### 참고 문서`, ``, ...sources.map(s => `- ${s.title} (${s.type})`)].join('\n');
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `JPDC_AI_대화_${Date.now()}.md`; a.click(); URL.revokeObjectURL(url);
  };

  const iconBtn = (label: string, icon: React.ReactNode, onClick?: () => void, active = false) => (
    <Tooltip label={label}>
      <button type="button" onClick={onClick}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-[#4F46E5]/10 text-[#4F46E5]' : 'text-[#6B6882] hover:text-[#4F46E5] hover:bg-[#F4F3FC]'}`}>
        {icon}{label}
      </button>
    </Tooltip>
  );

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center flex-wrap gap-1 px-1">
        <Tooltip label="도움이 됐어요">
          <button type="button" onClick={() => { setLiked('up'); setFeedbackModal('up'); setFeedbackText(''); }}
            className={`p-1.5 rounded-lg transition-colors ${liked === 'up' ? 'text-[#10B981] bg-[#ECFDF5]' : 'text-[#A8A6C0] hover:text-[#10B981] hover:bg-[#ECFDF5]'}`}>
            <ThumbsUp className="w-3.5 h-3.5" strokeWidth={1.8} />
          </button>
        </Tooltip>
        <Tooltip label="도움이 안 됐어요">
          <button type="button" onClick={() => { setLiked('down'); setFeedbackModal('down'); setFeedbackText(''); }}
            className={`p-1.5 rounded-lg transition-colors ${liked === 'down' ? 'text-[#EF4444] bg-[#FEF2F2]' : 'text-[#A8A6C0] hover:text-[#EF4444] hover:bg-[#FEF2F2]'}`}>
            <ThumbsDown className="w-3.5 h-3.5" strokeWidth={1.8} />
          </button>
        </Tooltip>
        <span className="w-px h-4 bg-[#E4E2F0] mx-1" />
        <Tooltip label="저장목록에 추가">
          <button type="button" onClick={handleSave}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${saved ? 'bg-[#10B981]/10 text-[#10B981]' : 'text-[#6B6882] hover:text-[#4F46E5] hover:bg-[#F4F3FC]'}`}>
            <Bookmark className={`w-3.5 h-3.5 transition-all duration-200 ${saved ? 'fill-[#10B981]' : ''}`} strokeWidth={1.8} />
            {saved ? '저장됨' : '저장'}
          </button>
        </Tooltip>
        <Tooltip label="클립보드에 복사">
          <button type="button" onClick={handleCopy}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${copied ? 'bg-[#4F46E5]/10 text-[#4F46E5]' : 'text-[#6B6882] hover:text-[#4F46E5] hover:bg-[#F4F3FC]'}`}>
            <Copy className="w-3.5 h-3.5" strokeWidth={1.8} />
            {copied ? '복사됨' : '복사'}
          </button>
        </Tooltip>
        {iconBtn('MD', <FileDown className="w-3.5 h-3.5" strokeWidth={1.8} />, handleMD)}
        <div className="ml-auto">
          {iconBtn('재생성', <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.8} />)}
        </div>
      </div>

      {feedbackModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => setFeedbackModal(null)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
          <div className="relative z-10 w-full max-w-[480px] bg-white rounded-2xl shadow-2xl border border-[#E4E2F0] p-6" onClick={e => e.stopPropagation()}>
            <p className="text-[19px] font-bold text-[#1A1826] mb-4">
              {feedbackModal === 'up' ? '긍정적인 피드백 제공' : '부정적인 피드백 제공'}
            </p>
            <div className="mb-5">
              <p className="text-[14px] text-[#6B6882] mb-2">평가 점수 (선택 사항)</p>
              {(() => {
                const isUp = feedbackModal === 'up';
                const positiveColor = '#10B981';
                const negativeColor = '#EF4444';
                const positiveOutline = '#D1FAE5';
                const negativeOutline = '#FECACA';
                const positiveLabels = ['', '조금 도움됨', '도움됨', '꽤 도움됨', '많이 도움됨', '매우 도움됨'];
                const negativeLabels = ['', '조금 아쉬움', '아쉬움', '불만족', '매우 불만족', '매우 부적절'];
                const selectedLevel = Math.abs(feedbackRating);
                const previewRating = feedbackHover || feedbackRating;
                const previewLevel = Math.abs(previewRating);
                const labels = isUp ? positiveLabels : negativeLabels;
                const chooseRating = (side: 'up' | 'down', level: number) => {
                  if ((isUp && side !== 'up') || (!isUp && side !== 'down')) return;
                  const signedRating = side === 'up' ? level : -level;
                  setFeedbackRating(feedbackRating === signedRating ? 0 : signedRating);
                };
                const renderRatingStar = (side: 'up' | 'down', level: number) => {
                  const enabled = (isUp && side === 'up') || (!isUp && side === 'down');
                  const active = previewRating !== 0 && previewRating > 0 === (side === 'up') && previewLevel >= level;
                  const color = side === 'up' ? positiveColor : negativeColor;
                  const outline = side === 'up' ? positiveOutline : negativeOutline;
                  return (
                    <button
                      key={`${side}-${level}`}
                      type="button"
                      disabled={!enabled}
                      aria-label={`${side === 'up' ? '좋아요' : '싫어요'} ${level}점`}
                      onClick={() => chooseRating(side, level)}
                      onMouseEnter={() => enabled && setFeedbackHover(side === 'up' ? level : -level)}
                      onMouseLeave={() => setFeedbackHover(0)}
                      className={`transition-transform ${enabled ? 'hover:scale-110' : 'cursor-not-allowed opacity-30'}`}
                    >
                      <svg viewBox="0 0 20 20" className="w-6 h-6 sm:w-7 sm:h-7" fill="none">
                        <path d="M10 2l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 14.27l-4.77 2.44.91-5.32L2.27 7.62l5.34-.78L10 2z"
                          fill={active ? color : '#E4E2F0'}
                          stroke={active ? color : outline}
                          strokeWidth="1" strokeLinejoin="round" />
                      </svg>
                    </button>
                  );
                };
                return (
                  <div className="rounded-xl border border-[#E4E2F0] bg-[#FAFAFA] px-3 py-3">
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center mb-2">
                      <span className="text-center text-[13px] font-bold text-[#EF4444]">싫어요</span>
                      <span className="w-6 text-center text-[13px] font-semibold text-[#A8A6C0]">0</span>
                      <span className="text-center text-[13px] font-bold text-[#10B981]">좋아요</span>
                    </div>
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center">
                      <div className="flex justify-center gap-0.5">
                        {[5, 4, 3, 2, 1].map(level => renderRatingStar('down', level))}
                      </div>
                      <div className="w-px h-8 bg-[#D8D6E6] mx-2" aria-hidden="true" />
                      <div className="flex justify-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(level => renderRatingStar('up', level))}
                      </div>
                    </div>
                    {selectedLevel > 0 && (
                      <p className={`text-center text-[13px] font-semibold mt-2 ${isUp ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {labels[selectedLevel]}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
            {/* 사유 선택 */}
            <div className="mb-5">
              <p className="text-[14px] text-[#6B6882] mb-2.5">사유를 선택해 주세요. (복수 선택 가능)</p>
              <div className="flex flex-wrap gap-2">
                {FEEDBACK_AXES.map(({ code, upLabel, downLabel }) => {
                  const label = feedbackModal === 'up' ? upLabel : downLabel;
                  const selected = feedbackReasons.has(code);
                  const isUp = feedbackModal === 'up';
                  return (
                    <button key={code} type="button" onClick={() => toggleReason(code)}
                      className={`px-3 py-1.5 rounded-full text-[13px] font-medium border transition-all duration-150 ${
                        selected
                          ? isUp
                            ? 'bg-[#10B981] border-[#10B981] text-white shadow-sm'
                            : 'bg-[#EF4444] border-[#EF4444] text-white shadow-sm'
                          : isUp
                            ? 'bg-white border-[#D1FAE5] text-[#059669] hover:bg-[#F0FDF4] hover:border-[#10B981]'
                            : 'bg-white border-[#FECACA] text-[#DC2626] hover:bg-[#FEF2F2] hover:border-[#EF4444]'
                      }`}>
                      {selected && <span className="mr-1">{isUp ? '✓' : '✕'}</span>}
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-[14px] text-[#6B6882] mb-3">세부 정보를 제공해 주세요. (선택 사항)</p>
            <div className={`relative rounded-xl border-2 transition-colors ${feedbackText ? 'border-[#4F46E5]' : 'border-[#E4E2F0] focus-within:border-[#4F46E5]'}`}>
              <textarea autoFocus value={feedbackText} onChange={e => setFeedbackText(e.target.value)}
                placeholder={feedbackModal === 'up' ? '이 응답의 어떤 점이 만족스러웠나요?' : '이 응답의 어떤 점이 만족스럽지 않았나요?'}
                rows={4} className="w-full px-4 pt-3 pb-10 text-[14px] text-[#1A1826] placeholder:text-[#A8A6C0] resize-none outline-none leading-relaxed rounded-xl bg-transparent" />
            </div>
            <p className="text-[12px] text-[#A8A6C0] mt-3 leading-relaxed">
              이 보고서를 제출하면 현재 대화 전체가 JPDC AI에 전송되어 향후 모델 개선에 사용됩니다.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button type="button" onClick={() => { setFeedbackModal(null); setFeedbackText(''); setFeedbackRating(0); setFeedbackReasons(new Set()); setLiked(null); }}
                className="px-5 py-2.5 rounded-xl border border-[#E4E2F0] text-[14px] font-semibold text-[#6B6882] hover:bg-[#F4F3FC] transition-colors">
                취소
              </button>
              <button type="button" onClick={() => { setFeedbackModal(null); setFeedbackText(''); setFeedbackRating(0); setFeedbackReasons(new Set()); }}
                className="px-5 py-2.5 rounded-xl text-[14px] font-semibold text-white transition-colors" style={{ background: '#1A1826' }}>
                제출
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   분류 중 버블 (스피너)
══════════════════════════════════════════════════════════════ */
function ClassifyingBubble() {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 shadow-sm shadow-[#4F46E5]/25 mt-0.5">
        <img src={jpdcLogo} alt="JPDC AI" className="w-full h-full object-cover" />
      </div>
      <div className="bg-white border border-[#E4E2F0] rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <span className="text-[13px] text-[#A8A6C0]">질의 유형을 분석하는 중...</span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   생각하는 과정 + 스킬 탐색 패널
══════════════════════════════════════════════════════════════ */
interface ThoughtStep {
  kind: 'thought' | 'skill-group' | 'result';
  text?: string;
  skills?: string[];
}

const KIND_LABEL: Record<QueryKind, {
  label: string;
  color: string; bg: string; border: string;
  darkColor: string; darkBg: string; darkBorder: string;
}> = {
  instruction:          { label: '지침 질의',         color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', darkColor: '#34D399', darkBg: '#0B2D20', darkBorder: '#1A5C3A' },
  'assistant-select':   { label: '비서 선택',         color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', darkColor: '#FBB63A', darkBg: '#2D2010', darkBorder: '#6B4F10' },
  'tag-stats':          { label: 'TAG 통계 질의',     color: '#4F46E5', bg: '#EEEEFF', border: '#C7C3F7', darkColor: '#A8A5FF', darkBg: '#1A1840', darkBorder: '#4A46A0' },
  'tag-assistant':      { label: 'TAG+비서 추천',     color: '#4F46E5', bg: '#EEEEFF', border: '#C7C3F7', darkColor: '#A8A5FF', darkBg: '#1A1840', darkBorder: '#4A46A0' },
  'dual-tag':           { label: 'TAG 통계 질의',     color: '#4F46E5', bg: '#EEEEFF', border: '#C7C3F7', darkColor: '#A8A5FF', darkBg: '#1A1840', darkBorder: '#4A46A0' },
  'dual-tag-assistant': { label: 'TAG 분할+비서 추천', color: '#4F46E5', bg: '#EEEEFF', border: '#C7C3F7', darkColor: '#A8A5FF', darkBg: '#1A1840', darkBorder: '#4A46A0' },
  'ambiguous':          { label: '의도 불명확',       color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE', darkColor: '#C4B5FD', darkBg: '#1E1835', darkBorder: '#5B3DB0' },
  'route-select':       { label: '질의 방향 확인',    color: '#4F46E5', bg: '#F0EEFF', border: '#C7C3F7', darkColor: '#A8A5FF', darkBg: '#1A1840', darkBorder: '#4A46A0' },
  'rag-ab':             { label: 'RAG A/B 비교',      color: '#0EA5E9', bg: '#F0F9FF', border: '#BAE6FD', darkColor: '#38BDF8', darkBg: '#0A1F30', darkBorder: '#0C5080' },
  'rag-tag-assistant':  { label: 'RAG+TAG+비서',      color: '#0F766E', bg: '#F0FDFA', border: '#99F6E4', darkColor: '#5EEAD4', darkBg: '#0B2926', darkBorder: '#17665D' },
  'minutes-request':    { label: '회의록 비서',       color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', darkColor: '#C4B5FD', darkBg: '#1E1835', darkBorder: '#5B2AC0' },
  'minutes-result':     { label: '회의록 비서',       color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', darkColor: '#C4B5FD', darkBg: '#1E1835', darkBorder: '#5B2AC0' },
  'fallback':           { label: '폴백 응답',         color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', darkColor: '#FBB63A', darkBg: '#2D2010', darkBorder: '#6B4F10' },
  'fallback-assistant': { label: '비서+지침 병행',    color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', darkColor: '#C4B5FD', darkBg: '#1E1835', darkBorder: '#5B2AC0' },
};

const THOUGHT_STEPS: Record<QueryKind, ThoughtStep[]> = {
  instruction: [
    { kind: 'thought', text: '질의 의도 분석: 정책·규정 관련 지침 문의로 판단' },
    { kind: 'skill-group', skills: ['법령 검색 스킬', '지침 해석 스킬', '문서 인용 스킬'] },
    { kind: 'thought', text: '관련 규정 DB 조회 중 — 3개 참고 문서 매핑 완료' },
    { kind: 'result', text: '지침 답변 생성 시작' },
  ],
  'assistant-select': [
    { kind: 'thought', text: '질의 의도 분석: 특정 업무 작업 수행 요청 감지' },
    { kind: 'skill-group', skills: ['비서 매칭 스킬', '작업 유형 분류 스킬'] },
    { kind: 'thought', text: '비서 마켓 인덱스 탐색 중 — 유사 비서 4건 발견' },
    { kind: 'result', text: '비서 선택지 제시' },
  ],
  'tag-stats': [
    { kind: 'thought', text: '질의 의도 분석: 자연어 통계 조회 (TAG 질의) 감지' },
    { kind: 'skill-group', skills: ['자연어 파싱 스킬', '통계 분석 스킬', '데이터 시각화 스킬'] },
    { kind: 'thought', text: 'JPDC 데이터베이스 연결 — 쿼리 실행 완료' },
    { kind: 'result', text: '통계 답변 + 차트 생성 시작' },
  ],
  'ambiguous': [
    { kind: 'thought', text: '질의 의도 분석: 지침 문의 또는 작업 요청 — 신호 불명확' },
    { kind: 'skill-group', skills: ['법령 검색 스킬', '비서 매칭 스킬', '의도 분류 스킬'] },
    { kind: 'thought', text: '두 경로 병렬 탐색 중 — 지침 DB + 비서 마켓 동시 조회' },
    { kind: 'result', text: '지침 찾기 + 비서 추천 동시 제시' },
  ],
  'route-select': [
    { kind: 'thought', text: '질의 의도 분석: 입고 작업 방법과 ERP 현황 조회 가능성 감지' },
    { kind: 'skill-group', skills: ['질의 의도 분류 스킬', '업무 데이터 구분 스킬'] },
    { kind: 'thought', text: '답변 전에 조회 범위를 확인해야 하는 질의로 판단' },
    { kind: 'result', text: '지침 또는 ERP 데이터 선택 요청' },
  ],
  'rag-ab': [
    { kind: 'thought', text: '질의 의도 분석: 지침 문의 — 복수 해석 경로 감지' },
    { kind: 'skill-group', skills: ['RAG 검색 스킬 A', 'RAG 검색 스킬 B', '비교 분석 스킬'] },
    { kind: 'thought', text: '두 가지 해석 기준으로 지침 DB 병렬 조회 완료' },
    { kind: 'result', text: 'A/B 답변 동시 생성 — 선택 후 진행' },
  ],
  'rag-tag-assistant': [
    { kind: 'thought', text: '질의 의도 분석: 입고 작업지시의 지침·현황·비서 요청 감지' },
    { kind: 'skill-group', skills: ['RAG 지침 검색 스킬', 'TAG 업무데이터 조회 스킬', '비서 매칭 스킬'] },
    { kind: 'thought', text: '입고 처리 지침과 작업지시 현황 병렬 조회 완료' },
    { kind: 'result', text: 'RAG 답변 + TAG 현황 생성 → 추천 비서 제시' },
  ],
  'dual-tag': [
    { kind: 'thought', text: '질의 의도 분석: 자연어 통계 조회 (TAG 질의) 감지 — 2가지 해석 경로 탐지' },
    { kind: 'skill-group', skills: ['자연어 파싱 스킬', 'SQL 생성 스킬', '2분할 해석 스킬'] },
    { kind: 'thought', text: 'JPDC 생산 DB 연결 — 두 가지 쿼리 병렬 실행 완료' },
    { kind: 'result', text: '2분할 통계 결과 생성 시작' },
  ],
  'dual-tag-assistant': [
    { kind: 'thought', text: '질의 의도 분석: TAG 분할 통계 조회 감지 — 비서 추천 병행 실행' },
    { kind: 'skill-group', skills: ['자연어 파싱 스킬', '2분할 해석 스킬', '비서 매칭 스킬'] },
    { kind: 'thought', text: 'JPDC 생산 DB 병렬 쿼리 완료 + 비서 마켓 탐색 완료' },
    { kind: 'result', text: '2분할 통계 생성 → 비서 추천 순차 출력' },
  ],
  'minutes-request': [
    { kind: 'thought', text: '회의록 정리 요청 감지 — 회의 내용 입력 안내 준비 중' },
    { kind: 'skill-group', skills: ['회의록 분석 스킬', '문장 정리 스킬', '액션아이템 추출 스킬'] },
    { kind: 'thought', text: '회의록 작성 템플릿 로드 완료' },
    { kind: 'result', text: '회의 내용 입력 요청 생성' },
  ],
  'minutes-result': [
    { kind: 'thought', text: '회의 내용 수신 — 구조화 분석 시작' },
    { kind: 'skill-group', skills: ['문장 정리 스킬', '안건 분류 스킬', '액션아이템 추출 스킬'] },
    { kind: 'thought', text: '결정 사항·액션 아이템 자동 추출 완료' },
    { kind: 'result', text: '회의록 문서 생성 시작' },
  ],
  'fallback': [
    { kind: 'thought', text: '질의 의도 분석: 명확한 신호 없음 — 폴백 경로 전환' },
    { kind: 'skill-group', skills: ['의도 분류 스킬', '비서 매칭 스킬', 'RAG 검색 스킬'] },
    { kind: 'thought', text: '가능한 처리 경로 2가지 탐색 완료' },
    { kind: 'result', text: '처리 방향 안내 생성' },
  ],
  'fallback-assistant': [
    { kind: 'thought', text: '질의 의도 분석: 비서 선택 + 지침 조회 — 두 경로 병렬 실행' },
    { kind: 'skill-group', skills: ['비서 매칭 스킬', '지침 검색 스킬', 'RAG 검색 스킬'] },
    { kind: 'thought', text: '비서 마켓 탐색 완료 + 관련 지침 DB 조회 완료' },
    { kind: 'result', text: '비서 선택지 제시 → 지침 답변 순차 출력' },
  ],
  'tag-assistant': [
    { kind: 'thought', text: '질의 의도 분석: TAG 통계 조회 감지 — 비서 추천 병행 실행' },
    { kind: 'skill-group', skills: ['자연어 파싱 스킬', '통계 분석 스킬', '비서 매칭 스킬'] },
    { kind: 'thought', text: 'JPDC 데이터베이스 쿼리 완료 + 비서 마켓 탐색 완료' },
    { kind: 'result', text: '통계 답변 생성 → 비서 추천 순차 출력' },
  ],
};

function ThinkingProcess({ queryKind, onDone, isDark }: { queryKind: QueryKind; onDone: () => void; isDark?: boolean }) {
  const steps = THOUGHT_STEPS[queryKind];
  const [visibleCount, setVisibleCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const kindMetaRaw = KIND_LABEL[queryKind];
  const kindMeta = {
    label: kindMetaRaw.label,
    color:  isDark ? kindMetaRaw.darkColor  : kindMetaRaw.color,
    bg:     isDark ? kindMetaRaw.darkBg     : kindMetaRaw.bg,
    border: isDark ? kindMetaRaw.darkBorder : kindMetaRaw.border,
  };

  useEffect(() => {
    let idx = 0;
    const next = () => {
      idx++;
      setVisibleCount(idx);
      if (idx < steps.length) {
        setTimeout(next, idx === 1 ? 480 : 540);
      } else {
        setTimeout(() => { setFinished(true); onDone(); }, 400);
      }
    };
    const t = setTimeout(next, 200);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex gap-3 items-start">
      {/* 아바타 */}
      <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 shadow-sm shadow-[#4F46E5]/25 mt-0.5">
        <img src={jpdcLogo} alt="JPDC AI" className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0">
        {/* 헤더 — 분류 결과 배지 */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold border"
            style={{ color: kindMeta.color, background: kindMeta.bg, borderColor: kindMeta.border }}>
            <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3 shrink-0">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {kindMeta.label} 분류 완료
          </span>
          {!finished && (
            <span className="text-[12px] text-[#A8A6C0] flex items-center gap-1">
              <span className="w-3 h-3 rounded-full border-2 border-[#4F46E5]/40 border-t-[#4F46E5] animate-spin inline-block" />
              처리 중...
            </span>
          )}
        </div>

        {/* 스텝 카드 */}
        <div className="bg-[#F9F8FF] border border-[#E4E2F0] rounded-2xl rounded-tl-sm overflow-hidden shadow-sm">
          <div className="divide-y divide-[#EEF0FF]">
            {steps.slice(0, visibleCount).map((step, si) => (
              <div
                key={si}
                className="px-4 py-3 flex items-start gap-3 transition-all"
                style={{ animation: 'fadeSlideIn 0.25s ease both' }}>

                {/* 아이콘 컬럼 */}
                {step.kind === 'thought' && (
                  <>
                    <span className="text-[16px] shrink-0 mt-0.5 select-none">💭</span>
                    <p className="text-[12.5px] text-[#6B6882] leading-relaxed italic">{step.text}</p>
                  </>
                )}
                {step.kind === 'skill-group' && (
                  <>
                    <span className="text-[16px] shrink-0 mt-0.5 select-none">🔍</span>
                    <div className="flex-1">
                      <p className="text-[12px] font-semibold text-[#A8A6C0] uppercase tracking-wide mb-1.5">스킬 연결됨</p>
                      <div className="flex flex-wrap gap-1.5">
                        {step.skills!.map((sk, ki) => (
                          <span key={ki}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11.5px] font-semibold"
                            style={{ background: kindMeta.bg, color: kindMeta.color, border: `1px solid ${kindMeta.border}` }}>
                            <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5 shrink-0">
                              <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {step.kind === 'result' && (
                  <>
                    <span className="text-[16px] shrink-0 mt-0.5 select-none">✅</span>
                    <p className="text-[12.5px] font-semibold leading-relaxed" style={{ color: kindMeta.color }}>{step.text}</p>
                  </>
                )}
              </div>
            ))}

            {/* 다음 스텝 로딩 인디케이터 */}
            {visibleCount < steps.length && (
              <div className="px-4 py-3 flex items-center gap-2">
                <span className="text-[16px] select-none opacity-40">⋯</span>
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#C7C3F7] animate-bounce"
                      style={{ animationDelay: `${i * 0.12}s` }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 애니메이션 keyframe (global injection) */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   비서 선택 패널
══════════════════════════════════════════════════════════════ */
function AssistantSelectPanel({
  query,
  candidates,
  onSelect,
  compact = false,
}: {
  query: string;
  candidates: CandidateAssistant[];
  onSelect: (candidate: CandidateAssistant) => void;
  compact?: boolean;
}) {
  const grid = (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {candidates.map(c => {
          const Icon = c.icon;
          const matchColor = c.match >= 90 ? '#10B981' : c.match >= 75 ? '#4F46E5' : '#A8A6C0';
          return (
            <button key={c.id} type="button" onClick={() => onSelect(c)}
              className="group text-left bg-white border border-[#E4E2F0] rounded-xl p-4 hover:border-[#4F46E5] hover:shadow-md hover:shadow-[#4F46E5]/8 transition-all duration-200">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#F4F3FC] flex items-center justify-center shrink-0 group-hover:bg-[#EEEEFF] transition-colors">
                  <Icon className="w-4.5 h-4.5 text-[#4F46E5]" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[14px] font-semibold text-[#1A1826] truncate">{c.name}</p>
                    <span className="text-[11px] font-bold shrink-0" style={{ color: matchColor }}>{c.match}%</span>
                  </div>
                  <p className="text-[11.5px] text-[#6B6882] leading-snug line-clamp-2">{c.desc}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-[#F4F3FC] text-[#6B6882]">{c.category}</span>
                    <span className="text-[11px] text-[#A8A6C0]">사용자 {c.users}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#C7C3F7] group-hover:text-[#4F46E5] transition-colors shrink-0 mt-1" strokeWidth={1.8} />
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-[12px] text-[#A8A6C0] text-center">비서마켓에서 더 많은 비서를 찾을 수 있습니다.</p>
    </div>
  );

  /* compact: 지침 답변 하위 인라인 — 안내문 + 목록만 */
  if (compact) {
    return (
      <div className="space-y-3">
        <p className="text-[14px] text-[#6B6882]">
          추천 비서가 있습니다. 아래에서 선택해주세요.
        </p>
        {grid}
      </div>
    );
  }

  /* 일반: 기존 메시지 버블 레이아웃 */
  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 shadow-sm shadow-[#4F46E5]/25 mt-0.5">
        <img src={jpdcLogo} alt="JPDC AI" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0 space-y-3">
        {/* 안내 버블 */}
        <div className="bg-white border border-[#E4E2F0] rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10.5px] font-semibold text-amber-600">
              <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M6 4v3M6 8.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              비서 선택 필요
            </span>
            <span className="text-[12px] text-[#A8A6C0]">질의에 맞는 비서를 선택해 주세요</span>
          </div>
          <p className="text-[13.5px] text-[#1A1826] leading-relaxed">
            <span className="font-semibold">"{query.length > 30 ? query.slice(0, 30) + '…' : query}"</span> 질의를 처리할 수 있는 유사한 비서를 찾았습니다.
            아래 비서 중 하나를 선택하면 바로 대화를 시작합니다.
          </p>
        </div>
        {grid}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   모호한 의도 — 좌(RAG 지침) + 우(비서 찾기) 분할 패널
══════════════════════════════════════════════════════════════ */
type QueryRoute = 'instruction' | 'erp';

function RouteSelectionPanel({
  query,
  onSelect,
}: {
  query: string;
  onSelect: (route: QueryRoute) => void;
}) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 shadow-sm shadow-[#4F46E5]/25 mt-0.5">
        <img src={jpdcLogo} alt="JPDC AI" className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="bg-white border border-[#E4E2F0] rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold border text-[#4F46E5] bg-[#F0EEFF] border-[#C7C3F7]">
              <MessageSquare className="w-3 h-3" strokeWidth={2} />
              질의 방향 확인
            </span>
          </div>
          <p className="text-[13.5px] text-[#1A1826] leading-relaxed mb-3.5">
            <span className="font-semibold">"{query}"</span>에 대해 어떤 정보를 찾으시는지 아래에서 선택해 주세요.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onSelect('instruction')}
              className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-emerald-200 bg-emerald-50 text-left text-[12.5px] font-semibold text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-colors"
            >
              <BookOpen className="w-4 h-4 shrink-0 text-emerald-600" strokeWidth={1.8} />
              <span className="flex-1">지침을 찾으시는건가요?</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => onSelect('erp')}
              className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-blue-200 bg-blue-50 text-left text-[12.5px] font-semibold text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-colors"
            >
              <Database className="w-4 h-4 shrink-0 text-blue-600" strokeWidth={1.8} />
              <span className="flex-1">ERP 데이터를 찾으시는건가요?</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AmbiguousPanel({
  query,
  streaming,
  onStreamDone,
  onSelectAssistant,
  actionBar,
}: {
  query: string;
  streaming: boolean;
  onStreamDone: () => void;
  onSelectAssistant: (c: CandidateAssistant) => void;
  actionBar?: React.ReactNode;
}) {
  const { answer, sources } = getAnswerData(query);
  const candidates = getAssistantCandidates(query).slice(0, 4);
  const [textDone, setTextDone] = useState(false);

  const handleStreamDone = () => { setTextDone(true); onStreamDone(); };

  return (
    <div className="flex gap-3 items-start">
      {/* AI 아바타 */}
      <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 shadow-sm shadow-[#4F46E5]/25 mt-0.5">
        <img src={jpdcLogo} alt="JPDC AI" className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0 space-y-3">
        {/* 의도 불명확 배지 + 안내 */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold border"
            style={{ color: '#8B5CF6', background: '#F5F3FF', borderColor: '#DDD6FE' }}>
            <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3 shrink-0">
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M6 3.5v3M6 8v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            의도 불명확 — 두 가지 결과 동시 제시
          </span>
          <span className="text-[12px] text-[#A8A6C0]">관련 지침과 비서를 함께 확인하세요</span>
        </div>

        {/* ── 분할 레이아웃: 모바일 상하, sm 이상 좌우 ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">

          {/* ─── 왼쪽: RAG 지침 찾기 ─── */}
          <div className="flex flex-col gap-2 min-w-0">
            {/* 패널 헤더 */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 shrink-0 text-emerald-600">
                <path d="M2 2h10v10H2V2zm0 3h10M5 5v7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[11.5px] font-semibold text-emerald-700">RAG 지침 찾기</span>
              <span className="ml-auto text-[11px] text-emerald-500 font-medium">규정 DB 조회</span>
            </div>

            {/* 답변 버블 */}
            <div className="bg-white border border-[#E4E2F0] rounded-xl px-4 py-3.5 shadow-sm">
              {streaming ? (
                <StreamingAnswer answer={answer} onDone={handleStreamDone} />
              ) : (
                <div className="text-[14px] text-[#1A1826] space-y-0.5">{renderText(answer)}</div>
              )}
            </div>

            {/* 출처 (스트리밍 완료 후) */}
            {(!streaming || textDone) && (
              <div className="border border-[#E4E2F0] rounded-xl overflow-hidden shadow-sm">
                <div className="px-3 py-1.5 bg-[#F9F8FF] border-b border-[#E4E2F0]">
                  <p className="text-[10.5px] font-semibold text-[#6B6882] uppercase tracking-wide">참고 문서</p>
                </div>
                {sources.map((s, si) => (
                  <div key={si} className={`flex items-center gap-2.5 px-3 py-2 hover:bg-[#F9F8FF] cursor-pointer transition-colors ${si > 0 ? 'border-t border-[#E4E2F0]' : ''}`}>
                    <FileText className="w-3 h-3 text-[#4F46E5] shrink-0" strokeWidth={1.8} />
                    <span className="flex-1 text-[11.5px] text-[#1A1826] truncate">{s.title}</span>
                    <span className="text-[9.5px] px-1.5 py-0.5 rounded-full bg-[#4F46E5]/8 text-[#4F46E5] font-medium shrink-0">{s.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ─── 아래(모바일) / 오른쪽(데스크탑): 비서 찾기 — 모바일은 RAG 완료 후 표시 ─── */}
          <div className={`flex flex-col gap-2 min-w-0 transition-opacity duration-300 ${(!streaming || textDone) ? 'opacity-100' : 'hidden sm:flex sm:opacity-100'}`}>
            {/* 패널 헤더 */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200">
              <Users className="w-3.5 h-3.5 shrink-0 text-amber-600" strokeWidth={1.8} />
              <span className="text-[11.5px] font-semibold text-amber-700">비서 찾기</span>
              <span className="ml-auto text-[11px] text-amber-500 font-medium">비서마켓 조회</span>
            </div>

            {/* 후보 카드 목록 */}
            <div className="flex flex-col gap-1.5">
              {candidates.map(c => {
                const Icon = c.icon;
                const matchColor = c.match >= 90 ? '#10B981' : c.match >= 75 ? '#4F46E5' : '#A8A6C0';
                return (
                  <button key={c.id} type="button" onClick={() => onSelectAssistant(c)}
                    className="group text-left bg-white border border-[#E4E2F0] rounded-xl px-3 py-2.5 hover:border-[#4F46E5] hover:shadow-md hover:shadow-[#4F46E5]/8 transition-all duration-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#F4F3FC] flex items-center justify-center shrink-0 group-hover:bg-[#EEEEFF] transition-colors">
                        <Icon className="w-4 h-4 text-[#4F46E5]" strokeWidth={1.8} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <p className="text-[12.5px] font-semibold text-[#1A1826] truncate">{c.name}</p>
                          <span className="text-[11px] font-bold shrink-0" style={{ color: matchColor }}>{c.match}%</span>
                        </div>
                        <p className="text-[12px] text-[#6B6882] leading-snug truncate">{c.desc}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C7C3F7] group-hover:text-[#4F46E5] transition-colors shrink-0" strokeWidth={1.8} />
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="text-[10.5px] text-[#A8A6C0] text-center">비서를 선택하면 바로 대화를 시작합니다</p>
          </div>
        </div>
        {actionBar}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   RAG A/B 비교 패널
══════════════════════════════════════════════════════════════ */
interface RagAbData {
  labelA: string; answerA: string; sourcesA: { title: string; type: string }[];
  labelB: string; answerB: string; sourcesB: { title: string; type: string }[];
}

const RAG_AB_MAP: Record<string, RagAbData> = {
  '삼다수 브랜드 관리 지침 알려줘': {
    labelA: '상표·디자인 보호 관점',
    answerA: `삼다수 브랜드는 **상표법 및 디자인보호법**에 따라 아래 기준으로 관리됩니다.

**1. 상표 등록 현황**
'제주삼다수' 상표는 특허청에 제35류(음료 판매업) 및 제32류(음료)로 등록되어 있으며, 상표권자는 제주특별자치도개발공사입니다.

**2. 로고·심벌 사용 기준**
공식 CI 가이드라인에 따라 로고 색상(Pantone 286C), 최소 사용 크기(20mm), 여백 규정을 반드시 준수해야 합니다. 임의 변형·재색상은 금지됩니다.

**3. 무단 사용 시 제재**
상표권 침해 시 손해배상(상표법 제109조) 및 형사처벌(7년 이하 징역 또는 1억 원 이하 벌금)이 적용됩니다.`,
    sourcesA: [
      { title: '상표법 제109조 (손해배상)', type: '법령' },
      { title: '제주삼다수 CI 가이드라인 v3.2', type: '내부지침' },
      { title: '디자인보호법 제113조', type: '법령' },
    ],
    labelB: '마케팅·홍보 활용 기준',
    answerB: `삼다수 브랜드의 **마케팅 및 홍보물 제작**은 아래 내부 지침에 따라 관리됩니다.

**1. 광고물 제작 절차**
모든 광고·홍보물은 브랜드팀의 사전 검토를 거쳐야 하며, 외부 대행사 제작물은 최종 교정 전 CI팀 승인을 필수로 받아야 합니다.

**2. 캐릭터·모델 활용**
공식 브랜드 캐릭터 '물방울 이미지' 및 광고 모델 사진은 계약 기간 내에서만 사용 가능하며, 재사용 시 저작권 재계약이 필요합니다.

**3. SNS·디지털 채널 기준**
UGC(사용자 생성 콘텐츠)에 브랜드 로고 삽입 시 사전 서면 동의가 필요하며, 해시태그 정책은 연간 브랜드 캘린더에 따릅니다.`,
    sourcesB: [
      { title: '삼다수 브랜드 마케팅 운영 지침 2026', type: '내부지침' },
      { title: '저작권법 제46조 (이용허락)', type: '법령' },
      { title: '광고물 제작 표준 절차서 v2.1', type: '내부지침' },
    ],
  },
};

function getRagAbData(query: string): RagAbData {
  return RAG_AB_MAP[query.trim()] ?? RAG_AB_MAP['삼다수 브랜드 관리 지침 알려줘'];
}

function RagAbPanel({
  query,
  streamingA,
  streamingB,
  selected,
  onSelect,
  actionBar,
}: {
  query: string;
  streamingA: boolean;
  streamingB: boolean;
  selected?: 'A' | 'B';
  onSelect: (choice: 'A' | 'B') => void;
  actionBar?: React.ReactNode;
}) {
  const data = getRagAbData(query);
  const [doneA, setDoneA] = useState(false);
  const [doneB, setDoneB] = useState(false);

  const sourceList = (srcs: { title: string; type: string }[]) => (
    <div className="border border-[#E4E2F0] rounded-xl overflow-hidden">
      <div className="px-3 py-1.5 bg-[#F9F8FF] border-b border-[#E4E2F0]">
        <p className="text-[11px] font-semibold text-[#6B6882] uppercase tracking-wide">참고 문서</p>
      </div>
      {srcs.map((s, si) => (
        <div key={si} className={`flex items-center gap-2 px-3 py-2 hover:bg-[#F9F8FF] transition-colors ${si > 0 ? 'border-t border-[#E4E2F0]' : ''}`}>
          <FileText className="w-3 h-3 text-[#4F46E5] shrink-0" strokeWidth={1.8} />
          <span className="flex-1 text-[12px] text-[#1A1826] truncate">{s.title}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#4F46E5]/8 text-[#4F46E5] font-medium shrink-0">{s.type}</span>
        </div>
      ))}
    </div>
  );

  const selectBtn = (choice: 'A' | 'B', done: boolean) => {
    if (selected === choice) return (
      <div className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#0EA5E9]/10 border border-[#BAE6FD] text-[#0EA5E9] text-[13px] font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
        {choice}안 선택됨
      </div>
    );
    if (selected && selected !== choice) return (
      <div className="flex items-center justify-center py-2 rounded-xl bg-[#F4F3FC] text-[#C7C3F7] text-[13px] font-medium">
        {choice}안
      </div>
    );
    if (!done && (choice === 'A' ? streamingA : streamingB)) return null;
    return (
      <button type="button" onClick={() => onSelect(choice)}
        className="w-full py-2 rounded-xl text-[13px] font-semibold transition-all border-2 border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#0EA5E9] hover:text-white">
        {choice}안 선택
      </button>
    );
  };

  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 shadow-sm shadow-[#4F46E5]/25 mt-0.5">
        <img src={jpdcLogo} alt="JPDC AI" className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0 space-y-3">
        {/* 배지 */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold border"
            style={{ color: '#0EA5E9', background: '#F0F9FF', borderColor: '#BAE6FD' }}>
            <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3 shrink-0">
              <rect x="1" y="1" width="4.5" height="10" rx="1" stroke="currentColor" strokeWidth="1.3"/>
              <rect x="6.5" y="1" width="4.5" height="10" rx="1" stroke="currentColor" strokeWidth="1.3"/>
            </svg>
            RAG A/B 비교 — 두 가지 해석 동시 제시
          </span>
          <span className="text-[12px] text-[#A8A6C0]">원하는 답변을 선택하세요</span>
        </div>

        {/* 2-열 비교 */}
        <div className="grid grid-cols-2 gap-3 items-start">

          {/* ─── A안 ─── */}
          <div className="flex flex-col gap-2">
            <div className="bg-white border border-[#E4E2F0] rounded-xl px-4 py-3.5 shadow-sm min-h-[120px]">
              {streamingA
                ? <StreamingAnswer answer={data.answerA} onDone={() => setDoneA(true)} />
                : <div className="text-[14px] text-[#1A1826] space-y-0.5">{renderText(data.answerA)}</div>}
            </div>
            {(doneA || !streamingA) && sourceList(data.sourcesA)}
            {selectBtn('A', doneA)}
          </div>

          {/* ─── B안 ─── */}
          <div className="flex flex-col gap-2">
            <div className="bg-white border border-[#E4E2F0] rounded-xl px-4 py-3.5 shadow-sm min-h-[120px]">
              {streamingB
                ? <StreamingAnswer answer={data.answerB} onDone={() => setDoneB(true)} />
                : <div className="text-[14px] text-[#1A1826] space-y-0.5">{renderText(data.answerB)}</div>}
            </div>
            {(doneB || !streamingB) && sourceList(data.sourcesB)}
            {selectBtn('B', doneB)}
          </div>

        </div>
        {actionBar}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   RAG 지침 + TAG 현황 + 추천 비서 복합 패널
══════════════════════════════════════════════════════════════ */
function ContinueQueryButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-[#C7C3F7] bg-[#F9F8FF] text-[12px] font-semibold text-[#4F46E5] hover:bg-[#EEEEFF] hover:border-[#A9A3F0] transition-colors"
    >
      <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.8} />
      이어서 질의
      <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.8} />
    </button>
  );
}

function RagTagAssistantPanel({
  query,
  streamingRag,
  streamingTag,
  onDone,
  onSelectAssistant,
  onContinue,
  actionBar,
}: {
  query: string;
  streamingRag: boolean;
  streamingTag: boolean;
  onDone: () => void;
  onSelectAssistant: (candidate: CandidateAssistant) => void;
  onContinue: () => void;
  actionBar?: React.ReactNode;
}) {
  const ragData = getAnswerData(query);
  const tagData = getTagStatsData(query);
  const candidates = getAssistantCandidates(query);
  const [ragDone, setRagDone] = useState(!streamingRag);
  const [tagDone, setTagDone] = useState(!streamingTag);
  const reportedDone = useRef(false);
  const allDone = (!streamingRag || ragDone) && (!streamingTag || tagDone);

  useEffect(() => {
    if (allDone && !reportedDone.current) {
      reportedDone.current = true;
      onDone();
    }
  }, [allDone, onDone]);

  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 shadow-sm shadow-[#4F46E5]/25 mt-0.5">
        <img src={jpdcLogo} alt="JPDC AI" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold border"
            style={{ color: '#0F766E', background: '#F0FDFA', borderColor: '#99F6E4' }}>
            <Layers className="w-3 h-3" strokeWidth={2} />
            RAG + TAG + 비서
          </span>
          <span className="text-[12px] text-[#A8A6C0]">지침, 업무 현황, 추천 비서를 함께 확인하세요</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
          {/* 왼쪽: RAG 답변 */}
          <section className="flex flex-col gap-2 min-w-0">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" strokeWidth={1.8} />
              <span className="text-[11.5px] font-semibold text-emerald-700">RAG 지침 답변</span>
              <span className="ml-auto text-[11px] text-emerald-500 font-medium">규정·절차 검색</span>
            </div>
            <div className="bg-white border border-[#E4E2F0] rounded-xl px-4 py-3.5 shadow-sm min-h-[150px]">
              {streamingRag && !ragDone
                ? <StreamingAnswer answer={ragData.answer} onDone={() => setRagDone(true)} />
                : <div className="text-[13px] text-[#1A1826] space-y-0.5">{renderText(ragData.answer)}</div>}
            </div>
            {(!streamingRag || ragDone) && (
              <div className="border border-[#E4E2F0] rounded-xl overflow-hidden">
                <div className="px-3 py-1.5 bg-[#F9F8FF] border-b border-[#E4E2F0]">
                  <p className="text-[10.5px] font-semibold text-[#6B6882]">참고 문서</p>
                </div>
                {ragData.sources.map((source, index) => (
                  <div key={index} className={`flex items-center gap-2 px-3 py-2 ${index > 0 ? 'border-t border-[#E4E2F0]' : ''}`}>
                    <FileText className="w-3 h-3 text-emerald-600 shrink-0" strokeWidth={1.8} />
                    <span className="flex-1 text-[11.5px] text-[#1A1826] truncate">{source.title}</span>
                    <span className="text-[9.5px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium shrink-0">{source.type}</span>
                  </div>
                ))}
              </div>
            )}
            {(!streamingRag || ragDone) && (
              <ContinueQueryButton onClick={onContinue} />
            )}
          </section>

          {/* 오른쪽: TAG 답변 */}
          <section className="flex flex-col gap-2 min-w-0">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#EEEEFF] border border-[#C7C3F7]">
              <BarChart2 className="w-3.5 h-3.5 text-[#4F46E5] shrink-0" strokeWidth={1.8} />
              <span className="text-[11.5px] font-semibold text-[#4F46E5]">TAG 현황 답변</span>
              <span className="ml-auto text-[11px] text-[#7C6FF7] font-medium">업무 데이터 조회</span>
            </div>
            <div className="bg-white border border-[#E4E2F0] rounded-xl px-4 py-3.5 shadow-sm min-h-[150px]">
              {streamingTag && !tagDone
                ? <StreamingAnswer answer={tagData.answer} onDone={() => setTagDone(true)} />
                : <div className="text-[13px] text-[#1A1826] space-y-0.5">{renderText(tagData.answer)}</div>}
            </div>
            {(!streamingTag || tagDone) && (
              <>
                <div className="border border-[#E4E2F0] rounded-xl overflow-hidden">
                  <div className="px-3 py-1.5 bg-[#F9F8FF] border-b border-[#E4E2F0]">
                    <p className="text-[10.5px] font-semibold text-[#6B6882]">{tagData.tableTitle}</p>
                  </div>
                  {tagData.rows.map((row, index) => (
                    <div key={index} className={`flex items-center justify-between gap-3 px-3 py-2 ${index > 0 ? 'border-t border-[#E4E2F0]' : ''}`}>
                      <span className="text-[11.5px] text-[#6B6882]">{row.label}</span>
                      <span className={`text-[12px] font-semibold ${row.label === '입고 미처리' ? 'text-[#E11D48]' : 'text-[#1A1826]'}`}>
                        {row.value.toLocaleString()}{row.unit}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border border-[#E4E2F0] rounded-xl p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10.5px] font-semibold text-[#6B6882]">입고 처리 건수 비교</p>
                    <TrendingUp className="w-3.5 h-3.5 text-[#C7C3F7]" strokeWidth={1.8} />
                  </div>
                  <ResponsiveContainer width="100%" height={130}>
                    <BarChart data={tagData.rows} margin={{ top: 8, right: 4, left: -28, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0EEFA" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#A8A6C0' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: '#A8A6C0' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <ReTooltip
                        contentStyle={{ background: '#fff', border: '1px solid #E4E2F0', borderRadius: 8, fontSize: 11 }}
                        formatter={(value: number) => [`${value.toLocaleString()}건`, '작업지시']}
                      />
                      <Bar dataKey="value" fill="#4F46E5" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
            {(!streamingTag || tagDone) && (
              <ContinueQueryButton onClick={onContinue} />
            )}
          </section>
        </div>

        {allDone && (
          <AssistantSelectPanel
            query={query}
            candidates={candidates}
            onSelect={onSelectAssistant}
            compact
          />
        )}
        {allDone && actionBar}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   폴백 패널 — 비서 찾기 / 지침(RAG) 찾기 선택 안내
══════════════════════════════════════════════════════════════ */
const FALLBACK_MESSAGE = `요청하신 내용과 관련된 지침 및 자료를 찾아보았으나, 정확히 일치하는 지침을 찾지 못했습니다.\n\n대신 해당 업무에 도움이 되는 비서를 찾아드렸으니, 아래에서 선택해 주시면 바로 안내해 드리겠습니다.`;

/* ── 폴백 알림 블록 (정적) ─────────────────────────────────── */
function FallbackNoticeBlock() {
  return (
    <div className="rounded-2xl rounded-tl-sm border border-[#E4E2F0] overflow-hidden shadow-sm">
      {/* 못찾음 영역 */}
      <div className="flex items-start gap-3 px-4 py-3.5 bg-[#FFFBEB] border-b border-[#FDE68A]">
        <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] flex items-center justify-center shrink-0 mt-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#B45309" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M8.5 8.5l5 5m0-5-5 5"/>
          </svg>
        </div>
        <div>
          <p className="text-[13px] font-bold text-[#B45309] leading-snug">정확한 지침을 찾지 못했습니다</p>
          <p className="text-[11.5px] text-[#92400E] leading-relaxed mt-0.5 break-keep">
            요청하신 내용과 관련된 지침 및 자료를 검색했으나 정확히 일치하는 지침이 없습니다.
          </p>
        </div>
      </div>
      {/* 대안 안내 영역 */}
      <div className="flex items-start gap-3 px-4 py-3.5 bg-[#F0EEFF]">
        <div className="w-8 h-8 rounded-lg bg-[#EEF0FF] flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-[#4F46E5]" strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-[13px] font-bold text-[#4F46E5] leading-snug">대신 비서를 찾아드렸습니다</p>
          <p className="text-[11.5px] text-[#6B6882] leading-relaxed mt-0.5 break-keep">
            아래에서 비서를 선택하시면 바로 안내해 드리겠습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

function FallbackPanel({
  streaming,
  onDone,
  onChooseAssistant,
  onChooseRag,
  actionBar,
}: {
  streaming: boolean;
  onDone: () => void;
  onChooseAssistant: () => void;
  onChooseRag: () => void;
  actionBar?: React.ReactNode;
}) {
  const [textDone, setTextDone] = useState(false);
  const [chosen, setChosen] = useState<'assistant' | 'rag' | null>(null);

  const handleDone = () => { setTextDone(true); onDone(); };

  return (
    <div className="flex gap-3 items-start">
      {/* AI 아바타 */}
      <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 shadow-sm shadow-[#4F46E5]/25 mt-0.5">
        <img src={jpdcLogo} alt="JPDC AI" className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0 space-y-3">
        {/* 배지 */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold border"
            style={{ color: '#D97706', background: '#FFFBEB', borderColor: '#FDE68A' }}>
            <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3 shrink-0">
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M6 3.5v3M6 8v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            폴백 응답 — 처리 방향 확인 필요
          </span>
        </div>

        {/* 메시지 버블 */}
        {(streaming && !textDone) ? (
          <div className="bg-white border border-[#E4E2F0] rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
            <StreamingAnswer answer={FALLBACK_MESSAGE} onDone={handleDone} />
          </div>
        ) : (
          <FallbackNoticeBlock />
        )}

        {/* 선택 카드 (스트리밍 완료 후 표시) */}
        {(!streaming || textDone) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* 비서 찾기 */}
            <button type="button"
              onClick={() => { setChosen('assistant'); onChooseAssistant(); }}
              disabled={chosen !== null}
              className={`group text-left flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 ${
                chosen === 'assistant'
                  ? 'border-[#4F46E5] bg-[#EEEEFF] shadow-md shadow-[#4F46E5]/10'
                  : chosen !== null
                    ? 'border-[#E4E2F0] bg-[#F9F8FF] opacity-50 cursor-not-allowed'
                    : 'border-[#E4E2F0] bg-white hover:border-[#4F46E5] hover:shadow-md hover:shadow-[#4F46E5]/8 hover:bg-[#F4F3FC]'
              }`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                chosen === 'assistant' ? 'bg-[#4F46E5]' : 'bg-[#F4F3FC] group-hover:bg-[#EEEEFF]'
              }`}>
                <svg viewBox="0 0 16 16" fill="none" className={`w-4 h-4 ${chosen === 'assistant' ? 'text-white' : 'text-[#4F46E5]'}`}>
                  <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M2 13c0-2.761 2.686-5 6-5s6 2.239 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[14px] font-semibold mb-0.5 ${chosen === 'assistant' ? 'text-[#4F46E5]' : 'text-[#1A1826]'}`}>
                  비서 찾기
                </p>
                <p className="text-[11.5px] text-[#6B6882] leading-snug">
                  회의록 작성에 도움이 되는 비서를 추천해 드립니다
                </p>
                {chosen === 'assistant' && (
                  <p className="text-[10.5px] text-[#4F46E5] font-semibold mt-1.5">✓ 선택됨</p>
                )}
              </div>
            </button>

            {/* 지침(RAG) 찾기 */}
            <button type="button"
              onClick={() => { setChosen('rag'); onChooseRag(); }}
              disabled={chosen !== null}
              className={`group text-left flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 ${
                chosen === 'rag'
                  ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-500/10'
                  : chosen !== null
                    ? 'border-[#E4E2F0] bg-[#F9F8FF] opacity-50 cursor-not-allowed'
                    : 'border-[#E4E2F0] bg-white hover:border-emerald-400 hover:shadow-md hover:shadow-emerald-500/8 hover:bg-emerald-50/30'
              }`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                chosen === 'rag' ? 'bg-emerald-500' : 'bg-emerald-50 group-hover:bg-emerald-100'
              }`}>
                <svg viewBox="0 0 16 16" fill="none" className={`w-4 h-4 ${chosen === 'rag' ? 'text-white' : 'text-emerald-600'}`}>
                  <path d="M3 2h10v12H3V2zm0 4h10M6 6v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[14px] font-semibold mb-0.5 ${chosen === 'rag' ? 'text-emerald-700' : 'text-[#1A1826]'}`}>
                  지침 (RAG) 찾기
                </p>
                <p className="text-[11.5px] text-[#6B6882] leading-snug">
                  관련 규정·지침 문서를 검색하여 답변드립니다
                </p>
                {chosen === 'rag' && (
                  <p className="text-[10.5px] text-emerald-600 font-semibold mt-1.5">✓ 선택됨</p>
                )}
              </div>
            </button>
          </div>
        )}

        {/* 액션바 */}
        {(!streaming || textDone) && actionBar && (
          <div>{actionBar}</div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   RAG 지침 탐색 제안 패널
══════════════════════════════════════════════════════════════ */
function RagPromptPanel({
  onConfirm,
  onDismiss,
}: {
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  const [answered, setAnswered] = useState(false);
  const [choice, setChoice] = useState<'yes' | 'no' | null>(null);

  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 shadow-sm shadow-[#4F46E5]/25 mt-0.5">
        <img src={jpdcLogo} alt="JPDC AI" className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0 space-y-3">
        {/* 메시지 버블 */}
        <div className="bg-white border border-[#E4E2F0] rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
          <div className="flex items-start gap-3 mb-3">
            {/* 아이콘 */}
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-emerald-600">
                <path d="M3 2h10v12H3V2zm0 4h10M6 6v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-[13.5px] font-semibold text-[#1A1826] leading-snug mb-1">
                RAG 지침을 찾을까요?
              </p>
              <p className="text-[13px] text-[#6B6882] leading-relaxed">
                관련 규정·지침 문서를 검색하여 회의록 작성에 대한 공식 지침을 함께 안내해 드릴 수 있습니다.
              </p>
            </div>
          </div>

          {/* 선택 버튼 */}
          {!answered ? (
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => { setAnswered(true); setChoice('yes'); onConfirm(); }}
                className="flex-1 px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[12.5px] font-semibold transition-colors shadow-sm shadow-[#4F46E5]/20"
              >
                네, 찾아주세요
              </button>
              <button
                type="button"
                onClick={() => { setAnswered(true); setChoice('no'); onDismiss(); }}
                className="flex-1 px-4 py-2 rounded-xl border border-[#E4E2F0] text-[#6B6882] text-[12.5px] font-semibold hover:bg-[#F4F3FC] hover:border-[#C7C3F7] transition-colors"
              >
                괜찮아요
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pt-1">
              {choice === 'yes' ? (
                <span className="text-[13px] font-semibold text-[#4F46E5]">✓ 지침 검색을 시작합니다…</span>
              ) : (
                <span className="text-[13px] text-[#A8A6C0]">지침 검색을 건너뜁니다.</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TAG 통계 답변 패널
══════════════════════════════════════════════════════════════ */
type ChartKind = 'bar' | 'line' | 'area' | 'pie';
const CHART_OPTIONS: { value: ChartKind; label: string }[] = [
  { value: 'bar',  label: '막대' },
  { value: 'line', label: '꺾은선' },
  { value: 'area', label: '영역' },
  { value: 'pie',  label: '원형' },
];
const PIE_COLORS = ['#4F46E5', '#7C6FF7', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE', '#818CF8', '#6366F1'];

function TagStatsPanel({
  statsData,
  streaming,
  onDone,
  actionBar,
}: {
  statsData: StatsData;
  streaming: boolean;
  onDone: () => void;
  actionBar?: React.ReactNode;
}) {
  const [textDone, setTextDone] = useState(false);
  const [chartKind, setChartKind] = useState<ChartKind>(statsData.chartType as ChartKind ?? 'bar');

  const tooltipStyle = { background: '#fff', border: '1px solid #E4E2F0', borderRadius: 8, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' };
  const tooltipFormatter = (v: number, _: string, p: { payload: StatsRow }) =>
    [`${v.toLocaleString()}${p.payload.unit}`, statsData.tableTitle];
  const axisProps = { axisLine: false, tickLine: false };
  const xAxis = <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#A8A6C0' }} {...axisProps} />;
  const yAxis = <YAxis tick={{ fontSize: 10, fill: '#A8A6C0' }} {...axisProps} />;
  const grid  = <CartesianGrid strokeDasharray="3 3" stroke="#F0EEFA" vertical={false} />;
  const tip   = <ReTooltip contentStyle={tooltipStyle} formatter={tooltipFormatter as never} />;
  const margin = { top: 4, right: 8, left: -20, bottom: 0 };

  function renderChart() {
    if (chartKind === 'bar') return (
      <BarChart data={statsData.rows} margin={margin}>
        {grid}{xAxis}{yAxis}{tip}
        <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]} />
      </BarChart>
    );
    if (chartKind === 'line') return (
      <LineChart data={statsData.rows} margin={margin}>
        {grid}{xAxis}{yAxis}{tip}
        <Line type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={2.5} dot={{ fill: '#4F46E5', r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>
    );
    if (chartKind === 'area') return (
      <AreaChart data={statsData.rows} margin={margin}>
        {grid}{xAxis}{yAxis}{tip}
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={2.5} fill="url(#areaGrad)" dot={{ fill: '#4F46E5', r: 4 }} activeDot={{ r: 6 }} />
      </AreaChart>
    );
    /* pie */
    return (
      <PieChart>
        <Pie data={statsData.rows} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={65} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
          {statsData.rows.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
        </Pie>
        <ReTooltip contentStyle={tooltipStyle} formatter={(v: number) => [v.toLocaleString(), statsData.tableTitle]} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    );
  }

  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 shadow-sm shadow-[#4F46E5]/25 mt-0.5">
        <img src={jpdcLogo} alt="JPDC AI" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0 space-y-3">
        {/* 분류 배지 */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EEEEFF] border border-[#C7C3F7] text-[10.5px] font-semibold text-[#4F46E5]">
            <BarChart2 className="w-3 h-3" strokeWidth={2} />
            TAG 통계 질의
          </span>
          <span className="text-[12px] text-[#A8A6C0]">자연어 통계 분석 결과</span>
        </div>

        {/* 텍스트 답변 */}
        <div className="bg-white border border-[#E4E2F0] rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
          {streaming ? (
            <StreamingAnswer answer={statsData.answer} onDone={() => { setTextDone(true); onDone(); }} />
          ) : (
            <div className="text-[13.5px] text-[#1A1826] space-y-0.5">{renderText(statsData.answer)}</div>
          )}
        </div>

        {(!streaming || textDone) && (
          <>
            {/* 데이터 테이블 */}
            <div className="bg-white border border-[#E4E2F0] rounded-xl overflow-hidden shadow-sm">
              <div className="px-4 py-2 bg-[#F9F8FF] border-b border-[#E4E2F0] flex items-center justify-between">
                <p className="text-[12px] font-semibold text-[#6B6882] uppercase tracking-wide">상세 데이터</p>
                <TrendingUp className="w-3.5 h-3.5 text-[#C7C3F7]" strokeWidth={1.8} />
              </div>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[#E4E2F0] bg-[#FAFAFA]">
                    <th className="px-4 py-2 text-left text-[10.5px] font-semibold text-[#A8A6C0]">항목</th>
                    <th className="px-4 py-2 text-right text-[10.5px] font-semibold text-[#A8A6C0]">값</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F3FC]">
                  {statsData.rows.map((row, i) => (
                    <tr key={i} className="hover:bg-[#F9F8FF] transition-colors">
                      <td className="px-4 py-2.5 text-[#6B6882] font-medium">{row.label}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-[#1A1826]">
                        {row.value.toLocaleString()}{row.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 차트 */}
            <div className="bg-white border border-[#E4E2F0] rounded-xl p-4 shadow-sm">
              {/* 헤더: 제목 + 차트 유형 셀렉트 */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-[12px] font-semibold text-[#6B6882] uppercase tracking-wide">{statsData.tableTitle}</p>
                <select
                  value={chartKind}
                  onChange={e => setChartKind(e.target.value as ChartKind)}
                  className="text-[12px] font-medium text-[#4F46E5] bg-[#F4F3FC] border border-[#C7C3F7] rounded-lg px-2 py-1 outline-none cursor-pointer hover:bg-[#EEEEFF] transition-colors"
                >
                  {CHART_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <ResponsiveContainer width="100%" height={chartKind === 'pie' ? 200 : 160}>
                {renderChart()}
              </ResponsiveContainer>
            </div>
          </>
        )}
        {actionBar}
      </div>
    </div>
  );
}

/* ── Dual TAG 패널 ────────────────────────────────────────── */
const RERUN_STEP_LABELS = ['해석 확인', '파라미터 적용', 'SQL 생성', '데이터 조회', '결과 생성'];

function InterpretationCard({
  interp,
  colorScheme,
  rerunResult,
  onRerun,
  onContinue,
}: {
  interp: { title: string; description: string; params: { key: string; value: string }[]; sqlQuery: string; columns: string[]; rows: (string | number)[][]; chartData: { label: string; value: number }[]; chartUnit: string };
  colorScheme: 1 | 2;
  rerunResult: React.ReactNode;
  onRerun: (desc: string, params: { key: string; value: string }[]) => void;
  onContinue: () => void;
}) {
  const [desc, setDesc] = useState(interp.description);
  const [editingDesc, setEditingDesc] = useState(false);
  const [editingDescVal, setEditingDescVal] = useState('');
  const [params, setParams] = useState(interp.params);
  const [editingParamIdx, setEditingParamIdx] = useState<number | null>(null);
  const [editingParamVal, setEditingParamVal] = useState('');

  const is1 = colorScheme === 1;
  const headerBg    = is1 ? 'bg-[#f0f5ff]' : 'bg-[#fff9f0]';
  const headerBorder = is1 ? 'border-[#c8d8f8]' : 'border-[#f8dec8]';
  const badgeBg     = is1 ? 'bg-[#e4eeff] text-[#2355b0]' : 'bg-[#ffeedd] text-[#a05018]';
  const rerunColor  = is1 ? 'text-[#4F46E5] hover:bg-[#eeeeff]' : 'text-[#d97706] hover:bg-[#fff3e0]';
  const rerunBorder = is1 ? 'border-[#c8d8f8] text-[#2355b0] hover:bg-[#eef3ff]' : 'border-[#f8dec8] text-[#a05018] hover:bg-[#fff7ef]';
  const paramBg     = is1 ? 'bg-[#eef3ff] text-[#2355b0] border-[#c8d8f8]' : 'bg-[#fff4e6] text-[#a05018] border-[#f8dec8]';
  const paramEditBg = is1 ? 'bg-white border-[#4F46E5]' : 'bg-white border-[#d97706]';

  const commitDesc = () => {
    if (editingDescVal.trim()) setDesc(editingDescVal.trim());
    setEditingDesc(false);
  };
  const commitParam = (idx: number) => {
    const parts = editingParamVal.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join(':').trim();
      setParams(prev => prev.map((p, i) => i === idx ? { key, value } : p));
    }
    setEditingParamIdx(null);
  };

  return (
    <div className={`flex flex-col flex-1 min-w-0 border rounded-xl overflow-hidden shadow-sm ${headerBorder}`}>
      {/* 헤더 */}
      <div className={`px-4 py-3 border-b ${headerBg} ${headerBorder}`}>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className={`text-[12px] font-bold px-2 py-0.5 rounded-full ${badgeBg}`}>{interp.title}</span>
          <button
            onClick={() => onRerun(desc, params)}
            className={`p-1 rounded-lg transition-colors ${rerunColor}`}
            title="재조회"
          >
            <RefreshCw className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        </div>
        {/* 편집 가능한 해석 문장 */}
        {editingDesc ? (
          <div className="flex items-center gap-1.5">
            <input
              autoFocus
              className={`flex-1 text-[13px] px-2 py-1 rounded-lg border outline-none ${paramEditBg}`}
              value={editingDescVal}
              onChange={e => setEditingDescVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') commitDesc(); if (e.key === 'Escape') setEditingDesc(false); }}
              onBlur={commitDesc}
            />
            <button onClick={commitDesc} className="p-1 text-emerald-500 hover:text-emerald-600"><Check className="w-3.5 h-3.5" strokeWidth={2} /></button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 group">
            <p className="text-[13px] text-[#444] flex-1">{desc}</p>
            <button
              onClick={() => { setEditingDescVal(desc); setEditingDesc(true); }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded text-[#A8A6C0] hover:text-[#4F46E5] transition-all"
            >
              <Pencil className="w-3 h-3" strokeWidth={1.8} />
            </button>
          </div>
        )}
      </div>

      {/* 파라미터 태그 */}
      <div className="px-4 py-3 border-b border-[#E4E2F0] bg-white">
        <p className="text-[10.5px] font-semibold text-[#A8A6C0] uppercase tracking-wide mb-2">파라미터</p>
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {params.map((p, idx) => (
            editingParamIdx === idx ? (
              <input
                key={idx}
                autoFocus
                className={`text-[12px] px-2 py-0.5 rounded-full border outline-none w-36 ${paramEditBg}`}
                value={editingParamVal}
                onChange={e => setEditingParamVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') commitParam(idx); if (e.key === 'Escape') setEditingParamIdx(null); }}
                onBlur={() => commitParam(idx)}
              />
            ) : (
              <button
                key={idx}
                onClick={() => { setEditingParamVal(`${p.key}: ${p.value}`); setEditingParamIdx(idx); }}
                className={`text-[12px] px-2.5 py-0.5 rounded-full border font-medium transition-all hover:brightness-95 ${paramBg}`}
              >
                {p.key}: <span className="font-bold">{p.value}</span>
              </button>
            )
          ))}
        </div>
        <button
          onClick={() => onRerun(desc, params)}
          className={`text-[12px] px-3 py-1 rounded-lg border font-medium transition-colors flex items-center gap-1.5 ${rerunBorder}`}
        >
          <RefreshCw className="w-3 h-3" strokeWidth={2} />
          재조회
        </button>
      </div>

      {/* SQL 쿼리 */}
      <div className="px-4 py-3 border-b border-[#E4E2F0] bg-white">
        <div className="flex items-center gap-1.5 mb-2">
          <Database className="w-3 h-3 text-[#A8A6C0]" strokeWidth={1.8} />
          <p className="text-[10.5px] font-semibold text-[#A8A6C0] uppercase tracking-wide">SQL 쿼리</p>
        </div>
        <div className="bg-[#0d1117] rounded-lg px-3 py-2.5 overflow-x-auto">
          <pre className="text-[12px] text-[#4ade80] font-mono leading-relaxed whitespace-pre">{interp.sqlQuery}</pre>
        </div>
      </div>

      {/* 조회 결과 테이블 */}
      <div className="bg-white">
        <div className="px-4 py-2 bg-[#FAFAFA] border-b border-[#F0F0F0]">
          <p className="text-[10.5px] font-semibold text-[#A8A6C0] uppercase tracking-wide">조회 결과</p>
        </div>
        <table className="w-full text-[11.5px]">
          <thead>
            <tr className="border-b border-[#E4E2F0] bg-[#FAFAFA]">
              {interp.columns.map((col, ci) => (
                <th key={ci} className={`px-3 py-2 text-[10.5px] font-semibold text-[#A8A6C0] ${ci === 0 ? 'text-left' : 'text-right'}`}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F3FC]">
            {interp.rows.map((row, ri) => (
              <tr key={ri} className="hover:bg-[#F9F8FF] transition-colors">
                {row.map((cell, ci) => (
                  <td key={ci} className={`px-3 py-2 ${ci === 0 ? 'text-[#6B6882] font-medium' : 'text-right font-semibold text-[#1A1826]'}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 시각화 차트 */}
      <div className="px-4 pt-3 pb-4 bg-white border-t border-[#F0F0F0]">
        <p className="text-[10.5px] font-semibold text-[#A8A6C0] uppercase tracking-wide mb-2.5">시각화</p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={interp.chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#F0EEFA" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#A8A6C0' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fill: '#A8A6C0' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => v >= 1000000 ? `${(v / 10000).toFixed(0)}만` : v >= 1000 ? `${(v / 1000).toFixed(0)}천` : String(v)}
            />
            <ReTooltip
              contentStyle={{ background: '#fff', border: '1px solid #E4E2F0', borderRadius: 8, fontSize: 11, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              formatter={(v: number) => [`${v.toLocaleString()}${interp.chartUnit}`, '생산량']}
            />
            <Bar
              dataKey="value"
              fill={is1 ? '#4F46E5' : '#d97706'}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 재조회 결과 */}
      {rerunResult}

      <div className="px-4 py-3 border-t border-[#E4E2F0] bg-[#FAFAFA]">
        <ContinueQueryButton onClick={onContinue} />
      </div>
    </div>
  );
}

interface RerunState {
  which: 1 | 2;
  steps: { label: string; done: boolean }[];
  allDone: boolean;
  expanded: boolean;
  streamText: string;
  streamFull: string;
  streamDone: boolean;
}

function DualTagPanel({
  data,
  streaming,
  onDone,
  onContinue,
  actionBar,
}: {
  data: DualTagData;
  streaming: boolean;
  onDone: () => void;
  onContinue: () => void;
  actionBar?: React.ReactNode;
}) {
  const [textDone, setTextDone] = useState(false);
  const [rerun1, setRerun1] = useState<RerunState | null>(null);
  const [rerun2, setRerun2] = useState<RerunState | null>(null);
  const rerun1StreamIdx = useRef(0);
  const rerun2StreamIdx = useRef(0);

  const buildRerunText = (desc: string, params: { key: string; value: string }[]) => {
    const paramStr = params.map(p => `${p.key}: ${p.value}`).join(', ');
    return `**재조회 결과**\n\n> **해석**: ${desc}\n\n수정된 조건으로 조회한 결과입니다.\n\n**조회 조건**: ${paramStr}\n**조회 시간**: 0.07초\n**결과 건수**: ${Math.floor(Math.random() * 5) + 3}건`;
  };

  const startRerun = useCallback((which: 1 | 2, desc: string, params: { key: string; value: string }[]) => {
    const setter = which === 1 ? setRerun1 : setRerun2;
    const streamIdx = which === 1 ? rerun1StreamIdx : rerun2StreamIdx;
    const fullText = buildRerunText(desc, params);
    streamIdx.current = 0;

    setter({
      which,
      steps: RERUN_STEP_LABELS.map(label => ({ label, done: false })),
      allDone: false,
      expanded: true,
      streamText: '',
      streamFull: fullText,
      streamDone: false,
    });

    RERUN_STEP_LABELS.forEach((_, i) => {
      setTimeout(() => {
        setter(prev => {
          if (!prev) return prev;
          const newSteps = prev.steps.map((s, si) => si <= i ? { ...s, done: true } : s);
          const allDone = newSteps.every(s => s.done);
          return { ...prev, steps: newSteps, allDone, expanded: !allDone };
        });

        if (i === RERUN_STEP_LABELS.length - 1) {
          // 스트리밍 시작
          const interval = setInterval(() => {
            setter(prev => {
              if (!prev) { clearInterval(interval); return prev; }
              if (streamIdx.current >= prev.streamFull.length) {
                clearInterval(interval);
                return { ...prev, streamDone: true };
              }
              const chunk = Math.floor(Math.random() * 3) + 1;
              streamIdx.current = Math.min(streamIdx.current + chunk, prev.streamFull.length);
              return { ...prev, streamText: prev.streamFull.slice(0, streamIdx.current) };
            });
          }, 22);
        }
      }, 800 * (i + 1));
    });
  }, []);

  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#7C6FF7] flex items-center justify-center shrink-0 shadow-sm shadow-[#4F46E5]/25 mt-0.5">
        <BarChart2 className="w-4 h-4 text-white" strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0 space-y-3">
        {/* 배지 */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EEEEFF] border border-[#C7C3F7] text-[10.5px] font-semibold text-[#4F46E5]">
            <Database className="w-3 h-3" strokeWidth={2} />
            TAG 통계 질의
          </span>
          <span className="text-[12px] text-[#A8A6C0]">2가지 해석으로 분석</span>
        </div>

        {/* 인트로 텍스트 */}
        <div className="bg-white border border-[#E4E2F0] rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
          {streaming ? (
            <StreamingAnswer answer={data.introText} onDone={() => { setTextDone(true); onDone(); }} />
          ) : (
            <div className="text-[13.5px] text-[#1A1826] space-y-0.5">{renderText(data.introText)}</div>
          )}
        </div>

        {/* 2분할 패널 */}
        {(!streaming || textDone) && (
          <div className="flex flex-col md:flex-row gap-3">
            <InterpretationCard
              interp={data.interpretation1}
              colorScheme={1}
              rerunResult={rerun1 && (
                <RerunResultBlock state={rerun1} onToggle={() => setRerun1(p => p ? { ...p, expanded: !p.expanded } : p)} />
              )}
              onRerun={(desc, params) => startRerun(1, desc, params)}
              onContinue={onContinue}
            />
            <InterpretationCard
              interp={data.interpretation2}
              colorScheme={2}
              rerunResult={rerun2 && (
                <RerunResultBlock state={rerun2} onToggle={() => setRerun2(p => p ? { ...p, expanded: !p.expanded } : p)} />
              )}
              onRerun={(desc, params) => startRerun(2, desc, params)}
              onContinue={onContinue}
            />
          </div>
        )}

        {actionBar}
      </div>
    </div>
  );
}

function RerunResultBlock({ state, onToggle }: { state: RerunState; onToggle: () => void }) {
  return (
    <div className="border-t border-[#E4E2F0] bg-[#F9F8FF]">
      {/* 처리 과정 아코디언 */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-[#F0EEFA] transition-colors"
      >
        <span className="text-[12px] font-semibold text-[#6B6882]">처리 과정</span>
        {state.expanded
          ? <ChevronDown className="w-3.5 h-3.5 text-[#A8A6C0]" strokeWidth={2} />
          : <ChevronRight className="w-3.5 h-3.5 text-[#A8A6C0]" strokeWidth={2} />}
      </button>
      {state.expanded && (
        <div className="px-4 pb-2.5 space-y-1">
          {state.steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              {step.done
                ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" strokeWidth={2} />
                : <div className="w-3.5 h-3.5 rounded-full border-2 border-[#C7C3F7] border-t-[#4F46E5] animate-spin shrink-0" />}
              <span className={`text-[12px] ${step.done ? 'text-[#6B6882]' : 'text-[#A8A6C0]'}`}>{i + 1}. {step.label}</span>
            </div>
          ))}
        </div>
      )}
      {/* 스트리밍 결과 */}
      {state.allDone && (state.streamText || state.streamDone) && (
        <div className="px-4 pb-4 pt-1">
          <div className="bg-white border border-[#E4E2F0] rounded-xl px-4 py-3">
            <div className="text-[12.5px] text-[#1A1826] space-y-0.5">
              {renderText(state.streamText)}
            </div>
            {!state.streamDone && (
              <span className="inline-block w-0.5 h-3.5 bg-[#4F46E5] animate-pulse ml-0.5 align-middle" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   메시지 타입
══════════════════════════════════════════════════════════════ */
type Message =
  | { role: 'user'; text: string }
  | { role: 'assistant'; kind: 'classifying'; forceKind?: 'instruction' | 'minutes-request' | 'minutes-result' }
  | { role: 'assistant'; kind: 'thinking'; queryKind: QueryKind; query: string }
  | { role: 'assistant'; kind: 'instruction'; streaming: boolean; appendSelectOnDone?: boolean }
  | { role: 'assistant'; kind: 'assistant-select'; candidates: CandidateAssistant[] }
  | { role: 'assistant'; kind: 'tag-stats'; statsData: StatsData; streaming: boolean; appendSelectOnDone?: boolean }
  | { role: 'assistant'; kind: 'dual-tag'; dualData: DualTagData; streaming: boolean; appendSelectOnDone?: boolean }
  | { role: 'assistant'; kind: 'ambiguous'; query: string; streaming: boolean }
  | { role: 'assistant'; kind: 'route-select'; query: string }
  | { role: 'assistant'; kind: 'rag-ab'; query: string; streamingA: boolean; streamingB: boolean; selected?: 'A' | 'B' }
  | { role: 'assistant'; kind: 'rag-tag-assistant'; query: string; streamingRag: boolean; streamingTag: boolean }
  | { role: 'assistant'; kind: 'assistant-intro'; name: string; starters: string[]; desc?: string; switchNotice?: string }
  | { role: 'assistant'; kind: 'minutes-request'; streaming: boolean }
  | { role: 'assistant'; kind: 'minutes-result'; streaming: boolean }
  | { role: 'assistant'; kind: 'fallback'; streaming: boolean }
  | { role: 'assistant'; kind: 'rag-prompt' }
  | { role: 'assistant'; kind: 'follow-up-prompt' };

/* ── 입력창 ───────────────────────────────────────────────── */
const MY_ASSISTANTS = ['회의록 문장정리', '이메일 문체변경', '번역', '보도자료'];

const MY_ASSISTANT_STARTERS: Record<string, string[]> = {
  '회의록 문장정리': ['오늘 계약 검토 회의 내용을 정리해 줘', '안건 3개로 구성된 회의록 초안을 작성해 줘', '액션아이템만 따로 추출해 줄 수 있어?'],
  '이메일 문체변경': ['이 이메일을 정중한 격식체로 바꿔줘', '비격식 친근한 문체로 변환해 줘', '영어 이메일을 한국어 공문 스타일로 바꿔줘'],
  '번역':           ['이 영어 이메일을 자연스러운 한국어로 번역해 줘', '계약서 일부를 영어로 번역해 줘', '일본어 공문서를 번역해 줘'],
  '번역 비서':      ['이 영어 이메일을 자연스러운 한국어로 번역해 줘', '계약서 일부를 영어로 번역해 줘', '일본어 공문서를 번역해 줘'],
  '보도자료':       ['신제품 출시 보도자료를 작성해 줘', '이 내용을 언론 배포용 문체로 다듬어 줘', '보도자료 제목 후보 5개를 만들어 줘'],
  '코드 최적화':    ['이 코드의 성능 병목을 찾아 개선해 줘', '중복 코드를 줄이고 읽기 쉽게 정리해 줘', '오류 가능성이 있는 부분을 검토해 줘'],
  '문서 요약 비서': ['첨부 문서의 핵심 내용을 요약해 줘', '주요 결정사항과 후속 조치를 정리해 줘', '보고용으로 한 페이지 분량으로 요약해 줘'],
};

const MY_ASSISTANT_DESCRIPTIONS: Record<string, string> = {
  '회의록 문장정리': '회의 내용을 체계적이고 보기 좋은 문서로 자동 정리합니다. 핵심 안건·결정사항·액션아이템을 추출해 보고서 품질을 높여 드립니다.',
  '이메일 문체변경': '이메일의 목적과 상대방에 맞춰 정중한 격식체, 친근한 문체 또는 공문 스타일로 자연스럽게 다듬어 드립니다.',
  '번역': '문맥과 전문 용어를 고려해 자연스럽고 정확한 다국어 번역을 제공합니다.',
  '번역 비서': '문맥과 전문 용어를 고려해 자연스럽고 정확한 다국어 번역을 제공합니다.',
  '보도자료': '핵심 메시지가 명확하게 전달되는 언론 배포용 보도자료를 작성하고 문체를 다듬어 드립니다.',
  '코드 최적화': '코드의 오류와 성능 병목을 분석하고 읽기 쉽고 유지보수하기 좋은 구조로 개선해 드립니다.',
  '문서 요약 비서': '긴 문서에서 핵심 내용, 주요 결정사항과 후속 조치를 빠르게 추출해 간결하게 정리합니다.',
};

/* 파일 크기 포맷 */
function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

/* 파일 종류별 아이콘 색상 */
function fileAccentColor(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return { bg: '#FFF7ED', text: '#EA580C' };
  if (['pdf'].includes(ext)) return { bg: '#FEF2F2', text: '#DC2626' };
  if (['xlsx','xls','csv'].includes(ext)) return { bg: '#F0FDF4', text: '#16A34A' };
  if (['docx','doc','hwp','hwpx'].includes(ext)) return { bg: '#EFF6FF', text: '#2563EB' };
  if (['pptx','ppt'].includes(ext)) return { bg: '#FFF7ED', text: '#D97706' };
  if (['zip','7z','tar','gz'].includes(ext)) return { bg: '#F5F3FF', text: '#7C3AED' };
  return { bg: '#F3F4F6', text: '#6B7280' };
}

interface FileEntry {
  id: number;
  file: File;
  status: 'indexing' | 'done';
  progress: number; // 0–100
}

function InputBar({
  onSend,
  focusRequest = 0,
  awaitingFollowUp = false,
  activeAssistantName = null,
  assistantOrder = [],
}: {
  onSend: (text: string, assistantName?: string | null) => void;
  focusRequest?: number;
  awaitingFollowUp?: boolean;
  activeAssistantName?: string | null;
  assistantOrder?: string[];
}) {
  const [value, setValue] = useState('');
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<FileEntry[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const nextId = useRef(0);
  const displayedAssistantName = selectedAssistant ?? activeAssistantName;
  const isPendingAssistantChange = Boolean(
    selectedAssistant && selectedAssistant !== activeAssistantName
  );

  useEffect(() => {
    if (focusRequest === 0) return;
    const timer = setTimeout(() => textareaRef.current?.focus(), 0);
    return () => clearTimeout(timer);
  }, [focusRequest]);

  /* 임베딩 애니메이션 — 새로 추가된 파일마다 200ms 스태거로 시작 */
  useEffect(() => {
    const indexing = attachedFiles.filter(f => f.status === 'indexing');
    if (!indexing.length) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    indexing.forEach((entry, i) => {
      const duration = 1200 + Math.random() * 1000; // 1.2~2.2s
      const startDelay = i * 200;
      const tick = 40;
      const steps = duration / tick;
      let step = 0;
      const t = setTimeout(() => {
        const iv = setInterval(() => {
          step++;
          const progress = Math.min(100, Math.round((step / steps) * 100));
          setAttachedFiles(prev =>
            prev.map(f => f.id === entry.id
              ? { ...f, progress, status: progress >= 100 ? 'done' : 'indexing' }
              : f
            )
          );
          if (progress >= 100) clearInterval(iv);
        }, tick);
        timers.push(iv as unknown as ReturnType<typeof setTimeout>);
      }, startDelay);
      timers.push(t);
    });
    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachedFiles.map(f => f.id).join(',')]);

  const doSend = () => {
    if (!value.trim() && attachedFiles.length === 0) return;
    onSend(value.trim(), selectedAssistant);
    setValue('');
    setSelectedAssistant(null);
    setAttachedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!assistantOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAssistantOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [assistantOpen]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files ?? []);
    if (!incoming.length) return;
    setAttachedFiles(prev => {
      const names = new Set(prev.map(f => f.file.name));
      const fresh: FileEntry[] = incoming
        .filter(f => !names.has(f.name))
        .map(f => ({ id: nextId.current++, file: f, status: 'indexing', progress: 0 }));
      return [...prev, ...fresh];
    });
    e.target.value = '';
  };

  const removeFile = (id: number) =>
    setAttachedFiles(prev => prev.filter(f => f.id !== id));

  return (
    <div className="shrink-0 px-6 py-4 border-t border-[#E4E2F0] bg-white">
      <div className="max-w-[920px] mx-auto">
        <div className="bg-white rounded-2xl border border-[#E4E2F0] shadow-sm hover:border-[#C7C3F7] focus-within:border-[#4F46E5] focus-within:shadow-[0_0_0_3px_rgba(79,70,229,0.08)] transition-all">

          {/* 선택된 비서 및 첨부 파일 목록 */}
          {(displayedAssistantName || attachedFiles.length > 0) && (
            <div className="flex flex-wrap gap-2 px-4 pt-3 pb-1">
              {displayedAssistantName && (
                <div
                  className="flex h-fit max-w-full min-w-0 items-center gap-1.5 rounded-lg border border-[#C7C3F7] bg-[#EEEEFF] px-2.5 py-2 text-[#4F46E5]"
                  title={displayedAssistantName}
                >
                  <Users className="h-3.5 w-3.5 shrink-0" strokeWidth={1.9} />
                  <span className="max-w-[220px] truncate text-[12px] font-semibold">
                    {displayedAssistantName}
                  </span>
                  <span className="shrink-0 text-[10px] font-medium text-[#8A84C7]">비서</span>
                </div>
              )}
              {attachedFiles.map(entry => {
                const { bg, text } = fileAccentColor(entry.file.name);
                const ext = entry.file.name.split('.').pop()?.toUpperCase() ?? 'FILE';
                const isDone = entry.status === 'done';
                return (
                  <div key={entry.id}
                    className="relative flex flex-col gap-1 pl-2.5 pr-1.5 pt-1.5 pb-1 rounded-lg border overflow-hidden transition-all group/chip"
                    style={{ borderColor: isDone ? `${text}33` : `${text}55`, background: bg, minWidth: 140, maxWidth: 200 }}>
                    {/* 상단 행: 배지 + 아이콘 상태 + 삭제 */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black tracking-wide leading-none px-1.5 py-0.5 rounded-md shrink-0"
                        style={{ background: text, color: '#fff' }}>{ext}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold leading-tight truncate" style={{ color: text }}>
                          {entry.file.name}
                        </p>
                        <p className="text-[10px] leading-tight" style={{ color: `${text}99` }}>
                          {fmtSize(entry.file.size)}
                        </p>
                      </div>
                      {/* 완료 체크 / 삭제 */}
                      {isDone ? (
                        <button type="button" onClick={() => removeFile(entry.id)}
                          className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 opacity-40 group-hover/chip:opacity-100 transition-opacity"
                          style={{ background: `${text}22` }}>
                          <X className="w-2.5 h-2.5" style={{ color: text }} strokeWidth={2.5} />
                        </button>
                      ) : (
                        <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: `${text}15` }}>
                          {/* 미니 스피너 */}
                          <svg className="animate-spin" width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <circle cx="5" cy="5" r="3.5" stroke={`${text}33`} strokeWidth="2"/>
                            <path d="M5 1.5A3.5 3.5 0 0 1 8.5 5" stroke={text} strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    {/* 프로그레스 바 */}
                    <div className="h-[3px] rounded-full overflow-hidden" style={{ background: `${text}18` }}>
                      <div
                        className="h-full rounded-full transition-all duration-75"
                        style={{
                          width: `${entry.progress}%`,
                          background: isDone
                            ? `linear-gradient(90deg, ${text}aa, ${text})`
                            : `linear-gradient(90deg, ${text}66, ${text})`,
                        }}
                      />
                    </div>
                    {/* 상태 텍스트 */}
                    <p className="text-[8.5px] font-semibold leading-none" style={{ color: `${text}88` }}>
                      {isDone ? '✓ 임베딩 완료' : `벡터 인덱싱 중… ${entry.progress}%`}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {isPendingAssistantChange && (
            <div className="mx-4 mt-2 flex items-start gap-2 rounded-xl border border-[#D9D6F5] bg-[#F7F6FF] px-3.5 py-2.5">
              <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#4F46E5]" strokeWidth={2} />
              <p className="text-[11.5px] font-medium leading-relaxed text-[#6B6882]">
                질문을 전송하면 기존 대화는 저장되고, <span className="font-semibold text-[#4F46E5]">{selectedAssistant}</span>과의 새 대화가 시작됩니다.
              </p>
            </div>
          )}

          {/* 텍스트 입력 */}
          <textarea ref={textareaRef} value={value} onChange={e => setValue(e.target.value)} onKeyDown={handleKey}
            className="w-full px-5 pt-4 pb-2 bg-transparent border-none outline-none text-[#1A1826] placeholder:text-[#A8A6C0] resize-none text-base leading-relaxed"
            placeholder={awaitingFollowUp ? '궁금하신 것을 입력해주세요... (Enter 전송)' : '추가 질문을 입력하세요... (Enter 전송)'} rows={2} />

          {/* 툴바 */}
          <div className="flex items-center justify-between px-4 pb-3">
            <div className="flex items-center gap-0.5">
              {/* 파일 첨부 — input은 DOM에만 두고 label htmlFor로 연결 */}
              <input
                id="jpdc-file-attach"
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <Tooltip label="파일 첨부">
                <label
                  htmlFor="jpdc-file-attach"
                  className={`cursor-pointer p-1.5 rounded-lg transition-colors flex items-center justify-center ${
                    attachedFiles.length > 0
                      ? 'text-[#4F46E5] bg-[#EEEEFF]'
                      : 'text-[#A8A6C0] hover:text-[#4F46E5] hover:bg-[#F4F3FC]'
                  }`}
                >
                  <Paperclip className="w-[15px] h-[15px]" strokeWidth={1.8} />
                </label>
              </Tooltip>
              {attachedFiles.length > 0 && (
                <span className="text-[11px] font-semibold text-[#4F46E5] ml-0.5">{attachedFiles.length}</span>
              )}

              {/* 비서 선택 드롭다운 */}
              <div className="relative ml-1" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setAssistantOpen(v => !v)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11.5px] font-semibold transition-all border ${
                    displayedAssistantName
                      ? 'bg-[#EEEEFF] border-[#C7C3F7] text-[#4F46E5]'
                      : assistantOpen
                        ? 'bg-[#F4F3FC] border-[#C7C3F7] text-[#4F46E5]'
                        : 'bg-transparent border-transparent text-[#A8A6C0] hover:text-[#4F46E5] hover:bg-[#F4F3FC]'
                  }`}>
                  <Users className="w-3.5 h-3.5 shrink-0" strokeWidth={1.8} />
                  <span>{displayedAssistantName ? '비서 다시 선택' : '비서 선택'}</span>
                  <ChevronDown className="w-3 h-3 shrink-0 transition-transform" style={{ transform: assistantOpen ? 'rotate(180deg)' : 'none' }} />
                </button>

                {assistantOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-xl border border-[#E4E2F0] shadow-lg overflow-hidden z-30">
                    {[...(assistantOrder && assistantOrder.length > 0 ? assistantOrder : MY_ASSISTANTS)].reverse().map(a => (
                      <button key={a} type="button"
                        onClick={() => {
                          setSelectedAssistant(a);
                          setAssistantOpen(false);
                          setTimeout(() => textareaRef.current?.focus(), 0);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-left text-[12.5px] font-medium transition-colors ${
                          displayedAssistantName === a
                            ? 'bg-[#EEEEFF] text-[#4F46E5]'
                            : 'text-[#1A1826] hover:bg-[#F9F8FF]'
                        }`}>
                        {displayedAssistantName === a && <CheckCircle2 className="w-3.5 h-3.5 text-[#4F46E5] shrink-0" strokeWidth={2} />}
                        {displayedAssistantName !== a && <div className="w-3.5 h-3.5 shrink-0" />}
                        {a}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <Tooltip label="메시지 전송 (Enter)">
              <button type="button" onClick={doSend}
                className="w-8 h-8 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] flex items-center justify-center text-white transition-colors shadow-sm shadow-[#4F46E5]/25">
                <ArrowUp className="w-4 h-4" strokeWidth={2} />
              </button>
            </Tooltip>
          </div>
        </div>
        <p className="text-center text-[10.5px] text-[#A8A6C0] mt-2">
          JPDC AI는 실수를 할 수 있습니다. 중요한 정보는 반드시 원문을 확인하세요.
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   비서 진입 패널
══════════════════════════════════════════════════════════════ */
function AssistantIntroPanel({
  name, starters, desc, switchNotice, onStarterClick,
}: {
  name: string; starters: string[]; desc?: string; switchNotice?: string;
  onStarterClick: (text: string) => void;
}) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 shadow-sm shadow-[#4F46E5]/25 mt-0.5">
        <img src={jpdcLogo} alt="JPDC AI" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0 space-y-3">
        {switchNotice && (
          <div className="flex items-center gap-2 rounded-xl border border-[#D9D6F5] bg-[#F7F6FF] px-3.5 py-2.5 text-[12px] font-medium text-[#6B6882]">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#4F46E5]" strokeWidth={2} />
            <span>{switchNotice}</span>
          </div>
        )}

        {/* 배지 */}
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EEEEFF] border border-[#C7C3F7] text-[10.5px] font-semibold text-[#4F46E5]">
          <Users className="w-3 h-3" strokeWidth={2} />
          비서 진입
        </span>

        {/* 인사말 */}
        <div className="bg-[#F9F8FF] border border-[#E4E2F0] rounded-2xl rounded-tl-sm px-5 py-4">
          <p className="text-[16px] font-bold text-[#1A1826] mb-1">
            <span className="text-[#4F46E5]">{name}</span>과 새 대화를 시작합니다.
          </p>
          {desc && (
            <p className="text-[12.5px] text-[#6B6882] leading-relaxed break-keep">{desc}</p>
          )}
        </div>

        {/* 대화 스타터 */}
        {starters.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[12px] font-semibold text-[#A8A6C0] uppercase tracking-wide">대화 스타터</p>
            {starters.map((s) => (
              <button key={s} type="button" onClick={() => onStarterClick(s)}
                className="flex items-center gap-2 w-full text-left px-3.5 py-2.5 rounded-xl border border-[#E4E2F0]
                           hover:border-[#4F46E5]/40 hover:bg-[#F9F8FF] transition-all group">
                <ChevronRight className="w-3 h-3 text-[#4F46E5] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
                <span className="text-[12.5px] text-[#6B6882] group-hover:text-[#1A1826] transition-colors leading-snug">{s}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   회의록 비서 패널 — 입력 안내
══════════════════════════════════════════════════════════════ */
function MinutesRequestPanel({ streaming, onDone }: { streaming: boolean; onDone: () => void }) {
  const content = `네, 회의 내용을 입력해 주시면 바로 정리해 드릴게요.\n\n아래 항목을 포함하시면 더 정확한 회의록을 작성해 드릴 수 있어요:\n\n• **회의 일시 및 장소**\n• **참석자 명단**\n• **주요 안건 및 논의 내용**\n• **결정 사항**\n• **액션 아이템** (담당자, 완료 기한)\n\n내용을 자유롭게 입력해 주세요. 메모 수준의 내용도 괜찮아요.`;
  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 shadow-sm shadow-[#4F46E5]/25 mt-0.5">
        <img src={jpdcLogo} alt="JPDC AI" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F5F3FF] border border-[#DDD6FE] text-[10.5px] font-semibold text-[#7C3AED]">
            <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3"><rect x="1" y="1" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M3.5 4h5M3.5 6h5M3.5 8h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            회의록 비서
          </span>
        </div>
        <div className="bg-white border border-[#E4E2F0] rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
          {streaming
            ? <StreamingAnswer answer={content} onDone={onDone} />
            : <div className="text-[13.5px] text-[#1A1826] space-y-0.5">{renderText(content)}</div>
          }
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   회의록 비서 패널 — 결과
══════════════════════════════════════════════════════════════ */
const MINUTES_MOCK = `## 📋 회의록

**제목:** 계약 검토 회의
**일시:** 2026년 7월 28일 (월) 14:00 – 15:30
**장소:** 5층 대회의실
**참석자:** 김동현 팀장, 이수진 대리, 박민준 사원, 최지영 주임

---

### 1. 주요 안건 및 논의 내용

**[안건 1] 신규 공급업체 A사 계약서 검토**
- 계약 기간: 2026.08.01 ~ 2027.07.31 (1년)
- 계약 금액: 2억 3,500만 원 (부가세 포함)
- 지체상금 조항(제12조) 요율을 현행 0.1% → 0.05%로 조정 요청 합의
- 계약 해지 사유에 '천재지변' 항목 명시 필요 — 법무팀 검토 의뢰
- 하자담보기간 2년 → 3년 연장 요청 (팀장 지시)

**[안건 2] 기존 계약 갱신 건**
- B사: 동일 조건 1년 자동 갱신 예정, 8월 1일 전 서명 완료
- C사: 단가 5% 인상 요청 — 구매팀 협의 후 2주 내 회신

---

### 2. 결정 사항

| 항목 | 내용 | 결정자 |
|------|------|--------|
| A사 계약 조항 수정 | 법무팀 검토 후 수정안 발송 | 김동현 팀장 |
| C사 단가 협의 | 구매팀 협의 후 승인 여부 결정 | 이수진 대리 |
| B사 자동 갱신 | 8월 1일 전 갱신 서명 완료 | 박민준 사원 |

---

### 3. 액션 아이템

| # | 내용 | 담당자 | 완료 기한 |
|---|------|--------|-----------|
| 1 | A사 계약서 수정 요청서 작성 | 이수진 대리 | 2026.08.04 |
| 2 | 법무팀 계약서 검토 의뢰 | 박민준 사원 | 2026.08.05 |
| 3 | C사 단가 협의 미팅 일정 조율 | 이수진 대리 | 2026.08.07 |
| 4 | B사 자동갱신 서명 완료 | 박민준 사원 | 2026.07.31 |

---

*작성: 회의록 문장정리 비서 · 2026.07.28*`;

function MinutesResultPanel({ streaming, onDone, actionBar }: { streaming: boolean; onDone: () => void; actionBar?: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 shadow-sm shadow-[#4F46E5]/25 mt-0.5">
        <img src={jpdcLogo} alt="JPDC AI" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F5F3FF] border border-[#DDD6FE] text-[10.5px] font-semibold text-[#7C3AED]">
            <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3"><rect x="1" y="1" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M3.5 4h5M3.5 6h5M3.5 8h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            회의록 작성 완료
          </span>
        </div>
        <div className="bg-white border border-[#E4E2F0] rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
          {streaming
            ? <StreamingAnswer answer={MINUTES_MOCK} onDone={onDone} />
            : <div className="text-[13.5px] text-[#1A1826] space-y-0.5">{renderText(MINUTES_MOCK)}</div>
          }
        </div>
        {!streaming && (
          <div className="mt-3 flex items-center gap-2">
            <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E4E2F0] text-[13px] text-[#6B6882] hover:border-[#7C3AED]/40 hover:text-[#7C3AED] hover:bg-[#F5F3FF] transition-colors">
              <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5"><path d="M2 4h10M2 7h8M2 10h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              문서로 내보내기
            </button>
            <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E4E2F0] text-[13px] text-[#6B6882] hover:border-[#7C3AED]/40 hover:text-[#7C3AED] hover:bg-[#F5F3FF] transition-colors">
              <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5"><path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              복사
            </button>
          </div>
        )}
        {actionBar}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   메인 ConversationView
══════════════════════════════════════════════════════════════ */
type AssistantCtx = { name: string; starters: string[]; desc?: string };

function makeInitialMessages(query: string, ctx: AssistantCtx | null): Message[] {
  // 비서 컨텍스트 + 질의가 함께 있으면 → 인트로 표시 후 즉시 처리 시작
  if (ctx && query.trim()) {
    const forceKind: 'instruction' | 'minutes-request' =
      ctx.name === '회의록 문장정리' ? 'minutes-request' : 'instruction';
    return [
      { role: 'assistant', kind: 'assistant-intro', name: ctx.name, starters: ctx.starters, desc: ctx.desc },
      { role: 'user', text: query },
      { role: 'assistant', kind: 'classifying', forceKind },
    ];
  }
  // 비서만 있고 질의 없으면 → 인트로에서 스타터 클릭 대기
  if (ctx) {
    return [{ role: 'assistant', kind: 'assistant-intro', name: ctx.name, starters: ctx.starters, desc: ctx.desc }];
  }
  // 일반 질의
  return [
    { role: 'user', text: query },
    { role: 'assistant', kind: 'classifying' },
  ];
}

export default function ConversationView({
  initialQuery,
  assistantContext = null,
  onOpenBriefing,
  savedItems,
  savedPanelOpen,
  onToggleSavedPanel,
  onSaveItem,
  onToggleSidebar,
  sidebarOpen = true,
  notifPanelOpen = false,
  notifUnread = 0,
  onToggleNotifPanel,
  assistantOrder,
  onNavigate,
}: {
  initialQuery: string;
  assistantContext?: AssistantCtx | null;
  onOpenBriefing?: () => void;
  savedItems: SavedItem[];
  savedPanelOpen: boolean;
  onToggleSavedPanel: () => void;
  onSaveItem: (query: string, answer: string) => void;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
  notifPanelOpen?: boolean;
  notifUnread?: number;
  onToggleNotifPanel?: () => void;
  assistantOrder?: string[];
  onNavigate?: (view: 'home' | 'market') => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [messages, setMessages] = useState<Message[]>(() => makeInitialMessages(initialQuery, assistantContext));
  const [answerDoneSet, setAnswerDoneSet] = useState<Set<number>>(new Set());
  const [activeAssistantName, setActiveAssistantName] = useState<string | null>(assistantContext?.name ?? null);
  const [followUpFocusRequest, setFollowUpFocusRequest] = useState(0);
  const [awaitingFollowUp, setAwaitingFollowUp] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  /* classifying → thinking 전환 (1.1s) */
  useEffect(() => {
    const idx = messages.findIndex(m => m.role === 'assistant' && m.kind === 'classifying');
    if (idx === -1) return;
    const userMsg = messages[idx - 1];
    if (!userMsg || userMsg.role !== 'user') return;
    const query = (userMsg as { role: 'user'; text: string }).text;

    const classifying = messages[idx] as { kind: 'classifying'; forceKind?: 'instruction' | 'minutes-request' | 'minutes-result' };
    const timer = setTimeout(() => {
      const queryKind = classifying.forceKind ?? classifyQuery(query);
      setMessages(prev => {
        const next = [...prev];
        next[idx] = { role: 'assistant', kind: 'thinking', queryKind, query };
        return next;
      });
    }, 1100);
    return () => clearTimeout(timer);
  }, [messages]);

  /* thinking 완료 → 실제 답변 전환 */
  const handleThinkingDone = useCallback((idx: number, queryKind: QueryKind, query: string) => {
    setMessages(prev => {
      const next = [...prev];
      if (queryKind === 'assistant-select') {
        next[idx] = { role: 'assistant', kind: 'assistant-select', candidates: getAssistantCandidates(query) };
      } else if (queryKind === 'tag-stats') {
        next[idx] = { role: 'assistant', kind: 'tag-stats', statsData: getTagStatsData(query), streaming: true };
      } else if (queryKind === 'tag-assistant') {
        next[idx] = { role: 'assistant', kind: 'tag-stats', statsData: getTagStatsData(query), streaming: true, appendSelectOnDone: true };
      } else if (queryKind === 'dual-tag') {
        next[idx] = { role: 'assistant', kind: 'dual-tag', dualData: getDualTagData(query), streaming: true };
      } else if (queryKind === 'dual-tag-assistant') {
        next[idx] = { role: 'assistant', kind: 'dual-tag', dualData: getDualTagData(query), streaming: true, appendSelectOnDone: true };
      } else if (queryKind === 'ambiguous') {
        next[idx] = { role: 'assistant', kind: 'ambiguous', query, streaming: true };
      } else if (queryKind === 'route-select') {
        next[idx] = { role: 'assistant', kind: 'route-select', query };
      } else if (queryKind === 'rag-ab') {
        next[idx] = { role: 'assistant', kind: 'rag-ab', query, streamingA: true, streamingB: true };
      } else if (queryKind === 'rag-tag-assistant') {
        next[idx] = { role: 'assistant', kind: 'rag-tag-assistant', query, streamingRag: true, streamingTag: true };
      } else if (queryKind === 'minutes-request') {
        next[idx] = { role: 'assistant', kind: 'minutes-request', streaming: true };
      } else if (queryKind === 'minutes-result') {
        next[idx] = { role: 'assistant', kind: 'minutes-result', streaming: true };
      } else if (queryKind === 'fallback') {
        next[idx] = { role: 'assistant', kind: 'fallback', streaming: true };
      } else if (queryKind === 'fallback-assistant') {
        // 지침 답변 먼저 → 스트리밍 완료 후 비서 선택 카드 삽입
        next[idx] = { role: 'assistant', kind: 'instruction', streaming: true, appendSelectOnDone: true };
      } else {
        next[idx] = { role: 'assistant', kind: 'instruction', streaming: true };
      }
      return next;
    });
  }, []);

  const handleContinueQuery = useCallback(() => {
    setAwaitingFollowUp(true);
    setFollowUpFocusRequest(request => request + 1);
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last?.role === 'assistant' && last.kind === 'follow-up-prompt') return prev;
      return [...prev, { role: 'assistant', kind: 'follow-up-prompt' }];
    });
  }, []);

  const handleRouteSelect = useCallback((idx: number, route: QueryRoute) => {
    setMessages(prev => {
      const next = [...prev];
      const current = prev[idx];
      if (current.role !== 'assistant' || current.kind !== 'route-select') return prev;

      if (route === 'instruction') {
        next[idx] = { role: 'assistant', kind: 'instruction', streaming: true };
      } else {
        next[idx] = {
          role: 'assistant',
          kind: 'tag-stats',
          statsData: getTagStatsData(current.query),
          streaming: true,
        };
      }
      return next;
    });
  }, []);

  /* 비서 선택 시 → instruction으로 전환 */
  const handleSelectAssistant = useCallback((idx: number, candidate: CandidateAssistant) => {
    // rag-prompt가 바로 뒤에 있으면 카드 선택 시 제거 (fallback-assistant 흐름)
    const removeRagPrompt = (next: Message[]) => {
      if (next[idx + 1]?.role === 'assistant' && (next[idx + 1] as { kind: string }).kind === 'rag-prompt') {
        next.splice(idx + 1, 1);
      }
    };

    // 회의록 비서는 인트로 흐름으로 연결
    if (candidate.name === '회의록 문장정리') {
      setActiveAssistantName('회의록 문장정리');
      setMessages(prev => {
        const next = [...prev];
        const cur = prev[idx];
        if (cur.role === 'assistant' && cur.kind === 'assistant-select') {
          next[idx] = { role: 'assistant', kind: 'assistant-select', candidates: cur.candidates };
        }
        removeRagPrompt(next);
        next.splice(idx + 1, 0,
          { role: 'user', text: `${candidate.name} 비서로 진행해 주세요.` },
          {
            role: 'assistant', kind: 'assistant-intro',
            name: '회의록 문장정리',
            starters: MY_ASSISTANT_STARTERS['회의록 문장정리'] ?? [],
            desc: undefined,
          },
        );
        return next;
      });
      return;
    }

    setMessages(prev => {
      const next = [...prev];
      const cur = prev[idx];
      if (cur.role === 'assistant' && cur.kind === 'assistant-select') {
        next[idx] = { role: 'assistant', kind: 'assistant-select', candidates: cur.candidates };
      }
      removeRagPrompt(next);
      next.splice(idx + 1, 0,
        { role: 'user', text: `${candidate.name} 비서로 진행해 주세요.` },
        { role: 'assistant', kind: 'instruction', streaming: true },
      );
      return next;
    });
  }, []);

  const handleSend = (text: string, assistantName?: string | null) => {
    setAwaitingFollowUp(false);
    const effective = assistantName ?? activeAssistantName;
    const startsNewAssistantConversation = Boolean(
      assistantName && assistantName !== activeAssistantName
    );

    if (startsNewAssistantConversation && assistantName) {
      let archived = false;
      if (messages.length > 0) {
        try {
          const storageKey = 'jpdc-ai-conversation-archive';
          const stored = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
          const archive = Array.isArray(stored) ? stored : [];
          archive.unshift({
            id: `${Date.now()}-${activeAssistantName ?? 'general'}`,
            assistantName: activeAssistantName,
            savedAt: new Date().toISOString(),
            messages,
          });
          localStorage.setItem(storageKey, JSON.stringify(archive.slice(0, 50)));
          archived = true;
        } catch {
          archived = false;
        }
      }

      setActiveAssistantName(assistantName);
      setAnswerDoneSet(new Set());
      setMessages([
        {
          role: 'assistant',
          kind: 'assistant-intro',
          name: assistantName,
          starters: MY_ASSISTANT_STARTERS[assistantName] ?? [],
          desc: MY_ASSISTANT_DESCRIPTIONS[assistantName],
          switchNotice: archived
            ? `기존 대화를 저장했습니다. ${assistantName}과 새 대화를 시작합니다.`
            : `${assistantName}과 새 대화를 시작합니다.`,
        },
        { role: 'user', text },
        {
          role: 'assistant',
          kind: 'classifying',
          forceKind: assistantName === '회의록 문장정리' ? 'minutes-request' : 'instruction',
        },
      ]);
      return;
    }

    if (assistantName) setActiveAssistantName(assistantName);

    setMessages(prev => {
      const finished = prev.map(m =>
        m.role === 'assistant' ? { ...m, streaming: false } : m
      ) as Message[];

      // 비서 인트로가 없을 때 → 인트로만 표시 (질의 버림)
      const alreadyHasIntro = effective
        ? finished.some(m => m.role === 'assistant' && m.kind === 'assistant-intro' && (m as { name: string }).name === effective)
        : false;
      if (effective && !alreadyHasIntro) {
        return [
          ...finished,
          { role: 'assistant', kind: 'assistant-intro', name: effective, starters: MY_ASSISTANT_STARTERS[effective] ?? [], desc: undefined },
        ];
      }

      // 회의록 비서 전용 흐름
      let forceKind: 'instruction' | 'minutes-request' | 'minutes-result' | undefined;
      if (effective === '회의록 문장정리') {
        const hasRequest = finished.some(m => m.role === 'assistant' && m.kind === 'minutes-request');
        const hasResult  = finished.some(m => m.role === 'assistant' && m.kind === 'minutes-result');
        forceKind = !hasRequest ? 'minutes-request' : !hasResult ? 'minutes-result' : 'instruction';
      } else if (effective) {
        forceKind = 'instruction';
      }

      return [
        ...finished,
        { role: 'user' as const, text },
        { role: 'assistant' as const, kind: 'classifying' as const, forceKind },
      ];
    });
  };

  const markDone = useCallback((idx: number) => {
    setAnswerDoneSet(prev => new Set([...prev, idx]));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-full bg-white min-w-0">
      {/* Topbar */}
      <div className="h-12 flex items-center justify-between px-4 md:px-6 bg-white border-b border-[#E4E2F0] shrink-0">
        <button type="button" onClick={onToggleSidebar}
          aria-label={sidebarOpen ? '사이드바 접기' : '사이드바 펼치기'}
          className="p-1.5 rounded-lg text-[#A8A6C0] hover:text-[#4F46E5] hover:bg-[#F4F3FC] transition-colors">
          {sidebarOpen
            ? <ChevronLeft className="w-4 h-4" strokeWidth={2} />
            : <ChevronRight className="w-4 h-4" strokeWidth={2} />}
        </button>
        <div className="flex items-center gap-2 ml-auto">
          <Tooltip label="오늘의 AI 브리핑 보기" position="bottom">
            <button type="button" onClick={onOpenBriefing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-semibold transition-colors shadow-sm shadow-[#4F46E5]/20">
              <Sparkles className="w-3.5 h-3.5" strokeWidth={1.8} /><span className="hidden sm:inline">브리핑</span>
            </button>
          </Tooltip>
          <Tooltip label="알림 센터 열기" position="bottom">
            <button type="button" onClick={onToggleNotifPanel}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border ${notifPanelOpen ? 'bg-[#EEEEFF] border-[#C7C3F7] text-[#4F46E5]' : 'bg-white border-[#E4E2F0] text-[#6B6882] hover:border-[#C7C3F7] hover:text-[#4F46E5] hover:bg-[#F4F3FC]'}`}>
              <Bell className="w-3.5 h-3.5" strokeWidth={1.8} /><span className="hidden sm:inline">알림</span>
              {notifUnread > 0 && <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-[#4F46E5] text-white">{notifUnread}</span>}
            </button>
          </Tooltip>
          <Tooltip label="비서마켓 열기" position="bottom">
            <button type="button" onClick={() => onNavigate?.('market')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border bg-white border-[#E4E2F0] text-[#6B6882] hover:border-[#C7C3F7] hover:text-[#4F46E5] hover:bg-[#F4F3FC]">
              <Store className="w-3.5 h-3.5" strokeWidth={1.8} /><span className="hidden sm:inline">비서마켓</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6" style={{ scrollbarWidth: 'none' }}>
        <div className="max-w-[920px] mx-auto space-y-6">
          {messages.map((msg, i) => {
            /* ── 사용자 메시지 ── */
            if (msg.role === 'user') {
              return (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[72%] bg-[#4F46E5] text-white rounded-2xl rounded-tr-sm px-5 py-3.5 text-[13.5px] leading-relaxed shadow-sm shadow-[#4F46E5]/20">
                    {msg.text}
                  </div>
                </div>
              );
            }

            const isDone = answerDoneSet.has(i);
            const prevUserText = messages[i - 1]?.role === 'user' ? (messages[i - 1] as { role: 'user'; text: string }).text : '';

            /* ── 분류 중 ── */
            if (msg.kind === 'classifying') {
              return <ClassifyingBubble key={i} />;
            }

            /* ── 생각하는 과정 + 스킬 탐색 ── */
            if (msg.kind === 'thinking') {
              return (
                <ThinkingProcess
                  key={i}
                  queryKind={msg.queryKind}
                  onDone={() => handleThinkingDone(i, msg.queryKind, msg.query)}
                  isDark={isDark}
                />
              );
            }

            /* ── 후속 질의 대기 ── */
            if (msg.kind === 'follow-up-prompt') {
              return (
                <div key={i} className="flex gap-3 items-start" aria-live="polite">
                  <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 shadow-sm shadow-[#4F46E5]/25 mt-0.5">
                    <img src={jpdcLogo} alt="JPDC AI" className="w-full h-full object-cover" />
                  </div>
                  <div className="relative overflow-hidden bg-gradient-to-r from-[#F5F3FF] to-[#EEF2FF] border border-[#A5B4FC] rounded-2xl rounded-tl-sm px-5 py-3.5 shadow-md shadow-[#818CF8]/20 ring-2 ring-[#818CF8]/10 motion-reduce:animate-none animate-pulse">
                    <div className="absolute -right-5 -top-5 w-16 h-16 rounded-full bg-[#C7D2FE]/30 blur-xl pointer-events-none" />
                    <div className="relative flex items-center gap-2.5">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#4F46E5] text-white shadow-sm shadow-[#4F46E5]/30">
                        <Sparkles className="w-3.5 h-3.5" strokeWidth={2.2} />
                      </span>
                      <p className="text-[14px] font-bold text-[#3730A3] tracking-[-0.01em]" style={{ fontWeight: 700 }}>궁금하신 것을 입력해주세요.</p>
                    </div>
                  </div>
                </div>
              );
            }

            /* ── 비서 선택 ── */
            if (msg.kind === 'assistant-select') {
              const userQuery = messages[i - 1]?.role === 'user'
                ? (messages[i - 1] as { text: string }).text : '';
              return (
                <AssistantSelectPanel key={i}
                  query={userQuery}
                  candidates={msg.candidates}
                  onSelect={c => handleSelectAssistant(i, c)}
                />
              );
            }

            /* ── 입고 질의 방향 선택 ── */
            if (msg.kind === 'route-select') {
              return (
                <RouteSelectionPanel
                  key={i}
                  query={msg.query}
                  onSelect={route => handleRouteSelect(i, route)}
                />
              );
            }

            /* ── 의도 불명확 — 좌(지침) + 우(비서) 분할 ── */
            if (msg.kind === 'ambiguous') {
              return (
                <AmbiguousPanel key={i}
                  query={msg.query}
                  streaming={msg.streaming}
                  onStreamDone={() => markDone(i)}
                  onSelectAssistant={c => handleSelectAssistant(i, c)}
                  actionBar={(!msg.streaming || isDone) ? (
                    <ActionBar query={msg.query} answer="복합 의도 답변" sources={[]}
                      onSave={() => onSaveItem(msg.query, '복합 의도 답변')} />
                  ) : undefined}
                />
              );
            }

            /* ── RAG 지침 + TAG 현황 + 추천 비서 ── */
            if (msg.kind === 'rag-tag-assistant') {
              return (
                <RagTagAssistantPanel
                  key={i}
                  query={msg.query}
                  streamingRag={msg.streamingRag}
                  streamingTag={msg.streamingTag}
                  onDone={() => markDone(i)}
                  onSelectAssistant={c => handleSelectAssistant(i, c)}
                   onContinue={handleContinueQuery}
                  actionBar={
                    <ActionBar
                      query={msg.query}
                      answer="RAG 지침 + TAG 입고 현황"
                      sources={getAnswerData(msg.query).sources}
                      onSave={() => onSaveItem(msg.query, 'RAG 지침 + TAG 입고 현황')}
                    />
                  }
                />
              );
            }

            /* ── RAG A/B 비교 ── */
            /* ── 비서 진입 인트로 ── */
            if (msg.kind === 'assistant-intro') {
              return (
                <AssistantIntroPanel key={i}
                  name={msg.name}
                  starters={msg.starters}
                  desc={msg.desc}
                  switchNotice={msg.switchNotice}
                  onStarterClick={text => handleSend(text, msg.name)}
                />
              );
            }

            if (msg.kind === 'rag-ab') {
              const ragDone = !msg.streamingA && !msg.streamingB;
              return (
                <RagAbPanel key={i}
                  query={msg.query}
                  streamingA={msg.streamingA}
                  streamingB={msg.streamingB}
                  selected={msg.selected}
                  onSelect={choice => setMessages(prev => {
                    const next = [...prev];
                    const cur = prev[i];
                    if (cur.role === 'assistant' && cur.kind === 'rag-ab') {
                      next[i] = { ...cur, selected: choice, streamingA: false, streamingB: false };
                    }
                    return next;
                  })}
                  actionBar={ragDone ? (
                    <ActionBar query={msg.query} answer="RAG A/B 비교 결과" sources={[]}
                      onSave={() => onSaveItem(msg.query, 'RAG A/B 비교 결과')} />
                  ) : undefined}
                />
              );
            }

            /* ── 폴백 — 지침 못찾음 + 비서 추천 ── */
            if (msg.kind === 'fallback') {
              return (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 shadow-sm shadow-[#4F46E5]/25 mt-0.5">
                    <img src={jpdcLogo} alt="JPDC AI" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-3">
                    {(msg.streaming && !isDone) ? (
                      <div className="bg-white border border-[#E4E2F0] rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                        <StreamingAnswer answer={FALLBACK_MESSAGE} onDone={() => markDone(i)} />
                      </div>
                    ) : (
                      <FallbackNoticeBlock />
                    )}
                    {(!msg.streaming || isDone) && (
                      <div className="space-y-3">
                        <AssistantSelectPanel
                          query={prevUserText}
                          candidates={getAssistantCandidates(prevUserText)}
                          onSelect={c => handleSelectAssistant(i, c)}
                          compact
                        />
                        <ActionBar query={prevUserText} answer={FALLBACK_MESSAGE} sources={[]}
                          onSave={() => onSaveItem(prevUserText, FALLBACK_MESSAGE)} />
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            /* ── RAG 지침 탐색 제안 ── */
            if (msg.kind === 'rag-prompt') {
              return (
                <RagPromptPanel key={i}
                  onConfirm={() => {
                    setMessages(prev => {
                      const next = [...prev];
                      next.splice(i + 1, 0,
                        { role: 'user', text: '네, 관련 지침을 찾아주세요.' },
                        { role: 'assistant', kind: 'instruction', streaming: true },
                      );
                      return next;
                    });
                  }}
                  onDismiss={() => {}}
                />
              );
            }

            /* ── 회의록 비서 — 입력 안내 ── */
            if (msg.kind === 'minutes-request') {
              return (
                <MinutesRequestPanel key={i}
                  streaming={msg.streaming}
                  onDone={() => markDone(i)}
                />
              );
            }

            /* ── 회의록 비서 — 결과 ── */
            if (msg.kind === 'minutes-result') {
              return (
                <MinutesResultPanel key={i}
                  streaming={msg.streaming}
                  onDone={() => markDone(i)}
                  actionBar={(!msg.streaming || isDone) ? (
                    <ActionBar query={prevUserText} answer="회의록 문장정리 결과" sources={[]}
                      onSave={() => onSaveItem(prevUserText, '회의록 문장정리 결과')} />
                  ) : undefined}
                />
              );
            }

            /* ── TAG 통계 ── */
            if (msg.kind === 'tag-stats') {
              return (
                <TagStatsPanel key={i}
                  statsData={msg.statsData}
                  streaming={msg.streaming}
                  onDone={() => markDone(i)}
                  actionBar={(!msg.streaming || isDone) ? (
                    <div className="space-y-3">
                      {msg.appendSelectOnDone && (
                        <AssistantSelectPanel
                          query={prevUserText}
                          candidates={getAssistantCandidates(prevUserText)}
                          onSelect={c => handleSelectAssistant(i, c)}
                          compact
                        />
                      )}
                      <ActionBar query={prevUserText} answer="TAG 통계 분석 결과" sources={[]}
                        onSave={() => onSaveItem(prevUserText, 'TAG 통계 분석 결과')} />
                    </div>
                  ) : undefined}
                />
              );
            }

            /* ── Dual TAG (2분할 ERP 통계) ── */
            if (msg.kind === 'dual-tag') {
              return (
                <DualTagPanel key={i}
                  data={msg.dualData}
                  streaming={msg.streaming}
                  onDone={() => markDone(i)}
                   onContinue={handleContinueQuery}
                  actionBar={(!msg.streaming || isDone) ? (
                    <div className="space-y-3">
                      {msg.appendSelectOnDone && (
                        <AssistantSelectPanel
                          query={prevUserText}
                          candidates={getAssistantCandidates(prevUserText)}
                          onSelect={c => handleSelectAssistant(i, c)}
                          compact
                        />
                      )}
                      <ActionBar query={prevUserText} answer="TAG 통계 분석 결과" sources={[]}
                        onSave={() => onSaveItem(prevUserText, 'TAG 통계 분석 결과')} />
                    </div>
                  ) : undefined}
                />
              );
            }

            /* ── 지침 답변 (instruction) ── */
            const userQuery = prevUserText;
            const { answer: msgAnswer, sources: msgSources } = getAnswerData(userQuery);

            return (
              <div key={i} className="flex gap-3 items-start">
                {/* 아바타 */}
                <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 shadow-sm shadow-[#4F46E5]/25 mt-0.5">
                  <img src={jpdcLogo} alt="JPDC AI" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  {/* 지침질의 배지 */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10.5px] font-semibold text-emerald-600">
                      <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                        <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.4"/>
                        <path d="M3.5 6l1.8 1.8L8.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      지침 질의
                    </span>
                  </div>

                  {/* 스트리밍 or 완료 */}
                  {msg.streaming ? (
                    <div className="bg-white border border-[#E4E2F0] rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                      <StreamingAnswer answer={msgAnswer} onDone={() => markDone(i)} />
                    </div>
                  ) : (
                    <div className="bg-white border border-[#E4E2F0] rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                      <div className="text-[13.5px] text-[#1A1826] space-y-0.5">{renderText(msgAnswer)}</div>
                    </div>
                  )}

                  {/* 출처 & 액션 (스트리밍 완료 후) */}
                  {(!msg.streaming || isDone) && (
                    <div className="mt-3 space-y-3">
                      <div className="border border-[#E4E2F0] rounded-xl overflow-hidden">
                        <div className="px-4 py-2 bg-[#F9F8FF] border-b border-[#E4E2F0]">
                          <p className="text-[12px] font-semibold text-[#6B6882] uppercase tracking-wide">참고 문서</p>
                        </div>
                        {msgSources.map((s, si) => (
                          <div key={si} className={`flex items-center gap-3 px-4 py-2.5 hover:bg-[#F9F8FF] cursor-pointer transition-colors ${si > 0 ? 'border-t border-[#E4E2F0]' : ''}`}>
                            <FileText className="w-3.5 h-3.5 text-[#4F46E5] shrink-0" strokeWidth={1.8} />
                            <span className="flex-1 text-[13px] text-[#1A1826] truncate">{s.title}</span>
                            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-[#4F46E5]/8 text-[#4F46E5] font-medium shrink-0">{s.type}</span>
                          </div>
                        ))}
                      </div>
                      {/* 폴백-비서 흐름: 지침 답변 바로 하위에 비서 선택 카드 인라인 표시 */}
                      {msg.appendSelectOnDone && (
                        <div className="pt-2">
                          <AssistantSelectPanel
                            query={userQuery}
                            candidates={getAssistantCandidates(userQuery)}
                            onSelect={c => handleSelectAssistant(i, c)}
                            compact
                          />
                        </div>
                      )}

                      <ActionBar query={userQuery} answer={msgAnswer} sources={msgSources}
                        onSave={() => onSaveItem(userQuery, msgAnswer)} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <InputBar
        onSend={handleSend}
        focusRequest={followUpFocusRequest}
        awaitingFollowUp={awaitingFollowUp}
        activeAssistantName={activeAssistantName}
        assistantOrder={assistantOrder}
      />
    </div>
  );
}
