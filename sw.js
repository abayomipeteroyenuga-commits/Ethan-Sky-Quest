'use strict';
const CACHE_NAME = 'ethan-quest-v6-online';
const APP_FILES = [
  './',
  './index.html',
  './style.css',
  './game.js?v=online-v6',
  './quest-hub.js?v=online-v6',
  './quest-online.js?v=online-v6',
  './online-config.js?v=online-v6',
  './progression.mjs',
  './manifest.webmanifest',
  './icon.svg',
  './assets/atlas.png',
  './assets/ethan-run.png',
  './assets/powerups.png',
  './assets/environments40.png',
  './assets/bosses40.png',
  './assets/tubes8.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key.startsWith('ethan-quest-') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
        }
        return response;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
