// src/services/entities/operator-service.ts
import { EnhancedBaseFirebaseService } from '../../infrastructure/firebase/base-service';
import { COLLECTIONS } from '../../config/firebase';
import { Operator } from '../../types/entities';
import { ServiceResponse, QueryOptions, ServiceConfig } from '../../types/service-types';

export class OperatorService extends EnhancedBaseFirebaseService<Operator> {
  constructor(config?: Partial<ServiceConfig>) {
    super(COLLECTIONS.OPERATORS, config);
  }

  // Custom validation for operators
  protected validate(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.username || typeof data.username !== 'string') {
      errors.push('Username is required and must be a string');
    }

    if (!data.name || typeof data.name !== 'string') {
      errors.push('Name is required and must be a string');
    }

    if (data.role !== 'operator') {
      errors.push('Role must be "operator"');
    }

    if (!data.skills || !Array.isArray(data.skills)) {
      errors.push('Skills must be provided as an array');
    }

    if (data.efficiencyRating !== undefined && (typeof data.efficiencyRating !== 'number' || data.efficiencyRating < 0 || data.efficiencyRating > 100)) {
      errors.push('Efficiency rating must be a number between 0 and 100');
    }

    if (data.qualityScore !== undefined && (typeof data.qualityScore !== 'number' || data.qualityScore < 0 || data.qualityScore > 100)) {
      errors.push('Quality score must be a number between 0 and 100');
    }

    return { valid: errors.length === 0, errors };
  }

  // Get operators by skill
  async getBySkill(skill: string, options?: QueryOptions): Promise<ServiceResponse<Operator[]>> {
    return this.getWhere('skills', 'array-contains', skill, options);
  }

  // Get available operators
  async getAvailableOperators(options?: QueryOptions): Promise<ServiceResponse<Operator[]>> {
    return this.getWhere('availabilityStatus', '==', 'available', options);
  }

  // Get operators by efficiency rating range
  async getByEfficiencyRange(minRating: number, maxRating: number, options?: QueryOptions): Promise<ServiceResponse<Operator[]>> {
    const whereConditions = [
      { field: 'efficiencyRating', operator: '>=', value: minRating },
      { field: 'efficiencyRating', operator: '<=', value: maxRating }
    ];

    return this.query({
      ...options,
      where: whereConditions as any,
    });
  }

  // Update operator status
  async updateAvailabilityStatus(operatorId: string, status: 'available' | 'busy' | 'break' | 'offline', userId?: string): Promise<ServiceResponse<Operator>> {
    return this.update(operatorId, {
      availabilityStatus: status,
      lastActiveTime: new Date(),
    }, userId);
  }

  // Update operator statistics
  async updateStatistics(
    operatorId: string,
    stats: {
      piecesCompleted?: number;
      earnings?: number;
      efficiencyRating?: number;
      qualityScore?: number;
    },
    userId?: string
  ): Promise<ServiceResponse<Operator>> {
    const updateData: any = {};

    if (stats.piecesCompleted !== undefined) {
      updateData.totalPiecesCompleted = stats.piecesCompleted;
    }

    if (stats.earnings !== undefined) {
      updateData.totalEarnings = stats.earnings;
    }

    if (stats.efficiencyRating !== undefined) {
      updateData.efficiencyRating = stats.efficiencyRating;
    }

    if (stats.qualityScore !== undefined) {
      updateData.qualityScore = stats.qualityScore;
    }

    return this.update(operatorId, updateData, userId);
  }

  // Get top performers
  async getTopPerformers(limit = 10): Promise<ServiceResponse<Operator[]>> {
    return this.query({
      orderByField: 'efficiencyRating',
      orderDirection: 'desc',
      limit,
      where: [
        { field: 'active', operator: '==', value: true }
      ]
    });
  }

  // Search operators by name or username
  async searchOperators(searchTerm: string, options?: QueryOptions): Promise<ServiceResponse<Operator[]>> {
    // Note: Firestore doesn't support full-text search natively
    // This is a basic implementation - consider using Algolia or similar for advanced search
    
    const nameSearch = await this.query({
      ...options,
      where: [
        { field: 'name', operator: '>=', value: searchTerm },
        { field: 'name', operator: '<=', value: searchTerm + '\uf8ff' }
      ]
    });

    const usernameSearch = await this.query({
      ...options,
      where: [
        { field: 'username', operator: '>=', value: searchTerm },
        { field: 'username', operator: '<=', value: searchTerm + '\uf8ff' }
      ]
    });

    if (nameSearch.success && usernameSearch.success) {
      // Combine and deduplicate results
      const allResults = [...(nameSearch.data || []), ...(usernameSearch.data || [])];
      const uniqueResults = allResults.filter((operator, index, self) => 
        self.findIndex(o => o.id === operator.id) === index
      );

      return {
        success: true,
        data: uniqueResults,
        metadata: {
          totalCount: uniqueResults.length,
        }
      };
    }

    return nameSearch.success ? nameSearch : usernameSearch;
  }

  // Get operator dashboard data
  async getOperatorDashboardData(operatorId: string): Promise<ServiceResponse<{
    operator: Operator;
    todayStats: any;
    weeklyStats: any;
    currentAssignments: any[];
    recentCompletions: any[];
  }>> {
    try {
      // Get operator details
      const operatorResult = await this.getById(operatorId);
      if (!operatorResult.success) {
        return operatorResult as any;
      }

      // Get today's stats (this would typically come from ProductionStats service)
      const today = new Date().toISOString().split('T')[0];
      
      // Note: In a real implementation, you'd query related services
      const dashboardData = {
        operator: operatorResult.data!,
        todayStats: {
          piecesCompleted: 0,
          earnings: 0,
          hoursWorked: 0,
          efficiency: 0,
        },
        weeklyStats: {
          totalPieces: 0,
          totalEarnings: 0,
          averageEfficiency: 0,
          workingDays: 0,
        },
        currentAssignments: [],
        recentCompletions: [],
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

  // Bulk update operator statuses
  async updateMultipleStatuses(
    updates: Array<{ operatorId: string; status: 'available' | 'busy' | 'break' | 'offline' }>,
    userId?: string
  ): Promise<ServiceResponse<any>> {
    const operations = updates.map(update => ({
      id: update.operatorId,
      data: {
        availabilityStatus: update.status,
        lastActiveTime: new Date(),
      }
    }));

    return this.batchUpdate(operations, userId);
  }

  // Get operators by department
  async getByDepartment(department: string, options?: QueryOptions): Promise<ServiceResponse<Operator[]>> {
    return this.getWhere('department', '==', department, options);
  }

  // Get operators by machine type
  async getByMachineType(machineType: string, options?: QueryOptions): Promise<ServiceResponse<Operator[]>> {
    return this.getWhere('machineType', '==', machineType, options);
  }

  // Get operators on shift
  async getOperatorsOnShift(shift: 'morning' | 'afternoon' | 'night', options?: QueryOptions): Promise<ServiceResponse<Operator[]>> {
    return this.getWhere('shiftPreference', '==', shift, options);
  }

  // Custom audit logging for operators
  protected shouldAudit(): boolean {
    return true; // Always audit operator changes
  }
}