import Layout from "../components/Layout";

export default function Dashboard() {
  return (
    <Layout>
      <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card title="Departments" value="12" />
        <Card title="Active Officers" value="48" />
        <Card title="Today’s Appointments" value="1,236" />
        <Card title="No-show Rate" value="4.7%" />
      </div>
    </Layout>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
    </div>
  );
}
