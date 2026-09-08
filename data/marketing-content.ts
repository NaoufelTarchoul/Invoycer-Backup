
export interface IndustryContent {
  slug: string;
  title: string;
  heroTitle: string;
  heroSubtitle: string;
  metaDescription: string;
  invoiceDefaults: {
    itemDesc: string;
    price: number;
  };
  seoSection?: {
    title: string;
    items: { title: string; desc: string }[];
  };
  workflowSection?: {
    title: string;
    steps: { number: string; title: string; desc: string }[];
  };
  comparisonSection?: {
    title: string;
    subtitle: string;
    features: { title: string; text: string }[];
  };
  cheatSheet?: {
    title: string;
    subtitle: string;
    items: string[];
  };
  faqSection?: {
    title: string;
    items: { q: string; a: string }[];
  };
  // New: Social Proof
  testimonials?: {
    text: string;
    author: string;
    role: string;
    avatarInitials: string;
  }[];
  // New: Internal Linking
  relatedTemplates?: {
    title: string;
    slug: string;
  }[];
}

export const INDUSTRY_DATA: Record<string, IndustryContent> = {
  "web-designers": {
    slug: "web-designers",
    title: "Invoice Template for Web Designers",
    heroTitle: "Invoicing for Web Designers",
    heroSubtitle: "Stop wasting time on admin. Use our professional invoice template designed specifically for web design projects, maintenance retainers, and UI/UX work.",
    metaDescription: "Free professional invoice template for web designers. Schedule recurring retainers and get paid faster.",
    invoiceDefaults: {
      itemDesc: "Website Design & Development (50% Deposit)",
      price: 2500.00
    }
  },
  "social-media-managers": {
    slug: "social-media-managers",
    title: "Social Media Retainer Invoice Template",
    heroTitle: "Invoicing for Social Media Managers",
    heroSubtitle: "The industry standard for billing monthly content retainers. Create professional invoices for social media management, ad spend, and community engagement in seconds. Automate your monthly billing so you can focus on creating content.",
    metaDescription: "Free invoice template for social media managers and agencies. Automate monthly retainer billing, track client payments, and look professional.",
    invoiceDefaults: {
      itemDesc: "Monthly Social Media Management Retainer",
      price: 2000.00
    },
    seoSection: {
      title: "Why SMMs and Agencies choose Invoycer",
      items: [
        { title: "Automated Retainers", desc: "Social media work is recurring. Your invoices should be too. Schedule it once, and we email your client every month automatically." },
        { title: "Bill for Ad Spend", desc: "Easily add line items for reimbursed ad spend (Meta/Google Ads) or software subscriptions without complex accounting software." },
        { title: "Look Like an Agency", desc: "Even if you are a team of one, send clean, branded PDF invoices that build trust and justify your professional retainer fees." }
      ]
    },
    workflowSection: {
      title: "The 3-Step SMM Retainer Workflow",
      steps: [
        { number: "01", title: "Define Your Package", desc: "List your deliverables clearly (e.g., '12 IG Posts + Community Management'). Avoid scope creep by being specific in the line items." },
        { number: "02", title: "Add Reimbursable Expenses", desc: "Did you pay for stock photos or boost a post? Add these as separate line items to ensure you get paid back instantly." },
        { number: "03", title: "Set to 'Recurring'", desc: "Don't write this invoice again next month. Toggle 'Recurring' and we'll automatically generate and send it on the 1st of every month." }
      ]
    },
    comparisonSection: {
      title: "Why use this over spreadsheets or Honeybook?",
      subtitle: "Most tools are either too manual or too expensive. We built the sweet spot for freelancers.",
      features: [
        { title: "Better than Excel/Canva", text: "Spreadsheets are prone to errors and don't look professional. Canva invoices are just images—they aren't trackable and don't automate themselves." },
        { title: "Simpler than CRMs", text: "Tools like Honeybook or Dubsado charge $40+/mo and force you to use their complex pipelines. We just do invoicing, perfectly, for a fraction of the cost." },
        { title: "Client-Friendly", text: "Clients don't need to log in to a portal to pay you. They just get a clean PDF invoice in their email, making them more likely to pay on time." }
      ]
    },
    cheatSheet: {
      title: "What to include on a Social Media Invoice",
      subtitle: "Don't just write 'Social Media Services'. Be specific to show your value. Here are common line items used by top SMMs.",
      items: [
        "Content Strategy & Monthly Planning",
        "Content Creation (Reels, TikToks, Static Posts)",
        "Community Management (Engagement 5h/week)",
        "Paid Ad Management Fee (Percentage or Flat)",
        "Monthly Analytics & Performance Report",
        "Reimbursable Ad Spend (Meta/Google)",
        "Influencer Outreach & Coordination",
        "Graphic Design for Stories"
      ]
    },
    faqSection: {
      title: "Social Media Invoicing FAQs",
      items: [
        { q: "Should I include ad spend on my invoice?", a: "Yes, but be careful. If you pay for the ads on your card and get reimbursed, list it as a separate 'Reimbursement' line item. This helps clarify that this money is not income for tax purposes. If the client pays the platforms directly, do not include it on your invoice." },
        { q: "When should I send my retainer invoice?", a: "Standard practice for social media retainers is to bill **in advance**. Send the invoice on the 1st of the month for that month's work. This protects you from doing a month of work without payment." },
        { q: "How do I transition clients from hourly to retainer?", a: "Frame it as a benefit to them. A retainer guarantees your availability and simplifies their budgeting. You can say, 'To ensure I can dedicate enough time to your account, I'm moving to a monthly flat rate which includes [X] deliverables.'" },
        { q: "Do I need a contract for a retainer?", a: "Absolutely. Your invoice is for payment, but you should have a contract that outlines deliverables, cancellation notice periods (usually 30 days), and ownership of the content created." }
      ]
    },
    testimonials: [
      { text: "Invoycer cut my monthly admin time by 80%. I used to copy-paste invoice numbers in Word manually. Now it just happens.", author: "Sarah Jenkins", role: "Freelance SMM", avatarInitials: "SJ" },
      { text: "My clients actually compliment my invoices now. The retainer feature ensures I never forget to bill for the upcoming month.", author: "Marcus Chen", role: "Agency Founder", avatarInitials: "MC" }
    ],
    relatedTemplates: [
      { title: "Invoice for Content Creators", slug: "freelance-writers" },
      { title: "Invoice for Brand Consultants", slug: "consultants" },
      { title: "Invoice for Web Designers", slug: "web-designers" }
    ]
  },
  "freelance-writers": {
    slug: "freelance-writers",
    title: "Invoice Template for Freelance Writers",
    heroTitle: "Invoicing for Writers & Copywriters",
    heroSubtitle: "Get paid for your words without the headache. Simple, clean invoicing for blog posts, copy decks, and ghostwriting.",
    metaDescription: "Simple invoice template for freelance writers. Bill by the word, hour, or project.",
    invoiceDefaults: {
      itemDesc: "Blog Post Creation (1500 words)",
      price: 450.00
    }
  },
  "consultants": {
    slug: "consultants",
    title: "Invoice Template for Consultants",
    heroTitle: "Invoicing for Business Consultants",
    heroSubtitle: "Look professional with every bill. The perfect invoicing solution for advisory retainers and hourly consulting work.",
    metaDescription: "Professional invoice template for consultants. Handle retainers and hourly billing with ease.",
    invoiceDefaults: {
      itemDesc: "Strategic Consulting Retainer",
      price: 5000.00
    }
  },
  "developers": {
    slug: "developers",
    title: "Invoice Template for Software Developers",
    heroTitle: "Invoicing for Developers",
    heroSubtitle: "Clean code, clean invoices. The fastest way to bill for your development hours or sprint milestones.",
    metaDescription: "Developer-friendly invoice template. Supports recurring billing for maintenance contracts.",
    invoiceDefaults: {
      itemDesc: "Frontend Development (Sprint 1)",
      price: 3200.00
    }
  },
  "photographers": {
    slug: "photographers", 
    title: "Invoice Template for Photographers",
    heroTitle: "Invoicing for Photographers",
    heroSubtitle: "Bill for your photoshoots and licensing fees. Simple, visual invoices for creative professionals.",
    metaDescription: "Free invoice template for photography sessions, wedding packages, and image licensing.",
    invoiceDefaults: {
      itemDesc: "Wedding Photography Package (Deposit)",
      price: 1500.00
    }
  }
};
