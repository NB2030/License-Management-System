import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, x-app-key, x-app-secret',
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

    // Validate application credentials
    const appKey = req.headers.get('x-app-key');
    const appSecret = req.headers.get('x-app-secret');

    if (!appKey || !appSecret) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing application credentials' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: validationResult } = await supabase.rpc('validate_app_credentials', {
      p_app_key: appKey,
      p_app_secret: appSecret,
    });

    if (!validationResult || validationResult.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid application credentials' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const application = validationResult[0];

    // Validate user token
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

    // Enforce application match on license lookup
    const { data: license, error: licenseError } = await supabase
      .from('licenses')
      .select('*')
      .eq('license_key', licenseKey)
      .eq('is_active', true)
      .eq('application_id', application.application_id)
      .maybeSingle();

    if (licenseError) throw licenseError;

    if (!license) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid license or not for this application' }),
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
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});