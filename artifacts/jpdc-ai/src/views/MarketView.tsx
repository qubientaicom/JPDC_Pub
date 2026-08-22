import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles, Store, PenTool, Code, Globe, FileText, Search, X as XIcon,
  Mic2, BarChart2, BookOpen, Clock, TrendingUp, Star, ArrowRight, ChevronLeft,
  Zap, MessageSquare, Timer, Users, LayoutGrid, List, SlidersHorizontal,
  BookmarkCheck, Bell, Menu, Plus, FlaskConical, CheckCircle2, XCircle,
  AlertCircle, ChevronRight, Lock, Unlock, Settings2, HelpCircle, Heart, type LucideIcon,
} from 'lucide-react';
import Tooltip from '../components/Tooltip';
import type { SavedItem } from '../components/SavedPanel';
import AssistantInfoModal, { type AssistantDetail } from '../components/AssistantInfoModal';
import AssistantBuilderView, { type DraftJson } from './AssistantBuilderView';

/* ─── 공유 타입 ─── */
interface MarketSharedProps {
  savedItems: SavedItem[];
  savedPanelOpen: boolean;
  onToggleSavedPanel: () => void;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
  notifPanelOpen?: boolean;
  notifUnread?: number;
  onToggleNotifPanel?: () => void;
  onOpenBriefing?: () => void;
  onStartWithAssistant?: (ctx: { name: string; starters: string[]; desc?: string }) => void;
  favorites?: string[];
  onToggleFavorite?: (name: string) => void;
}

type MarketTab = 'my' | 'test' | 'official' | 'gallery';

/* ─── 공식 비서 데이터 ─── */
const PROMO_ASSISTANTS = [
  { name: '회의록 문장정리', desc: '회의 내용을 체계적인 문서로 자동 정리', icon: PenTool,  badge: '인기 1위', users: '12.4k' },
  { name: '법률 자문 비서',  desc: '판례 검색과 계약 조항 리스크 자동 점검', icon: BookOpen, badge: 'NEW',    users: '1.2k' },
  { name: '데이터 분석 비서', desc: '엑셀·CSV 파일을 차트와 인사이트로',      icon: BarChart2, badge: '추천', users: '8.7k' },
];
const RECENT_ASSISTANTS = [
  { name: '회의록 문장정리', icon: PenTool, when: '3분 전' },
  { name: '이메일 문체변경', icon: Mic2,    when: '오전 10:22' },
  { name: '번역 비서',       icon: Globe,   when: '어제 오후' },
  { name: '코드 리뷰 비서',  icon: Code,    when: '어제 오전' },
];
const RECOMMENDED = [
  { name: '보도자료 초안',  icon: FileText, desc: '전문 보도자료 자동 작성' },
  { name: '코드 리뷰 비서', icon: Code,     desc: '버그·스타일 자동 리뷰' },
  { name: '번역 비서',      icon: Globe,    desc: '다국어 고품질 번역' },
  { name: '문서 요약 비서', icon: BookOpen, desc: 'PDF·계약서 핵심 요약' },
];
const FREQUENT = [
  { rank: 1, name: '회의록 문장정리', icon: PenTool,  count: '이번달 24회', desc: '회의 내용을 구조화된 문서로 자동 정리' },
  { rank: 2, name: '이메일 문체변경', icon: Mic2,     count: '이번달 18회', desc: '격식·비격식 문체를 자동으로 변환' },
  { rank: 3, name: '번역 비서',       icon: Globe,    count: '이번달 11회', desc: '다국어 고품질 자연스러운 번역' },
  { rank: 4, name: '코드 최적화',     icon: Code,     count: '이번달 9회',  desc: '성능 병목 탐지와 리팩토링 자동 처리' },
  { rank: 5, name: '문서 요약 비서',  icon: FileText, count: '이번달 6회',  desc: 'PDF·보고서를 핵심만 간추려 정리' },
];
type Category = '전체' | '글쓰기' | '코드' | '번역' | '분석' | '법률·회계';
const CATEGORIES: Category[] = ['전체', '글쓰기', '코드', '번역', '분석', '법률·회계'];
type BaseAssistant = { name: string; desc: string; icon: LucideIcon; category: Exclude<Category, '전체'>; users: string; isNew?: boolean };
const ALL_ASSISTANTS: BaseAssistant[] = [
  { name: '회의록 문장정리',  desc: '회의 내용을 체계적인 문서로',   icon: PenTool,    category: '글쓰기',    users: '12.4k' },
  { name: '이메일 문체변경',  desc: '격식·비격식 문체 자동 변환',    icon: Mic2,       category: '글쓰기',    users: '9.1k' },
  { name: '보도자료 초안',    desc: '전문 보도자료 자동 작성',        icon: FileText,   category: '글쓰기',    users: '6.3k' },
  { name: '블로그 글쓰기',    desc: 'SEO 최적화된 블로그 포스트',     icon: PenTool,    category: '글쓰기',    users: '4.1k', isNew: true },
  { name: '코드 리뷰 비서',   desc: '버그·스타일 자동 리뷰',          icon: Code,       category: '코드',      users: '18.2k' },
  { name: '코드 최적화',      desc: '성능 병목 탐지와 리팩토링',       icon: Code,       category: '코드',      users: '7.4k' },
  { name: '테스트 코드 생성', desc: '유닛·통합 테스트 자동 생성',      icon: Code,       category: '코드',      users: '5.2k', isNew: true },
  { name: '번역 비서',        desc: '다국어 고품질 번역',              icon: Globe,      category: '번역',      users: '15.7k' },
  { name: '동시통역 비서',    desc: '실시간 대화 동시통역 지원',        icon: Globe,      category: '번역',      users: '3.8k', isNew: true },
  { name: '데이터 분석 비서', desc: '차트·인사이트 자동 생성',         icon: BarChart2,  category: '분석',      users: '11.9k' },
  { name: '문서 요약 비서',   desc: 'PDF·보고서·계약서 핵심 요약',     icon: BookOpen,   category: '분석',      users: '8.8k' },
  { name: '시장조사 비서',    desc: '경쟁사·트렌드 자동 분석 리포트',   icon: TrendingUp, category: '분석',      users: '4.5k', isNew: true },
  { name: '법률 자문 비서',   desc: '판례 검색과 조항 리스크 점검',     icon: BookOpen,   category: '법률·회계', users: '3.2k', isNew: true },
  { name: '계약서 검토 비서', desc: '핵심 조항 위험도 자동 판별',       icon: FileText,   category: '법률·회계', users: '5.8k' },
  { name: '회계 정산 비서',   desc: '증빙 정리와 정산서 자동화',        icon: BarChart2,  category: '법률·회계', users: '2.9k', isNew: true },
];

/* ─── 공식 비서 상세 정보 (모달용) ─── */
type ExtrasMap = Record<string, Partial<AssistantDetail>>;
const ASSISTANT_EXTRAS: ExtrasMap = {
  '회의록 문장정리': {
    fullDesc: '회의 내용을 체계적이고 보기 좋은 문서로 자동 정리합니다. 핵심 안건·결정사항·액션아이템을 자동으로 추출해 보고서 품질을 높여 드립니다.',
    status: 'official', author: 'JPDC', rating: 4.7, ratingCount: 318, likes: 284, dislikes: 12,
    ratingDistribution: { 5: 198, 4: 87, 3: 24, 2: 6, 1: 3 },
    dialogueCount: 12400, messageCount: 41800,
    starters: ['오늘 계약 검토 회의 내용을 정리해 줘', '안건 3개로 구성된 회의록 초안을 작성해 줘', '액션아이템만 따로 추출해 줄 수 있어?'],
    comments: [
      { text: '실제 업무에서 정말 유용하게 쓰고 있습니다. 회의록 작성 시간이 절반으로 줄었어요.', ts: '2026-07-20T09:12:00.000Z' },
      { text: '처음엔 반신반의했는데 결과물이 깔끔해서 놀랐습니다.', ts: '2026-07-15T14:30:00.000Z' },
    ],
    othersByAuthor: [
      { name: '이메일 문체변경', desc: '격식·비격식 문체 자동 변환', icon: Mic2 },
      { name: '보도자료 초안',   desc: '전문 보도자료 자동 작성',    icon: FileText },
      { name: '코드 리뷰 비서', desc: '버그·스타일 자동 리뷰',       icon: Code },
      { name: '번역 비서',      desc: '다국어 고품질 번역',          icon: Globe },
    ],
  },
  '코드 리뷰 비서': {
    fullDesc: '코드베이스의 버그·성능·보안 취약점을 자동으로 탐지하고, 스타일 가이드에 맞는 리팩토링 제안을 함께 제공합니다.',
    status: 'official', author: 'JPDC', rating: 4.8, ratingCount: 522,
    ratingDistribution: { 5: 360, 4: 115, 3: 33, 2: 10, 1: 4 },
    dialogueCount: 18200, messageCount: 72000,
    starters: ['이 Python 함수의 버그를 찾아줘', 'React 컴포넌트 성능 개선 방법을 알려줘', 'SQL 쿼리 최적화가 필요해'],
    comments: [
      { text: '코드 품질이 확실히 올라갔습니다. PR 리뷰 시간도 단축됐어요.', ts: '2026-07-22T11:00:00.000Z' },
    ],
    othersByAuthor: [
      { name: '코드 최적화',      desc: '성능 병목 탐지와 리팩토링',    icon: Code },
      { name: '테스트 코드 생성', desc: '유닛·통합 테스트 자동 생성',   icon: Code },
      { name: '회의록 문장정리', desc: '회의 내용을 체계적인 문서로',   icon: PenTool },
      { name: '데이터 분석 비서', desc: '차트·인사이트 자동 생성',      icon: BarChart2 },
    ],
  },
  '번역 비서': {
    fullDesc: '20개 이상 언어 간 고품질 번역을 제공합니다. 단순 직역이 아닌 문맥과 어조를 살린 자연스러운 번역 결과를 드립니다.',
    status: 'official', author: 'JPDC', rating: 4.6, ratingCount: 409,
    ratingDistribution: { 5: 240, 4: 118, 3: 38, 2: 9, 1: 4 },
    dialogueCount: 15700, messageCount: 49000,
    starters: ['이 영어 이메일을 자연스러운 한국어로 번역해 줘', '계약서 일부를 영어로 번역해 줘', '일본어 공문서를 번역해 줘'],
    othersByAuthor: [
      { name: '동시통역 비서',   desc: '실시간 대화 동시통역 지원',  icon: Globe },
      { name: '보도자료 초안',   desc: '전문 보도자료 자동 작성',    icon: FileText },
      { name: '이메일 문체변경', desc: '격식·비격식 문체 자동 변환', icon: Mic2 },
    ],
  },
  '데이터 분석 비서': {
    fullDesc: '엑셀·CSV 데이터를 분석해 차트와 인사이트를 자동 생성합니다. 복잡한 데이터도 핵심 메시지를 빠르게 도출해 드립니다.',
    status: 'official', author: 'JPDC', rating: 4.5, ratingCount: 187,
    ratingDistribution: { 5: 98, 4: 57, 3: 24, 2: 5, 1: 3 },
    dialogueCount: 11900, messageCount: 35000,
    starters: ['매출 데이터를 분석하고 트렌드를 알려줘', 'CSV 파일을 업로드할게, 요약해 줘', '지난달 KPI 대시보드를 만들어 줘'],
    othersByAuthor: [
      { name: '문서 요약 비서', desc: 'PDF·보고서·계약서 핵심 요약', icon: BookOpen },
      { name: '시장조사 비서',  desc: '경쟁사·트렌드 자동 분석 리포트', icon: TrendingUp },
      { name: '회계 정산 비서', desc: '증빙 정리와 정산서 자동화',     icon: BarChart2 },
    ],
  },
};

/** ALL_ASSISTANTS 항목 + EXTRAS를 합쳐 AssistantDetail 반환 */
function toDetail(a: BaseAssistant): AssistantDetail {
  const extra = ASSISTANT_EXTRAS[a.name] ?? {};
  return {
    ...a,
    status: 'official',
    author: 'JPDC',
    ...extra,
  };
}

/* ─── 내가 만든 비서 데이터 ─── */
type ScopeBadge = '비공개' | '지정자' | '부서' | '본부' | '전사';
type AssistantStatusBadge = '임시저장' | '공식' | '승인완료' | '버전 갱신중' | '승인 대기' | '승인불가';

interface MyAssistantComment { author: string; text: string; ts: string; }
interface MyAssistantStats {
  dialogueCount: number; messageCount: number; category?: string;
  rating?: number; ratingCount?: number;
  likes?: number; dislikes?: number;
  comments: MyAssistantComment[];
}
interface MyAssistant {
  name: string; desc: string; icon: LucideIcon; author: string;
  version?: string; statusBadge?: AssistantStatusBadge; scope: ScopeBadge;
  commentCount?: number; createdAt: string; updatedAt: string; isDraft?: boolean;
  stats?: MyAssistantStats;
  _isNew?: boolean;
}
const MY_ASSISTANTS: MyAssistant[] = [
  {
    name: '계약 검토 도우미', desc: '계약서 핵심 조항을 빠르게 정리해주는 비서',
    icon: FileText, author: '나', version: 'v2', statusBadge: '공식', scope: '전사',
    commentCount: 3, createdAt: '2026-07-01', updatedAt: '2026-07-20',
    stats: {
      dialogueCount: 24, messageCount: 138, category: '법률·계약', rating: 4.2, ratingCount: 3, likes: 18, dislikes: 2,
      comments: [
        { author: '김민준', text: '실제 계약서에 바로 써봤는데 핵심 조항 정리가 정말 빠르네요!', ts: '2026-07-18T09:30:00Z' },
        { author: '이수연', text: '리스크 항목도 같이 짚어줘서 좋았습니다.', ts: '2026-07-15T14:20:00Z' },
        { author: '박지훈', text: '조금 더 세밀한 분석이 됐으면 하는데 전반적으로 만족합니다.', ts: '2026-07-10T11:05:00Z' },
      ],
    },
  },
  {
    name: '민원 답변 초안', desc: '민원 유형별 공식 답변 초안 자동 생성',
    icon: MessageSquare, author: '나', version: 'v1', statusBadge: '승인 대기', scope: '부서',
    createdAt: '2026-07-10', updatedAt: '2026-07-22',
    stats: {
      dialogueCount: 8, messageCount: 41, category: '행정',
      comments: [],
    },
  },
  {
    name: '예산 검토 비서', desc: '예산 항목과 집행 기준 자동 비교 분석',
    icon: BarChart2, author: '나', version: 'v1', scope: '비공개',
    createdAt: '2026-06-15', updatedAt: '2026-07-15',
    stats: {
      dialogueCount: 5, messageCount: 22, category: '재무·예산',
      comments: [],
    },
  },
  {
    name: '내부 보고서 요약', desc: '기안문·보고서 핵심 요약 및 키워드 추출',
    icon: BookOpen, author: '나', isDraft: true, statusBadge: '임시저장', scope: '비공개',
    createdAt: '2026-07-24', updatedAt: '2026-07-24',
    stats: { dialogueCount: 0, messageCount: 0, comments: [] },
  },
];

/* ─── 공개전 테스트 요청 비서 데이터 (다른 사람이 요청) ─── */
interface TestAssistant {
  name: string; desc: string; icon: LucideIcon; author: string;
  version?: string; scope: ScopeBadge; commentCount?: number; createdAt: string; updatedAt: string;
}
const TEST_ASSISTANTS: TestAssistant[] = [
  { name: '스마트 일정 관리',     desc: '업무 일정과 회의를 자동으로 분석·조율해주는 비서', icon: Timer,      author: '박민준', version: 'v1', scope: '전사', commentCount: 5, createdAt: '2026-07-20', updatedAt: '2026-07-23' },
  { name: '리서치 보고서 생성기', desc: '주제를 입력하면 자동으로 리서치 보고서를 작성',    icon: TrendingUp, author: '이수연', version: 'v1', scope: '본부', commentCount: 2, createdAt: '2026-07-18', updatedAt: '2026-07-21' },
];

/* ─── 배지·범위 스타일 맵 ─── */
const STATUS_BADGE_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  '임시저장':    { color: '#D4930A', bg: '#FFFBEB', border: '#FDE68A' },
  '공식':        { color: '#4F46E5', bg: '#EEF0FF', border: '#C7C3F7' },
  '승인완료':    { color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
  '버전 갱신중': { color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD' },
  '승인 대기':   { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  '승인불가':    { color: '#DC2626', bg: '#FFF5F5', border: '#FECACA' },
  '공개전 테스트': { color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
};
const SCOPE_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  '비공개': { color: '#6B6882', bg: '#F4F3FC', border: '#E4E2F0' },
  '지정자': { color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD' },
  '부서':   { color: '#0F766E', bg: '#F0FDFA', border: '#99F6E4' },
  '본부':   { color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  '전사':   { color: '#4F46E5', bg: '#EEF0FF', border: '#C7C3F7' },
};

/* ─── 통계 모달 ─── */
function AssistantStatsModal({ assistant, onClose }: {
  assistant: MyAssistant;
  onClose: () => void;
}) {
  const [showComments, setShowComments] = useState(true);
  const stats = assistant.stats;

  const fmt = (ts: string) => {
    const d = new Date(ts);
    return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      <div className="relative z-10 w-full max-w-[520px] bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}>

        {/* 헤더 */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[18px] font-bold text-[#1A1826] leading-snug">{assistant.name}</p>
              <p className="text-[13px] text-[#6B6882] mt-1 leading-relaxed">{assistant.desc}</p>
            </div>
            <button type="button" onClick={onClose}
              className="shrink-0 p-1.5 rounded-lg text-[#A8A6C0] hover:text-[#1A1826] hover:bg-[#F4F3FC] transition-colors">
              <XIcon className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-[#E4E2F0]" />

        {/* 통계 행 */}
        <div className="px-6 py-5 grid grid-cols-6 divide-x divide-[#E4E2F0]">
          {[
            {
              top: stats?.rating != null
                ? <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" strokeWidth={0} />{stats.rating.toFixed(1)}</span>
                : <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-[#D1D0E0] text-[#D1D0E0]" strokeWidth={0} />-</span>,
              label: `평가 (${stats?.ratingCount ?? 0})`,
            },
            {
              top: <span className="flex items-center gap-0.5 text-[#4F46E5]">👍 {stats?.likes ?? 0}</span>,
              label: '좋아요',
            },
            {
              top: <span className="flex items-center gap-0.5 text-[#DC2626]">👎 {stats?.dislikes ?? 0}</span>,
              label: '싫어요',
            },
            { top: stats?.dialogueCount ?? 0, label: '대화수' },
            { top: stats?.messageCount ?? 0, label: '메시지수' },
            { top: stats?.comments.length ?? 0, label: '코멘트수' },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1 px-2">
              <span className="text-[16px] font-bold text-[#1A1826] leading-none">{s.top}</span>
              <span className="text-[12px] text-[#A8A6C0]">{s.label}</span>
            </div>
          ))}
        </div>

        {/* 구분선 */}
        <div className="border-t border-[#E4E2F0]" />

        {/* 코멘트 영역 */}
        {showComments && (
          <div className="px-6 py-5 max-h-[280px] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <p className="text-[15px] font-bold text-[#1A1826] mb-4">코멘트</p>
            {!stats || stats.comments.length === 0 ? (
              <p className="text-[14px] text-[#A8A6C0]">아직 코멘트가 없습니다.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {stats.comments.map((c, i) => (
                  <div key={i} className="border border-[#E4E2F0] rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[13px] font-semibold text-[#1A1826]">{c.author}</span>
                      <span className="text-[12px] text-[#A8A6C0]">{fmt(c.ts)}</span>
                    </div>
                    <p className="text-[13px] text-[#6B6882] leading-relaxed">{c.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="px-6 py-4 border-t border-[#E4E2F0] flex justify-end gap-2">
          <button type="button" onClick={() => setShowComments(v => !v)}
            className="px-4 py-2 rounded-xl border border-[#E4E2F0] text-[13px] font-semibold text-[#6B6882] hover:border-[#C7C3F7] hover:text-[#4F46E5] transition-colors">
            {showComments ? '코멘트 숨기기' : '코멘트 보기'}
          </button>
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#E4E2F0] text-[13px] font-semibold text-[#6B6882] hover:border-[#C7C3F7] hover:text-[#4F46E5] transition-colors">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── 공통 비서 리스트 카드 ─── */
function AssistantListCard({
  name, desc, icon: Icon, author, version, statusBadge, scope,
  commentCount, createdAt, updatedAt, isDraft, isTestCard, onStats, onEdit, onClone, onContinue, isHighlighted,
}: {
  name: string; desc: string; icon: LucideIcon; author: string;
  version?: string; statusBadge?: string; scope: string;
  commentCount?: number; createdAt: string; updatedAt: string;
  isDraft?: boolean; isTestCard?: boolean; onStats?: () => void; onEdit?: () => void; onClone?: () => void; onContinue?: () => void; isHighlighted?: boolean;
}) {
  const [lit, setLit] = useState(!!isHighlighted);
  useEffect(() => {
    if (!lit) return;
    const t = setTimeout(() => setLit(false), 2800);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const badgeStyle  = statusBadge ? STATUS_BADGE_STYLE[statusBadge] : null;
  const scopeStyle  = SCOPE_STYLE[scope] ?? SCOPE_STYLE['비공개'];
  const testStyle   = STATUS_BADGE_STYLE['공개전 테스트'];
  const canRegister = !isDraft && !isTestCard && !['공식', '승인완료', '승인 대기', '버전 갱신중'].includes(statusBadge ?? '');
  const canCopyUrl  = !['비공개'].includes(scope);

  return (
    <div
      className={`relative flex flex-col rounded-xl border overflow-hidden assistant-list-card-bg assistant-list-card-border`}
      style={{
        ...(lit && { borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.05)' }),
        transition: 'border-color 1.2s ease-out, background-color 1.2s ease-out',
      }}
    >
      {/* 복제 하이라이트 상단 스트라이프 */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, #F59E0B 0%, #FCD34D 50%, #F59E0B 100%)',
          opacity: lit ? 1 : 0,
          transition: 'opacity 1.2s ease-out',
        }}
      />
      {/* 본문 */}
      <div className="px-5 pt-5 pb-4">
        {/* 헤더 */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#F4F3FC] flex items-center justify-center shrink-0">
            <Icon className="text-[#4F46E5]" strokeWidth={1.8} style={{ width: '18px', height: '18px' }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold text-[#1A1826] leading-snug">{name}</p>
            <p className="text-[12px] text-[#A8A6C0] mt-0.5">by {author}</p>
          </div>
        </div>

        {/* 설명 */}
        <p className="text-[11.5px] text-[#6B6882] leading-relaxed mb-3 break-keep">
          {desc || '(설명 없음)'}
        </p>

        {/* 배지 행 + 코멘트 칩 */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {version && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#F4F3FC] text-[#6B6882] border border-[#E4E2F0]">
                {version}
              </span>
            )}
            {badgeStyle && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border"
                style={{ color: badgeStyle.color, backgroundColor: badgeStyle.bg, borderColor: badgeStyle.border }}>
                {statusBadge}
              </span>
            )}
            {isTestCard && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border"
                style={{ color: testStyle.color, backgroundColor: testStyle.bg, borderColor: testStyle.border }}>
                공개전 테스트
              </span>
            )}
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border"
              style={{ color: scopeStyle.color, backgroundColor: scopeStyle.bg, borderColor: scopeStyle.border }}>
              {scope}
            </span>
          </div>
          {!isTestCard && commentCount != null && commentCount > 0 && (
            <span className="text-[12px] text-[#6B6882] font-medium shrink-0">💬 {commentCount}</span>
          )}
        </div>

        {/* 날짜 */}
        <p className="text-[10.5px] text-[#A8A6C0]">생성 {createdAt} · 업데이트 {updatedAt}</p>
      </div>

      {/* 액션 버튼 행 */}
      <div className="px-5 py-3 border-t border-[#F4F3FC] bg-[#FAFAFF] flex items-center gap-1.5 flex-wrap">
        {isDraft ? (
          <button type="button" onClick={onContinue}
            className="flex-1 px-3 py-1.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[12px] font-semibold transition-colors">
            이어서 작성
          </button>
        ) : isTestCard ? (
          <button type="button"
            className="flex-1 px-3 py-1.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[12px] font-semibold transition-colors">
            채팅 시작
          </button>
        ) : (
          <>
            <button type="button" onClick={onEdit}
              className="px-3 py-1.5 rounded-lg border border-[#E4E2F0] text-[#6B6882] hover:border-[#4F46E5]/30 hover:text-[#4F46E5] text-[12px] font-semibold transition-colors">
              수정
            </button>
            <button type="button" onClick={onClone}
              className="px-3 py-1.5 rounded-lg border border-[#E4E2F0] text-[#6B6882] hover:border-[#4F46E5]/30 hover:text-[#4F46E5] text-[12px] font-semibold transition-colors">
              복제
            </button>
            <button type="button" onClick={onStats}
              className="px-3 py-1.5 rounded-lg border border-[#E4E2F0] text-[#6B6882] hover:border-[#4F46E5]/30 hover:text-[#4F46E5] text-[12px] font-semibold transition-colors">
              통계
            </button>
            {canCopyUrl && (
              <button type="button"
                className="px-3 py-1.5 rounded-lg border border-[#E4E2F0] text-[#6B6882] hover:border-[#4F46E5]/30 hover:text-[#4F46E5] text-[12px] font-semibold transition-colors">
                URL 복사
              </button>
            )}
            {canRegister && (
              <button type="button"
                className="ml-auto px-3 py-1.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[12px] font-semibold transition-colors">
                승인요청
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── 공통 서브컴포넌트 ─── */
function AssistantCard({ name, desc, icon: Icon, badge, users, onClick, isFavorite, onToggleFavorite }: {
  name: string; desc: string; icon: LucideIcon; badge?: string; users?: string;
  onClick?: () => void; isFavorite?: boolean; onToggleFavorite?: (name: string) => void;
}) {
  return (
    <div
      role="button" tabIndex={0} onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      className="group/ac relative flex flex-col items-start gap-2 p-3.5 bg-white rounded-xl border border-[#E4E2F0]
                 hover:border-[#4F46E5]/30 hover:shadow-md hover:shadow-[#4F46E5]/8 hover:-translate-y-0.5
                 transition-all duration-200 text-left overflow-hidden w-full cursor-pointer">
      {/* 뱃지 */}
      {badge && (
        <span className={`absolute top-2.5 ${onToggleFavorite ? 'right-8' : 'right-2.5'} text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
          badge === 'NEW' ? 'bg-[#D4930A]/10 text-[#D4930A]' : 'bg-[#4F46E5]/10 text-[#4F46E5]'
        }`}>{badge}</span>
      )}
      {/* 하트 버튼 */}
      {onToggleFavorite && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(name); }}
          className={`absolute top-2 right-2 p-1 rounded-lg transition-all duration-150 ${
            isFavorite
              ? 'text-[#EF4444] bg-[#FFF0F0] hover:bg-[#FFE0E0]'
              : 'text-[#D1D0E0] hover:text-[#EF4444] hover:bg-[#FFF0F0] opacity-0 group-hover/ac:opacity-100'
          }`}
          aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
        >
          <Heart className="w-3.5 h-3.5" strokeWidth={isFavorite ? 0 : 1.8} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      )}
      <div className="w-9 h-9 rounded-xl bg-[#F4F3FC] group-hover/ac:bg-[#EEF0FF] flex items-center justify-center transition-colors duration-200 shrink-0">
        <Icon className="w-4.5 h-4.5 text-[#A8A6C0] group-hover/ac:text-[#4F46E5] transition-colors duration-200" strokeWidth={1.8} style={{ width: '18px', height: '18px' }} />
      </div>
      <div className="min-w-0 w-full">
        <p className="text-sm font-semibold text-[#1A1826] leading-snug truncate pr-5">{name}</p>
        {users && <p className="text-[11px] text-[#A8A6C0] mt-0.5">{users}명 이용</p>}
        <p className="text-[10.5px] text-[#A8A6C0] leading-snug mt-1 break-keep line-clamp-2">{desc}</p>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, desc, action, onAction, helpContent }: {
  icon: LucideIcon; title: string; desc?: string; action?: string; onAction?: () => void;
  helpContent?: React.ReactNode;
}) {
  const [helpOpen, setHelpOpen] = useState(false);
  const helpRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!helpOpen) return;
    const handler = (e: MouseEvent) => {
      if (helpRef.current && !helpRef.current.contains(e.target as Node)) setHelpOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [helpOpen]);

  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Icon className="w-4 h-4 text-[#4F46E5]" strokeWidth={1.8} />
        <h2 className="text-[14px] font-bold text-[#1A1826]">{title}</h2>
        {desc && <span className="text-[12px] text-[#A8A6C0] font-normal">{desc}</span>}
        {helpContent && (
          <div className="relative" ref={helpRef}>
            <button
              type="button"
              onClick={() => setHelpOpen(v => !v)}
              className="flex items-center justify-center w-5 h-5 rounded-full bg-[#F0EEFF] text-[#7C6FF7] hover:bg-[#E5E2FD] hover:text-[#4F46E5] transition-colors"
              aria-label="도움말"
            >
              <HelpCircle className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
            {helpOpen && (
              <div className="absolute left-0 top-full mt-2 z-50 w-max min-w-[340px] max-w-[480px] bg-white rounded-xl border border-[#E4E2F0] shadow-xl shadow-black/8 p-4 text-left">
                {/* 말풍선 꼭지 */}
                <div className="absolute -top-1.5 left-3 w-3 h-3 bg-white border-t border-l border-[#E4E2F0] rotate-45" />
                {helpContent}
              </div>
            )}
          </div>
        )}
      </div>
      {action && (
        <button type="button" onClick={onAction}
          className="flex items-center gap-1 text-[12px] text-[#A8A6C0] hover:text-[#4F46E5] transition-colors font-medium">
          {action} <ArrowRight className="w-3 h-3" strokeWidth={1.8} />
        </button>
      )}
    </div>
  );
}

/* ─── 도움말 콘텐츠 ─── */
const FREQUENT_HELP = (
  <div className="space-y-3">
    <p className="text-[13px] font-bold text-[#1A1826]">자주 사용하는 비서</p>
    <div className="space-y-2.5">
      {[
        {
          tag: 'T-1', label: '정상',
          lines: [
            '최근 한 달간 전 직원이 가장 많이 사용한 비서입니다.',
            '부서와 관계없이 모든 직원에게 같은 목록이 표시됩니다.',
            '매일 새벽 한 번 갱신됩니다.',
          ],
        },
        {
          tag: 'T-2', label: '플랫폼 Cold',
          lines: [
            '아직 이용 기록이 충분하지 않아, 최근 등록된 비서를 보여드립니다.',
            '이용 기록이 쌓이면 많이 사용한 순으로 바뀝니다.',
          ],
        },
      ].map(({ tag, label, lines }) => (
        <div key={tag} className="rounded-xl border border-[#E4E2F0] overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#F7F6FD] border-b border-[#E4E2F0]">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#EEF0FF] text-[#4F46E5] border border-[#C7C3F7]">{tag}</span>
            <span className="text-[11.5px] font-semibold text-[#1A1826]">{label}</span>
          </div>
          <ul className="px-3 py-2.5 space-y-1">
            {lines.map((l, i) => (
              <li key={i} className="flex gap-1.5 text-[11.5px] text-[#4B4A63]">
                <span className="text-[#C7C3F7] shrink-0 mt-px">•</span>{l}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

const RECENT_HELP = (
  <div className="space-y-3">
    <p className="text-[13px] font-bold text-[#1A1826]">최근 사용한 비서</p>
    <ul className="space-y-1">
      {[
        '내가 최근에 사용한 비서를 사용한 순서대로 표시합니다.',
        '최근 30일 이내 사용한 비서 중 최대 4개까지 보여드립니다.',
        '대화를 시작하면 바로 반영됩니다.',
      ].map((l, i) => (
        <li key={i} className="flex gap-1.5 text-[11.5px] text-[#4B4A63]">
          <span className="text-[#C7C3F7] shrink-0 mt-px">•</span>{l}
        </li>
      ))}
    </ul>
  </div>
);

const RECOMMENDED_HELP = (
  <div className="space-y-3">
    <p className="text-[13px] font-bold text-[#1A1826]">추천 비서</p>
    <div className="space-y-2.5">
      {[
        {
          tag: 'T-1', label: '정상',
          lines: [
            '우리 부서에서 많이 쓰는 비서를 우선 보여드립니다.',
            '최근 나눈 대화와 내용이 가까운 비서, 새로 등록된 비서일수록 위에 표시됩니다.',
            '이미 \'자주 사용하는 비서\'에 있는 비서는 제외됩니다.',
          ],
        },
        {
          tag: 'T-2', label: '사용자 Cold  (신규 입사자·첫 사용자)',
          lines: [
            '아직 대화 기록이 적어, 우리 부서에서 많이 쓰는 비서 위주로 보여드립니다.',
            '새로 등록된 비서도 함께 표시됩니다.',
            '대화를 나눌수록 추천이 점점 맞춰집니다.',
          ],
        },
        {
          tag: 'T-3', label: '부서 Cold',
          lines: [
            '우리 부서의 이용 기록이 아직 적어, 전사에서 많이 쓰는 비서를 기준으로 보여드립니다.',
            '최근 나눈 대화와 내용이 가까운 비서, 새로 등록된 비서일수록 위에 표시됩니다.',
          ],
        },
        {
          tag: 'T-4', label: '플랫폼 Cold  (오픈 초기)',
          lines: [
            '아직 이용 기록이 충분하지 않아, 관리자가 선정한 비서를 보여드립니다.',
            '이용 기록이 쌓이면 자동으로 맞춤 추천으로 바뀝니다.',
          ],
        },
      ].map(({ tag, label, lines }) => (
        <div key={tag} className="rounded-xl border border-[#E4E2F0] overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#F7F6FD] border-b border-[#E4E2F0]">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#EEF0FF] text-[#4F46E5] border border-[#C7C3F7]">{tag}</span>
            <span className="text-[11.5px] font-semibold text-[#1A1826]">{label}</span>
          </div>
          <ul className="px-3 py-2.5 space-y-1">
            {lines.map((l, i) => (
              <li key={i} className="flex gap-1.5 text-[11.5px] text-[#4B4A63]">
                <span className="text-[#C7C3F7] shrink-0 mt-px">•</span>{l}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

/* ─── 탭 1: 내가 만든 모든 비서 ─── */
function MyAssistantsTab({ onEdit, list, setList, onOpenBuilder }: {
  onEdit: (a: MyAssistant) => void;
  list: MyAssistant[];
  setList: React.Dispatch<React.SetStateAction<MyAssistant[]>>;
  onOpenBuilder: () => void;
}) {
  const [statsTarget, setStatsTarget] = useState<MyAssistant | null>(null);

  const handleClone = (index: number) => {
    const source = list[index];
    const today = new Date().toISOString().slice(0, 10);
    const clone: MyAssistant = {
      ...source,
      name: `${source.name} [복제]`,
      statusBadge: '임시저장',
      scope: '비공개',
      isDraft: true,
      version: undefined,
      commentCount: undefined,
      createdAt: today,
      updatedAt: today,
      stats: { dialogueCount: 0, messageCount: 0, comments: [] },
      _isNew: true,
    };
    setList(prev => {
      const next = [...prev];
      next.splice(index, 0, clone);
      return next;
    });
    setTimeout(() => {
      setList(prev => prev.map((a, i) => i === index ? { ...a, _isNew: false } : a));
    }, 3000);
  };

  const topAssistant = list.reduce<MyAssistant | null>(
    (best, a) => ((a.stats?.dialogueCount ?? 0) > (best?.stats?.dialogueCount ?? 0) ? a : best), null
  );
  const totalDialogues = list.reduce((sum, a) => sum + (a.stats?.dialogueCount ?? 0), 0);
  const totalUsers     = list.reduce((sum, a) => sum + (a.stats?.messageCount  ?? 0), 0);

  return (
    <>
      {/* 검색·생성 툴바 */}
      <div className="px-6 md:px-8 pt-5 pb-0 shrink-0">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#E4E2F0] bg-[#FAFAFF] hover:border-[#4F46E5]/30 transition-colors">
            <Search className="w-3.5 h-3.5 text-[#A8A6C0] shrink-0" strokeWidth={1.8} />
            <input type="text" placeholder="비서 검색…"
              className="flex-1 text-[13px] text-[#1A1826] placeholder:text-[#A8A6C0] bg-transparent outline-none" />
          </div>
          <button type="button" onClick={onOpenBuilder}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-semibold
                       transition-colors shadow-sm shadow-[#4F46E5]/20 whitespace-nowrap shrink-0">
            <Plus className="w-3.5 h-3.5" strokeWidth={2} />
            <span className="hidden sm:inline">나만의 비서 만들기</span>
            <span className="sm:hidden">만들기</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-5" style={{ scrollbarWidth: 'none' }}>
        {/* 어제의 내 비서 이용 통계 */}
        {list.length > 0 && (
          <section className="mb-6">
            <SectionHeader icon={BarChart2} title="어제의 비서 이용 통계" />
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Star,          label: '최다 사용 비서', value: topAssistant?.name ?? '—',       sub: topAssistant ? `${topAssistant.stats?.dialogueCount ?? 0}회 사용` : '데이터 없음', accent: true  },
                { icon: Users,         label: '이용 인원',     value: `${totalUsers}명`,                sub: '전날 대비',   accent: false },
                { icon: MessageSquare, label: '대화 건수',     value: `${totalDialogues.toLocaleString()}건`, sub: '전날 대비', accent: false },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col gap-3 p-5 rounded-xl border border-[#E4E2F0] bg-[#F9F8FF]">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${stat.accent ? 'bg-[#FEF3C7]' : 'bg-[#EEF0FF]'}`}>
                      <stat.icon className={stat.accent ? 'text-[#D4930A]' : 'text-[#4F46E5]'} strokeWidth={1.8} style={{ width: '18px', height: '18px' }} />
                    </div>
                    <p className="text-[13px] font-semibold text-[#6B6882] leading-tight">{stat.label}</p>
                  </div>
                  <div>
                    <p className="text-[24px] font-bold text-[#1A1826] leading-none tracking-tight break-keep">{stat.value}</p>
                    <p className="text-[12px] text-[#A8A6C0] mt-2">{stat.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F4F3FC] flex items-center justify-center">
              <Plus className="w-7 h-7 text-[#A8A6C0]" strokeWidth={1.4} />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-[#6B6882]">아직 만든 비서가 없습니다.</p>
              <p className="text-sm text-[#A8A6C0] mt-1">위의 + 나만의 비서 만들기로 시작해 보세요.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {list.map((a, i) => (
              <AssistantListCard key={`${a.name}-${i}`} {...a}
                isHighlighted={!!a._isNew}
                onStats={() => setStatsTarget(a)}
                onEdit={() => onEdit(a)}
                onClone={() => handleClone(i)}
                onContinue={() => onEdit(a)} />
            ))}
          </div>
        )}
      </div>

      {statsTarget && (
        <AssistantStatsModal
          assistant={statsTarget}
          onClose={() => setStatsTarget(null)}
        />
      )}
    </>
  );
}

/* ─── 탭 2: 공개전 테스트 요청 비서 ─── */
function TestRequestTab() {
  return (
    <div className="flex-1 overflow-y-auto px-6 md:px-8 pt-5 pb-5" style={{ scrollbarWidth: 'none' }}>
      {/* 안내 배너 */}
      <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl border border-[#DDD6FE] bg-[#F5F3FF] mb-5">
        <FlaskConical className="w-4 h-4 text-[#7C3AED] shrink-0 mt-0.5" strokeWidth={1.8} />
        <div>
          <p className="text-[13px] font-semibold text-[#7C3AED] leading-snug">다른 사람이 공개 전 테스트를 요청한 비서입니다.</p>
          <p className="text-[11.5px] text-[#7C3AED]/80 mt-0.5 leading-snug">함께 사용해 보고 평가·코멘트를 남겨 주세요.</p>
        </div>
      </div>

      {TEST_ASSISTANTS.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#F4F3FC] flex items-center justify-center">
            <FlaskConical className="w-7 h-7 text-[#A8A6C0]" strokeWidth={1.4} />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-[#6B6882]">아직 공개전 테스트를 요청한 비서가 없습니다.</p>
            <p className="text-sm text-[#A8A6C0] mt-1.5 max-w-[300px] leading-relaxed break-keep">
              다른 사람이 공개 전 테스트를 요청하면 이 탭에서 함께 테스트·평가할 수 있습니다.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TEST_ASSISTANTS.map((a) => (
            <AssistantListCard key={a.name} {...a} isTestCard />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── 탭 3 – 공식 비서 (메인 마켓) ─── */
function OfficialTab({ onOpenGallery, onAssistantClick, favorites = [], onToggleFavorite }: {
  onOpenGallery: () => void; onAssistantClick: (a: AssistantDetail) => void;
  favorites?: string[]; onToggleFavorite?: (name: string) => void;
}) {
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<typeof ALL_ASSISTANTS | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const runSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) { setSearchResults(null); return; }
    const lower = trimmed.toLowerCase();
    setSearchResults(
      ALL_ASSISTANTS.filter((a) =>
        a.name.toLowerCase().includes(lower) || a.desc.toLowerCase().includes(lower) || a.category.toLowerCase().includes(lower)
      )
    );
  };
  const clearSearch = () => { setSearchInput(''); setSearchResults(null); inputRef.current?.focus(); };

  return (
    <>
      {/* 검색창 + 결과 */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>

      {/* 검색 입력 영역 */}
      <div className="px-6 md:px-8 pt-5 pb-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#E4E2F0] bg-[#FAFAFF] hover:border-[#4F46E5]/30 transition-colors focus-within:border-[#4F46E5]/50">
            <Search className="w-3.5 h-3.5 text-[#A8A6C0] shrink-0" strokeWidth={1.8} />
            <input ref={inputRef} type="text" value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runSearch(searchInput)}
              placeholder="비서 이름, 기능, 카테고리로 검색…"
              className="flex-1 text-[13px] text-[#1A1826] placeholder:text-[#A8A6C0] bg-transparent outline-none" />
            {searchInput && (
              <button type="button" onClick={clearSearch}
                className="p-0.5 rounded-full text-[#A8A6C0] hover:text-[#6B6882] transition-colors">
                <XIcon className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            )}
          </div>
          <button type="button" onClick={() => runSearch(searchInput)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-semibold
                       transition-colors shadow-sm shadow-[#4F46E5]/20 whitespace-nowrap shrink-0">
            <Search className="w-3.5 h-3.5" strokeWidth={2} />
            검색
          </button>
          {searchResults !== null && (
            <button type="button" onClick={clearSearch}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E4E2F0] bg-white text-[#6B6882]
                         hover:border-[#C7C3F7] hover:text-[#4F46E5] hover:bg-[#F4F3FC] text-[13px] font-semibold transition-all whitespace-nowrap shrink-0">
              <XIcon className="w-3.5 h-3.5" strokeWidth={2} />
              초기화
            </button>
          )}
        </div>
      </div>

      {/* 검색 결과 */}
      {searchResults !== null && (
        <div className="px-6 md:px-8 pb-6">
          <p className="text-[14px] font-bold text-[#1A1826] mb-4">
            검색 결과 <span className="text-[#4F46E5] ml-2">{searchResults.length}개</span>
          </p>
          {searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#A8A6C0]">
              <Search className="w-10 h-10" strokeWidth={1.2} />
              <p className="text-base font-semibold">검색 결과가 없습니다</p>
              <p className="text-sm">다른 키워드로 검색해보세요</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {searchResults.map((a) => (
                <AssistantCard key={a.name} name={a.name} desc={a.desc} icon={a.icon}
                  badge={a.isNew ? 'NEW' : undefined} users={a.users}
                  onClick={() => onAssistantClick(toDetail(a))}
                  isFavorite={favorites.includes(a.name)} onToggleFavorite={onToggleFavorite} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 일반 콘텐츠 */}
      {searchResults === null && (
        <div className="flex-1 overflow-y-auto px-6 md:px-8 pt-2 pb-6 space-y-7" style={{ scrollbarWidth: 'none' }}>

          {/* 어제의 비서 이용 통계 */}
          <section>
            <SectionHeader icon={BarChart2} title="어제의 비서 이용 통계" />
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Star,          label: '최다 사용 비서', value: '회의록 정리', sub: '247회 사용',       accent: true  },
                { icon: Users,         label: '이용 인원',     value: '183명',       sub: '전날 대비 +12명', accent: false },
                { icon: MessageSquare, label: '대화 건수',     value: '1,024건',     sub: '전날 대비 +89건', accent: false },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col gap-3 p-5 rounded-xl border border-[#E4E2F0] bg-[#F9F8FF]">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${stat.accent ? 'bg-[#FEF3C7]' : 'bg-[#EEF0FF]'}`}>
                      <stat.icon className={stat.accent ? 'text-[#D4930A]' : 'text-[#4F46E5]'} strokeWidth={1.8} style={{ width: '18px', height: '18px' }} />
                    </div>
                    <p className="text-[13px] font-semibold text-[#6B6882] leading-tight">{stat.label}</p>
                  </div>
                  <div>
                    <p className="text-[24px] font-bold text-[#1A1826] leading-none tracking-tight break-keep">{stat.value}</p>
                    <p className="text-[12px] text-[#A8A6C0] mt-2">{stat.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 이건 어때요! */}
          <section>
            <SectionHeader icon={Zap} title="이건 어때요!" desc="(관리자가 지정하여 프로모션 하는 이벤트성 비서)" />
            <div className="grid grid-cols-3 gap-3">
              {PROMO_ASSISTANTS.map((a) => {
                const full = ALL_ASSISTANTS.find((x) => x.name === a.name);
                const isFav = favorites.includes(a.name);
                return (
                <div key={a.name} role="button" tabIndex={0}
                  onClick={() => onAssistantClick(toDetail(full ?? { ...a, category: '글쓰기' as const, users: a.users }))}
                  onKeyDown={(e) => e.key === 'Enter' && onAssistantClick(toDetail(full ?? { ...a, category: '글쓰기' as const, users: a.users }))}
                  className="group/promo relative flex flex-col gap-3 p-4 rounded-xl border border-[#E4E2F0] bg-white
                             hover:border-[#4F46E5]/30 hover:shadow-md hover:shadow-[#4F46E5]/8 hover:-translate-y-0.5
                             transition-all duration-200 text-left cursor-pointer overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#4F46E5]/60 to-[#7C6FF7]/40 rounded-t-xl" />
                  {/* 하트 버튼 */}
                  <button type="button"
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(a.name); }}
                    className={`absolute top-2 right-2 p-1 rounded-lg transition-all duration-150 ${
                      isFav ? 'text-[#EF4444] bg-[#FFF0F0] hover:bg-[#FFE0E0]'
                            : 'text-[#D1D0E0] hover:text-[#EF4444] hover:bg-[#FFF0F0] opacity-0 group-hover/promo:opacity-100'
                    }`} aria-label={isFav ? '즐겨찾기 해제' : '즐겨찾기 추가'}>
                    <Heart className="w-3.5 h-3.5" strokeWidth={isFav ? 0 : 1.8} fill={isFav ? 'currentColor' : 'none'} />
                  </button>
                  <div className="flex items-start justify-between pr-5">
                    <div className="w-10 h-10 rounded-xl bg-[#F0EEFF] group-hover/promo:bg-[#EEF0FF] flex items-center justify-center transition-colors">
                      <a.icon className="text-[#4F46E5]" strokeWidth={1.8} style={{ width: '20px', height: '20px' }} />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      a.badge === 'NEW' ? 'bg-[#D4930A]/10 text-[#D4930A]' : 'bg-[#4F46E5]/10 text-[#4F46E5]'
                    }`}>{a.badge}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1A1826]">{a.name}</p>
                    <p className="text-[10.5px] text-[#A8A6C0] mt-0.5 leading-snug break-keep line-clamp-2">{a.desc}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[#A8A6C0]">
                    <Users className="w-3 h-3" strokeWidth={1.8} />{a.users}명 이용 중
                  </div>
                </div>
                );
              })}
            </div>
          </section>

          {/* 최근 사용한 비서 */}
          <section>
            <SectionHeader icon={Clock} title="최근 사용한 비서" helpContent={RECENT_HELP} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {RECENT_ASSISTANTS.map((a) => {
                const full = ALL_ASSISTANTS.find((x) => x.name === a.name);
                const isFav = favorites.includes(a.name);
                return (
                <div key={a.name} role="button" tabIndex={0}
                  onClick={() => onAssistantClick(toDetail(full ?? { name: a.name, desc: '', icon: a.icon, category: '글쓰기' as const, users: '-' }))}
                  onKeyDown={(e) => e.key === 'Enter' && onAssistantClick(toDetail(full ?? { name: a.name, desc: '', icon: a.icon, category: '글쓰기' as const, users: '-' }))}
                  className="group/rc relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-[#E4E2F0] bg-white
                             hover:border-[#4F46E5]/30 hover:bg-[#F9F8FF] transition-all duration-200 text-left cursor-pointer">
                  <div className="w-7 h-7 rounded-lg bg-[#F4F3FC] group-hover/rc:bg-[#EEF0FF] flex items-center justify-center shrink-0 transition-colors">
                    <a.icon className="text-[#A8A6C0] group-hover/rc:text-[#4F46E5] transition-colors" strokeWidth={1.8} style={{ width: '14px', height: '14px' }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#1A1826] truncate">{a.name}</p>
                    <p className="text-[11px] text-[#A8A6C0]">{a.when}</p>
                  </div>
                  <button type="button"
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(a.name); }}
                    className={`p-1 rounded-lg transition-all duration-150 shrink-0 ${
                      isFav ? 'text-[#EF4444] bg-[#FFF0F0] hover:bg-[#FFE0E0]'
                            : 'text-[#D1D0E0] hover:text-[#EF4444] hover:bg-[#FFF0F0] opacity-0 group-hover/rc:opacity-100'
                    }`} aria-label={isFav ? '즐겨찾기 해제' : '즐겨찾기 추가'}>
                    <Heart className="w-3.5 h-3.5" strokeWidth={isFav ? 0 : 1.8} fill={isFav ? 'currentColor' : 'none'} />
                  </button>
                </div>
                );
              })}
            </div>
          </section>

          {/* 추천 비서 */}
          <section>
            <SectionHeader icon={Sparkles} title="추천 비서" helpContent={RECOMMENDED_HELP} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {RECOMMENDED.map((a) => {
                const full = ALL_ASSISTANTS.find((x) => x.name === a.name);
                return (
                  <AssistantCard key={a.name} {...a}
                    onClick={() => onAssistantClick(toDetail(full ?? { ...a, category: '글쓰기', users: '-' }))}
                    isFavorite={favorites.includes(a.name)} onToggleFavorite={onToggleFavorite} />
                );
              })}
            </div>
          </section>

          {/* 자주 사용하는 비서 */}
          <section>
            <SectionHeader icon={TrendingUp} title="자주 사용하는 비서" helpContent={FREQUENT_HELP} />
            <div className="flex flex-col gap-1.5">
              {FREQUENT.map((a) => {
                const full = ALL_ASSISTANTS.find((x) => x.name === a.name);
                const isFav = favorites.includes(a.name);
                return (
                <div key={a.name} role="button" tabIndex={0}
                  onClick={() => onAssistantClick(toDetail(full ?? { name: a.name, desc: a.desc, icon: a.icon, category: '글쓰기' as const, users: '-' }))}
                  onKeyDown={(e) => e.key === 'Enter' && onAssistantClick(toDetail(full ?? { name: a.name, desc: a.desc, icon: a.icon, category: '글쓰기' as const, users: '-' }))}
                  className="group/fr flex items-center gap-3 px-4 py-3 rounded-xl border border-[#E4E2F0] bg-white
                             hover:border-[#4F46E5]/30 hover:shadow-sm hover:shadow-[#4F46E5]/8 transition-all duration-200 text-left cursor-pointer">
                  <span className="text-[12px] font-bold text-[#A8A6C0] w-5 text-center shrink-0">
                    {a.rank <= 3 ? ['①','②','③'][a.rank-1] : `${a.rank}`}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-[#F4F3FC] group-hover/fr:bg-[#EEF0FF] flex items-center justify-center shrink-0 transition-colors">
                    <a.icon className="text-[#A8A6C0] group-hover/fr:text-[#4F46E5] transition-colors" strokeWidth={1.8} style={{ width: '14px', height: '14px' }} />
                  </div>
                  <span className="text-sm font-semibold text-[#1A1826] flex-1 truncate">{a.name}</span>
                  <span className="text-[11px] text-[#A8A6C0] shrink-0">{a.count}</span>
                  <p className="text-[10.5px] text-[#A8A6C0] ml-2 shrink-0
                                max-w-0 overflow-hidden opacity-0 whitespace-nowrap
                                group-hover/fr:max-w-[180px] group-hover/fr:opacity-100
                                transition-all duration-200 ease-out">{a.desc}</p>
                  <button type="button"
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(a.name); }}
                    className={`p-1 rounded-lg transition-all duration-150 shrink-0 ${
                      isFav ? 'text-[#EF4444] bg-[#FFF0F0] hover:bg-[#FFE0E0]'
                            : 'text-[#D1D0E0] hover:text-[#EF4444] hover:bg-[#FFF0F0] opacity-0 group-hover/fr:opacity-100'
                    }`} aria-label={isFav ? '즐겨찾기 해제' : '즐겨찾기 추가'}>
                    <Heart className="w-3.5 h-3.5" strokeWidth={isFav ? 0 : 1.8} fill={isFav ? 'currentColor' : 'none'} />
                  </button>
                </div>
                );
              })}
            </div>
          </section>

        </div>
      )}

      </div>{/* flex-1 overflow-y-auto 닫기 */}
    </>
  );
}

/* ─── 탭 4 – 전체 비서 갤러리 ─── */
function GalleryView({ onBack, onAssistantClick, favorites = [], onToggleFavorite }: {
  onBack: () => void; onAssistantClick: (a: AssistantDetail) => void;
  favorites?: string[]; onToggleFavorite?: (name: string) => void;
}) {
  const [activeCategory, setActiveCategory] = useState<Category>('전체');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = ALL_ASSISTANTS.filter((a) => {
    const matchCat = activeCategory === '전체' || a.category === activeCategory;
    const q = query.trim().toLowerCase();
    const matchQ = !q || a.name.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q) || a.category.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const isFiltering = query.trim() !== '' || activeCategory !== '전체';

  const clearAll = () => { setQuery(''); setActiveCategory('전체'); searchRef.current?.focus(); };

  return (
    <>
      {/* 검색 + 필터 영역 */}
      <div className="px-6 md:px-8 pt-5 pb-0 shrink-0 space-y-3">

        {/* 검색창 */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#E4E2F0] bg-[#FAFAFF]
                          hover:border-[#4F46E5]/30 focus-within:border-[#4F46E5]/50 transition-colors">
            <Search className="w-3.5 h-3.5 text-[#A8A6C0] shrink-0" strokeWidth={1.8} />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="비서 이름, 기능, 카테고리로 검색…"
              className="flex-1 text-[13px] text-[#1A1826] placeholder:text-[#A8A6C0] bg-transparent outline-none"
            />
            {query && (
              <button type="button" onClick={() => { setQuery(''); searchRef.current?.focus(); }}
                className="p-0.5 rounded-full text-[#A8A6C0] hover:text-[#6B6882] transition-colors">
                <XIcon className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            )}
          </div>
          <div className="flex items-center rounded-xl border border-[#E4E2F0] overflow-hidden shrink-0">
            <Tooltip label="그리드로 보기">
              <button type="button" onClick={() => setViewMode('grid')}
                className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-[#4F46E5] text-white' : 'text-[#A8A6C0] hover:text-[#6B6882] hover:bg-[#F4F3FC]'}`}>
                <LayoutGrid className="w-3.5 h-3.5" strokeWidth={1.8} />
              </button>
            </Tooltip>
            <Tooltip label="목록으로 보기">
              <button type="button" onClick={() => setViewMode('list')}
                className={`p-2.5 transition-colors border-l border-[#E4E2F0] ${viewMode === 'list' ? 'bg-[#4F46E5] text-white' : 'text-[#A8A6C0] hover:text-[#6B6882] hover:bg-[#F4F3FC]'}`}>
                <List className="w-3.5 h-3.5" strokeWidth={1.8} />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* 카테고리 칩 + 결과 수 */}
        <div className="flex items-center justify-between gap-2 mt-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F4F3FC] border border-[#E4E2F0] overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {CATEGORIES.map((cat) => (
              <button key={cat} type="button" onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-[#4F46E5] text-white shadow-sm shadow-[#4F46E5]/25'
                    : 'text-[#6B6882] hover:text-[#1A1826] hover:bg-white/70'
                }`}>{cat}</button>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isFiltering && (
              <button type="button" onClick={clearAll}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold
                           text-[#4F46E5] bg-[#F0EEFF] hover:bg-[#E5E2FD] transition-colors whitespace-nowrap">
                <XIcon className="w-3 h-3" strokeWidth={2} />
                초기화
              </button>
            )}
            <span className="text-[12px] text-[#A8A6C0] whitespace-nowrap">
              {isFiltering
                ? <><span className="font-bold text-[#4F46E5]">{filtered.length}</span> / {ALL_ASSISTANTS.length}개</>
                : <>{ALL_ASSISTANTS.length}개</>
              }
            </span>
          </div>
        </div>

      </div>

      {/* Grid / List */}
      <div className="flex-1 overflow-y-auto px-6 md:px-8 pt-4 pb-6" style={{ scrollbarWidth: 'none' }}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#A8A6C0]">
            <Search className="w-10 h-10" strokeWidth={1.2} />
            <p className="text-base font-semibold">검색 결과가 없습니다</p>
            <p className="text-sm">다른 키워드나 카테고리로 검색해보세요</p>
            <button type="button" onClick={clearAll}
              className="mt-1 px-4 py-2 rounded-xl text-sm font-semibold text-[#4F46E5] border border-[#4F46E5]/30 hover:bg-[#F0EEFF] transition-colors">
              전체 초기화
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((a) => (
              <AssistantCard key={a.name} name={a.name} desc={a.desc} icon={a.icon}
                badge={a.isNew ? 'NEW' : undefined} users={a.users}
                onClick={() => onAssistantClick(toDetail(a))}
                isFavorite={favorites.includes(a.name)} onToggleFavorite={onToggleFavorite} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {filtered.map((a) => (
              <button key={a.name} type="button" onClick={() => onAssistantClick(toDetail(a))}
                className="group/li flex items-center gap-3 px-4 py-3 rounded-xl border border-[#E4E2F0] bg-white
                           hover:border-[#4F46E5]/30 hover:shadow-sm hover:shadow-[#4F46E5]/8 transition-all duration-200 text-left">
                <div className="w-8 h-8 rounded-xl bg-[#F4F3FC] group-hover/li:bg-[#EEF0FF] flex items-center justify-center shrink-0 transition-colors">
                  <a.icon className="text-[#A8A6C0] group-hover/li:text-[#4F46E5] transition-colors" strokeWidth={1.8} style={{ width: '16px', height: '16px' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#1A1826] truncate">{a.name}</p>
                    {a.isNew && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#D4930A]/10 text-[#D4930A] shrink-0">NEW</span>}
                  </div>
                  <p className="text-[10.5px] text-[#A8A6C0] mt-0.5 truncate
                                max-h-0 overflow-hidden opacity-0
                                group-hover/li:max-h-5 group-hover/li:opacity-100
                                transition-all duration-200">{a.desc}</p>
                </div>
                <span className="text-[11px] text-[#A8A6C0] shrink-0">{a.users}명</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ─── 루트 MarketView ─── */
const TABS: { key: MarketTab; label: string }[] = [
  { key: 'gallery',  label: '전체 비서' },
  { key: 'official', label: '추천·통계' },
  { key: 'test',     label: '공개전 테스트 요청 비서' },
  { key: 'my',       label: '내가 만든 모든 비서' },
];

export default function MarketView({ savedItems, savedPanelOpen, onToggleSavedPanel, onToggleSidebar, sidebarOpen = true, notifPanelOpen = false, notifUnread = 0, onToggleNotifPanel, onOpenBriefing, onStartWithAssistant, favorites = [], onToggleFavorite }: MarketSharedProps) {
  const [activeTab, setActiveTab] = useState<MarketTab>('official');
  const [selectedAssistant, setSelectedAssistant] = useState<AssistantDetail | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editTarget, setEditTarget] = useState<{ draft: DraftJson } | null>(null);
  const [myList, setMyList] = useState<MyAssistant[]>(MY_ASSISTANTS);

  const handleCloneFromModal = (a: AssistantDetail) => {
    const today = new Date().toISOString().slice(0, 10);
    const cloned: MyAssistant = {
      name: `[복제] ${a.name}`,
      desc: a.fullDesc ?? a.desc,
      icon: a.icon,
      author: '나',
      statusBadge: '임시저장',
      scope: '비공개',
      isDraft: true,
      createdAt: today,
      updatedAt: today,
      stats: { dialogueCount: 0, messageCount: 0, comments: [] },
      _isNew: true,
    };
    setMyList(prev => [cloned, ...prev]);
    setSelectedAssistant(null);
    setActiveTab('my');
    setTimeout(() => {
      setMyList(prev => prev.map((a, i) => i === 0 ? { ...a, _isNew: false } : a));
    }, 3000);
  };

  const handleTabChange = (tab: MarketTab) => { setActiveTab(tab); };

  const handleEditAssistant = (a: MyAssistant) => {
    setEditTarget({
      draft: {
        name: a.name,
        description: a.desc,
        instructions: '',
        prohibitions: [],
        conversation_starters: [],
        knowledge_files: [],
        first_message: '',
        use_foundation_model: true,
      },
    });
    setShowBuilder(true);
  };

  /* 빌더 페이지 */
  if (showBuilder) {
    return (
      <AssistantBuilderView
        onBack={() => { setShowBuilder(false); setEditTarget(null); }}
        initialDraft={editTarget?.draft}
        editMode={editTarget != null}
      />
    );
  }

  const handleAssistantClick = (a: AssistantDetail) => setSelectedAssistant(a);

  const handleSelectOther = (name: string) => {
    const found = ALL_ASSISTANTS.find((a) => a.name === name);
    if (found) setSelectedAssistant(toDetail(found));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white min-w-0 overflow-hidden">

      {/* ── Topbar ── */}
      <div className="h-12 flex items-center justify-between px-4 md:px-6 bg-white border-b border-[#E4E2F0] shrink-0">
        <div className="flex items-center gap-2">
          <button type="button" onClick={onToggleSidebar}
            aria-label={sidebarOpen ? '사이드바 접기' : '사이드바 펼치기'}
            className="p-1.5 rounded-lg text-[#A8A6C0] hover:text-[#4F46E5] hover:bg-[#F4F3FC] transition-colors">
            {sidebarOpen
              ? <ChevronLeft className="w-4 h-4" strokeWidth={2} />
              : <ChevronRight className="w-4 h-4" strokeWidth={2} />}
          </button>
          <Store className="w-4 h-4 text-[#4F46E5]" strokeWidth={1.8} />
          <span className="text-base font-bold text-[#1A1826]">비서마켓</span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onOpenBriefing} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-semibold transition-colors shadow-sm shadow-[#4F46E5]/20">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={1.8} />
            <span className="hidden sm:inline">브리핑</span>
          </button>
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
        </div>
      </div>

      {/* ── 탭 바 ── */}
      <div className="flex shrink-0 border-b border-[#E4E2F0] px-4 md:px-6 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {TABS.map((t) => (
          <button key={t.key} type="button" onClick={() => handleTabChange(t.key)}
            className={`relative px-4 py-3 text-[14px] font-semibold whitespace-nowrap transition-colors border-b-2 ${
              activeTab === t.key
                ? 'border-[#4F46E5] text-[#4F46E5]'
                : 'border-transparent text-[#6B6882] hover:text-[#1A1826] hover:border-[#E4E2F0]'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── 탭 콘텐츠 ── */}
      {activeTab === 'my'       && <MyAssistantsTab onEdit={handleEditAssistant} list={myList} setList={setMyList} onOpenBuilder={() => { setActiveTab('my'); setShowBuilder(true); }} />}
      {activeTab === 'test'     && <TestRequestTab />}
      {activeTab === 'official' && <OfficialTab onOpenGallery={() => handleTabChange('gallery')} onAssistantClick={handleAssistantClick} favorites={favorites} onToggleFavorite={onToggleFavorite} />}
      {activeTab === 'gallery'  && <GalleryView onBack={() => handleTabChange('official')} onAssistantClick={handleAssistantClick} favorites={favorites} onToggleFavorite={onToggleFavorite} />}

      {/* ── 비서 상세 모달 ── */}
      {selectedAssistant && (
        <AssistantInfoModal
          assistant={selectedAssistant}
          onClose={() => setSelectedAssistant(null)}
          onSelectOther={handleSelectOther}
          onClone={handleCloneFromModal}
          onStartChat={() => {
            onStartWithAssistant?.({
              name: selectedAssistant.name,
              starters: selectedAssistant.starters ?? [],
              desc: selectedAssistant.fullDesc ?? selectedAssistant.desc,
            });
            setSelectedAssistant(null);
          }}
        />
      )}
    </div>
  );
}
