import React from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Layout } from '@/components/layout/Layout';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

const HelpPage: React.FC = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/10" />
          <svg className="absolute right-0 top-0 h-full w-1/2 opacity-10" viewBox="0 0 400 400" aria-hidden>
            <defs>
              <pattern id="guide-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M20 0L30 10L20 20L10 10Z" fill="white" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#guide-pattern)" />
          </svg>
        </div>
        <Container className="relative py-16 sm:py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="text-blue-200 text-xs sm:text-sm uppercase tracking-wider mb-3 font-semibold">Guides</div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">Service Guide</h1>
            <p className="text-blue-100 text-lg max-w-2xl">
              Learn how government services work, what documents you need, and how to book an appointment quickly.
            </p>
            {/* Quick search deep-linking to /services */}
            <form action="/services" method="get" className="mt-8 max-w-xl">
              <div className="relative">
                <input
                  type="text"
                  name="query"
                  placeholder="Search services, departments, or documents..."
                  className="w-full pl-4 pr-32 py-4 rounded-xl text-text-900 placeholder-text-500 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                />
                <Button type="submit" variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2">Search</Button>
              </div>
            </form>
          </div>
        </Container>
      </section>

      {/* Breadcrumbs */}
      <div className="bg-white">
        <Container className="pt-4">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Service Guide' }]} />
        </Container>
      </div>

  {/* Content */}
      <section className="py-10 sm:py-14 bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Overview */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-text-900 mb-3">Before you book</h2>
                <p className="text-text-700">
                  Each service may require specific documents and eligibility. Review the steps and make sure you have the
                  right information prepared to avoid delays.
                </p>
                <ul className="mt-4 list-disc list-inside text-text-700 space-y-1">
                  <li>Check your eligibility and required documents</li>
                  <li>Choose a convenient location and date</li>
                  <li>Allow enough processing time for your needs</li>
                </ul>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold text-text-900 mb-3">Typical steps</h2>
                <ol className="list-decimal list-inside text-text-700 space-y-2">
                  <li>Find your service and review requirements</li>
                  <li>Book an appointment online</li>
                  <li>Visit the office (or complete online if available)</li>
                  <li>Track status and collect your documents</li>
                </ol>
              </Card>

              {/* Popular guides with anchors used around the app */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-text-900 mb-3">Popular guides</h2>
                <div className="space-y-5 text-text-700">
                  <div>
                    <h3 id="passport" className="font-medium text-text-900">Passport Application</h3>
                    <p>Requirements: National ID, Birth Certificate, photographs, and application form.</p>
                  </div>
                  <div>
                    <h3 id="license" className="font-medium text-text-900">Driving Licence</h3>
                    <p>Renewals and tests. Bring your previous licence and valid medical certificate.</p>
                  </div>
                  <div>
                    <h3 id="birth-cert" className="font-medium text-text-900">Birth Certificate</h3>
                    <p>Certified copies available nationwide. Parents’ IDs and hospital records may be needed.</p>
                  </div>
                  <div>
                    <h3 id="pcc" className="font-medium text-text-900">Police Clearance Certificate</h3>
                    <p>For employment, visas, and immigration. Fingerprints and purpose declaration required.</p>
                  </div>
                  <div>
                    <h3 id="consular" className="font-medium text-text-900">Consular Attestation</h3>
                    <p>Document attestation and visa-related services via Ministry of Foreign Affairs.</p>
                  </div>
                  <div>
                    <h3 id="business" className="font-medium text-text-900">Business Registration</h3>
                    <p>Company incorporation and name reservation. Director details and registered address required.</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold text-text-900 mb-3">Processing times and fees</h2>
                <p className="text-text-700">
                  Processing times vary by service, location, and workload. Some services provide same‑day options for an
                  additional fee. Refer to the service page for the most accurate estimates.
                </p>
              </Card>

              <Card className="p-6">
                <h2 id="faq" className="text-xl font-semibold text-text-900 mb-3">Frequently asked questions</h2>
                <div className="space-y-4 text-text-700">
                  <div>
                    <p className="font-medium text-text-900">Can I complete services online?</p>
                    <p>Many services offer fully online or hybrid options. Look for the “Online” badge on the service card.</p>
                  </div>
                  <div>
                    <p className="font-medium text-text-900">What if I miss my appointment?</p>
                    <p>You can reschedule from your profile. Some services may require a new booking.</p>
                  </div>
                  <div>
                    <p className="font-medium text-text-900">How do I prepare documents?</p>
                    <p>Bring original documents and photocopies. If uploading, use clear scans or photos.</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-text-900 mb-3">Quick links</h3>
                <div className="flex flex-col gap-2">
                  <Button href="/services" variant="outline">Browse services</Button>
                  <Button href="/book">Book appointment</Button>
                  <Button href="/appointments" variant="ghost">My appointments</Button>
                </div>
              </Card>

              <Card className="p-6">
                <h3 id="offices" className="text-lg font-semibold text-text-900 mb-3">Find offices</h3>
                <p className="text-text-700 mb-4">Looking for a nearby department or branch? Use the services list to filter by location.</p>
                <Button href="/services" variant="outline">Filter by location</Button>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-text-900 mb-3">Need more help?</h3>
                <p className="text-text-700 mb-4">If you can’t find what you need, contact support for assistance.</p>
                <Button href="/contact" variant="outline">Contact support</Button>
              </Card>
            </div>
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

export default HelpPage;
