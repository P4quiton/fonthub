-- FontHub: tabla de perfiles de usuario

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    name TEXT NOT NULL DEFAULT '',

    role TEXT NOT NULL DEFAULT 'user'
        CHECK (role IN ('user', 'moderator', 'admin')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activar seguridad por filas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Retirar permisos predeterminados
REVOKE ALL ON public.profiles FROM anon, authenticated;

-- Permitir consultar el perfil propio
GRANT SELECT ON public.profiles TO authenticated;

-- Solo permitir modificar el nombre;
-- nunca el rol desde la sesión del usuario
GRANT UPDATE (name) ON public.profiles TO authenticated;

CREATE POLICY "Users can read own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);