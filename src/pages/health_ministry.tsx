import React from 'react';
import Link from 'next/link';
import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

import { Layout } from '../components/layout/Layout';
import { Container } from '../components/ui/Container';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function HealthMinistry() {
  const { t } = useTranslation('health');

  return (
    <Layout title={t('title', 'Health Ministry – Admin')}>
      <Container className="py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('heading', 'Health Ministry – Admin')}</h1>
            <p className="text-sm text-gray-600">{t('subtitle', 'Configure clinics, specialists, and queues')}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard">
              <Button variant="secondary">{t('nav.superAdmin', 'Super Admin')}</Button>
            </Link>
            <Button>{t('actions.addClinic', 'Add Clinic')}</Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card title={t('kpi.clinics', 'Clinics Configured')} value="27" />
          <Card title={t('kpi.desksActive', 'Desks Active')} value="9" />
          <Card title={t('kpi.avgWait', 'Avg Wait')} value="11m" />
          <Card title={t('kpi.pendingDocs', 'Pending Doc Reviews')} value="5" />
        </div>

        {/* Management shortcuts */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <h3 className="font-semibold">{t('shortcuts.docPrecheck', 'Document Pre-check')}</h3>
            <p className="mt-1 text-sm text-gray-600">{t('shortcuts.docPrecheckDesc', 'Approve or request fixes')}</p>
            <div className="mt-4">
              <Button>{t('actions.open', 'Open')}</Button>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold">{t('shortcuts.queue', 'Live Queue')}</h3>
            <p className="mt-1 text-sm text-gray-600">{t('shortcuts.queueDesc', 'Monitor tokens and desks')}</p>
            <div className="mt-4">
              <Button>{t('actions.open', 'Open')}</Button>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold">{t('shortcuts.scheduling', 'Scheduling')}</h3>
            <p className="mt-1 text-sm text-gray-600">{t('shortcuts.schedulingDesc', 'Set working hours and holidays')}</p>
            <div className="mt-4">
              <Button>{t('actions.configure', 'Configure')}</Button>
            </div>
          </Card>
        </div>
      </Container>
    </Layout>
  );
}


