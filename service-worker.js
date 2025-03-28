const CACHE_NAME = 'mp3-player-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css'
];

// Service Worker Kurulumu
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache ve network talebi yönetimi
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache'den yanıt varsa onu döndür
        if (response) {
          return response;
        }
        
        // Cache'de yoksa ağ isteği yap
        return fetch(event.request)
          .then(response => {
            // Sadece geçerli bir yanıt ise cache'e ekle
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Cache için yanıtın bir kopyasını oluştur (response stream sadece bir kez okunabilir)
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          });
      })
  );
});

// Eski cache'leri temizleme
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 