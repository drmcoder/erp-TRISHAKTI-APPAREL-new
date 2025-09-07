// Piece Counting Interface Component
// Real-time piece counting with progress tracking and quality management

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Plus, 
  Minus, 
  RotateCcw, 
  Check, 
  X, 
  AlertTriangle,
  TrendingUp,
  Clock,
  Target,
  Zap,
  Award,
  Save
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/shared/components/ui/Input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  WorkItem, 
  QualityIssue, 
  ProductionMetrics,
  PieceEntry 
} from '../types';
import { productionTrackingLogic } from '../business/production-tracking-logic';
import { getWorkAssignmentConfig } from '../config/work-assignment-config';

interface PieceCountingInterfaceProps {
  workItemId: string;
  operatorId: string;
  workItem: WorkItem;
  sessionId: string;
  targetQuantity: number;
  onProgressUpdate?: (completed: number, defects: number) => void;
  onQualityIssue?: (issue: QualityIssue) => void;
  onTargetReached?: () => void;
}

interface CountingState {
  completedPieces: number;
  defectivePieces: number;
  reworkPieces: number;
  totalProcessed: number;
  currentBatch: number;
  lastSaveTime: Date | null;
  hasUnsavedChanges: boolean;
}

interface QualityEntry {
  type: 'completed' | 'defective' | 'rework';
  count: number;
  timestamp: Date;
  batchNumber: number;
  notes?: string;
}

export const PieceCountingInterface: React.FC<PieceCountingInterfaceProps> = ({
  workItemId,
  operatorId,
  workItem,
  sessionId,
  targetQuantity,
  onProgressUpdate,
  onQualityIssue,
  onTargetReached
}) => {
  const queryClient = useQueryClient();
  const config = getWorkAssignmentConfig();
  const autoSaveInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Counting state
  const [counting, setCounting] = useState<CountingState>({
    completedPieces: 0,
    defectivePieces: 0,
    reworkPieces: 0,
    totalProcessed: 0,
    currentBatch: 1,
    lastSaveTime: null,
    hasUnsavedChanges: false
  });

  // Quality tracking
  const [qualityEntries, setQualityEntries] = useState<QualityEntry[]>([]);
  const [bulkInput, setBulkInput] = useState<string>('');
  const [showBulkEntry, setShowBulkEntry] = useState(false);
  
  // Performance metrics
  const [hourlyRate, setHourlyRate] = useState(0);
  const [efficiency, setEfficiency] = useState(0);
  const [qualityRate, setQualityRate] = useState(100);
  const [sessionStartTime] = useState<Date>(new Date());

  // Auto-save mutation
  const saveProgressMutation = useMutation({
    mutationFn: async (progressData: {
      completed: number;
      defects: number;
      rework: number;
      entries: QualityEntry[];
    }) => {
      // Implementation would save to Firebase
      const saveData = {
        workItemId,
        operatorId,
        sessionId,
        progress: progressData,
        timestamp: new Date(),
        batchNumber: counting.currentBatch
      };
      
      // Mock save operation
      await new Promise(resolve => setTimeout(resolve, 500));
      return saveData;
    },
    onSuccess: () => {
      setCounting(prev => ({
        ...prev,
        lastSaveTime: new Date(),
        hasUnsavedChanges: false
      }));
    }
  });

  // Counting functions
  const incrementPieces = useCallback((type: 'completed' | 'defective' | 'rework', count: number = 1) => {
    setCounting(prev => {
      const updated = { ...prev };
      
      switch (type) {
        case 'completed':
          updated.completedPieces += count;
          break;
        case 'defective':
          updated.defectivePieces += count;
          // Quality issue detection
          if (updated.defectivePieces > 0 && prev.defectivePieces === 0) {
            onQualityIssue?.({
              id: Date.now().toString(),
              workItemId,
              operatorId,
              issueType: 'defective_pieces',
              description: 'Defective pieces detected',
              severity: 'medium',
              reportedAt: new Date(),
              status: 'open'
            });
          }
          break;
        case 'rework':
          updated.reworkPieces += count;
          break;
      }
      
      updated.totalProcessed = updated.completedPieces + updated.defectivePieces + updated.reworkPieces;
      updated.hasUnsavedChanges = true;
      
      return updated;
    });

    // Add quality entry
    const entry: QualityEntry = {
      type,
      count,
      timestamp: new Date(),
      batchNumber: counting.currentBatch
    };
    
    setQualityEntries(prev => [...prev, entry]);

    // Check if target reached
    const newCompleted = counting.completedPieces + (type === 'completed' ? count : 0);
    if (newCompleted >= targetQuantity) {
      onTargetReached?.();
    }
  }, [counting.currentBatch, counting.completedPieces, workItemId, operatorId, targetQuantity, onQualityIssue, onTargetReached]);

  const decrementPieces = useCallback((type: 'completed' | 'defective' | 'rework') => {
    setCounting(prev => {
      const updated = { ...prev };
      
      switch (type) {
        case 'completed':
          if (updated.completedPieces > 0) updated.completedPieces--;
          break;
        case 'defective':
          if (updated.defectivePieces > 0) updated.defectivePieces--;
          break;
        case 'rework':
          if (updated.reworkPieces > 0) updated.reworkPieces--;
          break;
      }
      
      updated.totalProcessed = updated.completedPieces + updated.defectivePieces + updated.reworkPieces;
      updated.hasUnsavedChanges = true;
      
      return updated;
    });
  }, []);

  const resetCount = useCallback(() => {
    setCounting(prev => ({
      ...prev,
      completedPieces: 0,
      defectivePieces: 0,
      reworkPieces: 0,
      totalProcessed: 0,
      hasUnsavedChanges: true
    }));
    setQualityEntries([]);
  }, []);

  // Bulk entry handling
  const handleBulkEntry = useCallback(() => {
    const count = parseInt(bulkInput);
    if (!isNaN(count) && count > 0) {
      incrementPieces('completed', count);
      setBulkInput('');
      setShowBulkEntry(false);
    }
  }, [bulkInput, incrementPieces]);

  // Calculate metrics
  useEffect(() => {
    const elapsedHours = (Date.now() - sessionStartTime.getTime()) / (1000 * 60 * 60);
    if (elapsedHours > 0) {
      setHourlyRate(counting.completedPieces / elapsedHours);
    }

    // Calculate efficiency based on target rate
    const targetRate = workItem.targetRate || 10; // pieces per hour
    const currentRate = counting.completedPieces / Math.max(elapsedHours, 0.1);
    setEfficiency((currentRate / targetRate) * 100);

    // Calculate quality rate
    if (counting.totalProcessed > 0) {
      setQualityRate((counting.completedPieces / counting.totalProcessed) * 100);
    }

    // Trigger progress update
    onProgressUpdate?.(counting.completedPieces, counting.defectivePieces);
  }, [counting, sessionStartTime, workItem.targetRate, onProgressUpdate]);

  // Auto-save setup
  useEffect(() => {
    if (counting.hasUnsavedChanges) {
      if (autoSaveInterval.current) {
        clearTimeout(autoSaveInterval.current);
      }
      
      autoSaveInterval.current = setTimeout(() => {
        saveProgressMutation.mutate({
          completed: counting.completedPieces,
          defects: counting.defectivePieces,
          rework: counting.reworkPieces,
          entries: qualityEntries
        });
      }, config.production.session.autoSaveInterval);
    }

    return () => {
      if (autoSaveInterval.current) {
        clearTimeout(autoSaveInterval.current);
      }
    };
  }, [counting.hasUnsavedChanges, counting.completedPieces, counting.defectivePieces, counting.reworkPieces, qualityEntries, config.production.session.autoSaveInterval, saveProgressMutation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveInterval.current) {
        clearTimeout(autoSaveInterval.current);
      }
    };
  }, []);

  // Calculate percentages
  const progressPercentage = Math.min((counting.completedPieces / targetQuantity) * 100, 100);
  const qualityPercentage = counting.totalProcessed > 0 ? (counting.completedPieces / counting.totalProcessed) * 100 : 100;
  const efficiencyColor = efficiency >= 90 ? 'text-green-600' : efficiency >= 70 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="space-y-4">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Progress Tracking
            </div>
            <Badge 
              variant={counting.hasUnsavedChanges ? "destructive" : "default"}
              className="flex items-center gap-1"
            >
              {counting.hasUnsavedChanges ? (
                <>
                  <AlertTriangle className="h-3 w-3" />
                  Unsaved
                </>
              ) : (
                <>
                  <Check className="h-3 w-3" />
                  Saved
                </>
              )}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Main Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Completed Pieces</span>
                <span className="font-medium">{counting.completedPieces} / {targetQuantity}</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <div className="text-xs text-muted-foreground mt-1">
                {Math.round(progressPercentage)}% Complete
              </div>
            </div>

            {/* Quality Metrics */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">{counting.completedPieces}</div>
                <div className="text-xs text-muted-foreground">Good Pieces</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-red-600">{counting.defectivePieces}</div>
                <div className="text-xs text-muted-foreground">Defective</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-yellow-600">{counting.reworkPieces}</div>
                <div className="text-xs text-muted-foreground">Rework</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Piece Counting Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Piece Counting</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowBulkEntry(!showBulkEntry)}
            >
              Bulk Entry
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showBulkEntry ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Enter count"
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleBulkEntry()}
                />
                <Button onClick={handleBulkEntry}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Completed Pieces */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Good Pieces</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => decrementPieces('completed')}
                    disabled={counting.completedPieces === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-bold w-8 text-center">{counting.completedPieces}</span>
                  <Button 
                    size="sm"
                    onClick={() => incrementPieces('completed')}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Defective Pieces */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <X className="h-5 w-5 text-red-600" />
                  <span className="font-medium">Defective</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => decrementPieces('defective')}
                    disabled={counting.defectivePieces === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-bold w-8 text-center text-red-600">{counting.defectivePieces}</span>
                  <Button 
                    size="sm"
                    variant="destructive"
                    onClick={() => incrementPieces('defective')}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Rework Pieces */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium">Rework</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => decrementPieces('rework')}
                    disabled={counting.reworkPieces === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-bold w-8 text-center text-yellow-600">{counting.reworkPieces}</span>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => incrementPieces('rework')}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Separator className="my-4" />
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Total Processed: <span className="font-medium">{counting.totalProcessed}</span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetCount}
                disabled={counting.totalProcessed === 0}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
              <Button 
                size="sm"
                onClick={() => saveProgressMutation.mutate({
                  completed: counting.completedPieces,
                  defects: counting.defectivePieces,
                  rework: counting.reworkPieces,
                  entries: qualityEntries
                })}
                disabled={!counting.hasUnsavedChanges || saveProgressMutation.isPending}
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Live Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">Rate</span>
              </div>
              <div className="text-xl font-bold">{hourlyRate.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">pieces/hour</div>
            </div>
            
            <div className="text-center p-3 border rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Efficiency</span>
              </div>
              <div className={`text-xl font-bold ${efficiencyColor}`}>{efficiency.toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground">of target</div>
            </div>
            
            <div className="text-center p-3 border rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Award className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-muted-foreground">Quality</span>
              </div>
              <div className="text-xl font-bold">{qualityPercentage.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">good pieces</div>
            </div>
          </div>

          {counting.lastSaveTime && (
            <div className="mt-4 text-center text-xs text-muted-foreground">
              Last saved: {counting.lastSaveTime.toLocaleTimeString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quality Alerts */}
      {counting.defectivePieces > 0 && qualityPercentage < 95 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Quality rate has dropped to {qualityPercentage.toFixed(1)}%. Please review your work carefully.
          </AlertDescription>
        </Alert>
      )}

      {progressPercentage >= 100 && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4" />
          <AlertDescription>
            Congratulations! You have completed your target quantity. You can continue working or mark this item as complete.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};