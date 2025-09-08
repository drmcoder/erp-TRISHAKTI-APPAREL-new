// WIP Summary Preview Component (Step 3)
// Final preview and production formula calculation

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { useDeviceOptimization } from '../../hooks/useDeviceOptimization';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  ScissorsIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface Article {
  articleNumber: string;
  styleName: string;
  procedureDetails?: {
    operations: number;
    estimatedTime: number;
    estimatedCost: number;
  };
}

interface SummaryData {
  // Basic Info
  lotNumber: string;
  buyerName: string;
  
  // Articles
  articles: Article[];
  
  // Size Configuration
  sizeNames: string[];
  sizeRatios: number[];
  
  // Roll Information
  rollCount: number;
  fabricName: string;
  fabricWidth: string;
  urgencyLevel: string;
  
  // Order Info
  poNumber?: string;
  deliveryDate?: string;
}

interface WIPSummaryPreviewProps {
  data: SummaryData;
  onSave: () => void;
  onPrevious: () => void;
  currentLanguage?: 'en' | 'ne';
  isLoading?: boolean;
}

export const WIPSummaryPreview: React.FC<WIPSummaryPreviewProps> = ({
  data,
  onSave,
  onPrevious,
  currentLanguage = 'en',
  isLoading = false
}) => {
  const { isMobile, responsiveClasses } = useDeviceOptimization();

  // Text content for i18n
  const text = {
    en: {
      title: 'WIP Summary Preview',
      orderOverview: 'Order Overview',
      articleBreakdown: 'Article Breakdown',
      productionFormula: 'Production Formula',
      finalActions: 'Final Actions',
      lot: 'Lot',
      buyer: 'Buyer',
      articles: 'Articles',
      rolls: 'Rolls',
      sizes: 'Sizes',
      urgency: 'Urgency',
      procedure: 'Procedure',
      pieces: 'pieces',
      operations: 'ops',
      totalLayers: 'Total Layers',
      totalPieces: 'Total Pieces',
      estimatedTime: 'Estimated Time',
      estimatedCost: 'Estimated Cost',
      piecesPerLayer: 'pieces/layer',
      minutes: 'minutes',
      previous: 'Previous',
      save: 'Save WIP',
      cancel: 'Cancel'
    },
    ne: {
      title: 'WIP सारांश पूर्वावलोकन',
      orderOverview: 'अर्डर सिंहावलोकन',
      articleBreakdown: 'लेख विवरण',
      productionFormula: 'उत्पादन सूत्र',
      finalActions: 'अन्तिम कार्यहरू',
      lot: 'लट',
      buyer: 'खरीददार',
      articles: 'लेखहरू',
      rolls: 'रोलहरू',
      sizes: 'साइजहरू',
      urgency: 'जरुरी',
      procedure: 'प्रक्रिया',
      pieces: 'टुक्राहरू',
      operations: 'अपरेसनहरू',
      totalLayers: 'कुल तहहरू',
      totalPieces: 'कुल टुक्राहरू',
      estimatedTime: 'अनुमानित समय',
      estimatedCost: 'अनुमानित लागत',
      piecesPerLayer: 'टुक्राहरू/तह',
      minutes: 'मिनेटहरू',
      previous: 'अघिल्लो',
      save: 'WIP सुरक्षित गर्नुहोस्',
      cancel: 'रद्द गर्नुहोस्'
    }
  };

  const t = text[currentLanguage];

  const urgencyOptions = {
    low: { label: '🟢 Low', color: 'bg-green-100 text-green-800' },
    medium: { label: '🟡 Medium', color: 'bg-yellow-100 text-yellow-800' },
    high: { label: '🟠 High', color: 'bg-orange-100 text-orange-800' },
    urgent: { label: '🔴 Urgent', color: 'bg-red-100 text-red-800' }
  };

  // Production calculations
  const productionCalculations = useMemo(() => {
    const totalSizeRatio = data.sizeRatios.reduce((sum, ratio) => sum + ratio, 0);
    const piecesPerLayer = totalSizeRatio;
    const totalLayers = data.rollCount * 30; // Assuming 30 layers per roll average
    const totalPiecesPerArticle = totalLayers * piecesPerLayer;
    const totalPieces = totalPiecesPerArticle * data.articles.length;
    
    // Aggregate procedure details
    const totalOperations = data.articles.reduce((sum, article) => 
      sum + (article.procedureDetails?.operations || 5), 0
    );
    const avgTimePerPiece = data.articles.reduce((sum, article) => 
      sum + (article.procedureDetails?.estimatedTime || 45), 0
    ) / data.articles.length;
    const avgCostPerPiece = data.articles.reduce((sum, article) => 
      sum + (article.procedureDetails?.estimatedCost || 12.5), 0
    ) / data.articles.length;
    
    const totalEstimatedTime = totalPieces * (avgTimePerPiece / 60); // Convert to hours
    const totalEstimatedCost = totalPieces * avgCostPerPiece;

    return {
      piecesPerLayer,
      totalLayers,
      totalPiecesPerArticle,
      totalPieces,
      totalOperations,
      avgTimePerPiece,
      avgCostPerPiece,
      totalEstimatedTime,
      totalEstimatedCost
    };
  }, [data]);

  return (
    <div className={`${responsiveClasses.container} space-y-6`}>
      {/* Header Section */}
      <div className="text-center">
        <h1 className={`text-2xl font-bold ${responsiveClasses.fontSize} text-gray-900`}>
          📊 {t.title}
        </h1>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-center mt-4 space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold">
              ✓
            </div>
            <span className="text-sm text-green-600">Multi-Article</span>
          </div>
          <div className="h-px w-8 bg-gray-300"></div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold">
              ✓
            </div>
            <span className="text-sm text-green-600">Multi-Roll</span>
          </div>
          <div className="h-px w-8 bg-gray-300"></div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
              3
            </div>
            <span className="text-sm font-medium text-blue-600">Preview</span>
          </div>
        </div>
      </div>

      {/* Order Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardDocumentListIcon className="h-5 w-5" />
            {t.orderOverview}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
            <div>
              <div className="text-sm font-medium text-gray-700">{t.lot}:</div>
              <div className="text-lg font-bold text-blue-600">{data.lotNumber}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">{t.buyer}:</div>
              <div className="text-lg font-semibold">{data.buyerName}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">{t.articles}:</div>
              <div className="text-lg font-bold text-purple-600">{data.articles.length}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">{t.rolls}:</div>
              <div className="text-lg font-bold text-green-600">{data.rollCount}</div>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">{t.sizes}:</span>
              <div className="flex gap-1">
                {data.sizeNames.map((size, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {size}({data.sizeRatios[index]})
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">{t.urgency}:</span>
              <Badge 
                className={urgencyOptions[data.urgencyLevel as keyof typeof urgencyOptions]?.color || urgencyOptions.medium.color}
                variant="outline"
              >
                {urgencyOptions[data.urgencyLevel as keyof typeof urgencyOptions]?.label || urgencyOptions.medium.label}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Article Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScissorsIcon className="h-5 w-5" />
            {t.articleBreakdown}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.articles.map((article, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-lg text-gray-900">
                      {article.articleNumber} - {article.styleName}
                    </h4>
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  </div>
                  
                  {article.procedureDetails ? (
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">{t.procedure}:</span> {article.styleName} Template (
                      {article.procedureDetails.operations} {t.operations}, 
                      {article.procedureDetails.estimatedTime} {t.minutes}, 
                      ₹{article.procedureDetails.estimatedCost})
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{t.procedure}:</span> Standard Template (5 {t.operations}, 45 {t.minutes}, ₹12.50)
                    </div>
                  )}
                  
                  <div className="mt-2 text-sm text-blue-700">
                    <span className="font-medium">{t.sizes}:</span> {data.sizeNames.join('(')} = {productionCalculations.piecesPerLayer} {t.piecesPerLayer}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Production Formula */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CogIcon className="h-5 w-5" />
            {t.productionFormula}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-6`}>
            {/* Left Column - Calculations */}
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-sm font-medium text-gray-700 mb-2">{t.totalLayers}:</div>
                <div className="text-lg">
                  {data.rollCount} rolls × ~30 layers = <span className="font-bold text-blue-600">{productionCalculations.totalLayers} layers</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <div className="text-sm font-medium text-gray-700 mb-2">{t.totalPieces}:</div>
                <div className="text-lg">
                  {productionCalculations.totalLayers} layers × {productionCalculations.piecesPerLayer} {t.piecesPerLayer} × {data.articles.length} articles = 
                  <span className="font-bold text-purple-600"> {productionCalculations.totalPieces.toLocaleString()} {t.pieces}</span>
                </div>
              </div>
            </div>

            {/* Right Column - Estimates */}
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <ClockIcon className="h-4 w-4 text-orange-500" />
                  <div className="text-sm font-medium text-gray-700">{t.estimatedTime}:</div>
                </div>
                <div className="text-lg">
                  <span className="font-bold text-orange-600">{productionCalculations.totalEstimatedTime.toFixed(1)} hours</span>
                  <div className="text-sm text-gray-600">
                    (~{productionCalculations.avgTimePerPiece} {t.minutes} × {productionCalculations.totalPieces.toLocaleString()} {t.pieces})
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <CurrencyRupeeIcon className="h-4 w-4 text-green-500" />
                  <div className="text-sm font-medium text-gray-700">{t.estimatedCost}:</div>
                </div>
                <div className="text-lg">
                  <span className="font-bold text-green-600">₹{productionCalculations.totalEstimatedCost.toLocaleString()}</span>
                  <div className="text-sm text-gray-600">
                    (₹{productionCalculations.avgCostPerPiece} × {productionCalculations.totalPieces.toLocaleString()} {t.pieces})
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="mt-6 bg-white p-4 rounded-lg border-2 border-green-300">
            <div className="text-center">
              <h4 className="font-bold text-lg text-gray-900 mb-2">Production Summary</h4>
              <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4 text-sm`}>
                <div>
                  <div className="text-gray-600">Total Operations</div>
                  <div className="font-bold text-blue-600">{productionCalculations.totalOperations}</div>
                </div>
                <div>
                  <div className="text-gray-600">Per Article Pieces</div>
                  <div className="font-bold text-purple-600">{productionCalculations.totalPiecesPerArticle.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-600">Fabric Required</div>
                  <div className="font-bold text-green-600">{data.fabricName} ({data.fabricWidth})</div>
                </div>
                <div>
                  <div className="text-gray-600">Production Days</div>
                  <div className="font-bold text-orange-600">~{Math.ceil(productionCalculations.totalEstimatedTime / 8)} days</div>
                </div>
              </div>
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
          disabled={isLoading}
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {t.previous}
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" disabled={isLoading}>
            {t.cancel}
          </Button>
          <Button
            type="button"
            onClick={onSave}
            disabled={isLoading}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-4 w-4" />
                ✅ {t.save}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WIPSummaryPreview;