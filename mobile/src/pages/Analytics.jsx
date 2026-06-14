import React, { useState, useEffect, useCallback } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell
} from 'recharts';
import { TrendingUp, Activity, BarChart2, Zap, Brain, Moon, Droplets, AlertCircle } from 'lucide-react';
import { apiUrl } from '../config/api';
import { useRealtime } from '../hooks/useRealtime';

const TOOLTIP_STYLE = {
  background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
  borderRadius: '12px', color: 'var(--text-primary)',
  backdropFilter: 'blur(12px)', fontSize: '0.85rem',
};

const staticRadarData = [
  { metric: 'Sleep', score: 75 }, { metric: 'Energy', score: 82 },
  { metric: 'Focus', score: 68 }, { metric: 'Hydration', score: 90 },
  { metric: 'Mood', score: 72 },  { metric: 'Exercise', score: 85 },
];

const StatChip = ({ label, value, Icon }) => (
  <div className="analytics-chip glass-card">
    <div className="chip-icon" style={{ background: 'rgba(239, 68, 68, 0.12)' }}>
      <Icon size={18} color="var(--primary-color)" />
    </div>
    <div>
      <div className="chip-val" style={{ color: 'var(--text-primary)' }}>{value}</div>
      <div className="chip-lbl">{label}</div>
    </div>
  </div>
);

const CHART_TABS = [
  { id: 'all',         label: 'All' },
  { id: 'correlation', label: 'Correlation' },
  { id: 'trends',      label: 'Trends' },
  { id: 'radar',       label: 'Radar' },
];

const Analytics = () => {
  const [data, setData] = useState({ scatter: [], bar: [] });
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState('all');

  const fetchAnalytics = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(apiUrl('/api/analytics'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setData(await res.json());
    } catch (e) {
      console.error('Failed to fetch analytics', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useRealtime(fetchAnalytics);

  const lineData = data.scatter.map((d, i) => ({
    name: `D${i + 1}`,
    energy: d.energy,
    sleep: d.sleep * 10,
    stress: (10 - d.stress) * 10,
  }));

  const avgEnergy = data.scatter.length
    ? Math.round(data.scatter.reduce((a, b) => a + b.energy, 0) / data.scatter.length)
    : null;
  const avgSleep = data.scatter.length
    ? (data.scatter.reduce((a, b) => a + b.sleep, 0) / data.scatter.length).toFixed(1)
    : null;
  const avgStress = data.scatter.length
    ? (data.scatter.reduce((a, b) => a + b.stress, 0) / data.scatter.length).toFixed(1)
    : null;

  if (loading) return (
    <div className="loading-state">
      <div className="loading-spinner" />
      <span>Analyzing your data...</span>
    </div>
  );

  return (
    <div className="analytics-page fade-in">

      {/* Summary Chips */}
      <div className="analytics-chips-row">
        <StatChip label="Avg Energy"  value={avgEnergy  != null ? `${avgEnergy}%`   : 'N/A'} Icon={Zap}      />
        <StatChip label="Avg Sleep"   value={avgSleep   != null ? `${avgSleep}h`    : 'N/A'} Icon={Moon}     />
        <StatChip label="Avg Stress"  value={avgStress  != null ? `${avgStress}/10` : 'N/A'} Icon={Brain}    />
        <StatChip label="Total Sessions" value={data.scatter.length || 0}                    Icon={Activity} />
      </div>

      {/* Filter Tabs */}
      <div className="page-filter-tabs">
        {CHART_TABS.map(t => (
          <button
            key={t.id}
            id={`analytics-tab-${t.id}`}
            className={`filter-tab ${activeChart === t.id ? 'active' : ''}`}
            onClick={() => setActiveChart(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {data.scatter.length === 0 ? (
        <div className="analytics-empty glass-card">
          <AlertCircle size={44} color="var(--text-secondary)" />
          <h3>No Data Yet</h3>
          <p>Make your first prediction to start seeing correlation charts and trend analysis.</p>
        </div>
      ) : (
        <div className="analytics-grid">

          {/* Sleep vs Energy Scatter */}
          {(activeChart === 'all' || activeChart === 'correlation') && (
            <div className="chart-card glass-card analytics-card-wide">
              <div className="chart-card-header">
                <div>
                  <h3>Sleep vs Energy Correlation</h3>
                  <p className="chart-subtitle">Each dot = one prediction session</p>
                </div>
                <BarChart2 size={18} color="var(--primary-color)" />
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                  <XAxis type="number" dataKey="sleep"  name="Sleep (hrs)" stroke="transparent" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} label={{ value: 'Sleep (hrs)', position: 'insideBottom', offset: -10, fill: 'var(--text-secondary)', fontSize: 11 }} domain={[0, 14]} />
                  <YAxis type="number" dataKey="energy" name="Energy"       stroke="transparent" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} domain={[0, 100]} />
                  <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={TOOLTIP_STYLE} />
                  <Scatter name="Sessions" data={data.scatter} fill="var(--primary-color)">
                    {data.scatter.map((entry, i) => (
                      <Cell key={i} fill={entry.stress > 6 ? '#ef4444' : 'var(--text-primary)'} opacity={0.8} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <p className="chart-note">🔴 Red = high stress session (≥7/10) &nbsp;|&nbsp; ⚪ White = normal</p>
            </div>
          )}

          {/* Productivity & Mood Bar */}
          {(activeChart === 'all' || activeChart === 'correlation') && (
            <div className="chart-card glass-card">
              <div className="chart-card-header">
                <div>
                  <h3>Productivity &amp; Mood</h3>
                  <p className="chart-subtitle">Daily comparison over sessions</p>
                </div>
                <Activity size={18} color="var(--primary-color)" />
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.bar} margin={{ top: 10, right: 10, left: 0, bottom: 5 }} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                  <XAxis dataKey="name" stroke="transparent" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                  <YAxis stroke="transparent" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} domain={[0, 100]} />
                  <RechartsTooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px', color: 'var(--text-secondary)' }} />
                  <Bar dataKey="productivity" name="Productivity" fill="#EF4444" radius={[6,6,0,0]} opacity={0.9} />
                  <Bar dataKey="mood"         name="Mood (×10)"  fill="var(--text-primary)" radius={[6,6,0,0]} opacity={0.9} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Multi-metric Line Trends */}
          {(activeChart === 'all' || activeChart === 'trends') && (
            <div className="chart-card glass-card analytics-card-wide">
              <div className="chart-card-header">
                <div>
                  <h3>Multi-Factor Performance Trends</h3>
                  <p className="chart-subtitle">Energy, sleep, and stress-adjusted scores across sessions</p>
                </div>
                <TrendingUp size={18} color="var(--primary-color)" />
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={lineData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                  <XAxis dataKey="name" stroke="transparent" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <YAxis stroke="transparent" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} domain={[0, 120]} />
                  <RechartsTooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }} />
                  <Line type="monotone" dataKey="energy" name="Energy"        stroke="#EF4444" strokeWidth={2.5} dot={{ r: 4, fill: '#EF4444' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="sleep"  name="Sleep×10"      stroke="var(--text-primary)" strokeWidth={2}   strokeDasharray="5 3" dot={false} />
                  <Line type="monotone" dataKey="stress" name="Anti-Stress"   stroke="#9CA3AF" strokeWidth={2}   dot={{ r: 3, fill: '#9CA3AF' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Radar Chart */}
          {(activeChart === 'all' || activeChart === 'radar') && (
            <div className="chart-card glass-card">
              <div className="chart-card-header">
                <div>
                  <h3>Wellness Radar</h3>
                  <p className="chart-subtitle">Holistic health dimension overview</p>
                </div>
                <Droplets size={18} color="var(--primary-color)" />
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={staticRadarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="var(--glass-border)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                  <Radar name="You" dataKey="score" stroke="#EF4444" fill="#EF4444" fillOpacity={0.2} />
                  <RechartsTooltip contentStyle={TOOLTIP_STYLE} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default Analytics;
