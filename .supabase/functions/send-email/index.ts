import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

declare const Deno: any;

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Updated to accept replyTo and senderName from the request body
    const { to, subject, body, html, pdfUrl, replyTo, senderName } = await req.json();

    // Sanitize sender name to prevent header injection issues (remove angle brackets etc)
    const safeSenderName = senderName ? senderName.replace(/[<>"']/g, "").trim() : "User";

    // Construct dynamic From header (White-label style)
    // e.g. "Acme Design via Invoycer <invoice@invoycer.app>"
    const fromHeader = senderName 
        ? `${safeSenderName} via Invoycer <invoice@invoycer.app>` 
        : 'Invoycer <invoice@invoycer.app>';

    const data = await resend.emails.send({
      from: fromHeader, 
      to: [to],
      reply_to: replyTo, // Allow client to reply directly to freelancer
      subject: subject,
      html: html,
      text: body, // Plain text fallback
      attachments: pdfUrl ? [{
        filename: 'invoice.pdf',
        path: pdfUrl,
      }] : [],
    });

    if (data.error) {
      throw new Error(data.error.message);
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});