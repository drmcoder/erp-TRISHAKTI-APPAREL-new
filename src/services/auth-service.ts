// src/services/auth-service.ts
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, COLLECTIONS } from '@/infrastructure/firebase/config';

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
      // Check in operators collection
      const operatorsSnapshot = await getDoc(doc(db, COLLECTIONS.OPERATORS, username));
      if (operatorsSnapshot.exists()) {
        return {
          success: true,
          data: { id: operatorsSnapshot.id, ...operatorsSnapshot.data() } as User
        };
      }

      // Check in supervisors collection
      const supervisorsSnapshot = await getDoc(doc(db, COLLECTIONS.SUPERVISORS, username));
      if (supervisorsSnapshot.exists()) {
        return {
          success: true,
          data: { id: supervisorsSnapshot.id, ...supervisorsSnapshot.data() } as User
        };
      }

      // Check in management collection
      const managementSnapshot = await getDoc(doc(db, COLLECTIONS.MANAGEMENT, username));
      if (managementSnapshot.exists()) {
        return {
          success: true,
          data: { id: managementSnapshot.id, ...managementSnapshot.data() } as User
        };
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

  // Login with username/password
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

      // Check if user is active
      if (!user.active) {
        return {
          success: false,
          error: 'Account is deactivated. Please contact administrator.'
        };
      }

      // Validate password using stored hash
      // For demo purposes, using base64 encoding (NOT secure for production)
      const storedPasswordHash = (user as any).passwordHash;
      const providedPasswordHash = btoa(credentials.password);
      
      if (!storedPasswordHash || storedPasswordHash !== providedPasswordHash) {
        return {
          success: false,
          error: 'Invalid username or password'
        };
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
  static async validateSession(userId: string, role: string): Promise<AuthServiceResponse<User>> {
    try {
      return await this.getUserById(userId, role);
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