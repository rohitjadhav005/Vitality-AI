import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Zap, Brain, Moon, Battery, CheckCircle2, Target as TargetIcon, TrendingUp, TrendingDown, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { apiUrl } from '../config/api';
import { useRealtime } from '../hooks/useRealtime';
import { useAuth } from '../components/AuthContext';

const MetricCard = ({ title, value, icon: Icon, trend }) => (
  <div className="metric-card glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '220px', flex: '0 0 auto', scrollSnapAlign: 'start', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', border: '1px solid var(--glass-border)' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.15)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--glass-shadow)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}>
    <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="metric-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--primary-color)', padding: '0.6rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} />
      </div>
      {trend !== undefined && (
        <span className={`metric-trend ${trend >= 0 ? 'positive' : 'negative'}`} style={{ color: trend >= 0 ? 'var(--text-primary)' : 'var(--primary-color)', background: trend >= 0 ? 'var(--glass-hover)' : 'rgba(239,68,68,0.1)', fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div className="metric-content" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.25rem' }}>
      <h3 style={{ color: 'var(--text-primary)', fontSize: '1.8rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>{value}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);

  const scrollMetrics = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'right' ? 240 : -240;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const [error, setError] = useState(null);
  const { logout } = useAuth();

  const fetchDashboardData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      logout();
      return;
    }
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const [summaryRes, trendsRes, insightsRes] = await Promise.all([
        fetch(apiUrl('/api/dashboard/summary'), { headers }),
        fetch(apiUrl('/api/dashboard/trends'), { headers }),
        fetch(apiUrl('/api/dashboard/insights'), { headers })
      ]);

      if (summaryRes.status === 401 || trendsRes.status === 401 || insightsRes.status === 401) {
        logout();
        return;
      }

      if (!summaryRes.ok) throw new Error('Failed to fetch summary');
      
      setSummary(await summaryRes.json());
      
      if (trendsRes.ok) setTrends(await trendsRes.json());
      if (insightsRes.ok) setInsights(await insightsRes.json());
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useRealtime(fetchDashboardData);

  if (loading) {
    return (
      <div className="loading-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem', color: 'var(--primary-color)' }}>
        <Activity size={40} className="spin-icon" style={{ animation: 'spin 2s linear infinite' }} />
        <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>Loading your dashboard...</span>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>No data available. Start tracking to see your dashboard!</h2>
      </div>
    );
  }

  const metrics = [
    { title: 'Energy Score',      value: `${summary.Energy_Score}%`,       icon: Zap,      trend: 5 },
    { title: 'Productivity',      value: `${summary.Productivity_Score}%`, icon: Activity, trend: 12 },
    { title: 'Sleep Quality',     value: `${summary.Sleep_Quality}h`,      icon: Moon,     trend: -2 },
    { title: 'Stress Level',      value: `${summary.Stress_Level}/10`,     icon: Brain,    trend: -15 },
    { title: 'Overall Health',    value: summary.Overall_Health,            icon: Battery },
  ];

  const goalItems = [
    { label: 'Drink 3L water today',    done: true },
    { label: 'Complete 30 min exercise',done: true },
    { label: 'Sleep 8 hours tonight',   done: false },
  ];

  return (
    <div className="dashboard-container fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <style>
        {`
          .metrics-grid::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>

      {/* Metrics Grid */}
      <div className="metrics-grid" style={{ gap: '1.25rem', width: '100%' }}>
        {metrics.map((m, i) => (
          <MetricCard key={i} {...m} />
        ))}
      </div>

      {/* Weekly Trend Chart */}
      <div className="chart-card glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderRadius: '24px' }}>
        <div className="chart-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>Weekly Performance Trends</h3>
            <p className="chart-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Energy &amp; productivity over the last 7 days</p>
          </div>
          <div style={{ background: 'rgba(239, 68, 68, 0.12)', padding: '0.6rem', borderRadius: '12px' }}>
            <TrendingUp size={20} color="var(--primary-color)" />
          </div>
        </div>
        {trends.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--primary-color)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--text-primary)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--text-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
              <XAxis dataKey="name" stroke="transparent" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} dy={10} />
              <YAxis stroke="transparent" domain={[0, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} dx={-10} />
              <Tooltip
                contentStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', backdropFilter: 'blur(12px)', color: 'var(--text-primary)', fontSize: '0.85rem', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
                itemStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                cursor={{ stroke: 'var(--primary-color)', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area type="monotone" dataKey="energy"       stroke="var(--primary-color)" strokeWidth={3} fillOpacity={1} fill="url(#colorEnergy)" name="Energy" dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--primary-color)' }} />
              <Area type="monotone" dataKey="productivity" stroke="var(--text-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorProd)"   name="Productivity" dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--text-primary)' }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', height: '240px', background: 'var(--glass-hover)', borderRadius: '16px' }}>
            <TrendingUp size={40} color="var(--text-secondary)" />
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No trend data yet — make your first prediction to see charts.</p>
          </div>
        )}
      </div>

      {/* AI Insights + Daily Goals */}
      <div className="dashboard-bottom-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {/* AI Insights */}
        <div className="glass-card dash-section-card" style={{ padding: '2rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="dash-section-header" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.12)', padding: '0.5rem', borderRadius: '10px' }}>
              <Brain size={20} color="var(--primary-color)" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>AI Insights</h3>
          </div>
          <div className="insights-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {insights.length > 0 ? insights.map((insight, index) => (
              <div key={index} className="insight-item" style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'var(--glass-hover)', borderRadius: '12px', border: '1px solid transparent', transition: 'border 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--glass-border)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
                <div className={`insight-indicator`} style={{ background: insight.type === 'positive' ? 'var(--text-primary)' : 'var(--primary-color)', width: '8px', height: '8px', borderRadius: '50%', marginTop: '0.4rem', flexShrink: 0, boxShadow: `0 0 8px ${insight.type === 'positive' ? 'var(--text-primary)' : 'var(--primary-color)'}` }} />
                <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.5 }}>{insight.message}</p>
              </div>
            )) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem 0', textAlign: 'center' }}>
                <Sparkles size={32} color="var(--text-secondary)" />
                <p className="empty-hint" style={{ color: 'var(--text-secondary)' }}>Make your first prediction to unlock AI-generated insights.</p>
              </div>
            )}
          </div>
        </div>

        {/* Daily Goals */}
        <div className="glass-card dash-section-card" style={{ padding: '2rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="dash-section-header" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.12)', padding: '0.5rem', borderRadius: '10px' }}>
              <TargetIcon size={20} color="var(--primary-color)" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Daily Goals</h3>
          </div>
          <div className="insights-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {goalItems.map((g, i) => (
              <div key={i} className="goal-item-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--glass-hover)', borderRadius: '12px', borderLeft: `3px solid ${g.done ? 'var(--primary-color)' : 'transparent'}`, transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <div className={`goal-item-icon ${g.done ? 'done' : 'pending'}`} style={{ color: g.done ? 'var(--primary-color)' : 'var(--text-secondary)' }}>
                  {g.done
                    ? <CheckCircle2 size={20} />
                    : <TargetIcon size={20} />
                  }
                </div>
                <p className={g.done ? 'goal-done' : ''} style={{ margin: 0, fontSize: '0.95rem', color: g.done ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: g.done ? 'line-through' : 'none', fontWeight: g.done ? 500 : 600 }}>{g.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
