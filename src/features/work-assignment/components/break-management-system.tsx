// Break Management System Component
// Comprehensive break management with compliance tracking and automated reminders

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Coffee, 
  Clock, 
  Play, 
  Pause, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Timer,
  Bell,
  Users,
  TrendingUp,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Progress } from '@/shared/components/ui/progress';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Separator } from '@/shared/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { 
  Break, 
  BreakCompliance, 
  WorkSession,
  BreakRule,
  OperatorSummary 
} from '../types';
import { productionTrackingLogic } from '../business/production-tracking-logic';
import { getWorkAssignmentConfig, getBreakRequirements } from '../config/work-assignment-config';

interface BreakManagementSystemProps {
  operatorId: string;
  operatorName: string;
  sessionId: string | null;
  sessionStartTime: Date | null;
  workDuration: number; // in milliseconds
  onBreakStart?: (breakType: string) => void;
  onBreakEnd?: (breakData: Break) => void;
  onComplianceAlert?: (alert: { type: string; message: string; severity: 'low' | 'medium' | 'high' }) => void;
}

interface ActiveBreak {
  id: string;
  type: string;
  startTime: Date;
  expectedDuration: number; // in minutes
  isPaid: boolean;
  isOvertime: boolean;
}

interface BreakTimer {
  remainingTime: number;
  isRunning: boolean;
}

export const BreakManagementSystem: React.FC<BreakManagementSystemProps> = ({
  operatorId,
  operatorName,
  sessionId,
  sessionStartTime,
  workDuration,
  onBreakStart,
  onBreakEnd,
  onComplianceAlert
}) => {
  const queryClient = useQueryClient();
  const config = getWorkAssignmentConfig();
  const breakRequirements = getBreakRequirements();
  
  // Break state
  const [activeBreak, setActiveBreak] = useState<ActiveBreak | null>(null);
  const [breakTimer, setBreakTimer] = useState<BreakTimer>({ remainingTime: 0, isRunning: false });
  const [todayBreaks, setTodayBreaks] = useState<Break[]>([]);
  const [breakCompliance, setBreakCompliance] = useState<BreakCompliance | null>(null);
  const [pendingReminders, setPendingReminders] = useState<string[]>([]);

  // Get today's break history
  const { data: breakHistory } = useQuery({
    queryKey: ['breakHistory', operatorId, new Date().toDateString()],
    queryFn: async () => {
      // Implementation would fetch from Firebase
      return [] as Break[];
    },
    refetchInterval: 30000
  });

  // Start break mutation
  const startBreakMutation = useMutation({
    mutationFn: async (breakType: string) => {
      const breakRule = breakRequirements[breakType as keyof typeof breakRequirements];
      if (!breakRule) throw new Error('Invalid break type');

      const breakData: ActiveBreak = {
        id: `break_${Date.now()}`,
        type: breakType,
        startTime: new Date(),
        expectedDuration: breakRule.duration,
        isPaid: breakRule.isPaid,
        isOvertime: false
      };

      // Implementation would save to Firebase
      return breakData;
    },
    onSuccess: (breakData) => {
      setActiveBreak(breakData);
      setBreakTimer({
        remainingTime: breakData.expectedDuration * 60, // Convert to seconds
        isRunning: true
      });
      onBreakStart?.(breakData.type);
    }
  });

  // End break mutation
  const endBreakMutation = useMutation({
    mutationFn: async () => {
      if (!activeBreak) throw new Error('No active break');

      const endTime = new Date();
      const actualDuration = endTime.getTime() - activeBreak.startTime.getTime();

      const completedBreak: Break = {
        id: activeBreak.id,
        operatorId,
        sessionId: sessionId || '',
        type: activeBreak.type,
        startTime: activeBreak.startTime,
        endTime,
        duration: actualDuration,
        expectedDuration: activeBreak.expectedDuration * 60 * 1000,
        isPaid: activeBreak.isPaid,
        isOvertime: actualDuration > (activeBreak.expectedDuration * 60 * 1000 * 1.1), // 10% tolerance
        notes: ''
      };

      // Implementation would save to Firebase
      return completedBreak;
    },
    onSuccess: (completedBreak) => {
      setTodayBreaks(prev => [...prev, completedBreak]);
      setActiveBreak(null);
      setBreakTimer({ remainingTime: 0, isRunning: false });
      onBreakEnd?.(completedBreak);
      
      // Remove reminder if this break satisfies it
      setPendingReminders(prev => prev.filter(r => r !== completedBreak.type));
    }
  });

  // Break timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (breakTimer.isRunning && breakTimer.remainingTime > 0) {
      interval = setInterval(() => {
        setBreakTimer(prev => ({
          ...prev,
          remainingTime: Math.max(0, prev.remainingTime - 1)
        }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [breakTimer.isRunning, breakTimer.remainingTime]);

  // Break compliance monitoring
  useEffect(() => {
    if (!sessionStartTime || workDuration === 0) return;

    const workHours = workDuration / (1000 * 60 * 60);
    const compliance = productionTrackingLogic.checkBreakCompliance({
      workDuration,
      breaks: todayBreaks,
      sessionStartTime,
      operatorId
    });

    setBreakCompliance(compliance);

    // Generate break reminders
    const newReminders: string[] = [];

    // Tea break after 4 hours
    if (workHours >= 4 && !todayBreaks.some(b => b.type === 'tea') && !pendingReminders.includes('tea')) {
      newReminders.push('tea');
      onComplianceAlert?.({
        type: 'break_reminder',
        message: 'Tea break is now required (4+ hours worked)',
        severity: 'medium'
      });
    }

    // Lunch break after 6 hours
    if (workHours >= 6 && !todayBreaks.some(b => b.type === 'lunch') && !pendingReminders.includes('lunch')) {
      newReminders.push('lunch');
      onComplianceAlert?.({
        type: 'break_reminder',
        message: 'Lunch break is now required (6+ hours worked)',
        severity: 'high'
      });
    }

    // Afternoon break after 8 hours
    if (workHours >= 8 && !todayBreaks.some(b => b.type === 'afternoon') && !pendingReminders.includes('afternoon')) {
      newReminders.push('afternoon');
      onComplianceAlert?.({
        type: 'break_reminder',
        message: 'Afternoon break is now required (8+ hours worked)',
        severity: 'medium'
      });
    }

    if (newReminders.length > 0) {
      setPendingReminders(prev => [...prev, ...newReminders]);
    }
  }, [workDuration, todayBreaks, sessionStartTime, operatorId, pendingReminders, onComplianceAlert]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (milliseconds: number): string => {
    const minutes = Math.round(milliseconds / (1000 * 60));
    return `${minutes} min`;
  };

  // Get break type display info
  const getBreakInfo = (type: string) => {
    const rule = breakRequirements[type as keyof typeof breakRequirements];
    return {
      name: type.charAt(0).toUpperCase() + type.slice(1),
      duration: rule?.duration || 15,
      isPaid: rule?.isPaid || false,
      icon: Coffee
    };
  };

  // Check if break is overdue
  const isBreakOverdue = (type: string): boolean => {
    if (!sessionStartTime) return false;
    
    const workHours = workDuration / (1000 * 60 * 60);
    const rule = breakRequirements[type as keyof typeof breakRequirements];
    const hasBreak = todayBreaks.some(b => b.type === type);
    
    if (!rule || hasBreak) return false;
    
    return workHours >= rule.requiredAfterHours + 1; // 1 hour grace period
  };

  const workHours = sessionStartTime ? workDuration / (1000 * 60 * 60) : 0;
  const totalBreakTime = todayBreaks.reduce((total, break_) => total + break_.duration, 0);
  const paidBreakTime = todayBreaks.filter(b => b.isPaid).reduce((total, break_) => total + break_.duration, 0);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Break</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Active Break Tab */}
        <TabsContent value="active" className="space-y-4">
          {activeBreak ? (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coffee className="h-5 w-5 text-orange-600" />
                    <span className="capitalize">{activeBreak.type} Break</span>
                    <Badge variant="secondary" className="animate-pulse">Active</Badge>
                  </div>
                  {activeBreak.isPaid && (
                    <Badge variant="default">Paid</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Break Timer */}
                  <div className="text-center">
                    <div className="text-3xl font-mono font-bold text-orange-600 mb-2">
                      {formatTime(breakTimer.remainingTime)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Expected: {activeBreak.expectedDuration} minutes
                    </div>
                    <Progress 
                      value={((activeBreak.expectedDuration * 60 - breakTimer.remainingTime) / (activeBreak.expectedDuration * 60)) * 100} 
                      className="mt-2"
                    />
                  </div>

                  {/* Break Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Started:</span>
                      <div className="font-medium">{activeBreak.startTime.toLocaleTimeString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <div className="font-medium capitalize">{activeBreak.type}</div>
                    </div>
                  </div>

                  <Button 
                    onClick={() => endBreakMutation.mutate()}
                    disabled={endBreakMutation.isPending}
                    className="w-full"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    End Break
                  </Button>

                  {breakTimer.remainingTime === 0 && (
                    <Alert className="border-orange-200">
                      <Bell className="h-4 w-4" />
                      <AlertDescription>
                        Your break time is up! Click "End Break" to resume work.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coffee className="h-5 w-5" />
                  Start Break
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(breakRequirements).map(([type, rule]) => {
                    const hasBreak = todayBreaks.some(b => b.type === type);
                    const isPending = pendingReminders.includes(type);
                    const isOverdue = isBreakOverdue(type);

                    return (
                      <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Coffee className={`h-4 w-4 ${hasBreak ? 'text-green-600' : isPending ? 'text-orange-600' : 'text-gray-400'}`} />
                          <div>
                            <div className="font-medium capitalize flex items-center gap-2">
                              {type}
                              {rule.isPaid && <Badge variant="outline" className="text-xs">Paid</Badge>}
                              {isOverdue && <Badge variant="destructive" className="text-xs">Overdue</Badge>}
                              {isPending && <Badge variant="default" className="text-xs animate-pulse">Required</Badge>}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {rule.duration} minutes • Required after {rule.requiredAfterHours}h
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {hasBreak ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Button 
                              onClick={() => startBreakMutation.mutate(type)}
                              disabled={startBreakMutation.isPending}
                              variant={isPending ? "default" : "outline"}
                              size="sm"
                            >
                              {isPending && <Bell className="h-3 w-3 mr-1" />}
                              Start
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compliance Status */}
          {breakCompliance && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Compliance Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Overall Compliance</span>
                    <Badge variant={breakCompliance.isCompliant ? "default" : "destructive"}>
                      {breakCompliance.isCompliant ? 'Compliant' : 'Non-Compliant'}
                    </Badge>
                  </div>

                  {breakCompliance.violations.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-red-600">Violations:</span>
                      {breakCompliance.violations.map((violation, index) => (
                        <Alert key={index} className="border-red-200 bg-red-50">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            {violation}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Break Time:</span>
                      <div className="font-medium">{formatDuration(totalBreakTime)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Paid Break Time:</span>
                      <div className="font-medium">{formatDuration(paidBreakTime)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Break Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                  Work Duration: {workHours.toFixed(1)} hours
                </div>

                <div className="space-y-3">
                  {Object.entries(breakRequirements).map(([type, rule]) => {
                    const scheduledTime = sessionStartTime ? 
                      new Date(sessionStartTime.getTime() + (rule.requiredAfterHours * 60 * 60 * 1000)) : 
                      null;
                    const hasBreak = todayBreaks.some(b => b.type === type);
                    const isPastDue = scheduledTime && new Date() > scheduledTime;

                    return (
                      <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${hasBreak ? 'bg-green-500' : isPastDue ? 'bg-red-500' : 'bg-gray-300'}`} />
                          <div>
                            <div className="font-medium capitalize">{type}</div>
                            <div className="text-sm text-muted-foreground">
                              {scheduledTime ? `Scheduled: ${scheduledTime.toLocaleTimeString()}` : 'Not scheduled'}
                            </div>
                          </div>
                        </div>
                        <Badge variant={hasBreak ? "default" : isPastDue ? "destructive" : "secondary"}>
                          {hasBreak ? 'Completed' : isPastDue ? 'Overdue' : 'Pending'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Today's Break History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayBreaks.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No breaks taken today
                </div>
              ) : (
                <div className="space-y-3">
                  {todayBreaks.map((break_, index) => (
                    <div key={break_.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Coffee className="h-4 w-4 text-blue-600" />
                        <div>
                          <div className="font-medium capitalize">{break_.type}</div>
                          <div className="text-sm text-muted-foreground">
                            {break_.startTime.toLocaleTimeString()} - {break_.endTime.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatDuration(break_.duration)}</div>
                        <div className="text-xs text-muted-foreground">
                          {break_.isPaid ? 'Paid' : 'Unpaid'}
                          {break_.isOvertime && ' • Overtime'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Daily Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold">{todayBreaks.length}</div>
                  <div className="text-sm text-muted-foreground">Breaks Taken</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{formatDuration(totalBreakTime)}</div>
                  <div className="text-sm text-muted-foreground">Total Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};