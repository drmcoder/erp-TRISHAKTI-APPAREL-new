// METHOD 2: "WhatsApp Style" Assignment
// Chat-like interface - supervisors send work to operators like sending messages
// Practical: Everyone knows how to use WhatsApp/messaging apps

import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Input } from '@/shared/components/ui/Input';
import { 
  PaperAirplaneIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { notify } from '@/utils/notification-utils';

interface Operator {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'busy' | 'offline';
  lastSeen: string;
  currentWork?: string;
  skillBadge: string; // "Sewing Expert", "New", "Quality Pro"
  unreadCount: number;
}

interface ChatMessage {
  id: string;
  type: 'work-assignment' | 'status-update' | 'system';
  content: string;
  timestamp: string;
  bundleNumber?: string;
  operation?: string;
  pieces?: number;
  isRead: boolean;
}

const ChatAssignment: React.FC = () => {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentWork, setCurrentWork] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingWork] = useState([
    { bundle: 'TSA-001', operation: 'Sleeve Sewing', pieces: 120 },
    { bundle: 'TSA-002', operation: 'Button Holes', pieces: 80 },
    { bundle: 'TSA-003', operation: 'Collar Work', pieces: 150 }
  ]);

  useEffect(() => {
    // Initialize operators (like WhatsApp contacts)
    setOperators([
      {
        id: 'maya',
        name: 'Maya Patel',
        avatar: '👩‍🏭',
        status: 'online',
        lastSeen: 'Online',
        skillBadge: '⭐ Sewing Expert',
        unreadCount: 0,
        currentWork: 'Sleeve Work - 80% done'
      },
      {
        id: 'ram',
        name: 'Ram Sharma', 
        avatar: '👨‍🏭',
        status: 'busy',
        lastSeen: '5 min ago',
        skillBadge: '🔥 Fast Worker',
        unreadCount: 2,
        currentWork: 'Button Holes'
      },
      {
        id: 'sita',
        name: 'Sita Devi',
        avatar: '👩‍🏭', 
        status: 'online',
        lastSeen: 'Online',
        skillBadge: '✅ Quality Pro',
        unreadCount: 0
      },
      {
        id: 'krishna',
        name: 'Krishna Kumar',
        avatar: '👨‍🏭',
        status: 'offline',
        lastSeen: '1 hour ago',
        skillBadge: '🆕 Learning',
        unreadCount: 1
      }
    ]);

    // Load chat history for selected operator
    setMessages([
      {
        id: '1',
        type: 'work-assignment',
        content: '📦 TSA-345 - Hemming work (100 pieces) completed',
        timestamp: '10:30 AM',
        isRead: true
      },
      {
        id: '2', 
        type: 'status-update',
        content: '✅ Work finished early! Ready for next task',
        timestamp: '11:15 AM',
        isRead: true
      }
    ]);
  }, []);

  const sendWorkAssignment = (workText: string, bundle: string, operation: string, pieces: number) => {
    if (!selectedOperator) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'work-assignment',
      content: `🎯 NEW WORK: ${bundle}\n📋 ${operation}\n📦 ${pieces} pieces\n⏰ Deadline: Today 5 PM`,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      bundleNumber: bundle,
      operation,
      pieces,
      isRead: false
    };

    setMessages(prev => [...prev, newMessage]);
    
    // Update operator status
    setOperators(prev => prev.map(op => 
      op.id === selectedOperator.id 
        ? { ...op, currentWork: `${operation} - Just assigned`, unreadCount: op.unreadCount + 1 }
        : op
    ));

    notify.success(`Work sent to ${selectedOperator.name}`, 'Assignment Sent');
    setCurrentWork('');
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500'; 
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const filteredOperators = operators.filter(op => 
    op.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.skillBadge.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">💬 Work Assignment Chat</h1>
          <p className="text-green-100">Send work to operators like WhatsApp messages</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex h-screen">
        
        {/* Operators List (like WhatsApp contacts) */}
        <div className="w-1/3 bg-white border-r border-gray-200">
          
          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search operators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Quick Work Buttons */}
          <div className="p-3 bg-gray-50 border-b">
            <div className="text-xs text-gray-500 mb-2">📋 Quick Assign:</div>
            <div className="grid grid-cols-3 gap-1">
              {pendingWork.map((work, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="outline"
                  className="text-xs p-1 h-auto"
                  onClick={() => setCurrentWork(`${work.bundle} - ${work.operation} (${work.pieces} pieces)`)}
                >
                  {work.bundle}
                </Button>
              ))}
            </div>
          </div>

          {/* Operators List */}
          <div className="overflow-y-auto">
            {filteredOperators.map(operator => (
              <div
                key={operator.id}
                className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedOperator?.id === operator.id ? 'bg-blue-50 border-r-4 border-r-blue-500' : ''
                }`}
                onClick={() => setSelectedOperator(operator)}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                      {operator.avatar}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusDot(operator.status)}`}></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-gray-900 truncate">{operator.name}</div>
                      {operator.unreadCount > 0 && (
                        <Badge className="bg-green-500 text-white text-xs">
                          {operator.unreadCount}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-xs text-blue-600 mb-1">{operator.skillBadge}</div>
                    
                    <div className="text-sm text-gray-600 truncate">
                      {operator.currentWork || 'Available for work'}
                    </div>
                    
                    <div className="text-xs text-gray-400 flex items-center space-x-1">
                      <span>{operator.lastSeen}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedOperator ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg">
                    {selectedOperator.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{selectedOperator.name}</div>
                    <div className="text-sm text-gray-500 flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${getStatusDot(selectedOperator.status)}`}></span>
                      <span>{selectedOperator.lastSeen}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <PhoneIcon className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    📊 Stats
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map(message => (
                  <div key={message.id} className="flex justify-end">
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === 'work-assignment' 
                        ? 'bg-blue-500 text-white' 
                        : message.type === 'status-update'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-800'
                    }`}>
                      <div className="whitespace-pre-line text-sm">{message.content}</div>
                      <div className="text-xs mt-1 opacity-75">{message.timestamp}</div>
                    </div>
                  </div>
                ))}
                
                {/* Example received messages */}
                <div className="flex justify-start">
                  <div className="bg-white border rounded-lg px-4 py-2 max-w-xs">
                    <div className="text-sm">✅ Got it! Starting work now</div>
                    <div className="text-xs text-gray-500 mt-1">11:45 AM</div>
                  </div>
                </div>
              </div>

              {/* Message Input */}
              <div className="bg-white border-t p-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type work assignment... (e.g., TSA-001 - Sleeve Sewing - 100 pieces)"
                    value={currentWork}
                    onChange={(e) => setCurrentWork(e.target.value)}
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && currentWork.trim()) {
                        // Parse the work text
                        const parts = currentWork.split(' - ');
                        sendWorkAssignment(
                          currentWork,
                          parts[0] || 'TSA-XXX',
                          parts[1] || 'Work',
                          parseInt(parts[2]) || 100
                        );
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      if (currentWork.trim()) {
                        const parts = currentWork.split(' - ');
                        sendWorkAssignment(
                          currentWork,
                          parts[0] || 'TSA-XXX', 
                          parts[1] || 'Work',
                          parseInt(parts[2]) || 100
                        );
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  💡 Format: Bundle Number - Operation - Pieces (e.g., TSA-001 - Sewing - 120 pieces)
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <UserGroupIcon className="h-24 w-24 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Select an operator to send work</p>
                <p className="text-sm">Just like choosing a WhatsApp contact</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatAssignment;