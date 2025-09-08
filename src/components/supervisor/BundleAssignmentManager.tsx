// Bundle Assignment Manager - Supervisor interface for assigning bundles to operators
// Shows all bundles from cutting droplet and allows assignment to specific operators

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { 
  Users,
  Package,
  Settings,
  Clock,
  Target,
  Play,
  CheckCircle2,
  AlertCircle,
  User,
  ArrowRight,
  Eye,
  Filter
} from 'lucide-react';
// WORKAROUND: Define types locally due to persistent import issues
import { enhancedProductionService } from '@/services/enhanced-production-service';

// Local type definitions (temporary workaround)
interface ProductionBundle {
  id: string;
  bundleNumber: string;
  lotNumber: string;
  articleNumber: string;
  color: string;
  size: string;
  pieces: number;
  currentStep: number;
  processSteps: BundleProcessStep[];
  status: 'ready' | 'in_progress' | 'completed' | 'on_hold';
  assignedOperators: string[];
  createdAt: any;
  startedAt?: any;
  completedAt?: any;
}

interface BundleProcessStep {
  stepNumber: number;
  operation: string;
  operationNepali: string;
  machineType: string;
  pricePerPiece: number;
  estimatedMinutes: number;
  canRunParallel: boolean;
  dependencies: number[];
  status: 'waiting' | 'ready' | 'in_progress' | 'completed' | 'skipped';
  assignedOperator?: string;
  completedPieces: number;
  startTime?: any;
  endTime?: any;
  qualityNotes?: string;
}

interface CuttingDroplet {
  id: string;
  lotNumber: string;
  articleNumber: string;
  articleName: string;
  garmentType: 'tshirt' | 'polo' | 'shirt' | 'pants';
  totalRolls: number;
  totalKg: number;
  colorSizeData: any[];
  createdAt: any;
  createdBy: string;
  status: 'cutting' | 'ready_for_sewing' | 'in_production' | 'completed';
}
import { toast } from 'sonner';

interface Operator {
  id: string;
  name: string;
  machineTypes: string[];
  skillLevel: 'basic' | 'intermediate' | 'advanced' | 'expert';
  status: 'available' | 'busy' | 'break' | 'offline';
  currentWork?: string;
}

// Sample operator data - in real app this comes from database
const SAMPLE_OPERATORS: Operator[] = [
  {
    id: 'op1',
    name: 'राम बहादुर (Ram Bahadur)',
    machineTypes: ['overlock', 'flatlock'],
    skillLevel: 'advanced',
    status: 'available',
  },
  {
    id: 'op2', 
    name: 'सीता देवी (Sita Devi)',
    machineTypes: ['single_needle'],
    skillLevel: 'expert',
    status: 'available',
  },
  {
    id: 'op3',
    name: 'हरि श्रेष्ठ (Hari Shrestha)', 
    machineTypes: ['overlock'],
    skillLevel: 'intermediate',
    status: 'busy',
    currentWork: 'LOT001-Blue-XL-1'
  },
  {
    id: 'op4',
    name: 'गीता तामाङ (Geeta Tamang)',
    machineTypes: ['single_needle', 'buttonhole'],
    skillLevel: 'advanced',
    status: 'available',
  },
  {
    id: 'op5',
    name: 'कमल राई (Kamal Rai)',
    machineTypes: ['flatlock', 'finishing'],
    skillLevel: 'basic',
    status: 'available',
  }
];

const MACHINE_TYPE_COLORS = {
  single_needle: 'bg-blue-100 text-blue-800',
  overlock: 'bg-green-100 text-green-800', 
  flatlock: 'bg-purple-100 text-purple-800',
  buttonhole: 'bg-orange-100 text-orange-800',
  button_attach: 'bg-pink-100 text-pink-800',
  cutting: 'bg-gray-100 text-gray-800',
  finishing: 'bg-indigo-100 text-indigo-800'
};

const MACHINE_TYPE_NEPALI = {
  single_needle: 'सिंगल निडल',
  overlock: 'ओभरलक', 
  flatlock: 'फ्ल्यालक',
  buttonhole: 'बटन होल',
  button_attach: 'बटन एट्याच',
  cutting: 'काटने',
  finishing: 'फिनिशिङ'
};

const STATUS_COLORS = {
  available: 'bg-green-100 text-green-800',
  busy: 'bg-yellow-100 text-yellow-800',
  break: 'bg-blue-100 text-blue-800',
  offline: 'bg-red-100 text-red-800'
};

const STEP_STATUS_COLORS = {
  waiting: 'bg-gray-100 text-gray-800',
  ready: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  skipped: 'bg-red-100 text-red-800'
};

export const BundleAssignmentManager: React.FC = () => {
  const [bundles, setBundles] = useState<ProductionBundle[]>([]);
  const [operators, setOperators] = useState<Operator[]>(SAMPLE_OPERATORS);
  const [cuttingDroplets, setCuttingDroplets] = useState<CuttingDroplet[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<ProductionBundle | null>(null);
  const [selectedStep, setSelectedStep] = useState<BundleProcessStep | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMachine, setFilterMachine] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // In real app, load bundles and cutting droplets from database
      // setBundles(await enhancedProductionService.getBundles());
      // setCuttingDroplets(await enhancedProductionService.getCuttingDroplets());
      
      // Sample data for testing
      const sampleBundles: ProductionBundle[] = [
        {
          id: 'b1',
          bundleNumber: 'LOT001-Blue-XL-1',
          lotNumber: 'LOT001',
          articleNumber: '8082',
          color: 'Blue',
          size: 'XL', 
          pieces: 30,
          currentStep: 1,
          status: 'ready',
          assignedOperators: [],
          createdAt: new Date(),
          processSteps: [
            {
              stepNumber: 1,
              operation: 'Collar Making',
              operationNepali: 'कलर बनाउने',
              machineType: 'single_needle',
              pricePerPiece: 2.5,
              estimatedMinutes: 4,
              canRunParallel: true,
              dependencies: [],
              status: 'ready',
              completedPieces: 0
            },
            {
              stepNumber: 2,
              operation: 'Placket Making', 
              operationNepali: 'प्लेकेट बनाउने',
              machineType: 'single_needle',
              pricePerPiece: 2.0,
              estimatedMinutes: 3,
              canRunParallel: true,
              dependencies: [],
              status: 'ready',
              completedPieces: 0
            },
            {
              stepNumber: 3,
              operation: 'Shoulder Join',
              operationNepali: 'काँध जोड्ने',
              machineType: 'overlock',
              pricePerPiece: 1.5,
              estimatedMinutes: 2,
              canRunParallel: false,
              dependencies: [1, 2],
              status: 'waiting',
              completedPieces: 0
            }
          ]
        },
        {
          id: 'b2',
          bundleNumber: 'LOT001-Green-2XL-2',
          lotNumber: 'LOT001',
          articleNumber: '8082', 
          color: 'Green',
          size: '2XL',
          pieces: 28,
          currentStep: 1,
          status: 'ready',
          assignedOperators: [],
          createdAt: new Date(),
          processSteps: [
            {
              stepNumber: 1,
              operation: 'Collar Making',
              operationNepali: 'कलर बनाउने', 
              machineType: 'single_needle',
              pricePerPiece: 2.5,
              estimatedMinutes: 4,
              canRunParallel: true,
              dependencies: [],
              status: 'ready',
              completedPieces: 0
            }
          ]
        }
      ];
      
      setBundles(sampleBundles);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load bundles');
    } finally {
      setLoading(false);
    }
  };

  const assignStepToOperator = async (bundle: ProductionBundle, step: BundleProcessStep, operatorId: string) => {
    try {
      const operator = operators.find(op => op.id === operatorId);
      if (!operator) return;

      await enhancedProductionService.assignBundleStepToOperator(
        bundle.id,
        step.stepNumber, 
        operatorId,
        operator.name
      );

      toast.success(`Assigned ${step.operation} to ${operator.name}`);
      
      // Update local state
      setOperators(prev => prev.map(op => 
        op.id === operatorId 
          ? { ...op, status: 'busy', currentWork: bundle.bundleNumber }
          : op
      ));

      loadData(); // Refresh bundles
      setSelectedBundle(null);
      setSelectedStep(null);
    } catch (error) {
      console.error('Error assigning step:', error);
      toast.error('Failed to assign work');
    }
  };

  const getCompatibleOperators = (step: BundleProcessStep) => {
    return operators.filter(operator => 
      operator.machineTypes.includes(step.machineType) &&
      operator.status === 'available'
    );
  };

  const filteredBundles = bundles.filter(bundle => {
    if (filterStatus !== 'all' && bundle.status !== filterStatus) return false;
    
    if (filterMachine !== 'all') {
      const hasMatchingStep = bundle.processSteps.some(step => 
        step.machineType === filterMachine && 
        (step.status === 'ready' || step.status === 'waiting')
      );
      if (!hasMatchingStep) return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Bundle Assignment Manager
          </CardTitle>
          <CardDescription>
            Assign production bundles and operations to available operators
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="bundles" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bundles">Bundle Assignment</TabsTrigger>
          <TabsTrigger value="operators">Operator Status</TabsTrigger>
        </TabsList>

        {/* Bundle Assignment Tab */}
        <TabsContent value="bundles" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                  <div className="flex items-center space-x-2">
                    <Label>Status:</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Label>Machine:</Label>
                    <Select value={filterMachine} onValueChange={setFilterMachine}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Machines</SelectItem>
                        <SelectItem value="single_needle">Single Needle</SelectItem>
                        <SelectItem value="overlock">Overlock</SelectItem>
                        <SelectItem value="flatlock">Flatlock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  {filteredBundles.length} bundles found
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bundles List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Bundles Column */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Production Bundles
              </h3>
              
              {loading ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading bundles...</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredBundles.map(bundle => (
                    <Card 
                      key={bundle.id}
                      className={`cursor-pointer transition-colors ${
                        selectedBundle?.id === bundle.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedBundle(bundle)}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-medium">{bundle.bundleNumber}</div>
                            <div className="text-sm text-muted-foreground">
                              {bundle.color} {bundle.size} - {bundle.pieces} pieces
                            </div>
                          </div>
                          <Badge className={STATUS_COLORS[bundle.status] || 'bg-gray-100 text-gray-800'}>
                            {bundle.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">Step {bundle.currentStep}</span>
                            <span className="text-xs">
                              Ready: {bundle.processSteps.filter(s => s.status === 'ready').length}
                            </span>
                          </div>
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Steps & Assignment Column */}
            <div className="space-y-4">
              {selectedBundle ? (
                <>
                  <h3 className="font-semibold flex items-center">
                    <Target className="h-4 w-4 mr-2" />
                    Process Steps - {selectedBundle.bundleNumber}
                  </h3>
                  
                  <div className="space-y-2">
                    {selectedBundle.processSteps.map(step => (
                      <Card 
                        key={step.stepNumber}
                        className={`cursor-pointer ${
                          selectedStep?.stepNumber === step.stepNumber ? 'ring-2 ring-primary' : ''
                        } ${step.status === 'ready' ? 'border-green-200' : ''}`}
                        onClick={() => setSelectedStep(step)}
                      >
                        <CardContent className="pt-3 pb-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                                {step.stepNumber}
                              </div>
                              <div>
                                <div className="font-medium text-sm">{step.operation}</div>
                                <div className="text-xs text-muted-foreground">{step.operationNepali}</div>
                              </div>
                            </div>
                            <Badge className={STEP_STATUS_COLORS[step.status]}>
                              {step.status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Badge className={MACHINE_TYPE_COLORS[step.machineType]}>
                              {MACHINE_TYPE_NEPALI[step.machineType]}
                            </Badge>
                            <div className="text-sm">
                              Rs. {step.pricePerPiece} × {selectedBundle.pieces} = Rs. {(step.pricePerPiece * selectedBundle.pieces).toFixed(2)}
                            </div>
                          </div>
                          
                          {step.dependencies.length > 0 && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              <AlertCircle className="h-3 w-3 inline mr-1" />
                              Depends on steps: {step.dependencies.join(', ')}
                            </div>
                          )}
                          
                          {step.assignedOperator && (
                            <div className="mt-2 text-xs text-green-600">
                              <User className="h-3 w-3 inline mr-1" />
                              Assigned to operator
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Assignment Section */}
                  {selectedStep && selectedStep.status === 'ready' && !selectedStep.assignedOperator && (
                    <Card className="border-blue-200 bg-blue-50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">
                          Assign {selectedStep.operation} to Operator
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {getCompatibleOperators(selectedStep).map(operator => (
                            <div key={operator.id} className="flex items-center justify-between p-3 border rounded">
                              <div className="flex items-center space-x-3">
                                <Badge className={STATUS_COLORS[operator.status]}>
                                  {operator.status}
                                </Badge>
                                <div>
                                  <div className="font-medium text-sm">{operator.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    Skills: {operator.machineTypes.map(type => MACHINE_TYPE_NEPALI[type]).join(', ')}
                                  </div>
                                </div>
                              </div>
                              
                              <Button 
                                size="sm"
                                onClick={() => assignStepToOperator(selectedBundle, selectedStep, operator.id)}
                              >
                                <ArrowRight className="h-4 w-4 mr-1" />
                                Assign
                              </Button>
                            </div>
                          ))}
                          
                          {getCompatibleOperators(selectedStep).length === 0 && (
                            <div className="text-center py-4 text-muted-foreground">
                              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                              <p>No available operators for this machine type</p>
                              <p className="text-xs">Required: {MACHINE_TYPE_NEPALI[selectedStep.machineType]}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4" />
                  <p>Select a bundle to view its process steps</p>
                  <p className="text-sm">Click on any bundle from the left panel</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Operator Status Tab */}
        <TabsContent value="operators" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {operators.map(operator => (
              <Card key={operator.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{operator.name}</CardTitle>
                    <Badge className={STATUS_COLORS[operator.status]}>
                      {operator.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Machine Skills</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {operator.machineTypes.map(type => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {MACHINE_TYPE_NEPALI[type]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground">Skill Level</Label>
                    <div className="text-sm font-medium capitalize">{operator.skillLevel}</div>
                  </div>
                  
                  {operator.currentWork && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Current Work</Label>
                      <div className="text-sm font-mono">{operator.currentWork}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BundleAssignmentManager;