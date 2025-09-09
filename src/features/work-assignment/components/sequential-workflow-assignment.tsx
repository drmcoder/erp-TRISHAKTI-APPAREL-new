// Sequential Workflow Assignment - Only shows operations when prerequisites are completed
import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { 
  UserIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  LockClosedIcon,
  ArrowRightIcon,
  BoltIcon,
  HashtagIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  PlayIcon,
  PauseIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';

interface SequentialWorkflowAssignmentProps {
  userRole: string;
}

interface WorkflowOperation {
  id: string;
  name: string;
  nameNepali: string;
  sequenceOrder: number;
  machineType: string;
  requiredSkill: string;
  timePerPiece: number;
  pricePerPiece: number;
  status: 'locked' | 'available' | 'assigned' | 'in_progress' | 'completed';
  prerequisites: string[]; // Array of operation IDs that must be completed first
  dependents: string[]; // Array of operation IDs that depend on this operation
  assignedTo?: string;
  assignedOperatorName?: string;
  startedAt?: Date;
  completedAt?: Date;
  estimatedDuration: number; // in minutes
  actualDuration?: number;
}

interface ProductionBundle {
  id: string;
  bundleNumber: string;
  articleNumber: string;
  articleStyle: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  totalPieces: number;
  operations: WorkflowOperation[];
  currentStage: number; // Index of current operation in sequence
  overallProgress: number; // 0-100%
  estimatedCompletionTime: Date;
  actualStartTime?: Date;
}

interface OperatorInfo {
  id: string;
  name: string;
  machineType: string;
  skillLevel: 'beginner' | 'intermediate' | 'expert';
  status: 'available' | 'busy' | 'break' | 'offline';
  currentWorkload: number;
  specialties: string[];
  efficiency: number;
}

export const SequentialWorkflowAssignment: React.FC<SequentialWorkflowAssignmentProps> = ({
  userRole
}) => {
  const [bundles, setBundles] = useState<ProductionBundle[]>([]);
  const [operators, setOperators] = useState<OperatorInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);
  const [showWorkflowDetails, setShowWorkflowDetails] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    loadSequentialWorkflowData();
  }, []);

  const loadSequentialWorkflowData = async () => {
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data with proper sequential workflow
    const mockBundles: ProductionBundle[] = [
      {
        id: 'bundle_1',
        bundleNumber: 'BND-3233-M-001',
        articleNumber: '3233',
        articleStyle: 'Adult T-Shirt',
        priority: 'high',
        totalPieces: 25,
        currentStage: 1, // Currently on operation 1 (0-indexed)
        overallProgress: 30,
        estimatedCompletionTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
        actualStartTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // Started 2 hours ago
        operations: [
          {
            id: 'op_1_cutting',
            name: 'Pattern Cutting',
            nameNepali: 'ढाँचा काट्ने',
            sequenceOrder: 1,
            machineType: 'cutting',
            requiredSkill: 'cutting',
            timePerPiece: 2.0,
            pricePerPiece: 1.5,
            status: 'completed',
            prerequisites: [],
            dependents: ['op_2_shoulder', 'op_3_side_seam'],
            assignedTo: 'op_cutter_1',
            assignedOperatorName: 'Cutting Operator',
            startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            completedAt: new Date(Date.now() - 90 * 60 * 1000), // Completed 1.5 hours ago
            estimatedDuration: 50,
            actualDuration: 48
          },
          {
            id: 'op_2_shoulder',
            name: 'Shoulder Join',
            nameNepali: 'काँध जोड्ने',
            sequenceOrder: 2,
            machineType: 'overlock',
            requiredSkill: 'shoulder_join',
            timePerPiece: 4.5,
            pricePerPiece: 2.8,
            status: 'in_progress', // Currently being worked on
            prerequisites: ['op_1_cutting'],
            dependents: ['op_4_sleeve', 'op_5_collar'],
            assignedTo: 'op_maya',
            assignedOperatorName: 'Maya Patel',
            startedAt: new Date(Date.now() - 60 * 60 * 1000), // Started 1 hour ago
            estimatedDuration: 112
          },
          {
            id: 'op_3_side_seam',
            name: 'Side Seam',
            nameNepali: 'छेउ सिलाई',
            sequenceOrder: 3,
            machineType: 'overlock',
            requiredSkill: 'side_seam',
            timePerPiece: 5.0,
            pricePerPiece: 3.2,
            status: 'available', // Available because cutting is complete - CAN BE DONE IN PARALLEL
            prerequisites: ['op_1_cutting'],
            dependents: ['op_6_hem'],
            estimatedDuration: 125
          },
          {
            id: 'op_4_sleeve',
            name: 'Sleeve Attach',
            nameNepali: 'आस्तीन लगाउने',
            sequenceOrder: 4,
            machineType: 'singleNeedle',
            requiredSkill: 'sleeve_attach',
            timePerPiece: 7.0,
            pricePerPiece: 4.5,
            status: 'locked', // Locked because shoulder join not complete
            prerequisites: ['op_2_shoulder'],
            dependents: ['op_7_quality'],
            estimatedDuration: 175
          },
          {
            id: 'op_5_collar',
            name: 'Collar Attach',
            nameNepali: 'कलर लगाउने',
            sequenceOrder: 5,
            machineType: 'singleNeedle',
            requiredSkill: 'collar_attach',
            timePerPiece: 6.2,
            pricePerPiece: 4.0,
            status: 'locked', // Locked because shoulder join not complete
            prerequisites: ['op_2_shoulder'],
            dependents: ['op_7_quality'],
            estimatedDuration: 155
          },
          {
            id: 'op_6_hem',
            name: 'Hem Finish',
            nameNepali: 'हेम समाप्त',
            sequenceOrder: 6,
            machineType: 'singleNeedle',
            requiredSkill: 'hem_finish',
            timePerPiece: 3.8,
            pricePerPiece: 2.5,
            status: 'locked', // Locked because side seam not complete
            prerequisites: ['op_3_side_seam'],
            dependents: ['op_7_quality'],
            estimatedDuration: 95
          },
          {
            id: 'op_7_quality',
            name: 'Quality Check',
            nameNepali: 'गुणस्तर जाँच',
            sequenceOrder: 7,
            machineType: 'manual',
            requiredSkill: 'quality_check',
            timePerPiece: 2.5,
            pricePerPiece: 1.8,
            status: 'locked', // Locked until all sewing operations complete
            prerequisites: ['op_4_sleeve', 'op_5_collar', 'op_6_hem'],
            dependents: [],
            estimatedDuration: 62
          }
        ]
      },
      {
        id: 'bundle_2',
        bundleNumber: 'BND-3265-L-002',
        articleNumber: '3265',
        articleStyle: 'Ladies Blouse',
        priority: 'normal',
        totalPieces: 22,
        currentStage: 0, // Just started
        overallProgress: 100, // Cutting completed, ready for sewing
        estimatedCompletionTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
        operations: [
          {
            id: 'op2_1_cutting',
            name: 'Pattern Cutting',
            nameNepali: 'ढाँचा काट्ने',
            sequenceOrder: 1,
            machineType: 'cutting',
            requiredSkill: 'cutting',
            timePerPiece: 2.2,
            pricePerPiece: 1.5,
            status: 'completed',
            prerequisites: [],
            dependents: ['op2_2_shoulder', 'op2_3_dart'],
            completedAt: new Date(Date.now() - 30 * 60 * 1000),
            estimatedDuration: 48,
            actualDuration: 45
          },
          {
            id: 'op2_2_shoulder',
            name: 'Shoulder Join',
            nameNepali: 'काँध जोड्ने',
            sequenceOrder: 2,
            machineType: 'overlock',
            requiredSkill: 'shoulder_join',
            timePerPiece: 4.2,
            pricePerPiece: 2.6,
            status: 'available', // Available for assignment
            prerequisites: ['op2_1_cutting'],
            dependents: ['op2_4_sleeve'],
            estimatedDuration: 92
          },
          {
            id: 'op2_3_dart',
            name: 'Dart Sewing',
            nameNepali: 'डार्ट सिलाई',
            sequenceOrder: 3,
            machineType: 'singleNeedle',
            requiredSkill: 'dart_sewing',
            timePerPiece: 3.5,
            pricePerPiece: 2.2,
            status: 'available', // Available for assignment
            prerequisites: ['op2_1_cutting'],
            dependents: ['op2_4_sleeve'],
            estimatedDuration: 77
          },
          {
            id: 'op2_4_sleeve',
            name: 'Sleeve Attach',
            nameNepali: 'आस्तीन लगाउने',
            sequenceOrder: 4,
            machineType: 'singleNeedle',
            requiredSkill: 'sleeve_attach',
            timePerPiece: 6.8,
            pricePerPiece: 4.2,
            status: 'locked', // Locked until shoulder and dart complete
            prerequisites: ['op2_2_shoulder', 'op2_3_dart'],
            dependents: [],
            estimatedDuration: 149
          }
        ]
      }
    ];

    const mockOperators: OperatorInfo[] = [
      {
        id: 'op_maya',
        name: 'Maya Patel',
        machineType: 'overlock',
        skillLevel: 'expert',
        status: 'busy', // Currently working on shoulder join
        currentWorkload: 1,
        specialties: ['shoulder_join', 'side_seam'],
        efficiency: 94
      },
      {
        id: 'op_rajesh',
        name: 'Rajesh Kumar',
        machineType: 'singleNeedle',
        skillLevel: 'expert',
        status: 'available',
        currentWorkload: 0,
        specialties: ['sleeve_attach', 'hem_finish', 'dart_sewing'],
        efficiency: 91
      },
      {
        id: 'op_sita',
        name: 'Sita Sharma',
        machineType: 'overlock',
        skillLevel: 'intermediate',
        status: 'available',
        currentWorkload: 0,
        specialties: ['side_seam', 'shoulder_join'],
        efficiency: 87
      }
    ];

    setBundles(mockBundles);
    setOperators(mockOperators);
    setLoading(false);
  };

  const getOperationStatusInfo = (operation: WorkflowOperation) => {
    switch (operation.status) {
      case 'locked':
        return {
          icon: LockClosedIcon,
          color: 'text-red-600 bg-red-100 border-red-200',
          label: 'Locked - Prerequisites Required'
        };
      case 'available':
        return {
          icon: CheckCircleIcon,
          color: 'text-green-600 bg-green-100 border-green-200',
          label: 'Available for Assignment'
        };
      case 'assigned':
        return {
          icon: UserIcon,
          color: 'text-blue-600 bg-blue-100 border-blue-200',
          label: 'Assigned - Ready to Start'
        };
      case 'in_progress':
        return {
          icon: PlayIcon,
          color: 'text-purple-600 bg-purple-100 border-purple-200',
          label: 'In Progress'
        };
      case 'completed':
        return {
          icon: CheckCircleIcon,
          color: 'text-green-600 bg-green-100 border-green-200',
          label: 'Completed'
        };
      default:
        return {
          icon: XCircleIcon,
          color: 'text-gray-600 bg-gray-100 border-gray-200',
          label: 'Unknown Status'
        };
    }
  };

  const getPrerequisiteInfo = (operation: WorkflowOperation, bundle: ProductionBundle) => {
    if (operation.prerequisites.length === 0) return null;

    const prerequisites = operation.prerequisites.map(preReqId => 
      bundle.operations.find(op => op.id === preReqId)
    ).filter(Boolean);

    const completedPrereqs = prerequisites.filter(preReq => preReq?.status === 'completed');
    const pendingPrereqs = prerequisites.filter(preReq => preReq?.status !== 'completed');

    return {
      total: prerequisites.length,
      completed: completedPrereqs.length,
      pending: pendingPrereqs,
      isReady: pendingPrereqs.length === 0
    };
  };

  const handleAssignOperation = async (bundleId: string, operationId: string, operatorId: string) => {
    const bundle = bundles.find(b => b.id === bundleId);
    const operation = bundle?.operations.find(op => op.id === operationId);
    const operator = operators.find(op => op.id === operatorId);

    if (!bundle || !operation || !operator) return;

    // Check if operation is available for assignment
    if (operation.status !== 'available') {
      alert(`❌ Cannot assign ${operation.name}!\n\nOperation status: ${operation.status}\n\nOnly operations with 'available' status can be assigned.`);
      return;
    }

    // Check machine compatibility
    if (operator.machineType !== operation.machineType) {
      alert(`❌ Machine Type Mismatch!\n\nOperation "${operation.name}" requires: ${operation.machineType}\n${operator.name} operates: ${operator.machineType}`);
      return;
    }

    // Check skill compatibility
    if (!operator.specialties.includes(operation.requiredSkill)) {
      alert(`❌ Skill Mismatch!\n\nOperation "${operation.name}" requires: ${operation.requiredSkill}\n${operator.name} specializes in: ${operator.specialties.join(', ')}`);
      return;
    }

    // Assign the operation
    setBundles(prev => prev.map(b => 
      b.id === bundleId 
        ? {
            ...b,
            operations: b.operations.map(op => 
              op.id === operationId 
                ? {
                    ...op,
                    status: 'assigned',
                    assignedTo: operatorId,
                    assignedOperatorName: operator.name
                  }
                : op
            )
          }
        : b
    ));

    setOperators(prev => prev.map(op => 
      op.id === operatorId 
        ? { ...op, currentWorkload: op.currentWorkload + 1, status: 'busy' }
        : op
    ));

    alert(`✅ Assignment Successful!\n\n${operation.name} → ${operator.name}\nBundle: ${bundle.bundleNumber}`);
  };

  const simulateOperationCompletion = (bundleId: string, operationId: string) => {
    setBundles(prev => prev.map(bundle => {
      if (bundle.id !== bundleId) return bundle;

      const updatedOperations = bundle.operations.map(op => {
        if (op.id === operationId && op.status === 'in_progress') {
          return {
            ...op,
            status: 'completed' as const,
            completedAt: new Date(),
            actualDuration: op.estimatedDuration + Math.floor(Math.random() * 20 - 10) // +/- 10 minutes
          };
        }
        return op;
      });

      // Unlock dependent operations
      const completedOp = updatedOperations.find(op => op.id === operationId);
      if (completedOp) {
        completedOp.dependents.forEach(depId => {
          const depOperation = updatedOperations.find(op => op.id === depId);
          if (depOperation && depOperation.status === 'locked') {
            // Check if all prerequisites are now complete
            const allPrereqsComplete = depOperation.prerequisites.every(preReqId => {
              const preReq = updatedOperations.find(op => op.id === preReqId);
              return preReq?.status === 'completed';
            });

            if (allPrereqsComplete) {
              depOperation.status = 'available';
            }
          }
        });
      }

      return {
        ...bundle,
        operations: updatedOperations
      };
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner text="Loading sequential workflow..." />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            🔄 Sequential Workflow Assignment
          </h1>
          <p className="text-gray-600 mt-2">
            Operations are unlocked only when prerequisites are completed. Maintain proper production sequence.
          </p>
        </div>

        {/* Workflow Legend */}
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <h3 className="font-semibold text-yellow-900 mb-3">📋 Workflow Status Guide:</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <LockClosedIcon className="h-4 w-4 text-red-600" />
              <span className="text-red-800">🔒 Locked - Prerequisites needed</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
              <span className="text-green-800">✅ Available - Ready to assign</span>
            </div>
            <div className="flex items-center space-x-2">
              <UserIcon className="h-4 w-4 text-blue-600" />
              <span className="text-blue-800">👤 Assigned - Ready to start</span>
            </div>
            <div className="flex items-center space-x-2">
              <PlayIcon className="h-4 w-4 text-purple-600" />
              <span className="text-purple-800">▶️ In Progress - Working</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
              <span className="text-green-800">✅ Completed - Finished</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Bundles with Sequential Operations */}
      <div className="space-y-6">
        {bundles.map((bundle) => (
          <Card key={bundle.id} className="p-6">
            {/* Bundle Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <HashtagIcon className="h-5 w-5 mr-2 text-blue-600" />
                    {bundle.bundleNumber}
                  </h2>
                  <p className="text-gray-600">{bundle.articleStyle} - {bundle.totalPieces} pieces</p>
                </div>
                <Badge className={getPriorityColor(bundle.priority)}>
                  {bundle.priority.toUpperCase()}
                </Badge>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-1">Overall Progress</div>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full" 
                      style={{ width: `${bundle.overallProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{bundle.overallProgress}%</span>
                </div>
              </div>
            </div>

            {/* Operation Sequence Workflow */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Production Sequence:</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWorkflowDetails(prev => ({
                    ...prev,
                    [bundle.id]: !prev[bundle.id]
                  }))}
                >
                  <EyeIcon className="h-4 w-4 mr-1" />
                  {showWorkflowDetails[bundle.id] ? 'Hide Details' : 'Show Details'}
                </Button>
              </div>

              {/* Operations grouped by parallel possibility */}
              <div className="space-y-4">
                {/* Group operations by their dependencies to show parallel possibilities */}
                {(() => {
                  const groupedOperations = bundle.operations
                    .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
                    .reduce((groups: {[key: string]: typeof bundle.operations}, op) => {
                      const key = op.prerequisites.join(',') || 'initial';
                      if (!groups[key]) groups[key] = [];
                      groups[key].push(op);
                      return groups;
                    }, {});

                  return Object.entries(groupedOperations).map(([prereqKey, operations]) => (
                    <div key={prereqKey} className="space-y-3">
                      {/* Group Header for Parallel Operations */}
                      {operations.length > 1 && (
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="h-px bg-blue-300 flex-1"></div>
                          <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            ⚡ {operations.length} operations can be done in PARALLEL
                            {prereqKey !== 'initial' && ` (after ${prereqKey.split(',').length} prerequisite${prereqKey.split(',').length > 1 ? 's' : ''})`}
                          </div>
                          <div className="h-px bg-blue-300 flex-1"></div>
                        </div>
                      )}
                      
                      {/* Operations in this parallel group */}
                      <div className={operations.length > 1 ? 'grid grid-cols-1 lg:grid-cols-2 gap-4 ml-4' : 'space-y-3'}>
                        {operations.map((operation, index) => {
                    const statusInfo = getOperationStatusInfo(operation);
                    const StatusIcon = statusInfo.icon;
                    const prereqInfo = getPrerequisiteInfo(operation, bundle);
                    const availableOperators = operators.filter(op => 
                      op.machineType === operation.machineType &&
                      op.specialties.includes(operation.requiredSkill) &&
                      op.status === 'available'
                    );

                    return (
                      <div
                        key={operation.id}
                        className={`p-4 border rounded-lg transition-all ${
                          operation.status === 'available' 
                            ? 'border-green-300 bg-green-50 shadow-sm' 
                            : operation.status === 'in_progress'
                            ? 'border-purple-300 bg-purple-50 shadow-sm'
                            : operation.status === 'completed'
                            ? 'border-green-400 bg-green-100 shadow-sm'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-sm">
                                {operation.sequenceOrder}
                              </div>
                              <StatusIcon className={`h-5 w-5 ${statusInfo.color.split(' ')[0]}`} />
                            </div>
                            
                            <div>
                              <h4 className="font-semibold text-gray-900">{operation.name}</h4>
                              <p className="text-sm text-gray-600">{operation.nameNepali}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="text-xs">
                              {operation.machineType}
                            </Badge>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                              {statusInfo.label}
                            </div>
                          </div>
                        </div>

                        {/* Operation Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">Time/piece:</span>
                            <span className="ml-2 font-medium">{operation.timePerPiece} min</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Price/piece:</span>
                            <span className="ml-2 font-medium text-green-600">${operation.pricePerPiece}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Total earnings:</span>
                            <span className="ml-2 font-medium text-green-600">
                              ${(operation.pricePerPiece * bundle.totalPieces).toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Est. duration:</span>
                            <span className="ml-2 font-medium">{operation.estimatedDuration} min</span>
                          </div>
                        </div>

                        {/* Prerequisites Info */}
                        {prereqInfo && (
                          <div className="mb-3 p-3 bg-white rounded border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Prerequisites:</span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                prereqInfo.isReady ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {prereqInfo.completed}/{prereqInfo.total} Complete
                              </span>
                            </div>
                            
                            {!prereqInfo.isReady && (
                              <div className="space-y-1">
                                <p className="text-xs text-red-600 font-medium">⚠️ Waiting for:</p>
                                {prereqInfo.pending.map(pendingOp => (
                                  <div key={pendingOp!.id} className="text-xs text-red-600 ml-4">
                                    • {pendingOp!.name} (Step {pendingOp!.sequenceOrder})
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Assignment Section */}
                        {operation.status === 'available' && (
                          <div className="border-t pt-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-green-800">✅ Ready for Assignment</p>
                                <p className="text-xs text-gray-600">
                                  {availableOperators.length} compatible operators available
                                </p>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                {availableOperators.slice(0, 3).map(operator => (
                                  <Button
                                    key={operator.id}
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleAssignOperation(bundle.id, operation.id, operator.id)}
                                    className="text-xs"
                                  >
                                    Assign to {operator.name}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Current Assignment Info */}
                        {operation.assignedOperatorName && (
                          <div className="border-t pt-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <UserIcon className="h-4 w-4 text-blue-600" />
                                <span className="text-sm">
                                  Assigned to: <strong>{operation.assignedOperatorName}</strong>
                                </span>
                                {operation.startedAt && (
                                  <span className="text-xs text-gray-500">
                                    Started: {operation.startedAt.toLocaleTimeString()}
                                  </span>
                                )}
                              </div>
                              
                              {operation.status === 'in_progress' && (
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => simulateOperationCompletion(bundle.id, operation.id)}
                                >
                                  ✅ Mark Complete
                                </Button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Completion Info */}
                        {operation.completedAt && (
                          <div className="border-t pt-3 text-sm">
                            <div className="flex items-center justify-between text-green-800">
                              <span>✅ Completed: {operation.completedAt.toLocaleString()}</span>
                              {operation.actualDuration && (
                                <span>Duration: {operation.actualDuration} min</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Parallel Operation Indicator */}
                        {operations.length > 1 && (
                          <div className="absolute top-2 right-2">
                            <div className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                              ⚡ Parallel OK
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Bundle Actions */}
            <div className="mt-6 pt-4 border-t flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Stage {bundle.currentStage + 1} of {bundle.operations.length} operations
              </div>
              <div className="text-sm text-gray-600">
                Est. completion: {bundle.estimatedCompletionTime.toLocaleString()}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Available Operators Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Available Operators</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {operators.filter(op => op.status === 'available').map(operator => (
            <div key={operator.id} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{operator.name}</h4>
                <Badge variant={operator.skillLevel === 'expert' ? 'success' : 'warning'} size="sm">
                  {operator.skillLevel}
                </Badge>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Machine: {operator.machineType}</p>
                <p>Skills: {operator.specialties.join(', ')}</p>
                <p>Efficiency: {operator.efficiency}%</p>
                <p>Workload: {operator.currentWorkload} active</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default SequentialWorkflowAssignment;