import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ChatBot from './ChatBot';

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="app-layout">
      {/* Mobile Drawer Backdrop */}
      <div 
        className={`sidebar-backdrop ${isCollapsed ? 'hidden' : ''}`} 
        onClick={() => setIsCollapsed(true)} 
      />
      
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      <div className="main-wrapper">
        <Header setIsCollapsed={setIsCollapsed} isCollapsed={isCollapsed} />
        <main className="content-area fade-in">
          <Outlet />
        </main>
      </div>

      {/* AI Health Chatbot — always visible on all pages */}
      <ChatBot />
    </div>
  );
};

export default Layout;
