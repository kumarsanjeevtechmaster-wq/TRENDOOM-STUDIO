import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume2,
  VolumeX,
  Sparkles,
  X,
} from 'lucide-react';
import { sendToViralyticsStudio } from '../services/viralyticsBridge';

function formatTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function MiniAudioPlayer({
  track,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  repeat,
  onToggleRepeat,
  shuffle,
  onToggleShuffle,
  onClose,
  onToast,
}) {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !track) return;
    const src = track.audioUrl || track.streamUrl;
    if (!src) return;
    if (el.src !== src) {
      el.src = src;
      setCurrentTime(0);
    }
    if (isPlaying) {
      el.play().catch(() => {
        onToast('Browser autoplay blocked — Play button dabayein.');
      });
    } else {
      el.pause();
    }
  }, [track, isPlaying, onToast]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = muted;
    }
  }, [muted]);

  if (!track) return null;

  const pct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = ratio * duration;
  };

  return (
    <div className="mini-audio-dock">
      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => {
          if (repeat && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
          } else {
            onNext();
          }
        }}
      />

      <div className="mini-progress" onClick={handleSeek} title="Seek audio">
        <div className="mini-progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <img
        src={track.artwork || track.thumb}
        alt={track.title}
        className="track-art"
        style={{ width: 46, height: 46 }}
      />

      <div className="track-info">
        <div className="track-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span>{track.title}</span>
          <span className={`badge ${track.isFullLength ? 'badge-mint' : 'badge-gold'}`}>
            {track.isFullLength ? 'FULL TRACK' : track.source === 'audio-stream' ? 'LIVE RADIO' : '30s PREVIEW'}
          </span>
        </div>
        <div className="track-artist">
          {track.artist || track.channel} • {formatTime(currentTime)} / {formatTime(duration || track.durationSec)}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          className={`icon-pill ${shuffle ? 'gold' : ''}`}
          onClick={onToggleShuffle}
          title="Shuffle"
        >
          <Shuffle size={14} />
        </button>
        <button className="icon-pill" onClick={onPrev} title="Previous">
          <SkipBack size={15} />
        </button>
        <button
          className="btn btn-primary btn-sm"
          style={{ borderRadius: '99px', width: 38, height: 38, padding: 0 }}
          onClick={onTogglePlay}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button className="icon-pill" onClick={onNext} title="Next">
          <SkipForward size={15} />
        </button>
        <button
          className={`icon-pill ${repeat ? 'gold' : ''}`}
          onClick={onToggleRepeat}
          title="Repeat"
        >
          <Repeat size={14} />
        </button>
        <button
          className="icon-pill"
          onClick={() => setMuted((m) => !m)}
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
        <button
          className="icon-pill gold"
          title="Use sound idea in Viralytics"
          onClick={() => {
            const url = sendToViralyticsStudio({
              title: `Reel Idea with "${track.title}"`,
              topic: track.genre || 'Music',
              hook: `Background music vibe: ${track.title} by ${track.artist}`,
            });
            window.open(url, '_blank', 'noopener');
          }}
        >
          <Sparkles size={14} />
        </button>
        <button className="icon-pill" onClick={onClose} title="Close Player">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
