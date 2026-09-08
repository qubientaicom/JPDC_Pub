# JPDC AI 비서마켓 재구축 프롬프트

> JPDC AI의 `비서마켓` 화면을 다른 프로젝트에서 동일한 정보 구조와 사용자 흐름으로 재구축하기 위한 독립 실행형 명세서입니다.  
> 이 문서는 현재 화면의 시각적 구성뿐 아니라 검색, 즐겨찾기, 상세 보기, 복제, 통계, 공개 전 테스트, 비서 생성·수정 연결까지 포함합니다.

---

## 1. 사용 방법

이 문서 전체를 코딩 에이전트에 전달하고 다음과 같이 요청합니다.

```text
아래 명세를 기준으로 비서마켓 화면을 구현해 주세요.

- 현재 프로젝트의 프레임워크와 디자인 시스템을 우선 사용합니다.
- 명세의 정보 구조, 상태 전이, 검색·필터·상세·복제 흐름을 빠짐없이 구현합니다.
- 예시 데이터는 데모 fixture로 시작해도 되지만 API로 교체하기 쉬운 구조로 분리합니다.
- 데스크톱, 태블릿, 모바일, 라이트모드, 다크모드를 모두 지원합니다.
- 현재 명세에서 “실제 구현 시 보완”으로 표시한 항목은 데모의 미완성 동작을 그대로 복제하지 말고 정상 동작하도록 구현합니다.
- 완료 후 명세의 테스트 체크리스트를 기준으로 검증합니다.
```

---

## 2. 구축 목표

사용자는 비서마켓에서 다음 작업을 수행할 수 있어야 합니다.

1. 전체 AI 비서를 검색하고 카테고리별로 탐색한다.
2. 추천, 최근 사용, 자주 사용하는 비서를 빠르게 확인한다.
3. 비서를 즐겨찾기에 추가하거나 해제한다.
4. 비서 상세 정보, 통계, 평점, 댓글, 대화 시작 문구를 확인한다.
5. 비서를 선택해 대화를 시작한다.
6. 기존 비서를 복제해 나만의 비서 초안을 만든다.
7. 내가 만든 비서를 검색하고 수정·복제·통계 확인·승인 요청한다.
8. 공개 전 테스트 요청 비서를 확인하고 테스트 대화를 시작한다.
9. 새로운 비서를 만들거나 임시저장된 비서 작성을 이어간다.

---

## 3. 화면 진입과 전체 레이아웃

### 3.1 진입

- 전역 헤더 또는 사이드바의 `비서마켓` 버튼으로 진입한다.
- 화면은 앱의 메인 콘텐츠 영역 전체를 사용한다.
- 데스크톱에서는 좌측 사이드바와 함께 표시한다.
- 모바일에서는 사이드바를 접고 상단 메뉴 버튼으로 다시 연다.

### 3.2 최상위 레이아웃

```text
┌──────────────────────────────────────────────────────────────┐
│ 상단 바: 메뉴/뒤로 | 비서마켓 | 브리핑 | 알림               │
├──────────────────────────────────────────────────────────────┤
│ 탭 바: 전체 비서 | 추천·통계 | 공개 전 테스트 | 내가 만든 비서 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ 선택한 탭의 스크롤 가능한 콘텐츠                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

- 최상위 컨테이너는 화면 높이를 채우는 세로 flex 구조로 만든다.
- 상단 바와 탭 바는 고정 영역으로 유지한다.
- 탭 본문만 내부 스크롤되게 한다.
- 긴 목록이 표시되어도 전체 브라우저 레이아웃이 깨지지 않아야 한다.

---

## 4. 상단 바

### 4.1 좌측

- 사이드바가 열려 있으면 `접기` 버튼을 표시한다.
- 사이드바가 닫혀 있으면 `메뉴 열기` 버튼을 표시한다.
- 상점 아이콘과 `비서마켓` 제목을 표시한다.

### 4.2 우측

- `브리핑` 버튼
- `알림` 버튼
- 읽지 않은 알림이 있으면 숫자 배지를 표시한다.
- 모바일에서는 공간이 부족할 경우 텍스트를 숨기고 아이콘과 배지만 유지할 수 있다.

### 4.3 접근성

- 아이콘 전용 버튼에는 `aria-label`을 제공한다.
- 키보드 포커스가 명확하게 보여야 한다.
- 알림 숫자는 스크린리더가 의미를 이해할 수 있도록 설명을 포함한다.

---

## 5. 상단 탭

탭은 다음 네 개로 구성한다.

| 내부 값 | 표시 이름 | 목적 |
|---|---|---|
| `gallery` | 전체 비서 | 모든 비서 검색·카테고리 탐색 |
| `official` | 추천·통계 | 사용 통계와 추천 큐레이션 |
| `test` | 공개 전 테스트 요청 비서 | 검토 또는 테스트가 필요한 비서 |
| `my` | 내가 만든 모든 비서 | 소유 비서 관리 |

### 탭 동작

- 기본 탭은 `추천·통계`로 설정한다.
- 선택 탭은 보라색 계열의 텍스트, 하단선 또는 배경으로 강조한다.
- 탭 전환 시 선택한 탭의 본문을 표시한다.
- 모바일에서 탭 바는 가로 스크롤을 허용한다.
- 탭 라벨을 줄바꿈하지 않는다.
- 탭 전환만으로 검색어나 작성 중인 비서가 의도치 않게 초기화되지 않도록 상태 보존 정책을 정한다.

---

## 6. 공통 비서 데이터 모델

Lucide 컴포넌트 자체를 저장하지 말고 직렬화 가능한 아이콘 이름을 저장합니다.

```ts
type AssistantCategory =
  | '글쓰기'
  | '코드'
  | '번역'
  | '분석'
  | '법률·회계';

type AssistantScope =
  | '비공개'
  | '지정자'
  | '부서'
  | '본부'
  | '전사';

type AssistantStatus =
  | '임시저장'
  | '공식'
  | '승인완료'
  | '버전 갱신중'
  | '승인 대기'
  | '승인불가'
  | '공개 전 테스트';

interface AssistantSummary {
  id: string;
  name: string;
  description: string;
  iconName: string;
  iconBackground: string;
  category: AssistantCategory;
  author: string;
  version: string;
  usageCount: number;
  userCount: number;
  isNew: boolean;
  isFavorite: boolean;
  status: AssistantStatus;
  scope: AssistantScope;
}

interface AssistantStats {
  ratingAverage: number;
  ratingCount: number;
  likes: number;
  dislikes: number;
  dialogueCount: number;
  messageCount: number;
  commentCount: number;
  ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

interface AssistantComment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

interface AssistantDetail extends AssistantSummary {
  longDescription: string;
  conversationStarters: string[];
  stats: AssistantStats;
  comments: AssistantComment[];
  relatedAssistantIds: string[];
  createdAt: string;
  updatedAt: string;
}
```

### 데이터 원칙

- 화면에서 이름을 식별자로 사용하지 않는다.
- 즐겨찾기, 상세 선택, 복제, 수정은 모두 `assistant.id`로 처리한다.
- 표시용 이용자 수와 메시지 수를 혼용하지 않는다.
- 통계 값이 없으면 `0`으로 표시하되 로딩 실패와 실제 0을 구분한다.
- 날짜는 ISO 8601로 보관하고 화면에서 로컬 형식으로 변환한다.

---

## 7. 전체 비서 탭

### 7.1 도구 영역

다음 요소를 한 줄 또는 반응형 두 줄로 배치한다.

- 검색 입력창
- 카테고리 필터 칩
- 결과 개수
- 그리드 보기 버튼
- 목록 보기 버튼

### 7.2 검색

- 비서 이름, 설명, 카테고리를 대상으로 검색한다.
- 입력 즉시 결과에 반영한다.
- 앞뒤 공백을 제거한다.
- 영문 검색은 대소문자를 구분하지 않는다.
- 검색어 지우기 버튼을 제공한다.
- 검색어와 카테고리를 동시에 적용한다.

```ts
const normalizedQuery = query.trim().toLocaleLowerCase();

const visibleAssistants = assistants.filter((assistant) => {
  const categoryMatches =
    selectedCategory === '전체' ||
    assistant.category === selectedCategory;

  const textMatches =
    normalizedQuery.length === 0 ||
    assistant.name.toLocaleLowerCase().includes(normalizedQuery) ||
    assistant.description.toLocaleLowerCase().includes(normalizedQuery) ||
    assistant.category.toLocaleLowerCase().includes(normalizedQuery);

  return categoryMatches && textMatches;
});
```

### 7.3 카테고리

카테고리는 다음 순서로 표시한다.

```ts
const categories = [
  '전체',
  '글쓰기',
  '코드',
  '번역',
  '분석',
  '법률·회계',
];
```

- 모바일에서는 가로 스크롤을 허용한다.
- 선택 카테고리는 보라색 배경 또는 테두리로 강조한다.
- 필터를 초기화하면 `전체`로 돌아간다.

### 7.4 보기 방식

#### 그리드

- 모바일: 2열
- 작은 태블릿: 3열
- 데스크톱: 4열
- 카드의 최소 너비를 보장한다.

#### 목록

- 아이콘, 이름, 설명, 카테고리, 이용량, 즐겨찾기를 한 행에 표시한다.
- 모바일에서는 설명을 두 줄까지만 표시하거나 메타 정보를 아래로 내린다.

### 7.5 빈 상태

검색 결과가 없으면 다음을 표시한다.

- 검색 아이콘 또는 비서 아이콘
- `조건에 맞는 비서가 없습니다`
- 검색어와 필터를 변경하라는 설명
- `필터 초기화` 버튼

---

## 8. 공통 비서 카드

### 8.1 표시 정보

- 배경색이 있는 비서 아이콘
- 비서 이름
- 짧은 설명
- 카테고리
- 이용자 수 또는 사용 횟수
- `NEW` 배지
- 즐겨찾기 버튼

### 8.2 동작

- 카드 클릭 시 상세 모달을 연다.
- `Enter`와 `Space` 키로도 상세 모달을 열 수 있어야 한다.
- 즐겨찾기 버튼 클릭은 카드 상세 열기를 발생시키지 않는다.
- 즐겨찾기 변경은 모든 탭과 상세 모달에 즉시 반영한다.

### 8.3 카드 상태

- 기본
- hover
- keyboard focus
- pressed
- favorite
- new
- disabled 또는 승인 대기

### 8.4 모바일

- hover에만 의존해 설명이나 즐겨찾기를 노출하지 않는다.
- 터치 화면에서도 핵심 액션이 항상 보이게 한다.

---

## 9. 추천·통계 탭

### 9.1 상단 검색

- 검색 입력창과 `검색` 버튼을 제공한다.
- `Enter` 키로 검색을 실행한다.
- 검색은 이름, 설명, 카테고리를 대상으로 한다.
- 검색 실행 후에는 추천 섹션 대신 검색 결과를 표시한다.
- 검색 결과 화면에는 검색어 지우기와 초기화 버튼을 제공한다.

### 9.2 어제의 이용 통계

세 개의 요약 지표를 표시한다.

```text
어제 비서 이용 횟수
어제 비서 이용자 수
어제 처리한 메시지 수
```

- 숫자는 천 단위 구분 기호를 적용한다.
- 데이터의 기준 날짜를 함께 표시한다.
- API 로딩 중에는 skeleton을 표시한다.
- 데모 fixture를 사용할 때는 데모 데이터임을 명시한다.

### 9.3 `이건 어때요!`

- 프로모션 성격의 추천 비서 3개를 강조 카드로 표시한다.
- 일반 카드보다 설명과 시각 요소를 크게 보여준다.
- 카드 클릭 시 상세 모달을 연다.

### 9.4 최근 사용한 비서

- 최근 사용 순으로 최대 4개를 표시한다.
- 최근 사용 기록이 없으면 빈 상태를 표시한다.
- 도움말 버튼을 누르면 최근 사용 기준을 설명하는 popover를 연다.

### 9.5 추천 비서

- 사용자 이용 이력, 즐겨찾기, 부서 또는 직무 정보를 기반으로 최대 4개를 표시한다.
- 데모에서는 정적 목록을 사용해도 된다.
- 도움말 popover에서 추천 기준을 안내한다.

### 9.6 자주 사용하는 비서

- 순위가 있는 목록으로 최대 5개를 표시한다.
- 순위, 아이콘, 이름, 사용량을 표시한다.
- 도움말 popover에서 집계 기간과 기준을 안내한다.

### 9.7 도움말 popover

- 동시에 하나만 열린다.
- 외부 클릭과 `Escape`로 닫힌다.
- 도움말 버튼과 popover를 `aria-describedby`로 연결한다.
- 화면 가장자리에서 잘리지 않도록 위치를 조정한다.

---

## 10. 비서 상세 모달

### 10.1 열기와 닫기

- 비서 카드를 선택하면 중앙 모달을 연다.
- 배경 overlay를 표시한다.
- overlay 클릭, 닫기 버튼, `Escape`로 닫는다.
- 모달이 열리면 body 스크롤을 잠근다.
- 닫을 때 이전 스크롤 상태를 복구한다.
- 모달은 `role="dialog"`와 `aria-modal="true"`를 사용한다.
- 최초 포커스를 닫기 버튼 또는 제목에 이동한다.
- 포커스를 모달 내부에 가두고 닫은 뒤 원래 카드로 복귀시킨다.

### 10.2 크기

- 데스크톱 최대 너비: 약 720~800px
- 최대 높이: viewport의 약 88%
- 본문은 내부 스크롤
- 모바일에서는 화면 가장자리에 12~16px 여백을 둔다.

### 10.3 상세 정보

다음 순서로 구성한다.

1. 아이콘
2. 카테고리
3. 비서 이름
4. 제작자
5. 상태·공개 범위·NEW 배지
6. 상세 설명
7. 핵심 통계
8. 대화 시작 문구
9. 평점 분포
10. 사용자 댓글
11. 같은 제작자의 다른 비서

### 10.4 통계

최소 다음 지표를 표시한다.

- 평균 평점
- 평가 수
- 좋아요
- 싫어요
- 대화 수
- 메시지 수
- 댓글 수

평점 분포는 5점부터 1점까지 막대로 표시한다.

### 10.5 대화 시작 문구

- 문구를 선택하면 해당 비서와 대화 화면으로 이동한다.
- 선택한 문구를 첫 사용자 메시지로 전달한다.
- 단순히 모달만 닫고 끝내면 안 된다.

```ts
onStartChat({
  assistantId: assistant.id,
  assistantName: assistant.name,
  initialPrompt: selectedStarter,
});
```

### 10.6 하단 고정 액션

- `대화 시작`
- `복제`
- `URL 복사`

#### 대화 시작 제한

- `승인 대기`, `버전 갱신중`, 접근 권한 없음 상태에서는 대화 시작을 비활성화한다.
- 비활성화 이유를 tooltip 또는 설명으로 제공한다.

#### URL 복사

- 현재 운영 도메인과 비서 ID로 URL을 생성한다.
- 특정 도메인을 하드코딩하지 않는다.
- 복사 성공·실패 피드백을 표시한다.

```ts
const assistantUrl = new URL(
  `/assistants/${assistant.id}`,
  window.location.origin,
).toString();
```

### 10.7 같은 제작자의 다른 비서

- 현재 비서를 제외한다.
- 선택하면 모달을 닫지 않고 상세 내용을 교체한다.
- 모달 스크롤 위치를 상단으로 이동한다.

---

## 11. 내가 만든 모든 비서 탭

### 11.1 상단 도구

- 검색 입력창
- `나만의 비서 만들기` 버튼
- 요약 통계

검색은 반드시 실제로 동작해야 한다.

- 이름
- 설명
- 상태
- 공개 범위

### 11.2 요약 통계

- 가장 많이 사용된 비서
- 총 이용자 수
- 총 대화 수
- 필요하면 총 메시지 수

각 필드는 의미가 다른 값을 사용해야 한다. 메시지 수를 이용자 수로 표시하지 않는다.

### 11.3 내 비서 카드

다음 정보를 표시한다.

- 아이콘
- 이름
- 제작자
- 설명
- 버전
- 상태
- 공개 범위
- 생성일 또는 수정일
- 댓글 수

### 11.4 상태별 기본 액션

| 상태 | 기본 액션 |
|---|---|
| `임시저장` | 이어서 작성 |
| `공개 전 테스트` | 채팅 시작 |
| `공식`, `승인완료` | 수정 |
| `승인 대기` | 상태 확인 |
| `승인불가` | 사유 확인 후 수정 |

### 11.5 보조 액션

- 수정
- 복제
- 통계
- URL 복사
- 승인 요청

버튼은 상태와 권한에 따라 조건부로 표시한다.

### 11.6 복제

복제 시 새 객체를 만들고 원본을 변경하지 않는다.

```ts
const clone: AssistantDetail = {
  ...source,
  id: crypto.randomUUID(),
  name: `[복제] ${source.name}`,
  version: '0.1',
  status: '임시저장',
  scope: '비공개',
  isNew: true,
  isFavorite: false,
  usageCount: 0,
  userCount: 0,
  stats: emptyStats,
  comments: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
```

- 복제본을 목록 상단에 추가한다.
- 새 복제본을 약 3초 동안 강조한다.
- 타이머는 배열 위치가 아니라 새 비서 ID를 기준으로 관리한다.
- 복제 후 `내가 만든 모든 비서` 탭으로 이동한다.

### 11.7 빈 상태

- 생성한 비서가 없다는 설명
- `첫 비서 만들기` 버튼
- 검색 결과가 없는 경우와 실제 목록이 비어 있는 경우를 구분한다.

---

## 12. 비서 통계 모달

### 표시 항목

- 평균 평점
- 좋아요
- 싫어요
- 대화 수
- 메시지 수
- 댓글 수

### 댓글 영역

- 댓글 보기·숨기기 토글
- 작성자, 내용, 작성 시간 표시
- 댓글이 없으면 빈 상태 표시

### 접근성

- 상세 모달과 동일한 dialog 규칙을 적용한다.
- 배경 클릭, 닫기 버튼, `Escape`를 지원한다.
- 모달끼리 겹쳐 열리지 않도록 한다.

---

## 13. 공개 전 테스트 요청 비서 탭

### 13.1 안내 배너

- 보라색 계열의 안내 배너를 상단에 표시한다.
- 공개 전 테스트의 목적과 평가 방법을 설명한다.
- 필요한 경우 검토 기한 또는 요청 부서를 표시한다.

### 13.2 테스트 카드

- 내 비서 카드와 동일한 기본 구조를 재사용한다.
- `공개 전 테스트` 상태 배지를 표시한다.
- `채팅 시작` 버튼을 제공한다.
- 테스트 대상이 없으면 빈 상태를 표시한다.

### 13.3 실제 구현 시 필수 동작

- `채팅 시작` 버튼은 실제 대화 화면으로 이동해야 한다.
- 대화 종료 후 평가 또는 테스트 의견을 제출할 수 있어야 한다.
- 테스트 권한이 없는 비서는 열 수 없도록 한다.

---

## 14. 비서 생성·수정 화면 연결

비서마켓에서 다음 경우 비서 빌더 화면으로 전환한다.

- `나만의 비서 만들기`
- `이어서 작성`
- `수정`
- 복제 후 편집

### 14.1 생성

- 빈 초안으로 시작한다.
- 자연어 설명으로 초안을 생성하는 단계와 상세 설정 단계를 제공할 수 있다.
- 이름과 지침 등 필수 값이 충족되어야 생성할 수 있다.
- 임시저장과 최종 생성을 구분한다.

### 14.2 수정

수정 진입 시 기존 설정 전체를 보존한다.

- 이름
- 설명
- 카테고리
- 아이콘 또는 사진
- 지침
- 금지사항
- 대화 시작 문구
- 첫 메시지
- 지식 파일
- MCP/API 연결
- 데이터셋
- 기반 모델 사용 여부
- 공개 범위

이름과 설명만 전달하고 나머지를 빈 값으로 초기화하면 안 된다.

### 14.3 저장 후

- 생성 성공 시 내 비서 목록에 추가한다.
- 수정 성공 시 같은 ID의 항목을 갱신한다.
- 임시저장 성공 시 `임시저장` 상태로 표시한다.
- 목록으로 돌아왔을 때 결과가 즉시 보여야 한다.
- 새로고침 후에도 유지되도록 API 또는 영구 저장소에 연결한다.

---

## 15. 상태 설계

```ts
type MarketTab = 'gallery' | 'official' | 'test' | 'my';
type AssistantViewMode = 'grid' | 'list';

interface MarketUiState {
  activeTab: MarketTab;
  galleryQuery: string;
  galleryCategory: '전체' | AssistantCategory;
  galleryViewMode: AssistantViewMode;
  recommendationQuery: string;
  selectedAssistantId: string | null;
  statsAssistantId: string | null;
  builderMode: 'create' | 'edit' | null;
  editingAssistantId: string | null;
  highlightedAssistantId: string | null;
}
```

### 상태 소유권

- 탭, 검색, 모달 상태는 비서마켓 화면이 관리한다.
- 즐겨찾기는 앱 전역 또는 서버 상태로 관리한다.
- 알림, 브리핑, 사이드바 상태는 앱 shell이 관리한다.
- 비서 목록은 API 캐시 또는 별도의 repository 계층에서 관리한다.
- 비서 이름 배열이 아니라 ID 집합으로 즐겨찾기를 저장한다.

---

## 16. 권장 컴포넌트 구조

```text
assistant-market/
├── AssistantMarketView.tsx
├── AssistantMarketHeader.tsx
├── AssistantMarketTabs.tsx
├── tabs/
│   ├── AssistantGalleryTab.tsx
│   ├── AssistantRecommendationsTab.tsx
│   ├── AssistantTestRequestsTab.tsx
│   └── MyAssistantsTab.tsx
├── cards/
│   ├── AssistantCard.tsx
│   ├── AssistantListRow.tsx
│   ├── FeaturedAssistantCard.tsx
│   └── OwnedAssistantCard.tsx
├── modals/
│   ├── AssistantDetailDialog.tsx
│   └── AssistantStatsDialog.tsx
├── filters/
│   ├── AssistantSearch.tsx
│   ├── CategoryFilter.tsx
│   └── ViewModeToggle.tsx
├── states/
│   ├── AssistantGridSkeleton.tsx
│   ├── AssistantEmptyState.tsx
│   └── AssistantErrorState.tsx
├── data/
│   ├── assistantFixtures.ts
│   └── assistantTypes.ts
└── hooks/
    ├── useAssistants.ts
    ├── useFavoriteAssistant.ts
    └── useAssistantClone.ts
```

한 파일에 모든 fixture, 카드, 탭, 모달, 상태 로직을 넣지 않습니다.

---

## 17. API 전환 기준

데모 단계에서는 fixture를 사용할 수 있지만 아래 인터페이스를 분리합니다.

```ts
interface AssistantMarketRepository {
  list(params: {
    scope: 'all' | 'official' | 'mine' | 'test';
    query?: string;
    category?: string;
  }): Promise<AssistantSummary[]>;

  getDetail(id: string): Promise<AssistantDetail>;
  getRecommendations(): Promise<AssistantSummary[]>;
  getUsageSummary(): Promise<UsageSummary>;
  create(input: AssistantDraft): Promise<AssistantDetail>;
  update(id: string, input: AssistantDraft): Promise<AssistantDetail>;
  clone(id: string): Promise<AssistantDetail>;
  favorite(id: string): Promise<void>;
  unfavorite(id: string): Promise<void>;
  requestApproval(id: string): Promise<void>;
}
```

### 권장 엔드포인트

```text
GET    /api/v1/assistants
GET    /api/v1/assistants/:assistantId
GET    /api/v1/assistants/recommendations
GET    /api/v1/assistants/usage-summary
GET    /api/v1/assistant-test-requests
POST   /api/v1/assistants
PATCH  /api/v1/assistants/:assistantId
POST   /api/v1/assistants/:assistantId/clone
GET    /api/v1/assistants/:assistantId/stats
POST   /api/v1/assistants/:assistantId/approval-requests
PUT    /api/v1/me/favorites/:assistantId
DELETE /api/v1/me/favorites/:assistantId
```

---

## 18. 로딩·오류·빈 상태

모든 주요 목록은 세 상태를 구분합니다.

### 로딩

- 카드 크기와 유사한 skeleton을 표시한다.
- 탭 전체를 빈 화면으로 만들지 않는다.

### 오류

- 오류 메시지
- 재시도 버튼
- 가능한 경우 마지막 성공 데이터를 유지한다.

### 빈 상태

- 실제 데이터가 없음
- 검색 결과 없음
- 권한이 없음

세 경우에 서로 다른 문구와 액션을 제공한다.

---

## 19. 다크모드

### 기본 원칙

- 전역 `.dark` 클래스 또는 디자인 토큰을 사용한다.
- 컴포넌트마다 흰색과 검은색을 하드코딩하지 않는다.
- overlay, modal, card, input, chip, tooltip, skeleton의 다크모드를 모두 정의한다.

### 권장 토큰

```css
:root {
  --market-bg: #ffffff;
  --market-surface: #ffffff;
  --market-surface-muted: #f7f7fb;
  --market-border: #e7e7ee;
  --market-text: #1f1f29;
  --market-text-muted: #747482;
  --market-primary: #5b4bea;
  --market-primary-soft: #f1efff;
}

.dark {
  --market-bg: #15151c;
  --market-surface: #1d1d26;
  --market-surface-muted: #252530;
  --market-border: #353543;
  --market-text: #f4f4f7;
  --market-text-muted: #aaaab7;
  --market-primary: #8b7cff;
  --market-primary-soft: #2b2848;
}
```

### 확인 항목

- 모달 내부에 밝은 흰색 영역이 남지 않는다.
- gradient 위 텍스트 대비를 확인한다.
- disabled 버튼이 활성 버튼처럼 보이지 않는다.
- 상태 배지 색상이 다크모드에서도 구분된다.

---

## 20. 반응형 기준

### 모바일

- 폭 320px 이상 지원
- 상단 탭과 카테고리는 가로 스크롤
- 전체 비서 그리드는 2열
- 상세 모달은 화면 폭 대부분 사용
- 하단 액션 버튼은 고정하거나 세로 배치
- 아이콘 전용 버튼의 터치 영역은 최소 44×44px

### 태블릿

- 그리드 3열
- 내 비서 목록은 1~2열
- 상세 모달은 중앙 정렬

### 데스크톱

- 그리드 4열
- 내 비서 목록은 2열
- 추천 섹션은 넓은 가로 레이아웃 활용
- 콘텐츠 최대 너비를 설정해 지나치게 늘어나지 않도록 한다.

---

## 21. 접근성

- 모든 카드형 버튼에 키보드 조작을 지원한다.
- 가능하면 클릭 가능한 `div` 대신 실제 `button` 또는 링크를 사용한다.
- 모달은 focus trap과 focus restore를 지원한다.
- 아이콘 전용 버튼에 `aria-label`을 제공한다.
- 검색 입력창에 보이는 label 또는 `aria-label`을 제공한다.
- 선택 탭은 `aria-selected`를 사용한다.
- 탭 구조는 `role="tablist"`, `role="tab"`, `role="tabpanel"`을 적용한다.
- 색상만으로 상태를 구분하지 않는다.
- 애니메이션은 `prefers-reduced-motion`을 존중한다.
- 텍스트와 배경은 WCAG AA 대비를 목표로 한다.

---

## 22. 현재 데모를 그대로 복제하면 안 되는 부분

다른 프로젝트에서 구현할 때 다음 항목은 반드시 보완합니다.

1. `내가 만든 비서` 검색 입력을 실제 필터와 연결한다.
2. `공개 전 테스트`의 채팅 시작 버튼을 실제 대화 화면과 연결한다.
3. URL 복사와 승인 요청 버튼에 성공·실패 처리를 구현한다.
4. 운영 URL을 하드코딩하지 않는다.
5. 상세 모달의 대화 시작 문구가 실제 첫 질문으로 전달되게 한다.
6. 비서 수정 시 이름과 설명 외의 모든 기존 설정을 보존한다.
7. 생성, 수정, 임시저장을 실제 상태 또는 API에 반영한다.
8. 이용자 수와 메시지 수를 서로 다른 필드로 관리한다.
9. 복제 강조 타이머를 배열 위치가 아니라 비서 ID로 추적한다.
10. Lucide 아이콘 컴포넌트 대신 직렬화 가능한 아이콘 이름을 저장한다.
11. 모달에 dialog semantics, focus trap, focus restore를 적용한다.
12. hover에만 표시되는 핵심 액션을 모바일에서 항상 노출한다.
13. 추천·통계의 하드코딩 값을 API 또는 명시된 데모 fixture로 분리한다.
14. 동일 비서의 버전을 고정값으로 표시하지 않고 실제 데이터를 사용한다.

---

## 23. 이벤트 계약

```ts
type MarketEvent =
  | { type: 'tab_changed'; tab: MarketTab }
  | { type: 'assistant_searched'; query: string; category?: string }
  | { type: 'assistant_opened'; assistantId: string; source: string }
  | { type: 'assistant_favorited'; assistantId: string }
  | { type: 'assistant_unfavorited'; assistantId: string }
  | { type: 'assistant_chat_started'; assistantId: string; starter?: string }
  | { type: 'assistant_cloned'; sourceAssistantId: string; cloneId: string }
  | { type: 'assistant_builder_opened'; mode: 'create' | 'edit'; assistantId?: string }
  | { type: 'assistant_stats_opened'; assistantId: string }
  | { type: 'assistant_url_copied'; assistantId: string }
  | { type: 'assistant_approval_requested'; assistantId: string };
```

이벤트를 분석 도구에 전송하지 않더라도 UI 컴포넌트의 콜백 계약으로 활용할 수 있습니다.

---

## 24. 구현 순서

### 1단계: 기반

1. 데이터 타입과 fixture 작성
2. 최상위 레이아웃과 탭 구현
3. 공통 카드 구현

### 2단계: 탐색

1. 전체 비서 검색
2. 카테고리 필터
3. 그리드·목록 전환
4. 빈 상태

### 3단계: 추천

1. 이용 통계
2. 프로모션 추천
3. 최근 사용
4. 추천 비서
5. 자주 사용하는 비서
6. 도움말 popover

### 4단계: 상세

1. 상세 모달
2. 평점과 댓글
3. 대화 시작
4. 즐겨찾기
5. URL 복사
6. 같은 제작자 비서 전환

### 5단계: 관리

1. 내 비서 목록
2. 상태별 액션
3. 복제
4. 통계 모달
5. 공개 전 테스트

### 6단계: 생성·수정 연결

1. 비서 빌더 연결
2. 초안 전달
3. 생성·수정·임시저장
4. 목록 갱신

### 7단계: 품질

1. 모바일
2. 다크모드
3. 키보드 접근성
4. 로딩·오류 상태
5. API 연결

---

## 25. 테스트 체크리스트

### 전체 비서

- [ ] 검색어 입력 시 이름, 설명, 카테고리 기준으로 필터링된다.
- [ ] 검색어와 카테고리 필터가 동시에 적용된다.
- [ ] 그리드와 목록 보기를 전환할 수 있다.
- [ ] 필터 초기화가 정상 동작한다.
- [ ] 결과가 없을 때 빈 상태가 표시된다.

### 추천·통계

- [ ] 검색 버튼과 Enter 키가 모두 동작한다.
- [ ] 통계의 지표명이 실제 데이터 필드와 일치한다.
- [ ] 추천 카드에서 상세 모달을 열 수 있다.
- [ ] 도움말 popover가 외부 클릭과 Escape로 닫힌다.

### 카드와 상세

- [ ] 카드 클릭과 키보드 조작으로 상세를 연다.
- [ ] 즐겨찾기 버튼이 상세 열기를 발생시키지 않는다.
- [ ] 즐겨찾기 상태가 모든 화면에 즉시 반영된다.
- [ ] 상세 모달이 overlay, 닫기 버튼, Escape로 닫힌다.
- [ ] 모달 포커스가 올바르게 이동하고 복구된다.
- [ ] 대화 시작 문구가 첫 질문으로 전달된다.
- [ ] URL이 현재 도메인을 기준으로 복사된다.

### 내 비서

- [ ] 검색이 실제 목록을 필터링한다.
- [ ] 임시저장 비서는 이어서 작성할 수 있다.
- [ ] 수정 진입 시 기존 설정 전체가 보존된다.
- [ ] 복제본은 새 ID를 사용한다.
- [ ] 복제본은 비공개·임시저장 상태로 생성된다.
- [ ] 복제 강조 효과가 다른 항목에 잘못 적용되지 않는다.
- [ ] 통계 모달의 숫자와 댓글이 정상 표시된다.

### 공개 전 테스트

- [ ] 테스트 요청 목록을 볼 수 있다.
- [ ] 채팅 시작 버튼이 실제 대화 화면으로 이동한다.
- [ ] 권한 없는 사용자는 테스트 비서에 접근할 수 없다.

### 저장과 API

- [ ] 생성 결과가 목록에 추가된다.
- [ ] 수정 결과가 기존 항목에 반영된다.
- [ ] 새로고침 후에도 변경 내용이 유지된다.
- [ ] 로딩, 오류, 빈 상태가 구분된다.

### 반응형·다크모드

- [ ] 320px 폭에서 가로 레이아웃이 깨지지 않는다.
- [ ] 탭과 카테고리를 모바일에서 스크롤할 수 있다.
- [ ] 라이트·다크모드에서 카드와 모달의 대비가 충분하다.
- [ ] 터치 화면에서도 핵심 액션이 항상 보인다.

---

## 26. 완료 기준

다음 조건을 모두 만족하면 비서마켓 재구축이 완료된 것으로 판단합니다.

1. 네 개 탭이 모두 구현되어 있다.
2. 전체 비서 검색, 카테고리 필터, 보기 전환이 실제로 동작한다.
3. 추천·통계의 모든 섹션이 데이터 기반으로 표시된다.
4. 비서 카드에서 상세, 즐겨찾기, 대화 시작으로 이동할 수 있다.
5. 상세 모달에서 평점, 댓글, 대화 시작 문구, 복제, URL 복사가 동작한다.
6. 내가 만든 비서를 검색하고 수정·복제·통계 확인할 수 있다.
7. 공개 전 테스트 비서로 실제 테스트 대화를 시작할 수 있다.
8. 비서 생성·수정 결과가 목록에 반영되고 새로고침 후 유지된다.
9. 모바일, 데스크톱, 라이트모드, 다크모드에서 레이아웃이 안정적이다.
10. 키보드만으로 탭, 카드, 모달, 주요 액션을 사용할 수 있다.
11. 로딩·오류·빈 상태가 모두 준비되어 있다.
12. 현재 데모의 미완성 동작을 그대로 복제하지 않고 정상 기능으로 보완했다.

---

## 27. 현재 프로젝트 참고 위치

현재 JPDC AI 구현을 참고해야 할 경우 다음 파일을 확인합니다.

```text
artifacts/jpdc-ai/src/views/MarketView.tsx
artifacts/jpdc-ai/src/components/AssistantInfoModal.tsx
artifacts/jpdc-ai/src/views/AssistantBuilderView.tsx
artifacts/jpdc-ai/src/components/IconPickerModal.tsx
artifacts/jpdc-ai/src/data/materialIcons.ts
artifacts/jpdc-ai/src/App.tsx
artifacts/jpdc-ai/src/context/ThemeContext.tsx
artifacts/jpdc-ai/src/index.css
artifacts/jpdc-ai/package.json
artifacts/api-server/API_SPEC.md
REBUILD-MATERIAL-ICON-PICKER.md
```

### 역할

- `MarketView.tsx`: 탭, 검색, 추천, 전체 비서, 내 비서, 테스트 요청, 복제, 통계 상태
- `AssistantInfoModal.tsx`: 비서 상세, 평점, 댓글, 대화 시작, URL 복사
- `AssistantBuilderView.tsx`: 비서 생성·수정 폼과 공개 범위
- `IconPickerModal.tsx`: 비서 아이콘 선택
- `materialIcons.ts`: 아이콘 카탈로그와 한글 검색
- `App.tsx`: 사이드바, 알림, 브리핑, 즐겨찾기, 대화 화면 전환
- `ThemeContext.tsx`, `index.css`: 라이트·다크모드와 전역 디자인 토큰
- `API_SPEC.md`: 비서 목록, 상세, 통계, 테스트, 승인, 즐겨찾기 API 계약
