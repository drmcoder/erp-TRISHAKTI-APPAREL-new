import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Progress } from '@/shared/components/ui/progress';
import { Separator } from '@/shared/components/ui/separator';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  IndianRupee, 
  Calendar,
  CreditCard,
  FileText,
  Eye,
  Download
} from 'lucide-react';
import { operatorWalletService } from '@/services/operator-wallet-service';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface PaymentStatusData {
  operatorId: string;
  operatorName: string;
  currentBalance: number;
  pendingEarnings: number;
  nextPaymentDate: Date;
  paymentFrequency: 'weekly' | 'monthly' | 'bi-weekly';
  minimumPayoutThreshold: number;
  paymentMethod: {
    type: 'bank_transfer' | 'upi' | 'cash';
    details: string;
    verified: boolean;
  };
  activeHolds: PaymentHold[];
  paymentRequests: PaymentRequest[];
  upcomingPayments: UpcomingPayment[];
  paymentHistory: PaymentHistory[];
}

interface PaymentHold {
  id: string;
  bundleId: string;
  amount: number;
  reason: string;
  severity: 'minor' | 'major' | 'critical';
  createdAt: Date;
  estimatedResolutionDate?: Date;
  status: 'active' | 'under_review' | 'resolved';
}

interface PaymentRequest {
  id: string;
  amount: number;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';
  processingStage: string;
  estimatedCompletionDate?: Date;
  rejectionReason?: string;
}

interface UpcomingPayment {
  id: string;
  amount: number;
  scheduledDate: Date;
  description: string;
  type: 'regular' | 'bonus' | 'backpay';
  status: 'scheduled' | 'processing' | 'delayed';
}

interface PaymentHistory {
  id: string;
  amount: number;
  paymentDate: Date;
  method: string;
  referenceNumber: string;
  status: 'completed' | 'failed' | 'reversed';
  description: string;
}

interface PaymentStatusProps {
  operatorId: string;
}

const PAYMENT_REQUEST_STATUSES = {
  pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800', icon: CheckCircle2 },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-800', icon: Clock },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: AlertTriangle }
};

const HOLD_SEVERITY_CONFIG = {
  minor: { color: 'bg-yellow-100 text-yellow-800', label: 'Minor Issue' },
  major: { color: 'bg-orange-100 text-orange-800', label: 'Major Issue' },
  critical: { color: 'bg-red-100 text-red-800', label: 'Critical Issue' }
};

export const PaymentStatus: React.FC<PaymentStatusProps> = ({ operatorId }) => {
  const [paymentData, setPaymentData] = useState<PaymentStatusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentStatus();
  }, [operatorId]);

  const loadPaymentStatus = async () => {
    try {
      setLoading(true);
      const data = await operatorWalletService.getPaymentStatus(operatorId);
      setPaymentData(data);
    } catch (error) {
      console.error('Error loading payment status:', error);
      toast.error('Failed to load payment status');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayment = async () => {
    if (!paymentData) return;

    if (paymentData.currentBalance < paymentData.minimumPayoutThreshold) {
      toast.error(`Minimum payout amount is ₹${paymentData.minimumPayoutThreshold}`);
      return;
    }

    try {
      await operatorWalletService.requestPayment(operatorId);
      toast.success('Payment request submitted successfully');
      loadPaymentStatus();
    } catch (error) {
      toast.error('Failed to submit payment request');
    }
  };

  const handleDownloadStatement = async () => {
    try {
      await operatorWalletService.downloadPaymentStatement(operatorId);
      toast.success('Payment statement downloaded');
    } catch (error) {
      toast.error('Failed to download statement');
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

  if (!paymentData) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Payment Status Unavailable</h3>
          <p className="text-muted-foreground">Unable to load payment information.</p>
        </CardContent>
      </Card>
    );
  }

  const canRequestPayment = paymentData.currentBalance >= paymentData.minimumPayoutThreshold &&
    !paymentData.paymentRequests.some(req => ['pending', 'approved', 'processing'].includes(req.status));

  const progressToMinimum = (paymentData.currentBalance / paymentData.minimumPayoutThreshold) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payment Status</h2>
          <p className="text-muted-foreground">Track your payments and balance for {paymentData.operatorName}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleDownloadStatement}>
            <Download className="h-4 w-4 mr-2" />
            Statement
          </Button>
          <Button 
            onClick={handleRequestPayment}
            disabled={!canRequestPayment}
          >
            <IndianRupee className="h-4 w-4 mr-2" />
            Request Payment
          </Button>
        </div>
      </div>

      {/* Current Balance and Payment Threshold */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Available Balance</span>
              <IndianRupee className="h-5 w-5 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-green-600">
              ₹{paymentData.currentBalance.toFixed(2)}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to minimum payout</span>
                <span>{progressToMinimum.toFixed(0)}%</span>
              </div>
              <Progress value={Math.min(100, progressToMinimum)} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Minimum: ₹{paymentData.minimumPayoutThreshold} | 
                Need: ₹{Math.max(0, paymentData.minimumPayoutThreshold - paymentData.currentBalance).toFixed(2)} more
              </div>
            </div>

            {paymentData.pendingEarnings > 0 && (
              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pending Earnings:</span>
                  <span className="font-semibold">₹{paymentData.pendingEarnings.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  These will be added once work is approved
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-semibold">Next Payment: {format(paymentData.nextPaymentDate, 'MMM dd, yyyy')}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(paymentData.nextPaymentDate)} from now
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Frequency:</span>
                <span className="font-medium capitalize">{paymentData.paymentFrequency.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Method:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium capitalize">{paymentData.paymentMethod.type.replace('_', ' ')}</span>
                  {paymentData.paymentMethod.verified ? (
                    <Badge className="bg-green-100 text-green-800 text-xs">Verified</Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">Unverified</Badge>
                  )}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {paymentData.paymentMethod.details}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Payment Holds */}
      {paymentData.activeHolds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span>Payment Holds ({paymentData.activeHolds.length})</span>
            </CardTitle>
            <CardDescription>
              These amounts are temporarily held pending resolution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentData.activeHolds.map(hold => (
                <div key={hold.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline">{hold.bundleId}</Badge>
                      <Badge className={HOLD_SEVERITY_CONFIG[hold.severity].color}>
                        {HOLD_SEVERITY_CONFIG[hold.severity].label}
                      </Badge>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {hold.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm mb-1">{hold.reason}</p>
                    <div className="text-xs text-muted-foreground">
                      <span>Created: {formatDistanceToNow(new Date(hold.createdAt), { addSuffix: true })}</span>
                      {hold.estimatedResolutionDate && (
                        <span className="ml-4">
                          Est. Resolution: {format(new Date(hold.estimatedResolutionDate), 'MMM dd')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600">-₹{hold.amount.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Requests */}
      {paymentData.paymentRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Payment Requests</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentData.paymentRequests.map(request => {
                const statusConfig = PAYMENT_REQUEST_STATUSES[request.status];
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={statusConfig.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Requested {formatDistanceToNow(new Date(request.requestedAt), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Processing Stage: {request.processingStage}</p>
                        {request.estimatedCompletionDate && (
                          <p className="text-xs text-muted-foreground">
                            Expected completion: {format(new Date(request.estimatedCompletionDate), 'MMM dd, yyyy')}
                          </p>
                        )}
                        {request.rejectionReason && (
                          <p className="text-xs text-red-600">Reason: {request.rejectionReason}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold">₹{request.amount.toFixed(2)}</div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Payments */}
      {paymentData.upcomingPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Payments</CardTitle>
            <CardDescription>Scheduled payments for the next period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentData.upcomingPayments.map(payment => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant={payment.type === 'bonus' ? 'default' : 'secondary'}>
                        {payment.type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge className={
                        payment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        payment.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {payment.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm mt-1">{payment.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {format(new Date(payment.scheduledDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">₹{payment.amount.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Payment History */}
      {paymentData.paymentHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Payment History</CardTitle>
            <CardDescription>Your last few payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentData.paymentHistory.slice(0, 5).map(payment => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge className={
                        payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {payment.status.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">#{payment.referenceNumber}</span>
                    </div>
                    <p className="text-sm mt-1">{payment.description}</p>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(payment.paymentDate), 'MMM dd, yyyy')} via {payment.method}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">₹{payment.amount.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentStatus;