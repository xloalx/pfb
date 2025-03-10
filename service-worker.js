
const CACHE_NAME = 'preflight-cache-v1';
const urlsToCache = [
    '/',
    '/preFlightBrief.html',
    '/manifest.json',
    '/main.js',
    '/user-info.js',
    '/airports.js',
    '/aircraft.js',
    '/weatherIcons.js',
    '/wxImages',
    '/icons',
];

self.addEventListener('install', event => {
    console.log('Service Worker installing.');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('Failed to open cache:', error);
            })
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker activating.');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    // Filter out requests with unsupported schemes
    if (event.request.url.startsWith('http')) {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    // Cache hit - return response
                    if (response) {
                        return response;
                    }
                    return fetch(event.request).then(
                        function(response) {
                            // Check if we received a valid response
                            if (!response || response.status !== 200 || response.type !== 'basic') {
                                return response;
                            }

                            // IMPORTANT: Clone the response. A response is a stream
                            // and because we want the browser to consume the response
                            // as well as the cache consuming the response, we need
                            // to clone it so we have two streams.
                            var responseToCache = response.clone();

                            caches.open(CACHE_NAME)
                                .then(function(cache) {
                                    cache.put(event.request, responseToCache);
                                });

                            return response;
                        }
                    );
                })
        );
    }
});

// Listen for messages from the main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SELECT_DESTINATION') {
        const destination = event.data.destination;
        event.ports[0].postMessage({
            type: 'DESTINATION_SELECTED',
            destination: destination
        });
    }
});