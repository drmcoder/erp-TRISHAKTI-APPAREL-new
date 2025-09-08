// Integrated WIP-Bundle Creation Service
// Handles: WIP Entry → Sewing Template Mapping → Bundle Creation → Work Assignment

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
  serverTimestamp,
  writeBatch,
  runTransaction
} from 'firebase/firestore';
import { ref, set, update, onValue, push } from 'firebase/database';
import { EnhancedWIPEntry, RollDetail, ArticleDetail } from '../features/wip/components/enhanced-wip-entry-form';
import { SewingTemplate } from '../features/templates/components/sewing-template-manager';

// Enhanced bundle interface that includes roll and WIP data
export interface EnhancedProductionBundle {
  id: string;
  bundleNumber: string;
  
  // WIP Entry References
  wipEntryId: string;
  batchNumber: string;
  lotNumber: string;
  
  // Article Info
  articleNumber: string;
  articleName: string;
  garmentType: string;
  
  // Roll Info
  rollId: string;
  rollNumber: string;
  color: string;
  size: string;
  
  // Production Info
  pieces: number;
  partsPerGarment: number;
  totalParts: number;
  
  // Sewing Process
  sewingTemplateId: string;
  processSteps: EnhancedBundleProcessStep[];
  currentStep: number;
  
  // Status & Assignment
  status: 'ready' | 'assigned' | 'in_progress' | 'completed' | 'on_hold' | 'quality_check';
  assignedOperators: string[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  // Timing
  createdAt: any;
  startedAt?: any;
  completedAt?: any;
  estimatedCompletionTime: number; // minutes
  
  // Quality & Notes
  qualityGrade: 'A+' | 'A' | 'B' | 'C';
  notes?: string;
}

export interface EnhancedBundleProcessStep {
  stepNumber: number;
  operation: string;
  operationNepali: string;
  machineType: string;
  pricePerPiece: number;
  estimatedMinutes: number;
  skillLevel: 'beginner' | 'intermediate' | 'expert';
  
  // Dependencies and parallel processing
  canRunParallel: boolean;
  dependencies: number[];
  
  // Status and assignment
  status: 'waiting' | 'ready' | 'assigned' | 'in_progress' | 'completed' | 'skipped';
  assignedOperator?: string;
  assignedOperatorName?: string;
  
  // Progress tracking
  completedPieces: number;
  remainingPieces: number;
  startTime?: any;
  endTime?: any;
  
  // Quality
  qualityCheckRequired: boolean;
  qualityNotes?: string;
  defectCount?: number;
  
  // Operator work session
  workSessionId?: string;
}

// Work assignment for operators
export interface OperatorWorkAssignment {
  id: string;
  operatorId: string;
  operatorName: string;
  
  // Bundle reference
  bundleId: string;
  bundleNumber: string;
  stepNumber: number;
  operation: string;
  
  // Article info
  articleNumber: string;
  color: string;
  size: string;
  
  // Work details
  assignedPieces: number;
  completedPieces: number;
  remainingPieces: number;
  pricePerPiece: number;
  totalEarning: number;
  
  // Status and timing
  status: 'assigned' | 'started' | 'paused' | 'completed' | 'cancelled';
  assignedAt: any;
  startedAt?: any;
  completedAt?: any;
  
  // Machine and location
  machineType: string;
  machineNumber?: string;
  lineNumber?: string;
  
  // Quality and notes
  qualityGrade?: 'A+' | 'A' | 'B' | 'C';
  notes?: string;
}

class IntegratedWIPBundleService {
  
  /**
   * Create bundles from WIP entry with sewing template mapping
   */
  async createBundlesFromWIP(
    wipEntry: EnhancedWIPEntry, 
    templateMappings: Record<string, string> // articleId -> sewingTemplateId
  ): Promise<EnhancedProductionBundle[]> {
    try {
      const bundles: EnhancedProductionBundle[] = [];
      const batch = writeBatch(db);
      
      // Save WIP entry first
      const wipRef = doc(collection(db, 'wipEntries'));
      batch.set(wipRef, {
        ...wipEntry,
        id: wipRef.id,
        createdAt: serverTimestamp()
      });
      
      let bundleCounter = 1;
      
      // Create bundles for each article-roll-color-size combination
      for (const article of wipEntry.articles) {
        const sewingTemplateId = templateMappings[article.id];
        if (!sewingTemplateId) {
          throw new Error(`No sewing template mapped for article ${article.articleNumber}`);
        }
        
        // Get sewing template
        const templateDoc = await getDoc(doc(db, 'sewingTemplates', sewingTemplateId));
        if (!templateDoc.exists()) {
          throw new Error(`Sewing template ${sewingTemplateId} not found`);
        }
        
        const sewingTemplate = templateDoc.data() as SewingTemplate;
        
        // Create bundles for each roll and size combination
        for (const roll of wipEntry.rolls) {
          for (const sizeRatio of article.sizeRatios) {
            if (sizeRatio.ratio === 0) continue; // Skip sizes with 0 ratio
            
            // Calculate pieces for this size from this roll
            const piecesFromRoll = Math.floor((roll.layers * sizeRatio.ratio) / article.totalPiecesPerSet);
            if (piecesFromRoll === 0) continue;
            
            // Calculate total parts needed
            const partsPerGarment = article.partsPerGarment.front + 
                                  article.partsPerGarment.back + 
                                  article.partsPerGarment.sleeve + 
                                  article.partsPerGarment.collar +
                                  article.partsPerGarment.other.reduce((sum, p) => sum + p.count, 0);
            
            const totalParts = piecesFromRoll * partsPerGarment;
            
            // Create bundle number
            const bundleNumber = `${wipEntry.batchNumber}-${article.articleNumber}-${roll.color}-${sizeRatio.size}-${String(bundleCounter).padStart(3, '0')}`;
            
            // Create process steps from sewing template
            const processSteps: EnhancedBundleProcessStep[] = sewingTemplate.steps.map(templateStep => ({
              stepNumber: templateStep.stepNumber,
              operation: templateStep.operation,
              operationNepali: templateStep.operationNepali,
              machineType: templateStep.machineType,
              pricePerPiece: templateStep.pricePerPiece,
              estimatedMinutes: templateStep.estimatedMinutes,
              skillLevel: templateStep.skillLevel,
              canRunParallel: templateStep.canRunParallel,
              dependencies: templateStep.dependencies,
              status: templateStep.dependencies.length === 0 ? 'ready' : 'waiting',
              completedPieces: 0,
              remainingPieces: piecesFromRoll,
              qualityCheckRequired: templateStep.qualityCheckRequired
            }));
            
            // Calculate total estimated time
            const estimatedCompletionTime = sewingTemplate.steps.reduce(
              (total, step) => total + (step.estimatedMinutes * piecesFromRoll), 
              0
            );
            
            // Create the bundle
            const bundle: Omit<EnhancedProductionBundle, 'id'> = {
              bundleNumber,
              wipEntryId: wipRef.id,
              batchNumber: wipEntry.batchNumber,
              lotNumber: wipEntry.lotNumber,
              
              articleNumber: article.articleNumber,
              articleName: article.articleName,
              garmentType: article.garmentType,
              
              rollId: roll.id,
              rollNumber: roll.rollNumber,
              color: roll.color,
              size: sizeRatio.size,
              
              pieces: piecesFromRoll,
              partsPerGarment,
              totalParts,
              
              sewingTemplateId,
              processSteps,
              currentStep: 1,
              
              status: 'ready',
              assignedOperators: [],
              priority: 'normal',
              
              createdAt: serverTimestamp(),
              estimatedCompletionTime,
              
              qualityGrade: roll.qualityGrade,
              notes: `Auto-created from WIP: ${wipEntry.batchNumber}. Roll: ${roll.rollNumber} (${roll.weight}kg, ${roll.layers} layers)`
            };
            
            // Add to batch
            const bundleRef = doc(collection(db, 'productionBundles'));
            batch.set(bundleRef, bundle);
            
            bundles.push({
              id: bundleRef.id,
              ...bundle,
              createdAt: new Date()
            } as EnhancedProductionBundle);
            
            bundleCounter++;
          }
        }
      }
      
      // Execute batch write
      await batch.commit();
      
      // Update WIP entry status
      await updateDoc(doc(db, 'wipEntries', wipRef.id), {
        status: 'bundles_created',
        bundleCount: bundles.length,
        bundlesCreatedAt: serverTimestamp()
      });
      
      console.log(`✅ Created ${bundles.length} bundles from WIP entry ${wipEntry.batchNumber}`);
      
      return bundles;
    } catch (error) {
      console.error('Error creating bundles from WIP:', error);
      throw error;
    }
  }
  
  /**
   * Get available work assignments for operators
   */
  async getAvailableWorkForOperators(filters?: {
    machineType?: string;
    skillLevel?: string;
    priority?: string;
  }): Promise<OperatorWorkAssignment[]> {
    try {
      // Get ready bundles
      let bundlesQuery = query(
        collection(db, 'productionBundles'),
        where('status', 'in', ['ready', 'assigned']),
        orderBy('priority', 'desc'),
        orderBy('createdAt', 'asc')
      );
      
      const bundlesSnapshot = await getDocs(bundlesQuery);
      const availableWork: OperatorWorkAssignment[] = [];
      
      for (const bundleDoc of bundlesSnapshot.docs) {
        const bundle = { id: bundleDoc.id, ...bundleDoc.data() } as EnhancedProductionBundle;
        
        // Find ready steps in this bundle
        const readySteps = bundle.processSteps.filter(step => 
          step.status === 'ready' && step.remainingPieces > 0
        );
        
        for (const step of readySteps) {
          // Apply filters
          if (filters?.machineType && step.machineType !== filters.machineType) continue;
          if (filters?.skillLevel && step.skillLevel !== filters.skillLevel) continue;
          if (filters?.priority && bundle.priority !== filters.priority) continue;
          
          // Calculate earnings
          const totalEarning = step.remainingPieces * step.pricePerPiece;
          
          const workAssignment: OperatorWorkAssignment = {
            id: `${bundle.id}_step_${step.stepNumber}`,
            operatorId: '', // Will be filled when assigned
            operatorName: '',
            
            bundleId: bundle.id,
            bundleNumber: bundle.bundleNumber,
            stepNumber: step.stepNumber,
            operation: step.operation,
            
            articleNumber: bundle.articleNumber,
            color: bundle.color,
            size: bundle.size,
            
            assignedPieces: step.remainingPieces,
            completedPieces: step.completedPieces,
            remainingPieces: step.remainingPieces,
            pricePerPiece: step.pricePerPiece,
            totalEarning,
            
            status: 'assigned',
            assignedAt: serverTimestamp(),
            
            machineType: step.machineType,
            
            qualityGrade: bundle.qualityGrade
          };
          
          availableWork.push(workAssignment);
        }
      }
      
      // Sort by priority and creation time
      availableWork.sort((a, b) => {
        const priorityOrder = { 'urgent': 4, 'high': 3, 'normal': 2, 'low': 1 };
        const aPriority = priorityOrder[availableWork.find(w => w.id === a.id) ? 'normal' : 'normal'];
        const bPriority = priorityOrder[availableWork.find(w => w.id === b.id) ? 'normal' : 'normal'];
        
        if (aPriority !== bPriority) return bPriority - aPriority;
        return a.assignedAt - b.assignedAt;
      });
      
      return availableWork;
    } catch (error) {
      console.error('Error getting available work:', error);
      throw error;
    }
  }
  
  /**
   * Assign work to an operator
   */
  async assignWorkToOperator(
    workAssignmentId: string,
    operatorId: string,
    operatorName: string,
    machineNumber?: string,
    lineNumber?: string
  ): Promise<boolean> {
    try {
      return await runTransaction(db, async (transaction) => {
        // Parse work assignment ID to get bundle and step
        const [bundleId, , stepNumber] = workAssignmentId.split('_step_');
        const stepNum = parseInt(stepNumber);
        
        // Get the bundle
        const bundleRef = doc(db, 'productionBundles', bundleId);
        const bundleDoc = await transaction.get(bundleRef);
        
        if (!bundleDoc.exists()) {
          throw new Error('Bundle not found');
        }
        
        const bundle = bundleDoc.data() as EnhancedProductionBundle;
        
        // Find the step
        const stepIndex = bundle.processSteps.findIndex(s => s.stepNumber === stepNum);
        if (stepIndex === -1) {
          throw new Error('Step not found');
        }
        
        const step = bundle.processSteps[stepIndex];
        
        // Check if step is still available
        if (step.status !== 'ready' || step.assignedOperator) {
          throw new Error('Step is no longer available');
        }
        
        // Update the step
        const updatedSteps = [...bundle.processSteps];
        updatedSteps[stepIndex] = {
          ...step,
          status: 'assigned',
          assignedOperator: operatorId,
          assignedOperatorName: operatorName
        };
        
        // Update bundle
        const updatedBundle = {
          ...bundle,
          processSteps: updatedSteps,
          assignedOperators: [...bundle.assignedOperators, operatorId],
          status: 'assigned' as const
        };
        
        transaction.update(bundleRef, updatedBundle);
        
        // Create operator work session
        const workSessionRef = doc(collection(db, 'operatorWorkSessions'));
        const workSession = {
          operatorId,
          operatorName,
          bundleId,
          bundleNumber: bundle.bundleNumber,
          stepNumber: stepNum,
          operation: step.operation,
          machineType: step.machineType,
          machineNumber,
          lineNumber,
          assignedPieces: step.remainingPieces,
          completedPieces: 0,
          pricePerPiece: step.pricePerPiece,
          totalEarning: 0,
          workDate: serverTimestamp(),
          status: 'assigned' as const,
          assignedAt: serverTimestamp()
        };
        
        transaction.set(workSessionRef, workSession);
        
        // Update step with work session reference
        updatedSteps[stepIndex].workSessionId = workSessionRef.id;
        transaction.update(bundleRef, { processSteps: updatedSteps });
        
        console.log(`✅ Assigned work ${workAssignmentId} to operator ${operatorName}`);
        
        return true;
      });
    } catch (error) {
      console.error('Error assigning work to operator:', error);
      throw error;
    }
  }
  
  /**
   * Get operator's current work assignments
   */
  async getOperatorWorkAssignments(operatorId: string): Promise<OperatorWorkAssignment[]> {
    try {
      const workSessionsQuery = query(
        collection(db, 'operatorWorkSessions'),
        where('operatorId', '==', operatorId),
        where('status', 'in', ['assigned', 'started', 'paused']),
        orderBy('assignedAt', 'desc')
      );
      
      const sessionsSnapshot = await getDocs(workSessionsQuery);
      const assignments: OperatorWorkAssignment[] = [];
      
      for (const sessionDoc of sessionsSnapshot.docs) {
        const session = sessionDoc.data();
        
        const assignment: OperatorWorkAssignment = {
          id: sessionDoc.id,
          operatorId: session.operatorId,
          operatorName: session.operatorName,
          
          bundleId: session.bundleId,
          bundleNumber: session.bundleNumber,
          stepNumber: session.stepNumber,
          operation: session.operation,
          
          articleNumber: session.articleNumber || '',
          color: session.color || '',
          size: session.size || '',
          
          assignedPieces: session.assignedPieces,
          completedPieces: session.completedPieces,
          remainingPieces: session.assignedPieces - session.completedPieces,
          pricePerPiece: session.pricePerPiece,
          totalEarning: session.totalEarning,
          
          status: session.status,
          assignedAt: session.assignedAt,
          startedAt: session.startedAt,
          completedAt: session.completedAt,
          
          machineType: session.machineType,
          machineNumber: session.machineNumber,
          lineNumber: session.lineNumber,
          
          qualityGrade: session.qualityGrade,
          notes: session.notes
        };
        
        assignments.push(assignment);
      }
      
      return assignments;
    } catch (error) {
      console.error('Error getting operator work assignments:', error);
      throw error;
    }
  }
  
  /**
   * Complete operator work
   */
  async completeOperatorWork(
    workSessionId: string, 
    completedPieces: number,
    qualityGrade?: 'A+' | 'A' | 'B' | 'C',
    notes?: string
  ): Promise<boolean> {
    try {
      return await runTransaction(db, async (transaction) => {
        // Get work session
        const sessionRef = doc(db, 'operatorWorkSessions', workSessionId);
        const sessionDoc = await transaction.get(sessionRef);
        
        if (!sessionDoc.exists()) {
          throw new Error('Work session not found');
        }
        
        const session = sessionDoc.data();
        
        // Calculate earnings
        const totalEarning = completedPieces * session.pricePerPiece;
        
        // Update work session
        transaction.update(sessionRef, {
          completedPieces,
          totalEarning,
          qualityGrade,
          notes,
          status: completedPieces >= session.assignedPieces ? 'completed' : 'started',
          completedAt: completedPieces >= session.assignedPieces ? serverTimestamp() : null
        });
        
        // Update bundle step
        const bundleRef = doc(db, 'productionBundles', session.bundleId);
        const bundleDoc = await transaction.get(bundleRef);
        
        if (bundleDoc.exists()) {
          const bundle = bundleDoc.data() as EnhancedProductionBundle;
          const stepIndex = bundle.processSteps.findIndex(s => s.stepNumber === session.stepNumber);
          
          if (stepIndex !== -1) {
            const updatedSteps = [...bundle.processSteps];
            updatedSteps[stepIndex] = {
              ...updatedSteps[stepIndex],
              completedPieces,
              remainingPieces: session.assignedPieces - completedPieces,
              status: completedPieces >= session.assignedPieces ? 'completed' : 'in_progress',
              endTime: completedPieces >= session.assignedPieces ? serverTimestamp() : null,
              qualityNotes: notes
            };
            
            transaction.update(bundleRef, { processSteps: updatedSteps });
            
            // Check if all steps are completed
            const allCompleted = updatedSteps.every(step => step.status === 'completed' || step.status === 'skipped');
            if (allCompleted) {
              transaction.update(bundleRef, { 
                status: 'completed',
                completedAt: serverTimestamp()
              });
            }
          }
        }
        
        console.log(`✅ Updated work completion: ${completedPieces} pieces for session ${workSessionId}`);
        
        return true;
      });
    } catch (error) {
      console.error('Error completing operator work:', error);
      throw error;
    }
  }
  
  /**
   * Get production statistics
   */
  async getProductionStats(period: 'today' | 'week' | 'month' = 'today') {
    try {
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }
      
      // Get bundles created in period
      const bundlesQuery = query(
        collection(db, 'productionBundles'),
        where('createdAt', '>=', startDate),
        orderBy('createdAt', 'desc')
      );
      
      const bundlesSnapshot = await getDocs(bundlesQuery);
      const bundles = bundlesSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as EnhancedProductionBundle[];
      
      // Calculate stats
      const stats = {
        totalBundles: bundles.length,
        completedBundles: bundles.filter(b => b.status === 'completed').length,
        inProgressBundles: bundles.filter(b => b.status === 'in_progress' || b.status === 'assigned').length,
        totalPieces: bundles.reduce((sum, b) => sum + b.pieces, 0),
        completedPieces: bundles
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + b.pieces, 0),
        totalEarnings: 0, // Will be calculated from work sessions
        activeOperators: new Set(),
        byArticle: {} as Record<string, number>,
        byColor: {} as Record<string, number>,
        bySize: {} as Record<string, number>
      };
      
      // Group by article, color, size
      bundles.forEach(bundle => {
        stats.byArticle[bundle.articleNumber] = (stats.byArticle[bundle.articleNumber] || 0) + bundle.pieces;
        stats.byColor[bundle.color] = (stats.byColor[bundle.color] || 0) + bundle.pieces;
        stats.bySize[bundle.size] = (stats.bySize[bundle.size] || 0) + bundle.pieces;
      });
      
      return stats;
    } catch (error) {
      console.error('Error getting production stats:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const integratedWIPBundleService = new IntegratedWIPBundleService();
export default integratedWIPBundleService;