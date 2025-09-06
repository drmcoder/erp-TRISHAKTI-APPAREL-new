import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Separator } from '@/shared/components/ui/separator';
import { 
  Package, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  PlayCircle,
  PauseCircle,
  Target,
  TrendingUp,
  Calendar,
  MapPin,
  Activity
} from 'lucide-react';
import { bundleService } from '@/services/bundle-service';
import { format, formatDistanceToNow, differenceInHours } from 'date-fns';
import { toast } from 'sonner';

interface BundleProgress {
  bundleId: string;
  orderNumber: string;
  client: string;
  garmentType: string;
  totalPieces: number;
  completedPieces: number;
  currentStage: WorkStage;
  stages: WorkStage[];
  assignedOperators: OperatorAssignment[];
  startDate: Date;
  targetCompletionDate: Date;
  estimatedCompletionDate: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'not_started' | 'in_progress' | 'on_hold' | 'completed' | 'quality_check';
  qualityScore?: number;
  damageReports: number;
  reworkRequired: number;
  totalEarnings: number;
  efficiency: number;
}

interface WorkStage {
  id: string;
  name: string;
  nameNepali: string;
  sequence: number;
  requiredPieces: number;
  completedPieces: number;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  assignedOperatorId?: string;
  operatorName?: string;
  estimatedHours: number;
  actualHours?: number;
  startedAt?: Date;
  completedAt?: Date;
  qualityCheckRequired: boolean;
  qualityScore?: number;
  machineType: string;
}

interface OperatorAssignment {
  operatorId: string;
  operatorName: string;
  stage: string;
  piecesAssigned: number;
  piecesCompleted: number;
  status: 'active' | 'paused' | 'completed';
  startTime: Date;
  expectedCompletion: Date;
  efficiency: number;
}

interface BundleProgressTrackerProps {
  bundleId: string;
  showControls?: boolean;
  compact?: boolean;
}

const STAGE_ICONS = {
  cutting: Package,
  overlock: Activity,
  flatlock: Activity,
  buttonhole: Target,
  button_attach: Target,
  embroidery: TrendingUp,
  quality_check: CheckCircle2,
  finishing: CheckCircle2,
  pressing: CheckCircle2
};

const STATUS_CONFIG = {
  not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-800', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: PlayCircle },
  on_hold: { label: 'On Hold', color: 'bg-yellow-100 text-yellow-800', icon: PauseCircle },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  quality_check: { label: 'Quality Check', color: 'bg-purple-100 text-purple-800', icon: CheckCircle2 }
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'bg-green-100 text-green-800' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800' }
};

export const BundleProgressTracker: React.FC<BundleProgressTrackerProps> = ({
  bundleId,
  showControls = false,
  compact = false
}) => {
  const [bundleProgress, setBundleProgress] = useState<BundleProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<WorkStage | null>(null);

  useEffect(() => {
    loadBundleProgress();
  }, [bundleId]);

  const loadBundleProgress = async () => {
    try {
      setLoading(true);
      const progress = await bundleService.getBundleProgress(bundleId);
      setBundleProgress(progress);
      if (progress.stages.length > 0) {
        setSelectedStage(progress.currentStage);
      }
    } catch (error) {
      console.error('Error loading bundle progress:', error);
      toast.error('Failed to load bundle progress');
    } finally {
      setLoading(false);
    }
  };

  const handleStageAction = async (stageId: string, action: 'start' | 'pause' | 'resume' | 'complete') => {
    try {
      await bundleService.updateStageStatus(bundleId, stageId, action);
      toast.success(`Stage ${action}ed successfully`);
      loadBundleProgress();
    } catch (error) {
      toast.error(`Failed to ${action} stage`);
    }
  };

  const calculateOverallProgress = () => {
    if (!bundleProgress) return 0;
    return (bundleProgress.completedPieces / bundleProgress.totalPieces) * 100;
  };

  const getDelayStatus = () => {
    if (!bundleProgress) return null;
    
    const now = new Date();
    const target = new Date(bundleProgress.targetCompletionDate);
    const estimated = new Date(bundleProgress.estimatedCompletionDate);
    
    if (estimated > target) {
      const delayHours = differenceInHours(estimated, target);
      return {
        isDelayed: true,
        delayHours,
        severity: delayHours > 48 ? 'high' : delayHours > 24 ? 'medium' : 'low'
      };
    }
    
    return { isDelayed: false, delayHours: 0, severity: 'none' };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!bundleProgress) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Bundle Not Found</h3>
          <p className="text-muted-foreground">Unable to load progress for bundle {bundleId}</p>
        </CardContent>
      </Card>
    );
  }

  const overallProgress = calculateOverallProgress();
  const delayStatus = getDelayStatus();
  const statusConfig = STATUS_CONFIG[bundleProgress.status];
  const priorityConfig = PRIORITY_CONFIG[bundleProgress.priority];
  const StatusIcon = statusConfig.icon;

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="font-mono">{bundleProgress.bundleId}</Badge>
              <Badge className={priorityConfig.color}>{priorityConfig.label}</Badge>
              <Badge className={statusConfig.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              {bundleProgress.completedPieces} / {bundleProgress.totalPieces} pieces
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{bundleProgress.client} - {bundleProgress.garmentType}</span>
              <span>{overallProgress.toFixed(1)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Due: {format(new Date(bundleProgress.targetCompletionDate), 'MMM dd')}</span>
              <span>Est: {format(new Date(bundleProgress.estimatedCompletionDate), 'MMM dd')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bundle Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold">{bundleProgress.bundleId}</h2>
                <Badge className={priorityConfig.color}>{priorityConfig.label} Priority</Badge>
                <Badge className={statusConfig.color}>
                  <StatusIcon className="h-4 w-4 mr-1" />
                  {statusConfig.label}
                </Badge>
                {delayStatus?.isDelayed && (
                  <Badge className="bg-red-100 text-red-800">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Delayed {delayStatus.delayHours}h
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Order:</span>
                  <span className="font-medium ml-2">{bundleProgress.orderNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Client:</span>
                  <span className="font-medium ml-2">{bundleProgress.client}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium ml-2">{bundleProgress.garmentType}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold">{overallProgress.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
              <div className="text-xs text-muted-foreground mt-1">
                {bundleProgress.completedPieces} / {bundleProgress.totalPieces} pieces
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Overall Progress Bar */}
          <div className="space-y-2">
            <Progress value={overallProgress} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Started: {format(new Date(bundleProgress.startDate), 'MMM dd, yyyy')}</span>
              <span>Due: {format(new Date(bundleProgress.targetCompletionDate), 'MMM dd, yyyy')}</span>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold">{bundleProgress.efficiency.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Efficiency</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold text-green-600">₹{bundleProgress.totalEarnings.toFixed(0)}</div>
              <div className="text-xs text-muted-foreground">Total Earnings</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold">{bundleProgress.qualityScore?.toFixed(1) || 'N/A'}%</div>
              <div className="text-xs text-muted-foreground">Quality Score</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold text-amber-600">{bundleProgress.damageReports}</div>
              <div className="text-xs text-muted-foreground">Damage Reports</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stage Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Stage Progress</span>
          </CardTitle>
          <CardDescription>
            Track progress through each manufacturing stage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bundleProgress.stages.map((stage, index) => {
              const StageIcon = STAGE_ICONS[stage.machineType as keyof typeof STAGE_ICONS] || Activity;
              const stageProgress = (stage.completedPieces / stage.requiredPieces) * 100;
              const isActive = stage.id === bundleProgress.currentStage?.id;
              const isCompleted = stage.status === 'completed';
              const isBlocked = stage.status === 'blocked';
              
              return (
                <div key={stage.id} className={`border rounded-lg p-4 ${
                  isActive ? 'border-primary bg-primary/5' :
                  isCompleted ? 'border-green-200 bg-green-50' :
                  isBlocked ? 'border-red-200 bg-red-50' : ''
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        isCompleted ? 'bg-green-100 text-green-600' :
                        isActive ? 'bg-primary text-primary-foreground' :
                        isBlocked ? 'bg-red-100 text-red-600' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        <StageIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold">
                          {stage.name}
                          <span className="text-muted-foreground ml-2 text-sm">({stage.nameNepali})</span>
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          {stage.operatorName && (
                            <span className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {stage.operatorName}
                            </span>
                          )}
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {stage.actualHours ? `${stage.actualHours}h` : `Est: ${stage.estimatedHours}h`}
                          </span>
                          {stage.qualityScore && (
                            <span>Quality: {stage.qualityScore.toFixed(1)}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold">{stageProgress.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">
                        {stage.completedPieces} / {stage.requiredPieces} pieces
                      </div>
                      {showControls && stage.status === 'in_progress' && (
                        <div className="flex space-x-1 mt-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStageAction(stage.id, 'pause')}
                          >
                            <PauseCircle className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleStageAction(stage.id, 'complete')}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Progress value={stageProgress} className="h-2 mb-2" />
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {stage.startedAt ? 
                        `Started ${formatDistanceToNow(new Date(stage.startedAt), { addSuffix: true })}` :
                        `Sequence ${stage.sequence}`
                      }
                    </span>
                    <span>
                      {stage.completedAt ? 
                        `Completed ${format(new Date(stage.completedAt), 'MMM dd, HH:mm')}` :
                        stage.status === 'in_progress' ? 'In progress' : 
                        stage.status === 'blocked' ? 'Blocked' : 'Pending'
                      }
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Assigned Operators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Assigned Operators</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bundleProgress.assignedOperators.map(assignment => (
              <div key={assignment.operatorId} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold">{assignment.operatorName}</h4>
                    <p className="text-sm text-muted-foreground">{assignment.stage}</p>
                  </div>
                  <Badge className={
                    assignment.status === 'active' ? 'bg-green-100 text-green-800' :
                    assignment.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }>
                    {assignment.status.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress:</span>
                    <span>{assignment.piecesCompleted} / {assignment.piecesAssigned}</span>
                  </div>
                  <Progress 
                    value={(assignment.piecesCompleted / assignment.piecesAssigned) * 100} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Efficiency: {assignment.efficiency.toFixed(1)}%</span>
                    <span>Due: {format(new Date(assignment.expectedCompletion), 'MMM dd')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BundleProgressTracker;