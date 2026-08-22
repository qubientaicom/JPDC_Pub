import { useState, useMemo, useRef, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { ICON_CATEGORIES, ICON_BG_COLORS, ALL_ICONS, searchByKorean, isHanIcon, getHanChar } from '../data/materialIcons';

export type SelectedIcon = { name: string; bg: string; color: string };

interface IconPickerModalProps {
  open: boolean;
  current: SelectedIcon | null;
  onSelect: (icon: SelectedIcon) => void;
  onClose: () => void;
}

export default function IconPickerModal({ open, current, onSelect, onClose }: IconPickerModalProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [pickedColor, setPickedColor] = useState<{ bg: string; color: string }>(
    ICON_BG_COLORS[0]
  );
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const catScrollRef = useRef<HTMLDivElement>(null);

  // Sync color picker with currently selected icon
  useEffect(() => {
    if (open) {
      setSearch('');
      if (current) {
        const match = ICON_BG_COLORS.find(c => c.bg === current.bg);
        setPickedColor(match ?? ICON_BG_COLORS[0]);
      }
      setTimeout(() => searchRef.current?.focus(), 80);
    }
  }, [open]);

  const displayedIcons = useMemo(() => {
    const base =
      activeCategory === 'all'
        ? ALL_ICONS
        : (ICON_CATEGORIES.find(c => c.id === activeCategory)?.icons ?? []);
    if (!search.trim()) return base;

    const q = search.trim();
    const isKorean = /[가-힣]/.test(q);

    if (isKorean) {
      // 한글 검색: 키워드 맵에서 매칭된 아이콘 이름을 base에서 필터
      const matched = searchByKorean(q);
      if (matched.size === 0) return [];
      return base.filter(n => matched.has(n));
    }

    // 영문 검색: 기존 방식
    const eq = q.toLowerCase().replace(/\s+/g, '_');
    return base.filter(n => n.includes(eq));
  }, [activeCategory, search]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      {/* panel */}
      <div className="relative z-10 w-full sm:w-[560px] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-[#E4E2F0] flex flex-col overflow-hidden"
        style={{ height: '88dvh', maxHeight: '88dvh' }}>

        {/* header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <div>
            <p className="text-[16px] font-bold text-[#1A1826]">아이콘 선택</p>
            <p className="text-[12px] text-[#A8A6C0] mt-0.5">Google Material Icons · {ALL_ICONS.length}개</p>
          </div>
          <button type="button" onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4F3FC] flex items-center justify-center hover:bg-[#E9E7FA] transition-colors">
            <X className="w-4 h-4 text-[#6B6882]" strokeWidth={2.5} />
          </button>
        </div>

        {/* search */}
        <div className="px-5 pb-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E4E2F0] bg-[#F7F6FD] focus-within:border-[#4F46E5] transition-colors">
            <Search className="w-4 h-4 text-[#A8A6C0] shrink-0" strokeWidth={2} />
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="책, 도서, 설정, 사람… 또는 book, person, home…"
              className="flex-1 text-[14px] text-[#1A1826] bg-transparent outline-none placeholder:text-[#A8A6C0]"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')}
                className="text-[#A8A6C0] hover:text-[#6B6882]">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* category tabs */}
        <div ref={catScrollRef}
          className="flex gap-1.5 overflow-x-auto px-5 pb-3 shrink-0"
          style={{ scrollbarWidth: 'none' }}>
          {[{ id: 'all', label: `전체 (${ALL_ICONS.length})` }, ...ICON_CATEGORIES].map(cat => (
            <button key={cat.id} type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all shrink-0 ${
                activeCategory === cat.id
                  ? 'bg-[#4F46E5] text-white shadow-sm'
                  : 'bg-[#F4F3FC] text-[#6B6882] hover:bg-[#E9E7FA]'
              }`}>
              {cat.label}
            </button>
          ))}
        </div>

        {/* color palette + live preview */}
        <div className="px-5 pb-3 shrink-0">
          <p className="text-[12px] font-semibold text-[#A8A6C0] mb-2">배경 색상 — 클릭하면 아이콘 전체에 즉시 적용됩니다</p>
          <div className="flex items-center gap-3">
            {/* color swatches */}
            <div className="flex gap-1.5 flex-wrap flex-1">
              {ICON_BG_COLORS.map(c => (
                <button key={c.bg} type="button"
                  onClick={() => setPickedColor(c)}
                  title={c.label}
                  className={`w-7 h-7 rounded-full transition-all ${
                    pickedColor.bg === c.bg
                      ? 'ring-2 ring-[#4F46E5] ring-offset-2 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ background: c.bg, border: `2px solid ${c.color}33` }}
                >
                  {c.bg === '#1A1826' && (
                    <span className="block w-2 h-2 rounded-full bg-white mx-auto" />
                  )}
                </button>
              ))}
            </div>
            {/* live preview */}
            <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E4E2F0]">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                style={{ background: pickedColor.bg }}
              >
                {current && isHanIcon(current.name) ? (
                  <span className="font-bold leading-none select-none" style={{ fontSize: 22, color: pickedColor.color }}>
                    {getHanChar(current.name)}
                  </span>
                ) : (
                  <span className="material-icons select-none transition-colors" style={{ fontSize: 22, color: pickedColor.color }}>
                    {current?.name ?? 'smart_toy'}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-[#A8A6C0] leading-tight">
                <p className="font-semibold text-[#6B6882]">{pickedColor.label}</p>
                <p>미리보기</p>
              </div>
            </div>
          </div>
        </div>

        {/* divider */}
        <div className="mx-5 border-t border-[#F0EFF8] mb-1 shrink-0" />

        {/* icon grid */}
        <div className="flex-1 overflow-y-auto px-4 py-3" style={{ scrollbarWidth: 'thin' }}>
          {displayedIcons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-[#A8A6C0]">
              <span className="material-icons text-[41px] mb-2">search_off</span>
              <p className="text-[14px]">"{search}" 검색 결과 없음</p>
            </div>
          ) : (
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
              {displayedIcons.map(name => {
                const isSelected = current?.name === name;
                const isHovered = hoveredIcon === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => onSelect({ name, bg: pickedColor.bg, color: pickedColor.color })}
                    onMouseEnter={() => setHoveredIcon(name)}
                    onMouseLeave={() => setHoveredIcon(null)}
                    title={name.replace(/_/g, ' ')}
                    className={`relative flex flex-col items-center justify-center aspect-square rounded-xl transition-all group ${
                      isSelected
                        ? 'ring-2 ring-[#4F46E5] ring-offset-1 scale-105'
                        : 'hover:scale-105 hover:ring-1 hover:ring-[#C7C3F7] hover:ring-offset-1'
                    }`}
                    style={{ background: pickedColor.bg }}
                  >
                    {isHanIcon(name) ? (
                      <span className="font-bold leading-none select-none" style={{ fontSize: 26, color: pickedColor.color }}>
                        {getHanChar(name)}
                      </span>
                    ) : (
                      <span className="material-icons text-[23px] leading-none select-none" style={{ color: pickedColor.color }}>
                        {name}
                      </span>
                    )}
                    {/* tooltip-like name on hover */}
                    {isHovered && (
                      <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded text-[10px] bg-[#1A1826] text-white z-10 pointer-events-none">
                        {name.replace(/_/g, ' ')}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* footer */}
        <div className="px-5 py-3 border-t border-[#F0EFF8] shrink-0 flex items-center justify-between bg-[#FAFAFA]">
          <p className="text-[12px] text-[#A8A6C0]">
            {displayedIcons.length.toLocaleString()}개 표시
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose}
              className="px-4 py-1.5 rounded-full border border-[#E4E2F0] text-[13px] text-[#6B6882] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors bg-white">
              취소
            </button>
            {current && (
              <button type="button"
                onClick={() => onSelect({ name: current.name, bg: pickedColor.bg, color: pickedColor.color })}
                className="px-4 py-1.5 rounded-full bg-[#4F46E5] text-white text-[13px] font-semibold hover:bg-[#4338CA] transition-colors">
                색상 적용
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
