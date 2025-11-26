// backend/models/nifFeeStructures.js

// 1 & 2 Year Advance Certificate (Fashion / Interior)
const ADV_CERT_STRUCT = {
  1: {
    total: 155000,
    installments: [
      { label: 'Time of Admission', amount: 22000 },
      { label: 'Time of Batch Commencement', amount: 19000 },
      { label: 'Registration fee (1st part)', amount: 5000 },
      { label: '1st Installment', amount: 7500 },
      { label: 'Registration fee (2nd part within 30 days)', amount: 17000 },
      { label: '2nd Installment', amount: 7500 },
      { label: '3rd Installment', amount: 7500 },
      { label: '4th Installment', amount: 7500 },
      { label: 'Registration fee (3rd part within 90 days)', amount: 17000 },
      { label: '5th Installment', amount: 7500 },
      { label: '6th Installment', amount: 7500 },
      { label: '7th Installment', amount: 7500 },
      { label: '8th Installment', amount: 7500 },
      { label: '9th Installment', amount: 7500 },
      { label: '10th Installment', amount: 7500 },
    ],
  },
  2: {
    total: 155000,
    installments: [
      // same or adjusted as per your PDF
    ],
  },
};

// B.VOC (3 years)
const BVOC_STRUCT = {
  1: { total: 191000, installments: [] },
  2: { total: 191000, installments: [] },
  3: { total: 191000, installments: [] },
};

// M.VOC (2 years)
const MVOC_STRUCT = {
  1: { total: 205000, installments: [] },
  2: { total: 205000, installments: [] },
};

const NIF_FEE_STRUCTURES = {
  ADV_CERT: ADV_CERT_STRUCT,
  B_VOC: BVOC_STRUCT,
  M_VOC: MVOC_STRUCT,
};

module.exports = { NIF_FEE_STRUCTURES };
