// Admin Settings for Work Assignment Methods
// Allows supervisors to try different methods for 2-3 days and choose their preferred one
// Only the chosen method will remain active, others will be disabled

import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { 
  CogIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  DevicePhoneMobileIcon,
  MicrophoneIcon,
  ChatBubbleLeftRightIcon,
  Squares2X2Icon,
  ListBulletIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { notify } from '@/utils/notification-utils';

interface AssignmentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  isEnabled: boolean;
  trialPeriod: {
    startDate: string | null;
    endDate: string | null;
    daysUsed: number;
    isInTrial: boolean;
  };
  usageStats: {
    totalAssignments: number;
    avgTimePerAssignment: number; // seconds
    successRate: number; // percentage
    supervisorRating: number; // 1-5 stars
  };
  pros: string[];
  cons: string[];
  bestFor: string[];
}

const AssignmentMethodSettings: React.FC = () => {
  const [methods, setMethods] = useState<AssignmentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [trialMode, setTrialMode] = useState(true);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    initializeMethods();
  }, []);

  const initializeMethods = () => {
    const methodsData: AssignmentMethod[] = [
      {
        id: 'visual-board',
        name: 'Visual Board Assignment',
        description: 'Drag & drop work cards onto operator cards - intuitive visual matching',
        icon: <Squares2X2Icon className="h-6 w-6" />,
        isEnabled: true,
        trialPeriod: {
          startDate: '2024-01-10',
          endDate: '2024-01-12',
          daysUsed: 2,
          isInTrial: false
        },
        usageStats: {
          totalAssignments: 45,
          avgTimePerAssignment: 25,
          successRate: 92,
          supervisorRating: 4.2
        },
        pros: ['Visual and intuitive', 'Easy to understand workload', 'Great for visual learners'],
        cons: ['Requires mouse/touch', 'Can be slow for bulk assignments'],
        bestFor: ['Visual learners', 'Complex assignment decisions', 'Desktop users']
      },
      {
        id: 'chat-assignment',
        name: 'WhatsApp Style Chat',
        description: 'Send work to operators like WhatsApp messages - familiar messaging interface',
        icon: <ChatBubbleLeftRightIcon className="h-6 w-6" />,
        isEnabled: true,
        trialPeriod: {
          startDate: '2024-01-13',
          endDate: '2024-01-15',
          daysUsed: 3,
          isInTrial: true
        },
        usageStats: {
          totalAssignments: 67,
          avgTimePerAssignment: 18,
          successRate: 88,
          supervisorRating: 4.5
        },
        pros: ['Familiar interface', 'Quick communication', 'Shows message history'],
        cons: ['Linear workflow', 'No bulk operations'],
        bestFor: ['WhatsApp users', 'Personal communication style', 'Mobile supervisors']
      },
      {
        id: 'quick-list',
        name: 'Quick List Assignment',
        description: 'Excel/spreadsheet style with dropdown selectors - fast bulk assignment',
        icon: <ListBulletIcon className="h-6 w-6" />,
        isEnabled: true,
        trialPeriod: {
          startDate: '2024-01-16',
          endDate: null,
          daysUsed: 1,
          isInTrial: true
        },
        usageStats: {
          totalAssignments: 89,
          avgTimePerAssignment: 12,
          successRate: 94,
          supervisorRating: 4.7
        },
        pros: ['Very fast', 'Bulk operations', 'Excel-like familiar interface'],
        cons: ['Less visual feedback', 'Can feel impersonal'],
        bestFor: ['Excel users', 'Bulk assignments', 'Speed-focused supervisors']
      },
      {
        id: 'mobile-touch',
        name: 'Mobile Touch Assignment',
        description: 'Big buttons and touch-friendly - perfect for tablets and mobile devices',
        icon: <DevicePhoneMobileIcon className="h-6 w-6" />,
        isEnabled: false,
        trialPeriod: {
          startDate: null,
          endDate: null,
          daysUsed: 0,
          isInTrial: false
        },
        usageStats: {
          totalAssignments: 0,
          avgTimePerAssignment: 0,
          successRate: 0,
          supervisorRating: 0
        },
        pros: ['Perfect for mobile/tablet', 'Large touch targets', 'Step-by-step workflow'],
        cons: ['Slower for experienced users', 'Requires more steps'],
        bestFor: ['Tablet users', 'Mobile supervisors', 'Touch-first interfaces']
      },
      {
        id: 'voice-command',
        name: 'Voice Command Assignment',
        description: 'Hands-free voice control like Siri/Alexa - perfect for busy supervisors',
        icon: <MicrophoneIcon className="h-6 w-6" />,
        isEnabled: false,
        trialPeriod: {
          startDate: null,
          endDate: null,
          daysUsed: 0,
          isInTrial: false
        },
        usageStats: {
          totalAssignments: 0,
          avgTimePerAssignment: 0,
          successRate: 0,
          supervisorRating: 0
        },
        pros: ['Completely hands-free', 'Works while walking', 'Very fast when working'],
        cons: ['Requires quiet environment', 'Learning curve', 'Voice recognition errors'],
        bestFor: ['Busy supervisors', 'Walking around floor', 'Hands-free operation']
      }
    ];

    setMethods(methodsData);
  };

  const startTrialPeriod = (methodId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 3); // 3 day trial
    
    setMethods(prev => prev.map(method =>
      method.id === methodId
        ? {
            ...method,
            isEnabled: true,
            trialPeriod: {
              ...method.trialPeriod,
              startDate: today,
              endDate: endDate.toISOString().split('T')[0],
              isInTrial: true
            }
          }
        : method
    ));

    notify.success(`Started 3-day trial for ${methods.find(m => m.id === methodId)?.name}`, 'Trial Started');
  };

  const endTrialPeriod = (methodId: string) => {
    setMethods(prev => prev.map(method =>
      method.id === methodId
        ? {
            ...method,
            trialPeriod: {
              ...method.trialPeriod,
              isInTrial: false
            }
          }
        : method
    ));

    notify.info(`Trial period ended for ${methods.find(m => m.id === methodId)?.name}`, 'Trial Ended');
  };

  const setAsPreferredMethod = (methodId: string) => {
    setMethods(prev => prev.map(method => ({
      ...method,
      isEnabled: method.id === methodId,
      trialPeriod: {
        ...method.trialPeriod,
        isInTrial: false
      }
    })));

    setTrialMode(false);
    setSelectedMethod(methodId);
    
    const selectedMethodName = methods.find(m => m.id === methodId)?.name;
    notify.success(`${selectedMethodName} is now your preferred method. All other methods have been disabled.`, 'Preference Set');
  };

  const resetToTrialMode = () => {
    setTrialMode(true);
    setSelectedMethod(null);
    setMethods(prev => prev.map(method => ({
      ...method,
      isEnabled: true,
      trialPeriod: {
        ...method.trialPeriod,
        isInTrial: method.usageStats.totalAssignments > 0
      }
    })));

    notify.info('Reset to trial mode. All methods are now available for testing.', 'Trial Mode Enabled');
  };

  const getTrialStatusBadge = (method: AssignmentMethod) => {
    if (!trialMode && !method.isEnabled) {
      return <Badge className="bg-gray-100 text-gray-800">Disabled</Badge>;
    }
    
    if (method.trialPeriod.isInTrial) {
      const daysLeft = method.trialPeriod.endDate 
        ? Math.max(0, Math.ceil((new Date(method.trialPeriod.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
        : 0;
      return <Badge className="bg-blue-100 text-blue-800">Trial - {daysLeft} days left</Badge>;
    }
    
    if (method.usageStats.totalAssignments > 0 && !method.trialPeriod.isInTrial) {
      return <Badge className="bg-green-100 text-green-800">Trial Complete</Badge>;
    }
    
    return <Badge className="bg-yellow-100 text-yellow-800">Not Started</Badge>;
  };

  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(Math.round(rating));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <div className="bg-indigo-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold flex items-center mb-2">
            <CogIcon className="h-7 w-7 mr-3" />
            Assignment Method Settings
          </h1>
          <p className="text-indigo-100">Configure and choose your preferred work assignment method</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        
        {/* Trial Mode Status */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {trialMode ? '🧪 Trial Mode Active' : '✅ Preferred Method Selected'}
              </h2>
              <p className="text-gray-600">
                {trialMode 
                  ? 'Try different assignment methods for 2-3 days each to find your preferred workflow'
                  : `Using ${methods.find(m => m.id === selectedMethod)?.name} as your primary assignment method`
                }
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowStats(!showStats)}
                variant="outline"
                className="flex items-center"
              >
                <ChartBarIcon className="h-4 w-4 mr-2" />
                {showStats ? 'Hide' : 'Show'} Stats
              </Button>
              {!trialMode && (
                <Button
                  onClick={resetToTrialMode}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Reset to Trial Mode
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Methods Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {methods.map(method => (
            <Card 
              key={method.id} 
              className={`p-6 transition-all ${
                selectedMethod === method.id ? 'ring-2 ring-green-500 bg-green-50' :
                method.isEnabled ? 'hover:shadow-lg' : 'opacity-60'
              }`}
            >
              
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${method.isEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                    {method.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{method.name}</h3>
                    {getTrialStatusBadge(method)}
                  </div>
                </div>
                
                {method.isEnabled ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircleIcon className="h-6 w-6 text-gray-400" />
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-4">{method.description}</p>

              {/* Usage Stats */}
              {showStats && method.usageStats.totalAssignments > 0 && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Usage Statistics:</div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-gray-500">Total Assignments</div>
                      <div className="font-semibold">{method.usageStats.totalAssignments}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Avg Time</div>
                      <div className="font-semibold">{method.usageStats.avgTimePerAssignment}s</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Success Rate</div>
                      <div className="font-semibold">{method.usageStats.successRate}%</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Rating</div>
                      <div className="font-semibold">
                        {getRatingStars(method.usageStats.supervisorRating)} ({method.usageStats.supervisorRating})
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 gap-3 mb-4">
                <div>
                  <div className="text-sm font-semibold text-green-700 mb-1">✅ Pros:</div>
                  <ul className="text-sm text-green-600 space-y-1">
                    {method.pros.slice(0, 2).map((pro, index) => (
                      <li key={index}>• {pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-sm font-semibold text-red-700 mb-1">⚠️ Considerations:</div>
                  <ul className="text-sm text-red-600 space-y-1">
                    {method.cons.slice(0, 2).map((con, index) => (
                      <li key={index}>• {con}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Best For */}
              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">🎯 Best For:</div>
                <div className="flex flex-wrap gap-1">
                  {method.bestFor.map((item, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                {trialMode ? (
                  <>
                    {!method.isEnabled && !method.trialPeriod.isInTrial ? (
                      <Button
                        onClick={() => startTrialPeriod(method.id)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Start 3-Day Trial
                      </Button>
                    ) : method.trialPeriod.isInTrial ? (
                      <Button
                        onClick={() => endTrialPeriod(method.id)}
                        size="sm"
                        variant="outline"
                      >
                        End Trial
                      </Button>
                    ) : null}
                    
                    {method.usageStats.totalAssignments > 5 && (
                      <Button
                        onClick={() => setAsPreferredMethod(method.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Choose This Method
                      </Button>
                    )}
                  </>
                ) : (
                  selectedMethod === method.id && (
                    <Badge className="bg-green-100 text-green-800 px-3 py-1">
                      ✅ Active Method
                    </Badge>
                  )
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => notify.info('This would open a preview of the method', 'Preview')}
                >
                  <EyeIcon className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Instructions */}
        <Card className="p-6 mt-6 bg-amber-50 border-amber-200">
          <h3 className="text-lg font-bold text-amber-800 mb-3">📋 How to Choose Your Method</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-amber-700">
            <div>
              <div className="font-semibold mb-2">1. Trial Phase (2-3 days each)</div>
              <p>Try each method for 2-3 days. Use it for real work assignments to get a feel for the workflow.</p>
            </div>
            <div>
              <div className="font-semibold mb-2">2. Compare & Decide</div>
              <p>Look at usage stats, speed, and your comfort level. Choose the method that feels most natural.</p>
            </div>
            <div>
              <div className="font-semibold mb-2">3. Lock In Preference</div>
              <p>Once you choose, that method becomes your primary interface. Other methods are disabled to avoid confusion.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AssignmentMethodSettings;