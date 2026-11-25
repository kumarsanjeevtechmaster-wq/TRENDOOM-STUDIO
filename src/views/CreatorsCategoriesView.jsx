import React, { useMemo, useState } from 'react';
import { Crown, Search, Flame, Users, Play, Star, Scale } from 'lucide-react';
import {
  ALL_CATEGORIES,
  CATEGORY_GROUPS,
  CREATORS_DIRECTORY,
} from '../data/catalogData';

export default function CreatorsCategoriesView({
  onPlayVideo,
  followingIds,
  onToggleFollow,
}) {
  const [subTab, setSubTab] = useState('creators'); // creators | categories
  const [query, setQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState('All Groups');
  const [tierFilter, setTierFilter] = useState('All'); // All | rising | outlier
  const [sortBy, setSortBy] = useState('score');
  const [compareIds, setCompareIds] = useState(['cr-1', 'cr-5']);

  const filteredCreators = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CREATORS_DIRECTORY.filter((c) => {
      if (tierFilter === 'rising' && !c.rising) return false;
      if (tierFilter === 'outlier' && c.outlierMultiplier < 4.0) return false;
      if (q && !`${c.name} ${c.handle} ${c.category}`.toLowerCase().includes(q)) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'subs') return b.subs - a.subs;
      if (sortBy === 'growth') return b.growth30d - a.growth30d;
      if (sortBy === 'outlier') return b.outlierMultiplier - a.outlierMultiplier;
      return b.score - a.score;
    });
  }, [query, tierFilter, sortBy]);

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_CATEGORIES.filter((cat) => {
      if (groupFilter !== 'All Groups' && cat.group !== groupFilter) return false;
      if (q && !`${cat.name} ${cat.group}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, groupFilter]);

  const toggleCompare = (id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const compared = compareIds
    .map((id) => CREATORS_DIRECTORY.find((c) => c.id === id))
    .filter(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="section-head">
        <div>
          <h1 className="section-title">
            <Crown size={22} color="var(--accent-gold)" /> Creator Universe & {ALL_CATEGORIES.length} Categories
          </h1>
          <p className="section-sub">
            Leaderboard, Rising Stars (&lt;2L subs), Outlier Radar (3x–6x) & Side-by-Side Creator Comparison
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn btn-sm ${subTab === 'creators' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setSubTab('creators')}
          >
            <Users size={14} /> Creators & Radar
          </button>
          <button
            className={`btn btn-sm ${subTab === 'categories' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setSubTab('categories')}
          >
            <Flame size={14} /> All {ALL_CATEGORIES.length} Categories
          </button>
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
              placeholder={
                subTab === 'creators'
                  ? 'Creator name, @handle ya niche search karein...'
                  : '106 categories me se koi bhi category search karein...'
              }
            />
          </div>

          {subTab === 'creators' ? (
            <>
              <select
                className="filter-select"
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
              >
                <option value="All">All Tiers</option>
                <option value="rising">🚀 Rising Stars (&lt;2L subs)</option>
                <option value="outlier">🔥 Outliers (4x+ multiplier)</option>
              </select>

              <select
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="score">Sort: Creator Score</option>
                <option value="subs">Sort: Subscribers</option>
                <option value="growth">Sort: 30d Growth %</option>
                <option value="outlier">Sort: Outlier Multiplier</option>
              </select>
            </>
          ) : (
            <select
              className="filter-select"
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
            >
              <option value="All Groups">All {CATEGORY_GROUPS.length} Topic Groups</option>
              {CATEGORY_GROUPS.map((g) => (
                <option key={g.group} value={g.group}>
                  {g.group} ({g.items.length})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {subTab === 'creators' ? (
        <>
          {/* Side-by-Side Creator Comparison */}
          {compared.length === 2 && (
            <div className="panel" style={{ borderColor: 'var(--border-gold)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Scale size={17} color="var(--accent-gold)" />
                <strong>Side-by-Side Creator Comparison</strong>
                <span className="badge badge-gold">Select any 2 below</span>
              </div>
              <div className="split-2">
                {compared.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      background: 'var(--bg-card)',
                      padding: 14,
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <img
                      src={c.avatar}
                      alt={c.name}
                      style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <strong>{c.name}</strong>
                      <div style={{ fontSize: '0.77rem', color: 'var(--text-secondary)' }}>
                        Subs: {c.subsLabel} • Avg: {c.avgViews} • Eng: {c.engagement}% • Growth: +{c.growth30d}%
                      </div>
                    </div>
                    <span className="badge badge-mint">{c.outlierMultiplier}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Creator Cards Grid */}
          <div className="media-grid">
            {filteredCreators.map((c, idx) => (
              <article key={c.id} className="media-card">
                <div className="card-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img
                      src={c.avatar}
                      alt={c.name}
                      style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="badge badge-gold">#{idx + 1}</span>
                        <strong style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.name}
                        </strong>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                        {c.handle} • {c.category}
                      </div>
                    </div>
                  </div>

                  <div className="stats-strip" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                    <div className="stat-tile" style={{ padding: 8 }}>
                      <span className="stat-val" style={{ fontSize: '0.96rem' }}>{c.subsLabel}</span>
                      <span className="stat-label">Subscribers</span>
                    </div>
                    <div className="stat-tile" style={{ padding: 8 }}>
                      <span className="stat-val" style={{ fontSize: '0.96rem', color: 'var(--accent-mint)' }}>
                        +{c.growth30d}%
                      </span>
                      <span className="stat-label">30d Growth</span>
                    </div>
                    <div className="stat-tile" style={{ padding: 8 }}>
                      <span className="stat-val" style={{ fontSize: '0.96rem' }}>{c.avgViews}</span>
                      <span className="stat-label">Avg Views</span>
                    </div>
                    <div className="stat-tile" style={{ padding: 8 }}>
                      <span className="stat-val" style={{ fontSize: '0.96rem', color: 'var(--accent-coral)' }}>
                        {c.outlierMultiplier}x
                      </span>
                      <span className="stat-label">Outlier Radar</span>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      className="icon-pill gold"
                      onClick={() =>
                        onPlayVideo({
                          id: `cr-vid-${c.id}`,
                          title: `${c.name} — Latest Official Channel Videos`,
                          channel: c.name,
                          genre: c.category,
                          source: 'youtube-playlist',
                          playlistId: c.playlistId,
                        })
                      }
                    >
                      <Play size={12} /> Watch Videos
                    </button>
                    <button
                      className={`icon-pill ${followingIds.has(c.id) ? 'mint' : ''}`}
                      onClick={() => onToggleFollow(c)}
                    >
                      <Star size={12} fill={followingIds.has(c.id) ? 'currentColor' : 'none'} />
                      {followingIds.has(c.id) ? 'Following' : 'Follow'}
                    </button>
                    <button
                      className={`icon-pill ${compareIds.includes(c.id) ? 'coral' : ''}`}
                      onClick={() => toggleCompare(c.id)}
                    >
                      <Scale size={12} /> Compare
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
            gap: 12,
          }}
        >
          {filteredCategories.map((cat) => (
            <button
              key={cat.id}
              className="stat-tile"
              style={{ textAlign: 'left', cursor: 'pointer' }}
              onClick={() => {
                setSubTab('creators');
                setQuery(cat.name.split(' ')[0]);
              }}
            >
              <span className="badge badge-gold">{cat.group}</span>
              <strong style={{ marginTop: 6, fontSize: '0.93rem' }}>{cat.name}</strong>
              <span className="stat-label">Explore creators & trends →</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
