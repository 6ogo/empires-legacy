import React, { useState } from "react";
import { GameState, GameAction } from "@/types/game";
import GameBoard from "./GameBoard";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface GameScreenProps {
  gameState: GameState;
  dispatchAction: (action: GameAction) => boolean;
  onBack: () => void;
  onShowCombatHistory?: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({
  gameState,
  dispatchAction,
  onBack,
}) => {
  const [showGiveUpDialog, setShowGiveUpDialog] = useState(false);

  const handleEndTurn = () => {
    const success = dispatchAction({
      type: 'END_TURN',
      playerId: gameState.currentPlayer,
      timestamp: Date.now(),
      payload: {},
    });
    if (!success) toast.error('Cannot end turn right now');
  };

  const handleEndPhase = () => {
    const success = dispatchAction({
      type: 'END_PHASE',
      playerId: gameState.currentPlayer,
      timestamp: Date.now(),
      payload: {},
    });
    if (!success) toast.error('Cannot end phase yet');
  };

  const handleGiveUp = () => {
    setShowGiveUpDialog(true);
  };

  const confirmGiveUp = () => {
    setShowGiveUpDialog(false);
    toast.info(`${gameState.currentPlayer} gave up`);
    onBack();
  };

  return (
    <>
      <GameBoard
        gameState={gameState}
        dispatchAction={dispatchAction}
        onEndTurn={handleEndTurn}
        onEndPhase={handleEndPhase}
        onGiveUp={handleGiveUp}
        onBack={onBack}
      />

      <AlertDialog open={showGiveUpDialog} onOpenChange={setShowGiveUpDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Give Up?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to give up? You will be returned to the main menu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmGiveUp} className="bg-red-600 hover:bg-red-700">
              Give Up
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default GameScreen;
