import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/test-utils';
import { WorkAssignmentDashboard } from '@/features/work-assignment/components/assignment-dashboard';
import { SelfAssignmentInterface } from '@/features/work-assignment/components/self-assignment-interface';
import { WorkCompletionWorkflow } from '@/features/work-assignment/components/work-completion-workflow';

// Mock the work assignment service
const mockWorkAssignmentService = {
  getAssignments: vi.fn(),
  createAssignment: vi.fn(),
  updateAssignment: vi.fn(),
  deleteAssignment: vi.fn(),
  getAvailableWork: vi.fn(),
  requestAssignment: vi.fn(),
  completeAssignment: vi.fn(),
  subscribe: vi.fn(() => () => {}),
};

vi.mock('@/features/work-assignment/services/work-assignment-service', () => ({
  workAssignmentService: mockWorkAssignmentService,
}));

// Mock Firebase services
const mockFirebaseServices = {
  workItems: {
    getAssignedWorkItems: vi.fn(),
    completeWorkItem: vi.fn(),
    updateWorkItemStatus: vi.fn(),
  },
  damageReports: {
    submitDamageReport: vi.fn(),
  },
  wallets: {
    getWalletBalance: vi.fn(),
    releasePayment: vi.fn(),
  },
};

vi.mock('@/services/firebase-services', () => ({
  default: mockFirebaseServices,
}));

describe('Work Assignment Workflow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Supervisor Work Assignment Flow', () => {
    const mockWorkItems = [
      {
        id: 'work-1',
        bundleNumber: 'B001',
        articleNumber: 'A001',
        operation: 'cutting',
        pieces: 50,
        rate: 10,
        status: 'pending',
        priority: 'high',
        estimatedDuration: 120,
        targetQuantity: 50,
      },
      {
        id: 'work-2',
        bundleNumber: 'B002',
        articleNumber: 'A002',
        operation: 'sewing',
        pieces: 30,
        rate: 15,
        status: 'pending',
        priority: 'medium',
        estimatedDuration: 90,
        targetQuantity: 30,
      },
    ];

    const _mockOperators = [
      {
        id: 'op-1',
        name: 'John Smith',
        skills: ['cutting', 'sewing'],
        currentWorkload: 60,
        availability: 'available',
        efficiency: 0.92,
      },
      {
        id: 'op-2',
        name: 'Jane Doe',
        skills: ['sewing', 'finishing'],
        currentWorkload: 80,
        availability: 'busy',
        efficiency: 0.88,
      },
    ];

    beforeEach(() => {
      mockWorkAssignmentService.getAssignments.mockResolvedValue({
        success: true,
        data: mockWorkItems,
      });

      mockWorkAssignmentService.createAssignment.mockResolvedValue({
        success: true,
        data: { id: 'assignment-1' },
      });
    });

    it('should display work items and allow assignment to operators', async () => {
      render(<WorkAssignmentDashboard userRole="supervisor" />);

      // Wait for work items to load
      await waitFor(() => {
        expect(screen.getByText('B001')).toBeInTheDocument();
        expect(screen.getByText('B002')).toBeInTheDocument();
      });

      // Should display work item details
      expect(screen.getByText('cutting')).toBeInTheDocument();
      expect(screen.getByText('sewing')).toBeInTheDocument();
      expect(screen.getByText('50 pieces')).toBeInTheDocument();
      expect(screen.getByText('30 pieces')).toBeInTheDocument();

      // Should show assignment buttons for pending work
      const assignButtons = screen.getAllByText('Assign Work');
      expect(assignButtons).toHaveLength(2);
    });

    it('should open assignment modal and assign work to operator', async () => {
      render(<WorkAssignmentDashboard userRole="supervisor" />);

      await waitFor(() => {
        expect(screen.getByText('B001')).toBeInTheDocument();
      });

      // Click assign button for first work item
      const assignButton = screen.getAllByText('Assign Work')[0];
      fireEvent.click(assignButton);

      // Should open assignment modal
      await waitFor(() => {
        expect(screen.getByText('Assign Work Item')).toBeInTheDocument();
      });

      // Should show operator selection
      expect(screen.getByText('Select Operator')).toBeInTheDocument();

      // Select operator
      const operatorSelect = screen.getByRole('combobox');
      fireEvent.click(operatorSelect);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('John Smith'));

      // Set priority and notes
      const prioritySelect = screen.getByLabelText('Priority');
      fireEvent.change(prioritySelect, { target: { value: 'high' } });

      const notesInput = screen.getByLabelText('Notes');
      fireEvent.change(notesInput, {
        target: { value: 'Handle with care - premium fabric' }
      });

      // Submit assignment
      const submitButton = screen.getByText('Assign Work');
      fireEvent.click(submitButton);

      // Should call assignment service
      await waitFor(() => {
        expect(mockWorkAssignmentService.createAssignment).toHaveBeenCalledWith({
          workItemId: 'work-1',
          operatorId: 'op-1',
          priority: 'high',
          notes: 'Handle with care - premium fabric',
          assignedBy: expect.any(String),
        });
      });

      // Should close modal and show success message
      await waitFor(() => {
        expect(screen.queryByText('Assign Work Item')).not.toBeInTheDocument();
      });
    });

    it('should show AI recommendations for work assignment', async () => {
      const mockRecommendations = [
        {
          operatorId: 'op-1',
          confidence: 0.92,
          reasons: ['High skill match', 'Available capacity', 'Good efficiency'],
          estimatedCompletion: new Date(Date.now() + 2 * 60 * 60 * 1000),
        },
      ];

      mockWorkAssignmentService.getRecommendations = vi.fn().mockResolvedValue({
        success: true,
        data: mockRecommendations,
      });

      render(<WorkAssignmentDashboard userRole="supervisor" />);

      await waitFor(() => {
        expect(screen.getByText('B001')).toBeInTheDocument();
      });

      // Click assign button
      const assignButton = screen.getAllByText('Assign Work')[0];
      fireEvent.click(assignButton);

      await waitFor(() => {
        expect(screen.getByText('AI Recommendations')).toBeInTheDocument();
      });

      // Should show recommendation details
      expect(screen.getByText('92% confidence')).toBeInTheDocument();
      expect(screen.getByText('High skill match')).toBeInTheDocument();

      // Should allow accepting recommendation
      const acceptButton = screen.getByText('Accept Recommendation');
      fireEvent.click(acceptButton);

      expect(mockWorkAssignmentService.createAssignment).toHaveBeenCalledWith(
        expect.objectContaining({
          operatorId: 'op-1',
          assignmentMethod: 'ai_recommended',
        })
      );
    });

    it('should handle bulk assignment workflow', async () => {
      render(<WorkAssignmentDashboard userRole="supervisor" />);

      await waitFor(() => {
        expect(screen.getAllByText(/B00/)).toHaveLength(2);
      });

      // Select multiple work items
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]); // Select first item
      fireEvent.click(checkboxes[1]); // Select second item

      // Click bulk assign button
      const bulkAssignButton = screen.getByText('Bulk Assign');
      fireEvent.click(bulkAssignButton);

      await waitFor(() => {
        expect(screen.getByText('Bulk Assignment')).toBeInTheDocument();
      });

      // Select assignment strategy
      const strategySelect = screen.getByLabelText('Assignment Strategy');
      fireEvent.change(strategySelect, { target: { value: 'skill_based' } });

      // Preview assignments
      const previewButton = screen.getByText('Preview Assignments');
      fireEvent.click(previewButton);

      // Should show assignment preview
      await waitFor(() => {
        expect(screen.getByText('Assignment Preview')).toBeInTheDocument();
      });

      // Confirm bulk assignment
      const confirmButton = screen.getByText('Confirm Assignments');
      fireEvent.click(confirmButton);

      expect(mockWorkAssignmentService.createAssignment).toHaveBeenCalledTimes(2);
    });
  });

  describe('Operator Self-Assignment Flow', () => {
    const mockAvailableWork = [
      {
        id: 'work-3',
        bundleNumber: 'B003',
        articleNumber: 'A003',
        operation: 'cutting',
        pieces: 40,
        rate: 12,
        difficulty: 'medium',
        estimatedTime: 100,
        skillsRequired: ['cutting'],
        compatibility: 0.95,
      },
      {
        id: 'work-4',
        bundleNumber: 'B004',
        articleNumber: 'A004',
        operation: 'sewing',
        pieces: 25,
        rate: 18,
        difficulty: 'high',
        estimatedTime: 150,
        skillsRequired: ['sewing', 'precision'],
        compatibility: 0.75,
      },
    ];

    beforeEach(() => {
      mockWorkAssignmentService.getAvailableWork.mockResolvedValue({
        success: true,
        data: mockAvailableWork,
      });

      mockWorkAssignmentService.requestAssignment.mockResolvedValue({
        success: true,
        data: { requestId: 'req-1' },
      });
    });

    it('should display available work items for self-assignment', async () => {
      render(<SelfAssignmentInterface operatorId="op-1" />);

      await waitFor(() => {
        expect(screen.getByText('Available Work')).toBeInTheDocument();
        expect(screen.getByText('B003')).toBeInTheDocument();
        expect(screen.getByText('B004')).toBeInTheDocument();
      });

      // Should show work details
      expect(screen.getByText('cutting')).toBeInTheDocument();
      expect(screen.getByText('40 pieces')).toBeInTheDocument();
      expect(screen.getByText('Rs. 12/piece')).toBeInTheDocument();

      // Should show compatibility scores
      expect(screen.getByText('95% match')).toBeInTheDocument();
      expect(screen.getByText('75% match')).toBeInTheDocument();
    });

    it('should allow operator to request work assignment', async () => {
      render(<SelfAssignmentInterface operatorId="op-1" />);

      await waitFor(() => {
        expect(screen.getByText('B003')).toBeInTheDocument();
      });

      // Click request button for compatible work
      const requestButton = screen.getAllByText('Request Work')[0];
      fireEvent.click(requestButton);

      // Should open request modal
      await waitFor(() => {
        expect(screen.getByText('Request Work Assignment')).toBeInTheDocument();
      });

      // Add reason for request
      const reasonInput = screen.getByLabelText('Reason for Request');
      fireEvent.change(reasonInput, {
        target: { value: 'I have experience with this type of cutting work' }
      });

      // Set estimated completion time
      const timeInput = screen.getByLabelText('Estimated Completion');
      fireEvent.change(timeInput, {
        target: { value: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() }
      });

      // Submit request
      const submitButton = screen.getByText('Submit Request');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockWorkAssignmentService.requestAssignment).toHaveBeenCalledWith({
          workItemId: 'work-3',
          operatorId: 'op-1',
          reason: 'I have experience with this type of cutting work',
          estimatedCompletion: expect.any(String),
        });
      });

      // Should show success message
      expect(screen.getByText('Request sent for approval')).toBeInTheDocument();
    });

    it('should show work that operator is not eligible for', async () => {
      const incompatibleWork = [
        {
          ...mockAvailableWork[1],
          compatibility: 0.3,
          ineligibleReasons: ['Skill mismatch', 'Workload at capacity'],
        },
      ];

      mockWorkAssignmentService.getAvailableWork.mockResolvedValue({
        success: true,
        data: incompatibleWork,
      });

      render(<SelfAssignmentInterface operatorId="op-1" />);

      await waitFor(() => {
        expect(screen.getByText('B004')).toBeInTheDocument();
      });

      // Should show ineligibility reasons
      expect(screen.getByText('Not eligible')).toBeInTheDocument();
      expect(screen.getByText('Skill mismatch')).toBeInTheDocument();
      expect(screen.getByText('Workload at capacity')).toBeInTheDocument();

      // Request button should be disabled
      const requestButton = screen.getByText('Request Work');
      expect(requestButton).toBeDisabled();
    });
  });

  describe('Work Completion Workflow', () => {
    const mockAssignedWork = {
      id: 'assignment-1',
      workItemId: 'work-1',
      bundleNumber: 'B001',
      operation: 'cutting',
      pieces: 50,
      rate: 10,
      status: 'started',
      startedAt: new Date(Date.now() - 60 * 60 * 1000),
      targetQuantity: 50,
      completedQuantity: 30,
    };

    beforeEach(() => {
      mockFirebaseServices.workItems.getAssignedWorkItems.mockResolvedValue({
        success: true,
        data: [mockAssignedWork],
      });

      mockFirebaseServices.workItems.completeWorkItem.mockResolvedValue({
        success: true,
        data: { earnedAmount: 500 },
      });

      mockFirebaseServices.wallets.getWalletBalance.mockResolvedValue({
        success: true,
        data: { availableAmount: 1500, heldAmount: 0 },
      });
    });

    it('should show current work and allow completion', async () => {
      render(<WorkCompletionWorkflow operatorId="op-1" />);

      await waitFor(() => {
        expect(screen.getByText('Current Work')).toBeInTheDocument();
        expect(screen.getByText('B001')).toBeInTheDocument();
      });

      // Should show work progress
      expect(screen.getByText('30/50 pieces completed')).toBeInTheDocument();
      expect(screen.getByText('60% complete')).toBeInTheDocument();

      // Should show completion form
      const completionButton = screen.getByText('Complete Work');
      fireEvent.click(completionButton);

      await waitFor(() => {
        expect(screen.getByText('Work Completion')).toBeInTheDocument();
      });

      // Fill completion details
      const piecesInput = screen.getByLabelText('Pieces Completed');
      fireEvent.change(piecesInput, { target: { value: '50' } });

      const qualitySelect = screen.getByLabelText('Quality Grade');
      fireEvent.change(qualitySelect, { target: { value: 'A' } });

      const notesInput = screen.getByLabelText('Completion Notes');
      fireEvent.change(notesInput, {
        target: { value: 'Work completed successfully, good fabric quality' }
      });

      // Submit completion
      const submitButton = screen.getByText('Submit Completion');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockFirebaseServices.workItems.completeWorkItem).toHaveBeenCalledWith(
          'work-1',
          {
            piecesCompleted: 50,
            qualityScore: 'A',
            notes: 'Work completed successfully, good fabric quality',
            operatorId: 'op-1',
            completedAt: expect.any(Date),
          }
        );
      });

      // Should show success message with earnings
      expect(screen.getByText('Work completed! Earned: Rs. 500')).toBeInTheDocument();
    });

    it('should handle work completion with damage reporting', async () => {
      render(<WorkCompletionWorkflow operatorId="op-1" />);

      await waitFor(() => {
        expect(screen.getByText('B001')).toBeInTheDocument();
      });

      const completionButton = screen.getByText('Complete Work');
      fireEvent.click(completionButton);

      await waitFor(() => {
        expect(screen.getByText('Work Completion')).toBeInTheDocument();
      });

      // Indicate damage occurred
      const damageCheckbox = screen.getByLabelText('Damage occurred during work');
      fireEvent.click(damageCheckbox);

      // Should show damage reporting form
      await waitFor(() => {
        expect(screen.getByText('Damage Report')).toBeInTheDocument();
      });

      // Fill damage details
      const damageTypeSelect = screen.getByLabelText('Damage Type');
      fireEvent.change(damageTypeSelect, { target: { value: 'cutting_error' } });

      const damagedPiecesInput = screen.getByLabelText('Number of Damaged Pieces');
      fireEvent.change(damagedPiecesInput, { target: { value: '3' } });

      const damageDescription = screen.getByLabelText('Damage Description');
      fireEvent.change(damageDescription, {
        target: { value: 'Fabric tore during cutting due to material weakness' }
      });

      // Submit completion with damage
      const submitButton = screen.getByText('Complete with Damage Report');
      fireEvent.click(submitButton);

      // Should call both completion and damage reporting
      await waitFor(() => {
        expect(mockFirebaseServices.damageReports.submitDamageReport).toHaveBeenCalledWith({
          bundleId: 'work-1',
          operatorId: 'op-1',
          damageType: 'cutting_error',
          damagedPieces: 3,
          description: 'Fabric tore during cutting due to material weakness',
          pieces: 50,
          rate: 10,
        });
      });

      // Should show payment hold message
      expect(screen.getByText(/payment will be held/i)).toBeInTheDocument();
    });

    it('should prevent completion when required fields are missing', async () => {
      render(<WorkCompletionWorkflow operatorId="op-1" />);

      await waitFor(() => {
        expect(screen.getByText('B001')).toBeInTheDocument();
      });

      const completionButton = screen.getByText('Complete Work');
      fireEvent.click(completionButton);

      await waitFor(() => {
        expect(screen.getByText('Work Completion')).toBeInTheDocument();
      });

      // Try to submit without required fields
      const submitButton = screen.getByText('Submit Completion');
      fireEvent.click(submitButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText('Pieces completed is required')).toBeInTheDocument();
        expect(screen.getByText('Quality grade is required')).toBeInTheDocument();
      });

      // Should not call completion service
      expect(mockFirebaseServices.workItems.completeWorkItem).not.toHaveBeenCalled();
    });
  });

  describe('End-to-End Workflow Integration', () => {
    it('should complete full assignment workflow from creation to completion', async () => {
      // 1. Supervisor creates assignment
      const { unmount: unmountDashboard } = render(
        <WorkAssignmentDashboard userRole="supervisor" />
      );

      // Wait for work items and assign one
      await waitFor(() => {
        expect(screen.getByText('B001')).toBeInTheDocument();
      });

      const assignButton = screen.getAllByText('Assign Work')[0];
      fireEvent.click(assignButton);

      await waitFor(() => {
        expect(screen.getByText('Assign Work Item')).toBeInTheDocument();
      });

      // Complete assignment creation
      fireEvent.click(screen.getByText('John Smith'));
      fireEvent.click(screen.getByText('Assign Work'));

      await waitFor(() => {
        expect(mockWorkAssignmentService.createAssignment).toHaveBeenCalled();
      });

      unmountDashboard();

      // 2. Operator completes the work
      mockFirebaseServices.workItems.getAssignedWorkItems.mockResolvedValue({
        success: true,
        data: [{
          id: 'assignment-1',
          workItemId: 'work-1',
          bundleNumber: 'B001',
          operation: 'cutting',
          pieces: 50,
          rate: 10,
          status: 'assigned',
          operatorId: 'op-1',
        }],
      });

      render(<WorkCompletionWorkflow operatorId="op-1" />);

      await waitFor(() => {
        expect(screen.getByText('B001')).toBeInTheDocument();
      });

      // Complete the work
      const completionButton = screen.getByText('Complete Work');
      fireEvent.click(completionButton);

      await waitFor(() => {
        fireEvent.change(screen.getByLabelText('Pieces Completed'), {
          target: { value: '50' }
        });
        fireEvent.change(screen.getByLabelText('Quality Grade'), {
          target: { value: 'A' }
        });
      });

      fireEvent.click(screen.getByText('Submit Completion'));

      await waitFor(() => {
        expect(mockFirebaseServices.workItems.completeWorkItem).toHaveBeenCalled();
      });

      // Should show completion success
      expect(screen.getByText(/work completed/i)).toBeInTheDocument();
    });
  });
});