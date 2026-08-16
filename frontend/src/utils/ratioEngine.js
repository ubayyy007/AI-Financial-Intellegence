/**
 * Utility untuk menghitung rasio keuangan BI dari 3 Statements
 */

export const calculateRatios = (statements) => {
  const { incomeStatement, balanceSheet } = statements;

  // 1. Likuiditas: Kemampuan memenuhi kewajiban jangka pendek.
  // Rasio Lancar = Aset Lancar / Kewajiban Lancar
  // Untuk MVP, kita anggap Kas + Piutang sebagai Aset Lancar, dan Utang Usaha sebagai Kewajiban Lancar.
  const currentAssets = balanceSheet.assets.cash + balanceSheet.assets.accountsReceivable;
  const currentLiabilities = balanceSheet.liabilities.accountsPayable;
  
  const currentRatio = currentLiabilities > 0 ? (currentAssets / currentLiabilities) : (currentAssets > 0 ? 999 : 0);

  // 2. Profitabilitas: Kemampuan menghasilkan laba.
  // Net Profit Margin = Laba Bersih / Pendapatan
  const netProfitMargin = incomeStatement.revenue > 0 ? (incomeStatement.netProfit / incomeStatement.revenue) : 0;
  
  // Gross Profit Margin = Laba Kotor / Pendapatan
  const grossProfitMargin = incomeStatement.revenue > 0 ? (incomeStatement.grossProfit / incomeStatement.revenue) : 0;

  // 3. Solvabilitas (Leverage): Proporsi utang terhadap modal.
  // Debt to Equity Ratio (DER) = Total Kewajiban / Total Ekuitas
  const totalLiabilities = balanceSheet.liabilities.totalLiabilities;
  const totalEquity = balanceSheet.equity.ownerEquity;
  const der = totalEquity > 0 ? (totalLiabilities / totalEquity) : (totalLiabilities > 0 ? 999 : 0);

  // 4. Efisiensi: Seberapa efisien operasional dijalankan.
  // Operating Ratio = Biaya Operasional / Pendapatan
  const operatingRatio = incomeStatement.revenue > 0 ? (incomeStatement.operatingExpenses / incomeStatement.revenue) : 0;

  return {
    liquidity: {
      currentRatio: {
        value: currentRatio,
        status: currentRatio >= 1.5 ? 'Sehat' : (currentRatio >= 1.0 ? 'Cukup' : 'Kritis'),
        label: 'Current Ratio (Likuiditas)'
      }
    },
    profitability: {
      netProfitMargin: {
        value: netProfitMargin,
        status: netProfitMargin >= 0.15 ? 'Sehat' : (netProfitMargin >= 0.05 ? 'Cukup' : 'Kritis'),
        label: 'Net Profit Margin'
      },
      grossProfitMargin: {
        value: grossProfitMargin,
        status: grossProfitMargin >= 0.40 ? 'Sehat' : (grossProfitMargin >= 0.20 ? 'Cukup' : 'Kritis'),
        label: 'Gross Profit Margin'
      }
    },
    solvency: {
      der: {
        value: der,
        status: der <= 1.0 ? 'Sehat' : (der <= 2.0 ? 'Cukup' : 'Kritis'), // Lebih rendah lebih baik
        label: 'Debt to Equity Ratio'
      }
    },
    efficiency: {
      operatingRatio: {
        value: operatingRatio,
        status: operatingRatio <= 0.60 ? 'Sehat' : (operatingRatio <= 0.80 ? 'Cukup' : 'Kritis'), // Lebih rendah lebih baik
        label: 'Operating Ratio'
      }
    }
  };
};

export const prepareChartData = (parsedData, statements) => {
  // Data for Composition Pie Chart (Income vs Expense Breakdown)
  const expenseData = Object.entries(statements.incomeStatement.details.expenseDetails).map(([key, value]) => ({
    name: key,
    value: value
  }));
  
  // Jika tidak ada data spesifik, minimal pakai agregat
  if (expenseData.length === 0 && statements.incomeStatement.operatingExpenses > 0) {
    expenseData.push({ name: 'Operasional', value: statements.incomeStatement.operatingExpenses });
  }
  if (statements.incomeStatement.cogs > 0) {
    expenseData.push({ name: 'HPP (COGS)', value: statements.incomeStatement.cogs });
  }

  // Data for Cash Flow Trend Line Chart (grouped by date)
  const flowByDate = {};
  
  parsedData.forEach(t => {
    if (!flowByDate[t.date]) {
      flowByDate[t.date] = { date: t.date, masuk: 0, keluar: 0 };
    }
    if (t.type.toLowerCase() === 'debit') {
      flowByDate[t.date].masuk += t.amount;
    } else {
      flowByDate[t.date].keluar += t.amount;
    }
  });

  // Sort by date string (simple sort for MVP)
  const cashFlowTrend = Object.values(flowByDate).sort((a, b) => a.date.localeCompare(b.date));

  return {
    expenseComposition: expenseData,
    cashFlowTrend
  };
};
