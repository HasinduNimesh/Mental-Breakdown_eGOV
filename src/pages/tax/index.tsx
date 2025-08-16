// tax/index.tsx
import React from "react";
import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import TaxHistory from "@/components/tax/TaxHistory";

export default function TaxDashboard() {
  const services = [
    { name: "Register as Taxpayer", href: "/tax/register" },
    { name: "Pay Income Tax", href: "/tax/payment?type=income" },
    { name: "Pay Utility Bills", href: "/tax/payment?type=utility" },
    { name: "Pay Import Tax", href: "/tax/payment?type=import" },
    { name: "Pay Vehicle/Property Tax", href: "/tax/payment?type=vehicle" },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
        <Container className="relative py-16 sm:py-20 lg:py-28">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
              Tax Services Portal
            </h1>
            <p className="text-lg sm:text-xl text-blue-200 mb-6 max-w-2xl mx-auto">
              Manage your tax registrations and payments online with ease
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" variant="secondary" href="/tax/register">
                Register as Taxpayer
              </Button>
              <Button size="lg" variant="outline" href="/contact" className="border-white text-white hover:text-blue-900">
                Contact Support
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-bg-100">
        <Container>
          <h2 className="text-3xl font-bold text-text-900 mb-8 text-center">
            Quick Access to Tax Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <Link key={service.name} href={service.href}>
                <Card className="cursor-pointer hover:shadow-xl transition p-6 text-center">
                  <h3 className="text-lg font-semibold text-primary-600">{service.name}</h3>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Tax History Section */}
      <section className="py-16 bg-white">
        <Container>
          <h2 className="text-3xl font-bold text-text-900 mb-6 text-center">Your Tax Payment History</h2>
          <Card className="p-6">
            <TaxHistory />
          </Card>
        </Container>
      </section>
    </Layout>
  );
}
