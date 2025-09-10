// Mobile-Friendly Drag & Drop Assignment Dashboard
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
  ChevronRightIcon,
  BoltIcon,
  StarIcon,
  HandRaisedIcon,
  ArrowRightIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import EnhancedBundleService from '@/services/enhanced-bundle-service';
import type { BundleOperation, ProductionBundle } from '@/shared/types/bundle-types';

interface OperatorProfile {
  id: string;
  name: string;
  machineType: string;
  efficiency: number;
  currentWorkload: number;
  experience: 'beginner' | 'intermediate' | 'expert';
  specialties: string[];
  status: 'active' | 'break' | 'offline';
  avatar?: string;
}

interface DragDropAssignmentDashboardProps {
  userRole: string;
}

interface DragState {
  isDragging: boolean;
  draggedOperation: (BundleOperation & { bundleInfo: ProductionBundle }) | null;
  dragSource: { x: number; y: number };
  touchOffset: { x: number; y: number };
}

export const DragDropAssignmentDashboard: React.FC<DragDropAssignmentDashboardProps> = ({
  userRole
}) => {
  const { currentLocale } = useI18n();
  const [availableOperations, setAvailableOperations] = useState<any[]>([]);
  const [availableOperators, setAvailableOperators] = useState<OperatorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignmentMode, setAssignmentMode] = useState<'drag' | 'tap'>('tap'); // Mobile-first: tap mode default
  const [selectedOperation, setSelectedOperation] = useState<any | null>(null);

  // Helper function to get operation name in current language
  const getOperationName = (operation: any) => {
    return currentLocale === 'ne' ? (operation.nameNepali || operation.name) : operation.name;
  };
  
  // Drag state
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedOperation: null,
    dragSource: { x: 0, y: 0 },
    touchOffset: { x: 0, y: 0 }
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('🔍 Drag & Drop: Loading ALL unassigned operations from production lots...');
      
      // Load ALL unassigned operations using the correct TSA production_lots collection
      const [unassignedOps, operatorsResponse] = await Promise.all([
        EnhancedBundleService.getUnassignedBundleOperations(), // Use actual TSA data source
        EnhancedBundleService.getAvailableOperators()
      ]);

      if (unassignedOps.success && unassignedOps.data) {
        console.log(`✅ Found ${unassignedOps.data.length} unassigned operations for drag & drop`);
        
        // Convert to format expected by drag & drop component (loose typing to avoid strict type conflicts)
        const formattedOperations = unassignedOps.data.map((op: any) => ({
          id: op.id,
          bundleId: op.bundleId,
          operationId: op.id,
          name: op.operation,
          nameNepali: op.operationNepali,
          sequenceOrder: 1,
          machineType: op.machineType,
          status: op.status,
          assignedOperator: null,
          targetPieces: op.targetPieces || 50,
          completedPieces: 0,
          pricePerPiece: op.pricePerPiece || 5.0,
          smvMinutes: op.smvMinutes || 5,
          prerequisites: [],
          isOptional: false,
          qualityCheckRequired: false,
          defectTolerance: 5,
          // Additional properties for drag & drop UI
          operationName: op.operation,
          operationNameNepali: op.operationNepali,
          skillLevel: op.requiredSkill || 'basic',
          quantity: op.targetPieces || 50,
          priority: op.priority || 'normal',
          bundleInfo: {
            id: op.bundleId,
            bundleNumber: op.bundleNumber || `Bundle-${op.bundleId?.substring(0, 8)}`,
            articleNumber: op.articleNumber || 'ART001',
            description: `${op.garmentType || 'Garment'} - ${op.operation}`,
            garmentType: op.garmentType || 'Shirt',
            targetQuantity: op.targetPieces || 50,
            createdDate: new Date(),
            priority: op.priority || 'normal',
            status: 'in_production' as const,
            // Additional properties
            dueDate: op.dueDate,
            batchNumber: op.lotNumber || 'LOT001',
            quantity: op.targetPieces || 50
          }
        })) as any[];
        
        console.log(`📦 Formatted ${formattedOperations.length} operations for assignment UI`);
        setAvailableOperations(formattedOperations);
        
        // Show helpful message if no operations
        if (formattedOperations.length === 0) {
          console.log('🎉 All operations have been assigned! No unassigned work found.');
        }
      } else {
        console.log('⚠️ No unassigned operations found or failed to load');
        setAvailableOperations([]);
      }

      if (operatorsResponse.success && operatorsResponse.data) {
        console.log(`✅ Found ${operatorsResponse.data.length} operators for assignment`);
        setAvailableOperators(operatorsResponse.data);
      }
    } catch (error) {
      console.error('❌ Failed to load drag & drop assignment data:', error);
      setAvailableOperations([]);
    } finally {
      setLoading(false);
    }
  };

  // Mobile-friendly drag start
  const handleTouchStart = (e: React.TouchEvent, operation: any) => {
    if (assignmentMode !== 'drag') return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    
    setDragState({
      isDragging: true,
      draggedOperation: operation,
      dragSource: { x: touch.clientX, y: touch.clientY },
      touchOffset: { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragState.isDragging || !dragState.draggedOperation) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    
    // Update drag position visual feedback could be added here
    setDragState(prev => ({
      ...prev,
      dragSource: { x: touch.clientX, y: touch.clientY }
    }));
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!dragState.isDragging || !dragState.draggedOperation) return;
    
    const touch = e.changedTouches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const operatorCard = elementBelow?.closest('[data-operator-id]');
    
    if (operatorCard) {
      const operatorId = operatorCard.getAttribute('data-operator-id');
      const operator = availableOperators.find(op => op.id === operatorId);
      
      if (operator) {
        handleAssignment(dragState.draggedOperation, operator);
      }
    }
    
    // Reset drag state
    setDragState({
      isDragging: false,
      draggedOperation: null,
      dragSource: { x: 0, y: 0 },
      touchOffset: { x: 0, y: 0 }
    });
  };

  // Tap mode - select operation first, then operator
  const handleOperationTap = (operation: any) => {
    if (assignmentMode !== 'tap') return;
    setSelectedOperation(selectedOperation?.id === operation.id ? null : operation);
  };

  const handleOperatorTap = (operator: OperatorProfile) => {
    if (assignmentMode !== 'tap' || !selectedOperation) return;
    handleAssignment(selectedOperation, operator);
    setSelectedOperation(null);
  };

  // Assignment logic
  const handleAssignment = async (operation: any, operator: OperatorProfile) => {
    console.log('🎯 Starting assignment process:', { operation: operation.name, operator: operator.name });
    
    try {
      // Simplified assignment - directly update Firestore without complex atomic operations
      console.log('🔧 Using simplified assignment logic for drag & drop');
      
      // Update the operation in the production lot to assign it to the operator
      const { updateDoc, doc } = await import('firebase/firestore');
      const { db } = await import('@/config/firebase');
      
      // Find the production lot that contains this operation
      const lotQuery = await import('firebase/firestore').then(({ query, collection, where, getDocs }) => 
        getDocs(query(collection(db, 'production_lots'), where('status', '!=', 'completed')))
      );
      
      let updatedSuccessfully = false;
      
      // Search through lots to find and update the specific operation
      for (const lotDoc of lotQuery.docs) {
        const lotData = lotDoc.data();
        let foundAndUpdated = false;
        
        // Check processSteps structure (current production lot format)
        if (lotData.processSteps && Array.isArray(lotData.processSteps)) {
          // Create updated processSteps array with the assigned operation
          const updatedProcessSteps = lotData.processSteps.map((step: any) => {
            if (step.id === operation.id || step.operation === operation.operation) {
              console.log(`✅ Found operation ${step.operation} in lot ${lotDoc.id}, assigning to ${operator.name}`);
              foundAndUpdated = true;
              return {
                ...step,
                assignedOperators: [
                  {
                    operatorId: operator.id,
                    operatorName: operator.name,
                    assignedAt: new Date().toISOString(),
                    targetPieces: step.targetPieces || 50
                  }
                ],
                status: 'in_progress',
                assignedAt: new Date().toISOString()
              };
            }
            return step;
          });
          
          if (foundAndUpdated) {
            // Update the production lot document
            await updateDoc(doc(db, 'production_lots', lotDoc.id), {
              processSteps: updatedProcessSteps,
              lastUpdated: new Date().toISOString()
            });
            
            updatedSuccessfully = true;
            console.log(`✅ Successfully assigned ${operation.operation} to ${operator.name} in lot ${lotDoc.id}`);
            break;
          }
        }
        // Also check legacy bundles structure for backwards compatibility
        else if (lotData.bundles && Array.isArray(lotData.bundles)) {
          const updatedBundles = lotData.bundles.map((bundle: any) => {
            if (bundle.operations && Array.isArray(bundle.operations)) {
              const updatedOperations = bundle.operations.map((op: any) => {
                if (op.id === operation.id || (op.operation === operation.operation && op.id === operation.id)) {
                  console.log(`✅ Found operation ${op.operation} in bundle ${bundle.bundleNumber}, assigning to ${operator.name}`);
                  foundAndUpdated = true;
                  return {
                    ...op,
                    assignedOperatorId: operator.id,
                    assignedOperatorName: operator.name,
                    assignedAt: new Date().toISOString(),
                    status: 'assigned'
                  };
                }
                return op;
              });
              
              return { ...bundle, operations: updatedOperations };
            }
            return bundle;
          });
          
          if (foundAndUpdated) {
            await updateDoc(doc(db, 'production_lots', lotDoc.id), {
              bundles: updatedBundles,
              lastUpdated: new Date().toISOString()
            });
            
            updatedSuccessfully = true;
            console.log(`✅ Successfully assigned ${operation.operation} to ${operator.name} in lot ${lotDoc.id} (legacy)`);
            break;
          }
        }
      }
      
      if (updatedSuccessfully) {
        // Remove assigned operation from available list
        setAvailableOperations(prev => prev.filter(op => op.id !== operation.id));
        
        // Update operator workload
        setAvailableOperators(prev => prev.map(op => 
          op.id === operator.id 
            ? { ...op, currentWorkload: op.currentWorkload + 1 }
            : op
        ));

        // Show success feedback
        showSuccessMessage(`✅ ${operation.operation} assigned to ${operator.name}`);
        console.log('🎉 Assignment completed successfully');
      } else {
        throw new Error(`Operation ${operation.operation} not found in any production lot`);
      }
      
    } catch (error) {
      console.error('❌ Assignment failed:', error);
      showErrorMessage(`❌ Assignment failed: ${error instanceof Error ? error.message : 'Please try again.'}`);
    }
  };

  const showSuccessMessage = (message: string) => {
    // In a real app, you'd use a toast notification system
    console.log('Success:', message);
  };

  const showErrorMessage = (message: string) => {
    // In a real app, you'd use a toast notification system
    console.error('Error:', message);
  };

  const getExperienceBadgeColor = (experience: string) => {
    switch (experience) {
      case 'expert': return 'success';
      case 'intermediate': return 'warning';
      case 'beginner': return 'info';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'break': return 'text-yellow-600';
      case 'offline': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
        <span className="ml-2 text-gray-600">Loading assignment dashboard...</span>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            🎯 Drag & Drop Assignment
          </h1>
          <p className="text-gray-600 mt-1">
            Assign operations to operators with ease
          </p>
        </div>
        
        {/* Mode Toggle */}
        <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
          <Button
            variant={assignmentMode === 'tap' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setAssignmentMode('tap')}
            className="text-xs"
          >
            👆 Tap Mode
          </Button>
          <Button
            variant={assignmentMode === 'drag' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setAssignmentMode('drag')}
            className="text-xs"
          >
            🤏 Drag Mode
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">💡</div>
          <div>
            <h3 className="font-semibold text-blue-900">How to Assign:</h3>
            {assignmentMode === 'tap' ? (
              <p className="text-blue-800 text-sm mt-1">
                1. Tap on a bundle operation below → 2. Tap on an operator → Done! ✅
              </p>
            ) : (
              <p className="text-blue-800 text-sm mt-1">
                1. Press and hold a bundle operation → 2. Drag to an operator → Release! ✅
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Selected Operation Indicator (Tap Mode) */}
      {assignmentMode === 'tap' && selectedOperation && (
        <Card className="p-4 bg-green-50 border-green-200 border-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="font-semibold text-green-900">Selected Operation:</p>
                <p className="text-green-800">{getOperationName(selectedOperation)} - {selectedOperation.bundleInfo.bundleNumber}</p>
              </div>
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
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Operations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <ClockIcon className="h-6 w-6 mr-2 text-blue-600" />
              Available Work ({availableOperations.length})
            </h2>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {availableOperations.map((operation) => (
              <Card 
                key={operation.id}
                className={`p-4 cursor-pointer transition-all duration-200 ${
                  selectedOperation?.id === operation.id 
                    ? 'border-green-500 border-2 bg-green-50 shadow-lg' 
                    : 'hover:shadow-lg hover:border-blue-300'
                } ${
                  dragState.isDragging && dragState.draggedOperation?.id === operation.id
                    ? 'opacity-50 transform scale-95'
                    : ''
                }`}
                onTouchStart={(e) => handleTouchStart(e, operation)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={() => handleOperationTap(operation)}
              >
                <div className="space-y-3">
                  {/* Header with Operation Name & Drag Handle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BoltIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{getOperationName(operation)}</h3>
                      </div>
                    </div>
                    {assignmentMode === 'drag' && (
                      <div className="flex items-center text-gray-400">
                        <HandRaisedIcon className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  {/* Bundle & Batch Details */}
                  <div className="space-y-1">
                    <div className="text-xs text-gray-800 font-medium">
                      📦 <strong>{operation.bundleInfo.bundleNumber}</strong>
                    </div>
                    <div className="text-xs text-gray-600">
                      🏷️ Batch: {operation.bundleInfo.batchNumber || 'B001'} • {operation.bundleInfo.targetQuantity || 50} pieces
                    </div>
                  </div>

                  {/* Time & Money Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center text-gray-600">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {operation.smvMinutes}min/piece
                      </div>
                      <div className="flex items-center text-blue-600 font-medium">
                        ⏱️ Total: {Math.round((operation.bundleInfo.targetQuantity || 50) * operation.smvMinutes / 60)}h
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center text-green-600 font-medium">
                        <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                        ${operation.pricePerPiece}/piece
                      </div>
                      <div className="flex items-center text-green-700 font-bold">
                        💰 ${((operation.bundleInfo.targetQuantity || 50) * operation.pricePerPiece).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Last Work Done By */}
                  <div className="bg-blue-50 p-2 rounded text-xs">
                    <div className="text-blue-800 font-medium mb-1">🔍 Last Done By:</div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">👷 Maya Patel</span>
                      <span className="text-yellow-600">⭐ 9.2/10</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-blue-600">📅 2 days ago</span>
                      <span className="text-green-600">⚡ 94% efficiency</span>
                    </div>
                  </div>

                  {/* Requirements, Priority & Due Date */}
                  <div className="flex items-center justify-between pt-1 border-t border-gray-100">
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
                    <span className="text-xs text-gray-500">
                      📅 Due: {operation.bundleInfo.dueDate ? 
                        new Date(operation.bundleInfo.dueDate).toLocaleDateString() : 'Today'
                      }
                    </span>
                  </div>
                </div>
              </Card>
            ))}
            
            {availableOperations.length === 0 && (
              <Card className="p-8 text-center">
                <div className="text-4xl mb-4">🎉</div>
                <p className="text-gray-600">All operations have been assigned!</p>
                <Button
                  variant="primary"
                  onClick={loadData}
                  className="mt-4"
                >
                  Refresh List
                </Button>
              </Card>
            )}
          </div>
        </div>

        {/* Available Operators */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <UserIcon className="h-6 w-6 mr-2 text-purple-600" />
              Available Operators ({availableOperators.filter(op => op.status === 'active').length})
            </h2>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {availableOperators
              .filter(operator => operator.status === 'active')
              .map((operator) => (
              <Card 
                key={operator.id}
                data-operator-id={operator.id}
                className={`p-4 transition-all duration-200 ${
                  assignmentMode === 'tap' && selectedOperation
                    ? 'cursor-pointer hover:shadow-lg hover:border-purple-300 hover:bg-purple-50'
                    : assignmentMode === 'drag'
                    ? 'border-dashed border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50'
                    : 'cursor-default'
                }`}
                onClick={() => handleOperatorTap(operator)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <UserIcon className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        operator.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{operator.name}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getExperienceBadgeColor(operator.experience)} size="sm">
                          {operator.experience}
                        </Badge>
                        <span className="text-xs text-gray-500">{operator.machineType}</span>
                      </div>
                    </div>
                  </div>
                  
                  {assignmentMode === 'tap' && selectedOperation && (
                    <ArrowRightIcon className="h-5 w-5 text-purple-600 animate-pulse" />
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="text-center">
                    <p className="text-gray-600">Efficiency</p>
                    <p className="font-semibold text-blue-600">{operator.efficiency}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Workload</p>
                    <p className="font-semibold text-orange-600">{operator.currentWorkload}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Status</p>
                    <p className={`font-semibold capitalize ${getStatusColor(operator.status)}`}>
                      {operator.status}
                    </p>
                  </div>
                </div>
                
                {operator.specialties.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Specialties:</p>
                    <div className="flex flex-wrap gap-1">
                      {operator.specialties.slice(0, 2).map(specialty => (
                        <Badge key={specialty} variant="outline" size="sm">
                          {specialty}
                        </Badge>
                      ))}
                      {operator.specialties.length > 2 && (
                        <Badge variant="outline" size="sm">
                          +{operator.specialties.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))}
            
            {availableOperators.filter(op => op.status === 'active').length === 0 && (
              <Card className="p-8 text-center">
                <div className="text-4xl mb-4">😴</div>
                <p className="text-gray-600">No operators available right now</p>
                <Button
                  variant="outline"
                  onClick={loadData}
                  className="mt-4"
                >
                  Refresh List
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl text-blue-600 font-bold">{availableOperations.length}</div>
          <p className="text-sm text-gray-600">Pending Operations</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl text-purple-600 font-bold">
            {availableOperators.filter(op => op.status === 'active').length}
          </div>
          <p className="text-sm text-gray-600">Active Operators</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl text-green-600 font-bold">
            {availableOperators.reduce((sum, op) => sum + op.currentWorkload, 0)}
          </div>
          <p className="text-sm text-gray-600">Total Assignments</p>
        </Card>
      </div>
    </div>
  );
};

export default DragDropAssignmentDashboard;