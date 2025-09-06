import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Calendar } from '@/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { 
  Plus,
  Edit,
  Trash2,
  Copy,
  Archive,
  RefreshCw,
  CalendarIcon,
  Package,
  Users,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle2,
  PlayCircle,
  PauseCircle
} from 'lucide-react';
import { bundleService } from '@/services/bundle-service';
import { format, addDays, parseISO } from 'date-fns';
import { toast } from 'sonner';

interface BundleLifecycle {
  id: string;
  bundleId: string;
  orderNumber: string;
  client: string;
  garmentType: string;
  totalQuantity: number;
  completedQuantity: number;
  currentStage: LifecycleStage;
  stages: LifecycleStage[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'active' | 'on_hold' | 'completed' | 'cancelled' | 'archived';
  createdAt: Date;
  startedAt?: Date;
  targetCompletionDate: Date;
  actualCompletionDate?: Date;
  estimatedCompletionDate: Date;
  assignedOperators: string[];
  notes: string;
  qualityRequirements: QualityRequirement[];
  costBreakdown: CostBreakdown;
  attachments: string[];
}

interface LifecycleStage {
  id: string;
  name: string;
  nameNepali: string;
  sequence: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'blocked';
  requiredQuantity: number;
  completedQuantity: number;
  assignedOperatorId?: string;
  operatorName?: string;
  machineType: string;
  estimatedHours: number;
  actualHours?: number;
  startDate?: Date;
  endDate?: Date;
  qualityCheckpoint: boolean;
  dependencies: string[];
  notes: string;
}

interface QualityRequirement {
  stage: string;
  requirement: string;
  measurementType: 'visual' | 'measurement' | 'functional';
  acceptanceCriteria: string;
  toleranceLevel: number;
}

interface CostBreakdown {
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  profitMargin: number;
  sellingPrice: number;
}

interface BundleLifecycleManagerProps {
  mode: 'view' | 'create' | 'edit';
  bundleId?: string;
  onSave?: (bundle: BundleLifecycle) => void;
  onCancel?: () => void;
}

const DEFAULT_STAGES = [
  { name: 'Cutting', nameNepali: 'काट्ने', machineType: 'cutting', estimatedHours: 2 },
  { name: 'Overlock', nameNepali: 'ओभरलक', machineType: 'overlock', estimatedHours: 1.5 },
  { name: 'Flatlock', nameNepali: 'फ्ल्यालक', machineType: 'flatlock', estimatedHours: 2 },
  { name: 'Button Hole', nameNepali: 'बटन होल', machineType: 'buttonhole', estimatedHours: 3 },
  { name: 'Button Attach', nameNepali: 'बटन लगाउने', machineType: 'button_attach', estimatedHours: 1 },
  { name: 'Quality Check', nameNepali: 'गुणस्तर जाँच', machineType: 'quality_check', estimatedHours: 0.5 },
  { name: 'Finishing', nameNepali: 'फिनिशिङ', machineType: 'finishing', estimatedHours: 1 },
  { name: 'Pressing', nameNepali: 'प्रेसिङ', machineType: 'pressing', estimatedHours: 0.5 }
];

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: Edit },
  active: { label: 'Active', color: 'bg-blue-100 text-blue-800', icon: PlayCircle },
  on_hold: { label: 'On Hold', color: 'bg-yellow-100 text-yellow-800', icon: PauseCircle },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: Trash2 },
  archived: { label: 'Archived', color: 'bg-gray-100 text-gray-800', icon: Archive }
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'bg-green-100 text-green-800' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800' }
};

export const BundleLifecycleManager: React.FC<BundleLifecycleManagerProps> = ({
  mode,
  bundleId,
  onSave,
  onCancel
}) => {
  const [bundle, setBundle] = useState<BundleLifecycle | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'stages' | 'quality' | 'costs'>('overview');

  useEffect(() => {
    if (mode !== 'create' && bundleId) {
      loadBundle();
    } else if (mode === 'create') {
      initializeNewBundle();
    }
  }, [mode, bundleId]);

  const loadBundle = async () => {
    if (!bundleId) return;
    
    try {
      setLoading(true);
      const bundleData = await bundleService.getBundleLifecycle(bundleId);
      setBundle(bundleData);
    } catch (error) {
      console.error('Error loading bundle:', error);
      toast.error('Failed to load bundle data');
    } finally {
      setLoading(false);
    }
  };

  const initializeNewBundle = () => {
    const newBundle: BundleLifecycle = {
      id: '',
      bundleId: `BDL${Date.now()}`,
      orderNumber: '',
      client: '',
      garmentType: '',
      totalQuantity: 0,
      completedQuantity: 0,
      currentStage: null as any,
      stages: DEFAULT_STAGES.map((stage, index) => ({
        id: `stage_${index + 1}`,
        name: stage.name,
        nameNepali: stage.nameNepali,
        sequence: index + 1,
        status: 'pending',
        requiredQuantity: 0,
        completedQuantity: 0,
        machineType: stage.machineType,
        estimatedHours: stage.estimatedHours,
        qualityCheckpoint: stage.machineType === 'quality_check',
        dependencies: index > 0 ? [`stage_${index}`] : [],
        notes: ''
      })),
      priority: 'medium',
      status: 'draft',
      createdAt: new Date(),
      targetCompletionDate: addDays(new Date(), 7),
      estimatedCompletionDate: addDays(new Date(), 7),
      assignedOperators: [],
      notes: '',
      qualityRequirements: [],
      costBreakdown: {
        materialCost: 0,
        laborCost: 0,
        overheadCost: 0,
        totalCost: 0,
        profitMargin: 0,
        sellingPrice: 0
      },
      attachments: []
    };
    setBundle(newBundle);
  };

  const handleSave = async () => {
    if (!bundle) return;

    try {
      setSaving(true);
      let savedBundle;
      
      if (mode === 'create') {
        savedBundle = await bundleService.createBundleLifecycle(bundle);
        toast.success('Bundle created successfully');
      } else {
        savedBundle = await bundleService.updateBundleLifecycle(bundle.id, bundle);
        toast.success('Bundle updated successfully');
      }
      
      setBundle(savedBundle);
      onSave?.(savedBundle);
    } catch (error) {
      console.error('Error saving bundle:', error);
      toast.error('Failed to save bundle');
    } finally {
      setSaving(false);
    }
  };

  const handleClone = async () => {
    if (!bundle) return;

    try {
      const clonedBundle = {
        ...bundle,
        id: '',
        bundleId: `BDL${Date.now()}`,
        status: 'draft' as const,
        completedQuantity: 0,
        createdAt: new Date(),
        startedAt: undefined,
        actualCompletionDate: undefined,
        stages: bundle.stages.map(stage => ({
          ...stage,
          status: 'pending' as const,
          completedQuantity: 0,
          startDate: undefined,
          endDate: undefined,
          actualHours: undefined
        }))
      };

      const savedBundle = await bundleService.createBundleLifecycle(clonedBundle);
      toast.success('Bundle cloned successfully');
      setBundle(savedBundle);
    } catch (error) {
      toast.error('Failed to clone bundle');
    }
  };

  const updateBundleField = (field: string, value: any) => {
    if (!bundle) return;
    
    setBundle(prev => prev ? { ...prev, [field]: value } : null);
  };

  const updateStage = (stageId: string, updates: Partial<LifecycleStage>) => {
    if (!bundle) return;
    
    setBundle(prev => prev ? {
      ...prev,
      stages: prev.stages.map(stage => 
        stage.id === stageId ? { ...stage, ...updates } : stage
      )
    } : null);
  };

  const addStage = () => {
    if (!bundle) return;

    const newStage: LifecycleStage = {
      id: `stage_${Date.now()}`,
      name: 'New Stage',
      nameNepali: 'नयाँ चरण',
      sequence: bundle.stages.length + 1,
      status: 'pending',
      requiredQuantity: bundle.totalQuantity,
      completedQuantity: 0,
      machineType: 'manual',
      estimatedHours: 1,
      qualityCheckpoint: false,
      dependencies: [],
      notes: ''
    };

    setBundle(prev => prev ? {
      ...prev,
      stages: [...prev.stages, newStage]
    } : null);
  };

  const removeStage = (stageId: string) => {
    if (!bundle) return;

    setBundle(prev => prev ? {
      ...prev,
      stages: prev.stages.filter(stage => stage.id !== stageId)
    } : null);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!bundle) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Bundle Not Found</h3>
          <p className="text-muted-foreground">Unable to load bundle data</p>
        </CardContent>
      </Card>
    );
  }

  const statusConfig = STATUS_CONFIG[bundle.status];
  const priorityConfig = PRIORITY_CONFIG[bundle.priority];
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold">{bundle.bundleId}</h2>
                <Badge className={statusConfig.color}>
                  <StatusIcon className="h-4 w-4 mr-1" />
                  {statusConfig.label}
                </Badge>
                <Badge className={priorityConfig.color}>
                  {priorityConfig.label}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {mode === 'create' ? 'Create new bundle lifecycle' : 
                 mode === 'edit' ? 'Edit bundle details and stages' : 
                 'View bundle lifecycle and progress'}
              </p>
            </div>

            <div className="flex space-x-2">
              {mode !== 'create' && (
                <>
                  <Button variant="outline" onClick={handleClone}>
                    <Copy className="h-4 w-4 mr-2" />
                    Clone
                  </Button>
                  {bundle.status === 'completed' && (
                    <Button variant="outline" onClick={() => updateBundleField('status', 'archived')}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </Button>
                  )}
                </>
              )}
              
              {mode !== 'view' && (
                <>
                  <Button variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    {mode === 'create' ? 'Create Bundle' : 'Save Changes'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation Tabs */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-1 border-b">
            {[
              { id: 'overview', label: 'Overview', icon: Package },
              { id: 'stages', label: 'Stages', icon: Target },
              { id: 'quality', label: 'Quality', icon: CheckCircle2 },
              { id: 'costs', label: 'Costs', icon: Users }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors ${
                    activeTab === tab.id 
                      ? 'bg-primary text-primary-foreground border-b-2 border-primary' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <Card>
          <CardHeader>
            <CardTitle>Bundle Overview</CardTitle>
            <CardDescription>Basic information and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orderNumber">Order Number</Label>
                  <Input
                    id="orderNumber"
                    value={bundle.orderNumber}
                    onChange={(e) => updateBundleField('orderNumber', e.target.value)}
                    disabled={mode === 'view'}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="client">Client</Label>
                  <Input
                    id="client"
                    value={bundle.client}
                    onChange={(e) => updateBundleField('client', e.target.value)}
                    disabled={mode === 'view'}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="garmentType">Garment Type</Label>
                  <Input
                    id="garmentType"
                    value={bundle.garmentType}
                    onChange={(e) => updateBundleField('garmentType', e.target.value)}
                    disabled={mode === 'view'}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="totalQuantity">Total Quantity</Label>
                  <Input
                    id="totalQuantity"
                    type="number"
                    value={bundle.totalQuantity}
                    onChange={(e) => updateBundleField('totalQuantity', parseInt(e.target.value))}
                    disabled={mode === 'view'}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select 
                    value={bundle.priority}
                    onValueChange={(value) => updateBundleField('priority', value)}
                    disabled={mode === 'view'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={bundle.status}
                    onValueChange={(value) => updateBundleField('status', value)}
                    disabled={mode === 'view'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Target Completion Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" disabled={mode === 'view'}>
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {format(new Date(bundle.targetCompletionDate), 'PPP')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        selected={new Date(bundle.targetCompletionDate)}
                        onSelect={(date) => date && updateBundleField('targetCompletionDate', date)}
                        mode="single"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                className="w-full min-h-[100px] p-3 border rounded-md"
                value={bundle.notes}
                onChange={(e) => updateBundleField('notes', e.target.value)}
                disabled={mode === 'view'}
                placeholder="Add any additional notes or instructions..."
              />
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'stages' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Production Stages</CardTitle>
                <CardDescription>Configure the manufacturing workflow</CardDescription>
              </div>
              {mode !== 'view' && (
                <Button onClick={addStage}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stage
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bundle.stages.map((stage, index) => (
                <div key={stage.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        {stage.sequence}
                      </div>
                      <div>
                        <h4 className="font-semibold">{stage.name} ({stage.nameNepali})</h4>
                        <Badge className={
                          stage.status === 'completed' ? 'bg-green-100 text-green-800' :
                          stage.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          stage.status === 'blocked' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {stage.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    
                    {mode !== 'view' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStage(stage.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Stage Name</Label>
                      <Input
                        value={stage.name}
                        onChange={(e) => updateStage(stage.id, { name: e.target.value })}
                        disabled={mode === 'view'}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Machine Type</Label>
                      <Select
                        value={stage.machineType}
                        onValueChange={(value) => updateStage(stage.id, { machineType: value })}
                        disabled={mode === 'view'}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cutting">Cutting</SelectItem>
                          <SelectItem value="overlock">Overlock</SelectItem>
                          <SelectItem value="flatlock">Flatlock</SelectItem>
                          <SelectItem value="buttonhole">Buttonhole</SelectItem>
                          <SelectItem value="button_attach">Button Attach</SelectItem>
                          <SelectItem value="embroidery">Embroidery</SelectItem>
                          <SelectItem value="quality_check">Quality Check</SelectItem>
                          <SelectItem value="finishing">Finishing</SelectItem>
                          <SelectItem value="pressing">Pressing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Estimated Hours</Label>
                      <Input
                        type="number"
                        step="0.5"
                        value={stage.estimatedHours}
                        onChange={(e) => updateStage(stage.id, { estimatedHours: parseFloat(e.target.value) })}
                        disabled={mode === 'view'}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label>Notes</Label>
                    <textarea
                      className="w-full mt-1 p-2 border rounded"
                      rows={2}
                      value={stage.notes}
                      onChange={(e) => updateStage(stage.id, { notes: e.target.value })}
                      disabled={mode === 'view'}
                      placeholder="Stage-specific notes or instructions..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add other tab contents for quality and costs similarly */}
    </div>
  );
};

export default BundleLifecycleManager;