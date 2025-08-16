import { useRouter } from "next/router";
import { Layout } from "@/components/layout/Layout";
import { Container } from "@/components/ui/Container";
import TaxForm from "@/components/tax/TaxForm";

export default function PaymentPage() {
  const router = useRouter();
  const { type } = router.query;

  return (
    <Layout>
      <section className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-16">
        <Container className="text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            {type ? `Pay ${type.toString().toUpperCase()} Tax` : "Tax Payment"}
          </h1>
          <p className="text-lg sm:text-xl text-blue-200 max-w-2xl mx-auto">
            Fill in the payment form below and submit your payment securely.
          </p>
        </Container>
      </section>

      <section className="py-16 bg-bg-100">
        <Container className="max-w-2xl">
          <TaxForm type={type as string} />
        </Container>
      </section>
    </Layout>
  );
}
