// Production Timer Wrapper Component
// Fetches operator's current work items and displays production timer

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProductionTimer } from '@/features/work-assignment/components/production-timer';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { workAssignmentService } from '@/services/work-assignment-service';
import type { WorkItem } from '@/features/work-assignment/types';

interface ProductionTimerWrapperProps {
  operatorId: string;
}

export const ProductionTimerWrapper: React.FC<ProductionTimerWrapperProps> = ({
  operatorId
}) => {
  const [selectedWorkItem, setSelectedWorkItem] = useState<WorkItem | null>(null);

  // Fetch operator's assigned work items
  const { 
    data: workItems, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['operator-work-items', operatorId],
    queryFn: async () => {
      const response = await workAssignmentService.getOperatorWorkItems(operatorId);
      return response.success ? response.data || [] : [];
    },
    enabled: !!operatorId,
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  // Auto-select first work item if available
  useEffect(() => {
    if (workItems && workItems.length > 0 && !selectedWorkItem) {
      setSelectedWorkItem(workItems[0]);
    }
  }, [workItems, selectedWorkItem]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading work items...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load work items. Please try again.
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2"
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!workItems || workItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Production Timer</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No work items assigned. Please contact your supervisor to get work assigned.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Work Item Selection */}
      {workItems.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Work Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {workItems.map((workItem) => (
                <div
                  key={workItem.id}
                  className={`p-3 border rounded cursor-pointer transition-colors ${
                    selectedWorkItem?.id === workItem.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedWorkItem(workItem)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{workItem.workItemNumber}</Badge>
                    <Badge className={
                      workItem.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      workItem.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {workItem.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="font-medium text-sm">{workItem.operation}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>Bundle: {workItem.bundleId}</span>
                    <span>{workItem.targetPieces} pieces</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Production Timer */}
      {selectedWorkItem && (
        <ProductionTimer
          workItemId={selectedWorkItem.id}
          operatorId={operatorId}
          workItem={selectedWorkItem}
        />
      )}
    </div>
  );
};