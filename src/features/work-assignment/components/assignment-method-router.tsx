// Assignment Method Router - Central hub for all assignment methods
// Routes to the active method based on admin settings
// Provides method switching during trial period

import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { 
  ArrowRightIcon,
  CogIcon,
  Squares2X2Icon,
  ChatBubbleLeftRightIcon,
  ListBulletIcon,
  DevicePhoneMobileIcon,
  MicrophoneIcon,
  ClockIcon,
  CheckCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

// Import all assignment methods
import VisualBoardAssignment from './visual-board-assignment';
import ChatAssignment from './chat-assignment';
import QuickListAssignment from './quick-list-assignment';
import MobileTouchAssignment from './mobile-touch-assignment';
import VoiceCommandAssignment from './voice-command-assignment';
import AssignmentMethodSettings from './assignment-method-settings';

interface MethodConfig {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType;
  isEnabled: boolean;
  isInTrial: boolean;
  usageCount: number;
  averageRating: number;
  trialDaysLeft?: number;
}

const AssignmentMethodRouter: React.FC = () => {
  const [currentMethod, setCurrentMethod] = useState<string>('selector');
  const [methods, setMethods] = useState<MethodConfig[]>([]);
  const [trialMode, setTrialMode] = useState(true);
  const [preferredMethod, setPreferredMethod] = useState<string | null>(null);

  useEffect(() => {
    loadMethodConfigurations();
  }, []);

  const loadMethodConfigurations = () => {
    // In real app, this would come from user preferences/database
    const methodConfigs: MethodConfig[] = [
      {
        id: 'visual-board',
        name: 'Visual Board Assignment',
        shortName: 'Visual Board',
        description: 'Drag & drop cards - perfect for visual thinkers',
        icon: <Squares2X2Icon className="h-5 w-5" />,
        component: VisualBoardAssignment,
        isEnabled: true,
        isInTrial: false,
        usageCount: 45,
        averageRating: 4.2,
      },
      {
        id: 'chat-assignment',
        name: 'WhatsApp Style Chat',
        shortName: 'Chat Style',
        description: 'Send work like messages - familiar and personal',
        icon: <ChatBubbleLeftRightIcon className="h-5 w-5" />,
        component: ChatAssignment,
        isEnabled: true,
        isInTrial: true,
        usageCount: 67,
        averageRating: 4.5,
        trialDaysLeft: 1
      },
      {
        id: 'quick-list',
        name: 'Quick List Assignment',
        shortName: 'Quick List',
        description: 'Excel-style fast bulk assignment',
        icon: <ListBulletIcon className="h-5 w-5" />,
        component: QuickListAssignment,
        isEnabled: true,
        isInTrial: true,
        usageCount: 89,
        averageRating: 4.7,
        trialDaysLeft: 2
      },
      {
        id: 'mobile-touch',
        name: 'Mobile Touch Assignment',
        shortName: 'Mobile Touch',
        description: 'Big buttons for tablets and mobile',
        icon: <DevicePhoneMobileIcon className="h-5 w-5" />,
        component: MobileTouchAssignment,
        isEnabled: false,
        isInTrial: false,
        usageCount: 0,
        averageRating: 0
      },
      {
        id: 'voice-command',
        name: 'Voice Command Assignment',
        shortName: 'Voice Control',
        description: 'Hands-free voice commands',
        icon: <MicrophoneIcon className="h-5 w-5" />,
        component: VoiceCommandAssignment,
        isEnabled: false,
        isInTrial: false,
        usageCount: 0,
        averageRating: 0
      }
    ];

    setMethods(methodConfigs);

    // Check if user has a preferred method
    const preferred = methodConfigs.find(m => m.usageCount > 50 && m.averageRating > 4.0);
    if (preferred && !trialMode) {
      setPreferredMethod(preferred.id);
    }
  };

  const renderCurrentMethod = () => {
    if (currentMethod === 'settings') {
      return <AssignmentMethodSettings />;
    }
    
    if (currentMethod === 'selector') {
      return renderMethodSelector();
    }

    const method = methods.find(m => m.id === currentMethod);
    if (!method) return renderMethodSelector();

    const MethodComponent = method.component;
    return <MethodComponent />;
  };

  const renderMethodSelector = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">🎯 Work Assignment Methods</h1>
          <p className="text-indigo-100">
            {trialMode 
              ? 'Try different methods for 2-3 days each to find your favorite workflow'
              : `Using your preferred method: ${methods.find(m => m.id === preferredMethod)?.name}`
            }
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        
        {/* Trial Status */}
        {trialMode && (
          <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2" />
                  Trial Mode Active
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Test different methods to find what works best for your workflow
                </p>
              </div>
              <Button
                onClick={() => setCurrentMethod('settings')}
                variant="outline"
                className="flex items-center"
              >
                <CogIcon className="h-4 w-4 mr-2" />
                Manage Methods
              </Button>
            </div>
          </Card>
        )}

        {/* Available Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {methods.filter(m => m.isEnabled).map(method => (
            <Card 
              key={method.id}
              className="p-6 hover:shadow-xl transition-all cursor-pointer border-2 hover:border-indigo-300"
              onClick={() => setCurrentMethod(method.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
                    {method.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{method.shortName}</h3>
                    {method.isInTrial && method.trialDaysLeft && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        Trial - {method.trialDaysLeft} days left
                      </Badge>
                    )}
                  </div>
                </div>
                <ArrowRightIcon className="h-5 w-5 text-gray-400" />
              </div>

              <p className="text-gray-600 text-sm mb-4">{method.description}</p>

              {method.usageCount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-500">
                    Used {method.usageCount} times
                  </div>
                  <div className="flex items-center text-yellow-600">
                    {'⭐'.repeat(Math.round(method.averageRating))} 
                    <span className="ml-1 text-gray-500">({method.averageRating})</span>
                  </div>
                </div>
              )}

              <Button 
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentMethod(method.id);
                }}
              >
                {method.usageCount > 0 ? 'Continue Using' : 'Try This Method'}
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </Button>
            </Card>
          ))}
        </div>

        {/* Disabled Methods (Available to Try) */}
        {methods.filter(m => !m.isEnabled).length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">🔒 Additional Methods Available</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {methods.filter(m => !m.isEnabled).map(method => (
                <Card key={method.id} className="p-4 border-dashed border-2 border-gray-300 opacity-75">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-gray-100 rounded text-gray-400">
                        {method.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700">{method.shortName}</h4>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{method.description}</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setCurrentMethod('settings')}
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Enable in Settings
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quick Start Guide */}
        <Card className="p-6 mt-8 bg-green-50 border-green-200">
          <h3 className="text-lg font-bold text-green-800 mb-3">🚀 New to Work Assignment?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-700">
            <div>
              <div className="font-semibold mb-2">1. Start Simple</div>
              <p>Begin with "Visual Board" - it's the most intuitive for first-time users.</p>
            </div>
            <div>
              <div className="font-semibold mb-2">2. Try for 2-3 Days</div>
              <p>Use each method for real work assignments to get a proper feel for the workflow.</p>
            </div>
            <div>
              <div className="font-semibold mb-2">3. Pick Your Favorite</div>
              <p>Once you find the method you like most, you can disable the others to avoid confusion.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div>
      {/* Navigation Bar (shown when not on selector) */}
      {currentMethod !== 'selector' && currentMethod !== 'settings' && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => setCurrentMethod('selector')}
                  variant="outline"
                  size="sm"
                >
                  ← All Methods
                </Button>
                <div className="text-sm text-gray-600">
                  Currently using: <strong>{methods.find(m => m.id === currentMethod)?.name}</strong>
                </div>
              </div>
              
              {trialMode && (
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-100 text-blue-800">Trial Mode</Badge>
                  <Button
                    onClick={() => setCurrentMethod('settings')}
                    size="sm"
                    variant="outline"
                  >
                    <CogIcon className="h-4 w-4 mr-1" />
                    Settings
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Render Current Method */}
      {renderCurrentMethod()}
    </div>
  );
};

export default AssignmentMethodRouter;