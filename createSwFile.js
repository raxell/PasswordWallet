const Fs = require('fs');
const Path = require('path');

function getStaticAssets(path, prefix = '') {
    const files = [];

    // No need to use the async API
    for (const file of Fs.readdirSync(path, { withFileTypes: true })) {
        if (file.isDirectory()) {
            files.push(...getStaticAssets(Path.join(path, file.name), Path.join(prefix, file.name)));
        } else if (file.isFile()) {
            files.push(Path.join(prefix, file.name));
        }
    }

    return files;
}

const swFileContent = `
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('v1')
            .then((cache) => cache.addAll([
                "/",
${getStaticAssets(Path.join(__dirname, 'dist')).map((name) => '"/' + name + '"').join(',\n')}
            ])
        )
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then((res) => res || fetch(event.request))
    );
});
`;

Fs.writeFileSync(Path.join(__dirname, 'dist/sw.js'), swFileContent);

