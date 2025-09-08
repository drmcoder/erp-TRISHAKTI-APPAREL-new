#!/usr/bin/env node

/**
 * Code Complexity Analysis Script
 * Analyzes TypeScript/JavaScript files for complexity metrics
 */

import { readFileSync, writeFileSync } from 'fs';
import { globSync } from 'glob';
import { resolve as _resolve } from 'path';

interface ComplexityMetrics {
  file: string;
  lines: number;
  complexity: number;
  maintainabilityIndex: number;
  duplicateLines: number;
  issues: string[];
}

interface ProjectMetrics {
  totalFiles: number;
  totalLines: number;
  averageComplexity: number;
  averageMaintainability: number;
  highComplexityFiles: ComplexityMetrics[];
  duplicatedCode: number;
  technicalDebt: number;
}

class ComplexityAnalyzer {
  private readonly complexityThreshold = 10;
  private readonly maintainabilityThreshold = 65;
  private readonly duplicateThreshold = 5;

  analyze(): ProjectMetrics {
    console.log('🔍 Analyzing code complexity...');

    const files = this.getSourceFiles();
    const metrics: ComplexityMetrics[] = [];

    let totalLines = 0;
    let totalComplexity = 0;
    let totalMaintainability = 0;
    let totalDuplicates = 0;

    for (const file of files) {
      try {
        const content = readFileSync(file, 'utf-8');
        const fileMetrics = this.analyzeFile(file, content);
        
        metrics.push(fileMetrics);
        totalLines += fileMetrics.lines;
        totalComplexity += fileMetrics.complexity;
        totalMaintainability += fileMetrics.maintainabilityIndex;
        totalDuplicates += fileMetrics.duplicateLines;

        console.log(`   ✓ ${file}: ${fileMetrics.complexity} complexity, ${fileMetrics.maintainabilityIndex.toFixed(1)} maintainability`);
      } catch (error) {
        console.error(`   ✗ Error analyzing ${file}:`, error);
      }
    }

    const averageComplexity = files.length > 0 ? totalComplexity / files.length : 0;
    const averageMaintainability = files.length > 0 ? totalMaintainability / files.length : 0;

    const projectMetrics: ProjectMetrics = {
      totalFiles: files.length,
      totalLines,
      averageComplexity,
      averageMaintainability,
      highComplexityFiles: metrics.filter(m => m.complexity > this.complexityThreshold),
      duplicatedCode: totalDuplicates,
      technicalDebt: this.calculateTechnicalDebt(metrics),
    };

    this.generateReport(projectMetrics, metrics);
    return projectMetrics;
  }

  private getSourceFiles(): string[] {
    const patterns = [
      'src/**/*.ts',
      'src/**/*.tsx',
      '!src/**/*.test.ts',
      '!src/**/*.test.tsx',
      '!src/**/*.spec.ts',
      '!src/**/*.spec.tsx',
      '!src/**/*.d.ts',
    ];

    const files: string[] = [];
    patterns.forEach(pattern => {
      const matches = globSync(pattern, { absolute: true });
      files.push(...matches);
    });

    return [...new Set(files)]; // Remove duplicates
  }

  private analyzeFile(filePath: string, content: string): ComplexityMetrics {
    const lines = content.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0).length;
    
    const complexity = this.calculateCyclomaticComplexity(content);
    const maintainabilityIndex = this.calculateMaintainabilityIndex(content, complexity, nonEmptyLines);
    const duplicateLines = this.detectDuplicateLines(content);
    const issues = this.detectIssues(content, complexity, maintainabilityIndex);

    return {
      file: filePath.replace(process.cwd(), '.'),
      lines: nonEmptyLines,
      complexity,
      maintainabilityIndex,
      duplicateLines,
      issues,
    };
  }

  private calculateCyclomaticComplexity(content: string): number {
    let complexity = 1; // Base complexity

    // Count decision points
    const patterns = [
      /\bif\s*\(/g,
      /\belse\s+if\s*\(/g,
      /\bwhile\s*\(/g,
      /\bfor\s*\(/g,
      /\bdo\s*\{/g,
      /\bswitch\s*\(/g,
      /\bcase\s+/g,
      /\bcatch\s*\(/g,
      /\b\?\s*:/g, // Ternary operator
      /\b&&\b/g,
      /\b\|\|\b/g,
    ];

    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });

    return complexity;
  }

  private calculateMaintainabilityIndex(content: string, complexity: number, lines: number): number {
    // Simplified maintainability index calculation
    // Based on Halstead metrics approximation
    const avgStmtLength = content.length / Math.max(lines, 1);
    const halsteadVolume = Math.log2(avgStmtLength) * lines;
    
    // Microsoft's maintainability index formula (simplified)
    const maintainabilityIndex = Math.max(0, 
      171 - 5.2 * Math.log(halsteadVolume) - 0.23 * complexity - 16.2 * Math.log(lines)
    );

    return Math.min(100, maintainabilityIndex);
  }

  private detectDuplicateLines(content: string): number {
    const lines = content.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 10 && !line.startsWith('//') && !line.startsWith('*'));
    
    const lineCount = new Map<string, number>();
    lines.forEach(line => {
      lineCount.set(line, (lineCount.get(line) || 0) + 1);
    });

    let duplicates = 0;
    lineCount.forEach(count => {
      if (count > 1) {
        duplicates += count - 1;
      }
    });

    return duplicates;
  }

  private detectIssues(content: string, complexity: number, maintainabilityIndex: number): string[] {
    const issues: string[] = [];

    if (complexity > this.complexityThreshold) {
      issues.push(`High cyclomatic complexity (${complexity})`);
    }

    if (maintainabilityIndex < this.maintainabilityThreshold) {
      issues.push(`Low maintainability index (${maintainabilityIndex.toFixed(1)})`);
    }

    // Detect long functions
    const functionMatches = content.match(/function\s+\w+\s*\([^)]*\)\s*\{[\s\S]*?\n\}/g);
    if (functionMatches) {
      functionMatches.forEach(func => {
        const funcLines = func.split('\n').length;
        if (funcLines > 50) {
          issues.push(`Long function detected (${funcLines} lines)`);
        }
      });
    }

    // Detect deeply nested code
    const maxNesting = this.getMaxNestingLevel(content);
    if (maxNesting > 4) {
      issues.push(`Deep nesting detected (${maxNesting} levels)`);
    }

    // Detect TODO/FIXME comments
    if (content.match(/\/\/\s*(TODO|FIXME|HACK|XXX)/i)) {
      issues.push('Contains TODO/FIXME comments');
    }

    return issues;
  }

  private getMaxNestingLevel(content: string): number {
    let maxLevel = 0;
    let currentLevel = 0;

    for (const char of content) {
      if (char === '{') {
        currentLevel++;
        maxLevel = Math.max(maxLevel, currentLevel);
      } else if (char === '}') {
        currentLevel--;
      }
    }

    return maxLevel;
  }

  private calculateTechnicalDebt(metrics: ComplexityMetrics[]): number {
    // Simplified technical debt calculation in hours
    let debt = 0;

    metrics.forEach(metric => {
      // High complexity penalty
      if (metric.complexity > this.complexityThreshold) {
        debt += (metric.complexity - this.complexityThreshold) * 0.5;
      }

      // Low maintainability penalty
      if (metric.maintainabilityIndex < this.maintainabilityThreshold) {
        debt += (this.maintainabilityThreshold - metric.maintainabilityIndex) * 0.1;
      }

      // Duplicate code penalty
      debt += metric.duplicateLines * 0.05;
    });

    return Math.round(debt * 10) / 10;
  }

  private generateReport(projectMetrics: ProjectMetrics, fileMetrics: ComplexityMetrics[]): void {
    console.log('\n📊 Code Complexity Report');
    console.log('========================');
    console.log(`Total Files: ${projectMetrics.totalFiles}`);
    console.log(`Total Lines: ${projectMetrics.totalLines}`);
    console.log(`Average Complexity: ${projectMetrics.averageComplexity.toFixed(1)}`);
    console.log(`Average Maintainability: ${projectMetrics.averageMaintainability.toFixed(1)}`);
    console.log(`Technical Debt: ${projectMetrics.technicalDebt} hours`);

    if (projectMetrics.highComplexityFiles.length > 0) {
      console.log('\n⚠️  High Complexity Files:');
      projectMetrics.highComplexityFiles
        .sort((a, b) => b.complexity - a.complexity)
        .slice(0, 10)
        .forEach(file => {
          console.log(`   ${file.file}: complexity ${file.complexity}, maintainability ${file.maintainabilityIndex.toFixed(1)}`);
        });
    }

    // Generate detailed JSON report
    const report = {
      summary: projectMetrics,
      files: fileMetrics,
      timestamp: new Date().toISOString(),
    };

    writeFileSync('complexity-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to complexity-report.json');

    // Generate GitHub Actions summary if running in CI
    if (process.env.GITHUB_ACTIONS) {
      this.generateGitHubSummary(projectMetrics, fileMetrics);
    }
  }

  private generateGitHubSummary(projectMetrics: ProjectMetrics, _fileMetrics: ComplexityMetrics[]): void {
    let summary = '## Code Complexity Analysis\n\n';
    
    summary += '### Overview\n';
    summary += `- **Total Files**: ${projectMetrics.totalFiles}\n`;
    summary += `- **Total Lines**: ${projectMetrics.totalLines}\n`;
    summary += `- **Average Complexity**: ${projectMetrics.averageComplexity.toFixed(1)}\n`;
    summary += `- **Average Maintainability**: ${projectMetrics.averageMaintainability.toFixed(1)}\n`;
    summary += `- **Technical Debt**: ${projectMetrics.technicalDebt} hours\n\n`;

    if (projectMetrics.highComplexityFiles.length > 0) {
      summary += '### High Complexity Files\n';
      summary += '| File | Complexity | Maintainability | Issues |\n';
      summary += '|------|------------|-----------------|--------|\n';
      
      projectMetrics.highComplexityFiles
        .sort((a, b) => b.complexity - a.complexity)
        .slice(0, 10)
        .forEach(file => {
          const issues = file.issues.length > 0 ? file.issues.join(', ') : 'None';
          summary += `| ${file.file} | ${file.complexity} | ${file.maintainabilityIndex.toFixed(1)} | ${issues} |\n`;
        });
    }

    // Write to GitHub Actions summary
    if (process.env.GITHUB_STEP_SUMMARY) {
      writeFileSync(process.env.GITHUB_STEP_SUMMARY, summary, { flag: 'a' });
    }
  }
}

// Run analysis if called directly
if (require.main === module) {
  const analyzer = new ComplexityAnalyzer();
  try {
    analyzer.analyze();
    console.log('\n✅ Code complexity analysis completed successfully!');
  } catch (error) {
    console.error('❌ Code complexity analysis failed:', error);
    process.exit(1);
  }
}