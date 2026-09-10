# JPDC AI 재구축 명세서

> 다른 개발 프로젝트에서 현재 JPDC AI 웹앱의 기능, 화면, 상호작용, 데이터 구조와 운영 전환 지점을 재현하기 위한 상세 명세서입니다.  
> 문서 기준일: **2026-09-01 (화요일)**  
> 대상 제품: 제주개발공사(JPDC) 내부 업무용 AI 지원 웹앱  
> 현재 상태: 프론트엔드는 데모 데이터와 브라우저 로직으로 동작하며, API 서버에는 헬스체크 외 실제 기능 API가 아직 연결되지 않았습니다.

---

## 1. 문서의 목적과 재구축 원칙

이 문서는 단순한 화면 캡처나 컴포넌트 목록이 아니라, 사용자가 실제로 어떤 화면을 보고 어떤 순서로 행동하며, 서버가 어떤 데이터를 제공해야 하는지를 정의하는 제품 명세서입니다.

다른 프로젝트에서 재구축할 때 다음 원칙을 우선합니다.

1. **사용자 행동과 상태 전환을 먼저 구현한다.**
   - 홈에서 질의를 시작한다.
   - 질의 의도를 분류한다.
   - 지침(RAG), 업무 데이터(TAG/ERP), 비서 중 필요한 경로를 선택하거나 병렬로 실행한다.
   - 결과를 답변 카드, 표, 차트, 출처, 추천 비서로 보여 준다.
2. **실제 운영 데이터와 데모 데이터의 경계를 분명하게 한다.**
   - 현재 화면의 질의, 답변, 비서, 알림, 사용량은 데모 값이다.
   - 운영 버전에서는 인증된 사용자와 API 응답이 모든 데이터의 원천이어야 한다.
3. **프론트에서 권한을 흉내 내지 않는다.**
   - 관리자 메뉴를 숨기는 것은 UX 처리일 뿐 보안 경계가 아니다.
   - 모든 관리자·개인 데이터·비서 공개 API는 서버에서 세션과 권한을 검증한다.
4. **한국어 UI를 기본으로 한다.**
   - 기본 locale은 `ko-KR`, 시간대는 `Asia/Seoul`이다.
   - 날짜와 시간은 서버에서 UTC로 저장하고, 클라이언트 표시 시 사용자 시간대로 변환한다.
5. **복합 답변을 하나의 긴 텍스트로 합치지 않는다.**
   - RAG 지침, TAG 집계, 해석 카드, 추천 비서는 독립 패널로 렌더링한다.
   - 각 패널의 액션바, 출처, 이어서 질의 컨텍스트를 독립적으로 관리한다.

---

## 2. 제품 목적과 사용자 역할

### 2.1 제품 목적

JPDC 구성원이 다음 업무를 한곳에서 처리할 수 있도록 하는 내부 AI 업무 지원 서비스입니다.

- 사내 규정·지침·매뉴얼을 검색하고 근거와 함께 답변 받기
- ERP·업무 시스템의 구조화된 데이터를 자연어로 조회하기
- 목적에 맞는 AI 비서를 선택해 반복 업무를 수행하기
- 여러 답변 경로를 비교하고 표·차트로 결과 확인하기
- 답변을 저장하고, 평가하고, Markdown으로 내보내기
- 개인 설정, AI 비서 순서, 알림, 대화 메모리, 사용량 확인하기
- 비서마켓에서 공식 비서를 발견하거나 직접 비서 만들기
- AI 사용 현황과 조직의 주요 질의를 브리핑으로 확인하기

### 2.2 사용자 역할

| 역할 | 주요 권한 |
|---|---|
| `user` | 본인 대화, 저장 답변, 설정, 메모리, 즐겨찾기 조회·수정. 비서 생성 |
| `assistant_owner` | 본인이 만든 비서의 수정·삭제·통계 조회. 공개 전 테스트 요청 확인 |
| `reviewer` | 공개 전 테스트 요청에 대한 평가·승인 검토 |
| `admin` | 공식 비서, 데이터셋, MCP/API 연결, 공개 승인 정책 관리 |

공개 범위는 다음과 같이 사용할 수 있습니다.

- `private`: 소유자만 사용
- `designated`: 지정 사용자만 사용
- `department`: 지정 부서 사용자에게 공개
- `company`: 조직 전체에 공개

### 2.3 주요 사용자 시나리오

#### 시나리오 A: 지침 질문

1. 홈 입력창에 “공공기관 보안 지침에서 외부 반출 금지 자료의 범위는 어디까지인가요?” 입력
2. 시스템이 `instruction`으로 분류
3. 관련 내부 지침을 검색
4. 답변 본문과 출처 목록 표시
5. 사용자가 좋아요·별점·저장·복사·Markdown 다운로드 중 선택

#### 시나리오 B: 지침과 업무 데이터가 함께 필요한 질문

1. “입고 처리가 안 된 작업지시가 있어?” 입력
2. 시스템이 RAG 지침과 TAG/ERP 데이터가 모두 필요한 질의로 분류
3. RAG 지침 패널과 TAG 현황 패널을 함께 표시
4. ERP 데이터 표와 차트를 표시
5. 결과 하단에 관련 비서 추천
6. 사용자가 특정 패널에서 “이어서 질의”를 눌러 추가 질문

#### 시나리오 C: 의도가 모호한 입고 질문

1. “입고 처리가 안된 작업 방법알려줘” 입력
2. 즉시 답하지 않고 `route-select` 선택 화면 표시
3. 사용자가 다음 중 하나 선택
   - `지침에서 찾기`
   - `ERP 입고 현황 조회`
4. 지침 선택 시 RAG 경로 실행
5. ERP 선택 시 TAG/ERP 경로 실행

#### 시나리오 D: 비서 만들기

1. 비서마켓에서 `비서 만들기` 선택
2. “우리 회사 매뉴얼을 참고해 답변해주는 비서”와 같은 한 줄 요청 입력
3. AI가 이름, 설명, 지침, 금지사항, 대화 스타터 초안 생성
4. 사용자가 기본 정보·지침·MCP/API·지식 데이터셋·공개 범위 수정
5. `저장하기`로 비공개 비서 생성
6. 공개 전 테스트 요청을 보낼 수 있는 상태로 전환

---

## 3. 기술·실행 기준

### 3.1 권장 기술 스택

현재 프로젝트와 동일한 재구축을 권장합니다.

- pnpm workspace
- React 19 + TypeScript
- Vite
- Tailwind CSS
- Radix UI
- Lucide React
- Recharts
- Express 5
- Drizzle ORM + PostgreSQL
- Zod
- OpenAPI + Orval 기반 API 타입 생성

다른 스택을 사용해도 아래 계약과 상태 전이는 유지해야 합니다.

### 3.2 현재 프로젝트 실행 기준

```text
artifacts/jpdc-ai/       # JPDC AI 웹 프론트엔드
artifacts/api-server/    # Express API 서버
artifacts/mockup-sandbox/ # UI 컴포넌트 미리보기 서버
lib/api-spec/            # OpenAPI 원본
lib/api-zod/             # 검증 스키마
lib/api-client-react/    # React API 클라이언트
lib/db/                  # Drizzle/PostgreSQL 데이터 계층
```

실행 명령:

```bash
pnpm install
pnpm --filter @workspace/jpdc-ai run dev
pnpm --filter @workspace/api-server run dev
pnpm run typecheck
pnpm run build
```

웹 앱은 Vite로 실행하고 `PORT` 환경 변수를 사용합니다. 현재 웹 아티팩트의 경로는 `/jpdc-ai/`입니다. 라우팅을 사용하는 경우 root-relative URL이 아티팩트 경로를 빠져나가지 않도록 base path를 적용합니다.

---

## 4. 전체 레이아웃과 화면 구조

### 4.1 데스크톱 레이아웃

전체 앱은 다음 수평 구조입니다.

```text
┌──────────────────────────────────────────────────────────────────┐
│ Sidebar │ SavedPanel(optional) │ MainContent │ NotifPanel(optional) │
└──────────────────────────────────────────────────────────────────┘
```

#### 왼쪽 사이드바

- 펼침 상태 기본 폭: 약 `220~240px`
- 접힘 상태: 아이콘 중심의 좁은 rail
- 배경: 연한 라벤더 계열
- 주요 기능:
  - 로고와 `JPDC AI`
  - `새 대화`
  - 대화 검색
  - 날짜별 대화 이력
  - `비서마켓`
  - `저장목록`
  - 다크모드 전환
  - `개인 설정`
  - `이용 매뉴얼`
  - 사용자 프로필

#### 저장 목록 패널

- 사이드바 오른쪽에 슬라이드로 열리는 패널
- 열림 폭: 약 `280px`
- 제목: `저장 목록`
- 저장 개수 배지 표시
- 최신 저장 순으로 목록 표시
- 목록이 비었을 때: `저장한 답변이 없습니다`
- 각 항목은 질의, 답변 미리보기, 저장 시각, 삭제 버튼을 가짐

#### 메인 콘텐츠

- 화면별 상단바와 콘텐츠 영역
- 홈·대화·마켓·브리핑 콘텐츠는 자체 `overflow-y: auto`
- 상단바는 콘텐츠 스크롤과 분리
- 대화 답변은 중앙의 읽기 영역에 배치

#### 알림 센터 패널

- 데스크톱: 메인 콘텐츠 오른쪽에 열리는 패널
- 모바일: 화면 오른쪽 fixed drawer
- 열림 폭: 약 `300px`, 모바일은 화면 폭의 최대 `85vw`
- 읽지 않은 개수 배지
- `모두 읽음`
- 알림 클릭 시 읽음 처리
- 각 알림에 삭제 버튼
- 빈 상태: `알림이 없습니다`

### 4.2 모바일 레이아웃

브레이크포인트 기준은 `767px` 이하입니다.

- 사이드바는 overlay drawer로 전환하거나 좁은 rail로 접는다.
- 저장 목록과 알림 센터는 fixed drawer로 표시한다.
- 상단바의 보조 텍스트와 버튼 라벨은 숨기고 아이콘을 유지한다.
- 마켓의 탭·필터는 가로 스크롤한다.
- 답변 패널은 1열로 쌓는다.
- 표는 가로 스크롤을 허용한다.
- 채팅 입력창은 화면 하단에 충분한 여백을 두고 표시한다.
- 모든 아이콘 버튼에는 `aria-label`을 제공한다.

---

## 5. 화면별 명세

## 5.1 홈 화면

### 목적

로그인 후 가장 먼저 도착하는 화면입니다. 자주 사용하는 비서와 예시 질의를 빠르게 선택하고, 자연어 입력으로 새 대화를 시작합니다.

### 화면 구성

1. 상단바
   - 사이드바 접기/펼치기
   - `알림`
   - `비서마켓`
2. 히어로 영역
   - 환영 문구: `안녕하세요, 김동현님`
   - 제품 설명: `무엇을 도와드릴까요?`
   - 보조 문구: 자연어로 업무를 입력하거나 비서를 선택하도록 안내
3. 질의 입력 영역
   - placeholder 예시: `무엇이든 물어보세요…`
   - 첨부 버튼
   - 비서 선택 버튼: `비서 선택`
   - 전송 버튼
4. 예시 질의
   - `입고 처리가 안된 작업 방법알려줘`
   - `입고 처리가 안 된 작업지시가 있어?`
   - `공공기관 보안 지침에서 외부 반출 금지 자료의 범위는 어디까지인가요?`
   - `회의록 작성 잘 하는법`
   - 필요에 따라 질의 유형을 보여 주는 배지
5. 추천 비서 카드
   - `공식 비서`
   - `개인 비서`
   - `인기 비서`
6. 주요 지표 또는 빠른 통계
   - 가장 많이 사용한 비서
   - 활성 사용자
   - 대화 수

### 입력 상호작용

- 예시 질의를 클릭하면 입력창에 텍스트를 채운다.
- 예시 질의는 자동으로 전송하지 않는다.
- Enter는 전송한다.
- Shift+Enter는 줄바꿈한다.
- 비어 있는 입력은 전송하지 않는다.
- 전송 중에는 입력창·전송 버튼을 비활성화한다.
- 첨부 파일을 선택하면 파일 칩과 파일 상태를 표시한다.
- 비서를 선택하면 비서 칩을 표시하고 `assistantId`를 새 대화 요청에 포함한다.

### 첨부 파일 상태

```text
선택됨 → 업로드 중 → 임베딩 중 → 준비 완료
                         └──────→ 실패
```

현재 데모에서는 약 1.2~2.2초의 진행 애니메이션으로 보일 수 있으나, 운영에서는 파일 API의 실제 `progress`를 사용합니다.

---

## 5.2 대화 화면

### 목적

사용자 질의와 AI 답변을 시간 순서로 보여 주며, 답변 유형에 따라 지침·통계·비서 결과를 분리해서 보여 줍니다.

### 상단바 실제 라벨

- 사이드바 토글
- 현재 대화 제목
- `알림`
- `비서마켓`
- 새 대화 또는 닫기 관련 아이콘

### 메시지 구조

```ts
type ConversationMessage = {
  id: string;
  role: 'user' | 'assistant';
  query?: string;
  text?: string;
  queryKind?: QueryKind;
  panels?: AnswerPanel[];
  createdAt: string;
  status: 'pending' | 'streaming' | 'completed' | 'failed';
  feedback?: Feedback;
  saved?: boolean;
};
```

### 사용자 메시지

- 오른쪽 정렬 또는 강조된 말풍선
- 질의 원문을 그대로 보여 준다.
- 분류 완료 후 답변 상단에 분류 배지 표시

### AI 답변 공통 구조

1. 분류 배지
   - 예: `RAG`
   - 예: `TAG`
   - 예: `RAG+TAG+비서`
   - 예: `지침·ERP 선택`
2. 사고 과정/상태 표시
   - `질의를 분석하고 있습니다…`
   - `관련 지침을 검색하고 있습니다…`
   - `업무 데이터를 조회하고 있습니다…`
   - `답변을 정리하고 있습니다…`
3. 답변 패널
4. 출처 또는 데이터 기준
5. 추천 비서
6. 액션바

### 사고 과정 표시 원칙

상세한 내부 추론을 노출하는 것이 아니라, 사용자가 이해할 수 있는 작업 상태만 표시합니다.

```text
질의 분석 → 관련 자료 확인 → 업무 데이터 조회 → 답변 작성
```

---

## 5.3 답변 패널 종류

### A. 지침(RAG) 답변 패널

표시 요소:

- 헤더: `지침 (RAG)`
- 설명: `관련 규정·지침 문서를 검색하여 답변드립니다`
- 답변 본문
- 출처 카드
  - 문서 제목
  - 문서 유형: `내부지침`
  - 조항 또는 페이지
- 관련도나 검색 기준이 있으면 보조 메타데이터

정확한 지침을 찾지 못한 경우:

- 강조 문구: `정확한 지침을 찾지 못했습니다`
- 설명: `요청하신 내용과 관련된 지침 및 자료를 검색했으나 정확히 일치하는 지침이 없습니다.`
- 관련 비서 추천 또는 `RAG 지침을 찾을까요?` 제안

### B. TAG 통계 답변 패널

표시 요소:

- 헤더: `TAG 통계 질의`
- 집계 제목: 예 `작업지시 입고 처리 현황`
- 요약 수치
- 표
- 막대 차트 또는 적합한 차트
- 데이터 기준 시각
- 조회 조건

예시 표:

| 상태 | 건수 |
|---|---:|
| 입고 처리 완료 | 23 |
| 검수 대기 | 3 |
| 입고 미처리 | 7 |

### C. Dual TAG 해석 패널

자연어가 여러 해석을 가질 때 사용합니다.

표시 요소:

- `해석 1 — 제품별 합계`
- `해석 2 — 라인별 합계`
- 해석 설명
- 추출된 파라미터
  - 월
  - 연도
  - 집계 기준
- 수정 가능한 파라미터
- `이 해석으로 조회`
- 표·차트

일반 사용자에게 SQL을 노출하지 않습니다. 관리자 또는 디버그 환경에서만 SQL을 표시할 수 있습니다.

### D. RAG A/B 비교 패널

서로 다른 지침 문서 또는 검색 결과를 비교해야 할 때 사용합니다.

- `A안`, `B안` 또는 의미 있는 제목
- 각 답변 본문
- 출처
- 차이점 요약
- 어느 답변이 더 적합한지에 대한 안내

### E. 비서 선택 패널

지침 답변 이후 관련 비서 사용을 제안할 수 있습니다.

- 제목: `이 업무에 맞는 비서를 선택해 보세요`
- 비서 이름
- 설명
- 카테고리
- `이 비서로 시작`
- `비서마켓에서 더 보기`

### F. 추천 비서 패널

답변 결과와 관련성이 높은 비서를 표시합니다.

- 비서명
- 적합도 또는 추천 이유
- `대화 시작`
- 상세 보기

---

## 5.4 질의 분류와 분기 규칙

### QueryKind 목록

```text
instruction
assistant-select
tag-stats
tag-assistant
dual-tag
dual-tag-assistant
ambiguous
rag-ab
rag-tag-assistant
minutes-request
minutes-result
fallback
fallback-assistant
route-select
```

서버가 `queryKind`를 최종 결정해야 합니다. 프론트는 질의 문자열을 검색해 분류 결과를 재판정하지 않고, 서버의 `classification.completed` 이벤트를 사용합니다.

### 분류 기준

| 유형 | 판단 기준 | 기본 UI |
|---|---|---|
| `instruction` | 규정, 지침, 방법, 절차를 묻는 질문 | RAG 지침 답변 |
| `assistant-select` | 특정 비서에게 작업을 요청하거나 비서 선택이 필요한 질문 | 비서 선택 |
| `tag-stats` | 건수, 합계, 현황, 추이 등 구조화 데이터 집계 | TAG 표·차트 |
| `tag-assistant` | 업무 데이터 조회 후 비서 해석이 필요한 질문 | TAG + 비서 |
| `dual-tag` | 집계 기준이 둘 이상으로 해석되는 질문 | 해석 선택 카드 |
| `dual-tag-assistant` | Dual TAG 결과와 비서 해석이 모두 필요한 질문 | 해석 + TAG + 비서 |
| `ambiguous` | 지침과 비서 또는 데이터의 의도가 불명확 | 선택 패널 |
| `rag-ab` | 두 지침 또는 두 검색 결과 비교 | RAG A/B |
| `rag-tag-assistant` | 지침, 업무 데이터, 관련 비서가 모두 필요 | RAG + TAG + 추천 비서 |
| `minutes-request` | 회의록 작성·정리 요청 | 회의록 비서 또는 지침+비서 |
| `minutes-result` | 회의록 결과 재진입 | 결과 표시 |
| `fallback` | 정확히 매칭되지 않음 | 일반 답변 또는 안내 |
| `fallback-assistant` | 일반 답변 후 관련 비서 추천 | 답변 + 추천 비서 |
| `route-select` | 입고 관련 질문이 지침인지 ERP인지 불명확 | 지침/ERP 선택 |

### 입고 선택형 질의

다음 예시 질의는 바로 답하지 않고 선택 패널을 보여 줍니다.

```text
입고 처리가 안된 작업 방법알려줘
```

비교할 때는 사용자 입력의 띄어쓰기 차이를 허용합니다. 구현 시 비교용 정규화 함수는 다음 의미를 가져야 합니다.

```ts
normalizeQuery(text) = text.trim().replace(/\s+/g, '')
```

선택 패널의 실제 라벨:

- `어떤 방향으로 찾아볼까요?`
- `지침에서 찾기`
  - `관련 규정·업무 지침을 검색합니다`
- `ERP 입고 현황 조회`
  - `실제 작업지시와 입고 상태를 조회합니다`

선택 후:

```text
지침에서 찾기
  → instruction 또는 RAG 응답

ERP 입고 현황 조회
  → tag-stats
  → 입고 미처리 작업지시 7건 등 표·차트
```

### 자동 후속 질의 금지

- AI가 제안 문장을 자동으로 생성하거나 자동 전송하지 않습니다.
- 사용자가 직접 `이어서 질의`를 클릭하고 입력해야 합니다.
- 버튼 클릭은 AI 호출이 아니라 입력창 포커스 이동과 컨텍스트 설정만 수행합니다.
- 실제 전송 시 `followUpOfMessageId`를 포함한 일반 메시지 API를 호출합니다.

---

## 5.5 대화 액션바

답변 완료 후 각 답변 패널 또는 메시지 하단에 표시합니다.

액션:

- 좋아요
- 싫어요
- 별점 1~5
- 저장
- 복사
- `MD 다운로드`
- `이어서 질의`
- 필요 시 재생성

### 방향별 피드백

- 좋아요를 선택하면 녹색 별점만 활성화한다.
- 싫어요를 선택하면 빨간 별점만 활성화한다.
- 좋아요 상태에서 음수 별점을 선택할 수 없다.
- 싫어요 상태에서 양수 별점을 선택할 수 없다.
- 별점을 선택하지 않으면 `rating=0`으로 보낸다.
- 피드백 사유는 복수 선택 가능하다.

사유 코드:

```text
SOURCE
RELEVANCE
COMPLETENESS
RECENCY
DATA
FORMAT
ACTIONABILITY
```

피드백 제출 예:

```json
{
  "sentiment": "up",
  "rating": 4,
  "reasons": ["SOURCE", "RELEVANCE"],
  "comment": "출처가 명확하고 바로 업무에 사용할 수 있었습니다."
}
```

---

## 5.6 비서마켓

### 목적

공식 비서와 조직 내 비서를 탐색하고, 즐겨찾기하고, 상세 정보를 확인하고, 복제하거나 대화를 시작하는 화면입니다.

### 상단·주요 라벨

- `비서마켓`
- `추천`
- `통계`
- `공개 전 테스트`
- `내가 만든 비서`
- `전체 비서`
- `비서 만들기`
- `검색`
- `카테고리`
- `정렬`
- `즐겨찾기`
- `상세 보기`
- `대화 시작`
- `복제하기`
- `통계 보기`

### 카테고리

```text
글쓰기
코드
번역
분석
법률·회계
```

### 예시 비서

| 이름 | 설명 | 카테고리 |
|---|---|---|
| 회의록 문장정리 | 회의 내용을 체계적인 문서로 자동 정리 | 글쓰기 |
| 이메일 문체변경 | 격식·비격식 문체를 자동으로 변환 | 글쓰기 |
| 보도자료 초안 | 전문 보도자료 자동 작성 | 글쓰기 |
| 블로그 글쓰기 | SEO 최적화된 블로그 포스트 작성 | 글쓰기 |
| 코드 리뷰 비서 | 버그·스타일·보안 취약점 자동 리뷰 | 코드 |
| 코드 최적화 | 성능 병목 탐지와 리팩토링 제안 | 코드 |
| 테스트 코드 생성 | 유닛·통합 테스트 자동 생성 | 코드 |
| 번역 비서 | 다국어 고품질 자연스러운 번역 | 번역 |
| 동시통역 비서 | 실시간 대화 동시통역 지원 | 번역 |
| 데이터 분석 비서 | 엑셀·CSV를 차트와 인사이트로 | 분석 |
| 문서 요약 비서 | PDF·보고서·계약서 핵심 요약 | 분석 |
| 시장조사 비서 | 경쟁사·트렌드 자동 분석 리포트 | 분석 |
| 법률 자문 비서 | 판례 검색과 계약 조항 리스크 점검 | 법률·회계 |
| 계약서 검토 비서 | 핵심 조항 위험도 자동 판별 | 법률·회계 |
| 회계 정산 비서 | 증빙 정리와 정산서 자동화 | 법률·회계 |

### 비서 카드

각 카드에 포함:

- 아이콘
- 비서 이름
- 한 줄 설명
- 카테고리 배지
- 공식/개인/승인 상태
- 별점 또는 사용량
- 즐겨찾기 하트
- `대화 시작`
- 카드 클릭 시 상세 모달

### 비서 상세 모달

포함 데이터:

- 이름·아이콘·설명
- 전체 설명
- 제작자
- 버전
- 공개 범위
- 평점·평가 수
- 좋아요·싫어요
- 평점 분포
- 대화 스타터
- 기능·연결 정보
- 댓글
- 제작자의 다른 비서

액션:

- `대화 시작`
- `복제하기`
- `URL 복사`
- 즐겨찾기
- 통계 확인

### 즐겨찾기

- 하트 클릭으로 추가·삭제한다.
- 즐겨찾기 목록은 개인 설정의 `즐겨찾기 비서`에서 관리한다.
- 비어 있을 때:
  - `즐겨찾기가 없습니다`
  - `비서마켓의 공식 비서 또는 전체 비서 탭에서 추가해보세요.`

---

## 5.7 비서 생성·수정 화면

### 시작 화면

상단:

- `비서 만들기`
- `자연어로 비서 초안 만들기`
- 설명 문구
- 자연어 입력창
- `초안 생성`

예시 placeholder:

```text
어떤 비서를 만들고 싶은지 한 문장으로 설명해 주세요.
```

### 초안 생성 결과

AI가 다음 필드를 제안합니다.

- 이름
- 설명
- 아이콘
- 지침
- 금지사항
- 대화 스타터
- 첫 메시지
- 파운데이션 모델 사용 여부

### 기본 정보 섹션

- `비서 이름`
- `설명`
- `카테고리`
- 아이콘 선택
- 아이콘 색상

아이콘 선택 모달:

- 검색
- 카테고리
- 아이콘 그리드
- 아이콘 이름
- `선택`
- `취소`

### 지침 섹션

- `비서 지침`
- 긴 텍스트 영역
- `금지사항`
- 항목 추가·삭제
- `첫 메시지`
- `대화 스타터`
- 스타터 추가·삭제

### 연결 섹션

- `MCP`
- `API`
- 관리자 승인 완료된 연결만 표시
- 연결별 이름·설명·권한
- 읽기 전용과 읽기/쓰기 구분

### 지식 데이터셋 섹션

- 파일 업로드
- 데이터셋 선택
- 임베딩 상태
- 파일 삭제
- `ready`가 아닌 파일은 비서 생성에 포함하지 않도록 안내

### 공개 범위 섹션

- `나만 사용`
- `지정 사용자`
- `부서 공개`
- `전사 공개`
- 지정 사용자 선택
- 공개 전 테스트 요청 여부

### 저장 상태

```text
작성 중(draft)
  → 저장
  → 비공개(private)
  → 공개 요청
  → 검토 중(pending_review)
  → 승인(approved/official)
     또는 반려(rejected)
     또는 수정 요청(request_changes)
```

---

## 5.8 관리자 승인 MCP/API 연결

관리자 또는 운영 화면에서 다음을 관리합니다.

- 연결 가능한 MCP 목록
- 연결 가능한 API 목록
- 연결 상태
- 권한 범위
- 설명
- 비서에 연결할 수 있는지 여부
- 공개 승인 요청

실제 라벨 예:

- `연결 관리`
- `MCP 서버`
- `API 연결`
- `승인 대기`
- `승인`
- `반려`
- `수정 요청`
- `권한`
- `읽기`
- `읽기·쓰기`

보안 원칙:

- 브라우저에서 관리자 여부를 판단해도 서버는 항상 다시 검사한다.
- 승인되지 않은 MCP/API ID를 클라이언트가 보내도 서버에서 거절한다.
- 연결 자격 증명은 일반 UI 응답이나 로그에 노출하지 않는다.

---

## 5.9 개인 설정

### 모달 구조

- 모달 제목: `개인 설정`
- 사용자 표시:
  - 아바타
  - `김동현`
- 왼쪽 탭:
  - `표시`
  - `비서`
  - `알림`
  - `사용량`
- 오른쪽 콘텐츠
- 닫기 버튼
- 사용량 탭을 제외한 현재 화면에는 `취소`, `저장` footer가 있다.

> 메모리 관리는 구현 컴포넌트가 존재하지만 현재 기본 탭 목록에는 직접 노출되지 않는 상태입니다. 재구축에서 메모리를 사용자 기능으로 제공하려면 `메모리`를 별도 탭으로 추가하거나 `표시`·`비서` 중 하나에서 명확히 진입시켜야 합니다. API 계약은 이미 별도로 정의합니다.

### 표시 탭

헤더:

- `화면 표시`
- `인터페이스의 색상·글꼴·밀도를 조정합니다.`

옵션:

- 테마:
  - `라이트`
  - `다크`
- 글꼴 크기:
  - `작게 (12px)`
  - `보통 (14px)`
  - `크게 (16px)`
- 표시 밀도:
  - `넓게`
  - `표준`
  - `좁게`

보조 문구:

- `항목 간 여백 넉넉`
- `기본 여백`
- `최대한 많은 항목 표시`
- `미리보기`

### 비서 탭

현재 사용 가능한 비서 관리:

- `사용할 비서`
- `비서 이름·카테고리 검색…`
- 선택된 비서 칩
- `총 N개 선택됨`
- `검색 결과가 없습니다.`

비서 표시 순서:

- `비서 표시 순서`
- `1위가 '비서 선택' 팝업의 맨 아래, 마지막 순위가 맨 위에 표시됩니다.`
- 위로 이동
- 아래로 이동
- 목록에서 삭제

즐겨찾기:

- `즐겨찾기 비서`
- `삭제`
- `총 N개`

### 알림 탭

헤더:

- `알림 설정`
- `알림 센터 배지·목록 표시와 수신할 알림 종류를 선택하세요.`

알림 센터:

- `뱃지 표시`
- `목록 표시`

알림 수신:

- `비서 업데이트 알림`
- `새 비서 출시 알림`
- `N개 활성`

### 사용량 탭

중요 정책:

- ChatGPT·Claude 모델 선택 UI를 제품의 모델 선택 기능으로 사용하지 않는다.
- 사용량 화면은 서비스별 기본 모델 또는 비용 산정 기준을 설명하는 용도로만 사용한다.
- `Input Tokens`, `Cached Input Tokens`, `Output Tokens`를 표시하지 않는다.
- `Total Tokens`만 표시한다.
- 비용은 반드시 `Estimated Cost · 예상 비용`으로 표시한다.
- ChatGPT와 Claude 모두 공통 환율 `1,400원/USD`를 적용한다.
- 실측 토큰 유형별 비용이 없는 데모·집계 환경에서는 확정 비용처럼 표시하지 않는다.

표시 요소:

- 기간 탭:
  - `오늘`
  - `어제`
  - `주간`
  - `누적`
- `토큰 상세`
- `Total Tokens`
- `전체 토큰 기준`
- `유형별 구분 없음`
- `실행 결과 및 비용`
- `예상 비용`
- `Estimated Cost · 예상 비용`
- `토큰 한도`
- `질의 건수`
- `비서별 사용량`
- `전일 대비`
- 제한이 없는 경우 `제한 없음`

비용 계산:

```text
estimatedCostUsd
  = totalTokens / 1,000,000 × estimatedAverageUsdPerMillion

estimatedCostKrw
  = estimatedCostUsd × 1,400
```

실제 공급자별 토큰 단가가 확정되지 않았거나 토큰 유형별 실측이 없으면 다음 메타데이터를 함께 제공합니다.

```json
{
  "estimated": true,
  "estimationMethod": "total_tokens_average_rate",
  "exchangeRateKrw": 1400
}
```

사용량 모달에는 `취소`·`저장` 버튼을 두지 않습니다. 기간이나 표시 기준 변경 즉시 화면에 반영합니다.

---

## 5.10 메모리 관리

메모리는 AI가 대화에서 학습한 사용자 선호·사실·지침을 관리하는 기능입니다.

### 라벨

- `대화 메모리`
- `AI가 대화에서 학습한 선호·사실·지침을 관리합니다.`
- `대화 기억하기`
- `대화에서 드러난 선호·사실을 저장해 다음 대화에서 참고합니다`
- `기억하는 것`
- `모든 대화에서 공유`
- `추가`
- `저장`
- `모든 기억 삭제`

### 메모리 유형

- `지침`
  - 예: `답변은 항상 표로 정리해 준다`
- `사실`
  - 예: `장비예약 승인 업무를 담당한다`
- `선호`
  - 예: `보고서 초안은 개조식보다 서술형을 선호한다`

### 범위

- `전체`
- `업무 도우미`
- `회의록 비서`
- `번역 비서`
- `코드 리뷰 비서`

표시 규칙:

- `전체`는 `모든 대화에서 공유`로 표시한다.
- 특정 비서 범위는 해당 비서 아이콘과 이름으로 표시한다.
- 항목별 수정, 범위 변경, 삭제를 지원한다.
- 메모리 저장을 끄면 목록을 흐리게 표시하고 편집을 비활성화한다.
- 항목이 없을 때:
  - `아직 기억한 것이 없습니다.`
  - 대화를 나누면 유용한 내용만 쌓인다는 안내를 표시한다.

---

## 5.11 저장 목록

### 열기

- 사이드바의 `저장목록` 클릭
- 답변 액션바의 저장 클릭
- 패널이 사이드바 오른쪽에서 펼쳐짐

### 저장 항목

```ts
type SavedAnswer = {
  id: string;
  messageId: string;
  query: string;
  answer: string;
  savedAt: string;
};
```

### 동작

- 최신 저장순 표시
- 저장 상태를 답변 액션바에 반영
- 이미 저장된 메시지는 중복 저장 정책을 서버에서 결정한다.
- 항목 삭제 시 즉시 목록에서 제거한다.
- 마지막 항목을 삭제하면 빈 상태로 전환한다.
- 답변의 Markdown 표기 일부는 목록 미리보기에서 평문으로 정리할 수 있다.

---

## 5.12 알림 센터

### 알림 유형

- `alert`: 보안·주의
- `info`: 일반 정보
- `success`: 처리 완료

예시:

- `보안 알림`
  - `어제 외부 IP에서 로그인 시도가 감지되었습니다.`
- `비서 업데이트`
  - `회의록 문장정리 비서가 v1.3으로 업데이트되었습니다.`
- `답변 저장 완료`
  - `계약 협상 관련 답변이 저장 목록에 추가되었습니다.`
- `브리핑 게시됨`
  - `오늘 오전 8:30 AI 브리핑이 게시되었습니다.`

### 동작

- 읽지 않은 알림은 제목 옆 점과 상단 배지로 구분
- 항목 클릭 시 읽음 처리
- `모두 읽음` 클릭 시 모든 미읽음 항목 처리
- 항목별 삭제
- 빈 상태: `알림이 없습니다`

---

## 5.13 아침 브리핑

### 목적

조직과 개인에게 관련된 AI 사용 흐름, 급상승 주제, 많이 본 주제를 매일 요약합니다.

### 상단 라벨

- `아침 브리핑`
- `매일 08:30 갱신`
- `알림`
- `비서마켓`
- `닫기`

### 카드 구성

- 날짜
- 제목: `아침 브리핑`
- 부제: `오늘 업무와 조직의 주요 흐름을 확인하세요.`
- 도움말 아이콘
- 세 개의 주제 블록:
  - `나에게 관련`
  - `급상승 주제`
  - `많이 본 주제`
- 각 블록의 항목 수: `최대 N건`
- 항목별 순위
- 주제 제목
- 요약
- 증감 또는 관련성 배지
- `바로 질문하기`

### 안내 기준

브리핑은 이번 주 대화를 유사 그룹으로 클러스터링하고, 전주 대비 증가율과 고유 사용자 수 기준으로 선별합니다.

- 타인의 답변 본문은 표시하지 않는다.
- 브리핑의 `바로 질문하기`는 현재 사용자 권한으로 새 대화를 시작한다.
- 브리핑 항목 API는 다른 사용자의 답변 본문을 포함하지 않는다.

### 도움말

도움말 팝오버는 다음을 설명합니다.

- 어떤 대화가 집계되는지
- 개인 관련과 조직 인기 주제의 차이
- 증가율의 기준
- 개인정보 및 타인 답변 보호 원칙

---

## 5.14 이용 매뉴얼·도움말

### 화면 목적

사용자가 기능을 자연어로 검색하고, 빠른 주제 버튼으로 주요 기능 안내를 읽도록 합니다.

### 라벨 예시

- `이용 매뉴얼`
- `무엇이 궁금한가요?`
- `기능을 검색해 보세요`
- `빠른 도움말`
- `비서 만들기`
- `비서 사용하기`
- `메모리 관리`
- `사용량 확인`
- `저장목록`
- `알림 센터`

### 동작

- 검색어를 입력하면 토픽 제목·키워드·본문에서 검색
- 자연어 질문은 `도움말 질문 API`로 전송
- 답변은 Markdown으로 표시
- 관련 토픽과 일치 confidence를 내부적으로 받을 수 있다.
- 검색 결과가 없을 때 명확한 안내를 표시한다.

---

## 6. 질의 처리의 상세 상태 머신

### 6.1 메시지 상태

```text
idle
  → sending
  → classifying
  → thinking
  → tool_running
  → streaming
  → completed
  → saved / feedback_submitted (선택)
```

실패:

```text
thinking 또는 streaming
  → failed
  → 재생성 가능
```

### 6.2 스트리밍 이벤트

SSE 기본 이벤트:

```text
message.started
classification.completed
answer.started
answer.delta
sources.completed
stats.completed
interpretation.completed
recommendations.completed
tool.started
tool.completed
answer.completed
message.completed
message.failed
```

예시:

```text
event: message.started
data: {"messageId":"msg_ai_1","queryKind":"rag-tag-assistant"}

event: classification.completed
data: {"queryKind":"rag-tag-assistant","label":"RAG+TAG+비서"}

event: answer.started
data: {"panel":"rag","panelId":"panel_rag_1"}

event: answer.delta
data: {"panelId":"panel_rag_1","text":"작업지시의 "}

event: sources.completed
data: {"panelId":"panel_rag_1","sources":[{"id":"src_1","title":"자재 입고 처리 업무 지침 제7조","type":"내부지침"}]}

event: stats.completed
data: {"panelId":"panel_tag_1","table":{"title":"작업지시 입고 처리 현황","columns":["상태","건수"],"rows":[["입고 처리 완료",23],["검수 대기",3]]},"chart":{"type":"bar","data":[{"label":"완료","value":23}]}}

event: answer.completed
data: {"panelId":"panel_rag_1"}

event: message.completed
data: {"messageId":"msg_ai_1","status":"completed"}
```

### 6.3 프론트 상태와 서버 데이터 매핑

| 프론트 상태 | 서버 원천 |
|---|---|
| `activeView` | 라우터 및 대화·마켓 응답 |
| `sidebarOpen` | 로컬 UI 상태 |
| `assistantContext` | 대화 생성의 `assistantId`와 상세 응답 |
| `savedItems` | 저장 답변 목록 API |
| `notifUnread` | 알림 목록의 `meta.unreadCount` |
| `favorites` | 즐겨찾기 API |
| `assistantOrder` | 비서 순서 API |
| `messages` | 대화 상세 API + 메시지 SSE |
| `queryKind` | `classification.completed` |
| `streaming` | `answer.started`부터 `answer.completed` |
| `answerDoneSet` | `message.completed` |
| `awaitingFollowUp` | 프론트 로컬 상태 |
| `feedbackModal` | 프론트 로컬 상태 + feedback mutation |
| `theme`, `fontSize`, `density` | 개인 표시 설정 API |
| 메모리 목록 | 메모리 API |

---

## 7. 데이터 모델

### 7.1 User

```ts
type User = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  role: 'user' | 'assistant_owner' | 'reviewer' | 'admin';
  department: string | null;
  permissions: {
    canCreateAssistant: boolean;
    canPublishAssistant: boolean;
    canReviewAssistant: boolean;
    canManageConnectors: boolean;
  };
  locale: 'ko-KR' | string;
  timezone: string;
};
```

### 7.2 Conversation

```ts
type Conversation = {
  id: string;
  title: string;
  assistantId: string | null;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
};
```

대화 이력 목록에는 다음을 추가할 수 있습니다.

- `lastMessagePreview`
- `queryKinds`
- `badges`
- `messageCount`

날짜 그룹:

- `오늘`
- `어제`
- `지난 7일`
- 전체

### 7.3 Message와 AnswerPanel

```ts
type QueryKind =
  | 'instruction'
  | 'assistant-select'
  | 'tag-stats'
  | 'tag-assistant'
  | 'dual-tag'
  | 'dual-tag-assistant'
  | 'ambiguous'
  | 'rag-ab'
  | 'rag-tag-assistant'
  | 'minutes-request'
  | 'minutes-result'
  | 'fallback'
  | 'fallback-assistant'
  | 'route-select';

type AnswerPanel =
  | {
      id: string;
      type: 'rag';
      label: string;
      markdown: string;
      sources: Source[];
    }
  | {
      id: string;
      type: 'stats';
      title: string;
      columns: string[];
      rows: (string | number)[][];
      chart?: Chart;
    }
  | {
      id: string;
      type: 'interpretation';
      label: string;
      description: string;
      parameters: Parameter[];
      columns?: string[];
      rows?: (string | number)[][];
      chart?: Chart;
    }
  | {
      id: string;
      type: 'assistant-recommendation';
      candidates: AssistantCandidate[];
    }
  | {
      id: string;
      type: 'route-select';
      options: RouteOption[];
    };
```

### 7.4 Source

```ts
type Source = {
  id: string;
  title: string;
  type: '내부지침' | '매뉴얼' | '규정' | string;
  locator?: string;
  url?: string;
  relevance?: number;
};
```

### 7.5 Assistant

```ts
type Assistant = {
  id: string;
  name: string;
  description: string;
  fullDescription?: string;
  icon: {
    name: string;
    background: string;
    color: string;
  };
  category: '글쓰기' | '코드' | '번역' | '분석' | '법률·회계' | string;
  author: {
    id: string;
    name: string;
  };
  version: string;
  status:
    | 'draft'
    | 'official'
    | 'approved'
    | 'updating'
    | 'pending_review'
    | 'rejected'
    | 'pre_public_test';
  visibility: 'private' | 'designated' | 'department' | 'company';
  isFavorite: boolean;
  userCount: number;
  dialogueCount: number;
  messageCount: number;
  conversationStarters: string[];
  rating?: number;
  ratingCount?: number;
  createdAt: string;
  updatedAt: string;
};
```

### 7.6 Memory

```ts
type Memory = {
  id: string;
  kind: 'instruction' | 'fact' | 'preference';
  text: string;
  scope: 'all' | 'assistant';
  assistantId: string | null;
  source: 'conversation' | 'manual' | string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};
```

표시용 한국어:

```text
instruction → 지침
fact        → 사실
preference  → 선호
all         → 전체
```

---

## 8. 권장 API 계약

### 8.1 공통 규칙

```text
Base URL: /api/v1
Health:   /api/healthz
JSON:     application/json; charset=utf-8
Upload:   multipart/form-data
Time:     ISO 8601 UTC
Auth:     세션 쿠키, credentials: include
```

성공 응답:

```json
{
  "data": {},
  "meta": {
    "requestId": "req_01J...",
    "generatedAt": "2026-08-24T06:00:00Z"
  }
}
```

목록 응답:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 42,
    "hasNext": true,
    "requestId": "req_01J...",
    "generatedAt": "2026-08-24T06:00:00Z"
  }
}
```

오류 응답:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "요청 값을 확인해 주세요.",
    "fields": {
      "name": "이름은 1자 이상이어야 합니다."
    }
  },
  "meta": {
    "requestId": "req_01J..."
  }
}
```

상태 코드:

| HTTP | 코드 | 화면 처리 |
|---:|---|---|
| 400 | `BAD_REQUEST` | 요청 형식 오류 |
| 401 | `UNAUTHENTICATED` | 로그인 또는 세션 갱신 |
| 403 | `FORBIDDEN` | 권한 없음 |
| 404 | `NOT_FOUND` | 대상 없음, 목록 갱신 |
| 409 | `CONFLICT` | 최신 데이터 재조회 |
| 413 | `FILE_TOO_LARGE` | 파일 크기 안내 |
| 422 | `VALIDATION_ERROR` | 필드별 오류 |
| 429 | `RATE_LIMITED` | 재시도 대기 |
| 500 | `INTERNAL_ERROR` | requestId와 오류 안내 |
| 502/504 | `UPSTREAM_ERROR` | AI·외부 시스템 일시 오류 |

### 8.2 초기화·홈

```text
GET /me
GET /home?include=shortcuts,frequent,recent,stats
GET /me/preferences
PATCH /me/preferences
GET /assistants/shortcuts
```

### 8.3 대화

```text
GET  /conversations
GET  /conversations/:conversationId
POST /conversations
POST /conversations/:conversationId/messages
GET  /conversations/:conversationId/export?format=md
POST /messages/:messageId/regenerate
```

대화 생성:

```json
{
  "title": null,
  "assistantId": "ast_meeting",
  "initialQuery": "오늘 계약 검토 회의 내용을 정리해 줘",
  "source": "home"
}
```

메시지 요청:

```json
{
  "text": "입고 처리가 안 된 작업지시가 있어?",
  "assistantId": null,
  "fileIds": ["fil_123"],
  "followUpOfMessageId": null,
  "clientMessageId": "client_01J..."
}
```

`source` 허용 값:

```text
home | market | history | briefing | assistant
```

### 8.4 파일·임베딩

```text
POST   /files
GET    /files/:fileId
DELETE /files/:fileId
```

파일 목적:

```text
conversation | assistant_knowledge
```

상태:

```text
uploaded | indexing | ready | failed | deleted
```

### 8.5 답변 액션

```text
POST   /messages/:messageId/feedback
POST   /messages/:messageId/save
DELETE /messages/:messageId/save
GET    /me/saved-answers
DELETE /me/saved-answers/:savedAnswerId
PATCH  /messages/:messageId/panels/:panelId/parameters
POST   /messages/:messageId/panels/:panelId/rerun
```

### 8.6 비서마켓·비서 CRUD

```text
GET    /assistants?scope=official
GET    /assistants?scope=mine
GET    /assistants?scope=all
GET    /assistants/:assistantId
POST   /assistants
PATCH  /assistants/:assistantId
DELETE /assistants/:assistantId
POST   /assistants/:assistantId/clone
POST   /assistants/:assistantId/publish
GET    /assistants/:assistantId/stats
GET    /assistants/:assistantId/comments
```

즐겨찾기·순서:

```text
GET    /me/favorites
PUT    /me/favorites/:assistantId
DELETE /me/favorites/:assistantId
GET    /me/assistant-order
PUT    /me/assistant-order
```

### 8.7 비서 초안·연결·데이터셋

```text
POST /assistant-drafts
GET  /datasets
GET  /connectors/available
GET  /apis/available
GET  /icons
```

초안 생성:

```json
{
  "prompt": "우리 회사 매뉴얼을 참고해 답변해주는 비서",
  "locale": "ko-KR"
}
```

비서 저장 요청의 핵심 필드:

```json
{
  "name": "내부 보고서 요약",
  "description": "기안문·보고서 핵심 요약 및 키워드 추출",
  "category": "분석",
  "icon": {
    "name": "BookOpen",
    "background": "#F4F3FC",
    "color": "#4F46E5"
  },
  "instructions": "당신은 보고서 요약 전문 비서입니다...",
  "prohibitions": ["확인되지 않은 내용을 추가하지 않습니다."],
  "conversationStarters": ["이 보고서를 핵심만 요약해 주세요."],
  "knowledgeFileIds": ["fil_123"],
  "firstMessage": "안녕하세요! 요약할 문서를 공유해 주세요.",
  "useFoundationModel": true,
  "visibility": "private",
  "designatedUserIds": [],
  "datasetIds": ["legal"],
  "connectorIds": ["github"],
  "apiIds": ["erp"],
  "requestReview": false
}
```

### 8.8 브리핑

```text
GET  /briefings/today?date=2026-09-01&blocks=personal,trending,popular
POST /briefings/items/:topicId/query
GET  /help/briefing
```

### 8.9 설정·메모리·사용량

```text
GET/PATCH /me/preferences
GET/PATCH /me/assistant-preferences
GET/PATCH /me/notification-preferences
GET       /me/usage
GET/POST/PATCH/DELETE /me/memories
DELETE    /me/memories
```

메모리 범위:

```text
scope=all|assistant
assistantId=<assistantId>
```

사용량 기간:

```text
today | yesterday | week | month | cumulative
```

권장 사용량 응답:

```json
{
  "data": {
    "period": "month",
    "queryCount": 4821,
    "tokenUsage": {
      "totalTokens": 1280000
    },
    "cost": {
      "provider": "service-default",
      "model": "default",
      "exchangeRateKrw": 1400,
      "estimatedAverageUsdPerMillion": 7.2,
      "estimatedCostUsd": 9.216,
      "estimatedCostKrw": 12902,
      "estimated": true,
      "estimationMethod": "total_tokens_average_rate"
    },
    "remainingCredits": 74,
    "limit": 100,
    "unit": "percent",
    "series": [
      { "date": "2026-08-23", "value": 198 }
    ]
  }
}
```

### 8.10 알림·도움말

```text
GET    /notifications
PATCH  /notifications/:notificationId
POST   /notifications/read-all
DELETE /notifications/:notificationId
GET    /help/topics
POST   /help/query
```

### 8.11 관리자

```text
GET   /admin/connectors
GET   /admin/assistant-approval-requests
GET   /admin/assistant-approval-requests/:requestId
PATCH /admin/assistant-approval-requests/:requestId
GET   /admin/datasets
POST  /admin/datasets
PATCH /admin/datasets/:datasetId
```

---

## 9. 데모 데이터와 실제 서비스 교체 지점

### 9.1 현재 데모로 남아 있는 항목

- 홈 통계
- 추천 비서와 공식 비서 목록
- 대화 이력
- 질의 분류
- RAG 답변 및 출처
- TAG/ERP 입고 현황
- 표와 차트
- 저장 목록
- 알림 목록
- 브리핑
- 메모리
- 사용량·비용
- 사용자 이름과 아바타
- 비서 상세 통계와 댓글
- 아이콘 목록
- 관리자 승인 MCP/API 목록

### 9.2 실제 API로 바꾸는 방법

#### 단계 1: 조회 데이터 연결

1. `/me`
2. `/home`
3. `/conversations`
4. `/assistants`
5. `/notifications`
6. `/me/saved-answers`

컴포넌트 내부 상수 대신 query cache를 사용하고, 로딩·오류·빈 상태를 구분합니다.

#### 단계 2: 대화 스트리밍

1. 대화 생성
2. 메시지 전송
3. SSE 연결
4. `classification.completed` 수신
5. 패널별 `answer.delta` 수신
6. 표·차트·출처 이벤트 수신
7. 완료·실패 처리

#### 단계 3: mutation 연결

- 저장/삭제
- 피드백
- 즐겨찾기
- 알림 읽음/삭제
- 비서 순서
- 메모리 CRUD
- 파일 삭제

#### 단계 4: 운영 연동

- ERP/TAG 실제 조회
- 사내 문서 색인 및 RAG
- MCP/API 권한 관리
- 비서 공개 승인
- 실제 사용량 집계
- 감사 로그

### 9.3 데모 수치 처리 원칙

데모 데이터를 운영 데이터처럼 보이게 하지 않습니다.

- 브리핑은 `데모 데이터` 또는 실제 API 생성 시각을 명시할 수 있다.
- 비용은 `예상 비용`으로 표시한다.
- 출처가 실제 문서가 아니면 링크를 제공하지 않는다.
- 입고 현황의 7건은 fixture일 뿐, 운영 데이터로 간주하지 않는다.
- 인증되지 않은 개발 환경에서 보호된 API의 `401`은 정상적인 상태로 취급한다.

---

## 10. 스타일·디자인 시스템

### 10.1 시각적 방향

- 조용하고 업무용인 라벤더·보라색 UI
- 카드와 패널은 둥근 모서리
- 얇은 테두리와 낮은 그림자
- 정보량은 많지만 시각적 계층은 명확하게 유지
- 작업 상태는 보라색, 성공은 녹색, 경고는 노란색, 오류는 빨간색
- 헤딩은 진하고, 보조 텍스트는 회색·라벤더

### 10.2 색상 토큰

라이트 테마 주요 색상:

| 용도 | 색상 |
|---|---|
| 기본 배경 | `#FFFFFF` |
| 보조 배경 | `#F9F8FF` |
| 카드·입력 배경 | `#FAFAFF` |
| hover 배경 | `#F4F3FC` |
| 선택 배경 | `#F0EEFF` |
| 주요 보라 | `#4F46E5` |
| 주요 보라 hover | `#4338CA` |
| 본문 | `#1A1826` |
| 보조 본문 | `#6B6882` |
| 비활성 본문 | `#A8A6C0` |
| 테두리 | `#E4E2F0` |
| 선택 테두리 | `#C7C3F7` |
| 성공 | `#10B981` 또는 `#16A34A` |
| 오류 | `#EF4444` |
| 경고 | `#F59E0B` |
| 정보 | `#0284C7` |

카테고리 색상:

| 카테고리 | 배경 | 글자 |
|---|---|---|
| 글쓰기 | `#EEF0FF` | `#4F46E5` |
| 코드 | `#E0F2FE` | `#0284C7` |
| 번역 | `#F0FDF4` | `#16A34A` |
| 분석 | `#FFF7ED` | `#D97706` |
| 법률·회계 | `#FFF5F5` | `#DC2626` |

### 10.3 타이포그래피

- 기본 폰트: `Jeju Samdasoo`
- fallback: `sans-serif`
- 본문은 읽기 쉬운 13~14px을 중심으로 한다.
- 상단바 제목은 약 16px, 주요 화면 제목은 19px 전후
- 작은 메타 정보는 10~12px
- 대화 답변은 카드 내부 여백과 line-height를 넉넉하게 둔다.
- 데이터 표는 숫자 정렬을 맞추고, 제목·단위를 분리한다.

### 10.4 컴포넌트 형태

- 기본 radius: `rounded-xl` 또는 `rounded-2xl`
- 버튼 radius: `rounded-lg`
- 카드 border: 1px solid
- 모달 backdrop:
  - `rgba(26,24,38,0.45)`
  - 약한 blur
- transition은 150~300ms
- 패널 열림은 width/translate/opacity를 함께 전환

### 10.5 아이콘

Lucide React를 기본으로 사용합니다.

- 버튼은 아이콘만 있는 경우 tooltip과 `aria-label`을 제공
- 상태 아이콘은 색상만으로 의미를 전달하지 않는다.
- 아이콘 선택 기능은 서버 목록과 동기화할 수 있으나 색상 팔레트는 우선 프론트 토큰으로 유지한다.

---

## 11. 다크모드

### 동작

- 테마 값: `light | dark`
- `localStorage` 키: `jpdc-theme`
- HTML root에 `dark` 클래스를 토글
- 새로고침 후에도 선택을 유지
- 설정 모달의 `라이트`, `다크` 선택과 사이드바 빠른 토글이 동일 상태를 갱신해야 한다.

### 다크 팔레트

| 용도 | 색상 |
|---|---|
| body 배경 | `#0F0D1A` |
| 주요 표면 | `#1A1726` |
| 보조 표면 | `#252237` |
| 카드 | `#1E1C2E` |
| 테두리 | `#4A4870` |
| 보라 강조 | `#A8A5FF` |
| 주요 텍스트 | `#F2F0FF` |
| 보조 텍스트 | `#C0BEDC` |
| placeholder | `#8A88A8` |
| 스크롤 thumb | `#2E2B47` |

다크모드에서도 성공·경고·오류의 대비를 유지합니다.

---

## 12. 접근성·품질 기준

- 모든 버튼은 키보드로 접근할 수 있어야 한다.
- 모달은 열릴 때 첫 입력 또는 닫기 버튼으로 포커스를 이동한다.
- `Escape`로 모달·드로어를 닫을 수 있어야 한다.
- 토글은 `role="switch"`와 `aria-checked`를 사용한다.
- 탭은 `role="tablist"`, `role="tab"`, `aria-selected`를 사용한다.
- 알림 읽지 않음은 점뿐 아니라 텍스트·상태로도 확인 가능해야 한다.
- 차트는 표 데이터를 대체하지 않는다. 표와 차트를 함께 제공한다.
- 스트리밍 중인 답변은 스크린리더가 너무 자주 읽지 않도록 live region 정책을 둔다.
- 오류에는 사용자가 다음에 할 수 있는 행동을 함께 보여 준다.
- 빈 상태와 로딩 상태를 별도로 설계한다.
- 모바일에서 가로 스크롤이 필요한 표·탭은 의도적으로 표시한다.

---

## 13. 권장 구현 순서

### Phase 0: 기반

- [ ] 프로젝트 구조와 실행 명령 확정
- [ ] `PORT`, base path, proxy 설정
- [ ] 공통 색상·타이포그래피·다크 토큰 작성
- [ ] React Router 또는 기존 path router 구성
- [ ] 공통 Button, Card, Modal, Drawer, Tooltip, EmptyState 작성
- [ ] API client와 오류 타입 작성

### Phase 1: 앱 골격

- [ ] 앱 shell
- [ ] 사이드바 펼침/접힘
- [ ] 메인 상단바
- [ ] 모바일 drawer
- [ ] 홈 화면
- [ ] 대화 화면의 사용자/AI 메시지 기본 렌더링
- [ ] 다크모드와 localStorage

### Phase 2: 핵심 질의 경험

- [ ] 질의 입력과 Enter 전송
- [ ] 예시 질의 채우기
- [ ] 비서 선택
- [ ] 대화 생성
- [ ] SSE 수신기
- [ ] 분류 배지
- [ ] 스트리밍 답변
- [ ] 실패·재생성

### Phase 3: RAG/TAG

- [ ] 지침 답변
- [ ] 출처 카드
- [ ] 정확한 지침 없음 상태
- [ ] TAG 표
- [ ] 차트
- [ ] Dual TAG 해석 카드
- [ ] 파라미터 수정·재조회
- [ ] 입고 `route-select`
- [ ] 이어서 질의
- [ ] 추천 비서

### Phase 4: 답변 관리

- [ ] 방향별 좋아요·싫어요
- [ ] 1~5점 별점 제한
- [ ] 피드백 사유
- [ ] 저장·삭제
- [ ] 저장 목록 패널
- [ ] 복사
- [ ] Markdown 다운로드

### Phase 5: 마켓·비서 생성

- [ ] 공식·전체·내 비서 목록
- [ ] 검색·카테고리·정렬
- [ ] 즐겨찾기
- [ ] 상세 모달
- [ ] 복제
- [ ] 통계·댓글
- [ ] 비서 초안 생성
- [ ] 비서 builder
- [ ] 파일·지식 데이터셋
- [ ] 공개 범위

### Phase 6: 개인화

- [ ] 개인 설정 표시 탭
- [ ] 비서 순서
- [ ] 알림 설정
- [ ] 사용량
- [ ] 메모리 탭 또는 진입점
- [ ] 알림 센터
- [ ] 저장 목록 빈 상태

### Phase 7: 브리핑·운영

- [ ] 아침 브리핑
- [ ] 브리핑 항목으로 바로 질문
- [ ] 도움말·매뉴얼 검색
- [ ] 관리자 MCP/API 승인
- [ ] 권한 서버 검증
- [ ] 실제 ERP/TAG 연결
- [ ] 실제 RAG 색인
- [ ] 감사 로그·사용량 집계

---

## 14. 테스트 체크리스트

### 홈

- [ ] 홈 최초 로딩
- [ ] 예시 질의 클릭 시 자동 전송되지 않음
- [ ] 빈 질의 전송 방지
- [ ] 파일 첨부·삭제
- [ ] 파일 indexing·ready·failed 표시
- [ ] 비서 선택과 해제

### 대화

- [ ] 일반 지침 질의
- [ ] TAG 통계 질의
- [ ] RAG+TAG 복합 질의
- [ ] Dual TAG 해석 선택
- [ ] 입고 route-select 질의
- [ ] 띄어쓰기 다른 route-select 질의
- [ ] 지침 경로
- [ ] ERP 경로
- [ ] 표·차트 표시
- [ ] 스트리밍 중 새 질의 잠금
- [ ] 실패 후 재생성
- [ ] 이어서 질의가 자동 전송되지 않음
- [ ] `followUpOfMessageId` 포함

### 답변 액션

- [ ] 좋아요 후 녹색 별만 선택 가능
- [ ] 싫어요 후 빨간 별만 선택 가능
- [ ] 저장·저장 취소
- [ ] 저장 목록에 최신순 표시
- [ ] 저장 항목 삭제
- [ ] 목록 빈 상태
- [ ] 복사 성공 피드백
- [ ] Markdown 다운로드

### 비서마켓

- [ ] 탭 이동
- [ ] 검색 결과
- [ ] 검색 결과 없음
- [ ] 즐겨찾기 추가·삭제
- [ ] 상세 모달
- [ ] 대화 시작
- [ ] 비서 복제
- [ ] 내가 만든 비서 CRUD
- [ ] 공개 범위별 접근 제한

### 개인 설정·패널

- [ ] 라이트/다크 전환
- [ ] 새로고침 후 테마 유지
- [ ] 글꼴 크기 미리보기
- [ ] 밀도 미리보기
- [ ] 비서 순서 위/아래 이동
- [ ] 알림 토글
- [ ] 사용량 기간 탭
- [ ] Total Tokens만 표시
- [ ] Estimated Cost · 예상 비용 표시
- [ ] 환율 1,400원 고정
- [ ] 사용량 탭에 `취소`·`저장` 없음
- [ ] 메모리 추가·수정·범위 변경·삭제
- [ ] 알림 읽음·모두 읽음·삭제
- [ ] 알림 빈 상태

### 반응형·접근성

- [ ] 1440px 데스크톱
- [ ] 1024px 태블릿
- [ ] 767px 이하 모바일
- [ ] 키보드 탭 이동
- [ ] Escape 닫기
- [ ] 모달 포커스
- [ ] 아이콘 버튼 aria-label
- [ ] 차트와 표의 정보 동등성
- [ ] 다크모드 대비

---

## 15. 현재 구현과 운영 버전의 차이 요약

| 기능 | 현재 데모 구현 | 운영 재구축 |
|---|---|---|
| 사용자 | 하드코딩 표시명 | `GET /me`와 세션 |
| 홈 통계 | 컴포넌트 상수 | `/home` |
| 대화 목록 | 초기 배열 | `/conversations` |
| 질의 분류 | 브라우저 로직·데모 규칙 | 서버 분류 이벤트 |
| 답변 | 타이머 기반 모의 스트리밍 | SSE |
| RAG 출처 | 샘플 데이터 | 문서 검색 서비스 |
| TAG/ERP | 샘플 7건 및 차트 | 실제 ERP/API |
| 저장 | 메모리 배열 | saved answers API |
| 알림 | 컴포넌트 초기 배열 | notifications API |
| 메모리 | 로컬 상태 | memories API |
| 파일 임베딩 | 브라우저 타이머 | 파일·작업 큐·상태 API |
| 비서 목록 | 상수 목록 | assistants API |
| 비서 생성 | 데모 초안 | draft/assistant API |
| MCP/API | 승인 목록 상수 | 관리자 권한 API |
| 브리핑 | 정적 블록 | 브리핑 집계 API |
| 사용량 | 데모 숫자 | 실제 집계 API |
| 비용 | 평균 단가 기반 예상값 | 실제 과금 데이터가 있으면 확정값, 없으면 예상값 |

---

## 16. 최종 완료 기준

재구축이 완료되었다고 판단하려면 다음을 모두 만족해야 합니다.

1. 로그인 사용자 기준으로 홈과 사이드바가 로드된다.
2. 홈에서 예시 질의를 입력하고 대화 화면으로 이동할 수 있다.
3. 지침·TAG·RAG+TAG·비서 분기가 눈에 보이는 상태로 구분된다.
4. 입고 선택형 질의가 지침/ERP 선택 UI를 거친다.
5. 지침 경로와 ERP 경로가 각각 다른 결과 패널을 표시한다.
6. 표와 차트가 함께 표시되며 차트 없이도 데이터를 이해할 수 있다.
7. 답변 완료 후 피드백·별점·저장·복사·Markdown 다운로드가 동작한다.
8. 이어서 질의는 사용자 입력을 기다리며 자동 질의가 발생하지 않는다.
9. 비서마켓에서 상세 보기, 즐겨찾기, 대화 시작, 복제가 동작한다.
10. 비서 builder에서 자연어 초안 생성부터 저장까지 가능하다.
11. 알림과 저장 목록의 읽음·삭제·빈 상태가 동작한다.
12. 개인 설정의 표시·비서·알림·사용량이 동작한다.
13. 사용량은 `Total Tokens`, `Estimated Cost · 예상 비용`, 공통 환율 `1,400원` 정책을 지킨다.
14. 메모리를 추가·수정·범위 변경·삭제할 수 있다.
15. 브리핑과 매뉴얼이 각각 독립 화면으로 동작한다.
16. 다크모드와 모바일 레이아웃에서 주요 기능을 사용할 수 있다.
17. 모든 보호 API가 서버에서 세션과 권한을 검증한다.
18. 데모 데이터와 실제 API 데이터가 사용자에게 혼동되지 않는다.
19. 브라우저 콘솔에 새 오류가 없고, production build가 성공한다.
20. API 계약과 프론트 상태가 이 문서의 모델·이벤트 이름과 일치한다.

---

## 17. 관련 문서

- `README.md`: 프로젝트 개요, 실행 방법, 현재 데모·API 상태
- `artifacts/api-server/API_SPEC.md`: 전체 API 엔드포인트와 요청·응답 계약
- `artifacts/jpdc-ai/src/App.tsx`: 앱 shell, 전역 화면 전환, 패널 상태
- `artifacts/jpdc-ai/src/views/HomeView.tsx`: 홈
- `artifacts/jpdc-ai/src/views/ConversationView.tsx`: 대화·분류·답변 패널
- `artifacts/jpdc-ai/src/views/MarketView.tsx`: 비서마켓
- `artifacts/jpdc-ai/src/views/AssistantBuilderView.tsx`: 비서 builder
- `artifacts/jpdc-ai/src/components/SettingsModal.tsx`: 개인 설정·사용량·메모리
- `artifacts/jpdc-ai/src/components/BriefingModal.tsx`: 아침 브리핑
- `artifacts/jpdc-ai/src/components/SavedPanel.tsx`: 저장 목록
- `artifacts/jpdc-ai/src/components/NotifPanel.tsx`: 알림 센터
- `artifacts/jpdc-ai/src/index.css`: 색상·다크모드·반응형 스타일
# JPDC AI 재구축 명세서

> 다른 개발 프로젝트에서 현재 JPDC AI 웹앱의 기능, 화면, 상호작용, 데이터 구조와 운영 전환 지점을 재현하기 위한 상세 명세서입니다.  
> 문서 기준일: **2026-09-01 (화요일)**  
> 대상 제품: 제주개발공사(JPDC) 내부 업무용 AI 지원 웹앱  
> 현재 상태: 프론트엔드는 데모 데이터와 브라우저 로직으로 동작하며, API 서버에는 헬스체크 외 실제 기능 API가 아직 연결되지 않았습니다.

---

## 1. 문서의 목적과 재구축 원칙

이 문서는 단순한 화면 캡처나 컴포넌트 목록이 아니라, 사용자가 실제로 어떤 화면을 보고 어떤 순서로 행동하며, 서버가 어떤 데이터를 제공해야 하는지를 정의하는 제품 명세서입니다.

다른 프로젝트에서 재구축할 때 다음 원칙을 우선합니다.

1. **사용자 행동과 상태 전환을 먼저 구현한다.**
   - 홈에서 질의를 시작한다.
   - 질의 의도를 분류한다.
   - 지침(RAG), 업무 데이터(TAG/ERP), 비서 중 필요한 경로를 선택하거나 병렬로 실행한다.
   - 결과를 답변 카드, 표, 차트, 출처, 추천 비서로 보여 준다.
2. **실제 운영 데이터와 데모 데이터의 경계를 분명하게 한다.**
   - 현재 화면의 질의, 답변, 비서, 알림, 사용량은 데모 값이다.
   - 운영 버전에서는 인증된 사용자와 API 응답이 모든 데이터의 원천이어야 한다.
3. **프론트에서 권한을 흉내 내지 않는다.**
   - 관리자 메뉴를 숨기는 것은 UX 처리일 뿐 보안 경계가 아니다.
   - 모든 관리자·개인 데이터·비서 공개 API는 서버에서 세션과 권한을 검증한다.
4. **한국어 UI를 기본으로 한다.**
   - 기본 locale은 `ko-KR`, 시간대는 `Asia/Seoul`이다.
   - 날짜와 시간은 서버에서 UTC로 저장하고, 클라이언트 표시 시 사용자 시간대로 변환한다.
5. **복합 답변을 하나의 긴 텍스트로 합치지 않는다.**
   - RAG 지침, TAG 집계, 해석 카드, 추천 비서는 독립 패널로 렌더링한다.
   - 각 패널의 액션바, 출처, 이어서 질의 컨텍스트를 독립적으로 관리한다.

---

## 2. 제품 목적과 사용자 역할

### 2.1 제품 목적

JPDC 구성원이 다음 업무를 한곳에서 처리할 수 있도록 하는 내부 AI 업무 지원 서비스입니다.

- 사내 규정·지침·매뉴얼을 검색하고 근거와 함께 답변 받기
- ERP·업무 시스템의 구조화된 데이터를 자연어로 조회하기
- 목적에 맞는 AI 비서를 선택해 반복 업무를 수행하기
- 여러 답변 경로를 비교하고 표·차트로 결과 확인하기
- 답변을 저장하고, 평가하고, Markdown으로 내보내기
- 개인 설정, AI 비서 순서, 알림, 대화 메모리, 사용량 확인하기
- 비서마켓에서 공식 비서를 발견하거나 직접 비서 만들기
- AI 사용 현황과 조직의 주요 질의를 브리핑으로 확인하기

### 2.2 사용자 역할

| 역할 | 주요 권한 |
|---|---|
| `user` | 본인 대화, 저장 답변, 설정, 메모리, 즐겨찾기 조회·수정. 비서 생성 |
| `assistant_owner` | 본인이 만든 비서의 수정·삭제·통계 조회. 공개 전 테스트 요청 확인 |
| `reviewer` | 공개 전 테스트 요청에 대한 평가·승인 검토 |
| `admin` | 공식 비서, 데이터셋, MCP/API 연결, 공개 승인 정책 관리 |

공개 범위는 다음과 같이 사용할 수 있습니다.

- `private`: 소유자만 사용
- `designated`: 지정 사용자만 사용
- `department`: 지정 부서 사용자에게 공개
- `company`: 조직 전체에 공개

### 2.3 주요 사용자 시나리오

#### 시나리오 A: 지침 질문

1. 홈 입력창에 “공공기관 보안 지침에서 외부 반출 금지 자료의 범위는 어디까지인가요?” 입력
2. 시스템이 `instruction`으로 분류
3. 관련 내부 지침을 검색
4. 답변 본문과 출처 목록 표시
5. 사용자가 좋아요·별점·저장·복사·Markdown 다운로드 중 선택

#### 시나리오 B: 지침과 업무 데이터가 함께 필요한 질문

1. “입고 처리가 안 된 작업지시가 있어?” 입력
2. 시스템이 RAG 지침과 TAG/ERP 데이터가 모두 필요한 질의로 분류
3. RAG 지침 패널과 TAG 현황 패널을 함께 표시
4. ERP 데이터 표와 차트를 표시
5. 결과 하단에 관련 비서 추천
6. 사용자가 특정 패널에서 “이어서 질의”를 눌러 추가 질문

#### 시나리오 C: 의도가 모호한 입고 질문

1. “입고 처리가 안된 작업 방법알려줘” 입력
2. 즉시 답하지 않고 `route-select` 선택 화면 표시
3. 사용자가 다음 중 하나 선택
   - `지침에서 찾기`
   - `ERP 입고 현황 조회`
4. 지침 선택 시 RAG 경로 실행
5. ERP 선택 시 TAG/ERP 경로 실행

#### 시나리오 D: 비서 만들기

1. 비서마켓에서 `비서 만들기` 선택
2. “우리 회사 매뉴얼을 참고해 답변해주는 비서”와 같은 한 줄 요청 입력
3. AI가 이름, 설명, 지침, 금지사항, 대화 스타터 초안 생성
4. 사용자가 기본 정보·지침·MCP/API·지식 데이터셋·공개 범위 수정
5. `저장하기`로 비공개 비서 생성
6. 공개 전 테스트 요청을 보낼 수 있는 상태로 전환

---

## 3. 기술·실행 기준

### 3.1 권장 기술 스택

현재 프로젝트와 동일한 재구축을 권장합니다.

- pnpm workspace
- React 19 + TypeScript
- Vite
- Tailwind CSS
- Radix UI
- Lucide React
- Recharts
- Express 5
- Drizzle ORM + PostgreSQL
- Zod
- OpenAPI + Orval 기반 API 타입 생성

다른 스택을 사용해도 아래 계약과 상태 전이는 유지해야 합니다.

### 3.2 현재 프로젝트 실행 기준

```text
artifacts/jpdc-ai/       # JPDC AI 웹 프론트엔드
artifacts/api-server/    # Express API 서버
artifacts/mockup-sandbox/ # UI 컴포넌트 미리보기 서버
lib/api-spec/            # OpenAPI 원본
lib/api-zod/             # 검증 스키마
lib/api-client-react/    # React API 클라이언트
lib/db/                  # Drizzle/PostgreSQL 데이터 계층
```

실행 명령:

```bash
pnpm install
pnpm --filter @workspace/jpdc-ai run dev
pnpm --filter @workspace/api-server run dev
pnpm run typecheck
pnpm run build
```

웹 앱은 Vite로 실행하고 `PORT` 환경 변수를 사용합니다. 현재 웹 아티팩트의 경로는 `/jpdc-ai/`입니다. 라우팅을 사용하는 경우 root-relative URL이 아티팩트 경로를 빠져나가지 않도록 base path를 적용합니다.

---

## 4. 전체 레이아웃과 화면 구조

### 4.1 데스크톱 레이아웃

전체 앱은 다음 수평 구조입니다.

```text
┌──────────────────────────────────────────────────────────────────┐
│ Sidebar │ SavedPanel(optional) │ MainContent │ NotifPanel(optional) │
└──────────────────────────────────────────────────────────────────┘
```

#### 왼쪽 사이드바

- 펼침 상태 기본 폭: 약 `220~240px`
- 접힘 상태: 아이콘 중심의 좁은 rail
- 배경: 연한 라벤더 계열
- 주요 기능:
  - 로고와 `JPDC AI`
  - `새 대화`
  - 대화 검색
  - 날짜별 대화 이력
  - `비서마켓`
  - `저장목록`
  - 다크모드 전환
  - `개인 설정`
  - `이용 매뉴얼`
  - 사용자 프로필

#### 저장 목록 패널

- 사이드바 오른쪽에 슬라이드로 열리는 패널
- 열림 폭: 약 `280px`
- 제목: `저장 목록`
- 저장 개수 배지 표시
- 최신 저장 순으로 목록 표시
- 목록이 비었을 때: `저장한 답변이 없습니다`
- 각 항목은 질의, 답변 미리보기, 저장 시각, 삭제 버튼을 가짐

#### 메인 콘텐츠

- 화면별 상단바와 콘텐츠 영역
- 홈·대화·마켓·브리핑 콘텐츠는 자체 `overflow-y: auto`
- 상단바는 콘텐츠 스크롤과 분리
- 대화 답변은 중앙의 읽기 영역에 배치

#### 알림 센터 패널

- 데스크톱: 메인 콘텐츠 오른쪽에 열리는 패널
- 모바일: 화면 오른쪽 fixed drawer
- 열림 폭: 약 `300px`, 모바일은 화면 폭의 최대 `85vw`
- 읽지 않은 개수 배지
- `모두 읽음`
- 알림 클릭 시 읽음 처리
- 각 알림에 삭제 버튼
- 빈 상태: `알림이 없습니다`

### 4.2 모바일 레이아웃

브레이크포인트 기준은 `767px` 이하입니다.

- 사이드바는 overlay drawer로 전환하거나 좁은 rail로 접는다.
- 저장 목록과 알림 센터는 fixed drawer로 표시한다.
- 상단바의 보조 텍스트와 버튼 라벨은 숨기고 아이콘을 유지한다.
- 마켓의 탭·필터는 가로 스크롤한다.
- 답변 패널은 1열로 쌓는다.
- 표는 가로 스크롤을 허용한다.
- 채팅 입력창은 화면 하단에 충분한 여백을 두고 표시한다.
- 모든 아이콘 버튼에는 `aria-label`을 제공한다.

---

## 5. 화면별 명세

## 5.1 홈 화면

### 목적

로그인 후 가장 먼저 도착하는 화면입니다. 자주 사용하는 비서와 예시 질의를 빠르게 선택하고, 자연어 입력으로 새 대화를 시작합니다.

### 화면 구성

1. 상단바
   - 사이드바 접기/펼치기
   - `알림`
   - `비서마켓`
2. 히어로 영역
   - 환영 문구: `안녕하세요, 김동현님`
   - 제품 설명: `무엇을 도와드릴까요?`
   - 보조 문구: 자연어로 업무를 입력하거나 비서를 선택하도록 안내
3. 질의 입력 영역
   - placeholder 예시: `무엇이든 물어보세요…`
   - 첨부 버튼
   - 비서 선택 버튼: `비서 선택`
   - 전송 버튼
4. 예시 질의
   - `입고 처리가 안된 작업 방법알려줘`
   - `입고 처리가 안 된 작업지시가 있어?`
   - `공공기관 보안 지침에서 외부 반출 금지 자료의 범위는 어디까지인가요?`
   - `회의록 작성 잘 하는법`
   - 필요에 따라 질의 유형을 보여 주는 배지
5. 추천 비서 카드
   - `공식 비서`
   - `개인 비서`
   - `인기 비서`
6. 주요 지표 또는 빠른 통계
   - 가장 많이 사용한 비서
   - 활성 사용자
   - 대화 수

### 입력 상호작용

- 예시 질의를 클릭하면 입력창에 텍스트를 채운다.
- 예시 질의는 자동으로 전송하지 않는다.
- Enter는 전송한다.
- Shift+Enter는 줄바꿈한다.
- 비어 있는 입력은 전송하지 않는다.
- 전송 중에는 입력창·전송 버튼을 비활성화한다.
- 첨부 파일을 선택하면 파일 칩과 파일 상태를 표시한다.
- 비서를 선택하면 비서 칩을 표시하고 `assistantId`를 새 대화 요청에 포함한다.

### 첨부 파일 상태

```text
선택됨 → 업로드 중 → 임베딩 중 → 준비 완료
                         └──────→ 실패
```

현재 데모에서는 약 1.2~2.2초의 진행 애니메이션으로 보일 수 있으나, 운영에서는 파일 API의 실제 `progress`를 사용합니다.

---

## 5.2 대화 화면

### 목적

사용자 질의와 AI 답변을 시간 순서로 보여 주며, 답변 유형에 따라 지침·통계·비서 결과를 분리해서 보여 줍니다.

### 상단바 실제 라벨

- 사이드바 토글
- 현재 대화 제목
- `알림`
- `비서마켓`
- 새 대화 또는 닫기 관련 아이콘

### 메시지 구조

```ts
type ConversationMessage = {
  id: string;
  role: 'user' | 'assistant';
  query?: string;
  text?: string;
  queryKind?: QueryKind;
  panels?: AnswerPanel[];
  createdAt: string;
  status: 'pending' | 'streaming' | 'completed' | 'failed';
  feedback?: Feedback;
  saved?: boolean;
};
```

### 사용자 메시지

- 오른쪽 정렬 또는 강조된 말풍선
- 질의 원문을 그대로 보여 준다.
- 분류 완료 후 답변 상단에 분류 배지 표시

### AI 답변 공통 구조

1. 분류 배지
   - 예: `RAG`
   - 예: `TAG`
   - 예: `RAG+TAG+비서`
   - 예: `지침·ERP 선택`
2. 사고 과정/상태 표시
   - `질의를 분석하고 있습니다…`
   - `관련 지침을 검색하고 있습니다…`
   - `업무 데이터를 조회하고 있습니다…`
   - `답변을 정리하고 있습니다…`
3. 답변 패널
4. 출처 또는 데이터 기준
5. 추천 비서
6. 액션바

### 사고 과정 표시 원칙

상세한 내부 추론을 노출하는 것이 아니라, 사용자가 이해할 수 있는 작업 상태만 표시합니다.

```text
질의 분석 → 관련 자료 확인 → 업무 데이터 조회 → 답변 작성
```

---

## 5.3 답변 패널 종류

### A. 지침(RAG) 답변 패널

표시 요소:

- 헤더: `지침 (RAG)`
- 설명: `관련 규정·지침 문서를 검색하여 답변드립니다`
- 답변 본문
- 출처 카드
  - 문서 제목
  - 문서 유형: `내부지침`
  - 조항 또는 페이지
- 관련도나 검색 기준이 있으면 보조 메타데이터

정확한 지침을 찾지 못한 경우:

- 강조 문구: `정확한 지침을 찾지 못했습니다`
- 설명: `요청하신 내용과 관련된 지침 및 자료를 검색했으나 정확히 일치하는 지침이 없습니다.`
- 관련 비서 추천 또는 `RAG 지침을 찾을까요?` 제안

### B. TAG 통계 답변 패널

표시 요소:

- 헤더: `TAG 통계 질의`
- 집계 제목: 예 `작업지시 입고 처리 현황`
- 요약 수치
- 표
- 막대 차트 또는 적합한 차트
- 데이터 기준 시각
- 조회 조건

예시 표:

| 상태 | 건수 |
|---|---:|
| 입고 처리 완료 | 23 |
| 검수 대기 | 3 |
| 입고 미처리 | 7 |

### C. Dual TAG 해석 패널

자연어가 여러 해석을 가질 때 사용합니다.

표시 요소:

- `해석 1 — 제품별 합계`
- `해석 2 — 라인별 합계`
- 해석 설명
- 추출된 파라미터
  - 월
  - 연도
  - 집계 기준
- 수정 가능한 파라미터
- `이 해석으로 조회`
- 표·차트

일반 사용자에게 SQL을 노출하지 않습니다. 관리자 또는 디버그 환경에서만 SQL을 표시할 수 있습니다.

### D. RAG A/B 비교 패널

서로 다른 지침 문서 또는 검색 결과를 비교해야 할 때 사용합니다.

- `A안`, `B안` 또는 의미 있는 제목
- 각 답변 본문
- 출처
- 차이점 요약
- 어느 답변이 더 적합한지에 대한 안내

### E. 비서 선택 패널

지침 답변 이후 관련 비서 사용을 제안할 수 있습니다.

- 제목: `이 업무에 맞는 비서를 선택해 보세요`
- 비서 이름
- 설명
- 카테고리
- `이 비서로 시작`
- `비서마켓에서 더 보기`

### F. 추천 비서 패널

답변 결과와 관련성이 높은 비서를 표시합니다.

- 비서명
- 적합도 또는 추천 이유
- `대화 시작`
- 상세 보기

---

## 5.4 질의 분류와 분기 규칙

### QueryKind 목록

```text
instruction
assistant-select
tag-stats
tag-assistant
dual-tag
dual-tag-assistant
ambiguous
rag-ab
rag-tag-assistant
minutes-request
minutes-result
fallback
fallback-assistant
route-select
```

서버가 `queryKind`를 최종 결정해야 합니다. 프론트는 질의 문자열을 검색해 분류 결과를 재판정하지 않고, 서버의 `classification.completed` 이벤트를 사용합니다.

### 분류 기준

| 유형 | 판단 기준 | 기본 UI |
|---|---|---|
| `instruction` | 규정, 지침, 방법, 절차를 묻는 질문 | RAG 지침 답변 |
| `assistant-select` | 특정 비서에게 작업을 요청하거나 비서 선택이 필요한 질문 | 비서 선택 |
| `tag-stats` | 건수, 합계, 현황, 추이 등 구조화 데이터 집계 | TAG 표·차트 |
| `tag-assistant` | 업무 데이터 조회 후 비서 해석이 필요한 질문 | TAG + 비서 |
| `dual-tag` | 집계 기준이 둘 이상으로 해석되는 질문 | 해석 선택 카드 |
| `dual-tag-assistant` | Dual TAG 결과와 비서 해석이 모두 필요한 질문 | 해석 + TAG + 비서 |
| `ambiguous` | 지침과 비서 또는 데이터의 의도가 불명확 | 선택 패널 |
| `rag-ab` | 두 지침 또는 두 검색 결과 비교 | RAG A/B |
| `rag-tag-assistant` | 지침, 업무 데이터, 관련 비서가 모두 필요 | RAG + TAG + 추천 비서 |
| `minutes-request` | 회의록 작성·정리 요청 | 회의록 비서 또는 지침+비서 |
| `minutes-result` | 회의록 결과 재진입 | 결과 표시 |
| `fallback` | 정확히 매칭되지 않음 | 일반 답변 또는 안내 |
| `fallback-assistant` | 일반 답변 후 관련 비서 추천 | 답변 + 추천 비서 |
| `route-select` | 입고 관련 질문이 지침인지 ERP인지 불명확 | 지침/ERP 선택 |

### 입고 선택형 질의

다음 예시 질의는 바로 답하지 않고 선택 패널을 보여 줍니다.

```text
입고 처리가 안된 작업 방법알려줘
```

비교할 때는 사용자 입력의 띄어쓰기 차이를 허용합니다. 구현 시 비교용 정규화 함수는 다음 의미를 가져야 합니다.

```ts
normalizeQuery(text) = text.trim().replace(/\s+/g, '')
```

선택 패널의 실제 라벨:

- `어떤 방향으로 찾아볼까요?`
- `지침에서 찾기`
  - `관련 규정·업무 지침을 검색합니다`
- `ERP 입고 현황 조회`
  - `실제 작업지시와 입고 상태를 조회합니다`

선택 후:

```text
지침에서 찾기
  → instruction 또는 RAG 응답

ERP 입고 현황 조회
  → tag-stats
  → 입고 미처리 작업지시 7건 등 표·차트
```

### 자동 후속 질의 금지

- AI가 제안 문장을 자동으로 생성하거나 자동 전송하지 않습니다.
- 사용자가 직접 `이어서 질의`를 클릭하고 입력해야 합니다.
- 버튼 클릭은 AI 호출이 아니라 입력창 포커스 이동과 컨텍스트 설정만 수행합니다.
- 실제 전송 시 `followUpOfMessageId`를 포함한 일반 메시지 API를 호출합니다.

---

## 5.5 대화 액션바

답변 완료 후 각 답변 패널 또는 메시지 하단에 표시합니다.

액션:

- 좋아요
- 싫어요
- 별점 1~5
- 저장
- 복사
- `MD 다운로드`
- `이어서 질의`
- 필요 시 재생성

### 방향별 피드백

- 좋아요를 선택하면 녹색 별점만 활성화한다.
- 싫어요를 선택하면 빨간 별점만 활성화한다.
- 좋아요 상태에서 음수 별점을 선택할 수 없다.
- 싫어요 상태에서 양수 별점을 선택할 수 없다.
- 별점을 선택하지 않으면 `rating=0`으로 보낸다.
- 피드백 사유는 복수 선택 가능하다.

사유 코드:

```text
SOURCE
RELEVANCE
COMPLETENESS
RECENCY
DATA
FORMAT
ACTIONABILITY
```

피드백 제출 예:

```json
{
  "sentiment": "up",
  "rating": 4,
  "reasons": ["SOURCE", "RELEVANCE"],
  "comment": "출처가 명확하고 바로 업무에 사용할 수 있었습니다."
}
```

---

## 5.6 비서마켓

### 목적

공식 비서와 조직 내 비서를 탐색하고, 즐겨찾기하고, 상세 정보를 확인하고, 복제하거나 대화를 시작하는 화면입니다.

### 상단·주요 라벨

- `비서마켓`
- `추천`
- `통계`
- `공개 전 테스트`
- `내가 만든 비서`
- `전체 비서`
- `비서 만들기`
- `검색`
- `카테고리`
- `정렬`
- `즐겨찾기`
- `상세 보기`
- `대화 시작`
- `복제하기`
- `통계 보기`

### 카테고리

```text
글쓰기
코드
번역
분석
법률·회계
```

### 예시 비서

| 이름 | 설명 | 카테고리 |
|---|---|---|
| 회의록 문장정리 | 회의 내용을 체계적인 문서로 자동 정리 | 글쓰기 |
| 이메일 문체변경 | 격식·비격식 문체를 자동으로 변환 | 글쓰기 |
| 보도자료 초안 | 전문 보도자료 자동 작성 | 글쓰기 |
| 블로그 글쓰기 | SEO 최적화된 블로그 포스트 작성 | 글쓰기 |
| 코드 리뷰 비서 | 버그·스타일·보안 취약점 자동 리뷰 | 코드 |
| 코드 최적화 | 성능 병목 탐지와 리팩토링 제안 | 코드 |
| 테스트 코드 생성 | 유닛·통합 테스트 자동 생성 | 코드 |
| 번역 비서 | 다국어 고품질 자연스러운 번역 | 번역 |
| 동시통역 비서 | 실시간 대화 동시통역 지원 | 번역 |
| 데이터 분석 비서 | 엑셀·CSV를 차트와 인사이트로 | 분석 |
| 문서 요약 비서 | PDF·보고서·계약서 핵심 요약 | 분석 |
| 시장조사 비서 | 경쟁사·트렌드 자동 분석 리포트 | 분석 |
| 법률 자문 비서 | 판례 검색과 계약 조항 리스크 점검 | 법률·회계 |
| 계약서 검토 비서 | 핵심 조항 위험도 자동 판별 | 법률·회계 |
| 회계 정산 비서 | 증빙 정리와 정산서 자동화 | 법률·회계 |

### 비서 카드

각 카드에 포함:

- 아이콘
- 비서 이름
- 한 줄 설명
- 카테고리 배지
- 공식/개인/승인 상태
- 별점 또는 사용량
- 즐겨찾기 하트
- `대화 시작`
- 카드 클릭 시 상세 모달

### 비서 상세 모달

포함 데이터:

- 이름·아이콘·설명
- 전체 설명
- 제작자
- 버전
- 공개 범위
- 평점·평가 수
- 좋아요·싫어요
- 평점 분포
- 대화 스타터
- 기능·연결 정보
- 댓글
- 제작자의 다른 비서

액션:

- `대화 시작`
- `복제하기`
- `URL 복사`
- 즐겨찾기
- 통계 확인

### 즐겨찾기

- 하트 클릭으로 추가·삭제한다.
- 즐겨찾기 목록은 개인 설정의 `즐겨찾기 비서`에서 관리한다.
- 비어 있을 때:
  - `즐겨찾기가 없습니다`
  - `비서마켓의 공식 비서 또는 전체 비서 탭에서 추가해보세요.`

---

## 5.7 비서 생성·수정 화면

### 시작 화면

상단:

- `비서 만들기`
- `자연어로 비서 초안 만들기`
- 설명 문구
- 자연어 입력창
- `초안 생성`

예시 placeholder:

```text
어떤 비서를 만들고 싶은지 한 문장으로 설명해 주세요.
```

### 초안 생성 결과

AI가 다음 필드를 제안합니다.

- 이름
- 설명
- 아이콘
- 지침
- 금지사항
- 대화 스타터
- 첫 메시지
- 파운데이션 모델 사용 여부

### 기본 정보 섹션

- `비서 이름`
- `설명`
- `카테고리`
- 아이콘 선택
- 아이콘 색상

아이콘 선택 모달:

- 검색
- 카테고리
- 아이콘 그리드
- 아이콘 이름
- `선택`
- `취소`

### 지침 섹션

- `비서 지침`
- 긴 텍스트 영역
- `금지사항`
- 항목 추가·삭제
- `첫 메시지`
- `대화 스타터`
- 스타터 추가·삭제

### 연결 섹션

- `MCP`
- `API`
- 관리자 승인 완료된 연결만 표시
- 연결별 이름·설명·권한
- 읽기 전용과 읽기/쓰기 구분

### 지식 데이터셋 섹션

- 파일 업로드
- 데이터셋 선택
- 임베딩 상태
- 파일 삭제
- `ready`가 아닌 파일은 비서 생성에 포함하지 않도록 안내

### 공개 범위 섹션

- `나만 사용`
- `지정 사용자`
- `부서 공개`
- `전사 공개`
- 지정 사용자 선택
- 공개 전 테스트 요청 여부

### 저장 상태

```text
작성 중(draft)
  → 저장
  → 비공개(private)
  → 공개 요청
  → 검토 중(pending_review)
  → 승인(approved/official)
     또는 반려(rejected)
     또는 수정 요청(request_changes)
```

---

## 5.8 관리자 승인 MCP/API 연결

관리자 또는 운영 화면에서 다음을 관리합니다.

- 연결 가능한 MCP 목록
- 연결 가능한 API 목록
- 연결 상태
- 권한 범위
- 설명
- 비서에 연결할 수 있는지 여부
- 공개 승인 요청

실제 라벨 예:

- `연결 관리`
- `MCP 서버`
- `API 연결`
- `승인 대기`
- `승인`
- `반려`
- `수정 요청`
- `권한`
- `읽기`
- `읽기·쓰기`

보안 원칙:

- 브라우저에서 관리자 여부를 판단해도 서버는 항상 다시 검사한다.
- 승인되지 않은 MCP/API ID를 클라이언트가 보내도 서버에서 거절한다.
- 연결 자격 증명은 일반 UI 응답이나 로그에 노출하지 않는다.

---

## 5.9 개인 설정

### 모달 구조

- 모달 제목: `개인 설정`
- 사용자 표시:
  - 아바타
  - `김동현`
- 왼쪽 탭:
  - `표시`
  - `비서`
  - `알림`
  - `사용량`
- 오른쪽 콘텐츠
- 닫기 버튼
- 사용량 탭을 제외한 현재 화면에는 `취소`, `저장` footer가 있다.

> 메모리 관리는 구현 컴포넌트가 존재하지만 현재 기본 탭 목록에는 직접 노출되지 않는 상태입니다. 재구축에서 메모리를 사용자 기능으로 제공하려면 `메모리`를 별도 탭으로 추가하거나 `표시`·`비서` 중 하나에서 명확히 진입시켜야 합니다. API 계약은 이미 별도로 정의합니다.

### 표시 탭

헤더:

- `화면 표시`
- `인터페이스의 색상·글꼴·밀도를 조정합니다.`

옵션:

- 테마:
  - `라이트`
  - `다크`
- 글꼴 크기:
  - `작게 (12px)`
  - `보통 (14px)`
  - `크게 (16px)`
- 표시 밀도:
  - `넓게`
  - `표준`
  - `좁게`

보조 문구:

- `항목 간 여백 넉넉`
- `기본 여백`
- `최대한 많은 항목 표시`
- `미리보기`

### 비서 탭

현재 사용 가능한 비서 관리:

- `사용할 비서`
- `비서 이름·카테고리 검색…`
- 선택된 비서 칩
- `총 N개 선택됨`
- `검색 결과가 없습니다.`

비서 표시 순서:

- `비서 표시 순서`
- `1위가 '비서 선택' 팝업의 맨 아래, 마지막 순위가 맨 위에 표시됩니다.`
- 위로 이동
- 아래로 이동
- 목록에서 삭제

즐겨찾기:

- `즐겨찾기 비서`
- `삭제`
- `총 N개`

### 알림 탭

헤더:

- `알림 설정`
- `알림 센터 배지·목록 표시와 수신할 알림 종류를 선택하세요.`

알림 센터:

- `뱃지 표시`
- `목록 표시`

알림 수신:

- `비서 업데이트 알림`
- `새 비서 출시 알림`
- `N개 활성`

### 사용량 탭

중요 정책:

- ChatGPT·Claude 모델 선택 UI를 제품의 모델 선택 기능으로 사용하지 않는다.
- 사용량 화면은 서비스별 기본 모델 또는 비용 산정 기준을 설명하는 용도로만 사용한다.
- `Input Tokens`, `Cached Input Tokens`, `Output Tokens`를 표시하지 않는다.
- `Total Tokens`만 표시한다.
- 비용은 반드시 `Estimated Cost · 예상 비용`으로 표시한다.
- ChatGPT와 Claude 모두 공통 환율 `1,400원/USD`를 적용한다.
- 실측 토큰 유형별 비용이 없는 데모·집계 환경에서는 확정 비용처럼 표시하지 않는다.

표시 요소:

- 기간 탭:
  - `오늘`
  - `어제`
  - `주간`
  - `누적`
- `토큰 상세`
- `Total Tokens`
- `전체 토큰 기준`
- `유형별 구분 없음`
- `실행 결과 및 비용`
- `예상 비용`
- `Estimated Cost · 예상 비용`
- `토큰 한도`
- `질의 건수`
- `비서별 사용량`
- `전일 대비`
- 제한이 없는 경우 `제한 없음`

비용 계산:

```text
estimatedCostUsd
  = totalTokens / 1,000,000 × estimatedAverageUsdPerMillion

estimatedCostKrw
  = estimatedCostUsd × 1,400
```

실제 공급자별 토큰 단가가 확정되지 않았거나 토큰 유형별 실측이 없으면 다음 메타데이터를 함께 제공합니다.

```json
{
  "estimated": true,
  "estimationMethod": "total_tokens_average_rate",
  "exchangeRateKrw": 1400
}
```

사용량 모달에는 `취소`·`저장` 버튼을 두지 않습니다. 기간이나 표시 기준 변경 즉시 화면에 반영합니다.

---

## 5.10 메모리 관리

메모리는 AI가 대화에서 학습한 사용자 선호·사실·지침을 관리하는 기능입니다.

### 라벨

- `대화 메모리`
- `AI가 대화에서 학습한 선호·사실·지침을 관리합니다.`
- `대화 기억하기`
- `대화에서 드러난 선호·사실을 저장해 다음 대화에서 참고합니다`
- `기억하는 것`
- `모든 대화에서 공유`
- `추가`
- `저장`
- `모든 기억 삭제`

### 메모리 유형

- `지침`
  - 예: `답변은 항상 표로 정리해 준다`
- `사실`
  - 예: `장비예약 승인 업무를 담당한다`
- `선호`
  - 예: `보고서 초안은 개조식보다 서술형을 선호한다`

### 범위

- `전체`
- `업무 도우미`
- `회의록 비서`
- `번역 비서`
- `코드 리뷰 비서`

표시 규칙:

- `전체`는 `모든 대화에서 공유`로 표시한다.
- 특정 비서 범위는 해당 비서 아이콘과 이름으로 표시한다.
- 항목별 수정, 범위 변경, 삭제를 지원한다.
- 메모리 저장을 끄면 목록을 흐리게 표시하고 편집을 비활성화한다.
- 항목이 없을 때:
  - `아직 기억한 것이 없습니다.`
  - 대화를 나누면 유용한 내용만 쌓인다는 안내를 표시한다.

---

## 5.11 저장 목록

### 열기

- 사이드바의 `저장목록` 클릭
- 답변 액션바의 저장 클릭
- 패널이 사이드바 오른쪽에서 펼쳐짐

### 저장 항목

```ts
type SavedAnswer = {
  id: string;
  messageId: string;
  query: string;
  answer: string;
  savedAt: string;
};
```

### 동작

- 최신 저장순 표시
- 저장 상태를 답변 액션바에 반영
- 이미 저장된 메시지는 중복 저장 정책을 서버에서 결정한다.
- 항목 삭제 시 즉시 목록에서 제거한다.
- 마지막 항목을 삭제하면 빈 상태로 전환한다.
- 답변의 Markdown 표기 일부는 목록 미리보기에서 평문으로 정리할 수 있다.

---

## 5.12 알림 센터

### 알림 유형

- `alert`: 보안·주의
- `info`: 일반 정보
- `success`: 처리 완료

예시:

- `보안 알림`
  - `어제 외부 IP에서 로그인 시도가 감지되었습니다.`
- `비서 업데이트`
  - `회의록 문장정리 비서가 v1.3으로 업데이트되었습니다.`
- `답변 저장 완료`
  - `계약 협상 관련 답변이 저장 목록에 추가되었습니다.`
- `브리핑 게시됨`
  - `오늘 오전 8:30 AI 브리핑이 게시되었습니다.`

### 동작

- 읽지 않은 알림은 제목 옆 점과 상단 배지로 구분
- 항목 클릭 시 읽음 처리
- `모두 읽음` 클릭 시 모든 미읽음 항목 처리
- 항목별 삭제
- 빈 상태: `알림이 없습니다`

---

## 5.13 아침 브리핑

### 목적

조직과 개인에게 관련된 AI 사용 흐름, 급상승 주제, 많이 본 주제를 매일 요약합니다.

### 상단 라벨

- `아침 브리핑`
- `매일 08:30 갱신`
- `알림`
- `비서마켓`
- `닫기`

### 카드 구성

- 날짜
- 제목: `아침 브리핑`
- 부제: `오늘 업무와 조직의 주요 흐름을 확인하세요.`
- 도움말 아이콘
- 세 개의 주제 블록:
  - `나에게 관련`
  - `급상승 주제`
  - `많이 본 주제`
- 각 블록의 항목 수: `최대 N건`
- 항목별 순위
- 주제 제목
- 요약
- 증감 또는 관련성 배지
- `바로 질문하기`

### 안내 기준

브리핑은 이번 주 대화를 유사 그룹으로 클러스터링하고, 전주 대비 증가율과 고유 사용자 수 기준으로 선별합니다.

- 타인의 답변 본문은 표시하지 않는다.
- 브리핑의 `바로 질문하기`는 현재 사용자 권한으로 새 대화를 시작한다.
- 브리핑 항목 API는 다른 사용자의 답변 본문을 포함하지 않는다.

### 도움말

도움말 팝오버는 다음을 설명합니다.

- 어떤 대화가 집계되는지
- 개인 관련과 조직 인기 주제의 차이
- 증가율의 기준
- 개인정보 및 타인 답변 보호 원칙

---

## 5.14 이용 매뉴얼·도움말

### 화면 목적

사용자가 기능을 자연어로 검색하고, 빠른 주제 버튼으로 주요 기능 안내를 읽도록 합니다.

### 라벨 예시

- `이용 매뉴얼`
- `무엇이 궁금한가요?`
- `기능을 검색해 보세요`
- `빠른 도움말`
- `비서 만들기`
- `비서 사용하기`
- `메모리 관리`
- `사용량 확인`
- `저장목록`
- `알림 센터`

### 동작

- 검색어를 입력하면 토픽 제목·키워드·본문에서 검색
- 자연어 질문은 `도움말 질문 API`로 전송
- 답변은 Markdown으로 표시
- 관련 토픽과 일치 confidence를 내부적으로 받을 수 있다.
- 검색 결과가 없을 때 명확한 안내를 표시한다.

---

## 6. 질의 처리의 상세 상태 머신

### 6.1 메시지 상태

```text
idle
  → sending
  → classifying
  → thinking
  → tool_running
  → streaming
  → completed
  → saved / feedback_submitted (선택)
```

실패:

```text
thinking 또는 streaming
  → failed
  → 재생성 가능
```

### 6.2 스트리밍 이벤트

SSE 기본 이벤트:

```text
message.started
classification.completed
answer.started
answer.delta
sources.completed
stats.completed
interpretation.completed
recommendations.completed
tool.started
tool.completed
answer.completed
message.completed
message.failed
```

예시:

```text
event: message.started
data: {"messageId":"msg_ai_1","queryKind":"rag-tag-assistant"}

event: classification.completed
data: {"queryKind":"rag-tag-assistant","label":"RAG+TAG+비서"}

event: answer.started
data: {"panel":"rag","panelId":"panel_rag_1"}

event: answer.delta
data: {"panelId":"panel_rag_1","text":"작업지시의 "}

event: sources.completed
data: {"panelId":"panel_rag_1","sources":[{"id":"src_1","title":"자재 입고 처리 업무 지침 제7조","type":"내부지침"}]}

event: stats.completed
data: {"panelId":"panel_tag_1","table":{"title":"작업지시 입고 처리 현황","columns":["상태","건수"],"rows":[["입고 처리 완료",23],["검수 대기",3]]},"chart":{"type":"bar","data":[{"label":"완료","value":23}]}}

event: answer.completed
data: {"panelId":"panel_rag_1"}

event: message.completed
data: {"messageId":"msg_ai_1","status":"completed"}
```

### 6.3 프론트 상태와 서버 데이터 매핑

| 프론트 상태 | 서버 원천 |
|---|---|
| `activeView` | 라우터 및 대화·마켓 응답 |
| `sidebarOpen` | 로컬 UI 상태 |
| `assistantContext` | 대화 생성의 `assistantId`와 상세 응답 |
| `savedItems` | 저장 답변 목록 API |
| `notifUnread` | 알림 목록의 `meta.unreadCount` |
| `favorites` | 즐겨찾기 API |
| `assistantOrder` | 비서 순서 API |
| `messages` | 대화 상세 API + 메시지 SSE |
| `queryKind` | `classification.completed` |
| `streaming` | `answer.started`부터 `answer.completed` |
| `answerDoneSet` | `message.completed` |
| `awaitingFollowUp` | 프론트 로컬 상태 |
| `feedbackModal` | 프론트 로컬 상태 + feedback mutation |
| `theme`, `fontSize`, `density` | 개인 표시 설정 API |
| 메모리 목록 | 메모리 API |

---

## 7. 데이터 모델

### 7.1 User

```ts
type User = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  role: 'user' | 'assistant_owner' | 'reviewer' | 'admin';
  department: string | null;
  permissions: {
    canCreateAssistant: boolean;
    canPublishAssistant: boolean;
    canReviewAssistant: boolean;
    canManageConnectors: boolean;
  };
  locale: 'ko-KR' | string;
  timezone: string;
};
```

### 7.2 Conversation

```ts
type Conversation = {
  id: string;
  title: string;
  assistantId: string | null;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
};
```

대화 이력 목록에는 다음을 추가할 수 있습니다.

- `lastMessagePreview`
- `queryKinds`
- `badges`
- `messageCount`

날짜 그룹:

- `오늘`
- `어제`
- `지난 7일`
- 전체

### 7.3 Message와 AnswerPanel

```ts
type QueryKind =
  | 'instruction'
  | 'assistant-select'
  | 'tag-stats'
  | 'tag-assistant'
  | 'dual-tag'
  | 'dual-tag-assistant'
  | 'ambiguous'
  | 'rag-ab'
  | 'rag-tag-assistant'
  | 'minutes-request'
  | 'minutes-result'
  | 'fallback'
  | 'fallback-assistant'
  | 'route-select';

type AnswerPanel =
  | {
      id: string;
      type: 'rag';
      label: string;
      markdown: string;
      sources: Source[];
    }
  | {
      id: string;
      type: 'stats';
      title: string;
      columns: string[];
      rows: (string | number)[][];
      chart?: Chart;
    }
  | {
      id: string;
      type: 'interpretation';
      label: string;
      description: string;
      parameters: Parameter[];
      columns?: string[];
      rows?: (string | number)[][];
      chart?: Chart;
    }
  | {
      id: string;
      type: 'assistant-recommendation';
      candidates: AssistantCandidate[];
    }
  | {
      id: string;
      type: 'route-select';
      options: RouteOption[];
    };
```

### 7.4 Source

```ts
type Source = {
  id: string;
  title: string;
  type: '내부지침' | '매뉴얼' | '규정' | string;
  locator?: string;
  url?: string;
  relevance?: number;
};
```

### 7.5 Assistant

```ts
type Assistant = {
  id: string;
  name: string;
  description: string;
  fullDescription?: string;
  icon: {
    name: string;
    background: string;
    color: string;
  };
  category: '글쓰기' | '코드' | '번역' | '분석' | '법률·회계' | string;
  author: {
    id: string;
    name: string;
  };
  version: string;
  status:
    | 'draft'
    | 'official'
    | 'approved'
    | 'updating'
    | 'pending_review'
    | 'rejected'
    | 'pre_public_test';
  visibility: 'private' | 'designated' | 'department' | 'company';
  isFavorite: boolean;
  userCount: number;
  dialogueCount: number;
  messageCount: number;
  conversationStarters: string[];
  rating?: number;
  ratingCount?: number;
  createdAt: string;
  updatedAt: string;
};
```

### 7.6 Memory

```ts
type Memory = {
  id: string;
  kind: 'instruction' | 'fact' | 'preference';
  text: string;
  scope: 'all' | 'assistant';
  assistantId: string | null;
  source: 'conversation' | 'manual' | string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};
```

표시용 한국어:

```text
instruction → 지침
fact        → 사실
preference  → 선호
all         → 전체
```

---

## 8. 권장 API 계약

### 8.1 공통 규칙

```text
Base URL: /api/v1
Health:   /api/healthz
JSON:     application/json; charset=utf-8
Upload:   multipart/form-data
Time:     ISO 8601 UTC
Auth:     세션 쿠키, credentials: include
```

성공 응답:

```json
{
  "data": {},
  "meta": {
    "requestId": "req_01J...",
    "generatedAt": "2026-08-24T06:00:00Z"
  }
}
```

목록 응답:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 42,
    "hasNext": true,
    "requestId": "req_01J...",
    "generatedAt": "2026-08-24T06:00:00Z"
  }
}
```

오류 응답:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "요청 값을 확인해 주세요.",
    "fields": {
      "name": "이름은 1자 이상이어야 합니다."
    }
  },
  "meta": {
    "requestId": "req_01J..."
  }
}
```

상태 코드:

| HTTP | 코드 | 화면 처리 |
|---:|---|---|
| 400 | `BAD_REQUEST` | 요청 형식 오류 |
| 401 | `UNAUTHENTICATED` | 로그인 또는 세션 갱신 |
| 403 | `FORBIDDEN` | 권한 없음 |
| 404 | `NOT_FOUND` | 대상 없음, 목록 갱신 |
| 409 | `CONFLICT` | 최신 데이터 재조회 |
| 413 | `FILE_TOO_LARGE` | 파일 크기 안내 |
| 422 | `VALIDATION_ERROR` | 필드별 오류 |
| 429 | `RATE_LIMITED` | 재시도 대기 |
| 500 | `INTERNAL_ERROR` | requestId와 오류 안내 |
| 502/504 | `UPSTREAM_ERROR` | AI·외부 시스템 일시 오류 |

### 8.2 초기화·홈

```text
GET /me
GET /home?include=shortcuts,frequent,recent,stats
GET /me/preferences
PATCH /me/preferences
GET /assistants/shortcuts
```

### 8.3 대화

```text
GET  /conversations
GET  /conversations/:conversationId
POST /conversations
POST /conversations/:conversationId/messages
GET  /conversations/:conversationId/export?format=md
POST /messages/:messageId/regenerate
```

대화 생성:

```json
{
  "title": null,
  "assistantId": "ast_meeting",
  "initialQuery": "오늘 계약 검토 회의 내용을 정리해 줘",
  "source": "home"
}
```

메시지 요청:

```json
{
  "text": "입고 처리가 안 된 작업지시가 있어?",
  "assistantId": null,
  "fileIds": ["fil_123"],
  "followUpOfMessageId": null,
  "clientMessageId": "client_01J..."
}
```

`source` 허용 값:

```text
home | market | history | briefing | assistant
```

### 8.4 파일·임베딩

```text
POST   /files
GET    /files/:fileId
DELETE /files/:fileId
```

파일 목적:

```text
conversation | assistant_knowledge
```

상태:

```text
uploaded | indexing | ready | failed | deleted
```

### 8.5 답변 액션

```text
POST   /messages/:messageId/feedback
POST   /messages/:messageId/save
DELETE /messages/:messageId/save
GET    /me/saved-answers
DELETE /me/saved-answers/:savedAnswerId
PATCH  /messages/:messageId/panels/:panelId/parameters
POST   /messages/:messageId/panels/:panelId/rerun
```

### 8.6 비서마켓·비서 CRUD

```text
GET    /assistants?scope=official
GET    /assistants?scope=mine
GET    /assistants?scope=all
GET    /assistants/:assistantId
POST   /assistants
PATCH  /assistants/:assistantId
DELETE /assistants/:assistantId
POST   /assistants/:assistantId/clone
POST   /assistants/:assistantId/publish
GET    /assistants/:assistantId/stats
GET    /assistants/:assistantId/comments
```

즐겨찾기·순서:

```text
GET    /me/favorites
PUT    /me/favorites/:assistantId
DELETE /me/favorites/:assistantId
GET    /me/assistant-order
PUT    /me/assistant-order
```

### 8.7 비서 초안·연결·데이터셋

```text
POST /assistant-drafts
GET  /datasets
GET  /connectors/available
GET  /apis/available
GET  /icons
```

초안 생성:

```json
{
  "prompt": "우리 회사 매뉴얼을 참고해 답변해주는 비서",
  "locale": "ko-KR"
}
```

비서 저장 요청의 핵심 필드:

```json
{
  "name": "내부 보고서 요약",
  "description": "기안문·보고서 핵심 요약 및 키워드 추출",
  "category": "분석",
  "icon": {
    "name": "BookOpen",
    "background": "#F4F3FC",
    "color": "#4F46E5"
  },
  "instructions": "당신은 보고서 요약 전문 비서입니다...",
  "prohibitions": ["확인되지 않은 내용을 추가하지 않습니다."],
  "conversationStarters": ["이 보고서를 핵심만 요약해 주세요."],
  "knowledgeFileIds": ["fil_123"],
  "firstMessage": "안녕하세요! 요약할 문서를 공유해 주세요.",
  "useFoundationModel": true,
  "visibility": "private",
  "designatedUserIds": [],
  "datasetIds": ["legal"],
  "connectorIds": ["github"],
  "apiIds": ["erp"],
  "requestReview": false
}
```

### 8.8 브리핑

```text
GET  /briefings/today?date=2026-09-01&blocks=personal,trending,popular
POST /briefings/items/:topicId/query
GET  /help/briefing
```

### 8.9 설정·메모리·사용량

```text
GET/PATCH /me/preferences
GET/PATCH /me/assistant-preferences
GET/PATCH /me/notification-preferences
GET       /me/usage
GET/POST/PATCH/DELETE /me/memories
DELETE    /me/memories
```

메모리 범위:

```text
scope=all|assistant
assistantId=<assistantId>
```

사용량 기간:

```text
today | yesterday | week | month | cumulative
```

권장 사용량 응답:

```json
{
  "data": {
    "period": "month",
    "queryCount": 4821,
    "tokenUsage": {
      "totalTokens": 1280000
    },
    "cost": {
      "provider": "service-default",
      "model": "default",
      "exchangeRateKrw": 1400,
      "estimatedAverageUsdPerMillion": 7.2,
      "estimatedCostUsd": 9.216,
      "estimatedCostKrw": 12902,
      "estimated": true,
      "estimationMethod": "total_tokens_average_rate"
    },
    "remainingCredits": 74,
    "limit": 100,
    "unit": "percent",
    "series": [
      { "date": "2026-08-23", "value": 198 }
    ]
  }
}
```

### 8.10 알림·도움말

```text
GET    /notifications
PATCH  /notifications/:notificationId
POST   /notifications/read-all
DELETE /notifications/:notificationId
GET    /help/topics
POST   /help/query
```

### 8.11 관리자

```text
GET   /admin/connectors
GET   /admin/assistant-approval-requests
GET   /admin/assistant-approval-requests/:requestId
PATCH /admin/assistant-approval-requests/:requestId
GET   /admin/datasets
POST  /admin/datasets
PATCH /admin/datasets/:datasetId
```

---

## 9. 데모 데이터와 실제 서비스 교체 지점

### 9.1 현재 데모로 남아 있는 항목

- 홈 통계
- 추천 비서와 공식 비서 목록
- 대화 이력
- 질의 분류
- RAG 답변 및 출처
- TAG/ERP 입고 현황
- 표와 차트
- 저장 목록
- 알림 목록
- 브리핑
- 메모리
- 사용량·비용
- 사용자 이름과 아바타
- 비서 상세 통계와 댓글
- 아이콘 목록
- 관리자 승인 MCP/API 목록

### 9.2 실제 API로 바꾸는 방법

#### 단계 1: 조회 데이터 연결

1. `/me`
2. `/home`
3. `/conversations`
4. `/assistants`
5. `/notifications`
6. `/me/saved-answers`

컴포넌트 내부 상수 대신 query cache를 사용하고, 로딩·오류·빈 상태를 구분합니다.

#### 단계 2: 대화 스트리밍

1. 대화 생성
2. 메시지 전송
3. SSE 연결
4. `classification.completed` 수신
5. 패널별 `answer.delta` 수신
6. 표·차트·출처 이벤트 수신
7. 완료·실패 처리

#### 단계 3: mutation 연결

- 저장/삭제
- 피드백
- 즐겨찾기
- 알림 읽음/삭제
- 비서 순서
- 메모리 CRUD
- 파일 삭제

#### 단계 4: 운영 연동

- ERP/TAG 실제 조회
- 사내 문서 색인 및 RAG
- MCP/API 권한 관리
- 비서 공개 승인
- 실제 사용량 집계
- 감사 로그

### 9.3 데모 수치 처리 원칙

데모 데이터를 운영 데이터처럼 보이게 하지 않습니다.

- 브리핑은 `데모 데이터` 또는 실제 API 생성 시각을 명시할 수 있다.
- 비용은 `예상 비용`으로 표시한다.
- 출처가 실제 문서가 아니면 링크를 제공하지 않는다.
- 입고 현황의 7건은 fixture일 뿐, 운영 데이터로 간주하지 않는다.
- 인증되지 않은 개발 환경에서 보호된 API의 `401`은 정상적인 상태로 취급한다.

---

## 10. 스타일·디자인 시스템

### 10.1 시각적 방향

- 조용하고 업무용인 라벤더·보라색 UI
- 카드와 패널은 둥근 모서리
- 얇은 테두리와 낮은 그림자
- 정보량은 많지만 시각적 계층은 명확하게 유지
- 작업 상태는 보라색, 성공은 녹색, 경고는 노란색, 오류는 빨간색
- 헤딩은 진하고, 보조 텍스트는 회색·라벤더

### 10.2 색상 토큰

라이트 테마 주요 색상:

| 용도 | 색상 |
|---|---|
| 기본 배경 | `#FFFFFF` |
| 보조 배경 | `#F9F8FF` |
| 카드·입력 배경 | `#FAFAFF` |
| hover 배경 | `#F4F3FC` |
| 선택 배경 | `#F0EEFF` |
| 주요 보라 | `#4F46E5` |
| 주요 보라 hover | `#4338CA` |
| 본문 | `#1A1826` |
| 보조 본문 | `#6B6882` |
| 비활성 본문 | `#A8A6C0` |
| 테두리 | `#E4E2F0` |
| 선택 테두리 | `#C7C3F7` |
| 성공 | `#10B981` 또는 `#16A34A` |
| 오류 | `#EF4444` |
| 경고 | `#F59E0B` |
| 정보 | `#0284C7` |

카테고리 색상:

| 카테고리 | 배경 | 글자 |
|---|---|---|
| 글쓰기 | `#EEF0FF` | `#4F46E5` |
| 코드 | `#E0F2FE` | `#0284C7` |
| 번역 | `#F0FDF4` | `#16A34A` |
| 분석 | `#FFF7ED` | `#D97706` |
| 법률·회계 | `#FFF5F5` | `#DC2626` |

### 10.3 타이포그래피

- 기본 폰트: `Jeju Samdasoo`
- fallback: `sans-serif`
- 본문은 읽기 쉬운 13~14px을 중심으로 한다.
- 상단바 제목은 약 16px, 주요 화면 제목은 19px 전후
- 작은 메타 정보는 10~12px
- 대화 답변은 카드 내부 여백과 line-height를 넉넉하게 둔다.
- 데이터 표는 숫자 정렬을 맞추고, 제목·단위를 분리한다.

### 10.4 컴포넌트 형태

- 기본 radius: `rounded-xl` 또는 `rounded-2xl`
- 버튼 radius: `rounded-lg`
- 카드 border: 1px solid
- 모달 backdrop:
  - `rgba(26,24,38,0.45)`
  - 약한 blur
- transition은 150~300ms
- 패널 열림은 width/translate/opacity를 함께 전환

### 10.5 아이콘

Lucide React를 기본으로 사용합니다.

- 버튼은 아이콘만 있는 경우 tooltip과 `aria-label`을 제공
- 상태 아이콘은 색상만으로 의미를 전달하지 않는다.
- 아이콘 선택 기능은 서버 목록과 동기화할 수 있으나 색상 팔레트는 우선 프론트 토큰으로 유지한다.

---

## 11. 다크모드

### 동작

- 테마 값: `light | dark`
- `localStorage` 키: `jpdc-theme`
- HTML root에 `dark` 클래스를 토글
- 새로고침 후에도 선택을 유지
- 설정 모달의 `라이트`, `다크` 선택과 사이드바 빠른 토글이 동일 상태를 갱신해야 한다.

### 다크 팔레트

| 용도 | 색상 |
|---|---|
| body 배경 | `#0F0D1A` |
| 주요 표면 | `#1A1726` |
| 보조 표면 | `#252237` |
| 카드 | `#1E1C2E` |
| 테두리 | `#4A4870` |
| 보라 강조 | `#A8A5FF` |
| 주요 텍스트 | `#F2F0FF` |
| 보조 텍스트 | `#C0BEDC` |
| placeholder | `#8A88A8` |
| 스크롤 thumb | `#2E2B47` |

다크모드에서도 성공·경고·오류의 대비를 유지합니다.

---

## 12. 접근성·품질 기준

- 모든 버튼은 키보드로 접근할 수 있어야 한다.
- 모달은 열릴 때 첫 입력 또는 닫기 버튼으로 포커스를 이동한다.
- `Escape`로 모달·드로어를 닫을 수 있어야 한다.
- 토글은 `role="switch"`와 `aria-checked`를 사용한다.
- 탭은 `role="tablist"`, `role="tab"`, `aria-selected`를 사용한다.
- 알림 읽지 않음은 점뿐 아니라 텍스트·상태로도 확인 가능해야 한다.
- 차트는 표 데이터를 대체하지 않는다. 표와 차트를 함께 제공한다.
- 스트리밍 중인 답변은 스크린리더가 너무 자주 읽지 않도록 live region 정책을 둔다.
- 오류에는 사용자가 다음에 할 수 있는 행동을 함께 보여 준다.
- 빈 상태와 로딩 상태를 별도로 설계한다.
- 모바일에서 가로 스크롤이 필요한 표·탭은 의도적으로 표시한다.

---

## 13. 권장 구현 순서

### Phase 0: 기반

- [ ] 프로젝트 구조와 실행 명령 확정
- [ ] `PORT`, base path, proxy 설정
- [ ] 공통 색상·타이포그래피·다크 토큰 작성
- [ ] React Router 또는 기존 path router 구성
- [ ] 공통 Button, Card, Modal, Drawer, Tooltip, EmptyState 작성
- [ ] API client와 오류 타입 작성

### Phase 1: 앱 골격

- [ ] 앱 shell
- [ ] 사이드바 펼침/접힘
- [ ] 메인 상단바
- [ ] 모바일 drawer
- [ ] 홈 화면
- [ ] 대화 화면의 사용자/AI 메시지 기본 렌더링
- [ ] 다크모드와 localStorage

### Phase 2: 핵심 질의 경험

- [ ] 질의 입력과 Enter 전송
- [ ] 예시 질의 채우기
- [ ] 비서 선택
- [ ] 대화 생성
- [ ] SSE 수신기
- [ ] 분류 배지
- [ ] 스트리밍 답변
- [ ] 실패·재생성

### Phase 3: RAG/TAG

- [ ] 지침 답변
- [ ] 출처 카드
- [ ] 정확한 지침 없음 상태
- [ ] TAG 표
- [ ] 차트
- [ ] Dual TAG 해석 카드
- [ ] 파라미터 수정·재조회
- [ ] 입고 `route-select`
- [ ] 이어서 질의
- [ ] 추천 비서

### Phase 4: 답변 관리

- [ ] 방향별 좋아요·싫어요
- [ ] 1~5점 별점 제한
- [ ] 피드백 사유
- [ ] 저장·삭제
- [ ] 저장 목록 패널
- [ ] 복사
- [ ] Markdown 다운로드

### Phase 5: 마켓·비서 생성

- [ ] 공식·전체·내 비서 목록
- [ ] 검색·카테고리·정렬
- [ ] 즐겨찾기
- [ ] 상세 모달
- [ ] 복제
- [ ] 통계·댓글
- [ ] 비서 초안 생성
- [ ] 비서 builder
- [ ] 파일·지식 데이터셋
- [ ] 공개 범위

### Phase 6: 개인화

- [ ] 개인 설정 표시 탭
- [ ] 비서 순서
- [ ] 알림 설정
- [ ] 사용량
- [ ] 메모리 탭 또는 진입점
- [ ] 알림 센터
- [ ] 저장 목록 빈 상태

### Phase 7: 브리핑·운영

- [ ] 아침 브리핑
- [ ] 브리핑 항목으로 바로 질문
- [ ] 도움말·매뉴얼 검색
- [ ] 관리자 MCP/API 승인
- [ ] 권한 서버 검증
- [ ] 실제 ERP/TAG 연결
- [ ] 실제 RAG 색인
- [ ] 감사 로그·사용량 집계

---

## 14. 테스트 체크리스트

### 홈

- [ ] 홈 최초 로딩
- [ ] 예시 질의 클릭 시 자동 전송되지 않음
- [ ] 빈 질의 전송 방지
- [ ] 파일 첨부·삭제
- [ ] 파일 indexing·ready·failed 표시
- [ ] 비서 선택과 해제

### 대화

- [ ] 일반 지침 질의
- [ ] TAG 통계 질의
- [ ] RAG+TAG 복합 질의
- [ ] Dual TAG 해석 선택
- [ ] 입고 route-select 질의
- [ ] 띄어쓰기 다른 route-select 질의
- [ ] 지침 경로
- [ ] ERP 경로
- [ ] 표·차트 표시
- [ ] 스트리밍 중 새 질의 잠금
- [ ] 실패 후 재생성
- [ ] 이어서 질의가 자동 전송되지 않음
- [ ] `followUpOfMessageId` 포함

### 답변 액션

- [ ] 좋아요 후 녹색 별만 선택 가능
- [ ] 싫어요 후 빨간 별만 선택 가능
- [ ] 저장·저장 취소
- [ ] 저장 목록에 최신순 표시
- [ ] 저장 항목 삭제
- [ ] 목록 빈 상태
- [ ] 복사 성공 피드백
- [ ] Markdown 다운로드

### 비서마켓

- [ ] 탭 이동
- [ ] 검색 결과
- [ ] 검색 결과 없음
- [ ] 즐겨찾기 추가·삭제
- [ ] 상세 모달
- [ ] 대화 시작
- [ ] 비서 복제
- [ ] 내가 만든 비서 CRUD
- [ ] 공개 범위별 접근 제한

### 개인 설정·패널

- [ ] 라이트/다크 전환
- [ ] 새로고침 후 테마 유지
- [ ] 글꼴 크기 미리보기
- [ ] 밀도 미리보기
- [ ] 비서 순서 위/아래 이동
- [ ] 알림 토글
- [ ] 사용량 기간 탭
- [ ] Total Tokens만 표시
- [ ] Estimated Cost · 예상 비용 표시
- [ ] 환율 1,400원 고정
- [ ] 사용량 탭에 `취소`·`저장` 없음
- [ ] 메모리 추가·수정·범위 변경·삭제
- [ ] 알림 읽음·모두 읽음·삭제
- [ ] 알림 빈 상태

### 반응형·접근성

- [ ] 1440px 데스크톱
- [ ] 1024px 태블릿
- [ ] 767px 이하 모바일
- [ ] 키보드 탭 이동
- [ ] Escape 닫기
- [ ] 모달 포커스
- [ ] 아이콘 버튼 aria-label
- [ ] 차트와 표의 정보 동등성
- [ ] 다크모드 대비

---

## 15. 현재 구현과 운영 버전의 차이 요약

| 기능 | 현재 데모 구현 | 운영 재구축 |
|---|---|---|
| 사용자 | 하드코딩 표시명 | `GET /me`와 세션 |
| 홈 통계 | 컴포넌트 상수 | `/home` |
| 대화 목록 | 초기 배열 | `/conversations` |
| 질의 분류 | 브라우저 로직·데모 규칙 | 서버 분류 이벤트 |
| 답변 | 타이머 기반 모의 스트리밍 | SSE |
| RAG 출처 | 샘플 데이터 | 문서 검색 서비스 |
| TAG/ERP | 샘플 7건 및 차트 | 실제 ERP/API |
| 저장 | 메모리 배열 | saved answers API |
| 알림 | 컴포넌트 초기 배열 | notifications API |
| 메모리 | 로컬 상태 | memories API |
| 파일 임베딩 | 브라우저 타이머 | 파일·작업 큐·상태 API |
| 비서 목록 | 상수 목록 | assistants API |
| 비서 생성 | 데모 초안 | draft/assistant API |
| MCP/API | 승인 목록 상수 | 관리자 권한 API |
| 브리핑 | 정적 블록 | 브리핑 집계 API |
| 사용량 | 데모 숫자 | 실제 집계 API |
| 비용 | 평균 단가 기반 예상값 | 실제 과금 데이터가 있으면 확정값, 없으면 예상값 |

---

## 16. 최종 완료 기준

재구축이 완료되었다고 판단하려면 다음을 모두 만족해야 합니다.

1. 로그인 사용자 기준으로 홈과 사이드바가 로드된다.
2. 홈에서 예시 질의를 입력하고 대화 화면으로 이동할 수 있다.
3. 지침·TAG·RAG+TAG·비서 분기가 눈에 보이는 상태로 구분된다.
4. 입고 선택형 질의가 지침/ERP 선택 UI를 거친다.
5. 지침 경로와 ERP 경로가 각각 다른 결과 패널을 표시한다.
6. 표와 차트가 함께 표시되며 차트 없이도 데이터를 이해할 수 있다.
7. 답변 완료 후 피드백·별점·저장·복사·Markdown 다운로드가 동작한다.
8. 이어서 질의는 사용자 입력을 기다리며 자동 질의가 발생하지 않는다.
9. 비서마켓에서 상세 보기, 즐겨찾기, 대화 시작, 복제가 동작한다.
10. 비서 builder에서 자연어 초안 생성부터 저장까지 가능하다.
11. 알림과 저장 목록의 읽음·삭제·빈 상태가 동작한다.
12. 개인 설정의 표시·비서·알림·사용량이 동작한다.
13. 사용량은 `Total Tokens`, `Estimated Cost · 예상 비용`, 공통 환율 `1,400원` 정책을 지킨다.
14. 메모리를 추가·수정·범위 변경·삭제할 수 있다.
15. 브리핑과 매뉴얼이 각각 독립 화면으로 동작한다.
16. 다크모드와 모바일 레이아웃에서 주요 기능을 사용할 수 있다.
17. 모든 보호 API가 서버에서 세션과 권한을 검증한다.
18. 데모 데이터와 실제 API 데이터가 사용자에게 혼동되지 않는다.
19. 브라우저 콘솔에 새 오류가 없고, production build가 성공한다.
20. API 계약과 프론트 상태가 이 문서의 모델·이벤트 이름과 일치한다.

---

## 17. 관련 문서

- `README.md`: 프로젝트 개요, 실행 방법, 현재 데모·API 상태
- `artifacts/api-server/API_SPEC.md`: 전체 API 엔드포인트와 요청·응답 계약
- `artifacts/jpdc-ai/src/App.tsx`: 앱 shell, 전역 화면 전환, 패널 상태
- `artifacts/jpdc-ai/src/views/HomeView.tsx`: 홈
- `artifacts/jpdc-ai/src/views/ConversationView.tsx`: 대화·분류·답변 패널
- `artifacts/jpdc-ai/src/views/MarketView.tsx`: 비서마켓
- `artifacts/jpdc-ai/src/views/AssistantBuilderView.tsx`: 비서 builder
- `artifacts/jpdc-ai/src/components/SettingsModal.tsx`: 개인 설정·사용량·메모리
- `artifacts/jpdc-ai/src/components/BriefingModal.tsx`: 아침 브리핑
- `artifacts/jpdc-ai/src/components/SavedPanel.tsx`: 저장 목록
- `artifacts/jpdc-ai/src/components/NotifPanel.tsx`: 알림 센터
- `artifacts/jpdc-ai/src/index.css`: 색상·다크모드·반응형 스타일
