
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import { Invoice, Client, UserProfile } from '../types';
import { DEFAULT_INVOICE } from '../constants';
import { Dashboard } from './Dashboard';
import { InvoiceEditor } from './InvoiceEditor';
import { Clients } from './Clients';
import { Settings } from './Settings';
import { Auth, LandingPage } from './Auth';
import { IndustryTemplate } from './IndustryTemplate'; 
import { InvoicesList } from './InvoicesList';
import { UpgradeModal } from './UpgradeModal';
import { PublicInvoiceView } from './PublicInvoiceView';
import { PrivacyPolicy } from './PrivacyPolicy';
import { TermsOfService } from './TermsOfService';
import { supabase } from '../services/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { Loader2, LogOut, Sparkles, Sun, Moon, LayoutDashboard, Users, Settings as SettingsIcon, Menu, X, ChevronRight, Trash2, FileText, Plus, Command } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

// --- Helper Component to Handle Editor Logic (New vs Edit) ---
const EditorWrapper = ({ 
  invoices, 
  userProfile, 
  clients, 
  onSave, 
  darkMode, 
  toggleDarkMode,
  onTriggerUpgrade,
  notify
}: { 
  invoices: Invoice[], 
  userProfile: UserProfile | null, 
  clients: Client[], 
  onSave: (i: Invoice) => Promise<void>,
  darkMode: boolean,
  toggleDarkMode: () => void,
  onTriggerUpgrade: (reason: string) => void,
  notify: any
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialInvoice, setInitialInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    if (id === 'new') {
      // Check Plan Limits for Creation (Direct URL access protection)
      const isPaidPlan = userProfile?.subscription_plan && userProfile.subscription_plan !== 'free';
      
      // Limit: 3 invoices for free users
      if (!isPaidPlan && invoices.length >= 3) {
        onTriggerUpgrade('3 Invoices');
        navigate('/dashboard');
        return;
      }

      // Create New Invoice Logic
      const generateNextInvoiceNumber = (existingInvoices: Invoice[]) => {
        const currentYear = new Date().getFullYear();
        const yearPrefix = `${currentYear}-`;
        const yearInvoices = existingInvoices.filter(inv => inv.number && inv.number.startsWith(yearPrefix));
        
        if (yearInvoices.length === 0) return `${currentYear}-001`;

        let maxSequence = 0;
        yearInvoices.forEach(inv => {
          const parts = inv.number.split('-');
          if (parts.length === 2) {
            const sequence = parseInt(parts[1], 10);
            if (!isNaN(sequence)) maxSequence = Math.max(maxSequence, sequence);
          }
        });

        return `${currentYear}-${(maxSequence + 1).toString().padStart(3, '0')}`;
      };

      const nextNumber = generateNextInvoiceNumber(invoices);
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      const baseInvoice = { ...DEFAULT_INVOICE };
      
      if (userProfile) {
        if (userProfile.company_name) baseInvoice.senderName = userProfile.company_name;
        if (userProfile.company_address) baseInvoice.senderAddress = userProfile.company_address;
        if (userProfile.company_email) baseInvoice.senderEmail = userProfile.company_email;
        if (userProfile.company_phone) baseInvoice.senderPhone = userProfile.company_phone;
        if (userProfile.default_iban) baseInvoice.paymentIban = userProfile.default_iban;
        if (userProfile.default_bic) baseInvoice.paymentBic = userProfile.default_bic;
        if (userProfile.default_logo) baseInvoice.logo = userProfile.default_logo;
      }

      setInitialInvoice({
        ...baseInvoice,
        id: crypto.randomUUID(),
        number: nextNumber,
        date: today.toISOString().split('T')[0],
        dueDate: nextWeek.toISOString().split('T')[0],
      });
    } else {
      // Find Existing Invoice
      const found = invoices.find(i => i.id === id);
      if (found) {
        setInitialInvoice(found);
      } else if (invoices.length > 0) {
         navigate('/dashboard'); 
      }
    }
  }, [id, invoices, userProfile, navigate, onTriggerUpgrade]);

  if (!initialInvoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <Loader2 className="animate-spin text-neutral-400" size={32} />
      </div>
    );
  }

  return (
    <InvoiceEditor 
      initialInvoice={initialInvoice}
      savedClients={clients}
      userProfile={userProfile}
      notify={notify}
      onTriggerUpgrade={onTriggerUpgrade}
      onSave={async (inv) => {
        await onSave(inv);
        // Navigation is now handled inside InvoiceEditor to support "Save & Stay" vs "Save & Exit"
      }}
      onCancel={() => navigate(-1)}
      darkMode={darkMode}
      toggleDarkMode={toggleDarkMode}
    />
  );
};

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  
  // Data State
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  
  // Modal States
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Upgrade Modal State
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<string>('');
  
  const [loadingData, setLoadingData] = useState(false);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { notify } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  // Theme management
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Click outside listener for user menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Auth & Session Check
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
           console.warn("Session error:", error.message);
        }
        setSession(data.session);
      } catch (err) {
        console.error("Auth initialization failed:", err);
      } finally {
        setLoadingSession(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoadingSession(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Data when Session exists
  useEffect(() => {
    if (session) {
      fetchInvoices();
      fetchClients();
      fetchUserProfile();
    } else {
      setInvoices([]);
      setClients([]);
      setUserProfile(null);
    }
  }, [session]);

  const fetchInvoices = async () => {
    if (!session) return;
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        const mappedInvoices = data.map(row => ({ ...row.invoice_data, id: row.id } as Invoice));
        setInvoices(mappedInvoices);
      }
    } catch (err: any) {
      console.error("Error fetching invoices:", err.message || err);
      if (err.code === '42P01') {
        console.warn("Table 'invoices' does not exist. Please run the SQL migration script.");
      } else {
        notify('error', `Failed to fetch invoices: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoadingData(false);
    }
  };

  const fetchClients = async () => {
    if (!session) return;
    try {
      const { data, error } = await supabase.from('clients').select('*').order('name', { ascending: true });
      if (error) throw error;
      if (data) setClients(data);
    } catch (err: any) {
      console.error("Error fetching clients:", err.message || err);
    }
  };

  const fetchUserProfile = async () => {
    if (!session) return;
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
      if (error) throw error;
      if (data) {
        setUserProfile(data);
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err.message || err);
    }
  };

  const handleSaveInvoice = async (invoice: Invoice) => {
    if (!session?.user) return;
    setInvoices(prev => {
      const exists = prev.find(i => i.id === invoice.id);
      return exists ? prev.map(i => i.id === invoice.id ? invoice : i) : [invoice, ...prev];
    });
    
    try {
      const { error } = await supabase.from('invoices').upsert({
          id: invoice.id,
          user_id: session.user.id,
          invoice_data: invoice,
      });
      if (error) throw error;
      notify('success', 'Invoice saved successfully');
    } catch (error: any) {
      console.error('Error saving invoice:', error.message || error);
      notify('error', 'Failed to save invoice to the cloud.');
    }
  };

  const handleDeleteInvoice = (id: string) => {
    setInvoiceToDelete(id);
  };

  const executeDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    const id = invoiceToDelete;
    setInvoiceToDelete(null); // Close modal

    // Store previous state for rollback
    const previousInvoices = invoices;
    
    // Optimistic update
    setInvoices(prev => prev.filter(i => i.id !== id));
    
    try {
      // 1. Delete PDF from Storage
      if (session?.user?.id) {
          const filePath = `${session.user.id}/${id}.pdf`;
          
          const { error: storageError } = await supabase.storage
              .from('invoice_files')
              .remove([filePath]);
          
          if (storageError) {
              console.warn("Storage delete warning:", storageError);
          }
      }

      // 2. Delete Record from DB
      const { error: dbError } = await supabase.from('invoices').delete().eq('id', id);
      
      if (dbError) throw dbError;
      
      notify('success', 'Invoice and associated files deleted');
    } catch (error: any) {
      console.error('Error deleting invoice:', error.message || error);
      notify('error', 'Failed to delete invoice');
      setInvoices(previousInvoices); // Revert on critical failure
    }
  };

  const handleLogout = async () => {
    setIsLogoutModalOpen(false);
    await supabase.auth.signOut();
    notify('info', 'Logged out successfully');
    navigate('/'); 
  };

  // Safe Navigation Handler
  const handleCreateNewInvoice = () => {
    const isPaid = userProfile?.subscription_plan && userProfile.subscription_plan !== 'free';
    if (!isPaid && invoices.length >= 3) {
      setUpgradeFeature('3 Invoices');
      setIsUpgradeModalOpen(true);
    } else {
      navigate('/invoice/new');
    }
  };

  const handleTriggerUpgrade = (reason: string) => {
    setUpgradeFeature(reason);
    setIsUpgradeModalOpen(true);
  };

  // Drawer Item Component
  const DrawerItem = ({ path, icon: Icon, label }: { path: string; icon: any; label: string }) => {
    const isActive = location.pathname === path;
    return (
        <button
        onClick={() => {
            navigate(path);
            setIsMobileMenuOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
            isActive
            ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
        }`}
        >
        <Icon size={20} className={isActive ? '' : 'text-neutral-500'} />
        <span>{label}</span>
        {isActive && <ChevronRight size={14} className="ml-auto opacity-50" />}
        </button>
    );
  };

  const AppSkeleton = () => (
    <div className="min-h-screen bg-white dark:bg-neutral-900 flex flex-col">
        {/* Header Skeleton */}
        <div className="border-b border-neutral-100 dark:border-neutral-800 p-4 sm:px-6">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                        <div className="w-24 h-6 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
                    </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
            </div>
        </div>
        <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
            <div className="h-64 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
        </div>
    </div>
  );

  if (loadingSession) {
    return <AppSkeleton />;
  }

  // --- Layout Selection ---

  // Not logged in? Show Auth via Routes (Handles /login, /signup, /)
  if (!session) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Public View Route - Accessible without login */}
        <Route path="/p/:id" element={<PublicInvoiceView />} />
        
        <Route path="/login" element={<Auth view="login" />} />
        <Route path="/signup" element={<Auth view="signup" />} />
        <Route path="/update-password" element={<Auth view="update_password" />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        {/* Public Marketing Route */}
        <Route path="/templates/:industry" element={<IndustryTemplate />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Logged in? Show App Shell
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-200 relative">
      
      {/* GLOBAL UPGRADE MODAL */}
      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
        featureName={upgradeFeature} 
      />

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div 
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsLogoutModalOpen(false)}
        >
            <div 
                className="bg-white dark:bg-neutral-900 w-full max-w-sm rounded-xl shadow-2xl p-6 border border-neutral-100 dark:border-neutral-800 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                 <div className="flex items-center gap-3 mb-4 text-neutral-900 dark:text-white">
                    <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-full text-neutral-600 dark:text-neutral-300">
                        <LogOut size={20} />
                    </div>
                    <h3 className="text-lg font-bold">Sign Out?</h3>
                 </div>
                 
                 <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6 leading-relaxed">
                    Are you sure you want to sign out of your account? You will need to log in again to access your invoices.
                 </p>
                 
                 <div className="flex gap-3">
                     <button 
                        onClick={() => setIsLogoutModalOpen(false)}
                        className="flex-1 py-2.5 font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors text-sm"
                     >
                        Cancel
                     </button>
                     <button 
                        onClick={handleLogout}
                        className="flex-1 py-2.5 font-bold text-white bg-neutral-900 hover:bg-black dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-md transition-colors flex items-center justify-center gap-2 text-sm"
                     >
                        Sign Out
                     </button>
                 </div>
            </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {invoiceToDelete && (
        <div 
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setInvoiceToDelete(null)}
        >
            <div 
                className="bg-white dark:bg-neutral-900 w-full max-w-sm rounded-xl shadow-2xl p-6 border border-neutral-100 dark:border-neutral-800 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                 <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-500">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                        <Trash2 size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Delete Invoice?</h3>
                 </div>
                 
                 <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6 leading-relaxed">
                    Are you sure you want to delete this invoice? This action cannot be undone and the PDF file will be removed from storage.
                 </p>
                 
                 <div className="flex gap-3">
                     <button 
                        onClick={() => setInvoiceToDelete(null)}
                        className="flex-1 py-2.5 font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors text-sm"
                     >
                        Cancel
                     </button>
                     <button 
                        onClick={executeDeleteInvoice}
                        className="flex-1 py-2.5 font-bold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
                     >
                        Delete Invoice
                     </button>
                 </div>
            </div>
        </div>
      )}

      {/* Routes for Editor (No Layout) */}
      <Routes>
        <Route path="/invoice/:id" element={
            <EditorWrapper 
                invoices={invoices}
                userProfile={userProfile}
                clients={clients}
                onSave={handleSaveInvoice}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                onTriggerUpgrade={handleTriggerUpgrade}
                notify={notify}
            />
        } />
        
        {/* Fix for Password Reset: Allow accessing Update Password page even if logged in (Supabase logs in automatically on link click) */}
        <Route path="/update-password" element={<Auth view="update_password" />} />

        {/* Public View Route - Also accessible when logged in */}
        <Route path="/p/:id" element={<PublicInvoiceView />} />
        
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />

        {/* Main Application Layout Routes */}
        <Route path="*" element={
            <>
                {/* Mobile Drawer (Side Panel) */}
                <div 
                    className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${
                        isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <div 
                        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-neutral-900 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
                            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Drawer Header */}
                        <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black">
                                    <Command size={16} />
                                </div>
                                <span className="font-bold text-lg text-neutral-900 dark:text-white">Invoycer</span>
                            </div>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                            <X size={20} />
                            </button>
                        </div>
                        
                        {/* Drawer Nav */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            <DrawerItem path="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                            <DrawerItem path="/invoices" icon={FileText} label="Invoices" />
                            <DrawerItem path="/clients" icon={Users} label="Clients" />
                            <DrawerItem path="/settings" icon={SettingsIcon} label="Settings" />
                        </div>

                        {/* Drawer Footer */}
                        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/20">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 overflow-hidden flex-shrink-0">
                                    {userProfile?.avatar_url ? (
                                        <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-500 font-bold">
                                            {session?.user.email?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-neutral-900 dark:text-white truncate">{userProfile?.full_name || 'User'}</p>
                                    <p className="text-xs text-neutral-500 truncate">{session?.user.email}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={toggleDarkMode} className="flex-1 py-2 flex items-center justify-center gap-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    {darkMode ? <><Sun size={16} /> Light</> : <><Moon size={16} /> Dark</>}
                                </button>
                                <button onClick={() => setIsLogoutModalOpen(true)} className="flex-1 py-2 flex items-center justify-center gap-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-red-200 dark:hover:border-red-900 hover:text-red-600 dark:hover:text-red-400 rounded-md text-sm font-medium text-neutral-700 dark:text-neutral-300 transition-colors">
                                    <LogOut size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Global Navigation Header (Desktop + Mobile Trigger) */}
                <header className="bg-white dark:bg-neutral-900 sticky top-0 z-40 border-b border-neutral-200 dark:border-neutral-800 py-4 transition-colors duration-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                        {/* Branding & Nav */}
                        <div className="flex items-center gap-4 sm:gap-8">
                        {/* Mobile Menu Trigger */}
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 -ml-2 text-neutral-600 dark:text-neutral-300 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        >
                            <Menu size={24} />
                        </button>

                        <div 
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => navigate('/dashboard')}
                        >
                            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black">
                            <Command size={16} />
                            </div>
                            <span className="font-bold text-lg tracking-tight text-neutral-900 dark:text-white">
                            Invoycer
                            </span>
                        </div>
                        
                        {/* Desktop Main Nav */}
                        <nav className="hidden md:flex items-center gap-1">
                            <button 
                            onClick={() => navigate('/dashboard')}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${location.pathname === '/dashboard' ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white' : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'}`}
                            >
                            <LayoutDashboard size={16} /> Dashboard
                            </button>
                            <button 
                            onClick={() => navigate('/invoices')}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${location.pathname === '/invoices' ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white' : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'}`}
                            >
                            <FileText size={16} /> Invoices
                            </button>
                            <button 
                            onClick={() => navigate('/clients')}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${location.pathname === '/clients' ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white' : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'}`}
                            >
                            <Users size={16} /> Clients
                            </button>
                            <button 
                            onClick={() => navigate('/settings')}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${location.pathname === '/settings' ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white' : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'}`}
                            >
                            <SettingsIcon size={16} /> Settings
                            </button>
                        </nav>
                        </div>

                        {/* User Menu (Desktop) */}
                        <div className="flex items-center gap-2 sm:gap-4">
                        {/* Global Create Button */}
                        <button 
                            onClick={handleCreateNewInvoice}
                            className="hidden sm:flex bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black px-4 py-2 rounded-lg font-bold text-sm items-center gap-2 transition-colors shadow-sm"
                        >
                            <Plus size={16} />
                            <span>New Invoice</span>
                        </button>

                        <button 
                            onClick={toggleDarkMode}
                            className="hidden sm:block p-2 rounded-full text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors"
                            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        <div className="hidden sm:block h-6 w-px bg-neutral-200 dark:bg-neutral-800"></div>

                        {/* User Avatar Dropdown */}
                        <div className="relative hidden sm:block" ref={userMenuRef}>
                            <button 
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="relative group cursor-pointer focus:outline-none"
                            >
                                <div className={`w-9 h-9 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center border border-neutral-200 dark:border-neutral-700 overflow-hidden ring-2 ring-transparent group-hover:ring-neutral-200 dark:group-hover:ring-neutral-700 transition-all`}>
                                {userProfile?.avatar_url ? (
                                    <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-neutral-700 dark:text-neutral-300 font-semibold text-xs">{session?.user.email?.charAt(0).toUpperCase()}</span>
                                )}
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {isUserMenuOpen && (
                            <div className="absolute right-0 mt-3 w-60 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                {/* User Info Header */}
                                <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
                                    <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                                    {userProfile?.full_name || 'User'}
                                    </p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                                    {session?.user.email}
                                    </p>
                                </div>

                                {/* Menu Items */}
                                <div className="p-1">
                                    <button 
                                    onClick={() => {
                                        navigate('/settings');
                                        setIsUserMenuOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-md flex items-center gap-2 transition-colors"
                                    >
                                    <SettingsIcon size={16} />
                                    Settings
                                    </button>
                                    <button 
                                    onClick={() => {
                                        navigate('/invoices');
                                        setIsUserMenuOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-md flex items-center gap-2 transition-colors"
                                    >
                                    <FileText size={16} />
                                    Invoices
                                    </button>
                                    <button 
                                    onClick={() => {
                                        navigate('/clients');
                                        setIsUserMenuOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-md flex items-center gap-2 transition-colors"
                                    >
                                    <Users size={16} />
                                    Clients
                                    </button>
                                </div>

                                <div className="border-t border-neutral-100 dark:border-neutral-800 my-1"></div>

                                <div className="p-1">
                                    <button 
                                    onClick={() => {
                                        setIsUserMenuOpen(false);
                                        setIsLogoutModalOpen(true);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md flex items-center gap-2 transition-colors"
                                    >
                                    <LogOut size={16} />
                                    Sign Out
                                    </button>
                                </div>
                            </div>
                            )}
                        </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={
                            <Dashboard 
                                invoices={invoices} 
                                clients={clients}
                                userProfile={userProfile}
                                onCreateNew={handleCreateNewInvoice}
                                onEdit={(inv) => navigate(`/invoice/${inv.id}`)}
                                onViewAll={() => navigate('/invoices')}
                                onDelete={handleDeleteInvoice}
                                isLoading={loadingData}
                            />
                        } />
                        <Route path="/invoices" element={
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <InvoicesList 
                                    invoices={invoices}
                                    onCreateNew={handleCreateNewInvoice}
                                    onEdit={(inv) => navigate(`/invoice/${inv.id}`)}
                                    onDelete={handleDeleteInvoice}
                                />
                            </div>
                        } />
                        <Route path="/clients" element={
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <Clients 
                                    clients={clients} 
                                    invoices={invoices} 
                                    onRefresh={fetchClients} 
                                    userProfile={userProfile}
                                    onTriggerUpgrade={handleTriggerUpgrade}
                                />
                            </div>
                        } />
                        <Route path="/settings" element={
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <Settings userProfile={userProfile} onUpdateProfile={fetchUserProfile} />
                            </div>
                        } />
                        <Route path="/login" element={<Navigate to="/" replace />} />
                        <Route path="/signup" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </>
        } />
      </Routes>
    </div>
  );
};

export default App;
