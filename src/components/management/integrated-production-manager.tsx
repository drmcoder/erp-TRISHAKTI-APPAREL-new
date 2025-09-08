// Integrated Production Manager - DISABLED DUE TO TYPE MISMATCHES
// Complete workflow: WIP Entry → Template Mapping → Bundle Creation → Work Monitoring
// This component is disabled due to type compatibility issues with the current codebase

import React from 'react';
import { Card, CardHeader, CardBody } from '@/shared/components/ui';

interface IntegratedProductionManagerProps {
  userRole: 'management' | 'supervisor' | 'admin';
}

export const IntegratedProductionManager: React.FC<IntegratedProductionManagerProps> = ({
  userRole
}) => {
  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <h2 className="text-2xl font-bold text-gray-900">Integrated Production Manager</h2>
      </CardHeader>
      <CardBody>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Component Temporarily Disabled</h3>
          <p className="text-gray-600 mb-6">
            This component has been temporarily disabled due to type compatibility issues 
            with the current codebase. It will be restored after the type system is updated.
          </p>
          <p className="text-sm text-gray-500">
            User Role: <span className="font-medium">{userRole}</span>
          </p>
        </div>
      </CardBody>
    </Card>
  );
};