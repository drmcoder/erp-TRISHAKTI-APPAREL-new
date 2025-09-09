// Admin Dashboard for Managing Trusted Devices
// Allows admin to view and revoke trusted devices

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Input } from '@/shared/components/ui/Input';
import { 
  Shield, ShieldOff, Smartphone, Monitor, Clock, Calendar,
  Search, AlertTriangle, CheckCircle, X, Eye, Trash2, Users
} from 'lucide-react';
import { trustedDeviceService, type TrustedDevice } from '@/services/trusted-device-service';
import { cn } from '@/shared/utils';
import { toast } from 'sonner';

const TrustedDeviceManager: React.FC = () => {
  const [devices, setDevices] = useState<TrustedDevice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<'all' | 'trusted' | 'inactive'>('all');
  const [securitySummary, setSecuritySummary] = useState<any>(null);

  useEffect(() => {
    loadTrustedDevices();
    loadSecuritySummary();
  }, []);

  const loadTrustedDevices = () => {
    // Get all trusted devices from localStorage (in real app, this would be from Firebase)
    const allDevices = JSON.parse(localStorage.getItem('tsaerp_trusted_devices') || '[]');
    setDevices(allDevices);
  };

  const loadSecuritySummary = () => {
    const summary = trustedDeviceService.getSecuritySummary();
    setSecuritySummary(summary);
  };

  const getFilteredDevices = () => {
    let filtered = devices;

    // Apply status filter
    if (filterStatus === 'trusted') {
      filtered = filtered.filter(d => d.isTrusted && d.isActive);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(d => !d.isActive || !d.isTrusted);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(d => 
        d.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.operatorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.deviceId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => new Date(b.lastLoginDate).getTime() - new Date(a.lastLoginDate).getTime());
  };

  const handleRevokeTrust = async (deviceId: string, operatorId: string, operatorName: string) => {
    try {
      trustedDeviceService.revokeTrust(operatorId, deviceId);
      loadTrustedDevices();
      loadSecuritySummary();
      toast.success(`🔒 Revoked trust for ${operatorName}'s device`);
    } catch (error) {
      toast.error('Failed to revoke device trust');
    }
  };

  const handleBulkRevoke = async () => {
    if (selectedDevices.size === 0) return;

    const devicesToRevoke = devices.filter(d => selectedDevices.has(d.deviceId));
    
    for (const device of devicesToRevoke) {
      trustedDeviceService.revokeTrust(device.operatorId, device.deviceId);
    }

    loadTrustedDevices();
    loadSecuritySummary();
    setSelectedDevices(new Set());
    toast.success(`🔒 Revoked trust for ${devicesToRevoke.length} devices`);
  };

  const handleSelectDevice = (deviceId: string, checked: boolean) => {
    const newSelection = new Set(selectedDevices);
    if (checked) {
      newSelection.add(deviceId);
    } else {
      newSelection.delete(deviceId);
    }
    setSelectedDevices(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const filteredDevices = getFilteredDevices();
      setSelectedDevices(new Set(filteredDevices.map(d => d.deviceId)));
    } else {
      setSelectedDevices(new Set());
    }
  };

  const getDeviceIcon = (fingerprint: any) => {
    const userAgent = fingerprint.userAgent?.toLowerCase() || '';
    if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
      return <Smartphone className="w-4 h-4" />;
    }
    return <Monitor className="w-4 h-4" />;
  };

  const getStatusBadge = (device: TrustedDevice) => {
    if (device.isTrusted && device.isActive) {
      return <Badge className="bg-green-100 text-green-800">Trusted</Badge>;
    } else if (!device.isActive) {
      return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800">Building Trust</Badge>;
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
  };

  const getDaysSinceLastLogin = (date: Date | string) => {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    return days === 0 ? 'Today' : `${days} days ago`;
  };

  const filteredDevices = getFilteredDevices();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trusted Device Management</h1>
          <p className="text-gray-600 mt-1">
            Manage operator devices and security settings
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            leftIcon={<Eye className="w-4 h-4" />}
            onClick={() => loadTrustedDevices()}
          >
            Refresh
          </Button>
          {selectedDevices.size > 0 && (
            <Button 
              variant="danger" 
              leftIcon={<ShieldOff className="w-4 h-4" />}
              onClick={handleBulkRevoke}
            >
              Revoke Selected ({selectedDevices.size})
            </Button>
          )}
        </div>
      </div>

      {/* Security Summary Cards */}
      {securitySummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{securitySummary.trustedDevices}</p>
                  <p className="text-sm text-gray-500">Trusted Devices</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-2">
                <Monitor className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{securitySummary.totalDevices}</p>
                  <p className="text-sm text-gray-500">Total Devices</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{securitySummary.operators.length}</p>
                  <p className="text-sm text-gray-500">Active Operators</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {securitySummary.oldestTrust ? 
                      Math.floor((Date.now() - new Date(securitySummary.oldestTrust).getTime()) / (1000 * 60 * 60 * 24)) 
                      : 0} days
                  </p>
                  <p className="text-sm text-gray-500">Oldest Trust</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                leftIcon={<Search className="w-4 h-4" />}
                placeholder="Search by operator name, ID, or device..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                clearable
                onClear={() => setSearchTerm('')}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All ({devices.length})
              </Button>
              <Button
                variant={filterStatus === 'trusted' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('trusted')}
              >
                Trusted ({devices.filter(d => d.isTrusted && d.isActive).length})
              </Button>
              <Button
                variant={filterStatus === 'inactive' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('inactive')}
              >
                Inactive ({devices.filter(d => !d.isActive || !d.isTrusted).length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Device List ({filteredDevices.length})
            </CardTitle>
            
            {filteredDevices.length > 0 && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedDevices.size === filteredDevices.length && filteredDevices.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">Select All</span>
              </label>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredDevices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No devices found</p>
              <p className="text-sm">No trusted devices match your current filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDevices.map((device) => (
                <div
                  key={device.deviceId}
                  className={cn(
                    "flex items-center gap-4 p-4 border rounded-lg transition-all duration-200",
                    selectedDevices.has(device.deviceId) 
                      ? "border-blue-300 bg-blue-50" 
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  {/* Selection Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedDevices.has(device.deviceId)}
                    onChange={(e) => handleSelectDevice(device.deviceId, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  
                  {/* Device Icon */}
                  <div className="flex-shrink-0">
                    {getDeviceIcon(device.fingerprint)}
                  </div>
                  
                  {/* Device Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {device.operatorName}
                      </h3>
                      {getStatusBadge(device)}
                      {device.isTrusted && device.isActive && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-500">
                      <div>
                        <span className="font-medium">ID:</span> {device.operatorId}
                      </div>
                      <div>
                        <span className="font-medium">Logins:</span> {device.successfulLogins}/{device.loginCount}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getDaysSinceLastLogin(device.lastLoginDate)}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-400 mt-1 font-mono truncate">
                      Device: {device.deviceId} • {device.fingerprint.platform}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {device.isTrusted && device.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokeTrust(device.deviceId, device.operatorId, device.operatorName)}
                        leftIcon={<ShieldOff className="w-3 h-3" />}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Security Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant="outline"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={() => {
                if (confirm('Are you sure you want to clear ALL trusted devices? This will require all operators to build trust again.')) {
                  trustedDeviceService.clearAllTrustedDevices();
                  loadTrustedDevices();
                  loadSecuritySummary();
                  toast.success('🔒 All trusted devices cleared');
                }
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Clear All Trusted Devices
            </Button>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Security Note:</strong> Revoking device trust will require the operator to login normally 5 more times before automatic login is re-enabled.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrustedDeviceManager;