// Production Lot Manager - Management interface for creating lots
// Allows management to create production lots with article, colors, sizes, and process steps

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Separator } from '@/shared/components/ui/separator';
import { 
  Plus,
  Minus,
  Save,
  Edit,
  Trash2,
  Package,
  Layers,
  Palette,
  Ruler,
  Settings,
  Eye,
  PlayCircle,
  Target,
  Clock,
  IndianRupee
} from 'lucide-react';
// WORKAROUND: Define types locally due to persistent import issues  
import { productionLotService } from '@/services/production-lot-service';

// Local type definitions (temporary workaround)
interface ProductionLot {
  id: string;
  lotNumber: string;
  articleNumber: string;
  articleName: string;
  garmentType: 'tshirt' | 'polo' | 'shirt' | 'pants' | 'other';
  totalPieces: number;
  colorSizeBreakdown: ColorSizeBreakdown[];
  processSteps: ProcessStep[];
  currentStep: number;
  status: 'cutting' | 'in_progress' | 'completed' | 'on_hold';
  createdAt: any;
  createdBy: string;
  startedAt?: any;
  completedAt?: any;
  notes: string;
}

interface ProcessStep {
  id: string;
  stepNumber: number;
  operation: string;
  operationNepali: string;
  machineType: 'single_needle' | 'overlock' | 'flatlock' | 'buttonhole' | 'button_attach' | 'cutting' | 'finishing' | 'pressing';
  pricePerPiece: number;
  estimatedMinutes: number;
  requiredSkill: 'basic' | 'intermediate' | 'advanced' | 'expert';
  status: 'pending' | 'in_progress' | 'completed';
  assignedOperators: string[];
  completedPieces: number;
  startedAt?: any;
  completedAt?: any;
  dependencies: string[];
}

// Local type definitions (temporary workaround)
interface ColorSizeBreakdown {
  color: string;
  sizes: SizeQuantity[];
  totalPieces: number;
}

interface SizeQuantity {
  size: string;
  quantity: number;
  completedQuantity: number;
}
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ProductionLotManagerProps {
  mode?: 'create' | 'edit' | 'view';
  lotId?: string;
  onClose?: () => void;
}

const GARMENT_TYPES = [
  { value: 'tshirt', label: 'T-Shirt', labelNepali: 'टी-शर्ट' },
  { value: 'polo', label: 'Polo T-Shirt', labelNepali: 'पोलो टी-शर्ट' },
  { value: 'shirt', label: 'Shirt', labelNepali: 'शर्ट' },
  { value: 'pants', label: 'Pants', labelNepali: 'प्यान्ट' },
  { value: 'other', label: 'Other', labelNepali: 'अन्य' }
];

const STANDARD_COLORS = [
  'Black', 'White', 'Navy', 'Gray', 'Red', 'Blue', 'Green', 'Yellow', 
  'Purple', 'Pink', 'Orange', 'Brown', 'Maroon', 'Olive', 'Turquoise'
];

const STANDARD_SIZES = [
  'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'
];

export const ProductionLotManager: React.FC<ProductionLotManagerProps> = ({
  mode = 'create',
  lotId,
  onClose
}) => {
  const [lot, setLot] = useState<Partial<ProductionLot>>({
    lotNumber: `LOT${Date.now()}`,
    articleNumber: '',
    articleName: '',
    garmentType: 'tshirt',
    totalPieces: 0,
    colorSizeBreakdown: [],
    status: 'cutting',
    createdBy: 'management',
    notes: ''
  });
  const [processTemplates, setProcessTemplates] = useState<any>({});
  const [selectedColors, setSelectedColors] = useState<string[]>(['Black']);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['M', 'L', 'XL']);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProcessTemplates();
    if (mode !== 'create' && lotId) {
      loadLot();
    } else {
      initializeColorSizeBreakdown();
    }
  }, [mode, lotId]);

  useEffect(() => {
    updateColorSizeBreakdown();
  }, [selectedColors, selectedSizes]);

  const loadProcessTemplates = () => {
    const templates = productionLotService.getProcessTemplates();
    setProcessTemplates(templates);
  };

  const loadLot = async () => {
    if (!lotId) return;
    // Implementation for loading existing lot
    setLoading(true);
    // ... load lot data
    setLoading(false);
  };

  const initializeColorSizeBreakdown = () => {
    const breakdown: ColorSizeBreakdown[] = selectedColors.map(color => ({
      color,
      totalPieces: 0,
      sizes: selectedSizes.map(size => ({
        size,
        quantity: 0,
        completedQuantity: 0
      }))
    }));
    
    setLot(prev => ({ ...prev, colorSizeBreakdown: breakdown }));
  };

  const updateColorSizeBreakdown = () => {
    if (!lot.colorSizeBreakdown) return;

    const existingBreakdown = lot.colorSizeBreakdown;
    const newBreakdown: ColorSizeBreakdown[] = selectedColors.map(color => {
      const existing = existingBreakdown.find(cb => cb.color === color);
      const sizes: SizeQuantity[] = selectedSizes.map(size => {
        const existingSize = existing?.sizes.find(s => s.size === size);
        return {
          size,
          quantity: existingSize?.quantity || 0,
          completedQuantity: existingSize?.completedQuantity || 0
        };
      });

      return {
        color,
        sizes,
        totalPieces: sizes.reduce((sum, s) => sum + s.quantity, 0)
      };
    });

    const totalPieces = newBreakdown.reduce((sum, cb) => sum + cb.totalPieces, 0);
    
    setLot(prev => ({ 
      ...prev, 
      colorSizeBreakdown: newBreakdown,
      totalPieces 
    }));
  };

  const updateColorSize = (color: string, size: string, quantity: number) => {
    if (!lot.colorSizeBreakdown) return;

    const updatedBreakdown = lot.colorSizeBreakdown.map(colorData => {
      if (colorData.color === color) {
        const updatedSizes = colorData.sizes.map(sizeData => {
          if (sizeData.size === size) {
            return { ...sizeData, quantity };
          }
          return sizeData;
        });

        return {
          ...colorData,
          sizes: updatedSizes,
          totalPieces: updatedSizes.reduce((sum, s) => sum + s.quantity, 0)
        };
      }
      return colorData;
    });

    const totalPieces = updatedBreakdown.reduce((sum, cb) => sum + cb.totalPieces, 0);

    setLot(prev => ({ 
      ...prev, 
      colorSizeBreakdown: updatedBreakdown,
      totalPieces 
    }));
  };

  const addColor = (color: string) => {
    if (!selectedColors.includes(color)) {
      setSelectedColors([...selectedColors, color]);
    }
  };

  const removeColor = (color: string) => {
    if (selectedColors.length > 1) {
      setSelectedColors(selectedColors.filter(c => c !== color));
    }
  };

  const addSize = (size: string) => {
    if (!selectedSizes.includes(size)) {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const removeSize = (size: string) => {
    if (selectedSizes.length > 1) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    }
  };

  const saveLot = async () => {
    if (!lot.lotNumber || !lot.articleNumber || !lot.garmentType || lot.totalPieces === 0) {
      toast.error('Please fill all required fields and ensure total pieces > 0');
      return;
    }

    try {
      setSaving(true);
      
      const lotData: Omit<ProductionLot, 'id' | 'createdAt' | 'processSteps'> = {
        lotNumber: lot.lotNumber!,
        articleNumber: lot.articleNumber!,
        articleName: lot.articleName || lot.articleNumber!,
        garmentType: lot.garmentType! as ProductionLot['garmentType'],
        totalPieces: lot.totalPieces!,
        colorSizeBreakdown: lot.colorSizeBreakdown!,
        currentStep: 1,
        status: 'in_progress' as const,
        createdBy: lot.createdBy!,
        notes: lot.notes || ''
      };

      const savedLot = await productionLotService.createProductionLot(lotData);
      
      toast.success(`Production lot ${savedLot.lotNumber} created successfully!`);
      
      if (onClose) onClose();
      
      // Reset form if staying on create mode
      if (mode === 'create') {
        setLot({
          lotNumber: `LOT${Date.now()}`,
          articleNumber: '',
          articleName: '',
          garmentType: 'tshirt',
          totalPieces: 0,
          colorSizeBreakdown: [],
          status: 'cutting',
          createdBy: 'management',
          notes: ''
        });
        setSelectedColors(['Black']);
        setSelectedSizes(['M', 'L', 'XL']);
        initializeColorSizeBreakdown();
      }
    } catch (error) {
      console.error('Error saving lot:', error);
      toast.error('Failed to create production lot');
    } finally {
      setSaving(false);
    }
  };

  const selectedTemplate = processTemplates[lot.garmentType || 'tshirt'];
  const totalSteps = selectedTemplate?.steps?.length || 0;
  const estimatedTotalPrice = lot.totalPieces && selectedTemplate
    ? lot.totalPieces * selectedTemplate.steps.reduce((sum: number, step: any) => sum + step.pricePerPiece, 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                {mode === 'create' ? 'Create Production Lot' : 
                 mode === 'edit' ? 'Edit Production Lot' : 
                 'View Production Lot'}
              </CardTitle>
              <CardDescription>
                {mode === 'create' ? 'Set up a new production lot with article details and quantity breakdown' :
                 mode === 'edit' ? 'Modify production lot details' :
                 'View production lot information'}
              </CardDescription>
            </div>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lotNumber">Lot Number</Label>
              <Input
                id="lotNumber"
                value={lot.lotNumber || ''}
                onChange={(e) => setLot(prev => ({ ...prev, lotNumber: e.target.value }))}
                disabled={mode === 'view'}
                placeholder="LOT001"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="articleNumber">Article Number*</Label>
              <Input
                id="articleNumber"
                value={lot.articleNumber || ''}
                onChange={(e) => setLot(prev => ({ ...prev, articleNumber: e.target.value }))}
                disabled={mode === 'view'}
                placeholder="8082"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="articleName">Article Name</Label>
              <Input
                id="articleName"
                value={lot.articleName || ''}
                onChange={(e) => setLot(prev => ({ ...prev, articleName: e.target.value }))}
                disabled={mode === 'view'}
                placeholder="Polo T-Shirt"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Garment Type*</Label>
              <Select
                value={lot.garmentType || 'tshirt'}
                onValueChange={(value) => setLot(prev => ({ ...prev, garmentType: value as any }))}
                disabled={mode === 'view'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GARMENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label} ({type.labelNepali})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Total Pieces</Label>
              <div className="flex items-center space-x-2">
                <Input
                  value={lot.totalPieces || 0}
                  disabled
                  className="bg-muted"
                />
                <Badge variant="secondary">Auto-calculated</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              className="w-full min-h-[80px] p-3 border rounded-md"
              value={lot.notes || ''}
              onChange={(e) => setLot(prev => ({ ...prev, notes: e.target.value }))}
              disabled={mode === 'view'}
              placeholder="Additional notes about this production lot..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Process Template Preview */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Process Template: {selectedTemplate.name}
            </CardTitle>
            <CardDescription>
              {totalSteps} steps | Est. Rs. {estimatedTotalPrice.toFixed(2)} total production cost
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedTemplate.steps.map((step: any, index: number) => (
                <div key={index} className="flex items-center p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold mr-3">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{step.operation}</div>
                    <div className="text-xs text-muted-foreground">{step.operationNepali}</div>
                    <div className="flex items-center mt-1">
                      <Badge variant="outline" className="text-xs">
                        {step.machineType}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-2">
                        Rs. {step.pricePerPiece}/pc
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Color and Size Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Layers className="h-5 w-5 mr-2" />
            Color & Size Breakdown
          </CardTitle>
          <CardDescription>
            Configure the quantity distribution across colors and sizes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Color Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center">
                <Palette className="h-4 w-4 mr-2" />
                Colors
              </Label>
              <Select onValueChange={addColor}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Add color" />
                </SelectTrigger>
                <SelectContent>
                  {STANDARD_COLORS.filter(color => !selectedColors.includes(color)).map(color => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {selectedColors.map(color => (
                <Badge key={color} variant="outline" className="flex items-center">
                  {color}
                  {selectedColors.length > 1 && (
                    <button
                      onClick={() => removeColor(color)}
                      className="ml-2 text-xs hover:text-red-500"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center">
                <Ruler className="h-4 w-4 mr-2" />
                Sizes
              </Label>
              <Select onValueChange={addSize}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Add size" />
                </SelectTrigger>
                <SelectContent>
                  {STANDARD_SIZES.filter(size => !selectedSizes.includes(size)).map(size => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {selectedSizes.map(size => (
                <Badge key={size} variant="outline" className="flex items-center">
                  {size}
                  {selectedSizes.length > 1 && (
                    <button
                      onClick={() => removeSize(size)}
                      className="ml-2 text-xs hover:text-red-500"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Quantity Grid */}
          <div className="space-y-4">
            <Label>Quantity Distribution</Label>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Color</th>
                    {selectedSizes.map(size => (
                      <th key={size} className="text-center p-2 font-medium">{size}</th>
                    ))}
                    <th className="text-center p-2 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lot.colorSizeBreakdown?.map(colorData => (
                    <tr key={colorData.color} className="border-b">
                      <td className="p-2 font-medium">{colorData.color}</td>
                      {selectedSizes.map(size => {
                        const sizeData = colorData.sizes.find(s => s.size === size);
                        return (
                          <td key={size} className="p-2">
                            <Input
                              type="number"
                              min="0"
                              value={sizeData?.quantity || 0}
                              onChange={(e) => updateColorSize(colorData.color, size, parseInt(e.target.value) || 0)}
                              disabled={mode === 'view'}
                              className="w-16 text-center"
                            />
                          </td>
                        );
                      })}
                      <td className="p-2 text-center font-medium">
                        {colorData.totalPieces}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-bold">
                    <td className="p-2">TOTAL</td>
                    {selectedSizes.map(size => {
                      const sizeTotal = lot.colorSizeBreakdown?.reduce((sum, colorData) => {
                        const sizeData = colorData.sizes.find(s => s.size === size);
                        return sum + (sizeData?.quantity || 0);
                      }, 0) || 0;
                      return (
                        <td key={size} className="p-2 text-center">{sizeTotal}</td>
                      );
                    })}
                    <td className="p-2 text-center text-lg">{lot.totalPieces}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {mode !== 'view' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-end space-x-2">
              {onClose && (
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              )}
              <Button onClick={saveLot} disabled={saving || lot.totalPieces === 0}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {mode === 'create' ? 'Create Production Lot' : 'Save Changes'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductionLotManager;