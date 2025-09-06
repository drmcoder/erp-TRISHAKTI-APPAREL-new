import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home, Bug, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { errorReportingService } from '@/services/error-reporting-service';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  isolate?: boolean; // If true, only catches errors from direct children
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
  eventId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = this.generateErrorId();
    
    this.setState({
      error,
      errorInfo,
      errorId,
    });

    // Report error to monitoring service
    this.reportError(error, errorInfo, errorId);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async reportError(error: Error, errorInfo: ErrorInfo, errorId: string) {
    try {
      const eventId = await errorReportingService.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
            errorBoundary: true,
            errorId,
            retryCount: this.retryCount,
          }
        },
        tags: {
          component: 'ErrorBoundary',
          source: 'react-error-boundary',
        },
        level: 'error',
        fingerprint: [error.name, error.message],
      });

      this.setState({ eventId });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    } else {
      // Force page reload after max retries
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  private handleReportBug = () => {
    const { error, errorInfo, errorId } = this.state;
    const bugReport = {
      errorId,
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    const subject = encodeURIComponent(`Bug Report: ${error?.name || 'Application Error'}`);
    const body = encodeURIComponent(`
Error ID: ${errorId}
URL: ${window.location.href}
Time: ${new Date().toLocaleString()}

Error Details:
${JSON.stringify(bugReport, null, 2)}

Please describe what you were doing when this error occurred:
[Your description here]
    `);

    window.open(`mailto:support@tsa-erp.com?subject=${subject}&body=${body}`);
  };

  private renderErrorDetails() {
    const { error, errorInfo, errorId } = this.state;

    if (!this.props.showDetails) return null;

    return (
      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
          Technical Details
        </summary>
        <div className="mt-2 p-4 bg-muted rounded-lg text-xs font-mono">
          <div className="mb-2">
            <strong>Error ID:</strong> {errorId}
          </div>
          <div className="mb-2">
            <strong>Error:</strong> {error?.name}: {error?.message}
          </div>
          <div className="mb-2">
            <strong>Stack Trace:</strong>
            <pre className="mt-1 whitespace-pre-wrap break-all">
              {error?.stack}
            </pre>
          </div>
          {errorInfo?.componentStack && (
            <div>
              <strong>Component Stack:</strong>
              <pre className="mt-1 whitespace-pre-wrap">
                {errorInfo.componentStack}
              </pre>
            </div>
          )}
        </div>
      </details>
    );
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
              <CardDescription>
                We're sorry, but an unexpected error occurred. Our team has been notified.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3">
                <Button onClick={this.handleRetry} variant="default" className="w-full">
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Try Again {this.retryCount > 0 && `(${this.maxRetries - this.retryCount} remaining)`}
                </Button>
                
                <Button onClick={this.handleGoHome} variant="outline" className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
                
                <Button onClick={this.handleReportBug} variant="ghost" className="w-full">
                  <Bug className="w-4 h-4 mr-2" />
                  Report this issue
                </Button>
              </div>

              {this.state.errorId && (
                <div className="text-center text-sm text-muted-foreground">
                  Error ID: <code className="bg-muted px-1 py-0.5 rounded text-xs">{this.state.errorId}</code>
                </div>
              )}

              {this.renderErrorDetails()}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Specialized error boundaries for different app sections
export const RouteErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      console.error('Route Error:', error, errorInfo);
    }}
    showDetails={process.env.NODE_ENV === 'development'}
  >
    {children}
  </ErrorBoundary>
);

export const ComponentErrorBoundary: React.FC<{ 
  children: ReactNode;
  componentName?: string;
  fallback?: ReactNode;
}> = ({ children, componentName, fallback }) => (
  <ErrorBoundary
    fallback={fallback || (
      <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
        <div className="flex items-center text-destructive mb-2">
          <AlertTriangle className="w-4 h-4 mr-2" />
          <span className="font-medium">Component Error</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {componentName ? `The ${componentName} component` : 'This component'} encountered an error and cannot be displayed.
        </p>
      </div>
    )}
    isolate={true}
    onError={(error, errorInfo) => {
      console.error(`Component Error in ${componentName}:`, error, errorInfo);
    }}
  >
    {children}
  </ErrorBoundary>
);

export default ErrorBoundary;