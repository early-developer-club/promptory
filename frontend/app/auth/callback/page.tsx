'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

export default function AuthCallbackPage() {
  const { setToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1)); // Remove the #
      const accessToken = params.get('access_token');
      if (accessToken) {
        // 1. Set the token in the web app's context (and localStorage)
        setToken(accessToken);

        // 2. Send the token to the Chrome extension
        const extensionId = 'bmbdphohngnoggmpliocccppcfndlamm'; // NOTE: This is specific to your local setup
        if ((window as any).chrome && (window as any).chrome.runtime) {
          (window as any).chrome.runtime.sendMessage(
            extensionId,
            { type: 'SET_TOKEN', token: accessToken },
            (response: any) => {
              if ((window as any).chrome.runtime.lastError) {
                console.error('Error sending token to extension:', chrome.runtime.lastError.message);
              } else {
                console.log('Successfully sent token to extension:', response?.status);
              }
            }
          );
        } else {
            console.warn('Not running in an environment with Chrome extension APIs.');
        }

        // 3. Redirect to the dashboard
        router.push('/dashboard');
      }
    }
  }, [router, setToken]);

  return <div>Loading...</div>;
}
