
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { INDUSTRY_DATA } from '../data/marketing-content';
import { Sparkles, ArrowRight, CheckCircle2, Star, Shield, Command, Zap, Check, ListChecks, ChevronDown, Quote, Layout } from 'lucide-react';
import { MARKETING } from '../marketing';
import { Footer } from './Footer';

export const IndustryTemplate = () => {
  const { industry } = useParams();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  // 1. Get Data based on URL param
  const content = industry ? INDUSTRY_DATA[industry] : null;

  // 2. SEO Title Injection & Scroll Reset
  useEffect(() => {
    // Reset scroll position when switching templates
    window.scrollTo(0, 0);

    if (content) {
      document.title = `${content.title} | ${MARKETING.appName}`;
      
      // Attempt to update meta description dynamically (Good for SPA SEO)
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', content.metaDescription);
      }
    }
  }, [content]);

  // 3. Handle 404 - If industry doesn't exist, go home
  if (!content) {
    return <Navigate to="/" replace />;
  }

  // Fallback default features if specific SEO section is not provided
  const features = content.seoSection?.items || [
    { title: "Recurring Billing", desc: "Set it and forget it. Perfect for maintenance retainers." },
    { title: "Professional", desc: "Clean, unbranded PDF exports that make you look like a pro." },
    { title: "AI Assisted", desc: "Let AI write your invoice items and polite payment terms." }
  ];

  const featuresTitle = content.seoSection?.title || "Why freelancers use Invoycer";

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 font-sans selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-black">
      
      {/* Simple Header */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
             <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                <div className="bg-neutral-900 dark:bg-white text-white dark:text-black p-1.5 rounded-lg">
                    <Command size={16} />
                </div>
                <span className="font-bold text-lg text-neutral-900 dark:text-white tracking-tight">{MARKETING.appName}</span>
            </div>
            <button 
                onClick={() => navigate('/signup')}
                className="bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-sm font-bold px-5 py-2 rounded-full transition-all"
            >
                Get Started
            </button>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-xs font-bold text-blue-600 dark:text-blue-400 mb-6 uppercase tracking-wider">
                Free {content.title}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 dark:text-white mb-6 tracking-tight">
                {content.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                {content.heroSubtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
               <button 
                 onClick={() => navigate('/signup')}
                 className="w-full sm:w-auto px-8 py-4 bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-bold rounded-full transition-all flex items-center justify-center gap-2 text-base hover:scale-105"
               >
                 Create This Invoice Now <ArrowRight size={18} />
               </button>
            </div>
        </div>

        {/* Invoice Preview Mockup */}
        <div className="max-w-3xl mx-auto bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden transform hover:scale-[1.01] transition-transform duration-500">
            <div className="bg-neutral-50 dark:bg-neutral-900 p-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="text-xs font-mono text-neutral-400">invoice_preview.pdf</div>
            </div>
            <div className="p-8 md:p-12">
                <div className="flex justify-between mb-12">
                    <div>
                        <div className="h-8 w-32 bg-neutral-900 dark:bg-white rounded mb-2"></div>
                        <div className="h-4 w-48 bg-neutral-100 dark:bg-neutral-700 rounded"></div>
                    </div>
                    <div className="text-right">
                        <div className="h-10 w-10 bg-neutral-100 dark:bg-neutral-700 rounded-full ml-auto mb-2"></div>
                        <div className="h-4 w-24 bg-neutral-100 dark:bg-neutral-700 rounded ml-auto"></div>
                    </div>
                </div>
                
                {/* Dynamic Line Item based on Industry */}
                <div className="border-t border-b border-neutral-100 dark:border-neutral-700 py-4 mb-8">
                    <div className="flex justify-between items-center font-bold text-neutral-900 dark:text-white text-sm md:text-base">
                        <span>{content.invoiceDefaults.itemDesc}</span>
                        <span>${content.invoiceDefaults.price.toFixed(2)}</span>
                    </div>
                </div>

                <div className="flex justify-end">
                    <div className="text-right">
                        <div className="text-xs text-neutral-500 uppercase font-bold">Total Due</div>
                        <div className="text-3xl font-bold text-neutral-900 dark:text-white">${content.invoiceDefaults.price.toFixed(2)}</div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* SEO Content / Features */}
      <div className="bg-neutral-50 dark:bg-neutral-800/50 py-20 px-6 border-y border-neutral-100 dark:border-neutral-800">
          <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-12 text-center">{featuresTitle}</h2>
              <div className="grid md:grid-cols-3 gap-8">
                  {/* Feature 1 */}
                  <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
                      <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
                          <CheckCircle2 size={20} />
                      </div>
                      <h3 className="font-bold text-neutral-900 dark:text-white mb-2">{features[0].title}</h3>
                      <p className="text-sm text-neutral-500">{features[0].desc}</p>
                  </div>
                  
                  {/* Feature 2 */}
                  <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                          <Shield size={20} />
                      </div>
                      <h3 className="font-bold text-neutral-900 dark:text-white mb-2">{features[1].title}</h3>
                      <p className="text-sm text-neutral-500">{features[1].desc}</p>
                  </div>

                  {/* Feature 3 */}
                  <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                          <Star size={20} />
                      </div>
                      <h3 className="font-bold text-neutral-900 dark:text-white mb-2">{features[2].title}</h3>
                      <p className="text-sm text-neutral-500">{features[2].desc}</p>
                  </div>
              </div>
          </div>
      </div>

      {/* Dynamic Workflow Section */}
      {content.workflowSection && (
        <div className="py-20 px-6 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-12 text-center">{content.workflowSection.title}</h2>
                <div className="space-y-8">
                    {content.workflowSection.steps.map((step, i) => (
                        <div key={i} className="flex gap-6 items-start">
                            <span className="font-mono text-4xl text-neutral-200 dark:text-neutral-700 font-bold leading-none select-none">{step.number}</span>
                            <div>
                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">{step.title}</h3>
                                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* Dynamic Cheat Sheet Section */}
      {content.cheatSheet && (
          <div className="py-24 px-6 bg-neutral-900 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[120px] opacity-10"></div>
               <div className="max-w-4xl mx-auto relative z-10">
                   <div className="text-center mb-16">
                       <h2 className="text-3xl font-bold mb-4">{content.cheatSheet.title}</h2>
                       <p className="text-lg text-neutral-400 max-w-2xl mx-auto">{content.cheatSheet.subtitle}</p>
                   </div>
                   
                   <div className="grid sm:grid-cols-2 gap-4">
                       {content.cheatSheet.items.map((item, i) => (
                           <div key={i} className="flex items-center gap-3 bg-neutral-800/50 p-4 rounded-xl border border-neutral-800">
                               <div className="w-6 h-6 rounded-full bg-emerald-900/50 text-emerald-400 flex items-center justify-center flex-shrink-0">
                                   <ListChecks size={14} />
                               </div>
                               <span className="font-medium text-neutral-200">{item}</span>
                           </div>
                       ))}
                   </div>
                   
                   <div className="mt-12 text-center">
                       <button 
                           onClick={() => navigate('/signup')}
                           className="bg-white text-black hover:bg-neutral-200 px-8 py-3 rounded-full font-bold transition-all hover:scale-105"
                       >
                           Generate Invoice with these Items
                       </button>
                   </div>
               </div>
          </div>
      )}

      {/* Dynamic Comparison Section */}
      {content.comparisonSection && (
        <div className="py-24 px-6 bg-neutral-50 dark:bg-neutral-800/30">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">{content.comparisonSection.title}</h2>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400">{content.comparisonSection.subtitle}</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                    {content.comparisonSection.features.map((item, i) => (
                        <div key={i} className="bg-white dark:bg-neutral-900 p-8 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
                            <div className="mb-4 text-emerald-500">
                                <Check size={24} />
                            </div>
                            <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-3">{item.title}</h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{item.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* Dynamic FAQ Section */}
      {content.faqSection && (
          <div className="py-24 px-6 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800">
              <div className="max-w-3xl mx-auto">
                  <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-12 text-center">{content.faqSection.title}</h2>
                  <div className="space-y-4">
                      {content.faqSection.items.map((item, i) => (
                          <div key={i} className="border border-neutral-100 dark:border-neutral-800 rounded-lg overflow-hidden">
                              <button 
                                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                  className="w-full flex justify-between items-center p-6 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                              >
                                  <span className="font-bold text-neutral-900 dark:text-white text-lg">{item.q}</span>
                                  <ChevronDown size={20} className={`text-neutral-500 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                              </button>
                              <div className={`px-6 text-neutral-600 dark:text-neutral-400 leading-relaxed overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-60 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                                  {item.a}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* Dynamic Testimonials Section (New) */}
      {content.testimonials && (
          <div className="py-24 px-6 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800">
              <div className="max-w-4xl mx-auto">
                  <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-12 text-center">Trusted by Industry Professionals</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                      {content.testimonials.map((item, i) => (
                          <div key={i} className="bg-white dark:bg-neutral-800 p-8 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm relative">
                              <Quote className="absolute top-6 right-6 text-neutral-100 dark:text-neutral-700" size={48} />
                              <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed mb-6 relative z-10 font-medium">"{item.text}"</p>
                              <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center font-bold text-neutral-600 dark:text-neutral-300 text-sm">
                                      {item.avatarInitials}
                                  </div>
                                  <div>
                                      <p className="font-bold text-neutral-900 dark:text-white text-sm">{item.author}</p>
                                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.role}</p>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* Dynamic Related Templates Section (New) */}
      {content.relatedTemplates && (
          <div className="py-20 px-6 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800">
              <div className="max-w-4xl mx-auto text-center">
                  <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-6">Explore Other Templates</p>
                  <div className="flex flex-wrap justify-center gap-4">
                      {content.relatedTemplates.map((item, i) => (
                          <button
                              key={i} 
                              onClick={() => navigate(`/templates/${item.slug}`)}
                              className="group flex items-center gap-3 px-6 py-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:border-neutral-400 dark:hover:border-neutral-500 transition-all text-left"
                          >
                              <Layout size={20} className="text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
                              <span className="font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                                  {item.title}
                              </span>
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* Call to Action Footer */}
      <div className="py-20 px-6 bg-neutral-900 dark:bg-white text-center">
          <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-white dark:text-black mb-6">Ready to professionalize your billing?</h2>
              <p className="text-neutral-400 dark:text-neutral-600 mb-8 text-lg">Start creating free invoices today. No credit card required.</p>
              <button 
                 onClick={() => navigate('/signup')}
                 className="bg-white hover:bg-neutral-100 dark:bg-black dark:hover:bg-neutral-800 text-black dark:text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105"
               >
                 Get Started for Free
               </button>
          </div>
      </div>

      <Footer />
    </div>
  );
};
