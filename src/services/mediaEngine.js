/**
 * Multi-Source Live Media Fetcher for TRENDOOM Studio
 * Uses open CORS-friendly endpoints:
 * - Internet Archive (Full public-domain movies, classic TV episodes & direct MP4 streams)
 * - Audius Public API (Full-length streaming songs, zero API key)
 * - iTunes Search API (Bollywood/Regional/Global songs, 30s previews, Music Videos & Podcasts)
 * - TVmaze API (Live TV/Web schedules, show seasons & full episode guides)
 * - Optional YouTube Data API v3 / TMDB API upgrade if user adds keys in Settings
 */

import { getSettings } from './viralyticsBridge';

const CACHE = new Map();

async function fetchJsonCached(url, ttlMs = 120000) {
  const hit = CACHE.get(url);
  if (hit && Date.now() - hit.ts < ttlMs) {
    return hit.data;
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const data = await res.json();
  CACHE.set(url, { ts: Date.now(), data });
  return data;
}

/**
 * 1. INTERNET ARCHIVE — Full Movies & Classic TV Episodes
 */
export async function fetchArchiveCinema({
  query = '',
  genre = 'All',
  era = 'All',
  sort = 'downloads desc',
  collection = 'feature_films',
  rows = 18,
  page = 1,
} = {}) {
  const clauses = ['mediatype:movies'];
  if (collection && collection !== 'all') {
    clauses.push(`collection:${collection}`);
  }
  if (genre && genre !== 'All') {
    if (genre === 'Classic Bollywood' || genre === 'Hindi') {
      clauses.push('(hindi OR bollywood OR india)');
    } else {
      clauses.push(`subject:(${genre})`);
    }
  }
  if (era === 'Classic') {
    clauses.push('year:[1920 TO 1999]');
  } else if (era === '2010s') {
    clauses.push('year:[2010 TO 2019]');
  } else if (era === '2020s') {
    clauses.push('year:[2020 TO 2026]');
  }
  if (query && query.trim()) {
    clauses.push(`(${query.trim()})`);
  }

  const q = clauses.join(' AND ');
  const params = new URLSearchParams({
    q,
    output: 'json',
    rows: String(rows),
    page: String(page),
    'sort[]': sort,
  });
  ['identifier', 'title', 'description', 'year', 'downloads', 'subject', 'creator', 'runtime'].forEach((f) =>
    params.append('fl[]', f)
  );

  const url = `https://archive.org/advancedsearch.php?${params.toString()}`;
  const data = await fetchJsonCached(url);
  const docs = data?.response?.docs || [];

  return docs.map((d) => ({
    id: `ia-${d.identifier}`,
    archiveId: d.identifier,
    title: d.title || d.identifier,
    channel: Array.isArray(d.creator) ? d.creator[0] : d.creator || 'Internet Archive Cinema',
    genre: Array.isArray(d.subject) ? d.subject[0] : d.subject || genre || 'Feature Film',
    year: d.year || 'Archive',
    duration: d.runtime || 'Full Feature',
    views: d.downloads ? `${Number(d.downloads).toLocaleString()} views` : 'Full Stream',
    downloads: Number(d.downloads || 0),
    description: Array.isArray(d.description) ? d.description[0] : d.description || 'Full-length stream via Internet Archive.',
    poster: `https://archive.org/services/img/${d.identifier}`,
    embedUrl: `https://archive.org/embed/${d.identifier}`,
    source: 'archive',
    rating: '7.6',
    language: genre === 'Classic Bollywood' ? 'Hindi' : 'English',
  }));
}

/**
 * Resolve direct MP4 playable files from Internet Archive Metadata API
 */
export async function resolveArchiveMp4(identifier) {
  if (!identifier) return null;
  try {
    const data = await fetchJsonCached(`https://archive.org/metadata/${encodeURIComponent(identifier)}`, 300000);
    const files = data?.files || [];
    const mp4 =
      files.find((f) => f.format === 'h.264 IA' || (f.name && f.name.endsWith('.mp4') && f.format === 'MPEG4')) ||
      files.find((f) => f.name && f.name.toLowerCase().endsWith('.mp4'));
    if (!mp4) return null;
    return {
      mp4Url: `https://archive.org/download/${identifier}/${encodeURIComponent(mp4.name).replace(/%2F/g, '/')}`,
      sizeMb: mp4.size ? Math.round(Number(mp4.size) / (1024 * 1024)) : null,
      length: mp4.length || null,
    };
  } catch {
    return null;
  }
}

/**
 * 2. AUDIUS PUBLIC API — Full-Length Free Music Streaming (Zero API Key)
 */
export async function fetchAudiusTracks({ query = '', genre = '', limit = 16 } = {}) {
  const appName = 'TRENDOOM_STUDIO';
  let url = '';
  if (query && query.trim()) {
    url = `https://api.audius.co/v1/tracks/search?query=${encodeURIComponent(query.trim())}&app_name=${appName}`;
  } else {
    const genreParam = genre && genre !== 'All' ? `&genre=${encodeURIComponent(genre)}` : '';
    url = `https://api.audius.co/v1/tracks/trending?app_name=${appName}${genreParam}`;
  }

  const data = await fetchJsonCached(url);
  const tracks = (data?.data || []).slice(0, limit);

  return tracks.map((t) => ({
    id: `aud-${t.id}`,
    trackId: t.id,
    title: t.title,
    artist: t.user?.name || 'Indie Artist',
    album: t.mood || t.genre || 'Audius Full Track',
    genre: t.genre || 'Electronic',
    language: 'Global / Indie',
    durationSec: t.duration || 180,
    artwork:
      t.artwork?.['480x480'] ||
      t.artwork?.['150x150'] ||
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80',
    audioUrl: `https://api.audius.co/v1/tracks/${t.id}/stream?app_name=${appName}`,
    isFullLength: true,
    source: 'audius',
    plays: t.play_count || 0,
  }));
}

/**
 * 3. ITUNES SEARCH API — Bollywood, Regional, Global Songs, Music Videos & Podcasts
 */
export async function fetchItunesCatalog({
  term = 'Arijit Singh',
  entity = 'song',
  country = 'IN',
  limit = 20,
} = {}) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=${encodeURIComponent(
    entity
  )}&country=${encodeURIComponent(country)}&limit=${limit}`;
  const data = await fetchJsonCached(url);
  const items = data?.results || [];

  return items.map((item, idx) => {
    const hiResArt = (item.artworkUrl100 || '').replace('100x100bb', '600x600bb');
    if (entity === 'podcast') {
      return {
        id: `pod-${item.collectionId || idx}`,
        title: item.collectionName || item.trackName,
        artist: item.artistName || 'Podcast Creator',
        genre: item.primaryGenreName || 'Podcast',
        artwork: hiResArt,
        feedUrl: item.feedUrl || '',
        externalUrl: item.collectionViewUrl || '',
        episodeCount: item.trackCount || 0,
        source: 'itunes-podcast',
      };
    }

    return {
      id: `it-${item.trackId || idx}`,
      title: item.trackName || item.collectionName,
      artist: item.artistName || 'Artist',
      album: item.collectionName || 'Single',
      genre: item.primaryGenreName || 'Music',
      language: country === 'IN' ? 'Indian / Hindi' : 'Global',
      releaseYear: item.releaseDate ? item.releaseDate.slice(0, 4) : '2025',
      durationSec: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 30,
      artwork: hiResArt,
      audioUrl: item.previewUrl || '',
      isVideoPreview: entity === 'musicVideo',
      isFullLength: false,
      source: entity === 'musicVideo' ? 'itunes-video' : 'itunes',
      externalUrl: item.trackViewUrl || '',
    };
  });
}

/**
 * 4. TVMAZE API — Real Shows, Schedules & Complete Season/Episode Lists
 */
export async function fetchTvMazeShows(query = '') {
  if (query && query.trim()) {
    const data = await fetchJsonCached(
      `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query.trim())}`
    );
    return (data || []).map((entry) => normalizeTvMazeShow(entry.show));
  }

  const today = new Date().toISOString().slice(0, 10);
  const data = await fetchJsonCached(`https://api.tvmaze.com/schedule/web?date=${today}`);
  const seen = new Set();
  const unique = [];
  for (const ep of data || []) {
    const show = ep?._embedded?.show || ep?.show;
    if (show && !seen.has(show.id)) {
      seen.add(show.id);
      unique.push(normalizeTvMazeShow(show, ep));
    }
    if (unique.length >= 16) break;
  }
  return unique;
}

function normalizeTvMazeShow(show, latestEp = null) {
  return {
    id: `tvm-${show.id}`,
    tvmazeId: show.id,
    title: show.name,
    network: show.webChannel?.name || show.network?.name || 'OTT Web Series',
    category: (show.genres && show.genres[0]) || show.type || 'Drama',
    genres: show.genres || [],
    rating: show.rating?.average ? String(show.rating.average) : '8.0',
    status: show.status || 'Running',
    poster:
      show.image?.original ||
      show.image?.medium ||
      'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=600&q=80',
    summary: (show.summary || '').replace(/<[^>]+>/g, '') || 'Official series episode guide & stream hub.',
    latestEpisodeLabel: latestEp ? `S${latestEp.season}E${latestEp.number}: ${latestEp.name}` : show.premiered || '',
    source: 'tvmaze',
  };
}

export async function fetchTvMazeEpisodes(tvmazeId) {
  const eps = await fetchJsonCached(`https://api.tvmaze.com/shows/${tvmazeId}/episodes`, 300000);
  return (eps || []).map((e) => ({
    id: e.id,
    season: e.season,
    number: e.number,
    name: e.name,
    airdate: e.airdate,
    runtime: e.runtime || 42,
    image: e.image?.medium || '',
    summary: (e.summary || '').replace(/<[^>]+>/g, ''),
  }));
}

/**
 * 5. OPTIONAL YOUTUBE DATA API v3 UPGRADE (if user enters API key in Settings)
 */
export async function searchYouTubeWithUserKey({ query, type = 'video', maxResults = 12, eventType = '' }) {
  const { youtubeApiKey } = getSettings();
  if (!youtubeApiKey || !youtubeApiKey.trim()) return null;

  const params = new URLSearchParams({
    part: 'snippet',
    q: query,
    type,
    maxResults: String(maxResults),
    key: youtubeApiKey.trim(),
  });
  if (eventType) params.set('eventType', eventType);

  const data = await fetchJsonCached(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`, 60000);
  return (data.items || []).map((it) => ({
    id: `yt-${it.id?.videoId || it.etag}`,
    videoId: it.id?.videoId,
    title: it.snippet?.title,
    channel: it.snippet?.channelTitle,
    description: it.snippet?.description,
    published: it.snippet?.publishedAt?.slice(0, 10),
    thumb: it.snippet?.thumbnails?.high?.url || it.snippet?.thumbnails?.medium?.url,
    poster: it.snippet?.thumbnails?.high?.url,
    source: 'youtube-video',
  }));
}
