import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Input } from '@/shared/components/ui/Input';
import { 
  UserGroupIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  StarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { OperatorList } from './operator-list';
import { OperatorDetail } from './operator-detail';
import { OperatorForm } from './operator-form';
import { OperatorCard } from './operator-card';
import { operatorService } from '@/services/operator-service';
import { useDeleteOperator } from '../hooks/use-operators';
import { notify } from '@/utils/notification-utils';
import { safeArray } from '@/utils/null-safety';

interface OperatorManagementDashboardProps {
  userRole?: string;
}

const OperatorManagementDashboard: React.FC<OperatorManagementDashboardProps> = ({
  userRole = 'supervisor'
}) => {
  const [activeView, setActiveView] = useState<'overview' | 'list' | 'detail' | 'form'>('overview');
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [operators, setOperators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // React Query hooks
  const deleteOperatorMutation = useDeleteOperator();

  // Load operators from Firebase
  useEffect(() => {
    loadOperators();
  }, [refreshTrigger]);

  const loadOperators = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await operatorService.getAllOperators();
      if (result.success) {
        setOperators(safeArray(result.data));
      } else {
        setError(result.error || 'Failed to load operators');
        setOperators([]);
      }
    } catch (err) {
      setError('Error loading operators');
      setOperators([]);
      console.error('Error loading operators:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handler for deleting an operator (supervisors only)
  const handleDeleteOperator = async (operatorId: string) => {
    if (userRole !== 'supervisor') {
      notify.warning('You do not have permission to delete operators.', 'Access Denied');
      return;
    }

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this operator? This action cannot be undone.'
    );

    if (confirmDelete) {
      try {
        // Use the new delete mutation with current user info
        await deleteOperatorMutation.mutateAsync({ 
          operatorId, 
          deletedBy: userRole // Pass current user role as deletedBy
        });
        
        notify.success('Operator deleted successfully!', 'Deletion Complete');
        setRefreshTrigger(prev => prev + 1); // Trigger refresh to update the list
        
        // If we were viewing the deleted operator, go back to overview
        if (selectedOperatorId === operatorId) {
          setSelectedOperatorId('');
          setActiveView('overview');
        }
      } catch (error) {
        console.error('Error deleting operator:', error);
        notify.error('Failed to delete operator. Please try again.', 'Deletion Failed');
      }
    }
  };
  
  // Transform operators for statistics (all operators)
  const transformedOperators = operators
    .filter(op => op != null) // Prevent null errors
    .map(op => ({
      id: op.id || '',
      name: op.name || 'Unknown',
      employeeId: op.employeeId || 'N/A',
      skills: op.machineTypes || [],
      efficiency: typeof op.averageEfficiency === 'number' ? op.averageEfficiency : 0,
      qualityScore: typeof op.qualityScore === 'number' ? op.qualityScore : 85, // Default to 85% for new operators
      activeAssignments: op.currentAssignments?.length || 0,
      completedToday: Math.floor(Math.random() * 5), // Mock data for demo - replace with real tracking
      status: op.isActive ? 
        (op.availabilityStatus === 'available' ? 'Active' : 
         op.availabilityStatus === 'working' ? 'Working' : 
         op.availabilityStatus === 'break' ? 'On Break' : 'Available') 
        : 'Offline',
      avatar: op.avatar ? op.avatar : null,
      joinDate: op.createdAt?.toDate ? op.createdAt.toDate() : new Date(),
      machineType: op.primaryMachine || 'Not Set'
    }));

  // Get recent operators for display (top 5)
  const recentOperators = transformedOperators.slice(0, 5);

  // Calculate operator statistics with enhanced metrics
  const operatorStats = {
    totalOperators: operators.length,
    activeOperators: transformedOperators.filter(op => ['Active', 'Working', 'Available'].includes(op.status)).length,
    onBreakOperators: transformedOperators.filter(op => op.status === 'On Break').length,
    offlineOperators: transformedOperators.filter(op => op.status === 'Offline').length,
    averageEfficiency: operators.length > 0 
      ? Math.round(transformedOperators.reduce((sum, op) => sum + op.efficiency, 0) / operators.length)
      : 0,
    averageQuality: operators.length > 0
      ? Math.round(transformedOperators.reduce((sum, op) => sum + op.qualityScore, 0) / operators.length)
      : 0,
    topPerformer: transformedOperators.length > 0
      ? transformedOperators.reduce((top, op) => op.efficiency > top.efficiency ? op : top, transformedOperators[0]).name
      : 'N/A',
    completedToday: transformedOperators.reduce((sum, op) => sum + op.completedToday, 0),
    attendanceRate: Math.round(((transformedOperators.length - transformedOperators.filter(op => op.status === 'Offline').length) / Math.max(transformedOperators.length, 1)) * 100)
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Operator Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Operators</p>
              <p className="text-2xl font-bold text-blue-600">{operatorStats.totalOperators}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Now</p>
              <p className="text-2xl font-bold text-green-600">{operatorStats.activeOperators}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <StarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Efficiency</p>
              <p className="text-2xl font-bold text-yellow-600">{operatorStats.averageEfficiency}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <StarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Top Performer</p>
              <p className="text-lg font-bold text-purple-600">{operatorStats.topPerformer}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Operator Management</h3>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search operators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button
              onClick={() => setActiveView('form')}
              className="flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Operator</span>
            </Button>
          </div>
        </div>

        {/* Operator Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentOperators
            .filter(op => 
              op.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              op.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
              op.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
            )
            .map((operator) => (
              <OperatorCard
                key={operator.id}
                operator={operator}
                onView={() => {
                  setSelectedOperatorId(operator.id);
                  setActiveView('detail');
                }}
                onEdit={() => {
                  setSelectedOperatorId(operator.id);
                  setActiveView('form');
                }}
                showActions={userRole === 'supervisor'}
              />
            ))}
          {recentOperators.filter(op => {
            if (!searchTerm) return false;
            const searchLower = searchTerm.toLowerCase();
            return !(
              (op.name || '').toLowerCase().includes(searchLower) ||
              (op.employeeId || '').toLowerCase().includes(searchLower) ||
              (op.skills || []).some(skill => (skill || '').toLowerCase().includes(searchLower))
            );
          }).length === recentOperators.length && searchTerm && recentOperators.length > 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              <MagnifyingGlassIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No operators found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Operator Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Active</span>
              </div>
              <span className="text-sm font-medium">{operatorStats.activeOperators}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">On Break</span>
              </div>
              <span className="text-sm font-medium">{operatorStats.onBreakOperators}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Offline</span>
              </div>
              <span className="text-sm font-medium">{operatorStats.offlineOperators}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Skills</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sewing</span>
              <Badge variant="secondary">45 operators</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cutting</span>
              <Badge variant="secondary">32 operators</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Finishing</span>
              <Badge variant="secondary">28 operators</Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Completion Rate</span>
              <span className="text-sm font-medium text-green-600">92.4%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Quality Score</span>
              <span className="text-sm font-medium text-blue-600">89.7%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Attendance Rate</span>
              <span className="text-sm font-medium text-purple-600">96.1%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return renderOverview();
      case 'list':
        return <OperatorList 
          onViewOperator={(id) => {
            setSelectedOperatorId(id);
            setActiveView('detail');
          }}
          onEditOperator={userRole === 'supervisor' ? (id) => {
            setSelectedOperatorId(id);
            setActiveView('form');
          } : undefined}
          onDeleteOperator={userRole === 'supervisor' ? handleDeleteOperator : undefined}
          onCreateNew={userRole === 'supervisor' ? () => {
            setSelectedOperatorId('');
            setActiveView('form');
          } : undefined}
          userRole={userRole}
          showActions={true}
          key={refreshTrigger} // Force re-render when refreshTrigger changes
        />;
      case 'detail':
        return selectedOperatorId ? (
          <OperatorDetail 
            operatorId={selectedOperatorId}
            onEdit={() => setActiveView('form')}
            onBack={() => setActiveView('overview')}
          />
        ) : renderOverview();
      case 'form':
        const selectedOperator = selectedOperatorId 
          ? operators.find(op => op.id === selectedOperatorId) 
          : undefined;
          
        return (
          <OperatorForm
            mode={selectedOperatorId ? 'edit' : 'create'}
            initialData={selectedOperator}
            onSubmit={async (data) => {
              console.log('Operator data submitted:', data);
              
              try {
                // Import the operator service
                const { operatorService } = await import('../../../services/operator-service');
                
                if (selectedOperatorId) {
                  // Update existing operator
                  const result = await operatorService.updateOperator(selectedOperatorId, data);
                  
                  if (result.success) {
                    notify.success('Operator updated successfully!', 'Update Complete');
                    setRefreshTrigger(prev => prev + 1); // Trigger refresh
                    setActiveView('overview');
                    setSelectedOperatorId('');
                  } else {
                    notify.error(`Failed to update operator: ${result.error}`, 'Update Failed');
                  }
                } else {
                  // Create new operator
                  const result = await operatorService.createOperator(data);
                  
                  if (result.success) {
                    notify.success('Operator created successfully!', 'Creation Complete');
                    setRefreshTrigger(prev => prev + 1); // Trigger refresh
                    setActiveView('overview');
                    setSelectedOperatorId('');
                  } else {
                    notify.error(`Failed to create operator: ${result.error}`, 'Creation Failed');
                  }
                }
              } catch (error) {
                console.error('Error saving operator:', error);
                notify.error('An unexpected error occurred. Please try again.', 'Unexpected Error');
              }
            }}
            onCancel={() => {
              setActiveView('overview');
              setSelectedOperatorId('');
            }}
            isLoading={false}
          />
        );
      default:
        return renderOverview();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
              <span>Operator Management</span>
            </h1>
            <p className="text-gray-600">Loading operators...</p>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
              <span>Operator Management</span>
            </h1>
            <p className="text-red-600">Error: {error}</p>
          </div>
        </div>
        <Card className="p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadOperators}>Retry</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <UserGroupIcon className="h-8 w-8 text-blue-600" />
            <span>Operator Management</span>
          </h1>
          <p className="text-gray-600">Manage operators, skills, and performance ({operators.length} total)</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveView('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveView('list')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'list'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All Operators
          </button>
          {selectedOperatorId && (
            <button
              onClick={() => setActiveView('detail')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeView === 'detail'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Operator Details
            </button>
          )}
          {userRole === 'supervisor' && (
            <button
              onClick={() => setActiveView('form')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeView === 'form'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {selectedOperatorId ? 'Edit Operator' : 'Add Operator'}
            </button>
          )}
        </nav>
      </div>

      {/* Main Content */}
      {renderContent()}
    </div>
  );
};

export default OperatorManagementDashboard;
export { OperatorManagementDashboard };