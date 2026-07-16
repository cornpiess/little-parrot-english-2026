import React, { useRef, useEffect } from "react";

interface WheelPickerProps {
  items: string[] | number[];
  value: string | number;
  onChange: (value: any) => void;
  label?: string;
}

export const WheelPicker = ({ items, value, onChange, label }: WheelPickerProps) => {
  const itemHeight = 44;
  const containerHeight = itemHeight * 5;
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollerRef.current) {
      const index = items.indexOf(value as never);
      if (index !== -1) {
        scrollerRef.current.scrollTop = index * itemHeight;
      }
    }
  }, []);

  const handleScrollEnd = () => {
    if (scrollerRef.current) {
      const scrollTop = scrollerRef.current.scrollTop;
      const index = Math.round(scrollTop / itemHeight);
      const clampedIndex = Math.max(0, Math.min(index, items.length - 1));

      if (scrollTop !== clampedIndex * itemHeight) {
        scrollerRef.current.scrollTo({
          top: clampedIndex * itemHeight,
          behavior: "smooth"
        });
      }

      onChange(items[clampedIndex]);
    }
  };

  useEffect(() => {
    const element = scrollerRef.current;
    if (!element) return;

    let timeoutId: any;
    const onScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScrollEnd, 150);
    };

    element.addEventListener("scroll", onScroll);
    return () => {
      element.removeEventListener("scroll", onScroll);
      clearTimeout(timeoutId);
    };
  }, [items]);

  return (
    <div className="flex flex-col items-center flex-1">
      {label && <span className="text-xs text-muted-foreground mb-1 font-medium">{label}</span>}
      <div className="relative w-full" style={{ height: containerHeight }}>
        {/* Selection highlight */}
        <div
          className="absolute left-0 right-0 pointer-events-none rounded-2xl"
          style={{
            top: itemHeight * 2,
            height: itemHeight,
            background: 'hsla(25, 85%, 58%, 0.12)',
            border: '1px solid hsla(25, 85%, 58%, 0.25)',
          }}
        />

        {/* Top/bottom fade */}
        <div className="absolute top-0 left-0 right-0 h-16 z-10 pointer-events-none" style={{ background: 'linear-gradient(to bottom, hsla(30, 20%, 99%, 0.9), transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-16 z-10 pointer-events-none" style={{ background: 'linear-gradient(to top, hsla(30, 20%, 99%, 0.9), transparent)' }} />

        <div
          ref={scrollerRef}
          className="overflow-y-scroll no-scrollbar"
          style={{ height: containerHeight, scrollSnapType: 'y mandatory' }}
        >
          {/* Padding items */}
          <div style={{ height: itemHeight * 2 }} />
          {items.map((item, idx) => {
            const isSelected = item === value;
            return (
              <div
                key={idx}
                style={{ height: itemHeight, scrollSnapAlign: 'center' }}
                className={`flex items-center justify-center text-lg transition-all ${
                  isSelected ? 'text-foreground font-bold scale-110' : 'text-muted-foreground/40'
                }`}
              >
                {item}
              </div>
            );
          })}
          <div style={{ height: itemHeight * 2 }} />
        </div>
      </div>
    </div>
  );
};
