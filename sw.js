const CACHE_NAME = 'cocktail-pwa-v2';


// 1. Recursos del App Shell (Cache Only)
const appShellAssets = [
    './',
    './index.html',
    './main.js',
    './styles.css',
];


// 2. JSON de Fallback para la API (usado cuando la red falla)
const OFFLINE_COCKTAIL_JSON = {
    drinks: [{
        idDrink: "00000",
        strDrink: "🚫 ¡Sin Conexión ni Datos Frescos!",
        strTags: "FALLBACK",
        strCategory: "Desconectado",
        strInstructions: "No pudimos obtener resultados en este momento. Este es un resultado GENÉRICO para demostrar que la aplicación NO SE ROMPE. Intenta conectarte de nuevo.",
        strDrinkThumb: "https://via.placeholder.com/200x300?text=OFFLINE",
        strIngredient1: "Servicio Worker",
        strIngredient2: "Fallback JSON"
    }]
};

self.addEventListener('install', event => {
    console.log('[SW] ⚙️ Instalando y precacheando el App Shell...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(appShellAssets);
        })
            .then(() => self.skipWaiting()) // Forzamos la activación
    );
});
self.addEventListener('activate', event => {
    console.log('[SW] 🚀 Service Worker Activado.');
    // Opcional: Limpieza de cachés antiguas aquí
    event.waitUntil(self.clients.claim());
});


self.addEventListener('fetch', event => {

    const requestUrl = new URL(event.request.url);
    const pathname = requestUrl.pathname;
    
    const scopePrefix = '/CosoPWA/'; 
    
    const isAppShellRequest = appShellAssets.some(asset => {
        let normalizedPathname = pathname.startsWith(scopePrefix) ? pathname.substring(scopePrefix.length) : pathname.substring(1);
        
        return normalizedPathname === asset.substring(2) || (asset === './' && normalizedPathname === 'index.html');
    });


    if (isAppShellRequest) {
        console.log(`[SW] 🔒 App Shell: CACHE ONLY para ${pathname}`);
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    return response || new Response('App Shell Asset Missing', { status: 500 });
                })
        );
        return;
    }

    if (requestUrl.host === 'www.thecocktaildb.com' && requestUrl.pathname.includes('/search.php')) {
        console.log('[SW] 🔄 API: NETWORK-FIRST con Fallback a JSON Genérico.');
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    console.log('[SW] ❌ Fallo de red. Devolviendo JSON de Fallback.');
                    return new Response(JSON.stringify(OFFLINE_COCKTAIL_JSON), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                })
        );
        return;
    }
});