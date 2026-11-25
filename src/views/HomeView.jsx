import React, { useEffect, useMemo, useState } from 'react';
import {
  Play,
  Sparkles,
  Bookmark,
  Flame,
  TrendingUp,
  Search,
  Film,
  Tv,
  Music2,
  Users,
  Microscope,
  ArrowRight,
} from 'lucide-react';
import {
  CURATED_VIDEOS,
  GOOGLE_TRENDS_INDIA,
  HERO_SPOTLIGHTS,
  OFFICIAL_MOVIE_HUBS,
  OFFICIAL_TV_HUBS,
} from '../data/catalogData';
import { sendToViralyticsStudio } from '../services/viralyticsBridge';

export default function HomeView({
  onPlayVideo,
  onToggleVault,
  vaultIds,
  onNavigate,
  onSendTopicToAi,
  stats,
}) {
  const [heroIdx, setHeroIdx] = useState(0);
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('All');
  const [format, setFormat] = useState('All');
  const [sortBy, setSortBy] = useState('views');

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIdx((i) => (i + 1) % HERO_SPOTLIGHTS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const hero = HERO_SPOTLIGHTS[heroIdx];

  const filteredVideos = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CURATED_VIDEOS.filter((v) => {
      if (platform !== 'All' && v.platform !== platform) return false;
      if (format !== 'All' && v.format !== format) return false;
      if (
        q &&
        !`${v.title} ${v.channel} ${v.category}`.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'views') return (b.viewsNum || 0) - (a.viewsNum || 0);
      if (sortBy === 'outlier') return parseFloat(b.outlierScore) - parseFloat(a.outlierScore);
      return a.title.localeCompare(b.title);
    });
  }, [search, platform, format, sortBy]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Cinematic Hero Spotlight */}
      <section className="hero-cinema">
        <img src={hero.backdrop} alt={hero.title} className="hero-backdrop" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="hero-kicker">
            <Flame size={13} /> {hero.kicker}
          </span>
          <h1 className="hero-title">{hero.title}</h1>
          <p className="hero-desc">{hero.desc}</p>
          <div className="hero-meta-row">
            <span>⭐ {hero.rating}</span>
            <span>• {hero.year}</span>
            <span>• {hero.duration}</span>
            <span>• {hero.genre}</span>
            <span>• {hero.views}</span>
          </div>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => onPlayVideo(hero)}>
              <Play size={16} fill="currentColor" /> Watch Now in Theater
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => onToggleVault(hero)}
            >
              <Bookmark size={15} fill={vaultIds.has(hero.id) ? 'currentColor' : 'none'} />
              {vaultIds.has(hero.id) ? 'In Vault' : 'Save Vault'}
            </button>
            <button
              className="btn btn-coral"
              onClick={() => {
                const url = sendToViralyticsStudio({
                  title: `Breakdown: ${hero.title}`,
                  topic: hero.genre,
                  hook: `Inspired by ${hero.title}`,
                });
                window.open(url, '_blank', 'noopener');
              }}
            >
              <Sparkles size={15} /> Create in Viralytics
            </button>
          </div>
        </div>
        <div className="hero-dots">
          {HERO_SPOTLIGHTS.map((s, idx) => (
            <button
              key={s.id}
              className={`hero-dot ${idx === heroIdx ? 'active' : ''}`}
              onClick={() => setHeroIdx(idx)}
              aria-label={`Spotlight ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Live Stats Strip */}
      <section className="stats-strip">
        <div className="stat-tile" onClick={() => onNavigate('movies')} style={{ cursor: 'pointer' }}>
          <span className="stat-val" style={{ color: 'var(--accent-gold)' }}>28,000+</span>
          <span className="stat-label"><Film size={13} /> Full Movies & Archive</span>
        </div>
        <div className="stat-tile" onClick={() => onNavigate('songs')} style={{ cursor: 'pointer' }}>
          <span className="stat-val" style={{ color: 'var(--accent-mint)' }}>Dual Engine</span>
          <span className="stat-label"><Music2 size={13} /> Audius + iTunes Songs</span>
        </div>
        <div className="stat-tile" onClick={() => onNavigate('tv')} style={{ cursor: 'pointer' }}>
          <span className="stat-val" style={{ color: 'var(--accent-coral)' }}>Live TV</span>
          <span className="stat-label"><Tv size={13} /> Full Episodes & TVmaze</span>
        </div>
        <div className="stat-tile" onClick={() => onNavigate('creators')} style={{ cursor: 'pointer' }}>
          <span className="stat-val">106</span>
          <span className="stat-label"><Users size={13} /> Categories & Creators</span>
        </div>
        <div className="stat-tile" onClick={() => onNavigate('myspace')} style={{ cursor: 'pointer' }}>
          <span className="stat-val" style={{ color: 'var(--accent-violet)' }}>{stats.vaultCount}</span>
          <span className="stat-label"><Bookmark size={13} /> Saved in Meri Vault</span>
        </div>
      </section>

      {/* Google Trends India Live Radar */}
      <section className="panel">
        <div className="section-head">
          <div>
            <h2 className="section-title">
              <TrendingUp size={20} color="var(--accent-coral)" /> Aaj India Me Kya Trend Ho Raha Hai
            </h2>
            <p className="section-sub">
              Kisi bhi trend par click karke seedha AI Script, Hooks aur Viralytics Idea banayein
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('ai')}>
            Open AI Studio <ArrowRight size={14} />
          </button>
        </div>

        <div className="chip-row" style={{ flexWrap: 'wrap' }}>
          {GOOGLE_TRENDS_INDIA.map((t) => (
            <button
              key={t.id}
              className="chip"
              style={{
                padding: '8px 13px',
                borderRadius: 12,
                background: 'var(--bg-card)',
              }}
              onClick={() => onSendTopicToAi(t.topic, t.niche)}
              title="Generate Viral Ideas on this trend"
            >
              <span>{t.badge}</span>
              <strong style={{ color: 'var(--text-primary)' }}>{t.topic}</strong>
              <span style={{ color: 'var(--accent-mint)', fontFamily: 'var(--font-mono)' }}>
                {t.delta}
              </span>
              <Sparkles size={13} color="var(--accent-gold)" />
            </button>
          ))}
        </div>
      </section>

      {/* Quick Entertainment Showcase: Full Movies & Episodes */}
      <section className="split-2">
        <div className="panel">
          <div className="section-head">
            <div>
              <h3 className="section-title"><Film size={18} color="var(--accent-gold)" /> Cinematic Full Movies</h3>
              <p className="section-sub">Internet Archive Direct HD + Official Studios</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('movies')}>
              All Movies <ArrowRight size={14} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {OFFICIAL_MOVIE_HUBS.slice(0, 4).map((m) => (
              <div
                key={m.id}
                className="media-card"
                style={{ cursor: 'pointer' }}
                onClick={() => onPlayVideo(m)}
              >
                <div className="thumb-wrap">
                  <img src={m.poster} alt={m.title} loading="lazy" />
                  <span className="thumb-badge-tl">{m.genre}</span>
                  <div className="play-hover-overlay">
                    <div className="play-circle"><Play size={18} fill="currentColor" /></div>
                  </div>
                </div>
                <div className="card-body" style={{ padding: 10 }}>
                  <h4 className="card-title" style={{ fontSize: '0.84rem' }}>{m.title}</h4>
                  <span className="card-meta">{m.channel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="section-head">
            <div>
              <h3 className="section-title"><Tv size={18} color="var(--accent-coral)" /> Official Full Episodes & TV</h3>
              <p className="section-sub">Sony SAB, SET, Colors, TVF & Archive Classics</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('tv')}>
              All Shows <ArrowRight size={14} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {OFFICIAL_TV_HUBS.slice(0, 4).map((show) => (
              <div
                key={show.id}
                className="media-card"
                style={{ cursor: 'pointer' }}
                onClick={() => onPlayVideo(show)}
              >
                <div className="thumb-wrap">
                  <img src={show.poster} alt={show.title} loading="lazy" />
                  <span className="thumb-badge-tl">{show.trpRank}</span>
                  <div className="play-hover-overlay">
                    <div className="play-circle"><Play size={18} fill="currentColor" /></div>
                  </div>
                </div>
                <div className="card-body" style={{ padding: 10 }}>
                  <h4 className="card-title" style={{ fontSize: '0.84rem' }}>{show.title}</h4>
                  <span className="card-meta">{show.network}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Videos Feed with Search + Filters */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="section-head">
          <div>
            <h2 className="section-title"><Flame size={20} color="var(--accent-gold)" /> Trending Discovery Feed</h2>
            <p className="section-sub">Har video ko Theater Mode me dekhein ya 1-click me Viralytics Idea banayein</p>
          </div>
        </div>

        <div className="tab-toolbar">
          <div className="tab-toolbar-top">
            <div className="tab-search-input-wrap">
              <Search size={16} color="var(--text-muted)" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Trending videos, creators ya niche search karein..."
              />
            </div>
            <select
              className="filter-select"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              <option value="All">All Platforms</option>
              <option value="YouTube">YouTube</option>
              <option value="Dailymotion">Dailymotion</option>
            </select>
            <select
              className="filter-select"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              <option value="All">All Formats</option>
              <option value="Long">Long Videos</option>
              <option value="Short">Shorts / Reels</option>
            </select>
            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="views">Sort: Most Viewed</option>
              <option value="outlier">Sort: Highest Outlier</option>
              <option value="title">Sort: Title A-Z</option>
            </select>
          </div>
        </div>

        <div className="media-grid">
          {filteredVideos.map((v) => (
            <article key={v.id} className="media-card">
              <div className="thumb-wrap" style={{ cursor: 'pointer' }} onClick={() => onPlayVideo(v)}>
                <img src={v.thumb} alt={v.title} loading="lazy" />
                <span className="thumb-badge-tl">🔥 {v.outlierScore} Outlier</span>
                <span className="thumb-badge-br">{v.duration}</span>
                <div className="play-hover-overlay">
                  <div className="play-circle"><Play size={20} fill="currentColor" /></div>
                </div>
              </div>
              <div className="card-body">
                <h3 className="card-title">{v.title}</h3>
                <div className="card-meta">
                  <strong>{v.channel}</strong>
                  <span>• {v.category}</span>
                  <span>• {v.views} views</span>
                </div>
                <div className="card-actions">
                  <button className="icon-pill gold" onClick={() => onPlayVideo(v)}>
                    <Play size={12} /> Watch
                  </button>
                  <button
                    className="icon-pill coral"
                    onClick={() => onSendTopicToAi(v.title, v.category)}
                  >
                    <Microscope size={12} /> AI Hook
                  </button>
                  <button
                    className={`icon-pill ${vaultIds.has(v.id) ? 'mint' : ''}`}
                    onClick={() => onToggleVault(v)}
                  >
                    <Bookmark size={12} /> {vaultIds.has(v.id) ? 'Saved' : 'Vault'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
