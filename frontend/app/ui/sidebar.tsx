'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { name: 'Conversations', href: '/' },
  { name: 'Dashboard', href: '/dashboard' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 p-8 border-r border-border">
      <nav className="flex flex-col space-y-2">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-lg font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
              }`}>
              {link.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
