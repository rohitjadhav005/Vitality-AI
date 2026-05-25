import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, Menu, ChevronRight, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from './AuthContext';

const pageMeta = {
  '/':             { title: 'Dashboard',      subtitle: 'Good morning! Here\'s your health overview for today.' },
  '/predict':      { title: 'Predict Energy', subtitle: 'Log your vitals and get an instant AI-powered performance forecast.' },
  '/analytics':    { title: 'Analytics',      subtitle: 'Deep dive into your health correlations and long-term trends.' },
  '/history':      { title: 'History',        subtitle: 'Browse and export all your past prediction sessions.' },
  '/insights':     { title: 'Insights',       subtitle: 'Personalized AI recommendations based on your health data.' },
  '/goals':        { title: 'Goals',          subtitle: 'Set, track and crush your wellness targets.' },
  '/notifications':{ title: 'Notifications',  subtitle: 'Stay on top of health alerts and important updates.' },
  '/profile':      { title: 'Profile',        subtitle: 'Manage your account details and view your achievements.' },
  '/settings':     { title: 'Settings',       subtitle: 'Customize your Vitality AI experience.' },
};

const Header = ({ setIsCollapsed, isCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const { logout, token } = useAuth();

  const getUsername = () => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.username || 'User';
    } catch {
      return 'User';
    }
  };
  const username = getUsername();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const meta = pageMeta[location.pathname] || {
    title: (location.pathname.slice(1) || 'Dashboard').replace(/^\w/, c => c.toUpperCase()),
    subtitle: ''
  };

  const searchResults = Object.entries(pageMeta)
    .filter(([path, data]) => {
      const q = query.toLowerCase();
      return data.title.toLowerCase().includes(q) || data.subtitle.toLowerCase().includes(q);
    })
    .slice(0, 5); // Limit to 5 results

  const handleSelect = (path) => {
    navigate(path);
    setQuery('');
    setShowResults(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header-top">
      <div className="header-main-row">
        {/* Left: Hamburger + Title */}
        <div className="header-left">
          <button className="mobile-header-hamburger" id="sidebar-toggle-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
            <Menu size={22} color="var(--text-primary)" />
          </button>
          <div className="header-title-block">
            <h1 className="header-page-title">{meta.title}</h1>
            {meta.subtitle && <p className="header-page-subtitle">{meta.subtitle}</p>}
          </div>
        </div>

        {/* Right: Search + Actions */}
        <div className="header-actions">
          <div className="search-bar-container" style={{ position: 'relative' }} ref={searchRef}>
            <div className="search-bar mobile-hide" id="header-search-bar">
              <Search size={16} color="var(--text-secondary)" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                id="header-search-input"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
              />
            </div>

            {showResults && query.trim() !== '' && (
              <div className="search-results-dropdown glass-card fade-in" style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                left: 0,
                right: 0,
                minWidth: '280px',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '16px',
                padding: '0.5rem',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem'
              }}>
                {searchResults.length > 0 ? searchResults.map(([path, data]) => (
                  <button 
                    key={path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '0.8rem 1rem',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--glass-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onClick={() => handleSelect(path)}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{data.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.subtitle}</div>
                    </div>
                    <ChevronRight size={16} color="var(--text-secondary)" style={{ flexShrink: 0, marginLeft: '0.5rem' }} />
                  </button>
                )) : (
                  <div style={{ padding: '1.5rem 1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    No pages found for "{query}"
                  </div>
                )}
              </div>
            )}
          </div>

          <button className="icon-btn" id="notifications-btn" onClick={() => navigate('/notifications')}>
            <Bell size={18} />
            <span className="badge" />
          </button>
          
          {/* Profile Dropdown */}
          <div className="header-profile-container mobile-hide" style={{ position: 'relative' }} ref={profileRef}>
            <button 
              className="header-profile-avatar" 
              onClick={() => setShowProfile(!showProfile)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.2s',
                textTransform: 'uppercase'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {username.charAt(0)}
            </button>
            
            {showProfile && (
              <div className="profile-dropdown glass-card fade-in" style={{
                position: 'absolute',
                top: 'calc(100% + 12px)',
                right: 0,
                minWidth: '240px',
                background: 'var(--sidebar-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '16px',
                padding: '0.8rem',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ padding: '0.5rem 0.5rem 1rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '0.5rem' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase'
                  }}>
                    {username.charAt(0)}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', letterSpacing: '0.5px' }}>{username.toUpperCase()}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Health Member</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => { setShowProfile(false); navigate('/profile'); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.7rem 0.8rem', background: 'transparent', border: 'none', borderRadius: '10px', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', fontWeight: 500, fontSize: '0.9rem', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--glass-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <User size={16} /> Account settings
                </button>
                <button 
                  onClick={() => { setShowProfile(false); navigate('/settings'); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.7rem 0.8rem', background: 'transparent', border: 'none', borderRadius: '10px', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', fontWeight: 500, fontSize: '0.9rem', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--glass-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <Settings size={16} /> Preferences
                </button>
                
                <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '0.5rem 0' }} />
                
                <button 
                  onClick={handleLogout}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.7rem 0.8rem', background: 'transparent', border: 'none', borderRadius: '10px', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', fontWeight: 500, fontSize: '0.9rem', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = 'var(--primary-color)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
