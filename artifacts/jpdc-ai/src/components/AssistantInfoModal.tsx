import { useEffect, useState } from 'react';
import { X, Star, MessageSquare, BarChart2, Users, ChevronRight, Lock, Copy, CopyCheck, Layers, type LucideIcon } from 'lucide-react';
import Tooltip from './Tooltip';
import { RATING_LEVELS, summarizeRatings, type RatingDistribution } from '../lib/ratings';

/* ── 타입 ── */
export interface AssistantDetail {
  name: string;
  desc: string;
  fullDesc?: string;
  icon: LucideIcon;
  category: string;
  users: string;
  isNew?: boolean;
  isDeleted?: boolean;
  author?: string;
  version?: string;
  status?: 'official' | 'approved' | 'pending' | 'updating' | 'draft' | 'private' | 'rejected';
  scope?: string;
  rating?: number;
  ratingCount?: number;
  ratingDistribution?: RatingDistribution;
  dialogueCount?: number;
  messageCount?: number;
  likes?: number;
  dislikes?: number;
  starters?: string[];
  comments?: { text: string; ts: string; author?: string }[];
  othersByAuthor?: { name: string; desc: string; icon: LucideIcon }[];
}

interface Props {
  assistant: AssistantDetail;
  onClose: () => void;
  onSelectOther?: (name: string) => void;
  onStartChat?: () => void;
  onClone?: (a: AssistantDetail) => void;
}

/* ── 카테고리 색상 ── */
const CATEGORY_COLOR: Record<string, { bg: string; text: string; ring: string }> = {
  '글쓰기':    { bg: '#EDE9FE', text: '#7C3AED', ring: '#7C3AED' },
  '코드':      { bg: '#DBEAFE', text: '#2563EB', ring: '#2563EB' },
  '번역':      { bg: '#DCFCE7', text: '#16A34A', ring: '#16A34A' },
  '분석':      { bg: '#FEF3C7', text: '#D97706', ring: '#D97706' },
  '법률·회계': { bg: '#FEE2E2', text: '#DC2626', ring: '#DC2626' },
};
const DEFAULT_COLOR = { bg: '#F0EEFF', text: '#4F46E5', ring: '#4F46E5' };

function getCatColor(cat: string) {
  return CATEGORY_COLOR[cat] ?? DEFAULT_COLOR;
}

/* ── 숫자 축약 ── */
function fmt(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
  if (n >= 1000)  return `${(n / 1000).toFixed(1)}천`;
  return String(n);
}

/* ── 배지 ── */
function Badge({ status, isNew, version, scope }: { status?: AssistantDetail['status']; isNew?: boolean; version?: string; scope?: string }) {
  const chips: { label: string; bg: string; text: string }[] = [];

  chips.push({ label: version ?? 'v1', bg: '#F0EEFF', text: '#4F46E5' });

  if (status === 'official')  chips.push({ label: '공식',       bg: '#DCFCE7', text: '#16A34A' });
  if (status === 'official')  chips.push({ label: '승인완료',   bg: '#DCFCE7', text: '#16A34A' });
  if (status === 'approved')  chips.push({ label: '승인완료',   bg: '#DCFCE7', text: '#16A34A' });
  if (status === 'updating')  chips.push({ label: '버전 갱신중', bg: '#FEF3C7', text: '#D97706' });
  if (status === 'pending')   chips.push({ label: '승인 대기',   bg: '#FEE2E2', text: '#DC2626' });
  if (status === 'draft')     chips.push({ label: '임시저장',    bg: '#FEF3C7', text: '#D97706' });
  if (status === 'rejected')  chips.push({ label: '승인불가',    bg: '#FEE2E2', text: '#DC2626' });
  if (scope)                 chips.push({ label: scope,        bg: '#F0EEFF', text: '#4F46E5' });
  if (isNew)                  chips.push({ label: 'NEW',         bg: '#FEF9C3', text: '#D4930A' });

  return (
    <div className="flex flex-wrap items-center gap-1.5 justify-center">
      {chips.map((c) => (
        <span key={c.label}
          className="text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: c.bg, color: c.text }}>
          {c.label}
        </span>
      ))}
    </div>
  );
}

/* ── 양수·음수 점수별 평가 막대 ── */
function RatingBars({ dist, count }: { dist: AssistantDetail['ratingDistribution']; count: number }) {
  if (!dist || count === 0) {
    return (
      <p className="text-[13px] text-[#A8A6C0] py-2">아직 평가가 없습니다.</p>
    );
  }
  const total = summarizeRatings(dist).count;
  return (
    <div className="flex flex-col gap-1.5">
      {RATING_LEVELS.map((star) => {
        const votes = dist[star] ?? 0;
        const pct = total > 0 ? (votes / total) * 100 : 0;
        const color = star > 0 ? '#10B981' : '#EF4444';
        return (
          <div key={star} className="flex items-center gap-2">
            <span className="text-[12px] w-5 text-right shrink-0" style={{ color }}>{star > 0 ? `+${star}` : star}</span>
            <Star className="w-3 h-3 shrink-0" style={{ color }} fill={color} strokeWidth={0} />
            <div className="flex-1 h-1.5 rounded-full bg-[#F4F3FC] overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: color }} />
            </div>
            <span className="text-[11px] text-[#A8A6C0] w-8 text-left shrink-0">{votes}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── 메인 모달 ── */
export default function AssistantInfoModal({ assistant: a, onClose, onSelectOther, onStartChat, onClone }: Props) {
  const c = getCatColor(a.category);
  const lockMessage = a.isDeleted ? '삭제된 비서 · 대화 불가'
    : a.status === 'pending' ? '승인 대기 중'
    : a.status === 'updating' ? '버전 갱신중'
    : a.status === 'draft' ? '임시저장 중'
    : a.status === 'rejected' ? '승인불가' : null;
  const isLocked = lockMessage !== null;
  const ratingSummary = summarizeRatings(a.ratingDistribution);
  const ratingStr = ratingSummary.count > 0 ? String(ratingSummary.total) : '-';
  const ratingColor = ratingSummary.total < 0 ? '#EF4444' : ratingSummary.total > 0 ? '#10B981' : '#6B6882';
  const [copied, setCopied] = useState(false);
  const [cloned, setCloned] = useState(false);

  const handleCopyUrl = () => {
    if (a.isDeleted) return;
    navigator.clipboard.writeText(`https://jpdc.ai/assistants/${encodeURIComponent(a.name)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClone = () => {
    onClone?.(a);
    setCloned(true);
    setTimeout(() => setCloned(false), 2000);
  };

  /* ESC 닫기 */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  /* 스크롤 잠금 */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    /* 백드롭 */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,13,30,0.55)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}>

      {/* 모달 카드 */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-[#E4E2F0] w-full max-w-md flex flex-col overflow-hidden"
        style={{ maxHeight: '88vh' }}
        onClick={(e) => e.stopPropagation()}>

        {/* 닫기 버튼 */}
        <button type="button" onClick={onClose}
          className="absolute top-3.5 right-3.5 z-10 p-1.5 rounded-lg text-[#A8A6C0] hover:text-[#1A1826] hover:bg-[#F4F3FC] transition-colors">
          <X className="w-4.5 h-4.5" strokeWidth={1.8} style={{ width: 18, height: 18 }} />
        </button>

        {/* 스크롤 영역 */}
        <div className="overflow-y-auto flex-1" style={{ scrollbarWidth: 'none' }}>

          {/* ── 헤더 ── */}
          <div className="flex flex-col items-center px-6 pt-8 pb-5 text-center"
            style={{ background: `linear-gradient(160deg, ${c.bg}80 0%, #fff 60%)` }}>

            {/* 아이콘 */}
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-sm"
              style={{ background: c.bg, border: `1.5px solid ${c.ring}30` }}>
              <a.icon style={{ width: 30, height: 30, color: c.text }} strokeWidth={1.6} />
            </div>

            {/* 이름 */}
            <h2 className="text-[18px] font-bold text-[#1A1826] leading-snug mb-1">{a.name}
              {a.isDeleted && <span className="ml-2 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600">삭제</span>}
            </h2>

            {/* 메타 */}
            <p className="text-[13px] text-[#A8A6C0] mb-2.5">
              작성자: {a.author ?? 'JPDC'}
              {a.category && (
                <>
                  <span className="mx-1.5">·</span>
                  카테고리: {a.category}
                </>
              )}
            </p>

            {/* 배지 */}
            <Badge status={a.status ?? 'official'} isNew={a.isNew} version={a.version} scope={a.scope} />
          </div>

          {/* ── 설명 ── */}
          <div className="px-6 pb-4">
            <p className="text-[14px] text-[#6B6882] leading-relaxed break-keep">
              {a.fullDesc ?? a.desc}
            </p>
          </div>

          {/* ── 통계 6칸 ── */}
          <div className="mx-6 mb-5 grid grid-cols-6 divide-x divide-[#E4E2F0] border border-[#E4E2F0] rounded-xl overflow-hidden">
            {([
              {
                label: `평가 (${ratingSummary.count})`,
                value: <span className="flex items-center gap-1" style={{ color: ratingColor }}><Star className="w-4 h-4" fill={ratingColor} strokeWidth={0} />{ratingStr}</span>,
              },
              { label: '좋아요', value: <span className="text-[#4F46E5]">👍 {a.likes ?? 0}</span> },
              { label: '싫어요', value: <span className="text-[#DC2626]">👎 {a.dislikes ?? 0}</span> },
              { label: '대화수',   value: fmt(a.dialogueCount ?? 0) },
              { label: '메시지수', value: fmt(a.messageCount ?? 0) },
              { label: '코멘트수', value: a.comments?.length ?? 0 },
            ] as const).map((s, i) => (
              <div key={s.label}
                className="flex flex-col items-center gap-1 py-4 px-1">
                <span className="text-[14px] font-bold text-[#1A1826] leading-none">{s.value}</span>
                <span className="text-[9.5px] text-[#A8A6C0] text-center leading-tight mt-0.5">{s.label}</span>
              </div>
            ))}
          </div>

          {/* ── 대화 스타터 ── */}
          {a.starters && a.starters.length > 0 && (
            <div className="px-6 mb-5">
              <h3 className="text-[13px] font-bold text-[#1A1826] mb-2.5 flex items-center gap-1.5">
                대화 스타터
                <span className="text-[11px] font-normal text-[#A8A6C0]">클릭하면 바로 대화시작</span>
              </h3>
              <div className="flex flex-col gap-1.5">
                {a.starters.map((s) => (
                  <button key={s} type="button" onClick={onClose}
                    className="flex items-center gap-2 text-left px-3.5 py-2.5 rounded-xl border border-[#E4E2F0]
                               hover:border-[#4F46E5]/40 hover:bg-[#F9F8FF] transition-all group/st">
                    <ChevronRight className="w-3 h-3 text-[#4F46E5] shrink-0 opacity-0 group-hover/st:opacity-100 transition-opacity" strokeWidth={2} />
                    <span className="text-[13px] text-[#6B6882] group-hover/st:text-[#1A1826] transition-colors leading-snug">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── 평가 ── */}
          <div className="px-6 mb-5">
            <h3 className="text-[13px] font-bold text-[#1A1826] mb-2.5">평가</h3>
            {ratingSummary.count > 0 ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                {/* 왼쪽: 총점 */}
                <div className="flex flex-col items-center gap-0.5 shrink-0">
                  <span className="text-[11px] font-semibold text-[#6B6882] mb-1">합산 점수</span>
                  <span className="text-[33px] font-black leading-none" style={{ color: ratingColor }}>{ratingSummary.total}</span>
                  <span className="text-[11px] text-[#A8A6C0] mt-0.5">{ratingSummary.count}개 평가</span>
                  <span className="text-[11px] text-emerald-600 mt-2">좋아요 +{ratingSummary.positiveScore}점</span>
                  <span className="text-[11px] text-red-500">싫어요 {ratingSummary.negativeScore}점</span>
                </div>
                {/* 오른쪽: 막대 */}
                <div className="w-full flex-1">
                  <p className="text-[11px] text-[#6B6882] mb-2">점수별 평가 건수 · 좋아요 점수 + 싫어요 점수</p>
                  <RatingBars dist={a.ratingDistribution} count={ratingSummary.count} />
                </div>
              </div>
            ) : (
              <RatingBars dist={a.ratingDistribution} count={0} />
            )}
          </div>

          {/* ── 코멘트 ── */}
          {a.comments && a.comments.length > 0 && (
            <div className="px-6 mb-5">
              <h3 className="text-[13px] font-bold text-[#1A1826] mb-2.5">코멘트</h3>
              <div className="flex flex-col gap-2">
                {a.comments.slice().sort((x, y) => y.ts.localeCompare(x.ts)).map((cm) => (
                  <div key={cm.ts} className="px-3.5 py-2.5 rounded-xl bg-[#F9F8FF] border border-[#E4E2F0]">
                    {cm.author && <p className="text-[12px] font-semibold text-[#6B6882] mb-1">{cm.author}</p>}
                    <p className="text-[13px] text-[#1A1826] leading-snug mb-1">{cm.text}</p>
                    <p className="text-[11px] text-[#A8A6C0]">{new Date(cm.ts).toLocaleString('ko-KR')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 같은 작성자의 다른 비서 ── */}
          {a.othersByAuthor && a.othersByAuthor.length > 0 && (
            <div className="px-6 mb-5">
              <h3 className="text-[13px] font-bold text-[#1A1826] mb-2.5">같은 작성자의 다른 비서</h3>
              <div className="grid grid-cols-2 gap-2">
                {a.othersByAuthor.slice(0, 8).map((o) => (
                  <button key={o.name} type="button"
                    onClick={() => onSelectOther?.(o.name)}
                    className="group/o flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-[#E4E2F0] bg-white
                               hover:border-[#4F46E5]/30 hover:bg-[#F9F8FF] transition-all text-left">
                    <div className="w-7 h-7 rounded-lg bg-[#F4F3FC] group-hover/o:bg-[#EEF0FF] flex items-center justify-center shrink-0 transition-colors">
                      <o.icon className="text-[#A8A6C0] group-hover/o:text-[#4F46E5] transition-colors"
                        strokeWidth={1.8} style={{ width: 14, height: 14 }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-[#1A1826] truncate leading-snug">{o.name}</p>
                      <p className="text-[11px] text-[#A8A6C0] truncate leading-snug">{o.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 하단 여백 */}
          <div className="h-2" />
        </div>

        {/* ── 고정 하단 버튼 ── */}
        <div className="px-6 py-4 border-t border-[#E4E2F0] bg-white shrink-0 space-y-2">
          {/* 채팅 시작 */}
          {isLocked ? (
            <Tooltip label={`${lockMessage} 상태의 비서는 채팅을 시작할 수 없습니다`} position="top">
              <button type="button" disabled
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                           bg-[#F4F3FC] text-[#A8A6C0] text-base font-semibold cursor-not-allowed">
                <Lock className="w-4 h-4" strokeWidth={1.8} />
                {lockMessage}
              </button>
            </Tooltip>
          ) : (
            <button type="button" onClick={() => { onStartChat ? onStartChat() : onClose(); }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                         bg-[#4F46E5] hover:bg-[#4338CA] text-white text-base font-semibold
                         transition-colors shadow-md shadow-[#4F46E5]/25">
              <MessageSquare className="w-4 h-4" strokeWidth={1.8} />
              💬 채팅 시작
            </button>
          )}

          {/* 복제 + URL 복사 */}
          <div className="flex gap-2">
            <Tooltip label="클릭하면 '내가 만든 비서' 탭에 복제됩니다" position="top" className="flex-1">
              <button type="button" onClick={handleClone}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-[14px] font-semibold transition-all
                  ${cloned
                    ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#16A34A]'
                    : 'bg-white border-[#E4E2F0] text-[#6B6882] hover:border-[#4F46E5]/40 hover:bg-[#F9F8FF] hover:text-[#4F46E5]'}`}>
                <Layers className="w-3.5 h-3.5" strokeWidth={1.8} />
                {cloned ? '복제됨' : '복제'}
              </button>
            </Tooltip>
            <button type="button" onClick={handleCopyUrl} disabled={a.isDeleted}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-[14px] font-semibold transition-all
                ${copied
                  ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#16A34A]'
                  : 'bg-white border-[#E4E2F0] text-[#6B6882] hover:border-[#4F46E5]/40 hover:bg-[#F9F8FF] hover:text-[#4F46E5]'}`}>
              {copied ? <CopyCheck className="w-3.5 h-3.5" strokeWidth={1.8} /> : <Copy className="w-3.5 h-3.5" strokeWidth={1.8} />}
              {copied ? '복사됨' : 'URL 복사'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
