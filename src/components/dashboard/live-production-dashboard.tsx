// Live Production Dashboard with Real-Time Metrics
// TV display optimized dashboard for production floor monitoring

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/Badge';
import {
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  TvIcon,
  SignalIcon
} from '@heroicons/react/24/outline';
import { useWebSocket } from '../../hooks/useWebSocket';

interface ProductionMetrics {
  totalPieces: number;
  completedToday: number;
  inProgress: number;
  qualityIssues: number;
  averageEfficiency: number;
  onTimeDelivery: number;
  targetsAchieved: number;
  totalTargets: number;
  earnings: {
    total: number;
    operators: number;
    supervisors: number;
  };
  shifts: {
    morning: { active: number; efficiency: number; pieces: number };
    evening: { active: number; efficiency: number; pieces: number };
    night: { active: number; efficiency: number; pieces: number };
  };
  topPerformers: Array<{
    id: string;
    name: string;
    pieces: number;
    efficiency: number;
    earnings: number;
  }>;
  alerts: Array<{
    id: string;
    type: 'quality' | 'delay' | 'machine' | 'emergency';
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: Date;
    location: string;
  }>;
  hourlyProduction: Array<{
    hour: string;
    target: number;
    actual: number;
    efficiency: number;
  }>;
}

interface LiveProductionDashboardProps {
  displayMode?: 'tv' | 'desktop' | 'mobile';
  autoRefresh?: boolean;
  refreshInterval?: number;
  showAlerts?: boolean;
  className?: string;
}

export const LiveProductionDashboard: React.FC<LiveProductionDashboardProps> = ({
  displayMode = 'desktop',
  autoRefresh = true,
  refreshInterval = 5000,
  showAlerts = true,
  className = ''
}) => {
  const [metrics, setMetrics] = useState<ProductionMetrics | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentShift, setCurrentShift] = useState<'morning' | 'evening' | 'night'>('morning');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // WebSocket connection for real-time updates
  const {
    isConnected,
    liveMetrics,
    connectedOperators,
    workingOperators
  } = useWebSocket({
    autoConnect: true,
    userId: 'dashboard_tv',
    userRole: 'dashboard'
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      updateCurrentShift();
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Mock data generation (replace with real API calls)
  useEffect(() => {
    const generateMockMetrics = (): ProductionMetrics => {
      const baseProduction = 8500;
      const variation = Math.sin(Date.now() / 300000) * 500; // 5-minute cycle
      
      return {
        totalPieces: Math.floor(baseProduction + variation),
        completedToday: Math.floor(baseProduction * 0.85 + variation),
        inProgress: workingOperators.length * 12,
        qualityIssues: Math.floor(baseProduction * 0.02),
        averageEfficiency: 87.5 + Math.sin(Date.now() / 600000) * 5,
        onTimeDelivery: 94.2,
        targetsAchieved: 23,
        totalTargets: 28,
        earnings: {
          total: Math.floor(baseProduction * 2.5 + variation * 2),
          operators: Math.floor(baseProduction * 2.2 + variation * 2),
          supervisors: Math.floor(baseProduction * 0.3)
        },
        shifts: {
          morning: { active: 28, efficiency: 89.2, pieces: 3200 },
          evening: { active: 25, efficiency: 85.7, pieces: 2950 },
          night: { active: 18, efficiency: 82.1, pieces: 2100 }
        },
        topPerformers: [
          { id: '001', name: 'Sunita Devi', pieces: 245, efficiency: 127.3, earnings: 735 },
          { id: '002', name: 'Raj Kumar', pieces: 238, efficiency: 124.8, earnings: 714 },
          { id: '003', name: 'Maya Singh', pieces: 232, efficiency: 119.5, earnings: 696 },
          { id: '004', name: 'Ram Bahadur', pieces: 228, efficiency: 118.2, earnings: 684 },
          { id: '005', name: 'Sita Kumari', pieces: 225, efficiency: 116.8, earnings: 675 }
        ],
        alerts: [
          {
            id: 'alert_001',
            type: 'quality',
            message: 'High defect rate detected in Bundle M-234',
            severity: 'high',
            timestamp: new Date(Date.now() - 15000),
            location: 'Line A'
          },
          {
            id: 'alert_002',
            type: 'delay',
            message: 'Bundle M-189 behind schedule by 2 hours',
            severity: 'medium',
            timestamp: new Date(Date.now() - 45000),
            location: 'Line B'
          }
        ],
        hourlyProduction: Array.from({ length: 24 }, (_, i) => ({
          hour: `${i.toString().padStart(2, '0')}:00`,
          target: 380,
          actual: Math.floor(350 + Math.random() * 80),
          efficiency: Math.floor(85 + Math.random() * 20)
        }))
      };
    };

    // Initial load
    setMetrics(generateMockMetrics());

    // Auto refresh
    if (autoRefresh) {
      const interval = setInterval(() => {
        setMetrics(generateMockMetrics());
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, workingOperators.length]);

  const updateCurrentShift = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 14) {
      setCurrentShift('morning');
    } else if (hour >= 14 && hour < 22) {
      setCurrentShift('evening');
    } else {
      setCurrentShift('night');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getEfficiencyColor = (efficiency: number): string => {
    if (efficiency >= 100) return 'text-green-600';
    if (efficiency >= 85) return 'text-blue-600';
    if (efficiency >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAlertColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'border-red-600 bg-red-50 text-red-800';
      case 'high': return 'border-orange-500 bg-orange-50 text-orange-800';
      case 'medium': return 'border-yellow-500 bg-yellow-50 text-yellow-800';
      default: return 'border-blue-500 bg-blue-50 text-blue-800';
    }
  };

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg">Loading production data...</span>
      </div>
    );
  }

  const tvLayout = displayMode === 'tv';
  const cardClass = tvLayout ? 'text-lg' : 'text-sm';
  const titleClass = tvLayout ? 'text-2xl' : 'text-lg';
  const metricClass = tvLayout ? 'text-3xl' : 'text-xl';

  return (
    <div className={`${tvLayout ? 'bg-gray-900 text-white min-h-screen p-6' : 'bg-gray-50 p-4'} ${className}`}>
      {/* Header */}
      <div className={`flex items-center justify-between mb-6 ${tvLayout ? 'border-b border-gray-700 pb-4' : ''}`}>
        <div className="flex items-center gap-4">
          <div className={`${tvLayout ? 'text-4xl font-bold text-white' : 'text-2xl font-bold text-gray-900'}`}>
            🏭 TSA Production Live Dashboard
          </div>
          <div className={`flex items-center gap-2 ${tvLayout ? 'text-lg' : 'text-sm'} text-gray-${tvLayout ? '300' : '600'}`}>
            <SignalIcon className={`h-5 w-5 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
            {isConnected ? 'Live' : 'Offline'}
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className={`text-right ${tvLayout ? 'text-lg' : 'text-sm'}`}>
            <div className={`${tvLayout ? 'text-2xl font-mono' : 'text-xl font-mono'} ${tvLayout ? 'text-white' : 'text-gray-900'}`}>
              {currentTime.toLocaleTimeString()}
            </div>
            <div className={`text-${tvLayout ? 'gray-300' : 'gray-600'} capitalize`}>
              {currentShift} Shift
            </div>
          </div>
          
          {displayMode === 'desktop' && (
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              <TvIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className={`grid gap-6 ${tvLayout ? 'grid-cols-4' : 'grid-cols-1 lg:grid-cols-3'}`}>
        {/* Key Metrics */}
        <div className={`${tvLayout ? 'col-span-4' : 'col-span-full'} grid gap-4 ${tvLayout ? 'grid-cols-6' : 'grid-cols-2 lg:grid-cols-6'}`}>
          <Card className={`${tvLayout ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ChartBarIcon className={`h-5 w-5 ${tvLayout ? 'text-blue-400' : 'text-blue-600'}`} />
                <span className={`text-${tvLayout ? 'gray-300' : 'gray-600'} ${cardClass}`}>Total Production</span>
              </div>
              <div className={`${metricClass} font-bold ${tvLayout ? 'text-white' : 'text-gray-900'}`}>
                {formatNumber(metrics.totalPieces)}
              </div>
              <div className={`text-${tvLayout ? 'gray-400' : 'gray-500'} text-sm`}>
                pieces today
              </div>
            </CardContent>
          </Card>

          <Card className={`${tvLayout ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircleIcon className={`h-5 w-5 ${tvLayout ? 'text-green-400' : 'text-green-600'}`} />
                <span className={`text-${tvLayout ? 'gray-300' : 'gray-600'} ${cardClass}`}>Completed</span>
              </div>
              <div className={`${metricClass} font-bold ${tvLayout ? 'text-white' : 'text-gray-900'}`}>
                {formatNumber(metrics.completedToday)}
              </div>
              <div className={`text-${tvLayout ? 'gray-400' : 'gray-500'} text-sm`}>
                {Math.round((metrics.completedToday / metrics.totalPieces) * 100)}% complete
              </div>
            </CardContent>
          </Card>

          <Card className={`${tvLayout ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserGroupIcon className={`h-5 w-5 ${tvLayout ? 'text-purple-400' : 'text-purple-600'}`} />
                <span className={`text-${tvLayout ? 'gray-300' : 'gray-600'} ${cardClass}`}>Active Operators</span>
              </div>
              <div className={`${metricClass} font-bold ${tvLayout ? 'text-white' : 'text-gray-900'}`}>
                {connectedOperators.length}
              </div>
              <div className={`text-${tvLayout ? 'gray-400' : 'gray-500'} text-sm`}>
                {workingOperators.length} working
              </div>
            </CardContent>
          </Card>

          <Card className={`${tvLayout ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowTrendingUpIcon className={`h-5 w-5 ${tvLayout ? 'text-blue-400' : 'text-blue-600'}`} />
                <span className={`text-${tvLayout ? 'gray-300' : 'gray-600'} ${cardClass}`}>Efficiency</span>
              </div>
              <div className={`${metricClass} font-bold ${getEfficiencyColor(metrics.averageEfficiency)}`}>
                {metrics.averageEfficiency.toFixed(1)}%
              </div>
              <div className={`text-${tvLayout ? 'gray-400' : 'gray-500'} text-sm flex items-center gap-1`}>
                {metrics.averageEfficiency > 100 ? (
                  <ArrowTrendingUpIcon className="h-3 w-3 text-green-500" />
                ) : (
                  <ArrowTrendingDownIcon className="h-3 w-3 text-red-500" />
                )}
                target: 85%
              </div>
            </CardContent>
          </Card>

          <Card className={`${tvLayout ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CurrencyRupeeIcon className={`h-5 w-5 ${tvLayout ? 'text-green-400' : 'text-green-600'}`} />
                <span className={`text-${tvLayout ? 'gray-300' : 'gray-600'} ${cardClass}`}>Earnings</span>
              </div>
              <div className={`${metricClass} font-bold ${tvLayout ? 'text-white' : 'text-gray-900'}`}>
                ₹{formatNumber(metrics.earnings.total)}
              </div>
              <div className={`text-${tvLayout ? 'gray-400' : 'gray-500'} text-sm`}>
                today
              </div>
            </CardContent>
          </Card>

          <Card className={`${tvLayout ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ExclamationTriangleIcon className={`h-5 w-5 ${tvLayout ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <span className={`text-${tvLayout ? 'gray-300' : 'gray-600'} ${cardClass}`}>Quality Issues</span>
              </div>
              <div className={`${metricClass} font-bold ${tvLayout ? 'text-white' : 'text-gray-900'}`}>
                {metrics.qualityIssues}
              </div>
              <div className={`text-${tvLayout ? 'gray-400' : 'gray-500'} text-sm`}>
                {((metrics.qualityIssues / metrics.totalPieces) * 100).toFixed(1)}% rate
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shift Performance */}
        <Card className={`${tvLayout ? 'bg-gray-800 border-gray-700' : ''}`}>
          <CardHeader>
            <CardTitle className={`${titleClass} ${tvLayout ? 'text-white' : 'text-gray-900'}`}>
              Shift Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(metrics.shifts).map(([shift, data]) => (
                <div key={shift} className={`flex justify-between items-center p-3 rounded-lg ${
                  shift === currentShift 
                    ? (tvLayout ? 'bg-blue-900 border border-blue-600' : 'bg-blue-50 border border-blue-200')
                    : (tvLayout ? 'bg-gray-700' : 'bg-gray-50')
                }`}>
                  <div>
                    <div className={`font-semibold capitalize ${tvLayout ? 'text-white' : 'text-gray-900'}`}>
                      {shift}
                      {shift === currentShift && (
                        <Badge variant="default" className="ml-2 text-xs">ACTIVE</Badge>
                      )}
                    </div>
                    <div className={`text-sm text-${tvLayout ? 'gray-300' : 'gray-600'}`}>
                      {data.active} operators • {formatNumber(data.pieces)} pieces
                    </div>
                  </div>
                  <div className={`text-right`}>
                    <div className={`text-lg font-bold ${getEfficiencyColor(data.efficiency)}`}>
                      {data.efficiency}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className={`${tvLayout ? 'bg-gray-800 border-gray-700' : ''}`}>
          <CardHeader>
            <CardTitle className={`${titleClass} ${tvLayout ? 'text-white' : 'text-gray-900'}`}>
              🏆 Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.topPerformers.slice(0, 5).map((performer, index) => (
                <div key={performer.id} className={`flex items-center justify-between p-2 rounded ${
                  tvLayout ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-500 text-white' :
                      (tvLayout ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700')
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className={`font-medium ${tvLayout ? 'text-white' : 'text-gray-900'}`}>
                        {performer.name}
                      </div>
                      <div className={`text-sm text-${tvLayout ? 'gray-300' : 'gray-600'}`}>
                        {performer.pieces} pieces
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${getEfficiencyColor(performer.efficiency)}`}>
                      {performer.efficiency}%
                    </div>
                    <div className={`text-sm text-${tvLayout ? 'gray-300' : 'gray-600'}`}>
                      ₹{formatNumber(performer.earnings)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        {showAlerts && metrics.alerts.length > 0 && (
          <Card className={`${tvLayout ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardHeader>
              <CardTitle className={`${titleClass} ${tvLayout ? 'text-white' : 'text-gray-900'}`}>
                🚨 Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.alerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${getAlertColor(alert.severity)}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-sm">{alert.message}</div>
                        <div className="text-xs opacity-75 mt-1">
                          📍 {alert.location} • {alert.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Target Progress */}
        <Card className={`${tvLayout ? 'col-span-4 bg-gray-800 border-gray-700' : 'col-span-full'}`}>
          <CardHeader>
            <CardTitle className={`${titleClass} ${tvLayout ? 'text-white' : 'text-gray-900'}`}>
              📊 Production Timeline (Last 24 Hours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-12 gap-2">
              {metrics.hourlyProduction.slice(-12).map((hour, index) => (
                <div key={hour.hour} className="text-center">
                  <div className={`text-xs text-${tvLayout ? 'gray-300' : 'gray-600'} mb-1`}>
                    {hour.hour}
                  </div>
                  <div className={`h-16 bg-${tvLayout ? 'gray-700' : 'gray-200'} rounded relative overflow-hidden`}>
                    <div 
                      className="bg-blue-500 absolute bottom-0 w-full rounded transition-all duration-500"
                      style={{ height: `${(hour.actual / hour.target) * 100}%` }}
                    />
                    <div 
                      className="bg-blue-300 absolute bottom-0 w-full opacity-50"
                      style={{ height: `${Math.min(100, (hour.actual / hour.target) * 100)}%` }}
                    />
                  </div>
                  <div className={`text-xs mt-1 font-medium ${
                    hour.efficiency >= 100 ? 'text-green-500' : 
                    hour.efficiency >= 85 ? 'text-blue-500' : 'text-red-500'
                  }`}>
                    {hour.efficiency}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auto-refresh indicator */}
      <div className={`fixed bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg ${
        tvLayout ? 'bg-gray-800 border border-gray-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
      } shadow-lg`}>
        <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
        <span className="text-sm">
          {isConnected ? 'Live Updates' : 'Connection Lost'}
        </span>
      </div>
    </div>
  );
};

export default LiveProductionDashboard;