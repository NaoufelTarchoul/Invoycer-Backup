import { GoogleGenAI } from "@google/genai";

// Helper to safely get the AI client
// This prevents the app from crashing on load if the API key is missing
const getAiClient = () => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
  } catch (error) {
    return null;
  }
};

export const generatePaymentTerms = async (invoiceTitle: string, senderName: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Please make the payment to the bank account above within 7 days.";

  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `Write a professional, polite, and concise payment terms note for an invoice titled "${invoiceTitle}" from "${senderName}". 
    It should mention that payment is expected within the due date. 
    Max 2 sentences. Return only the text.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text?.trim() || "Please make the payment to the bank account above within 7 days.";
  } catch (error) {
    console.error("Error generating payment terms:", error);
    return "Please make the payment to the bank account above within 7 days."; // Fallback
  }
};

export const improveDescription = async (text: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return text;

  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `Rewrite the following invoice line item description to make it sound more professional and descriptive: "${text}". 
    Keep it concise (max 10 words). Return only the text.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error("Error improving description:", error);
    return text; // Fallback
  }
};

export const suggestAddresses = async (input: string): Promise<string[]> => {
  if (!input || input.length < 5) return [];
  
  const ai = getAiClient();
  if (!ai) return [];

  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `You are an intelligent address autocomplete assistant.
    The user has typed the partial address: "${input}".
    Provide a JSON array of 3 to 5 realistic, complete address suggestions that might match this input.
    If the input refers to a famous place, suggest its address.
    Do not include explanations, only the JSON array of strings.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as string[];
  } catch (error) {
    console.error("Error suggesting addresses:", error);
    return [];
  }
};

export const generateEmailDraft = async (invoiceDetails: any): Promise<{ subject: string; body: string }> => {
  const ai = getAiClient();
  if (!ai) return { subject: '', body: '' };

  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `Write a professional email for sending an invoice.
    Details:
    - Invoice Number: ${invoiceDetails.number}
    - Amount: ${invoiceDetails.amount}
    - Due Date: ${invoiceDetails.dueDate}
    - Sender: ${invoiceDetails.senderName}
    - Client: ${invoiceDetails.recipientName}
    
    Return a JSON object with "subject" and "body" fields. 
    The body should be friendly, professional, and ready to send (plain text, no placeholders).`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const text = response.text;
    if (!text) return { subject: '', body: '' };
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating email draft:", error);
    return { subject: '', body: '' };
  }
};