# FontHub

Plataforma web académica para **crear, administrar, publicar, explorar y comercializar fuentes tipográficas digitales**. El proyecto se desarrolla por módulos que exponen operaciones mediante APIs y comparten servicios de autenticación e infraestructura.

**Estado:** base web, navegación, Google OAuth y primer servicio de perfiles implementados; **editor de fuentes, gestor de proyectos, catálogo, licencias y compras todavía no implementados**.

**Repositorio:** https://github.com/P4quiton/fonthub
**Despliegue de la rama principal:** https://fonthub.vercel.app/

> La navegación nueva se ha comprobado localmente en la rama de trabajo `feature/font-editor`. No se debe asumir que todos esos cambios ya están publicados en Vercel hasta fusionarlos en `main` y verificar el despliegue.

## Tecnologías

| Área | Tecnología | Situación |
|---|---|---|
| Interfaz | React, Vite, Tailwind CSS | Implementada |
| Navegación | React Router | Implementada localmente |
| Backend | Supabase Edge Functions (TypeScript/Deno) | `profiles-api` implementada |
| Autenticación | Supabase Auth + Google OAuth | Probada en local y producción |
| Base de datos | Supabase PostgreSQL | Tabla `profiles` implementada |
| Autorización | Row Level Security (RLS) | Políticas de `profiles` verificadas en escenarios descritos |
| Archivos | Supabase Storage | Previsto; integración de fuentes pendiente |
| Despliegue web | Vercel | Operativo para la versión fusionada en `main` |
| Documentación de APIs | OpenAPI | Prevista |
| Versiones | Git + GitHub | En uso |

## Arquitectura

- **Frontend:** React presenta la navegación, el editor y las páginas de cada módulo.
- **Identidad:** Supabase Auth gestiona Google OAuth y sesiones.
- **Servicios de aplicación:** Edge Functions implementan las operaciones que requieren un backend; el primer servicio es `profiles-api`.
- **Datos:** PostgreSQL con RLS para los recursos propios del usuario; Storage se integrará al publicar o almacenar archivos tipográficos.
- **Editor:** geometría y edición de glifos principalmente en el navegador; persistencia, control de acceso y publicación se conectarán a servicios separados.

La separación por servicios **no exige microservicios independientes**. El frontend no debe incluir credenciales administrativas ni confiar en la protección visual de rutas como mecanismo de autorización del servidor.

## Estructura principal

```text
FontHub/
├── README.md
├── docs/
│   ├── FONTHUB_DECISIONES_Y_AVANCE.md
│   └── PRUEBAS_AUTH_RLS.md
├── frontend/
│   ├── .env.example
│   ├── vercel.json
│   └── src/
│       ├── components/layout/  # Header
│       ├── components/ui/      # Button, Card, Input y estilos compartidos
│       ├── features/auth/      # Servicio de autenticación
│       ├── pages/              # Inicio, login, páginas provisionales
│       ├── routes/             # Rutas protegidas
│       └── services/           # Cliente Supabase y profilesService
└── supabase/
    ├── functions/profiles-api/
    └── migrations/            # Tabla profiles y trigger de creación
```

Otras carpetas de `features/` son reservas para módulos futuros, **no** funcionalidades terminadas.

## Ejecución local

Requiere Node.js y npm compatibles con el `package.json` y el archivo de bloqueo. El equipo ha utilizado Node.js 24/26 en desarrollo.

```bash
git clone https://github.com/P4quiton/fonthub.git
cd fonthub/frontend
npm ci
```

Crea `frontend/.env.local` a partir de `frontend/.env.example`, con los valores de tu proyecto Supabase:

```dotenv
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=TU_CLAVE_PUBLICABLE
```

Estas variables `VITE_` se exponen al navegador: solo deben contener valores públicos. **Nunca** colocar aquí la clave `service_role`, una `secret key`, contraseñas ni secretos de OAuth.

```bash
npm run dev
npm run lint
npm run build
```

La aplicación local suele estar disponible en `http://localhost:5173/`.

Para Google OAuth, el proyecto Supabase debe tener configuradas las URL de redirección locales y de producción. El callback de Google Cloud apunta a Supabase Auth, no a una ruta improvisada del frontend.

## Rutas del frontend

| Ruta | Acceso | Estado |
|---|---|---|
| `/` | Público | Inicio implementado localmente |
| `/login` | Público | Google OAuth implementado |
| `/catalogo` | Público | Página provisional |
| `/editor` | Autenticado | Página provisional |
| `/proyectos` | Autenticado | Página provisional |
| `/perfil` | Autenticado | Página provisional |
| `/compras` | Autenticado | Página provisional |

`ProtectedRoute` es una barrera de navegación; las restricciones reales de datos deben aplicarse en Supabase y sus servicios.

## Funcionalidad ya comprobada

- Autenticación con Google y persistencia tras recargar, en localhost y en el despliegue de Vercel probado.
- Creación de perfiles mediante trigger y asignación del rol inicial `user`.
- Políticas RLS para lectura y modificación restringida de perfiles, probadas con dos usuarios.
- `profiles-api`: respuesta de perfil con sesión y rechazo `401` al omitir `Authorization`.
- Navegación, rutas protegidas, componentes responsive y animaciones neobrutalistas, comprobados localmente.
- ESLint y compilación Vite sin errores en la última verificación compartida.

Ver detalles y limitaciones en `docs/PRUEBAS_AUTH_RLS.md`.

## Trabajo pendiente

1. Fusionar en `main` la navegación y confirmar el despliegue actualizado.
2. Probar completamente el retorno a rutas privadas después de Google OAuth y los cambios de cuenta.
3. Probar la generación e instalación de un archivo de fuente real antes de elegir definitivamente el motor de exportación.
4. Implementar editor vectorial, métricas, previsualización y administración de glifos.
5. Implementar proyectos privados, esquema SQL, RLS y servicio para guardarlos.
6. Implementar catálogo, publicación, licencias, compras, descargas y moderación en los módulos correspondientes.
7. Documentar contratos de API y completar pruebas de seguridad de cada servicio.

## Colaboración

- **Base compartida:** navegación, sesión, componentes UI, servicios comunes y documentación.
- **Editor:** dibujo y edición de glifos, proyectos tipográficos, previsualización y exportación.
- **Otros módulos:** catálogo, publicación, licencias, compras, descargas y moderación.

Los cambios se realizan en ramas de trabajo y se integran mediante Pull Requests. Antes de fusionar se recomienda ejecutar `npm run lint`, `npm run build` y revisar el diff para descartar secretos.

**Documentación adicional:** `docs/FONTHUB_DECISIONES_Y_AVANCE.md` y `docs/PRUEBAS_AUTH_RLS.md`.
