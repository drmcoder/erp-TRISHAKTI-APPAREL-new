// Production Lot Management System - Real TSA Production Workflow
// Handles lot creation, step tracking, and operator piece completion

import { db } from '../config/firebase';
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
  Timestamp 
} from 'firebase/firestore';

export interface ProductionLot {
  id: string;
  lotNumber: string; // e.g., "3233", "8082"
  articleNumber: string; // e.g., "tshirt", "polo"
  articleType: 'tshirt' | 'polo' | 'shirt' | 'pants' | 'jacket';
  totalPieces: number; // e.g., 300
  
  // Color and size breakdown
  colorSizeBreakdown: ColorSizeBundle[];
  
  // Production steps with machines and pricing
  productionSteps: ProductionStep[];
  
  // Current status
  status: 'created' | 'in_production' | 'completed' | 'quality_check' | 'shipped';
  currentStep: number;
  completedSteps: number[];
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // management user ID
  supervisorId?: string;
  
  // Progress
  overallProgress: number;
  totalValue: number; // sum of all step prices × pieces
}

export interface ColorSizeBundle {
  id: string;
  lotId: string;
  color: string; // "blue", "green", "black"
  size: string; // "xl", "2xl", "m", "l"
  pieces: number; // 30, 28, 20
  
  // Cutting information
  fabricRolls?: number;
  fabricKg?: number;
  layersCount?: number; // for cutting (20 layers = 20 pieces)
  
  // Bundle tracking through production
  currentStep: number;
  completedSteps: number[];
  assignedOperators: OperatorAssignment[];
  
  status: 'ready' | 'in_production' | 'completed' | 'quality_check';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductionStep {
  stepNumber: number;
  stepName: string;
  machineType: 'single_needle' | 'overlock' | 'flatlock' | 'buttonhole' | 'cutting' | 'finishing';
  operation: string; // "collar_making", "placket_making", "sleeve_join", etc.
  
  // Pricing (varies by article and process)
  pricePerPiece: number; // different for each article type
  
  // Dependencies
  dependsOnStep?: number; // previous step that must complete first
  canRunParallel?: boolean; // can run simultaneously with other steps
  parallelWith?: number[]; // step numbers that can run in parallel
  
  // Skill requirements
  skillRequired: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedMinutesPerPiece: number;
  
  // Quality control
  qualityCheckRequired: boolean;
  defectTolerance: number; // percentage
}

export interface OperatorAssignment {
  operatorId: string;
  operatorName: string;
  bundleId: string; // ColorSizeBundle ID
  stepNumber: number;
  
  // Work completion tracking
  assignedPieces: number;
  completedPieces: number;
  rejectedPieces: number;
  pricePerPiece: number;
  
  // Daily tracking
  workDate: Date;
  startTime?: Date;
  endTime?: Date;
  hoursWorked?: number;
  
  // Payment calculation
  totalEarning: number; // completedPieces × pricePerPiece
  
  status: 'assigned' | 'in_progress' | 'completed' | 'quality_check';
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// Real production workflow templates based on your examples
export const PRODUCTION_WORKFLOWS = {
  'polo': {
    articleType: 'polo' as const,
    steps: [
      {
        stepNumber: 1,
        stepName: 'Collar Making',
        machineType: 'single_needle' as const,
        operation: 'collar_making',
        pricePerPiece: 2.50, // varies by article
        skillRequired: 'intermediate' as const,
        estimatedMinutesPerPiece: 3,
        qualityCheckRequired: true,
        defectTolerance: 5,
        canRunParallel: true,
        parallelWith: [2] // can run with placket making
      },
      {
        stepNumber: 2,
        stepName: 'Placket Making',
        machineType: 'single_needle' as const,
        operation: 'placket_making',
        pricePerPiece: 1.75,
        skillRequired: 'intermediate' as const,
        estimatedMinutesPerPiece: 2.5,
        qualityCheckRequired: false,
        defectTolerance: 8,
        canRunParallel: true,
        parallelWith: [1] // can run with collar making
      },
      {
        stepNumber: 3,
        stepName: 'Sleeve Join',
        machineType: 'overlock' as const,
        operation: 'sleeve_join',
        pricePerPiece: 3.00,
        dependsOnStep: 1, // collar must be done first
        skillRequired: 'intermediate' as const,
        estimatedMinutesPerPiece: 4,
        qualityCheckRequired: true,
        defectTolerance: 3
      },
      {
        stepNumber: 4,
        stepName: 'Top Stitch',
        machineType: 'flatlock' as const,
        operation: 'top_stitch',
        pricePerPiece: 2.25,
        dependsOnStep: 3,
        skillRequired: 'advanced' as const,
        estimatedMinutesPerPiece: 3.5,
        qualityCheckRequired: false,
        defectTolerance: 5
      },
      {
        stepNumber: 5,
        stepName: 'Side Seam',
        machineType: 'overlock' as const,
        operation: 'side_seam',
        pricePerPiece: 2.75,
        dependsOnStep: 4,
        skillRequired: 'intermediate' as const,
        estimatedMinutesPerPiece: 3,
        qualityCheckRequired: true,
        defectTolerance: 3
      },
      {
        stepNumber: 6,
        stepName: 'Slit Making',
        machineType: 'single_needle' as const,
        operation: 'slit_making',
        pricePerPiece: 1.50,
        dependsOnStep: 5,
        skillRequired: 'beginner' as const,
        estimatedMinutesPerPiece: 2,
        qualityCheckRequired: false,
        defectTolerance: 10
      },
      {
        stepNumber: 7,
        stepName: 'Bottom Fold',
        machineType: 'flatlock' as const,
        operation: 'bottom_fold',
        pricePerPiece: 1.25,
        dependsOnStep: 6,
        skillRequired: 'beginner' as const,
        estimatedMinutesPerPiece: 1.5,
        qualityCheckRequired: false,
        defectTolerance: 8
      },
      {
        stepNumber: 8,
        stepName: 'Finishing',
        machineType: 'finishing' as const,
        operation: 'final_finishing',
        pricePerPiece: 2.00,
        dependsOnStep: 7,
        skillRequired: 'intermediate' as const,
        estimatedMinutesPerPiece: 2.5,
        qualityCheckRequired: true,
        defectTolerance: 2
      }
    ]
  },
  
  'tshirt': {
    articleType: 'tshirt' as const,
    steps: [
      {
        stepNumber: 1,
        stepName: 'Shoulder Join',
        machineType: 'overlock' as const,
        operation: 'shoulder_join',
        pricePerPiece: 2.00,
        skillRequired: 'intermediate' as const,
        estimatedMinutesPerPiece: 2.5,
        qualityCheckRequired: true,
        defectTolerance: 5
      },
      {
        stepNumber: 2,
        stepName: 'Side Seam',
        machineType: 'overlock' as const,
        operation: 'side_seam',
        pricePerPiece: 2.50,
        dependsOnStep: 1,
        skillRequired: 'intermediate' as const,
        estimatedMinutesPerPiece: 3,
        qualityCheckRequired: true,
        defectTolerance: 3
      },
      {
        stepNumber: 3,
        stepName: 'Bottom Hem',
        machineType: 'flatlock' as const,
        operation: 'bottom_hem',
        pricePerPiece: 1.75,
        dependsOnStep: 2,
        skillRequired: 'beginner' as const,
        estimatedMinutesPerPiece: 2,
        qualityCheckRequired: false,
        defectTolerance: 8
      },
      {
        stepNumber: 4,
        stepName: 'Finishing',
        machineType: 'finishing' as const,
        operation: 'final_finishing',
        pricePerPiece: 1.50,
        dependsOnStep: 3,
        skillRequired: 'intermediate' as const,
        estimatedMinutesPerPiece: 2,
        qualityCheckRequired: true,
        defectTolerance: 2
      }
    ]
  }
};

class ProductionLotManager {
  
  // Create new production lot (Management function)
  async createProductionLot(
    lotNumber: string,
    articleNumber: string,
    articleType: ProductionLot['articleType'],
    colorSizeBreakdown: Omit<ColorSizeBundle, 'id' | 'lotId' | 'currentStep' | 'completedSteps' | 'assignedOperators' | 'status' | 'createdAt' | 'updatedAt'>[],
    managementUserId: string
  ): Promise<ProductionLot> {
    
    const workflow = PRODUCTION_WORKFLOWS[articleType];
    if (!workflow) {
      throw new Error(`No workflow defined for article type: ${articleType}`);
    }
    
    const totalPieces = colorSizeBreakdown.reduce((sum, bundle) => sum + bundle.pieces, 0);
    const totalValue = this.calculateTotalValue(workflow.steps, totalPieces);
    
    const lotData = {
      lotNumber,
      articleNumber,
      articleType,
      totalPieces,
      colorSizeBreakdown: [], // Will be populated after lot creation
      productionSteps: workflow.steps,
      status: 'created' as const,
      currentStep: 1,
      completedSteps: [],
      createdBy: managementUserId,
      overallProgress: 0,
      totalValue,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Create lot in Firebase
    const lotRef = await addDoc(collection(db, 'productionLots'), lotData);
    const lotId = lotRef.id;
    
    // Create color-size bundles
    const createdBundles = await Promise.all(
      colorSizeBreakdown.map(async (bundle) => {
        const bundleData = {
          ...bundle,
          lotId,
          currentStep: 1,
          completedSteps: [],
          assignedOperators: [],
          status: 'ready' as const,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        const bundleRef = await addDoc(collection(db, 'colorSizeBundles'), bundleData);
        return { id: bundleRef.id, ...bundleData };
      })
    );
    
    // Update lot with bundle references
    await updateDoc(lotRef, {
      colorSizeBreakdown: createdBundles.map(b => b.id),
      updatedAt: serverTimestamp()
    });
    
    const createdLot: ProductionLot = {
      id: lotId,
      ...lotData,
      colorSizeBreakdown: createdBundles,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return createdLot;
  }
  
  // Operator logs their daily work completion
  async logOperatorWork(
    operatorId: string,
    operatorName: string,
    bundleId: string,
    stepNumber: number,
    completedPieces: number,
    rejectedPieces: number = 0,
    notes?: string
  ): Promise<OperatorAssignment> {
    
    // Get bundle and lot information
    const bundleDoc = await getDoc(doc(db, 'colorSizeBundles', bundleId));
    if (!bundleDoc.exists()) {
      throw new Error('Bundle not found');
    }
    
    const bundleData = bundleDoc.data() as ColorSizeBundle;
    const lotDoc = await getDoc(doc(db, 'productionLots', bundleData.lotId));
    const lotData = lotDoc.data() as ProductionLot;
    
    // Find the production step to get pricing
    const productionStep = lotData.productionSteps.find(step => step.stepNumber === stepNumber);
    if (!productionStep) {
      throw new Error(`Step ${stepNumber} not found in production workflow`);
    }
    
    // Calculate earnings
    const totalEarning = completedPieces * productionStep.pricePerPiece;
    
    // Create operator assignment record
    const assignmentData: Omit<OperatorAssignment, 'id'> = {
      operatorId,
      operatorName,
      bundleId,
      stepNumber,
      assignedPieces: bundleData.pieces, // total pieces in bundle
      completedPieces,
      rejectedPieces,
      pricePerPiece: productionStep.pricePerPiece,
      workDate: new Date(),
      totalEarning,
      status: completedPieces >= bundleData.pieces ? 'completed' : 'in_progress',
      notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save to Firebase
    const assignmentRef = await addDoc(collection(db, 'operatorAssignments'), {
      ...assignmentData,
      workDate: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Update bundle progress
    await this.updateBundleProgress(bundleId, stepNumber, completedPieces, bundleData.pieces);
    
    return { id: assignmentRef.id, ...assignmentData };
  }
  
  // Update bundle progress when operator completes work
  private async updateBundleProgress(
    bundleId: string, 
    stepNumber: number, 
    completedPieces: number, 
    totalPieces: number
  ): Promise<void> {
    
    const bundleRef = doc(db, 'colorSizeBundles', bundleId);
    
    // If step is fully completed, mark it as completed
    if (completedPieces >= totalPieces) {
      const bundleDoc = await getDoc(bundleRef);
      const bundleData = bundleDoc.data() as ColorSizeBundle;
      
      const updatedCompletedSteps = [...bundleData.completedSteps];
      if (!updatedCompletedSteps.includes(stepNumber)) {
        updatedCompletedSteps.push(stepNumber);
      }
      
      // Determine next step
      const nextStep = stepNumber + 1;
      
      await updateDoc(bundleRef, {
        completedSteps: updatedCompletedSteps,
        currentStep: nextStep,
        status: updatedCompletedSteps.length === PRODUCTION_WORKFLOWS['polo'].steps.length ? 'completed' : 'in_production',
        updatedAt: serverTimestamp()
      });
      
      // Update lot progress
      await this.updateLotProgress(bundleData.lotId);
    }
  }
  
  // Update overall lot progress
  private async updateLotProgress(lotId: string): Promise<void> {
    const bundlesQuery = query(
      collection(db, 'colorSizeBundles'),
      where('lotId', '==', lotId)
    );
    
    const bundlesSnapshot = await getDocs(bundlesQuery);
    const bundles = bundlesSnapshot.docs.map(doc => doc.data() as ColorSizeBundle);
    
    const totalBundles = bundles.length;
    const completedBundles = bundles.filter(bundle => bundle.status === 'completed').length;
    const overallProgress = Math.round((completedBundles / totalBundles) * 100);
    
    const lotRef = doc(db, 'productionLots', lotId);
    await updateDoc(lotRef, {
      overallProgress,
      status: overallProgress === 100 ? 'completed' : 'in_production',
      updatedAt: serverTimestamp()
    });
  }
  
  // Get operator's monthly earnings
  async getOperatorMonthlyEarnings(
    operatorId: string, 
    year: number, 
    month: number
  ): Promise<{
    totalEarnings: number;
    totalPieces: number;
    workDays: number;
    assignments: OperatorAssignment[];
  }> {
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    const assignmentsQuery = query(
      collection(db, 'operatorAssignments'),
      where('operatorId', '==', operatorId),
      where('workDate', '>=', Timestamp.fromDate(startDate)),
      where('workDate', '<=', Timestamp.fromDate(endDate)),
      orderBy('workDate', 'desc')
    );
    
    const assignmentsSnapshot = await getDocs(assignmentsQuery);
    const assignments = assignmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      workDate: doc.data().workDate.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as OperatorAssignment[];
    
    const totalEarnings = assignments.reduce((sum, assignment) => sum + assignment.totalEarning, 0);
    const totalPieces = assignments.reduce((sum, assignment) => sum + assignment.completedPieces, 0);
    const uniqueDates = new Set(assignments.map(a => a.workDate.toDateString()));
    const workDays = uniqueDates.size;
    
    return {
      totalEarnings,
      totalPieces,
      workDays,
      assignments
    };
  }
  
  // Real-time listener for production lot updates
  subscribeToLot(lotId: string, callback: (lot: ProductionLot) => void): () => void {
    const lotRef = doc(db, 'productionLots', lotId);
    
    return onSnapshot(lotRef, async (doc) => {
      if (doc.exists()) {
        const lotData = doc.data() as ProductionLot;
        
        // Get updated bundles
        const bundlesQuery = query(
          collection(db, 'colorSizeBundles'),
          where('lotId', '==', lotId)
        );
        
        const bundlesSnapshot = await getDocs(bundlesQuery);
        const bundles = bundlesSnapshot.docs.map(bundleDoc => ({
          id: bundleDoc.id,
          ...bundleDoc.data(),
          createdAt: bundleDoc.data().createdAt?.toDate() || new Date(),
          updatedAt: bundleDoc.data().updatedAt?.toDate() || new Date()
        })) as ColorSizeBundle[];
        
        const completeLot: ProductionLot = {
          id: doc.id,
          ...lotData,
          colorSizeBreakdown: bundles,
          createdAt: lotData.createdAt?.toDate() || new Date(),
          updatedAt: lotData.updatedAt?.toDate() || new Date()
        };
        
        callback(completeLot);
      }
    });
  }
  
  // Get all active lots for supervision
  async getActiveLots(): Promise<ProductionLot[]> {
    const lotsQuery = query(
      collection(db, 'productionLots'),
      where('status', 'in', ['created', 'in_production']),
      orderBy('createdAt', 'desc')
    );
    
    const lotsSnapshot = await getDocs(lotsQuery);
    const lots = await Promise.all(
      lotsSnapshot.docs.map(async (lotDoc) => {
        const lotData = lotDoc.data() as ProductionLot;
        
        // Get bundles for this lot
        const bundlesQuery = query(
          collection(db, 'colorSizeBundles'),
          where('lotId', '==', lotDoc.id)
        );
        
        const bundlesSnapshot = await getDocs(bundlesQuery);
        const bundles = bundlesSnapshot.docs.map(bundleDoc => ({
          id: bundleDoc.id,
          ...bundleDoc.data(),
          createdAt: bundleDoc.data().createdAt?.toDate() || new Date(),
          updatedAt: bundleDoc.data().updatedAt?.toDate() || new Date()
        })) as ColorSizeBundle[];
        
        return {
          id: lotDoc.id,
          ...lotData,
          colorSizeBreakdown: bundles,
          createdAt: lotData.createdAt?.toDate() || new Date(),
          updatedAt: lotData.updatedAt?.toDate() || new Date()
        };
      })
    );
    
    return lots;
  }
  
  // Calculate total value of production lot
  private calculateTotalValue(steps: ProductionStep[], totalPieces: number): number {
    return steps.reduce((sum, step) => sum + (step.pricePerPiece * totalPieces), 0);
  }
}

export const productionLotManager = new ProductionLotManager();