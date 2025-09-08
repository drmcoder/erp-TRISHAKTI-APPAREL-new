import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OperatorDashboard } from './components/operator/OperatorDashboard';
import { SupervisorDashboard } from './components/supervisor/SupervisorDashboard';
import { AssignmentDashboard } from './features/work-assignment/components/assignment-dashboard';
import { BundleLifecycleManager } from './features/bundles/components/bundle-lifecycle-manager';
import { OperatorWorkDashboard } from './features/work-assignment/components/operator-work-dashboard';
import { ProductionDashboard } from './features/analytics/components/production-dashboard';
import { QualityManagementDashboard } from './features/quality/components/quality-management-dashboard';
import { EarningsDashboard } from './features/earnings/components/earnings-dashboard';
import { OperatorManagementDashboard } from './features/operators/components/operator-management-dashboard';
import { SelfAssignmentInterface } from './features/work-assignment/components/self-assignment-interface';
import { ProductionTimer } from './features/work-assignment/components/production-timer';
import type { WorkItem } from './features/work-assignment/types';
import { EnhancedWIPEntryForm } from './features/wip/components/enhanced-wip-entry-form';
// import { templateIntegrationService } from './services/template-integration-service'; // Disabled for demo
import { ArticleTemplateManager } from './features/templates/components/article-template-manager';
import { WorkflowSequencer } from './features/workflow/components/workflow-sequencer';
import { MobileFriendlyLayout } from './components/layout/mobile-friendly-layout';
import { MobileTest } from './components/mobile/mobile-test';
import { MultiRollWIPEntry } from './features/wip/components/multi-roll-wip-entry';

// Complete WIP Entry Workflow (New 3-step system)
import { CompleteWIPEntryWorkflow } from './components/wip/complete-wip-entry-workflow';
import { BarcodeScanner } from './components/barcode/barcode-scanner';
import { BundleLabelGenerator } from './components/barcode/bundle-label-generator';
import { LiveProductionDashboard } from './components/dashboard/live-production-dashboard';
// Responsive layout components available if needed
// import { ResponsiveLayout, MobileOnly, TabletOnly, DesktopOnly, TVOnly } from './components/responsive/responsive-layout';

// TSA Production System Components
import CuttingDropletManager from './components/management/CuttingDropletManager';
import ProductionLotManager from './components/management/ProductionLotManager';
import ProcessPricingManager from './components/management/ProcessPricingManager';
import EnhancedOperatorDashboard from './components/operator/EnhancedOperatorDashboard';
import OperatorPieceTracker from './components/operator/OperatorPieceTracker';
import BundleAssignmentManager from './components/supervisor/BundleAssignmentManager';

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
const LoginPage = ({ onLogin }: { onLogin: (username: string) => void }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login delay
    setTimeout(() => {
      setIsLoading(false);
      onLogin(credentials.username);
    }, 1000);
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
              <p className="font-medium text-blue-800 mb-2">Demo Credentials:</p>
              <div className="space-y-1 text-left">
                <p><span className="font-medium">Operator:</span> operator / password</p>
                <p><span className="font-medium">Supervisor:</span> sup / sup</p>
                <p><span className="font-medium">Manager:</span> manager / password</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Production Dashboard Component with Role-Based Routing
const Dashboard = ({ userRole = 'operator' }: { userRole?: string }) => {
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
            operatorSkills={{ skillLevel: "intermediate", efficiency: 0.8, qualityScore: 0.85 }}
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
      case 'wip-entry':
        return <EnhancedWIPEntryForm 
          mode="create"
          onSave={(wipEntry) => {
            console.log('Enhanced WIP Entry saved:', wipEntry);
            alert('WIP Entry saved successfully! (Demo Mode)');
          }}
          onCancel={() => setCurrentView('dashboard')}
          availableTemplates={[]} 
          teamMembers={[
            { id: 'user1', name: 'Maya Patel', role: 'operator' },
            { id: 'user2', name: 'John Smith', role: 'supervisor' }
          ]}
          onTemplateCreate={(template) => {
            console.log('Template created:', template);
            alert('Template would be created in production mode');
          }}
          onCollaborate={(note) => {
            console.log('Collaboration note:', note);
          }}
          realTimeUsers={[
            { id: 'user1', name: 'Maya Patel', color: '#3B82F6' }
          ]}
        />;
      case 'multi-roll-wip':
        return <MultiRollWIPEntry
          onSave={(wipEntry) => {
            console.log('Multi-Roll WIP Entry saved:', wipEntry);
            alert('WIP Entry saved successfully! (Demo Mode)');
          }}
          onCancel={() => setCurrentView('dashboard')}
        />;
      
      // Complete 3-Step WIP Entry Workflow (New Implementation)
      case 'complete-wip-entry':
        return <CompleteWIPEntryWorkflow
          onComplete={async (wipData) => {
            console.log('🎯 Complete WIP Entry saved:', wipData);
            console.log('📊 Articles:', wipData.parsedStyles.length);
            console.log('📦 Rolls:', wipData.rollInfo.rollCount);
            console.log('📏 Size Config:', wipData.sizeConfiguration);
            alert(`WIP Entry saved successfully!\n\nLot: ${wipData.lotNumber}\nBuyer: ${wipData.buyerName}\nArticles: ${wipData.parsedStyles.length}\nRolls: ${wipData.rollInfo.rollCount}`);
            setCurrentView('dashboard');
          }}
          onCancel={() => setCurrentView('dashboard')}
          currentLanguage="en"
        />;
      
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
      case 'templates':
        return <ArticleTemplateManager 
          onSave={(template) => console.log('Template saved:', template)}
          onCancel={() => setCurrentView('dashboard')}
        />;
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
      case 'mobile-test':
        return <MobileTest />;
      default:
        return <OperatorDashboard operatorId={userId} />;
    }
  };

  return (
    <MobileFriendlyLayout 
      currentUser={{
        name: userRole === 'operator' ? 'Maya Patel' : 
              userRole === 'supervisor' ? 'John Smith' : 'Admin User',
        role: userRole as 'operator' | 'supervisor' | 'management' | 'admin'
      }}
      currentView={currentView}
      onViewChange={setCurrentView}
    >
      {renderMainContent()}
    </MobileFriendlyLayout>
  );
};


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string>('');

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

  const handleLogin = (username: string) => {
    // Determine user role based on username/email - ensure consistent role types
    let role: 'operator' | 'supervisor' | 'management' | 'admin' = 'operator';
    if (username === 'sup' || username === 'supervisor') role = 'supervisor';
    if (username === 'manager') role = 'management'; // Fixed: use 'management' instead of 'manager'
    if (username === 'admin') role = 'admin';
    if (username === 'operator') role = 'operator';
    
    setUserRole(role);
    setIsAuthenticated(true);
  };

  // Logout handler is defined for future use
  // const handleLogout = () => {
  //   setIsAuthenticated(false);
  //   setUserRole('');
  // };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {!isAuthenticated ? (
          <LoginPage onLogin={handleLogin} />
        ) : (
          <Dashboard userRole={userRole} />
        )}
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
