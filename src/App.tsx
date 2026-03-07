import { useState, useCallback } from 'react';
import ShaderBackground from './components/ShaderBackground';
import MoodboardCard, { type Project } from './components/MoodboardCard';
import ChatInterface from './components/ChatInterface';

const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'NOVA Brand System',
    category: 'Identity',
    year: '2024',
    description: 'Complete visual identity for a biotech startup. Everything from mark to motion.',
    tags: ['branding', 'motion', 'type'],
    color: '#D4FA70',
    size: 'lg',
  },
  {
    id: '2',
    title: 'Liminal Space',
    category: 'Editorial',
    year: '2024',
    description: 'Experimental magazine exploring in-between states. 80 pages.',
    tags: ['print', 'editorial'],
    color: '#B4E641',
    size: 'md',
  },
  {
    id: '3',
    title: 'Tide Digital',
    category: 'Web',
    year: '2023',
    description: 'Interaction design for a climate data platform.',
    tags: ['UI', 'data viz'],
    color: '#8AC900',
    size: 'sm',
  },
  {
    id: '4',
    title: 'Oblique Type',
    category: 'Type Design',
    year: '2023',
    description: 'A variable typeface exploring weight and rhythm in language.',
    tags: ['type', 'variable'],
    color: '#D4FA70',
    size: 'md',
  },
  {
    id: '5',
    title: 'Fragments',
    category: 'Art Direction',
    year: '2024',
    description: 'Campaign for a fashion label. Shooting, direction, retouching.',
    tags: ['photo', 'campaign'],
    color: '#B4E641',
    size: 'sm',
  },
  {
    id: '6',
    title: 'System / Memory',
    category: 'Installation',
    year: '2022',
    description: 'Interactive data art installation. 3,000 visitors.',
    tags: ['code', 'art', 'data'],
    color: '#5A8A00',
    size: 'lg',
  },
];

const INITIAL_POSITIONS = [
  { x: 60,  y: 80,  rot: -3 },
  { x: 300, y: 160, rot: 2.5 },
  { x: 80,  y: 340, rot: 1.5 },
  { x: 420, y: 80,  rot: -1.5 },
  { x: 240, y: 420, rot: 3 },
  { x: 520, y: 300, rot: -2 },
];

export default function App() {
  const [zIndexMap, setZIndexMap] = useState<Record<string, number>>(
    Object.fromEntries(PROJECTS.map((p, i) => [p.id, i + 1]))
  );
  const [maxZ, setMaxZ] = useState(PROJECTS.length);
  const [shaderActive, setShaderActive] = useState(false);

  const bringToFront = useCallback((id: string) => {
    setMaxZ(prev => {
      const next = prev + 1;
      setZIndexMap(m => ({ ...m, [id]: next }));
      return next;
    });
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#fff' }}>
      <ShaderBackground isActive={shaderActive} />

      {PROJECTS.map((project, i) => (
        <MoodboardCard
          key={project.id}
          project={project}
          initialX={INITIAL_POSITIONS[i].x}
          initialY={INITIAL_POSITIONS[i].y}
          rotation={INITIAL_POSITIONS[i].rot}
          zIndex={zIndexMap[project.id]}
          onBringToFront={bringToFront}
        />
      ))}

      <div style={{
        position: 'fixed',
        top: 24,
        left: 24,
        zIndex: 50,
        fontFamily: 'ui-monospace, Menlo, monospace',
        fontSize: '0.6rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#4A7000',
        opacity: 0.5,
        pointerEvents: 'none',
      }}>
        DRAG TO EXPLORE →
      </div>

      <ChatInterface onTyping={setShaderActive} />
    </div>
  );
}
