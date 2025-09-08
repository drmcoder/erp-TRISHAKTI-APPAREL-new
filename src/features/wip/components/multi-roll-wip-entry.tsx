// Multi-Roll WIP Entry System for Garment Manufacturing
// Handles multiple rolls, layering, color variations, and bundle generation

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Label } from '@/shared/components/ui/label';
import { Select } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/Badge';
import {
  PlusIcon,
  TrashIcon,
  CalculatorIcon,
  DocumentDuplicateIcon,
  SwatchIcon,
  CubeIcon,
  ScissorsIcon
} from '@heroicons/react/24/outline';

// Enhanced interfaces for multi-roll system
interface RollData {
  id: string;
  rollNumber: string;
  weight: number; // in kg
  color: string;
  fabricType: string;
  layers: number;
  length: number; // in meters
  width: number; // in inches
  supplier: string;
  receivedDate: Date;
}

interface GarmentPart {
  id: string;
  name: string;
  nameNepali: string;
  quantityPerGarment: number; // e.g., sleeves = 2, front = 1, back = 1
  cuttingTime: number; // minutes per piece
}

interface SizeRatio {
  size: string;
  ratio: number;
  actualQuantity?: number; // calculated based on layers
}

interface ColorBatch {
  id: string;
  color: string;
  rollIds: string[];
  totalLayers: number;
  sizeRatios: SizeRatio[];
  totalGarments: number;
  parts: { [partName: string]: number }; // calculated part quantities
}

interface ProductionBundle {
  id: string;
  bundleNumber: string;
  color: string;
  size: string;
  partName: string;
  quantity: number;
  rollSource: string;
  layerRange: string; // e.g., "1-10" for layers 1 to 10
  assignedOperator?: string;
  operation: string; // shoulder join, side seam, etc.
  estimatedTime: number;
  status: 'pending' | 'cutting' | 'ready' | 'in_progress' | 'completed';
}

interface MultiRollWIPEntry {
  id: string;
  batchNumber: string;
  date: Date;
  articleNumber: string;
  articleName: string;
  garmentParts: GarmentPart[];
  rolls: RollData[];
  colorBatches: ColorBatch[];
  bundles: ProductionBundle[];
  totalGarments: number;
  totalParts: number;
  estimatedCuttingTime: number;
  status: 'draft' | 'cutting' | 'bundling' | 'production' | 'completed';
}

// Default garment parts for t-shirts
const DEFAULT_TSHIRT_PARTS: GarmentPart[] = [
  { id: 'front', name: 'Front Panel', nameNepali: 'अगाडिको भाग', quantityPerGarment: 1, cuttingTime: 0.5 },
  { id: 'back', name: 'Back Panel', nameNepali: 'पछाडिको भाग', quantityPerGarment: 1, cuttingTime: 0.5 },
  { id: 'sleeve_left', name: 'Left Sleeve', nameNepali: 'बायाँ बाहुला', quantityPerGarment: 1, cuttingTime: 0.3 },
  { id: 'sleeve_right', name: 'Right Sleeve', nameNepali: 'दायाँ बाहुला', quantityPerGarment: 1, cuttingTime: 0.3 },
  { id: 'neck_rib', name: 'Neck Rib', nameNepali: 'घाँटीको रिब', quantityPerGarment: 1, cuttingTime: 0.2 }
];

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
const COLOR_OPTIONS = ['Blue', 'Green', 'Black', 'White', 'Red', 'Navy', 'Grey'];

interface MultiRollWIPEntryProps {
  onSave: (wipEntry: MultiRollWIPEntry) => void;
  onCancel: () => void;
  initialData?: MultiRollWIPEntry;
}

export const MultiRollWIPEntry: React.FC<MultiRollWIPEntryProps> = ({
  onSave,
  onCancel,
  initialData
}) => {
  const [formData, setFormData] = useState<MultiRollWIPEntry>(() => ({
    id: initialData?.id || `batch_${Date.now()}`,
    batchNumber: initialData?.batchNumber || '',
    date: initialData?.date || new Date(),
    articleNumber: initialData?.articleNumber || '',
    articleName: initialData?.articleName || '',
    garmentParts: initialData?.garmentParts || [...DEFAULT_TSHIRT_PARTS],
    rolls: initialData?.rolls || [],
    colorBatches: initialData?.colorBatches || [],
    bundles: initialData?.bundles || [],
    totalGarments: initialData?.totalGarments || 0,
    totalParts: initialData?.totalParts || 0,
    estimatedCuttingTime: initialData?.estimatedCuttingTime || 0,
    status: initialData?.status || 'draft'
  }));

  const [selectedRatio, setSelectedRatio] = useState('1:1:1:1');
  const [currentStep, setCurrentStep] = useState(0); // 0: Rolls, 1: Colors & Ratios, 2: Bundle Generation

  // Calculate totals
  const calculatedMetrics = useMemo(() => {
    const totalGarments = formData.colorBatches.reduce((sum, batch) => sum + batch.totalGarments, 0);
    const totalParts = formData.garmentParts.reduce((sum, part) => 
      sum + (part.quantityPerGarment * totalGarments), 0
    );
    const estimatedCuttingTime = formData.garmentParts.reduce((sum, part) => 
      sum + (part.cuttingTime * part.quantityPerGarment * totalGarments), 0
    );
    
    return { totalGarments, totalParts, estimatedCuttingTime };
  }, [formData.colorBatches, formData.garmentParts]);

  // Update calculated values
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      totalGarments: calculatedMetrics.totalGarments,
      totalParts: calculatedMetrics.totalParts,
      estimatedCuttingTime: calculatedMetrics.estimatedCuttingTime
    }));
  }, [calculatedMetrics]);

  // Parse size ratio string
  const parseSizeRatio = useCallback((ratioString: string): SizeRatio[] => {
    const ratios: SizeRatio[] = [];
    
    if (ratioString.includes(':')) {
      const values = ratioString.split(':').map(v => parseInt(v.trim()) || 0);
      const defaultSizes = ['L', 'XL', '2XL', '3XL'];
      values.forEach((ratio, index) => {
        if (defaultSizes[index] && ratio > 0) {
          ratios.push({
            size: defaultSizes[index],
            ratio,
            actualQuantity: 0
          });
        }
      });
    }
    
    return ratios;
  }, []);

  // Add new roll
  const addRoll = useCallback(() => {
    const newRoll: RollData = {
      id: `roll_${Date.now()}`,
      rollNumber: '',
      weight: 0,
      color: '',
      fabricType: '',
      layers: 0,
      length: 0,
      width: 60,
      supplier: '',
      receivedDate: new Date()
    };
    
    setFormData(prev => ({
      ...prev,
      rolls: [...prev.rolls, newRoll]
    }));
  }, []);

  // Update roll data
  const updateRoll = useCallback((rollId: string, updates: Partial<RollData>) => {
    setFormData(prev => ({
      ...prev,
      rolls: prev.rolls.map(roll => 
        roll.id === rollId ? { ...roll, ...updates } : roll
      )
    }));
  }, []);

  // Remove roll
  const removeRoll = useCallback((rollId: string) => {
    setFormData(prev => ({
      ...prev,
      rolls: prev.rolls.filter(roll => roll.id !== rollId)
    }));
  }, []);

  // Generate color batches
  const generateColorBatches = useCallback(() => {
    const colorBatches: ColorBatch[] = [];
    const sizeRatios = parseSizeRatio(selectedRatio);
    
    // Group rolls by color
    const rollsByColor = formData.rolls.reduce((acc, roll) => {
      if (!acc[roll.color]) acc[roll.color] = [];
      acc[roll.color].push(roll);
      return acc;
    }, {} as { [color: string]: RollData[] });

    Object.entries(rollsByColor).forEach(([color, rolls]) => {
      const totalLayers = rolls.reduce((sum, roll) => sum + roll.layers, 0);
      const ratioSum = sizeRatios.reduce((sum, sr) => sum + sr.ratio, 0);
      
      // Calculate actual quantities for each size
      const calculatedRatios = sizeRatios.map(sr => ({
        ...sr,
        actualQuantity: Math.floor((totalLayers * sr.ratio) / ratioSum)
      }));
      
      const totalGarments = calculatedRatios.reduce((sum, cr) => sum + (cr.actualQuantity || 0), 0);
      
      // Calculate parts quantities
      const parts: { [partName: string]: number } = {};
      formData.garmentParts.forEach(part => {
        parts[part.name] = totalGarments * part.quantityPerGarment;
      });

      colorBatches.push({
        id: `batch_${color}_${Date.now()}`,
        color,
        rollIds: rolls.map(r => r.id),
        totalLayers,
        sizeRatios: calculatedRatios,
        totalGarments,
        parts
      });
    });

    setFormData(prev => ({ ...prev, colorBatches }));
  }, [formData.rolls, formData.garmentParts, selectedRatio, parseSizeRatio]);

  // Generate production bundles
  const generateBundles = useCallback(() => {
    const bundles: ProductionBundle[] = [];
    let bundleCounter = 1;

    formData.colorBatches.forEach(batch => {
      batch.sizeRatios.forEach(sizeRatio => {
        if (!sizeRatio.actualQuantity || sizeRatio.actualQuantity === 0) return;

        formData.garmentParts.forEach(part => {
          const totalPartQty = sizeRatio.actualQuantity! * part.quantityPerGarment;
          const bundleSize = 25; // Standard bundle size
          const bundleCount = Math.ceil(totalPartQty / bundleSize);

          for (let i = 0; i < bundleCount; i++) {
            const remainingQty = totalPartQty - (i * bundleSize);
            const currentBundleQty = Math.min(bundleSize, remainingQty);

            bundles.push({
              id: `bundle_${bundleCounter++}`,
              bundleNumber: `B${String(bundleCounter).padStart(3, '0')}`,
              color: batch.color,
              size: sizeRatio.size,
              partName: part.name,
              quantity: currentBundleQty,
              rollSource: batch.rollIds.join(','),
              layerRange: `1-${batch.totalLayers}`,
              operation: getOperationForPart(part.name),
              estimatedTime: currentBundleQty * part.cuttingTime,
              status: 'pending'
            });
          }
        });
      });
    });

    setFormData(prev => ({ ...prev, bundles }));
  }, [formData.colorBatches, formData.garmentParts]);

  const getOperationForPart = (partName: string): string => {
    const operationMap: { [key: string]: string } = {
      'Front Panel': 'Cutting → Shoulder Join',
      'Back Panel': 'Cutting → Shoulder Join',
      'Left Sleeve': 'Cutting → Side Seam',
      'Right Sleeve': 'Cutting → Side Seam',
      'Neck Rib': 'Cutting → Neck Attach'
    };
    return operationMap[partName] || 'Cutting';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const renderRollsStep = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CubeIcon className="h-5 w-5" />
            Roll Management
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Add multiple fabric rolls with their specifications
          </p>
        </div>
        <Button type="button" onClick={addRoll} size="sm">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Roll
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {formData.rolls.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CubeIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No rolls added yet</p>
            <p className="text-sm">Add fabric rolls to start planning production</p>
          </div>
        ) : (
          formData.rolls.map((roll, index) => (
            <div key={roll.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Roll {index + 1}</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeRoll(roll.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>Roll Number *</Label>
                  <Input
                    value={roll.rollNumber}
                    onChange={(e) => updateRoll(roll.id, { rollNumber: e.target.value })}
                    placeholder="e.g., Roll A"
                  />
                </div>
                
                <div>
                  <Label>Weight (kg) *</Label>
                  <Input
                    type="number"
                    value={roll.weight || ''}
                    onChange={(e) => updateRoll(roll.id, { weight: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g., 21"
                  />
                </div>
                
                <div>
                  <Label>Color *</Label>
                  <Select 
                    value={roll.color} 
                    onValueChange={(color) => updateRoll(roll.id, { color })}
                  >
                    <option value="">Select color</option>
                    {COLOR_OPTIONS.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </Select>
                </div>
                
                <div>
                  <Label>Layers *</Label>
                  <Input
                    type="number"
                    value={roll.layers || ''}
                    onChange={(e) => updateRoll(roll.id, { layers: parseInt(e.target.value) || 0 })}
                    placeholder="e.g., 30"
                  />
                </div>
                
                <div>
                  <Label>Fabric Type</Label>
                  <Input
                    value={roll.fabricType}
                    onChange={(e) => updateRoll(roll.id, { fabricType: e.target.value })}
                    placeholder="e.g., Cotton"
                  />
                </div>
                
                <div>
                  <Label>Length (m)</Label>
                  <Input
                    type="number"
                    value={roll.length || ''}
                    onChange={(e) => updateRoll(roll.id, { length: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g., 100"
                  />
                </div>
                
                <div>
                  <Label>Width (inches)</Label>
                  <Input
                    type="number"
                    value={roll.width || ''}
                    onChange={(e) => updateRoll(roll.id, { width: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g., 60"
                  />
                </div>
                
                <div>
                  <Label>Supplier</Label>
                  <Input
                    value={roll.supplier}
                    onChange={(e) => updateRoll(roll.id, { supplier: e.target.value })}
                    placeholder="Supplier name"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );

  const renderColorBatchesStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SwatchIcon className="h-5 w-5" />
            Size Ratio Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Size Ratio Pattern</Label>
            <div className="flex gap-2 items-center">
              <Input
                value={selectedRatio}
                onChange={(e) => setSelectedRatio(e.target.value)}
                placeholder="e.g., 1:2:2:1 for L:XL:2XL:3XL"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={generateColorBatches}
                variant="outline"
              >
                <CalculatorIcon className="h-4 w-4 mr-2" />
                Calculate
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Format: L:XL:2XL:3XL ratio (e.g., 1:1:1:1 for equal, 1:2:2:1 for weighted)
            </p>
          </div>
        </CardContent>
      </Card>

      {formData.colorBatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Color Batch Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.colorBatches.map(batch => (
              <div key={batch.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border" 
                      style={{ backgroundColor: batch.color.toLowerCase() }}
                    />
                    {batch.color} Color Batch
                  </h4>
                  <Badge variant="secondary">
                    {batch.totalLayers} layers • {batch.totalGarments} garments
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {batch.sizeRatios.map(sizeRatio => (
                    <div key={sizeRatio.size} className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-semibold">{sizeRatio.size}</div>
                      <div className="text-sm text-gray-600">
                        {sizeRatio.actualQuantity} pcs
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-3 pt-3 border-t">
                  <h5 className="font-medium mb-2">Parts Breakdown:</h5>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2 text-sm">
                    {Object.entries(batch.parts).map(([partName, quantity]) => (
                      <div key={partName} className="text-center">
                        <div className="font-medium">{partName}</div>
                        <div className="text-gray-600">{quantity} pcs</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderBundlesStep = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <DocumentDuplicateIcon className="h-5 w-5" />
            Production Bundles
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Generated bundles ready for production line assignment
          </p>
        </div>
        <Button
          type="button"
          onClick={generateBundles}
          variant="outline"
        >
          <ScissorsIcon className="h-4 w-4 mr-2" />
          Generate Bundles
        </Button>
      </CardHeader>
      <CardContent>
        {formData.bundles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <DocumentDuplicateIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No bundles generated yet</p>
            <p className="text-sm">Generate bundles from your color batches</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {formData.bundles.slice(0, 9).map(bundle => (
                <div key={bundle.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{bundle.bundleNumber}</Badge>
                    <Badge 
                      variant="secondary"
                      style={{ backgroundColor: `${bundle.color.toLowerCase()}20` }}
                    >
                      {bundle.color}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div><strong>Size:</strong> {bundle.size}</div>
                    <div><strong>Part:</strong> {bundle.partName}</div>
                    <div><strong>Quantity:</strong> {bundle.quantity} pcs</div>
                    <div><strong>Operation:</strong> {bundle.operation}</div>
                    <div><strong>Est. Time:</strong> {bundle.estimatedTime.toFixed(1)}min</div>
                  </div>
                </div>
              ))}
            </div>
            
            {formData.bundles.length > 9 && (
              <div className="text-center text-gray-500 text-sm">
                +{formData.bundles.length - 9} more bundles
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Bundle Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium">Total Bundles</div>
                  <div className="text-xl font-bold text-blue-600">
                    {formData.bundles.length}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Total Garments</div>
                  <div className="text-xl font-bold text-green-600">
                    {calculatedMetrics.totalGarments}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Total Parts</div>
                  <div className="text-xl font-bold text-purple-600">
                    {calculatedMetrics.totalParts}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Est. Time</div>
                  <div className="text-xl font-bold text-orange-600">
                    {Math.ceil(calculatedMetrics.estimatedCuttingTime / 60)}h
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderRollsStep();
      case 1: return renderColorBatchesStep();
      case 2: return renderBundlesStep();
      default: return renderRollsStep();
    }
  };

  const STEPS = ['Rolls', 'Ratios', 'Bundles'];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Multi-Roll WIP Entry System</h1>
          <p className="text-gray-600">
            Complete garment manufacturing workflow with layering and bundle management
          </p>
        </div>
        <Badge variant="secondary">
          {formData.status.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Batch Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>Batch Number *</Label>
            <Input
              value={formData.batchNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, batchNumber: e.target.value }))}
              placeholder="e.g., BATCH-001"
            />
          </div>
          <div>
            <Label>Article Number *</Label>
            <Input
              value={formData.articleNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, articleNumber: e.target.value }))}
              placeholder="e.g., TSA-TSHIRT-001"
            />
          </div>
          <div>
            <Label>Article Name *</Label>
            <Input
              value={formData.articleName}
              onChange={(e) => setFormData(prev => ({ ...prev, articleName: e.target.value }))}
              placeholder="e.g., Basic Cotton T-Shirt"
            />
          </div>
          <div>
            <Label>Production Date</Label>
            <Input
              type="date"
              value={formData.date.toISOString().split('T')[0]}
              onChange={(e) => setFormData(prev => ({ ...prev, date: new Date(e.target.value) }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Step Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {STEPS.map((step, index) => (
            <button
              key={step}
              type="button"
              onClick={() => setCurrentStep(index)}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                index === currentStep
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {index + 1}. {step}
            </button>
          ))}
        </nav>
      </div>

      {/* Step Content */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {renderCurrentStep()}
        
        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex gap-3">
            {currentStep < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Next
              </Button>
            ) : (
              <Button type="submit">
                Save WIP Entry
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default MultiRollWIPEntry;