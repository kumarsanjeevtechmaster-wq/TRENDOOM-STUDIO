import React, { useEffect, useState } from 'react';
import { Sparkles, Search, CheckCircle2, XCircle, Bookmark, Send, BarChart3 } from 'lucide-react';
import { generateViralIdeas, run12PointSeoAudit } from '../services/aiEngine';
import { sendToViralyticsStudio } from '../services/viralyticsBridge';

export default function AiStudioView({ initialTopic, onSaveIdea, onToast }) {
  const [topic, setTopic] = useState(initialTopic?.topic || 'AI Video Editing Tools 2026');
  const [niche, setNiche] = useState(initialTopic?.niche || 'Technology & AI');
  const [language, setLanguage] = useState('hinglish');
  const [format, setFormat] = useState('shorts');
  const [ideasResult, setIdeasResult] = useState(null);
  const [generating, setGenerating] = useState(false);

  // 12-Point SEO Scorer State
  const [seoUrl, setSeoUrl] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [seoTags, setSeoTags] = useState('trendoom, viralytics, hindi');
  const [seoReport, setSeoReport] = useState(null);

  useEffect(() => {
    if (initialTopic?.topic) {
      setTopic(initialTopic.topic);
      setNiche(initialTopic.niche || 'General');
    }
  }, [initialTopic]);

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    setGenerating(true);
    try {
      const res = await generateViralIdeas({ topic, language, format, niche });
      setIdeasResult(res);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSeoAudit = (e) => {
    e.preventDefault();
    const audit = run12PointSeoAudit({
      url: seoUrl,
      title: seoTitle,
      description: seoDesc,
      tags: seoTags,
    });
    setSeoReport(audit);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="section-head">
        <div>
          <h1 className="section-title">
            <Sparkles size={22} color="var(--accent-gold)" /> Viralytics AI Creator & SEO Studio
          </h1>
          <p className="section-sub">
            5 Viral Hooks + 3 CTR Titles + Thumbnail Text + Script Outline + 12-Point SEO Audit
          </p>
        </div>
      </div>

      {/* Idea & Script Generator */}
      <form onSubmit={handleGenerate} className="tab-toolbar">
        <div className="tab-toolbar-top">
          <div className="tab-search-input-wrap">
            <Search size={16} color="var(--text-muted)" />
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Apna video topic ya trend likhein (e.g. Budget Phone under 20K)..."
            />
          </div>

          <select className="filter-select" value={niche} onChange={(e) => setNiche(e.target.value)}>
            <option value="Technology & AI">Technology & AI</option>
            <option value="Entertainment & Cinema">Entertainment & Cinema</option>
            <option value="Finance & Business">Finance & Business</option>
            <option value="Education & Study">Education & Study</option>
            <option value="Gaming & eSports">Gaming & eSports</option>
            <option value="Lifestyle & Vlogs">Lifestyle & Vlogs</option>
          </select>

          <select className="filter-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="hinglish">हिंदी / Hinglish</option>
            <option value="english">English</option>
            <option value="bengali">বাংলা / Banglish</option>
          </select>

          <select className="filter-select" value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="shorts">Shorts / Reels (60s)</option>
            <option value="long">YouTube Long Video</option>
            <option value="carousel">Carousel / Post</option>
          </select>

          <button type="submit" className="btn btn-primary" disabled={generating}>
            <Sparkles size={15} /> {generating ? 'Generating...' : 'Generate 5 Ideas'}
          </button>
        </div>
      </form>

      {ideasResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <strong style={{ fontSize: '0.92rem' }}>Generated Concepts ({ideasResult.ideas.length})</strong>
            <span className="badge badge-mint">{ideasResult.engine}</span>
          </div>

          <div className="media-grid">
            {ideasResult.ideas.map((idea, i) => (
              <div key={i} className="panel" style={{ gap: 11 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-gold">Concept #{i + 1}</span>
                  <span className="badge badge-mint">CTR {idea.estimatedCtrScore}%</span>
                </div>

                <div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    3-SECOND HOOK
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '0.88rem', fontWeight: 600 }}>
                    “{idea.hook}”
                  </p>
                </div>

                <div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    THUMBNAIL TEXT
                  </div>
                  <span className="badge badge-coral" style={{ marginTop: 4 }}>
                    {idea.thumbnailText}
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    3 TITLE OPTIONS
                  </div>
                  <ul style={{ margin: '5px 0 0', paddingLeft: 18, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {idea.titles.map((t, ti) => (
                      <li key={ti}>{t}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    SCRIPT OUTLINE
                  </div>
                  <ul style={{ margin: '5px 0 0', paddingLeft: 18, fontSize: '0.77rem', color: 'var(--text-muted)' }}>
                    {idea.outline.map((step, si) => (
                      <li key={si}>{step}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', gap: 8, paddingTop: 8 }}>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => {
                      const url = sendToViralyticsStudio({
                        title: idea.titles[0],
                        topic,
                        hook: idea.hook,
                      });
                      onToast('Concept Viralytics Studio me bhej diya gaya!');
                      window.open(url, '_blank', 'noopener');
                    }}
                  >
                    <Send size={13} /> Send to Viralytics
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      onSaveIdea({
                        id: `idea-${Date.now()}-${i}`,
                        topic,
                        hook: idea.hook,
                        title: idea.titles[0],
                        thumbnailText: idea.thumbnailText,
                      });
                    }}
                  >
                    <Bookmark size={13} /> Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 12-Point Free SEO Report */}
      <section className="panel">
        <div className="section-head">
          <div>
            <h2 className="section-title">
              <BarChart3 size={20} color="var(--accent-mint)" /> Free 12-Point Video SEO Audit
            </h2>
            <p className="section-sub">
              Apne YouTube Video, Shorts ya Reel ka link + Title/Description paste karein aur instant SEO score payein
            </p>
          </div>
        </div>

        <form onSubmit={handleSeoAudit} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          <div className="split-2">
            <input
              className="filter-select"
              value={seoUrl}
              onChange={(e) => setSeoUrl(e.target.value)}
              placeholder="Video URL (YouTube / Reel / Shorts)"
            />
            <input
              className="filter-select"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="Video Title (e.g. 5 AI Hacks Nobody Knows in 2026)"
            />
          </div>
          <div className="split-2">
            <input
              className="filter-select"
              value={seoDesc}
              onChange={(e) => setSeoDesc(e.target.value)}
              placeholder="Description first 2 lines + 0:00 chapters + comment CTA..."
            />
            <input
              className="filter-select"
              value={seoTags}
              onChange={(e) => setSeoTags(e.target.value)}
              placeholder="Comma-separated hashtags/tags..."
            />
          </div>
          <div>
            <button type="submit" className="btn btn-coral btn-sm">
              Run 12-Point SEO Report
            </button>
          </div>
        </form>

        {seoReport && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.8rem',
                  fontWeight: 800,
                  color: seoReport.score >= 70 ? 'var(--accent-mint)' : 'var(--accent-gold)',
                }}
              >
                {seoReport.score}/100
              </div>
              <div>
                <strong>
                  {seoReport.passed} of {seoReport.total} SEO Checks Passed
                </strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  AI Suggested Rewrite: <span style={{ color: 'var(--accent-gold)' }}>{seoReport.improvedTitle}</span>
                </div>
              </div>
            </div>

            <div className="media-grid">
              {seoReport.checks.map((c) => (
                <div
                  key={c.name}
                  style={{
                    background: 'var(--bg-card)',
                    padding: 11,
                    borderRadius: 11,
                    border: `1px solid ${c.pass ? 'rgba(44,234,163,0.28)' : 'rgba(255,59,92,0.28)'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.83rem', fontWeight: 700 }}>
                    {c.pass ? (
                      <CheckCircle2 size={15} color="var(--accent-mint)" />
                    ) : (
                      <XCircle size={15} color="var(--accent-coral)" />
                    )}
                    <span>{c.name}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    {c.tip}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
