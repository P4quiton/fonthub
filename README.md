
# FontHub

Plataforma web para la creación, gestión, publicación y comercialización de fuentes tipográficas digitales.

## Descripción

FontHub permitirá a los usuarios diseñar tipografías mediante un editor vectorial, administrar proyectos, publicar fuentes gratuitas o de pago y explorar un catálogo de tipografías.

El proyecto utiliza una arquitectura basada en servicios mediante APIs y Supabase Edge Functions.

## Tecnologías

| Componente | Tecnología |
|---|---|
| Frontend | React + Vite |
| Estilos | Tailwind CSS |
| Backend | Supabase Edge Functions (TypeScript/Deno) |
| Autenticación | Supabase Auth |
| Base de datos | Supabase PostgreSQL |
| Almacenamiento | Supabase Storage |
| Seguridad | Row Level Security (RLS) |
| API | Edge Functions y APIs de Supabase |
| Documentación de API | OpenAPI |
| Despliegue frontend | Vercel |
| Control de versiones | Git + GitHub |

## Arquitectura

El sistema se organizará mediante servicios con responsabilidades diferenciadas.

Los principales módulos previstos son:

- Autenticación y usuarios.
- Proyectos tipográficos.
- Catálogo y publicaciones.
- Licencias.
- Compras y ventas.
- Descargas.
- Moderación y notificaciones.

La lógica de negocio se implementará mediante Edge Functions, mientras que Supabase Auth, PostgreSQL y Storage proporcionarán los servicios de infraestructura.

El editor tipográfico funcionará principalmente en el navegador. El guardado y las operaciones que requieran acceso al backend se comunicarán mediante APIs.

## Estructura del proyecto

```text
FontHub/
├── frontend/        # Aplicación React + Vite
├── supabase/        # Edge Functions y migraciones (pendiente)
├── docs/            # Documentación del proyecto
├── .gitignore
└── README.md
```

## Ejecutar el frontend localmente

### Requisitos

- Node.js 24 o superior compatible con las dependencias.
- npm 12.2.0.
- Git.

### Instalación

Clonar el repositorio:

```bash
git clone https://github.com/P4quiton/fonthub.git
cd fonthub
```

Instalar dependencias:

```bash
cd frontend
npm ci
```

Iniciar el servidor de desarrollo:

```bash
npm run dev
```

Abrir la dirección indicada por Vite, normalmente:

http://localhost:5173/

## Estado actual

**En desarrollo.**

Actualmente se ha completado:

- Inicialización de React + Vite.
- Instalación y configuración de Tailwind CSS.
- Definición inicial del estilo visual cómic/neobrutalista.
- Creación de componentes reutilizables `Button`, `Card` e `Input`.
- Organización inicial de carpetas del frontend.
- Verificación de ESLint y compilación inicial.

**Pendiente:**

- Configuración de Supabase.
- Implementación de autenticación.
- Creación de Edge Functions.
- Diseño de base de datos y políticas RLS.
- Desarrollo del editor tipográfico.
- Implementación del catálogo y demás funcionalidades.

Los componentes visuales actuales son demostrativos y todavía no implementan las operaciones del sistema.

## Seguridad

- No subir contraseñas, tokens privados ni claves secretas.
- Utilizar variables de entorno.
- Proteger los recursos mediante autenticación y autorización.
- Configurar políticas RLS para los datos almacenados en Supabase.
- Validar los permisos dentro de las Edge Functions.

## Equipo

Proyecto académico desarrollado de manera colaborativa.

## Documentación

Las decisiones técnicas y los avances se documentarán en la carpeta `docs/`.
