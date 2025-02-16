
import React from 'react';
import { toast } from 'sonner';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: Error) {
    console.error('Application error:', error);
    toast.error('An error occurred. Please refresh the page.');
    this.setState({ hasError: true });
  }

  render() {
    return this.props.children;
  }
}

export default ErrorBoundary;
