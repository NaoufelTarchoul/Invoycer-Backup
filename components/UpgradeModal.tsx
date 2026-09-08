import React from 'react';
import { X, Zap, Check, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, featureName }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-neutral-100 dark:border-neutral-800 animate-in zoom-in-95 duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-neutral-100 dark:bg-neutral-800 rounded-full text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors z-10"
        >
            <X size={16} />
        </button>

        {/* Header Image/Gradient */}
        <div className="h-32 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20 shadow-xl">
                <Zap size={32} className="text-yellow-400 fill-yellow-400" />
            </div>
        </div>

        <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                Upgrade to Pro
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6 text-sm leading-relaxed">
                {featureName 
                    ? `You've reached the limit for ${featureName}.`
                    : "You've hit the limits of the free plan."}
                <br/>
                Unlock unlimited access and professional features.
            </p>

            <div className="space-y-3 mb-8 text-left bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                    <Check size={16} className="text-emerald-500 flex-shrink-0" />
                    <span>Unlimited Invoices & Clients</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                    <Check size={16} className="text-emerald-500 flex-shrink-0" />
                    <span>Remove "Powered by" Branding</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                    <Check size={16} className="text-emerald-500 flex-shrink-0" />
                    <span>Email Invoices Directly</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                    <Check size={16} className="text-emerald-500 flex-shrink-0" />
                    <span>AI Content Assistant</span>
                </div>
            </div>

            <button 
                onClick={() => {
                    onClose();
                    navigate('/settings');
                }}
                className="w-full py-3.5 bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
                <Star size={18} className="fill-current" />
                Upgrade for $12/mo
            </button>
            
            <button 
                onClick={onClose}
                className="mt-4 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
                Maybe Later
            </button>
        </div>
      </div>
    </div>
  );
};