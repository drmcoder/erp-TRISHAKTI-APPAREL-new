import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Separator } from '@/shared/components/ui/separator';
import { 
  Wallet, 
  IndianRupee, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Eye,
  Download,
  Calendar,
  Target
} from 'lucide-react';
import { operatorWalletService } from '@/services/operator-wallet-service';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';

interface WalletData {
  operatorId: string;
  operatorName: string;
  totalEarnings: number;
  availableBalance: number;
  holdAmount: number;
  monthlyEarnings: number;
  weeklyEarnings: number;
  dailyEarnings: number;
  totalWorkCompleted: number;
  averageEarningsPerPiece: number;
  lastPaymentDate: Date;
  nextPaymentDate: Date;
  paymentHolds: PaymentHold[];
  recentTransactions: Transaction[];
  monthlyGoal: number;
  goalProgress: number;
}

interface PaymentHold {
  id: string;
  bundleId: string;
  amount: number;
  reason: string;
  createdAt: Date;
  status: 'active' | 'released' | 'deducted';
}

interface Transaction {
  id: string;
  type: 'earnings' | 'payment' | 'hold' | 'bonus' | 'deduction';
  amount: number;
  description: string;
  bundleId?: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
}

interface OperatorWalletProps {
  operatorId: string;
}

const TRANSACTION_TYPES = {
  earnings: { label: 'Work Completion', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  payment: { label: 'Payment Received', color: 'bg-blue-100 text-blue-800', icon: IndianRupee },
  hold: { label: 'Payment Hold', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  bonus: { label: 'Bonus', color: 'bg-purple-100 text-purple-800', icon: TrendingUp },
  deduction: { label: 'Deduction', color: 'bg-red-100 text-red-800', icon: TrendingDown }
};

export const OperatorWallet: React.FC<OperatorWalletProps> = ({ operatorId }) => {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadWalletData();
  }, [operatorId]);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const data = await operatorWalletService.getWalletData(operatorId);
      setWalletData(data);
    } catch (error) {
      console.error('Error loading wallet data:', error);
      toast.error('Failed to load wallet information');
    } finally {
      setLoading(false);
    }
  };

  const handleExportStatement = async () => {
    try {
      await operatorWalletService.exportStatement(operatorId, selectedPeriod);
      toast.success('Statement exported successfully');
    } catch (error) {
      toast.error('Failed to export statement');
    }
  };

  const handleRequestPayment = async () => {
    if (!walletData || walletData.availableBalance <= 0) {
      toast.error('No available balance for payment request');
      return;
    }

    try {
      await operatorWalletService.requestPayment(operatorId);
      toast.success('Payment request submitted');
      loadWalletData();
    } catch (error) {
      toast.error('Failed to submit payment request');
    }
  };

  const getEarningsForPeriod = (period: 'week' | 'month' | 'year') => {
    if (!walletData) return 0;
    switch (period) {
      case 'week': return walletData.weeklyEarnings;
      case 'month': return walletData.monthlyEarnings;
      case 'year': return walletData.totalEarnings;
      default: return walletData.monthlyEarnings;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!walletData) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Wallet Data Not Available</h3>
          <p className="text-muted-foreground">Unable to load wallet information for this operator.</p>
        </CardContent>
      </Card>
    );
  }

  const goalProgressPercentage = Math.min(100, (walletData.goalProgress / walletData.monthlyGoal) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Wallet</h1>
          <p className="text-muted-foreground">Financial overview for {walletData.operatorName}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportStatement}>
            <Download className="h-4 w-4 mr-2" />
            Export Statement
          </Button>
          <Button onClick={handleRequestPayment} disabled={walletData.availableBalance <= 0}>
            <IndianRupee className="h-4 w-4 mr-2" />
            Request Payment
          </Button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{walletData.availableBalance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hold Amount</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              ₹{walletData.holdAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {walletData.paymentHolds.filter(h => h.status === 'active').length} active holds
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{walletData.monthlyEarnings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{walletData.totalEarnings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Monthly Goal Progress</span>
            </CardTitle>
            <CardDescription>
              Target: ₹{walletData.monthlyGoal.toFixed(2)} | Current: ₹{walletData.goalProgress.toFixed(2)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{goalProgressPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, goalProgressPercentage)}%` }}
                ></div>
              </div>
              <div className="text-xs text-muted-foreground">
                ₹{(walletData.monthlyGoal - walletData.goalProgress).toFixed(2)} remaining to reach goal
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Work Completed</span>
              <span className="font-semibold">{walletData.totalWorkCompleted} pieces</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Avg. per Piece</span>
              <span className="font-semibold">₹{walletData.averageEarningsPerPiece.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Weekly Earnings</span>
              <span className="font-semibold">₹{walletData.weeklyEarnings.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Daily Average</span>
              <span className="font-semibold">₹{walletData.dailyEarnings.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Payment Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">LAST PAYMENT</h4>
              <p className="text-lg font-semibold">
                {format(new Date(walletData.lastPaymentDate), 'MMM dd, yyyy')}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(walletData.lastPaymentDate), { addSuffix: true })}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">NEXT PAYMENT</h4>
              <p className="text-lg font-semibold">
                {format(new Date(walletData.nextPaymentDate), 'MMM dd, yyyy')}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(walletData.nextPaymentDate))} from now
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Holds */}
      {walletData.paymentHolds.filter(h => h.status === 'active').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <span>Active Payment Holds</span>
            </CardTitle>
            <CardDescription>
              These amounts are temporarily held pending review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {walletData.paymentHolds.filter(h => h.status === 'active').map(hold => (
                <div key={hold.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{hold.bundleId}</Badge>
                      <Badge className="bg-amber-100 text-amber-800">Hold Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{hold.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(hold.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-600">-₹{hold.amount.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Transactions</span>
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAllTransactions(!showAllTransactions)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showAllTransactions ? 'Show Less' : 'View All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(showAllTransactions ? walletData.recentTransactions : walletData.recentTransactions.slice(0, 5))
              .map(transaction => {
                const config = TRANSACTION_TYPES[transaction.type];
                const Icon = config.icon;
                
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${config.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        {transaction.bundleId && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {transaction.bundleId}
                          </Badge>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(transaction.date), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        transaction.type === 'earnings' || transaction.type === 'payment' || transaction.type === 'bonus'
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {transaction.type === 'earnings' || transaction.type === 'payment' || transaction.type === 'bonus' ? '+' : '-'}
                        ₹{Math.abs(transaction.amount).toFixed(2)}
                      </p>
                      <Badge 
                        className={`text-xs ${
                          transaction.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OperatorWallet;