# Microapps en Renzo Hub

Desde la 2.9.0 cada microapp se declara una sola vez en `microapps/registry.js`. El shell (`app.js`) genera a partir del registro:

- la sección `<section id="...">` si no existe y su CSS propio;
- la ruta y el enlace directo `?app=<id>` (y `&<deepLink>=valor` si la app lo define);
- el botón del menú que se marca, la pantalla completa y las secciones que se recuerdan al volver;
- las pestañas de cada área (por ejemplo My Finance: Movimientos | Nóminas);
- las tarjetas de Home en "Tus microapps";
- el ciclo de vida: `load()` al iniciar sesión, `open(param)` al entrar, `close()` al salir, `reset()` al cerrar sesión.

Si una microapp falla al cargar, el resto de la app sigue funcionando y esa sección muestra un aviso.

## Crear una microapp

```sh
./scripts/renzo-hub new-microapp <id> "<Nombre>" <area> [domain] [--tab]
# ejemplo: ./scripts/renzo-hub new-microapp habits "Hábitos" body --tab
```

El generador crea `microapps/<id>/<id>.js` desde `tools/microapp-template.js.tpl`, añade la entrada al registro y el módulo a la caché sin conexión de `sw.js`. Después:

1. Ajusta la interfaz del módulo.
2. `npm test` comprueba registro, caché, publicación y kit de datos.
3. Sube `release.json`, cambia `CACHE` en `sw.js` y apunta el cambio en `RENZO-HUB-CURRENT.md`.
4. Rama `feature/*` → PR a `staging` → PR a `main` (solo con OK de Renzo).

## Contrato

```js
export function mountX(root, db, getUser, go) {
  return { load, open(param), close, reset }; // todos opcionales
}
```

`root` es su sección; `db` el cliente Supabase; `getUser()` el usuario actual; `go(id)` navega. Cualquier `[data-open="<id>"]` navega, también en HTML pintado después.

## Datos

- **Apps sencillas** (notas, hábitos, listas): `microapps/records.js` sobre la tabla `hub_records`, que ya existe en staging y producción con RLS por dueño. **Sin migraciones.** Cada app usa un `domain` permitido (`personal, work, body, money, learning, news, system`) y su propio `record_type`.
- **Apps con datos complejos** (como Nóminas): tablas propias con migración aditiva en `supabase/migrations/`, primero en staging, en producción solo con autorización de Renzo.

## Interfaz compartida

`microapps/ui.js`: `headerHTML(id)` (volver, título y pestañas), `emptyHTML()` (estado "sin datos", nunca datos inventados), `noticeHTML()`, `esc`, `euro`, `shortDate`. Estilos `.mx-*` y `.fin-tabs` en `index.html`.

## Pruebas automáticas por microapp

- `tests/registry.test.mjs`: ids, áreas, módulo existente que exporta su `mount`, publicado y en `sw.js`.
- `tests/microapp-kit.test.mjs`: capa de datos y generador.
- `tests/e2e/authenticated.mjs`: navega a todas las secciones del registro y comprueba que cada microapp con módulo se monta y pinta.

## Pendiente

- Skin, Food y Settings siguen dentro de `index.html`/`app.js` (marcadas sin `module` en el registro). Se pueden extraer una a una con el mismo contrato.
- Las áreas (Home, Body, Money...) siguen en `world.js`.
