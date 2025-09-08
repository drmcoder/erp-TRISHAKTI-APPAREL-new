import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/Badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package,
  Target,
  Clock,
  IndianRupee,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { analyticsService } from '@/services/analytics-service';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'sonner';

interface ProductionMetrics {
  totalProduction: number;
  dailyAverage: number;
  efficiency: number;
  qualityScore: number;
  activeOperators: number;
  completedBundles: number;
  pendingWork: number;
  damageRate: number;
  reworkPercentage: number;
  onTimeDelivery: number;
}

interface TrendData {
  date: string;
  production: number;
  quality: number;
  efficiency: number;
}

interface OperatorPerformance {
  operatorId: string;
  name: string;
  totalPieces: number;
  efficiency: number;
  qualityScore: number;
  earnings: number;
  rank: number;
}

interface WorkTypeAnalysis {
  workType: string;
  count: number;
  averageTime: number;
  qualityScore: number;
  earnings: number;
  color: string;
}

interface ProductionDashboardProps {
  timeRange?: 'today' | 'week' | 'month' | 'quarter' | 'year';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const QUALITY_GRADES = {
  'A+': { score: 95, color: '#10B981' },
  'A': { score: 85, color: '#3B82F6' },
  'B': { score: 75, color: '#F59E0B' },
  'C': { score: 65, color: '#EF4444' },
  'D': { score: 50, color: '#DC2626' }
};

export const ProductionDashboard: React.FC<ProductionDashboardProps> = ({ timeRange = 'month' }) => {
  const [metrics, setMetrics] = useState<ProductionMetrics | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [operatorPerformance, setOperatorPerformance] = useState<OperatorPerformance[]>([]);
  const [workTypeAnalysis, setWorkTypeAnalysis] = useState<WorkTypeAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(timeRange);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsData, trends, operators, workTypes] = await Promise.all([
        analyticsService.getProductionMetrics(selectedPeriod),
        analyticsService.getProductionTrends(selectedPeriod),
        analyticsService.getOperatorPerformance(selectedPeriod),
        analyticsService.getWorkTypeAnalysis(selectedPeriod)
      ]);

      setMetrics(metricsData);
      setTrendData(trends);
      setOperatorPerformance(Array.isArray(operators) ? operators : []);
      setWorkTypeAnalysis(Array.isArray(workTypes) ? workTypes : []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast.success('Dashboard data refreshed');
  };

  const handleExportReport = async () => {
    try {
      await analyticsService.exportProductionReport(selectedPeriod);
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const getMetricTrend = (current: number, target: number) => {
    const percentage = ((current - target) / target) * 100;
    return {
      value: Math.abs(percentage).toFixed(1),
      isPositive: percentage >= 0,
      isOnTarget: Math.abs(percentage) <= 5
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
          <p className="text-muted-foreground">Production data is not available for the selected period.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Production Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive production analytics and performance metrics</p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod} className="w-40">
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Production</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalProduction?.toLocaleString() || '0'}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              {metrics?.dailyAverage?.toFixed(0) || '0'} pieces/day avg
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.efficiency?.toFixed(1) || '0'}%</div>
            <div className={`flex items-center text-xs ${
              (metrics?.efficiency ?? 0) >= 80 ? 'text-green-600' : 
              (metrics?.efficiency ?? 0) >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {(metrics?.efficiency ?? 0) >= 80 ? (
                <CheckCircle2 className="h-3 w-3 mr-1" />
              ) : (
                <AlertTriangle className="h-3 w-3 mr-1" />
              )}
              Target: 80%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.qualityScore?.toFixed(1) || '0'}%</div>
            <div className={`flex items-center text-xs ${
              (metrics?.qualityScore ?? 0) >= 90 ? 'text-green-600' : 
              (metrics?.qualityScore ?? 0) >= 80 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              Damage Rate: {metrics?.damageRate?.toFixed(1) || '0'}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Operators</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activeOperators || '0'}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {metrics?.completedBundles || '0'} bundles completed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.onTimeDelivery?.toFixed(1) || '0'}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {metrics?.pendingWork || '0'} pending
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Production Trends</span>
          </CardTitle>
          <CardDescription>Daily production, quality, and efficiency trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={Array.isArray(trendData) ? trendData : []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="production" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Production"
                />
                <Line 
                  type="monotone" 
                  dataKey="quality" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Quality %"
                />
                <Line 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  name="Efficiency %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Top Performers</span>
            </CardTitle>
            <CardDescription>Highest performing operators this {selectedPeriod}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(operatorPerformance) && operatorPerformance.length > 0 ? operatorPerformance.slice(0, 5).map((operator, index) => (
                <div key={operator.operatorId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                    }`}>
                      {operator.rank}
                    </div>
                    <div>
                      <p className="font-semibold">{operator.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {operator.totalPieces} pieces | {operator.qualityScore.toFixed(1)}% quality
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {operator.efficiency.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ₹{operator.earnings.toFixed(0)}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center text-muted-foreground py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No operator performance data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Work Type Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Work Type Analysis</span>
            </CardTitle>
            <CardDescription>Production breakdown by work type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Array.isArray(workTypeAnalysis) ? workTypeAnalysis : []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {(workTypeAnalysis || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {(workTypeAnalysis || []).map((workType, index) => (
                <div key={workType.workType} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span>{workType.workType}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-muted-foreground">
                    <span>{workType.count} pieces</span>
                    <span>{workType.qualityScore.toFixed(1)}%</span>
                    <span>₹{workType.earnings.toFixed(0)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quality Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Overall Quality Score</span>
              <span className="font-semibold">{metrics?.qualityScore?.toFixed(1) || '0'}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Damage Rate</span>
              <span className={`font-semibold ${
                (metrics?.damageRate ?? 0) <= 2 ? 'text-green-600' :
                (metrics?.damageRate ?? 0) <= 5 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {metrics?.damageRate?.toFixed(1) || '0'}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Rework Percentage</span>
              <span className={`font-semibold ${
                (metrics?.reworkPercentage ?? 0) <= 3 ? 'text-green-600' :
                (metrics?.reworkPercentage ?? 0) <= 7 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {metrics?.reworkPercentage?.toFixed(1) || '0'}%
              </span>
            </div>
            <div className="pt-2 border-t">
              <div className="text-xs text-muted-foreground mb-2">Quality Grade Distribution</div>
              <div className="space-y-1">
                {Object.entries(QUALITY_GRADES).map(([grade, config]) => (
                  <div key={grade} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: config.color }}
                      ></div>
                      <span>Grade {grade}</span>
                    </div>
                    <span>25%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Overall Efficiency</span>
              <span className="font-semibold">{metrics?.efficiency?.toFixed(1) || '0'}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">On-Time Delivery</span>
              <span className="font-semibold">{metrics?.onTimeDelivery?.toFixed(1) || '0'}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Average Daily Output</span>
              <span className="font-semibold">{metrics?.dailyAverage?.toFixed(0) || '0'} pieces</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Completed Bundles</span>
              <span className="font-semibold">{metrics?.completedBundles || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Pending Work</span>
              <span className={`font-semibold ${
                (metrics?.pendingWork ?? 0) <= 10 ? 'text-green-600' :
                (metrics?.pendingWork ?? 0) <= 25 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {metrics?.pendingWork || '0'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alerts & Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(metrics?.efficiency ?? 0) < 70 && (
              <div className="flex items-start space-x-2 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Low Efficiency Alert</p>
                  <p className="text-xs text-red-600">Current efficiency is below target (70%)</p>
                </div>
              </div>
            )}
            
            {(metrics?.damageRate ?? 0) > 5 && (
              <div className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Quality Concern</p>
                  <p className="text-xs text-yellow-600">Damage rate is above acceptable threshold</p>
                </div>
              </div>
            )}
            
            {(metrics?.onTimeDelivery ?? 0) >= 95 && (
              <div className="flex items-start space-x-2 p-3 bg-green-50 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">Excellent Delivery</p>
                  <p className="text-xs text-green-600">On-time delivery rate exceeds target</p>
                </div>
              </div>
            )}
            
            {(metrics?.pendingWork ?? 0) <= 5 && (
              <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Low Backlog</p>
                  <p className="text-xs text-blue-600">Minimal pending work items</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductionDashboard;