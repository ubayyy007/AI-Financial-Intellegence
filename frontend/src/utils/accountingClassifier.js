// Lightweight, explainable account classification.
// This is a suggestion layer only: users must review low-confidence rows.

export const ACCOUNT_TYPES = [
  { value: 'cash', label: 'Kas & Setara Kas', className: 'Aset Lancar' },
  { value: 'accounts_receivable', label: 'Piutang Usaha', className: 'Aset Lancar' },
  { value: 'inventory', label: 'Persediaan', className: 'Aset Lancar' },
  { value: 'prepaid_expense', label: 'Biaya Dibayar di Muka', className: 'Aset Lancar' },
  { value: 'equipment', label: 'Peralatan', className: 'Aset Tetap' },
  { value: 'vehicle', label: 'Kendaraan', className: 'Aset Tetap' },
  { value: 'building', label: 'Bangunan/Gedung', className: 'Aset Tetap' },
  { value: 'land', label: 'Tanah', className: 'Aset Tetap' },
  { value: 'intangible', label: 'Aset Tidak Berwujud', className: 'Aset Jangka Panjang' },
  { value: 'accounts_payable', label: 'Utang Usaha', className: 'Liabilitas Jangka Pendek' },
  { value: 'tax_payable', label: 'Utang Pajak', className: 'Liabilitas Jangka Pendek' },
  { value: 'accrued_expense', label: 'Beban Masih Harus Dibayar', className: 'Liabilitas Jangka Pendek' },
  { value: 'loan_payable', label: 'Pinjaman/Utang Bank', className: 'Liabilitas' },
  { value: 'equity', label: 'Modal/Prive', className: 'Ekuitas' },
  { value: 'income', label: 'Pendapatan', className: 'Pendapatan' },
  { value: 'expense', label: 'Beban/Biaya', className: 'Beban' },
  { value: 'uncertain', label: 'Perlu Ditinjau', className: 'Belum Terkategori' },
];

export const PAYMENT_STATUSES = [
  { value: 'unknown', label: 'Belum diketahui' },
  { value: 'open', label: 'Belum lunas' },
  { value: 'partial', label: 'Sebagian' },
  { value: 'paid', label: 'Lunas' },
];

const RULES = [
  { type: 'accounts_receivable', words: ['piutang', 'receivable', 'belum dibayar pelanggan', 'invoice pelanggan'] },
  { type: 'accounts_payable', words: ['utang usaha', 'hutang usaha', 'payable', 'tagihan vendor', 'tagihan supplier'] },
  { type: 'tax_payable', words: ['utang pajak', 'hutang pajak', 'pajak terutang', 'pph terutang', 'ppn terutang'] },
  { type: 'accrued_expense', words: ['beban terutang', 'biaya terutang', 'masih harus dibayar', 'accrued'] },
  { type: 'loan_payable', words: ['pinjaman', 'utang bank', 'hutang bank', 'kredit bank', 'hipotek', 'obligasi', 'cicilan', 'angsuran', 'kur'] },
  { type: 'inventory', words: ['persediaan', 'stok', 'inventory', 'barang dagang'] },
  { type: 'prepaid_expense', words: ['dibayar di muka', 'dibayar dimuka', 'sewa di muka', 'asuransi di muka', 'prepaid'] },
  { type: 'vehicle', words: ['kendaraan', 'mobil', 'motor'] },
  { type: 'building', words: ['bangunan', 'gedung'] },
  { type: 'land', words: ['tanah'] },
  { type: 'equipment', words: ['peralatan', 'mesin', 'laptop', 'komputer', 'inventaris', 'furniture'] },
  { type: 'intangible', words: ['paten', 'goodwill', 'lisensi', 'hak cipta', 'software'] },
  { type: 'equity', words: ['modal', 'prive', 'ekuitas', 'equity', 'setoran pemilik', 'dividen'] },
  { type: 'income', words: ['pendapatan', 'penjualan', 'sales', 'revenue', 'gaji masuk', 'bonus masuk'] },
  { type: 'expense', words: ['beban', 'biaya', 'gaji', 'listrik', 'sewa', 'transport', 'ongkos', 'marketing', 'pemasaran', 'promosi', 'hpp', 'cogs'] },
];

export const classifyTransaction = (transaction) => {
  const text = [transaction.category, transaction.description].filter(Boolean).join(' ').toLowerCase();
  const matched = RULES.find((rule) => rule.words.some((word) => text.includes(word)));
  if (matched) {
    return {
      accountType: matched.type,
      classificationConfidence: 'medium',
      classificationSource: 'keyword',
    };
  }

  return {
    accountType: 'uncertain',
    classificationConfidence: 'low',
    classificationSource: 'manual_review',
  };
};

export const classifyTransactions = (transactions) => transactions.map((transaction) => ({
  ...transaction,
  ...classifyTransaction(transaction),
  dueDate: transaction.dueDate || '',
  counterparty: transaction.counterparty || '',
  paymentStatus: transaction.paymentStatus || 'unknown',
}));

export const getAccountTypeLabel = (value) =>
  ACCOUNT_TYPES.find((type) => type.value === value)?.label || 'Perlu Ditinjau';
