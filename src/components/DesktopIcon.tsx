import { useState, useRef, useEffect } from 'react';
import { playClick } from '../utils/sounds';

export interface IconConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  initialX: number;
  initialY: number;
}

interface DesktopIconProps {
  config: IconConfig;
  zIndex: number;
  onBringToFront: (id: string) => void;
  onOpen: (id: string) => void;
}

export default function DesktopIcon({ config, zIndex, onBringToFront, onOpen }: DesktopIconProps) {
  const [pos, setPos] = useState({ x: config.initialX, y: config.initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const didMove = useRef(false);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onBringToFront(config.id);
    setIsSelected(true);
    didMove.current = false;
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
    setIsDragging(true);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    onBringToFront(config.id);
    setIsSelected(true);
    didMove.current = false;
    dragStart.current = { mx: t.clientX, my: t.clientY, px: pos.x, py: pos.y };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.mx;
      const dy = e.clientY - dragStart.current.my;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didMove.current = true;
      setPos({ x: dragStart.current.px + dx, y: dragStart.current.py + dy });
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      const dx = t.clientX - dragStart.current.mx;
      const dy = t.clientY - dragStart.current.my;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didMove.current = true;
      setPos({ x: dragStart.current.px + dx, y: dragStart.current.py + dy });
    };
    const stop = () => {
      setIsDragging(false);
      setIsSelected(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', stop);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', stop);
    };
  }, [isDragging]);

  // Deselect when clicking elsewhere
  useEffect(() => {
    const deselect = () => setIsSelected(false);
    window.addEventListener('mousedown', deselect);
    return () => window.removeEventListener('mousedown', deselect);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!didMove.current) { playClick(); onOpen(config.id); }
  };

  return (
    <div
      onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e); }}
      onTouchStart={onTouchStart}
      onDoubleClick={handleClick}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        zIndex: isDragging ? 9999 : zIndex,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        width: 80,
        transform: `scale(${isDragging ? 1.08 : 1})`,
        transition: isDragging ? 'none' : 'transform 0.2s ease',
      }}
    >
      {/* Icon box */}
      <div style={{
        width: 64,
        height: 64,
        borderRadius: 4,
        background: isSelected
          ? 'rgba(212, 250, 112, 0.45)'
          : 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(12px)',
        border: isSelected
          ? '1.5px solid rgba(90, 138, 0, 0.5)'
          : '1px solid rgba(90, 138, 0, 0.2)',
        boxShadow: isSelected
          ? '0 4px 24px rgba(90,138,0,0.18)'
          : '0 2px 12px rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
      }}>
        {config.icon}
      </div>

      {/* Label */}
      <span style={{
        fontFamily: 'ui-monospace, Menlo, monospace',
        fontSize: '0.75rem',
        fontWeight: 500,
        color: '#4A7000',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        lineHeight: 1,
        padding: '2px 6px',
        borderRadius: 4,
        background: isSelected ? 'rgba(90, 138, 0, 0.15)' : 'transparent',
        whiteSpace: 'nowrap',
        transition: 'background 0.2s ease',
      }}>
        {config.label}
      </span>
    </div>
  );
}
