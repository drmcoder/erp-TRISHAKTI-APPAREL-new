// Enhanced Operator Dashboard - Bundle-based work selection and piece tracking
// Operators select available bundles and log completed pieces per operation

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/Badge';
import { 
  Play,
  Pause,
  CheckCircle2,
  Clock,
  Package,
  Target,
  IndianRupee,
  TrendingUp,
  AlertCircle,
  User,
  Settings
} from 'lucide-react';
// WORKAROUND: Define types locally due to persistent import issues
import { enhancedProductionService } from '@/services/enhanced-production-service';

// Local type definitions (temporary workaround)
interface ProductionBundle {
  id: string;
  bundleNumber: string;
  lotNumber: string;
  articleNumber: string;
  color: string;
  size: string;
  pieces: number;
  currentStep: number;
  processSteps: BundleProcessStep[];
  status: 'ready' | 'in_progress' | 'completed' | 'on_hold';
  assignedOperators: string[];
  createdAt: any;
  startedAt?: any;
  completedAt?: any;
}

interface BundleProcessStep {
  stepNumber: number;
  operation: string;
  operationNepali: string;
  machineType: string;
  pricePerPiece: number;
  estimatedMinutes: number;
  canRunParallel: boolean;
  dependencies: number[];
  status: 'waiting' | 'ready' | 'in_progress' | 'completed' | 'skipped';
  assignedOperator?: string;
  completedPieces: number;
  startTime?: any;
  endTime?: any;
  qualityNotes?: string;
}

interface OperatorWorkSession {
  id: string;
  operatorId: string;
  bundleId: string;
  stepNumber: number;
  startTime: any;
  endTime?: any;
  completedPieces: number;
  qualityScore?: number;
  notes?: string;
}
import { toast } from 'sonner';
import { format } from 'date-fns';

interface EnhancedOperatorDashboardProps {
  operatorId: string;
  operatorName: string;
  machineTypes: string[]; // Operator's machine skills
}

const MACHINE_TYPE_COLORS = {
  single_needle: 'bg-blue-100 text-blue-800',
  overlock: 'bg-green-100 text-green-800',
  flatlock: 'bg-purple-100 text-purple-800',
  buttonhole: 'bg-orange-100 text-orange-800',
  button_attach: 'bg-pink-100 text-pink-800',
  cutting: 'bg-gray-100 text-gray-800',
  finishing: 'bg-indigo-100 text-indigo-800'
};

const MACHINE_TYPE_NEPALI = {
  single_needle: 'सिंगल निडल',
  overlock: 'ओभरलक',
  flatlock: 'फ्ल्यालक',
  buttonhole: 'बटन होल',
  button_attach: 'बटन एट्याच',
  cutting: 'काटने',
  finishing: 'फिनिशिङ'
};

export const EnhancedOperatorDashboard: React.FC<EnhancedOperatorDashboardProps> = ({
  operatorId,
  operatorName,
  machineTypes
}) => {
  const [availableWork, setAvailableWork] = useState<{bundle: ProductionBundle, step: BundleProcessStep}[]>([]);
  const [currentSession, setCurrentSession] = useState<OperatorWorkSession | null>(null);
  const [todaySessions, setTodaySessions] = useState<OperatorWorkSession[]>([]);
  const [completedPieces, setCompletedPieces] = useState<number>(0);
  const [qualityNotes, setQualityNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAvailableWork();
    loadTodaySessions();
    
    // Load current session if operator has active work
    // In real app, this would check for active sessions
  }, [operatorId]);

  const loadAvailableWork = async () => {
    try {
      setLoading(true);
      const work = await enhancedProductionService.getAvailableWorkForOperator(operatorId, machineTypes);
      setAvailableWork(work);
    } catch (error) {
      console.error('Error loading available work:', error);
      toast.error('Failed to load available work');
    } finally {
      setLoading(false);
    }
  };

  const loadTodaySessions = async () => {
    try {
      const today = new Date();
      const monthlyWork = await enhancedProductionService.getOperatorMonthlyWork(
        operatorId, 
        today.getMonth() + 1, 
        today.getFullYear()
      );
      
      // Filter for today's sessions
      const todaySessions = monthlyWork.sessions.filter(session => {
        const sessionDate = new Date(session.workDate.toDate());
        return sessionDate.toDateString() === today.toDateString();
      });
      
      setTodaySessions(todaySessions);
    } catch (error) {
      console.error('Error loading today sessions:', error);
    }
  };

  const startWork = async (bundle: ProductionBundle, step: BundleProcessStep) => {
    try {
      const session = await enhancedProductionService.assignBundleStepToOperator(
        bundle.id,
        step.stepNumber,
        operatorId,
        operatorName
      );
      
      setCurrentSession(session);
      setCompletedPieces(0);
      setQualityNotes('');
      
      toast.success(`Started ${step.operation} on ${bundle.bundleNumber}`);
      
      // Refresh available work
      loadAvailableWork();
    } catch (error) {
      console.error('Error starting work:', error);
      toast.error('Failed to start work');
    }
  };

  const completeWork = async () => {
    if (!currentSession || completedPieces === 0) {
      toast.error('Please enter completed pieces');
      return;
    }

    if (completedPieces > currentSession.assignedPieces) {
      toast.error(`Cannot exceed assigned pieces (${currentSession.assignedPieces})`);
      return;
    }

    try {
      await enhancedProductionService.completeOperatorWork(
        currentSession.id,
        completedPieces,
        qualityNotes
      );
      
      const earnings = completedPieces * currentSession.pricePerPiece;
      toast.success(`Completed ${completedPieces} pieces - Earned Rs. ${earnings.toFixed(2)}`);
      
      // Reset current work
      setCurrentSession(null);
      setCompletedPieces(0);
      setQualityNotes('');
      
      // Refresh data
      loadAvailableWork();
      loadTodaySessions();
    } catch (error) {
      console.error('Error completing work:', error);
      toast.error('Failed to complete work');
    }
  };

  const pauseWork = () => {
    setCurrentSession(null);
    toast.info('Work paused - you can resume later');
  };

  // Calculate today's totals
  const todayTotalPieces = todaySessions.reduce((sum, session) => sum + session.completedPieces, 0);
  const todayTotalEarnings = todaySessions.reduce((sum, session) => sum + session.totalEarning, 0);

  return (
    <div className="space-y-6">
      {/* Operator Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                {operatorName}
              </CardTitle>
              <CardDescription>
                Machine Skills: {machineTypes.map(type => MACHINE_TYPE_NEPALI[type] || type).join(', ')}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {machineTypes.map(type => (
                <Badge key={type} className={MACHINE_TYPE_COLORS[type]}>
                  {MACHINE_TYPE_NEPALI[type] || type}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Daily Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Today's Pieces
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayTotalPieces}</div>
            <p className="text-xs text-muted-foreground">Completed today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <IndianRupee className="h-4 w-4 mr-2" />
              Today's Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {todayTotalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total earned today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Work Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaySessions.length}</div>
            <p className="text-xs text-muted-foreground">
              {currentSession ? 'Active work in progress' : 'No active work'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Current Work Section */}
      {currentSession ? (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Play className="h-5 w-5 mr-2 text-green-600" />
                  Active Work
                </CardTitle>
                <CardDescription>
                  Bundle: {currentSession.bundleNumber} | Operation: {currentSession.operation}
                </CardDescription>
              </div>
              <Badge className="bg-green-100 text-green-800">
                In Progress
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">Machine Type</Label>
                <Badge className={MACHINE_TYPE_COLORS[currentSession.machineType]}>
                  {MACHINE_TYPE_NEPALI[currentSession.machineType] || currentSession.machineType}
                </Badge>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Assigned Pieces</Label>
                <div className="font-medium">{currentSession.assignedPieces} pcs</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Rate</Label>
                <div className="font-medium">Rs. {currentSession.pricePerPiece} / piece</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Potential Earning</Label>
                <div className="font-medium text-green-600">
                  Rs. {(currentSession.assignedPieces * currentSession.pricePerPiece).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="completedPieces">Completed Pieces*</Label>
                <Input
                  id="completedPieces"
                  type="number"
                  min="0"
                  max={currentSession.assignedPieces}
                  value={completedPieces}
                  onChange={(e) => setCompletedPieces(parseInt(e.target.value) || 0)}
                  placeholder="Enter completed pieces"
                />
                <div className="text-xs text-muted-foreground">
                  Max: {currentSession.assignedPieces} pieces | 
                  Earnings: Rs. {(completedPieces * currentSession.pricePerPiece).toFixed(2)}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="qualityNotes">Quality Notes (Optional)</Label>
                <Input
                  id="qualityNotes"
                  value={qualityNotes}
                  onChange={(e) => setQualityNotes(e.target.value)}
                  placeholder="Any quality issues..."
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={completeWork} disabled={completedPieces === 0}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Complete Work
              </Button>
              <Button variant="outline" onClick={pauseWork}>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Available Work Selection */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Available Work
            </CardTitle>
            <CardDescription>
              Select a bundle and operation to start working
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading available work...</p>
              </div>
            ) : availableWork.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>No work available for your machine types</p>
                <p className="text-sm">Check back later for new assignments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableWork.map(({ bundle, step }, index) => (
                  <div key={`${bundle.id}-${step.stepNumber}`} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="font-mono">
                          {bundle.bundleNumber}
                        </Badge>
                        <div>
                          <div className="font-medium">
                            {step.operation} ({step.operationNepali})
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {bundle.color} {bundle.size} - {bundle.pieces} pieces
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">
                          Rs. {step.pricePerPiece} / piece
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total: Rs. {(bundle.pieces * step.pricePerPiece).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm">
                        <Badge className={MACHINE_TYPE_COLORS[step.machineType]}>
                          {MACHINE_TYPE_NEPALI[step.machineType] || step.machineType}
                        </Badge>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {step.estimatedMinutes} min
                        </span>
                        <span>Step {step.stepNumber}</span>
                      </div>
                      
                      <Button onClick={() => startWork(bundle, step)}>
                        <Play className="h-4 w-4 mr-2" />
                        Start Work
                      </Button>
                    </div>

                    {/* Show dependencies if any */}
                    {step.dependencies.length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Requires completion of steps: {step.dependencies.join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Today's Work History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Today's Work History
          </CardTitle>
          <CardDescription>
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todaySessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No work completed today</p>
              <p className="text-sm">Start working to see your progress here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todaySessions.map(session => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge className={MACHINE_TYPE_COLORS[session.machineType]}>
                      {MACHINE_TYPE_NEPALI[session.machineType] || session.machineType}
                    </Badge>
                    <div>
                      <div className="font-medium">
                        {session.operation} - {session.bundleNumber}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {session.completedPieces} / {session.assignedPieces} pieces
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">Rs. {session.totalEarning.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      Rs. {session.pricePerPiece} × {session.completedPieces}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedOperatorDashboard;