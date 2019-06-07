/**
 * Wrapper functions around Web Crypto API
 */

export function randomBytes(bytes) {
    const salt = new Uint8Array(bytes);
    crypto.getRandomValues(salt);

    return salt;
}

export const generateSalt = () => randomBytes(32);
export const generateIv = () => randomBytes(12);

async function deriveKey(password, salt, isEncryptionKey) {
    const passwordKey = await crypto.subtle.importKey(
        'raw',
        (new TextEncoder()).encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey'],
    );

    return crypto.subtle.deriveKey(
        {
            salt,
            name: 'PBKDF2',
            hash: 'SHA-256',
            iterations: isEncryptionKey ? 2 ** 14 : 2 ** 18,
        },
        passwordKey,
        { name: 'AES-GCM', length: 256 },
        isEncryptionKey,
        isEncryptionKey ? ['encrypt', 'decrypt'] : [],
    );
}

export const deriveVerificationKey = (password, salt) => deriveKey(password, salt, false);
export const deriveAESKey = (password, salt) => deriveKey(password, salt, true);

export function encrypt(plaintext, key, iv) {
    return crypto.subtle.encrypt(
        { iv, name: 'AES-GCM' },
        key,
        (new TextEncoder()).encode(plaintext),
    );
}

export function decrypt(ciphertext, key, iv) {
    return crypto.subtle.decrypt(
        { iv, name: 'AES-GCM' },
        key,
        (new TextEncoder()).encode(ciphertext),
    );
}
