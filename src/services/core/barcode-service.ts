// Barcode Generation and Scanning Service
// Handles bundle labels, QR codes, and scanning integration

import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

export interface BundleLabel {
  bundleId: string;
  bundleNumber: string;
  lotNumber: string;
  articleName: string;
  size: string;
  color: string;
  pieces: number;
  operation: string;
  operatorAssigned?: string;
  cutBy: string;
  cutDate: Date;
  barcode: string;
  qrCode?: string;
}

export interface ScanResult {
  success: boolean;
  data?: {
    bundleId: string;
    bundleNumber: string;
    lotNumber: string;
    type: 'bundle' | 'roll' | 'operator';
    additionalInfo?: any;
  };
  error?: string;
}

export interface PrinterConfig {
  printerName: string;
  labelSize: 'small' | 'medium' | 'large';
  dpi: 203 | 300 | 600;
  darknessSetting: number; // 1-15
  printSpeed: number; // 2-12 inches per second
}

class BarcodeService {
  private canvas: HTMLCanvasElement | null = null;
  private printerConfig: PrinterConfig;
  private scannerStream: MediaStream | null = null;
  private isScanning = false;

  constructor() {
    this.canvas = this.createCanvas();
    this.printerConfig = {
      printerName: 'Default',
      labelSize: 'medium',
      dpi: 203,
      darknessSetting: 10,
      printSpeed: 6
    };
  }

  // Bundle Label Generation
  async generateBundleLabel(bundleData: Omit<BundleLabel, 'barcode' | 'qrCode'>): Promise<BundleLabel> {
    try {
      // Generate barcode
      const barcode = this.generateBarcodeString(bundleData.bundleId, bundleData.lotNumber);
      
      // Generate QR code with comprehensive data
      const qrData = JSON.stringify({
        bundleId: bundleData.bundleId,
        bundleNumber: bundleData.bundleNumber,
        lotNumber: bundleData.lotNumber,
        articleName: bundleData.articleName,
        size: bundleData.size,
        color: bundleData.color,
        pieces: bundleData.pieces,
        cutDate: bundleData.cutDate.toISOString(),
        type: 'bundle',
        version: '1.0'
      });
      
      const qrCode = await QRCode.toDataURL(qrData, {
        width: 128,
        margin: 1,
        errorCorrectionLevel: 'M'
      });

      return {
        ...bundleData,
        barcode,
        qrCode
      };
    } catch (error) {
      console.error('Error generating bundle label:', error);
      throw error;
    }
  }

  // Barcode Generation
  generateBarcodeString(bundleId: string, lotNumber: string): string {
    // Create a Code 128 compatible string
    const timestamp = Date.now().toString().slice(-6);
    const checksum = this.calculateChecksum(bundleId + lotNumber);
    return `${lotNumber}${bundleId.slice(-3)}${timestamp}${checksum}`;
  }

  async generateBarcodeImage(data: string, format: 'CODE128' | 'CODE39' | 'EAN13' = 'CODE128'): Promise<string> {
    try {
      if (!this.canvas) {
        throw new Error('Canvas not available');
      }

      JsBarcode(this.canvas, data, {
        format: format,
        width: 2,
        height: 40,
        displayValue: true,
        fontSize: 12,
        margin: 5
      });

      return this.canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error generating barcode image:', error);
      throw error;
    }
  }

  // QR Code Generation
  async generateQRCode(data: string | object, size: number = 128): Promise<string> {
    try {
      const qrData = typeof data === 'string' ? data : JSON.stringify(data);
      
      return await QRCode.toDataURL(qrData, {
        width: size,
        margin: 2,
        errorCorrectionLevel: 'M',
        type: 'image/png'
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  // Label Template Generation
  generateLabelHTML(label: BundleLabel, template: 'thermal' | 'laser' | 'inkjet' = 'thermal'): string {
    const templates = {
      thermal: this.getThermalLabelTemplate(label),
      laser: this.getLaserLabelTemplate(label),
      inkjet: this.getInkjetLabelTemplate(label)
    };

    return templates[template];
  }

  private getThermalLabelTemplate(label: BundleLabel): string {
    return `
      <div style="width: 4in; height: 2.5in; padding: 0.1in; font-family: Arial, sans-serif; border: 1px solid #000;">
        <!-- Header -->
        <div style="text-align: center; font-size: 14px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 4px;">
          📦 BUNDLE LABEL
        </div>
        
        <!-- Bundle Info -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <div style="font-size: 12px;">
            <strong>Bundle:</strong> ${label.bundleNumber}<br>
            <strong>Lot:</strong> ${label.lotNumber}<br>
            <strong>Article:</strong> ${label.articleName}
          </div>
          <div style="text-align: right; font-size: 12px;">
            <strong>Size:</strong> ${label.size}<br>
            <strong>Color:</strong> ${label.color}<br>
            <strong>Pieces:</strong> ${label.pieces}
          </div>
        </div>
        
        <!-- Barcode -->
        <div style="text-align: center; margin: 8px 0;">
          <img src="data:image/png;base64,${this.generateBarcodeBase64(label.barcode)}" alt="Barcode" style="max-width: 3in; height: 0.5in;">
          <div style="font-size: 10px; font-family: monospace;">${label.barcode}</div>
        </div>
        
        <!-- QR Code and Additional Info -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end;">
          <div style="font-size: 10px;">
            <strong>Operation:</strong> ${label.operation}<br>
            <strong>Cut by:</strong> ${label.cutBy}<br>
            <strong>Date:</strong> ${label.cutDate.toLocaleDateString()}
            ${label.operatorAssigned ? `<br><strong>Assigned:</strong> ${label.operatorAssigned}` : ''}
          </div>
          ${label.qrCode ? `<img src="${label.qrCode}" alt="QR Code" style="width: 0.8in; height: 0.8in;">` : ''}
        </div>
      </div>
    `;
  }

  private getLaserLabelTemplate(label: BundleLabel): string {
    // High-resolution template for laser printers
    return `
      <div style="width: 4in; height: 3in; padding: 0.15in; font-family: 'Helvetica', sans-serif; border: 2px solid #000;">
        <div style="text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 8px; background: #000; color: #fff; padding: 4px;">
          PRODUCTION BUNDLE
        </div>
        
        <table style="width: 100%; font-size: 11px; margin-bottom: 8px;">
          <tr>
            <td><strong>Bundle #:</strong></td>
            <td>${label.bundleNumber}</td>
            <td><strong>Lot #:</strong></td>
            <td>${label.lotNumber}</td>
          </tr>
          <tr>
            <td><strong>Article:</strong></td>
            <td colspan="3">${label.articleName}</td>
          </tr>
          <tr>
            <td><strong>Size:</strong></td>
            <td>${label.size}</td>
            <td><strong>Color:</strong></td>
            <td>${label.color}</td>
          </tr>
          <tr>
            <td><strong>Pieces:</strong></td>
            <td>${label.pieces}</td>
            <td><strong>Operation:</strong></td>
            <td>${label.operation}</td>
          </tr>
        </table>
        
        <div style="text-align: center; margin: 10px 0;">
          <img src="data:image/png;base64,${this.generateBarcodeBase64(label.barcode)}" alt="Barcode" style="max-width: 3.5in; height: 0.6in;">
          <div style="font-size: 9px; font-family: 'Courier New', monospace; margin-top: 2px;">${label.barcode}</div>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 9px;">
          <div>
            Cut by: <strong>${label.cutBy}</strong><br>
            Date: <strong>${label.cutDate.toLocaleDateString()}</strong>
          </div>
          ${label.qrCode ? `<img src="${label.qrCode}" alt="QR" style="width: 1in; height: 1in; border: 1px solid #ccc;">` : ''}
        </div>
      </div>
    `;
  }

  private getInkjetLabelTemplate(label: BundleLabel): string {
    // Color-optimized template for inkjet printers
    return `
      <div style="width: 4in; height: 3in; padding: 0.2in; font-family: 'Arial', sans-serif; background: #f9f9f9; border: 2px solid #333; border-radius: 8px;">
        <div style="text-align: center; font-size: 18px; font-weight: bold; color: #fff; background: linear-gradient(45deg, #007bff, #0056b3); padding: 6px; border-radius: 4px; margin-bottom: 10px;">
          🏭 TSA Production Bundle
        </div>
        
        <div style="background: #fff; padding: 8px; border-radius: 4px; margin-bottom: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px;">
            <div><span style="color: #666;">Bundle:</span> <strong>${label.bundleNumber}</strong></div>
            <div><span style="color: #666;">Lot:</span> <strong>${label.lotNumber}</strong></div>
            <div><span style="color: #666;">Article:</span> <strong>${label.articleName}</strong></div>
            <div><span style="color: #666;">Operation:</span> <strong>${label.operation}</strong></div>
            <div><span style="color: #666;">Size:</span> <span style="background: #e3f2fd; padding: 2px 6px; border-radius: 3px;"><strong>${label.size}</strong></span></div>
            <div><span style="color: #666;">Color:</span> <span style="background: #fff3e0; padding: 2px 6px; border-radius: 3px;"><strong>${label.color}</strong></span></div>
          </div>
          <div style="text-align: center; font-size: 14px; color: #007bff; font-weight: bold; margin-top: 6px;">
            ${label.pieces} Pieces
          </div>
        </div>
        
        <div style="text-align: center; background: #fff; padding: 6px; border-radius: 4px; margin-bottom: 8px;">
          <img src="data:image/png;base64,${this.generateBarcodeBase64(label.barcode)}" alt="Barcode" style="max-width: 3in; height: 0.5in;">
          <div style="font-size: 8px; font-family: 'Courier New', monospace; color: #666; margin-top: 2px;">${label.barcode}</div>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: #666;">
          <div style="background: #fff; padding: 4px; border-radius: 3px;">
            <div>Cut by: <strong style="color: #333;">${label.cutBy}</strong></div>
            <div>Date: <strong style="color: #333;">${label.cutDate.toLocaleDateString()}</strong></div>
          </div>
          ${label.qrCode ? `<img src="${label.qrCode}" alt="QR" style="width: 0.8in; height: 0.8in; border: 2px solid #007bff; border-radius: 4px;">` : ''}
        </div>
      </div>
    `;
  }

  // Printing Functions
  async printLabel(label: BundleLabel, printerConfig?: Partial<PrinterConfig>): Promise<void> {
    try {
      const config = { ...this.printerConfig, ...printerConfig };
      const labelHTML = this.generateLabelHTML(label, 'thermal');
      
      if (typeof window.print === 'function' && document) {
        // Create a new window for printing
        const printWindow = window.open('', '_blank', 'width=400,height=300');
        if (!printWindow) {
          throw new Error('Unable to open print window');
        }

        printWindow.document.write(`
          <html>
            <head>
              <title>Bundle Label - ${label.bundleNumber}</title>
              <style>
                @media print {
                  @page { margin: 0; size: 4in 3in; }
                  body { margin: 0; padding: 0; }
                }
                body { font-family: Arial, sans-serif; }
              </style>
            </head>
            <body>
              ${labelHTML}
              <script>
                window.onload = function() {
                  window.print();
                  window.close();
                };
              </script>
            </body>
          </html>
        `);

        printWindow.document.close();
      } else {
        // Fallback: Download as image
        await this.downloadLabelAsImage(label);
      }
    } catch (error) {
      console.error('Error printing label:', error);
      throw error;
    }
  }

  async downloadLabelAsImage(label: BundleLabel): Promise<void> {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 400; // 4 inches at 100 DPI
      canvas.height = 300; // 3 inches at 100 DPI
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      // Draw white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw border
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);

      // Add text content
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('BUNDLE LABEL', canvas.width / 2, 25);

      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Bundle: ${label.bundleNumber}`, 20, 60);
      ctx.fillText(`Lot: ${label.lotNumber}`, 20, 80);
      ctx.fillText(`Article: ${label.articleName}`, 20, 100);
      ctx.fillText(`Size: ${label.size}`, 20, 120);
      ctx.fillText(`Color: ${label.color}`, 200, 120);
      ctx.fillText(`Pieces: ${label.pieces}`, 20, 140);

      // Draw barcode (simplified representation)
      const barcodeImg = new Image();
      barcodeImg.onload = () => {
        ctx.drawImage(barcodeImg, 50, 160, 300, 40);
        
        // Add additional info
        ctx.font = '10px Arial';
        ctx.fillText(`Cut by: ${label.cutBy}`, 20, 230);
        ctx.fillText(`Date: ${label.cutDate.toLocaleDateString()}`, 20, 245);
        ctx.fillText(`Operation: ${label.operation}`, 20, 260);

        // Download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bundle_${label.bundleNumber}_label.png`;
            a.click();
            URL.revokeObjectURL(url);
          }
        });
      };
      
      barcodeImg.src = await this.generateBarcodeImage(label.barcode);
    } catch (error) {
      console.error('Error downloading label as image:', error);
      throw error;
    }
  }

  // Scanning Functions
  async startBarcodeScanning(
    videoElement: HTMLVideoElement,
    onScanResult: (result: ScanResult) => void,
    options?: {
      facingMode?: 'user' | 'environment';
      width?: number;
      height?: number;
    }
  ): Promise<void> {
    try {
      if (this.isScanning) {
        await this.stopScanning();
      }

      const constraints = {
        video: {
          facingMode: options?.facingMode || 'environment', // Use back camera
          width: { ideal: options?.width || 1280 },
          height: { ideal: options?.height || 720 }
        }
      };

      this.scannerStream = await navigator.mediaDevices.getUserMedia(constraints);
      videoElement.srcObject = this.scannerStream;
      
      await new Promise<void>((resolve) => {
        videoElement.onloadedmetadata = () => {
          videoElement.play();
          resolve();
        };
      });

      this.isScanning = true;
      this.startScanLoop(videoElement, onScanResult);
      
    } catch (error) {
      console.error('Error starting barcode scanning:', error);
      throw error;
    }
  }

  async stopScanning(): Promise<void> {
    this.isScanning = false;
    
    if (this.scannerStream) {
      this.scannerStream.getTracks().forEach(track => track.stop());
      this.scannerStream = null;
    }
  }

  private startScanLoop(videoElement: HTMLVideoElement, onScanResult: (result: ScanResult) => void): void {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      onScanResult({ success: false, error: 'Canvas context not available' });
      return;
    }

    const scanFrame = () => {
      if (!this.isScanning) return;

      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      ctx.drawImage(videoElement, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const scanResult = this.processImageForBarcode(imageData);
      
      if (scanResult.success) {
        onScanResult(scanResult);
      } else {
        // Continue scanning
        requestAnimationFrame(scanFrame);
      }
    };

    requestAnimationFrame(scanFrame);
  }

  private processImageForBarcode(imageData: ImageData): ScanResult {
    // Simplified barcode detection
    // In a real implementation, you would use a library like ZXing or QuaggaJS
    
    try {
      // This is a placeholder - real implementation would use proper barcode detection
      // For now, we'll simulate successful scanning occasionally
      const randomSuccess = Math.random() > 0.95; // 5% chance of "successful" scan
      
      if (randomSuccess) {
        // Simulate a scanned barcode
        const mockData = {
          bundleId: 'B001',
          bundleNumber: 'LOT-2024-B001',
          lotNumber: 'LOT-2024',
          type: 'bundle' as const,
          additionalInfo: {
            scannedAt: new Date(),
            confidence: 0.95
          }
        };
        
        return { success: true, data: mockData };
      }
      
      return { success: false };
    } catch (error) {
      return { success: false, error: 'Error processing image for barcode' };
    }
  }

  // Manual Barcode Entry
  parseBarcodeManually(barcodeString: string): ScanResult {
    try {
      // Parse barcode format: LOT-BUNDLEID-TIMESTAMP-CHECKSUM
      const pattern = /^([A-Z0-9\-]+)([A-Z0-9]{3})(\d{6})(\d{2})$/;
      const match = barcodeString.match(pattern);
      
      if (!match) {
        return { success: false, error: 'Invalid barcode format' };
      }

      const [, lotPart, bundlePart, timestamp, checksum] = match;
      
      // Verify checksum
      const calculatedChecksum = this.calculateChecksum(lotPart + bundlePart);
      if (parseInt(checksum) !== calculatedChecksum) {
        return { success: false, error: 'Invalid barcode checksum' };
      }

      return {
        success: true,
        data: {
          bundleId: bundlePart,
          bundleNumber: `${lotPart}-${bundlePart}`,
          lotNumber: lotPart,
          type: 'bundle',
          additionalInfo: {
            timestamp,
            manualEntry: true
          }
        }
      };
    } catch (error) {
      return { success: false, error: 'Error parsing barcode' };
    }
  }

  // Utility Functions
  private createCanvas(): HTMLCanvasElement {
    if (typeof document === 'undefined') {
      // Server-side or testing environment
      return {} as HTMLCanvasElement;
    }
    return document.createElement('canvas');
  }

  private calculateChecksum(data: string): number {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data.charCodeAt(i);
    }
    return sum % 100;
  }

  private generateBarcodeBase64(data: string): string {
    try {
      if (!this.canvas) return '';
      
      JsBarcode(this.canvas, data, {
        format: 'CODE128',
        width: 1,
        height: 30,
        displayValue: false
      });

      return this.canvas.toDataURL('image/png').split(',')[1];
    } catch (error) {
      console.error('Error generating barcode base64:', error);
      return '';
    }
  }

  // Configuration
  updatePrinterConfig(config: Partial<PrinterConfig>): void {
    this.printerConfig = { ...this.printerConfig, ...config };
  }

  getPrinterConfig(): PrinterConfig {
    return { ...this.printerConfig };
  }

  // Validation
  validateBarcodeFormat(barcode: string): boolean {
    const pattern = /^[A-Z0-9\-]{10,30}$/;
    return pattern.test(barcode);
  }

  // Batch Operations
  async generateMultipleBarcodes(bundles: Array<Omit<BundleLabel, 'barcode' | 'qrCode'>>): Promise<BundleLabel[]> {
    const results: BundleLabel[] = [];
    
    for (const bundle of bundles) {
      const label = await this.generateBundleLabel(bundle);
      results.push(label);
    }
    
    return results;
  }

  async printMultipleLabels(labels: BundleLabel[]): Promise<void> {
    for (const label of labels) {
      await this.printLabel(label);
      // Add small delay between prints
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

// Export singleton instance
export const barcodeService = new BarcodeService();
export default BarcodeService;