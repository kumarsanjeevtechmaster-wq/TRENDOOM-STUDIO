import React, { useEffect, useMemo, useState } from 'react';
import { Music2, Search, Play, Pause, Radio, Video, Sparkles, Podcast } from 'lucide-react';
import { MUSIC_MOOD_PRESETS } from '../data/catalogData';
import { fetchAudiusTracks, fetchItunesCatalog } from '../services/mediaEngine';
import { sendToViralyticsStudio } from '../services/viralyticsBridge';

const LANGUAGES = ['All', 'Hindi', 'Punjabi', 'Tamil', 'Telugu', 'Bengali', 'English'];

const OFFICIAL_MUSIC_LABELS = [
  { id: 'lbl-tseries', title: 'T-Series Official Bollywood Hits', channel: 'T-Series', playlistId: 'UUq-Fj5jknLsUf-MWSy4_brA', source: 'youtube-playlist' },
  { id: 'lbl-zee', title: 'Zee Music Company Latest Songs', channel: 'Zee Music', playlistId: 'UUFFbwnve3yF62-tVXkTyHqg', source: 'youtube-playlist' },
  { id: 'lbl-sony', title: 'Sony Music India Official', channel: 'Sony Music India', playlistId: 'UU56gTxNs4f9xZ7Pa2i5xNzg', source: 'youtube-playlist' },
  { id: 'lbl-saregama', title: 'Saregama Evergreen Classics', channel: 'Saregama Music', playlistId: 'UU_A7K2dXFsTMAciGmnNxy-Q', source: 'youtube-playlist' },
];

export default function SongsView({
  currentTrack,
  isPlaying,
  onPlayTrack,
  onPlayVideo,
  onToast,
}) {
  const [query, setQuery] = useState('Arijit Singh');
  const [debouncedQuery, setDebouncedQuery] = useState('Arijit Singh');
  const [engine, setEngine] = useState('all'); // all | audius | itunes | musicVideo | podcast
  const [language, setLanguage] = useState('Hindi');
  const [sortBy, setSortBy] = useState('default');
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 450);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let active = true;
    const loadMusic = async () => {
      setLoading(true);
      try {
        const searchTerm =
          language !== 'All' && !debouncedQuery.toLowerCase().includes(language.toLowerCase())
            ? `${debouncedQuery} ${language}`.trim()
            : debouncedQuery.trim() || 'Bollywood hits';

        if (engine === 'podcast') {
          const pods = await fetchItunesCatalog({
            term: debouncedQuery || 'India podcast',
            entity: 'podcast',
            country: 'IN',
            limit: 20,
          });
          if (active) setTracks(pods);
        } else if (engine === 'musicVideo') {
          const vids = await fetchItunesCatalog({
            term: searchTerm,
            entity: 'musicVideo',
            country: 'IN',
            limit: 18,
          });
          if (active) setTracks(vids);
        } else {
          const promises = [];
          if (engine === 'all' || engine === 'audius') {
            promises.push(
              fetchAudiusTracks({ query: debouncedQuery === 'Arijit Singh' ? '' : debouncedQuery, limit: 12 }).catch(
                () => []
              )
            );
          } else {
            promises.push(Promise.resolve([]));
          }

          if (engine === 'all' || engine === 'itunes') {
            promises.push(
              fetchItunesCatalog({
                term: searchTerm,
                entity: 'song',
                country: 'IN',
                limit: 20,
              }).catch(() => [])
            );
          } else {
            promises.push(Promise.resolve([]));
          }

          const [aud, it] = await Promise.all(promises);
          if (active) setTracks([...aud, ...it]);
        }
      } catch {
        onToast('Music catalog load karne me issue aaya.');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadMusic();
    return () => {
      active = false;
    };
  }, [debouncedQuery, engine, language, onToast]);

  const sortedTracks = useMemo(() => {
    const list = [...tracks];
    if (sortBy === 'title') list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    if (sortBy === 'duration') list.sort((a, b) => (b.durationSec || 0) - (a.durationSec || 0));
    return list;
  }, [tracks, sortBy]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="section-head">
        <div>
          <h1 className="section-title">
            <Music2 size={22} color="var(--accent-mint)" /> Dual-Engine Music, Videos & Podcasts Studio
          </h1>
          <p className="section-sub">
            Audius Full-Length Audio Streams + iTunes Bollywood/Regional Catalog + Official Video Labels — persistent Mini-Player ke saath
          </p>
        </div>
      </div>

      {/* Official Music Labels Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        {OFFICIAL_MUSIC_LABELS.map((lbl) => (
          <button
            key={lbl.id}
            className="stat-tile"
            style={{ textAlign: 'left', cursor: 'pointer' }}
            onClick={() =>
              onPlayVideo({
                ...lbl,
                genre: 'Official Music Video Hub',
              })
            }
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="badge badge-coral">▶ VIDEO HUB</span>
              <Play size={15} color="var(--accent-gold)" />
            </div>
            <strong style={{ marginTop: 6, fontSize: '0.9rem' }}>{lbl.title}</strong>
            <span className="stat-label">{lbl.channel} Official Playlist</span>
          </button>
        ))}
      </div>

      {/* Search + Multi-Filter Toolbar */}
      <div className="tab-toolbar">
        <div className="tab-toolbar-top">
          <div className="tab-search-input-wrap">
            <Search size={16} color="var(--text-muted)" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Song, artist, Bollywood album, Punjabi, Lo-Fi ya podcast search karein..."
            />
          </div>

          <select
            className="filter-select"
            value={engine}
            onChange={(e) => setEngine(e.target.value)}
          >
            <option value="all">All Music Engines</option>
            <option value="audius">Audius (Full-Length Tracks)</option>
            <option value="itunes">iTunes (Bollywood & Global)</option>
            <option value="musicVideo">Official Video Previews</option>
            <option value="podcast">🎙️ Podcasts</option>
          </select>

          <select
            className="filter-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                Language: {l}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Sort: Relevance</option>
            <option value="duration">Sort: Longest First</option>
            <option value="title">Sort: Title A-Z</option>
          </select>
        </div>

        {/* Mood Presets */}
        <div className="chip-row">
          {MUSIC_MOOD_PRESETS.map((m) => (
            <button
              key={m.id}
              className={`chip ${query === m.query ? 'active' : ''}`}
              onClick={() => {
                setQuery(m.query);
                setLanguage(m.lang);
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tracks List */}
      {loading ? (
        <div className="track-list">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 74 }} />
          ))}
        </div>
      ) : (
        <div className="track-list">
          {sortedTracks.map((tr) => {
            const active = currentTrack?.id === tr.id;
            return (
              <div key={tr.id} className={`track-row ${active ? 'playing' : ''}`}>
                <img src={tr.artwork} alt={tr.title} className="track-art" loading="lazy" />
                <div className="track-info">
                  <div className="track-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{tr.title}</span>
                    {tr.isFullLength ? (
                      <span className="badge badge-mint">FULL TRACK</span>
                    ) : tr.source === 'itunes-podcast' ? (
                      <span className="badge badge-violet">
                        <Podcast size={11} /> PODCAST
                      </span>
                    ) : tr.isVideoPreview ? (
                      <span className="badge badge-coral">
                        <Video size={11} /> VIDEO
                      </span>
                    ) : (
                      <span className="badge badge-gold">30s PREVIEW</span>
                    )}
                  </div>
                  <div className="track-artist">
                    {tr.artist} {tr.album ? `• ${tr.album}` : ''} • {tr.genre}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  {tr.source === 'itunes-podcast' ? (
                    <a
                      href={tr.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                    >
                      <Radio size={14} /> Open Podcast
                    </a>
                  ) : tr.isVideoPreview ? (
                    <button
                      className="btn btn-coral btn-sm"
                      onClick={() => onPlayVideo({ ...tr, poster: tr.artwork })}
                    >
                      <Play size={14} /> Watch Video
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onPlayTrack(tr, sortedTracks)}
                    >
                      {active && isPlaying ? <Pause size={14} /> : <Play size={14} />}
                      {active && isPlaying ? 'Playing' : 'Play'}
                    </button>
                  )}

                  <button
                    className="icon-pill"
                    title="Use song in Viralytics Reel"
                    onClick={() => {
                      const url = sendToViralyticsStudio({
                        title: `Reel with ${tr.title}`,
                        topic: tr.genre,
                        hook: `Trending audio: ${tr.title} — ${tr.artist}`,
                      });
                      window.open(url, '_blank', 'noopener');
                    }}
                  >
                    <Sparkles size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
