import { GoogleGenAI, Type } from "@google/genai";
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { SignJWT } from 'jose';
import * as bcrypt from 'bcryptjs';

// NOTE: External DB imports removed to prevent build crashes in local/preview environments.
// This API now runs in "Mock/Fallback Mode" for the demo.

type EventContext<Env, P extends string = string, Data = unknown> = {
  request: Request;
  functionPath: string;
  waitUntil: (promise: Promise<any>) => void;
  env: Env;
  params: Record<P, string | string[]>;
};

interface Env {
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
  JWT_SECRET?: string;
}

const jsonResponse = (data: any, status = 200) => 
  new Response(JSON.stringify(data), {
    status,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });

export const onRequest: any = async (context: EventContext<Env>) => {
  const url = new URL(context.request.url);
  const path = url.pathname.split('/api/')[1]?.replace(/\/$/, '') || '';

  console.log(`API Request: ${context.request.method} ${path}`);

  try {
    // ---------------------------
    // AUTH ROUTE
    // ---------------------------
    if (path === 'auth/login' && context.request.method === 'POST') {
      const { email, password } = await context.request.json() as any;
      const safeEmail = (email || '').trim().toLowerCase();
      
      // Fallback Secret
      const secret = new TextEncoder().encode(context.env.JWT_SECRET || 'portal-internal-secret-2024');

      // Allow "admin" credentials for demo
      if (safeEmail === 'admin@americanironus.com' && password === 'admin123') {
        const token = await new SignJWT({ sub: 'admin-bootstrap', role: 'admin', name: 'Admin', email: safeEmail })
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .setExpirationTime('12h')
          .sign(secret);

        return jsonResponse({
          token,
          user: { id: 'admin-bootstrap', name: 'System Admin', email: safeEmail, role: 'admin' }
        });
      }

      return jsonResponse({ error: 'Invalid credentials (Demo: admin@americanironus.com / admin123)' }, 401);
    }

    // ---------------------------
    // AI ROUTES
    // ---------------------------
    if (path === 'ai/parse-quote' && context.request.method === 'POST') {
      const { text } = await context.request.json() as any;
      
      // If no key configured, return mock data
      if (!context.env.GEMINI_API_KEY && !process.env.API_KEY) {
         return jsonResponse({
           customer_name: "Mock Customer (No API Key)",
           items: [
             { sku: "MOCK-123", description: "Sample Item from PDF", quantity: 5, unit_price: 100.00 }
           ]
         });
      }

      const ai = new GoogleGenAI({ apiKey: context.env.GEMINI_API_KEY || process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Extract line items from this text into JSON (sku, description, quantity, unit_price): ${text.substring(0, 5000)}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              customer_name: { type: Type.STRING },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sku: { type: Type.STRING },
                    description: { type: Type.STRING },
                    quantity: { type: Type.NUMBER },
                    unit_price: { type: Type.NUMBER },
                  }
                }
              }
            }
          }
        }
      });
      const jsonStr = response.text?.trim() || '{}';
      return jsonResponse(JSON.parse(jsonStr));
    }

    // ---------------------------
    // PDF GENERATION
    // ---------------------------
    if (path === 'pdf/generate' && context.request.method === 'POST') {
      const { customer, items } = await context.request.json() as any;
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      page.drawText('AMERICAN IRON QUOTE', { x: 50, y: 750, size: 20, font: fontBold });
      page.drawText(`Customer: ${customer}`, { x: 50, y: 720, size: 12 });
      
      let y = 680;
      items.forEach((item: any) => {
        page.drawText(`${item.description} - Qty: ${item.quantity} - Total: $${item.total}`, { x: 50, y, size: 10 });
        y -= 20;
      });

      const pdfBytes = await pdfDoc.save();
      return new Response(pdfBytes, {
        headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'inline; filename="quote.pdf"' }
      });
    }

    return new Response("Not Found", { status: 404 });
  } catch (error: any) {
    console.error("API Error:", error);
    return jsonResponse({ error: "Server Error", details: error.message }, 500);
  }
};