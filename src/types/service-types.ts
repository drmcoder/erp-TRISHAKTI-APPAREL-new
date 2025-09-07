// src/types/service-types.ts
import type { WhereFilterOp, OrderByDirection } from 'firebase/firestore';
import type { BaseEntity } from './entities';

// Standard service response format
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  message?: string;
  id?: string;
  metadata?: ServiceMetadata;
}

// Service metadata for pagination, caching, etc.
export interface ServiceMetadata {
  totalCount?: number;
  page?: number;
  pageSize?: number;
  hasMore?: boolean;
  lastDoc?: any;
  cached?: boolean;
  cacheTime?: number;
  executionTime?: number;
}

// Query options for filtering, sorting, and pagination
export interface QueryOptions {
  // Sorting
  orderByField?: string;
  orderDirection?: OrderByDirection;
  
  // Pagination
  limit?: number;
  page?: number;
  lastDoc?: any;
  
  // Filtering
  where?: WhereClause[];
  
  // Additional options
  includeDeleted?: boolean;
  useCache?: boolean;
  timeout?: number;
}

// Where clause for filtering
export interface WhereClause {
  field: string;
  operator: WhereFilterOp;
  value: any;
}

// Complex query builder
export interface QueryBuilder<T extends BaseEntity> {
  where(field: keyof T, operator: WhereFilterOp, value: any): QueryBuilder<T>;
  orderBy(field: keyof T, direction?: OrderByDirection): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
  startAfter(doc: any): QueryBuilder<T>;
  cache(enabled: boolean): QueryBuilder<T>;
  execute(): Promise<ServiceResponse<T[]>>;
}

// Batch operation types
export interface BatchOperation<T> {
  operation: 'create' | 'update' | 'delete';
  id?: string;
  data?: T;
  conditions?: WhereClause[];
}

export interface BatchResult {
  success: boolean;
  results: Array<{
    id: string;
    success: boolean;
    error?: string;
  }>;
  totalProcessed: number;
  totalFailed: number;
}

// Transaction types
export interface TransactionOperation<T> {
  type: 'read' | 'create' | 'update' | 'delete';
  collection: string;
  id?: string;
  data?: T;
  conditions?: WhereClause[];
}

export interface TransactionResult {
  success: boolean;
  results: Record<string, any>;
  error?: string;
}

// Subscription types
export interface SubscriptionOptions {
  includeMetadata?: boolean;
  filter?: WhereClause[];
  orderBy?: { field: string; direction: OrderByDirection };
  limit?: number;
}

export interface SubscriptionCallback<T> {
  (data: T[], metadata?: SubscriptionMetadata): void;
}

export interface SubscriptionMetadata {
  source: 'cache' | 'server';
  hasPendingWrites: boolean;
  isFromCache: boolean;
  timestamp: Date;
}

// Cache configuration
export interface CacheConfig {
  enabled: boolean;
  ttl: number; // time to live in milliseconds
  maxSize: number;
  strategy: 'lru' | 'lfu' | 'ttl';
  invalidateOnUpdate: boolean;
  prefetch?: boolean;
}

// Retry configuration
export interface RetryConfig {
  enabled: boolean;
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  baseDelay: number;
  maxDelay: number;
  retryCondition?: (error: any) => boolean;
}

// Validation configuration
export interface ValidationConfig {
  enabled: boolean;
  strict: boolean;
  customValidators?: Record<string, (value: any) => boolean>;
  sanitizers?: Record<string, (value: any) => any>;
}

// Performance monitoring
export interface PerformanceConfig {
  enabled: boolean;
  trackLatency: boolean;
  trackThroughput: boolean;
  trackErrors: boolean;
  sampleRate: number; // 0 to 1
}

// Service configuration
export interface ServiceConfig {
  cache: CacheConfig;
  retry: RetryConfig;
  validation: ValidationConfig;
  performance: PerformanceConfig;
  timeout: number;
  compression: boolean;
  offlineSync: boolean;
}

// Audit trail types
export interface AuditOptions {
  enabled: boolean;
  trackChanges: boolean;
  trackAccess: boolean;
  includeMetadata: boolean;
  retentionDays: number;
}

// Data compression types
export interface CompressionOptions {
  enabled: boolean;
  algorithm: 'gzip' | 'lz4' | 'brotli';
  threshold: number; // minimum size to compress
  level: number; // compression level
}

// Offline sync types
export interface OfflineSyncConfig {
  enabled: boolean;
  syncStrategy: 'immediate' | 'scheduled' | 'manual';
  syncInterval: number;
  conflictResolution: 'server_wins' | 'client_wins' | 'merge' | 'manual';
  maxOfflineOperations: number;
}

export interface OfflineOperation<T> {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: string;
  documentId?: string;
  data?: T;
  timestamp: Date;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  error?: string;
}

// Connection pooling types
export interface ConnectionPoolConfig {
  enabled: boolean;
  maxConnections: number;
  minConnections: number;
  connectionTimeout: number;
  idleTimeout: number;
  maxLifetime: number;
}

// Search and indexing types
export interface SearchOptions {
  query: string;
  fields: string[];
  fuzzy?: boolean;
  caseSensitive?: boolean;
  limit?: number;
  highlight?: boolean;
}

export interface IndexConfig {
  field: string;
  type: 'asc' | 'desc' | 'array-contains' | 'array-contains-any';
  sparse?: boolean;
}

// Real-time listener types
export interface ListenerOptions {
  includeMetadataChanges?: boolean;
  source?: 'default' | 'server' | 'cache';
}

export interface ListenerCallback<T> {
  onNext: (data: T[], changes: DocumentChange<T>[]) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

export interface DocumentChange<T> {
  type: 'added' | 'modified' | 'removed';
  doc: T;
  oldIndex: number;
  newIndex: number;
}

// Migration types
export interface MigrationConfig {
  version: string;
  description: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
  validate?: () => Promise<boolean>;
}

// Analytics and metrics types
export interface ServiceMetrics {
  requestCount: number;
  averageLatency: number;
  errorRate: number;
  cacheHitRate: number;
  throughput: number;
  lastUpdated: Date;
}

export interface AnalyticsEvent {
  type: string;
  entityType: string;
  entityId: string;
  userId: string;
  timestamp: Date;
  duration?: number;
  metadata?: Record<string, any>;
}

// Export all types for easier imports
export type {
  ServiceResponse,
  ServiceMetadata,
  QueryOptions,
  WhereClause,
  QueryBuilder,
  BatchOperation,
  BatchResult,
  TransactionOperation,
  TransactionResult,
  SubscriptionOptions,
  SubscriptionCallback,
  SubscriptionMetadata,
  CacheConfig,
  RetryConfig,
  ValidationConfig,
  PerformanceConfig,
  ServiceConfig,
  AuditOptions,
  CompressionOptions,
  OfflineSyncConfig,
  OfflineOperation,
  ConnectionPoolConfig,
  SearchOptions,
  IndexConfig,
  ListenerOptions,
  ListenerCallback,
  DocumentChange,
  MigrationConfig,
  ServiceMetrics,
  AnalyticsEvent
};