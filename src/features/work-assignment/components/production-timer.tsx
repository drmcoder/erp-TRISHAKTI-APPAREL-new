// Production Timer Component
// Real-time work session timer with break management and progress tracking

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Coffee, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  TrendingUp,
  Target,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  WorkSession, 
  Break, 
  WorkItem, 
  ProductionMetrics,
  LiveSession 
} from '../types';
import { productionTrackingLogic } from '../business/production-tracking-logic';
import { getWorkAssignmentConfig } from '../config/work-assignment-config';

interface ProductionTimerProps {
  workItemId: string;
  operatorId: string;
  workItem: WorkItem;
  onSessionUpdate?: (session: LiveSession) => void;
  onBreakRequired?: (breakType: string) => void;
  onProductionAlert?: (alert: { type: string; message: string }) => void;
}

interface TimerState {
  isRunning: boolean;
  startTime: Date | null;
  pausedTime: number;
  currentDuration: number;
  sessionId: string | null;
}

interface BreakTimer {
  type: string;
  startTime: Date;
  duration: number;
  isActive: boolean;
}

export const ProductionTimer: React.FC<ProductionTimerProps> = ({
  workItemId,
  operatorId,
  workItem,
  onSessionUpdate,
  onBreakRequired,
  onProductionAlert
}) => {
  const queryClient = useQueryClient();
  const config = getWorkAssignmentConfig();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Timer state
  const [timer, setTimer] = useState<TimerState>({
    isRunning: false,
    startTime: null,
    pausedTime: 0,
    currentDuration: 0,
    sessionId: null
  });

  // Break management
  const [activeBreak, setActiveBreak] = useState<BreakTimer | null>(null);
  const [breakHistory, setBreakHistory] = useState<Break[]>([]);
  
  // Production metrics
  const [currentMetrics, setCurrentMetrics] = useState<ProductionMetrics | null>(null);
  const [completedPieces, setCompletedPieces] = useState(0);
  const [targetPieces, setTargetPieces] = useState(workItem.targetQuantity || 0);

  // Alerts and notifications
  const [alerts, setAlerts] = useState<Array<{ type: string; message: string; id: string }>>([]);

  // Get current session data
  const { data: currentSession } = useQuery({
    queryKey: ['workSession', workItemId, operatorId],
    queryFn: async () => {
      // Implementation would fetch from Firebase
      return null as LiveSession | null;
    },
    refetchInterval: 5000
  });

  // Start work session mutation
  const startSessionMutation = useMutation({
    mutationFn: async () => {
      const sessionData = {
        workItemId,
        operatorId,
        startTime: new Date(),
        status: 'active' as const,
        targetQuantity: workItem.targetQuantity,
        completedQuantity: 0
      };
      
      // Implementation would save to Firebase and return session ID
      return 'session_' + Date.now();
    },
    onSuccess: (sessionId) => {
      setTimer(prev => ({
        ...prev,
        isRunning: true,
        startTime: new Date(),
        sessionId
      }));
      
      startTimer();
    }
  });

  // Pause/resume session mutation
  const pauseSessionMutation = useMutation({
    mutationFn: async (pause: boolean) => {
      if (!timer.sessionId) throw new Error('No active session');
      
      // Implementation would update Firebase
      return { paused: pause };
    },
    onSuccess: (data) => {
      if (data.paused) {
        pauseTimer();
      } else {
        resumeTimer();
      }
    }
  });

  // Complete session mutation
  const completeSessionMutation = useMutation({
    mutationFn: async () => {
      if (!timer.sessionId) throw new Error('No active session');
      
      const sessionData = {
        sessionId: timer.sessionId,
        endTime: new Date(),
        totalDuration: timer.currentDuration + timer.pausedTime,
        completedQuantity: completedPieces,
        breaks: breakHistory,
        metrics: currentMetrics
      };
      
      // Implementation would save to Firebase
      return sessionData;
    },
    onSuccess: () => {
      stopTimer();
      setAlerts(prev => [...prev, {
        id: Date.now().toString(),
        type: 'success',
        message: 'Work session completed successfully!'
      }]);
    }
  });

  // Timer functions
  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      setTimer(prev => {
        if (!prev.startTime || !prev.isRunning) return prev;
        
        const now = Date.now();
        const elapsed = now - prev.startTime.getTime();
        const currentDuration = elapsed + prev.pausedTime;
        
        return {
          ...prev,
          currentDuration
        };
      });
    }, 1000);
  }, []);

  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setTimer(prev => ({
      ...prev,
      isRunning: false,
      pausedTime: prev.currentDuration
    }));
  }, []);

  const resumeTimer = useCallback(() => {
    setTimer(prev => ({
      ...prev,
      isRunning: true,
      startTime: new Date()
    }));
    startTimer();
  }, [startTimer]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setTimer({
      isRunning: false,
      startTime: null,
      pausedTime: 0,
      currentDuration: 0,
      sessionId: null
    });
  }, []);

  // Break management functions
  const startBreak = useCallback((breakType: string) => {
    const breakConfig = config.production.breaks.required[breakType as keyof typeof config.production.breaks.required];
    
    if (!breakConfig) return;
    
    // Pause work timer
    if (timer.isRunning) {
      pauseTimer();
    }
    
    // Start break timer
    setActiveBreak({
      type: breakType,
      startTime: new Date(),
      duration: breakConfig.duration * 60 * 1000, // Convert minutes to milliseconds
      isActive: true
    });
    
    setAlerts(prev => [...prev, {
      id: Date.now().toString(),
      type: 'info',
      message: `${breakType} break started - ${breakConfig.duration} minutes`
    }]);
  }, [timer.isRunning, pauseTimer, config]);

  const endBreak = useCallback(() => {
    if (!activeBreak) return;
    
    const breakDuration = Date.now() - activeBreak.startTime.getTime();
    const newBreak: Break = {
      id: Date.now().toString(),
      type: activeBreak.type,
      startTime: activeBreak.startTime,
      endTime: new Date(),
      duration: breakDuration,
      isPaid: config.production.breaks.required[activeBreak.type as keyof typeof config.production.breaks.required]?.isPaid || false
    };
    
    setBreakHistory(prev => [...prev, newBreak]);
    setActiveBreak(null);
    
    // Resume work timer
    resumeTimer();
    
    setAlerts(prev => [...prev, {
      id: Date.now().toString(),
      type: 'success',
      message: `${activeBreak.type} break completed`
    }]);
  }, [activeBreak, resumeTimer, config]);

  // Production metrics calculation
  useEffect(() => {
    if (!timer.isRunning || timer.currentDuration === 0) return;
    
    const context = {
      workItemId,
      operatorId,
      currentSession: {
        startTime: timer.startTime!,
        duration: timer.currentDuration,
        completedQuantity: completedPieces,
        targetQuantity: targetPieces,
        breaks: breakHistory
      },
      workItem,
      completedPieces,
      targetPieces
    };
    
    const evaluation = productionTrackingLogic.evaluateProduction(context);
    setCurrentMetrics(evaluation.metrics);
    
    // Handle alerts
    evaluation.actions.forEach(action => {
      if (action.type === 'alert' && action.priority === 'high') {
        setAlerts(prev => [...prev, {
          id: Date.now().toString() + action.type,
          type: 'warning',
          message: action.message
        }]);
        
        onProductionAlert?.({
          type: action.actionType,
          message: action.message
        });
      }
    });
    
    // Check break requirements
    const hoursWorked = timer.currentDuration / (1000 * 60 * 60);
    if (hoursWorked >= 2 && !breakHistory.some(b => b.type === 'tea')) {
      onBreakRequired?.('tea');
    } else if (hoursWorked >= 6 && !breakHistory.some(b => b.type === 'lunch')) {
      onBreakRequired?.('lunch');
    }
    
  }, [timer.currentDuration, completedPieces, targetPieces, breakHistory, workItemId, operatorId, workItem, onProductionAlert, onBreakRequired]);

  // Format time display
  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor((milliseconds / 1000) % 60);
    const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate efficiency percentage
  const efficiencyPercentage = currentMetrics?.efficiency ? Math.round(currentMetrics.efficiency * 100) : 0;
  const qualityPercentage = currentMetrics?.quality ? Math.round(currentMetrics.quality * 100) : 0;
  const progressPercentage = targetPieces > 0 ? Math.round((completedPieces / targetPieces) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Timer Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Work Session Timer
            {timer.isRunning && (
              <Badge variant="default" className="animate-pulse">ACTIVE</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <div className="text-4xl font-mono font-bold text-primary mb-2">
              {formatTime(timer.currentDuration)}
            </div>
            {timer.pausedTime > 0 && (
              <div className="text-sm text-muted-foreground">
                Paused time: {formatTime(timer.pausedTime)}
              </div>
            )}
          </div>
          
          <div className="flex gap-2 justify-center mb-4">
            {!timer.isRunning && !timer.sessionId ? (
              <Button 
                onClick={() => startSessionMutation.mutate()}
                disabled={startSessionMutation.isPending}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Start Work
              </Button>
            ) : (
              <>
                {timer.isRunning ? (
                  <Button 
                    onClick={() => pauseSessionMutation.mutate(true)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Pause className="h-4 w-4" />
                    Pause
                  </Button>
                ) : (
                  <Button 
                    onClick={() => pauseSessionMutation.mutate(false)}
                    className="flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Resume
                  </Button>
                )}
                
                <Button 
                  onClick={() => completeSessionMutation.mutate()}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <Square className="h-4 w-4" />
                  Complete
                </Button>
              </>
            )}
          </div>
          
          {/* Progress Indicators */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{completedPieces} / {targetPieces} pieces</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Efficiency</span>
                  <span>{efficiencyPercentage}%</span>
                </div>
                <Progress 
                  value={efficiencyPercentage} 
                  className={`h-2 ${efficiencyPercentage >= 80 ? 'text-green-500' : efficiencyPercentage >= 60 ? 'text-yellow-500' : 'text-red-500'}`} 
                />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Quality</span>
                  <span>{qualityPercentage}%</span>
                </div>
                <Progress 
                  value={qualityPercentage} 
                  className={`h-2 ${qualityPercentage >= 90 ? 'text-green-500' : qualityPercentage >= 75 ? 'text-yellow-500' : 'text-red-500'}`} 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Break Management */}
      {activeBreak ? (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coffee className="h-5 w-5 text-orange-500" />
                <span className="font-medium capitalize">{activeBreak.type} Break</span>
                <Badge variant="outline">Active</Badge>
              </div>
              <Button onClick={endBreak} size="sm">
                End Break
              </Button>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Started: {activeBreak.startTime.toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Break Management</span>
              <div className="flex gap-2">
                <Button 
                  onClick={() => startBreak('tea')} 
                  size="sm" 
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <Coffee className="h-3 w-3" />
                  Tea (15min)
                </Button>
                <Button 
                  onClick={() => startBreak('lunch')} 
                  size="sm" 
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <Coffee className="h-3 w-3" />
                  Lunch (60min)
                </Button>
              </div>
            </div>
            
            {breakHistory.length > 0 && (
              <div className="mt-3 text-sm">
                <span className="text-muted-foreground">Breaks taken: </span>
                {breakHistory.map((break_, index) => (
                  <Badge key={index} variant="secondary" className="mr-1">
                    {break_.type} ({Math.round(break_.duration / (1000 * 60))}min)
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      {currentMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Live Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="text-sm text-muted-foreground">Efficiency</div>
                  <div className="font-semibold">{Math.round(currentMetrics.efficiency * 100)}%</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-green-500" />
                <div>
                  <div className="text-sm text-muted-foreground">Quality</div>
                  <div className="font-semibold">{Math.round(currentMetrics.quality * 100)}%</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-purple-500" />
                <div>
                  <div className="text-sm text-muted-foreground">Rate</div>
                  <div className="font-semibold">{currentMetrics.rate.toFixed(1)} pcs/hr</div>
                </div>
              </div>
            </div>
            
            {currentMetrics.estimatedEarnings && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-green-700">Estimated Earnings (Today)</div>
                <div className="text-xl font-bold text-green-800">
                  ৳{currentMetrics.estimatedEarnings.toFixed(2)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Alerts */}
      {alerts.map(alert => (
        <Alert key={alert.id} className={
          alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
          alert.type === 'success' ? 'border-green-200 bg-green-50' :
          'border-blue-200 bg-blue-50'
        }>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
};