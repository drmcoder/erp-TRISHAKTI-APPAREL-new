import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { 
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  CurrencyRupeeIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { OperatorWallet } from './operator-wallet';
import { EarningsHistory } from './earnings-history';
import { PaymentStatus } from './payment-status';

interface EarningsDashboardProps {
  userRole?: string;
  operatorId?: string;
}

const EarningsDashboard: React.FC<EarningsDashboardProps> = ({
  userRole = 'supervisor',
  operatorId
}) => {
  const [activeView, setActiveView] = useState<'overview' | 'wallet' | 'history' | 'payments'>('overview');
  
  // Mock data - in real implementation, this would come from API
  const earningsStats = {
    totalEarnings: 45650,
    pendingPayments: 8750,
    completedPayments: 36900,
    activeOperators: 156,
    averageEarnings: 292.95,
    paymentRate: 96.2
  };

  const recentPayments = [
    {
      id: 'PAY001',
      operatorName: 'Maya Sharma',
      operatorId: 'op-maya-001',
      amount: 2850,
      status: 'Completed',
      paymentDate: new Date('2024-12-07'),
      workPeriod: 'Dec 1-7, 2024'
    },
    {
      id: 'PAY002',
      operatorName: 'Rajesh Kumar',
      operatorId: 'op-rajesh-002',
      amount: 3200,
      status: 'Processing',
      paymentDate: new Date('2024-12-07'),
      workPeriod: 'Dec 1-7, 2024'
    },
    {
      id: 'PAY003',
      operatorName: 'Priya Singh',
      operatorId: 'op-priya-003',
      amount: 2650,
      status: 'Pending Approval',
      paymentDate: new Date('2024-12-08'),
      workPeriod: 'Dec 1-7, 2024'
    }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Earnings Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CurrencyRupeeIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-green-600">₹{earningsStats.totalEarnings.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-yellow-600">₹{earningsStats.pendingPayments.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Operators</p>
              <p className="text-2xl font-bold text-blue-600">{earningsStats.activeOperators}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Payment Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Payment Success Rate</span>
              <span className="text-sm font-medium text-green-600">{earningsStats.paymentRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${earningsStats.paymentRate}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Earnings/Operator</span>
              <span className="text-sm font-medium text-blue-600">₹{earningsStats.averageEarnings}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <span className="text-sm font-medium">₹{earningsStats.completedPayments.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <span className="text-sm font-medium">₹{earningsStats.pendingPayments.toLocaleString()}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Payments</h3>
          <Button variant="outline" size="sm">
            View All Payments
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-sm font-medium text-gray-600">Payment ID</th>
                <th className="text-left py-3 text-sm font-medium text-gray-600">Operator</th>
                <th className="text-left py-3 text-sm font-medium text-gray-600">Amount</th>
                <th className="text-left py-3 text-sm font-medium text-gray-600">Period</th>
                <th className="text-left py-3 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 text-sm font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-100">
                  <td className="py-3 text-sm font-medium text-gray-900">{payment.id}</td>
                  <td className="py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{payment.operatorName}</p>
                      <p className="text-xs text-gray-500">{payment.operatorId}</p>
                    </div>
                  </td>
                  <td className="py-3 text-sm font-medium text-gray-900">₹{payment.amount.toLocaleString()}</td>
                  <td className="py-3 text-sm text-gray-600">{payment.workPeriod}</td>
                  <td className="py-3">
                    <Badge 
                      variant={
                        payment.status === 'Completed' ? 'default' :
                        payment.status === 'Processing' ? 'secondary' : 'outline'
                      }
                    >
                      {payment.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-sm text-gray-600">
                    {payment.paymentDate.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return renderOverview();
      case 'wallet':
        return <OperatorWallet operatorId={operatorId || 'op-maya-001'} />;
      case 'history':
        return <EarningsHistory operatorId={operatorId} />;
      case 'payments':
        return <PaymentStatus userRole={userRole} />;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <BanknotesIcon className="h-8 w-8 text-green-600" />
            <span>Earnings & Payments</span>
          </h1>
          <p className="text-gray-600">Manage operator earnings and payment processing</p>
        </div>
        
        {userRole === 'supervisor' && (
          <div className="flex space-x-2">
            <Button variant="outline">
              Generate Report
            </Button>
            <Button>
              Process Payments
            </Button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveView('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'overview'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          {(userRole === 'operator' || operatorId) && (
            <button
              onClick={() => setActiveView('wallet')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeView === 'wallet'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Wallet
            </button>
          )}
          <button
            onClick={() => setActiveView('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'history'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Earnings History
          </button>
          <button
            onClick={() => setActiveView('payments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'payments'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Payment Status
          </button>
        </nav>
      </div>

      {/* Main Content */}
      {renderContent()}
    </div>
  );
};

export default EarningsDashboard;
export { EarningsDashboard };