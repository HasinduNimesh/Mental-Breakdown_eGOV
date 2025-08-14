import React from 'react';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';

const languages = [
  { code: 'si', title: 'සිංහල', subtitle: 'Sri Lanka – සිංහල', ring: 'ring-blue-200', bg: 'bg-blue-600' },
  { code: 'ta', title: 'தமிழ்', subtitle: 'இலங்கை – தமிழ்', ring: 'ring-purple-200', bg: 'bg-purple-600' },
  { code: 'en', title: 'English', subtitle: 'Sri Lanka – English', ring: 'ring-green-200', bg: 'bg-green-600' },
] as const;

export default function ChooseLanguage() {
  const router = useRouter();

  const select = async (locale: string) => {
    try {
      // Persist the choice so middleware and SSR know immediately
      document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
    } catch {}
    // Navigate to home in the selected locale
    await router.replace('/', undefined, { locale });
  };

  return (
    <div className="min-h-screen bg-blue-900 text-white relative overflow-hidden">
      {/* Decorative background image (watermark) */}
      <img
        src="/images/Sri_Lanka_Flag_Lion.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute right-[-4rem] bottom-[-2rem] lg:right-[-6rem] lg:bottom-[-3rem] w-[420px] md:w-[520px] lg:w-[640px] opacity-10 lg:opacity-20"
      />
      <Container className="relative z-10 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Select Your Language</h1>
          <p className="mt-3 text-base text-blue-100">
            Choose the language you are most comfortable with to continue.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => select(l.code)}
              className={`group relative text-left focus:outline-none transition-transform duration-200 hover:-translate-y-1`}
              aria-label={`Switch to ${l.title}`}
            >
              <Card className="overflow-hidden p-6 bg-white text-gray-900 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="relative z-10">
                  {/* Icon capsule */}
                  <div className={`relative h-16 w-16 rounded-full ${l.bg} text-white flex items-center justify-center shadow-md mx-auto`}>
                    <span className="font-extrabold text-lg">{l.code.toUpperCase()}</span>
                    <div className={`absolute -inset-1 rounded-full ${l.ring} opacity-0 group-hover:opacity-60 transition-opacity`} />
                  </div>

                  <div className="mt-4 text-center">
                    <div className="text-xl font-semibold text-gray-900">{l.title}</div>
                    <div className="text-sm text-gray-500 mt-1">{l.subtitle}</div>
                  </div>

                  {/* Selection indicator */}
                  <div className="mt-5 flex justify-center">
                    <div className={`h-0.5 w-10 bg-gray-200 rounded-full group-hover:bg-gray-300 transition-colors`} />
                  </div>
                </div>
              </Card>
            </button>
          ))}
        </div>

        {/* Optional help */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-blue-100 text-sm border border-white/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            You can change language anytime from the header.
          </div>
        </div>
      </Container>
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
