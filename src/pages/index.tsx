import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { WelcomeDashboard } from '@/components/dashboard/WelcomeDashboard';
import { Layout } from '@/components/layout/Layout';

export default function Home() {
  return (
    <Layout>
      <WelcomeDashboard />
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};
