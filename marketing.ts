export const MARKETING = {
  appName: "Invoycer",
  title: "Simple & Recurring Invoicing for Freelancers",
  hero: {
    badge: "Now with recurring invoice scheduling",
    titlePrefix: "Create invoices easily.",
    titleHighlight: "Automate recurring billing.",
    subtitle: "Invoycer helps freelancers invoice clients in seconds and automatically send recurring invoices for monthly retainers — without the admin headache.",
    ctaPrimary: "Create Free Invoices",
    ctaSecondary: "View Demo"
  },
  problem: {
    title: "Stop chasing your own money",
    subtitle: "Manual invoicing is costing you time and leading to delayed payments.",
    items: [
        { title: 'Forgetting to send', desc: "It's easy to miss a date when you're busy with client work." },
        { title: 'Repetitive admin', desc: "Recreating the same invoice every month is a waste of your creative time." },
        { title: 'Chasing payments', desc: "Awkward follow-up emails should be automated, not manual." }
    ]
  },
  features: {
    title: "Built for retainer workflows",
    subtitle: "Everything you need to automate your monthly billing cycle and keep cash flow positive.",
    items: [
        { title: 'Recurring Schedules', desc: 'Set up an invoice once and schedule it to repeat monthly automatically.' },
        { title: 'One-off Invoices', desc: 'Quickly generate manual invoices for extra project work or ad-hoc tasks.' },
        { title: 'Client Tracking', desc: 'Keep track of who has paid and who is pending at a glance.' },
        { title: 'Simple Interface', desc: 'No accounting jargon. Just a clean, professional tool built for freelancers.' },
        { title: 'AI Assistant', desc: 'Let AI write your descriptions and polite payment reminders.' },
        { title: 'Professional PDF', desc: 'Export polished PDFs that make you look like an established agency.' },
    ]
  },
  audience: {
    title: "Perfect for recurring revenue",
    items: [
        { title: 'Freelancers', desc: 'Designers, developers, and writers with long-term clients.' },
        { title: 'Consultants', desc: 'Advisors billing monthly retainer fees for expertise.' },
        { title: 'Small Agencies', desc: 'Boutique teams managing maintenance contracts.' }
    ]
  },
  workflow: {
    title: "How Invoycer works",
    steps: [
        { step: "01", title: "Save client details once", text: "Add your client's billing info, VAT number, and your standard service items." },
        { step: "02", title: "Set recurring schedule", text: "Choose the start date and frequency (e.g., Monthly on the 1st)." },
        { step: "03", title: "Get paid automatically", text: "Invoycer generates and sends the PDF to your client. You just check your bank." }
    ]
  },
  pricing: {
    title: "Simple, transparent pricing",
    subtitle: "Start for free, upgrade when you need to.",
    plans: [
        { name: 'Starter', price: '$0', desc: 'Perfect for just getting started.', features: ['3 Invoices / month', 'Basic Templates', 'PDF Export'], cta: 'Start Free', primary: false },
        { name: 'Pro', price: '$12', desc: 'For power users and freelancers.', features: ['Unlimited Invoices', 'AI Assistant', 'Custom Branding', 'Priority Support'], cta: 'Go Pro', primary: true },
        { name: 'Team', price: '$29', desc: 'Collaborate with your finance team.', features: ['Unlimited Invoices', 'Everything in Pro', '5 Team Seats', 'API Access'], cta: 'Contact Sales', primary: false }
    ]
  },
  faq: {
    title: "Frequently asked questions",
    items: [
        { q: "Is the free plan really free?", a: "Yes! You can generate up to 3 invoices per month completely free of charge, forever. No credit card required." },
        { q: "Can I remove the Invoycer branding?", a: "Yes, upgrading to the Pro plan allows you to remove all Invoycer branding and use your own logo and colors exclusively." },
        { q: "Is my data secure?", a: "Absolutely. We use Supabase for banking-grade security and encryption. Your data is yours and is never shared with third parties." },
        { q: "Can I export to PDF?", a: "Yes, all plans include high-quality PDF export functionality perfect for emailing to clients or printing." }
    ]
  },
  seo: {
    description: "Invoycer is a simple recurring invoicing tool for freelancers who bill clients monthly or on retainers. Whether you are a consultant, small agency, or solo creative, our platform handles invoice scheduling, automatic sending, and payment tracking so you can focus on your work. Create retainer invoices in seconds and automate your workflow today."
  },
  footer: {
    copyright: "© 2026 Invoycer Inc. All rights reserved."
  }
};