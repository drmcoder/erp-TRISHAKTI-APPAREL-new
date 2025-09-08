// Damage Report Service with automatic bundle payment holds
import { BaseService } from './base-service';
import type { ServiceResponse, WhereClause } from './base-service';
import { OperatorWalletService } from './operator-wallet-service';
import { 
  doc, 
  writeBatch, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase';

// Damage status enum based on API_SPECIFICATIONS.md
const DAMAGE_STATUS = {
  REPORTED: 'reported',
  ACKNOWLEDGED: 'acknowledged', 
  REWORK_IN_PROGRESS: 'rework_in_progress',
  REWORK_COMPLETED: 'rework_completed',
  RETURNED_TO_OPERATOR: 'returned_to_operator',
  FINAL_COMPLETION: 'final_completion',
  PAYMENT_RELEASED: 'payment_released'
};

const URGENCY_RESPONSE_TIMES = {
  urgent: 1,    // 1 hour
  high: 4,      // 4 hours  
  normal: 8,    // 8 hours
  low: 24       // 24 hours
};

interface DamageReport {
  reportId?: string;
  bundleId: string;
  bundleNumber: string;
  operatorId: string;
  operatorName: string;
  supervisorId: string;
  damageType: string;
  pieceNumbers: number[];
  pieceCount: number;
  severity: 'minor' | 'major' | 'severe';
  urgency: 'low' | 'normal' | 'high' | 'urgent';
  status: string;
  reportedAt: Timestamp;
  description?: string;
  photoUrls?: string[];
  reworkDetails?: {
    supervisorNotes: string;
    partsReplaced: string[];
    timeSpentMinutes: number;
    qualityCheckPassed: boolean;
    costEstimate: number;
  };
  paymentImpact?: {
    operatorAtFault: boolean;
    paymentAdjustment: number;
    adjustmentReason: string;
    supervisorCompensation: number;
  };
}

interface NotificationData {
  recipientId: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  data?: any;
}

/**
 * DamageReportService - Handles damage reporting with automatic payment holds
 * Implements business logic from APP_LOGIC.md line 122-200
 */
export class DamageReportService extends BaseService {
  private walletService: OperatorWalletService;

  constructor() {
    super(COLLECTIONS.DAMAGE_REPORTS);
    this.walletService = new OperatorWalletService();
  }

  /**
   * Submit damage report with automatic bundle payment hold
   * Based on documentation line 126-152
   */
  async submitDamageReport(reportData: Partial<DamageReport>): Promise<ServiceResponse<DamageReport>> {
    try {
      // 1. Validate damage report
      const validation = this.validateDamageReport(reportData);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          code: 'VALIDATION_ERROR'
        };
      }

      // 2. CRITICAL: Hold entire bundle payment
      const batch = writeBatch(db);
      
      // Get bundle data for payment calculation
      const bundleService = new BaseService(COLLECTIONS.WORK_ITEMS);
      const bundleResult = await bundleService.getById<any>(reportData.bundleId!);
      if (!bundleResult.success || !bundleResult.data) {
        return { success: false, error: 'Bundle not found', code: 'BUNDLE_NOT_FOUND' };
      }

      const bundle = bundleResult.data;
      const totalBundleValue = bundle.pieces * bundle.rate;

      await this.walletService.holdBundlePayment(reportData.bundleId!, reportData.operatorId!, {
        reason: 'DAMAGE_REPORTED',
        heldAmount: totalBundleValue,
        heldPieces: reportData.pieceCount
      });

      // 3. Create damage report document
      const reportDocument: DamageReport = {
        ...reportData as DamageReport,
        reportId: `DR_${Date.now()}`,
        status: DAMAGE_STATUS.REPORTED,
        reportedAt: Timestamp.now(),
        paymentImpact: {
          operatorAtFault: this.determineOperatorFault(reportData.damageType!),
          paymentAdjustment: 0, // To be determined during resolution
          adjustmentReason: 'Pending investigation',
          supervisorCompensation: 0
        }
      };

      const reportRef = doc(db, COLLECTIONS.DAMAGE_REPORTS);
      batch.set(reportRef, reportDocument);

      // 4. Commit atomic transaction
      await batch.commit();

      // 5. Send notifications
      await Promise.all([
        this.notifySupervisor(reportDocument),
        this.notifyOperatorPaymentHeld(reportDocument, totalBundleValue)
      ]);

      return { 
        success: true, 
        data: { ...reportDocument, reportId: reportRef.id },
        message: 'Damage report submitted successfully. Bundle payment has been held pending resolution.'
      };
    } catch (error) {
      console.error('Error submitting damage report:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit damage report',
        code: 'DAMAGE_REPORT_FAILED'
      };
    }
  }

  /**
   * Get supervisor damage queue with filtering
   */
  async getSupervisorDamageQueue(
    supervisorId: string, 
    statusFilter?: string[]
  ): Promise<ServiceResponse<DamageReport[]>> {
    try {
      const whereClause: WhereClause = {
        field: 'supervisorId',
        operator: '==',
        value: supervisorId
      };

      const result = await this.getWhere<DamageReport>(whereClause, {
        orderByField: 'reportedAt',
        orderDirection: 'desc'
      });

      if (!result.success) return result;

      let reports = result.data || [];

      // Apply status filter if provided
      if (statusFilter && statusFilter.length > 0) {
        reports = reports.filter(report => statusFilter.includes(report.status));
      }

      // Check for overdue reports and auto-escalate
      reports.forEach(report => this.checkEscalation(report));

      return { success: true, data: reports };
    } catch (error) {
      console.error('Error getting supervisor queue:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get supervisor queue',
        code: 'SUPERVISOR_QUEUE_FAILED'
      };
    }
  }

  /**
   * Start rework process
   */
  async startRework(
    reportId: string, 
    supervisorData: { supervisorId: string; notes: string; estimatedTime: number }
  ): Promise<ServiceResponse> {
    try {
      const updateData = {
        status: DAMAGE_STATUS.REWORK_IN_PROGRESS,
        reworkStartedAt: serverTimestamp(),
        reworkDetails: {
          supervisorNotes: supervisorData.notes,
          estimatedTimeMinutes: supervisorData.estimatedTime,
          startedBy: supervisorData.supervisorId,
          partsReplaced: [],
          timeSpentMinutes: 0,
          qualityCheckPassed: false,
          costEstimate: 0
        }
      };

      const result = await this.update(reportId, updateData);
      
      if (result.success) {
        await this.createDamageNotification({
          recipientId: result.data?.operatorId,
          type: 'REWORK_STARTED',
          title: 'Rework Started',
          message: `Supervisor has started rework on your damaged pieces. Estimated time: ${supervisorData.estimatedTime} minutes`,
          priority: 'normal',
          data: { reportId, supervisorNotes: supervisorData.notes }
        });
      }

      return result;
    } catch (error) {
      console.error('Error starting rework:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start rework',
        code: 'REWORK_START_FAILED'
      };
    }
  }

  /**
   * Complete rework process
   */
  async completeRework(
    reportId: string, 
    completionData: {
      supervisorId: string;
      timeSpent: number;
      partsReplaced: string[];
      qualityScore: number;
      costEstimate: number;
      notes: string;
    }
  ): Promise<ServiceResponse> {
    try {
      const updateData = {
        status: DAMAGE_STATUS.REWORK_COMPLETED,
        reworkCompletedAt: serverTimestamp(),
        'reworkDetails.timeSpentMinutes': completionData.timeSpent,
        'reworkDetails.partsReplaced': completionData.partsReplaced,
        'reworkDetails.qualityCheckPassed': completionData.qualityScore >= 90,
        'reworkDetails.costEstimate': completionData.costEstimate,
        'reworkDetails.completionNotes': completionData.notes,
        'paymentImpact.supervisorCompensation': this.calculateSupervisorCompensation(completionData.timeSpent)
      };

      const result = await this.update(reportId, updateData);

      if (result.success) {
        await this.createDamageNotification({
          recipientId: result.data?.operatorId,
          type: 'REWORK_COMPLETED',
          title: 'Rework Completed',
          message: `Rework has been completed. Please collect your pieces and complete the remaining work.`,
          priority: 'high',
          data: { reportId, qualityScore: completionData.qualityScore }
        });
      }

      return result;
    } catch (error) {
      console.error('Error completing rework:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to complete rework',
        code: 'REWORK_COMPLETION_FAILED'
      };
    }
  }

  /**
   * Return pieces to operator after rework
   */
  async returnToOperator(
    reportId: string, 
    supervisorData: { supervisorId: string; returnNotes: string }
  ): Promise<ServiceResponse> {
    try {
      const updateData = {
        status: DAMAGE_STATUS.RETURNED_TO_OPERATOR,
        returnedAt: serverTimestamp(),
        returnedBy: supervisorData.supervisorId,
        returnNotes: supervisorData.returnNotes
      };

      const result = await this.update(reportId, updateData);

      if (result.success) {
        await this.createDamageNotification({
          recipientId: result.data?.operatorId,
          type: 'PIECES_RETURNED',
          title: 'Pieces Returned',
          message: `Your reworked pieces are ready for collection. Please complete the remaining work.`,
          priority: 'high',
          data: { reportId, returnNotes: supervisorData.returnNotes }
        });
      }

      return result;
    } catch (error) {
      console.error('Error returning to operator:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to return to operator',
        code: 'RETURN_FAILED'
      };
    }
  }

  /**
   * Mark final completion and release payment
   */
  async markFinalCompletion(
    reportId: string, 
    operatorId: string, 
    completionData?: { notes: string; qualityConfirmation: boolean }
  ): Promise<ServiceResponse> {
    try {
      // Get damage report
      const reportResult = await this.getById<DamageReport>(reportId);
      if (!reportResult.success || !reportResult.data) {
        return { success: false, error: 'Damage report not found', code: 'REPORT_NOT_FOUND' };
      }

      const report = reportResult.data;

      // Update damage report status
      const updateData = {
        status: DAMAGE_STATUS.FINAL_COMPLETION,
        finalCompletedAt: serverTimestamp(),
        completedBy: operatorId,
        completionData: completionData || {}
      };

      const result = await this.update(reportId, updateData);

      if (result.success) {
        // Release bundle payment
        await this.walletService.releaseBundlePayment(
          report.bundleId, 
          operatorId, 
          { 
            supervisorId: report.supervisorId, 
            notes: 'Damage resolved and work completed' 
          }
        );

        // Update status to payment released
        await this.update(reportId, {
          status: DAMAGE_STATUS.PAYMENT_RELEASED,
          paymentReleasedAt: serverTimestamp()
        });

        await this.createDamageNotification({
          recipientId: operatorId,
          type: 'PAYMENT_RELEASED',
          title: 'Payment Released',
          message: `Your bundle payment has been released. Earnings are now available for withdrawal.`,
          priority: 'high',
          data: { reportId, bundleId: report.bundleId }
        });
      }

      return result;
    } catch (error) {
      console.error('Error marking final completion:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark final completion',
        code: 'FINAL_COMPLETION_FAILED'
      };
    }
  }

  /**
   * Create damage notification
   */
  async createDamageNotification(notificationData: NotificationData): Promise<ServiceResponse> {
    try {
      const notificationService = new BaseService(COLLECTIONS.DAMAGE_NOTIFICATIONS);
      
      const notification = {
        ...notificationData,
        read: false,
        createdAt: Timestamp.now(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      };

      return await notificationService.create(notification);
    } catch (error) {
      console.error('Error creating notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create notification',
        code: 'NOTIFICATION_FAILED'
      };
    }
  }

  /**
   * Get rework requests for approval interface
   */
  async getReworkRequests(supervisorId: string): Promise<ServiceResponse<DamageReport[]>> {
    try {
      const whereClause: WhereClause = {
        field: 'supervisorId',
        operator: '==',
        value: supervisorId
      };

      const result = await this.getWhere<DamageReport>(whereClause, {
        orderByField: 'reportedAt',
        orderDirection: 'desc'
      });

      if (!result.success) return result;

      // Filter to get reports that need rework approval (reported status)
      const reworkRequests = result.data?.filter(report => 
        report.status === DAMAGE_STATUS.REPORTED
      ) || [];

      return { success: true, data: reworkRequests };
    } catch (error) {
      console.error('Error getting rework requests:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get rework requests',
        code: 'REWORK_REQUESTS_FAILED'
      };
    }
  }

  /**
   * Subscribe to supervisor queue
   */
  subscribeSupervisorQueue(supervisorId: string, callback: (reports: DamageReport[]) => void): () => void {
    const whereClause: WhereClause = {
      field: 'supervisorId',
      operator: '==',
      value: supervisorId
    };

    return this.subscribeToCollection<DamageReport>(
      callback,
      whereClause,
      { orderByField: 'reportedAt', orderDirection: 'desc' }
    );
  }

  /**
   * Private helper methods
   */
  private validateDamageReport(reportData: Partial<DamageReport>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!reportData.bundleId) errors.push('Bundle ID is required');
    if (!reportData.operatorId) errors.push('Operator ID is required');
    if (!reportData.supervisorId) errors.push('Supervisor ID is required');
    if (!reportData.damageType) errors.push('Damage type is required');
    if (!reportData.pieceCount || reportData.pieceCount <= 0) errors.push('Valid piece count is required');
    if (!reportData.severity) errors.push('Severity is required');
    if (!reportData.urgency) errors.push('Urgency is required');

    return { isValid: errors.length === 0, errors };
  }

  private determineOperatorFault(damageType: string): boolean {
    // Operator fault damage types
    const operatorFaultTypes = [
      'stitching_defect',
      'needle_damage', 
      'tension_issue',
      'alignment_error',
      'broken_stitch',
      'wrong_measurement',
      'missing_operation'
    ];

    return operatorFaultTypes.includes(damageType);
  }

  private calculateSupervisorCompensation(timeSpentMinutes: number): number {
    const hourlyRate = 150; // Rs 150 per hour
    const timeHours = timeSpentMinutes / 60;
    return Math.round(timeHours * hourlyRate);
  }

  private checkEscalation(damageReport: DamageReport): void {
    const hoursSinceReport = (Date.now() - damageReport.reportedAt.toMillis()) / (1000 * 60 * 60);
    const maxResponseTime = URGENCY_RESPONSE_TIMES[damageReport.urgency];
    
    if (hoursSinceReport > maxResponseTime) {
      // Auto-escalate to admin (implement escalation logic)
      this.escalateToAdmin(damageReport, `Overdue by ${hoursSinceReport - maxResponseTime} hours`);
    }
  }

  private async escalateToAdmin(damageReport: DamageReport, reason: string): Promise<void> {
    // Implementation for admin escalation
    console.log(`Escalating damage report ${damageReport.reportId} to admin: ${reason}`);
    
    // Create escalation notification
    await this.createDamageNotification({
      recipientId: 'admin', // Get admin user ID
      type: 'ESCALATED_DAMAGE',
      title: 'Damage Report Escalated',
      message: `Damage report ${damageReport.reportId} has been escalated due to delayed response: ${reason}`,
      priority: 'urgent',
      data: { reportId: damageReport.reportId, reason, originalReport: damageReport }
    });
  }

  private async notifySupervisor(report: DamageReport): Promise<void> {
    await this.createDamageNotification({
      recipientId: report.supervisorId,
      type: 'DAMAGE_REPORTED',
      title: 'New Damage Report',
      message: `${report.operatorName} reported ${report.severity} damage on bundle ${report.bundleNumber}`,
      priority: report.urgency,
      data: { reportId: report.reportId, bundleId: report.bundleId }
    });
  }

  private async notifyOperatorPaymentHeld(report: DamageReport, heldAmount: number): Promise<void> {
    await this.createDamageNotification({
      recipientId: report.operatorId,
      type: 'PAYMENT_HELD',
      title: 'Payment Held',
      message: `Your bundle payment of Rs ${heldAmount} has been held pending damage resolution`,
      priority: 'high',
      data: { reportId: report.reportId, heldAmount, bundleId: report.bundleId }
    });
  }
}

// Export singleton instance
export const damageReportService = new DamageReportService();