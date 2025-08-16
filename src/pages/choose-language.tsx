import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import dynamic from 'next/dynamic';

const Globe = dynamic(() => import('@/components/magicui/globe'), { ssr: false });

const languages = [
  { 
    code: 'si', 
    title: 'සිංහල', 
    subtitle: 'Sri Lanka – සිංහල', 
    ring: 'ring-blue-200', 
    bg: 'bg-blue-600',
    gradient: 'from-blue-500 to-blue-700',
    shadowColor: 'shadow-blue-500/25',
    glowColor: 'blue-400',
    flag: '🇱🇰',
    description: 'Native Sri Lankan language',
    users: '16M+ speakers',
    accent: 'from-blue-400 via-cyan-400 to-blue-600'
  },
  { 
    code: 'ta', 
    title: 'தமிழ்', 
    subtitle: 'இலங்கை – தமிழ்', 
    ring: 'ring-purple-200', 
    bg: 'bg-purple-600',
    gradient: 'from-purple-500 to-purple-700',
    shadowColor: 'shadow-purple-500/25',
    glowColor: 'purple-400',
    flag: '🇱🇰',
    description: 'Classical Tamil heritage',
    users: '4M+ speakers',
    accent: 'from-purple-400 via-pink-400 to-purple-600'
  },
  { 
    code: 'en', 
    title: 'English', 
    subtitle: 'Sri Lanka – English', 
    ring: 'ring-green-200', 
    bg: 'bg-green-600',
    gradient: 'from-green-500 to-green-700',
    shadowColor: 'shadow-green-500/25',
    glowColor: 'green-400',
    flag: '🇱🇰',
    description: 'International standard',
    users: 'Global language',
    accent: 'from-green-400 via-emerald-400 to-green-600'
  },
] as const;

export default function ChooseLanguage() {
  const router = useRouter();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const headings: Record<string, { title: string; subtitle: string }> = {
    en: {
      title: 'Choose your language',
      subtitle: 'Select your preferred language to access government services.',
    },
    si: {
      title: 'ඔබගේ භාෂාව තෝරන්න',
      subtitle: 'රජයේ සේවාවන් ලබා ගැනීමට ඔබ කැමති භාෂාව තෝරන්න.',
    },
    ta: {
      title: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்',
      subtitle: 'அரசு சேவைகளுக்கு அணுக உங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்.',
    },
  };
  const current = headings[router.locale as string] ?? headings.en;

  const select = async (locale: string) => {
    setSelectedCard(locale);
    setIsLoading(true);
    
    try {
      document.cookie = 'NEXT_LOCALE=' + locale + '; path=/; max-age=31536000; SameSite=Lax';
      await new Promise(resolve => setTimeout(resolve, 300));
      await router.push('/', '/', { locale });
    } catch (error) {
      console.error('Language switch failed:', error);
      setIsLoading(false);
      setSelectedCard(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
        <div className="w-full h-full max-w-2xl max-h-2xl">
          <Globe size={800} />
        </div>
      </div>

      <Container className="relative z-10 py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-12 md:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
              {current.title}
            </h1>
            <p className="mt-4 text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {current.subtitle}
            </p>
          </header>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {languages.map((lang) => (
              <Card
                key={lang.code}
                className="group relative cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden bg-white border-2 border-gray-100 hover:border-gray-200"
                onClick={() => select(lang.code)}
              >
                <div className="relative p-6 md:p-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl md:text-4xl">
                      {lang.flag}
                    </span>
                    <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                      {lang.code}
                    </span>
                  </div>
                  
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                    {lang.title}
                  </h3>
                  
                  <p className="text-sm md:text-base text-gray-600 mb-4 leading-relaxed">
                    {lang.subtitle}
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-xs md:text-sm text-gray-500 font-medium">
                      {lang.description}
                    </p>
                    <p className="text-xs text-gray-400">
                      {lang.users}
                    </p>
                  </div>

                  {selectedCard === lang.code && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 md:mt-16">
          <div className="text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">
                Need Help?
              </h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
                Choose your preferred language to continue with government services. 
                Your selection will be saved for future visits.
              </p>
            </div>
          </div>
        </div>
      </Container>

      {isLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 shadow-2xl flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-gray-700 font-medium">Loading your experience...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};
