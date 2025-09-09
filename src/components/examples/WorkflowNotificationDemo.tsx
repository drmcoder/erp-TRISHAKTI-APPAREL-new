// Workflow Notification Demo Component
// Demonstrates the sequential workflow notification system

import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { 
  Play, CheckCircle, Clock, AlertCircle, Users, 
  ArrowRight, Bell, Zap
} from 'lucide-react';
import { workflowOrchestrationService } from '@/services/workflow-orchestration-service';
import { pushNotificationService } from '@/services/push-notification-service';
import { toast } from 'sonner';

const WorkflowNotificationDemo: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [workflowStatus, setWorkflowStatus] = useState<any[]>([]);
  const [operatorCapacities, setOperatorCapacities] = useState<any[]>([]);

  // Sample workflow steps
  const demoSteps = [
    { name: 'Create Work Bundle', operation: 'cutting', machine: 'cutting_machine' },
    { name: 'Cutting Complete', operation: 'single_needle_1', machine: 'single_needle' },
    { name: 'First Sewing Complete', operation: 'overlock', machine: 'overlock_machine' },
    { name: 'Overlock Complete', operation: 'single_needle_2', machine: 'single_needle' },
    { name: 'Second Sewing Complete', operation: 'finishing', machine: 'manual' }
  ];

  const sampleOperators = [
    {
      operatorId: 'op1',
      operatorName: 'राम श्रेष्ठ (Ram Shrestha)',
      machineType: 'single_needle',
      currentCapacity: 45,
      availableCapacity: 55,
      skills: ['single_needle', 'basic_sewing']
    },
    {
      operatorId: 'op2', 
      operatorName: 'सीता तामाङ (Sita Tamang)',
      machineType: 'overlock_machine',
      currentCapacity: 25,
      availableCapacity: 75,
      skills: ['overlock']
    },
    {
      operatorId: 'op3',
      operatorName: 'हरि गुरुङ (Hari Gurung)',
      machineType: 'single_needle',
      currentCapacity: 70,
      availableCapacity: 30,
      skills: ['single_needle', 'advanced_sewing']
    }
  ];

  useEffect(() => {
    // Initialize sample data
    setOperatorCapacities(sampleOperators);
    loadWorkflowStatus();
  }, []);

  const loadWorkflowStatus = () => {
    // Mock workflow status
    setWorkflowStatus([
      { stepId: '1', operationName: 'Cutting', status: 'completed', assignedTo: 'op1' },
      { stepId: '2', operationName: 'Single Needle 1', status: 'ready', assignedTo: null },
      { stepId: '3', operationName: 'Overlock', status: 'pending', assignedTo: null },
      { stepId: '4', operationName: 'Single Needle 2', status: 'pending', assignedTo: null },
      { stepId: '5', operationName: 'Finishing', status: 'pending', assignedTo: null }
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress': return <Play className="w-4 h-4 text-blue-600" />;
      case 'ready': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'pending': return <AlertCircle className="w-4 h-4 text-gray-400" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getCapacityColor = (capacity: number) => {
    if (capacity <= 50) return 'bg-green-100 text-green-800';
    if (capacity <= 80) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const simulateWorkflow = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setCurrentStep(0);

    try {
      // Create initial work bundle
      await workflowOrchestrationService.createWorkflowForBundle(
        'demo-bundle-001',
        ['cutting', 'single_needle_1', 'overlock', 'single_needle_2', 'finishing'],
        50 // 50 pieces
      );

      toast.success('🎯 Work bundle created!', {
        description: 'Workflow orchestration started for 50 pieces'
      });

      // Simulate completing each step
      for (let i = 0; i < demoSteps.length - 1; i++) {
        setCurrentStep(i);
        
        // Wait for demo effect
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Complete current operation
        const stepId = `demo-bundle-001-${demoSteps[i].operation}`;
        await workflowOrchestrationService.completeOperation(stepId, 'op1', 50);

        // Show notification that would be sent
        const nextStep = demoSteps[i + 1];
        const qualifiedOps = sampleOperators.filter(op => 
          op.machineType === nextStep.machine && op.availableCapacity > 20
        );

        if (qualifiedOps.length > 0) {
          // Simulate sending notification
          toast.success(`🔔 Sequential notification sent!`, {
            description: `${qualifiedOps.length} ${nextStep.machine} operators notified about available work`,
            duration: 3000
          });

          // Simulate actual push notification
          await pushNotificationService.sendSequentialOperationNotification({
            operatorIds: qualifiedOps.map(op => op.operatorId),
            workBundleId: 'demo-bundle-001',
            workItemId: stepId,
            previousOperatorId: 'op1',
            previousOperatorName: 'राम श्रेष्ठ',
            machineType: nextStep.machine,
            operation: nextStep.name,
            completedOperation: demoSteps[i].name,
            priority: 'normal'
          });
        }

        // Update workflow status
        setWorkflowStatus(prev => prev.map((step, idx) => {
          if (idx === i + 1) {
            return { ...step, status: 'ready', assignedTo: null };
          }
          if (idx === i) {
            return { ...step, status: 'completed', assignedTo: 'op1' };
          }
          return step;
        }));
      }

      toast.success('✅ Workflow simulation complete!', {
        description: 'All sequential notifications were sent successfully'
      });

    } catch (error) {
      console.error('Workflow simulation error:', error);
      toast.error('❌ Workflow simulation failed');
    } finally {
      setIsRunning(false);
    }
  };

  const testCapacityCheck = () => {
    // Simulate an operator finishing work and getting available capacity
    const operator = sampleOperators.find(op => op.operatorId === 'op3');
    if (operator) {
      const newCapacity = Math.max(0, operator.currentCapacity - 30);
      operator.currentCapacity = newCapacity;
      operator.availableCapacity = 100 - newCapacity;
      
      setOperatorCapacities([...sampleOperators]);
      
      toast.success('📊 Capacity updated!', {
        description: `${operator.operatorName} now has ${operator.availableCapacity}% available capacity`
      });

      // Simulate checking for available work
      if (operator.availableCapacity > 50) {
        toast.info('🎯 Work assignment triggered!', {
          description: 'Operator has capacity for new work - checking queue...'
        });
      }
    }
  };

  const testDirectAssignment = async () => {
    // Simulate supervisor assigning work directly to an operator
    const selectedOperator = sampleOperators[0];
    
    await pushNotificationService.sendWorkAssignmentNotification({
      operatorId: selectedOperator.operatorId,
      workBundleId: 'direct-assignment-001',
      assignmentType: 'new_assignment',
      priority: 'high',
      machineType: selectedOperator.machineType,
      operation: 'Single Needle Hemming',
      estimatedTime: 45
    });

    toast.success('📲 Direct assignment notification sent!', {
      description: `Push notification sent to ${selectedOperator.operatorName}`
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Sequential Workflow Notification Demo
        </h1>
        <p className="text-gray-600 mb-6">
          Demonstrates automatic notifications when operations complete and work becomes available
        </p>
        
        <div className="flex gap-4 justify-center mb-8">
          <Button 
            onClick={simulateWorkflow}
            disabled={isRunning}
            leftIcon={isRunning ? <Clock className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            size="lg"
          >
            {isRunning ? 'Running Workflow...' : 'Start Workflow Demo'}
          </Button>
          
          <Button 
            variant="outline"
            onClick={testCapacityCheck}
            leftIcon={<Zap className="w-4 h-4" />}
          >
            Test Capacity Check
          </Button>
          
          <Button 
            variant="outline"
            onClick={testDirectAssignment}
            leftIcon={<Bell className="w-4 h-4" />}
          >
            Test Direct Assignment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workflow Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="w-5 h-5" />
              Workflow Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workflowStatus.map((step, index) => (
                <div
                  key={step.stepId}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    index === currentStep && isRunning 
                      ? 'border-blue-200 bg-blue-50' 
                      : 'border-gray-200'
                  }`}
                >
                  {getStatusIcon(step.status)}
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {step.operationName}
                      </span>
                      <Badge className={getStatusColor(step.status)}>
                        {step.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    {step.assignedTo && (
                      <p className="text-sm text-gray-500 mt-1">
                        Assigned to: {sampleOperators.find(op => op.operatorId === step.assignedTo)?.operatorName}
                      </p>
                    )}
                  </div>
                  
                  {index === currentStep && isRunning && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Operator Capacities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Operator Capacities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {operatorCapacities.map((operator) => (
                <div
                  key={operator.operatorId}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {operator.operatorName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Machine: {operator.machineType.replace('_', ' ')}
                      </p>
                    </div>
                    
                    <Badge className={getCapacityColor(operator.currentCapacity)}>
                      {operator.availableCapacity}% available
                    </Badge>
                  </div>
                  
                  {/* Capacity bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        operator.currentCapacity <= 50 ? 'bg-green-500' :
                        operator.currentCapacity <= 80 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${operator.currentCapacity}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Current: {operator.currentCapacity}%</span>
                    <span>
                      {operator.availableCapacity > 50 ? '✅ Can take more work' : 
                       operator.availableCapacity > 20 ? '⚠️ Limited capacity' : 
                       '🚫 At capacity'}
                    </span>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      Skills: {operator.skills.join(', ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 How Sequential Workflow Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                1. Operation Completion Detection
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                When Op1 (single needle) finishes their work, the system automatically detects completion and marks the next operation as "ready".
              </p>
              
              <h4 className="font-semibold text-gray-900 mb-2">
                2. Smart Operator Matching  
              </h4>
              <p className="text-sm text-gray-600">
                System finds operators with matching machine type (single needle) and required skills, considering their current workload capacity.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                3. Intelligent Notifications
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Only operators with less than 80% capacity receive notifications, ensuring work distribution efficiency.
              </p>
              
              <h4 className="font-semibold text-gray-900 mb-2">
                4. Multi-Language Support
              </h4>
              <p className="text-sm text-gray-600">
                Notifications are sent in operator's preferred language (English/Nepali) with clear work handoff information.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowNotificationDemo;