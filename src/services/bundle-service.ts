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
import { db } from '@/config/firebase';

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