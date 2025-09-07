// Feature exports for operators module (following REBUILD_BLUEPRINT architecture)
export * from './components';
export * from './hooks';
export * from './services';
export * from './types';
export * from './utils';

// Feature routes configuration
export const operatorRoutes = [
  {
    path: '/operators',
    component: 'OperatorList',
    meta: {
      title: 'Operators',
      requiredPermission: 'view_operators'
    }
  },
  {
    path: '/operators/new',
    component: 'OperatorForm',
    props: { mode: 'create' },
    meta: {
      title: 'Add New Operator',
      requiredPermission: 'create_operator'
    }
  },
  {
    path: '/operators/:id',
    component: 'OperatorDetail',
    meta: {
      title: 'Operator Details',
      requiredPermission: 'view_operator_details'
    }
  },
  {
    path: '/operators/:id/edit',
    component: 'OperatorForm',
    props: { mode: 'edit' },
    meta: {
      title: 'Edit Operator',
      requiredPermission: 'edit_operator'
    }
  }
];