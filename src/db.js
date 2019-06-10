import * as Crypto from './crypto-utils.js';

export const list = () => Object.keys(localStorage);

async function initDb(password) {
    const db = {};
    db.meta = {};

    db.meta.aesSalt = Crypto.generateSalt();
    db.meta.verificationSalt = Crypto.generateSalt();
    db.meta.iv = Crypto.generateIv();
    db.meta.verificationKey = await Crypto.deriveVerificationKey(password, db.meta.verificationSalt);

    const aesKey = await Crypto.deriveAESKey(password, db.meta.aesSalt);
    db.entries = await Crypto.encrypt(JSON.stringify({}), aesKey, db.meta.iv); 

    return db;
}

export async function Database(name, password) {
    const data = localStorage.getItem(name);
    const db = data ? JSON.parse(data) : await initDb(password);
    const meta = db.meta;

    let modified = !data ? true : false;
    
    const verificationKey = await Crypto.deriveVerificationKey(password, meta.verificationSalt);

    if (verificationKey !== meta.verificationKey) {
        throw new Error('Invalid password');
    }

    const aesKey = await Crypto.deriveAESKey(password, meta.aesSalt);

    db.entries = JSON.parse(await Crypto.decrypt(db.entries, aesKey, meta.iv));

    return {
        entries() {
            return Object.values(db.entries);
        },
        get(id) {
            return db.entries[id];
        },
        add(id, password) {
            db.entries[id] = { id, password };
            modified = true;
        },
        async rename(newName) {
            localStorage.removeItem(name);
            name = newName;
            modified = true;
            await this.save();
        },
        async save() {
            if (modified) {
                db.entries = await Crypto.encrypt(JSON.stringify(db.entries), aesKey, meta.iv);
                localStorage.setItem(name, JSON.stringify(db));
                modified = false;
            }
        },
        drop() {
            localStorage.removeItem(name);
        },
    };
}

