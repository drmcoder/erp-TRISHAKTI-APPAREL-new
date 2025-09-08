import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'operator' | 'supervisor' | 'management' | 'admin';
  employeeId: string;
  department?: string;
  phoneNumber?: string;
  profilePicture?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  displayName: string;
  employeeId: string;
  role: 'operator' | 'supervisor' | 'management' | 'admin';
  department?: string;
  phoneNumber?: string;
}

class AuthService {
  private currentUser: User | null = null;
  private userProfile: UserProfile | null = null;

  constructor() {
    // Listen for auth state changes
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      if (user) {
        await this.loadUserProfile(user.uid);
      } else {
        this.userProfile = null;
      }
    });
  }

  // Authentication Methods
  async login(credentials: LoginCredentials): Promise<{ user: User; profile: UserProfile }> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const user = userCredential.user;
      await this.updateLastLogin(user.uid);
      const profile = await this.loadUserProfile(user.uid);

      if (!profile) {
        throw new Error('User profile not found');
      }

      if (!profile.isActive) {
        throw new Error('Account is deactivated. Please contact administrator.');
      }

      return { user, profile };
    } catch (error: any) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  async register(data: RegistrationData): Promise<{ user: User; profile: UserProfile }> {
    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: data.displayName
      });

      // Send email verification
      await sendEmailVerification(user);

      // Create user profile in Firestore
      const profile: UserProfile = {
        uid: user.uid,
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        employeeId: data.employeeId,
        department: data.department,
        phoneNumber: data.phoneNumber,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', user.uid), {
        ...profile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      this.userProfile = profile;
      return { user, profile };
    } catch (error: any) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(auth);
      this.currentUser = null;
      this.userProfile = null;
    } catch (error: any) {
      throw new Error('Failed to logout');
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // User Profile Methods
  private async loadUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        this.userProfile = {
          ...data,
          uid,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          lastLogin: data.lastLogin?.toDate(),
        } as UserProfile;
        return this.userProfile;
      }
      return null;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
    if (!this.currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      const updatedData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, 'users', this.currentUser.uid), updatedData);
      
      // Reload profile
      return await this.loadUserProfile(this.currentUser.uid);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  private async updateLastLogin(uid: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        lastLogin: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  // Getters
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getUserProfile(): UserProfile | null {
    return this.userProfile;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  hasRole(role: string): boolean {
    return this.userProfile?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    return this.userProfile ? roles.includes(this.userProfile.role) : false;
  }

  canAccess(requiredRoles: string[]): boolean {
    if (!this.isAuthenticated() || !this.userProfile) {
      return false;
    }
    return requiredRoles.includes(this.userProfile.role);
  }

  // Admin Methods
  async createUser(userData: RegistrationData): Promise<UserProfile> {
    if (!this.hasRole('admin')) {
      throw new Error('Insufficient permissions');
    }

    const { user, profile } = await this.register(userData);
    return profile;
  }

  async deactivateUser(uid: string): Promise<void> {
    if (!this.hasRole('admin')) {
      throw new Error('Insufficient permissions');
    }

    await updateDoc(doc(db, 'users', uid), {
      isActive: false,
      updatedAt: serverTimestamp(),
    });
  }

  async activateUser(uid: string): Promise<void> {
    if (!this.hasRole('admin')) {
      throw new Error('Insufficient permissions');
    }

    await updateDoc(doc(db, 'users', uid), {
      isActive: true,
      updatedAt: serverTimestamp(),
    });
  }

  // Role-based access helpers
  isOperator(): boolean {
    return this.hasRole('operator');
  }

  isSupervisor(): boolean {
    return this.hasRole('supervisor');
  }

  isManagement(): boolean {
    return this.hasRole('management');
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  // Error message mapping
  private getAuthErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      'auth/user-disabled': 'This account has been disabled.',
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/too-many-requests': 'Too many failed login attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/requires-recent-login': 'Please log in again to continue.',
    };

    return errorMessages[errorCode] || 'An authentication error occurred.';
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;