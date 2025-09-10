// Revolutionary Work Assignment Autopilot - Designed for Non-Tech Supervisors
// Handles 1000+ daily assignments with minimal human intervention

import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { 
  PlayCircleIcon,
  PauseCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SpeakerWaveIcon,
  CameraIcon,
  ClockIcon,
  UserGroupIcon,
  LightBulbIcon,
  HandThumbUpIcon,
  HandThumbDownIcon
} from '@heroicons/react/24/outline';
import { notify } from '@/utils/notification-utils';

interface AutoAssignmentDecision {
  id: string;
  bundleNumber: string;
  operation: string;
  suggestedOperator: {
    name: string;
    photo: string;
    skillLevel: number;
    currentWorkload: number;
  };
  confidence: number; // 0-100%
  reason: string;
  urgency: 'low' | 'normal' | 'high' | 'urgent';
  estimatedTime: number;
}

const AutopilotAssignmentCenter: React.FC = () => {
  const [autopilotMode, setAutopilotMode] = useState(true);
  const [pendingDecisions, setPendingDecisions] = useState<AutoAssignmentDecision[]>([]);
  const [currentDecision, setCurrentDecision] = useState<AutoAssignmentDecision | null>(null);
  const [autoApproveThreshold, setAutoApproveThreshold] = useState(85); // Auto-approve if confidence > 85%
  const [todayStats, setTodayStats] = useState({
    totalAssigned: 847,
    autoAssigned: 798,
    manualOverrides: 23,
    pending: 26
  });

  // Voice commands for hands-free operation
  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('approve') || lowerCommand.includes('yes')) {
      handleApprove();
    } else if (lowerCommand.includes('reject') || lowerCommand.includes('no')) {
      handleReject();
    } else if (lowerCommand.includes('pause')) {
      setAutopilotMode(false);
      notify.info('Autopilot paused - manual mode activated', 'Mode Changed');
    } else if (lowerCommand.includes('resume') || lowerCommand.includes('start')) {
      setAutopilotMode(true);
      notify.success('Autopilot resumed - automatic assignments enabled', 'Mode Changed');
    }
  };

  const handleApprove = () => {
    if (currentDecision) {
      notify.success(`${currentDecision.operation} assigned to ${currentDecision.suggestedOperator.name}`, 'Assignment Approved');
      // Move to next decision
      loadNextDecision();
    }
  };

  const handleReject = () => {
    if (currentDecision) {
      // Add to manual queue
      notify.warning('Assignment rejected - added to manual queue', 'Manual Assignment Needed');
      loadNextDecision();
    }
  };

  const loadNextDecision = () => {
    // Simulate loading next decision
    setCurrentDecision({
      id: `decision_${Date.now()}`,
      bundleNumber: `TSA-${Math.floor(Math.random() * 9999)}`,
      operation: ['Cutting', 'Sewing', 'Finishing', 'Quality Check'][Math.floor(Math.random() * 4)],
      suggestedOperator: {
        name: ['Maya Patel', 'Ram Sharma', 'Sita Devi', 'Krishna Kumar'][Math.floor(Math.random() * 4)],
        photo: '/operator-avatar.png',
        skillLevel: Math.floor(Math.random() * 5) + 1,
        currentWorkload: Math.floor(Math.random() * 100)
      },
      confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
      reason: 'Best skill match + available now',
      urgency: ['normal', 'high'][Math.floor(Math.random() * 2)] as 'normal' | 'high',
      estimatedTime: Math.floor(Math.random() * 120) + 30
    });
  };

  useEffect(() => {
    loadNextDecision();
  }, []);

  // Emergency override - red button
  const handleEmergencyStop = () => {
    setAutopilotMode(false);
    notify.error('EMERGENCY STOP - All assignments paused', 'System Halted');
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      default: return 'bg-green-500';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header with Autopilot Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${autopilotMode ? 'bg-green-100' : 'bg-gray-100'}`}>
              {autopilotMode ? (
                <PlayCircleIcon className="h-6 w-6 text-green-600" />
              ) : (
                <PauseCircleIcon className="h-6 w-6 text-gray-600" />
              )}
              <span className={`font-semibold ${autopilotMode ? 'text-green-600' : 'text-gray-600'}`}>
                {autopilotMode ? 'AUTOPILOT ACTIVE' : 'MANUAL MODE'}
              </span>
            </div>
            
            {/* Emergency Stop */}
            <Button
              onClick={handleEmergencyStop}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3"
            >
              🛑 EMERGENCY STOP
            </Button>
          </div>

          {/* Today's Stats */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-white p-3 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">{todayStats.totalAssigned}</div>
              <div className="text-xs text-gray-500">Total Assigned</div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">{todayStats.autoAssigned}</div>
              <div className="text-xs text-gray-500">Auto-Assigned</div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow">
              <div className="text-2xl font-bold text-orange-600">{todayStats.manualOverrides}</div>
              <div className="text-xs text-gray-500">Manual Override</div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">{todayStats.pending}</div>
              <div className="text-xs text-gray-500">Pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Decision Interface */}
      {currentDecision && (
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 bg-white shadow-lg border-l-4 border-blue-500">
            <div className="text-center mb-6">
              <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${getUrgencyColor(currentDecision.urgency)}`}>
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="text-white font-semibold uppercase">
                  {currentDecision.urgency} PRIORITY
                </span>
              </div>
            </div>

            {/* Work Details - Extra Large and Clear */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">Bundle Number</div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{currentDecision.bundleNumber}</div>
                <div className="text-xl text-gray-600">{currentDecision.operation}</div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">Suggested Operator</div>
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                    <UserGroupIcon className="h-8 w-8 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">{currentDecision.suggestedOperator.name}</div>
                    <div className="text-sm text-gray-500">
                      Skill Level: {currentDecision.suggestedOperator.skillLevel}/5 | 
                      Load: {currentDecision.suggestedOperator.currentWorkload}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Confidence and Reasoning */}
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <LightBulbIcon className="h-6 w-6 text-yellow-500" />
                  <span className="text-lg font-semibold">AI Recommendation</span>
                </div>
                <div className={`text-2xl font-bold ${getConfidenceColor(currentDecision.confidence)}`}>
                  {currentDecision.confidence}% Confident
                </div>
              </div>
              <div className="text-gray-700 text-lg">{currentDecision.reason}</div>
              <div className="text-sm text-gray-500 mt-2">
                Estimated completion: {currentDecision.estimatedTime} minutes
              </div>
            </div>

            {/* Super Simple Decision Buttons */}
            <div className="grid grid-cols-2 gap-6">
              <Button
                onClick={handleApprove}
                className="h-20 text-2xl font-bold bg-green-600 hover:bg-green-700 text-white flex items-center justify-center space-x-3"
              >
                <HandThumbUpIcon className="h-8 w-8" />
                <span>APPROVE</span>
              </Button>
              
              <Button
                onClick={handleReject}
                className="h-20 text-2xl font-bold bg-red-600 hover:bg-red-700 text-white flex items-center justify-center space-x-3"
              >
                <HandThumbDownIcon className="h-8 w-8" />
                <span>REJECT</span>
              </Button>
            </div>

            {/* Voice Control Hint */}
            <div className="text-center mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <SpeakerWaveIcon className="h-5 w-5" />
                <span className="text-sm">Say "APPROVE" or "REJECT" for hands-free operation</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Quick Actions Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="max-w-4xl mx-auto flex justify-center space-x-4">
          <Button
            onClick={() => setAutopilotMode(!autopilotMode)}
            className={`px-6 py-3 font-semibold ${autopilotMode ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
          >
            {autopilotMode ? '⏸️ PAUSE AUTOPILOT' : '▶️ RESUME AUTOPILOT'}
          </Button>
          
          <Button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold">
            📊 VIEW QUEUE ({todayStats.pending})
          </Button>
          
          <Button className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold">
            ⚙️ SETTINGS
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AutopilotAssignmentCenter;