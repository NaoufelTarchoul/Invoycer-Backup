
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command, ArrowLeft } from 'lucide-react';
import { MARKETING } from '../marketing';
import { Footer } from './Footer';

export const PrivacyPolicy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `Privacy Policy | ${MARKETING.appName}`;
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
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">1. Introduction</h2>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
              Welcome to {MARKETING.appName}. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you as to how we look after your personal data when you visit our website 
              (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">2. Data We Collect</h2>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
              We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
                <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                <li><strong>Contact Data:</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                <li><strong>Transaction Data:</strong> includes details about payments to and from you and other details of products and services you have purchased from us.</li>
                <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">3. How We Use Your Data</h2>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
                <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                <li>Where we need to comply with a legal or regulatory obligation.</li>
            </ul>
          </section>
          
           <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">4. Data Security</h2>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
            </p>
          </section>
          
           <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">5. Contact Us</h2>
             <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
              If you have any questions about this privacy policy or our privacy practices, please contact us at support@invoycer.app.
            </p>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};
