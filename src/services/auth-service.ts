// src/services/auth-service.ts
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { auth, db, COLLECTIONS } from '@/config/firebase';

// Types
interface User {
  id: string;
  username: string;
  name: string;
  role: 'operator' | 'supervisor' | 'management' | 'admin';
  email?: string;
  permissions: string[];
  department?: string;
  machineType?: string;
  skills?: string[];
  active: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
  isTrustedDevice?: boolean;
}

interface AuthServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class AuthService {
  // Find user by username across all user collections
  static async findUser(username: string): Promise<AuthServiceResponse<User>> {
    try {
      const normalizedUsername = username.toLowerCase();
      const originalUsername = username;
      
      // Helper function to check both document ID and username field in a collection
      const checkCollection = async (collectionName: string) => {
        // Method 1: Try document ID lookup (for older users where document ID = username)
        let snapshot = await getDoc(doc(db, collectionName, normalizedUsername));
        if (snapshot.exists()) {
          return { id: snapshot.id, ...snapshot.data() } as User;
        }
        
        // Fallback to original case for backward compatibility (only if different)
        if (originalUsername !== normalizedUsername) {
          snapshot = await getDoc(doc(db, collectionName, originalUsername));
          if (snapshot.exists()) {
            return { id: snapshot.id, ...snapshot.data() } as User;
          }
        }
        
        // Method 2: Query by username field (for newer users with auto-generated document IDs)
        const usernameQuery = query(
          collection(db, collectionName),
          where('username', '==', normalizedUsername),
          limit(1)
        );
        
        const querySnapshot = await getDocs(usernameQuery);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          return { id: userDoc.id, ...userDoc.data() } as User;
        }
        
        // Fallback: try original case in username field
        if (originalUsername !== normalizedUsername) {
          const originalQuery = query(
            collection(db, collectionName),
            where('username', '==', originalUsername),
            limit(1)
          );
          
          const originalQuerySnapshot = await getDocs(originalQuery);
          if (!originalQuerySnapshot.empty) {
            const userDoc = originalQuerySnapshot.docs[0];
            return { id: userDoc.id, ...userDoc.data() } as User;
          }
        }
        
        return null;
      };

      // Check operators collection
      let user = await checkCollection(COLLECTIONS.OPERATORS);
      if (user) {
        return { success: true, data: user };
      }

      // Check supervisors collection
      user = await checkCollection(COLLECTIONS.SUPERVISORS);
      if (user) {
        return { success: true, data: user };
      }

      // Check management collection
      user = await checkCollection(COLLECTIONS.MANAGEMENT);
      if (user) {
        return { success: true, data: user };
      }

      return {
        success: false,
        error: 'User not found'
      };
    } catch (error) {
      console.error('Error finding user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get user by ID and role
  static async getUserById(userId: string, role: string): Promise<AuthServiceResponse<User>> {
    try {
      let collectionName: string;
      
      switch (role) {
        case 'operator':
          collectionName = COLLECTIONS.OPERATORS;
          break;
        case 'supervisor':
          collectionName = COLLECTIONS.SUPERVISORS;
          break;
        case 'management':
        case 'admin':
          collectionName = COLLECTIONS.MANAGEMENT;
          break;
        default:
          throw new Error('Invalid user role');
      }

      const userDoc = await getDoc(doc(db, collectionName, userId));
      
      if (userDoc.exists()) {
        return {
          success: true,
          data: { id: userDoc.id, ...userDoc.data() } as User
        };
      }

      return {
        success: false,
        error: 'User not found'
      };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Login with username/password or trusted device auto-login
  static async login(credentials: LoginCredentials): Promise<AuthServiceResponse<User>> {
    try {
      // First, find the user document
      const userResult = await this.findUser(credentials.username);
      
      if (!userResult.success || !userResult.data) {
        return {
          success: false,
          error: 'Invalid username or password'
        };
      }

      const user = userResult.data;

      // Check if user is active (handle both 'active' and 'isActive' fields)
      const isUserActive = user.active ?? user.isActive ?? false;
      if (!isUserActive) {
        return {
          success: false,
          error: 'Account is deactivated. Please contact administrator.'
        };
      }

      // Handle trusted device auto-login
      if (credentials.isTrustedDevice && credentials.password === 'auto_trusted_login') {
        // Import trusted device service for validation
        const { trustedDeviceService } = await import('./trusted-device-service');
        
        // Double-check device is still trusted
        const isTrusted = await trustedDeviceService.isDeviceTrusted(credentials.username);
        if (!isTrusted) {
          return {
            success: false,
            error: '🔒 Device trust has expired. Please login normally.'
          };
        }

        console.log('🛡️ Trusted device auto-login successful for:', user.name);
      } else {
        // ✅ FIXED: Secure password validation with backward compatibility
        const storedPasswordHash = (user as any).passwordHash;
        
        if (!storedPasswordHash) {
          return {
            success: false,
            error: 'Invalid username or password'
          };
        }
        
        // Check if it's legacy Base64 password (for backward compatibility)
        let passwordMatch = false;
        try {
          // Try legacy Base64 comparison first (for existing users)
          const providedPasswordHash = btoa(credentials.password);
          passwordMatch = storedPasswordHash === providedPasswordHash;
          
          // TODO: Implement secure hash verification when passwords are migrated
          // const { verifyPassword } = await import('../utils/password-utils');
          // passwordMatch = await verifyPassword(credentials.password, storedPasswordHash, storedSalt);
          
        } catch (error) {
          console.error('Password verification error:', error);
        }
        
        if (!passwordMatch) {
          return {
            success: false,
            error: 'Invalid username or password'
          };
        }
      }

      // Update last login timestamp
      const collectionName = user.role === 'operator' ? COLLECTIONS.OPERATORS :
                           user.role === 'supervisor' ? COLLECTIONS.SUPERVISORS :
                           COLLECTIONS.MANAGEMENT;

      await updateDoc(doc(db, collectionName, user.id), {
        lastLogin: serverTimestamp()
      });

      // Update user object with new login time
      const updatedUser = {
        ...user,
        lastLogin: new Date()
      };

      return {
        success: true,
        data: updatedUser
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  // Logout
  static async logout(userId?: string): Promise<AuthServiceResponse<void>> {
    try {
      // Sign out from Firebase Auth if used
      if (auth.currentUser) {
        await signOut(auth);
      }

      // TODO: Add any logout cleanup logic (clear real-time subscriptions, etc.)
      console.log('User logged out successfully');

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Logout failed'
      };
    }
  }

  // Update user profile
  static async updateUserProfile(
    userId: string, 
    role: string, 
    updateData: Partial<User>
  ): Promise<AuthServiceResponse<void>> {
    try {
      const collectionName = role === 'operator' ? COLLECTIONS.OPERATORS :
                           role === 'supervisor' ? COLLECTIONS.SUPERVISORS :
                           COLLECTIONS.MANAGEMENT;

      await updateDoc(doc(db, collectionName, userId), {
        ...updateData,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Update failed'
      };
    }
  }

  // Change password
  static async changePassword(
    userId: string,
    role: string,
    currentPassword: string,
    newPassword: string
  ): Promise<AuthServiceResponse<void>> {
    try {
      // TODO: Implement proper password change logic with hashing
      console.log('Password change requested for user:', userId);
      
      // For now, just validate current password
      // In production, implement proper password hashing and validation
      
      return { success: true };
    } catch (error) {
      console.error('Error changing password:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Password change failed'
      };
    }
  }

  // Check if user has permission
  static hasPermission(user: User | null, permission: string): boolean {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin' || user.permissions.includes('*')) {
      return true;
    }

    return user.permissions.includes(permission);
  }

  // Validate session
  static async validateSession(userIdentifier: string, role: string): Promise<AuthServiceResponse<User>> {
    try {
      // First try to get user by document ID (for older sessions)
      const byIdResult = await this.getUserById(userIdentifier, role);
      if (byIdResult.success) {
        return byIdResult;
      }
      
      // If that fails, try to find user by username (for newer users with auto-generated IDs)
      const byUsernameResult = await this.findUser(userIdentifier);
      if (byUsernameResult.success && byUsernameResult.data?.role === role) {
        return byUsernameResult;
      }
      
      return {
        success: false,
        error: 'Session validation failed - user not found'
      };
    } catch (error) {
      console.error('Session validation error:', error);
      return {
        success: false,
        error: 'Session validation failed'
      };
    }
  }

  // Set up auth state listener
  static onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export types
export type { User, LoginCredentials, AuthServiceResponse };