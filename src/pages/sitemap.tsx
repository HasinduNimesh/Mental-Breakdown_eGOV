import React from 'react';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Layout } from '@/components/layout/Layout';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

type Props = { lastUpdated: string };

const SiteMapPage: React.FC<Props> = ({ lastUpdated }) => {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
        <Container className="py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-bold">Site Map</h1>
          <p className="text-blue-100 mt-2">A quick overview of pages available on this portal.</p>
        </Container>
      </section>

      {/* Breadcrumbs */}
      <div className="bg-white">
        <Container className="pt-4">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Site Map' }]} />
        </Container>
      </div>

      {/* Content */}
      <section className="py-10 sm:py-14 bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Primary navigation */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-text-900 mb-3">Navigation</h2>
              <ul className="space-y-2">
                <li><Link href="/" className="text-primary-700 hover:underline">Home</Link></li>
                <li><Link href="/services" className="text-primary-700 hover:underline">Services</Link></li>
                <li><Link href="/help" className="text-primary-700 hover:underline">Service Guide</Link></li>
                <li><Link href="/news" className="text-primary-700 hover:underline">News</Link></li>
                <li><Link href="/about" className="text-primary-700 hover:underline">About Us</Link></li>
                <li><Link href="/contact" className="text-primary-700 hover:underline">Contact</Link></li>
              </ul>
            </Card>

            {/* Services & popular links */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-text-900 mb-3">Services & Popular</h2>
              <ul className="space-y-2">
                <li><Link href="/services?query=passport" className="text-primary-700 hover:underline">Passport Application</Link></li>
                <li><Link href="/services?query=license" className="text-primary-700 hover:underline">Driving Licence</Link></li>
                <li><Link href="/services?query=birth" className="text-primary-700 hover:underline">Birth Certificate</Link></li>
                <li><Link href="/services?query=police" className="text-primary-700 hover:underline">Police Clearance Certificate</Link></li>
                <li><Link href="/services?query=business" className="text-primary-700 hover:underline">Business Registration</Link></li>
                <li><Link href="/services?query=consular" className="text-primary-700 hover:underline">Consular Services</Link></li>
              </ul>
              <div className="text-sm text-text-600 mt-3">Explore all services on the <Link href="/services" className="text-primary-700 hover:underline">Services</Link> page.</div>
            </Card>

            {/* Bookings, profile, and support */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-text-900 mb-3">Bookings & Account</h2>
              <ul className="space-y-2">
                {/* Booking links are available after sign-in from the header/profile menu */}
                <li><Link href="/appointments" className="text-primary-700 hover:underline">My Appointments</Link></li>
                <li><Link href="/documents" className="text-primary-700 hover:underline">Upload Documents</Link></li>
                <li><Link href="/track" className="text-primary-700 hover:underline">Track Booking</Link></li>
                <li><Link href="/profile" className="text-primary-700 hover:underline">Profile</Link></li>
              </ul>
              <h3 className="text-lg font-semibold text-text-900 mt-6 mb-2">Help & Information</h3>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-primary-700 hover:underline">Service Guide</Link></li>
                <li><Link href="/help#faq" className="text-primary-700 hover:underline">FAQs</Link></li>
                <li><Link href="/contact" className="text-primary-700 hover:underline">Contact Support</Link></li>
              </ul>
            </Card>
          </div>

          <div className="text-sm text-text-500 mt-8">Last updated: {lastUpdated}</div>
        </Container>
      </section>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => {
  // Use a fixed ISO date string derived at build time to avoid hydration issues
  const d = new Date();
  const lastUpdated = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
  return {
    props: {
      lastUpdated,
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};

export default SiteMapPage;
