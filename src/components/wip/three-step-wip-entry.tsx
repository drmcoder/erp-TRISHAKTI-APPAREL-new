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
  const [newSize, setNewSize] = useState({ size: '', quantity: '', rate: '', smv: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const [newRoll, setNewRoll] = useState({ rollNumber: '', color: '', weight: '', layerCount: '' });

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
    
    if (!formData.bundleNumber.trim()) stepErrors.bundleNumber = 'Bundle number is required';
    
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
    
    // Clear existing sizes and generate new ones
    const newSizes = sizeNames.map((sizeName, index) => ({
      size: sizeName,
      quantity: parseInt(sizeRatios[index]) || 1,
      completed: 0,
      rate: 0, // Will be set manually later
      smv: 0 // Will be calculated when rate is set
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

  const addSize = () => {
    if (newSize.size && newSize.quantity && newSize.rate) {
      const rate = parseFloat(newSize.rate);
      const smv = newSize.smv ? parseFloat(newSize.smv) : rate * 1.9; // Auto-calculate if not provided
      
      const updatedArticles = formData.articles.map((article, index) => 
        index === currentArticleIndex 
          ? {
              ...article,
              sizes: [...article.sizes, {
                size: newSize.size,
                quantity: parseInt(newSize.quantity),
                completed: 0,
                rate: rate,
                smv: smv
              }]
            }
          : article
      );
      
      setFormData(prev => ({
        ...prev,
        articles: updatedArticles
      }));
      
      setNewSize({ size: '', quantity: '', rate: '', smv: '' });
    }
  };
  
  const updateSizeRate = (sizeIndex: number, rate: number) => {
    const autoSmv = rate * 1.9; // Auto-calculate SMV
    const updatedArticles = formData.articles.map((article, index) => 
      index === currentArticleIndex 
        ? {
            ...article,
            sizes: article.sizes.map((size, idx) => 
              idx === sizeIndex ? { ...size, rate, smv: autoSmv } : size
            )
          }
        : article
    );
    
    setFormData(prev => ({
      ...prev,
      articles: updatedArticles
    }));
  };
  
  const updateSizeSmv = (sizeIndex: number, smv: number) => {
    const updatedArticles = formData.articles.map((article, index) => 
      index === currentArticleIndex 
        ? {
            ...article,
            sizes: article.sizes.map((size, idx) => 
              idx === sizeIndex ? { ...size, smv } : size
            )
          }
        : article
    );
    
    setFormData(prev => ({
      ...prev,
      articles: updatedArticles
    }));
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
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Step 1: Multi-Article Information</h3>
                <p className="text-sm text-gray-500">Set up multiple articles for batch cutting</p>
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
              {formData.articles.map((article) => (
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
                    <Badge variant="outline">{article.sizes.length} sizes</Badge>
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
    const currentArticle = formData.articles[currentArticleIndex];
    
    return (
      <div className="space-y-6">
        {/* Batch Cutting Setup */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-orange-100 p-2 rounded-lg">
              <CubeIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Step 2: Fabric Rolls & Batch Cutting</h3>
              <p className="text-sm text-gray-500">Configure fabric rolls and layering for multi-article cutting</p>
            </div>
          </div>

          {/* Layer Configuration */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-blue-900 mb-3">Batch Cutting Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  type="number"
                  step="0.1"
                  label="Layer Length (meters)"
                  value={formData.batchCuttingInfo.layerLength}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    batchCuttingInfo: {
                      ...prev.batchCuttingInfo,
                      layerLength: parseFloat(e.target.value) || 0
                    }
                  }))}
                  placeholder="4.7"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Layers</label>
                <div className="text-2xl font-bold text-blue-600">{formData.batchCuttingInfo.totalLayers}</div>
                <p className="text-xs text-gray-500">Auto-calculated from rolls</p>
              </div>
              <div>
                <Input
                  type="number"
                  label="Overall Efficiency (%)"
                  value={formData.batchCuttingInfo.cuttingEfficiency}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    batchCuttingInfo: {
                      ...prev.batchCuttingInfo,
                      cuttingEfficiency: parseInt(e.target.value) || 95
                    }
                  }))}
                  placeholder="95"
                />
              </div>
            </div>
          </div>

          {/* Add Fabric Roll */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Add Fabric Roll</h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <Input
                placeholder="Roll Number (e.g., R001)"
                value={newRoll.rollNumber}
                onChange={(e) => setNewRoll(prev => ({ ...prev, rollNumber: e.target.value }))}
              />
              <Input
                placeholder="Color (e.g., Red, Green)"
                value={newRoll.color}
                onChange={(e) => setNewRoll(prev => ({ ...prev, color: e.target.value }))}
              />
              <Input
                type="number"
                step="0.1"
                placeholder="Weight (kg)"
                value={newRoll.weight}
                onChange={(e) => setNewRoll(prev => ({ ...prev, weight: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="Layer Count"
                value={newRoll.layerCount}
                onChange={(e) => setNewRoll(prev => ({ ...prev, layerCount: e.target.value }))}
              />
              <Button 
                onClick={addFabricRoll}
                disabled={!newRoll.rollNumber || !newRoll.color || !newRoll.weight || !newRoll.layerCount}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                Add Roll
              </Button>
            </div>
          </div>

          {/* Fabric Rolls List */}
          {formData.fabricRolls.length > 0 && (
            <div className="space-y-3 mb-6">
              <h4 className="font-medium text-gray-900">Fabric Rolls Ready for Cutting ({formData.fabricRolls.length})</h4>
              {formData.fabricRolls.map((roll) => (
                <div key={roll.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-6">
                    <Badge variant="secondary" className="font-mono">{roll.rollNumber}</Badge>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300" 
                        style={{ backgroundColor: roll.color.toLowerCase() }}
                      ></div>
                      <span className="text-sm font-medium">{roll.color}</span>
                    </div>
                    <span className="text-sm text-gray-600">{roll.weight}kg</span>
                    <span className="text-sm text-gray-600"><strong>{roll.layerCount}</strong> layers</span>
                    <span className="text-sm text-gray-600">{roll.layerLength}m each</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFabricRoll(roll.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}

          {errors.fabricRolls && (
            <p className="text-red-500 text-sm">{errors.fabricRolls}</p>
          )}
        </Card>

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
              {formData.articles.map((article) => (
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

          {/* Add Size Form */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-gray-900 mb-3">Add Individual Size (Optional)</h4>
            <p className="text-sm text-gray-500 mb-3">Use "Generate Sizes" above for automatic creation, or add individual sizes manually</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input
                placeholder="Size (e.g., M, L, XL)"
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
                onChange={(e) => {
                  const rate = e.target.value;
                  const autoSmv = rate ? (parseFloat(rate) * 1.9).toFixed(2) : '';
                  setNewSize(prev => ({ ...prev, rate, smv: autoSmv }));
                }}
              />
              <Input
                type="number"
                step="0.01"
                placeholder="SMV (auto-calculated)"
                value={newSize.smv}
                onChange={(e) => setNewSize(prev => ({ ...prev, smv: e.target.value }))}
              />
              <Button 
                onClick={addSize}
                disabled={!newSize.size || !newSize.quantity || !newSize.rate}
                className="w-full"
              >
                Add Size
              </Button>
            </div>
            {errors.sizeGeneration && (
              <p className="text-red-500 text-sm mt-2">{errors.sizeGeneration}</p>
            )}
          </div>

          {/* Current Article Sizes */}
          {currentArticle.sizes.length > 0 && (
            <div className="space-y-2 mb-4">
              <h4 className="font-medium text-gray-900">Article Sizes ({currentArticle.sizes.length})</h4>
              {currentArticle.sizes.map((size, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                    <div>
                      <Badge variant="secondary" className="font-mono">{size.size}</Badge>
                      <p className="text-xs text-gray-500 mt-1">Qty: {size.quantity}</p>
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-500 block">Rate (Rs.)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={size.rate}
                        onChange={(e) => updateSizeRate(index, parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-500 block">SMV (auto)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={size.smv || 0}
                        onChange={(e) => updateSizeSmv(index, parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Auto-calc"
                        title="Auto-calculated from rate × 1.9, but editable"
                      />
                    </div>
                    
                    <div className="text-center">
                      <div className="mb-2">
                        <p className="text-xs text-gray-500">Total Value</p>
                        <p className="text-sm font-medium text-gray-900">
                          Rs. {(size.quantity * size.rate).toFixed(2)}
                        </p>
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
                  </div>
                </div>
              ))}
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
                        {article.targetAgeGroup === 'adult' ? 'Adult' : 'Teen'}
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
          <p className="text-sm text-gray-500">Choose sewing template and finalize batch</p>
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

        {/* Templates Summary */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Assigned Templates Summary</h4>
          <div className="space-y-2">
            {formData.articles.map((article) => {
              const template = availableTemplates.find(t => t.id === article.selectedTemplateId);
              return (
                <div key={article.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{article.articleNumber}</p>
                    <p className="text-sm text-gray-500">{article.style}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium text-gray-900">
                      {template ? template.templateName : 'No template selected'}
                    </p>
                    <p className="text-gray-500">
                      {template ? `${template.operations.length} ops, ${template.totalSmv}min` : ''}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Final Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Batch Cutting Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h5 className="font-medium mb-2">Batch Details</h5>
              <p><span className="text-gray-600">Bundle Number:</span> <span className="font-medium">{formData.bundleNumber || 'Not set'}</span></p>
              <p><span className="text-gray-600">Articles:</span> <span className="font-medium">{formData.articles.length}</span></p>
              <p><span className="text-gray-600">Fabric Rolls:</span> <span className="font-medium">{formData.fabricRolls.length}</span></p>
              <p><span className="text-gray-600">Total Layers:</span> <span className="font-medium">{formData.batchCuttingInfo.totalLayers}</span></p>
            </div>
            <div>
              <h5 className="font-medium mb-2">Production Summary</h5>
              <p><span className="text-gray-600">Total Pieces:</span> <span className="font-medium">{getTotalPieces()}</span></p>
              <p><span className="text-gray-600">Total Value:</span> <span className="font-medium">Rs. {getTotalValue().toFixed(2)}</span></p>
              <p><span className="text-gray-600">Templates:</span> <span className="font-medium">{formData.articles.length} different templates assigned</span></p>
              <p><span className="text-gray-600">Layer Length:</span> <span className="font-medium">{formData.batchCuttingInfo.layerLength}m</span></p>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t">
            <h5 className="font-medium mb-2">Articles in Batch</h5>
            <div className="space-y-1">
              {formData.articles.map((article) => (
                <div key={article.id} className="flex items-center justify-between text-sm">
                  <span>
                    <strong>{article.articleNumber}</strong> ({article.targetAgeGroup})
                  </span>
                  <span>
                    {article.sizes.reduce((sum, size) => sum + size.quantity, 0)} pieces
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
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
              {isLoading ? 'Creating Batch...' : 'Complete Multi-Article WIP Entry'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};