import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Sparkles,
  Bookmark,
  Share2,
  ExternalLink,
  Microscope,
  PictureInPicture2,
  Gauge,
  Film,
  Tv,
} from 'lucide-react';
import { resolveArchiveMp4 } from '../services/mediaEngine';
import { analyzeWhyViral } from '../services/aiEngine';
import {
  getWatchProgress,
  saveWatchProgress,
  sendToViralyticsStudio,
} from '../services/viralyticsBridge';

export default function TheaterPlayerModal({
  item,
  onClose,
  onToggleVault,
  isInVault,
  onToast,
}) {
  const videoRef = useRef(null);
  const [mp4Info, setMp4Info] = useState(null);
  const [playerMode, setPlayerMode] = useState('auto'); // 'auto' | 'embed'
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showWhyViral, setShowWhyViral] = useState(false);
  const [ambientOn, setAmbientOn] = useState(true);
  const [resumeSec, setResumeSec] = useState(null);

  useEffect(() => {
    if (!item) return;
    setShowWhyViral(false);
    setPlayerMode('auto');
    setMp4Info(null);

    const prev = getWatchProgress(item.id);
    setResumeSec(prev && prev.seconds > 15 ? prev.seconds : null);

    if (item.directMp4) {
      setMp4Info({ mp4Url: item.directMp4 });
    } else if (item.source === 'archive' && item.archiveId) {
      resolveArchiveMp4(item.archiveId).then((res) => {
        if (res?.mp4Url) setMp4Info(res);
      });
    }
  }, [item]);

  if (!item) return null;

  const whyViral = showWhyViral ? analyzeWhyViral(item) : null;

  const handleRateChange = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const handlePiP = async () => {
    try {
      if (videoRef.current && document.pictureInPictureEnabled) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } else {
        onToast('Picture-in-Picture HTML5 direct MP4 playback me supported hai.');
      }
    } catch {
      onToast('PiP abhi browser me active nahi ho saka.');
    }
  };

  const handleViralytics = () => {
    const url = sendToViralyticsStudio({
      title: item.title,
      topic: item.genre || item.category || 'Entertainment',
      hook: `Watch & remix angle based on: ${item.title}`,
      url: item.embedUrl || window.location.href,
    });
    onToast('Viralytics Studio me idea bhej diya gaya!');
    window.open(url, '_blank', 'noopener');
  };

  const handleWhatsApp = () => {
    const text = `TRENDOOM Studio par ye dekho: ${item.title} 🔥 ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      onToast('Link clipboard me copy ho gaya!');
    } catch {
      onToast('Link copy karne me dikkat aayi.');
    }
  };

  const renderStage = () => {
    // 1. Direct MP4 stream (Internet Archive / iTunes Video Preview)
    if (
      playerMode !== 'embed' &&
      (mp4Info?.mp4Url || (item.isVideoPreview && item.audioUrl))
    ) {
      const src = mp4Info?.mp4Url || item.audioUrl;
      return (
        <video
          ref={videoRef}
          key={src}
          src={src}
          controls
          autoPlay
          playsInline
          poster={item.poster || item.thumb || item.artwork}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              videoRef.current.playbackRate = playbackRate;
              if (resumeSec && resumeSec < videoRef.current.duration - 10) {
                videoRef.current.currentTime = resumeSec;
              }
            }
          }}
          onTimeUpdate={() => {
            if (videoRef.current) {
              saveWatchProgress(item.id, videoRef.current.currentTime, videoRef.current.duration);
            }
          }}
        />
      );
    }

    // 2. Internet Archive Embed Fallback
    if (item.source === 'archive' && item.archiveId) {
      return (
        <iframe
          src={`https://archive.org/embed/${encodeURIComponent(item.archiveId)}?autoplay=1`}
          title={item.title}
          allowFullScreen
          allow="autoplay; fullscreen"
        />
      );
    }

    // 3. YouTube Official Playlist (Channel Uploads / Series / Movies)
    if (item.source === 'youtube-playlist' && item.playlistId) {
      return (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(
            item.playlistId
          )}&autoplay=1&rel=0`}
          title={item.title}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        />
      );
    }

    // 4. YouTube Single Video / Live Stream
    if (item.source === 'youtube-video' && item.videoId) {
      return (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(
            item.videoId
          )}?autoplay=1&rel=0`}
          title={item.title}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        />
      );
    }

    return (
      <div
        style={{
          height: '100%',
          display: 'grid',
          placeItems: 'center',
          padding: 24,
          textAlign: 'center',
          color: 'var(--text-secondary)',
        }}
      >
        <div>
          <Film size={40} color="var(--accent-gold)" />
          <p>Is source ke liye direct embed unavailable hai — neeche official source link use karein.</p>
        </div>
      </div>
    );
  };

  const externalFallbackUrl =
    item.source === 'youtube-playlist' && item.playlistId
      ? `https://www.youtube.com/playlist?list=${item.playlistId}`
      : item.source === 'youtube-video' && item.videoId
      ? `https://www.youtube.com/watch?v=${item.videoId}`
      : item.archiveId
      ? `https://archive.org/details/${item.archiveId}`
      : item.externalUrl || '#';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="theater-modal"
        style={
          ambientOn
            ? { boxShadow: '0 0 90px rgba(245, 166, 35, 0.22), 0 28px 90px rgba(0, 0, 0, 0.85)' }
            : undefined
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '13px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <span className="badge badge-gold">
              <Tv size={13} /> THEATER MODE
            </span>
            <strong
              style={{
                fontSize: '0.96rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {item.title}
            </strong>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            aria-label="Close theater player"
          >
            <X size={16} /> Close
          </button>
        </div>

        {/* Video Stage */}
        <div className="player-stage">{renderStage()}</div>

        {/* Controls & Creator Metadata */}
        <div className="theater-body">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            {item.source === 'archive' && (
              <>
                <button
                  className={`chip ${playerMode === 'auto' ? 'active' : ''}`}
                  onClick={() => setPlayerMode('auto')}
                >
                  🎬 Direct HD MP4 {mp4Info?.sizeMb ? `(${mp4Info.sizeMb} MB)` : ''}
                </button>
                <button
                  className={`chip ${playerMode === 'embed' ? 'active' : ''}`}
                  onClick={() => setPlayerMode('embed')}
                >
                  📺 Archive Embed Player
                </button>
              </>
            )}

            {mp4Info?.mp4Url && playerMode !== 'embed' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Gauge size={14} color="var(--accent-gold)" />
                {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    className={`chip ${playbackRate === rate ? 'active' : ''}`}
                    onClick={() => handleRateChange(rate)}
                  >
                    {rate}x
                  </button>
                ))}
                <button className="chip" onClick={handlePiP}>
                  <PictureInPicture2 size={14} /> PiP
                </button>
              </div>
            )}

            <button
              className={`chip ${ambientOn ? 'active' : ''}`}
              onClick={() => setAmbientOn((v) => !v)}
            >
              ✨ Ambient Glow
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div>
              <h3 style={{ margin: '0 0 6px', fontSize: '1.15rem' }}>{item.title}</h3>
              <div className="card-meta">
                <span>{item.channel || item.network || 'Official Studio'}</span>
                {item.genre && <span>• {item.genre}</span>}
                {item.year && <span>• {item.year}</span>}
                {item.duration && <span>• {item.duration}</span>}
                {item.views && <span>• {item.views}</span>}
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button className="btn btn-primary btn-sm" onClick={handleViralytics}>
                <Sparkles size={14} /> Send Idea to Viralytics
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowWhyViral((v) => !v)}
              >
                <Microscope size={14} /> {showWhyViral ? 'Hide Analysis' : 'Why Viral?'}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => onToggleVault(item)}>
                <Bookmark size={14} fill={isInVault ? 'currentColor' : 'none'} />
                {isInVault ? 'Saved' : 'Save Vault'}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={handleWhatsApp}>
                <Share2 size={14} /> WhatsApp
              </button>
              <button className="btn btn-ghost btn-sm" onClick={handleCopyLink}>
                Copy Link
              </button>
              {externalFallbackUrl !== '#' && (
                <a
                  className="btn btn-ghost btn-sm"
                  href={externalFallbackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink size={14} /> Source
                </a>
              )}
            </div>
          </div>

          {item.description || item.summary ? (
            <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              {String(item.description || item.summary).slice(0, 420)}
            </p>
          ) : null}

          {whyViral && (
            <div
              className="panel"
              style={{
                background: 'rgba(245, 166, 35, 0.06)',
                borderColor: 'var(--border-gold)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <strong style={{ color: 'var(--accent-gold)' }}>
                  🔬 AI Why-Viral Metadata Analysis
                </strong>
                <span className="badge badge-gold">Metadata Signal Audit</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                {whyViral.summary}
              </p>
              <div className="stats-strip">
                {whyViral.factors.map((f) => (
                  <div key={f.label} className="stat-tile">
                    <span className="stat-val" style={{ fontSize: '1.05rem', color: 'var(--accent-mint)' }}>
                      {f.score}/100
                    </span>
                    <span className="stat-label" style={{ color: 'var(--text-primary)' }}>
                      {f.label}
                    </span>
                    <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{f.note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
