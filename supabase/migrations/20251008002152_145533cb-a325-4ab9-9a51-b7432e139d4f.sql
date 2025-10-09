-- Create table for Ko-fi orders
CREATE TABLE public.kofi_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  verification_token text NOT NULL,
  message_id text NOT NULL UNIQUE,
  timestamp timestamp with time zone NOT NULL,
  type text NOT NULL,
  is_public boolean DEFAULT true,
  from_name text,
  message text,
  amount text NOT NULL,
  url text,
  email text NOT NULL,
  currency text,
  is_subscription_payment boolean DEFAULT false,
  is_first_subscription_payment boolean DEFAULT false,
  kofi_transaction_id text UNIQUE,
  shop_items jsonb,
  tier_name text,
  shipping jsonb,
  created_at timestamp with time zone DEFAULT now(),
  license_id uuid REFERENCES public.licenses(id),
  user_id uuid,
  processed boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE public.kofi_orders ENABLE ROW LEVEL SECURITY;

-- Admin can view all orders
CREATE POLICY "Admins can view all kofi orders"
ON public.kofi_orders
FOR SELECT
USING (is_admin(auth.uid()));

-- Admin can update orders
CREATE POLICY "Admins can update kofi orders"
ON public.kofi_orders
FOR UPDATE
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Create index for faster queries
CREATE INDEX idx_kofi_orders_email ON public.kofi_orders(email);
CREATE INDEX idx_kofi_orders_processed ON public.kofi_orders(processed);
CREATE INDEX idx_kofi_orders_created_at ON public.kofi_orders(created_at DESC);