import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { wsUrl } from '../config/api';

// Maintain a single WebSocket connection for the application
let wsConnection = null;
let listeners = [];

const connectWebSocket = () => {
  if (wsConnection) return;
  
  wsConnection = new WebSocket(wsUrl('/ws'));
  
  wsConnection.onopen = () => {
    console.log('Realtime WebSocket connected');
  };

  wsConnection.onmessage = (event) => {
    if (event.data === 'new_prediction') {
      toast.success('New AI health analysis completed! Updating data...', { icon: '⚡', id: 'new_prediction' });
      listeners.forEach(callback => callback(event.data));
    }
  };

  wsConnection.onclose = () => {
    console.log('Realtime WebSocket disconnected');
    wsConnection = null;
    // Optional: add reconnection logic here if desired
  };
};

export const useRealtime = (callback) => {
  useEffect(() => {
    if (!wsConnection) {
      connectWebSocket();
    }
    
    if (callback) {
      listeners.push(callback);
    }
    
    return () => {
      if (callback) {
        listeners = listeners.filter(cb => cb !== callback);
      }
    };
  }, [callback]);
};
