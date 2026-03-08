import { useState, useEffect, useRef, useCallback } from 'react';

const ERASER_W = 64;
const ERASER_H = 30;
const ERASE_THRESHOLD = 12; // strokes before card fully disappears

const TESTIMONIALS = [
  { id: 1, text: "Audrey has this rare ability to make the unexpected feel completely inevitable.", author: "Sara M.", role: "Creative Director" },
  { id: 2, text: "Working with her changed how I think about design entirely.", author: "James K.", role: "Founder, Tide" },
  { id: 3, text: "She delivered something I didn't even know I needed.", author: "Priya L.", role: "Brand Lead" },
  { id: 4, text: "The most thoughtful creative I've worked with. Full stop.", author: "Tom R.", role: "CEO" },
  { id: 5, text: "Audrey's work doesn't just look good — it means something.", author: "Cleo B.", role: "Art Director" },
  { id: 6, text: "She gets it before you've finished explaining it.", author: "Finn O.", role: "Product Designer" },
  { id: 7, text: "Genuinely one of a kind. I keep coming back.", author: "Nadia V.", role: "Marketing Director" },
  { id: 8, text: "Every deliverable was a surprise in the best possible way.", author: "Ryu T.", role: "Creative Producer" },
  { id: 9, text: "She brought rigour AND weirdness. That combo is so rare.", author: "Eloise C.", role: "Editor" },
  { id: 10, text: "Fast, fun to work with, and the output was stunning.", author: "Marcus H.", role: "Startup Founder" },
  { id: 11, text: "Audrey turned a vague brief into a whole world.", author: "Yuki N.", role: "Creative Strategist" },
  { id: 12, text: "The identity she built for us has outlasted every trend.", author: "Diana F.", role: "Brand Manager" },
  { id: 13, text: "She cares more about your project than you do, somehow.", author: "Leo S.", role: "Director" },
  { id: 14, text: "I've never seen someone move so fast without losing quality.", author: "Ana P.", role: "Head of Design" },
  { id: 15, text: "Working with Audrey felt like a collaboration with the future.", author: "Kai W.", role: "Creative Technologist" },
];

const CARD_LAYOUT = [
  { x: 1,  y: 3,  rot: -14, w: 290 },
  { x: 55, y: 1,  rot: 0,   w: 310 },
  { x: 28, y: 15, rot: -3,  w: 280 },
  { x: 72, y: 8,  rot: 17,  w: 270 },
  { x: 10, y: 42, rot: 0,   w: 320 },
  { x: 42, y: 38, rot: -19, w: 295 },
  { x: 78, y: 33, rot: 1,   w: 285 },
  { x: 62, y: 55, rot: -9,  w: 310 },
  { x: 5,  y: 68, rot: 16,  w: 275 },
  { x: 33, y: 62, rot: 0,   w: 300 },
  { x: 70, y: 70, rot: 12,  w: 290 },
  { x: 18, y: 22, rot: -21, w: 265 },
  { x: 85, y: 52, rot: -1,  w: 270 },
  { x: 48, y: 72, rot: 9,   w: 305 },
  { x: 22, y: 50, rot: 22,  w: 280 },
];

const NOTE_COLORS = [
  '#FFFDE7', '#F1F8E9', '#FFFFFF', '#F9FBE7', '#FFFDE7',
];

// Build an inline SVG data URL for the mask.
// White = visible, black ellipses = erased holes.
function buildMask(w: number, strokes: { x: number; y: number }[]) {
  const h = 400; // tall enough for any card
  const rx = ERASER_W / 2;
  const ry = ERASER_H / 2;
  const holes = strokes
    .map(s => `<ellipse cx="${Math.round(s.x)}" cy="${Math.round(s.y)}" rx="${rx}" ry="${ry}"/>`)
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="white"/><g fill="black">${holes}</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

interface Props {
  onClose: () => void;
}

type Stroke = { x: number; y: number };

export default function TestimonialsExplosion({ onClose }: Props) {
  const [visible, setVisible] = useState(false);
  const [erased, setErased] = useState<Set<number>>(new Set());
  const [eraserMode, setEraserMode] = useState(false);
  const [eraserPos, setEraserPos] = useState({ x: -200, y: -200 });
  const [positions, setPositions] = useState(CARD_LAYOUT.map(p => ({ x: p.x, y: p.y })));
  // strokes per card in card-local space
  const [strokes, setStrokes] = useState<Stroke[][]>(() => CARD_LAYOUT.map(() => []));

  const isErasing = useRef(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardDrag = useRef<{ idx: number; mx: number; my: number; px: number; py: number } | null>(null);
  const lastStrokePos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (erased.size === TESTIMONIALS.length) setTimeout(onClose, 400);
  }, [erased, onClose]);

  const applyErase = useCallback((mouseX: number, mouseY: number) => {
    // Throttle: skip if barely moved
    if (lastStrokePos.current) {
      const dx = mouseX - lastStrokePos.current.x;
      const dy = mouseY - lastStrokePos.current.y;
      if (dx * dx + dy * dy < 100) return; // < 10px
    }
    lastStrokePos.current = { x: mouseX, y: mouseY };

    const newStrokes: Stroke[][] = [];
    let anyChange = false;

    strokes.forEach((cardStrokes, i) => {
      if (erased.has(i)) {
        newStrokes.push(cardStrokes);
        return;
      }
      const el = cardRefs.current[i];
      if (!el) {
        newStrokes.push(cardStrokes);
        return;
      }

      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      // Broad-phase cull
      if (
        Math.abs(mouseX - cx) > rect.width / 2 + ERASER_W ||
        Math.abs(mouseY - cy) > rect.height / 2 + ERASER_H
      ) {
        newStrokes.push(cardStrokes);
        return;
      }

      // Transform mouse into card-local space (undo CSS rotation)
      const rot = -(CARD_LAYOUT[i].rot * Math.PI) / 180;
      const dx = mouseX - cx;
      const dy = mouseY - cy;
      const localX = dx * Math.cos(rot) - dy * Math.sin(rot) + rect.width / 2;
      const localY = dx * Math.sin(rot) + dy * Math.cos(rot) + rect.height / 2;

      const updated = [...cardStrokes, { x: localX, y: localY }];
      newStrokes.push(updated);
      anyChange = true;

      if (updated.length >= ERASE_THRESHOLD) {
        setErased(prev => new Set([...prev, i]));
      }
    });

    if (anyChange) setStrokes(newStrokes);
  }, [strokes, erased]);

  useEffect(() => {
    if (!eraserMode) return;

    const onMove = (e: MouseEvent) => {
      setEraserPos({ x: e.clientX, y: e.clientY });
      if (isErasing.current) applyErase(e.clientX, e.clientY);
    };
    const onDown = (e: MouseEvent) => {
      isErasing.current = true;
      lastStrokePos.current = null;
      applyErase(e.clientX, e.clientY);
    };
    const onUp = () => {
      isErasing.current = false;
      lastStrokePos.current = null;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
    };
  }, [eraserMode, applyErase]);

  const onCardMouseDown = useCallback((e: React.MouseEvent, idx: number) => {
    if (eraserMode) return;
    e.stopPropagation();
    cardDrag.current = { idx, mx: e.clientX, my: e.clientY, px: positions[idx].x, py: positions[idx].y };
    const onMove = (ev: MouseEvent) => {
      if (!cardDrag.current) return;
      const dx = ((ev.clientX - cardDrag.current.mx) / window.innerWidth) * 100;
      const dy = ((ev.clientY - cardDrag.current.my) / window.innerHeight) * 100;
      setPositions(prev => prev.map((p, i) =>
        i === cardDrag.current!.idx ? { x: cardDrag.current!.px + dx, y: cardDrag.current!.py + dy } : p
      ));
    };
    const onUp = () => {
      cardDrag.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [eraserMode, positions]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, cursor: eraserMode ? 'none' : 'default' }}>
      {/* Backdrop */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(255,255,255,0.4)',
        backdropFilter: 'blur(1px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }} />

      {/* Cards */}
      {TESTIMONIALS.map((t, i) => {
        const layout = CARD_LAYOUT[i];
        const bg = NOTE_COLORS[i % NOTE_COLORS.length];
        const isErased = erased.has(i);
        const cardStrokes = strokes[i];
        const maskImage = cardStrokes.length > 0 ? buildMask(layout.w, cardStrokes) : undefined;

        return (
          <div
            key={t.id}
            ref={el => { cardRefs.current[i] = el; }}
            onMouseDown={(e) => onCardMouseDown(e, i)}
            style={{
              position: 'absolute',
              left: `${positions[i].x}%`,
              top: `${positions[i].y}%`,
              width: layout.w,
              zIndex: 210 + i,
              transform: `rotate(${layout.rot}deg) scale(${isErased ? 0.85 : visible ? 1 : 0.1})`,
              opacity: isErased ? 0 : visible ? 1 : 0,
              transition: isErased
                ? 'opacity 0.3s ease, transform 0.3s ease'
                : `transform 0.55s cubic-bezier(0.16, 1, 0.3, 1) ${i * 30}ms, opacity 0.3s ease ${i * 30}ms`,
              pointerEvents: isErased ? 'none' : 'auto',
              userSelect: 'none',
              cursor: eraserMode ? 'none' : 'grab',
              // Apply SVG mask
              WebkitMaskImage: maskImage,
              maskImage: maskImage,
              WebkitMaskSize: '100% 100%',
              maskSize: '100% 100%',
            } as React.CSSProperties}
          >
            <div style={{
              background: bg,
              border: '1px solid rgba(90,138,0,0.12)',
              borderRadius: 3,
              padding: '18px 18px 14px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.1), 0 1px 6px rgba(0,0,0,0.06)',
            }}>
              <p style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", Helvetica, sans-serif',
                fontSize: '0.9rem',
                fontWeight: 300,
                color: '#1A2800',
                lineHeight: 1.55,
                marginBottom: 12,
              }}>
                "{t.text}"
              </p>
              <div style={{
                fontFamily: 'ui-monospace, Menlo, monospace',
                fontSize: '0.6rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#5A8A00',
              }}>
                {t.author} · {t.role}
              </div>
            </div>
          </div>
        );
      })}

      {/* Toolbar */}
      <div style={{
        position: 'fixed', bottom: 36, left: '50%', transform: 'translateX(-50%)',
        zIndex: 300, opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease 0.5s',
      }}>
        <button
          onClick={() => setEraserMode(e => !e)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px',
            background: eraserMode ? '#D4FA70' : 'rgba(255,255,255,0.85)',
            border: `1.5px solid ${eraserMode ? '#5A8A00' : 'rgba(90,138,0,0.3)'}`,
            borderRadius: 4, backdropFilter: 'blur(12px)', cursor: 'pointer',
            fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '0.65rem',
            letterSpacing: '0.07em', textTransform: 'uppercase', color: '#5A8A00',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)', transition: 'all 0.2s ease',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5A8A00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 20H7L3 16l11-11 6 6-3.5 3.5"/><path d="M6.5 17.5l4-4"/>
          </svg>
          {eraserMode ? 'Erasing...' : 'Eraser'}
        </button>
      </div>

      {/* Eraser cursor */}
      {eraserMode && (
        <div style={{
          position: 'fixed',
          left: eraserPos.x - ERASER_W / 2,
          top: eraserPos.y - ERASER_H / 2,
          width: ERASER_W, height: ERASER_H,
          background: '#F8BBD0',
          border: '1.5px solid #E91E63',
          borderRadius: 4,
          pointerEvents: 'none', zIndex: 9999,
          boxShadow: '0 2px 8px rgba(233,30,99,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ width: '70%', height: '35%', background: 'rgba(255,255,255,0.5)', borderRadius: 2 }} />
        </div>
      )}
    </div>
  );
}
