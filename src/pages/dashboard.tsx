import React from 'react';
import Link from 'next/link';
import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useUser } from "../context/UserContext";
import { departmentDash } from "../lib/departments";

import { Layout } from '../components/layout/Layout';
import { Container } from '../components/ui/Container';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { UserSwitcher } from "../components/debug/UserSwitcher";
import { AppointmentTable, type AppointmentRow } from "../components/health/AppointmentTable";


export default function Dashboard() {
  const { user } = useUser();

  const data = user ? departmentDash[user.departmentId] : departmentDash.general;
  const title = user
    ? `${capitalize(user.departmentId.replace("_", " "))} – ${capitalize(user.role)}`
    : "Dashboard";

  const healthRows: AppointmentRow[] = [
    {
      id: "APT-2025-001",
      department: "Health",
      date: "2025-08-16",
      time: "10:30",
      status: "Scheduled",
      doctorName: "Dr. Ravi Perera",
      patientName: "N. Silva",
      room: "OPD-3",
      notes: "Bring previous lab results.",
    },
    {
      id: "APT-2025-002",
      department: "Health",
      date: "2025-08-16",
      time: "09:00",
      status: "Delayed",
      doctorName: "Dr. S. Fernando",
      patientName: "K. Jayasuriya",
      room: "Clinic-2",
      notes: "Priority: elderly",
    },
    {
      id: "APT-2025-003",
      department: "Health",
      date: "2025-08-16",
      time: "11:15",
      status: "In progress",
      doctorName: "Dr. S. Samarasinghe",
      patientName: "M. Peris",
      room: "OPD-1",
    },
  ];

  return (
    <Layout title={title}>
      <Container className="py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm text-gray-600">Common dashboard rendering department-specific KPIs.</p>
          </div>
          {/* DEV ONLY: simulate login/department */}
          <UserSwitcher />
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {data.kpis.map((k) => (
            <Card key={k.title} title={k.title} value={k.value} />
          ))}
        </div>

        {/* Shortcuts */}
        <div className="grid gap-4 md:grid-cols-3">
          {data.shortcuts.map((s) => (
            <Card key={s.title} className="p-5">
              <h3 className="font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{s.desc}</p>
              <div className="mt-4">
                <Button>{s.action}</Button>
              </div>
            </Card>
          ))}
        </div>
        {/* 👇 HEALTH SECTION ONLY */}
          {user?.departmentId === "health" && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Health Appointments</h2>
              <AppointmentTable rows={healthRows} />
            </section>
          )}
        </Container>
      </Layout>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}


