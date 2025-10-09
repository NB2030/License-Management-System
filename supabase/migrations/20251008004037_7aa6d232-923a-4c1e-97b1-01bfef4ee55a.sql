-- Create pricing tiers table for Ko-fi
CREATE TABLE public.pricing_tiers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  amount numeric NOT NULL,
  duration_days integer NOT NULL,
  name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;

-- Admins can manage pricing tiers
CREATE POLICY "Admins can manage pricing tiers"
ON public.pricing_tiers
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Insert default pricing tiers
INSERT INTO public.pricing_tiers (amount, duration_days, name) VALUES
  (3, 30, 'دعم صغير - شهر واحد'),
  (5, 90, 'دعم متوسط - 3 أشهر'),
  (10, 180, 'دعم كبير - 6 أشهر'),
  (20, 365, 'دعم مميز - سنة كاملة');

-- Add policy for admins to delete kofi_orders
CREATE POLICY "Admins can delete kofi orders"
ON public.kofi_orders
FOR DELETE
USING (is_admin(auth.uid()));