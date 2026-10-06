# Renzo Hub Cloud V2

Proyecto mobile-first/PWA conectado a Supabase.

## Supabase
- Project URL: https://mgncykyrhavpepfggmng.supabase.co
- Usa una publishable key en el frontend (segura para cliente con RLS).
- Tablas: profiles, skin_routine_logs, skin_notes, user_settings.
- Row Level Security activado.

## Autenticación
- Email + contraseña.
- El botón "Crear mi acceso" crea la cuenta.
- Si la confirmación de email está habilitada en Supabase, confirma el correo antes de entrar.

## Sincronización
Skin Routine guarda:
- progreso AM/PM
- notas del día

Los datos quedan sincronizados para la misma cuenta en móvil y portátil.

## Despliegue en Vercel
1. Descomprime esta carpeta.
2. Importa/sube el proyecto a Vercel.
3. Framework preset: Other / Static.
4. Deploy.
5. Abre la URL en Safari iPhone.
6. Compartir → Añadir a pantalla de inicio.

## Seguridad
La publishable key puede estar en frontend. No pongas nunca una service role key en este proyecto.
