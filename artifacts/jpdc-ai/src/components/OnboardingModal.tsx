import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MessageSquare, Hash, Sparkles, Bot, Check, Send, Paperclip, Tag, Store, Plus, Search, BarChart2, Calendar, Mail, FileText, Code, Globe, PenTool, Zap, Layers, Shield } from 'lucide-react';

/* ─── 큰 말풍선 (스크린샷 오버레이용) ─────────────────────── */
function ScreenBubble({
  children,
  color = '#4F46E5',
  tail = 'bottom-left',
  className = '',
}: {
  children: React.ReactNode;
  color?: string;
  tail?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'left' | 'right';
  className?: string;
}) {
  const tails: Record<string, string> = {
    'bottom-left':  'after:absolute after:bottom-[-12px] after:left-6 after:border-[8px] after:border-transparent after:border-t-[color:var(--bubble-color)]',
    'bottom-right': 'after:absolute after:bottom-[-12px] after:right-6 after:border-[8px] after:border-transparent after:border-t-[color:var(--bubble-color)]',
    'top-left':     'after:absolute after:top-[-12px]    after:left-6 after:border-[8px] after:border-transparent after:border-b-[color:var(--bubble-color)]',
    'top-right':    'after:absolute after:top-[-12px]    after:right-6 after:border-[8px] after:border-transparent after:border-b-[color:var(--bubble-color)]',
    'left':         'after:absolute after:left-[-12px]   after:top-1/2 after:-translate-y-1/2 after:border-[8px] after:border-transparent after:border-r-[color:var(--bubble-color)]',
    'right':        'after:absolute after:right-[-12px]  after:top-1/2 after:-translate-y-1/2 after:border-[8px] after:border-transparent after:border-l-[color:var(--bubble-color)]',
  };
  return (
    <div
      className={`relative inline-flex items-center px-4 py-2.5 rounded-2xl text-white font-bold text-[13px] leading-snug shadow-xl ${tails[tail]} ${className}`}
      style={{ backgroundColor: color, ['--bubble-color' as string]: color }}
    >
      {children}
    </div>
  );
}

/* ─── 앱 외형 프레임 (스크린샷처럼 보이는 미니 UI) ─── */
function AppFrame({ children, title = '' }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="flex w-full h-full overflow-hidden rounded-xl border border-[#2A2740] shadow-2xl">
      {/* 사이드바 */}
      <div className="w-[130px] shrink-0 bg-[#F9F8FF] border-r border-[#E4E2F0] flex flex-col">
        {/* 헤더 */}
        <div className="h-8 flex items-center gap-1.5 px-2 border-b border-[#E4E2F0]">
          <div className="w-4 h-4 rounded bg-[#4F46E5] flex items-center justify-center">
            <span className="text-[7px] font-black text-white">J</span>
          </div>
          <span className="text-[9px] font-bold text-[#1A1826]">JPDC AI</span>
          <Search className="w-2.5 h-2.5 text-[#C7C3F7] ml-auto" strokeWidth={2} />
        </div>
        {/* 버튼 */}
        <div className="px-2 pt-2 space-y-1">
          <div className="flex items-center gap-1 px-1.5 py-1 rounded-md bg-[#4F46E5] text-white">
            <Plus className="w-2.5 h-2.5" strokeWidth={2.5} />
            <span className="text-[8.5px] font-bold">새 대화 시작</span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-1 rounded-md hover:bg-[#EEEEFF]">
            <Store className="w-2.5 h-2.5 text-[#A8A6C0]" strokeWidth={1.8} />
            <span className="text-[8.5px] font-semibold text-[#6B6882]">비서마켓</span>
          </div>
        </div>
        {/* 히스토리 */}
        <div className="px-2 pt-3 space-y-0.5">
          <p className="text-[7px] font-semibold text-[#A8A6C0] uppercase tracking-widest mb-1">오늘</p>
          {['공공기관 보안 지침…', '계약 협상 단가…'].map(t => (
            <div key={t} className="px-1.5 py-1 rounded-md text-[7.5px] text-[#6B6882] line-clamp-2 leading-snug">{t}</div>
          ))}
          <p className="text-[7px] font-semibold text-[#A8A6C0] uppercase tracking-widest mt-2 mb-1">어제</p>
          {['대외비 문서 결재…', '감사 결과 보고서…', '회의록 작성 잘…'].map(t => (
            <div key={t} className="px-1.5 py-1 rounded-md text-[7.5px] text-[#6B6882] line-clamp-1">{t}</div>
          ))}
        </div>
        {/* 사용자 */}
        <div className="mt-auto border-t border-[#E4E2F0] px-2 py-2 flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-[#4F46E5] flex items-center justify-center text-[8px] font-bold text-white">김</div>
          <span className="text-[8px] font-semibold text-[#1A1826]">김동현</span>
        </div>
      </div>
      {/* 메인 */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* 탑바 */}
        <div className="h-8 border-b border-[#E4E2F0] flex items-center px-3 shrink-0">
          <span className="text-[9px] font-semibold text-[#1A1826]">{title}</span>
        </div>
        <div className="flex-1 overflow-hidden relative">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─── 비주얼 1: 일반 대화 ─── */
function ChatVisual() {
  return (
    <AppFrame title="새 대화">
      <div className="flex flex-col h-full">
        {/* 채팅 영역 */}
        <div className="flex-1 px-3 py-3 space-y-2 overflow-hidden">
          <div className="flex justify-end">
            <div className="bg-[#4F46E5] text-white rounded-xl rounded-tr-sm px-2.5 py-1.5 text-[9px] max-w-[180px] leading-relaxed">
              보도자료 초안을 작성해줘
            </div>
          </div>
          <div className="flex gap-1.5">
            <div className="w-5 h-5 rounded-full bg-[#EEF0FF] flex items-center justify-center shrink-0">
              <Sparkles className="w-2.5 h-2.5 text-[#4F46E5]" strokeWidth={1.8} />
            </div>
            <div className="bg-[#F9F8FF] border border-[#E4E2F0] rounded-xl rounded-tl-sm px-2.5 py-1.5 text-[9px] text-[#4B4A63] max-w-[200px] leading-relaxed">
              물론입니다! 신제품 출시 보도자료를 작성할게요. 제품명과 주요 특징을 알려주시면 바로 시작하겠습니다. 📝
            </div>
          </div>
          <div className="flex justify-end pr-1 pointer-events-none">
            <ScreenBubble color="#4F46E5" tail="bottom-right" className="text-[11px]">
              Enter로 바로 전송!
            </ScreenBubble>
          </div>
          <div className="flex justify-end">
            <div className="bg-[#4F46E5] text-white rounded-xl rounded-tr-sm px-2.5 py-1.5 text-[9px] max-w-[180px]">
              출장 계획서 제출 서류 알려줘
            </div>
          </div>
          <div className="flex gap-1.5">
            <div className="w-5 h-5 rounded-full bg-[#EEF0FF] flex items-center justify-center shrink-0">
              <Sparkles className="w-2.5 h-2.5 text-[#4F46E5]" strokeWidth={1.8} />
            </div>
            <div className="flex gap-0.5 items-center bg-[#F9F8FF] border border-[#E4E2F0] rounded-xl px-2.5 py-1.5">
              {[0,1,2].map(i => <div key={i} className="w-1 h-1 rounded-full bg-[#C7C3F7] animate-bounce" style={{animationDelay:`${i*0.15}s`}} />)}
            </div>
          </div>
        </div>
        {/* 입력창 */}
        <div className="px-3 pb-3 shrink-0">
          <div className="bg-white border border-[#E4E2F0] rounded-xl flex items-center gap-2 px-2.5 py-1.5 shadow-sm">
            <Paperclip className="w-3 h-3 text-[#C7C3F7]" strokeWidth={1.8} />
            <span className="flex-1 text-[8.5px] text-[#A8A6C0]">작업을 설명하거나 질문하세요...</span>
            <div className="w-5 h-5 rounded-lg bg-[#4F46E5] flex items-center justify-center">
              <Send className="w-2.5 h-2.5 text-white" strokeWidth={2} />
            </div>
          </div>
        </div>
      </div>

      {/* 말풍선 오버레이 — 입력창 위 */}
      <div className="absolute bottom-[52px] right-[200px] pointer-events-none">
        <ScreenBubble color="#4F46E5" tail="bottom-right" className="text-[12px]">
          자연어로 자유롭게 질문하세요 💬
        </ScreenBubble>
      </div>
      <div className="absolute bottom-12 left-3 pointer-events-none" style={{display:'none'}}>{/* 기존 Enter 버블 제거 */}
      </div>
    </AppFrame>
  );
}

/* ─── 비주얼 2: 일반 질의 (실제 스크린샷) ─── */
function RagVisual() {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl">
      <img
        src="/jpdc-ai/onboarding/tag-rag.png"
        alt="일반 질의 + 추천 비서"
        className="w-full h-full object-cover object-top"
        draggable={false}
      />
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute top-[68px] right-[88px] pointer-events-none">
        <ScreenBubble color="#0891B2" tail="top-right" className="text-[12px] whitespace-nowrap">
          일반 질의 데이터질의로 규정·법령 기반 답변을 받아요 📄
        </ScreenBubble>
      </div>
      <div className="absolute bottom-4 left-[200px] pointer-events-none">
        <ScreenBubble color="#0891B2" tail="bottom-left" className="text-[12px] whitespace-nowrap">
          연관 비서를 자동으로 추천해 드려요 🤖
        </ScreenBubble>
      </div>
    </div>
  );
}

/* ─── 비주얼 3: 데이터질의 대화 (실제 스크린샷) ─── */
function TagVisual() {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl">
      <img
        src="/jpdc-ai/onboarding/tag-split.png"
        alt="데이터질의 분할 결과 화면"
        className="w-full h-full object-cover object-top"
        draggable={false}
      />
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <ScreenBubble color="#7C3AED" tail="bottom-left" className="text-[12px] whitespace-nowrap">
          속성을 변경할 수 있어요 🏷️
        </ScreenBubble>
      </div>
      <div className="absolute bottom-4 left-[200px] pointer-events-none">
        <ScreenBubble color="#7C3AED" tail="top-left" className="text-[12px]">
          분할 데이터질의는 결과를 2가지 관점으로 동시에 분석해요
        </ScreenBubble>
      </div>
    </div>
  );
}

/* ─── 비주얼 3: 비서 만들기 (실제 스크린샷 3단계 순환) ─── */
const CREATE_SLIDES = [
  {
    img: '/jpdc-ai/onboarding/create-step1.png',
    alt: '내가 만든 모든 비서 탭',
    bubble: { text: '+ 나만의 비서 만들기 클릭!', color: '#0891B2', tail: 'top-right' as const, pos: 'top-[20%] right-[3%]' },
  },
  {
    img: '/jpdc-ai/onboarding/create-step2.png',
    alt: '비서 주제 입력',
    bubble: { text: '비서의 역할을 한 줄로 설명해주세요 ✏️', color: '#0891B2', tail: 'bottom-right' as const, pos: 'bottom-[25%] left-[25%]' },
  },
  {
    img: '/jpdc-ai/onboarding/create-step3.png',
    alt: '비서 초안 확인·수정',
    bubble: { text: '지침이 자동 입력되고 수정하실 수 있습니다', color: '#0891B2', tail: 'left' as const, pos: 'top-[48%] right-[3%]' },
  },
];

function CreateVisual() {
  const [step, setStep] = useState(0);

  const s = CREATE_SLIDES[step];

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl">
      {CREATE_SLIDES.map((sl, i) => (
        <img
          key={sl.img}
          src={sl.img}
          alt={sl.alt}
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-500"
          style={{ opacity: i === step ? 1 : 0 }}
        />
      ))}
      {/* 가독성 오버레이 */}
      <div className="absolute inset-0 bg-black/10" />

      {/* 좌우 화살표 네비게이션 */}
      {step > 0 && (
        <button type="button" onClick={() => setStep(p => p - 1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors z-10">
          <ChevronLeft className="w-4 h-4 text-[#4F46E5]" strokeWidth={2.5} />
        </button>
      )}
      {step < CREATE_SLIDES.length - 1 && (
        <button type="button" onClick={() => setStep(p => p + 1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors z-10">
          <ChevronRight className="w-4 h-4 text-[#4F46E5]" strokeWidth={2.5} />
        </button>
      )}

      {/* 단계 인디케이터 */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
        {CREATE_SLIDES.map((_, i) => (
          <div key={i} className="h-1.5 rounded-full transition-all duration-300"
            style={{ width: i === step ? 20 : 6, backgroundColor: i === step ? '#fff' : 'rgba(255,255,255,0.45)' }} />
        ))}
      </div>

      {/* 슬라이드 1 전용: 입력창 텍스트 오버레이 */}
      {step === 1 && (
        <div className="absolute pointer-events-none" style={{ bottom: '8.5%', left: '17%', right: '7%' }}>
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm border border-[#E4E2F0]">
            <span className="text-[11px] text-[#4B4A63] flex-1 leading-tight">
              만들고 싶은 비서의 주제를 간단히 써주세요
            </span>
            <span className="w-[3px] h-[14px] bg-[#4F46E5] rounded-full animate-pulse" />
          </div>
        </div>
      )}

      {/* 슬라이드 0 전용: 클릭 효과 — 내가 만든 모든 비서 탭에만 */}
      {step === 0 && (
        <div className="absolute pointer-events-none" style={{ top: 'calc(4% + 7px)', left: '48%' }}>
          <span className="relative flex items-center justify-center w-[84px] h-[22px]">
            <span className="animate-ping absolute inline-flex w-full h-full rounded-md bg-[#4F46E5] opacity-30" />
            <span className="relative inline-flex w-full h-full rounded-md border-2 border-[#4F46E5] opacity-70" />
          </span>
        </div>
      )}

      {/* 말풍선 */}
      <div className={`absolute ${s.bubble.pos} pointer-events-none`}>
        <ScreenBubble color={s.bubble.color} tail={s.bubble.tail} className="text-[12px] shadow-2xl whitespace-nowrap">
          {s.bubble.text}
        </ScreenBubble>
      </div>
    </div>
  );
}

/* ─── 비주얼 5: 비서 사용 (실제 스크린샷 2단계 수동 전환) ─── */
const USE_SLIDES = [
  {
    img: '/jpdc-ai/onboarding/use-step1.png',
    alt: '비서마켓 클릭',
    bubble: { text: '왼쪽 사이드바에서 비서마켓을 클릭하세요 🏪', color: '#16A34A', tail: 'top-left' as const, pos: 'top-[23%] left-[3%]' },
    clickEffect: { top: 'calc(15% - 0.11mm)', left: 'calc(1.2% - 0.11mm)', w: 137, h: 22, rounded: 'rounded-md' },
  },
  {
    img: '/jpdc-ai/onboarding/use-step2.png',
    alt: '비서 카드 클릭 후 채팅 시작',
    bubble: { text: '채팅 시작을 누르면 바로 대화가 시작돼요 🚀', color: '#16A34A', tail: 'bottom-left' as const, pos: 'bottom-[18%] left-[32%]' },
    clickEffect: null,
  },
];

function UseVisual() {
  const [step, setStep] = useState(0);
  const s = USE_SLIDES[step];
  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl">
      {USE_SLIDES.map((sl, i) => (
        <img key={sl.img} src={sl.img} alt={sl.alt} draggable={false}
          className="absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-500"
          style={{ opacity: i === step ? 1 : 0 }} />
      ))}
      <div className="absolute inset-0 bg-black/10" />

      {/* 클릭 효과 */}
      {s.clickEffect && (
        <div className="absolute pointer-events-none"
          style={{ top: s.clickEffect.top, left: s.clickEffect.left }}>
          <span className={`relative flex items-center justify-center ${s.clickEffect.rounded}`}
            style={{ width: s.clickEffect.w, height: s.clickEffect.h }}>
            <span className={`animate-ping absolute inline-flex w-full h-full ${s.clickEffect.rounded} bg-[#16A34A] opacity-25`} />
            <span className={`relative inline-flex w-full h-full ${s.clickEffect.rounded} border-2 border-[#16A34A] opacity-60`} />
          </span>
        </div>
      )}

      {/* 2단계 전용: 가짜 채팅 시작 버튼 */}
      {step === 1 && (
        <div className="absolute bottom-[7%] left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ width: '54%' }}>
          <div className="relative flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-white text-[13px] font-bold shadow-lg"
            style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)' }}>
            <span>💬</span>
            <span>채팅 시작</span>
            <span className="animate-ping absolute inline-flex w-full h-full rounded-xl opacity-20"
              style={{ background: '#4F46E5' }} />
          </div>
        </div>
      )}

      {/* 화살표 네비게이션 */}
      {step > 0 && (
        <button type="button" onClick={() => setStep(p => p - 1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors z-10">
          <ChevronLeft className="w-4 h-4 text-[#16A34A]" strokeWidth={2.5} />
        </button>
      )}
      {step < USE_SLIDES.length - 1 && (
        <button type="button" onClick={() => setStep(p => p + 1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors z-10">
          <ChevronRight className="w-4 h-4 text-[#16A34A]" strokeWidth={2.5} />
        </button>
      )}

      {/* 단계 인디케이터 */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
        {USE_SLIDES.map((_, i) => (
          <div key={i} className="h-1.5 rounded-full transition-all duration-300"
            style={{ width: i === step ? 20 : 6, backgroundColor: i === step ? '#fff' : 'rgba(255,255,255,0.45)' }} />
        ))}
      </div>

      {/* 말풍선 */}
      <div className={`absolute ${s.bubble.pos} pointer-events-none`}>
        <ScreenBubble color={s.bubble.color} tail={s.bubble.tail} className="text-[12px] whitespace-nowrap shadow-2xl">
          {s.bubble.text}
        </ScreenBubble>
      </div>
    </div>
  );
}

/* ─── 스텝 정의 ─────────────────────────────────────────── */
interface StepDef {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  tips: string[];
  visual: React.ReactNode;
}

const STEPS: StepDef[] = [
  {
    icon: MessageSquare,
    iconColor: '#4F46E5',
    iconBg: '#EEF0FF',
    title: '기본 질의하기',
    subtitle: '무엇이든 자유롭게 질문해 보세요',
    tips: [
      '자연어로 질문하거나 업무를 설명하면 AI가 바로 답변합니다.',
      '파일을 첨부하면 문서 내용을 참고해 더 정확하게 답변해요.',
      'Enter로 전송, Shift+Enter로 줄바꿈합니다.',
    ],
    visual: <ChatVisual />,
  },
  {
    icon: FileText,
    iconColor: '#0891B2',
    iconBg: '#ECFEFF',
    title: '일반 질의',
    subtitle: '규정·법령 기반 정확한 답변과 추천 비서',
    tips: [
      '일반 질의 데이터질의를 선택하면 내부 규정·지침·법령을 참고해 답변합니다.',
      '참고 문서 출처가 함께 표시되어 신뢰성을 확인할 수 있어요.',
      '답변 하단에 연관 비서를 자동으로 추천해 드립니다.',
      '예시 질의 → 출장신청서 작성시 첨부서류 알려줘 / 공공기관 보안 지침 알려줘',
    ],
    visual: <RagVisual />,
  },
  {
    icon: Hash,
    iconColor: '#7C3AED',
    iconBg: '#F5F3FF',
    title: '데이터질의 대화하기',
    subtitle: '대화 유형을 지정해 더 정확한 답변을',
    tips: [
      '데이터질의를 선택하면 AI가 그 방식에 맞게 답변 방식을 바꿔줍니다.',
      '요약·번역·코드·분석 등 다양한 데이터질의를 지원합니다.',
      '@ 또는 / 를 입력하면 데이터질의를 빠르게 선택할 수 있어요.',
      '예시 질의 → 2026년 3월 삼다수 생산량이 얼마야? / 2026년 5월 삼다수 서울지역 판매금액이 궁금해.',
    ],
    visual: <TagVisual />,
  },
  {
    icon: Sparkles,
    iconColor: '#EF4444',
    iconBg: '#FEF2F2',
    title: '비서 만들기',
    subtitle: '3단계로 나만의 AI 비서를 만들어요',
    tips: [
      '주제 입력: 비서의 이름과 역할을 설명합니다.',
      '내용 입력: 지시문·규칙·예시 등 상세 내용을 작성합니다.',
      '승인 신청: 담당자 검토 후 전사·부서에 공개됩니다.',
    ],
    visual: <CreateVisual />,
  },
  {
    icon: Bot,
    iconColor: '#16A34A',
    iconBg: '#F0FDF4',
    title: '비서 사용하기',
    subtitle: '비서마켓에서 비서를 골라 바로 대화를',
    tips: [
      '왼쪽 사이드바에서 비서마켓을 클릭하면 전체 비서 목록이 열립니다.',
      '원하는 비서 카드를 클릭하면 상세 정보와 채팅 시작 버튼이 나타납니다.',
      '채팅 시작을 누르면 해당 비서와 바로 대화를 시작할 수 있어요.',
    ],
    visual: <UseVisual />,
  },
];

/* ─── 메인 모달 ─────────────────────────────────────────── */
export default function OnboardingModal({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState(0);
  const step = STEPS[current];
  const isLast = current === STEPS.length - 1;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && current < STEPS.length - 1) setCurrent(c => c + 1);
      if (e.key === 'ArrowLeft' && current > 0) setCurrent(c => c - 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [current, onClose]);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl shadow-black/25 border border-[#E4E2F0] w-full max-w-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '92vh' }}>

        {/* 닫기 */}
        <button type="button" onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-xl flex items-center justify-center text-[#A8A6C0] hover:text-[#4F46E5] hover:bg-[#EEF0FF] transition-colors">
          <X className="w-4 h-4" strokeWidth={2} />
        </button>

        {/* 헤더 */}
        <div className="px-6 pt-6 pb-0 shrink-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: step.iconBg }}>
              <step.icon className="w-5 h-5" strokeWidth={1.8} style={{ color: step.iconColor }} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#A8A6C0] uppercase tracking-widest">
                {current + 1} / {STEPS.length}
              </p>
              <h2 className="text-lg font-bold text-[#1A1826] leading-tight">{step.title}</h2>
            </div>
          </div>
          <p className="text-sm text-[#6B6882] ml-12">{step.subtitle}</p>

          {/* 진행 바 */}
          <div className="flex gap-1.5 mt-4">
            {STEPS.map((_, i) => (
              <button key={i} type="button" onClick={() => setCurrent(i)}
                className="h-1 rounded-full transition-all duration-300 cursor-pointer"
                style={{
                  flex: i === current ? 3 : 1,
                  backgroundColor: i <= current ? step.iconColor : '#E4E2F0',
                  opacity: i > current ? 0.4 : 1,
                }} />
            ))}
          </div>
        </div>

        {/* 스크린샷 비주얼 */}
        <div className="mx-6 mt-4 rounded-2xl overflow-hidden shrink-0 shadow-lg" style={{ height: 300 }}>
          {step.visual}
        </div>

        {/* 팁 */}
        <div className="px-6 pt-4 pb-2 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <ul className="space-y-2">
            {step.tips.map((tip, i) => {
              if (tip.startsWith('예시 질의 →')) {
                const queries = tip.replace('예시 질의 → ', '').split(' / ');
                return (
                  <li key={i} className="mt-1 rounded-xl border p-3 space-y-1.5"
                    style={{ borderColor: `${step.iconColor}33`, backgroundColor: `${step.iconColor}0D` }}>
                    <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: step.iconColor }}>예시 질의</p>
                    {queries.map((q, qi) => (
                      <div key={qi} className="flex items-center gap-2 rounded-lg px-3 py-1.5 bg-white shadow-sm border"
                        style={{ borderColor: `${step.iconColor}22` }}>
                        <span className="text-base leading-none" style={{ color: step.iconColor }}>💬</span>
                        <p className="text-[12.5px] font-medium text-[#2D2B45] leading-snug">{q}</p>
                      </div>
                    ))}
                  </li>
                );
              }
              return (
                <li key={i} className="flex gap-2.5 items-start">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-px text-[10px] font-bold text-white"
                    style={{ backgroundColor: step.iconColor }}>
                    {i + 1}
                  </div>
                  <p className="text-sm text-[#4B4A63] leading-snug">{tip}</p>
                </li>
              );
            })}
          </ul>
        </div>

        {/* 네비게이션 */}
        <div className="px-6 py-4 border-t border-[#F0EEF8] flex items-center justify-between shrink-0">
          <button type="button"
            onClick={() => current > 0 ? setCurrent(c => c - 1) : onClose()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-[#6B6882] hover:text-[#4F46E5] hover:bg-[#F4F3FC] transition-colors">
            {current > 0 ? <><ChevronLeft className="w-4 h-4" strokeWidth={2} />이전</> : <>건너뛰기</>}
          </button>

          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <button key={i} type="button" onClick={() => setCurrent(i)}
                className="rounded-full transition-all duration-200"
                style={{
                  width: i === current ? 20 : 6,
                  height: 6,
                  backgroundColor: i === current ? step.iconColor : '#E4E2F0',
                }} />
            ))}
          </div>

          <button type="button"
            onClick={() => isLast ? onClose() : setCurrent(c => c + 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-colors"
            style={{ backgroundColor: step.iconColor }}>
            {isLast ? <>시작하기 <Check className="w-4 h-4" strokeWidth={2.5} /></> : <>다음 <ChevronRight className="w-4 h-4" strokeWidth={2} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
