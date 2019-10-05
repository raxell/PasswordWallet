import {
    bufferToBase64,
    base64ToBuffer,
    generateIv,
    generateSalt,
    deriveAESKey,
    deriveVerificationKey,
    encrypt,
    decrypt,
} from './crypto-utils.js';

export const list = () => Object.keys(localStorage);

export const exists = (name) => Boolean(localStorage.getItem(name));
export const exportDb = (name) => localStorage.getItem(name);
export const importDb = (name, data) => localStorage.setItem(name, data);

async function initDb(password) {
    const aesSalt = generateSalt();
    const verificationSalt = generateSalt();
    const iv = generateIv();
    const verificationKey = await deriveVerificationKey(password, verificationSalt);

    const meta = {
        iv: bufferToBase64(iv),
        aesSalt: bufferToBase64(aesSalt),
        verificationSalt: bufferToBase64(verificationSalt),
        verificationKey: bufferToBase64(verificationKey),
    };

    const aesKey = await deriveAESKey(password, aesSalt);
    const entries = await encrypt(JSON.stringify({}), aesKey, iv); 

    return { meta, entries };
}

export async function Database(name, password) {
    const data = localStorage.getItem(name);
    const db = data ? JSON.parse(data) : await initDb(password);
    const meta = db.meta;

    let modified = !data ? true : false;
    
    const verificationKey = await deriveVerificationKey(password, base64ToBuffer(meta.verificationSalt));

    if (verificationKey !== meta.verificationKey) {
        throw new Error('Invalid password');
    }

    const aesKey = await deriveAESKey(password, base64ToBuffer(meta.aesSalt));

    db.entries = JSON.parse(await decrypt(db.entries, aesKey, base64ToBuffer(meta.iv)));

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
                meta.iv = bufferToBase64(generateIv());
                db.entries = await encrypt(JSON.stringify(db.entries), aesKey, base64ToBuffer(meta.iv));
                localStorage.setItem(name, JSON.stringify(db));
                modified = false;
                db.entries = JSON.parse(await decrypt(db.entries, aesKey, base64ToBuffer(meta.iv)));
            }
        },
        drop() {
            localStorage.removeItem(name);
        },
    };
}

