
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS (if called from browser)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Check for Secrets
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!RESEND_API_KEY) {
      console.error("❌ ERROR: Missing RESEND_API_KEY secret.");
      throw new Error("Missing RESEND_API_KEY. Please run: supabase secrets set RESEND_API_KEY=...");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("❌ ERROR: Missing Supabase URL or Service Role Key.");
      throw new Error("Missing Supabase configuration.");
    }

    const resend = new Resend(RESEND_API_KEY);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log("🔍 Checking for scheduled invoices...");

    // 2. Fetch scheduled invoices
    // We query the JSONB column 'invoice_data' because 'emailStatus' might not exist as a top-level column.
    const { data: invoices, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("invoice_data->>emailStatus", "scheduled");

    if (error) {
      console.error("❌ Database error fetching invoices:", error);
      throw error;
    }

    if (!invoices || invoices.length === 0) {
      console.log("✅ No scheduled invoices found.");
      return new Response(JSON.stringify({ message: "No scheduled invoices found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${invoices.length} potential invoices.`);

    const now = new Date();
    const results = [];

    // 3. Loop and Process
    for (const record of invoices) {
      // Safely access data
      const invoiceData = record.invoice_data || {};
      const scheduledDateStr = invoiceData.scheduledDate;
      
      if (!scheduledDateStr) continue;
      
      const scheduledDate = new Date(scheduledDateStr);
      
      // Check if it is time to send (scheduled date is in the past)
      if (scheduledDate <= now) {
         console.log(`🚀 Sending invoice ${record.id} to ${invoiceData.recipientEmail}`);
         
         try {
            // --- GENERATE HTML CONTENT (Start) ---
            // NOTE: This logic mimics the frontend's generateHtmlEmail function to ensure consistency.
            // If you update the design in InvoiceEditor.tsx, please update it here as well.
            
            // Calculate Total
            const total = (invoiceData.items || []).reduce((acc: number, item: any) => acc + (item.quantity * item.unitPrice), 0).toFixed(2);
            
            // Generate Logo HTML
            const logoHtml = invoiceData.logo
                ? `<img src="${invoiceData.logo}" alt="${invoiceData.senderName}" style="max-height: 40px; margin-bottom: 24px;" />`
                : `<h2 style="margin: 0 0 24px 0; color: #171717; font-size: 20px;">${invoiceData.senderName}</h2>`;
            
            const bodyText = invoiceData.emailBody || "";
            const formattedDueDate = invoiceData.dueDate ? new Date(invoiceData.dueDate).toLocaleDateString() : '';

            const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Invoice ${invoiceData.number}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Inter', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
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
                            <h1 style="margin: 8px 0 0 0; color: #171717; font-size: 36px; font-weight: 700; letter-spacing: -1px;">${invoiceData.currencySymbol}${total}</h1>
                            <p style="margin: 8px 0 24px 0; color: #ef4444; font-size: 12px; font-weight: 500;">Due Date: ${formattedDueDate}</p>
                        </td>
                    </tr>

                    <!-- Action Button -->
                    <tr>
                        <td style="padding: 0 40px 32px 40px; text-align: center;">
                            <a href="${invoiceData.pdfUrl || '#'}" target="_blank" style="display: inline-block; background-color: #171717; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 6px; transition: background-color 0.2s;">View Invoice</a>
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
                            <p style="margin: 0; color: #a3a3a3; font-size: 12px;">${invoiceData.senderName}</p>
                            <p style="margin: 4px 0 0 0; color: #d4d4d4; font-size: 10px;">${(invoiceData.senderAddress || "").replace(/\n/g, ', ')}</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
            // --- GENERATE HTML CONTENT (End) ---

            // Sanitize name for email header to prevent invalid characters
            const safeSenderName = invoiceData.senderName.replace(/[<>"']/g, "").trim();

            // Send Email via Resend
            const { data: emailData, error: emailError } = await resend.emails.send({
              from: `${safeSenderName} via Invoycer <invoices@invoycer.app>`, // White-label style
              reply_to: invoiceData.senderEmail, // Direct reply to freelancer
              to: [invoiceData.recipientEmail], 
              subject: invoiceData.emailSubject || `Invoice ${invoiceData.number}`,
              html: htmlContent, 
              attachments: invoiceData.pdfUrl ? [{ filename: `${invoiceData.number || 'invoice'}.pdf`, path: invoiceData.pdfUrl }] : [],
            });

            if (emailError) {
              console.error(`⚠️ Resend API Error for ${record.id}:`, emailError);
              results.push({ id: record.id, status: 'failed', error: emailError });
              continue;
            }

            // Update Database (Mark as Sent)
            const updatedInvoiceData = { ...invoiceData, emailStatus: 'sent' };
            const { error: updateError } = await supabase
              .from("invoices")
              .update({ 
                invoice_data: updatedInvoiceData,
                // If you have top-level columns, you can update them here too, but we stick to JSON for safety
              })
              .eq("id", record.id);

            if (updateError) {
               console.error(`⚠️ Database Update Error for ${record.id}:`, updateError);
               results.push({ id: record.id, status: 'sent_but_update_failed', error: updateError });
            } else {
               console.log(`✅ Invoice ${record.id} processed successfully.`);
               results.push({ id: record.id, status: 'sent' });

               // --- START OF NEW RECURRING LOGIC ---
               if (invoiceData.isRecurring) {
                 try {
                   console.log(`🔄 Processing Recurring logic for invoice ${invoiceData.number}...`);
                   
                   // 1. Calculate New Dates
                   // We advance everything by 1 Month
                   const nextScheduledDate = new Date(scheduledDate);
                   nextScheduledDate.setMonth(nextScheduledDate.getMonth() + 1); 

                   const oldDate = new Date(invoiceData.date);
                   const nextDate = new Date(oldDate);
                   nextDate.setMonth(nextDate.getMonth() + 1);

                   const oldDueDate = new Date(invoiceData.dueDate);
                   const nextDueDate = new Date(oldDueDate);
                   nextDueDate.setMonth(nextDueDate.getMonth() + 1);

                   // 2. Increment Invoice Number
                   // Tries to increment the last number found in the string (e.g., "2024-001" -> "2024-002")
                   let nextNumber = invoiceData.number;
                   const numMatch = nextNumber.match(/(\d+)$/);
                   if (numMatch) {
                     const numStr = numMatch[1];
                     const incremented = (parseInt(numStr, 10) + 1).toString();
                     // Preserve padding (e.g., "001" -> "002")
                     const padded = incremented.padStart(numStr.length, '0');
                     nextNumber = nextNumber.substring(0, numMatch.index) + padded;
                   }

                   // 3. Prepare New Invoice Data
                   const newInvoiceId = crypto.randomUUID();
                   const newInvoiceData = {
                     ...invoiceData,
                     id: newInvoiceId,
                     number: nextNumber,
                     date: nextDate.toISOString().split('T')[0],
                     dueDate: nextDueDate.toISOString().split('T')[0],
                     scheduledDate: nextScheduledDate.toISOString(),
                     emailStatus: 'scheduled', // Reset to scheduled
                     status: 'pending',        // Reset to pending
                     pdfUrl: null,             // Server cannot generate PDF, so we clear it
                     title: invoiceData.title  // Keep title
                   };

                   // 4. Insert New Invoice
                   const { error: recurError } = await supabase
                     .from("invoices")
                     .insert({
                       id: newInvoiceId,
                       user_id: record.user_id, // Keep owner
                       invoice_data: newInvoiceData
                     });

                   if (recurError) {
                     console.error(`❌ Failed to create recurring invoice:`, recurError);
                   } else {
                     console.log(`✅ Recurring invoice created: ${nextNumber} for ${nextScheduledDate.toISOString()}`);
                   }

                 } catch (recurEx) {
                   console.error(`❌ Error in recurring logic:`, recurEx);
                 }
               }
               // --- END OF NEW RECURRING LOGIC ---
            }

         } catch (e: any) {
            console.error(`❌ Processing Error for ${record.id}:`, e);
            results.push({ id: record.id, status: 'failed', error: e.message });
         }
      } else {
         console.log(`⏳ Skipping ${record.id}: Scheduled for ${scheduledDate.toLocaleString()}`);
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("❌ Fatal Edge Function Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
