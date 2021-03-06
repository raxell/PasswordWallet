import { Database } from './db.js';

export default function DbStore(sessionExpiration = 5 * 60) {
    const dbs = new Map();

    const newExpiration = () => Date.now() + sessionExpiration * 1000;

    return {
        get(name) {
            const db = dbs.get(name);

            // Session expired
            if (!db || db.expiration <= Date.now()) {
                dbs.delete(name);
                return null;
            }

            db.expiration = newExpiration();

            return db.db;
        },
        remove(name, { fromDisk } = {}) {
            const db = dbs.get(name).db;

            if (fromDisk) {
                db.drop();
            }

            dbs.delete(name);
        },
        async update({ oldName, newName, newPassword }) {
            const oldDb = dbs.get(oldName).db;

            if (!newPassword || newPassword === '') {
                await oldDb.rename(newName);
                this.remove(oldName);

                return;
            }

            oldDb.drop();
            const newDb = await Database(newName, newPassword);

            for (const { name, user, password } of oldDb.entries()) {
                newDb.add(name, user, password);
            }

            await newDb.save();
            this.remove(oldName);
        },
        async auth(name, password) {
            try {
                const db = await Database(name, password);
                await db.save();

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

