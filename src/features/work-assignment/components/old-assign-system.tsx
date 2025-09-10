// Old Assign System - Traditional Bundle Color-Based Work Assignment
// Implements production workflow where:
// - Overlock operations: ALL assigned to single operator per color
// - Single needle operations: Distributed among multiple operators  
// - Flatlock operations: ALL assigned to single operator per color

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { 
  Users, Clock, Package, ArrowRight, CheckCircle2, 
  Circle, Shirt, Target, Palette, Settings, Play
} from 'lucide-react';
import { cn } from '@/shared/utils';
import * as notify from '@/shared/utils/notification-utils';

interface Operation {
  id: string;
  name: string;
  nameNepali: string;
  machineType: 'overlock' | 'flatlock' | 'single_needle';
  sequence: number;
  estimatedTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  assignedTo?: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed';
}

interface Bundle {
  id: string;
  bundleNumber: string;
  articleNumber: string;
  color: 'red' | 'green' | 'blue';
  quantity: number;
  garmentType: 'tshirt' | 'polo';
  operations: Operation[];
  status: 'pending' | 'assigned' | 'in_progress' | 'completed';
  owners?: {
    overlock: string;
    flatlock: string;
    single_needle: string[];
  };
}

interface BundleOwner {
  operatorId: string;
  operatorName: string;
  machineType: 'overlock' | 'flatlock' | 'single_needle';
  assignedColor: 'red' | 'green' | 'blue';
  currentBundles: string[];
  workload: number;
  efficiency: number;
}

const OldAssignSystem: React.FC = () => {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [bundleOwners, setBundleOwners] = useState<BundleOwner[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [assignmentMap, setAssignmentMap] = useState<any>({});

  useEffect(() => {
    initializeSampleData();
  }, []);

  const initializeSampleData = () => {
    // Sample Bundle Owners for Each Color
    const sampleOwners: BundleOwner[] = [
      // Red Color Team
      { operatorId: 'RED_OV_01', operatorName: 'रमेश ओभरलक', machineType: 'overlock', assignedColor: 'red', currentBundles: [], workload: 0, efficiency: 95 },
      { operatorId: 'RED_FL_01', operatorName: 'सुनिता फ्ल्याट', machineType: 'flatlock', assignedColor: 'red', currentBundles: [], workload: 0, efficiency: 88 },
      { operatorId: 'RED_SN_01', operatorName: 'गीता सिंगल', machineType: 'single_needle', assignedColor: 'red', currentBundles: [], workload: 0, efficiency: 92 },
      { operatorId: 'RED_SN_02', operatorName: 'माया सिंगल', machineType: 'single_needle', assignedColor: 'red', currentBundles: [], workload: 0, efficiency: 87 },
      
      // Green Color Team  
      { operatorId: 'GRN_OV_01', operatorName: 'राजु ओभरलक', machineType: 'overlock', assignedColor: 'green', currentBundles: [], workload: 0, efficiency: 91 },
      { operatorId: 'GRN_FL_01', operatorName: 'कमला फ्ल्याट', machineType: 'flatlock', assignedColor: 'green', currentBundles: [], workload: 0, efficiency: 94 },
      { operatorId: 'GRN_SN_01', operatorName: 'सरिता सिंगल', machineType: 'single_needle', assignedColor: 'green', currentBundles: [], workload: 0, efficiency: 89 },
      { operatorId: 'GRN_SN_02', operatorName: 'विना सिंगल', machineType: 'single_needle', assignedColor: 'green', currentBundles: [], workload: 0, efficiency: 93 },
      
      // Blue Color Team
      { operatorId: 'BLU_OV_01', operatorName: 'हरि ओभरलक', machineType: 'overlock', assignedColor: 'blue', currentBundles: [], workload: 0, efficiency: 96 },
      { operatorId: 'BLU_FL_01', operatorName: 'लक्ष्मी फ्ल्याट', machineType: 'flatlock', assignedColor: 'blue', currentBundles: [], workload: 0, efficiency: 90 },
      { operatorId: 'BLU_SN_01', operatorName: 'अनिता सिंगल', machineType: 'single_needle', assignedColor: 'blue', currentBundles: [], workload: 0, efficiency: 88 },
      { operatorId: 'BLU_SN_02', operatorName: 'शान्ति सिंगल', machineType: 'single_needle', assignedColor: 'blue', currentBundles: [], workload: 0, efficiency: 92 }
    ];

    // T-shirt Operations Template
    const tshirtOperations: Operation[] = [
      { id: 'op1', name: 'Shoulder Seam Join', nameNepali: 'काँध सीम जोड', machineType: 'overlock', sequence: 1, estimatedTime: 2, difficulty: 'medium', status: 'pending' },
      { id: 'op2', name: 'Shoulder Top Stitch', nameNepali: 'काँध माथि सिलाई', machineType: 'flatlock', sequence: 2, estimatedTime: 1.5, difficulty: 'easy', status: 'pending' },
      { id: 'op3', name: 'Side Seam & Sleeve Attach', nameNepali: 'छेउ सीम र बाहुला जोड', machineType: 'overlock', sequence: 3, estimatedTime: 3, difficulty: 'hard', status: 'pending' },
      { id: 'op4', name: 'Neck Rib Joining', nameNepali: 'घाँटी रिब जोड', machineType: 'overlock', sequence: 4, estimatedTime: 2.5, difficulty: 'medium', status: 'pending' },
      { id: 'op5', name: 'Bottom Hemming', nameNepali: 'तलको हेमिङ', machineType: 'flatlock', sequence: 5, estimatedTime: 2, difficulty: 'easy', status: 'pending' },
      { id: 'op6', name: 'Quality Check', nameNepali: 'गुणस्तर जाँच', machineType: 'single_needle', sequence: 6, estimatedTime: 1, difficulty: 'easy', status: 'pending' }
    ];

    // Polo Operations Template (More Single Needle Work)
    const poloOperations: Operation[] = [
      { id: 'op1', name: 'Shoulder Seam Join', nameNepali: 'काँध सीम जोड', machineType: 'overlock', sequence: 1, estimatedTime: 2, difficulty: 'medium', status: 'pending' },
      { id: 'op2', name: 'Shoulder Top Stitch', nameNepali: 'काँध माथि सिलाई', machineType: 'flatlock', sequence: 2, estimatedTime: 1.5, difficulty: 'easy', status: 'pending' },
      { id: 'op3', name: 'Collar Band Making', nameNepali: 'कलर ब्यान्ड बनाउने', machineType: 'single_needle', sequence: 3, estimatedTime: 2, difficulty: 'medium', status: 'pending' },
      { id: 'op4', name: 'Collar Attach', nameNepali: 'कलर जोड्ने', machineType: 'overlock', sequence: 4, estimatedTime: 3, difficulty: 'hard', status: 'pending' },
      { id: 'op5', name: 'Placket Making', nameNepali: 'प्लाकेट बनाउने', machineType: 'single_needle', sequence: 5, estimatedTime: 4, difficulty: 'hard', status: 'pending' },
      { id: 'op6', name: 'Placket Attach', nameNepali: 'प्लाकेट जोड्ने', machineType: 'single_needle', sequence: 6, estimatedTime: 3, difficulty: 'medium', status: 'pending' },
      { id: 'op7', name: 'Side Seam & Sleeve Attach', nameNepali: 'छेउ सीम र बाहुला जोड', machineType: 'overlock', sequence: 7, estimatedTime: 3, difficulty: 'hard', status: 'pending' },
      { id: 'op8', name: 'Buttonhole Making', nameNepali: 'बटनको प्वाल', machineType: 'single_needle', sequence: 8, estimatedTime: 2.5, difficulty: 'medium', status: 'pending' },
      { id: 'op9', name: 'Button Attach', nameNepali: 'बटन जोड्ने', machineType: 'single_needle', sequence: 9, estimatedTime: 2, difficulty: 'easy', status: 'pending' },
      { id: 'op10', name: 'Bottom Hemming', nameNepali: 'तलको हेमिङ', machineType: 'flatlock', sequence: 10, estimatedTime: 2, difficulty: 'easy', status: 'pending' }
    ];

    // Sample Bundles
    const sampleBundles: Bundle[] = [
      {
        id: 'bundle1',
        bundleNumber: 'R001',
        articleNumber: '3233',
        color: 'red',
        quantity: 50,
        garmentType: 'tshirt',
        operations: JSON.parse(JSON.stringify(tshirtOperations)),
        status: 'pending'
      },
      {
        id: 'bundle2', 
        bundleNumber: 'G001',
        articleNumber: '3233',
        color: 'green',
        quantity: 45,
        garmentType: 'polo',
        operations: JSON.parse(JSON.stringify(poloOperations)),
        status: 'pending'
      },
      {
        id: 'bundle3',
        bundleNumber: 'B001', 
        articleNumber: '3233',
        color: 'blue',
        quantity: 60,
        garmentType: 'tshirt',
        operations: JSON.parse(JSON.stringify(tshirtOperations)),
        status: 'pending'
      }
    ];

    setBundleOwners(sampleOwners);
    setBundles(sampleBundles);
  };

  const getColorClass = (color: string) => {
    switch(color) {
      case 'red': return 'border-red-500 bg-red-50';
      case 'green': return 'border-green-500 bg-green-50';
      case 'blue': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getColorBadge = (color: string) => {
    switch(color) {
      case 'red': return <Badge className="bg-red-100 text-red-800">🔴 Red</Badge>;
      case 'green': return <Badge className="bg-green-100 text-green-800">🟢 Green</Badge>;
      case 'blue': return <Badge className="bg-blue-100 text-blue-800">🔵 Blue</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">⚫ Unknown</Badge>;
    }
  };

  const assignBundleOwners = (bundle: Bundle) => {
    const colorTeam = bundleOwners.filter(owner => owner.assignedColor === bundle.color);
    
    // Find single operator for each machine type in this color
    const overlockOperator = colorTeam.find(op => op.machineType === 'overlock');
    const flatlockOperator = colorTeam.find(op => op.machineType === 'flatlock');
    const singleNeedleOperators = colorTeam.filter(op => op.machineType === 'single_needle');

    if (!overlockOperator || !flatlockOperator || singleNeedleOperators.length === 0) {
      notify.error('Color team incomplete! Cannot assign bundle.', 'Assignment Error');
      return;
    }

    const assignment = {
      overlock: overlockOperator.operatorId,
      flatlock: flatlockOperator.operatorId,
      single_needle: singleNeedleOperators.map(op => op.operatorId)
    };

    // Assign operations based on machine type
    const updatedOperations = bundle.operations.map((op) => {
      let assignedTo: string;

      if (op.machineType === 'overlock') {
        // ALL overlock operations go to single overlock operator for this color
        assignedTo = assignment.overlock;
      } else if (op.machineType === 'flatlock') {
        // ALL flatlock operations go to single flatlock operator for this color
        assignedTo = assignment.flatlock;
      } else {
        // Single needle operations distributed among single needle operators
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
          workload: Math.min(100, owner.workload + (bundle.quantity / 2))
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

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Palette className="w-8 h-8 text-purple-600" />
            Old Assign System
          </h1>
          <p className="text-gray-600 mt-1">
            Traditional color-based bundle assignment with operator ownership
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            leftIcon={<Settings className="w-4 h-4" />}
          >
            Settings
          </Button>
        </div>
      </div>

      {/* Color Assignment Map */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['red', 'green', 'blue'].map((color) => {
          const colorTeam = bundleOwners.filter(owner => owner.assignedColor === color);
          const colorBundles = bundles.filter(bundle => bundle.color === color);
          
          return (
            <Card key={color} className={cn("border-2", getColorClass(color))}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {getColorBadge(color)}
                  <Badge className="bg-white text-gray-700">
                    {colorBundles.length} bundles
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Team Members */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Team Members:</p>
                  {colorTeam.map((operator) => (
                    <div key={operator.operatorId} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        {operator.machineType === 'overlock' && <Target className="w-3 h-3 text-orange-600" />}
                        {operator.machineType === 'flatlock' && <Circle className="w-3 h-3 text-green-600" />}
                        {operator.machineType === 'single_needle' && <Shirt className="w-3 h-3 text-blue-600" />}
                        {operator.operatorName}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          operator.workload > 80 ? "bg-red-400" :
                          operator.workload > 50 ? "bg-yellow-400" : "bg-green-400"
                        )} />
                        <span className="text-xs text-gray-500">{Math.round(operator.workload)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Current Bundles */}
                {colorTeam.some(op => op.currentBundles.length > 0) && (
                  <div className="pt-2 border-t">
                    <p className="text-xs font-medium text-gray-600">Active Bundles:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Array.from(new Set(colorTeam.flatMap(op => op.currentBundles))).map(bundleNum => (
                        <Badge key={bundleNum} className="bg-white text-gray-700 text-xs">
                          {bundleNum}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bundles List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Production Bundles ({bundles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bundles.map((bundle) => (
              <div 
                key={bundle.id}
                className={cn(
                  "border-2 rounded-lg p-4 transition-all duration-200",
                  getColorClass(bundle.color),
                  selectedBundle?.id === bundle.id ? "ring-2 ring-purple-500" : ""
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg">{bundle.bundleNumber}</h3>
                    {getColorBadge(bundle.color)}
                    <Badge className="bg-white text-gray-700">
                      {bundle.articleNumber} • {bundle.quantity} pcs
                    </Badge>
                    <Badge className={cn(
                      bundle.status === 'assigned' ? 'bg-green-100 text-green-800' :
                      bundle.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    )}>
                      {bundle.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    {bundle.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => assignBundleOwners(bundle)}
                        leftIcon={<Play className="w-4 h-4" />}
                      >
                        Assign Bundle Owners
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedBundle(selectedBundle?.id === bundle.id ? null : bundle)}
                    >
                      {selectedBundle?.id === bundle.id ? 'Hide' : 'View'} Operations
                    </Button>
                  </div>
                </div>

                {/* Bundle Owners Display */}
                {bundle.owners && (
                  <div className="mb-3 p-3 bg-white rounded border">
                    <p className="text-sm font-medium text-gray-700 mb-2">Bundle Owners:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-orange-600" />
                        <span className="font-medium">Overlock:</span>
                        <span>{getOperatorName(bundle.owners.overlock)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Circle className="w-4 h-4 text-green-600" />
                        <span className="font-medium">Flatlock:</span>
                        <span>{getOperatorName(bundle.owners.flatlock)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shirt className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Single Needle:</span>
                        <span>{bundle.owners.single_needle.length} operators</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Operations Detail */}
                {selectedBundle?.id === bundle.id && (
                  <div className="space-y-2 bg-white p-3 rounded border">
                    <p className="font-medium text-gray-700">Operations ({bundle.operations.length}):</p>
                    {bundle.operations.map((operation, idx) => (
                      <div key={operation.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm bg-gray-200 px-2 py-1 rounded">
                            #{operation.sequence}
                          </span>
                          <div>
                            <p className="font-medium">{operation.name}</p>
                            <p className="text-sm text-gray-600">{operation.nameNepali}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {operation.machineType === 'overlock' && <Target className="w-4 h-4 text-orange-600" />}
                            {operation.machineType === 'flatlock' && <Circle className="w-4 h-4 text-green-600" />}  
                            {operation.machineType === 'single_needle' && <Shirt className="w-4 h-4 text-blue-600" />}
                            <Badge className="bg-white text-gray-700 text-xs">
                              {operation.machineType}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-600">{operation.estimatedTime}min</span>
                          </div>
                          
                          {operation.assignedTo && (
                            <div className="flex items-center gap-2">
                              <ArrowRight className="w-3 h-3 text-gray-400" />
                              <span className="text-sm font-medium text-gray-800">
                                {getOperatorName(operation.assignedTo)}
                              </span>
                            </div>
                          )}
                          
                          {operation.status === 'assigned' ? 
                            <CheckCircle2 className="w-4 h-4 text-green-600" /> :
                            <Circle className="w-4 h-4 text-gray-400" />
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OldAssignSystem;