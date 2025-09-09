// ID Generation Service - Auto-generates serial Employee IDs
import { db } from '@/config/firebase';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';

export interface IDGenerationConfig {
  prefix: string;
  length: number;
  currentCounter: number;
  lastGenerated: string;
  updatedAt: Date;
}

export class IDGenerationService {
  private static readonly EMPLOYEE_ID_CONFIG_KEY = 'employee_id_config';
  
  /**
   * Generate next Employee ID with auto-increment serial number
   * Format: TSA-EMP-XXXX (e.g., TSA-EMP-0001, TSA-EMP-0002, etc.)
   */
  static async generateEmployeeId(): Promise<string> {
    try {
      const configRef = doc(db, 'system_config', this.EMPLOYEE_ID_CONFIG_KEY);
      
      // Get current configuration
      const configDoc = await getDoc(configRef);
      
      let config: IDGenerationConfig;
      
      if (!configDoc.exists()) {
        // Initialize with default configuration
        config = {
          prefix: 'TSA-EMP',
          length: 4, // Number of digits for serial (e.g., 0001, 0002)
          currentCounter: 0,
          lastGenerated: '',
          updatedAt: new Date()
        };
        
        await setDoc(configRef, {
          ...config,
          updatedAt: serverTimestamp()
        });
      } else {
        config = configDoc.data() as IDGenerationConfig;
      }
      
      // Generate next ID
      const nextCounter = config.currentCounter + 1;
      const serialNumber = String(nextCounter).padStart(config.length, '0');
      const newEmployeeId = `${config.prefix}-${serialNumber}`;
      
      // Update counter in database
      await updateDoc(configRef, {
        currentCounter: increment(1),
        lastGenerated: newEmployeeId,
        updatedAt: serverTimestamp()
      });
      
      return newEmployeeId;
      
    } catch (error) {
      console.error('Failed to generate employee ID:', error);
      throw new Error('Failed to generate employee ID');
    }
  }
  
  /**
   * Check if Employee ID already exists
   */
  static async isEmployeeIdUnique(employeeId: string): Promise<boolean> {
    try {
      // Check in operators collection using v9 syntax
      const operatorsRef = collection(db, 'operators');
      const q = query(operatorsRef, where('employeeId', '==', employeeId));
      const operatorsSnapshot = await getDocs(q);
      
      return operatorsSnapshot.empty;
    } catch (error) {
      console.error('Failed to check employee ID uniqueness:', error);
      return false;
    }
  }
  
  /**
   * Get current Employee ID configuration
   */
  static async getIDConfig(): Promise<IDGenerationConfig | null> {
    try {
      const configRef = doc(db, 'system_config', this.EMPLOYEE_ID_CONFIG_KEY);
      const configDoc = await getDoc(configRef);
      
      if (configDoc.exists()) {
        return configDoc.data() as IDGenerationConfig;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get ID configuration:', error);
      return null;
    }
  }
  
  /**
   * Update Employee ID configuration (Admin only)
   */
  static async updateIDConfig(config: Partial<IDGenerationConfig>): Promise<void> {
    try {
      const configRef = doc(db, 'system_config', this.EMPLOYEE_ID_CONFIG_KEY);
      
      await updateDoc(configRef, {
        ...config,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to update ID configuration:', error);
      throw new Error('Failed to update ID configuration');
    }
  }
  
  /**
   * Generate preview of next Employee ID without incrementing counter
   */
  static async previewNextEmployeeId(): Promise<string> {
    try {
      const config = await this.getIDConfig();
      
      if (!config) {
        return 'TSA-EMP-0001'; // Default first ID
      }
      
      const nextCounter = config.currentCounter + 1;
      const serialNumber = String(nextCounter).padStart(config.length, '0');
      return `${config.prefix}-${serialNumber}`;
      
    } catch (error) {
      console.error('Failed to preview next employee ID:', error);
      return 'TSA-EMP-0001';
    }
  }
  
  /**
   * Validate Employee ID format
   */
  static validateEmployeeIdFormat(employeeId: string): { valid: boolean; message?: string } {
    // Check if it matches TSA-EMP-XXXX pattern
    const pattern = /^TSA-EMP-\d{4}$/;
    
    if (!pattern.test(employeeId)) {
      return {
        valid: false,
        message: 'Employee ID must follow format: TSA-EMP-XXXX (e.g., TSA-EMP-0001)'
      };
    }
    
    return { valid: true };
  }
  
  /**
   * Get statistics about ID generation
   */
  static async getIDStatistics(): Promise<{
    totalGenerated: number;
    lastGenerated: string;
    nextPreview: string;
  }> {
    try {
      const config = await this.getIDConfig();
      const nextPreview = await this.previewNextEmployeeId();
      
      return {
        totalGenerated: config?.currentCounter || 0,
        lastGenerated: config?.lastGenerated || 'None',
        nextPreview
      };
    } catch (error) {
      console.error('Failed to get ID statistics:', error);
      return {
        totalGenerated: 0,
        lastGenerated: 'None',
        nextPreview: 'TSA-EMP-0001'
      };
    }
  }
}

export default IDGenerationService;