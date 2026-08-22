import type { ReactNode } from 'react';

type Position = 'top' | 'bottom' | 'left' | 'right';

/* 팝오버 위치 */
const posClasses: Record<Position, string> = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-2.5',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2.5',
  left:   'right-full top-1/2 -translate-y-1/2 mr-2.5',
  right:  'left-full top-1/2 -translate-y-1/2 ml-2.5',
};

/* 화살표 꼭지 위치 & 회전 */
const arrowClasses: Record<Position, string> = {
  top:    'top-full left-1/2 -translate-x-1/2 -mt-px  border-t border-l rotate-[225deg]',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-px border-t border-l rotate-45',
  left:   'left-full top-1/2 -translate-y-1/2 -ml-px  border-t border-l rotate-[135deg]',
  right:  'right-full top-1/2 -translate-y-1/2 -mr-px border-t border-l rotate-[315deg]',
};

export default function Tooltip({
  label,
  children,
  position = 'top',
  className = '',
}: {
  label: string;
  children: ReactNode;
  position?: Position;
  className?: string;
}) {
  return (
    <div className={`relative group/tooltip inline-flex ${className}`}>
      {children}

      <div
        className={`pointer-events-none absolute ${posClasses[position]} z-[9999]
                    opacity-0 group-hover/tooltip:opacity-100
                    transition-opacity duration-150 delay-200`}
      >
        {/* 화살표 */}
        <div
          className={`absolute w-2.5 h-2.5 bg-white border-[#E4E2F0] ${arrowClasses[position]}`}
        />

        {/* 본문 */}
        <div className="relative bg-white border border-[#E4E2F0] text-[#1A1826] text-[12px]
                        font-medium px-3 py-1.5 rounded-lg whitespace-nowrap
                        shadow-lg shadow-black/8">
          {label}
        </div>
      </div>
    </div>
  );
}
