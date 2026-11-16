
import { withSupabase } from 'npm:@supabase/server@1'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:5173',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

const authenticatedHandler = withSupabase(
  { auth: 'user' },
  async (req, ctx) => {
    if (req.method !== 'GET') {
      return Response.json(
        { error: 'Método no permitido' },
        {
          status: 405,
          headers: corsHeaders,
        },
      )
    }

    const userId = ctx.userClaims?.id

    if (!userId) {
      return Response.json(
        { error: 'Usuario no autenticado' },
        {
          status: 401,
          headers: corsHeaders,
        },
      )
    }

    const { data, error } = await ctx.supabase
      .from('profiles')
      .select('id, name, role, created_at')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error consultando perfil:', error.code)

      return Response.json(
        { error: 'No se pudo consultar el perfil' },
        {
          status: 500,
          headers: corsHeaders,
        },
      )
    }

    return Response.json(
      { profile: data },
      {
        status: 200,
        headers: corsHeaders,
      },
    )
  },
)

export default {
  fetch: (req: Request) => {
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      })
    }

    return authenticatedHandler(req)
  },
}
