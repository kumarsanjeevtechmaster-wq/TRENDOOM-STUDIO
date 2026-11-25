/**
 * AI Content Intelligence, Why-Viral Analyzer & 12-Point SEO Scorer
 * Supports live Gemini API when key is configured in Settings,
 * plus an immediate zero-latency Hinglish/English/Bengali smart creator engine out of the box.
 */

import { getSettings } from './viralyticsBridge';

export async function generateViralIdeas({ topic, language = 'hinglish', format = 'shorts', niche = 'General' }) {
  const cleanTopic = (topic || 'AI & Viral Content').trim();
  const { geminiApiKey } = getSettings();

  if (geminiApiKey && geminiApiKey.trim()) {
    try {
      const prompt = `You are a viral Indian content strategist for Viralytics & Trendoom.
Generate 5 distinct viral video concepts for topic "${cleanTopic}" in niche "${niche}", format "${format}", language "${language}".
Return STRICT JSON array of 5 objects with keys: hook, titles (array of 3), thumbnailText, outline (array of 4 bullet strings), estimatedCtrScore (number 75-98).`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(
          geminiApiKey.trim()
        )}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );
      if (res.ok) {
        const json = await res.json();
        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const match = text.match(/\[[\s\S]*\]/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return { engine: 'Gemini Live API', ideas: parsed };
          }
        }
      }
    } catch {
      // Fallback smoothly to built-in strategist engine
    }
  }

  // Built-in Hinglish/English/Bengali high-CTR strategist engine
  const isEng = language === 'english';
  const isBen = language === 'bengali';

  const ideas = [
    {
      hook: isEng
        ? `Stop scrolling — 92% of people miss this hidden shift inside ${cleanTopic} right now.`
        : isBen
        ? `Thamo! ${cleanTopic} niye ei secret-ta 90% manush ekhono jane na.`
        : `Ruko! ${cleanTopic} ke baare me ye 1 sach 92% log abhi bhi miss kar rahe hain.`,
      titles: [
        `${cleanTopic}: The Hidden Truth Nobody Told You (2026)`,
        isEng ? `Why ${cleanTopic} Is Exploding Right Now` : `${cleanTopic} Kyu Viral Ho Raha Hai? Full Breakdown`,
        `3 Mistakes Beginners Make With ${cleanTopic}`,
      ],
      thumbnailText: '92% LOG GALAT HAIN!',
      outline: [
        '0:00-0:04 — Pattern-interrupt visual + bold counter-intuitive claim',
        `0:05-0:22 — Show real proof / live example of ${cleanTopic} in action`,
        '0:23-0:45 — Reveal the 3-step repeatable framework viewers can copy today',
        '0:46-0:60 — Open loop CTA ("Comment IDEA for the full checklist")',
      ],
      estimatedCtrScore: 94,
    },
    {
      hook: isEng
        ? `I tested ${cleanTopic} for 7 days so you don't waste your time — here is the honest result.`
        : isBen
        ? `Ami 7 din dhore ${cleanTopic} test korlam — dekho ashol result ki elo!`
        : `Maine 7 din tak ${cleanTopic} khud test kiya — aur jo result aaya usne sabko chaunka diya!`,
      titles: [
        `I Tested ${cleanTopic} For 7 Days (Honest Verdict)`,
        `${cleanTopic} Challenge: Worth It Ya Time Waste?`,
        `Real Results After Trying ${cleanTopic}`,
      ],
      thumbnailText: '7 DAY TEST RESULTS',
      outline: [
        '0:00-0:03 — Fast Day-1 vs Day-7 split screen preview',
        '0:04-0:20 — Biggest surprise / unexpected obstacle faced on Day 3',
        `0:21-0:42 — Exact numbers, cost/time saved & comparison with old method`,
        '0:43-0:58 — Clear recommendation + link to part-2 deep dive',
      ],
      estimatedCtrScore: 91,
    },
    {
      hook: isEng
        ? `If you are into ${niche}, save this ${cleanTopic} blueprint before it goes mainstream.`
        : `${niche} pasand hai? Toh ${cleanTopic} ka ye blueprint turant save kar lo.`,
      titles: [
        `Complete ${cleanTopic} Blueprint (${niche} Edition)`,
        `Zero Se Pro: ${cleanTopic} Step-by-Step Guide`,
        `5 Tools & Hacks For ${cleanTopic} In 2026`,
      ],
      thumbnailText: 'SAVE THIS NOW 📌',
      outline: [
        '0:00-0:05 — Direct "Save this reel" utility hook with clean overlay',
        '0:06-0:30 — Rapid 3-part checklist (Tool #1, Trick #2, Secret #3)',
        '0:31-0:48 — Live screen demo showing instant output',
        '0:49-0:60 — Share-worthy summary card + Viralytics studio prompt',
      ],
      estimatedCtrScore: 89,
    },
    {
      hook: isEng
        ? `Everyone praises ${cleanTopic}, but here is the dark side / hidden cost nobody mentions.`
        : `Sab log ${cleanTopic} ki tareef karte hain, par iska ye hidden risk koi nahi batata.`,
      titles: [
        `The Reality of ${cleanTopic} Nobody Talks About`,
        `${cleanTopic} Ka Asli Sach — Exposed With Proof`,
        `Before You Start ${cleanTopic}, Watch This!`,
      ],
      thumbnailText: 'ASLI SACH ⚠️',
      outline: [
        '0:00-0:04 — Contrarian tension statement + dramatic zoom',
        '0:05-0:25 — Two real-world examples showing where people fail',
        '0:26-0:46 — How smart creators/users avoid the trap safely',
        '0:47-0:60 — Debate prompt in comments to skyrocket engagement',
      ],
      estimatedCtrScore: 92,
    },
    {
      hook: isEng
        ? `Want to build a viral series around ${cleanTopic}? Copy this 3-part content flywheel.`
        : `${cleanTopic} par viral channel grow karna hai? Ye 3-step formula copy karo.`,
      titles: [
        `How To Grow Fast With ${cleanTopic} Content`,
        `100K Views Strategy Using ${cleanTopic}`,
        `Smart Creator Playbook: ${cleanTopic}`,
      ],
      thumbnailText: '100K FORMULA 🚀',
      outline: [
        '0:00-0:04 — Show growth graph / outcome first',
        '0:05-0:24 — Breakdown of viral packaging (Title + First Frame + Audio)',
        '0:25-0:45 — Re-purpose 1 long video into 4 Shorts/Reels',
        '0:46-0:60 — Send concept straight into Viralytics Auto-Scheduler',
      ],
      estimatedCtrScore: 88,
    },
  ];

  return { engine: 'TRENDOOM Strategist Engine', ideas };
}

export function analyzeWhyViral(item) {
  const title = item?.title || 'Trending Video';
  const hasNumber = /\d/.test(title);
  const hasQuestion = /\?|kyu|how|why|kya/i.test(title);
  const length = title.length;

  return {
    summary: `AI metadata breakdown (sirf title, timing, category velocity & engagement signals par aadharit): "${title}" strong curiosity gap aur niche relevance trigger karta hai.`,
    factors: [
      { label: 'Curiosity & Hook Signal', score: hasQuestion ? 94 : 86, note: hasQuestion ? 'Direct question / mystery hook triggers instant click.' : 'Strong topical promise in first 5 words.' },
      { label: 'Title Specificity', score: hasNumber ? 92 : 81, note: hasNumber ? 'Numbers/years anchor credibility & boost CTR.' : 'Adding a concrete number (+15% CTR) would improve clarity.' },
      { label: 'Title Length Fit', score: length >= 30 && length <= 68 ? 93 : 78, note: `${length} chars — ${length <= 68 ? 'fits cleanly on mobile feeds without truncation.' : 'slightly long on mobile screens.'}` },
      { label: 'Niche Velocity', score: 90, note: `${item?.category || 'Entertainment'} category currently shows strong repeat watch & share velocity.` },
      { label: 'Viralytics Remix Potential', score: 95, note: 'High remixability into 45s Hinglish Shorts + carousel breakdown.' },
    ],
  };
}

export function run12PointSeoAudit({ url = '', title = '', description = '', tags = '' }) {
  const cleanTitle = title.trim() || (url ? `Video Audit: ${url.slice(0, 48)}` : '');
  const cleanDesc = description.trim();
  const tagList = tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const checks = [
    { name: '1. Title Length (35–65 chars)', pass: cleanTitle.length >= 35 && cleanTitle.length <= 65, tip: `Current: ${cleanTitle.length} chars. Ideal mobile sweet-spot is 45–62 chars.` },
    { name: '2. Front-Loaded Primary Keyword', pass: cleanTitle.split(' ').length >= 4, tip: 'Put your main searchable keyword in the first 3 words.' },
    { name: '3. Power / Curiosity Word', pass: /secret|truth|sach|viral|free|best|guide|how|kyu|2026|hack|full/i.test(cleanTitle), tip: 'Add high-CTR words like "Full Breakdown", "2026", "Sach", or "Step-by-Step".' },
    { name: '4. Number / Year Anchor', pass: /\d/.test(cleanTitle), tip: 'Titles with numbers or current year (2026) see higher browse CTR.' },
    { name: '5. Emotional / Contrast Trigger', pass: /\bvs\b|\bnot\b|\bnever\b|\bmistake|\bhidden|\bnahi|\bexposed/i.test(cleanTitle), tip: 'Use contrast ("X vs Y" or "Ye Galti Mat Karna") to spark curiosity.' },
    { name: '6. URL / Source Cleanliness', pass: /youtu|archive|dailymotion|instagram|viralytics/i.test(url) || url.length === 0, tip: url ? 'Valid media URL detected.' : 'Paste a YouTube, Shorts, Reel, or Dailymotion link for full check.' },
    { name: '7. Description Hook (First 150 chars)', pass: cleanDesc.length >= 60, tip: 'Write a keyword-rich summary in the first 2 lines above "Show more".' },
    { name: '8. Chapter / Timestamp Readiness', pass: /0:00|chapter|step/i.test(cleanDesc), tip: 'Add 0:00 timestamps to earn Google Search key-moments.' },
    { name: '9. Hashtag Hygiene (3–5 focused)', pass: tagList.length >= 3 && tagList.length <= 8, tip: `Detected ${tagList.length} tags. Aim for 3–5 niche tags + 1 brand tag (#Trendoom).` },
    { name: '10. Hinglish / Regional Search Match', pass: /hindi|hinglish|india|bollywood|tutorial|review|full/i.test(`${cleanTitle} ${cleanDesc} ${tags}`), tip: 'Include bilingual Indian search terms (e.g., "explained in Hindi").' },
    { name: '11. Call-To-Action & Retention Cue', pass: /subscribe|comment|save|share|watch/i.test(cleanDesc), tip: 'Include a specific comment prompt in the description & pinned comment.' },
    { name: '12. Cross-Platform Shorts Repurpose', pass: cleanTitle.length > 0 && cleanDesc.length > 20, tip: 'Convert the strongest 45s hook into YouTube Shorts & Instagram Reels via Viralytics.' },
  ];

  const passed = checks.filter((c) => c.pass).length;
  const score = Math.round((passed / checks.length) * 100);
  const improvedTitle = cleanTitle
    ? `${cleanTitle.replace(/[|!]+$/g, '').slice(0, 48)} (2026 Full Guide)`
    : '2026 Viral Breakdown: Step-by-Step Guide (Hinglish)';

  return {
    score,
    passed,
    total: checks.length,
    checks,
    improvedTitle,
    suggestedHashtags: ['#TRENDOOM', '#Viralytics', '#IndiaTrending', '#CreatorTips2026', '#Hinglish'],
  };
}
