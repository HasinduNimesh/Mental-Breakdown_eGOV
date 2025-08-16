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
    ring: 'ring-primary-200', 
    bg: 'bg-primary-600',
    gradient: 'from-primary-500 to-primary-700',
    shadowColor: 'shadow-primary-500/25',
    glowColor: 'primary-400',
    flag: '🇱🇰',
    description: 'Native Sri Lankan language',
    users: '16M+ speakers',
    accent: 'from-primary-400 via-primary-300 to-primary-600',
    hoverColor: 'hover:border-primary-300'
  },
  { 
    code: 'ta', 
    title: 'தமிழ்', 
    subtitle: 'இலங்கை – தமிழ்', 
    ring: 'ring-accent-500', 
    bg: 'bg-accent-500',
    gradient: 'from-accent-500 to-accent-600',
    shadowColor: 'shadow-accent-500/25',
    glowColor: 'accent-500',
    flag: '🇱🇰',
    description: 'Classical Tamil heritage',
    users: '4M+ speakers',
    accent: 'from-accent-500 via-orange-400 to-accent-600',
    hoverColor: 'hover:border-accent-300'
  },
  { 
    code: 'en', 
    title: 'English', 
    subtitle: 'Sri Lanka – English', 
    ring: 'ring-primary-300', 
    bg: 'bg-primary-700',
    gradient: 'from-primary-600 to-primary-800',
    shadowColor: 'shadow-primary-600/25',
    glowColor: 'primary-500',
    flag: '🇱🇰',
    description: 'International standard',
    users: 'Global language',
    accent: 'from-primary-500 via-primary-400 to-primary-700',
    hoverColor: 'hover:border-primary-400'
  },
] as const;

export default function ChooseLanguage() {
  const router = useRouter();
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
    setIsLoading(true);
    
    try {
      document.cookie = 'NEXT_LOCALE=' + locale + '; path=/; max-age=31536000; SameSite=Lax';
      await new Promise(resolve => setTimeout(resolve, 300));
      await router.push('/', '/', { locale });
    } catch (error) {
      console.error('Language switch failed:', error);
      setIsLoading(false);
    }
  };

  return (
  <div className="h-dvh bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden overscroll-none">
      {/* Enhanced Background with Professional Patterns */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/5" />
        
        {/* Sophisticated geometric overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full">
            <svg width="100%" height="100%" className="opacity-30">
              <defs>
                <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1" opacity="0.1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>
        
        {/* Professional ambient lighting */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/4 -translate-x-1/2 h-[320px] w-[320px] sm:h-[400px] sm:w-[400px] md:h-[500px] md:w-[500px] rounded-full bg-gradient-to-r from-blue-400/15 via-indigo-400/15 to-purple-400/15 blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 h-[280px] w-[280px] sm:h-[350px] sm:w-[350px] rounded-full bg-gradient-to-l from-cyan-400/10 to-blue-400/10 blur-[90px]" />
          <div className="absolute top-1/2 left-1/4 h-[200px] w-[200px] rounded-full bg-gradient-to-br from-indigo-400/8 to-violet-400/8 blur-[70px]" />
        </div>

      </div>
      
      <Container className="relative z-10 h-dvh">
        <div
          className="h-full w-full flex flex-col justify-between items-center text-center px-4 sm:px-6 lg:px-8"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 40px)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)' }}
        >
          {/* Top: Welcome text in multiple languages */}
          <div className="w-full pt-8 pb-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent">
                ආයුබෝවන්   வரவேற்பு   welcome
              </span>
            </h1>
            {/* Decorative golden divider */}
            <div className="flex items-center justify-center mt-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-60"></div>
              <div className="mx-4 flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400 opacity-60"></div>
                <div className="w-1 h-1 rounded-full bg-yellow-400 opacity-40 mt-0.5"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-400 opacity-60"></div>
              </div>
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-60"></div>
            </div>
          </div>

          {/* Middle: Globe icon */}
          <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col items-center justify-center">
            <div className="mt-6 sm:mt-8">
              <div className="opacity-90 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem] drop-shadow-2xl">
                <Globe size={320} />
              </div>
            </div>
          </div>

          {/* Bottom: Language selection cards */}
          <div className="w-full max-w-4xl mx-auto pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
              {languages.map((lang, index) => (
                <Card
                  key={lang.code}
                  className={`group relative cursor-pointer select-none text-center
                              bg-white/90 hover:bg-white border border-white/20 hover:border-white/30
                              rounded-md sm:rounded-lg shadow-sm hover:shadow-md transition-all duration-200
                              p-2 sm:p-3 md:p-4 min-h-[44px] sm:min-h-[52px] md:min-h-[60px]
                              flex items-center justify-center animate-fade-in-up`}
                  style={{ animationDelay: `${index * 80}ms` }}
                  onClick={() => select(lang.code)}
                  role="button"
                  aria-label={`Select ${lang.title}`}
                >
                  <span className="text-sm xs:text-base sm:text-lg md:text-xl font-semibold text-slate-900">
                    {lang.title}
                  </span>
                </Card>
              ))}
            </div>
          </div>
  </div>
      </Container>

      {/* Enhanced Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/20 flex flex-col items-center space-y-4 sm:space-y-6 max-w-xs sm:max-w-sm mx-4">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-3 sm:border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
              <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 border-3 sm:border-4 border-transparent border-t-indigo-400 rounded-full animate-spin animate-reverse" style={{ animationDuration: '1.5s' }} />
            </div>
            <div className="text-center">
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1 sm:mb-2">Preparing Your Experience</h3>
              <p className="text-xs sm:text-sm text-slate-600">Configuring language settings...</p>
            </div>
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
