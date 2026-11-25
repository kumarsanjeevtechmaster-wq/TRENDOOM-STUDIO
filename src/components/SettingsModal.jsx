import React, { useState } from 'react';
import { X, KeyRound, Link2, CheckCircle2, Download } from 'lucide-react';
import {
  exportUserData,
  getSettings,
  getViralyticsConnectUrl,
  saveSettings,
} from '../services/viralyticsBridge';

export default function SettingsModal({ open, onClose, onToast }) {
  const [form, setForm] = useState(() => getSettings());

  if (!open) return null;

  const handleSave = (e) => {
    e.preventDefault();
    saveSettings(form);
    onToast('Settings & API keys safely browser me save ho gayi!');
    onClose();
  };

  const handleExport = () => {
    const data = exportUserData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trendoom-studio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onToast('Vault, History & Saved Ideas JSON download ho gaya!');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="theater-modal"
        style={{ width: 'min(640px, 100%)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <KeyRound size={18} color="var(--accent-gold)" />
            <strong>TRENDOOM Studio & Viralytics Bridge Settings</strong>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={15} /> Close
          </button>
        </div>

        <form onSubmit={handleSave} className="theater-body">
          <div
            className="panel"
            style={{ background: 'rgba(139, 92, 246, 0.08)', borderColor: 'rgba(139, 92, 246, 0.3)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div>
                <strong>Viralytics Account Connect</strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 3 }}>
                  Instagram, YouTube, Facebook aur Threads auto-publishing connect karein.
                </div>
              </div>
              <a
                href={getViralyticsConnectUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
              >
                <Link2 size={14} /> Connect Viralytics
              </a>
            </div>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.83rem' }}>
            <span>Viralytics Base URL (Deployment / Integration Target)</span>
            <input
              value={form.viralyticsBaseUrl}
              onChange={(e) => setForm({ ...form, viralyticsBaseUrl: e.target.value })}
              placeholder="https://viralytics.co.in"
              className="filter-select"
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.83rem' }}>
            <span>Optional: YouTube Data API v3 Key (Unlocks Live YouTube Search in Movies/Songs/Live)</span>
            <input
              type="password"
              value={form.youtubeApiKey}
              onChange={(e) => setForm({ ...form, youtubeApiKey: e.target.value })}
              placeholder="AIza... (optional — app works without key too)"
              className="filter-select"
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.83rem' }}>
            <span>Optional: Gemini API Key (Unlocks Live LLM Responses in AI Studio)</span>
            <input
              type="password"
              value={form.geminiApiKey}
              onChange={(e) => setForm({ ...form, geminiApiKey: e.target.value })}
              placeholder="AIza... (optional — built-in Hinglish engine works offline too)"
              className="filter-select"
            />
          </label>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10, marginTop: 6 }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleExport}>
              <Download size={14} /> Export Vault & Ideas Backup
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <CheckCircle2 size={14} /> Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
