
import { Invoice } from './types';

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DEFAULT_INVOICE: Invoice = {
  id: '',
  title: `${MONTHS[new Date().getMonth()].toUpperCase()} INVOICE`,
  number: '2025-009',
  date: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  
  emailStatus: 'unsent',
  isRecurring: false,

  senderName: 'Acme Creative Studio',
  senderAddress: '123 Innovation Drive\nTech City, TC 90210',
  senderPhone: '+1 (555) 123-4567',
  senderEmail: 'billing@acmecreative.com',
  
  paymentMethod: 'bank',
  paymentIban: 'US89370400440532013000',
  paymentBic: 'ACMEUS33',
  paymentPaypalEmail: '',
  paymentWalletAddress: '',
  paymentNetwork: '',
  
  recipientName: 'Global Corp Industries',
  recipientEmail: 'accounts@globalcorp.com',
  recipientAddress: '456 Enterprise Blvd\nBusiness District, NY 10001',
  recipientVat: 'US-987654321',
  recipientPhone: '+1 (555) 987-6543',
  
  items: [
    {
      id: '1',
      description: 'Professional Services',
      quantity: 1,
      unitPrice: 1500.00,
    }
  ],
  
  notes: 'Please make the payment within the due date.',
  footerMessage: 'Thank you for your business!',
  currencySymbol: '$',
  
  colorTheme: 'black',
  fontStyle: 'font-plus-jakarta',
};

export const CURRENCIES = [
  { label: 'US Dollar ($)', symbol: '$' },
  { label: 'Euro (€)', symbol: '€' },
  { label: 'British Pound (£)', symbol: '£' },
  { label: 'Canadian Dollar (CA$)', symbol: 'CA$' },
  { label: 'Australian Dollar (AU$)', symbol: 'AU$' },
  { label: 'Japanese Yen (¥)', symbol: '¥' },
  { label: 'Moroccan Dirham (MAD)', symbol: 'MAD' },
];

export const THEMES = [
  { id: 'black', label: 'Minimal Black', color: '#171717', tailwindText: 'text-neutral-900', tailwindBg: 'bg-neutral-900', tailwindBorder: 'border-neutral-900' },
  { id: 'blue', label: 'Classic Blue', color: '#1e3a8a', tailwindText: 'text-blue-900', tailwindBg: 'bg-blue-900', tailwindBorder: 'border-blue-900' },
  { id: 'emerald', label: 'Nature Green', color: '#065f46', tailwindText: 'text-emerald-800', tailwindBg: 'bg-emerald-800', tailwindBorder: 'border-emerald-800' },
  { id: 'violet', label: 'Royal Purple', color: '#5b21b6', tailwindText: 'text-violet-900', tailwindBg: 'bg-violet-900', tailwindBorder: 'border-violet-900' },
  { id: 'rose', label: 'Warm Red', color: '#9f1239', tailwindText: 'text-rose-900', tailwindBg: 'bg-rose-900', tailwindBorder: 'border-rose-900' },
];

export const FONTS = [
  { id: 'font-plus-jakarta', label: 'Modern (Plus Jakarta)', class: 'font-plus-jakarta' },
  { id: 'font-inter', label: 'Clean Sans (Inter)', class: 'font-inter' },
  { id: 'font-lato', label: 'Friendly Sans (Lato)', class: 'font-lato' },
  { id: 'font-roboto', label: 'Modern Sans (Roboto)', class: 'font-roboto' },
  { id: 'font-poppins', label: 'Geometric (Poppins)', class: 'font-poppins' },
  { id: 'font-ptsans', label: 'Humanist (PT Sans)', class: 'font-ptsans' },
  { id: 'font-oswald', label: 'Bold Condensed (Oswald)', class: 'font-oswald' },
  { id: 'font-playfair', label: 'Elegant Serif (Playfair)', class: 'font-playfair' },
  { id: 'font-merriweather', label: 'Readable Serif (Merriweather)', class: 'font-merriweather' },
  { id: 'font-jetbrains', label: 'Technical Mono (JetBrains)', class: 'font-jetbrains' },
];