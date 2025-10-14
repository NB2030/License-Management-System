-- Add application_id to pricing_tiers table
ALTER TABLE public.pricing_tiers 
ADD COLUMN application_id UUID REFERENCES public.applications(id);

-- Add index for better performance
CREATE INDEX idx_pricing_tiers_application_id ON public.pricing_tiers(application_id);

-- Add comment
COMMENT ON COLUMN public.pricing_tiers.application_id IS 'التطبيق الذي سينشأ له الترخيص عند الشراء';