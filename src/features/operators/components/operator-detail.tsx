// Operator Detail Component with real-time status
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  PencilIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarDaysIcon,
  CpuChipIcon,
  StarIcon,
  BoltIcon,
  CheckBadgeIcon,
  ClockIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/Badge';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { useOperatorWithStatus } from '../hooks';
import { STATUS_CONFIG, MACHINE_TYPES, SKILL_LEVELS } from '@/types/operator-types';

export const OperatorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'activity'>('overview');

  const { 
    data: operatorResult, 
    isLoading, 
    error 
  } = useOperatorWithStatus(id!, {
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !operatorResult?.success || !operatorResult.data) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Operator not found</p>
        <Button onClick={() => navigate('/operators')}>Back to Operators</Button>
      </div>
    );
  }

  const operator = operatorResult.data;
  const status = operator.realtimeStatus;
  const statusConfig = STATUS_CONFIG[status.status as keyof typeof STATUS_CONFIG];

  // Generate avatar
  const renderAvatar = () => {
    if (operator.avatar) {
      switch (operator.avatar.type) {
        case 'emoji':
          return (
            <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center text-4xl">
              {operator.avatar.value}
            </div>
          );
        case 'photo':
          return (
            <img
              src={operator.avatar.value}
              alt={operator.name}
              className="h-20 w-20 rounded-full object-cover"
            />
          );
        case 'initials':
          return (
            <div 
              className="h-20 w-20 rounded-full flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: operator.avatar.backgroundColor || '#3B82F6' }}
            >
              {operator.avatar.value}
            </div>
          );
      }
    }
    
    // Default avatar
    const initials = operator.name.split(' ').map(part => part.charAt(0)).join('').toUpperCase().slice(0, 2);
    return (
      <div className="h-20 w-20 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-xl">
        {initials}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/operators')}
            className="flex items-center space-x-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Operator Details</h1>
            <p className="text-gray-600">View and manage operator information</p>
          </div>
        </div>
        
        <Button
          onClick={() => navigate(`/operators/${id}/edit`)}
          className="flex items-center space-x-2"
        >
          <PencilIcon className="h-4 w-4" />
          <span>Edit</span>
        </Button>
      </div>

      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex items-center space-x-6">
          {renderAvatar()}
          
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-2">
              <h2 className="text-xl font-bold text-gray-900">{operator.name}</h2>
              <Badge variant={statusConfig?.color as any} className="flex items-center space-x-1">
                <span>{statusConfig?.icon}</span>
                <span>{statusConfig?.label}</span>
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Employee ID</p>
                <p className="font-medium text-gray-900">{operator.employeeId}</p>
              </div>
              <div>
                <p className="text-gray-500">Username</p>
                <p className="font-medium text-gray-900">{operator.username}</p>
              </div>
              <div>
                <p className="text-gray-500">Primary Machine</p>
                <p className="font-medium text-gray-900">{operator.primaryMachine}</p>
              </div>
              <div>
                <p className="text-gray-500">Skill Level</p>
                <p className="font-medium text-gray-900 capitalize">{operator.skillLevel}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Real-time Status */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3">
            <div className={`h-3 w-3 rounded-full ${statusConfig?.color === 'green' ? 'bg-green-500' : statusConfig?.color === 'yellow' ? 'bg-yellow-500' : statusConfig?.color === 'blue' ? 'bg-blue-500' : 'bg-gray-500'}`}></div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium text-gray-900">{statusConfig?.label}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <ClockIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Current Work</p>
              <p className="font-medium text-gray-900">{status.currentWork || 'None'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <CpuChipIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Machine Status</p>
              <p className="font-medium text-gray-900 capitalize">{status.machineStatus}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Last Activity</p>
              <p className="font-medium text-gray-900">
                {new Date(status.lastActivity).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'performance', label: 'Performance' },
            { key: 'activity', label: 'Activity' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="space-y-4">
              {operator.email && (
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{operator.email}</p>
                  </div>
                </div>
              )}
              
              {operator.phone && (
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{operator.phone}</p>
                  </div>
                </div>
              )}
              
              {operator.address && (
                <div className="flex items-center space-x-3">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium text-gray-900">{operator.address}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Hired Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(operator.hiredDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Work Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Information</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CpuChipIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Machine Types</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {operator.machineTypes?.map((machineType) => {
                      const machine = MACHINE_TYPES.find(m => m.machineType === machineType);
                      return (
                        <Badge key={machineType} variant="secondary">
                          {machine?.displayName || machineType}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <StarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Specializations</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {operator.specializations?.map((spec) => (
                      <Badge key={spec} variant="outline">
                        {spec}
                      </Badge>
                    )) || <p className="text-gray-400 text-sm">None specified</p>}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Shift</p>
                  <p className="font-medium text-gray-900 capitalize">{operator.shift}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="h-5 w-5 text-gray-400 flex items-center justify-center">
                  <span className="text-xs font-bold">#</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Max Concurrent Work</p>
                  <p className="font-medium text-gray-900">{operator.maxConcurrentWork}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-2">
              <BoltIcon className="h-6 w-6 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900">Efficiency</h3>
            </div>
            <p className="text-3xl font-bold text-yellow-600">
              {Math.round(operator.averageEfficiency * 100)}%
            </p>
            <p className="text-sm text-gray-500 mt-1">Average performance</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-2">
              <CheckBadgeIcon className="h-6 w-6 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900">Quality</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {Math.round(operator.qualityScore * 100)}%
            </p>
            <p className="text-sm text-gray-500 mt-1">Quality score</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                B
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Bundles</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">{operator.completedBundles}</p>
            <p className="text-sm text-gray-500 mt-1">Completed</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-2">
              <CurrencyRupeeIcon className="h-6 w-6 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900">Earnings</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600">
              ₹{operator.totalEarnings?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">Total earned</p>
          </Card>
        </div>
      )}

      {activeTab === 'activity' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="text-center py-8">
            <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Activity log will be displayed here</p>
            <p className="text-sm text-gray-400 mt-2">Feature coming soon</p>
          </div>
        </Card>
      )}
    </div>
  );
};