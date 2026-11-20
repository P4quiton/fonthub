-- Permite a los visitantes (anon) leer la tabla de fuentes
GRANT SELECT ON public.fonts TO anon, authenticated;

-- Permite a los usuarios logueados (authenticated) crear, editar y borrar sus fuentes
GRANT INSERT, UPDATE, DELETE ON public.fonts TO authenticated;