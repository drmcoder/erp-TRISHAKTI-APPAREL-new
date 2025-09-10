// WIP to Operations Workflow Test Component
// Tests the complete workflow: WIP Entry → Bundle Creation → Operations Generation → Work Assignment

import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { 
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  CogIcon,
  DatabaseIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db, COLLECTIONS } from '@/config/firebase';
import EnhancedBundleService from '@/services/enhanced-bundle-service';
import { operationsDataService } from '@/features/work-assignment/services/operations-data-service';
import { notify } from '@/utils/notification-utils';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: any;
}

const WipToOperationsTest: React.FC = () => {
  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      id: 'create_wip',
      title: '1. Create WIP Entry',
      description: 'Create a sample WIP entry in production_bundles collection',
      status: 'pending'
    },
    {
      id: 'generate_bundles',
      title: '2. Generate Production Bundles',
      description: 'Process WIP entries into production bundles with operations',
      status: 'pending'
    },
    {
      id: 'load_operations',
      title: '3. Load Operations for Assignment',
      description: 'Load generated operations into work assignment system',
      status: 'pending'
    },
    {
      id: 'verify_workflow',
      title: '4. Verify Complete Workflow',
      description: 'Confirm operations are available in work assignment',
      status: 'pending'
    }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>({});

  const updateStepStatus = (stepId: string, status: WorkflowStep['status'], result?: any) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, result } : step
    ));
    setResults(prev => ({ ...prev, [stepId]: result }));
  };

  const runWorkflowTest = async () => {
    if (isRunning) return;
    setIsRunning(true);
    
    try {
      // Step 1: Create WIP Entry
      updateStepStatus('create_wip', 'running');
      const wipResult = await createSampleWipEntry();
      updateStepStatus('create_wip', 'completed', wipResult);

      // Step 2: Generate Production Bundles
      updateStepStatus('generate_bundles', 'running');
      const bundleResult = await EnhancedBundleService.generateProductionLotsFromWIP();
      updateStepStatus('generate_bundles', 'completed', bundleResult);

      // Step 3: Load Operations
      updateStepStatus('load_operations', 'running');
      const operations = await operationsDataService.getPendingOperations();
      updateStepStatus('load_operations', 'completed', { count: operations.length, operations: operations.slice(0, 3) });

      // Step 4: Verify Workflow
      updateStepStatus('verify_workflow', 'running');
      const verification = await verifyWorkflow(operations);
      updateStepStatus('verify_workflow', 'completed', verification);

      notify.success('Workflow test completed successfully!', 'Test Complete');

    } catch (error) {
      console.error('Workflow test failed:', error);
      notify.error('Workflow test failed: ' + error, 'Test Failed');
      
      // Mark current step as error
      const currentStep = steps.find(s => s.status === 'running');
      if (currentStep) {
        updateStepStatus(currentStep.id, 'error', { error: error.toString() });
      }
    } finally {
      setIsRunning(false);
    }
  };

  const createSampleWipEntry = async () => {
    const wipRef = collection(db, COLLECTIONS.PRODUCTION_BUNDLES);
    const sampleWipEntry = {
      bundleNumber: `WIP-TEST-${Date.now()}`,
      articleNumber: '3233',
      articleStyle: 'Adult T-shirt',
      size: 'M',
      quantity: 25,
      priority: 'normal',
      batchNumber: 'TEST-BATCH',
      processed: false, // This is key - marks it as unprocessed
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(wipRef, sampleWipEntry);
    console.log('✅ Created WIP entry:', docRef.id);
    
    return {
      id: docRef.id,
      bundleNumber: sampleWipEntry.bundleNumber,
      articleNumber: sampleWipEntry.articleNumber,
      quantity: sampleWipEntry.quantity
    };
  };

  const verifyWorkflow = async (operations: any[]) => {
    // Check if we have operations
    const hasOperations = operations.length > 0;
    
    // Check if operations have the right structure
    const sampleOp = operations[0];
    const hasCorrectStructure = sampleOp && 
      sampleOp.bundleNumber && 
      sampleOp.operation && 
      sampleOp.pieces !== undefined;

    // Check for different operation types
    const operationTypes = [...new Set(operations.map(op => op.operation))];
    
    return {
      hasOperations,
      operationCount: operations.length,
      hasCorrectStructure,
      operationTypes,
      sampleOperation: sampleOp,
      success: hasOperations && hasCorrectStructure
    };
  };

  const getStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'running': return <ClockIcon className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'error': return <div className="h-5 w-5 text-red-600">❌</div>;
      default: return <div className="h-5 w-5 text-gray-400">⏳</div>;
    }
  };

  const getStatusColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed': return 'border-green-500 bg-green-50';
      case 'running': return 'border-blue-500 bg-blue-50';
      case 'error': return 'border-red-500 bg-red-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      
      {/* Header */}
      <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              WIP → Operations Workflow Test
            </h1>
            <p className="text-gray-600">
              Test the complete workflow from WIP entry to work assignment operations
            </p>
          </div>
          <Button
            onClick={runWorkflowTest}
            disabled={isRunning}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
          >
            <PlayIcon className="h-5 w-5" />
            <span>Run Test</span>
          </Button>
        </div>
      </Card>

      {/* Workflow Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <Card key={step.id} className={`p-6 border-2 ${getStatusColor(step.status)}`}>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {getStatusIcon(step.status)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {step.title}
                  </h3>
                  <Badge className={
                    step.status === 'completed' ? 'bg-green-100 text-green-800' :
                    step.status === 'running' ? 'bg-blue-100 text-blue-800' :
                    step.status === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {step.status.toUpperCase()}
                  </Badge>
                </div>
                
                <p className="text-gray-600 mb-3">{step.description}</p>
                
                {/* Step Results */}
                {step.result && (
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Results:</div>
                    <pre className="text-xs text-gray-600 overflow-x-auto">
                      {JSON.stringify(step.result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
              
              {index < steps.length - 1 && (
                <ArrowRightIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Summary */}
      {results.verify_workflow && (
        <Card className="p-6 mt-6 bg-green-50 border-green-200">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-bold text-green-800">Workflow Test Summary</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-semibold text-green-700">✅ WIP Entry Created</div>
              <div className="text-green-600">
                {results.create_wip?.bundleNumber} ({results.create_wip?.quantity} pieces)
              </div>
            </div>
            <div>
              <div className="font-semibold text-green-700">✅ Bundles Generated</div>
              <div className="text-green-600">
                {results.generate_bundles?.data?.generated || 0} production lots
              </div>
            </div>
            <div>
              <div className="font-semibold text-green-700">✅ Operations Available</div>
              <div className="text-green-600">
                {results.load_operations?.count || 0} operations ready for assignment
              </div>
            </div>
          </div>

          {results.verify_workflow?.operationTypes && (
            <div className="mt-4">
              <div className="font-semibold text-green-700 mb-2">Operation Types Found:</div>
              <div className="flex flex-wrap gap-2">
                {results.verify_workflow.operationTypes.map((type: string, i: number) => (
                  <Badge key={i} className="bg-green-100 text-green-800">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Instructions */}
      <Card className="p-6 mt-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-bold text-blue-800 mb-3">📋 How This Test Works</h3>
        <div className="text-sm text-blue-700 space-y-2">
          <div>1. <strong>Creates WIP Entry:</strong> Adds a new unprocessed WIP entry to production_bundles collection</div>
          <div>2. <strong>Generates Operations:</strong> Calls generateProductionLotsFromWIP() to create bundle operations</div>
          <div>3. <strong>Loads for Assignment:</strong> Uses operationsDataService to fetch operations for work assignment</div>
          <div>4. <strong>Verifies Workflow:</strong> Confirms operations are properly structured and ready for assignment</div>
        </div>
      </Card>
    </div>
  );
};

export default WipToOperationsTest;