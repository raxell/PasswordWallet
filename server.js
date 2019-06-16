const Path = require('path');
const Crypto = require('crypto');
const Hapi = require('hapi');
const Inert = require('inert');

const init = async () => {

    const storage = {};

    const hash = (value) => Crypto.createHash('sha512').update(value).digest('hex');

    const server = Hapi.server({
        port: process.env.PORT || 3000,
        host: 'localhost'
    });

    await server.register(Inert);

    server.route({
        method: 'GET',
        path: '/{path*}',
        handler: {
            directory: {
                path: Path.join(__dirname, './dist'),
            },
        },
    });

    server.route({
        method: 'POST',
        path:'/db',
        handler(req, h) {

            if (storage[req.payload.id]) {
                return h.response({ success: false }).code(400);
            }

            storage[req.payload.id] = {
                data: req.payload.db,
                codeHash: hash(req.payload.code),
            };
            
            return { success: true };
        },
    });

    server.route({
        method: 'GET',
        path: '/db',
        handler(req, h) {
            const db = storage[req.query.id];

            if (!db) {
                return h.response({ success: false, field: 'id', error: `Id "${req.query.id}" does not exist`}).code(400);
            }

            if (hash(req.query.code) !== db.codeHash) {
                return h.response({ success: false, field: 'code', error: 'Invalid code' }).code(400);
            }

            return { success: true, data: db.data };
        },
    })

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();

