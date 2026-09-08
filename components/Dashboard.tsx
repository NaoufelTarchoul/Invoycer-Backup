
import React, { useMemo } from 'react';
import { 
  FileText, TrendingUp, DollarSign, Users, Wallet, ArrowRight, Trash2, Download, Zap, Repeat
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Invoice, Client, UserProfile } from '../types';

interface DashboardProps {
  invoices: Invoice[];
  clients: Client[];
  userProfile: UserProfile | null;
  onCreateNew: () => void;
  onEdit: (invoice: Invoice) => void;
  onViewAll: () => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ invoices, clients, userProfile, onCreateNew, onEdit, onViewAll, onDelete, isLoading = false }) => {
  
  const currencySymbol = invoices.length > 0 ? invoices[0].currencySymbol : '$';

  // --- Statistics Calculation ---
  const stats = useMemo(() => {
    const totalRevenue = invoices.reduce((acc, inv) => {
      return acc + inv.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    }, 0);

    const now = new Date();
    const thisMonthRevenue = invoices.reduce((acc, inv) => {
      const d = new Date(inv.date);
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
         return acc + inv.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      }
      return acc;
    }, 0);

    const outstanding = invoices.reduce((acc, inv) => {
       const isPaid = inv.status === 'paid';
       if (!isPaid) {
          return acc + inv.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
       }
       return acc;
    }, 0);

    return { totalRevenue, thisMonthRevenue, outstanding };
  }, [invoices]);

  // --- Chart Data Calculation (Last 6 Months) ---
  const chartData = useMemo(() => {
    const months: any[] = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        name: d.toLocaleString('default', { month: 'short' }),
        key: `${d.getFullYear()}-${d.getMonth()}`,
        value: 0
      });
    }

    invoices.forEach(inv => {
      const d = new Date(inv.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const amount = inv.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const month = months.find(m => m.key === key);
      if (month) month.value += amount;
    });

    return months;
  }, [invoices]);

  // Take top 5 recent invoices
  const recentInvoices = invoices.slice(0, 5);

  const getClientColor = (name: string) => {
    const colors = ['bg-red-100 text-red-700', 'bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-purple-100 text-purple-700', 'bg-pink-100 text-pink-700'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const DashboardSkeleton = () => (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="md:col-span-2 h-72 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          <div className="space-y-4 sm:space-y-6">
             <div className="h-32 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
             <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div className="h-32 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                <div className="h-32 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
             </div>
          </div>
       </div>
       <div className="space-y-4">
          <div className="h-8 w-48 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
          <div className="h-64 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
       </div>
    </div>
  );

  if (isLoading) {
      return <DashboardSkeleton />;
  }

  const isFreePlan = userProfile?.subscription_plan === 'free' || !userProfile?.subscription_plan;
  const usagePercentage = Math.min((invoices.length / 3) * 100, 100);

  return (
    <div className="animate-in fade-in duration-500 space-y-6 sm:space-y-8">
      
      {/* Top Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Revenue Card (with Split Layer Alignment) */}
        <div className="md:col-span-2 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-2xl p-5 sm:p-6 shadow-none border border-neutral-800 dark:border-neutral-200 relative overflow-hidden flex flex-col justify-between h-72">
           
           <div className="relative z-20 flex justify-between items-start">
              <div>
                <p className="text-neutral-400 dark:text-neutral-500 text-xs font-bold uppercase tracking-wider mb-1">Total Revenue</p>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{currencySymbol}{stats.totalRevenue.toLocaleString()}</h2>
              </div>
              <div className="p-2 bg-white/10 dark:bg-black/5 rounded-lg backdrop-blur-md">
                <DollarSign size={24} className="text-white dark:text-black" />
              </div>
           </div>
           
           <div className="h-48 w-full mt-6 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-neutral-200 dark:text-neutral-800" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: 'currentColor' }} 
                    className="text-neutral-400 dark:text-neutral-500 font-medium"
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: 'currentColor' }}
                    className="text-neutral-400 dark:text-neutral-500 font-medium"
                    tickFormatter={(value) => `${currencySymbol}${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
                  />
                  <Tooltip 
                    cursor={{ stroke: 'currentColor', strokeWidth: 1, strokeDasharray: '3 3', className: 'text-neutral-300 dark:text-neutral-700' }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-3 rounded-lg shadow-xl animate-in zoom-in-95 duration-200">
                            <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 mb-1 uppercase tracking-wider">{label}</p>
                            <p className="text-lg font-bold text-neutral-900 dark:text-white">
                              {currencySymbol}{Number(payload[0].value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#34d399" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#chartGradient)" 
                    animationDuration={1500}
                    activeDot={{ r: 6, fill: "#34d399", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Secondary Stats Column */}
        <div className="space-y-4 sm:space-y-6">
           
           {/* Usage Meter for Free Plan */}
           {isFreePlan && (
                <div className="bg-neutral-50 dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                            <Zap size={12} className="text-amber-500 fill-amber-500" />
                            Free Plan Usage
                        </span>
                        <span className="text-xs font-bold text-neutral-900 dark:text-white">{invoices.length}/3</span>
                    </div>
                    <div className="h-2 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-500 ${usagePercentage >= 100 ? 'bg-red-500' : 'bg-neutral-900 dark:bg-white'}`}
                            style={{ width: `${usagePercentage}%` }}
                        ></div>
                    </div>
                    {usagePercentage >= 100 && (
                        <p className="text-[10px] text-red-500 mt-2 font-medium">Limit reached. Upgrade to create more.</p>
                    )}
                </div>
           )}

           <div className="bg-white dark:bg-neutral-800 p-5 sm:p-6 rounded-2xl border border-neutral-100 dark:border-neutral-700 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-400">
                    <Wallet size={20} />
                 </div>
                 <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Outstanding</span>
              </div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{currencySymbol}{stats.outstanding.toLocaleString()}</p>
              <p className="text-xs text-neutral-500 mt-2">Unpaid invoices needing attention</p>
           </div>

           <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white dark:bg-neutral-800 p-5 rounded-2xl border border-neutral-100 dark:border-neutral-700">
                 <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">This Month</p>
                 <p className="text-xl font-bold text-neutral-900 dark:text-white">{currencySymbol}{stats.thisMonthRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-white dark:bg-neutral-800 p-5 rounded-2xl border border-neutral-100 dark:border-neutral-700">
                 <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Clients</p>
                 <p className="text-xl font-bold text-neutral-900 dark:text-white">{clients.length}</p>
              </div>
           </div>
        </div>
      </div>

      {/* Recent Invoices List */}
      <div className="space-y-4">
         <div className="flex justify-between items-center px-1">
             <h3 className="font-bold text-lg text-neutral-900 dark:text-white">Recent Invoices</h3>
             <button 
                onClick={onViewAll}
                className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white flex items-center gap-1 transition-colors"
             >
                View All <ArrowRight size={14} />
             </button>
         </div>

         <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 overflow-hidden shadow-sm">
            {recentInvoices.length === 0 ? (
                <div className="text-center py-16 px-6">
                    <div className="w-12 h-12 bg-neutral-50 dark:bg-neutral-700/50 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-300 dark:text-neutral-600">
                      <FileText size={24} />
                    </div>
                    <p className="text-neutral-900 dark:text-white font-medium">No invoices yet</p>
                    <button onClick={onCreateNew} className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white text-sm mt-2 font-medium">Create your first one</button>
                </div>
            ) : (
                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                         <tr className="border-b border-neutral-100 dark:border-neutral-700 text-xs font-bold text-neutral-400 uppercase tracking-wider bg-neutral-50/50 dark:bg-neutral-800/50">
                            <th className="px-6 py-4">Number</th>
                            <th className="px-6 py-4">Client</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4 text-right">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-50 dark:divide-neutral-700/50">
                         {recentInvoices.map(inv => {
                            const total = inv.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
                            
                            return (
                               <tr 
                                  key={inv.id} 
                                  onClick={() => onEdit(inv)}
                                  className="group hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors cursor-pointer"
                               >
                                  <td className="px-6 py-4">
                                     <div className="flex items-center gap-2">
                                        <span className="font-bold text-neutral-900 dark:text-white text-sm">{inv.number}</span>
                                        {inv.isRecurring && (
                                            <div className="p-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" title="Recurring Invoice">
                                                <Repeat size={12} />
                                            </div>
                                        )}
                                     </div>
                                  </td>
                                  <td className="px-6 py-4">
                                     <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${getClientColor(inv.recipientName)}`}>
                                           {inv.recipientName.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{inv.recipientName}</span>
                                     </div>
                                  </td>
                                  <td className="px-6 py-4">
                                     <span className="text-sm text-neutral-600 dark:text-neutral-300">{new Date(inv.date).toLocaleDateString()}</span>
                                  </td>
                                  <td className="px-6 py-4">
                                     <span className="font-bold text-neutral-900 dark:text-white">{currencySymbol}{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                     <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                                        inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                        inv.status === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                        'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                                     }`}>
                                        {inv.status || 'Pending'}
                                     </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        {inv.pdfUrl && (
                                        <a 
                                            href={inv.pdfUrl} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-md hover:bg-white dark:hover:bg-neutral-700 transition-colors"
                                            title="Download PDF"
                                        >
                                            <Download size={16} />
                                        </a>
                                        )}
                                        <button 
                                        onClick={(e) => { e.stopPropagation(); onDelete(inv.id); }}
                                        className="p-1.5 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-white dark:hover:bg-neutral-700 transition-colors"
                                        title="Delete"
                                        >
                                        <Trash2 size={16} />
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
    </div>
  );
};
