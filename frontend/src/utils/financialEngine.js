/**
 * MVP Financial Engine
 * Mengkalkulasi 3 Laporan Keuangan dasar berdasarkan data transaksi terstruktur.
 */

const isRevenue = (category) => {
  const cat = category.toLowerCase();
  return cat.includes('penjualan') || cat.includes('pendapatan') || cat.includes('sales') || cat.includes('revenue');
};

const isExpense = (category) => {
  const cat = category.toLowerCase();
  return (
    cat.includes('biaya') || cat.includes('beban') || cat.includes('operasional') ||
    cat.includes('gaji') || cat.includes('sewa') || cat.includes('marketing') ||
    cat.includes('pemasaran') || cat.includes('promosi') || cat.includes('iklan') ||
    cat.includes('expense') || cat.includes('overhead') || cat.includes('utility') ||
    cat.includes('transport') || cat.includes('ongkos') || cat.includes('administrasi')
  );
};

const isCOGS = (category) => {
  const cat = category.toLowerCase();
  return cat.includes('bahan baku') || cat.includes('hpp') || cat.includes('cogs') || cat.includes('pembelian barang');
};

const isAsset = (category) => {
  const cat = category.toLowerCase();
  return (
    cat.includes('aset') || cat.includes('asset') ||
    cat.includes('kas') || cat.includes('bank') ||
    cat.includes('piutang') || cat.includes('inventaris') ||
    cat.includes('peralatan') || cat.includes('mesin') ||
    cat.includes('tetap') || cat.includes('kendaraan') ||
    cat.includes('gedung') || cat.includes('bangunan') ||
    cat.includes('tanah')
  );
};

const isLiability = (category) => {
  const cat = category.toLowerCase();
  return (
    cat.includes('utang') || cat.includes('pinjaman') || cat.includes('liability') ||
    cat.includes('cicilan') || cat.includes('angsuran') ||
    cat.includes('kur') || cat.includes('kredit bank') || cat.includes('hutang')
  );
};

const isEquity = (category) => {
  const cat = category.toLowerCase();
  return cat.includes('modal') || cat.includes('prive') || cat.includes('equity');
};

// ─── Personal / Mikro Statements ─────────────────────────────────────────────
// Direction is determined purely by t.type (Debit = masuk, Kredit = keluar).
// No HPP, no otherIncome bucket — just Pendapatan vs Pengeluaran.

export const generatePersonalStatements = (transactions) => {
  let totalIncome = 0;
  let totalExpenses = 0;
  const incomeDetails = {};
  const expenseDetails = {};

  transactions.forEach((t) => {
    const isIncome = t.type.toLowerCase() === 'debit';
    const cat = t.category || 'Lain-lain';
    if (isIncome) {
      totalIncome += t.amount;
      incomeDetails[cat] = (incomeDetails[cat] || 0) + t.amount;
    } else {
      totalExpenses += t.amount;
      expenseDetails[cat] = (expenseDetails[cat] || 0) + t.amount;
    }
  });

  const netProfit = totalIncome - totalExpenses;

  const incomeStatement = {
    revenue: totalIncome,
    cogs: 0,
    grossProfit: totalIncome,
    operatingExpenses: totalExpenses,
    otherIncome: 0,
    netProfit,
    details: { incomeDetails, expenseDetails },
    isPersonal: true,
  };

  // Balance sheet — simplified cash position
  let cashBalance = 0;
  transactions.forEach((t) => {
    cashBalance += t.type.toLowerCase() === 'debit' ? t.amount : -t.amount;
  });
  const balanceSheet = {
    assets: { cash: cashBalance, accountsReceivable: 0, equipment: 0, totalAssets: cashBalance },
    liabilities: { accountsPayable: 0, loans: 0, totalLiabilities: 0 },
    equity: { ownerEquity: netProfit, totalLiabilitiesAndEquity: netProfit },
  };

  // Cash flow — all ops (personal has no investing/financing split)
  const cashFlowStatement = {
    operating: netProfit,
    investing: 0,
    financing: 0,
    netCashFlow: netProfit,
  };

  return { incomeStatement, balanceSheet, cashFlowStatement };
};

// ─── Business Statements ──────────────────────────────────────────────────────

export const generateStatements = (transactions) => {
  // --- 1. Laba Rugi (Income Statement) ---
  let totalRevenue = 0;
  let totalCOGS = 0;
  let totalOperatingExpense = 0;
  let otherIncome = 0;
  
  const incomeDetails = {};
  const expenseDetails = {};

  transactions.forEach((t) => {
    // Pendapatan biasanya di sisi Kredit, Biaya di sisi Debit jika menggunakan sistem akuntansi double entry.
    // Namun untuk data sederhana buku kas, biasanya Uang Masuk = Debit/Pemasukan, Uang Keluar = Kredit/Pengeluaran.
    // Kita asumsikan format: Tipe Debit = Pemasukan, Kredit = Pengeluaran berdasarkan contoh data.
    const isIncomeType = t.type.toLowerCase() === 'debit';
    const amount = t.amount;
    const cat = t.category;

    if (isRevenue(cat)) {
      totalRevenue += amount;
      incomeDetails[cat] = (incomeDetails[cat] || 0) + amount;
    } else if (isCOGS(cat)) {
      totalCOGS += amount;
    } else if (isExpense(cat)) {
      totalOperatingExpense += amount;
      expenseDetails[cat] = (expenseDetails[cat] || 0) + amount;
    } else if (!isIncomeType && !isEquity(cat) && !isLiability(cat) && !isAsset(cat)) {
      // Catch-all: setiap uang keluar (Kredit) yang tidak dikenali kategorinya
      // → dianggap Beban Operasional agar tidak ada yang terlewat
      totalOperatingExpense += amount;
      expenseDetails[cat] = (expenseDetails[cat] || 0) + amount;
    } else if (isIncomeType && !isEquity(cat) && !isLiability(cat) && !isAsset(cat)) {
      otherIncome += amount;
    }
  });

  const grossProfit = totalRevenue - totalCOGS;
  const netProfit = grossProfit - totalOperatingExpense + otherIncome;

  const incomeStatement = {
    revenue: totalRevenue,
    cogs: totalCOGS,
    grossProfit,
    operatingExpenses: totalOperatingExpense,
    otherIncome,
    netProfit,
    details: { incomeDetails, expenseDetails }
  };

  // --- 2. Neraca (Balance Sheet) ---
  // Untuk MVP, kita simulasi neraca dari pergerakan kas dan transaksi modal/utang.
  let cashBalance = 0;
  let accountsReceivable = 0;
  let equipment = 0;
  let accountsPayable = 0;
  let loans = 0;
  let equity = 0;

  transactions.forEach((t) => {
    const isIncome = t.type.toLowerCase() === 'debit';
    if (isIncome) cashBalance += t.amount;
    else cashBalance -= t.amount;

    if (isEquity(t.category) && isIncome) equity += t.amount;
    // Loan receipt → adds to outstanding loans; cicilan/repayment → reduces loans
    if (isLiability(t.category)) {
      if (isIncome) loans += t.amount;
      else loans -= t.amount; // cicilan/angsuran = repayment
    }
    if (t.category.toLowerCase().includes('piutang') && !isIncome) accountsReceivable += t.amount;
    // Asset purchase (mesin, kendaraan, peralatan, aset tetap) → fixed assets
    if (isAsset(t.category) && !isIncome &&
        !t.category.toLowerCase().includes('kas') &&
        !t.category.toLowerCase().includes('bank')) {
      equipment += t.amount;
    }
  });

  // Retained earnings dari laba berjalan
  equity += netProfit;

  // Balancing act for simple MVP (To force A = L + E if data is incomplete)
  const totalAssets = cashBalance + accountsReceivable + equipment;
  const totalLiabilitiesAndEquity = loans + accountsPayable + equity;
  const imbalance = totalAssets - totalLiabilitiesAndEquity;
  
  // Jika tidak balance (karena data mentah bukan double entry), kita sesuaikan di Modal/Laba Ditahan
  equity += imbalance;

  const balanceSheet = {
    assets: {
      cash: cashBalance,
      accountsReceivable,
      equipment,
      totalAssets: totalAssets
    },
    liabilities: {
      accountsPayable,
      loans,
      totalLiabilities: accountsPayable + loans
    },
    equity: {
      ownerEquity: equity,
      totalLiabilitiesAndEquity: (accountsPayable + loans) + equity
    }
  };

  // --- 3. Arus Kas (Cash Flow) ---
  let operatingCF = 0;
  let investingCF = 0;
  let financingCF = 0;

  transactions.forEach((t) => {
    const isIncome = t.type.toLowerCase() === 'debit';
    const amount = isIncome ? t.amount : -t.amount;
    const cat = t.category;

    if (isAsset(cat) || cat.toLowerCase().includes('peralatan')) {
      investingCF += amount;
    } else if (isLiability(cat) || isEquity(cat)) {
      financingCF += amount;
    } else {
      // Default ke operasi (penjualan, biaya operasional, hpp)
      operatingCF += amount;
    }
  });

  const cashFlowStatement = {
    operating: operatingCF,
    investing: investingCF,
    financing: financingCF,
    netCashFlow: operatingCF + investingCF + financingCF
  };

  return {
    incomeStatement,
    balanceSheet,
    cashFlowStatement
  };
};
