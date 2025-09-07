// src/services/entities/bundle-service.ts
import { EnhancedBaseFirebaseService } from '../../infrastructure/firebase/base-service';
import { COLLECTIONS } from '../../config/firebase';
import type { Bundle } from '../../types/entities';
import type { ServiceResponse, QueryOptions, ServiceConfig } from '../../types/service-types';

export class BundleService extends EnhancedBaseFirebaseService<Bundle> {
  constructor(config?: Partial<ServiceConfig>) {
    super(COLLECTIONS.BUNDLES, config);
  }

  // Custom validation for bundles
  protected validate(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.bundleNumber || typeof data.bundleNumber !== 'string') {
      errors.push('Bundle number is required and must be a string');
    }

    if (!data.articleNumber || typeof data.articleNumber !== 'string') {
      errors.push('Article number is required and must be a string');
    }

    if (!data.customerPO || typeof data.customerPO !== 'string') {
      errors.push('Customer PO is required and must be a string');
    }

    if (!data.orderQuantity || typeof data.orderQuantity !== 'number' || data.orderQuantity <= 0) {
      errors.push('Order quantity must be a positive number');
    }

    if (!data.deliveryDate) {
      errors.push('Delivery date is required');
    }

    if (!data.sizes || !Array.isArray(data.sizes) || data.sizes.length === 0) {
      errors.push('Sizes must be provided as a non-empty array');
    }

    if (data.priority && !['low', 'normal', 'high', 'urgent'].includes(data.priority)) {
      errors.push('Priority must be low, normal, high, or urgent');
    }

    if (data.status && !['pending', 'in_progress', 'completed', 'on_hold', 'cancelled'].includes(data.status)) {
      errors.push('Invalid status value');
    }

    return { valid: errors.length === 0, errors };
  }

  // Get bundles by status
  async getByStatus(status: Bundle['status'], options?: QueryOptions): Promise<ServiceResponse<Bundle[]>> {
    return this.getWhere('status', '==', status, options);
  }

  // Get bundles by priority
  async getByPriority(priority: Bundle['priority'], options?: QueryOptions): Promise<ServiceResponse<Bundle[]>> {
    return this.getWhere('priority', '==', priority, options);
  }

  // Get bundles by customer PO
  async getByCustomerPO(customerPO: string, options?: QueryOptions): Promise<ServiceResponse<Bundle[]>> {
    return this.getWhere('customerPO', '==', customerPO, options);
  }

  // Get bundles by article number
  async getByArticleNumber(articleNumber: string, options?: QueryOptions): Promise<ServiceResponse<Bundle[]>> {
    return this.getWhere('articleNumber', '==', articleNumber, options);
  }

  // Get bundles by delivery date range
  async getByDeliveryDateRange(startDate: Date, endDate: Date, options?: QueryOptions): Promise<ServiceResponse<Bundle[]>> {
    return this.query({
      ...options,
      where: [
        { field: 'deliveryDate', operator: '>=', value: startDate },
        { field: 'deliveryDate', operator: '<=', value: endDate }
      ]
    });
  }

  // Get urgent bundles (high priority or near delivery date)
  async getUrgentBundles(options?: QueryOptions): Promise<ServiceResponse<Bundle[]>> {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    return this.query({
      ...options,
      where: [
        { field: 'priority', operator: 'in', value: ['high', 'urgent'] }
        // Note: You might need separate queries for date-based urgency due to Firestore limitations
      ]
    });
  }

  // Get overdue bundles
  async getOverdueBundles(options?: QueryOptions): Promise<ServiceResponse<Bundle[]>> {
    const now = new Date();
    return this.query({
      ...options,
      where: [
        { field: 'deliveryDate', operator: '<', value: now },
        { field: 'status', operator: '!=', value: 'completed' }
      ]
    });
  }

  // Update bundle progress
  async updateProgress(
    bundleId: string,
    completedPieces: number,
    userId?: string
  ): Promise<ServiceResponse<Bundle>> {
    const bundle = await this.getById(bundleId);
    if (!bundle.success || !bundle.data) {
      return bundle;
    }

    const totalPieces = bundle.data.totalPieces;
    const remainingPieces = Math.max(0, totalPieces - completedPieces);
    const progressPercentage = totalPieces > 0 ? (completedPieces / totalPieces) * 100 : 0;

    const updateData: Partial<Bundle> = {
      completedPieces,
      remainingPieces,
    };

    // Auto-update status based on progress
    if (completedPieces === 0 && bundle.data.status === 'pending') {
      // Keep as pending
    } else if (completedPieces > 0 && completedPieces < totalPieces) {
      updateData.status = 'in_progress';
    } else if (completedPieces >= totalPieces) {
      updateData.status = 'completed';
      updateData.actualCompletion = new Date();
    }

    return this.update(bundleId, updateData, userId);
  }

  // Set bundle priority
  async setPriority(
    bundleId: string,
    priority: Bundle['priority'],
    userId?: string
  ): Promise<ServiceResponse<Bundle>> {
    return this.update(bundleId, { priority }, userId);
  }

  // Hold bundle
  async holdBundle(bundleId: string, reason: string, userId?: string): Promise<ServiceResponse<Bundle>> {
    return this.update(bundleId, {
      status: 'on_hold',
      // You might want to add a reason field to the Bundle interface
    }, userId);
  }

  // Resume held bundle
  async resumeBundle(bundleId: string, userId?: string): Promise<ServiceResponse<Bundle>> {
    const bundle = await this.getById(bundleId);
    if (!bundle.success || !bundle.data) {
      return bundle;
    }

    // Determine appropriate status based on progress
    const status: Bundle['status'] = bundle.data.completedPieces > 0 ? 'in_progress' : 'pending';

    return this.update(bundleId, { status }, userId);
  }

  // Cancel bundle
  async cancelBundle(bundleId: string, reason: string, userId?: string): Promise<ServiceResponse<Bundle>> {
    return this.update(bundleId, {
      status: 'cancelled',
      // You might want to add cancellation reason to the Bundle interface
    }, userId);
  }

  // Get bundle completion statistics
  async getBundleStatistics(
    filters?: {
      status?: Bundle['status'];
      priority?: Bundle['priority'];
      articleNumber?: string;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ): Promise<ServiceResponse<{
    totalBundles: number;
    completedBundles: number;
    inProgressBundles: number;
    pendingBundles: number;
    onHoldBundles: number;
    overdueBundles: number;
    totalPieces: number;
    completedPieces: number;
    averageCompletionRate: number;
    averageDelayDays: number;
  }>> {
    try {
      const whereConditions: any[] = [];

      if (filters?.status) {
        whereConditions.push({ field: 'status', operator: '==', value: filters.status });
      }

      if (filters?.priority) {
        whereConditions.push({ field: 'priority', operator: '==', value: filters.priority });
      }

      if (filters?.articleNumber) {
        whereConditions.push({ field: 'articleNumber', operator: '==', value: filters.articleNumber });
      }

      if (filters?.dateFrom) {
        whereConditions.push({ field: 'createdAt', operator: '>=', value: filters.dateFrom });
      }

      if (filters?.dateTo) {
        whereConditions.push({ field: 'createdAt', operator: '<=', value: filters.dateTo });
      }

      const result = await this.query({
        where: whereConditions,
        limit: 10000,
      });

      if (!result.success || !result.data) {
        return {
          success: false,
          error: 'Failed to fetch bundles for statistics',
        };
      }

      const bundles = result.data;
      const now = new Date();

      const statistics = {
        totalBundles: bundles.length,
        completedBundles: bundles.filter(bundle => bundle.status === 'completed').length,
        inProgressBundles: bundles.filter(bundle => bundle.status === 'in_progress').length,
        pendingBundles: bundles.filter(bundle => bundle.status === 'pending').length,
        onHoldBundles: bundles.filter(bundle => bundle.status === 'on_hold').length,
        overdueBundles: bundles.filter(bundle => 
          new Date(bundle.deliveryDate) < now && bundle.status !== 'completed'
        ).length,
        totalPieces: bundles.reduce((sum, bundle) => sum + bundle.totalPieces, 0),
        completedPieces: bundles.reduce((sum, bundle) => sum + bundle.completedPieces, 0),
        averageCompletionRate: bundles.length > 0 
          ? bundles.reduce((sum, bundle) => {
              const rate = bundle.totalPieces > 0 ? (bundle.completedPieces / bundle.totalPieces) * 100 : 0;
              return sum + rate;
            }, 0) / bundles.length 
          : 0,
        averageDelayDays: 0, // Would need to calculate based on delivery dates
      };

      return {
        success: true,
        data: statistics,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate statistics',
      };
    }
  }

  // Get bundle production timeline
  async getBundleTimeline(bundleId: string): Promise<ServiceResponse<any[]>> {
    try {
      // In a real implementation, you would query related work items, assignments, etc.
      // This is a placeholder for the timeline data structure
      
      const timeline = [
        {
          timestamp: new Date(),
          event: 'Bundle Created',
          description: 'Bundle was created in the system',
          type: 'info'
        },
        // Add more timeline events based on related data
      ];

      return {
        success: true,
        data: timeline,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get timeline',
      };
    }
  }

  // Search bundles
  async searchBundles(searchTerm: string, options?: QueryOptions): Promise<ServiceResponse<Bundle[]>> {
    // Search in bundle number, article number, and customer PO
    const bundleNumberSearch = await this.query({
      ...options,
      where: [
        { field: 'bundleNumber', operator: '>=', value: searchTerm },
        { field: 'bundleNumber', operator: '<=', value: searchTerm + '\uf8ff' }
      ]
    });

    const articleNumberSearch = await this.query({
      ...options,
      where: [
        { field: 'articleNumber', operator: '>=', value: searchTerm },
        { field: 'articleNumber', operator: '<=', value: searchTerm + '\uf8ff' }
      ]
    });

    if (bundleNumberSearch.success && articleNumberSearch.success) {
      // Combine and deduplicate results
      const allResults = [...(bundleNumberSearch.data || []), ...(articleNumberSearch.data || [])];
      const uniqueResults = allResults.filter((bundle, index, self) => 
        self.findIndex(b => b.id === bundle.id) === index
      );

      return {
        success: true,
        data: uniqueResults,
        metadata: {
          totalCount: uniqueResults.length,
        }
      };
    }

    return bundleNumberSearch.success ? bundleNumberSearch : articleNumberSearch;
  }

  // Get bundle dashboard summary
  async getBundleDashboardSummary(): Promise<ServiceResponse<{
    totalBundles: number;
    activeBundles: number;
    completedToday: number;
    overdue: number;
    highPriority: number;
  }>> {
    try {
      const allBundles = await this.getAll({ limit: 10000 });
      if (!allBundles.success || !allBundles.data) {
        return {
          success: false,
          error: 'Failed to fetch bundles for summary',
        };
      }

      const bundles = allBundles.data;
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const summary = {
        totalBundles: bundles.length,
        activeBundles: bundles.filter(bundle => 
          ['pending', 'in_progress'].includes(bundle.status)
        ).length,
        completedToday: bundles.filter(bundle => 
          bundle.status === 'completed' && 
          bundle.actualCompletion && 
          new Date(bundle.actualCompletion) >= today
        ).length,
        overdue: bundles.filter(bundle => 
          new Date(bundle.deliveryDate) < now && 
          bundle.status !== 'completed'
        ).length,
        highPriority: bundles.filter(bundle => 
          ['high', 'urgent'].includes(bundle.priority)
        ).length,
      };

      return {
        success: true,
        data: summary,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get summary',
      };
    }
  }

  // Custom audit logging for bundles
  protected shouldAudit(): boolean {
    return true; // Always audit bundle changes
  }
}