import { createClient } from 'npm:@supabase/supabase-js@^2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-app-key, x-app-secret',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get app credentials from headers
    const appKey = req.headers.get('x-app-key');
    const appSecret = req.headers.get('x-app-secret');

    if (!appKey || !appSecret) {
      return new Response(
        JSON.stringify({
          isValid: false,
          error: 'Missing application credentials'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate application credentials
    const { data: validationResult } = await supabase.rpc('validate_app_credentials', {
      p_app_key: appKey,
      p_app_secret: appSecret
    });

    if (!validationResult || validationResult.length === 0) {
      return new Response(
        JSON.stringify({
          isValid: false,
          error: 'Invalid application credentials'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const application = validationResult[0];

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          isValid: false,
          error: 'Missing authorization header'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          isValid: false,
          error: 'Invalid or expired token'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's active license for this application
    const { data: userLicense, error: licenseError } = await supabase
      .from('user_licenses')
      .select('*, licenses(*)')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .eq('licenses.application_id', application.application_id)
      .order('expires_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (licenseError) {
      console.error('License query error:', licenseError);
      return new Response(
        JSON.stringify({
          isValid: false,
          error: 'Database error'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!userLicense) {
      return new Response(
        JSON.stringify({
          isValid: false,
          message: 'No active license found for this application'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if license has expired
    const now = new Date();
    const expiresAt = new Date(userLicense.expires_at);

    if (expiresAt < now) {
      // Update license status to inactive
      await supabase
        .from('user_licenses')
        .update({ is_active: false })
        .eq('id', userLicense.id);

      return new Response(
        JSON.stringify({
          isValid: false,
          message: 'License has expired',
          expiresAt: userLicense.expires_at
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update last validated timestamp
    await supabase
      .from('user_licenses')
      .update({ last_validated: new Date().toISOString() })
      .eq('id', userLicense.id);

    // Return success response
    return new Response(
      JSON.stringify({
        isValid: true,
        expiresAt: userLicense.expires_at,
        daysRemaining: Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        license: {
          id: userLicense.licenses.id,
          key: userLicense.licenses.license_key,
          durationDays: userLicense.licenses.duration_days
        },
        application: {
          id: application.application_id,
          name: application.application_name
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({
        isValid: false,
        error: 'Internal server error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
