# JPDC AI — 브리핑 / TAG 분할 / 에이전트 분할 명세서

> `rebuild.md` §26~28 별도 파일. 브리핑, TAG 통계·2분할, 에이전트 분할(Ambiguous·RagAB) 3개 기능을 재현하기 위한 상세 명세.

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
  kind=tag-stats:        color=#4F46E5, bg=#EEF0FF, border=#C7C3F7   "TAG 통계 분류 완료"
  kind=dual-tag:         color=#4F46E5, bg=#EEF0FF, border=#C7C3F7   "TAG 통계 분류 완료"
  kind=rag-ab:           color=#0EA5E9, bg=#F0F9FF, border=#BAE6FD   "RAG 지침 분류 완료"
  kind=ambiguous:        color=#8B5CF6, bg=#F5F3FF, border=#DDD6FE   "의도 불명확 분류 완료"
  kind=instruction:      color=#10B981, bg=#ECFDF5, border=#6EE7B7   "지침 분류 완료"
  kind=assistant-select: color=#F59E0B, bg=#FFFBEB, border=#FDE68A   "비서 추천 분류 완료"
  kind=minutes-*:        color=#7C3AED, bg=#F5F3FF, border=#DDD6FE   "회의록 비서 분류 완료"

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
id=meeting:   회의록 문장정리  / PenTool   / 글쓰기 / 12.4k / match=88
id=email:     이메일 문체변경  / Mic2      / 글쓰기 / 9.1k  / match=82
id=translate: 번역 비서        / Globe     / 번역   / 7.2k  / match=77
id=code:      코드 리뷰 비서   / Code      / 코드   / 5.8k  / match=72
id=summary:   문서 요약 비서   / BookOpen  / 분석   / 4.9k  / match=67
id=data:      데이터 분석 비서 / BarChart2 / 분석   / 8.7k  / match=63
id=press:     보도자료 초안    / FileText  / 글쓰기 / 6.3k  / match=59
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

메시지 상태:
  { role:'assistant', kind:'rag-ab', streamingA:true, streamingB:true, selected:undefined }
  → StreamingAnswer 두 개 동시 시작
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
