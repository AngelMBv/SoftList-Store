// Estrategia 0: only net
//Estrategia 1: Only Cache
//Estrategia 2: 2 first cache then network
// Estrategia 3: first network then cache
self.addEventListener('install', e => {

    const imagenes = caches.open('mi-cache').then(cache => {
        cache.add('/'),
            cache.add('img/default.png'),
            cache.add('index.html'),
            cache.add('script.js'),
            cache.add('page/categoria'),
            cache.add('page/lista.html'),
            cache.add('page/listad.html'),
            cache.add('page/producto.html'),
            cache.add('sw.js'),
            cache.add('css/bootstrap.min.css'),
            cache.add('manifest.json')
            
    })
  });  
  
self.addEventListener("fetch", (event) => {
  const respuesta = fetch(event.request).then((newResp) => {
    caches.open("mi-cache").then((cache) => {
      cache.put(event.request, newResp);
    });
    return newResp.clone();
  }).catch(err=>{
    return caches.match(event.request); 
  })
  event.respondWith(respuesta);
  });
