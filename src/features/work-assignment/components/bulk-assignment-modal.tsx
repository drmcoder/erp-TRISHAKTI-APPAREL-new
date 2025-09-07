// Bulk Assignment Modal Component
// Modal for assigning multiple work bundles to operators efficiently

import React, { useState, useMemo } from 'react';
import {
  XMarkIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/input';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/Badge';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import {
  useWorkBundles,
  useOperators,
  useBulkAssignWork,
  useAssignmentRecommendations
} from '../hooks/use-work-assignments';
import type {
  WorkBundle,
  OperatorSummary,
  AssignWorkData
} from '../types';
import {
  WORK_PRIORITIES
} from '../types';

interface BulkAssignmentModalProps {
  selectedBundles: string[];
  onClose: () => void;
  onComplete: () => void;
}

interface AssignmentPlan {
  bundleId: string;
  workItemId: string;
  operatorId: string;
  estimatedStartTime: Date;
  estimatedCompletionTime: Date;
  confidence: number;
  reasons: string[];
}

export const BulkAssignmentModal: React.FC<BulkAssignmentModalProps> = ({
  selectedBundles,
  onClose,
  onComplete
}) => {
  const [assignmentMode, setAssignmentMode] = useState<'auto' | 'manual'>('auto');
  const [selectedOperators, setSelectedOperators] = useState<string[]>([]);
  const [assignmentPlans, setAssignmentPlans] = useState<AssignmentPlan[]>([]);
  const [isGeneratingPlans, setIsGeneratingPlans] = useState(false);
  const [searchOperator, setSearchOperator] = useState('');
  
  // Fetch data
  const { data: bundlesResult } = useWorkBundles();
  const { data: operatorsResult } = useOperators();
  const bulkAssignMutation = useBulkAssignWork();

  const bundles = bundlesResult?.success ? bundlesResult.data?.items || [] : [];
  const operators = operatorsResult?.success ? operatorsResult.data || [] : [];
  
  const selectedBundleData = bundles.filter(b => selectedBundles.includes(b.id!));

  // Filter operators based on search
  const filteredOperators = useMemo(() => {
    if (!searchOperator) return operators;
    return operators.filter(op => 
      op.name.toLowerCase().includes(searchOperator.toLowerCase()) ||
      op.employeeId.toLowerCase().includes(searchOperator.toLowerCase())
    );
  }, [operators, searchOperator]);

  // Available operators (those not at capacity)
  const availableOperators = useMemo(() => {
    return filteredOperators.filter(op => {
      // This would check current workload vs capacity
      return op.currentStatus === 'idle' || op.currentStatus === 'working';
    });
  }, [filteredOperators]);

  // Generate automatic assignment plans
  const generateAutoAssignments = async () => {
    setIsGeneratingPlans(true);
    
    try {
      const plans: AssignmentPlan[] = [];
      
      for (const bundle of selectedBundleData) {
        for (const workItem of bundle.workItems) {
          // Find best operator for this work item
          const suitableOperators = availableOperators.filter(op => {
            // Check machine compatibility
            const canOperate = op.machineTypes.includes(workItem.machineType) ||
                             op.primaryMachine === workItem.machineType;
            
            // Check skill level
            const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
            const operatorSkillIndex = skillLevels.indexOf(op.skillLevel);
            const requiredSkillIndex = skillLevels.indexOf(workItem.skillLevelRequired);
            const hasSkill = operatorSkillIndex >= requiredSkillIndex;
            
            return canOperate && hasSkill;
          });

          if (suitableOperators.length > 0) {
            // Score operators based on efficiency, availability, and workload
            const scoredOperators = suitableOperators.map(op => {
              let score = op.efficiency * 100; // Base efficiency score
              
              // Bonus for primary machine match
              if (op.primaryMachine === workItem.machineType) {
                score += 10;
              }
              
              // Bonus for higher skill level
              const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
              const skillBonus = skillLevels.indexOf(op.skillLevel) * 5;
              score += skillBonus;
              
              // Penalty for current workload (simulated)
              const currentWorkload = 2; // This would come from real data
              score -= currentWorkload * 5;
              
              return { operator: op, score };
            });

            // Sort by score and pick the best
            scoredOperators.sort((a, b) => b.score - a.score);
            const bestOperator = scoredOperators[0].operator;
            
            // Calculate estimated timeline
            const estimatedStartTime = new Date();
            estimatedStartTime.setHours(estimatedStartTime.getHours() + plans.length);
            
            const estimatedCompletionTime = new Date(estimatedStartTime);
            estimatedCompletionTime.setMinutes(
              estimatedCompletionTime.getMinutes() + workItem.estimatedDuration
            );

            plans.push({
              bundleId: bundle.id!,
              workItemId: workItem.id!,
              operatorId: bestOperator.id,
              estimatedStartTime,
              estimatedCompletionTime,
              confidence: Math.min(95, scoredOperators[0].score),
              reasons: [
                `${Math.round(bestOperator.efficiency * 100)}% efficiency`,
                op.primaryMachine === workItem.machineType ? 'Primary machine match' : 'Machine compatible',
                `${bestOperator.skillLevel} skill level`
              ]
            });
          }
        }
      }
      
      setAssignmentPlans(plans);
    } finally {
      setIsGeneratingPlans(false);
    }
  };

  // Manual assignment - assign selected operators to work items
  const generateManualAssignments = () => {
    const plans: AssignmentPlan[] = [];
    let operatorIndex = 0;

    for (const bundle of selectedBundleData) {
      for (const workItem of bundle.workItems) {
        if (selectedOperators.length === 0) break;
        
        const operatorId = selectedOperators[operatorIndex % selectedOperators.length];
        const operator = operators.find(op => op.id === operatorId);
        
        if (operator) {
          const estimatedStartTime = new Date();
          estimatedStartTime.setHours(estimatedStartTime.getHours() + plans.length);
          
          const estimatedCompletionTime = new Date(estimatedStartTime);
          estimatedCompletionTime.setMinutes(
            estimatedCompletionTime.getMinutes() + workItem.estimatedDuration
          );

          plans.push({
            bundleId: bundle.id!,
            workItemId: workItem.id!,
            operatorId,
            estimatedStartTime,
            estimatedCompletionTime,
            confidence: 75, // Default confidence for manual assignments
            reasons: ['Manually selected operator']
          });
        }
        
        operatorIndex++;
      }
    }
    
    setAssignmentPlans(plans);
  };

  // Execute bulk assignment
  const executeBulkAssignment = async () => {
    if (assignmentPlans.length === 0) return;

    const assignments: AssignWorkData[] = assignmentPlans.map(plan => ({
      workItemId: plan.workItemId,
      operatorId: plan.operatorId,
      assignmentMethod: 'supervisor_assigned' as const,
      estimatedStartTime: plan.estimatedStartTime,
      estimatedCompletionTime: plan.estimatedCompletionTime,
      notes: `Bulk assignment - Confidence: ${plan.confidence}%`
    }));

    try {
      const result = await bulkAssignMutation.mutateAsync(assignments);
      
      if (result.success) {
        onComplete();
      }
    } catch (error) {
      console.error('Bulk assignment failed:', error);
    }
  };

  // Toggle operator selection
  const toggleOperatorSelection = (operatorId: string) => {
    setSelectedOperators(prev => 
      prev.includes(operatorId) 
        ? prev.filter(id => id !== operatorId)
        : [...prev, operatorId]
    );
  };

  // Calculate total statistics
  const totalWorkItems = selectedBundleData.reduce((sum, bundle) => sum + bundle.workItems.length, 0);
  const totalEstimatedHours = assignmentPlans.reduce((sum, plan) => {
    const duration = (plan.estimatedCompletionTime.getTime() - plan.estimatedStartTime.getTime()) / (1000 * 60 * 60);
    return sum + duration;
  }, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Bulk Work Assignment</h2>
            <p className="text-gray-600">
              Assign {selectedBundles.length} bundle(s) with {totalWorkItems} work items
            </p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <XMarkIcon className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Assignment Mode Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Method</h3>
            <div className="grid grid-cols-2 gap-4">
              <Card
                className={`p-4 cursor-pointer border-2 ${
                  assignmentMode === 'auto' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setAssignmentMode('auto')}
              >
                <div className="flex items-center space-x-3">
                  <ChartBarIcon className="h-6 w-6 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Auto Assignment</h4>
                    <p className="text-sm text-gray-600">AI-powered optimal assignment</p>
                  </div>
                </div>
              </Card>

              <Card
                className={`p-4 cursor-pointer border-2 ${
                  assignmentMode === 'manual' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setAssignmentMode('manual')}
              >
                <div className="flex items-center space-x-3">
                  <UserGroupIcon className="h-6 w-6 text-green-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Manual Selection</h4>
                    <p className="text-sm text-gray-600">Choose specific operators</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Manual Operator Selection */}
          {assignmentMode === 'manual' && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Operators</h3>
              
              {/* Operator Search */}
              <div className="mb-4">
                <Input
                  placeholder="Search operators..."
                  value={searchOperator}
                  onChange={(e) => setSearchOperator(e.target.value)}
                  className="max-w-md"
                />
              </div>

              {/* Operator List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                {availableOperators.map((operator) => (
                  <Card
                    key={operator.id}
                    className={`p-3 cursor-pointer border ${
                      selectedOperators.includes(operator.id) 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleOperatorSelection(operator.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{operator.name}</p>
                        <p className="text-xs text-gray-500">{operator.employeeId}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {operator.skillLevel}
                          </Badge>
                          <span className="text-xs text-green-600">
                            {Math.round(operator.efficiency * 100)}%
                          </span>
                        </div>
                      </div>
                      {selectedOperators.includes(operator.id) && (
                        <CheckCircleIcon className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              <div className="mt-4">
                <Button
                  onClick={generateManualAssignments}
                  disabled={selectedOperators.length === 0}
                  className="w-full"
                >
                  Generate Assignment Plan ({selectedOperators.length} operators)
                </Button>
              </div>
            </div>
          )}

          {/* Auto Assignment */}
          {assignmentMode === 'auto' && assignmentPlans.length === 0 && (
            <div className="mb-6 text-center">
              <Button
                onClick={generateAutoAssignments}
                disabled={isGeneratingPlans}
                className="w-full max-w-md"
              >
                {isGeneratingPlans ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Generating Optimal Assignments...</span>
                  </>
                ) : (
                  'Generate Auto Assignments'
                )}
              </Button>
            </div>
          )}

          {/* Assignment Plans */}
          {assignmentPlans.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Assignment Plan</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{assignmentPlans.length} assignments</span>
                  <span>{Math.round(totalEstimatedHours * 10) / 10}h total</span>
                  <Badge variant="primary">
                    {Math.round(assignmentPlans.reduce((sum, p) => sum + p.confidence, 0) / assignmentPlans.length)}% avg confidence
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {assignmentPlans.map((plan, index) => {
                  const bundle = selectedBundleData.find(b => b.id === plan.bundleId);
                  const workItem = bundle?.workItems.find(w => w.id === plan.workItemId);
                  const operator = operators.find(o => o.id === plan.operatorId);

                  if (!bundle || !workItem || !operator) return null;

                  return (
                    <Card key={index} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {bundle.bundleNumber} → {operator.name}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-gray-600">
                              <CpuChipIcon className="h-3 w-3" />
                              <span>{workItem.operation}</span>
                              <span>•</span>
                              <ClockIcon className="h-3 w-3" />
                              <span>{workItem.estimatedDuration}min</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Badge
                            variant={plan.confidence > 80 ? 'success' : plan.confidence > 60 ? 'warning' : 'error'}
                            className="text-xs"
                          >
                            {plan.confidence}% confidence
                          </Badge>
                          <div className="text-xs text-gray-500">
                            {plan.estimatedStartTime.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1">
                        {plan.reasons.map((reason, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {assignmentPlans.length > 0 && (
              <span>Ready to assign {assignmentPlans.length} work items</span>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            
            <Button
              onClick={executeBulkAssignment}
              disabled={assignmentPlans.length === 0 || bulkAssignMutation.isPending}
              className="min-w-[120px]"
            >
              {bulkAssignMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Assigning...</span>
                </>
              ) : (
                'Execute Assignment'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};