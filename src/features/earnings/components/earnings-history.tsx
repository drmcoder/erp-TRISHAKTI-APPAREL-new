import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { Calendar } from '@/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { 
  CalendarIcon,
  Download,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  CheckCircle2,
  Clock,
  BarChart3,
  Target
} from 'lucide-react';
import { operatorWalletService } from '@/services/operator-wallet-service';
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';
import { toast } from 'sonner';

interface EarningsRecord {
  id: string;
  bundleId: string;
  operatorId: string;
  workType: string;
  piecesCompleted: number;
  ratePerPiece: number;
  totalEarnings: number;
  qualityGrade: string;
  completedAt: Date;
  approvedAt?: Date;
  paymentStatus: 'pending' | 'approved' | 'paid' | 'hold';
  bonusAmount?: number;
  penaltyAmount?: number;
  notes?: string;
}

interface EarningSummary {
  totalEarnings: number;
  totalPieces: number;
  averageRate: number;
  bonusEarnings: number;
  penaltyDeductions: number;
  periodComparison: {
    current: number;
    previous: number;
    changePercentage: number;
  };
}

interface EarningsHistoryProps {
  operatorId: string;
}

const PAYMENT_STATUS_CONFIG = {
  pending: { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800', icon: CheckCircle2 },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  hold: { label: 'On Hold', color: 'bg-red-100 text-red-800', icon: Clock }
};

const QUALITY_GRADES = {
  'A+': { label: 'Excellent', color: 'bg-green-100 text-green-800' },
  'A': { label: 'Good', color: 'bg-blue-100 text-blue-800' },
  'B': { label: 'Average', color: 'bg-yellow-100 text-yellow-800' },
  'C': { label: 'Below Average', color: 'bg-orange-100 text-orange-800' },
  'D': { label: 'Poor', color: 'bg-red-100 text-red-800' }
};

export const EarningsHistory: React.FC<EarningsHistoryProps> = ({ operatorId }) => {
  const [earningsData, setEarningsData] = useState<EarningsRecord[]>([]);
  const [summary, setSummary] = useState<EarningSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [sortBy, setSortBy] = useState<'date' | 'earnings' | 'pieces'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadEarningsHistory();
  }, [operatorId, selectedPeriod]);

  const loadEarningsHistory = async () => {
    try {
      setLoading(true);
      const [earnings, summaryData] = await Promise.all([
        operatorWalletService.getEarningsHistory(operatorId, selectedPeriod),
        operatorWalletService.getEarningsSummary(operatorId, selectedPeriod)
      ]);
      
      setEarningsData(earnings);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading earnings history:', error);
      toast.error('Failed to load earnings history');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      await operatorWalletService.exportEarningsHistory(operatorId, {
        period: selectedPeriod,
        dateRange,
        format: 'xlsx'
      });
      toast.success('Earnings data exported successfully');
    } catch (error) {
      toast.error('Failed to export earnings data');
    }
  };

  const filteredAndSortedEarnings = earningsData
    .filter(earning => {
      const matchesSearch = 
        earning.bundleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        earning.workType.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || earning.paymentStatus === statusFilter;
      const matchesGrade = gradeFilter === 'all' || earning.qualityGrade === gradeFilter;
      
      const matchesDateRange = !dateRange.from || !dateRange.to || 
        isWithinInterval(new Date(earning.completedAt), { start: dateRange.from, end: dateRange.to });
      
      return matchesSearch && matchesStatus && matchesGrade && matchesDateRange;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
          break;
        case 'earnings':
          comparison = a.totalEarnings - b.totalEarnings;
          break;
        case 'pieces':
          comparison = a.piecesCompleted - b.piecesCompleted;
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Earnings History</h2>
          <p className="text-muted-foreground">Detailed breakdown of work completion and earnings</p>
        </div>
        <Button onClick={handleExportData}>
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{summary.totalEarnings.toFixed(2)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {summary.periodComparison.changePercentage >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                )}
                {Math.abs(summary.periodComparison.changePercentage).toFixed(1)}% vs last period
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pieces Completed</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalPieces}</div>
              <p className="text-xs text-muted-foreground">Total work completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{summary.averageRate.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Per piece</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bonus Earned</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₹{summary.bonusEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Quality bonuses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deductions</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">₹{summary.penaltyDeductions.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Penalties applied</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bundles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="hold">On Hold</SelectItem>
              </SelectContent>
            </Select>

            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Quality Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="A+">A+ (Excellent)</SelectItem>
                <SelectItem value="A">A (Good)</SelectItem>
                <SelectItem value="B">B (Average)</SelectItem>
                <SelectItem value="C">C (Below Average)</SelectItem>
                <SelectItem value="D">D (Poor)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="earnings">Earnings</SelectItem>
                <SelectItem value="pieces">Pieces</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Date Range
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => setDateRange(range || {})}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Earnings Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Work Completion Records</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'} Sort
              </Button>
            </div>
          </div>
          <CardDescription>
            Showing {filteredAndSortedEarnings.length} of {earningsData.length} records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAndSortedEarnings.length === 0 ? (
            <div className="text-center py-8">
              <IndianRupee className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No earnings records found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || gradeFilter !== 'all'
                  ? 'No records match your current filters'
                  : 'No work has been completed yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAndSortedEarnings.map(earning => {
                const statusConfig = PAYMENT_STATUS_CONFIG[earning.paymentStatus];
                const gradeConfig = QUALITY_GRADES[earning.qualityGrade as keyof typeof QUALITY_GRADES];
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div key={earning.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        {/* Header Row */}
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="font-mono">
                            {earning.bundleId}
                          </Badge>
                          <Badge className={statusConfig.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                          <Badge className={gradeConfig.color}>
                            Grade {earning.qualityGrade}
                          </Badge>
                        </div>

                        {/* Work Details */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Work Type:</span>
                            <p className="font-medium">{earning.workType}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Pieces:</span>
                            <p className="font-bold text-blue-600">{earning.piecesCompleted}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Rate per Piece:</span>
                            <p className="font-medium">₹{earning.ratePerPiece.toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Completed:</span>
                            <p className="font-medium">{format(new Date(earning.completedAt), 'MMM dd, yyyy')}</p>
                          </div>
                        </div>

                        {/* Earnings Breakdown */}
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center">
                            <span className="text-muted-foreground mr-2">Base:</span>
                            <span className="font-semibold">₹{earning.totalEarnings.toFixed(2)}</span>
                          </div>
                          {earning.bonusAmount && earning.bonusAmount > 0 && (
                            <div className="flex items-center text-green-600">
                              <span className="mr-2">Bonus:</span>
                              <span className="font-semibold">+₹{earning.bonusAmount.toFixed(2)}</span>
                            </div>
                          )}
                          {earning.penaltyAmount && earning.penaltyAmount > 0 && (
                            <div className="flex items-center text-red-600">
                              <span className="mr-2">Penalty:</span>
                              <span className="font-semibold">-₹{earning.penaltyAmount.toFixed(2)}</span>
                            </div>
                          )}
                        </div>

                        {earning.notes && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Notes:</span>
                            <p className="text-sm bg-muted p-2 rounded mt-1">{earning.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Total Earnings */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          ₹{(
                            earning.totalEarnings + 
                            (earning.bonusAmount || 0) - 
                            (earning.penaltyAmount || 0)
                          ).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {earning.approvedAt ? (
                            `Approved ${format(new Date(earning.approvedAt), 'MMM dd')}`
                          ) : (
                            'Pending approval'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EarningsHistory;