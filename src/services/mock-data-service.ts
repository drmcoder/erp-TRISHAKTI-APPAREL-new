// Mock Data Service for TSA ERP - Provides realistic demo data
// This replaces Firebase calls with local data for demonstration

export interface OperatorData {
  operator: {
    id: string;
    name: string;
    employeeId: string;
    skillLevel: string;
    primaryMachine: string;
    currentStatus: string;
    averageEfficiency: number;
    qualityScore: number;
  };
  performance: {
    productivityScore: number;
    recommendedActions: string[];
  };
  promotionEligibility: {
    eligible: boolean;
    nextLevel?: string;
    requirements: string[];
  };
  wallet: {
    availableAmount: number;
    heldAmount: number;
  };
}

export interface SupervisorData {
  supervisor: {
    id: string;
    name: string;
    supervisorLevel: string;
    responsibleLines: string[];
  };
  teamProductivity: {
    teamEfficiency: number;
    averageQuality: number;
    teamHealthScore: number;
    recommendedActions: string[];
  };
  pendingApprovals: Array<{
    id: string;
    operatorId: string;
    operatorName: string;
    workItemId: string;
    reason: string;
    requestedAt: { seconds: number };
  }>;
  teamOperators: Array<{
    id: string;
    name: string;
    skillLevel: string;
    primaryMachine: string;
    currentStatus: string;
    averageEfficiency: number;
    qualityScore: number;
  }>;
}

export interface WorkRecommendation {
  workItem: {
    id: string;
    bundleNumber: string;
    operation: string;
    machineType: string;
    estimatedDuration: number;
  };
  aiScore: number;
  reasons: string[];
  canSelfAssign: boolean;
}

class MockDataService {
  // Sample operator data
  private operatorData: Record<string, OperatorData> = {
    'op-maya-001': {
      operator: {
        id: 'op-maya-001',
        name: 'Maya Sharma',
        employeeId: 'EMP001',
        skillLevel: 'Expert',
        primaryMachine: 'Overlock',
        currentStatus: 'working',
        averageEfficiency: 0.92,
        qualityScore: 0.88
      },
      performance: {
        productivityScore: 94,
        recommendedActions: [
          'Consider taking on advanced operations',
          'Mentor junior operators',
          'Focus on consistent quality delivery'
        ]
      },
      promotionEligibility: {
        eligible: true,
        nextLevel: 'Senior Operator',
        requirements: [
          'Maintain 90%+ efficiency for 3 months',
          'Complete quality training',
          'Mentor 2 junior operators'
        ]
      },
      wallet: {
        availableAmount: 2500,
        heldAmount: 150
      }
    },
    'op-ram-002': {
      operator: {
        id: 'op-ram-002',
        name: 'Ram Singh',
        employeeId: 'EMP002',
        skillLevel: 'Intermediate',
        primaryMachine: 'Single Needle',
        currentStatus: 'break',
        averageEfficiency: 0.85,
        qualityScore: 0.82
      },
      performance: {
        productivityScore: 78,
        recommendedActions: [
          'Practice consistent seam quality',
          'Increase work pace gradually',
          'Focus on reducing rework'
        ]
      },
      promotionEligibility: {
        eligible: false,
        requirements: [
          'Achieve 85%+ efficiency consistently',
          'Reduce quality issues by 20%',
          'Complete skill development training'
        ]
      },
      wallet: {
        availableAmount: 1800,
        heldAmount: 0
      }
    }
  };

  // Sample supervisor data
  private supervisorData: Record<string, SupervisorData> = {
    'sup-john-001': {
      supervisor: {
        id: 'sup-john-001',
        name: 'John Kumar',
        supervisorLevel: 'Senior',
        responsibleLines: ['Line A', 'Line B']
      },
      teamProductivity: {
        teamEfficiency: 0.89,
        averageQuality: 0.85,
        teamHealthScore: 82,
        recommendedActions: [
          'Schedule additional training for quality improvement',
          'Balance workload distribution across team',
          'Recognize top performers to boost morale'
        ]
      },
      pendingApprovals: [
        {
          id: 'req-001',
          operatorId: 'op-maya-001',
          operatorName: 'Maya Sharma',
          workItemId: 'work-001',
          reason: 'I have experience with this operation and can complete it efficiently',
          requestedAt: { seconds: Date.now() / 1000 - 1800 } // 30 min ago
        },
        {
          id: 'req-002',
          operatorId: 'op-ram-002',
          operatorName: 'Ram Singh',
          workItemId: 'work-002',
          reason: 'Looking to improve my skills with button hole operations',
          requestedAt: { seconds: Date.now() / 1000 - 3600 } // 1 hour ago
        }
      ],
      teamOperators: [
        {
          id: 'op-maya-001',
          name: 'Maya Sharma',
          skillLevel: 'Expert',
          primaryMachine: 'Overlock',
          currentStatus: 'working',
          averageEfficiency: 0.92,
          qualityScore: 0.88
        },
        {
          id: 'op-ram-002',
          name: 'Ram Singh',
          skillLevel: 'Intermediate',
          primaryMachine: 'Single Needle',
          currentStatus: 'break',
          averageEfficiency: 0.85,
          qualityScore: 0.82
        },
        {
          id: 'op-sita-003',
          name: 'Sita Patel',
          skillLevel: 'Advanced',
          primaryMachine: 'Flatlock',
          currentStatus: 'working',
          averageEfficiency: 0.88,
          qualityScore: 0.91
        }
      ]
    }
  };

  // Sample work recommendations
  private workRecommendations: Record<string, WorkRecommendation[]> = {
    'op-maya-001': [
      {
        workItem: {
          id: 'work-001',
          bundleNumber: 'B001-T001',
          operation: 'Side Seam',
          machineType: 'Overlock',
          estimatedDuration: 45
        },
        aiScore: 92,
        reasons: ['Perfect skill match', 'High efficiency record', 'Available now'],
        canSelfAssign: true
      },
      {
        workItem: {
          id: 'work-003',
          bundleNumber: 'B003-T003',
          operation: 'Shoulder Join',
          machineType: 'Overlock',
          estimatedDuration: 35
        },
        aiScore: 88,
        reasons: ['Skill compatibility', 'Previous success rate', 'Priority work'],
        canSelfAssign: true
      }
    ],
    'op-ram-002': [
      {
        workItem: {
          id: 'work-002',
          bundleNumber: 'B002-T002',
          operation: 'Button Hole',
          machineType: 'Single Needle',
          estimatedDuration: 30
        },
        aiScore: 75,
        reasons: ['Machine match', 'Skill development', 'Good practice'],
        canSelfAssign: true
      }
    ]
  };

  // Sample operator status
  private operatorStatus: Record<string, any> = {
    'op-maya-001': {
      status: 'working',
      currentWorkItems: 1,
      lastUpdated: Date.now()
    },
    'op-ram-002': {
      status: 'break',
      currentWorkItems: 0,
      lastUpdated: Date.now()
    }
  };

  // Mock service methods to match production-ready-service
  async getOperatorWithAnalysis(operatorId: string): Promise<{ success: boolean; data?: OperatorData; error?: string }> {
    await this.simulateDelay();
    
    const data = this.operatorData[operatorId];
    if (!data) {
      return { success: false, error: 'Operator not found' };
    }
    
    return { success: true, data };
  }

  async getSupervisorDashboard(supervisorId: string): Promise<{ success: boolean; data?: SupervisorData; error?: string }> {
    await this.simulateDelay();
    
    const data = this.supervisorData[supervisorId];
    if (!data) {
      return { success: false, error: 'Supervisor not found' };
    }
    
    return { success: true, data };
  }

  async getWorkRecommendations(operatorId: string): Promise<{ success: boolean; data?: { recommendations: WorkRecommendation[] }; error?: string }> {
    await this.simulateDelay();
    
    const recommendations = this.workRecommendations[operatorId] || [];
    return { success: true, data: { recommendations } };
  }

  async processSelfAssignment(workItemId: string, operatorId: string, reason: string): Promise<{ success: boolean; error?: string }> {
    await this.simulateDelay();
    
    // Simulate assignment logic
    console.log(`Mock: Processing self-assignment for operator ${operatorId} to work ${workItemId} with reason: ${reason}`);
    
    // Simulate success with 90% probability
    if (Math.random() > 0.1) {
      return { success: true };
    } else {
      return { success: false, error: 'Work item no longer available' };
    }
  }

  async processAssignmentApproval(requestId: string, supervisorId: string, decision: 'approve' | 'reject', notes?: string): Promise<{ success: boolean; error?: string }> {
    await this.simulateDelay();
    
    console.log(`Mock: Processing ${decision} for request ${requestId} by supervisor ${supervisorId}`);
    if (notes) console.log(`Notes: ${notes}`);
    
    // Remove from pending approvals
    const supervisorData = this.supervisorData[supervisorId];
    if (supervisorData) {
      supervisorData.pendingApprovals = supervisorData.pendingApprovals.filter(req => req.id !== requestId);
    }
    
    return { success: true };
  }

  subscribeToOperatorStatus(operatorId: string, callback: (status: any) => void): () => void {
    // Initial callback
    const status = this.operatorStatus[operatorId];
    if (status) {
      callback(status);
    }
    
    // Simulate real-time updates every 30 seconds
    const interval = setInterval(() => {
      const currentStatus = this.operatorStatus[operatorId];
      if (currentStatus) {
        // Randomly update status for demo
        const statuses = ['working', 'break', 'idle'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        const updatedStatus = {
          ...currentStatus,
          status: randomStatus,
          currentWorkItems: randomStatus === 'working' ? Math.floor(Math.random() * 3) + 1 : 0,
          lastUpdated: Date.now()
        };
        
        this.operatorStatus[operatorId] = updatedStatus;
        callback(updatedStatus);
      }
    }, 30000);
    
    // Return unsubscribe function
    return () => clearInterval(interval);
  }

  private async simulateDelay(): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
  }
}

// Export singleton instance
export const mockDataService = new MockDataService();

// Also export as default for easy import
export default mockDataService;