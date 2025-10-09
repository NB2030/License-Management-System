-- Link Ko-fi orders to newly created profiles and auto-activate licenses
-- 1) Function
create or replace function public.link_kofi_orders_to_new_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  rec record;
  v_expires_at timestamptz;
begin
  -- Attach any pending Ko-fi orders to this user by email (case-insensitive)
  update public.kofi_orders ko
     set user_id = NEW.id
   where lower(ko.email) = lower(NEW.email)
     and ko.user_id is null;

  -- For each unprocessed order with a license, create activation if missing
  for rec in
    select ko.id as order_id, ko.license_id, l.duration_days
      from public.kofi_orders ko
      join public.licenses l on l.id = ko.license_id
     where ko.user_id = NEW.id
       and coalesce(ko.processed, false) = false
       and ko.license_id is not null
  loop
    v_expires_at := now() + (rec.duration_days || ' days')::interval;

    -- Create user_licenses only if it doesn't exist and keep it active
    if not exists (
      select 1 from public.user_licenses ul
       where ul.user_id = NEW.id
         and ul.license_id = rec.license_id
         and coalesce(ul.is_active, true) = true
    ) then
      insert into public.user_licenses (user_id, license_id, expires_at, is_active)
      values (NEW.id, rec.license_id, v_expires_at, true);

      -- Increment activation count up to max
      update public.licenses
         set current_activations = least(max_activations, current_activations + 1)
       where id = rec.license_id;
    end if;

    -- Mark order as processed
    update public.kofi_orders
       set processed = true
     where id = rec.order_id;
  end loop;

  return NEW;
end;
$$;

-- 2) Trigger on profiles insert
DROP TRIGGER IF EXISTS trg_link_kofi_orders_on_profile_insert ON public.profiles;
create trigger trg_link_kofi_orders_on_profile_insert
  after insert on public.profiles
  for each row execute function public.link_kofi_orders_to_new_profile();