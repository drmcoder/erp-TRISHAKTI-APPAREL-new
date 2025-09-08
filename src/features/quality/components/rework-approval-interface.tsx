import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/Badge';
import { Separator } from '@/shared/components/ui/separator';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  Calendar,
  IndianRupee,
  Wrench,
  FileText
} from 'lucide-react';
import { damageReportService } from '@/services/damage-report-service';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface ReworkRequest {
  id: string;
  damageReportId: string;
  bundleId: string;
  operatorId: string;
  operatorName: string;
  damageType: string;
  damagedPieces: number;
  description: string;
  severity: 'minor' | 'major' | 'critical';
  estimatedCost: number;
  reworkInstructions?: string;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  estimatedHours?: number;
  actualHours?: number;
  reworkCost?: number;
}

interface ReworkApprovalInterfaceProps {
  supervisorId: string;
}

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'bg-green-100 text-green-800', icon: '●' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800', icon: '●●' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800', icon: '●●●' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800', icon: '●●●●' }
};

const STATUS_CONFIG = {
  pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
  in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-800', icon: Wrench },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle2 }
};

export const ReworkApprovalInterface: React.FC<ReworkApprovalInterfaceProps> = ({ supervisorId }) => {
  const [reworkRequests, setReworkRequests] = useState<ReworkRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ReworkRequest | null>(null);
  const [reviewForm, setReviewForm] = useState({
    decision: '',
    instructions: '',
    assignedTo: '',
    priority: '',
    estimatedHours: '',
    reworkCost: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReworkRequests();
  }, []);

  const loadReworkRequests = async () => {
    try {
      setLoading(true);
      const requests = await damageReportService.getReworkRequests();
      setReworkRequests(requests);
    } catch (error) {
      console.error('Error loading rework requests:', error);
      toast.error('Failed to load rework requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSelect = (request: ReworkRequest) => {
    setSelectedRequest(request);
    setReviewForm({
      decision: '',
      instructions: request.reworkInstructions || '',
      assignedTo: request.assignedTo || '',
      priority: request.priority,
      estimatedHours: request.estimatedHours?.toString() || '',
      reworkCost: request.reworkCost?.toString() || ''
    });
  };

  const handleFormChange = (field: string, value: string) => {
    setReviewForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitReview = async () => {
    if (!selectedRequest || !reviewForm.decision) {
      toast.error('Please select a decision');
      return;
    }

    if (reviewForm.decision === 'approved' && !reviewForm.instructions.trim()) {
      toast.error('Please provide rework instructions');
      return;
    }

    setSubmitting(true);
    
    try {
      const reviewData = {
        decision: reviewForm.decision,
        instructions: reviewForm.instructions,
        assignedTo: reviewForm.assignedTo,
        priority: reviewForm.priority,
        estimatedHours: parseFloat(reviewForm.estimatedHours) || 0,
        reworkCost: parseFloat(reviewForm.reworkCost) || 0,
        reviewedBy: supervisorId,
        reviewedAt: new Date()
      };

      await damageReportService.reviewReworkRequest(selectedRequest.id, reviewData);
      
      toast.success(`Rework request ${reviewForm.decision}`);
      setSelectedRequest(null);
      loadReworkRequests();
      
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingRequests = reworkRequests.filter(req => req.status === 'pending');
  const activeRequests = reworkRequests.filter(req => ['approved', 'in_progress'].includes(req.status));
  const completedRequests = reworkRequests.filter(req => ['completed', 'rejected'].includes(req.status));

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Request List */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Rework Requests</span>
            </CardTitle>
            <CardDescription>
              Review and approve rework requests from damage reports
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-amber-600">
                Pending Review ({pendingRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingRequests.map(request => (
                <RequestCard
                  key={request.id}
                  request={request}
                  isSelected={selectedRequest?.id === request.id}
                  onClick={() => handleRequestSelect(request)}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Active Requests */}
        {activeRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-blue-600">
                Active Rework ({activeRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeRequests.map(request => (
                <RequestCard
                  key={request.id}
                  request={request}
                  isSelected={selectedRequest?.id === request.id}
                  onClick={() => handleRequestSelect(request)}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recent Completed */}
        {completedRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-green-600">
                Recently Completed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {completedRequests.slice(0, 3).map(request => (
                <RequestCard
                  key={request.id}
                  request={request}
                  isSelected={selectedRequest?.id === request.id}
                  onClick={() => handleRequestSelect(request)}
                />
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Review Panel */}
      <div>
        {selectedRequest ? (
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Review Request</span>
                <Badge className={STATUS_CONFIG[selectedRequest.status].color}>
                  {STATUS_CONFIG[selectedRequest.status].label}
                </Badge>
              </CardTitle>
              <CardDescription>
                Bundle: {selectedRequest.bundleId} | Operator: {selectedRequest.operatorName}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Request Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">DAMAGE DETAILS</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <p className="font-medium">{selectedRequest.damageType.replace('_', ' ').toUpperCase()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pieces:</span>
                      <p className="font-bold text-red-600">{selectedRequest.damagedPieces}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Severity:</span>
                      <p className="font-medium capitalize">{selectedRequest.severity}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cost Impact:</span>
                      <p className="flex items-center font-semibold">
                        <IndianRupee className="h-3 w-3 mr-1" />
                        {selectedRequest.estimatedCost.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">DESCRIPTION</h4>
                  <p className="text-sm p-2 bg-muted rounded">{selectedRequest.description}</p>
                </div>

                <div className="text-xs text-muted-foreground">
                  Submitted {formatDistanceToNow(new Date(selectedRequest.submittedAt), { addSuffix: true })}
                </div>
              </div>

              <Separator />

              {/* Review Form - Only for pending requests */}
              {selectedRequest.status === 'pending' && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Review Decision</h4>
                  
                  <div className="space-y-2">
                    <Label>Decision *</Label>
                    <Select value={reviewForm.decision} onValueChange={(value) => handleFormChange('decision', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select decision" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approved">Approve Rework</SelectItem>
                        <SelectItem value="rejected">Reject Request</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {reviewForm.decision === 'approved' && (
                    <>
                      <div className="space-y-2">
                        <Label>Rework Instructions *</Label>
                        <Textarea
                          value={reviewForm.instructions}
                          onChange={(e) => handleFormChange('instructions', e.target.value)}
                          placeholder="Provide detailed instructions for the rework..."
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Assign To</Label>
                          <Select value={reviewForm.assignedTo} onValueChange={(value) => handleFormChange('assignedTo', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select operator" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="same_operator">Same Operator</SelectItem>
                              <SelectItem value="quality_team">Quality Team</SelectItem>
                              <SelectItem value="specialist">Specialist</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Priority</Label>
                          <Select value={reviewForm.priority} onValueChange={(value) => handleFormChange('priority', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Estimated Hours</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.5"
                            value={reviewForm.estimatedHours}
                            onChange={(e) => handleFormChange('estimatedHours', e.target.value)}
                            placeholder="Hours needed"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Rework Cost (NPR)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={reviewForm.reworkCost}
                            onChange={(e) => handleFormChange('reworkCost', e.target.value)}
                            placeholder="Additional cost"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={handleSubmitReview}
                      disabled={submitting || !reviewForm.decision}
                      className="flex-1"
                    >
                      {submitting ? 'Submitting...' : 'Submit Review'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedRequest(null)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Request History for non-pending requests */}
              {selectedRequest.status !== 'pending' && selectedRequest.reviewedBy && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground">REVIEW HISTORY</h4>
                  <div className="p-3 bg-muted rounded text-sm">
                    <p><strong>Reviewed by:</strong> {selectedRequest.reviewedBy}</p>
                    <p><strong>Decision:</strong> {selectedRequest.status.replace('_', ' ').toUpperCase()}</p>
                    {selectedRequest.reviewedAt && (
                      <p><strong>Reviewed:</strong> {formatDistanceToNow(new Date(selectedRequest.reviewedAt), { addSuffix: true })}</p>
                    )}
                    {selectedRequest.reworkInstructions && (
                      <p><strong>Instructions:</strong> {selectedRequest.reworkInstructions}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a Request</h3>
              <p className="text-muted-foreground">
                Choose a rework request from the list to review and make decisions
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

const RequestCard: React.FC<{
  request: ReworkRequest;
  isSelected: boolean;
  onClick: () => void;
}> = ({ request, isSelected, onClick }) => {
  const StatusIcon = STATUS_CONFIG[request.status].icon;
  
  return (
    <div
      className={`p-3 border rounded cursor-pointer transition-colors ${
        isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="font-mono text-xs">
            {request.bundleId}
          </Badge>
          <Badge className={PRIORITY_CONFIG[request.priority].color}>
            {PRIORITY_CONFIG[request.priority].label}
          </Badge>
        </div>
        <Badge className={STATUS_CONFIG[request.status].color}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {STATUS_CONFIG[request.status].label}
        </Badge>
      </div>
      
      <div className="space-y-1 text-sm">
        <div className="flex items-center text-muted-foreground">
          <User className="h-3 w-3 mr-1" />
          {request.operatorName}
        </div>
        <p className="font-medium">{request.damageType.replace('_', ' ')} - {request.damagedPieces} pieces</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDistanceToNow(new Date(request.submittedAt), { addSuffix: true })}
          </span>
          <span className="flex items-center">
            <IndianRupee className="h-3 w-3 mr-1" />
            {request.estimatedCost.toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReworkApprovalInterface;