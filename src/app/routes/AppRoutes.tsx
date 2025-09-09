import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/shared/components/layout';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '@/features/auth/pages';

// Placeholder components - these will be implemented in later phases
const DashboardPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
    <p>Welcome to the TSA ERP Dashboard</p>
  </div>
);

// LoginPage is now imported from features/auth/pages

const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
      <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
      <p className="text-gray-600 mb-4">You don't have permission to access this resource.</p>
      <button 
        onClick={() => window.history.back()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Go Back
      </button>
    </div>
  </div>
);

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
      <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
      <a 
        href="/dashboard"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Go to Dashboard
      </a>
    </div>
  </div>
);

// Operator routes
const AssignedWorkPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Assigned Work</h1>
    <p>Operator work assignments will be displayed here</p>
  </div>
);

const WorkHistoryPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Work History</h1>
    <p>Work history for operators will be displayed here</p>
  </div>
);

const EarningsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Earnings</h1>
    <p>Operator earnings and wallet information</p>
  </div>
);

// Supervisor routes
const WorkAssignmentPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Work Assignment</h1>
    <p>Supervisor work assignment interface</p>
  </div>
);

const ProgressTrackingPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Progress Tracking</h1>
    <p>Production progress tracking</p>
  </div>
);

const QualityControlPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Quality Control</h1>
    <p>Quality control and damage reports</p>
  </div>
);

// Management routes
const OrdersPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Orders</h1>
    <p>Order management interface</p>
  </div>
);

const InventoryPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Inventory</h1>
    <p>Inventory management</p>
  </div>
);

const ReportsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Reports</h1>
    <p>Production and financial reports</p>
  </div>
);

// Admin routes
const UserManagementPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">User Management</h1>
    <p>System user management</p>
  </div>
);

const SystemSettingsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">System Settings</h1>
    <p>System configuration settings</p>
  </div>
);

const SchedulePage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Schedule</h1>
    <p>Production schedule and calendar</p>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected routes with main layout */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        {/* Default redirect */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Dashboard - accessible by all authenticated users */}
        <Route path="dashboard" element={<DashboardPage />} />
        
        {/* Schedule - accessible by all authenticated users */}
        <Route path="schedule" element={<SchedulePage />} />

        {/* Operator routes */}
        <Route path="work">
          <Route path="assigned" element={
            <ProtectedRoute 
              requiredRoles={['operator']}
              requiredPermissions={['work:view:own']}
              resource="work"
              action="view"
            >
              <AssignedWorkPage />
            </ProtectedRoute>
          } />
          <Route path="history" element={
            <ProtectedRoute 
              requiredRoles={['operator']}
              requiredPermissions={['work:view:own']}
              resource="work"
              action="view"
            >
              <WorkHistoryPage />
            </ProtectedRoute>
          } />
        </Route>
        
        <Route path="earnings" element={
          <ProtectedRoute 
            requiredRoles={['operator']}
            requiredPermissions={['wage:view']}
            resource="wage"
            action="view"
          >
            <EarningsPage />
          </ProtectedRoute>
        } />

        {/* Work Assignment routes - Consolidated */}
        <Route path="work-assignment">
          <Route path="drag-drop" element={
            <ProtectedRoute 
              requiredRoles={['supervisor', 'management', 'admin']}
              requiredPermissions={['work:assign']}
              resource="work"
              action="assign"
            >
              <WorkAssignmentPage />
            </ProtectedRoute>
          } />
          <Route path="kanban" element={
            <ProtectedRoute 
              requiredRoles={['supervisor', 'management', 'admin']}
              requiredPermissions={['work:assign']}
              resource="work"
              action="assign"
            >
              <WorkAssignmentPage />
            </ProtectedRoute>
          } />
          <Route path="bulk" element={
            <ProtectedRoute 
              requiredRoles={['supervisor', 'management', 'admin']}
              requiredPermissions={['work:assign']}
              resource="work"
              action="assign"
            >
              <WorkAssignmentPage />
            </ProtectedRoute>
          } />
          <Route path="self" element={
            <ProtectedRoute 
              requiredRoles={['supervisor', 'management', 'admin']}
              requiredPermissions={['work:assign']}
              resource="work"
              action="assign"
            >
              <WorkAssignmentPage />
            </ProtectedRoute>
          } />
          <Route path="history" element={
            <ProtectedRoute 
              requiredRoles={['supervisor', 'management', 'admin']}
              requiredPermissions={['work:view']}
              resource="work"
              action="view"
            >
              <WorkAssignmentPage />
            </ProtectedRoute>
          } />
          <Route path="analytics" element={
            <ProtectedRoute 
              requiredRoles={['supervisor', 'management', 'admin']}
              requiredPermissions={['analytics:view']}
              resource="analytics"
              action="view"
            >
              <WorkAssignmentPage />
            </ProtectedRoute>
          } />
        </Route>

        {/* Production routes */}
        <Route path="production">
          <Route path="progress" element={
            <ProtectedRoute 
              requiredRoles={['supervisor', 'management', 'admin']}
              requiredPermissions={['production:track']}
              resource="production"
              action="track"
            >
              <ProgressTrackingPage />
            </ProtectedRoute>
          } />
          <Route path="quality" element={
            <ProtectedRoute 
              requiredRoles={['supervisor', 'management', 'admin']}
              requiredPermissions={['quality:inspect']}
              resource="quality"
              action="inspect"
            >
              <QualityControlPage />
            </ProtectedRoute>
          } />
        </Route>

        {/* Management routes */}
        <Route path="orders/*" element={
          <ProtectedRoute 
            requiredRoles={['management', 'admin']}
            requiredPermissions={['order:view']}
            resource="order"
            action="view"
          >
            <OrdersPage />
          </ProtectedRoute>
        } />
        
        <Route path="inventory/*" element={
          <ProtectedRoute 
            requiredRoles={['management', 'admin']}
            requiredPermissions={['inventory:view']}
            resource="inventory"
            action="view"
          >
            <InventoryPage />
          </ProtectedRoute>
        } />
        
        <Route path="reports/*" element={
          <ProtectedRoute 
            requiredRoles={['management', 'admin']}
            requiredPermissions={['reports:view']}
            resource="reports"
            action="view"
          >
            <ReportsPage />
          </ProtectedRoute>
        } />

        {/* Admin routes */}
        <Route path="admin">
          <Route path="users" element={
            <ProtectedRoute 
              requiredRoles={['admin']}
              requiredPermissions={['user:manage:roles']}
              resource="user"
              action="manage"
            >
              <UserManagementPage />
            </ProtectedRoute>
          } />
          <Route path="settings" element={
            <ProtectedRoute 
              requiredRoles={['admin']}
              requiredPermissions={['system:settings']}
              resource="system"
              action="settings"
            >
              <SystemSettingsPage />
            </ProtectedRoute>
          } />
          <Route path="machines" element={
            <ProtectedRoute 
              requiredRoles={['admin']}
              requiredPermissions={['machine:config']}
              resource="machine"
              action="config"
            >
              <SystemSettingsPage />
            </ProtectedRoute>
          } />
        </Route>
      </Route>

      {/* 404 - catch all route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};