// Work Completion Workflow Component
// Comprehensive workflow for completing work items with quality checks and approvals

import React, { useState, useCallback, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Camera, 
  FileText,
  Upload,
  Users,
  Award,
  TrendingUp,
  MessageSquare,
  Send,
  Star,
  Target,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  WorkItem, 
  WorkSession, 
  QualityIssue, 
  WorkCompletion,
  ProductionMetrics 
} from '../types';
import { productionTrackingLogic } from '../business/production-tracking-logic';
import { getWorkAssignmentConfig } from '../config/work-assignment-config';

interface WorkCompletionWorkflowProps {
  workItem: WorkItem;
  session: WorkSession;
  operatorId: string;
  operatorName: string;
  completedQuantity: number;
  defectiveQuantity: number;
  reworkQuantity: number;
  onWorkCompleted?: (completion: WorkCompletion) => void;
  onQualityReview?: (review: { passed: boolean; issues: QualityIssue[] }) => void;
}

interface CompletionData {
  actualQuantity: number;
  qualityGrade: 'excellent' | 'good' | 'acceptable' | 'poor';
  defects: QualityDefect[];
  notes: string;
  photoUrls: string[];
  requiresApproval: boolean;
  qualityCheckPassed: boolean;
  completionTime: Date;
  estimatedEarnings: number;
}

interface QualityDefect {
  type: string;
  severity: 'minor' | 'major' | 'critical';
  count: number;
  description: string;
  location?: string;
}

interface QualityChecklist {
  stitchingQuality: boolean;
  measurements: boolean;
  finishing: boolean;
  threadTrimming: boolean;
  buttonAttachment: boolean;
  overallAppearance: boolean;
}

export const WorkCompletionWorkflow: React.FC<WorkCompletionWorkflowProps> = ({
  workItem,
  session,
  operatorId,
  operatorName,
  completedQuantity,
  defectiveQuantity,
  reworkQuantity,
  onWorkCompleted,
  onQualityReview
}) => {
  const queryClient = useQueryClient();
  const config = getWorkAssignmentConfig();
  
  // Workflow state
  const [currentStep, setCurrentStep] = useState<'review' | 'quality' | 'photos' | 'submit'>('review');
  const [completionData, setCompletionData] = useState<CompletionData>({
    actualQuantity: completedQuantity,
    qualityGrade: 'good',
    defects: [],
    notes: '',
    photoUrls: [],
    requiresApproval: false,
    qualityCheckPassed: true,
    completionTime: new Date(),
    estimatedEarnings: 0
  });

  // Quality checklist
  const [qualityChecklist, setQualityChecklist] = useState<QualityChecklist>({
    stitchingQuality: false,
    measurements: false,
    finishing: false,
    threadTrimming: false,
    buttonAttachment: false,
    overallAppearance: false
  });

  // Photo uploads
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Calculate metrics and earnings
  useEffect(() => {
    const metrics = productionTrackingLogic.calculateFinalMetrics({
      workItem,
      session,
      completedQuantity: completionData.actualQuantity,
      defectiveQuantity,
      reworkQuantity,
      qualityGrade: completionData.qualityGrade
    });

    setCompletionData(prev => ({
      ...prev,
      estimatedEarnings: metrics.estimatedEarnings || 0,
      requiresApproval: metrics.efficiency < 0.7 || completionData.qualityGrade === 'poor' || completionData.defects.some(d => d.severity === 'critical')
    }));
  }, [completionData.actualQuantity, completionData.qualityGrade, completionData.defects, defectiveQuantity, reworkQuantity, workItem, session]);

  // Submit completion mutation
  const submitCompletionMutation = useMutation({
    mutationFn: async (data: CompletionData) => {
      const completion: WorkCompletion = {
        id: `completion_${Date.now()}`,
        workItemId: workItem.id!,
        operatorId,
        sessionId: session.id!,
        completedAt: data.completionTime,
        actualQuantity: data.actualQuantity,
        qualityGrade: data.qualityGrade,
        defects: data.defects,
        notes: data.notes,
        photoUrls: data.photoUrls,
        requiresApproval: data.requiresApproval,
        qualityCheckPassed: data.qualityCheckPassed,
        status: data.requiresApproval ? 'pending_approval' : 'completed',
        estimatedEarnings: data.estimatedEarnings,
        completionMethod: 'operator_interface'
      };

      // Implementation would save to Firebase
      await new Promise(resolve => setTimeout(resolve, 1000));
      return completion;
    },
    onSuccess: (completion) => {
      onWorkCompleted?.(completion);
    }
  });

  // Photo upload mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async (files: File[]) => {
      // Implementation would upload to Firebase Storage
      const urls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        setUploadProgress((i / files.length) * 100);
        await new Promise(resolve => setTimeout(resolve, 500));
        urls.push(`https://example.com/photo_${Date.now()}_${i}.jpg`);
      }
      
      setUploadProgress(100);
      return urls;
    },
    onSuccess: (urls) => {
      setCompletionData(prev => ({
        ...prev,
        photoUrls: urls
      }));
    }
  });

  // Add defect
  const addDefect = useCallback((defect: Omit<QualityDefect, 'count'>) => {
    setCompletionData(prev => ({
      ...prev,
      defects: [...prev.defects, { ...defect, count: 1 }]
    }));
  }, []);

  // Remove defect
  const removeDefect = useCallback((index: number) => {
    setCompletionData(prev => ({
      ...prev,
      defects: prev.defects.filter((_, i) => i !== index)
    }));
  }, []);

  // Handle photo upload
  const handlePhotoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setPhotoFiles(files);
    
    if (files.length > 0) {
      uploadPhotoMutation.mutate(files);
    }
  }, [uploadPhotoMutation]);

  // Validate quality checklist
  const isQualityChecklistComplete = Object.values(qualityChecklist).every(Boolean);
  const canProceedToSubmit = isQualityChecklistComplete && completionData.actualQuantity > 0;

  // Calculate completion percentage
  const completionPercentage = workItem.targetQuantity ? 
    Math.round((completionData.actualQuantity / workItem.targetQuantity) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              Complete Work: {workItem.bundleNumber} - {workItem.operation}
            </div>
            <Badge variant={canProceedToSubmit ? "default" : "secondary"}>
              Step {['review', 'quality', 'photos', 'submit'].indexOf(currentStep) + 1} of 4
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{completionData.actualQuantity}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">{defectiveQuantity}</div>
                <div className="text-sm text-muted-foreground">Defective</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{completionPercentage}%</div>
                <div className="text-sm text-muted-foreground">Target</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">৳{completionData.estimatedEarnings.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Earnings</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Tabs */}
      <Tabs value={currentStep} onValueChange={(value) => setCurrentStep(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="review" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Review
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Quality
          </TabsTrigger>
          <TabsTrigger value="photos" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Photos
          </TabsTrigger>
          <TabsTrigger value="submit" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Submit
          </TabsTrigger>
        </TabsList>

        {/* Review Tab */}
        <TabsContent value="review" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Work Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="actualQuantity">Actual Completed Quantity</Label>
                  <Input
                    id="actualQuantity"
                    type="number"
                    value={completionData.actualQuantity}
                    onChange={(e) => setCompletionData(prev => ({
                      ...prev,
                      actualQuantity: parseInt(e.target.value) || 0
                    }))}
                    min="0"
                  />
                </div>
                <div>
                  <Label>Work Duration</Label>
                  <div className="flex items-center gap-2 p-2 border rounded">
                    <Clock className="h-4 w-4" />
                    <span>{Math.round((session.duration || 0) / (1000 * 60))} minutes</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Completion Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about your work, challenges faced, or special observations..."
                  value={completionData.notes}
                  onChange={(e) => setCompletionData(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  rows={3}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setCurrentStep('quality')}>
                  Proceed to Quality Check
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quality Tab */}
        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quality Grade */}
              <div>
                <Label>Overall Quality Grade</Label>
                <RadioGroup 
                  value={completionData.qualityGrade} 
                  onValueChange={(value) => setCompletionData(prev => ({
                    ...prev,
                    qualityGrade: value as any
                  }))}
                  className="flex gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="excellent" id="excellent" />
                    <Label htmlFor="excellent" className="text-green-600">Excellent</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="good" id="good" />
                    <Label htmlFor="good" className="text-blue-600">Good</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="acceptable" id="acceptable" />
                    <Label htmlFor="acceptable" className="text-yellow-600">Acceptable</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="poor" id="poor" />
                    <Label htmlFor="poor" className="text-red-600">Poor</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Quality Checklist */}
              <div>
                <Label className="text-base font-medium">Quality Checklist</Label>
                <div className="space-y-3 mt-2">
                  {Object.entries(qualityChecklist).map(([key, checked]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={checked}
                        onCheckedChange={(checked) => setQualityChecklist(prev => ({
                          ...prev,
                          [key]: !!checked
                        }))}
                      />
                      <Label htmlFor={key} className="capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Defects Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-base font-medium">Quality Issues</Label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => addDefect({
                      type: 'stitching',
                      severity: 'minor',
                      description: 'Minor stitching issue'
                    })}
                  >
                    Add Issue
                  </Button>
                </div>
                
                {completionData.defects.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground border-2 border-dashed rounded">
                    No quality issues reported
                  </div>
                ) : (
                  <div className="space-y-2">
                    {completionData.defects.map((defect, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium capitalize">{defect.type}</div>
                          <div className="text-sm text-muted-foreground">{defect.description}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            defect.severity === 'critical' ? 'destructive' :
                            defect.severity === 'major' ? 'default' : 'secondary'
                          }>
                            {defect.severity}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeDefect(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep('review')}>
                  Back
                </Button>
                <Button 
                  onClick={() => setCurrentStep('photos')}
                  disabled={!isQualityChecklistComplete}
                >
                  Continue to Photos
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Photos Tab */}
        <TabsContent value="photos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Work Photos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="photos">Upload Work Photos (Optional)</Label>
                <Input
                  id="photos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="mt-2"
                />
                <div className="text-sm text-muted-foreground mt-1">
                  Upload photos showing completed work quality (max 5 photos)
                </div>
              </div>

              {uploadPhotoMutation.isPending && (
                <div>
                  <Label>Upload Progress</Label>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {completionData.photoUrls.length > 0 && (
                <div>
                  <Label>Uploaded Photos</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {completionData.photoUrls.map((url, index) => (
                      <div key={index} className="aspect-square border rounded bg-gray-100 flex items-center justify-center">
                        <Camera className="h-8 w-8 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep('quality')}>
                  Back
                </Button>
                <Button onClick={() => setCurrentStep('submit')}>
                  Continue to Submit
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Submit Tab */}
        <TabsContent value="submit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Final Review & Submit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Final Summary */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                <div>
                  <div className="text-sm text-muted-foreground">Completed Quantity</div>
                  <div className="text-lg font-semibold">{completionData.actualQuantity} pieces</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Quality Grade</div>
                  <Badge className="capitalize">{completionData.qualityGrade}</Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Estimated Earnings</div>
                  <div className="text-lg font-semibold text-green-600">৳{completionData.estimatedEarnings.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Approval Required</div>
                  <Badge variant={completionData.requiresApproval ? "destructive" : "default"}>
                    {completionData.requiresApproval ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>

              {/* Warnings */}
              {completionData.requiresApproval && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This work completion requires supervisor approval due to quality or efficiency concerns.
                  </AlertDescription>
                </Alert>
              )}

              {completionData.defects.length > 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {completionData.defects.length} quality issue(s) reported. This may affect your quality rating.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep('photos')}>
                  Back
                </Button>
                <Button 
                  onClick={() => submitCompletionMutation.mutate(completionData)}
                  disabled={!canProceedToSubmit || submitCompletionMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {submitCompletionMutation.isPending ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Complete Work
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};