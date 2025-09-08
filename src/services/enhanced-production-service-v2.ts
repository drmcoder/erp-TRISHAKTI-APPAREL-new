// Enhanced Production Service V2 - Clean implementation
import { db, rtdb } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { ref, set, onValue } from 'firebase/database';

// Clean interface definitions - using different export syntax
interface CuttingColorSize {
  color: string;
  rollsUsed: number;
  kgUsed: number;
  layers: number;
  sizes: {
    size: string;
    pieces: number;
    bundlesCreated: number;
  }[];
  totalPieces: number;
}

interface CuttingDroplet {
  id: string;
  lotNumber: string;
  articleNumber: string;
  articleName: string;
  garmentType: 'tshirt' | 'polo' | 'shirt' | 'pants';
  totalRolls: number;
  totalKg: number;
  colorSizeData: CuttingColorSize[];
  createdAt: any;
  createdBy: string;
  status: 'cutting' | 'ready_for_sewing' | 'in_production' | 'completed';
}

interface ProductionBundle {
  id: string;
  bundleNumber: string;
  lotNumber: string;
  articleNumber: string;
  color: string;
  size: string;
  pieces: number;
  currentStep: number;
  processSteps: BundleProcessStep[];
  status: 'ready' | 'in_progress' | 'completed' | 'on_hold';
  assignedOperators: string[];
  createdAt: any;
  startedAt?: any;
  completedAt?: any;
}

interface BundleProcessStep {
  stepNumber: number;
  operation: string;
  operationNepali: string;
  machineType: string;
  pricePerPiece: number;
  estimatedMinutes: number;
  canRunParallel: boolean;
  dependencies: number[];
  status: 'waiting' | 'ready' | 'in_progress' | 'completed' | 'skipped';
  assignedOperator?: string;
  completedPieces: number;
  startTime?: any;
  endTime?: any;
  qualityNotes?: string;
}

class EnhancedProductionServiceV2 {
  async createCuttingDroplet(cuttingData: Omit<CuttingDroplet, 'id' | 'createdAt'>): Promise<CuttingDroplet> {
    try {
      const docRef = await addDoc(collection(db, 'cuttingDroplets'), {
        ...cuttingData,
        createdAt: serverTimestamp()
      });
      
      return {
        id: docRef.id,
        ...cuttingData,
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Error creating cutting droplet:', error);
      throw error;
    }
  }

  async createBundlesFromCutting(cuttingDropletId: string): Promise<ProductionBundle[]> {
    // Simplified implementation for testing
    return [];
  }
}

const enhancedProductionService = new EnhancedProductionServiceV2();

// Export everything explicitly at the end
export { 
  CuttingColorSize, 
  CuttingDroplet, 
  ProductionBundle, 
  BundleProcessStep, 
  enhancedProductionService 
};

export default enhancedProductionService;