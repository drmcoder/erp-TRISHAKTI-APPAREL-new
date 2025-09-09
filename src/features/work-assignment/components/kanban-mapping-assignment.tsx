// Kanban-Style Mapping Assignment System
// Fixed TypeScript compilation issues
import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { 
  UserIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  BoltIcon,
  StarIcon,
  SwatchIcon,
  HashtagIcon,
  TruckIcon,
  PlayIcon,
  PlusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import EnhancedBundleService from '@/services/enhanced-bundle-service';
import type { BundleOperation, ProductionBundle } from '@/shared/types/bundle-types';

interface BundleItem {
  id: string;
  bundleNumber: string;
  articleNumber: string;
  articleStyle: string;
  sizes: { size: string; quantity: number; color: string }[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  operations: BundleOperation[];
  selectedSize?: string;
  selectedColor?: string;
  selectedOperation?: string;
}

interface OperatorProfile {
  id: string;
  name: string;
  machineType: string;
  efficiency: number;
  currentWorkload: number;
  experience: 'beginner' | 'intermediate' | 'expert';
  specialties: string[];
  status: 'active' | 'break' | 'offline';
  assignedBundles: string[];
}

interface KanbanMappingAssignmentProps {
  userRole: string;
}

export const KanbanMappingAssignment: React.FC<KanbanMappingAssignmentProps> = ({
  userRole
}) => {
  const [bundles, setBundles] = useState<BundleItem[]>([]);
  const [operators, setOperators] = useState<OperatorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<{[key: string]: string}>({});

  // Load mock data
  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = async () => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock bundle data
    const mockBundles: BundleItem[] = [
      {
        id: 'bundle_1',
        bundleNumber: 'BND-3233-001',
        articleNumber: '3233',
        articleStyle: 'Adult T-Shirt',
        priority: 'high',
        sizes: [
          { size: 'S', quantity: 15, color: 'Navy Blue' },
          { size: 'M', quantity: 20, color: 'Navy Blue' },
          { size: 'L', quantity: 25, color: 'Navy Blue' },
          { size: 'XL', quantity: 10, color: 'Navy Blue' }
        ],
        operations: [
          { 
            id: 'op_1', 
            name: 'Shoulder Join', 
            nameNepali: 'काँध जोड्ने',
            machineType: 'overlock',
            pricePerPiece: 2.5,
            smvMinutes: 4.5,
            status: 'pending',
            bundleId: 'bundle_1',
            operationId: 'shoulder_join',
            sequenceOrder: 1,
            prerequisites: [],
            isOptional: false,
            qualityCheckRequired: true,
            defectTolerance: 5
          },
          { 
            id: 'op_2', 
            name: 'Side Seam', 
            nameNepali: 'छेउ सिलाई',
            machineType: 'overlock',
            pricePerPiece: 3.0,
            smvMinutes: 5.0,
            status: 'pending',
            bundleId: 'bundle_1',
            operationId: 'side_seam',
            sequenceOrder: 2,
            prerequisites: ['shoulder_join'],
            isOptional: false,
            qualityCheckRequired: true,
            defectTolerance: 5
          }
        ]
      },
      {
        id: 'bundle_2',
        bundleNumber: 'BND-3265-001',
        articleNumber: '3265',
        articleStyle: 'Ladies Blouse',
        priority: 'normal',
        sizes: [
          { size: 'S', quantity: 12, color: 'White' },
          { size: 'M', quantity: 18, color: 'White' },
          { size: 'L', quantity: 15, color: 'Pink' },
          { size: 'XL', quantity: 8, color: 'Pink' }
        ],
        operations: [
          { 
            id: 'op_3', 
            name: 'Sleeve Attach', 
            nameNepali: 'आस्तीन लगाउने',
            machineType: 'singleNeedle',
            pricePerPiece: 4.0,
            smvMinutes: 7.0,
            status: 'pending',
            bundleId: 'bundle_2',
            operationId: 'sleeve_attach',
            sequenceOrder: 1,
            prerequisites: [],
            isOptional: false,
            qualityCheckRequired: true,
            defectTolerance: 3
          }
        ]
      },
      {
        id: 'bundle_3',
        bundleNumber: 'BND-3401-001',
        articleNumber: '3401',
        articleStyle: 'Kids T-Shirt',
        priority: 'urgent',
        sizes: [
          { size: '2T', quantity: 10, color: 'Red' },
          { size: '3T', quantity: 15, color: 'Blue' },
          { size: '4T', quantity: 12, color: 'Green' }
        ],
        operations: [
          { 
            id: 'op_4', 
            name: 'Neck Binding', 
            nameNepali: 'घाँटी बाँध्ने',
            machineType: 'overlock',
            pricePerPiece: 1.8,
            smvMinutes: 3.5,
            status: 'pending',
            bundleId: 'bundle_3',
            operationId: 'neck_binding',
            sequenceOrder: 1,
            prerequisites: [],
            isOptional: false,
            qualityCheckRequired: true,
            defectTolerance: 8
          }
        ]
      }
    ];

    // Mock operator data
    const mockOperators: OperatorProfile[] = [
      {
        id: 'op_maya',
        name: 'Maya Patel',
        machineType: 'overlock',
        efficiency: 94.5,
        currentWorkload: 2,
        experience: 'expert',
        specialties: ['shoulder_join', 'side_seam', 'neck_binding'],
        status: 'active',
        assignedBundles: []
      },
      {
        id: 'op_rajesh',
        name: 'Rajesh Kumar',
        machineType: 'singleNeedle',
        efficiency: 91.2,
        currentWorkload: 1,
        experience: 'expert',
        specialties: ['sleeve_attach', 'hem_finish'],
        status: 'active',
        assignedBundles: []
      },
      {
        id: 'op_sita',
        name: 'Sita Sharma',
        machineType: 'overlock',
        efficiency: 87.8,
        currentWorkload: 3,
        experience: 'intermediate',
        specialties: ['neck_binding', 'shoulder_join'],
        status: 'active',
        assignedBundles: []
      },
      {
        id: 'op_ram',
        name: 'Ram Bahadur',
        machineType: 'singleNeedle',
        efficiency: 89.3,
        currentWorkload: 0,
        experience: 'intermediate',
        specialties: ['sleeve_attach'],
        status: 'break',
        assignedBundles: []
      }
    ];

    setBundles(mockBundles);
    setOperators(mockOperators);
    setLoading(false);
  };

  const handleSizeColorSelection = (bundleId: string, size: string, color: string) => {
    setBundles(prev => prev.map(bundle => 
      bundle.id === bundleId 
        ? { ...bundle, selectedSize: size, selectedColor: color }
        : bundle
    ));
  };

  const handleOperationSelection = (bundleId: string, operationId: string) => {
    setBundles(prev => prev.map(bundle => 
      bundle.id === bundleId 
        ? { ...bundle, selectedOperation: operationId }
        : bundle
    ));
  };

  const handleAssignment = (bundleId: string, operatorId: string) => {
    const bundle = bundles.find(b => b.id === bundleId);
    const operator = operators.find(o => o.id === operatorId);
    
    if (!bundle || !operator || !bundle.selectedSize || !bundle.selectedOperation) {
      alert('❌ Please select size, color, and operation first!');
      return;
    }

    // Get selected operation details
    const selectedOperation = bundle.operations.find(op => op.id === bundle.selectedOperation);
    if (!selectedOperation) {
      alert('❌ Selected operation not found!');
      return;
    }

    // VALIDATION: Check machine type compatibility
    if (operator.machineType !== selectedOperation.machineType) {
      alert(`❌ Machine Type Mismatch!\n\nOperation "${selectedOperation.name}" requires: ${selectedOperation.machineType}\n${operator.name} operates: ${operator.machineType}\n\nPlease select a compatible operator.`);
      return;
    }

    // VALIDATION: Check operator status
    if (operator.status !== 'active') {
      alert(`❌ Operator ${operator.name} is currently ${operator.status}. Please select an active operator.`);
      return;
    }

    // VALIDATION: Check workload (optional - prevent overload)
    if (operator.currentWorkload >= 5) {
      const confirmOverload = confirm(`⚠️ ${operator.name} already has ${operator.currentWorkload} assignments.\n\nAssign anyway?`);
      if (!confirmOverload) return;
    }

    // Update assignments
    setAssignments(prev => ({
      ...prev,
      [bundleId]: operatorId
    }));

    // Update operator workload
    setOperators(prev => prev.map(op => 
      op.id === operatorId
        ? { 
            ...op, 
            currentWorkload: op.currentWorkload + 1,
            assignedBundles: [...op.assignedBundles, bundleId]
          }
        : op
    ));

    // Show success message with validation details
    alert(`✅ Assignment Successful!\n\n${bundle.bundleNumber} → ${operator.name}\nOperation: ${selectedOperation.name}\nMachine: ${selectedOperation.machineType}\nPrice: $${selectedOperation.pricePerPiece} per piece`);
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

  const getExperienceColor = (experience: string) => {
    switch (experience) {
      case 'expert': return 'success';
      case 'intermediate': return 'warning';
      case 'beginner': return 'info';
      default: return 'secondary';
    }
  };

  // Get compatible operators for selected bundle operation
  const getCompatibleOperators = (bundleId: string) => {
    const bundle = bundles.find(b => b.id === bundleId);
    if (!bundle || !bundle.selectedOperation) return [];

    const selectedOperation = bundle.operations.find(op => op.id === bundle.selectedOperation);
    if (!selectedOperation) return [];

    return operators.filter(operator => 
      operator.status === 'active' && 
      operator.machineType === selectedOperation.machineType
    );
  };

  // Check if operator is compatible with selected bundle
  const isOperatorCompatible = (operatorId: string, bundleId: string) => {
    const compatibleOperators = getCompatibleOperators(bundleId);
    return compatibleOperators.some(op => op.id === operatorId);
  };

  // Get selected operation for bundle
  const getSelectedOperation = (bundleId: string) => {
    const bundle = bundles.find(b => b.id === bundleId);
    if (!bundle || !bundle.selectedOperation) return null;
    return bundle.operations.find(op => op.id === bundle.selectedOperation);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner text="Loading Kanban assignment..." />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            📋 Kanban Work Assignment
          </h1>
          <p className="text-gray-600 mt-1">
            Map bundles to operators with size, color & operation selection
          </p>
        </div>
        <Button 
          variant="primary"
          onClick={loadMockData}
          className="flex items-center space-x-2"
        >
          <ArrowPathIcon className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: Bundles with Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <TruckIcon className="h-6 w-6 mr-2 text-blue-600" />
              Production Bundles ({bundles.length})
            </h2>
          </div>
          
          <div className="space-y-4 max-h-screen overflow-y-auto">
            {bundles.map((bundle) => {
              const isAssigned = assignments[bundle.id];
              const assignedOperator = operators.find(op => op.id === isAssigned);
              
              return (
                <Card 
                  key={bundle.id}
                  className={`p-4 transition-all duration-200 ${
                    selectedBundle === bundle.id 
                      ? 'border-blue-500 border-2 bg-blue-50 shadow-lg' 
                      : isAssigned
                      ? 'border-green-500 bg-green-50'
                      : 'hover:shadow-lg hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedBundle(selectedBundle === bundle.id ? null : bundle.id)}
                >
                  {/* Bundle Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <HashtagIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{bundle.bundleNumber}</h3>
                        <p className="text-sm text-gray-600">{bundle.articleStyle}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getPriorityColor(bundle.priority)}>
                        {bundle.priority}
                      </Badge>
                      {isAssigned && (
                        <Badge variant="success">
                          ✓ Assigned
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Size & Color Selection */}
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <SwatchIcon className="h-4 w-4 mr-1 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Size & Color:</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {bundle.sizes.map((sizeInfo, idx) => (
                        <Button
                          key={idx}
                          variant={
                            bundle.selectedSize === sizeInfo.size && bundle.selectedColor === sizeInfo.color
                              ? 'primary'
                              : 'outline'
                          }
                          size="sm"
                          className="text-xs p-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSizeColorSelection(bundle.id, sizeInfo.size, sizeInfo.color);
                          }}
                        >
                          <div className="text-center">
                            <div className="font-semibold">{sizeInfo.size}</div>
                            <div className="text-xs">{sizeInfo.color}</div>
                            <div className="text-xs">({sizeInfo.quantity})</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Operation Selection */}
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <BoltIcon className="h-4 w-4 mr-1 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Operation:</span>
                    </div>
                    <div className="space-y-2">
                      {bundle.operations.map((operation) => (
                        <div
                          key={operation.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            bundle.selectedOperation === operation.id
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOperationSelection(bundle.id, operation.id);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{operation.name}</p>
                              <p className="text-sm text-gray-600">{operation.nameNepali}</p>
                            </div>
                            <div className="text-right text-sm">
                              <div className="flex items-center text-gray-600">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                {operation.smvMinutes}min
                              </div>
                              <div className="flex items-center text-green-600 font-semibold">
                                <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                                ${operation.pricePerPiece}
                              </div>
                            </div>
                          </div>
                          <div className="mt-2">
                            <Badge variant="outline" size="sm">
                              {operation.machineType}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Assignment Status */}
                  {isAssigned && assignedOperator && (
                    <div className="p-3 bg-green-100 rounded-lg border border-green-300">
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          Assigned to {assignedOperator.name}
                        </span>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Operators */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <UserIcon className="h-6 w-6 mr-2 text-purple-600" />
              Available Operators
            </h2>
          </div>
          
          {/* Compatibility Info */}
          {selectedBundle && getSelectedOperation(selectedBundle) && (
            <Card className="p-3 bg-blue-50 border-blue-200">
              <div className="flex items-center space-x-2 text-sm">
                <BoltIcon className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">
                  Required Machine: {getSelectedOperation(selectedBundle)?.machineType}
                </span>
                <Badge variant="info" size="sm">
                  {getCompatibleOperators(selectedBundle).length} Compatible
                </Badge>
              </div>
            </Card>
          )}
          
          <div className="space-y-4 max-h-screen overflow-y-auto">
            {operators
              .filter(operator => operator.status === 'active')
              .map((operator) => {
                const isCompatible = selectedBundle ? isOperatorCompatible(operator.id, selectedBundle) : true;
                const isRecommended = selectedBundle && isCompatible && 
                  getSelectedOperation(selectedBundle)?.operationId && 
                  operator.specialties.includes(getSelectedOperation(selectedBundle)!.operationId);
                
                return (
                  <Card 
                    key={operator.id}
                    className={`p-4 transition-all cursor-pointer border-2 ${
                      selectedBundle && !isCompatible 
                        ? 'border-red-200 bg-red-50 opacity-60 cursor-not-allowed'
                        : isRecommended
                        ? 'border-green-400 bg-green-50 shadow-lg hover:shadow-xl'
                        : isCompatible && selectedBundle
                        ? 'border-blue-300 bg-blue-50 hover:shadow-lg hover:border-blue-400'
                        : 'hover:shadow-lg hover:border-purple-300'
                    }`}
                    onClick={() => {
                      if (selectedBundle) {
                        if (!isCompatible) {
                          const selectedOp = getSelectedOperation(selectedBundle);
                          alert(`❌ Incompatible Machine Type!\n\n${operator.name} operates: ${operator.machineType}\nRequired: ${selectedOp?.machineType}\n\nPlease select the correct operation or a compatible operator.`);
                          return;
                        }
                        handleAssignment(selectedBundle, operator.id);
                      } else {
                        alert('Please select a bundle first!');
                      }
                    }}
                  >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="p-3 bg-purple-100 rounded-full">
                        <UserIcon className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{operator.name}</h3>
                        {selectedBundle && isRecommended && (
                          <Badge variant="success" size="sm">
                            ⭐ Best Match
                          </Badge>
                        )}
                        {selectedBundle && !isCompatible && (
                          <Badge variant="danger" size="sm">
                            ❌ Wrong Machine
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getExperienceColor(operator.experience)} size="sm">
                          {operator.experience}
                        </Badge>
                        <Badge 
                          variant={
                            selectedBundle && getSelectedOperation(selectedBundle)?.machineType === operator.machineType
                              ? 'success'
                              : 'outline'
                          }
                          size="sm"
                        >
                          {operator.machineType}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {selectedBundle && isCompatible && (
                    <div className="text-green-600">
                      <ArrowRightIcon className="h-6 w-6 animate-pulse" />
                    </div>
                  )}
                  {selectedBundle && !isCompatible && (
                    <div className="text-red-600 text-center">
                      <div className="text-2xl">🚫</div>
                      <div className="text-xs">Blocked</div>
                    </div>
                  )}
                </div>
                
                {/* Operator Stats */}
                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <p className="text-gray-600">Efficiency</p>
                    <p className="font-bold text-blue-600">{operator.efficiency}%</p>
                  </div>
                  <div className="text-center p-2 bg-orange-50 rounded">
                    <p className="text-gray-600">Workload</p>
                    <p className="font-bold text-orange-600">{operator.currentWorkload}</p>
                  </div>
                </div>
                
                {/* Specialties */}
                <div>
                  <p className="text-xs text-gray-600 mb-2">Specialties:</p>
                  <div className="flex flex-wrap gap-1">
                    {operator.specialties.slice(0, 3).map(specialty => (
                      <Badge key={specialty} variant="outline" size="sm">
                        {specialty.replace('_', ' ')}
                      </Badge>
                    ))}
                    {operator.specialties.length > 3 && (
                      <Badge variant="outline" size="sm">
                        +{operator.specialties.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Assigned Bundles */}
                {operator.assignedBundles.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Current Assignments:</p>
                    <div className="flex flex-wrap gap-1">
                      {operator.assignedBundles.map(bundleId => {
                        const bundle = bundles.find(b => b.id === bundleId);
                        return bundle ? (
                          <Badge key={bundleId} variant="info" size="sm">
                            {bundle.bundleNumber}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </Card>
                );
              })}
          </div>
            
            {/* Operators on Break */}
            {operators.filter(op => op.status !== 'active').length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Operators on Break:</h3>
                <div className="space-y-2">
                  {operators
                    .filter(op => op.status !== 'active')
                    .map(operator => (
                    <Card key={operator.id} className="p-3 opacity-60">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{operator.name}</span>
                        <Badge variant="secondary" size="sm">
                          {operator.status}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assignment Summary */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">📊 Assignment Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{bundles.length}</div>
            <p className="text-sm text-gray-600">Total Bundles</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{Object.keys(assignments).length}</div>
            <p className="text-sm text-gray-600">Assigned</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{bundles.length - Object.keys(assignments).length}</div>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{operators.filter(op => op.status === 'active').length}</div>
            <p className="text-sm text-gray-600">Active Operators</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default KanbanMappingAssignment;