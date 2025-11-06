// --- Encryption Service ---
// Uses the browser's built-in Web Crypto API for strong encryption.

// IMPORTANT: In a real-world application, the encryption key should be securely
// derived from user credentials (e.g., using PBKDF2) and should not be hardcoded.
// For this simulation, we use a hardcoded key for simplicity.
const SECRET_KEY = 'a-very-secret-key-for-stellar-ai-demo';
let cryptoKey: CryptoKey | null = null;

/**
 * Derives a cryptographic key from the hardcoded secret string.
 * This is done once and cached for performance.
 */
async function getKey(): Promise<CryptoKey> {
  if (cryptoKey) return cryptoKey;

  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(SECRET_KEY),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  cryptoKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode('some-salt-value'), // Salt should be unique per user in a real app
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  return cryptoKey;
}

/**
 * Encrypts a string using AES-GCM.
 * @param plaintext The string to encrypt.
 * @returns A base64-encoded string containing the IV and the ciphertext.
 */
export async function encrypt(plaintext: string): Promise<string> {
  const key = await getKey();
  const enc = new TextEncoder();
  const encoded = enc.encode(plaintext);

  // The Initialization Vector (IV) should be unique for each encryption.
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encoded
  );

  // Combine IV and ciphertext for storage. Prepending the IV is a common practice.
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  // Return as a base64 string for easy storage.
  return btoa(String.fromCharCode.apply(null, Array.from(combined)));
}

/**
 * Decrypts a base64-encoded string that was encrypted with `encrypt`.
 * @param encryptedBase64 The base64-encoded string to decrypt.
 * @returns The original plaintext string.
 */
export async function decrypt(encryptedBase64: string): Promise<string> {
  const key = await getKey();
  
  const encryptedBytes = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

  // Extract the IV from the beginning of the byte array.
  const iv = encryptedBytes.slice(0, 12);
  const ciphertext = encryptedBytes.slice(12);

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    ciphertext
  );

  const dec = new TextDecoder();
  return dec.decode(decrypted);
}
