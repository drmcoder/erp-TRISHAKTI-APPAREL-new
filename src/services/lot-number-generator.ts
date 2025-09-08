// Lot Number Auto-Generation Service
// Handles sequential lot number generation for WIP entries

interface LotNumberConfig {
  prefix?: string;
  startNumber: number;
  increment: number;
  format: 'numeric' | 'prefixed' | 'year-based';
  yearPrefix?: boolean;
}

interface LotNumberRecord {
  lotNumber: string;
  createdDate: Date;
  buyerName: string;
  articleCount: number;
  status: 'active' | 'completed' | 'cancelled';
}

class LotNumberGenerator {
  private config: LotNumberConfig;
  private lotHistory: LotNumberRecord[] = [];
  private currentSequence: number;

  constructor(config?: Partial<LotNumberConfig>) {
    this.config = {
      prefix: config?.prefix || '',
      startNumber: config?.startNumber || 30,
      increment: config?.increment || 2, // For sequence like 30, 32, 34...
      format: config?.format || 'numeric',
      yearPrefix: config?.yearPrefix || false
    };
    
    this.currentSequence = this.config.startNumber;
    this.loadLotHistory();
  }

  // Load existing lot numbers from storage
  private loadLotHistory(): void {
    try {
      const stored = localStorage.getItem('tsa_lot_history');
      if (stored) {
        const data = JSON.parse(stored);
        this.lotHistory = data.lots || [];
        this.currentSequence = data.currentSequence || this.config.startNumber;
      }
    } catch (error) {
      console.warn('Failed to load lot history:', error);
      this.lotHistory = [];
    }
  }

  // Save lot history to storage
  private saveLotHistory(): void {
    try {
      const data = {
        lots: this.lotHistory,
        currentSequence: this.currentSequence,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('tsa_lot_history', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save lot history:', error);
    }
  }

  // Generate next lot number
  generateNextLotNumber(buyerName: string = '', articleCount: number = 1): string {
    let lotNumber: string;

    switch (this.config.format) {
      case 'year-based':
        const year = new Date().getFullYear().toString().slice(-2);
        lotNumber = `${year}-${this.currentSequence.toString().padStart(3, '0')}`;
        break;
      
      case 'prefixed':
        lotNumber = `${this.config.prefix}${this.currentSequence.toString().padStart(3, '0')}`;
        break;
      
      case 'numeric':
      default:
        lotNumber = this.currentSequence.toString();
        break;
    }

    // Create record
    const record: LotNumberRecord = {
      lotNumber,
      createdDate: new Date(),
      buyerName,
      articleCount,
      status: 'active'
    };

    // Add to history
    this.lotHistory.push(record);

    // Update sequence
    this.currentSequence += this.config.increment;

    // Save to storage
    this.saveLotHistory();

    console.log(`✅ Generated lot number: ${lotNumber} for ${buyerName || 'Unknown buyer'}`);
    return lotNumber;
  }

  // Get next lot number without generating
  previewNextLotNumber(): string {
    switch (this.config.format) {
      case 'year-based':
        const year = new Date().getFullYear().toString().slice(-2);
        return `${year}-${this.currentSequence.toString().padStart(3, '0')}`;
      
      case 'prefixed':
        return `${this.config.prefix}${this.currentSequence.toString().padStart(3, '0')}`;
      
      case 'numeric':
      default:
        return this.currentSequence.toString();
    }
  }

  // Get lot history
  getLotHistory(limit?: number): LotNumberRecord[] {
    const sorted = this.lotHistory.sort((a, b) => 
      new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
    );
    return limit ? sorted.slice(0, limit) : sorted;
  }

  // Get recent lot numbers
  getRecentLotNumbers(count: number = 5): string[] {
    return this.getLotHistory(count).map(record => record.lotNumber);
  }

  // Check if lot number exists
  lotNumberExists(lotNumber: string): boolean {
    return this.lotHistory.some(record => record.lotNumber === lotNumber);
  }

  // Update lot status
  updateLotStatus(lotNumber: string, status: LotNumberRecord['status']): boolean {
    const record = this.lotHistory.find(r => r.lotNumber === lotNumber);
    if (record) {
      record.status = status;
      this.saveLotHistory();
      return true;
    }
    return false;
  }

  // Get lot statistics
  getLotStatistics() {
    const total = this.lotHistory.length;
    const active = this.lotHistory.filter(r => r.status === 'active').length;
    const completed = this.lotHistory.filter(r => r.status === 'completed').length;
    const cancelled = this.lotHistory.filter(r => r.status === 'cancelled').length;

    return {
      total,
      active,
      completed,
      cancelled,
      nextLotNumber: this.previewNextLotNumber(),
      currentSequence: this.currentSequence,
      lastGenerated: this.lotHistory.length > 0 ? 
        this.lotHistory[this.lotHistory.length - 1].createdDate : null
    };
  }

  // Configure lot number generation
  updateConfig(newConfig: Partial<LotNumberConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('✅ Lot number config updated:', this.config);
  }

  // Reset sequence (admin function)
  resetSequence(newStartNumber: number): void {
    this.currentSequence = newStartNumber;
    this.saveLotHistory();
    console.log(`🔄 Lot sequence reset to ${newStartNumber}`);
  }

  // Generate custom lot number (override auto-generation)
  generateCustomLotNumber(customNumber: string, buyerName: string = '', articleCount: number = 1): string {
    if (this.lotNumberExists(customNumber)) {
      throw new Error(`Lot number ${customNumber} already exists`);
    }

    const record: LotNumberRecord = {
      lotNumber: customNumber,
      createdDate: new Date(),
      buyerName,
      articleCount,
      status: 'active'
    };

    this.lotHistory.push(record);
    this.saveLotHistory();

    console.log(`✅ Generated custom lot number: ${customNumber}`);
    return customNumber;
  }

  // Get lot suggestions based on pattern
  getSuggestions(pattern: string, limit: number = 5): string[] {
    const suggestions: string[] = [];
    
    // Try to detect pattern
    if (/^\d+$/.test(pattern)) {
      // Numeric pattern
      const base = parseInt(pattern);
      for (let i = 0; i < limit; i++) {
        const suggestion = (base + (i * this.config.increment)).toString();
        if (!this.lotNumberExists(suggestion)) {
          suggestions.push(suggestion);
        }
      }
    } else {
      // Generate based on current sequence
      suggestions.push(this.previewNextLotNumber());
    }

    return suggestions;
  }

  // Batch generate lot numbers
  batchGenerateLotNumbers(count: number, buyerName: string = ''): string[] {
    const generated: string[] = [];
    
    for (let i = 0; i < count; i++) {
      generated.push(this.generateNextLotNumber(buyerName, 1));
    }

    return generated;
  }

  // Import existing lot numbers (for migration)
  importLotNumbers(lots: Array<{ lotNumber: string; date?: string; buyer?: string }>): void {
    lots.forEach(lot => {
      if (!this.lotNumberExists(lot.lotNumber)) {
        const record: LotNumberRecord = {
          lotNumber: lot.lotNumber,
          createdDate: lot.date ? new Date(lot.date) : new Date(),
          buyerName: lot.buyer || '',
          articleCount: 1,
          status: 'active'
        };
        this.lotHistory.push(record);
      }
    });

    // Update current sequence based on highest number
    const numericLots = this.lotHistory
      .map(r => r.lotNumber)
      .filter(n => /^\d+$/.test(n))
      .map(n => parseInt(n));

    if (numericLots.length > 0) {
      const highest = Math.max(...numericLots);
      this.currentSequence = highest + this.config.increment;
    }

    this.saveLotHistory();
    console.log(`📥 Imported ${lots.length} lot numbers`);
  }

  // Export lot history
  exportLotHistory(): any {
    return {
      config: this.config,
      lots: this.lotHistory,
      statistics: this.getLotStatistics(),
      exportedAt: new Date().toISOString()
    };
  }
}

// Create singleton instance with default TSA configuration
export const lotNumberGenerator = new LotNumberGenerator({
  startNumber: 30,
  increment: 2, // Generates 30, 32, 34, 36...
  format: 'numeric'
});

// Alternative configurations for different scenarios
export const createLotGenerator = (config: Partial<LotNumberConfig>) => {
  return new LotNumberGenerator(config);
};

export default LotNumberGenerator;