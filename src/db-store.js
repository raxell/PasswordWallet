import { Database } from './db.js';

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
        async auth(name, password) {
            try {
                const db = await Database(name, password);
                dbs.set(name, {
                    db,
                    expiration: newExpiration(),
                });

                return db;
            } catch (err) {
                return null;
            }
        },
    }
}

