import { useState } from 'react';
import { X, ChevronDown, Bell, Monitor, Bot, Gauge, Search, Check, Pencil, Trash2, Globe, Plus, type LucideIcon } from 'lucide-react';

type SettingsTab = '표시' | '비서' | '알림' | '사용량';

const TABS: { id: SettingsTab; icon: LucideIcon }[] = [
  { id: '표시',  icon: Monitor },
  { id: '비서',  icon: Bot },
  { id: '알림',  icon: Bell },
  { id: '사용량', icon: Gauge },
];

function SelectField({ label, options, value, onChange }: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-[#1A1826]">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((p) => !p)}
          className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border border-[#E4E2F0] bg-white
                     hover:border-[#4F46E5]/40 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]
                     text-base text-[#1A1826] transition-colors"
        >
          <span>{value}</span>
          <ChevronDown className={`w-4 h-4 text-[#A8A6C0] transition-transform duration-150 ${open ? 'rotate-180' : ''}`} strokeWidth={1.8} />
        </button>
        {open && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#E4E2F0] rounded-xl shadow-lg shadow-black/8 z-10 overflow-hidden">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left px-3.5 py-2.5 text-base transition-colors hover:bg-[#F4F3FC]
                  ${opt === value ? 'text-[#4F46E5] font-semibold bg-[#F0EEFF]' : 'text-[#1A1826]'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DisplayPanel() {
  const [theme, setTheme] = useState('라이트 (기본)');
  const [fontSize, setFontSize] = useState('보통 (14px)');
  const [density, setDensity] = useState('표준');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-[14px] font-bold text-[#1A1826] mb-1">화면 표시</h3>
        <p className="text-[12px] text-[#A8A6C0] leading-relaxed">인터페이스의 색상·글꼴·밀도를 조정합니다.</p>
      </div>

      <div className="h-px bg-[#E4E2F0]" />

      <div className="flex flex-col gap-5">
        {/* Color theme preview swatches */}
        <div className="flex gap-3 max-w-[240px]">
          {[
            { label: '라이트', value: '라이트 (기본)', bg: 'bg-white', border: 'border-[#4F46E5]', dot: 'bg-[#4F46E5]' },
            { label: '다크',   value: '다크',          bg: 'bg-[#1A1826]', border: 'border-[#E4E2F0]', dot: 'bg-[#7C6FF7]' },
          ].map((sw) => (
            <button
              key={sw.label}
              type="button"
              onClick={() => setTheme(sw.value)}
              className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all
                ${sw.value === theme ? sw.border + ' shadow-sm shadow-[#4F46E5]/15' : 'border-[#E4E2F0] hover:border-[#C7C3F7]'}`}
            >
              <div className={`w-full h-10 rounded-lg ${sw.bg} border border-[#E4E2F0] flex items-center justify-center`}>
                <div className={`w-3 h-3 rounded-full ${sw.dot}`} />
              </div>
              <span className="text-[11px] font-semibold text-[#6B6882]">{sw.label}</span>
            </button>
          ))}
        </div>

        <SelectField
          label="글꼴 크기"
          value={fontSize}
          onChange={setFontSize}
          options={['작게 (12px)', '보통 (14px)', '크게 (16px)']}
        />

        {/* Font size preview */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#F9F8FF] border border-[#E4E2F0]">
          <span className="text-[11px] text-[#A8A6C0] font-medium w-20 shrink-0">미리보기</span>
          <span className="text-[#1A1826]" style={{ fontSize: fontSize.includes('12') ? 12 : fontSize.includes('16') ? 16 : 14 }}>
            JPDC AI 비서 서비스에 오신 것을 환영합니다.
          </span>
        </div>

        {/* Density */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#1A1826]">표시 밀도</label>
          <div className="flex flex-col gap-1.5">
            {['넓게', '표준', '좁게'].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDensity(d)}
                className={`flex items-center gap-3 px-3 rounded-xl border-2 transition-all
                  ${d === density ? 'border-[#4F46E5] bg-[#F0EEFF]' : 'border-[#E4E2F0] bg-white hover:border-[#C7C3F7]'}
                  ${d === '넓게' ? 'py-4' : d === '표준' ? 'py-2.5' : 'py-1.5'}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${d === density ? 'bg-[#4F46E5]' : 'bg-[#D1D0E0]'}`} />
                <span className={`text-sm font-semibold ${d === density ? 'text-[#4F46E5]' : 'text-[#6B6882]'}`}>{d}</span>
                <span className="text-[11px] text-[#A8A6C0] ml-1">
                  {d === '넓게' ? '항목 간 여백 넉넉' : d === '표준' ? '기본 여백' : '최대한 많은 항목 표시'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Density preview */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] text-[#A8A6C0] font-medium">미리보기</span>
          <div className="rounded-xl border border-[#E4E2F0] bg-[#F9F8FF] overflow-hidden">
            {[
              { icon: '📝', title: '회의록 문장정리', sub: '오늘 오전 10:22' },
              { icon: '🌐', title: '번역 비서',       sub: '어제 오후 3:15' },
              { icon: '💻', title: '코드 리뷰 비서',  sub: '2일 전' },
            ].map((item, idx) => (
              <div
                key={item.title}
                className={`flex items-center gap-2.5 px-3 border-[#E4E2F0] transition-all
                  ${idx !== 0 ? 'border-t' : ''}
                  ${density === '넓게' ? 'py-3' : density === '표준' ? 'py-2' : 'py-1'}`}
              >
                <span className={`shrink-0 transition-all ${density === '넓게' ? 'text-lg' : density === '표준' ? 'text-base' : 'text-sm'}`}>
                  {item.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold text-[#1A1826] truncate transition-all
                    ${density === '넓게' ? 'text-[14px]' : density === '표준' ? 'text-[13px]' : 'text-[12px]'}`}>
                    {item.title}
                  </p>
                  {density !== '좁게' && (
                    <p className="text-[11px] text-[#A8A6C0] mt-0.5">{item.sub}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── 비서 패널 ─── */
const BOT_LIST = [
  { name: '회의록 문장정리',  desc: '회의 내용을 체계적인 문서로 자동 정리',     category: '글쓰기' },
  { name: '이메일 문체변경',  desc: '격식·비격식 문체를 자동으로 변환',          category: '글쓰기' },
  { name: '보도자료 초안',    desc: '전문 보도자료 자동 작성',                   category: '글쓰기' },
  { name: '블로그 글쓰기',    desc: 'SEO 최적화된 블로그 포스트 작성',           category: '글쓰기' },
  { name: '코드 리뷰 비서',   desc: '버그·스타일·보안 취약점 자동 리뷰',         category: '코드'   },
  { name: '코드 최적화',      desc: '성능 병목 탐지와 리팩토링 제안',             category: '코드'   },
  { name: '테스트 코드 생성', desc: '유닛·통합 테스트 자동 생성',                category: '코드'   },
  { name: '번역 비서',        desc: '다국어 고품질 자연스러운 번역',              category: '번역'   },
  { name: '동시통역 비서',    desc: '실시간 대화 동시통역 지원',                  category: '번역'   },
  { name: '데이터 분석 비서', desc: '엑셀·CSV를 차트와 인사이트로',               category: '분석'   },
  { name: '문서 요약 비서',   desc: 'PDF·보고서·계약서 핵심 요약',               category: '분석'   },
  { name: '시장조사 비서',    desc: '경쟁사·트렌드 자동 분석 리포트',             category: '분석'   },
  { name: '법률 자문 비서',   desc: '판례 검색과 계약 조항 리스크 점검',          category: '법률·회계' },
  { name: '계약서 검토 비서', desc: '핵심 조항 위험도 자동 판별',                 category: '법률·회계' },
  { name: '회계 정산 비서',   desc: '증빙 정리와 정산서 자동화',                  category: '법률·회계' },
] as const;

const CAT_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  '글쓰기':   { bg: 'bg-[#EEF0FF]', text: 'text-[#4F46E5]', dot: 'bg-[#4F46E5]' },
  '코드':     { bg: 'bg-[#E0F2FE]', text: 'text-[#0284C7]', dot: 'bg-[#0284C7]' },
  '번역':     { bg: 'bg-[#F0FDF4]', text: 'text-[#16A34A]', dot: 'bg-[#16A34A]' },
  '분석':     { bg: 'bg-[#FFF7ED]', text: 'text-[#D97706]', dot: 'bg-[#D97706]' },
  '법률·회계': { bg: 'bg-[#FFF5F5]', text: 'text-[#DC2626]', dot: 'bg-[#DC2626]' },
};

function BotPanel({ selected, onToggle }: { selected: string[]; onToggle: (name: string) => void }) {
  const [query, setQuery] = useState('');
  const filtered = query.trim()
    ? BOT_LIST.filter((b) => b.name.includes(query) || b.desc.includes(query) || b.category.includes(query))
    : BOT_LIST;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-[14px] font-bold text-[#1A1826] mb-1">사용할 비서</h3>
        <p className="text-[12px] text-[#A8A6C0] leading-relaxed">즐겨 사용할 비서를 여러 개 선택할 수 있습니다.</p>
      </div>

      <div className="h-px bg-[#E4E2F0]" />

      {/* 선택된 비서 칩 목록 */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((name) => (
            <span key={name}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F0EEFF] border border-[#C7C3F7] text-[12px] font-semibold text-[#4F46E5]">
              {name}
              <button type="button" onClick={() => onToggle(name)}
                className="ml-0.5 text-[#4F46E5]/60 hover:text-[#4F46E5] transition-colors">
                <X className="w-2.5 h-2.5" strokeWidth={2.5} />
              </button>
            </span>
          ))}
          <span className="flex items-center px-2.5 py-1 text-[12px] text-[#A8A6C0]">
            총 {selected.length}개 선택됨
          </span>
        </div>
      )}

      {/* 검색 */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E4E2F0] bg-[#FAFAFF] hover:border-[#4F46E5]/30 transition-colors">
        <Search className="w-3.5 h-3.5 text-[#A8A6C0] shrink-0" strokeWidth={1.8} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="비서 이름·카테고리 검색…"
          className="flex-1 text-[13px] text-[#1A1826] placeholder:text-[#A8A6C0] bg-transparent outline-none"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')}
            className="text-[#A8A6C0] hover:text-[#6B6882] transition-colors">
            <X className="w-3 h-3" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* 비서 목록 */}
      <div className="flex flex-col gap-1.5">
        {filtered.length === 0 ? (
          <p className="text-center text-[12px] text-[#A8A6C0] py-6">검색 결과가 없습니다.</p>
        ) : (
          filtered.map((b) => {
            const isChecked = selected.includes(b.name);
            const cc = CAT_COLOR[b.category] ?? CAT_COLOR['글쓰기'];
            return (
              <button
                key={b.name}
                type="button"
                onClick={() => onToggle(b.name)}
                className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl border-2 text-left transition-all duration-150
                  ${isChecked
                    ? 'border-[#4F46E5] bg-[#F0EEFF]'
                    : 'border-[#E4E2F0] bg-white hover:border-[#C7C3F7] hover:bg-[#FAFAFF]'
                  }`}
              >
                {/* 카테고리 아바타 */}
                <div className={`w-8 h-8 rounded-lg ${cc.bg} flex items-center justify-center shrink-0`}>
                  <span className={`text-[12px] font-bold ${cc.text}`}>{b.name[0]}</span>
                </div>

                {/* 이름·설명 */}
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-semibold truncate ${isChecked ? 'text-[#4F46E5]' : 'text-[#1A1826]'}`}>
                    {b.name}
                  </p>
                  <p className="text-[10.5px] text-[#A8A6C0] truncate mt-0.5">{b.desc}</p>
                </div>

                {/* 카테고리 칩 */}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${cc.bg} ${cc.text}`}>
                  {b.category}
                </span>

                {/* 체크박스 */}
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all
                  ${isChecked ? 'border-[#4F46E5] bg-[#4F46E5]' : 'border-[#D1D0E0] group-hover:border-[#C7C3F7]'}`}>
                  {isChecked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ─── 비서 순서 설정 패널 ─── */
function AssistantOrderPanel({ order, onReorder }: { order: string[]; onReorder: (newOrder: string[]) => void }) {
  const moveUp = (i: number) => {
    if (i === 0) return;
    const next = [...order];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    onReorder(next);
  };
  const moveDown = (i: number) => {
    if (i === order.length - 1) return;
    const next = [...order];
    [next[i], next[i + 1]] = [next[i + 1], next[i]];
    onReorder(next);
  };
  const remove = (i: number) => {
    onReorder(order.filter((_, idx) => idx !== i));
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-[14px] font-bold text-[#1A1826] mb-1">비서 표시 순서</h3>
        <p className="text-[12px] text-[#A8A6C0] leading-relaxed">
          순서를 조정하면 질의 입력창 '비서 선택' 목록에 <strong className="text-[#4F46E5]">아래부터 위로</strong> 순서대로 반영됩니다.
        </p>
      </div>
      <div className="h-px bg-[#E4E2F0]" />

      <div className="flex flex-col gap-1.5">
        {order.map((name, i) => (
          <div key={name}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-[#E4E2F0] bg-white group hover:border-[#4F46E5]/30 transition-colors">
            {/* 순위 배지 */}
            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 ${
              i === 0 ? 'bg-[#4F46E5] text-white' :
              i === 1 ? 'bg-[#EEF0FF] text-[#4F46E5]' :
              i === 2 ? 'bg-[#F4F3FC] text-[#6B6882]' :
              'bg-[#F9F8FF] text-[#A8A6C0]'
            }`}>
              {i + 1}
            </span>
            {/* 아이콘 */}
            <div className="w-7 h-7 rounded-lg bg-[#F4F3FC] flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-[#A8A6C0]" strokeWidth={1.8} />
            </div>
            {/* 이름 */}
            <span className="flex-1 text-[13px] font-semibold text-[#1A1826] truncate">{name}</span>
            {/* ↑↓ 버튼 */}
            <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button type="button" onClick={() => moveUp(i)} disabled={i === 0}
                className="w-5 h-5 rounded flex items-center justify-center text-[#A8A6C0] hover:text-[#4F46E5] hover:bg-[#EEF0FF] disabled:opacity-25 disabled:pointer-events-none transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
              </button>
              <button type="button" onClick={() => moveDown(i)} disabled={i === order.length - 1}
                className="w-5 h-5 rounded flex items-center justify-center text-[#A8A6C0] hover:text-[#4F46E5] hover:bg-[#EEF0FF] disabled:opacity-25 disabled:pointer-events-none transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </button>
            </div>
            {/* 삭제 버튼 */}
            <button type="button" onClick={() => remove(i)}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-[#D1D0E0] hover:text-[#EF4444] hover:bg-[#FFF0F0] opacity-0 group-hover:opacity-100 transition-all shrink-0"
              aria-label="목록에서 삭제">
              <X className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#F9F8FF] border border-[#E4E2F0]">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
        <p className="text-[10.5px] text-[#6B6882] leading-relaxed">
          1위가 '비서 선택' 팝업의 <span className="font-semibold text-[#4F46E5]">맨 아래</span>, 마지막 순위가 <span className="font-semibold text-[#4F46E5]">맨 위</span>에 표시됩니다.
        </p>
      </div>
    </div>
  );
}

/* ─── 즐겨찾기 비서 패널 ─── */
function FavoritesPanel({ favorites, onRemove }: { favorites: string[]; onRemove: (name: string) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-[14px] font-bold text-[#1A1826] mb-1">즐겨찾기 비서</h3>
        <p className="text-[12px] text-[#A8A6C0] leading-relaxed">
          비서마켓에서 ♥ 버튼을 눌러 즐겨찾는 비서를 추가하세요.
        </p>
      </div>
      <div className="h-px bg-[#E4E2F0]" />
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 gap-3 text-[#A8A6C0]">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF0F0] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <p className="text-base font-semibold text-[#6B6882]">즐겨찾기가 없습니다</p>
          <p className="text-[12px] text-[#A8A6C0] text-center leading-relaxed max-w-[180px]">
            비서마켓의 공식 비서 또는<br />전체 비서 탭에서 추가해보세요.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {favorites.map((name) => (
            <div key={name}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-[#E4E2F0] bg-white">
              <div className="w-7 h-7 rounded-lg bg-[#FFF0F0] flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#EF4444" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <span className="flex-1 text-[13px] font-semibold text-[#1A1826] truncate">{name}</span>
              <button
                type="button"
                onClick={() => onRemove(name)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-semibold text-[#EF4444]
                           bg-[#FFF5F5] hover:bg-[#FFE4E4] transition-colors shrink-0"
              >
                <X className="w-3 h-3" strokeWidth={2} />
                삭제
              </button>
            </div>
          ))}
          <p className="text-[11px] text-[#A8A6C0] text-right mt-1">총 {favorites.length}개</p>
        </div>
      )}
    </div>
  );
}

/* ─── 공통 토글 스위치 ─── */
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative w-9 h-5 rounded-full shrink-0 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30
        ${on ? 'bg-[#4F46E5]' : 'bg-[#D1D0E0]'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200
        ${on ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );
}

/* ─── 알림 패널 ─── */
type NotifKey =
  | 'badge' | 'list'
  | 'botUpdate' | 'newBot';

const NOTIF_CENTER = [
  { key: 'badge' as NotifKey, label: '뱃지 표시',   desc: '알림 센터 아이콘에 읽지 않은 알림 수를 표시합니다.' },
  { key: 'list'  as NotifKey, label: '목록 표시',   desc: '알림 센터 패널에 알림 목록을 표시합니다.' },
];

const NOTIF_ITEMS = [
  { key: 'botUpdate' as NotifKey, label: '비서 업데이트 알림', desc: '사용 중인 비서가 업데이트되면 알립니다.' },
  { key: 'newBot'    as NotifKey, label: '새 비서 출시 알림', desc: '공식 마켓에 새 비서가 등록되면 알립니다.' },
];

function NotificationPanel() {
  const [notifs, setNotifs] = useState<Record<NotifKey, boolean>>({
    badge: true, list: true,
    botUpdate: true, newBot: false,
  });

  const toggle = (key: NotifKey) =>
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }));

  const activeCount = Object.values(notifs).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-[14px] font-bold text-[#1A1826] mb-1">알림 설정</h3>
        <p className="text-[12px] text-[#A8A6C0] leading-relaxed">알림 센터 배지·목록 표시와 수신할 알림 종류를 선택하세요.</p>
      </div>

      <div className="h-px bg-[#E4E2F0]" />

      {/* 알림 센터 표시 제어 */}
      <div className="flex flex-col gap-2">
        <p className="text-[12px] font-bold text-[#6B6882] uppercase tracking-wide">알림 센터</p>
        <div className="flex flex-col gap-1.5">
          {NOTIF_CENTER.map(({ key, label, desc }) => (
            <div key={key}
              className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-[#E4E2F0] bg-white">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[#1A1826]">{label}</p>
                <p className="text-[10.5px] text-[#A8A6C0] mt-0.5 leading-snug">{desc}</p>
              </div>
              <Toggle on={notifs[key]} onChange={() => toggle(key)} />
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-[#E4E2F0]" />

      {/* 알림 수신 항목 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-bold text-[#6B6882] uppercase tracking-wide">알림 수신</p>
          <span className="text-[11px] text-[#A8A6C0]">{activeCount}개 활성</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {NOTIF_ITEMS.map(({ key, label, desc }) => (
            <div key={key}
              className={`flex items-center justify-between gap-4 px-4 py-3 rounded-xl border transition-colors
                ${notifs[key] ? 'border-[#4F46E5]/20 bg-[#FAFAFF]' : 'border-[#E4E2F0] bg-white'}`}>
              <div className="min-w-0">
                <p className={`text-[13px] font-semibold ${notifs[key] ? 'text-[#1A1826]' : 'text-[#A8A6C0]'}`}>{label}</p>
                <p className="text-[10.5px] text-[#A8A6C0] mt-0.5 leading-snug">{desc}</p>
              </div>
              <Toggle on={notifs[key]} onChange={() => toggle(key)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── 사용량 패널 ─── */
type UsagePeriod = '오늘' | '어제' | '주간' | '누적';

const USAGE_DATA: Record<UsagePeriod, {
  tokens: number; tokenLimit: number | null;
  queries: number; queryPrev: number | null;
  byBot: { name: string; tokens: number; queries: number }[];
}> = {
  '오늘': {
    tokens: 12_400, tokenLimit: 50_000,
    queries: 8, queryPrev: 19,
    byBot: [
      { name: '회의록 문장정리', tokens: 5_800, queries: 3 },
      { name: '번역 비서',       tokens: 4_200, queries: 3 },
      { name: '이메일 문체변경', tokens: 2_400, queries: 2 },
    ],
  },
  '어제': {
    tokens: 28_700, tokenLimit: 50_000,
    queries: 19, queryPrev: 12,
    byBot: [
      { name: '회의록 문장정리', tokens: 11_200, queries: 7 },
      { name: '코드 리뷰 비서',  tokens: 9_800,  queries: 6 },
      { name: '번역 비서',       tokens: 7_700,  queries: 6 },
    ],
  },
  '주간': {
    tokens: 97_200, tokenLimit: 350_000,
    queries: 64, queryPrev: 51,
    byBot: [
      { name: '회의록 문장정리', tokens: 38_400, queries: 24 },
      { name: '번역 비서',       tokens: 27_100, queries: 18 },
      { name: '이메일 문체변경', tokens: 18_700, queries: 13 },
      { name: '코드 리뷰 비서',  tokens: 13_000, queries: 9 },
    ],
  },
  '누적': {
    tokens: 1_243_800, tokenLimit: null,
    queries: 847, queryPrev: null,
    byBot: [
      { name: '회의록 문장정리', tokens: 512_000, queries: 340 },
      { name: '번역 비서',       tokens: 318_400, queries: 224 },
      { name: '이메일 문체변경', tokens: 241_800, queries: 167 },
      { name: '코드 리뷰 비서',  tokens: 171_600, queries: 116 },
    ],
  },
};

function fmt(n: number) {
  return n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `${(n / 1_000).toFixed(1)}K`
    : String(n);
}

function UsagePanel() {
  const [period, setPeriod] = useState<UsagePeriod>('오늘');
  const d = USAGE_DATA[period];
  const tokenPct = d.tokenLimit ? Math.min((d.tokens / d.tokenLimit) * 100, 100) : null;
  const queryDiff = d.queryPrev !== null ? d.queries - d.queryPrev : null;
  const maxBotTokens = Math.max(...d.byBot.map((b) => b.tokens));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-[14px] font-bold text-[#1A1826] mb-1">사용량</h3>
        <p className="text-[12px] text-[#A8A6C0] leading-relaxed">토큰 사용량과 질의 건수를 기간별로 확인합니다.</p>
      </div>

      <div className="h-px bg-[#E4E2F0]" />

      {/* 기간 탭 */}
      <div className="flex gap-1 p-1 bg-[#F4F3FC] rounded-xl self-start">
        {(['오늘', '어제', '주간', '누적'] as UsagePeriod[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 rounded-lg text-[11.5px] font-semibold transition-all duration-150
              ${period === p
                ? 'bg-[#FAFAFE] text-[#4F46E5] shadow-sm shadow-black/8'
                : 'text-[#A8A6C0] hover:text-[#6B6882]'
              }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* 스탯 카드 2개 */}
      <div className="grid grid-cols-2 gap-3">
        {/* 토큰 사용량 */}
        <div className="rounded-xl border border-[#E4E2F0] bg-white px-4 py-3.5 flex flex-col gap-2">
          <p className="text-[10.5px] font-semibold text-[#A8A6C0] uppercase tracking-wide">토큰 사용량</p>
          <p className="text-[23px] font-bold text-[#1A1826] leading-none">
            {fmt(d.tokens)}
            {d.tokenLimit && (
              <span className="text-[12px] font-normal text-[#A8A6C0] ml-1">/ {fmt(d.tokenLimit)}</span>
            )}
          </p>
          {tokenPct !== null && (
            <div className="flex flex-col gap-1">
              <div className="h-1.5 rounded-full bg-[#E4E2F0] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500
                    ${tokenPct > 80 ? 'bg-[#EF4444]' : tokenPct > 50 ? 'bg-[#F59E0B]' : 'bg-[#4F46E5]'}`}
                  style={{ width: `${tokenPct}%` }}
                />
              </div>
              <p className="text-[11px] text-[#A8A6C0]">{tokenPct.toFixed(1)}% 사용</p>
            </div>
          )}
          {tokenPct === null && (
            <p className="text-[11px] text-[#A8A6C0]">제한 없음</p>
          )}
        </div>

        {/* 질의 건수 */}
        <div className="rounded-xl border border-[#E4E2F0] bg-white px-4 py-3.5 flex flex-col gap-2">
          <p className="text-[10.5px] font-semibold text-[#A8A6C0] uppercase tracking-wide">질의 건수</p>
          <p className="text-[23px] font-bold text-[#1A1826] leading-none">
            {d.queries.toLocaleString()}
            <span className="text-[12px] font-normal text-[#A8A6C0] ml-1">건</span>
          </p>
          {queryDiff !== null && (
            <p className={`text-[11px] font-semibold ${queryDiff >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              {queryDiff >= 0 ? `▲ ${queryDiff}건` : `▼ ${Math.abs(queryDiff)}건`}
              <span className="font-normal text-[#A8A6C0] ml-1">전일 대비</span>
            </p>
          )}
          {queryDiff === null && (
            <p className="text-[11px] text-[#A8A6C0]">서비스 개시 이후</p>
          )}
        </div>
      </div>

      {/* 비서별 사용량 */}
      <div className="flex flex-col gap-2">
        <p className="text-[12px] font-bold text-[#6B6882] uppercase tracking-wide">비서별 사용량</p>
        <div className="flex flex-col gap-1.5">
          {d.byBot.map((b) => {
            const pct = (b.tokens / maxBotTokens) * 100;
            return (
              <div key={b.name} className="flex flex-col gap-1 px-3 py-2.5 rounded-xl border border-[#E4E2F0] bg-white">
                <div className="flex items-center justify-between">
                  <p className="text-[11.5px] font-semibold text-[#1A1826]">{b.name}</p>
                  <div className="flex items-center gap-2 text-[10.5px] text-[#A8A6C0]">
                    <span>{fmt(b.tokens)} 토큰</span>
                    <span className="text-[#D1D0E0]">·</span>
                    <span>{b.queries}건</span>
                  </div>
                </div>
                <div className="h-1 rounded-full bg-[#E4E2F0] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#4F46E5]/50 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── 메모리 패널 ─── */
type MemoryKind = '지침' | '사실' | '선호';

interface MemoryItem {
  id: number;
  kind: MemoryKind;
  text: string;
  scope: string; // '전체' = 모든 대화, 그 외 비서명
}

const KIND_STYLE: Record<MemoryKind, { bg: string; text: string }> = {
  '지침': { bg: '#EEF0FF', text: '#4F46E5' },
  '사실': { bg: '#F3F4F6', text: '#4B5563' },
  '선호': { bg: '#F0FDF4', text: '#16A34A' },
};

const INITIAL_MEMORIES: MemoryItem[] = [
  { id: 1, kind: '지침', text: '답변은 항상 표로 정리해 준다', scope: '전체' },
  { id: 2, kind: '사실', text: '국립전파연구원 전파환경안전과 소속이다', scope: '전체' },
  { id: 3, kind: '사실', text: '장비예약 승인 업무를 담당한다', scope: '업무 도우미' },
  { id: 4, kind: '선호', text: '보고서 초안은 개조식보다 서술형을 선호한다', scope: '업무 도우미' },
];

const SCOPE_OPTIONS = ['전체', '업무 도우미', '회의록 비서', '번역 비서', '코드 리뷰 비서'];

const KIND_PLACEHOLDER: Record<MemoryKind, string> = {
  '지침': '예) 답변은 항상 표로 정리해 준다',
  '사실': '예) 국립전파연구원 전파환경안전과 소속이다',
  '선호': '예) 보고서 초안은 개조식보다 서술형을 선호한다',
};

function MemoryPanel() {
  const [enabled, setEnabled]     = useState(true);
  const [items, setItems]         = useState<MemoryItem[]>(INITIAL_MEMORIES);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText]   = useState('');
  const [addingScope, setAddingScope] = useState<string | null>(null);
  const [newKind, setNewKind]     = useState<MemoryKind>('사실');
  const [newText, setNewText]     = useState('');

  const scopes = Array.from(new Set(items.map(i => i.scope)));
  const allScopes = Array.from(new Set([...scopes, ...SCOPE_OPTIONS]));

  const startEdit = (item: MemoryItem) => { setEditingId(item.id); setEditText(item.text); };
  const saveEdit  = (id: number) => {
    if (editText.trim()) setItems(prev => prev.map(i => i.id === id ? { ...i, text: editText.trim() } : i));
    setEditingId(null);
  };
  const deleteItem = (id: number) => setItems(prev => prev.filter(i => i.id !== id));
  const changeScope = (id: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const idx = allScopes.indexOf(item.scope);
    const next = allScopes[(idx + 1) % allScopes.length];
    setItems(prev => prev.map(i => i.id === id ? { ...i, scope: next } : i));
  };
  const addItem = (scope: string) => {
    if (!newText.trim()) return;
    setItems(prev => [...prev, { id: Date.now(), kind: newKind, text: newText.trim(), scope }]);
    setNewText(''); setAddingScope(null);
  };

  const grouped = items.reduce<Record<string, MemoryItem[]>>((acc, item) => {
    (acc[item.scope] ??= []).push(item); return acc;
  }, {});

  return (
    <div className="flex flex-col gap-5">
      {/* 헤더 */}
      <div>
        <h3 className="text-[14px] font-bold text-[#1A1826] mb-1">대화 메모리</h3>
        <p className="text-[12px] text-[#A8A6C0] leading-relaxed">AI가 대화에서 학습한 선호·사실·지침을 관리합니다.</p>
      </div>

      <div className="h-px bg-[#E4E2F0]" />

      {/* 대화 기억하기 토글 */}
      <div className="flex items-start justify-between gap-4 px-4 py-3.5 rounded-xl border border-[#E4E2F0] bg-white">
        <div className="min-w-0">
          <p className="text-[14px] font-bold text-[#1A1826]">대화 기억하기</p>
          <p className="text-[12px] text-[#A8A6C0] mt-0.5 leading-snug">
            대화에서 드러난 선호·사실을 저장해 다음 대화에서 참고합니다
          </p>
        </div>
        {/* 토글 */}
        <button type="button" role="switch" aria-checked={enabled} onClick={() => setEnabled(v => !v)}
          className={`relative w-10 h-[22px] rounded-full shrink-0 mt-0.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 ${enabled ? 'bg-[#4F46E5]' : 'bg-[#D1D0E0]'}`}>
          <span className={`absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${enabled ? 'translate-x-[18px]' : 'translate-x-0'}`} />
        </button>
      </div>

      <div className="h-px bg-[#E4E2F0]" />

      {/* 기억하는 것 */}
      <div className={`flex flex-col gap-4 transition-opacity duration-200 ${enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-bold text-[#1A1826]">기억하는 것</p>
          <span className="text-[11px] text-[#A8A6C0]">{items.length}개</span>
        </div>

        {items.length === 0 && (
          <div className="px-4 py-5 rounded-xl border border-dashed border-[#C7C3F7] bg-[#FAFAFF]">
            <p className="text-[13px] text-[#6B6882] leading-relaxed">
              아직 기억한 것이 없습니다. 대화를 나누면 다음 대화에도 유용할 내용만 골라 여기에 쌓입니다.
            </p>
          </div>
        )}

        {/* 그룹별 목록 */}
        {Object.entries(grouped).map(([scope, scopeItems]) => (
          <div key={scope} className="flex flex-col gap-1.5">
            {/* 그룹 레이블 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {scope === '전체'
                  ? <Globe className="w-3 h-3 text-[#A8A6C0]" strokeWidth={1.8} />
                  : <Bot className="w-3 h-3 text-[#A8A6C0]" strokeWidth={1.8} />}
                <span className="text-[12px] font-semibold text-[#6B6882]">
                  {scope === '전체' ? '모든 대화에서 공유' : scope}
                </span>
              </div>
              <button type="button" onClick={() => setAddingScope(scope === addingScope ? null : scope)}
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg text-[11px] font-semibold text-[#4F46E5] hover:bg-[#F0EEFF] transition-colors">
                <Plus className="w-3 h-3" strokeWidth={2} />추가
              </button>
            </div>

            {/* 추가 입력 폼 */}
            {addingScope === scope && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-[#4F46E5] bg-[#FAFAFF]">
                <select value={newKind} onChange={e => setNewKind(e.target.value as MemoryKind)}
                  className="text-[12px] font-bold rounded-lg border border-[#E4E2F0] px-1.5 py-1 outline-none bg-white"
                  style={{ color: KIND_STYLE[newKind].text }}>
                  {(['지침','사실','선호'] as MemoryKind[]).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                <input autoFocus value={newText} onChange={e => setNewText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addItem(scope); if (e.key === 'Escape') setAddingScope(null); }}
                  placeholder={KIND_PLACEHOLDER[newKind]} className="flex-1 text-[13px] text-[#1A1826] placeholder:text-[#A8A6C0] outline-none bg-transparent" />
                <button type="button" onClick={() => addItem(scope)} disabled={!newText.trim()}
                  className="px-2 py-1 rounded-lg bg-[#4F46E5] text-white text-[12px] font-semibold disabled:opacity-40 transition-colors">저장</button>
                <button type="button" onClick={() => setAddingScope(null)} className="p-1 rounded-lg text-[#A8A6C0] hover:text-[#6B6882] transition-colors">
                  <X className="w-3.5 h-3.5" strokeWidth={2} /></button>
              </div>
            )}

            {/* 항목 목록 */}
            {scopeItems.map(item => (
              <div key={item.id}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-[#E4E2F0] bg-white hover:border-[#C7C3F7] transition-colors group">
                {/* 유형 배지 */}
                <span className="shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: KIND_STYLE[item.kind].bg, color: KIND_STYLE[item.kind].text }}>
                  {item.kind}
                </span>

                {/* 텍스트 / 편집 인풋 */}
                {editingId === item.id ? (
                  <input autoFocus value={editText} onChange={e => setEditText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(item.id); if (e.key === 'Escape') setEditingId(null); }}
                    className="flex-1 text-[13px] text-[#1A1826] border-b border-[#4F46E5] outline-none bg-transparent pb-0.5" />
                ) : (
                  <span className="flex-1 text-[13px] text-[#1A1826] leading-snug">{item.text}</span>
                )}

                {/* 액션 버튼 */}
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {editingId === item.id ? (
                    <>
                      <button type="button" onClick={() => saveEdit(item.id)}
                        className="p-1 rounded-lg text-[#10B981] hover:bg-[#F0FDF4] transition-colors">
                        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </button>
                      <button type="button" onClick={() => setEditingId(null)}
                        className="p-1 rounded-lg text-[#A8A6C0] hover:bg-[#F4F3FC] transition-colors">
                        <X className="w-3.5 h-3.5" strokeWidth={2} />
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={() => startEdit(item)}
                      className="p-1 rounded-lg text-[#A8A6C0] hover:text-[#4F46E5] hover:bg-[#F0EEFF] transition-colors">
                      <Pencil className="w-3.5 h-3.5" strokeWidth={1.8} />
                    </button>
                  )}
                  {scope !== '전체' && (
                    <button type="button" onClick={() => changeScope(item.id)} title="공유 범위 변경"
                      className="p-1 rounded-lg text-[#A8A6C0] hover:text-[#3B82F6] hover:bg-[#EFF6FF] transition-colors">
                      <Globe className="w-3.5 h-3.5" strokeWidth={1.8} />
                    </button>
                  )}
                  <button type="button" onClick={() => deleteItem(item.id)}
                    className="p-1 rounded-lg text-[#A8A6C0] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors">
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* 전체 삭제 */}
        {items.length > 0 && (
          <button type="button" onClick={() => setItems([])}
            className="self-start text-[12px] font-semibold text-[#EF4444] hover:text-[#DC2626] transition-colors">
            모든 기억 삭제
          </button>
        )}
      </div>
    </div>
  );
}

function PlaceholderPanel({ tab }: { tab: SettingsTab }) {
  const descriptions: Record<string, string> = {
    '비서': '연결된 AI 비서를 관리하고, 기본 비서를 설정합니다.',
    '알림': '대화 완료·업데이트·주간 요약 등 알림 수신 방식을 설정합니다.',
    '사용량': '이번 달 AI 사용량, 비용, 남은 크레딧을 확인합니다.',
  };
  const icons: Record<string, LucideIcon> = { '비서': Bot, '알림': Bell, '사용량': Gauge };
  const Icon = icons[tab];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-[14px] font-bold text-[#1A1826] mb-1">{tab} 설정</h3>
        <p className="text-[12px] text-[#A8A6C0] leading-relaxed">{descriptions[tab]}</p>
      </div>
      <div className="h-px bg-[#E4E2F0]" />
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#F4F3FC] flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#A8A6C0]" strokeWidth={1.8} />
        </div>
        <p className="text-base font-semibold text-[#6B6882]">{tab} 설정 준비 중</p>
        <p className="text-[12px] text-[#A8A6C0] text-center max-w-[200px] leading-relaxed">
          이 섹션은 현재 개발 중입니다.<br />곧 업데이트될 예정입니다.
        </p>
      </div>
    </div>
  );
}

export default function SettingsModal({ onClose, favorites = [], onRemoveFavorite, assistantOrder = [], onReorderAssistant }: {
  onClose: () => void;
  favorites?: string[];
  onRemoveFavorite?: (name: string) => void;
  assistantOrder?: string[];
  onReorderAssistant?: (newOrder: string[]) => void;
}) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('표시');
  const [saveFlash, setSaveFlash] = useState(false);

  const handleSave = () => {
    setSaveFlash(true);
    setTimeout(() => { setSaveFlash(false); onClose(); }, 600);
  };

  return (
    <div
      className="absolute inset-0 flex items-center justify-center z-20"
      style={{ backgroundColor: 'rgba(26,24,38,0.45)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl shadow-black/20 border border-[#E4E2F0] flex overflow-hidden"
        style={{ width: 680, height: 540 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left nav */}
        <div className="w-[176px] bg-[#F9F8FF] border-r border-[#E4E2F0] flex flex-col shrink-0">
          {/* Modal header */}
          <div className="px-5 pt-5 pb-4 border-b border-[#E4E2F0] shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-lg bg-[#4F46E5] flex items-center justify-center shadow-sm">
                <svg viewBox="0 0 20 20" fill="none" className="w-3.5 h-3.5" aria-hidden="true">
                  <circle cx="10" cy="10" r="7" fill="white" fillOpacity="0.2"/>
                  <path d="M7 10.5l2.5 2.5 4-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-sm font-bold text-[#1A1826]">개인 설정</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#F0EEFF] border border-[#C7C3F7] mt-2">
              <div className="w-5 h-5 rounded-full bg-[#4F46E5] flex items-center justify-center text-[10px] font-bold text-white">김</div>
              <span className="text-[11px] font-semibold text-[#4F46E5]">김동현</span>
            </div>
          </div>

          {/* Tab list */}
          <nav className="flex flex-col gap-0.5 px-2 py-3 flex-1">
            {TABS.map(({ id, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 text-left w-full
                  ${activeTab === id
                    ? 'bg-[#4F46E5] text-white shadow-sm shadow-[#4F46E5]/25'
                    : 'text-[#6B6882] hover:bg-[#EEEEFF] hover:text-[#4F46E5]'
                  }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.8} />
                {id}
              </button>
            ))}
          </nav>

        </div>

        {/* Right content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Panel header */}
          <div className="h-11 flex items-center justify-between px-6 border-b border-[#E4E2F0] shrink-0">
            <span className="text-base font-bold text-[#1A1826]">{activeTab}</span>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#A8A6C0] hover:text-[#1A1826] hover:bg-[#F4F3FC] transition-colors"
            >
              <X className="w-4 h-4" strokeWidth={1.8} />
            </button>
          </div>

          {/* Scrollable panel body */}
          <div className="flex-1 overflow-y-auto px-6 py-5" style={{ scrollbarWidth: 'none' }}>
            {activeTab === '표시' && <DisplayPanel />}
            {activeTab === '비서' && (
              <AssistantOrderPanel order={assistantOrder} onReorder={onReorderAssistant ?? (() => {})} />
            )}
            {activeTab === '알림' && <NotificationPanel />}
            {activeTab === '사용량' && <UsagePanel />}
            {activeTab !== '표시' && activeTab !== '비서' && activeTab !== '알림' && activeTab !== '사용량' && (
              <PlaceholderPanel tab={activeTab} />
            )}
          </div>

          {/* Footer buttons */}
          <div className="h-12 flex items-center justify-end gap-2 px-6 border-t border-[#E4E2F0] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#E4E2F0] text-sm font-semibold text-[#6B6882] hover:bg-[#F4F3FC] hover:text-[#1A1826] transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              className={`px-5 py-2 rounded-lg text-white text-sm font-semibold shadow-sm transition-all duration-200
                ${saveFlash
                  ? 'bg-[#16A34A] shadow-[#16A34A]/25 scale-95'
                  : 'bg-[#4F46E5] hover:bg-[#4338CA] shadow-[#4F46E5]/25'
                }`}
            >
              {saveFlash ? '저장됨 ✓' : '저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}