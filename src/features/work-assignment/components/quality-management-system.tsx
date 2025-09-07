// Quality Management System Component  
// Comprehensive quality control with inspection workflows and defect tracking

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Camera,
  FileText,
  TrendingDown,
  TrendingUp,
  Target,
  Eye,
  Star,
  BarChart3,
  Clock,
  User,
  MessageSquare,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  QualityIssue, 
  WorkItem, 
  QualityInspection,
  QualityMetrics,
  DefectPattern,
  QualityTrend 
} from '../types';
import { getWorkAssignmentConfig } from '../config/work-assignment-config';

interface QualityManagementSystemProps {
  workItemId?: string;
  operatorId?: string;
  mode: 'inspection' | 'tracking' | 'analytics';
  onQualityIssueCreated?: (issue: QualityIssue) => void;
  onInspectionCompleted?: (inspection: QualityInspection) => void;
}

interface InspectionForm {
  workItemId: string;
  inspectorId: string;
  inspectionType: 'random' | 'scheduled' | 'quality_flag' | 'completion';
  overallGrade: 'excellent' | 'good' | 'acceptable' | 'poor' | 'failed';
  checklist: QualityChecklist;
  defects: QualityDefect[];
  notes: string;
  photos: string[];
  recommendations: string[];
  passStatus: boolean;
}

interface QualityChecklist {
  measurements: { passed: boolean; notes: string };
  stitching: { passed: boolean; notes: string };
  finishing: { passed: boolean; notes: string };
  threading: { passed: boolean; notes: string };
  buttons: { passed: boolean; notes: string };
  appearance: { passed: boolean; notes: string };
}

interface QualityDefect {
  id: string;
  type: string;
  severity: 'minor' | 'major' | 'critical';
  location: string;
  description: string;
  count: number;
  photoUrl?: string;
  correctionRequired: boolean;
}

export const QualityManagementSystem: React.FC<QualityManagementSystemProps> = ({
  workItemId,
  operatorId,
  mode,
  onQualityIssueCreated,
  onInspectionCompleted
}) => {
  const queryClient = useQueryClient();
  const config = getWorkAssignmentConfig();
  
  // Form state
  const [inspectionForm, setInspectionForm] = useState<InspectionForm>({
    workItemId: workItemId || '',
    inspectorId: 'current_user',
    inspectionType: 'random',
    overallGrade: 'good',
    checklist: {
      measurements: { passed: true, notes: '' },
      stitching: { passed: true, notes: '' },
      finishing: { passed: true, notes: '' },
      threading: { passed: true, notes: '' },
      buttons: { passed: true, notes: '' },
      appearance: { passed: true, notes: '' }
    },
    defects: [],
    notes: '',
    photos: [],
    recommendations: [],
    passStatus: true
  });

  // Filter states
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('week');

  // Get quality metrics
  const { data: qualityMetrics } = useQuery({
    queryKey: ['qualityMetrics', operatorId, dateRange],
    queryFn: async () => {
      // Implementation would fetch from Firebase
      return {
        totalInspections: 45,
        passRate: 92.3,
        defectRate: 7.7,
        averageGrade: 'good',
        trendDirection: 'up',
        commonDefects: [
          { type: 'stitching', count: 12, severity: 'minor' },
          { type: 'measurements', count: 8, severity: 'major' },
          { type: 'finishing', count: 5, severity: 'minor' }
        ]
      } as QualityMetrics;
    },
    enabled: mode === 'analytics'
  });

  // Get quality issues
  const { data: qualityIssues } = useQuery({
    queryKey: ['qualityIssues', operatorId, workItemId, filterSeverity, filterStatus],
    queryFn: async () => {
      // Implementation would fetch from Firebase with filters
      return [] as QualityIssue[];
    },
    enabled: mode === 'tracking'
  });

  // Submit inspection mutation
  const submitInspectionMutation = useMutation({
    mutationFn: async (data: InspectionForm) => {
      const inspection: QualityInspection = {
        id: `inspection_${Date.now()}`,
        workItemId: data.workItemId,
        inspectorId: data.inspectorId,
        operatorId: operatorId || '',
        inspectionDate: new Date(),
        inspectionType: data.inspectionType,
        overallGrade: data.overallGrade,
        passStatus: data.passStatus,
        checklist: data.checklist,
        defects: data.defects,
        notes: data.notes,
        photos: data.photos,
        recommendations: data.recommendations,
        followUpRequired: !data.passStatus || data.defects.some(d => d.severity === 'critical'),
        status: 'completed'
      };

      // Implementation would save to Firebase
      await new Promise(resolve => setTimeout(resolve, 1000));
      return inspection;
    },
    onSuccess: (inspection) => {
      onInspectionCompleted?.(inspection);
      
      // Create quality issues for defects
      inspection.defects.forEach(defect => {
        if (defect.severity === 'major' || defect.severity === 'critical') {
          const issue: QualityIssue = {
            id: `issue_${Date.now()}_${defect.id}`,
            workItemId: inspection.workItemId,
            operatorId: inspection.operatorId,
            inspectionId: inspection.id,
            issueType: defect.type,
            severity: defect.severity,
            description: defect.description,
            location: defect.location,
            reportedAt: new Date(),
            reportedBy: inspection.inspectorId,
            status: 'open',
            photoUrls: defect.photoUrl ? [defect.photoUrl] : []
          };
          
          onQualityIssueCreated?.(issue);
        }
      });

      // Reset form
      setInspectionForm(prev => ({
        ...prev,
        overallGrade: 'good',
        defects: [],
        notes: '',
        photos: [],
        recommendations: [],
        passStatus: true
      }));
    }
  });

  // Add defect
  const addDefect = useCallback(() => {
    const newDefect: QualityDefect = {
      id: `defect_${Date.now()}`,
      type: 'stitching',
      severity: 'minor',
      location: '',
      description: '',
      count: 1,
      correctionRequired: false
    };

    setInspectionForm(prev => ({
      ...prev,
      defects: [...prev.defects, newDefect]
    }));
  }, []);

  // Update defect
  const updateDefect = useCallback((index: number, updates: Partial<QualityDefect>) => {
    setInspectionForm(prev => ({
      ...prev,
      defects: prev.defects.map((defect, i) => 
        i === index ? { ...defect, ...updates } : defect
      )
    }));
  }, []);

  // Remove defect
  const removeDefect = useCallback((index: number) => {
    setInspectionForm(prev => ({
      ...prev,
      defects: prev.defects.filter((_, i) => i !== index)
    }));
  }, []);

  // Update checklist item
  const updateChecklistItem = useCallback((
    item: keyof QualityChecklist, 
    updates: Partial<QualityChecklist[keyof QualityChecklist]>
  ) => {
    setInspectionForm(prev => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [item]: { ...prev.checklist[item], ...updates }
      }
    }));
  }, []);

  // Calculate pass status based on checklist and defects
  useEffect(() => {
    const checklistPassed = Object.values(inspectionForm.checklist).every(item => item.passed);
    const hasCriticalDefects = inspectionForm.defects.some(d => d.severity === 'critical');
    const hasManyMajorDefects = inspectionForm.defects.filter(d => d.severity === 'major').length > 2;
    
    const passStatus = checklistPassed && !hasCriticalDefects && !hasManyMajorDefects;
    
    setInspectionForm(prev => ({
      ...prev,
      passStatus
    }));
  }, [inspectionForm.checklist, inspectionForm.defects]);

  // Get defect type options
  const defectTypes = [
    'stitching', 'measurements', 'finishing', 'threading', 
    'buttons', 'appearance', 'fabric', 'color', 'other'
  ];

  const severityColors = {
    minor: 'bg-yellow-100 text-yellow-800',
    major: 'bg-orange-100 text-orange-800',  
    critical: 'bg-red-100 text-red-800'
  };

  return (
    <div className="space-y-6">
      <Tabs value={mode} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inspection" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Inspection
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Issues
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Inspection Tab */}
        <TabsContent value="inspection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Quality Inspection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Inspection Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="inspectionType">Inspection Type</Label>
                  <Select
                    value={inspectionForm.inspectionType}
                    onValueChange={(value) => setInspectionForm(prev => ({
                      ...prev,
                      inspectionType: value as any
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="random">Random Check</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="quality_flag">Quality Flag</SelectItem>
                      <SelectItem value="completion">Work Completion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Overall Grade</Label>
                  <RadioGroup 
                    value={inspectionForm.overallGrade}
                    onValueChange={(value) => setInspectionForm(prev => ({
                      ...prev,
                      overallGrade: value as any
                    }))}
                    className="flex gap-2 mt-2"
                  >
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="excellent" id="exc" />
                      <Label htmlFor="exc" className="text-xs text-green-600">Excellent</Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="good" id="gd" />
                      <Label htmlFor="gd" className="text-xs text-blue-600">Good</Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="acceptable" id="acc" />
                      <Label htmlFor="acc" className="text-xs text-yellow-600">OK</Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="poor" id="por" />
                      <Label htmlFor="por" className="text-xs text-orange-600">Poor</Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="failed" id="fail" />
                      <Label htmlFor="fail" className="text-xs text-red-600">Failed</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Quality Checklist */}
              <div>
                <Label className="text-base font-medium">Quality Checklist</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  {Object.entries(inspectionForm.checklist).map(([key, item]) => (
                    <div key={key} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="capitalize font-medium">{key}</Label>
                        <Checkbox
                          checked={item.passed}
                          onCheckedChange={(checked) => updateChecklistItem(
                            key as keyof QualityChecklist,
                            { passed: !!checked }
                          )}
                        />
                      </div>
                      {!item.passed && (
                        <Input
                          placeholder="Note why this failed..."
                          value={item.notes}
                          onChange={(e) => updateChecklistItem(
                            key as keyof QualityChecklist,
                            { notes: e.target.value }
                          )}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Defects Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-medium">Defects Found</Label>
                  <Button variant="outline" size="sm" onClick={addDefect}>
                    Add Defect
                  </Button>
                </div>
                
                {inspectionForm.defects.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                    No defects found
                  </div>
                ) : (
                  <div className="space-y-3">
                    {inspectionForm.defects.map((defect, index) => (
                      <div key={defect.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Defect #{index + 1}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDefect(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <Label>Type</Label>
                            <Select
                              value={defect.type}
                              onValueChange={(value) => updateDefect(index, { type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {defectTypes.map(type => (
                                  <SelectItem key={type} value={type} className="capitalize">
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label>Severity</Label>
                            <Select
                              value={defect.severity}
                              onValueChange={(value) => updateDefect(index, { severity: value as any })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="minor">Minor</SelectItem>
                                <SelectItem value="major">Major</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label>Location</Label>
                            <Input
                              placeholder="e.g., left sleeve"
                              value={defect.location}
                              onChange={(e) => updateDefect(index, { location: e.target.value })}
                            />
                          </div>
                          
                          <div>
                            <Label>Count</Label>
                            <Input
                              type="number"
                              min="1"
                              value={defect.count}
                              onChange={(e) => updateDefect(index, { count: parseInt(e.target.value) || 1 })}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            placeholder="Describe the defect in detail..."
                            value={defect.description}
                            onChange={(e) => updateDefect(index, { description: e.target.value })}
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes and Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="notes">Inspector Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional observations or comments..."
                    value={inspectionForm.notes}
                    onChange={(e) => setInspectionForm(prev => ({
                      ...prev,
                      notes: e.target.value
                    }))}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Pass Status</Label>
                  <div className={`p-3 rounded border-2 ${inspectionForm.passStatus ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <div className="flex items-center gap-2">
                      {inspectionForm.passStatus ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <X className="h-5 w-5 text-red-600" />
                      )}
                      <span className={`font-medium ${inspectionForm.passStatus ? 'text-green-800' : 'text-red-800'}`}>
                        {inspectionForm.passStatus ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                    <div className="text-sm mt-1 text-muted-foreground">
                      {inspectionForm.passStatus 
                        ? 'Work meets quality standards' 
                        : 'Work requires correction or rework'
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button 
                  onClick={() => submitInspectionMutation.mutate(inspectionForm)}
                  disabled={submitInspectionMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {submitInspectionMutation.isPending ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Submit Inspection
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Issues Tracking Tab */}
        <TabsContent value="tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Quality Issues
                </div>
                <div className="flex gap-2">
                  <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="major">Major</SelectItem>
                      <SelectItem value="minor">Minor</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(!qualityIssues || qualityIssues.length === 0) ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                  <div className="text-lg font-medium">No quality issues found</div>
                  <div className="text-sm">Great work maintaining quality standards!</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {qualityIssues.map((issue) => (
                    <div key={issue.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className={`h-5 w-5 ${
                            issue.severity === 'critical' ? 'text-red-500' :
                            issue.severity === 'major' ? 'text-orange-500' :
                            'text-yellow-500'
                          }`} />
                          <div>
                            <div className="font-medium">{issue.issueType}</div>
                            <div className="text-sm text-muted-foreground">
                              {issue.workItemId} • {issue.reportedAt.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={severityColors[issue.severity]}>
                            {issue.severity}
                          </Badge>
                          <Badge variant={issue.status === 'resolved' ? 'default' : 'secondary'}>
                            {issue.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-sm mb-2">{issue.description}</div>
                      
                      {issue.location && (
                        <div className="text-xs text-muted-foreground mb-2">
                          Location: {issue.location}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Reported by: {issue.reportedBy}</span>
                        {issue.resolvedAt && (
                          <span>Resolved: {issue.resolvedAt.toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {qualityMetrics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{qualityMetrics.passRate}%</div>
                    <div className="text-sm text-muted-foreground">Pass Rate</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{qualityMetrics.totalInspections}</div>
                    <div className="text-sm text-muted-foreground">Inspections</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{qualityMetrics.defectRate}%</div>
                    <div className="text-sm text-muted-foreground">Defect Rate</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                      <Star className="h-6 w-6 text-yellow-500" />
                      <span className="capitalize">{qualityMetrics.averageGrade}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Grade</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Common Defect Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {qualityMetrics.commonDefects.map((defect, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <div className="capitalize font-medium">{defect.type}</div>
                          <Badge className={severityColors[defect.severity]}>
                            {defect.severity}
                          </Badge>
                        </div>
                        <div className="font-medium">{defect.count} cases</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};