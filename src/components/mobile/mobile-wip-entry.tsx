// Mobile-Optimized WIP Entry Form
// Touch-friendly interface with step-by-step wizard and large input fields

import React, { useState, useEffect } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  XMarkIcon,
  PhotoIcon,
  QrCodeIcon,
  ScissorsIcon
} from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

interface MobileWIPEntryProps {
  onSave: (wipData: any) => void;
  onCancel: () => void;
}

interface RollData {
  id: string;
  rollNumber: string;
  color: string;
  weight: number;
  layers: number;
  fabricType: string;
  supplier: string;
  qualityGrade: 'A+' | 'A' | 'B' | 'C';
}

interface ArticleData {
  id: string;
  articleNumber: string;
  articleName: string;
  garmentType: 'tshirt' | 'polo' | 'shirt' | 'pants';
  sizeRatios: {
    L: number;
    XL: number;
    '2XL': number;
    '3XL': number;
  };
}

const STEPS = [
  { id: 1, title: 'Basic Info', subtitle: 'Batch & lot details' },
  { id: 2, title: 'Articles', subtitle: 'Product specifications' },
  { id: 3, title: 'Rolls', subtitle: 'Fabric roll details' },
  { id: 4, title: 'Review', subtitle: 'Confirm & submit' }
];

const QUICK_RATIOS = [
  { name: 'Equal', ratios: { L: 1, XL: 1, '2XL': 1, '3XL': 1 } },
  { name: 'Standard', ratios: { L: 1, XL: 2, '2XL': 2, '3XL': 1 } },
  { name: 'Popular', ratios: { L: 1, XL: 3, '2XL': 3, '3XL': 1 } }
];

export const MobileWIPEntry: React.FC<MobileWIPEntryProps> = ({
  onSave,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    batchNumber: '',
    lotNumber: '',
    createdDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [rolls, setRolls] = useState<RollData[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Haptic feedback simulation
  const vibrate = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      vibrate();
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    vibrate();
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.batchNumber.trim()) {
        newErrors.batchNumber = 'Batch number required';
      }
      if (!formData.lotNumber.trim()) {
        newErrors.lotNumber = 'Lot number required';
      }
    } else if (currentStep === 2) {
      if (articles.length === 0) {
        newErrors.articles = 'At least one article required';
      }
    } else if (currentStep === 3) {
      if (rolls.length === 0) {
        newErrors.rolls = 'At least one roll required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addArticle = () => {
    vibrate();
    const newArticle: ArticleData = {
      id: `article_${Date.now()}`,
      articleNumber: '',
      articleName: '',
      garmentType: 'tshirt',
      sizeRatios: { L: 1, XL: 1, '2XL': 1, '3XL': 1 }
    };
    setArticles(prev => [...prev, newArticle]);
  };

  const updateArticle = (id: string, updates: Partial<ArticleData>) => {
    setArticles(prev => prev.map(article => 
      article.id === id ? { ...article, ...updates } : article
    ));
  };

  const removeArticle = (id: string) => {
    vibrate();
    setArticles(prev => prev.filter(article => article.id !== id));
  };

  const addRoll = () => {
    vibrate();
    const newRoll: RollData = {
      id: `roll_${Date.now()}`,
      rollNumber: '',
      color: '',
      weight: 0,
      layers: 0,
      fabricType: '',
      supplier: '',
      qualityGrade: 'A'
    };
    setRolls(prev => [...prev, newRoll]);
  };

  const updateRoll = (id: string, updates: Partial<RollData>) => {
    setRolls(prev => prev.map(roll => 
      roll.id === id ? { ...roll, ...updates } : roll
    ));
  };

  const removeRoll = (id: string) => {
    vibrate();
    setRolls(prev => prev.filter(roll => roll.id !== id));
  };

  const applyQuickRatio = (articleId: string, ratios: any) => {
    vibrate();
    updateArticle(articleId, { sizeRatios: ratios });
  };

  const handleSave = () => {
    if (validateCurrentStep()) {
      vibrate();
      onSave({
        ...formData,
        articles,
        rolls,
        totalGarments: calculateTotalGarments(),
        totalPieces: calculateTotalPieces()
      });
    }
  };

  const calculateTotalGarments = () => {
    return articles.reduce((total, article) => {
      const articleTotal = Object.values(article.sizeRatios).reduce((sum, ratio) => sum + ratio, 0);
      return total + (articleTotal * rolls.length);
    }, 0);
  };

  const calculateTotalPieces = () => {
    // Simplified calculation - in reality this would be more complex
    return calculateTotalGarments() * 5; // Assuming 5 pieces per garment on average
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <ScissorsIcon className="h-16 w-16 mx-auto text-blue-500 mb-4" />
              <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
              <p className="text-gray-600">Enter batch and lot details</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Batch Number *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, batchNumber: e.target.value }))}
                    className={cn(
                      "w-full px-4 py-4 text-lg border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors",
                      errors.batchNumber ? "border-red-300" : "border-gray-300"
                    )}
                    placeholder="e.g., BATCH-2024-001"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
                  >
                    <QrCodeIcon className="h-6 w-6" />
                  </button>
                </div>
                {errors.batchNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.batchNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lot Number *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.lotNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, lotNumber: e.target.value }))}
                    className={cn(
                      "w-full px-4 py-4 text-lg border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors",
                      errors.lotNumber ? "border-red-300" : "border-gray-300"
                    )}
                    placeholder="e.g., LOT-TSA-001"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
                  >
                    <QrCodeIcon className="h-6 w-6" />
                  </button>
                </div>
                {errors.lotNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.lotNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Created Date
                </label>
                <input
                  type="date"
                  value={formData.createdDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, createdDate: e.target.value }))}
                  className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Any additional notes..."
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Articles</h2>
                <p className="text-gray-600">Define your product specifications</p>
              </div>
              <button
                onClick={addArticle}
                className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-6 w-6" />
              </button>
            </div>

            {errors.articles && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-600 text-sm">{errors.articles}</p>
              </div>
            )}

            <div className="space-y-4">
              {articles.map((article, index) => (
                <div key={article.id} className="bg-white border-2 border-gray-200 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Article #{index + 1}</h3>
                    <button
                      onClick={() => removeArticle(article.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <input
                      type="text"
                      placeholder="Article Number (e.g., TSA-001)"
                      value={article.articleNumber}
                      onChange={(e) => updateArticle(article.id, { articleNumber: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    
                    <input
                      type="text"
                      placeholder="Article Name (e.g., Basic T-Shirt)"
                      value={article.articleName}
                      onChange={(e) => updateArticle(article.id, { articleName: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                    <select
                      value={article.garmentType}
                      onChange={(e) => updateArticle(article.id, { garmentType: e.target.value as any })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    >
                      <option value="tshirt">👕 T-Shirt</option>
                      <option value="polo">🏌️ Polo Shirt</option>
                      <option value="shirt">👔 Shirt</option>
                      <option value="pants">👖 Pants</option>
                    </select>
                  </div>

                  {/* Size Ratios */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Size Ratios
                    </label>
                    
                    {/* Quick Ratio Buttons */}
                    <div className="flex space-x-2 mb-3">
                      {QUICK_RATIOS.map((quickRatio) => (
                        <button
                          key={quickRatio.name}
                          onClick={() => applyQuickRatio(article.id, quickRatio.ratios)}
                          className="px-3 py-2 bg-gray-100 hover:bg-blue-100 text-sm font-medium rounded-lg transition-colors"
                        >
                          {quickRatio.name}
                        </button>
                      ))}
                    </div>

                    {/* Size Inputs */}
                    <div className="grid grid-cols-4 gap-2">
                      {Object.entries(article.sizeRatios).map(([size, ratio]) => (
                        <div key={size} className="text-center">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            {size}
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={ratio}
                            onChange={(e) => updateArticle(article.id, {
                              sizeRatios: {
                                ...article.sizeRatios,
                                [size]: parseInt(e.target.value) || 0
                              }
                            })}
                            className="w-full px-2 py-2 text-center border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {articles.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                  <p className="text-gray-500 mb-4">No articles added yet</p>
                  <button
                    onClick={addArticle}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="h-5 w-5 inline mr-2" />
                    Add First Article
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Rolls</h2>
                <p className="text-gray-600">Add fabric roll details</p>
              </div>
              <button
                onClick={addRoll}
                className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-6 w-6" />
              </button>
            </div>

            {errors.rolls && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-600 text-sm">{errors.rolls}</p>
              </div>
            )}

            <div className="space-y-4">
              {rolls.map((roll, index) => (
                <div key={roll.id} className="bg-white border-2 border-gray-200 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Roll #{index + 1}</h3>
                    <button
                      onClick={() => removeRoll(roll.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Roll Number"
                        value={roll.rollNumber}
                        onChange={(e) => updateRoll(roll.id, { rollNumber: e.target.value })}
                        className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Color"
                        value={roll.color}
                        onChange={(e) => updateRoll(roll.id, { color: e.target.value })}
                        className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Weight (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="21.5"
                          value={roll.weight || ''}
                          onChange={(e) => updateRoll(roll.id, { weight: parseFloat(e.target.value) || 0 })}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Layers</label>
                        <input
                          type="number"
                          placeholder="30"
                          value={roll.layers || ''}
                          onChange={(e) => updateRoll(roll.id, { layers: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="Fabric Type (e.g., Cotton 180GSM)"
                      value={roll.fabricType}
                      onChange={(e) => updateRoll(roll.id, { fabricType: e.target.value })}
                      className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Supplier"
                        value={roll.supplier}
                        onChange={(e) => updateRoll(roll.id, { supplier: e.target.value })}
                        className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <select
                        value={roll.qualityGrade}
                        onChange={(e) => updateRoll(roll.id, { qualityGrade: e.target.value as any })}
                        className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="A+">A+ Grade</option>
                        <option value="A">A Grade</option>
                        <option value="B">B Grade</option>
                        <option value="C">C Grade</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              {rolls.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                  <p className="text-gray-500 mb-4">No rolls added yet</p>
                  <button
                    onClick={addRoll}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="h-5 w-5 inline mr-2" />
                    Add First Roll
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircleIcon className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <h2 className="text-xl font-bold text-gray-900">Review & Submit</h2>
              <p className="text-gray-600">Confirm your WIP entry details</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-2xl text-center">
                <div className="text-2xl font-bold text-blue-600">{articles.length}</div>
                <div className="text-sm text-blue-800">Articles</div>
              </div>
              <div className="bg-green-50 p-4 rounded-2xl text-center">
                <div className="text-2xl font-bold text-green-600">{rolls.length}</div>
                <div className="text-sm text-green-800">Rolls</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-2xl text-center">
                <div className="text-2xl font-bold text-purple-600">{calculateTotalGarments()}</div>
                <div className="text-sm text-purple-800">Garments</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-2xl text-center">
                <div className="text-2xl font-bold text-orange-600">{calculateTotalPieces()}</div>
                <div className="text-sm text-orange-800">Total Pieces</div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
                <h3 className="font-semibold mb-2">Basic Info</h3>
                <p className="text-sm text-gray-600">Batch: {formData.batchNumber}</p>
                <p className="text-sm text-gray-600">Lot: {formData.lotNumber}</p>
                <p className="text-sm text-gray-600">Date: {formData.createdDate}</p>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
                <h3 className="font-semibold mb-2">Articles</h3>
                {articles.map((article, index) => (
                  <div key={article.id} className="text-sm text-gray-600 mb-1">
                    {index + 1}. {article.articleNumber} - {article.articleName} ({article.garmentType})
                  </div>
                ))}
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
                <h3 className="font-semibold mb-2">Rolls</h3>
                {rolls.map((roll, index) => (
                  <div key={roll.id} className="text-sm text-gray-600 mb-1">
                    {index + 1}. {roll.rollNumber} - {roll.color} ({roll.weight}kg, {roll.layers} layers)
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onCancel}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold">WIP Entry</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Progress Indicator */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Step {currentStep} of {STEPS.length}</span>
            <span className="text-sm text-gray-600">{Math.round((currentStep / STEPS.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            />
          </div>
          <div className="mt-2">
            <h2 className="font-semibold text-gray-900">{STEPS[currentStep - 1]?.title}</h2>
            <p className="text-sm text-gray-600">{STEPS[currentStep - 1]?.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-2xl font-semibold flex items-center justify-center space-x-2 hover:bg-gray-200 transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5" />
              <span>Previous</span>
            </button>
          )}
          
          {currentStep < STEPS.length ? (
            <button
              onClick={nextStep}
              className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-2xl font-semibold flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors shadow-lg"
            >
              <span>Next</span>
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="flex-1 bg-green-600 text-white py-4 px-6 rounded-2xl font-semibold flex items-center justify-center space-x-2 hover:bg-green-700 transition-colors shadow-lg"
            >
              <CheckCircleIcon className="h-5 w-5" />
              <span>Create WIP Entry</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileWIPEntry;