// supabase/functions/profiles-api/index.ts
import { withSupabase } from 'npm:@supabase/server@1'

export default {
  fetch: withSupabase(
    { auth: 'user' },
    async (req, ctx) => {
      // Solo permitimos consultar el perfil
      if (req.method !== 'GET') {
        return Response.json(
          { error: 'Método no permitido' },
          { status: 405 }
        )
      }

      // Identidad validada por Supabase Auth
      const userId = ctx.userClaims?.id

      if (!userId) {
        return Response.json(
          { error: 'Usuario no autenticado' },
          { status: 401 }
        )
      }

      // Consulta con los permisos RLS del usuario
      const { data, error } = await ctx.supabase
        .from('profiles')
        .select('id, name, role, created_at')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error consultando perfil:', error.code)

        return Response.json(
          { error: 'Error al consultar el perfil' },
          { status: 500 }
        )
      }

      if (!data) {
        return Response.json(
          { error: 'Perfil no encontrado' },
          { status: 404 }
        )
      }

      return Response.json(
        { profile: data },
        { status: 200 }
      )
    }
  ),
}
