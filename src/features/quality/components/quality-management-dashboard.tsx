import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { DamageReportForm } from './damage-report-form';
import { ReworkApprovalInterface } from './rework-approval-interface';
import { DamageReportList } from './damage-report-list';

interface QualityManagementDashboardProps {
  userRole?: string;
}

const QualityManagementDashboard: React.FC<QualityManagementDashboardProps> = ({
  userRole = 'supervisor'
}) => {
  const [activeView, setActiveView] = useState<'overview' | 'reports' | 'approvals' | 'new-report'>('overview');
  
  // Mock data - in real implementation, this would come from API
  const qualityStats = {
    totalInspections: 1247,
    passedInspections: 1198,
    failedInspections: 49,
    pendingReports: 12,
    reworkItems: 23,
    qualityRate: 96.1
  };

  const recentDamageReports = [
    {
      id: 'DR001',
      bundleId: 'BND-2024-001',
      operatorName: 'Maya Sharma',
      damageType: 'Fabric Tear',
      severity: 'High',
      status: 'Pending Review',
      timestamp: new Date('2024-12-07T10:30:00')
    },
    {
      id: 'DR002',
      bundleId: 'BND-2024-003',
      operatorName: 'Rajesh Kumar',
      damageType: 'Stitching Defect',
      severity: 'Medium',
      status: 'Approved for Rework',
      timestamp: new Date('2024-12-07T09:15:00')
    }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quality Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Quality Rate</p>
              <p className="text-2xl font-bold text-green-600">{qualityStats.qualityRate}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Reports</p>
              <p className="text-2xl font-bold text-red-600">{qualityStats.pendingReports}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rework Items</p>
              <p className="text-2xl font-bold text-yellow-600">{qualityStats.reworkItems}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Damage Reports */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Damage Reports</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setActiveView('new-report')}
          >
            New Report
          </Button>
        </div>
        
        <div className="space-y-3">
          {recentDamageReports.map((report) => (
            <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div>
                  <p className="font-medium text-gray-900">{report.id}</p>
                  <p className="text-sm text-gray-600">Bundle: {report.bundleId}</p>
                  <p className="text-sm text-gray-600">Operator: {report.operatorName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{report.damageType}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant={report.severity === 'High' ? 'destructive' : 'secondary'}>
                      {report.severity}
                    </Badge>
                    <Badge variant={report.status === 'Pending Review' ? 'secondary' : 'outline'}>
                      {report.status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <EyeIcon className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-500">
                  {report.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return renderOverview();
      case 'reports':
        return <DamageReportList />;
      case 'approvals':
        return <ReworkApprovalInterface userRole={userRole} />;
      case 'new-report':
        return (
          <DamageReportForm
            bundleId="BND-2024-001"
            operatorId="op-maya-001"
            onCancel={() => setActiveView('overview')}
            onSuccess={() => setActiveView('overview')}
          />
        );
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
            <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
            <span>Quality Management</span>
          </h1>
          <p className="text-gray-600">Monitor quality control and damage reporting</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveView('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveView('reports')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'reports'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Damage Reports
          </button>
          <button
            onClick={() => setActiveView('approvals')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'approvals'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Rework Approvals
          </button>
          <button
            onClick={() => setActiveView('new-report')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'new-report'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            New Report
          </button>
        </nav>
      </div>

      {/* Main Content */}
      {renderContent()}
    </div>
  );
};

export default QualityManagementDashboard;
export { QualityManagementDashboard };