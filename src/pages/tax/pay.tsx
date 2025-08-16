import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function PayPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { type, data } = router.query;
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data) setFormData(JSON.parse(data as string));
  }, [data]);

  const handlePay = async () => {
    if (!user) return alert("You must be signed in to pay.");
    setLoading(true);

    // Insert payment into Supabase
    const { error } = await supabase.from("payments").insert({
      user_id: user.id,
      tin: formData.tin,
      type: type,
      details: formData,
      amount: Number(formData.amount || formData.taxAmount),
      date: new Date(),
      status: "Completed",
    });

    setLoading(false);

    if (error) alert("Payment failed: " + error.message);
    else {
      alert("Payment successful!");
      router.push("/tax");
    }
  };

  return (
    <Container className="py-12 max-w-xl">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Confirm Payment</h2>
        <div className="space-y-2 mb-4">
          <p><strong>Type:</strong> {type}</p>
          <p><strong>Amount:</strong> LKR {formData.amount || formData.taxAmount}</p>
          <p><strong>TIN:</strong> {formData.tin}</p>
        </div>
        <Button onClick={handlePay} disabled={loading}>
          {loading ? "Processing..." : "Pay Now"}
        </Button>
      </div>
    </Container>
  );
}
