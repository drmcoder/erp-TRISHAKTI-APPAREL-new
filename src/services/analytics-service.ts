// Mock analytics service
export const analyticsService = {
  getProductionMetrics: async (filters?: any) => {
    return {
      success: true,
      data: {
        totalProduction: 0,
        efficiency: 0,
        qualityRate: 0,
        onTimeDelivery: 0
      }
    };
  },

  getProductionTrends: async (period?: string) => {
    return {
      success: true,
      data: {
        trend: 'upward',
        data: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          production: Math.floor(Math.random() * 100) + 50,
          efficiency: Math.floor(Math.random() * 30) + 70,
          quality: Math.floor(Math.random() * 20) + 80
        }))
      }
    };
  },

  getOperatorPerformance: async (operatorId?: string) => {
    return {
      success: true,
      data: []
    };
  },

  getWorkTypeAnalysis: async (period?: string) => {
    return {
      success: true,
      data: [
        { type: 'Cutting', count: 25, efficiency: 85, avgTime: 120 },
        { type: 'Sewing', count: 40, efficiency: 78, avgTime: 180 },
        { type: 'Finishing', count: 30, efficiency: 92, avgTime: 90 },
        { type: 'Quality Check', count: 15, efficiency: 95, avgTime: 60 }
      ]
    };
  },

  getBundleAnalytics: async (bundleId: string) => {
    return {
      success: true,
      data: {
        completionRate: 0,
        efficiency: 0,
        timeSpent: 0
      }
    };
  },

  getQualityMetrics: async () => {
    return {
      success: true,
      data: {
        defectRate: 0,
        reworkRate: 0,
        qualityScore: 0
      }
    };
  },

  generateReport: async (type: string, filters?: any) => {
    return {
      success: true,
      data: {
        reportId: 'report-123',
        type,
        generatedAt: new Date(),
        downloadUrl: '/api/reports/report-123.pdf'
      }
    };
  }
};