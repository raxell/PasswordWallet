export default function DbStore(sessionExpiration = 60 * 5) {
    const dbs = new Map();

    const newExpiration = () => Date.now() + sessionExpiration * 1000;

    return {
        get(name) {
            const db = dbs.get(name);

            // Session expired
            if (!db || db.expiration <= Date.now()) {
                return null;
            }

            db.expiration = newExpiration();

            return db.db;
        },
        create(name) {
            dbs.set(name, {
                db: {}, // @TODO: create a db instance
                expiration: newExpiration(),
            });
        },
        auth() {
            // @TODO: try to access the diven db and add it if auth passes
        },
    }
}

