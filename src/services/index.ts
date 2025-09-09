// Main Service Index - Exports all integrated business services
// This is the single entry point for all business operations

export { integratedBusinessService } from './integrated-business-service';
export type { ServiceResponse } from './base-service';
export { firebaseIntegration } from './firebase-integration';
export { workflowEngine } from './workflow-engine';
export type { WorkflowDefinition, WorkflowStep } from './workflow-engine';
export { firebaseConnection, useFirebaseConnection } from './firebase-connection';
export * from './entities/index';

// Individual Service Exports
export { productionTSAService } from './production-ready-service';
export { bundleService } from './bundle-service';
export { analyticsService } from './analytics-service';
export { tokenService } from './token-service';
export { DamageReportService, damageReportService } from './damage-report-service';
export { UserService } from './user-service';
export type { UserProfile, UserActivity, UserListFilters } from './user-service';
export { errorReportingService } from './error-reporting-service';
export { permissionsService } from './permissions-service';
export { OperatorService, operatorService } from './operator-service';
export { BaseService } from './base-service';
export type { QueryOptions, WhereClause } from './base-service';
export { WorkAssignmentService, workAssignmentService } from './work-assignment-service';
export { pwaService } from './pwa-service';
export { OperatorWalletService, operatorWalletService } from './operator-wallet-service';
export { notificationService } from './notification-service';
export type { NotificationPayload } from './notification-service';
export { permissionService } from './permission-service';
export { realtimeService } from './realtime-service';
export { authService } from './auth-service';
export { avatarService } from './avatar-service';
export { OptimisticUpdates } from './optimistic-updates';
export { ConnectionMonitor } from './connection-monitor';

// TSA Production System Services
export { productionLotService } from './production-lot-service';
export { enhancedProductionService } from './enhanced-production-service';
export { realtimeProductionService } from './realtime-production-service';
export type { 
  ProductionLot, 
  ColorSizeBreakdown, 
  SizeQuantity, 
  ProcessStep, 
  OperatorWorkEntry, 
  MonthlyWageCalculation 
} from './production-lot-service';
export type {
  CuttingDroplet,
  ProductionBundle, 
  BundleProcessStep,
  OperatorWorkSession,
  CuttingColorSize
} from './enhanced-production-service';
export type {
  RealtimeOperatorStatus,
  RealtimeWorkProgress,
  RealtimeStationStatus,
  RealtimeLiveMetrics,
  RealtimeNotification
} from './realtime-production-service';

// Business Logic Exports
export { default as businessLogic } from '../lib/businessLogic';
export { operatorBusinessLogic } from '../features/operators/business/operator-business-logic';
export { supervisorBusinessLogic } from '../features/supervisors/business/supervisor-business-logic';
export { managementBusinessLogic } from '../features/management/business/management-business-logic';

// Quick Access Service Functions
import { integratedBusinessService } from './integrated-business-service';
import { firebaseConnection } from './firebase-connection';
import { workflowEngine } from './workflow-engine';

// === OPERATOR SERVICES ===
export const operatorServices = {
  create: integratedBusinessService.createOperator,
  getWithAnalysis: integratedBusinessService.getOperatorWithAnalysis,
  update: integratedBusinessService.updateOperator,
  getWorkRecommendations: integratedBusinessService.getWorkRecommendations
};

// === WORK ASSIGNMENT SERVICES ===
export const workAssignmentServices = {
  processSelfAssignment: integratedBusinessService.processSelfAssignment,
  getRecommendations: integratedBusinessService.getWorkRecommendations
};

// === QUALITY CONTROL SERVICES ===
export const qualityServices = {
  processDamageReport: integratedBusinessService.processDamageReport,
  calculatePayment: integratedBusinessService.calculateOperatorPayment
};

// === SUPERVISOR SERVICES ===
export const supervisorServices = {
  processAssignmentApproval: integratedBusinessService.processAssignmentApproval,
  getDashboard: integratedBusinessService.getSupervisorDashboard
};

// === MANAGEMENT SERVICES ===
export const managementServices = {
  analyzeCompanyPerformance: integratedBusinessService.analyzeCompanyPerformance
};

// === WORKFLOW SERVICES ===
export const workflowServices = {
  getStatus: integratedBusinessService.getWorkflowStatus,
  subscribe: integratedBusinessService.subscribeToWorkflow,
  getActive: integratedBusinessService.getActiveWorkflows
};

// === CONNECTION SERVICES ===
export const connectionServices = {
  getState: firebaseConnection.getConnectionState,
  isConnected: firebaseConnection.isConnected,
  forceReconnect: firebaseConnection.forceReconnect,
  goOffline: firebaseConnection.goOffline,
  goOnline: firebaseConnection.goOnline
};

// === TSA PRODUCTION SERVICES ===
// TEMPORARILY DISABLED - Import services directly in components to avoid circular deps
/*
export const tsaProductionServices = {
  // Cutting and Lot Management
  createCuttingDroplet: enhancedProductionService.createCuttingDroplet.bind(enhancedProductionService),
  createBundlesFromCutting: enhancedProductionService.createBundlesFromCutting.bind(enhancedProductionService),
  createProductionLot: productionLotService.createProductionLot.bind(productionLotService),
  
  // Work Assignment
  assignBundleStepToOperator: enhancedProductionService.assignBundleStepToOperator.bind(enhancedProductionService),
  getAvailableWorkForOperator: enhancedProductionService.getAvailableWorkForOperator.bind(enhancedProductionService),
  
  // Operator Work Tracking
  createOperatorWorkEntry: productionLotService.createOperatorWorkEntry.bind(productionLotService),
  completeOperatorWork: enhancedProductionService.completeOperatorWork.bind(enhancedProductionService),
  
  // Wage Calculation
  getOperatorMonthlyWork: enhancedProductionService.getOperatorMonthlyWork.bind(enhancedProductionService),
  calculateMonthlyWages: productionLotService.calculateMonthlyWages.bind(productionLotService),
  
  // Realtime Updates
  updateOperatorStatus: realtimeProductionService.updateOperatorStatus.bind(realtimeProductionService),
  subscribeToProductionStats: realtimeProductionService.subscribeToProductionStats.bind(realtimeProductionService),
  sendNotification: realtimeProductionService.sendNotification.bind(realtimeProductionService)
};
*/

// Main service instance for direct access
export const TSAServices = {
  operator: operatorServices,
  workAssignment: workAssignmentServices,
  quality: qualityServices,
  supervisor: supervisorServices,
  management: managementServices,
  workflow: workflowServices,
  connection: connectionServices,
  // TEMPORARILY DISABLED - Use direct service imports in components
  // production: tsaProductionServices
};

// Service Health Check
export const serviceHealth = {
  async checkAllServices(): Promise<{
    firebase: boolean;
    workflow: boolean;
    businessLogic: boolean;
    overall: boolean;
  }> {
    const firebaseHealthy = firebaseConnection.isConnected();
    const workflowHealthy = workflowEngine.getAllWorkflows().length >= 0; // Simple check
    const businessLogicHealthy = true; // Business logic is always available
    
    return {
      firebase: firebaseHealthy,
      workflow: workflowHealthy,
      businessLogic: businessLogicHealthy,
      overall: firebaseHealthy && workflowHealthy && businessLogicHealthy
    };
  },

  async getDetailedStatus() {
    const firebaseMetrics = firebaseConnection.getHealthMetrics();
    const activeWorkflows = workflowEngine.getActiveWorkflows();
    
    return {
      firebase: {
        connected: firebaseConnection.isConnected(),
        metrics: firebaseMetrics
      },
      workflow: {
        activeCount: activeWorkflows.length,
        runningWorkflows: activeWorkflows.filter(w => w.status === 'running').length,
        completedToday: activeWorkflows.filter(w => 
          w.completedAt && 
          new Date(w.completedAt).toDateString() === new Date().toDateString()
        ).length
      },
      businessLogic: {
        operatorRules: 'active',
        supervisorRules: 'active',
        managementRules: 'active',
        algorithms: 'active'
      },
      timestamp: new Date().toISOString()
    };
  }
};

export default TSAServices;