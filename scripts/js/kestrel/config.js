/* KestrelPro: where the admin UI finds the engine. The container rewrites this file at
 * start-up from KESTREL_ENGINE_URL and KESTREL_ENGINE_PORT.
 *   engineUrl: base URL of the engine API, e.g. "/admin/api/kestrel" behind a reverse proxy.
 *              Empty means "same host as this page, on enginePort".
 * This file is copyright under the latest version of the EUPL. */
globalThis.kestrelConfig = { engineUrl: "", enginePort: 8090 };
