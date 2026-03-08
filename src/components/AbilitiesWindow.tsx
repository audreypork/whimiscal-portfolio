import { useState, useEffect } from 'react';

const LINES = [
  { delay: 0,    content: 'horizontal' },
  { delay: 400,  content: 'vertical' },
  { delay: 900,  content: 'label',   text: 'the most generalist person you\'ll know' },
  { delay: 1400, content: 'spacer' },
  { delay: 1600, content: 'sublabel', text: 'product designer for complex b2b ai saas' },
  { delay: 2000, content: 'spacer' },
  { delay: 2200, content: 'spacer' },
  { delay: 2400, content: 'heading',  text: 'abilities unlocked' },
  { delay: 2700, content: 'spacer' },
  { delay: 2900, content: 'item',     text: 'loves starting new things' },
  { delay: 3100, content: 'item',     text: 'seller of design contracts ($51k a pop)' },
  { delay: 3300, content: 'item',     text: 'very awkward in big groups' },
  { delay: 3500, content: 'item',     text: 'avg 9 hrs 32 mins instagram a week' },
  { delay: 3700, content: 'item',     text: 'ranked platinum in polytopia 51% of the year' },
];

interface Props {
  onClose: () => void;
}

export default function AbilitiesWindow({ onClose }: Props) {
  const [visible, setVisible] = useState<boolean[]>(new Array(LINES.length).fill(false));
  const [hLineWidth, setHLineWidth] = useState(0);
  const [vLineHeight, setVLineHeight] = useState(0);

  useEffect(() => {
    // Animate horizontal line first
    const hTimer = setTimeout(() => {
      const start = Date.now();
      const duration = 350;
      const tick = () => {
        const p = Math.min((Date.now() - start) / duration, 1);
        setHLineWidth(p * 100);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, 0);

    // Then vertical line
    const vTimer = setTimeout(() => {
      const start = Date.now();
      const duration = 300;
      const tick = () => {
        const p = Math.min((Date.now() - start) / duration, 1);
        setVLineHeight(p * 100);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, 400);

    // Then each line of text
    const timers = LINES.map((line, i) =>
      setTimeout(() => {
        setVisible(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, line.delay)
    );

    return () => {
      clearTimeout(hTimer);
      clearTimeout(vTimer);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 400,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 560,
          fontFamily: 'ui-monospace, Menlo, monospace',
          cursor: 'default',
        }}
      >
        {/* T graphic */}
        <div style={{ position: 'relative', height: 80, marginBottom: 8 }}>
          {/* Horizontal line */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${hLineWidth}%`,
            height: 1,
            background: '#1A2800',
            transformOrigin: 'left center',
          }} />

          {/* Vertical line dropping from center */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            width: 1,
            height: `${vLineHeight}%`,
            background: '#1A2800',
          }} />
        </div>

        {/* Text content */}
        <div style={{ paddingLeft: '50%', transform: 'translateX(-1px)' }}>
          {LINES.map((line, i) => {
            if (line.content === 'horizontal' || line.content === 'vertical') return null;

            return (
              <div
                key={i}
                style={{
                  opacity: visible[i] ? 1 : 0,
                  transform: visible[i] ? 'translateY(0)' : 'translateY(4px)',
                  transition: 'opacity 0.35s ease, transform 0.35s ease',
                  lineHeight: line.content === 'spacer' ? '0.8rem' : '1.6',
                }}
              >
                {line.content === 'spacer' && <span>&nbsp;</span>}

                {line.content === 'label' && (
                  <span style={{
                    fontSize: '0.65rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#1A2800',
                    opacity: 0.4,
                  }}>
                    {line.text}
                  </span>
                )}

                {line.content === 'sublabel' && (
                  <span style={{
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: '#1A2800',
                    letterSpacing: '-0.01em',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Helvetica, sans-serif',
                  }}>
                    {line.text}
                  </span>
                )}

                {line.content === 'heading' && (
                  <span style={{
                    fontSize: '0.6rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#5A8A00',
                  }}>
                    {line.text}
                  </span>
                )}

                {line.content === 'item' && (
                  <span style={{
                    fontSize: '0.78rem',
                    color: '#1A2800',
                    opacity: 0.75,
                    display: 'flex',
                    gap: 10,
                    alignItems: 'baseline',
                  }}>
                    <span style={{ color: '#5A8A00', flexShrink: 0 }}>•</span>
                    {line.text}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Close hint */}
        <div style={{
          marginTop: 48,
          paddingLeft: '50%',
          fontSize: '0.55rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#1A2800',
          opacity: visible[visible.length - 1] ? 0.3 : 0,
          transition: 'opacity 0.5s ease 0.3s',
        }}>
          click anywhere to close
        </div>
      </div>
    </div>
  );
}
