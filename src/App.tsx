import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { OperatorDashboard } from './components/operator/OperatorDashboard';
import { SupervisorDashboard } from './components/supervisor/SupervisorDashboard';
import { AssignmentDashboard } from './features/work-assignment/components/assignment-dashboard';
import { BundleLifecycleManager } from './features/bundles/components/bundle-lifecycle-manager';
import { OperatorWorkDashboard } from './features/work-assignment/components/operator-work-dashboard';
import { ProductionDashboard } from './features/analytics/components/production-dashboard';
import { QualityManagementDashboard } from './features/quality/components/quality-management-dashboard';
import { EarningsDashboard } from './features/earnings/components/earnings-dashboard';
import { OperatorManagementDashboard } from './features/operators/components/operator-management-dashboard';

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
const Dashboard = ({ userRole = 'operator', onLogout }: { userRole?: string; onLogout: () => void }) => {
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
          case 'manager':
            return <SupervisorDashboard supervisorId={userId} />;
          default:
            return <OperatorDashboard operatorId={userId} />;
        }
      case 'work-assignment':
        return userRole === 'operator' ? 
          <OperatorWorkDashboard operatorId={userId} /> : 
          <AssignmentDashboard />;
      case 'bundles':
        return <BundleLifecycleManager />;
      case 'analytics':
        return <ProductionDashboard />;
      case 'quality':
        return <QualityManagementDashboard userRole={userRole} />;
      case 'earnings':
        return <EarningsDashboard userRole={userRole} operatorId={userRole === 'operator' ? userId : undefined} />;
      case 'operators':
        return <OperatorManagementDashboard userRole={userRole} />;
      default:
        return <OperatorDashboard operatorId={userId} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/logo.png" alt="TSA" className="h-8 w-auto" />
              <h1 className="ml-3 text-xl font-bold text-brand-600">TSA Production ERP</h1>
              <span className="ml-4 text-sm text-gray-600">
                Logged in as: <span className="font-medium text-brand-700 capitalize">{userRole}</span>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-4">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === 'dashboard' 
                      ? 'bg-brand-100 text-brand-700' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('work-assignment')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === 'work-assignment' 
                      ? 'bg-brand-100 text-brand-700' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Work Assignment
                </button>
                <button
                  onClick={() => setCurrentView('bundles')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === 'bundles' 
                      ? 'bg-brand-100 text-brand-700' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Bundle Management
                </button>
                <button
                  onClick={() => setCurrentView('analytics')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === 'analytics' 
                      ? 'bg-brand-100 text-brand-700' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Analytics
                </button>
                <button
                  onClick={() => setCurrentView('quality')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === 'quality' 
                      ? 'bg-brand-100 text-brand-700' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Quality
                </button>
                <button
                  onClick={() => setCurrentView('earnings')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === 'earnings' 
                      ? 'bg-brand-100 text-brand-700' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Earnings
                </button>
                {userRole !== 'operator' && (
                  <button
                    onClick={() => setCurrentView('operators')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentView === 'operators' 
                        ? 'bg-brand-100 text-brand-700' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Operators
                  </button>
                )}
              </nav>
              
              <button
                onClick={onLogout}
                className="px-3 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Navigation-based Views */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderMainContent()}
      </main>
    </div>
  );
};

// Dashboard View
const DashboardView = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="p-2 bg-primary-100 rounded-lg">
          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-900">Active Operators</h3>
          <p className="text-2xl font-bold text-primary-600">24</p>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="p-2 bg-success-100 rounded-lg">
          <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-900">Completed Today</h3>
          <p className="text-2xl font-bold text-success-600">1,247</p>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="p-2 bg-warning-100 rounded-lg">
          <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-900">In Progress</h3>
          <p className="text-2xl font-bold text-warning-600">89</p>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="p-2 bg-brand-100 rounded-lg">
          <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-900">Efficiency</h3>
          <p className="text-2xl font-bold text-brand-600">87%</p>
        </div>
      </div>
    </div>
  </div>
);

// Work Assignment View
const WorkAssignmentView = () => (
  <div className="bg-white rounded-lg shadow">
    <div className="px-6 py-4 border-b border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900">Work Assignment</h2>
    </div>
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Available Bundles</h3>
          <div className="space-y-3">
            {[
              { id: 'B001', article: 'T-Shirt', pieces: 100, priority: 'High' },
              { id: 'B002', article: 'Jeans', pieces: 50, priority: 'Medium' },
              { id: 'B003', article: 'Dress', pieces: 75, priority: 'Low' },
            ].map((bundle) => (
              <div key={bundle.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-900">{bundle.id} - {bundle.article}</h4>
                    <p className="text-sm text-gray-600">{bundle.pieces} pieces</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    bundle.priority === 'High' ? 'bg-primary-100 text-primary-800' :
                    bundle.priority === 'Medium' ? 'bg-warning-100 text-warning-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {bundle.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Active Operators</h3>
          <div className="space-y-3">
            {[
              { name: 'Ram Sharma', machine: 'Overlock', status: 'Working' },
              { name: 'Sita Patel', machine: 'Flatlock', status: 'Break' },
              { name: 'Hari Singh', machine: 'Single Needle', status: 'Working' },
            ].map((operator) => (
              <div key={operator.name} className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-900">{operator.name}</h4>
                    <p className="text-sm text-gray-600">{operator.machine}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    operator.status === 'Working' ? 'bg-success-100 text-success-800' : 'bg-warning-100 text-warning-800'
                  }`}>
                    {operator.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Operators View
const OperatorsView = () => (
  <div className="bg-white rounded-lg shadow">
    <div className="px-6 py-4 border-b border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900">Operator Management</h2>
    </div>
    <div className="p-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Machine</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Today's Pieces</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[
              { name: 'Ram Sharma', machine: 'Overlock', status: 'Working', pieces: 45, earnings: 'Rs. 675' },
              { name: 'Sita Patel', machine: 'Flatlock', status: 'Break', pieces: 32, earnings: 'Rs. 480' },
              { name: 'Hari Singh', machine: 'Single Needle', status: 'Working', pieces: 28, earnings: 'Rs. 420' },
              { name: 'Gita Thapa', machine: 'Overlock', status: 'Working', pieces: 52, earnings: 'Rs. 780' },
            ].map((operator) => (
              <tr key={operator.name}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{operator.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{operator.machine}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    operator.status === 'Working' ? 'bg-success-100 text-success-800' : 'bg-warning-100 text-warning-800'
                  }`}>
                    {operator.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{operator.pieces}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-success-600">{operator.earnings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string>('');

  const handleLogin = (username: string) => {
    // Determine user role based on username/email
    let role = 'operator';
    if (username === 'sup' || username === 'supervisor') role = 'supervisor';
    if (username === 'manager') role = 'manager';
    if (username === 'operator') role = 'operator';
    
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('');
  };

  return (
    <BrowserRouter>
      {!isAuthenticated ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <Dashboard userRole={userRole} onLogout={handleLogout} />
      )}
    </BrowserRouter>
  );
}

export default App;
