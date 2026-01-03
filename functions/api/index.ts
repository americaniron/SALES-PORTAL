import { GoogleGenAI, Type } from "@google/genai";
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { SignJWT, jwtVerify } from 'jose';
import * as bcrypt from 'bcryptjs';
import { getDb } from '../../db'; // Import the db helper
import { users } from '../../db/schema'; // Import schema
import { eq } from 'drizzle-orm';

// ---------------------------
// Cloudflare Pages Functions
// ---------------------------

type EventContext<Env, P extends string = string, Data = unknown> = {
  request: Request;
  functionPath: string;
  waitUntil: (promise: Promise<any>) => void;
  passThroughOnException: () => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  env: Env;
  params: Record<P, string | string[]>;
  data: Data;
};

type PagesFunction<Env = unknown, Params extends string = string, Data extends Record<string, unknown> = Record<string, unknown>> = (
  context: EventContext<Env, Params, Data>
) => Response | Promise<Response>;

interface Env {
  DATABASE_URL: string;
  GEMINI_API_KEY: string;
  GEMINI_MODEL: string;
  STRIPE_SECRET_KEY: string;
  SENDGRID_API_KEY?: string;
  JWT_SECRET?: string;
}

const jsonResponse = (data: any, status = 200) => 
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });

export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const path = url.pathname.replace('/api/', '');

  try {
    // ---------------------------
    // ROUTER
    // ---------------------------
    
    // Auth
    if (path === 'auth/login' && context.request.method === 'POST') {
      return await handleLogin(context);
    }

    // User Management (Create new users)
    if (path === 'users' && context.request.method === 'POST') {
      return await handleCreateUser(context);
    }

    // AI
    if (path === 'ai/analyze' && context.request.method === 'POST') {
      return await handleAIAnalysis(context);
    }
    if (path === 'ai/parse-quote' && context.request.method === 'POST') {
      return await handleQuoteParsing(context);
    }

    // PDF
    if (path === 'pdf/generate' && context.request.method === 'POST') {
      return await handlePDFGeneration(context);
    }
    
    // Generic
    if (path === 'quotes/send' && context.request.method === 'POST') {
      return jsonResponse({ success: true, message: "Email queued" });
    }

    if (path.startsWith('customers') && context.request.method === 'GET') {
      return jsonResponse([
        { id: '1', name: 'ABC Construction', balance: 4500 },
        { id: '2', name: 'Texas Excavation', balance: 0 }
      ]);
    }

    if (path.startsWith('quotes') && context.request.method === 'POST') {
      return jsonResponse({ success: true, id: 'q_123' }, 201);
    }

    return new Response("Not Found", { status: 404 });
  } catch (err: any) {
    console.error("Global API Error:", err);
    return jsonResponse({ error: "Internal Server Error", details: err.message }, 500);
  }
};

// ---------------------------
// AUTH HANDLERS
// ---------------------------
async function handleLogin(context: EventContext<Env, any, any>) {
  try {
    const { email, password } = await context.request.json() as any;
    
    // --- BOOTSTRAP / FALLBACK AUTH ---
    // This ensures you can login even if the database is not set up yet.
    if (email === 'admin@americanironus.com' && password === 'admin123') {
        const secret = new TextEncoder().encode(
          context.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod'
        );
        const token = await new SignJWT({ 
            sub: 'usr_admin_bootstrap', 
            role: 'admin', 
            name: 'System Admin (Bootstrap)',
            email: email 
          })
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .setExpirationTime('12h')
          .sign(secret);

        return jsonResponse({
          token,
          user: {
            id: 'usr_admin_bootstrap',
            name: 'System Admin (Bootstrap)',
            email: email,
            role: 'admin'
          }
        });
    }
    // --------------------------------

    if (!context.env.DATABASE_URL) {
      return jsonResponse({ error: "Database not configured. Used bootstrap credentials." }, 500);
    }

    const db = getDb(context.env.DATABASE_URL);
    
    // 1. Fetch user from DB
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = result[0];

    if (!user) {
      return jsonResponse({ error: 'Invalid credentials' }, 401);
    }

    // 2. Verify Password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return jsonResponse({ error: 'Invalid credentials' }, 401);
    }

    // 3. Generate Token
    const secret = new TextEncoder().encode(
      context.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod'
    );

    const token = await new SignJWT({ 
        sub: user.id, 
        role: user.role, 
        name: user.name,
        email: user.email 
      })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('12h')
      .sign(secret);

    return jsonResponse({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return jsonResponse({ error: error.message }, 500);
  }
}

async function handleCreateUser(context: EventContext<Env, any, any>) {
  // 1. Verify Requesting User is Admin
  const authHeader = context.request.headers.get('Authorization');
  if (!authHeader) return jsonResponse({ error: "Unauthorized" }, 401);

  const token = authHeader.split(' ')[1];
  const secret = new TextEncoder().encode(context.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod');
  
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== 'admin') {
      return jsonResponse({ error: "Forbidden: Admins only" }, 403);
    }

    // 2. Process Creation
    const { name, email, password, role } = await context.request.json() as any;
    
    if (!name || !email || !password || !role) {
      return jsonResponse({ error: "Missing fields" }, 400);
    }

    if (!context.env.DATABASE_URL) {
       return jsonResponse({ error: "Database not connected" }, 500);
    }

    const db = getDb(context.env.DATABASE_URL);
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    await db.insert(users).values({
      name,
      email,
      role,
      password_hash
    });

    return jsonResponse({ success: true, message: "User created successfully" });

  } catch (e: any) {
    return jsonResponse({ error: e.message }, 500);
  }
}

// ---------------------------
// AI HANDLERS
// ---------------------------
async function handleAIAnalysis(context: EventContext<Env, any, any>) {
  const { GEMINI_API_KEY, GEMINI_MODEL } = context.env;
  if (!GEMINI_API_KEY) return jsonResponse({ error: "No AI Key" }, 500);

  const body: any = await context.request.json();
  const customerHistory = body.history || "Customer bought 3 filters last year.";

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const prompt = `Analyze history: "${customerHistory}". Suggest 3 actionable items (upsell, maintenance, winback).`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL || 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  suggestion: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                },
                required: ['type', 'suggestion', 'confidence'],
              },
            },
          },
        },
      },
    });

    return jsonResponse(JSON.parse(response.text || '{"suggestions": []}'));
  } catch (error: any) {
    return jsonResponse({ error: error.message }, 500);
  }
}

async function handleQuoteParsing(context: EventContext<Env, any, any>) {
  const { GEMINI_API_KEY, GEMINI_MODEL } = context.env;
  if (!GEMINI_API_KEY) return jsonResponse({ error: "No AI Key" }, 500);

  const body: any = await context.request.json();
  const rawText = body.text;

  if (!rawText) return jsonResponse({ error: "No text provided" }, 400);

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const prompt = `
      Extract structured data from this PDF text.
      INPUT: "${rawText.substring(0, 30000)}"
      OUTPUT: JSON with customer_name and items (sku, description, quantity, unit_price).
    `;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL || 'gemini-3-flash-preview',
      contents: prompt,
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
                },
                required: ['description', 'quantity', 'unit_price'],
              },
            },
          },
        },
      },
    });
    return jsonResponse(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    return jsonResponse({ error: error.message }, 500);
  }
}

// ---------------------------
// PDF HANDLER
// ---------------------------
async function handlePDFGeneration(context: EventContext<Env, any, any>) {
  try {
    const data = await context.request.json() as any;
    const { quote, customer, items } = data;

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const orange = rgb(0.91, 0.34, 0.05);
    const darkGray = rgb(0.1, 0.1, 0.1);

    const drawText = (text: string, x: number, y: number, size = 12, options: any = {}) => {
      page.drawText(text, { x, y, size, font, color: darkGray, ...options });
    };

    // Header
    page.drawRectangle({ x: 0, y: height - 120, width: width, height: 120, color: darkGray });
    page.drawText('AMERICAN', { x: 50, y: height - 50, size: 24, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText('IRON', { x: 195, y: height - 50, size: 24, font: fontBold, color: orange });
    
    // Customer
    let yPos = height - 160;
    drawText('BILL TO:', 50, yPos, 10, { font: fontBold });
    yPos -= 15;
    drawText(customer || 'N/A', 50, yPos, 12);

    // Items
    yPos = height - 250;
    const colX = { sku: 50, desc: 150, qty: 380, price: 440, total: 510 };
    
    drawText('SKU', colX.sku, yPos, 10, { font: fontBold });
    drawText('DESC', colX.desc, yPos, 10, { font: fontBold });
    drawText('QTY', colX.qty, yPos, 10, { font: fontBold });
    drawText('TOTAL', colX.total, yPos, 10, { font: fontBold });

    yPos -= 25;
    for (const item of items) {
       drawText(item.sku || '-', colX.sku, yPos, 10);
       drawText(item.description.substring(0, 30), colX.desc, yPos, 10);
       drawText(item.quantity.toString(), colX.qty, yPos, 10);
       drawText(`$${item.total.toFixed(2)}`, colX.total, yPos, 10);
       yPos -= 20;
    }

    const pdfBytes = await pdfDoc.save();
    return new Response(pdfBytes, {
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="quote.pdf"' }
    });
  } catch (error: any) {
    return jsonResponse({ error: error.message }, 500);
  }
}