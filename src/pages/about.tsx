import React from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { Layout } from '@/components/layout/Layout';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  UserGroupIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  ClockIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const AboutPage: React.FC = () => {
  const { t } = useTranslation('common');

  const stats = [
    { label: 'Government Departments', value: '150+', icon: BuildingOfficeIcon },
    { label: 'Services Available', value: '500+', icon: DocumentTextIcon },
    { label: 'Citizens Served Monthly', value: '2M+', icon: UserGroupIcon },
    { label: 'Average Response Time', value: '24hrs', icon: ClockIcon },
  ];

  const values = [
    {
      title: 'Transparency',
      description: 'Open and clear communication in all government processes and decisions.',
      icon: GlobeAltIcon,
    },
    {
      title: 'Accessibility',
      description: 'Ensuring all citizens can access government services regardless of their abilities or location.',
      icon: UserGroupIcon,
    },
    {
      title: 'Security',
      description: 'Protecting citizen data and maintaining the highest standards of information security.',
      icon: ShieldCheckIcon,
    },
    {
      title: 'Efficiency',
      description: 'Streamlining processes to deliver fast, reliable government services.',
      icon: ClockIcon,
    },
  ];

  const departments = [
    'Department of Immigration & Emigration',
    'Department of Motor Traffic',
    'Ministry of Foreign Affairs',
    'Registrar General Department',
    'Ministry of Health',
    'Ministry of Education',
    'Department of Inland Revenue',
    'Ministry of Defence',
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 text-white py-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/10" />
          <svg className="absolute right-0 top-0 h-full w-1/2 opacity-10" viewBox="0 0 400 400" aria-hidden="true">
            <defs>
              <pattern id="about-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M20 0L30 10L20 20L10 10Z" fill="white" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#about-pattern)" />
          </svg>
        </div>

        <Container className="relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              About the Government of Sri Lanka
              <span className="block text-blue-200">Citizen Services Portal</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Empowering citizens through digital transformation and accessible government services. 
              Building a more connected, efficient, and transparent Sri Lanka.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="secondary" size="lg">Our Services</Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:text-primary-900">
                Contact Us
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <GlobeAltIcon className="w-8 h-8 text-primary-700" />
                </div>
                <h2 className="text-2xl font-bold text-text-900">Our Mission</h2>
              </div>
              <p className="text-text-600 leading-relaxed">
                To provide efficient, transparent, and accessible government services to all citizens of Sri Lanka 
                through innovative digital solutions. We strive to eliminate bureaucratic barriers and create 
                a seamless experience for every citizen interaction with government services.
              </p>
            </Card>

            <Card className="p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-100 rounded-full mb-4">
                  <ShieldCheckIcon className="w-8 h-8 text-accent-600" />
                </div>
                <h2 className="text-2xl font-bold text-text-900">Our Vision</h2>
              </div>
              <p className="text-text-600 leading-relaxed">
                To be the leading digital government platform in South Asia, setting the standard for 
                citizen-centric service delivery. We envision a future where every Sri Lankan citizen 
                can access all government services online, anytime, anywhere.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Statistics */}
      <section className="py-16 bg-bg-100">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-900 mb-4">Our Impact</h2>
            <p className="text-lg text-text-600">Numbers that reflect our commitment to serving Sri Lankan citizens</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6 text-center">
                <stat.icon className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-text-900 mb-2">{stat.value}</div>
                <div className="text-sm text-text-600">{stat.label}</div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-white">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-900 mb-4">Our Core Values</h2>
            <p className="text-lg text-text-600 max-w-2xl mx-auto">
              The principles that guide our commitment to serving the people of Sri Lanka
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <value.icon className="w-8 h-8 text-primary-700" />
                </div>
                <h3 className="text-xl font-semibold text-text-900 mb-3">{value.title}</h3>
                <p className="text-text-600">{value.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Government Structure */}
      <section className="py-16 bg-bg-100">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-text-900 mb-6">Government Structure</h2>
              <p className="text-text-600 mb-6 leading-relaxed">
                The Government of Sri Lanka operates through various ministries and departments, 
                each dedicated to specific aspects of public service. Our digital platform 
                integrates services from all major government entities to provide a unified 
                experience for citizens.
              </p>
              <p className="text-text-600 mb-8 leading-relaxed">
                From passport services to business registrations, from educational certificates 
                to healthcare services, we bring together over 150 government departments 
                under one digital roof.
              </p>
              <Button href="/services">Explore All Services</Button>
            </div>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-text-900 mb-4">Key Departments</h3>
              <div className="space-y-3">
                {departments.map((dept, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-text-700">{dept}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-primary-900 text-white">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-blue-100 text-lg">
              We're here to help and answer any questions you might have
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
                <PhoneIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Call Center</h3>
              <p className="text-blue-100 mb-2">24/7 Support Available</p>
              <p className="text-white font-medium">1919 (Toll Free)</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
                <EnvelopeIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Email Support</h3>
              <p className="text-blue-100 mb-2">Get help via email</p>
              <p className="text-white font-medium">support@gov.lk</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
                <MapPinIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Visit Us</h3>
              <p className="text-blue-100 mb-2">Government Information Center</p>
              <p className="text-white font-medium">Colombo 07, Sri Lanka</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button variant="secondary" size="lg" href="/contact">
              Contact Support
            </Button>
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

export default AboutPage;
