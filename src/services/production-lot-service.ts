// Production Lot Service - TSA Real Production Workflow
// Handles cutting to sewing workflow with size/color distribution and operator tracking

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
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  arrayUnion
} from 'firebase/firestore';
import { ref, set, get, onValue, serverTimestamp as rtServerTimestamp } from 'firebase/database';

// TSA Production Workflow Interfaces
export interface ProductionLot {
  id: string;
  lotNumber: string;
  articleNumber: string;
  articleName: string;
  garmentType: 'tshirt' | 'polo' | 'shirt' | 'pants' | 'other';
  totalPieces: number;
  colorSizeBreakdown: ColorSizeBreakdown[];
  processSteps: ProcessStep[];
  currentStep: number;
  status: 'cutting' | 'in_progress' | 'completed' | 'on_hold';
  createdAt: any;
  createdBy: string;
  startedAt?: any;
  completedAt?: any;
  notes: string;
}

export interface ColorSizeBreakdown {
  color: string;
  sizes: SizeQuantity[];
  totalPieces: number;
}

export interface SizeQuantity {
  size: string;
  quantity: number;
  completedQuantity: number;
}

export interface ProcessStep {
  id: string;
  stepNumber: number;
  operation: string;
  operationNepali: string;
  machineType: 'single_needle' | 'overlock' | 'flatlock' | 'buttonhole' | 'button_attach' | 'cutting' | 'finishing' | 'pressing';
  pricePerPiece: number;
  estimatedMinutes: number;
  requiredSkill: 'basic' | 'intermediate' | 'advanced' | 'expert';
  status: 'pending' | 'in_progress' | 'completed';
  assignedOperators: string[];
  completedPieces: number;
  startedAt?: any;
  completedAt?: any;
  dependencies: string[]; // Previous step IDs
}

export interface OperatorWorkEntry {
  id: string;
  operatorId: string;
  operatorName: string;
  lotNumber: string;
  stepId: string;
  operation: string;
  machineType: string;
  color: string;
  size: string;
  assignedPieces: number;
  completedPieces: number;
  pricePerPiece: number;
  totalPrice: number;
  workDate: any;
  status: 'assigned' | 'in_progress' | 'completed';
  startTime?: any;
  endTime?: any;
  qualityNotes: string;
  createdAt: any;
}

export interface MonthlyWageCalculation {
  operatorId: string;
  operatorName: string;
  month: string;
  year: number;
  workEntries: OperatorWorkEntry[];
  totalPieces: number;
  totalEarnings: number;
  totalHours: number;
  efficiency: number;
  bonuses: number;
  deductions: number;
  finalWage: number;
}

// TSA Garment Process Templates
const TSA_PROCESS_TEMPLATES = {
  polo: {
    name: 'Polo T-Shirt',
    nameNepali: 'पोलो टी-शर्ट',
    steps: [
      {
        operation: 'Collar Making',
        operationNepali: 'कलर बनाउने',
        machineType: 'single_needle',
        pricePerPiece: 2.5,
        estimatedMinutes: 3,
        requiredSkill: 'intermediate'
      },
      {
        operation: 'Placket Making',
        operationNepali: 'प्लेकेट बनाउने',
        machineType: 'single_needle',
        pricePerPiece: 2.0,
        estimatedMinutes: 2.5,
        requiredSkill: 'intermediate'
      },
      {
        operation: 'Shoulder Join',
        operationNepali: 'काँध जोड्ने',
        machineType: 'overlock',
        pricePerPiece: 1.5,
        estimatedMinutes: 2,
        requiredSkill: 'basic'
      },
      {
        operation: 'Sleeve Attach',
        operationNepali: 'बाही जोड्ने',
        machineType: 'overlock',
        pricePerPiece: 3.0,
        estimatedMinutes: 4,
        requiredSkill: 'intermediate'
      },
      {
        operation: 'Top Stitch',
        operationNepali: 'माथिल्लो सिलाई',
        machineType: 'flatlock',
        pricePerPiece: 1.0,
        estimatedMinutes: 1.5,
        requiredSkill: 'basic'
      },
      {
        operation: 'Side Seam',
        operationNepali: 'छेउको सिलाई',
        machineType: 'overlock',
        pricePerPiece: 2.0,
        estimatedMinutes: 3,
        requiredSkill: 'basic'
      },
      {
        operation: 'Slit Making',
        operationNepali: 'स्लिट बनाउने',
        machineType: 'single_needle',
        pricePerPiece: 1.5,
        estimatedMinutes: 2,
        requiredSkill: 'basic'
      },
      {
        operation: 'Bottom Hem',
        operationNepali: 'तलको हेम',
        machineType: 'flatlock',
        pricePerPiece: 1.5,
        estimatedMinutes: 2,
        requiredSkill: 'basic'
      },
      {
        operation: 'Finishing',
        operationNepali: 'फिनिशिङ',
        machineType: 'finishing',
        pricePerPiece: 1.0,
        estimatedMinutes: 1,
        requiredSkill: 'basic'
      }
    ]
  },
  tshirt: {
    name: 'T-Shirt',
    nameNepali: 'टी-शर्ट',
    steps: [
      {
        operation: 'Shoulder Join',
        operationNepali: 'काँध जोड्ने',
        machineType: 'overlock',
        pricePerPiece: 1.0,
        estimatedMinutes: 2,
        requiredSkill: 'basic'
      },
      {
        operation: 'Sleeve Attach',
        operationNepali: 'बाही जोड्ने',
        machineType: 'overlock',
        pricePerPiece: 2.0,
        estimatedMinutes: 3,
        requiredSkill: 'basic'
      },
      {
        operation: 'Side Seam',
        operationNepali: 'छेउको सिलाई',
        machineType: 'overlock',
        pricePerPiece: 1.5,
        estimatedMinutes: 2.5,
        requiredSkill: 'basic'
      },
      {
        operation: 'Bottom Hem',
        operationNepali: 'तलको हेम',
        machineType: 'flatlock',
        pricePerPiece: 1.0,
        estimatedMinutes: 1.5,
        requiredSkill: 'basic'
      },
      {
        operation: 'Finishing',
        operationNepali: 'फिनिशिङ',
        machineType: 'finishing',
        pricePerPiece: 0.5,
        estimatedMinutes: 1,
        requiredSkill: 'basic'
      }
    ]
  }
};

class ProductionLotService {
  // Create new production lot from cutting data
  async createProductionLot(lotData: Omit<ProductionLot, 'id' | 'createdAt' | 'processSteps'>): Promise<ProductionLot> {
    try {
      // Generate process steps from template
      const template = TSA_PROCESS_TEMPLATES[lotData.garmentType] || TSA_PROCESS_TEMPLATES.tshirt;
      const processSteps: ProcessStep[] = template.steps.map((step, index) => ({
        id: `step_${index + 1}`,
        stepNumber: index + 1,
        operation: step.operation,
        operationNepali: step.operationNepali,
        machineType: step.machineType as any,
        pricePerPiece: step.pricePerPiece,
        estimatedMinutes: step.estimatedMinutes,
        requiredSkill: step.requiredSkill as any,
        status: index === 0 ? 'pending' : 'pending',
        assignedOperators: [],
        completedPieces: 0,
        dependencies: index > 0 ? [`step_${index}`] : []
      }));

      const newLot: Omit<ProductionLot, 'id'> = {
        ...lotData,
        processSteps,
        currentStep: 1,
        status: 'in_progress',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'productionLots'), newLot);
      
      return {
        id: docRef.id,
        ...newLot,
        createdAt: new Date()
      } as ProductionLot;
    } catch (error) {
      console.error('Error creating production lot:', error);
      throw error;
    }
  }

  // Get production lot with real-time updates
  subscribeToProductionLot(lotId: string, callback: (lot: ProductionLot | null) => void) {
    const lotRef = doc(db, 'productionLots', lotId);
    return onSnapshot(lotRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as ProductionLot);
      } else {
        callback(null);
      }
    });
  }

  // Get all production lots with filters
  async getProductionLots(filters?: {
    status?: ProductionLot['status'];
    garmentType?: ProductionLot['garmentType'];
    createdBy?: string;
  }): Promise<ProductionLot[]> {
    try {
      let q = query(collection(db, 'productionLots'), orderBy('createdAt', 'desc'));

      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters?.garmentType) {
        q = query(q, where('garmentType', '==', filters.garmentType));
      }
      if (filters?.createdBy) {
        q = query(q, where('createdBy', '==', filters.createdBy));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ProductionLot));
    } catch (error) {
      console.error('Error getting production lots:', error);
      throw error;
    }
  }

  // Assign operator to a specific step
  async assignOperatorToStep(lotId: string, stepId: string, operatorId: string): Promise<void> {
    try {
      const lotRef = doc(db, 'productionLots', lotId);
      const lotDoc = await getDoc(lotRef);
      
      if (!lotDoc.exists()) {
        throw new Error('Production lot not found');
      }

      const lot = lotDoc.data() as ProductionLot;
      const updatedSteps = lot.processSteps.map(step => {
        if (step.id === stepId) {
          return {
            ...step,
            assignedOperators: [...(step.assignedOperators || []), operatorId],
            status: 'in_progress' as const,
            startedAt: serverTimestamp()
          };
        }
        return step;
      });

      await updateDoc(lotRef, { processSteps: updatedSteps });
    } catch (error) {
      console.error('Error assigning operator to step:', error);
      throw error;
    }
  }

  // Create operator work entry for piece tracking
  async createOperatorWorkEntry(workData: Omit<OperatorWorkEntry, 'id' | 'createdAt' | 'totalPrice'>): Promise<OperatorWorkEntry> {
    try {
      const totalPrice = workData.completedPieces * workData.pricePerPiece;
      
      const newWorkEntry: Omit<OperatorWorkEntry, 'id'> = {
        ...workData,
        totalPrice,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'operatorWorkEntries'), newWorkEntry);
      
      // Update production lot step progress
      await this.updateStepProgress(workData.lotNumber, workData.stepId, workData.completedPieces);
      
      return {
        id: docRef.id,
        ...newWorkEntry,
        createdAt: new Date()
      } as OperatorWorkEntry;
    } catch (error) {
      console.error('Error creating operator work entry:', error);
      throw error;
    }
  }

  // Update step progress when operator completes pieces
  async updateStepProgress(lotNumber: string, stepId: string, completedPieces: number): Promise<void> {
    try {
      const lotsQuery = query(
        collection(db, 'productionLots'),
        where('lotNumber', '==', lotNumber)
      );
      const lotsSnapshot = await getDocs(lotsQuery);
      
      if (lotsSnapshot.empty) {
        throw new Error('Production lot not found');
      }

      const lotDoc = lotsSnapshot.docs[0];
      const lot = lotDoc.data() as ProductionLot;
      
      const updatedSteps = lot.processSteps.map(step => {
        if (step.id === stepId) {
          const newCompletedPieces = step.completedPieces + completedPieces;
          const isCompleted = newCompletedPieces >= lot.totalPieces;
          
          return {
            ...step,
            completedPieces: newCompletedPieces,
            status: isCompleted ? 'completed' as const : 'in_progress' as const,
            completedAt: isCompleted ? serverTimestamp() : step.completedAt
          };
        }
        return step;
      });

      // Check if we should move to next step
      const currentStepCompleted = updatedSteps.find(s => s.id === stepId)?.status === 'completed';
      const nextStep = updatedSteps.find(s => s.stepNumber === lot.currentStep + 1);
      
      const updateData: any = { processSteps: updatedSteps };
      
      if (currentStepCompleted && nextStep) {
        updateData.currentStep = lot.currentStep + 1;
        // Mark next step as ready if no dependencies
        if (nextStep.dependencies.length === 0 || 
            nextStep.dependencies.every(dep => updatedSteps.find(s => s.id === dep)?.status === 'completed')) {
          updatedSteps[nextStep.stepNumber - 1].status = 'pending';
        }
      }

      // Check if entire lot is completed
      const allStepsCompleted = updatedSteps.every(step => step.status === 'completed');
      if (allStepsCompleted) {
        updateData.status = 'completed';
        updateData.completedAt = serverTimestamp();
      }

      await updateDoc(doc(db, 'productionLots', lotDoc.id), updateData);
    } catch (error) {
      console.error('Error updating step progress:', error);
      throw error;
    }
  }

  // Get operator work entries for wage calculation
  async getOperatorWorkEntries(operatorId: string, month: string, year: number): Promise<OperatorWorkEntry[]> {
    try {
      const startDate = new Date(year, parseInt(month) - 1, 1);
      const endDate = new Date(year, parseInt(month), 0, 23, 59, 59);

      const q = query(
        collection(db, 'operatorWorkEntries'),
        where('operatorId', '==', operatorId),
        where('workDate', '>=', startDate),
        where('workDate', '<=', endDate),
        orderBy('workDate', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as OperatorWorkEntry));
    } catch (error) {
      console.error('Error getting operator work entries:', error);
      throw error;
    }
  }

  // Calculate monthly wages for all operators
  async calculateMonthlyWages(month: string, year: number): Promise<MonthlyWageCalculation[]> {
    try {
      const startDate = new Date(year, parseInt(month) - 1, 1);
      const endDate = new Date(year, parseInt(month), 0, 23, 59, 59);

      const q = query(
        collection(db, 'operatorWorkEntries'),
        where('workDate', '>=', startDate),
        where('workDate', '<=', endDate)
      );

      const snapshot = await getDocs(q);
      const workEntries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as OperatorWorkEntry));

      // Group by operator
      const operatorEntries = workEntries.reduce((acc, entry) => {
        if (!acc[entry.operatorId]) {
          acc[entry.operatorId] = [];
        }
        acc[entry.operatorId].push(entry);
        return acc;
      }, {} as Record<string, OperatorWorkEntry[]>);

      // Calculate wages for each operator
      const wageCalculations: MonthlyWageCalculation[] = [];
      
      for (const [operatorId, entries] of Object.entries(operatorEntries)) {
        const totalPieces = entries.reduce((sum, entry) => sum + entry.completedPieces, 0);
        const totalEarnings = entries.reduce((sum, entry) => sum + entry.totalPrice, 0);
        const totalHours = entries.reduce((sum, entry) => {
          if (entry.startTime && entry.endTime) {
            return sum + (entry.endTime.toDate().getTime() - entry.startTime.toDate().getTime()) / (1000 * 60 * 60);
          }
          return sum;
        }, 0);

        const operatorName = entries[0]?.operatorName || 'Unknown';
        const efficiency = totalHours > 0 ? (totalPieces / totalHours) : 0;

        wageCalculations.push({
          operatorId,
          operatorName,
          month,
          year,
          workEntries: entries,
          totalPieces,
          totalEarnings,
          totalHours,
          efficiency,
          bonuses: 0, // Can be calculated based on efficiency or quality
          deductions: 0,
          finalWage: totalEarnings
        });
      }

      return wageCalculations;
    } catch (error) {
      console.error('Error calculating monthly wages:', error);
      throw error;
    }
  }

  // Get real-time production statistics
  subscribeToProductionStats(callback: (stats: any) => void) {
    return onSnapshot(collection(db, 'productionLots'), (snapshot) => {
      const lots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductionLot));
      
      const stats = {
        totalLots: lots.length,
        activeLots: lots.filter(lot => lot.status === 'in_progress').length,
        completedLots: lots.filter(lot => lot.status === 'completed').length,
        totalPieces: lots.reduce((sum, lot) => sum + lot.totalPieces, 0),
        completedPieces: lots.reduce((sum, lot) => 
          sum + lot.processSteps.reduce((stepSum, step) => stepSum + step.completedPieces, 0), 0
        )
      };
      
      callback(stats);
    });
  }

  // Get available process templates
  getProcessTemplates() {
    return TSA_PROCESS_TEMPLATES;
  }
}

export const productionLotService = new ProductionLotService();
export default productionLotService;