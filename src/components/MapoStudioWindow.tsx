import { useState, useRef } from 'react';

const PROJECTS = [
  { id: 'lorikeet', label: 'Lorikeet', year: '2025', type: 'Web app — agent creation UX',        image: '/projects/lorikeet.png' },
  { id: 'adora',    label: 'Adora',    year: '2025', type: 'Web app — session replays & signals', image: '/projects/adora.png'    },
];


interface Props {
  onClose: () => void;
}

export default function MapoStudioWindow({ onClose }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const [pos, setPos] = useState(() => ({
    x: Math.max(0, (window.innerWidth - 780) / 2),
    y: Math.max(0, (window.innerHeight - 520) / 2),
  }));
  const dragRef = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);

  const project = PROJECTS[activeTab];

  const onTitleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      setPos({
        x: dragRef.current.px + (ev.clientX - dragRef.current.mx),
        y: dragRef.current.py + (ev.clientY - dragRef.current.my),
      });
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div style={{
      position: 'fixed',
      left: pos.x,
      top: pos.y,
      width: 780,
      height: 520,
      zIndex: 400,
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 4,
      overflow: 'hidden',
      boxShadow: '0 32px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
      userSelect: 'none',
    }}>
      {/* Title bar */}
      <div
        onMouseDown={onTitleMouseDown}
        style={{
          height: 44,
          background: 'rgba(255,255,255,0.45)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderBottom: '1px solid rgba(255,255,255,0.3)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 8,
          cursor: 'grab',
          flexShrink: 0,
        }}
      >
        {/* Traffic lights */}
        <button onClick={onClose} style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F57', border: 'none', cursor: 'pointer', flexShrink: 0 }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FEBC2E', flexShrink: 0 }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28C840', flexShrink: 0 }} />

        <div style={{
          flex: 1,
          textAlign: 'center',
          fontFamily: 'ui-monospace, Menlo, monospace',
          fontSize: '0.65rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#1A2800',
          opacity: 0.6,
        }}>
          Mapo Studio — {project.label}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left sidebar — Arc-style tabs */}
        <div style={{
          width: 200,
          background: 'rgba(26,40,0,0.45)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 10px',
          gap: 4,
          flexShrink: 0,
          overflowY: 'auto',
        }}>
          <div style={{
            fontFamily: 'ui-monospace, Menlo, monospace',
            fontSize: '0.55rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#ffffff',
            opacity: 1,
            padding: '4px 8px 10px',
          }}>
            Projects
          </div>

          {PROJECTS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setActiveTab(i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '9px 10px',
                background: activeTab === i ? 'rgba(212,250,112,0.1)' : 'transparent',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s ease',
                width: '100%',
              }}
            >
              <div>
                <div style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", Helvetica, sans-serif',
                  fontSize: '0.78rem',
                  fontWeight: activeTab === i ? 500 : 400,
                  color: activeTab === i ? '#D4FA70' : 'rgba(212,250,112,0.5)',
                  lineHeight: 1.2,
                  transition: 'color 0.15s ease',
                }}>
                  {p.label}
                </div>
                <div style={{
                  fontFamily: 'ui-monospace, Menlo, monospace',
                  fontSize: '0.55rem',
                  color: activeTab === i ? '#ffffff' : 'rgba(255,255,255,0.4)',
                  marginTop: 2,
                }}>
                  {p.year}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Main content — blurred design */}
        <div style={{ flex: 1, position: 'relative', background: '#1a1a1a', overflow: 'hidden' }}>

          {/* Project image, blurred */}
          <div style={{ position: 'absolute', inset: 0, filter: 'blur(8px)', transform: 'scale(1.06)', overflow: 'hidden' }}>
            <img
              src={project.image}
              alt={project.label}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>

          {/* Confidential label + unlock — top right */}
          <div style={{
            position: 'absolute',
            top: 14,
            right: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 8,
          }}>
            <div style={{
              fontFamily: 'ui-monospace, Menlo, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.75)',
              textAlign: 'right',
              lineHeight: 1.7,
              pointerEvents: 'none',
            }}>
              these pixels are<br />super duper confidential
            </div>
            <button
              onClick={() => window.open('https://calendly.com/mapo-design/30min?month=2026-03', '_blank')}
              style={{
                padding: '6px 14px',
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 4,
                fontFamily: 'ui-monospace, Menlo, monospace',
                fontSize: '0.6rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.75)',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
              }}
            >
              Unlock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
