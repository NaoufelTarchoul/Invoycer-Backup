
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export type PaymentMethod = 'bank' | 'paypal' | 'crypto';

export interface Invoice {
  id: string;
  title: string;
  number: string;
  date: string;
  dueDate: string;
  status?: 'paid' | 'pending' | 'overdue';
  
  // Storage
  pdfUrl?: string; // URL to the generated PDF in storage

  // Email Scheduling
  scheduledDate?: string; // ISO string
  emailStatus?: 'unsent' | 'scheduled' | 'sent';
  isRecurring?: boolean; // Repeat monthly
  emailSubject?: string; // Saved draft subject
  emailBody?: string; // Saved draft body

  logo?: string; // Base64 data URL for the logo

  senderName: string;
  senderAddress: string;
  senderPhone: string;
  senderEmail: string;
  
  // Payment Details
  paymentMethod: PaymentMethod;
  
  // Bank
  paymentIban?: string;
  paymentBic?: string;
  
  // PayPal
  paymentPaypalEmail?: string;
  
  // Crypto
  paymentWalletAddress?: string;
  paymentNetwork?: string;

  recipientName: string;
  recipientEmail: string;
  recipientAddress: string;
  recipientVat?: string;
  recipientPhone: string;
  
  items: InvoiceItem[];
  
  // Tax & Totals
  taxLabel?: string; // e.g. "VAT", "GST", "Sales Tax"
  taxRate?: number;  // Percentage e.g. 20
  
  notes: string;
  footerMessage: string;
  currencySymbol: string;
  
  // Design Customization
  colorTheme: string;
  fontStyle: string;
}

export interface Client {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  address: string;
  vat?: string;
  phone: string;
  source?: string;
  services?: string;
  notes?: string; // Internal notes about the client
  default_currency?: string;
  default_price?: number;
  default_invoice_description?: string;
}

export type SubscriptionPlan = 'free' | 'pro' | 'team';
export type SubscriptionStatus = 'free' | 'active' | 'canceled';

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string; // Base64 or URL
  company_name?: string;
  company_address?: string;
  company_email?: string;
  company_phone?: string;
  default_iban?: string;
  default_bic?: string;
  default_logo?: string; // Base64
  subscription_plan?: SubscriptionPlan;
  subscription_status?: SubscriptionStatus;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  INVOICES = 'INVOICES',
  EDITOR = 'EDITOR',
  CLIENTS = 'CLIENTS',
  SETTINGS = 'SETTINGS',
}

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}