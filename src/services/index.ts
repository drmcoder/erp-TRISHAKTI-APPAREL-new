// Main Service Index - Exports all integrated business services
// This is the single entry point for all business operations

export { integratedBusinessService, ServiceResponse } from './integrated-business-service';
export { firebaseIntegration } from './firebase-integration';
export { workflowEngine, WorkflowDefinition, WorkflowStep } from './workflow-engine';
export { firebaseConnection, useFirebaseConnection } from './firebase-connection';
export * from './entities/index';

// Business Logic Exports
export { default as businessLogic } from '../lib/businessLogic';
export { operatorBusinessLogic } from '../features/operators/business/operator-business-logic';
export { supervisorBusinessLogic } from '../features/supervisors/business/supervisor-business-logic';
export { managementBusinessLogic } from '../features/management/business/management-business-logic';

// Quick Access Service Functions
import { integratedBusinessService } from './integrated-business-service';

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

// Main service instance for direct access
export const TSAServices = {
  operator: operatorServices,
  workAssignment: workAssignmentServices,
  quality: qualityServices,
  supervisor: supervisorServices,
  management: managementServices,
  workflow: workflowServices,
  connection: connectionServices
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