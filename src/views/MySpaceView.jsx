import React, { useMemo, useState } from 'react';
import { Bookmark, History, Star, Sparkles, Search, Trash2, Play, Award } from 'lucide-react';
import { sendToViralyticsStudio } from '../services/viralyticsBridge';

export default function MySpaceView({
  vault,
  history,
  following,
  savedIdeas,
  onPlayVideo,
  onToggleVault,
  onToggleFollow,
  onDeleteIdea,
}) {
  const [tab, setTab] = useState('vault'); // vault | history | following | ideas | deals
  const [query, setQuery] = useState('');

  const filterByQuery = (arr) => {
    const q = query.trim().toLowerCase();
    if (!q) return arr;
    return arr.filter((x) =>
      `${x.title || ''} ${x.name || ''} ${x.channel || ''} ${x.topic || ''} ${x.hook || ''}`
        .toLowerCase()
        .includes(q)
    );
  };

  const items = useMemo(() => {
    if (tab === 'vault') return filterByQuery(vault);
    if (tab === 'history') return filterByQuery(history);
    if (tab === 'following') return filterByQuery(following);
    if (tab === 'ideas') return filterByQuery(savedIdeas);
    return [];
  }, [tab, query, vault, history, following, savedIdeas]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="section-head">
        <div>
          <h1 className="section-title">
            <Bookmark size={22} color="var(--accent-violet)" /> My Space, Vault & Monetization
          </h1>
          <p className="section-sub">
            Aapke Saved Videos, Watch History, Followed Creators, AI Ideas aur Viralytics Creator Deals
          </p>
        </div>
      </div>

      <div className="tab-toolbar">
        <div className="tab-toolbar-top">
          <div className="tab-search-input-wrap">
            <Search size={16} color="var(--text-muted)" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Apne Vault, History, Following ya Ideas me search karein..."
            />
          </div>
        </div>
        <div className="chip-row">
          <button className={`chip ${tab === 'vault' ? 'active' : ''}`} onClick={() => setTab('vault')}>
            <Bookmark size={13} /> Meri Vault ({vault.length})
          </button>
          <button className={`chip ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>
            <History size={13} /> Watch History ({history.length})
          </button>
          <button className={`chip ${tab === 'following' ? 'active' : ''}`} onClick={() => setTab('following')}>
            <Star size={13} /> Following ({following.length})
          </button>
          <button className={`chip ${tab === 'ideas' ? 'active' : ''}`} onClick={() => setTab('ideas')}>
            <Sparkles size={13} /> Saved AI Ideas ({savedIdeas.length})
          </button>
          <button className={`chip ${tab === 'deals' ? 'active-coral' : ''}`} onClick={() => setTab('deals')}>
            <Award size={13} /> Viralytics Deals & Refer
          </button>
        </div>
      </div>

      {tab === 'deals' ? (
        <div className="split-2">
          <div className="panel" style={{ borderColor: 'var(--border-gold)' }}>
            <span className="badge badge-gold">VIRALYTICS PRO SUITE</span>
            <h3 style={{ margin: 0 }}>Magic Reel + Auto-Scheduler + Content Scorer</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              TRENDOOM discovery 100% free hai. Viralytics Creator Pro (₹299/month, 10-day FREE trial) se aap AI Reels generate aur schedule kar sakte hain.
            </p>
            <a
              href="https://viralytics.co.in/app/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm"
              style={{ width: 'fit-content' }}
            >
              Start 10-Day Free Trial →
            </a>
          </div>

          <div className="panel" style={{ borderColor: 'rgba(255,59,92,0.3)' }}>
            <span className="badge badge-coral">REFER & EARN (KAMAO) + SPONSORSHIPS</span>
            <h3 style={{ margin: 0 }}>₹2,500 UPI Reward at 25 Paying Referrals</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Creator Barter Program & Brand Category Takeovers (₹4,999/mo Category Top Spot · ₹14,999/mo Homepage Spotlight · ₹39,999/mo Full Takeover).
            </p>
            <a
              href="https://viralytics.co.in/trendoom/sponsored.html"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
              style={{ width: 'fit-content' }}
            >
              View Brand Slots →
            </a>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: 38 }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            Abhi is section me kuch saved nahi hai — Movies, TV, Songs ya AI Studio se items save karein!
          </p>
        </div>
      ) : tab === 'ideas' ? (
        <div className="media-grid">
          {items.map((idea) => (
            <div key={idea.id} className="panel">
              <span className="badge badge-gold">{idea.topic}</span>
              <strong>{idea.title}</strong>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Hook: “{idea.hook}”
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => window.open(sendToViralyticsStudio(idea), '_blank', 'noopener')}
                >
                  Open in Viralytics
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => onDeleteIdea(idea.id)}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : tab === 'following' ? (
        <div className="media-grid">
          {items.map((c) => (
            <div key={c.id} className="panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img
                  src={c.avatar}
                  alt={c.name}
                  style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <strong>{c.name}</strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {c.handle} • {c.subsLabel}
                  </div>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => onToggleFollow(c)}>
                Unfollow
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="media-grid">
          {items.map((item) => (
            <article key={item.id} className="media-card">
              <div className="thumb-wrap" style={{ cursor: 'pointer' }} onClick={() => onPlayVideo(item)}>
                <img src={item.poster || item.thumb || item.backdrop} alt={item.title} />
                <div className="play-hover-overlay">
                  <div className="play-circle"><Play size={20} fill="currentColor" /></div>
                </div>
              </div>
              <div className="card-body">
                <h3 className="card-title">{item.title}</h3>
                <div className="card-meta">{item.channel || item.network || item.genre}</div>
                <div className="card-actions">
                  <button className="icon-pill gold" onClick={() => onPlayVideo(item)}>
                    <Play size={12} /> Watch
                  </button>
                  {tab === 'vault' && (
                    <button className="icon-pill coral" onClick={() => onToggleVault(item)}>
                      <Trash2 size={12} /> Remove
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
