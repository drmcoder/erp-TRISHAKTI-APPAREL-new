// Template Integration Service
// Provides intelligent template matching, workflow generation, and optimization

import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';

export interface SewingTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  operations: Operation[];
  estimatedTime: number; // in minutes
  complexity: 'low' | 'medium' | 'high';
  sizeRatios: { [size: string]: number };
  qualityRequirements: QualityRequirement[];
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  rating: number;
  isActive: boolean;
  machineTypes: string[];
  skillRequirements: string[];
}

export interface Operation {
  id: string;
  name: string;
  nameNepali?: string;
  sequence: number;
  machineType: string;
  estimatedMinutes: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  qualityCheckpoints: QualityCheckpoint[];
  description: string;
  dependencies: string[];
  parallelizable: boolean;
}

export interface QualityCheckpoint {
  id: string;
  name: string;
  description: string;
  type: 'measurement' | 'visual' | 'functional';
  tolerance: string;
  critical: boolean;
  inspectionMethod: string;
}

export interface QualityRequirement {
  id: string;
  type: 'measurement' | 'visual' | 'functional';
  description: string;
  tolerance: string;
  critical: boolean;
  inspectionPoints: string[];
  acceptanceCriteria: string;
}

export interface TemplateAnalytics {
  templateId: string;
  totalUsage: number;
  averageRating: number;
  successRate: number;
  averageCompletionTime: number;
  commonIssues: string[];
  optimizationSuggestions: string[];
}

export interface TemplateMatchCriteria {
  fabricType: string;
  articleCategory: string;
  complexity?: 'low' | 'medium' | 'high';
  requiredMachines?: string[];
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  timeConstraints?: number; // max minutes
  qualityLevel?: 'basic' | 'standard' | 'premium' | 'luxury';
}

class TemplateIntegrationService {
  private readonly templatesCollection = 'sewing_templates';
  private readonly analyticsCollection = 'template_analytics';
  
  // Template Management
  async createTemplate(templateData: Omit<SewingTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'rating'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.templatesCollection), {
        ...templateData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        usageCount: 0,
        rating: 5.0,
        isActive: true
      });
      
      console.log('Template created successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }

  async getTemplates(filters?: {
    category?: string;
    complexity?: string;
    isActive?: boolean;
    limit?: number;
  }): Promise<SewingTemplate[]> {
    try {
      let q = query(
        collection(db, this.templatesCollection),
        orderBy('usageCount', 'desc'),
        orderBy('rating', 'desc')
      );

      if (filters?.category) {
        q = query(q, where('category', '==', filters.category));
      }
      
      if (filters?.complexity) {
        q = query(q, where('complexity', '==', filters.complexity));
      }
      
      if (filters?.isActive !== undefined) {
        q = query(q, where('isActive', '==', filters.isActive));
      }

      const snapshot = await getDocs(q);
      const templates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (doc.data().updatedAt as Timestamp)?.toDate() || new Date(),
      })) as SewingTemplate[];

      return filters?.limit ? templates.slice(0, filters.limit) : templates;
    } catch (error) {
      console.error('Error getting templates:', error);
      throw error;
    }
  }

  async getTemplateById(templateId: string): Promise<SewingTemplate | null> {
    try {
      const docRef = doc(db, this.templatesCollection, templateId);
      const docSnap = await getDocs(query(collection(db, this.templatesCollection), where('__name__', '==', templateId)));
      
      if (docSnap.empty) {
        return null;
      }

      const docData = docSnap.docs[0];
      return {
        id: docData.id,
        ...docData.data(),
        createdAt: (docData.data().createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (docData.data().updatedAt as Timestamp)?.toDate() || new Date(),
      } as SewingTemplate;
    } catch (error) {
      console.error('Error getting template:', error);
      throw error;
    }
  }

  // Intelligent Template Matching
  async suggestTemplates(criteria: TemplateMatchCriteria): Promise<SewingTemplate[]> {
    try {
      const allTemplates = await this.getTemplates({ isActive: true });
      
      const scoredTemplates = allTemplates.map(template => {
        let score = 0;
        
        // Category matching (high weight)
        if (template.category === criteria.articleCategory) {
          score += 40;
        }
        
        // Fabric type matching (medium weight)
        if (template.tags.some(tag => 
          tag.toLowerCase().includes(criteria.fabricType.toLowerCase()) ||
          criteria.fabricType.toLowerCase().includes(tag.toLowerCase())
        )) {
          score += 25;
        }
        
        // Complexity matching (medium weight)
        if (criteria.complexity && template.complexity === criteria.complexity) {
          score += 20;
        } else if (criteria.complexity) {
          const complexityMap = { low: 1, medium: 2, high: 3 };
          const diff = Math.abs(complexityMap[template.complexity] - complexityMap[criteria.complexity]);
          score += Math.max(0, 20 - (diff * 10));
        }
        
        // Machine type compatibility (medium weight)
        if (criteria.requiredMachines && template.machineTypes) {
          const commonMachines = template.machineTypes.filter(machine => 
            criteria.requiredMachines!.includes(machine)
          );
          score += (commonMachines.length / Math.max(criteria.requiredMachines.length, 1)) * 15;
        }
        
        // Time constraints (medium weight)
        if (criteria.timeConstraints && template.estimatedTime <= criteria.timeConstraints) {
          score += 15;
        } else if (criteria.timeConstraints) {
          const timeRatio = criteria.timeConstraints / template.estimatedTime;
          score += Math.max(0, timeRatio * 15);
        }
        
        // Usage popularity (low weight)
        score += Math.min(template.usageCount * 0.1, 10);
        
        // Rating boost (low weight)
        score += template.rating * 2;
        
        // Skill level matching (medium weight)
        if (criteria.skillLevel && template.skillRequirements.includes(criteria.skillLevel)) {
          score += 15;
        }
        
        return { template, score };
      });

      // Sort by score and return top suggestions
      return scoredTemplates
        .filter(item => item.score > 20) // Minimum threshold
        .sort((a, b) => b.score - a.score)
        .slice(0, 8) // Top 8 suggestions
        .map(item => item.template);
    } catch (error) {
      console.error('Error suggesting templates:', error);
      throw error;
    }
  }

  // Advanced Size Ratio Analysis
  calculateSizeRatioSimilarity(
    ratios1: { [size: string]: number },
    ratios2: { [size: string]: number }
  ): number {
    const allSizes = new Set([...Object.keys(ratios1), ...Object.keys(ratios2)]);
    let totalSimilarity = 0;
    let comparisons = 0;

    allSizes.forEach(size => {
      const val1 = ratios1[size] || 0;
      const val2 = ratios2[size] || 0;
      
      if (val1 > 0 || val2 > 0) {
        const maxVal = Math.max(val1, val2, 1);
        const similarity = 1 - Math.abs(val1 - val2) / maxVal;
        totalSimilarity += similarity;
        comparisons++;
      }
    });

    return comparisons > 0 ? totalSimilarity / comparisons : 0;
  }

  // Workflow Generation
  async generateOptimizedWorkflow(templates: SewingTemplate[], articles: any[]): Promise<any[]> {
    try {
      const workflow: any[] = [];
      let sequenceId = 1;

      // Pre-production planning steps
      workflow.push({
        id: `prep_${sequenceId++}`,
        name: 'Material Inspection & Preparation',
        description: 'Inspect all materials and prepare workspace',
        type: 'preparation',
        estimatedDuration: 30,
        dependencies: [],
        parallel: false,
        criticalPath: true,
        assignedSkillLevel: 'intermediate'
      });

      // Pattern & cutting preparation
      workflow.push({
        id: `prep_${sequenceId++}`,
        name: 'Pattern Layout & Cutting Preparation',
        description: 'Prepare cutting patterns and optimize fabric usage',
        type: 'preparation',
        estimatedDuration: 45,
        dependencies: [workflow[workflow.length - 1].id],
        parallel: false,
        criticalPath: true,
        assignedSkillLevel: 'advanced'
      });

      // Article-specific workflow generation
      articles.forEach((article, articleIndex) => {
        const template = templates.find(t => t.id === article.templateId);
        if (!template) return;

        const baseId = `article_${articleIndex}`;
        
        // Cutting phase
        workflow.push({
          id: `${baseId}_cutting`,
          name: `Cutting - ${article.articleName}`,
          description: `Cut fabric pieces for ${article.articleName}`,
          type: 'cutting',
          estimatedDuration: Math.ceil(article.totalQuantity * 0.8),
          dependencies: [`prep_${sequenceId - 1}`],
          parallel: articleIndex > 0, // Can run parallel with other article cutting
          criticalPath: true,
          assignedSkillLevel: 'intermediate',
          qualityCheckpoints: ['piece_count', 'dimension_check', 'defect_inspection']
        });

        // Template operations
        template.operations
          .sort((a, b) => a.sequence - b.sequence)
          .forEach((operation, opIndex) => {
            const prevOpId = opIndex === 0 
              ? `${baseId}_cutting` 
              : `${baseId}_op_${opIndex - 1}`;

            workflow.push({
              id: `${baseId}_op_${opIndex}`,
              name: `${operation.name} - ${article.articleName}`,
              nameNepali: operation.nameNepali,
              description: operation.description,
              type: 'production',
              estimatedDuration: operation.estimatedMinutes * article.totalQuantity,
              dependencies: operation.dependencies.length > 0 
                ? operation.dependencies.map(dep => `${baseId}_${dep}`)
                : [prevOpId],
              parallel: operation.parallelizable,
              criticalPath: !operation.parallelizable,
              assignedSkillLevel: operation.skillLevel,
              machineType: operation.machineType,
              qualityCheckpoints: operation.qualityCheckpoints.map(cp => cp.name)
            });
          });

        // Quality inspection
        workflow.push({
          id: `${baseId}_quality`,
          name: `Quality Inspection - ${article.articleName}`,
          description: `Final quality check for ${article.articleName}`,
          type: 'quality',
          estimatedDuration: Math.ceil(article.totalQuantity * 0.4),
          dependencies: [`${baseId}_op_${template.operations.length - 1}`],
          parallel: false,
          criticalPath: true,
          assignedSkillLevel: 'advanced',
          qualityCheckpoints: template.qualityRequirements.map(qr => qr.type)
        });
      });

      // Final assembly and packaging
      const finalDependencies = articles.map((_, index) => `article_${index}_quality`);
      workflow.push({
        id: `final_assembly`,
        name: 'Final Assembly & Packaging',
        description: 'Assemble completed pieces and prepare for shipping',
        type: 'finishing',
        estimatedDuration: 60,
        dependencies: finalDependencies,
        parallel: false,
        criticalPath: true,
        assignedSkillLevel: 'intermediate'
      });

      // Calculate critical path and optimize scheduling
      this.optimizeWorkflowScheduling(workflow);

      return workflow;
    } catch (error) {
      console.error('Error generating workflow:', error);
      throw error;
    }
  }

  private optimizeWorkflowScheduling(workflow: any[]): void {
    // Simple critical path calculation
    const workflowMap = new Map(workflow.map(step => [step.id, step]));
    
    workflow.forEach(step => {
      step.earliestStart = 0;
      step.latestStart = 0;
    });

    // Forward pass - calculate earliest start times
    workflow.forEach(step => {
      if (step.dependencies.length === 0) {
        step.earliestStart = 0;
      } else {
        step.earliestStart = Math.max(
          ...step.dependencies.map(depId => {
            const dep = workflowMap.get(depId);
            return dep ? dep.earliestStart + dep.estimatedDuration : 0;
          })
        );
      }
    });

    // Mark critical path steps
    const totalDuration = Math.max(...workflow.map(step => step.earliestStart + step.estimatedDuration));
    
    workflow.forEach(step => {
      const slack = totalDuration - (step.earliestStart + step.estimatedDuration);
      step.slack = slack;
      step.isCriticalPath = slack <= 5; // 5 minutes slack tolerance
    });
  }

  // Template Analytics
  async getTemplateAnalytics(templateId: string): Promise<TemplateAnalytics | null> {
    try {
      // This would typically query usage data from analytics collection
      // For now, return sample analytics
      return {
        templateId,
        totalUsage: 45,
        averageRating: 4.3,
        successRate: 0.92,
        averageCompletionTime: 120,
        commonIssues: [
          'Size ratio adjustments needed',
          'Machine setup time longer than expected',
          'Quality checkpoint delays'
        ],
        optimizationSuggestions: [
          'Pre-configure machines before starting',
          'Add intermediate quality checks',
          'Consider batch processing for efficiency'
        ]
      };
    } catch (error) {
      console.error('Error getting template analytics:', error);
      return null;
    }
  }

  // Template Rating and Feedback
  async rateTemplate(templateId: string, rating: number, feedback?: string): Promise<void> {
    try {
      const template = await this.getTemplateById(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Update usage count and recalculate average rating
      const newUsageCount = template.usageCount + 1;
      const newRating = ((template.rating * template.usageCount) + rating) / newUsageCount;

      await updateDoc(doc(db, this.templatesCollection, templateId), {
        usageCount: newUsageCount,
        rating: Number(newRating.toFixed(2)),
        updatedAt: serverTimestamp()
      });

      // Store feedback if provided
      if (feedback) {
        await addDoc(collection(db, 'template_feedback'), {
          templateId,
          rating,
          feedback,
          timestamp: serverTimestamp()
        });
      }

      console.log('Template rated successfully');
    } catch (error) {
      console.error('Error rating template:', error);
      throw error;
    }
  }

  // Default Templates Creation
  async createDefaultTemplates(): Promise<void> {
    const defaultTemplates = [
      {
        name: 'Basic T-Shirt',
        description: 'Standard cotton t-shirt manufacturing process',
        category: 'shirts',
        operations: [
          {
            id: 'op_1',
            name: 'Pattern Layout',
            nameNepali: 'ढाँचा मिलाउने',
            sequence: 1,
            machineType: 'cutting_table',
            estimatedMinutes: 2,
            skillLevel: 'intermediate' as const,
            qualityCheckpoints: [
              { id: 'cp_1', name: 'Pattern Alignment', description: 'Check pattern alignment', type: 'visual' as const, tolerance: '±2mm', critical: true, inspectionMethod: 'visual' }
            ],
            description: 'Lay out patterns on fabric efficiently',
            dependencies: [],
            parallelizable: false
          },
          {
            id: 'op_2',
            name: 'Cutting',
            nameNepali: 'काट्ने',
            sequence: 2,
            machineType: 'cutting_machine',
            estimatedMinutes: 3,
            skillLevel: 'intermediate' as const,
            qualityCheckpoints: [
              { id: 'cp_2', name: 'Cut Precision', description: 'Check cutting accuracy', type: 'measurement' as const, tolerance: '±1mm', critical: true, inspectionMethod: 'measurement' }
            ],
            description: 'Cut fabric pieces according to pattern',
            dependencies: ['op_1'],
            parallelizable: false
          },
          {
            id: 'op_3',
            name: 'Shoulder Seaming',
            nameNepali: 'काँध जोड्ने',
            sequence: 3,
            machineType: 'overlock_machine',
            estimatedMinutes: 4,
            skillLevel: 'intermediate' as const,
            qualityCheckpoints: [
              { id: 'cp_3', name: 'Seam Quality', description: 'Check seam strength and appearance', type: 'visual' as const, tolerance: 'No visible defects', critical: true, inspectionMethod: 'visual_tactile' }
            ],
            description: 'Join shoulder seams',
            dependencies: ['op_2'],
            parallelizable: false
          }
        ],
        estimatedTime: 25,
        complexity: 'medium' as const,
        sizeRatios: { S: 1, M: 2, L: 2, XL: 1 },
        qualityRequirements: [
          {
            id: 'qr_1',
            type: 'measurement' as const,
            description: 'Chest measurement accuracy',
            tolerance: '±5mm',
            critical: true,
            inspectionPoints: ['front_chest', 'back_chest'],
            acceptanceCriteria: 'Within tolerance range'
          }
        ],
        tags: ['cotton', 'basic', 'casual', 'unisex'],
        createdBy: 'system',
        machineTypes: ['cutting_machine', 'overlock_machine', 'sewing_machine'],
        skillRequirements: ['basic_sewing', 'machine_operation']
      },
      
      {
        name: 'Formal Pants',
        description: 'Professional dress pants manufacturing',
        category: 'pants',
        operations: [
          {
            id: 'op_1',
            name: 'Pattern Preparation',
            nameNepali: 'ढाँचा तयारी',
            sequence: 1,
            machineType: 'cutting_table',
            estimatedMinutes: 5,
            skillLevel: 'advanced' as const,
            qualityCheckpoints: [
              { id: 'cp_1', name: 'Pattern Match', description: 'Ensure pattern pieces match specifications', type: 'measurement' as const, tolerance: '±1mm', critical: true, inspectionMethod: 'measurement' }
            ],
            description: 'Prepare and layout complex pattern pieces',
            dependencies: [],
            parallelizable: false
          },
          {
            id: 'op_2',
            name: 'Fabric Cutting',
            nameNepali: 'कपडा काट्ने',
            sequence: 2,
            machineType: 'band_knife',
            estimatedMinutes: 8,
            skillLevel: 'advanced' as const,
            qualityCheckpoints: [
              { id: 'cp_2', name: 'Cut Accuracy', description: 'Check cutting precision', type: 'measurement' as const, tolerance: '±0.5mm', critical: true, inspectionMethod: 'measurement' }
            ],
            description: 'Precision cutting of pants components',
            dependencies: ['op_1'],
            parallelizable: false
          }
        ],
        estimatedTime: 45,
        complexity: 'high' as const,
        sizeRatios: { S: 1, M: 2, L: 3, XL: 2, '2XL': 1 },
        qualityRequirements: [
          {
            id: 'qr_1',
            type: 'measurement' as const,
            description: 'Waist and inseam measurements',
            tolerance: '±3mm',
            critical: true,
            inspectionPoints: ['waistband', 'inseam', 'outseam'],
            acceptanceCriteria: 'All measurements within tolerance'
          }
        ],
        tags: ['formal', 'business', 'polyester', 'tailored'],
        createdBy: 'system',
        machineTypes: ['band_knife', 'sewing_machine', 'overlock_machine', 'buttonhole_machine'],
        skillRequirements: ['advanced_sewing', 'precision_cutting', 'finishing']
      }
    ];

    try {
      for (const template of defaultTemplates) {
        await this.createTemplate(template);
      }
      console.log('Default templates created successfully');
    } catch (error) {
      console.error('Error creating default templates:', error);
    }
  }
}

export const templateIntegrationService = new TemplateIntegrationService();