import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Mail, MapPin, Phone, User, X, Save, Loader2, Tag, Filter, FileText, DollarSign, Clock, StickyNote, ArrowRight, ChevronRight, Building, Briefcase, MoreVertical } from 'lucide-react';
import { Client, Invoice, UserProfile } from '../types';
import { supabase } from '../services/supabaseClient';
import { AddressAutocomplete } from './AddressAutocomplete';
import { useNotification } from '../contexts/NotificationContext';

interface ClientsProps {
  clients: Client[];
  invoices?: Invoice[];
  onRefresh: () => void;
  userProfile: UserProfile | null;
  onTriggerUpgrade?: (reason: string) => void;
}

export const Clients: React.FC<ClientsProps> = ({ clients, invoices = [], onRefresh, userProfile, onTriggerUpgrade }) => {
  const { notify } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Drawer / View State
  const [viewingClient, setViewingClient] = useState<Client | null>(null);

  // Filter State
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<string>('');

  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [notesBuffer, setNotesBuffer] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    email: '',
    address: '',
    phone: '',
    vat: '',
    source: '',
    services: '',
    default_currency: 'USD',
    default_price: undefined,
    default_invoice_description: ''
  });

  useEffect(() => {
    if (viewingClient) {
        setNotesBuffer(viewingClient.notes || '');
    }
  }, [viewingClient]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Extract unique options for filters
  const allServices = useMemo(() => {
    const services = new Set<string>();
    clients.forEach(c => {
      if (c.services) {
        c.services.split(',').forEach(s => services.add(s.trim()));
      }
    });
    return Array.from(services).sort();
  }, [clients]);

  const allSources = useMemo(() => {
    return Array.from(new Set(clients.map(c => c.source).filter(Boolean) as string[])).sort();
  }, [clients]);

  // Calculate Client Stats
  const clientStats = useMemo(() => {
      if (!viewingClient) return null;
      
      const clientInvoices = invoices.filter(inv => {
          // Robust matching: Email preferred, fallback to Name
          if (viewingClient.email && inv.recipientEmail) {
              return inv.recipientEmail.toLowerCase() === viewingClient.email.toLowerCase();
          }
          return inv.recipientName.toLowerCase() === viewingClient.name.toLowerCase();
      });
      
      const totalRevenue = clientInvoices.reduce((acc, inv) => {
          const invTotal = inv.items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);
          return acc + invTotal;
      }, 0);

      const outstanding = clientInvoices
        .filter(i => i.status !== 'paid')
        .reduce((acc, inv) => {
             const invTotal = inv.items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);
             return acc + invTotal;
        }, 0);
      
      // Sort by date desc
      clientInvoices.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return {
          totalRevenue,
          outstanding,
          invoiceCount: clientInvoices.length,
          history: clientInvoices,
          currency: clientInvoices.length > 0 ? clientInvoices[0].currencySymbol : '$'
      };
  }, [viewingClient, invoices]);


  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.services && c.services.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesService = selectedService 
        ? c.services?.split(',').some(s => s.trim() === selectedService)
        : true;

    const matchesSource = selectedSource 
        ? c.source === selectedSource 
        : true;

    return matchesSearch && matchesService && matchesSource;
  });

  const getClientColor = (name: string) => {
    const colors = [
      'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
      'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
      'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
      'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
      'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400',
      'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400',
      'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
      'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
      'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400',
      'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
      'bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-900/20 dark:text-fuchsia-400',
      'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400',
      'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getTagColor = (text: string) => {
    const colors = [
      'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
      'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
      'bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800',
      'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
      'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800',
      'bg-cyan-50 text-cyan-700 border-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800',
      'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 dark:border-fuchsia-800',
      'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
    ];
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const handleOpenModal = (client?: Client) => {
    // Check Limits for Creating New Client
    if (!client) { // Creating new
        const isPaidPlan = userProfile?.subscription_plan && userProfile.subscription_plan !== 'free';
        if (!isPaidPlan && clients.length >= 1) {
            if (onTriggerUpgrade) {
                onTriggerUpgrade('Unlimited Clients');
            } else {
                notify('error', 'Limit reached. Upgrade to Pro.');
            }
            return;
        }
    }

    if (client) {
      setEditingClient(client);
      setFormData(client);
    } else {
      setEditingClient(null);
      setFormData({ name: '', email: '', address: '', phone: '', vat: '', source: '', services: '', default_currency: 'USD', default_price: undefined, default_invoice_description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const payload = {
        ...formData,
        user_id: user.id,
      };

      if (editingClient) {
        const { error } = await supabase
          .from('clients')
          .update(payload)
          .eq('id', editingClient.id);
        if (error) throw error;
        
        // Update viewing client if we are editing the one currently open in drawer
        if (viewingClient && viewingClient.id === editingClient.id) {
            setViewingClient({ ...viewingClient, ...payload } as Client);
        }

      } else {
        const { error } = await supabase
          .from('clients')
          .insert([payload]);
        if (error) throw error;
      }

      onRefresh();
      setIsModalOpen(false);
      notify('success', 'Client saved successfully');
    } catch (error: any) {
      console.error('Error saving client:', error);
      const msg = error.message || 'Unknown error occurred';
      notify('error', `Failed to save: ${msg}`);
      
      if (msg.includes('column') && msg.includes('does not exist')) {
          alert('Database Error: It looks like the "services" or "source" column is missing from your database.\n\nPlease run the SQL migration script.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
      if (!viewingClient) return;
      setSavingNotes(true);
      try {
          const { error } = await supabase
            .from('clients')
            .update({ notes: notesBuffer })
            .eq('id', viewingClient.id);
            
          if (error) throw error;
          
          // Update local state
          setViewingClient(prev => prev ? ({ ...prev, notes: notesBuffer }) : null);
          onRefresh(); // Refresh parent list
          notify('success', 'Notes updated');
      } catch (error: any) {
          console.error("Error saving notes:", error);
          notify('error', 'Failed to save notes');
      } finally {
          setSavingNotes(false);
      }
  };

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client);
  };

  const executeDelete = async () => {
    if (!clientToDelete) return;
    setLoading(true);

    try {
      const { error } = await supabase.from('clients').delete().eq('id', clientToDelete.id);
      if (error) throw error;
      notify('success', 'Client deleted successfully');
      setViewingClient(null); // Close drawer if open
      onRefresh();
    } catch (error: any) {
      console.error('Error deleting client:', error);
      notify('error', `Failed to delete client: ${error.message}`);
    } finally {
      setLoading(false);
      setClientToDelete(null);
    }
  };

  // Shared input style
  const inputClass = "w-full p-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-white text-sm focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white outline-none transition-all placeholder-neutral-400";
  const labelClass = "block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase mb-1.5";

  return (
    <div className="animate-in fade-in duration-500 relative">
      
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Clients</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Manage your client relationships and services.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          {/* Search */}
          <div className="relative flex-grow sm:flex-grow-0">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
             <input 
               type="text" 
               placeholder="Search..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm w-full sm:w-56 outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-all text-neutral-900 dark:text-white placeholder-neutral-400"
             />
          </div>

          {/* Service Filter */}
          <div className="relative flex-grow sm:flex-grow-0">
             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                <Filter size={14} />
             </div>
             <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="pl-9 pr-8 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm w-full sm:w-40 outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-all text-neutral-900 dark:text-white appearance-none cursor-pointer"
             >
                <option value="">All Services</option>
                {allServices.map(service => (
                    <option key={service} value={service}>{service}</option>
                ))}
             </select>
          </div>

          {/* Source Filter */}
          <div className="relative flex-grow sm:flex-grow-0">
             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                <Tag size={14} />
             </div>
             <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="pl-9 pr-8 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm w-full sm:w-40 outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-all text-neutral-900 dark:text-white appearance-none cursor-pointer"
             >
                <option value="">All Sources</option>
                {allSources.map(source => (
                    <option key={source} value={source}>{source}</option>
                ))}
             </select>
          </div>

          <button 
            onClick={() => handleOpenModal()}
            className="bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 px-4 py-2.5 rounded-md font-medium flex items-center justify-center gap-2 transition-all whitespace-nowrap text-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Client</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-neutral-800 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
           <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-700 text-neutral-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={24} />
          </div>
          <h3 className="text-base font-medium text-neutral-900 dark:text-white">No clients found</h3>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
            {searchQuery || selectedService || selectedSource ? 'Try adjusting your filters.' : 'Add your first client to speed up invoice creation.'}
          </p>
          {(searchQuery || selectedService || selectedSource) && (
              <button 
                onClick={() => {
                    setSearchQuery('');
                    setSelectedService('');
                    setSelectedSource('');
                }}
                className="mt-4 text-sm font-medium text-neutral-900 dark:text-white underline hover:no-underline"
              >
                Clear all filters
              </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredClients.map(client => (
            <div 
                key={client.id} 
                onClick={() => setViewingClient(client)}
                className="group bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 sm:p-6 hover:border-neutral-900 dark:hover:border-neutral-400 transition-all duration-200 relative flex flex-col h-full cursor-pointer shadow-sm"
            >
              
              {/* Kebab Menu */}
              <div className="absolute top-4 right-4 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
                 <button 
                    onClick={(e) => {
                       e.stopPropagation();
                       setOpenDropdownId(openDropdownId === client.id ? null : client.id);
                    }}
                    className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                 >
                    <MoreVertical size={18} />
                 </button>
                 
                 {openDropdownId === client.id && (
                    <div 
                        className="absolute right-0 mt-1 w-36 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-lg rounded-lg overflow-hidden py-1 z-20 animate-in fade-in zoom-in-95 duration-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(null);
                                handleOpenModal(client);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center gap-2 transition-colors"
                        >
                            <Edit2 size={14} /> Edit
                        </button>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(null);
                                handleDeleteClick(client);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                        >
                            <Trash2 size={14} /> Delete
                        </button>
                    </div>
                 )}
              </div>

              <div className="flex justify-between items-start mb-6">
                 <div className="flex items-center gap-4 min-w-0 pr-8">
                    <div className={`w-12 h-12 flex-shrink-0 rounded-lg flex items-center justify-center font-bold text-lg ${getClientColor(client.name)}`}>
                        {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-lg text-neutral-900 dark:text-white leading-tight truncate" title={client.name}>{client.name}</h3>
                        {client.vat && (
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-xs text-neutral-500 font-mono">{client.vat}</span>
                            </div>
                        )}
                    </div>
                 </div>
              </div>

              <div className="space-y-4 flex-grow">
                 {/* Email */}
                 <div className="flex items-center gap-3">
                    <Mail size={16} className="text-neutral-400 flex-shrink-0" />
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 truncate">{client.email || '—'}</p>
                 </div>

                 {/* Phone */}
                 <div className="flex items-center gap-3">
                    <Phone size={16} className="text-neutral-400 flex-shrink-0" />
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 truncate">{client.phone || '—'}</p>
                 </div>

                 {/* Address */}
                 <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-neutral-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2">{client.address || '—'}</p>
                 </div>

                 {/* Services Tags */}
                 {client.services && (
                    <div className="pt-2 mt-2 border-t border-dashed border-neutral-100 dark:border-neutral-800">
                        <p className="text-[10px] font-bold text-neutral-400 uppercase mb-2">Services</p>
                        <div className="flex flex-wrap gap-1.5">
                            {client.services.split(',').map((s, i) => {
                                const tag = s.trim();
                                const colorClass = getTagColor(tag);
                                return (
                                    <span key={i} className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${colorClass}`}>
                                        {tag}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                 )}
              </div>

              {/* Footer / Source */}
              {client.source && (
                 <div className="mt-6 flex justify-end">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-50 dark:bg-neutral-800 text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                        <Tag size={10} />
                        {client.source}
                    </span>
                 </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Client Detail Drawer (Side Panel) */}
      <div 
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${viewingClient ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setViewingClient(null)}
      >
        <div 
            className={`absolute top-0 right-0 h-full w-full max-w-md bg-white dark:bg-neutral-900 shadow-2xl border-l border-neutral-200 dark:border-neutral-800 transform transition-transform duration-300 ease-in-out flex flex-col ${viewingClient ? 'translate-x-0' : 'translate-x-full'}`}
            onClick={(e) => e.stopPropagation()}
        >
             {/* Drawer Header */}
             <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-start bg-neutral-50/50 dark:bg-neutral-900">
                <div className="flex items-center gap-4">
                    {viewingClient && (
                        <div className={`w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center font-bold text-xl ${getClientColor(viewingClient.name)}`}>
                            {viewingClient.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white leading-tight">
                            {viewingClient?.name}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <button 
                                onClick={() => handleOpenModal(viewingClient!)}
                                className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 underline decoration-neutral-300 dark:decoration-neutral-700 underline-offset-2"
                            >
                                <Edit2 size={12} /> Edit Details
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                     <button 
                        onClick={() => handleDeleteClick(viewingClient!)}
                        className="p-2 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                     >
                        <Trash2 size={20} />
                     </button>
                     <button 
                        onClick={() => setViewingClient(null)}
                        className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                     >
                        <X size={20} />
                     </button>
                </div>
             </div>

             {/* Drawer Content */}
             <div className="flex-1 overflow-y-auto p-6 space-y-8">
                 
                 {/* Stats Cards */}
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800">
                        <div className="flex items-center gap-2 mb-2">
                             <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-md">
                                <DollarSign size={14} />
                             </div>
                             <span className="text-xs font-bold text-neutral-500 uppercase">Revenue</span>
                        </div>
                        <p className="text-xl font-bold text-neutral-900 dark:text-white">
                            {clientStats?.currency}{clientStats?.totalRevenue.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800">
                         <div className="flex items-center gap-2 mb-2">
                             <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md">
                                <FileText size={14} />
                             </div>
                             <span className="text-xs font-bold text-neutral-500 uppercase">Invoices</span>
                        </div>
                        <p className="text-xl font-bold text-neutral-900 dark:text-white">
                            {clientStats?.invoiceCount}
                        </p>
                    </div>
                 </div>

                 {/* Notes Section */}
                 <div>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                        <StickyNote size={16} className="text-neutral-400" />
                        Client Notes
                    </h3>
                    <div className="relative">
                        <textarea 
                            className="w-full bg-yellow-50 dark:bg-neutral-800/50 border border-yellow-200 dark:border-neutral-700 rounded-lg p-3 text-sm text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 focus:ring-2 focus:ring-yellow-400/50 dark:focus:ring-neutral-600 outline-none resize-none transition-all"
                            rows={4}
                            placeholder="Add internal notes about this client..."
                            value={notesBuffer}
                            onChange={(e) => setNotesBuffer(e.target.value)}
                        />
                        {(notesBuffer !== viewingClient?.notes) && (
                            <button 
                                onClick={handleSaveNotes}
                                disabled={savingNotes}
                                className="absolute bottom-3 right-3 bg-neutral-900 dark:bg-white text-white dark:text-black text-xs font-bold px-3 py-1.5 rounded-md shadow-sm flex items-center gap-1 hover:scale-105 transition-transform"
                            >
                                {savingNotes ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                                Save
                            </button>
                        )}
                    </div>
                 </div>

                 {/* Contact Info */}
                 <div className="space-y-4">
                     <h3 className="text-sm font-bold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-2">Contact Details</h3>
                     <div className="space-y-3">
                         <div className="flex items-start gap-3">
                            <Mail size={16} className="text-neutral-400 mt-0.5" />
                            <span className="text-sm text-neutral-600 dark:text-neutral-300">{viewingClient?.email || 'N/A'}</span>
                         </div>
                         <div className="flex items-start gap-3">
                            <Phone size={16} className="text-neutral-400 mt-0.5" />
                            <span className="text-sm text-neutral-600 dark:text-neutral-300">{viewingClient?.phone || 'N/A'}</span>
                         </div>
                         <div className="flex items-start gap-3">
                            <MapPin size={16} className="text-neutral-400 mt-0.5" />
                            <span className="text-sm text-neutral-600 dark:text-neutral-300">{viewingClient?.address || 'N/A'}</span>
                         </div>
                     </div>
                 </div>

                 {/* Invoice History */}
                 <div>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-2 mb-4 flex justify-between items-center">
                        Invoice History
                        <span className="text-xs font-normal text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                            {clientStats?.invoiceCount}
                        </span>
                    </h3>
                    
                    {clientStats?.history.length === 0 ? (
                        <p className="text-sm text-neutral-500 italic">No invoices found for this client.</p>
                    ) : (
                        <div className="space-y-3">
                            {clientStats?.history.map(inv => (
                                <div key={inv.id} className="flex items-center justify-between p-3 bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-lg hover:border-neutral-300 dark:hover:border-neutral-500 transition-colors">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-neutral-900 dark:text-white">{inv.number}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                                inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                                                inv.status === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                            }`}>
                                                {inv.status || 'Pending'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-neutral-500 mt-1">{new Date(inv.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm text-neutral-900 dark:text-white">
                                            {inv.currencySymbol}{inv.items.reduce((acc, i) => acc + (i.quantity*i.unitPrice), 0).toLocaleString()}
                                        </p>
                                        {inv.pdfUrl && (
                                            <a href={inv.pdfUrl} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline">View PDF</a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                 </div>

             </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {clientToDelete && (
        <div 
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setClientToDelete(null)}
        >
            <div 
                className="bg-white dark:bg-neutral-900 w-full max-w-sm rounded-xl p-6 border border-neutral-100 dark:border-neutral-800 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                 <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-500">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                        <Trash2 size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Delete Client?</h3>
                 </div>
                 
                 <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6 leading-relaxed">
                    Are you sure you want to remove <strong>{clientToDelete.name}</strong>? This action cannot be undone.
                 </p>
                 
                 <div className="flex gap-3">
                     <button 
                        onClick={() => setClientToDelete(null)}
                        className="flex-1 py-2.5 font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors text-sm"
                     >
                        Cancel
                     </button>
                     <button 
                        onClick={executeDelete}
                        disabled={loading}
                        className="flex-1 py-2.5 font-bold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors flex items-center justify-center gap-2 text-sm"
                     >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : 'Delete Client'}
                     </button>
                 </div>
            </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div 
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-neutral-900 w-full max-w-3xl max-h-[90vh] flex flex-col rounded-xl overflow-hidden animate-in zoom-in-95 duration-200 border border-neutral-100 dark:border-neutral-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
               <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{editingClient ? 'Edit Client' : 'Add New Client'}</h2>
               <button type="button" onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                 <X size={20} />
               </button>
            </div>
            
            <form onSubmit={handleSave} className="flex flex-col overflow-hidden">
               <div className="p-6 overflow-y-auto space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   
                   {/* Column 1: Core Details */}
                   <div className="space-y-5">
                     <div>
                       <label className={labelClass}>Client Name / Company</label>
                       <div className="relative">
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                          <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={`${inputClass} pl-10`} placeholder="Acme Corp" />
                       </div>
                     </div>
                     
                     <div>
                       <label className={labelClass}>Email Address</label>
                       <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={`${inputClass} pl-10`} placeholder="billing@acme.com" />
                       </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className={labelClass}>Phone Number</label>
                         <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={`${inputClass} pl-10`} placeholder="+1 (555) 000-0000" />
                         </div>
                       </div>
                       <div>
                         <label className={labelClass}>VAT / Tax ID</label>
                         <div className="relative">
                              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                              <input type="text" value={formData.vat || ''} onChange={e => setFormData({...formData, vat: e.target.value})} className={`${inputClass} pl-10`} placeholder="US-123456789" />
                         </div>
                       </div>
                     </div>

                     <div>
                       <label className={labelClass}>Client Source</label>
                       <div className="relative">
                           <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                           <input 
                             type="text" 
                             list="sources-list"
                             value={formData.source || ''} 
                             onChange={e => setFormData({...formData, source: e.target.value})} 
                             className={`${inputClass} pl-10`} 
                             placeholder="e.g. Website" 
                           />
                           <datalist id="sources-list">
                              <option value="Website" />
                              <option value="Referral" />
                              <option value="Google" />
                              <option value="LinkedIn" />
                              <option value="Fiverr" />
                              <option value="Upwork" />
                              <option value="Cold Outreach" />
                              <option value="Instagram" />
                           </datalist>
                         </div>
                       </div>

                     <div>
                       <label className={labelClass}>Billing Address</label>
                       <AddressAutocomplete
                          value={formData.address || ''} 
                          onChange={val => setFormData({...formData, address: val})} 
                          className={inputClass} 
                          placeholder="123 Business Rd, Tech City"
                          icon={MapPin}
                        />
                     </div>
                   </div>

                   {/* Column 2: Billing & Services */}
                   <div className="space-y-5">
                     <div>
                        <label className={labelClass}>Internal Services Tags</label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                          <input 
                              type="text" 
                              value={formData.services || ''} 
                              onChange={e => setFormData({...formData, services: e.target.value})} 
                              className={`${inputClass} pl-10`} 
                              placeholder="e.g. Web Design, SEO" 
                          />
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-1">For your internal organization. Separate with commas.</p>
                     </div>

                     <div className="pt-2">
                       <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4">Invoice Defaults (Optional)</h3>
                       
                       <div className="grid grid-cols-2 gap-4 mb-4">
                         <div>
                           <label className={labelClass}>Default Currency</label>
                           <select 
                             value={formData.default_currency || 'USD'} 
                             onChange={e => setFormData({...formData, default_currency: e.target.value})}
                             className={inputClass}
                           >
                             <option value="USD">USD ($)</option>
                             <option value="EUR">EUR (€)</option>
                             <option value="GBP">GBP (£)</option>
                             <option value="CAD">CAD ($)</option>
                             <option value="AUD">AUD ($)</option>
                           </select>
                         </div>
                         <div>
                           <label className={labelClass}>Default Price</label>
                           <div className="relative">
                             <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                             <input 
                               type="number" 
                               step="0.01"
                               value={formData.default_price || ''} 
                               onChange={e => setFormData({...formData, default_price: parseFloat(e.target.value) || undefined})} 
                               className={`${inputClass} pl-10`} 
                               placeholder="3000.00" 
                             />
                           </div>
                         </div>
                       </div>

                       <div>
                         <label className={labelClass}>Default Line Item Description</label>
                         <textarea 
                           value={formData.default_invoice_description || ''} 
                           onChange={e => setFormData({...formData, default_invoice_description: e.target.value})}
                           className={inputClass}
                           rows={4}
                           placeholder="e.g., Monthly Retainer: SEO Optimization and Technical Maintenance"
                         />
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

               <div className="p-6 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex gap-3 shrink-0">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors text-sm">
                   Cancel
                 </button>
                 <button type="submit" disabled={loading} className="flex-1 py-2.5 font-bold text-white bg-neutral-900 hover:bg-black dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-md transition-all flex items-center justify-center gap-2 text-sm">
                   {loading ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Save Client</>}
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};