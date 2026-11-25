# TRENDOOM Studio — Viralytics Integration Guide

## 1. Standalone Deployment on `viralytics.co.in/trendoom`
`vite.config.js` is configured with `base: './'`, so the production build generates relative asset paths.

```bash
npm install
npm run build
```

Upload the contents of `dist/` directly into `/trendoom/` on your web server (`https://viralytics.co.in/trendoom/`).

## 2. Viralytics Bridge (`src/services/viralyticsBridge.js`)
- **Deep-Link Idea Bridge**: Clicking **"Send Idea to Viralytics"** or **"Create in Viralytics"** calls `sendToViralyticsStudio(payload)` which:
  1. Dispatches `window.parent.postMessage({ source: 'trendoom-studio', type: 'TRENDOOM_IDEA_BRIDGE', payload }, '*')` (for iframe / embedded shell integrations).
  2. Opens `https://viralytics.co.in/app/?tab=create&src=trendoom_studio&title=...&topic=...&hook=...`.
- **Account Connect**: Uses `https://viralytics.co.in/app/?tab=settings&src=trendoom_connect`.

## 3. Optional Live API Key Upgrades
Works 100% out-of-the-box with zero API keys (using Internet Archive, Audius, iTunes Search, and TVmaze CORS APIs + official YouTube channel playlist embeds). Users or admins can optionally configure a **YouTube Data API v3 Key** and **Gemini API Key** inside the in-app **Settings** modal.
