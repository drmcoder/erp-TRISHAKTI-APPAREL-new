// Real Supervisor Dashboard - Using Integrated Business Service with Permission-Based UI
import React, { useState, useEffect } from 'react';
import { supervisorServices, permissionService } from '@/services';
import { PERMISSIONS } from '@/services/permission-service';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';

interface SupervisorDashboardProps {
  supervisorId: string;
}

export const SupervisorDashboard: React.FC<SupervisorDashboardProps> = React.memo(({ supervisorId }) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingApproval, setProcessingApproval] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<{
    canViewDashboard: boolean;
    canViewTeam: boolean;
    canAssignWork: boolean;
    canApproveAssignments: boolean;
    canViewTeamPerformance: boolean;
    canManageSchedule: boolean;
  }>({
    canViewDashboard: false,
    canViewTeam: false,
    canAssignWork: false,
    canApproveAssignments: false,
    canViewTeamPerformance: false,
    canManageSchedule: false,
  });

  useEffect(() => {
    loadPermissions();
    loadDashboardData();
    
    // Removed auto-refresh for performance - use manual refresh instead
    // const interval = setInterval(loadDashboardData, 30000);
    // return () => clearInterval(interval);
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
        alert(`Assignment ${decision}d successfully!`);
      } else {
        alert(`Failed to ${decision} assignment: ${result.error}`);
      }
    } catch (err) {
      alert(`Error processing ${decision}`);
    } finally {
      setProcessingApproval(null);
    }
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

      {/* Team Members - Only show if user has permission to view team */}
      {permissions.canViewTeam && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Team Members</h2>
          
          {teamOperators.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No team members assigned</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamOperators.map((operator: any) => (
                <div key={operator.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{operator.name}</h3>
                    <Badge variant={operator.currentStatus === 'working' ? 'success' : 'secondary'}>
                      {operator.currentStatus}
                    </Badge>
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