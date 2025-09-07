// Operator Wallet Service with bundle payment hold logic
import { BaseService } from './base-service';
import type { ServiceResponse, WhereClause } from './base-service';
import { 
  doc, 
  writeBatch, 
  increment, 
  arrayUnion, 
  arrayRemove,
  serverTimestamp 
} from 'firebase/firestore';
import { db, COLLECTIONS } from '@/config/firebase';

interface WalletBalance {
  operatorId: string;
  availableAmount: number;
  heldAmount: number;
  totalEarned: number;
  heldBundles: string[];
  canWithdraw: boolean;
  lastUpdated: Date;
}

interface HoldData {
  reason: string;
  heldAmount: number;
  heldPieces?: number;
}

interface WithdrawalRequest {
  operatorId: string;
  requestedAmount: number;
}

/**
 * OperatorWalletService - Manages operator earnings with bundle payment holds
 * Implements business logic from APP_LOGIC.md line 156-175
 */
export class OperatorWalletService extends BaseService {
  constructor() {
    super(COLLECTIONS.OPERATOR_WALLETS);
  }

  /**
   * Get wallet balance with held amounts
   * Based on documentation line 241-261
   */
  async getWalletBalance(operatorId: string): Promise<ServiceResponse<WalletBalance>> {
    try {
      const whereClause: WhereClause = {
        field: 'operatorId',
        operator: '==',
        value: operatorId
      };

      const result = await this.getWhere<WalletBalance>(whereClause, { limitCount: 1 });
      
      if (!result.success || !result.data || result.data.length === 0) {
        // Create new wallet if doesn't exist
        const newWallet: WalletBalance = {
          operatorId,
          availableAmount: 0,
          heldAmount: 0,
          totalEarned: 0,
          heldBundles: [],
          canWithdraw: true,
          lastUpdated: new Date()
        };

        const createResult = await this.create(newWallet);
        return createResult.success ? 
          { success: true, data: newWallet } : 
          { success: false, error: 'Failed to create wallet' };
      }

      return { success: true, data: result.data[0] };
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get wallet balance',
        code: 'WALLET_FETCH_ERROR'
      };
    }
  }

  /**
   * Hold entire bundle payment when damage is reported
   * CRITICAL BUSINESS RULE: No partial payments
   * Based on documentation line 158-174
   */
  async holdBundlePayment(
    bundleId: string, 
    operatorId: string, 
    holdData: HoldData
  ): Promise<ServiceResponse> {
    try {
      const batch = writeBatch(db);

      // 1. Update work item - mark entire bundle as payment held
      const bundleRef = doc(db, COLLECTIONS.WORK_ITEMS, bundleId);
      batch.update(bundleRef, {
        paymentStatus: 'HELD_FOR_DAMAGE',
        heldAmount: holdData.heldAmount,     // Full bundle amount
        canWithdraw: false,                  // Operator cannot withdraw
        paymentHeldAt: serverTimestamp(),
        holdReason: holdData.reason
      });

      // 2. Update operator wallet - show held vs available amounts
      const walletResult = await this.getWalletBalance(operatorId);
      if (!walletResult.success || !walletResult.data) {
        return { success: false, error: 'Wallet not found', code: 'WALLET_NOT_FOUND' };
      }

      const walletRef = doc(db, COLLECTIONS.OPERATOR_WALLETS, walletResult.data.id!);
      batch.update(walletRef, {
        heldAmount: increment(holdData.heldAmount),
        heldBundles: arrayUnion(bundleId),
        lastUpdated: serverTimestamp()
      });

      await batch.commit();

      return {
        success: true,
        message: `Bundle ${bundleId} payment held: Rs ${holdData.heldAmount}`,
        data: { bundleId, heldAmount: holdData.heldAmount }
      };
    } catch (error) {
      console.error('Error holding bundle payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to hold payment',
        code: 'PAYMENT_HOLD_FAILED'
      };
    }
  }

  /**
   * Release bundle payment after damage resolution
   * Based on documentation line 227-233
   */
  async releaseBundlePayment(
    bundleId: string, 
    operatorId: string, 
    releaseData?: { supervisorId: string; notes: string }
  ): Promise<ServiceResponse> {
    try {
      // Get bundle data to know held amount
      const bundleResult = await this.getById<any>(bundleId);
      if (!bundleResult.success || !bundleResult.data) {
        return { success: false, error: 'Bundle not found', code: 'BUNDLE_NOT_FOUND' };
      }

      const heldAmount = bundleResult.data.heldAmount || 0;
      const batch = writeBatch(db);

      // 1. Update bundle status
      const bundleRef = doc(db, COLLECTIONS.WORK_ITEMS, bundleId);
      batch.update(bundleRef, {
        paymentStatus: 'RELEASED',
        heldAmount: 0,
        canWithdraw: true,
        paymentReleasedAt: serverTimestamp(),
        releaseData: releaseData || {}
      });

      // 2. Update operator wallet - transfer held to available
      const walletResult = await this.getWalletBalance(operatorId);
      if (!walletResult.success || !walletResult.data) {
        return { success: false, error: 'Wallet not found', code: 'WALLET_NOT_FOUND' };
      }

      const walletRef = doc(db, COLLECTIONS.OPERATOR_WALLETS, walletResult.data.id!);
      batch.update(walletRef, {
        availableAmount: increment(heldAmount),  // Add to available
        heldAmount: increment(-heldAmount),      // Remove from held
        heldBundles: arrayRemove(bundleId),     // Remove from held bundles
        lastUpdated: serverTimestamp()
      });

      await batch.commit();

      return {
        success: true,
        message: `Bundle ${bundleId} payment released: Rs ${heldAmount}`,
        data: { bundleId, releasedAmount: heldAmount }
      };
    } catch (error) {
      console.error('Error releasing bundle payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to release payment',
        code: 'PAYMENT_RELEASE_FAILED'
      };
    }
  }

  /**
   * Validate withdrawal request
   * Based on documentation line 252-261
   */
  async canWithdrawAmount(
    operatorId: string, 
    requestedAmount: number
  ): Promise<ServiceResponse<{
    canWithdraw: boolean;
    maxAvailable: number;
    heldAmount: number;
    reason?: string;
  }>> {
    try {
      const walletResult = await this.getWalletBalance(operatorId);
      if (!walletResult.success || !walletResult.data) {
        return { success: false, error: 'Wallet not found', code: 'WALLET_NOT_FOUND' };
      }

      const wallet = walletResult.data;
      const canWithdraw = requestedAmount <= wallet.availableAmount;

      return {
        success: true,
        data: {
          canWithdraw,
          maxAvailable: wallet.availableAmount,
          heldAmount: wallet.heldAmount,
          reason: canWithdraw ? undefined : 'Insufficient available balance (some payments held pending damage resolution)'
        }
      };
    } catch (error) {
      console.error('Error validating withdrawal:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Withdrawal validation failed',
        code: 'WITHDRAWAL_VALIDATION_FAILED'
      };
    }
  }

  /**
   * Get held bundles with details
   */
  async getHeldBundlesDetails(operatorId: string): Promise<ServiceResponse<any[]>> {
    try {
      const walletResult = await this.getWalletBalance(operatorId);
      if (!walletResult.success || !walletResult.data) {
        return { success: false, error: 'Wallet not found' };
      }

      const heldBundles = walletResult.data.heldBundles;
      if (heldBundles.length === 0) {
        return { success: true, data: [] };
      }

      // Get bundle details for each held bundle
      const bundleDetails = await Promise.all(
        heldBundles.map(async (bundleId) => {
          const bundleResult = await this.getById<any>(bundleId);
          return bundleResult.success ? bundleResult.data : null;
        })
      );

      return {
        success: true,
        data: bundleDetails.filter(bundle => bundle !== null)
      };
    } catch (error) {
      console.error('Error getting held bundles:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get held bundles',
        code: 'HELD_BUNDLES_FETCH_FAILED'
      };
    }
  }

  /**
   * Subscribe to wallet changes
   */
  subscribeToWallet(operatorId: string, callback: (wallet: WalletBalance | null) => void): () => void {
    const whereClause: WhereClause = {
      field: 'operatorId',
      operator: '==',
      value: operatorId
    };

    return this.subscribeToCollection<WalletBalance>(
      (wallets) => {
        callback(wallets.length > 0 ? wallets[0] : null);
      },
      whereClause,
      { limitCount: 1 }
    );
  }

  /**
   * Get earning summary for period
   */
  async getEarningSummary(
    operatorId: string, 
    dateRange?: { startDate: Date; endDate: Date }
  ): Promise<ServiceResponse<{
    totalEarned: number;
    availableAmount: number;
    heldAmount: number;
    completedBundles: number;
    averageQuality: number;
    efficiency: number;
  }>> {
    try {
      const walletResult = await this.getWalletBalance(operatorId);
      if (!walletResult.success || !walletResult.data) {
        return { success: false, error: 'Wallet not found' };
      }

      // Get work completions for the period
      const completionsService = new BaseService(COLLECTIONS.WORK_COMPLETIONS);
      const completionsResult = await completionsService.getWhere<any>({
        field: 'operatorId',
        operator: '==',
        value: operatorId
      });

      const completions = completionsResult.success ? completionsResult.data : [];
      
      // Filter by date range if provided
      const filteredCompletions = dateRange ? 
        completions?.filter(completion => {
          const completionDate = new Date(completion.completedAt);
          return completionDate >= dateRange.startDate && completionDate <= dateRange.endDate;
        }) : completions;

      // Calculate metrics
      const completedBundles = filteredCompletions?.length || 0;
      const averageQuality = completedBundles > 0 ? 
        (filteredCompletions?.reduce((sum: number, c: any) => sum + (c.qualityScore || 0), 0) / completedBundles) : 0;
      const efficiency = completedBundles > 0 ?
        (filteredCompletions?.reduce((sum: number, c: any) => sum + (c.efficiency || 0), 0) / completedBundles) : 0;

      return {
        success: true,
        data: {
          totalEarned: walletResult.data.totalEarned,
          availableAmount: walletResult.data.availableAmount,
          heldAmount: walletResult.data.heldAmount,
          completedBundles,
          averageQuality: Math.round(averageQuality * 100) / 100,
          efficiency: Math.round(efficiency * 100) / 100
        }
      };
    } catch (error) {
      console.error('Error getting earning summary:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get earning summary',
        code: 'EARNING_SUMMARY_FAILED'
      };
    }
  }
}

// Export singleton instance
export const operatorWalletService = new OperatorWalletService();