import React from 'react';
import Link from 'next/link';
import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

import { Layout } from '../components/layout/Layout';
import { Container } from '../components/ui/Container';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function Dashboard() {
  const { t } = useTranslation('admin'); // make sure you have locales/[lang]/admin.json

  return (
    <Layout title={t('superAdmin.title', 'Super Admin Dashboard')}>
      <Container className="py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('superAdmin.heading', 'Super Admin Dashboard')}</h1>
            <p className="text-sm text-gray-600">{t('superAdmin.subtitle', 'Configure system-wide settings and monitor KPIs')}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/health_ministry">
              <Button variant="secondary">{t('nav.healthMinistry', 'Health Ministry')}</Button>
            </Link>
            <Button>{t('actions.addSomething', 'Add Department')}</Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card title={t('kpi.departments', 'Departments')} value="12" />
          <Card title={t('kpi.officers', 'Active Officers')} value="48" />
          <Card title={t('kpi.appointmentsToday', "Today's Appointments")} value="1,236" />
          <Card title={t('kpi.noShowRate', 'No-show Rate')} value="4.7%" />
        </div>

        {/* Quick actions / Shortcuts */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <h3 className="font-semibold">{t('shortcuts.services', 'Manage Services')}</h3>
            <p className="mt-1 text-sm text-gray-600">{t('shortcuts.servicesDesc', 'Create and edit department services')}</p>
            <div className="mt-4">
              <Button>{t('actions.open', 'Open')}</Button>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold">{t('shortcuts.users', 'Manage Users')}</h3>
            <p className="mt-1 text-sm text-gray-600">{t('shortcuts.usersDesc', 'Promote officers, assign roles')}</p>
            <div className="mt-4">
              <Button>{t('actions.open', 'Open')}</Button>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold">{t('shortcuts.analytics', 'Analytics')}</h3>
            <p className="mt-1 text-sm text-gray-600">{t('shortcuts.analyticsDesc', 'View no-show rate, wait times')}</p>
            <div className="mt-4">
              <Button>{t('actions.view', 'View')}</Button>
            </div>
          </Card>
        </div>
      </Container>
    </Layout>
  );
}


