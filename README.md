# Invoycer

Invoycer is a modern, full-stack invoicing and client management dashboard designed for freelancers and small businesses. It provides a clean, beautiful interface to manage clients, track billing defaults, generate professional invoices, and handle recurring payments.

## ✨ Features

- **Client Management:** Easily track client details, contact information, VAT/Tax IDs, and custom internal tags.
- **Smart Billing Defaults:** Set default currencies, hourly rates, and line-item descriptions per client for lightning-fast invoice generation.
- **Modern Invoice Editor:** A clean, intuitive interface to build invoices with real-time previews.
- **PDF Generation & Emailing:** Generate beautiful PDF invoices and send them directly to clients.
- **Beautiful UI/UX:** Designed with Tailwind CSS for a fully responsive, frictionless, and premium user experience.
- **Secure Backend:** Cloud persistence, secure authentication, and data management.

## 🛠 Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Styling:** Tailwind CSS, Lucide Icons
- **Backend/Database:** Supabase (PostgreSQL, Auth)
- **Deployment:** PM2 / Node.js

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or bun

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YourUsername/Invoycer.git
   cd Invoycer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and add your required credentials based on the `.env.example` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Your app should now be running locally.

## 📦 Deployment (Production)

To deploy the application to a live server (using PM2):

1. Pull the latest code to your server.
2. Install dependencies: `npm install`
3. Build the application: `npm run build`
4. Restart your process manager: `pm2 restart all`

## 📝 License

This project is licensed under the MIT License.