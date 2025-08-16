import React, { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function RegisterTaxpayer() {
  const [form, setForm] = useState({ name: "", email: "", nic: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Registration successful! Your TIN will be sent via email.");
  };

  return (
    <Layout>
      <section className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-16">
        <Container className="text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Register as a Taxpayer</h1>
          <p className="text-lg sm:text-xl text-blue-200 max-w-2xl mx-auto">
            Fill in your details to register and receive your Tax Identification Number (TIN) via email.
          </p>
        </Container>
      </section>

      <section className="py-16 bg-bg-100">
        <Container className="max-w-xl">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">NIC</label>
                <input
                  type="text"
                  value={form.nic}
                  onChange={(e) => setForm({ ...form, nic: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <Button type="submit" className="mt-4 w-full">
                Register
              </Button>
            </form>
          </Card>
        </Container>
      </section>
    </Layout>
  );
}
