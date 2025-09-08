// Complete WIP Entry Workflow
// 3-step process: Multi-Article → Multi-Roll → Summary Preview

import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useDeviceOptimization } from '../../hooks/useDeviceOptimization';
import { EnhancedMultiArticleEntry } from './enhanced-multi-article-entry';
import { EnhancedMultiRollEntry } from './enhanced-multi-roll-entry';
import { WIPSummaryPreview } from './wip-summary-preview';

// Combined data interface matching your state structure
interface WIPData {
  // Basic Info
  lotNumber: string;
  buyerName: string;
  
  // Multi-Article Support  
  parsedStyles: Array<{
    id: string;
    articleNumber: string;
    styleName: string;
    isValid: boolean;
    procedureDetails?: {
      operations: number;
      estimatedTime: number;
      estimatedCost: number;
    };
  }>;
  
  // Size Configuration
  sizeConfiguration: {
    sizeNames: string[];
    sizeRatios: number[];
    isValid: boolean;
  };
  
  // Fabric & Roll Info
  fabricInfo: {
    fabricName: string;
    fabricWidth: string;
    fabricStore: string;
    fabricType: string;
    fabricWeight: string;
  };
  
  rollInfo: {
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
  };
  
  // Order Information
  orderInfo: {
    poNumber: string;
    buyerName: string;
    orderQuantity: number;
    seasonCode: string;
  };
  
  // Procedure Templates (matching your structure)
  articleProcedures: { [articleId: string]: any };
  customTemplates: { [templateId: string]: any };
}

interface CompleteWIPEntryWorkflowProps {
  onComplete: (wipData: WIPData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<WIPData>;
  currentLanguage?: 'en' | 'ne';
}

export const CompleteWIPEntryWorkflow: React.FC<CompleteWIPEntryWorkflowProps> = ({
  onComplete,
  onCancel,
  initialData,
  currentLanguage = 'en'
}) => {
  const { responsiveClasses } = useDeviceOptimization();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize WIP data matching your state structure
  const [wipData, setWipData] = useState<WIPData>({
    // Basic Info
    lotNumber: initialData?.lotNumber || '',
    buyerName: initialData?.buyerName || '',
    
    // Multi-Article Support
    parsedStyles: initialData?.parsedStyles || [
      {
        id: `style_${Date.now()}`,
        articleNumber: '',
        styleName: '',
        isValid: false
      }
    ],
    
    // Size Configuration
    sizeConfiguration: initialData?.sizeConfiguration || {
      sizeNames: [],
      sizeRatios: [],
      isValid: false
    },
    
    // Fabric & Roll Info
    fabricInfo: initialData?.fabricInfo || {
      fabricName: '',
      fabricWidth: '',
      fabricStore: '',
      fabricType: '',
      fabricWeight: ''
    },
    
    rollInfo: initialData?.rollInfo || {
      rollCount: 1,
      receivedDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      urgencyLevel: 'medium',
      rollsData: []
    },
    
    // Order Information
    orderInfo: initialData?.orderInfo || {
      poNumber: '',
      buyerName: initialData?.buyerName || '',
      orderQuantity: 0,
      seasonCode: ''
    },
    
    // Procedure Templates
    articleProcedures: initialData?.articleProcedures || {},
    customTemplates: initialData?.customTemplates || {}
  });

  // Step 1: Multi-Article Data Handler
  const handleMultiArticleData = useCallback((step1Data: {
    lotNumber: string;
    buyerName: string;
    parsedStyles: any[];
    sizeConfiguration: any;
  }) => {
    setWipData(prev => ({
      ...prev,
      lotNumber: step1Data.lotNumber,
      buyerName: step1Data.buyerName,
      parsedStyles: step1Data.parsedStyles,
      sizeConfiguration: step1Data.sizeConfiguration,
      // Update order info buyer name to match
      orderInfo: {
        ...prev.orderInfo,
        buyerName: step1Data.buyerName
      }
    }));
  }, []);

  // Step 2: Multi-Roll Data Handler  
  const handleMultiRollData = useCallback((step2Data: {
    fabricInfo: any;
    rollInfo: any;
    orderInfo: any;
  }) => {
    setWipData(prev => ({
      ...prev,
      fabricInfo: step2Data.fabricInfo,
      rollInfo: step2Data.rollInfo,
      orderInfo: {
        ...prev.orderInfo,
        ...step2Data.orderInfo,
        // Ensure buyer name consistency
        buyerName: prev.buyerName
      }
    }));
  }, []);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
      toast.success(`Step ${currentStep + 1} completed!`);
    }
  }, [currentStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Final save handler
  const handleSave = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Add metadata
      const completeWIPData: WIPData = {
        ...wipData,
        // Ensure consistency
        orderInfo: {
          ...wipData.orderInfo,
          buyerName: wipData.buyerName
        }
      };

      await onComplete(completeWIPData);
      toast.success('WIP entry saved successfully!');
      
    } catch (error) {
      console.error('Error saving WIP:', error);
      toast.error('Failed to save WIP entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [wipData, onComplete]);

  // Prepare summary data for step 3
  const summaryData = {
    lotNumber: wipData.lotNumber,
    buyerName: wipData.buyerName,
    articles: wipData.parsedStyles.map(style => ({
      articleNumber: style.articleNumber,
      styleName: style.styleName,
      procedureDetails: style.procedureDetails
    })),
    sizeNames: wipData.sizeConfiguration.sizeNames,
    sizeRatios: wipData.sizeConfiguration.sizeRatios,
    rollCount: wipData.rollInfo.rollCount,
    fabricName: wipData.fabricInfo.fabricName,
    fabricWidth: wipData.fabricInfo.fabricWidth,
    urgencyLevel: wipData.rollInfo.urgencyLevel,
    poNumber: wipData.orderInfo.poNumber,
    deliveryDate: wipData.rollInfo.deliveryDate
  };

  return (
    <div className={`${responsiveClasses.container} min-h-screen bg-gray-50`}>
      {/* Step Rendering */}
      {currentStep === 1 && (
        <EnhancedMultiArticleEntry
          initialData={{
            lotNumber: wipData.lotNumber,
            buyerName: wipData.buyerName,
            parsedStyles: wipData.parsedStyles,
            sizeConfiguration: wipData.sizeConfiguration
          }}
          onDataChange={handleMultiArticleData}
          onNext={handleNext}
          currentLanguage={currentLanguage}
        />
      )}

      {currentStep === 2 && (
        <EnhancedMultiRollEntry
          initialData={{
            fabricInfo: wipData.fabricInfo,
            rollInfo: wipData.rollInfo,
            orderInfo: wipData.orderInfo
          }}
          onDataChange={handleMultiRollData}
          onNext={handleNext}
          onPrevious={handlePrevious}
          currentLanguage={currentLanguage}
        />
      )}

      {currentStep === 3 && (
        <WIPSummaryPreview
          data={summaryData}
          onSave={handleSave}
          onPrevious={handlePrevious}
          currentLanguage={currentLanguage}
          isLoading={isLoading}
        />
      )}

      {/* Development Debug Panel (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-white border border-gray-300 rounded-lg p-3 shadow-lg max-w-sm">
          <div className="text-xs font-mono">
            <div><strong>Step:</strong> {currentStep}/3</div>
            <div><strong>Lot:</strong> {wipData.lotNumber || 'Not set'}</div>
            <div><strong>Articles:</strong> {wipData.parsedStyles.length}</div>
            <div><strong>Rolls:</strong> {wipData.rollInfo.rollCount}</div>
            <div><strong>Valid:</strong> {
              wipData.sizeConfiguration.isValid && 
              wipData.parsedStyles.every(s => s.isValid) ? '✅' : '❌'
            }</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Hook for WIP entry state management (matches your handler structure)
export const useWIPEntryState = () => {
  const [wipData, setWipData] = useState<WIPData>({
    lotNumber: '',
    buyerName: '',
    parsedStyles: [{ 
      id: `style_${Date.now()}`, 
      articleNumber: '', 
      styleName: '', 
      isValid: false 
    }],
    sizeConfiguration: { sizeNames: [], sizeRatios: [], isValid: false },
    fabricInfo: { fabricName: '', fabricWidth: '', fabricStore: '', fabricType: '', fabricWeight: '' },
    rollInfo: { 
      rollCount: 1, 
      receivedDate: new Date().toISOString().split('T')[0], 
      deliveryDate: '', 
      urgencyLevel: 'medium', 
      rollsData: [] 
    },
    orderInfo: { poNumber: '', buyerName: '', orderQuantity: 0, seasonCode: '' },
    articleProcedures: {},
    customTemplates: {}
  });

  // Handler functions matching your implementation
  const handleStyleChange = useCallback((index: number, field: string, value: any) => {
    setWipData(prev => {
      const newStyles = [...prev.parsedStyles];
      newStyles[index] = { 
        ...newStyles[index], 
        [field]: value,
        isValid: field === 'articleNumber' ? 
          (value.trim() !== '' && newStyles[index].styleName.trim() !== '') :
          field === 'styleName' ?
          (newStyles[index].articleNumber.trim() !== '' && value.trim() !== '') :
          newStyles[index].isValid
      };
      return { ...prev, parsedStyles: newStyles };
    });
  }, []);

  const addNewStyle = useCallback(() => {
    setWipData(prev => ({
      ...prev,
      parsedStyles: [...prev.parsedStyles, {
        id: `style_${Date.now()}`,
        articleNumber: '',
        styleName: '',
        isValid: false
      }]
    }));
  }, []);

  const removeStyle = useCallback((index: number) => {
    setWipData(prev => {
      if (prev.parsedStyles.length > 1) {
        return {
          ...prev,
          parsedStyles: prev.parsedStyles.filter((_, i) => i !== index)
        };
      }
      return prev;
    });
  }, []);

  const handleSizeNamesChange = useCallback((value: string) => {
    const sizeNames = value.split(/[;,:|\s]+/).map(s => s.trim()).filter(s => s.length > 0);
    setWipData(prev => ({
      ...prev,
      sizeConfiguration: {
        ...prev.sizeConfiguration,
        sizeNames,
        isValid: sizeNames.length > 0 && sizeNames.length === prev.sizeConfiguration.sizeRatios.length
      }
    }));
  }, []);

  const handleSizeRatiosChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const ratios = e.target.value.split(/[,;\s]+/)
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

  const handleRollCountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rollCount = parseInt(e.target.value) || 1;
    setWipData(prev => ({
      ...prev,
      rollInfo: { ...prev.rollInfo, rollCount }
    }));
  }, []);

  const handleFabricDataChange = useCallback((field: string, value: any) => {
    setWipData(prev => ({
      ...prev,
      fabricInfo: { ...prev.fabricInfo, [field]: value }
    }));
  }, []);

  return {
    wipData,
    setWipData,
    handleStyleChange,
    addNewStyle,
    removeStyle,
    handleSizeNamesChange,
    handleSizeRatiosChange,
    handleRollCountChange,
    handleFabricDataChange
  };
};

export default CompleteWIPEntryWorkflow;