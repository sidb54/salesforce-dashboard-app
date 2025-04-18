import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorPage from '../pages/ErrorPage';

interface Props {
  children: ReactNode;
  excludePaths?: string[];
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  currentPath: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      currentPath: window.location.pathname
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      errorInfo,
      currentPath: window.location.pathname
    });
  }

  componentDidUpdate(): void {
    // Check if the URL has changed
    const currentPath = window.location.pathname;
    
    if (this.state.currentPath !== currentPath) {
      // Reset the error state when navigating to a new page
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        currentPath
      });
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Optional: Force a complete reload to ensure clean state
    window.location.reload();
  };

  render(): ReactNode {
    const { excludePaths = [] } = this.props;
    const { hasError, error, currentPath } = this.state;
    
    // If we're on an excluded path, don't show the error UI
    const isExcludedPath = excludePaths.some(path => 
      currentPath === path || currentPath.startsWith(path)
    );

    if (hasError && !isExcludedPath) {
      // Render error UI
      return <ErrorPage 
        error={error as Error} 
        resetErrorBoundary={this.resetErrorBoundary} 
      />;
    }

    // Otherwise, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary; 