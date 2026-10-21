# RISE HUB React Nocturne — estado de importación

Esta carpeta contiene **código fuente real, no una recreación CSS**, de la versión aprobada del prototipo en Lovable:

- Proyecto: https://lovable.dev/projects/ca43e152-f7c7-4c8e-b925-01476b9053da
- Revisión fuente: `c68f0b618b59c16930bf1f6ad0e1b44e0bf81deb`
- Stack original: React 19, TanStack Router / Start, TypeScript, Tailwind CSS 4, componentes UI accesibles.
- Se han trasladado las vistas originales de **Home, Ares, SelfLearn, Gym, Money, Skin, Proyectos y Ajustes**, el sistema visual Nocturne, navegación, layouts y componentes UI.
- Se ha añadido `src/lib/supabase-adapter.mjs` y `src/lib/auth/AuthProvider.tsx` para sesiones Supabase del entorno real, sin credenciales embebidas. La ruta raíz del clon integra `AuthGate`; por ello **no se puede usar esta copia como preview offline sin configurar el entorno QA**.
- La app React no se publica todavía ni sustituye la PWA anterior. El directorio completo `apps/` está excluido de Vercel por `.vercelignore`.

## Pendientes obligatorios

1. **Siete imágenes originales binarias** de `src/assets/`: `ares.jpg`, `gym.jpg`, `hero-eclipse.jpg`, `learn.jpg`, `money.jpg`, `projects.jpg`, `skin.jpg`. Se conservan en el proyecto Lovable original. La API `read_file` devuelve datos JPEG decodificados incorrectamente a texto UTF-8 (caracteres de reemplazo), por lo que no es seguro copiarlos por ese canal. **No sustituir por imágenes inventadas**; importar originales byte a byte mediante GitHub Sync, exportación de proyecto o medio binario verificado.
2. Importar icono/favicons y lockfile originales; ejecutar build React en un runner limpio (solo después de completar imágenes y dependencias).
3. **Eliminar todos los datos simulados** y reescribir las pantallas para consumir las fuentes reales con RLS. El Login y la configuración Supabase son una primera base, pero los módulos aún no tienen la lógica real.
4. Las migraciones de Gym/SelfLearn/Money/Skin/Ares/Work/Nóminas y demás dominios deben preservar CRUD, timestamps, fotos privadas, revisión financiera, reglas de permiso, offline, sincronización y exportaciones.
5. Tests automatizados y manuales en **staging** y iPhone físico, más conciliación de las ramas `main` y `staging`, antes de ningún despliegue.
6. El proyecto de Lovable se mantiene **sin publicar** para mostrar el diseño aprobado; no activar base de datos en Lovable ni conectar la producción a ese prototipo.

## Importante para quien continúe

- No hacer `merge` del clon React a `main`: aún contiene estados de DEMOSTRACIÓN en las rutas originales.
- No ocultar esos estados de demostración ni presentarlos como métricas reales.
- Mantener `AuthGate` y limpiar React Query al cambiar de cuenta; la arquitectura React definitiva debe permanecer protegida por Supabase Auth.
- El punto de entrada de staging para probar React debe ser **independiente**, con su propia build, SW y URL hasta finalizar la migración.
- Fuente de verdad del plan completo: `docs/REACT-MIGRATION-LOVABLE.md`.

**Estado verificable de este directorio:** código TSX/UI copiado, AuthProvider y adapter añadidos; **no build React verificado, no conectividad autenticada de microapps, no producción**.
