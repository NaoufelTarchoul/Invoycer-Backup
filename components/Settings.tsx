import React, { useState, useEffect } from 'react';
import { Save, Loader2, Camera, Upload, Check, Zap, Shield, Users, User, Building, Mail, Phone, CreditCard, Globe, Trash2 } from 'lucide-react';
import { UserProfile, SubscriptionPlan } from '../types';
import { supabase } from '../services/supabaseClient';
import { useNotification } from '../contexts/NotificationContext';

interface SettingsProps {
  userProfile: UserProfile | null;
  onUpdateProfile: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ userProfile, onUpdateProfile }) => {
  const { notify } = useNotification();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription'>('profile');
  const [showDeleteLogoConfirm, setShowDeleteLogoConfirm] = useState(false);
  
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    full_name: '',
    avatar_url: '',
    company_name: '',
    company_address: '',
    company_email: '',
    company_phone: '',
    default_iban: '',
    default_bic: '',
    subscription_plan: 'free'
  });

  useEffect(() => {
    if (userProfile) {
      setFormData(userProfile);
    }
  }, [userProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const payload = {
        ...formData,
        id: user.id, // Ensure ID matches auth user
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(payload);

      if (error) throw error;
      
      onUpdateProfile();
      notify('success', 'Settings saved successfully');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      notify('error', 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      notify('error', 'Logo must be smaller than 2MB');
      return;
    }

    notify('info', 'Uploading default logo...');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
         notify('error', 'You must be logged in to upload images.');
         return;
      }

      // 1. Upload to Supabase using Strategy A (Overwrite)
      const fileExt = file.name.split('.').pop();
      // Use a fixed name so we don't accumulate junk files.
      // e.g., "default_logo.png" or "default_logo.svg"
      const fileName = `default_logo.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('invoice_files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Overwrite existing file
        });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data } = supabase.storage
        .from('invoice_files')
        .getPublicUrl(filePath);

      // 3. Update State with Cache Busting
      // We append ?t=timestamp so the browser fetches the new image immediately 
      // instead of showing the cached old version.
      setFormData(prev => ({ ...prev, default_logo: `${data.publicUrl}?t=${Date.now()}` }));
      notify('success', 'Default logo uploaded successfully');

    } catch (error: any) {
      console.error('Logo upload error:', error);
      notify('error', 'Failed to upload logo.');
    }
  };

  const handleDeleteLogo = () => {
    setShowDeleteLogoConfirm(true);
  };

  const confirmDeleteLogo = () => {
    setFormData(prev => ({ ...prev, default_logo: '' }));
    setShowDeleteLogoConfirm(false);
    notify('info', 'Logo removed. Click Save Changes to apply.');
  };

  // Fake subscription upgrade handler
  const handleUpgrade = (plan: SubscriptionPlan) => {
    if (confirm(`Switch to ${plan} plan? (This is a demo, no payment will be taken)`)) {
        setFormData(prev => ({ ...prev, subscription_plan: plan }));
        // In a real app, this would trigger a payment flow
        notify('success', `Upgraded to ${plan} Plan`);
        // We trigger a save implicitly to update the mock state
        setTimeout(() => {
            const btn = document.getElementById('save-settings-btn');
            if(btn) btn.click();
        }, 100);
    }
  };

  const inputClass = "w-full p-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm text-neutral-900 dark:text-white focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white outline-none transition-all placeholder-neutral-400";
  const labelClass = "block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase mb-1.5";
  const sectionClass = "bg-white dark:bg-neutral-800 p-5 sm:p-8 rounded-2xl border border-neutral-100 dark:border-neutral-800";

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Settings</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">Manage your profile, preferences, and subscription.</p>
      </div>

      <div className="flex gap-4 border-b border-neutral-100 dark:border-neutral-800 mb-8">
        <button 
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-1 text-sm font-bold border-b-2 transition-colors ${activeTab === 'profile' ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white' : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'}`}
        >
            Profile & Business
        </button>
        <button 
            onClick={() => setActiveTab('subscription')}
            className={`pb-3 px-1 text-sm font-bold border-b-2 transition-colors ${activeTab === 'subscription' ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white' : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'}`}
        >
            Subscription Plan
        </button>
      </div>

      {activeTab === 'profile' ? (
        <form onSubmit={handleSave} className="space-y-8 pb-20">
            {/* Profile Section */}
            <section className={sectionClass}>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-6 border-b border-neutral-100 dark:border-neutral-700 pb-4">Your Profile</h2>
            
            <div className="flex items-start gap-8 mb-6">
                <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center border border-neutral-200 dark:border-neutral-600">
                    {formData.avatar_url ? (
                    <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                    <Camera size={32} className="text-neutral-400" />
                    )}
                </div>
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer text-white text-xs font-bold">
                    Change
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
                </div>
                <div className="flex-1 max-w-md">
                <label className={labelClass}>Full Name</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                    <input type="text" value={formData.full_name || ''} onChange={e => setFormData({...formData, full_name: e.target.value})} className={`${inputClass} pl-10`} placeholder="John Doe" />
                </div>
                <p className="text-xs text-neutral-500 mt-2">This is used for your display name in the app.</p>
                </div>
            </div>
            </section>

            {/* Business Details Section */}
            <section className={sectionClass}>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-6 border-b border-neutral-100 dark:border-neutral-700 pb-4">Default Business Details</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 -mt-2">These details will be automatically filled in the "Sender" section when you create a new invoice.</p>
            
            <div className="mb-6">
                <label className={labelClass}>Default Invoice Logo</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {formData.default_logo && (
                        <div className="relative group">
                            <img src={formData.default_logo} className="h-16 w-auto object-contain border border-neutral-200 dark:border-neutral-600 rounded p-2 bg-neutral-50 dark:bg-neutral-700" alt="Logo Preview"/>
                            <button
                                type="button"
                                onClick={handleDeleteLogo}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                title="Remove Logo"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    )}
                    <label className="cursor-pointer bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 px-4 py-2 rounded border border-neutral-300 dark:border-neutral-600 text-sm font-medium transition-colors flex items-center gap-2">
                        <Upload size={16}/> {formData.default_logo ? 'Change Logo' : 'Upload Logo'}
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                <label className={labelClass}>Company Name</label>
                <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                    <input type="text" value={formData.company_name || ''} onChange={e => setFormData({...formData, company_name: e.target.value})} className={`${inputClass} pl-10`} placeholder="Acme Creative" />
                </div>
                </div>
                <div>
                <label className={labelClass}>Company Email</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                    <input type="email" value={formData.company_email || ''} onChange={e => setFormData({...formData, company_email: e.target.value})} className={`${inputClass} pl-10`} placeholder="billing@acme.com" />
                </div>
                </div>
            </div>

            <div className="mb-6">
                <label className={labelClass}>Company Address</label>
                <textarea rows={3} value={formData.company_address || ''} onChange={e => setFormData({...formData, company_address: e.target.value})} className={inputClass} placeholder="123 Innovation Dr..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                <label className={labelClass}>Phone</label>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                    <input type="text" value={formData.company_phone || ''} onChange={e => setFormData({...formData, company_phone: e.target.value})} className={`${inputClass} pl-10`} placeholder="+1 (555) 000-0000" />
                </div>
                </div>
                <div>
                <label className={labelClass}>Default IBAN</label>
                <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                    <input type="text" value={formData.default_iban || ''} onChange={e => setFormData({...formData, default_iban: e.target.value})} className={`${inputClass} pl-10`} placeholder="US89 3704 0044 0532 0130 00" />
                </div>
                </div>
                <div>
                <label className={labelClass}>Default BIC/SWIFT</label>
                <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                    <input type="text" value={formData.default_bic || ''} onChange={e => setFormData({...formData, default_bic: e.target.value})} className={`${inputClass} pl-10`} placeholder="ACMEUS33" />
                </div>
                </div>
            </div>
            </section>

            <div className="flex justify-end">
            <button id="save-settings-btn" type="submit" disabled={loading} className="bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 px-8 py-3 rounded-md font-bold text-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save Changes</>}
            </button>
            </div>
        </form>
      ) : (
        <div className="space-y-6 pb-20">
            <div className="bg-neutral-900 dark:bg-white text-white dark:text-black p-8 rounded-xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h2 className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">Current Plan</h2>
                    <div className="text-4xl font-bold mb-2">{(formData.subscription_plan || 'free').charAt(0).toUpperCase() + (formData.subscription_plan || 'free').slice(1)}</div>
                    <p className="text-sm opacity-70">
                        {formData.subscription_plan === 'free' ? 'Upgrade to remove limits.' : 'Thanks for being a pro user!'}
                    </p>
                </div>
                {formData.subscription_plan === 'free' && (
                    <button onClick={() => setActiveTab('subscription')} className="px-6 py-3 bg-white text-black dark:bg-black dark:text-white font-bold rounded-lg hover:opacity-90 transition-opacity">
                        Upgrade Now
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Free Plan */}
                 <div className={`border rounded-xl p-6 relative ${formData.subscription_plan === 'free' ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800' : 'border-neutral-200 dark:border-neutral-700'}`}>
                    {formData.subscription_plan === 'free' && (
                        <div className="absolute top-0 right-0 bg-neutral-900 dark:bg-white text-white dark:text-black text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">CURRENT</div>
                    )}
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Starter</h3>
                        <div className="text-3xl font-bold mt-2 text-neutral-900 dark:text-white">$0<span className="text-sm font-normal text-neutral-500">/mo</span></div>
                    </div>
                    <ul className="space-y-3 mb-8 text-sm">
                        <li className="flex gap-2 text-neutral-700 dark:text-neutral-300"><Check size={16} className="text-neutral-900 dark:text-white flex-shrink-0"/> 3 Invoices / month</li>
                        <li className="flex gap-2 text-neutral-700 dark:text-neutral-300"><Check size={16} className="text-neutral-900 dark:text-white flex-shrink-0"/> Basic Templates</li>
                        <li className="flex gap-2 text-neutral-700 dark:text-neutral-300"><Check size={16} className="text-neutral-900 dark:text-white flex-shrink-0"/> PDF Export</li>
                        <li className="flex gap-2 text-neutral-700 dark:text-neutral-300"><Check size={16} className="text-neutral-900 dark:text-white flex-shrink-0"/> "Powered by Invoycer" Badge</li>
                    </ul>
                    {formData.subscription_plan !== 'free' && (
                         <button onClick={() => handleUpgrade('free')} className="w-full py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg font-semibold text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-700">Downgrade</button>
                    )}
                 </div>

                 {/* Pro Plan */}
                 <div className={`border rounded-xl p-6 relative ${formData.subscription_plan === 'pro' ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800' : 'border-neutral-200 dark:border-neutral-700'}`}>
                    {formData.subscription_plan === 'pro' && (
                        <div className="absolute top-0 right-0 bg-neutral-900 dark:bg-white text-white dark:text-black text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">CURRENT</div>
                    )}
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">Pro <Zap size={16} className="text-amber-500" fill="currentColor"/></h3>
                        <div className="text-3xl font-bold mt-2 text-neutral-900 dark:text-white">$12<span className="text-sm font-normal text-neutral-500">/mo</span></div>
                    </div>
                    <ul className="space-y-3 mb-8 text-sm">
                        <li className="flex gap-2 text-neutral-700 dark:text-neutral-300"><Check size={16} className="text-emerald-500 flex-shrink-0"/> Unlimited Invoices</li>
                        <li className="flex gap-2 text-neutral-700 dark:text-neutral-300"><Check size={16} className="text-emerald-500 flex-shrink-0"/> AI Assistant</li>
                        <li className="flex gap-2 text-neutral-700 dark:text-neutral-300"><Check size={16} className="text-emerald-500 flex-shrink-0"/> Custom Branding</li>
                        <li className="flex gap-2 text-neutral-700 dark:text-neutral-300"><Check size={16} className="text-emerald-500 flex-shrink-0"/> Priority Support</li>
                    </ul>
                    {formData.subscription_plan !== 'pro' && (
                        <button onClick={() => handleUpgrade('pro')} className="w-full py-2 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-lg font-semibold hover:opacity-90">Upgrade to Pro</button>
                    )}
                 </div>

                 {/* Team Plan */}
                 <div className={`border rounded-xl p-6 relative ${formData.subscription_plan === 'team' ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800' : 'border-neutral-200 dark:border-neutral-700'}`}>
                    {formData.subscription_plan === 'team' && (
                        <div className="absolute top-0 right-0 bg-neutral-900 dark:bg-white text-white dark:text-black text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">CURRENT</div>
                    )}
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">Team <Users size={16} className="text-blue-500"/></h3>
                        <div className="text-3xl font-bold mt-2 text-neutral-900 dark:text-white">$29<span className="text-sm font-normal text-neutral-500">/mo</span></div>
                    </div>
                    <ul className="space-y-3 mb-8 text-sm">
                        <li className="flex gap-2 text-neutral-700 dark:text-neutral-300"><Check size={16} className="text-blue-500 flex-shrink-0"/> Everything in Pro</li>
                        <li className="flex gap-2 text-neutral-700 dark:text-neutral-300"><Check size={16} className="text-blue-500 flex-shrink-0"/> 5 Team Seats</li>
                        <li className="flex gap-2 text-neutral-700 dark:text-neutral-300"><Check size={16} className="text-blue-500 flex-shrink-0"/> API Access</li>
                        <li className="flex gap-2 text-neutral-700 dark:text-neutral-300"><Check size={16} className="text-blue-500 flex-shrink-0"/> Advanced Analytics</li>
                    </ul>
                    {formData.subscription_plan !== 'team' && (
                        <button onClick={() => handleUpgrade('team')} className="w-full py-2 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-lg font-semibold hover:opacity-90">Upgrade to Team</button>
                    )}
                 </div>
            </div>
            
            <div className="mt-8 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 flex gap-4">
                <Shield className="text-neutral-400 flex-shrink-0" size={24} />
                <div>
                    <h4 className="font-bold text-sm text-neutral-900 dark:text-white">Secure Payment Processing</h4>
                    <p className="text-xs text-neutral-500 mt-1">
                        We use Stripe for secure payment processing. Your credit card information is never stored on our servers.
                        Manage your billing details and download receipts from the billing portal.
                    </p>
                </div>
            </div>
        </div>
      )}
      
      {showDeleteLogoConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-neutral-100 dark:border-neutral-800 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Remove Default Logo?</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">Are you sure you want to remove your default logo? This action will take effect once you click "Save Changes".</p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowDeleteLogoConfirm(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteLogo}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};