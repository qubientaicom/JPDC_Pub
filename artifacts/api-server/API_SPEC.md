# JPDC AI API 명세서

> 프론트엔드 연동용 API 계약서  
> 기준 화면: `artifacts/jpdc-ai`  
> 문서 버전: `0.1.0`  
> 작성 기준: 현재 UI의 컴포넌트·정적 데이터·사용자 액션

## 1. 문서 목적과 현재 상태

현재 `artifacts/api-server`에는 `/api/healthz`만 구현되어 있습니다. 이 문서는 실제 API 구현 전에 프론트와 백엔드가 합의해야 하는 전체 API 목록과 데이터 계약을 정의합니다.

- 아래 목록의 `✅ MVP`는 실제 서비스 1차 구현에 포함합니다.
- `◐ 2차`는 화면에는 있으나 운영 정책·외부 시스템 연동이 필요한 기능입니다.
- API가 아직 구현되지 않았으므로 예시 응답은 계약용 샘플입니다.
- 정적 데모 데이터의 날짜·수치·문구는 운영 API에서 내려주는 값으로 대체합니다.

## 2. 공통 규칙

### 2.1 Base URL과 헤더

| 항목 | 규칙 |
|---|---|
| 운영 Base URL | `/api/v1` |
| 헬스체크 | `/api/healthz` (버전 prefix 없음) |
| 요청 형식 | `application/json; charset=utf-8` |
| 파일 업로드 | `multipart/form-data` |
| 시간 | ISO 8601 UTC, 예: `2026-08-24T06:00:00Z` |
| 페이지 기본값 | `page=1`, `pageSize=20`, 최대 `100` |
| 정렬 | `sort=createdAt`, `order=asc\|desc` |
| 인증 | 서버 세션 쿠키, 프론트는 `credentials: include` 사용 |
| 요청 추적 | 서버가 `X-Request-Id` 응답 헤더를 제공 |

인증이 연결되지 않은 개발 환경에서는 보호된 API가 `401`을 반환하는 것이 정상입니다. 프론트에서 사용자 ID를 요청 body로 보내 인증을 우회하지 않습니다.

### 2.2 공통 성공 응답

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

### 2.3 공통 오류 응답

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

| HTTP | code | 프론트 처리 |
|---:|---|---|
| 400 | `BAD_REQUEST` | 요청 형식 오류 안내 |
| 401 | `UNAUTHENTICATED` | 로그인 화면 또는 세션 갱신 |
| 403 | `FORBIDDEN` | 권한 없음 안내 |
| 404 | `NOT_FOUND` | 대상 없음/목록 갱신 |
| 409 | `CONFLICT` | 최신 데이터 재조회 |
| 413 | `FILE_TOO_LARGE` | 파일 크기 안내 |
| 422 | `VALIDATION_ERROR` | 필드별 오류 표시 |
| 429 | `RATE_LIMITED` | 재시도 대기 |
| 500 | `INTERNAL_ERROR` | 일반 오류와 requestId 표시 |
| 502/504 | `UPSTREAM_ERROR` | AI·외부 시스템 일시 오류 표시 |

### 2.4 권한

| 역할 | 의미 |
|---|---|
| `user` | 본인 대화·저장·설정·메모리·즐겨찾기·비서 생성 |
| `assistant_owner` | 본인이 만든 비서의 수정·통계·테스트 요청 처리 |
| `reviewer` | 공개 전 테스트 평가·승인 검토 |
| `admin` | 공식 비서·데이터셋·MCP/API 승인 정책 관리 |

공개 범위(`visibility`)가 `private`인 리소스는 소유자만 조회할 수 있습니다.

## 3. 화면별 API 한눈에 보기

| 화면/컴포넌트 | API |
|---|---|
| 앱 초기화·사용자 | `GET /me`, `GET/PATCH /me/preferences` |
| 홈 | `GET /home`, `GET /assistants/shortcuts` |
| 사이드바·대화 이력 | `GET /conversations`, `GET /conversations/:conversationId` |
| 대화 입력 | `POST /conversations`, `POST /conversations/:conversationId/messages` |
| AI 스트리밍 | 위 messages API의 `text/event-stream` |
| 파일 첨부 | `POST /files`, `GET /files/:fileId`, `DELETE /files/:fileId` |
| 답변 액션바 | `POST /messages/:messageId/feedback`, `POST/DELETE /messages/:messageId/save`, `POST /messages/:messageId/regenerate`, `GET /conversations/:id/export` |
| 비서마켓 공식 탭 | `GET /assistants?scope=official`, `GET /assistants/:assistantId` |
| 내가 만든 비서 | `GET /assistants?scope=mine`, `POST/PATCH/DELETE /assistants` |
| 공개 전 테스트 | `GET /assistant-test-requests`, `POST /assistant-test-requests/:id/review` |
| 비서 통계·댓글 | `GET /assistants/:id/stats`, `GET /assistants/:id/comments` |
| 즐겨찾기·비서 순서 | `GET/PUT/DELETE /me/favorites/:assistantId`, `GET/PUT /me/assistant-order` |
| 비서 빌더 | `POST /assistant-drafts`, `POST/PATCH /assistants` |
| 관리자 MCP/API 승인 | `GET /admin/connectors`, `GET/PATCH /admin/assistant-approval-requests/:id` |
| 브리핑 | `GET /briefings/today`, `POST /briefings/items/:topicId/query` |
| 개인 설정 | `GET/PATCH /me/preferences`, `GET/PATCH /me/assistant-preferences`, `GET/PATCH /me/notification-preferences`, `GET /me/usage` |
| 메모리 | `GET/POST/PATCH/DELETE /me/memories` |
| 저장 목록 | `GET /me/saved-answers`, `DELETE /me/saved-answers/:savedAnswerId` |
| 알림 센터 | `GET /notifications`, `PATCH/DELETE /notifications/:notificationId`, `POST /notifications/read-all` |
| 매뉴얼·도움말 | `GET /help/topics`, `POST /help/query` |
| 아이콘 선택 | `GET /icons` |

## 4. 사용자·앱 초기화

### 4.1 현재 사용자 조회

#### `GET /me` — ✅ MVP

Sidebar의 이름/아바타, 설정 모달의 사용자 정보와 초기 권한을 채웁니다.

응답 `data`:

```json
{
  "id": "usr_123",
  "displayName": "김동현",
  "avatarUrl": null,
  "role": "user",
  "department": "디지털혁신팀",
  "permissions": {
    "canCreateAssistant": true,
    "canPublishAssistant": false,
    "canReviewAssistant": false,
    "canManageConnectors": false
  },
  "locale": "ko-KR",
  "timezone": "Asia/Seoul"
}
```

### 4.2 앱 홈 집계

#### `GET /home` — ✅ MVP

홈 화면에 필요한 데이터를 한 번에 로드할 때 사용합니다. 개별 API를 병렬 호출해도 됩니다.

Query:

| 이름 | 타입 | 설명 |
|---|---|---|
| `include` | string | `shortcuts,frequent,recent,stats` 중 comma-separated |

응답:

```json
{
  "data": {
    "stats": {
      "mostUsedAssistant": { "assistantId": "ast_meeting", "name": "회의록 문장정리", "count": 247 },
      "activeUsers": { "value": 183, "comparison": 12, "comparisonLabel": "전날 대비" },
      "dialogues": { "value": 1024, "comparison": 89, "comparisonLabel": "전날 대비" }
    },
    "shortcuts": [
      {
        "assistantId": "ast_writing",
        "name": "AI 글쓰기",
        "description": "블로그·기획서·이메일 등 다양한 글 작성",
        "icon": { "name": "PenTool", "background": "#F4F3FC", "color": "#4F46E5" },
        "starters": ["보도자료 초안을 작성해줘"]
      }
    ],
    "recent": [],
    "frequent": []
  }
}
```

### 4.3 개인 표시 설정

#### `GET /me/preferences` — ✅ MVP  
#### `PATCH /me/preferences` — ✅ MVP

Request `PATCH`:

```json
{
  "theme": "dark",
  "fontSize": "normal",
  "density": "standard",
  "locale": "ko-KR",
  "timezone": "Asia/Seoul"
}
```

`theme`: `light | dark`, `fontSize`: `small | normal | large`, `density`: `comfortable | standard | compact`.

## 5. 대화·질의·AI 응답 API

### 5.1 대화 목록

#### `GET /conversations` — ✅ MVP

Sidebar의 `오늘`, `어제`, `지난 7일` 그룹에 필요한 이력을 반환합니다.

Query:

| 이름 | 타입 | 설명 |
|---|---|---|
| `q` | string | 대화 제목/질의 검색 |
| `group` | `today\|yesterday\|last7days\|all` | 날짜 그룹 필터 |
| `page`, `pageSize` | number | 페이지 |

응답 항목:

```json
{
  "id": "cnv_123",
  "title": "공공기관 보안 지침 알려줘",
  "lastMessagePreview": "반출 제한 대상은 다음과 같습니다...",
  "queryKinds": ["instruction"],
  "badges": ["RAG"],
  "createdAt": "2026-08-24T01:10:00Z",
  "updatedAt": "2026-08-24T01:12:00Z",
  "messageCount": 4
}
```

#### `GET /conversations/:conversationId` — ✅ MVP

대화 화면 재진입 시 메시지와 첨부 파일을 불러옵니다.

응답:

```json
{
  "data": {
    "id": "cnv_123",
    "title": "공공기관 보안 지침 알려줘",
    "assistant": null,
    "messages": [],
    "createdAt": "2026-08-24T01:10:00Z",
    "updatedAt": "2026-08-24T01:12:00Z"
  }
}
```

### 5.2 대화 생성

#### `POST /conversations` — ✅ MVP

홈·마켓·사이드바에서 새 대화를 시작합니다.

Request:

```json
{
  "title": null,
  "assistantId": "ast_meeting",
  "initialQuery": "오늘 계약 검토 회의 내용을 정리해 줘",
  "source": "home"
}
```

`source`: `home | market | history | briefing | assistant`.

응답:

```json
{
  "data": {
    "id": "cnv_124",
    "assistantId": "ast_meeting",
    "status": "active",
    "createdAt": "2026-08-24T01:15:00Z"
  }
}
```

### 5.3 메시지 전송 및 스트리밍

#### `POST /conversations/:conversationId/messages` — ✅ MVP

기본 응답은 SSE입니다. 프론트는 `Accept: text/event-stream`을 보냅니다.

Request:

```json
{
  "text": "입고 처리가 안 된 작업지시가 있어?",
  "assistantId": null,
  "fileIds": ["fil_123"],
  "followUpOfMessageId": null,
  "clientMessageId": "client_01J..."
}
```

일반 JSON 응답이 필요한 경우 `Accept: application/json`으로 요청하면 스트림 완료 후 아래 형태를 반환합니다.

```json
{
  "data": {
    "userMessageId": "msg_user_1",
    "assistantMessageId": "msg_ai_1",
    "conversationId": "cnv_124",
    "queryKind": "rag-tag-assistant",
    "status": "completed"
  }
}
```

#### SSE 이벤트 계약

각 이벤트는 `event:`와 JSON `data:`를 함께 전송합니다.

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

event: recommendations.completed
data: {"candidates":[{"assistantId":"ast_data","name":"데이터 분석 비서","match":97}]}

event: answer.completed
data: {"panelId":"panel_rag_1"}

event: message.completed
data: {"messageId":"msg_ai_1","status":"completed"}
```

허용 이벤트:

| 이벤트 | 용도 |
|---|---|
| `message.started` | AI 메시지 초기화 |
| `classification.completed` | `QueryKind`와 분류 배지 |
| `answer.started` | 패널 생성 |
| `answer.delta` | 스트리밍 텍스트 |
| `sources.completed` | 참고 문서 |
| `stats.completed` | TAG 표·요약 수치·차트 |
| `interpretation.completed` | Dual TAG 해석 카드 |
| `recommendations.completed` | 추천 비서 |
| `tool.started` / `tool.completed` | MCP·API·RAG·TAG 도구 상태 |
| `answer.completed` | 패널별 스트리밍 완료 |
| `message.completed` | ActionBar 활성화 |
| `message.failed` | 오류 표시 |

### 5.4 질의 유형

`queryKind`는 현재 UI의 분류 상태와 동일한 문자열을 사용합니다.

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
```

백엔드는 분류된 최종 결과를 반환하며, 프론트는 문자열 검색으로 질의 유형을 재판정하지 않습니다.

복합 결과의 `panels` 예시:

```json
{
  "messageId": "msg_ai_1",
  "queryKind": "dual-tag",
  "panels": [
    {
      "id": "panel_1",
      "type": "interpretation",
      "label": "해석 1 — 제품별 합계",
      "description": "3월 제품 유형별 생산량 합계를 조회합니다",
      "parameters": [
        { "key": "월", "value": "3월", "editable": true },
        { "key": "연도", "value": "2026", "editable": true },
        { "key": "집계기준", "value": "제품별", "editable": true }
      ],
      "sql": "SELECT product_name, SUM(qty) AS total_qty ...",
      "columns": ["제품명", "생산량 (병)", "비율 (%)"],
      "rows": [["제주삼다수 2L", "1,842,000", "38.4%"]],
      "chart": { "type": "bar", "unit": "병", "data": [{ "label": "제주삼다수 2L", "value": 1842000 }] }
    }
  ]
}
```

`sql`은 관리자 권한 또는 디버그 환경에서만 반환합니다. 일반 사용자 응답에서는 `sql`을 생략하거나 마스킹합니다.

### 5.5 Dual TAG 해석 수정·재조회

#### `PATCH /messages/:messageId/panels/:panelId/parameters` — ✅ MVP

Request:

```json
{
  "parameters": [
    { "key": "월", "value": "4월" },
    { "key": "집계기준", "value": "라인별" }
  ]
}
```

#### `POST /messages/:messageId/panels/:panelId/rerun` — ✅ MVP

응답은 일반 메시지와 동일한 SSE 이벤트 스트림이며, `tool.started`, `stats.completed`, `answer.delta`, `message.completed`를 보냅니다.

### 5.6 이어서 질의

`이어서 질의` 버튼 자체는 별도 AI 호출을 하지 않습니다. 클릭 시 프론트가 입력창에 포커스를 주고 `followUpOfMessageId`를 포함해 일반 messages API를 호출합니다.

```json
{
  "text": "검수 대기 건만 자세히 알려줘",
  "followUpOfMessageId": "msg_ai_1",
  "assistantId": null,
  "fileIds": []
}
```

서버는 자동 후속 질의를 생성하거나 전송하지 않습니다.

### 5.7 메시지 재생성·내보내기

#### `POST /messages/:messageId/regenerate` — ✅ MVP

기존 질의를 같은 조건으로 다시 처리합니다. 응답은 SSE입니다.

#### `GET /conversations/:conversationId/export?format=md` — ✅ MVP

`text/markdown; charset=utf-8` 파일을 반환합니다. 질문, 답변, 생성일, 참고 문서를 포함합니다.

## 6. 파일 업로드·임베딩

### 6.1 파일 등록

#### `POST /files` — ✅ MVP

`multipart/form-data` 필드:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `file` | binary | O | 업로드 파일 |
| `purpose` | string | O | `conversation\|assistant_knowledge` |
| `conversationId` | string | 조건부 | conversation 용도일 때 |
| `assistantId` | string | 조건부 | knowledge 용도일 때 |

응답:

```json
{
  "data": {
    "id": "fil_123",
    "name": "계약서.pdf",
    "size": 245760,
    "mimeType": "application/pdf",
    "status": "indexing",
    "progress": 0,
    "createdAt": "2026-08-24T01:20:00Z"
  }
}
```

### 6.2 상태 조회

#### `GET /files/:fileId` — ✅ MVP

`status`: `uploaded | indexing | ready | failed | deleted`

```json
{
  "data": {
    "id": "fil_123",
    "status": "ready",
    "progress": 100,
    "embeddingModel": "bge-m3",
    "indexedChunks": 42,
    "error": null
  }
}
```

프론트의 현재 `1.2~2.2초` 인덱싱 애니메이션은 실제 API의 `progress`를 표시하는 로딩 상태로 교체합니다.

#### `DELETE /files/:fileId` — ✅ MVP

업로드 칩의 X와 빌더 지식 파일 삭제에 사용합니다.

## 7. 응답 액션·피드백·저장

### 7.1 피드백 제출

#### `POST /messages/:messageId/feedback` — ✅ MVP

Request:

```json
{
  "sentiment": "up",
  "rating": 4,
  "reasons": ["SOURCE", "RELEVANCE"],
  "comment": "출처가 명확하고 바로 업무에 사용할 수 있었습니다."
}
```

규칙:

- `sentiment=up`이면 `rating`은 `1..5` 양수이며 녹색 별만 활성화합니다.
- `sentiment=down`이면 `rating`은 `-1..-5` 음수이며 빨간 별만 활성화합니다.
- `rating=0`은 점수 미선택입니다.
- `reasons`는 `SOURCE`, `RELEVANCE`, `COMPLETENESS`, `RECENCY`, `DATA`, `FORMAT`, `ACTIONABILITY` 중 복수 선택입니다.

### 7.2 저장 답변

#### `POST /messages/:messageId/save` — ✅ MVP  
#### `DELETE /messages/:messageId/save` — ✅ MVP  
#### `GET /me/saved-answers` — ✅ MVP  
#### `DELETE /me/saved-answers/:savedAnswerId` — ✅ MVP

저장 응답:

```json
{
  "data": {
    "id": "sav_123",
    "messageId": "msg_ai_1",
    "query": "공공기관 보안 지침 알려줘",
    "answer": "반출 제한 대상은...",
    "savedAt": "2026-08-24T01:25:00Z"
  }
}
```

저장 패널은 최신 저장순으로 표시하며, 빈 목록은 `data: []`로 표현합니다.

## 8. 비서마켓

### 8.1 비서 목록

#### `GET /assistants` — ✅ MVP

Query:

| 이름 | 타입 | 설명 |
|---|---|---|
| `scope` | `official\|mine\|test\|all` | 탭 |
| `q` | string | 이름·기능·카테고리 검색 |
| `category` | string | `글쓰기`, `코드`, `번역`, `분석`, `법률·회계` 등 |
| `view` | `grid\|list` | 갤러리 표시 방식 |
| `status` | string | 상태 뱃지 필터 |
| `visibility` | string | 공개 범위 필터 |
| `page`, `pageSize`, `sort`, `order` | - | 공통 목록 옵션 |

비서 항목:

```json
{
  "id": "ast_meeting",
  "name": "회의록 문장정리",
  "description": "회의 내용을 체계적인 문서로 자동 정리",
  "icon": { "name": "PenTool", "background": "#F4F3FC", "color": "#4F46E5" },
  "category": "글쓰기",
  "author": { "id": "org_jpdc", "name": "JPDC" },
  "version": "v1.3",
  "status": "official",
  "visibility": "company",
  "isFavorite": false,
  "userCount": 12400,
  "dialogueCount": 12400,
  "messageCount": 41800,
  "isNew": false,
  "createdAt": "2026-01-10T00:00:00Z",
  "updatedAt": "2026-08-20T02:00:00Z"
}
```

상태: `draft | official | approved | updating | pending_review | rejected | pre_public_test`.

### 8.2 공식 비서 상세

#### `GET /assistants/:assistantId` — ✅ MVP

`fullDescription`, `conversationStarters`, `rating`, `ratingCount`, `ratingDistribution`, `likes`, `dislikes`, `comments`, `othersByAuthor`, `capabilities`를 포함합니다.

### 8.3 통계·댓글

#### `GET /assistants/:assistantId/stats` — ✅ MVP

Query `period=today|yesterday|week|month|all`.

```json
{
  "data": {
    "dialogueCount": 12400,
    "messageCount": 41800,
    "activeUsers": 183,
    "rating": 4.7,
    "ratingCount": 318,
    "likes": 284,
    "dislikes": 12,
    "timeseries": [{ "date": "2026-08-23", "count": 247 }]
  }
}
```

#### `GET /assistants/:assistantId/comments` — ✅ MVP

페이지네이션 목록으로 `author`, `text`, `createdAt`을 반환합니다.

### 8.4 내가 만든 비서 CRUD

#### `GET /assistants?scope=mine` — ✅ MVP  
#### `POST /assistants` — ✅ MVP  
#### `GET /assistants/:assistantId` — ✅ MVP  
#### `PATCH /assistants/:assistantId` — ✅ MVP  
#### `DELETE /assistants/:assistantId` — ✅ MVP

생성/수정 Request:

```json
{
  "name": "내부 보고서 요약",
  "description": "기안문·보고서 핵심 요약 및 키워드 추출",
  "category": "분석",
  "icon": { "name": "BookOpen", "background": "#F4F3FC", "color": "#4F46E5" },
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

### 8.5 비서 복제·공개·승인

#### `POST /assistants/:assistantId/clone` — ✅ MVP

Request:

```json
{ "name": "[복제] 회의록 문장정리", "visibility": "private" }
```

복제 응답에는 `highlightUntil`을 포함해 프론트가 2.8초 카드 강조를 표시할 수 있게 합니다.

#### `POST /assistants/:assistantId/publish` — ◐ 2차

공개 범위에 따라 승인 요청을 생성합니다.

#### `GET /assistant-test-requests` — ✅ MVP

내 비서로 들어온 공개 전 테스트 요청 목록입니다.

#### `POST /assistant-test-requests/:requestId/review` — ◐ 2차

Request:

```json
{
  "decision": "approved",
  "comment": "테스트 결과를 확인했습니다."
}
```

`decision`: `approved | rejected | request_changes`.

### 8.6 즐겨찾기·비서 순서

#### `GET /me/favorites` — ✅ MVP  
#### `PUT /me/favorites/:assistantId` — ✅ MVP  
#### `DELETE /me/favorites/:assistantId` — ✅ MVP  
#### `GET /me/assistant-order` — ✅ MVP  
#### `PUT /me/assistant-order` — ✅ MVP

순서 저장 Request:

```json
{ "assistantIds": ["ast_meeting", "ast_email", "ast_translate"] }
```

## 9. 비서 빌더·초안 생성

### 9.1 한 줄 요청으로 초안 생성

#### `POST /assistant-drafts` — ✅ MVP

Request:

```json
{
  "prompt": "우리 회사 매뉴얼을 참고해 답변해주는 비서",
  "locale": "ko-KR"
}
```

응답:

```json
{
  "data": {
    "draftId": "drf_123",
    "name": "매뉴얼 비서",
    "description": "회사 매뉴얼과 규정을 기반으로 정확한 답변을 제공하는 비서입니다.",
    "instructions": "당신은 회사 매뉴얼 기반 전문 비서입니다...",
    "prohibitions": ["문서에 없는 내용을 추측해 답하지 않습니다."],
    "conversationStarters": ["출장 신청 절차를 알려주세요."],
    "knowledgeFileIds": [],
    "firstMessage": "안녕하세요! 회사 매뉴얼과 규정에 관한 질문에 답변드리겠습니다.",
    "useFoundationModel": false
  }
}
```

현재 UI의 1.6초 생성 애니메이션은 해당 API의 진행 상태로 교체합니다. 대규모 모델 생성이 필요하면 동일 API를 SSE로 확장할 수 있습니다.

### 9.2 빌더 선택지

#### `GET /datasets` — ✅ MVP  
#### `GET /connectors/available` — ✅ MVP  
#### `GET /apis/available` — ✅ MVP

응답은 현재 빌더의 데이터셋, 관리자 승인 MCP 서버, 승인 API 목록과 동일한 필드를 사용합니다.

```json
{
  "data": [
    {
      "id": "erp",
      "name": "사내 ERP API",
      "description": "인사·재무·구매 데이터 조회",
      "type": "api",
      "category": "사내 시스템",
      "permission": "read",
      "enabled": true
    }
  ]
}
```

## 10. 브리핑

### 10.1 오늘 브리핑

#### `GET /briefings/today` — ✅ MVP

Query:

| 이름 | 타입 | 설명 |
|---|---|---|
| `date` | `YYYY-MM-DD` | 생략 시 사용자 timezone의 오늘 |
| `blocks` | string | `personal,trending,popular` |

응답:

```json
{
  "data": {
    "id": "brf_20260824",
    "date": "2026-08-24",
    "title": "아침 브리핑",
    "subtitle": "오늘 업무와 조직의 주요 흐름을 확인하세요.",
    "blocks": [
      {
        "type": "personal",
        "title": "나에게 관련",
        "items": [
          {
            "topicId": "topic_1",
            "title": "계약 협상 관련 질의가 증가했습니다",
            "summary": "이번 주 14건 · 지난주 3건",
            "badge": "trending",
            "evidenceScope": "dept",
            "askable": true
          }
        ]
      }
    ],
    "generatedAt": "2026-08-24T00:00:00Z"
  }
}
```

### 10.2 브리핑 항목으로 바로 질문

#### `POST /briefings/items/:topicId/query` — ✅ MVP

Request:

```json
{ "text": "이 주제를 자세히 알려줘" }
```

응답은 `conversationId`를 반환하고 대화 화면으로 이동합니다. 다른 사용자의 답변 본문은 브리핑 API에 포함하지 않습니다.

### 10.3 브리핑 도움말

#### `GET /help/briefing` — ✅ MVP

브리핑의 `HelpPopover`에 표시할 설명·기준·용어를 반환합니다.

## 11. 설정·메모리·사용량

### 11.1 비서 설정

#### `GET /me/assistant-preferences` — ✅ MVP  
#### `PATCH /me/assistant-preferences` — ✅ MVP

Request:

```json
{
  "enabledAssistantIds": ["ast_meeting", "ast_translate"],
  "defaultAssistantId": "ast_meeting",
  "assistantOrder": ["ast_meeting", "ast_translate", "ast_code"]
}
```

### 11.2 알림 설정

#### `GET /me/notification-preferences` — ✅ MVP  
#### `PATCH /me/notification-preferences` — ✅ MVP

```json
{
  "badge": true,
  "conversationCompleted": true,
  "assistantUpdated": true,
  "weeklySummary": false,
  "security": true
}
```

### 11.3 사용량

#### `GET /me/usage` — ✅ MVP

Query `period=today|yesterday|week|month|cumulative`.

```json
{
  "data": {
    "period": "month",
    "queryCount": 4821,
    "tokenUsage": {
      "totalTokens": 1280000
    },
    "cost": {
      "provider": "chatgpt",
      "model": "chatgpt-standard",
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
    "series": [{ "date": "2026-08-23", "value": 198 }]
  }
}
```

### 11.4 메모리

#### `GET /me/memories` — ✅ MVP  
#### `POST /me/memories` — ✅ MVP  
#### `PATCH /me/memories/:memoryId` — ✅ MVP  
#### `DELETE /me/memories/:memoryId` — ✅ MVP  
#### `DELETE /me/memories` — ✅ MVP

Query `scope=all|assistant&assistantId=...`.

메모리 모델:

```json
{
  "id": "mem_123",
  "kind": "preference",
  "text": "답변은 항상 표로 정리해 준다",
  "scope": "all",
  "assistantId": null,
  "source": "conversation",
  "enabled": true,
  "createdAt": "2026-08-20T03:00:00Z",
  "updatedAt": "2026-08-20T03:00:00Z"
}
```

`kind`: `instruction | fact | preference`. 전체 삭제 응답은 `204 No Content`로 처리합니다.

## 12. 알림 센터

### 12.1 알림 목록

#### `GET /notifications` — ✅ MVP

Query `unreadOnly=true|false`, `page`, `pageSize`.

```json
{
  "data": [
    {
      "id": "noti_1",
      "kind": "alert",
      "title": "보안 알림",
      "body": "어제 외부 IP에서 로그인 시도가 감지되었습니다.",
      "read": false,
      "createdAt": "2026-08-23T08:12:00Z"
    }
  ],
  "meta": { "unreadCount": 2, "page": 1, "pageSize": 20, "total": 4 }
}
```

`kind`: `alert | info | success`.

### 12.2 읽음·삭제

#### `PATCH /notifications/:notificationId` — ✅ MVP

```json
{ "read": true }
```

#### `POST /notifications/read-all` — ✅ MVP  
#### `DELETE /notifications/:notificationId` — ✅ MVP

`read-all`은 현재 사용자에게 권한 있는 미읽음 알림만 읽음 처리합니다.

## 13. 매뉴얼·아이콘

### 13.1 매뉴얼 토픽

#### `GET /help/topics` — ✅ MVP

Query `q`, `category`, `page`, `pageSize`.

```json
{
  "data": [
    {
      "id": "builder",
      "title": "비서 만들기",
      "keywords": ["생성", "지침", "공개"],
      "answerMarkdown": "사이드바 하단 Store 아이콘..."
    }
  ]
}
```

### 13.2 자연어 매뉴얼 질문

#### `POST /help/query` — ✅ MVP

Request:

```json
{ "text": "메모리는 어떻게 관리하나요?" }
```

응답:

```json
{
  "data": {
    "answerMarkdown": "개인설정 → **메모리** 탭에서 관리합니다...",
    "matchedTopicId": "memory",
    "confidence": 0.98
  }
}
```

### 13.3 아이콘 목록

#### `GET /icons` — ✅ MVP

Query `q`, `category`, `page`, `pageSize`.

```json
{
  "data": [
    { "name": "BookOpen", "label": "책", "category": "파일", "keywords": ["책", "도서"], "supportsHan": true }
  ]
}
```

배경 색상 팔레트는 프론트 디자인 토큰으로 유지하거나, 향후 `GET /icons/colors`로 분리할 수 있습니다.

## 14. 관리자 API

관리자 화면에 접근할 때 서버에서 `admin` 권한을 검사합니다. 프론트의 선택 UI는 권한을 보여 주는 용도일 뿐 보안 경계가 아닙니다.

### 14.1 연결 가능한 MCP·API 목록

#### `GET /admin/connectors` — ◐ 2차

Query `type=mcp|api`, `status=active|disabled|pending`, `q`.

응답 필드:

```json
{
  "data": [
    {
      "id": "con_jira",
      "type": "mcp",
      "name": "Jira MCP",
      "description": "이슈 조회·생성·상태 변경",
      "category": "이슈 트래킹",
      "permission": "read_write",
      "status": "active"
    }
  ]
}
```

### 14.2 비서 승인 요청

#### `GET /admin/assistant-approval-requests` — ◐ 2차  
#### `GET /admin/assistant-approval-requests/:requestId` — ◐ 2차  
#### `PATCH /admin/assistant-approval-requests/:requestId` — ◐ 2차

Request:

```json
{
  "decision": "approved",
  "comment": "공개 범위와 연결 권한을 확인했습니다.",
  "visibility": "department"
}
```

`decision`: `approved | rejected | request_changes`.

### 14.3 데이터셋 관리

#### `GET /admin/datasets` — ◐ 2차  
#### `POST /admin/datasets` — ◐ 2차  
#### `PATCH /admin/datasets/:datasetId` — ◐ 2차

데이터셋은 `id`, `name`, `description`, `documentCount`, `embeddingModel`, `status`, `accessScope`를 가집니다.

## 15. 프론트 상태 매핑

| 현재 UI 상태 | 서버 데이터/API |
|---|---|
| `activeView` | 라우터 상태, 대화/비서 API의 응답으로 전환 |
| `sidebarOpen` | 로컬 UI 상태 |
| `assistantContext` | `POST /conversations`의 `assistantId`와 상세 응답 |
| `savedItems` | `GET /me/saved-answers` + save/delete mutations |
| `notifUnread` | `GET /notifications`의 `meta.unreadCount` |
| `favorites` | `GET /me/favorites` |
| `assistantOrder` | `GET /me/assistant-order` |
| `messages` | `GET /conversations/:id` + messages SSE |
| `queryKind` | `classification.completed` |
| `streaming` | `answer.started`~`answer.completed` |
| `answerDoneSet` | `message.completed` |
| `awaitingFollowUp` | 프론트 로컬 상태; 서버에는 새 messages 요청만 전송 |
| `feedbackModal` | 프론트 로컬 상태; 제출 시 feedback mutation |
| `savedPanelOpen`, `notifPanelOpen` | 프론트 로컬 상태 |
| `theme`, `fontSize`, `density` | `GET/PATCH /me/preferences` |
| `MemoryPanel.items` | `GET /me/memories` |

## 16. 핵심 상태 전이

### 16.1 메시지

```text
idle
  → POST messages
  → classifying
  → thinking/tool_running
  → streaming
  → completed
  → saved / feedback_submitted (선택)
```

실패:

```text
thinking 또는 streaming → failed → 재생성 가능
```

### 16.2 비서

```text
draft
  → POST /assistants
  → private
  → publish 요청
  → pending_review
  → approved 또는 rejected
  → official
```

### 16.3 파일

```text
selected → uploaded → indexing → ready
                         └→ failed
ready → deleted
```

## 17. 구현 우선순위

### Phase 1 — 화면을 실제 데이터로 연결

1. `GET /me`, `/home`, `/conversations`, `/assistants`
2. `POST /conversations`, messages SSE
3. 파일 업로드·상태 조회
4. 저장 답변·피드백·Markdown 내보내기
5. 알림 목록·읽음·삭제

### Phase 2 — 비서 제작과 개인화

1. 비서 CRUD·복제·상세·통계
2. 비서 초안 생성
3. 즐겨찾기·순서·개인 설정
4. 메모리 CRUD
5. 브리핑·매뉴얼·아이콘 검색

### Phase 3 — 운영 기능

1. 공개 범위와 승인 workflow
2. 공개 전 테스트 리뷰
3. MCP/API 연결 관리
4. 데이터셋·임베딩 운영
5. 사용량 제한·감사 로그

## 18. 구현 시 합의가 필요한 항목

1. 인증 방식: 현재 계약은 세션 쿠키 기준이며, 실제 인증 provider와 로그인 경로를 확정해야 합니다.
2. 스트리밍: SSE를 기본으로 정했으며, 프록시 타임아웃·재연결·Last-Event-ID 지원 여부를 확정해야 합니다.
3. RAG/TAG/ERP: `queryKind`와 표·차트 데이터의 최종 스키마, 실제 데이터 소유 시스템을 확정해야 합니다.
4. SQL 노출: 일반 사용자에게 SQL을 노출하지 않는 현재 권고를 확정해야 합니다.
5. 파일 정책: 최대 용량, 허용 확장자, 보존 기간, 악성 파일 검사 정책을 확정해야 합니다.
6. 저장 답변 중복: 같은 메시지를 여러 번 저장할 수 있는지 또는 upsert할지 확정해야 합니다.
7. 공개 범위: `designatedUserIds`와 부서·본부 식별자 모델을 확정해야 합니다.
8. 사용량: 토큰·질의·비용 중 어떤 값을 한도 기준으로 삼을지 확정해야 합니다.
9. 시간 기준: 모든 서버 시간은 UTC로 저장하고 사용자 timezone으로 표시하는 원칙을 확정해야 합니다.

## 19. 현재 구현과의 차이

| 항목 | 현재 UI | API 전환 후 |
|---|---|---|
| 비서·추천·통계 데이터 | 컴포넌트 상수 | `/assistants`, `/home` |
| 대화·질의 분류 | 브라우저 로직 | messages API + `classification.completed` |
| 답변 스트리밍 | 타이머 기반 모의 스트리밍 | SSE `answer.delta` |
| TAG 표·차트 | 브라우저 샘플 데이터 | `stats.completed` |
| Dual TAG 재조회 | 로컬 상태 | panel parameters/rerun API |
| 저장 목록 | 메모리 배열 | saved-answers API |
| 알림 | 컴포넌트 초기 배열 | notifications API |
| 메모리 | 설정 모달 로컬 배열 | memories API |
| 파일 임베딩 | 브라우저 타이머 | files API + 실제 작업 큐 |
| 사용자 | 하드코딩 표시명 | `/me` |
| 관리자 연결 목록 | 빌더 상수 | 권한 검증된 connector API |

## 20. OpenAPI 반영 계획

이 문서는 프론트·백엔드 계약 검토용 상세본입니다. 계약이 확정되면 `lib/api-spec/openapi.yaml`에 Phase 1 엔드포인트와 스키마를 먼저 반영하고 다음 명령으로 React Query와 Zod 타입을 생성합니다.

```bash
pnpm --filter @workspace/api-spec run codegen
```

OpenAPI에 반영하기 전까지 `lib/api-zod`와 `lib/api-client-react`의 generated 파일을 수동으로 수정하지 않습니다.# JPDC AI API 명세서

> 프론트엔드 연동용 API 계약서  
> 기준 화면: `artifacts/jpdc-ai`  
> 문서 버전: `0.1.0`  
> 작성 기준: 현재 UI의 컴포넌트·정적 데이터·사용자 액션

## 1. 문서 목적과 현재 상태

현재 `artifacts/api-server`에는 `/api/healthz`만 구현되어 있습니다. 이 문서는 실제 API 구현 전에 프론트와 백엔드가 합의해야 하는 전체 API 목록과 데이터 계약을 정의합니다.

- 아래 목록의 `✅ MVP`는 실제 서비스 1차 구현에 포함합니다.
- `◐ 2차`는 화면에는 있으나 운영 정책·외부 시스템 연동이 필요한 기능입니다.
- API가 아직 구현되지 않았으므로 예시 응답은 계약용 샘플입니다.
- 정적 데모 데이터의 날짜·수치·문구는 운영 API에서 내려주는 값으로 대체합니다.

## 2. 공통 규칙

### 2.1 Base URL과 헤더

| 항목 | 규칙 |
|---|---|
| 운영 Base URL | `/api/v1` |
| 헬스체크 | `/api/healthz` (버전 prefix 없음) |
| 요청 형식 | `application/json; charset=utf-8` |
| 파일 업로드 | `multipart/form-data` |
| 시간 | ISO 8601 UTC, 예: `2026-08-24T06:00:00Z` |
| 페이지 기본값 | `page=1`, `pageSize=20`, 최대 `100` |
| 정렬 | `sort=createdAt`, `order=asc\|desc` |
| 인증 | 서버 세션 쿠키, 프론트는 `credentials: include` 사용 |
| 요청 추적 | 서버가 `X-Request-Id` 응답 헤더를 제공 |

인증이 연결되지 않은 개발 환경에서는 보호된 API가 `401`을 반환하는 것이 정상입니다. 프론트에서 사용자 ID를 요청 body로 보내 인증을 우회하지 않습니다.

### 2.2 공통 성공 응답

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

### 2.3 공통 오류 응답

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

| HTTP | code | 프론트 처리 |
|---:|---|---|
| 400 | `BAD_REQUEST` | 요청 형식 오류 안내 |
| 401 | `UNAUTHENTICATED` | 로그인 화면 또는 세션 갱신 |
| 403 | `FORBIDDEN` | 권한 없음 안내 |
| 404 | `NOT_FOUND` | 대상 없음/목록 갱신 |
| 409 | `CONFLICT` | 최신 데이터 재조회 |
| 413 | `FILE_TOO_LARGE` | 파일 크기 안내 |
| 422 | `VALIDATION_ERROR` | 필드별 오류 표시 |
| 429 | `RATE_LIMITED` | 재시도 대기 |
| 500 | `INTERNAL_ERROR` | 일반 오류와 requestId 표시 |
| 502/504 | `UPSTREAM_ERROR` | AI·외부 시스템 일시 오류 표시 |

### 2.4 권한

| 역할 | 의미 |
|---|---|
| `user` | 본인 대화·저장·설정·메모리·즐겨찾기·비서 생성 |
| `assistant_owner` | 본인이 만든 비서의 수정·통계·테스트 요청 처리 |
| `reviewer` | 공개 전 테스트 평가·승인 검토 |
| `admin` | 공식 비서·데이터셋·MCP/API 승인 정책 관리 |

공개 범위(`visibility`)가 `private`인 리소스는 소유자만 조회할 수 있습니다.

## 3. 화면별 API 한눈에 보기

| 화면/컴포넌트 | API |
|---|---|
| 앱 초기화·사용자 | `GET /me`, `GET/PATCH /me/preferences` |
| 홈 | `GET /home`, `GET /assistants/shortcuts` |
| 사이드바·대화 이력 | `GET /conversations`, `GET /conversations/:conversationId` |
| 대화 입력 | `POST /conversations`, `POST /conversations/:conversationId/messages` |
| AI 스트리밍 | 위 messages API의 `text/event-stream` |
| 파일 첨부 | `POST /files`, `GET /files/:fileId`, `DELETE /files/:fileId` |
| 답변 액션바 | `POST /messages/:messageId/feedback`, `POST/DELETE /messages/:messageId/save`, `POST /messages/:messageId/regenerate`, `GET /conversations/:id/export` |
| 비서마켓 공식 탭 | `GET /assistants?scope=official`, `GET /assistants/:assistantId` |
| 내가 만든 비서 | `GET /assistants?scope=mine`, `POST/PATCH/DELETE /assistants` |
| 공개 전 테스트 | `GET /assistant-test-requests`, `POST /assistant-test-requests/:id/review` |
| 비서 통계·댓글 | `GET /assistants/:id/stats`, `GET /assistants/:id/comments` |
| 즐겨찾기·비서 순서 | `GET/PUT/DELETE /me/favorites/:assistantId`, `GET/PUT /me/assistant-order` |
| 비서 빌더 | `POST /assistant-drafts`, `POST/PATCH /assistants` |
| 관리자 MCP/API 승인 | `GET /admin/connectors`, `GET/PATCH /admin/assistant-approval-requests/:id` |
| 브리핑 | `GET /briefings/today`, `POST /briefings/items/:topicId/query` |
| 개인 설정 | `GET/PATCH /me/preferences`, `GET/PATCH /me/assistant-preferences`, `GET/PATCH /me/notification-preferences`, `GET /me/usage` |
| 메모리 | `GET/POST/PATCH/DELETE /me/memories` |
| 저장 목록 | `GET /me/saved-answers`, `DELETE /me/saved-answers/:savedAnswerId` |
| 알림 센터 | `GET /notifications`, `PATCH/DELETE /notifications/:notificationId`, `POST /notifications/read-all` |
| 매뉴얼·도움말 | `GET /help/topics`, `POST /help/query` |
| 아이콘 선택 | `GET /icons` |

## 4. 사용자·앱 초기화

### 4.1 현재 사용자 조회

#### `GET /me` — ✅ MVP

Sidebar의 이름/아바타, 설정 모달의 사용자 정보와 초기 권한을 채웁니다.

응답 `data`:

```json
{
  "id": "usr_123",
  "displayName": "김동현",
  "avatarUrl": null,
  "role": "user",
  "department": "디지털혁신팀",
  "permissions": {
    "canCreateAssistant": true,
    "canPublishAssistant": false,
    "canReviewAssistant": false,
    "canManageConnectors": false
  },
  "locale": "ko-KR",
  "timezone": "Asia/Seoul"
}
```

### 4.2 앱 홈 집계

#### `GET /home` — ✅ MVP

홈 화면에 필요한 데이터를 한 번에 로드할 때 사용합니다. 개별 API를 병렬 호출해도 됩니다.

Query:

| 이름 | 타입 | 설명 |
|---|---|---|
| `include` | string | `shortcuts,frequent,recent,stats` 중 comma-separated |

응답:

```json
{
  "data": {
    "stats": {
      "mostUsedAssistant": { "assistantId": "ast_meeting", "name": "회의록 문장정리", "count": 247 },
      "activeUsers": { "value": 183, "comparison": 12, "comparisonLabel": "전날 대비" },
      "dialogues": { "value": 1024, "comparison": 89, "comparisonLabel": "전날 대비" }
    },
    "shortcuts": [
      {
        "assistantId": "ast_writing",
        "name": "AI 글쓰기",
        "description": "블로그·기획서·이메일 등 다양한 글 작성",
        "icon": { "name": "PenTool", "background": "#F4F3FC", "color": "#4F46E5" },
        "starters": ["보도자료 초안을 작성해줘"]
      }
    ],
    "recent": [],
    "frequent": []
  }
}
```

### 4.3 개인 표시 설정

#### `GET /me/preferences` — ✅ MVP  
#### `PATCH /me/preferences` — ✅ MVP

Request `PATCH`:

```json
{
  "theme": "dark",
  "fontSize": "normal",
  "density": "standard",
  "locale": "ko-KR",
  "timezone": "Asia/Seoul"
}
```

`theme`: `light | dark`, `fontSize`: `small | normal | large`, `density`: `comfortable | standard | compact`.

## 5. 대화·질의·AI 응답 API

### 5.1 대화 목록

#### `GET /conversations` — ✅ MVP

Sidebar의 `오늘`, `어제`, `지난 7일` 그룹에 필요한 이력을 반환합니다.

Query:

| 이름 | 타입 | 설명 |
|---|---|---|
| `q` | string | 대화 제목/질의 검색 |
| `group` | `today\|yesterday\|last7days\|all` | 날짜 그룹 필터 |
| `page`, `pageSize` | number | 페이지 |

응답 항목:

```json
{
  "id": "cnv_123",
  "title": "공공기관 보안 지침 알려줘",
  "lastMessagePreview": "반출 제한 대상은 다음과 같습니다...",
  "queryKinds": ["instruction"],
  "badges": ["RAG"],
  "createdAt": "2026-08-24T01:10:00Z",
  "updatedAt": "2026-08-24T01:12:00Z",
  "messageCount": 4
}
```

#### `GET /conversations/:conversationId` — ✅ MVP

대화 화면 재진입 시 메시지와 첨부 파일을 불러옵니다.

응답:

```json
{
  "data": {
    "id": "cnv_123",
    "title": "공공기관 보안 지침 알려줘",
    "assistant": null,
    "messages": [],
    "createdAt": "2026-08-24T01:10:00Z",
    "updatedAt": "2026-08-24T01:12:00Z"
  }
}
```

### 5.2 대화 생성

#### `POST /conversations` — ✅ MVP

홈·마켓·사이드바에서 새 대화를 시작합니다.

Request:

```json
{
  "title": null,
  "assistantId": "ast_meeting",
  "initialQuery": "오늘 계약 검토 회의 내용을 정리해 줘",
  "source": "home"
}
```

`source`: `home | market | history | briefing | assistant`.

응답:

```json
{
  "data": {
    "id": "cnv_124",
    "assistantId": "ast_meeting",
    "status": "active",
    "createdAt": "2026-08-24T01:15:00Z"
  }
}
```

### 5.3 메시지 전송 및 스트리밍

#### `POST /conversations/:conversationId/messages` — ✅ MVP

기본 응답은 SSE입니다. 프론트는 `Accept: text/event-stream`을 보냅니다.

Request:

```json
{
  "text": "입고 처리가 안 된 작업지시가 있어?",
  "assistantId": null,
  "fileIds": ["fil_123"],
  "followUpOfMessageId": null,
  "clientMessageId": "client_01J..."
}
```

일반 JSON 응답이 필요한 경우 `Accept: application/json`으로 요청하면 스트림 완료 후 아래 형태를 반환합니다.

```json
{
  "data": {
    "userMessageId": "msg_user_1",
    "assistantMessageId": "msg_ai_1",
    "conversationId": "cnv_124",
    "queryKind": "rag-tag-assistant",
    "status": "completed"
  }
}
```

#### SSE 이벤트 계약

각 이벤트는 `event:`와 JSON `data:`를 함께 전송합니다.

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

event: recommendations.completed
data: {"candidates":[{"assistantId":"ast_data","name":"데이터 분석 비서","match":97}]}

event: answer.completed
data: {"panelId":"panel_rag_1"}

event: message.completed
data: {"messageId":"msg_ai_1","status":"completed"}
```

허용 이벤트:

| 이벤트 | 용도 |
|---|---|
| `message.started` | AI 메시지 초기화 |
| `classification.completed` | `QueryKind`와 분류 배지 |
| `answer.started` | 패널 생성 |
| `answer.delta` | 스트리밍 텍스트 |
| `sources.completed` | 참고 문서 |
| `stats.completed` | TAG 표·요약 수치·차트 |
| `interpretation.completed` | Dual TAG 해석 카드 |
| `recommendations.completed` | 추천 비서 |
| `tool.started` / `tool.completed` | MCP·API·RAG·TAG 도구 상태 |
| `answer.completed` | 패널별 스트리밍 완료 |
| `message.completed` | ActionBar 활성화 |
| `message.failed` | 오류 표시 |

### 5.4 질의 유형

`queryKind`는 현재 UI의 분류 상태와 동일한 문자열을 사용합니다.

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
```

백엔드는 분류된 최종 결과를 반환하며, 프론트는 문자열 검색으로 질의 유형을 재판정하지 않습니다.

복합 결과의 `panels` 예시:

```json
{
  "messageId": "msg_ai_1",
  "queryKind": "dual-tag",
  "panels": [
    {
      "id": "panel_1",
      "type": "interpretation",
      "label": "해석 1 — 제품별 합계",
      "description": "3월 제품 유형별 생산량 합계를 조회합니다",
      "parameters": [
        { "key": "월", "value": "3월", "editable": true },
        { "key": "연도", "value": "2026", "editable": true },
        { "key": "집계기준", "value": "제품별", "editable": true }
      ],
      "sql": "SELECT product_name, SUM(qty) AS total_qty ...",
      "columns": ["제품명", "생산량 (병)", "비율 (%)"],
      "rows": [["제주삼다수 2L", "1,842,000", "38.4%"]],
      "chart": { "type": "bar", "unit": "병", "data": [{ "label": "제주삼다수 2L", "value": 1842000 }] }
    }
  ]
}
```

`sql`은 관리자 권한 또는 디버그 환경에서만 반환합니다. 일반 사용자 응답에서는 `sql`을 생략하거나 마스킹합니다.

### 5.5 Dual TAG 해석 수정·재조회

#### `PATCH /messages/:messageId/panels/:panelId/parameters` — ✅ MVP

Request:

```json
{
  "parameters": [
    { "key": "월", "value": "4월" },
    { "key": "집계기준", "value": "라인별" }
  ]
}
```

#### `POST /messages/:messageId/panels/:panelId/rerun` — ✅ MVP

응답은 일반 메시지와 동일한 SSE 이벤트 스트림이며, `tool.started`, `stats.completed`, `answer.delta`, `message.completed`를 보냅니다.

### 5.6 이어서 질의

`이어서 질의` 버튼 자체는 별도 AI 호출을 하지 않습니다. 클릭 시 프론트가 입력창에 포커스를 주고 `followUpOfMessageId`를 포함해 일반 messages API를 호출합니다.

```json
{
  "text": "검수 대기 건만 자세히 알려줘",
  "followUpOfMessageId": "msg_ai_1",
  "assistantId": null,
  "fileIds": []
}
```

서버는 자동 후속 질의를 생성하거나 전송하지 않습니다.

### 5.7 메시지 재생성·내보내기

#### `POST /messages/:messageId/regenerate` — ✅ MVP

기존 질의를 같은 조건으로 다시 처리합니다. 응답은 SSE입니다.

#### `GET /conversations/:conversationId/export?format=md` — ✅ MVP

`text/markdown; charset=utf-8` 파일을 반환합니다. 질문, 답변, 생성일, 참고 문서를 포함합니다.

## 6. 파일 업로드·임베딩

### 6.1 파일 등록

#### `POST /files` — ✅ MVP

`multipart/form-data` 필드:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `file` | binary | O | 업로드 파일 |
| `purpose` | string | O | `conversation\|assistant_knowledge` |
| `conversationId` | string | 조건부 | conversation 용도일 때 |
| `assistantId` | string | 조건부 | knowledge 용도일 때 |

응답:

```json
{
  "data": {
    "id": "fil_123",
    "name": "계약서.pdf",
    "size": 245760,
    "mimeType": "application/pdf",
    "status": "indexing",
    "progress": 0,
    "createdAt": "2026-08-24T01:20:00Z"
  }
}
```

### 6.2 상태 조회

#### `GET /files/:fileId` — ✅ MVP

`status`: `uploaded | indexing | ready | failed | deleted`

```json
{
  "data": {
    "id": "fil_123",
    "status": "ready",
    "progress": 100,
    "embeddingModel": "bge-m3",
    "indexedChunks": 42,
    "error": null
  }
}
```

프론트의 현재 `1.2~2.2초` 인덱싱 애니메이션은 실제 API의 `progress`를 표시하는 로딩 상태로 교체합니다.

#### `DELETE /files/:fileId` — ✅ MVP

업로드 칩의 X와 빌더 지식 파일 삭제에 사용합니다.

## 7. 응답 액션·피드백·저장

### 7.1 피드백 제출

#### `POST /messages/:messageId/feedback` — ✅ MVP

Request:

```json
{
  "sentiment": "up",
  "rating": 4,
  "reasons": ["SOURCE", "RELEVANCE"],
  "comment": "출처가 명확하고 바로 업무에 사용할 수 있었습니다."
}
```

규칙:

- `sentiment=up`이면 `rating`은 `1..5` 양수이며 녹색 별만 활성화합니다.
- `sentiment=down`이면 `rating`은 `-1..-5` 음수이며 빨간 별만 활성화합니다.
- `rating=0`은 점수 미선택입니다.
- `reasons`는 `SOURCE`, `RELEVANCE`, `COMPLETENESS`, `RECENCY`, `DATA`, `FORMAT`, `ACTIONABILITY` 중 복수 선택입니다.

### 7.2 저장 답변

#### `POST /messages/:messageId/save` — ✅ MVP  
#### `DELETE /messages/:messageId/save` — ✅ MVP  
#### `GET /me/saved-answers` — ✅ MVP  
#### `DELETE /me/saved-answers/:savedAnswerId` — ✅ MVP

저장 응답:

```json
{
  "data": {
    "id": "sav_123",
    "messageId": "msg_ai_1",
    "query": "공공기관 보안 지침 알려줘",
    "answer": "반출 제한 대상은...",
    "savedAt": "2026-08-24T01:25:00Z"
  }
}
```

저장 패널은 최신 저장순으로 표시하며, 빈 목록은 `data: []`로 표현합니다.

## 8. 비서마켓

### 8.1 비서 목록

#### `GET /assistants` — ✅ MVP

Query:

| 이름 | 타입 | 설명 |
|---|---|---|
| `scope` | `official\|mine\|test\|all` | 탭 |
| `q` | string | 이름·기능·카테고리 검색 |
| `category` | string | `글쓰기`, `코드`, `번역`, `분석`, `법률·회계` 등 |
| `view` | `grid\|list` | 갤러리 표시 방식 |
| `status` | string | 상태 뱃지 필터 |
| `visibility` | string | 공개 범위 필터 |
| `page`, `pageSize`, `sort`, `order` | - | 공통 목록 옵션 |

비서 항목:

```json
{
  "id": "ast_meeting",
  "name": "회의록 문장정리",
  "description": "회의 내용을 체계적인 문서로 자동 정리",
  "icon": { "name": "PenTool", "background": "#F4F3FC", "color": "#4F46E5" },
  "category": "글쓰기",
  "author": { "id": "org_jpdc", "name": "JPDC" },
  "version": "v1.3",
  "status": "official",
  "visibility": "company",
  "isFavorite": false,
  "userCount": 12400,
  "dialogueCount": 12400,
  "messageCount": 41800,
  "isNew": false,
  "createdAt": "2026-01-10T00:00:00Z",
  "updatedAt": "2026-08-20T02:00:00Z"
}
```

상태: `draft | official | approved | updating | pending_review | rejected | pre_public_test`.

### 8.2 공식 비서 상세

#### `GET /assistants/:assistantId` — ✅ MVP

`fullDescription`, `conversationStarters`, `rating`, `ratingCount`, `ratingDistribution`, `likes`, `dislikes`, `comments`, `othersByAuthor`, `capabilities`를 포함합니다.

### 8.3 통계·댓글

#### `GET /assistants/:assistantId/stats` — ✅ MVP

Query `period=today|yesterday|week|month|all`.

```json
{
  "data": {
    "dialogueCount": 12400,
    "messageCount": 41800,
    "activeUsers": 183,
    "rating": 4.7,
    "ratingCount": 318,
    "likes": 284,
    "dislikes": 12,
    "timeseries": [{ "date": "2026-08-23", "count": 247 }]
  }
}
```

#### `GET /assistants/:assistantId/comments` — ✅ MVP

페이지네이션 목록으로 `author`, `text`, `createdAt`을 반환합니다.

### 8.4 내가 만든 비서 CRUD

#### `GET /assistants?scope=mine` — ✅ MVP  
#### `POST /assistants` — ✅ MVP  
#### `GET /assistants/:assistantId` — ✅ MVP  
#### `PATCH /assistants/:assistantId` — ✅ MVP  
#### `DELETE /assistants/:assistantId` — ✅ MVP

생성/수정 Request:

```json
{
  "name": "내부 보고서 요약",
  "description": "기안문·보고서 핵심 요약 및 키워드 추출",
  "category": "분석",
  "icon": { "name": "BookOpen", "background": "#F4F3FC", "color": "#4F46E5" },
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

### 8.5 비서 복제·공개·승인

#### `POST /assistants/:assistantId/clone` — ✅ MVP

Request:

```json
{ "name": "[복제] 회의록 문장정리", "visibility": "private" }
```

복제 응답에는 `highlightUntil`을 포함해 프론트가 2.8초 카드 강조를 표시할 수 있게 합니다.

#### `POST /assistants/:assistantId/publish` — ◐ 2차

공개 범위에 따라 승인 요청을 생성합니다.

#### `GET /assistant-test-requests` — ✅ MVP

내 비서로 들어온 공개 전 테스트 요청 목록입니다.

#### `POST /assistant-test-requests/:requestId/review` — ◐ 2차

Request:

```json
{
  "decision": "approved",
  "comment": "테스트 결과를 확인했습니다."
}
```

`decision`: `approved | rejected | request_changes`.

### 8.6 즐겨찾기·비서 순서

#### `GET /me/favorites` — ✅ MVP  
#### `PUT /me/favorites/:assistantId` — ✅ MVP  
#### `DELETE /me/favorites/:assistantId` — ✅ MVP  
#### `GET /me/assistant-order` — ✅ MVP  
#### `PUT /me/assistant-order` — ✅ MVP

순서 저장 Request:

```json
{ "assistantIds": ["ast_meeting", "ast_email", "ast_translate"] }
```

## 9. 비서 빌더·초안 생성

### 9.1 한 줄 요청으로 초안 생성

#### `POST /assistant-drafts` — ✅ MVP

Request:

```json
{
  "prompt": "우리 회사 매뉴얼을 참고해 답변해주는 비서",
  "locale": "ko-KR"
}
```

응답:

```json
{
  "data": {
    "draftId": "drf_123",
    "name": "매뉴얼 비서",
    "description": "회사 매뉴얼과 규정을 기반으로 정확한 답변을 제공하는 비서입니다.",
    "instructions": "당신은 회사 매뉴얼 기반 전문 비서입니다...",
    "prohibitions": ["문서에 없는 내용을 추측해 답하지 않습니다."],
    "conversationStarters": ["출장 신청 절차를 알려주세요."],
    "knowledgeFileIds": [],
    "firstMessage": "안녕하세요! 회사 매뉴얼과 규정에 관한 질문에 답변드리겠습니다.",
    "useFoundationModel": false
  }
}
```

현재 UI의 1.6초 생성 애니메이션은 해당 API의 진행 상태로 교체합니다. 대규모 모델 생성이 필요하면 동일 API를 SSE로 확장할 수 있습니다.

### 9.2 빌더 선택지

#### `GET /datasets` — ✅ MVP  
#### `GET /connectors/available` — ✅ MVP  
#### `GET /apis/available` — ✅ MVP

응답은 현재 빌더의 데이터셋, 관리자 승인 MCP 서버, 승인 API 목록과 동일한 필드를 사용합니다.

```json
{
  "data": [
    {
      "id": "erp",
      "name": "사내 ERP API",
      "description": "인사·재무·구매 데이터 조회",
      "type": "api",
      "category": "사내 시스템",
      "permission": "read",
      "enabled": true
    }
  ]
}
```

## 10. 브리핑

### 10.1 오늘 브리핑

#### `GET /briefings/today` — ✅ MVP

Query:

| 이름 | 타입 | 설명 |
|---|---|---|
| `date` | `YYYY-MM-DD` | 생략 시 사용자 timezone의 오늘 |
| `blocks` | string | `personal,trending,popular` |

응답:

```json
{
  "data": {
    "id": "brf_20260824",
    "date": "2026-08-24",
    "title": "아침 브리핑",
    "subtitle": "오늘 업무와 조직의 주요 흐름을 확인하세요.",
    "blocks": [
      {
        "type": "personal",
        "title": "나에게 관련",
        "items": [
          {
            "topicId": "topic_1",
            "title": "계약 협상 관련 질의가 증가했습니다",
            "summary": "이번 주 14건 · 지난주 3건",
            "badge": "trending",
            "evidenceScope": "dept",
            "askable": true
          }
        ]
      }
    ],
    "generatedAt": "2026-08-24T00:00:00Z"
  }
}
```

### 10.2 브리핑 항목으로 바로 질문

#### `POST /briefings/items/:topicId/query` — ✅ MVP

Request:

```json
{ "text": "이 주제를 자세히 알려줘" }
```

응답은 `conversationId`를 반환하고 대화 화면으로 이동합니다. 다른 사용자의 답변 본문은 브리핑 API에 포함하지 않습니다.

### 10.3 브리핑 도움말

#### `GET /help/briefing` — ✅ MVP

브리핑의 `HelpPopover`에 표시할 설명·기준·용어를 반환합니다.

## 11. 설정·메모리·사용량

### 11.1 비서 설정

#### `GET /me/assistant-preferences` — ✅ MVP  
#### `PATCH /me/assistant-preferences` — ✅ MVP

Request:

```json
{
  "enabledAssistantIds": ["ast_meeting", "ast_translate"],
  "defaultAssistantId": "ast_meeting",
  "assistantOrder": ["ast_meeting", "ast_translate", "ast_code"]
}
```

### 11.2 알림 설정

#### `GET /me/notification-preferences` — ✅ MVP  
#### `PATCH /me/notification-preferences` — ✅ MVP

```json
{
  "badge": true,
  "conversationCompleted": true,
  "assistantUpdated": true,
  "weeklySummary": false,
  "security": true
}
```

### 11.3 사용량

#### `GET /me/usage` — ✅ MVP

Query `period=today|yesterday|week|month|cumulative`.

```json
{
  "data": {
    "period": "month",
    "queryCount": 4821,
    "tokenUsage": {
      "totalTokens": 1280000
    },
    "cost": {
      "provider": "chatgpt",
      "model": "chatgpt-standard",
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
    "series": [{ "date": "2026-08-23", "value": 198 }]
  }
}
```

### 11.4 메모리

#### `GET /me/memories` — ✅ MVP  
#### `POST /me/memories` — ✅ MVP  
#### `PATCH /me/memories/:memoryId` — ✅ MVP  
#### `DELETE /me/memories/:memoryId` — ✅ MVP  
#### `DELETE /me/memories` — ✅ MVP

Query `scope=all|assistant&assistantId=...`.

메모리 모델:

```json
{
  "id": "mem_123",
  "kind": "preference",
  "text": "답변은 항상 표로 정리해 준다",
  "scope": "all",
  "assistantId": null,
  "source": "conversation",
  "enabled": true,
  "createdAt": "2026-08-20T03:00:00Z",
  "updatedAt": "2026-08-20T03:00:00Z"
}
```

`kind`: `instruction | fact | preference`. 전체 삭제 응답은 `204 No Content`로 처리합니다.

## 12. 알림 센터

### 12.1 알림 목록

#### `GET /notifications` — ✅ MVP

Query `unreadOnly=true|false`, `page`, `pageSize`.

```json
{
  "data": [
    {
      "id": "noti_1",
      "kind": "alert",
      "title": "보안 알림",
      "body": "어제 외부 IP에서 로그인 시도가 감지되었습니다.",
      "read": false,
      "createdAt": "2026-08-23T08:12:00Z"
    }
  ],
  "meta": { "unreadCount": 2, "page": 1, "pageSize": 20, "total": 4 }
}
```

`kind`: `alert | info | success`.

### 12.2 읽음·삭제

#### `PATCH /notifications/:notificationId` — ✅ MVP

```json
{ "read": true }
```

#### `POST /notifications/read-all` — ✅ MVP  
#### `DELETE /notifications/:notificationId` — ✅ MVP

`read-all`은 현재 사용자에게 권한 있는 미읽음 알림만 읽음 처리합니다.

## 13. 매뉴얼·아이콘

### 13.1 매뉴얼 토픽

#### `GET /help/topics` — ✅ MVP

Query `q`, `category`, `page`, `pageSize`.

```json
{
  "data": [
    {
      "id": "builder",
      "title": "비서 만들기",
      "keywords": ["생성", "지침", "공개"],
      "answerMarkdown": "사이드바 하단 Store 아이콘..."
    }
  ]
}
```

### 13.2 자연어 매뉴얼 질문

#### `POST /help/query` — ✅ MVP

Request:

```json
{ "text": "메모리는 어떻게 관리하나요?" }
```

응답:

```json
{
  "data": {
    "answerMarkdown": "개인설정 → **메모리** 탭에서 관리합니다...",
    "matchedTopicId": "memory",
    "confidence": 0.98
  }
}
```

### 13.3 아이콘 목록

#### `GET /icons` — ✅ MVP

Query `q`, `category`, `page`, `pageSize`.

```json
{
  "data": [
    { "name": "BookOpen", "label": "책", "category": "파일", "keywords": ["책", "도서"], "supportsHan": true }
  ]
}
```

배경 색상 팔레트는 프론트 디자인 토큰으로 유지하거나, 향후 `GET /icons/colors`로 분리할 수 있습니다.

## 14. 관리자 API

관리자 화면에 접근할 때 서버에서 `admin` 권한을 검사합니다. 프론트의 선택 UI는 권한을 보여 주는 용도일 뿐 보안 경계가 아닙니다.

### 14.1 연결 가능한 MCP·API 목록

#### `GET /admin/connectors` — ◐ 2차

Query `type=mcp|api`, `status=active|disabled|pending`, `q`.

응답 필드:

```json
{
  "data": [
    {
      "id": "con_jira",
      "type": "mcp",
      "name": "Jira MCP",
      "description": "이슈 조회·생성·상태 변경",
      "category": "이슈 트래킹",
      "permission": "read_write",
      "status": "active"
    }
  ]
}
```

### 14.2 비서 승인 요청

#### `GET /admin/assistant-approval-requests` — ◐ 2차  
#### `GET /admin/assistant-approval-requests/:requestId` — ◐ 2차  
#### `PATCH /admin/assistant-approval-requests/:requestId` — ◐ 2차

Request:

```json
{
  "decision": "approved",
  "comment": "공개 범위와 연결 권한을 확인했습니다.",
  "visibility": "department"
}
```

`decision`: `approved | rejected | request_changes`.

### 14.3 데이터셋 관리

#### `GET /admin/datasets` — ◐ 2차  
#### `POST /admin/datasets` — ◐ 2차  
#### `PATCH /admin/datasets/:datasetId` — ◐ 2차

데이터셋은 `id`, `name`, `description`, `documentCount`, `embeddingModel`, `status`, `accessScope`를 가집니다.

## 15. 프론트 상태 매핑

| 현재 UI 상태 | 서버 데이터/API |
|---|---|
| `activeView` | 라우터 상태, 대화/비서 API의 응답으로 전환 |
| `sidebarOpen` | 로컬 UI 상태 |
| `assistantContext` | `POST /conversations`의 `assistantId`와 상세 응답 |
| `savedItems` | `GET /me/saved-answers` + save/delete mutations |
| `notifUnread` | `GET /notifications`의 `meta.unreadCount` |
| `favorites` | `GET /me/favorites` |
| `assistantOrder` | `GET /me/assistant-order` |
| `messages` | `GET /conversations/:id` + messages SSE |
| `queryKind` | `classification.completed` |
| `streaming` | `answer.started`~`answer.completed` |
| `answerDoneSet` | `message.completed` |
| `awaitingFollowUp` | 프론트 로컬 상태; 서버에는 새 messages 요청만 전송 |
| `feedbackModal` | 프론트 로컬 상태; 제출 시 feedback mutation |
| `savedPanelOpen`, `notifPanelOpen` | 프론트 로컬 상태 |
| `theme`, `fontSize`, `density` | `GET/PATCH /me/preferences` |
| `MemoryPanel.items` | `GET /me/memories` |

## 16. 핵심 상태 전이

### 16.1 메시지

```text
idle
  → POST messages
  → classifying
  → thinking/tool_running
  → streaming
  → completed
  → saved / feedback_submitted (선택)
```

실패:

```text
thinking 또는 streaming → failed → 재생성 가능
```

### 16.2 비서

```text
draft
  → POST /assistants
  → private
  → publish 요청
  → pending_review
  → approved 또는 rejected
  → official
```

### 16.3 파일

```text
selected → uploaded → indexing → ready
                         └→ failed
ready → deleted
```

## 17. 구현 우선순위

### Phase 1 — 화면을 실제 데이터로 연결

1. `GET /me`, `/home`, `/conversations`, `/assistants`
2. `POST /conversations`, messages SSE
3. 파일 업로드·상태 조회
4. 저장 답변·피드백·Markdown 내보내기
5. 알림 목록·읽음·삭제

### Phase 2 — 비서 제작과 개인화

1. 비서 CRUD·복제·상세·통계
2. 비서 초안 생성
3. 즐겨찾기·순서·개인 설정
4. 메모리 CRUD
5. 브리핑·매뉴얼·아이콘 검색

### Phase 3 — 운영 기능

1. 공개 범위와 승인 workflow
2. 공개 전 테스트 리뷰
3. MCP/API 연결 관리
4. 데이터셋·임베딩 운영
5. 사용량 제한·감사 로그

## 18. 구현 시 합의가 필요한 항목

1. 인증 방식: 현재 계약은 세션 쿠키 기준이며, 실제 인증 provider와 로그인 경로를 확정해야 합니다.
2. 스트리밍: SSE를 기본으로 정했으며, 프록시 타임아웃·재연결·Last-Event-ID 지원 여부를 확정해야 합니다.
3. RAG/TAG/ERP: `queryKind`와 표·차트 데이터의 최종 스키마, 실제 데이터 소유 시스템을 확정해야 합니다.
4. SQL 노출: 일반 사용자에게 SQL을 노출하지 않는 현재 권고를 확정해야 합니다.
5. 파일 정책: 최대 용량, 허용 확장자, 보존 기간, 악성 파일 검사 정책을 확정해야 합니다.
6. 저장 답변 중복: 같은 메시지를 여러 번 저장할 수 있는지 또는 upsert할지 확정해야 합니다.
7. 공개 범위: `designatedUserIds`와 부서·본부 식별자 모델을 확정해야 합니다.
8. 사용량: 토큰·질의·비용 중 어떤 값을 한도 기준으로 삼을지 확정해야 합니다.
9. 시간 기준: 모든 서버 시간은 UTC로 저장하고 사용자 timezone으로 표시하는 원칙을 확정해야 합니다.

## 19. 현재 구현과의 차이

| 항목 | 현재 UI | API 전환 후 |
|---|---|---|
| 비서·추천·통계 데이터 | 컴포넌트 상수 | `/assistants`, `/home` |
| 대화·질의 분류 | 브라우저 로직 | messages API + `classification.completed` |
| 답변 스트리밍 | 타이머 기반 모의 스트리밍 | SSE `answer.delta` |
| TAG 표·차트 | 브라우저 샘플 데이터 | `stats.completed` |
| Dual TAG 재조회 | 로컬 상태 | panel parameters/rerun API |
| 저장 목록 | 메모리 배열 | saved-answers API |
| 알림 | 컴포넌트 초기 배열 | notifications API |
| 메모리 | 설정 모달 로컬 배열 | memories API |
| 파일 임베딩 | 브라우저 타이머 | files API + 실제 작업 큐 |
| 사용자 | 하드코딩 표시명 | `/me` |
| 관리자 연결 목록 | 빌더 상수 | 권한 검증된 connector API |

## 20. OpenAPI 반영 계획

이 문서는 프론트·백엔드 계약 검토용 상세본입니다. 계약이 확정되면 `lib/api-spec/openapi.yaml`에 Phase 1 엔드포인트와 스키마를 먼저 반영하고 다음 명령으로 React Query와 Zod 타입을 생성합니다.

```bash
pnpm --filter @workspace/api-spec run codegen
```

OpenAPI에 반영하기 전까지 `lib/api-zod`와 `lib/api-client-react`의 generated 파일을 수동으로 수정하지 않습니다.