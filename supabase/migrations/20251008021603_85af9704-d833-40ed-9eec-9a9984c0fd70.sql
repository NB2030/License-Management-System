-- Re-add tier types system for donations and products

-- 1) Create enum type for tier types
CREATE TYPE public.pricing_tier_type AS ENUM ('donation', 'product');

-- 2) Add columns back
ALTER TABLE public.pricing_tiers 
  ADD COLUMN tier_type public.pricing_tier_type NOT NULL DEFAULT 'donation',
  ADD COLUMN product_identifier text;

-- 3) Add constraint: product tiers must have identifier
ALTER TABLE public.pricing_tiers 
  ADD CONSTRAINT check_product_has_identifier 
  CHECK (
    (tier_type = 'donation' AND product_identifier IS NULL) OR
    (tier_type = 'product' AND product_identifier IS NOT NULL)
  );

-- 4) Create indexes for better performance
CREATE INDEX idx_pricing_tiers_product_lookup 
  ON public.pricing_tiers(product_identifier) 
  WHERE tier_type = 'product' AND is_active = true;

CREATE INDEX idx_pricing_tiers_donation_lookup 
  ON public.pricing_tiers(amount) 
  WHERE tier_type = 'donation' AND is_active = true;

-- 5) Update comment
COMMENT ON TABLE public.pricing_tiers IS 'Pricing tiers for Ko-fi: donation tiers (amount-based) and product tiers (identifier-based)';
COMMENT ON COLUMN public.pricing_tiers.tier_type IS 'Type of tier: donation (matches by amount) or product (matches by direct link code)';
COMMENT ON COLUMN public.pricing_tiers.product_identifier IS 'Ko-fi product direct link code (e.g., from ko-fi.com/s/CODE). Required for product tiers, must be null for donation tiers';