import React, { useEffect, useMemo, useState } from 'react';
import { Tv, Search, Play, Bookmark, Layers, X, ExternalLink, Sparkles } from 'lucide-react';
import { OFFICIAL_TV_HUBS } from '../data/catalogData';
import {
  fetchArchiveCinema,
  fetchTvMazeEpisodes,
  fetchTvMazeShows,
} from '../services/mediaEngine';

const TV_CATEGORIES = [
  'All',
  'Comedy & Sitcoms',
  'Daily Serials',
  'Reality & Game Shows',
  'Web Series',
  'Classic TV Archives',
  'Drama',
];

export default function TvEpisodesView({ onPlayVideo, onToggleVault, vaultIds, onToast }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All'); // All | official | tvmaze | archive
  const [tvmazeShows, setTvmazeShows] = useState([]);
  const [archiveTv, setArchiveTv] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('All');
  const [epLoading, setEpLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 450);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchTvMazeShows(debouncedQuery).catch(() => []),
      fetchArchiveCinema({
        query: debouncedQuery,
        collection: 'classic_tv',
        rows: 10,
      }).catch(() => []),
    ]).then(([shows, arch]) => {
      if (!active) return;
      setTvmazeShows(shows);
      setArchiveTv(
        arch.map((a) => ({
          ...a,
          network: 'Internet Archive TV',
          category: 'Classic TV Archives',
          trpRank: 'Full Episode',
          summary: a.description,
        }))
      );
    });
    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  const openShowEpisodes = async (show) => {
    if (!show.tvmazeId) {
      onPlayVideo(show);
      return;
    }
    setSelectedShow(show);
    setSelectedSeason('All');
    setEpLoading(true);
    try {
      const eps = await fetchTvMazeEpisodes(show.tvmazeId);
      setEpisodes(eps);
    } catch {
      onToast('Episodes load karne me error aaya.');
    } finally {
      setEpLoading(false);
    }
  };

  const filteredList = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    const officialFiltered = OFFICIAL_TV_HUBS.filter((s) => {
      if (q && !`${s.title} ${s.network} ${s.category}`.toLowerCase().includes(q)) return false;
      return true;
    });

    const all = [...officialFiltered, ...archiveTv, ...tvmazeShows];
    return all.filter((item) => {
      if (category !== 'All' && item.category !== category && !(item.genres || []).includes(category)) {
        return false;
      }
      if (sourceFilter === 'official' && item.source !== 'youtube-playlist') return false;
      if (sourceFilter === 'tvmaze' && item.source !== 'tvmaze') return false;
      if (sourceFilter === 'archive' && item.source !== 'archive') return false;
      return true;
    });
  }, [debouncedQuery, category, sourceFilter, archiveTv, tvmazeShows]);

  const seasons = useMemo(() => {
    const set = new Set(episodes.map((e) => e.season));
    return ['All', ...Array.from(set)];
  }, [episodes]);

  const visibleEpisodes = useMemo(() => {
    if (selectedSeason === 'All') return episodes.slice(0, 40);
    return episodes.filter((e) => String(e.season) === String(selectedSeason));
  }, [episodes, selectedSeason]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="section-head">
        <div>
          <h1 className="section-title">
            <Tv size={22} color="var(--accent-coral)" /> TV Shows & Realistic Full Episodes
          </h1>
          <p className="section-sub">
            Official Indian TV Channel Hubs (Sony SAB, SET, Colors, TVF, StarPlus) + Live TVmaze Season/Episode Explorer + Archive Classic Episodes
          </p>
        </div>
      </div>

      {/* Search + Multi-Filter Bar */}
      <div className="tab-toolbar">
        <div className="tab-toolbar-top">
          <div className="tab-search-input-wrap">
            <Search size={16} color="var(--text-muted)" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="TV show, Taarak Mehta, Kapil Sharma, Panchayat, Mirzapur ya global series search karein..."
            />
          </div>
          <select
            className="filter-select"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="All">All TV Sources</option>
            <option value="official">Official YouTube TV Hubs</option>
            <option value="archive">Direct MP4 Archive Episodes</option>
            <option value="tvmaze">TVmaze Live Episode Guide</option>
          </select>
        </div>

        <div className="chip-row">
          {TV_CATEGORIES.map((c) => (
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

      <div className="media-grid">
        {filteredList.map((show) => (
          <article key={show.id} className="media-card">
            <div
              className="thumb-wrap"
              style={{ cursor: 'pointer' }}
              onClick={() => openShowEpisodes(show)}
            >
              <img
                src={show.poster}
                alt={show.title}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <span className="thumb-badge-tl">
                {show.tvmazeId ? '📺 EPISODE GUIDE' : show.source === 'archive' ? '🎬 FULL EPISODE MP4' : `⭐ ${show.trpRank}`}
              </span>
              <span className="thumb-badge-br">★ {show.rating}</span>
              <div className="play-hover-overlay">
                <div className="play-circle">
                  {show.tvmazeId ? <Layers size={20} /> : <Play size={20} fill="currentColor" />}
                </div>
              </div>
            </div>

            <div className="card-body">
              <h3 className="card-title">{show.title}</h3>
              <div className="card-meta">
                <strong>{show.network}</strong>
                <span>• {show.category}</span>
                {show.episodesCount && <span>• {show.episodesCount}</span>}
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {show.summary}
              </p>
              <div className="card-actions">
                <button className="icon-pill gold" onClick={() => openShowEpisodes(show)}>
                  {show.tvmazeId ? (
                    <>
                      <Layers size={12} /> Seasons & Episodes
                    </>
                  ) : (
                    <>
                      <Play size={12} /> Watch Episodes
                    </>
                  )}
                </button>
                <button
                  className={`icon-pill ${vaultIds.has(show.id) ? 'mint' : ''}`}
                  onClick={() => onToggleVault(show)}
                >
                  <Bookmark size={12} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Season & Full Episode Guide Modal for TVmaze Shows */}
      {selectedShow && (
        <div className="modal-backdrop" onClick={() => setSelectedShow(null)}>
          <div className="theater-modal" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                padding: '16px 22px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <strong style={{ fontSize: '1.08rem' }}>{selectedShow.title}</strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {selectedShow.network} • {episodes.length} Episodes Indexed
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedShow(null)}>
                <X size={15} /> Close
              </button>
            </div>

            <div className="theater-body">
              <div className="chip-row">
                {seasons.map((s) => (
                  <button
                    key={s}
                    className={`chip ${String(selectedSeason) === String(s) ? 'active' : ''}`}
                    onClick={() => setSelectedSeason(s)}
                  >
                    {s === 'All' ? 'All Seasons' : `Season ${s}`}
                  </button>
                ))}
              </div>

              {epLoading ? (
                <div className="skeleton" style={{ height: 180 }} />
              ) : (
                <div className="track-list" style={{ maxHeight: 440, overflowY: 'auto' }}>
                  {visibleEpisodes.map((ep) => (
                    <div key={ep.id} className="track-row" style={{ alignItems: 'flex-start' }}>
                      {ep.image && (
                        <img
                          src={ep.image}
                          alt={ep.name}
                          className="track-art"
                          style={{ width: 96, height: 58 }}
                        />
                      )}
                      <div className="track-info">
                        <div className="track-title">
                          S{ep.season}E{ep.number} — {ep.name}
                        </div>
                        <div className="track-artist">
                          Airdate: {ep.airdate || 'TBA'} • {ep.runtime} min
                        </div>
                        {ep.summary && (
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 4 }}>
                            {ep.summary.slice(0, 140)}
                          </div>
                        )}
                      </div>
                      <a
                        className="btn btn-primary btn-sm"
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                          `${selectedShow.title} S${ep.season} E${ep.number} ${ep.name} full episode`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink size={13} /> Watch
                      </a>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Official TV hubs card se directly in-app playlist streams bhi play ho sakte hain.
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setSelectedShow(null);
                    setSourceFilter('official');
                  }}
                >
                  <Sparkles size={13} /> Official In-App TV Hubs Dekho
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
