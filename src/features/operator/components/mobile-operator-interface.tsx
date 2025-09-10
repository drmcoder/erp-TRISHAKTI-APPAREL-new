// Mobile Operator Interface
// Optimized for smartphones with large buttons and simple workflows

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { notify } from '@/utils/notification-utils';
import {
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  QueueListIcon,
  UserIcon,
  CameraIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline';

interface WorkItem {
  id: string;
  bundleId: string;
  operation: string;
  operationNepali: string;
  totalPieces: number;
  completedPieces: number;
  ratePerPiece: number;
  estimatedTimePerPiece: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  machineType: string;
  qualityPoints: string[];
}

interface OperatorStatus {
  id: string;
  name: string;
  shift: 'morning' | 'evening' | 'night';
  line: string;
  currentWork: WorkItem | null;
  todayEarnings: number;
  todayPieces: number;
  todayHours: number;
  efficiency: number;
  status: 'available' | 'working' | 'break' | 'quality_check';
}

interface MobileOperatorInterfaceProps {
  operatorId: string;
  onWorkUpdate: (workId: string, completedPieces: number, qualityIssues?: string[]) => void;
  onStatusChange: (status: OperatorStatus['status']) => void;
}

export const MobileOperatorInterface: React.FC<MobileOperatorInterfaceProps> = ({
  operatorId,
  onWorkUpdate,
  onStatusChange
}) => {
  const [operator, setOperator] = useState<OperatorStatus>({
    id: operatorId,
    name: 'Sunita Devi',
    shift: 'morning',
    line: 'Line A',
    currentWork: {
      id: 'work_001',
      bundleId: 'M-013',
      operation: 'Shoulder Seam',
      operationNepali: 'काँध जोड्ने',
      totalPieces: 50,
      completedPieces: 25,
      ratePerPiece: 3.0,
      estimatedTimePerPiece: 2.5,
      difficulty: 'medium',
      machineType: 'Overlock',
      qualityPoints: [
        'Check seam strength',
        'Ensure proper alignment',
        'No loose threads'
      ]
    },
    todayEarnings: 347,
    todayPieces: 156,
    todayHours: 4.5,
    efficiency: 127,
    status: 'working'
  });

  const [workTimer, setWorkTimer] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showQualityCheck, setShowQualityCheck] = useState(false);
  const [voiceInput, setVoiceInput] = useState(false);

  // Timer for tracking work duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setWorkTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartWork = () => {
    setIsTimerRunning(true);
    setOperator(prev => ({ ...prev, status: 'working' }));
    onStatusChange('working');
  };

  const handleBreak = () => {
    setIsTimerRunning(false);
    setOperator(prev => ({ ...prev, status: 'break' }));
    onStatusChange('break');
  };

  const handleCompleteWork = () => {
    if (operator.currentWork) {
      setShowQualityCheck(true);
    }
  };

  const handleQualitySubmit = (qualityOk: boolean, issues?: string[]) => {
    if (operator.currentWork) {
      const completedPieces = operator.currentWork.totalPieces;
      onWorkUpdate(operator.currentWork.id, completedPieces, issues);
      
      // Update operator stats
      const earnings = completedPieces * operator.currentWork.ratePerPiece;
      setOperator(prev => ({
        ...prev,
        todayEarnings: prev.todayEarnings + earnings,
        todayPieces: prev.todayPieces + completedPieces,
        todayHours: prev.todayHours + (workTimer / 3600),
        currentWork: null, // Work completed
        status: 'available'
      }));
      
      setIsTimerRunning(false);
      setWorkTimer(0);
      setShowQualityCheck(false);
      onStatusChange('available');
    }
  };

  const startVoiceInput = () => {
    setVoiceInput(true);
    // In real implementation, this would start speech recognition
    setTimeout(() => {
      setVoiceInput(false);
      // Simulated voice input result
      notify.info('Voice input: "Work completed, no quality issues"', 'Voice Command');
    }, 3000);
  };

  if (showQualityCheck) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-lg font-bold">
              ✅ Quality Check
            </CardTitle>
            <p className="text-sm text-gray-600">
              Bundle {operator.currentWork?.bundleId} - {operator.currentWork?.operation}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Quality Points to Check:</h4>
              <ul className="space-y-2">
                {operator.currentWork?.qualityPoints.map((point, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <input type="checkbox" id={`quality-${index}`} />
                    <label htmlFor={`quality-${index}`} className="text-sm">
                      {point}
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleQualitySubmit(true)}
                className="bg-green-600 hover:bg-green-700 text-white h-16 text-lg"
              >
                ✅ Quality OK
              </Button>
              <Button
                onClick={() => handleQualitySubmit(false, ['Alignment issue'])}
                variant="outline"
                className="h-16 text-lg border-red-300 text-red-600"
              >
                ❌ Issues Found
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      {/* Header */}
      <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">{operator.name}</h2>
              <p className="text-sm text-gray-600">{operator.shift} Shift • {operator.line}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Efficiency</div>
            <div className={`font-bold text-lg ${operator.efficiency > 100 ? 'text-green-600' : 'text-orange-600'}`}>
              {operator.efficiency}%
            </div>
          </div>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Card className="p-3">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">₹{operator.todayEarnings}</div>
            <div className="text-xs text-gray-600">Today's Earnings</div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{operator.todayPieces}</div>
            <div className="text-xs text-gray-600">Pieces Done</div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{operator.todayHours.toFixed(1)}h</div>
            <div className="text-xs text-gray-600">Hours Worked</div>
          </div>
        </Card>
      </div>

      {/* Current Work */}
      {operator.currentWork ? (
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">🔄 Current Work</CardTitle>
              <Badge 
                variant={operator.status === 'working' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {operator.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">
                Bundle {operator.currentWork.bundleId}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold">Operation:</div>
                  <div>{operator.currentWork.operation}</div>
                  <div className="text-gray-600">{operator.currentWork.operationNepali}</div>
                </div>
                <div>
                  <div className="font-semibold">Machine:</div>
                  <div>{operator.currentWork.machineType}</div>
                  <Badge variant="outline" className="text-xs mt-1">
                    {operator.currentWork.difficulty}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Progress</span>
                <span className="text-sm">
                  {operator.currentWork.completedPieces}/{operator.currentWork.totalPieces} pieces
                </span>
              </div>
              <div className="bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(operator.currentWork.completedPieces / operator.currentWork.totalPieces) * 100}%` }}
                />
              </div>
            </div>

            {/* Timer & Earnings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded">
                <ClockIcon className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                <div className="font-bold text-lg">{formatTime(workTimer)}</div>
                <div className="text-xs text-gray-600">Work Time</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded">
                <CurrencyRupeeIcon className="h-6 w-6 mx-auto mb-1 text-green-600" />
                <div className="font-bold text-lg text-green-600">
                  ₹{Math.round(operator.currentWork.completedPieces * operator.currentWork.ratePerPiece)}
                </div>
                <div className="text-xs text-gray-600">Current Earnings</div>
              </div>
            </div>

            {/* Large Action Buttons */}
            <div className="grid grid-cols-1 gap-3 mt-6">
              {operator.status !== 'working' ? (
                <Button
                  onClick={handleStartWork}
                  className="h-16 text-xl bg-green-600 hover:bg-green-700"
                >
                  <PlayIcon className="h-8 w-8 mr-3" />
                  START WORK
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleBreak}
                    variant="outline"
                    className="h-16 text-lg"
                  >
                    <PauseIcon className="h-6 w-6 mr-2" />
                    BREAK
                  </Button>
                  <Button
                    onClick={handleCompleteWork}
                    className="h-16 text-lg bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircleIcon className="h-6 w-6 mr-2" />
                    WORK DONE
                  </Button>
                </div>
              )}
            </div>

            {/* Voice Input & Camera */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Button
                onClick={startVoiceInput}
                variant="outline"
                className="h-12"
                disabled={voiceInput}
              >
                <MicrophoneIcon className={`h-5 w-5 mr-2 ${voiceInput ? 'animate-pulse text-red-500' : ''}`} />
                {voiceInput ? 'Listening...' : 'Voice Input'}
              </Button>
              <Button
                onClick={() => notify.info('Camera scan functionality', 'Feature Demo')}
                variant="outline"
                className="h-12"
              >
                <CameraIcon className="h-5 w-5 mr-2" />
                Scan Bundle
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-4">
          <CardContent className="text-center py-8">
            <QueueListIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Work Assigned</h3>
            <p className="text-sm text-gray-500">
              Waiting for work assignment from supervisor
            </p>
            <Button 
              className="mt-4"
              onClick={() => notify.info('Requesting work assignment...', 'Work Request')}
            >
              Request Work
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Next Work Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <QueueListIcon className="h-5 w-5" />
            Next Work
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-semibold">Bundle M-014 - Side Seam</h4>
            <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
              <div>
                <span className="text-gray-600">Machine:</span>
                <div className="font-medium">Overlock</div>
              </div>
              <div>
                <span className="text-gray-600">Pieces:</span>
                <div className="font-medium">50</div>
              </div>
              <div>
                <span className="text-gray-600">Rate:</span>
                <div className="font-medium text-green-600">₹3.5/pc</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency/Help Button */}
      <div className="fixed bottom-4 right-4">
        <Button
          onClick={() => notify.warning('Emergency call to supervisor', 'Emergency Alert')}
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 shadow-lg"
        >
          🆘
        </Button>
      </div>
    </div>
  );
};

export default MobileOperatorInterface;