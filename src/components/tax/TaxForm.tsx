import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface TaxFormProps {
  type: string;
}

export default function TaxForm({ type }: TaxFormProps) {
  const [formData, setFormData] = useState<any>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Payment submitted for ${type}`);
  };

  const renderFields = () => {
    switch (type) {
      case "income":
        return (
          <>
            <Input name="tin" label="TIN" />
            <Input name="quarter" label="Payment Quarter" />
            <Input name="nic" label="NIC" />
            <Input name="amount" label="Amount" type="number" />
            <Input name="salarySlip" label="Upload Salary Slip" type="file" />
          </>
        );
      case "utility":
        return (
          <>
            <Input name="accountNumber" label="Account Number" />
            <Input name="month" label="Paying Month" />
            <Input name="address" label="Address" />
            <Input name="amount" label="Amount" type="number" />
          </>
        );
      case "import":
        return (
          <>
            <Input name="platform" label="Buying Platform" placeholder="e.g. eBay, AliExpress" />
            <Input name="orderRef" label="Order Reference" />
            <Input name="taxAmount" label="Tax Amount" type="number" />
          </>
        );
      case "vehicle":
        return (
          <>
            <Input name="regNumber" label="Vehicle/Property ID" />
            <Input name="year" label="Payment Year" />
            <Input name="amount" label="Payment Amount" type="number" />
          </>
        );
      default:
        return <p className="text-text-500">Select a payment type from the dashboard.</p>;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto p-6 shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-text-900">Pay {type?.toUpperCase()} Tax</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {renderFields()}
        <Button type="submit" className="mt-4 w-full">Proceed to Payment</Button>
      </form>
    </Card>
  );
}

function Input({ name, label, type = "text", placeholder = "" }: any) {
  return (
    <div>
      <label className="block mb-1 font-medium text-text-700">{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full border border-border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        required
      />
    </div>
  );
}
