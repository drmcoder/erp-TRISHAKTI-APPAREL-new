// Enhanced Multi-Article Entry Component
// Based on your UI flowchart with improved responsive design and validation

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/Badge';
import { useDeviceOptimization } from '../../hooks/useDeviceOptimization';
import {
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

interface ArticleStyle {
  id: string;
  articleNumber: string;
  styleName: string;
  isValid: boolean;
  procedureDetails?: {
    operations: number;
    estimatedTime: number;
    estimatedCost: number;
  };
}

interface SizeConfiguration {
  sizeNames: string[];
  sizeRatios: number[];
  isValid: boolean;
}

interface WIPData {
  lotNumber: string;
  buyerName: string;
  parsedStyles: ArticleStyle[];
  sizeConfiguration: SizeConfiguration;
  // Roll and fabric data would be in steps 2-3
}

interface EnhancedMultiArticleEntryProps {
  initialData?: Partial<WIPData>;
  onDataChange: (data: WIPData) => void;
  onNext: () => void;
  onPrevious?: () => void;
  currentLanguage?: 'en' | 'ne';
}

export const EnhancedMultiArticleEntry: React.FC<EnhancedMultiArticleEntryProps> = ({
  initialData,
  onDataChange,
  onNext,
  onPrevious,
  currentLanguage = 'en'
}) => {
  const { isMobile, responsiveClasses, getComponentVariant } = useDeviceOptimization();
  
  const [wipData, setWipData] = useState<WIPData>({
    lotNumber: initialData?.lotNumber || '',
    buyerName: initialData?.buyerName || '',
    parsedStyles: initialData?.parsedStyles || [
      {
        id: `style_${Date.now()}`,
        articleNumber: '',
        styleName: '',
        isValid: false
      }
    ],
    sizeConfiguration: initialData?.sizeConfiguration || {
      sizeNames: [],
      sizeRatios: [],
      isValid: false
    }
  });

  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Text content for i18n
  const text = {
    en: {
      title: 'Manual WIP Entry',
      subtitle: 'Create new work in progress record',
      basicInfo: 'Basic Information',
      lotNumber: 'Lot Number',
      buyerName: 'Buyer Name',
      articleStyles: 'Article Styles',
      addStyle: 'Add Style',
      articleNumber: 'Article Number',
      styleName: 'Style Name',
      sizeConfig: 'Size Configuration',
      sizeNames: 'Size Names',
      sizeRatios: 'Size Ratios',
      remove: 'Remove',
      next: 'Next',
      previous: 'Previous',
      cancel: 'Cancel'
    },
    ne: {
      title: 'म्यानुअल WIP प्रविष्टि',
      subtitle: 'नयाँ कार्य प्रगति रेकर्ड सिर्जना गर्नुहोस्',
      basicInfo: 'आधारभूत जानकारी',
      lotNumber: 'लट नम्बर',
      buyerName: 'खरीददारको नाम',
      articleStyles: 'लेख शैलीहरू',
      addStyle: 'शैली थप्नुहोस्',
      articleNumber: 'लेख नम्बर',
      styleName: 'शैलीको नाम',
      sizeConfig: 'साइज कन्फिगरेसन',
      sizeNames: 'साइज नामहरू',
      sizeRatios: 'साइज अनुपातहरू',
      remove: 'हटाउनुहोस्',
      next: 'अर्को',
      previous: 'अघिल्लो',
      cancel: 'रद्द गर्नुहोस्'
    }
  };

  const t = text[currentLanguage];

  // Validation function
  const validateData = useCallback(() => {
    const errors: { [key: string]: string } = {};
    
    // Basic info validation
    if (!wipData.lotNumber.trim()) {
      errors.lotNumber = 'Lot number is required';
    }
    // Validate lot number format (should be numeric)
    if (wipData.lotNumber.trim() && !/^\d+$/.test(wipData.lotNumber.trim())) {
      errors.lotNumber = 'Lot number should be numeric (e.g., 30, 32, 34)';
    }
    if (!wipData.buyerName.trim()) {
      errors.buyerName = 'Buyer name is required';
    }

    // Article styles validation
    wipData.parsedStyles.forEach((style, index) => {
      if (!style.articleNumber.trim()) {
        errors[`style_${index}_articleNumber`] = 'Article number is required';
      }
      if (!style.styleName.trim()) {
        errors[`style_${index}_styleName`] = 'Style name is required';
      }
    });

    // Size configuration validation
    if (wipData.sizeConfiguration.sizeNames.length === 0) {
      errors.sizeNames = 'Size names are required';
    }
    if (wipData.sizeConfiguration.sizeRatios.length === 0) {
      errors.sizeRatios = 'Size ratios are required';
    }
    if (wipData.sizeConfiguration.sizeNames.length !== wipData.sizeConfiguration.sizeRatios.length) {
      errors.sizeMismatch = 'Number of sizes and ratios must match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [wipData]);

  // Update parent component when data changes
  useEffect(() => {
    onDataChange(wipData);
  }, [wipData, onDataChange]);

  // Validate data when it changes
  useEffect(() => {
    validateData();
  }, [validateData]);

  // Article management functions
  const addNewStyle = useCallback(() => {
    const newStyle: ArticleStyle = {
      id: `style_${Date.now()}`,
      articleNumber: '',
      styleName: '',
      isValid: false
    };
    
    setWipData(prev => ({
      ...prev,
      parsedStyles: [...prev.parsedStyles, newStyle]
    }));
  }, []);

  const removeStyle = useCallback((index: number) => {
    if (wipData.parsedStyles.length > 1) {
      setWipData(prev => ({
        ...prev,
        parsedStyles: prev.parsedStyles.filter((_, i) => i !== index)
      }));
    }
  }, [wipData.parsedStyles.length]);

  const handleStyleChange = useCallback((index: number, field: keyof ArticleStyle, value: string) => {
    setWipData(prev => {
      const newStyles = [...prev.parsedStyles];
      newStyles[index] = { 
        ...newStyles[index], 
        [field]: value,
        isValid: field === 'articleNumber' ? 
          (value.trim() !== '' && newStyles[index].styleName.trim() !== '') :
          (newStyles[index].articleNumber.trim() !== '' && value.trim() !== '')
      };
      return { ...prev, parsedStyles: newStyles };
    });
  }, []);

  // Size configuration functions
  const parseSmartSizeInput = useCallback((input: string): string[] => {
    const separatorRegex = /[;,:|\s]+/;
    return input.split(separatorRegex)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }, []);

  const handleSizeNamesChange = useCallback((value: string) => {
    const parsedSizes = parseSmartSizeInput(value);
    setWipData(prev => ({
      ...prev,
      sizeConfiguration: {
        ...prev.sizeConfiguration,
        sizeNames: parsedSizes,
        isValid: parsedSizes.length > 0 && parsedSizes.length === prev.sizeConfiguration.sizeRatios.length
      }
    }));
  }, [parseSmartSizeInput]);

  const handleSizeRatiosChange = useCallback((value: string) => {
    const ratios = value.split(/[,;\s]+/)
      .map(r => parseInt(r.trim()))
      .filter(r => !isNaN(r) && r > 0);
    
    setWipData(prev => ({
      ...prev,
      sizeConfiguration: {
        ...prev.sizeConfiguration,
        sizeRatios: ratios,
        isValid: ratios.length > 0 && ratios.length === prev.sizeConfiguration.sizeNames.length
      }
    }));
  }, []);

  const handleNext = () => {
    if (validateData()) {
      onNext();
    }
  };

  return (
    <div className={`${responsiveClasses.container} space-y-6`}>
      {/* Header Section */}
      <div className="text-center">
        <h1 className={`text-2xl font-bold ${responsiveClasses.fontSize} text-gray-900`}>
          📝 {t.title}
        </h1>
        <p className="text-gray-600 mt-2">{t.subtitle}</p>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-center mt-4 space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
              1
            </div>
            <span className="text-sm font-medium text-blue-600">Multi-Article</span>
          </div>
          <ArrowRightIcon className="h-4 w-4 text-gray-400" />
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-semibold">
              2
            </div>
            <span className="text-sm text-gray-500">Multi-Roll</span>
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

      {/* Basic Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t.basicInfo}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            <div>
              <Label htmlFor="lotNumber">{t.lotNumber} *</Label>
              <Input
                id="lotNumber"
                type="number"
                value={wipData.lotNumber}
                onChange={(e) => setWipData(prev => ({ ...prev, lotNumber: e.target.value }))}
                placeholder="30"
                className={validationErrors.lotNumber ? 'border-red-500' : ''}
              />
              <div className="text-xs text-gray-500 mt-1">
                Serial numbers like: 30, 32, 34, 36...
              </div>
              {validationErrors.lotNumber && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.lotNumber}</p>
              )}
            </div>
            <div>
              <Label htmlFor="buyerName">{t.buyerName} *</Label>
              <Input
                id="buyerName"
                value={wipData.buyerName}
                onChange={(e) => setWipData(prev => ({ ...prev, buyerName: e.target.value }))}
                placeholder="Buyer Name"
                className={validationErrors.buyerName ? 'border-red-500' : ''}
              />
              {validationErrors.buyerName && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.buyerName}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Multi-Article Styles Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DocumentDuplicateIcon className="h-5 w-5" />
              {t.articleStyles}
            </CardTitle>
            <Button
              type="button"
              onClick={addNewStyle}
              size="sm"
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              {t.addStyle}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {wipData.parsedStyles.map((style, index) => (
              <Card key={style.id} className="border-2 border-gray-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Article Style #{index + 1}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {style.isValid ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                      )}
                      {wipData.parsedStyles.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeStyle(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                    <div>
                      <Label htmlFor={`articleNumber_${index}`}>{t.articleNumber} *</Label>
                      <Input
                        id={`articleNumber_${index}`}
                        value={style.articleNumber}
                        onChange={(e) => handleStyleChange(index, 'articleNumber', e.target.value)}
                        placeholder="TSH001"
                        className={validationErrors[`style_${index}_articleNumber`] ? 'border-red-500' : ''}
                      />
                      {validationErrors[`style_${index}_articleNumber`] && (
                        <p className="text-sm text-red-500 mt-1">{validationErrors[`style_${index}_articleNumber`]}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor={`styleName_${index}`}>{t.styleName} *</Label>
                      <Input
                        id={`styleName_${index}`}
                        value={style.styleName}
                        onChange={(e) => handleStyleChange(index, 'styleName', e.target.value)}
                        placeholder="Basic T-Shirt"
                        className={validationErrors[`style_${index}_styleName`] ? 'border-red-500' : ''}
                      />
                      {validationErrors[`style_${index}_styleName`] && (
                        <p className="text-sm text-red-500 mt-1">{validationErrors[`style_${index}_styleName`]}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Style Status Indicator */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    {style.isValid ? (
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircleIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">Style information complete</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-yellow-700">
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        <span className="text-sm">Please complete article number and style name</span>
                      </div>
                    )}
                    
                    {/* Mock Procedure Details */}
                    {style.isValid && (
                      <div className="mt-2 text-sm text-gray-600">
                        📋 Procedure Details: 5 operations ⏱️ 45min 💰 $12.50
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Size Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📏 {t.sizeConfig}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            <div>
              <Label htmlFor="sizeNames">{t.sizeNames} *</Label>
              <Input
                id="sizeNames"
                placeholder="S, M, L, XL"
                onChange={(e) => handleSizeNamesChange(e.target.value)}
                className={validationErrors.sizeNames ? 'border-red-500' : ''}
              />
              <div className="mt-2">
                <div className="text-sm text-gray-600 mb-1">Detected sizes:</div>
                <div className="flex flex-wrap gap-1">
                  {wipData.sizeConfiguration.sizeNames.map((size, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>
              {validationErrors.sizeNames && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.sizeNames}</p>
              )}
            </div>
            <div>
              <Label htmlFor="sizeRatios">{t.sizeRatios} *</Label>
              <Input
                id="sizeRatios"
                placeholder="1, 2, 2, 1"
                onChange={(e) => handleSizeRatiosChange(e.target.value)}
                className={validationErrors.sizeRatios ? 'border-red-500' : ''}
              />
              <div className="mt-2">
                <div className="text-sm text-gray-600 mb-1">Ratio preview:</div>
                <div className="flex flex-wrap gap-1">
                  {wipData.sizeConfiguration.sizeRatios.map((ratio, index) => (
                    <Badge key={index} variant="default" className="text-xs">
                      {ratio}
                    </Badge>
                  ))}
                </div>
              </div>
              {validationErrors.sizeRatios && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.sizeRatios}</p>
              )}
            </div>
          </div>

          {/* Size Mapping Visual */}
          {wipData.sizeConfiguration.sizeNames.length > 0 && wipData.sizeConfiguration.sizeRatios.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Size mapping:</div>
              <div className="flex flex-wrap gap-2">
                {wipData.sizeConfiguration.sizeNames.map((size, index) => (
                  <div key={index} className="text-center">
                    <div className="border border-gray-300 rounded px-3 py-2 mb-1">
                      <div className="text-sm font-medium">{size}</div>
                      <div className="text-xs text-gray-600">
                        {wipData.sizeConfiguration.sizeRatios[index] || '?'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {validationErrors.sizeMismatch && (
                <p className="text-sm text-red-500 mt-2">{validationErrors.sizeMismatch}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center pt-6">
        <div>
          {onPrevious && (
            <Button
              type="button"
              onClick={onPrevious}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              {t.previous}
            </Button>
          )}
        </div>
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

export default EnhancedMultiArticleEntry;