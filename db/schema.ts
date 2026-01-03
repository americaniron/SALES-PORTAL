import { pgTable, text, timestamp, decimal, integer, boolean, jsonb, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').notNull(), // admin, sales, accounting, customer
  password_hash: text('password_hash').notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  company_name: text('company_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  billing_address: text('billing_address'),
  shipping_address: text('shipping_address'),
  credit_limit: decimal('credit_limit', { precision: 10, scale: 2 }).default('0'),
  created_at: timestamp('created_at').defaultNow(),
});

export const quotes = pgTable('quotes', {
  id: uuid('id').defaultRandom().primaryKey(),
  customer_id: uuid('customer_id').references(() => customers.id),
  status: text('status').default('draft'), // draft, sent, accepted, rejected
  total_amount: decimal('total_amount', { precision: 10, scale: 2 }),
  valid_until: timestamp('valid_until'),
  created_by: uuid('created_by').references(() => users.id),
  created_at: timestamp('created_at').defaultNow(),
  version: integer('version').default(1),
});

export const quote_items = pgTable('quote_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  quote_id: uuid('quote_id').references(() => quotes.id),
  description: text('description').notNull(),
  sku: text('sku'),
  quantity: integer('quantity').notNull(),
  unit_price: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
});

export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  quote_id: uuid('quote_id').references(() => quotes.id),
  customer_id: uuid('customer_id').references(() => customers.id),
  status: text('status').default('draft'), // draft, sent, paid, overdue
  amount_due: decimal('amount_due', { precision: 10, scale: 2 }),
  due_date: timestamp('due_date'),
  stripe_payment_intent: text('stripe_payment_intent'),
  created_at: timestamp('created_at').defaultNow(),
});

export const ai_suggestions = pgTable('ai_suggestions', {
  id: uuid('id').defaultRandom().primaryKey(),
  customer_id: uuid('customer_id').references(() => customers.id),
  type: text('type').notNull(), // upsell, winback
  content: text('content').notNull(),
  status: text('status').default('suggested'), // suggested, approved, rejected
  created_at: timestamp('created_at').defaultNow(),
});
