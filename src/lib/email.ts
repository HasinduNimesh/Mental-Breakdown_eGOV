// src/lib/email.ts

import emailjs from '@emailjs/browser';
import { BookingDraft } from '@/lib/booking'; // We'll get this type from the booking file

const SERVICE_ID = 'service_mentalbreakdowns';
const TEMPLATE_ID = 'template_wfr19rr';
const PUBLIC_KEY = '_aGANrA6o2EiXtOqa';

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
    // Use await to wait for the send operation to complete
    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, { publicKey: PUBLIC_KEY });
    console.log('SUCCESS! Email reminder sent.', response.status, response.text);
  } catch (err) {
    console.error('FAILED to send email reminder.', err);
    // Re-throw the error so the calling function knows it failed
    throw err;
  }
};