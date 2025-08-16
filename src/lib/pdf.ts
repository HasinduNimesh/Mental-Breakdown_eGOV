import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import QRCode from 'qrcode';
import type { BookingDraft, ServiceOption, Office } from '@/lib/booking';

type PdfArgs = {
  booking: BookingDraft;
  service: ServiceOption;
  office: Office;
  tz: string;
  qrDataUrl?: string | null; // if missing, we won't embed QR
};

export async function buildBookingPDF({ booking, service, office, tz, qrDataUrl }: PdfArgs): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 portrait (72dpi)

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Helpers
  const dataUrlToBytes = (dataUrl: string): Uint8Array => {
    const comma = dataUrl.indexOf(',');
    const b64 = dataUrl.slice(comma + 1);
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  };

  const svgToPngBytes = async (url: string, w: number, h: number): Promise<Uint8Array | null> => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const svg = await res.text();
      const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (!ctx) { reject(new Error('no-ctx')); return; }
            ctx.drawImage(img, 0, 0, w, h);
            const pngUrl = canvas.toDataURL('image/png');
            const bytes = dataUrlToBytes(pngUrl);
            // @ts-expect-error attach for outer scope
            (img as any)._bytes = bytes;
            resolve();
          } catch (e) { reject(e); }
        };
        img.onerror = () => reject(new Error('logo-load-failed'));
        img.src = svgUrl;
      });
      // Retrieve from attached
      const imgAny = (null as any) as HTMLImageElement;
      // TypeScript trick isn't needed; we'll simply recompute
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      const tmpImg = new Image();
      tmpImg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      await new Promise<void>((resolve, reject) => {
        tmpImg.onload = () => { ctx.drawImage(tmpImg, 0, 0, w, h); resolve(); };
        tmpImg.onerror = () => reject(new Error('logo-draw-failed'));
      });
      return dataUrlToBytes(canvas.toDataURL('image/png'));
    } catch { return null; }
  };

  // Header bar
  const pageWidth = 595;
  const headerH = 70;
  page.drawRectangle({ x: 0, y: 842 - headerH, width: pageWidth, height: headerH, color: rgb(0.97, 0.98, 0.99) });
  // Try to embed logo (optional)
  try {
    const logoBytes = await svgToPngBytes('/logo.svg', 60, 60);
    if (logoBytes) {
      const logo = await pdfDoc.embedPng(logoBytes);
      page.drawImage(logo, { x: 50, y: 842 - headerH + (headerH - 60) / 2, width: 60, height: 60 });
    }
  } catch {}

  // Header titles
  page.drawText('Citizen Services Portal', { x: 50 + 72, y: 842 - 28, size: 11, font, color: rgb(0.35, 0.4, 0.45) });
  page.drawText('Government of Sri Lanka', { x: 50 + 72, y: 842 - 44, size: 9, font, color: rgb(0.5, 0.55, 0.6) });

  // Main heading
  page.drawText('Appointment Confirmation', {
    x: 50, y: 842 - headerH - 24, size: 22, font: fontBold, color: rgb(0.12, 0.12, 0.12),
  });

  // Booking code badge
  const badgeY = 842 - headerH - 46;
  const badgeLabel = `Ref: ${booking.id}`;
  const badgeTextW = fontBold.widthOfTextAtSize(badgeLabel, 10);
  const badgeW = badgeTextW + 16;
  page.drawRectangle({ x: 50, y: badgeY - 4, width: badgeW, height: 18, color: rgb(0.93, 0.96, 1.0), borderColor: rgb(0.65, 0.8, 1.0), borderWidth: 0.6 });
  page.drawText(badgeLabel, { x: 50 + 8, y: badgeY, size: 10, font: fontBold, color: rgb(0.16, 0.38, 0.69) });

  // Separator
  page.drawRectangle({ x: 50, y: badgeY - 14, width: pageWidth - 100, height: 0.6, color: rgb(0.9, 0.9, 0.92) });

  // Booking info block (left column)
  let y = badgeY - 34;
  const lineGap = 16;
  const label = (t: string) => { page.drawText(t, { x: 50, y, size: 11, font: fontBold, color: rgb(0.15, 0.15, 0.2) }); };
  const value = (t: string) => { page.drawText(t, { x: 200, y, size: 11, font, color: rgb(0.1, 0.1, 0.1) }); y -= lineGap; };

  label('Service'); value(`${service.title}`);
  label('Department'); value(`${service.department}`);
  label('Office'); value(`${office.name}, ${office.city}`);
  label('Date & Time'); value(`${booking.dateISO} at ${booking.time} (${tz})`);
  label('Status'); value(booking.status);

  // Person
  y -= 6; page.drawText('Your Details', { x: 50, y, size: 12, font: fontBold }); y -= lineGap;
  label('Full name'); value(booking.fullName);
  label('NIC'); value(booking.nic);
  label('Email'); value(booking.email);
  label('Phone'); value(booking.phone + (booking.altPhone ? ` • Alt: ${booking.altPhone}` : ''));

  // QR image on the right (robust: decode data URL or regenerate if not provided)
  try {
    let pngBytes: Uint8Array | null = null;
    if (qrDataUrl && qrDataUrl.startsWith('data:image')) {
      try { pngBytes = dataUrlToBytes(qrDataUrl); } catch { pngBytes = null; }
    }
    if (!pngBytes) {
      // Fallback: generate the QR now
      const payload = JSON.stringify({ id: booking.id, serviceId: booking.serviceId, officeId: booking.officeId, date: booking.dateISO, time: booking.time });
      const gen = await QRCode.toDataURL(payload, { width: 260, margin: 1, color: { dark: '#1f2937', light: '#ffffff' }, errorCorrectionLevel: 'M' });
      pngBytes = dataUrlToBytes(gen);
    }
    if (pngBytes) {
      const img = await pdfDoc.embedPng(pngBytes);
      const w = 200, h = 200;
      const qrX = pageWidth - 50 - w;
      // Place QR on the lower-right part of the page with a bottom margin
      const bottomMargin = 70;
      const qrY = bottomMargin;
      // Border box behind QR
      page.drawRectangle({ x: qrX - 6, y: qrY - 6, width: w + 12, height: h + 12, color: rgb(1, 1, 1), borderColor: rgb(0.85, 0.87, 0.9), borderWidth: 0.8 });
      page.drawImage(img, { x: qrX, y: qrY, width: w, height: h });
      page.drawText('Check-in QR', { x: qrX, y: qrY - 16, size: 10, font, color: rgb(0.45, 0.47, 0.5) });
    }
  } catch {
    // ignore embedding failure but continue PDF creation
  }

  // Notes
  y -= 12;
  page.drawText('Notes', { x: 50, y, size: 12, font: fontBold }); y -= lineGap;
  const notes = [
    '• Bring original documents to your visit. Some services also require photocopies.',
    '• You can reschedule or cancel up to 24 hours in advance.',
    '• Please arrive 10–15 minutes early for check-in.',
  ];
  for (const n of notes) { page.drawText(n, { x: 50, y, size: 10, font, color: rgb(0.15, 0.15, 0.2) }); y -= 14; }

  // Footer
  const footerY = 30;
  page.drawRectangle({ x: 0, y: footerY + 16, width: pageWidth, height: 0.6, color: rgb(0.9, 0.9, 0.92) });
  page.drawText(`Generated on ${new Date().toLocaleString()} • ${service.department}`, { x: 50, y: footerY, size: 9, font, color: rgb(0.45, 0.47, 0.5) });

  const pdfBytes = await pdfDoc.save();
  // Create an ArrayBuffer view that matches the bytes range
  const ab = (pdfBytes.buffer as ArrayBuffer).slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength);
  return new Blob([ab], { type: 'application/pdf' });
}

export async function downloadBookingPDF(args: PdfArgs) {
  const blob = await buildBookingPDF(args);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `appointment-${args.booking.id}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
