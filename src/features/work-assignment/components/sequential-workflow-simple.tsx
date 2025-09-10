// Simple Sequential Workflow - Shows real Firebase WIP Entry data
import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { formatFirebaseValue } from '@/shared/utils/firebase-data-display';

interface SimpleWorkflowProps {
  userRole: string;
}

export const SimpleSequentialWorkflow: React.FC<SimpleWorkflowProps> = ({ userRole }) => {
  const [bundles, setBundles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRealBundleData();
  }, []);

  const loadRealBundleData = async () => {
    setLoading(true);
    try {
      const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
      const { db } = await import('@/config/firebase');
      
      const bundlesRef = collection(db, 'production_bundles');
      const bundlesQuery = query(bundlesRef, orderBy('createdAt', 'desc'));
      const bundlesSnapshot = await getDocs(bundlesQuery);
      
      if (!bundlesSnapshot.empty) {
        const realBundles = bundlesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          bundleNumber: doc.data().bundleNumber || `BND-${doc.id.slice(-8)}`,
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }));
        setBundles(realBundles);
      } else {
        setBundles([]);
      }
    } catch (error) {
      console.error('Error loading bundles:', error);
      setBundles([]);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
        <p className="ml-3">Loading your WIP Entry data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🔄 Your WIP Entries</h1>
        <Badge variant="outline">{bundles.length} bundles found</Badge>
      </div>

      {bundles.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No WIP Entry Data Found</h3>
          <p className="text-gray-600 mb-4">
            You haven't created any production bundles via WIP Entry yet.
          </p>
          <p className="text-sm text-blue-600">
            💡 Go to <strong>WIP Entry</strong> to create your first production bundle, then it will appear here!
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bundles.map((bundle) => (
            <Card key={bundle.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{bundle.bundleNumber}</h3>
                  <p className="text-gray-600">
                    {bundle.articleStyle || bundle.style || 'Article'} - {bundle.targetPieces || bundle.quantity || 0} pieces
                  </p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  From WIP Entry
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Article:</span>
                  <p className="font-medium">{formatFirebaseValue(bundle.articleNumber || bundle.articleId)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Priority:</span>
                  <p className="font-medium">{formatFirebaseValue(bundle.priority, { fallbackValue: 'normal' })}</p>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>
                  <p className="font-medium">{bundle.createdAt ? bundle.createdAt.toLocaleDateString() : formatFirebaseValue(null)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <p className="font-medium">{formatFirebaseValue(bundle.status, { fallbackValue: 'created' })}</p>
                </div>
              </div>

              {bundle.operations && bundle.operations.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Operations ({bundle.operations.length}):</h4>
                  <div className="grid gap-2">
                    {bundle.operations.slice(0, 3).map((op: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{formatFirebaseValue(op.name || op.operationName, { fallbackValue: `Operation ${index + 1}` })}</span>
                        <Badge variant="outline" size="sm">
                          {formatFirebaseValue(op.status, { fallbackValue: 'pending' })}
                        </Badge>
                      </div>
                    ))}
                    {bundle.operations.length > 3 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{bundle.operations.length - 3} more operations
                      </p>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleSequentialWorkflow;