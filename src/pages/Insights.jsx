import React, { useState, useEffect, useCallback } from 'react';
import { Brain, Sparkles, Activity, Moon, Zap, TrendingUp, AlertTriangle, CheckCircle2, Lightbulb, Star, ArrowRight } from 'lucide-react';
import { apiUrl } from '../config/api';
import { useRealtime } from '../hooks/useRealtime';

const tips = [
  { icon: '😴', title: 'Sleep Hygiene',  tip: 'Keep a consistent sleep schedule — even on weekends — to stabilize your circadian rhythm and boost daily energy.' },
  { icon: '🧘', title: 'Stress Relief',  tip: 'Box breathing (4-4-4-4) activates the parasympathetic nervous system, reducing cortisol within minutes.' },
  { icon: '💧', title: 'Hydration',      tip: 'Even 1–2% dehydration impairs cognition. Start your morning with 500ml of water.' },
  { icon: '⚡', title: 'Energy Peaks',   tip: 'Your peak cognitive window is typically 2–4 hrs after waking. Schedule deep work then.' },
  { icon: '🏃', title: 'Exercise',       tip: '20 min of moderate cardio releases BDNF — improving focus for up to 4 hours.' },
  { icon: '📵', title: 'Screen Time',    tip: 'Blue light 2 hrs before sleep suppresses melatonin by up to 50%. Use night mode.' },
];

const ScoreGauge = ({ value, label, color }) => {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const arc  = circ * 0.75;
  const offset = arc - (value / 100) * arc;
  return (
    <div className="gauge-wrap">
      <svg viewBox="0 0 110 110" width="90" height="90">
        <circle cx="55" cy="55" r={r} fill="none" stroke="var(--glass-border)" strokeWidth="9"
          strokeDasharray={`${arc} ${circ}`} strokeDashoffset={`-${circ * 0.125}`} strokeLinecap="round" />
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="9"
          strokeDasharray={`${arc} ${circ}`} strokeDashoffset={`${offset - circ * 0.125}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)', transform: 'rotate(135deg)', transformOrigin: '55px 55px' }} />
        <text x="55" y="58" textAnchor="middle" fill={color} fontSize="18" fontWeight="800">{value}</text>
        <text x="55" y="72" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">/100</text>
      </svg>
      <div className="gauge-label">{label}</div>
    </div>
  );
};

const InsightCard = ({ insight, idx }) => {
  const isPositive = insight.type === 'positive';
  return (
    <div
      className={`insight-card-pro ${isPositive ? 'insight-positive' : 'insight-warning'}`}
      style={{ animationDelay: `${idx * 0.08}s` }}
    >
      <div className="insight-icon-pro">
        {isPositive
          ? <CheckCircle2 size={20} color="var(--primary-color)" />
          : <AlertTriangle size={20} color="#EF4444" />
        }
      </div>
      <div className="insight-content-pro">
        <h4>{insight.title}</h4>
        <p>{insight.desc}</p>
      </div>
      <div className={`insight-type-dot ${insight.type}`} />
    </div>
  );
};

const CAT_TABS = [
  { key: 'all',          label: 'All Insights' },
  { key: 'health',       label: '❤️ Health' },
  { key: 'productivity', label: '⚡ Productivity' },
  { key: 'sleep',        label: '🌙 Sleep' },
];

const Insights = () => {
  const [insights, setInsights] = useState({ health: [], productivity: [], sleep: [] });
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [weekScore] = useState({ energy: 78, sleep: 72, productivity: 84, stress: 65 });

  const fetchInsights = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(apiUrl('/api/insights/all'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setInsights(await res.json());
    } catch (e) {
      console.error('Failed to fetch insights', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  useRealtime(fetchInsights);

  if (loading) return (
    <div className="loading-state">
      <div className="loading-spinner" />
      <span>Analyzing neural patterns...</span>
    </div>
  );

  const allInsights = [...insights.health, ...insights.productivity, ...insights.sleep];
  const displayInsights = activeCategory === 'all' ? allInsights : (insights[activeCategory] || []);

  return (
    <div className="insights-page fade-in">

      {/* Premium Hero Banner */}
      <div className="insights-premium-hero glass-card">
        <div className="hero-gradient-mesh" />
        <div className="premium-hero-content">
          <div className="premium-hero-icon-box">
            <Sparkles size={28} color="#FFFFFF" />
          </div>
          <div className="premium-hero-text">
            <h1 className="gradient-heading">AI Health Intelligence</h1>
            <p>
              Your 7-day performance baseline analyzed by our neural engine. 
              Actionable recommendations dynamically tailored to maximize your human energy and productivity.
            </p>
          </div>
        </div>
      </div>

      {/* Wellness Gauges Grid */}
      <div className="insights-metrics-grid">
        <div className="metric-gauge-card glass-card">
          <ScoreGauge value={weekScore.energy}      label="Avg Energy"  color="#EF4444" />
        </div>
        <div className="metric-gauge-card glass-card">
          <ScoreGauge value={weekScore.sleep}       label="Avg Sleep"   color="var(--text-primary)" />
        </div>
        <div className="metric-gauge-card glass-card">
          <ScoreGauge value={weekScore.productivity}label="Focus Score" color="#EF4444" />
        </div>
        <div className="metric-gauge-card glass-card">
          <ScoreGauge value={weekScore.stress}      label="Calmness"    color="var(--text-primary)" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="page-filter-tabs" style={{ marginTop: '0.5rem' }}>
        {CAT_TABS.map(c => (
          <button
            key={c.key}
            id={`insights-tab-${c.key}`}
            className={`filter-tab ${activeCategory === c.key ? 'active' : ''}`}
            onClick={() => setActiveCategory(c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="insights-body-grid">
        {/* AI Insight Cards */}
        <div className="insights-cards-col">
          <h3 className="insights-col-title">
            <Brain size={18} color="var(--primary-color)" />
            AI Recommendations
          </h3>
          {displayInsights.length > 0 ? (
            <div className="insights-cards-list">
              {displayInsights.map((ins, i) => <InsightCard key={i} insight={ins} idx={i} />)}
            </div>
          ) : (
            <div className="insights-empty-state glass-card">
              <TrendingUp size={44} color="var(--text-secondary)" />
              <h3>No insights generated</h3>
              <p>Make at least one prediction session to unlock our AI's personalized analysis.</p>
            </div>
          )}
        </div>

        {/* Expert Tips */}
        <div className="insights-tips-col">
          <h3 className="insights-col-title">
            <Star size={18} color="var(--primary-color)" />
            Expert Wellness Tips
          </h3>
          <div className="tips-list">
            {tips.map((tip, i) => (
              <div key={i} className="tip-card glass-card" id={`tip-card-${i}`}>
                <div className="tip-emoji">{tip.icon}</div>
                <div className="tip-content">
                  <h4>{tip.title}</h4>
                  <p>{tip.tip}</p>
                </div>
                <div className="tip-arrow-wrap">
                  <ArrowRight size={14} color="var(--text-secondary)" className="tip-arrow" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Insights;
