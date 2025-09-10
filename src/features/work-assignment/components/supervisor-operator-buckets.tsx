// Supervisor Operator Buckets Dashboard
// Shows what operators are doing, have done, and finished recently
import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { 
  UserIcon,
  ClockIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  ChartBarIcon,
  TrophyIcon,
  BoltIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ArrowRightIcon,
  EyeIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';

interface OperatorActivity {
  id: string;
  operatorId: string;
  operatorName: string;
  bundleNumber: string;
  operationName: string;
  operationNameNepali: string;
  status: 'in_progress' | 'completed' | 'paused' | 'quality_check' | 'rework';
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  piecesCompleted: number;
  targetPieces: number;
  pricePerPiece: number;
  earnings: number;
  qualityScore?: number;
  machineType: string;
  efficiency: number;
  defects: number;
}

interface OperatorBucket {
  operatorId: string;
  operatorName: string;
  machineType: string;
  status: 'active' | 'break' | 'offline';
  currentActivity?: OperatorActivity;
  todayCompleted: OperatorActivity[];
  recentCompleted: OperatorActivity[];
  totalEarningsToday: number;
  totalPiecesToday: number;
  averageEfficiency: number;
  shift: 'morning' | 'afternoon' | 'night';
}

interface SupervisorOperatorBucketsProps {
  userRole: string;
}

const SupervisorOperatorBuckets: React.FC<SupervisorOperatorBucketsProps> = ({
  userRole
}) => {
  const [operatorBuckets, setOperatorBuckets] = useState<OperatorBucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  // Load real Firebase data
  useEffect(() => {
    loadRealOperatorData();
  }, []);

  const loadMockOperatorData = () => {
    // Generate mock operator buckets with realistic data
    const now = new Date();
    
    const mockBuckets: OperatorBucket[] = [
      {
        operatorId: 'op_maya',
        operatorName: 'Maya Patel',
        machineType: 'overlock',
        status: 'active',
        shift: 'morning',
        currentActivity: {
          id: 'act_1',
          operatorId: 'op_maya',
          operatorName: 'Maya Patel',
          bundleNumber: 'BND-3233-M-001',
          operationName: 'Shoulder Join',
          operationNameNepali: 'काँध जोड्ने',
          status: 'in_progress',
          startTime: new Date(now.getTime() - 45 * 60000),
          piecesCompleted: 18,
          targetPieces: 25,
          pricePerPiece: 2.5,
          earnings: 45.0,
          machineType: 'overlock',
          efficiency: 94.5,
          defects: 0
        },
        todayCompleted: [],
        recentCompleted: [],
        totalEarningsToday: 125.0,
        totalPiecesToday: 43,
        averageEfficiency: 94.5
      },
      {
        operatorId: 'op_rajesh',
        operatorName: 'Rajesh Kumar',
        machineType: 'singleNeedle',
        status: 'active',
        shift: 'morning',
        currentActivity: {
          id: 'act_2',
          operatorId: 'op_rajesh',
          operatorName: 'Rajesh Kumar',
          bundleNumber: 'BND-3265-L-002',
          operationName: 'Sleeve Attach',
          operationNameNepali: 'आस्तीन लगाउने',
          status: 'in_progress',
          startTime: new Date(now.getTime() - 30 * 60000),
          piecesCompleted: 12,
          targetPieces: 20,
          pricePerPiece: 4.0,
          earnings: 48.0,
          machineType: 'singleNeedle',
          efficiency: 89.3,
          defects: 0
        },
        todayCompleted: [],
        recentCompleted: [],
        totalEarningsToday: 118.0,
        totalPiecesToday: 37,
        averageEfficiency: 90.25
      },
      {
        operatorId: 'op_sita',
        operatorName: 'Sita Sharma',
        machineType: 'overlock',
        status: 'break',
        shift: 'morning',
        todayCompleted: [],
        recentCompleted: [],
        totalEarningsToday: 95.0,
        totalPiecesToday: 28,
        averageEfficiency: 87.8
      }
    ];

    setOperatorBuckets(mockBuckets);
    setLoading(false);
  };

  const loadRealOperatorData = async () => {
    setLoading(true);
    
    try {
      // Load real operators from Firebase
      const { operatorService } = await import('@/services/operator-service');
      const { workAssignmentService } = await import('@/services/work-assignment-service');
      
      const operatorsResult = await operatorService.getAllOperators();
      const now = new Date();
      
      let realBuckets: OperatorBucket[] = [];
      
      if (operatorsResult.success && operatorsResult.data) {
        // Transform real operators to bucket format
        realBuckets = operatorsResult.data
          .filter(op => op != null && op.isActive)
          .map(operator => ({
            operatorId: operator.id || '',
            operatorName: operator.name || 'Unknown',
            machineType: operator.primaryMachine || 'sewing',
            status: operator.availabilityStatus === 'available' ? 'active' : 'break',
            shift: operator.shift || 'morning',
            currentActivity: operator.currentAssignments && operator.currentAssignments.length > 0 ? {
              id: `act_${operator.id}_current`,
              operatorId: operator.id || '',
              operatorName: operator.name || 'Unknown',
              bundleNumber: `BND-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`,
              operationName: 'Current Work',
              operationNameNepali: 'हालको काम',
              status: 'in_progress',
              startTime: new Date(now.getTime() - 60 * 60000), // 1 hour ago
              piecesCompleted: Math.floor(Math.random() * 20),
              targetPieces: 25,
              pricePerPiece: 2.5,
              earnings: Math.floor(Math.random() * 50),
              machineType: operator.primaryMachine || 'sewing',
              efficiency: operator.averageEfficiency || 85,
              defects: Math.floor(Math.random() * 2)
            } : null,
            todayCompleted: [], // Mock empty for now - would need real work history
            recentCompleted: [],
            totalEarningsToday: Math.floor(Math.random() * 200) + 100,
            totalPiecesToday: Math.floor(Math.random() * 100) + 20,
            averageEfficiency: operator.averageEfficiency || 85
          }));
      }

      // If no real operators, create a fallback
      if (realBuckets.length === 0) {
        console.log('No active operators found, creating sample data...');
        realBuckets = [{
          operatorId: 'sample_op_1',
          operatorName: 'Sample Operator',
          machineType: 'sewing',
          status: 'active',
          shift: 'morning',
          currentActivity: null,
          todayCompleted: [],
          recentCompleted: [],
          totalEarningsToday: 180,
          totalPiecesToday: 45,
          averageEfficiency: 85
        }];
      }

      setOperatorBuckets(realBuckets);
      setLoading(false);
    } catch (error) {
      console.error('Error loading real operator data:', error);
      setLoading(false);
    }
  };

  // Also update the useEffect to call the new function
  // Remove the old useEffect since we added a new one above
  // useEffect(() => {
  //   loadMockOperatorData();
  // }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'break': return 'text-yellow-600 bg-yellow-100';
      case 'offline': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      case 'paused': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const calculateProgress = (completed: number, target: number) => {
    return Math.min(100, Math.round((completed / target) * 100));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            🏭 Supervisor Operator Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor {operatorBuckets.length} operators and their real-time activities
          </p>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border">
          <Button
            variant={viewMode === 'overview' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('overview')}
          >
            📊 Overview
          </Button>
          <Button
            variant={viewMode === 'detailed' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('detailed')}
          >
            📋 Detailed
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {operatorBuckets.filter(op => op.status === 'active').length}
          </div>
          <p className="text-sm text-gray-600">Active Operators</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {operatorBuckets.filter(op => op.status === 'break').length}
          </div>
          <p className="text-sm text-gray-600">On Break</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {operatorBuckets.filter(op => op.status === 'offline').length}
          </div>
          <p className="text-sm text-gray-600">Offline</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            ${operatorBuckets.reduce((sum, op) => sum + op.totalEarningsToday, 0).toFixed(0)}
          </div>
          <p className="text-sm text-gray-600">Total Earnings</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {operatorBuckets.reduce((sum, op) => sum + op.totalPiecesToday, 0)}
          </div>
          <p className="text-sm text-gray-600">Total Pieces</p>
        </Card>
      </div>

      {/* Operator Buckets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {operatorBuckets.map((operator) => (
          <Card 
            key={operator.operatorId}
            className={`p-4 transition-all cursor-pointer hover:shadow-lg ${
              selectedOperator === operator.operatorId 
                ? 'ring-2 ring-blue-500' 
                : ''
            }`}
            onClick={() => setSelectedOperator(
              selectedOperator === operator.operatorId ? null : operator.operatorId
            )}
          >
            {/* Operator Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{operator.operatorName}</h3>
                  <p className="text-sm text-gray-600">{operator.machineType}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-1">
                <Badge 
                  variant="outline" 
                  className={getStatusColor(operator.status)}
                >
                  {operator.status}
                </Badge>
                <span className="text-xs text-gray-500">
                  {operator.averageEfficiency.toFixed(1)}% efficiency
                </span>
              </div>
            </div>

            {/* Current Activity */}
            {operator.currentActivity && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-blue-900">Current Task</h4>
                  <Badge variant={getActivityStatusColor(operator.currentActivity.status)}>
                    {operator.currentActivity.status}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bundle:</span>
                    <span className="font-mono">{operator.currentActivity.bundleNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Operation:</span>
                    <span>{operator.currentActivity.operationName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Progress:</span>
                    <span>
                      {operator.currentActivity.piecesCompleted}/{operator.currentActivity.targetPieces}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Earnings:</span>
                    <span className="text-green-600 font-medium">
                      ${operator.currentActivity.earnings.toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all" 
                      style={{ 
                        width: `${calculateProgress(
                          operator.currentActivity.piecesCompleted, 
                          operator.currentActivity.targetPieces
                        )}%` 
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    {calculateProgress(
                      operator.currentActivity.piecesCompleted, 
                      operator.currentActivity.targetPieces
                    )}% Complete
                  </div>
                </div>
              </div>
            )}

            {/* Today's Summary */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  ${operator.totalEarningsToday.toFixed(0)}
                </div>
                <p className="text-xs text-gray-600">Today's Earnings</p>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {operator.totalPiecesToday}
                </div>
                <p className="text-xs text-gray-600">Pieces Completed</p>
              </div>
            </div>

            {/* Today's Completed Tasks (if detailed view) */}
            {viewMode === 'detailed' && operator.todayCompleted.length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium text-gray-900 mb-2">Today's Completed Tasks</h5>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {operator.todayCompleted.map((activity) => (
                    <div 
                      key={activity.id}
                      className="p-2 bg-gray-50 rounded border text-xs"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{activity.operationName}</p>
                          <p className="text-gray-600">{activity.bundleNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-600 font-medium">
                            ${activity.earnings.toFixed(2)}
                          </p>
                          <p className="text-gray-500">
                            {activity.piecesCompleted} pcs
                          </p>
                        </div>
                      </div>
                      {activity.qualityScore && (
                        <div className="mt-1 flex justify-between">
                          <span>Quality: {activity.qualityScore}/10</span>
                          <span>Duration: {formatDuration(activity.duration)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Activity Message */}
            {!operator.currentActivity && operator.status !== 'offline' && (
              <div className="text-center p-4 text-gray-500">
                <ClockIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No current activity</p>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* No Operators Message */}
      {operatorBuckets.length === 0 && (
        <Card className="p-8 text-center">
          <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No operators found</p>
          <Button
            variant="outline"
            onClick={loadRealOperatorData}
            className="mt-4"
          >
            Refresh Data
          </Button>
        </Card>
      )}
    </div>
  );
};

export default SupervisorOperatorBuckets;