import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, x-api-key',
};

// Map errors to safe user messages
function getSafeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('duplicate key') || msg.includes('already registered')) {
      return 'User already exists';
    }
    if (msg.includes('invalid login') || msg.includes('invalid password')) {
      return 'Invalid email or password';
    }
    if (msg.includes('permission denied') || msg.includes('jwt')) {
      return 'Access denied';
    }
    if (msg.includes('foreign key')) return 'Referenced item not found';
  }
  return 'An error occurred processing your request';
}

interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface ActivateLicenseRequest {
  licenseKey: string;
  token: string;
}

interface ValidateLicenseRequest {
  token: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const path = url.pathname;

    // POST /license-service-api/register
    if (path.endsWith('/register') && req.method === 'POST') {
      const { email, password, fullName }: RegisterRequest = await req.json();

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (authError) throw authError;

      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email,
        full_name: fullName,
      });

      if (profileError) throw profileError;

      const { data: sessionData } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return new Response(
        JSON.stringify({
          success: true,
          user: {
            id: authData.user.id,
            email: authData.user.email,
            fullName,
          },
          token: sessionData?.session?.access_token,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /license-service-api/login
    if (path.endsWith('/login') && req.method === 'POST') {
      const { email, password }: LoginRequest = await req.json();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      return new Response(
        JSON.stringify({
          success: true,
          user: {
            id: data.user.id,
            email: data.user.email,
            fullName: profile?.full_name,
          },
          token: data.session.access_token,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /license-service-api/activate
    if (path.endsWith('/activate') && req.method === 'POST') {
      const { licenseKey, token }: ActivateLicenseRequest = await req.json();

      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        return new Response(
          JSON.stringify({ success: false, message: 'Invalid token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: license, error: licenseError } = await supabase
        .from('licenses')
        .select('*')
        .eq('license_key', licenseKey)
        .eq('is_active', true)
        .maybeSingle();

      if (licenseError || !license) {
        return new Response(
          JSON.stringify({ success: false, message: 'Invalid or inactive license' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (license.current_activations >= license.max_activations) {
        return new Response(
          JSON.stringify({ success: false, message: 'License activation limit reached' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: existing } = await supabase
        .from('user_licenses')
        .select('*')
        .eq('user_id', user.id)
        .eq('license_id', license.id)
        .maybeSingle();

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + license.duration_days);

      if (existing) {
        await supabase
          .from('user_licenses')
          .update({
            is_active: true,
            expires_at: expiresAt.toISOString(),
            last_validated: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        await supabase.from('user_licenses').insert({
          user_id: user.id,
          license_id: license.id,
          expires_at: expiresAt.toISOString(),
          is_active: true,
        });

        await supabase
          .from('licenses')
          .update({ current_activations: license.current_activations + 1 })
          .eq('id', license.id);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'License activated successfully',
          expiresAt: expiresAt.toISOString(),
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /license-service-api/validate
    if (path.endsWith('/validate') && req.method === 'POST') {
      const { token }: ValidateLicenseRequest = await req.json();

      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        return new Response(
          JSON.stringify({ isValid: false, message: 'Invalid token' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: userLicense } = await supabase
        .from('user_licenses')
        .select('*, licenses(*)')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('expires_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!userLicense) {
        return new Response(
          JSON.stringify({ isValid: false, message: 'No active license found' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const now = new Date();
      const expiresAt = new Date(userLicense.expires_at);

      if (expiresAt < now) {
        await supabase
          .from('user_licenses')
          .update({ is_active: false })
          .eq('id', userLicense.id);

        return new Response(
          JSON.stringify({ isValid: false, message: 'License expired' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      await supabase
        .from('user_licenses')
        .update({ last_validated: new Date().toISOString() })
        .eq('id', userLicense.id);

      const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return new Response(
        JSON.stringify({
          isValid: true,
          expiresAt: userLicense.expires_at,
          daysLeft,
          license: {
            key: userLicense.licenses.license_key,
            durationDays: userLicense.licenses.duration_days,
          },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /license-service-api/info
    if (path.endsWith('/info') && req.method === 'GET') {
      return new Response(
        JSON.stringify({
          service: 'License Service API',
          version: '1.0.0',
          endpoints: {
            register: 'POST /license-service-api/register',
            login: 'POST /license-service-api/login',
            activate: 'POST /license-service-api/activate',
            validate: 'POST /license-service-api/validate',
          },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    // Log full error details server-side only
    console.error('Error in license service:', error);
    
    // Return safe error message to client
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: getSafeErrorMessage(error) 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});