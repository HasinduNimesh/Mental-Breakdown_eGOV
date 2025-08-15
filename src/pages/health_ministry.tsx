import Layout from "../components/Layout";

export default function HealthMinistry() {
  return (
    <Layout>
      <h1 className="text-2xl font-bold">Health Ministry – Admin</h1>
      <section className="mt-6 space-y-4">
        <Panel title="Clinics configured" content="27" />
        <Panel title="Pending approvals" content="5 document sets" />
        <Panel title="Queue status" content="Avg wait 11m • 9 desks active" />
      </section>
    </Layout>
  );
}

function Panel({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="text-gray-600">{title}</div>
      <div className="mt-2 text-xl font-medium">{content}</div>
    </div>
  );
}
