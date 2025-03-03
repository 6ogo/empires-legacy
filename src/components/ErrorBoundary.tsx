
import React from 'react';
import { toast } from 'sonner';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application error:', error);
    console.error('Component stack:', errorInfo.componentStack);
    
    toast.error('An error occurred. Please refresh the page.');
    
    this.setState({
      hasError: true,
      error,
      errorInfo
    });
  }

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
          <div className="bg-red-900/20 rounded-lg p-8 max-w-md text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            
            <h2 className="text-2xl font-bold mb-4">
              An error occurred
            </h2>
            
            <p className="text-gray-300 mb-6">
              Sorry, something went wrong. The application needs to be refreshed.
            </p>
            
            {this.state.error && (
              <div className="bg-gray-800 p-3 rounded mb-4 text-left overflow-auto text-sm">
                <p className="text-red-400">{this.state.error.toString()}</p>
              </div>
            )}
            
            <Button 
              className="bg-red-600 hover:bg-red-700 flex items-center"
              onClick={this.handleRefresh}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Application
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
