'use client';

import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/components/ui/button';
import { apiUrl } from '@/app/lib/api';

export default function Header() {
  const { token, logout } = useAuth();

  return (
    <header className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-1">{/* Spacer */}</div>

          <Link href="/" className="text-3xl md:text-4xl font-bold text-foreground">
            Promptory
          </Link>

          <div className="flex-1 flex justify-end">
            <nav className="flex items-center space-x-2">
              {token ? (
                <>
                  <Button asChild variant="ghost">
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button variant="ghost" onClick={logout}>
                    Logout
                  </Button>
                </>
              ) : (
                <Button asChild>
                  <a href={apiUrl('/api/v1/auth/google')}>
                    Login with Google
                  </a>
                </Button>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
