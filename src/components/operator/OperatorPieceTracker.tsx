// Operator Piece Tracker - Daily work completion interface
// Allows operators to log their completed pieces for each operation

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { 
  Clock,
  Package,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Save,
  Target,
  TrendingUp,
  Timer
} from 'lucide-react';
// WORKAROUND: Define types locally due to persistent import issues
import { productionLotService } from '@/services/production-lot-service';

// Local type definitions (temporary workaround)
interface OperatorWorkEntry {
  id: string;
  operatorId: string;
  operatorName: string;
  lotNumber: string;
  stepId: string;
  operation: string;
  machineType: string;
  color: string;
  size: string;
  assignedPieces: number;
  completedPieces: number;
  pricePerPiece: number;
  totalPrice: number;
  workDate: any;
  status: 'assigned' | 'in_progress' | 'completed';
  startTime?: any;
  endTime?: any;
  qualityNotes: string;
  createdAt: any;
}

interface ProductionLot {
  id: string;
  lotNumber: string;
  articleNumber: string;
  articleName: string;
  garmentType: 'tshirt' | 'polo' | 'shirt' | 'pants' | 'other';
  totalPieces: number;
  colorSizeBreakdown: any[];
  processSteps: any[];
  currentStep: number;
  status: 'cutting' | 'in_progress' | 'completed' | 'on_hold';
  createdAt: any;
  createdBy: string;
  startedAt?: any;
  completedAt?: any;
  notes: string;
}
import { toast } from 'sonner';
import { format } from 'date-fns';

interface OperatorPieceTrackerProps {
  operatorId: string;
  operatorName: string;
}

interface ActiveWork {
  lotNumber: string;
  articleNumber: string;
  articleName: string;
  stepId: string;
  operation: string;
  operationNepali: string;
  machineType: string;
  color: string;
  size: string;
  assignedPieces: number;
  completedPieces: number;
  pricePerPiece: number;
  workDate: Date;
  status: 'assigned' | 'in_progress' | 'completed';
  startTime?: Date;
  qualityNotes: string;
}

const MACHINE_TYPE_COLORS = {
  single_needle: 'bg-blue-100 text-blue-800',
  overlock: 'bg-green-100 text-green-800',
  flatlock: 'bg-purple-100 text-purple-800',
  buttonhole: 'bg-orange-100 text-orange-800',
  button_attach: 'bg-pink-100 text-pink-800',
  cutting: 'bg-gray-100 text-gray-800',
  finishing: 'bg-indigo-100 text-indigo-800',
  pressing: 'bg-yellow-100 text-yellow-800'
};

const MACHINE_TYPE_NEPALI = {
  single_needle: 'सिंगल निडल',
  overlock: 'ओभरलक',
  flatlock: 'फ्ल्यालक',
  buttonhole: 'बटन होल',
  button_attach: 'बटन एट्याच',
  cutting: 'काटने',
  finishing: 'फिनिशिङ',
  pressing: 'प्रेसिङ'
};

export const OperatorPieceTracker: React.FC<OperatorPieceTrackerProps> = ({
  operatorId,
  operatorName
}) => {
  const [availableLots, setAvailableLots] = useState<ProductionLot[]>([]);
  const [activeWork, setActiveWork] = useState<ActiveWork | null>(null);
  const [todayEntries, setTodayEntries] = useState<OperatorWorkEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedLot, setSelectedLot] = useState<string>('');
  const [selectedStep, setSelectedStep] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [pieceCount, setPieceCount] = useState<number>(0);
  const [qualityNotes, setQualityNotes] = useState<string>('');

  useEffect(() => {
    loadAvailableLots();
    loadTodayEntries();
  }, [operatorId]);

  const loadAvailableLots = async () => {
    try {
      setLoading(true);
      const lots = await productionLotService.getProductionLots({ 
        status: 'in_progress' 
      });
      setAvailableLots(lots);
    } catch (error) {
      console.error('Error loading lots:', error);
      toast.error('Failed to load production lots');
    } finally {
      setLoading(false);
    }
  };

  const loadTodayEntries = async () => {
    try {
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      
      const entries = await productionLotService.getOperatorWorkEntries(operatorId, month, year);
      const todayEntries = entries.filter(entry => {
        const entryDate = new Date(entry.workDate.toDate());
        return entryDate.toDateString() === today.toDateString();
      });
      
      setTodayEntries(todayEntries);
    } catch (error) {
      console.error('Error loading today entries:', error);
    }
  };

  const startWork = () => {
    const selectedLotData = availableLots.find(lot => lot.lotNumber === selectedLot);
    const selectedStepData = selectedLotData?.processSteps.find(step => step.id === selectedStep);
    const selectedColorData = selectedLotData?.colorSizeBreakdown.find(cb => cb.color === selectedColor);
    const selectedSizeData = selectedColorData?.sizes.find(s => s.size === selectedSize);

    if (!selectedLotData || !selectedStepData || !selectedColorData || !selectedSizeData) {
      toast.error('Please select all required fields');
      return;
    }

    const newActiveWork: ActiveWork = {
      lotNumber: selectedLot,
      articleNumber: selectedLotData.articleNumber,
      articleName: selectedLotData.articleName,
      stepId: selectedStep,
      operation: selectedStepData.operation,
      operationNepali: selectedStepData.operationNepali,
      machineType: selectedStepData.machineType,
      color: selectedColor,
      size: selectedSize,
      assignedPieces: selectedSizeData.quantity - selectedSizeData.completedQuantity,
      completedPieces: 0,
      pricePerPiece: selectedStepData.pricePerPiece,
      workDate: new Date(),
      status: 'in_progress',
      startTime: new Date(),
      qualityNotes: ''
    };

    setActiveWork(newActiveWork);
    toast.success(`Started work on ${selectedStepData.operation} - ${selectedColor} ${selectedSize}`);
  };

  const updatePieceCount = (count: number) => {
    if (!activeWork) return;
    
    if (count > activeWork.assignedPieces) {
      toast.error(`Cannot exceed assigned pieces (${activeWork.assignedPieces})`);
      return;
    }

    setActiveWork(prev => prev ? { ...prev, completedPieces: count } : null);
    setPieceCount(count);
  };

  const saveWork = async () => {
    if (!activeWork || pieceCount === 0) {
      toast.error('Please complete at least 1 piece');
      return;
    }

    try {
      setSaving(true);
      
      const workEntry: Omit<OperatorWorkEntry, 'id' | 'createdAt' | 'totalPrice'> = {
        operatorId,
        operatorName,
        lotNumber: activeWork.lotNumber,
        stepId: activeWork.stepId,
        operation: activeWork.operation,
        machineType: activeWork.machineType,
        color: activeWork.color,
        size: activeWork.size,
        assignedPieces: activeWork.assignedPieces,
        completedPieces: pieceCount,
        pricePerPiece: activeWork.pricePerPiece,
        workDate: new Date(),
        status: 'completed',
        startTime: activeWork.startTime,
        endTime: new Date(),
        qualityNotes: qualityNotes
      };

      await productionLotService.createOperatorWorkEntry(workEntry);
      
      toast.success(`Saved ${pieceCount} pieces - Earned Rs. ${(pieceCount * activeWork.pricePerPiece).toFixed(2)}`);
      
      // Reset form
      setActiveWork(null);
      setPieceCount(0);
      setQualityNotes('');
      
      // Reload data
      loadAvailableLots();
      loadTodayEntries();
    } catch (error) {
      console.error('Error saving work:', error);
      toast.error('Failed to save work entry');
    } finally {
      setSaving(false);
    }
  };

  const pauseWork = () => {
    if (!activeWork) return;
    
    setActiveWork(prev => prev ? { 
      ...prev, 
      status: 'assigned' as const 
    } : null);
    toast.info('Work paused - you can resume later');
  };

  const getAvailableSteps = () => {
    const lot = availableLots.find(l => l.lotNumber === selectedLot);
    return lot?.processSteps.filter(step => 
      step.status === 'pending' || step.status === 'in_progress'
    ) || [];
  };

  const getAvailableColors = () => {
    const lot = availableLots.find(l => l.lotNumber === selectedLot);
    return lot?.colorSizeBreakdown || [];
  };

  const getAvailableSizes = () => {
    const colorData = availableLots
      .find(l => l.lotNumber === selectedLot)
      ?.colorSizeBreakdown
      .find(cb => cb.color === selectedColor);
    return colorData?.sizes.filter(size => size.completedQuantity < size.quantity) || [];
  };

  const todayEarnings = todayEntries.reduce((sum, entry) => sum + entry.totalPrice, 0);
  const todayPieces = todayEntries.reduce((sum, entry) => sum + entry.completedPieces, 0);

  return (
    <div className="space-y-6">
      {/* Daily Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Today's Pieces
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayPieces}</div>
            <p className="text-xs text-muted-foreground">Completed today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Today's Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {todayEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total earned today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Timer className="h-4 w-4 mr-2" />
              Active Work
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeWork ? '1' : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeWork ? 'In progress' : 'No active work'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Work Section */}
      {activeWork ? (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Play className="h-5 w-5 mr-2 text-green-600" />
                  Active Work
                </CardTitle>
                <CardDescription>
                  {activeWork.articleNumber} - {activeWork.articleName}
                </CardDescription>
              </div>
              <Badge className="bg-green-100 text-green-800">
                In Progress
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">Operation</Label>
                <div className="font-medium">{activeWork.operation}</div>
                <div className="text-xs text-muted-foreground">{activeWork.operationNepali}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Machine</Label>
                <Badge className={MACHINE_TYPE_COLORS[activeWork.machineType]}>
                  {MACHINE_TYPE_NEPALI[activeWork.machineType]}
                </Badge>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Color/Size</Label>
                <div className="font-medium">{activeWork.color} - {activeWork.size}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Rate</Label>
                <div className="font-medium">Rs. {activeWork.pricePerPiece} / piece</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pieceCount">Completed Pieces</Label>
                <Input
                  id="pieceCount"
                  type="number"
                  min="0"
                  max={activeWork.assignedPieces}
                  value={pieceCount}
                  onChange={(e) => updatePieceCount(parseInt(e.target.value) || 0)}
                  placeholder="Enter completed pieces"
                />
                <div className="text-xs text-muted-foreground">
                  Max: {activeWork.assignedPieces} pieces | 
                  Earnings: Rs. {(pieceCount * activeWork.pricePerPiece).toFixed(2)}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="qualityNotes">Quality Notes (Optional)</Label>
                <Input
                  id="qualityNotes"
                  value={qualityNotes}
                  onChange={(e) => setQualityNotes(e.target.value)}
                  placeholder="Any quality issues or notes..."
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={saveWork} disabled={saving || pieceCount === 0}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Work
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={pauseWork}>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Start New Work Section */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Start New Work
            </CardTitle>
            <CardDescription>
              Select a lot and operation to begin working
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Production Lot</Label>
                <Select value={selectedLot} onValueChange={setSelectedLot}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lot number" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLots.map(lot => (
                      <SelectItem key={lot.id} value={lot.lotNumber}>
                        {lot.lotNumber} - {lot.articleNumber} ({lot.totalPieces} pcs)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Operation</Label>
                <Select value={selectedStep} onValueChange={setSelectedStep} disabled={!selectedLot}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select operation" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableSteps().map(step => (
                      <SelectItem key={step.id} value={step.id}>
                        {step.operation} ({step.operationNepali}) - Rs. {step.pricePerPiece}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <Select value={selectedColor} onValueChange={setSelectedColor} disabled={!selectedStep}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableColors().map(colorData => (
                      <SelectItem key={colorData.color} value={colorData.color}>
                        {colorData.color} ({colorData.totalPieces} pcs)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Size</Label>
                <Select value={selectedSize} onValueChange={setSelectedSize} disabled={!selectedColor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableSizes().map(size => (
                      <SelectItem key={size.size} value={size.size}>
                        {size.size} ({size.quantity - size.completedQuantity} remaining)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={startWork} 
              disabled={!selectedLot || !selectedStep || !selectedColor || !selectedSize}
              className="w-full"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Work
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Today's Work History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Today's Work History
          </CardTitle>
          <CardDescription>
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todayEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No work completed today</p>
              <p className="text-sm">Start working to see your progress here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayEntries.map(entry => (
                <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge className={MACHINE_TYPE_COLORS[entry.machineType]}>
                      {MACHINE_TYPE_NEPALI[entry.machineType]}
                    </Badge>
                    <div>
                      <div className="font-medium">
                        {entry.operation} - {entry.color} {entry.size}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {entry.lotNumber} | {entry.completedPieces} pieces
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">Rs. {entry.totalPrice.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      Rs. {entry.pricePerPiece} × {entry.completedPieces}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OperatorPieceTracker;