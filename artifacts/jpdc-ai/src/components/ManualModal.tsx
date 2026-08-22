import { useState, useEffect, useRef } from 'react';
import { X, BookOpen, Sparkles, ArrowUp, ChevronRight } from 'lucide-react';

/* ─── 지식 베이스 ───────────────────────────────────────────── */
interface KBEntry {
  id: string;
  keywords: string[];
  title: string;
  answer: string;
}

const KB: KBEntry[] = [
  {
    id: 'home',
    keywords: ['홈', '랜딩', '시작', '메인', '처음', '첫 화면', '홈 화면'],
    title: '홈 화면 (랜딩페이지)',
    answer: `홈 화면은 JPDC AI의 시작 화면입니다.

**주요 구성**
• **질의 입력창** — 상단 중앙에 위치, 자연어로 질문하거나 업무를 설명하면 됩니다.
• **비서 선택** — 입력창 하단 "비서 선택" 드롭다운으로 전문 비서를 지정해 질의할 수 있습니다.
• **파일 첨부** — 📎 버튼으로 다중 파일 첨부, 첨부 시 벡터 인덱싱이 진행됩니다.
• **브리핑 버튼** — 우상단에서 오늘의 AI 브리핑 패널을 열 수 있습니다.
• **알림 버튼** — 공지·시스템 메시지를 확인합니다.
• **비서 바로가기 탭** — 공식 비서 / 내가 만든 비서 / 많이 쓰는 비서로 구성된 3탭 카드입니다.`,
  },
  {
    id: 'assistant-tab',
    keywords: ['비서 탭', '공식 비서', '내가 만든 비서', '많이 쓰는', '바로가기', '탭', '비서 카드'],
    title: '비서 바로가기 탭',
    answer: `홈 화면 하단에 3개 탭으로 비서를 빠르게 선택할 수 있습니다.

**탭 구성**
• **공식 비서** — JPDC 공식 제공 비서 목록. NEW 배지가 있는 최신 비서를 확인하세요.
• **내가 만든 비서** — 내가 직접 만든 커스텀 비서 목록입니다.
• **많이 쓰는 비서** — 조직 내 사용 빈도가 높은 비서를 추천합니다.

비서 카드를 클릭하면 해당 비서와 즉시 대화를 시작합니다.`,
  },
  {
    id: 'chat',
    keywords: ['대화', '채팅', '질문', '전송', '메시지', 'enter', '입력', '답변 받기', '질의'],
    title: '대화 (채팅) 기능',
    answer: `JPDC AI와 자연어로 대화하는 핵심 기능입니다.

**사용 방법**
• 입력창에 질문이나 업무 요청을 입력합니다.
• **Enter** 키 또는 ↑ 전송 버튼으로 전송합니다.
• **Shift + Enter** 로 줄바꿈합니다.

**질의 유형 자동 분류**
• 지침 질의 / 비서 선택 / TAG 통계 / 미식별 등으로 자동 분류되어 최적 답변 형식으로 제공됩니다.

**답변 후 가능한 액션**
• 복사 · 저장 · 좋아요/싫어요 피드백을 남길 수 있습니다.`,
  },
  {
    id: 'file-attach',
    keywords: ['파일', '첨부', '업로드', '클립', '임베딩', '벡터', '인덱싱', '문서', 'pdf', 'hwp', 'excel'],
    title: '파일 첨부 & 임베딩',
    answer: `입력창 좌하단의 📎 버튼으로 파일을 첨부할 수 있습니다.

**지원 형식**
• 이미지 (JPG, PNG, WebP 등), PDF, Word (DOCX/HWP), Excel (XLSX/CSV), PowerPoint, ZIP 등 다양한 형식 지원

**다중 첨부**
• 한 번에 여러 파일 선택 가능. 동일 파일명은 중복 첨부되지 않습니다.

**임베딩 처리**
• 첨부된 파일마다 **벡터 인덱싱** 진행 상태가 칩으로 표시됩니다.
• 파일별로 병렬 처리되며 진행률(%)과 스피너로 확인할 수 있습니다.
• "✓ 임베딩 완료"가 표시되면 해당 파일 내용을 AI가 참조할 준비가 된 것입니다.
• 칩의 ✕ 버튼으로 개별 파일을 제거할 수 있습니다.`,
  },
  {
    id: 'feedback',
    keywords: ['피드백', '좋아요', '싫어요', '별점', '평가', '사유', '도움', '부적절', '만족'],
    title: '답변 피드백',
    answer: `답변 하단 액션바에서 품질 피드백을 남길 수 있습니다.

**피드백 단계**
1. 👍 좋아요 또는 👎 싫어요 버튼 클릭
2. **별점 선택** — 1~5점 (좋아요: "조금 도움됨~매우 도움됨" / 싫어요: "조금 아쉬움~매우 부적절")
3. **사유 칩 선택** — 정확성 · 출처 · 관련성 · 완결성 · 최신성 · 데이터 · 형식 · 실행가능성 중 복수 선택 가능
4. 추가 의견을 텍스트로 입력 후 제출

피드백은 AI 품질 개선에 활용됩니다.`,
  },
  {
    id: 'copy-save',
    keywords: ['복사', '저장', '저장된 답변', '북마크', '클립보드'],
    title: '답변 복사 & 저장',
    answer: `AI 답변 하단 액션바에서 다음 작업이 가능합니다.

**복사**
• 📋 복사 버튼 클릭 시 답변 전체가 클립보드에 복사됩니다.

**저장**
• 🔖 저장 버튼 클릭 시 "저장된 답변" 패널에 추가됩니다.
• 우상단 저장 패널 아이콘으로 저장 목록 전체를 확인할 수 있습니다.`,
  },
  {
    id: 'assistant-in-chat',
    keywords: ['비서 선택', '대화 중 비서', '전문 비서', '회의록 비서', '번역', '이메일', '비서 드롭다운'],
    title: '대화 중 비서 선택',
    answer: `입력창 하단 "비서 선택" 드롭다운으로 전문 비서를 지정해 질의할 수 있습니다.

**내장 비서 목록**
• **회의록 문장정리** — 회의 내용 입력 후 정리된 회의록 생성
• **이메일 문체변경** — 격식체·비격식체·영문 변환
• **번역** — 한·영·일 등 다국어 번역
• **보도자료** — 언론 배포용 문체 작성

비서를 선택한 상태에서 입력 전송 시 해당 비서 컨텍스트로 답변이 생성됩니다. 재클릭으로 선택 해제됩니다.`,
  },
  {
    id: 'builder',
    keywords: ['비서 만들기', '만들기', '생성', '커스텀 비서', '지침', '지침 작성', '도구', '공개', '비서 설정', '새 비서'],
    title: '비서 만들기',
    answer: `사이드바 하단 Store 아이콘 또는 마켓에서 "비서 만들기" 버튼으로 진입합니다.

**입력 항목**
• **이름** (필수) — 비서의 이름 (30자 이내)
• **설명** — 비서의 역할 요약 (80자 이내)
• **카테고리** — 업무·법률·분석 등 분류 태그 선택
• **아이콘** — 📎 아이콘 선택 모달에서 Google Material Icons 중 선택 + 배경색 지정
• **지침(Instructions)** (필수) — 비서의 역할, 전문성, 응답 방식, 불확실 시 처리 등 상세 지침 작성
• **도구** — 웹 검색 / 코드 실행 / 파일 분석 활성화 여부 설정
• **공개 설정** — 나만 보기 / 팀 공유 / 전체 공개 선택

작성 완료 후 하단 "저장" 버튼으로 비서가 생성됩니다.`,
  },
  {
    id: 'icon-picker',
    keywords: ['아이콘', '아이콘 선택', '그림', '색상', '배경색', '한글 아이콘', 'material icons'],
    title: '아이콘 선택',
    answer: `비서 만들기 화면의 아이콘 영역을 클릭하면 아이콘 선택 모달이 열립니다.

**기능**
• **검색** — 한글(책, 사람, 설정…) 또는 영문(book, person…)으로 아이콘 검색
• **카테고리 탭** — 전체·인터페이스·장치·통신·알림·파일 등 카테고리별 필터
• **배경 색상** — 상단 색상 팔레트에서 선택 시 모든 아이콘에 즉시 적용
• **한글 아이콘** — 가·나·다 등 한글 문자를 아이콘으로 사용 가능
• **미리보기** — 선택한 아이콘+색상 조합을 우측에서 실시간 미리보기`,
  },
  {
    id: 'settings',
    keywords: ['개인설정', '설정', '환경설정', '프로필', '설정 모달'],
    title: '개인설정 모달',
    answer: `사이드바 하단 ⚙️ 설정 아이콘을 클릭하면 개인설정 모달이 열립니다.

**탭 구성**
• **표시** — 글꼴 크기, 언어, 다크/라이트 모드 등 화면 표시 설정
• **비서** — 즐겨쓰는 비서 활성화 여부 토글 관리
• **알림** — 알림 종류별 수신 설정
• **메모리** — 대화 기억하기 토글 및 기억 항목 관리
• **사용량** — 이번 달 AI 사용 현황 및 한도 확인`,
  },
  {
    id: 'memory',
    keywords: ['메모리', '기억', '기억하기', '기억 관리', '선호', '사실', '지침 메모리', '대화 기억'],
    title: '대화 메모리 (기억하기)',
    answer: `개인설정 → **메모리 탭**에서 관리합니다.

**대화 기억하기 토글**
• ON 상태에서 AI가 대화 중 드러난 선호·사실을 자동으로 저장합니다.
• OFF 시 기존 기억 목록은 유지되지만 새로운 기억이 추가되지 않습니다.

**기억 유형**
• **지침** (보라) — "답변은 항상 표로 정리해 준다" 등 AI 행동 지침
• **사실** (회색) — 소속·담당 업무 등 사용자에 관한 사실
• **선호** (초록) — 문체·형식 등 개인 선호

**관리 기능**
• ✏️ 항목 인라인 수정 / 🗑️ 항목 삭제 / 🌐 공유 범위 변경 (전체↔비서별)
• 그룹별 + 추가 버튼으로 직접 기억 항목 추가 가능
• 하단 "모든 기억 삭제" 버튼으로 일괄 초기화`,
  },
  {
    id: 'usage',
    keywords: ['사용량', '사용 현황', '토큰', '한도', '제한', '이번 달', '잔여'],
    title: '사용량 확인',
    answer: `개인설정 → **사용량 탭**에서 이번 달 AI 사용 현황을 확인합니다.

• 총 질의 수, 토큰 소모량, 남은 한도를 시각적으로 확인할 수 있습니다.
• 한도 초과 시 관리자에게 증량을 요청할 수 있습니다.`,
  },
  {
    id: 'tag',
    keywords: ['tag', 'tag 통계', '통계', '차트', '생산량', '합계', '막대', '꺾은선', '영역', '원형', '파이', '분할', '이중'],
    title: 'TAG 통계 기능',
    answer: `생산량·비서 활용 현황 등 통계 데이터를 시각화해 보여주는 기능입니다.

**차트 유형 선택**
• TAG 통계 답변 우상단의 셀렉트 박스에서 차트 유형을 변경할 수 있습니다.
• 막대 차트 / 꺾은선 차트 / 영역 차트 / 원형(파이) 차트 중 선택

**DualTag (분할 통계)**
• "3월 생산량 합계 보여줘" 처럼 기간+항목을 지정하면 분할 통계 형태로 표시됩니다.

**비서 연계**
• TAG 통계 답변 이후 관련 비서 추천이 인라인으로 표시될 수 있습니다.`,
  },
  {
    id: 'briefing',
    keywords: ['브리핑', 'ai 브리핑', '오늘의', '뉴스', '요약', '데일리', '브리핑 패널'],
    title: 'AI 브리핑',
    answer: `홈 화면 우상단 **브리핑** 버튼(또는 대화 화면 내 브리핑 버튼)을 클릭하면 열립니다.

• 오늘의 주요 업무 이슈, 공지, AI 분석 요약을 카드 형태로 제공합니다.
• 항목 클릭 시 상세 내용을 확인할 수 있습니다.`,
  },
  {
    id: 'notif',
    keywords: ['알림', '알림 센터', '공지', '업데이트', '새 소식', '알림 패널', '미확인'],
    title: '알림 센터',
    answer: `홈·대화 화면 우상단 **알림** 버튼으로 알림 패널을 열 수 있습니다.

• 미확인 알림 수가 배지로 표시됩니다.
• 시스템 공지, 비서 업데이트, 새 기능 안내 등이 목록으로 표시됩니다.
• 개인설정 → 알림 탭에서 알림 종류별 수신 여부를 설정할 수 있습니다.`,
  },
  {
    id: 'market',
    keywords: ['마켓', '마켓플레이스', '스토어', '공식', '커뮤니티 비서', '비서 검색', '다운로드', '마켓 비서'],
    title: '비서 마켓',
    answer: `사이드바 하단 🏪 스토어 아이콘을 클릭하면 비서 마켓으로 이동합니다.

**탭 구성**
• **공식** — JPDC 공식 검증 비서. 즉시 사용 가능합니다.
• **커뮤니티** — 구성원이 공유한 비서. 평점·사용 수 확인 후 선택하세요.

비서 카드의 **사용하기** 버튼으로 내 비서 목록에 추가하거나 바로 대화를 시작할 수 있습니다.`,
  },
  {
    id: 'sidebar',
    keywords: ['사이드바', '대화 이력', '대화 목록', '검색', '이전 대화', '접기', '펼치기', '토글'],
    title: '사이드바 & 대화 이력',
    answer: `좌측 사이드바에서 대화 이력 관리 및 주요 탐색이 가능합니다.

**구성 요소**
• **새 대화** — 상단 + 버튼으로 새 대화 시작
• **검색** — 🔍 버튼으로 이전 대화 검색
• **대화 이력** — 오늘 / 어제 / 지난 7일 그룹으로 분류
• **마켓** — 🏪 아이콘으로 비서 마켓 이동
• **이용 매뉴얼** — 📖 버튼으로 현재 화면(이용 매뉴얼) 열기
• **설정** — ⚙️ 개인설정 열기 / 🌙 다크모드 전환 / 로그아웃

사이드바는 햄버거 메뉴 또는 ← 화살표로 접고 펼칠 수 있습니다.`,
  },
];

/* ─── 질의 매칭 ───────────────────────────────────────────── */
function matchQuery(q: string): KBEntry | null {
  const lower = q.toLowerCase().replace(/\s+/g, ' ');
  let best: KBEntry | null = null;
  let bestScore = 0;
  for (const entry of KB) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (lower.includes(kw.toLowerCase())) score += kw.length; // 긴 키워드에 가중치
    }
    if (score > bestScore) { bestScore = score; best = entry; }
  }
  return bestScore >= 2 ? best : null;
}

/* ─── 텍스트 렌더러 ────────────────────────────────────────── */
function RichText({ text }: { text: string }) {
  return (
    <div className="space-y-1.5">
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        // 불릿
        if (line.startsWith('• ')) {
          const content = line.slice(2);
          return (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-[#4F46E5] mt-[3px] shrink-0 text-[11px]">●</span>
              <span className="text-[14px] text-[#1A1826] leading-snug flex-1"
                dangerouslySetInnerHTML={{ __html: content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
            </div>
          );
        }
        // 볼드 헤더 (**xxx**)
        if (/^\*\*.*\*\*$/.test(line.trim())) {
          const inner = line.trim().slice(2, -2);
          return <p key={i} className="text-[13px] font-bold text-[#4F46E5] mt-2">{inner}</p>;
        }
        return (
          <p key={i} className="text-[14px] text-[#1A1826] leading-snug"
            dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
        );
      })}
    </div>
  );
}

/* ─── 타입 ────────────────────────────────────────────────── */
interface Msg {
  id: number;
  role: 'user' | 'ai';
  text?: string;
  entry?: KBEntry;
  typing?: boolean;
}

const QUICK_TOPICS = [
  { label: '홈 화면 사용법',     q: '홈 화면 어떻게 사용해?' },
  { label: '파일 첨부 & 임베딩', q: '파일 첨부하는 방법 알려줘' },
  { label: '비서 만들기',        q: '비서 만드는 방법' },
  { label: '대화 메모리',        q: '메모리 기억 기능 설명해줘' },
  { label: 'TAG 통계',           q: 'TAG 통계 차트 어떻게 사용해?' },
  { label: '피드백 남기기',      q: '답변 피드백 어떻게 남겨?' },
  { label: '개인설정',           q: '개인설정 탭 설명해줘' },
  { label: '비서 마켓',          q: '비서 마켓 사용법 알려줘' },
];

const FALLBACK = `죄송합니다, 질문을 좀 더 구체적으로 입력해 주세요.\n\n예시: "파일 첨부하는 방법", "비서 만드는 법", "메모리 기능 설명" 등으로 물어보시면 정확한 답변을 드릴 수 있어요.\n\n아래 주제 버튼을 클릭해도 됩니다.`;

let msgSeq = 0;

export default function ManualModal({ onClose }: { onClose: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: msgSeq++,
      role: 'ai',
      text: 'JPDC AI **이용 매뉴얼**입니다. 궁금한 기능이나 메뉴를 자연어로 질문해 주세요.\n\n아래 주제를 클릭하거나 직접 입력하세요.',
    },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, thinking]);

  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 80);
  }, []);

  const handleSend = (q?: string) => {
    const text = (q ?? input).trim();
    if (!text || thinking) return;
    setInput('');

    const userMsg: Msg = { id: msgSeq++, role: 'user', text };
    setMsgs(prev => [...prev, userMsg]);
    setThinking(true);

    setTimeout(() => {
      const entry = matchQuery(text);
      const aiMsg: Msg = entry
        ? { id: msgSeq++, role: 'ai', entry }
        : { id: msgSeq++, role: 'ai', text: FALLBACK };
      setMsgs(prev => [...prev, aiMsg]);
      setThinking(false);
    }, 600 + Math.random() * 400);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      {/* panel */}
      <div className="relative z-10 w-full sm:w-[700px] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-[#E4E2F0] flex flex-col overflow-hidden"
        style={{ height: '82dvh', maxHeight: '82dvh' }}>

        {/* header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E4E2F0] shrink-0 bg-gradient-to-r from-[#4F46E5]/5 to-transparent">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#7C6FF7] flex items-center justify-center shadow-sm shadow-[#4F46E5]/25">
            <BookOpen className="w-4 h-4 text-white" strokeWidth={1.8} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-[#1A1826]">이용 매뉴얼</p>
            <p className="text-[12px] text-[#A8A6C0]">기능·메뉴를 자연어로 질문하세요</p>
          </div>
          <button type="button" onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4F3FC] flex items-center justify-center hover:bg-[#E9E7FA] transition-colors">
            <X className="w-4 h-4 text-[#6B6882]" strokeWidth={2.5} />
          </button>
        </div>

        {/* 빠른 주제 칩 */}
        <div className="flex gap-1.5 overflow-x-auto px-4 py-2.5 shrink-0 border-b border-[#F0EFF8]"
          style={{ scrollbarWidth: 'none' }}>
          {QUICK_TOPICS.map(t => (
            <button key={t.label} type="button" onClick={() => handleSend(t.q)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#E4E2F0] text-[12px] font-semibold text-[#6B6882] whitespace-nowrap hover:border-[#4F46E5] hover:text-[#4F46E5] hover:bg-[#F0EEFF] transition-colors shrink-0">
              {t.label}
              <ChevronRight className="w-3 h-3 opacity-50" strokeWidth={2} />
            </button>
          ))}
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5" style={{ scrollbarWidth: 'thin' }}>
          {msgs.map(msg => (
            <div key={msg.id}>
              {msg.role === 'user' ? (
                /* 사용자 버블 (오른쪽) */
                <div className="flex justify-end">
                  <div className="max-w-[75%] bg-[#4F46E5] text-white rounded-2xl rounded-br-sm px-4 py-3 shadow-sm shadow-[#4F46E5]/20">
                    <p className="text-[14px] leading-snug whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>
              ) : (
                /* AI 버블 (왼쪽) */
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#7C6FF7] flex items-center justify-center shrink-0 shadow-sm shadow-[#4F46E5]/25 mt-0.5">
                    <Sparkles className="w-4 h-4 text-white" strokeWidth={1.8} />
                  </div>
                  <div className="max-w-[82%]">
                    {msg.entry && (
                      <div className="mb-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EEEEFF] border border-[#C7C3F7] text-[11px] font-bold text-[#4F46E5]">
                          <BookOpen className="w-3 h-3" strokeWidth={2} />
                          {msg.entry.title}
                        </span>
                      </div>
                    )}
                    <div className="bg-white border border-[#E4E2F0] rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-sm">
                      {msg.entry
                        ? <RichText text={msg.entry.answer} />
                        : <RichText text={msg.text ?? ''} />}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* 타이핑 인디케이터 */}
          {thinking && (
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#7C6FF7] flex items-center justify-center shrink-0 shadow-sm shadow-[#4F46E5]/25 mt-0.5">
                <Sparkles className="w-4 h-4 text-white" strokeWidth={1.8} />
              </div>
              <div className="bg-white border border-[#E4E2F0] rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                  <span className="text-[13px] text-[#A8A6C0]">답변을 찾는 중...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* 입력창 */}
        <div className="shrink-0 px-4 py-3 border-t border-[#E4E2F0] bg-white">
          <div className="flex gap-2 items-end bg-[#F7F6FD] rounded-2xl border border-[#E4E2F0] focus-within:border-[#4F46E5] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(79,70,229,0.08)] transition-all px-4 py-2.5">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
              placeholder="기능이나 메뉴에 대해 질문하세요... (Enter 전송)"
              rows={1}
              style={{ resize: 'none' }}
              className="flex-1 bg-transparent outline-none text-[14px] text-[#1A1826] placeholder:text-[#A8A6C0] leading-relaxed"
            />
            <button type="button" onClick={() => handleSend()}
              disabled={!input.trim() || thinking}
              className="w-7 h-7 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-40 flex items-center justify-center text-white transition-colors shadow-sm shadow-[#4F46E5]/25 shrink-0">
              <ArrowUp className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
