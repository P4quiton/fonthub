-- Dar permisos de lectura a visitantes y usuarios logueados para las tablas unidas
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT SELECT ON public.licenses TO anon, authenticated;