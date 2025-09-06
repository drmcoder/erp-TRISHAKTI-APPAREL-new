// Feature exports for operators module (following REBUILD_BLUEPRINT architecture)
export * from './components';
export * from './hooks';
export * from './services';
export * from './types';
export * from './utils';

// Feature routes
import { OperatorList } from './components/operator-list';
import { OperatorDetail } from './components/operator-detail';
import { OperatorForm } from './components/operator-form';

export const operatorRoutes = [
  {
    path: '/operators',
    element: <OperatorList />,
    meta: {
      title: 'Operators',
      requiredPermission: 'view_operators'
    }
  },
  {
    path: '/operators/new',
    element: <OperatorForm mode="create" />,
    meta: {
      title: 'Add New Operator',
      requiredPermission: 'create_operator'
    }
  },
  {
    path: '/operators/:id',
    element: <OperatorDetail />,
    meta: {
      title: 'Operator Details',
      requiredPermission: 'view_operator_details'
    }
  },
  {
    path: '/operators/:id/edit',
    element: <OperatorForm mode="edit" />,
    meta: {
      title: 'Edit Operator',
      requiredPermission: 'edit_operator'
    }
  }
];