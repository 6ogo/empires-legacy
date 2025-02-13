import { useState, useEffect } from "react";
import { GameState } from "@/types/game";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { createInitialGameState } from "@/lib/game-utils";
import { useAuth } from "@/hooks/useAuth";

export const useOnlineGame = () => {
  const [gameId, setGameId] = useState<number | null>(null);
  const [roomId, setRoomId] = useState<string>("");
  const [joinRoomId, setJoinRoomId] = useState<string>("");
  const [isHost, setIsHost] = useState(false);
  const [connectedPlayers, setConnectedPlayers] = useState<{ username: string }[]>([]);
  const [turnTimer, setTurnTimer] = useState<number>(120); // 2 minutes in seconds
  const { profile } = useAuth();

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (gameId) {
      timer = setInterval(() => {
        setTurnTimer((prev) => {
          if (prev <= 0) {
            // When timer reaches 0, automatically end the turn
            // This should be implemented in the game logic
            return 120; // Reset timer for next player
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [gameId]);

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
        setConnectedPlayers([{ username: profile?.username || 'Host' }]);
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

  useEffect(() => {
    if (gameId) {
      const channel = supabase.channel(`game_${gameId}`)
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const players = Object.values(state).flat().map((p: any) => ({
            username: p.username
          }));
          setConnectedPlayers(players);
        })
        .subscribe();

      if (profile?.username) {
        channel.track({
          username: profile.username,
          online_at: new Date().toISOString(),
        });
      }

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [gameId, profile?.username]);

  return {
    gameId,
    roomId,
    joinRoomId,
    setJoinRoomId,
    isHost,
    connectedPlayers,
    handleCreateGame,
    handleJoinGame,
    handleStartAnyway,
    turnTimer,
    setTurnTimer,
  };
};
