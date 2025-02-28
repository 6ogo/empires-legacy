
import React from "react";
import { Button } from "../ui/button";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export const ErrorScreen: React.FC<{
  message: string;
  onBack: () => void;
}> = ({ message, onBack }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="bg-red-900 bg-opacity-20 rounded-lg p-8 max-w-md text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        
        <h2 className="text-2xl font-bold text-white mb-4">
          Error
        </h2>
        
        <p className="text-gray-300 mb-6">
          {message}
        </p>
        
        <Button 
          className="bg-red-600 hover:bg-red-700"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Menu
        </Button>
      </div>
    </div>
  );
};
