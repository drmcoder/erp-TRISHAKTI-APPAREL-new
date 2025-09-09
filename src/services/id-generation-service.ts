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
   * GUARANTEED UNIQUE - Format: TSA-EMP-XXXX (e.g., TSA-EMP-0001, TSA-EMP-0002, etc.)
   */
  static async generateEmployeeId(): Promise<string> {
    try {
      const configRef = doc(db, 'system_config', this.EMPLOYEE_ID_CONFIG_KEY);
      
      // Get current configuration
      const configDoc = await getDoc(configRef);
      
      let config: IDGenerationConfig;
      
      if (!configDoc.exists()) {
        // Initialize with default configuration - but first scan for existing IDs
        const highestExisting = await this.findHighestExistingId();
        config = {
          prefix: 'TSA-EMP',
          length: 4,
          currentCounter: highestExisting, // Start from highest existing
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
      
      // CRITICAL: Keep trying until we find a unique ID
      let attempts = 0;
      let newEmployeeId: string;
      let isUnique = false;
      
      do {
        attempts++;
        const nextCounter = config.currentCounter + attempts;
        const serialNumber = String(nextCounter).padStart(config.length, '0');
        newEmployeeId = `${config.prefix}-${serialNumber}`;
        
        // Double-check uniqueness
        isUnique = await this.isEmployeeIdUnique(newEmployeeId);
        
        if (attempts > 1000) {
          throw new Error('Unable to generate unique employee ID after 1000 attempts');
        }
      } while (!isUnique);
      
      // Update counter to the successful value
      await updateDoc(configRef, {
        currentCounter: config.currentCounter + attempts,
        lastGenerated: newEmployeeId,
        updatedAt: serverTimestamp()
      });
      
      return newEmployeeId;
      
    } catch (error) {
      console.error('Failed to generate employee ID:', error);
      throw new Error('Failed to generate unique employee ID');
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
   * Find highest existing Employee ID number (for initialization)
   */
  static async findHighestExistingId(): Promise<number> {
    try {
      const operatorsRef = collection(db, 'operators');
      const snapshot = await getDocs(operatorsRef);
      
      let highestNumber = 0;
      
      snapshot.forEach(doc => {
        const operator = doc.data();
        if (operator.employeeId) {
          // Extract number from TSA-EMP-XXXX format
          const match = operator.employeeId.match(/TSA-EMP-(\d+)/);
          if (match) {
            const number = parseInt(match[1], 10);
            if (number > highestNumber) {
              highestNumber = number;
            }
          }
        }
      });
      
      return highestNumber;
    } catch (error) {
      console.error('Failed to find highest existing ID:', error);
      return 0;
    }
  }

  /**
   * Generate GUARANTEED unique Employee ID for suggestions
   * This is what should be used in forms
   */
  static async generateUniqueEmployeeIdSuggestion(): Promise<string> {
    try {
      let attempts = 0;
      let suggestedId: string;
      let isUnique = false;
      
      const config = await this.getIDConfig();
      const startCounter = config?.currentCounter || await this.findHighestExistingId();
      
      do {
        attempts++;
        const nextCounter = startCounter + attempts;
        const serialNumber = String(nextCounter).padStart(4, '0');
        suggestedId = `TSA-EMP-${serialNumber}`;
        
        isUnique = await this.isEmployeeIdUnique(suggestedId);
        
        if (attempts > 1000) {
          throw new Error('Unable to generate unique suggestion after 1000 attempts');
        }
      } while (!isUnique);
      
      return suggestedId;
    } catch (error) {
      console.error('Failed to generate unique suggestion:', error);
      // Fallback to timestamp-based ID
      const timestamp = Date.now().toString().slice(-4);
      return `TSA-EMP-${timestamp}`;
    }
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
      const nextPreview = await this.generateUniqueEmployeeIdSuggestion();
      
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