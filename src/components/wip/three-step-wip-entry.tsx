import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Badge } from '@/shared/components/ui/Badge';
import { 
  DocumentTextIcon,
  UserGroupIcon,
  CubeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { sewingTemplateService } from '@/services/sewing-template-service';
import type { Bundle, BundleSize } from '@/types/entities';
import type { SewingTemplate } from '@/types/sewing-template-types';

interface WIPEntryData {
  // Step 1: Article Information
  articleNumber: string;
  customerPO: string;
  style: string;
  color: string;
  deliveryDate: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  // Step 2: Size Breakdown
  sizes: BundleSize[];
  
  // Step 3: Template Selection & Confirmation
  selectedTemplateId: string;
  bundleNumber: string;
}

interface ThreeStepWipEntryProps {
  onComplete: (data: WIPEntryData) => Promise<void>;
  onCancel: () => void;
}

export const ThreeStepWipEntry: React.FC<ThreeStepWipEntryProps> = ({
  onComplete,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<WIPEntryData>({
    articleNumber: '',
    customerPO: '',
    style: '',
    color: '',
    deliveryDate: '',
    priority: 'normal',
    sizes: [],
    selectedTemplateId: '',
    bundleNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<SewingTemplate[]>([]);
  const [newSize, setNewSize] = useState({ size: '', quantity: '', rate: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load available templates when reaching step 3
  React.useEffect(() => {
    if (currentStep === 3) {
      loadTemplates();
    }
  }, [currentStep]);

  const loadTemplates = async () => {
    try {
      const result = await sewingTemplateService.getActiveTemplates();
      if (result.success && result.data) {
        setAvailableTemplates(result.data);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const validateStep1 = () => {
    const stepErrors: Record<string, string> = {};
    
    if (!formData.articleNumber.trim()) stepErrors.articleNumber = 'Article number is required';
    if (!formData.customerPO.trim()) stepErrors.customerPO = 'Customer PO is required';
    if (!formData.style.trim()) stepErrors.style = 'Style is required';
    if (!formData.color.trim()) stepErrors.color = 'Color is required';
    if (!formData.deliveryDate) stepErrors.deliveryDate = 'Delivery date is required';
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const validateStep2 = () => {
    const stepErrors: Record<string, string> = {};
    
    if (formData.sizes.length === 0) {
      stepErrors.sizes = 'At least one size entry is required';
    }
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const validateStep3 = () => {
    const stepErrors: Record<string, string> = {};
    
    if (!formData.selectedTemplateId) stepErrors.template = 'Please select a sewing template';
    if (!formData.bundleNumber.trim()) stepErrors.bundleNumber = 'Bundle number is required';
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const addSize = () => {
    if (newSize.size && newSize.quantity && newSize.rate) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, {
          size: newSize.size,
          quantity: parseInt(newSize.quantity),
          completed: 0,
          rate: parseFloat(newSize.rate)
        }]
      }));
      setNewSize({ size: '', quantity: '', rate: '' });
    }
  };

  const removeSize = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }));
  };

  const handleNext = () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
    }
    
    if (isValid && currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  const handleComplete = async () => {
    if (!validateStep3()) return;
    
    setIsLoading(true);
    try {
      await onComplete(formData);
    } catch (error) {
      console.error('Failed to complete WIP entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalPieces = () => {
    return formData.sizes.reduce((sum, size) => sum + size.quantity, 0);
  };

  const getTotalValue = () => {
    return formData.sizes.reduce((sum, size) => sum + (size.quantity * size.rate), 0);
  };

  const getSelectedTemplate = () => {
    return availableTemplates.find(t => t.id === formData.selectedTemplateId);
  };

  const renderStep1 = () => (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <DocumentTextIcon className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Step 1: Article Information</h3>
          <p className="text-sm text-gray-500">Enter basic article and order details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Article Number *"
            placeholder="e.g., #8082, #3233"
            value={formData.articleNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, articleNumber: e.target.value }))}
            error={errors.articleNumber}
          />
        </div>

        <div>
          <Input
            label="Customer PO *"
            placeholder="Customer purchase order"
            value={formData.customerPO}
            onChange={(e) => setFormData(prev => ({ ...prev, customerPO: e.target.value }))}
            error={errors.customerPO}
          />
        </div>

        <div>
          <Input
            label="Style *"
            placeholder="e.g., Polo T-shirt, Round Neck"
            value={formData.style}
            onChange={(e) => setFormData(prev => ({ ...prev, style: e.target.value }))}
            error={errors.style}
          />
        </div>

        <div>
          <Input
            label="Color *"
            placeholder="e.g., Navy Blue, White"
            value={formData.color}
            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
            error={errors.color}
          />
        </div>

        <div>
          <Input
            type="date"
            label="Delivery Date *"
            value={formData.deliveryDate}
            onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
            error={errors.deliveryDate}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-green-100 p-2 rounded-lg">
          <CubeIcon className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Step 2: Size Breakdown</h3>
          <p className="text-sm text-gray-500">Add sizes, quantities, and rates</p>
        </div>
      </div>

      {/* Add Size Form */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h4 className="font-medium text-gray-900 mb-3">Add Size</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            placeholder="Size (e.g., S, M, L)"
            value={newSize.size}
            onChange={(e) => setNewSize(prev => ({ ...prev, size: e.target.value }))}
          />
          <Input
            type="number"
            placeholder="Quantity"
            value={newSize.quantity}
            onChange={(e) => setNewSize(prev => ({ ...prev, quantity: e.target.value }))}
          />
          <Input
            type="number"
            step="0.01"
            placeholder="Rate per piece"
            value={newSize.rate}
            onChange={(e) => setNewSize(prev => ({ ...prev, rate: e.target.value }))}
          />
          <Button 
            onClick={addSize}
            disabled={!newSize.size || !newSize.quantity || !newSize.rate}
            className="w-full"
          >
            Add Size
          </Button>
        </div>
      </div>

      {/* Size List */}
      {formData.sizes.length > 0 && (
        <div className="space-y-2 mb-4">
          <h4 className="font-medium text-gray-900">Added Sizes</h4>
          {formData.sizes.map((size, index) => (
            <div key={index} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="font-mono">{size.size}</Badge>
                <span className="text-sm text-gray-600">Qty: {size.quantity}</span>
                <span className="text-sm text-gray-600">Rate: Rs. {size.rate}</span>
                <span className="text-sm font-medium text-gray-900">
                  Total: Rs. {(size.quantity * size.rate).toFixed(2)}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeSize(index)}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {formData.sizes.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Order Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Total Pieces:</span>
              <span className="font-semibold text-blue-900 ml-2">{getTotalPieces()}</span>
            </div>
            <div>
              <span className="text-blue-700">Total Value:</span>
              <span className="font-semibold text-blue-900 ml-2">Rs. {getTotalValue().toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {errors.sizes && (
        <p className="text-red-500 text-sm mt-2">{errors.sizes}</p>
      )}
    </Card>
  );

  const renderStep3 = () => (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-purple-100 p-2 rounded-lg">
          <CheckCircleIcon className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Step 3: Template Selection & Confirmation</h3>
          <p className="text-sm text-gray-500">Choose sewing template and finalize</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Bundle Number */}
        <div>
          <Input
            label="Bundle Number *"
            placeholder="e.g., BND-001-2024"
            value={formData.bundleNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, bundleNumber: e.target.value }))}
            error={errors.bundleNumber}
          />
        </div>

        {/* Template Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Sewing Template *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableTemplates.map((template) => (
              <div 
                key={template.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  formData.selectedTemplateId === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, selectedTemplateId: template.id! }))}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{template.templateName}</h4>
                  <Badge variant="secondary" size="sm">{template.category}</Badge>
                </div>
                <p className="text-xs text-gray-600 mb-2">{template.templateCode}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{template.operations.length} operations</span>
                  <span>SMV: {template.totalSmv}min</span>
                </div>
                <div className="text-sm text-gray-500">
                  Est. Cost: Rs. {template.totalPricePerPiece}/piece
                </div>
              </div>
            ))}
          </div>
          {errors.template && (
            <p className="text-red-500 text-sm mt-2">{errors.template}</p>
          )}
        </div>

        {/* Final Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Final Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><span className="text-gray-600">Article:</span> <span className="font-medium">{formData.articleNumber}</span></p>
              <p><span className="text-gray-600">Style:</span> <span className="font-medium">{formData.style}</span></p>
              <p><span className="text-gray-600">Color:</span> <span className="font-medium">{formData.color}</span></p>
              <p><span className="text-gray-600">Customer PO:</span> <span className="font-medium">{formData.customerPO}</span></p>
            </div>
            <div>
              <p><span className="text-gray-600">Total Pieces:</span> <span className="font-medium">{getTotalPieces()}</span></p>
              <p><span className="text-gray-600">Total Value:</span> <span className="font-medium">Rs. {getTotalValue().toFixed(2)}</span></p>
              <p><span className="text-gray-600">Priority:</span> <Badge variant="outline" size="sm">{formData.priority}</Badge></p>
              <p><span className="text-gray-600">Template:</span> <span className="font-medium">{getSelectedTemplate()?.templateName}</span></p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step === currentStep 
                ? 'bg-blue-600 text-white' 
                : step < currentStep 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
            }`}>
              {step < currentStep ? (
                <CheckCircleIcon className="h-5 w-5" />
              ) : (
                <span className="font-semibold">{step}</span>
              )}
            </div>
            {step < 3 && (
              <div className={`w-12 h-1 mx-2 ${
                step < currentStep ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <div>
          {currentStep > 1 && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          
          {currentStep < 3 ? (
            <Button onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button 
              onClick={handleComplete} 
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Creating...' : 'Complete WIP Entry'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};