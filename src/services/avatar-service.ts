import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';
import { UserService } from './user-service';

export interface AvatarUploadOptions {
  maxSize?: number; // in bytes, default 5MB
  allowedTypes?: string[]; // default: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  quality?: number; // for compression, 0-1, default 0.8
  maxWidth?: number; // for resizing, default 300px
  maxHeight?: number; // for resizing, default 300px
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

class AvatarServiceClass {
  private readonly defaultOptions: Required<AvatarUploadOptions> = {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    quality: 0.8,
    maxWidth: 300,
    maxHeight: 300,
  };

  /**
   * Upload avatar image for a user
   */
  async uploadAvatar(
    userId: string,
    file: File,
    options: AvatarUploadOptions = {}
  ): Promise<UploadResult> {
    const opts = { ...this.defaultOptions, ...options };

    try {
      // Validate file
      const validation = this.validateFile(file, opts);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Process image (compress and resize)
      const processedFile = await this.processImage(file, opts);

      // Delete old avatar if exists
      await this.deleteOldAvatar(userId);

      // Upload to Firebase Storage
      const fileName = `avatars/${userId}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, fileName);
      
      const snapshot = await uploadBytes(storageRef, processedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Update user profile with new avatar URL
      await UserService.updateUserProfile(userId, { avatar: downloadURL });

      return { success: true, url: downloadURL };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Delete user's avatar
   */
  async deleteAvatar(userId: string): Promise<UploadResult> {
    try {
      // Get current avatar URL
      const userResult = await UserService.getUserProfile(userId);
      if (!userResult.success || !userResult.data?.avatar) {
        return { success: false, error: 'No avatar to delete' };
      }

      // Delete from storage
      await this.deleteAvatarByUrl(userResult.data.avatar);

      // Update user profile
      await UserService.updateUserProfile(userId, { avatar: '' });

      return { success: true };
    } catch (error) {
      console.error('Error deleting avatar:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed',
      };
    }
  }

  /**
   * Get avatar URL for a user
   */
  async getAvatarUrl(userId: string): Promise<string | null> {
    try {
      const userResult = await UserService.getUserProfile(userId);
      return userResult.success && userResult.data?.avatar || null;
    } catch (error) {
      console.error('Error getting avatar URL:', error);
      return null;
    }
  }

  /**
   * Generate default avatar (initials-based)
   */
  generateDefaultAvatar(name: string, size = 200): string {
    const initials = name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);

    // Generate a consistent color based on name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = Math.abs(hash) % 360;
    const saturation = 70;
    const lightness = 50;

    // Create SVG avatar
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="hsl(${hue}, ${saturation}%, ${lightness}%)"/>
        <text 
          x="50%" 
          y="50%" 
          dominant-baseline="middle" 
          text-anchor="middle" 
          font-family="Arial, sans-serif" 
          font-size="${size * 0.4}px" 
          font-weight="bold" 
          fill="white"
        >
          ${initials}
        </text>
      </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * Validate file before upload
   */
  private validateFile(
    file: File,
    options: Required<AvatarUploadOptions>
  ): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > options.maxSize) {
      const maxSizeMB = (options.maxSize / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        error: `File size must be less than ${maxSizeMB}MB`
      };
    }

    // Check file type
    if (!options.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type not supported. Allowed types: ${options.allowedTypes.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Process image (compress and resize)
   */
  private async processImage(
    file: File,
    options: Required<AvatarUploadOptions>
  ): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > options.maxWidth) {
            height = (height * options.maxWidth) / width;
            width = options.maxWidth;
          }
        } else {
          if (height > options.maxHeight) {
            width = (width * options.maxHeight) / height;
            height = options.maxHeight;
          }
        }

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const processedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(processedFile);
            } else {
              resolve(file); // Fallback to original file
            }
          },
          file.type,
          options.quality
        );
      };

      img.onerror = () => resolve(file); // Fallback to original file
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Delete old avatar from storage
   */
  private async deleteOldAvatar(userId: string): Promise<void> {
    try {
      const userResult = await UserService.getUserProfile(userId);
      if (userResult.success && userResult.data?.avatar) {
        await this.deleteAvatarByUrl(userResult.data.avatar);
      }
    } catch (error) {
      // Non-critical error, continue with upload
      console.warn('Failed to delete old avatar:', error);
    }
  }

  /**
   * Delete avatar by URL from Firebase Storage
   */
  private async deleteAvatarByUrl(url: string): Promise<void> {
    try {
      // Extract path from Firebase Storage URL
      const urlParts = url.split('/');
      const pathIndex = urlParts.findIndex(part => part.includes('avatars'));
      
      if (pathIndex !== -1) {
        const pathParts = urlParts.slice(pathIndex);
        const decodedPath = decodeURIComponent(pathParts.join('/').split('?')[0]);
        const storageRef = ref(storage, decodedPath);
        
        await deleteObject(storageRef);
      }
    } catch (error) {
      console.warn('Failed to delete avatar from storage:', error);
      // Don't throw error as this is cleanup
    }
  }

  /**
   * Create avatar from initials (for batch operations)
   */
  async createInitialsAvatar(
    userId: string,
    name: string,
    size = 200
  ): Promise<UploadResult> {
    try {
      // Generate SVG avatar
      const avatarSvg = this.generateDefaultAvatar(name, size);
      
      // Convert to blob
      const response = await fetch(avatarSvg);
      const blob = await response.blob();
      
      // Create file from blob
      const file = new File([blob], `${userId}-avatar.svg`, {
        type: 'image/svg+xml'
      });

      // Upload as regular avatar
      return this.uploadAvatar(userId, file);
    } catch (error) {
      console.error('Error creating initials avatar:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create avatar',
      };
    }
  }

  /**
   * Batch process avatars for multiple users
   */
  async batchCreateAvatars(
    users: Array<{ id: string; name: string }>
  ): Promise<Array<{ userId: string; success: boolean; url?: string; error?: string }>> {
    const results = [];
    
    for (const user of users) {
      const result = await this.createInitialsAvatar(user.id, user.name);
      results.push({
        userId: user.id,
        success: result.success,
        url: result.url,
        error: result.error,
      });
    }

    return results;
  }
}

export const AvatarService = new AvatarServiceClass();
export const avatarService = AvatarService;