import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

// ============================================================
// FitToScreen —— 「一屏装下」缩放器：幼儿不会上下滑动，
// 内容若超过可用空间则整体等比缩小（只缩小、不放大），
// 保证任何竖屏/横屏下所有信息都在一屏内、无需滚动。
// 用法：放在 absolute inset-0 的舞台根节点里，包住内容列。
// ============================================================
export default function FitToScreen({ children }: { children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const measure = () => {
      const availH = outer.clientHeight;
      const natH = inner.scrollHeight;
      if (availH > 0 && natH > 0) {
        setScale(Math.min(1, availH / natH));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(outer);
    ro.observe(inner);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={outerRef} className="absolute inset-0 overflow-hidden flex items-center justify-center">
      <div ref={innerRef} className="w-full" style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
        {children}
      </div>
    </div>
  );
}