import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { 
  ChartBarIcon, 
  ClockIcon, 
  CurrencyRupeeIcon,
  UserGroupIcon,
  CogIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PlayCircleIcon
} from '@heroicons/react/24/outline';
import type { SewingTemplate } from '@/shared/types/sewing-template-types';

interface TemplateInfographicsProps {
  template: SewingTemplate;
  onClose?: () => void;
}

export const TemplateInfographics: React.FC<TemplateInfographicsProps> = ({
  template,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'flow' | 'analysis' | 'resources' | 'quality'>('flow');

  const getComplexityColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'expert': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSkillIcon = (level: string) => {
    switch (level) {
      case 'beginner': return '🌱';
      case 'intermediate': return '⚡';
      case 'expert': return '🏆';
      default: return '👤';
    }
  };

  const processFlowView = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Process Flow Diagram</h3>
        <p className="text-gray-600">Sequential operations for {template.templateName}</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {template.operations.map((operation, index) => (
          <div key={operation.id} className="relative">
            {/* Operation Card */}
            <Card className="p-4 bg-white border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Step Number */}
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  
                  {/* Operation Details */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{operation.operationName}</h4>
                    <p className="text-sm text-gray-600 mb-2">{operation.description}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-blue-600">
                        <ClockIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{operation.smv}m</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-600">
                        <CurrencyRupeeIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">₹{operation.ratePerPiece}</span>
                      </div>
                      <Badge className={`${getComplexityColor(operation.skillLevel)} text-white text-xs`}>
                        {getSkillIcon(operation.skillLevel)} {operation.skillLevel}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Machine Type */}
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-purple-600">
                      <CogIcon className="w-5 h-5" />
                      <span className="text-sm font-medium">{operation.machineType}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Arrow to Next Operation */}
            {index < template.operations.length - 1 && (
              <div className="flex justify-center my-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <ArrowRightIcon className="w-5 h-5 text-gray-500 rotate-90" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{template.operations.length}</div>
            <div className="text-sm text-gray-600">Total Operations</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{template.totalSmv}m</div>
            <div className="text-sm text-gray-600">Total SMV</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">₹{template.totalPricePerPiece.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Cost per Piece</div>
          </div>
        </div>
      </Card>
    </div>
  );

  const analysisView = () => {
    const smvData = template.operations.map(op => ({
      name: op.operationName,
      smv: op.smv,
      cost: op.ratePerPiece
    }));

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">SMV & Cost Analysis</h3>
          <p className="text-gray-600">Time and cost distribution across operations</p>
        </div>

        {/* SMV Breakdown Chart */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5" />
            SMV Distribution
          </h4>
          <div className="space-y-3">
            {smvData.map((item, index) => {
              const percentage = ((item.smv / template.totalSmv) * 100).toFixed(1);
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium text-gray-700 truncate">
                    {item.name}
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-16 text-sm font-semibold text-right">
                    {item.smv}m
                  </div>
                  <div className="w-16 text-sm text-gray-500 text-right">
                    {percentage}%
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Cost Breakdown */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CurrencyRupeeIcon className="w-5 h-5" />
            Cost Breakdown
          </h4>
          <div className="space-y-3">
            {smvData.map((item, index) => {
              const percentage = ((item.cost / template.totalPricePerPiece) * 100).toFixed(1);
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium text-gray-700 truncate">
                    {item.name}
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-16 text-sm font-semibold text-right">
                    ₹{item.cost}
                  </div>
                  <div className="w-16 text-sm text-gray-500 text-right">
                    {percentage}%
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Efficiency Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center bg-blue-50">
            <div className="text-xl font-bold text-blue-600">
              {(template.totalPricePerPiece / template.totalSmv).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Cost per SMV Minute</div>
          </Card>
          <Card className="p-4 text-center bg-green-50">
            <div className="text-xl font-bold text-green-600">
              {((template.totalSmv / template.operations.length)).toFixed(1)}m
            </div>
            <div className="text-sm text-gray-600">Avg SMV per Operation</div>
          </Card>
        </div>
      </div>
    );
  };

  const resourcesView = () => {
    const machineTypes = [...new Set(template.operations.map(op => op.machineType))];
    const skillLevels = template.operations.reduce((acc, op) => {
      acc[op.skillLevel] = (acc[op.skillLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Resource Requirements</h3>
          <p className="text-gray-600">Machines and skills needed for production</p>
        </div>

        {/* Machine Requirements */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CogIcon className="w-5 h-5" />
            Machine Types Required
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {machineTypes.map((machine, index) => {
              const count = template.operations.filter(op => op.machineType === machine).length;
              return (
                <div key={index} className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl mb-2">🏭</div>
                  <div className="font-semibold text-gray-900">{machine}</div>
                  <div className="text-sm text-purple-600">{count} operations</div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Skill Level Distribution */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <UserGroupIcon className="w-5 h-5" />
            Skill Level Distribution
          </h4>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(skillLevels).map(([skill, count]) => (
              <div key={skill} className="text-center p-4 rounded-lg bg-gray-50">
                <div className="text-3xl mb-2">{getSkillIcon(skill)}</div>
                <div className="font-semibold text-gray-900 capitalize">{skill}</div>
                <div className="text-sm text-gray-600">{count} operations</div>
                <div className={`w-full h-2 rounded-full mt-2 ${getComplexityColor(skill)}`}></div>
              </div>
            ))}
          </div>
        </Card>

        {/* Production Planning */}
        <Card className="p-6 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200">
          <h4 className="text-lg font-semibold mb-4">Production Planning Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Bottleneck Analysis</h5>
              <div className="text-sm text-gray-600">
                Longest operation: <span className="font-semibold">
                  {template.operations.reduce((max, op) => op.smv > max.smv ? op : max, template.operations[0])?.operationName}
                </span>
              </div>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Resource Optimization</h5>
              <div className="text-sm text-gray-600">
                Most used machine: <span className="font-semibold">
                  {machineTypes.reduce((max, machine) => 
                    template.operations.filter(op => op.machineType === machine).length > 
                    template.operations.filter(op => op.machineType === max).length ? machine : max
                  )}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const qualityView = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Quality Control Points</h3>
        <p className="text-gray-600">Critical inspection stages and quality metrics</p>
      </div>

      {/* Quality Checkpoints */}
      <div className="space-y-4">
        {template.operations.map((operation, index) => {
          const isCritical = operation.skillLevel === 'expert' || operation.smv > template.totalSmv / template.operations.length;
          const isHighCost = operation.ratePerPiece > template.totalPricePerPiece / template.operations.length;
          
          return (
            <Card key={operation.id} className={`p-4 ${isCritical ? 'border-l-4 border-l-red-500 bg-red-50' : isHighCost ? 'border-l-4 border-l-yellow-500 bg-yellow-50' : 'border-l-4 border-l-green-500 bg-green-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${isCritical ? 'bg-red-500' : isHighCost ? 'bg-yellow-500' : 'bg-green-500'}`}>
                    {isCritical ? <ExclamationTriangleIcon className="w-5 h-5" /> : 
                     isHighCost ? <EyeIcon className="w-5 h-5" /> : 
                     <CheckCircleIcon className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{operation.operationName}</h4>
                    <p className="text-sm text-gray-600">
                      {isCritical ? 'Critical Quality Point - Requires Expert Supervision' :
                       isHighCost ? 'High-Value Operation - Regular Monitoring' :
                       'Standard Quality Check - Visual Inspection'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">Risk Level</div>
                  <Badge className={`${isCritical ? 'bg-red-100 text-red-800' : isHighCost ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {isCritical ? 'High' : isHighCost ? 'Medium' : 'Low'}
                  </Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quality Metrics Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center bg-red-50">
          <div className="text-xl font-bold text-red-600">
            {template.operations.filter(op => op.skillLevel === 'expert').length}
          </div>
          <div className="text-sm text-gray-600">Critical Points</div>
        </Card>
        <Card className="p-4 text-center bg-yellow-50">
          <div className="text-xl font-bold text-yellow-600">
            {template.operations.filter(op => op.ratePerPiece > template.totalPricePerPiece / template.operations.length).length}
          </div>
          <div className="text-sm text-gray-600">Monitor Points</div>
        </Card>
        <Card className="p-4 text-center bg-green-50">
          <div className="text-xl font-bold text-green-600">
            {template.operations.filter(op => op.skillLevel === 'beginner').length}
          </div>
          <div className="text-sm text-gray-600">Standard Points</div>
        </Card>
      </div>
    </div>
  );

  const tabs = [
    { id: 'flow', label: 'Process Flow', icon: PlayCircleIcon },
    { id: 'analysis', label: 'Analysis', icon: ChartBarIcon },
    { id: 'resources', label: 'Resources', icon: CogIcon },
    { id: 'quality', label: 'Quality', icon: CheckCircleIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">📊 Template Analytics Dashboard</h2>
              <p className="text-blue-100">
                <span className="font-semibold">{template.templateName}</span> • 
                <span className="ml-2">Code: {template.templateCode}</span> • 
                <span className="ml-2">Category: {template.category}</span>
              </p>
            </div>
            {onClose && (
              <Button 
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 text-white"
              >
                Close
              </Button>
            )}
          </div>
        </Card>

        {/* Navigation Tabs */}
        <Card className="p-4 mb-6">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'flow' && processFlowView()}
          {activeTab === 'analysis' && analysisView()}
          {activeTab === 'resources' && resourcesView()}
          {activeTab === 'quality' && qualityView()}
        </div>
      </div>
    </div>
  );
};