# JPDC AI — 완전 재현 명세서 (rebuild.md)

> 이 문서는 JPDC AI 웹앱의 **모든 화면·컴포넌트·색상·간격·폰트·이벤트·상태·데이터**를 Claude 등 어느 환경에서도 픽셀 수준으로 재현할 수 있도록 지나칠 정도로 상세히 기술합니다.

---

## 1. 기술 스택 & 프로젝트 구조

| 항목 | 값 |
|---|---|
| 프레임워크 | React 18 + TypeScript + Vite |
| 스타일링 | Tailwind CSS v4 (`@tailwindcss/vite`) |
| 아이콘 | `lucide-react` (strokeWidth 기본 1.8) |
| 차트 | `recharts` |
| 폰트 | `Jeju Samdasoo` (Google Fonts), sans-serif 폴백 |
| 전역 body class | `font-['Jeju_Samdasoo',sans-serif]` |
| 레이아웃 최상위 | `flex h-screen w-full overflow-hidden bg-white` |

### 파일 구조
```
src/
├── App.tsx                          # 루트, 전역 상태 관리
├── index.css                        # Tailwind 임포트 + CSS 변수 + 다크모드
├── context/ThemeContext.tsx         # 라이트/다크 모드 토글
├── assets/jpdc-logo.png             # JPDC 로고 이미지
├── components/
│   ├── Sidebar.tsx                  # 좌측 사이드바 (접힘/펼침)
│   ├── Tooltip.tsx                  # 커스텀 툴팁
│   ├── AssistantInfoModal.tsx       # 공식 비서 상세 모달
│   ├── SavedPanel.tsx               # 저장된 답변 패널
│   └── NotifPanel.tsx               # 알림 패널
└── views/
    ├── HomeView.tsx                 # 홈 (메인 채팅 입력)
    ├── ConversationView.tsx         # 대화 화면
    ├── MarketView.tsx               # 비서마켓 (3개 탭)
    └── AssistantBuilderView.tsx     # 비서 만들기/수정
```

---

## 2. 색상 팔레트 (전체 앱 공통)

| 이름 | HEX | 용도 |
|---|---|---|
| Primary | `#4F46E5` | 버튼, 활성 탭, 아이콘, 포커스 링 |
| Primary Hover | `#4338CA` | 버튼 hover |
| Primary Light | `#EEF0FF` | 활성 항목 배경, 뱃지 배경 |
| Primary Border | `#C7C3F7` | 활성 항목 테두리 |
| Primary Faint | `#F4F3FC` | 아이콘 컨테이너 배경, 호버 배경 |
| Secondary Purple | `#7C6FF7` | 그라디언트, 보조 강조 |
| Text Dark | `#1A1826` | 제목, 본문 주요 텍스트 |
| Text Mid | `#6B6882` | 설명, 서브 텍스트 |
| Text Muted | `#A8A6C0` | 힌트, 날짜, 플레이스홀더 |
| Border | `#E4E2F0` | 카드/입력/구분선 테두리 |
| BG Page | `#F9F8FF` | 사이드바 배경, 카드 배경 tint |
| BG Input | `#FAFAFF` | 입력창 배경 |
| White | `#FFFFFF` | 카드 기본, 모달 배경 |
| Amber Accent | `#D4930A` | 임시저장 뱃지, NEW 뱃지, 별점 강조 |
| Amber Light | `#FFFBEB` | 임시저장 뱃지 배경 |
| Amber Border | `#FDE68A` | 임시저장 뱃지 테두리 |
| Green | `#16A34A` | 승인완료 뱃지 |
| Green Light | `#F0FDF4` | 승인완료 뱃지 배경 |
| Blue | `#0284C7` | 버전갱신중 뱃지 |
| Red | `#DC2626` | 싫어요, 승인불가 뱃지 |
| Purple | `#7C3AED` | 공개전테스트 뱃지, 본부 스코프 |

### 상태 뱃지 색상 맵

| 뱃지명 | color | bg | border |
|---|---|---|---|
| 임시저장 | `#D4930A` | `#FFFBEB` | `#FDE68A` |
| 공식 | `#4F46E5` | `#EEF0FF` | `#C7C3F7` |
| 승인완료 | `#16A34A` | `#F0FDF4` | `#BBF7D0` |
| 버전 갱신중 | `#0284C7` | `#F0F9FF` | `#BAE6FD` |
| 승인 대기 | `#D97706` | `#FFFBEB` | `#FDE68A` |
| 승인불가 | `#DC2626` | `#FFF5F5` | `#FECACA` |
| 공개전 테스트 | `#7C3AED` | `#F5F3FF` | `#DDD6FE` |

### 공개 범위 스코프 색상 맵

| 스코프 | color | bg | border |
|---|---|---|---|
| 비공개 | `#6B6882` | `#F4F3FC` | `#E4E2F0` |
| 지정자 | `#0284C7` | `#F0F9FF` | `#BAE6FD` |
| 부서 | `#0F766E` | `#F0FDFA` | `#99F6E4` |
| 본부 | `#7C3AED` | `#F5F3FF` | `#DDD6FE` |
| 전사 | `#4F46E5` | `#EEF0FF` | `#C7C3F7` |

---

## 3. 타이포그래피 규칙

| 용도 | 크기 | 굵기 | 색상 |
|---|---|---|---|
| 페이지 대제목 | `text-sm` (14px) | `font-bold` | `#1A1826` |
| 섹션 헤더 | 13px | `font-bold` | `#1A1826` |
| 카드 이름 | 13px | `font-bold` | `#1A1826` |
| 카드 설명 | 11~11.5px | normal | `#6B6882` |
| 보조 텍스트 | 12px | normal | `#6B6882` |
| 메타/날짜 | 10~10.5px | normal | `#A8A6C0` |
| 뱃지 텍스트 | 10px | `font-bold` | 뱃지별 color |
| 버튼 (일반) | 11~12px | `font-semibold` | 버튼별 |
| 버튼 (헤더) | `text-xs` (12px) | `font-semibold` | 버튼별 |
| 입력 플레이스홀더 | 12px | normal | `#A8A6C0` |

---

## 4. 공통 컴포넌트

### 4-1. Tooltip 컴포넌트
```
위치: src/components/Tooltip.tsx
래퍼: <div className="relative group/tooltip inline-flex {className}">
툴팁 박스: absolute, z-[9999], bg-[#1A1826], text-white, text-[11px], font-medium
           px-2.5 py-1, rounded-md, whitespace-nowrap, shadow-lg
           opacity-0 → group-hover/tooltip:opacity-100, transition-opacity duration-150 delay-300

위치 변형:
  top    → bottom-full left-1/2 -translate-x-1/2 mb-2
  bottom → top-full left-1/2 -translate-x-1/2 mt-2
  left   → right-full top-1/2 -translate-y-1/2 mr-2
  right  → left-full top-1/2 -translate-y-1/2 ml-2

Props: label(string), position('top'|'bottom'|'left'|'right', 기본 'top'), className?(string)
```

### 4-2. SectionHeader 컴포넌트
```
레이아웃: flex items-center justify-between mb-3
왼쪽:    flex items-center gap-2 flex-wrap
  - Icon: w-4 h-4 text-[#4F46E5] strokeWidth={1.8}
  - title: text-[13px] font-bold text-[#1A1826]
  - desc?: text-[11px] text-[#A8A6C0] font-normal  (선택적 설명글)
오른쪽:  action 버튼 (있을 때만)
  - text-[11px] text-[#A8A6C0] hover:text-[#4F46E5] font-medium
  - ArrowRight w-3 h-3 strokeWidth={1.8}
```

### 4-3. AssistantCard (공식 비서 그리드 카드)
```
컨테이너: button, flex flex-col items-start gap-2 p-3.5
          bg-white rounded-xl border border-[#E4E2F0]
          hover:border-[#4F46E5]/30 hover:shadow-md hover:shadow-[#4F46E5]/8
          hover:-translate-y-0.5 transition-all duration-200
          text-left overflow-hidden w-full

뱃지 (있을 때): absolute top-2.5 right-2.5, text-[9px] font-bold
               px-1.5 py-0.5 rounded-full
               NEW → bg-[#D4930A]/10 text-[#D4930A]
               기타 → bg-[#4F46E5]/10 text-[#4F46E5]

아이콘 박스: w-9 h-9 rounded-xl bg-[#F4F3FC]
             group-hover → bg-[#EEF0FF], Icon color: #A8A6C0 → #4F46E5
             icon 크기: 18px × 18px

이름: text-xs font-semibold text-[#1A1826] truncate
이용자수: text-[10px] text-[#A8A6C0] mt-0.5 (있을 때)
설명: text-[10.5px] text-[#A8A6C0] leading-snug mt-1 break-keep line-clamp-2
```

---

## 5. 레이아웃 — 전체 구조

```
<div class="flex h-screen w-full overflow-hidden bg-white font-['Jeju_Samdasoo',sans-serif]">
  <Sidebar />                          ← 좌측 고정 사이드바
  <div class="flex-1 flex flex-row h-full min-w-0 overflow-hidden">
    <div class="flex-1 min-w-0 overflow-hidden">
      <HomeView />  or  <MarketView />  or  <ConversationView />
    </div>
    <SavedPanel />                     ← 우측 슬라이드 패널 (조건부)
    <NotifPanel />                     ← 우측 슬라이드 패널 (조건부)
  </div>
</div>
```

---

## 6. 사이드바 (Sidebar.tsx)

### 6-1. 크기 & 상태
```
데스크탑 펼침:  width=240px
데스크탑 접힘:  width=56px  (아이콘만)
모바일:        width=240px, fixed overlay (backdrop blur)
전환 애니메이션: transition-[width] duration-300 ease-in-out (데스크탑)
                transition-transform duration-300 (모바일 슬라이드)
배경: bg-[#F9F8FF], border-r border-[#E4E2F0]
```

### 6-2. 헤더 행 (항상 표시, h-12)
```
컨테이너: h-12 flex items-center gap-2 border-b border-[#E4E2F0] px-3

[펼쳤을 때만]
- 로고 이미지: w-7 h-7 rounded-lg object-cover (jpdc-logo.png)
- 텍스트 "JPDC AI": flex-1, font-bold text-[#1A1826] text-sm tracking-tight whitespace-nowrap truncate

[항상]
- 토글 버튼: ml-auto, w-6 h-6 rounded-md, text-[#A8A6C0]
             hover: text-[#4F46E5] bg-[#EEF0FF] transition-colors
             펼침: ChevronLeft / 접힘: ChevronRight (w-3.5 h-3.5 strokeWidth={2})
```

### 6-3. 펼쳐진 상태 네비게이션
```
opacity-100 delay-100 (접힘 시 opacity-0 pointer-events-none)
패딩: px-3 pt-3 pb-2, gap-1.5

① 새 대화 시작 버튼 (항상 파란색)
  w-full flex items-center gap-2 px-3 py-2 rounded-lg
  bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold
  shadow-sm shadow-[#4F46E5]/20
  아이콘: Plus w-3.5 h-3.5 strokeWidth={2.2}

② 비서마켓 버튼
  w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs
  활성: bg-[#EEEEFF] border border-[#C7C3F7] text-[#4F46E5] font-semibold
  비활성: text-[#6B6882] hover:bg-[#EEEEFF] hover:text-[#4F46E5] font-medium border border-transparent
  아이콘: Store w-3.5 h-3.5 (활성 → text-[#4F46E5], 비활성 → text-[#A8A6C0] hover text-[#4F46E5])

③ 대화 검색 (비활성 입력 UI)
  flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#E4E2F0] text-[#A8A6C0]
  아이콘: Search w-3.5 h-3.5
  텍스트: "대화 검색..." text-xs
```

### 6-4. 대화 히스토리 목록
```
flex-1 overflow-y-auto px-2 pb-3 (scrollbarWidth: none)

그룹 레이블: px-2 py-1 text-[10px] uppercase tracking-widest text-[#A8A6C0] font-semibold
             그룹: 오늘 / 어제 / 지난 7일

히스토리 항목 버튼:
  w-full px-2 py-2 rounded-lg text-left border
  활성: bg-[#EEEEFF] border-[#C7C3F7]
  비활성: border-transparent hover:bg-[#EEEEFF] hover:border-[#C7C3F7] hover:shadow-sm
  텍스트: text-[11.5px] leading-snug line-clamp-2 break-keep
          활성: text-[#4F46E5] font-semibold
          비활성: text-[#6B6882] → hover: text-[#4F46E5] font-semibold

뱃지 (TAG, TAG/분할, 분할 등):
  ml-1.5 inline-flex px-1.5 py-0.5 rounded-md
  text-[9.5px] font-semibold bg-[#F0EEFA] text-[#7C6FF7] border border-[#E4E0FA]
```

### 6-5. 푸터 (펼쳐진 상태)
```
border-t border-[#E4E2F0] px-3 py-3 flex items-center justify-between

왼쪽 사용자 정보:
  아바타: w-7 h-7 rounded-full bg-[#4F46E5], text-[11px] font-bold text-white shadow-sm
  이름: text-xs font-semibold text-[#1A1826] truncate

오른쪽 아이콘 버튼들 (gap-0.5):
  공통: w-7 h-7 flex items-center justify-center rounded-lg transition-colors
        text-[#A8A6C0] hover:text-[#4F46E5] hover:bg-[#EEF0FF]
  ① 다크/라이트 모드: Moon/Sun w-4 h-4 strokeWidth={1.8}
  ② 설정: Settings w-4 h-4 strokeWidth={1.8}
  ③ 로그아웃: LogOut w-4 h-4 strokeWidth={1.8} (hover: text-red-500 bg-red-50)
```

### 6-6. 접힌 상태 아이콘 레일 (COLLAPSED icon rail)
```
위치: absolute inset-0 top-12, flex flex-col items-center pt-3 gap-1
접힘 시: opacity-100 delay-100 / 펼침 시: opacity-0 pointer-events-none

모든 아이콘 버튼 크기: w-9 h-9 flex items-center justify-center rounded-lg

① 새 대화 시작: bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-sm shadow-[#4F46E5]/20
                Plus w-4 h-4 strokeWidth={2.2}
                클릭 → onNavigate('home') + onToggle() (사이드바 펼침)
                Tooltip: "새 대화 시작" position="right"

② 비서마켓: 활성 → bg-[#EEEEFF] text-[#4F46E5] border border-[#C7C3F7]
             비활성 → text-[#A8A6C0] hover:bg-[#EEEEFF] hover:text-[#4F46E5]
             클릭 → onNavigate('market') + onToggle() (사이드바 펼침)
             Tooltip: "비서마켓" position="right"

③ 검색: text-[#A8A6C0] hover:bg-[#F4F3FC] hover:text-[#6B6882]
         클릭 → onToggle() (사이드바 펼침)
         Tooltip: "검색" position="right"

[flex-1 / 스페이서]

④ 다크모드 토글: text-[#A8A6C0] hover:bg-[#F4F3FC] hover:text-[#6B6882]
                 Moon/Sun w-4 h-4 strokeWidth={1.8}

⑤ 설정: Settings w-4 h-4 → onOpenSettings()

⑥ 로그아웃: mb-3, hover:bg-red-50 hover:text-red-500
```

---

## 7. HomeView (홈 화면)

### 7-1. 상단 툴바 (h-12)
```
flex items-center justify-between px-4 md:px-6 bg-white border-b border-[#E4E2F0]

왼쪽:
  - JPDC 로고 이미지: w-7 h-7 rounded-lg mr-1
  - "JPDC AI": text-sm font-bold text-[#1A1826]

오른쪽 버튼들 (gap-2):
  ① 브리핑 버튼:
    bg-[#4F46E5] hover:bg-[#4338CA] text-white
    px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm shadow-[#4F46E5]/20
    Sparkles w-3.5 h-3.5 strokeWidth={1.8} + "브리핑"

  ② 알림 버튼:
    border 버튼, 비활성: bg-white border-[#E4E2F0] text-[#6B6882]
    활성(패널 열림): bg-[#EEEEFF] border-[#C7C3F7] text-[#4F46E5]
    hover: border-[#C7C3F7] text-[#4F46E5] bg-[#F4F3FC]
    Bell w-3.5 h-3.5 + "알림"
    미읽음 배지: text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#4F46E5] text-white

  ③ 저장목록 버튼: 알림과 동일 스타일
    BookmarkCheck w-3.5 h-3.5 + "저장목록"
    아이템 배지: 동일
```

### 7-2. 메인 영역 레이아웃
```
flex-1 flex flex-col items-center justify-center gap-6 px-4 pb-12
min-h-0 overflow-y-auto

hero 텍스트:
  "무엇을" → text-4xl md:text-5xl font-black text-[#1A1826] leading-tight text-center
  "만들어볼까요?" → text-4xl md:text-5xl font-black text-[#4F46E5] leading-tight text-center

입력 영역 박스: w-full max-w-2xl
```

### 7-3. 채팅 입력창 박스
```
컨테이너: relative bg-white rounded-2xl border border-[#E4E2F0]
          shadow-lg shadow-[#4F46E5]/8 overflow-hidden
          focus-within: border-[#C7C3F7] shadow-xl shadow-[#4F46E5]/12

textarea:
  w-full px-5 pt-4 pb-12 resize-none bg-transparent outline-none
  text-sm text-[#1A1826] leading-relaxed min-h-[80px] max-h-[200px]
  placeholder: text-[#A8A6C0]
  placeholder 텍스트: "작업을 설명하거나, 질문하거나, 파일을 첨부하세요..."

하단 툴바: absolute bottom-0 left-0 right-0
           flex items-center justify-between px-4 py-2.5
           border-t border-[#F4F3FC] bg-white/80 backdrop-blur-sm

  왼쪽:
    ① 첨부 버튼: Paperclip, w-8 h-8 rounded-lg text-[#A8A6C0] hover:text-[#4F46E5] hover:bg-[#F4F3FC]
    ② 비서 선택 드롭다운:
      flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E4E2F0]
      bg-[#F9F8FF] text-[#6B6882] text-xs font-medium hover:border-[#C7C3F7] hover:text-[#4F46E5]
      Users2 w-3.5 h-3.5 + "비서 선택" + ChevronDown w-3 h-3

  오른쪽:
    전송 버튼: w-8 h-8 rounded-full
      활성(입력값 있음): bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-sm
      비활성: bg-[#E4E2F0] text-[#A8A6C0] cursor-not-allowed
      ArrowUp w-4 h-4 strokeWidth={2.5}
```

### 7-4. 바로가기 카드 섹션
```
"많이 쓰는 비서 바로가기" text-xs text-[#A8A6C0] text-center

카드 그리드: grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-2xl

각 카드:
  button, flex flex-col items-center gap-2.5 p-4 rounded-2xl
  bg-white border border-[#E4E2F0]
  hover:border-[#4F46E5]/30 hover:shadow-md hover:shadow-[#4F46E5]/8
  hover:-translate-y-0.5 transition-all duration-200

  아이콘 박스: w-10 h-10 rounded-xl bg-[#F4F3FC] flex items-center justify-center
               hover → bg-[#EEF0FF], icon color #A8A6C0 → #4F46E5
  이름: text-xs font-bold text-[#1A1826]
  설명: text-[10.5px] text-[#A8A6C0] leading-snug text-center break-keep line-clamp-2

데이터:
  - AI 글쓰기 (PenTool): "블로그·기획사·이메일 등... 다양한 글 작성"
  - 코드 분석 (Code): "디버깅·최적화·리뷰로 코드... 품질 향상"
  - 번역 (Globe): "다국어 고품질 번역... 자연스러운 문장"
  - 문서 요약 (FileText): "PDF·보고서·계약서를 핵심... 간추려 정리"
```

---

## 8. 비서마켓 (MarketView.tsx)

### 8-1. 전체 구조
```
<div class="flex-1 flex flex-col h-full bg-white min-w-0 overflow-hidden">
  ├── Topbar (h-12, border-b)
  ├── 탭 바 (border-b)
  ├── 검색·생성 툴바 (탭 1,2 공통, border-b)  or  공식비서 검색창 (탭3 내부 border-b)
  └── 탭 콘텐츠 (flex-1 overflow-hidden)
```

### 8-2. Topbar (h-12)
```
h-12 flex items-center justify-between px-4 md:px-6 bg-white border-b border-[#E4E2F0] shrink-0

왼쪽:
  - 모바일 사이드바 토글: Menu w-5 h-5 (md:hidden)
                         p-1.5 rounded-lg text-[#A8A6C0] hover:text-[#4F46E5] hover:bg-[#F4F3FC]
  - Store w-4 h-4 text-[#4F46E5]
  - "비서마켓" text-sm font-bold text-[#1A1826]

오른쪽 (gap-2):
  ① 브리핑 버튼: Sparkles + "브리핑" (sm 이상, 이하 아이콘만)
                  bg-[#4F46E5] → #4338CA, text-white, text-xs font-semibold
                  px-3 py-1.5 rounded-lg shadow-sm shadow-[#4F46E5]/20
  ② 알림 버튼: Bell + "알림" + 미읽음 배지 (활성/비활성 스타일 HomeView와 동일)
  ③ 저장목록: BookmarkCheck + "저장목록" + 아이템수 배지
```

### 8-3. 탭 바
```
flex shrink-0 border-b border-[#E4E2F0] px-4 md:px-6 overflow-x-auto (scrollbarWidth:none)

탭 버튼: relative px-4 py-3 text-[13px] font-semibold whitespace-nowrap border-b-2
  활성: border-[#4F46E5] text-[#4F46E5]
  비활성: border-transparent text-[#6B6882] hover:text-[#1A1826] hover:border-[#E4E2F0]

탭 목록:
  1. "내가 만든 모든 비서"  (key: 'my')
  2. "공개전 테스트 요청 비서"  (key: 'test')
  3. "공식 비서"  (key: 'official')  ← 기본 활성

기본 활성 탭: 'official'
```

### 8-4. 검색·생성 툴바 (탭 1·2 공통)
```
조건: activeTab === 'my' || activeTab === 'test'
px-4 md:px-6 py-3 border-b border-[#E4E2F0] flex items-center gap-2.5 shrink-0 bg-white

검색 입력:
  flex-1 flex items-center gap-2 px-3 py-2 rounded-xl
  border border-[#E4E2F0] bg-[#FAFAFF] hover:border-[#4F46E5]/30 transition-colors
  Search w-3.5 h-3.5 text-[#A8A6C0]
  input: flex-1 text-[12px] text-[#1A1826] placeholder:text-[#A8A6C0] bg-transparent outline-none
  placeholder: "비서 검색…"

나만의 비서 만들기 버튼:
  flex items-center gap-1.5 px-4 py-2 rounded-xl
  bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[12px] font-semibold
  shadow-sm shadow-[#4F46E5]/20 whitespace-nowrap shrink-0
  Plus w-3.5 h-3.5 strokeWidth={2}
  텍스트: "나만의 비서 만들기" (sm 이상) / "만들기" (sm 미만)
  클릭: activeTab='my' + showBuilder=true
```

---

## 9. 탭 1 — 내가 만든 모든 비서 (MyAssistantsTab)

### 9-1. 레이아웃
```
<>
  <div class="flex-1 overflow-y-auto px-6 md:px-8 py-5" style="scrollbar-width:none">
    [통계 섹션] (list.length > 0 일 때만)
    [비어있음 상태] (list.length === 0)
    [카드 그리드] (list.length > 0)
  </div>
  [통계 모달] (조건부)
</>
```

### 9-2. 상단 통계 섹션 (어제의 비서 이용 통계)
```
<section class="mb-6">
  SectionHeader: BarChart2 + "어제의 비서 이용 통계"

  grid grid-cols-3 gap-3

  각 통계 카드:
    flex items-start gap-3 p-4 rounded-xl border border-[#E4E2F0] bg-[#F9F8FF]
    
    아이콘 박스: w-8 h-8 rounded-lg bg-white border border-[#E4E2F0]
               Accent: text-[#D4930A] / 일반: text-[#4F46E5]
               icon 크기: 16px × 16px
    
    텍스트:
      label: text-[10px] text-[#A8A6C0] font-medium
      value: text-[13px] font-bold text-[#1A1826] leading-snug mt-0.5 truncate
      sub:   text-[10px] text-[#A8A6C0] mt-0.5

3개 항목:
  ① Star(accent) / "어제 가장 많이 사용한 비서" / list의 dialogueCount 최대값 비서명 / "N회 사용"
  ② Users       / "어제 비서 이용한 인원수"    / list messageCount 합계 + "명"        / "내 비서 이용자 합계"
  ③ MessageSquare / "어제 비서 이용한 대화 건수" / list dialogueCount 합계 + "건"      / "내 비서 대화 합계"
```

### 9-3. 비어있음 상태
```
flex flex-col items-center justify-center py-24 gap-4
아이콘: w-14 h-14 rounded-2xl bg-[#F4F3FC], Plus w-7 h-7 text-[#A8A6C0] strokeWidth={1.4}
제목: text-sm font-semibold text-[#6B6882] "아직 만든 비서가 없습니다."
설명: text-xs text-[#A8A6C0] mt-1 "위의 + 나만의 비서 만들기로 시작해 보세요."
```

### 9-4. 카드 그리드
```
grid grid-cols-1 md:grid-cols-2 gap-3
key: `${a.name}-${i}`
```

### 9-5. AssistantListCard (내가 만든/테스트 비서 카드)

```
■ 복제 하이라이트 상태 (isHighlighted=true 마운트 시 → 2.8초 후 자동 해제)
  - lit 상태: useState(!!isHighlighted), useEffect 타이머 2800ms
  - 카드 래퍼 인라인 스타일:
      borderColor: lit ? '#F59E0B' : '#E4E2F0'
      backgroundColor: lit ? 'rgba(245,158,11,0.05)' : '#ffffff'
      transition: 'border-color 1.2s ease-out, background-color 1.2s ease-out'
  - 상단 스트라이프 (absolute top-0, h-[3px], z-10):
      background: 'linear-gradient(90deg, #F59E0B 0%, #FCD34D 50%, #F59E0B 100%)'
      opacity: lit ? 1 : 0, transition: 'opacity 1.2s ease-out'

■ 카드 컨테이너
  relative flex flex-col rounded-xl border overflow-hidden
  (인라인 스타일로 border-color, background-color 제어)

■ 본문 (px-5 pt-5 pb-4)
  헤더 (flex items-start gap-3 mb-3):
    아이콘 박스: w-10 h-10 rounded-xl bg-[#F4F3FC]
                Icon: text-[#4F46E5] 18px × 18px strokeWidth={1.8}
    이름: text-[13px] font-bold text-[#1A1826] leading-snug
    작성자: text-[11px] text-[#A8A6C0] mt-0.5 → "by {author}"

  설명: text-[11.5px] text-[#6B6882] leading-relaxed mb-3 break-keep
        없으면 "(설명 없음)"

  배지 행 (flex items-center justify-between gap-2 mb-2.5):
    왼쪽 (flex items-center gap-1.5 flex-wrap):
      ① 버전 뱃지 (있을 때): text-[10px] font-bold px-2 py-0.5 rounded-full
                              bg-[#F4F3FC] text-[#6B6882] border border-[#E4E2F0]
      ② 상태 뱃지 (있을 때): 상태별 color/bg/border 사용 (§2 참고)
      ③ 공개전 테스트 뱃지 (isTestCard): purple 스타일
      ④ 스코프 뱃지: 스코프별 color/bg/border (§2 참고)
    오른쪽: 💬 N (commentCount > 0 일 때, text-[11px] text-[#6B6882] font-medium)

  날짜: text-[10.5px] text-[#A8A6C0]
        "생성 {createdAt} · 업데이트 {updatedAt}"

■ 액션 버튼 행 (px-5 py-3 border-t border-[#F4F3FC] bg-[#FAFAFF])
  flex items-center gap-1.5 flex-wrap

  공통 아웃라인 버튼 스타일:
    px-3 py-1.5 rounded-lg border border-[#E4E2F0] text-[#6B6882] text-[11px] font-semibold
    hover:border-[#4F46E5]/30 hover:text-[#4F46E5] transition-colors

  [isDraft === true]:
    "이어서 작성": flex-1, bg-[#4F46E5] hover:bg-[#4338CA] text-white → onContinue()

  [isTestCard === true]:
    "채팅 시작": flex-1, bg-[#4F46E5] text-white
    "평가 남기기": 아웃라인 버튼

  [일반 카드]:
    "수정" → onEdit()
    "복제" → onClone()
    "통계" → onStats()
    "URL 복사" (scope !== '비공개' 일 때만)
    "공식 등록" (ml-auto, bg-[#4F46E5] text-white / 조건: !isDraft && !isTestCard && 미승인 상태)
```

---

## 10. 탭 2 — 공개전 테스트 요청 비서 (TestRequestTab)

### 안내 배너
```
flex items-start gap-3 px-4 py-3.5 rounded-xl border border-[#DDD6FE] bg-[#F5F3FF] mb-5
아이콘: FlaskConical w-4 h-4 text-[#7C3AED] shrink-0 mt-0.5
제목: text-[12px] font-semibold text-[#7C3AED] "다른 사람이 공개 전 테스트를 요청한 비서입니다."
설명: text-[11.5px] text-[#7C3AED]/80
```

### 카드 그리드
```
grid grid-cols-1 md:grid-cols-2 gap-3
AssistantListCard에 isTestCard={true} 전달
```

### 비어있음 상태
```
py-20, FlaskConical 아이콘, 안내 문구 2줄
```

---

## 11. 탭 3 — 공식 비서 (OfficialTab)

### 11-1. 검색창 (탭 콘텐츠 최상단, border-b)
```
px-4 md:px-6 py-3 border-b border-[#E4E2F0] flex items-center gap-2.5 shrink-0 bg-white

입력 박스:
  flex-1 flex items-center gap-2 px-3 py-2 rounded-xl
  border border-[#E4E2F0] bg-[#FAFAFF]
  hover:border-[#4F46E5]/30 focus-within:border-[#4F46E5]/50 transition-colors
  Search w-3.5 h-3.5 text-[#A8A6C0]
  input: flex-1 text-[12px] text-[#1A1826] placeholder:text-[#A8A6C0] bg-transparent outline-none
  placeholder: "비서 이름, 기능, 카테고리로 검색…"
  X 버튼 (입력값 있을 때): p-0.5 rounded-full text-[#A8A6C0] hover:text-[#6B6882], XIcon w-3.5 h-3.5

검색 버튼:
  flex items-center gap-1.5 px-4 py-2 rounded-xl
  bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[12px] font-semibold
  shadow-sm shadow-[#4F46E5]/20 whitespace-nowrap shrink-0
  Search w-3.5 h-3.5 + "검색"
  Enter 키도 동일 실행

초기화 버튼 (검색 결과 있을 때만):
  flex items-center gap-1.5 px-4 py-2 rounded-xl
  border border-[#E4E2F0] bg-white text-[#6B6882]
  hover:border-[#C7C3F7] hover:text-[#4F46E5] hover:bg-[#F4F3FC]
  text-[12px] font-semibold whitespace-nowrap shrink-0
  XIcon w-3.5 h-3.5 + "초기화"
```

### 11-2. 검색 결과 화면
```
flex-1 overflow-y-auto px-6 md:px-8 pb-6 (scrollbarWidth:none)
헤더: text-[13px] font-bold text-[#1A1826]
      "검색 결과" + <span class="text-[#4F46E5] ml-2">{N}개</span>

결과 없음: flex col center, Search w-10 h-10 strokeWidth={1.2} text-[#A8A6C0]
결과 있음: grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 → AssistantCard
```

### 11-3. 일반 콘텐츠 (검색 결과 null 일 때)
```
flex-1 overflow-y-auto px-6 md:px-8 py-6 space-y-7 (scrollbarWidth:none)

① 어제의 비서 이용 통계 (SectionHeader: BarChart2)
   grid grid-cols-3 gap-3 (§9-2와 동일 카드 구조)
   데이터:
     - ⭐ "어제 가장 많이 사용한 비서" / "회의록 정리" / "247회 사용" (accent=true)
     - 👥 "어제 비서 이용한 인원수"   / "183명"       / "전날 대비 +12명"
     - 💬 "어제 비서 이용한 대화 건수" / "1,024건"    / "전날 대비 +89건"

② 이건 어때요! (SectionHeader: Zap, desc="(관리자가 지정하여 프로모션 하는 이벤트성 비서)")
   grid grid-cols-3 gap-3

   프로모션 카드:
     button group/promo relative flex flex-col gap-3 p-4 rounded-xl
     border border-[#E4E2F0] bg-white text-left overflow-hidden
     hover:border-[#4F46E5]/30 hover:shadow-md hover:shadow-[#4F46E5]/8 hover:-translate-y-0.5
     transition-all duration-200
     
     상단 인디고 스트라이프:
       absolute top-0 left-0 right-0 h-0.5 rounded-t-xl
       bg-gradient-to-r from-[#4F46E5]/60 to-[#7C6FF7]/40
     
     아이콘 박스: w-10 h-10 rounded-xl bg-[#F0EEFF] group-hover→bg-[#EEF0FF]
                 Icon: text-[#4F46E5] 20px × 20px
     뱃지: text-[9px] font-bold px-2 py-0.5 rounded-full
           NEW → bg-[#D4930A]/10 text-[#D4930A]
           기타 → bg-[#4F46E5]/10 text-[#4F46E5]
     이름: text-xs font-bold text-[#1A1826]
     설명: text-[10.5px] text-[#A8A6C0] leading-snug break-keep line-clamp-2
     이용자: Users w-3 h-3 + "{N}명 이용 중" text-[10px] text-[#A8A6C0]
   
   데이터:
     회의록 문장정리 (PenTool) / 인기 1위 / 12.4k
     법률 자문 비서 (BookOpen) / NEW / 1.2k
     데이터 분석 비서 (BarChart2) / 추천 / 8.7k

③ 최근 사용한 비서 (SectionHeader: Clock)
   grid grid-cols-2 md:grid-cols-4 gap-3
   
   최근 비서 카드:
     button group/rc flex items-center gap-2.5 px-3 py-2.5 rounded-xl
     border border-[#E4E2F0] bg-white text-left
     hover:border-[#4F46E5]/30 hover:bg-[#F9F8FF] transition-all duration-200
     
     아이콘: w-7 h-7 rounded-lg bg-[#F4F3FC] group-hover→bg-[#EEF0FF]
             Icon: 14px × 14px text-[#A8A6C0] → #4F46E5
     이름: text-xs font-semibold text-[#1A1826] truncate
     시간: text-[10px] text-[#A8A6C0]
   
   데이터: 회의록 문장정리/3분 전, 이메일 문체변경/오전 10:22, 번역 비서/어제 오후, 코드 리뷰 비서/어제 오전

④ 추천 비서 (SectionHeader: Sparkles)
   grid grid-cols-2 md:grid-cols-4 gap-3 → AssistantCard
   데이터: 보도자료 초안, 코드 리뷰 비서, 번역 비서, 문서 요약 비서

⑤ 자주 사용하는 비서 (SectionHeader: TrendingUp)
   flex flex-col gap-1.5
   
   순위 카드:
     button group/fr flex items-center gap-3 px-4 py-3 rounded-xl
     border border-[#E4E2F0] bg-white text-left
     hover:border-[#4F46E5]/30 hover:shadow-sm hover:shadow-[#4F46E5]/8
     
     순위: text-[11px] font-bold text-[#A8A6C0] w-5 text-center shrink-0
           1→① 2→② 3→③ 4→4 5→5 (유니코드 원문자)
     아이콘: w-7 h-7 rounded-lg bg-[#F4F3FC] group-hover→bg-[#EEF0FF], Icon 14px
     이름: text-xs font-semibold text-[#1A1826] flex-1 truncate
     횟수: text-[10px] text-[#A8A6C0] shrink-0
     설명 (hover 시 펼침):
       text-[10.5px] text-[#A8A6C0] ml-2 shrink-0
       max-w-0 overflow-hidden opacity-0 whitespace-nowrap
       group-hover/fr:max-w-[180px] group-hover/fr:opacity-100
       transition-all duration-200 ease-out
   
   데이터:
     1위: 회의록 문장정리 / 이번달 24회
     2위: 이메일 문체변경 / 이번달 18회
     3위: 번역 비서 / 이번달 11회
     4위: 코드 최적화 / 이번달 9회
     5위: 문서 요약 비서 / 이번달 6회

⑥ 전체 비서 보기 버튼 (중앙 정렬)
   flex justify-center pt-2 pb-4
   button: flex items-center gap-2 px-6 py-3 rounded-xl
           border-2 border-[#4F46E5]/30 text-[#4F46E5] text-sm font-semibold
           hover:bg-[#4F46E5] hover:text-white hover:border-[#4F46E5]
           hover:shadow-md hover:shadow-[#4F46E5]/25 transition-all duration-200
   LayoutGrid w-4 h-4 + "전체 비서 보기" + ArrowRight w-4 h-4
```

---

## 12. 갤러리 뷰 (GalleryView) — 공식 비서 하위 뷰

### 브레드크럼
```
px-6 md:px-8 pt-4 pb-3 flex items-center gap-1.5 text-[12px] shrink-0
← ChevronLeft w-4 h-4 + "공식 비서" (text-[#A8A6C0] hover:text-[#4F46E5])
"/"
"전체 비서" (font-bold text-[#1A1826])
개수 뱃지: text-[10px] text-[#A8A6C0] bg-[#F4F3FC] px-1.5 py-0.5 rounded-full ml-1
```

### 필터 바
```
px-6 md:px-8 pb-4 flex items-center justify-between shrink-0 flex-wrap gap-2

카테고리 필터:
  flex gap-1 p-1 rounded-xl bg-[#F4F3FC] border border-[#E4E2F0]
  overflow-x-auto (scrollbarWidth:none)
  각 카테고리 버튼: px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all
    활성: bg-[#4F46E5] text-white shadow-sm shadow-[#4F46E5]/25
    비활성: text-[#6B6882] hover:text-[#1A1826] hover:bg-white/70
  카테고리: 전체 / 글쓰기 / 코드 / 번역 / 분석 / 법률·회계

오른쪽:
  필터 버튼: px-3 py-1.5 rounded-lg border border-[#E4E2F0] text-[#6B6882]
             hover:border-[#4F46E5]/30 hover:text-[#4F46E5] text-xs
             SlidersHorizontal w-3.5 h-3.5 + "필터"
  
  뷰 모드 토글 (border border-[#E4E2F0] rounded-lg overflow-hidden):
    그리드/목록 버튼: p-2
    활성: bg-[#4F46E5] text-white
    비활성: text-[#A8A6C0] hover:text-[#6B6882] hover:bg-[#F4F3FC]
    LayoutGrid / List w-3.5 h-3.5
```

### 그리드 뷰
```
grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 → AssistantCard
```

### 목록 뷰
```
flex flex-col gap-1.5

항목 버튼: flex items-center gap-3 px-4 py-3 rounded-xl
           border border-[#E4E2F0] bg-white text-left
           hover:border-[#4F46E5]/30 hover:shadow-sm

아이콘: w-8 h-8 rounded-xl bg-[#F4F3FC] → bg-[#EEF0FF], Icon 16px text-[#A8A6C0] → #4F46E5
이름: text-xs font-semibold text-[#1A1826] truncate
NEW 뱃지: text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#D4930A]/10 text-[#D4930A]
설명 (hover 펼침):
  text-[10.5px] text-[#A8A6C0] mt-0.5 truncate
  max-h-0 opacity-0 → group-hover/li:max-h-5 group-hover/li:opacity-100
  transition-all duration-200
이용자수: text-[10px] text-[#A8A6C0] shrink-0
```

---

## 13. 공식 비서 상세 모달 (AssistantInfoModal)

### 모달 래퍼
```
fixed inset-0 z-[200] flex items-center justify-center p-4
백드롭: absolute inset-0 bg-black/30 backdrop-blur-[2px]
모달 박스: relative z-10 w-full max-w-[680px] bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col
```

### 헤더
```
px-6 pt-6 pb-4 shrink-0
flex items-start justify-between gap-4

왼쪽:
  아이콘 박스: w-11 h-11 rounded-xl bg-[#F4F3FC] (Icon: text-[#4F46E5] 22px)
  이름: text-[18px] font-bold text-[#1A1826]
  카테고리 뱃지: text-[10px] font-semibold px-2 py-0.5 rounded-full (카테고리별 색상)
  상태: "공식" 텍스트 (text-[11px] text-[#4F46E5]) + "by JPDC"

X 닫기: p-1.5 rounded-lg text-[#A8A6C0] hover:text-[#1A1826] hover:bg-[#F4F3FC]
         XIcon w-4 h-4 strokeWidth={2}
```

### 통계 행
```
border-t border-[#E4E2F0]
px-6 py-4 grid grid-cols-4 divide-x divide-[#E4E2F0]

각 통계: flex flex-col items-center gap-0.5 px-3
  숫자/값: text-[15px] font-bold text-[#1A1826]
  레이블: text-[11px] text-[#A8A6C0]

항목: ⭐ 평점 | 💬 대화수 | 📨 메시지수 | 👍/👎 반응
```

### 별점 분포 바
```
px-6 py-4 border-t border-[#E4E2F0]
각 행: flex items-center gap-2
  별수: text-[11px] text-[#A8A6C0] w-4
  바: flex-1 h-1.5 rounded-full bg-[#E4E2F0] 내부 bg-[#F59E0B] rounded-full
  카운트: text-[11px] text-[#A8A6C0] w-6 text-right
```

### 설명·대화 시작 문장
```
flex-1 overflow-y-auto px-6 py-5 (scrollbarWidth:none)
설명: text-[13px] text-[#6B6882] leading-relaxed mb-5
대화 시작 문장:
  p-3.5 rounded-xl border border-[#E4E2F0] bg-[#F9F8FF] hover:border-[#C7C3F7] hover:bg-[#F0EEFF]
  text-[12px] text-[#4F46E5] font-medium
코멘트: border border-[#E4E2F0] rounded-xl px-4 py-3 (작성자+날짜+텍스트)
```

### 같은 작성자의 다른 비서
```
shrink-0, border-t border-[#E4E2F0], px-6 py-4
제목: text-[12px] font-semibold text-[#6B6882] mb-3
row: flex gap-2 overflow-x-auto (scrollbarWidth:none)
각 버튼: flex-none flex items-center gap-2 px-3 py-2 rounded-lg
          border border-[#E4E2F0] bg-white hover:border-[#C7C3F7] hover:bg-[#F4F3FC]
          icon w-5 h-5 rounded-lg bg-[#F4F3FC] (Icon 12px)
          이름: text-[11px] font-semibold text-[#1A1826]
```

### 하단 버튼 행
```
shrink-0, px-6 py-4 border-t border-[#E4E2F0], flex gap-2

복제 버튼 (flex-1):
  Tooltip: "클릭하면 '내가 만든 비서' 탭에 복제됩니다" className="flex-1"
  px-4 py-2.5 rounded-xl border border-[#E4E2F0] text-[#6B6882]
  hover:border-[#4F46E5]/30 hover:text-[#4F46E5] text-[12px] font-semibold transition-colors
  Copy w-4 h-4 + "복제"

채팅 시작 (flex-1):
  bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 py-2.5 rounded-xl
  text-[12px] font-semibold shadow-sm shadow-[#4F46E5]/20
  MessageSquare w-4 h-4 + "채팅 시작"
```

---

## 14. 통계 모달 (AssistantStatsModal)

```
fixed inset-0 z-[200] flex items-center justify-center p-4
백드롭: bg-black/30 backdrop-blur-[2px]
모달: w-full max-w-[520px] bg-white rounded-2xl shadow-2xl overflow-hidden

헤더 (px-6 pt-6 pb-4):
  이름: text-[17px] font-bold text-[#1A1826]
  설명: text-[12px] text-[#6B6882] mt-1
  X: p-1.5 rounded-lg text-[#A8A6C0] hover → bg-[#F4F3FC]

통계 행 (px-6 py-5 grid grid-cols-6 divide-x divide-[#E4E2F0]):
  각 셀: flex flex-col items-center gap-1 px-2
  값: text-[15px] font-bold text-[#1A1826]
  레이블: text-[11px] text-[#A8A6C0]
  항목: 평가(별점) / 좋아요👍 / 싫어요👎 / 대화수 / 메시지수 / 코멘트수

코멘트 영역 (px-6 py-5 max-h-[280px] overflow-y-auto):
  제목: text-[14px] font-bold text-[#1A1826] mb-4 "코멘트"
  각 코멘트: border border-[#E4E2F0] rounded-xl px-4 py-3
             작성자: text-[12px] font-semibold text-[#1A1826]
             날짜: text-[11px] text-[#A8A6C0]
             내용: text-[12px] text-[#6B6882] leading-relaxed

하단 버튼 (px-6 py-4 border-t flex justify-end gap-2):
  "코멘트 숨기기/보기": 아웃라인 버튼 (12px)
  "닫기": 동일
```

---

## 15. 비서 만들기 / 수정 (AssistantBuilderView)

### 헤더
```
h-12 shrink-0 border-b border-[#E4E2F0] px-4 flex items-center gap-3

← 뒤로: ChevronLeft w-5 h-5 text-[#A8A6C0] hover:text-[#4F46E5]
제목:
  수정 모드: "비서 수정" + "수정 모드" 뱃지 (bg-[#EEF0FF] text-[#4F46E5] text-[10px] px-2 py-0.5 rounded-full)
  생성 모드: "나만의 비서 만들기"
저장 버튼 (ml-auto):
  수정: "수정 저장" bg-[#4338CA] → bg-[#3730A3]
  생성: "저장" bg-[#4F46E5] → bg-[#4338CA]
  text-white text-xs font-semibold px-4 py-1.5 rounded-lg shadow-sm
```

### 스텝 1 — 채팅 단계 (editMode=false 일 때만)
```
중앙 정렬, flex flex-col items-center justify-center gap-6 px-4 py-10

아이콘: w-14 h-14 rounded-2xl bg-[#4F46E5]/10, Sparkles w-7 h-7 text-[#4F46E5]
제목: text-xl font-bold text-[#1A1826]
설명: text-sm text-[#6B6882] text-center

채팅 버블 영역 (max-w-xl w-full):
  AI 메시지: bg-[#F4F3FC] rounded-2xl rounded-tl-sm px-4 py-3 text-[13px] text-[#1A1826]
  사용자 메시지: bg-[#4F46E5] rounded-2xl rounded-tr-sm px-4 py-3 text-[13px] text-white ml-auto

입력창:
  flex items-end gap-2 bg-white rounded-2xl border border-[#E4E2F0]
  focus-within:border-[#C7C3F7] shadow-sm
  textarea: resize-none px-4 pt-3 pb-3 text-sm min-h-[52px] max-h-[120px]
  전송 버튼: w-8 h-8 rounded-full bg-[#4F46E5] hover:bg-[#4338CA] text-white (ArrowUp)
```

### 스텝 2 — 폼 단계
```
flex-1 overflow-y-auto px-6 py-5 (scrollbarWidth:none)
space-y-6

폼 섹션 구조:
  섹션 제목: text-[13px] font-bold text-[#1A1826] mb-3
  border-b border-[#E4E2F0] pb-6 (마지막 제외)

입력 필드 공통:
  label: block text-[11px] font-semibold text-[#6B6882] mb-1.5
  input/textarea: w-full px-3 py-2 rounded-xl border border-[#E4E2F0] bg-[#FAFAFF]
                  text-[13px] text-[#1A1826] outline-none
                  focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10

① 기본 정보
  - 로고: 아이콘 선택 그리드 (6열) + 색상 선택
  - 비서 이름: input (placeholder: "예: 계약서 검토 비서")
  - 설명: textarea 2행 (placeholder: "한 줄 설명")

② 카테고리
  - 그리드 선택: 글쓰기 / 코드 / 번역 / 분석 / 법률·회계 / 행정 / 기타
  - 활성: bg-[#4F46E5] text-white border-[#4F46E5]
  - 비활성: border-[#E4E2F0] text-[#6B6882] hover:border-[#C7C3F7]

③ 지시사항 (textarea 6행): 비서에게 줄 상세 역할·행동 지침

④ 금지사항: 태그 입력 UI (Enter로 추가, X로 삭제)
   태그: px-2.5 py-1 rounded-full bg-[#FFF5F5] text-[#DC2626] border border-[#FECACA] text-[11px]

⑤ 대화 시작 문장: 최대 3개, + 추가 버튼
   각 항목: flex gap-2, input + X 버튼

⑥ 지식 파일: 파일 업로드 드롭존

⑦ 첫 인사말: textarea 3행

⑧ 기반 모델: 토글 스위치 (use_foundation_model)

⑨ 공개 범위: 5개 옵션 (비공개/지정자/부서/본부/전사) 라디오 스타일
```

---

## 16. 복제 하이라이트 이벤트

### 트리거 조건
```
1. [내가 만든 비서 탭] 복제 버튼 클릭 → handleClone(index)
   - 원본 카드 바로 앞(index 위치)에 새 카드 삽입
   - 새 카드 이름: `${원본이름} [복제]`

2. [공식 비서 모달] 복제 버튼 클릭 → handleCloneFromModal(a)
   - 목록 맨 앞에 새 카드 삽입
   - 새 카드 이름: `[복제] ${원본이름}`
   - 모달 닫힘 + '내가 만든 비서' 탭으로 이동
```

### 시각 효과 (AssistantListCard)
```
마운트 시 lit = !!isHighlighted (true면 즉시 발동)
useEffect: 2800ms 후 setLit(false)

lit=true 상태:
  카드 테두리: borderColor '#F59E0B' (앰버)
  카드 배경: 'rgba(245,158,11,0.05)' (매우 연한 앰버)
  상단 3px 스트라이프: 
    linear-gradient(90deg, #F59E0B 0%, #FCD34D 50%, #F59E0B 100%)
    opacity 1

lit=false 상태 (2.8초 후):
  borderColor '#E4E2F0'
  backgroundColor '#ffffff'
  스트라이프 opacity 0
  전환: transition 'border-color 1.2s ease-out, background-color 1.2s ease-out'
        스트라이프 'opacity 1.2s ease-out'

새 카드명 형식:
  탭내 복제: "${source.name} [복제]"
  모달 복제: "[복제] ${a.name}"
```

---

## 17. 데이터 — 전체 비서 목록 (ALL_ASSISTANTS)

| 이름 | 아이콘 | 카테고리 | 이용자 | NEW |
|---|---|---|---|---|
| 회의록 문장정리 | PenTool | 글쓰기 | 12.4k | |
| 이메일 문체변경 | Mic2 | 글쓰기 | 9.1k | |
| 보도자료 초안 | FileText | 글쓰기 | 6.3k | |
| 블로그 글쓰기 | PenTool | 글쓰기 | 4.1k | ✓ |
| 코드 리뷰 비서 | Code | 코드 | 18.2k | |
| 코드 최적화 | Code | 코드 | 7.4k | |
| 테스트 코드 생성 | Code | 코드 | 5.2k | ✓ |
| 번역 비서 | Globe | 번역 | 15.7k | |
| 동시통역 비서 | Globe | 번역 | 3.8k | ✓ |
| 데이터 분석 비서 | BarChart2 | 분석 | 11.9k | |
| 문서 요약 비서 | BookOpen | 분석 | 8.8k | |
| 시장조사 비서 | TrendingUp | 분석 | 4.5k | ✓ |
| 법률 자문 비서 | BookOpen | 법률·회계 | 3.2k | ✓ |
| 계약서 검토 비서 | FileText | 법률·회계 | 5.8k | |
| 회계 정산 비서 | BarChart2 | 법률·회계 | 2.9k | ✓ |

---

## 18. 데이터 — 내가 만든 비서 초기 목록 (MY_ASSISTANTS)

| 이름 | 아이콘 | 상태 | 스코프 | 버전 | 대화수 | 메시지수 |
|---|---|---|---|---|---|---|
| 계약 검토 도우미 | FileText | 공식 | 전사 | v2 | 24 | 138 |
| 민원 답변 초안 | MessageSquare | 승인 대기 | 부서 | v1 | 8 | 41 |
| 예산 검토 비서 | BarChart2 | (없음) | 비공개 | v1 | 5 | 22 |
| 내부 보고서 요약 | BookOpen | 임시저장 | 비공개 | (없음) | 0 | 0 |

---

## 19. 대화 화면 (ConversationView) 핵심 구조

### 상단 툴바 (h-12)
```
HomeView Topbar와 동일 구조
좌측: 모바일 사이드바 토글, 브리핑 버튼
우측: 알림, 저장목록
```

### 채팅 영역
```
flex-1 overflow-y-auto px-4 md:px-6 py-4 (scrollbarWidth:none)

사용자 메시지 버블:
  ml-auto max-w-[75%] bg-[#4F46E5] text-white
  px-4 py-3 rounded-2xl rounded-tr-sm text-sm

AI 응답:
  "생각 중..." 애니메이션 → 단계별 스킬 탐색 표시 (2~4초)
  이후 스트리밍 텍스트 표시

전문 패널 (쿼리 유형별):
  - TagStatsPanel: 테이블 + Recharts BarChart/LineChart
  - DualTagPanel: 2가지 해석 비교
  - RagAbPanel: RAG A/B 비교
  - AssistantSelectPanel: 비서 추천 카드
  - MinutesResultPanel: 회의록 형식
```

### 하단 입력창
```
HomeView 채팅 입력창과 동일 스타일
추가: 피드백 버튼 (👍 👎), 저장, 내보내기 버튼
```

---

## 20. 다크 모드

```
html.dark 적용 시 CSS 변수 오버라이드:
  배경: #0F0D1A
  서피스: #1A1726
  테두리: #2A2740
  입력 배경: #211E33
  텍스트: #EAE8F5
  placeholder: #52506E

input, textarea 다크모드:
  color: #EAE8F5 !important
  caret-color: #7C6FF7
  placeholder: #52506E !important

스크롤바:
  track: #1A1726
  thumb: #2E2B47 → hover: #3D3960
```

---

## 21. 반응형 브레이크포인트

| 브레이크 | 기준 | 주요 변화 |
|---|---|---|
| `md` | 768px 이상 | 사이드바 항상 표시, 그리드 2→4열, px-4→px-8 |
| `sm` | 640px 이상 | 버튼 텍스트 표시 (이하 아이콘만) |
| 모바일 | 768px 미만 | 사이드바 오버레이, 1열 그리드 |

---

## 22. 상태 관리 (App.tsx 루트 상태)

| 상태 | 타입 | 초기값 | 설명 |
|---|---|---|---|
| activeView | 'home'\|'market'\|'briefing'\|'conversation' | 'home' | 현재 화면 |
| sidebarOpen | boolean | window.innerWidth >= 768 | 사이드바 열림/닫힘 |
| settingsOpen | boolean | false | 설정 모달 |
| query | string | '' | 채팅 입력값 |
| conversationKey | number | 0 | 대화 리셋 키 |
| assistantContext | object\|null | null | 선택된 비서 컨텍스트 |
| savedItems | SavedItem[] | [] | 저장된 답변 목록 |
| savedPanelOpen | boolean | false | 저장 패널 열림 |
| notifPanelOpen | boolean | false | 알림 패널 열림 |
| notifUnread | number | INITIAL_UNREAD | 미읽음 알림 수 |

### MarketView 내부 상태

| 상태 | 타입 | 초기값 |
|---|---|---|
| activeTab | 'my'\|'test'\|'official' | 'official' |
| showGallery | boolean | false |
| selectedAssistant | AssistantDetail\|null | null |
| showBuilder | boolean | false |
| editTarget | {draft: DraftJson}\|null | null |
| myList | MyAssistant[] | MY_ASSISTANTS |

---

## 23. 트랜지션 & 애니메이션 일람

| 요소 | 속성 | 값 |
|---|---|---|
| 사이드바 너비 | transition-[width] | duration-300 ease-in-out |
| 사이드바 펼침/접힘 콘텐츠 | transition-[opacity] | duration-200, delay-100 |
| 모든 버튼 | transition-colors | duration-150~200 |
| AssistantCard hover | all | duration-200 (-translate-y-0.5) |
| 자주쓰는 비서 설명 hover | max-w + opacity | duration-200 ease-out |
| 갤러리 목록 설명 hover | max-h + opacity | duration-200 |
| 복제 카드 테두리+배경 | 인라인 transition | 1.2s ease-out |
| 복제 스트라이프 | opacity 인라인 | 1.2s ease-out |
| Tooltip | opacity | duration-150 delay-300 |
| 전송 버튼 활성화 | 색상 전환 | transition-colors |

---

## 24. 아이콘 사용 일람 (lucide-react)

| 아이콘 | 위치 |
|---|---|
| Plus | 사이드바 새대화, 비서 없음 상태, 나만의 비서 만들기 버튼 |
| Store | 사이드바 비서마켓, 마켓뷰 헤더 |
| Search | 검색창, 검색 버튼, 결과없음 |
| ChevronLeft/Right | 사이드바 토글, 갤러리 브레드크럼, 빌더 뒤로가기 |
| Sparkles | 브리핑 버튼, 추천 비서 섹션 헤더, 빌더 스텝1 |
| BarChart2 | 통계 섹션 헤더, 비서 아이콘 |
| Clock | 최근 사용 섹션 헤더 |
| TrendingUp | 자주 사용 섹션 헤더, 비서 아이콘 |
| Star | 통계 카드, 별점 |
| Users | 통계 카드, 이용자수 |
| MessageSquare | 통계 카드, 비서 아이콘 |
| Zap | 이건 어때요! 섹션 헤더 |
| ArrowRight | SectionHeader action, 전체 비서 보기 |
| LayoutGrid | 전체 비서 보기, 그리드 뷰 토글 |
| List | 목록 뷰 토글 |
| SlidersHorizontal | 필터 버튼 |
| Bell | 알림 버튼 |
| BookmarkCheck | 저장목록 버튼 |
| Menu | 모바일 사이드바 토글 |
| FlaskConical | 테스트 탭 배너 |
| Settings | 설정 버튼 |
| LogOut | 로그아웃 버튼 |
| Moon/Sun | 다크모드 토글 |
| XIcon(X) | 닫기, X 버튼 |
| Lock/Unlock | 빌더 공개 범위 |
| Settings2 | 빌더 설정 |
| CheckCircle2/XCircle/AlertCircle | 상태 표시 |

---

## 25. 핵심 UX 이벤트 흐름

```
① 홈 → 채팅 시작:
   textarea 입력 → 전송 버튼/Enter → ConversationView로 이동 (query 전달)

② 홈 → 비서 선택 채팅:
   "비서 선택" 드롭다운 → 비서 선택 → assistantContext 설정 → 전송 → ConversationView

③ 비서마켓 → 비서 상세:
   공식비서 카드/최근/추천 클릭 → AssistantInfoModal 열림 → "채팅 시작" → ConversationView

④ 공식비서 모달 → 복제:
   "복제" 클릭 → [복제] 카드를 myList 맨 앞 추가 → 모달 닫힘 → 'my' 탭으로 이동
   → 카드 앰버 하이라이트 2.8초 표시

⑤ 내가 만든 비서 → 수정:
   카드 "수정" 버튼 → handleEditAssistant() → AssistantBuilderView(editMode=true)

⑥ 내가 만든 비서 → 이어서 작성:
   isDraft 카드 "이어서 작성" → handleEditAssistant() → AssistantBuilderView(editMode=true)

⑦ 내가 만든 비서 → 탭내 복제:
   카드 "복제" 버튼 → 원본 앞에 "[복제]" 카드 삽입 → 앰버 하이라이트 표시

⑧ 사이드바 접힘 상태에서 아이콘 클릭:
   새 대화 / 비서마켓 → 해당 뷰 이동 + 사이드바 펼침
   검색 → 사이드바 펼침만

⑨ 갤러리 전체 비서 보기:
   "전체 비서 보기" 버튼 → showGallery=true → GalleryView 렌더링
   카테고리 필터 + 그리드/목록 뷰 전환 가능

⑩ 비서 만들기:
   "나만의 비서 만들기" 버튼 → showBuilder=true → AssistantBuilderView (신규 모드)
   스텝1(채팅) → generateDraft 호출 → 스텝2(폼) → 저장
```

---

## 26. 브리핑 화면 (BriefingModal.tsx)

### 26-1. 진입 방법
```
홈/마켓 Topbar의 "브리핑" 버튼(Sparkles) 클릭
→ App.tsx에서 activeView = 'briefing'으로 전환
→ BriefingModal 컴포넌트가 메인 콘텐츠 영역을 대체
닫기: X 버튼 → activeView 이전 뷰('home' 등)로 복귀
```

### 26-2. 헤더 (h-12, border-b)
```
flex items-center justify-between px-4 md:px-6 border-b border-[#E4E2F0]

왼쪽:
  - 모바일 사이드바 토글: Menu w-5 h-5 (md:hidden)
  - "JPDC AI" text-[15px] font-bold text-[#1A1826] tracking-tight
  - "브리핑" text-[15px] font-bold text-[#4F46E5]

오른쪽 (flex items-center gap-3):
  ① 갱신 안내: RefreshCw w-3 h-3 + "매일 08:30 갱신 · 배포 ·"
               text-[11px] text-[#A8A6C0]
  ② 알림 버튼: Bell + "알림" + 미읽음 배지 (HomeView와 동일 스타일)
               Tooltip: "알림 센터 열기" position="bottom"
  ③ 저장목록: BookmarkCheck + "저장목록" + 아이템수 배지
               Tooltip: "저장된 답변 목록 열기" position="bottom"
  ④ 닫기: X w-[18px] h-[18px] strokeWidth={1.8}
           p-1.5 rounded-lg text-[#A8A6C0] hover:text-[#1A1826] hover:bg-[#F4F3FC]
           Tooltip: "브리핑 닫기" position="bottom"
```

### 26-3. 콘텐츠 영역 (flex-1 overflow-hidden px-6 py-6)
```
내부: <div class="h-full overflow-y-auto" style="scrollbar-width:none">
```

### 26-4. 섹션 1 — 지식 브리핑

**헤더 텍스트 블록**
```
날짜: text-[11px] text-[#A8A6C0] mb-2
      "2026년 7월 23일 (목) · 아침 브리핑"

제목: text-[20px] font-bold text-[#1A1826] leading-tight mb-2
      "오늘 홍길동 과장님 업무에 필요할 정보 "
      <span class="text-[#4F46E5]">"1건"</span>
      "을 골라두었습니다."

부제: text-[13px] text-[#6B6882] mb-5
      "어제 문답 기록에서 찾았습니다."
```

**QA 카드 (border border-[#E4E2F0] rounded-xl overflow-hidden mb-8)**
```
① 카드 헤더 (bg-[#F9F8FF] border-b border-[#E4E2F0] px-5 py-3):
   BookOpen w-3.5 h-3.5 text-[#4F46E5] strokeWidth={1.8}
   "문답에서 발견" text-[11px] font-semibold text-[#4F46E5] uppercase tracking-wide

② 본문 (px-5 py-4):
   소제목: text-[13px] font-semibold text-[#1A1826] mb-4
           "어제 동료들이 가장 많이 물어본 질문 2건입니다"

   QA 항목 × 2개 (두 번째부터 border-t border-[#E4E2F0] mt-5 pt-5):
     Q 행: text-[12px] font-bold text-[#1A1826] mb-1.5  "Q  {질문}"
     A 행: text-[11.5px] text-[#6B6882] leading-relaxed line-clamp-3 mb-2
     "전체 답변 보기" 버튼:
       text-[11px] font-semibold text-[#4F46E5]
       border border-[#4F46E5]/30 px-3 py-1 rounded-lg
       hover:bg-[#4F46E5]/5 transition-colors

③ 카드 푸터 (bg-[#F9F8FF] border-t border-[#E4E2F0] px-5 py-2.5):
   text-[10.5px] text-[#A8A6C0]
   "안내 기준 어제 문답을 유사한 질의끼리 묶어 많이 물어본 순으로 골랐습니다. 참고로 정보는 표시되지 않습니다."
```

**데이터 (QA_ITEMS)**
```
항목 1:
  Q: "내용 요약해줘"
  A: "본 연구는 원전이 입지한 지역의 지역신문을 분석하여…"

항목 2:
  Q: "법령의 근거가 뭐야?"
  A: "에너지·환경시설의 각 단계별 행위는 관련 법령의 구체적 조문에 근거한다…"
```

### 26-5. 섹션 2 — 대화 분석

**헤더 텍스트 (border-t border-[#E4E2F0] pt-7 mb-5)**
```
제목: text-[20px] font-bold text-[#1A1826] leading-tight mb-2
      "이번 주 대화에서 급상승 주제 "
      <span class="text-[#4F46E5]">"5건"</span>
      "을 찾았습니다."

부제: text-[13px] text-[#6B6882] mb-5
      "실제 대화를 유사 그룹으로 묶어 전주와 비교하고, 깊은 주제를 다시 물었을 때의 답변을 대조했습니다."
```

**TRENDING 섹션 레이블 (mb-3 border-b border-[#E4E2F0] pb-2)**
```
"급상승 주제 — TRENDING"  text-[11px] text-[#A8A6C0] tracking-wide font-medium
```

**Trending 카드 목록 (flex flex-col gap-3 pb-8)**
```
각 카드: border border-[#E4E2F0] rounded-xl px-5 py-4
         hover:bg-[#F9F8FF] transition-colors cursor-pointer

내부 구조:
  상단 행 (flex items-start justify-between gap-3):
    왼쪽: flex items-center gap-1.5 mb-2
      - 빨간 점: w-2 h-2 bg-[#EF4444] rounded-sm
      - "급상승 주제" text-[10px] text-[#6B6882]
    오른쪽: lastWeek === 0 이면 "NEW" text-[10px] font-semibold text-[#D4930A]

  제목: text-[14px] font-semibold text-[#1A1826] leading-snug mb-1.5
  통계: text-[11.5px] text-[#6B6882]  "이번 주 {N}건 · 지난주 {M}건"
```

**데이터 (TRENDING)**
```
1. "「전기사업법 7조 알려줘」, 질의가 이번 주 새로 나타났습니다" / 14건 / 0건 / NEW
2. "「다른 지역은 허가권자가 다른가요?」, 질의가 이번 주 새로 나타났습니다" / 7건 / 0건 / NEW
3. "「개발행위허가 기준을 요약해줘 (3023)」, 질의가 이번 주 새로 나타났습니다" / 4건 / 0건 / NEW
4. "「작성자가 누구야?」, 질의가 이번 주 새로 나타났습니다" / 4건 / 0건 / NEW
5. "「통계 요약해줘」, 질의가 이번 주 새로 나타났습니다" / 3건 / 0건 / NEW
```

---

## 27. TAG 분할 — TAG 통계 + Dual TAG (ConversationView)

### 27-1. 질의 분류 로직 (classifyQuery)

```typescript
// 우선순위 순서로 적용
1. RAG_AB_QUERIES 포함 → 'rag-ab'      (특정 문자열 정확 매칭)
2. DUAL_TAG_QUERIES 포함 → 'dual-tag'  (특정 문자열 정확 매칭)
3. TAG 키워드 포함 → 'tag-stats'
4. 비서 키워드 + 지침 키워드 동시 → 'ambiguous'
5. 지침 키워드만 → 'instruction'
6. 비서 키워드만 → 'assistant-select'
7. 아무 신호 없음 → 'ambiguous'

TAG 키워드:
  '통계', '현황', '추이', '얼마나', '몇 명', '몇명', '몇 건', '몇건',
  '비율', '평균', '월별', '분기', '연도별', '연도', '랭킹', '상위',
  '건수', '사용량', '사용률', '이용률', '집계', '몇회', '몇 회', '얼마',
  '얼마나 됩', '몇 개', '몇개', '추이를', '변화', '합계', '생산량', '보여줘'

특수 트리거 (exact match):
  RAG_AB:   '삼다수 브랜드 관리 지침 알려줘' → 'rag-ab'
  DUAL_TAG: '3월 생산량 합계 보여줘' → 'dual-tag'
```

### 27-2. ThinkingProcess 컴포넌트 (처리 중 애니메이션)

```
표시 타이밍: AI 응답 생성 전 단계
레이아웃: flex gap-3 items-start

AI 아바타: w-8 h-8 rounded-xl
  bg-gradient-to-br from-[#4F46E5] to-[#7C6FF7]
  Sparkles w-4 h-4 text-white strokeWidth={1.8}
  shadow-sm shadow-[#4F46E5]/25 mt-0.5

분류 배지 (queryKind별 color/bg/border — KIND_LABEL 맵 참조):
  kind=tag-stats:   color=#4F46E5, bg=#EEF0FF, border=#C7C3F7   "TAG 통계 분류 완료"
  kind=dual-tag:    color=#4F46E5, bg=#EEF0FF, border=#C7C3F7   "TAG 통계 분류 완료"
  kind=rag-ab:      color=#0EA5E9, bg=#F0F9FF, border=#BAE6FD   "RAG 지침 분류 완료"
  kind=ambiguous:   color=#8B5CF6, bg=#F5F3FF, border=#DDD6FE   "의도 불명확 분류 완료"
  kind=instruction: color=#10B981, bg=#ECFDF5, border=#6EE7B7   "지침 분류 완료"
  kind=assistant-select: color=#F59E0B, bg=#FFFBEB, border=#FDE68A  "비서 추천 분류 완료"
  kind=minutes-*:   color=#7C3AED, bg=#F5F3FF, border=#DDD6FE   "회의록 비서 분류 완료"

스텝 표시 애니메이션:
  visibleCount 상태로 단계별 나타남 (useEffect + setTimeout)
  각 스텝: 첫 번째 200ms, 이후 480ms → 540ms 간격
  완료 400ms 후 onDone() 콜백

스텝별 아이콘:
  kind='thought':     Brain 아이콘 (w-3.5 h-3.5 text-[#4F46E5])
  kind='skill-group': Sparkles 아이콘 + 스킬 태그 배지들
  kind='result':      CheckCircle2 (text-emerald-500)

THOUGHT_STEPS['dual-tag']:
  1. "질의 의도 분석: 자연어 통계 조회 (TAG 질의) 감지 — 2가지 해석 경로 탐지"
  2. [자연어 파싱 스킬, SQL 생성 스킬, 2분할 해석 스킬]
  3. "JPDC 생산 DB 연결 — 두 가지 쿼리 병렬 실행 완료"
  4. "2분할 통계 결과 생성 시작"

THOUGHT_STEPS['tag-stats']:
  1. "질의 의도 분석: 자연어 통계 조회 (TAG 질의) 감지"
  2. [자연어 파싱 스킬, 통계 분석 스킬, 데이터 시각화 스킬]
  3. "JPDC 데이터베이스 연결 — 쿼리 실행 완료"
  4. "통계 답변 + 차트 생성 시작"
```

### 27-3. TagStatsPanel (TAG 통계 단일 패널)

```
트리거: TAG 키워드 포함 질의 (단, DUAL_TAG 특수 트리거 제외)
레이아웃: flex gap-3 items-start
AI 아바타: Sparkles (동일)

분류 배지:
  BarChart2 w-3 h-3 strokeWidth={2}
  bg-[#EEEEFF] border-[#C7C3F7] text-[#4F46E5]
  "TAG 통계 질의" + "자연어 통계 분석 결과"

① 텍스트 답변 버블 (스트리밍)
  bg-white border border-[#E4E2F0] rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm
  스트리밍: StreamingAnswer → textDone 상태로 전환
  완료 후 renderText()로 마크다운 렌더링 (굵게, 줄바꿈)

② 데이터 테이블 (스트리밍 완료 후 표시)
  컨테이너: bg-white border border-[#E4E2F0] rounded-xl overflow-hidden shadow-sm
  헤더 바: px-4 py-2 bg-[#F9F8FF] border-b border-[#E4E2F0]
            "상세 데이터" text-[11px] font-semibold text-[#6B6882] uppercase tracking-wide
            TrendingUp w-3.5 h-3.5 text-[#C7C3F7] (오른쪽)
  테이블 헤더: text-[10.5px] font-semibold text-[#A8A6C0] bg-[#FAFAFA]
  테이블 행:   hover:bg-[#F9F8FF], divide-y divide-[#F4F3FC]
    항목 열:   px-4 py-2.5 text-[#6B6882] font-medium
    값 열:     px-4 py-2.5 text-right font-semibold text-[#1A1826] "{N.toLocaleString()}{unit}"

③ 차트 (스트리밍 완료 후 표시)
  컨테이너: bg-white border border-[#E4E2F0] rounded-xl p-4 shadow-sm
  제목: text-[11px] font-semibold text-[#6B6882] uppercase tracking-wide mb-3 (tableTitle)
  ResponsiveContainer width="100%" height={160}

  chartType='bar' → BarChart:
    Bar fill="#4F46E5" radius={[4,4,0,0]}
    CartesianGrid strokeDasharray="3 3" stroke="#F0EEFA" vertical=false
    XAxis/YAxis: tick fontSize/fill, axisLine=false tickLine=false
    Tooltip: bg white, border #E4E2F0, borderRadius 8, fontSize 12, shadow

  chartType='line' → LineChart:
    Line stroke="#4F46E5" strokeWidth={2.5}
    dot: fill="#4F46E5" r=4 / activeDot: r=6
```

**getTagStatsData() 반환 데이터 예시**

```
질의에 '사용' or '이용' 포함:
  answer: "JPDC AI **사용 현황**을 조회했습니다. … 이번 달(7월)은 전월 대비 **+18.3%** 증가한 4,821건…"
  tableTitle: "월별 JPDC AI 사용 건수"
  rows: 2월 1840건 / 3월 2210건 / 4월 2890건 / 5월 3420건 / 6월 4077건 / 7월 4821건
  chartType: 'bar'
  summary: ["이번 달 질의" 4,821건 (positive), "전월 대비" +18.3% (positive), "누적 이용 부서" 12개]
```

### 27-4. DualTagPanel (TAG 2분할 패널)

```
트리거: '3월 생산량 합계 보여줘' (DUAL_TAG 정확 매칭)
레이아웃: flex gap-3 items-start
AI 아바타: BarChart2 (Sparkles 대신)

분류 배지:
  Database w-3 h-3 strokeWidth={2}
  bg-[#EEEEFF] border-[#C7C3F7] text-[#4F46E5]
  "TAG 통계 질의" + "2가지 해석으로 분석"

① 인트로 텍스트 버블 (스트리밍)
  bg-white border border-[#E4E2F0] rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm
  텍스트: "**3월 생산량** 합계 데이터를 두 가지 관점으로 해석했습니다. 각 해석의 파라미터를 수정하거나 재조회할 수 있습니다."

② 2분할 InterpretationCard (스트리밍 완료 후 표시)
  레이아웃: flex flex-col md:flex-row gap-3
  좌: colorScheme=1 (파란색 계열)
  우: colorScheme=2 (주황색 계열)
```

**InterpretationCard 상세 구조**

```
컨테이너: flex-1 min-w-0 border rounded-xl overflow-hidden shadow-sm
  colorScheme=1: border-[#c8d8f8]
  colorScheme=2: border-[#f8dec8]

■ 헤더 (px-4 py-3 border-b)
  배경: scheme1→bg-[#f0f5ff] / scheme2→bg-[#fff9f0]
  테두리: scheme1→border-[#c8d8f8] / scheme2→border-[#f8dec8]

  상단 행 (flex items-center justify-between gap-2 mb-2):
    배지: text-[11px] font-bold px-2 py-0.5 rounded-full
          scheme1→bg-[#e4eeff] text-[#2355b0] / scheme2→bg-[#ffeedd] text-[#a05018]
          내용: "해석 1 — 제품별 합계" / "해석 2 — 라인별 합계"
    재조회 버튼 (RefreshCw w-3.5 h-3.5 strokeWidth={2}):
          scheme1→text-[#4F46E5] hover:bg-[#eeeeff] / scheme2→text-[#d97706] hover:bg-[#fff3e0]

  편집 가능한 해석 문장:
    기본: text-[12px] text-[#444] + 연필 아이콘 (hover시 표시)
          group-hover로 Pencil w-3 h-3 opacity-0→opacity-100
    편집 중: input autoFocus
             scheme1→border-[#4F46E5] / scheme2→border-[#d97706]
             Enter: 저장 / Escape: 취소 / onBlur: 저장
             Check w-3.5 h-3.5 text-emerald-500 확인 버튼

■ 파라미터 태그 영역 (px-4 py-3 border-b border-[#E4E2F0] bg-white)
  레이블: "파라미터" text-[10.5px] font-semibold text-[#A8A6C0] uppercase tracking-wide mb-2

  파라미터 태그들 (flex flex-wrap gap-1.5 mb-2.5):
    기본 상태 버튼:
      text-[11px] px-2.5 py-0.5 rounded-full border font-medium
      scheme1→bg-[#eef3ff] text-[#2355b0] border-[#c8d8f8]
      scheme2→bg-[#fff4e6] text-[#a05018] border-[#f8dec8]
      클릭: 인라인 input으로 전환, 포맷 "키: 값"
    편집 중 input:
      text-[11px] px-2 py-0.5 rounded-full border outline-none w-36
      Enter: commitParam (split(':')으로 key/value 파싱)
      Escape or blur: 저장

  재조회 버튼:
    text-[11px] px-3 py-1 rounded-lg border font-medium flex items-center gap-1.5
    scheme1→border-[#c8d8f8] text-[#2355b0] hover:bg-[#eef3ff]
    scheme2→border-[#f8dec8] text-[#a05018] hover:bg-[#fff7ef]
    RefreshCw w-3 h-3 + "재조회"

■ SQL 쿼리 (px-4 py-3 border-b border-[#E4E2F0] bg-white)
  헤더: Database w-3 h-3 text-[#A8A6C0] + "SQL 쿼리" text-[10.5px] uppercase
  코드박스: bg-[#0d1117] rounded-lg px-3 py-2.5 overflow-x-auto
    <pre> text-[11px] text-[#4ade80] font-mono leading-relaxed whitespace-pre

■ 조회 결과 테이블 (bg-white)
  헤더 바: bg-[#FAFAFA] border-b border-[#F0F0F0]
            "조회 결과" text-[10.5px] uppercase
  테이블: text-[11.5px]
    th: text-[10.5px] font-semibold text-[#A8A6C0]
        첫 번째 열 text-left / 나머지 text-right
    td: divide-y divide-[#F4F3FC] hover:bg-[#F9F8FF]
        첫 열: text-[#6B6882] font-medium
        나머지: text-right font-semibold text-[#1A1826]

■ 시각화 차트 (px-4 pt-3 pb-4 bg-white border-t border-[#F0F0F0])
  "시각화" text-[10.5px] uppercase tracking-wide mb-2.5
  ResponsiveContainer width="100%" height={140}
  BarChart barCategoryGap="30%"
    Bar fill: scheme1→#4F46E5 / scheme2→#d97706  radius=[4,4,0,0]
    YAxis tickFormatter: v≥1000000→"{n}만" / v≥1000→"{n}천"
    CartesianGrid strokeDasharray="3 3" stroke="#F0EEFA" vertical=false

■ 재조회 결과 블록 (RerunResultBlock) — 재조회 버튼 클릭 후 표시
  위치: 카드 하단에 border-t border-[#E4E2F0] bg-[#F9F8FF] 추가

  처리 과정 아코디언 버튼 (w-full px-4 py-2.5):
    "처리 과정" text-[11px] font-semibold text-[#6B6882]
    ChevronDown / ChevronRight w-3.5 h-3.5 text-[#A8A6C0]

  스텝 목록 (expanded 상태):
    RERUN_STEP_LABELS = ['해석 확인', '파라미터 적용', 'SQL 생성', '데이터 조회', '결과 생성']
    완료: CheckCircle2 w-3.5 h-3.5 text-emerald-500 + text-[#6B6882]
    진행중: 스피너 div (animate-spin border-2 border-[#C7C3F7] border-t-[#4F46E5]) + text-[#A8A6C0]
    타이밍: 각 스텝 800ms 간격 setTimeout

  스트리밍 결과 텍스트 (allDone 후):
    bg-white border border-[#E4E2F0] rounded-xl px-4 py-3
    text-[12.5px] text-[#1A1826]
    커서: inline-block w-0.5 h-3.5 bg-[#4F46E5] animate-pulse (streamDone 전)
    스트리밍: 22ms 간격, 1~3자씩 추가
    텍스트 내용: "**재조회 결과**\n\n> **해석**: {desc}\n\n수정된 조건으로 조회한 결과입니다.\n\n**조회 조건**: {params}\n**조회 시간**: 0.07초\n**결과 건수**: {랜덤 3~7}건"
```

**getDualTagData() 반환 데이터**

```
introText: "**3월 생산량** 합계 데이터를 두 가지 관점으로 해석했습니다. 각 해석의 파라미터를 수정하거나 재조회할 수 있습니다."

interpretation1 (제품별):
  title: "해석 1 — 제품별 합계"
  description: "3월 제품 유형별 생산량 합계를 조회합니다"
  params: [{월:3월}, {연도:2026}, {집계기준:제품별}]
  sqlQuery:
    SELECT product_name,
           SUM(qty) AS total_qty,
           ROUND(SUM(qty)*100.0
             /SUM(SUM(qty)) OVER(), 1) AS ratio
    FROM   production_log
    WHERE  year = 2026 AND month = 3
    GROUP  BY product_name
    ORDER  BY total_qty DESC;
  columns: ["제품명", "생산량 (병)", "비율 (%)"]
  rows:
    ["제주삼다수 2L",    "1,842,000", "38.4%"]
    ["제주삼다수 500mL", "1,520,000", "31.7%"]
    ["제주삼다수 330mL", "980,000",   "20.4%"]
    ["기타 제품",        "455,000",    "9.5%"]
  chartData: [2L→1842000, 500mL→1520000, 330mL→980000, 기타→455000]
  chartUnit: "병"

interpretation2 (라인별):
  title: "해석 2 — 라인별 합계"
  description: "3월 생산 라인별 가동 실적 합계를 조회합니다"
  params: [{월:3월}, {연도:2026}, {집계기준:라인별}]
  sqlQuery:
    SELECT line_id, line_name,
           SUM(qty) AS total_qty
    FROM   production_log
    WHERE  year = 2026 AND month = 3
    GROUP  BY line_id, line_name
    ORDER  BY total_qty DESC;
  columns: ["라인 ID", "라인명", "생산량 (병)"]
  rows:
    ["L-01", "1라인 (고속)",   "1,650,000"]
    ["L-02", "2라인 (표준)",   "1,420,000"]
    ["L-03", "3라인 (소용량)", "980,000"]
    ["L-04", "4라인 (신규)",   "747,000"]
  chartData: [L-01→1650000, L-02→1420000, L-03→980000, L-04→747000]
  chartUnit: "병"
```

---

## 28. 에이전트 분할 — AmbiguousPanel & RagAbPanel

### 28-1. AmbiguousPanel (의도 불명확 — 좌우 분할)

```
트리거: 질의에 '비서 키워드 + 지침 키워드' 동시 포함, 또는 아무 신호 없음
레이아웃: flex gap-3 items-start

THOUGHT_STEPS['ambiguous']:
  1. "질의 의도 분석: 지침 문의 또는 작업 요청 — 신호 불명확"
  2. [법령 검색 스킬, 비서 매칭 스킬, 의도 분류 스킬]
  3. "두 경로 병렬 탐색 중 — 지침 DB + 비서 마켓 동시 조회"
  4. "지침 찾기 + 비서 추천 동시 제시"
```

**분류 배지**
```
인라인 SVG (원 + 느낌표):
  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.4"/>
  <path d="M6 3.5v3M6 8v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
color=#8B5CF6, bg=#F5F3FF, border=#DDD6FE
"의도 불명확 — 두 가지 결과 동시 제시"
우측: "관련 지침과 비서를 함께 확인하세요" text-[11px] text-[#A8A6C0]
```

**2열 분할 레이아웃 (grid grid-cols-2 gap-3 items-start)**

**왼쪽 패널 — RAG 지침 찾기**
```
패널 헤더: flex items-center gap-1.5 px-3 py-2 rounded-xl
           bg-emerald-50 border border-emerald-200
  SVG 아이콘 (문서형): w-3.5 h-3.5 text-emerald-600
  "RAG 지침 찾기" text-[11.5px] font-semibold text-emerald-700
  "규정 DB 조회" ml-auto text-[10px] text-emerald-500 font-medium

답변 버블: bg-white border border-[#E4E2F0] rounded-xl px-4 py-3.5 shadow-sm
  스트리밍: StreamingAnswer (onDone → textDone=true, onStreamDone() 호출)
  완료: renderText(answer)  text-[13px] text-[#1A1826]

출처 목록 (textDone 또는 !streaming 상태):
  border border-[#E4E2F0] rounded-xl overflow-hidden shadow-sm
  헤더: px-3 py-1.5 bg-[#F9F8FF] border-b "참고 문서" text-[10.5px] uppercase
  각 출처 행: flex items-center gap-2.5 px-3 py-2 hover:bg-[#F9F8FF]
    FileText w-3 h-3 text-[#4F46E5]
    제목: flex-1 text-[11.5px] text-[#1A1826] truncate
    타입 뱃지: text-[9.5px] px-1.5 py-0.5 rounded-full bg-[#4F46E5]/8 text-[#4F46E5]
```

**오른쪽 패널 — 비서 찾기**
```
패널 헤더: bg-amber-50 border border-amber-200
  Users w-3.5 h-3.5 text-amber-600
  "비서 찾기" text-[11.5px] font-semibold text-amber-700
  "비서마켓 조회" ml-auto text-[10px] text-amber-500

후보 카드 목록 (flex flex-col gap-1.5):
  getAssistantCandidates(query).slice(0, 4) → 매치율 높은 순 4개

  각 카드 버튼 (onClick → onSelectAssistant(c)):
    group text-left bg-white border border-[#E4E2F0] rounded-xl px-3 py-2.5
    hover:border-[#4F46E5] hover:shadow-md hover:shadow-[#4F46E5]/8 transition-all duration-200

    아이콘 박스: w-8 h-8 rounded-lg bg-[#F4F3FC] group-hover→bg-[#EEEEFF]
                 Icon: w-4 h-4 text-[#4F46E5] strokeWidth={1.8}
    이름: text-[12.5px] font-semibold text-[#1A1826] truncate
    매치율: text-[10px] font-bold
            ≥90%→text-[#10B981] / ≥75%→text-[#4F46E5] / 나머지→text-[#A8A6C0]
    설명: text-[11px] text-[#6B6882] leading-snug truncate
    ArrowRight: w-3.5 h-3.5 text-[#C7C3F7] → group-hover text-[#4F46E5]

안내: "비서를 선택하면 바로 대화를 시작합니다"
      text-[10.5px] text-[#A8A6C0] text-center
```

**비서 선택 이벤트**
```
onSelectAssistant(c) 호출 시:
  → 새 사용자 메시지 "비서 선택: {c.name}" 추가
  → 'minutes-request' 또는 'assistant-select' kind로 AI 응답 생성
```

**getAssistantCandidates() 매치 스코어 부스팅**
```
기본: ALL_CANDIDATES의 match 필드 값 사용

키워드 보정:
  '번역' → translate: 97
  '코드' or '리뷰' → code: 97
  '요약' or '문서' → summary: 97
  '분석' or '데이터' → data: 97
  '이메일' or '문체' or '글' → email: 97
  '회의' or '정리' or '회의록' → meeting: 97
  '보도' or '작성' → press: 97

정렬: match 내림차순, 상위 4개 반환
```

**ALL_CANDIDATES 데이터**
```
id=meeting:   회의록 문장정리  / PenTool  / 글쓰기 / 12.4k / match=88
id=email:     이메일 문체변경  / Mic2     / 글쓰기 / 9.1k  / match=82
id=translate: 번역 비서        / Globe    / 번역   / 7.2k  / match=77
id=code:      코드 리뷰 비서   / Code     / 코드   / 5.8k  / match=72
id=summary:   문서 요약 비서   / BookOpen / 분석   / 4.9k  / match=67
id=data:      데이터 분석 비서 / BarChart2/ 분석   / 8.7k  / match=63
id=press:     보도자료 초안    / FileText / 글쓰기 / 6.3k  / match=59
```

---

### 28-2. RagAbPanel (RAG A/B 비교 — 좌우 분할)

```
트리거: '삼다수 브랜드 관리 지침 알려줘' (RAG_AB 정확 매칭)
레이아웃: flex gap-3 items-start

THOUGHT_STEPS['rag-ab']:
  1. "질의 의도 분석: 지침 문의 — 복수 해석 경로 감지"
  2. [RAG 검색 스킬 A, RAG 검색 스킬 B, 비교 분석 스킬]
  3. "두 가지 해석 기준으로 지침 DB 병렬 조회 완료"
  4. "A/B 답변 동시 생성 — 선택 후 진행"
```

**분류 배지**
```
인라인 SVG (두 직사각형 나란히):
  <rect x="1" y="1" width="4.5" height="10" rx="1" .../>
  <rect x="6.5" y="1" width="4.5" height="10" rx="1" .../>
color=#0EA5E9, bg=#F0F9FF, border=#BAE6FD
"RAG A/B 비교 — 두 가지 해석 동시 제시"
우측: "원하는 답변을 선택하세요" text-[11px] text-[#A8A6C0]
```

**2열 비교 레이아웃 (grid grid-cols-2 gap-3 items-start)**

각 열 구조 (A안 / B안 동일):
```
① 답변 버블: bg-white border border-[#E4E2F0] rounded-xl px-4 py-3.5 shadow-sm min-h-[120px]
   스트리밍: StreamingAnswer (onDone → setDoneA/B)
   완료: renderText() text-[13px] text-[#1A1826]

② 출처 목록 (done 또는 !streaming):
   동일 구조 (text-[11px], text-[9px] 뱃지)

③ 선택 버튼 (상태별):
   [선택 전, 스트리밍 완료 후]:
     w-full py-2 rounded-xl text-[12px] font-semibold
     border-2 border-[#0EA5E9] text-[#0EA5E9]
     hover:bg-[#0EA5E9] hover:text-white
     "{A/B}안 선택" 텍스트

   [이 안 선택됨]:
     bg-[#0EA5E9]/10 border-[#BAE6FD] text-[#0EA5E9]
     CheckCircle2 w-3.5 h-3.5 strokeWidth={2} + "{A/B}안 선택됨"

   [다른 안 선택됨]:
     bg-[#F4F3FC] text-[#C7C3F7]  "{A/B}안" (비활성)

   [스트리밍 중]: null (숨김)
```

**streamingA / streamingB 동작**
```
RagAbPanel props:
  streamingA: boolean  ← A안 스트리밍 진행 중
  streamingB: boolean  ← B안 스트리밍 진행 중
  selected?: 'A' | 'B'
  onSelect: (choice) => void

메시지 상태에서:
  { role: 'assistant', kind: 'rag-ab', streamingA: true, streamingB: true, selected: undefined }
  → StreamingAnswer 두 개 동시 시작 (A: 즉시, B: 동시)
  → 각각 done 상태 관리
  선택 버튼 클릭 → onSelect → 메시지 상태에 selected 업데이트
```

**RAG_AB_MAP 데이터**

A안 — 상표·디자인 보호 관점:
```
labelA: "상표·디자인 보호 관점"
answerA: 3개 섹션 마크다운
  **1. 상표 등록 현황** — 특허청, 제35류/제32류, 상표권자 제주특별자치도개발공사
  **2. 로고·심벌 사용 기준** — CI 가이드라인, Pantone 286C, 최소 20mm, 여백 규정
  **3. 무단 사용 시 제재** — 상표법 제109조 손해배상, 7년 이하 징역 or 1억 이하 벌금
sourcesA:
  "상표법 제109조 (손해배상)" / 법령
  "제주삼다수 CI 가이드라인 v3.2" / 내부지침
  "디자인보호법 제113조" / 법령
```

B안 — 마케팅·홍보 활용 기준:
```
labelB: "마케팅·홍보 활용 기준"
answerB: 3개 섹션 마크다운
  **1. 광고물 제작 절차** — 브랜드팀 사전 검토, 외부 대행사 CI팀 승인
  **2. 캐릭터·모델 활용** — 계약 기간 내 사용, 재사용 시 저작권 재계약
  **3. SNS·디지털 채널 기준** — UGC 브랜드 로고 사전 서면 동의, 해시태그 정책 연간 캘린더
sourcesB:
  "삼다수 브랜드 마케팅 운영 지침 2026" / 내부지침
  "저작권법 제46조 (이용허락)" / 법령
  "광고물 제작 표준 절차서 v2.1" / 내부지침
```

---

### 28-3. StreamingAnswer 공통 컴포넌트

```
모든 패널에서 공유하는 스트리밍 텍스트 표시 컴포넌트

동작:
  - useEffect로 22ms 간격 interval 시작
  - 매 tick: 1~3자 랜덤 추가 (Math.floor(Math.random()*3)+1)
  - 전체 텍스트 완료 → clearInterval → onDone() 호출

표시:
  스트리밍 중: renderText(현재까지 텍스트)
               + 커서: inline-block w-0.5 h-3.5 bg-[#4F46E5] animate-pulse ml-0.5 align-middle
  완료 후: renderText(전체 텍스트)

renderText() 마크다운 파서:
  **텍스트** → <strong class="font-bold">
  \n\n → <br/><br/>
  \n → <br/>
  > 텍스트 → 인용 블록 스타일
```

---

### 28-4. 액션바 (actionBar) — 모든 응답 패널 공통

```
응답 완료 후 패널 하단에 표시되는 버튼 행
flex items-center gap-2 mt-1

① 피드백:
  👍 좋아요: p-1.5 rounded-lg text-[#A8A6C0] hover:text-emerald-600 hover:bg-emerald-50
             ThumbsUp w-4 h-4 strokeWidth={1.8}
  👎 싫어요: hover:text-red-400 hover:bg-red-50
             ThumbsDown w-4 h-4 strokeWidth={1.8}

② 저장: Bookmark w-4 h-4 / 클릭 → onSave() → SavedPanel에 추가
         저장 후: BookmarkCheck text-[#4F46E5] (활성 표시)

③ 복사: Copy w-4 h-4 / 클릭 → clipboard.writeText

④ 새로 고침: RotateCcw w-4 h-4 / 재질의

⑤ 공유: Share2 w-4 h-4

위치: ml-auto로 오른쪽 정렬
```

---

### 28-5. QueryKind 전체 종류 및 처리 흐름

```
type QueryKind =
  | 'instruction'       // 지침/규정 RAG 단일 답변
  | 'assistant-select'  // 비서 추천 카드 표시
  | 'tag-stats'         // TAG 통계 단일 패널 (표 + 차트)
  | 'ambiguous'         // 좌(RAG) + 우(비서) 분할
  | 'rag-ab'            // 좌(A안) + 우(B안) RAG 비교
  | 'dual-tag'          // 좌(해석1) + 우(해석2) TAG 2분할
  | 'minutes-request'   // 회의록 입력 요청
  | 'minutes-result'    // 회의록 결과 문서

처리 흐름:
  사용자 입력 → classifyQuery(text) → QueryKind 결정
  → 메시지 배열에 { role:'assistant', kind:'thinking', queryKind, query } 추가
  → ThinkingProcess 렌더링 (스텝 애니메이션)
  → onDone() → 실제 응답 메시지 추가

응답 메시지 타입:
  kind='tag-stats':  { statsData: getTagStatsData(q), streaming: true }
  kind='dual-tag':   { dualData: getDualTagData(q), streaming: true }
  kind='rag-ab':     { streamingA: true, streamingB: true, selected: undefined }
  kind='ambiguous':  { query: q, streaming: true }
  kind='instruction': { streaming: true }
  kind='assistant-select': { candidates: getAssistantCandidates(q) }
```

---

## 29. 최신 대화 UX 보완 명세 (ConversationView)

> 이 절은 앞선 대화 화면·분할 패널 명세를 보완한다. 동일 항목이 충돌할 경우 이 절의 최신 동작을 우선한다.

### 29-1. 확장된 질의 분류와 정규화

```ts
type QueryKind =
  | 'instruction'           // RAG 지침 단일 답변
  | 'assistant-select'      // 비서 후보 카드
  | 'tag-stats'             // TAG 통계 답변
  | 'tag-assistant'         // TAG 통계 완료 후 비서 추천
  | 'dual-tag'              // TAG 2분할 통계
  | 'dual-tag-assistant'    // TAG 2분할 완료 후 비서 추천
  | 'ambiguous'             // RAG/비서 병렬 분할
  | 'rag-ab'                // RAG A/B 비교
  | 'rag-tag-assistant'     // RAG 지침 + TAG 현황 + 비서 추천 3분할
  | 'minutes-request'       // 회의록 원문 입력 요청
  | 'minutes-result'        // 회의록 결과
  | 'fallback'              // 미식별 안내 후 비서 추천
  | 'fallback-assistant';   // 비서 찾기 후 RAG 지침을 함께 제시
```

```
normalizeRagTagQuery(text):
  1. zero-width space(\u200B)를 제거한다.
  2. 문자열 끝의 "RAG+TAG+비서" 표기(괄호 유무 무관)를 제거한다.
  3. trim()한 결과로 고정 트리거와 ANSWER_MAP을 조회한다.

분류 우선순위:
  rag-ab → rag-tag-assistant → dual-tag-assistant → dual-tag
  → tag-assistant → fallback → fallback-assistant → 일반 키워드 분류

고정 데모 트리거:
  - "입고 처리가 안 된 작업지시가 있어?" → rag-tag-assistant
  - "3월 생산량 합계 보여줘 (TAG/분할/비서)" → dual-tag-assistant
  - "3월 생산량 합계 보여줘" → dual-tag
  - "비서 유형 활용 현황 구해줘 (TAG+비서)" → tag-assistant
  - "회의록 작성 어떻게 해? (미식별 후 비서 추천)" → fallback
  - "회의록 작성 잘 하는법" → fallback-assistant
```

### 29-2. RAG + TAG + 비서 추천 복합 패널

```
트리거: "입고 처리가 안 된 작업지시가 있어?"

AI 아바타 오른쪽에 3개 결과를 세로로 배치한다.

① RAG 지침 영역
   - 에메랄드 계열 헤더: "RAG 지침 찾기" / "규정 DB 조회"
   - 스트리밍 답변과 참고 문서 3개를 표시한다.

② TAG 현황 영역
   - 인디고 계열 헤더: "TAG 입고 현황" / "작업지시 DB 조회"
   - 입고 미처리 7건의 상태별 표를 표시한다.
   - "입고 처리 건수 비교" 제목의 작은 막대 차트를 표시한다.
   - 완료·검수 대기·수량 확인·담당자 처리 대기 상태를 색상으로 구분한다.

③ 추천 비서 영역
   - 앰버 계열 헤더: "추천 비서" / "비서마켓 조회"
   - 질의와 연관된 후보 비서 카드를 표시한다.
   - 후보를 클릭하면 해당 비서를 선택한 대화 흐름으로 전환한다.

모든 스트리밍이 완료된 후 공통 ActionBar를 표시한다.
```

### 29-3. TAG 결과 후 비서 추천

```
tag-assistant:
  TAG 통계 패널이 스트리밍을 마친 뒤, 바로 아래에 compact AssistantSelectPanel을 추가한다.

dual-tag-assistant:
  2개의 InterpretationCard가 완료된 뒤, 바로 아래에 compact AssistantSelectPanel을 추가한다.

fallback:
  미식별 안내문을 스트리밍한 뒤 compact AssistantSelectPanel을 보여 준다.

fallback-assistant:
  RAG 지침 답변을 먼저 보여 주고, 참고 문서와 ActionBar 사이에
  compact AssistantSelectPanel을 삽입한다.
```

### 29-4. `이어서 질의` — 자동 전송 없는 입력 대기 흐름

```
표시 위치:
  - RAG + TAG + 비서 추천 패널 하단
  - TAG 2분할의 각 InterpretationCard 하단

ContinueQueryButton:
  flex items-center gap-1.5
  px-3 py-1.5 rounded-lg
  border border-[#C7C3F7] bg-[#EEF0FF]
  text-[11.5px] font-semibold text-[#4F46E5]
  Sparkles/ArrowRight 계열 아이콘 + "이어서 질의"
  hover: bg-[#4F46E5] text-white

클릭 동작:
  1. 어떠한 자동 후속 질의도 전송하지 않는다.
  2. awaitingFollowUp=true로 바꾼다.
  3. focusRequest를 증가시켜 textarea에 즉시 포커스한다.
  4. 마지막 메시지가 follow-up-prompt가 아닐 때만 안내 메시지를 하나 추가한다.

follow-up-prompt 메시지:
  - 좌측: JPDC 로고 32px 정사각 rounded-xl
  - 본문: indigo-to-light-indigo gradient, #A5B4FC border,
    rounded-2xl rounded-tl-sm, px-5 py-3.5
  - 그림자: shadow-md shadow-[#818CF8]/20, ring-2 ring-[#818CF8]/10
  - motion-reduce에서는 정지하고, 일반 환경에서는 animate-pulse
  - 아이콘: 24px 원형 #4F46E5 배경의 흰 Sparkles
  - 고정 문구: 굵은 14px #3730A3 "궁금하신 것을 입력해주세요."

후속 대기 중 입력창:
  placeholder: "궁금하신 것을 입력해주세요... (Enter 전송)"
  평상시 placeholder: "추가 질문을 입력하세요... (Enter 전송)"
  Enter는 전송, Shift+Enter는 줄바꿈이다.
```

### 29-5. 공통 ActionBar와 피드백 모달

```
ActionBar:
  mt-3 space-y-2, 내부 버튼 행은 flex flex-wrap gap-1 px-1.

버튼 순서:
  1. 좋아요 — ThumbsUp, emerald hover/선택 상태
  2. 싫어요 — ThumbsDown, red hover/선택 상태
  3. 1px 세로 구분선
  4. 저장 / 저장됨 — Bookmark, 성공 시 emerald fill, 약 2초 후 원상복귀
  5. 복사 / 복사됨 — Copy, clipboard에 "Q. {질문}\n\n{답변}" 복사
  6. MD — FileDown, 질문·답변·참고문서를 Markdown 파일로 다운로드
  7. 재생성 — 오른쪽 정렬, RotateCcw

피드백 모달:
  fixed inset-0 z-[200], 검정 30% + 2px blur backdrop.
  카드: w-full max-w-[480px], white, rounded-2xl, border #E4E2F0, p-6.
  제목:
    좋아요 → "긍정적인 피드백 제공"
    싫어요 → "부정적인 피드백 제공"

평가 점수:
  - 공통으로 `싫어요 | 0 | 좋아요` 3열 레이아웃을 유지한다.
  - 좌측은 빨간 별 5개(5 → 1), 우측은 녹색 별 5개(1 → 5)다.
  - 부정 피드백 모달에서는 왼쪽 빨간 별만 활성화한다.
  - 긍정 피드백 모달에서는 오른쪽 녹색 별만 활성화한다.
  - 반대편 별은 disabled, opacity-30, cursor-not-allowed 상태다.
  - 별 hover는 scale-110, 선택 별은 해당 방향 색상으로 채운다.
  - 선택된 점수에 따라 "조금 도움됨"/"매우 도움됨" 또는
    "조금 아쉬움"/"매우 부적절" 문구를 표시한다.

사유 칩:
  SOURCE, RELEVANCE, COMPLETENESS, RECENCY, DATA, FORMAT, ACTIONABILITY.
  복수 선택 가능. 긍정은 emerald, 부정은 red 계열로 선택 상태를 표시한다.
  아래에는 방향별 상세 의견 placeholder를 가진 textarea와 취소/제출 버튼을 둔다.
```

### 29-6. 대화 입력창의 첨부와 비서 선택

```
첨부:
  - Paperclip 클릭으로 다중 파일을 선택한다.
  - 이미지, PDF, Office, 압축 파일 등 확장자별 accent color를 적용한다.
  - 각 파일 칩에는 확장자 배지, 이름, 용량, 인덱싱 진행률과
    "벡터 인덱싱 중… N%" 또는 "✓ 임베딩 완료" 상태를 보여 준다.
  - 인덱싱은 파일별 1.2~2.2초, 200ms 간격으로 시작하는 시각 효과다.

비서 선택:
  - Users + "비서 선택" 드롭다운.
  - 선택 시 indigo 배경/테두리로 활성화하고, 다시 선택하면 해제한다.
  - 선택 목록은 사용자 비서 순서 설정을 따르며, 역순으로 표시한다.

전송:
  - ArrowUp, 32px rounded-xl #4F46E5 버튼.
  - Tooltip: "메시지 전송 (Enter)".
  - 입력창 아래 고정 문구:
    "JPDC AI는 실수를 할 수 있습니다. 중요한 정보는 반드시 원문을 확인하세요."
```

---

## 30. 패널·모달의 최신 동작

### 30-1. 저장 목록과 알림 센터

```
저장 목록:
  - 데스크톱에서 오른쪽 280px 폭으로 열리고 닫힐 때 width/opacity 300ms 전환.
  - 헤더: BookmarkCheck + "저장 목록" + 항목 수 배지 + 닫기 X.
  - 비어있음: Bookmark 아이콘과 "저장한 답변이 없습니다".
  - 항목: 질문(인디고), 답변 3줄, 저장 시각을 white 카드로 보여 준다.
  - hover시에만 삭제 X가 노출되며 삭제 색상은 red.

알림 센터:
  - 데스크톱은 오른쪽 300px 패널, 모바일은 최대 85vw 슬라이드오버와 backdrop.
  - 헤더: Bell + "알림 센터" + 읽지 않은 수 + "모두 읽음" + 닫기.
  - 항목 클릭은 읽음 처리, hover시에만 삭제 X가 노출된다.
  - 종류별 아이콘:
      alert = red AlertCircle, info = indigo Info, success = emerald CheckCircle2.
  - 모두 삭제된 빈 상태: Bell 아이콘과 "알림이 없습니다".
  - 저장 패널과 알림 센터는 상호 배타적으로 열린다.
```

### 30-2. 개인 설정

```
SettingsModal:
  탭: 표시 / 비서 / 알림 / 사용량.

표시:
  라이트·다크 미리보기 카드, 글꼴 크기(12/14/16px) 드롭다운,
  넓게·표준·좁게 표시 밀도와 실시간 목록 미리보기.

비서:
  비서 검색, 다중 선택 칩, 카테고리별 비서 목록,
  비서 순서 위·아래 이동 및 즐겨찾기 관리.

알림:
  뱃지·대화 완료·비서 업데이트·주간 요약 등 토글 기반 수신 설정.

사용량:
  기간 선택, 수치 카드와 사용량 시각화.

메모리:
  선택 비서/전체 범위별 메모리 토글, 추가·편집·공유 범위 변경·삭제,
  전체 삭제의 빈 상태까지 제공한다. 메모리 UI에는 버전 문구를 노출하지 않는다.
```

### 30-3. 안내 및 선택 모달

```
OnboardingModal:
  5단계: 기본 질의하기 / 일반 질의 / 데이터질의 대화하기 /
         비서 만들기 / 비서 사용하기.
  각 단계는 아이콘·제목·부제·실제 UI 미니 화면·예시 질의 말풍선·팁을 갖는다.
  상단 X, 이전/다음, 단계 점을 제공하고 마지막 버튼은 완료 처리한다.

ManualModal:
  기능별 이용 매뉴얼과 도움말 콘텐츠를 모달로 제공한다.
  HelpPopover와 동일한 인디고 계열 도움말 문법을 사용한다.

IconPickerModal:
  아이콘명/한글 키워드 검색, 카테고리 탭, 배경 색상 팔레트,
  아이콘 그리드와 선택/취소 버튼으로 구성한다.
  "책, 도서, 설정, 사람… 또는 book, person, home…" 검색을 지원한다.

AssistantInfoModal / AssistantStatsModal:
  공식 비서의 설명·통계·별점·같은 작성자의 다른 비서·채팅 시작·복제와
  비서별 상세 이용 통계를 제공한다.
```
