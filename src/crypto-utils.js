/**
 * Wrapper functions around Web Crypto API
 */
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export const bufferToBase64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
export const base64ToBuffer = (str) => Uint8Array.from(atob(str), c => c.charCodeAt(0));

export const randomBytes = (bytes) => crypto.getRandomValues(new Uint8Array(bytes));

export const generateSalt = () => randomBytes(32);
export const generateIv = () => randomBytes(12);

async function deriveKey(password, salt, isEncryptionKey) {
    const passwordKey = await crypto.subtle.importKey(
        'raw',
        textEncoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey'],
    );

    return crypto.subtle.deriveKey(
        {
            salt,
            name: 'PBKDF2',
            hash: 'SHA-256',
            iterations: 2 ** 18,
        },
        passwordKey,
        { name: 'AES-GCM', length: 256 },
        !isEncryptionKey,
        isEncryptionKey ? ['encrypt', 'decrypt'] : ['wrapKey'],
    );
}

export async function deriveVerificationKey(password, salt) {
    const key = await crypto.subtle.exportKey(
        'raw',
        await deriveKey(password, salt, false),
    );

    return bufferToBase64(key);
}

export const deriveAESKey = (password, salt) => deriveKey(password, salt, true);

export async function encrypt(plaintext, key, iv) {
    const ciphertext = await crypto.subtle.encrypt(
        { iv, name: 'AES-GCM' },
        key,
        textEncoder.encode(plaintext),
    );

    return bufferToBase64(ciphertext);
}

export async function decrypt(ciphertext, key, iv) {
    const plaintext = await crypto.subtle.decrypt(
        { iv, name: 'AES-GCM' },
        key,
        base64ToBuffer(ciphertext),
    );

    return textDecoder.decode(plaintext);
}
