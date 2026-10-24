import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function generateFormPdf(data, filename) {
  const node = document.getElementById('formdoc');
  if (!node) throw new Error('Form preview not found');

  const canvas = await html2canvas(node, {
    scale: 2,
    backgroundColor: '#fdfaf2',
    useCORS: true,
    logging: false
  });

  const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const pageW = 210;
  const pageH = 297;
  const imgH = (canvas.height * pageW) / canvas.width;

  const img = canvas.toDataURL('image/jpeg', 0.94);

  if (imgH <= pageH) {
    pdf.addImage(img, 'JPEG', 0, 0, pageW, imgH);
  } else {
    const pagePxH = Math.floor((canvas.width * pageH) / pageW);
    let y = 0;
    while (y < canvas.height) {
      const sliceH = Math.min(pagePxH, canvas.height - y);
      const slice = document.createElement('canvas');
      slice.width = canvas.width;
      slice.height = sliceH;
      slice.getContext('2d').drawImage(canvas, 0, y, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
      const sliceData = slice.toDataURL('image/jpeg', 0.94);
      const sliceMmH = (sliceH * pageW) / canvas.width;
      if (y > 0) pdf.addPage();
      pdf.addImage(sliceData, 'JPEG', 0, 0, pageW, sliceMmH);
      y += sliceH;
    }
  }

  const name = (filename || 'admission-form').replace(/[^\w\- ]+/g, '').trim();
  pdf.save(`${name}.pdf`);
  return pdf;
}

export async function pdfToBase64() {
  const node = document.getElementById('formdoc');
  const canvas = await html2canvas(node, { scale: 2, backgroundColor: '#fdfaf2', logging: false });
  const jpeg = canvas.toDataURL('image/jpeg', 0.92);
  const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const pageW = 210;
  const pageH = 297;
  const imgH = (canvas.height * pageW) / canvas.width;
  pdf.addImage(jpeg, 'JPEG', 0, 0, pageW, Math.min(imgH, pageH));

  const base64 = pdf
    .output('datauristring')
    .split(',')[1];
  return base64;
}
