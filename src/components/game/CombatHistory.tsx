
import React from 'react';
import { GameState } from '@/types/game';

export interface CombatHistoryProps {
  gameState?: GameState;
  onClose: () => void;
}

const CombatHistory: React.FC<CombatHistoryProps> = ({ gameState, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="container mx-auto p-4">
        <div className="bg-background rounded-lg p-6 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Combat History</h2>
          {gameState ? (
            <div className="space-y-4">
              {gameState.updates
                .filter(update => update.type === 'combat')
                .map((update, index) => (
                  <div key={index} className="p-2 bg-muted rounded">
                    <p>{update.message}</p>
                    <span className="text-sm text-muted-foreground">
                      {new Date(update.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p>No combat history available</p>
          )}
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CombatHistory;
