import { encrypt, decrypt } from './encryptionService.ts';

const GITHUB_STORAGE_KEY_PREFIX = 'github_storage_';

// NOTE: This is a simulated service. In a real application, these functions
// would make authenticated API calls to GitHub (e.g., to a private Gist or a repo file).
// For this demo, we use localStorage to simulate user-specific cloud storage.

/**
 * Simulates saving encrypted user favorites to GitHub.
 * @param favorites - The array of favorite character IDs.
 * @param token - The user's auth token (for simulated authentication).
 */
export const saveFavorites = async (favorites: string[], token: string): Promise<void> => {
  if (!token) {
    console.error("Save failed: No auth token provided.");
    return;
  }
  console.log("Encrypting and saving favorites to simulated GitHub storage...");
  
  // 1. Encrypt the data
  const encryptedData = await encrypt(JSON.stringify(favorites));
  
  // 2. "Save" to the cloud (using localStorage for simulation)
  // We derive a user-specific key from the token for this simulation.
  const userStorageKey = `${GITHUB_STORAGE_KEY_PREFIX}${token}`;
  localStorage.setItem(userStorageKey, encryptedData);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  console.log("Favorites saved successfully.");
};

/**
 * Simulates loading and decrypting user favorites from GitHub.
 * @param token - The user's auth token.
 * @returns A promise that resolves to the array of favorite character IDs or null.
 */
export const loadFavorites = async (token: string): Promise<string[] | null> => {
  if (!token) {
    console.error("Load failed: No auth token provided.");
    return null;
  }
  console.log("Loading favorites from simulated GitHub storage...");

  // 1. "Load" from the cloud
  const userStorageKey = `${GITHUB_STORAGE_KEY_PREFIX}${token}`;
  const encryptedData = localStorage.getItem(userStorageKey);

  if (!encryptedData) {
    console.log("No favorites found in remote storage for this user.");
    return null;
  }

  // 2. Decrypt the data
  try {
    const decryptedJson = await decrypt(encryptedData);
    console.log("Favorites decrypted successfully.");
    return JSON.parse(decryptedJson);
  } catch (error) {
    console.error("Failed to decrypt favorites:", error);
    // Handle potential data corruption or key mismatch
    return null;
  }
};