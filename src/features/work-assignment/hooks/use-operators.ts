import { useQuery } from '@tanstack/react-query';

export interface Operator {
  id: string;
  name: string;
  employeeId: string;
  skills: string[];
  efficiency: number;
  activeAssignments: number;
  maxAssignments: number;
}

export function useOperators() {
  return useQuery({
    queryKey: ['operators'],
    queryFn: async () => {
      // Mock data - in real implementation, this would call the API
      const mockOperators: Operator[] = [
        {
          id: '1',
          name: 'John Smith',
          employeeId: 'EMP001',
          skills: ['cutting', 'sewing'],
          efficiency: 0.85,
          activeAssignments: 3,
          maxAssignments: 5
        },
        {
          id: '2',
          name: 'Mary Johnson',
          employeeId: 'EMP002',
          skills: ['finishing', 'quality-check'],
          efficiency: 0.92,
          activeAssignments: 2,
          maxAssignments: 4
        }
      ];
      
      return { success: true, data: mockOperators };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}