// 定义缓存名称和要缓存的文件
const CACHE_NAME = 'angle-calculator-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-72x72.png',
  './icons/icon-192x192.png'
];

// 安装事件 - 缓存必要文件
self.addEventListener('install', function(event) {
  console.log('Service Worker: 安装中...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: 缓存文件中...');
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        console.log('Service Worker: 安装完成');
        return self.skipWaiting();
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', function(event) {
  console.log('Service Worker: 激活中...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: 删除旧缓存', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      console.log('Service Worker: 激活完成');
      return self.clients.claim();
    })
  );
});

// 拦截网络请求
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // 如果缓存中有，返回缓存内容
        if (response) {
          return response;
        }
        
        // 否则从网络获取
        return fetch(event.request)
          .then(function(response) {
            // 检查响应是否有效
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 克隆响应
            var responseToCache = response.clone();
            
            // 将新请求添加到缓存
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          })
          .catch(function() {
            // 网络请求失败时的处理
            // 可以返回一个离线页面或默认内容
          });
      })
  );
});