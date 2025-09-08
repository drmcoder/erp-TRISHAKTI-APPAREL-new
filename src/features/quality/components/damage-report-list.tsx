import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/Badge';
import { 
  AlertTriangle, 
  Calendar, 
  Eye, 
  Filter, 
  Search, 
  CheckCircle, 
  XCircle,
  Clock,
  Camera,
  IndianRupee
} from 'lucide-react';
import { damageReportService } from '@/services/damage-report-service';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface DamageReport {
  id: string;
  bundleId: string;
  operatorId: string;
  operatorName?: string;
  damageType: string;
  damagedPieces: number;
  description: string;
  severity: 'minor' | 'major' | 'critical';
  status: 'pending' | 'approved' | 'rejected' | 'rework_required';
  timestamp: Date;
  photos: string[];
  estimatedCost: number;
  approvedBy?: string;
  approvalTimestamp?: Date;
  reworkAssigned?: boolean;
}

interface DamageReportListProps {
  operatorId?: string;
  bundleId?: string;
  showActions?: boolean;
  onReportClick?: (report: DamageReport) => void;
}

const DAMAGE_TYPE_LABELS: Record<string, { label: string; nepali: string }> = {
  cutting_error: { label: 'Cutting Error', nepali: 'काट्ने गल्ती' },
  sewing_defect: { label: 'Sewing Defect', nepali: 'सिलाई दोष' },
  fabric_tear: { label: 'Fabric Tear', nepali: 'कपडा च्यातिने' },
  stain: { label: 'Stain/Mark', nepali: 'दाग/निशान' },
  burn_mark: { label: 'Burn Mark', nepali: 'जलेको निशान' },
  measurement_error: { label: 'Measurement Error', nepali: 'नाप गल्ती' },
  thread_pull: { label: 'Thread Pull', nepali: 'धागो तानिने' },
  hole_damage: { label: 'Hole/Puncture', nepali: 'प्वाल' },
  color_fade: { label: 'Color Fade', nepali: 'रंग फिक्का' },
  other: { label: 'Other', nepali: 'अन्य' }
};

const STATUS_CONFIG = {
  pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
  rework_required: { label: 'Rework Required', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle }
};

const SEVERITY_CONFIG = {
  minor: { color: 'bg-yellow-100 text-yellow-800', label: 'Minor' },
  major: { color: 'bg-orange-100 text-orange-800', label: 'Major' },
  critical: { color: 'bg-red-100 text-red-800', label: 'Critical' }
};

export const DamageReportList: React.FC<DamageReportListProps> = ({
  operatorId,
  bundleId,
  showActions = false,
  onReportClick
}) => {
  const [reports, setReports] = useState<DamageReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp');

  useEffect(() => {
    loadReports();
  }, [operatorId, bundleId]);

  const loadReports = async () => {
    try {
      setLoading(true);
      let reportsData: DamageReport[];
      
      if (operatorId) {
        reportsData = await damageReportService.getOperatorReports(operatorId);
      } else if (bundleId) {
        reportsData = await damageReportService.getBundleReports(bundleId);
      } else {
        reportsData = await damageReportService.getAllReports();
      }
      
      setReports(reportsData);
    } catch (error) {
      console.error('Error loading damage reports:', error);
      toast.error('Failed to load damage reports');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReport = async (reportId: string) => {
    try {
      await damageReportService.approveReport(reportId);
      toast.success('Damage report approved');
      loadReports();
    } catch (error) {
      toast.error('Failed to approve report');
    }
  };

  const handleRejectReport = async (reportId: string) => {
    try {
      await damageReportService.rejectReport(reportId);
      toast.success('Damage report rejected');
      loadReports();
    } catch (error) {
      toast.error('Failed to reject report');
    }
  };

  const handleAssignRework = async (reportId: string) => {
    try {
      await damageReportService.assignRework(reportId);
      toast.success('Rework assigned');
      loadReports();
    } catch (error) {
      toast.error('Failed to assign rework');
    }
  };

  const filteredAndSortedReports = reports
    .filter(report => {
      const matchesSearch = 
        report.bundleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.operatorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      const matchesSeverity = severityFilter === 'all' || report.severity === severityFilter;
      
      return matchesSearch && matchesStatus && matchesSeverity;
    })
    .sort((a, b) => {
      if (sortBy === 'timestamp') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else if (sortBy === 'severity') {
        const severityOrder = { critical: 3, major: 2, minor: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      } else if (sortBy === 'cost') {
        return b.estimatedCost - a.estimatedCost;
      }
      return 0;
    });

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
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
          <h2 className="text-2xl font-bold">Damage Reports</h2>
          <p className="text-muted-foreground">
            {reports.length} total reports
            {operatorId && ' for this operator'}
            {bundleId && ` for bundle ${bundleId}`}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="rework_required">Rework Required</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
                <SelectItem value="major">Major</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timestamp">Latest First</SelectItem>
                <SelectItem value="severity">Severity</SelectItem>
                <SelectItem value="cost">Cost Impact</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      {filteredAndSortedReports.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No damage reports found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || severityFilter !== 'all'
                ? 'No reports match your current filters'
                : 'No damage reports have been submitted yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedReports.map(report => {
            const StatusIcon = STATUS_CONFIG[report.status].icon;
            
            return (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Header Row */}
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="font-mono">
                          {report.bundleId}
                        </Badge>
                        <Badge className={SEVERITY_CONFIG[report.severity].color}>
                          {SEVERITY_CONFIG[report.severity].label}
                        </Badge>
                        <Badge className={STATUS_CONFIG[report.status].color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {STATUS_CONFIG[report.status].label}
                        </Badge>
                        {report.photos.length > 0 && (
                          <Badge variant="secondary">
                            <Camera className="h-3 w-3 mr-1" />
                            {report.photos.length} photos
                          </Badge>
                        )}
                      </div>

                      {/* Damage Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground">DAMAGE TYPE</h4>
                          <p className="font-medium">
                            {DAMAGE_TYPE_LABELS[report.damageType]?.label || report.damageType}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {DAMAGE_TYPE_LABELS[report.damageType]?.nepali}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground">PIECES AFFECTED</h4>
                          <p className="text-lg font-bold text-red-600">{report.damagedPieces}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground">ESTIMATED COST</h4>
                          <p className="flex items-center font-semibold">
                            <IndianRupee className="h-4 w-4 mr-1" />
                            {report.estimatedCost.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">DESCRIPTION</h4>
                        <p className="text-sm">{report.description}</p>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center text-sm text-muted-foreground space-x-4">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDistanceToNow(new Date(report.timestamp), { addSuffix: true })}
                        </span>
                        {report.operatorName && (
                          <span>Operator: {report.operatorName}</span>
                        )}
                        {report.approvedBy && (
                          <span>Approved by: {report.approvedBy}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReportClick?.(report)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      
                      {showActions && report.status === 'pending' && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApproveReport(report.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRejectReport(report.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleAssignRework(report.id)}
                          >
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Rework
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DamageReportList;