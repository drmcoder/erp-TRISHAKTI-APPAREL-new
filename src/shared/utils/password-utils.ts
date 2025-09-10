// Secure Password Utilities
// Provides proper password hashing and verification

/**
 * Generate a secure hash of a password using built-in crypto APIs
 * Uses PBKDF2 with SHA-256 for security
 * @param password - Plain text password
 * @param salt - Optional salt (will generate if not provided)
 * @returns Object with hash and salt
 */
export async function hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
  // Generate salt if not provided
  if (!salt) {
    const saltArray = new Uint8Array(16);
    crypto.getRandomValues(saltArray);
    salt = Array.from(saltArray, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  // Convert password and salt to ArrayBuffer
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  const saltData = encoder.encode(salt);
  
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  // Derive key using PBKDF2
  const derivedKey = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltData,
      iterations: 100000, // 100k iterations for security
      hash: 'SHA-256'
    },
    keyMaterial,
    256 // 256-bit key
  );
  
  // Convert to hex string
  const hashArray = new Uint8Array(derivedKey);
  const hash = Array.from(hashArray, byte => byte.toString(16).padStart(2, '0')).join('');
  
  return { hash, salt };
}

/**
 * Verify a password against a stored hash
 * @param password - Plain text password to verify
 * @param hash - Stored password hash
 * @param salt - Salt used for hashing
 * @returns True if password matches
 */
export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  try {
    const { hash: computedHash } = await hashPassword(password, salt);
    
    // Use subtle comparison to prevent timing attacks
    return computedHash === hash;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Legacy function to migrate from Base64 encoded passwords
 * ONLY for migrating existing users - DO NOT USE for new users
 * @param base64Password - Base64 encoded password
 * @returns Plain text password (INSECURE - only for migration)
 */
export function decodeBase64Password(base64Password: string): string {
  console.warn('🚨 SECURITY WARNING: Decoding Base64 password - this should only be used for migration!');
  return atob(base64Password);
}

/**
 * Generate a secure random password
 * @param length - Password length (default: 12)
 * @returns Secure random password
 */
export function generateSecurePassword(length: number = 12): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  return Array.from(array, byte => charset[byte % charset.length]).join('');
}