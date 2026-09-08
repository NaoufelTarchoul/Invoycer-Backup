
import React, { useState, useMemo } from 'react';
import { 
  FileText, Trash2, Search, Download, Filter, ChevronRight, 
  ArrowUpDown, ArrowUp, ArrowDown, Plus, CheckCircle2, AlertCircle, Clock, X, Repeat
} from 'lucide-react';
import { Invoice } from '../types';

interface InvoicesListProps {
  invoices: Invoice[];
  onCreateNew: () => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
}

export const InvoicesList: React.FC<InvoicesListProps> = ({ invoices, onCreateNew, onEdit, onDelete }) => {
  const currencySymbol = invoices.length > 0 ? invoices[0].currencySymbol : '$';
  
  // --- Filtering & Sorting ---
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PAID' | 'PENDING' | 'OVERDUE' | 'SCHEDULED' | 'RECURRING'>('ALL');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
  const [searchQuery, setSearchQuery] = useState('');

  const getInvoiceStatus = (inv: Invoice) => {
    if (inv.emailStatus === 'scheduled') return 'Scheduled';
    if (inv.status === 'paid') return 'Paid';
    
    // Auto calc overdue
    const due = new Date(inv.dueDate);
    const now = new Date();
    due.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    
    if (now > due) return 'Overdue';
    return inv.status === 'pending' ? 'Pending' : (inv.status ? inv.status.charAt(0).toUpperCase() + inv.status.slice(1) : 'Pending');
  };

  const getOrdinalSuffix = (i: number) => {
    const j = i % 10,
        k = i % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      // 1. Search
      const lowerQuery = searchQuery.toLowerCase();
      const total = inv.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const totalString = total.toFixed(2);
      
      const matchesSearch = 
        (inv.number && inv.number.toLowerCase().includes(lowerQuery)) || 
        (inv.recipientName && inv.recipientName.toLowerCase().includes(lowerQuery)) ||
        (inv.recipientEmail && inv.recipientEmail.toLowerCase().includes(lowerQuery)) ||
        (totalString.includes(lowerQuery)) ||
        (inv.items.some(item => item.description.toLowerCase().includes(lowerQuery)));
      
      if (!matchesSearch) return false;

      // 2. Status Filter
      const status = getInvoiceStatus(inv);
      if (filterStatus === 'ALL') return true;
      if (filterStatus === 'SCHEDULED' && status === 'Scheduled') return true;
      if (filterStatus === 'PAID' && status === 'Paid') return true;
      if (filterStatus === 'OVERDUE' && status === 'Overdue') return true;
      if (filterStatus === 'PENDING' && status === 'Pending') return true;
      if (filterStatus === 'RECURRING' && inv.isRecurring) return true;
      
      return false;
    });
  }, [invoices, searchQuery, filterStatus]);

  const sortedInvoices = useMemo(() => {
    const data = [...filteredInvoices];
    data.sort((a, b) => {
      // Handle numeric amount sort
      if (sortConfig.key === 'amount') {
        const amountA = a.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        const amountB = b.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        return sortConfig.direction === 'asc' ? amountA - amountB : amountB - amountA;
      }

      // Handle String Sort
      // @ts-ignore
      const valA = (a[sortConfig.key] || '').toString().toLowerCase();
      // @ts-ignore
      const valB = (b[sortConfig.key] || '').toString().toLowerCase();

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [filteredInvoices, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown size={14} className="text-neutral-300 ml-1" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={14} className="text-neutral-900 dark:text-white ml-1" /> 
      : <ArrowDown size={14} className="text-neutral-900 dark:text-white ml-1" />;
  };

  const getClientColor = (name: string) => {
    const colors = ['bg-red-100 text-red-700', 'bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-purple-100 text-purple-700', 'bg-pink-100 text-pink-700'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Invoices</h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">Manage and track all your invoices.</p>
         </div>
         <button 
            onClick={onCreateNew}
            className="bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            <Plus size={16} /> New Invoice
         </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-neutral-800 p-2 rounded-xl border border-neutral-100 dark:border-neutral-700">
         
         {/* Filter Tabs */}
         <div className="flex p-1 bg-neutral-100 dark:bg-neutral-900/50 rounded-lg overflow-x-auto max-w-full">
            {['ALL', 'PAID', 'PENDING', 'OVERDUE', 'SCHEDULED', 'RECURRING'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap ${
                  filterStatus === status 
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm' 
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
         </div>

         <div className="relative w-full md:w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-900 dark:group-focus-within:text-white transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search client, number, amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white rounded-lg text-sm outline-none transition-all text-neutral-900 dark:text-white placeholder-neutral-400"
            />
            {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-1 rounded-full transition-colors"
                >
                    <X size={14} />
                </button>
            )}
         </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 overflow-hidden shadow-sm">
         {sortedInvoices.length === 0 ? (
            <div className="text-center py-24 px-6">
                <div className="w-16 h-16 bg-neutral-50 dark:bg-neutral-700/50 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-300 dark:text-neutral-600">
                  <FileText size={32} />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">No invoices found</h3>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-xs mx-auto mb-8">
                  {searchQuery || filterStatus !== 'ALL' 
                    ? "Try adjusting your filters or search terms."
                    : "Create your first invoice to start tracking your revenue."}
                </p>
                {(searchQuery || filterStatus !== 'ALL') && (
                  <button onClick={() => { setSearchQuery(''); setFilterStatus('ALL'); }} className="text-sm font-bold text-neutral-900 dark:text-white underline">
                    Clear Filters
                  </button>
                )}
            </div>
         ) : (
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                     <tr className="border-b border-neutral-100 dark:border-neutral-700 text-xs font-bold text-neutral-400 uppercase tracking-wider bg-neutral-50/50 dark:bg-neutral-800/50">
                        <th className="px-4 sm:px-6 py-4 cursor-pointer hover:text-neutral-600 dark:hover:text-neutral-300" onClick={() => requestSort('number')}>
                           <div className="flex items-center gap-1">Number {getSortIcon('number')}</div>
                        </th>
                        <th className="px-4 sm:px-6 py-4 cursor-pointer hover:text-neutral-600 dark:hover:text-neutral-300" onClick={() => requestSort('recipientName')}>
                           <div className="flex items-center gap-1">Client {getSortIcon('recipientName')}</div>
                        </th>
                        <th className="px-4 sm:px-6 py-4 cursor-pointer hover:text-neutral-600 dark:hover:text-neutral-300" onClick={() => requestSort('date')}>
                           <div className="flex items-center gap-1">Date {getSortIcon('date')}</div>
                        </th>
                        <th className="px-4 sm:px-6 py-4 cursor-pointer hover:text-neutral-600 dark:hover:text-neutral-300" onClick={() => requestSort('amount')}>
                           <div className="flex items-center gap-1">Amount {getSortIcon('amount')}</div>
                        </th>
                        <th className="px-4 sm:px-6 py-4 cursor-pointer hover:text-neutral-600 dark:hover:text-neutral-300" onClick={() => requestSort('status')}>
                           <div className="flex items-center gap-1">Status {getSortIcon('status')}</div>
                        </th>
                        <th className="px-4 sm:px-6 py-4 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50 dark:divide-neutral-700/50">
                     {sortedInvoices.map(inv => {
                        const status = getInvoiceStatus(inv);
                        const total = inv.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
                        
                        return (
                           <tr 
                              key={inv.id} 
                              onClick={() => onEdit(inv)}
                              className="group hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors cursor-pointer"
                           >
                              <td className="px-4 sm:px-6 py-4">
                                 <div className="flex items-center gap-2">
                                    <span className="font-bold text-neutral-900 dark:text-white text-sm">{inv.number}</span>
                                    {inv.isRecurring && (
                                        <div className="group/tooltip relative flex items-center justify-center">
                                            <div className="p-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                                <Repeat size={12} />
                                            </div>
                                            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-neutral-900 dark:bg-white text-white dark:text-black text-[10px] font-bold rounded shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                                {inv.scheduledDate 
                                                    ? `Sends monthly on the ${new Date(inv.scheduledDate).getDate()}${getOrdinalSuffix(new Date(inv.scheduledDate).getDate())}`
                                                    : 'Recurring Invoice'}
                                            </div>
                                        </div>
                                    )}
                                 </div>
                              </td>
                              <td className="px-4 sm:px-6 py-4">
                                 <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getClientColor(inv.recipientName)}`}>
                                       {inv.recipientName.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{inv.recipientName}</span>
                                 </div>
                              </td>
                              <td className="px-4 sm:px-6 py-4">
                                 <div className="flex flex-col">
                                    <span className="text-sm text-neutral-600 dark:text-neutral-300">{new Date(inv.date).toLocaleDateString()}</span>
                                    {status === 'Overdue' && (
                                       <span className="text-[10px] text-red-500 font-medium">Due {new Date(inv.dueDate).toLocaleDateString()}</span>
                                    )}
                                 </div>
                              </td>
                              <td className="px-4 sm:px-6 py-4">
                                 <span className="font-bold text-neutral-900 dark:text-white">{currencySymbol}{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                              </td>
                              <td className="px-4 sm:px-6 py-4">
                                 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                    status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' :
                                    status === 'Overdue' ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' :
                                    status === 'Scheduled' ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' :
                                    'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700'
                                 }`}>
                                    {status === 'Paid' && <CheckCircle2 size={12} />}
                                    {status === 'Overdue' && <AlertCircle size={12} />}
                                    {status === 'Scheduled' && <Clock size={12} />}
                                    {status}
                                 </span>
                              </td>
                              <td className="px-4 sm:px-6 py-4 text-right">
                                 <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {inv.pdfUrl && (
                                       <a 
                                          href={inv.pdfUrl} 
                                          target="_blank" 
                                          rel="noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-md hover:bg-white dark:hover:bg-neutral-700 transition-colors"
                                          title="Download PDF"
                                       >
                                          <Download size={16} />
                                       </a>
                                    )}
                                    <button 
                                       onClick={(e) => { e.stopPropagation(); onDelete(inv.id); }}
                                       className="p-2 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-white dark:hover:bg-neutral-700 transition-colors"
                                       title="Delete"
                                    >
                                       <Trash2 size={16} />
                                    </button>
                                    <button 
                                       className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-md hover:bg-white dark:hover:bg-neutral-700 transition-colors"
                                    >
                                       <ChevronRight size={16} />
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
         )}
      </div>
    </div>
  );
};
