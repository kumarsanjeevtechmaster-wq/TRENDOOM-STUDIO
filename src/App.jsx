import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Flame,
  Film,
  Tv,
  Music2,
  Radio,
  Crown,
  GraduationCap,
  Sparkles,
  Bookmark,
  Search,
  Settings,
  Menu,
  X,
  Link2,
  ExternalLink,
} from 'lucide-react';
import HomeView from './views/HomeView';
import MoviesView from './views/MoviesView';
import TvEpisodesView from './views/TvEpisodesView';
import SongsView from './views/SongsView';
import LiveView from './views/LiveView';
import CreatorsCategoriesView from './views/CreatorsCategoriesView';
import StudyView from './views/StudyView';
import AiStudioView from './views/AiStudioView';
import MySpaceView from './views/MySpaceView';
import TheaterPlayerModal from './components/TheaterPlayerModal';
import MiniAudioPlayer from './components/MiniAudioPlayer';
import YummyAssistant from './components/YummyAssistant';
import SettingsModal from './components/SettingsModal';
import {
  getViralyticsConnectUrl,
  readStore,
  storeKeys,
  writeStore,
} from './services/viralyticsBridge';
import {
  CREATORS_DIRECTORY,
  CURATED_VIDEOS,
  LIVE_CHANNELS,
  OFFICIAL_MOVIE_HUBS,
  OFFICIAL_TV_HUBS,
} from './data/catalogData';

const NAV_ITEMS = [
  { id: 'home', label: 'Trending Home', icon: Flame, group: 'Discover' },
  { id: 'live', label: 'LIVE Universe', icon: Radio, badge: 'LIVE', group: 'Discover' },
  { id: 'movies', label: 'Full Movies', icon: Film, group: 'Cinema & Audio' },
  { id: 'tv', label: 'TV & Episodes', icon: Tv, group: 'Cinema & Audio' },
  { id: 'songs', label: 'Songs & Podcasts', icon: Music2, group: 'Cinema & Audio' },
  { id: 'creators', label: 'Creators & 106 Cats', icon: Crown, group: 'Intelligence' },
  { id: 'study', label: 'Study Hub', icon: GraduationCap, group: 'Intelligence' },
  { id: 'ai', label: 'AI & SEO Studio', icon: Sparkles, group: 'Creator Pro' },
  { id: 'myspace', label: 'My Vault & Deals', icon: Bookmark, group: 'Creator Pro' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const searchInputRef = useRef(null);

  // Persistent User Collections
  const [vault, setVault] = useState(() => readStore(storeKeys.VAULT, []));
  const [history, setHistory] = useState(() => readStore(storeKeys.HISTORY, []));
  const [following, setFollowing] = useState(() => readStore(storeKeys.FOLLOWING, []));
  const [savedIdeas, setSavedIdeas] = useState(() => readStore(storeKeys.IDEAS, []));

  // Active Players
  const [theaterItem, setTheaterItem] = useState(null);
  const [audioQueue, setAudioQueue] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [aiInitialTopic, setAiInitialTopic] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
  }, []);

  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(''), 3200);
    return () => clearTimeout(t);
  }, [toastMsg]);

  // Keyboard shortcuts: '/' focuses search, 'Escape' closes modal
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setTheaterItem(null);
        setSettingsOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const vaultIds = useMemo(() => new Set(vault.map((x) => x.id)), [vault]);
  const followingIds = useMemo(() => new Set(following.map((x) => x.id)), [following]);

  const handlePlayVideo = useCallback((item) => {
    setTheaterItem(item);
    setHistory((prev) => {
      const next = [item, ...prev.filter((p) => p.id !== item.id)].slice(0, 80);
      writeStore(storeKeys.HISTORY, next);
      return next;
    });
  }, []);

  const handleToggleVault = useCallback(
    (item) => {
      setVault((prev) => {
        const exists = prev.some((x) => x.id === item.id);
        const next = exists ? prev.filter((x) => x.id !== item.id) : [item, ...prev].slice(0, 100);
        writeStore(storeKeys.VAULT, next);
        showToast(exists ? 'Vault se remove kiya gaya.' : 'Meri Vault me save ho gaya!');
        return next;
      });
    },
    [showToast]
  );

  const handleToggleFollow = useCallback(
    (creator) => {
      setFollowing((prev) => {
        const exists = prev.some((x) => x.id === creator.id);
        const next = exists ? prev.filter((x) => x.id !== creator.id) : [creator, ...prev];
        writeStore(storeKeys.FOLLOWING, next);
        showToast(exists ? `${creator.name} unfollowed` : `${creator.name} followed!`);
        return next;
      });
    },
    [showToast]
  );

  const handleSaveIdea = useCallback(
    (idea) => {
      setSavedIdeas((prev) => {
        const next = [idea, ...prev].slice(0, 80);
        writeStore(storeKeys.IDEAS, next);
        showToast('AI Idea My Space me save ho gaya!');
        return next;
      });
    },
    [showToast]
  );

  const handleDeleteIdea = useCallback((id) => {
    setSavedIdeas((prev) => {
      const next = prev.filter((x) => x.id !== id);
      writeStore(storeKeys.IDEAS, next);
      return next;
    });
  }, []);

  const handlePlayTrack = useCallback((track, list = []) => {
    if (list.length > 0) {
      setAudioQueue(list.filter((t) => t.audioUrl));
    }
    setCurrentTrack((prev) => {
      if (prev?.id === track.id) {
        setIsAudioPlaying((p) => !p);
        return prev;
      }
      setIsAudioPlaying(true);
      return track;
    });
  }, []);

  const handleAudioNext = useCallback(() => {
    if (!audioQueue.length || !currentTrack) return;
    if (shuffle) {
      const rand = audioQueue[Math.floor(Math.random() * audioQueue.length)];
      setCurrentTrack(rand);
      setIsAudioPlaying(true);
      return;
    }
    const idx = audioQueue.findIndex((t) => t.id === currentTrack.id);
    const next = audioQueue[(idx + 1) % audioQueue.length];
    if (next) {
      setCurrentTrack(next);
      setIsAudioPlaying(true);
    }
  }, [audioQueue, currentTrack, shuffle]);

  const handleAudioPrev = useCallback(() => {
    if (!audioQueue.length || !currentTrack) return;
    const idx = audioQueue.findIndex((t) => t.id === currentTrack.id);
    const prev = audioQueue[(idx - 1 + audioQueue.length) % audioQueue.length];
    if (prev) {
      setCurrentTrack(prev);
      setIsAudioPlaying(true);
    }
  }, [audioQueue, currentTrack]);

  // Global Instant Search Results Drawer
  const globalSearchMatches = useMemo(() => {
    const q = globalQuery.trim().toLowerCase();
    if (q.length < 2) return null;
    const allPlayables = [
      ...OFFICIAL_MOVIE_HUBS,
      ...OFFICIAL_TV_HUBS,
      ...CURATED_VIDEOS,
      ...LIVE_CHANNELS,
    ].filter((x) => `${x.title} ${x.channel || x.network || ''} ${x.genre || x.category || ''}`.toLowerCase().includes(q));

    const creators = CREATORS_DIRECTORY.filter((c) =>
      `${c.name} ${c.handle} ${c.category}`.toLowerCase().includes(q)
    );
    return { allPlayables: allPlayables.slice(0, 6), creators: creators.slice(0, 4) };
  }, [globalQuery]);

  const navigateTo = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-shell">
      {/* Sidebar Rail */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">T</div>
          <div>
            <div className="brand-title">TRENDOOM</div>
            <div className="brand-sub">Cinema • Creator OS</div>
          </div>
          <button
            className="mobile-menu-btn"
            style={{ marginLeft: 'auto' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={16} />
          </button>
        </div>

        <nav className="nav-scroll">
          {['Discover', 'Cinema & Audio', 'Intelligence', 'Creator Pro'].map((group) => (
            <React.Fragment key={group}>
              <div className="nav-section-label">{group}</div>
              {NAV_ITEMS.filter((n) => n.group === group).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => navigateTo(item.id)}
                  >
                    <Icon size={17} />
                    <span>{item.label}</span>
                    {item.badge && <span className="nav-badge live">{item.badge}</span>}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </nav>

        <div className="sidebar-footer">
          <a
            href={getViralyticsConnectUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="viralytics-pill"
          >
            <span>✨ Viralytics Studio</span>
            <ExternalLink size={14} color="var(--accent-gold)" />
          </a>
          <button
            className="nav-item"
            onClick={() => {
              setSettingsOpen(true);
              setMobileMenuOpen(false);
            }}
          >
            <Settings size={16} />
            <span>API Keys & Backup</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-wrap">
        <header className="topbar">
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>

          <div className="global-search-box" style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              ref={searchInputRef}
              value={globalQuery}
              onChange={(e) => setGlobalQuery(e.target.value)}
              placeholder="Search movies, songs, TV episodes, creators... (Press /)"
            />
            {globalQuery && (
              <button onClick={() => setGlobalQuery('')} className="icon-pill" style={{ padding: '2px 6px' }}>
                <X size={13} />
              </button>
            )}

            {globalSearchMatches && (
              <div
                className="panel"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  left: 0,
                  right: 0,
                  zIndex: 80,
                  maxHeight: 420,
                  overflowY: 'auto',
                  boxShadow: '0 22px 60px rgba(0,0,0,0.85)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.82rem', color: 'var(--accent-gold)' }}>
                    Instant Matches
                  </strong>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="chip" onClick={() => { navigateTo('movies'); setGlobalQuery(''); }}>
                      Search Movies
                    </button>
                    <button className="chip" onClick={() => { navigateTo('songs'); setGlobalQuery(''); }}>
                      Search Songs
                    </button>
                  </div>
                </div>

                {globalSearchMatches.allPlayables.map((m) => (
                  <button
                    key={m.id}
                    className="track-row"
                    style={{ textAlign: 'left', width: '100%' }}
                    onClick={() => {
                      handlePlayVideo(m);
                      setGlobalQuery('');
                    }}
                  >
                    <img src={m.poster || m.thumb} alt={m.title} className="track-art" style={{ width: 44, height: 44 }} />
                    <div className="track-info">
                      <div className="track-title">{m.title}</div>
                      <div className="track-artist">{m.channel || m.network} • {m.genre || m.category}</div>
                    </div>
                  </button>
                ))}

                {globalSearchMatches.creators.map((c) => (
                  <button
                    key={c.id}
                    className="track-row"
                    style={{ textAlign: 'left', width: '100%' }}
                    onClick={() => {
                      navigateTo('creators');
                      setGlobalQuery('');
                    }}
                  >
                    <img src={c.avatar} alt={c.name} className="track-art" style={{ width: 44, height: 44, borderRadius: '50%' }} />
                    <div className="track-info">
                      <div className="track-title">{c.name}</div>
                      <div className="track-artist">{c.category} • {c.subsLabel} subs</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="topbar-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => setSettingsOpen(true)}>
              <Settings size={14} />
              <span className="hide-sm">Settings</span>
            </button>
            <a
              href={getViralyticsConnectUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm"
            >
              <Link2 size={14} /> Get Connect
            </a>
          </div>
        </header>

        <main className="page-content">
          {activeTab === 'home' && (
            <HomeView
              onPlayVideo={handlePlayVideo}
              onToggleVault={handleToggleVault}
              vaultIds={vaultIds}
              onNavigate={navigateTo}
              onSendTopicToAi={(topic, niche) => {
                setAiInitialTopic({ topic, niche });
                navigateTo('ai');
              }}
              stats={{ vaultCount: vault.length }}
            />
          )}
          {activeTab === 'movies' && (
            <MoviesView
              onPlayVideo={handlePlayVideo}
              onToggleVault={handleToggleVault}
              vaultIds={vaultIds}
              onToast={showToast}
            />
          )}
          {activeTab === 'tv' && (
            <TvEpisodesView
              onPlayVideo={handlePlayVideo}
              onToggleVault={handleToggleVault}
              vaultIds={vaultIds}
              onToast={showToast}
            />
          )}
          {activeTab === 'songs' && (
            <SongsView
              currentTrack={currentTrack}
              isPlaying={isAudioPlaying}
              onPlayTrack={handlePlayTrack}
              onPlayVideo={handlePlayVideo}
              onToast={showToast}
            />
          )}
          {activeTab === 'live' && (
            <LiveView onPlayVideo={handlePlayVideo} onPlayTrack={handlePlayTrack} />
          )}
          {activeTab === 'creators' && (
            <CreatorsCategoriesView
              onPlayVideo={handlePlayVideo}
              followingIds={followingIds}
              onToggleFollow={handleToggleFollow}
            />
          )}
          {activeTab === 'study' && (
            <StudyView onPlayVideo={handlePlayVideo} onPlayTrack={handlePlayTrack} />
          )}
          {activeTab === 'ai' && (
            <AiStudioView
              initialTopic={aiInitialTopic}
              onSaveIdea={handleSaveIdea}
              onToast={showToast}
            />
          )}
          {activeTab === 'myspace' && (
            <MySpaceView
              vault={vault}
              history={history}
              following={following}
              savedIdeas={savedIdeas}
              onPlayVideo={handlePlayVideo}
              onToggleVault={handleToggleVault}
              onToggleFollow={handleToggleFollow}
              onDeleteIdea={handleDeleteIdea}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Dock */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        {[
          { id: 'home', label: 'Home', icon: Flame },
          { id: 'movies', label: 'Movies', icon: Film },
          { id: 'tv', label: 'TV', icon: Tv },
          { id: 'songs', label: 'Songs', icon: Music2 },
          { id: 'ai', label: 'AI Studio', icon: Sparkles },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`mobile-nav-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => navigateTo(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Persistent Bottom Audio Player */}
      <MiniAudioPlayer
        track={currentTrack}
        isPlaying={isAudioPlaying}
        onTogglePlay={() => setIsAudioPlaying((p) => !p)}
        onNext={handleAudioNext}
        onPrev={handleAudioPrev}
        repeat={repeat}
        onToggleRepeat={() => setRepeat((r) => !r)}
        shuffle={shuffle}
        onToggleShuffle={() => setShuffle((s) => !s)}
        onClose={() => {
          setIsAudioPlaying(false);
          setCurrentTrack(null);
        }}
        onToast={showToast}
      />

      {/* Floating Yummy AI Assistant */}
      <YummyAssistant
        onNavigate={navigateTo}
        onQuickSearch={(q) => {
          setGlobalQuery(q);
          searchInputRef.current?.focus();
        }}
      />

      {/* Cinematic Theater Player Modal */}
      <TheaterPlayerModal
        item={theaterItem}
        onClose={() => setTheaterItem(null)}
        onToggleVault={handleToggleVault}
        isInVault={theaterItem ? vaultIds.has(theaterItem.id) : false}
        onToast={showToast}
      />

      {/* Settings & Viralytics Connect Modal */}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onToast={showToast}
      />

      {/* Toast Notification */}
      {toastMsg && <div className="toast">{toastMsg}</div>}
    </div>
  );
}
