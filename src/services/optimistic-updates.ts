interface OptimisticUpdate<T = any> {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: string;
  documentId: string;
  data: T;
  originalData?: T;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'confirmed' | 'failed' | 'reverted';
}

interface OptimisticCallbacks<T = any> {
  onSuccess?: (update: OptimisticUpdate<T>) => void;
  onError?: (update: OptimisticUpdate<T>, error: Error) => void;
  onRevert?: (update: OptimisticUpdate<T>) => void;
}

class OptimisticUpdatesService {
  private pendingUpdates = new Map<string, OptimisticUpdate>();
  private confirmedUpdates = new Map<string, OptimisticUpdate>();
  private failedUpdates = new Map<string, OptimisticUpdate>();
  private callbacks = new Map<string, OptimisticCallbacks>();
  private retryTimeouts = new Map<string, NodeJS.Timeout>();

  /**
   * Apply an optimistic update
   */
  async applyOptimisticUpdate<T>(
    updateId: string,
    type: 'create' | 'update' | 'delete',
    collection: string,
    documentId: string,
    data: T,
    originalData: T | undefined,
    serverOperation: () => Promise<any>,
    callbacks?: OptimisticCallbacks<T>
  ): Promise<void> {
    const update: OptimisticUpdate<T> = {
      id: updateId,
      type,
      collection,
      documentId,
      data,
      originalData,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: 3,
      status: 'pending',
    };

    // Store the update
    this.pendingUpdates.set(updateId, update);
    
    if (callbacks) {
      this.callbacks.set(updateId, callbacks);
    }

    // Attempt the server operation
    try {
      const result = await serverOperation();
      this.confirmUpdate(updateId, result);
    } catch (error) {
      this.handleUpdateError(updateId, error as Error);
    }
  }

  /**
   * Confirm a successful update
   */
  private confirmUpdate<T>(updateId: string, result?: any): void {
    const update = this.pendingUpdates.get(updateId);
    if (!update) return;

    update.status = 'confirmed';
    
    // Move from pending to confirmed
    this.pendingUpdates.delete(updateId);
    this.confirmedUpdates.set(updateId, update);
    
    // Clear retry timeout if exists
    this.clearRetryTimeout(updateId);
    
    // Call success callback
    const callbacks = this.callbacks.get(updateId);
    callbacks?.onSuccess?.(update);
    
    // Clean up after a delay
    setTimeout(() => {
      this.confirmedUpdates.delete(updateId);
      this.callbacks.delete(updateId);
    }, 30000); // Keep confirmed updates for 30 seconds
    
    console.log(`Optimistic update confirmed: ${updateId}`);
  }

  /**
   * Handle update error and potentially retry
   */
  private handleUpdateError<T>(updateId: string, error: Error): void {
    const update = this.pendingUpdates.get(updateId);
    if (!update) return;

    update.retryCount++;
    
    if (update.retryCount <= update.maxRetries) {
      // Schedule retry with exponential backoff
      const delay = 1000 * Math.pow(2, update.retryCount - 1); // 1s, 2s, 4s
      
      const timeout = setTimeout(async () => {
        console.log(`Retrying optimistic update: ${updateId} (attempt ${update.retryCount})`);
        
        try {
          // You would need to reconstruct the server operation here
          // For now, we'll mark it as failed
          this.markUpdateAsFailed(updateId, error);
        } catch (retryError) {
          this.handleUpdateError(updateId, retryError as Error);
        }
      }, delay);
      
      this.retryTimeouts.set(updateId, timeout);
    } else {
      // Max retries reached, mark as failed
      this.markUpdateAsFailed(updateId, error);
    }
  }

  /**
   * Mark update as failed and revert if necessary
   */
  private markUpdateAsFailed<T>(updateId: string, error: Error): void {
    const update = this.pendingUpdates.get(updateId);
    if (!update) return;

    update.status = 'failed';
    
    // Move from pending to failed
    this.pendingUpdates.delete(updateId);
    this.failedUpdates.set(updateId, update);
    
    // Clear retry timeout
    this.clearRetryTimeout(updateId);
    
    // Call error callback
    const callbacks = this.callbacks.get(updateId);
    callbacks?.onError?.(update, error);
    
    // Auto-revert after a delay if no manual intervention
    setTimeout(() => {
      if (this.failedUpdates.has(updateId)) {
        this.revertUpdate(updateId);
      }
    }, 10000); // Auto-revert after 10 seconds
    
    console.error(`Optimistic update failed: ${updateId}`, error);
  }

  /**
   * Manually revert a failed update
   */
  revertUpdate(updateId: string): boolean {
    const update = this.failedUpdates.get(updateId) || this.pendingUpdates.get(updateId);
    if (!update) return false;

    update.status = 'reverted';
    
    // Remove from failed/pending
    this.failedUpdates.delete(updateId);
    this.pendingUpdates.delete(updateId);
    
    // Clear retry timeout
    this.clearRetryTimeout(updateId);
    
    // Call revert callback
    const callbacks = this.callbacks.get(updateId);
    callbacks?.onRevert?.(update);
    
    // Clean up
    setTimeout(() => {
      this.callbacks.delete(updateId);
    }, 1000);
    
    console.log(`Optimistic update reverted: ${updateId}`);
    return true;
  }

  /**
   * Get update status
   */
  getUpdateStatus(updateId: string): OptimisticUpdate | null {
    return (
      this.pendingUpdates.get(updateId) ||
      this.confirmedUpdates.get(updateId) ||
      this.failedUpdates.get(updateId) ||
      null
    );
  }

  /**
   * Get all pending updates
   */
  getPendingUpdates(): OptimisticUpdate[] {
    return Array.from(this.pendingUpdates.values());
  }

  /**
   * Get all failed updates
   */
  getFailedUpdates(): OptimisticUpdate[] {
    return Array.from(this.failedUpdates.values());
  }

  /**
   * Check if there are any pending updates
   */
  hasPendingUpdates(): boolean {
    return this.pendingUpdates.size > 0;
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      pending: this.pendingUpdates.size,
      confirmed: this.confirmedUpdates.size,
      failed: this.failedUpdates.size,
      totalRetries: Array.from(this.pendingUpdates.values()).reduce(
        (sum, update) => sum + update.retryCount, 0
      ),
    };
  }

  /**
   * Clear retry timeout
   */
  private clearRetryTimeout(updateId: string): void {
    const timeout = this.retryTimeouts.get(updateId);
    if (timeout) {
      clearTimeout(timeout);
      this.retryTimeouts.delete(updateId);
    }
  }

  /**
   * Cancel a pending update
   */
  cancelUpdate(updateId: string): boolean {
    const update = this.pendingUpdates.get(updateId);
    if (!update) return false;

    this.pendingUpdates.delete(updateId);
    this.clearRetryTimeout(updateId);
    this.callbacks.delete(updateId);
    
    console.log(`Optimistic update cancelled: ${updateId}`);
    return true;
  }

  /**
   * Retry a failed update manually
   */
  async retryFailedUpdate(updateId: string): Promise<boolean> {
    const update = this.failedUpdates.get(updateId);
    if (!update) return false;

    // Move back to pending
    this.failedUpdates.delete(updateId);
    update.status = 'pending';
    update.retryCount = 0;
    this.pendingUpdates.set(updateId, update);

    // You would need to reconstruct and execute the server operation here
    // For now, we'll just simulate
    console.log(`Manually retrying update: ${updateId}`);
    
    return true;
  }

  /**
   * Clear all failed updates
   */
  clearFailedUpdates(): void {
    this.failedUpdates.clear();
    console.log('All failed updates cleared');
  }

  /**
   * Clean up service
   */
  cleanup(): void {
    // Clear all timeouts
    for (const timeout of this.retryTimeouts.values()) {
      clearTimeout(timeout);
    }
    
    // Clear all data
    this.pendingUpdates.clear();
    this.confirmedUpdates.clear();
    this.failedUpdates.clear();
    this.callbacks.clear();
    this.retryTimeouts.clear();
    
    console.log('Optimistic updates service cleaned up');
  }

  /**
   * Subscribe to update status changes
   */
  subscribeToStatusChanges(
    updateId: string,
    callback: (status: OptimisticUpdate | null) => void
  ): () => void {
    // This would be implemented with an event emitter or observable pattern
    // For now, just return a cleanup function
    return () => {
      // Cleanup subscription
    };
  }

  /**
   * Generate unique update ID
   */
  generateUpdateId(prefix = 'opt'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const OptimisticUpdates = new OptimisticUpdatesService();
export type { OptimisticUpdate, OptimisticCallbacks };