import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

async function renderForm() {
  const node = document.getElementById('formdoc');
  if (!node) throw new Error('Form preview not found');

  return html2canvas(node, {
    scale: 2,
    backgroundColor: '#fdfaf2',
    useCORS: true,
    logging: false
  });
}

function addSinglePage(pdf, canvas) {
  const pageW = 210;
  const pageH = 297;
  const imgH = (canvas.height * pageW) / canvas.width;
  const img = canvas.toDataURL('image/jpeg', 0.94);

  if (imgH <= pageH) {
    pdf.addImage(img, 'JPEG', 0, 0, pageW, imgH);
  } else {
    const w = (canvas.width * pageH) / canvas.height;
    pdf.addImage(img, 'JPEG', (pageW - w) / 2, 0, w, pageH);
  }
}

export async function generateFormPdf(data, filename) {
  const canvas = await renderForm();
  const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  addSinglePage(pdf, canvas);

  const name = (filename || 'admission-form').replace(/[^\w\- ]+/g, '').trim();
  pdf.save(`${name}.pdf`);
  return pdf;
}

export async function pdfToBase64() {
  const canvas = await renderForm();
  const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  addSinglePage(pdf, canvas);
  return pdf.output('datauristring').split(',')[1];
}
