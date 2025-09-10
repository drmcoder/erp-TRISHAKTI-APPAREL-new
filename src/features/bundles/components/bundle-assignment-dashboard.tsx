// Bundle Assignment Dashboard - Supervisor assigns operations to operators
import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Input } from '@/shared/components/ui/Input';
import { 
  CubeIcon,
  UserGroupIcon,
  PlayIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowRightIcon,
  CurrencyDollarIcon,
  WrenchIcon,
  BellIcon,
  XMarkIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import type { ProductionBundle, BundleOperation, PartsComplaint } from '@/shared/types/bundle-types';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { notify } from '@/utils/notification-utils';

interface BundleAssignmentDashboardProps {
  userRole?: string;
}

// Mock data - in production this would come from bundleService and operatorService
const mockBundles: ProductionBundle[] = [
  {
    id: 'bundle_1',
    bundleNumber: 'BND-3233-M-001',
    articleId: 'art_1',
    articleNumber: '3233',
    articleStyle: 'Adult T-shirt',
    size: 'M',
    rollId: 'roll_1',
    rollNumber: 'Roll1',
    rollColor: 'Blue',
    templateId: 'template_1',
    templateName: '3233 Template',
    templateCode: '3233',
    status: 'created',
    priority: 'normal',
    operations: [
      {
        id: 'BND-3233-M-001-OP-1',
        bundleId: 'bundle_1',
        operationId: 'op_1',
        name: 'Shoulder Join',
        nameNepali: 'काँध जोड्ने',
        description: 'Join front and back shoulders',
        machineType: 'overlock',
        sequenceOrder: 1,
        pricePerPiece: 2.5,
        smvMinutes: 4.5,
        status: 'pending',
        prerequisites: [],
        isOptional: false,
        qualityCheckRequired: true,
        defectTolerance: 5
      },
      {
        id: 'BND-3233-M-001-OP-2',
        bundleId: 'bundle_1',
        operationId: 'op_2',
        name: 'Side Seam',
        nameNepali: 'छेउ सिलाई',
        description: 'Sew side seams',
        machineType: 'overlock',
        sequenceOrder: 2,
        pricePerPiece: 3.0,
        smvMinutes: 5.0,
        status: 'pending',
        prerequisites: ['op_1'],
        isOptional: false,
        qualityCheckRequired: true,
        defectTolerance: 5
      },
      {
        id: 'BND-3233-M-001-OP-3',
        bundleId: 'bundle_1',
        operationId: 'op_3',
        name: 'Sleeve Attach',
        nameNepali: 'आस्तीन लगाउने',
        description: 'Attach sleeves to body',
        machineType: 'singleNeedle',
        sequenceOrder: 3,
        pricePerPiece: 4.0,
        smvMinutes: 7.0,
        status: 'pending',
        prerequisites: ['op_2'],
        isOptional: false,
        qualityCheckRequired: true,
        defectTolerance: 3
      }
    ],
    createdAt: new Date(),
    createdBy: 'System',
    totalValue: 9.5,
    totalSMV: 16.5
  }
];

const mockOperators = [
  { id: 'DYNAMIC_OPERATOR_ID', name: 'DYNAMIC_OPERATOR_NAME', machineType: 'overlock', efficiency: 94.5, currentWorkload: 2 },
  { id: 'op_rajesh_002', name: 'Rajesh Kumar', machineType: 'singleNeedle', efficiency: 91.2, currentWorkload: 1 },
  { id: 'op_priya_003', name: 'Priya Singh', machineType: 'overlock', efficiency: 89.8, currentWorkload: 0 },
  { id: 'op_amit_004', name: 'Amit Patel', machineType: 'singleNeedle', efficiency: 85.6, currentWorkload: 3 }
];

// Mock parts complaints data
const mockPartsComplaints: PartsComplaint[] = [
  {
    id: 'complaint_1',
    bundleId: 'bundle_1',
    operationId: 'BND-3233-M-001-OP-2',
    bundleNumber: 'BND-3233-M-001',
    reportedBy: 'DYNAMIC_OPERATOR_ID',
    reportedByName: 'DYNAMIC_OPERATOR_NAME',
    reportedAt: new Date('2024-01-15T10:30:00'),
    issueType: 'damaged',
    damagedParts: ['Front Panel', 'Left Sleeve'],
    description: 'Found tear in front panel and left sleeve has loose stitching that came apart during handling.',
    status: 'reported',
    priority: 'normal',
    replacedParts: [],
    resolution: 'parts_replaced'
  },
  {
    id: 'complaint_2',
    bundleId: 'bundle_2',
    operationId: 'BND-3265-L-001-OP-1',
    bundleNumber: 'BND-3265-L-001',
    reportedBy: 'op_rajesh_002',
    reportedByName: 'Rajesh Kumar',
    reportedAt: new Date('2024-01-15T11:15:00'),
    issueType: 'missing',
    damagedParts: ['Right Sleeve', 'Collar'],
    description: 'Right sleeve and collar pieces are missing from the bundle.',
    status: 'acknowledged',
    priority: 'high',
    acknowledgedBy: 'supervisor_1',
    acknowledgedByName: 'Ram Sharma',
    acknowledgedAt: new Date('2024-01-15T11:20:00'),
    estimatedReplacementTime: 30,
    replacedParts: [],
    resolution: 'parts_replaced'
  }
];

export const BundleAssignmentDashboard: React.FC<BundleAssignmentDashboardProps> = ({
  userRole = 'supervisor'
}) => {
  const [bundles, setBundles] = useState<ProductionBundle[]>(mockBundles);
  const [selectedBundle, setSelectedBundle] = useState<ProductionBundle | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<BundleOperation | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [machineFilter, setMachineFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  // Get available operations (prerequisites met)
  const getAvailableOperations = () => {
    const operations: (BundleOperation & { bundleInfo: ProductionBundle })[] = [];
    
    bundles.forEach(bundle => {
      bundle.operations.forEach(operation => {
        if (operation.status === 'pending') {
          // Check if prerequisites are completed
          const prerequisitesMet = operation.prerequisites.every(prereqId => {
            return bundle.operations.some(op => 
              op.operationId === prereqId && op.status === 'completed'
            );
          });
          
          if (prerequisitesMet || operation.prerequisites.length === 0) {
            operations.push({ ...operation, bundleInfo: bundle });
          }
        }
      });
    });
    
    return operations;
  };

  // Filter operations
  const filteredOperations = getAvailableOperations().filter(op => {
    const matchesSearch = searchTerm === '' || 
      op.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.bundleInfo.bundleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.bundleInfo.articleNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || op.status === statusFilter;
    const matchesMachine = machineFilter === 'all' || op.machineType === machineFilter;
    
    return matchesSearch && matchesStatus && matchesMachine;
  });

  // Get operators by machine type
  const getOperatorsByMachine = (machineType: string) => {
    return mockOperators.filter(op => op.machineType === machineType);
  };

  // Assign operation to operator
  const handleAssignOperation = async () => {
    if (!selectedOperation || !selectedOperator) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const operator = mockOperators.find(op => op.id === selectedOperator);
      if (!operator) return;

      // Update operation status
      setBundles(prev => prev.map(bundle => ({
        ...bundle,
        operations: bundle.operations.map(op => 
          op.id === selectedOperation.id
            ? {
                ...op,
                status: 'assigned' as const,
                assignedOperatorId: operator.id,
                assignedOperatorName: operator.name,
                assignedAt: new Date()
              }
            : op
        )
      })));

      setShowAssignmentModal(false);
      setSelectedOperation(null);
      setSelectedOperator('');
      
    } catch (error) {
      console.error('Assignment failed:', error);
      notify.error('Failed to assign operation. Please try again.', 'Assignment Failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Get operation status color
  const getStatusColor = (status: BundleOperation['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'quality_failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get machine type icon
  const getMachineIcon = (machineType: string) => {
    switch (machineType) {
      case 'overlock': return '⚡';
      case 'singleNeedle': return '🪡';
      case 'doubleNeedle': return '🪡🪡';
      default: return '🔧';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <CubeIcon className="h-8 w-8 text-blue-600" />
            <span>Bundle Assignment</span>
          </h1>
          <p className="text-gray-600">Assign operations to operators for production</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CubeIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Bundles</p>
              <p className="text-xl font-bold text-blue-600">{bundles.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Available Ops</p>
              <p className="text-xl font-bold text-yellow-600">{getAvailableOperations().length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Assigned Ops</p>
              <p className="text-xl font-bold text-green-600">
                {bundles.reduce((sum, bundle) => 
                  sum + bundle.operations.filter(op => op.status === 'assigned').length, 0
                )}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CurrencyDollarIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-xl font-bold text-purple-600">
                Rs. {bundles.reduce((sum, bundle) => sum + bundle.totalValue, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search operations, bundles, articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Available</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={machineFilter}
            onChange={(e) => setMachineFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Machines</option>
            <option value="overlock">Overlock</option>
            <option value="singleNeedle">Single Needle</option>
            <option value="doubleNeedle">Double Needle</option>
          </select>
        </div>
      </Card>

      {/* Available Operations */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Available Operations ({filteredOperations.length})
          </h3>
        </div>

        {filteredOperations.length === 0 ? (
          <div className="text-center py-8">
            <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No operations available</h3>
            <p className="text-gray-500">All operations are either assigned or waiting for prerequisites.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOperations.map((operation) => (
              <div key={operation.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <Badge variant="secondary" className="font-mono text-xs">
                        {operation.bundleInfo.bundleNumber}
                      </Badge>
                      <span className="text-lg">{getMachineIcon(operation.machineType)}</span>
                      <span className="font-medium text-gray-900">{operation.name}</span>
                      <span className="text-sm text-gray-500">({operation.nameNepali})</span>
                      <Badge className={getStatusColor(operation.status)}>
                        {operation.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Article:</span>
                        <span className="font-medium ml-1">
                          {operation.bundleInfo.articleNumber} ({operation.bundleInfo.size})
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Machine:</span>
                        <span className="font-medium ml-1 capitalize">{operation.machineType}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Price:</span>
                        <span className="font-medium text-green-600 ml-1">Rs. {operation.pricePerPiece}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">SMV:</span>
                        <span className="font-medium text-blue-600 ml-1">{operation.smvMinutes} min</span>
                      </div>
                    </div>

                    {operation.description && (
                      <p className="text-sm text-gray-600 mt-2">{operation.description}</p>
                    )}
                  </div>

                  <div className="ml-4">
                    {operation.status === 'pending' && (
                      <Button
                        onClick={() => {
                          setSelectedOperation(operation);
                          setShowAssignmentModal(true);
                        }}
                        className="flex items-center space-x-2"
                      >
                        <UserGroupIcon className="h-4 w-4" />
                        <span>Assign</span>
                      </Button>
                    )}

                    {operation.status === 'assigned' && operation.assignedOperatorName && (
                      <div className="text-right">
                        <div className="text-sm font-medium text-blue-600">
                          {operation.assignedOperatorName}
                        </div>
                        <div className="text-xs text-gray-500">
                          Assigned {operation.assignedAt ? new Date(operation.assignedAt).toLocaleDateString() : ''}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Assignment Modal */}
      {showAssignmentModal && selectedOperation && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
                 onClick={() => setShowAssignmentModal(false)} />

            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Assign Operation</h3>
                <button
                  onClick={() => setShowAssignmentModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Operation Details */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium text-gray-900">{selectedOperation.name}</div>
                  <div className="text-sm text-gray-500">
                    Bundle: {bundles.find(b => b.id === selectedOperation.bundleId)?.bundleNumber}
                  </div>
                  <div className="text-sm text-gray-500">
                    Machine: {selectedOperation.machineType} | Price: Rs. {selectedOperation.pricePerPiece}
                  </div>
                </div>

                {/* Operator Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Operator ({selectedOperation.machineType})
                  </label>
                  <select
                    value={selectedOperator}
                    onChange={(e) => setSelectedOperator(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose operator...</option>
                    {getOperatorsByMachine(selectedOperation.machineType).map(operator => (
                      <option key={operator.id} value={operator.id}>
                        {operator.name} - {operator.efficiency}% efficiency ({operator.currentWorkload} jobs)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Available Operators Info */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Available Operators:</p>
                  {getOperatorsByMachine(selectedOperation.machineType).map(operator => (
                    <div key={operator.id} className="flex items-center justify-between text-sm">
                      <span>{operator.name}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{operator.efficiency}%</Badge>
                        <Badge variant={operator.currentWorkload === 0 ? 'success' : 
                                       operator.currentWorkload <= 2 ? 'warning' : 'danger'}>
                          {operator.currentWorkload} jobs
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAssignmentModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignOperation}
                  disabled={!selectedOperator || isLoading}
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : 'Assign Operation'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BundleAssignmentDashboard;