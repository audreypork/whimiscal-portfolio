import { useState, useRef, useEffect } from 'react';

export interface Project {
  id: string;
  title: string;
  category: string;
  year: string;
  description: string;
  tags: string[];
  color: string;
  size: 'sm' | 'md' | 'lg';
}

interface MoodboardCardProps {
  project: Project;
  initialX: number;
  initialY: number;
  rotation: number;
  zIndex: number;
  onBringToFront: (id: string) => void;
}

export default function MoodboardCard({
  project,
  initialX,
  initialY,
  rotation,
  zIndex,
  onBringToFront,
}: MoodboardCardProps) {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });

  const sizeMap = {
    sm: { width: 180, minHeight: 140 },
    md: { width: 220, minHeight: 180 },
    lg: { width: 280, minHeight: 200 },
  };
  const { width, minHeight } = sizeMap[project.size];

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    onBringToFront(project.id);
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    onBringToFront(project.id);
    const t = e.touches[0];
    dragStart.current = { mx: t.clientX, my: t.clientY, px: pos.x, py: pos.y };
  };

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      setPos({
        x: dragStart.current.px + (e.clientX - dragStart.current.mx),
        y: dragStart.current.py + (e.clientY - dragStart.current.my),
      });
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      setPos({
        x: dragStart.current.px + (t.clientX - dragStart.current.mx),
        y: dragStart.current.py + (t.clientY - dragStart.current.my),
      });
    };
    const stop = () => setIsDragging(false);

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

  return (
    <div
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width,
        minHeight,
        zIndex: isDragging ? 9999 : zIndex,
        transform: `rotate(${isHovered || isDragging ? rotation * 0.3 : rotation}deg) scale(${isDragging ? 1.05 : isHovered ? 1.02 : 1})`,
        transition: isDragging ? 'transform 0.1s ease' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(90, 138, 0, 0.25)',
          borderRadius: 2,
          padding: '16px',
          boxShadow: isDragging
            ? '0 20px 60px rgba(90,138,0,0.2), 0 0 0 1px rgba(90,138,0,0.15)'
            : isHovered
            ? '0 8px 32px rgba(90,138,0,0.15), 0 0 0 1px rgba(90,138,0,0.1)'
            : '0 2px 12px rgba(0,0,0,0.06)',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        {/* Color accent bar */}
        <div style={{
          width: 24,
          height: 3,
          background: project.color,
          marginBottom: 12,
          borderRadius: 2,
        }} />

        <div style={{
          fontFamily: 'ui-monospace, Menlo, monospace',
          fontSize: '0.6rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#4A7000',
          opacity: 0.7,
          marginBottom: 6,
        }}>
          {project.category} / {project.year}
        </div>

        <div style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Helvetica, sans-serif',
          fontSize: project.size === 'lg' ? '1.2rem' : '1rem',
          fontWeight: 500,
          color: '#1A2800',
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
          marginBottom: 8,
        }}>
          {project.title}
        </div>

        <div style={{
          fontFamily: 'ui-monospace, Menlo, monospace',
          fontSize: '0.7rem',
          color: '#3A5500',
          opacity: 0.75,
          lineHeight: 1.5,
          marginBottom: 12,
        }}>
          {project.description}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {project.tags.map(tag => (
            <span key={tag} style={{
              fontFamily: 'ui-monospace, Menlo, monospace',
              fontSize: '0.55rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#5A8A00',
              background: 'rgba(212, 250, 112, 0.3)',
              border: '1px solid rgba(90, 138, 0, 0.2)',
              borderRadius: 2,
              padding: '2px 6px',
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
