
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { Invoice } from '../types';
import { InvoicePreview } from './InvoicePreview';
import { Loader2, Download, AlertCircle, Printer } from 'lucide-react';

export const PublicInvoiceView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) return;
      try {
        // Attempt to fetch invoice. 
        // Note: In a real production app, you would use a secure Edge Function 
        // or a signed URL token to bypass RLS for public access. 
        // For this architecture, we assume the 'invoices' table allows public read by ID.
        const { data, error } = await supabase
          .from('invoices')
          .select('invoice_data')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data && data.invoice_data) {
          const invoiceData = data.invoice_data;
          // Ensure we have the ID injected
          setInvoice({ ...invoiceData, id });
          document.title = `Invoice ${invoiceData.number} - ${invoiceData.senderName}`;
        } else {
          setError('Invoice not found');
        }
      } catch (err: any) {
        console.error('Error fetching invoice:', err);
        setError('Could not load invoice. It may have been deleted or does not exist.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  const handlePrint = () => {
      window.print();
  };

  const handleDownload = () => {
      if (invoice?.pdfUrl) {
          window.open(invoice.pdfUrl, '_blank');
      } else {
          // Fallback to print if no PDF generated yet
          window.print();
      }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <Loader2 className="animate-spin text-neutral-400" size={32} />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900 p-4">
        <div className="bg-white dark:bg-neutral-800 p-8 rounded-xl shadow-sm text-center max-w-md border border-neutral-200 dark:border-neutral-700">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={24} />
            </div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Invoice Unavailable</h1>
            <p className="text-neutral-500 dark:text-neutral-400">{error || "The invoice you are looking for doesn't seem to exist."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 py-8 px-4 print:p-0 print:bg-white">
      {/* Header Actions */}
      <div className="max-w-[794px] mx-auto mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
         <div className="flex items-center gap-3">
            <span className="font-bold text-neutral-900 dark:text-white text-lg">Invoice #{invoice.number}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
            }`}>
                {invoice.status || 'PENDING'}
            </span>
         </div>
         <div className="flex gap-2">
            <button 
                onClick={handlePrint}
                className="bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
            >
                <Printer size={16} /> Print
            </button>
            <button 
                onClick={handleDownload}
                className="bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-sm"
            >
                <Download size={16} /> Download PDF
            </button>
         </div>
      </div>

      <div className="invoice-preview-container shadow-2xl mx-auto print:shadow-none bg-white">
        <InvoicePreview invoice={invoice} />
      </div>

      <div className="max-w-[794px] mx-auto mt-8 text-center text-xs text-neutral-400 dark:text-neutral-500 print:hidden pb-8">
          Securely generated by Invoycer
      </div>
    </div>
  );
};
