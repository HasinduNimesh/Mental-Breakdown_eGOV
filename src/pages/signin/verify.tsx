import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

export default function SignInVerifyPage() {
  const router = useRouter();
  const email = typeof router.query.email === 'string' ? router.query.email : '';

  return (
    <>
      <Head>
        <title>Check your email</title>
      </Head>
      <div className="min-h-screen bg-bg-100">
        <Container className="max-w-lg py-12 sm:py-16">
          <div className="bg-white border border-border rounded-lg shadow-card overflow-hidden">
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6 sm:p-8">
              <h1 className="text-xl sm:text-2xl font-bold">Continue in your email</h1>
              <p className="text-blue-100 text-sm">We sent an email to complete your sign-in.</p>
            </div>
            <div className="p-6 sm:p-8 space-y-4">
              <p className="text-sm text-text-700">Open the email sent to <span className="font-medium text-text-900">{email || 'your inbox'}</span> and follow the instructions to finish signing in. Keep this tab open.</p>
              <div className="text-sm text-text-600">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Use the same device and browser.</li>
                  <li>Check the spam folder if you don't see it.</li>
                  <li>You can request a new email from the sign in page.</li>
                </ul>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Button onClick={()=>router.push('/signin')} variant="outline" className="flex-1">Back to sign in</Button>
                <Link href="/help" className="text-sm text-primary-700 hover:underline">Need help?</Link>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
