import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { licenseKey } = await req.json();

    if (!licenseKey) {
      return new Response(
        JSON.stringify({ error: 'License key is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: license, error: licenseError } = await supabase
      .from('licenses')
      .select('*')
      .eq('license_key', licenseKey)
      .eq('is_active', true)
      .maybeSingle();

    if (licenseError) throw licenseError;

    if (!license) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid or inactive license key' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (license.current_activations >= license.max_activations) {
      return new Response(
        JSON.stringify({ success: false, message: 'Maximum activations reached for this license' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: existingLicense } = await supabase
      .from('user_licenses')
      .select('*')
      .eq('user_id', user.id)
      .eq('license_id', license.id)
      .maybeSingle();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + license.duration_days);

    if (existingLicense) {
      const { error: updateError } = await supabase
        .from('user_licenses')
        .update({
          is_active: true,
          expires_at: expiresAt.toISOString(),
          last_validated: new Date().toISOString(),
        })
        .eq('id', existingLicense.id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('user_licenses')
        .insert({
          user_id: user.id,
          license_id: license.id,
          expires_at: expiresAt.toISOString(),
          is_active: true,
        });

      if (insertError) throw insertError;

      const { error: updateCountError } = await supabase
        .from('licenses')
        .update({
          current_activations: license.current_activations + 1,
        })
        .eq('id', license.id);

      if (updateCountError) throw updateCountError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'License activated successfully',
        expiresAt: expiresAt.toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});