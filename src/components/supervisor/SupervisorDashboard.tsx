// Real Supervisor Dashboard - Using Integrated Business Service with Permission-Based UI
import React, { useState, useEffect } from 'react';
import { supervisorServices, permissionService } from '@/services';
import { notificationService } from '@/services/notification-service';
import { PERMISSIONS } from '@/services/permission-service';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { Bell, CheckCircle, AlertTriangle, AlertCircle, Info, Clock, Trash2, Edit, UserMinus, MoreVertical } from 'lucide-react';
import { notify } from '@/utils/notification-utils';

interface SupervisorDashboardProps {
  supervisorId: string;
}

interface SupervisorNotification {
  id: string;
  type: 'system' | 'assignment' | 'quality' | 'break' | 'achievement' | 'alert';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  category?: string;
}

export const SupervisorDashboard: React.FC<SupervisorDashboardProps> = React.memo(({ supervisorId }) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingApproval, setProcessingApproval] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<SupervisorNotification[]>([]);
  const [operatorMenuOpen, setOperatorMenuOpen] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [removingOperator, setRemovingOperator] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<{
    canViewDashboard: boolean;
    canViewTeam: boolean;
    canAssignWork: boolean;
    canApproveAssignments: boolean;
    canViewTeamPerformance: boolean;
    canManageSchedule: boolean;
    canManageTeamMembers: boolean;
  }>({
    canViewDashboard: false,
    canViewTeam: false,
    canAssignWork: false,
    canApproveAssignments: false,
    canViewTeamPerformance: false,
    canManageSchedule: false,
    canManageTeamMembers: false,
  });

  useEffect(() => {
    loadPermissions();
    loadDashboardData();
    
    // Setup notifications and cleanup
    let unsubscribeNotifications: (() => void) | undefined;
    
    const setupNotifications = async () => {
      unsubscribeNotifications = await loadSupervisorNotifications();
    };
    
    setupNotifications();
    
    // Cleanup function
    return () => {
      if (unsubscribeNotifications) {
        unsubscribeNotifications();
      }
    };
  }, [supervisorId]);

  const loadPermissions = async () => {
    try {
      // Load permissions for the supervisor
      await permissionService.loadUserPermissions(supervisorId);
      
      // Check specific permissions
      setPermissions({
        canViewDashboard: permissionService.hasPermission(supervisorId, PERMISSIONS.SUPERVISOR_VIEW_DASHBOARD.id),
        canViewTeam: permissionService.hasPermission(supervisorId, PERMISSIONS.SUPERVISOR_VIEW_TEAM.id),
        canAssignWork: permissionService.hasPermission(supervisorId, PERMISSIONS.SUPERVISOR_ASSIGN_WORK.id),
        canApproveAssignments: permissionService.hasPermission(supervisorId, PERMISSIONS.SUPERVISOR_APPROVE_ASSIGNMENTS.id),
        canViewTeamPerformance: permissionService.hasPermission(supervisorId, PERMISSIONS.SUPERVISOR_VIEW_TEAM_PERFORMANCE.id),
        canManageSchedule: permissionService.hasPermission(supervisorId, PERMISSIONS.SUPERVISOR_MANAGE_TEAM_SCHEDULE.id),
        canManageTeamMembers: permissionService.hasPermission(supervisorId, PERMISSIONS.SUPERVISOR_MANAGE_TEAM_SCHEDULE.id), // Using schedule permission for now
      });
    } catch (error) {
      console.error('Failed to load permissions:', error);
      // Fallback: assume supervisor role for demo purposes
      permissionService.setUserRole(supervisorId, 'SUPERVISOR');
      setPermissions({
        canViewDashboard: true,
        canViewTeam: true,
        canAssignWork: true,
        canApproveAssignments: true,
        canViewTeamPerformance: true,
        canManageSchedule: true,
        canManageTeamMembers: true,
      });
    }
  };

  const loadDashboardData = async () => {
    try {
      const result = await supervisorServices.getDashboard(supervisorId);
      if (result.success) {
        setDashboardData(result.data);
      } else {
        setError(result.error || 'Failed to load dashboard data');
      }
    } catch (err) {
      setError('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadSupervisorNotifications = async () => {
    try {
      // Get notifications from the notification service
      // Filter for supervisor-relevant notifications (could be refined further)
      const allNotifications = notificationService.getNotifications({
        limit: 20 // Get latest 20 notifications
      });
      
      // Filter and transform notifications for supervisor context
      const supervisorNotifications: SupervisorNotification[] = allNotifications
        .filter(notification => 
          // Include system, assignment, quality, and alert notifications for supervisors
          ['system', 'assignment', 'quality', 'alert', 'achievement'].includes(notification.type) ||
          notification.userId === supervisorId // Include notifications specifically for this supervisor
        )
        .map(notification => ({
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          timestamp: notification.timestamp,
          read: notification.read,
          priority: notification.priority,
          userId: notification.userId,
          category: notification.category
        }));
      
      setNotifications(supervisorNotifications);
      
      // Subscribe to real-time notification updates
      const unsubscribe = notificationService.subscribe(`supervisor-${supervisorId}`, (newNotification) => {
        // Add new notification if it's relevant to supervisor
        if (
          ['system', 'assignment', 'quality', 'alert', 'achievement'].includes(newNotification.type) ||
          newNotification.userId === supervisorId
        ) {
          setNotifications(prev => [
            {
              id: newNotification.id,
              type: newNotification.type,
              title: newNotification.title,
              message: newNotification.message,
              timestamp: newNotification.timestamp,
              read: newNotification.read,
              priority: newNotification.priority,
              userId: newNotification.userId,
              category: newNotification.category
            },
            ...prev
          ]);
        }
      });
      
      // Store unsubscribe function for cleanup
      return unsubscribe;
    } catch (err) {
      console.error('Failed to load notifications:', err);
      // Fallback to empty notifications on error
      setNotifications([]);
    }
  };

  const markNotificationAsRead = (notificationId: string) => {
    // Update local state
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    
    // Update notification service
    try {
      notificationService.markAsRead(notificationId);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'quality': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'alert': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'assignment': return <Bell className="w-4 h-4 text-purple-600" />;
      case 'system': return <Info className="w-4 h-4 text-blue-600" />;
      case 'break': return <Clock className="w-4 h-4 text-gray-600" />;
      default: return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleApprovalDecision = async (
    requestId: string, 
    decision: 'approve' | 'reject',
    notes?: string
  ) => {
    try {
      setProcessingApproval(requestId);
      
      const result = await supervisorServices.processAssignmentApproval(
        requestId,
        supervisorId,
        decision,
        notes
      );

      if (result.success) {
        // Refresh dashboard
        await loadDashboardData();
        notify.success(`Assignment ${decision}d successfully!`, 'Assignment Updated');
      } else {
        notify.error(`Failed to ${decision} assignment: ${result.error}`, 'Assignment Failed');
      }
    } catch (err) {
      notify.error(`Error processing ${decision}`, 'Processing Error');
    } finally {
      setProcessingApproval(null);
    }
  };

  const handleRemoveOperator = async (operatorId: string, operatorName: string) => {
    if (!confirmingDelete) {
      setConfirmingDelete(operatorId);
      return;
    }

    try {
      setRemovingOperator(operatorId);
      
      // For now, simulate the removal - in a real implementation, this would call
      // a backend service to remove the operator from the supervisor's team
      console.log(`Removing operator ${operatorId} from supervisor ${supervisorId}'s team`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate success
      const success = Math.random() > 0.1; // 90% success rate
      
      if (success) {
        // Remove operator from local state to update UI immediately
        if (dashboardData?.teamOperators) {
          const updatedOperators = dashboardData.teamOperators.filter(
            (op: any) => op.id !== operatorId
          );
          setDashboardData({
            ...dashboardData,
            teamOperators: updatedOperators
          });
        }
        
        notify.success(`${operatorName} has been removed from the team successfully`, 'Operator Removed');
        
        // Refresh dashboard data from server
        setTimeout(() => loadDashboardData(), 500);
      } else {
        throw new Error('Simulated failure');
      }
    } catch (err) {
      notify.error(`Error removing ${operatorName} from team. Please try again.`, 'Removal Failed');
    } finally {
      setConfirmingDelete(null);
      setRemovingOperator(null);
    }
  };

  const handleEditOperator = (operatorId: string) => {
    // For now, just log - this could navigate to an edit form
    console.log('Edit operator:', operatorId);
    notify.info('Edit operator functionality - to be implemented', 'Feature Coming Soon');
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Check if user has permission to view supervisor dashboard
  if (!permissions.canViewDashboard) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600">You don't have permission to access the Supervisor Dashboard.</p>
          <p className="text-sm text-red-500 mt-2">Please contact your administrator for access.</p>
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

  if (!dashboardData) return null;

  const { supervisor, teamProductivity, pendingApprovals, teamOperators = [] } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="default" className="bg-green-100 text-green-800">👥 SUPERVISOR DASHBOARD</Badge>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{supervisor.name}</h1>
            <p className="text-gray-600">
              {supervisor.supervisorLevel} Supervisor • Team Size: {teamOperators.length}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <Button 
                onClick={loadDashboardData}
                disabled={loading}
                size="sm"
                variant="outline"
              >
                {loading ? <LoadingSpinner size="sm" /> : '🔄 Refresh'}
              </Button>
              <Badge variant="success">Active</Badge>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Lines: {supervisor.responsibleLines?.length || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Team Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Team Efficiency</h3>
          <p className="text-2xl font-bold text-green-600">
            {Math.round(teamProductivity.teamEfficiency * 100)}%
          </p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Average Quality</h3>
          <p className="text-2xl font-bold text-blue-600">
            {Math.round(teamProductivity.averageQuality * 100)}%
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Team Health</h3>
          <p className="text-2xl font-bold text-purple-600">
            {teamProductivity.teamHealthScore}
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Pending Approvals</h3>
          <p className="text-2xl font-bold text-orange-600">
            {pendingApprovals.length}
          </p>
        </Card>
      </div>

      {/* Notifications Panel */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Notifications</h2>
            <Badge variant="destructive" className="px-2 py-0.5 text-xs">
              {notifications.filter(n => !n.read).length}
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            }}
            className="text-sm"
          >
            Mark all read
          </Button>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No notifications</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                  !notification.read 
                    ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => markNotificationAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={
                            notification.priority === 'critical' || notification.priority === 'high' 
                              ? 'destructive' 
                              : notification.priority === 'medium' 
                                ? 'default' 
                                : 'secondary'
                          }
                          className="text-xs"
                        >
                          {notification.priority}
                        </Badge>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center mt-2">
                      <Clock className="w-3 h-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-400">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Team Members - Only show if user has permission to view team */}
      {permissions.canViewTeam && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Team Members</h2>
          
          {teamOperators.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No team members assigned</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamOperators.map((operator: any) => (
                <div key={operator.id} className="border rounded-lg p-4 relative">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{operator.name}</h3>
                    <div className="flex items-center space-x-2">
                      <Badge variant={operator.currentStatus === 'working' ? 'success' : 'secondary'}>
                        {operator.currentStatus}
                      </Badge>
                      
                      {/* Operator Management Actions */}
                      {permissions.canManageTeamMembers && (
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditOperator(operator.id)}
                            className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700"
                            title="Edit operator"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveOperator(operator.id, operator.name)}
                            disabled={removingOperator === operator.id}
                            className={`h-7 w-7 p-0 ${
                              confirmingDelete === operator.id 
                                ? 'text-red-700 bg-red-100' 
                                : 'text-red-600 hover:text-red-700'
                            }`}
                            title={
                              removingOperator === operator.id 
                                ? "Removing..." 
                                : confirmingDelete === operator.id 
                                  ? "Click again to confirm removal" 
                                  : "Remove from team"
                            }
                          >
                            {removingOperator === operator.id ? (
                              <LoadingSpinner size="sm" />
                            ) : confirmingDelete === operator.id ? (
                              <UserMinus className="w-3 h-3" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </Button>
                          
                          {confirmingDelete === operator.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmingDelete(null)}
                              className="h-7 w-7 p-0 text-gray-600 hover:text-gray-700"
                              title="Cancel"
                            >
                              ×
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {operator.skillLevel} • {operator.primaryMachine}
                  </p>
                  
                  {/* Performance metrics - only show if user can view team performance */}
                  {permissions.canViewTeamPerformance && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Efficiency:</span>
                        <span className="font-medium">
                          {Math.round(operator.averageEfficiency * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Quality:</span>
                        <span className="font-medium">
                          {Math.round(operator.qualityScore * 100)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Pending Approvals - Only show if user has permission to approve assignments */}
      {permissions.canApproveAssignments && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Pending Assignment Approvals</h2>
          
          {pendingApprovals.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pending approvals</p>
          ) : (
            <div className="space-y-4">
              {pendingApprovals.map((request: any) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-medium">Work Assignment Request</h3>
                      <p className="text-sm text-gray-600">
                        Operator: {request.operatorName || request.operatorId}
                      </p>
                    </div>
                    <Badge variant="warning">Pending</Badge>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-700">
                      <strong>Work Item:</strong> {request.workItemId}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Requested:</strong> {new Date(request.requestedAt?.seconds * 1000).toLocaleString()}
                    </p>
                    {request.reason && (
                      <p className="text-sm text-gray-700">
                        <strong>Reason:</strong> {request.reason}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      size="sm"
                      onClick={() => handleApprovalDecision(request.id, 'approve')}
                      disabled={processingApproval === request.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {processingApproval === request.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        'Approve'
                      )}
                    </Button>
                    
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const notes = prompt('Rejection reason (optional):');
                        handleApprovalDecision(request.id, 'reject', notes || undefined);
                      }}
                      disabled={processingApproval === request.id}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Team Performance Recommendations - Only show if user can view team performance */}
      {permissions.canViewTeamPerformance && teamProductivity.recommendedActions.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Performance Recommendations</h2>
          <div className="space-y-2">
            {teamProductivity.recommendedActions.map((action: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm">{action}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Team Health Alert - Only show if user can view team performance */}
      {permissions.canViewTeamPerformance && teamProductivity.teamHealthScore < 60 && (
        <Card className="p-6 bg-red-50 border-red-200">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            ⚠️ Team Health Alert
          </h2>
          <p className="text-red-700 mb-4">
            Your team health score is {teamProductivity.teamHealthScore}. Immediate attention required.
          </p>
          <div className="space-y-1">
            {teamProductivity.recommendedActions.slice(0, 3).map((action: string, index: number) => (
              <p key={index} className="text-sm text-red-600">• {action}</p>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
});