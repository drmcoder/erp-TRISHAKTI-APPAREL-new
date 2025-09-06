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
  startAfter,
  endBefore,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  runTransaction,
  enableNetwork,
  disableNetwork,
  DocumentData,
  QueryDocumentSnapshot,
  Unsubscribe,
  WhereFilterOp,
  OrderByDirection,
  Query,
  DocumentSnapshot,
  CollectionReference,
  Transaction,
  WriteBatch,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import {
  ServiceResponse,
  ServiceMetadata,
  QueryOptions,
  WhereClause,
  BatchOperation,
  BatchResult,
  TransactionOperation,
  TransactionResult,
  SubscriptionOptions,
  SubscriptionCallback,
  SubscriptionMetadata,
  ServiceConfig,
  CacheConfig,
  RetryConfig,
  ValidationConfig,
  PerformanceConfig,
  AuditOptions,
  OfflineOperation,
  ServiceMetrics,
  AnalyticsEvent,
} from '../../types/service-types';
import { BaseEntity, AuditLog } from '../../types/entities';

// Enhanced Base Firebase Service with comprehensive features
export abstract class EnhancedBaseFirebaseService<T extends BaseEntity> {
  protected collectionName: string;
  protected config: ServiceConfig;
  protected cache: Map<string, { data: any; timestamp: number; ttl: number }>;
  protected offlineQueue: OfflineOperation<T>[];
  protected metrics: ServiceMetrics;
  protected listeners: Map<string, Unsubscribe>;

  constructor(collectionName: string, config?: Partial<ServiceConfig>) {
    this.collectionName = collectionName;
    this.config = this.mergeConfig(config);
    this.cache = new Map();
    this.offlineQueue = [];
    this.listeners = new Map();
    this.metrics = this.initializeMetrics();
    
    // Initialize offline sync if enabled
    if (this.config.offlineSync) {
      this.initializeOfflineSync();
    }
  }

  // Configuration management
  private mergeConfig(customConfig?: Partial<ServiceConfig>): ServiceConfig {
    const defaultConfig: ServiceConfig = {
      cache: {
        enabled: true,
        ttl: 5 * 60 * 1000, // 5 minutes
        maxSize: 1000,
        strategy: 'lru',
        invalidateOnUpdate: true,
        prefetch: false,
      },
      retry: {
        enabled: true,
        maxAttempts: 3,
        backoffStrategy: 'exponential',
        baseDelay: 1000,
        maxDelay: 10000,
        retryCondition: (error: any) => !error.code?.includes('permission'),
      },
      validation: {
        enabled: true,
        strict: false,
        customValidators: {},
        sanitizers: {},
      },
      performance: {
        enabled: true,
        trackLatency: true,
        trackThroughput: true,
        trackErrors: true,
        sampleRate: 1.0,
      },
      timeout: 30000,
      compression: false,
      offlineSync: true,
    };

    return { ...defaultConfig, ...customConfig };
  }

  private initializeMetrics(): ServiceMetrics {
    return {
      requestCount: 0,
      averageLatency: 0,
      errorRate: 0,
      cacheHitRate: 0,
      throughput: 0,
      lastUpdated: new Date(),
    };
  }

  // Utility methods
  protected getCollectionRef(): CollectionReference {
    return collection(db, this.collectionName);
  }

  protected getDocumentRef(id: string) {
    return doc(db, this.collectionName, id);
  }

  protected async executeWithRetry<R>(
    operation: () => Promise<R>,
    context: string
  ): Promise<R> {
    if (!this.config.retry.enabled) {
      return operation();
    }

    let lastError: any;
    let delay = this.config.retry.baseDelay;

    for (let attempt = 1; attempt <= this.config.retry.maxAttempts; attempt++) {
      try {
        const startTime = Date.now();
        const result = await Promise.race([
          operation(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), this.config.timeout)
          ),
        ]) as R;

        // Track performance metrics
        if (this.config.performance.enabled) {
          this.updateMetrics('success', Date.now() - startTime);
        }

        return result;
      } catch (error) {
        lastError = error;
        
        // Track error metrics
        if (this.config.performance.enabled) {
          this.updateMetrics('error', 0);
        }

        // Check if we should retry
        if (
          attempt === this.config.retry.maxAttempts ||
          !this.config.retry.retryCondition?.(error)
        ) {
          break;
        }

        // Wait before retrying
        await this.delay(delay);
        
        // Calculate next delay based on strategy
        switch (this.config.retry.backoffStrategy) {
          case 'exponential':
            delay = Math.min(delay * 2, this.config.retry.maxDelay);
            break;
          case 'linear':
            delay = Math.min(delay + this.config.retry.baseDelay, this.config.retry.maxDelay);
            break;
          // 'fixed' uses the same delay
        }
      }
    }

    throw lastError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private updateMetrics(type: 'success' | 'error', latency: number): void {
    this.metrics.requestCount++;
    
    if (type === 'success') {
      this.metrics.averageLatency = 
        (this.metrics.averageLatency + latency) / 2;
    }
    
    this.metrics.errorRate = 
      this.metrics.errorRate * 0.9 + (type === 'error' ? 0.1 : 0);
    
    this.metrics.lastUpdated = new Date();
  }

  // Cache management
  protected getCacheKey(operation: string, params: any): string {
    return `${this.collectionName}:${operation}:${JSON.stringify(params)}`;
  }

  protected getFromCache<R>(key: string): R | null {
    if (!this.config.cache.enabled) return null;

    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update cache hit rate
    this.metrics.cacheHitRate = this.metrics.cacheHitRate * 0.9 + 0.1;
    
    return cached.data;
  }

  protected setCache<R>(key: string, data: R, customTtl?: number): void {
    if (!this.config.cache.enabled) return;

    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.config.cache.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: customTtl || this.config.cache.ttl,
    });
  }

  protected invalidateCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Data validation
  protected validateData(data: any): { valid: boolean; errors: string[] } {
    if (!this.config.validation.enabled) {
      return { valid: true, errors: [] };
    }

    const errors: string[] = [];
    
    // Override in derived classes for specific validation
    if (this.validate) {
      const result = this.validate(data);
      if (!result.valid) {
        errors.push(...result.errors);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  protected abstract validate?(data: any): { valid: boolean; errors: string[] };

  // Audit logging
  protected async logAudit(
    action: string,
    entityId: string,
    changes?: any,
    userId?: string
  ): Promise<void> {
    if (!this.shouldAudit()) return;

    try {
      const auditLog: Omit<AuditLog, 'id'> = {
        entityType: this.collectionName,
        entityId,
        action: action as any,
        performedBy: userId || 'system',
        userRole: 'unknown', // Should be passed from context
        changes: changes ? [changes] : undefined,
        metadata: {
          timestamp: new Date(),
          service: this.constructor.name,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'auditLogs'), auditLog);
    } catch (error) {
      console.error('Failed to log audit:', error);
    }
  }

  protected shouldAudit(): boolean {
    // Override in derived classes or implement configuration-based logic
    return true;
  }

  // Offline sync management
  private initializeOfflineSync(): void {
    // Listen for online/offline events
    window.addEventListener('online', this.processPendingOperations.bind(this));
    window.addEventListener('offline', () => {
      console.log(`${this.collectionName} service is now offline`);
    });

    // Process pending operations on initialization
    this.processPendingOperations();
  }

  private async processPendingOperations(): Promise<void> {
    if (!navigator.onLine || this.offlineQueue.length === 0) return;

    console.log(`Processing ${this.offlineQueue.length} offline operations for ${this.collectionName}`);

    const operations = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const operation of operations) {
      try {
        await this.executeOfflineOperation(operation);
      } catch (error) {
        operation.retryCount++;
        operation.status = 'failed';
        operation.error = error instanceof Error ? error.message : 'Unknown error';

        // Re-queue if retry count is below threshold
        if (operation.retryCount < 3) {
          operation.status = 'pending';
          this.offlineQueue.push(operation);
        }
      }
    }
  }

  private async executeOfflineOperation(operation: OfflineOperation<T>): Promise<void> {
    switch (operation.type) {
      case 'create':
        if (operation.data) {
          await this.create(operation.data);
        }
        break;
      case 'update':
        if (operation.documentId && operation.data) {
          await this.update(operation.documentId, operation.data);
        }
        break;
      case 'delete':
        if (operation.documentId) {
          await this.delete(operation.documentId);
        }
        break;
    }
  }

  private addToOfflineQueue(operation: Omit<OfflineOperation<T>, 'id' | 'timestamp' | 'status' | 'retryCount'>): void {
    if (this.offlineQueue.length >= (this.config as any).maxOfflineOperations) {
      // Remove oldest operation
      this.offlineQueue.shift();
    }

    this.offlineQueue.push({
      ...operation,
      id: Date.now().toString(),
      timestamp: new Date(),
      status: 'pending',
      retryCount: 0,
    });
  }

  // Generic CRUD Operations
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>, userId?: string): Promise<ServiceResponse<T>> {
    return this.executeWithRetry(async () => {
      // Validate data
      const validation = this.validateData(data);
      if (!validation.valid) {
        return {
          success: false,
          error: 'Validation failed',
          errorCode: 'VALIDATION_ERROR',
          metadata: { errors: validation.errors },
        };
      }

      // Check cache first
      const cacheKey = this.getCacheKey('create', data);

      // Prepare document data
      const docData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userId,
        updatedBy: userId,
      } as T;

      let docRef;
      if (navigator.onLine) {
        docRef = await addDoc(this.getCollectionRef(), docData);
        
        // Get the created document with resolved timestamp
        const createdDoc = await this.getById(docRef.id);
        
        // Cache the result
        this.setCache(cacheKey, createdDoc.data);
        
        // Log audit
        await this.logAudit('create', docRef.id, docData, userId);
        
        // Invalidate related cache
        if (this.config.cache.invalidateOnUpdate) {
          this.invalidateCache(this.collectionName);
        }

        return {
          success: true,
          data: createdDoc.data,
          id: docRef.id,
          message: 'Document created successfully',
        };
      } else {
        // Add to offline queue
        this.addToOfflineQueue({
          type: 'create',
          collection: this.collectionName,
          data: docData,
        });

        // Generate temporary ID for offline operation
        const tempId = `offline_${Date.now()}`;
        const offlineDoc = { ...docData, id: tempId } as T;

        return {
          success: true,
          data: offlineDoc,
          id: tempId,
          message: 'Document queued for creation (offline)',
          metadata: { offline: true },
        };
      }
    }, 'create');
  }

  async getById(id: string, useCache = true): Promise<ServiceResponse<T>> {
    return this.executeWithRetry(async () => {
      const cacheKey = this.getCacheKey('getById', { id });

      // Check cache first
      if (useCache) {
        const cached = this.getFromCache<T>(cacheKey);
        if (cached) {
          return {
            success: true,
            data: cached,
            metadata: { cached: true },
          };
        }
      }

      const docRef = this.getDocumentRef(id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as T;

        // Cache the result
        if (useCache) {
          this.setCache(cacheKey, data);
        }

        return {
          success: true,
          data,
          metadata: { cached: false },
        };
      } else {
        return {
          success: false,
          error: 'Document not found',
          errorCode: 'NOT_FOUND',
        };
      }
    }, 'getById');
  }

  async update(
    id: string,
    data: Partial<Omit<T, 'id' | 'createdAt'>>,
    userId?: string
  ): Promise<ServiceResponse<T>> {
    return this.executeWithRetry(async () => {
      // Validate data
      const validation = this.validateData(data);
      if (!validation.valid) {
        return {
          success: false,
          error: 'Validation failed',
          errorCode: 'VALIDATION_ERROR',
          metadata: { errors: validation.errors },
        };
      }

      if (navigator.onLine) {
        // Get current document for audit trail
        const currentDoc = await this.getById(id, false);
        if (!currentDoc.success) {
          return currentDoc as ServiceResponse<T>;
        }

        const docRef = this.getDocumentRef(id);
        const updateData = {
          ...data,
          updatedAt: serverTimestamp(),
          updatedBy: userId,
        };

        await updateDoc(docRef, updateData);

        // Get updated document
        const updatedDoc = await this.getById(id, false);

        // Log audit with changes
        const changes = this.calculateChanges(currentDoc.data!, updateData);
        await this.logAudit('update', id, changes, userId);

        // Invalidate cache
        if (this.config.cache.invalidateOnUpdate) {
          this.invalidateCache(id);
        }

        return {
          success: true,
          data: updatedDoc.data,
          message: 'Document updated successfully',
        };
      } else {
        // Add to offline queue
        this.addToOfflineQueue({
          type: 'update',
          collection: this.collectionName,
          documentId: id,
          data: data as T,
        });

        return {
          success: true,
          message: 'Update queued for sync (offline)',
          metadata: { offline: true },
        };
      }
    }, 'update');
  }

  async delete(id: string, userId?: string): Promise<ServiceResponse<void>> {
    return this.executeWithRetry(async () => {
      if (navigator.onLine) {
        // Get current document for audit trail
        const currentDoc = await this.getById(id, false);
        
        const docRef = this.getDocumentRef(id);
        await deleteDoc(docRef);

        // Log audit
        await this.logAudit('delete', id, currentDoc.data, userId);

        // Invalidate cache
        if (this.config.cache.invalidateOnUpdate) {
          this.invalidateCache(id);
        }

        return {
          success: true,
          message: 'Document deleted successfully',
        };
      } else {
        // Add to offline queue
        this.addToOfflineQueue({
          type: 'delete',
          collection: this.collectionName,
          documentId: id,
        });

        return {
          success: true,
          message: 'Delete queued for sync (offline)',
          metadata: { offline: true },
        };
      }
    }, 'delete');
  }

  // Helper method for calculating changes
  private calculateChanges(oldData: T, newData: any): any {
    const changes: any = {};
    
    for (const key in newData) {
      if (oldData[key as keyof T] !== newData[key]) {
        changes[key] = {
          oldValue: oldData[key as keyof T],
          newValue: newData[key],
        };
      }
    }
    
    return changes;
  }

  // Advanced query method with comprehensive options
  async query(options: QueryOptions = {}): Promise<ServiceResponse<T[]>> {
    return this.executeWithRetry(async () => {
      const cacheKey = this.getCacheKey('query', options);

      // Check cache first
      if (options.useCache !== false) {
        const cached = this.getFromCache<T[]>(cacheKey);
        if (cached) {
          return {
            success: true,
            data: cached,
            metadata: { cached: true, totalCount: cached.length },
          };
        }
      }

      let q = query(this.getCollectionRef());

      // Apply where clauses
      if (options.where && options.where.length > 0) {
        options.where.forEach(clause => {
          q = query(q, where(clause.field, clause.operator, clause.value));
        });
      }

      // Apply ordering
      if (options.orderByField) {
        q = query(q, orderBy(options.orderByField, options.orderDirection || 'asc'));
      }

      // Apply pagination
      if (options.lastDoc) {
        q = query(q, startAfter(options.lastDoc));
      }

      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      const querySnapshot = await getDocs(q);
      const documents = querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];

      // Cache the result
      if (options.useCache !== false) {
        this.setCache(cacheKey, documents);
      }

      const metadata: ServiceMetadata = {
        totalCount: documents.length,
        hasMore: documents.length === (options.limit || 0),
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
        cached: false,
      };

      return {
        success: true,
        data: documents,
        metadata,
      };
    }, 'query');
  }

  // Get all documents with advanced options
  async getAll(options: QueryOptions = {}): Promise<ServiceResponse<T[]>> {
    return this.query(options);
  }

  // Get documents with where clause
  async getWhere(
    field: keyof T,
    operator: WhereFilterOp,
    value: any,
    options: Omit<QueryOptions, 'where'> = {}
  ): Promise<ServiceResponse<T[]>> {
    const whereClause: WhereClause = { field: field as string, operator, value };
    return this.query({ ...options, where: [whereClause] });
  }

  // Real-time subscription with advanced options
  subscribe(
    callback: SubscriptionCallback<T>,
    options: SubscriptionOptions = {}
  ): Unsubscribe {
    let q = query(this.getCollectionRef());

    // Apply filters
    if (options.filter && options.filter.length > 0) {
      options.filter.forEach(clause => {
        q = query(q, where(clause.field, clause.operator, clause.value));
      });
    }

    // Apply ordering
    if (options.orderBy) {
      q = query(q, orderBy(options.orderBy.field, options.orderBy.direction));
    }

    // Apply limit
    if (options.limit) {
      q = query(q, limit(options.limit));
    }

    const listenerId = Date.now().toString();
    
    const unsubscribe = onSnapshot(
      q,
      {
        includeMetadataChanges: options.includeMetadata || false,
      },
      (querySnapshot) => {
        const documents = querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];

        const metadata: SubscriptionMetadata = {
          source: querySnapshot.metadata.fromCache ? 'cache' : 'server',
          hasPendingWrites: querySnapshot.metadata.hasPendingWrites,
          isFromCache: querySnapshot.metadata.fromCache,
          timestamp: new Date(),
        };

        // Update cache with real-time data
        if (this.config.cache.enabled) {
          const cacheKey = this.getCacheKey('subscribe', options);
          this.setCache(cacheKey, documents);
        }

        callback(documents, metadata);
      },
      (error) => {
        console.error(`Error in ${this.collectionName} subscription:`, error);
        callback([], {
          source: 'server',
          hasPendingWrites: false,
          isFromCache: false,
          timestamp: new Date(),
        });
      }
    );

    this.listeners.set(listenerId, unsubscribe);

    // Return enhanced unsubscribe function
    return () => {
      unsubscribe();
      this.listeners.delete(listenerId);
    };
  }

  // Subscribe to a single document
  subscribeToDocument(
    id: string,
    callback: (data: T | null, metadata?: SubscriptionMetadata) => void
  ): Unsubscribe {
    const docRef = this.getDocumentRef(id);
    const listenerId = `doc_${id}`;

    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        const metadata: SubscriptionMetadata = {
          source: doc.metadata.fromCache ? 'cache' : 'server',
          hasPendingWrites: doc.metadata.hasPendingWrites,
          isFromCache: doc.metadata.fromCache,
          timestamp: new Date(),
        };

        if (doc.exists()) {
          const data = { id: doc.id, ...doc.data() } as T;
          
          // Update cache
          if (this.config.cache.enabled) {
            const cacheKey = this.getCacheKey('getById', { id });
            this.setCache(cacheKey, data);
          }

          callback(data, metadata);
        } else {
          callback(null, metadata);
        }
      },
      (error) => {
        console.error(`Error subscribing to document ${id}:`, error);
        callback(null);
      }
    );

    this.listeners.set(listenerId, unsubscribe);

    return () => {
      unsubscribe();
      this.listeners.delete(listenerId);
    };
  }

  // Get service metrics
  getMetrics(): ServiceMetrics {
    return { ...this.metrics };
  }

  // Get cache statistics
  getCacheStats(): { size: number; keys: string[]; hitRate: number } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      hitRate: this.metrics.cacheHitRate,
    };
  }

  // Cleanup method
  cleanup(): void {
    // Clear all listeners
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();

    // Clear cache
    this.cache.clear();

    // Clear offline queue
    this.offlineQueue = [];

    console.log(`${this.collectionName} service cleaned up`);
  }

  // Enable/disable network
  async setNetworkEnabled(enabled: boolean): Promise<void> {
    try {
      if (enabled) {
        await enableNetwork(db);
        console.log(`${this.collectionName} service: Network enabled`);
        
        // Process pending operations
        if (this.config.offlineSync) {
          await this.processPendingOperations();
        }
      } else {
        await disableNetwork(db);
        console.log(`${this.collectionName} service: Network disabled`);
      }
    } catch (error) {
      console.error(`Error ${enabled ? 'enabling' : 'disabling'} network:`, error);
    }
  }

  // Batch operations for bulk processing
  async batchCreate(
    documents: Array<{ id?: string; data: Omit<T, 'id' | 'createdAt' | 'updatedAt'> }>,
    userId?: string
  ): Promise<BatchResult> {
    return this.executeWithRetry(async () => {
      const batch = writeBatch(db);
      const results: BatchResult['results'] = [];

      documents.forEach(({ id, data }) => {
        try {
          // Validate each document
          const validation = this.validateData(data);
          if (!validation.valid) {
            results.push({
              id: id || 'unknown',
              success: false,
              error: `Validation failed: ${validation.errors.join(', ')}`,
            });
            return;
          }

          const docData = {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: userId,
            updatedBy: userId,
          } as T;

          const docRef = id ? this.getDocumentRef(id) : doc(this.getCollectionRef());
          batch.set(docRef, docData);
          
          results.push({
            id: docRef.id,
            success: true,
          });
        } catch (error) {
          results.push({
            id: id || 'unknown',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      });

      try {
        await batch.commit();
        
        // Invalidate cache
        if (this.config.cache.invalidateOnUpdate) {
          this.invalidateCache(this.collectionName);
        }

        const successfulResults = results.filter(r => r.success);
        
        // Log audit for successful operations
        for (const result of successfulResults) {
          await this.logAudit('create', result.id, null, userId);
        }

        return {
          success: true,
          results,
          totalProcessed: documents.length,
          totalFailed: results.filter(r => !r.success).length,
        };
      } catch (error) {
        return {
          success: false,
          results: results.map(r => ({ ...r, success: false, error: 'Batch commit failed' })),
          totalProcessed: documents.length,
          totalFailed: documents.length,
        };
      }
    }, 'batchCreate');
  }

  // Batch update operations
  async batchUpdate(
    operations: Array<{ id: string; data: Partial<Omit<T, 'id' | 'createdAt'>> }>,
    userId?: string
  ): Promise<BatchResult> {
    return this.executeWithRetry(async () => {
      const batch = writeBatch(db);
      const results: BatchResult['results'] = [];

      for (const operation of operations) {
        try {
          // Validate data
          const validation = this.validateData(operation.data);
          if (!validation.valid) {
            results.push({
              id: operation.id,
              success: false,
              error: `Validation failed: ${validation.errors.join(', ')}`,
            });
            continue;
          }

          const updateData = {
            ...operation.data,
            updatedAt: serverTimestamp(),
            updatedBy: userId,
          };

          const docRef = this.getDocumentRef(operation.id);
          batch.update(docRef, updateData);
          
          results.push({
            id: operation.id,
            success: true,
          });
        } catch (error) {
          results.push({
            id: operation.id,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      try {
        await batch.commit();
        
        // Invalidate cache
        if (this.config.cache.invalidateOnUpdate) {
          this.invalidateCache(this.collectionName);
        }

        const successfulResults = results.filter(r => r.success);
        
        // Log audit for successful operations
        for (const result of successfulResults) {
          await this.logAudit('update', result.id, null, userId);
        }

        return {
          success: true,
          results,
          totalProcessed: operations.length,
          totalFailed: results.filter(r => !r.success).length,
        };
      } catch (error) {
        return {
          success: false,
          results: results.map(r => ({ ...r, success: false, error: 'Batch commit failed' })),
          totalProcessed: operations.length,
          totalFailed: operations.length,
        };
      }
    }, 'batchUpdate');
  }

  // Transaction support for atomic operations
  async transaction<R>(
    operations: TransactionOperation<T>[],
    userId?: string
  ): Promise<TransactionResult> {
    return this.executeWithRetry(async () => {
      try {
        const result = await runTransaction(db, async (transaction: Transaction) => {
          const results: Record<string, any> = {};

          for (const operation of operations) {
            const { type, collection: collectionName, id, data, conditions } = operation;

            if (collectionName !== this.collectionName) {
              throw new Error(`Transaction can only operate on ${this.collectionName} collection`);
            }

            switch (type) {
              case 'read':
                if (id) {
                  const docRef = this.getDocumentRef(id);
                  const docSnap = await transaction.get(docRef);
                  results[id] = docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
                }
                break;

              case 'create':
                if (data) {
                  const validation = this.validateData(data);
                  if (!validation.valid) {
                    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
                  }

                  const docRef = doc(this.getCollectionRef());
                  const docData = {
                    ...data,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    createdBy: userId,
                    updatedBy: userId,
                  } as T;

                  transaction.set(docRef, docData);
                  results[docRef.id] = { id: docRef.id, ...docData };
                }
                break;

              case 'update':
                if (id && data) {
                  const validation = this.validateData(data);
                  if (!validation.valid) {
                    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
                  }

                  const docRef = this.getDocumentRef(id);
                  const updateData = {
                    ...data,
                    updatedAt: serverTimestamp(),
                    updatedBy: userId,
                  };

                  transaction.update(docRef, updateData);
                  results[id] = { id, ...updateData };
                }
                break;

              case 'delete':
                if (id) {
                  const docRef = this.getDocumentRef(id);
                  transaction.delete(docRef);
                  results[id] = { deleted: true };
                }
                break;
            }
          }

          return results;
        });

        // Invalidate cache after successful transaction
        if (this.config.cache.invalidateOnUpdate) {
          this.invalidateCache(this.collectionName);
        }

        // Log audit for transaction
        await this.logAudit('transaction', 'multiple', operations, userId);

        return {
          success: true,
          results: result,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Transaction failed',
        };
      }
    }, 'transaction');
  }
}
