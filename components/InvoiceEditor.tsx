
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Sparkles, Save, ArrowLeft, Download, Palette, Type, Loader2, Moon, Sun, Upload, Image as ImageIcon, X, ChevronDown, ChevronRight, ChevronLeft, Mail, Users, Eye, PenTool, Landmark, CreditCard, Bitcoin, CalendarClock, Clock, Calendar as CalendarIcon, Repeat, Send, Check, Paperclip, Zap, Hash, FileText, User, Building, MapPin, Phone, Globe, Wallet, Activity, Tag, Link, Percent } from 'lucide-react';
import { Invoice, InvoiceItem, Client, PaymentMethod, UserProfile, NotificationType } from '../types';
import { InvoicePreview } from './InvoicePreview';
import { generatePaymentTerms, improveDescription, generateEmailDraft } from '../services/geminiService';
import { CURRENCIES, MONTHS, THEMES, FONTS } from '../constants';
import { AddressAutocomplete } from './AddressAutocomplete';
import { supabase } from '../services/supabaseClient';

interface InvoiceEditorProps {
  initialInvoice: Invoice;
  savedClients: Client[];
  onSave: (invoice: Invoice) => Promise<void>;
  onCancel: () => void;
  darkMode: boolean,
  toggleDarkMode: () => void,
  userProfile: UserProfile | null;
  notify: (type: NotificationType, message: string) => void;
  onTriggerUpgrade?: (reason: string) => void;
}

export const InvoiceEditor: React.FC<InvoiceEditorProps> = ({ initialInvoice, savedClients, onSave, onCancel, darkMode, toggleDarkMode, userProfile, notify, onTriggerUpgrade }) => {
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice>(initialInvoice);
  const [loadingAi, setLoadingAi] = useState<string | null>(null);
  const [loadingEmailAi, setLoadingEmailAi] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const fontMenuRef = useRef<HTMLDivElement>(null);
  
  // Email Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [activeEmailTab, setActiveEmailTab] = useState<'write' | 'preview'>('write');
  const [emailDraft, setEmailDraft] = useState({
      to: '',
      subject: '',
      body: ''
  });
  
  // Calendar State
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());

  // Mobile View State
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  
  // State for accordion sections
  const [expandedSections, setExpandedSections] = useState({
    sender: true,
    recipient: true,
    payment: true
  });

  // Determine Subscription Status
  const isPaidPlan = userProfile?.subscription_plan && userProfile.subscription_plan !== 'free';
  const showBranding = !isPaidPlan;

  // Initialize calendar view when scheduler opens
  useEffect(() => {
    if (showScheduler) {
      if (invoice.scheduledDate) {
        setCalendarViewDate(new Date(invoice.scheduledDate));
      } else {
        setCalendarViewDate(new Date());
      }
    }
  }, [showScheduler]);

  // Close font menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fontMenuRef.current && !fontMenuRef.current.contains(event.target as Node)) {
        setShowFontMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleSection = (section: 'sender' | 'recipient' | 'payment') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getDateComponents = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return { month: 0, day: 1, year: new Date().getFullYear() };
    return {
      month: date.getMonth(),
      day: date.getDate(),
      year: date.getFullYear()
    };
  };

  const handleInputChange = (field: keyof Invoice, value: string | number) => {
    setInvoice((prev) => ({ ...prev, [field]: value }));
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setInvoice(prev => ({ ...prev, paymentMethod: method }));
  };

  const handleDatePartChange = (field: 'date' | 'dueDate', part: 'month' | 'day' | 'year', value: number) => {
    const currentParts = getDateComponents(invoice[field]);
    const newParts = { ...currentParts, [part]: value };
    const daysInMonth = new Date(newParts.year, newParts.month + 1, 0).getDate();
    const safeDay = Math.min(newParts.day, daysInMonth);
    const newDate = new Date(Date.UTC(newParts.year, newParts.month, safeDay));
    const dateString = newDate.toISOString().split('T')[0];

    setInvoice((prev) => {
      const updates: Partial<Invoice> = { [field]: dateString };
      if (field === 'date' && part === 'month') {
        updates.title = `${MONTHS[value].toUpperCase()} INVOICE`;
      }
      return { ...prev, ...updates };
    });
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: 'New Item',
      quantity: 1,
      unitPrice: 0,
    };
    setInvoice((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (id: string) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const handleAiPaymentTerms = async () => {
    setLoadingAi('terms');
    const terms = await generatePaymentTerms(invoice.title, invoice.senderName);
    setInvoice(prev => ({ ...prev, notes: terms }));
    setLoadingAi(null);
  };

  const handleAiDescription = async (itemId: string, currentDesc: string) => {
    setLoadingAi(`desc-${itemId}`);
    const newDesc = await improveDescription(currentDesc);
    handleItemChange(itemId, 'description', newDesc);
    setLoadingAi(null);
  };

  const handleAiEmailGenerate = async () => {
    setLoadingEmailAi(true);
    const total = invoice.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0).toFixed(2);
    
    // Updated prompt for hybrid context
    const draft = await generateEmailDraft({
      number: invoice.number,
      amount: `${invoice.currencySymbol}${total}`,
      dueDate: invoice.dueDate,
      senderName: invoice.senderName,
      recipientName: invoice.recipientName || 'Valued Client'
    });

    if (draft.subject && draft.body) {
      setEmailDraft(prev => ({
        ...prev,
        subject: draft.subject,
        body: draft.body
      }));
    }
    setLoadingEmailAi(false);
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      notify('error', 'Logo must be smaller than 2MB');
      return;
    }

    notify('info', 'Uploading logo...');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
         notify('error', 'You must be logged in to upload images.');
         return;
      }

      // 1. Upload to Supabase
      const fileExt = file.name.split('.').pop();
      const fileName = `logo_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('invoice_files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false 
        });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data } = supabase.storage
        .from('invoice_files')
        .getPublicUrl(filePath);

      // 3. Update State
      setInvoice(prev => ({ ...prev, logo: data.publicUrl }));
      notify('success', 'Logo uploaded successfully');

    } catch (error: any) {
      console.error('Logo upload error:', error);
      notify('error', 'Failed to upload logo.');
    }
  };

  const removeLogo = () => {
    setInvoice(prev => ({ ...prev, logo: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectClient = (client: Client) => {
    setInvoice(prev => {
      let currencySymbol = prev.currencySymbol;
      if (client.default_currency) {
        switch(client.default_currency) {
          case 'USD': currencySymbol = '$'; break;
          case 'EUR': currencySymbol = '€'; break;
          case 'GBP': currencySymbol = '£'; break;
          case 'CAD': currencySymbol = 'CA$'; break;
          case 'AUD': currencySymbol = 'AU$'; break;
        }
      }

      let updatedItems = [...prev.items];
      if (updatedItems.length > 0) {
        if (client.default_price !== undefined && client.default_price !== null) {
          updatedItems[0].unitPrice = client.default_price;
        }
        if (client.default_invoice_description) {
          updatedItems[0].description = client.default_invoice_description;
        }
      }

      return {
        ...prev,
        recipientName: client.name,
        recipientEmail: client.email,
        recipientAddress: client.address,
        recipientPhone: client.phone,
        recipientVat: client.vat || '',
        currencySymbol,
        items: updatedItems
      };
    });
    setShowClientSelector(false);
  };

  // Modified to accept an optional invoice override and return the saved invoice
  const handleSaveClick = async (invoiceData: Invoice = invoice, redirect: boolean = true): Promise<Invoice | null> => {
    setIsSaving(true);
    try {
        let publicPdfUrl = invoiceData.pdfUrl;

        // 1. Generate and Upload PDF logic
        const element = document.querySelector('.invoice-preview-container');
        
        // @ts-ignore
        if (typeof window.html2pdf !== 'undefined' && element) {
            try {
                const opt = {
                    margin: 0.5,
                    filename: `${invoiceData.number}_${invoiceData.recipientName || 'Invoice'}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
                    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
                };

                // Generate Blob
                // @ts-ignore
                const pdfBlob = await window.html2pdf().set(opt).from(element).output('blob');

                // Get User for path
                const { data: { user } } = await supabase.auth.getUser();
                
                if (user) {
                    const filePath = `${user.id}/${invoiceData.id}.pdf`;
                    
                    // 1. Optimistically try to remove the file to ensure we don't have stale versions
                    await supabase.storage
                        .from('invoice_files')
                        .remove([filePath]);

                    // 2. Upload to Supabase Storage
                    const { error: uploadError } = await supabase.storage
                        .from('invoice_files')
                        .upload(filePath, pdfBlob, {
                            contentType: 'application/pdf',
                            upsert: true,
                            cacheControl: '0' // Prevent caching
                        });
                    
                    if (!uploadError) {
                        // Get Public URL
                        const { data } = supabase.storage
                            .from('invoice_files')
                            .getPublicUrl(filePath);
                        
                        publicPdfUrl = `${data.publicUrl}?t=${Date.now()}`;
                    } else {
                        console.error('PDF Upload Error:', uploadError);
                    }
                }
            } catch (pdfError) {
                console.error('PDF Generation Failed:', pdfError);
            }
        }

        // 2. Update Invoice with URL (if successful) and Save to DB
        const updatedInvoice = { ...invoiceData, pdfUrl: publicPdfUrl };
        setInvoice(updatedInvoice);
        await onSave(updatedInvoice);

        if (redirect) {
          navigate('/');
        }
        
        return updatedInvoice;

    } catch (e) {
        console.error("Error saving:", e);
        notify('error', "Error saving invoice.");
        return null;
    } finally {
        setIsSaving(false);
    }
  };

  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    const element = document.querySelector('.invoice-preview-container');
    // @ts-ignore
    if (typeof window.html2pdf === 'undefined' || !element) {
      notify('info', 'PDF generator is loading, please try again in a moment.');
      setIsGeneratingPdf(false);
      return;
    }

    const opt = {
      margin: 0.5,
      filename: `${invoice.number}_${invoice.recipientName || 'Invoice'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore
    window.html2pdf().set(opt).from(element).save().then(() => {
      setIsGeneratingPdf(false);
    }).catch((err: any) => {
      console.error('PDF generation failed', err);
      setIsGeneratingPdf(false);
      notify('error', 'Failed to generate PDF. You can try using the browser print option (Ctrl+P).');
    });
  };

  const handlePrepareEmail = () => {
    // Check for Paid Plan
    if (!isPaidPlan) {
        if (onTriggerUpgrade) {
            onTriggerUpgrade('Email Sending');
        } else {
            notify('info', "✨ Sending invoices directly is a Pro feature. Upgrade to Pro to send instantly.");
        }
        return;
    }

    const total = invoice.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0).toFixed(2);
    
    // Prefer saved draft if available
    if (invoice.emailSubject || invoice.emailBody) {
        setEmailDraft({
            to: invoice.recipientEmail || '',
            subject: invoice.emailSubject || `Invoice ${invoice.number} from ${invoice.senderName}`,
            body: invoice.emailBody || ''
        });
    } else {
        // Updated body without raw link
        setEmailDraft({
            to: invoice.recipientEmail || '',
            subject: `Invoice ${invoice.number} from ${invoice.senderName}`,
            body: `Dear ${invoice.recipientName || 'Client'},\n\nPlease find attached invoice ${invoice.number} for ${invoice.currencySymbol}${total}.\n\nPayment is due by ${new Date(invoice.dueDate).toLocaleDateString()}.\n\nThank you for your business.`
        });
    }
    
    setActiveEmailTab('write');
    setShowEmailModal(true);
  };
  
  const generateHtmlEmail = (bodyText: string) => {
    const total = invoice.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0).toFixed(2);
    const logoHtml = invoice.logo 
        ? `<img src="${invoice.logo}" alt="${invoice.senderName}" style="max-height: 40px; margin-bottom: 24px;" />` 
        : `<h2 style="margin: 0 0 24px 0; color: #171717; font-size: 20px;">${invoice.senderName}</h2>`;

    const publicUrl = `${window.location.origin}/#/p/${invoice.id}`;

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Invoice ${invoice.number}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Plus Jakarta Sans', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); margin: 0 auto;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 0 40px; text-align: center;">
                            ${logoHtml}
                        </td>
                    </tr>

                    <!-- Hero Amount -->
                    <tr>
                        <td style="padding: 0 40px; text-align: center;">
                            <p style="margin: 0; color: #737373; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Amount Due</p>
                            <h1 style="margin: 8px 0 0 0; color: #171717; font-size: 36px; font-weight: 700; letter-spacing: -1px;">${invoice.currencySymbol}${total}</h1>
                            <p style="margin: 8px 0 24px 0; color: #ef4444; font-size: 12px; font-weight: 500;">Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}</p>
                        </td>
                    </tr>

                    <!-- Action Button -->
                    <tr>
                        <td style="padding: 0 40px 32px 40px; text-align: center;">
                            <a href="${publicUrl}" target="_blank" style="display: inline-block; background-color: #171717; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 6px; transition: background-color 0.2s;">View Invoice</a>
                        </td>
                    </tr>

                    <!-- Message Body -->
                    <tr>
                        <td style="padding: 32px 40px; background-color: #fafafa; border-top: 1px solid #f5f5f5;">
                            <div style="color: #525252; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${bodyText}</div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; background-color: #ffffff; border-top: 1px solid #f5f5f5; text-align: center;">
                            <p style="margin: 0; color: #a3a3a3; font-size: 12px;">${invoice.senderName}</p>
                            <p style="margin: 4px 0 0 0; color: #d4d4d4; font-size: 10px;">${invoice.senderAddress.replace(/\n/g, ', ')}</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
  };

  const handleLaunchEmailClient = () => {
      // Save draft before launching
      setInvoice(prev => ({
          ...prev,
          emailSubject: emailDraft.subject,
          emailBody: emailDraft.body
      }));

      const mailtoLink = `mailto:${emailDraft.to}?subject=${encodeURIComponent(emailDraft.subject)}&body=${encodeURIComponent(emailDraft.body)}`;
      
      const link = document.createElement('a');
      link.href = mailtoLink;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setShowEmailModal(false);
  };

  const handleSendEmail = async () => {
    setIsSendingEmail(true);

    try {
        // 1. Prepare invoice with current email draft content
        const currentInvoiceState = {
            ...invoice,
            emailSubject: emailDraft.subject,
            emailBody: emailDraft.body
        };

        notify('info', 'Saving invoice and generating PDF...');
        
        // 2. Auto-save first (Generates PDF + Saves to DB), prevent redirect
        const savedInvoice = await handleSaveClick(currentInvoiceState, false);
        
        if (!savedInvoice || !savedInvoice.pdfUrl) {
             throw new Error("Could not generate PDF. Please ensure the preview is loaded.");
        }

        const htmlContent = generateHtmlEmail(emailDraft.body);

        // 3. Send Email
        const { data, error } = await supabase.functions.invoke('send-email', {
            body: {
                to: emailDraft.to,
                subject: emailDraft.subject,
                body: emailDraft.body, // Fallback plain text
                html: htmlContent,     // Rich HTML content
                pdfUrl: savedInvoice.pdfUrl,
                // Add Reply-To and Sender Name for white-labeling
                replyTo: savedInvoice.senderEmail,
                senderName: savedInvoice.senderName
            }
        });
        
        if (error) {
            console.error('Supabase Function raw error:', error);
            
            let detailedMessage = "";

            // Try to extract JSON error message from the response context if available
            // @ts-ignore
            if (error.context && typeof error.context.json === 'function') {
                try {
                    // @ts-ignore
                    const errorResponse = await error.context.clone().json();
                    if (errorResponse && errorResponse.error) {
                        detailedMessage = errorResponse.error;
                    }
                } catch (jsonError) {
                    // If JSON parsing fails, try text
                    try {
                        // @ts-ignore
                         detailedMessage = await error.context.clone().text();
                    } catch (textError) {
                        console.error('Failed to parse error body', textError);
                    }
                }
            }

            // Fallback to error.message if we couldn't get a better one
            const finalMessage = detailedMessage || error.message || "Failed to send email.";
            
            throw new Error(finalMessage);
        }

        setInvoice(prev => ({ ...prev, emailStatus: 'sent' }));
        setShowEmailModal(false);
        notify('success', "Email sent successfully!");
        
    } catch (e: any) {
        console.error("Handler caught error:", e);
        notify('error', `Error sending email: ${e.message}`);
    } finally {
        setIsSendingEmail(false);
    }
  };

  const handleSwitchToSchedule = () => {
      // Save draft
      setInvoice(prev => ({
          ...prev,
          emailSubject: emailDraft.subject,
          emailBody: emailDraft.body
      }));
      setShowEmailModal(false);
      setShowScheduler(true);
  };

  // Scheduler Logic
  const handleConfirmSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let scheduledDateISO = '';

    if (invoice.scheduledDate) {
        scheduledDateISO = invoice.scheduledDate;
    } else {
        // Default to tomorrow 9 AM if not set
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        scheduledDateISO = tomorrow.toISOString();
    }

    // 1. Create updated invoice object with scheduled status
    const scheduledInvoice = {
        ...invoice,
        scheduledDate: scheduledDateISO,
        emailStatus: 'scheduled' as const,
        emailSubject: emailDraft.subject || `Invoice ${invoice.number} from ${invoice.senderName}`,
        emailBody: emailDraft.body || `Please find attached invoice ${invoice.number}.`,
        recipientEmail: emailDraft.to || invoice.recipientEmail
    };

    // 2. Update local state
    setInvoice(scheduledInvoice);
    setShowScheduler(false);

    // 3. Trigger immediate save to generate PDF and upload to DB
    notify('info', 'Scheduling invoice and generating PDF...');
    // Redirect to dashboard after scheduling
    await handleSaveClick(scheduledInvoice, true);
  };
  
  const handleDateSelect = (day: number) => {
      const newDate = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth(), day);
      
      // Preserve time if already set, otherwise default to 9 AM
      if (invoice.scheduledDate) {
          const current = new Date(invoice.scheduledDate);
          newDate.setHours(current.getHours());
          newDate.setMinutes(current.getMinutes());
      } else {
          newDate.setHours(9, 0, 0, 0);
      }
      
      setInvoice(prev => ({ ...prev, scheduledDate: newDate.toISOString() }));
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const [hours, minutes] = e.target.value.split(':').map(Number);
      const current = invoice.scheduledDate ? new Date(invoice.scheduledDate) : new Date();
      current.setHours(hours);
      current.setMinutes(minutes);
      // Ensure date part matches the calendar selection if we are initializing from "now"
      if (!invoice.scheduledDate) {
          current.setFullYear(calendarViewDate.getFullYear());
          current.setMonth(calendarViewDate.getMonth());
          current.setDate(calendarViewDate.getDate());
      }
      setInvoice(prev => ({ ...prev, scheduledDate: current.toISOString() }));
  };

  const changeMonth = (delta: number) => {
      setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + delta, 1));
  };
  
  const setQuickSchedule = (type: 'tomorrow' | 'nextWeek') => {
      const d = new Date();
      if (type === 'tomorrow') d.setDate(d.getDate() + 1);
      if (type === 'nextWeek') d.setDate(d.getDate() + 7);
      d.setHours(9, 0, 0, 0);
      setInvoice(prev => ({ ...prev, scheduledDate: d.toISOString() }));
      setCalendarViewDate(d);
  };

  const dateComponents = getDateComponents(invoice.date);
  const dueDateComponents = getDateComponents(invoice.dueDate);
  const currentFont = FONTS.find(f => f.id === invoice.fontStyle) || FONTS[0];

  // Calendar Helpers
  const daysInMonth = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 0).getDate();
  const startDay = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth(), 1).getDay();

  // Styles - Standardized to match Settings page style
  const inputClass = "w-full py-2.5 px-3 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm text-neutral-900 dark:text-white focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white outline-none transition-all placeholder-neutral-400";
  const labelClass = "block text-xs font-bold text-neutral-500 dark:text-neutral-400 mb-1.5 uppercase";
  const sectionClass = "bg-white dark:bg-neutral-800 p-4 sm:p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800 mb-6 shadow-sm dark:shadow-none";
  const sectionHeaderClass = "text-base font-semibold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-700 pb-2 mb-4 flex items-center gap-2";

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-900">
      
      {/* Email Composer Modal */}
      {showEmailModal && (
        <div 
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowEmailModal(false)}
        >
            <div 
                className="bg-white dark:bg-neutral-900 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
               <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-neutral-50 dark:bg-neutral-800/50">
                   <div className="flex items-center gap-2">
                      <Mail size={18} className="text-neutral-900 dark:text-white" />
                      <h3 className="font-bold text-neutral-900 dark:text-white">Compose Email</h3>
                   </div>
                   <button onClick={() => setShowEmailModal(false)} className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                      <X size={18} />
                   </button>
               </div>
               
               {/* Tab Switcher */}
               <div className="flex border-b border-neutral-100 dark:border-neutral-800 px-6">
                   <button 
                     onClick={() => setActiveEmailTab('write')}
                     className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeEmailTab === 'write' ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white' : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400'}`}
                   >
                     Write
                   </button>
                   <button 
                     onClick={() => setActiveEmailTab('preview')}
                     className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${activeEmailTab === 'preview' ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white' : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400'}`}
                   >
                     <Eye size={14} /> Preview
                   </button>
               </div>
               
               {activeEmailTab === 'write' ? (
                   <div className="p-6 space-y-4 overflow-y-auto">
                       <div>
                           <label className={labelClass}>To (Recipient Email)</label>
                           <div className="relative">
                               <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                               <input 
                                   type="email" 
                                   value={emailDraft.to}
                                   onChange={(e) => setEmailDraft({...emailDraft, to: e.target.value})}
                                   className={`${inputClass} pl-10`}
                                   placeholder="recipient@example.com"
                               />
                           </div>
                       </div>
                       
                       <div>
                           <label className={labelClass}>Subject Line</label>
                           <div className="relative">
                               <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                               <input 
                                   type="text" 
                                   value={emailDraft.subject}
                                   onChange={(e) => setEmailDraft({...emailDraft, subject: e.target.value})}
                                   className={`${inputClass} pl-10 font-medium`}
                                   placeholder="Invoice Subject"
                               />
                           </div>
                       </div>
                       
                       <div>
                           <div className="flex justify-between items-baseline mb-1.5">
                              <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase">Message Body</label>
                              <button 
                                onClick={handleAiEmailGenerate}
                                disabled={loadingEmailAi}
                                className="text-xs flex items-center gap-1.5 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded transition-colors"
                              >
                                <Sparkles size={12} className={loadingEmailAi ? 'animate-spin' : 'text-amber-500'} fill={loadingEmailAi ? "none" : "currentColor"} />
                                {loadingEmailAi ? 'Generating...' : 'Write with AI'}
                              </button>
                           </div>
                           <textarea 
                               value={emailDraft.body}
                               onChange={(e) => setEmailDraft({...emailDraft, body: e.target.value})}
                               className={`${inputClass} min-h-[180px] resize-y`}
                               placeholder="Enter your message..."
                           />
                           
                           {/* Indicators */}
                           <div className="mt-3 flex flex-wrap gap-2">
                               {/* Attachment Indicator */}
                               <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50 p-2 rounded border border-neutral-100 dark:border-neutral-800">
                                  <Paperclip size={14} />
                                  <span className="font-medium">Attachment:</span>
                                  <span className="bg-white dark:bg-neutral-800 px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">
                                     {invoice.number || 'invoice'}.pdf
                                  </span>
                               </div>
                           </div>

                           {!invoice.pdfUrl && (
                             <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                <Sparkles size={12} />
                                Tip: The PDF will be attached automatically when you send.
                             </div>
                           )}
                       </div>
                   </div>
               ) : (
                   <div className="flex-1 bg-neutral-100 dark:bg-neutral-900 p-6 overflow-y-auto">
                        <div className="max-w-[500px] mx-auto bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-200">
                            {/* Header / Logo */}
                            <div className="p-8 text-center bg-white border-b border-neutral-50">
                                {invoice.logo ? (
                                    <img src={invoice.logo} alt="Logo" className="max-h-10 mx-auto" />
                                ) : (
                                    <h2 className="text-xl font-bold text-neutral-900">{invoice.senderName}</h2>
                                )}
                            </div>
                            
                            {/* Hero */}
                            <div className="p-8 text-center bg-white">
                                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Amount Due</p>
                                <h1 className="text-4xl font-bold text-neutral-900 mb-2 tracking-tight">
                                    {invoice.currencySymbol}{invoice.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0).toFixed(2)}
                                </h1>
                                <p className="text-xs font-medium text-red-500 mb-6">Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                                <button className="inline-block bg-neutral-900 text-white font-bold py-3 px-6 rounded-lg text-sm mb-4">
                                    View Invoice
                                </button>
                            </div>

                            {/* Message */}
                            <div className="p-8 bg-neutral-50 border-t border-neutral-100 text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">
                                {emailDraft.body}
                            </div>

                            {/* Footer */}
                            <div className="p-6 bg-white border-t border-neutral-100 text-center">
                                <p className="text-xs text-neutral-400">{invoice.senderName}</p>
                                <p className="text-[10px] text-neutral-300 mt-1">{invoice.senderAddress}</p>
                            </div>
                        </div>
                   </div>
               )}

               <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/20 flex flex-col sm:flex-row gap-3">
                     <button 
                       onClick={() => setShowEmailModal(false)}
                       className="py-2.5 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
                     >
                       Cancel
                     </button>
                     <div className="flex-1"></div>
                     
                     <button 
                       onClick={handleLaunchEmailClient}
                       className="py-2.5 px-4 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors flex items-center justify-center gap-2"
                     >
                        <Mail size={16} /> App
                     </button>
                     
                     <button 
                       onClick={() => handleSwitchToSchedule()}
                       className="py-2.5 px-6 text-sm font-bold text-neutral-900 bg-white border border-neutral-200 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-white dark:border-neutral-700 dark:hover:bg-neutral-700 rounded-md transition-colors flex items-center justify-center gap-2"
                     >
                        <Clock size={16} /> Schedule
                     </button>

                     <button 
                       onClick={handleSendEmail}
                       disabled={isSendingEmail}
                       className="py-2.5 px-6 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center justify-center gap-2"
                     >
                        {isSendingEmail ? <Loader2 size={16} className="animate-spin"/> : <Zap size={16} />} 
                        {isSendingEmail ? 'Saving & Sending...' : 'Send Now'}
                     </button>
               </div>
            </div>
        </div>
      )}

      {/* Scheduler Modal */}
      {/* ... (Existing Scheduler Modal code, no changes needed) ... */}
      {showScheduler && (
        <div 
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowScheduler(false)}
        >
            <div 
                className="bg-white dark:bg-neutral-900 w-full max-w-sm rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-neutral-200 dark:border-neutral-800"
                onClick={(e) => e.stopPropagation()}
            >
               {/* ... same as before ... */}
               <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-neutral-50 dark:bg-neutral-800/50">
                   <div className="flex items-center gap-2">
                      <CalendarClock size={18} className="text-neutral-900 dark:text-white" />
                      <h3 className="font-bold text-neutral-900 dark:text-white">Schedule Send</h3>
                   </div>
                   <button onClick={() => setShowScheduler(false)} className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                      <X size={18} />
                   </button>
               </div>
               
               <div className="p-5">
                  {emailDraft.subject && (
                      <div className="mb-4 p-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
                          <Check size={12} />
                          <span>Email draft content saved</span>
                      </div>
                  )}

                  <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                      <button onClick={() => setQuickSchedule('tomorrow')} className="flex-shrink-0 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-neutral-700 dark:text-neutral-300">
                          Tomorrow 9 AM
                      </button>
                      <button onClick={() => setQuickSchedule('nextWeek')} className="flex-shrink-0 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-neutral-700 dark:text-neutral-300">
                          Next Week
                      </button>
                  </div>

                  {/* Calendar View */}
                  <div className="mb-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-3 border border-neutral-100 dark:border-neutral-800">
                      <div className="flex justify-between items-center mb-3">
                          <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-white dark:hover:bg-neutral-700 rounded-full transition-colors"><ChevronLeft size={16} /></button>
                          <span className="font-bold text-sm text-neutral-900 dark:text-white">
                              {MONTHS[calendarViewDate.getMonth()]} {calendarViewDate.getFullYear()}
                          </span>
                          <button onClick={() => changeMonth(1)} className="p-1 hover:bg-white dark:hover:bg-neutral-700 rounded-full transition-colors"><ChevronRight size={16} /></button>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center mb-1">
                          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                              <div key={d} className="text-[10px] font-bold text-neutral-400 uppercase">{d}</div>
                          ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: startDay }).map((_, i) => (
                              <div key={`empty-${i}`} />
                          ))}
                          {Array.from({ length: daysInMonth }).map((_, i) => {
                              const day = i + 1;
                              const currentDate = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth(), day);
                              const isSelected = invoice.scheduledDate && new Date(invoice.scheduledDate).toDateString() === currentDate.toDateString();
                              const isToday = new Date().toDateString() === currentDate.toDateString();
                              const isPast = currentDate < new Date(new Date().setHours(0,0,0,0));

                              return (
                                  <button
                                      key={day}
                                      disabled={isPast}
                                      onClick={() => handleDateSelect(day)}
                                      className={`
                                          h-8 w-8 rounded-full text-xs flex items-center justify-center transition-all
                                          ${isSelected ? 'bg-neutral-900 text-white dark:bg-white dark:text-black font-bold shadow-md' : ''}
                                          ${!isSelected && isToday ? 'border border-neutral-300 dark:border-neutral-600 font-bold text-neutral-900 dark:text-white' : ''}
                                          ${!isSelected && !isToday && !isPast ? 'hover:bg-white dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300' : ''}
                                          ${isPast ? 'text-neutral-300 dark:text-neutral-700 cursor-not-allowed' : ''}
                                      `}
                                  >
                                      {day}
                                  </button>
                              );
                          })}
                      </div>
                  </div>

                  {/* Time Selector */}
                  <div className="mb-4">
                      <label className={labelClass}>Time</label>
                      <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                          <input 
                              type="time" 
                              className={`${inputClass} pl-10`}
                              value={invoice.scheduledDate ? new Date(invoice.scheduledDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}) : ''}
                              onChange={handleTimeChange}
                          />
                      </div>
                  </div>

                  {/* Recurrence Checkbox */}
                  <div className="mb-6 flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded border border-neutral-100 dark:border-neutral-800">
                     <div className="relative flex items-center">
                        <input 
                            type="checkbox"
                            id="isRecurring"
                            checked={invoice.isRecurring || false}
                            onChange={(e) => setInvoice(prev => ({...prev, isRecurring: e.target.checked}))}
                            className="w-4 h-4 text-neutral-900 rounded border-neutral-300 focus:ring-neutral-900"
                        />
                     </div>
                     <div className="flex-1">
                        <label htmlFor="isRecurring" className="text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer select-none">
                            Repeat email monthly
                        </label>
                        <p className="text-[10px] text-neutral-500">Resend with same content on this date.</p>
                     </div>
                     <Repeat size={14} className="text-neutral-400" />
                  </div>
                  
                  {invoice.scheduledDate && (
                      <p className="text-xs text-center text-neutral-500 dark:text-neutral-400 mb-4 bg-neutral-100 dark:bg-neutral-800 p-2 rounded">
                          Scheduled for: <strong>{new Date(invoice.scheduledDate).toLocaleString()}</strong>
                          {invoice.isRecurring && <span className="block text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center justify-center gap-1"><Repeat size={10}/> Repeats monthly</span>}
                      </p>
                  )}

                  <div className="flex gap-3">
                     <button 
                       onClick={() => {
                           setInvoice(prev => ({...prev, scheduledDate: undefined, emailStatus: 'unsent', isRecurring: false}));
                           setShowScheduler(false);
                       }}
                       className="flex-1 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
                     >
                       Clear
                     </button>
                     <button 
                       onClick={handleConfirmSchedule}
                       className="flex-1 py-2.5 text-sm font-bold text-white bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-200 dark:text-black rounded-md transition-colors flex items-center justify-center gap-2"
                     >
                        <Clock size={16} /> Confirm
                     </button>
                  </div>
               </div>
            </div>
        </div>
      )}

      {/* Header */}
      {/* ... (Existing Header code, no changes needed) ... */}
      <div className="flex-none bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 p-4 flex justify-between items-center z-20">
         <div className="flex items-center gap-3">
          <button onClick={onCancel} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md text-neutral-600 dark:text-neutral-300 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <h2 className="font-bold text-lg text-neutral-900 dark:text-white truncate">
            {mobileTab === 'editor' ? 'Edit Invoice' : 'Preview'}
          </h2>
          {/* ... */}
         </div>
         <div className="flex gap-2 items-center">
           {/* ... */}
           <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors hidden sm:block"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
           <button 
             onClick={handlePrepareEmail}
             className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${invoice.emailStatus === 'scheduled' ? 'text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800' : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-transparent'}`}
             title="Compose Email"
           >
             <Mail size={18} />
             <span className="hidden sm:inline">Send Invoice</span>
           </button>
           <button 
             onClick={handleDownloadPdf} 
             disabled={isGeneratingPdf}
             className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-md transition-all disabled:opacity-50"
           >
             {isGeneratingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
             <span className="hidden lg:inline">Export PDF</span>
           </button>
           <button 
            onClick={() => handleSaveClick(invoice, true)} 
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-900 rounded-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
           >
             {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
             <span className="hidden sm:inline">Save</span>
           </button>
         </div>
      </div>

      {/* Mobile Tab Switcher */}
      {/* ... (Existing code) ... */}
      <div className="lg:hidden flex border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <button 
          onClick={() => setMobileTab('editor')} 
          className={`flex-1 p-3 text-sm font-medium flex items-center justify-center gap-2 ${mobileTab === 'editor' ? 'border-b-2 border-neutral-900 dark:border-white text-neutral-900 dark:text-white' : 'text-neutral-500 dark:text-neutral-400'}`}
        >
          <PenTool size={16} /> Editor
        </button>
        <button 
          onClick={() => setMobileTab('preview')} 
          className={`flex-1 p-3 text-sm font-medium flex items-center justify-center gap-2 ${mobileTab === 'preview' ? 'border-b-2 border-neutral-900 dark:border-white text-neutral-900 dark:text-white' : 'text-neutral-500 dark:text-neutral-400'}`}
        >
          <Eye size={16} /> Preview
        </button>
      </div>

      {/* Main Layout */}
      <div className="flex-grow flex lg:flex-row overflow-hidden relative">
        
        {/* Editor Pane */}
        <div className={`w-full lg:w-5/12 h-full overflow-y-auto no-print bg-white dark:bg-neutral-900 border-r border-neutral-100 dark:border-neutral-800 ${mobileTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
          <div className="p-4 sm:p-6 space-y-6 pb-20">
            
            {/* Design & Branding Section */}
            {/* ... (Existing Design Section - no changes) ... */}
            <section className={sectionClass}>
              <h3 className={sectionHeaderClass}>
                <Palette size={16} className="text-neutral-500" />
                Design & Branding
              </h3>
              
              {/* Logo Upload */}
              <div className="mb-6">
                <label className={labelClass}>Company Logo</label>
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded border border-neutral-200 dark:border-neutral-700 flex items-center justify-center overflow-hidden bg-neutral-50 dark:bg-neutral-800 relative group`}>
                     {invoice.logo ? (
                       <>
                          <img src={invoice.logo} alt="Logo" className="w-full h-full object-contain" />
                          <button 
                            onClick={removeLogo}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                          >
                            <X size={16} />
                          </button>
                       </>
                     ) : (
                       <ImageIcon size={20} className="text-neutral-400" />
                     )}
                  </div>
                  <div className="flex-1">
                     <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoUpload} 
                        className="hidden" 
                        ref={fileInputRef}
                        id="logo-upload"
                     />
                     <label 
                       htmlFor="logo-upload"
                       className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-sm font-medium rounded border border-neutral-200 dark:border-neutral-700 cursor-pointer transition-colors"
                     >
                       <Upload size={14} />
                       Upload Logo
                     </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Color Theme</label>
                  <div className="flex gap-2 flex-wrap items-center">
                    {THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => handleInputChange('colorTheme', theme.id)}
                        className={`w-6 h-6 rounded-full border border-neutral-200 dark:border-neutral-600 transition-all ${
                          invoice.colorTheme === theme.id 
                          ? 'ring-2 ring-offset-1 ring-neutral-900 dark:ring-white dark:ring-offset-neutral-900' 
                          : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: theme.color }}
                        title={theme.label}
                        aria-label={theme.label}
                      />
                    ))}
                    
                    {/* Custom Color Picker */}
                    <div className="relative flex items-center justify-center ml-1">
                      <input
                        type="color"
                        value={invoice.colorTheme.startsWith('#') ? invoice.colorTheme : '#000000'}
                        onChange={(e) => handleInputChange('colorTheme', e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        title="Custom Brand Color"
                      />
                      <div 
                        className={`w-6 h-6 rounded-full border border-neutral-200 dark:border-neutral-600 transition-all flex items-center justify-center overflow-hidden ${
                          invoice.colorTheme.startsWith('#') 
                          ? 'ring-2 ring-offset-1 ring-neutral-900 dark:ring-white dark:ring-offset-neutral-900' 
                          : 'hover:scale-110'
                        }`}
                        style={{
                            background: invoice.colorTheme.startsWith('#') 
                                ? invoice.colorTheme 
                                : 'conic-gradient(from 180deg at 50% 50%, #FF0000 0deg, #00FF00 120deg, #0000FF 240deg, #FF0000 360deg)'
                        }}
                      >
                        {!invoice.colorTheme.startsWith('#') && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Typography</label>
                  {/* Custom Dropdown for Fonts */}
                  <div className="relative" ref={fontMenuRef}>
                     <button 
                       onClick={() => setShowFontMenu(!showFontMenu)}
                       className={`${inputClass} flex items-center justify-between cursor-pointer`}
                     >
                        <div className="flex items-center gap-2 truncate">
                           <Type size={14} className="text-neutral-400" />
                           <span className={currentFont.class}>{currentFont.label}</span>
                        </div>
                        <ChevronDown size={14} className="text-neutral-400" />
                     </button>
                     
                     {showFontMenu && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-xl max-h-60 overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-100">
                           {FONTS.map(font => (
                             <button
                               key={font.id}
                               onClick={() => {
                                 handleInputChange('fontStyle', font.id);
                                 setShowFontMenu(false);
                               }}
                               className={`w-full text-left px-3 py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors flex items-center justify-between ${
                                 invoice.fontStyle === font.id ? 'bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-white font-medium' : 'text-neutral-600 dark:text-neutral-300'
                               }`}
                             >
                                <span className={font.class}>{font.label}</span>
                                {invoice.fontStyle === font.id && <Check size={14} className="text-neutral-900 dark:text-white" />}
                             </button>
                           ))}
                        </div>
                     )}
                  </div>
                </div>
              </div>
            </section>

            {/* General Section */}
            {/* ... (Existing General Section - no changes) ... */}
            <section className={sectionClass}>
              <h3 className={sectionHeaderClass}>General Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Invoice Title</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                    <input type="text" value={invoice.title} onChange={(e) => handleInputChange('title', e.target.value)} className={`${inputClass} pl-10`} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Invoice Number</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                    <input type="text" value={invoice.number} onChange={(e) => handleInputChange('number', e.target.value)} className={`${inputClass} pl-10`} />
                  </div>
                </div>
                
                {/* Date Selection */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                     <label className={labelClass}>Invoice Date</label>
                     <div className="flex gap-2">
                        <select 
                          value={dateComponents.month}
                          onChange={(e) => handleDatePartChange('date', 'month', parseInt(e.target.value))}
                          className={`${inputClass} flex-grow cursor-pointer min-w-0`}
                        >
                          {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                        </select>
                        <input 
                          type="number" 
                          min="1" max="31"
                          value={dateComponents.day}
                          onChange={(e) => handleDatePartChange('date', 'day', parseInt(e.target.value) || 1)}
                          className={`${inputClass} w-14 sm:w-16 text-center`}
                        />
                        <input 
                          type="number" 
                          value={dateComponents.year}
                          onChange={(e) => handleDatePartChange('date', 'year', parseInt(e.target.value))}
                          className={`${inputClass} w-16 sm:w-20 text-center`}
                        />
                     </div>
                  </div>

                  <div>
                     <label className={labelClass}>Due Date</label>
                     <div className="flex gap-2">
                        <select 
                          value={dueDateComponents.month}
                          onChange={(e) => handleDatePartChange('dueDate', 'month', parseInt(e.target.value))}
                          className={`${inputClass} flex-grow cursor-pointer min-w-0`}
                        >
                          {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                        </select>
                        <input 
                          type="number" 
                          min="1" max="31"
                          value={dueDateComponents.day}
                          onChange={(e) => handleDatePartChange('dueDate', 'day', parseInt(e.target.value) || 1)}
                          className={`${inputClass} w-14 sm:w-16 text-center`}
                        />
                        <input 
                          type="number" 
                          value={dueDateComponents.year}
                          onChange={(e) => handleDatePartChange('dueDate', 'year', parseInt(e.target.value))}
                          className={`${inputClass} w-16 sm:w-20 text-center`}
                        />
                     </div>
                  </div>
                </div>

                 <div>
                  <label className={labelClass}>Currency</label>
                  <select 
                    value={invoice.currencySymbol} 
                    onChange={(e) => handleInputChange('currencySymbol', e.target.value)} 
                    className={`${inputClass} cursor-pointer`}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.label} value={c.symbol}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className={labelClass}>Status</label>
                  <select 
                    value={invoice.status || ''} 
                    onChange={(e) => handleInputChange('status', e.target.value)} 
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="">Auto (Based on Date)</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Sender & Payment Section */}
            {/* ... (Existing Sender & Payment Section - no changes) ... */}
            <section className={sectionClass}>
              <div 
                className={`${sectionHeaderClass} cursor-pointer justify-between mb-0 border-b-0 hover:opacity-75`} 
                onClick={() => toggleSection('sender')}
              >
                <span>From & Payment</span>
                {expandedSections.sender ? <ChevronDown size={18} className="text-neutral-400" /> : <ChevronRight size={18} className="text-neutral-400" />}
              </div>
              
              {expandedSections.sender && (
                <div className="grid gap-4 mt-4">
                  <div>
                      <label className={labelClass}>Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                        <input placeholder="Your Name or Company" type="text" value={invoice.senderName} onChange={(e) => handleInputChange('senderName', e.target.value)} className={`${inputClass} pl-10`} />
                      </div>
                  </div>
                  <div>
                      <label className={labelClass}>Address</label>
                      <AddressAutocomplete
                        value={invoice.senderAddress} 
                        onChange={(val) => handleInputChange('senderAddress', val)} 
                        className={inputClass} 
                        placeholder="Street, City, Country"
                        icon={MapPin}
                      />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Phone</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                            <input placeholder="+1 234..." type="text" value={invoice.senderPhone} onChange={(e) => handleInputChange('senderPhone', e.target.value)} className={`${inputClass} pl-10`} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                            <input placeholder="email@example.com" type="email" value={invoice.senderEmail} onChange={(e) => handleInputChange('senderEmail', e.target.value)} className={`${inputClass} pl-10`} />
                        </div>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700">
                    <label className={labelClass}>Payment Method</label>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <button 
                            type="button"
                            onClick={() => handlePaymentMethodChange('bank')}
                            className={`py-2 px-2 rounded-md border text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${invoice.paymentMethod === 'bank' ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-black dark:border-white' : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700'}`}
                        >
                            <Landmark size={14} /> Bank
                        </button>
                        <button 
                            type="button"
                            onClick={() => handlePaymentMethodChange('paypal')}
                            className={`py-2 px-2 rounded-md border text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${invoice.paymentMethod === 'paypal' ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-black dark:border-white' : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700'}`}
                        >
                            <CreditCard size={14} /> PayPal
                        </button>
                        <button 
                            type="button"
                            onClick={() => handlePaymentMethodChange('crypto')}
                            className={`py-2 px-2 rounded-md border text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${invoice.paymentMethod === 'crypto' ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-black dark:border-white' : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700'}`}
                        >
                            <Bitcoin size={14} /> Crypto
                        </button>
                    </div>

                    {invoice.paymentMethod === 'bank' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div>
                                <label className={labelClass}>IBAN</label>
                                <input placeholder="US89 3704 0044..." type="text" value={invoice.paymentIban || ''} onChange={(e) => handleInputChange('paymentIban', e.target.value)} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>BIC/SWIFT</label>
                                <input placeholder="ACMEUS33" type="text" value={invoice.paymentBic || ''} onChange={(e) => handleInputChange('paymentBic', e.target.value)} className={inputClass} />
                            </div>
                        </div>
                    )}
                    
                    {invoice.paymentMethod === 'paypal' && (
                         <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className={labelClass}>PayPal Email</label>
                            <input placeholder="paypal@example.com" type="email" value={invoice.paymentPaypalEmail || ''} onChange={(e) => handleInputChange('paymentPaypalEmail', e.target.value)} className={inputClass} />
                         </div>
                    )}

                    {invoice.paymentMethod === 'crypto' && (
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                             <div>
                                <label className={labelClass}>Network</label>
                                <input placeholder="Ethereum (ERC20)" type="text" value={invoice.paymentNetwork || ''} onChange={(e) => handleInputChange('paymentNetwork', e.target.value)} className={inputClass} />
                             </div>
                             <div>
                                <label className={labelClass}>Wallet Address</label>
                                <input placeholder="0x..." type="text" value={invoice.paymentWalletAddress || ''} onChange={(e) => handleInputChange('paymentWalletAddress', e.target.value)} className={inputClass} />
                             </div>
                         </div>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* Recipient Section */}
            {/* ... (Existing Recipient Section - no changes) ... */}
            <section className={sectionClass}>
              <div 
                className={`${sectionHeaderClass} cursor-pointer justify-between mb-0 border-b-0 hover:opacity-75`} 
                onClick={() => toggleSection('recipient')}
              >
                <span>Bill To</span>
                {expandedSections.recipient ? <ChevronDown size={18} className="text-neutral-400" /> : <ChevronRight size={18} className="text-neutral-400" />}
              </div>
              
              {expandedSections.recipient && (
                  <div className="mt-4 relative">
                    {/* Client Selector */}
                    <div className="mb-4">
                        <button 
                            onClick={() => setShowClientSelector(!showClientSelector)}
                            className="text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white flex items-center gap-1 uppercase transition-colors"
                        >
                            {showClientSelector ? <X size={12}/> : <Users size={12}/>}
                            {showClientSelector ? 'Close' : 'Select Saved Client'}
                        </button>
                        
                        {showClientSelector && (
                            <div className="absolute top-8 left-0 z-20 w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                {savedClients.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-neutral-500 dark:text-neutral-400">No saved clients found.</div>
                                ) : (
                                    savedClients.map(client => (
                                        <div 
                                            key={client.id}
                                            onClick={() => handleSelectClient(client)}
                                            className="p-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer border-b border-neutral-100 dark:border-neutral-700 last:border-0"
                                        >
                                            <p className="font-bold text-sm text-neutral-900 dark:text-white">{client.name}</p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{client.email}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    <div className="grid gap-4">
                        <div>
                            <label className={labelClass}>Client Name</label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                                <input placeholder="Client Name or Company" type="text" value={invoice.recipientName} onChange={(e) => handleInputChange('recipientName', e.target.value)} className={`${inputClass} pl-10`} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Client Address</label>
                            <AddressAutocomplete
                                value={invoice.recipientAddress} 
                                onChange={(val) => handleInputChange('recipientAddress', val)} 
                                className={inputClass} 
                                placeholder="Client's Full Address"
                                icon={MapPin}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div>
                                <label className={labelClass}>Client Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                                    <input placeholder="client@example.com" type="email" value={invoice.recipientEmail} onChange={(e) => handleInputChange('recipientEmail', e.target.value)} className={`${inputClass} pl-10`} />
                                </div>
                             </div>
                             <div>
                                <label className={labelClass}>VAT / Tax ID</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                                    <input placeholder="Optional" type="text" value={invoice.recipientVat || ''} onChange={(e) => handleInputChange('recipientVat', e.target.value)} className={`${inputClass} pl-10`} />
                                </div>
                             </div>
                        </div>
                    </div>
                  </div>
              )}
            </section>

            {/* Line Items Section */}
            {/* ... (Existing Line Items Section - no changes) ... */}
            <section className={sectionClass}>
              <h3 className={sectionHeaderClass}>Line Items</h3>
              <div className="space-y-4">
                {invoice.items.map((item) => (
                  <div key={item.id} className="group relative bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg border border-neutral-100 dark:border-neutral-700/50 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors">
                    <button 
                        onClick={() => removeItem(item.id)} 
                        className="absolute -top-2 -right-2 bg-white dark:bg-neutral-800 text-neutral-400 hover:text-red-500 p-1.5 rounded-full shadow-sm border border-neutral-200 dark:border-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        title="Remove Item"
                    >
                      <Trash2 size={14} />
                    </button>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                        <div className="sm:col-span-6">
                            <label className={labelClass}>Description</label>
                            <div className="relative">
                                <textarea 
                                    rows={2}
                                    value={item.description} 
                                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} 
                                    className={`${inputClass} pr-8 resize-none`} 
                                    placeholder="Service Description"
                                />
                                <button 
                                    onClick={() => handleAiDescription(item.id, item.description)}
                                    disabled={!!loadingAi}
                                    className="absolute right-2 top-2 text-neutral-400 hover:text-amber-500 transition-colors"
                                    title="Improve with AI"
                                >
                                    <Sparkles size={14} className={loadingAi === `desc-${item.id}` ? 'animate-spin text-amber-500' : ''} />
                                </button>
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                             <label className={labelClass}>Qty</label>
                             <input type="number" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value))} className={inputClass} min="1" />
                        </div>
                        <div className="sm:col-span-4">
                             <label className={labelClass}>Price</label>
                             <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-medium">{invoice.currencySymbol}</span>
                                <input type="number" value={item.unitPrice} onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value))} className={`${inputClass} pl-8`} min="0" step="0.01" />
                             </div>
                        </div>
                    </div>
                  </div>
                ))}
                
                <button onClick={addItem} className="w-full py-3 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-500 transition-all font-bold text-sm flex items-center justify-center gap-2">
                  <Plus size={16} /> Add Item
                </button>
              </div>

              {/* Totals & Tax */}
              <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-700">
                  <div className="flex justify-end">
                      <div className="w-full sm:w-1/2 space-y-4">
                          <div className="flex items-center gap-4">
                               <div className="flex-1">
                                  <label className={labelClass}>Tax Label</label>
                                  <input type="text" value={invoice.taxLabel || ''} onChange={(e) => handleInputChange('taxLabel', e.target.value)} className={inputClass} placeholder="VAT" />
                               </div>
                               <div className="w-24">
                                  <label className={labelClass}>Rate %</label>
                                  <div className="relative">
                                     <Percent className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                                     <input type="number" value={invoice.taxRate || 0} onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value))} className={`${inputClass} pr-8`} min="0" max="100" />
                                  </div>
                               </div>
                          </div>
                      </div>
                  </div>
              </div>
            </section>

            {/* Notes Section */}
            {/* ... (Existing Notes Section - no changes) ... */}
            <section className={sectionClass}>
              <h3 className={sectionHeaderClass}>Notes & Terms</h3>
              <div className="space-y-5">
                <div>
                   <div className="flex justify-between items-baseline mb-1.5">
                      <label className={labelClass}>Notes / Payment Terms</label>
                      <button 
                        onClick={handleAiPaymentTerms}
                        disabled={!!loadingAi}
                        className="text-xs flex items-center gap-1.5 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white font-medium bg-neutral-100 dark:bg-neutral-800/50 px-2 py-1 rounded transition-colors"
                      >
                         <Sparkles size={12} className={loadingAi === 'terms' ? 'animate-spin' : 'text-amber-500'} fill={loadingAi === 'terms' ? "none" : "currentColor"} />
                         Generate Terms
                      </button>
                   </div>
                   <textarea rows={3} value={invoice.notes} onChange={(e) => handleInputChange('notes', e.target.value)} className={inputClass} placeholder="Payment is due within 14 days..." />
                </div>
                <div>
                   <label className={labelClass}>Footer Message</label>
                   <input type="text" value={invoice.footerMessage} onChange={(e) => handleInputChange('footerMessage', e.target.value)} className={inputClass} placeholder="Thank you for your business!" />
                </div>
              </div>
            </section>

          </div>
        </div>

        {/* Live Preview Pane */}
        {/* ... (Existing Live Preview Pane - no changes) ... */}
        <div className={`w-full lg:w-7/12 h-full bg-neutral-100 dark:bg-black/50 overflow-y-auto relative flex flex-col items-center p-4 sm:p-8 lg:p-12 ${mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'}`}>
            <div className="invoice-preview-container w-full max-w-[794px] shadow-2xl transition-transform origin-top scale-[0.5] sm:scale-[0.6] md:scale-[0.8] lg:scale-100 lg:mb-0 mb-[-40%] sm:mb-[-30%] md:mb-[-15%]">
               <InvoicePreview invoice={invoice} showBranding={showBranding} />
            </div>
            
            {/* Quick Actions overlay for mobile preview */}
            <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30">
                <button 
                 onClick={handleDownloadPdf} 
                 disabled={isGeneratingPdf}
                 className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white px-4 py-3 rounded-full shadow-lg font-bold flex items-center gap-2 border border-neutral-200 dark:border-neutral-700"
                >
                    {isGeneratingPdf ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                    <span className="text-sm">Download</span>
                </button>
                <button 
                 onClick={handlePrepareEmail}
                 className="bg-neutral-900 text-white px-6 py-3 rounded-full shadow-lg font-bold flex items-center gap-2"
                >
                    <Mail size={18} />
                    <span className="text-sm">Send</span>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};