// src/services/entities/supervisor-service.ts
import { EnhancedBaseFirebaseService } from '../../infrastructure/firebase/base-service';
import { COLLECTIONS } from '../../config/firebase';
import { Supervisor } from '../../types/entities';
import { ServiceResponse, QueryOptions, ServiceConfig } from '../../types/service-types';

export class SupervisorService extends EnhancedBaseFirebaseService<Supervisor> {
  constructor(config?: Partial<ServiceConfig>) {
    super(COLLECTIONS.SUPERVISORS, config);
  }

  // Custom validation for supervisors
  protected validate(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.username || typeof data.username !== 'string') {
      errors.push('Username is required and must be a string');
    }

    if (!data.name || typeof data.name !== 'string') {
      errors.push('Name is required and must be a string');
    }

    if (data.role !== 'supervisor') {
      errors.push('Role must be "supervisor"');
    }

    if (!data.supervisorLevel || !['junior', 'senior', 'lead'].includes(data.supervisorLevel)) {
      errors.push('Supervisor level must be junior, senior, or lead');
    }

    if (!data.responsibleLines || !Array.isArray(data.responsibleLines)) {
      errors.push('Responsible lines must be provided as an array');
    }

    if (!data.teamMembers || !Array.isArray(data.teamMembers)) {
      errors.push('Team members must be provided as an array');
    }

    return { valid: errors.length === 0, errors };
  }

  // Get supervisors by level
  async getBySupervisorLevel(level: 'junior' | 'senior' | 'lead', options?: QueryOptions): Promise<ServiceResponse<Supervisor[]>> {
    return this.getWhere('supervisorLevel', '==', level, options);
  }

  // Get supervisors responsible for a specific line
  async getByResponsibleLine(lineId: string, options?: QueryOptions): Promise<ServiceResponse<Supervisor[]>> {
    return this.getWhere('responsibleLines', 'array-contains', lineId, options);
  }

  // Get supervisors managing a specific operator
  async getSupervisorForOperator(operatorId: string, options?: QueryOptions): Promise<ServiceResponse<Supervisor[]>> {
    return this.getWhere('teamMembers', 'array-contains', operatorId, options);
  }

  // Add operator to supervisor's team
  async addOperatorToTeam(supervisorId: string, operatorId: string, userId?: string): Promise<ServiceResponse<Supervisor>> {
    const supervisor = await this.getById(supervisorId);
    if (!supervisor.success || !supervisor.data) {
      return supervisor;
    }

    const updatedTeamMembers = [...(supervisor.data.teamMembers || [])];
    if (!updatedTeamMembers.includes(operatorId)) {
      updatedTeamMembers.push(operatorId);
    }

    return this.update(supervisorId, {
      teamMembers: updatedTeamMembers,
      managedOperatorCount: updatedTeamMembers.length,
    }, userId);
  }

  // Remove operator from supervisor's team
  async removeOperatorFromTeam(supervisorId: string, operatorId: string, userId?: string): Promise<ServiceResponse<Supervisor>> {
    const supervisor = await this.getById(supervisorId);
    if (!supervisor.success || !supervisor.data) {
      return supervisor;
    }

    const updatedTeamMembers = (supervisor.data.teamMembers || []).filter(id => id !== operatorId);

    return this.update(supervisorId, {
      teamMembers: updatedTeamMembers,
      managedOperatorCount: updatedTeamMembers.length,
    }, userId);
  }

  // Assign line responsibility
  async assignLineResponsibility(supervisorId: string, lineId: string, userId?: string): Promise<ServiceResponse<Supervisor>> {
    const supervisor = await this.getById(supervisorId);
    if (!supervisor.success || !supervisor.data) {
      return supervisor;
    }

    const updatedLines = [...(supervisor.data.responsibleLines || [])];
    if (!updatedLines.includes(lineId)) {
      updatedLines.push(lineId);
    }

    return this.update(supervisorId, {
      responsibleLines: updatedLines,
    }, userId);
  }

  // Remove line responsibility
  async removeLineResponsibility(supervisorId: string, lineId: string, userId?: string): Promise<ServiceResponse<Supervisor>> {
    const supervisor = await this.getById(supervisorId);
    if (!supervisor.success || !supervisor.data) {
      return supervisor;
    }

    const updatedLines = (supervisor.data.responsibleLines || []).filter(id => id !== lineId);

    return this.update(supervisorId, {
      responsibleLines: updatedLines,
    }, userId);
  }

  // Get supervisor workload statistics
  async getSupervisorWorkload(supervisorId: string): Promise<ServiceResponse<{
    supervisor: Supervisor;
    totalOperators: number;
    activeOperators: number;
    totalLines: number;
    pendingTasks: number;
    todayAssignments: number;
  }>> {
    try {
      const supervisor = await this.getById(supervisorId);
      if (!supervisor.success || !supervisor.data) {
        return supervisor as any;
      }

      // In a real implementation, you'd query related services for these statistics
      const workloadData = {
        supervisor: supervisor.data,
        totalOperators: supervisor.data.teamMembers?.length || 0,
        activeOperators: 0, // Would come from OperatorService
        totalLines: supervisor.data.responsibleLines?.length || 0,
        pendingTasks: 0, // Would come from WorkAssignmentService
        todayAssignments: 0, // Would come from WorkAssignmentService
      };

      return {
        success: true,
        data: workloadData,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get workload data',
      };
    }
  }

  // Get supervisors with team capacity
  async getSupervisorsWithCapacity(maxTeamSize = 20, options?: QueryOptions): Promise<ServiceResponse<Supervisor[]>> {
    return this.query({
      ...options,
      where: [
        { field: 'managedOperatorCount', operator: '<', value: maxTeamSize },
        { field: 'active', operator: '==', value: true }
      ]
    });
  }

  // Get senior supervisors
  async getSeniorSupervisors(options?: QueryOptions): Promise<ServiceResponse<Supervisor[]>> {
    return this.query({
      ...options,
      where: [
        { field: 'supervisorLevel', operator: 'in', value: ['senior', 'lead'] },
        { field: 'active', operator: '==', value: true }
      ]
    });
  }

  // Bulk reassign operators from one supervisor to another
  async bulkReassignOperators(
    fromSupervisorId: string,
    toSupervisorId: string,
    operatorIds: string[],
    userId?: string
  ): Promise<ServiceResponse<{
    fromSupervisor: Supervisor;
    toSupervisor: Supervisor;
    reassignedCount: number;
  }>> {
    try {
      // Use transaction to ensure atomicity
      const operations = [
        // Read both supervisors
        { type: 'read' as const, collection: this.collectionName, id: fromSupervisorId },
        { type: 'read' as const, collection: this.collectionName, id: toSupervisorId },
      ];

      const transactionResult = await this.transaction(operations, userId);
      if (!transactionResult.success) {
        return {
          success: false,
          error: 'Failed to read supervisors for reassignment',
        };
      }

      const fromSupervisor = transactionResult.results[fromSupervisorId] as Supervisor;
      const toSupervisor = transactionResult.results[toSupervisorId] as Supervisor;

      if (!fromSupervisor || !toSupervisor) {
        return {
          success: false,
          error: 'One or both supervisors not found',
        };
      }

      // Update team members
      const fromTeamMembers = (fromSupervisor.teamMembers || []).filter(id => !operatorIds.includes(id));
      const toTeamMembers = [...(toSupervisor.teamMembers || []), ...operatorIds];

      // Update both supervisors
      const updateOperations = [
        {
          type: 'update' as const,
          collection: this.collectionName,
          id: fromSupervisorId,
          data: {
            teamMembers: fromTeamMembers,
            managedOperatorCount: fromTeamMembers.length,
          }
        },
        {
          type: 'update' as const,
          collection: this.collectionName,
          id: toSupervisorId,
          data: {
            teamMembers: toTeamMembers,
            managedOperatorCount: toTeamMembers.length,
          }
        }
      ];

      const updateResult = await this.transaction(updateOperations, userId);
      if (!updateResult.success) {
        return {
          success: false,
          error: 'Failed to update supervisor assignments',
        };
      }

      return {
        success: true,
        data: {
          fromSupervisor: { ...fromSupervisor, teamMembers: fromTeamMembers, managedOperatorCount: fromTeamMembers.length },
          toSupervisor: { ...toSupervisor, teamMembers: toTeamMembers, managedOperatorCount: toTeamMembers.length },
          reassignedCount: operatorIds.length,
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bulk reassignment failed',
      };
    }
  }

  // Get supervisor dashboard data
  async getSupervisorDashboardData(supervisorId: string): Promise<ServiceResponse<{
    supervisor: Supervisor;
    teamStats: any;
    lineStatus: any;
    pendingApprovals: any[];
    todayActivities: any[];
  }>> {
    try {
      const supervisor = await this.getById(supervisorId);
      if (!supervisor.success || !supervisor.data) {
        return supervisor as any;
      }

      // In a real implementation, you'd query related services
      const dashboardData = {
        supervisor: supervisor.data,
        teamStats: {
          totalOperators: supervisor.data.teamMembers?.length || 0,
          activeOperators: 0,
          efficiency: 0,
          qualityScore: 0,
        },
        lineStatus: {
          totalLines: supervisor.data.responsibleLines?.length || 0,
          activeLines: 0,
          targetEfficiency: 0,
          actualEfficiency: 0,
        },
        pendingApprovals: [],
        todayActivities: [],
      };

      return {
        success: true,
        data: dashboardData,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get dashboard data',
      };
    }
  }

  // Search supervisors by name or level
  async searchSupervisors(searchTerm: string, level?: 'junior' | 'senior' | 'lead'): Promise<ServiceResponse<Supervisor[]>> {
    const where = [
      { field: 'name', operator: '>=', value: searchTerm },
      { field: 'name', operator: '<=', value: searchTerm + '\uf8ff' },
      ...(level ? [{ field: 'supervisorLevel', operator: '==', value: level }] : [])
    ];

    return this.query({ where } as any);
  }

  // Custom audit logging for supervisors
  protected shouldAudit(): boolean {
    return true; // Always audit supervisor changes
  }
}