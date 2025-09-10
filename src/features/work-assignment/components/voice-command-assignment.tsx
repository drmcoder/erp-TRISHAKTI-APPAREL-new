// METHOD 5: "Voice Command" Assignment
// Hands-free voice control - like Siri/Alexa for busy supervisors
// Practical: Perfect when supervisors are walking around the floor or hands are busy

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { 
  MicrophoneIcon,
  SpeakerWaveIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { notify } from '@/utils/notification-utils';

interface VoiceCommand {
  text: string;
  confidence: number;
  action: 'assign' | 'status' | 'help' | 'unknown';
  params?: {
    bundleNumber?: string;
    operatorName?: string;
    operation?: string;
  };
}

interface WorkItem {
  id: string;
  bundleNumber: string;
  operation: string;
  pieces: number;
  priority: 'normal' | 'high' | 'urgent';
  deadline: string;
}

interface Operator {
  id: string;
  name: string;
  nicknames: string[]; // For voice recognition
  avatar: string;
  status: 'available' | 'busy' | 'break';
  currentTasks: number;
}

const VoiceCommandAssignment: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>('');
  const [voiceHistory, setVoiceHistory] = useState<string[]>([]);
  const [pendingAssignment, setPendingAssignment] = useState<any>(null);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    initializeData();
    initializeSpeechRecognition();
    synthRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const initializeData = () => {
    setWorkItems([
      {
        id: 'w1',
        bundleNumber: 'TSA-001',
        operation: 'Sleeve Sewing',
        pieces: 120,
        priority: 'high',
        deadline: '2:00 PM'
      },
      {
        id: 'w2', 
        bundleNumber: 'TSA-002',
        operation: 'Button Holes',
        pieces: 80,
        priority: 'normal',
        deadline: '4:00 PM'
      },
      {
        id: 'w3',
        bundleNumber: 'TSA-003',
        operation: 'Collar Work',
        pieces: 150,
        priority: 'urgent',
        deadline: '1:00 PM'
      }
    ]);

    setOperators([
      {
        id: 'maya',
        name: 'Maya Patel',
        nicknames: ['maya', 'maya patel', 'patel'],
        avatar: '👩‍🏭',
        status: 'available',
        currentTasks: 1
      },
      {
        id: 'ram',
        name: 'Ram Sharma',
        nicknames: ['ram', 'ram sharma', 'sharma'],
        avatar: '👨‍🏭',
        status: 'available',
        currentTasks: 0
      },
      {
        id: 'sita',
        name: 'Sita Devi',
        nicknames: ['sita', 'sita devi', 'devi'],
        avatar: '👩‍🏭',
        status: 'busy',
        currentTasks: 3
      }
    ]);
  };

  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        speak("I'm listening. You can say things like 'Assign TSA-001 to Maya' or 'What is Ram's status?'");
      };

      recognitionRef.current.onresult = (event: any) => {
        const command = event.results[0][0].transcript.toLowerCase();
        setLastCommand(command);
        processVoiceCommand(command);
        setVoiceHistory(prev => [command, ...prev.slice(0, 4)]);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        speak("Sorry, I couldn't hear you clearly. Please try again.");
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      notify.error('Speech recognition is not supported in this browser', 'Voice Commands Unavailable');
    }
  };

  const speak = (text: string) => {
    if (synthRef.current && !isSpeaking) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      synthRef.current.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const processVoiceCommand = (command: string) => {
    // Parse common assignment commands
    const assignPattern = /assign\s+(tsa-?\d+)\s+to\s+(\w+)/i;
    const statusPattern = /(?:what\s+is\s+)?(\w+)(?:'s|\s+)status/i;
    const helpPattern = /help|what\s+can\s+i\s+say/i;
    const listPattern = /(?:list|show)\s+(operators?|work|tasks)/i;

    if (assignPattern.test(command)) {
      const match = command.match(assignPattern);
      if (match) {
        const bundleNumber = match[1].toUpperCase();
        const operatorName = match[2].toLowerCase();
        
        handleAssignmentCommand(bundleNumber, operatorName);
      }
    } else if (statusPattern.test(command)) {
      const match = command.match(statusPattern);
      if (match) {
        const operatorName = match[1].toLowerCase();
        handleStatusQuery(operatorName);
      }
    } else if (listPattern.test(command)) {
      const match = command.match(listPattern);
      if (match) {
        const listType = match[1].toLowerCase();
        handleListQuery(listType);
      }
    } else if (helpPattern.test(command)) {
      handleHelpCommand();
    } else {
      speak("I didn't understand that command. You can say 'help' to hear what I can do.");
    }
  };

  const handleAssignmentCommand = (bundleNumber: string, operatorName: string) => {
    // Find work item
    const workItem = workItems.find(w => w.bundleNumber === bundleNumber);
    if (!workItem) {
      speak(`I couldn't find work item ${bundleNumber}. Please check the bundle number and try again.`);
      return;
    }

    // Find operator by name or nickname
    const operator = operators.find(op => 
      op.nicknames.includes(operatorName) || 
      op.name.toLowerCase().includes(operatorName)
    );

    if (!operator) {
      speak(`I couldn't find operator ${operatorName}. Available operators are: ${operators.map(op => op.name).join(', ')}`);
      return;
    }

    if (operator.status !== 'available') {
      speak(`${operator.name} is currently ${operator.status}. Do you want to assign anyway? Say 'confirm assignment' or 'cancel'.`);
      setPendingAssignment({ workItem, operator, requiresConfirmation: true });
      return;
    }

    // Execute assignment
    executeAssignment(workItem, operator);
  };

  const handleStatusQuery = (operatorName: string) => {
    const operator = operators.find(op => 
      op.nicknames.includes(operatorName) || 
      op.name.toLowerCase().includes(operatorName)
    );

    if (!operator) {
      speak(`I couldn't find operator ${operatorName}.`);
      return;
    }

    const statusText = `${operator.name} is currently ${operator.status} with ${operator.currentTasks} tasks assigned.`;
    speak(statusText);
  };

  const handleListQuery = (listType: string) => {
    if (listType.includes('operator')) {
      const availableOps = operators.filter(op => op.status === 'available');
      if (availableOps.length > 0) {
        speak(`Available operators: ${availableOps.map(op => op.name).join(', ')}`);
      } else {
        speak("No operators are currently available.");
      }
    } else if (listType.includes('work') || listType.includes('task')) {
      if (workItems.length > 0) {
        const workList = workItems.slice(0, 3).map(w => `${w.bundleNumber}: ${w.operation}`).join(', ');
        speak(`Pending work items: ${workList}`);
      } else {
        speak("No pending work items.");
      }
    }
  };

  const handleHelpCommand = () => {
    speak("You can say: 'Assign TSA-001 to Maya', 'What is Ram's status', 'List operators', or 'List work items'. I understand bundle numbers like TSA-001 and operator names.");
  };

  const executeAssignment = (workItem: WorkItem, operator: Operator) => {
    // Update data
    setWorkItems(prev => prev.filter(w => w.id !== workItem.id));
    setOperators(prev => prev.map(op => 
      op.id === operator.id 
        ? { ...op, currentTasks: op.currentTasks + 1 }
        : op
    ));

    speak(`Successfully assigned ${workItem.bundleNumber} ${workItem.operation} to ${operator.name}.`);
    notify.success(`${workItem.bundleNumber} assigned to ${operator.name}`, 'Voice Assignment Complete');
    setPendingAssignment(null);
  };

  const confirmPendingAssignment = () => {
    if (pendingAssignment) {
      executeAssignment(pendingAssignment.workItem, pendingAssignment.operator);
    }
  };

  const cancelPendingAssignment = () => {
    speak("Assignment cancelled.");
    setPendingAssignment(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold flex items-center mb-2">
            <MicrophoneIcon className="h-7 w-7 mr-3" />
            Voice Command Assignment
          </h1>
          <p className="text-purple-100">Hands-free work assignment using voice commands</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        
        {/* Voice Control Interface */}
        <Card className="p-8 mb-6 bg-gradient-to-r from-white to-purple-50 shadow-xl">
          <div className="text-center">
            
            {/* Microphone Button */}
            <div className="mb-6">
              <Button
                onClick={isListening ? stopListening : startListening}
                disabled={!recognitionRef.current}
                size="lg"
                className={`w-24 h-24 rounded-full text-white text-xl font-bold shadow-lg ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {isListening ? <StopIcon className="h-10 w-10" /> : <MicrophoneIcon className="h-10 w-10" />}
              </Button>
            </div>

            {/* Status */}
            <div className="mb-4">
              {isListening && (
                <div className="text-lg font-semibold text-purple-600 flex items-center justify-center">
                  <div className="animate-spin mr-2">
                    <ArrowPathIcon className="h-5 w-5" />
                  </div>
                  Listening... Speak now
                </div>
              )}
              {isSpeaking && (
                <div className="text-lg font-semibold text-green-600 flex items-center justify-center">
                  <SpeakerWaveIcon className="h-5 w-5 mr-2" />
                  Speaking...
                </div>
              )}
              {!isListening && !isSpeaking && (
                <div className="text-gray-600">
                  {recognitionRef.current ? 'Click microphone and speak your command' : 'Voice recognition not supported'}
                </div>
              )}
            </div>

            {/* Last Command */}
            {lastCommand && (
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-600 mb-1">Last command:</div>
                <div className="font-semibold text-gray-900">"{lastCommand}"</div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                onClick={() => speak("Available operators: " + operators.filter(op => op.status === 'available').map(op => op.name).join(', '))}
                className="text-sm"
              >
                <SpeakerWaveIcon className="h-4 w-4 mr-1" />
                List Operators
              </Button>
              <Button
                variant="outline"
                onClick={() => speak("Pending work: " + workItems.slice(0, 3).map(w => w.bundleNumber).join(', '))}
                className="text-sm"
              >
                <SpeakerWaveIcon className="h-4 w-4 mr-1" />
                List Work
              </Button>
              <Button
                variant="outline"
                onClick={handleHelpCommand}
                className="text-sm"
              >
                <SpeakerWaveIcon className="h-4 w-4 mr-1" />
                Help
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (synthRef.current) synthRef.current.cancel();
                  setIsSpeaking(false);
                }}
                className="text-sm"
              >
                <StopIcon className="h-4 w-4 mr-1" />
                Stop Speech
              </Button>
            </div>
          </div>
        </Card>

        {/* Pending Assignment Confirmation */}
        {pendingAssignment && (
          <Card className="p-6 mb-6 bg-yellow-50 border-yellow-200">
            <div className="text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Assignment Requires Confirmation</h3>
              <p className="text-gray-600 mb-4">
                {pendingAssignment.operator.name} is currently {pendingAssignment.operator.status}. 
                Assign {pendingAssignment.workItem.bundleNumber} anyway?
              </p>
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={confirmPendingAssignment}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Confirm Assignment
                </Button>
                <Button
                  onClick={cancelPendingAssignment}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Current Work Items */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              📋 Pending Work
              <Badge className="ml-2 bg-blue-100 text-blue-800">{workItems.length}</Badge>
            </h2>
            <div className="space-y-3">
              {workItems.slice(0, 5).map(work => (
                <div key={work.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-semibold">{work.bundleNumber}</div>
                    <div className="text-sm text-gray-600">{work.operation} • {work.pieces} pieces</div>
                  </div>
                  <Badge className={work.priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                    {work.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Operator Status */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              👥 Operators
              <Badge className="ml-2 bg-green-100 text-green-800">
                {operators.filter(op => op.status === 'available').length} available
              </Badge>
            </h2>
            <div className="space-y-3">
              {operators.map(operator => (
                <div key={operator.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{operator.avatar}</div>
                    <div>
                      <div className="font-semibold">{operator.name}</div>
                      <div className="text-sm text-gray-600">Say: "{operator.nicknames[0]}"</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={operator.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {operator.status}
                    </Badge>
                    <div className="text-xs text-gray-600 mt-1">{operator.currentTasks} tasks</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Voice History */}
        {voiceHistory.length > 0 && (
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Recent Voice Commands</h3>
            <div className="space-y-2">
              {voiceHistory.map((command, index) => (
                <div key={index} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                  "{command}"
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Voice Command Examples */}
        <Card className="p-6 mt-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">🎯 Voice Command Examples</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <div className="font-semibold mb-2">Assignment Commands:</div>
              <ul className="space-y-1">
                <li>• "Assign TSA-001 to Maya"</li>
                <li>• "Give TSA-002 to Ram"</li>
                <li>• "Assign collar work to Sita"</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-2">Information Commands:</div>
              <ul className="space-y-1">
                <li>• "What is Maya's status?"</li>
                <li>• "List operators"</li>
                <li>• "Show work items"</li>
                <li>• "Help"</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VoiceCommandAssignment;