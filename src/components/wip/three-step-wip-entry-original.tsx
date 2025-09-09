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
  TagIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { sewingTemplateService } from '@/services/sewing-template-service';
import type { Bundle, BundleSize } from '@/types/entities';
import type { SewingTemplate } from '@/types/sewing-template-types';

interface FabricRoll {
  id: string;
  rollNumber: string;
  color: string;
  weight: number; // in kg or grams
  layerCount: number;
  layerLength: number; // in meters
  cuttingComplete: boolean;
}

interface ArticleInfo {
  id: string;
  articleNumber: string;
  style: string;
  targetAgeGroup: 'adult' | 'teenager'; // For different size charts
  priority: 'low' | 'normal' | 'high' | 'urgent';
  sizes: BundleSize[];
  sewingOperations?: string[]; // Different operations for different articles
}

interface WIPEntryData {
  // Step 1: Multiple Articles Information
  articles: ArticleInfo[];
  
  // Step 2: Fabric Roll & Layering Information
  fabricRolls: FabricRoll[];
  batchCuttingInfo: {
    layerLength: number; // Common layer length (e.g., 4.7m)
    totalLayers: number;
    cuttingEfficiency: number;
  };
  
  // Step 3: Template Selection & Confirmation (applies to all articles)
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
    articles: [{
      id: 'article_1',
      articleNumber: '',
      style: '',
      targetAgeGroup: 'adult',
      priority: 'normal',
      sizes: []
    }],
    fabricRolls: [],
    batchCuttingInfo: {
      layerLength: 4.7,
      totalLayers: 0,
      cuttingEfficiency: 95
    },
    selectedTemplateId: '',
    bundleNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<SewingTemplate[]>([]);
  const [newSize, setNewSize] = useState({ size: '', quantity: '', rate: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const [newRoll, setNewRoll] = useState({ rollNumber: '', color: '', weight: '', layerCount: '' });

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

  // Add new article
  const addArticle = () => {
    const newArticle: ArticleInfo = {
      id: `article_${Date.now()}`,
      articleNumber: '',
      style: '',
      targetAgeGroup: 'adult',
      priority: 'normal',
      sizes: []
    };
    
    setFormData(prev => ({
      ...prev,
      articles: [...prev.articles, newArticle]
    }));
    
    setCurrentArticleIndex(formData.articles.length);
  };

  // Remove article
  const removeArticle = (index: number) => {
    if (formData.articles.length <= 1) return; // Keep at least one article
    
    setFormData(prev => ({
      ...prev,
      articles: prev.articles.filter((_, i) => i !== index)
    }));
    
    // Adjust current index if needed
    if (currentArticleIndex >= index && currentArticleIndex > 0) {
      setCurrentArticleIndex(currentArticleIndex - 1);
    }
  };

  // Update current article
  const updateCurrentArticle = (updates: Partial<ArticleInfo>) => {
    setFormData(prev => ({
      ...prev,
      articles: prev.articles.map((article, index) =>
        index === currentArticleIndex ? { ...article, ...updates } : article
      )
    }));
  };

  // Add fabric roll
  const addFabricRoll = () => {
    if (newRoll.rollNumber && newRoll.color && newRoll.weight && newRoll.layerCount) {
      const roll: FabricRoll = {
        id: `roll_${Date.now()}`,
        rollNumber: newRoll.rollNumber,
        color: newRoll.color,
        weight: parseFloat(newRoll.weight),
        layerCount: parseInt(newRoll.layerCount),
        layerLength: formData.batchCuttingInfo.layerLength,
        cuttingComplete: false
      };
      
      setFormData(prev => ({
        ...prev,
        fabricRolls: [...prev.fabricRolls, roll],
        batchCuttingInfo: {
          ...prev.batchCuttingInfo,
          totalLayers: prev.batchCuttingInfo.totalLayers + parseInt(newRoll.layerCount)
        }
      }));
      
      setNewRoll({ rollNumber: '', color: '', weight: '', layerCount: '' });
    }
  };

  // Remove fabric roll
  const removeFabricRoll = (rollId: string) => {
    const rollToRemove = formData.fabricRolls.find(roll => roll.id === rollId);
    if (rollToRemove) {
      setFormData(prev => ({
        ...prev,
        fabricRolls: prev.fabricRolls.filter(roll => roll.id !== rollId),
        batchCuttingInfo: {
          ...prev.batchCuttingInfo,
          totalLayers: prev.batchCuttingInfo.totalLayers - rollToRemove.layerCount
        }
      }));
    }
  };

  const validateStep1 = () => {
    const stepErrors: Record<string, string> = {};
    
    // Validate all articles
    formData.articles.forEach((article, index) => {
      if (!article.articleNumber.trim()) stepErrors[`article_${index}_articleNumber`] = `Article ${index + 1}: Article number is required`;
      if (!article.style.trim()) stepErrors[`article_${index}_style`] = `Article ${index + 1}: Style is required`;
    });
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const validateStep2 = () => {
    const stepErrors: Record<string, string> = {};
    
    // Validate that each article has at least one size
    formData.articles.forEach((article, index) => {
      if (article.sizes.length === 0) {
        stepErrors[`article_${index}_sizes`] = `Article ${index + 1}: At least one size entry is required`;
      }
    });
    
    // Validate fabric rolls
    if (formData.fabricRolls.length === 0) {
      stepErrors.fabricRolls = 'At least one fabric roll is required for batch cutting';
    }
    
    // Validate layer length
    if (formData.batchCuttingInfo.layerLength <= 0) {
      stepErrors.layerLength = 'Layer length must be greater than 0';
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
      const updatedArticles = formData.articles.map((article, index) => 
        index === currentArticleIndex 
          ? {
              ...article,
              sizes: [...article.sizes, {
                size: newSize.size,
                quantity: parseInt(newSize.quantity),
                completed: 0,
                rate: parseFloat(newSize.rate)
              }]
            }
          : article
      );
      
      setFormData(prev => ({
        ...prev,
        articles: updatedArticles
      }));
      
      setNewSize({ size: '', quantity: '', rate: '' });
    }
  };

  const removeSize = (sizeIndex: number) => {
    const updatedArticles = formData.articles.map((article, index) => 
      index === currentArticleIndex 
        ? {
            ...article,
            sizes: article.sizes.filter((_, i) => i !== sizeIndex)
          }
        : article
    );
    
    setFormData(prev => ({
      ...prev,
      articles: updatedArticles
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
    return formData.articles.reduce((totalSum, article) => {
      return totalSum + (article.sizes?.reduce((sum, size) => sum + size.quantity, 0) || 0);
    }, 0);
  };

  const getTotalValue = () => {
    return formData.articles.reduce((totalSum, article) => {
      return totalSum + (article.sizes?.reduce((sum, size) => sum + (size.quantity * size.rate), 0) || 0);
    }, 0);
  };

  const getSelectedTemplate = () => {
    return availableTemplates.find(t => t.id === formData.selectedTemplateId);
  };

  const renderStep1 = () => {
    const currentArticle = formData.articles[currentArticleIndex];
    
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Step 1: Article Information</h3>
                <p className="text-sm text-gray-500">Enter basic article and order details</p>
              </div>
            </div>
            <Button
              onClick={addArticle}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Article</span>
            </Button>
          </div>

          {/* Article Tabs */}
          {formData.articles.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b">
              {formData.articles.map((article, index) => (
                <div key={article.id} className="flex items-center">
                  <button
                    onClick={() => setCurrentArticleIndex(index)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      index === currentArticleIndex
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Article {index + 1}
                    {article.articleNumber && ` (${article.articleNumber})`}
                  </button>
                  {formData.articles.length > 1 && (
                    <button
                      onClick={() => removeArticle(index)}
                      className="ml-1 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Current Article Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Article Number *"
                placeholder="e.g., #8082, #3233"
                value={currentArticle.articleNumber}
                onChange={(e) => updateCurrentArticle({ articleNumber: e.target.value })}
                error={errors[`article_${currentArticleIndex}_articleNumber`]}
              />
            </div>

            <div>
              <Input
                label="Style *"
                placeholder="e.g., Polo T-shirt, Round Neck"
                value={currentArticle.style}
                onChange={(e) => updateCurrentArticle({ style: e.target.value })}
                error={errors[`article_${currentArticleIndex}_style`]}
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Age Group *</label>
              <select
                value={currentArticle.targetAgeGroup}
                onChange={(e) => updateCurrentArticle({ targetAgeGroup: e.target.value as 'adult' | 'teenager' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="adult">Adult (L, XL, 2XL, 3XL)</option>
                <option value="teenager">Teenager (M, L, XL)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
              <select
                value={currentArticle.priority}
                onChange={(e) => updateCurrentArticle({ priority: e.target.value as any })}
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

        {/* Template Selection */}
        <Card className="p-6">
          <h4 className="font-medium text-gray-900 mb-4">Select Sewing Template</h4>
          <p className="text-sm text-gray-600 mb-4">Choose a template that will be used for all articles in this bundle</p>
          
          <div className="space-y-2">
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
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium text-gray-900">{template.templateName}</h5>
                    <p className="text-sm text-gray-600">{template.templateCode}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>{template.operations.length} operations</span>
                      <span>{template.totalSmv}min SMV</span>
                      <span>Rs. {template.totalPricePerPiece} per piece</span>
                    </div>
                  </div>
                  <Badge variant={template.complexityLevel === 'simple' ? 'success' : 
                                template.complexityLevel === 'medium' ? 'warning' : 'danger'}>
                    {template.complexityLevel}
                  </Badge>
                </div>
              </div>
            ))}
            {errors.templateSelection && (
              <p className="text-red-500 text-sm mt-2">{errors.templateSelection}</p>
            )}
          </div>
        </Card>

        {/* Articles Summary */}
        {formData.articles.length > 1 && (
          <Card className="p-6">
            <h4 className="font-medium text-gray-900 mb-3">Articles Summary ({formData.articles.length})</h4>
            <div className="space-y-2">
              {formData.articles.map((article, index) => (
                <div key={article.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary">#{index + 1}</Badge>
                    <div>
                      <p className="font-medium text-gray-900">{article.articleNumber || 'No article number'}</p>
                      <p className="text-sm text-gray-500">
                        {article.style} | {article.targetAgeGroup} | {article.priority}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{article.sizes.length} sizes</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  };

  const renderStep2 = () => {
    const currentArticle = formData.articles[currentArticleIndex];
    
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-green-100 p-2 rounded-lg">
              <CubeIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Step 2: Size Breakdown</h3>
              <p className="text-sm text-gray-500">Add sizes, quantities, and rates for each article</p>
            </div>
          </div>

          {/* Article Tabs */}
          {formData.articles.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b">
              {formData.articles.map((article, index) => (
                <button
                  key={article.id}
                  onClick={() => setCurrentArticleIndex(index)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    index === currentArticleIndex
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {article.articleNumber || `Article ${index + 1}`}
                  <span className="ml-2 text-xs bg-white px-1 rounded">
                    {article.sizes.length} sizes
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Current Article Info */}
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-blue-900 mb-1">
              {currentArticle.articleNumber || `Article ${currentArticleIndex + 1}`}
            </h4>
            <p className="text-sm text-blue-700">
              {currentArticle.style}            </p>
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

          {/* Current Article Sizes */}
          {currentArticle.sizes.length > 0 && (
            <div className="space-y-2 mb-4">
              <h4 className="font-medium text-gray-900">Added Sizes</h4>
              {currentArticle.sizes.map((size, index) => (
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

          {/* Current Article Summary */}
          {currentArticle.sizes.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Article Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-700">Total Pieces:</span>
                  <span className="font-semibold text-green-900 ml-2">
                    {currentArticle.sizes.reduce((sum, size) => sum + size.quantity, 0)}
                  </span>
                </div>
                <div>
                  <span className="text-green-700">Total Value:</span>
                  <span className="font-semibold text-green-900 ml-2">
                    Rs. {currentArticle.sizes.reduce((sum, size) => sum + (size.quantity * size.rate), 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {errors[`article_${currentArticleIndex}_sizes`] && (
            <p className="text-red-500 text-sm mt-2">{errors[`article_${currentArticleIndex}_sizes`]}</p>
          )}
        </Card>

        {/* Overall Summary */}
        <Card className="p-6">
          <h4 className="font-medium text-gray-900 mb-3">Overall Summary</h4>
          <div className="space-y-2">
            {formData.articles.map((article, index) => (
              <div key={article.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    {article.articleNumber || `Article ${index + 1}`}
                  </p>
                  <p className="text-sm text-gray-500">{article.style}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium">
                    {article.sizes.reduce((sum, size) => sum + size.quantity, 0)} pieces
                  </p>
                  <p className="text-gray-500">
                    Rs. {article.sizes.reduce((sum, size) => sum + (size.quantity * size.rate), 0).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
            <div className="border-t pt-2 mt-3">
              <div className="flex justify-between items-center font-semibold text-lg">
                <span>Grand Total:</span>
                <div className="text-right">
                  <p>{getTotalPieces()} pieces</p>
                  <p>Rs. {getTotalValue().toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

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