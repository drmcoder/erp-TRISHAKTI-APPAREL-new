// WIP Entry History and Edit Management System
import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { formatFirebaseValue, formatCurrency, getDataHelperMessage } from '@/shared/utils/firebase-data-display';

interface WipEntry {
  id: string;
  bundleNumber: string;
  articleNumber?: string;
  articleStyle?: string;
  targetPieces?: number;
  quantity?: number;
  priority?: string;
  status?: string;
  createdAt: any;
  operations?: any[];
  createdBy?: string;
  editHistory?: EditHistoryEntry[];
}

interface EditHistoryEntry {
  id: string;
  editedAt: any;
  editedBy: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  reason?: string;
}

interface WipEntryManagerProps {
  userRole: string;
}

export const WipEntryManager: React.FC<WipEntryManagerProps> = ({ userRole }) => {
  const [wipEntries, setWipEntries] = useState<WipEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<WipEntry | null>(null);
  const [viewingHistory, setViewingHistory] = useState<WipEntry | null>(null);

  useEffect(() => {
    loadWipEntries();
  }, []);

  const loadWipEntries = async () => {
    setLoading(true);
    try {
      const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
      const { db } = await import('@/config/firebase');
      
      // Load WIP entries from production_bundles collection
      const bundlesRef = collection(db, 'production_bundles');
      const bundlesQuery = query(bundlesRef, orderBy('createdAt', 'desc'));
      const bundlesSnapshot = await getDocs(bundlesQuery);
      
      if (!bundlesSnapshot.empty) {
        const entries: WipEntry[] = bundlesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            bundleNumber: data.bundleNumber || `BND-${doc.id.slice(-8)}`,
            articleNumber: data.articleNumber || data.articleId,
            articleStyle: data.articleStyle || data.style,
            targetPieces: data.targetPieces || data.quantity,
            quantity: data.quantity || data.targetPieces,
            priority: data.priority,
            status: data.status,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            operations: data.operations || [],
            createdBy: data.createdBy,
            editHistory: data.editHistory || []
          };
        });
        
        setWipEntries(entries);
      } else {
        setWipEntries([]);
      }
    } catch (error) {
      console.error('Error loading WIP entries:', error);
      setWipEntries([]);
    }
    setLoading(false);
  };

  const handleEditEntry = async (entry: WipEntry, updates: Partial<WipEntry>, reason: string) => {
    try {
      const { doc, updateDoc, arrayUnion, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('@/config/firebase');
      
      // Track changes for history
      const changes = Object.entries(updates).map(([field, newValue]) => ({
        field,
        oldValue: (entry as any)[field],
        newValue
      }));

      // Create edit history entry
      const historyEntry: EditHistoryEntry = {
        id: `edit_${Date.now()}`,
        editedAt: new Date(),
        editedBy: getUserName(userRole),
        changes,
        reason
      };

      // Update the document
      const entryRef = doc(db, 'production_bundles', entry.id);
      await updateDoc(entryRef, {
        ...updates,
        editHistory: arrayUnion(historyEntry),
        lastModified: serverTimestamp(),
        lastModifiedBy: getUserName(userRole)
      });

      // Refresh data
      await loadWipEntries();
      setEditingEntry(null);
      
      alert(`✅ WIP Entry ${entry.bundleNumber} updated successfully!`);
    } catch (error) {
      console.error('Error updating WIP entry:', error);
      alert('❌ Failed to update WIP entry. Please try again.');
    }
  };

  const getUserName = (role: string) => {
    switch (role) {
      case 'operator': return 'Maya Patel';
      case 'supervisor': return 'John Smith';
      case 'admin': return 'Admin User';
      default: return 'Unknown User';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
        <p className="ml-3">Loading WIP entries...</p>
      </div>
    );
  }

  if (viewingHistory) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">📚 Edit History - {viewingHistory.bundleNumber}</h1>
          <button
            onClick={() => setViewingHistory(null)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            ← Back to WIP Entries
          </button>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Bundle Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Bundle:</span>
              <p className="font-medium">{viewingHistory.bundleNumber}</p>
            </div>
            <div>
              <span className="text-gray-500">Article:</span>
              <p className="font-medium">{formatFirebaseValue(viewingHistory.articleNumber)}</p>
            </div>
            <div>
              <span className="text-gray-500">Style:</span>
              <p className="font-medium">{formatFirebaseValue(viewingHistory.articleStyle)}</p>
            </div>
            <div>
              <span className="text-gray-500">Pieces:</span>
              <p className="font-medium">{formatFirebaseValue(viewingHistory.targetPieces)}</p>
            </div>
          </div>
        </Card>

        {viewingHistory.editHistory && viewingHistory.editHistory.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">📝 Edit History ({viewingHistory.editHistory.length} edits)</h3>
            {viewingHistory.editHistory.map((edit, index) => (
              <Card key={edit.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium">{edit.editedBy}</p>
                    <p className="text-sm text-gray-500">
                      {edit.editedAt instanceof Date ? edit.editedAt.toLocaleString() : new Date().toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline">Edit #{viewingHistory.editHistory!.length - index}</Badge>
                </div>
                
                {edit.reason && (
                  <div className="mb-3 p-2 bg-blue-50 rounded">
                    <p className="text-sm text-blue-800"><strong>Reason:</strong> {edit.reason}</p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Changes made:</h4>
                  {edit.changes.map((change, changeIndex) => (
                    <div key={changeIndex} className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600 capitalize">{change.field}:</span>
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                        {formatFirebaseValue(change.oldValue, { fallbackValue: 'Empty' })}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        {formatFirebaseValue(change.newValue, { fallbackValue: 'Empty' })}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <h3 className="text-lg font-medium mb-2">No Edit History</h3>
            <p className="text-gray-600">This WIP entry has not been modified since creation.</p>
          </Card>
        )}
      </div>
    );
  }

  if (editingEntry) {
    return (
      <EditWipEntryForm 
        entry={editingEntry}
        onSave={handleEditEntry}
        onCancel={() => setEditingEntry(null)}
        userRole={userRole}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📝 WIP Entry Management</h1>
        <div className="flex items-center gap-3">
          <Badge variant="outline">{wipEntries.length} entries found</Badge>
          <button
            onClick={loadWipEntries}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {wipEntries.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No WIP Entries Found</h3>
          <p className="text-gray-600 mb-4">
            {getDataHelperMessage('bundles', false)}
          </p>
          <p className="text-sm text-blue-600">
            💡 Create WIP entries using the <strong>WIP Entry</strong> form, then manage them here!
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {wipEntries.map((entry) => (
            <Card key={entry.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{entry.bundleNumber}</h3>
                  <p className="text-gray-600">
                    {formatFirebaseValue(entry.articleStyle, { fallbackValue: 'Article' })} - {formatFirebaseValue(entry.targetPieces)} pieces
                  </p>
                  <p className="text-sm text-gray-500">
                    Created by {formatFirebaseValue(entry.createdBy)} on {entry.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={
                      entry.status === 'completed' ? 'bg-green-50 text-green-700' :
                      entry.status === 'in_progress' ? 'bg-blue-50 text-blue-700' :
                      'bg-gray-50 text-gray-700'
                    }
                  >
                    {formatFirebaseValue(entry.status, { fallbackValue: 'created' })}
                  </Badge>
                  {entry.editHistory && entry.editHistory.length > 0 && (
                    <Badge variant="outline" className="bg-orange-50 text-orange-700">
                      {entry.editHistory.length} edits
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-500">Article:</span>
                  <p className="font-medium">{formatFirebaseValue(entry.articleNumber)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Priority:</span>
                  <p className="font-medium">{formatFirebaseValue(entry.priority, { fallbackValue: 'normal' })}</p>
                </div>
                <div>
                  <span className="text-gray-500">Operations:</span>
                  <p className="font-medium">{entry.operations?.length || 0}</p>
                </div>
                <div>
                  <span className="text-gray-500">Last Modified:</span>
                  <p className="font-medium">{entry.createdAt.toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditingEntry(entry)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => setViewingHistory(entry)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium"
                >
                  📚 View History
                </button>
                {entry.operations && entry.operations.length > 0 && (
                  <span className="text-sm text-gray-500">
                    {entry.operations.length} operations configured
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Edit Form Component
const EditWipEntryForm: React.FC<{
  entry: WipEntry;
  onSave: (entry: WipEntry, updates: Partial<WipEntry>, reason: string) => void;
  onCancel: () => void;
  userRole: string;
}> = ({ entry, onSave, onCancel, userRole }) => {
  const [formData, setFormData] = useState({
    bundleNumber: entry.bundleNumber,
    articleNumber: entry.articleNumber || '',
    articleStyle: entry.articleStyle || '',
    targetPieces: entry.targetPieces || 0,
    priority: entry.priority || 'normal',
    status: entry.status || 'created'
  });
  const [editReason, setEditReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editReason.trim()) {
      alert('Please provide a reason for editing this WIP entry.');
      return;
    }

    // Calculate what changed
    const updates: Partial<WipEntry> = {};
    if (formData.bundleNumber !== entry.bundleNumber) updates.bundleNumber = formData.bundleNumber;
    if (formData.articleNumber !== entry.articleNumber) updates.articleNumber = formData.articleNumber;
    if (formData.articleStyle !== entry.articleStyle) updates.articleStyle = formData.articleStyle;
    if (formData.targetPieces !== entry.targetPieces) updates.targetPieces = formData.targetPieces;
    if (formData.priority !== entry.priority) updates.priority = formData.priority;
    if (formData.status !== entry.status) updates.status = formData.status;

    if (Object.keys(updates).length === 0) {
      alert('No changes detected.');
      return;
    }

    onSave(entry, updates, editReason);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">✏️ Edit WIP Entry</h1>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          ← Cancel
        </button>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bundle Number</label>
              <input
                type="text"
                value={formData.bundleNumber}
                onChange={(e) => setFormData({ ...formData, bundleNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Article Number</label>
              <input
                type="text"
                value={formData.articleNumber}
                onChange={(e) => setFormData({ ...formData, articleNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Article Style</label>
              <input
                type="text"
                value={formData.articleStyle}
                onChange={(e) => setFormData({ ...formData, articleStyle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Pieces</label>
              <input
                type="number"
                value={formData.targetPieces}
                onChange={(e) => setFormData({ ...formData, targetPieces: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="created">Created</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Edit <span className="text-red-500">*</span>
            </label>
            <textarea
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              placeholder="Please explain why you are editing this WIP entry..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              💾 Save Changes
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default WipEntryManager;