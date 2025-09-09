import React, { useState } from 'react';
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

  // Handler for deleting an operator (supervisors only)
  const handleDeleteOperator = async (operatorId: string) => {
    if (userRole !== 'supervisor') {
      alert('You do not have permission to delete operators.');
      return;
    }

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this operator? This action cannot be undone.'
    );

    if (confirmDelete) {
      try {
        // TODO: Implement actual delete API call
        console.log('Deleting operator:', operatorId);
        alert('Operator deleted successfully! (This is a demo - implement actual Firebase delete)');
        
        // If we were viewing the deleted operator, go back to overview
        if (selectedOperatorId === operatorId) {
          setSelectedOperatorId('');
          setActiveView('overview');
        }
      } catch (error) {
        console.error('Error deleting operator:', error);
        alert('Failed to delete operator. Please try again.');
      }
    }
  };
  
  // Mock data - in real implementation, this would come from API
  const operatorStats = {
    totalOperators: 156,
    activeOperators: 142,
    onBreakOperators: 8,
    offlineOperators: 6,
    averageEfficiency: 87.3,
    topPerformer: 'Maya Sharma'
  };

  const recentOperators = [
    {
      id: 'op-maya-001',
      name: 'Maya Sharma',
      employeeId: 'EMP001',
      skills: ['Cutting', 'Sewing', 'Finishing'],
      efficiency: 94.5,
      activeAssignments: 3,
      completedToday: 12,
      status: 'Active',
      avatar: '/avatars/maya.jpg',
      joinDate: new Date('2023-03-15')
    },
    {
      id: 'op-rajesh-002',
      name: 'Rajesh Kumar',
      employeeId: 'EMP002',
      skills: ['Sewing', 'Quality Check'],
      efficiency: 91.2,
      activeAssignments: 2,
      completedToday: 8,
      status: 'Active',
      avatar: '/avatars/rajesh.jpg',
      joinDate: new Date('2023-01-20')
    },
    {
      id: 'op-priya-003',
      name: 'Priya Singh',
      employeeId: 'EMP003',
      skills: ['Cutting', 'Pattern Making'],
      efficiency: 89.8,
      activeAssignments: 1,
      completedToday: 6,
      status: 'On Break',
      avatar: '/avatars/priya.jpg',
      joinDate: new Date('2023-05-10')
    },
    {
      id: 'op-amit-004',
      name: 'Amit Patel',
      employeeId: 'EMP004',
      skills: ['Finishing', 'Packing'],
      efficiency: 85.6,
      activeAssignments: 4,
      completedToday: 15,
      status: 'Active',
      avatar: '/avatars/amit.jpg',
      joinDate: new Date('2022-11-08')
    }
  ];

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
                onView={(id) => {
                  setSelectedOperatorId(id);
                  setActiveView('detail');
                }}
                onEdit={(id) => {
                  setSelectedOperatorId(id);
                  setActiveView('form');
                }}
                showActions={userRole === 'supervisor'}
              />
            ))}
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
        return (
          <OperatorForm
            mode={selectedOperatorId ? 'edit' : 'create'}
            initialData={selectedOperatorId ? { username: '', name: '' } : undefined}
            onSubmit={async (data) => {
              console.log('Operator data submitted:', data);
              
              try {
                // Import the operator service
                const { operatorService } = await import('../../services');
                
                if (selectedOperatorId) {
                  // Update existing operator
                  const result = await operatorService.updateOperator(selectedOperatorId, data);
                  
                  if (result.success) {
                    alert('✅ Operator updated successfully!');
                    setRefreshTrigger(prev => prev + 1); // Trigger refresh
                    setActiveView('overview');
                    setSelectedOperatorId('');
                  } else {
                    alert(`❌ Failed to update operator: ${result.error}`);
                  }
                } else {
                  // Create new operator
                  const result = await operatorService.createOperator(data);
                  
                  if (result.success) {
                    alert('✅ Operator created successfully!');
                    setRefreshTrigger(prev => prev + 1); // Trigger refresh
                    setActiveView('overview');
                    setSelectedOperatorId('');
                  } else {
                    alert(`❌ Failed to create operator: ${result.error}`);
                  }
                }
              } catch (error) {
                console.error('Error saving operator:', error);
                alert('❌ An unexpected error occurred. Please try again.');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <UserGroupIcon className="h-8 w-8 text-blue-600" />
            <span>Operator Management</span>
          </h1>
          <p className="text-gray-600">Manage operators, skills, and performance</p>
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