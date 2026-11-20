CREATE TABLE public.fonts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    license_id UUID REFERENCES public.licenses(id) ON DELETE RESTRICT NOT NULL,
    file_url TEXT NOT NULL,       -- URL en Supabase Storage del archivo TTF/OTF
    preview_url TEXT,             -- URL de la imagen de vista previa
    tags TEXT[] DEFAULT '{}',     -- Array de etiquetas para búsquedas
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'suspended', 'draft')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activar RLS
ALTER TABLE public.fonts ENABLE ROW LEVEL SECURITY;

-- Política 1: Cualquiera (incluso sin sesión) puede ver las fuentes publicadas
CREATE POLICY "Public can view published fonts"
ON public.fonts FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Política 2: Los autores pueden hacer todo con sus propias fuentes
CREATE POLICY "Authors can manage their own fonts"
ON public.fonts FOR ALL
TO authenticated
USING ((SELECT auth.uid()) = author_id)
WITH CHECK ((SELECT auth.uid()) = author_id);