
# FontHub — Decisiones técnicas y bitácora de desarrollo

> Documento compartible para el equipo. **Estado:** planificación técnica y preparación del entorno. **Última actualización:** 2026-11-10. No implica que las funcionalidades ya estén implementadas.

## 1. Propósito del proyecto

FontHub será una aplicación web para crear, editar, guardar, publicar, explorar, descargar y comercializar fuentes tipográficas digitales, con licencias que regulen usos personales/comerciales, modificación y redistribución. Incluirá un editor vectorial básico, gestor de proyectos, catálogo, perfiles, compras/ventas, moderación y una API documentada.

## 2. Acuerdos confirmados

- **Arquitectura basada en servicios:** el profesor acepta módulos funcionales que exponen operaciones mediante APIs; no exige microservicios ni despliegues independientes.
- **Frontend:** React + Vite; estilos con Tailwind CSS.
- **Backend:** Supabase Edge Functions en TypeScript/Deno; **no se usará Laravel** inicialmente.
- **Identidad:** Supabase Auth; permisos y protección de datos mediante RLS y verificaciones de autorización en las funciones.
- **Datos estructurados:** Supabase PostgreSQL.
- **Archivos:** Supabase Storage, con protección para tipografías de pago y proyectos privados.
- **Despliegue web previsto:** Vercel; Edge Functions y datos alojados en Supabase. No se necesita Railway en la arquitectura actual.
- **Repositorio y colaboración:** Git + GitHub, usando ramas, commits y revisiones de cambios.
- **API:** interfaces por dominio funcional y documentación OpenAPI.
- **Editor tipográfico:** interacción de dibujo y modificación de glifos en el navegador; estudiar opentype.js para crear/exportar TTF antes de comprometer su implementación final.

## 3. Servicios lógicos propuestos

| Módulo / Edge Function propuesta | Responsabilidad |
|---|---|
| Supabase Auth | Registro, inicio/cierre de sesión, recuperación de acceso e identidad |
| `projects-api` | Proyectos tipográficos, borradores y guardado |
| `fonts-api` | Publicación, edición de publicaciones, catálogo y metadatos |
| `licenses-api` | Catálogo y condiciones de licencias |
| `purchases-api` | Inicio y registro de adquisiciones |
| `payments-webhook` | Confirmaciones autenticadas del proveedor de pagos |
| `downloads-api` | Comprobar permisos y emitir enlaces temporales de descarga |
| `moderation-api` | Reportes, suspensiones y restablecimientos |
| `notifications-api` | Notificaciones a usuarios |

Los nombres y la cantidad de funciones **son preliminares**: se podrán fusionar o separar tras concretar contratos y permisos. No deben convertirse automáticamente en llamadas HTTP para cada acción del editor.

### Flujo de una solicitud

1. React consume las APIs correspondientes (Supabase Auth y Edge Functions).
2. La función valida identidad cuando corresponda y permisos sobre el recurso.
3. La función aplica las reglas de negocio y consulta PostgreSQL / Storage.
4. Los datos se protegen con RLS y/o acceso de servidor de privilegio controlado; ninguna clave secreta de servidor llega al navegador.

**Seguridad fundamental:** la clave pública de Supabase puede estar en el frontend con RLS correctamente configuradas; nunca exponer una clave `service_role` o secret de servidor. Las adquisiciones deben confirmarse desde un webhook validado, no por una afirmación del navegador. Las descargas de pago deben requerir verificación de derechos.

## 4. Alcance inicial acordado

### Esencial

1. Identidad, perfiles y roles: visitante, usuario, moderador y administrador.
2. Editor de glifos vectoriales básico: crear/modificar caracteres, líneas, curvas y puntos; dimensiones y espaciado; previsualización.
3. Proyectos privados: crear, guardar, recuperar, editar y eliminar; exportación de fuente TTF válida (factibilidad técnica por probar).
4. Consulta básica de caracteres incluidos y faltantes; metadatos declarados por los publicadores.
5. Catálogo público, filtros y búsqueda; publicación de TTF, OTF y ZIP bajo validación de tipo/tamaño/estructura.
6. Licencias, descargas gratuitas y descargas de pago autorizadas.
7. Adquisiciones con proveedor de pagos **en modo de pruebas**, historial de compras/ventas.
8. Reportes, suspensión y restauración moderada; notificaciones.
9. API documentada y autorización/RLS.

**Publicación:** tras validaciones automáticas, una fuente puede aparecer directamente en catálogo; moderación posterior por reportes o incumplimientos. La plataforma no garantiza que un autor posea todos los derechos sobre un archivo.

### Complementario / no comprometido para la primera entrega

- **Primera mejora si queda tiempo:** generador de CSS para uso autorizado de fuentes.
- **Después:** importación y modificación de fuentes existentes, solo si su licencia lo permite.
- **Posteriormente:** laboratorio de comparación tipográfica y colaboración entre usuarios.
- Fuera del alcance inicial: IA, fuentes variables, edición profesional completa, aplicaciones móviles nativas, edición colaborativa en tiempo real y procesamiento bancario propio.

## 5. Orden de implementación acordado

| Orden | Entrega objetivo |
|---|---|
| 1 | Entorno de trabajo, estructura y autenticación; gestor de proyectos; editor básico; guardado y exportación TTF |
| 2 | Catálogo, publicación, metadatos, validación de archivos, licencias y descargas |
| 3 | Compras de prueba, ventas, reportes, moderación y notificaciones |
| 4 (opcional) | Generador CSS |
| 5 (futuro) | Importación/edición de fuentes, laboratorio y colaboración |

Se priorizará entregar funcionalidades completas y comprobables, no solo pantallas estáticas. La exportación TTF debe validarse con una prueba de concepto temprana por su riesgo técnico.

## 6. Estructura del repositorio (estado actual confirmado)

```text
FontHub/
├── .gitignore                 # Exclusiones de la raíz
├── README.md                  # Presentación del proyecto
├── frontend/                  # React + Vite + Tailwind
│   ├── .gitignore             # Generado por Vite
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── layout/
│       │   └── ui/            # Button.jsx, Card.jsx, Input.jsx
│       ├── context/
│       ├── features/
│       │   ├── auth/
│       │   ├── catalog/
│       │   ├── editor/
│       │   ├── licenses/
│       │   ├── moderation/
│       │   ├── projects/
│       │   └── purchases/
│       ├── hooks/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       └── styles/            # theme.css
└── docs/                     # Añadir esta bitácora
```

Las carpetas vacías no son rastreadas por Git. `supabase/` **no se ha inicializado todavía**: se creará con Supabase CLI. En el frontend existe una pantalla de demostración visual, sin navegación ni backend funcional. El diseño es **cómic moderno/neobrutalista y responsive**; se mantiene separado de la arquitectura y reglas de negocio.

## 7. Decisiones pendientes

- Nombre definitivo de la aplicación (nombre de repositorio confirmado: `fonthub`).
- Completar el monorepo existente (`frontend/`) con `supabase/` y documentación técnica.
- Conjunto de glifos mínimo y alcance real de edición/exportación TTF.
- Modelo relacional, políticas RLS, roles y reglas de visibilidad.
- Contratos definitivos de las Edge Functions, validación y límites de archivos ZIP.
- Proveedor de pagos de prueba y política de adquisición de licencias.
- Cronograma académico, responsables y criterios de aceptación.
- Límites de costos y cuotas de Supabase/Vercel.

## 8. Bitácora

| Fecha | Estado | Acuerdo / avance |
|---|---|---|
| 2026-11-10 | Decidido | React + Vite + Tailwind; Supabase Auth/PostgreSQL/Storage/Edge Functions; Vercel. No Laravel ni Railway inicialmente. |
| 2026-11-10 | Decidido | El profesor acepta módulos con APIs para arquitectura basada en servicios. |
| 2026-11-10 | Verificado | Windows: Node v26.13.0, npm 12.2.0, Git 2.47.1; Linux: Node v24.21.0, npm 12.2.0, Git 2.53.0. |
| 2026-11-10 | Verificado | Git inicializado en `main`, `origin` configurado a https://github.com/P4quiton/fonthub.git. |
| 2026-11-10 | Verificado | React + Vite v8.3.7 inicializado en `frontend/`; Tailwind instalado e integrado; `npm run build` tuvo éxito (20 módulos, 265 ms). |
| 2026-11-10 | Verificado | `npm run lint` sin errores. `npm audit --omit=dev` sin vulnerabilidades detectadas; la auditoría completa reportó cuatro moderadas ligadas a `minimatch`/ESLint. No ejecutar `npm audit fix --force` sin revisar. |
| 2026-11-10 | Verificado visualmente | Se confirmó Tailwind y componentes `Button`, `Card`, `Input`, pantalla demostrativa cómic y estructura `features/`. Se solicitó diseño responsive; faltan pruebas sistemáticas a 320/375/768 px. |
| 2026-11-10 | Confirmado | `.gitignore` en raíz y otro en `frontend/`; se creó `README.md`. |
| 2026-11-10 | Último estado Git reportado | Rama `main`, aún **sin commits**; sin seguimiento: `.gitignore`, `README.md`, `frontend/`. |

## 9. Próxima acción: documentación y primer commit

1. Copiar este archivo a `docs/FONTHUB_DECISIONES_Y_AVANCE.md` dentro de la carpeta local.
2. Revisar `git status --short --untracked-files=all` y `git check-ignore` para asegurar que no se preparen dependencias, compilaciones ni secretos.
3. Verificar que el remoto no tenga commits ajenos antes de hacer push (`git ls-remote --heads origin`).
4. Preparar con `git add .gitignore README.md frontend docs/FONTHUB_DECISIONES_Y_AVANCE.md`, inspeccionar `git diff --cached --name-only` y `git diff --cached --stat`.
5. Crear el primer commit y subir `main` después de validar los archivos.

**Nota para el equipo:** actualizar esta bitácora con los cambios efectivos; distinguir acuerdos, propuestas y funcionalidades realmente probadas.
