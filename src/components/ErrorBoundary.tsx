import React from 'react';
import { toast } from 'sonner';

class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error) {
    console.error('Application error:', error);
    toast.error('An error occurred. Please refresh the page.');
  }

  render() {
    return this.props.children;
  }
}

export default ErrorBoundary;