
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Command } from 'lucide-react';
import { MARKETING } from '../marketing';
import { INDUSTRY_DATA } from '../data/marketing-content';

export const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleScrollTo = (id: string) => {
    if (location.pathname !== '/') {
        navigate('/');
        // Give time for the home page to mount
        setTimeout(() => {
            const element = document.getElementById(id);
            if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 300);
    } else {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-white dark:bg-neutral-900 py-12 border-t border-neutral-100 dark:border-neutral-800 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">
                    <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-neutral-900 dark:bg-white text-white dark:text-black p-1 rounded-md">
                            <Command size={12} />
                        </div>
                        <span className="font-bold text-neutral-900 dark:text-white tracking-tight">{MARKETING.appName}</span>
                    </div>
                    <p className="text-sm text-neutral-500 max-w-xs">
                        The simple recurring invoicing tool for freelancers on retainers. Get paid on time, every time.
                    </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
                    <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white mb-4">Product</h4>
                        <ul className="space-y-2 text-neutral-500 dark:text-neutral-400">
                            <li><button onClick={() => handleScrollTo('features')} className="hover:text-neutral-900 dark:hover:text-white transition-colors">Features</button></li>
                            <li><button onClick={() => handleScrollTo('pricing')} className="hover:text-neutral-900 dark:hover:text-white transition-colors">Pricing</button></li>
                            <li><button onClick={() => handleScrollTo('faq')} className="hover:text-neutral-900 dark:hover:text-white transition-colors">FAQ</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white mb-4">Templates</h4>
                        <ul className="space-y-2 text-neutral-500 dark:text-neutral-400">
                            {Object.values(INDUSTRY_DATA).map((item) => (
                                <li key={item.slug}>
                                    <button onClick={() => navigate(`/templates/${item.slug}`)} className="hover:text-neutral-900 dark:hover:text-white transition-colors text-left">
                                        {item.title.replace('Invoice Template for ', '')}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white mb-4">Legal</h4>
                        <ul className="space-y-2 text-neutral-500 dark:text-neutral-400">
                            <li><button onClick={() => navigate('/privacy')} className="hover:text-neutral-900 dark:hover:text-white transition-colors">Privacy Policy</button></li>
                            <li><button onClick={() => navigate('/terms')} className="hover:text-neutral-900 dark:hover:text-white transition-colors">Terms of Service</button></li>
                        </ul>
                    </div>
                    </div>
            </div>
            
            <div className="pt-8 border-t border-neutral-100 dark:border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs text-neutral-400">
                    {MARKETING.footer.copyright}
                </p>
                <div className="flex gap-6 text-neutral-400">
                    <a href="#" className="hover:text-neutral-900 dark:hover:text-white transition-colors"><span className="sr-only">Twitter</span>Twitter</a>
                    <a href="#" className="hover:text-neutral-900 dark:hover:text-white transition-colors"><span className="sr-only">GitHub</span>GitHub</a>
                </div>
            </div>
        </div>
    </footer>
  );
};
