
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  HelpCircle, 
  X, 
  Flag, 
  Building, 
  Sword, 
  Users, 
  Map, 
  Award, 
  ArrowRightCircle
} from 'lucide-react';

interface TutorialStep {
  title: string;
  content: React.ReactNode;
  icon: React.ReactNode;
}

export const Tutorial: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const tutorialSteps: TutorialStep[] = [
    {
      title: "Welcome to Empire's Legacy",
      content: (
        <div className="space-y-2">
          <p>
            Empire's Legacy is a turn-based strategy game where you build and expand your empire, 
            manage resources, and compete against other players.
          </p>
          <p>
            This tutorial will guide you through the basic mechanics of the game.
          </p>
        </div>
      ),
      icon: <Map className="w-10 h-10 text-blue-400" />,
    },
    {
      title: "Setup Phase",
      content: (
        <div className="space-y-2">
          <p>
            The game begins with a setup phase where each player claims their first territory.
          </p>
          <p>
            Click on any unclaimed territory (gray hexes) to establish your starting position.
          </p>
          <p>
            Choose wisely! Your starting location will affect your early game strategy.
          </p>
        </div>
      ),
      icon: <Flag className="w-10 h-10 text-green-400" />,
    },
    {
      title: "Resources",
      content: (
        <div className="space-y-2">
          <p>
            There are four key resources to manage:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><span className="text-yellow-400">Gold</span> - Used for various purchases and upkeep</li>
            <li><span className="text-brown-400">Wood</span> - Essential for buildings and some units</li>
            <li><span className="text-gray-400">Stone</span> - Required for advanced structures</li>
            <li><span className="text-red-400">Food</span> - Needed to sustain your military</li>
          </ul>
          <p>
            Each territory provides different resources based on its type (plains, mountains, forests, etc.).
          </p>
        </div>
      ),
      icon: <Award className="w-10 h-10 text-yellow-400" />,
    },
    {
      title: "Expanding Your Empire",
      content: (
        <div className="space-y-2">
          <p>
            During the playing phase, you can expand your empire to adjacent unclaimed territories.
          </p>
          <p>
            Click the "Expand" button in the action panel, then select an adjacent unclaimed territory.
          </p>
          <p>
            Expansion costs resources but will provide more income per turn.
          </p>
        </div>
      ),
      icon: <ArrowRightCircle className="w-10 h-10 text-purple-400" />,
    },
    {
      title: "Building Structures",
      content: (
        <div className="space-y-2">
          <p>
            Structures provide various bonuses to your empire:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><span className="font-bold">Farms</span> - Increase food production</li>
            <li><span className="font-bold">Mines</span> - Produce gold and stone</li>
            <li><span className="font-bold">Lumbermills</span> - Enhance wood production</li>
            <li><span className="font-bold">Markets</span> - Generate additional gold</li>
            <li><span className="font-bold">Fortresses</span> - Improve territory defense</li>
            <li><span className="font-bold">Barracks</span> - Reduce unit training costs</li>
          </ul>
          <p>
            Click the "Build" button, select a territory you own, then choose a structure to build.
          </p>
        </div>
      ),
      icon: <Building className="w-10 h-10 text-orange-400" />,
    },
    {
      title: "Military Units",
      content: (
        <div className="space-y-2">
          <p>
            Recruit military units to defend your territories and attack opponents:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><span className="font-bold">Infantry</span> - Balanced attack and defense</li>
            <li><span className="font-bold">Cavalry</span> - High attack, low defense</li>
            <li><span className="font-bold">Artillery</span> - Very high attack, very low defense</li>
          </ul>
          <p>
            Click the "Recruit" button, select a territory, then choose a unit type.
          </p>
          <p>
            Units gain experience in combat, becoming more effective as they level up.
          </p>
        </div>
      ),
      icon: <Users className="w-10 h-10 text-blue-400" />,
    },
    {
      title: "Combat",
      content: (
        <div className="space-y-2">
          <p>
            Attack opponent territories that are adjacent to yours:
          </p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Click the "Attack" button in the action panel</li>
            <li>Select one of your territories as the origin</li>
            <li>Select an adjacent enemy territory to attack</li>
          </ol>
          <p>
            Combat outcome depends on the units present, territory defenses, and some randomness.
          </p>
          <p>
            If successful, you'll capture the enemy territory.
          </p>
        </div>
      ),
      icon: <Sword className="w-10 h-10 text-red-400" />,
    },
    {
      title: "Winning the Game",
      content: (
        <div className="space-y-2">
          <p>
            There are three ways to achieve victory:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><span className="font-bold">Domination Victory</span> - Control all territories on the map</li>
            <li><span className="font-bold">Economic Victory</span> - Accumulate 1000+ gold</li>
            <li><span className="font-bold">Military Victory</span> - Build an army of 15+ units</li>
          </ul>
          <p>
            Plan your strategy according to the victory condition you're aiming for!
          </p>
        </div>
      ),
      icon: <Award className="w-10 h-10 text-yellow-400" />,
    },
  ];
  
  const toggleTutorial = () => {
    setIsOpen(!isOpen);
    setCurrentStep(0);
  };
  
  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsOpen(false);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  return (
    <>
      {/* Tutorial toggle button */}
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 z-10"
        onClick={toggleTutorial}
      >
        <HelpCircle className="w-5 h-5 mr-2" />
        Tutorial
      </Button>
      
      {/* Tutorial modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="bg-gray-900 rounded-lg border border-gray-700 max-w-3xl w-full"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-700 p-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <HelpCircle className="w-6 h-6 mr-2 text-blue-500" />
                  Game Tutorial
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                  onClick={toggleTutorial}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="bg-gray-800 p-3 rounded-full mr-4">
                    {tutorialSteps[currentStep].icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    {tutorialSteps[currentStep].title}
                  </h3>
                </div>
                
                <div className="text-gray-300 mb-8 min-h-[150px]">
                  {tutorialSteps[currentStep].content}
                </div>
                
                {/* Progress indicator */}
                <div className="flex justify-center mb-4">
                  {tutorialSteps.map((_, index) => (
                    <div 
                      key={index}
                      className={`h-1 w-8 mx-1 rounded-full ${
                        index === currentStep ? 'bg-blue-500' : 'bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Navigation buttons */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className={`${
                      currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    } border-gray-700 text-gray-300`}
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Previous
                  </Button>
                  
                  <Button
                    variant="default"
                    onClick={nextStep}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {currentStep === tutorialSteps.length - 1 ? (
                      'Finish'
                    ) : (
                      <>
                        Next
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
