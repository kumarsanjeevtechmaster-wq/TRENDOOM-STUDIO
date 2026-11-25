import React, { useEffect, useMemo, useState } from 'react';
import { GraduationCap, Search, Play, Timer, RotateCcw, Pause, Headphones } from 'lucide-react';
import { CREATORS_DIRECTORY, LIVE_CHANNELS, STUDY_CATEGORIES } from '../data/catalogData';

export default function StudyView({ onPlayVideo, onPlayTrack }) {
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('All Subjects');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  const educators = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CREATORS_DIRECTORY.filter((c) => {
      const isEdu = c.studySubject && c.studySubject !== 'All Subjects';
      if (!isEdu) return false;
      if (subject !== 'All Subjects' && c.studySubject !== subject) return false;
      if (q && !`${c.name} ${c.studySubject} ${c.category}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, subject]);

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  const lofiStream = LIVE_CHANNELS.find((l) => l.id === 'live-somafm-groove');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="section-head">
        <div>
          <h1 className="section-title">
            <GraduationCap size={22} color="var(--accent-mint)" /> Study Hub & Focus Pomodoro
          </h1>
          <p className="section-sub">
            17 Education Categories (UPSC, IIT-JEE, NEET, Coding, Finance) + Built-in 25m Focus Timer & Ambient Lo-Fi
          </p>
        </div>
      </div>

      {/* Pomodoro Focus Widget */}
      <div
        className="panel"
        style={{
          background: 'linear-gradient(135deg, rgba(44,234,163,0.1), rgba(245,166,35,0.08))',
          borderColor: 'rgba(44,234,163,0.32)',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Timer size={32} color="var(--accent-mint)" />
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.85rem', fontWeight: 800 }}>
              {mins}:{secs}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Deep Study Pomodoro Session
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button className="btn btn-primary btn-sm" onClick={() => setRunning((r) => !r)}>
            {running ? <Pause size={14} /> : <Play size={14} />} {running ? 'Pause' : 'Start Focus'}
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setRunning(false);
              setSecondsLeft(25 * 60);
            }}
          >
            <RotateCcw size={14} /> Reset 25m
          </button>
          {lofiStream && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() =>
                onPlayTrack(
                  {
                    ...lofiStream,
                    artist: lofiStream.channel,
                    artwork: lofiStream.thumb,
                    audioUrl: lofiStream.streamUrl,
                  },
                  []
                )
              }
            >
              <Headphones size={14} /> Play Focus Lo-Fi Radio
            </button>
          )}
        </div>
      </div>

      {/* Search + 17 Subject Filter */}
      <div className="tab-toolbar">
        <div className="tab-toolbar-top">
          <div className="tab-search-input-wrap">
            <Search size={16} color="var(--text-muted)" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="UPSC, Physics Wallah, Coding, DSA, Finance search karein..."
            />
          </div>
          <select
            className="filter-select"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            {STUDY_CATEGORIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="chip-row">
          {STUDY_CATEGORIES.slice(0, 9).map((s) => (
            <button
              key={s}
              className={`chip ${subject === s ? 'active' : ''}`}
              onClick={() => setSubject(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="media-grid">
        {educators.map((ed) => (
          <article key={ed.id} className="media-card">
            <div
              className="thumb-wrap"
              style={{ cursor: 'pointer' }}
              onClick={() =>
                onPlayVideo({
                  id: `edu-${ed.id}`,
                  title: `${ed.name} — Full Lectures & Study Playlist`,
                  channel: ed.name,
                  genre: ed.studySubject,
                  source: 'youtube-playlist',
                  playlistId: ed.playlistId,
                })
              }
            >
              <img src={ed.avatar} alt={ed.name} loading="lazy" />
              <span className="thumb-badge-tl">📚 {ed.studySubject}</span>
              <span className="thumb-badge-br">{ed.subsLabel} subs</span>
              <div className="play-hover-overlay">
                <div className="play-circle"><Play size={20} fill="currentColor" /></div>
              </div>
            </div>
            <div className="card-body">
              <h3 className="card-title">{ed.name}</h3>
              <div className="card-meta">
                <span>Avg Views: {ed.avgViews}</span>
                <span>• Score: {ed.score}/100</span>
              </div>
              <div className="card-actions">
                <button
                  className="icon-pill gold"
                  onClick={() =>
                    onPlayVideo({
                      id: `edu-${ed.id}`,
                      title: `${ed.name} — Full Lectures & Study Playlist`,
                      channel: ed.name,
                      genre: ed.studySubject,
                      source: 'youtube-playlist',
                      playlistId: ed.playlistId,
                    })
                  }
                >
                  <Play size={12} /> Watch Full Lectures
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
