
import { useState, useEffect } from "react";
import { GameState } from "@/types/game";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { createInitialGameState } from "@/lib/game-utils";

export const useOnlineGame = () => {
  const [gameId, setGameId] = useState<number | null>(null);
  const [roomId, setRoomId] = useState<string>("");
  const [joinRoomId, setJoinRoomId] = useState<string>("");
  const [isHost, setIsHost] = useState(false);

  const handleCreateGame = async (numPlayers: number, boardSize: number) => {
    const initialState = createInitialGameState(numPlayers, boardSize);
    
    try {
      const { data, error } = await supabase
        .from('games')
        .insert({
          state: initialState as unknown as Json,
          created_at: new Date().toISOString(),
          current_player: initialState.currentPlayer,
          phase: initialState.phase,
          num_players: numPlayers,
          game_status: 'waiting',
          joined_players: 1,
        })
        .select('id, room_id')
        .single();

      if (error) throw error;
      
      if (data) {
        setGameId(data.id);
        setRoomId(data.room_id);
        setIsHost(true);
        toast.success(`Game created! Room ID: ${data.room_id}`);
        return { initialState, data };
      }
    } catch (error) {
      console.error('Error creating game:', error);
      toast.error('Failed to create game. Please try again.');
    }
  };

  const handleJoinGame = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('room_id', joinRoomId)
        .single();

      if (error) throw error;

      if (data) {
        if (data.joined_players >= data.num_players) {
          toast.error('Game is full!');
          return;
        }

        const { error: updateError } = await supabase
          .from('games')
          .update({ 
            joined_players: data.joined_players + 1,
            game_status: data.joined_players + 1 === data.num_players ? 'playing' : 'waiting'
          })
          .eq('id', data.id);

        if (updateError) throw updateError;

        setGameId(data.id);
        toast.success('Joined game successfully!');
        return data;
      }
    } catch (error) {
      console.error('Error joining game:', error);
      toast.error('Failed to join game. Please check the Room ID and try again.');
    }
  };

  const handleStartAnyway = async () => {
    if (!gameId) return;

    try {
      const { error } = await supabase
        .from('games')
        .update({ 
          game_status: 'playing'
        })
        .eq('id', gameId);

      if (error) throw error;

      toast.success('Game started!');
      return true;
    } catch (error) {
      console.error('Error starting game:', error);
      toast.error('Failed to start game. Please try again.');
      return false;
    }
  };

  return {
    gameId,
    roomId,
    joinRoomId,
    setJoinRoomId,
    isHost,
    handleCreateGame,
    handleJoinGame,
    handleStartAnyway,
  };
};
