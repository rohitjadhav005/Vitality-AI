import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ChatBot from './ChatBot';

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Intersection Observer for mobile scroll animations
  useEffect(() => {
    // Only run intersection logic if it's mobile or you just want it everywhere
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('scroll-animated');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -20px 0px" });

    const observeElements = () => {
      const elements = document.querySelectorAll('.glass-card, .metric-card, .chart-card, .tip-card, .notif-item, .history-item');
      elements.forEach(el => {
        if (!el.classList.contains('scroll-animated') && !el.classList.contains('scroll-observing')) {
          el.classList.add('scroll-observing');
          observer.observe(el);
        }
      });
    };

    observeElements();
    const mutationObserver = new MutationObserver(observeElements);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

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
