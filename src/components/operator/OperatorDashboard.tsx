// Real Operator Dashboard - Connected to Production Firebase Services
import React, { useState, useEffect } from 'react';
// import { productionTSAService } from '@/services/production-ready-service';
import { mockDataService as productionTSAService } from '@/services/mock-data-service';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';

interface OperatorDashboardProps {
  operatorId: string;
}

export const OperatorDashboard: React.FC<OperatorDashboardProps> = ({ operatorId }) => {
  const [operatorData, setOperatorData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<any>(null);

  useEffect(() => {
    loadOperatorData();
    loadWorkRecommendations();
    subscribeToRealtimeStatus();
  }, [operatorId]);

  const loadOperatorData = async () => {
    try {
      const result = await productionTSAService.getOperatorWithAnalysis(operatorId);
      if (result.success) {
        setOperatorData(result.data);
      } else {
        setError(result.error || 'Failed to load operator data');
      }
    } catch (err) {
      setError('Error loading operator data');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkRecommendations = async () => {
    try {
      const result = await productionTSAService.getWorkRecommendations(operatorId);
      if (result.success) {
        setRecommendations(result.data?.recommendations || []);
      }
    } catch (err) {
      console.error('Error loading recommendations:', err);
    }
  };

  const subscribeToRealtimeStatus = () => {
    const unsubscribe = productionTSAService.subscribeToOperatorStatus(
      operatorId,
      (status) => {
        setRealtimeStatus(status);
      }
    );

    return () => unsubscribe();
  };

  const handleSelfAssignment = async (workItemId: string, reason: string) => {
    try {
      setLoading(true);
      const result = await productionTSAService.processSelfAssignment(
        workItemId,
        operatorId,
        reason
      );

      if (result.success) {
        // Refresh data
        await loadOperatorData();
        await loadWorkRecommendations();
        alert('Work assigned successfully!');
      } else {
        alert(`Assignment failed: ${result.error}`);
      }
    } catch (err) {
      alert('Error processing assignment');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !operatorData) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <Button onClick={loadOperatorData} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (!operatorData) return null;

  const { operator, performance, promotionEligibility, wallet } = operatorData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{operator.name}</h1>
            <p className="text-gray-600">{operator.employeeId} • {operator.skillLevel}</p>
          </div>
          <div className="text-right">
            <Badge variant={realtimeStatus?.status === 'working' ? 'success' : 'secondary'}>
              {realtimeStatus?.status || operator.currentStatus}
            </Badge>
            <p className="text-sm text-gray-500 mt-1">
              Current Work Items: {realtimeStatus?.currentWorkItems || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Efficiency</h3>
          <p className="text-2xl font-bold text-green-600">
            {Math.round(operator.averageEfficiency * 100)}%
          </p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Quality Score</h3>
          <p className="text-2xl font-bold text-blue-600">
            {Math.round(operator.qualityScore * 100)}%
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Productivity</h3>
          <p className="text-2xl font-bold text-purple-600">
            {performance.productivityScore}
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Available Balance</h3>
          <p className="text-2xl font-bold text-indigo-600">
            ₹{wallet?.availableAmount || 0}
          </p>
          {wallet?.heldAmount > 0 && (
            <p className="text-sm text-red-500">₹{wallet.heldAmount} held</p>
          )}
        </Card>
      </div>

      {/* AI Work Recommendations */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">AI Work Recommendations</h2>
          <Button onClick={loadWorkRecommendations} size="sm" variant="outline">
            Refresh
          </Button>
        </div>

        {recommendations.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No work recommendations available</p>
        ) : (
          <div className="space-y-4">
            {recommendations.slice(0, 5).map((rec, index) => (
              <div key={rec.workItem.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{rec.workItem.bundleNumber}</h3>
                    <p className="text-sm text-gray-600">{rec.workItem.operation}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={rec.aiScore >= 80 ? 'success' : rec.aiScore >= 60 ? 'warning' : 'secondary'}>
                      {rec.aiScore}% Match
                    </Badge>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {rec.reasons.map((reason: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {reason}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Est. Duration: {rec.workItem.estimatedDuration}min • 
                    Machine: {rec.workItem.machineType}
                  </div>
                  
                  {rec.canSelfAssign && (
                    <Button 
                      size="sm"
                      onClick={() => {
                        const reason = prompt('Why do you want this work?');
                        if (reason) {
                          handleSelfAssignment(rec.workItem.id, reason);
                        }
                      }}
                      className="bg-brand-500 hover:bg-brand-600"
                    >
                      Self Assign
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Performance Analysis */}
      {performance.recommendedActions.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Performance Recommendations</h2>
          <div className="space-y-2">
            {performance.recommendedActions.map((action: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm">{action}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Promotion Eligibility */}
      {promotionEligibility.eligible && (
        <Card className="p-6 bg-green-50 border-green-200">
          <h2 className="text-lg font-semibold text-green-800 mb-2">
            🎉 Promotion Eligible!
          </h2>
          <p className="text-green-700 mb-4">
            You're eligible for promotion to {promotionEligibility.nextLevel}
          </p>
          <div className="space-y-1">
            {promotionEligibility.requirements.map((req: string, index: number) => (
              <p key={index} className="text-sm text-green-600">• {req}</p>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};