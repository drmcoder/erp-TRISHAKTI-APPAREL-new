// src/infrastructure/firebase/base-service.ts
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
  onSnapshot,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
  Unsubscribe,
  WhereFilterOp,
  OrderByDirection,
} from 'firebase/firestore';
import { db } from './config';

// Standard response format
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  id?: string;
}

// Base Firebase Service using Template Method Pattern
export abstract class BaseFirebaseService<T extends DocumentData> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  // Generic CRUD Operations
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceResponse<T>> {
    try {
      const docData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      } as T;

      const docRef = await addDoc(collection(db, this.collectionName), docData);
      const createdDoc = await this.getById(docRef.id);

      return {
        success: true,
        data: createdDoc.data,
        id: docRef.id,
      };
    } catch (error) {
      console.error(`Error creating ${this.collectionName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getById(id: string): Promise<ServiceResponse<T>> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          success: true,
          data: { id: docSnap.id, ...docSnap.data() } as T,
        };
      } else {
        return {
          success: false,
          error: 'Document not found',
        };
      }
    } catch (error) {
      console.error(`Error getting ${this.collectionName} by ID:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async update(
    id: string,
    data: Partial<Omit<T, 'id' | 'createdAt'>>
  ): Promise<ServiceResponse<void>> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(docRef, updateData);

      return { success: true };
    } catch (error) {
      console.error(`Error updating ${this.collectionName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async delete(id: string): Promise<ServiceResponse<void>> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);

      return { success: true };
    } catch (error) {
      console.error(`Error deleting ${this.collectionName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getAll(
    orderByField?: keyof T,
    orderDirection?: OrderByDirection,
    limitCount?: number
  ): Promise<ServiceResponse<T[]>> {
    try {
      let q = query(collection(db, this.collectionName));

      if (orderByField) {
        q = query(q, orderBy(orderByField as string, orderDirection || 'asc'));
      }

      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const querySnapshot = await getDocs(q);
      const documents = querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];

      return {
        success: true,
        data: documents,
      };
    } catch (error) {
      console.error(`Error getting all ${this.collectionName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getWhere(
    field: keyof T,
    operator: WhereFilterOp,
    value: any,
    orderByField?: keyof T,
    limitCount?: number
  ): Promise<ServiceResponse<T[]>> {
    try {
      let q = query(collection(db, this.collectionName), where(field as string, operator, value));

      if (orderByField) {
        q = query(q, orderBy(orderByField as string));
      }

      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const querySnapshot = await getDocs(q);
      const documents = querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];

      return {
        success: true,
        data: documents,
      };
    } catch (error) {
      console.error(`Error querying ${this.collectionName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Real-time subscription with cleanup
  subscribe(callback: (data: T[]) => void): Unsubscribe {
    const q = query(collection(db, this.collectionName));

    return onSnapshot(
      q,
      querySnapshot => {
        const documents = querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];

        callback(documents);
      },
      error => {
        console.error(`Error in ${this.collectionName} subscription:`, error);
      }
    );
  }

  // Subscribe with query conditions
  subscribeWhere(
    field: keyof T,
    operator: WhereFilterOp,
    value: any,
    callback: (data: T[]) => void
  ): Unsubscribe {
    const q = query(collection(db, this.collectionName), where(field as string, operator, value));

    return onSnapshot(
      q,
      querySnapshot => {
        const documents = querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];

        callback(documents);
      },
      error => {
        console.error(`Error in ${this.collectionName} subscription:`, error);
      }
    );
  }
}
