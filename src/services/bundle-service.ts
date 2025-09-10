// Bundle Service for Managing Production Bundles
import { 
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { 
  ProductionBundle, 
  BundleOperation, 
  BundleCreationData 
} from '../shared/types/bundle-types';
import type { SewingTemplate } from '../shared/types/sewing-template-types';
import { sewingTemplateService } from './sewing-template-service';

export interface Bundle {
  id: string;
  bundleNumber: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  status: 'planning' | 'in-progress' | 'completed' | 'quality-check' | 'shipped' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: Date | null;
  dueDate: Date;
  completionDate: Date | null;
  assignedOperators: string[];
  currentOperatorId: string | null;
  completedQuantity: number;
  defectQuantity: number;
  qualityScore: number;
  estimatedHours: number;
  actualHours: number;
  workSessions: WorkSession[];
  qualityChecks: QualityCheck[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  notes: string;
  attachments: string[];
  tags: string[];
}

export interface WorkSession {
  id: string;
  operatorId: string;
  operatorName: string;
  startTime: Date;
  endTime: Date | null;
  duration: number; // in minutes
  quantityCompleted: number;
  defectQuantity: number;
  notes: string;
  isActive: boolean;
}

export interface QualityCheck {
  id: string;
  checkedBy: string;
  checkDate: Date;
  status: 'passed' | 'failed' | 'rework';
  defectTypes: string[];
  notes: string;
  correctiveAction: string;
}

export interface CreateBundleData {
  bundleNumber: string;
  description: string;
  quantity: number;
  unitPrice: number;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours: number;
  notes?: string;
  tags?: string[];
}

export interface UpdateBundleData {
  description?: string;
  quantity?: number;
  unitPrice?: number;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'planning' | 'in-progress' | 'completed' | 'quality-check' | 'shipped' | 'cancelled';
  estimatedHours?: number;
  notes?: string;
  tags?: string[];
}

class BundleService {
  private readonly collection = 'bundles';
  private readonly productionBundlesCollection = 'production_bundles';

  // Create a new bundle
  async createBundle(bundleData: CreateBundleData, userId: string): Promise<string> {
    try {
      const bundle: Omit<Bundle, 'id'> = {
        bundleNumber: bundleData.bundleNumber,
        description: bundleData.description,
        quantity: bundleData.quantity,
        unitPrice: bundleData.unitPrice,
        totalValue: bundleData.quantity * bundleData.unitPrice,
        status: 'planning',
        priority: bundleData.priority,
        startDate: null,
        dueDate: bundleData.dueDate,
        completionDate: null,
        assignedOperators: [],
        currentOperatorId: null,
        completedQuantity: 0,
        defectQuantity: 0,
        qualityScore: 0,
        estimatedHours: bundleData.estimatedHours,
        actualHours: 0,
        workSessions: [],
        qualityChecks: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId,
        notes: bundleData.notes || '',
        attachments: [],
        tags: bundleData.tags || []
      };

      const docRef = await addDoc(collection(db, this.collection), {
        ...bundle,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating bundle:', error);
      throw error;
    }
  }

  // Get all bundles with optional filtering
  async getBundles(filters?: {
    status?: string;
    assignedTo?: string;
    priority?: string;
    limit?: number;
  }): Promise<Bundle[]> {
    try {
      let q = query(collection(db, this.collection), orderBy('createdAt', 'desc'));

      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters?.assignedTo) {
        q = query(q, where('assignedOperators', 'array-contains', filters.assignedTo));
      }
      if (filters?.priority) {
        q = query(q, where('priority', '==', filters.priority));
      }
      if (filters?.limit) {
        q = query(q, limit(filters.limit));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (doc.data().updatedAt as Timestamp)?.toDate() || new Date(),
        startDate: doc.data().startDate ? (doc.data().startDate as Timestamp).toDate() : null,
        dueDate: (doc.data().dueDate as Timestamp).toDate(),
        completionDate: doc.data().completionDate ? (doc.data().completionDate as Timestamp).toDate() : null,
      })) as Bundle[];
    } catch (error) {
      console.error('Error getting bundles:', error);
      throw error;
    }
  }

  // Get bundle lifecycle data (compatibility method)
  async getBundleLifecycle(bundleId: string): Promise<any | null> {
    // For now, return the bundle data in lifecycle format
    const bundle = await this.getBundleById(bundleId);
    if (!bundle) return null;

    // Convert bundle to lifecycle format expected by the component
    return {
      id: bundle.id,
      bundleId: bundle.bundleNumber,
      description: bundle.description,
      totalQuantity: bundle.quantity,
      completedQuantity: Math.floor(bundle.quantity * 0.3), // Mock 30% completion
      currentStage: {
        id: 'stage_1',
        name: 'Cutting',
        nameNepali: 'काट्ने',
        sequence: 1,
        status: 'in_progress',
        requiredQuantity: bundle.quantity,
        completedQuantity: Math.floor(bundle.quantity * 0.3)
      },
      stages: [
        {
          id: 'stage_1',
          name: 'Cutting',
          nameNepali: 'काट्ने',
          sequence: 1,
          status: 'in_progress',
          requiredQuantity: bundle.quantity,
          completedQuantity: Math.floor(bundle.quantity * 0.3),
          machineType: 'cutting_machine',
          estimatedHours: 8,
          actualHours: 3
        },
        {
          id: 'stage_2',
          name: 'Sewing',
          nameNepali: 'सिलाई',
          sequence: 2,
          status: 'pending',
          requiredQuantity: bundle.quantity,
          completedQuantity: 0,
          machineType: 'sewing_machine',
          estimatedHours: 16,
        }
      ],
      priority: bundle.priority,
      status: bundle.status === 'planning' ? 'draft' : 'active',
      createdAt: bundle.createdAt,
      targetCompletionDate: bundle.dueDate,
      estimatedCompletionDate: bundle.dueDate,
      assignedOperators: bundle.assignedTo ? [bundle.assignedTo] : [],
      notes: `Bundle ${bundle.bundleNumber} - ${bundle.description}`,
      qualityRequirements: [],
      costBreakdown: {
        materialCost: bundle.unitPrice * 0.6,
        laborCost: bundle.unitPrice * 0.3,
        overheadCost: bundle.unitPrice * 0.1,
        totalCost: bundle.unitPrice
      },
      attachments: []
    };
  }

  // Create bundle lifecycle (compatibility method)
  async createBundleLifecycle(bundleData: any): Promise<any> {
    const createData = {
      bundleNumber: bundleData.bundleId || `BDL${Date.now()}`,
      description: bundleData.description || 'New Bundle',
      quantity: bundleData.totalQuantity || 1,
      unitPrice: bundleData.costBreakdown?.totalCost || 0,
      priority: bundleData.priority || 'medium',
      dueDate: bundleData.targetCompletionDate || new Date(),
    };

    const bundleId = await this.createBundle(createData, 'system');
    return this.getBundleLifecycle(bundleId);
  }

  // Update bundle lifecycle (compatibility method)
  async updateBundleLifecycle(bundleId: string, bundleData: any): Promise<any> {
    const updateData = {
      description: bundleData.description,
      quantity: bundleData.totalQuantity,
      priority: bundleData.priority,
      status: bundleData.status === 'draft' ? 'planning' : 'in-progress',
      dueDate: bundleData.targetCompletionDate,
    };

    await this.updateBundle(bundleId, updateData);
    return this.getBundleLifecycle(bundleId);
  }

  // Get bundle by ID
  async getBundleById(bundleId: string): Promise<Bundle | null> {
    try {
      const docRef = doc(db, this.collection, bundleId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
        startDate: data.startDate ? (data.startDate as Timestamp).toDate() : null,
        dueDate: (data.dueDate as Timestamp).toDate(),
        completionDate: data.completionDate ? (data.completionDate as Timestamp).toDate() : null,
      } as Bundle;
    } catch (error) {
      console.error('Error getting bundle:', error);
      throw error;
    }
  }

  // Update bundle
  async updateBundle(bundleId: string, updateData: UpdateBundleData): Promise<void> {
    try {
      const docRef = doc(db, this.collection, bundleId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
        ...(updateData.quantity && updateData.unitPrice && {
          totalValue: updateData.quantity * updateData.unitPrice
        })
      });
    } catch (error) {
      console.error('Error updating bundle:', error);
      throw error;
    }
  }

  // Start work on bundle
  async startWork(bundleId: string, operatorId: string, operatorName: string): Promise<void> {
    try {
      const docRef = doc(db, this.collection, bundleId);
      const bundle = await this.getBundleById(bundleId);
      
      if (!bundle) throw new Error('Bundle not found');

      const workSession: WorkSession = {
        id: `session-${Date.now()}`,
        operatorId,
        operatorName,
        startTime: new Date(),
        endTime: null,
        duration: 0,
        quantityCompleted: 0,
        defectQuantity: 0,
        notes: '',
        isActive: true
      };

      const updatedWorkSessions = [...(bundle.workSessions || []), workSession];
      const assignedOperators = Array.from(new Set([...bundle.assignedOperators, operatorId]));

      await updateDoc(docRef, {
        status: 'in-progress',
        startDate: bundle.startDate || serverTimestamp(),
        currentOperatorId: operatorId,
        assignedOperators,
        workSessions: updatedWorkSessions,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error starting work:', error);
      throw error;
    }
  }

  // End work session
  async endWork(bundleId: string, sessionId: string, quantityCompleted: number, defectQuantity: number = 0, notes: string = ''): Promise<void> {
    try {
      const bundle = await this.getBundleById(bundleId);
      if (!bundle) throw new Error('Bundle not found');

      const workSessions = bundle.workSessions.map(session => {
        if (session.id === sessionId && session.isActive) {
          const endTime = new Date();
          const duration = Math.round((endTime.getTime() - session.startTime.getTime()) / (1000 * 60)); // in minutes
          
          return {
            ...session,
            endTime,
            duration,
            quantityCompleted,
            defectQuantity,
            notes,
            isActive: false
          };
        }
        return session;
      });

      const totalCompleted = bundle.completedQuantity + quantityCompleted;
      const totalDefects = bundle.defectQuantity + defectQuantity;
      const actualHours = workSessions.reduce((total, session) => total + session.duration, 0) / 60;
      
      const status = totalCompleted >= bundle.quantity ? 'completed' : 'in-progress';
      const completionDate = status === 'completed' ? new Date() : null;
      const qualityScore = totalCompleted > 0 ? Math.max(0, 100 - (totalDefects / totalCompleted) * 100) : 100;

      const docRef = doc(db, this.collection, bundleId);
      await updateDoc(docRef, {
        workSessions,
        completedQuantity: totalCompleted,
        defectQuantity: totalDefects,
        actualHours,
        qualityScore: Math.round(qualityScore),
        status,
        completionDate: completionDate ? serverTimestamp() : null,
        currentOperatorId: status === 'completed' ? null : bundle.currentOperatorId,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error ending work:', error);
      throw error;
    }
  }

  // Delete bundle
  async deleteBundle(bundleId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collection, bundleId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting bundle:', error);
      throw error;
    }
  }

  /**
   * Generate production bundles from WIP entry data
   * Creates individual production bundles with mapped operations
   */
  async generateBundles(data: BundleCreationData): Promise<{success: boolean; data?: ProductionBundle[]; error?: string; message?: string}> {
    try {
      const bundles: ProductionBundle[] = [];
      
      // Load all required templates
      const templatePromises = data.articles.map(article => 
        sewingTemplateService.getTemplate(article.templateId)
      );
      
      const templateResults = await Promise.all(templatePromises);
      const templates = new Map<string, SewingTemplate>();
      
      for (let i = 0; i < templateResults.length; i++) {
        const result = templateResults[i];
        if (result.success && result.data) {
          templates.set(data.articles[i].templateId, result.data);
        }
      }

      let bundleCounter = 1;
      
      // Generate bundles using correct logic: Article × Size × Roll × Size Ratio
      for (const article of data.articles) {
        const template = templates.get(article.templateId);
        if (!template) {
          return { 
            success: false, 
            error: `Template not found for article ${article.articleNumber}` 
          };
        }

        // For each fabric roll, create bundles according to size ratios
        for (const roll of data.fabricRolls) {
          for (const sizeInfo of article.sizes) {
            // Each size ratio determines how many bundles per roll
            // sizeInfo.quantity already represents: layers × ratio for this size
            // But we need to create separate bundles per roll, so we calculate bundles per roll
            const layersPerRoll = roll.layerCount;
            const sizeRatio = Math.round(sizeInfo.quantity / (data.fabricRolls.reduce((sum, r) => sum + r.layerCount, 0))); // Extract ratio from quantity
            const bundlesForThisRollSize = layersPerRoll * sizeRatio;
            
            // Create individual bundles for this roll-size combination
            for (let bundleIndex = 0; bundleIndex < bundlesForThisRollSize; bundleIndex++) {
              const bundleNumber = `Bundle-${article.articleNumber.replace(/[^A-Za-z0-9]/g, '')}-${sizeInfo.size}-${String(bundleCounter).padStart(3, '0')}`;
              
              // Create bundle operations from template
              const bundleOperations: BundleOperation[] = template.operations.map((templateOp, index) => ({
                id: `${bundleNumber}-OP-${index + 1}`,
                bundleId: '', // Will be set after bundle creation
                operationId: templateOp.id,
                name: templateOp.name,
                nameNepali: templateOp.nameNepali || '',
                description: templateOp.description,
                machineType: templateOp.machineType,
                sequenceOrder: templateOp.sequenceOrder || index + 1,
                pricePerPiece: templateOp.pricePerPiece,
                smvMinutes: templateOp.smvMinutes,
                status: 'pending',
                prerequisites: templateOp.prerequisites || [],
                isOptional: templateOp.isOptional || false,
                qualityCheckRequired: templateOp.qualityCheckRequired || false,
                defectTolerance: templateOp.defectTolerance || 5,
                notes: templateOp.notes
              }));

              const bundle: ProductionBundle = {
                id: `bundle_${Date.now()}_${bundleCounter}`,
                bundleNumber,
                articleId: article.articleId,
                articleNumber: article.articleNumber,
                articleStyle: article.articleStyle,
                size: sizeInfo.size,
                rollId: roll.rollId,
                rollNumber: roll.rollNumber,
                rollColor: roll.color,
                templateId: article.templateId,
                templateName: template.templateName,
                templateCode: template.templateCode,
                status: 'created',
                priority: 'normal',
                operations: bundleOperations,
                createdAt: new Date(),
                createdBy: data.createdBy,
                totalValue: template.totalPricePerPiece || 0,
                totalSMV: template.totalSmv || 0,
                // Add bundle-specific metadata
                piecesPerBundle: 1, // Each bundle represents pieces cut from one layer of one roll
                sourceRollLayers: layersPerRoll,
                sizeRatio: sizeRatio
              };

              // Update operation bundle IDs
              bundle.operations.forEach(op => {
                op.bundleId = bundle.id;
              });

              bundles.push(bundle);
              bundleCounter++;
            }
          }
        }
      }

      // Save all bundles to database
      const savePromises = bundles.map(async (bundle) => {
        try {
          const docRef = await addDoc(collection(db, this.productionBundlesCollection), {
            ...bundle,
            createdAt: serverTimestamp()
          });
          return { success: true, id: docRef.id };
        } catch (error) {
          return { success: false, error };
        }
      });
      
      const saveResults = await Promise.all(savePromises);
      
      // Check if any saves failed
      const failedSaves = saveResults.filter(result => !result.success);
      if (failedSaves.length > 0) {
        return {
          success: false,
          error: `Failed to save ${failedSaves.length} bundles to database`
        };
      }

      return {
        success: true,
        data: bundles,
        message: `Successfully generated ${bundles.length} production bundles`
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate bundles'
      };
    }
  }

  // Get bundle analytics
  async getBundleAnalytics(): Promise<{
    totalBundles: number;
    completedBundles: number;
    inProgressBundles: number;
    averageCompletionTime: number;
    averageQualityScore: number;
    totalValue: number;
  }> {
    try {
      const bundles = await this.getBundles();
      
      const totalBundles = bundles.length;
      const completedBundles = bundles.filter(b => b.status === 'completed').length;
      const inProgressBundles = bundles.filter(b => b.status === 'in-progress').length;
      
      const completedBundlesWithTime = bundles.filter(b => b.status === 'completed' && b.completionDate && b.startDate);
      const averageCompletionTime = completedBundlesWithTime.length > 0 
        ? completedBundlesWithTime.reduce((sum, bundle) => {
            const completionTime = bundle.completionDate!.getTime() - bundle.startDate!.getTime();
            return sum + (completionTime / (1000 * 60 * 60 * 24)); // in days
          }, 0) / completedBundlesWithTime.length
        : 0;
      
      const averageQualityScore = bundles.length > 0 
        ? bundles.reduce((sum, bundle) => sum + bundle.qualityScore, 0) / bundles.length 
        : 100;
      
      const totalValue = bundles.reduce((sum, bundle) => sum + bundle.totalValue, 0);

      return {
        totalBundles,
        completedBundles,
        inProgressBundles,
        averageCompletionTime: Math.round(averageCompletionTime * 100) / 100,
        averageQualityScore: Math.round(averageQualityScore),
        totalValue
      };
    } catch (error) {
      console.error('Error getting bundle analytics:', error);
      throw error;
    }
  }
}

export const bundleService = new BundleService();