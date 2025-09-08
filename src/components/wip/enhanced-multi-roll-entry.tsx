// Enhanced Multi-Roll Entry Component (Step 2)
// Fabric & Roll Information with dynamic roll count management

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Label } from '@/shared/components/ui/label';
import { Select } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/Badge';
import { useDeviceOptimization } from '../../hooks/useDeviceOptimization';
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface FabricInformation {
  fabricName: string;
  fabricWidth: string;
  fabricStore: string;
  fabricType: string;
  fabricWeight: string;
}

interface RollInformation {
  rollCount: number;
  receivedDate: string;
  deliveryDate: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
  rollsData: Array<{
    rollNumber: string;
    weight: number;
    layers: number;
    remarks: string;
  }>;
}

interface OrderInformation {
  poNumber: string;
  buyerName: string;
  orderQuantity: number;
  seasonCode: string;
}

interface MultiRollData {
  fabricInfo: FabricInformation;
  rollInfo: RollInformation;
  orderInfo: OrderInformation;
}

interface EnhancedMultiRollEntryProps {
  initialData?: Partial<MultiRollData>;
  onDataChange: (data: MultiRollData) => void;
  onNext: () => void;
  onPrevious: () => void;
  currentLanguage?: 'en' | 'ne';
}

export const EnhancedMultiRollEntry: React.FC<EnhancedMultiRollEntryProps> = ({
  initialData,
  onDataChange,
  onNext,
  onPrevious,
  currentLanguage = 'en'
}) => {
  const { isMobile, responsiveClasses } = useDeviceOptimization();

  const [rollData, setRollData] = useState<MultiRollData>({
    fabricInfo: {
      fabricName: initialData?.fabricInfo?.fabricName || '',
      fabricWidth: initialData?.fabricInfo?.fabricWidth || '',
      fabricStore: initialData?.fabricInfo?.fabricStore || '',
      fabricType: initialData?.fabricInfo?.fabricType || '',
      fabricWeight: initialData?.fabricInfo?.fabricWeight || ''
    },
    rollInfo: {
      rollCount: initialData?.rollInfo?.rollCount || 1,
      receivedDate: initialData?.rollInfo?.receivedDate || new Date().toISOString().split('T')[0],
      deliveryDate: initialData?.rollInfo?.deliveryDate || '',
      urgencyLevel: initialData?.rollInfo?.urgencyLevel || 'medium',
      rollsData: initialData?.rollInfo?.rollsData || []
    },
    orderInfo: {
      poNumber: initialData?.orderInfo?.poNumber || '',
      buyerName: initialData?.orderInfo?.buyerName || '',
      orderQuantity: initialData?.orderInfo?.orderQuantity || 0,
      seasonCode: initialData?.orderInfo?.seasonCode || ''
    }
  });

  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [showRollDetails, setShowRollDetails] = useState(false);

  // Text content for i18n
  const text = {
    en: {
      title: 'Fabric & Roll Information',
      fabricInfo: 'Fabric Information',
      rollInfo: 'Roll Information',
      orderInfo: 'Order Information',
      summary: 'Summary',
      fabricName: 'Fabric Name',
      fabricWidth: 'Fabric Width',
      fabricStore: 'Fabric Store',
      fabricType: 'Fabric Type',
      fabricWeight: 'Fabric Weight',
      rollCount: 'Number of Rolls',
      receivedDate: 'Received Date',
      deliveryDate: 'Delivery Date',
      urgencyLevel: 'Urgency Level',
      poNumber: 'PO Number',
      buyerName: 'Buyer Name',
      orderQuantity: 'Order Quantity',
      seasonCode: 'Season Code',
      rollDetails: 'Roll Details',
      showDetails: 'Show Roll Details',
      hideDetails: 'Hide Roll Details',
      rollNumber: 'Roll #',
      weight: 'Weight (kg)',
      layers: 'Layers',
      remarks: 'Remarks',
      next: 'Next',
      previous: 'Previous',
      cancel: 'Cancel'
    },
    ne: {
      title: 'कपडा र रोल जानकारी',
      fabricInfo: 'कपडा जानकारी',
      rollInfo: 'रोल जानकारी',
      orderInfo: 'अर्डर जानकारी',
      summary: 'सारांश',
      fabricName: 'कपडाको नाम',
      fabricWidth: 'कपडाको चौडाई',
      fabricStore: 'कपडा पसल',
      fabricType: 'कपडाको प्रकार',
      fabricWeight: 'कपडाको तौल',
      rollCount: 'रोलहरूको संख्या',
      receivedDate: 'प्राप्त मिति',
      deliveryDate: 'डेलिभरी मिति',
      urgencyLevel: 'जरुरी स्तर',
      poNumber: 'PO नम्बर',
      buyerName: 'खरीददारको नाम',
      orderQuantity: 'अर्डर मात्रा',
      seasonCode: 'सिजन कोड',
      rollDetails: 'रोल विवरणहरू',
      showDetails: 'रोल विवरण देखाउनुहोस्',
      hideDetails: 'रोल विवरण लुकाउनुहोस्',
      rollNumber: 'रोल #',
      weight: 'तौल (कि.ग्रा.)',
      layers: 'तहहरू',
      remarks: 'टिप्पणीहरू',
      next: 'अर्को',
      previous: 'अघिल्लो',
      cancel: 'रद्द गर्नुहोस्'
    }
  };

  const t = text[currentLanguage];

  const urgencyOptions = [
    { value: 'low', label: '🟢 Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: '🟡 Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: '🟠 High', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: '🔴 Urgent', color: 'bg-red-100 text-red-800' }
  ];

  // Validation function
  const validateData = useCallback(() => {
    const errors: { [key: string]: string } = {};
    
    // Fabric validation
    if (!rollData.fabricInfo.fabricName.trim()) {
      errors.fabricName = 'Fabric name is required';
    }
    if (!rollData.fabricInfo.fabricWidth.trim()) {
      errors.fabricWidth = 'Fabric width is required';
    }

    // Roll validation
    if (rollData.rollInfo.rollCount < 1) {
      errors.rollCount = 'At least one roll is required';
    }
    if (!rollData.rollInfo.receivedDate) {
      errors.receivedDate = 'Received date is required';
    }

    // Order validation
    if (!rollData.orderInfo.buyerName.trim()) {
      errors.buyerName = 'Buyer name is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [rollData]);

  // Generate roll details when roll count changes
  useEffect(() => {
    const currentRollsData = rollData.rollInfo.rollsData;
    const targetCount = rollData.rollInfo.rollCount;
    
    if (currentRollsData.length !== targetCount) {
      const newRollsData = Array.from({ length: targetCount }, (_, index) => {
        if (currentRollsData[index]) {
          return currentRollsData[index];
        }
        return {
          rollNumber: `R${(index + 1).toString().padStart(3, '0')}`,
          weight: 20,
          layers: 30,
          remarks: ''
        };
      });

      setRollData(prev => ({
        ...prev,
        rollInfo: {
          ...prev.rollInfo,
          rollsData: newRollsData
        }
      }));
    }
  }, [rollData.rollInfo.rollCount, rollData.rollInfo.rollsData]);

  // Update parent component when data changes
  useEffect(() => {
    onDataChange(rollData);
  }, [rollData, onDataChange]);

  // Handle form field changes
  const handleFieldChange = useCallback((section: keyof MultiRollData, field: string, value: any) => {
    setRollData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  }, []);

  const handleRollDetailChange = useCallback((rollIndex: number, field: string, value: any) => {
    setRollData(prev => {
      const newRollsData = [...prev.rollInfo.rollsData];
      newRollsData[rollIndex] = {
        ...newRollsData[rollIndex],
        [field]: value
      };
      return {
        ...prev,
        rollInfo: {
          ...prev.rollInfo,
          rollsData: newRollsData
        }
      };
    });
  }, []);

  const handleNext = () => {
    if (validateData()) {
      onNext();
    }
  };

  const getUrgencyDisplay = (level: string) => {
    const option = urgencyOptions.find(opt => opt.value === level);
    return option || urgencyOptions[1]; // Default to medium
  };

  return (
    <div className={`${responsiveClasses.container} space-y-6`}>
      {/* Header Section */}
      <div className="text-center">
        <h1 className={`text-2xl font-bold ${responsiveClasses.fontSize} text-gray-900`}>
          🧵 {t.title}
        </h1>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-center mt-4 space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold">
              ✓
            </div>
            <span className="text-sm text-green-600">Multi-Article</span>
          </div>
          <ArrowRightIcon className="h-4 w-4 text-gray-400" />
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
              2
            </div>
            <span className="text-sm font-medium text-blue-600">Multi-Roll</span>
          </div>
          <ArrowRightIcon className="h-4 w-4 text-gray-400" />
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-semibold">
              3
            </div>
            <span className="text-sm text-gray-500">Preview</span>
          </div>
        </div>
      </div>

      {/* Fabric Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t.fabricInfo}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            <div>
              <Label htmlFor="fabricName">{t.fabricName} *</Label>
              <Input
                id="fabricName"
                value={rollData.fabricInfo.fabricName}
                onChange={(e) => handleFieldChange('fabricInfo', 'fabricName', e.target.value)}
                placeholder="Cotton"
                className={validationErrors.fabricName ? 'border-red-500' : ''}
              />
              {validationErrors.fabricName && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.fabricName}</p>
              )}
            </div>
            <div>
              <Label htmlFor="fabricWidth">{t.fabricWidth} *</Label>
              <Input
                id="fabricWidth"
                value={rollData.fabricInfo.fabricWidth}
                onChange={(e) => handleFieldChange('fabricInfo', 'fabricWidth', e.target.value)}
                placeholder="60 inches"
                className={validationErrors.fabricWidth ? 'border-red-500' : ''}
              />
              {validationErrors.fabricWidth && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.fabricWidth}</p>
              )}
            </div>
            <div>
              <Label htmlFor="fabricStore">{t.fabricStore}</Label>
              <Input
                id="fabricStore"
                value={rollData.fabricInfo.fabricStore}
                onChange={(e) => handleFieldChange('fabricInfo', 'fabricStore', e.target.value)}
                placeholder="Store ABC"
              />
            </div>
            <div>
              <Label htmlFor="fabricType">{t.fabricType}</Label>
              <Select
                value={rollData.fabricInfo.fabricType}
                onValueChange={(value) => handleFieldChange('fabricInfo', 'fabricType', value)}
              >
                <option value="">Select Type</option>
                <option value="cotton">Cotton</option>
                <option value="polyester">Polyester</option>
                <option value="blend">Cotton-Polyester Blend</option>
                <option value="silk">Silk</option>
                <option value="wool">Wool</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roll Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t.rollInfo}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            <div>
              <Label htmlFor="rollCount">{t.rollCount} *</Label>
              <Input
                id="rollCount"
                type="number"
                min="1"
                max="20"
                value={rollData.rollInfo.rollCount}
                onChange={(e) => handleFieldChange('rollInfo', 'rollCount', parseInt(e.target.value) || 1)}
                className={validationErrors.rollCount ? 'border-red-500' : ''}
              />
              {validationErrors.rollCount && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.rollCount}</p>
              )}
            </div>
            <div>
              <Label htmlFor="receivedDate">{t.receivedDate} *</Label>
              <Input
                id="receivedDate"
                type="date"
                value={rollData.rollInfo.receivedDate}
                onChange={(e) => handleFieldChange('rollInfo', 'receivedDate', e.target.value)}
                className={validationErrors.receivedDate ? 'border-red-500' : ''}
              />
              {validationErrors.receivedDate && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.receivedDate}</p>
              )}
            </div>
            <div>
              <Label htmlFor="deliveryDate">{t.deliveryDate}</Label>
              <Input
                id="deliveryDate"
                type="date"
                value={rollData.rollInfo.deliveryDate}
                onChange={(e) => handleFieldChange('rollInfo', 'deliveryDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="urgencyLevel">{t.urgencyLevel} *</Label>
              <Select
                value={rollData.rollInfo.urgencyLevel}
                onValueChange={(value) => handleFieldChange('rollInfo', 'urgencyLevel', value)}
              >
                {urgencyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Roll Details Toggle */}
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRollDetails(!showRollDetails)}
              className="flex items-center gap-2"
            >
              <InformationCircleIcon className="h-4 w-4" />
              {showRollDetails ? t.hideDetails : t.showDetails}
            </Button>
          </div>

          {/* Individual Roll Details */}
          {showRollDetails && (
            <div className="mt-4 space-y-4">
              <h4 className="font-semibold text-gray-900">{t.rollDetails}</h4>
              {rollData.rollInfo.rollsData.map((roll, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-4'} gap-4`}>
                      <div>
                        <Label htmlFor={`rollNumber_${index}`}>{t.rollNumber}</Label>
                        <Input
                          id={`rollNumber_${index}`}
                          value={roll.rollNumber}
                          onChange={(e) => handleRollDetailChange(index, 'rollNumber', e.target.value)}
                          placeholder={`R${(index + 1).toString().padStart(3, '0')}`}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`weight_${index}`}>{t.weight}</Label>
                        <Input
                          id={`weight_${index}`}
                          type="number"
                          min="1"
                          value={roll.weight}
                          onChange={(e) => handleRollDetailChange(index, 'weight', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`layers_${index}`}>{t.layers}</Label>
                        <Input
                          id={`layers_${index}`}
                          type="number"
                          min="1"
                          value={roll.layers}
                          onChange={(e) => handleRollDetailChange(index, 'layers', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`remarks_${index}`}>{t.remarks}</Label>
                        <Input
                          id={`remarks_${index}`}
                          value={roll.remarks}
                          onChange={(e) => handleRollDetailChange(index, 'remarks', e.target.value)}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t.orderInfo}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            <div>
              <Label htmlFor="poNumber">{t.poNumber}</Label>
              <Input
                id="poNumber"
                value={rollData.orderInfo.poNumber}
                onChange={(e) => handleFieldChange('orderInfo', 'poNumber', e.target.value)}
                placeholder="PO-2024-001"
              />
            </div>
            <div>
              <Label htmlFor="orderBuyerName">{t.buyerName} *</Label>
              <Input
                id="orderBuyerName"
                value={rollData.orderInfo.buyerName}
                onChange={(e) => handleFieldChange('orderInfo', 'buyerName', e.target.value)}
                placeholder="Buyer ABC"
                className={validationErrors.buyerName ? 'border-red-500' : ''}
              />
              {validationErrors.buyerName && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.buyerName}</p>
              )}
            </div>
            <div>
              <Label htmlFor="orderQuantity">{t.orderQuantity}</Label>
              <Input
                id="orderQuantity"
                type="number"
                min="0"
                value={rollData.orderInfo.orderQuantity}
                onChange={(e) => handleFieldChange('orderInfo', 'orderQuantity', parseInt(e.target.value) || 0)}
                placeholder="1000"
              />
            </div>
            <div>
              <Label htmlFor="seasonCode">{t.seasonCode}</Label>
              <Input
                id="seasonCode"
                value={rollData.orderInfo.seasonCode}
                onChange={(e) => handleFieldChange('orderInfo', 'seasonCode', e.target.value)}
                placeholder="SS24"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">📊 {t.summary}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Fabric:</span> {rollData.fabricInfo.fabricName} ({rollData.fabricInfo.fabricWidth})
            </div>
            <div>
              <span className="font-medium">Rolls:</span> {rollData.rollInfo.rollCount}
            </div>
            <div>
              <span className="font-medium">Buyer:</span> {rollData.orderInfo.buyerName}
            </div>
            <div>
              <span className="font-medium">Urgency:</span> 
              <Badge 
                className={`ml-2 ${getUrgencyDisplay(rollData.rollInfo.urgencyLevel).color}`}
                variant="outline"
              >
                {getUrgencyDisplay(rollData.rollInfo.urgencyLevel).label}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center pt-6">
        <Button
          type="button"
          onClick={onPrevious}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {t.previous}
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline">
            {t.cancel}
          </Button>
          <Button
            type="button"
            onClick={handleNext}
            disabled={!validateData()}
            className="flex items-center gap-2"
          >
            {t.next}
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMultiRollEntry;