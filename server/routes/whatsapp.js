export async function sendWhatsAppDocument({ to, caption, pdfBuffer, filename }) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    const err = new Error('WhatsApp Cloud API is not configured');
    err.code = 'NOT_CONFIGURED';
    throw err;
  }

  const clean = String(to).replace(/[^\d]/g, '');
  const phone = clean.length > 10 && !clean.startsWith('91') ? clean : `91${clean}`;

  const form = new FormData();
  form.append('messaging_product', 'whatsapp');
  form.append('to', phone);
  form.append('type', 'document');
  form.append(
    'document',
    new Blob([pdfBuffer], { type: 'application/pdf' }),
    filename
  );
  form.append('caption', caption || 'Admission Form');

  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data?.error?.message || 'WhatsApp API error');
    err.code = 'API_ERROR';
    throw err;
  }
  return data;
}

export function waMeLink(number, message) {
  const clean = String(number || '').replace(/[^\d]/g, '');
  const phone = clean.length > 10 && !clean.startsWith('91') ? clean : `91${clean}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
