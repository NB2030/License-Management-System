-- Remove unique constraint from kofi_transaction_id to allow test orders with duplicate IDs
ALTER TABLE kofi_orders DROP CONSTRAINT IF EXISTS kofi_orders_kofi_transaction_id_key;

-- Create a partial unique index that ignores NULL and test transaction IDs
CREATE UNIQUE INDEX kofi_orders_real_transaction_id_key 
ON kofi_orders (kofi_transaction_id) 
WHERE kofi_transaction_id IS NOT NULL 
  AND kofi_transaction_id != '00000000-1111-2222-3333-444444444444';