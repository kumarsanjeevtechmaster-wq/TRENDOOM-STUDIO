import React, { useEffect, useMemo, useState } from 'react';
import { Film, Search, Play, Bookmark, Sparkles, RefreshCw } from 'lucide-react';
import { OFFICIAL_MOVIE_HUBS } from '../data/catalogData';
import { fetchArchiveCinema, searchYouTubeWithUserKey } from '../services/mediaEngine';
import { sendToViralyticsStudio } from '../services/viralyticsBridge';

const GENRES = [
  'All',
  'Action',
  'Classic Bollywood',
  'Drama',
  'Comedy',
  'Thriller',
  'Horror',
  'Sci-Fi',
  'Animation',
  'Documentary',
];

export default function MoviesView({ onPlayVideo, onToggleVault, vaultIds, onToast }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All'); // All | archive | youtube
  const [genre, setGenre] = useState('All');
  const [era, setEra] = useState('All');
  const [sortBy, setSortBy] = useState('downloads desc');
  const [archiveMovies, setArchiveMovies] = useState([]);
  const [ytKeyMovies, setYtKeyMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 450);
    return () => clearTimeout(t);
  }, [query]);

  const loadLiveMovies = async () => {
    setLoading(true);
    try {
      const [arch, yt] = await Promise.all([
        fetchArchiveCinema({
          query: debouncedQuery,
          genre,
          era,
          sort: sortBy,
          collection: genre === 'Classic Bollywood' ? 'all' : 'feature_films',
          rows: 18,
        }),
        searchYouTubeWithUserKey({
          query: `${debouncedQuery || 'Hindi'} full movie official`,
          maxResults: 8,
        }).catch(() => null),
      ]);
      setArchiveMovies(arch || []);
      setYtKeyMovies(yt || []);
    } catch {
      onToast('Internet Archive live fetch me temporary network issue aaya — curated studios active hain.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, genre, era, sortBy]);

  const combined = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    const curatedFiltered = OFFICIAL_MOVIE_HUBS.filter((m) => {
      if (genre !== 'All' && m.genre !== genre) return false;
      if (era !== 'All' && m.era !== era) return false;
      if (q && !`${m.title} ${m.channel} ${m.genre} ${m.description}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });

    const list = [...curatedFiltered, ...ytKeyMovies, ...archiveMovies];
    return list.filter((item) => {
      if (sourceFilter === 'archive') return item.source === 'archive';
      if (sourceFilter === 'youtube') return item.source !== 'archive';
      return true;
    });
  }, [debouncedQuery, genre, era, sourceFilter, archiveMovies, ytKeyMovies]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="section-head">
        <div>
          <h1 className="section-title">
            <Film size={22} color="var(--accent-gold)" /> Cinematic Full Movies Studio
          </h1>
          <p className="section-sub">
            28,000+ Internet Archive Direct HD MP4 Full Movies + Official Bollywood & South Cinema Studio Hubs
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={loadLiveMovies} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> {loading ? 'Fetching...' : 'Refresh Catalog'}
        </button>
      </div>

      {/* Search + Multi-Filter Bar */}
      <div className="tab-toolbar">
        <div className="tab-toolbar-top">
          <div className="tab-search-input-wrap">
            <Search size={16} color="var(--text-muted)" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Full movie name, actor, Bollywood, Goldmines, Charlie Chaplin search karein..."
            />
          </div>

          <select
            className="filter-select"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="All">All Sources</option>
            <option value="archive">Internet Archive (Direct MP4)</option>
            <option value="youtube">Official YouTube Studios</option>
          </select>

          <select
            className="filter-select"
            value={era}
            onChange={(e) => setEra(e.target.value)}
          >
            <option value="All">All Eras</option>
            <option value="2020s">2020s</option>
            <option value="2010s">2010s</option>
            <option value="Classic">Classic Cinema</option>
          </select>

          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="downloads desc">Sort: Most Watched</option>
            <option value="year desc">Sort: Newest Year</option>
            <option value="titleSorter asc">Sort: Title A-Z</option>
          </select>
        </div>

        <div className="chip-row">
          {GENRES.map((g) => (
            <button
              key={g}
              className={`chip ${genre === g ? 'active' : ''}`}
              onClick={() => setGenre(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && combined.length === 0 ? (
        <div className="poster-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 320 }} />
          ))}
        </div>
      ) : combined.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            Is filter se koi movie nahi mili — search clear karein ya "All" genre chunein.
          </p>
        </div>
      ) : (
        <div className="poster-grid">
          {combined.map((m) => (
            <article key={m.id} className="media-card">
              <div
                className="thumb-wrap poster"
                style={{ cursor: 'pointer' }}
                onClick={() => onPlayVideo(m)}
              >
                <img
                  src={m.poster || m.thumb}
                  alt={m.title}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <span className="thumb-badge-tl">
                  {m.source === 'archive' ? '🎬 FULL MP4' : '▶ OFFICIAL HUB'}
                </span>
                <span className="thumb-badge-br">{m.year || m.duration}</span>
                <div className="play-hover-overlay">
                  <div className="play-circle">
                    <Play size={22} fill="currentColor" />
                  </div>
                </div>
              </div>

              <div className="card-body">
                <h3 className="card-title">{m.title}</h3>
                <div className="card-meta">
                  <span>{m.channel}</span>
                  <span>• {m.genre}</span>
                </div>
                <div className="card-actions">
                  <button className="icon-pill gold" onClick={() => onPlayVideo(m)}>
                    <Play size={12} /> Watch Full
                  </button>
                  <button
                    className={`icon-pill ${vaultIds.has(m.id) ? 'mint' : ''}`}
                    onClick={() => onToggleVault(m)}
                  >
                    <Bookmark size={12} />
                  </button>
                  <button
                    className="icon-pill"
                    title="Send to Viralytics"
                    onClick={() => {
                      const url = sendToViralyticsStudio({
                        title: `Movie Review: ${m.title}`,
                        topic: m.genre,
                        hook: `Is ${m.title} worth watching?`,
                      });
                      window.open(url, '_blank', 'noopener');
                    }}
                  >
                    <Sparkles size={12} />
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
