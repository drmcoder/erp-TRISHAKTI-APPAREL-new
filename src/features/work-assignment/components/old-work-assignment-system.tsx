// Old Work Assignment System - Bundle Owner + Machine Type Assignment
// Manual color-based assignment where operators own entire bundles by machine type
// Red bundles → Overlock Op1, Flatlock Op2, Single Needle Pool A
// Green bundles → Overlock Op3, Flatlock Op4, Single Needle Pool B

import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Input } from '@/shared/components/ui/Input';
import { 
  UserGroupIcon,
  SwatchIcon,
  CogIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { notify } from '@/utils/notification-utils';

interface BundleOwner {
  operatorId: string;
  operatorName: string;
  machineType: 'overlock' | 'flatlock' | 'single_needle';
  assignedColor: string;
  currentBundles: string[];
  workload: number; // 0-100%
}

interface Bundle {
  id: string;
  bundleNumber: string;
  articleNumber: string;
  articleType: 'tshirt' | 'polo' | 'hoodie';
  color: string;
  colorCode: string; // HEX code
  quantity: number;
  priority: 'normal' | 'high' | 'urgent';
  operations: BundleOperation[];
  owners: {
    overlock?: string;
    flatlock?: string;
    single_needle?: string[];
  };
  status: 'pending' | 'assigned' | 'in_progress' | 'completed';
}

interface BundleOperation {
  id: string;
  operationName: string;
  machineType: 'overlock' | 'flatlock' | 'single_needle';
  sequence: number;
  assignedTo?: string;
  status: 'pending' | 'assigned' | 'completed';
  estimatedMinutes: number;
}

const OldWorkAssignmentSystem: React.FC = () => {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [bundleOwners, setBundleOwners] = useState<BundleOwner[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [colorAssignments, setColorAssignments] = useState<Map<string, {
    overlock: string;
    flatlock: string;
    single_needle: string[];
  }>>(new Map());
  const [showOwnerSelection, setShowOwnerSelection] = useState(false);

  useEffect(() => {
    initializeSystem();
  }, []);

  const initializeSystem = () => {
    // Initialize bundle owners (operators by machine type)
    const owners: BundleOwner[] = [
      // Overlock Operators
      { operatorId: 'over_1', operatorName: 'Maya Patel', machineType: 'overlock', assignedColor: 'red', currentBundles: [], workload: 45 },
      { operatorId: 'over_2', operatorName: 'Ram Sharma', machineType: 'overlock', assignedColor: 'green', currentBundles: [], workload: 30 },
      { operatorId: 'over_3', operatorName: 'Priya Singh', machineType: 'overlock', assignedColor: 'blue', currentBundles: [], workload: 20 },
      
      // Flatlock Operators  
      { operatorId: 'flat_1', operatorName: 'Sita Devi', machineType: 'flatlock', assignedColor: 'red', currentBundles: [], workload: 60 },
      { operatorId: 'flat_2', operatorName: 'Krishna Kumar', machineType: 'flatlock', assignedColor: 'green', currentBundles: [], workload: 40 },
      { operatorId: 'flat_3', operatorName: 'Anita Thapa', machineType: 'flatlock', assignedColor: 'blue', currentBundles: [], workload: 25 },
      
      // Single Needle Operators (distributed)
      { operatorId: 'single_1', operatorName: 'Raj Patel', machineType: 'single_needle', assignedColor: 'red', currentBundles: [], workload: 35 },
      { operatorId: 'single_2', operatorName: 'Geeta Sharma', machineType: 'single_needle', assignedColor: 'red', currentBundles: [], workload: 50 },
      { operatorId: 'single_3', operatorName: 'Bikram Rai', machineType: 'single_needle', assignedColor: 'green', currentBundles: [], workload: 40 },
      { operatorId: 'single_4', operatorName: 'Sunita Magar', machineType: 'single_needle', assignedColor: 'green', currentBundles: [], workload: 30 },
    ];
    setBundleOwners(owners);

    // Set up color assignments
    const colorMap = new Map();
    colorMap.set('red', {
      overlock: 'over_1',
      flatlock: 'flat_1', 
      single_needle: ['single_1', 'single_2']
    });
    colorMap.set('green', {
      overlock: 'over_2',
      flatlock: 'flat_2',
      single_needle: ['single_3', 'single_4'] 
    });
    colorMap.set('blue', {
      overlock: 'over_3',
      flatlock: 'flat_3',
      single_needle: ['single_1', 'single_3'] // Cross-color for flexibility
    });
    setColorAssignments(colorMap);

    // Initialize sample bundles
    setBundles([
      {
        id: 'B001',
        bundleNumber: 'TSA-B-001',
        articleNumber: '3233',
        articleType: 'tshirt',
        color: 'Red',
        colorCode: '#DC2626',
        quantity: 50,
        priority: 'normal',
        operations: getTshirtOperations(),
        owners: {},
        status: 'pending'
      },
      {
        id: 'B002', 
        bundleNumber: 'TSA-B-002',
        articleNumber: '3234',
        articleType: 'polo',
        color: 'Green',
        colorCode: '#16A34A',
        quantity: 30,
        priority: 'high',
        operations: getPoloOperations(),
        owners: {},
        status: 'pending'
      },
      {
        id: 'B003',
        bundleNumber: 'TSA-B-003', 
        articleNumber: '3233',
        articleType: 'tshirt',
        color: 'Blue',
        colorCode: '#2563EB',
        quantity: 40,
        priority: 'urgent',
        operations: getTshirtOperations(),
        owners: {},
        status: 'pending'
      }
    ]);
  };

  const getTshirtOperations = (): BundleOperation[] => [
    { id: '1', operationName: 'Shoulder Join (Front + Back)', machineType: 'overlock', sequence: 1, status: 'pending', estimatedMinutes: 15 },
    { id: '2', operationName: 'Shoulder Top Stitch', machineType: 'flatlock', sequence: 2, status: 'pending', estimatedMinutes: 10 },
    { id: '3', operationName: 'Side Seam & Sleeve Join', machineType: 'overlock', sequence: 3, status: 'pending', estimatedMinutes: 25 },
    { id: '4', operationName: 'Bottom Hemming', machineType: 'flatlock', sequence: 4, status: 'pending', estimatedMinutes: 12 },
    { id: '5', operationName: 'Neck Rib Join', machineType: 'overlock', sequence: 5, status: 'pending', estimatedMinutes: 18 },
    { id: '6', operationName: 'Neck Rib Top Stitch', machineType: 'flatlock', sequence: 6, status: 'pending', estimatedMinutes: 8 },
  ];

  const getPoloOperations = (): BundleOperation[] => [
    { id: '1', operationName: 'Shoulder Join (Front + Back)', machineType: 'overlock', sequence: 1, status: 'pending', estimatedMinutes: 15 },
    { id: '2', operationName: 'Shoulder Top Stitch', machineType: 'flatlock', sequence: 2, status: 'pending', estimatedMinutes: 10 },
    { id: '3', operationName: 'Placket Sewing', machineType: 'single_needle', sequence: 3, status: 'pending', estimatedMinutes: 20 },
    { id: '4', operationName: 'Slit Making', machineType: 'single_needle', sequence: 4, status: 'pending', estimatedMinutes: 8 },
    { id: '5', operationName: 'Side Seam & Sleeve Join', machineType: 'overlock', sequence: 5, status: 'pending', estimatedMinutes: 25 },
    { id: '6', operationName: 'Bottom Hemming', machineType: 'flatlock', sequence: 6, status: 'pending', estimatedMinutes: 12 },
    { id: '7', operationName: 'Collar Attachment', machineType: 'single_needle', sequence: 7, status: 'pending', estimatedMinutes: 22 },
    { id: '8', operationName: 'Collar Top Stitch', machineType: 'single_needle', sequence: 8, status: 'pending', estimatedMinutes: 15 },
    { id: '9', operationName: 'Button Hole', machineType: 'single_needle', sequence: 9, status: 'pending', estimatedMinutes: 12 },
    { id: '10', operationName: 'Button Attach', machineType: 'single_needle', sequence: 10, status: 'pending', estimatedMinutes: 10 },
  ];

  const assignBundleOwners = (bundle: Bundle) => {
    const colorKey = bundle.color.toLowerCase();
    const assignment = colorAssignments.get(colorKey);
    
    if (!assignment) {
      notify.error(`No color assignment found for ${bundle.color}`, 'Assignment Error');
      return;
    }

    // Auto-assign operations based on machine type and color
    const updatedOperations = bundle.operations.map(op => {
      let assignedTo = '';
      
      if (op.machineType === 'overlock') {
        assignedTo = assignment.overlock;
      } else if (op.machineType === 'flatlock') {
        assignedTo = assignment.flatlock;
      } else if (op.machineType === 'single_needle') {
        // Distribute single needle work among pool
        const availableOperators = assignment.single_needle;
        const operatorIndex = (op.sequence - 1) % availableOperators.length;
        assignedTo = availableOperators[operatorIndex];
      }

      return {
        ...op,
        assignedTo,
        status: 'assigned' as const
      };
    });

    // Update bundle
    const updatedBundle: Bundle = {
      ...bundle,
      operations: updatedOperations,
      owners: {
        overlock: assignment.overlock,
        flatlock: assignment.flatlock,
        single_needle: assignment.single_needle
      },
      status: 'assigned'
    };

    setBundles(prev => prev.map(b => b.id === bundle.id ? updatedBundle : b));
    
    // Update operator workloads
    setBundleOwners(prev => prev.map(owner => {
      const isAssigned = [
        assignment.overlock,
        assignment.flatlock,
        ...assignment.single_needle
      ].includes(owner.operatorId);
      
      if (isAssigned) {
        return {
          ...owner,
          currentBundles: [...owner.currentBundles, bundle.bundleNumber],
          workload: Math.min(100, owner.workload + (bundle.quantity / 2)) // Simple workload calc
        };
      }
      return owner;
    }));

    notify.success(`Bundle ${bundle.bundleNumber} assigned using ${bundle.color} color mapping!`, 'Bundle Assigned');
    setSelectedBundle(null);
  };

  const getOperatorName = (operatorId: string): string => {
    const operator = bundleOwners.find(op => op.operatorId === operatorId);
    return operator ? operator.operatorName : 'Unknown';
  };

  const getMachineTypeColor = (machineType: string) => {
    switch (machineType) {
      case 'overlock': return 'bg-blue-100 text-blue-800';
      case 'flatlock': return 'bg-green-100 text-green-800';
      case 'single_needle': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold flex items-center mb-2">
            <SwatchIcon className="h-7 w-7 mr-3" />
            Old Work Assignment System
          </h1>
          <p className="text-orange-100">Bundle Owner Assignment by Color & Machine Type</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        
        {/* Today's Assignment Map */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📅 Today's Assignment Map</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from(colorAssignments.entries()).map(([color, assignment]) => (
              <div key={color} className="border rounded-lg p-4 bg-white">
                <div className="flex items-center space-x-2 mb-3">
                  <div 
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: color === 'red' ? '#DC2626' : color === 'green' ? '#16A34A' : '#2563EB' }}
                  ></div>
                  <h3 className="font-bold text-gray-900 capitalize">{color} Color Bundles:</h3>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold text-blue-700">• Overlock:</span> {getOperatorName(assignment.overlock)}
                  </div>
                  <div>
                    <span className="font-semibold text-green-700">• Flatlock:</span> {getOperatorName(assignment.flatlock)}
                  </div>
                  <div>
                    <span className="font-semibold text-purple-700">• Single Needle:</span> 
                    <div className="ml-4">
                      {assignment.single_needle.map((opId, idx) => (
                        <div key={opId}>↳ {getOperatorName(opId)}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Pending Bundles */}
          <div>
            <h2 className="text-xl font-bold mb-4">📦 Pending Bundles</h2>
            <div className="space-y-4">
              {bundles.filter(b => b.status === 'pending').map(bundle => (
                <Card key={bundle.id} className="p-6 border-l-4" style={{ borderLeftColor: bundle.colorCode }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h3 className="text-lg font-bold">{bundle.bundleNumber}</h3>
                        <p className="text-sm text-gray-600">{bundle.articleNumber} - {bundle.articleType.toUpperCase()}</p>
                      </div>
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: bundle.colorCode }}
                      ></div>
                    </div>
                    <Badge className={bundle.priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                      {bundle.priority}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-500">Quantity:</span>
                      <div className="font-semibold">{bundle.quantity} pcs</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Operations:</span>
                      <div className="font-semibold">{bundle.operations.length}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Color:</span>
                      <div className="font-semibold">{bundle.color}</div>
                    </div>
                  </div>

                  <Button
                    onClick={() => assignBundleOwners(bundle)}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    Assign Bundle Owners
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          {/* Assigned Bundles */}
          <div>
            <h2 className="text-xl font-bold mb-4">✅ Assigned Bundles</h2>
            <div className="space-y-4">
              {bundles.filter(b => b.status === 'assigned').map(bundle => (
                <Card key={bundle.id} className="p-6 bg-green-50 border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircleIcon className="h-6 w-6 text-green-600" />
                      <div>
                        <h3 className="text-lg font-bold">{bundle.bundleNumber}</h3>
                        <p className="text-sm text-gray-600">{bundle.articleNumber} - {bundle.articleType.toUpperCase()}</p>
                      </div>
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: bundle.colorCode }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm">
                      <div className="font-semibold text-gray-700 mb-2">Bundle Owners:</div>
                      <div className="grid grid-cols-1 gap-1">
                        {bundle.owners.overlock && (
                          <div className="flex justify-between">
                            <span className="text-blue-700">Overlock:</span>
                            <span className="font-medium">{getOperatorName(bundle.owners.overlock)}</span>
                          </div>
                        )}
                        {bundle.owners.flatlock && (
                          <div className="flex justify-between">
                            <span className="text-green-700">Flatlock:</span>
                            <span className="font-medium">{getOperatorName(bundle.owners.flatlock)}</span>
                          </div>
                        )}
                        {bundle.owners.single_needle && bundle.owners.single_needle.length > 0 && (
                          <div>
                            <span className="text-purple-700">Single Needle Pool:</span>
                            <div className="ml-4">
                              {bundle.owners.single_needle.map(opId => (
                                <div key={opId} className="text-sm">↳ {getOperatorName(opId)}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="text-sm text-gray-600 mb-2">Operation Flow:</div>
                      <div className="space-y-1">
                        {bundle.operations.slice(0, 4).map((op, idx) => (
                          <div key={op.id} className="flex items-center justify-between text-xs">
                            <span>{op.sequence}. {op.operationName}</span>
                            <div className="flex items-center space-x-2">
                              <Badge className={getMachineTypeColor(op.machineType)}>
                                {op.machineType.replace('_', ' ')}
                              </Badge>
                              <span className="text-gray-600">{getOperatorName(op.assignedTo || '')}</span>
                            </div>
                          </div>
                        ))}
                        {bundle.operations.length > 4 && (
                          <div className="text-xs text-gray-500">... +{bundle.operations.length - 4} more operations</div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Operator Workload Summary */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">👥 Operator Workload Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['overlock', 'flatlock', 'single_needle'].map(machineType => (
              <div key={machineType}>
                <h4 className="font-semibold capitalize mb-3 text-gray-700">{machineType.replace('_', ' ')} Operators:</h4>
                <div className="space-y-2">
                  {bundleOwners.filter(op => op.machineType === machineType).map(operator => (
                    <div key={operator.operatorId} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{operator.operatorName}</span>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: operator.assignedColor === 'red' ? '#DC2626' : operator.assignedColor === 'green' ? '#16A34A' : '#2563EB' }}
                          ></div>
                          <span className="text-xs text-gray-600">{operator.assignedColor}</span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <div>Workload: {operator.workload}%</div>
                        <div>Bundles: {operator.currentBundles.length}</div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full ${operator.workload > 80 ? 'bg-red-500' : operator.workload > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(100, operator.workload)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Instructions */}
        <Card className="p-6 mt-6 bg-orange-50 border-orange-200">
          <h3 className="text-lg font-bold text-orange-800 mb-3">🎯 How Old Work Assignment System Works</h3>
          <div className="text-sm text-orange-700 space-y-2">
            <div>📍 <strong>Bundle Owner Concept:</strong> Each color has dedicated operators for each machine type</div>
            <div>🎨 <strong>Color Mapping:</strong> Red/Green/Blue bundles automatically assign to their dedicated operators</div>
            <div>🔧 <strong>Machine Specialization:</strong> Overlock & Flatlock operators own all operations, Single Needle work is distributed</div>
            <div>🔄 <strong>Operation Flow:</strong> T-shirt: Shoulder → Top Stitch → Side Seam → Hemming → Neck operations</div>
            <div>👕 <strong>Article Types:</strong> T-shirt has 6 operations, Polo has 10+ operations with more single needle work</div>
            <div>⚡ <strong>Efficiency:</strong> Operators become experts in their color bundles and machine types</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OldWorkAssignmentSystem;