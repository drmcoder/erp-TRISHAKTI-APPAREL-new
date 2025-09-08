// Self-Assignment Interface for Operators
// Allows operators to browse and request work assignments

import React, { useState, useMemo } from 'react';
import {
  MagnifyingGlassIcon,
  ClockIcon,
  CpuChipIcon,
  StarIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  SparklesIcon,
  ChartBarIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline';
import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { EmptyState } from '@/shared/components/empty-state';
import {
  useAvailableWorkItems,
  useAssignmentRecommendations,
  useCreateAssignmentRequest,
  useOperatorAssignments
} from '../hooks/use-work-assignments';
import type {
  WorkItem
} from '../types';
import {
  WORK_PRIORITIES,
  MACHINE_OPERATIONS
} from '../types';

interface SelfAssignmentInterfaceProps {
  operatorId: string;
  operatorName: string;
  operatorSkills: {
    skillLevel: string;
    machineTypes: string[];
    primaryMachine: string;
    specializations?: string[];
  };
  maxConcurrentWork: number;
  onRequestSubmitted?: (workItemId: string) => void;
}

interface WorkItemWithScore extends WorkItem {
  recommendationScore?: number;
  recommendationReasons?: string[];
  estimatedCompletion?: Date;
  compatibilityLevel: 'perfect' | 'good' | 'acceptable' | 'challenging';
  isRecommended?: boolean;
}

export const SelfAssignmentInterface: React.FC<SelfAssignmentInterfaceProps> = ({
  operatorId,
  operatorName,
  operatorSkills,
  maxConcurrentWork,
  onRequestSubmitted
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'recommended' | 'compatible'>('all');
  const [showRequestModal, setShowRequestModal] = useState<string | null>(null);
  const [requestReason, setRequestReason] = useState('');
  
  // Fetch available work items
  const { 
    data: availableWorkResult, 
    isLoading: loadingWork 
  } = useAvailableWorkItems(operatorId);

  // Fetch AI recommendations
  const { 
    data: recommendationsResult, 
    isLoading: loadingRecommendations 
  } = useAssignmentRecommendations(operatorId);

  // Fetch current assignments
  const { data: currentAssignmentsResult } = useOperatorAssignments(operatorId);

  // Create assignment request mutation
  const createRequestMutation = useCreateAssignmentRequest();

  const availableWork = availableWorkResult?.success ? availableWorkResult.data || [] : [];
  const recommendations = recommendationsResult?.success ? recommendationsResult.data || [] : [];
  const currentAssignments = currentAssignmentsResult?.success ? currentAssignmentsResult.data?.items || [] : [];

  // Merge work items with recommendations and compatibility analysis
  const workItemsWithScores = useMemo<WorkItemWithScore[]>(() => {
    return availableWork.map(workItem => {
      const recommendation = recommendations.find(rec => rec.id === workItem.id);
      const compatibility = analyzeCompatibility(workItem, operatorSkills);
      
      return {
        ...workItem,
        recommendationScore: recommendation?.recommendationScore,
        recommendationReasons: recommendation?.recommendationReasons,
        estimatedCompletion: recommendation?.estimatedCompletion,
        compatibilityLevel: compatibility.level,
        isRecommended: !!recommendation && recommendation.recommendationScore > 75
      };
    });
  }, [availableWork, recommendations, operatorSkills]);

  // Filter and search work items
  const filteredWorkItems = useMemo(() => {
    let filtered = workItemsWithScores;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.operation.toLowerCase().includes(term) ||
        item.machineType.toLowerCase().includes(term) ||
        item.bundleId.toLowerCase().includes(term)
      );
    }

    // Filter by type
    switch (filterBy) {
      case 'recommended':
        filtered = filtered.filter(item => item.isRecommended);
        break;
      case 'compatible':
        filtered = filtered.filter(item => 
          item.compatibilityLevel === 'perfect' || item.compatibilityLevel === 'good'
        );
        break;
      default:
        // Show all
        break;
    }

    // Sort by recommendation score, then by compatibility
    return filtered.sort((a, b) => {
      if (a.isRecommended && !b.isRecommended) return -1;
      if (!a.isRecommended && b.isRecommended) return 1;
      
      const scoreA = a.recommendationScore || 0;
      const scoreB = b.recommendationScore || 0;
      if (scoreA !== scoreB) return scoreB - scoreA;

      const compatibilityOrder = { perfect: 4, good: 3, acceptable: 2, challenging: 1 };
      return compatibilityOrder[b.compatibilityLevel] - compatibilityOrder[a.compatibilityLevel];
    });
  }, [workItemsWithScores, searchTerm, filterBy]);

  // Handle assignment request
  const handleRequestAssignment = async (workItem: WorkItemWithScore) => {
    try {
      await createRequestMutation.mutateAsync({
        workItemId: workItem.id!,
        operatorId,
        reason: requestReason || `Self-assignment request for ${workItem.operation}`
      });
      
      setShowRequestModal(null);
      setRequestReason('');
      onRequestSubmitted?.(workItem.id!);
    } catch (error) {
      console.error('Failed to create assignment request:', error);
    }
  };

  // Analyze compatibility between work item and operator
  function analyzeCompatibility(workItem: WorkItem, skills: typeof operatorSkills): {
    level: 'perfect' | 'good' | 'acceptable' | 'challenging';
    reasons: string[];
  } {
    const reasons: string[] = [];
    let score = 0;

    // Machine compatibility
    if (skills.primaryMachine === workItem.machineType) {
      score += 30;
      reasons.push('Primary machine match');
    } else if (skills.machineTypes.includes(workItem.machineType)) {
      score += 20;
      reasons.push('Machine compatible');
    } else {
      score -= 20;
      reasons.push('Machine type mismatch');
    }

    // Skill level compatibility
    const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    const operatorLevel = skillLevels.indexOf(skills.skillLevel);
    const requiredLevel = skillLevels.indexOf(workItem.skillLevelRequired);

    if (operatorLevel >= requiredLevel) {
      score += 25;
      if (operatorLevel === requiredLevel) {
        reasons.push('Perfect skill level match');
      } else {
        reasons.push('Overqualified (good for quality)');
      }
    } else {
      score -= 15;
      reasons.push('Requires higher skill level');
    }

    // Specialization match
    if (skills.specializations?.length) {
      const operationCategory = getOperationCategory(workItem.operation);
      if (skills.specializations.includes(operationCategory)) {
        score += 15;
        reasons.push('Specialization match');
      }
    }

    // Determine level based on score
    if (score >= 60) return { level: 'perfect', reasons };
    if (score >= 40) return { level: 'good', reasons };
    if (score >= 20) return { level: 'acceptable', reasons };
    return { level: 'challenging', reasons };
  }

  // Get operation category for specialization matching
  function getOperationCategory(operation: string): string {
    const op = operation.toLowerCase();
    if (op.includes('cut')) return 'cutting';
    if (op.includes('sew') || op.includes('stitch')) return 'sewing';
    if (op.includes('embroi')) return 'embroidery';
    if (op.includes('finish') || op.includes('press')) return 'finishing';
    return 'general';
  }

  // Get compatibility styling
  const getCompatibilityStyle = (level: string) => {
    switch (level) {
      case 'perfect':
        return 'border-green-500 bg-green-50';
      case 'good':
        return 'border-blue-500 bg-blue-50';
      case 'acceptable':
        return 'border-yellow-500 bg-yellow-50';
      case 'challenging':
        return 'border-red-500 bg-red-50';
      default:
        return 'border-gray-200';
    }
  };

  // Check if operator can take more work
  const canTakeMoreWork = currentAssignments.length < maxConcurrentWork;

  if (loadingWork || loadingRecommendations) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Available Work</h2>
          <p className="text-gray-600">
            Browse and request work assignments • {operatorName}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge variant={canTakeMoreWork ? 'success' : 'warning'}>
            {currentAssignments.length}/{maxConcurrentWork} assignments
          </Badge>
        </div>
      </div>

      {/* Workload Warning */}
      {!canTakeMoreWork && (
        <Card className="p-4 border-orange-200 bg-orange-50">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-orange-800 font-medium">At Maximum Capacity</p>
              <p className="text-orange-700 text-sm">
                You're currently assigned to {currentAssignments.length} work items. 
                Complete some assignments to take on new work.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by operation, machine type, or bundle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex space-x-2">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Work ({workItemsWithScores.length})</option>
              <option value="recommended">
                🌟 Recommended ({workItemsWithScores.filter(w => w.isRecommended).length})
              </option>
              <option value="compatible">
                ✅ Compatible ({workItemsWithScores.filter(w => w.compatibilityLevel === 'perfect' || w.compatibilityLevel === 'good').length})
              </option>
            </select>
          </div>
        </div>
      </Card>

      {/* Work Items Grid */}
      <div>
        {filteredWorkItems.length === 0 ? (
          <EmptyState
            icon={ChartBarIcon}
            title="No work items found"
            description={
              searchTerm || filterBy !== 'all'
                ? "Try adjusting your search or filters"
                : "No work items are currently available for self-assignment"
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkItems.map((workItem) => (
              <Card
                key={workItem.id}
                className={`p-4 transition-all duration-200 hover:shadow-md ${
                  getCompatibilityStyle(workItem.compatibilityLevel)
                } ${workItem.isRecommended ? 'ring-2 ring-blue-400' : ''}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-900">{workItem.operation}</h4>
                    {workItem.isRecommended && (
                      <SparklesIcon className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  
                  <Badge variant={workItem.isRecommended ? 'primary' : 'secondary'} className="text-xs">
                    {workItem.compatibilityLevel}
                  </Badge>
                </div>

                {/* Work Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <CpuChipIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{workItem.machineType}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {workItem.skillLevelRequired}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{workItem.estimatedDuration}min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CurrencyRupeeIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900 font-medium">
                        ₹{(workItem.ratePerPiece * workItem.targetPieces).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Bundle: {workItem.bundleId}</span>
                    <span className="text-gray-600">{workItem.targetPieces} pieces</span>
                  </div>
                </div>

                {/* AI Recommendation Info */}
                {workItem.isRecommended && workItem.recommendationReasons && (
                  <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded">
                    <div className="flex items-center space-x-1 mb-1">
                      <SparklesIcon className="h-3 w-3 text-blue-600" />
                      <span className="text-xs font-medium text-blue-800">AI Recommendation</span>
                      <Badge variant="primary" className="text-xs">
                        {workItem.recommendationScore}% match
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {workItem.recommendationReasons.slice(0, 2).map((reason, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Compatibility Analysis */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {analyzeCompatibility(workItem, operatorSkills).reasons.slice(0, 3).map((reason, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className={`text-xs ${
                          reason.includes('mismatch') || reason.includes('higher skill') 
                            ? 'text-red-600 border-red-300' 
                            : 'text-green-600 border-green-300'
                        }`}
                      >
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Estimated Completion */}
                {workItem.estimatedCompletion && (
                  <div className="mb-4 text-xs text-gray-600">
                    <span>Est. completion: {workItem.estimatedCompletion.toLocaleDateString()}</span>
                  </div>
                )}

                {/* Action Button */}
                <Button
                  onClick={() => setShowRequestModal(workItem.id!)}
                  disabled={!canTakeMoreWork || createRequestMutation.isPending}
                  className="w-full"
                  variant={workItem.isRecommended ? 'default' : 'outline'}
                >
                  {!canTakeMoreWork ? 'At Capacity' : 'Request Assignment'}
                </Button>

                {/* Blocked indicator */}
                {workItem.isBlocked && (
                  <div className="mt-2 flex items-center space-x-1 text-red-600">
                    <ExclamationTriangleIcon className="h-3 w-3" />
                    <span className="text-xs">Blocked: {workItem.blockingReason}</span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Assignment Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Request Assignment</h3>
              <Button
                variant="ghost"
                onClick={() => setShowRequestModal(null)}
                className="p-1"
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Request assignment for this work item? Your request will be reviewed by a supervisor.
              </p>
              
              <div className="bg-gray-50 p-3 rounded border">
                <p className="font-medium text-gray-900">
                  {filteredWorkItems.find(w => w.id === showRequestModal)?.operation}
                </p>
                <p className="text-sm text-gray-600">
                  {filteredWorkItems.find(w => w.id === showRequestModal)?.machineType} • 
                  {filteredWorkItems.find(w => w.id === showRequestModal)?.targetPieces} pieces
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason (optional)
              </label>
              <Input
                placeholder="Why do you want this assignment?"
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
              />
            </div>

            <div className="flex space-x-3">
              <Button
                variant="ghost"
                onClick={() => setShowRequestModal(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const workItem = filteredWorkItems.find(w => w.id === showRequestModal)!;
                  handleRequestAssignment(workItem);
                }}
                disabled={createRequestMutation.isPending}
                className="flex-1"
              >
                {createRequestMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Submitting...</span>
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};