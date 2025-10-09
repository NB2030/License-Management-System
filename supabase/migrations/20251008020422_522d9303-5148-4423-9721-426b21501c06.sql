-- Improve pricing tiers to differentiate between products and donations
-- 1) Create enum for tier type
CREATE TYPE public.pricing_tier_type AS ENUM ('product', 'donation');

-- 2) Add new columns to pricing_tiers
ALTER TABLE public.pricing_tiers 
  ADD COLUMN tier_type public.pricing_tier_type NOT NULL DEFAULT 'donation',
  ADD COLUMN product_identifier text;

-- 3) Add index for faster lookups
CREATE INDEX idx_pricing_tiers_product_lookup 
  ON public.pricing_tiers(product_identifier, tier_type, is_active) 
  WHERE tier_type = 'product';

CREATE INDEX idx_pricing_tiers_donation_lookup 
  ON public.pricing_tiers(amount, tier_type, is_active) 
  WHERE tier_type = 'donation';

-- 4) Add constraint: product tiers must have product_identifier
ALTER TABLE public.pricing_tiers 
  ADD CONSTRAINT check_product_has_identifier 
  CHECK (
    (tier_type = 'product' AND product_identifier IS NOT NULL) OR 
    (tier_type = 'donation')
  );

COMMENT ON COLUMN public.pricing_tiers.tier_type IS 'Type of pricing tier: product (for Ko-fi shop items) or donation (for Ko-fi donations)';
COMMENT ON COLUMN public.pricing_tiers.product_identifier IS 'Product code/variation name from Ko-fi shop (required for product type)';