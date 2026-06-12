import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// For physical device testing on the same Wi-Fi network:
// Use your computer's local IP address
const API_BASE_URL = 'http://192.168.1.25:8000';

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token from SecureStore', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const setAuthToken = async (token: string) => {
  await SecureStore.setItemAsync('token', token);
};

export const clearAuthToken = async () => {
  await SecureStore.deleteItemAsync('token');
};

export default apiClient;
