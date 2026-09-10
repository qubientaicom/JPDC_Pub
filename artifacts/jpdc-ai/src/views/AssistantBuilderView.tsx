import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Bot, Plus, X, Paperclip, Camera, CheckCircle2, WandSparkles } from 'lucide-react';
import IconPickerModal, { type SelectedIcon } from '../components/IconPickerModal';
import { isHanIcon, getHanChar } from '../data/materialIcons';

/* ─── 타입 ─── */
export interface DraftJson {
  name: string;
  description: string;
  instructions: string;
  prohibitions: string[];
  conversation_starters: string[];
  knowledge_files: string[];
  first_message: string;
  use_foundation_model: boolean;
}

type Step = 'chat' | 'form';

/* ─── 상수 ─── */
const CATEGORIES = ['글쓰기', '코드', '번역', '분석', '법률·회계', '업무지원', '교육', '기타'];

/* 현재 사용자에게 사용 권한이 부여된 관리자 승인 연결 목록 */
const APPROVED_MCP_SERVERS = [
  { id: 'confluence', name: 'Confluence MCP', desc: '사내 Confluence 문서 검색·편집', tag: '문서', permission: '읽기·쓰기' },
  { id: 'jira',       name: 'Jira MCP',              desc: '이슈 조회·생성·상태 변경',             tag: '이슈 트래킹', permission: '읽기·쓰기' },
  { id: 'github',     name: 'GitHub MCP',            desc: '코드 저장소 파일 읽기·PR 조회',        tag: '코드', permission: '읽기' },
  { id: 'slack',      name: 'Slack MCP',             desc: '채널·DM 메시지 검색 및 전송',          tag: '메시지', permission: '읽기·쓰기' },
  { id: 'gcal',       name: 'Google Calendar MCP',   desc: '일정 조회·생성·수정',                  tag: '캘린더', permission: '읽기·쓰기' },
  { id: 'notion',     name: 'Notion MCP',            desc: 'Notion 페이지 읽기·쓰기',              tag: '문서', permission: '읽기·쓰기' },
];

const APPROVED_APIS = [
  { id: 'erp',      name: '사내 ERP API',      desc: '인사·재무·구매 데이터 조회',         tag: '사내 시스템', permission: '읽기' },
  { id: 'approval', name: '전자결재 API',      desc: '기안·결재 현황 조회 및 상신',        tag: '사내 시스템', permission: '읽기·쓰기' },
  { id: 'dart',     name: 'DART 공시 API',     desc: '금융감독원 기업 공시 데이터',         tag: '공공데이터', permission: '읽기' },
  { id: 'publicd',  name: '공공데이터포털 API', desc: '정부 공개 통계·행정 데이터',         tag: '공공데이터', permission: '읽기' },
  { id: 'weather',  name: '기상청 날씨 API',   desc: '현재 날씨·예보 조회',                tag: '외부 서비스', permission: '읽기' },
  { id: 'map',      name: '카카오맵 API',      desc: '주소 검색·거리 계산·지도 임베딩',    tag: '외부 서비스', permission: '읽기' },
];


const DATASETS = [
  { id: 'hr2025',    name: '인사·복무 규정 2025',    desc: '취업규칙·복무·휴가 등 인사 규정 문서', docs: 312,   model: 'bge-m3' },
  { id: 'ithelpdesk',name: 'IT 헬프데스크 지식베이스', desc: '사내 시스템·계정·VPN 트러블슈팅 FAQ',   docs: 1248,  model: 'bge-m3' },
  { id: 'manual',    name: '제품 매뉴얼 전집',        desc: '전 제품 사용 설명서·스펙시트',          docs: 876,   model: 'bge-m3' },
  { id: 'legal',     name: '표준 계약서·법무 가이드',  desc: '표준 계약 양식과 법무 검토 가이드라인',  docs: 154,   model: 'text-embedding-3-large' },
  { id: 'sales',     name: '영업 플레이북',           desc: '제안서·경쟁사 비교·세일즈 토크 스크립트', docs: 421,  model: 'bge-m3' },
];


const VISIBILITY_OPTIONS = [
  { value: 'private',    label: '비공개', desc: '본인만 사용',       needsReview: false },
  { value: 'designated', label: '지정자', desc: '지정한 사람만',      needsReview: false },
  { value: 'department', label: '부서',   desc: '지정 부서 내부',     needsReview: true  },
  { value: 'division',   label: '본부',   desc: '지정 본부 내부',     needsReview: true  },
  { value: 'company',    label: '전사',   desc: '전 임직원',          needsReview: true  },
] as const;

const INPUT   = 'w-full px-3 py-2.5 rounded-xl border border-[#E4E2F0] focus:border-[#4F46E5] outline-none text-[14px] text-[#1A1826] placeholder:text-[#A8A6C0] transition-colors bg-white';
const TEXTAREA = 'w-full px-3 py-2.5 rounded-xl border border-[#E4E2F0] focus:border-[#4F46E5] outline-none text-[14px] text-[#1A1826] placeholder:text-[#A8A6C0] transition-colors resize-none bg-white leading-relaxed';

/* ─── AI 초안 생성 (모의) ─── */
function generateDraft(userInput: string): DraftJson {
  const s = userInput.toLowerCase();
  const isTranslation = /번역|영어|영문|translation/i.test(s);
  const isCode        = /코드|개발|프로그래밍|sql|api/i.test(s);
  const isWriting     = /글|문서|ppt|보고서|기획|이메일|작성/i.test(s);
  const isManual      = /매뉴얼|규정|정책|회사|사규|지침서/i.test(s);
  const isAnalysis    = /분석|데이터|통계|지표/i.test(s);

  if (isTranslation) return {
    name: '번역 비서',
    description: '문서와 텍스트를 정확하게 번역해 드리는 전문 번역 비서입니다.',
    instructions: '당신은 전문 번역 비서입니다.\n- 입력된 텍스트를 요청한 언어로 정확하게 번역합니다.\n- 문맥과 어조를 유지하며 자연스러운 표현을 사용합니다.\n- 전문 용어는 원문을 병기합니다.\n- 불확실한 표현은 대안을 함께 제시합니다.\n- 번역 후 주요 표현에 대한 간단한 설명을 덧붙입니다.',
    prohibitions: ['의미를 임의로 변경하거나 내용을 추가하지 않습니다', '원문을 생략하지 않습니다', '확인되지 않은 번역을 단정적으로 제시하지 않습니다'],
    conversation_starters: ['이 텍스트를 영어로 번역해 주세요', '한국어로 번역해 주시겠어요?', '이 이메일을 공식 영문으로 번역해 주세요', '번역 후 어조도 조정해 주세요'],
    knowledge_files: [],
    first_message: '안녕하세요! 번역이 필요한 텍스트를 붙여넣기 해 주세요. 목표 언어도 함께 알려주시면 바로 번역해 드리겠습니다.',
    use_foundation_model: true,
  };

  if (isCode) return {
    name: '코드 도우미',
    description: '코드 작성, 디버깅, 최적화를 도와드리는 개발 전문 비서입니다.',
    instructions: '당신은 전문 개발 비서입니다.\n- 코드 작성, 리뷰, 디버깅을 지원합니다.\n- 코드에는 반드시 주석을 포함합니다.\n- 에러 발생 시 원인과 해결책을 단계별로 안내합니다.\n- 더 나은 구현 방법이 있다면 이유와 함께 제안합니다.\n- 불확실한 경우 추가 정보를 요청합니다.',
    prohibitions: ['보안에 취약한 코드를 제안하지 않습니다', '검증되지 않은 라이브러리를 권장하지 않습니다', '코드 없이 설명만 제공하지 않습니다'],
    conversation_starters: ['이 코드의 버그를 찾아주세요', '파이썬으로 이 기능을 구현해 주세요', '이 코드를 최적화해 주세요', 'API 연동 코드를 작성해 주세요'],
    knowledge_files: [],
    first_message: '안녕하세요! 개발 관련 질문이나 코드를 공유해 주세요. 작성·디버깅·최적화 등 무엇이든 도와드리겠습니다.',
    use_foundation_model: true,
  };

  if (isManual) return {
    name: '매뉴얼 비서',
    description: '회사 매뉴얼과 규정을 기반으로 정확한 답변을 제공하는 비서입니다.',
    instructions: '당신은 회사 매뉴얼 기반 전문 비서입니다.\n- 업로드된 매뉴얼과 규정 문서를 우선적으로 참고합니다.\n- 문서에 없는 내용은 솔직하게 안내합니다.\n- 관련 섹션이나 페이지를 함께 안내합니다.\n- 복잡한 절차는 단계별로 설명합니다.\n- 필요시 담당 부서에 문의를 안내합니다.',
    prohibitions: ['문서에 없는 내용을 추측해 답하지 않습니다', '규정을 임의로 해석하지 않습니다', '개인 의견을 공식 입장으로 제시하지 않습니다'],
    conversation_starters: ['출장 신청 절차를 알려주세요', '연차 사용 규정이 어떻게 되나요?', '법인카드 사용 기준을 알고 싶어요', '신입사원 온보딩 체크리스트를 보여주세요'],
    knowledge_files: [],
    first_message: '안녕하세요! 회사 매뉴얼과 규정에 관한 질문에 답변드리겠습니다. 무엇이 궁금하신가요?',
    use_foundation_model: false,
  };

  if (isWriting) return {
    name: '문서 작성 비서',
    description: '보고서, 기획서, PPT 문구 등 다양한 문서 작성을 도와드리는 비서입니다.',
    instructions: '당신은 전문 문서 작성 비서입니다.\n- 요청에 맞는 형식과 문체로 문서를 작성합니다.\n- 명확하고 논리적인 구조로 내용을 구성합니다.\n- 필요시 개요부터 시작해 단계적으로 작성합니다.\n- 전문 용어는 독자 수준에 맞게 조절합니다.\n- 수정 요청 시 전체 또는 부분 수정을 모두 지원합니다.',
    prohibitions: ['사실과 다른 내용을 포함하지 않습니다', '요청과 무관한 내용을 추가하지 않습니다'],
    conversation_starters: ['주간 보고서 템플릿을 만들어 주세요', '이 내용으로 기획안을 작성해 주세요', 'PPT 슬라이드 문구를 다듬어 주세요', '이메일 초안을 작성해 주세요'],
    knowledge_files: [],
    first_message: '안녕하세요! 작성하실 문서의 종류와 목적을 알려주세요. 보고서, 기획서, 이메일, PPT 등 다양한 문서를 함께 작성해 드리겠습니다.',
    use_foundation_model: true,
  };

  if (isAnalysis) return {
    name: '데이터 분석 비서',
    description: '데이터 분석과 인사이트 도출을 도와드리는 분석 전문 비서입니다.',
    instructions: '당신은 데이터 분석 전문 비서입니다.\n- 데이터를 체계적으로 분석하고 핵심 인사이트를 도출합니다.\n- 분석 결과를 명확한 언어로 설명합니다.\n- 통계적 해석 시 한계와 가정을 명시합니다.\n- 의사결정에 도움이 되는 실행 가능한 제안을 제공합니다.',
    prohibitions: ['데이터 없이 결론을 단정하지 않습니다', '통계적으로 유의미하지 않은 결과를 사실로 제시하지 않습니다'],
    conversation_starters: ['이 데이터의 트렌드를 분석해 주세요', '월별 매출 데이터를 요약해 주세요', '이 수치에서 이상값을 찾아주세요', '경쟁사 데이터와 비교 분석해 주세요'],
    knowledge_files: [],
    first_message: '안녕하세요! 분석이 필요한 데이터를 공유해 주세요.',
    use_foundation_model: true,
  };

  // 기본
  return {
    name: '맞춤 비서',
    description: `${userInput.slice(0, 40)}을(를) 도와드리는 비서입니다.`,
    instructions: '당신은 사용자의 요청에 따라 전문적으로 도움을 드리는 비서입니다.\n- 질문의 의도를 정확히 파악하여 답변합니다.\n- 필요한 경우 추가 정보를 요청합니다.\n- 불확실한 내용은 솔직하게 말씀드립니다.\n- 친절하고 전문적인 어조를 유지합니다.\n- 답변은 명확하고 간결하게 제공합니다.',
    prohibitions: ['확인되지 않은 정보를 사실처럼 제시하지 않습니다', '사용자를 오도할 수 있는 답변을 하지 않습니다'],
    conversation_starters: ['어떻게 도와드릴까요?', '자세히 설명해 주시겠어요?', '관련 자료를 공유해 주세요', '단계별로 안내해 주세요'],
    knowledge_files: [],
    first_message: '안녕하세요! 무엇을 도와드릴까요?',
    use_foundation_model: true,
  };
}

function generateFieldContent(draft: DraftJson, category: string) {
  const categoryName = category || '업무지원';
  const assistantName = draft.name.trim() || `${categoryName} 비서`;
  const purpose = draft.description.trim() || `${categoryName} 업무`;

  return {
    description: `${purpose.replace(/[.!?]+$/, '')}를 빠르고 정확하게 지원하는 ${assistantName}입니다.`.slice(0, 80),
    instructions: [
      `당신은 ${assistantName}입니다.`,
      `- 사용자의 ${purpose.replace(/[.!?]+$/, '')} 관련 요청을 정확하게 파악하고 실무에 바로 활용할 수 있도록 답변합니다.`,
      '- 답변은 핵심 내용을 먼저 제시하고 필요한 절차나 근거를 단계별로 설명합니다.',
      '- 불확실하거나 확인이 필요한 내용은 추측하지 않고 필요한 추가 정보를 요청합니다.',
      '- 전문 용어는 이해하기 쉬운 표현으로 풀어 설명하고, 필요한 경우 예시를 함께 제공합니다.',
      '- 답변 마지막에는 사용자가 이어서 수행할 수 있는 다음 단계를 간단히 안내합니다.',
    ].join('\n'),
    prohibitions: [
      '확인되지 않은 정보를 사실처럼 단정하지 않습니다.',
      '사용자의 요청과 무관한 내용이나 불필요한 개인정보를 포함하지 않습니다.',
      '권한이 없거나 근거를 확인할 수 없는 업무를 임의로 처리하지 않습니다.',
    ],
    conversationStarters: [
      `${purpose.replace(/[.!?]+$/, '')}에 대해 핵심만 정리해 주세요.`,
      '이 업무를 처리하는 절차를 단계별로 알려주세요.',
      '관련 기준과 확인해야 할 사항을 알려주세요.',
      '실무에 바로 사용할 수 있는 예시를 만들어 주세요.',
    ],
    firstMessage: `안녕하세요! ${assistantName}입니다. ${purpose.replace(/[.!?]+$/, '')}와 관련해 무엇을 도와드릴까요?`,
  };
}

/* ─── 서브 컴포넌트 ─── */
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <p className="text-[13px] font-semibold text-[#1A1826] mb-1.5">
      {children}
      {required && <span className="text-[#4F46E5] ml-0.5">*</span>}
    </p>
  );
}

function SectionWrap({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1">{children}</div>;
}

function AutoGenerateButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#DCD8FF] bg-[#F4F2FF] px-2.5 py-1.5 text-[11px] font-semibold text-[#5B4BEA] transition-colors hover:border-[#AFA7FF] hover:bg-[#ECE9FF]"
    >
      <WandSparkles className="h-3.5 w-3.5" strokeWidth={1.9} />
      자동생성
    </button>
  );
}

type TestMessage = { role: 'assistant' | 'user'; text: string };

function buildTestReply(draft: DraftJson, question: string) {
  const instructionSummary = draft.instructions
    .split('\n')
    .map(line => line.replace(/^[-•]\s*/, '').trim())
    .filter(Boolean)[0];
  const prohibition = draft.prohibitions[0];

  return [
    `[데모 테스트 응답] ${draft.name || '새 비서'}가 입력을 받았습니다.`,
    `질문: ${question}`,
    instructionSummary ? `적용 지침: ${instructionSummary}` : '아직 저장된 지침이 없어 기본 응답으로 처리했습니다.',
    prohibition ? `주의사항도 적용합니다: ${prohibition}` : '',
    '',
    '실제 공개 후에는 연결된 지식, MCP/API, 모델 설정을 사용해 답변합니다.',
  ].filter(Boolean).join('\n');
}

function AssistantTestPanel({
  enabled,
  assistantName,
  messages,
  input,
  isResponding,
  onInputChange,
  onSend,
}: {
  enabled: boolean;
  assistantName: string;
  messages: TestMessage[];
  input: string;
  isResponding: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
}) {
  return (
    <aside className="flex w-full lg:w-[44%] min-h-[420px] lg:min-h-0 flex-col border-t lg:border-t-0 lg:border-l border-[#E4E2F0] bg-[#FBFAFF] shrink-0">
      <div className="h-12 flex items-center gap-2 px-4 border-b border-[#E4E2F0] bg-white shrink-0">
        <span className="text-[13px] font-bold text-[#1A1826]">테스트 패널</span>
        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
          enabled
            ? 'bg-[#ECFDF3] text-[#15803D]'
            : 'bg-[#F4F3FC] text-[#8B88A2]'
        }`}>
          {enabled ? '활성화됨' : '저장 후 활성화'}
        </span>
        {enabled && (
          <span className="ml-auto text-[11px] text-[#8B88A2] truncate">
            {assistantName || '새 비서'}
          </span>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-5" style={{ scrollbarWidth: 'thin' }}>
        {!enabled ? (
          <div className="h-full min-h-[300px] flex items-center justify-center text-center">
            <div className="space-y-2">
              <div className="w-10 h-10 mx-auto rounded-2xl bg-[#F0EEFF] text-[#6B5CF0] flex items-center justify-center">
                <Bot className="w-5 h-5" strokeWidth={1.7} />
              </div>
              <p className="text-[13px] font-medium text-[#6B6882]">저장 후 테스트할 수 있습니다.</p>
              <p className="text-[11px] text-[#A8A6C0]">지침과 설정을 저장하면 이곳에서 바로 확인할 수 있어요.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex gap-2.5 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-[#5B4BEA] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-white" strokeWidth={1.8} />
                  </div>
                )}
                <div className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed whitespace-pre-line ${
                  message.role === 'assistant'
                    ? 'rounded-tl-sm bg-white border border-[#E4E2F0] text-[#2A2838]'
                    : 'rounded-tr-sm bg-[#5B4BEA] text-white'
                }`}>
                  {message.text}
                </div>
              </div>
            ))}
            {isResponding && (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#5B4BEA] flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-white" strokeWidth={1.8} />
                </div>
                <div className="flex gap-1 px-3.5 py-3 rounded-2xl rounded-tl-sm bg-white border border-[#E4E2F0]">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#786AF2] animate-bounce" style={{ animationDelay: `${i * 0.16}s` }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-[#E4E2F0] bg-white shrink-0">
        <div className={`flex items-end gap-2 rounded-xl border px-3 py-2 transition-colors ${
          enabled
            ? 'border-[#E4E2F0] focus-within:border-[#5B4BEA]'
            : 'border-[#E9E8F0] bg-[#F7F6FB]'
        }`}>
          <textarea
            value={input}
            disabled={!enabled || isResponding}
            onChange={e => onInputChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            rows={1}
            placeholder={enabled ? '무엇이든 물어보세요… (Shift+Enter 줄바꿈)' : '저장 후 테스트할 수 있습니다.'}
            className="flex-1 min-w-0 resize-none outline-none bg-transparent text-[12px] text-[#2A2838] placeholder:text-[#A8A6C0] leading-relaxed disabled:cursor-not-allowed"
          />
          <button
            type="button"
            aria-label="테스트 질문 보내기"
            disabled={!enabled || !input.trim() || isResponding}
            onClick={onSend}
            className="w-8 h-8 rounded-lg bg-[#5B4BEA] text-white flex items-center justify-center shrink-0 transition-colors hover:bg-[#4939D2] disabled:opacity-35 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-[#A8A6C0] text-center">테스트 응답은 현재 편집 중인 설정을 기준으로 생성됩니다.</p>
      </div>
    </aside>
  );
}

/* ─── 메인 컴포넌트 ─── */
export default function AssistantBuilderView({ onBack, initialDraft, editMode = false }: {
  onBack: () => void;
  initialDraft?: DraftJson;
  editMode?: boolean;
}) {
  const [step, setStep] = useState<Step>(initialDraft ? 'form' : 'chat');

  /* ── 1단계 상태 ── */
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([{
    role: 'ai',
    text: '안녕하세요! 나만의 비서를 만드는 것을 도와드릴게요.\n예를 들어 "우리 회사 매뉴얼을 참고해 답변해주는 비서"나 "PPT 문구를 영어로 바꿔주는 번역 비서"처럼 한 줄로 말씀해 주세요.',
  }]);
  const [isGenerating, setIsGenerating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  /* ── 2단계 상태 ── */
  const [draft, setDraft] = useState<DraftJson>(initialDraft ?? {
    name: '', description: '', instructions: '',
    prohibitions: [], conversation_starters: [],
    knowledge_files: [], first_message: '',
    use_foundation_model: true,
  });
  const [isTestEnabled, setIsTestEnabled] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [testMessages, setTestMessages] = useState<TestMessage[]>([]);
  const [isTestResponding, setIsTestResponding] = useState(false);
  const [saveNotice, setSaveNotice] = useState('');
  const [approvalRequested, setApprovalRequested] = useState(false);
  const [category, setCategory] = useState('');
 
  const [visibility, setVisibility] = useState<'private' | 'designated' | 'department' | 'division' | 'company'>('private');
  const [requestReview, setRequestReview] = useState(false);
  const [prohibInput, setProhibInput] = useState('');
  const [starterInput, setStarterInput] = useState('');
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);
  const [selectedMcpServers, setSelectedMcpServers] = useState<string[]>([]);
  const [selectedApis, setSelectedApis] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [presetThumb, setPresetThumb] = useState<SelectedIcon | null>(null);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [iconTab, setIconTab] = useState<'bank' | 'upload'>('bank');

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  /* ── 메시지 전송 ── */
  const handleSend = () => {
    const text = chatInput.trim();
    if (!text || isGenerating) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setChatInput('');
    setIsGenerating(true);
    setTimeout(() => {
      const generated = generateDraft(text);
      setDraft(generated);
      setIsGenerating(false);
      setStep('form');
    }, 1600);
  };

  const handleSave = () => {
    if (!draft.name.trim() || !draft.instructions.trim()) return;
    setIsTestEnabled(true);
    setApprovalRequested(false);
    setSaveNotice(requestReview
      ? '저장했습니다. 사용하려면 관리자 승인 요청이 필요합니다.'
      : '저장했습니다. 승인 없이 바로 사용할 수 있습니다.');
    setTestMessages(prev => prev.length > 0
      ? prev
      : [{ role: 'assistant', text: draft.first_message || `${draft.name} 테스트를 시작해 보세요. 지침에 맞춰 응답합니다.` }]);
  };

  const handleApprovalRequest = () => {
    if (!saveNotice || !requestReview || approvalRequested) return;
    setApprovalRequested(true);
    setSaveNotice('관리자 승인 요청을 접수했습니다.');
  };

  const handleTestSend = () => {
    const question = testInput.trim();
    if (!question || !isTestEnabled || isTestResponding) return;
    setTestMessages(prev => [...prev, { role: 'user', text: question }]);
    setTestInput('');
    setIsTestResponding(true);
    window.setTimeout(() => {
      setTestMessages(prev => [...prev, { role: 'assistant', text: buildTestReply(draft, question) }]);
      setIsTestResponding(false);
    }, 550);
  };

  /* ── 금지사항 추가 ── */
  const addProhib = () => {
    if (!prohibInput.trim()) return;
    setDraft(d => ({ ...d, prohibitions: [...d.prohibitions, prohibInput.trim()] }));
    setProhibInput('');
  };

  /* ── 대화 스타터 추가 ── */
  const addStarter = () => {
    if (!starterInput.trim()) return;
    setDraft(d => ({ ...d, conversation_starters: [...d.conversation_starters, starterInput.trim()] }));
    setStarterInput('');
  };

  /* ══════════════════════════════════
     1단계 — 빌더 채팅
  ══════════════════════════════════ */
  if (step === 'chat') {
    return (
      <div className="relative flex-1 flex flex-col h-full bg-white min-w-0 overflow-hidden">
        {/* Header */}
        <div className="h-12 flex items-center gap-3 px-4 md:px-6 border-b border-[#E4E2F0] shrink-0">
          <button onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-[#F4F3FC] text-[#6B6882] hover:text-[#4F46E5] transition-colors">
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          </button>
          <span className="text-base font-bold text-[#1A1826]">{editMode ? '비서 수정' : '나만의 비서 만들기'}</span>
          <span className="text-[12px] px-2 py-0.5 rounded-full bg-[#F4F3FC] text-[#4F46E5] font-semibold">
            1단계 · 한 줄 요청
          </span>
        </div>

        {/* 채팅 메시지 */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 md:px-12 py-6 space-y-4" style={{ scrollbarWidth: 'none' }}>
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {m.role === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-[#4F46E5] flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-white" strokeWidth={1.8} />
                </div>
              )}
              <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed whitespace-pre-line break-keep ${
                m.role === 'ai'
                  ? 'bg-[#F4F3FC] text-[#1A1826] rounded-tl-sm'
                  : 'bg-[#4F46E5] text-white rounded-tr-sm'
              }`}>
                {m.text}
              </div>
            </div>
          ))}

          {isGenerating && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#4F46E5] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" strokeWidth={1.8} />
              </div>
              <div className="bg-[#F4F3FC] rounded-2xl rounded-tl-sm px-4 py-3.5">
                <div className="flex gap-1.5 items-center">
                  {[0, 1, 2].map(i => (
                    <div key={i}
                      className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-bounce"
                      style={{ animationDelay: `${i * 0.18}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* 입력창 */}
        <div className="px-4 md:px-12 pb-6 pt-2 shrink-0">
          <div className={`flex gap-2 items-end border rounded-2xl px-4 py-3 transition-colors bg-white shadow-sm ${
            chatInput ? 'border-[#4F46E5]' : 'border-[#E4E2F0] focus-within:border-[#4F46E5]'
          }`}>
            <textarea
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="만들고 싶은 비서를 한 줄로 설명해 주세요…"
              rows={1}
              className="flex-1 text-[14px] text-[#1A1826] placeholder:text-[#A8A6C0] resize-none outline-none leading-relaxed bg-transparent"
              style={{ maxHeight: 100 }}
            />
            <button onClick={handleSend} disabled={!chatInput.trim() || isGenerating}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors shrink-0 disabled:opacity-40 bg-[#4F46E5] hover:bg-[#4338CA]">
              <Send className="w-3.5 h-3.5 text-white" strokeWidth={2} />
            </button>
          </div>
          <p className="text-[11px] text-[#A8A6C0] mt-2 text-center">
            Enter 또는 버튼으로 전송 · 한 문장이면 충분해요
          </p>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════
     2단계 — Fast-fill 폼
  ══════════════════════════════════ */
  const canCreate = draft.name.trim().length > 0 && draft.instructions.trim().length > 0;

  return (
    <div className="relative flex-1 flex flex-col h-full bg-white min-w-0 overflow-hidden">
      {/* Header */}
      <div className="h-12 flex items-center gap-3 px-4 md:px-6 border-b border-[#E4E2F0] shrink-0">
        <button onClick={editMode ? onBack : () => setStep('chat')}
          className="p-1.5 rounded-lg hover:bg-[#F4F3FC] text-[#6B6882] hover:text-[#4F46E5] transition-colors">
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        </button>
        <span className="text-base font-bold text-[#1A1826]">{editMode ? '비서 수정' : '나만의 비서 만들기'}</span>
        <span className="text-[12px] px-2 py-0.5 rounded-full bg-[#EEF5FF] text-[#4F46E5] font-semibold">
          {editMode ? '내용 수정' : '2단계 · 확인·수정'}
        </span>
        <p className="ml-auto text-[12px] text-[#A8A6C0] hidden sm:block">
          {editMode ? '수정 후 저장하세요' : 'AI가 초안을 생성했습니다 · 내용을 확인하고 수정하세요'}
        </p>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canCreate}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5B4BEA] hover:bg-[#4939D2] text-white text-[12px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.9} />
            저장
          </button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* 폼 스크롤 영역 */}
        <div className="flex-1 min-w-0 overflow-y-auto overscroll-contain px-4 md:px-8 py-6 space-y-7" style={{ scrollbarWidth: 'none' }}>

        {/* ① 기본 정보 */}
        <section>
          <p className="text-[13px] font-bold text-[#A8A6C0] uppercase tracking-wide mb-4">기본 정보</p>

          {/* 로고 — 중앙 정렬 */}
          <div className="flex flex-col items-center gap-3 mb-6">
            <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                setLogoUrl(URL.createObjectURL(file));
                setPresetThumb(null);
                if (logoInputRef.current) logoInputRef.current.value = '';
              }} />

            {/* 원형 아바타 */}
            <div className="relative">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden"
                style={{
                  border: '2px dashed #C7C3F7',
                  background: logoUrl ? 'transparent' : (presetThumb?.bg ?? '#F4F3FC'),
                }}>
                {logoUrl
                  ? <img src={logoUrl} alt="로고" className="w-full h-full object-cover" />
                  : presetThumb
                    ? isHanIcon(presetThumb.name)
                      ? <span className="font-bold select-none" style={{ fontSize: 44, color: presetThumb.color }}>
                          {getHanChar(presetThumb.name)}
                        </span>
                      : <span className="material-icons select-none" style={{ fontSize: 40, color: presetThumb.color }}>
                          {presetThumb.name}
                        </span>
                    : <span className="text-[29px] font-bold text-[#A8A6C0] select-none">
                        {draft.name ? draft.name[0].toUpperCase() : ''}
                      </span>
                }
              </div>
              {(logoUrl || presetThumb) && (
                <button type="button" onClick={() => { setLogoUrl(null); setPresetThumb(null); }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#DC2626] flex items-center justify-center shadow">
                  <X className="w-3 h-3 text-white" strokeWidth={2.5} />
                </button>
              )}
            </div>

            {/* 탭 — Material 아이콘 / 사진 업로드 */}
            <div className="flex rounded-full border border-[#E4E2F0] bg-[#F7F6FD] p-0.5 gap-0.5">
              {(['bank', 'upload'] as const).map(tab => (
                <button key={tab} type="button"
                  onClick={() => setIconTab(tab)}
                  className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-all ${
                    iconTab === tab
                      ? 'bg-[#FAFAFE] text-[#4F46E5] shadow-sm'
                      : 'text-[#A8A6C0] hover:text-[#6B6882]'
                  }`}>
                  {tab === 'bank' ? '아이콘 선택' : '사진 업로드'}
                </button>
              ))}
            </div>

            {/* 아이콘 선택 탭 */}
            {iconTab === 'bank' && (
              <button type="button"
                onClick={() => setIconPickerOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E4E2F0] bg-white hover:border-[#4F46E5] hover:bg-[#F7F6FD] transition-all shadow-sm group">
                {presetThumb ? (
                  <>
                    <span
                      className="material-icons"
                      style={{ fontSize: 20, color: presetThumb.color }}
                    >{presetThumb.name}</span>
                    <span className="text-[13px] text-[#1A1826] font-medium">
                      {presetThumb.name.replace(/_/g, ' ')}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="material-icons text-[21px] text-[#A8A6C0]">apps</span>
                    <span className="text-[13px] text-[#6B6882]">Material 아이콘 선택…</span>
                  </>
                )}
                <span className="material-icons text-[17px] text-[#A8A6C0] ml-1 group-hover:text-[#4F46E5]">grid_view</span>
              </button>
            )}

            {/* 사진 업로드 탭 */}
            {iconTab === 'upload' && (
              <button type="button" onClick={() => logoInputRef.current?.click()}
                className="px-4 py-1.5 rounded-full border border-[#E4E2F0] text-[13px] text-[#6B6882] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors bg-white shadow-sm">
                <Camera className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" strokeWidth={2} />
                사진 업로드
              </button>
            )}
          </div>

          {/* 이름 · 설명 — 전체 너비 */}
          <div className="space-y-3">
            <SectionWrap>
              <Label required>이름</Label>
              <input value={draft.name}
                onChange={e => setDraft(d => ({ ...d, name: e.target.value.slice(0, 20) }))}
                placeholder="비서 이름 (최대 20자)"
                className={INPUT} />
              <p className="text-[11px] text-[#A8A6C0] text-right">{draft.name.length}/20</p>
            </SectionWrap>
            <SectionWrap>
              <div className="flex items-start justify-between gap-2">
                <Label>설명</Label>
                <AutoGenerateButton onClick={() => {
                  const generated = generateFieldContent(draft, category);
                  setDraft(d => ({ ...d, description: generated.description }));
                }} />
              </div>
              <input value={draft.description}
                onChange={e => setDraft(d => ({ ...d, description: e.target.value.slice(0, 80) }))}
                placeholder="한 문장 설명 (최대 80자)"
                className={INPUT} />
              <p className="text-[11px] text-[#A8A6C0] text-right">{draft.description.length}/80</p>
            </SectionWrap>
          </div>
        </section>

        {/* ② 카테고리 */}
        <section>
          <Label>카테고리</Label>
          <div className="flex flex-wrap gap-2 items-center">
            {/* 기본 카테고리 */}
            {CATEGORIES.map(c => (
              <button key={c} type="button" onClick={() => setCategory(c === category ? '' : c)}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-colors ${
                  c === category
                    ? 'bg-[#4F46E5] border-[#4F46E5] text-white'
                    : 'border-[#E4E2F0] text-[#6B6882] hover:border-[#4F46E5] hover:text-[#4F46E5]'
                }`}>
                {c}
              </button>
            ))}
          </div>
        </section>

        {/* ③ 지침 */}
        <section>
          <div className="flex items-start justify-between gap-2">
            <Label required>지침 (Instructions)</Label>
            <AutoGenerateButton onClick={() => {
              const generated = generateFieldContent(draft, category);
              setDraft(d => ({ ...d, instructions: generated.instructions }));
            }} />
          </div>
          <p className="text-[12px] text-[#A8A6C0] mb-1.5">
            비서의 역할, 전문성, 응답 방식, 불확실 시 처리 방법 등을 지정합니다.
          </p>
          <textarea value={draft.instructions}
            onChange={e => setDraft(d => ({ ...d, instructions: e.target.value }))}
            rows={8} placeholder="비서 지침을 입력하세요…"
            className={TEXTAREA} />
        </section>

        {/* ④ 금지 사항 */}
        <section>
          <div className="flex items-start justify-between gap-2 mb-3">
            <Label>금지 사항</Label>
            <AutoGenerateButton onClick={() => {
              const generated = generateFieldContent(draft, category);
              setDraft(d => ({ ...d, prohibitions: generated.prohibitions }));
            }} />
          </div>
          {draft.prohibitions.length > 0 && (
            <div className="space-y-1.5 mb-2">
              {draft.prohibitions.map((p, i) => (
                <div key={i} className="flex items-center gap-2 bg-[#FFF5F5] border border-[#FECACA] rounded-lg px-3 py-2">
                  <span className="flex-1 text-[13px] text-[#1A1826]">{p}</span>
                  <button onClick={() => setDraft(d => ({ ...d, prohibitions: d.prohibitions.filter((_, j) => j !== i) }))}
                    className="text-[#DC2626] hover:text-[#B91C1C] transition-colors">
                    <X className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input value={prohibInput} onChange={e => setProhibInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addProhib(); } }}
              placeholder="금지 사항 입력 후 Enter 또는 + 버튼…"
              className={INPUT + ' flex-1'} />
            <button onClick={addProhib}
              className="px-3 py-2.5 rounded-xl border border-[#E4E2F0] text-[#6B6882] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors">
              <Plus className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </section>

        {/* ⑤ 대화 스타터 */}
        <section>
          <div className="flex items-start justify-between gap-2 mb-3">
            <Label>대화 스타터</Label>
            <AutoGenerateButton onClick={() => {
              const generated = generateFieldContent(draft, category);
              setDraft(d => ({ ...d, conversation_starters: generated.conversationStarters }));
            }} />
          </div>
          {draft.conversation_starters.length > 0 && (
            <div className="space-y-1.5 mb-2">
              {draft.conversation_starters.map((s, i) => (
                <div key={i} className="flex items-center gap-2 bg-[#F4F3FC] border border-[#C7C3F7] rounded-lg px-3 py-2">
                  <span className="flex-1 text-[13px] text-[#1A1826]">{s}</span>
                  <button onClick={() => setDraft(d => ({ ...d, conversation_starters: d.conversation_starters.filter((_, j) => j !== i) }))}
                    className="text-[#6B6882] hover:text-[#1A1826] transition-colors">
                    <X className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input value={starterInput} onChange={e => setStarterInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addStarter(); } }}
              placeholder="대화 스타터 입력 후 Enter 또는 + 버튼…"
              className={INPUT + ' flex-1'} />
            <button onClick={addStarter}
              className="px-3 py-2.5 rounded-xl border border-[#E4E2F0] text-[#6B6882] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors">
              <Plus className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </section>

        {/* ⑥ 연결 — MCP 서버 */}
        <section>
          <Label>MCP 서버 연결</Label>
          <p className="text-[12px] text-[#A8A6C0] mb-3">
            현재 사용자에게 권한이 부여된 관리자 승인 MCP 서버만 선택할 수 있습니다. 선택한 서버의 권한 범위 안에서만 비서가 데이터를 활용합니다.
          </p>
          <div className="space-y-2">
            {APPROVED_MCP_SERVERS.map(server => {
              const checked = selectedMcpServers.includes(server.id);
              const toggle = () => setSelectedMcpServers(prev =>
                checked ? prev.filter(id => id !== server.id) : [...prev, server.id]
              );
              return (
                <div key={server.id}
                  role="checkbox" tabIndex={0} aria-checked={checked}
                  onClick={toggle}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
                  className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-colors select-none ${
                    checked ? 'border-[#4F46E5] bg-[#F4F3FC]' : 'border-[#E4E2F0] hover:border-[#C7C3F7]'
                  }`}>
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    checked ? 'border-[#4F46E5] bg-[#4F46E5]' : 'border-[#D1D0E0]'
                  }`}>
                    {checked && (
                      <svg viewBox="0 0 10 8" fill="none" className="w-2.5 h-2">
                        <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[14px] font-semibold text-[#1A1826]">{server.name}</p>
                      <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-[#F0EEFF] text-[#4F46E5] font-semibold border border-[#C7C3F7]">
                        {server.tag}
                      </span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-[#F0FDF4] text-[#16A34A] font-semibold border border-[#BBF7D0]">
                        {server.permission}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#A8A6C0] mt-0.5">{server.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {selectedMcpServers.length > 0 && (
            <p className="mt-2 text-[12px] text-[#4F46E5] font-medium">{selectedMcpServers.length}개 선택됨</p>
          )}
        </section>

        {/* ⑦ 연결 — API */}
        <section>
          <Label>API 연결</Label>
          <p className="text-[12px] text-[#A8A6C0] mb-3">
            현재 사용자에게 권한이 부여된 관리자 승인 API만 선택할 수 있습니다. API별 권한 범위를 확인한 뒤 필요한 연결만 추가하세요.
          </p>
          <div className="space-y-2">
            {APPROVED_APIS.map(api => {
              const checked = selectedApis.includes(api.id);
              const toggle = () => setSelectedApis(prev =>
                checked ? prev.filter(id => id !== api.id) : [...prev, api.id]
              );
              return (
                <div key={api.id}
                  role="checkbox" tabIndex={0} aria-checked={checked}
                  onClick={toggle}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
                  className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-colors select-none ${
                    checked ? 'border-[#4F46E5] bg-[#F4F3FC]' : 'border-[#E4E2F0] hover:border-[#C7C3F7]'
                  }`}>
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    checked ? 'border-[#4F46E5] bg-[#4F46E5]' : 'border-[#D1D0E0]'
                  }`}>
                    {checked && (
                      <svg viewBox="0 0 10 8" fill="none" className="w-2.5 h-2">
                        <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[14px] font-semibold text-[#1A1826]">{api.name}</p>
                      <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-semibold border ${
                        api.tag === '사내 시스템'
                          ? 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'
                          : api.tag === '공공데이터'
                            ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
                            : 'bg-[#F0F9FF] text-[#0EA5E9] border-[#BAE6FD]'
                      }`}>
                        {api.tag}
                      </span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-[#F0FDF4] text-[#16A34A] font-semibold border border-[#BBF7D0]">
                        {api.permission}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#A8A6C0] mt-0.5">{api.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {selectedApis.length > 0 && (
            <p className="mt-2 text-[12px] text-[#4F46E5] font-medium">{selectedApis.length}개 선택됨</p>
          )}
        </section>

        {/* ⑧ 지식 */}
        <section>
          <Label>지식</Label>
          <p className="text-[12px] text-[#A8A6C0] mb-3">
            업로드한 파일의 일부 또는 전체가 비서와의 대화에 포함될 수 있습니다.
          </p>

          {/* 파일 업로드 */}
          <input ref={fileInputRef} type="file" multiple className="hidden"
            onChange={e => {
              const files = Array.from(e.target.files ?? []).map(f => f.name);
              setUploadedFiles(prev => [...prev, ...files]);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }} />
          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E4E2F0] text-[14px] font-medium text-[#6B6882] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors mb-2">
            <Paperclip className="w-4 h-4" strokeWidth={1.8} />
            파일 업로드
          </button>
          {uploadedFiles.length > 0 && (
            <div className="space-y-1.5 mb-4">
              {uploadedFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-[#F4F3FC] border border-[#C7C3F7] rounded-lg px-3 py-2">
                  <Paperclip className="w-3.5 h-3.5 text-[#4F46E5] shrink-0" strokeWidth={1.8} />
                  <span className="flex-1 text-[13px] text-[#1A1826] truncate">{f}</span>
                  <button onClick={() => setUploadedFiles(prev => prev.filter((_, j) => j !== i))}
                    className="text-[#6B6882] hover:text-[#1A1826] transition-colors">
                    <X className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 색인 데이터셋 */}
          <div className="mt-4">
            <p className="text-[13px] font-semibold text-[#1A1826]">
              색인 데이터셋
              <span className="ml-1 text-[12px] font-normal text-[#A8A6C0]">(이미 수집·색인된 임베딩 데이터셋에서 선택)</span>
            </p>
            <p className="text-[12px] text-[#A8A6C0] mt-0.5 mb-2.5">
              선택한 데이터셋은 비서가 답변 시 검색해 참고합니다.
            </p>
            <div className="space-y-2">
              {DATASETS.map(ds => {
                const checked = selectedDatasets.includes(ds.id);
                return (
                  <div key={ds.id}
                    role="checkbox" aria-checked={checked}
                    onClick={() => setSelectedDatasets(prev =>
                      checked ? prev.filter(id => id !== ds.id) : [...prev, ds.id]
                    )}
                    className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-colors select-none ${
                      checked ? 'border-[#4F46E5] bg-[#F4F3FC]' : 'border-[#E4E2F0] hover:border-[#C7C3F7]'
                    }`}>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                      checked ? 'border-[#4F46E5] bg-[#4F46E5]' : 'border-[#D1D0E0]'
                    }`}>
                      {checked && (
                        <svg viewBox="0 0 10 8" fill="none" className="w-2.5 h-2">
                          <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[#1A1826]">{ds.name}</p>
                      <p className="text-[12px] text-[#A8A6C0] mt-0.5 truncate">
                        {ds.desc} · {ds.docs.toLocaleString()}개 문서 · {ds.model}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ⑦ 첫 메시지 */}
        <section>
          <div className="flex items-start justify-between gap-2">
            <Label>첫 메시지 (인사말)</Label>
            <AutoGenerateButton onClick={() => {
              const generated = generateFieldContent(draft, category);
              setDraft(d => ({ ...d, first_message: generated.firstMessage }));
            }} />
          </div>
          <p className="text-[12px] text-[#A8A6C0] mb-1.5">
            비서를 처음 열었을 때 자동으로 표시되는 인사말입니다. (선택)
          </p>
          <textarea value={draft.first_message}
            onChange={e => setDraft(d => ({ ...d, first_message: e.target.value }))}
            rows={3} placeholder="예: 안녕하세요! 무엇을 도와드릴까요?"
            className={TEXTAREA} />
        </section>

        {/* ⑦ 파운데이션 모델 병용 */}
        <section>
          <div className="flex items-center justify-between p-4 border border-[#E4E2F0] rounded-xl">
            <div>
              <p className="text-[14px] font-semibold text-[#1A1826]">파운데이션 모델 일반 지식 병용</p>
              <p className="text-[12px] text-[#A8A6C0] mt-0.5">
                업로드 파일 외에도 AI의 일반 지식을 함께 활용합니다.
              </p>
            </div>
            <button type="button"
              onClick={() => setDraft(d => ({ ...d, use_foundation_model: !d.use_foundation_model }))}
              className={`w-11 h-6 rounded-full transition-colors relative ${draft.use_foundation_model ? 'bg-[#4F46E5]' : 'bg-[#D1D0E0]'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                draft.use_foundation_model ? 'left-[22px]' : 'left-0.5'
              }`} />
            </button>
          </div>
        </section>

        {/* ⑧ 공개 범위 */}
        <section>
          <Label>공개 범위</Label>
          <div className="space-y-2">
            {VISIBILITY_OPTIONS.map(v => (
              <label key={v.value}
                className={`relative flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                  visibility === v.value
                    ? 'border-[#4F46E5] bg-[#F4F3FC]'
                    : 'border-[#E4E2F0] hover:border-[#C7C3F7]'
                }`}>
                <input type="radio" name="visibility" value={v.value}
                  checked={visibility === v.value}
                  onChange={() => {
                    setVisibility(v.value);
                    setRequestReview(v.needsReview);
                    setApprovalRequested(false);
                    setSaveNotice('');
                  }}
                  className="sr-only" />
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  visibility === v.value ? 'border-[#4F46E5]' : 'border-[#D1D0E0]'
                }`}>
                  {visibility === v.value && <div className="w-2 h-2 rounded-full bg-[#4F46E5]" />}
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-[#1A1826]">{v.label}</p>
                  <p className="text-[12px] text-[#A8A6C0]">{v.desc}</p>
                </div>
                {v.needsReview && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#D97706] font-semibold shrink-0">
                    심의 필요
                  </span>
                )}
              </label>
            ))}
          </div>

          {requestReview && (
            <div className="flex items-center gap-2.5 mt-3 p-3 border border-[#FDE68A] bg-[#FFFBEB] rounded-xl">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#D97706]" strokeWidth={2} />
              <span className="text-[13px] text-[#92400E]">
                이 공개 범위는 저장 후 관리자 승인을 요청해야 사용할 수 있습니다.
              </span>
            </div>
          )}
        </section>

        <div className="h-2" />
          <div className="h-2" />
        </div>

        <AssistantTestPanel
          enabled={isTestEnabled}
          assistantName={draft.name}
          messages={testMessages}
          input={testInput}
          isResponding={isTestResponding}
          onInputChange={setTestInput}
          onSend={handleTestSend}
        />
      </div>

      {/* ── 하단 액션 바 ── */}
      <div className="flex items-center justify-between gap-3 px-4 md:px-8 py-4 border-t border-[#E4E2F0] bg-white shrink-0">
        <button onClick={onBack}
          className="px-4 py-2.5 rounded-xl border border-[#E4E2F0] text-[14px] font-semibold text-[#6B6882] hover:bg-[#F4F3FC] transition-colors">
          취소
        </button>
        <div className="flex gap-2">
          {saveNotice && requestReview && (
            <button
              type="button"
              onClick={handleApprovalRequest}
              disabled={approvalRequested}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#4F46E5] text-[14px] font-semibold text-[#4F46E5] hover:bg-[#F4F3FC] transition-colors disabled:border-[#C7C3F7] disabled:bg-[#F4F3FC] disabled:text-[#8A84C7] disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
              {approvalRequested ? '승인 요청됨' : '승인요청'}
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!canCreate}
            className="px-4 py-2.5 rounded-xl border border-[#E4E2F0] text-[14px] font-semibold text-[#6B6882] hover:bg-[#F4F3FC] transition-colors">
            임시저장
          </button>
          <button disabled={!canCreate} onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[14px] font-semibold transition-colors shadow-sm shadow-[#4F46E5]/20 disabled:opacity-40 disabled:cursor-not-allowed">
            {saveNotice
              ? (requestReview
                ? (approvalRequested ? '저장됨 · 승인 대기' : '저장됨 · 승인 필요')
                : '저장됨 · 바로 사용 가능')
              : (editMode ? '저장' : '만들기')}
          </button>
        </div>
      </div>
      {saveNotice && (
        <div className="absolute bottom-[76px] left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1F2937] text-white text-[11px] shadow-lg">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#86EFAC]" strokeWidth={2} />
          {saveNotice}
        </div>
      )}

      {/* ── 아이콘 피커 모달 ── */}
      <IconPickerModal
        open={iconPickerOpen}
        current={presetThumb}
        onSelect={icon => { setPresetThumb(icon); setLogoUrl(null); setIconPickerOpen(false); }}
        onClose={() => setIconPickerOpen(false)}
      />
    </div>
  );
}
