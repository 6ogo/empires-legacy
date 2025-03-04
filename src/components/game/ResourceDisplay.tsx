
import React from 'react';
import { motion } from 'framer-motion';
import { Coins, Tree, Mountain, Apple } from 'lucide-react';

interface ResourceDisplayProps {
  resources: {
    gold: number;
    wood: number;
    stone: number;
    food: number;
  };
  className?: string;
  showLabels?: boolean;
  compact?: boolean;
}

export const ResourceDisplay: React.FC<ResourceDisplayProps> = ({
  resources,
  className = '',
  showLabels = true,
  compact = false
}) => {
  const resourceItems = [
    { name: 'Gold', value: resources.gold, icon: <Coins className="w-5 h-5 text-yellow-500" /> },
    { name: 'Wood', value: resources.wood, icon: <Tree className="w-5 h-5 text-green-600" /> },
    { name: 'Stone', value: resources.stone, icon: <Mountain className="w-5 h-5 text-gray-400" /> },
    { name: 'Food', value: resources.food, icon: <Apple className="w-5 h-5 text-red-500" /> }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24
      }
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        {resourceItems.map((resource, index) => (
          <div key={index} className="flex items-center">
            {resource.icon}
            <span className="ml-1 font-medium text-white">{resource.value}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div 
      className={`bg-gray-800 rounded-lg p-3 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {resourceItems.map((resource, index) => (
          <motion.div 
            key={index}
            variants={itemVariants}
            className="flex flex-col items-center justify-center bg-gray-900 rounded p-2"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 mb-2">
              {resource.icon}
            </div>
            <div className="text-lg font-bold text-white">{resource.value}</div>
            {showLabels && <div className="text-xs text-gray-400">{resource.name}</div>}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
