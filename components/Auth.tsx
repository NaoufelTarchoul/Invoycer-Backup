
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Mail, Lock, Loader2, ArrowRight, Sparkles, ArrowLeft, Menu, X, Star, ChevronDown, Check, Layout, Globe, FileText, Shield, CheckCircle2, Repeat, Clock, Users, Zap, User, Briefcase, KeyRound, Command } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { MARKETING } from '../marketing';
import { INDUSTRY_DATA } from '../data/marketing-content';
import { Footer } from './Footer';

export interface AuthProps {
  view?: 'login' | 'signup' | 'update_password';
}

export const Auth: React.FC<AuthProps> = ({ view = 'login' }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Internal view state to handle switching between login, signup, and forgot password
  // 'update_password' is passed as a prop when the user clicks the email link
  const [currentView, setCurrentView] = useState<'login' | 'signup' | 'forgot_password' | 'update_password'>(view);
  
  const { notify } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentView(view);
  }, [view]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (currentView === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        notify('success', 'Logged in successfully!');
        navigate('/dashboard');
      } else if (currentView === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        notify('success', 'Check your email for the confirmation link!');
      } else if (currentView === 'forgot_password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/#/update-password`,
        });
        if (error) throw error;
        notify('success', 'Password reset link sent to your email!');
        setCurrentView('login');
      } else if (currentView === 'update_password') {
        const { error } = await supabase.auth.updateUser({
          password: password
        });
        if (error) throw error;
        notify('success', 'Password updated successfully! Please log in.');
        navigate('/login');
      }
    } catch (error: any) {
      notify('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (currentView) {
      case 'login': return 'Welcome back';
      case 'signup': return 'Create an account';
      case 'forgot_password': return 'Reset Password';
      case 'update_password': return 'Set New Password';
      default: return 'Welcome';
    }
  };

  const getSubtitle = () => {
    switch (currentView) {
      case 'login': return 'Enter your details to access your dashboard.';
      case 'signup': return 'Start creating professional invoices today.';
      case 'forgot_password': return 'Enter your email to receive a reset link.';
      case 'update_password': return 'Enter your new password below.';
      default: return '';
    }
  };

  const getButtonText = () => {
     if (loading) return <Loader2 className="animate-spin" size={20} />;
     switch (currentView) {
       case 'login': return <>Sign In <ArrowRight size={18} /></>;
       case 'signup': return <>Sign Up <ArrowRight size={18} /></>;
       case 'forgot_password': return 'Send Reset Link';
       case 'update_password': return 'Update Password';
       default: return 'Submit';
     }
  };

  const inputClass = "w-full pl-9 pr-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm text-neutral-900 dark:text-white focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white outline-none transition-all placeholder-neutral-400";

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 p-4 font-sans">
      <div className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-2xl p-8 sm:p-10 border border-neutral-100 dark:border-neutral-700 shadow-sm">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors mb-8 group"
        >
           <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
           Back to Home
        </button>

        {/* Brand */}
        <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-lg flex items-center justify-center">
                <Command size={16} />
            </div>
            <span className="font-bold text-lg text-neutral-900 dark:text-white tracking-tight">Invoycer</span>
        </div>

        {/* Headings */}
        <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">
                {getTitle()}
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400">
                {getSubtitle()}
            </p>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-5">
          {currentView !== 'update_password' && (
            <div>
              <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase mb-2">Email Address</label>
              <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={inputClass}
                      placeholder="name@company.com"
                  />
              </div>
            </div>
          )}
          
          {currentView !== 'forgot_password' && (
            <div>
              <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase mb-2">
                {currentView === 'update_password' ? 'New Password' : 'Password'}
              </label>
              <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className={inputClass}
                      placeholder="••••••••"
                  />
              </div>
            </div>
          )}

          {currentView === 'login' && (
             <div className="flex justify-end">
                <button 
                  type="button"
                  onClick={() => setCurrentView('forgot_password')}
                  className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  Forgot password?
                </button>
             </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-bold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 mt-2"
          >
            {getButtonText()}
          </button>
        </form>

        {currentView !== 'update_password' && (
            <div className="mt-8 pt-6 border-t border-neutral-50 dark:border-neutral-700/50 text-center">
                {currentView === 'forgot_password' ? (
                   <p className="text-sm text-neutral-500 dark:text-neutral-400">
                     Remembered your password?{' '}
                     <button 
                         onClick={() => setCurrentView('login')} 
                         className="font-bold text-neutral-900 dark:text-white hover:underline"
                     >
                         Sign In
                     </button>
                   </p>
                ) : (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {currentView === 'login' ? "Don't have an account? " : "Already have an account? "}
                        <button 
                            onClick={() => {
                                setCurrentView(currentView === 'login' ? 'signup' : 'login');
                                // Also sync URL for better UX
                                if (currentView === 'login') navigate('/signup');
                                else navigate('/login');
                            }} 
                            className="font-bold text-neutral-900 dark:text-white hover:underline"
                        >
                            {currentView === 'login' ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

// --- LandingPage Component (Exported) ---
export const LandingPage = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    useEffect(() => {
        document.title = `${MARKETING.appName} | ${MARKETING.title}`;
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        setMobileMenuOpen(false);
    };

    // Icon mappings to keep component logic separate from text data
    const problemIcons = [Clock, Repeat, Mail];
    const featureIcons = [Repeat, Zap, CheckCircle2, Layout, Sparkles, FileText];
    const audienceIcons = [User, Briefcase, Users];

    return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-neutral-900 transition-colors duration-300 font-sans selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-black">
        
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-800 transition-all duration-300">
            <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <div className="bg-neutral-900 dark:bg-white text-white dark:text-black p-1.5 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                        <Command size={16} />
                    </div>
                    <span className="font-bold text-lg text-neutral-900 dark:text-white tracking-tight">{MARKETING.appName}</span>
                </div>
                
                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors bg-transparent border-none cursor-pointer">Features</button>
                    <button onClick={() => scrollToSection('pricing')} className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors bg-transparent border-none cursor-pointer">Pricing</button>
                    <button onClick={() => scrollToSection('faq')} className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors bg-transparent border-none cursor-pointer">FAQ</button>
                    
                    <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800"></div>

                    <button onClick={() => navigate('/login')} className="text-sm font-medium text-neutral-900 dark:text-white hover:opacity-70 transition-opacity bg-transparent border-none cursor-pointer">
                        Log In
                    </button>
                    <button 
                         onClick={() => navigate('/signup')}
                         className="bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-sm font-bold px-5 py-2.5 rounded-full transition-all hover:-translate-y-0.5"
                    >
                        Get Started
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <button className="md:hidden text-neutral-900 dark:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="absolute top-16 left-0 w-full bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 p-4 flex flex-col gap-2 md:hidden shadow-xl animate-in slide-in-from-top-2">
                    <button onClick={() => scrollToSection('features')} className="text-left px-4 py-3 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">Features</button>
                    <button onClick={() => scrollToSection('pricing')} className="text-left px-4 py-3 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">Pricing</button>
                    <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-2"></div>
                    <button onClick={() => navigate('/login')} className="w-full text-left px-4 py-3 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white font-bold">Log In</button>
                    <button onClick={() => navigate('/signup')} className="w-full bg-neutral-900 text-white dark:bg-white dark:text-black px-4 py-3 rounded-md font-bold">Get Started</button>
                </div>
            )}
        </nav>

        {/* Hero Section */}
        <div className="pt-32 pb-20 px-6 text-center max-w-5xl mx-auto">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-8 border border-neutral-100 dark:border-neutral-800 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                {MARKETING.hero.badge}
             </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-neutral-900 dark:text-white mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              {MARKETING.hero.titlePrefix} <br className="hidden md:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-neutral-600 via-neutral-900 to-neutral-600 dark:from-neutral-400 dark:via-white dark:to-neutral-400">{MARKETING.hero.titleHighlight}</span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
              {MARKETING.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
               <button 
                 onClick={() => navigate('/signup')}
                 className="w-full sm:w-auto px-8 py-4 bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-bold rounded-full transition-all flex items-center justify-center gap-2 text-base hover:scale-105 active:scale-95 duration-200"
               >
                 {MARKETING.hero.ctaPrimary} <ArrowRight size={18} />
               </button>
               <button 
                 onClick={() => navigate('/login')}
                 className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white font-bold rounded-full hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all hover:border-neutral-300 dark:hover:border-neutral-700"
               >
                 {MARKETING.hero.ctaSecondary}
               </button>
            </div>

            {/* Mockup / Abstract Visual */}
            <div className="relative mx-auto max-w-4xl animate-in fade-in zoom-in-95 duration-1000 delay-300">
                 <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20 dark:opacity-40 animate-pulse"></div>
                 <div className="relative rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden aspect-[16/10] md:aspect-[16/9] flex flex-col">
                    {/* Fake UI Header */}
                    <div className="h-10 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between px-4 bg-white dark:bg-neutral-900">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                        </div>
                        <div className="h-1.5 w-32 bg-neutral-100 dark:bg-neutral-800 rounded-full"></div>
                    </div>
                    {/* Fake UI Body */}
                    <div className="flex-1 flex bg-neutral-50 dark:bg-black">
                        {/* Sidebar */}
                        <div className="w-16 md:w-56 border-r border-neutral-100 dark:border-neutral-800 p-4 hidden md:flex flex-col gap-4 bg-white dark:bg-neutral-900">
                             <div className="h-8 w-8 bg-neutral-900 dark:bg-white rounded-lg mb-4"></div>
                             <div className="space-y-3">
                                 <div className="h-2 w-20 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                                 <div className="h-2 w-16 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                                 <div className="h-2 w-24 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                             </div>
                             <div className="mt-auto h-10 w-full bg-neutral-100 dark:bg-neutral-800 rounded-lg"></div>
                        </div>
                        
                        {/* Main Content */}
                        <div className="flex-1 p-4 md:p-8 overflow-hidden relative">
                            <div className="bg-white dark:bg-neutral-800 w-full h-full rounded-lg shadow-sm border border-neutral-100 dark:border-neutral-700 p-8 flex flex-col">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-md"></div>
                                    <div className="space-y-2 text-right">
                                        <div className="h-4 w-32 bg-neutral-100 dark:bg-neutral-700 rounded ml-auto"></div>
                                        <div className="h-8 w-20 bg-neutral-100 dark:bg-neutral-700 rounded ml-auto"></div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="h-4 w-full bg-neutral-50 dark:bg-neutral-700/50 rounded"></div>
                                    <div className="h-4 w-2/3 bg-neutral-50 dark:bg-neutral-700/50 rounded"></div>
                                    <div className="border-t border-dashed border-neutral-200 dark:border-neutral-700 my-4"></div>
                                    <div className="flex justify-between">
                                        <div className="h-4 w-24 bg-neutral-100 dark:bg-neutral-700 rounded"></div>
                                        <div className="h-4 w-24 bg-neutral-100 dark:bg-neutral-700 rounded"></div>
                                    </div>
                                </div>
                                
                                {/* Floating Element */}
                                <div className="absolute bottom-12 right-12 bg-neutral-900 text-white dark:bg-white dark:text-black px-4 py-2 rounded-full shadow-xl text-xs font-bold flex items-center gap-2 animate-bounce">
                                   <Repeat size={14} className="text-emerald-400" />
                                   Recurring Invoice Sent!
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>
            </div>
        </div>

        {/* Problem Section */}
        <div className="py-24 bg-white dark:bg-neutral-900 border-y border-neutral-100 dark:border-neutral-800">
             <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">{MARKETING.problem.title}</h2>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400">{MARKETING.problem.subtitle}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {MARKETING.problem.items.map((p, i) => {
                        const Icon = problemIcons[i] || Clock;
                        return (
                            <div key={i} className="p-8 bg-neutral-50 dark:bg-neutral-800/30 rounded-2xl text-center md:text-left">
                                <div className="w-12 h-12 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-xl flex items-center justify-center mb-6 mx-auto md:mx-0">
                                    <Icon size={24} />
                                </div>
                                <h3 className="font-bold text-xl text-neutral-900 dark:text-white mb-3">{p.title}</h3>
                                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">{p.desc}</p>
                            </div>
                        );
                    })}
                </div>
             </div>
        </div>

        {/* Features Grid (Solution) */}
        <div id="features" className="py-32 px-6 max-w-6xl mx-auto scroll-mt-20">
            <div className="text-center mb-20 max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">{MARKETING.features.title}</h2>
                <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">{MARKETING.features.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {MARKETING.features.items.map((feature, idx) => {
                    const Icon = featureIcons[idx] || Sparkles;
                    return (
                        <div key={idx} className="group p-8 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-500 transition-all hover:-translate-y-1">
                            <div className="w-12 h-12 bg-neutral-50 dark:bg-neutral-700 rounded-xl flex items-center justify-center mb-6 text-neutral-900 dark:text-white group-hover:scale-110 transition-transform duration-300">
                                <Icon size={24} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">{feature.title}</h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{feature.desc}</p>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Audience Section */}
        <div className="py-24 bg-neutral-900 text-white overflow-hidden relative isolate">
            <div className="absolute inset-0 -z-10 opacity-20">
                 <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500 rounded-full blur-[128px]"></div>
                 <div className="absolute left-0 bottom-0 w-96 h-96 bg-blue-500 rounded-full blur-[128px]"></div>
            </div>
            
            <div className="max-w-6xl mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-16 tracking-tight">{MARKETING.audience.title}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     {MARKETING.audience.items.map((item, i) => {
                         const Icon = audienceIcons[i] || Users;
                         return (
                             <div key={i} className="bg-neutral-800/50 p-8 rounded-2xl border border-neutral-700/50 hover:bg-neutral-800 transition-colors">
                                <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center mb-6 mx-auto text-white">
                                    <Icon size={32}/>
                                </div>
                                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                <p className="text-neutral-400 leading-relaxed text-sm">{item.desc}</p>
                             </div>
                         );
                     })}
                </div>
            </div>
        </div>

        {/* Workflow Section (Solution) */}
        <div className="py-24 bg-white dark:bg-neutral-900">
             <div className="max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">{MARKETING.workflow.title}</h2>
                        <div className="space-y-8">
                            {MARKETING.workflow.steps.map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <span className="font-mono text-neutral-300 dark:text-neutral-600 text-xl font-bold">{item.step}</span>
                                    <div>
                                        <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-2">{item.title}</h3>
                                        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">{item.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-8 border border-neutral-100 dark:border-neutral-700">
                         {/* Visual representation of a schedule */}
                         <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6 mb-4 flex items-center gap-4 border border-neutral-100 dark:border-neutral-800">
                             <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
                                 <Repeat size={24} />
                             </div>
                             <div>
                                 <p className="font-bold text-neutral-900 dark:text-white">Monthly Retainer</p>
                                 <p className="text-xs text-neutral-500">Next send: October 1st, 9:00 AM</p>
                             </div>
                             <div className="ml-auto">
                                 <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Active</span>
                             </div>
                         </div>
                         <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6 opacity-60 flex items-center gap-4 border border-neutral-100 dark:border-neutral-800">
                             <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                                 <Repeat size={24} />
                             </div>
                             <div>
                                 <p className="font-bold text-neutral-900 dark:text-white">Maintenance Fee</p>
                                 <p className="text-xs text-neutral-500">Next send: October 15th, 9:00 AM</p>
                             </div>
                              <div className="ml-auto">
                                 <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Active</span>
                             </div>
                         </div>
                    </div>
                </div>
             </div>
        </div>

        {/* Pricing */}
        <div id="pricing" className="py-24 px-6 max-w-6xl mx-auto scroll-mt-20 border-t border-neutral-100 dark:border-neutral-800">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">{MARKETING.pricing.title}</h2>
                <p className="text-neutral-600 dark:text-neutral-400">{MARKETING.pricing.subtitle}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {MARKETING.pricing.plans.map((plan, i) => (
                    <div key={i} className={`p-8 rounded-2xl border flex flex-col ${plan.primary ? 'border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white text-white dark:text-black shadow-2xl scale-105 z-10' : 'border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white'}`}>
                        <div className="mb-8">
                            <h3 className="font-bold text-lg mb-2">{plan.name}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                                <span className={`text-sm ${plan.primary ? 'text-neutral-400 dark:text-neutral-500' : 'text-neutral-500'}`}>/month</span>
                            </div>
                            <p className={`text-sm mt-4 ${plan.primary ? 'text-neutral-400 dark:text-neutral-500' : 'text-neutral-500'}`}>{plan.desc}</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            {plan.features.map((f, k) => (
                                <li key={k} className="flex items-center gap-3 text-sm font-medium">
                                    <Check size={16} className={plan.primary ? 'text-emerald-400 dark:text-emerald-600' : 'text-neutral-900 dark:text-white'} />
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <button 
                            onClick={() => navigate('/signup')}
                            className={`w-full py-3 rounded-lg font-bold transition-all ${plan.primary ? 'bg-white text-black hover:bg-neutral-200 dark:bg-black dark:text-white' : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600'}`}
                        >
                            {plan.cta}
                        </button>
                    </div>
                ))}
            </div>
        </div>

        {/* FAQ */}
        <div id="faq" className="py-24 px-6 max-w-3xl mx-auto scroll-mt-20 border-t border-neutral-100 dark:border-neutral-800">
            <h2 className="text-3xl font-bold text-center mb-12 text-neutral-900 dark:text-white">{MARKETING.faq.title}</h2>
            <div className="space-y-4">
                {MARKETING.faq.items.map((item, i) => (
                    <div key={i} className="border border-neutral-100 dark:border-neutral-800 rounded-lg overflow-hidden">
                        <button 
                            onClick={() => setOpenFaq(openFaq === i ? null : i)}
                            className="w-full flex justify-between items-center p-6 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                        >
                            <span className="font-bold text-neutral-900 dark:text-white">{item.q}</span>
                            <ChevronDown size={20} className={`text-neutral-500 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                        </button>
                        <div className={`px-6 text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                            {item.a}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* SEO Support Section */}
        <div className="py-12 px-6 bg-neutral-50 dark:bg-neutral-900 text-center border-t border-neutral-100 dark:border-neutral-800">
             <div className="max-w-4xl mx-auto">
                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                   {MARKETING.seo.description}
                </p>
             </div>
        </div>

        {/* Footer */}
        <Footer />
    </div>
    );
};
