import { useState, useCallback } from 'react';
import ShaderBackground from './components/ShaderBackground';
import DesktopIcon, { type IconConfig } from './components/DesktopIcon';
import TestimonialsExplosion from './components/TestimonialsExplosion';
import MapoStudioWindow from './components/MapoStudioWindow';
import AbilitiesWindow from './components/AbilitiesWindow';

const ICONS: IconConfig[] = [
  {
    id: 'mapo',
    label: 'Mapo Studio',
    initialX: 60,
    initialY: 80,
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="6" y="6" width="20" height="20" rx="3" stroke="#5A8A00" strokeWidth="1.5"/>
        <path d="M6 16h20M16 6v20" stroke="#5A8A00" strokeWidth="1.5"/>
        <circle cx="16" cy="16" r="3" fill="#D4FA70" stroke="#5A8A00" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    id: 'abilities',
    label: 'Skills',
    initialX: 180,
    initialY: 60,
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M16 4L20 12H28L22 18L24 26L16 21L8 26L10 18L4 12H12L16 4Z" stroke="#5A8A00" strokeWidth="1.5" strokeLinejoin="round" fill="#D4FA70" fillOpacity="0.4"/>
      </svg>
    ),
  },
  {
    id: 'testimonials',
    label: 'Testimonials',
    initialX: 300,
    initialY: 100,
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M4 8C4 6.9 4.9 6 6 6H26C27.1 6 28 6.9 28 8V20C28 21.1 27.1 22 26 22H18L12 27V22H6C4.9 22 4 21.1 4 20V8Z" stroke="#5A8A00" strokeWidth="1.5" strokeLinejoin="round" fill="#D4FA70" fillOpacity="0.3"/>
        <path d="M9 12h6M9 16h10" stroke="#5A8A00" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'chat',
    label: 'Chat',
    initialX: 100,
    initialY: 240,
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="14" r="9" stroke="#5A8A00" strokeWidth="1.5" fill="#D4FA70" fillOpacity="0.3"/>
        <path d="M10 22l-4 5 5-2" stroke="#5A8A00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 13h8M12 17h5" stroke="#5A8A00" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'projects',
    label: 'Projects',
    initialX: 260,
    initialY: 220,
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="10" width="24" height="18" rx="2" stroke="#5A8A00" strokeWidth="1.5" fill="#D4FA70" fillOpacity="0.3"/>
        <path d="M4 14h24" stroke="#5A8A00" strokeWidth="1.5"/>
        <path d="M4 10l5-5h14l5 5" stroke="#5A8A00" strokeWidth="1.5" strokeLinejoin="round"/>
        <rect x="10" y="18" width="12" height="4" rx="1" fill="#5A8A00" fillOpacity="0.3" stroke="#5A8A00" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    id: 'faves',
    label: 'Faves',
    initialX: 420,
    initialY: 160,
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M16 26S6 19 6 12a6 6 0 0112 0 6 6 0 0112 0c0 7-10 14-10 14z" stroke="#5A8A00" strokeWidth="1.5" strokeLinejoin="round" fill="#D4FA70" fillOpacity="0.4"/>
      </svg>
    ),
  },
];

export default function App() {
  const [zIndexMap, setZIndexMap] = useState<Record<string, number>>(
    Object.fromEntries(ICONS.map((ic, i) => [ic.id, i + 1]))
  );
  const [maxZ, setMaxZ] = useState(ICONS.length);
  const [openWindow, setOpenWindow] = useState<string | null>(null);
  void maxZ;

  const bringToFront = useCallback((id: string) => {
    setMaxZ(prev => {
      const next = prev + 1;
      setZIndexMap(m => ({ ...m, [id]: next }));
      return next;
    });
  }, []);

  const handleOpen = useCallback((id: string) => {
    setOpenWindow(id);
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden', background: '#fff' }}>
      <ShaderBackground isActive={false} />

      {/* Menubar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 28,
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(90,138,0,0.12)',
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
      }}>
        <span style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", Helvetica, sans-serif',
          fontSize: '0.72rem',
          fontWeight: 600,
          color: '#1A2800',
          letterSpacing: '-0.01em',
        }}>
          audreycaprianni.com
        </span>
        <span style={{
          fontFamily: 'ui-monospace, Menlo, monospace',
          fontSize: '0.6rem',
          color: '#4A7000',
          opacity: 0.6,
          letterSpacing: '0.05em',
        }}>
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {openWindow === 'testimonials' && (
        <TestimonialsExplosion onClose={() => setOpenWindow(null)} />
      )}

      {openWindow === 'mapo' && (
        <MapoStudioWindow onClose={() => setOpenWindow(null)} />
      )}

      {openWindow === 'abilities' && (
        <AbilitiesWindow onClose={() => setOpenWindow(null)} />
      )}

      {ICONS.map(icon => (
        <DesktopIcon
          key={icon.id}
          config={icon}
          zIndex={zIndexMap[icon.id]}
          onBringToFront={bringToFront}
          onOpen={handleOpen}
        />
      ))}
    </div>
  );
}
