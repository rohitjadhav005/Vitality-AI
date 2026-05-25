import React, { useState } from 'react';
import { Bell, CheckCheck, X, Info, AlertTriangle, CheckCircle2, Zap, Moon, Droplets, Brain, Settings, Trash2, BellOff, Target, BarChart3, MoreHorizontal } from 'lucide-react';

const initialNotifications = [
  { id: 1, type: 'success', category: 'prediction', title: 'New Prediction Complete', message: 'Your energy score jumped to 87/100! Your sleep optimization is paying off.', time: '2m', read: false },
  { id: 2, type: 'warning', category: 'stress', title: 'Stress Alert', message: 'Your stress level is at 7.5/10 — consider a 10-minute mindfulness break.', time: '45m', read: false },
  { id: 3, type: 'info', category: 'goal', title: 'Goal Milestone Reached', message: 'You have exercised for 7 consecutive days! Streak: 🔥 7 days.', time: '2h', read: false },
  { id: 4, type: 'warning', category: 'sleep', title: 'Low Sleep Warning', message: 'You logged only 5.5 hrs last night. Aim for 7+ hrs tonight for peak performance.', time: '5h', read: true },
  { id: 5, type: 'success', category: 'hydration', title: 'Hydration Goal Met', message: 'You drank 3.2L of water today — exceeding your daily goal. Excellent!', time: '6h', read: true },
  { id: 6, type: 'info', category: 'insight', title: 'Weekly AI Insight Ready', message: 'Your AI-generated weekly health report is available in the Insights section.', time: '1d', read: true },
  { id: 7, type: 'info', category: 'system', title: 'Model Update', message: 'Vitality AI model has been retrained with the latest biometric data for improved accuracy.', time: '2d', read: true },
];

const typeConfig = {
  success: { color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
  warning: { color: 'var(--primary-color)', bg: 'rgba(239, 68, 68, 0.15)' },
  info: { color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)' },
  error: { color: 'var(--primary-color)', bg: 'rgba(239, 68, 68, 0.15)' },
};

const categoryIcon = { prediction: Zap, stress: Brain, goal: CheckCircle2, sleep: Moon, hydration: Droplets, insight: Brain, system: Settings };

const Notifications = () => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState('all');

  const handleRead = (id) => setNotifications(n => n.map(x => x.id === id ? { ...x, read: true } : x));
  const handleDelete = (id) => {
    // In a real app, clicking the 3-dots would open a menu. Here we'll just delete to keep it simple.
    setNotifications(n => n.filter(x => x.id !== id));
  };
  const markAllRead = () => setNotifications(n => n.map(x => ({ ...x, read: true })));

  const filtered = filter === 'all' ? notifications : filter === 'unread' ? notifications.filter(n => !n.read) : notifications.filter(n => n.read);

  return (
    <div className="notif-page fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '750px', margin: '0 auto', width: '100%', paddingBottom: '2rem' }}>
      
      {/* Top Filter Pills */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem 1.5rem', borderRadius: '12px' }}>
        {['all', 'unread', 'read'].map(f => {
          const isActive = filter === f;
          return (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: isActive ? 'var(--primary-color)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-primary)',
                border: isActive ? '1px solid var(--primary-color)' : '1px solid var(--glass-border)',
                borderRadius: '999px',
                padding: '0.4rem 1.2rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'capitalize'
              }}
            >
              {f}
            </button>
          );
        })}
        {notifications.some(n => !n.read) && (
          <button 
            onClick={markAllRead} 
            style={{ 
              marginLeft: 'auto', 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-secondary)', 
              fontSize: '0.85rem', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              fontWeight: 600, 
              padding: 0 
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-color)'} 
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <CheckCheck size={16} /> Mark all as read
          </button>
        )}
      </div>

      {/* Notifications Feed */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '12px' }}>
        {filtered.length > 0 ? filtered.map((n, index) => {
          const cfg = typeConfig[n.type] || typeConfig.info;
          const CatIcon = categoryIcon[n.category] || Bell;
          const isLast = index === filtered.length - 1;
          
          return (
            <div 
              key={n.id} 
              onClick={() => !n.read && handleRead(n.id)}
              style={{ 
                display: 'flex', 
                alignItems: 'flex-start',
                padding: '1.25rem 1rem', 
                background: !n.read ? 'rgba(59, 130, 246, 0.08)' : 'transparent', 
                borderBottom: isLast ? 'none' : '1px solid var(--glass-border)',
                cursor: !n.read ? 'pointer' : 'default',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => { if(n.read) e.currentTarget.style.background = 'var(--glass-hover)'; }}
              onMouseLeave={e => { if(n.read) e.currentTarget.style.background = 'transparent'; }}
            >
              {/* Left Unread Dot */}
              <div style={{ width: '16px', display: 'flex', justifyContent: 'center', paddingTop: '0.8rem', flexShrink: 0, marginRight: '0.5rem' }}>
                {!n.read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6', boxShadow: '0 0 6px rgba(59,130,246,0.5)' }}></div>}
              </div>

              {/* Icon Square */}
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: '1rem' }}>
                <CatIcon size={22} color={cfg.color} />
              </div>

              {/* Text Content */}
              <div style={{ flex: 1, minWidth: 0, paddingRight: '1rem' }}>
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.5, wordBreak: 'break-word' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{n.title}</span>
                  <span style={{ color: 'var(--text-secondary)', margin: '0 0.3rem' }}>:</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{n.message}</span>
                </p>
              </div>

              {/* Right Side: Time and Menu */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, minWidth: '40px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '0.5rem' }}>
                  {n.time}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }} 
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.2rem', display: 'flex', borderRadius: '50%' }} 
                  title="Remove"
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--glass-border)'; e.currentTarget.style.color = 'var(--text-primary)'; }} 
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>
          );
        }) : (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--glass-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BellOff size={28} color="var(--text-secondary)" />
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.2rem' }}>You're all caught up!</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No new notifications matching this filter.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
