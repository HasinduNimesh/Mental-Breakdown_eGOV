import React from "react";
import { Card } from "@/components/ui/Card";

export default function TaxHistory() {
  const history = [
    { type: "Income Tax", amount: "LKR 50,000", date: "2025-03-15" },
    { type: "Utility Bill", amount: "LKR 8,500", date: "2025-02-10" },
  ];

  return (
    <Card className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left font-medium">Tax Type</th>
            <th className="p-3 text-left font-medium">Amount</th>
            <th className="p-3 text-left font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item, index) => (
            <tr key={index} className="border-t">
              <td className="p-3">{item.type}</td>
              <td className="p-3">{item.amount}</td>
              <td className="p-3">{item.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
