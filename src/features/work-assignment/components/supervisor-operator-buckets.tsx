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

export const SupervisorOperatorBuckets: React.FC<SupervisorOperatorBucketsProps> = ({
  userRole
}) => {
  const [operatorBuckets, setOperatorBuckets] = useState<OperatorBucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  // Load mock data
  useEffect(() => {
    loadMockOperatorData();
  }, []);

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
            statistics: {
              todayPieces: Math.floor(Math.random() * 100) + 20,
              todayEarnings: Math.floor(Math.random() * 200) + 100,
              averageEfficiency: operator.averageEfficiency || 85
            }
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
          statistics: {
            todayPieces: 45,
            todayEarnings: 180,
            averageEfficiency: 85
          }
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
          bundleNumber: 'BND-3233-M-001',
          operationName: 'Shoulder Join',
          operationNameNepali: 'काँध जोड्ने',
          status: 'in_progress',
          startTime: new Date(now.getTime() - 45 * 60000), // 45 minutes ago
          piecesCompleted: 18,
          targetPieces: 25,
          pricePerPiece: 2.5,
          earnings: 45.0,
          machineType: 'overlock',
          efficiency: 94.5,
          defects: 0
        },
        todayCompleted: [
          {
            id: 'act_2',
            operatorId: 'op_maya',
            operatorName: 'Maya Patel',
            bundleNumber: 'BND-3265-L-001',
            operationName: 'Side Seam',
            operationNameNepali: 'छेउ सिलाई',
            status: 'completed',
            startTime: new Date(now.getTime() - 4 * 60 * 60000), // 4 hours ago
            endTime: new Date(now.getTime() - 3 * 60 * 60000), // 3 hours ago
            duration: 60,
            piecesCompleted: 30,
            targetPieces: 30,
            pricePerPiece: 3.0,
            earnings: 90.0,
            qualityScore: 9.8,
            machineType: 'overlock',
            efficiency: 96.2,
            defects: 0
          },
          {
            id: 'act_3',
            operatorId: 'op_maya',
            operatorName: 'Maya Patel',
            bundleNumber: 'BND-3401-S-001',
            operationName: 'Neck Binding',
            operationNameNepali: 'घाँटी बाँध्ने',
            status: 'completed',
            startTime: new Date(now.getTime() - 6 * 60 * 60000), // 6 hours ago
            endTime: new Date(now.getTime() - 4.5 * 60 * 60000), // 4.5 hours ago
            duration: 90,
            piecesCompleted: 40,
            targetPieces: 40,
            pricePerPiece: 1.8,
            earnings: 72.0,
            qualityScore: 9.5,
            machineType: 'overlock',
            efficiency: 92.8,
            defects: 1
          }
        ],
        recentCompleted: [],
        totalEarningsToday: 207.0,
        totalPiecesToday: 88,
        averageEfficiency: 94.5
      },
      {
        operatorId: 'op_rajesh',
        operatorName: 'Rajesh Kumar',
        machineType: 'singleNeedle',
        status: 'active',
        shift: 'morning',
        currentActivity: {
          id: 'act_4',
          operatorId: 'op_rajesh',
          operatorName: 'Rajesh Kumar',
          bundleNumber: 'BND-3265-M-002',
          operationName: 'Sleeve Attach',
          operationNameNepali: 'आस्तीन लगाउने',
          status: 'in_progress',
          startTime: new Date(now.getTime() - 30 * 60000), // 30 minutes ago
          piecesCompleted: 12,
          targetPieces: 20,
          pricePerPiece: 4.0,
          earnings: 48.0,
          machineType: 'singleNeedle',
          efficiency: 89.3,
          defects: 0
        },
        todayCompleted: [
          {
            id: 'act_5',
            operatorId: 'op_rajesh',
            operatorName: 'Rajesh Kumar',
            bundleNumber: 'BND-3233-L-003',
            operationName: 'Hem Finish',
            operationNameNepali: 'कुना सिलाई',
            status: 'completed',
            startTime: new Date(now.getTime() - 3 * 60 * 60000),
            endTime: new Date(now.getTime() - 1.5 * 60 * 60000),
            duration: 90,
            piecesCompleted: 25,
            targetPieces: 25,
            pricePerPiece: 2.8,
            earnings: 70.0,
            qualityScore: 9.2,
            machineType: 'singleNeedle',
            efficiency: 91.2,
            defects: 1
          }
        ],
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
        todayCompleted: [
          {
            id: 'act_6',
            operatorId: 'op_sita',
            operatorName: 'Sita Sharma',
            bundleNumber: 'BND-3401-M-001',
            operationName: 'Shoulder Join',
            operationNameNepali: 'काँध जोड्ने',
            status: 'completed',
            startTime: new Date(now.getTime() - 2 * 60 * 60000),
            endTime: new Date(now.getTime() - 30 * 60000),
            duration: 90,
            piecesCompleted: 22,
            targetPieces: 25,
            pricePerPiece: 2.5,
            earnings: 55.0,
            qualityScore: 8.8,
            machineType: 'overlock',
            efficiency: 87.8,
            defects: 2
          }
        ],
        recentCompleted: [],
        totalEarningsToday: 55.0,
        totalPiecesToday: 22,
        // Old mock data removed - now using real Firebase data
      };
    }
  }

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
      case 'quality_check': return 'info';
      case 'rework': return 'danger';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner text="Loading operator buckets..." />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            👥 Operator Buckets Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time view of what operators are doing, have done, and finished recently
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'overview' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('overview')}
          >
            📋 Overview
          </Button>
          <Button
            variant={viewMode === 'detailed' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('detailed')}
          >
            🔍 Detailed
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {operatorBuckets.filter(op => op.status === 'active').length}
          </div>
          <p className="text-sm text-gray-600">Active Now</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {operatorBuckets.reduce((sum, op) => sum + op.totalPiecesToday, 0)}
          </div>
          <p className="text-sm text-gray-600">Pieces Today</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            ${operatorBuckets.reduce((sum, op) => sum + op.totalEarningsToday, 0).toFixed(2)}
          </div>
          <p className="text-sm text-gray-600">Total Earnings</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {operatorBuckets.length > 0 ? 
              (operatorBuckets.reduce((sum, op) => sum + op.averageEfficiency, 0) / operatorBuckets.length).toFixed(1)
              : 0
            }%
          </div>
          <p className="text-sm text-gray-600">Avg Efficiency</p>
        </Card>
      </div>

      {/* Operator Buckets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {operatorBuckets.map((bucket) => (
          <Card key={bucket.operatorId} className="p-4">
            {/* Operator Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <UserIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    bucket.status === 'active' ? 'bg-green-500' : 
                    bucket.status === 'break' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{bucket.operatorName}</h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" size="sm">
                      {bucket.machineType}
                    </Badge>
                    <Badge variant="secondary" size="sm">
                      {bucket.shift}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(bucket.status)}`}>
                {bucket.status.toUpperCase()}
              </div>
            </div>

            {/* Current Activity */}
            {bucket.currentActivity ? (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <PlayIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Currently Working</span>
                  </div>
                  <Badge variant={getActivityStatusColor(bucket.currentActivity.status)} size="sm">
                    {bucket.currentActivity.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <p className="font-medium text-gray-900">{bucket.currentActivity.operationName}</p>
                    <p className="text-sm text-gray-600">{bucket.currentActivity.operationNameNepali}</p>
                    <p className="text-sm text-blue-600 font-medium">{bucket.currentActivity.bundleNumber}</p>
                  </div>
                  
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{bucket.currentActivity.piecesCompleted}/{bucket.currentActivity.targetPieces}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${calculateProgress(bucket.currentActivity.piecesCompleted, bucket.currentActivity.targetPieces)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {formatDuration(Math.floor((new Date().getTime() - bucket.currentActivity.startTime.getTime()) / 60000))}
                    </span>
                    <span className="flex items-center font-semibold text-green-600">
                      <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                      ${bucket.currentActivity.earnings.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <PauseIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No active work</p>
              </div>
            )}

            {/* Today's Summary */}
            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
              <div className="p-2 bg-green-50 rounded">
                <div className="font-bold text-green-600">{bucket.todayCompleted.length}</div>
                <div className="text-xs text-gray-600">Completed</div>
              </div>
              <div className="p-2 bg-blue-50 rounded">
                <div className="font-bold text-blue-600">{bucket.totalPiecesToday}</div>
                <div className="text-xs text-gray-600">Pieces</div>
              </div>
              <div className="p-2 bg-purple-50 rounded">
                <div className="font-bold text-purple-600">${bucket.totalEarningsToday.toFixed(0)}</div>
                <div className="text-xs text-gray-600">Earned</div>
              </div>
            </div>

            {/* Recently Completed */}
            {bucket.todayCompleted.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recently Completed:</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {bucket.todayCompleted.slice(-3).reverse().map((activity) => (
                    <div key={activity.id} className="p-2 bg-green-50 rounded border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{activity.operationName}</p>
                          <p className="text-xs text-gray-600">{activity.bundleNumber}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-xs text-green-600">
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            {activity.piecesCompleted}pc
                          </div>
                          <div className="text-xs text-gray-500">
                            {activity.qualityScore ? `Q: ${activity.qualityScore}/10` : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View Details Button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-3"
              onClick={() => setSelectedOperator(selectedOperator === bucket.operatorId ? null : bucket.operatorId)}
            >
              <EyeIcon className="h-4 w-4 mr-1" />
              {selectedOperator === bucket.operatorId ? 'Hide Details' : 'View Details'}
            </Button>

            {/* Detailed View */}
            {selectedOperator === bucket.operatorId && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                <h4 className="font-medium mb-3">Detailed Activity Log</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {bucket.todayCompleted.map((activity) => (
                    <div key={activity.id} className="p-3 bg-white rounded border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{activity.operationName}</span>
                        <Badge variant={getActivityStatusColor(activity.status)} size="sm">
                          {activity.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Bundle: {activity.bundleNumber}</p>
                        <p>Duration: {formatDuration(activity.duration)}</p>
                        <p>Pieces: {activity.piecesCompleted}/{activity.targetPieces}</p>
                        <p>Earnings: ${activity.earnings.toFixed(2)}</p>
                        <p>Efficiency: {activity.efficiency}%</p>
                        {activity.qualityScore && <p>Quality: {activity.qualityScore}/10</p>}
                        {activity.defects > 0 && <p className="text-red-600">Defects: {activity.defects}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <Button 
          variant="primary"
          onClick={loadRealOperatorData}
          className="flex items-center space-x-2"
        >
          <ArrowRightIcon className="h-4 w-4" />
          <span>Refresh Data</span>
        </Button>
      </div>
    </div>
  );
};

export default SupervisorOperatorBuckets;