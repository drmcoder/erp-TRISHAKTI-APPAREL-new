import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { 
  CogIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  BanknotesIcon,
  Squares2X2Icon,
  PlayIcon
} from '@heroicons/react/24/outline';
import type { SewingTemplate } from '@/shared/types/sewing-template-types';
import type { BundleSize } from '@/types/entities';

interface ArticleInfo {
  id: string;
  articleNumber: string;
  style: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  sizes: BundleSize[];
  sizeNames: string;
  sizeRatios: string;
  selectedTemplateId: string;
  template?: SewingTemplate;
}

interface FabricRoll {
  id: string;
  rollNumber: string;
  color: string;
  weight: number;
  layerCount: number;
  layerLength: number;
  cuttingComplete: boolean;
}

interface WIPEntryData {
  articles: ArticleInfo[];
  fabricRolls: FabricRoll[];
  batchCuttingInfo: {
    layerLength: number;
    totalLayers: number;
    cuttingEfficiency: number;
  };
  bundleNumber: string;
}

interface BundleWorkOperationsProps {
  wipData: WIPEntryData;
  availableTemplates: SewingTemplate[];
  onStartProduction: () => void;
  onBack: () => void;
}

export const BundleWorkOperations: React.FC<BundleWorkOperationsProps> = ({
  wipData,
  availableTemplates,
  onStartProduction,
  onBack
}) => {
  const [selectedArticleIndex, setSelectedArticleIndex] = useState(0);
  const [showRatioMapping, setShowRatioMapping] = useState(false);

  // Enrich articles with template data
  const enrichedArticles = wipData.articles.map(article => ({
    ...article,
    template: availableTemplates.find(t => t.id === article.selectedTemplateId)
  }));

  const currentArticle = enrichedArticles[selectedArticleIndex];

  const getTotalPieces = () => {
    return wipData.articles.reduce((total, article) => {
      return total + article.sizes.reduce((sum, size) => sum + size.quantity, 0);
    }, 0);
  };

  const getTotalValue = () => {
    return wipData.articles.reduce((total, article) => {
      return total + article.sizes.reduce((sum, size) => sum + (size.quantity * size.rate), 0);
    }, 0);
  };

  const getTotalOperations = () => {
    return enrichedArticles.reduce((total, article) => {
      return total + (article.template?.operations.length || 0) * article.sizes.reduce((sum, size) => sum + size.quantity, 0);
    }, 0);
  };

  const getEstimatedProductionTime = () => {
    const totalMinutes = enrichedArticles.reduce((total, article) => {
      const articlePieces = article.sizes.reduce((sum, size) => sum + size.quantity, 0);
      const templateSmv = article.template?.totalSmv || 0;
      return total + (articlePieces * templateSmv);
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes, totalMinutes };
  };

  const renderRatioMapping = () => {
    if (!showRatioMapping) return null;

    return (
      <Card className="p-6 border-l-4 border-l-green-500 bg-green-50/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <h3 className="text-xl font-bold text-gray-900">Size Ratio Mapping</h3>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowRatioMapping(false)}
            className="text-sm"
          >
            Hide Mapping
          </Button>
        </div>

        <div className="space-y-6">
          {enrichedArticles.map((article, articleIndex) => (
            <div key={article.id} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{article.articleNumber}</h4>
                  <p className="text-sm text-gray-600">{article.style}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-gray-600">Configuration: <span className="font-mono">{article.sizeNames}</span></p>
                  <p className="text-gray-600">Ratios: <span className="font-mono">{article.sizeRatios}</span></p>
                </div>
              </div>

              {/* Size Mapping Visualization */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input Configuration */}
                <div>
                  <h5 className="font-medium text-gray-700 mb-3">Input Configuration</h5>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                      <span className="text-sm text-blue-700">Size Names:</span>
                      <span className="font-mono text-blue-900">{article.sizeNames}</span>
                    </div>
                    <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                      <span className="text-sm text-blue-700">Size Ratios:</span>
                      <span className="font-mono text-blue-900">{article.sizeRatios}</span>
                    </div>
                  </div>
                </div>

                {/* Actual Production Mapping */}
                <div>
                  <h5 className="font-medium text-gray-700 mb-3">Production Quantities</h5>
                  <div className="space-y-2">
                    {article.sizes.map((size, sizeIndex) => (
                      <div key={sizeIndex} className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="font-mono">{size.size}</Badge>
                          <span className="text-sm text-green-700">→</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-green-900">{size.quantity} pieces</span>
                          <div className="text-xs text-green-600">
                            Rs. {size.rate}/pc × {size.quantity} = Rs. {(size.rate * size.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Article Totals */}
              <div className="mt-4 pt-4 border-t bg-gray-50 rounded-lg p-3">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">
                      {article.sizes.reduce((sum, size) => sum + size.quantity, 0)}
                    </div>
                    <div className="text-gray-600">Total Pieces</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">
                      Rs. {article.sizes.reduce((sum, size) => sum + (size.quantity * size.rate), 0).toFixed(2)}
                    </div>
                    <div className="text-gray-600">Article Value</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">
                      {article.template?.operations.length || 0} × {article.sizes.reduce((sum, size) => sum + size.quantity, 0)}
                    </div>
                    <div className="text-gray-600">Total Operations</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-8 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur rounded-xl p-3">
              <CogIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Bundle Work Operations</h1>
              <p className="text-indigo-100 text-lg">Batch: {wipData.bundleNumber}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{getTotalPieces()}</div>
            <div className="text-indigo-200">Total Pieces</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/20 backdrop-blur rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{wipData.articles.length}</div>
            <div className="text-indigo-200 text-sm">Articles</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{getTotalOperations()}</div>
            <div className="text-indigo-200 text-sm">Total Ops</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{getEstimatedProductionTime().hours}h {getEstimatedProductionTime().minutes}m</div>
            <div className="text-indigo-200 text-sm">Est. Time</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">Rs. {getTotalValue().toFixed(0)}</div>
            <div className="text-indigo-200 text-sm">Total Value</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={() => setShowRatioMapping(!showRatioMapping)}
          className="flex items-center gap-2"
        >
          <ChartBarIcon className="w-5 h-5" />
          {showRatioMapping ? 'Hide' : 'Show'} Ratio Mapping
        </Button>
        <Button 
          onClick={onStartProduction}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold"
        >
          <PlayIcon className="w-5 h-5 mr-2" />
          Start Production
        </Button>
      </div>

      {/* Ratio Mapping (Collapsible) */}
      {renderRatioMapping()}

      {/* Article Tabs */}
      {enrichedArticles.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {enrichedArticles.map((article, index) => (
            <button
              key={article.id}
              onClick={() => setSelectedArticleIndex(index)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                index === selectedArticleIndex
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {article.articleNumber}
              <span className="ml-2 text-xs opacity-75">
                ({article.sizes.reduce((sum, size) => sum + size.quantity, 0)} pcs)
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Selected Article Operations */}
      {currentArticle && currentArticle.template && (
        <Card className="p-6 border-l-4 border-l-blue-500 bg-blue-50/30">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚙️</span>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {currentArticle.articleNumber} - Sewing Operations
                </h3>
                <p className="text-blue-700">
                  Template: {currentArticle.template.templateName} ({currentArticle.template.templateCode})
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {currentArticle.template.operations.length} Operations
            </Badge>
          </div>

          {/* Operations List */}
          <div className="space-y-3">
            {currentArticle.template.operations.map((operation, index) => (
              <div key={operation.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold text-blue-600">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{operation.operationName}</h4>
                      <p className="text-sm text-gray-600">Machine: {operation.machineType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-1">
                      {operation.processingType}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="font-semibold text-gray-900 flex items-center justify-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      {operation.smvMinutes}min
                    </div>
                    <div className="text-gray-600">SMV/piece</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="font-semibold text-gray-900 flex items-center justify-center gap-1">
                      <BanknotesIcon className="w-4 h-4" />
                      Rs. {operation.pricePerPiece}
                    </div>
                    <div className="text-gray-600">Rate/piece</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="font-semibold text-gray-900 flex items-center justify-center gap-1">
                      <Squares2X2Icon className="w-4 h-4" />
                      {currentArticle.sizes.reduce((sum, size) => sum + size.quantity, 0)}
                    </div>
                    <div className="text-gray-600">Total pieces</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                    <div className="font-bold text-green-700">
                      Rs. {(operation.pricePerPiece * currentArticle.sizes.reduce((sum, size) => sum + size.quantity, 0)).toFixed(2)}
                    </div>
                    <div className="text-green-600 text-xs">Operation Value</div>
                  </div>
                </div>

                {/* Size Breakdown for this Operation */}
                <div className="mt-4 pt-4 border-t">
                  <h5 className="font-medium text-gray-700 mb-2">Size Breakdown:</h5>
                  <div className="flex flex-wrap gap-2">
                    {currentArticle.sizes.map((size, sizeIndex) => (
                      <div key={sizeIndex} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {size.size}: {size.quantity} pcs
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prerequisites */}
                {operation.prerequisites && operation.prerequisites.length > 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <strong>Prerequisites:</strong> Requires completion of operations: {operation.prerequisites.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Article Summary */}
          <div className="mt-6 p-4 bg-blue-100 rounded-xl border border-blue-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {currentArticle.sizes.reduce((sum, size) => sum + size.quantity, 0)}
                </div>
                <div className="text-blue-700 text-sm">Article Pieces</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {currentArticle.template.operations.length}
                </div>
                <div className="text-blue-700 text-sm">Operations</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {currentArticle.template.totalSmv * currentArticle.sizes.reduce((sum, size) => sum + size.quantity, 0)}min
                </div>
                <div className="text-blue-700 text-sm">Total Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  Rs. {(currentArticle.template.totalPricePerPiece * currentArticle.sizes.reduce((sum, size) => sum + size.quantity, 0)).toFixed(2)}
                </div>
                <div className="text-blue-700 text-sm">Article Value</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Fabric Information */}
      <Card className="p-6 border-l-4 border-l-orange-500 bg-orange-50/30">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🧵</span>
          <h3 className="text-xl font-bold text-gray-900">Fabric Roll Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wipData.fabricRolls.map((roll, index) => (
            <div key={roll.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="secondary" className="font-mono">{roll.rollNumber}</Badge>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300" 
                    style={{ backgroundColor: roll.color.toLowerCase() }}
                  ></div>
                  <span className="text-sm font-medium">{roll.color}</span>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Weight:</strong> {roll.weight}kg</p>
                <p><strong>Layers:</strong> {roll.layerCount}</p>
                <p><strong>Length:</strong> {roll.layerLength}m each</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-orange-100 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-semibold text-orange-900">{wipData.fabricRolls.length}</div>
              <div className="text-orange-700">Total Rolls</div>
            </div>
            <div>
              <div className="font-semibold text-orange-900">{wipData.batchCuttingInfo.totalLayers}</div>
              <div className="text-orange-700">Total Layers</div>
            </div>
            <div>
              <div className="font-semibold text-orange-900">{wipData.batchCuttingInfo.layerLength}m</div>
              <div className="text-orange-700">Layer Length</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          Back to WIP Entry
        </Button>
        <Button 
          onClick={onStartProduction}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold"
        >
          <PlayIcon className="w-5 h-5 mr-2" />
          Start Production
        </Button>
      </div>
    </div>
  );
};