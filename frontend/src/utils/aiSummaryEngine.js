/**
 * AI Summary Engine (Heuristic-based)
 * Menghasilkan narasi dan rekomendasi bisnis berdasarkan kalkulasi rasio.
 */

export const generateAISummary = (ratios, statements, lang = 'id') => {
  const { currentRatio } = ratios.liquidity;
  const { netProfitMargin, grossProfitMargin } = ratios.profitability;
  const { operatingRatio } = ratios.efficiency;
  
  const netProfit = statements.incomeStatement.netProfit;
  const revenue = statements.incomeStatement.revenue;

  const content = {
    id: {
      greeting: "Berdasarkan analisis rasio dan laporan keuangan Anda, berikut adalah ringkasan eksekutif dari AI:",
      condition: "",
      recommendations: []
    },
    en: {
      greeting: "Based on the ratio analysis and financial statements, here is the AI executive summary:",
      condition: "",
      recommendations: []
    }
  };

  // --- Analisis Kondisi (Condition Analysis) ---
  
  let conditionID = "";
  let conditionEN = "";

  if (netProfit < 0) {
    conditionID += "Bisnis Anda saat ini mengalami kerugian bersih. ";
    conditionEN += "Your business is currently operating at a net loss. ";
  } else if (netProfitMargin.value > 0.15) {
    conditionID += "Bisnis Anda menunjukkan profitabilitas yang sangat sehat dan solid. ";
    conditionEN += "Your business shows very healthy and solid profitability. ";
  } else {
    conditionID += "Bisnis Anda mencetak margin keuntungan yang moderat. ";
    conditionEN += "Your business is generating a moderate profit margin. ";
  }

  if (currentRatio.value < 1.0) {
    conditionID += "Namun, peringatan likuiditas terdeteksi: aset lancar Anda saat ini tidak cukup untuk menutupi kewajiban jangka pendek (Cash-Tight). ";
    conditionEN += "However, a liquidity warning is detected: your current assets are insufficient to cover short-term liabilities (Cash-Tight). ";
  } else if (currentRatio.value > 2.0) {
    conditionID += "Posisi likuiditas sangat aman, dengan kas yang cukup berlimpah untuk operasional. ";
    conditionEN += "The liquidity position is highly secure, with abundant cash for operations. ";
  }

  if (operatingRatio.value > 0.8) {
    conditionID += "Beban operasional memakan porsi terlalu besar dari pendapatan, menandakan inefisiensi. ";
    conditionEN += "Operating expenses consume too much of your revenue, indicating inefficiency. ";
  }

  content.id.condition = conditionID;
  content.en.condition = conditionEN;


  // --- Rekomendasi (Actionable Recommendations) ---

  // 1. Profitability & Efficiency
  if (netProfit < 0 || operatingRatio.value > 0.8) {
    content.id.recommendations.push("Efisiensi Biaya: Tinjau ulang beban operasional Anda. Pertimbangkan untuk memangkas biaya non-esensial dan negosiasi ulang dengan vendor.");
    content.en.recommendations.push("Cost Efficiency: Review your operating expenses. Consider cutting non-essential costs and renegotiating with vendors.");
  }

  if (grossProfitMargin.value < 0.2 && revenue > 0) {
    content.id.recommendations.push("Optimasi HPP: Margin kotor terlalu tipis. Anda perlu menaikkan harga jual atau mencari supplier bahan baku yang lebih murah.");
    content.en.recommendations.push("COGS Optimization: Gross margin is too thin. You need to increase selling prices or find cheaper raw material suppliers.");
  }

  // 2. Liquidity (Cash-Tight Warning)
  if (currentRatio.value < 1.0) {
    content.id.recommendations.push("Peringatan Cash-Tight: Segera percepat penagihan piutang dan tunda pembayaran kewajiban yang tidak mendesak untuk menyelamatkan kas.");
    content.en.recommendations.push("Cash-Tight Warning: Immediately accelerate receivables collection and delay non-urgent payables to save cash reserves.");
  }

  // 3. Expansion (Healthy state)
  if (netProfitMargin.value >= 0.15 && currentRatio.value >= 1.5) {
    content.id.recommendations.push("Peluang Ekspansi: Keuangan Anda sangat sehat. Ini adalah waktu yang ideal untuk berinvestasi pada pemasaran baru, rekrutmen talenta, atau ekspansi cabang.");
    content.en.recommendations.push("Expansion Opportunity: Your finances are very healthy. This is an ideal time to invest in new marketing, talent acquisition, or branch expansion.");
  }

  // Fallback recommendation if no specific rule matched
  if (content.id.recommendations.length === 0) {
    content.id.recommendations.push("Pertahankan Stabilitas: Terus pantau rasio keuangan setiap bulan dan siapkan dana darurat setara 3-6 bulan biaya operasional.");
    content.en.recommendations.push("Maintain Stability: Continue monitoring financial ratios monthly and prepare an emergency fund equivalent to 3-6 months of operating costs.");
  }

  return content[lang];
};
