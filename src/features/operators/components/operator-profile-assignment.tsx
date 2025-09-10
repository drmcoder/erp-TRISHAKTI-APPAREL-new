// Operator Profile with Assignment Capability
import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { 
  UserIcon,
  ClockIcon,
  CurrencyDollarIcon,
  StarIcon,
  BoltIcon,
  TrophyIcon,
  ChartBarIcon,
  CogIcon,
  PlusIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  HashtagIcon,
  EyeIcon,
  HandRaisedIcon,
  CalendarDaysIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { notify } from '@/utils/notification-utils';

interface OperatorProfileAssignmentProps {
  operatorId?: string;
  userRole: string;
}

interface OperatorProfile {
  id: string;
  name: string;
  employeeId: string;
  photo?: string;
  machineType: string;
  skillLevel: 'beginner' | 'intermediate' | 'expert';
  experience: number; // years
  joinDate: Date;
  specialties: string[];
  efficiency: number;
  qualityScore: number;
  currentWorkload: number;
  maxCapacity: number;
  status: 'available' | 'busy' | 'break' | 'offline';
  shift: 'morning' | 'afternoon' | 'night';
  
  // Performance Metrics
  todayStats: {
    completedOperations: number;
    totalPieces: number;
    earnings: number;
    hoursWorked: number;
    averageTimePerPiece: number;
    defectRate: number;
  };
  
  weeklyStats: {
    totalEarnings: number;
    totalPieces: number;
    averageEfficiency: number;
    completedBundles: number;
  };
  
  // Current Assignments
  currentAssignments: {
    id: string;
    bundleNumber: string;
    operationName: string;
    operationNameNepali: string;
    assignedAt: Date;
    estimatedTime: number;
    progress: number;
    status: 'pending' | 'in_progress' | 'quality_check' | 'completed';
  }[];
  
  // Recent Work History
  recentWork: {
    bundleNumber: string;
    operationName: string;
    completedAt: Date;
    timeSpent: number;
    piecesCompleted: number;
    earnings: number;
    qualityScore: number;
  }[];
}

interface AvailableWork {
  id: string;
  bundleNumber: string;
  operationName: string;
  operationNameNepali: string;
  machineType: string;
  requiredSkill: string;
  timePerPiece: number;
  pricePerPiece: number;
  totalPieces: number;
  estimatedEarnings: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  compatibility: number; // 0-100% match
}

export const OperatorProfileAssignment: React.FC<OperatorProfileAssignmentProps> = ({
  operatorId = 'op_maya',
  userRole
}) => {
  const [operator, setOperator] = useState<OperatorProfile | null>(null);
  const [availableWork, setAvailableWork] = useState<AvailableWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWork, setSelectedWork] = useState<string[]>([]);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'assign-work' | 'performance'>('overview');

  useEffect(() => {
    loadOperatorData();
  }, [operatorId]);

  const loadOperatorData = async () => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock operator data
    const mockOperator: OperatorProfile = {
      id: 'op_maya',
      name: 'Maya Patel',
      employeeId: 'EMP-001',
      machineType: 'overlock',
      skillLevel: 'expert',
      experience: 5,
      joinDate: new Date('2019-03-15'),
      specialties: ['shoulder_join', 'side_seam', 'neck_binding'],
      efficiency: 94.5,
      qualityScore: 9.2,
      currentWorkload: 2,
      maxCapacity: 5,
      status: 'available',
      shift: 'morning',
      
      todayStats: {
        completedOperations: 8,
        totalPieces: 156,
        earnings: 780,
        hoursWorked: 6.5,
        averageTimePerPiece: 2.5,
        defectRate: 0.8
      },
      
      weeklyStats: {
        totalEarnings: 4680,
        totalPieces: 936,
        averageEfficiency: 93.2,
        completedBundles: 24
      },
      
      currentAssignments: [
        {
          id: 'assign_1',
          bundleNumber: 'BND-3233-M-001',
          operationName: 'Shoulder Join',
          operationNameNepali: 'काँध जोड्ने',
          assignedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          estimatedTime: 120, // minutes
          progress: 65,
          status: 'in_progress'
        },
        {
          id: 'assign_2',
          bundleNumber: 'BND-3265-L-002',
          operationName: 'Side Seam',
          operationNameNepali: 'छेउ सिलाई',
          assignedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          estimatedTime: 90,
          progress: 0,
          status: 'pending'
        }
      ],
      
      recentWork: [
        {
          bundleNumber: 'BND-3401-S-001',
          operationName: 'Neck Binding',
          completedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          timeSpent: 85,
          piecesCompleted: 25,
          earnings: 87.50,
          qualityScore: 9.5
        },
        {
          bundleNumber: 'BND-3233-L-003',
          operationName: 'Shoulder Join',
          completedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          timeSpent: 110,
          piecesCompleted: 30,
          earnings: 105.00,
          qualityScore: 9.8
        }
      ]
    };

    // Mock available work
    const mockAvailableWork: AvailableWork[] = [
      {
        id: 'work_1',
        bundleNumber: 'BND-3522-M-001',
        operationName: 'Shoulder Join',
        operationNameNepali: 'काँध जोड्ने',
        machineType: 'overlock',
        requiredSkill: 'shoulder_join',
        timePerPiece: 4.2,
        pricePerPiece: 2.8,
        totalPieces: 25,
        estimatedEarnings: 70,
        priority: 'high',
        compatibility: 98
      },
      {
        id: 'work_2',
        bundleNumber: 'BND-3678-L-002',
        operationName: 'Side Seam',
        operationNameNepali: 'छेउ सिलाई',
        machineType: 'overlock',
        requiredSkill: 'side_seam',
        timePerPiece: 5.1,
        pricePerPiece: 3.2,
        totalPieces: 22,
        estimatedEarnings: 70.40,
        priority: 'urgent',
        compatibility: 96
      },
      {
        id: 'work_3',
        bundleNumber: 'BND-3721-S-001',
        operationName: 'Neck Binding',
        operationNameNepali: 'घाँटी बाँध्ने',
        machineType: 'overlock',
        requiredSkill: 'neck_binding',
        timePerPiece: 3.8,
        pricePerPiece: 2.1,
        totalPieces: 30,
        estimatedEarnings: 63,
        priority: 'normal',
        compatibility: 94
      },
      {
        id: 'work_4',
        bundleNumber: 'BND-3401-XL-003',
        operationName: 'Sleeve Attach',
        operationNameNepali: 'आस्तीन लगाउने',
        machineType: 'singleNeedle',
        requiredSkill: 'sleeve_attach',
        timePerPiece: 6.8,
        pricePerPiece: 4.2,
        totalPieces: 18,
        estimatedEarnings: 75.60,
        priority: 'high',
        compatibility: 35 // Low compatibility - different machine
      }
    ];

    setOperator(mockOperator);
    setAvailableWork(mockAvailableWork.filter(work => work.compatibility >= 80)); // Only show compatible work
    setLoading(false);
  };

  const handleWorkSelection = (workId: string) => {
    setSelectedWork(prev => 
      prev.includes(workId)
        ? prev.filter(id => id !== workId)
        : [...prev, workId]
    );
  };

  const handleAssignWork = async () => {
    if (selectedWork.length === 0) return;

    const selectedWorkItems = availableWork.filter(work => selectedWork.includes(work.id));
    const totalEarnings = selectedWorkItems.reduce((sum, work) => sum + work.estimatedEarnings, 0);

    notify.success(`Assigned ${selectedWork.length} operations to ${operator?.name}\nEstimated earnings: $${totalEarnings.toFixed(2)}`, 'Work Assigned Successfully!');
    
    setSelectedWork([]);
    setShowAssignmentModal(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      case 'normal': return 'info';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'busy': return 'text-blue-600 bg-blue-100';
      case 'break': return 'text-yellow-600 bg-yellow-100';
      case 'offline': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCompatibilityColor = (compatibility: number) => {
    if (compatibility >= 90) return 'text-green-600 bg-green-100';
    if (compatibility >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner text="Loading operator profile..." />
      </div>
    );
  }

  if (!operator) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Operator not found</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {operator.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
              operator.status === 'available' ? 'bg-green-500' : 
              operator.status === 'busy' ? 'bg-blue-500' :
              operator.status === 'break' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{operator.name}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>ID: {operator.employeeId}</span>
              <span>•</span>
              <Badge variant="outline">{operator.machineType}</Badge>
              <span>•</span>
              <Badge variant={operator.skillLevel === 'expert' ? 'success' : operator.skillLevel === 'intermediate' ? 'warning' : 'info'}>
                {operator.skillLevel}
              </Badge>
              <span>•</span>
              <div className={`px-2 py-1 rounded text-xs ${getStatusColor(operator.status)}`}>
                {operator.status.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="primary"
            onClick={() => setActiveTab('assign-work')}
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Assign Work
          </Button>
          <Button variant="outline">
            <EyeIcon className="h-4 w-4 mr-1" />
            View Full History
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {[
            { id: 'overview', label: '📊 Overview', icon: ChartBarIcon },
            { id: 'assignments', label: '📋 Current Work', icon: ClockIcon },
            { id: 'assign-work', label: '➕ Assign New Work', icon: PlusIcon },
            { id: 'performance', label: '🏆 Performance', icon: TrophyIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Info */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Basic Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Experience:</span>
                <span className="font-medium">{operator.experience} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Join Date:</span>
                <span className="font-medium">{operator.joinDate.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shift:</span>
                <span className="font-medium capitalize">{operator.shift}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Efficiency:</span>
                <span className="font-medium text-green-600">{operator.efficiency}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quality Score:</span>
                <span className="font-medium text-blue-600">{operator.qualityScore}/10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Workload:</span>
                <span className="font-medium">{operator.currentWorkload}/{operator.maxCapacity}</span>
              </div>
            </div>
            
            {/* Workload Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Capacity</span>
                <span>{Math.round((operator.currentWorkload / operator.maxCapacity) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full" 
                  style={{ width: `${(operator.currentWorkload / operator.maxCapacity) * 100}%` }}
                ></div>
              </div>
            </div>
          </Card>

          {/* Today's Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <CalendarDaysIcon className="h-5 w-5 mr-2" />
              Today's Performance
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{operator.todayStats.completedOperations}</div>
                <div className="text-sm text-gray-600">Operations</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{operator.todayStats.totalPieces}</div>
                <div className="text-sm text-gray-600">Pieces</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">${operator.todayStats.earnings}</div>
                <div className="text-sm text-gray-600">Earnings</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{operator.todayStats.hoursWorked}h</div>
                <div className="text-sm text-gray-600">Hours</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="text-sm text-gray-600">Average Time per Piece</div>
              <div className="text-lg font-bold text-gray-900">{operator.todayStats.averageTimePerPiece} min</div>
            </div>
          </Card>

          {/* Specialties */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <AcademicCapIcon className="h-5 w-5 mr-2" />
              Skills & Specialties
            </h3>
            <div className="space-y-3">
              {operator.specialties.map((specialty) => (
                <div key={specialty} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium capitalize">{specialty.replace('_', ' ')}</span>
                  <Badge variant="success" size="sm">Expert</Badge>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center mb-2">
                <StarIcon className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="font-medium text-yellow-800">Recommended For:</span>
              </div>
              <div className="text-sm text-yellow-700">
                High-priority overlock operations, especially shoulder joins and side seams
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Current Assignments ({operator.currentAssignments.length})</h3>
            <div className="space-y-4">
              {operator.currentAssignments.map((assignment) => (
                <div key={assignment.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{assignment.operationName}</h4>
                      <p className="text-sm text-gray-600">{assignment.operationNameNepali}</p>
                      <p className="text-sm text-blue-600 font-medium">{assignment.bundleNumber}</p>
                    </div>
                    <Badge variant={assignment.status === 'in_progress' ? 'info' : assignment.status === 'completed' ? 'success' : 'secondary'}>
                      {assignment.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{assignment.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${assignment.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Assigned: {assignment.assignedAt.toLocaleString()}</span>
                    <span>Est. Time: {assignment.estimatedTime} min</span>
                  </div>
                </div>
              ))}
              
              {operator.currentAssignments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <ClockIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No current assignments</p>
                  <Button
                    variant="primary"
                    className="mt-4"
                    onClick={() => setActiveTab('assign-work')}
                  >
                    Assign New Work
                  </Button>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Completed Work</h3>
            <div className="space-y-3">
              {operator.recentWork.map((work, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <p className="font-medium text-gray-900">{work.operationName}</p>
                    <p className="text-sm text-gray-600">{work.bundleNumber}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">${work.earnings}</div>
                    <div className="text-xs text-gray-500">{work.piecesCompleted} pieces</div>
                    <div className="text-xs text-gray-500">Quality: {work.qualityScore}/10</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'assign-work' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Available Work for {operator.name}</h3>
            {selectedWork.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{selectedWork.length} selected</span>
                <Button
                  variant="primary"
                  onClick={handleAssignWork}
                >
                  Assign Selected Work
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableWork.map((work) => (
              <Card 
                key={work.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedWork.includes(work.id)
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'hover:shadow-lg hover:ring-1 hover:ring-gray-300'
                }`}
                onClick={() => handleWorkSelection(work.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <HashtagIcon className="h-4 w-4 text-gray-500" />
                  <div className="flex items-center space-x-2">
                    <Badge variant={getPriorityColor(work.priority)}>
                      {work.priority}
                    </Badge>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getCompatibilityColor(work.compatibility)}`}>
                      {work.compatibility}% match
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900">{work.operationName}</h4>
                  <p className="text-sm text-gray-600">{work.operationNameNepali}</p>
                  <p className="text-sm text-blue-600 font-medium">{work.bundleNumber}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Machine:</span>
                    <Badge variant="outline" size="sm">{work.machineType}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pieces:</span>
                    <span className="font-medium">{work.totalPieces}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rate:</span>
                    <span className="font-medium">${work.pricePerPiece}/pc</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. Time:</span>
                    <span className="font-medium">{Math.round(work.timePerPiece * work.totalPieces)} min</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Est. Earnings:</span>
                    <span className="text-lg font-bold text-green-600">${work.estimatedEarnings}</span>
                  </div>
                </div>

                {selectedWork.includes(work.id) && (
                  <div className="mt-3 flex items-center justify-center text-blue-600">
                    <CheckCircleIcon className="h-5 w-5 mr-1" />
                    <span className="text-sm font-medium">Selected</span>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {availableWork.length === 0 && (
            <Card className="p-8 text-center">
              <HandRaisedIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No compatible work available for this operator</p>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Weekly Performance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">${operator.weeklyStats.totalEarnings}</div>
                <div className="text-sm text-gray-600">Total Earnings</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{operator.weeklyStats.totalPieces}</div>
                <div className="text-sm text-gray-600">Total Pieces</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{operator.weeklyStats.averageEfficiency}%</div>
                <div className="text-sm text-gray-600">Avg Efficiency</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{operator.weeklyStats.completedBundles}</div>
                <div className="text-sm text-gray-600">Completed Bundles</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Insights</h3>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center mb-2">
                  <TrophyIcon className="h-5 w-5 text-green-600 mr-2" />
                  <span className="font-medium text-green-800">Top Performer</span>
                </div>
                <p className="text-sm text-green-700">
                  Consistently exceeds efficiency targets and maintains high quality standards.
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center mb-2">
                  <StarIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-800">Specialty Expert</span>
                </div>
                <p className="text-sm text-blue-700">
                  Best suited for complex shoulder join and side seam operations.
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center mb-2">
                  <BoltIcon className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="font-medium text-purple-800">High Capacity</span>
                </div>
                <p className="text-sm text-purple-700">
                  Can handle up to {operator.maxCapacity} concurrent operations efficiently.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OperatorProfileAssignment;