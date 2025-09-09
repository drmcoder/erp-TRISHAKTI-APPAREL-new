// Sewing Template Service for managing garment production templates
import { BaseService } from './base-service';
import type { ServiceResponse } from './base-service';
import type { 
  SewingTemplate, 
  CreateSewingTemplateData, 
  UpdateSewingTemplateData,
  SewingOperation,
  WorkAssignmentTemplate,
  OperationProgress,
  MachineOperatorAssignment,
  SewingTemplateFilters
} from '../shared/types/sewing-template-types';
import { validateTemplate, calculateTemplateComplexity } from '../shared/types/sewing-template-types';
import { Timestamp } from 'firebase/firestore';

/**
 * SewingTemplateService - Comprehensive sewing template management
 * Handles CRUD operations, analytics, and real-time updates for production templates
 */
export class SewingTemplateService extends BaseService {
  private static instance: SewingTemplateService;
  
  static getInstance(): SewingTemplateService {
    if (!SewingTemplateService.instance) {
      SewingTemplateService.instance = new SewingTemplateService();
    }
    return SewingTemplateService.instance;
  }

  private constructor() {
    super('sewing_templates');
  }

  /**
   * Create new sewing template
   */
  async createTemplate(templateData: CreateSewingTemplateData, createdBy: string): Promise<ServiceResponse<SewingTemplate>> {
    try {
      if (!validateTemplate(templateData)) {
        return { success: false, error: 'Invalid template data provided' };
      }

      // Generate ID for operations
      const operationsWithIds = templateData.operations.map((op, index) => ({
        ...op,
        id: `op_${Date.now()}_${index}`,
        sequenceOrder: index + 1,
        prerequisites: op.processingType === 'sequential' && index > 0 
          ? [`op_${Date.now()}_${index-1}`] 
          : []
      }));

      // Calculate totals
      const totalSmv = operationsWithIds.reduce((sum, op) => sum + op.smvMinutes, 0);
      const totalPricePerPiece = operationsWithIds.reduce((sum, op) => sum + op.pricePerPiece, 0);
      
      // Determine complexity
      const complexityLevel = calculateTemplateComplexity(operationsWithIds);

      const template: Omit<SewingTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
        templateName: templateData.templateName,
        templateCode: templateData.templateCode,
        category: templateData.category,
        operations: operationsWithIds,
        totalSmv,
        totalPricePerPiece,
        complexityLevel,
        version: 1,
        isActive: true,
        timesUsed: 0,
        createdBy,
        notes: templateData.notes,
        setupInstructions: templateData.setupInstructions
      };

      return await this.create<SewingTemplate>(template);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create sewing template'
      };
    }
  }

  /**
   * Get template by ID
   */
  async getTemplate(templateId: string): Promise<ServiceResponse<SewingTemplate>> {
    return await this.getById<SewingTemplate>(templateId);
  }

  /**
   * Get all templates with optional filtering
   */
  async getAllTemplates(category?: string): Promise<ServiceResponse<SewingTemplate[]>> {
    try {
      if (category) {
        return await this.getWhere<SewingTemplate>(
          { field: 'category', operator: '==', value: category },
          { orderByField: 'templateName', orderDirection: 'asc' }
        );
      } else {
        return await this.getAll<SewingTemplate>({ 
          orderByField: 'createdAt', 
          orderDirection: 'desc' 
        });
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get templates'
      };
    }
  }

  /**
   * Update template
   */
  async updateTemplate(templateId: string, updates: UpdateSewingTemplateData): Promise<ServiceResponse<SewingTemplate>> {
    try {
      // Update operations with proper IDs if provided
      if (updates.operations) {
        updates.operations = updates.operations.map((op, index) => ({
          ...op,
          id: op.id || `op_${Date.now()}_${index}`,
          sequence: index + 1
        }));
      }

      return await this.update<SewingTemplate>(templateId, updates);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update template'
      };
    }
  }

  /**
   * Delete template (soft delete by deactivating)
   */
  async deleteTemplate(templateId: string): Promise<ServiceResponse> {
    try {
      return await this.update(templateId, { isActive: false });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete template'
      };
    }
  }

  /**
   * Search templates by name or description
   */
  async searchTemplates(searchTerm: string): Promise<ServiceResponse<SewingTemplate[]>> {
    try {
      const allTemplates = await this.getAll<SewingTemplate>();
      
      if (!allTemplates.success || !allTemplates.data) {
        return { success: false, error: 'Failed to fetch templates for search' };
      }

      const searchTermLower = searchTerm.toLowerCase();
      const filtered = allTemplates.data.filter(template => 
        template.name.toLowerCase().includes(searchTermLower) ||
        template.description?.toLowerCase().includes(searchTermLower) ||
        template.garmentType.toLowerCase().includes(searchTermLower)
      );

      return { success: true, data: filtered };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search templates'
      };
    }
  }

  /**
   * Get popular templates (by usage)
   */
  async getPopularTemplates(limit = 10): Promise<ServiceResponse<SewingTemplate[]>> {
    try {
      return await this.getAll<SewingTemplate>({
        orderByField: 'timesUsed',
        orderDirection: 'desc',
        limitCount: limit
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get popular templates'
      };
    }
  }

  /**
   * Increment usage counter for a template
   */
  async incrementUsage(templateId: string): Promise<ServiceResponse> {
    try {
      const template = await this.getById<SewingTemplate>(templateId);
      if (!template.success || !template.data) {
        return { success: false, error: 'Template not found' };
      }

      const currentUsage = template.data.timesUsed || 0;
      return await this.update(templateId, { timesUsed: currentUsage + 1 });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to increment usage count'
      };
    }
  }

  /**
   * Get template analytics
   */
  async getTemplateAnalytics(templateId: string): Promise<ServiceResponse<any>> {
    try {
      const template = await this.getById<SewingTemplate>(templateId);
      if (!template.success || !template.data) {
        return { success: false, error: 'Template not found' };
      }

      const analytics = {
        templateId,
        templateName: template.data.templateName,
        totalOperations: template.data.operations.length,
        totalSmv: template.data.totalSmv,
        totalPricePerPiece: template.data.totalPricePerPiece,
        averageOperationTime: template.data.totalSmv / template.data.operations.length,
        timesUsed: template.data.timesUsed || 0,
        complexityLevel: template.data.complexityLevel,
        createdAt: template.data.createdAt,
        lastUsed: template.data.updatedAt
      };

      return { success: true, data: analytics };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get template analytics'
      };
    }
  }

  /**
   * Subscribe to template changes
   */
  subscribeToTemplates(callback: (templates: SewingTemplate[]) => void): () => void {
    return this.subscribeToCollection<SewingTemplate>(
      callback,
      { field: 'isActive', operator: '==', value: true },
      { orderByField: 'templateName', orderDirection: 'asc' }
    );
  }

  /**
   * Create work assignment from template - supervisor selects template manually
   */
  async createWorkAssignment(
    templateId: string,
    bundleId: string,
    totalPieces: number,
    supervisorId: string
  ): Promise<ServiceResponse<WorkAssignmentTemplate>> {
    try {
      const templateResult = await this.getTemplate(templateId);
      if (!templateResult.success || !templateResult.data) {
        return { success: false, error: 'Template not found' };
      }

      const template = templateResult.data;

      // Initialize operation progress for each operation
      const operationsProgress: OperationProgress[] = template.operations.map(op => ({
        operationId: op.id,
        machineType: op.machineType,
        status: 'pending',
        piecesCompleted: 0,
        piecesTarget: totalPieces
      }));

      const workAssignment: Omit<WorkAssignmentTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
        templateId,
        bundleId,
        totalPieces,
        operationsProgress,
        assignedOperators: [],
        status: 'draft',
        supervisorId,
        totalOperations: template.operations.length,
        completedOperations: 0,
        progressPercentage: 0
      };

      // Use BaseService to create work assignment in separate collection
      const workAssignmentService = new BaseService('work_assignment_templates');
      const result = await workAssignmentService.create<WorkAssignmentTemplate>(workAssignment);
      
      if (result.success) {
        // Increment template usage
        await this.incrementUsage(templateId);
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create work assignment'
      };
    }
  }

  /**
   * Assign operator to machine type (one operator per machine)
   */
  async assignOperatorToMachine(
    operatorId: string,
    operatorName: string,
    machineType: string
  ): Promise<ServiceResponse<MachineOperatorAssignment>> {
    try {
      const machineAssignmentService = new BaseService('machine_operator_assignments');
      
      // Check if operator already assigned to this machine type
      const existingResult = await machineAssignmentService.getWhere<MachineOperatorAssignment>({
        field: 'operatorId',
        operator: '==',
        value: operatorId
      });

      if (existingResult.success && existingResult.data && existingResult.data.length > 0) {
        const existingAssignment = existingResult.data.find(a => a.machineType === machineType && a.isActive);
        if (existingAssignment) {
          return { success: false, error: 'Operator already assigned to this machine type' };
        }
      }

      const assignment: Omit<MachineOperatorAssignment, 'id' | 'assignedAt'> = {
        operatorId,
        operatorName,
        machineType,
        isActive: true,
        currentWorkload: 0
      };

      return await machineAssignmentService.create<MachineOperatorAssignment>(assignment);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to assign operator to machine'
      };
    }
  }

  /**
   * Get operators by machine type
   */
  async getOperatorsByMachineType(machineType: string): Promise<ServiceResponse<MachineOperatorAssignment[]>> {
    try {
      const machineAssignmentService = new BaseService('machine_operator_assignments');
      
      return await machineAssignmentService.getWhere<MachineOperatorAssignment>(
        { field: 'machineType', operator: '==', value: machineType },
        { orderByField: 'currentWorkload', orderDirection: 'asc' }
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get operators for machine type'
      };
    }
  }

  /**
   * Update operation progress in work assignment
   */
  async updateOperationProgress(
    workAssignmentId: string,
    operationId: string,
    progress: Partial<OperationProgress>
  ): Promise<ServiceResponse> {
    try {
      const workAssignmentService = new BaseService('work_assignment_templates');
      const workAssignmentResult = await workAssignmentService.getById<WorkAssignmentTemplate>(workAssignmentId);
      
      if (!workAssignmentResult.success || !workAssignmentResult.data) {
        return { success: false, error: 'Work assignment not found' };
      }

      const workAssignment = workAssignmentResult.data;
      const progressIndex = workAssignment.operationsProgress.findIndex(op => op.operationId === operationId);
      
      if (progressIndex === -1) {
        return { success: false, error: 'Operation not found in work assignment' };
      }

      // Update operation progress
      workAssignment.operationsProgress[progressIndex] = {
        ...workAssignment.operationsProgress[progressIndex],
        ...progress
      };

      // Recalculate overall progress
      const completedOperations = workAssignment.operationsProgress.filter(op => op.status === 'completed').length;
      const progressPercentage = Math.round((completedOperations / workAssignment.totalOperations) * 100);

      return await workAssignmentService.update(workAssignmentId, {
        operationsProgress: workAssignment.operationsProgress,
        completedOperations,
        progressPercentage
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update operation progress'
      };
    }
  }

  /**
   * Get work assignments by bundle ID
   */
  async getWorkAssignmentsByBundle(bundleId: string): Promise<ServiceResponse<WorkAssignmentTemplate[]>> {
    try {
      const workAssignmentService = new BaseService('work_assignment_templates');
      return await workAssignmentService.getWhere<WorkAssignmentTemplate>({
        field: 'bundleId',
        operator: '==',
        value: bundleId
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get work assignments for bundle'
      };
    }
  }
}

// Export singleton instance
export const sewingTemplateService = SewingTemplateService.getInstance();