# FontHub — Registro de pruebas de autenticación y seguridad

**Alcance:** Supabase Auth, Google OAuth, `public.profiles`, RLS y Edge Function `profiles-api`. Las pruebas descritas son funcionales y de autorización básicas; no constituyen una auditoría completa de seguridad.

## 1. Escenarios comprobados

| ID | Prueba | Resultado observado |
|---|---|---|
| AUTH-01 | Iniciar sesión mediante Google | Satisfactorio |
| AUTH-02 | Utilizar dos cuentas distintas | Cada cuenta obtuvo su propio UUID |
| AUTH-03 | Crear perfil al registrarse | Trigger creó un registro en `public.profiles` |
| AUTH-04 | Asignar rol inicial | Rol `user` |
| AUTH-05 | Recargar la página o reiniciar Vite con sesión activa | Sesión persistente |
| AUTH-06 | Acceder desde el despliegue de Vercel | Google OAuth y persistencia tras recarga satisfactorios |
| SEC-01 | Consultar perfiles con dos sesiones | Cada usuario visualizó su perfil |
| SEC-02 | Intentar cambiar `role` a `admin` | Operación rechazada |
| SEC-03 | Intentar modificar el perfil de otra cuenta | Ninguna fila ajena modificada |
| SEC-04 | Comprobar los datos después de las pruebas | Roles y nombres ajenos conservados |
| API-01 | Invocar `profiles-api` desde React con sesión | Perfil devuelto y mostrado en la interfaz |
| API-02 | GET a `profiles-api` sin encabezado Authorization | HTTP 401, sin datos del perfil |

## 2. Configuración que se probó

`public.profiles` utiliza un UUID relacionado con `auth.users`, controles RLS y permisos limitados para lectura y actualización autorizada del nombre. El trigger `on_auth_user_created` ejecuta `public.handle_new_user()` para crear un perfil con rol inicial `user`.

Archivos correspondientes:

- `supabase/migrations/20261113_001_create_profiles.sql`
- `supabase/migrations/20261113_002_auto_create_profiles.sql`
- `supabase/functions/profiles-api/index.ts`
- `frontend/src/services/profilesService.js`

## 3. Consulta autenticada a profiles-api

**Procedimiento:** iniciar sesión con Google, invocar `getMyProfile()` desde React y observar la respuesta de la función en DevTools → Network.

**Resultado:** la respuesta contenía `profile.id`, `profile.name`, `profile.role` y `profile.created_at`. En el ejemplo probado, `role` era `user` y `name` estaba vacío (`""`), por lo que la interfaz mostró «Sin nombre». La respuesta se procesó correctamente.

**Evidencia recomendada:** captura de la solicitud y pestaña Response de DevTools, ocultando encabezados con credenciales, tokens e identificadores personales que no sean necesarios para la entrega.

## 4. Rechazo de solicitud sin autenticación

**Procedimiento:** enviar un GET a la URL pública de `profiles-api` sin encabezado `Authorization` y consultar la respuesta.

**Resultado observado:**

```text
HTTP: 401 Unauthorized
code: UNAUTHORIZED_NO_AUTH_HEADER
message: Missing authorization header
```

No se devolvió ningún objeto `profile`. Esta prueba confirma el rechazo de esa solicitud sin encabezado, **no** demuestra por sí sola la validez de todos los escenarios posibles de autorización.

**Evidencia recomendada:** captura de Console/Network mostrando el estado 401 y el mensaje; no incluir tokens.

## 5. Pruebas aún pendientes

- Verificar la modificación permitida del `name` propio.
- Verificar explícitamente JWT inválido y JWT válido de otro usuario en `profiles-api`.
- Probar permisos específicos de `moderator` y `admin` cuando se implemente su funcionalidad.
- Validar cambios y recuperación de sesión y manejo de errores de autenticación.
- Verificar el retorno a una ruta privada (por ejemplo `/editor`) tras OAuth, sin confundir navegación con autorización de datos.
- Repetir las pruebas del servicio de perfiles en el frontend desplegado cuando se integre la nueva navegación.
- Implementar y probar RLS de proyectos tipográficos, acceso a Storage y límites de archivo.
- Validar controles de compras, licencias y descargas antes de ponerlos en operación.

## 6. Conclusión

Los escenarios observados respaldan que Google OAuth funciona, que los usuarios probados tienen perfiles separados y que las políticas evaluadas impiden modificaciones indebidas. La Edge Function respondió a la sesión autenticada y rechazó una solicitud sin `Authorization` con HTTP 401.

Las pruebas futuras deberán documentarse con fecha, resultado y evidencia, distinguiendo lo comprobado de lo pendiente.
