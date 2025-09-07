// Operator Routes Configuration
import React from 'react';
import { Navigate } from 'react-router-dom';
import { OperatorList, OperatorDetail, OperatorForm } from '@/features/operators';
import { ProtectedRoute } from '@/shared/components/protected-route';
import { ErrorBoundary } from '@/shared/components/error-boundary';

// Operator Form Wrapper Components
const CreateOperatorPage: React.FC = () => {
  const navigate = useNavigate();
  const { mutateAsync: createOperator, isPending } = useCreateOperator();

  const handleSubmit = async (data: CreateOperatorData) => {
    try {
      await createOperator(data);
      navigate('/operators');
      // Show success toast
    } catch (error) {
      // Show error toast
      console.error('Failed to create operator:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <OperatorForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={() => navigate('/operators')}
        isLoading={isPending}
      />
    </div>
  );
};

const EditOperatorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: operatorResult, isLoading } = useOperator(id!);
  const { mutateAsync: updateOperator, isPending } = useUpdateOperator();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!operatorResult?.success || !operatorResult.data) {
    return <Navigate to="/operators" />;
  }

  const handleSubmit = async (data: UpdateOperatorData) => {
    try {
      await updateOperator({ id: id!, data });
      navigate(`/operators/${id}`);
      // Show success toast
    } catch (error) {
      // Show error toast
      console.error('Failed to update operator:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <OperatorForm
        mode="edit"
        initialData={operatorResult.data}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/operators/${id}`)}
        isLoading={isPending}
      />
    </div>
  );
};

const OperatorListPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <OperatorList
        onCreateNew={() => navigate('/operators/new')}
        onViewOperator={(id) => navigate(`/operators/${id}`)}
        onEditOperator={(id) => navigate(`/operators/${id}/edit`)}
      />
    </div>
  );
};

const OperatorDetailPage: React.FC = () => {
  return (
    <div className="p-6">
      <OperatorDetail />
    </div>
  );
};

// Route Configuration
export const operatorRoutes = [
  {
    path: '/operators',
    element: (
      <ProtectedRoute requiredPermission="view_operators">
        <ErrorBoundary>
          <OperatorListPage />
        </ErrorBoundary>
      </ProtectedRoute>
    ),
    title: 'Operators'
  },
  {
    path: '/operators/new',
    element: (
      <ProtectedRoute requiredPermission="create_operator">
        <ErrorBoundary>
          <CreateOperatorPage />
        </ErrorBoundary>
      </ProtectedRoute>
    ),
    title: 'Create Operator'
  },
  {
    path: '/operators/:id',
    element: (
      <ProtectedRoute requiredPermission="view_operator_details">
        <ErrorBoundary>
          <OperatorDetailPage />
        </ErrorBoundary>
      </ProtectedRoute>
    ),
    title: 'Operator Details'
  },
  {
    path: '/operators/:id/edit',
    element: (
      <ProtectedRoute requiredPermission="edit_operator">
        <ErrorBoundary>
          <EditOperatorPage />
        </ErrorBoundary>
      </ProtectedRoute>
    ),
    title: 'Edit Operator'
  }
];