import { useState, useRef } from 'react';
import { generateStatements } from '../utils/financialEngine';
import { DownloadCloud, FileText, Check } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';

export default function FinancialStatements({ parsedData }) {
  const statements = generateStatements(parsedData);
  const [activeTab, setActiveTab] = useState('labaRugi');
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const exportToPDF = () => {
    setIsExporting(true);
    const element = reportRef.current;
    
    // Set a slight delay to allow UI to update (if we had specific PDF styles)
    setTimeout(() => {
      const opt = {
        margin:       0.5,
        filename:     'Laporan_Keuangan.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      html2pdf().set(opt).from(element).save().then(() => {
        setIsExporting(false);
      });
    }, 100);
  };

  const exportToExcel = () => {
    // Buat worksheet untuk masing-masing laporan
    const { incomeStatement, balanceSheet, cashFlowStatement } = statements;

    const lrData = [
      ["LAPORAN LABA RUGI"],
      [],
      ["Pendapatan", formatCurrency(incomeStatement.revenue)],
      ["Harga Pokok Penjualan", formatCurrency(incomeStatement.cogs)],
      ["Laba Kotor", formatCurrency(incomeStatement.grossProfit)],
      [],
      ["Biaya Operasional", formatCurrency(incomeStatement.operatingExpenses)],
      ["Pendapatan Lain-lain", formatCurrency(incomeStatement.otherIncome)],
      [],
      ["Laba Bersih", formatCurrency(incomeStatement.netProfit)]
    ];

    const neracaData = [
      ["NERACA (Berdasarkan Ekstraksi Kas & Transaksi)"],
      [],
      ["Aset"],
      ["Kas", formatCurrency(balanceSheet.assets.cash)],
      ["Piutang", formatCurrency(balanceSheet.assets.accountsReceivable)],
      ["Peralatan", formatCurrency(balanceSheet.assets.equipment)],
      ["Total Aset", formatCurrency(balanceSheet.assets.totalAssets)],
      [],
      ["Kewajiban"],
      ["Utang", formatCurrency(balanceSheet.liabilities.loans)],
      ["Utang Usaha", formatCurrency(balanceSheet.liabilities.accountsPayable)],
      ["Total Kewajiban", formatCurrency(balanceSheet.liabilities.totalLiabilities)],
      [],
      ["Ekuitas"],
      ["Modal Pemilik + Laba Ditahan", formatCurrency(balanceSheet.equity.ownerEquity)],
      ["Total Kewajiban & Ekuitas", formatCurrency(balanceSheet.equity.totalLiabilitiesAndEquity)]
    ];

    const akData = [
      ["LAPORAN ARUS KAS"],
      [],
      ["Aktivitas Operasi", formatCurrency(cashFlowStatement.operating)],
      ["Aktivitas Investasi", formatCurrency(cashFlowStatement.investing)],
      ["Aktivitas Pendanaan", formatCurrency(cashFlowStatement.financing)],
      [],
      ["Arus Kas Bersih", formatCurrency(cashFlowStatement.netCashFlow)]
    ];

    const wb = XLSX.utils.book_new();
    const wsLR = XLSX.utils.aoa_to_sheet(lrData);
    const wsNeraca = XLSX.utils.aoa_to_sheet(neracaData);
    const wsAK = XLSX.utils.aoa_to_sheet(akData);

    XLSX.utils.book_append_sheet(wb, wsLR, "Laba Rugi");
    XLSX.utils.book_append_sheet(wb, wsNeraca, "Neraca");
    XLSX.utils.book_append_sheet(wb, wsAK, "Arus Kas");

    XLSX.writeFile(wb, "Laporan_Keuangan.xlsx");
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="card-title" style={{ marginBottom: '0.25rem' }}>3 Statement Generator</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            Dihasilkan otomatis dari data terstruktur Anda.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <button className="btn btn-ghost" onClick={exportToExcel}>
            <FileText size={15} />
            Excel
          </button>
          <button className="btn btn-primary" onClick={exportToPDF} disabled={isExporting}>
            {isExporting ? <Check size={15} /> : <DownloadCloud size={15} />}
            {isExporting ? 'Mengekspor...' : 'Export PDF'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem', gap: '1.5rem' }}>
        <button 
          onClick={() => setActiveTab('labaRugi')}
          style={{ 
            background: 'none', border: 'none', padding: '0.75rem 0', fontWeight: '500',
            color: activeTab === 'labaRugi' ? 'var(--text-main)' : 'var(--text-muted)',
            borderBottom: activeTab === 'labaRugi' ? '2px solid var(--primary)' : '2px solid transparent',
            cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          Laba Rugi
        </button>
        <button 
          onClick={() => setActiveTab('neraca')}
          style={{ 
            background: 'none', border: 'none', padding: '0.75rem 0', fontWeight: '500',
            color: activeTab === 'neraca' ? 'var(--text-main)' : 'var(--text-muted)',
            borderBottom: activeTab === 'neraca' ? '2px solid var(--primary)' : '2px solid transparent',
            cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          Neraca
        </button>
        <button 
          onClick={() => setActiveTab('arusKas')}
          style={{ 
            background: 'none', border: 'none', padding: '0.75rem 0', fontWeight: '500',
            color: activeTab === 'arusKas' ? 'var(--text-main)' : 'var(--text-muted)',
            borderBottom: activeTab === 'arusKas' ? '2px solid var(--primary)' : '2px solid transparent',
            cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          Arus Kas
        </button>
      </div>

      <div ref={reportRef} style={{ padding: '1.5rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
        {/* Laba Rugi */}
        {(activeTab === 'labaRugi' || isExporting) && (
          <div style={{ marginBottom: isExporting ? '3rem' : '0' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Laporan Laba Rugi</h3>
            <table style={{ width: '100%', marginBottom: '1rem' }}>
              <tbody>
                <tr>
                  <td>Pendapatan Penjualan</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(statements.incomeStatement.revenue)}</td>
                </tr>
                <tr>
                  <td>Harga Pokok Penjualan (HPP)</td>
                  <td style={{ textAlign: 'right', color: 'var(--danger)' }}>({formatCurrency(statements.incomeStatement.cogs)})</td>
                </tr>
                <tr style={{ fontWeight: '600', backgroundColor: 'var(--bg-card)' }}>
                  <td>Laba Kotor</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(statements.incomeStatement.grossProfit)}</td>
                </tr>
                <tr>
                  <td colSpan="2" style={{ padding: '1rem 0' }}></td>
                </tr>
                <tr>
                  <td>Biaya Operasional</td>
                  <td style={{ textAlign: 'right', color: 'var(--danger)' }}>({formatCurrency(statements.incomeStatement.operatingExpenses)})</td>
                </tr>
                <tr>
                  <td>Pendapatan Lain-lain</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(statements.incomeStatement.otherIncome)}</td>
                </tr>
                <tr>
                  <td colSpan="2" style={{ borderBottom: '1px solid var(--border)' }}></td>
                </tr>
                <tr style={{ fontWeight: '700', fontSize: '1.125rem' }}>
                  <td style={{ paddingTop: '1rem' }}>Laba Bersih</td>
                  <td style={{ textAlign: 'right', paddingTop: '1rem', color: statements.incomeStatement.netProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {formatCurrency(statements.incomeStatement.netProfit)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Neraca */}
        {(activeTab === 'neraca' || isExporting) && (
          <div style={{ marginBottom: isExporting ? '3rem' : '0' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Neraca</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h4 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Aset</h4>
                <table style={{ width: '100%' }}>
                  <tbody>
                    <tr>
                      <td>Kas & Setara Kas</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(statements.balanceSheet.assets.cash)}</td>
                    </tr>
                    <tr>
                      <td>Piutang Usaha</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(statements.balanceSheet.assets.accountsReceivable)}</td>
                    </tr>
                    <tr>
                      <td>Peralatan / Inventaris</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(statements.balanceSheet.assets.equipment)}</td>
                    </tr>
                    <tr style={{ fontWeight: '600', backgroundColor: 'var(--bg-card)' }}>
                      <td style={{ paddingTop: '1rem' }}>Total Aset</td>
                      <td style={{ textAlign: 'right', paddingTop: '1rem' }}>{formatCurrency(statements.balanceSheet.assets.totalAssets)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h4 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Kewajiban & Ekuitas</h4>
                <table style={{ width: '100%' }}>
                  <tbody>
                    <tr>
                      <td>Utang Usaha</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(statements.balanceSheet.liabilities.accountsPayable)}</td>
                    </tr>
                    <tr>
                      <td>Utang Pinjaman</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(statements.balanceSheet.liabilities.loans)}</td>
                    </tr>
                    <tr style={{ fontWeight: '600', backgroundColor: 'var(--bg-card)' }}>
                      <td>Total Kewajiban</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(statements.balanceSheet.liabilities.totalLiabilities)}</td>
                    </tr>
                    <tr>
                      <td colSpan="2" style={{ padding: '0.5rem 0' }}></td>
                    </tr>
                    <tr>
                      <td>Modal Pemilik & Laba Ditahan</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(statements.balanceSheet.equity.ownerEquity)}</td>
                    </tr>
                    <tr style={{ fontWeight: '600', backgroundColor: 'var(--bg-card)' }}>
                      <td style={{ paddingTop: '1rem' }}>Total Kew. & Ekuitas</td>
                      <td style={{ textAlign: 'right', paddingTop: '1rem' }}>{formatCurrency(statements.balanceSheet.equity.totalLiabilitiesAndEquity)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Arus Kas */}
        {(activeTab === 'arusKas' || isExporting) && (
          <div>
            <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Laporan Arus Kas</h3>
            <table style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
              <tbody>
                <tr>
                  <td>Arus Kas dari Aktivitas Operasi</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(statements.cashFlowStatement.operating)}</td>
                </tr>
                <tr>
                  <td>Arus Kas dari Aktivitas Investasi</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(statements.cashFlowStatement.investing)}</td>
                </tr>
                <tr>
                  <td>Arus Kas dari Aktivitas Pendanaan</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(statements.cashFlowStatement.financing)}</td>
                </tr>
                <tr>
                  <td colSpan="2" style={{ borderBottom: '1px solid var(--border)', padding: '0.5rem 0' }}></td>
                </tr>
                <tr style={{ fontWeight: '700', fontSize: '1.125rem' }}>
                  <td style={{ paddingTop: '1rem' }}>Arus Kas Bersih</td>
                  <td style={{ textAlign: 'right', paddingTop: '1rem', color: statements.cashFlowStatement.netCashFlow >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {formatCurrency(statements.cashFlowStatement.netCashFlow)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
