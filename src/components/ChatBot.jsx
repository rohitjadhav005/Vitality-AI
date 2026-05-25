import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { apiUrl } from '../config/api';
import './ChatBot.css';

const SUGGESTIONS = [
  "How can I boost my energy? ⚡",
  "Why am I so stressed? 🧠",
  "How to sleep better? 💤",
  "Tips to stay productive 🎯",
  "Am I drinking enough water? 💧",
];

const WELCOME_MESSAGE = {
  role: 'ai',
  text: "Hi there! 👋 I'm **Vitality AI**, your personal health coach.\n\nI can see your health data and give you personalized advice on energy, sleep, stress, and productivity.\n\nWhat would you like to know today?",
};

// Simple markdown-like renderer for bold/bullets
function renderBubbleText(text) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Bold **text**
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    // Bullet points
    if (line.startsWith('- ') || line.startsWith('• ')) {
      return (
        <div key={i} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.2rem' }}>
          <span style={{ color: 'var(--primary-color)', flexShrink: 0 }}>•</span>
          <span>{parts.slice(1)}</span>
        </div>
      );
    }

    return <div key={i} style={{ marginBottom: line === '' ? '0.4rem' : '0' }}>{parts}</div>;
  });
}

const ChatBot = () => {
  const [isOpen, setIsOpen]       = useState(false);
  const [messages, setMessages]   = useState([WELCOME_MESSAGE]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef             = useRef(null);
  const inputRef                   = useRef(null);

  // Auto-scroll to latest message
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, messages, scrollToBottom]);

  const sendMessage = useCallback(async (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || loading) return;

    const userMsg = { role: 'user', text: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      // Build history: only real user/model messages (skip welcome AI message for context building)
      const apiHistory = nextMessages
        .filter(m => m !== WELCOME_MESSAGE)
        .map(m => ({ role: m.role === 'ai' ? 'model' : m.role, text: m.text }));

      // Last message is the new user message
      const res = await fetch(apiUrl('/api/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: apiHistory }),
      });

      const data = await res.json();
      const aiMsg = { role: 'ai', text: data.reply || "Sorry, I couldn't understand that. Try again! 🙏" };
      setMessages(prev => [...prev, aiMsg]);

      if (!isOpen) setHasUnread(true);
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: "Oops! I'm having connection trouble. Please check your internet and try again. 🙏",
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestion = (text) => {
    sendMessage(text);
  };

  const showSuggestions = messages.length <= 1 && !loading;

  return (
    <>
      {/* Floating Action Button */}
      <button
        className="chatbot-fab"
        onClick={() => setIsOpen(o => !o)}
        aria-label={isOpen ? 'Close chat' : 'Open health chat'}
        id="chatbot-fab-btn"
      >
        {isOpen
          ? <X size={20} color="#fff" />
          : <MessageCircle size={20} color="#fff" />
        }
        {hasUnread && !isOpen && <span className="chatbot-unread-badge" />}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="chatbot-panel" role="dialog" aria-label="Vitality AI Health Chatbot">

          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-avatar">🤖</div>
            <div className="chatbot-header-info">
              <div className="chatbot-header-name">Vitality AI Coach</div>
              <div className="chatbot-header-status">
                <span className="chatbot-status-dot" />
                Online · Health & Wellness
              </div>
            </div>
            <button className="chatbot-close-btn" onClick={() => setIsOpen(false)} aria-label="Close chat">
              <X size={15} />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages" id="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-msg ${msg.role}`}>
                {msg.role === 'ai' && (
                  <div className="chatbot-msg-avatar">
                    <Bot size={12} color="#fff" />
                  </div>
                )}
                <div className="chatbot-bubble">
                  {renderBubbleText(msg.text)}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="chatbot-msg ai chatbot-typing">
                <div className="chatbot-msg-avatar">
                  <Bot size={12} color="#fff" />
                </div>
                <div className="chatbot-typing-dots">
                  <span className="chatbot-typing-dot" />
                  <span className="chatbot-typing-dot" />
                  <span className="chatbot-typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          {showSuggestions && (
            <div className="chatbot-suggestions">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  className="chatbot-suggestion-chip"
                  onClick={() => handleSuggestion(s)}
                  id={`chatbot-suggestion-${i}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input Row */}
          <div className="chatbot-input-row">
            <textarea
              ref={inputRef}
              id="chatbot-input"
              className="chatbot-input"
              placeholder="Ask about your health..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
            />
            <button
              id="chatbot-send-btn"
              className="chatbot-send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              <Send size={14} />
            </button>
          </div>

        </div>
      )}
    </>
  );
};

export default ChatBot;
