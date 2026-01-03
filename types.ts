export enum UserRole {
  ADMIN = 'admin',
  SALES = 'sales',
  ACCOUNTING = 'accounting',
  CUSTOMER = 'customer'
}

export enum QuoteStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CONVERTED = 'converted'
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
  OVERDUE = 'overdue'
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  credit_limit: number;
  balance: number;
  tags: string[];
}

export interface QuoteItem {
  id: string;
  description: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Quote {
  id: string;
  customer_id: string;
  status: QuoteStatus;
  total: number;
  items: QuoteItem[];
  created_at: string;
  expires_at: string;
  version: number;
}

export interface AIAction {
  id: string;
  customer_id: string;
  type: 'upsell' | 'winback' | 'reminder';
  suggestion: string;
  confidence: number;
  status: 'suggested' | 'approved' | 'rejected';
  generated_message?: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}