import React, { useState } from 'react';
import { MessageCircleHeart, Send, X, Sparkles } from 'lucide-react';

export default function YummyAssistant({ onNavigate, onQuickSearch }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: 'Namaste! Main Yummy hoon ✨ Batao kya dekhna ya banana hai? Main aapke liye Full Movies, Songs, TV Episodes ya Viral Reel Ideas turant dhoondh sakti hoon!',
    },
  ]);

  const handleAsk = (customPrompt) => {
    const query = (customPrompt || input).trim();
    if (!query) return;
    setInput('');

    const q = query.toLowerCase();
    let reply = '';
    let action = null;

    if (q.includes('movie') || q.includes('film') || q.includes('cinema')) {
      reply = '🎬 Full Movies Studio khol rahi hoon! Aap Genre (Action, Classic Bollywood, Thriller, Horror) aur Source (Internet Archive HD / Official YouTube) se filter kar sakte ho.';
      action = { label: 'Movies Tab Kholo', fn: () => onNavigate('movies') };
    } else if (q.includes('song') || q.includes('music') || q.includes('gaana') || q.includes('arijit')) {
      reply = '🎵 Dual-Engine Music Studio ready hai — Audius par Full-Length songs aur iTunes par Bollywood/Punjabi/Regional hits sun sakte ho!';
      action = { label: 'Songs Suno', fn: () => onNavigate('songs') };
    } else if (q.includes('episode') || q.includes('serial') || q.includes('tv') || q.includes('show')) {
      reply = '📺 TV & Full Episodes Hub me Taarak Mehta, Kapil Sharma, TVF, StarPlus aur TVmaze live season-wise guide ready hai!';
      action = { label: 'TV & Episodes Kholo', fn: () => onNavigate('tv') };
    } else if (q.includes('idea') || q.includes('viral') || q.includes('seo') || q.includes('script')) {
      reply = '✨ AI Creator Studio me jaake kisi bhi topic par 5 Hooks, Titles, Script Outline aur 12-Point SEO Score free me generate karo!';
      action = { label: 'AI Studio Kholo', fn: () => onNavigate('ai') };
    } else if (q.includes('study') || q.includes('upsc') || q.includes('jee') || q.includes('coding')) {
      reply = '📚 Study Hub me 17 exam/skill categories + Pomodoro Focus Timer ready hai!';
      action = { label: 'Study Hub Kholo', fn: () => onNavigate('study') };
    } else {
      reply = `🔎 "${query}" ke liye TRENDOOM Search aur AI Studio dono check kar sakte hain!`;
      action = { label: `Search "${query}"`, fn: () => onQuickSearch(query) };
    }

    setMessages((prev) => [
      ...prev,
      { role: 'user', text: query },
      { role: 'bot', text: reply, action },
    ]);
  };

  return (
    <>
      <button
        className="yummy-fab"
        onClick={() => setOpen((o) => !o)}
        title="Yummy AI Concierge"
        aria-label="Open Yummy AI Concierge"
      >
        {open ? <X size={22} /> : <MessageCircleHeart size={24} />}
      </button>

      {open && (
        <div className="yummy-drawer">
          <div
            style={{
              padding: '13px 16px',
              background: 'linear-gradient(90deg, rgba(245,166,35,0.2), rgba(255,59,92,0.18))',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={17} color="var(--accent-gold)" />
              <div>
                <strong style={{ fontSize: '0.92rem' }}>Yummy AI Concierge</strong>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  Hinglish Discovery & Creator Helper
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="icon-pill">
              <X size={14} />
            </button>
          </div>

          <div
            style={{
              padding: 14,
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              maxHeight: 310,
            }}
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '88%',
                  padding: '9px 12px',
                  borderRadius: 13,
                  fontSize: '0.82rem',
                  lineHeight: 1.45,
                  background:
                    m.role === 'user' ? 'var(--accent-gold-soft)' : 'var(--bg-card)',
                  border:
                    m.role === 'user'
                      ? '1px solid var(--border-gold)'
                      : '1px solid var(--border-subtle)',
                }}
              >
                <div>{m.text}</div>
                {m.action && (
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: 8 }}
                    onClick={() => {
                      m.action.fn();
                      setOpen(false);
                    }}
                  >
                    {m.action.label}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div
            style={{
              padding: '8px 12px',
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            {['🎬 Full Movies', '🎵 Bollywood Songs', '📺 Full Episodes', '✨ Viral Idea'].map(
              (chip) => (
                <button
                  key={chip}
                  className="chip"
                  style={{ fontSize: '0.72rem' }}
                  onClick={() => handleAsk(chip)}
                >
                  {chip}
                </button>
              )
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            style={{
              padding: 10,
              display: 'flex',
              gap: 8,
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Poocho: movie, song, episode ya idea..."
              style={{
                flex: 1,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 10,
                padding: '8px 11px',
                fontSize: '0.82rem',
                outline: 'none',
              }}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
