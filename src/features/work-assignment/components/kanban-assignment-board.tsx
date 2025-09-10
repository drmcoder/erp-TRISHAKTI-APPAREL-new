// Kanban Assignment Board - Visual workflow management
import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { useI18n } from '@/shared/hooks/useI18n';
import { 
  UserIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PlusIcon,
  EyeIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import EnhancedBundleService from '@/services/enhanced-bundle-service';
import type { BundleOperation, ProductionBundle } from '@/shared/types/bundle-types';

interface KanbanColumn {
  id: string;
  title: string;
  titleNepali: string;
  color: string;
  operations: (BundleOperation & { bundleInfo: ProductionBundle })[];
}

interface OperatorProfile {
  id: string;
  name: string;
  machineType: string;
  efficiency: number;
  currentWorkload: number;
  status: 'available' | 'busy' | 'break';
}

interface KanbanAssignmentBoardProps {
  userRole: string;
}

export const KanbanAssignmentBoard: React.FC<KanbanAssignmentBoardProps> = ({
  userRole
}) => {
  const { currentLocale } = useI18n();
  const [loading, setLoading] = useState(true);
  const [operators, setOperators] = useState<OperatorProfile[]>([]);
  const [selectedOperation, setSelectedOperation] = useState<(BundleOperation & { bundleInfo: ProductionBundle }) | null>(null);
  const [draggedOperation, setDraggedOperation] = useState<string | null>(null);

  // Kanban columns representing workflow stages
  const [columns, setColumns] = useState<KanbanColumn[]>([
    {
      id: 'pending',
      title: 'Pending Assignment',
      titleNepali: 'असाइनमेन्ट बाँकी',
      color: 'bg-gray-50 border-gray-200',
      operations: []
    },
    {
      id: 'assigned',
      title: 'Assigned',
      titleNepali: 'असाइन गरिएको',
      color: 'bg-blue-50 border-blue-200',
      operations: []
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      titleNepali: 'चलिरहेको',
      color: 'bg-yellow-50 border-yellow-200',
      operations: []
    },
    {
      id: 'completed',
      title: 'Completed',
      titleNepali: 'सकिएको',
      color: 'bg-green-50 border-green-200',
      operations: []
    }
  ]);

  useEffect(() => {
    loadKanbanData();
  }, []);

  const loadKanbanData = async () => {
    setLoading(true);
    try {
      const [operationsResponse, operatorsResponse] = await Promise.all([
        EnhancedBundleService.getPendingOperations({ limit: 20 }),
        EnhancedBundleService.getAvailableOperators()
      ]);

      if (operationsResponse.success && operationsResponse.data) {
        // Distribute operations across columns based on status
        const newColumns = [...columns];
        newColumns[0].operations = operationsResponse.data; // All start in pending
        setColumns(newColumns);
      }

      if (operatorsResponse.success && operatorsResponse.data) {
        setOperators(operatorsResponse.data);
      }
    } catch (error) {
      console.error('Failed to load kanban data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get operation name in current language
  const getOperationName = (operation: BundleOperation) => {
    return currentLocale === 'ne' ? (operation.nameNepali || operation.name) : operation.name;
  };

  const getColumnTitle = (column: KanbanColumn) => {
    return currentLocale === 'ne' ? column.titleNepali : column.title;
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, operationId: string) => {
    setDraggedOperation(operationId);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    if (!draggedOperation) return;

    // Find the operation and move it to target column
    let draggedOp: (BundleOperation & { bundleInfo: ProductionBundle }) | null = null;
    let sourceColumnIndex = -1;

    const newColumns = columns.map((col, index) => {
      const operationIndex = col.operations.findIndex(op => op.id === draggedOperation);
      if (operationIndex !== -1) {
        draggedOp = col.operations[operationIndex];
        sourceColumnIndex = index;
        return {
          ...col,
          operations: col.operations.filter(op => op.id !== draggedOperation)
        };
      }
      return col;
    });

    // Add to target column
    if (draggedOp) {
      const targetColumnIndex = newColumns.findIndex(col => col.id === targetColumnId);
      if (targetColumnIndex !== -1) {
        newColumns[targetColumnIndex].operations.push(draggedOp);
      }
    }

    setColumns(newColumns);
    setDraggedOperation(null);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Assign operation to operator
  const handleAssignToOperator = (operation: BundleOperation & { bundleInfo: ProductionBundle }, operator: OperatorProfile) => {
    // Move operation from pending to assigned
    const newColumns = columns.map(col => {
      if (col.id === 'pending') {
        return {
          ...col,
          operations: col.operations.filter(op => op.id !== operation.id)
        };
      }
      if (col.id === 'assigned') {
        return {
          ...col,
          operations: [...col.operations, { ...operation, assignedTo: operator.name }]
        };
      }
      return col;
    });

    setColumns(newColumns);
    setSelectedOperation(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner label="Loading Kanban board..." />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-full overflow-x-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            📋 Kanban Assignment Board
          </h1>
          <p className="text-gray-600 mt-1">
            Visual workflow management - drag operations between columns
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="px-3 py-1">
            {operators.length} Operators Available
          </Badge>
          <Button size="sm" onClick={loadKanbanData}>
            🔄 Refresh
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
          <h3 className="font-semibold text-blue-900">How to Use Kanban Board:</h3>
        </div>
        <div className="text-blue-800 text-sm space-y-1">
          <p>• <strong>Drag operations</strong> between columns to update their status</p>
          <p>• <strong>Click on an operation</strong> to assign it to an operator</p>
          <p>• <strong>Move left to right:</strong> Pending → Assigned → In Progress → Completed</p>
        </div>
      </Card>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-96">
        {columns.map((column) => (
          <Card 
            key={column.id}
            className={`p-4 ${column.color} border-2 border-dashed`}
            onDrop={(e) => handleDrop(e, column.id)}
            onDragOver={handleDragOver}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                {getColumnTitle(column)}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {column.operations.length}
              </Badge>
            </div>

            {/* Operations in Column */}
            <div className="space-y-3">
              {column.operations.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-sm">No operations</p>
                </div>
              ) : (
                column.operations.map((operation) => (
                  <Card 
                    key={operation.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, operation.id)}
                    onClick={() => setSelectedOperation(operation)}
                    className={`p-3 cursor-move hover:shadow-lg transition-all ${
                      draggedOperation === operation.id ? 'opacity-50' : ''
                    } ${selectedOperation?.id === operation.id ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="space-y-3">
                      {/* Header with Operation Name & Assignment */}
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {getOperationName(operation)}
                        </h4>
                        {operation.assignedTo && (
                          <Badge variant="outline" className="text-xs">
                            👤 {operation.assignedTo}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Bundle & Batch Info */}
                      <div className="space-y-1">
                        <div className="text-xs text-gray-800 font-medium">
                          📦 <strong>{operation.bundleInfo.bundleNumber}</strong>
                        </div>
                        <div className="text-xs text-gray-600">
                          🏷️ Batch: {operation.bundleInfo.batchNumber || 'B001'} • {operation.bundleInfo.quantity || 50} pieces
                        </div>
                      </div>
                      
                      {/* Time & Money Details */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center text-gray-600">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            {operation.smvMinutes}min/piece
                          </div>
                          <div className="flex items-center text-blue-600 font-medium">
                            ⏱️ Total: {Math.round((operation.bundleInfo.quantity || 50) * operation.smvMinutes / 60)}h
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center text-green-600 font-medium">
                            <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                            ${operation.pricePerPiece}/piece
                          </div>
                          <div className="flex items-center text-green-700 font-bold">
                            💰 ${((operation.bundleInfo.quantity || 50) * operation.pricePerPiece).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Last Work Done By */}
                      <div className="bg-gray-50 p-2 rounded text-xs">
                        <div className="text-gray-700 font-medium mb-1">🔍 Last Done By:</div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">👷 Maya Patel</span>
                          <span className="text-yellow-600">⭐ 9.2/10</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-gray-500">📅 2 days ago</span>
                          <span className="text-blue-600">⚡ 94% efficiency</span>
                        </div>
                      </div>

                      {/* Requirements & Priority */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Badge variant="outline" className="text-xs">
                            🔧 {operation.machineType}
                          </Badge>
                          <Badge 
                            variant={operation.bundleInfo.priority === 'high' ? 'destructive' : 
                                   operation.bundleInfo.priority === 'urgent' ? 'destructive' : 'secondary'} 
                            className="text-xs"
                          >
                            {operation.bundleInfo.priority === 'high' ? '🔥 HIGH' : 
                             operation.bundleInfo.priority === 'urgent' ? '⚡ URGENT' : 
                             operation.bundleInfo.priority === 'low' ? '📋 LOW' : '➖ NORMAL'}
                          </Badge>
                        </div>
                      </div>

                      {/* Due Date & Actions */}
                      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                        <span className="text-xs text-gray-500">
                          📅 Due: {operation.bundleInfo.dueDate ? 
                            new Date(operation.bundleInfo.dueDate).toLocaleDateString() : 'Today'
                          }
                        </span>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" title="View Details">
                            <EyeIcon className="h-3 w-3" />
                          </Button>
                          {column.id === 'assigned' && (
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" title="Start Work">
                              <PlayIcon className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Operator Assignment Panel */}
      {selectedOperation && (
        <Card className="p-4 bg-green-50 border-green-200 border-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-green-900">Assign Operation to Operator</h3>
              <p className="text-sm text-green-800">
                Selected: <strong>{getOperationName(selectedOperation)}</strong> - {selectedOperation.bundleInfo.bundleNumber}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedOperation(null)}
              className="text-green-700"
            >
              ✕ Cancel
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {operators
              .filter(op => op.status === 'available' && op.machineType === selectedOperation.machineType)
              .map((operator) => (
                <Card 
                  key={operator.id}
                  className="p-3 cursor-pointer hover:shadow-md transition-all border border-green-200"
                  onClick={() => handleAssignToOperator(selectedOperation, operator)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <UserIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{operator.name}</h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <span>{operator.efficiency}% efficiency</span>
                        <span>•</span>
                        <span>{operator.currentWorkload} active</span>
                      </div>
                    </div>
                    <ArrowRightIcon className="h-4 w-4 text-green-600" />
                  </div>
                </Card>
              ))}
          </div>

          {operators.filter(op => op.status === 'available' && op.machineType === selectedOperation.machineType).length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <p className="text-sm">No compatible operators available for {selectedOperation.machineType} machine</p>
            </div>
          )}
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {columns.map((column) => (
          <Card key={column.id} className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {column.operations.length}
            </div>
            <p className="text-sm text-gray-600">{getColumnTitle(column)}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default KanbanAssignmentBoard;