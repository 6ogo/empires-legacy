import React, { useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useGameState } from '@/hooks/useGameState';
import { createInitialGameState } from '@/lib/game-utils';
import { isValidGameState } from '@/lib/game-validation';
import { supabase } from '@/integrations/supabase/client';
import { GameState, GameAction } from '@/types/game';
import { Json } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import MainMenu from './MainMenu';
import GameScreen from './GameScreen';
import LoadingScreen from './LoadingScreen';
import ErrorScreen from './ErrorScreen';

const GameWrapper = () => {
  const {
    gameStatus,
    gameMode,
    gameState: storedGameState,
    gameId,
    roomId,
    isHost,
    connectedPlayers,
    playerNames,
    isLoading,
    error,
    setGameStatus,
    setGameMode,
    setGameState,
    setGameId,
    setRoomId,
    setIsHost,
    updateConnectedPlayers,
    resetGame,
    initializeGame,
  } = useGameStore();

  const initialGameState = storedGameState ?? createInitialGameState(2, 20);

  const handleStateChange = useCallback((newState: GameState) => {
    setGameState(newState);
    // Online sync handled in a dedicated effect below
  }, [setGameState]);

  const { gameState: liveGameState, dispatchAction, resetState } = useGameState(initialGameState, {
    onStateChange: handleStateChange,
  });

  // ── Online: sync state to Supabase after each local change ────────────────
  const lastSyncedVersionRef = useRef<number>(0);
  useEffect(() => {
    if (gameMode !== 'online' || !gameId || !liveGameState) return;
    if (liveGameState.version <= lastSyncedVersionRef.current) return;

    lastSyncedVersionRef.current = liveGameState.version;
    supabase
      .from('games')
      .update({
        state: JSON.stringify(liveGameState) as unknown as Json,
        current_player: liveGameState.currentPlayer,
        phase: liveGameState.phase,
        last_action_timestamp: Date.now().toString(),
      })
      .eq('id', gameId)
      .then(({ error }) => {
        if (error) console.error('Failed to sync game state:', error);
      });
  }, [gameMode, gameId, liveGameState]);

  // ── Online: subscribe to remote state changes ─────────────────────────────
  useEffect(() => {
    if (gameMode !== 'online' || !gameId) return;

    const channel = supabase
      .channel(`game_state_${gameId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
        (payload) => {
          try {
            const raw = payload.new.state;
            const parsed: GameState = typeof raw === 'string' ? JSON.parse(raw) : raw;
            if (isValidGameState(parsed) && parsed.version > liveGameState.version) {
              dispatchAction({
                type: 'SET_STATE',
                payload: { state: parsed },
                playerId: parsed.currentPlayer,
                timestamp: Date.now(),
              });
            }
          } catch (e) {
            console.error('Remote state sync error:', e);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [gameMode, gameId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Online: presence tracking ─────────────────────────────────────────────
  useEffect(() => {
    if (gameMode !== 'online' || !gameId) return;

    const myName = playerNames[0] || 'Player';
    const channel = supabase.channel(`presence_${gameId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const players = Object.values(state).flat().map((p: any) => ({
          username: p.username as string,
        }));
        updateConnectedPlayers(players);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ username: myName, online_at: new Date().toISOString() });
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, [gameMode, gameId, playerNames]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Game creation ─────────────────────────────────────────────────────────
  const handleCreateGame = useCallback(async (numPlayers: number, boardSize: number) => {
    if (gameMode === 'local') {
      initializeGame(numPlayers, boardSize);
      const newState = createInitialGameState(numPlayers, boardSize);
      resetState(newState);
      setGameStatus('playing');
      return;
    }

    // Online game creation
    try {
      const newState = createInitialGameState(numPlayers, boardSize);
      const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      const myName = playerNames[0] || 'Player 1';

      const { data, error: insertError } = await supabase
        .from('games')
        .insert({
          state: JSON.stringify(newState) as unknown as Json,
          created_at: new Date().toISOString(),
          current_player: newState.currentPlayer,
          phase: newState.phase,
          num_players: numPlayers,
          game_status: 'waiting',
          joined_players: 1,
          room_id: newRoomId,
        })
        .select('id, room_id')
        .single();

      if (insertError) throw insertError;
      if (!data) throw new Error('No data returned');

      setGameId(data.id);
      setRoomId(data.room_id);
      setIsHost(true);
      updateConnectedPlayers([{ username: myName }]);
      setGameState(newState);
      resetState(newState);
      setGameStatus('waiting');
      toast.success(`Game created! Room ID: ${data.room_id}`);
    } catch (err) {
      console.error('Error creating online game:', err);
      toast.error('Failed to create game. Please try again.');
    }
  }, [gameMode, playerNames, setGameId, setRoomId, setIsHost, updateConnectedPlayers, setGameState, setGameStatus, resetState, initializeGame]);

  const handleJoinGame = useCallback(async (joinRoomId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('games')
        .select('*')
        .eq('room_id', joinRoomId.toUpperCase())
        .single();

      if (fetchError) throw fetchError;
      if (!data) throw new Error('Game not found');

      if (data.joined_players >= data.num_players) {
        toast.error('Game is full!');
        return;
      }

      const newJoined = data.joined_players + 1;
      const newStatus = newJoined >= data.num_players ? 'playing' : 'waiting';

      const { error: updateError } = await supabase
        .from('games')
        .update({ joined_players: newJoined, game_status: newStatus })
        .eq('id', data.id);

      if (updateError) throw updateError;

      const parsedState: GameState = typeof data.state === 'string'
        ? JSON.parse(data.state)
        : data.state;

      setGameId(data.id);
      setRoomId(data.room_id);
      setIsHost(false);
      setGameState(parsedState);
      resetState(parsedState);
      setGameStatus('waiting');
      toast.success('Joined game!');
    } catch (err) {
      console.error('Error joining game:', err);
      toast.error('Failed to join game. Check the room ID and try again.');
    }
  }, [setGameId, setRoomId, setIsHost, setGameState, resetState, setGameStatus]);

  const handleStartAnyway = useCallback(async () => {
    if (!gameId) return;
    try {
      await supabase.from('games').update({ game_status: 'playing' }).eq('id', gameId);
      setGameStatus('playing');
      toast.success('Game started!');
    } catch (err) {
      console.error('Error starting game:', err);
      toast.error('Failed to start game.');
    }
  }, [gameId, setGameStatus]);

  const handleSelectMode = useCallback((mode: 'local' | 'online') => {
    setGameMode(mode);
    setGameStatus('creating');
  }, [setGameMode, setGameStatus]);

  const handleBackToMenu = useCallback(() => {
    resetGame();
    resetState(createInitialGameState(2, 20));
  }, [resetGame, resetState]);

  const handleBackFromGame = useCallback(() => {
    setGameStatus('menu');
    setGameMode(null);
    setGameState(null);
    resetState(createInitialGameState(2, 20));
  }, [setGameStatus, setGameMode, setGameState, resetState]);

  // ── Render ────────────────────────────────────────────────────────────────
  if (isLoading) return <LoadingScreen message="Loading game..." />;
  if (error) return <ErrorScreen message={error.message} onRetry={handleBackToMenu} />;

  if (gameStatus === 'playing' && liveGameState) {
    return (
      <GameScreen
        gameState={liveGameState}
        dispatchAction={dispatchAction as (action: GameAction) => boolean}
        onBack={handleBackFromGame}
        onShowCombatHistory={() => {}}
      />
    );
  }

  return (
    <MainMenu
      gameStatus={gameStatus}
      gameMode={gameMode}
      onCreateGame={handleCreateGame}
      onJoinGame={handleJoinGame}
      joinRoomId={roomId}
      onJoinRoomIdChange={setRoomId}
      isHost={isHost}
      onStartAnyway={handleStartAnyway}
      onSelectMode={handleSelectMode}
      connectedPlayers={connectedPlayers}
      onBackToMenu={handleBackToMenu}
    />
  );
};

export default GameWrapper;
