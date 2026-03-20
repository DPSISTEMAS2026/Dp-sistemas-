// ===============================================
// SERVICE WORKER - PWA Offline Support
// LoMas Rico Restaurant System
// ===============================================

const CACHE_VERSION = 'lomasrico-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const OFFLINE_ORDERS_STORE = 'offline-orders';

// Archivos estáticos a cachear
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/admin.html',
    '/owner.html',
    '/cocina.html',
    '/meson.html',
    '/caja.html',
    '/checkout.html',
    '/styles.css',
    '/admin.css',
    '/manifest.json',
    '/offline.html'
];

// ===============================================
// INSTALACIÓN DEL SERVICE WORKER
// ===============================================
self.addEventListener('install', (event) => {
    console.log('[SW] Instalando Service Worker...');

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Cacheando archivos estáticos');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[SW] Service Worker instalado correctamente');
                return self.skipWaiting(); // Activar inmediatamente
            })
            .catch((error) => {
                console.error('[SW] Error durante la instalación:', error);
            })
    );
});

// ===============================================
// ACTIVACIÓN DEL SERVICE WORKER
// ===============================================
self.addEventListener('activate', (event) => {
    console.log('[SW] Activando Service Worker...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name.startsWith('lomasrico-') && name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
                        .map((name) => {
                            console.log('[SW] Eliminando cache antigua:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Service Worker activado');
                return self.clients.claim(); // Tomar control de todas las páginas
            })
    );
});

// ===============================================
// INTERCEPTAR PETICIONES (FETCH)
// ===============================================
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignorar peticiones de otros dominios (excepto APIs necesarias)
    if (url.origin !== location.origin && !url.href.includes('pedidosya.com')) {
        return;
    }

    // Estrategia para peticiones API
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(networkFirstStrategy(request));
        return;
    }

    // Estrategia para archivos estáticos
    event.respondWith(cacheFirstStrategy(request));
});

// ===============================================
// ESTRATEGIA: CACHE FIRST (Archivos Estáticos)
// ===============================================
async function cacheFirstStrategy(request) {
    try {
        // Intentar obtener del cache primero
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Si no está en cache, obtener de la red
        const networkResponse = await fetch(request);

        // Guardar en cache dinámico
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());

        return networkResponse;

    } catch (error) {
        console.error('[SW] Error en cache-first:', error);

        // Si falla todo, retornar página offline
        const offlineResponse = await caches.match('/offline.html');
        return offlineResponse || new Response('Offline', { status: 503 });
    }
}

// ===============================================
// ESTRATEGIA: NETWORK FIRST (API Calls)
// ===============================================
async function networkFirstStrategy(request) {
    try {
        // Intentar obtener de la red primero
        const networkResponse = await fetch(request);

        // Si es exitoso, actualizar cache
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());

        return networkResponse;

    } catch (error) {
        console.error('[SW] Error en network-first:', error);

        // Si falla la red, intentar obtener del cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Si es un POST de pedido, guardarlo offline
        if (request.method === 'POST' && request.url.includes('/api/orders')) {
            return handleOfflineOrder(request);
        }

        // Retornar error
        return new Response(JSON.stringify({
            error: 'offline',
            message: 'Sin conexión. El pedido se guardará y enviará automáticamente al reconectar.'
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// ===============================================
// MANEJO DE PEDIDOS OFFLINE
// ===============================================
async function handleOfflineOrder(request) {
    try {
        // Clonar la petición para leer el body
        const requestClone = request.clone();
        const orderData = await requestClone.json();

        // Abrir IndexedDB
        const db = await openOfflineDB();

        // Guardar pedido offline
        const offlineOrder = {
            id: `offline-${Date.now()}`,
            data: orderData,
            timestamp: new Date().toISOString(),
            synced: false
        };

        await saveOfflineOrder(db, offlineOrder);

        console.log('[SW] Pedido guardado offline:', offlineOrder.id);

        // Retornar respuesta exitosa
        return new Response(JSON.stringify({
            success: true,
            offline: true,
            orderId: offlineOrder.id,
            message: 'Pedido guardado. Se enviará automáticamente al reconectar.'
        }), {
            status: 202, // Accepted
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('[SW] Error guardando pedido offline:', error);
        return new Response(JSON.stringify({
            error: 'storage_error',
            message: 'No se pudo guardar el pedido offline'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// ===============================================
// INDEXEDDB - Almacenamiento Offline
// ===============================================
function openOfflineDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('LoMasRicoDB', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains(OFFLINE_ORDERS_STORE)) {
                const store = db.createObjectStore(OFFLINE_ORDERS_STORE, { keyPath: 'id' });
                store.createIndex('synced', 'synced', { unique: false });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
    });
}

function saveOfflineOrder(db, order) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([OFFLINE_ORDERS_STORE], 'readwrite');
        const store = transaction.objectStore(OFFLINE_ORDERS_STORE);
        const request = store.add(order);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function getOfflineOrders(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([OFFLINE_ORDERS_STORE], 'readonly');
        const store = transaction.objectStore(OFFLINE_ORDERS_STORE);
        const index = store.index('synced');
        const request = index.getAll(false); // Solo no sincronizados

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function markOrderAsSynced(db, orderId) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([OFFLINE_ORDERS_STORE], 'readwrite');
        const store = transaction.objectStore(OFFLINE_ORDERS_STORE);
        const request = store.get(orderId);

        request.onsuccess = () => {
            const order = request.result;
            if (order) {
                order.synced = true;
                order.syncedAt = new Date().toISOString();
                const updateRequest = store.put(order);
                updateRequest.onsuccess = () => resolve();
                updateRequest.onerror = () => reject(updateRequest.error);
            } else {
                resolve();
            }
        };
        request.onerror = () => reject(request.error);
    });
}

// ===============================================
// SINCRONIZACIÓN EN BACKGROUND
// ===============================================
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-orders') {
        console.log('[SW] Iniciando sincronización de pedidos offline...');
        event.waitUntil(syncOfflineOrders());
    }
});

async function syncOfflineOrders() {
    try {
        const db = await openOfflineDB();
        const offlineOrders = await getOfflineOrders(db);

        console.log(`[SW] Encontrados ${offlineOrders.length} pedidos offline`);

        for (const order of offlineOrders) {
            try {
                // Intentar enviar el pedido
                const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(order.data)
                });

                if (response.ok) {
                    // Marcar como sincronizado
                    await markOrderAsSynced(db, order.id);
                    console.log('[SW] Pedido sincronizado:', order.id);

                    // Notificar al usuario
                    self.registration.showNotification('Pedido Enviado', {
                        body: `El pedido ${order.id} se envió exitosamente`,
                        icon: '/icon-192.png',
                        badge: '/badge-72.png'
                    });
                }
            } catch (error) {
                console.error('[SW] Error sincronizando pedido:', order.id, error);
            }
        }

        return Promise.resolve();

    } catch (error) {
        console.error('[SW] Error en sincronización:', error);
        return Promise.reject(error);
    }
}

// ===============================================
// DETECCIÓN DE RECONEXIÓN
// ===============================================
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'ONLINE') {
        console.log('[SW] Conexión restaurada, iniciando sincronización...');
        syncOfflineOrders();
    }

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('[SW] Service Worker cargado');
