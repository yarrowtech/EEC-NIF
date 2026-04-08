import { jsPDF } from 'jspdf';

const toText = (value) => String(value ?? '').trim();
const toAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.max(0, amount) : 0;
};

const formatCurrency = (value) =>
  `INR ${new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(toAmount(value))}`;

const formatDate = (value) => {
  const raw = toText(value);
  if (!raw) return '-';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

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

const drawTable = ({ doc, startY, title, columns, rows, accent }) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 12;
  const tableWidth = pageWidth - marginX * 2;
  const rowHeight = 8;
  const titleGap = 6;
  const [r, g, b] = accent;

  let y = startY;
  const x = marginX;

  const ensureSpace = (required) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (y + required <= pageHeight - 14) return;
    doc.addPage();
    y = 16;
  };

  ensureSpace(titleGap + rowHeight * 2);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(r, g, b);
  doc.text(title, x, y);
  y += titleGap;

  doc.setFillColor(r, g, b);
  doc.rect(x, y, tableWidth, rowHeight, 'F');
  doc.setDrawColor(200, 210, 220);
  doc.setLineWidth(0.2);
  doc.rect(x, y, tableWidth, rowHeight);

  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  let colX = x;
  columns.forEach((col, idx) => {
    if (idx > 0) doc.line(colX, y, colX, y + rowHeight);
    doc.text(col.label, colX + 2, y + 5.3);
    colX += col.width;
  });
  y += rowHeight;

  doc.setTextColor(32, 43, 58);
  doc.setFont('helvetica', 'normal');

  rows.forEach((row, rowIndex) => {
    ensureSpace(rowHeight + 2);
    doc.setFillColor(rowIndex % 2 === 0 ? 248 : 255, rowIndex % 2 === 0 ? 250 : 255, rowIndex % 2 === 0 ? 252 : 255);
    doc.rect(x, y, tableWidth, rowHeight, 'F');
    doc.setDrawColor(218, 226, 236);
    doc.rect(x, y, tableWidth, rowHeight);

    let cellX = x;
    columns.forEach((col, idx) => {
      if (idx > 0) doc.line(cellX, y, cellX, y + rowHeight);
      const value = toText(row[idx] ?? '');
      const clipped = doc.splitTextToSize(value, col.width - 4)[0] || '';
      const align = col.align || 'left';
      if (align === 'right') {
        doc.text(clipped, cellX + col.width - 2, y + 5.3, { align: 'right' });
      } else if (align === 'center') {
        doc.text(clipped, cellX + col.width / 2, y + 5.3, { align: 'center' });
      } else {
        doc.text(clipped, cellX + 2, y + 5.3);
      }
      cellX += col.width;
    });
    y += rowHeight;
  });

  return y + 4;
};

export const downloadFeesStructurePdf = async ({ structure = {}, school = {} }) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const [r, g, b] = parseHexColor(school.accentColor || '#0f172a');

  const schoolName = toText(school.schoolName) || 'School';
  const schoolAddressLine = toText(school.schoolAddressLine);
  const schoolContactLine = toText(school.schoolContactLine);
  const logoUrl = toText(school.logoUrl || school.logoUrlOverride);
  const logoDataUrl = await loadLogoDataUrl(logoUrl);

  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.35);
  doc.rect(5, 5, pageWidth - 10, 287);

  doc.setFillColor(r, g, b);
  doc.rect(8, 8, pageWidth - 16, 32, 'F');

  if (logoDataUrl) {
    try {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(12, 11, 18, 18, 2, 2, 'F');
      doc.addImage(logoDataUrl, 'PNG', 13, 12, 16, 16);
    } catch {
      // Ignore logo render failure.
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(schoolName.toUpperCase(), pageWidth / 2, 18, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  if (schoolAddressLine) doc.text(schoolAddressLine, pageWidth / 2, 24, { align: 'center' });
  if (schoolContactLine) doc.text(schoolContactLine, pageWidth / 2, 28, { align: 'center' });

  const classLabel = toText(structure.className || structure.class || '-');
  const title = `Fees Structure for Class ${classLabel}`;
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(title, pageWidth / 2, 48, { align: 'center' });

  const board = toText(structure.board || 'GENERAL');
  const year = toText(structure.academicYearName || structure.academicYear || '');
  const generatedOn = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Board: ${board}`, 14, 56);
  if (year) doc.text(`Academic Year: ${year}`, 14, 61);
  doc.text(`Generated On: ${generatedOn}`, pageWidth - 14, 56, { align: 'right' });
  doc.text(`Structure: ${toText(structure.name || '-')}`, pageWidth - 14, 61, { align: 'right' });

  const headRows = (structure.feeHeads || []).map((head) => {
    const payableDate =
      (structure.installments || []).length > 1
        ? 'As per installments'
        : formatDate(structure.installments?.[0]?.dueDate);
    return [toText(head?.label || '-'), formatCurrency(head?.amount), payableDate];
  });

  const headColumns = [
    { label: 'Fee Breakdown', width: 98, align: 'left' },
    { label: 'Amount', width: 40, align: 'right' },
    { label: 'Date Payable', width: 48, align: 'center' },
  ];

  const totalAmount = toAmount(
    structure.totalAmount ||
      (structure.feeHeads || []).reduce((sum, item) => sum + toAmount(item?.amount), 0)
  );
  const lateFeeAmount = toAmount(structure.lateFeeAmount);

  let currentY = drawTable({
    doc,
    startY: 70,
    title: 'Fee Breakdown',
    columns: headColumns,
    rows: headRows.length ? headRows : [['No fee heads configured', '-', '-']],
    accent: [r, g, b],
  });

  const installmentRows = (structure.installments || []).map((item) => [
    toText(item?.label || '-'),
    formatCurrency(item?.amount),
    formatDate(item?.dueDate),
  ]);

  const installmentColumns = [
    { label: 'Installment', width: 98, align: 'left' },
    { label: 'Amount', width: 40, align: 'right' },
    { label: 'Date Payable', width: 48, align: 'center' },
  ];

  currentY = drawTable({
    doc,
    startY: currentY,
    title: 'Installment Plan',
    columns: installmentColumns,
    rows: installmentRows.length ? installmentRows : [['Lump Sum Payment', formatCurrency(totalAmount), '-']],
    accent: [r, g, b],
  });

  if (currentY > 274) {
    doc.addPage();
    currentY = 18;
  }
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(12, currentY, pageWidth - 24, 10, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Total Fees: ${formatCurrency(totalAmount)}`, pageWidth - 16, currentY + 6.3, { align: 'right' });
  currentY += 14;

  if (currentY > 274) {
    doc.addPage();
    currentY = 18;
  }
  doc.setFillColor(255, 247, 237);
  doc.setDrawColor(253, 186, 116);
  doc.roundedRect(12, currentY, pageWidth - 24, 12, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(154, 52, 18);
  doc.text('Late Fine Policy', 15, currentY + 5.1);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(
    lateFeeAmount > 0
      ? `Fine Amount: ${formatCurrency(lateFeeAmount)} per day after due date (until payment).`
      : 'Fine Amount: No late fine configured for this fee structure.',
    15,
    currentY + 9.2
  );
  currentY += 16;

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text('This is a computer-generated fee structure document.', pageWidth / 2, 286, { align: 'center' });

  const fileName = `fees_structure_${toFileSafe(classLabel) || 'class'}_${toFileSafe(year || generatedOn) || 'download'}.pdf`;
  doc.save(fileName);
};
