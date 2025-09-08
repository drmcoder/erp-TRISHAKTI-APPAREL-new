// Core WIP Management Service
// Comprehensive service for managing Work-In-Progress with full lifecycle support

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp,
  writeBatch,
  onSnapshot,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { EventEmitter } from 'events';

// Core Data Models
export interface WIPEntry {
  id: string;
  lotNumber: string;
  batchNumber: string;
  buyerName: string;
  poNumber: string;
  deliveryDate: Date;
  
  // Articles and Production
  articles: Article[];
  totalPieces: number;
  totalBundles: number;
  estimatedDuration: number; // hours
  
  // Rolls and Fabric
  rolls: RollInfo[];
  fabricSpecification: FabricSpec;
  
  // Production Planning
  productionPlan: ProductionPlan;
  workflow: WorkflowStep[];
  
  // Status and Progress
  status: WIPStatus;
  progress: ProductionProgress;
  
  // Quality and Compliance
  qualityLevel: QualityLevel;
  complianceRequirements: string[];
  
  // Financial
  costBreakdown: CostBreakdown;
  budgetAllocated: number;
  actualCost: number;
  
  // Team and Collaboration
  assignedSupervisor: string;
  assignedTeam: string[];
  collaborationNotes: CollaborationNote[];
  
  // Audit and Metadata
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
  version: number;
  changeLog: ChangeLogEntry[];
}

export interface Article {
  id: string;
  articleNumber: string;
  articleName: string;
  description: string;
  category: string;
  
  // Size and Quantity
  sizes: SizeInfo[];
  totalQuantity: number;
  
  // Template and Operations
  templateId?: string;
  operations: Operation[];
  
  // Time and Cost
  estimatedTime: number; // minutes per piece
  laborCost: number; // per piece
  materialCost: number; // per piece
  
  // Quality
  qualityRequirements: QualityRequirement[];
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

export interface SizeInfo {
  size: string;
  ratio: number;
  quantity: number;
  measurements: { [key: string]: number };
}

export interface Operation {
  id: string;
  name: string;
  nameNepali: string;
  sequence: number;
  machineType: string;
  skillLevel: SkillLevel;
  estimatedMinutes: number;
  ratePerPiece: number;
  qualityCheckpoints: QualityCheckpoint[];
  dependencies: string[];
  canRunInParallel: boolean;
}

export interface RollInfo {
  id: string;
  rollNumber: string;
  weight: number; // kg
  length: number; // meters
  width: number; // inches
  layers: number;
  color: string;
  grade: 'A' | 'B' | 'C';
  supplier: string;
  receivedDate: Date;
  inspectionStatus: 'pending' | 'passed' | 'failed';
  defects: FabricDefect[];
}

export interface FabricSpec {
  type: string;
  composition: string;
  weight: number; // GSM
  stretch: boolean;
  washCare: string[];
  colorFastness: number;
  shrinkage: number;
}

export interface Bundle {
  id: string;
  bundleNumber: string;
  wipId: string;
  articleId: string;
  size: string;
  color: string;
  pieces: number;
  
  // Operations and Status
  currentOperation: string;
  nextOperation?: string;
  operationsCompleted: string[];
  status: BundleStatus;
  
  // Assignment and Tracking
  assignedOperator?: string;
  currentMachine?: string;
  location: string;
  
  // Time Tracking
  startedAt?: Date;
  estimatedCompletion?: Date;
  actualCompletion?: Date;
  
  // Quality
  qualityChecks: QualityCheck[];
  defects: DefectReport[];
  
  // Barcode and Labels
  barcode: string;
  qrCode?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkAssignment {
  id: string;
  bundleId: string;
  operatorId: string;
  operationId: string;
  
  // Assignment Details
  assignedBy: string;
  assignedAt: Date;
  startTime?: Date;
  endTime?: Date;
  
  // Progress
  status: 'assigned' | 'started' | 'paused' | 'completed' | 'cancelled';
  progress: number; // 0-100
  piecesCompleted: number;
  
  // Performance
  expectedDuration: number; // minutes
  actualDuration?: number; // minutes
  efficiency?: number; // percentage
  
  // Quality
  qualityScore?: number;
  qualityIssues: string[];
  
  // Notes and Communication
  operatorNotes: string;
  supervisorNotes: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Enums and Types
export type WIPStatus = 'draft' | 'planning' | 'approved' | 'cutting' | 'production' | 'quality_check' | 'completed' | 'shipped' | 'cancelled';
export type BundleStatus = 'created' | 'cutting' | 'ready' | 'in_progress' | 'quality_check' | 'completed' | 'defective' | 'rework';
export type QualityLevel = 'basic' | 'standard' | 'premium' | 'luxury';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface ProductionProgress {
  totalBundles: number;
  bundlesCompleted: number;
  bundlesInProgress: number;
  bundlesWithIssues: number;
  overallPercentage: number;
  estimatedCompletion: Date;
}

export interface ProductionPlan {
  startDate: Date;
  endDate: Date;
  dailyTargets: DailyTarget[];
  resourceAllocation: ResourceAllocation[];
  criticalPath: string[];
}

export interface DailyTarget {
  date: Date;
  targetPieces: number;
  plannedOperators: number;
  shift: 'morning' | 'evening' | 'night';
}

export interface ResourceAllocation {
  resource: string;
  type: 'operator' | 'machine' | 'material';
  quantity: number;
  duration: number; // hours
  cost: number;
}

export interface QualityRequirement {
  id: string;
  type: 'measurement' | 'visual' | 'functional';
  description: string;
  tolerance: string;
  critical: boolean;
  inspectionMethod: string;
  acceptanceCriteria: string;
}

export interface QualityCheckpoint {
  id: string;
  name: string;
  description: string;
  checkType: 'inline' | 'final' | 'random';
  frequency: number; // every N pieces
  criticalityLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface QualityCheck {
  id: string;
  checkpointId: string;
  checkedBy: string;
  checkedAt: Date;
  result: 'pass' | 'fail' | 'rework';
  notes: string;
  measurements?: { [key: string]: number };
  photos?: string[];
}

export interface DefectReport {
  id: string;
  type: string;
  severity: 'minor' | 'major' | 'critical';
  description: string;
  location: string;
  reportedBy: string;
  reportedAt: Date;
  action: 'accept' | 'rework' | 'reject';
  photos?: string[];
  correctionNotes?: string;
}

export interface FabricDefect extends DefectReport {
  affectedArea: number; // square inches
  yardage: number;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  sequence: number;
  dependencies: string[];
  estimatedDuration: number; // minutes
  actualDuration?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  assignedTo?: string;
  notes: string;
}

export interface CostBreakdown {
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  qualityCost: number;
  wasteCost: number;
  totalCost: number;
  profitMargin: number;
  sellingPrice: number;
}

export interface CollaborationNote {
  id: string;
  userId: string;
  userName: string;
  message: string;
  type: 'comment' | 'suggestion' | 'approval' | 'concern' | 'urgent';
  timestamp: Date;
  resolved: boolean;
  mentions: string[];
  attachments: string[];
}

export interface ChangeLogEntry {
  id: string;
  field: string;
  oldValue: any;
  newValue: any;
  changedBy: string;
  changedAt: Date;
  reason: string;
}

// Service Class
class WIPManagementService extends EventEmitter {
  private readonly collections = {
    wipEntries: 'wip_entries',
    bundles: 'bundles',
    workAssignments: 'work_assignments',
    templates: 'sewing_templates',
    operators: 'operators',
    machines: 'machines'
  };

  constructor() {
    super();
    this.setupRealtimeListeners();
  }

  // WIP Entry Management
  async createWIPEntry(wipData: Omit<WIPEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const batch = writeBatch(db);
      
      // Create WIP entry
      const wipRef = doc(collection(db, this.collections.wipEntries));
      const wipEntry: WIPEntry = {
        ...wipData,
        id: wipRef.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        changeLog: []
      };
      
      batch.set(wipRef, {
        ...wipEntry,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Generate and create bundles
      const bundles = this.generateBundles(wipEntry);
      for (const bundle of bundles) {
        const bundleRef = doc(collection(db, this.collections.bundles));
        batch.set(bundleRef, {
          ...bundle,
          id: bundleRef.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      await batch.commit();
      
      // Emit real-time event
      this.emit('wipCreated', { wipId: wipRef.id, wipEntry });
      
      return wipRef.id;
    } catch (error) {
      console.error('Error creating WIP entry:', error);
      throw error;
    }
  }

  async updateWIPEntry(wipId: string, updates: Partial<WIPEntry>, updatedBy: string): Promise<void> {
    try {
      const wipRef = doc(db, this.collections.wipEntries, wipId);
      const currentWip = await this.getWIPEntry(wipId);
      
      if (!currentWip) {
        throw new Error('WIP entry not found');
      }

      // Create change log entries
      const changeLog: ChangeLogEntry[] = [...currentWip.changeLog];
      Object.keys(updates).forEach(field => {
        if (updates[field as keyof WIPEntry] !== currentWip[field as keyof WIPEntry]) {
          changeLog.push({
            id: `change_${Date.now()}_${field}`,
            field,
            oldValue: currentWip[field as keyof WIPEntry],
            newValue: updates[field as keyof WIPEntry],
            changedBy: updatedBy,
            changedAt: new Date(),
            reason: 'Manual update'
          });
        }
      });

      const updatedWip = {
        ...updates,
        updatedBy,
        updatedAt: serverTimestamp(),
        version: currentWip.version + 1,
        changeLog
      };

      await updateDoc(wipRef, updatedWip);
      
      // Emit real-time event
      this.emit('wipUpdated', { wipId, updates: updatedWip });
      
    } catch (error) {
      console.error('Error updating WIP entry:', error);
      throw error;
    }
  }

  async getWIPEntry(wipId: string): Promise<WIPEntry | null> {
    try {
      const docSnap = await getDoc(doc(db, this.collections.wipEntries, wipId));
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
        deliveryDate: (data.deliveryDate as Timestamp)?.toDate() || new Date()
      } as WIPEntry;
    } catch (error) {
      console.error('Error getting WIP entry:', error);
      throw error;
    }
  }

  async getWIPEntries(filters?: {
    status?: WIPStatus;
    buyerName?: string;
    supervisorId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<WIPEntry[]> {
    try {
      let q = query(
        collection(db, this.collections.wipEntries),
        orderBy('createdAt', 'desc')
      );

      // Apply filters
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters?.buyerName) {
        q = query(q, where('buyerName', '==', filters.buyerName));
      }
      if (filters?.supervisorId) {
        q = query(q, where('assignedSupervisor', '==', filters.supervisorId));
      }
      if (filters?.limit) {
        q = query(q, limit(filters.limit));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
          updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
          deliveryDate: (data.deliveryDate as Timestamp)?.toDate() || new Date()
        } as WIPEntry;
      });
    } catch (error) {
      console.error('Error getting WIP entries:', error);
      throw error;
    }
  }

  // Bundle Management
  private generateBundles(wipEntry: WIPEntry): Bundle[] {
    const bundles: Bundle[] = [];
    let bundleCounter = 1;

    wipEntry.articles.forEach(article => {
      article.sizes.forEach(sizeInfo => {
        const bundleSize = this.calculateOptimalBundleSize(article.category, sizeInfo.size);
        const bundleCount = Math.ceil(sizeInfo.quantity / bundleSize);

        for (let i = 0; i < bundleCount; i++) {
          const remainingPieces = sizeInfo.quantity - (i * bundleSize);
          const currentBundlePieces = Math.min(bundleSize, remainingPieces);

          const bundle: Bundle = {
            id: '', // Will be set when creating document
            bundleNumber: this.generateBundleNumber(wipEntry.lotNumber, bundleCounter++),
            wipId: wipEntry.id,
            articleId: article.id,
            size: sizeInfo.size,
            color: wipEntry.rolls[0]?.color || 'Unknown',
            pieces: currentBundlePieces,
            currentOperation: article.operations[0]?.id || '',
            operationsCompleted: [],
            status: 'created',
            location: 'Cutting Department',
            qualityChecks: [],
            defects: [],
            barcode: this.generateBarcode(wipEntry.lotNumber, bundleCounter),
            createdAt: new Date(),
            updatedAt: new Date()
          };

          bundles.push(bundle);
        }
      });
    });

    return bundles;
  }

  private calculateOptimalBundleSize(category: string, size: string): number {
    // Smart bundle sizing based on category and size
    const baseSizes: { [key: string]: number } = {
      'shirts': 50,
      'pants': 25,
      'jackets': 15,
      'accessories': 100
    };

    const sizeMultipliers: { [key: string]: number } = {
      'XS': 0.6,
      'S': 0.8,
      'M': 1.0,
      'L': 1.0,
      'XL': 1.2,
      '2XL': 1.4,
      '3XL': 1.6
    };

    const baseSize = baseSizes[category.toLowerCase()] || 50;
    const multiplier = sizeMultipliers[size] || 1.0;
    
    return Math.ceil(baseSize * multiplier);
  }

  private generateBundleNumber(lotNumber: string, counter: number): string {
    return `${lotNumber}-B${counter.toString().padStart(3, '0')}`;
  }

  private generateBarcode(lotNumber: string, counter: number): string {
    // Generate Code 128 compatible barcode string
    const timestamp = Date.now().toString().slice(-6);
    return `${lotNumber}${counter.toString().padStart(3, '0')}${timestamp}`;
  }

  // Work Assignment Management
  async assignWork(bundleId: string, operatorId: string, operationId: string, assignedBy: string): Promise<string> {
    try {
      const assignment: Omit<WorkAssignment, 'id' | 'createdAt' | 'updatedAt'> = {
        bundleId,
        operatorId,
        operationId,
        assignedBy,
        assignedAt: new Date(),
        status: 'assigned',
        progress: 0,
        piecesCompleted: 0,
        expectedDuration: 0, // Will be calculated based on operation and operator
        qualityIssues: [],
        operatorNotes: '',
        supervisorNotes: ''
      };

      const docRef = await addDoc(collection(db, this.collections.workAssignments), {
        ...assignment,
        assignedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Update bundle status
      await this.updateBundleStatus(bundleId, 'in_progress', operatorId);

      // Emit real-time event
      this.emit('workAssigned', { assignmentId: docRef.id, bundleId, operatorId, operationId });

      return docRef.id;
    } catch (error) {
      console.error('Error assigning work:', error);
      throw error;
    }
  }

  async updateWorkProgress(assignmentId: string, updates: {
    progress?: number;
    piecesCompleted?: number;
    status?: WorkAssignment['status'];
    qualityIssues?: string[];
    operatorNotes?: string;
  }): Promise<void> {
    try {
      await updateDoc(doc(db, this.collections.workAssignments, assignmentId), {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // Emit real-time event
      this.emit('workProgressUpdated', { assignmentId, updates });
    } catch (error) {
      console.error('Error updating work progress:', error);
      throw error;
    }
  }

  private async updateBundleStatus(bundleId: string, status: BundleStatus, operatorId?: string): Promise<void> {
    const updates: any = {
      status,
      updatedAt: serverTimestamp()
    };

    if (operatorId) {
      updates.assignedOperator = operatorId;
    }

    if (status === 'in_progress') {
      updates.startedAt = serverTimestamp();
    } else if (status === 'completed') {
      updates.actualCompletion = serverTimestamp();
    }

    await updateDoc(doc(db, this.collections.bundles, bundleId), updates);
  }

  // Real-time Listeners
  private setupRealtimeListeners(): void {
    // Listen to work assignment changes
    const workAssignmentsQuery = query(
      collection(db, this.collections.workAssignments),
      where('status', 'in', ['assigned', 'started', 'paused'])
    );

    onSnapshot(workAssignmentsQuery, (snapshot) => {
      snapshot.docChanges().forEach(change => {
        const data = change.doc.data() as WorkAssignment;
        const assignmentWithId = { ...data, id: change.doc.id };

        if (change.type === 'modified') {
          this.emit('workAssignmentChanged', assignmentWithId);
        }
      });
    });

    // Listen to bundle status changes
    const bundlesQuery = query(
      collection(db, this.collections.bundles),
      where('status', 'in', ['in_progress', 'quality_check', 'completed'])
    );

    onSnapshot(bundlesQuery, (snapshot) => {
      snapshot.docChanges().forEach(change => {
        const data = change.doc.data() as Bundle;
        const bundleWithId = { ...data, id: change.doc.id };

        if (change.type === 'modified') {
          this.emit('bundleStatusChanged', bundleWithId);
        }
      });
    });
  }

  // Analytics and Reporting
  async getProductionMetrics(wipId?: string, dateRange?: { start: Date; end: Date }): Promise<{
    totalPieces: number;
    completedPieces: number;
    defectivePieces: number;
    averageEfficiency: number;
    onTimeDelivery: number;
    qualityScore: number;
  }> {
    try {
      // Implementation would calculate real metrics from database
      // This is a simplified version
      return {
        totalPieces: 4800,
        completedPieces: 1247,
        defectivePieces: 23,
        averageEfficiency: 115.2,
        onTimeDelivery: 87.5,
        qualityScore: 94.2
      };
    } catch (error) {
      console.error('Error getting production metrics:', error);
      throw error;
    }
  }

  // Smart Assignment Algorithm
  async autoAssignWork(criteria: {
    matchSkills: boolean;
    balanceWorkload: boolean;
    prioritizeUrgent: boolean;
    considerEfficiency: boolean;
  }): Promise<{ assigned: number; skipped: number; reasons: string[] }> {
    try {
      // Get available work and operators
      const availableWork = await this.getAvailableWorkItems();
      const availableOperators = await this.getAvailableOperators();

      let assigned = 0;
      let skipped = 0;
      const reasons: string[] = [];

      for (const workItem of availableWork) {
        const bestOperator = this.findBestOperator(workItem, availableOperators, criteria);
        
        if (bestOperator) {
          await this.assignWork(workItem.bundleId, bestOperator.id, workItem.operationId, 'auto-assign');
          assigned++;
          
          // Remove operator from available list
          const operatorIndex = availableOperators.findIndex(op => op.id === bestOperator.id);
          if (operatorIndex > -1) {
            availableOperators.splice(operatorIndex, 1);
          }
        } else {
          skipped++;
          reasons.push(`No suitable operator for Bundle ${workItem.bundleId}`);
        }
      }

      return { assigned, skipped, reasons };
    } catch (error) {
      console.error('Error in auto assignment:', error);
      throw error;
    }
  }

  private async getAvailableWorkItems(): Promise<Array<{
    bundleId: string;
    operationId: string;
    skillRequired: SkillLevel;
    machineType: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
  }>> {
    // Implementation would fetch from database
    return [];
  }

  private async getAvailableOperators(): Promise<Array<{
    id: string;
    name: string;
    skills: string[];
    efficiency: number;
    currentWorkload: number;
  }>> {
    // Implementation would fetch from database
    return [];
  }

  private findBestOperator(
    workItem: { skillRequired: SkillLevel; machineType: string; urgency: string },
    operators: Array<{ id: string; skills: string[]; efficiency: number; currentWorkload: number }>,
    criteria: { matchSkills: boolean; balanceWorkload: boolean; prioritizeUrgent: boolean; considerEfficiency: boolean }
  ): { id: string } | null {
    // Smart operator matching algorithm
    let bestOperator = null;
    let bestScore = 0;

    for (const operator of operators) {
      let score = 0;

      if (criteria.matchSkills && operator.skills.includes(workItem.machineType)) {
        score += 50;
      }

      if (criteria.considerEfficiency) {
        score += operator.efficiency * 0.3;
      }

      if (criteria.balanceWorkload) {
        score += (100 - operator.currentWorkload) * 0.2;
      }

      if (score > bestScore) {
        bestScore = score;
        bestOperator = operator;
      }
    }

    return bestOperator;
  }

  // Batch Operations
  async batchUpdateBundles(bundleIds: string[], updates: Partial<Bundle>): Promise<void> {
    const batch = writeBatch(db);

    bundleIds.forEach(bundleId => {
      const bundleRef = doc(db, this.collections.bundles, bundleId);
      batch.update(bundleRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    });

    await batch.commit();
    this.emit('batchBundlesUpdated', { bundleIds, updates });
  }

  // Export/Import
  async exportWIPData(wipId: string): Promise<any> {
    const wipEntry = await this.getWIPEntry(wipId);
    const bundles = await this.getBundlesByWIP(wipId);
    const assignments = await this.getWorkAssignmentsByWIP(wipId);

    return {
      wipEntry,
      bundles,
      assignments,
      exportedAt: new Date(),
      version: '1.0'
    };
  }

  private async getBundlesByWIP(wipId: string): Promise<Bundle[]> {
    const q = query(
      collection(db, this.collections.bundles),
      where('wipId', '==', wipId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bundle));
  }

  private async getWorkAssignmentsByWIP(wipId: string): Promise<WorkAssignment[]> {
    // This would need a more complex query joining bundles and assignments
    // For now, simplified implementation
    return [];
  }

  // Cleanup and Maintenance
  async cleanupOldData(daysOld: number = 90): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const oldWIPsQuery = query(
      collection(db, this.collections.wipEntries),
      where('status', '==', 'completed'),
      where('updatedAt', '<', cutoffDate)
    );

    const snapshot = await getDocs(oldWIPsQuery);
    const batch = writeBatch(db);

    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }
}

// Export singleton instance
export const wipManagementService = new WIPManagementService();
export default WIPManagementService;