-- 1. Crear tabla de categorías
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Todos pueden ver las categorías
CREATE POLICY "Public can view categories"
ON public.categories FOR SELECT TO anon, authenticated USING (true);

-- Permisos de lectura para el catálogo público
GRANT SELECT ON public.categories TO anon, authenticated;

-- 2. Insertar las categorías base
INSERT INTO public.categories (name) VALUES
('Sans Serif'), ('Serif'), ('Display'), ('Script');

-- 3. Modificar la tabla fonts para usar un ID en lugar de texto
ALTER TABLE public.fonts ADD COLUMN category_id UUID REFERENCES public.categories(id);

-- 4. Migrar los datos existentes (Pasar el texto actual al nuevo ID)
UPDATE public.fonts f
SET category_id = c.id
FROM public.categories c
WHERE f.category = c.name;

-- 5. Eliminar la columna de texto vieja
ALTER TABLE public.fonts DROP COLUMN category;