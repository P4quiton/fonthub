-- Tabla de licencias
CREATE TABLE public.licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    allows_commercial_use BOOLEAN NOT NULL DEFAULT false,
    allows_modification BOOLEAN NOT NULL DEFAULT false,
    allows_redistribution BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seguridad (RLS)
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

-- Todos (incluso visitantes) pueden ver las licencias
CREATE POLICY "Public can view licenses"
ON public.licenses FOR SELECT
TO anon, authenticated
USING (true);

-- Solo los administradores pueden crear/editar licencias (esto lo haremos luego, por ahora lo dejamos cerrado)
-- Se puede expandir luego con una función RPC o Edge Function.