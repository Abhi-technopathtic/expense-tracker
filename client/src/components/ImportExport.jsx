import { useRef, useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import {
  exportToPDF,
  exportToExcel,
  parseExcelFile,
  downloadExcelTemplate,
} from '../utils/exportUtils';
import {
  FileText, FileSpreadsheet, Upload, Download,
  Loader, CheckCircle, AlertCircle, X, ChevronDown, ChevronUp, Table,
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ─── Preview Modal ────────────────────────────────────────────────────────────
const PreviewModal = ({ data, onConfirm, onCancel, loading }) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <div className="modal-title-group">
          <CheckCircle size={20} className="text-income" />
          <h3 className="modal-title">Import Preview</h3>
        </div>
        <button className="modal-close" onClick={onCancel}><X size={18} /></button>
      </div>

      <p className="modal-subtitle">
        Found <strong>{data.length}</strong> valid transactions. Review before importing:
      </p>

      <div className="preview-table-wrap">
        <table className="preview-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Type</th>
              <th>Category</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 20).map((t, i) => (
              <tr key={i}>
                <td>{new Date(t.date).toLocaleDateString('en-IN')}</td>
                <td className="preview-title">{t.title}</td>
                <td>
                  <span className={`preview-type preview-type--${t.type}`}>
                    {t.type}
                  </span>
                </td>
                <td>{t.category}</td>
                <td className={`preview-amount preview-amount--${t.type}`}>
                  {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 20 && (
          <p className="preview-more">+{data.length - 20} more transactions not shown</p>
        )}
      </div>

      <div className="modal-actions">
        <button className="btn-cancel" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button className="btn-import-confirm" onClick={onConfirm} disabled={loading}>
          {loading
            ? <><span className="loading-spinner" /> Importing...</>
            : <><Upload size={16} /> Import {data.length} Transactions</>}
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ImportExport = () => {
  const { transactions, summary, addTransaction } = useTransactions();
  const { user } = useAuth();
  const excelInputRef = useRef(null);
  const pdfInputRef   = useRef(null);

  const [exporting, setExporting]       = useState(null); // 'pdf' | 'excel'
  const [importing, setImporting]       = useState(false);
  const [previewData, setPreviewData]   = useState(null);
  const [importError, setImportError]   = useState('');
  const [collapsed, setCollapsed]       = useState(false);
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0 });

  // ── Export PDF ──
  const handleExportPDF = async () => {
    if (transactions.length === 0) return toast.error('No transactions to export');
    setExporting('pdf');
    try {
      await new Promise((r) => setTimeout(r, 100)); // let UI update
      exportToPDF(transactions, summary, user?.name);
      toast.success('PDF downloaded! 📄');
    } catch (e) {
      toast.error('PDF export failed: ' + e.message);
    } finally {
      setExporting(null);
    }
  };

  // ── Export Excel ──
  const handleExportExcel = () => {
    if (transactions.length === 0) return toast.error('No transactions to export');
    setExporting('excel');
    try {
      exportToExcel(transactions, summary);
      toast.success('Excel file downloaded! 📊');
    } catch (e) {
      toast.error('Excel export failed: ' + e.message);
    } finally {
      setExporting(null);
    }
  };

  // ── Excel File Selected ──
  const handleExcelFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setImportError('');

    const toastId = toast.loading('Reading Excel file...');
    try {
      const parsed = await parseExcelFile(file);
      toast.dismiss(toastId);
      setPreviewData(parsed);
    } catch (err) {
      toast.dismiss(toastId);
      setImportError(err.message);
      toast.error(err.message);
    }
  };

  // ── PDF File Selected ──
  const handlePDFFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setImportError('');

    const toastId = toast.loading('Parsing PDF...');
    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const token = localStorage.getItem('expense_token');
      const res = await fetch(`${API_BASE}/transactions/import/pdf`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      toast.dismiss(toastId);

      if (!data.success) throw new Error(data.message || 'PDF parse failed');
      if (data.data.length === 0) throw new Error('No valid transactions found in PDF');

      setPreviewData(data.data);
    } catch (err) {
      toast.dismiss(toastId);
      setImportError(err.message);
      toast.error(err.message);
    }
  };

  // ── Confirm Import ──
  const handleConfirmImport = async () => {
    if (!previewData?.length) return;
    setImporting(true);
    setImportProgress({ done: 0, total: previewData.length });

    let successCount = 0;
    let failCount    = 0;

    for (let i = 0; i < previewData.length; i++) {
      try {
        await addTransaction(previewData[i]);
        successCount++;
      } catch {
        failCount++;
      }
      setImportProgress({ done: i + 1, total: previewData.length });
    }

    setImporting(false);
    setPreviewData(null);

    if (successCount > 0) toast.success(`✅ Imported ${successCount} transactions!`);
    if (failCount > 0)    toast.error(`⚠️ ${failCount} transactions failed`);
  };

  return (
    <>
      <div className="ie-card">
        {/* Header */}
        <button className="ie-header" onClick={() => setCollapsed(!collapsed)}>
          <div className="ie-header-left">
            <div className="ie-icon-wrap">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="ie-title">Import / Export</h2>
              <p className="ie-subtitle">PDF & Excel</p>
            </div>
          </div>
          {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </button>

        {!collapsed && (
          <div className="ie-body">
            {/* ── EXPORT SECTION ── */}
            <div className="ie-section">
              <span className="ie-section-label">
                <Download size={13} /> Export
              </span>
              <div className="ie-btn-row">
                <button
                  className="ie-btn ie-btn--pdf"
                  onClick={handleExportPDF}
                  disabled={!!exporting}
                >
                  {exporting === 'pdf'
                    ? <><span className="loading-spinner loading-spinner--sm" /> Generating...</>
                    : <><FileText size={16} /> Export PDF</>}
                </button>
                <button
                  className="ie-btn ie-btn--excel"
                  onClick={handleExportExcel}
                  disabled={!!exporting}
                >
                  {exporting === 'excel'
                    ? <><span className="loading-spinner loading-spinner--sm" /> Generating...</>
                    : <><FileSpreadsheet size={16} /> Export Excel</>}
                </button>
              </div>
            </div>

            {/* ── IMPORT SECTION ── */}
            <div className="ie-section">
              <span className="ie-section-label">
                <Upload size={13} /> Import
              </span>
              <div className="ie-btn-row">
                <button
                  className="ie-btn ie-btn--import"
                  onClick={() => { setImportError(''); excelInputRef.current?.click(); }}
                >
                  <FileSpreadsheet size={16} /> Import Excel
                </button>
                <button
                  className="ie-btn ie-btn--import"
                  onClick={() => { setImportError(''); pdfInputRef.current?.click(); }}
                >
                  <FileText size={16} /> Import PDF
                </button>
              </div>
              <button
                className="ie-template-btn"
                onClick={downloadExcelTemplate}
                title="Download a sample Excel file to see the correct format"
              >
                <Table size={13} /> Download Excel Template
              </button>
            </div>

            {/* Error */}
            {importError && (
              <div className="ie-error">
                <AlertCircle size={14} />
                <span>{importError}</span>
                <button onClick={() => setImportError('')}><X size={13} /></button>
              </div>
            )}

            {/* Info */}
            <p className="ie-info">
              📌 Import supports <strong>XpensePro Excel template</strong> or any spreadsheet with Date, Title, Type, Category, Amount columns. PDF import works with <strong>our exported PDFs</strong>.
            </p>
          </div>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={excelInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        style={{ display: 'none' }}
        onChange={handleExcelFileChange}
      />
      <input
        ref={pdfInputRef}
        type="file"
        accept=".pdf"
        style={{ display: 'none' }}
        onChange={handlePDFFileChange}
      />

      {/* Preview Modal */}
      {previewData && (
        <PreviewModal
          data={previewData}
          onConfirm={handleConfirmImport}
          onCancel={() => !importing && setPreviewData(null)}
          loading={importing}
          progress={importProgress}
        />
      )}
    </>
  );
};

export default ImportExport;
