// Workflow Sequencer Component
// Handles dependency-based operation sequencing with parallel/sequential logic

import React, { useState, useMemo } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import {
  ArrowRightIcon,
  ClockIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

export interface WorkflowOperation {
  id: string;
  operationCode: string;
  operationName: string;
  SAM: number;
  machineType: string;
  skillRequired: string;
  dependencies: string[];
  canRunParallel: string[];
  status: 'pending' | 'ready' | 'in_progress' | 'completed' | 'blocked';
}

export interface ExecutionGroup {
  groupNumber: number;
  operations: WorkflowOperation[];
  type: 'sequential' | 'parallel';
  estimatedTime: number;
  actualTime?: number;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface ExecutionPlan {
  groups: ExecutionGroup[];
  totalEstimatedTime: number;
  criticalPath: string[];
  parallelizationRatio: number;
}

interface WorkflowSequencerProps {
  operations: WorkflowOperation[];
  onExecutePlan?: (plan: ExecutionPlan) => void;
  onUpdateOperationStatus?: (operationId: string, status: string) => void;
}

export const WorkflowSequencer: React.FC<WorkflowSequencerProps> = ({
  operations,
  onExecutePlan,
  onUpdateOperationStatus
}) => {
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null);
  
  // Generate execution plan using dependency analysis
  const executionPlan = useMemo((): ExecutionPlan => {
    return generateExecutionPlan(operations);
  }, [operations]);

  return (
    <div className="space-y-6">
      {/* Plan Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Workflow Execution Plan</h2>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {executionPlan.groups.length} Groups
            </Badge>
            <Badge variant="secondary">
              {Math.round(executionPlan.parallelizationRatio * 100)}% Parallel
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{operations.length}</div>
            <div className="text-sm text-gray-600">Total Operations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 flex items-center justify-center">
              <ClockIcon className="h-5 w-5 mr-1" />
              {executionPlan.totalEstimatedTime}
            </div>
            <div className="text-sm text-gray-600">Minutes (Optimized)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{executionPlan.groups.length}</div>
            <div className="text-sm text-gray-600">Execution Groups</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{executionPlan.criticalPath.length}</div>
            <div className="text-sm text-gray-600">Critical Path Ops</div>
          </div>
        </div>

        {onExecutePlan && (
          <div className="mt-4 pt-4 border-t">
            <Button 
              onClick={() => onExecutePlan(executionPlan)}
              className="flex items-center space-x-2"
            >
              <PlayIcon className="h-4 w-4" />
              <span>Execute Workflow</span>
            </Button>
          </div>
        )}
      </Card>

      {/* Execution Groups */}
      <div className="space-y-4">
        {executionPlan.groups.map((group, groupIndex) => (
          <Card key={group.groupNumber} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Badge variant={group.type === 'parallel' ? 'default' : 'secondary'}>
                  Group {group.groupNumber}
                </Badge>
                <Badge variant="outline">
                  {group.type === 'parallel' ? 'Parallel' : 'Sequential'}
                </Badge>
                <div className="text-sm text-gray-600">
                  {group.estimatedTime} minutes
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {group.status === 'completed' && (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                )}
                {group.status === 'in_progress' && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                )}
              </div>
            </div>

            {group.type === 'parallel' ? (
              // Parallel operations layout
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.operations.map((operation) => (
                  <OperationCard
                    key={operation.id}
                    operation={operation}
                    isSelected={selectedOperation === operation.id}
                    onClick={() => setSelectedOperation(operation.id)}
                    onStatusChange={onUpdateOperationStatus}
                    isCriticalPath={executionPlan.criticalPath.includes(operation.id)}
                  />
                ))}
              </div>
            ) : (
              // Sequential operations layout
              <div className="flex flex-wrap items-center gap-2">
                {group.operations.map((operation, opIndex) => (
                  <React.Fragment key={operation.id}>
                    <OperationCard
                      operation={operation}
                      isSelected={selectedOperation === operation.id}
                      onClick={() => setSelectedOperation(operation.id)}
                      onStatusChange={onUpdateOperationStatus}
                      isCriticalPath={executionPlan.criticalPath.includes(operation.id)}
                      compact
                    />
                    {opIndex < group.operations.length - 1 && (
                      <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Critical Path Visualization */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 mr-2" />
          Critical Path Analysis
        </h3>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-orange-800">
            The critical path determines the minimum time needed to complete all operations. 
            Delays in critical path operations will delay the entire workflow.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {executionPlan.criticalPath.map((operationId, index) => {
            const operation = operations.find(op => op.id === operationId);
            if (!operation) return null;

            return (
              <React.Fragment key={operationId}>
                <Badge variant="destructive" className="cursor-pointer">
                  {operation.operationName} ({operation.SAM}m)
                </Badge>
                {index < executionPlan.criticalPath.length - 1 && (
                  <ArrowRightIcon className="h-4 w-4 text-red-500" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

// Operation Card Component
interface OperationCardProps {
  operation: WorkflowOperation;
  isSelected: boolean;
  onClick: () => void;
  onStatusChange?: (operationId: string, status: string) => void;
  isCriticalPath: boolean;
  compact?: boolean;
}

const OperationCard: React.FC<OperationCardProps> = ({
  operation,
  isSelected,
  onClick,
  onStatusChange,
  isCriticalPath,
  compact = false
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-50 border-green-200 text-green-800';
      case 'in_progress': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'ready': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'blocked': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
      case 'ready': return <PlayIcon className="h-4 w-4 text-yellow-600" />;
      case 'blocked': return <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />;
      default: return <CogIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div
      className={`
        border rounded-lg p-3 cursor-pointer transition-all
        ${getStatusColor(operation.status)}
        ${isSelected ? 'ring-2 ring-blue-500' : ''}
        ${isCriticalPath ? 'border-l-4 border-l-red-500' : ''}
        ${compact ? 'min-w-0' : 'min-w-[200px]'}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getStatusIcon(operation.status)}
          <span className={`font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
            {operation.operationName}
          </span>
        </div>
        {isCriticalPath && (
          <Badge variant="destructive" className="text-xs">
            Critical
          </Badge>
        )}
      </div>

      {!compact && (
        <>
          <div className="text-xs text-gray-600 mb-2">
            {operation.operationCode} • {operation.machineType}
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span>{operation.SAM} min</span>
            <Badge variant="outline" className="text-xs">
              {operation.skillRequired}
            </Badge>
          </div>

          {operation.dependencies.length > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              Depends on: {operation.dependencies.join(', ')}
            </div>
          )}
        </>
      )}

      {onStatusChange && (
        <div className="mt-2 flex space-x-1">
          {['ready', 'in_progress', 'completed'].map((status) => (
            <button
              key={status}
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(operation.id, status);
              }}
              className={`
                text-xs px-2 py-1 rounded
                ${operation.status === status 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
              `}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Execution plan generation algorithm
function generateExecutionPlan(operations: WorkflowOperation[]): ExecutionPlan {
  const groups: ExecutionGroup[] = [];
  const processedOperations = new Set<string>();
  const operationMap = new Map(operations.map(op => [op.id, op]));
  
  let groupNumber = 1;
  let totalTime = 0;

  while (processedOperations.size < operations.length) {
    const readyOperations = operations.filter(op => 
      !processedOperations.has(op.id) &&
      op.dependencies.every(depId => processedOperations.has(depId))
    );

    if (readyOperations.length === 0) break; // Prevent infinite loop

    // Group operations that can run in parallel
    const parallelGroups = groupOperationsForParallel(readyOperations);
    
    parallelGroups.forEach(groupOps => {
      const canRunParallel = groupOps.length > 1 && 
        groupOps.every((op, i) => 
          groupOps.slice(i + 1).every(otherOp => 
            canOperationsRunParallel(op, otherOp, operationMap)
          )
        );

      const groupTime = canRunParallel 
        ? Math.max(...groupOps.map(op => op.SAM))
        : groupOps.reduce((sum, op) => sum + op.SAM, 0);

      groups.push({
        groupNumber: groupNumber++,
        operations: groupOps,
        type: canRunParallel ? 'parallel' : 'sequential',
        estimatedTime: groupTime,
        status: 'pending'
      });

      totalTime += groupTime;
      groupOps.forEach(op => processedOperations.add(op.id));
    });
  }

  const criticalPath = findCriticalPath(operations);
  const parallelizationRatio = calculateParallelizationRatio(groups);

  return {
    groups,
    totalEstimatedTime: totalTime,
    criticalPath,
    parallelizationRatio
  };
}

function groupOperationsForParallel(operations: WorkflowOperation[]): WorkflowOperation[][] {
  if (operations.length <= 1) return [operations];
  
  const groups: WorkflowOperation[][] = [];
  const used = new Set<string>();

  operations.forEach(op => {
    if (used.has(op.id)) return;

    const parallelOps = [op];
    used.add(op.id);

    // Find operations that can run in parallel with this one
    operations.forEach(otherOp => {
      if (used.has(otherOp.id)) return;
      
      if (op.canRunParallel.includes(otherOp.id) || 
          otherOp.canRunParallel.includes(op.id) ||
          (op.machineType !== otherOp.machineType && 
           !op.dependencies.includes(otherOp.id) && 
           !otherOp.dependencies.includes(op.id))) {
        parallelOps.push(otherOp);
        used.add(otherOp.id);
      }
    });

    groups.push(parallelOps);
  });

  return groups;
}

function canOperationsRunParallel(
  op1: WorkflowOperation, 
  op2: WorkflowOperation, 
  operationMap: Map<string, WorkflowOperation>
): boolean {
  // Check explicit parallel declarations
  if (op1.canRunParallel.includes(op2.id) || op2.canRunParallel.includes(op1.id)) {
    return true;
  }

  // Check dependencies
  if (op1.dependencies.includes(op2.id) || op2.dependencies.includes(op1.id)) {
    return false;
  }

  // Check machine conflicts (same machine type usually can't run in parallel)
  if (op1.machineType === op2.machineType && op1.machineType !== 'Manual') {
    return false;
  }

  return true;
}

function findCriticalPath(operations: WorkflowOperation[]): string[] {
  // Simplified critical path calculation
  // In a real implementation, this would use proper CPM algorithm
  const operationMap = new Map(operations.map(op => [op.id, op]));
  const visited = new Set<string>();
  const path: string[] = [];

  function dfs(operationId: string): number {
    if (visited.has(operationId)) return 0;
    
    const operation = operationMap.get(operationId);
    if (!operation) return 0;
    
    visited.add(operationId);
    
    const maxDepTime = Math.max(
      0,
      ...operation.dependencies.map(depId => dfs(depId))
    );
    
    return maxDepTime + operation.SAM;
  }

  // Find the operation with the longest path
  let maxTime = 0;
  let criticalOp = '';
  
  operations.forEach(op => {
    visited.clear();
    const time = dfs(op.id);
    if (time > maxTime) {
      maxTime = time;
      criticalOp = op.id;
    }
  });

  // Reconstruct path (simplified)
  function buildPath(operationId: string) {
    const operation = operationMap.get(operationId);
    if (!operation) return;
    
    path.unshift(operationId);
    
    // Find the dependency with the longest path
    let maxDepTime = 0;
    let nextOp = '';
    
    operation.dependencies.forEach(depId => {
      visited.clear();
      const time = dfs(depId);
      if (time > maxDepTime) {
        maxDepTime = time;
        nextOp = depId;
      }
    });
    
    if (nextOp) buildPath(nextOp);
  }

  if (criticalOp) buildPath(criticalOp);
  
  return path;
}

function calculateParallelizationRatio(groups: ExecutionGroup[]): number {
  const parallelGroups = groups.filter(g => g.type === 'parallel').length;
  return groups.length > 0 ? parallelGroups / groups.length : 0;
}