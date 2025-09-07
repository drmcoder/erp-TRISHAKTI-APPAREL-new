import type { User } from '@/types/auth';

// Simple JWT-like token structure for the ERP system
interface TokenPayload {
  userId: string;
  username: string;
  role: string;
  permissions: string[];
  iat: number; // issued at
  exp: number; // expires at
}

interface RefreshTokenPayload {
  userId: string;
  iat: number;
  exp: number;
}

export class TokenService {
  private static readonly ACCESS_TOKEN_KEY = 'tsa_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'tsa_refresh_token';
  private static readonly TOKEN_SECRET = 'tsa_erp_secret_key_2024'; // In production, use environment variable
  
  // Token expiration times
  private static readonly ACCESS_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days

  /**
   * Generate a simple token (base64 encoded JSON for demo purposes)
   * In production, use a proper JWT library like jose or jsonwebtoken
   */
  static generateAccessToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      permissions: user.permissions,
      iat: Date.now(),
      exp: Date.now() + this.ACCESS_TOKEN_EXPIRY,
    };

    // Simple base64 encoding for demo (use proper JWT in production)
    const tokenData = {
      header: { alg: 'HS256', typ: 'JWT' },
      payload,
      signature: this.generateSignature(payload),
    };

    return btoa(JSON.stringify(tokenData));
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(userId: string): string {
    const payload: RefreshTokenPayload = {
      userId,
      iat: Date.now(),
      exp: Date.now() + this.REFRESH_TOKEN_EXPIRY,
    };

    const tokenData = {
      payload,
      signature: this.generateSignature(payload),
    };

    return btoa(JSON.stringify(tokenData));
  }

  /**
   * Simple signature generation (use HMAC in production)
   */
  private static generateSignature(payload: any): string {
    const data = JSON.stringify(payload) + this.TOKEN_SECRET;
    // Simple hash for demo - use proper HMAC in production
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  /**
   * Store tokens in localStorage (use httpOnly cookies in production)
   */
  static storeTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  /**
   * Get access token from storage
   */
  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Get refresh token from storage
   */
  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Decode and validate access token
   */
  static validateAccessToken(token: string): { valid: boolean; payload?: TokenPayload; expired?: boolean } {
    try {
      const tokenData = JSON.parse(atob(token));
      const payload = tokenData.payload as TokenPayload;
      
      // Verify signature
      const expectedSignature = this.generateSignature(payload);
      if (tokenData.signature !== expectedSignature) {
        return { valid: false };
      }

      // Check expiration
      if (payload.exp < Date.now()) {
        return { valid: false, expired: true, payload };
      }

      return { valid: true, payload };
    } catch (error) {
      return { valid: false };
    }
  }

  /**
   * Validate refresh token
   */
  static validateRefreshToken(token: string): { valid: boolean; payload?: RefreshTokenPayload; expired?: boolean } {
    try {
      const tokenData = JSON.parse(atob(token));
      const payload = tokenData.payload as RefreshTokenPayload;
      
      // Verify signature
      const expectedSignature = this.generateSignature(payload);
      if (tokenData.signature !== expectedSignature) {
        return { valid: false };
      }

      // Check expiration
      if (payload.exp < Date.now()) {
        return { valid: false, expired: true, payload };
      }

      return { valid: true, payload };
    } catch (error) {
      return { valid: false };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(): Promise<{ success: boolean; accessToken?: string; error?: string }> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        return { success: false, error: 'No refresh token found' };
      }

      const validation = this.validateRefreshToken(refreshToken);
      if (!validation.valid) {
        this.clearTokens();
        return { success: false, error: validation.expired ? 'Refresh token expired' : 'Invalid refresh token' };
      }

      // In a real app, you would make an API call to refresh the token
      // For demo purposes, we'll simulate getting user data and generating a new token
      const userId = validation.payload!.userId;
      
      // Get user data (in real app, this would be from API)
      const userData = this.getUserDataFromStorage(userId);
      if (!userData) {
        return { success: false, error: 'User data not found' };
      }

      // Generate new access token
      const newAccessToken = this.generateAccessToken(userData);
      
      // Store new access token
      localStorage.setItem(this.ACCESS_TOKEN_KEY, newAccessToken);

      return { success: true, accessToken: newAccessToken };
    } catch (error) {
      return { success: false, error: 'Token refresh failed' };
    }
  }

  /**
   * Get user data from token
   */
  static getUserFromToken(): User | null {
    const token = this.getAccessToken();
    if (!token) return null;

    const validation = this.validateAccessToken(token);
    if (!validation.valid || !validation.payload) return null;

    const payload = validation.payload;
    return {
      id: payload.userId,
      username: payload.username,
      name: payload.username, // Will be populated from user data
      role: payload.role as any,
      permissions: payload.permissions,
      active: true,
      createdAt: new Date(),
    };
  }

  /**
   * Check if token is expired and needs refresh
   */
  static isTokenExpiringSoon(token: string, minutes: number = 10): boolean {
    const validation = this.validateAccessToken(token);
    if (!validation.valid || !validation.payload) return true;

    const timeUntilExpiry = validation.payload.exp - Date.now();
    const minutesUntilExpiry = timeUntilExpiry / (1000 * 60);

    return minutesUntilExpiry <= minutes;
  }

  /**
   * Clear all tokens
   */
  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Get session expiry time
   */
  static getSessionExpiry(): number | null {
    const token = this.getAccessToken();
    if (!token) return null;

    const validation = this.validateAccessToken(token);
    return validation.payload?.exp || null;
  }

  /**
   * Helper method to store user data (for demo purposes)
   * In production, this would come from your backend API
   */
  private static getUserDataFromStorage(userId: string): User | null {
    try {
      const userData = localStorage.getItem(`user_${userId}`);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  /**
   * Store user data (for demo purposes)
   */
  static storeUserData(user: User): void {
    localStorage.setItem(`user_${user.id}`, JSON.stringify(user));
  }

  /**
   * Initialize tokens for a user after login
   */
  static initializeTokens(user: User): { accessToken: string; refreshToken: string } {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user.id);
    
    this.storeTokens(accessToken, refreshToken);
    this.storeUserData(user);
    
    return { accessToken, refreshToken };
  }

  /**
   * Auto-refresh token if needed
   */
  static async autoRefreshToken(): Promise<boolean> {
    const token = this.getAccessToken();
    if (!token) return false;

    if (this.isTokenExpiringSoon(token, 10)) {
      const result = await this.refreshAccessToken();
      return result.success;
    }

    return true;
  }
}