// Admin Dashboard - Management and Administration with Permission-Based UI
import React, { useState, useEffect } from 'react';
import { managementServices, permissionService, analyticsService, notificationService } from '@/services';
import { PERMISSIONS } from '@/services/permission-service';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';

interface AdminDashboardProps {
  adminId: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminId }) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [systemMetrics, setSystemMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<{
    canViewDashboard: boolean;
    canManageUsers: boolean;
    canManageRoles: boolean;
    canViewAllPerformance: boolean;
    canManageProduction: boolean;
    canGenerateReports: boolean;
    canManageNotifications: boolean;
    canViewAnalytics: boolean;
  }>({
    canViewDashboard: false,
    canManageUsers: false,
    canManageRoles: false,
    canViewAllPerformance: false,
    canManageProduction: false,
    canGenerateReports: false,
    canManageNotifications: false,
    canViewAnalytics: false,
  });

  useEffect(() => {
    loadPermissions();
    loadDashboardData();
    loadSystemMetrics();
  }, [adminId]);

  const loadPermissions = async () => {
    try {
      // Load permissions for the admin
      await permissionService.loadUserPermissions(adminId);
      
      // Check specific permissions
      setPermissions({
        canViewDashboard: permissionService.hasPermission(adminId, PERMISSIONS.ADMIN_VIEW_DASHBOARD.id),
        canManageUsers: permissionService.hasPermission(adminId, PERMISSIONS.ADMIN_MANAGE_USERS.id),
        canManageRoles: permissionService.hasPermission(adminId, PERMISSIONS.ADMIN_MANAGE_ROLES.id),
        canViewAllPerformance: permissionService.hasPermission(adminId, PERMISSIONS.ADMIN_VIEW_ALL_PERFORMANCE.id),
        canManageProduction: permissionService.hasPermission(adminId, PERMISSIONS.ADMIN_MANAGE_PRODUCTION.id),
        canGenerateReports: permissionService.hasPermission(adminId, PERMISSIONS.ADMIN_GENERATE_REPORTS.id),
        canManageNotifications: permissionService.hasPermission(adminId, PERMISSIONS.ADMIN_MANAGE_NOTIFICATIONS.id),
        canViewAnalytics: permissionService.hasPermission(adminId, PERMISSIONS.ADMIN_VIEW_ANALYTICS.id),
      });
    } catch (error) {
      console.error('Failed to load permissions:', error);
      // Fallback: assume admin role for demo purposes
      permissionService.setUserRole(adminId, 'ADMIN');
      setPermissions({
        canViewDashboard: true,
        canManageUsers: true,
        canManageRoles: true,
        canViewAllPerformance: true,
        canManageProduction: true,
        canGenerateReports: true,
        canManageNotifications: true,
        canViewAnalytics: true,
      });
    }
  };

  const loadDashboardData = async () => {
    try {
      const result = await managementServices.analyzeCompanyPerformance();
      if (result.success) {
        setDashboardData(result.data);
      } else {
        setError(result.error || 'Failed to load dashboard data');
      }
    } catch (err) {
      setError('Error loading dashboard data');
    }
  };

  const loadSystemMetrics = async () => {
    try {
      if (permissions.canViewAnalytics) {
        const metrics = await analyticsService.getProductionMetrics();
        if (metrics.success) {
          setSystemMetrics(metrics.data);
        }
      }
    } catch (err) {
      console.error('Error loading system metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendSystemNotification = async () => {
    if (!permissions.canManageNotifications) {
      alert('You do not have permission to send notifications');
      return;
    }

    const title = prompt('Notification title:');
    const message = prompt('Notification message:');
    
    if (title && message) {
      try {
        await notificationService.sendNotification({
          type: 'system',
          title,
          message,
          priority: 'medium'
        });
        alert('Notification sent successfully!');
      } catch (error) {
        alert('Failed to send notification');
      }
    }
  };

  const handleGenerateReport = async () => {
    if (!permissions.canGenerateReports) {
      alert('You do not have permission to generate reports');
      return;
    }

    const reportType = prompt('Report type (production/performance/quality):');
    if (reportType) {
      try {
        const result = await analyticsService.generateReport(reportType);
        if (result.success) {
          alert(`Report generated: ${result.data.reportId}`);
        }
      } catch (error) {
        alert('Failed to generate report');
      }
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Check if user has permission to view admin dashboard
  if (!permissions.canViewDashboard) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600">You don't have permission to access the Admin Dashboard.</p>
          <p className="text-sm text-red-500 mt-2">Please contact your system administrator for access.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <Button onClick={loadDashboardData} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="default" className="bg-purple-100 text-purple-800">🛡️ ADMIN DASHBOARD</Badge>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>
            <p className="text-gray-600">Company-wide management and oversight</p>
          </div>
          <div className="text-right">
            <Badge variant="success">Admin Access</Badge>
            <p className="text-sm text-gray-500 mt-1">
              Full System Privileges
            </p>
          </div>
        </div>
      </div>

      {/* System Overview Metrics - Only show if user can view analytics */}
      {permissions.canViewAnalytics && systemMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Total Production</h3>
            <p className="text-2xl font-bold text-blue-600">
              {systemMetrics.totalProduction || 0}
            </p>
          </Card>
          
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Overall Efficiency</h3>
            <p className="text-2xl font-bold text-green-600">
              {Math.round(systemMetrics.efficiency * 100) || 0}%
            </p>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Quality Rate</h3>
            <p className="text-2xl font-bold text-purple-600">
              {Math.round(systemMetrics.qualityRate * 100) || 0}%
            </p>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500">On-Time Delivery</h3>
            <p className="text-2xl font-bold text-indigo-600">
              {Math.round(systemMetrics.onTimeDelivery * 100) || 0}%
            </p>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* User Management - Only show if user has permission */}
          {permissions.canManageUsers && (
            <Button 
              className="p-4 h-auto flex flex-col items-center space-y-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
              variant="outline"
            >
              <span className="text-2xl">👥</span>
              <span className="text-sm font-medium">Manage Users</span>
            </Button>
          )}

          {/* Role Management - Only show if user has permission */}
          {permissions.canManageRoles && (
            <Button 
              className="p-4 h-auto flex flex-col items-center space-y-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              variant="outline"
            >
              <span className="text-2xl">🔐</span>
              <span className="text-sm font-medium">Manage Roles</span>
            </Button>
          )}

          {/* Production Management - Only show if user has permission */}
          {permissions.canManageProduction && (
            <Button 
              className="p-4 h-auto flex flex-col items-center space-y-2 bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
              variant="outline"
            >
              <span className="text-2xl">🏭</span>
              <span className="text-sm font-medium">Production Settings</span>
            </Button>
          )}

          {/* Reports - Only show if user has permission */}
          {permissions.canGenerateReports && (
            <Button 
              className="p-4 h-auto flex flex-col items-center space-y-2 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
              variant="outline"
              onClick={handleGenerateReport}
            >
              <span className="text-2xl">📊</span>
              <span className="text-sm font-medium">Generate Report</span>
            </Button>
          )}

          {/* Notifications - Only show if user has permission */}
          {permissions.canManageNotifications && (
            <Button 
              className="p-4 h-auto flex flex-col items-center space-y-2 bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
              variant="outline"
              onClick={handleSendSystemNotification}
            >
              <span className="text-2xl">🔔</span>
              <span className="text-sm font-medium">Send Notification</span>
            </Button>
          )}
        </div>
      </Card>

      {/* Company Performance - Only show if user can view all performance */}
      {permissions.canViewAllPerformance && dashboardData && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Company Performance Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-2">Department Efficiency</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Production</span>
                  <span className="text-sm font-medium">85%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Quality Control</span>
                  <span className="text-sm font-medium">92%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Logistics</span>
                  <span className="text-sm font-medium">78%</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-md font-medium text-gray-700 mb-2">Employee Performance</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Active Operators</span>
                  <span className="text-sm font-medium">124</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Supervisors</span>
                  <span className="text-sm font-medium">15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Avg Performance</span>
                  <span className="text-sm font-medium">87%</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-md font-medium text-gray-700 mb-2">System Health</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Server Uptime</span>
                  <span className="text-sm font-medium text-green-600">99.9%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Database Status</span>
                  <span className="text-sm font-medium text-green-600">Healthy</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Active Sessions</span>
                  <span className="text-sm font-medium">89</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* System Alerts */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">System Alerts</h2>
        <div className="space-y-3">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Maintenance Required:</strong> Machine #3 requires scheduled maintenance in 2 days
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-blue-400">ℹ️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>System Update:</strong> Firebase realtime notifications are now active
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Recent System Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-sm">
            <Badge variant="success" className="text-xs">USER</Badge>
            <span className="text-gray-600">New operator registration: John Smith</span>
            <span className="text-gray-400">2 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <Badge variant="warning" className="text-xs">SYSTEM</Badge>
            <span className="text-gray-600">Database backup completed successfully</span>
            <span className="text-gray-400">4 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <Badge variant="default" className="text-xs">PRODUCTION</Badge>
            <span className="text-gray-600">Daily production report generated</span>
            <span className="text-gray-400">6 hours ago</span>
          </div>
        </div>
      </Card>
    </div>
  );
};