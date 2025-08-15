import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { Layout } from '@/components/layout/Layout';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { getAllServiceIds, getServiceById, ServiceDetail } from '@/lib/servicesData';
import { BuildingOfficeIcon, ClockIcon, CurrencyDollarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIcon20 } from '@heroicons/react/20/solid';

type Props = { service: ServiceDetail };

const tabs = ['Overview', 'Requirements', 'Fees & Timelines', 'Locations', 'FAQs'] as const;

const ServiceDetailPage: React.FC<Props> = ({ service }) => {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = React.useState<(typeof tabs)[number]>('Overview');

  return (
    <Layout>
      {/* Hero/Above the fold */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
        <Container className="relative py-12 sm:py-16">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Services', href: '/services' }, { label: service.title }]} />
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center">
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">{service.title}</h1>
                  <div className="mt-1 flex items-center gap-2 text-blue-200">
                    <BuildingOfficeIcon className="w-4 h-4" />
                    <span>{service.department}</span>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-blue-100 max-w-3xl">{service.purpose}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Badge tone="neutral" className="bg-white/10 border-white/20 text-white"><CurrencyDollarIcon className="w-4 h-4 mr-1 inline" /> {service.fee}</Badge>
                <Badge tone="neutral" className="bg-white/10 border-white/20 text-white"><ClockIcon className="w-4 h-4 mr-1 inline" /> {service.time}</Badge>
              </div>
            </div>
            <div className="lg:col-span-1">
              <Card className="p-4 bg-white/95">
                <div className="font-semibold text-text-900 mb-2">Ready to book?</div>
                <ul className="space-y-2 text-sm text-text-700">
                  <li className="flex gap-2"><CheckCircleIcon20 className="w-5 h-5 text-green-600" /> Required documents in hand</li>
                  <li className="flex gap-2"><CheckCircleIcon20 className="w-5 h-5 text-green-600" /> Fee available ({service.fee})</li>
                  <li className="flex gap-2"><CheckCircleIcon20 className="w-5 h-5 text-green-600" /> Time available ({service.time})</li>
                </ul>
                <Button href={service.bookHref} className="w-full mt-4">Book now</Button>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Quick facts: eligibility + requirements */}
      <section className="relative -mt-8 z-10">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <div className="font-semibold text-text-900 mb-2">Who can apply</div>
              <ul className="list-disc pl-5 space-y-1 text-text-700 text-sm">
                {service.eligibility.map((e, i) => (<li key={i}>{e}</li>))}
              </ul>
            </Card>
            <Card className="p-4">
              <div className="font-semibold text-text-900 mb-2">Documents you need</div>
              <ul className="space-y-2 text-sm text-text-700">
                {service.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <DocumentTextIcon className="w-5 h-5 text-text-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-text-900">{r.label}</div>
                      {r.example && <div className="text-text-600 text-xs">Example: {r.example}</div>}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </Container>
      </section>

      {/* Tabs */}
      <section className="py-10 bg-white">
        <Container>
          <div className="border-b border-border mb-6 overflow-auto">
            <div className="flex gap-6">
              {(['Overview','Requirements','Fees & Timelines','Locations','FAQs'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`py-3 whitespace-nowrap border-b-2 -mb-px ${activeTab === tab ? 'border-primary-600 text-primary-700' : 'border-transparent text-text-600 hover:text-text-900'}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'Overview' && (
            <div className="prose prose-sm max-w-none">
              <p>{service.purpose}</p>
              <ul>
                {service.eligibility.map((e, i) => (<li key={i}>{e}</li>))}
              </ul>
            </div>
          )}

          {activeTab === 'Requirements' && (
            <div>
              <ul className="space-y-3">
                {service.requirements.map((r, i) => (
                  <li key={i} className="p-3 border border-border rounded-md">
                    <div className="font-medium text-text-900">{r.label}</div>
                    {r.example && <div className="text-text-600 text-sm">Example: {r.example}</div>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'Fees & Timelines' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="text-sm text-text-600">Fee</div>
                <div className="text-lg font-semibold text-text-900">{service.fee}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-text-600">Processing time</div>
                <div className="text-lg font-semibold text-text-900">{service.time}</div>
              </Card>
            </div>
          )}

          {activeTab === 'Locations' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {service.locations.map((loc, i) => (
                <Card key={i} className="p-4">
                  <div className="font-medium text-text-900">{loc.name}</div>
                  {loc.address && <div className="text-sm text-text-600">{loc.address}</div>}
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'FAQs' && (
            <div className="divide-y divide-border">
              {service.faqs.map((f, i) => (
                <div key={i} className="py-4">
                  <div className="font-medium text-text-900">{f.q}</div>
                  <div className="text-text-700 text-sm">{f.a}</div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const ids = getAllServiceIds();
  return {
    paths: ids.map(id => ({ params: { id } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const id = params?.id as string;
  const service = getServiceById(id);
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
      service,
    },
  };
};

export default ServiceDetailPage;
