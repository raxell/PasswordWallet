import * as Crypto from './crypto-utils.js';

export const list = () => Object.keys(localStorage);

export const exists = (name) => Boolean(localStorage.getItem(name));
export const exportDb = (name) => localStorage.getItem(name);
export const importDb = (name, data) => localStorage.setItem(name, data);

async function initDb(password) {
    const db = {};
    db.meta = {};

    db.meta.aesSalt = Crypto.bufferToBase64(Crypto.generateSalt());
    db.meta.verificationSalt = Crypto.bufferToBase64(Crypto.generateSalt());
    db.meta.iv = Crypto.bufferToBase64(Crypto.generateIv());
    db.meta.verificationKey = await Crypto.deriveVerificationKey(password, Crypto.base64ToBuffer(db.meta.verificationSalt));

    const aesKey = await Crypto.deriveAESKey(password, Crypto.base64ToBuffer(db.meta.aesSalt));
    db.entries = await Crypto.encrypt(JSON.stringify({}), aesKey, Crypto.base64ToBuffer(db.meta.iv)); 

    return db;
}

export async function Database(name, password) {
    const data = localStorage.getItem(name);
    const db = data ? JSON.parse(data) : await initDb(password);
    const meta = db.meta;

    let modified = !data ? true : false;
    
    const verificationKey = await Crypto.deriveVerificationKey(password, Crypto.base64ToBuffer(meta.verificationSalt));

    if (verificationKey !== meta.verificationKey) {
        throw new Error('Invalid password');
    }

    const aesKey = await Crypto.deriveAESKey(password, Crypto.base64ToBuffer(meta.aesSalt));

    db.entries = JSON.parse(await Crypto.decrypt(db.entries, aesKey, Crypto.base64ToBuffer(meta.iv)));

    return {
        entries() {
            return Object.values(db.entries);
        },
        get(id) {
            return db.entries[id];
        },
        add(name, user, password) {
            db.entries[name] = { name, user, password };
            modified = true;
        },
        remove(name) {
            delete db.entries[name];
        },
        async rename(newName) {
            localStorage.removeItem(name);
            name = newName;
            modified = true;
            await this.save();
        },
        async save() {
            if (modified) {
                meta.iv = Crypto.bufferToBase64(Crypto.generateIv());
                db.entries = await Crypto.encrypt(JSON.stringify(db.entries), aesKey, Crypto.base64ToBuffer(meta.iv));
                localStorage.setItem(name, JSON.stringify(db));
                modified = false;
                db.entries = JSON.parse(await Crypto.decrypt(db.entries, aesKey, Crypto.base64ToBuffer(meta.iv)));
            }
        },
        drop() {
            localStorage.removeItem(name);
        },
    };
}

