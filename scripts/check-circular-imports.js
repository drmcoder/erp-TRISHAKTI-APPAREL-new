#!/usr/bin/env node

/**
 * Script to detect circular import dependencies that can cause module resolution issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '../src');

function findImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const imports = [];
  
  // Match both import and require statements
  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
  
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  while ((match = requireRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  return imports;
}

function resolveImportPath(importPath, currentFile) {
  // Handle relative imports
  if (importPath.startsWith('./') || importPath.startsWith('../')) {
    const resolved = path.resolve(path.dirname(currentFile), importPath);
    // Try different extensions
    for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
      const withExt = resolved + ext;
      if (fs.existsSync(withExt)) {
        return withExt;
      }
    }
    // Try index files
    for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
      const indexFile = path.join(resolved, 'index' + ext);
      if (fs.existsSync(indexFile)) {
        return indexFile;
      }
    }
  }
  
  // Handle alias imports (@/...)
  if (importPath.startsWith('@/')) {
    const aliasPath = importPath.replace('@/', '');
    const resolved = path.join(srcDir, aliasPath);
    // Try different extensions
    for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
      const withExt = resolved + ext;
      if (fs.existsSync(withExt)) {
        return withExt;
      }
    }
  }
  
  return null;
}

function getAllFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function detectCircularImports() {
  const files = getAllFiles(srcDir);
  const dependencyGraph = new Map();
  
  // Build dependency graph
  for (const file of files) {
    try {
      const imports = findImports(file);
      const resolvedImports = [];
      
      for (const importPath of imports) {
        const resolved = resolveImportPath(importPath, file);
        if (resolved && files.includes(resolved)) {
          resolvedImports.push(resolved);
        }
      }
      
      dependencyGraph.set(file, resolvedImports);
    } catch (error) {
      console.warn(`Warning: Could not analyze ${file}: ${error.message}`);
    }
  }
  
  // Detect cycles using DFS
  const visited = new Set();
  const recursionStack = new Set();
  const cycles = [];
  
  function dfs(node, path = []) {
    if (recursionStack.has(node)) {
      // Found a cycle
      const cycleStart = path.indexOf(node);
      const cycle = path.slice(cycleStart).concat([node]);
      cycles.push(cycle);
      return;
    }
    
    if (visited.has(node)) {
      return;
    }
    
    visited.add(node);
    recursionStack.add(node);
    path.push(node);
    
    const dependencies = dependencyGraph.get(node) || [];
    for (const dep of dependencies) {
      dfs(dep, [...path]);
    }
    
    recursionStack.delete(node);
  }
  
  for (const file of files) {
    if (!visited.has(file)) {
      dfs(file);
    }
  }
  
  return cycles;
}

// Run the check
console.log('🔍 Checking for circular imports...');
const cycles = detectCircularImports();

if (cycles.length === 0) {
  console.log('✅ No circular imports detected!');
} else {
  console.log(`❌ Found ${cycles.length} circular import(s):`);
  
  cycles.forEach((cycle, index) => {
    console.log(`\n${index + 1}. Circular dependency:`);
    const relativeCycle = cycle.map(file => path.relative(srcDir, file));
    console.log('   ' + relativeCycle.join(' → '));
  });
  
  console.log('\n💡 Tip: Refactor shared code into separate modules to break cycles.');
  process.exit(1);
}