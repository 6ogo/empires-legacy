import { useState, useEffect } from "react";
import { GameState } from "@/types/game";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { createInitialGameState } from "@/lib/game-utils";
import { isValidGameState } from "@/lib/game-validation";

export const useOnlineGame = (
  playerName: string = 'Player',
  onRemoteStateUpdate?: (state: GameState) => void
) => {
  const [gameId, setGameId] = useState<number | null>(null);
  const [roomId, setRoomId] = useState<string>("");
  const [joinRoomId, setJoinRoomId] = useState<string>("");
  const [isHost, setIsHost] = useState(false);
  const [connectedPlayers, setConnectedPlayers] = useState<{ username: string }[]>([]);
  const [turnTimer, setTurnTimer] = useState<number>(120);

  // Turn countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameId) {
      timer = setInterval(() => {
        setTurnTimer(prev => (prev <= 0 ? 120 : prev - 1));
      }, 1000);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [gameId]);

  // Real-time game state subscription
  useEffect(() => {
    if (!gameId) return;

    const stateSub = supabase
      .channel(`game_state_sync_${gameId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
        (payload) => {
          try {
            const raw = payload.new.state;
            const parsed: GameState = typeof raw === 'string' ? JSON.parse(raw) : raw;
            if (isValidGameState(parsed) && onRemoteStateUpdate) {
              onRemoteStateUpdate(parsed);
            }
          } catch (e) {
            console.error('State sync error:', e);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(stateSub); };
  }, [gameId, onRemoteStateUpdate]);

  // Presence tracking
  useEffect(() => {
    if (!gameId) return;

    const channel = supabase.channel(`game_presence_${gameId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const players = Object.values(state).flat().map((p: any) => ({
          username: p.username as string,
        }));
        setConnectedPlayers(players);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ username: playerName, online_at: new Date().toISOString() });
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, [gameId, playerName]);

  const handleCreateGame = async (numPlayers: number, boardSize: number) => {
    const initialState = createInitialGameState(numPlayers, boardSize);

    try {
      const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { data, error } = await supabase
        .from('games')
        .insert({
          state: JSON.stringify(initialState) as unknown as Json,
          created_at: new Date().toISOString(),
          current_player: initialState.currentPlayer,
          phase: initialState.phase,
          num_players: numPlayers,
          game_status: 'waiting',
          joined_players: 1,
          room_id: newRoomId,
        })
        .select('id, room_id')
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned');

      setGameId(data.id);
      setRoomId(data.room_id);
      setIsHost(true);
      setConnectedPlayers([{ username: playerName }]);
      toast.success(`Game created! Room ID: ${data.room_id}`);
      return { initialState, data };
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
        .eq('room_id', joinRoomId.toUpperCase())
        .single();

      if (error) throw error;
      if (!data) throw new Error('Game not found');

      if (data.joined_players >= data.num_players) {
        toast.error('Game is full!');
        return;
      }

      const newJoined = data.joined_players + 1;
      const { error: updateError } = await supabase
        .from('games')
        .update({
          joined_players: newJoined,
          game_status: newJoined >= data.num_players ? 'playing' : 'waiting',
        })
        .eq('id', data.id);

      if (updateError) throw updateError;

      setGameId(data.id);
      setRoomId(data.room_id);
      toast.success('Joined game successfully!');
      return data;
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
        .update({ game_status: 'playing' })
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
    connectedPlayers,
    handleCreateGame,
    handleJoinGame,
    handleStartAnyway,
    turnTimer,
    setTurnTimer,
  };
};
