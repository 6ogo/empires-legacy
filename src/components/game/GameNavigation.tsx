
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

interface GameNavigationProps {
  onBack?: () => void;
  mode: 'menu' | 'mode_select' | 'creating' | 'joining' | 'playing' | 'waiting' | 'stats' | 'achievements' | 'leaderboard' | 'settings';
  isInRoom?: boolean;
  roomId?: string;
}

export const GameNavigation: React.FC<GameNavigationProps> = ({ 
  onBack, 
  mode, 
  isInRoom, 
  roomId 
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const navigate = useNavigate();

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onBack) {
      onBack();
    } else {
      navigate('/game');
    }
  };

  const handleCopy = async () => {
    if (!roomId) return;
    
    try {
      await navigator.clipboard.writeText(roomId);
      setIsCopied(true);
      toast.success('Room ID copied to clipboard');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy room ID');
    }
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {mode === 'menu' ? 'Home' : 'Back'}
        </Button>
        
        {isInRoom && roomId && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm font-medium">Room ID:</span>
            <code className="bg-muted px-2 py-1 rounded select-all">{roomId}</code>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="gap-2"
            >
              {isCopied ? (
                <CheckCheck className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {isCopied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default GameNavigation;
