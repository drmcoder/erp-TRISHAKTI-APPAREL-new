import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { WorkItem } from './features/work-assignment/types';
import { ErrorBoundary } from './shared/components/ErrorBoundary';

// Core components (loaded immediately)
import { BarcodeScanner } from './components/barcode/barcode-scanner';
import { BundleLabelGenerator } from './components/barcode/bundle-label-generator';
import { ThreeStepWipEntry } from './components/wip/three-step-wip-entry';
import { AuthService } from './services/auth-service';

// Lazy loaded components - split into logical chunks
const OperatorDashboard = lazy(() => import('./components/operator/OperatorDashboard').then(m => ({ default: m.OperatorDashboard })));
const SupervisorDashboard = lazy(() => import('./components/supervisor/SupervisorDashboard').then(m => ({ default: m.SupervisorDashboard })));
const AssignmentDashboard = lazy(() => import('./features/work-assignment/components/assignment-dashboard').then(m => ({ default: m.AssignmentDashboard })));
const BundleLifecycleManager = lazy(() => import('./features/bundles/components/bundle-lifecycle-manager').then(m => ({ default: m.BundleLifecycleManager })));
const ProductionDashboard = lazy(() => import('./features/analytics/components/production-dashboard').then(m => ({ default: m.ProductionDashboard })));
const QualityManagementDashboard = lazy(() => import('./features/quality/components/quality-management-dashboard').then(m => ({ default: m.QualityManagementDashboard })));
const EarningsDashboard = lazy(() => import('./features/earnings/components/earnings-dashboard').then(m => ({ default: m.EarningsDashboard })));
const OperatorManagementDashboard = lazy(() => import('./features/operators/components/operator-management-dashboard').then(m => ({ default: m.OperatorManagementDashboard })));
const SelfAssignmentInterface = lazy(() => import('./features/work-assignment/components/self-assignment-interface').then(m => ({ default: m.SelfAssignmentInterface })));
const ProductionTimer = lazy(() => import('./features/work-assignment/components/production-timer').then(m => ({ default: m.ProductionTimer })));
// Removed ArticleTemplateManager - functionality integrated into WIP entry
const WorkflowSequencer = lazy(() => import('./features/workflow/components/workflow-sequencer').then(m => ({ default: m.WorkflowSequencer })));
const MobileFriendlyLayout = lazy(() => import('./components/layout/mobile-friendly-layout.tsx').then(m => ({ default: m.MobileFriendlyLayout })));
const MobileTest = lazy(() => import('./components/mobile/mobile-test').then(m => ({ default: m.MobileTest })));
// CompleteWIPEntryWorkflow disabled as per user request
const LiveProductionDashboard = lazy(() => import('./components/dashboard/live-production-dashboard').then(m => ({ default: m.LiveProductionDashboard })));
const CuttingDropletManager = lazy(() => import('./components/management/CuttingDropletManager'));
const ProductionLotManager = lazy(() => import('./components/management/ProductionLotManager'));
const ProcessPricingManager = lazy(() => import('./components/management/ProcessPricingManager'));
const EnhancedOperatorDashboard = lazy(() => import('./components/operator/EnhancedOperatorDashboard'));
const OperatorPieceTracker = lazy(() => import('./components/operator/OperatorPieceTracker'));
const BundleAssignmentManager = lazy(() => import('./components/supervisor/BundleAssignmentManager'));
const SewingTemplateManager = lazy(() => import('./features/sewing-templates/components/sewing-template-manager').then(m => ({ default: m.SewingTemplateManager })));
const BundleAssignmentDashboard = lazy(() => import('./features/bundles/components/bundle-assignment-dashboard').then(m => ({ default: m.BundleAssignmentDashboard })));
const OperatorWorkDashboard = lazy(() => import('./features/bundles/components/operator-work-dashboard').then(m => ({ default: m.OperatorWorkDashboard })));

// NEW COMPONENTS - Enhanced Work Assignment & Analytics
const OperatorSelfAssignment = lazy(() => import('./features/bundles/components/operator-self-assignment').then(m => ({ default: m.OperatorSelfAssignment })));
const SupervisorPartsDashboard = lazy(() => import('./features/bundles/components/supervisor-parts-dashboard').then(m => ({ default: m.SupervisorPartsDashboard })));
const MultiStrategyAssignmentDashboard = lazy(() => import('./features/work-assignment/components/multi-strategy-assignment-dashboard').then(m => ({ default: m.MultiStrategyAssignmentDashboard })));
const BundleBatchTrackingDashboard = lazy(() => import('./features/analytics/components/bundle-batch-tracking-dashboard').then(m => ({ default: m.BundleBatchTrackingDashboard })));
const DragDropAssignmentDashboard = lazy(() => import('./features/work-assignment/components/drag-drop-assignment-dashboard').then(m => ({ default: m.DragDropAssignmentDashboard })));
// KanbanMappingAssignment temporarily removed due to syntax issues
const SupervisorOperatorBuckets = lazy(() => import('./features/work-assignment/components/supervisor-operator-buckets').then(m => ({ default: m.SupervisorOperatorBuckets })));
const SmartWorkAssignmentDashboard = lazy(() => import('./features/work-assignment/components/smart-work-assignment-dashboard').then(m => ({ default: m.SmartWorkAssignmentDashboard })));
const OperatorProfileAssignment = lazy(() => import('./features/operators/components/operator-profile-assignment').then(m => ({ default: m.OperatorProfileAssignment })));
const SequentialWorkflowAssignment = lazy(() => import('./features/work-assignment/components/sequential-workflow-assignment').then(m => ({ default: m.SequentialWorkflowAssignment })));

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
const LoginPage = ({ onLogin }: { onLogin: (username: string, role: string) => void }) => {
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
        onLogin(result.data.username, result.data.role);
      } else {
        alert(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
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
            TSA Production ERP
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Advanced Manufacturing Management System
          </p>
          <p className="text-center text-xs text-gray-500">
            Real-time Operations • AI-Powered Analytics • Smart Workflows
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
const Dashboard = ({ userRole = 'operator', onLogout }: { userRole?: string; onLogout?: () => void }) => {
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Sample IDs for demo - in production these would come from authentication
  const getSampleId = (role: string) => {
    switch (role) {
      case 'operator': return 'op-maya-001';
      case 'supervisor': return 'sup-john-001';
      case 'manager': return 'mgr-admin-001';
      default: return 'op-maya-001';
    }
  };

  const renderMainContent = () => {
    const userId = getSampleId(userRole);
    
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
        return <QualityManagementDashboard userRole={userRole} />;
      case 'earnings':
        return <EarningsDashboard userRole={userRole} operatorId={userRole === 'operator' ? userId : undefined} />;
      case 'operators':
        return <OperatorManagementDashboard userRole={userRole} />;
      case 'self-assignment':
        return <SelfAssignmentInterface 
          operatorId={userId}
          operatorName={userRole === 'operator' ? 'Maya Patel' : 'Current User'}
          operatorSkills={{
            skillLevel: 'intermediate',
            machineTypes: ['sewing', 'overlock', 'cutting'],
            primaryMachine: 'sewing',
            specializations: ['precision-work', 'quality-control']
          }}
          maxConcurrentWork={3}
        />;
      case 'timer':
        return <div className="p-8">
          <h2 className="text-2xl font-bold mb-4">Production Timer</h2>
          <ProductionTimer 
            workItemId="sample-work-item-001"
            operatorId={userId}
            workItem={{
              id: "sample-work-item-001",
              bundleId: "bundle-001",
              workItemNumber: "WI-001",
              machineType: "sewing",
              operation: "Sample Production Task",
              operationCode: "OP-001",
              skillLevelRequired: "intermediate",
              targetPieces: 50,
              completedPieces: 0,
              rejectedPieces: 0,
              reworkPieces: 0,
              assignedOperatorId: userId,
              assignmentMethod: "supervisor_assigned",
              estimatedDuration: 120, // 2 hours in minutes
              status: "assigned"
            } as WorkItem}
          />
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
                  createdBy: userRole === 'operator' ? 'Maya Patel' : 
                            userRole === 'supervisor' ? 'John Smith' : 'Admin User'
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
                  
                  alert(`✅ Production Bundles Created Successfully!
                  
🎯 Batch: ${data.bundleNumber}
📦 Bundles Generated: ${bundles.length}
📋 Articles: ${data.articles.length} 
🧵 Total Pieces: ${totalPieces}
⚡ Total Operations: ${totalOperations}
💰 Total Value: Rs. ${totalValue.toFixed(2)}

Ready for supervisor assignment!`);
                  
                } else {
                  alert(`❌ Failed to generate bundles: ${bundleResult.error}`);
                }
                
              } catch (error) {
                console.error('Bundle generation error:', error);
                alert('❌ Failed to generate production bundles. Please try again.');
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
              alert(`Bundle Scanned!\nBundle: ${result.data.bundleNumber}\nLot: ${result.data.lotNumber}`);
            } else {
              alert('Scan failed. Please try again.');
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
          operatorName={userRole === 'operator' ? 'Maya Patel' : 'Current Operator'}
          machineTypes={['overlock', 'single_needle', 'flatlock']}
        />;
      case 'piece-tracker':
        return <OperatorPieceTracker 
          operatorId={userId}
          operatorName={userRole === 'operator' ? 'Maya Patel' : 'Current Operator'}
        />;
      case 'bundle-assignment':
        return <BundleAssignmentManager />;
      
      // New Bundle Production System
      case 'bundle-assignments':
        return <BundleAssignmentDashboard userRole={userRole} />;
      case 'my-work':
        return <OperatorWorkDashboard operatorId={userId} operatorName={userRole === 'operator' ? 'Maya Patel' : 'Current Operator'} />;
      
      // NEW ENHANCED FEATURES
      case 'self-assign':
        return <OperatorSelfAssignment 
          operatorId={userId}
          operatorName={userRole === 'operator' ? 'Maya Patel' : 'Current Operator'}
          operatorMachineType="overlock" // This would come from user profile in production
        />;
      
      case 'parts-issues':
        return <SupervisorPartsDashboard userRole={userRole} />;
      
      case 'multi-assignment':
        return <MultiStrategyAssignmentDashboard userRole={userRole} />;
      
      case 'bundle-analytics':
        return <BundleBatchTrackingDashboard userRole={userRole} />;
      
      // DRAG & DROP ASSIGNMENT SYSTEMS
      case 'drag-drop-assignment':
        return <DragDropAssignmentDashboard userRole={userRole} />;
      
      case 'kanban-assignment':
        return <DragDropAssignmentDashboard userRole={userRole} />; // Temporarily use drag-drop instead of kanban
      
      case 'operator-buckets':
        return <SupervisorOperatorBuckets userRole={userRole} />;
      
      case 'smart-assignment':
        return <SmartWorkAssignmentDashboard userRole={userRole} />;
      
      case 'operator-profile':
        return <OperatorProfileAssignment userRole={userRole} />;
      
      case 'sequential-workflow':
        return <SequentialWorkflowAssignment userRole={userRole} />;
      
      case 'mobile-test':
        return <MobileTest />;
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
          name: userRole === 'operator' ? 'Maya Patel' : 
                userRole === 'supervisor' ? 'John Smith' : 'Admin User',
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

  // Validate session on app initialization - temporarily disabled due to Firebase issues
  useEffect(() => {
    const validateSession = async () => {
      const storedToken = localStorage.getItem('tsa_auth_token');
      const storedRole = localStorage.getItem('tsa_user_role');
      const storedUsername = localStorage.getItem('tsa_username');
      
      if (storedToken === 'authenticated' && storedRole && storedUsername) {
        try {
          // TODO: Re-enable when Firebase connection is stable
          // const result = await AuthService.validateSession(storedUsername, storedRole);
          // if (!result.success) {
          //   console.log('Session validation failed, logging out');
          //   handleLogout();
          // }
          console.log('Session validation temporarily disabled - using localStorage only');
        } catch (error) {
          console.error('Session validation error:', error);
          // Temporarily don't logout on validation errors
          // handleLogout();
        }
      }
    };

    // Only validate if user appears to be authenticated
    if (isAuthenticated && userRole) {
      validateSession();
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

  const handleLogin = (username: string, role: string) => {
    // Set role from Firebase authentication result
    setUserRole(role as 'operator' | 'supervisor' | 'management' | 'admin');
    setIsAuthenticated(true);
    
    // Persist authentication state to localStorage
    localStorage.setItem('tsa_auth_token', 'authenticated');
    localStorage.setItem('tsa_user_role', role);
    localStorage.setItem('tsa_username', username);
  };

  // Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('');
    
    // Clear authentication state from localStorage
    localStorage.removeItem('tsa_auth_token');
    localStorage.removeItem('tsa_user_role');
    localStorage.removeItem('tsa_username');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {!isAuthenticated ? (
          <LoginPage onLogin={handleLogin} />
        ) : (
          <Suspense fallback={<LoadingSpinner text="Loading dashboard..." />}>
            <Dashboard userRole={userRole} onLogout={handleLogout} />
          </Suspense>
        )}
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
