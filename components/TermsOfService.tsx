
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command, ArrowLeft } from 'lucide-react';
import { MARKETING } from '../marketing';
import { Footer } from './Footer';

export const TermsOfService = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `Terms of Service | ${MARKETING.appName}`;
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 font-sans selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-black text-neutral-900 dark:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-800">
        <div className="max-w-4xl mx-auto px-6 h-16 flex justify-between items-center">
             <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                <div className="bg-neutral-900 dark:bg-white text-white dark:text-black p-1.5 rounded-lg">
                    <Command size={16} />
                </div>
                <span className="font-bold text-lg tracking-tight">{MARKETING.appName}</span>
            </div>
            <button 
                onClick={() => navigate('/')}
                className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white flex items-center gap-2 transition-colors"
            >
                <ArrowLeft size={16} /> Back
            </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
              By accessing and using {MARKETING.appName}, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this websites particular services, you shall be subject to any posted guidelines or rules applicable to such services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">2. Description of Service</h2>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
              {MARKETING.appName} provides a web-based invoicing and billing platform for freelancers and small businesses. We reserve the right to modify, suspend or discontinue the service with or without notice at any time and without any liability to you.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">3. User Accounts</h2>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
              You are responsible for maintaining the security of your account and password. {MARKETING.appName} cannot and will not be liable for any loss or damage from your failure to comply with this security obligation. You are responsible for all content posted and activity that occurs under your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">4. Payment, Refunds, and Subscriptions</h2>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
              Some parts of the Service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis (such as monthly or annually). Billing cycles are set on a regular basis, typically monthly.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400 mb-4">
                <li>Free accounts are subject to usage limits (e.g. number of invoices).</li>
                <li>Paid subscriptions offer additional features and higher limits.</li>
                <li>You may cancel your subscription at any time. Cancellation will take effect at the end of the current billing period.</li>
            </ul>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg border border-neutral-100 dark:border-neutral-700">
              <strong>Refund Policy:</strong> We offer a 14-day money-back guarantee on all initial subscription purchases. If you are not satisfied with the Service, you may request a full refund within 14 days of your initial purchase date by contacting support.
            </p>
          </section>
          
           <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">5. Intellectual Property</h2>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
              The service and its original content, features, and functionality are and will remain the exclusive property of {MARKETING.appName} and its licensors. The service is protected by copyright, trademark, and other laws.
            </p>
          </section>
          
           <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">6. Limitation of Liability</h2>
             <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
              In no event shall {MARKETING.appName}, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">7. Contact Us</h2>
             <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
              If you have any questions about these Terms, please contact us at support@invoycer.app.
            </p>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};
