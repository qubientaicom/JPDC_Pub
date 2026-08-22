import { useEffect, useState } from 'react';
import { X, Star, MessageSquare, BarChart2, Users, ChevronRight, Lock, Copy, CopyCheck, Layers, type LucideIcon } from 'lucide-react';
import Tooltip from './Tooltip';

/* ── 타입 ── */
export interface AssistantDetail {
  name: string;
  desc: string;
  fullDesc?: string;
  icon: LucideIcon;
  category: string;
  users: string;
  isNew?: boolean;
  author?: string;
  version?: string;
  /** 'official' = 승인완료, 'pending' = 승인 대기, 'updating' = 버전 갱신중 */
  status?: 'official' | 'pending' | 'updating';
  rating?: number;
  ratingCount?: number;
  ratingDistribution?: { 5: number; 4: number; 3: number; 2: number; 1: number };
  dialogueCount?: number;
  messageCount?: number;
  likes?: number;
  dislikes?: number;
  starters?: string[];
  comments?: { text: string; ts: string }[];
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
function Badge({ status, isNew }: { status?: AssistantDetail['status']; isNew?: boolean }) {
  const chips: { label: string; bg: string; text: string }[] = [];

  chips.push({ label: 'v1', bg: '#F0EEFF', text: '#4F46E5' });

  if (status === 'official')  chips.push({ label: '공식',       bg: '#DCFCE7', text: '#16A34A' });
  if (status === 'official')  chips.push({ label: '승인완료',   bg: '#DCFCE7', text: '#16A34A' });
  if (status === 'updating')  chips.push({ label: '버전 갱신중', bg: '#FEF3C7', text: '#D97706' });
  if (status === 'pending')   chips.push({ label: '승인 대기',   bg: '#FEE2E2', text: '#DC2626' });
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

/* ── 별점 막대 ── */
function RatingBars({ dist, count }: { dist: AssistantDetail['ratingDistribution']; count: number }) {
  if (!dist || count === 0) {
    return (
      <p className="text-[13px] text-[#A8A6C0] py-2">아직 평가가 없습니다.</p>
    );
  }
  const total = Object.values(dist).reduce((a, b) => a + b, 0);
  return (
    <div className="flex flex-col gap-1.5">
      {([5, 4, 3, 2, 1] as const).map((star) => {
        const pct = total > 0 ? (dist[star] / total) * 100 : 0;
        return (
          <div key={star} className="flex items-center gap-2">
            <span className="text-[12px] text-[#6B6882] w-4 text-right shrink-0">{star}</span>
            <Star className="w-3 h-3 text-[#F59E0B] shrink-0" fill="#F59E0B" strokeWidth={0} />
            <div className="flex-1 h-1.5 rounded-full bg-[#F4F3FC] overflow-hidden">
              <div className="h-full rounded-full bg-[#F59E0B] transition-all duration-500"
                style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[11px] text-[#A8A6C0] w-5 text-left shrink-0">{dist[star]}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── 메인 모달 ── */
export default function AssistantInfoModal({ assistant: a, onClose, onSelectOther, onStartChat, onClone }: Props) {
  const c = getCatColor(a.category);
  const isLocked = a.status === 'pending' || a.status === 'updating';
  const ratingStr = a.rating && a.ratingCount && a.ratingCount > 0
    ? a.rating.toFixed(1)
    : '-';
  const [copied, setCopied] = useState(false);
  const [cloned, setCloned] = useState(false);

  const handleCopyUrl = () => {
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
            <h2 className="text-[18px] font-bold text-[#1A1826] leading-snug mb-1">{a.name}</h2>

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
            <Badge status={a.status ?? 'official'} isNew={a.isNew} />
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
                label: `평가 (${a.ratingCount ?? 0})`,
                value: <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" strokeWidth={0} />{ratingStr}</span>,
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
            {a.rating && a.ratingCount && a.ratingCount > 0 ? (
              <div className="flex items-start gap-5">
                {/* 왼쪽: 총점 */}
                <div className="flex flex-col items-center gap-0.5 shrink-0">
                  <span className="text-[33px] font-black text-[#1A1826] leading-none">{a.rating.toFixed(1)}</span>
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} style={{ width: 10, height: 10 }}
                        fill={i <= Math.round(a.rating!) ? '#F59E0B' : '#E4E2F0'}
                        stroke="none" />
                    ))}
                  </div>
                  <span className="text-[11px] text-[#A8A6C0] mt-0.5">{a.ratingCount}개 평가</span>
                </div>
                {/* 오른쪽: 막대 */}
                <div className="flex-1">
                  <RatingBars dist={a.ratingDistribution} count={a.ratingCount ?? 0} />
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
            <Tooltip label={a.status === 'pending' ? '승인 대기 중인 비서는 채팅을 시작할 수 없습니다' : '버전 갱신 중입니다. 잠시 후 다시 시도해 주세요'} position="top">
              <button type="button" disabled
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                           bg-[#F4F3FC] text-[#A8A6C0] text-base font-semibold cursor-not-allowed">
                <Lock className="w-4 h-4" strokeWidth={1.8} />
                {a.status === 'pending' ? '승인 대기 중' : '버전 갱신중'}
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
            <button type="button" onClick={handleCopyUrl}
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
