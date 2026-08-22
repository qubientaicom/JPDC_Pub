# JPDC AI — 좋아요 / 싫어요 기능 상세 명세

---

## 1. 위치 & 등장 조건

ActionBar 컴포넌트 안에 있으며, 각 AI 응답이 **스트리밍 완료된 후** 하단에 렌더링됩니다.

**ActionBar가 붙는 패널 목록**

| 패널 | answer 값 |
|---|---|
| InstructionPanel (지침 답변) | 실제 AI 답변 텍스트 |
| AmbiguousPanel (분할) | `"복합 의도 답변"` |
| RagAbPanel (RAG A/B) | `"RAG A/B 비교 결과"` |
| MinutesResultPanel (회의록 결과) | `"회의록 문장정리 결과"` |
| TagStatsPanel (TAG 통계) | `"TAG 통계 분석 결과"` |
| DualTagPanel (TAG 2분할) | `"TAG 통계 분석 결과"` |

---

## 2. 상태 구조

```typescript
// ActionBar 내부 로컬 state (응답 1개당 1개 인스턴스)
const [liked, setLiked] = useState<'up' | 'down' | null>(null);
const [feedbackModal, setFeedbackModal] = useState<'up' | 'down' | null>(null);
const [feedbackText, setFeedbackText] = useState('');
const [feedbackRating, setFeedbackRating] = useState(0);   // 1~5, 0=미선택
const [feedbackHover, setFeedbackHover] = useState(0);     // 별점 호버 상태
```

- 전역 저장 없음 — 현재 세션 내 UI 상태만 유지
- 응답 버블이 사라지거나 새로고침 시 초기화됨

---

## 3. 버튼 렌더링

```
ActionBar 레이아웃:
  [ 👍 ]  [ 👎 ]  |  [ 저장 ]  [ 복사 ]  [ MD ]        [ 재생성 ]
                  ↑ 구분선(w-px h-4 bg-[#E4E2F0])
```

### 좋아요 버튼 (ThumbsUp)
```
Tooltip: "도움이 됐어요"
아이콘:  ThumbsUp w-3.5 h-3.5 strokeWidth=1.8
크기:    p-1.5 rounded-lg

상태별 색상:
  기본:    text-[#A8A6C0]  (회색)
  hover:   text-[#10B981] bg-[#ECFDF5]  (초록)
  선택됨:  text-[#10B981] bg-[#ECFDF5]  (초록, hover와 동일)
```

### 싫어요 버튼 (ThumbsDown)
```
Tooltip: "도움이 안 됐어요"
아이콘:  ThumbsDown w-3.5 h-3.5 strokeWidth=1.8
크기:    p-1.5 rounded-lg

상태별 색상:
  기본:    text-[#A8A6C0]  (회색)
  hover:   text-[#EF4444] bg-[#FEF2F2]  (빨강)
  선택됨:  text-[#EF4444] bg-[#FEF2F2]  (빨강, hover와 동일)
```

---

## 4. 클릭 시 동작 흐름

```
👍 클릭
  setLiked('up')           → 버튼 초록색으로 즉시 변경
  setFeedbackModal('up')   → 피드백 모달 열기
  setFeedbackText('')      → 텍스트 초기화

👎 클릭
  setLiked('down')         → 버튼 빨간색으로 즉시 변경
  setFeedbackModal('down') → 피드백 모달 열기
  setFeedbackText('')      → 텍스트 초기화
```

> 두 버튼 모두 클릭 즉시 liked 상태가 바뀌어 버튼 색이 먼저 활성화되고,
> 동시에 피드백 모달이 열립니다.

---

## 5. 피드백 모달 상세

### 모달 레이어 구조
```
fixed inset-0 z-[200]
  ├── 배경: bg-black/30 backdrop-blur-[2px]  (클릭 시 모달 닫힘)
  └── 카드: w-full max-w-[480px] bg-white rounded-2xl shadow-2xl p-6
             (클릭 이벤트 stopPropagation으로 배경 클릭 방지)
```

### 모달 내부 구성

**① 제목**
```
좋아요 클릭 시: "긍정적인 피드백 제공"
싫어요 클릭 시: "부정적인 피드백 제공"

스타일: text-[18px] font-bold text-[#1A1826]
```

**② 별점 (선택 사항)**
```
라벨: "평가 점수 (선택 사항)"  — text-[13px] text-[#6B6882]

별 5개 (SVG 직접 렌더링, Lucide 아님)
  크기: w-7 h-7
  비활성: fill=#E4E2F0, stroke=#D1D0E0
  활성:   fill=#F59E0B, stroke=#F59E0B  (amber)
  hover:  scale-110 transition-transform

클릭 동작:
  같은 별 재클릭 → setFeedbackRating(0)  (별점 취소)
  다른 별 클릭  → setFeedbackRating(star)

별점 텍스트 레이블 (feedbackRating > 0 일 때만 표시):
  1 → "매우 불만족"
  2 → "불만족"
  3 → "보통"
  4 → "만족"
  5 → "매우 만족"
  스타일: text-[12px] font-semibold text-[#F59E0B]
```

**③ 텍스트 입력 (선택 사항)**
```
라벨: "세부 정보를 제공해 주세요. (선택 사항)"

textarea:
  autoFocus = true  (모달 열릴 때 자동 포커스)
  rows=4, resize-none
  placeholder:
    좋아요: "이 응답의 어떤 점이 만족스러웠나요?"
    싫어요: "이 응답의 어떤 점이 만족스럽지 않았나요?"

테두리:
  기본:    border-[#E4E2F0]
  포커스:  border-[#4F46E5]  (인디고)
  텍스트 있을 때: border-[#4F46E5] (항상 인디고 유지)
```

**④ 안내 문구**
```
"이 보고서를 제출하면 현재 대화 전체가 JPDC AI에 전송되어
 향후 모델 개선에 사용됩니다."

스타일: text-[11px] text-[#A8A6C0] leading-relaxed
```

**⑤ 하단 버튼 2개**

| 버튼 | 동작 | 스타일 |
|---|---|---|
| 취소 | `setFeedbackModal(null)` + `setFeedbackText('')` + **`setLiked(null)`** | border 회색, text-[#6B6882] |
| 제출 | `setFeedbackModal(null)` + `setFeedbackText('')` | bg-[#1A1826] text-white |

> **취소와 제출의 차이:**
> - 취소: `setLiked(null)` 호출 → 버튼 색이 회색으로 **원복**됨
> - 제출: `liked` 상태 유지 → 버튼 색이 **초록/빨강으로 남음**

---

## 6. 전체 상태 전이 다이어그램

```
[초기 상태]
  liked = null
  버튼: 둘 다 회색

  👍 클릭
    ↓
  liked = 'up', feedbackModal = 'up'
  👍 초록색 활성, 모달 열림
    ↓
  [취소 클릭]        [제출 클릭]         [배경 클릭]
  liked = null       liked = 'up'(유지)   liked = 'up'(유지)
  👍 회색 원복        👍 초록색 유지        👍 초록색 유지
  모달 닫힘           모달 닫힘             모달 닫힘

  👎 클릭
    ↓
  liked = 'down', feedbackModal = 'down'
  👎 빨간색 활성, 모달 열림
    ↓
  [취소 클릭]        [제출 클릭]
  liked = null       liked = 'down'(유지)
  👎 회색 원복        👎 빨간색 유지
```

---

## 7. 현재 미구현 사항 (UI 전용)

```
- 서버 전송 없음: 제출 버튼 클릭 시 API 호출 코드 없음 (콘솔 로그도 없음)
- 영속성 없음: 페이지 새로고침 시 liked 상태 초기화
- 별점/텍스트 데이터 미저장: feedbackRating, feedbackText 수집 후 버려짐
- 중복 클릭 방지 없음: 좋아요 상태에서 싫어요 클릭 시 토글 가능
  (liked = 'down'으로 덮어쓰기, 이전 'up' 상태 자동 해제)
```
