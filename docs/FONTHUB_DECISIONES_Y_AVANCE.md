# FontHub — Decisiones técnicas y estado de desarrollo

**Actualizado:** 15 de noviembre de 2026.
**Propósito:** referencia compartida del equipo. Distingue acuerdos, componentes implementados, pruebas realizadas y trabajo pendiente. No es una transcripción de comandos de desarrollo.

## 1. Objetivo y alcance

FontHub busca permitir la creación, edición, guardado, publicación, exploración, descarga y comercialización de tipografías digitales. El alcance previsto abarca editor vectorial básico, proyectos privados, perfiles, catálogo, licencias, adquisiciones de prueba, descargas autorizadas y moderación.

### Funciones previstas para la primera entrega

1. Identidad y perfiles con roles `user`, `moderator` y `admin`; visitantes sin sesión pueden acceder a secciones públicas.
2. Editor de glifos vectoriales: contornos, nodos y curvas, métricas, espaciado y previsualización.
3. Proyectos privados: crear, guardar, recuperar, modificar y eliminar.
4. Exportación de una fuente tipográfica instalable; la factibilidad y el formato exacto **siguen pendientes de prueba de concepto**.
5. Catálogo público, búsqueda, metadatos y publicación de fuentes con validación de archivos.
6. Licencias y controles de descarga para fuentes gratuitas y adquiridas.
7. Adquisiciones con proveedor de pagos en modo de pruebas, registros de compras y ventas.
8. Moderación por reportes y notificaciones.
9. Contratos de APIs y autorización de operaciones.

**Opcionales o posteriores:** generador CSS; importación y edición de fuentes existentes cuando las licencias lo permitan; comparación tipográfica y colaboración. No se incluyen inicialmente IA, fuentes variables ni editor profesional completo.

## 2. Acuerdos técnicos

| Tema | Decisión |
|---|---|
| Arquitectura | Módulos funcionales con APIs; el docente no exige microservicios independientes |
| Frontend | React + Vite + Tailwind CSS |
| Rutas | React Router |
| Diseño | Cómic/neobrutalista y responsive |
| Backend | Supabase Edge Functions con TypeScript/Deno |
| Datos | Supabase PostgreSQL |
| Identidad | Supabase Auth con Google OAuth |
| Seguridad | RLS, permisos limitados por rol y validaciones de servidor |
| Archivos | Supabase Storage, a implementar para recursos tipográficos |
| Despliegue | Frontend en Vercel, servicios en Supabase |
| Documentación de APIs | OpenAPI prevista |
| Versionamiento | GitHub, ramas por funcionalidad y Pull Requests |

**No se utiliza Laravel ni Railway** en la arquitectura acordada. La clave publicable de Supabase puede estar en el frontend, pero las claves administrativas y secretos de OAuth no.

## 3. Estado verificado del proyecto

| Componente | Estado | Alcance de la verificación |
|---|---|---|
| React/Vite/Tailwind y UI básica | Implementado | Compilación y visualización local |
| Supabase JS | Implementado | Cliente configurado desde variables de entorno |
| Google OAuth y sesión persistente | Implementado | Probado en local y en Vercel |
| `public.profiles` y trigger de alta | Implementado | Probado con cuentas de Google |
| RLS de perfiles | Implementado | Pruebas de lectura y denegación de cambios indebidos |
| `profiles-api` | Implementado y desplegado | Consulta autenticada y rechazo sin Authorization |
| Menú responsive y rutas | Implementado en rama local | Navegación y rutas protegidas probadas en desarrollo |
| Vercel | Desplegado | Versión de `main` disponible; navegación nueva pendiente de integrar y verificar en producción |
| Editor de glifos | Pendiente | No hay edición vectorial real todavía |
| Proyectos tipográficos | Pendiente | No hay persistencia ni `projects-api` implementados |
| Catálogo, publicaciones y compras | Pendiente | Rutas provisionales, sin lógica de negocio |
| Exportación TTF | Pendiente de validación técnica | No se ha producido ni instalado una fuente generada por el editor |

Una página provisional no significa que el módulo correspondiente esté terminado.

## 4. Archivos y responsabilidades actuales

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
│       ├── App.jsx                        # Rutas, sesión y layout general
│       ├── main.jsx                       # BrowserRouter
│       ├── components/layout/Header.jsx   # Navegación responsive
│       ├── components/ui/                 # Button, Card, Input, pressableStyles
│       ├── features/auth/authService.js   # Iniciar/cerrar sesión, obtener usuario
│       ├── pages/                         # HomePage, LoginPage, PlaceholderPage
│       ├── routes/ProtectedRoute.jsx
│       └── services/                      # supabaseClient, profilesService
└── supabase/
    ├── functions/profiles-api/index.ts
    └── migrations/
        ├── 20261113_001_create_profiles.sql
        └── 20261113_002_auto_create_profiles.sql
```

Los directorios `features/editor`, `features/catalog`, `features/projects`, etc. pueden estar reservados aunque estén vacíos. No deben describirse como módulos terminados.

### Servicios existentes

- **Auth:** operaciones de sesión a través de `authService.js` y Supabase Auth.
- **Perfiles:** `profilesService.js` invoca la Edge Function `profiles-api`; devuelve los campos `id`, `name`, `role` y `created_at` del usuario autorizado.
- **PostgreSQL:** `profiles` tiene RLS; el trigger crea perfiles de nuevos usuarios.

La interfaz temporal para probar perfiles ya fue sustituida por la navegación general; el servicio permanece disponible.

### Servicios planeados, no implementados

`projects-api`, `fonts-api`, `licenses-api`, `purchases-api`, `payments-webhook`, `downloads-api`, `moderation-api` y `notifications-api`. Sus nombres y límites podrán ajustarse al definir contratos; no debe hacerse una petición HTTP por cada movimiento de un nodo en el editor.

## 5. Seguridad y límites conocidos

- El cliente utiliza una **Publishable Key**, no una clave de privilegios administrativos.
- No debe subirse `frontend/.env.local` al repositorio ni empaquetarse en ZIP compartidos, aunque sus variables actuales sean publicables.
- La navegación protegida impide abrir ciertas pantallas sin sesión; **no** constituye por sí sola autorización de datos.
- RLS y permisos de SQL limitan operaciones sobre `profiles`, según las pruebas documentadas.
- La llamada autenticada a `profiles-api` devolvió el perfil; una petición sin `Authorization` devolvió `401 UNAUTHORIZED_NO_AUTH_HEADER`.
- La autenticación se mantiene en el navegador mediante el mecanismo de persistencia configurado en Supabase JS; proteger la aplicación contra XSS sigue siendo importante.
- Las pruebas realizadas **no** equivalen a auditoría de seguridad completa.

**Pendiente de seguridad:** verificar expiración/renovación de sesión, cambios de cuenta, validación de rutas de retorno OAuth, actualizaciones autorizadas de nombre, controles RLS para proyectos y Storage, permisos administrativos y seguridad de futuras compras y descargas.

## 6. Navegación implementada localmente

| Ruta | Tipo | Estado | Responsable |
|---|---|---|---|
| `/` | Pública | Inicio | Base común |
| `/login` | Pública | OAuth | Base común |
| `/catalogo` | Pública | Provisional | Compañero |
| `/editor` | Autenticada | Provisional | Editor |
| `/proyectos` | Autenticada | Provisional | Editor |
| `/perfil` | Autenticada | Provisional | Base común |
| `/compras` | Autenticada | Provisional | Compañero |

Archivos: `Header.jsx`, `HomePage.jsx`, `LoginPage.jsx`, `PlaceholderPage.jsx`, `ProtectedRoute.jsx`, `App.jsx`, `main.jsx` y `vercel.json`.

Las interacciones neobrutalistas se usan en `Button.jsx` y `pressableStyles.js`. **Pendiente:** consolidarlas sin duplicación; hacerlo no exige cambiar el sistema de autenticación.

## 7. Trabajo en paralelo

### Editor y proyectos tipográficos

Responsabilidades: modelo de glifos, edición de contornos y nodos, geometría, métricas, previsualización, guardado de proyectos y exportación de fuente. Los proyectos de un usuario deberán mantenerse privados por defecto.

### Catálogo y demás módulos

Responsabilidades: publicaciones, archivos descargables, metadatos, búsqueda, licencias, ventas, descargas autorizadas y moderación.

### Contrato de integración por definir

El editor deberá entregar a publicaciones un archivo tipográfico validado y metadatos claros: identificador del proyecto/propietario, nombre de la familia, estilo, versión, formato real, caracteres soportados y licencia al publicarse. El catálogo **no** debe depender del estado interno del lienzo de dibujo.

La infraestructura común (`supabaseClient`, sesión, layout, componentes UI) se comparte; cada módulo mantiene su lógica y servicios propios.

## 8. Próximas acciones ordenadas

1. Integrar la navegación compartida mediante Pull Request a `main` y verificar Vercel.
2. Confirmar flujo OAuth hacia `/editor` cuando el usuario empieza sin sesión.
3. Abrir una rama dedicada al editor y realizar la prueba de concepto de generación de fuente instalable.
4. Definir modelo de glifos y de proyectos, y documentar el contrato con publicaciones.
5. Implementar el editor vectorial y previsualización.
6. Incorporar persistencia segura de proyectos mediante SQL/RLS y servicios.
7. Implementar/exportar el formato tipográfico que supere la prueba técnica.

## 9. Bitácora resumida

| Fecha | Hito |
|---|---|
| 2026-11-10 | Inicialización React + Vite + Tailwind, estructura y primer diseño cómic |
| 2026-11-13 a 2026-11-15 | Configuración Supabase Auth, perfiles, trigger, migraciones, RLS y Edge Function `profiles-api` |
| 2026-11-15 | Google OAuth y persistencia probados en el despliegue de Vercel |
| 2026-11-15 | `profiles-api` probada con petición autenticada y petición anónima rechazada con HTTP 401 |
| 2026-11-15 | Navegación con React Router, menú responsive, páginas provisionales y animaciones probadas localmente |

**Regla de actualización:** al cerrar un Pull Request, cambiar el estado del componente correspondiente y registrar pruebas realmente ejecutadas. Evitar pegar instrucciones temporales de la conversación dentro de esta bitácora.
