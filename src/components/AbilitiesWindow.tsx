import { useEffect, useRef, useState, useCallback } from 'react';

// ─── Pixel sprite ─────────────────────────────────────────────────────────────
const S = { _: 0, s: 1, h: 2, t: 3, p: 4, b: 5 };
const FRAMES_RIGHT: number[][][] = [
  [
    [0,0,S.h,S.h,S.h,S.h,0,0],
    [0,S.h,S.h,S.h,S.h,S.h,S.h,0],
    [0,S.s,S.s,S.s,S.s,S.s,S.s,0],
    [0,S.s,S.s,S.s,S.s,S.s,S.s,0],
    [0,S.t,S.t,S.t,S.t,S.t,S.t,0],
    [S.t,S.t,S.t,S.t,S.t,S.t,S.t,S.t],
    [S.t,S.t,S.t,S.t,S.t,S.t,S.t,S.t],
    [0,S.t,S.t,S.t,S.t,S.t,S.t,0],
    [0,S.p,S.p,0,0,S.p,S.p,0],
    [0,S.p,S.p,0,0,S.p,S.p,0],
    [0,S.p,S.p,0,0,S.p,S.p,0],
    [0,S.b,S.b,0,0,S.b,S.b,0],
  ],
  [
    [0,0,S.h,S.h,S.h,S.h,0,0],
    [0,S.h,S.h,S.h,S.h,S.h,S.h,0],
    [0,S.s,S.s,S.s,S.s,S.s,S.s,0],
    [0,S.s,S.s,S.s,S.s,S.s,S.s,0],
    [0,S.t,S.t,S.t,S.t,S.t,S.t,0],
    [S.t,S.t,S.t,S.t,S.t,S.t,S.t,S.t],
    [S.t,S.t,S.t,S.t,S.t,S.t,S.t,S.t],
    [0,S.t,S.t,S.t,S.t,S.t,S.t,0],
    [0,S.p,0,S.p,S.p,0,S.p,0],
    [0,0,S.p,S.p,S.p,S.p,0,0],
    [0,S.p,S.p,0,0,S.p,S.p,0],
    [S.b,S.b,0,0,0,0,S.b,S.b],
  ],
];
const FRAMES_LEFT = FRAMES_RIGHT.map(f => f.map(row => [...row].reverse()));
const COLORS: Record<number, string> = {
  0: 'transparent', 1: '#FBBF8A', 2: '#1A2800', 3: '#5A8A00', 4: '#2D4400', 5: '#1A2800',
};
const SCALE = 3;
const SW = 8 * SCALE;
const SH = 12 * SCALE;

function drawSprite(ctx: CanvasRenderingContext2D, frame: number[][], x: number, y: number) {
  frame.forEach((row, ry) =>
    row.forEach((col, rx) => {
      if (!col) return;
      ctx.fillStyle = COLORS[col];
      ctx.fillRect(x + rx * SCALE, y + ry * SCALE, SCALE, SCALE);
    })
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────
const NAV_H    = 44;
const WIN_W    = 720;
const WIN_H    = 460;
const BODY_H   = WIN_H - NAV_H;               // 416
const FLOOR_Y  = Math.round(BODY_H * 0.70);   // 291 — floor surface (screen Y, fixed)
const GRAVITY  = 0.55;
const JUMP_V   = -13;
const PILL_H   = 26;
const CAM_FRAC = 0.38; // character rests at 38% from left

// ─── Content pills ────────────────────────────────────────────────────────────
const PILL_CONTENT = [
  { text: 'unstoppable project starter',                  w: 232 },
  { text: 'brings awkward to big groups',                 w: 224 },
  { text: '$51K design contract dealer',                  w: 216 },
  { text: 'avg 9h 32m instagram a week',                  w: 216 },
  { text: 'ranked platinum in polytopia 51% of the year', w: 336 },
  { text: '17 figma tabs open rn',                        w: 176 },
  { text: 'vibe code addict',                             w: 144 },
  { text: 'matcha deleter',                               w: 128 },
  { text: 'amateur potter',                               w: 128 },
];

type Plat = { wx: number; wy: number; w: number; text?: string };

let _pid = 0; // simple unique key (only used for TS, not React keys since canvas)

function makePlats(fromX: number, dir: 1 | -1, count: number): Plat[] {
  const out: Plat[] = [];
  let x = fromX;
  for (let i = 0; i < count; i++) {
    _pid++;
    const w = 90 + Math.floor(Math.random() * 100);
    x += dir * (170 + Math.floor(Math.random() * 120));
    const wy = FLOOR_Y - 65 - Math.floor(Math.random() * 75); // 65–140px above floor
    out.push({ wx: dir === 1 ? x : x - w, wy, w });
  }
  return out;
}

function roundPill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,     x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x,     y + h, r);
  ctx.arcTo(x,     y + h, x,     y,     r);
  ctx.arcTo(x,     y,     x + w, y,     r);
  ctx.closePath();
}

// ─── Component ────────────────────────────────────────────────────────────────
interface Props { onClose: () => void; }

export default function AbilitiesWindow({ onClose }: Props) {
  const [pos, setPos] = useState(() => ({
    x: Math.max(0, (window.innerWidth  - WIN_W) / 2),
    y: Math.max(0, (window.innerHeight - WIN_H) / 2),
  }));

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const charRef   = useRef({
    wx: 0, wy: FLOOR_Y - SH,
    vy: 0, grounded: true,
    facing: 'right' as 'left' | 'right',
    frame: 0, frameTimer: 0, moving: false,
  });
  // camX = world X at left edge of canvas
  const camXRef  = useRef(-(CAM_FRAC * WIN_W));
  const dprRef   = useRef(1);
  const platsRef = useRef<Plat[]>([]);
  const keysRef  = useRef({ left: false, right: false });
  const rafRef   = useRef(0);
  const dragRef  = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);
  const hPRef    = useRef(0); // T horizontal progress
  const vPRef    = useRef(0); // T vertical progress

  // ── Init platforms ──────────────────────────────────────────────────────────
  useEffect(() => {
    // 9 content platforms to the right at set world X positions
    const contentXs  = [300,  620,  980, 1320, 1680, 2020, 2340, 2660, 2960];
    const contentYs  = [
      FLOOR_Y - 80,
      FLOOR_Y - 115,
      FLOOR_Y - 65,
      FLOOR_Y - 130,
      FLOOR_Y - 90,
      FLOOR_Y - 110,
      FLOOR_Y - 70,
      FLOOR_Y - 120,
      FLOOR_Y - 85,
    ];
    const content: Plat[] = PILL_CONTENT.map((c, i) => ({
      wx: contentXs[i], wy: contentYs[i], w: c.w, text: c.text,
    }));
    // Extra platforms beyond the content + some to the left
    const right = makePlats(3200, 1, 20);
    const left  = makePlats(-80, -1, 10);
    platsRef.current = [...content, ...right, ...left];
  }, []);

  // ── T bar animation ─────────────────────────────────────────────────────────
  useEffect(() => {
    const animate = (ref: React.MutableRefObject<number>, dur: number) => {
      const start = Date.now();
      const tick = () => {
        ref.current = Math.min((Date.now() - start) / dur, 1);
        if (ref.current < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    animate(hPRef, 500);
    const t = setTimeout(() => animate(vPRef, 400), 500);
    return () => clearTimeout(t);
  }, []);

  // ── Drag window ─────────────────────────────────────────────────────────────
  const onTitleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      setPos({ x: dragRef.current.px + ev.clientX - dragRef.current.mx, y: dragRef.current.py + ev.clientY - dragRef.current.my });
    };
    const onUp = () => { dragRef.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // ── Keyboard ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  { keysRef.current.left  = true; e.preventDefault(); }
      if (e.key === 'ArrowRight') { keysRef.current.right = true; e.preventDefault(); }
      if ((e.key === 'ArrowUp' || e.key === ' ') && charRef.current.grounded) {
        charRef.current.vy = JUMP_V;
        charRef.current.grounded = false;
        e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  keysRef.current.left  = false;
      if (e.key === 'ArrowRight') keysRef.current.right = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  // ── Game loop ────────────────────────────────────────────────────────────────
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) { rafRef.current = requestAnimationFrame(gameLoop); return; }
    const ctx = canvas.getContext('2d')!;
    const W   = WIN_W;
    const H   = BODY_H;
    // Restore DPR transform (canvas state resets on resize, so re-apply each frame)
    const dpr = dprRef.current;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const char = charRef.current;
    const keys = keysRef.current;

    // ── Movement ──
    char.moving = false;
    if (keys.left)  { char.wx -= 3; char.facing = 'left';  char.moving = true; }
    if (keys.right) { char.wx += 3; char.facing = 'right'; char.moving = true; }

    // ── Physics ──
    char.grounded = false;
    char.vy += GRAVITY;
    char.wy += char.vy;

    // Floor
    if (char.wy + SH >= FLOOR_Y && char.vy >= 0) {
      char.wy = FLOOR_Y - SH; char.vy = 0; char.grounded = true;
    }

    // Platforms
    if (!char.grounded) {
      for (const p of platsRef.current) {
        if (char.vy >= 0 &&
            char.wy + SH >= p.wy &&
            char.wy + SH <= p.wy + PILL_H &&
            char.wx + SW > p.wx + 4 &&
            char.wx < p.wx + p.w - 4) {
          char.wy = p.wy - SH; char.vy = 0; char.grounded = true;
          break;
        }
      }
    }

    // ── Camera ──
    const camX = char.wx - CAM_FRAC * W;
    camXRef.current = camX;

    // ── Generate / cull platforms ──
    const plats = platsRef.current;
    if (plats.length) {
      const rightmost = Math.max(...plats.map(p => p.wx + p.w));
      if (rightmost < camX + W * 3) {
        platsRef.current = [...plats, ...makePlats(rightmost, 1, 10)];
      }
      const leftmost = Math.min(...plats.map(p => p.wx));
      if (leftmost > camX - W * 3) {
        platsRef.current = [...platsRef.current, ...makePlats(leftmost, -1, 10)];
      }
    }
    platsRef.current = platsRef.current.filter(p =>
      p.wx + p.w > camX - W * 4 && p.wx < camX + W * 5
    );

    // ── Walk animation ──
    if (char.moving && char.grounded) {
      if (++char.frameTimer >= 8) { char.frame = (char.frame + 1) % 2; char.frameTimer = 0; }
    } else { char.frame = 0; char.frameTimer = 0; }

    // ── Render ──────────────────────────────────────────────────────────────
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = '#1A2800';
    ctx.lineWidth   = 1;

    // T horizontal bar = floor (full width, fades in with hProgress)
    const hp = hPRef.current;
    if (hp > 0) {
      ctx.globalAlpha = hp;
      ctx.beginPath(); ctx.moveTo(0, FLOOR_Y); ctx.lineTo(W, FLOOR_Y); ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // T vertical stem — fixed at screen center, drops below floor
    const vp = vPRef.current;
    if (vp > 0) {
      ctx.beginPath();
      ctx.moveTo(W / 2, FLOOR_Y);
      ctx.lineTo(W / 2, FLOOR_Y + vp * H * 0.22);
      ctx.stroke();
    }

    // Platforms
    ctx.font         = '500 10px ui-monospace, Menlo, monospace';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    for (const p of platsRef.current) {
      const sx = p.wx - camX;
      if (sx + p.w < -5 || sx > W + 5) continue;
      ctx.fillStyle = '#1A2800';
      roundPill(ctx, sx, p.wy, p.w, PILL_H);
      ctx.fill();
      if (p.text) {
        ctx.fillStyle = '#D4FA70';
        ctx.fillText(p.text.toUpperCase(), sx + p.w / 2, p.wy + PILL_H / 2);
      }
    }

    // Character
    drawSprite(ctx, (char.facing === 'right' ? FRAMES_RIGHT : FRAMES_LEFT)[char.frame], char.wx - camX, char.wy);

    rafRef.current = requestAnimationFrame(gameLoop);
  }, []);

  // ── Canvas setup ──────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dpr = window.devicePixelRatio || 1;
      dprRef.current = dpr;
      canvas.width  = WIN_W  * dpr;
      canvas.height = BODY_H * dpr;
      canvas.style.width  = WIN_W  + 'px';
      canvas.style.height = BODY_H + 'px';
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
    }
    rafRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [gameLoop]);

  return (
    <div style={{
      position: 'fixed', left: pos.x, top: pos.y,
      width: WIN_W, height: WIN_H, zIndex: 400,
      display: 'flex', flexDirection: 'column',
      borderRadius: 4, overflow: 'hidden',
      boxShadow: '0 32px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
      userSelect: 'none',
    }}>

      {/* Title bar */}
      <div onMouseDown={onTitleMouseDown} style={{
        height: NAV_H, flexShrink: 0,
        background: 'rgba(255,255,255,0.45)',
        backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
        borderBottom: '1px solid rgba(255,255,255,0.3)',
        display: 'flex', alignItems: 'center',
        padding: '0 16px', gap: 8, cursor: 'grab',
      }}>
        <button onClick={onClose} style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F57', border: 'none', cursor: 'pointer', flexShrink: 0 }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FEBC2E', flexShrink: 0 }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28C840', flexShrink: 0 }} />
        <div style={{
          flex: 1, textAlign: 'center',
          fontFamily: 'ui-monospace, Menlo, monospace',
          fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase',
          color: '#1A2800', opacity: 0.6,
        }}>
          the most generalist person you'll ever meet
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, position: 'relative', background: '#ffffff', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, imageRendering: 'pixelated', pointerEvents: 'none' }}
        />
        <div style={{
          position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
          fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '0.5rem',
          letterSpacing: '0.07em', textTransform: 'uppercase',
          color: '#1A2800', opacity: 0.2, whiteSpace: 'nowrap', pointerEvents: 'none',
        }}>
          ← → walk · ↑ space jump
        </div>
      </div>
    </div>
  );
}
