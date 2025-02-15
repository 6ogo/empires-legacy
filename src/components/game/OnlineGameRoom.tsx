// src/components/game/OnlineGameRoom.tsx
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { createInitialGameState } from '@/lib/game-utils';
import { toast } from 'sonner';
import { Loader2 } from "lucide-react";

interface OnlineGameRoomProps {
  onRoomCreated: (roomId: string) => void;
  onRoomJoined: (roomId: string) => void;
}

const OnlineGameRoom: React.FC<OnlineGameRoomProps> = ({ onRoomCreated, onRoomJoined }) => {
  const [numPlayers, setNumPlayers] = useState<string>("2");
  const [roomCode, setRoomCode] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  const handleCreateRoom = async () => {
    if (!userId) {
      toast.error('You must be logged in to create a room');
      return;
    }

    setIsCreating(true);
    try {
      const roomId = `${Math.random().toString(36).substring(2, 8)}`.toUpperCase();
      const initialState = createInitialGameState(parseInt(numPlayers), 24);

      const { data: game, error } = await supabase
        .from('games')
        .insert({
          room_id: roomId,
          state: initialState,
          current_player: userId,
          max_players: parseInt(numPlayers),
          num_players: 1,
          joined_players: 1,
          game_status: 'waiting',
          phase: 'build',
          players_info: [{
            id: userId,
            ready: false
          }]
        })
        .select()
        .single();

      if (error) throw error;
      
      onRoomCreated(roomId);
      toast.success('Room created successfully!');
    } catch (error: any) {
      console.error('Error creating room:', error);
      toast.error(error.message || 'Failed to create room');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!userId) {
      toast.error('You must be logged in to join a room');
      return;
    }

    if (!roomCode) {
      toast.error('Please enter a room code');
      return;
    }

    setIsJoining(true);
    try {
      // Check if room exists and has space
      const { data: game, error: fetchError } = await supabase
        .from('games')
        .select('*')
        .eq('room_id', roomCode.toUpperCase())
        .single();

      if (fetchError || !game) {
        throw new Error('Room not found');
      }

      if (game.joined_players >= game.max_players) {
        throw new Error('Room is full');
      }

      // Check if player is already in the room
      const playersInfo = game.players_info as any[] || [];
      if (playersInfo.some(p => p.id === userId)) {
        onRoomJoined(roomCode);
        return;
      }

      // Join the room
      const { error: updateError } = await supabase
        .from('games')
        .update({
          joined_players: game.joined_players + 1,
          players_info: [...playersInfo, { id: userId, ready: false }]
        })
        .eq('id', game.id);

      if (updateError) throw updateError;

      onRoomJoined(roomCode);
      toast.success('Joined room successfully!');
    } catch (error: any) {
      console.error('Error joining room:', error);
      toast.error(error.message || 'Failed to join room');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Online Game</CardTitle>
        <CardDescription>Create or join a game room</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="create" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Room</TabsTrigger>
            <TabsTrigger value="join">Join Room</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="players">Number of Players</Label>
              <Select
                value={numPlayers}
                onValueChange={setNumPlayers}
              >
                <SelectTrigger id="players">
                  <SelectValue placeholder="Select number of players" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Players</SelectItem>
                  <SelectItem value="3">3 Players</SelectItem>
                  <SelectItem value="4">4 Players</SelectItem>
                  <SelectItem value="5">5 Players</SelectItem>
                  <SelectItem value="6">6 Players</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full"
              onClick={handleCreateRoom}
              disabled={isCreating}
            >
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isCreating ? 'Creating Room...' : 'Create Room'}
            </Button>
          </TabsContent>

          <TabsContent value="join" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roomCode">Room Code</Label>
              <Input
                id="roomCode"
                placeholder="Enter room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="uppercase"
                maxLength={6}
              />
            </div>

            <Button
              className="w-full"
              onClick={handleJoinRoom}
              disabled={isJoining || !roomCode}
            >
              {isJoining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isJoining ? 'Joining Room...' : 'Join Room'}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default OnlineGameRoom;
