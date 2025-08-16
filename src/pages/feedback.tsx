import React from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { Layout } from '@/components/layout/Layout';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StarIcon } from '@heroicons/react/24/outline';

const FeedbackPage: React.FC = () => {
  const { t } = useTranslation('common');

  const [rating, setRating] = React.useState(0);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [feedback, setFeedback] = React.useState('');

  const stars = [1, 2, 3, 4, 5];
  const ratingLabels = ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'];

  const handleSubmit = () => {
    console.log('Rating:', rating);
    console.log('Feedback:', feedback);
    alert('Thank you for your feedback!');
    setRating(0);
    setFeedback('');
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
