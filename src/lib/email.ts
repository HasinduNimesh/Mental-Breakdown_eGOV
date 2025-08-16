// lib/email.ts
import emailjs from '@emailjs/browser';
import { BookingDraft, SERVICES, OFFICES } from '@/lib/booking';

// Replace these placeholders with your actual credentials from EmailJS
const SERVICE_ID = 'service_mentalbreakdowns';   // Paste your Service ID here
const TEMPLATE_ID = 'template_wfr19rr';  // Paste your Template ID here
const PUBLIC_KEY = '_aGANrA6o2EiXtOqa';    // Paste your Public Key here

export const sendEmailReminder = (booking: BookingDraft, user: any) => {
  const service = SERVICES.find(s => s.id === booking.serviceId);
  const office = OFFICES.find(o => o.id === booking.officeId);

  if (!user || !user.email) {
    console.error("User email is not available. Cannot send reminder.");
    return;
  }

  // These parameters will populate the variables in your EmailJS template
  const templateParams = {
    userName: user.displayName || user.email, // The name of the logged-in user
    userEmail: user.email,                     // The email address to send to
    serviceName: service?.title,
    officeName: office?.name,
    appointmentDate: booking.dateISO,
    appointmentTime: booking.time,
  };

  emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, { publicKey: PUBLIC_KEY })
    .then((response) => {
       console.log('SUCCESS! Email reminder sent.', response.status, response.text);
    }, (err) => {
       console.log('FAILED to send email reminder.', err);
    });
};