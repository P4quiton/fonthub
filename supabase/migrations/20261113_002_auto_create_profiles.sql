
-- ============================================================
-- FontHub - Creación automática de perfiles
-- Migración: 20261113_002_auto_create_profiles.sql
--
-- Compatible con:
--   - Registro mediante correo y contraseña
--   - Inicio de sesión con Google OAuth
--
-- Requisito previo:
--   public.profiles debe existir.
-- ============================================================

-- 1. Crear o actualizar la función de registro de perfiles

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        name,
        role
    )
    VALUES (
        NEW.id,
        COALESCE(
            NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
            NULLIF(NEW.raw_user_meta_data ->> 'name', ''),
            ''
        ),
        'user'
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$;

-- 2. Impedir que usuarios normales ejecuten
--    directamente la función

REVOKE ALL ON FUNCTION public.handle_new_user()
FROM PUBLIC;

-- 3. Crear el trigger si no existe, o actualizarlo si existe

CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- 4. Documentar la función en PostgreSQL

COMMENT ON FUNCTION public.handle_new_user()
IS 'FontHub: crea automáticamente un perfil con rol user cuando se registra un usuario en Supabase Auth.';
