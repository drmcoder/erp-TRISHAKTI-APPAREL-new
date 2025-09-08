// Cutting Droplet Manager - Entry interface for WIP Excel data
// Management enters cutting data: rolls, kg, colors, sizes, pieces from Excel

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { 
  Package,
  Plus,
  Minus,
  Save,
  FileSpreadsheet,
  Scissors,
  Layers,
  Palette,
  ArrowRight
} from 'lucide-react';
// WORKAROUND: Define types locally due to persistent import issues
import { enhancedProductionService } from '@/services/enhanced-production-service-v2';

// Local type definitions (temporary workaround)
interface CuttingColorSize {
  color: string;
  rollsUsed: number;
  kgUsed: number;
  layers: number;
  sizes: {
    size: string;
    pieces: number;
    bundlesCreated: number;
  }[];
  totalPieces: number;
}

interface CuttingDroplet {
  id: string;
  lotNumber: string;
  articleNumber: string;
  articleName: string;
  garmentType: 'tshirt' | 'polo' | 'shirt' | 'pants';
  totalRolls: number;
  totalKg: number;
  colorSizeData: CuttingColorSize[];
  createdAt: any;
  createdBy: string;
  status: 'cutting' | 'ready_for_sewing' | 'in_production' | 'completed';
}
import { toast } from 'sonner';
import FirebaseTester from '@/services/firebase-test';

const STANDARD_COLORS = [
  'Blue', 'Green', 'Black', 'White', 'Red', 'Navy', 'Gray', 'Yellow', 'Pink', 'Purple'
];

const STANDARD_SIZES = [
  'S', 'M', 'L', 'XL', '2XL', '3XL'
];

const GARMENT_TYPES = [
  { value: 'tshirt', label: 'T-Shirt (3233#)', example: '3233#' },
  { value: 'polo', label: 'Polo T-Shirt (8082#)', example: '8082#' },
  { value: 'shirt', label: 'Shirt', example: '5512#' },
  { value: 'pants', label: 'Pants', example: '7890#' }
];

export const CuttingDropletManager: React.FC = () => {
  const [cuttingData, setCuttingData] = useState<Partial<CuttingDroplet>>({
    lotNumber: `LOT${Date.now()}`,
    articleNumber: '',
    articleName: '',
    garmentType: 'polo',
    totalRolls: 0,
    totalKg: 0,
    colorSizeData: [],
    createdBy: 'management',
    status: 'cutting'
  });
  
  const [selectedColors, setSelectedColors] = useState<string[]>(['Blue', 'Green', 'Black']);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    updateColorSizeData();
  }, [selectedColors]);

  const updateColorSizeData = () => {
    const colorSizeData: CuttingColorSize[] = selectedColors.map(color => {
      const existing = cuttingData.colorSizeData?.find(c => c.color === color);
      return {
        color,
        rollsUsed: existing?.rollsUsed || 0,
        kgUsed: existing?.kgUsed || 0,
        layers: existing?.layers || 20,
        sizes: STANDARD_SIZES.map(size => {
          const existingSize = existing?.sizes.find(s => s.size === size);
          return {
            size,
            pieces: existingSize?.pieces || 0,
            bundlesCreated: 0
          };
        }),
        totalPieces: existing?.totalPieces || 0
      };
    });

    setCuttingData(prev => ({ ...prev, colorSizeData }));
  };

  const updateColorData = (color: string, field: keyof CuttingColorSize, value: any) => {
    if (!cuttingData.colorSizeData) return;

    const updatedColorData = cuttingData.colorSizeData.map(colorData => {
      if (colorData.color === color) {
        const updated = { ...colorData, [field]: value };
        if (field === 'layers' || field === 'sizes') {
          updated.totalPieces = updated.sizes.reduce((sum, size) => sum + size.pieces, 0);
        }
        return updated;
      }
      return colorData;
    });

    const totalRolls = updatedColorData.reduce((sum, c) => sum + c.rollsUsed, 0);
    const totalKg = updatedColorData.reduce((sum, c) => sum + c.kgUsed, 0);

    setCuttingData(prev => ({
      ...prev,
      colorSizeData: updatedColorData,
      totalRolls,
      totalKg
    }));
  };

  const updateSizePieces = (color: string, size: string, pieces: number) => {
    if (!cuttingData.colorSizeData) return;

    const updatedColorData = cuttingData.colorSizeData.map(colorData => {
      if (colorData.color === color) {
        const updatedSizes = colorData.sizes.map(sizeData => 
          sizeData.size === size ? { ...sizeData, pieces } : sizeData
        );
        return {
          ...colorData,
          sizes: updatedSizes,
          totalPieces: updatedSizes.reduce((sum, s) => sum + s.pieces, 0)
        };
      }
      return colorData;
    });

    const totalRolls = updatedColorData.reduce((sum, c) => sum + c.rollsUsed, 0);
    const totalKg = updatedColorData.reduce((sum, c) => sum + c.kgUsed, 0);

    setCuttingData(prev => ({
      ...prev,
      colorSizeData: updatedColorData,
      totalRolls,
      totalKg
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

  const saveCuttingDroplet = async () => {
    if (!cuttingData.lotNumber || !cuttingData.articleNumber || !cuttingData.garmentType) {
      toast.error('Please fill all required fields');
      return;
    }

    const totalPieces = cuttingData.colorSizeData?.reduce((sum, c) => sum + c.totalPieces, 0) || 0;
    if (totalPieces === 0) {
      toast.error('Please enter piece quantities');
      return;
    }

    try {
      setSaving(true);

      const dropletData: Omit<CuttingDroplet, 'id' | 'createdAt'> = {
        lotNumber: cuttingData.lotNumber!,
        articleNumber: cuttingData.articleNumber!,
        articleName: cuttingData.articleName || cuttingData.articleNumber!,
        garmentType: cuttingData.garmentType! as CuttingDroplet['garmentType'],
        totalRolls: cuttingData.totalRolls!,
        totalKg: cuttingData.totalKg!,
        colorSizeData: cuttingData.colorSizeData!,
        createdBy: cuttingData.createdBy!,
        status: 'cutting'
      };

      const savedDroplet = await enhancedProductionService.createCuttingDroplet(dropletData);
      
      toast.success(`Cutting droplet ${savedDroplet.lotNumber} created successfully! Total: ${totalPieces} pieces`);
      
      // Reset form
      setCuttingData({
        lotNumber: `LOT${Date.now()}`,
        articleNumber: '',
        articleName: '',
        garmentType: 'polo',
        totalRolls: 0,
        totalKg: 0,
        colorSizeData: [],
        createdBy: 'management',
        status: 'cutting'
      });
      setSelectedColors(['Blue', 'Green', 'Black']);
      
    } catch (error) {
      console.error('Error saving cutting droplet:', error);
      toast.error('Failed to create cutting droplet');
    } finally {
      setSaving(false);
    }
  };

  const createBundles = async () => {
    if (!cuttingData.lotNumber) {
      toast.error('Please save the cutting droplet first');
      return;
    }

    try {
      setLoading(true);
      // This would use the saved droplet ID in real implementation
      const bundles = await enhancedProductionService.createBundlesFromCutting('temp_id');
      toast.success(`Created ${bundles.length} production bundles ready for sewing line`);
    } catch (error) {
      toast.error('Failed to create bundles');
    } finally {
      setLoading(false);
    }
  };

  const testFirebaseConnection = async () => {
    try {
      setLoading(true);
      toast.info('Testing Firebase connection...');
      await FirebaseTester.runAllTests();
      toast.success('Firebase test completed! Check console for results.');
    } catch (error) {
      toast.error('Firebase test failed! Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const totalPieces = cuttingData.colorSizeData?.reduce((sum, c) => sum + c.totalPieces, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Scissors className="h-5 w-5 mr-2" />
            Cutting Droplet Entry
          </CardTitle>
          <CardDescription>
            Enter WIP Excel data from cutting department - rolls, colors, sizes, and piece quantities
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileSpreadsheet className="h-5 w-5 mr-2" />
            Lot Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lotNumber">Lot Number*</Label>
              <Input
                id="lotNumber"
                value={cuttingData.lotNumber || ''}
                onChange={(e) => setCuttingData(prev => ({ ...prev, lotNumber: e.target.value }))}
                placeholder="LOT001"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="articleNumber">Article Number*</Label>
              <Input
                id="articleNumber"
                value={cuttingData.articleNumber || ''}
                onChange={(e) => setCuttingData(prev => ({ ...prev, articleNumber: e.target.value }))}
                placeholder="8082"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Garment Type*</Label>
              <Select
                value={cuttingData.garmentType}
                onValueChange={(value) => setCuttingData(prev => ({ ...prev, garmentType: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GARMENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="articleName">Article Name</Label>
              <Input
                id="articleName"
                value={cuttingData.articleName || ''}
                onChange={(e) => setCuttingData(prev => ({ ...prev, articleName: e.target.value }))}
                placeholder="Polo T-Shirt"
              />
            </div>

            <div className="space-y-2">
              <Label>Total Rolls</Label>
              <Input
                value={cuttingData.totalRolls || 0}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label>Total KG</Label>
              <Input
                value={cuttingData.totalKg || 0}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="h-5 w-5 mr-2" />
            Color Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Available Colors</Label>
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
        </CardContent>
      </Card>

      {/* Color/Size Data Entry */}
      <div className="space-y-4">
        {cuttingData.colorSizeData?.map((colorData, colorIndex) => (
          <Card key={colorData.color}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-2 ${colorData.color.toLowerCase() === 'blue' ? 'bg-blue-500' : 
                  colorData.color.toLowerCase() === 'green' ? 'bg-green-500' :
                  colorData.color.toLowerCase() === 'black' ? 'bg-black' :
                  colorData.color.toLowerCase() === 'red' ? 'bg-red-500' :
                  'bg-gray-500'}`}></div>
                {colorData.color} Color Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Fabric Data */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Rolls Used</Label>
                  <Input
                    type="number"
                    min="0"
                    value={colorData.rollsUsed}
                    onChange={(e) => updateColorData(colorData.color, 'rollsUsed', parseFloat(e.target.value) || 0)}
                    placeholder="Number of fabric rolls"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>KG Used</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={colorData.kgUsed}
                    onChange={(e) => updateColorData(colorData.color, 'kgUsed', parseFloat(e.target.value) || 0)}
                    placeholder="Fabric weight in KG"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Layers</Label>
                  <Input
                    type="number"
                    min="1"
                    value={colorData.layers}
                    onChange={(e) => updateColorData(colorData.color, 'layers', parseInt(e.target.value) || 20)}
                    placeholder="Number of layers cut"
                  />
                </div>
              </div>

              {/* Size Quantities */}
              <div className="space-y-3">
                <Label className="flex items-center">
                  <Layers className="h-4 w-4 mr-2" />
                  Size Quantities (Pieces per size)
                </Label>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {STANDARD_SIZES.map(size => {
                    const sizeData = colorData.sizes.find(s => s.size === size);
                    return (
                      <div key={size} className="space-y-1">
                        <Label className="text-sm">{size}</Label>
                        <Input
                          type="number"
                          min="0"
                          value={sizeData?.pieces || 0}
                          onChange={(e) => updateSizePieces(colorData.color, size, parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="text-center"
                        />
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-medium">Total {colorData.color} Pieces:</span>
                  <Badge variant="secondary" className="text-lg font-bold">
                    {colorData.totalPieces} pcs
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Cutting Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{cuttingData.totalRolls}</div>
              <div className="text-sm text-muted-foreground">Total Rolls</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{cuttingData.totalKg?.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Total KG</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{selectedColors.length}</div>
              <div className="text-sm text-muted-foreground">Colors</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{totalPieces}</div>
              <div className="text-sm text-muted-foreground">Total Pieces</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={testFirebaseConnection}
              disabled={loading}
            >
              🧪 Test Firebase
            </Button>

            <Button 
              variant="outline" 
              onClick={createBundles}
              disabled={loading || totalPieces === 0}
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Create Bundles for Sewing Line
            </Button>
            
            <Button 
              onClick={saveCuttingDroplet}
              disabled={saving || totalPieces === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Cutting Droplet
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CuttingDropletManager;