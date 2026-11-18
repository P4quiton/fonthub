# Contrato de Integración: Editor -> Catálogo

Cuando un usuario decida publicar una fuente desde el editor, el editor deberá enviar la siguiente información al backend de publicaciones (`fonts-api`):

1. **Archivo tipográfico**: Archivo TTF o OTF generado.
2. **Archivo de vista previa**: Imagen (PNG/JPG) o generaremos una automáticamente.
3. **Metadatos**:
   - `project_id`: UUID del proyecto de origen.
   - `font_name`: Nombre de la fuente.
   - `description`: Texto descriptivo.
   - `tags`: Array de strings.
   - `category`: Categoría (ej. Sans Serif, Serif, Display).
   - `license_id`: UUID de la licencia seleccionada.
   - `price`: Número (0 si es gratis).