import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import OptimizedConfiguratorBuilder from './pages/OptimizedConfiguratorBuilder';
import { ErrorBoundary } from './utils/ErrorBoundary';
import { logger } from './utils/Logger';

/**
 * Main Application Component with Enhanced Error Handling and Performance Monitoring
 * 
 * Key Optimizations:
 * - Wrapped in ErrorBoundary for graceful error handling
 * - Centralized logging for debugging and monitoring
 * - Optimized routing structure
 * - Performance-focused component architecture
 */
function App() {
  // Log application startup
  React.useEffect(() => {
    logger.info('🚀 3D Configurator Application Started', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    });

    // Log performance metrics on page load
    if ('performance' in window) {
      window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        logger.info('📊 Page Load Performance', {
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
          totalTime: perfData.loadEventEnd - perfData.fetchStart
        });
      });
    }

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logger.error('🚨 Unhandled Promise Rejection', {
        reason: event.reason,
        stack: event.reason?.stack
      });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        logger.error('🚨 Application Error Boundary Triggered', {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack
        });
      }}
    >
      <DndProvider backend={HTML5Backend}>
        <Router>
          <div className="min-h-screen bg-gray-900">
            <Routes>
              <Route path="/" element={<OptimizedConfiguratorBuilder />} />
              <Route path="/configurator/:id?" element={<OptimizedConfiguratorBuilder />} />
            </Routes>
          </div>
        </Router>
      </DndProvider>
    </ErrorBoundary>
  );
}

export default App;