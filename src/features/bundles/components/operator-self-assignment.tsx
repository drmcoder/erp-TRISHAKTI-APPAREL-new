// Operator Self Assignment - Simple interface for operators to pick available work
import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { 
  PlayIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  UserIcon,
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import type { BundleOperation, ProductionBundle } from '@/shared/types/bundle-types';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';

interface OperatorSelfAssignmentProps {
  operatorId: string;
  operatorName: string;
  operatorMachineType: string;
}

// Mock available operations data
const mockAvailableOperations: (BundleOperation & { bundleInfo: ProductionBundle })[] = [
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
    defectTolerance: 5,
    bundleInfo: {
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
      operations: [],
      createdAt: new Date(),
      createdBy: 'System',
      totalValue: 9.5,
      totalSMV: 16.5
    }
  },
  {
    id: 'BND-3265-S-002-OP-2',
    bundleId: 'bundle_2',
    operationId: 'op_2',
    name: 'Side Seam',
    nameNepali: 'छेउ सिलाई',
    description: 'Sew side seams',
    machineType: 'overlock',
    sequenceOrder: 2,
    pricePerPiece: 3.0,
    smvMinutes: 5.0,
    status: 'pending',
    prerequisites: [],
    isOptional: false,
    qualityCheckRequired: true,
    defectTolerance: 5,
    bundleInfo: {
      id: 'bundle_2',
      bundleNumber: 'BND-3265-S-002',
      articleId: 'art_2',
      articleNumber: '3265',
      articleStyle: 'Ladies Blouse',
      size: 'S',
      rollId: 'roll_2',
      rollNumber: 'Roll2',
      rollColor: 'Red',
      templateId: 'template_2',
      templateName: '3265 Template',
      templateCode: '3265',
      status: 'created',
      priority: 'high',
      operations: [],
      createdAt: new Date(),
      createdBy: 'System',
      totalValue: 12.5,
      totalSMV: 18.0
    }
  },
  {
    id: 'BND-3233-L-003-OP-4',
    bundleId: 'bundle_3',
    operationId: 'op_4',
    name: 'Hem Finish',
    nameNepali: 'तल्लो भाग सिलाई',
    description: 'Finish bottom hem',
    machineType: 'singleNeedle',
    sequenceOrder: 4,
    pricePerPiece: 1.5,
    smvMinutes: 3.0,
    status: 'pending',
    prerequisites: [],
    isOptional: false,
    qualityCheckRequired: false,
    defectTolerance: 8,
    bundleInfo: {
      id: 'bundle_3',
      bundleNumber: 'BND-3233-L-003',
      articleId: 'art_1',
      articleNumber: '3233',
      articleStyle: 'Adult T-shirt',
      size: 'L',
      rollId: 'roll_1',
      rollNumber: 'Roll1',
      rollColor: 'Blue',
      templateId: 'template_1',
      templateName: '3233 Template',
      templateCode: '3233',
      status: 'created',
      priority: 'normal',
      operations: [],
      createdAt: new Date(),
      createdBy: 'System',
      totalValue: 9.5,
      totalSMV: 16.5
    }
  }
];

export const OperatorSelfAssignment: React.FC<OperatorSelfAssignmentProps> = ({
  operatorId,
  operatorName,
  operatorMachineType
}) => {
  const [availableOps, setAvailableOps] = useState<(BundleOperation & { bundleInfo: ProductionBundle })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<(BundleOperation & { bundleInfo: ProductionBundle }) | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Filter operations by operator's machine type
  useEffect(() => {
    const filteredOps = mockAvailableOperations.filter(op => 
      op.machineType === operatorMachineType && op.status === 'pending'
    );
    setAvailableOps(filteredOps);
  }, [operatorMachineType]);

  // Self-assign operation
  const handleSelfAssign = async (operation: BundleOperation & { bundleInfo: ProductionBundle }) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Remove from available operations
      setAvailableOps(prev => prev.filter(op => op.id !== operation.id));
      
      setShowConfirmModal(false);
      setSelectedOperation(null);
      
      alert(`✅ You have successfully picked up ${operation.name} for ${operation.bundleInfo.bundleNumber}. The job is now assigned to you!`);
      
    } catch (error) {
      console.error('Self assignment failed:', error);
      alert('❌ Failed to assign job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority: ProductionBundle['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white animate-pulse';
      case 'high': return 'bg-orange-500 text-white';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get machine icon
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
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <UserIcon className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">Pick Your Next Job</h1>
            <p className="text-blue-100">Welcome {operatorName}! Choose available work for your {operatorMachineType} machine</p>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="bg-blue-500 bg-opacity-50 rounded-lg p-3">
            <div className="text-xl font-bold">{availableOps.length}</div>
            <div className="text-blue-100 text-sm">Available Jobs</div>
          </div>
          <div className="bg-blue-500 bg-opacity-50 rounded-lg p-3">
            <div className="text-xl font-bold">{operatorMachineType}</div>
            <div className="text-blue-100 text-sm">Your Machine</div>
          </div>
          <div className="bg-blue-500 bg-opacity-50 rounded-lg p-3">
            <div className="text-xl font-bold">
              Rs. {availableOps.reduce((sum, op) => sum + op.pricePerPiece, 0).toFixed(1)}
            </div>
            <div className="text-blue-100 text-sm">Total Earnings</div>
          </div>
        </div>
      </div>

      {/* Available Jobs */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <ClockIcon className="h-6 w-6 text-blue-600" />
          <span>Available Jobs for You</span>
        </h2>

        {availableOps.length === 0 ? (
          <Card className="p-8 text-center">
            <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No jobs available right now</h3>
            <p className="text-gray-500 mb-4">Check back in a few minutes for new {operatorMachineType} jobs.</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              Refresh Jobs
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableOps.map((operation) => (
              <Card key={operation.id} className="p-6 hover:shadow-lg transition-shadow border-2 hover:border-blue-200">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{getMachineIcon(operation.machineType)}</div>
                  <Badge variant="secondary" className="font-mono text-xs mb-2">
                    {operation.bundleInfo.bundleNumber}
                  </Badge>
                  <h3 className="text-lg font-bold text-gray-900">{operation.name}</h3>
                  <p className="text-sm text-gray-600">({operation.nameNepali})</p>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Article:</span>
                    <span className="font-medium">
                      {operation.bundleInfo.articleNumber} ({operation.bundleInfo.size})
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">You will earn:</span>
                    <span className="font-bold text-green-600 text-lg">Rs. {operation.pricePerPiece}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Time needed:</span>
                    <span className="font-medium text-blue-600">{operation.smvMinutes} min</span>
                  </div>

                  <div className="flex items-center justify-center">
                    <Badge className={getPriorityColor(operation.bundleInfo.priority)}>
                      {operation.bundleInfo.priority.toUpperCase()} PRIORITY
                    </Badge>
                  </div>

                  {operation.qualityCheckRequired && (
                    <div className="flex items-center justify-center text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
                      <StarIcon className="h-4 w-4 mr-1" />
                      Quality check required
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => {
                    setSelectedOperation(operation);
                    setShowConfirmModal(true);
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3"
                  disabled={isLoading}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>Pick This Job</span>
                    <ArrowRightIcon className="h-5 w-5" />
                  </div>
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedOperation && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />

            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">{getMachineIcon(selectedOperation.machineType)}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Job Assignment</h3>
                <p className="text-gray-600">Are you ready to start this job?</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Job:</span>
                    <span>{selectedOperation.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Bundle:</span>
                    <span className="font-mono">{selectedOperation.bundleInfo.bundleNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Article:</span>
                    <span>{selectedOperation.bundleInfo.articleNumber} ({selectedOperation.bundleInfo.size})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Earnings:</span>
                    <span className="font-bold text-green-600">Rs. {selectedOperation.pricePerPiece}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Target Time:</span>
                    <span className="font-bold text-blue-600">{selectedOperation.smvMinutes} minutes</span>
                  </div>
                </div>
              </div>

              {selectedOperation.description && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Instructions:</strong> {selectedOperation.description}
                  </p>
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedOperation(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSelfAssign(selectedOperation)}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <LoadingSpinner size="sm" />
                      <span>Assigning...</span>
                    </div>
                  ) : (
                    'Yes, Assign to Me!'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorSelfAssignment;