
import React from 'react';
import { Invoice } from '../types';
import { THEMES } from '../constants';

interface InvoicePreviewProps {
  invoice: Invoice;
  showBranding?: boolean;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, showBranding }) => {
  const calculateTotal = () => {
    return invoice.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  };

  const subtotal = calculateTotal();
  const taxRate = invoice.taxRate || 0;
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Theme Logic: Support both Preset IDs and Custom Hex Codes
  const isCustomColor = invoice.colorTheme.startsWith('#');
  const presetTheme = THEMES.find(t => t.id === invoice.colorTheme) || THEMES[0];
  
  const themeColor = isCustomColor ? invoice.colorTheme : presetTheme.color;
  const textColorClass = isCustomColor ? '' : presetTheme.tailwindText;
  const textStyle = isCustomColor ? { color: themeColor } : {};

  return (
    <div className={`bg-white shadow-xl min-h-[1123px] w-full max-w-[794px] mx-auto relative flex flex-col ${invoice.fontStyle || 'font-inter'}`}>
      
      {/* Top Accent Line */}
      <div className="h-2 w-full" style={{ backgroundColor: themeColor }}></div>

      <div className="p-12 flex-grow flex flex-col">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-16">
          <div className="w-1/2 pr-8">
            {invoice.logo ? (
              <img src={invoice.logo} alt="Company Logo" className="max-h-24 max-w-[150px] object-contain mb-4" />
            ) : (
              <div className="mb-4">
                 <h1 className="text-2xl font-bold text-neutral-900 tracking-tight uppercase">{invoice.senderName}</h1>
              </div>
            )}
            
            {/* Sender Details - Modern stacking */}
            <div className="text-sm text-neutral-500 leading-relaxed">
              <p className="font-medium text-neutral-900">{invoice.senderName}</p>
              <div className="whitespace-pre-line">{invoice.senderAddress}</div>
              <p className="mt-2">{invoice.senderEmail}</p>
              <p>{invoice.senderPhone}</p>
            </div>
          </div>

          <div className="w-1/2 text-right">
            <h2 className="text-sm font-bold text-neutral-400 tracking-[0.2em] uppercase mb-2">Invoice No.</h2>
            <p className={`text-4xl font-light tracking-tight text-neutral-900 mb-6`}>{invoice.number}</p>
            
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-neutral-400 font-medium uppercase text-xs tracking-wider">Issued Date</span>
                <span className="text-neutral-900 font-semibold min-w-[100px]">{formatDate(invoice.date)}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-neutral-400 font-medium uppercase text-xs tracking-wider">Due Date</span>
                <span className="text-neutral-900 font-semibold min-w-[100px]">{formatDate(invoice.dueDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bill To / Meta Grid */}
        <div className="grid grid-cols-12 gap-8 mb-16 border-t border-b border-neutral-100 py-8">
          <div className="col-span-6">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">Billed To</h3>
            <div className="text-neutral-900">
              <p className="font-bold text-lg mb-1">{invoice.recipientName}</p>
              <p className="text-neutral-500 text-sm whitespace-pre-line leading-relaxed mb-2">
                {invoice.recipientAddress}
              </p>
              {invoice.recipientEmail && (
                <p className="text-sm text-neutral-500 mb-0.5">
                  <span className="font-medium text-neutral-400">Email:</span> {invoice.recipientEmail}
                </p>
              )}
              {invoice.recipientVat && (
                <p className="text-sm text-neutral-500 mb-0.5">
                  <span className="font-medium text-neutral-400">VAT:</span> {invoice.recipientVat}
                </p>
              )}
              {invoice.recipientPhone && (
                <p className="text-sm text-neutral-500">
                  <span className="font-medium text-neutral-400">Tel:</span> {invoice.recipientPhone}
                </p>
              )}
            </div>
          </div>
          
          <div className="col-span-6">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">Payment Details</h3>
            <div className="text-sm">
              <div className="grid grid-cols-[80px_1fr] gap-y-2">
                <span className="text-neutral-400">Method</span>
                <span className="text-neutral-900 font-medium">
                  {invoice.paymentMethod === 'paypal' ? 'PayPal' : 
                   invoice.paymentMethod === 'crypto' ? 'Crypto Transfer' : 
                   'Bank Transfer'}
                </span>
                
                {(!invoice.paymentMethod || invoice.paymentMethod === 'bank') && (
                  <>
                    <span className="text-neutral-400">IBAN</span>
                    <span className="text-neutral-900 font-mono tracking-wide">{invoice.paymentIban}</span>
                    <span className="text-neutral-400">BIC</span>
                    <span className="text-neutral-900 font-mono">{invoice.paymentBic}</span>
                  </>
                )}

                {invoice.paymentMethod === 'paypal' && (
                   <>
                    <span className="text-neutral-400">Pay To</span>
                    <span className="text-neutral-900 font-medium break-all">{invoice.paymentPaypalEmail}</span>
                   </>
                )}

                {invoice.paymentMethod === 'crypto' && (
                   <>
                    <span className="text-neutral-400">Network</span>
                    <span className="text-neutral-900 font-medium">{invoice.paymentNetwork}</span>
                    <span className="text-neutral-400">Address</span>
                    <span className="text-neutral-900 font-mono text-xs break-all">{invoice.paymentWalletAddress}</span>
                   </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Table items */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider font-semibold text-neutral-400 border-b border-neutral-100">
                <th className="pb-4 pl-2 font-medium">Description</th>
                <th className="pb-4 text-center w-24 font-medium">Qty</th>
                <th className="pb-4 text-right w-32 font-medium">Price</th>
                <th className="pb-4 text-right w-32 font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {invoice.items.map((item, index) => (
                <tr key={item.id} className="border-b border-neutral-50 last:border-0 group">
                  <td className="py-5 pl-2">
                    <p className="font-semibold text-neutral-900">{item.description}</p>
                  </td>
                  <td className="py-5 text-center text-neutral-500">{item.quantity}</td>
                  <td className="py-5 text-right text-neutral-500">
                    {invoice.currencySymbol}{item.unitPrice.toFixed(2)}
                  </td>
                  <td className="py-5 text-right font-medium text-neutral-900">
                    {invoice.currencySymbol}{(item.quantity * item.unitPrice).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-16">
          <div className="w-64">
             <div className="flex justify-between py-3 border-b border-neutral-50">
                <span className="text-neutral-500 text-sm">Subtotal</span>
                <span className="text-neutral-900 font-medium">{invoice.currencySymbol}{subtotal.toFixed(2)}</span>
             </div>
             
             {taxRate > 0 && (
                <div className="flex justify-between py-3 border-b border-neutral-50">
                    <span className="text-neutral-500 text-sm">{invoice.taxLabel || 'Tax'} ({taxRate}%)</span>
                    <span className="text-neutral-900 font-medium">{invoice.currencySymbol}{taxAmount.toFixed(2)}</span>
                </div>
             )}

             <div className="flex justify-between py-4 items-center">
                <span className="text-neutral-900 font-bold text-lg">Total</span>
                <span className={`text-3xl font-bold ${textColorClass}`} style={textStyle}>
                   {invoice.currencySymbol}{total.toFixed(2)}
                </span>
             </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="mt-auto">
          {invoice.notes && (
             <div className="mb-8 p-6 bg-neutral-50 rounded-lg border border-neutral-100">
               <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Terms & Notes</h4>
               <p className="text-sm text-neutral-600 leading-relaxed">{invoice.notes}</p>
             </div>
          )}
          
          <div className="text-center pt-8 border-t border-neutral-100">
            <p className={`font-medium text-lg ${textColorClass}`} style={textStyle}>{invoice.footerMessage}</p>
            <p className="text-xs text-neutral-400 mt-2 uppercase tracking-widest">{invoice.title}</p>
          </div>
        </div>

        {/* Branding for Free Tier */}
        {showBranding && (
            <div className="text-center pb-4 mt-8">
                <p className="text-[10px] text-neutral-300 font-medium">
                    Powered by <span className="font-bold text-neutral-400">Invoycer</span>
                </p>
            </div>
        )}
      </div>
      
      {/* Bottom Accent Line */}
      <div className="h-2 w-full" style={{ backgroundColor: themeColor, opacity: 0.1 }}></div>
    </div>
  );
};
