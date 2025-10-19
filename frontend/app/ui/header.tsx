'use client';

import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';

export default function Header() {
  const { token, logout } = useAuth();

  return (
    <header className="bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-1">
            {/* Spacer */}
          </div>
          <Link href="/" className="text-4xl font-bold text-text-primary">Promptory</Link>
          <div className="flex-1 flex justify-end">
            <nav className="flex items-center space-x-4">
              {token ? (
                <>
                  <Link href="/dashboard" className="text-text-secondary hover:text-text-primary transition-colors duration-200">Dashboard</Link>
                  <button onClick={logout} className="text-text-secondary hover:text-text-primary transition-colors duration-200">Logout</button>
                </>
              ) : (
                <a href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`} className="px-6 py-2 rounded-md bg-primary text-white font-semibold shadow-sm hover:bg-primary-hover transition-colors duration-200">
                  Login with Google
                </a>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
