const normalizeAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
};

const normalizeLabel = (value) => String(value || '').trim();

const ADMISSION_HEAD_PATTERNS = [
  /\badmission\b/i,
  /\bregistration\b/i,
];

const isAdmissionFeeHead = (label) => {
  const normalized = normalizeLabel(label);
  if (!normalized) return false;
  return ADMISSION_HEAD_PATTERNS.some((pattern) => pattern.test(normalized));
};

const normalizeFeeHeads = (feeHeads = []) => {
  if (!Array.isArray(feeHeads)) return [];
  return feeHeads
    .map((head) => ({
      label: normalizeLabel(head?.label),
      amount: normalizeAmount(head?.amount),
    }))
    .filter((head) => Boolean(head.label));
};

const normalizeInstallments = (installments = []) => {
  if (!Array.isArray(installments)) return [];
  return installments
    .map((item) => ({
      label: normalizeLabel(item?.label),
      amount: normalizeAmount(item?.amount),
      dueDate: item?.dueDate ? new Date(item.dueDate) : undefined,
    }))
    .filter((item) => Boolean(item.label));
};

const sumAmounts = (items = []) =>
  items.reduce((sum, item) => sum + normalizeAmount(item.amount), 0);

const rebalanceInstallmentsToTotal = ({ installments = [], totalAmount = 0 }) => {
  const normalized = normalizeInstallments(installments);
  if (normalized.length === 0) return [];

  const target = normalizeAmount(totalAmount);
  const current = sumAmounts(normalized);
  const diff = target - current;
  if (diff === 0) return normalized;

  const output = normalized.map((item) => ({ ...item }));
  if (diff > 0) {
    output[output.length - 1].amount = normalizeAmount(output[output.length - 1].amount + diff);
    return output;
  }

  let remainingReduction = Math.abs(diff);
  for (let index = output.length - 1; index >= 0 && remainingReduction > 0; index -= 1) {
    const currentAmount = normalizeAmount(output[index].amount);
    const deduction = Math.min(currentAmount, remainingReduction);
    output[index].amount = normalizeAmount(currentAmount - deduction);
    remainingReduction -= deduction;
  }
  return output;
};

const buildInvoiceSnapshotsForStudent = ({
  structure = {},
  hasPriorInvoice = false,
}) => {
  const sourceHeads = normalizeFeeHeads(structure.feeHeads || []);
  const sourceInstallments = normalizeInstallments(structure.installments || []);

  const feeHeadsSnapshot = hasPriorInvoice
    ? sourceHeads.filter((head) => !isAdmissionFeeHead(head.label))
    : sourceHeads;

  const totalAmount = sourceHeads.length > 0
    ? sumAmounts(feeHeadsSnapshot)
    : normalizeAmount(structure.totalAmount);

  const installmentsSnapshot = rebalanceInstallmentsToTotal({
    installments: sourceInstallments,
    totalAmount,
  });

  return {
    totalAmount,
    feeHeadsSnapshot,
    installmentsSnapshot,
  };
};

module.exports = {
  isAdmissionFeeHead,
  buildInvoiceSnapshotsForStudent,
};
