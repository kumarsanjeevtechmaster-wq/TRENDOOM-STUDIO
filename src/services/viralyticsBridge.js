/**
 * Viralytics Integration & Persistence Bridge
 * Connects TRENDOOM Studio seamlessly to viralytics.co.in/app and localStorage.
 */

const KEYS = {
  VAULT: 'trendoom_v2_vault',
  HISTORY: 'trendoom_v2_history',
  FOLLOWING: 'trendoom_v2_following',
  IDEAS: 'trendoom_v2_ideas',
  PROGRESS: 'trendoom_v2_progress',
  SETTINGS: 'trendoom_v2_settings',
  INTERESTS: 'trendoom_v2_interests',
  ACCOUNT: 'trendoom_v2_account',
};

export function readStore(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export const storeKeys = KEYS;

export function getSettings() {
  return readStore(KEYS.SETTINGS, {
    language: 'hinglish',
    youtubeApiKey: '',
    tmdbApiKey: '',
    geminiApiKey: '',
    viralyticsBaseUrl: 'https://viralytics.co.in',
    autoplayNext: true,
    theaterAmbient: true,
  });
}

export function saveSettings(next) {
  writeStore(KEYS.SETTINGS, next);
}

/**
 * Sends a video, song, trend, or generated script directly into Viralytics Studio.
 * Works both as an embedded module (via postMessage) and standalone (deep-link URL).
 */
export function sendToViralyticsStudio(payload) {
  const settings = getSettings();
  const base = (settings.viralyticsBaseUrl || 'https://viralytics.co.in').replace(/\/$/, '');

  // Emit postMessage if mounted inside Viralytics shell or iframe
  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          source: 'trendoom-studio',
          type: 'TRENDOOM_IDEA_BRIDGE',
          payload,
        },
        '*'
      );
    }
    window.dispatchEvent(new CustomEvent('trendoom:viralytics-bridge', { detail: payload }));
  } catch {
    // Ignore cross-origin postMessage restrictions
  }

  const params = new URLSearchParams({
    tab: 'create',
    src: 'trendoom_studio',
    title: String(payload.title || '').slice(0, 140),
    topic: String(payload.topic || payload.category || '').slice(0, 80),
    hook: String(payload.hook || '').slice(0, 180),
    refUrl: String(payload.url || '').slice(0, 200),
  });

  return `${base}/app/?${params.toString()}`;
}

export function getViralyticsConnectUrl() {
  const settings = getSettings();
  const base = (settings.viralyticsBaseUrl || 'https://viralytics.co.in').replace(/\/$/, '');
  return `${base}/app/?tab=settings&src=trendoom_connect`;
}

export function saveWatchProgress(itemId, seconds, duration) {
  if (!itemId || !Number.isFinite(seconds)) return;
  const map = readStore(KEYS.PROGRESS, {});
  map[itemId] = {
    seconds: Math.floor(seconds),
    duration: Math.floor(duration || 0),
    updatedAt: Date.now(),
  };
  writeStore(KEYS.PROGRESS, map);
}

export function getWatchProgress(itemId) {
  const map = readStore(KEYS.PROGRESS, {});
  return map[itemId] || null;
}

export function exportUserData() {
  return {
    version: '2.0',
    exportedAt: new Date().toISOString(),
    vault: readStore(KEYS.VAULT, []),
    history: readStore(KEYS.HISTORY, []),
    following: readStore(KEYS.FOLLOWING, []),
    ideas: readStore(KEYS.IDEAS, []),
    interests: readStore(KEYS.INTERESTS, []),
  };
}
