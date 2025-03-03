
import React from 'react';
import { Player } from '../../contexts/GameStateContext';
import { Button } from '../ui/button';
import { Crown, Trophy, Coins, Sword } from 'lucide-react';
import { motion } from 'framer-motion';

interface VictoryScreenProps {
  winner: Player;
  victoryType: 'domination' | 'economic' | 'military';
  onNewGame: () => void;
  onExitToMenu: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  winner,
  victoryType,
  onNewGame,
  onExitToMenu
}) => {
  // Define content based on victory type
  const getVictoryInfo = () => {
    switch (victoryType) {
      case 'domination':
        return {
          title: 'Domination Victory',
          icon: <Crown className="w-20 h-20 text-amber-500" />,
          description: 'You have conquered all territories and established complete dominance over the world!'
        };
      case 'economic':
        return {
          title: 'Economic Victory',
          icon: <Coins className="w-20 h-20 text-amber-500" />,
          description: 'Your empire has achieved unparalleled wealth and economic superiority!'
        };
      case 'military':
        return {
          title: 'Military Victory',
          icon: <Sword className="w-20 h-20 text-amber-500" />,
          description: 'Your mighty army has overwhelmed all opposition with superior military might!'
        };
      default:
        return {
          title: 'Victory',
          icon: <Trophy className="w-20 h-20 text-amber-500" />,
          description: 'Your empire has triumphed over all others!'
        };
    }
  };

  const victoryInfo = getVictoryInfo();

  return (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="bg-gray-900 rounded-lg p-8 max-w-2xl w-full mx-4 border border-amber-500 shadow-lg"
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="text-center mb-8">
          <motion.div 
            className="mb-6 flex justify-center"
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, type: "spring" }}
          >
            {victoryInfo.icon}
          </motion.div>
          
          <motion.h1 
            className="text-4xl font-bold text-amber-500 mb-2"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {victoryInfo.title}
          </motion.h1>
          
          <motion.div
            className="mb-4 flex items-center justify-center gap-2"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div 
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: winner.color }}
            />
            <h2 className="text-2xl text-white font-bold">{winner.name}</h2>
          </motion.div>
          
          <motion.p 
            className="text-gray-300 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {victoryInfo.description}
          </motion.p>
        </div>
        
        <motion.div 
          className="grid grid-cols-2 gap-4 mt-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-gray-300 font-bold mb-2">Empire Stats</h3>
            <ul className="text-gray-400 space-y-1">
              <li className="flex justify-between">
                <span>Territories:</span>
                <span>{winner.territories.length}</span>
              </li>
              <li className="flex justify-between">
                <span>Units:</span>
                <span>{winner.units.length}</span>
              </li>
              <li className="flex justify-between">
                <span>Buildings:</span>
                <span>{Object.values(winner.buildings.count).reduce((a, b) => a + b, 0)}</span>
              </li>
              <li className="flex justify-between">
                <span>Score:</span>
                <span>{winner.score}</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-gray-300 font-bold mb-2">Resources</h3>
            <ul className="text-gray-400 space-y-1">
              <li className="flex justify-between">
                <span>Gold:</span>
                <span>{winner.resources.gold}</span>
              </li>
              <li className="flex justify-between">
                <span>Wood:</span>
                <span>{winner.resources.wood}</span>
              </li>
              <li className="flex justify-between">
                <span>Stone:</span>
                <span>{winner.resources.stone}</span>
              </li>
              <li className="flex justify-between">
                <span>Food:</span>
                <span>{winner.resources.food}</span>
              </li>
            </ul>
          </div>
        </motion.div>
        
        <motion.div 
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Button 
            variant="default" 
            className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto"
            onClick={onNewGame}
          >
            <Trophy className="w-4 h-4 mr-2" />
            New Game
          </Button>
          
          <Button 
            variant="outline" 
            className="border-gray-700 text-gray-300 w-full sm:w-auto"
            onClick={onExitToMenu}
          >
            Exit to Main Menu
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
