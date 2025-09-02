// src/lib/email.ts

import { BookingDraft } from '@/lib/booking';

// Change the function to be 'async'
export const sendEmailReminder = async (booking: BookingDraft, user: any) => {
  const serviceName = booking.serviceId; 
  const officeName = booking.officeId; 

  if (!user || !user.email) {
    console.error("User email is not available. Cannot send reminder.");
    throw new Error("User email not available.");
  }

  const templateParams = {
    userName: user.displayName || user.email,
    userEmail: user.email,
    serviceName: serviceName,
    officeName: officeName,
    appointmentDate: booking.dateISO,
    appointmentTime: booking.time,
  };

  try {
    // Call our local API route to avoid client-side CORS/AV proxy blocks
    const res = await fetch('/api/email/reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: user.email,
        subject: 'Appointment Reminder',
        templateParams,
        booking,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Email API failed: ${res.status} ${body}`);
    }
    console.log('SUCCESS! Email reminder sent (stub).');
  } catch (err) {
    console.error('FAILED to send email reminder.', err);
    // Re-throw the error so the calling function knows it failed
    throw err as any;
  }
};