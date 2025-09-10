import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { WorkItem } from './features/work-assignment/types';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import { appInitializationService } from './services/app-initialization-service';
import { errorReportingService } from './services/error-reporting-service';

// Initialize Firebase data in development
import './scripts/init-firebase-data';

// Core components (loaded immediately)
import { BarcodeScanner } from './components/barcode/barcode-scanner';
import { BundleLabelGenerator } from './components/barcode/bundle-label-generator';
import { ThreeStepWipEntry } from './components/wip/three-step-wip-entry';
import { AuthService } from './services/auth-service';
import { notify } from './utils/notification-utils';

// Lazy loaded components - split into logical chunks
const OperatorDashboard = lazy(() => 
  import('./components/operator/OperatorDashboard')
    .then(m => ({ default: m.OperatorDashboard }))
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'OperatorDashboard', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Operator Dashboard temporarily unavailable') };
    })
);
const SupervisorDashboard = lazy(() => 
  import('./components/supervisor/SupervisorDashboard')
    .then(m => ({ default: m.SupervisorDashboard }))
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'SupervisorDashboard', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Supervisor Dashboard temporarily unavailable') };
    })
);
const AssignmentDashboard = lazy(() => 
  import('./features/work-assignment/components/assignment-dashboard')
    .then(m => ({ default: m.AssignmentDashboard }))
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'AssignmentDashboard', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Assignment Dashboard temporarily unavailable') };
    })
);
const BundleLifecycleManager = lazy(() => 
  import('./features/bundles/components/bundle-lifecycle-manager')
    .then(m => ({ default: m.BundleLifecycleManager }))
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'BundleLifecycleManager', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Bundle Lifecycle Manager temporarily unavailable') };
    })
);
const ProductionDashboard = lazy(() => 
  import('./features/analytics/components/production-dashboard')
    .then(m => ({ default: m.ProductionDashboard }))
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'ProductionDashboard', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Production Dashboard temporarily unavailable') };
    })
);
const QualityManagementDashboard = lazy(() => 
  import('./features/quality/components/quality-management-dashboard')
    .then(m => ({ default: m.QualityManagementDashboard }))
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'QualityManagementDashboard', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Quality Management Dashboard temporarily unavailable') };
    })
);
const EarningsDashboard = lazy(() => 
  import('./features/earnings/components/earnings-dashboard')
    .then(m => ({ default: m.EarningsDashboard }))
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'EarningsDashboard', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Earnings Dashboard temporarily unavailable') };
    })
);
const OperatorManagementDashboard = lazy(() => 
  import('./features/operators/components/operator-management-dashboard')
    .then(m => ({ default: m.default || m.OperatorManagementDashboard }))
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'OperatorManagementDashboard', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Operator Management Dashboard temporarily unavailable') };
    })
);
const SelfAssignmentInterface = lazy(() => 
  import('./features/work-assignment/components/self-assignment-interface')
    .then(m => ({ default: m.SelfAssignmentInterface }))
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'SelfAssignmentInterface', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Self Assignment Interface temporarily unavailable') };
    })
);
const ProductionTimer = lazy(() => 
  import('./features/work-assignment/components/production-timer')
    .then(m => ({ default: m.ProductionTimer }))
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'ProductionTimer', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Production Timer temporarily unavailable') };
    })
);
const ProductionTimerWrapper = lazy(() => 
  import('./components/production-timer-wrapper')
    .then(m => ({ default: m.ProductionTimerWrapper }))
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'ProductionTimerWrapper', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Production Timer temporarily unavailable') };
    })
);
// Removed ArticleTemplateManager - functionality integrated into WIP entry
const WorkflowSequencer = lazy(() => 
  import('./features/workflow/components/workflow-sequencer')
    .then(m => ({ default: m.WorkflowSequencer }))
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'WorkflowSequencer', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Workflow Sequencer temporarily unavailable') };
    })
);
const MobileFriendlyLayout = lazy(() => 
  import('./components/layout/mobile-friendly-layout')
    .then(m => ({ default: m.MobileFriendlyLayout }))
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'MobileFriendlyLayout', type: 'dynamic-import' },
        level: 'error'
      });
      throw err;
    })
);
const MobileTest = lazy(() => 
  import('./components/mobile/mobile-test')
    .then(m => ({ default: m.MobileTest }))
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'MobileTest', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Mobile Test temporarily unavailable') };
    })
);
// CompleteWIPEntryWorkflow disabled as per user request
const LiveProductionDashboard = lazy(() => 
  import('./components/dashboard/live-production-dashboard')
    .then(m => ({ default: m.LiveProductionDashboard }))
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'LiveProductionDashboard', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Live Production Dashboard temporarily unavailable') };
    })
);
const CuttingDropletManager = lazy(() => 
  import('./components/management/CuttingDropletManager')
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'CuttingDropletManager', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Cutting Droplet Manager temporarily unavailable') };
    })
);
const ProductionLotManager = lazy(() => 
  import('./components/management/ProductionLotManager')
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'ProductionLotManager', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Production Lot Manager temporarily unavailable') };
    })
);
const ProcessPricingManager = lazy(() => 
  import('./components/management/ProcessPricingManager')
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'ProcessPricingManager', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Process Pricing Manager temporarily unavailable') };
    })
);
const EnhancedOperatorDashboard = lazy(() => 
  import('./components/operator/EnhancedOperatorDashboard')
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'EnhancedOperatorDashboard', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Enhanced Operator Dashboard temporarily unavailable') };
    })
);
const OperatorPieceTracker = lazy(() => 
  import('./components/operator/OperatorPieceTracker')
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'OperatorPieceTracker', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Operator Piece Tracker temporarily unavailable') };
    })
);
const BundleAssignmentManager = lazy(() => 
  import('./components/supervisor/BundleAssignmentManager')
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'BundleAssignmentManager', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Bundle Assignment Manager temporarily unavailable') };
    })
);
const SewingTemplateManager = lazy(() => 
  import('./features/sewing-templates/components/sewing-template-manager')
    .then(m => ({ default: m.default || m.SewingTemplateManager }))
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'SewingTemplateManager', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Sewing Template Manager temporarily unavailable') };
    })
);
const BundleAssignmentDashboard = lazy(() => 
  import('./features/bundles/components/bundle-assignment-dashboard')
    .then(m => ({ default: m.BundleAssignmentDashboard }))
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'BundleAssignmentDashboard', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Bundle Assignment Dashboard temporarily unavailable') };
    })
);
const OperatorWorkDashboard = lazy(() => 
  import('./features/bundles/components/operator-work-dashboard')
    .then(m => ({ default: m.OperatorWorkDashboard }))
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'OperatorWorkDashboard', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Operator Work Dashboard temporarily unavailable') };
    })
);

// NEW COMPONENTS - Enhanced Work Assignment & Analytics
const OperatorSelfAssignment = lazy(() => 
  import('./features/bundles/components/operator-self-assignment')
    .then(m => ({ default: m.OperatorSelfAssignment }))
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'OperatorSelfAssignment', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Operator Self Assignment temporarily unavailable') };
    })
);
const SupervisorPartsDashboard = lazy(() => 
  import('./features/bundles/components/supervisor-parts-dashboard')
    .then(m => ({ default: m.SupervisorPartsDashboard }))
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'SupervisorPartsDashboard', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Supervisor Parts Dashboard temporarily unavailable') };
    })
);
const MultiStrategyAssignmentDashboard = lazy(() => 
  import('./features/work-assignment/components/multi-strategy-assignment-dashboard')
    .then(m => ({ default: m.MultiStrategyAssignmentDashboard }))
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'MultiStrategyAssignmentDashboard', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Multi Strategy Assignment Dashboard temporarily unavailable') };
    })
);
const BundleBatchTrackingDashboard = lazy(() => 
  import('./features/analytics/components/bundle-batch-tracking-dashboard')
    .then(m => ({ default: m.BundleBatchTrackingDashboard }))
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'BundleBatchTrackingDashboard', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Bundle Batch Tracking Dashboard temporarily unavailable') };
    })
);
const DragDropAssignmentDashboard = lazy(() => 
  import('./features/work-assignment/components/drag-drop-assignment-dashboard')
    .then(m => ({ default: m.DragDropAssignmentDashboard }))
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'DragDropAssignmentDashboard', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Drag Drop Assignment Dashboard temporarily unavailable') };
    })
);
const KanbanAssignmentBoard = lazy(() => 
  import('./features/work-assignment/components/kanban-assignment-board')
    .then(m => ({ default: m.KanbanAssignmentBoard }))
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'KanbanAssignmentBoard', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Kanban Assignment Board temporarily unavailable') };
    })
);
const SupervisorOperatorBuckets = lazy(() => 
  import('./features/work-assignment/components/supervisor-operator-buckets')
    .then(m => ({ default: m.default }))
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'SupervisorOperatorBuckets', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Supervisor Operator Buckets temporarily unavailable') };
    })
);
const SmartWorkAssignmentDashboard = lazy(() => 
  import('./features/work-assignment/components/smart-work-assignment-dashboard')
    .then(m => ({ default: m.SmartWorkAssignmentDashboard }))
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'SmartWorkAssignmentDashboard', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Smart Work Assignment Dashboard temporarily unavailable') };
    })
);
const OperatorProfileAssignment = lazy(() => 
  import('./features/operators/components/operator-profile-assignment')
    .then(m => ({ default: m.OperatorProfileAssignment }))
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'OperatorProfileAssignment', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Operator Profile Assignment temporarily unavailable') };
    })
);
const SimpleSequentialWorkflow = lazy(() => 
  import('./features/work-assignment/components/sequential-workflow-simple')
    .then(m => ({ default: m.SimpleSequentialWorkflow }))
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'SimpleSequentialWorkflow', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Sequential Workflow temporarily unavailable') };
    })
);
const WipEntryManager = lazy(() => 
  import('./components/wip/wip-entry-manager')
    .then(m => ({ default: m.WipEntryManager }))
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'WipEntryManager', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'WIP Entry Manager temporarily unavailable') };
    })
);

// ADMIN & SECURITY COMPONENTS - NEW FEATURES
const LoginAnalyticsDashboard = lazy(() => 
  import('./components/admin/LoginAnalyticsDashboard')
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'LoginAnalyticsDashboard', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Login Analytics Dashboard temporarily unavailable') };
    })
);
const TrustedDeviceManager = lazy(() => 
  import('./components/admin/TrustedDeviceManager')
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'TrustedDeviceManager', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Trusted Device Manager temporarily unavailable') };
    })
);
const WorkflowNotificationDemo = lazy(() => 
  import('./components/examples/WorkflowNotificationDemo')
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'WorkflowNotificationDemo', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Workflow Demo temporarily unavailable') };
    })
);
const AdminUserManagement = lazy(() => 
  import('./components/admin/AdminUserManagement')
    .catch(err => {
      errorReportingService.captureException(err, {
        tags: { component: 'AdminUserManagement', type: 'dynamic-import' },
        level: 'error'
      });
      return { default: () => React.createElement('div', {className: 'p-6 text-center'}, 'Admin User Management temporarily unavailable') };
    })
);

// Loading component
// Optimized Loading component with better UX
const LoadingSpinner = ({ text = "Loading..." }: { text?: string }) => (
  <div className="flex flex-col items-center justify-center h-64 space-y-4">
    <div className="relative">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
    </div>
    <div className="text-center">
      <p className="text-lg text-gray-700 animate-pulse">{text}</p>
      <div className="text-sm text-gray-500 mt-1">Please wait...</div>
    </div>
  </div>
);


// Template initialization disabled for demo

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Login Component
const LoginPage = ({ onLogin }: { onLogin: (username: string, role: string, user?: any) => void }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await AuthService.login({
        username: credentials.username,
        password: credentials.password
      });
      
      if (result.success && result.data) {
        onLogin(result.data.username, result.data.role, result.data);
      } else {
        notify.error(result.error || 'Login failed', 'Authentication Failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      notify.error('Login failed. Please try again.', 'Login Error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <img src="/logo.png" alt="TSA" className="h-16 w-auto" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            🏢 TSA Intelligence Hub
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            🚀 Advanced Smart Manufacturing Command Center
          </p>
          <p className="text-center text-xs text-gray-500">
            AI-Powered Analytics • Real-Time Intelligence • Predictive Operations
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="font-medium text-blue-800 mb-2">Login Credentials:</p>
              <div className="space-y-1 text-left">
                <p><span className="font-medium">Supervisor:</span> sup / sup</p>
                <p><span className="font-medium">Admin:</span> admin / admin</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Production Dashboard Component with Role-Based Routing
const Dashboard = ({ userRole = 'operator', userData, onLogout }: { userRole?: string; userData?: any; onLogout?: () => void }) => {
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Get real user ID from authenticated user data
  const getUserId = () => {
    // Use real user ID from authentication, fallback to username-based ID
    if (userData?.id) {
      return userData.id;
    }
    // Fallback: create ID from username for backward compatibility
    const storedUsername = localStorage.getItem('tsa_username');
    return storedUsername || 'unknown-user';
  };

  const renderMainContent = () => {
    const userId = getUserId();
    
    switch (currentView) {
      case 'dashboard':
        // Role-based dashboard
        switch (userRole) {
          case 'operator':
            return <OperatorDashboard operatorId={userId} />;
          case 'supervisor':
            return <SupervisorDashboard supervisorId={userId} />;
          case 'management': // Fixed: use 'management' instead of 'manager'
            return <SupervisorDashboard supervisorId={userId} />;
          case 'admin':
            return <SupervisorDashboard supervisorId={userId} />;
          default:
            return <OperatorDashboard operatorId={userId} />;
        }
      case 'work-assignment':
        return userRole === 'operator' ? 
          <OperatorWorkDashboard 
            operatorId={userId} 
            operatorName="Current Operator"
          /> : 
          <AssignmentDashboard />;
      case 'bundles':
        return <BundleLifecycleManager mode="view" />;
      case 'analytics':
        return <ProductionDashboard />;
      case 'quality':
        return <QualityManagementDashboard userRole={userRole} userData={userData} />;
      case 'earnings':
        return <EarningsDashboard userRole={userRole} operatorId={userRole === 'operator' ? userId : undefined} />;
      case 'operators':
        return <OperatorManagementDashboard userRole={userRole} />;
      case 'self-assignment':
        return <SelfAssignmentInterface 
          operatorId={userId}
          operatorName={userData?.name || 'Current User'}
          operatorSkills={{
            skillLevel: userData?.skillLevel || 'intermediate',
            machineTypes: userData?.machineTypes || ['sewing', 'overlock', 'cutting'],
            primaryMachine: userData?.primaryMachine || 'sewing',
            specializations: userData?.specializations || ['precision-work', 'quality-control']
          }}
          maxConcurrentWork={3}
        />;
      case 'timer':
        // ✅ FIXED: Dynamic work item retrieval instead of hardcoded data
        return <div className="p-8">
          <h2 className="text-2xl font-bold mb-4">Production Timer</h2>
          <ProductionTimerWrapper operatorId={userId} />
        </div>;
      
      // Complete 3-Step WIP Entry Workflow
      case 'complete-wip-entry':
        return (
          <ThreeStepWipEntry
            onComplete={async (data) => {
              console.log('WIP Entry completed:', data);
              
              try {
                // Import bundle generation service
                const { bundleService } = await import('./services/bundle-service');
                
                // Prepare bundle creation data
                const bundleCreationData = {
                  wipEntryId: `wip_${Date.now()}`,
                  batchNumber: data.bundleNumber,
                  articles: data.articles.map(article => ({
                    articleId: article.id,
                    articleNumber: article.articleNumber,
                    articleStyle: article.style,
                    templateId: article.selectedTemplateId,
                    sizes: article.sizes.map(size => ({
                      size: size.size,
                      quantity: size.quantity
                    }))
                  })),
                  fabricRolls: data.fabricRolls.map(roll => ({
                    rollId: roll.id,
                    rollNumber: roll.rollNumber,
                    color: roll.color,
                    weight: roll.weight,
                    layerCount: roll.layerCount
                  })),
                  bundlePrefix: 'BND',
                  createdBy: userData?.name || (userRole === 'operator' ? 'Operator' : 
                            userRole === 'supervisor' ? 'Supervisor' : 'Admin User')
                };
                
                // Generate production bundles
                const bundleResult = await bundleService.generateBundles(bundleCreationData);
                
                if (bundleResult.success && bundleResult.data) {
                  const bundles = bundleResult.data;
                  
                  // Calculate summary statistics
                  const totalPieces = data.articles.reduce((totalSum, article) => {
                    return totalSum + (article.sizes?.reduce((sum, size) => sum + size.quantity, 0) || 0);
                  }, 0);
                  
                  const totalValue = bundles.reduce((sum, bundle) => sum + bundle.totalValue, 0);
                  const totalOperations = bundles.reduce((sum, bundle) => sum + bundle.operations.length, 0);
                  
                  notify.success(
                    `🎯 Batch: ${data.bundleNumber}\n📦 Bundles: ${bundles.length} | Articles: ${data.articles.length}\n🧵 Pieces: ${totalPieces} | Operations: ${totalOperations}\n💰 Value: Rs. ${totalValue.toFixed(2)}\n\nReady for supervisor assignment!`,
                    'Production Bundles Created Successfully!'
                  );
                  
                } else {
                  notify.error(`Failed to generate bundles: ${bundleResult.error}`, 'Bundle Generation Failed');
                }
                
              } catch (error) {
                console.error('Bundle generation error:', error);
                notify.error('Failed to generate production bundles. Please try again.', 'Bundle Generation Error');
              }
              
              setCurrentView('dashboard');
            }}
            onCancel={() => setCurrentView('dashboard')}
          />
        );
      
      // Live Production Dashboard with TV Display Support
      case 'live-dashboard':
        return <LiveProductionDashboard
          displayMode="desktop"
          autoRefresh={true}
          refreshInterval={5000}
          showAlerts={true}
        />;
      
      // TV Display Mode (Optimized for large screens)
      case 'tv-dashboard':
        return <LiveProductionDashboard
          displayMode="tv"
          autoRefresh={true}
          refreshInterval={3000}
          showAlerts={true}
        />;
      
      // Barcode Scanner Interface
      case 'barcode-scanner':
        return <BarcodeScanner
          onScanSuccess={(result) => {
            console.log('📱 Barcode scan result:', result);
            if (result.success && result.data) {
              notify.success(`Bundle: ${result.data.bundleNumber}\nLot: ${result.data.lotNumber}`, 'Bundle Scanned Successfully!');
            } else {
              notify.error('Scan failed. Please try again.', 'Barcode Scan Failed');
            }
          }}
          onClose={() => setCurrentView('dashboard')}
          allowManualEntry={true}
          scanMode="both"
          title="Scan Bundle"
        />;
      
      // Bundle Label Generator
      case 'label-generator':
        return <BundleLabelGenerator
          onLabelGenerated={(label) => {
            console.log('🏷️ Label generated:', label);
          }}
        />;
      
      // Sewing Templates Management
      case 'sewing-templates':
        return <SewingTemplateManager />;
      
      case 'workflow':
        return <WorkflowSequencer 
          operations={[]}
          onExecutePlan={(plan) => console.log('Executing plan:', plan)}
          onUpdateOperationStatus={(operationId, status) => console.log('Operation status updated:', operationId, status)}
        />;
      
      // TSA Production System Views
      case 'cutting-droplet':
        return <CuttingDropletManager />;
      case 'production-lots':
        return <ProductionLotManager mode="create" />;
      case 'pricing-manager':
        return <ProcessPricingManager />;
      case 'enhanced-operator':
        return <EnhancedOperatorDashboard 
          operatorId={userId}
          operatorName={userData?.name || 'Current Operator'}
          machineTypes={['overlock', 'single_needle', 'flatlock']}
        />;
      case 'piece-tracker':
        return <OperatorPieceTracker 
          operatorId={userId}
          operatorName={userData?.name || 'Current Operator'}
        />;
      case 'bundle-assignment':
        return <BundleAssignmentManager />;
      
      // New Bundle Production System
      case 'bundle-assignments':
        return <BundleAssignmentDashboard userRole={userRole} />;
      case 'my-work':
        return <OperatorWorkDashboard operatorId={userId} operatorName={userData?.name || 'Current Operator'} />;
      
      // NEW ENHANCED FEATURES
      case 'self-assign':
        return <OperatorSelfAssignment 
          operatorId={userId}
          operatorName={userData?.name || 'Current Operator'}
          operatorMachineType="overlock" // This would come from user profile in production
        />;
      
      case 'parts-issues':
        return <SupervisorPartsDashboard />;
      
      case 'multi-assignment':
        return <MultiStrategyAssignmentDashboard />;
      
      case 'bundle-analytics':
        return <BundleBatchTrackingDashboard />;
      
      // DRAG & DROP ASSIGNMENT SYSTEMS
      case 'drag-drop-assignment':
        return <DragDropAssignmentDashboard userRole={userRole} />;
      
      case 'kanban-assignment':
        return <KanbanAssignmentBoard userRole={userRole} />;
      
      case 'operator-buckets':
        return <SupervisorOperatorBuckets userRole={userRole} />;
      
      case 'smart-assignment':
        return <SmartWorkAssignmentDashboard userRole={userRole} />;
      
      case 'operator-profile':
        return <OperatorProfileAssignment userRole={userRole} />;
      
      case 'sequential-workflow':
        return <SimpleSequentialWorkflow userRole={userRole} />;
      
      case 'wip-manager':
        return <WipEntryManager userRole={userRole} userData={userData} />;
      
      case 'mobile-test':
        return <MobileTest />;
      
      // ADMIN & SECURITY FEATURES
      case 'login-analytics':
        return <LoginAnalyticsDashboard />;
      
      case 'trusted-devices':
        return <TrustedDeviceManager />;
      
      case 'user-management':
        return <AdminUserManagement adminId={userId} />;
      
      case 'workflow-notifications':
        return <WorkflowNotificationDemo />;
      
      default:
        return <OperatorDashboard operatorId={userId} />;
    }
  };

  return (
    <ErrorBoundary
      onError={(error) => {
        console.error('Error in MobileFriendlyLayout:', error);
      }}
    >
      <MobileFriendlyLayout 
        currentUser={{
          name: userData?.name || 
                (userRole === 'operator' ? 'Operator' : 
                 userRole === 'supervisor' ? 'Supervisor' : 'Admin'),
          role: userRole as 'operator' | 'supervisor' | 'management' | 'admin'
        }}
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={onLogout}
      >
        <ErrorBoundary>
          {renderMainContent()}
        </ErrorBoundary>
      </MobileFriendlyLayout>
    </ErrorBoundary>
  );
};


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check localStorage for authentication state on app initialization
    return localStorage.getItem('tsa_auth_token') === 'authenticated';
  });
  const [userRole, setUserRole] = useState<string>(() => {
    // Restore user role from localStorage
    return localStorage.getItem('tsa_user_role') || '';
  });
  const [userData, setUserData] = useState(() => {
    // Restore user data from localStorage
    const storedUserData = localStorage.getItem('tsa_user_data');
    return storedUserData ? JSON.parse(storedUserData) : null;
  });

  // Initialize app with smart caching and data preloading
  useEffect(() => {
    const initializeApp = async () => {
      // Initialize TSA Intelligence Hub
      await appInitializationService.initialize();
      
      // Session validation logic
      const storedToken = localStorage.getItem('tsa_auth_token');
      const storedRole = localStorage.getItem('tsa_user_role');
      const storedUsername = localStorage.getItem('tsa_username');
      
      if (storedToken === 'authenticated' && storedRole && storedUsername) {
        try {
          // Enable Firebase session validation
          try {
            const { AuthService } = await import('./services/auth-service');
            const result = await AuthService.validateSession(storedUsername, storedRole);
            if (!result.success) {
              console.log('Session validation failed, logging out');
              handleLogout();
              return;
            }
            console.log('🛡️ Session validated successfully via Firebase');
          } catch (error) {
            console.error('Firebase session validation error:', error);
            console.log('🛡️ Firebase validation failed, using localStorage fallback');
          }
        } catch (error) {
          console.error('Session validation error:', error);
          // Temporarily don't logout on validation errors
          // handleLogout();
        }
      }
    };

    // Initialize app - only validate if user appears to be authenticated
    if (isAuthenticated && userRole) {
      initializeApp();
    } else {
      // Initialize app even when not authenticated for login optimization
      appInitializationService.initialize();
    }
  }, [isAuthenticated, userRole]);

  // Add keyboard shortcut for force reload (Ctrl+Shift+R or Cmd+Shift+R)
  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'R') {
        event.preventDefault();
        try {
          const { CacheManager } = await import('./utils/cache-manager');
          CacheManager.forceReload();
        } catch (error) {
          console.error('Failed to load cache manager:', error);
          // Fallback: Simple page reload
          window.location.reload();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogin = (username: string, role: string, user?: any) => {
    // Set role from Firebase authentication result
    setUserRole(role as 'operator' | 'supervisor' | 'management' | 'admin');
    setIsAuthenticated(true);
    
    // Store user data if provided
    if (user) {
      setUserData(user);
      localStorage.setItem('tsa_user_data', JSON.stringify(user));
    }
    
    // Persist authentication state to localStorage
    localStorage.setItem('tsa_auth_token', 'authenticated');
    localStorage.setItem('tsa_user_role', role);
    localStorage.setItem('tsa_username', username);
  };

  // Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('');
    setUserData(null);
    
    // Clear authentication state from localStorage
    localStorage.removeItem('tsa_auth_token');
    localStorage.removeItem('tsa_user_role');
    localStorage.removeItem('tsa_username');
    localStorage.removeItem('tsa_user_data');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {!isAuthenticated ? (
          <LoginPage onLogin={handleLogin} />
        ) : (
          <Suspense fallback={<LoadingSpinner text="Loading dashboard..." />}>
            <Dashboard userRole={userRole} userData={userData} onLogout={handleLogout} />
          </Suspense>
        )}
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
