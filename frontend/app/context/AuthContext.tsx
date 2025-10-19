'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      setTokenState(storedToken);
    }
  }, []);

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem('access_token', newToken);
      // Also save to chrome.storage for the extension
      if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage(
          'bmbdphohngnoggmpliocccppcfndlamm',
          { type: 'SET_TOKEN', token: newToken },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error('Error sending token to extension:', chrome.runtime.lastError.message);
            } else if (response?.status === 'success') {
              console.log('Token successfully sent to extension.');
            } else {
              console.error('Failed to send token to extension.', response?.message);
            }
          }
        );
      }
    } else {
      localStorage.removeItem('access_token');
      if (window.chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.remove('access_token');
      }
    }
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
