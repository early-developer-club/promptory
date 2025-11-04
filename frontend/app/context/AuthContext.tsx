'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function hasChromeExt() {
  if (typeof window === 'undefined') return false;
  const w = window as any;
  return typeof w.chrome !== 'undefined' && !!w.chrome.runtime?.id;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    // 브라우저 환경에서만 localStorage 접근
    if (typeof window === 'undefined') return;
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) setTokenState(storedToken);

    // (선택) 확장프로그램 저장소에도 토큰이 있을 수 있으므로 읽어오기 (있을 때만)
    if (!storedToken && hasChromeExt()) {
      try {
        const w = window as any;
        w.chrome.storage?.local?.get(['access_token'], (res: any) => {
          if (res?.access_token) setTokenState(res.access_token);
        });
      } catch {
        /* no-op */
      }
    }
  }, []);

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);

    if (typeof window !== 'undefined') {
      if (newToken) {
        localStorage.setItem('access_token', newToken);

        // 확장 환경일 때만 메시지 전송
        if (hasChromeExt()) {
          try {
            const w = window as any;
            w.chrome.runtime?.sendMessage(
              'bmbdphohngnoggmpliocccppcfndlamm',
              { type: 'SET_TOKEN', token: newToken },
              (response: any) => {
                const lastErr = w.chrome.runtime?.lastError;
                if (lastErr) {
                  console.error('Error sending token to extension:', lastErr.message);
                  return;
                }
                if (response?.status !== 'success') {
                  console.error('Failed to send token to extension.', response?.message);
                }
              }
            );
          } catch (e) {
            console.error('Extension messaging failed:', e);
          }
        }
      } else {
        // 토큰 제거
        localStorage.removeItem('access_token');

        if (hasChromeExt()) {
          try {
            const w = window as any;
            w.chrome.storage?.local?.remove('access_token');
          } catch {
            /* no-op */
          }
        }
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
