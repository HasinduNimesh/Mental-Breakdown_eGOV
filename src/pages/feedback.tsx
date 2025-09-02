import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { Layout } from '@/components/layout/Layout';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StarIcon } from '@heroicons/react/24/outline';

type FeedbackItem = {
  id: string;
  rating: number;
  text: string;
  createdAt: string; // ISO string
};

const FeedbackPage: React.FC = () => {
  const { t } = useTranslation('common');

  const [rating, setRating] = React.useState(0);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [feedback, setFeedback] = React.useState('');
  const [feedbacks, setFeedbacks] = React.useState<FeedbackItem[]>([]);

  const stars = [1, 2, 3, 4, 5];
  const ratingLabels = ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'];

  // Load persisted feedbacks (local browser) and seed with a few examples
  React.useEffect(() => {
    (async () => {
      // Try Supabase first
      try {
        const { data, error } = await supabase
          .from('feedbacks')
          .select('id, rating, message, created_at')
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(30);

        if (!error && data && data.length > 0) {
          const mapped: FeedbackItem[] = data.map((r: any) => ({
            id: String(r.id),
            rating: r.rating ?? 0,
            text: r.message ?? '',
            createdAt: r.created_at ?? new Date().toISOString(),
          }));
          setFeedbacks(mapped);
          return;
        }
      } catch {
        // fall through to local
      }

      // Local fallback
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('egov_feedbacks_v1') : null;
        const parsed: FeedbackItem[] = raw ? JSON.parse(raw) : [];
        if (parsed.length > 0) {
          setFeedbacks(parsed);
        } else {
          const seed: FeedbackItem[] = [
            { id: 's1', rating: 5, text: 'Quick booking process and helpful reminders. Great experience!', createdAt: new Date().toISOString() },
            { id: 's2', rating: 4, text: 'Got my appointment without any hassle. UI is clean and simple.', createdAt: new Date().toISOString() },
            { id: 's3', rating: 5, text: 'Love the confirmation PDF and calendar add feature.', createdAt: new Date().toISOString() },
            { id: 's4', rating: 4, text: 'Document upload was smooth. Keep it up!', createdAt: new Date().toISOString() },
          ];
          setFeedbacks(seed);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const persistFeedbacks = (items: FeedbackItem[]) => {
    setFeedbacks(items);
    try {
      if (typeof window !== 'undefined') localStorage.setItem('egov_feedbacks_v1', JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  };

  const handleSubmit = async () => {
    const newItem: FeedbackItem = {
      id: `f_${Date.now()}`,
      rating,
      text: feedback.trim(),
      createdAt: new Date().toISOString(),
    };
    if (!newItem.text && newItem.rating === 0) return;

    // Try Supabase insert
    let saved = false;
    try {
      const { data, error } = await supabase
        .from('feedbacks')
        .insert({ rating: newItem.rating, message: newItem.text, is_public: true, locale: (typeof navigator !== 'undefined' ? navigator.language : 'en') })
        .select('id, created_at')
        .single();
      if (!error && data) {
        const persisted: FeedbackItem = {
          ...newItem,
          id: String(data.id ?? newItem.id),
          createdAt: data.created_at ?? newItem.createdAt,
        };
        setFeedbacks([persisted, ...feedbacks].slice(0, 50));
        saved = true;
      }
    } catch {
      // ignore and fallback
    }

    if (!saved) {
      const next = [newItem, ...feedbacks].slice(0, 50); // keep last 50
      persistFeedbacks(next);
    }

    alert('Thank you for your feedback!');
    setRating(0);
    setFeedback('');
  };

  const displayName = (f: FeedbackItem) => {
    const suffix = f.id?.slice(-4) || '';
    return `Citizen${suffix ? ' ' + suffix : ''}`;
  };

  const displayDate = (f: FeedbackItem) => {
    try {
      return new Date(f.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <Layout>
      {/* Hero Section with decorative elements */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/10" />
          {/* Hero pattern */}
          <svg className="absolute right-0 top-0 h-full w-1/2 opacity-10" viewBox="0 0 400 400" aria-hidden="true">
            <defs>
              <pattern id="feedback-hero-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M20 0L30 10L20 20L10 10Z" fill="white" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#feedback-hero-pattern)" />
          </svg>
        </div>

        <Container className="relative py-16 sm:py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left max-w-xl mx-auto lg:mx-0">
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">We Value Your Feedback</h1>
              <p className="text-blue-200 text-lg sm:text-xl mb-6">
                Help us improve the Citizen Services Portal by sharing your experience.
              </p>
            </div>

            {/* Decorative blurred floating cards with subtle animation */}
            <div className="relative hidden lg:block">
              <div className="absolute top-8 right-8 w-72 h-48 rounded-lg bg-white/10 border border-white/20 backdrop-blur-sm transform rotate-6 shadow-2xl animate-float1">
                <div className="p-6">
                  <div className="text-white font-semibold mb-2">Citizen Focus</div>
                  <div className="text-blue-200 text-sm">Your feedback matters</div>
                </div>
              </div>
              <div className="absolute top-32 right-16 w-64 h-40 rounded-lg bg-white/5 border border-white/20 backdrop-blur-sm transform -rotate-3 shadow-xl animate-float2">
                <div className="p-6">
                  <div className="text-white font-semibold mb-2">Continuous Improvement</div>
                  <div className="text-blue-200 text-sm">Better services for everyone</div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Recent feedback ticker */}
      {feedbacks.length > 0 && (
        <section className="py-8 bg-white border-y border-border/50">
          <Container>
            <div className="mb-3 text-sm font-medium text-text-700">Recent feedback</div>
            <div className="group relative overflow-hidden">
              {/* gradient edges */}
              <div className="pointer-events-none absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-white to-transparent"/>
              <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white to-transparent"/>

              <div className="flex whitespace-nowrap will-change-transform animate-marquee-ltr" aria-live="polite">
                {[...feedbacks, ...feedbacks].map((f, idx) => (
                  <div key={`${f.id}-${idx}`} className="mr-4 inline-flex">
                    <article className="rounded-xl border border-border bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow min-w-[260px] max-w-[420px]">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 h-8 w-8 shrink-0 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center font-semibold">
                          {displayName(f).slice(0,1)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-amber-500 mb-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <svg key={i} className={`h-4 w-4 ${i < f.rating ? 'fill-current' : 'text-amber-300'}`} viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.801 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                              </svg>
                            ))}
                          </div>
                          <p className="clamp-2 text-sm text-text-700">{f.text || '—'}</p>
                          <div className="mt-2 flex items-center justify-between text-xs text-text-500">
                            <span className="truncate max-w-[16ch]">{displayName(f)}</span>
                            <time title={f.createdAt}>{displayDate(f)}</time>
                          </div>
                        </div>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Feedback Form Section */}
      <section className="py-16 bg-bg-100">
        <Container>
          <div className="max-w-2xl mx-auto">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-text-900 mb-6 text-center">Submit Your Feedback</h2>

              {/* Star Rating */}
              <div className="flex flex-col items-center gap-3 mb-6">
                <div className="flex gap-2">
                  {stars.map((star) => (
                    <StarIcon
                      key={star}
                      className={`w-10 h-10 cursor-pointer transition-all duration-200 transform hover:scale-125 hover:text-yellow-500 ${
                        star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    />
                  ))}
                </div>
                <div className="text-text-700 font-medium">
                  {hoverRating > 0
                    ? ratingLabels[hoverRating - 1]
                    : rating > 0
                    ? ratingLabels[rating - 1]
                    : 'Select a rating'}
                </div>
              </div>

              {/* Feedback Text */}
              <textarea
                className="w-full border border-border rounded-md p-3 text-text-700 resize-none mb-6 focus:outline-none focus:ring-2 focus:ring-primary-600"
                rows={5}
                placeholder="Write your suggestions or comments here..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />

              <Button size="lg" onClick={handleSubmit} className="w-full">
                Submit Feedback
              </Button>
            </Card>
          </div>
        </Container>
      </section>

      {/* Floating animation styles */}
      <style jsx>{`
        @keyframes marquee-ltr {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee-ltr {
          animation: marquee-ltr 30s linear infinite;
        }
          /* Pause marquee on hover */
          .group:hover .animate-marquee-ltr { animation-play-state: paused; }
          /* Multi-line clamp utility */
          .clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        @keyframes float1 {
          0%, 100% { transform: rotate(6deg) translateY(0px); }
          50% { transform: rotate(6deg) translateY(-10px); }
        }
        @keyframes float2 {
          0%, 100% { transform: rotate(-3deg) translateY(0px); }
          50% { transform: rotate(-3deg) translateY(-8px); }
        }
        .animate-float1 { animation: float1 6s ease-in-out infinite; }
        .animate-float2 { animation: float2 5s ease-in-out infinite; }
      `}</style>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};

export default FeedbackPage;
