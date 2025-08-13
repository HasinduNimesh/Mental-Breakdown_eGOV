import React from 'react';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';

const languages = [
  { code: 'si', title: 'සිංහල', subtitle: 'Sri Lanka – සිංහල', ring: 'ring-blue-200', grad: 'from-blue-500 to-blue-600' },
  { code: 'ta', title: 'தமிழ்', subtitle: 'இலங்கை – தமிழ்', ring: 'ring-purple-200', grad: 'from-purple-500 to-purple-600' },
  { code: 'en', title: 'English', subtitle: 'Sri Lanka – English', ring: 'ring-green-200', grad: 'from-green-500 to-green-600' },
] as const;

export default function ChooseLanguage() {
  const router = useRouter();

  const select = async (locale: string) => {
    await router.push('/', '/', { locale });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white">
      {/* Background pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <svg className="absolute right-0 top-0 h-full w-1/2" viewBox="0 0 400 400" aria-hidden="true">
          <defs>
            <pattern id="lang-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M20 0L30 10L20 20L10 10Z" fill="white" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lang-pattern)" />
        </svg>
      </div>

      <Container className="relative py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Select Your Language</h1>
          <p className="mt-3 text-blue-100">Choose the language you are most comfortable with to continue.</p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => select(l.code)}
              className={`group relative text-left focus:outline-none`}
              aria-label={`Switch to ${l.title}`}
            >
              <Card className="overflow-hidden p-6 bg-white text-text-900">
                {/* inset ring */}
                <div className={`absolute inset-0 rounded-xl ring-1 ${l.ring} pointer-events-none`} />
                {/* icon capsule */}
                <div className={`relative h-16 w-16 rounded-full bg-gradient-to-br ${l.grad} text-white flex items-center justify-center shadow-lg`}>
                  <span className="font-extrabold text-lg drop-shadow">{l.code.toUpperCase()}</span>
                  <div className="absolute -inset-1 rounded-full bg-white/10 opacity-0 blur-sm group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="mt-4">
                  <div className="text-xl font-semibold">{l.title}</div>
                  <div className="text-sm text-text-500">{l.subtitle}</div>
                </div>
              </Card>
            </button>
          ))}
        </div>

        {/* Optional help */}
        <div className="mt-8 text-center text-blue-100 text-sm">
          You can change language anytime from the header.
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
