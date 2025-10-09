-- Add flexible pricing fields to pricing_tiers
ALTER TABLE pricing_tiers 
ADD COLUMN IF NOT EXISTS is_flexible_pricing BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS days_per_dollar NUMERIC(10,2) DEFAULT 0;

-- Update existing product tiers to support flexible pricing
COMMENT ON COLUMN pricing_tiers.is_flexible_pricing IS 'Enable Pay What You Want pricing - duration calculated based on amount paid';
COMMENT ON COLUMN pricing_tiers.days_per_dollar IS 'Number of days granted per dollar (e.g., 30 days per $1 = 30, 10 days per $1 = 10)';