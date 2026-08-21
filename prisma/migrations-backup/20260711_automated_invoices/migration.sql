-- Migration: automated invoices and PDF receipts

-- 1) InvoiceType enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InvoiceType') THEN
    CREATE TYPE "InvoiceType" AS ENUM ('rent', 'service', 'utility', 'agreement', 'other');
  END IF;
END
$$;

-- 2) Invoice table
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  landlord_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  listing_id TEXT REFERENCES listings(id) ON DELETE SET NULL,
  agreement_id TEXT UNIQUE REFERENCES agreements(id) ON DELETE SET NULL,
  type "InvoiceType" NOT NULL DEFAULT 'rent',
  amount NUMERIC(14, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  status "InvoiceStatus" NOT NULL DEFAULT 'draft',
  due_date TIMESTAMP NOT NULL,
  paid_at TIMESTAMP,
  items JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_landlord ON invoices(landlord_id);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_listing ON invoices(listing_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
