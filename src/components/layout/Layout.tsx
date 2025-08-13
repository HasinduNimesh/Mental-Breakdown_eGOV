import React from 'react';
import { useUIStore } from '@/stores';
import { Header } from './Header';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { accessibility } = useUIStore();
  const router = useRouter();
  const hideHeader = router.pathname === '/choose-language';

  return (
    <div className={`min-h-screen bg-bg-100 ${accessibility.highContrast ? 'high-contrast' : ''} ${accessibility.largeText ? 'large-text' : ''}`}>
      {!hideHeader && <Header />}
      <main>
        {children}
      </main>
    </div>
  );
};
