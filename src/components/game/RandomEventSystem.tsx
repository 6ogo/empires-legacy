
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { 
  AlertTriangle, 
  Cloud, 
  Gift, 
  Skull, 
  Tree, 
  Droplet, 
  Flame, 
  Wind
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player, Territory, useGameState } from '../../contexts/GameStateContext';

// Define random events
interface RandomEvent {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: 'positive' | 'negative' | 'neutral';
  effect: (state: any, dispatch: any, currentPlayer: number) => void;
  condition?: (state: any, currentPlayer: number) => boolean;
}

export const RandomEventSystem: React.FC = () => {
  const { state, dispatch } = useGameState();
  const [currentEvent, setCurrentEvent] = useState<RandomEvent | null>(null);
  const [showEvent, setShowEvent] = useState(false);
  
  // Define possible random events
  const possibleEvents: RandomEvent[] = [
    {
      id: 'bountiful_harvest',
      title: 'Bountiful Harvest',
      description: 'Favorable weather has led to an extraordinary harvest across your lands.',
      icon: <Tree className="w-10 h-10 text-green-500" />,
      type: 'positive',
      effect: (state, dispatch, currentPlayer) => {
        // Increase food resources by 50
        const updatedPlayers = [...state.players];
        updatedPlayers[currentPlayer].resources.food += 50;
        // TODO: Dispatch action to update player resources
      }
    },
    {
      id: 'gold_discovery',
      title: 'Gold Discovery',
      description: 'Miners have discovered a new vein of gold in your territories!',
      icon: <Gift className="w-10 h-10 text-yellow-500" />,
      type: 'positive',
      effect: (state, dispatch, currentPlayer) => {
        // Increase gold by 75
        const updatedPlayers = [...state.players];
        updatedPlayers[currentPlayer].resources.gold += 75;
        // TODO: Dispatch action to update player resources
      }
    },
    {
      id: 'drought',
      title: 'Drought',
      description: 'A severe drought has affected your farmlands, reducing food production.',
      icon: <Droplet className="w-10 h-10 text-blue-500" />,
      type: 'negative',
      effect: (state, dispatch, currentPlayer) => {
        // Decrease food by 30 (but not below 0)
        const updatedPlayers = [...state.players];
        updatedPlayers[currentPlayer].resources.food = Math.max(0, updatedPlayers[currentPlayer].resources.food - 30);
        // TODO: Dispatch action to update player resources
      }
    },
    {
      id: 'forest_fire',
      title: 'Forest Fire',
      description: 'A devastating fire has burned through forests in your territory.',
      icon: <Flame className="w-10 h-10 text-red-500" />,
      type: 'negative',
      effect: (state, dispatch, currentPlayer) => {
        // Decrease wood by 40 (but not below 0)
        const updatedPlayers = [...state.players];
        updatedPlayers[currentPlayer].resources.wood = Math.max(0, updatedPlayers[currentPlayer].resources.wood - 40);
        // TODO: Dispatch action to update player resources
      },
      condition: (state, currentPlayer) => {
        // Only trigger if player has forest territories
        return state.territories.some(t => 
          t.owner === currentPlayer && t.type === 'forest'
        );
      }
    },
    {
      id: 'favorable_trade',
      title: 'Favorable Trade',
      description: 'Foreign merchants have offered favorable trade terms.',
      icon: <Gift className="w-10 h-10 text-green-500" />,
      type: 'positive',
      effect: (state, dispatch, currentPlayer) => {
        // Increase all resources by a small amount
        const updatedPlayers = [...state.players];
        updatedPlayers[currentPlayer].resources.gold += 25;
        updatedPlayers[currentPlayer].resources.wood += 25;
        updatedPlayers[currentPlayer].resources.stone += 25;
        updatedPlayers[currentPlayer].resources.food += 25;
        // TODO: Dispatch action to update player resources
      }
    },
    {
      id: 'storm',
      title: 'Violent Storm',
      description: 'A violent storm has damaged buildings across your empire.',
      icon: <Cloud className="w-10 h-10 text-gray-500" />,
      type: 'negative',
      effect: (state, dispatch, currentPlayer) => {
        // For now, just a resource penalty
        const updatedPlayers = [...state.players];
        updatedPlayers[currentPlayer].resources.wood = Math.max(0, updatedPlayers[currentPlayer].resources.wood - 20);
        updatedPlayers[currentPlayer].resources.stone = Math.max(0, updatedPlayers[currentPlayer].resources.stone - 20);
        // TODO: Dispatch action to update player resources
      }
    },
    {
      id: 'strong_winds',
      title: 'Strong Winds',
      description: 'Strong winds have affected travel, but could be harnessed for windmills.',
      icon: <Wind className="w-10 h-10 text-blue-300" />,
      type: 'neutral',
      effect: (state, dispatch, currentPlayer) => {
        // Mix of positive and negative effects
        const updatedPlayers = [...state.players];
        updatedPlayers[currentPlayer].resources.gold += 15;
        updatedPlayers[currentPlayer].resources.wood -= 10;
        // TODO: Dispatch action to update player resources
      }
    },
    {
      id: 'disease',
      title: 'Disease Outbreak',
      description: 'A disease has weakened your military units temporarily.',
      icon: <Skull className="w-10 h-10 text-red-600" />,
      type: 'negative',
      effect: (state, dispatch, currentPlayer) => {
        // For now, just a food penalty (representing medical supplies)
        const updatedPlayers = [...state.players];
        updatedPlayers[currentPlayer].resources.food = Math.max(0, updatedPlayers[currentPlayer].resources.food - 35);
        // TODO: Dispatch action to update player units' health
      },
      condition: (state, currentPlayer) => {
        // Only trigger if player has units
        return state.players[currentPlayer].units.length > 0;
      }
    }
  ];
  
  // Function to trigger random events
  useEffect(() => {
    // Only check for random events during the playing phase
    if (state.phase !== 'playing' || state.turn < 3) {
      return;
    }
    
    // 20% chance of event each turn when current player changes to player 0 (new round)
    if (state.currentPlayer === 0 && Math.random() < 0.2) {
      // Filter events that meet their conditions
      const eligibleEvents = possibleEvents.filter(event => 
        !event.condition || event.condition(state, state.currentPlayer)
      );
      
      if (eligibleEvents.length > 0) {
        // Select a random event
        const randomEvent = eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)];
        setCurrentEvent(randomEvent);
        setShowEvent(true);
        
        // Apply event effect
        randomEvent.effect(state, dispatch, state.currentPlayer);
      }
    }
  }, [state.currentPlayer, state.turn, state.phase]);
  
  // Dismiss the event
  const handleDismiss = () => {
    setShowEvent(false);
    setTimeout(() => setCurrentEvent(null), 500); // Clear after animation
  };
  
  return (
    <AnimatePresence>
      {showEvent && currentEvent && (
        <motion.div 
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className={`
              bg-gray-900 p-6 rounded-lg shadow-lg max-w-md w-full mx-4 border-2
              ${currentEvent.type === 'positive' ? 'border-green-500' : 
                currentEvent.type === 'negative' ? 'border-red-500' : 'border-blue-500'}
            `}
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`
                p-2 rounded-full
                ${currentEvent.type === 'positive' ? 'bg-green-900' : 
                  currentEvent.type === 'negative' ? 'bg-red-900' : 'bg-blue-900'}
              `}>
                {currentEvent.icon}
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-white mb-1">
                  {currentEvent.title}
                </h2>
                <p className={`text-sm font-medium
                  ${currentEvent.type === 'positive' ? 'text-green-400' : 
                    currentEvent.type === 'negative' ? 'text-red-400' : 'text-blue-400'}
                `}>
                  Random Event
                </p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6">
              {currentEvent.description}
            </p>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleDismiss}
                className={`
                  ${currentEvent.type === 'positive' ? 'bg-green-600 hover:bg-green-700' : 
                    currentEvent.type === 'negative' ? 'bg-red-600 hover:bg-red-700' : 
                    'bg-blue-600 hover:bg-blue-700'}
                `}
              >
                Continue
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
