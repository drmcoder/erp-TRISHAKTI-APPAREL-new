// Barcode Scanner Component
// Integrated barcode scanning with camera and manual entry

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import {
  CameraIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  QrCodeIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { barcodeService } from '../../services/core/barcode-service';
import type { ScanResult } from '../../services/core/barcode-service';

interface BarcodeScannerProps {
  onScanSuccess: (result: ScanResult) => void;
  onClose?: () => void;
  allowManualEntry?: boolean;
  scanMode?: 'barcode' | 'qr' | 'both';
  title?: string;
  className?: string;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScanSuccess,
  onClose,
  allowManualEntry = true,
  scanMode = 'both',
  title = 'Scan Bundle',
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string>('');
  const [manualEntry, setManualEntry] = useState('');
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  // Check camera permission on mount
  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        setCameraPermission(permission.state as 'granted' | 'denied');
        
        permission.onchange = () => {
          setCameraPermission(permission.state as 'granted' | 'denied');
        };
      }
    } catch (error) {
      console.log('Permission API not supported');
      setCameraPermission('pending');
    }
  };

  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      setError('');
      setScanResult(null);
      setIsScanning(true);

      await barcodeService.startBarcodeScanning(
        videoRef.current,
        handleScanResult,
        {
          facingMode,
          width: 1280,
          height: 720
        }
      );

      setCameraPermission('granted');
    } catch (error) {
      console.error('Error starting scanner:', error);
      setError('Unable to access camera. Please check permissions.');
      setCameraPermission('denied');
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    try {
      await barcodeService.stopScanning();
      setIsScanning(false);
    } catch (error) {
      console.error('Error stopping scanner:', error);
    }
  };

  const handleScanResult = (result: ScanResult) => {
    setScanResult(result);
    
    if (result.success) {
      // Automatically call success callback after a brief delay to show result
      setTimeout(() => {
        onScanSuccess(result);
      }, 1500);
    } else if (result.error) {
      setError(result.error);
    }
  };

  const handleManualEntry = () => {
    if (!manualEntry.trim()) {
      setError('Please enter a barcode');
      return;
    }

    const result = barcodeService.parseBarcodeManually(manualEntry.trim());
    setScanResult(result);
    
    if (result.success) {
      setTimeout(() => {
        onScanSuccess(result);
      }, 1000);
    } else {
      setError(result.error || 'Invalid barcode format');
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    if (isScanning) {
      stopScanning();
      setTimeout(startScanning, 500);
    }
  };

  const renderScanResult = () => {
    if (!scanResult) return null;

    return (
      <div className={`p-4 rounded-lg border-2 ${
        scanResult.success 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          {scanResult.success ? (
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
          ) : (
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
          )}
          <span className={`font-semibold ${
            scanResult.success ? 'text-green-800' : 'text-red-800'
          }`}>
            {scanResult.success ? 'Scan Successful!' : 'Scan Failed'}
          </span>
        </div>
        
        {scanResult.success && scanResult.data && (
          <div className="space-y-2 text-sm">
            <div><strong>Bundle ID:</strong> {scanResult.data.bundleId}</div>
            <div><strong>Bundle Number:</strong> {scanResult.data.bundleNumber}</div>
            <div><strong>Lot Number:</strong> {scanResult.data.lotNumber}</div>
            <div><strong>Type:</strong> <Badge variant="secondary" outline>{scanResult.data.type}</Badge></div>
            {scanResult.data.additionalInfo?.manualEntry && (
              <div className="text-blue-600">✏️ Manual Entry</div>
            )}
          </div>
        )}
        
        {scanResult.error && (
          <div className="text-red-600 text-sm">{scanResult.error}</div>
        )}
      </div>
    );
  };

  return (
    <Card className={`max-w-md mx-auto ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <QrCodeIcon className="h-5 w-5" />
            {title}
          </CardTitle>
          {onClose && (
            <Button
              variant="secondary" outline
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <XMarkIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="text-sm text-gray-600">
          {scanMode === 'both' && 'Scan barcode or QR code'}
          {scanMode === 'barcode' && 'Scan barcode only'}
          {scanMode === 'qr' && 'Scan QR code only'}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Camera Scanner */}
        <div className="bg-gray-900 rounded-lg overflow-hidden relative">
          <video
            ref={videoRef}
            className="w-full h-64 object-cover"
            playsInline
            muted
            style={{ display: isScanning ? 'block' : 'none' }}
          />
          
          {!isScanning && (
            <div className="w-full h-64 bg-gray-100 flex flex-col items-center justify-center">
              <CameraIcon className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-600 text-center mb-4">
                {cameraPermission === 'denied' 
                  ? 'Camera access denied. Please enable camera permissions.'
                  : 'Position barcode in camera view'
                }
              </p>
            </div>
          )}

          {/* Scan Overlay */}
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-2 border-red-500 bg-transparent animate-pulse" 
                   style={{ width: '200px', height: '100px' }}>
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-red-500"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-red-500"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-red-500"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-red-500"></div>
              </div>
            </div>
          )}
        </div>

        {/* Camera Controls */}
        <div className="flex gap-2">
          {!isScanning ? (
            <Button 
              onClick={startScanning}
              className="flex-1"
              disabled={cameraPermission === 'denied'}
            >
              <CameraIcon className="h-4 w-4 mr-2" />
              Start Scanning
            </Button>
          ) : (
            <Button 
              onClick={stopScanning}
              variant="secondary" outline
              className="flex-1"
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              Stop Scanning
            </Button>
          )}
          
          <Button
            onClick={switchCamera}
            variant="secondary" outline
            size="sm"
            disabled={!isScanning}
            className="px-3"
          >
            <BoltIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Manual Entry */}
        {allowManualEntry && (
          <div className="border-t pt-4">
            <div className="text-sm font-medium mb-2">Manual Entry</div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter barcode manually"
                value={manualEntry}
                onChange={(e) => setManualEntry(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualEntry()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Button 
                onClick={handleManualEntry}
                size="sm"
                disabled={!manualEntry.trim()}
              >
                ✓
              </Button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Scan Result */}
        {renderScanResult()}

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-1">📱 Scanning Tips:</div>
            <ul className="text-xs space-y-1">
              <li>• Hold device steady and ensure good lighting</li>
              <li>• Keep barcode flat and fully visible in frame</li>
              <li>• Try moving closer or further from barcode</li>
              <li>• Use manual entry if scanning fails</li>
            </ul>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>Camera: {facingMode === 'environment' ? 'Back' : 'Front'}</span>
            <span>Mode: {scanMode.toUpperCase()}</span>
          </div>
          <div className={`h-2 w-2 rounded-full ${
            isScanning ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
          }`}></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BarcodeScanner;