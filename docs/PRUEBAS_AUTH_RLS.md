
# FontHub — Pruebas de autenticación y seguridad RLS

## 1. Objetivo

Verificar el funcionamiento de Supabase Auth, la autenticación mediante Google y las políticas de seguridad RLS aplicadas a la tabla `public.profiles`.

## 2. Tecnologías utilizadas

- React + Vite
- Supabase Auth
- Google OAuth
- Supabase PostgreSQL
- Row Level Security (RLS)
- Supabase JavaScript Client

## 3. Pruebas realizadas

| ID | Prueba | Resultado |
|---|---|---|
| AUTH-01 | Iniciar sesión mediante Google | Correcto |
| AUTH-02 | Iniciar sesión con dos cuentas diferentes | Correcto |
| AUTH-03 | Asignar un UUID diferente a cada cuenta | Correcto |
| AUTH-04 | Crear automáticamente perfiles mediante un trigger | Correcto |
| AUTH-05 | Asignar el rol inicial `user` | Correcto |
| SEC-01 | Consultar perfiles desde dos sesiones distintas | Cada usuario visualizó únicamente su perfil |
| SEC-02 | Intentar cambiar el rol propio a `admin` | Operación rechazada |
| SEC-03 | Intentar modificar un perfil ajeno | Ninguna fila modificada |
| SEC-04 | Verificar los perfiles después de las pruebas | Datos y roles originales conservados |

## 4. Configuración de seguridad

La tabla `public.profiles` cuenta con políticas RLS para restringir la consulta y modificación de perfiles.

Se utilizan permisos de columnas para impedir que los usuarios normales actualicen directamente el campo `role`.

La creación de perfiles se realiza mediante la función `public.handle_new_user()` y el trigger `on_auth_user_created`.

## 5. Resultados

Las pruebas realizadas confirmaron que:

- Los usuarios pueden autenticarse mediante Google.
- Cada cuenta tiene un identificador UUID propio.
- Los perfiles nuevos se crean automáticamente.
- Los usuarios autenticados solo visualizan su propio perfil.
- Los usuarios normales no pueden asignarse privilegios administrativos.
- No fue posible modificar los datos de otro usuario durante las pruebas.

## 6. Pruebas pendientes

- Modificación autorizada del nombre del perfil propio.
- Verificación de permisos de moderadores y administradores.
- Seguridad de proyectos tipográficos privados.
- Autorización de las Edge Functions.
- Control de acceso a archivos de Supabase Storage.
- Pruebas de cierre, expiración y renovación de sesiones.

## 7. Conclusión

La autenticación con Google y las restricciones de acceso a perfiles funcionaron correctamente en los escenarios evaluados.

Estas pruebas no constituyen una auditoría completa de seguridad. Las políticas y permisos deberán seguir verificándose conforme se incorporen nuevas funcionalidades.


## Prueba de integración de profiles-api

Se realizó una prueba de integración entre el frontend React y
la Edge Function `profiles-api` de Supabase.

### Procedimiento

1. Iniciar sesión mediante Google OAuth.
2. Ejecutar la función `getMyProfile()` desde React.
3. Enviar una petición GET mediante `supabase.functions.invoke()`.
4. Revisar la respuesta desde DevTools, en Network.
5. Mostrar el nombre y el rol del usuario en la interfaz.

### Resultado

La API devolvió correctamente un objeto `profile` con los campos:

- `id`
- `name`
- `role`
- `created_at`

El usuario autenticado tenía el rol `user`.

El campo `name` estaba vacío, por lo que la interfaz mostró
el texto "Sin nombre".

La respuesta fue procesada correctamente por React y la
información se presentó en la interfaz.

### Estado

Prueba de integración autenticada: satisfactoria.

Pendiente: comprobar explícitamente el rechazo de solicitudes
sin autenticación y realizar las pruebas en producción.

### Evidencia

[Insertar captura de la petición y su respuesta en DevTools]

## Prueba de acceso no autenticado a profiles-api

Se realizó una solicitud GET a la Edge Function `profiles-api`
sin enviar un encabezado Authorization.

### Resultado

- Código HTTP: 401 Unauthorized.
- Código de error: UNAUTHORIZED_NO_AUTH_HEADER.
- Mensaje: Missing authorization header.
- No se devolvió información del perfil.

### Conclusión

La API rechaza solicitudes sin credenciales de autenticación.

La prueba fue satisfactoria.