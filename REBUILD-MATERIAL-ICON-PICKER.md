# 나만의 비서 — Material Icons 선택 UI 재구축 명세서

> JPDC AI의 `나만의 비서 만들기` 화면에서 사용하는 Material Icons 선택 영역을 다른 프로젝트에서 동일한 동작과 형태로 구현하기 위한 명세서입니다.  
> 문서 기준일: **2026-09-02**  
> 대상 기능: 비서 아이콘 선택, 카테고리 탐색, 영문·한글 검색, 배경 색상 선택, 사진 업로드 탭과의 전환

---

## 1. 기능 목적

비서 생성·수정 폼의 기본 정보 영역에서 사용자가 비서 아바타를 직접 설정합니다.

지원 방식:

1. 로컬 Material Icons 카탈로그에서 아이콘 선택
2. 아이콘 카테고리별 탐색
3. Material Icons 영문 이름 검색
4. 한국어 키워드 검색
5. 아이콘 배경 색상 선택
6. 사진 파일 업로드
7. 현재 선택 아이콘의 실시간 미리보기
8. 선택한 아이콘 또는 업로드한 사진 제거

Material Icons 선택과 사진 업로드는 서로 대체 관계입니다.

```text
Material 아이콘 선택
  → presetThumb 저장
  → logoUrl 제거

사진 업로드
  → logoUrl 저장
  → presetThumb 제거
```

---

## 2. 비서 생성 화면에서의 위치

### 2.1 진입 화면

화면 제목:

- 새로 만들 때: `나만의 비서 만들기`
- 수정할 때: `비서 수정`

기본 정보 섹션의 중앙에 원형 아바타를 배치합니다.

```text
기본 정보

              ┌────────┐
              │  아이콘 │  ← 원형 아바타 미리보기
              └────────┘

       [ 아이콘 선택 | 사진 업로드 ]

       [ Material 아이콘 선택…       ▦ ]

이름       [ 비서 이름 (최대 20자) ]
설명       [ 한 문장 설명 (최대 80자) ]
```

### 2.2 기본 정보 영역 라벨

- `기본 정보`
- `아이콘 선택`
- `사진 업로드`
- 초기 상태 placeholder: `Material 아이콘 선택…`
- 이름 placeholder: `비서 이름 (최대 20자)`
- 설명 placeholder: `한 문장 설명 (최대 80자)`

### 2.3 아바타 기본 상태

선택된 아이콘과 업로드 사진이 모두 없으면 비서 이름 첫 글자를 표시합니다.

- 이름이 있으면 첫 글자를 대문자로 표시
- 이름도 없으면 빈 원형 아바타
- 배경 기본값: `#F4F3FC`
- 아바타 크기: `96px × 96px`
- 원형: `border-radius: 9999px`
- 기본 테두리: `2px dashed #C7C3F7`

선택된 아이콘 또는 사진이 있으면 우측 상단에 제거 버튼을 표시합니다.

- 버튼 크기: 약 `20px × 20px`
- 위치: 아바타 우측 상단 바깥쪽
- 배경: `#DC2626`
- 아이콘: 흰색 X
- 동작: `logoUrl`과 `presetThumb`를 모두 `null`로 초기화

---

## 3. 비서 생성 폼의 아이콘 탭

### 3.1 탭 UI

두 개의 pill 버튼을 사용합니다.

```text
[ 아이콘 선택 ] [ 사진 업로드 ]
```

상태:

```ts
type IconTab = 'bank' | 'upload';
const [iconTab, setIconTab] = useState<IconTab>('bank');
```

초기 탭은 `bank`입니다.

### 3.2 탭 스타일

탭 전체:

- 배경: `#F7F6FD`
- 테두리: `1px solid #E4E2F0`
- 내부 padding: `2px`
- 둥근 모서리: pill

활성 탭:

- 배경: `#FAFAFE`
- 텍스트: `#4F46E5`
- 낮은 그림자

비활성 탭:

- 텍스트: `#A8A6C0`
- hover 시 `#6B6882`

### 3.3 Material 아이콘 진입 버튼

아이콘 선택 탭에서 다음 버튼을 보여 줍니다.

선택 전:

```text
▦  Material 아이콘 선택…  ▦
```

선택 후:

```text
[아이콘]  book  ▦
```

스타일:

- 가로 flex
- `px-4 py-2`
- `rounded-xl`
- 테두리 `#E4E2F0`
- 배경 흰색
- hover 테두리 `#4F46E5`
- hover 배경 `#F7F6FD`
- shadow-sm

동작:

- 클릭하면 Material Icons 선택 모달을 연다.
- 선택된 아이콘 이름은 `_`를 공백으로 바꾸어 표시한다.
- 오른쪽 `grid_view` 아이콘은 모달 진입 affordance로 사용한다.

### 3.4 사진 업로드 탭

버튼 라벨:

```text
사진 업로드
```

허용 형식:

```text
image/png
image/jpeg
image/webp
```

업로드 시:

1. 선택한 파일에서 object URL 생성
2. `logoUrl`에 저장
3. `presetThumb`를 `null`로 설정
4. 파일 input value를 비워 동일 파일 재선택을 허용

---

## 4. Material Icons 모달 레이아웃

### 4.1 모달 기본 구조

```text
┌────────────────────────────────────────────┐
│ 아이콘 선택                         [닫기] │
│ Google Material Icons · N개                │
│                                            │
│ [ 🔍 책, 도서, 설정, 사람… 또는 ... ]       │
│                                            │
│ [전체] [액션] [알림] [미디어] [커뮤니케이션]  │ ← 가로 스크롤
│                                            │
│ 배경 색상 — 클릭하면 아이콘 전체에 즉시 적용됩니다 │
│ ● ● ● ● ● ● ● ● ● ●   [미리보기]          │
│                                            │
│ ─────────────────────────────────────────  │
│                                            │
│       [아이콘] [아이콘] [아이콘] ...        │
│       [아이콘] [아이콘] [아이콘] ...        │ ← 스크롤
│                                            │
│ N개 표시                         [취소] [색상 적용] │
└────────────────────────────────────────────┘
```

### 4.2 데스크톱과 모바일

데스크톱:

- 폭: `560px`
- 높이: viewport의 `88dvh`
- 최대 높이: `88dvh`
- 화면 중앙 정렬
- `rounded-2xl`

모바일:

- 폭: `100%`
- 화면 하단에서 올라오는 bottom sheet
- 위쪽 모서리만 둥글게
- 높이: `88dvh`

공통:

- `position: fixed`
- z-index: `200`
- 배경 overlay: 검정 40% 투명도
- overlay blur: 약 `2px`
- overlay 또는 모달 외부 클릭 시 닫기
- 모달 내부 클릭은 전파 중지

### 4.3 열림·닫힘 상태

```ts
type IconPickerModalProps = {
  open: boolean;
  current: SelectedIcon | null;
  onSelect: (icon: SelectedIcon) => void;
  onClose: () => void;
};
```

`open`이 `false`이면 모달 DOM을 렌더링하지 않습니다.

모달이 열릴 때:

1. 검색어를 빈 문자열로 초기화
2. 현재 아이콘이 있으면 현재 배경 색상과 일치하는 팔레트를 선택
3. 일치하는 색상이 없으면 첫 번째 색상을 사용
4. 약 80ms 뒤 검색창에 focus

카테고리 선택 상태는 기존 선택값을 유지할 수 있습니다. 검색어는 열 때마다 초기화합니다.

---

## 5. 모달 헤더

### 5.1 제목

```text
아이콘 선택
```

### 5.2 설명

```text
Google Material Icons · N개
```

`N`은 하드코딩하지 않고 고유 아이콘 목록의 실제 개수로 계산합니다.

### 5.3 닫기 버튼

- 원형 또는 둥근 버튼
- 크기: 약 `32px`
- 배경: `#F4F3FC`
- hover 배경: `#E9E7FA`
- 아이콘: Lucide `X`
- 클릭 시 `onClose()`

---

## 6. 검색 UI와 검색 규칙

### 6.1 검색창

placeholder:

```text
책, 도서, 설정, 사람… 또는 book, person, home…
```

스타일:

- 좌측 검색 아이콘
- 둥근 모서리
- 배경: `#F7F6FD`
- 테두리: `#E4E2F0`
- focus 시 테두리: `#4F46E5`
- 입력 텍스트: `14px`
- clear 버튼은 검색어가 있을 때만 표시

### 6.2 카테고리 필터와 검색의 관계

검색은 현재 선택된 카테고리의 아이콘 안에서만 수행합니다.

```ts
const base =
  activeCategory === 'all'
    ? ALL_ICONS
    : ICON_CATEGORIES.find(c => c.id === activeCategory)?.icons ?? [];
```

검색어가 비어 있으면 `base` 전체를 표시합니다.

### 6.3 영문 검색

영문 또는 비한글 검색어는 다음과 같이 처리합니다.

1. trim
2. 소문자 변환
3. 공백을 underscore로 변환
4. 아이콘 이름에 검색어가 포함되는지 비교

```ts
const normalized = query.trim().toLowerCase().replace(/\s+/g, '_');
const result = base.filter(name => name.includes(normalized));
```

예시:

| 입력 | 매칭 예 |
|---|---|
| `book` | `book`, `menu_book`, `library_books` |
| `person` | `person`, `person_add`, `person_outline` |
| `arrow right` | `arrow_right`, `arrow_right_alt` |
| `home` | `home`, `home_work` 등 |

### 6.4 한글 검색

한글 검색은 영문 아이콘 이름을 직접 비교하지 않고 키워드 매핑을 사용합니다.

예시:

```ts
const KOREAN_ICON_MAP = {
  홈: ['home', 'house', 'apartment', 'dashboard'],
  사람: ['person', 'account_circle', 'account_box', 'face'],
  검색: ['search', 'find_in_page', 'find_replace', 'manage_search', 'pageview'],
  문서: ['description', 'article', 'subject', 'text_snippet', 'assignment'],
  설정: ['settings', 'settings_applications', 'tune', 'build', 'manage_accounts'],
  분석: ['assessment', 'analytics', 'bar_chart', 'pie_chart', 'show_chart'],
  사진: ['photo', 'image', 'photo_library', 'collections', 'camera_alt'],
  번역: ['translate', 'language', 'g_translate', 'interpreter_mode'],
};
```

매핑은 부분 일치를 지원합니다.

```ts
if (keyword.includes(query) || query.includes(keyword)) {
  // 해당 키워드의 seed 아이콘 추가
}
```

각 seed 아이콘에 대해:

1. seed 자체를 결과에 추가
2. 전체 아이콘 목록에서 seed 문자열을 포함하는 아이콘도 추가
3. Set으로 중복 제거
4. 현재 카테고리의 `base` 목록으로 최종 필터링

```ts
function searchByKorean(query: string): Set<string> {
  const q = query.trim();
  if (!q) return new Set();

  const result = new Set<string>();
  for (const [keyword, icons] of Object.entries(KOREAN_ICON_MAP)) {
    if (keyword.includes(q) || q.includes(keyword)) {
      icons.forEach(seed => {
        result.add(seed);
        ALL_ICONS.forEach(icon => {
          if (icon.includes(seed)) result.add(icon);
        });
      });
    }
  }
  return result;
}
```

### 6.5 검색 결과 없음

검색 결과가 없으면 아이콘 grid 대신 중앙 empty state를 표시합니다.

- 아이콘: Material `search_off`
- 텍스트: `"{검색어}" 검색 결과 없음`
- 세로 여백: 약 `48px`

---

## 7. 카테고리 탭

카테고리 탭은 가로로 넘칠 수 있으므로 horizontal scroll을 사용합니다. 스크롤바는 숨깁니다.

표시 순서:

1. `전체 (N)`
2. `액션`
3. `알림`
4. `미디어`
5. `커뮤니케이션`
6. `콘텐츠`
7. `기기`
8. `에디터`
9. `파일`
10. `하드웨어`
11. `이미지`
12. `지도`
13. `내비게이션`
14. `알림판`
15. `장소`
16. `소셜`
17. `토글`
18. `가나다`

카테고리 데이터 형식:

```ts
type IconCategory = {
  id: string;
  label: string;
  icons: string[];
};
```

특수 카테고리:

- `id: 'all'`
- `label: 전체 (N)`
- 실제 배열은 모든 카테고리의 아이콘을 flatMap하고 Set으로 중복 제거한 `ALL_ICONS`

탭 스타일:

활성:

- 배경: `#4F46E5`
- 글자: 흰색
- shadow-sm

비활성:

- 배경: `#F4F3FC`
- 글자: `#6B6882`
- hover 배경: `#E9E7FA`

---

## 8. 배경 색상 팔레트

### 8.1 색상 데이터

색상은 배경과 아이콘 전경색을 한 쌍으로 저장합니다.

```ts
type IconColor = {
  bg: string;
  color: string;
  label: string;
};
```

정확한 팔레트:

| 라벨 | 배경 `bg` | 아이콘 `color` |
|---|---|---|
| 파랑 | `#EEF5FF` | `#3B5BDB` |
| 초록 | `#F0FDF4` | `#2F9E44` |
| 보라 | `#F5F3FF` | `#6741D9` |
| 주황 | `#FFF7ED` | `#E8590C` |
| 분홍 | `#FDF2F8` | `#C2255C` |
| 노랑 | `#FFFBEB` | `#E67700` |
| 청록 | `#F0FDFA` | `#0C8599` |
| 빨강 | `#FFF1F2` | `#C92A2A` |
| 회색 | `#F1F5F9` | `#475569` |
| 다크 | `#1A1826` | `#FFFFFF` |

첫 번째 색상 `파랑`을 기본값으로 사용합니다.

### 8.2 팔레트 UI

설명:

```text
배경 색상 — 클릭하면 아이콘 전체에 즉시 적용됩니다
```

동작:

- 색상 원형 swatch를 클릭하면 `pickedColor`가 변경된다.
- 선택된 swatch는 보라색 ring과 ring offset을 가진다.
- 선택 시 약간 확대된다.
- 각 swatch의 `title`은 색상 라벨이다.
- 다크 색상은 내부에 흰색 점을 표시해 색상을 인지하게 한다.

크기:

- swatch: `28px × 28px`
- 간격: 약 `6px`
- 작은 화면에서는 wrap

### 8.3 적용 타이밍

색상은 두 가지 방식으로 적용됩니다.

#### 아이콘을 새로 선택하는 경우

사용자가 grid에서 아이콘을 클릭하면 현재 `pickedColor`와 함께 부모에 즉시 전달합니다.

```ts
onSelect({
  name,
  bg: pickedColor.bg,
  color: pickedColor.color,
});
```

#### 이미 선택한 아이콘의 색상만 바꾸는 경우

현재 아이콘이 있을 때 색상만 바꿔도 모달 미리보기는 즉시 바뀝니다. 부모 상태에 최종 적용하려면 footer의 `색상 적용` 버튼을 사용합니다.

```ts
onSelect({
  name: current.name,
  bg: pickedColor.bg,
  color: pickedColor.color,
});
```

현재 아이콘이 없으면 `색상 적용` 버튼을 숨깁니다.

---

## 9. 실시간 미리보기

색상 팔레트 오른쪽에 미리보기 카드를 배치합니다.

구성:

- 작은 아이콘 박스: `36px × 36px`
- 선택한 `pickedColor.bg`
- 아이콘 색상: `pickedColor.color`
- 색상 라벨
- `미리보기`

표시 아이콘:

- 현재 선택 아이콘이 없으면 `smart_toy`
- 현재 아이콘이 Material Icons면 `<span class="material-icons">`
- 한글 특수 아이콘이면 일반 Material font 대신 한글 문자를 텍스트로 표시

```ts
function isHanIcon(name: string) {
  return name.startsWith('han:');
}

function getHanChar(name: string) {
  return name.slice(4);
}
```

예:

```text
han:가 → 가
han:나 → 나
```

미리보기 크기:

- Material icon: 약 `22px`
- 한글 아이콘: 약 `22px`, bold

---

## 10. 아이콘 grid

### 10.1 레이아웃

- 세로로 스크롤되는 영역
- 좌우 padding: 약 `16px`
- 위아래 padding: 약 `12px`
- grid gap: 약 `6px`
- 모바일: 6열
- `sm` 이상: 8열
- 각 셀: 정사각형
- 각 셀: `aspect-ratio: 1 / 1`
- 둥근 모서리: `rounded-xl`

```css
.icon-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 6px;
}

@media (min-width: 640px) {
  .icon-grid {
    grid-template-columns: repeat(8, minmax(0, 1fr));
  }
}
```

### 10.2 아이콘 셀

각 아이콘 셀의 배경은 현재 선택한 `pickedColor.bg`를 사용합니다.

Material icon:

- 클래스: `material-icons`
- 크기: 약 `23px`
- 색상: `pickedColor.color`

한글 아이콘:

- `han:` prefix 제거 후 문자 출력
- 크기: 약 `26px`
- bold
- 색상: `pickedColor.color`

### 10.3 선택 상태

현재 선택된 아이콘은 `current?.name === name`으로 비교합니다.

선택 상태:

- 보라색 `2px` ring
- ring offset `1px`
- 약간 확대 `scale(1.05)`

일반 hover:

- 약간 확대
- `1px` 보라색 ring
- ring offset `1px`

### 10.4 아이콘 이름 tooltip

hover 중인 셀에만 아이콘 이름을 표시합니다.

- `_`는 공백으로 변경
- 배경: `#1A1826`
- 글자: 흰색
- 글자 크기: `10px`
- 아이콘 셀 아래쪽에 absolute 배치
- `pointer-events: none`
- z-index를 grid보다 높게 설정

예:

```text
account_balance_wallet → account balance wallet
```

모바일에서는 hover가 없으므로 title attribute만으로 대체할 수 있습니다.

---

## 11. Footer

### 11.1 표시 개수

왼쪽에 현재 필터 결과 수를 표시합니다.

```text
N개 표시
```

`displayedIcons.length.toLocaleString()`을 사용합니다.

### 11.2 버튼

오른쪽 버튼:

- `취소`
- `색상 적용` — 현재 아이콘이 있을 때만 표시

`취소`:

- 변경된 선택을 부모에 적용하지 않고 모달을 닫는 정책으로 구현할 수 있다.
- 현재 구현과 완전히 같게 유지하려면, 이미 grid 아이콘을 클릭한 선택은 즉시 부모에 전달되므로 `취소`는 모달 닫기만 수행한다는 점을 명시해야 한다.

`색상 적용`:

- 현재 아이콘 이름은 유지
- 현재 선택 색상만 부모에 전달
- 모달 닫힘

Footer:

- 위쪽 테두리
- 연한 회색 배경 `#FAFAFA`
- 좌우 padding 약 `20px`
- 세로 padding 약 `12px`

---

## 12. 선택 결과 데이터 계약

아이콘 선택 결과는 다음 세 필드만으로 충분합니다.

```ts
type SelectedIcon = {
  name: string;
  bg: string;
  color: string;
};
```

예시:

```json
{
  "name": "menu_book",
  "bg": "#F5F3FF",
  "color": "#6741D9"
}
```

한글 특수 아이콘:

```json
{
  "name": "han:가",
  "bg": "#EEF5FF",
  "color": "#3B5BDB"
}
```

비서 저장 모델에 포함할 때:

```ts
type AssistantIcon = {
  name: string;
  background: string;
  color: string;
};
```

API 요청 예:

```json
{
  "icon": {
    "name": "menu_book",
    "background": "#F5F3FF",
    "color": "#6741D9"
  }
}
```

---

## 13. Material Icons 로딩

Material Icons font를 앱 진입점에서 한 번 로드합니다.

현재 방식:

```ts
import 'material-icons/iconfont/material-icons.css';
```

렌더링:

```tsx
<span className="material-icons">menu_book</span>
```

주의:

- `name`을 SVG path로 해석하지 않는다.
- Material Icons font 이름을 그대로 텍스트 노드로 전달한다.
- `han:가`처럼 실제 Material Icons에 없는 값은 font로 렌더링하지 않는다.
- `han:` 값은 반드시 별도의 텍스트 분기로 처리한다.
- Material Icons CSS가 로드되지 않으면 아이콘 이름이 글자로 보이므로 앱 초기화 단계에서 로드 여부를 확인한다.

---

## 14. 아이콘 카탈로그 데이터

아이콘 카탈로그는 서버 검색에 의존하지 않고 로컬 정적 데이터로 유지합니다. 다른 프로젝트로 옮길 때는 다음 원칙을 지킵니다.

### 14.1 카테고리 배열

```ts
export const ICON_CATEGORIES: IconCategory[] = [
  { id: 'action', label: '액션', icons: [...] },
  { id: 'alert', label: '알림', icons: [...] },
  { id: 'av', label: '미디어', icons: [...] },
  { id: 'communication', label: '커뮤니케이션', icons: [...] },
  { id: 'content', label: '콘텐츠', icons: [...] },
  { id: 'device', label: '기기', icons: [...] },
  { id: 'editor', label: '에디터', icons: [...] },
  { id: 'file', label: '파일', icons: [...] },
  { id: 'hardware', label: '하드웨어', icons: [...] },
  { id: 'image', label: '이미지', icons: [...] },
  { id: 'maps', label: '지도', icons: [...] },
  { id: 'navigation', label: '내비게이션', icons: [...] },
  { id: 'notification', label: '알림판', icons: [...] },
  { id: 'places', label: '장소', icons: [...] },
  { id: 'social', label: '소셜', icons: [...] },
  { id: 'toggle', label: '토글', icons: [...] },
  { id: 'korean', label: '가나다', icons: [...] },
];
```

### 14.2 전체 목록

카테고리별 배열에 중복이 있을 수 있으므로 전체 목록은 다음처럼 계산합니다.

```ts
export const ALL_ICONS = [
  ...new Set(ICON_CATEGORIES.flatMap(category => category.icons)),
];
```

### 14.3 가나다 아이콘

Material Icons에 한글 글리프를 포함시키기 위해 다음 특수 이름을 추가합니다.

```text
han:가
han:나
han:다
han:라
han:마
han:바
han:사
han:아
han:자
han:차
han:카
han:타
han:파
han:하
```

이 값들은 Material font 이름이 아니며, 화면에서는 `가`, `나`, `다`와 같은 일반 텍스트로 렌더링합니다.

### 14.4 한글 키워드 맵

동일한 검색 결과를 보장하려면 `KOREAN_ICON_MAP`도 함께 이식해야 합니다. 최소한 다음 그룹을 포함합니다.

```text
일반: 홈, 집, 건물, 사무실
사람: 사람, 사용자, 인물, 팀, 그룹, 프로필
탐색: 검색, 찾기, 탐색
커뮤니케이션: 메일, 이메일, 채팅, 메시지, 전화, 알림, 공지
파일·문서: 파일, 폴더, 문서, 서류, 보고서, 메모, 노트
책·교육: 책, 도서, 교육, 학교
설정·도구: 설정, 도구, 편집, 수정
보안: 보안, 잠금, 비밀번호, 인증
저장·전송: 저장, 업로드, 다운로드, 공유, 전송
추가·삭제: 추가, 삭제, 제거, 취소, 완료, 확인
미디어: 사진, 이미지, 카메라, 동영상, 비디오, 음악, 재생, 정지
데이터: 데이터, 분석, 통계, 차트, 그래프, 대시보드
지도·교통: 지도, 위치, 주소, 비행기, 자동차, 기차, 지하철, 버스, 자전거
금융: 결제, 돈, 금액, 은행, 지갑, 쇼핑
음식·날씨: 음식, 식당, 커피, 음료, 날씨, 태양, 구름, 비
기기: 핸드폰, 스마트폰, 컴퓨터, 노트북, 태블릿, 헤드폰, 키보드, 마우스
인터페이스: 메뉴, 목록, 그리드, 더보기, 화살표, 새로고침, 링크, 필터, 정렬
평가: 즐겨찾기, 북마크, 별, 하트, 좋아요, 싫어요
개발·글쓰기: 코드, 개발, 버그, 글쓰기, 작성, 번역, 언어
날짜·시간: 달력, 일정, 시계, 시간, 날짜
기타: 병원, 의료, 건강, 운동, 선물, 파티, 전구, 아이디어, 지구,
      인쇄, 복사, 로그인, 로그아웃, 관리자, 광고, 뉴스, 실시간,
      태그, 카테고리, 통화, 회의, 발표, 게임, 지원, 정책, 법률, 계약
```

정확한 결과가 중요하면 위 그룹 설명만 재작성하지 말고, 원본 매핑 배열의 seed 아이콘 목록도 그대로 복사합니다.

---

## 15. 상태와 이벤트 설계

### 15.1 모달 상태

```ts
const [search, setSearch] = useState('');
const [activeCategory, setActiveCategory] = useState('all');
const [pickedColor, setPickedColor] = useState(ICON_BG_COLORS[0]);
const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
```

### 15.2 상태 전이

```text
비서 생성 폼
  → 아이콘 선택 버튼 클릭
  → 모달 열림
  → 검색·카테고리·색상 조작
  → 아이콘 클릭
  → 부모의 presetThumb 갱신
  → logoUrl 제거
  → 모달 닫힘
```

색상 변경만 하는 경우:

```text
모달 열림
  → 현재 아이콘 확인
  → 색상 swatch 클릭
  → 미리보기 갱신
  → 색상 적용 클릭
  → 부모의 bg/color 갱신
  → 모달 닫힘
```

### 15.3 부모 콜백

```tsx
<IconPickerModal
  open={iconPickerOpen}
  current={presetThumb}
  onSelect={icon => {
    setPresetThumb(icon);
    setLogoUrl(null);
    setIconPickerOpen(false);
  }}
  onClose={() => setIconPickerOpen(false)}
/>
```

### 15.4 부모·모달 책임 분리

모달 책임:

- 검색
- 카테고리
- 색상
- 현재 선택 표시
- 아이콘 렌더링
- 선택 결과 생성

부모 폼 책임:

- `presetThumb` 저장
- 업로드 사진과의 상호 배제
- 비서 아바타 표시
- 선택 제거
- 비서 저장 API에 icon 데이터 포함

---

## 16. 다크모드와 반응형 구현

### 16.1 다크모드

다크모드에서 반드시 확인할 항목:

- 흰색 모달 표면이 어두운 표면으로 바뀌는지
- 입력창 placeholder가 읽히는지
- 선택 보라색 ring이 보이는지
- 다크 색상 swatch와 흰색 아이콘이 구분되는지
- grid의 색상 배경이 의미를 잃지 않는지
- tooltip이 배경과 겹치지 않는지

권장 다크 표면:

```text
body: #0F0D1A
modal: #0F0D1A 또는 #1A1726
secondary surface: #252237
border: #4A4870
primary text: #F2F0FF
secondary text: #C0BEDC
primary accent: #A8A5FF
```

### 16.2 모바일

- 모달은 bottom sheet
- grid 6열
- 카테고리 탭은 가로 스크롤
- 검색창은 모달 폭 전체 사용
- 색상 팔레트는 wrap
- footer 버튼은 화면 안에서 줄어들지 않도록 한다.
- 아이콘 이름 tooltip에 의존하지 않고 `title`을 제공한다.
- 모달 body만 세로 스크롤되고 header·search·category·color·footer는 고정 영역으로 둔다.

---

## 17. 구현 시 주의할 점

### 17.1 `han:` 아이콘을 Material font로 렌더링하지 않기

잘못된 구현:

```tsx
<span className="material-icons">{name}</span>
```

`name`이 `han:가`이면 Material font가 해당 글리프를 찾지 못합니다.

올바른 구현:

```tsx
{isHanIcon(name) ? (
  <span style={{ color }}>{getHanChar(name)}</span>
) : (
  <span className="material-icons" style={{ color }}>{name}</span>
)}
```

비서 생성 폼의 아바타, 진입 버튼, 모달 미리보기, grid 모두 같은 분기 함수를 사용합니다.

### 17.2 진입 버튼도 한글 아이콘을 별도 렌더링

선택된 아이콘을 진입 버튼에 표시할 때도 `han:` 값을 그대로 Material font에 넣지 않습니다.

### 17.3 현재 선택 색상 동기화

모달이 다시 열릴 때 `current.bg`와 팔레트의 `bg`를 비교해 같은 색상을 선택해야 합니다. 동기화하지 않으면 현재 아이콘과 다른 색상으로 미리보기가 시작됩니다.

### 17.4 카테고리 결과와 전체 결과의 일관성

한글 검색으로 seed를 찾았더라도 최종 결과는 반드시 현재 카테고리 `base`에 한정합니다. 그렇지 않으면 카테고리 탭을 선택한 의미가 사라집니다.

### 17.5 저장 데이터에는 이름·배경·전경색을 모두 저장

아이콘 이름만 저장하면 사용자가 선택한 색상을 복원할 수 없습니다.

```text
name + bg + color
```

세 필드를 함께 저장합니다.

### 17.6 사진과 preset 아이콘의 상호 배제

사진 업로드 후에도 이전 아이콘이 남아 있으면 어떤 것이 실제 아바타인지 모호해집니다. 하나를 선택하면 다른 하나를 `null`로 지웁니다.

---

## 18. 권장 컴포넌트 구조

```text
AssistantBuilderView
├── AssistantAvatar
├── IconSourceTabs
│   ├── MaterialIconTrigger
│   └── PhotoUploadButton
└── IconPickerModal
    ├── IconPickerHeader
    ├── IconSearchInput
    ├── IconCategoryTabs
    ├── IconColorPicker
    │   └── IconLivePreview
    ├── IconGrid
    │   └── IconGridItem
    └── IconPickerFooter
```

데이터 파일:

```text
data/materialIcons.ts
```

내보낼 값:

```ts
IconCategory
ICON_CATEGORIES
ALL_ICONS
KOREAN_ICON_MAP
searchByKorean
isHanIcon
getHanChar
ICON_BG_COLORS
```

---

## 19. 테스트 체크리스트

### 진입·닫기

- [ ] `아이콘 선택` 탭이 기본 활성화된다.
- [ ] `Material 아이콘 선택…` 버튼을 클릭하면 모달이 열린다.
- [ ] X 버튼으로 닫힌다.
- [ ] overlay 클릭으로 닫힌다.
- [ ] 모달 내부 클릭이 닫기 이벤트를 발생시키지 않는다.
- [ ] `Escape`로 닫을 수 있다.
- [ ] 모달이 열릴 때 검색창에 focus된다.

### 검색

- [ ] 검색어가 없으면 현재 카테고리 전체가 표시된다.
- [ ] `book` 검색이 동작한다.
- [ ] 공백이 underscore 검색으로 정규화된다.
- [ ] `책` 검색이 영문 아이콘 결과를 보여 준다.
- [ ] `사람`, `문서`, `설정`, `분석`, `사진` 검색이 동작한다.
- [ ] 한글 검색이 현재 카테고리 범위를 벗어나지 않는다.
- [ ] 검색어를 지울 수 있다.
- [ ] 검색 결과가 없으면 `"{검색어}" 검색 결과 없음`이 표시된다.

### 카테고리

- [ ] `전체 (N)` 개수가 실제 고유 목록과 일치한다.
- [ ] 카테고리 선택 시 grid가 갱신된다.
- [ ] 카테고리 탭은 모바일에서 가로 스크롤된다.
- [ ] `가나다` 카테고리가 표시된다.
- [ ] 동일 아이콘이 여러 카테고리에 있어도 전체 목록에서는 중복되지 않는다.

### 색상

- [ ] 10개 색상이 정확한 배경·전경색으로 표시된다.
- [ ] 색상 선택 시 ring과 확대 상태가 보인다.
- [ ] 색상 선택 즉시 미리보기가 바뀐다.
- [ ] 현재 아이콘이 있을 때 `색상 적용` 버튼이 보인다.
- [ ] 현재 아이콘이 없을 때 `색상 적용` 버튼이 숨겨진다.
- [ ] 다크 색상 swatch 내부 흰색 점이 보인다.
- [ ] 재진입 시 현재 아이콘의 색상이 복원된다.

### 아이콘 선택

- [ ] 아이콘 클릭 시 `name`, `bg`, `color`가 함께 전달된다.
- [ ] 선택 즉시 부모 아바타가 갱신된다.
- [ ] 아이콘 선택 시 업로드 사진이 제거된다.
- [ ] 선택된 셀에 보라색 ring이 표시된다.
- [ ] hover 시 아이콘 이름이 표시된다.
- [ ] `han:가`가 Material font 이름이 아닌 한글 `가`로 표시된다.
- [ ] 한글 아이콘도 선택·색상 적용·저장이 된다.

### 사진 업로드

- [ ] PNG/JPEG/WebP만 선택할 수 있다.
- [ ] 사진 선택 시 아바타가 사진으로 바뀐다.
- [ ] 사진 선택 시 preset 아이콘이 제거된다.
- [ ] 같은 파일을 다시 선택할 수 있다.
- [ ] 제거 버튼으로 사진이 삭제되고 기본 아바타로 돌아간다.

### 반응형·접근성

- [ ] 데스크톱에서 560px 모달이 중앙에 표시된다.
- [ ] 모바일에서 bottom sheet로 표시된다.
- [ ] 모바일 grid가 6열이다.
- [ ] 데스크톱 grid가 8열이다.
- [ ] 검색창과 버튼에 적절한 accessible name이 있다.
- [ ] 키보드만으로 검색·탭·선택·닫기가 가능하다.
- [ ] 색상 swatch에 `title` 또는 accessible label이 있다.
- [ ] 아이콘 셀에 아이콘 이름이 accessible name으로 노출된다.

---

## 20. 최종 완료 기준

다음 조건을 모두 만족하면 다른 프로젝트에서 동일한 Material Icons 선택 기능이 구현된 것으로 판단합니다.

1. 비서 생성 폼의 `기본 정보`에서 아이콘 선택 영역이 중앙 아바타와 함께 표시된다.
2. `아이콘 선택`과 `사진 업로드` 탭을 전환할 수 있다.
3. Material Icons 선택 모달이 데스크톱·모바일에서 동일한 계층으로 열린다.
4. 검색창에서 영문 이름과 한국어 키워드를 모두 사용할 수 있다.
5. 카테고리 탭과 검색 결과가 서로 일관된다.
6. 10개 배경 색상 팔레트와 전경색이 정확히 적용된다.
7. 색상 변경이 미리보기에 즉시 반영된다.
8. 아이콘 선택 결과에 이름·배경·전경색이 함께 저장된다.
9. `han:` 특수 아이콘이 한글 텍스트로 정상 렌더링된다.
10. 선택한 Material 아이콘과 업로드 사진이 서로 중복 상태가 되지 않는다.
11. 현재 선택값을 다시 열었을 때 아이콘·색상·선택 상태가 복원된다.
12. 검색 결과 없음, hover, 선택, 닫기, 빈 상태가 모두 구현된다.
13. 반응형 grid, bottom sheet, horizontal category scroll이 동작한다.
14. 키보드·스크린리더 접근성 라벨이 제공된다.
15. 비서 저장 API에 `icon.name`, `icon.background`, `icon.color`가 전달된다.

---

## 21. 현재 프로젝트 참고 위치

현재 구현을 직접 확인하거나 데이터까지 그대로 옮길 때 참고할 파일:

```text
artifacts/jpdc-ai/src/components/IconPickerModal.tsx
artifacts/jpdc-ai/src/data/materialIcons.ts
artifacts/jpdc-ai/src/views/AssistantBuilderView.tsx
artifacts/jpdc-ai/src/main.tsx
artifacts/jpdc-ai/src/index.css
```

역할:

- `IconPickerModal.tsx`: 모달 UI, 검색, 카테고리, 색상, grid, 선택 콜백
- `materialIcons.ts`: 카테고리, 전체 아이콘 목록, 한글 검색 맵, 색상 팔레트
- `AssistantBuilderView.tsx`: 비서 생성 폼, 아바타, Material/사진 탭, 부모 상태
- `main.tsx`: Material Icons CSS import
- `index.css`: 라이트·다크·반응형 전역 스타일
# 나만의 비서 — Material Icons 선택 UI 재구축 명세서

> JPDC AI의 `나만의 비서 만들기` 화면에서 사용하는 Material Icons 선택 영역을 다른 프로젝트에서 동일한 동작과 형태로 구현하기 위한 명세서입니다.  
> 문서 기준일: **2026-09-02**  
> 대상 기능: 비서 아이콘 선택, 카테고리 탐색, 영문·한글 검색, 배경 색상 선택, 사진 업로드 탭과의 전환

---

## 1. 기능 목적

비서 생성·수정 폼의 기본 정보 영역에서 사용자가 비서 아바타를 직접 설정합니다.

지원 방식:

1. 로컬 Material Icons 카탈로그에서 아이콘 선택
2. 아이콘 카테고리별 탐색
3. Material Icons 영문 이름 검색
4. 한국어 키워드 검색
5. 아이콘 배경 색상 선택
6. 사진 파일 업로드
7. 현재 선택 아이콘의 실시간 미리보기
8. 선택한 아이콘 또는 업로드한 사진 제거

Material Icons 선택과 사진 업로드는 서로 대체 관계입니다.

```text
Material 아이콘 선택
  → presetThumb 저장
  → logoUrl 제거

사진 업로드
  → logoUrl 저장
  → presetThumb 제거
```

---

## 2. 비서 생성 화면에서의 위치

### 2.1 진입 화면

화면 제목:

- 새로 만들 때: `나만의 비서 만들기`
- 수정할 때: `비서 수정`

기본 정보 섹션의 중앙에 원형 아바타를 배치합니다.

```text
기본 정보

              ┌────────┐
              │  아이콘 │  ← 원형 아바타 미리보기
              └────────┘

       [ 아이콘 선택 | 사진 업로드 ]

       [ Material 아이콘 선택…       ▦ ]

이름       [ 비서 이름 (최대 20자) ]
설명       [ 한 문장 설명 (최대 80자) ]
```

### 2.2 기본 정보 영역 라벨

- `기본 정보`
- `아이콘 선택`
- `사진 업로드`
- 초기 상태 placeholder: `Material 아이콘 선택…`
- 이름 placeholder: `비서 이름 (최대 20자)`
- 설명 placeholder: `한 문장 설명 (최대 80자)`

### 2.3 아바타 기본 상태

선택된 아이콘과 업로드 사진이 모두 없으면 비서 이름 첫 글자를 표시합니다.

- 이름이 있으면 첫 글자를 대문자로 표시
- 이름도 없으면 빈 원형 아바타
- 배경 기본값: `#F4F3FC`
- 아바타 크기: `96px × 96px`
- 원형: `border-radius: 9999px`
- 기본 테두리: `2px dashed #C7C3F7`

선택된 아이콘 또는 사진이 있으면 우측 상단에 제거 버튼을 표시합니다.

- 버튼 크기: 약 `20px × 20px`
- 위치: 아바타 우측 상단 바깥쪽
- 배경: `#DC2626`
- 아이콘: 흰색 X
- 동작: `logoUrl`과 `presetThumb`를 모두 `null`로 초기화

---

## 3. 비서 생성 폼의 아이콘 탭

### 3.1 탭 UI

두 개의 pill 버튼을 사용합니다.

```text
[ 아이콘 선택 ] [ 사진 업로드 ]
```

상태:

```ts
type IconTab = 'bank' | 'upload';
const [iconTab, setIconTab] = useState<IconTab>('bank');
```

초기 탭은 `bank`입니다.

### 3.2 탭 스타일

탭 전체:

- 배경: `#F7F6FD`
- 테두리: `1px solid #E4E2F0`
- 내부 padding: `2px`
- 둥근 모서리: pill

활성 탭:

- 배경: `#FAFAFE`
- 텍스트: `#4F46E5`
- 낮은 그림자

비활성 탭:

- 텍스트: `#A8A6C0`
- hover 시 `#6B6882`

### 3.3 Material 아이콘 진입 버튼

아이콘 선택 탭에서 다음 버튼을 보여 줍니다.

선택 전:

```text
▦  Material 아이콘 선택…  ▦
```

선택 후:

```text
[아이콘]  book  ▦
```

스타일:

- 가로 flex
- `px-4 py-2`
- `rounded-xl`
- 테두리 `#E4E2F0`
- 배경 흰색
- hover 테두리 `#4F46E5`
- hover 배경 `#F7F6FD`
- shadow-sm

동작:

- 클릭하면 Material Icons 선택 모달을 연다.
- 선택된 아이콘 이름은 `_`를 공백으로 바꾸어 표시한다.
- 오른쪽 `grid_view` 아이콘은 모달 진입 affordance로 사용한다.

### 3.4 사진 업로드 탭

버튼 라벨:

```text
사진 업로드
```

허용 형식:

```text
image/png
image/jpeg
image/webp
```

업로드 시:

1. 선택한 파일에서 object URL 생성
2. `logoUrl`에 저장
3. `presetThumb`를 `null`로 설정
4. 파일 input value를 비워 동일 파일 재선택을 허용

---

## 4. Material Icons 모달 레이아웃

### 4.1 모달 기본 구조

```text
┌────────────────────────────────────────────┐
│ 아이콘 선택                         [닫기] │
│ Google Material Icons · N개                │
│                                            │
│ [ 🔍 책, 도서, 설정, 사람… 또는 ... ]       │
│                                            │
│ [전체] [액션] [알림] [미디어] [커뮤니케이션]  │ ← 가로 스크롤
│                                            │
│ 배경 색상 — 클릭하면 아이콘 전체에 즉시 적용됩니다 │
│ ● ● ● ● ● ● ● ● ● ●   [미리보기]          │
│                                            │
│ ─────────────────────────────────────────  │
│                                            │
│       [아이콘] [아이콘] [아이콘] ...        │
│       [아이콘] [아이콘] [아이콘] ...        │ ← 스크롤
│                                            │
│ N개 표시                         [취소] [색상 적용] │
└────────────────────────────────────────────┘
```

### 4.2 데스크톱과 모바일

데스크톱:

- 폭: `560px`
- 높이: viewport의 `88dvh`
- 최대 높이: `88dvh`
- 화면 중앙 정렬
- `rounded-2xl`

모바일:

- 폭: `100%`
- 화면 하단에서 올라오는 bottom sheet
- 위쪽 모서리만 둥글게
- 높이: `88dvh`

공통:

- `position: fixed`
- z-index: `200`
- 배경 overlay: 검정 40% 투명도
- overlay blur: 약 `2px`
- overlay 또는 모달 외부 클릭 시 닫기
- 모달 내부 클릭은 전파 중지

### 4.3 열림·닫힘 상태

```ts
type IconPickerModalProps = {
  open: boolean;
  current: SelectedIcon | null;
  onSelect: (icon: SelectedIcon) => void;
  onClose: () => void;
};
```

`open`이 `false`이면 모달 DOM을 렌더링하지 않습니다.

모달이 열릴 때:

1. 검색어를 빈 문자열로 초기화
2. 현재 아이콘이 있으면 현재 배경 색상과 일치하는 팔레트를 선택
3. 일치하는 색상이 없으면 첫 번째 색상을 사용
4. 약 80ms 뒤 검색창에 focus

카테고리 선택 상태는 기존 선택값을 유지할 수 있습니다. 검색어는 열 때마다 초기화합니다.

---

## 5. 모달 헤더

### 5.1 제목

```text
아이콘 선택
```

### 5.2 설명

```text
Google Material Icons · N개
```

`N`은 하드코딩하지 않고 고유 아이콘 목록의 실제 개수로 계산합니다.

### 5.3 닫기 버튼

- 원형 또는 둥근 버튼
- 크기: 약 `32px`
- 배경: `#F4F3FC`
- hover 배경: `#E9E7FA`
- 아이콘: Lucide `X`
- 클릭 시 `onClose()`

---

## 6. 검색 UI와 검색 규칙

### 6.1 검색창

placeholder:

```text
책, 도서, 설정, 사람… 또는 book, person, home…
```

스타일:

- 좌측 검색 아이콘
- 둥근 모서리
- 배경: `#F7F6FD`
- 테두리: `#E4E2F0`
- focus 시 테두리: `#4F46E5`
- 입력 텍스트: `14px`
- clear 버튼은 검색어가 있을 때만 표시

### 6.2 카테고리 필터와 검색의 관계

검색은 현재 선택된 카테고리의 아이콘 안에서만 수행합니다.

```ts
const base =
  activeCategory === 'all'
    ? ALL_ICONS
    : ICON_CATEGORIES.find(c => c.id === activeCategory)?.icons ?? [];
```

검색어가 비어 있으면 `base` 전체를 표시합니다.

### 6.3 영문 검색

영문 또는 비한글 검색어는 다음과 같이 처리합니다.

1. trim
2. 소문자 변환
3. 공백을 underscore로 변환
4. 아이콘 이름에 검색어가 포함되는지 비교

```ts
const normalized = query.trim().toLowerCase().replace(/\s+/g, '_');
const result = base.filter(name => name.includes(normalized));
```

예시:

| 입력 | 매칭 예 |
|---|---|
| `book` | `book`, `menu_book`, `library_books` |
| `person` | `person`, `person_add`, `person_outline` |
| `arrow right` | `arrow_right`, `arrow_right_alt` |
| `home` | `home`, `home_work` 등 |

### 6.4 한글 검색

한글 검색은 영문 아이콘 이름을 직접 비교하지 않고 키워드 매핑을 사용합니다.

예시:

```ts
const KOREAN_ICON_MAP = {
  홈: ['home', 'house', 'apartment', 'dashboard'],
  사람: ['person', 'account_circle', 'account_box', 'face'],
  검색: ['search', 'find_in_page', 'find_replace', 'manage_search', 'pageview'],
  문서: ['description', 'article', 'subject', 'text_snippet', 'assignment'],
  설정: ['settings', 'settings_applications', 'tune', 'build', 'manage_accounts'],
  분석: ['assessment', 'analytics', 'bar_chart', 'pie_chart', 'show_chart'],
  사진: ['photo', 'image', 'photo_library', 'collections', 'camera_alt'],
  번역: ['translate', 'language', 'g_translate', 'interpreter_mode'],
};
```

매핑은 부분 일치를 지원합니다.

```ts
if (keyword.includes(query) || query.includes(keyword)) {
  // 해당 키워드의 seed 아이콘 추가
}
```

각 seed 아이콘에 대해:

1. seed 자체를 결과에 추가
2. 전체 아이콘 목록에서 seed 문자열을 포함하는 아이콘도 추가
3. Set으로 중복 제거
4. 현재 카테고리의 `base` 목록으로 최종 필터링

```ts
function searchByKorean(query: string): Set<string> {
  const q = query.trim();
  if (!q) return new Set();

  const result = new Set<string>();
  for (const [keyword, icons] of Object.entries(KOREAN_ICON_MAP)) {
    if (keyword.includes(q) || q.includes(keyword)) {
      icons.forEach(seed => {
        result.add(seed);
        ALL_ICONS.forEach(icon => {
          if (icon.includes(seed)) result.add(icon);
        });
      });
    }
  }
  return result;
}
```

### 6.5 검색 결과 없음

검색 결과가 없으면 아이콘 grid 대신 중앙 empty state를 표시합니다.

- 아이콘: Material `search_off`
- 텍스트: `"{검색어}" 검색 결과 없음`
- 세로 여백: 약 `48px`

---

## 7. 카테고리 탭

카테고리 탭은 가로로 넘칠 수 있으므로 horizontal scroll을 사용합니다. 스크롤바는 숨깁니다.

표시 순서:

1. `전체 (N)`
2. `액션`
3. `알림`
4. `미디어`
5. `커뮤니케이션`
6. `콘텐츠`
7. `기기`
8. `에디터`
9. `파일`
10. `하드웨어`
11. `이미지`
12. `지도`
13. `내비게이션`
14. `알림판`
15. `장소`
16. `소셜`
17. `토글`
18. `가나다`

카테고리 데이터 형식:

```ts
type IconCategory = {
  id: string;
  label: string;
  icons: string[];
};
```

특수 카테고리:

- `id: 'all'`
- `label: 전체 (N)`
- 실제 배열은 모든 카테고리의 아이콘을 flatMap하고 Set으로 중복 제거한 `ALL_ICONS`

탭 스타일:

활성:

- 배경: `#4F46E5`
- 글자: 흰색
- shadow-sm

비활성:

- 배경: `#F4F3FC`
- 글자: `#6B6882`
- hover 배경: `#E9E7FA`

---

## 8. 배경 색상 팔레트

### 8.1 색상 데이터

색상은 배경과 아이콘 전경색을 한 쌍으로 저장합니다.

```ts
type IconColor = {
  bg: string;
  color: string;
  label: string;
};
```

정확한 팔레트:

| 라벨 | 배경 `bg` | 아이콘 `color` |
|---|---|---|
| 파랑 | `#EEF5FF` | `#3B5BDB` |
| 초록 | `#F0FDF4` | `#2F9E44` |
| 보라 | `#F5F3FF` | `#6741D9` |
| 주황 | `#FFF7ED` | `#E8590C` |
| 분홍 | `#FDF2F8` | `#C2255C` |
| 노랑 | `#FFFBEB` | `#E67700` |
| 청록 | `#F0FDFA` | `#0C8599` |
| 빨강 | `#FFF1F2` | `#C92A2A` |
| 회색 | `#F1F5F9` | `#475569` |
| 다크 | `#1A1826` | `#FFFFFF` |

첫 번째 색상 `파랑`을 기본값으로 사용합니다.

### 8.2 팔레트 UI

설명:

```text
배경 색상 — 클릭하면 아이콘 전체에 즉시 적용됩니다
```

동작:

- 색상 원형 swatch를 클릭하면 `pickedColor`가 변경된다.
- 선택된 swatch는 보라색 ring과 ring offset을 가진다.
- 선택 시 약간 확대된다.
- 각 swatch의 `title`은 색상 라벨이다.
- 다크 색상은 내부에 흰색 점을 표시해 색상을 인지하게 한다.

크기:

- swatch: `28px × 28px`
- 간격: 약 `6px`
- 작은 화면에서는 wrap

### 8.3 적용 타이밍

색상은 두 가지 방식으로 적용됩니다.

#### 아이콘을 새로 선택하는 경우

사용자가 grid에서 아이콘을 클릭하면 현재 `pickedColor`와 함께 부모에 즉시 전달합니다.

```ts
onSelect({
  name,
  bg: pickedColor.bg,
  color: pickedColor.color,
});
```

#### 이미 선택한 아이콘의 색상만 바꾸는 경우

현재 아이콘이 있을 때 색상만 바꿔도 모달 미리보기는 즉시 바뀝니다. 부모 상태에 최종 적용하려면 footer의 `색상 적용` 버튼을 사용합니다.

```ts
onSelect({
  name: current.name,
  bg: pickedColor.bg,
  color: pickedColor.color,
});
```

현재 아이콘이 없으면 `색상 적용` 버튼을 숨깁니다.

---

## 9. 실시간 미리보기

색상 팔레트 오른쪽에 미리보기 카드를 배치합니다.

구성:

- 작은 아이콘 박스: `36px × 36px`
- 선택한 `pickedColor.bg`
- 아이콘 색상: `pickedColor.color`
- 색상 라벨
- `미리보기`

표시 아이콘:

- 현재 선택 아이콘이 없으면 `smart_toy`
- 현재 아이콘이 Material Icons면 `<span class="material-icons">`
- 한글 특수 아이콘이면 일반 Material font 대신 한글 문자를 텍스트로 표시

```ts
function isHanIcon(name: string) {
  return name.startsWith('han:');
}

function getHanChar(name: string) {
  return name.slice(4);
}
```

예:

```text
han:가 → 가
han:나 → 나
```

미리보기 크기:

- Material icon: 약 `22px`
- 한글 아이콘: 약 `22px`, bold

---

## 10. 아이콘 grid

### 10.1 레이아웃

- 세로로 스크롤되는 영역
- 좌우 padding: 약 `16px`
- 위아래 padding: 약 `12px`
- grid gap: 약 `6px`
- 모바일: 6열
- `sm` 이상: 8열
- 각 셀: 정사각형
- 각 셀: `aspect-ratio: 1 / 1`
- 둥근 모서리: `rounded-xl`

```css
.icon-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 6px;
}

@media (min-width: 640px) {
  .icon-grid {
    grid-template-columns: repeat(8, minmax(0, 1fr));
  }
}
```

### 10.2 아이콘 셀

각 아이콘 셀의 배경은 현재 선택한 `pickedColor.bg`를 사용합니다.

Material icon:

- 클래스: `material-icons`
- 크기: 약 `23px`
- 색상: `pickedColor.color`

한글 아이콘:

- `han:` prefix 제거 후 문자 출력
- 크기: 약 `26px`
- bold
- 색상: `pickedColor.color`

### 10.3 선택 상태

현재 선택된 아이콘은 `current?.name === name`으로 비교합니다.

선택 상태:

- 보라색 `2px` ring
- ring offset `1px`
- 약간 확대 `scale(1.05)`

일반 hover:

- 약간 확대
- `1px` 보라색 ring
- ring offset `1px`

### 10.4 아이콘 이름 tooltip

hover 중인 셀에만 아이콘 이름을 표시합니다.

- `_`는 공백으로 변경
- 배경: `#1A1826`
- 글자: 흰색
- 글자 크기: `10px`
- 아이콘 셀 아래쪽에 absolute 배치
- `pointer-events: none`
- z-index를 grid보다 높게 설정

예:

```text
account_balance_wallet → account balance wallet
```

모바일에서는 hover가 없으므로 title attribute만으로 대체할 수 있습니다.

---

## 11. Footer

### 11.1 표시 개수

왼쪽에 현재 필터 결과 수를 표시합니다.

```text
N개 표시
```

`displayedIcons.length.toLocaleString()`을 사용합니다.

### 11.2 버튼

오른쪽 버튼:

- `취소`
- `색상 적용` — 현재 아이콘이 있을 때만 표시

`취소`:

- 변경된 선택을 부모에 적용하지 않고 모달을 닫는 정책으로 구현할 수 있다.
- 현재 구현과 완전히 같게 유지하려면, 이미 grid 아이콘을 클릭한 선택은 즉시 부모에 전달되므로 `취소`는 모달 닫기만 수행한다는 점을 명시해야 한다.

`색상 적용`:

- 현재 아이콘 이름은 유지
- 현재 선택 색상만 부모에 전달
- 모달 닫힘

Footer:

- 위쪽 테두리
- 연한 회색 배경 `#FAFAFA`
- 좌우 padding 약 `20px`
- 세로 padding 약 `12px`

---

## 12. 선택 결과 데이터 계약

아이콘 선택 결과는 다음 세 필드만으로 충분합니다.

```ts
type SelectedIcon = {
  name: string;
  bg: string;
  color: string;
};
```

예시:

```json
{
  "name": "menu_book",
  "bg": "#F5F3FF",
  "color": "#6741D9"
}
```

한글 특수 아이콘:

```json
{
  "name": "han:가",
  "bg": "#EEF5FF",
  "color": "#3B5BDB"
}
```

비서 저장 모델에 포함할 때:

```ts
type AssistantIcon = {
  name: string;
  background: string;
  color: string;
};
```

API 요청 예:

```json
{
  "icon": {
    "name": "menu_book",
    "background": "#F5F3FF",
    "color": "#6741D9"
  }
}
```

---

## 13. Material Icons 로딩

Material Icons font를 앱 진입점에서 한 번 로드합니다.

현재 방식:

```ts
import 'material-icons/iconfont/material-icons.css';
```

렌더링:

```tsx
<span className="material-icons">menu_book</span>
```

주의:

- `name`을 SVG path로 해석하지 않는다.
- Material Icons font 이름을 그대로 텍스트 노드로 전달한다.
- `han:가`처럼 실제 Material Icons에 없는 값은 font로 렌더링하지 않는다.
- `han:` 값은 반드시 별도의 텍스트 분기로 처리한다.
- Material Icons CSS가 로드되지 않으면 아이콘 이름이 글자로 보이므로 앱 초기화 단계에서 로드 여부를 확인한다.

---

## 14. 아이콘 카탈로그 데이터

아이콘 카탈로그는 서버 검색에 의존하지 않고 로컬 정적 데이터로 유지합니다. 다른 프로젝트로 옮길 때는 다음 원칙을 지킵니다.

### 14.1 카테고리 배열

```ts
export const ICON_CATEGORIES: IconCategory[] = [
  { id: 'action', label: '액션', icons: [...] },
  { id: 'alert', label: '알림', icons: [...] },
  { id: 'av', label: '미디어', icons: [...] },
  { id: 'communication', label: '커뮤니케이션', icons: [...] },
  { id: 'content', label: '콘텐츠', icons: [...] },
  { id: 'device', label: '기기', icons: [...] },
  { id: 'editor', label: '에디터', icons: [...] },
  { id: 'file', label: '파일', icons: [...] },
  { id: 'hardware', label: '하드웨어', icons: [...] },
  { id: 'image', label: '이미지', icons: [...] },
  { id: 'maps', label: '지도', icons: [...] },
  { id: 'navigation', label: '내비게이션', icons: [...] },
  { id: 'notification', label: '알림판', icons: [...] },
  { id: 'places', label: '장소', icons: [...] },
  { id: 'social', label: '소셜', icons: [...] },
  { id: 'toggle', label: '토글', icons: [...] },
  { id: 'korean', label: '가나다', icons: [...] },
];
```

### 14.2 전체 목록

카테고리별 배열에 중복이 있을 수 있으므로 전체 목록은 다음처럼 계산합니다.

```ts
export const ALL_ICONS = [
  ...new Set(ICON_CATEGORIES.flatMap(category => category.icons)),
];
```

### 14.3 가나다 아이콘

Material Icons에 한글 글리프를 포함시키기 위해 다음 특수 이름을 추가합니다.

```text
han:가
han:나
han:다
han:라
han:마
han:바
han:사
han:아
han:자
han:차
han:카
han:타
han:파
han:하
```

이 값들은 Material font 이름이 아니며, 화면에서는 `가`, `나`, `다`와 같은 일반 텍스트로 렌더링합니다.

### 14.4 한글 키워드 맵

동일한 검색 결과를 보장하려면 `KOREAN_ICON_MAP`도 함께 이식해야 합니다. 최소한 다음 그룹을 포함합니다.

```text
일반: 홈, 집, 건물, 사무실
사람: 사람, 사용자, 인물, 팀, 그룹, 프로필
탐색: 검색, 찾기, 탐색
커뮤니케이션: 메일, 이메일, 채팅, 메시지, 전화, 알림, 공지
파일·문서: 파일, 폴더, 문서, 서류, 보고서, 메모, 노트
책·교육: 책, 도서, 교육, 학교
설정·도구: 설정, 도구, 편집, 수정
보안: 보안, 잠금, 비밀번호, 인증
저장·전송: 저장, 업로드, 다운로드, 공유, 전송
추가·삭제: 추가, 삭제, 제거, 취소, 완료, 확인
미디어: 사진, 이미지, 카메라, 동영상, 비디오, 음악, 재생, 정지
데이터: 데이터, 분석, 통계, 차트, 그래프, 대시보드
지도·교통: 지도, 위치, 주소, 비행기, 자동차, 기차, 지하철, 버스, 자전거
금융: 결제, 돈, 금액, 은행, 지갑, 쇼핑
음식·날씨: 음식, 식당, 커피, 음료, 날씨, 태양, 구름, 비
기기: 핸드폰, 스마트폰, 컴퓨터, 노트북, 태블릿, 헤드폰, 키보드, 마우스
인터페이스: 메뉴, 목록, 그리드, 더보기, 화살표, 새로고침, 링크, 필터, 정렬
평가: 즐겨찾기, 북마크, 별, 하트, 좋아요, 싫어요
개발·글쓰기: 코드, 개발, 버그, 글쓰기, 작성, 번역, 언어
날짜·시간: 달력, 일정, 시계, 시간, 날짜
기타: 병원, 의료, 건강, 운동, 선물, 파티, 전구, 아이디어, 지구,
      인쇄, 복사, 로그인, 로그아웃, 관리자, 광고, 뉴스, 실시간,
      태그, 카테고리, 통화, 회의, 발표, 게임, 지원, 정책, 법률, 계약
```

정확한 결과가 중요하면 위 그룹 설명만 재작성하지 말고, 원본 매핑 배열의 seed 아이콘 목록도 그대로 복사합니다.

---

## 15. 상태와 이벤트 설계

### 15.1 모달 상태

```ts
const [search, setSearch] = useState('');
const [activeCategory, setActiveCategory] = useState('all');
const [pickedColor, setPickedColor] = useState(ICON_BG_COLORS[0]);
const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
```

### 15.2 상태 전이

```text
비서 생성 폼
  → 아이콘 선택 버튼 클릭
  → 모달 열림
  → 검색·카테고리·색상 조작
  → 아이콘 클릭
  → 부모의 presetThumb 갱신
  → logoUrl 제거
  → 모달 닫힘
```

색상 변경만 하는 경우:

```text
모달 열림
  → 현재 아이콘 확인
  → 색상 swatch 클릭
  → 미리보기 갱신
  → 색상 적용 클릭
  → 부모의 bg/color 갱신
  → 모달 닫힘
```

### 15.3 부모 콜백

```tsx
<IconPickerModal
  open={iconPickerOpen}
  current={presetThumb}
  onSelect={icon => {
    setPresetThumb(icon);
    setLogoUrl(null);
    setIconPickerOpen(false);
  }}
  onClose={() => setIconPickerOpen(false)}
/>
```

### 15.4 부모·모달 책임 분리

모달 책임:

- 검색
- 카테고리
- 색상
- 현재 선택 표시
- 아이콘 렌더링
- 선택 결과 생성

부모 폼 책임:

- `presetThumb` 저장
- 업로드 사진과의 상호 배제
- 비서 아바타 표시
- 선택 제거
- 비서 저장 API에 icon 데이터 포함

---

## 16. 다크모드와 반응형 구현

### 16.1 다크모드

다크모드에서 반드시 확인할 항목:

- 흰색 모달 표면이 어두운 표면으로 바뀌는지
- 입력창 placeholder가 읽히는지
- 선택 보라색 ring이 보이는지
- 다크 색상 swatch와 흰색 아이콘이 구분되는지
- grid의 색상 배경이 의미를 잃지 않는지
- tooltip이 배경과 겹치지 않는지

권장 다크 표면:

```text
body: #0F0D1A
modal: #0F0D1A 또는 #1A1726
secondary surface: #252237
border: #4A4870
primary text: #F2F0FF
secondary text: #C0BEDC
primary accent: #A8A5FF
```

### 16.2 모바일

- 모달은 bottom sheet
- grid 6열
- 카테고리 탭은 가로 스크롤
- 검색창은 모달 폭 전체 사용
- 색상 팔레트는 wrap
- footer 버튼은 화면 안에서 줄어들지 않도록 한다.
- 아이콘 이름 tooltip에 의존하지 않고 `title`을 제공한다.
- 모달 body만 세로 스크롤되고 header·search·category·color·footer는 고정 영역으로 둔다.

---

## 17. 구현 시 주의할 점

### 17.1 `han:` 아이콘을 Material font로 렌더링하지 않기

잘못된 구현:

```tsx
<span className="material-icons">{name}</span>
```

`name`이 `han:가`이면 Material font가 해당 글리프를 찾지 못합니다.

올바른 구현:

```tsx
{isHanIcon(name) ? (
  <span style={{ color }}>{getHanChar(name)}</span>
) : (
  <span className="material-icons" style={{ color }}>{name}</span>
)}
```

비서 생성 폼의 아바타, 진입 버튼, 모달 미리보기, grid 모두 같은 분기 함수를 사용합니다.

### 17.2 진입 버튼도 한글 아이콘을 별도 렌더링

선택된 아이콘을 진입 버튼에 표시할 때도 `han:` 값을 그대로 Material font에 넣지 않습니다.

### 17.3 현재 선택 색상 동기화

모달이 다시 열릴 때 `current.bg`와 팔레트의 `bg`를 비교해 같은 색상을 선택해야 합니다. 동기화하지 않으면 현재 아이콘과 다른 색상으로 미리보기가 시작됩니다.

### 17.4 카테고리 결과와 전체 결과의 일관성

한글 검색으로 seed를 찾았더라도 최종 결과는 반드시 현재 카테고리 `base`에 한정합니다. 그렇지 않으면 카테고리 탭을 선택한 의미가 사라집니다.

### 17.5 저장 데이터에는 이름·배경·전경색을 모두 저장

아이콘 이름만 저장하면 사용자가 선택한 색상을 복원할 수 없습니다.

```text
name + bg + color
```

세 필드를 함께 저장합니다.

### 17.6 사진과 preset 아이콘의 상호 배제

사진 업로드 후에도 이전 아이콘이 남아 있으면 어떤 것이 실제 아바타인지 모호해집니다. 하나를 선택하면 다른 하나를 `null`로 지웁니다.

---

## 18. 권장 컴포넌트 구조

```text
AssistantBuilderView
├── AssistantAvatar
├── IconSourceTabs
│   ├── MaterialIconTrigger
│   └── PhotoUploadButton
└── IconPickerModal
    ├── IconPickerHeader
    ├── IconSearchInput
    ├── IconCategoryTabs
    ├── IconColorPicker
    │   └── IconLivePreview
    ├── IconGrid
    │   └── IconGridItem
    └── IconPickerFooter
```

데이터 파일:

```text
data/materialIcons.ts
```

내보낼 값:

```ts
IconCategory
ICON_CATEGORIES
ALL_ICONS
KOREAN_ICON_MAP
searchByKorean
isHanIcon
getHanChar
ICON_BG_COLORS
```

---

## 19. 테스트 체크리스트

### 진입·닫기

- [ ] `아이콘 선택` 탭이 기본 활성화된다.
- [ ] `Material 아이콘 선택…` 버튼을 클릭하면 모달이 열린다.
- [ ] X 버튼으로 닫힌다.
- [ ] overlay 클릭으로 닫힌다.
- [ ] 모달 내부 클릭이 닫기 이벤트를 발생시키지 않는다.
- [ ] `Escape`로 닫을 수 있다.
- [ ] 모달이 열릴 때 검색창에 focus된다.

### 검색

- [ ] 검색어가 없으면 현재 카테고리 전체가 표시된다.
- [ ] `book` 검색이 동작한다.
- [ ] 공백이 underscore 검색으로 정규화된다.
- [ ] `책` 검색이 영문 아이콘 결과를 보여 준다.
- [ ] `사람`, `문서`, `설정`, `분석`, `사진` 검색이 동작한다.
- [ ] 한글 검색이 현재 카테고리 범위를 벗어나지 않는다.
- [ ] 검색어를 지울 수 있다.
- [ ] 검색 결과가 없으면 `"{검색어}" 검색 결과 없음`이 표시된다.

### 카테고리

- [ ] `전체 (N)` 개수가 실제 고유 목록과 일치한다.
- [ ] 카테고리 선택 시 grid가 갱신된다.
- [ ] 카테고리 탭은 모바일에서 가로 스크롤된다.
- [ ] `가나다` 카테고리가 표시된다.
- [ ] 동일 아이콘이 여러 카테고리에 있어도 전체 목록에서는 중복되지 않는다.

### 색상

- [ ] 10개 색상이 정확한 배경·전경색으로 표시된다.
- [ ] 색상 선택 시 ring과 확대 상태가 보인다.
- [ ] 색상 선택 즉시 미리보기가 바뀐다.
- [ ] 현재 아이콘이 있을 때 `색상 적용` 버튼이 보인다.
- [ ] 현재 아이콘이 없을 때 `색상 적용` 버튼이 숨겨진다.
- [ ] 다크 색상 swatch 내부 흰색 점이 보인다.
- [ ] 재진입 시 현재 아이콘의 색상이 복원된다.

### 아이콘 선택

- [ ] 아이콘 클릭 시 `name`, `bg`, `color`가 함께 전달된다.
- [ ] 선택 즉시 부모 아바타가 갱신된다.
- [ ] 아이콘 선택 시 업로드 사진이 제거된다.
- [ ] 선택된 셀에 보라색 ring이 표시된다.
- [ ] hover 시 아이콘 이름이 표시된다.
- [ ] `han:가`가 Material font 이름이 아닌 한글 `가`로 표시된다.
- [ ] 한글 아이콘도 선택·색상 적용·저장이 된다.

### 사진 업로드

- [ ] PNG/JPEG/WebP만 선택할 수 있다.
- [ ] 사진 선택 시 아바타가 사진으로 바뀐다.
- [ ] 사진 선택 시 preset 아이콘이 제거된다.
- [ ] 같은 파일을 다시 선택할 수 있다.
- [ ] 제거 버튼으로 사진이 삭제되고 기본 아바타로 돌아간다.

### 반응형·접근성

- [ ] 데스크톱에서 560px 모달이 중앙에 표시된다.
- [ ] 모바일에서 bottom sheet로 표시된다.
- [ ] 모바일 grid가 6열이다.
- [ ] 데스크톱 grid가 8열이다.
- [ ] 검색창과 버튼에 적절한 accessible name이 있다.
- [ ] 키보드만으로 검색·탭·선택·닫기가 가능하다.
- [ ] 색상 swatch에 `title` 또는 accessible label이 있다.
- [ ] 아이콘 셀에 아이콘 이름이 accessible name으로 노출된다.

---

## 20. 최종 완료 기준

다음 조건을 모두 만족하면 다른 프로젝트에서 동일한 Material Icons 선택 기능이 구현된 것으로 판단합니다.

1. 비서 생성 폼의 `기본 정보`에서 아이콘 선택 영역이 중앙 아바타와 함께 표시된다.
2. `아이콘 선택`과 `사진 업로드` 탭을 전환할 수 있다.
3. Material Icons 선택 모달이 데스크톱·모바일에서 동일한 계층으로 열린다.
4. 검색창에서 영문 이름과 한국어 키워드를 모두 사용할 수 있다.
5. 카테고리 탭과 검색 결과가 서로 일관된다.
6. 10개 배경 색상 팔레트와 전경색이 정확히 적용된다.
7. 색상 변경이 미리보기에 즉시 반영된다.
8. 아이콘 선택 결과에 이름·배경·전경색이 함께 저장된다.
9. `han:` 특수 아이콘이 한글 텍스트로 정상 렌더링된다.
10. 선택한 Material 아이콘과 업로드 사진이 서로 중복 상태가 되지 않는다.
11. 현재 선택값을 다시 열었을 때 아이콘·색상·선택 상태가 복원된다.
12. 검색 결과 없음, hover, 선택, 닫기, 빈 상태가 모두 구현된다.
13. 반응형 grid, bottom sheet, horizontal category scroll이 동작한다.
14. 키보드·스크린리더 접근성 라벨이 제공된다.
15. 비서 저장 API에 `icon.name`, `icon.background`, `icon.color`가 전달된다.

---

## 21. 현재 프로젝트 참고 위치

현재 구현을 직접 확인하거나 데이터까지 그대로 옮길 때 참고할 파일:

```text
artifacts/jpdc-ai/src/components/IconPickerModal.tsx
artifacts/jpdc-ai/src/data/materialIcons.ts
artifacts/jpdc-ai/src/views/AssistantBuilderView.tsx
artifacts/jpdc-ai/src/main.tsx
artifacts/jpdc-ai/src/index.css
```

역할:

- `IconPickerModal.tsx`: 모달 UI, 검색, 카테고리, 색상, grid, 선택 콜백
- `materialIcons.ts`: 카테고리, 전체 아이콘 목록, 한글 검색 맵, 색상 팔레트
- `AssistantBuilderView.tsx`: 비서 생성 폼, 아바타, Material/사진 탭, 부모 상태
- `main.tsx`: Material Icons CSS import
- `index.css`: 라이트·다크·반응형 전역 스타일
# 나만의 비서 — Material Icons 선택 UI 재구축 명세서

> JPDC AI의 `나만의 비서 만들기` 화면에서 사용하는 Material Icons 선택 영역을 다른 프로젝트에서 동일한 동작과 형태로 구현하기 위한 명세서입니다.  
> 문서 기준일: **2026-09-02**  
> 대상 기능: 비서 아이콘 선택, 카테고리 탐색, 영문·한글 검색, 배경 색상 선택, 사진 업로드 탭과의 전환

---

## 1. 기능 목적

비서 생성·수정 폼의 기본 정보 영역에서 사용자가 비서 아바타를 직접 설정합니다.

지원 방식:

1. 로컬 Material Icons 카탈로그에서 아이콘 선택
2. 아이콘 카테고리별 탐색
3. Material Icons 영문 이름 검색
4. 한국어 키워드 검색
5. 아이콘 배경 색상 선택
6. 사진 파일 업로드
7. 현재 선택 아이콘의 실시간 미리보기
8. 선택한 아이콘 또는 업로드한 사진 제거

Material Icons 선택과 사진 업로드는 서로 대체 관계입니다.

```text
Material 아이콘 선택
  → presetThumb 저장
  → logoUrl 제거

사진 업로드
  → logoUrl 저장
  → presetThumb 제거
```

---

## 2. 비서 생성 화면에서의 위치

### 2.1 진입 화면

화면 제목:

- 새로 만들 때: `나만의 비서 만들기`
- 수정할 때: `비서 수정`

기본 정보 섹션의 중앙에 원형 아바타를 배치합니다.

```text
기본 정보

              ┌────────┐
              │  아이콘 │  ← 원형 아바타 미리보기
              └────────┘

       [ 아이콘 선택 | 사진 업로드 ]

       [ Material 아이콘 선택…       ▦ ]

이름       [ 비서 이름 (최대 20자) ]
설명       [ 한 문장 설명 (최대 80자) ]
```

### 2.2 기본 정보 영역 라벨

- `기본 정보`
- `아이콘 선택`
- `사진 업로드`
- 초기 상태 placeholder: `Material 아이콘 선택…`
- 이름 placeholder: `비서 이름 (최대 20자)`
- 설명 placeholder: `한 문장 설명 (최대 80자)`

### 2.3 아바타 기본 상태

선택된 아이콘과 업로드 사진이 모두 없으면 비서 이름 첫 글자를 표시합니다.

- 이름이 있으면 첫 글자를 대문자로 표시
- 이름도 없으면 빈 원형 아바타
- 배경 기본값: `#F4F3FC`
- 아바타 크기: `96px × 96px`
- 원형: `border-radius: 9999px`
- 기본 테두리: `2px dashed #C7C3F7`

선택된 아이콘 또는 사진이 있으면 우측 상단에 제거 버튼을 표시합니다.

- 버튼 크기: 약 `20px × 20px`
- 위치: 아바타 우측 상단 바깥쪽
- 배경: `#DC2626`
- 아이콘: 흰색 X
- 동작: `logoUrl`과 `presetThumb`를 모두 `null`로 초기화

---

## 3. 비서 생성 폼의 아이콘 탭

### 3.1 탭 UI

두 개의 pill 버튼을 사용합니다.

```text
[ 아이콘 선택 ] [ 사진 업로드 ]
```

상태:

```ts
type IconTab = 'bank' | 'upload';
const [iconTab, setIconTab] = useState<IconTab>('bank');
```

초기 탭은 `bank`입니다.

### 3.2 탭 스타일

탭 전체:

- 배경: `#F7F6FD`
- 테두리: `1px solid #E4E2F0`
- 내부 padding: `2px`
- 둥근 모서리: pill

활성 탭:

- 배경: `#FAFAFE`
- 텍스트: `#4F46E5`
- 낮은 그림자

비활성 탭:

- 텍스트: `#A8A6C0`
- hover 시 `#6B6882`

### 3.3 Material 아이콘 진입 버튼

아이콘 선택 탭에서 다음 버튼을 보여 줍니다.

선택 전:

```text
▦  Material 아이콘 선택…  ▦
```

선택 후:

```text
[아이콘]  book  ▦
```

스타일:

- 가로 flex
- `px-4 py-2`
- `rounded-xl`
- 테두리 `#E4E2F0`
- 배경 흰색
- hover 테두리 `#4F46E5`
- hover 배경 `#F7F6FD`
- shadow-sm

동작:

- 클릭하면 Material Icons 선택 모달을 연다.
- 선택된 아이콘 이름은 `_`를 공백으로 바꾸어 표시한다.
- 오른쪽 `grid_view` 아이콘은 모달 진입 affordance로 사용한다.

### 3.4 사진 업로드 탭

버튼 라벨:

```text
사진 업로드
```

허용 형식:

```text
image/png
image/jpeg
image/webp
```

업로드 시:

1. 선택한 파일에서 object URL 생성
2. `logoUrl`에 저장
3. `presetThumb`를 `null`로 설정
4. 파일 input value를 비워 동일 파일 재선택을 허용

---

## 4. Material Icons 모달 레이아웃

### 4.1 모달 기본 구조

```text
┌────────────────────────────────────────────┐
│ 아이콘 선택                         [닫기] │
│ Google Material Icons · N개                │
│                                            │
│ [ 🔍 책, 도서, 설정, 사람… 또는 ... ]       │
│                                            │
│ [전체] [액션] [알림] [미디어] [커뮤니케이션]  │ ← 가로 스크롤
│                                            │
│ 배경 색상 — 클릭하면 아이콘 전체에 즉시 적용됩니다 │
│ ● ● ● ● ● ● ● ● ● ●   [미리보기]          │
│                                            │
│ ─────────────────────────────────────────  │
│                                            │
│       [아이콘] [아이콘] [아이콘] ...        │
│       [아이콘] [아이콘] [아이콘] ...        │ ← 스크롤
│                                            │
│ N개 표시                         [취소] [색상 적용] │
└────────────────────────────────────────────┘
```

### 4.2 데스크톱과 모바일

데스크톱:

- 폭: `560px`
- 높이: viewport의 `88dvh`
- 최대 높이: `88dvh`
- 화면 중앙 정렬
- `rounded-2xl`

모바일:

- 폭: `100%`
- 화면 하단에서 올라오는 bottom sheet
- 위쪽 모서리만 둥글게
- 높이: `88dvh`

공통:

- `position: fixed`
- z-index: `200`
- 배경 overlay: 검정 40% 투명도
- overlay blur: 약 `2px`
- overlay 또는 모달 외부 클릭 시 닫기
- 모달 내부 클릭은 전파 중지

### 4.3 열림·닫힘 상태

```ts
type IconPickerModalProps = {
  open: boolean;
  current: SelectedIcon | null;
  onSelect: (icon: SelectedIcon) => void;
  onClose: () => void;
};
```

`open`이 `false`이면 모달 DOM을 렌더링하지 않습니다.

모달이 열릴 때:

1. 검색어를 빈 문자열로 초기화
2. 현재 아이콘이 있으면 현재 배경 색상과 일치하는 팔레트를 선택
3. 일치하는 색상이 없으면 첫 번째 색상을 사용
4. 약 80ms 뒤 검색창에 focus

카테고리 선택 상태는 기존 선택값을 유지할 수 있습니다. 검색어는 열 때마다 초기화합니다.

---

## 5. 모달 헤더

### 5.1 제목

```text
아이콘 선택
```

### 5.2 설명

```text
Google Material Icons · N개
```

`N`은 하드코딩하지 않고 고유 아이콘 목록의 실제 개수로 계산합니다.

### 5.3 닫기 버튼

- 원형 또는 둥근 버튼
- 크기: 약 `32px`
- 배경: `#F4F3FC`
- hover 배경: `#E9E7FA`
- 아이콘: Lucide `X`
- 클릭 시 `onClose()`

---

## 6. 검색 UI와 검색 규칙

### 6.1 검색창

placeholder:

```text
책, 도서, 설정, 사람… 또는 book, person, home…
```

스타일:

- 좌측 검색 아이콘
- 둥근 모서리
- 배경: `#F7F6FD`
- 테두리: `#E4E2F0`
- focus 시 테두리: `#4F46E5`
- 입력 텍스트: `14px`
- clear 버튼은 검색어가 있을 때만 표시

### 6.2 카테고리 필터와 검색의 관계

검색은 현재 선택된 카테고리의 아이콘 안에서만 수행합니다.

```ts
const base =
  activeCategory === 'all'
    ? ALL_ICONS
    : ICON_CATEGORIES.find(c => c.id === activeCategory)?.icons ?? [];
```

검색어가 비어 있으면 `base` 전체를 표시합니다.

### 6.3 영문 검색

영문 또는 비한글 검색어는 다음과 같이 처리합니다.

1. trim
2. 소문자 변환
3. 공백을 underscore로 변환
4. 아이콘 이름에 검색어가 포함되는지 비교

```ts
const normalized = query.trim().toLowerCase().replace(/\s+/g, '_');
const result = base.filter(name => name.includes(normalized));
```

예시:

| 입력 | 매칭 예 |
|---|---|
| `book` | `book`, `menu_book`, `library_books` |
| `person` | `person`, `person_add`, `person_outline` |
| `arrow right` | `arrow_right`, `arrow_right_alt` |
| `home` | `home`, `home_work` 등 |

### 6.4 한글 검색

한글 검색은 영문 아이콘 이름을 직접 비교하지 않고 키워드 매핑을 사용합니다.

예시:

```ts
const KOREAN_ICON_MAP = {
  홈: ['home', 'house', 'apartment', 'dashboard'],
  사람: ['person', 'account_circle', 'account_box', 'face'],
  검색: ['search', 'find_in_page', 'find_replace', 'manage_search', 'pageview'],
  문서: ['description', 'article', 'subject', 'text_snippet', 'assignment'],
  설정: ['settings', 'settings_applications', 'tune', 'build', 'manage_accounts'],
  분석: ['assessment', 'analytics', 'bar_chart', 'pie_chart', 'show_chart'],
  사진: ['photo', 'image', 'photo_library', 'collections', 'camera_alt'],
  번역: ['translate', 'language', 'g_translate', 'interpreter_mode'],
};
```

매핑은 부분 일치를 지원합니다.

```ts
if (keyword.includes(query) || query.includes(keyword)) {
  // 해당 키워드의 seed 아이콘 추가
}
```

각 seed 아이콘에 대해:

1. seed 자체를 결과에 추가
2. 전체 아이콘 목록에서 seed 문자열을 포함하는 아이콘도 추가
3. Set으로 중복 제거
4. 현재 카테고리의 `base` 목록으로 최종 필터링

```ts
function searchByKorean(query: string): Set<string> {
  const q = query.trim();
  if (!q) return new Set();

  const result = new Set<string>();
  for (const [keyword, icons] of Object.entries(KOREAN_ICON_MAP)) {
    if (keyword.includes(q) || q.includes(keyword)) {
      icons.forEach(seed => {
        result.add(seed);
        ALL_ICONS.forEach(icon => {
          if (icon.includes(seed)) result.add(icon);
        });
      });
    }
  }
  return result;
}
```

### 6.5 검색 결과 없음

검색 결과가 없으면 아이콘 grid 대신 중앙 empty state를 표시합니다.

- 아이콘: Material `search_off`
- 텍스트: `"{검색어}" 검색 결과 없음`
- 세로 여백: 약 `48px`

---

## 7. 카테고리 탭

카테고리 탭은 가로로 넘칠 수 있으므로 horizontal scroll을 사용합니다. 스크롤바는 숨깁니다.

표시 순서:

1. `전체 (N)`
2. `액션`
3. `알림`
4. `미디어`
5. `커뮤니케이션`
6. `콘텐츠`
7. `기기`
8. `에디터`
9. `파일`
10. `하드웨어`
11. `이미지`
12. `지도`
13. `내비게이션`
14. `알림판`
15. `장소`
16. `소셜`
17. `토글`
18. `가나다`

카테고리 데이터 형식:

```ts
type IconCategory = {
  id: string;
  label: string;
  icons: string[];
};
```

특수 카테고리:

- `id: 'all'`
- `label: 전체 (N)`
- 실제 배열은 모든 카테고리의 아이콘을 flatMap하고 Set으로 중복 제거한 `ALL_ICONS`

탭 스타일:

활성:

- 배경: `#4F46E5`
- 글자: 흰색
- shadow-sm

비활성:

- 배경: `#F4F3FC`
- 글자: `#6B6882`
- hover 배경: `#E9E7FA`

---

## 8. 배경 색상 팔레트

### 8.1 색상 데이터

색상은 배경과 아이콘 전경색을 한 쌍으로 저장합니다.

```ts
type IconColor = {
  bg: string;
  color: string;
  label: string;
};
```

정확한 팔레트:

| 라벨 | 배경 `bg` | 아이콘 `color` |
|---|---|---|
| 파랑 | `#EEF5FF` | `#3B5BDB` |
| 초록 | `#F0FDF4` | `#2F9E44` |
| 보라 | `#F5F3FF` | `#6741D9` |
| 주황 | `#FFF7ED` | `#E8590C` |
| 분홍 | `#FDF2F8` | `#C2255C` |
| 노랑 | `#FFFBEB` | `#E67700` |
| 청록 | `#F0FDFA` | `#0C8599` |
| 빨강 | `#FFF1F2` | `#C92A2A` |
| 회색 | `#F1F5F9` | `#475569` |
| 다크 | `#1A1826` | `#FFFFFF` |

첫 번째 색상 `파랑`을 기본값으로 사용합니다.

### 8.2 팔레트 UI

설명:

```text
배경 색상 — 클릭하면 아이콘 전체에 즉시 적용됩니다
```

동작:

- 색상 원형 swatch를 클릭하면 `pickedColor`가 변경된다.
- 선택된 swatch는 보라색 ring과 ring offset을 가진다.
- 선택 시 약간 확대된다.
- 각 swatch의 `title`은 색상 라벨이다.
- 다크 색상은 내부에 흰색 점을 표시해 색상을 인지하게 한다.

크기:

- swatch: `28px × 28px`
- 간격: 약 `6px`
- 작은 화면에서는 wrap

### 8.3 적용 타이밍

색상은 두 가지 방식으로 적용됩니다.

#### 아이콘을 새로 선택하는 경우

사용자가 grid에서 아이콘을 클릭하면 현재 `pickedColor`와 함께 부모에 즉시 전달합니다.

```ts
onSelect({
  name,
  bg: pickedColor.bg,
  color: pickedColor.color,
});
```

#### 이미 선택한 아이콘의 색상만 바꾸는 경우

현재 아이콘이 있을 때 색상만 바꿔도 모달 미리보기는 즉시 바뀝니다. 부모 상태에 최종 적용하려면 footer의 `색상 적용` 버튼을 사용합니다.

```ts
onSelect({
  name: current.name,
  bg: pickedColor.bg,
  color: pickedColor.color,
});
```

현재 아이콘이 없으면 `색상 적용` 버튼을 숨깁니다.

---

## 9. 실시간 미리보기

색상 팔레트 오른쪽에 미리보기 카드를 배치합니다.

구성:

- 작은 아이콘 박스: `36px × 36px`
- 선택한 `pickedColor.bg`
- 아이콘 색상: `pickedColor.color`
- 색상 라벨
- `미리보기`

표시 아이콘:

- 현재 선택 아이콘이 없으면 `smart_toy`
- 현재 아이콘이 Material Icons면 `<span class="material-icons">`
- 한글 특수 아이콘이면 일반 Material font 대신 한글 문자를 텍스트로 표시

```ts
function isHanIcon(name: string) {
  return name.startsWith('han:');
}

function getHanChar(name: string) {
  return name.slice(4);
}
```

예:

```text
han:가 → 가
han:나 → 나
```

미리보기 크기:

- Material icon: 약 `22px`
- 한글 아이콘: 약 `22px`, bold

---

## 10. 아이콘 grid

### 10.1 레이아웃

- 세로로 스크롤되는 영역
- 좌우 padding: 약 `16px`
- 위아래 padding: 약 `12px`
- grid gap: 약 `6px`
- 모바일: 6열
- `sm` 이상: 8열
- 각 셀: 정사각형
- 각 셀: `aspect-ratio: 1 / 1`
- 둥근 모서리: `rounded-xl`

```css
.icon-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 6px;
}

@media (min-width: 640px) {
  .icon-grid {
    grid-template-columns: repeat(8, minmax(0, 1fr));
  }
}
```

### 10.2 아이콘 셀

각 아이콘 셀의 배경은 현재 선택한 `pickedColor.bg`를 사용합니다.

Material icon:

- 클래스: `material-icons`
- 크기: 약 `23px`
- 색상: `pickedColor.color`

한글 아이콘:

- `han:` prefix 제거 후 문자 출력
- 크기: 약 `26px`
- bold
- 색상: `pickedColor.color`

### 10.3 선택 상태

현재 선택된 아이콘은 `current?.name === name`으로 비교합니다.

선택 상태:

- 보라색 `2px` ring
- ring offset `1px`
- 약간 확대 `scale(1.05)`

일반 hover:

- 약간 확대
- `1px` 보라색 ring
- ring offset `1px`

### 10.4 아이콘 이름 tooltip

hover 중인 셀에만 아이콘 이름을 표시합니다.

- `_`는 공백으로 변경
- 배경: `#1A1826`
- 글자: 흰색
- 글자 크기: `10px`
- 아이콘 셀 아래쪽에 absolute 배치
- `pointer-events: none`
- z-index를 grid보다 높게 설정

예:

```text
account_balance_wallet → account balance wallet
```

모바일에서는 hover가 없으므로 title attribute만으로 대체할 수 있습니다.

---

## 11. Footer

### 11.1 표시 개수

왼쪽에 현재 필터 결과 수를 표시합니다.

```text
N개 표시
```

`displayedIcons.length.toLocaleString()`을 사용합니다.

### 11.2 버튼

오른쪽 버튼:

- `취소`
- `색상 적용` — 현재 아이콘이 있을 때만 표시

`취소`:

- 변경된 선택을 부모에 적용하지 않고 모달을 닫는 정책으로 구현할 수 있다.
- 현재 구현과 완전히 같게 유지하려면, 이미 grid 아이콘을 클릭한 선택은 즉시 부모에 전달되므로 `취소`는 모달 닫기만 수행한다는 점을 명시해야 한다.

`색상 적용`:

- 현재 아이콘 이름은 유지
- 현재 선택 색상만 부모에 전달
- 모달 닫힘

Footer:

- 위쪽 테두리
- 연한 회색 배경 `#FAFAFA`
- 좌우 padding 약 `20px`
- 세로 padding 약 `12px`

---

## 12. 선택 결과 데이터 계약

아이콘 선택 결과는 다음 세 필드만으로 충분합니다.

```ts
type SelectedIcon = {
  name: string;
  bg: string;
  color: string;
};
```

예시:

```json
{
  "name": "menu_book",
  "bg": "#F5F3FF",
  "color": "#6741D9"
}
```

한글 특수 아이콘:

```json
{
  "name": "han:가",
  "bg": "#EEF5FF",
  "color": "#3B5BDB"
}
```

비서 저장 모델에 포함할 때:

```ts
type AssistantIcon = {
  name: string;
  background: string;
  color: string;
};
```

API 요청 예:

```json
{
  "icon": {
    "name": "menu_book",
    "background": "#F5F3FF",
    "color": "#6741D9"
  }
}
```

---

## 13. Material Icons 로딩

Material Icons font를 앱 진입점에서 한 번 로드합니다.

현재 방식:

```ts
import 'material-icons/iconfont/material-icons.css';
```

렌더링:

```tsx
<span className="material-icons">menu_book</span>
```

주의:

- `name`을 SVG path로 해석하지 않는다.
- Material Icons font 이름을 그대로 텍스트 노드로 전달한다.
- `han:가`처럼 실제 Material Icons에 없는 값은 font로 렌더링하지 않는다.
- `han:` 값은 반드시 별도의 텍스트 분기로 처리한다.
- Material Icons CSS가 로드되지 않으면 아이콘 이름이 글자로 보이므로 앱 초기화 단계에서 로드 여부를 확인한다.

---

## 14. 아이콘 카탈로그 데이터

아이콘 카탈로그는 서버 검색에 의존하지 않고 로컬 정적 데이터로 유지합니다. 다른 프로젝트로 옮길 때는 다음 원칙을 지킵니다.

### 14.1 카테고리 배열

```ts
export const ICON_CATEGORIES: IconCategory[] = [
  { id: 'action', label: '액션', icons: [...] },
  { id: 'alert', label: '알림', icons: [...] },
  { id: 'av', label: '미디어', icons: [...] },
  { id: 'communication', label: '커뮤니케이션', icons: [...] },
  { id: 'content', label: '콘텐츠', icons: [...] },
  { id: 'device', label: '기기', icons: [...] },
  { id: 'editor', label: '에디터', icons: [...] },
  { id: 'file', label: '파일', icons: [...] },
  { id: 'hardware', label: '하드웨어', icons: [...] },
  { id: 'image', label: '이미지', icons: [...] },
  { id: 'maps', label: '지도', icons: [...] },
  { id: 'navigation', label: '내비게이션', icons: [...] },
  { id: 'notification', label: '알림판', icons: [...] },
  { id: 'places', label: '장소', icons: [...] },
  { id: 'social', label: '소셜', icons: [...] },
  { id: 'toggle', label: '토글', icons: [...] },
  { id: 'korean', label: '가나다', icons: [...] },
];
```

### 14.2 전체 목록

카테고리별 배열에 중복이 있을 수 있으므로 전체 목록은 다음처럼 계산합니다.

```ts
export const ALL_ICONS = [
  ...new Set(ICON_CATEGORIES.flatMap(category => category.icons)),
];
```

### 14.3 가나다 아이콘

Material Icons에 한글 글리프를 포함시키기 위해 다음 특수 이름을 추가합니다.

```text
han:가
han:나
han:다
han:라
han:마
han:바
han:사
han:아
han:자
han:차
han:카
han:타
han:파
han:하
```

이 값들은 Material font 이름이 아니며, 화면에서는 `가`, `나`, `다`와 같은 일반 텍스트로 렌더링합니다.

### 14.4 한글 키워드 맵

동일한 검색 결과를 보장하려면 `KOREAN_ICON_MAP`도 함께 이식해야 합니다. 최소한 다음 그룹을 포함합니다.

```text
일반: 홈, 집, 건물, 사무실
사람: 사람, 사용자, 인물, 팀, 그룹, 프로필
탐색: 검색, 찾기, 탐색
커뮤니케이션: 메일, 이메일, 채팅, 메시지, 전화, 알림, 공지
파일·문서: 파일, 폴더, 문서, 서류, 보고서, 메모, 노트
책·교육: 책, 도서, 교육, 학교
설정·도구: 설정, 도구, 편집, 수정
보안: 보안, 잠금, 비밀번호, 인증
저장·전송: 저장, 업로드, 다운로드, 공유, 전송
추가·삭제: 추가, 삭제, 제거, 취소, 완료, 확인
미디어: 사진, 이미지, 카메라, 동영상, 비디오, 음악, 재생, 정지
데이터: 데이터, 분석, 통계, 차트, 그래프, 대시보드
지도·교통: 지도, 위치, 주소, 비행기, 자동차, 기차, 지하철, 버스, 자전거
금융: 결제, 돈, 금액, 은행, 지갑, 쇼핑
음식·날씨: 음식, 식당, 커피, 음료, 날씨, 태양, 구름, 비
기기: 핸드폰, 스마트폰, 컴퓨터, 노트북, 태블릿, 헤드폰, 키보드, 마우스
인터페이스: 메뉴, 목록, 그리드, 더보기, 화살표, 새로고침, 링크, 필터, 정렬
평가: 즐겨찾기, 북마크, 별, 하트, 좋아요, 싫어요
개발·글쓰기: 코드, 개발, 버그, 글쓰기, 작성, 번역, 언어
날짜·시간: 달력, 일정, 시계, 시간, 날짜
기타: 병원, 의료, 건강, 운동, 선물, 파티, 전구, 아이디어, 지구,
      인쇄, 복사, 로그인, 로그아웃, 관리자, 광고, 뉴스, 실시간,
      태그, 카테고리, 통화, 회의, 발표, 게임, 지원, 정책, 법률, 계약
```

정확한 결과가 중요하면 위 그룹 설명만 재작성하지 말고, 원본 매핑 배열의 seed 아이콘 목록도 그대로 복사합니다.

---

## 15. 상태와 이벤트 설계

### 15.1 모달 상태

```ts
const [search, setSearch] = useState('');
const [activeCategory, setActiveCategory] = useState('all');
const [pickedColor, setPickedColor] = useState(ICON_BG_COLORS[0]);
const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
```

### 15.2 상태 전이

```text
비서 생성 폼
  → 아이콘 선택 버튼 클릭
  → 모달 열림
  → 검색·카테고리·색상 조작
  → 아이콘 클릭
  → 부모의 presetThumb 갱신
  → logoUrl 제거
  → 모달 닫힘
```

색상 변경만 하는 경우:

```text
모달 열림
  → 현재 아이콘 확인
  → 색상 swatch 클릭
  → 미리보기 갱신
  → 색상 적용 클릭
  → 부모의 bg/color 갱신
  → 모달 닫힘
```

### 15.3 부모 콜백

```tsx
<IconPickerModal
  open={iconPickerOpen}
  current={presetThumb}
  onSelect={icon => {
    setPresetThumb(icon);
    setLogoUrl(null);
    setIconPickerOpen(false);
  }}
  onClose={() => setIconPickerOpen(false)}
/>
```

### 15.4 부모·모달 책임 분리

모달 책임:

- 검색
- 카테고리
- 색상
- 현재 선택 표시
- 아이콘 렌더링
- 선택 결과 생성

부모 폼 책임:

- `presetThumb` 저장
- 업로드 사진과의 상호 배제
- 비서 아바타 표시
- 선택 제거
- 비서 저장 API에 icon 데이터 포함

---

## 16. 다크모드와 반응형 구현

### 16.1 다크모드

다크모드에서 반드시 확인할 항목:

- 흰색 모달 표면이 어두운 표면으로 바뀌는지
- 입력창 placeholder가 읽히는지
- 선택 보라색 ring이 보이는지
- 다크 색상 swatch와 흰색 아이콘이 구분되는지
- grid의 색상 배경이 의미를 잃지 않는지
- tooltip이 배경과 겹치지 않는지

권장 다크 표면:

```text
body: #0F0D1A
modal: #0F0D1A 또는 #1A1726
secondary surface: #252237
border: #4A4870
primary text: #F2F0FF
secondary text: #C0BEDC
primary accent: #A8A5FF
```

### 16.2 모바일

- 모달은 bottom sheet
- grid 6열
- 카테고리 탭은 가로 스크롤
- 검색창은 모달 폭 전체 사용
- 색상 팔레트는 wrap
- footer 버튼은 화면 안에서 줄어들지 않도록 한다.
- 아이콘 이름 tooltip에 의존하지 않고 `title`을 제공한다.
- 모달 body만 세로 스크롤되고 header·search·category·color·footer는 고정 영역으로 둔다.

---

## 17. 구현 시 주의할 점

### 17.1 `han:` 아이콘을 Material font로 렌더링하지 않기

잘못된 구현:

```tsx
<span className="material-icons">{name}</span>
```

`name`이 `han:가`이면 Material font가 해당 글리프를 찾지 못합니다.

올바른 구현:

```tsx
{isHanIcon(name) ? (
  <span style={{ color }}>{getHanChar(name)}</span>
) : (
  <span className="material-icons" style={{ color }}>{name}</span>
)}
```

비서 생성 폼의 아바타, 진입 버튼, 모달 미리보기, grid 모두 같은 분기 함수를 사용합니다.

### 17.2 진입 버튼도 한글 아이콘을 별도 렌더링

선택된 아이콘을 진입 버튼에 표시할 때도 `han:` 값을 그대로 Material font에 넣지 않습니다.

### 17.3 현재 선택 색상 동기화

모달이 다시 열릴 때 `current.bg`와 팔레트의 `bg`를 비교해 같은 색상을 선택해야 합니다. 동기화하지 않으면 현재 아이콘과 다른 색상으로 미리보기가 시작됩니다.

### 17.4 카테고리 결과와 전체 결과의 일관성

한글 검색으로 seed를 찾았더라도 최종 결과는 반드시 현재 카테고리 `base`에 한정합니다. 그렇지 않으면 카테고리 탭을 선택한 의미가 사라집니다.

### 17.5 저장 데이터에는 이름·배경·전경색을 모두 저장

아이콘 이름만 저장하면 사용자가 선택한 색상을 복원할 수 없습니다.

```text
name + bg + color
```

세 필드를 함께 저장합니다.

### 17.6 사진과 preset 아이콘의 상호 배제

사진 업로드 후에도 이전 아이콘이 남아 있으면 어떤 것이 실제 아바타인지 모호해집니다. 하나를 선택하면 다른 하나를 `null`로 지웁니다.

---

## 18. 권장 컴포넌트 구조

```text
AssistantBuilderView
├── AssistantAvatar
├── IconSourceTabs
│   ├── MaterialIconTrigger
│   └── PhotoUploadButton
└── IconPickerModal
    ├── IconPickerHeader
    ├── IconSearchInput
    ├── IconCategoryTabs
    ├── IconColorPicker
    │   └── IconLivePreview
    ├── IconGrid
    │   └── IconGridItem
    └── IconPickerFooter
```

데이터 파일:

```text
data/materialIcons.ts
```

내보낼 값:

```ts
IconCategory
ICON_CATEGORIES
ALL_ICONS
KOREAN_ICON_MAP
searchByKorean
isHanIcon
getHanChar
ICON_BG_COLORS
```

---

## 19. 테스트 체크리스트

### 진입·닫기

- [ ] `아이콘 선택` 탭이 기본 활성화된다.
- [ ] `Material 아이콘 선택…` 버튼을 클릭하면 모달이 열린다.
- [ ] X 버튼으로 닫힌다.
- [ ] overlay 클릭으로 닫힌다.
- [ ] 모달 내부 클릭이 닫기 이벤트를 발생시키지 않는다.
- [ ] `Escape`로 닫을 수 있다.
- [ ] 모달이 열릴 때 검색창에 focus된다.

### 검색

- [ ] 검색어가 없으면 현재 카테고리 전체가 표시된다.
- [ ] `book` 검색이 동작한다.
- [ ] 공백이 underscore 검색으로 정규화된다.
- [ ] `책` 검색이 영문 아이콘 결과를 보여 준다.
- [ ] `사람`, `문서`, `설정`, `분석`, `사진` 검색이 동작한다.
- [ ] 한글 검색이 현재 카테고리 범위를 벗어나지 않는다.
- [ ] 검색어를 지울 수 있다.
- [ ] 검색 결과가 없으면 `"{검색어}" 검색 결과 없음`이 표시된다.

### 카테고리

- [ ] `전체 (N)` 개수가 실제 고유 목록과 일치한다.
- [ ] 카테고리 선택 시 grid가 갱신된다.
- [ ] 카테고리 탭은 모바일에서 가로 스크롤된다.
- [ ] `가나다` 카테고리가 표시된다.
- [ ] 동일 아이콘이 여러 카테고리에 있어도 전체 목록에서는 중복되지 않는다.

### 색상

- [ ] 10개 색상이 정확한 배경·전경색으로 표시된다.
- [ ] 색상 선택 시 ring과 확대 상태가 보인다.
- [ ] 색상 선택 즉시 미리보기가 바뀐다.
- [ ] 현재 아이콘이 있을 때 `색상 적용` 버튼이 보인다.
- [ ] 현재 아이콘이 없을 때 `색상 적용` 버튼이 숨겨진다.
- [ ] 다크 색상 swatch 내부 흰색 점이 보인다.
- [ ] 재진입 시 현재 아이콘의 색상이 복원된다.

### 아이콘 선택

- [ ] 아이콘 클릭 시 `name`, `bg`, `color`가 함께 전달된다.
- [ ] 선택 즉시 부모 아바타가 갱신된다.
- [ ] 아이콘 선택 시 업로드 사진이 제거된다.
- [ ] 선택된 셀에 보라색 ring이 표시된다.
- [ ] hover 시 아이콘 이름이 표시된다.
- [ ] `han:가`가 Material font 이름이 아닌 한글 `가`로 표시된다.
- [ ] 한글 아이콘도 선택·색상 적용·저장이 된다.

### 사진 업로드

- [ ] PNG/JPEG/WebP만 선택할 수 있다.
- [ ] 사진 선택 시 아바타가 사진으로 바뀐다.
- [ ] 사진 선택 시 preset 아이콘이 제거된다.
- [ ] 같은 파일을 다시 선택할 수 있다.
- [ ] 제거 버튼으로 사진이 삭제되고 기본 아바타로 돌아간다.

### 반응형·접근성

- [ ] 데스크톱에서 560px 모달이 중앙에 표시된다.
- [ ] 모바일에서 bottom sheet로 표시된다.
- [ ] 모바일 grid가 6열이다.
- [ ] 데스크톱 grid가 8열이다.
- [ ] 검색창과 버튼에 적절한 accessible name이 있다.
- [ ] 키보드만으로 검색·탭·선택·닫기가 가능하다.
- [ ] 색상 swatch에 `title` 또는 accessible label이 있다.
- [ ] 아이콘 셀에 아이콘 이름이 accessible name으로 노출된다.

---

## 20. 최종 완료 기준

다음 조건을 모두 만족하면 다른 프로젝트에서 동일한 Material Icons 선택 기능이 구현된 것으로 판단합니다.

1. 비서 생성 폼의 `기본 정보`에서 아이콘 선택 영역이 중앙 아바타와 함께 표시된다.
2. `아이콘 선택`과 `사진 업로드` 탭을 전환할 수 있다.
3. Material Icons 선택 모달이 데스크톱·모바일에서 동일한 계층으로 열린다.
4. 검색창에서 영문 이름과 한국어 키워드를 모두 사용할 수 있다.
5. 카테고리 탭과 검색 결과가 서로 일관된다.
6. 10개 배경 색상 팔레트와 전경색이 정확히 적용된다.
7. 색상 변경이 미리보기에 즉시 반영된다.
8. 아이콘 선택 결과에 이름·배경·전경색이 함께 저장된다.
9. `han:` 특수 아이콘이 한글 텍스트로 정상 렌더링된다.
10. 선택한 Material 아이콘과 업로드 사진이 서로 중복 상태가 되지 않는다.
11. 현재 선택값을 다시 열었을 때 아이콘·색상·선택 상태가 복원된다.
12. 검색 결과 없음, hover, 선택, 닫기, 빈 상태가 모두 구현된다.
13. 반응형 grid, bottom sheet, horizontal category scroll이 동작한다.
14. 키보드·스크린리더 접근성 라벨이 제공된다.
15. 비서 저장 API에 `icon.name`, `icon.background`, `icon.color`가 전달된다.

---

## 21. 현재 프로젝트 참고 위치

현재 구현을 직접 확인하거나 데이터까지 그대로 옮길 때 참고할 파일:

```text
artifacts/jpdc-ai/src/components/IconPickerModal.tsx
artifacts/jpdc-ai/src/data/materialIcons.ts
artifacts/jpdc-ai/src/views/AssistantBuilderView.tsx
artifacts/jpdc-ai/src/main.tsx
artifacts/jpdc-ai/src/index.css
```

역할:

- `IconPickerModal.tsx`: 모달 UI, 검색, 카테고리, 색상, grid, 선택 콜백
- `materialIcons.ts`: 카테고리, 전체 아이콘 목록, 한글 검색 맵, 색상 팔레트
- `AssistantBuilderView.tsx`: 비서 생성 폼, 아바타, Material/사진 탭, 부모 상태
- `main.tsx`: Material Icons CSS import
- `index.css`: 라이트·다크·반응형 전역 스타일
# 나만의 비서 — Material Icons 선택 UI 재구축 명세서

> JPDC AI의 `나만의 비서 만들기` 화면에서 사용하는 Material Icons 선택 영역을 다른 프로젝트에서 동일한 동작과 형태로 구현하기 위한 명세서입니다.  
> 문서 기준일: **2026-09-02**  
> 대상 기능: 비서 아이콘 선택, 카테고리 탐색, 영문·한글 검색, 배경 색상 선택, 사진 업로드 탭과의 전환

---

## 1. 기능 목적

비서 생성·수정 폼의 기본 정보 영역에서 사용자가 비서 아바타를 직접 설정합니다.

지원 방식:

1. 로컬 Material Icons 카탈로그에서 아이콘 선택
2. 아이콘 카테고리별 탐색
3. Material Icons 영문 이름 검색
4. 한국어 키워드 검색
5. 아이콘 배경 색상 선택
6. 사진 파일 업로드
7. 현재 선택 아이콘의 실시간 미리보기
8. 선택한 아이콘 또는 업로드한 사진 제거

Material Icons 선택과 사진 업로드는 서로 대체 관계입니다.

```text
Material 아이콘 선택
  → presetThumb 저장
  → logoUrl 제거

사진 업로드
  → logoUrl 저장
  → presetThumb 제거
```

---

## 2. 비서 생성 화면에서의 위치

### 2.1 진입 화면

화면 제목:

- 새로 만들 때: `나만의 비서 만들기`
- 수정할 때: `비서 수정`

기본 정보 섹션의 중앙에 원형 아바타를 배치합니다.

```text
기본 정보

              ┌────────┐
              │  아이콘 │  ← 원형 아바타 미리보기
              └────────┘

       [ 아이콘 선택 | 사진 업로드 ]

       [ Material 아이콘 선택…       ▦ ]

이름       [ 비서 이름 (최대 20자) ]
설명       [ 한 문장 설명 (최대 80자) ]
```

### 2.2 기본 정보 영역 라벨

- `기본 정보`
- `아이콘 선택`
- `사진 업로드`
- 초기 상태 placeholder: `Material 아이콘 선택…`
- 이름 placeholder: `비서 이름 (최대 20자)`
- 설명 placeholder: `한 문장 설명 (최대 80자)`

### 2.3 아바타 기본 상태

선택된 아이콘과 업로드 사진이 모두 없으면 비서 이름 첫 글자를 표시합니다.

- 이름이 있으면 첫 글자를 대문자로 표시
- 이름도 없으면 빈 원형 아바타
- 배경 기본값: `#F4F3FC`
- 아바타 크기: `96px × 96px`
- 원형: `border-radius: 9999px`
- 기본 테두리: `2px dashed #C7C3F7`

선택된 아이콘 또는 사진이 있으면 우측 상단에 제거 버튼을 표시합니다.

- 버튼 크기: 약 `20px × 20px`
- 위치: 아바타 우측 상단 바깥쪽
- 배경: `#DC2626`
- 아이콘: 흰색 X
- 동작: `logoUrl`과 `presetThumb`를 모두 `null`로 초기화

---

## 3. 비서 생성 폼의 아이콘 탭

### 3.1 탭 UI

두 개의 pill 버튼을 사용합니다.

```text
[ 아이콘 선택 ] [ 사진 업로드 ]
```

상태:

```ts
type IconTab = 'bank' | 'upload';
const [iconTab, setIconTab] = useState<IconTab>('bank');
```

초기 탭은 `bank`입니다.

### 3.2 탭 스타일

탭 전체:

- 배경: `#F7F6FD`
- 테두리: `1px solid #E4E2F0`
- 내부 padding: `2px`
- 둥근 모서리: pill

활성 탭:

- 배경: `#FAFAFE`
- 텍스트: `#4F46E5`
- 낮은 그림자

비활성 탭:

- 텍스트: `#A8A6C0`
- hover 시 `#6B6882`

### 3.3 Material 아이콘 진입 버튼

아이콘 선택 탭에서 다음 버튼을 보여 줍니다.

선택 전:

```text
▦  Material 아이콘 선택…  ▦
```

선택 후:

```text
[아이콘]  book  ▦
```

스타일:

- 가로 flex
- `px-4 py-2`
- `rounded-xl`
- 테두리 `#E4E2F0`
- 배경 흰색
- hover 테두리 `#4F46E5`
- hover 배경 `#F7F6FD`
- shadow-sm

동작:

- 클릭하면 Material Icons 선택 모달을 연다.
- 선택된 아이콘 이름은 `_`를 공백으로 바꾸어 표시한다.
- 오른쪽 `grid_view` 아이콘은 모달 진입 affordance로 사용한다.

### 3.4 사진 업로드 탭

버튼 라벨:

```text
사진 업로드
```

허용 형식:

```text
image/png
image/jpeg
image/webp
```

업로드 시:

1. 선택한 파일에서 object URL 생성
2. `logoUrl`에 저장
3. `presetThumb`를 `null`로 설정
4. 파일 input value를 비워 동일 파일 재선택을 허용

---

## 4. Material Icons 모달 레이아웃

### 4.1 모달 기본 구조

```text
┌────────────────────────────────────────────┐
│ 아이콘 선택                         [닫기] │
│ Google Material Icons · N개                │
│                                            │
│ [ 🔍 책, 도서, 설정, 사람… 또는 ... ]       │
│                                            │
│ [전체] [액션] [알림] [미디어] [커뮤니케이션]  │ ← 가로 스크롤
│                                            │
│ 배경 색상 — 클릭하면 아이콘 전체에 즉시 적용됩니다 │
│ ● ● ● ● ● ● ● ● ● ●   [미리보기]          │
│                                            │
│ ─────────────────────────────────────────  │
│                                            │
│       [아이콘] [아이콘] [아이콘] ...        │
│       [아이콘] [아이콘] [아이콘] ...        │ ← 스크롤
│                                            │
│ N개 표시                         [취소] [색상 적용] │
└────────────────────────────────────────────┘
```

### 4.2 데스크톱과 모바일

데스크톱:

- 폭: `560px`
- 높이: viewport의 `88dvh`
- 최대 높이: `88dvh`
- 화면 중앙 정렬
- `rounded-2xl`

모바일:

- 폭: `100%`
- 화면 하단에서 올라오는 bottom sheet
- 위쪽 모서리만 둥글게
- 높이: `88dvh`

공통:

- `position: fixed`
- z-index: `200`
- 배경 overlay: 검정 40% 투명도
- overlay blur: 약 `2px`
- overlay 또는 모달 외부 클릭 시 닫기
- 모달 내부 클릭은 전파 중지

### 4.3 열림·닫힘 상태

```ts
type IconPickerModalProps = {
  open: boolean;
  current: SelectedIcon | null;
  onSelect: (icon: SelectedIcon) => void;
  onClose: () => void;
};
```

`open`이 `false`이면 모달 DOM을 렌더링하지 않습니다.

모달이 열릴 때:

1. 검색어를 빈 문자열로 초기화
2. 현재 아이콘이 있으면 현재 배경 색상과 일치하는 팔레트를 선택
3. 일치하는 색상이 없으면 첫 번째 색상을 사용
4. 약 80ms 뒤 검색창에 focus

카테고리 선택 상태는 기존 선택값을 유지할 수 있습니다. 검색어는 열 때마다 초기화합니다.

---

## 5. 모달 헤더

### 5.1 제목

```text
아이콘 선택
```

### 5.2 설명

```text
Google Material Icons · N개
```

`N`은 하드코딩하지 않고 고유 아이콘 목록의 실제 개수로 계산합니다.

### 5.3 닫기 버튼

- 원형 또는 둥근 버튼
- 크기: 약 `32px`
- 배경: `#F4F3FC`
- hover 배경: `#E9E7FA`
- 아이콘: Lucide `X`
- 클릭 시 `onClose()`

---

## 6. 검색 UI와 검색 규칙

### 6.1 검색창

placeholder:

```text
책, 도서, 설정, 사람… 또는 book, person, home…
```

스타일:

- 좌측 검색 아이콘
- 둥근 모서리
- 배경: `#F7F6FD`
- 테두리: `#E4E2F0`
- focus 시 테두리: `#4F46E5`
- 입력 텍스트: `14px`
- clear 버튼은 검색어가 있을 때만 표시

### 6.2 카테고리 필터와 검색의 관계

검색은 현재 선택된 카테고리의 아이콘 안에서만 수행합니다.

```ts
const base =
  activeCategory === 'all'
    ? ALL_ICONS
    : ICON_CATEGORIES.find(c => c.id === activeCategory)?.icons ?? [];
```

검색어가 비어 있으면 `base` 전체를 표시합니다.

### 6.3 영문 검색

영문 또는 비한글 검색어는 다음과 같이 처리합니다.

1. trim
2. 소문자 변환
3. 공백을 underscore로 변환
4. 아이콘 이름에 검색어가 포함되는지 비교

```ts
const normalized = query.trim().toLowerCase().replace(/\s+/g, '_');
const result = base.filter(name => name.includes(normalized));
```

예시:

| 입력 | 매칭 예 |
|---|---|
| `book` | `book`, `menu_book`, `library_books` |
| `person` | `person`, `person_add`, `person_outline` |
| `arrow right` | `arrow_right`, `arrow_right_alt` |
| `home` | `home`, `home_work` 등 |

### 6.4 한글 검색

한글 검색은 영문 아이콘 이름을 직접 비교하지 않고 키워드 매핑을 사용합니다.

예시:

```ts
const KOREAN_ICON_MAP = {
  홈: ['home', 'house', 'apartment', 'dashboard'],
  사람: ['person', 'account_circle', 'account_box', 'face'],
  검색: ['search', 'find_in_page', 'find_replace', 'manage_search', 'pageview'],
  문서: ['description', 'article', 'subject', 'text_snippet', 'assignment'],
  설정: ['settings', 'settings_applications', 'tune', 'build', 'manage_accounts'],
  분석: ['assessment', 'analytics', 'bar_chart', 'pie_chart', 'show_chart'],
  사진: ['photo', 'image', 'photo_library', 'collections', 'camera_alt'],
  번역: ['translate', 'language', 'g_translate', 'interpreter_mode'],
};
```

매핑은 부분 일치를 지원합니다.

```ts
if (keyword.includes(query) || query.includes(keyword)) {
  // 해당 키워드의 seed 아이콘 추가
}
```

각 seed 아이콘에 대해:

1. seed 자체를 결과에 추가
2. 전체 아이콘 목록에서 seed 문자열을 포함하는 아이콘도 추가
3. Set으로 중복 제거
4. 현재 카테고리의 `base` 목록으로 최종 필터링

```ts
function searchByKorean(query: string): Set<string> {
  const q = query.trim();
  if (!q) return new Set();

  const result = new Set<string>();
  for (const [keyword, icons] of Object.entries(KOREAN_ICON_MAP)) {
    if (keyword.includes(q) || q.includes(keyword)) {
      icons.forEach(seed => {
        result.add(seed);
        ALL_ICONS.forEach(icon => {
          if (icon.includes(seed)) result.add(icon);
        });
      });
    }
  }
  return result;
}
```

### 6.5 검색 결과 없음

검색 결과가 없으면 아이콘 grid 대신 중앙 empty state를 표시합니다.

- 아이콘: Material `search_off`
- 텍스트: `"{검색어}" 검색 결과 없음`
- 세로 여백: 약 `48px`

---

## 7. 카테고리 탭

카테고리 탭은 가로로 넘칠 수 있으므로 horizontal scroll을 사용합니다. 스크롤바는 숨깁니다.

표시 순서:

1. `전체 (N)`
2. `액션`
3. `알림`
4. `미디어`
5. `커뮤니케이션`
6. `콘텐츠`
7. `기기`
8. `에디터`
9. `파일`
10. `하드웨어`
11. `이미지`
12. `지도`
13. `내비게이션`
14. `알림판`
15. `장소`
16. `소셜`
17. `토글`
18. `가나다`

카테고리 데이터 형식:

```ts
type IconCategory = {
  id: string;
  label: string;
  icons: string[];
};
```

특수 카테고리:

- `id: 'all'`
- `label: 전체 (N)`
- 실제 배열은 모든 카테고리의 아이콘을 flatMap하고 Set으로 중복 제거한 `ALL_ICONS`

탭 스타일:

활성:

- 배경: `#4F46E5`
- 글자: 흰색
- shadow-sm

비활성:

- 배경: `#F4F3FC`
- 글자: `#6B6882`
- hover 배경: `#E9E7FA`

---

## 8. 배경 색상 팔레트

### 8.1 색상 데이터

색상은 배경과 아이콘 전경색을 한 쌍으로 저장합니다.

```ts
type IconColor = {
  bg: string;
  color: string;
  label: string;
};
```

정확한 팔레트:

| 라벨 | 배경 `bg` | 아이콘 `color` |
|---|---|---|
| 파랑 | `#EEF5FF` | `#3B5BDB` |
| 초록 | `#F0FDF4` | `#2F9E44` |
| 보라 | `#F5F3FF` | `#6741D9` |
| 주황 | `#FFF7ED` | `#E8590C` |
| 분홍 | `#FDF2F8` | `#C2255C` |
| 노랑 | `#FFFBEB` | `#E67700` |
| 청록 | `#F0FDFA` | `#0C8599` |
| 빨강 | `#FFF1F2` | `#C92A2A` |
| 회색 | `#F1F5F9` | `#475569` |
| 다크 | `#1A1826` | `#FFFFFF` |

첫 번째 색상 `파랑`을 기본값으로 사용합니다.

### 8.2 팔레트 UI

설명:

```text
배경 색상 — 클릭하면 아이콘 전체에 즉시 적용됩니다
```

동작:

- 색상 원형 swatch를 클릭하면 `pickedColor`가 변경된다.
- 선택된 swatch는 보라색 ring과 ring offset을 가진다.
- 선택 시 약간 확대된다.
- 각 swatch의 `title`은 색상 라벨이다.
- 다크 색상은 내부에 흰색 점을 표시해 색상을 인지하게 한다.

크기:

- swatch: `28px × 28px`
- 간격: 약 `6px`
- 작은 화면에서는 wrap

### 8.3 적용 타이밍

색상은 두 가지 방식으로 적용됩니다.

#### 아이콘을 새로 선택하는 경우

사용자가 grid에서 아이콘을 클릭하면 현재 `pickedColor`와 함께 부모에 즉시 전달합니다.

```ts
onSelect({
  name,
  bg: pickedColor.bg,
  color: pickedColor.color,
});
```

#### 이미 선택한 아이콘의 색상만 바꾸는 경우

현재 아이콘이 있을 때 색상만 바꿔도 모달 미리보기는 즉시 바뀝니다. 부모 상태에 최종 적용하려면 footer의 `색상 적용` 버튼을 사용합니다.

```ts
onSelect({
  name: current.name,
  bg: pickedColor.bg,
  color: pickedColor.color,
});
```

현재 아이콘이 없으면 `색상 적용` 버튼을 숨깁니다.

---

## 9. 실시간 미리보기

색상 팔레트 오른쪽에 미리보기 카드를 배치합니다.

구성:

- 작은 아이콘 박스: `36px × 36px`
- 선택한 `pickedColor.bg`
- 아이콘 색상: `pickedColor.color`
- 색상 라벨
- `미리보기`

표시 아이콘:

- 현재 선택 아이콘이 없으면 `smart_toy`
- 현재 아이콘이 Material Icons면 `<span class="material-icons">`
- 한글 특수 아이콘이면 일반 Material font 대신 한글 문자를 텍스트로 표시

```ts
function isHanIcon(name: string) {
  return name.startsWith('han:');
}

function getHanChar(name: string) {
  return name.slice(4);
}
```

예:

```text
han:가 → 가
han:나 → 나
```

미리보기 크기:

- Material icon: 약 `22px`
- 한글 아이콘: 약 `22px`, bold

---

## 10. 아이콘 grid

### 10.1 레이아웃

- 세로로 스크롤되는 영역
- 좌우 padding: 약 `16px`
- 위아래 padding: 약 `12px`
- grid gap: 약 `6px`
- 모바일: 6열
- `sm` 이상: 8열
- 각 셀: 정사각형
- 각 셀: `aspect-ratio: 1 / 1`
- 둥근 모서리: `rounded-xl`

```css
.icon-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 6px;
}

@media (min-width: 640px) {
  .icon-grid {
    grid-template-columns: repeat(8, minmax(0, 1fr));
  }
}
```

### 10.2 아이콘 셀

각 아이콘 셀의 배경은 현재 선택한 `pickedColor.bg`를 사용합니다.

Material icon:

- 클래스: `material-icons`
- 크기: 약 `23px`
- 색상: `pickedColor.color`

한글 아이콘:

- `han:` prefix 제거 후 문자 출력
- 크기: 약 `26px`
- bold
- 색상: `pickedColor.color`

### 10.3 선택 상태

현재 선택된 아이콘은 `current?.name === name`으로 비교합니다.

선택 상태:

- 보라색 `2px` ring
- ring offset `1px`
- 약간 확대 `scale(1.05)`

일반 hover:

- 약간 확대
- `1px` 보라색 ring
- ring offset `1px`

### 10.4 아이콘 이름 tooltip

hover 중인 셀에만 아이콘 이름을 표시합니다.

- `_`는 공백으로 변경
- 배경: `#1A1826`
- 글자: 흰색
- 글자 크기: `10px`
- 아이콘 셀 아래쪽에 absolute 배치
- `pointer-events: none`
- z-index를 grid보다 높게 설정

예:

```text
account_balance_wallet → account balance wallet
```

모바일에서는 hover가 없으므로 title attribute만으로 대체할 수 있습니다.

---

## 11. Footer

### 11.1 표시 개수

왼쪽에 현재 필터 결과 수를 표시합니다.

```text
N개 표시
```

`displayedIcons.length.toLocaleString()`을 사용합니다.

### 11.2 버튼

오른쪽 버튼:

- `취소`
- `색상 적용` — 현재 아이콘이 있을 때만 표시

`취소`:

- 변경된 선택을 부모에 적용하지 않고 모달을 닫는 정책으로 구현할 수 있다.
- 현재 구현과 완전히 같게 유지하려면, 이미 grid 아이콘을 클릭한 선택은 즉시 부모에 전달되므로 `취소`는 모달 닫기만 수행한다는 점을 명시해야 한다.

`색상 적용`:

- 현재 아이콘 이름은 유지
- 현재 선택 색상만 부모에 전달
- 모달 닫힘

Footer:

- 위쪽 테두리
- 연한 회색 배경 `#FAFAFA`
- 좌우 padding 약 `20px`
- 세로 padding 약 `12px`

---

## 12. 선택 결과 데이터 계약

아이콘 선택 결과는 다음 세 필드만으로 충분합니다.

```ts
type SelectedIcon = {
  name: string;
  bg: string;
  color: string;
};
```

예시:

```json
{
  "name": "menu_book",
  "bg": "#F5F3FF",
  "color": "#6741D9"
}
```

한글 특수 아이콘:

```json
{
  "name": "han:가",
  "bg": "#EEF5FF",
  "color": "#3B5BDB"
}
```

비서 저장 모델에 포함할 때:

```ts
type AssistantIcon = {
  name: string;
  background: string;
  color: string;
};
```

API 요청 예:

```json
{
  "icon": {
    "name": "menu_book",
    "background": "#F5F3FF",
    "color": "#6741D9"
  }
}
```

---

## 13. Material Icons 로딩

Material Icons font를 앱 진입점에서 한 번 로드합니다.

현재 방식:

```ts
import 'material-icons/iconfont/material-icons.css';
```

렌더링:

```tsx
<span className="material-icons">menu_book</span>
```

주의:

- `name`을 SVG path로 해석하지 않는다.
- Material Icons font 이름을 그대로 텍스트 노드로 전달한다.
- `han:가`처럼 실제 Material Icons에 없는 값은 font로 렌더링하지 않는다.
- `han:` 값은 반드시 별도의 텍스트 분기로 처리한다.
- Material Icons CSS가 로드되지 않으면 아이콘 이름이 글자로 보이므로 앱 초기화 단계에서 로드 여부를 확인한다.

---

## 14. 아이콘 카탈로그 데이터

아이콘 카탈로그는 서버 검색에 의존하지 않고 로컬 정적 데이터로 유지합니다. 다른 프로젝트로 옮길 때는 다음 원칙을 지킵니다.

### 14.1 카테고리 배열

```ts
export const ICON_CATEGORIES: IconCategory[] = [
  { id: 'action', label: '액션', icons: [...] },
  { id: 'alert', label: '알림', icons: [...] },
  { id: 'av', label: '미디어', icons: [...] },
  { id: 'communication', label: '커뮤니케이션', icons: [...] },
  { id: 'content', label: '콘텐츠', icons: [...] },
  { id: 'device', label: '기기', icons: [...] },
  { id: 'editor', label: '에디터', icons: [...] },
  { id: 'file', label: '파일', icons: [...] },
  { id: 'hardware', label: '하드웨어', icons: [...] },
  { id: 'image', label: '이미지', icons: [...] },
  { id: 'maps', label: '지도', icons: [...] },
  { id: 'navigation', label: '내비게이션', icons: [...] },
  { id: 'notification', label: '알림판', icons: [...] },
  { id: 'places', label: '장소', icons: [...] },
  { id: 'social', label: '소셜', icons: [...] },
  { id: 'toggle', label: '토글', icons: [...] },
  { id: 'korean', label: '가나다', icons: [...] },
];
```

### 14.2 전체 목록

카테고리별 배열에 중복이 있을 수 있으므로 전체 목록은 다음처럼 계산합니다.

```ts
export const ALL_ICONS = [
  ...new Set(ICON_CATEGORIES.flatMap(category => category.icons)),
];
```

### 14.3 가나다 아이콘

Material Icons에 한글 글리프를 포함시키기 위해 다음 특수 이름을 추가합니다.

```text
han:가
han:나
han:다
han:라
han:마
han:바
han:사
han:아
han:자
han:차
han:카
han:타
han:파
han:하
```

이 값들은 Material font 이름이 아니며, 화면에서는 `가`, `나`, `다`와 같은 일반 텍스트로 렌더링합니다.

### 14.4 한글 키워드 맵

동일한 검색 결과를 보장하려면 `KOREAN_ICON_MAP`도 함께 이식해야 합니다. 최소한 다음 그룹을 포함합니다.

```text
일반: 홈, 집, 건물, 사무실
사람: 사람, 사용자, 인물, 팀, 그룹, 프로필
탐색: 검색, 찾기, 탐색
커뮤니케이션: 메일, 이메일, 채팅, 메시지, 전화, 알림, 공지
파일·문서: 파일, 폴더, 문서, 서류, 보고서, 메모, 노트
책·교육: 책, 도서, 교육, 학교
설정·도구: 설정, 도구, 편집, 수정
보안: 보안, 잠금, 비밀번호, 인증
저장·전송: 저장, 업로드, 다운로드, 공유, 전송
추가·삭제: 추가, 삭제, 제거, 취소, 완료, 확인
미디어: 사진, 이미지, 카메라, 동영상, 비디오, 음악, 재생, 정지
데이터: 데이터, 분석, 통계, 차트, 그래프, 대시보드
지도·교통: 지도, 위치, 주소, 비행기, 자동차, 기차, 지하철, 버스, 자전거
금융: 결제, 돈, 금액, 은행, 지갑, 쇼핑
음식·날씨: 음식, 식당, 커피, 음료, 날씨, 태양, 구름, 비
기기: 핸드폰, 스마트폰, 컴퓨터, 노트북, 태블릿, 헤드폰, 키보드, 마우스
인터페이스: 메뉴, 목록, 그리드, 더보기, 화살표, 새로고침, 링크, 필터, 정렬
평가: 즐겨찾기, 북마크, 별, 하트, 좋아요, 싫어요
개발·글쓰기: 코드, 개발, 버그, 글쓰기, 작성, 번역, 언어
날짜·시간: 달력, 일정, 시계, 시간, 날짜
기타: 병원, 의료, 건강, 운동, 선물, 파티, 전구, 아이디어, 지구,
      인쇄, 복사, 로그인, 로그아웃, 관리자, 광고, 뉴스, 실시간,
      태그, 카테고리, 통화, 회의, 발표, 게임, 지원, 정책, 법률, 계약
```

정확한 결과가 중요하면 위 그룹 설명만 재작성하지 말고, 원본 매핑 배열의 seed 아이콘 목록도 그대로 복사합니다.

---

## 15. 상태와 이벤트 설계

### 15.1 모달 상태

```ts
const [search, setSearch] = useState('');
const [activeCategory, setActiveCategory] = useState('all');
const [pickedColor, setPickedColor] = useState(ICON_BG_COLORS[0]);
const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
```

### 15.2 상태 전이

```text
비서 생성 폼
  → 아이콘 선택 버튼 클릭
  → 모달 열림
  → 검색·카테고리·색상 조작
  → 아이콘 클릭
  → 부모의 presetThumb 갱신
  → logoUrl 제거
  → 모달 닫힘
```

색상 변경만 하는 경우:

```text
모달 열림
  → 현재 아이콘 확인
  → 색상 swatch 클릭
  → 미리보기 갱신
  → 색상 적용 클릭
  → 부모의 bg/color 갱신
  → 모달 닫힘
```

### 15.3 부모 콜백

```tsx
<IconPickerModal
  open={iconPickerOpen}
  current={presetThumb}
  onSelect={icon => {
    setPresetThumb(icon);
    setLogoUrl(null);
    setIconPickerOpen(false);
  }}
  onClose={() => setIconPickerOpen(false)}
/>
```

### 15.4 부모·모달 책임 분리

모달 책임:

- 검색
- 카테고리
- 색상
- 현재 선택 표시
- 아이콘 렌더링
- 선택 결과 생성

부모 폼 책임:

- `presetThumb` 저장
- 업로드 사진과의 상호 배제
- 비서 아바타 표시
- 선택 제거
- 비서 저장 API에 icon 데이터 포함

---

## 16. 다크모드와 반응형 구현

### 16.1 다크모드

다크모드에서 반드시 확인할 항목:

- 흰색 모달 표면이 어두운 표면으로 바뀌는지
- 입력창 placeholder가 읽히는지
- 선택 보라색 ring이 보이는지
- 다크 색상 swatch와 흰색 아이콘이 구분되는지
- grid의 색상 배경이 의미를 잃지 않는지
- tooltip이 배경과 겹치지 않는지

권장 다크 표면:

```text
body: #0F0D1A
modal: #0F0D1A 또는 #1A1726
secondary surface: #252237
border: #4A4870
primary text: #F2F0FF
secondary text: #C0BEDC
primary accent: #A8A5FF
```

### 16.2 모바일

- 모달은 bottom sheet
- grid 6열
- 카테고리 탭은 가로 스크롤
- 검색창은 모달 폭 전체 사용
- 색상 팔레트는 wrap
- footer 버튼은 화면 안에서 줄어들지 않도록 한다.
- 아이콘 이름 tooltip에 의존하지 않고 `title`을 제공한다.
- 모달 body만 세로 스크롤되고 header·search·category·color·footer는 고정 영역으로 둔다.

---

## 17. 구현 시 주의할 점

### 17.1 `han:` 아이콘을 Material font로 렌더링하지 않기

잘못된 구현:

```tsx
<span className="material-icons">{name}</span>
```

`name`이 `han:가`이면 Material font가 해당 글리프를 찾지 못합니다.

올바른 구현:

```tsx
{isHanIcon(name) ? (
  <span style={{ color }}>{getHanChar(name)}</span>
) : (
  <span className="material-icons" style={{ color }}>{name}</span>
)}
```

비서 생성 폼의 아바타, 진입 버튼, 모달 미리보기, grid 모두 같은 분기 함수를 사용합니다.

### 17.2 진입 버튼도 한글 아이콘을 별도 렌더링

선택된 아이콘을 진입 버튼에 표시할 때도 `han:` 값을 그대로 Material font에 넣지 않습니다.

### 17.3 현재 선택 색상 동기화

모달이 다시 열릴 때 `current.bg`와 팔레트의 `bg`를 비교해 같은 색상을 선택해야 합니다. 동기화하지 않으면 현재 아이콘과 다른 색상으로 미리보기가 시작됩니다.

### 17.4 카테고리 결과와 전체 결과의 일관성

한글 검색으로 seed를 찾았더라도 최종 결과는 반드시 현재 카테고리 `base`에 한정합니다. 그렇지 않으면 카테고리 탭을 선택한 의미가 사라집니다.

### 17.5 저장 데이터에는 이름·배경·전경색을 모두 저장

아이콘 이름만 저장하면 사용자가 선택한 색상을 복원할 수 없습니다.

```text
name + bg + color
```

세 필드를 함께 저장합니다.

### 17.6 사진과 preset 아이콘의 상호 배제

사진 업로드 후에도 이전 아이콘이 남아 있으면 어떤 것이 실제 아바타인지 모호해집니다. 하나를 선택하면 다른 하나를 `null`로 지웁니다.

---

## 18. 권장 컴포넌트 구조

```text
AssistantBuilderView
├── AssistantAvatar
├── IconSourceTabs
│   ├── MaterialIconTrigger
│   └── PhotoUploadButton
└── IconPickerModal
    ├── IconPickerHeader
    ├── IconSearchInput
    ├── IconCategoryTabs
    ├── IconColorPicker
    │   └── IconLivePreview
    ├── IconGrid
    │   └── IconGridItem
    └── IconPickerFooter
```

데이터 파일:

```text
data/materialIcons.ts
```

내보낼 값:

```ts
IconCategory
ICON_CATEGORIES
ALL_ICONS
KOREAN_ICON_MAP
searchByKorean
isHanIcon
getHanChar
ICON_BG_COLORS
```

---

## 19. 테스트 체크리스트

### 진입·닫기

- [ ] `아이콘 선택` 탭이 기본 활성화된다.
- [ ] `Material 아이콘 선택…` 버튼을 클릭하면 모달이 열린다.
- [ ] X 버튼으로 닫힌다.
- [ ] overlay 클릭으로 닫힌다.
- [ ] 모달 내부 클릭이 닫기 이벤트를 발생시키지 않는다.
- [ ] `Escape`로 닫을 수 있다.
- [ ] 모달이 열릴 때 검색창에 focus된다.

### 검색

- [ ] 검색어가 없으면 현재 카테고리 전체가 표시된다.
- [ ] `book` 검색이 동작한다.
- [ ] 공백이 underscore 검색으로 정규화된다.
- [ ] `책` 검색이 영문 아이콘 결과를 보여 준다.
- [ ] `사람`, `문서`, `설정`, `분석`, `사진` 검색이 동작한다.
- [ ] 한글 검색이 현재 카테고리 범위를 벗어나지 않는다.
- [ ] 검색어를 지울 수 있다.
- [ ] 검색 결과가 없으면 `"{검색어}" 검색 결과 없음`이 표시된다.

### 카테고리

- [ ] `전체 (N)` 개수가 실제 고유 목록과 일치한다.
- [ ] 카테고리 선택 시 grid가 갱신된다.
- [ ] 카테고리 탭은 모바일에서 가로 스크롤된다.
- [ ] `가나다` 카테고리가 표시된다.
- [ ] 동일 아이콘이 여러 카테고리에 있어도 전체 목록에서는 중복되지 않는다.

### 색상

- [ ] 10개 색상이 정확한 배경·전경색으로 표시된다.
- [ ] 색상 선택 시 ring과 확대 상태가 보인다.
- [ ] 색상 선택 즉시 미리보기가 바뀐다.
- [ ] 현재 아이콘이 있을 때 `색상 적용` 버튼이 보인다.
- [ ] 현재 아이콘이 없을 때 `색상 적용` 버튼이 숨겨진다.
- [ ] 다크 색상 swatch 내부 흰색 점이 보인다.
- [ ] 재진입 시 현재 아이콘의 색상이 복원된다.

### 아이콘 선택

- [ ] 아이콘 클릭 시 `name`, `bg`, `color`가 함께 전달된다.
- [ ] 선택 즉시 부모 아바타가 갱신된다.
- [ ] 아이콘 선택 시 업로드 사진이 제거된다.
- [ ] 선택된 셀에 보라색 ring이 표시된다.
- [ ] hover 시 아이콘 이름이 표시된다.
- [ ] `han:가`가 Material font 이름이 아닌 한글 `가`로 표시된다.
- [ ] 한글 아이콘도 선택·색상 적용·저장이 된다.

### 사진 업로드

- [ ] PNG/JPEG/WebP만 선택할 수 있다.
- [ ] 사진 선택 시 아바타가 사진으로 바뀐다.
- [ ] 사진 선택 시 preset 아이콘이 제거된다.
- [ ] 같은 파일을 다시 선택할 수 있다.
- [ ] 제거 버튼으로 사진이 삭제되고 기본 아바타로 돌아간다.

### 반응형·접근성

- [ ] 데스크톱에서 560px 모달이 중앙에 표시된다.
- [ ] 모바일에서 bottom sheet로 표시된다.
- [ ] 모바일 grid가 6열이다.
- [ ] 데스크톱 grid가 8열이다.
- [ ] 검색창과 버튼에 적절한 accessible name이 있다.
- [ ] 키보드만으로 검색·탭·선택·닫기가 가능하다.
- [ ] 색상 swatch에 `title` 또는 accessible label이 있다.
- [ ] 아이콘 셀에 아이콘 이름이 accessible name으로 노출된다.

---

## 20. 최종 완료 기준

다음 조건을 모두 만족하면 다른 프로젝트에서 동일한 Material Icons 선택 기능이 구현된 것으로 판단합니다.

1. 비서 생성 폼의 `기본 정보`에서 아이콘 선택 영역이 중앙 아바타와 함께 표시된다.
2. `아이콘 선택`과 `사진 업로드` 탭을 전환할 수 있다.
3. Material Icons 선택 모달이 데스크톱·모바일에서 동일한 계층으로 열린다.
4. 검색창에서 영문 이름과 한국어 키워드를 모두 사용할 수 있다.
5. 카테고리 탭과 검색 결과가 서로 일관된다.
6. 10개 배경 색상 팔레트와 전경색이 정확히 적용된다.
7. 색상 변경이 미리보기에 즉시 반영된다.
8. 아이콘 선택 결과에 이름·배경·전경색이 함께 저장된다.
9. `han:` 특수 아이콘이 한글 텍스트로 정상 렌더링된다.
10. 선택한 Material 아이콘과 업로드 사진이 서로 중복 상태가 되지 않는다.
11. 현재 선택값을 다시 열었을 때 아이콘·색상·선택 상태가 복원된다.
12. 검색 결과 없음, hover, 선택, 닫기, 빈 상태가 모두 구현된다.
13. 반응형 grid, bottom sheet, horizontal category scroll이 동작한다.
14. 키보드·스크린리더 접근성 라벨이 제공된다.
15. 비서 저장 API에 `icon.name`, `icon.background`, `icon.color`가 전달된다.

---

## 21. 현재 프로젝트 참고 위치

현재 구현을 직접 확인하거나 데이터까지 그대로 옮길 때 참고할 파일:

```text
artifacts/jpdc-ai/src/components/IconPickerModal.tsx
artifacts/jpdc-ai/src/data/materialIcons.ts
artifacts/jpdc-ai/src/views/AssistantBuilderView.tsx
artifacts/jpdc-ai/src/main.tsx
artifacts/jpdc-ai/src/index.css
```

역할:

- `IconPickerModal.tsx`: 모달 UI, 검색, 카테고리, 색상, grid, 선택 콜백
- `materialIcons.ts`: 카테고리, 전체 아이콘 목록, 한글 검색 맵, 색상 팔레트
- `AssistantBuilderView.tsx`: 비서 생성 폼, 아바타, Material/사진 탭, 부모 상태
- `main.tsx`: Material Icons CSS import
- `index.css`: 라이트·다크·반응형 전역 스타일
