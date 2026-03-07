import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

const RESPONSES: Record<string, string> = {
  default: "I'm Audrey — designer, thinker, occasional chaos-maker. Ask me anything.",
  hello: "Hey. Glad you're here. What would you like to know?",
  work: "I work across brand identity, digital interfaces, and art direction. Each project is an experiment in finding the unexpected.",
  contact: "Best way to reach me: audrey@audreycaprianni.com — or slide into my Instagram DMs if you're feeling chaotic.",
  process: "My process is intuition-led but research-grounded. I start by asking what the work *wants* to be, then I make it.",
  tools: "Figma, After Effects, Cinema 4D, occasional pen and paper. Whatever the idea needs.",
  about: "I'm a multidisciplinary designer based wherever feels right. Currently: thinking too much about visual systems.",
  collab: "Always open to interesting collaborations. Tell me about what you're building.",
  inspiration: "Brutalist architecture, weird nature documentaries, old signage, the color of things at dusk.",
  weird: "Yes, intentionally. Normal is a failure mode.",
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  if (/hi|hello|hey|sup/.test(lower)) return RESPONSES.hello;
  if (/work|project|portfolio/.test(lower)) return RESPONSES.work;
  if (/contact|email|reach|hire/.test(lower)) return RESPONSES.contact;
  if (/process|how|approach/.test(lower)) return RESPONSES.process;
  if (/tool|software|use/.test(lower)) return RESPONSES.tools;
  if (/about|who|you/.test(lower)) return RESPONSES.about;
  if (/collab|together|partner/.test(lower)) return RESPONSES.collab;
  if (/inspir|influence/.test(lower)) return RESPONSES.inspiration;
  if (/weird|strange|odd|unusual/.test(lower)) return RESPONSES.weird;
  return RESPONSES.default;
}

const PROMPTS = [
  'tell me about your work →',
  'what\'s your process? →',
  'open to collabs? →',
  'what inspires you? →',
];

interface ChatInterfaceProps {
  onTyping: (v: boolean) => void;
}

export default function ChatInterface({ onTyping }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      text: "Hi. I'm Audrey's portfolio. You can talk to me.",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text.trim(), timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    onTyping(true);
    setIsTyping(true);

    setTimeout(() => {
      const reply = getResponse(text);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: reply,
        timestamp: Date.now(),
      }]);
      setIsTyping(false);
      onTyping(false);
    }, 800 + Math.random() * 600);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      right: 0,
      width: '100%',
      maxWidth: 420,
      height: '100%',
      maxHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px 12px',
        borderBottom: '1px solid rgba(90, 138, 0, 0.15)',
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{
          fontFamily: 'ui-monospace, Menlo, monospace',
          fontSize: '0.6rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#4A7000',
          opacity: 0.6,
          marginBottom: 4,
        }}>
          AUDREY CAPRIANNI / PORTFOLIO
        </div>
        <div style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Helvetica, sans-serif',
          fontSize: '1.1rem',
          fontWeight: 300,
          color: '#1A2800',
          letterSpacing: '-0.02em',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{
            width: 6,
            height: 6,
            background: '#5A8A00',
            borderRadius: '50%',
            boxShadow: '0 0 8px #5A8A00',
            display: 'inline-block',
            flexShrink: 0,
          }} />
          audreycaprianni.com
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(20px)',
      }}>
        {messages.map(msg => (
          <div key={msg.id} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '82%',
              padding: '10px 14px',
              background: msg.role === 'user'
                ? '#D4FA70'
                : 'rgba(255,255,255,0.9)',
              border: msg.role === 'user'
                ? '1px solid rgba(90,138,0,0.3)'
                : '1px solid rgba(90,138,0,0.15)',
              borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
            }}>
              <div style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Helvetica, sans-serif',
                fontSize: '0.875rem',
                color: '#1A2800',
                lineHeight: 1.5,
                fontWeight: msg.role === 'user' ? 500 : 300,
              }}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '10px 16px',
              background: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(90,138,0,0.15)',
              borderRadius: '12px 12px 12px 2px',
              display: 'flex',
              gap: 4,
              alignItems: 'center',
            }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: 5,
                  height: 5,
                  background: '#5A8A00',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div style={{
        padding: '8px 16px',
        display: 'flex',
        gap: 6,
        overflowX: 'auto',
        background: 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(20px)',
        scrollbarWidth: 'none',
      }}>
        {PROMPTS.map(p => (
          <button
            key={p}
            onClick={() => send(p.replace(' →', ''))}
            style={{
              flexShrink: 0,
              fontFamily: 'ui-monospace, Menlo, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: '#5A8A00',
              background: 'rgba(212, 250, 112, 0.25)',
              border: '1px solid rgba(90, 138, 0, 0.25)',
              borderRadius: 20,
              padding: '5px 10px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              (e.target as HTMLButtonElement).style.background = 'rgba(212, 250, 112, 0.5)';
            }}
            onMouseLeave={e => {
              (e.target as HTMLButtonElement).style.background = 'rgba(212, 250, 112, 0.25)';
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={onSubmit} style={{
        padding: '12px 16px 20px',
        display: 'flex',
        gap: 8,
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(90,138,0,0.1)',
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask me anything..."
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.8)',
            border: '1px solid rgba(90, 138, 0, 0.25)',
            borderRadius: 24,
            padding: '10px 16px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Helvetica, sans-serif',
            fontSize: '0.875rem',
            color: '#1A2800',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => { e.target.style.borderColor = 'rgba(90, 138, 0, 0.6)'; }}
          onBlur={e => { e.target.style.borderColor = 'rgba(90, 138, 0, 0.25)'; }}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: input.trim() ? '#D4FA70' : 'rgba(212, 250, 112, 0.3)',
            border: '1px solid rgba(90, 138, 0, 0.4)',
            cursor: input.trim() ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.2s ease',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5A8A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
