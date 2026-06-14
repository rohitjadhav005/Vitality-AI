import React, { useState, useEffect, useCallback } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, Camera, Shield, Award, TrendingUp, Zap, Activity, Star, Clock } from 'lucide-react';
import { apiUrl } from '../config/api';
import { useRealtime } from '../hooks/useRealtime';
import { useAuth } from '../components/AuthContext';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const [error, setError] = useState(null);
  const { logout } = useAuth();

  const fetchProfileData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      logout();
      return;
    }
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const res = await fetch(apiUrl('/api/profile'), { headers });
      if (res.status === 401) {
        logout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (!editing) {
          setDraft(data.user);
        }
      } else {
        throw new Error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [editing, logout]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  useRealtime(fetchProfileData);

  const handleSave = () => {
    setUser({ ...user, ...draft });
    setEditing(false);
  };
  const handleCancel = () => {
    setDraft({ ...user });
    setEditing(false);
  };

  if (loading || !user) {
    return (
      <div className="loading-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem', color: 'var(--primary-color)' }}>
        <Activity size={40} className="spin-icon" style={{ animation: 'spin 2s linear infinite' }} />
        <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>Loading your profile data...</span>
      </div>
    );
  }

  return (
    <div className="profile-page fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero Banner Area */}
      <div className="profile-hero-premium glass-card" style={{ padding: 0, borderRadius: '24px', overflow: 'hidden', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
        {/* Cover Gradient */}
        <div className="profile-cover" style={{ height: '140px', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(185, 28, 28, 0.05) 100%)', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(239, 68, 68, 0.15) 0%, transparent 50%)' }} />
        </div>
        
        {/* Profile Content */}
        <div className="profile-content-wrap" style={{ padding: '0 2.5rem 2.5rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', marginTop: '-50px' }}>
          <div className="profile-top-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div className="profile-avatar-wrap" style={{ position: 'relative' }}>
              <div 
                className="profile-avatar" 
                style={{ 
                  width: '100px', 
                  height: '100px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, var(--primary-color), #b91c1c)', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '2.5rem',
                  textTransform: 'uppercase',
                  border: 'none',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                }}
              >
                {(user.name || 'U').charAt(0)}
              </div>
              {editing && (
                <button className="avatar-edit-btn" style={{ position: 'absolute', right: '4px', bottom: '4px', background: 'var(--primary-color)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)' }}><Camera size={16} /></button>
              )}
            </div>

            <div className="profile-actions" style={{ marginBottom: '10px' }}>
              {editing ? (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="profile-cancel-btn" style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '0.6rem 1.2rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }} onClick={handleCancel}>Cancel</button>
                  <button className="profile-save-btn" style={{ background: 'var(--primary-color)', border: 'none', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }} onClick={handleSave}>Save</button>
                </div>
              ) : (
                <button className="profile-edit-btn" style={{ background: 'var(--glass-hover)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', padding: '0.6rem 1.2rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--glass-hover)'} onClick={() => setEditing(true)}><Edit3 size={16} /> Edit Profile</button>
              )}
            </div>
          </div>

          <div className="profile-details" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {editing ? (
              <input className="profile-edit-name" style={{ fontSize: '2rem', fontWeight: 700, background: 'var(--glass-bg)', border: '1px solid var(--primary-color)', borderRadius: '8px', color: 'var(--text-primary)', padding: '0.4rem 0.8rem', width: '100%', maxWidth: '300px', outline: 'none' }} value={draft.name} onChange={e => setDraft({...draft, name: e.target.value})} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h2 className="profile-name" style={{ fontSize: '2rem', fontWeight: 700, margin: '0', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{user.name}</h2>
                {user.role === 'Admin' && (
                  <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--primary-color)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(239, 68, 68, 0.3)' }}>ADMIN</span>
                )}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><User size={16} /> {user.role}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Calendar size={16} /> Member since {user.joined}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="profile-stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
        {[
          { label: 'Predictions Made', value: user.stats.predictions, color: 'var(--text-primary)' },
          { label: 'Active Goals', value: user.stats.goals, color: 'var(--primary-color)' },
          { label: 'Current Streak', value: `${user.stats.streak}🔥`, color: 'var(--text-primary)' },
          { label: 'Energy Baseline', value: `${user.stats.avgEnergy}%`, color: 'var(--primary-color)' },
        ].map((s, i) => (
          <div key={i} className="profile-stat-card glass-card" style={{ padding: '2rem 1.5rem', textAlign: 'center', transition: 'transform 0.3s, box-shadow 0.3s', borderRadius: '20px', border: '1px solid var(--glass-border)' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--glass-shadow)'; }}>
            <div className="pstat-val" style={{ color: s.color, fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-1px' }}>{s.value}</div>
            <div className="pstat-lbl" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="profile-tabs" style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {['overview', 'activity', 'badges'].map(t => (
          <button key={t} className={`filter-tab ${activeTab === t ? 'active' : ''}`} style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: activeTab === t ? '2px solid var(--primary-color)' : '2px solid transparent', padding: '0.8rem 1.5rem', fontSize: '0.95rem', whiteSpace: 'nowrap', border: 'none', background: activeTab === t ? 'rgba(239, 68, 68, 0.1)' : 'transparent', color: activeTab === t ? 'var(--primary-color)' : 'var(--text-secondary)' }} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="profile-overview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-card profile-info-card" style={{ padding: '2.5rem', borderRadius: '20px' }}>
            <h3 className="profile-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-primary)', marginBottom: '2rem', fontSize: '1.25rem', fontWeight: 700 }}><User size={22} color="var(--primary-color)" /> Personal Information</h3>
            <div className="profile-fields" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {[
                { icon: Mail, label: 'Email Address', key: 'email' },
                { icon: Phone, label: 'Phone Number', key: 'phone' },
                { icon: MapPin, label: 'Location', key: 'location' },
              ].map(({ icon: Icon, label, key }) => (
                <div key={key} className="profile-field" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div className="pfield-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}><Icon size={16} />{label}</div>
                  {editing ? (
                    <input className="profile-edit-input" style={{ padding: '0.8rem 1rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none' }} value={draft[key]} onChange={e => setDraft({...draft, [key]: e.target.value})} />
                  ) : (
                    <div className="pfield-value" style={{ color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: 500, padding: '0.5rem 0', borderBottom: '1px solid var(--glass-border)' }}>{user[key]}</div>
                  )}
                </div>
              ))}
              <div className="profile-field" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div className="pfield-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}><User size={16} />Bio</div>
                {editing ? (
                  <textarea className="profile-edit-textarea" rows={4} style={{ padding: '1rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none', resize: 'vertical' }} value={draft.bio} onChange={e => setDraft({...draft, bio: e.target.value})} />
                ) : (
                  <div className="pfield-value" style={{ color: 'var(--text-primary)', fontSize: '1rem', lineHeight: 1.6, padding: '1rem', background: 'var(--glass-hover)', borderRadius: '12px', marginTop: '0.5rem' }}>{user.bio}</div>
                )}
              </div>
            </div>
          </div>

          <div className="glass-card profile-admin-panel" style={{ padding: '2.5rem', borderRadius: '20px' }}>
            <h3 className="profile-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-primary)', marginBottom: '2rem', fontSize: '1.25rem', fontWeight: 700 }}><Shield size={22} color="var(--primary-color)" /> Admin & System Settings</h3>
            <div className="admin-items" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Account Type', value: 'Administrator', accent: 'var(--primary-color)' },
                { label: 'Access Level', value: 'Full Access', accent: 'var(--text-primary)' },
                { label: 'Data Region', value: 'India (South)', accent: 'var(--text-primary)' },
                { label: 'API Status', value: 'Active ✓', accent: 'var(--text-primary)' },
                { label: 'Model Version', value: 'RF v2.4.1', accent: 'var(--primary-color)' },
                { label: 'Last Login', value: 'Today, 11:46 AM', accent: 'var(--text-secondary)' },
              ].map((item, i) => (
                <div key={i} className="admin-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', background: 'var(--glass-hover)', borderRadius: '12px', border: '1px solid transparent', transition: 'border 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--glass-border)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
                  <span className="admin-item-label" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 600 }}>{item.label}</span>
                  <span className="admin-item-value" style={{ color: item.accent, fontSize: '0.95rem', fontWeight: 700 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="glass-card profile-activity-card" style={{ padding: '2.5rem', borderRadius: '20px' }}>
          <h3 className="profile-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-primary)', marginBottom: '2.5rem', fontSize: '1.25rem', fontWeight: 700 }}><TrendingUp size={22} color="var(--primary-color)" /> Recent Activity</h3>
          <div className="activity-list" style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ position: 'absolute', left: '23px', top: '24px', bottom: '24px', width: '2px', background: 'var(--glass-border)', zIndex: 0 }} />
            {user.recentActivity.map((act, i) => {
              const iconColor = act.color === '#FFFFFF' ? 'var(--text-primary)' : act.color;
              return (
                <div key={i} className="activity-item" style={{ display: 'flex', gap: '1.5rem', position: 'relative', zIndex: 1, alignItems: 'flex-start' }}>
                  <div className="activity-icon" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--glass-bg)', border: `2px solid ${iconColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 0 12px ${iconColor}40` }}>
                    <Star size={20} color={iconColor} />
                  </div>
                  <div className="activity-text" style={{ background: 'var(--glass-hover)', padding: '1.25rem 1.5rem', borderRadius: '16px', flex: 1, border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '0.4rem', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div className="activity-action" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.05rem' }}>{act.action}</div>
                    <div className="activity-time" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={12}/> {act.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="glass-card profile-badges-card" style={{ padding: '2.5rem', borderRadius: '20px' }}>
          <h3 className="profile-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-primary)', marginBottom: '2.5rem', fontSize: '1.25rem', fontWeight: 700 }}><Award size={22} color="var(--primary-color)" /> Achievements & Badges</h3>
          <div className="badges-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '2rem' }}>
            {user.badges.map((badge, i) => {
              const bColor = badge.color === '#FFFFFF' ? 'var(--text-primary)' : badge.color;
              return (
                <div key={i} className="badge-card" style={{ padding: '2rem 1.5rem', borderRadius: '20px', border: `1px solid ${bColor}40`, background: `linear-gradient(180deg, ${bColor}10, transparent)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', cursor: 'default' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'; e.currentTarget.style.boxShadow = `0 16px 32px ${bColor}20`; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div className="badge-emoji" style={{ fontSize: '3rem', filter: `drop-shadow(0 8px 16px ${bColor}80)` }}>{badge.icon}</div>
                  <div className="badge-label" style={{ color: bColor, fontWeight: 800, fontSize: '1rem', marginTop: '0.5rem' }}>{badge.label}</div>
                </div>
              );
            })}
            {/* Locked badges */}
            {['Night Owl', 'Peak Performer', 'Iron Will'].map((b, i) => (
              <div key={`locked-${i}`} className="badge-card badge-locked" style={{ padding: '2rem 1.5rem', borderRadius: '20px', border: '2px dashed var(--glass-border)', background: 'var(--glass-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center', opacity: 0.5, transition: 'opacity 0.3s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.8'} onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}>
                <div className="badge-emoji" style={{ fontSize: '3rem', filter: 'grayscale(1)' }}>🔒</div>
                <div className="badge-label" style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '1rem', marginTop: '0.5rem' }}>{b}</div>
                <div className="badge-locked-text" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 800, background: 'var(--glass-hover)', padding: '0.2rem 0.6rem', borderRadius: '99px' }}>Locked</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
