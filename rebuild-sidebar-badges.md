# JPDC AI — 사이드바 대화 기록 뱃지 & 클릭 연결 화면 명세

> 사이드바 히스토리 항목 중 특수 응답 유형이 적용된 항목 + 클릭 시 연결되는 화면 전체 정리.

---

## 1. 클릭 가능한 항목 전체 (CLICKABLE_HISTORIES)

```typescript
const CLICKABLE_HISTORIES = new Set([
  '계약 협상 중인 단가 정보는 어떤 기준으로 보호되나요?',  // 뱃지 없음
  '회의록 작성 지침 알려줘',   // badge: '분할'
  '3월 생산량 합계 보여줘',    // badge: 'TAG/분할'
  '5월 생산량 월별 보여줘',    // badge: 'TAG'
]);
```

클릭 시 공통 흐름:
```
onSelectHistory(item.title) 호출
→ App.tsx handleSubmit(text): query 설정 + conversationKey++ + activeView='conversation'
→ ConversationView 마운트 → classifyQuery(query) → 해당 패널 렌더링
```

---

## 2. 항목별 연결 화면 상세

---

### ① 계약 협상 중인 단가 정보는 어떤 기준으로 보호되나요?
**뱃지**: 없음

**분류 로직**
```
'기준' → INSTRUCTION_KWS 매칭
'보호' → INSTRUCTION_KWS 매칭
hasInstruction = true, hasAssistant = false
→ QueryKind: 'instruction'
```

**연결 화면**: 지침 답변 패널 (InstructionPanel)
```
ThinkingProcess 스텝:
  1. "질의 의도 분석: 정책·규정 관련 지침 문의로 판단"
  2. [법령 검색 스킬, 지침 해석 스킬, 문서 인용 스킬]
  3. "관련 규정 DB 조회 중 — 3개 참고 문서 매핑 완료"
  4. "지침 답변 생성 시작"

응답 화면:
  - AI 아바타 + 분류 배지 (color=#10B981, bg=#ECFDF5, border=#6EE7B7 "지침 분류 완료")
  - 텍스트 답변 버블 (스트리밍 → renderText)
  - 참고 문서 목록 (카드 형태, FileText 아이콘 + 제목 + 타입 뱃지)
  - 액션바 (좋아요/싫어요/저장/복사/공유)
```

---

### ② 회의록 작성 지침 알려줘
**뱃지**: `분할` (bg-[#F0EEFA] text-[#7C6FF7] border-[#E4E0FA])

**분류 로직**
```
'작성' → ASSISTANT_KWS 매칭 (hasAssistant = true)
'지침' → INSTRUCTION_KWS 매칭 (hasInstruction = true)
두 신호 동시 → QueryKind: 'ambiguous'
```

**연결 화면**: 의도 불명확 분할 패널 (AmbiguousPanel)
```
ThinkingProcess 스텝:
  1. "질의 의도 분석: 지침 문의 또는 작업 요청 — 신호 불명확"
  2. [법령 검색 스킬, 비서 매칭 스킬, 의도 분류 스킬]
  3. "두 경로 병렬 탐색 중 — 지침 DB + 비서 마켓 동시 조회"
  4. "지침 찾기 + 비서 추천 동시 제시"

응답 화면 (grid grid-cols-2 gap-3):
  분류 배지: color=#8B5CF6, bg=#F5F3FF, border=#DDD6FE
             "의도 불명확 — 두 가지 결과 동시 제시"

  ┌─────────────────────┐  ┌──────────────────────┐
  │  RAG 지침 찾기       │  │  비서 찾기            │
  │  (bg-emerald-50)    │  │  (bg-amber-50)        │
  │                     │  │                       │
  │  스트리밍 답변 버블   │  │  비서 후보 카드 4개   │
  │  참고 문서 목록       │  │  (매치율 높은 순)     │
  └─────────────────────┘  └──────────────────────┘

  비서 카드 클릭 시:
    → "비서 선택: {name}" 사용자 메시지 추가
    → assistant-intro or minutes-request 패널로 전환
```

---

### ③ 3월 생산량 합계 보여줘
**뱃지**: `TAG/분할` (bg-[#F0EEFA] text-[#7C6FF7] border-[#E4E0FA])

**분류 로직**
```
DUAL_TAG_QUERIES = Set(['3월 생산량 합계 보여줘'])
정확 매칭 → QueryKind: 'dual-tag' (강제)
```

**연결 화면**: TAG 통계 2분할 패널 (DualTagPanel)
```
ThinkingProcess 스텝:
  1. "질의 의도 분석: 자연어 통계 조회 (TAG 질의) 감지 — 2가지 해석 경로 탐지"
  2. [자연어 파싱 스킬, SQL 생성 스킬, 2분할 해석 스킬]
  3. "JPDC 생산 DB 연결 — 두 가지 쿼리 병렬 실행 완료"
  4. "2분할 통계 결과 생성 시작"

응답 화면:
  분류 배지: Database 아이콘, bg-[#EEEEFF] text-[#4F46E5] "TAG 통계 질의 · 2가지 해석으로 분석"
  인트로 버블: "**3월 생산량** 합계 데이터를 두 가지 관점으로 해석했습니다…"

  ┌──────────────────────────┐  ┌──────────────────────────┐
  │  해석 1 — 제품별 합계     │  │  해석 2 — 라인별 합계     │
  │  (파란색, colorScheme=1) │  │  (주황색, colorScheme=2) │
  │                          │  │                          │
  │  헤더 + 재조회 버튼       │  │  헤더 + 재조회 버튼       │
  │  편집 가능한 해석 문장    │  │  편집 가능한 해석 문장    │
  │  파라미터 태그 (클릭 편집) │  │  파라미터 태그 (클릭 편집) │
  │  SQL 쿼리 (다크 박스)     │  │  SQL 쿼리 (다크 박스)     │
  │  조회 결과 테이블         │  │  조회 결과 테이블         │
  │  BarChart 시각화          │  │  BarChart 시각화          │
  └──────────────────────────┘  └──────────────────────────┘

  재조회 클릭 시:
    → RerunResultBlock 표시
    → 5단계 처리 애니메이션 (800ms 간격)
    → 스트리밍 결과 텍스트 출력

  데이터:
    해석1: 제주삼다수 2L(38.4%) / 500mL(31.7%) / 330mL(20.4%) / 기타(9.5%)
    해석2: L-01 1라인 고속 / L-02 2라인 표준 / L-03 3라인 소용량 / L-04 4라인 신규
```

---

### ④ 5월 생산량 월별 보여줘
**뱃지**: `TAG` (bg-[#F0EEFA] text-[#7C6FF7] border-[#E4E0FA])

**분류 로직**
```
'월별' → TAG_KWS 매칭
'보여줘' → TAG_KWS 매칭
→ QueryKind: 'tag-stats'
```

**연결 화면**: TAG 통계 단일 패널 (TagStatsPanel)
```
ThinkingProcess 스텝:
  1. "질의 의도 분석: 자연어 통계 조회 (TAG 질의) 감지"
  2. [자연어 파싱 스킬, 통계 분석 스킬, 데이터 시각화 스킬]
  3. "JPDC 데이터베이스 연결 — 쿼리 실행 완료"
  4. "통계 답변 + 차트 생성 시작"

응답 화면:
  분류 배지: BarChart2 아이콘, bg-[#EEEEFF] text-[#4F46E5] "TAG 통계 질의 · 자연어 통계 분석 결과"

  ① 텍스트 답변 버블 (스트리밍)
     rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm

  ② 데이터 테이블 (스트리밍 완료 후)
     헤더: "상세 데이터" + TrendingUp 아이콘
     항목 / 값 2열 테이블

  ③ Recharts 차트 (스트리밍 완료 후)
     '월별' 키워드 → chartType='line' (LineChart)
     height=160, stroke="#4F46E5" strokeWidth={2.5}
     dot r=4 / activeDot r=6

  ④ 액션바 (좋아요/싫어요/저장/복사/공유)
```

---

## 3. 전체 HISTORY_GROUPS 데이터

```
그룹: 오늘
  ① "공공기관 보안 지침에서 외부 반출 금지 자료의 범위는 어디까지인가요?"
     active=true (현재 선택 항목), 클릭 불가
  ② "계약 협상 중인 단가 정보는 어떤 기준으로 보호되나요?"
     active=false, 뱃지 없음, 클릭 가능 → instruction 패널

그룹: 어제
  ③ "개인정보가 포함된 민원 자료를 외부에 공유할 수 있나요?"    클릭 불가
  ④ "대외비 문서의 결재 절차와 보관 방법을 알려주세요"          클릭 불가
  ⑤ "감사 결과 보고서는 내부에서 어떻게 공유하나요?"            클릭 불가
  ⑥ "회의록 작성 지침 알려줘"   badge='분할'    클릭 가능 → ambiguous 패널 (좌RAG+우비서)
  ⑦ "3월 생산량 합계 보여줘"    badge='TAG/분할' 클릭 가능 → dual-tag 패널 (2분할 ERP)
  ⑧ "5월 생산량 월별 보여줘"    badge='TAG'     클릭 가능 → tag-stats 패널 (표+차트)

그룹: 지난 7일
  ⑨  "부서장 사전 승인 없이 자료를 반출했을 때 처벌 규정은?"     클릭 불가
  ⑩  "보안 일지 작성 시 필수 기재 항목이 뭔가요?"                클릭 불가
  ⑪  "계약 체결 전 단가 정보 유출 시 책임 소재는 어디에 있나요?" 클릭 불가
  ⑫  "직원 급여 명세를 인사팀 외에 공유하는 게 가능한가요?"       클릭 불가
```

---

## 4. 뱃지 렌더링 스타일

```
조건: 'badge' in item && item.badge 가 truthy일 때만 렌더링

위치: 히스토리 항목 텍스트 뒤 inline
컨테이너: ml-1.5 inline-flex px-1.5 py-0.5 rounded-md
색상: bg-[#F0EEFA] text-[#7C6FF7] border border-[#E4E0FA]
폰트: text-[9.5px] font-semibold whitespace-nowrap

뱃지 값 → 의미:
  'TAG'      → TAG 통계 단일 (표 + 차트)
  'TAG/분할'  → TAG 통계 2분할 (DualTag)
  '분할'      → 의도 불명확 분할 (좌RAG + 우비서)
```
