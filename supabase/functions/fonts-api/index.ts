import { withSupabase } from 'npm:@supabase/server@1'

export default {
  fetch: withSupabase(
    { auth: 'user' },
    async (req, ctx) => {
      if (req.method !== 'POST') {
        return Response.json({ error: 'Método no permitido' }, { status: 405 })
      }

      const userId = ctx.userClaims?.id
      if (!userId) {
        return Response.json({ error: 'Usuario no autenticado' }, { status: 401 })
      }

      // Extraer los datos del cuerpo de la petición
      const body = await req.json()

      // Validaciones básicas
      if (!body.name || !body.category_id || !body.license_id || !body.file_url) {
        return Response.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
      }

      // Insertar en la base de datos con los permisos RLS del usuario
      const { data, error } = await ctx.supabase
        .from('fonts')
        .insert({
          author_id: userId,
          name: body.name,
          description: body.description || '',
          category_id: body.category_id,
          price: body.price || 0,
          license_id: body.license_id,
          file_url: body.file_url,
          tags: body.tags || [],
          status: 'published'
        })
        .select()
        .single()

      if (error) {
        console.error('Error al publicar fuente:', error)
        return Response.json({ error: 'Error al guardar la fuente' }, { status: 500 })
      }

      return Response.json({ message: 'Fuente publicada', font: data }, { status: 201 })
    }
  )
}