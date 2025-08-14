import React from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Layout } from '@/components/layout/Layout';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FOOTER_DETAILS } from '@/lib/footerConfig';
import { EnvelopeIcon, MapPinIcon, PhoneIcon, ClockIcon } from '@heroicons/react/24/outline';

const ContactPage: React.FC = () => {
  const { orgName, address, phones, email } = FOOTER_DETAILS;

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
        {/* Background pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/10" />
          {/* Government-style pattern */}
          <svg className="absolute right-0 top-0 h-full w-1/2 opacity-10" viewBox="0 0 400 400" aria-hidden="true">
            <defs>
              <pattern id="contact-govt-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M20 0L30 10L20 20L10 10Z" fill="white" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#contact-govt-pattern)" />
          </svg>
        </div>

        {/* Hero Content */}
        <Container className="relative py-16 sm:py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <div className="text-blue-200 text-xs sm:text-sm uppercase tracking-wider mb-4 font-semibold">
                OUR MISSION IS <span className="text-orange-400">FOR YOU!</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6">
                Contact Us
              </h1>
              <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 max-w-xl">
                "Public service should be the birthright of every citizen"
              </p>
              <p className="text-base sm:text-lg text-blue-200 mb-6 sm:mb-8 max-w-xl">
                We're here to help. Reach out via phone, email, or visit our offices.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                <Button size="lg" variant="secondary">Call Now</Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:text-blue-900">Send Message</Button>
              </div>
            </div>
            
            {/* Right side with decorative elements */}
            <div className="relative hidden lg:block">
              <div className="absolute top-8 right-8 w-72 h-48 rounded-lg bg-white/10 border border-white/20 backdrop-blur-sm transform rotate-6 shadow-2xl">
                <div className="p-6">
                  <div className="text-white font-semibold mb-2">Digital Services</div>
                  <div className="text-blue-200 text-sm">Quick & Efficient</div>
                </div>
              </div>
              <div className="absolute top-32 right-16 w-64 h-40 rounded-lg bg-white/5 border border-white/20 backdrop-blur-sm transform -rotate-3 shadow-xl">
                <div className="p-6">
                  <div className="text-white font-semibold mb-2">Citizen First</div>
                  <div className="text-blue-200 text-sm">Service Excellence</div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Contact options */}
      <section className="py-12 sm:py-16 bg-white">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <PhoneIcon className="w-6 h-6 text-primary-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-900">Hotline</h3>
                  <p className="text-text-600 mb-3">Government Information Center</p>
                  <div className="space-y-1">
                    {phones.map((p) => (
                      <div key={p} className="font-medium text-text-900">{p}</div>
                    ))}
                    <div className="text-sm text-text-600">Short code: 1919</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center">
                  <EnvelopeIcon className="w-6 h-6 text-accent-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-900">Email Support</h3>
                  <p className="text-text-600 mb-3">We'll get back within one business day.</p>
                  <div className="font-medium text-text-900">{email}</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <MapPinIcon className="w-6 h-6 text-primary-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-900">Office</h3>
                  <p className="text-text-600 mb-3">{orgName}</p>
                  <div className="text-text-900">{address}</div>
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <ClockIcon className="w-6 h-6 text-primary-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-900">Hours</h3>
                  <div className="text-text-600">Mon–Fri, 8:30 AM – 4:30 PM</div>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:col-span-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-text-900">Need guidance?</h3>
                  <p className="text-text-600">Browse the Service Guide or share feedback so we can help you faster.</p>
                </div>
                <div className="flex gap-3">
                  <Button href="/help">Service Guide</Button>
                  <Button href="/feedback" variant="outline">Give Feedback</Button>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </section>
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

export default ContactPage;
