import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  BrainCircuit, 
  BarChart3, 
  History, 
  Lightbulb, 
  Target, 
  Bell, 
  Settings,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Activity
} from 'lucide-react';
import './Sidebar.css';
import { useAuth } from './AuthContext';

const Sidebar = ({ isCollapsed = true, setIsCollapsed }) => {
  const navigate = useNavigate();
  const { logout, token } = useAuth();

  // Decode username from JWT token
  const getUsername = () => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.username || 'User';
    } catch {
      return 'User';
    }
  };
  const username = getUsername();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavClick = () => {
    setIsCollapsed(true);
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Prediction', path: '/predict', icon: <BrainCircuit size={20} /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart3 size={20} /> },
    { name: 'History', path: '/history', icon: <History size={20} /> },
    { name: 'Insights', path: '/insights', icon: <Lightbulb size={20} /> },
    { name: 'Goals', path: '/goals', icon: <Target size={20} /> },
  ];

  const bottomItems = [
    { name: 'Notifications', path: '/notifications', icon: <Bell size={20} />, badge: 3 },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''}`}>

      {/* Logo & Mobile Hamburger */}
      <div className="sidebar-logo" style={{ display: 'flex', justifyContent: 'space-between', overflow: 'hidden', alignItems: 'center' }}>
        <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', overflow: 'hidden' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: isCollapsed ? '2.4rem' : '2.6rem',
            height: isCollapsed ? '2.4rem' : '2.6rem',
            background: 'linear-gradient(135deg, var(--primary-color), #b91c1c)',
            borderRadius: '10px',
            boxShadow: 'none',
            flexShrink: 0,
            transition: 'all 0.3s ease'
          }}>
            <Activity size={isCollapsed ? 20 : 22} color="#fff" strokeWidth={2.5} />
          </div>
          {!isCollapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: '1.2' }}>Vitality</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-color)', letterSpacing: '2px', textTransform: 'uppercase' }}>AI Platform</span>
            </div>
          )}
        </div>
        <button 
          className="mobile-hamburger"
          onClick={() => setIsCollapsed(true)}
          aria-label="Close menu"
          style={{ color: 'var(--text-secondary)', marginLeft: 'auto' }}
        >
          <X size={24} />
        </button>
      </div>

      <div className="sidebar-menu">
        {/* Main Menu */}
        <div className="menu-group">
          {!isCollapsed && <p className="menu-section-label">MAIN MENU</p>}
          {menuItems.map((item) => (
            <NavLink
              to={item.path}
              key={item.name}
              end={item.path === '/'}
              className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
              data-tooltip={isCollapsed ? item.name : undefined}
              onClick={handleNavClick}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="menu-icon-wrapper"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {item.icon}
              </motion.div>
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </div>

        {/* Bottom Group */}
        <div className="menu-group bottom-group">
          {!isCollapsed && <p className="menu-section-label">SYSTEM</p>}
          {bottomItems.map((item) => (
            <NavLink
              to={item.path}
              key={item.name}
              className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
              data-tooltip={isCollapsed ? item.name : undefined}
              onClick={handleNavClick}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="menu-icon-wrapper"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {item.icon}
              </motion.div>
              {!isCollapsed && <span>{item.name}</span>}
              {item.badge && !isCollapsed && <span className="menu-badge">{item.badge}</span>}
            </NavLink>
          ))}

          <div className="sidebar-divider" style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '1rem 0 0.5rem 0' }} />

          {/* Profile Card */}
          <div 
            className="sidebar-profile-card" 
            onClick={() => {
              navigate('/profile');
              handleNavClick();
            }}
            data-tooltip={isCollapsed ? username : undefined}
          >
            <div className="sidebar-profile-avatar">
              {username.charAt(0)}
            </div>
            {!isCollapsed && (
              <div className="sidebar-profile-info">
                <div className="sidebar-profile-name">{username}</div>
                <div className="sidebar-profile-role" style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Health Member</div>
              </div>
            )}
            {!isCollapsed && (
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  handleLogout(); 
                }}
                title="Sign Out"
                style={{
                  background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.4rem',
                  borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ef4444';
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#94a3b8';
                  e.currentTarget.style.background = 'none';
                }}
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
