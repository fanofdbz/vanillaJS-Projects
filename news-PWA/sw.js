const cacheName = 'v1';
const staticAssets = [
    './',
    'css/styles.css',
    './app.js',
    // './fallback.json',
    // './images/daftPunk.jpg'
];

//Call install event
self.addEventListener('install', async event => {
    const cache = await caches.open(cacheName);
    cache.addAll(staticAssets);
});

//Call Activate event
self.addEventListener('activate', event => {
    console.log('huha');
    //Remove Unwanted caches
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if(cache !== cacheName){
                        console.log('Service Worker: Clearing old cache')
                        return caches.delete(cache)
                    }
                })
            )
        })
    )
});

//Call fetch event
self.addEventListener('fetch', event => {
    const req = event.request;
    const url = new URL(req.url)

    if(url.origin === location.origin){
        event.respondWith(cacheFirst(req));
    }else {
        event.respondWith(networkFirst(req));
    }
    event.respondWith(cacheFirst(req));
})

async function cacheFirst(req){
    const cachedResponse = await caches.match(req);
    return cachedResponse || fetch(req);
}

async function networkFirst(req){
    const cache = await caches.open('news-dynamic');

    try{
        const res = await fetch(req);
        cache.put(req, res.clone());
        return res;
    }catch(error){
        const cachedResponse = await cache.match(req);
        return cachedResponse || await caches.match('./fallback.json');
    }
}