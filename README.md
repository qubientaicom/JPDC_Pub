# JPDC AI

제주개발공사(JPDC)를 위한 AI 업무 지원 웹앱입니다. 여러 AI 비서와 대화하고, 답변을 RAG/TAG 관점으로 확인하며, 사용량·비용·저장목록·알림·개인 설정을 한 곳에서 관리할 수 있도록 구성했습니다.

## 최근 업데이트

### 2026-09-05

- 비서마켓 화면을 다른 프로젝트에서 동일하게 구현할 수 있도록 [`REBUILD-ASSISTANT-MARKET.md`](REBUILD-ASSISTANT-MARKET.md) 재구축 명세 추가
- 전체 비서, 추천·통계, 공개 전 테스트, 내가 만든 비서의 네 가지 탭과 검색·필터·상세·즐겨찾기·복제·통계 흐름 문서화
- 비서 생성·수정 화면 연결, 데이터 모델, 권장 API, 반응형·다크모드·접근성 및 테스트 완료 기준 정리
- 현재 데모의 미완성 동작을 다른 프로젝트에서 정상 기능으로 보완할 수 있도록 필수 개선 항목 명시

### 2026-09-04

- 공개 주소의 루트(`/`)에서 JPDC AI가 바로 열리도록 아티팩트 배포 경로를 `/jpdc-ai/`에서 `/`로 변경
- 배포 경로가 변경되어도 온보딩 이미지가 정상 표시되도록 정적 자산 경로를 Vite의 `BASE_URL` 기준으로 개선

### 2026-09-02

- 비서 생성 화면의 Material Icons 선택 기능을 다른 프로젝트에서 재구축할 수 있도록 [`REBUILD-MATERIAL-ICON-PICKER.md`](REBUILD-MATERIAL-ICON-PICKER.md) 명세 추가
- 영문·한글 검색, 카테고리, 색상 팔레트, `han:` 특수 아이콘, 사진 업로드와의 상호 배제 규칙 문서화

### 2026-09-01

- JPDC AI의 전체 화면, 기능, 데이터 모델, API 연결 및 재구축 순서를 정리한 [`REBUILD.md`](REBUILD.md) 추가
- 다른 프로젝트에서도 현재 UI와 사용자 흐름을 단계적으로 재현할 수 있도록 구현 순서와 검증 기준 문서화

### 2026-08-27

- 입고 관련 질문에 바로 답변하지 않고 `지침 확인` 또는 `ERP 데이터 확인` 중 원하는 방식을 선택하는 흐름 추가
- 사용자가 선택한 방향에 따라 내부 지침 답변 또는 ERP 기반 현황 화면으로 전환하도록 대화 분기 개선
- 입고 질문 분류 시 띄어쓰기 차이를 무시하도록 질의 정규화 개선
- 사이드바 대화 이력에 `지침·ERP 선택` 유형과 예시 질문 추가

### 2026-08-25

- 현재 화면과 사용자 이벤트를 기준으로 프론트엔드·백엔드 연동 계약서 [`artifacts/api-server/API_SPEC.md`](artifacts/api-server/API_SPEC.md) 작성
- 대화, 파일 첨부, AI 스트리밍, 피드백, 저장목록, 비서마켓, 개인 설정, 메모리, 관리자 승인 및 사용량 API 계약 정의
- 사용량 화면에서 토큰 유형별 구분 대신 `Total Tokens`를 표시하고 비용을 `Estimated Cost · 예상 비용`으로 안내하도록 정책 정리
- ChatGPT와 Claude의 예상 비용 계산에 공통 환율 `1,400원`을 적용하고 데모 데이터 기반임을 명시

## 주요 변경사항

### 대화 및 AI 응답

- RAG/TAG 분할 답변 영역 제공
- 분할 답변 내부 차트 및 시각화 지원
- 답변 방향별 좋아요·싫어요 피드백과 별점 제한
- 분할 답변에서 바로 이어서 질의하는 흐름 지원
- 자동 후속 질의 제거
- 관련·추천 AI 비서 표시
- 대화 화면 내부 스크롤 및 읽기 쉬운 응답 레이아웃 개선

### 탐색 및 업무 화면

- 홈, 대화, 비서마켓 내부 스크롤 개선
- 브리핑 및 주요 지표 화면 구성
- 질의 이력 조회
- 도움말 화면 구성
- 저장목록 삭제 및 빈 상태 화면
- 알림센터 삭제 및 빈 상태 화면

### 개인 설정

- 개인 설정 모달과 탭 기반 설정 화면
- 개인 메모리 조회·수정·범위 변경·삭제
- 비서 순서 관리
- 표시·알림 설정 화면
- 사용량 기간별 조회 및 서비스별 탭
- 사용량 모달의 불필요한 `취소`·`저장` 버튼 제거

### 사용량 및 비용 표시

- ChatGPT·Claude 모델 선택 드롭다운 제거
- 서비스별 기본 모델명 고정 표시
- `Input Tokens`, `Cached Input Tokens`, `Output Tokens` 구분 제거
- `Total Tokens`만 표시
- 비용은 `Estimated Cost · 예상 비용`으로 표시
- ChatGPT와 Claude 모두 공통 환율 `1,400원` 적용
- 토큰 유형별 실측값이 없는 데모 환경이므로 전체 토큰과 평균 단가를 기반으로 예상 비용 계산

## 실행 방법

### 사전 요구사항

- Node.js 24
- pnpm

의존성을 설치합니다.

```bash
pnpm install
```

### JPDC AI 웹앱 실행

```bash
pnpm --filter @workspace/jpdc-ai run dev
```

### API 서버 실행

별도 터미널에서 실행합니다.

```bash
pnpm --filter @workspace/api-server run dev
```

API 서버는 개발 환경에서 포트 5000을 사용합니다.

### 품질 검사 및 빌드

```bash
# 전체 타입 검사
pnpm run typecheck

# 전체 타입 검사 및 패키지 빌드
pnpm run build
```

> 현재 타입 검사는 기존 컴포넌트의 타입 이슈가 남아 있을 수 있습니다. 웹앱 개발 서버의 HMR과 브라우저 콘솔에서 변경된 UI 흐름을 함께 확인하는 것을 권장합니다.

## 프로젝트 구조

```text
artifacts/
├── jpdc-ai/          # JPDC AI 웹 프론트엔드
├── api-server/       # Express API 서버
└── mockup-sandbox/   # UI 컴포넌트 미리보기 서버

lib/
├── api-client-react/ # API 클라이언트
├── api-spec/         # OpenAPI 원본
├── api-zod/          # API 검증 스키마
└── db/               # Drizzle/PostgreSQL 데이터 계층

attached_assets/      # 브랜드 이미지·폰트 및 참고 에셋
```

## API 문서

프론트엔드와 백엔드 연동을 위한 계약서는 다음 파일에 있습니다.

- [`artifacts/api-server/API_SPEC.md`](artifacts/api-server/API_SPEC.md)

현재 API 서버에 실제로 연결된 라우트는 `/api/healthz`이며, 나머지 API는 화면과 백엔드가 합의할 수 있도록 작성된 계약용 명세입니다. 사용량 응답은 다음 정책을 기준으로 합니다.

- 토큰 필드: `totalTokens`
- 환율: `exchangeRateKrw: 1400`
- 비용 필드: `estimatedCostUsd`, `estimatedCostKrw`
- 비용 상태: `estimated: true`
- 산정 방식: `total_tokens_average_rate`

## 기술 스택

- pnpm workspace
- React 19 + TypeScript
- Vite
- Tailwind CSS
- Radix UI
- Lucide React
- Recharts
- Express 5
- Drizzle ORM + PostgreSQL
- Zod 및 Orval 기반 API 계약·검증

## 개발 참고사항

- 현재 화면의 사용량 수치와 비용은 데모 데이터 기반입니다.
- 운영 환경에서는 정적 데모 데이터를 실제 API 응답으로 교체해야 합니다.
- 인증이 연결되지 않은 개발 환경에서 보호된 API가 `401`을 반환하는 것은 정상입니다.
- API 요청에는 세션 쿠키를 사용하며, 프론트엔드는 `credentials: include` 방식으로 연동합니다.