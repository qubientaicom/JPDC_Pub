# JPDC AI — 공식비서 카드 → 채팅 시작 → 화면 흐름 상세 명세
> 예시: 회의록 문장정리 비서

---

## 전체 흐름 한눈에

```
[공식비서 탭] 비서 카드 클릭
    ↓
[AssistantInfoModal] 상세 모달
    ↓  "💬 채팅 시작" 클릭
[App.tsx] onStartWithAssistant({ name, starters, desc }) 호출
    ↓
[ConversationView] activeView = 'conversation' 전환
    ↓
[STEP 1] AssistantIntroPanel  ← 스타터 버튼 클릭
    ↓
[STEP 2] MinutesRequestPanel  ← 사용자 회의 내용 입력 + 전송
    ↓
[STEP 3] MinutesResultPanel   ← 완성된 회의록 + 액션바
```

---

## STEP 0 — 비서 카드 클릭 → 모달 오픈

### 비서 카드 데이터 (회의록 문장정리)
```typescript
{
  id: 'meeting',
  name: '회의록 문장정리',
  desc: '회의 내용을 체계적인 문서로 자동 정리',
  icon: PenTool,
  category: '글쓰기',  // → 보라색 계열
  users: '12.4k',
  match: 88,
}
```

### AssistantInfoModal 구성
```
모달 크기: max-w-md, maxHeight=88vh, 스크롤 가능
배경:      bg-black/30 backdrop-blur-[2px]
ESC / 배경 클릭 → 닫힘, 스크롤 잠금

─────────────────────────────────
헤더 (그라디언트 배경 #EDE9FE → white)
  [PenTool 아이콘] w-16 h-16 rounded-2xl bg-[#EDE9FE]
  이름: "회의록 문장정리"
  메타: "작성자: JPDC · 카테고리: 글쓰기"
  배지: [v1] [공식] [승인완료]

설명
  fullDesc or desc 텍스트

통계 6칸 (grid-cols-6)
  평가(N) | 좋아요 👍 | 싫어요 👎 | 대화수 | 메시지수 | 코멘트수

대화 스타터 (클릭하면 바로 대화시작 → onClose 호출만 됨, 실제 연결 없음)
  ▸ "오늘 계약 검토 회의 내용을 정리해 줘"
  ▸ "안건 3개로 구성된 회의록 초안을 작성해 줘"
  ▸ "액션아이템만 따로 추출해 줄 수 있어?"

평가
  총점 숫자 (32px) + 별 5개 + "N개 평가"
  star별 막대 그래프 (5→1 순)

코멘트 (있을 경우)
  최신순 정렬, px-3.5 py-2.5 rounded-xl bg-[#F9F8FF]

같은 작성자의 다른 비서 (있을 경우)
  grid-cols-2, 클릭 시 해당 비서 모달로 전환
─────────────────────────────────
고정 하단 (border-t, shrink-0)
  [💬 채팅 시작]  ← bg-[#4F46E5] 인디고 버튼
  [복제]  [URL 복사]
  (status=pending/updating → Lock 아이콘 + 비활성)
─────────────────────────────────
```

---

## STEP 1 — "💬 채팅 시작" 클릭 → AssistantIntroPanel

### 버튼 클릭 시 실행 코드
```typescript
// AssistantInfoModal
onClick={() => {
  onStartWithAssistant?.({
    name: selectedAssistant.name,       // "회의록 문장정리"
    starters: selectedAssistant.starters ?? [],
    desc: selectedAssistant.fullDesc ?? selectedAssistant.desc,
  });
  setSelectedAssistant(null);  // 모달 닫기
}}

// App.tsx
onStartWithAssistant = (ctx) => {
  setActiveAssistantCtx(ctx);
  setActiveView('conversation');
}
```

### makeInitialMessages 호출
```typescript
// ConversationView 마운트 시
// ctx(비서 컨텍스트)가 있으면 → 인트로 패널만 생성, 사용자 질의 없음
if (ctx) {
  return [{ role: 'assistant', kind: 'assistant-intro', name: ctx.name,
            starters: ctx.starters, desc: ctx.desc }];
}
```

### AssistantIntroPanel 화면
```
아이콘: 인디고 그라디언트 w-8 h-8 rounded-xl (Sparkles)

배지: [Users 아이콘] "비서 진입"
      bg-[#EEEEFF] border-[#C7C3F7] text-[#4F46E5]

인사말 버블:
  "회의록 문장정리과 대화를 시작할까요?"
  (이름 부분만 text-[#4F46E5] 인디고)
  desc 있으면 부제 표시

대화 스타터 (클릭 가능):
  라벨: "대화 스타터"  text-[11px] uppercase
  ▸ "오늘 계약 검토 회의 내용을 정리해 줘"
  ▸ "안건 3개로 구성된 회의록 초안을 작성해 줘"
  ▸ "액션아이템만 따로 추출해 줄 수 있어?"
  
  각 버튼:
    border-[#E4E2F0], hover→border-[#4F46E5]/40 + bg-[#F9F8FF]
    ChevronRight 아이콘 (hover 시만 표시)
```

### 스타터 클릭 시 handleSend 호출
```typescript
// "오늘 계약 검토 회의 내용을 정리해 줘" 클릭
handleSend(text, '회의록 문장정리')
```

---

## STEP 2 — 스타터 클릭 → MinutesRequestPanel

### handleSend 내부 분기 로직
```typescript
const effective = '회의록 문장정리';

// 1. 인트로가 이미 있는지 확인 → 있음 → 통과

// 2. 회의록 비서 전용 분기
const hasRequest = finished.some(m => m.kind === 'minutes-request');  // false
const hasResult  = finished.some(m => m.kind === 'minutes-result');   // false
forceKind = !hasRequest ? 'minutes-request'  // ← 이쪽 선택
          : !hasResult  ? 'minutes-result'
          : 'instruction';

// 메시지 추가
[
  ...finished,
  { role: 'user', text: "오늘 계약 검토 회의 내용을 정리해 줘" },
  { role: 'assistant', kind: 'classifying', forceKind: 'minutes-request' },
]
```

### ThinkingProcess 스텝 (classifying → 완료)
```
① "회의록 정리 요청 감지 — 회의 내용 입력 안내 준비 중"
② [회의록 분석 스킬] [문장 정리 스킬] [액션아이템 추출 스킬]
③ "회의록 작성 템플릿 로드 완료"
④ [로딩 애니메이션]
⑤ "회의록 문서 생성 시작"
→ kind: 'minutes-request' 로 교체
```

### MinutesRequestPanel 화면
```
아이콘: 보라색 그라디언트 w-8 h-8 (from-[#7C3AED] to-[#A78BFA])

배지: [문서 아이콘] "회의록 비서"
      bg-[#F5F3FF] border-[#DDD6FE] text-[#7C3AED]

내용 버블 (스트리밍 → renderText):
  "네, 회의 내용을 입력해 주시면 바로 정리해 드릴게요.
  
  아래 항목을 포함하시면 더 정확한 회의록을 작성해 드릴 수 있어요:
  
  • 회의 일시 및 장소
  • 참석자 명단
  • 주요 안건 및 논의 내용
  • 결정 사항
  • 액션 아이템 (담당자, 완료 기한)
  
  내용을 자유롭게 입력해 주세요. 메모 수준의 내용도 괜찮아요."
```

### 사용자가 회의 내용 입력 후 전송

---

## STEP 3 — 회의 내용 전송 → MinutesResultPanel

### handleSend 두 번째 호출 분기
```typescript
const hasRequest = true;   // minutes-request 이미 있음
const hasResult  = false;  // minutes-result 아직 없음
forceKind = 'minutes-result'  // ← 이쪽 선택
```

### ThinkingProcess (같은 스텝 반복)
```
① → ② → ③ → ④ → ⑤
→ kind: 'minutes-result' 로 교체
```

### MinutesResultPanel 화면
```
아이콘: 보라색 그라디언트 (MinutesRequestPanel 동일)

배지: [문서 아이콘] "회의록 작성 완료"
      bg-[#F5F3FF] border-[#DDD6FE] text-[#7C3AED]

내용 버블 (스트리밍 → MINUTES_MOCK 마크다운 렌더링):
  ## 📋 회의록
  제목: 계약 검토 회의
  일시: 2026년 7월 28일 (월) 14:00 – 15:30
  장소: 5층 대회의실
  참석자: 김동현 팀장, 이수진 대리, 박민준 사원, 최지영 주임

  ### 1. 주요 안건 및 논의 내용
    [안건 1] 신규 공급업체 A사 계약서 검토
    [안건 2] 기존 계약 갱신 건 (B사, C사)

  ### 2. 결정 사항
    테이블 (항목 / 내용 / 결정자)

  ### 3. 액션 아이템
    테이블 (# / 내용 / 담당자 / 완료 기한)

  * 작성: 회의록 문장정리 비서 · 2026.07.28 *

스트리밍 완료 후 버튼 2개:
  [문서로 내보내기]  [복사]
  (보라색 hover: border-[#7C3AED]/40 bg-[#F5F3FF])

액션바 (ActionBar):
  [👍] [👎] | [저장] [복사] [MD] [재생성]
  answer = "회의록 문장정리 결과"
```

---

## STEP 4 — 추가 대화 (세 번째 메시지 전송)

```typescript
const hasRequest = true;
const hasResult  = true;
forceKind = 'instruction'  // 일반 지침 답변으로 전환
```

이후 메시지는 모두 **InstructionPanel** (일반 RAG 지침 답변) 로 처리됩니다.

---

## forceKind 상태 전이 요약 (회의록 비서 전용)

```
[처음 진입]
  makeInitialMessages → assistant-intro (사용자 메시지 없음)

[스타터 or 첫 메시지 전송]
  hasRequest=false → forceKind='minutes-request'
  → ThinkingProcess → MinutesRequestPanel

[두 번째 메시지 전송]
  hasRequest=true, hasResult=false → forceKind='minutes-result'
  → ThinkingProcess → MinutesResultPanel

[세 번째 메시지부터]
  hasRequest=true, hasResult=true → forceKind='instruction'
  → ThinkingProcess → InstructionPanel
```

---

## 모든 채팅 진입 경로 비교

| 진입 경로 | 첫 화면 |
|---|---|
| 공식비서 탭 → 카드 → 채팅 시작 | AssistantIntroPanel (사용자 메시지 없음) |
| AmbiguousPanel에서 비서 카드 선택 | 사용자 메시지 "회의록 문장정리 비서로 진행해 주세요." + AssistantIntroPanel |
| 히스토리 "회의록 작성 지침 알려줘" 클릭 | AmbiguousPanel (분할) |
| 사이드바 히스토리 클릭 (classifyQuery) | classifyQuery 결과에 따라 분기 |
