// Process Pricing Manager - Configure step-by-step pricing for different operations and garments
// Allows management to set and modify pricing for each operation based on machine types and complexity

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { 
  IndianRupee,
  Settings,
  Save,
  Copy,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Clock,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

interface PricingRule {
  id: string;
  garmentType: string;
  operation: string;
  operationNepali: string;
  machineType: string;
  complexity: 'basic' | 'intermediate' | 'advanced' | 'expert';
  basePrice: number;
  pricePerPiece: number;
  estimatedMinutes: number;
  skillMultiplier: number;
  qualityRequirement: string;
  notes: string;
  isActive: boolean;
  lastUpdated: Date;
  updatedBy: string;
}

interface MachineTypePricing {
  machineType: string;
  machineTypeNepali: string;
  baseRate: number;
  efficiency: number;
  operatorSkillRequired: string;
  maintenanceCost: number;
  notes: string;
}

const DEFAULT_MACHINE_PRICING: MachineTypePricing[] = [
  {
    machineType: 'single_needle',
    machineTypeNepali: 'सिंगल निडल',
    baseRate: 1.5,
    efficiency: 85,
    operatorSkillRequired: 'intermediate',
    maintenanceCost: 0.1,
    notes: 'General purpose single needle for collars, plackets, hems'
  },
  {
    machineType: 'overlock',
    machineTypeNepali: 'ओभरलक',
    baseRate: 2.0,
    efficiency: 90,
    operatorSkillRequired: 'basic',
    maintenanceCost: 0.15,
    notes: 'Overlock for seams, joins, and edge finishing'
  },
  {
    machineType: 'flatlock',
    machineTypeNepali: 'फ्ल्यालक',
    baseRate: 1.8,
    efficiency: 80,
    operatorSkillRequired: 'intermediate',
    maintenanceCost: 0.12,
    notes: 'Flatlock for decorative seams and hems'
  },
  {
    machineType: 'buttonhole',
    machineTypeNepali: 'बटन होल',
    baseRate: 3.5,
    efficiency: 70,
    operatorSkillRequired: 'expert',
    maintenanceCost: 0.25,
    notes: 'Specialized buttonhole machine'
  },
  {
    machineType: 'button_attach',
    machineTypeNepali: 'बटन एट्याच',
    baseRate: 2.5,
    efficiency: 75,
    operatorSkillRequired: 'advanced',
    maintenanceCost: 0.2,
    notes: 'Button attachment machine'
  },
  {
    machineType: 'cutting',
    machineTypeNepali: 'काटने',
    baseRate: 1.0,
    efficiency: 95,
    operatorSkillRequired: 'advanced',
    maintenanceCost: 0.05,
    notes: 'Cutting tools and equipment'
  },
  {
    machineType: 'finishing',
    machineTypeNepali: 'फिनिशिङ',
    baseRate: 1.2,
    efficiency: 85,
    operatorSkillRequired: 'basic',
    maintenanceCost: 0.08,
    notes: 'Finishing operations - thread trimming, cleaning'
  },
  {
    machineType: 'pressing',
    machineTypeNepali: 'प्रेसिङ',
    baseRate: 1.3,
    efficiency: 90,
    operatorSkillRequired: 'basic',
    maintenanceCost: 0.1,
    notes: 'Pressing and ironing operations'
  }
];

// Sample pricing rules - in real app these would come from database
const DEFAULT_PRICING_RULES: PricingRule[] = [
  // T-Shirt Operations
  {
    id: '1',
    garmentType: 'tshirt',
    operation: 'Shoulder Join',
    operationNepali: 'काँध जोड्ने',
    machineType: 'overlock',
    complexity: 'basic',
    basePrice: 1.0,
    pricePerPiece: 1.0,
    estimatedMinutes: 2,
    skillMultiplier: 1.0,
    qualityRequirement: 'Clean seam, no puckering',
    notes: 'Basic overlock operation',
    isActive: true,
    lastUpdated: new Date(),
    updatedBy: 'admin'
  },
  {
    id: '2',
    garmentType: 'tshirt',
    operation: 'Sleeve Attach',
    operationNepali: 'बाही जोड्ने',
    machineType: 'overlock',
    complexity: 'intermediate',
    basePrice: 2.0,
    pricePerPiece: 2.0,
    estimatedMinutes: 3,
    skillMultiplier: 1.2,
    qualityRequirement: 'Smooth armhole, even seam allowance',
    notes: 'Requires precision in curve handling',
    isActive: true,
    lastUpdated: new Date(),
    updatedBy: 'admin'
  },
  // Polo Operations
  {
    id: '3',
    garmentType: 'polo',
    operation: 'Collar Making',
    operationNepali: 'कलर बनाउने',
    machineType: 'single_needle',
    complexity: 'advanced',
    basePrice: 2.5,
    pricePerPiece: 2.5,
    estimatedMinutes: 4,
    skillMultiplier: 1.5,
    qualityRequirement: 'Perfect collar shape, consistent topstitching',
    notes: 'Critical for garment appearance',
    isActive: true,
    lastUpdated: new Date(),
    updatedBy: 'admin'
  },
  {
    id: '4',
    garmentType: 'polo',
    operation: 'Placket Making',
    operationNepali: 'प्लेकेट बनाउने',
    machineType: 'single_needle',
    complexity: 'advanced',
    basePrice: 2.0,
    pricePerPiece: 2.0,
    estimatedMinutes: 3.5,
    skillMultiplier: 1.4,
    qualityRequirement: 'Straight placket, even buttonhole spacing',
    notes: 'Requires careful measurement and alignment',
    isActive: true,
    lastUpdated: new Date(),
    updatedBy: 'admin'
  }
];

const COMPLEXITY_COLORS = {
  basic: 'bg-green-100 text-green-800',
  intermediate: 'bg-blue-100 text-blue-800',
  advanced: 'bg-orange-100 text-orange-800',
  expert: 'bg-red-100 text-red-800'
};

const COMPLEXITY_MULTIPLIERS = {
  basic: 1.0,
  intermediate: 1.2,
  advanced: 1.5,
  expert: 2.0
};

export const ProcessPricingManager: React.FC = () => {
  const [pricingRules, setPricingRules] = useState<PricingRule[]>(DEFAULT_PRICING_RULES);
  const [machinePricing, setMachinePricing] = useState<MachineTypePricing[]>(DEFAULT_MACHINE_PRICING);
  const [selectedGarment, setSelectedGarment] = useState<string>('all');
  const [selectedMachine, setSelectedMachine] = useState<string>('all');
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [editingMachine, setEditingMachine] = useState<MachineTypePricing | null>(null);
  const [showNewRuleForm, setShowNewRuleForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const filteredRules = pricingRules.filter(rule => {
    if (selectedGarment !== 'all' && rule.garmentType !== selectedGarment) return false;
    if (selectedMachine !== 'all' && rule.machineType !== selectedMachine) return false;
    return true;
  });

  const calculateDynamicPrice = (rule: PricingRule) => {
    const machine = machinePricing.find(m => m.machineType === rule.machineType);
    const complexityMultiplier = COMPLEXITY_MULTIPLIERS[rule.complexity];
    const machineRate = machine?.baseRate || 1.0;
    const maintenanceCost = machine?.maintenanceCost || 0;
    
    return (machineRate * complexityMultiplier * rule.skillMultiplier) + maintenanceCost;
  };

  const saveRule = async (rule: PricingRule) => {
    try {
      setSaving(true);
      
      if (editingRule) {
        // Update existing rule
        setPricingRules(prev => prev.map(r => r.id === rule.id ? rule : r));
        toast.success('Pricing rule updated successfully');
      } else {
        // Add new rule
        const newRule = { ...rule, id: Date.now().toString() };
        setPricingRules(prev => [...prev, newRule]);
        toast.success('New pricing rule added');
      }
      
      setEditingRule(null);
      setShowNewRuleForm(false);
    } catch (error) {
      toast.error('Failed to save pricing rule');
    } finally {
      setSaving(false);
    }
  };

  const saveMachinePricing = async (machine: MachineTypePricing) => {
    try {
      setSaving(true);
      
      setMachinePricing(prev => prev.map(m => 
        m.machineType === machine.machineType ? machine : m
      ));
      
      // Recalculate all rule prices
      setPricingRules(prev => prev.map(rule => ({
        ...rule,
        pricePerPiece: calculateDynamicPrice(rule)
      })));
      
      toast.success('Machine pricing updated successfully');
      setEditingMachine(null);
    } catch (error) {
      toast.error('Failed to update machine pricing');
    } finally {
      setSaving(false);
    }
  };

  const deleteRule = (ruleId: string) => {
    setPricingRules(prev => prev.filter(r => r.id !== ruleId));
    toast.success('Pricing rule deleted');
  };

  const toggleRuleStatus = (ruleId: string) => {
    setPricingRules(prev => prev.map(r => 
      r.id === ruleId ? { ...r, isActive: !r.isActive } : r
    ));
  };

  const duplicateRule = (rule: PricingRule) => {
    const newRule: PricingRule = {
      ...rule,
      id: Date.now().toString(),
      operation: `${rule.operation} (Copy)`,
      operationNepali: `${rule.operationNepali} (प्रतिलिपि)`,
      lastUpdated: new Date()
    };
    setPricingRules(prev => [...prev, newRule]);
    toast.success('Pricing rule duplicated');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <IndianRupee className="h-5 w-5 mr-2" />
            Process Pricing Management
          </CardTitle>
          <CardDescription>
            Configure step-by-step pricing for different operations, machines, and garment types
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="pricing-rules" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pricing-rules">Pricing Rules</TabsTrigger>
          <TabsTrigger value="machine-rates">Machine Rates</TabsTrigger>
        </TabsList>

        {/* Pricing Rules Tab */}
        <TabsContent value="pricing-rules" className="space-y-4">
          {/* Filters and Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                  <div className="flex items-center space-x-2">
                    <Label>Garment:</Label>
                    <Select value={selectedGarment} onValueChange={setSelectedGarment}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="tshirt">T-Shirt</SelectItem>
                        <SelectItem value="polo">Polo</SelectItem>
                        <SelectItem value="shirt">Shirt</SelectItem>
                        <SelectItem value="pants">Pants</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Label>Machine:</Label>
                    <Select value={selectedMachine} onValueChange={setSelectedMachine}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Machines</SelectItem>
                        <SelectItem value="single_needle">Single Needle</SelectItem>
                        <SelectItem value="overlock">Overlock</SelectItem>
                        <SelectItem value="flatlock">Flatlock</SelectItem>
                        <SelectItem value="buttonhole">Buttonhole</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={() => setShowNewRuleForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Rule
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Rules List */}
          <div className="space-y-4">
            {filteredRules.map(rule => (
              <Card key={rule.id} className={!rule.isActive ? 'opacity-50' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{rule.operation}</h3>
                        <span className="text-sm text-muted-foreground">({rule.operationNepali})</span>
                        <Badge className={COMPLEXITY_COLORS[rule.complexity]}>
                          {rule.complexity}
                        </Badge>
                        {!rule.isActive && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Garment: {rule.garmentType}</span>
                        <span>Machine: {rule.machineType}</span>
                        <span>Time: {rule.estimatedMinutes} min</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        Rs. {rule.pricePerPiece.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">per piece</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Quality Requirement</Label>
                      <p className="text-sm">{rule.qualityRequirement}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Notes</Label>
                      <p className="text-sm">{rule.notes}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Updated {rule.lastUpdated.toLocaleDateString()} by {rule.updatedBy}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleRuleStatus(rule.id)}
                      >
                        {rule.isActive ? (
                          <AlertTriangle className="h-4 w-4" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => duplicateRule(rule)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingRule(rule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteRule(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Machine Rates Tab */}
        <TabsContent value="machine-rates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {machinePricing.map(machine => (
              <Card key={machine.machineType}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{machine.machineTypeNepali}</CardTitle>
                      <CardDescription>{machine.machineType}</CardDescription>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingMachine(machine)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-xs text-muted-foreground">Base Rate</Label>
                      <div className="font-medium">Rs. {machine.baseRate.toFixed(2)}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Efficiency</Label>
                      <div className="font-medium">{machine.efficiency}%</div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Skill Level</Label>
                      <div className="font-medium">{machine.operatorSkillRequired}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Maintenance</Label>
                      <div className="font-medium">Rs. {machine.maintenanceCost.toFixed(2)}</div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Notes</Label>
                    <p className="text-sm">{machine.notes}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Pricing Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Pricing Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{pricingRules.filter(r => r.isActive).length}</div>
              <div className="text-sm text-muted-foreground">Active Rules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                Rs. {(pricingRules.reduce((sum, r) => sum + r.pricePerPiece, 0) / pricingRules.length).toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Avg. Price/Piece</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.round(pricingRules.reduce((sum, r) => sum + r.estimatedMinutes, 0) / pricingRules.length)}
              </div>
              <div className="text-sm text-muted-foreground">Avg. Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{machinePricing.length}</div>
              <div className="text-sm text-muted-foreground">Machine Types</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcessPricingManager;