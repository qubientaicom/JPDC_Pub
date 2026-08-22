import { useState, useEffect, useRef } from 'react';
import { Sparkles, Paperclip, ArrowUp, Zap, PenTool, Code, Globe, FileText, BookmarkCheck, Bell, Menu, Users, ChevronDown, ChevronLeft, ChevronRight, CheckCircle2, BarChart2, Calendar, Mail, Layers, Star, Shield, Store, type LucideIcon } from 'lucide-react';
import type { SavedItem } from '../components/SavedPanel';
import Tooltip from '../components/Tooltip';
import { useTheme } from '../context/ThemeContext';

const MODES = ['회의록 문장정리', '이메일 문체변경', '번역', '보도자료'];

const MODE_STARTERS: Record<string, string[]> = {
  '회의록 문장정리': ['오늘 계약 검토 회의 내용을 정리해 줘', '안건 3개로 구성된 회의록 초안을 작성해 줘', '액션아이템만 따로 추출해 줄 수 있어?'],
  '이메일 문체변경': ['이 이메일을 정중한 격식체로 바꿔줘', '비격식 친근한 문체로 변환해 줘', '영어 이메일을 한국어 공문 스타일로 바꿔줘'],
  '번역':           ['이 영어 이메일을 자연스러운 한국어로 번역해 줘', '계약서 일부를 영어로 번역해 줘', '일본어 공문서를 번역해 줘'],
  '보도자료':       ['신제품 출시 보도자료를 작성해 줘', '이 내용을 언론 배포용 문체로 다듬어 줘', '보도자료 제목 후보 5개를 만들어 줘'],
};

type AssistantItem = { label: string; desc: string; icon: LucideIcon; color: string; bg: string; starters: string[]; isNew?: boolean; colored?: boolean };

const OFFICIAL_ASSISTANTS: AssistantItem[] = [
  { label: 'AI 글쓰기',    desc: '블로그·기획서·이메일 등 다양한 글 작성',   icon: PenTool,   color: '#8B5CF6', bg: '#F5F3FF', isNew: true, colored: true,
    starters: ['보도자료 초안을 작성해줘', '기획서 목차를 잡아줘', '이메일 초안을 써줘'] },
  { label: '코드 분석',    desc: '디버깅·최적화·리뷰로 코드 품질 향상',      icon: Code,      color: '#10B981', bg: '#ECFDF5', isNew: true,
    starters: ['이 코드의 버그를 찾아줘', 'React 컴포넌트 성능 개선해줘', 'SQL 쿼리 최적화해줘'] },
  { label: '번역',         desc: '다국어 고품질 번역, 자연스러운 문장',        icon: Globe,     color: '#3B82F6', bg: '#EFF6FF', colored: true,
    starters: ['이 영어 이메일을 한국어로 번역해줘', '계약서 일부를 영어로 번역해줘', '일본어 문서를 번역해줘'] },
  { label: '문서 요약',    desc: 'PDF·보고서·계약서를 핵심만 간추려 정리',    icon: FileText,  color: '#F59E0B', bg: '#FFFBEB',
    starters: ['이 PDF를 요약해줘', '보고서 핵심만 뽑아줘', '계약서 주요 조항 정리해줘'] },
  { label: '데이터 분석',  desc: '수치·차트·통계를 자동으로 정리·해석',       icon: BarChart2, color: '#4F46E5', bg: '#EEEEFF', isNew: true, colored: true,
    starters: ['이 데이터의 추이를 분석해줘', '월별 매출 차트를 만들어줘', '이상값을 찾아줘'] },
  { label: '회의록 정리',  desc: '회의 내용을 구조화해 핵심만 요약·정리',     icon: Calendar,  color: '#EC4899', bg: '#FDF2F8',
    starters: ['오늘 회의록을 정리해줘', '액션아이템만 뽑아줘', '결정 사항을 요약해줘'] },
  { label: '이메일 작성',  desc: '업무 목적에 맞는 이메일 초안 자동 생성',    icon: Mail,      color: '#0EA5E9', bg: '#F0F9FF', isNew: true, colored: true,
    starters: ['거절 이메일을 정중하게 써줘', '미팅 요청 이메일을 써줘', '감사 이메일 초안을 써줘'] },
  { label: '보도자료',     desc: '제품·서비스 출시 보도자료 전문 작성',        icon: Zap,       color: '#F97316', bg: '#FFF7ED',
    starters: ['신제품 출시 보도자료를 써줘', '이 내용을 언론 배포용으로 다듬어줘', '제목 후보 5개를 만들어줘'] },
];

const MY_ASSISTANTS: AssistantItem[] = [
  { label: '예산안 검토',  desc: '예산 항목별 적정성 검토 및 코멘트 생성',   icon: Shield,    color: '#4F46E5', bg: '#EEEEFF', colored: true,
    starters: ['이 예산안의 문제점을 찾아줘', '항목별 절감 방안을 제안해줘', '전년 대비 증감을 분석해줘'] },
  { label: '계약서 분석',  desc: '계약 조항 위험 요소 식별 및 요약',          icon: FileText,  color: '#10B981', bg: '#ECFDF5',
    starters: ['이 계약서의 불리한 조항을 찾아줘', '핵심 조항만 요약해줘', '위험 조항에 대안을 제안해줘'] },
  { label: '팀 일정관리',  desc: '팀 미팅·마감일 정리 및 알림 문구 생성',    icon: Calendar,  color: '#F59E0B', bg: '#FFFBEB', colored: true,
    starters: ['이번 주 팀 일정을 정리해줘', '마감 임박 항목을 알려줘', '회의 초대 문구를 써줘'] },
  { label: '주간 보고서',  desc: '업무 현황을 보고서 형식으로 자동 정리',     icon: Layers,    color: '#8B5CF6', bg: '#F5F3FF',
    starters: ['이번 주 업무를 보고서로 작성해줘', '주요 성과를 요약해줘', '다음 주 계획을 정리해줘'] },
  { label: '코드 분석',    desc: '디버깅·최적화·리뷰로 코드 품질 향상',      icon: Code,      color: '#10B981', bg: '#ECFDF5',
    starters: ['이 코드의 버그를 찾아줘', 'React 컴포넌트 성능 개선해줘', 'SQL 쿼리 최적화해줘'] },
];

const POPULAR_ASSISTANTS: AssistantItem[] = [
  { label: '회의록 정리',  desc: '회의 내용을 구조화해 핵심만 요약·정리',     icon: Calendar,  color: '#EC4899', bg: '#FDF2F8', colored: true,
    starters: ['오늘 회의록을 정리해줘', '액션아이템만 뽑아줘', '결정 사항을 요약해줘'] },
  { label: 'AI 글쓰기',    desc: '블로그·기획서·이메일 등 다양한 글 작성',   icon: PenTool,   color: '#8B5CF6', bg: '#F5F3FF', colored: true,
    starters: ['보도자료 초안을 작성해줘', '기획서 목차를 잡아줘', '이메일 초안을 써줘'] },
  { label: '문서 요약',    desc: 'PDF·보고서·계약서를 핵심만 간추려 정리',    icon: FileText,  color: '#F59E0B', bg: '#FFFBEB',
    starters: ['이 PDF를 요약해줘', '보고서 핵심만 뽑아줘', '계약서 주요 조항 정리해줘'] },
  { label: '데이터 분석',  desc: '수치·차트·통계를 자동으로 정리·해석',       icon: BarChart2, color: '#4F46E5', bg: '#EEEEFF', colored: true,
    starters: ['이 데이터의 추이를 분석해줘', '월별 매출 차트를 만들어줘', '이상값을 찾아줘'] },
  { label: '번역',         desc: '다국어 고품질 번역, 자연스러운 문장',        icon: Globe,     color: '#3B82F6', bg: '#EFF6FF',
    starters: ['이 영어 이메일을 한국어로 번역해줘', '계약서 일부를 영어로 번역해줘', '일본어 문서를 번역해줘'] },
  { label: '주간 보고서',  desc: '업무 현황을 보고서 형식으로 자동 정리',     icon: Layers,    color: '#8B5CF6', bg: '#F5F3FF',
    starters: ['이번 주 업무를 보고서로 작성해줘', '주요 성과를 요약해줘', '다음 주 계획을 정리해줘'] },
  { label: '이메일 작성',  desc: '업무 목적에 맞는 이메일 초안 자동 생성',    icon: Mail,      color: '#0EA5E9', bg: '#F0F9FF', colored: true,
    starters: ['거절 이메일을 정중하게 써줘', '미팅 요청 이메일을 써줘', '감사 이메일 초안을 써줘'] },
  { label: '계약서 분석',  desc: '계약 조항 위험 요소 식별 및 요약',          icon: FileText,  color: '#10B981', bg: '#ECFDF5',
    starters: ['이 계약서의 불리한 조항을 찾아줘', '핵심 조항만 요약해줘', '위험 조항에 대안을 제안해줘'] },
];

// 레거시 — ShortcutCard에서 계속 사용
const SHORTCUTS = POPULAR_ASSISTANTS;

function ShortcutCard({ label, desc, icon: Icon, color, bg, colored, onClick }: { label: string; desc: string; icon: LucideIcon; color: string; bg: string; starters: string[]; isNew?: boolean; colored?: boolean; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const iconColored = colored || hovered;
  return (
    <Tooltip label="클릭하면 바로 대화" position="top">
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex flex-col items-center text-center px-3 pt-4 pb-3 rounded-xl border transition-all duration-200"
      style={{
        backgroundColor: hovered
          ? (isDark ? `${color}22` : bg)
          : (isDark ? '#252237' : 'white'),
        borderColor: hovered ? `${color}55` : (isDark ? '#2E2B47' : '#E4E2F0'),
        boxShadow: hovered ? `0 4px 16px 0 ${color}22` : (colored ? `0 2px 8px 0 ${color}18` : 'none'),
        minHeight: '140px',
      }}
    >
      {/* icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200 shrink-0"
        style={{ backgroundColor: iconColored ? (isDark ? `${color}33` : bg) : (isDark ? '#1A1726' : '#F4F3FC') }}
      >
        <Icon
          className="w-5 h-5 transition-colors duration-200"
          strokeWidth={1.8}
          style={{ color: iconColored ? color : '#A8A6C0' }}
        />
      </div>
      {/* label */}
      <span className="mt-2 text-sm font-semibold text-[#1A1826] leading-snug whitespace-nowrap">{label}</span>
      {/* desc — always visible */}
      <span className="mt-0.5 text-[10.5px] text-[#A8A6C0] leading-snug w-full px-1 break-keep line-clamp-2">
        {desc}
      </span>
    </button>
    </Tooltip>
  );
}

export default function HomeView({
  onOpenBriefing,
  onSubmit,
  onStartWithAssistant,
  savedItems = [],
  savedPanelOpen = false,
  onToggleSavedPanel,
  onToggleSidebar,
  sidebarOpen = true,
  notifPanelOpen = false,
  notifUnread = 0,
  onToggleNotifPanel,
  assistantOrder,
  onOpenOnboarding,
  onNavigate,
}: {
  onOpenBriefing?: () => void;
  onSubmit?: (text: string) => void;
  onStartWithAssistant?: (ctx: { name: string; starters: string[]; desc?: string }, initialQuery?: string) => void;
  savedItems?: SavedItem[];
  savedPanelOpen?: boolean;
  onToggleSavedPanel?: () => void;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
  notifPanelOpen?: boolean;
  notifUnread?: number;
  onToggleNotifPanel?: () => void;
  assistantOrder?: string[];
  onOpenOnboarding?: () => void;
  onNavigate?: (view: 'home' | 'market') => void;
}) {
  const [mode, setMode] = useState<number | null>(null);
  const [value, setValue] = useState('');

  interface FileEntry { id: number; file: File; status: 'indexing' | 'done'; progress: number; }
  const [attachedFiles, setAttachedFiles] = useState<FileEntry[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(0);

  const fmtSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  };
  const fileAccent = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return { bg: '#FFF7ED', text: '#EA580C' };
    if (['pdf'].includes(ext)) return { bg: '#FEF2F2', text: '#DC2626' };
    if (['xlsx','xls','csv'].includes(ext)) return { bg: '#F0FDF4', text: '#16A34A' };
    if (['docx','doc','hwp','hwpx'].includes(ext)) return { bg: '#EFF6FF', text: '#2563EB' };
    if (['pptx','ppt'].includes(ext)) return { bg: '#FFF7ED', text: '#D97706' };
    if (['zip','7z','tar','gz'].includes(ext)) return { bg: '#F5F3FF', text: '#7C3AED' };
    return { bg: '#F3F4F6', text: '#6B7280' };
  };

  /* 임베딩 애니메이션 — 새 파일마다 200ms 스태거로 병렬 시작 */
  useEffect(() => {
    const indexing = attachedFiles.filter(f => f.status === 'indexing');
    if (!indexing.length) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    indexing.forEach((entry, i) => {
      const duration = 1200 + Math.random() * 1000;
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
              : f)
          );
          if (progress >= 100) clearInterval(iv);
        }, tick);
        timers.push(iv as unknown as ReturnType<typeof setTimeout>);
      }, i * 200);
      timers.push(t);
    });
    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachedFiles.map(f => f.id).join(',')]);

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
  const removeFile = (id: number) => setAttachedFiles(prev => prev.filter(f => f.id !== id));

  const doSubmit = () => {
    if (!value.trim() && attachedFiles.length === 0) return;
    if (selectedAssistant) {
      onStartWithAssistant?.(
        { name: selectedAssistant, starters: MODE_STARTERS[selectedAssistant] ?? [], desc: undefined },
        value.trim(),
      );
    } else {
      onSubmit?.(value.trim());
    }
    setValue('');
    setAttachedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'official' | 'mine' | 'popular'>('official');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!assistantOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setAssistantOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [assistantOpen]);

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
              <Sparkles className="w-3.5 h-3.5" strokeWidth={1.8} />
              <span className="hidden sm:inline">브리핑</span>
            </button>
          </Tooltip>
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
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-10 pb-6 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>

        {/* Hero */}
        <div className="text-center mb-7">
          <h1 className="font-bold tracking-tight leading-[1.08]">
            <span className="block text-[53px] text-[#1A1826]">무엇을</span>
            <span className="block text-[53px]" style={{
              background: 'linear-gradient(120deg, #4F46E5 0%, #7C6FF7 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              만들어볼까요?
            </span>
          </h1>
        </div>

        {/* 이용 안내 트리거 */}
        <button type="button" onClick={onOpenOnboarding}
          className="flex items-center gap-2 mb-5 px-4 py-2 rounded-full border border-[#E4E2F0] bg-white hover:border-[#C7C3F7] hover:bg-[#F4F3FC] hover:shadow-sm transition-all group text-sm text-[#6B6882] hover:text-[#4F46E5]">
          <span className="flex items-center gap-1.5">
            <span className="text-base">✨</span>
            <span className="font-semibold">이용 안내</span>
          </span>
          <span className="text-[#C7C3F7] group-hover:text-[#A8A6C0]">—</span>
          <span className="text-[#A8A6C0] group-hover:text-[#6B6882]">일반대화 · 데이터질의 · 비서 만들기 · 비서 사용법</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#C7C3F7] group-hover:text-[#4F46E5] group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
        </button>

        {/* Input */}
        <div className="w-full max-w-2xl mb-6">
          <div className="bg-white rounded-2xl border border-[#E4E2F0] shadow-sm hover:border-[#C7C3F7] focus-within:border-[#4F46E5] focus-within:shadow-[0_0_0_3px_rgba(79,70,229,0.08)] transition-all">
            {/* 첨부 파일 칩 */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 px-4 pt-3 pb-1">
                {attachedFiles.map(entry => {
                  const { bg, text } = fileAccent(entry.file.name);
                  const ext = entry.file.name.split('.').pop()?.toUpperCase() ?? 'FILE';
                  const isDone = entry.status === 'done';
                  return (
                    <div key={entry.id}
                      className="relative flex flex-col gap-1 pl-2.5 pr-1.5 pt-1.5 pb-1 rounded-lg border overflow-hidden transition-all group/chip"
                      style={{ borderColor: isDone ? `${text}33` : `${text}55`, background: bg, minWidth: 140, maxWidth: 200 }}>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black tracking-wide leading-none px-1.5 py-0.5 rounded-md shrink-0"
                          style={{ background: text, color: '#fff' }}>{ext}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold leading-tight truncate" style={{ color: text }}>{entry.file.name}</p>
                          <p className="text-[10px] leading-tight" style={{ color: `${text}99` }}>{fmtSize(entry.file.size)}</p>
                        </div>
                        {isDone ? (
                          <button type="button" onClick={() => removeFile(entry.id)}
                            className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 opacity-40 group-hover/chip:opacity-100 transition-opacity"
                            style={{ background: `${text}22` }}>
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 2l6 6M8 2L2 8" stroke={text} strokeWidth="1.8" strokeLinecap="round"/>
                            </svg>
                          </button>
                        ) : (
                          <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: `${text}15` }}>
                            <svg className="animate-spin" width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <circle cx="5" cy="5" r="3.5" stroke={`${text}33`} strokeWidth="2"/>
                              <path d="M5 1.5A3.5 3.5 0 0 1 8.5 5" stroke={text} strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="h-[3px] rounded-full overflow-hidden" style={{ background: `${text}18` }}>
                        <div className="h-full rounded-full transition-all duration-75"
                          style={{
                            width: `${entry.progress}%`,
                            background: isDone
                              ? `linear-gradient(90deg, ${text}aa, ${text})`
                              : `linear-gradient(90deg, ${text}66, ${text})`,
                          }} />
                      </div>
                      <p className="text-[8.5px] font-semibold leading-none" style={{ color: `${text}88` }}>
                        {isDone ? '✓ 임베딩 완료' : `벡터 인덱싱 중… ${entry.progress}%`}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSubmit(); }
              }}
              className="w-full px-5 pt-4 pb-2 bg-transparent border-none outline-none text-[#1A1826] placeholder:text-[#A8A6C0] resize-none text-base leading-relaxed"
              placeholder="작업을 설명하거나, 질문하거나, 파일을 첨부하세요..."
              rows={3} aria-label="메시지 입력"
            />
            <div className="flex items-center justify-between px-4 pb-3">
              <div className="flex items-center gap-0.5">
                <input
                  id="home-file-attach"
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <Tooltip label="파일 첨부">
                  <label
                    htmlFor="home-file-attach"
                    className={`cursor-pointer p-1.5 rounded-lg transition-colors flex items-center justify-center ${
                      attachedFiles.length > 0
                        ? 'text-[#4F46E5] bg-[#EEEEFF]'
                        : 'text-[#A8A6C0] hover:text-[#4F46E5] hover:bg-[#F4F3FC]'
                    }`}>
                    <Paperclip className="w-[15px] h-[15px]" strokeWidth={1.8} />
                  </label>
                </Tooltip>
                {attachedFiles.length > 0 && (
                  <span className="text-[11px] font-semibold text-[#4F46E5] ml-0.5">{attachedFiles.length}</span>
                )}

                {/* 비서 선택 */}
                <div className="relative" ref={dropdownRef}>
                  <button type="button" onClick={() => setAssistantOpen(v => !v)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11.5px] font-semibold transition-all border ${
                      selectedAssistant
                        ? 'bg-[#EEEEFF] border-[#C7C3F7] text-[#4F46E5]'
                        : assistantOpen
                          ? 'bg-[#F4F3FC] border-[#C7C3F7] text-[#4F46E5]'
                          : 'bg-transparent border-transparent text-[#A8A6C0] hover:text-[#4F46E5] hover:bg-[#F4F3FC]'
                    }`}>
                    <Users className="w-3.5 h-3.5 shrink-0" strokeWidth={1.8} />
                    <span>{selectedAssistant ?? '비서 선택'}</span>
                    <ChevronDown className="w-3 h-3 shrink-0 transition-transform" style={{ transform: assistantOpen ? 'rotate(180deg)' : 'none' }} />
                  </button>
                  {assistantOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-xl border border-[#E4E2F0] shadow-lg overflow-hidden z-30">
                      {[...(assistantOrder && assistantOrder.length > 0 ? assistantOrder : MODES)].reverse().map(a => (
                        <button key={a} type="button"
                          onClick={() => { setSelectedAssistant(selectedAssistant === a ? null : a); setAssistantOpen(false); }}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 text-left text-[12.5px] font-medium transition-colors ${
                            selectedAssistant === a ? 'bg-[#EEEEFF] text-[#4F46E5]' : 'text-[#1A1826] hover:bg-[#F9F8FF]'
                          }`}>
                          {selectedAssistant === a
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-[#4F46E5] shrink-0" strokeWidth={2} />
                            : <div className="w-3.5 h-3.5 shrink-0" />}
                          {a}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Tooltip label="메시지 전송 (Enter)">
                <button type="button" aria-label="전송" onClick={doSubmit}
                  className="w-8 h-8 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] flex items-center justify-center text-white transition-colors shadow-sm shadow-[#4F46E5]/25">
                  <ArrowUp className="w-4 h-4" strokeWidth={2} />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>



        {/* 비서 탭 */}
        <div className="w-full max-w-2xl mt-8">
          {/* 탭 헤더 */}
          <div className="flex items-center gap-1 mb-4 bg-[#F4F3FC] rounded-xl p-1">
            {([ 
              { key: 'official', label: '공식 비서' },
              { key: 'mine',     label: '내가 만든 비서' },
              { key: 'popular',  label: '많이 쓰는 비서' },
            ] as const).map(tab => (
              <button key={tab.key} type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-150 ${
                  activeTab === tab.key
                    ? 'bg-[#FAFAFE] text-[#4F46E5] shadow-sm'
                    : 'text-[#6B6882] hover:text-[#4F46E5]'
                }`}>
                {tab.label}
                {tab.key === 'official' && (
                  <span className="ml-1.5 inline-flex items-center px-1 py-0.5 rounded-full bg-[#4F46E5] text-white align-middle">
                    <Star className="w-2.5 h-2.5" />
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* 탭 컨텐츠: 4개씩 최대 2줄(8개) */}
          {(() => {
            const list =
              activeTab === 'official' ? OFFICIAL_ASSISTANTS :
              activeTab === 'mine'     ? MY_ASSISTANTS :
              POPULAR_ASSISTANTS;
            const visible = list.slice(0, 8);
            return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3" style={{ minHeight: 260 }}>
                {visible.map((s) => (
                  <div key={s.label} className="relative">
                    {activeTab === 'official' && s.isNew && (
                      <span className="absolute -top-1.5 -right-1.5 z-10 px-1.5 py-0.5 rounded-full bg-[#EF4444] text-white text-[10px] font-bold leading-none">
                        NEW
                      </span>
                    )}
                    <ShortcutCard {...s}
                      onClick={() => onStartWithAssistant?.({ name: s.label, starters: s.starters, desc: s.desc })}
                    />
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

      </div>
    </div>
  );
}