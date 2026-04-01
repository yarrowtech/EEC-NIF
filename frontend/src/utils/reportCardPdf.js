import { jsPDF } from 'jspdf';

const DEFAULT_TEMPLATE = {
  title: 'ACADEMIC PERFORMANCE REPORT',
  subtitle: 'Official Student Progress Record',
  schoolName: 'Electronic Educare Academy',
  schoolAddressLine: 'Main Campus, Educational District',
  schoolContactLine: 'Contact: +1 234 567 890 | email: info@educare.edu',
  accentColor: '#0f172a', // Slate 900
  showPageBorder: true,
  watermarkText: 'OFFICIAL',
  footerNote: 'This is an official computer-generated document. No signature is required unless specified.',
  signatureLabel: 'Class Teacher',
  principalLabel: 'Head of Institution',
};

const toText = (value) => String(value ?? '').trim();

const toFileSafe = (value) =>
  toText(value)
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 80);

const parseHexColor = (value) => {
  const input = toText(value).replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(input)) return [15, 23, 42];
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

const drawPageStructure = (doc, template, r, g, b) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  if (template.showPageBorder) {
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.5);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
    doc.setLineWidth(0.2);
    doc.rect(6, 6, pageWidth - 12, pageHeight - 12);
  }

  // Header background
  doc.setFillColor(r, g, b);
  doc.rect(7, 7, pageWidth - 14, 35, 'F');
};

const drawHeader = (doc, template, reportCard, logoDataUrl, r, g, b) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // School Info
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(toText(template.schoolName).toUpperCase(), pageWidth / 2, 18, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(toText(template.schoolAddressLine), pageWidth / 2, 24, { align: 'center' });
  doc.text(toText(template.schoolContactLine), pageWidth / 2, 28, { align: 'center' });

  // Report Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(toText(template.title), pageWidth / 2, 36, { align: 'center' });

  // Logo
  if (logoDataUrl) {
    try {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(12, 10, 20, 20, 2, 2, 'F');
      doc.addImage(logoDataUrl, 'PNG', 13, 11, 18, 18);
    } catch {}
  }

  // Student Info Box
  doc.setTextColor(30, 41, 59);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(10, 48, pageWidth - 20, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('STUDENT INFORMATION', 14, 54);
  doc.setLineWidth(0.1);
  doc.line(14, 55, 55, 55);

  doc.setFontSize(10);
  doc.text(`Name: ${toText(reportCard.studentName).toUpperCase()}`, 14, 62);
  doc.text(`ID / Roll: ${toText(reportCard.roll || reportCard.studentCode || '-')}`, 14, 68);
  
  doc.text(`Class: ${toText(reportCard.grade || '-')}`, 100, 62);
  doc.text(`Section: ${toText(reportCard.section || '-')}`, 100, 68);
  
  doc.text(`Academic Year: ${toText(reportCard.academicYear || '-')}`, 155, 62);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 155, 68);
};

const drawGradingScale = (doc, startY) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('GRADING SCALE:', margin, startY);
  
  doc.setFont('helvetica', 'normal');
  const scale = 'A+: 90-100% | A: 80-89% | B: 70-79% | C: 60-69% | D: 50-59% | F: <50%';
  doc.text(scale, margin + 28, startY);
};

const drawTable = (doc, headers, data, startY, widths, title, accentColor) => {
  const margin = 10;
  let currentY = startY;
  const [r, g, b] = accentColor;

  // Table Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(r, g, b);
  doc.text(title.toUpperCase(), margin, currentY);
  currentY += 4;

  // Header row
  doc.setFillColor(r, g, b);
  doc.rect(margin, currentY, widths.reduce((a, b) => a + b, 0), 8, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  let currentX = margin;
  headers.forEach((h, i) => {
    doc.text(h, currentX + 2, currentY + 5.5);
    currentX += widths[i];
  });
  
  currentY += 8;
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');

  data.forEach((row, rowIndex) => {
    // Page break check
    if (currentY > 260) {
      doc.addPage();
      currentY = 20;
      // Re-draw header background? Maybe just continue
    }

    if (rowIndex % 2 === 0) {
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, currentY, widths.reduce((a, b) => a + b, 0), 7, 'F');
    }

    currentX = margin;
    row.forEach((cell, cellIndex) => {
      const text = toText(cell);
      const clipped = doc.splitTextToSize(text, widths[cellIndex] - 3)[0];
      doc.text(clipped, currentX + 2, currentY + 5);
      currentX += widths[cellIndex];
    });
    currentY += 7;
  });

  return currentY + 5;
};

const renderReportCardPage = (doc, template, reportCard, logoDataUrl) => {
  const mergedTemplate = { ...DEFAULT_TEMPLATE, ...(template || {}) };
  const [r, g, b] = parseHexColor(mergedTemplate.accentColor);
  
  drawPageStructure(doc, mergedTemplate, r, g, b);
  drawHeader(doc, mergedTemplate, reportCard, logoDataUrl, r, g, b);

  // Consolidated Summary
  const subjectsHeaders = ['SUBJECT', 'OBTAINED', 'TOTAL MARKS', 'PERCENTAGE', 'GRADE'];
  const subjectsWidths = [80, 30, 30, 25, 25];
  const subjectsData = (reportCard.subjects || []).map(s => [
    s.name,
    s.obtainedMarks,
    s.totalMarks,
    `${s.percentage}%`,
    s.grade
  ]);

  let y = 85;
  y = drawTable(doc, subjectsHeaders, subjectsData, y, subjectsWidths, 'Subject-wise Performance', [r, g, b]);

  // Overall Totals
  const totals = reportCard.totals || {};
  doc.setFillColor(r, g, b);
  doc.rect(10, y, doc.internal.pageSize.getWidth() - 20, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(`OVERALL PERFORMANCE:    MARKS: ${totals.obtainedMarks}/${totals.totalMarks}    |    PERCENTAGE: ${totals.percentage}%    |    GRADE: ${totals.grade}`, 14, y + 6.5);
  
  y += 18;

  // Detailed Assessment Table
  const examHeaders = ['ASSESSMENT', 'SUBJECT', 'TERM', 'DATE', 'MARKS', 'GRADE'];
  const examWidths = [50, 45, 30, 25, 20, 20];
  const examData = (reportCard.exams || []).map(e => [
    e.examName,
    e.subject,
    e.term || 'General',
    e.date ? new Date(e.date).toLocaleDateString() : '-',
    `${e.obtainedMarks}/${e.totalMarks}`,
    e.grade || '-'
  ]);

  if (examData.length > 0) {
    y = drawTable(doc, examHeaders, examData, y, examWidths, 'Detailed Assessment History', [r, g, b]);
  }

  // Footer & Legend
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y > pageHeight - 40) {
    doc.addPage();
    y = 20;
  }
  
  drawGradingScale(doc, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(toText(mergedTemplate.footerNote), 10, pageHeight - 15);
  
  doc.setFont('helvetica', 'bold');
  doc.text('__________________________', 10, pageHeight - 25);
  doc.text(toText(mergedTemplate.signatureLabel), 10, pageHeight - 21);
  
  doc.text('__________________________', doc.internal.pageSize.getWidth() - 60, pageHeight - 25);
  doc.text(toText(mergedTemplate.principalLabel), doc.internal.pageSize.getWidth() - 60, pageHeight - 21);
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
