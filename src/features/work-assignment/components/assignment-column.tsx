// Assignment Column Component for Kanban Board
// Drag-and-drop column for managing assignment status

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { DraggableAssignmentCard } from './draggable-assignment-card';
import type { WorkAssignmentSummary } from '../types';
import { ASSIGNMENT_STATUS } from '../types';

interface AssignmentColumnProps {
  status: string;
  assignments: WorkAssignmentSummary[];
  onViewAssignment?: (assignmentId: string) => void;
}

export const AssignmentColumn: React.FC<AssignmentColumnProps> = ({
  status,
  assignments,
  onViewAssignment
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status
  });

  const statusConfig = ASSIGNMENT_STATUS[status as keyof typeof ASSIGNMENT_STATUS];
  
  if (!statusConfig) {
    return null;
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{statusConfig.icon}</span>
          <h3 className="font-semibold text-gray-900">{statusConfig.label}</h3>
        </div>
        <Badge variant={statusConfig.color as any} className="text-xs">
          {assignments.length}
        </Badge>
      </div>

      <div
        ref={setNodeRef}
        className={`space-y-3 min-h-[400px] transition-colors rounded-lg p-2 ${
          isOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''
        }`}
      >
        <SortableContext items={assignments.map(a => a.id)} strategy={verticalListSortingStrategy}>
          {assignments.map((assignment) => (
            <DraggableAssignmentCard
              key={assignment.id}
              assignment={assignment}
              onView={() => onViewAssignment?.(assignment.id)}
            />
          ))}
        </SortableContext>

        {assignments.length === 0 && (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            No assignments
          </div>
        )}
      </div>
    </Card>
  );
};