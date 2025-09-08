import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Input } from '@/shared/components/ui/Input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { AlertTriangle, Camera, Upload } from 'lucide-react';
import { damageReportService } from '@/services/damage-report-service';
import { toast } from 'sonner';

interface DamageReportFormProps {
  bundleId: string;
  operatorId: string;
  onSuccess?: (report: DamageReport) => void;
  onCancel?: () => void;
}

interface DamageReport {
  id: string;
  bundleId: string;
  operatorId: string;
  damageType: string;
  damagedPieces: number;
  description: string;
  severity: string;
  timestamp: Date;
  photos: string[];
  estimatedCost: number;
}

const DAMAGE_TYPES = [
  { value: 'cutting_error', label: 'Cutting Error', nepali: 'काट्ने गल्ती' },
  { value: 'sewing_defect', label: 'Sewing Defect', nepali: 'सिलाई दोष' },
  { value: 'fabric_tear', label: 'Fabric Tear', nepali: 'कपडा च्यातिने' },
  { value: 'stain', label: 'Stain/Mark', nepali: 'दाग/निशान' },
  { value: 'burn_mark', label: 'Burn Mark', nepali: 'जलेको निशान' },
  { value: 'measurement_error', label: 'Measurement Error', nepali: 'नाप गल्ती' },
  { value: 'thread_pull', label: 'Thread Pull', nepali: 'धागो तानिने' },
  { value: 'hole_damage', label: 'Hole/Puncture', nepali: 'प्वाल' },
  { value: 'color_fade', label: 'Color Fade', nepali: 'रंग फिक्का' },
  { value: 'other', label: 'Other', nepali: 'अन्य' }
];

const SEVERITY_LEVELS = [
  { value: 'minor', label: 'Minor', description: 'Repairable with minimal effort', color: 'text-yellow-600' },
  { value: 'major', label: 'Major', description: 'Requires significant rework', color: 'text-orange-600' },
  { value: 'critical', label: 'Critical', description: 'May result in rejection', color: 'text-red-600' }
];

export const DamageReportForm: React.FC<DamageReportFormProps> = ({
  bundleId,
  operatorId,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    damageType: '',
    damagedPieces: '',
    description: '',
    severity: '',
    estimatedCost: '',
    photos: [] as File[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...files]
    }));
    
    // Create preview URLs
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      setUploadedPhotos(prev => [...prev, url]);
    });
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.damageType) {
      toast.error('Please select a damage type');
      return false;
    }
    if (!formData.damagedPieces || parseInt(formData.damagedPieces) <= 0) {
      toast.error('Please enter a valid number of damaged pieces');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Please provide a description of the damage');
      return false;
    }
    if (!formData.severity) {
      toast.error('Please select the severity level');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const damageReport: Omit<DamageReport, 'id' | 'timestamp'> = {
        bundleId,
        operatorId,
        damageType: formData.damageType,
        damagedPieces: parseInt(formData.damagedPieces),
        description: formData.description,
        severity: formData.severity,
        photos: uploadedPhotos,
        estimatedCost: parseFloat(formData.estimatedCost) || 0
      };

      const result = await damageReportService.createDamageReport(damageReport);
      
      toast.success('Damage report submitted successfully');
      onSuccess?.(result);
      
    } catch (error) {
      console.error('Error submitting damage report:', error);
      toast.error('Failed to submit damage report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <CardTitle>Report Damage</CardTitle>
        </div>
        <CardDescription>
          Bundle ID: {bundleId} | Please provide detailed information about the damage
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Damage Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="damageType">Damage Type *</Label>
            <Select value={formData.damageType} onValueChange={(value) => handleInputChange('damageType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select damage type" />
              </SelectTrigger>
              <SelectContent>
                {DAMAGE_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label} - {type.nepali}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Number of Damaged Pieces */}
          <div className="space-y-2">
            <Label htmlFor="damagedPieces">Number of Damaged Pieces *</Label>
            <Input
              id="damagedPieces"
              type="number"
              min="1"
              value={formData.damagedPieces}
              onChange={(e) => handleInputChange('damagedPieces', e.target.value)}
              placeholder="Enter number of damaged pieces"
            />
          </div>

          {/* Severity Level */}
          <div className="space-y-2">
            <Label htmlFor="severity">Severity Level *</Label>
            <Select value={formData.severity} onValueChange={(value) => handleInputChange('severity', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select severity level" />
              </SelectTrigger>
              <SelectContent>
                {SEVERITY_LEVELS.map(level => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label} - {level.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the damage in detail, including how it occurred..."
              rows={4}
            />
          </div>

          {/* Estimated Cost */}
          <div className="space-y-2">
            <Label htmlFor="estimatedCost">Estimated Cost Impact (NPR)</Label>
            <Input
              id="estimatedCost"
              type="number"
              min="0"
              step="0.01"
              value={formData.estimatedCost}
              onChange={(e) => handleInputChange('estimatedCost', e.target.value)}
              placeholder="Estimated cost of damage"
            />
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Damage Photos</Label>
            <div className="flex items-center space-x-2">
              <Button type="button" variant="outline" className="flex items-center space-x-2" asChild>
                <label>
                  <Camera className="h-4 w-4" />
                  <span>Upload Photos</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </label>
              </Button>
              <span className="text-sm text-muted-foreground">
                {formData.photos.length} photo(s) selected
              </span>
            </div>
            
            {/* Photo Previews */}
            {uploadedPhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {uploadedPhotos.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Damage photo ${index + 1}`}
                      className="w-full h-20 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => removePhoto(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DamageReportForm;