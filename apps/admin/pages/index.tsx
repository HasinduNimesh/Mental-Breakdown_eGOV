import Head from 'next/head';
import { Button } from '@egov/ui';

export default function Home() {
  return (
    <>
      <Head>
        <title>Admin Portal</title>
      </Head>
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 bg-white rounded-xl shadow">
          <h1 className="text-2xl font-semibold mb-4">Admin Portal</h1>
          <p className="mb-6 text-gray-600">This is a placeholder. Your team can build the admin UI here.</p>
          <div className="flex gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
          </div>
        </div>
      </main>
    </>
  );
}
