// Base Service for Firebase operations
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  writeBatch,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  id?: string;
}

export interface QueryOptions {
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  limitCount?: number;
}

export interface WhereClause {
  field: string;
  operator: any; // FirebaseFirestore.WhereFilterOp
  value: any;
}

export class BaseService {
  protected collectionName: string;
  private cache: Map<string, { data: any; timestamp: number }>;
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(collectionName: string) {
    this.collectionName = collectionName;
    this.cache = new Map();
  }

  /**
   * Get collection reference
   */
  protected getCollection() {
    return collection(db, this.collectionName);
  }

  /**
   * Get document reference
   */
  protected getDocRef(id: string) {
    return doc(db, this.collectionName, id);
  }

  /**
   * Create a new document
   */
  async create<T>(data: T, id?: string): Promise<ServiceResponse<T>> {
    try {
      const docData = {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = id ? this.getDocRef(id) : doc(this.getCollection());
      await setDoc(docRef, docData);

      // Clear relevant cache
      this.invalidateCache();

      return {
        success: true,
        data: { ...docData, id: docRef.id } as T,
        id: docRef.id,
      };
    } catch (error) {
      console.error(`Error creating document in ${this.collectionName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get document by ID
   */
  async getById<T>(id: string, useCache = true): Promise<ServiceResponse<T>> {
    try {
      // Check cache first
      if (useCache) {
        const cached = this.getFromCache(id);
        if (cached) {
          return { success: true, data: cached };
        }
      }

      const docRef = this.getDocRef(id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as T;
        
        // Cache the result
        if (useCache) {
          this.setCache(id, data);
        }

        return { success: true, data };
      } else {
        return { success: false, error: 'Document not found' };
      }
    } catch (error) {
      console.error(`Error getting document ${id} from ${this.collectionName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Update document
   */
  async update<T>(id: string, updates: Partial<T>): Promise<ServiceResponse<T>> {
    try {
      const docRef = this.getDocRef(id);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(docRef, updateData);

      // Clear cache for this document
      this.cache.delete(id);

      // Get updated document
      const result = await this.getById<T>(id, false);
      return result;
    } catch (error) {
      console.error(`Error updating document ${id} in ${this.collectionName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Delete document
   */
  async delete(id: string): Promise<ServiceResponse> {
    try {
      const docRef = this.getDocRef(id);
      await deleteDoc(docRef);

      // Clear cache
      this.cache.delete(id);
      this.invalidateCache();

      return { success: true };
    } catch (error) {
      console.error(`Error deleting document ${id} from ${this.collectionName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get all documents with optional ordering and limiting
   */
  async getAll<T>(options?: QueryOptions): Promise<ServiceResponse<T[]>> {
    try {
      let q = query(this.getCollection());

      if (options?.orderByField) {
        q = query(q, orderBy(options.orderByField, options.orderDirection || 'asc'));
      }

      if (options?.limitCount) {
        q = query(q, limit(options.limitCount));
      }

      const querySnapshot = await getDocs(q);
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];

      return { success: true, data: documents };
    } catch (error) {
      console.error(`Error getting all documents from ${this.collectionName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Query documents with where clause
   */
  async getWhere<T>(
    whereClause: WhereClause,
    options?: QueryOptions
  ): Promise<ServiceResponse<T[]>> {
    try {
      let q = query(
        this.getCollection(),
        where(whereClause.field, whereClause.operator, whereClause.value)
      );

      if (options?.orderByField) {
        q = query(q, orderBy(options.orderByField, options.orderDirection || 'asc'));
      }

      if (options?.limitCount) {
        q = query(q, limit(options.limitCount));
      }

      const querySnapshot = await getDocs(q);
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];

      return { success: true, data: documents };
    } catch (error) {
      console.error(`Error querying documents from ${this.collectionName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Batch operations
   */
  async batchCreate<T>(documents: Array<{ id?: string; data: T }>): Promise<ServiceResponse> {
    try {
      const batch = writeBatch(db);

      documents.forEach(({ id, data }) => {
        const docData = {
          ...data,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        const docRef = id ? this.getDocRef(id) : doc(this.getCollection());
        batch.set(docRef, docData);
      });

      await batch.commit();
      this.invalidateCache();

      return { success: true };
    } catch (error) {
      console.error(`Error batch creating documents in ${this.collectionName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Subscribe to real-time updates
   */
  subscribeToDocument<T>(
    id: string,
    callback: (data: T | null) => void
  ): () => void {
    const docRef = this.getDocRef(id);
    
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = { id: doc.id, ...doc.data() } as T;
        this.setCache(id, data);
        callback(data);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error(`Error subscribing to document ${id}:`, error);
      callback(null);
    });
  }

  /**
   * Subscribe to collection changes
   */
  subscribeToCollection<T>(
    callback: (data: T[]) => void,
    whereClause?: WhereClause,
    options?: QueryOptions
  ): () => void {
    let q = query(this.getCollection());

    if (whereClause) {
      q = query(q, where(whereClause.field, whereClause.operator, whereClause.value));
    }

    if (options?.orderByField) {
      q = query(q, orderBy(options.orderByField, options.orderDirection || 'asc'));
    }

    if (options?.limitCount) {
      q = query(q, limit(options.limitCount));
    }

    return onSnapshot(q, (querySnapshot) => {
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
      
      callback(documents);
    }, (error) => {
      console.error(`Error subscribing to collection ${this.collectionName}:`, error);
      callback([]);
    });
  }

  /**
   * Cache management
   */
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    
    // Remove expired cache
    if (cached) {
      this.cache.delete(key);
    }
    
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  protected invalidateCache(pattern?: string): void {
    if (pattern) {
      // Remove cache entries matching pattern
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}