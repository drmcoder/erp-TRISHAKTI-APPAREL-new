// Login Analytics Dashboard
// Comprehensive login frequency and detail analytics for admin

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Input } from '@/shared/components/ui/Input';
import { 
  BarChart3, TrendingUp, Calendar, Clock, Users, AlertTriangle,
  Search, Filter, Download, Eye, MapPin, Smartphone, Monitor,
  Activity, UserCheck, UserX, Shield, RefreshCw
} from 'lucide-react';
import { trustedDeviceService, type TrustedDevice, type LoginAttempt } from '@/services/trusted-device-service';
import { cn } from '@/shared/utils';

interface LoginFrequencyStats {
  operatorId: string;
  operatorName: string;
  totalLogins: number;
  successfulLogins: number;
  failedLogins: number;
  loginDates: Date[];
  averageLoginsPerDay: number;
  loginStreak: number;
  lastLoginDate: Date;
  deviceCount: number;
  trustedDevices: number;
  loginTimes: { hour: number; count: number }[];
  loginDays: { day: string; count: number }[];
  suspiciousActivity: boolean;
}

interface DailyLoginData {
  date: string;
  successful: number;
  failed: number;
  operators: string[];
}

const LoginAnalyticsDashboard: React.FC = () => {
  const [devices, setDevices] = useState<TrustedDevice[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<string>('');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [realTimeAlerts, setRealTimeAlerts] = useState<any[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    loadLoginData();
    startRealTimeMonitoring();
  }, []);

  const loadLoginData = () => {
    const allDevices = JSON.parse(localStorage.getItem('tsaerp_trusted_devices') || '[]');
    setDevices(allDevices);
    setLastRefresh(new Date());
  };

  // Real-time monitoring system
  const startRealTimeMonitoring = () => {
    const interval = setInterval(() => {
      if (isMonitoring) {
        checkForNewLogins();
        detectSuspiciousActivity();
        setLastRefresh(new Date());
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  };

  const checkForNewLogins = () => {
    const allDevices = JSON.parse(localStorage.getItem('tsaerp_trusted_devices') || '[]');
    const newDevices = allDevices.filter((device: TrustedDevice) => 
      new Date(device.lastLoginDate).getTime() > lastRefresh.getTime()
    );

    if (newDevices.length > 0) {
      const alerts = newDevices.map((device: TrustedDevice) => ({
        id: `login_${Date.now()}_${device.deviceId}`,
        type: 'new_login',
        severity: 'info',
        message: `New login: ${device.operatorName}`,
        timestamp: new Date(),
        operatorId: device.operatorId,
        deviceId: device.deviceId,
        trusted: device.isTrusted
      }));
      
      setRealTimeAlerts(prev => [...alerts, ...prev].slice(0, 50)); // Keep latest 50 alerts
      setDevices(allDevices);
    }
  };

  const detectSuspiciousActivity = () => {
    const recentLogins = devices.flatMap(device => 
      device.loginHistory
        .filter(login => new Date(login.timestamp).getTime() > Date.now() - 600000) // Last 10 minutes
        .map(login => ({ ...login, deviceId: device.deviceId, operatorName: device.operatorName }))
    );

    // Detect multiple failed logins
    const failedLogins = recentLogins.filter(login => !login.success);
    if (failedLogins.length > 5) {
      const alert = {
        id: `suspicious_${Date.now()}`,
        type: 'suspicious_activity',
        severity: 'warning',
        message: `${failedLogins.length} failed login attempts in last 10 minutes`,
        timestamp: new Date(),
        details: failedLogins
      };
      setRealTimeAlerts(prev => [alert, ...prev].slice(0, 50));
    }

    // Detect multiple device logins for same operator
    const operatorDevices = new Map();
    recentLogins.forEach(login => {
      if (!operatorDevices.has(login.operatorId)) {
        operatorDevices.set(login.operatorId, new Set());
      }
      operatorDevices.get(login.operatorId).add(login.deviceId);
    });

    operatorDevices.forEach((devices, operatorId) => {
      if (devices.size > 2) {
        const alert = {
          id: `multi_device_${Date.now()}_${operatorId}`,
          type: 'multi_device_login',
          severity: 'warning',
          message: `Operator logged in from ${devices.size} different devices recently`,
          timestamp: new Date(),
          operatorId,
          deviceCount: devices.size
        };
        setRealTimeAlerts(prev => [alert, ...prev].slice(0, 50));
      }
    });
  };

  // Calculate comprehensive login frequency statistics
  const loginStats = useMemo((): LoginFrequencyStats[] => {
    const operatorMap = new Map<string, LoginFrequencyStats>();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90));

    devices.forEach(device => {
      const operatorId = device.operatorId;
      
      if (!operatorMap.has(operatorId)) {
        operatorMap.set(operatorId, {
          operatorId,
          operatorName: device.operatorName,
          totalLogins: 0,
          successfulLogins: 0,
          failedLogins: 0,
          loginDates: [],
          averageLoginsPerDay: 0,
          loginStreak: 0,
          lastLoginDate: new Date(device.lastLoginDate),
          deviceCount: 0,
          trustedDevices: 0,
          loginTimes: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 })),
          loginDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({ day, count: 0 })),
          suspiciousActivity: false
        });
      }

      const stats = operatorMap.get(operatorId)!;
      stats.deviceCount++;
      if (device.isTrusted) stats.trustedDevices++;

      // Process login history within date range
      device.loginHistory
        .filter(login => new Date(login.timestamp) >= cutoffDate)
        .forEach(login => {
          stats.totalLogins++;
          if (login.success) {
            stats.successfulLogins++;
            stats.loginDates.push(new Date(login.timestamp));
            
            // Track login times (hours)
            const hour = new Date(login.timestamp).getHours();
            stats.loginTimes[hour].count++;
            
            // Track login days
            const dayIndex = new Date(login.timestamp).getDay();
            const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex];
            const dayData = stats.loginDays.find(d => d.day === dayName);
            if (dayData) dayData.count++;
          } else {
            stats.failedLogins++;
          }
        });

      // Calculate averages and patterns
      const days = Math.max(1, (Date.now() - cutoffDate.getTime()) / (1000 * 60 * 60 * 24));
      stats.averageLoginsPerDay = stats.successfulLogins / days;

      // Calculate login streak (consecutive days with logins)
      stats.loginStreak = calculateLoginStreak(stats.loginDates);

      // Detect suspicious activity
      stats.suspiciousActivity = checkOperatorSuspiciousActivity(stats, device);
    });

    return Array.from(operatorMap.values())
      .filter(stat => 
        !searchTerm || 
        stat.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stat.operatorId.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => b.totalLogins - a.totalLogins);
  }, [devices, dateRange, searchTerm]);

  // Daily login aggregation for charts
  const dailyLoginData = useMemo((): DailyLoginData[] => {
    const dailyMap = new Map<string, DailyLoginData>();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90));

    devices.forEach(device => {
      device.loginHistory
        .filter(login => new Date(login.timestamp) >= cutoffDate)
        .forEach(login => {
          const dateStr = new Date(login.timestamp).toISOString().split('T')[0];
          
          if (!dailyMap.has(dateStr)) {
            dailyMap.set(dateStr, {
              date: dateStr,
              successful: 0,
              failed: 0,
              operators: []
            });
          }

          const dayData = dailyMap.get(dateStr)!;
          if (login.success) {
            dayData.successful++;
          } else {
            dayData.failed++;
          }
          
          if (!dayData.operators.includes(device.operatorId)) {
            dayData.operators.push(device.operatorId);
          }
        });
    });

    return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [devices, dateRange]);

  const calculateLoginStreak = (loginDates: Date[]): number => {
    if (loginDates.length === 0) return 0;
    
    const uniqueDays = [...new Set(loginDates.map(d => d.toISOString().split('T')[0]))];
    uniqueDays.sort();
    
    let streak = 1;
    let maxStreak = 1;
    
    for (let i = 1; i < uniqueDays.length; i++) {
      const prevDate = new Date(uniqueDays[i - 1]);
      const currDate = new Date(uniqueDays[i]);
      const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      } else {
        streak = 1;
      }
    }
    
    return maxStreak;
  };

  const checkOperatorSuspiciousActivity = (stats: LoginFrequencyStats, device: TrustedDevice): boolean => {
    // Multiple rapid logins
    if (stats.failedLogins > 10) return true;
    
    // Too many devices for one operator
    if (stats.deviceCount > 5) return true;
    
    // Unusual login frequency
    if (stats.averageLoginsPerDay > 10) return true;
    
    return false;
  };

  const getLoginFrequencyColor = (frequency: number) => {
    if (frequency > 5) return 'bg-red-100 text-red-800';
    if (frequency > 2) return 'bg-yellow-100 text-yellow-800';
    if (frequency > 1) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-green-600" />;
    return <TrendingUp className="w-4 h-4 text-red-600 transform rotate-180" />;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const overallStats = useMemo(() => {
    const totalOperators = loginStats.length;
    const totalLogins = loginStats.reduce((sum, stat) => sum + stat.totalLogins, 0);
    const totalSuccessful = loginStats.reduce((sum, stat) => sum + stat.successfulLogins, 0);
    const totalFailed = loginStats.reduce((sum, stat) => sum + stat.failedLogins, 0);
    const suspiciousOperators = loginStats.filter(stat => stat.suspiciousActivity).length;
    const averageLoginsPerOperator = totalOperators > 0 ? totalLogins / totalOperators : 0;

    return {
      totalOperators,
      totalLogins,
      totalSuccessful,
      totalFailed,
      suspiciousOperators,
      averageLoginsPerOperator,
      successRate: totalLogins > 0 ? (totalSuccessful / totalLogins) * 100 : 0
    };
  }, [loginStats]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Login Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive login frequency and pattern analysis
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={loadLoginData}
          >
            Refresh
          </Button>
          <Button 
            variant="outline" 
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Data
          </Button>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-xl font-bold text-gray-900">{overallStats.totalOperators}</p>
                <p className="text-xs text-gray-500">Total Operators</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-xl font-bold text-gray-900">{overallStats.totalLogins}</p>
                <p className="text-xs text-gray-500">Total Logins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-xl font-bold text-green-700">{overallStats.totalSuccessful}</p>
                <p className="text-xs text-gray-500">Successful</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="flex items-center space-x-2">
              <UserX className="w-6 h-6 text-red-600" />
              <div>
                <p className="text-xl font-bold text-red-700">{overallStats.totalFailed}</p>
                <p className="text-xs text-gray-500">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              <div>
                <p className="text-xl font-bold text-gray-900">{overallStats.successRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              <div>
                <p className="text-xl font-bold text-orange-700">{overallStats.suspiciousOperators}</p>
                <p className="text-xs text-gray-500">Suspicious</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-Time Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Real-Time Security Alerts
              {realTimeAlerts.length > 0 && (
                <Badge className="bg-red-100 text-red-800">
                  {realTimeAlerts.length}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMonitoring(!isMonitoring)}
                className={isMonitoring ? "text-green-600" : "text-gray-600"}
              >
                {isMonitoring ? "● Live" : "○ Paused"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRealTimeAlerts([])}
              >
                Clear All
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {realTimeAlerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No security alerts</p>
                <p className="text-sm">System monitoring active</p>
              </div>
            ) : (
              realTimeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "p-3 rounded-lg border-l-4 flex items-start justify-between",
                    alert.severity === 'warning' ? "bg-yellow-50 border-yellow-400" :
                    alert.severity === 'error' ? "bg-red-50 border-red-400" :
                    "bg-blue-50 border-blue-400"
                  )}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {alert.type === 'new_login' && <UserCheck className="w-4 h-4 text-blue-600" />}
                      {alert.type === 'suspicious_activity' && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
                      {alert.type === 'multi_device_login' && <Smartphone className="w-4 h-4 text-orange-600" />}
                      <span className="font-medium text-sm">{alert.message}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {alert.timestamp.toLocaleTimeString()}
                    </p>
                    {alert.operatorId && (
                      <Badge className="mt-1 text-xs">
                        ID: {alert.operatorId}
                      </Badge>
                    )}
                  </div>
                  <button
                    onClick={() => setRealTimeAlerts(prev => prev.filter(a => a.id !== alert.id))}
                    className="text-gray-400 hover:text-gray-600 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 text-xs text-gray-500 flex justify-between">
            <span>Last refresh: {lastRefresh.toLocaleTimeString()}</span>
            <span>Monitoring: {isMonitoring ? "Active" : "Paused"}</span>
          </div>
        </CardContent>
      </Card>

      {/* Daily Login Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Daily Login Trends ({dateRange})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-1 bg-gray-50 p-4 rounded">
            {dailyLoginData.slice(-14).map((day, index) => (
              <div key={day.date} className="flex flex-col items-center flex-1">
                <div className="flex flex-col items-center space-y-1 mb-2">
                  <div 
                    className="w-full bg-green-500 rounded-t"
                    style={{ 
                      height: `${Math.max(4, (day.successful / Math.max(...dailyLoginData.map(d => d.successful + d.failed))) * 150)}px` 
                    }}
                  />
                  {day.failed > 0 && (
                    <div 
                      className="w-full bg-red-500 rounded-b"
                      style={{ 
                        height: `${Math.max(2, (day.failed / Math.max(...dailyLoginData.map(d => d.successful + d.failed))) * 150)}px` 
                      }}
                    />
                  )}
                </div>
                <div className="text-xs text-gray-600 text-center">
                  <div className="font-medium">{day.successful + day.failed}</div>
                  <div>{formatDate(day.date).split('/')[1]}/{formatDate(day.date).split('/')[0]}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span>Successful Logins</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded" />
              <span>Failed Logins</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                leftIcon={<Search className="w-4 h-4" />}
                placeholder="Search operators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                clearable
                onClear={() => setSearchTerm('')}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={dateRange === '7d' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setDateRange('7d')}
              >
                7 Days
              </Button>
              <Button
                variant={dateRange === '30d' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setDateRange('30d')}
              >
                30 Days
              </Button>
              <Button
                variant={dateRange === '90d' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setDateRange('90d')}
              >
                90 Days
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operator Login Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Operator Login Frequency ({loginStats.length} operators)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loginStats.map((stat) => (
              <div key={stat.operatorId}>
                <div
                  className={cn(
                    "flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all duration-200",
                    showDetails === stat.operatorId ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                  )}
                  onClick={() => setShowDetails(showDetails === stat.operatorId ? null : stat.operatorId)}
                >
                  {/* Operator Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900">{stat.operatorName}</h3>
                      <Badge className={getLoginFrequencyColor(stat.averageLoginsPerDay)}>
                        {stat.averageLoginsPerDay.toFixed(1)}/day
                      </Badge>
                      {stat.suspiciousActivity && (
                        <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Suspicious
                        </Badge>
                      )}
                      {stat.trustedDevices > 0 && (
                        <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          {stat.trustedDevices} trusted
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Total:</span>
                        <span className="ml-1 font-medium">{stat.totalLogins}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Success:</span>
                        <span className="ml-1 font-medium text-green-600">{stat.successfulLogins}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Failed:</span>
                        <span className="ml-1 font-medium text-red-600">{stat.failedLogins}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Devices:</span>
                        <span className="ml-1 font-medium">{stat.deviceCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Streak:</span>
                        <span className="ml-1 font-medium">{stat.loginStreak} days</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-500 text-xs">
                          {Math.floor((Date.now() - stat.lastLoginDate.getTime()) / (1000 * 60 * 60 * 24))} days ago
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>

                {/* Expanded Details */}
                {showDetails === stat.operatorId && (
                  <div className="ml-4 mt-3 p-4 bg-gray-50 rounded-lg space-y-4">
                    {/* Login Time Distribution */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Login Time Distribution (24h)</h4>
                      <div className="flex items-end gap-1 h-16 bg-white p-2 rounded">
                        {stat.loginTimes.map((time) => (
                          <div
                            key={time.hour}
                            className="flex-1 bg-blue-500 rounded-t"
                            style={{ 
                              height: time.count > 0 ? `${Math.max(4, (time.count / Math.max(...stat.loginTimes.map(t => t.count))) * 50)}px` : '2px'
                            }}
                            title={`${time.hour}:00 - ${time.count} logins`}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>00</span>
                        <span>06</span>
                        <span>12</span>
                        <span>18</span>
                        <span>24</span>
                      </div>
                    </div>

                    {/* Weekly Pattern */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Weekly Login Pattern</h4>
                      <div className="grid grid-cols-7 gap-2">
                        {stat.loginDays.map((day) => (
                          <div key={day.day} className="text-center">
                            <div 
                              className="w-full bg-green-500 rounded mb-1"
                              style={{ 
                                height: `${Math.max(8, (day.count / Math.max(...stat.loginDays.map(d => d.count))) * 40)}px` 
                              }}
                            />
                            <div className="text-xs text-gray-600">{day.day}</div>
                            <div className="text-xs font-medium">{day.count}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Login History */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Recent Login Activity</h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {devices
                          .filter(d => d.operatorId === stat.operatorId)
                          .flatMap(d => d.loginHistory.slice(-10))
                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                          .slice(0, 10)
                          .map((login, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm p-2 bg-white rounded">
                              {login.success ? (
                                <UserCheck className="w-3 h-3 text-green-600" />
                              ) : (
                                <UserX className="w-3 h-3 text-red-600" />
                              )}
                              <span className="text-xs text-gray-500">
                                {new Date(login.timestamp).toLocaleString()}
                              </span>
                              <Badge className={login.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                {login.success ? 'Success' : 'Failed'}
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginAnalyticsDashboard;