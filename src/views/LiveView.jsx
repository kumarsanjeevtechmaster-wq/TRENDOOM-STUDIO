import React, { useEffect, useMemo, useState } from 'react';
import { Radio, Search, Play, Headphones } from 'lucide-react';
import { LIVE_CATEGORIES, LIVE_CHANNELS } from '../data/catalogData';
import { searchYouTubeWithUserKey } from '../services/mediaEngine';

export default function LiveView({ onPlayVideo, onPlayTrack }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All Live');
  const [platform, setPlatform] = useState('All');
  const [ytLive, setYtLive] = useState([]);

  useEffect(() => {
    searchYouTubeWithUserKey({
      query: query || 'India live stream',
      eventType: 'live',
      maxResults: 8,
    })
      .then((res) => {
        if (res) {
          setYtLive(
            res.map((r) => ({
              ...r,
              category: 'YouTube Live Search',
              platform: 'YouTube Live',
              viewers: 'LIVE NOW',
            }))
          );
        }
      })
      .catch(() => {});
  }, [query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...LIVE_CHANNELS, ...ytLive].filter((item) => {
      if (category !== 'All Live' && item.category !== category) return false;
      if (platform !== 'All' && item.platform !== platform) return false;
      if (q && !`${item.title} ${item.channel} ${item.category}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [query, category, platform, ytLive]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="section-head">
        <div>
          <h1 className="section-title">
            <span className="pulse-dot" /> LIVE Universe — Streams & 24/7 Radio
          </h1>
          <p className="section-sub">
            14 Live Categories • 24/7 YouTube Live Channels & SomaFM Live Radio Streams
          </p>
        </div>
      </div>

      {/* Search + Multi-Filter */}
      <div className="tab-toolbar">
        <div className="tab-toolbar-top">
          <div className="tab-search-input-wrap">
            <Search size={16} color="var(--text-muted)" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Live news, Lo-Fi, NASA space, cricket ya radio stream search karein..."
            />
          </div>

          <select
            className="filter-select"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            <option value="All">All Live Platforms</option>
            <option value="YouTube Live">YouTube Live</option>
            <option value="Live Audio Radio">Live Audio Radio</option>
          </select>
        </div>

        <div className="chip-row">
          {LIVE_CATEGORIES.map((c) => (
            <button
              key={c}
              className={`chip ${category === c ? 'active-coral' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: 36 }}>
          <Radio size={32} color="var(--accent-coral)" />
          <p style={{ color: 'var(--text-secondary)' }}>
            Is category me abhi koi live stream match nahi hua — "All Live" try karein ya Settings me YouTube API key add karein.
          </p>
        </div>
      ) : (
        <div className="media-grid">
          {filtered.map((stream) => (
            <article key={stream.id} className="media-card">
              <div
                className="thumb-wrap"
                style={{ cursor: 'pointer' }}
                onClick={() =>
                  stream.source === 'audio-stream'
                    ? onPlayTrack(
                        {
                          ...stream,
                          artist: stream.channel,
                          artwork: stream.thumb,
                          audioUrl: stream.streamUrl,
                          isFullLength: false,
                        },
                        []
                      )
                    : onPlayVideo(stream)
                }
              >
                <img src={stream.thumb} alt={stream.title} loading="lazy" />
                <span className="thumb-badge-tl" style={{ color: 'var(--accent-coral)' }}>
                  ● LIVE
                </span>
                <span className="thumb-badge-br">{stream.viewers}</span>
                <div className="play-hover-overlay">
                  <div className="play-circle">
                    {stream.source === 'audio-stream' ? (
                      <Headphones size={20} />
                    ) : (
                      <Play size={20} fill="currentColor" />
                    )}
                  </div>
                </div>
              </div>
              <div className="card-body">
                <h3 className="card-title">{stream.title}</h3>
                <div className="card-meta">
                  <strong>{stream.channel}</strong>
                  <span>• {stream.category}</span>
                  <span>• {stream.platform}</span>
                </div>
                <div className="card-actions">
                  <button
                    className="icon-pill coral"
                    onClick={() =>
                      stream.source === 'audio-stream'
                        ? onPlayTrack(
                            {
                              ...stream,
                              artist: stream.channel,
                              artwork: stream.thumb,
                              audioUrl: stream.streamUrl,
                            },
                            []
                          )
                        : onPlayVideo(stream)
                    }
                  >
                    {stream.source === 'audio-stream' ? <Headphones size={12} /> : <Play size={12} />}
                    {stream.source === 'audio-stream' ? 'Listen Live' : 'Watch Live'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
