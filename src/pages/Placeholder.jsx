import React from 'react';
import { useLocation } from 'react-router-dom';

const Placeholder = () => {
  const location = useLocation();
  const pageName = location.pathname.substring(1) || 'Dashboard';

  return (
    <div className="placeholder-page glass-card">
      <div className="placeholder-content">
        <h2>{pageName.charAt(0).toUpperCase() + pageName.slice(1)} Module</h2>
        <p>This module is currently under development. Please check back later!</p>
      </div>
    </div>
  );
};

export default Placeholder;
