/**
 * Performance monitoring utility for tracking and optimizing application performance
 * Provides metrics collection, memory usage tracking, and performance insights
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private memorySnapshots: Array<{ timestamp: number; used: number; total: number }> = [];
  private isEnabled: boolean = process.env.NODE_ENV === 'development';

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start timing a performance metric
   */
  startTiming(label: string): () => void {
    if (!this.isEnabled) return () => {};
    
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      
      const measurements = this.metrics.get(label)!;
      measurements.push(duration);
      
      // Keep only last 100 measurements to prevent memory leaks
      if (measurements.length > 100) {
        measurements.shift();
      }
      
      // Log slow operations in development
      if (duration > 16.67) { // Slower than 60fps
        console.warn(`⚠️ Slow operation detected: ${label} took ${duration.toFixed(2)}ms`);
      }
    };
  }

  /**
   * Take a memory snapshot for monitoring memory usage
   */
  takeMemorySnapshot(): void {
    if (!this.isEnabled || !('memory' in performance)) return;
    
    const memory = (performance as any).memory;
    this.memorySnapshots.push({
      timestamp: Date.now(),
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize
    });
    
    // Keep only last 50 snapshots
    if (this.memorySnapshots.length > 50) {
      this.memorySnapshots.shift();
    }
  }

  /**
   * Get performance statistics for a given metric
   */
  getStats(label: string): { avg: number; min: number; max: number; count: number } | null {
    const measurements = this.metrics.get(label);
    if (!measurements || measurements.length === 0) return null;
    
    const avg = measurements.reduce((sum, val) => sum + val, 0) / measurements.length;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);
    
    return { avg, min, max, count: measurements.length };
  }

  /**
   * Log all performance metrics to console
   */
  logMetrics(): void {
    if (!this.isEnabled) return;
    
    console.group('🔍 Performance Metrics');
    for (const [label, measurements] of this.metrics) {
      const stats = this.getStats(label);
      if (stats) {
        console.log(`${label}: avg=${stats.avg.toFixed(2)}ms, min=${stats.min.toFixed(2)}ms, max=${stats.max.toFixed(2)}ms, samples=${stats.count}`);
      }
    }
    console.groupEnd();
  }
}