// Bundle Label Generator Component
// Generate and print bundle labels with barcodes and QR codes

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import {
  PrinterIcon,
  QrCodeIcon,
  ArrowDownTrayIcon,
  CogIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { barcodeService } from '../../services/core/barcode-service';
import type { BundleLabel, PrinterConfig } from '../../services/core/barcode-service';

interface BundleLabelGeneratorProps {
  bundleData?: {
    bundleId: string;
    bundleNumber: string;
    lotNumber: string;
    articleName: string;
    size: string;
    color: string;
    pieces: number;
    operation: string;
    cutBy: string;
    cutDate: Date;
    operatorAssigned?: string;
  };
  onLabelGenerated?: (label: BundleLabel) => void;
  className?: string;
}

export const BundleLabelGenerator: React.FC<BundleLabelGeneratorProps> = ({
  bundleData,
  onLabelGenerated,
  className = ''
}) => {
  const [label, setLabel] = useState<BundleLabel | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [printerConfig, setPrinterConfig] = useState<PrinterConfig>(barcodeService.getPrinterConfig());
  const [labelTemplate, setLabelTemplate] = useState<'thermal' | 'laser' | 'inkjet'>('thermal');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Form data for manual input
  const [formData, setFormData] = useState({
    bundleId: '',
    bundleNumber: '',
    lotNumber: '',
    articleName: '',
    size: '',
    color: '',
    pieces: 0,
    operation: '',
    cutBy: '',
    cutDate: new Date(),
    operatorAssigned: ''
  });

  // Initialize form data
  useEffect(() => {
    if (bundleData) {
      setFormData(bundleData);
      generateLabel(bundleData);
    }
  }, [bundleData]);

  // Generate bundle label
  const generateLabel = async (data?: typeof formData) => {
    try {
      setIsGenerating(true);
      setError('');
      
      const labelData = data || formData;
      
      if (!labelData.bundleId || !labelData.bundleNumber || !labelData.lotNumber) {
        throw new Error('Bundle ID, Bundle Number, and Lot Number are required');
      }

      const generatedLabel = await barcodeService.generateBundleLabel(labelData);
      setLabel(generatedLabel);
      setSuccess('Label generated successfully!');
      onLabelGenerated?.(generatedLabel);
      
    } catch (error) {
      console.error('Error generating label:', error);
      setError(error instanceof Error ? error.message : 'Error generating label');
    } finally {
      setIsGenerating(false);
    }
  };

  // Print label
  const printLabel = async () => {
    if (!label) return;

    try {
      setIsPrinting(true);
      setError('');
      
      await barcodeService.printLabel(label, printerConfig);
      setSuccess('Label printed successfully!');
      
    } catch (error) {
      console.error('Error printing label:', error);
      setError(error instanceof Error ? error.message : 'Error printing label');
    } finally {
      setIsPrinting(false);
    }
  };

  // Download label as image
  const downloadLabel = async () => {
    if (!label) return;

    try {
      await barcodeService.downloadLabelAsImage(label);
      setSuccess('Label downloaded successfully!');
    } catch (error) {
      console.error('Error downloading label:', error);
      setError(error instanceof Error ? error.message : 'Error downloading label');
    }
  };

  // Update printer configuration
  const updatePrinterConfig = (config: Partial<PrinterConfig>) => {
    const newConfig = { ...printerConfig, ...config };
    setPrinterConfig(newConfig);
    barcodeService.updatePrinterConfig(newConfig);
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSuccess(''); // Clear success message when form changes
  };

  // Clear messages after timeout
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const renderLabelPreview = () => {
    if (!label || !showPreview) return null;

    const previewHTML = barcodeService.generateLabelHTML(label, labelTemplate);

    return (
      <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-sm">Label Preview</h4>
          <div className="flex gap-2">
            <select
              value={labelTemplate}
              onChange={(e) => setLabelTemplate(e.target.value as any)}
              className="text-xs border border-gray-300 rounded px-2 py-1"
            >
              <option value="thermal">Thermal</option>
              <option value="laser">Laser</option>
              <option value="inkjet">Inkjet</option>
            </select>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowPreview(false)}
              className="h-6 w-6 p-0"
            >
              ✕
            </Button>
          </div>
        </div>
        <div 
          className="border border-gray-300 rounded bg-white transform scale-75 origin-top-left"
          style={{ width: '133%', height: 'auto' }}
          dangerouslySetInnerHTML={{ __html: previewHTML }}
        />
      </div>
    );
  };

  const renderPrinterSettings = () => {
    if (!showSettings) return null;

    return (
      <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-sm">Printer Settings</h4>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSettings(false)}
            className="h-6 w-6 p-0"
          >
            ✕
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Printer Name</label>
            <input
              type="text"
              value={printerConfig.printerName}
              onChange={(e) => updatePrinterConfig({ printerName: e.target.value })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Label Size</label>
            <select
              value={printerConfig.labelSize}
              onChange={(e) => updatePrinterConfig({ labelSize: e.target.value as any })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
            >
              <option value="small">Small (2"×1.5")</option>
              <option value="medium">Medium (4"×2.5")</option>
              <option value="large">Large (4"×3")</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">DPI</label>
            <select
              value={printerConfig.dpi}
              onChange={(e) => updatePrinterConfig({ dpi: parseInt(e.target.value) as any })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
            >
              <option value={203}>203 DPI</option>
              <option value={300}>300 DPI</option>
              <option value={600}>600 DPI</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Print Speed</label>
            <select
              value={printerConfig.printSpeed}
              onChange={(e) => updatePrinterConfig({ printSpeed: parseInt(e.target.value) })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
            >
              {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(speed => (
                <option key={speed} value={speed}>{speed} ips</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Darkness ({printerConfig.darknessSetting})</label>
            <input
              type="range"
              min="1"
              max="15"
              value={printerConfig.darknessSetting}
              onChange={(e) => updatePrinterConfig({ darknessSetting: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className={`max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCodeIcon className="h-5 w-5" />
          Bundle Label Generator
        </CardTitle>
        <p className="text-sm text-gray-600">
          Generate barcodes and QR codes for production bundles
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Bundle Information Form */}
        {!bundleData && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bundle ID*</label>
              <input
                type="text"
                value={formData.bundleId}
                onChange={(e) => handleInputChange('bundleId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="B001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bundle Number*</label>
              <input
                type="text"
                value={formData.bundleNumber}
                onChange={(e) => handleInputChange('bundleNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="LOT-2024-B001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lot Number*</label>
              <input
                type="text"
                value={formData.lotNumber}
                onChange={(e) => handleInputChange('lotNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="LOT-2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Article Name</label>
              <input
                type="text"
                value={formData.articleName}
                onChange={(e) => handleInputChange('articleName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Men's T-Shirt"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
              <input
                type="text"
                value={formData.size}
                onChange={(e) => handleInputChange('size', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="M"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pieces</label>
              <input
                type="number"
                value={formData.pieces}
                onChange={(e) => handleInputChange('pieces', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="50"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operation</label>
              <input
                type="text"
                value={formData.operation}
                onChange={(e) => handleInputChange('operation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Sewing"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cut By</label>
              <input
                type="text"
                value={formData.cutBy}
                onChange={(e) => handleInputChange('cutBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Operator Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operator Assigned</label>
              <input
                type="text"
                value={formData.operatorAssigned}
                onChange={(e) => handleInputChange('operatorAssigned', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional"
              />
            </div>
          </div>
        )}

        {/* Bundle Data Display (when passed as prop) */}
        {bundleData && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold mb-3">Bundle Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Bundle:</strong> {bundleData.bundleNumber}</div>
              <div><strong>Lot:</strong> {bundleData.lotNumber}</div>
              <div><strong>Article:</strong> {bundleData.articleName}</div>
              <div><strong>Operation:</strong> {bundleData.operation}</div>
              <div><strong>Size:</strong> <Badge variant="outline">{bundleData.size}</Badge></div>
              <div><strong>Color:</strong> <Badge variant="outline">{bundleData.color}</Badge></div>
              <div><strong>Pieces:</strong> {bundleData.pieces}</div>
              <div><strong>Cut by:</strong> {bundleData.cutBy}</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => generateLabel()}
            disabled={isGenerating}
            className="flex-1"
          >
            {isGenerating ? '⏳ Generating...' : '🏷️ Generate Label'}
          </Button>
          
          <Button
            onClick={() => setShowPreview(true)}
            variant="outline"
            disabled={!label}
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            Preview
          </Button>
          
          <Button
            onClick={() => setShowSettings(true)}
            variant="outline"
          >
            <CogIcon className="h-4 w-4 mr-1" />
            Settings
          </Button>
        </div>

        {/* Generated Label Info */}
        {label && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-green-800">✅ Label Generated</h4>
              <div className="flex gap-2">
                <Button
                  onClick={printLabel}
                  disabled={isPrinting}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isPrinting ? '⏳' : <PrinterIcon className="h-4 w-4 mr-1" />}
                  Print
                </Button>
                <Button
                  onClick={downloadLabel}
                  size="sm"
                  variant="outline"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Barcode:</strong> <code className="bg-white px-2 py-1 rounded text-xs">{label.barcode}</code></div>
              <div><strong>QR Code:</strong> {label.qrCode ? '✅ Generated' : '❌ Failed'}</div>
            </div>
            {label.qrCode && (
              <div className="mt-3 flex items-center gap-4">
                <img src={label.qrCode} alt="QR Code" className="w-16 h-16 border border-gray-300 rounded" />
                <div className="text-xs text-gray-600">
                  QR code contains complete bundle information including ID, lot number, article details, and production data.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="text-red-600">❌</span>
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Success Display */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span className="text-green-800 text-sm">{success}</span>
            </div>
          </div>
        )}

        {/* Printer Settings Panel */}
        {renderPrinterSettings()}

        {/* Label Preview Panel */}
        {renderLabelPreview()}

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-1">💡 Tips:</div>
            <ul className="text-xs space-y-1">
              <li>• Ensure all required fields are filled before generating</li>
              <li>• Use preview to check label layout before printing</li>
              <li>• Configure printer settings for optimal print quality</li>
              <li>• QR codes contain complete bundle information for scanning</li>
              <li>• Download labels as backup for reprinting if needed</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BundleLabelGenerator;