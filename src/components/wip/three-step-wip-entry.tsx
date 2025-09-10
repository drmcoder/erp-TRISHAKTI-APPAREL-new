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
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { sewingTemplateService } from '@/services/sewing-template-service';
import type { BundleSize } from '@/types/entities';
import type { SewingTemplate } from '@/shared/types/sewing-template-types';

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
  priority: 'low' | 'normal' | 'high' | 'urgent';
  sizes: BundleSize[];
  sizeNames: string; // e.g., "M:L:XL"
  sizeRatios: string; // e.g., "1:2:1"
  selectedTemplateId: string; // Individual template for this article
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
      priority: 'normal',
      sizes: [],
      sizeNames: '',
      sizeRatios: '',
      selectedTemplateId: ''
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const [newRoll, setNewRoll] = useState({ rollNumber: '', color: '', weight: '', layerCount: '' });
  const [rollErrors, setRollErrors] = useState<string[]>([]);

  // Derived value for current article
  const currentArticle = formData.articles[currentArticleIndex] || formData.articles[0];

  // Load available templates when component mounts (needed for Step 1)
  React.useEffect(() => {
    loadTemplates();
  }, []);

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
      priority: 'normal',
      sizes: [],
      sizeNames: '',
      sizeRatios: '',
      selectedTemplateId: ''
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

  // Validate fabric roll input
  const validateFabricRoll = () => {
    const errors: string[] = [];
    if (!newRoll.rollNumber.trim()) errors.push('Roll number is required');
    if (!newRoll.color.trim()) errors.push('Color is required');
    if (!newRoll.weight.trim() || parseFloat(newRoll.weight) <= 0) errors.push('Weight must be greater than 0');
    if (!newRoll.layerCount.trim() || parseInt(newRoll.layerCount) <= 0) errors.push('Layer count must be greater than 0');
    
    // Check for duplicate roll numbers
    if (newRoll.rollNumber.trim() && formData.fabricRolls.some(roll => roll.rollNumber.toLowerCase() === newRoll.rollNumber.trim().toLowerCase())) {
      errors.push('Roll number already exists');
    }
    
    return errors;
  };

  // Add fabric roll
  const addFabricRoll = () => {
    const validationErrors = validateFabricRoll();
    setRollErrors(validationErrors);
    
    if (validationErrors.length === 0) {
      const roll: FabricRoll = {
        id: `roll_${Date.now()}`,
        rollNumber: newRoll.rollNumber.trim(),
        color: newRoll.color.trim(),
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
      setRollErrors([]);
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
    
    // Validate batch number
    if (!formData.bundleNumber.trim()) stepErrors.bundleNumber = 'Batch number is required';
    
    // Validate all articles
    formData.articles.forEach((article, index) => {
      if (!article.articleNumber.trim()) stepErrors[`article_${index}_articleNumber`] = `Article ${index + 1}: Article number is required`;
      if (!article.style.trim()) stepErrors[`article_${index}_style`] = `Article ${index + 1}: Style is required`;
      if (!article.sizeNames.trim()) stepErrors[`article_${index}_sizeNames`] = `Article ${index + 1}: Size names are required`;
      if (!article.sizeRatios.trim()) stepErrors[`article_${index}_sizeRatios`] = `Article ${index + 1}: Size ratios are required`;
      if (!article.selectedTemplateId) stepErrors[`article_${index}_template`] = `Article ${index + 1}: Sewing template is required`;
      
      // Validate size names and ratios match
      if (article.sizeNames.trim() && article.sizeRatios.trim()) {
        const sizes = article.sizeNames.split(':').filter(s => s.trim());
        const ratios = article.sizeRatios.split(':').filter(r => r.trim());
        if (sizes.length !== ratios.length) {
          stepErrors[`article_${index}_sizeMatch`] = `Article ${index + 1}: Number of sizes and ratios must match`;
        }
      }
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
    
    // Check that all articles have templates assigned (should be validated in Step 1 already)
    const articlesWithoutTemplates = formData.articles.filter(article => !article.selectedTemplateId);
    if (articlesWithoutTemplates.length > 0) {
      stepErrors.articleTemplates = `${articlesWithoutTemplates.length} articles are missing template assignments`;
    }
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  // Generate sizes from article configuration
  const generateSizesFromConfig = (articleIndex: number) => {
    const article = formData.articles[articleIndex];
    if (!article.sizeNames.trim() || !article.sizeRatios.trim()) return;
    
    const sizeNames = article.sizeNames.split(':').map(s => s.trim()).filter(s => s);
    const sizeRatios = article.sizeRatios.split(':').map(r => r.trim()).filter(r => r);
    
    if (sizeNames.length !== sizeRatios.length) {
      setErrors(prev => ({
        ...prev,
        sizeGeneration: 'Size names and ratios count must match'
      }));
      return;
    }
    
    // Get template data for pricing/SMV - all sizes use same template values
    const selectedTemplate = availableTemplates.find(t => t.id === article.selectedTemplateId);
    const templateRate = selectedTemplate ? selectedTemplate.totalPricePerPiece : 0;
    const templateSmv = selectedTemplate ? selectedTemplate.totalSmv : 0;
    
    // Clear existing sizes and generate new ones - no per-size variation
    const newSizes = sizeNames.map((sizeName, index) => ({
      size: sizeName,
      quantity: parseInt(sizeRatios[index]) || 1,
      completed: 0,
      rate: templateRate, // Same rate for all sizes from template
      smv: templateSmv // Same SMV for all sizes from template
    }));
    
    const updatedArticles = formData.articles.map((art, index) => 
      index === articleIndex 
        ? { ...art, sizes: newSizes }
        : art
    );
    
    setFormData(prev => ({
      ...prev,
      articles: updatedArticles
    }));
    
    setErrors(prev => ({ ...prev, sizeGeneration: '' }));
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



  const renderStep1 = () => {
    const currentArticle = formData.articles[currentArticleIndex];
    
    return (
      <div className="space-y-4 md:space-y-6">
        {/* Step Header - Mobile Optimized */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg md:rounded-2xl p-4 md:p-8 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="bg-white/20 backdrop-blur rounded-lg md:rounded-xl p-2 md:p-3">
                <DocumentTextIcon className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl md:text-3xl font-bold">Step 1: Article Info</h2>
                <p className="text-blue-100 text-sm md:text-lg">Multiple articles for batch cutting</p>
              </div>
            </div>
            <Button
              onClick={addArticle}
              className="bg-white/20 backdrop-blur hover:bg-white/30 text-white border-white/30 border min-h-[44px] px-4 md:px-6 py-2 md:py-3 w-full md:w-auto"
            >
              <PlusIcon className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              <span className="text-sm md:text-base">Add Article</span>
            </Button>
          </div>
          
          {/* Progress Indicators */}
          <div className="flex items-center gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
              <span className="text-sm font-medium">Articles: {formData.articles.length}</span>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
              <span className="text-sm font-medium">Current: {currentArticleIndex + 1}</span>
            </div>
          </div>
        </div>

        <Card className="p-8 border-l-4 border-l-blue-500 bg-blue-50/30">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-2xl">📋</span>
            <h3 className="text-xl font-bold text-gray-900">Article Configuration</h3>
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
          {/* Batch Number - Only show for first article */}
          {currentArticleIndex === 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🏷️</span>
                <h4 className="font-semibold text-yellow-900">Batch Information</h4>
              </div>
              <Input
                label="Batch Number *"
                placeholder="e.g., BATCH-001-2024, WIP-DEC-001"
                value={formData.bundleNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, bundleNumber: e.target.value }))}
                error={errors.bundleNumber}
                className="bg-white"
              />
              <p className="text-sm text-yellow-700 mt-1">
                💡 This batch number will be used for all articles in this cutting session
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Article Number *"
                placeholder="e.g., #3233 (adult), #3265 (teen)"
                value={currentArticle.articleNumber}
                onChange={(e) => updateCurrentArticle({ articleNumber: e.target.value })}
                error={errors[`article_${currentArticleIndex}_articleNumber`]}
              />
            </div>

            <div>
              <Input
                label="Style *"
                placeholder="e.g., Round Neck T-shirt"
                value={currentArticle.style}
                onChange={(e) => updateCurrentArticle({ style: e.target.value })}
                error={errors[`article_${currentArticleIndex}_style`]}
              />
            </div>

            <div>
              <Input
                label="Size Names *"
                placeholder="e.g., M:L:XL or S:M:L:XL:2XL"
                value={currentArticle.sizeNames}
                onChange={(e) => updateCurrentArticle({ sizeNames: e.target.value })}
                error={errors[`article_${currentArticleIndex}_sizeNames`]}
              />
              <p className="text-xs text-gray-500 mt-1">Enter sizes separated by colon (:)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
              <select
                value={currentArticle.priority}
                onChange={(e) => updateCurrentArticle({ priority: e.target.value as 'low' | 'normal' | 'high' | 'urgent' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <Input
                label="Size Ratios *"
                placeholder="e.g., 1:2:1 or 2:3:2:1:1"
                value={currentArticle.sizeRatios}
                onChange={(e) => updateCurrentArticle({ sizeRatios: e.target.value })}
                error={errors[`article_${currentArticleIndex}_sizeRatios`]}
              />
              <p className="text-xs text-gray-500 mt-1">Enter ratios separated by colon (:), matching size names order</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sewing Template *</label>
              <select
                value={currentArticle.selectedTemplateId}
                onChange={(e) => updateCurrentArticle({ selectedTemplateId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a sewing template</option>
                {availableTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.templateName} ({template.templateCode}) - {template.operations.length} ops
                  </option>
                ))}
              </select>
              {errors[`article_${currentArticleIndex}_template`] && (
                <p className="text-red-500 text-sm mt-1">{errors[`article_${currentArticleIndex}_template`]}</p>
              )}
              
              {/* Template Preview */}
              {currentArticle.selectedTemplateId && (
                <div className="mt-2 p-3 bg-gray-50 rounded border">
                  {(() => {
                    const selectedTemplate = availableTemplates.find(t => t.id === currentArticle.selectedTemplateId);
                    return selectedTemplate ? (
                      <div>
                        <p className="text-sm font-medium text-gray-800">{selectedTemplate.templateName}</p>
                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mt-1">
                          <span>{selectedTemplate.operations.length} operations</span>
                          <span>{selectedTemplate.totalSmv}min SMV</span>
                          <span>Rs. {selectedTemplate.totalPricePerPiece}/pc</span>
                        </div>
                      </div>
                    ) : null;
                  })()} 
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Articles Summary */}
        {formData.articles.length > 0 && (
          <Card className="p-6">
            <h4 className="font-medium text-gray-900 mb-3">Batch Cutting Preview ({formData.articles.length} Articles)</h4>
            <div className="bg-yellow-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-yellow-800">
                📋 <strong>Multi-Article Batch:</strong> All articles will be cut together from the same fabric layers for maximum efficiency.
              </p>
            </div>
            <div className="space-y-2">
              {formData.articles.map((article, index) => (
                <div key={article.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary">#{index + 1}</Badge>
                    <div>
                      <p className="font-medium text-gray-900">{article.articleNumber || 'No article number'}</p>
                      <p className="text-sm text-gray-500">
                        {article.style} | {article.priority} | Sizes: {article.sizeNames || 'Not set'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Template: {(() => {
                          const template = availableTemplates.find(t => t.id === article.selectedTemplateId);
                          return template ? template.templateName : 'Not selected';
                        })()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">
                      {(() => {
                        if (article.sizes.length > 0) {
                          // If sizes are already generated, show actual total pieces
                          return `${article.sizes.reduce((sum, size) => sum + size.quantity, 0)} pieces`;
                        } else if (article.sizeRatios) {
                          // If ratios are set but sizes not generated yet, calculate preview
                          const ratios = article.sizeRatios.split(':').map(r => parseInt(r.trim()) || 0);
                          const totalRatio = ratios.reduce((sum, ratio) => sum + ratio, 0);
                          return `${totalRatio} pieces (preview)`;
                        } else {
                          return '0 pieces';
                        }
                      })()}
                    </Badge>
                    <div className="text-xs text-gray-500 mt-1">
                      <p>Ratios: {article.sizeRatios || 'Not set'}</p>
                      <p>Template: {(() => {
                        const template = availableTemplates.find(t => t.id === article.selectedTemplateId);
                        return template ? template.templateCode : 'Not selected';
                      })()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  };

  const renderStep2 = () => {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Step Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-8 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 backdrop-blur rounded-xl p-3">
              <CubeIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Step 2: Fabric & Cutting Setup</h2>
              <p className="text-orange-100 text-lg">Configure your fabric rolls for batch cutting</p>
            </div>
          </div>
          
          {/* Progress Indicators */}
          <div className="flex items-center gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
              <span className="text-sm font-medium">Articles: {formData.articles.length}</span>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
              <span className="text-sm font-medium">Fabric Rolls: {formData.fabricRolls.length}</span>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
              <span className="text-sm font-medium">Total Layers: {formData.batchCuttingInfo.totalLayers}</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Cutting Configuration */}
          <div className="space-y-6">
            <Card className="p-6 border-l-4 border-l-blue-500 bg-blue-50/30">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">📏</span>
                <h3 className="text-xl font-bold text-gray-900">Cutting Specifications</h3>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Layer Length (meters) *
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.batchCuttingInfo.layerLength}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      batchCuttingInfo: {
                        ...prev.batchCuttingInfo,
                        layerLength: parseFloat(e.target.value) || 0
                      }
                    }))}
                    placeholder="4.7"
                    className="text-lg font-semibold"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    💡 Standard cutting table length (usually 4.5 - 5.0 meters)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cutting Efficiency (%)
                  </label>
                  <Input
                    type="number"
                    value={formData.batchCuttingInfo.cuttingEfficiency}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      batchCuttingInfo: {
                        ...prev.batchCuttingInfo,
                        cuttingEfficiency: parseInt(e.target.value) || 95
                      }
                    }))}
                    placeholder="95"
                    className="text-lg font-semibold"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    ⚡ Fabric utilization efficiency (recommended: 90-98%)
                  </p>
                </div>

                {/* Total Layers Display */}
                <div className="bg-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-blue-900">Total Fabric Layers:</span>
                    <div className="text-3xl font-bold text-blue-600">
                      {formData.batchCuttingInfo.totalLayers}
                    </div>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    ✨ Automatically calculated from your fabric rolls
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Fabric Roll Management */}
          <div className="space-y-6">
            <Card className="p-6 border-l-4 border-l-green-500 bg-green-50/30">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">🧵</span>
                <h3 className="text-xl font-bold text-gray-900">Add Fabric Roll</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number *</label>
                    <Input
                      placeholder="R001, F-123, etc."
                      value={newRoll.rollNumber}
                      onChange={(e) => {
                        setNewRoll(prev => ({ ...prev, rollNumber: e.target.value }));
                        if (rollErrors.length > 0) setRollErrors([]);
                      }}
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fabric Color *</label>
                    <Input
                      placeholder="Red, Blue, Navy..."
                      value={newRoll.color}
                      onChange={(e) => {
                        setNewRoll(prev => ({ ...prev, color: e.target.value }));
                        if (rollErrors.length > 0) setRollErrors([]);
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg) *</label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="15.5"
                      value={newRoll.weight}
                      onChange={(e) => {
                        setNewRoll(prev => ({ ...prev, weight: e.target.value }));
                        if (rollErrors.length > 0) setRollErrors([]);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Layers Count *</label>
                    <Input
                      type="number"
                      placeholder="50"
                      value={newRoll.layerCount}
                      onChange={(e) => {
                        setNewRoll(prev => ({ ...prev, layerCount: e.target.value }));
                        if (rollErrors.length > 0) setRollErrors([]);
                      }}
                    />
                  </div>
                </div>

                <Button 
                  onClick={addFabricRoll}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 py-3 font-semibold"
                  size="lg"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add This Roll
                </Button>

                {/* Roll Validation Errors */}
                {rollErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-red-500">⚠️</span>
                      <span className="font-semibold text-red-800">Please fix these errors:</span>
                    </div>
                    <ul className="text-sm text-red-700 space-y-1">
                      {rollErrors.map((error, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-400">•</span>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>

            {/* Enhanced Fabric Rolls List */}
            {formData.fabricRolls.length > 0 && (
          <Card className="p-6 border-l-4 border-l-purple-500 bg-purple-50/30">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">📦</span>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Fabric Rolls Ready for Cutting ({formData.fabricRolls.length})
                </h3>
                <p className="text-purple-700">Total layers: {formData.batchCuttingInfo.totalLayers}</p>
              </div>
            </div>

            <div className="grid gap-4">
              {formData.fabricRolls.map((roll, index) => (
                <div key={roll.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold text-gray-600">
                          {index + 1}
                        </div>
                        <Badge variant="secondary" className="font-mono text-lg px-3 py-1">
                          {roll.rollNumber}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm" 
                          style={{ backgroundColor: roll.color.toLowerCase() }}
                        ></div>
                        <span className="font-semibold text-gray-900">{roll.color}</span>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-x-6">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                          {roll.weight}kg
                        </span>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                          <strong>{roll.layerCount}</strong> layers
                        </span>
                        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium">
                          {roll.layerLength}m each
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFabricRoll(roll.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <XMarkIcon className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Fabric Rolls Error */}
        {errors.fabricRolls && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-red-500">⚠️</span>
              <p className="text-red-700 font-medium">{errors.fabricRolls}</p>
            </div>
          </div>
        )}

        {/* Size Breakdown for Articles */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-green-100 p-2 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Article Size Breakdown</h3>
              <p className="text-sm text-gray-500">Different cut ratios for each article type</p>
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
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900">
                  {currentArticle.articleNumber || `Article ${currentArticleIndex + 1}`}
                </h4>
                <p className="text-sm text-blue-700">{currentArticle.style}</p>
              </div>
              <div className="text-right text-sm">
                <p className="text-blue-800">
                  <strong>Sizes:</strong> {currentArticle.sizeNames || 'Not configured'}
                </p>
                <p className="text-blue-600">
                  <strong>Ratios:</strong> {currentArticle.sizeRatios || 'Not configured'}
                </p>
                {currentArticle.sizeNames && currentArticle.sizeRatios && (
                  <Button
                    onClick={() => generateSizesFromConfig(currentArticleIndex)}
                    className="mt-2 bg-blue-600 hover:bg-blue-700 text-xs px-2 py-1"
                  >
                    Generate Sizes
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Instructions for size generation */}
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-blue-900 mb-2">📋 How to Add Sizes</h4>
            <p className="text-sm text-blue-800 mb-2">
              Sizes are automatically generated from your Step 1 configuration using the selected template's pricing.
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Same rate & SMV</strong> for all sizes (from template)</li>
              <li>• <strong>Different quantities</strong> based on your ratios</li>
              <li>• Click "Generate Sizes" to create from your size names and ratios</li>
            </ul>
            {errors.sizeGeneration && (
              <p className="text-red-500 text-sm mt-2">{errors.sizeGeneration}</p>
            )}
          </div>

          {/* Current Article Sizes */}
          {currentArticle.sizes.length > 0 && (
            <div className="space-y-4 mb-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Article Sizes ({currentArticle.sizes.length})</h4>
                {(() => {
                  const template = availableTemplates.find(t => t.id === currentArticle.selectedTemplateId);
                  return template ? (
                    <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded">
                      Template: <span className="font-medium text-blue-700">Rs. {template.totalPricePerPiece}/pc</span> | 
                      <span className="font-medium text-blue-700"> {template.totalSmv}min SMV</span>
                    </div>
                  ) : null;
                })()}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentArticle.sizes.map((size, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-lg font-mono">{size.size}</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeSize(index)}
                        className="text-red-600 hover:text-red-700 text-xs px-2 py-1"
                      >
                        Remove
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Quantity:</span>
                        <span className="font-semibold text-gray-900">{size.quantity} pieces</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Rate:</span>
                        <span className="font-medium text-gray-900">Rs. {size.rate}/pc</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">SMV:</span>
                        <span className="font-medium text-gray-900">{size.smv} min/pc</span>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Total Value:</span>
                          <span className="font-bold text-green-600">Rs. {(size.quantity * size.rate).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Article Total Summary */}
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-green-700">Article Total:</span>
                  <div className="text-right">
                    <div className="font-semibold text-green-900">
                      {currentArticle.sizes.reduce((sum, size) => sum + size.quantity, 0)} pieces
                    </div>
                    <div className="font-bold text-green-600">
                      Rs. {currentArticle.sizes.reduce((sum, size) => sum + (size.quantity * size.rate), 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {errors[`article_${currentArticleIndex}_sizes`] && (
            <p className="text-red-500 text-sm">{errors[`article_${currentArticleIndex}_sizes`]}</p>
          )}
        </Card>

        {/* Multi-Article Batch Summary */}
        <Card className="p-6">
          <h4 className="font-medium text-gray-900 mb-4">Multi-Article Batch Summary</h4>
          <div className="bg-yellow-50 p-4 rounded-lg mb-4">
            <h5 className="font-medium text-yellow-900 mb-2">🔄 Simultaneous Cutting Process</h5>
            <p className="text-sm text-yellow-800 mb-3">
              All articles will be cut together using {formData.batchCuttingInfo.totalLayers} total layers at {formData.batchCuttingInfo.layerLength}m length.
              Different cut ratios will be applied based on article specifications.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-yellow-700">Articles:</span>
                <span className="font-semibold text-yellow-900 ml-1">{formData.articles.length}</span>
              </div>
              <div>
                <span className="text-yellow-700">Fabric Rolls:</span>
                <span className="font-semibold text-yellow-900 ml-1">{formData.fabricRolls.length}</span>
              </div>
              <div>
                <span className="text-yellow-700">Total Layers:</span>
                <span className="font-semibold text-yellow-900 ml-1">{formData.batchCuttingInfo.totalLayers}</span>
              </div>
              <div>
                <span className="text-yellow-700">Total Pieces:</span>
                <span className="font-semibold text-yellow-900 ml-1">{getTotalPieces()}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {formData.articles.map((article) => (
              <div key={article.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h5 className="font-medium text-gray-900 flex items-center space-x-2">
                      <span>{article.articleNumber}</span>
                      <Badge variant="outline" size="sm">
                        Article
                      </Badge>
                    </h5>
                    <p className="text-sm text-gray-600">{article.style}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={article.priority === 'urgent' ? 'danger' : 
                                  article.priority === 'high' ? 'warning' : 'secondary'}>
                      {article.priority}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      Template: {(() => {
                        const template = availableTemplates.find(t => t.id === article.selectedTemplateId);
                        return template ? template.templateCode : 'Not set';
                      })()}
                    </p>
                  </div>
                </div>
                
                {article.sizes.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
                    {article.sizes.map((size, sizeIndex) => (
                      <div key={sizeIndex} className="bg-gray-50 px-2 py-1 rounded">
                        <span className="font-medium">{size.size}:</span> {size.quantity}pcs
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-red-500 italic mb-3">No sizes added</div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 border-t pt-2">
                  <div>
                    <span>Article Total: </span>
                    <span className="font-medium text-gray-900">
                      {article.sizes.reduce((sum, size) => sum + size.quantity, 0)} pieces
                    </span>
                  </div>
                  <div>
                    <span>Article Value: </span>
                    <span className="font-medium text-gray-900">
                      Rs. {article.sizes.reduce((sum, size) => sum + (size.quantity * size.rate), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-2 gap-4 text-lg font-semibold">
              <div className="text-right">
                <span className="text-gray-600">Batch Total:</span>
                <span className="text-gray-900 ml-2">{getTotalPieces()} pieces</span>
              </div>
              <div className="text-left">
                <span className="text-gray-600">Batch Value:</span>
                <span className="text-gray-900 ml-2">Rs. {getTotalValue().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Card>
          </div>
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Step Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-8 shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur rounded-xl p-3">
            <CheckCircleIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Step 3: Final Review & Confirmation</h2>
            <p className="text-purple-100 text-lg">Review all settings and complete batch setup</p>
          </div>
        </div>
        
        {/* Progress Indicators */}
        <div className="flex items-center gap-4 mt-6">
          <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
            <span className="text-sm font-medium">Batch: {formData.bundleNumber || 'Not set'}</span>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
            <span className="text-sm font-medium">Articles: {formData.articles.length}</span>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
            <span className="text-sm font-medium">Total Pieces: {getTotalPieces()}</span>
          </div>
        </div>
      </div>

      {/* Visual Infographic Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Production Overview Infographic */}
        <Card className="p-6 border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">📊</span>
            <h3 className="text-xl font-bold text-gray-900">Production Overview</h3>
          </div>

          {/* Key Metrics Circles */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-3">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <div className="text-white text-center">
                    <div className="text-2xl font-bold">{getTotalPieces()}</div>
                    <div className="text-xs">PIECES</div>
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-700">Total Production</p>
            </div>
            
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-3">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <div className="text-white text-center">
                    <div className="text-lg font-bold">Rs.{Math.round(getTotalValue())}</div>
                    <div className="text-xs">VALUE</div>
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-700">Batch Value</p>
            </div>
          </div>

          {/* Production Flow */}
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold">1</span>
                </div>
                <span className="font-medium text-gray-700">Articles Setup</span>
              </div>
              <Badge variant="success">{formData.articles.length} Articles</Badge>
            </div>
            
            <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <span className="font-medium text-gray-700">Fabric Cutting</span>
              </div>
              <Badge variant="secondary">{formData.batchCuttingInfo.totalLayers} Layers</Badge>
            </div>
            
            <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <span className="font-medium text-gray-700">Sewing Operations</span>
              </div>
              <Badge variant="warning">
                {formData.articles.reduce((total, article) => {
                  const template = availableTemplates.find(t => t.id === article.selectedTemplateId);
                  return total + (template?.operations.length || 0);
                }, 0)} Operations
              </Badge>
            </div>
          </div>
        </Card>

        {/* Right: Article Distribution Infographic */}
        <Card className="p-6 border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🎯</span>
            <h3 className="text-xl font-bold text-gray-900">Article Breakdown</h3>
          </div>

          <div className="space-y-4">
            {formData.articles.map((article, index) => {
              const template = availableTemplates.find(t => t.id === article.selectedTemplateId);
              const articlePieces = article.sizes.reduce((sum, size) => sum + size.quantity, 0);
              const articleValue = article.sizes.reduce((sum, size) => sum + (size.quantity * size.rate), 0);
              const percentage = getTotalPieces() > 0 ? Math.round((articlePieces / getTotalPieces()) * 100) : 0;
              
              return (
                <div key={article.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index % 4 === 0 ? 'bg-blue-500' : 
                        index % 4 === 1 ? 'bg-green-500' :
                        index % 4 === 2 ? 'bg-orange-500' : 'bg-purple-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{article.articleNumber}</p>
                        <p className="text-sm text-gray-600">{article.style}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-sm">
                      {percentage}%
                    </Badge>
                  </div>
                  
                  {/* Progress bar showing article's share */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div 
                      className={`h-2 rounded-full ${
                        index % 4 === 0 ? 'bg-blue-500' : 
                        index % 4 === 1 ? 'bg-green-500' :
                        index % 4 === 2 ? 'bg-orange-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-gray-900">{articlePieces}</div>
                      <div className="text-gray-600">Pieces</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-gray-900">{template?.operations.length || 0}</div>
                      <div className="text-gray-600">Operations</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-gray-900">Rs.{Math.round(articleValue)}</div>
                      <div className="text-gray-600">Value</div>
                    </div>
                  </div>
                  
                  {/* Size breakdown mini chart */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex flex-wrap gap-1">
                      {article.sizes.map((size, sizeIndex) => (
                        <div key={sizeIndex} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {size.size}: {size.quantity}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Fabric & Cutting Infographic */}
      <Card className="p-6 border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🧵</span>
          <h3 className="text-xl font-bold text-gray-900">Fabric & Cutting Layout</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Fabric Rolls Visual */}
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg transform rotate-45">
                <div className="text-white text-center transform -rotate-45">
                  <div className="text-lg font-bold">{formData.fabricRolls.length}</div>
                  <div className="text-xs">ROLLS</div>
                </div>
              </div>
            </div>
            <p className="font-medium text-gray-700">Fabric Rolls</p>
            <div className="mt-2 space-y-1">
              {formData.fabricRolls.slice(0, 3).map((roll) => (
                <div key={roll.id} className="flex items-center justify-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full border border-gray-300" 
                    style={{ backgroundColor: roll.color.toLowerCase() }}
                  ></div>
                  <span className="text-xs text-gray-600">{roll.rollNumber}</span>
                </div>
              ))}
              {formData.fabricRolls.length > 3 && (
                <div className="text-xs text-gray-500">+{formData.fabricRolls.length - 3} more</div>
              )}
            </div>
          </div>

          {/* Cutting Layout */}
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <div className="text-white text-center">
                  <div className="text-lg font-bold">{formData.batchCuttingInfo.totalLayers}</div>
                  <div className="text-xs">LAYERS</div>
                </div>
              </div>
            </div>
            <p className="font-medium text-gray-700">Total Layers</p>
            <div className="mt-2 space-y-1 text-xs text-gray-600">
              <p>{formData.batchCuttingInfo.layerLength}m length</p>
              <p>{formData.batchCuttingInfo.cuttingEfficiency}% efficiency</p>
            </div>
          </div>

          {/* Production Output */}
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                <div className="text-white text-center">
                  <div className="text-lg font-bold">{getTotalPieces()}</div>
                  <div className="text-xs">OUTPUT</div>
                </div>
              </div>
            </div>
            <p className="font-medium text-gray-700">Total Pieces</p>
            <div className="mt-2 text-xs text-gray-600">
              <p>Across {formData.articles.length} articles</p>
              <p>Rs. {getTotalValue().toFixed(0)} value</p>
            </div>
          </div>
        </div>

        {/* Cutting Process Flow */}
        <div className="mt-6 pt-6 border-t border-orange-200">
          <h4 className="font-medium text-gray-700 mb-3 text-center">Batch Cutting Process</h4>
          <div className="flex items-center justify-center space-x-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-xs font-bold">1</span>
              </div>
              <span>Layer Setup</span>
            </div>
            <div className="text-gray-400">→</div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xs font-bold">2</span>
              </div>
              <span>Multi-Article Cut</span>
            </div>
            <div className="text-gray-400">→</div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xs font-bold">3</span>
              </div>
              <span>Bundle Ready</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Final Ready-to-Go Summary */}
      <Card className="p-6 bg-gradient-to-r from-green-100 to-blue-100 border border-green-200">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-4xl">🚀</span>
            <h3 className="text-2xl font-bold text-gray-900">Batch Ready for Production!</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{formData.bundleNumber}</div>
              <div className="text-sm text-gray-600">Batch Number</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-green-600">{getTotalPieces()}</div>
              <div className="text-sm text-gray-600">Total Pieces</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-orange-600">{formData.articles.length}</div>
              <div className="text-sm text-gray-600">Articles</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">Rs. {Math.round(getTotalValue())}</div>
              <div className="text-sm text-gray-600">Batch Value</div>
            </div>
          </div>
          
          <p className="text-gray-700 mb-4">
            Your multi-article batch is configured and ready to proceed to cutting operations. 
            All articles, sizes, templates, and fabric rolls have been validated.
          </p>
          
          <div className="inline-flex items-center gap-2 bg-green-200 text-green-800 px-4 py-2 rounded-full">
            <CheckCircleIcon className="w-5 h-5" />
            <span className="font-medium">All systems validated - Ready to proceed!</span>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 md:p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Mobile-Optimized Progress Indicator */}
        <div className="sticky top-0 z-20 bg-white shadow-sm border-b border-gray-200 px-4 py-3 mb-4">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full transition-all ${
                    step === currentStep 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : step < currentStep 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step < currentStep ? (
                      <CheckCircleIcon className="h-4 w-4 md:h-5 md:w-5" />
                    ) : (
                      <span className="font-bold text-sm md:text-base">{step}</span>
                    )}
                  </div>
                  <div className="ml-2 hidden sm:block">
                    <p className={`text-xs font-medium ${
                      step === currentStep ? 'text-blue-600' : 
                      step < currentStep ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step === 1 ? 'Info' : step === 2 ? 'Fabric' : 'Review'}
                    </p>
                  </div>
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-1 mx-2 md:mx-4 rounded-full transition-all ${
                    step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content - Mobile Optimized */}
        <div className="px-4 md:px-6 pb-20">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* Touch-Friendly Sticky Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              {currentStep > 1 && (
                <Button 
                  variant="outline" 
                  onClick={handleBack}
                  className="min-h-[48px] px-6 text-base font-medium"
                >
                  ← Back
                </Button>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={onCancel}
                className="min-h-[48px] px-6 text-base font-medium border-red-200 text-red-600 hover:bg-red-50"
              >
                Cancel
              </Button>
          
              {currentStep < 3 ? (
                <Button 
                  onClick={handleNext}
                  className="min-h-[48px] px-8 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Next →
                </Button>
              ) : (
                <Button 
                  onClick={handleComplete} 
                  disabled={isLoading}
                  className="min-h-[48px] px-8 text-base font-medium bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400"
                >
                  {isLoading ? 'Creating...' : '✓ Complete'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};