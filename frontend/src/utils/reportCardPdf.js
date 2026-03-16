import { jsPDF } from 'jspdf';

const DEFAULT_TEMPLATE = {
  title: 'Report Card',
  subtitle: 'Academic Performance Report',
  schoolName: 'School',
  schoolAddressLine: '',
  schoolContactLine: '',
  accentColor: '#1f2937',
  showPageBorder: true,
  watermarkText: '',
  footerNote: 'This is a computer-generated report card.',
  signatureLabel: 'Class Teacher',
  principalLabel: 'Principal',
};

const toText = (value) => String(value ?? '').trim();

const toFileSafe = (value) =>
  toText(value)
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 80);

const parseHexColor = (value) => {
  const input = toText(value).replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(input)) return [31, 41, 55];
  return [
    Number.parseInt(input.slice(0, 2), 16),
    Number.parseInt(input.slice(2, 4), 16),
    Number.parseInt(input.slice(4, 6), 16),
  ];
};

const loadLogoDataUrl = async (logoUrl) => {
  const src = toText(logoUrl);
  if (!src) return '';
  try {
    const response = await fetch(src);
    if (!response.ok) return '';
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result || ''));
      reader.onerror = () => resolve('');
      reader.readAsDataURL(blob);
    });
  } catch {
    return '';
  }
};

const drawHeader = (doc, template, reportCard, logoDataUrl) => {
  const mergedTemplate = { ...DEFAULT_TEMPLATE, ...(template || {}) };
  const [r, g, b] = parseHexColor(mergedTemplate.accentColor);
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  if (mergedTemplate.showPageBorder) {
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.7);
    doc.rect(7, 7, pageWidth - 14, doc.internal.pageSize.getHeight() - 14);
  }

  doc.setFillColor(r, g, b);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(toText(mergedTemplate.schoolName || 'School'), pageWidth / 2, 12, { align: 'center' });
  doc.setFontSize(9);
  if (toText(mergedTemplate.schoolAddressLine)) {
    doc.text(toText(mergedTemplate.schoolAddressLine), pageWidth / 2, 18, { align: 'center' });
  }
  if (toText(mergedTemplate.schoolContactLine)) {
    doc.text(toText(mergedTemplate.schoolContactLine), pageWidth / 2, 23, { align: 'center' });
  }

  doc.setFontSize(15);
  doc.text(toText(mergedTemplate.title || 'Report Card'), margin, 33);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(toText(mergedTemplate.subtitle || ''), margin, 38);

  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', 10, 7, 22, 22);
      doc.addImage(logoDataUrl, 'PNG', pageWidth - 32, 7, 22, 22);
    } catch {
      // Ignore logo render errors and continue report generation.
    }
  }

  if (toText(mergedTemplate.watermarkText)) {
    doc.setTextColor(230, 233, 238);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text(toText(mergedTemplate.watermarkText), pageWidth / 2, 165, {
      align: 'center',
      angle: 30,
    });
  }

  doc.setTextColor(33, 37, 41);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(`Student: ${toText(reportCard.studentName || 'Student')}`, margin, 50);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(
    `Class: ${toText(reportCard.grade)}   Section: ${toText(reportCard.section)}   Roll: ${toText(reportCard.roll || '-')}`,
    margin,
    57
  );
  doc.text(
    `Academic Year: ${toText(reportCard.academicYear || '-')}   Admission No: ${toText(reportCard.admissionNumber || '-')}`,
    margin,
    63
  );
};

const drawSummary = (doc, reportCard) => {
  const margin = 14;
  const y = 72;
  const totals = reportCard?.totals || {};
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(margin, y, 182, 18, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Total: ${totals.obtainedMarks || 0}/${totals.totalMarks || 0}`, margin + 4, y + 7);
  doc.text(`Percentage: ${Number(totals.percentage || 0).toFixed(2)}%`, margin + 72, y + 7);
  doc.text(`Grade: ${toText(totals.grade || '-')}`, margin + 150, y + 7);
};

const drawSubjectsTable = (doc, reportCard) => {
  const margin = 14;
  let y = 96;
  const rowH = 8;
  const headers = ['Subject', 'Obtained', 'Total', '%', 'Grade'];
  const widths = [84, 28, 22, 20, 28];

  doc.setFillColor(230, 234, 239);
  doc.rect(margin, y, widths.reduce((sum, item) => sum + item, 0), rowH, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);

  let cursorX = margin + 2;
  headers.forEach((head, index) => {
    doc.text(head, cursorX, y + 5.5);
    cursorX += widths[index];
  });
  y += rowH;

  doc.setFont('helvetica', 'normal');
  const subjects = Array.isArray(reportCard?.subjects) ? reportCard.subjects : [];
  if (!subjects.length) {
    doc.text('No published exam marks available.', margin + 2, y + 6);
    y += rowH;
  } else {
    subjects.forEach((subject) => {
      if (y > 255) return;
      cursorX = margin + 2;
      const cells = [
        toText(subject.name || '-'),
        String(subject.obtainedMarks ?? 0),
        String(subject.totalMarks ?? 0),
        `${Number(subject.percentage || 0).toFixed(0)}%`,
        toText(subject.grade || '-'),
      ];
      cells.forEach((value, index) => {
        const maxW = widths[index] - 3;
        const clipped = doc.splitTextToSize(value, maxW)[0] || '';
        doc.text(clipped, cursorX, y + 5.5);
        cursorX += widths[index];
      });
      y += rowH;
    });
  }
  return y;
};

const drawFooter = (doc, template, startY) => {
  const mergedTemplate = { ...DEFAULT_TEMPLATE, ...(template || {}) };
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const y = Math.max(startY + 12, 250);

  doc.setDrawColor(210, 214, 219);
  doc.line(margin, y - 8, pageWidth - margin, y - 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(toText(mergedTemplate.footerNote), margin, y - 2);
  doc.text(toText(mergedTemplate.signatureLabel), margin, y + 8);
  doc.text(toText(mergedTemplate.principalLabel), pageWidth - margin, y + 8, { align: 'right' });
};

const renderReportCardPage = (doc, template, reportCard, logoDataUrl) => {
  drawHeader(doc, template, reportCard || {}, logoDataUrl);
  drawSummary(doc, reportCard || {});
  const endY = drawSubjectsTable(doc, reportCard || {});
  drawFooter(doc, template, endY);
};

export const downloadSingleReportCardPdf = async ({ template, reportCard, fileName }) => {
  if (!reportCard) return false;
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const logoDataUrl = await loadLogoDataUrl(template?.logoUrl || template?.logoUrlOverride);
  renderReportCardPage(doc, template, reportCard, logoDataUrl);
  const baseName = fileName || `report_card_${toFileSafe(reportCard.studentName || 'student')}.pdf`;
  doc.save(baseName);
  return true;
};

export const downloadBulkReportCardsPdf = async ({ template, reportCards, fileName }) => {
  const items = Array.isArray(reportCards) ? reportCards : [];
  if (!items.length) return false;
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const logoDataUrl = await loadLogoDataUrl(template?.logoUrl || template?.logoUrlOverride);
  items.forEach((card, index) => {
    if (index > 0) doc.addPage();
    renderReportCardPage(doc, template, card, logoDataUrl);
  });
  doc.save(fileName || 'report_cards_bulk.pdf');
  return true;
};
