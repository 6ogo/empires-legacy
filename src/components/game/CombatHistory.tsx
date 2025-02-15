
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Trophy, Skull, Clock, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface CombatHistoryProps {
  onClose: () => void;
}

const CombatHistory: React.FC<CombatHistoryProps> = ({ onClose }) => {
  const { user } = useAuth();

  const { data: games, isLoading } = useQuery({
    queryKey: ['combatHistory'],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('games')
        .select('*')
        .contains('players_info', [{ player_id: user.id }])
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const getGameResult = (game: any) => {
    if (!user) return null;

    if (!game.winner_id) return "In Progress";
    return game.winner_id === user.id ? "Victory" : "Defeat";
  };

  // Handle click outside
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Combat History</h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="absolute top-2 right-2 hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="h-[400px] rounded-md border p-4">
          {isLoading ? (
            <div className="text-center text-white">Loading combat history...</div>
          ) : !games || games.length === 0 ? (
            <div className="text-center text-white">No combat history yet</div>
          ) : (
            <div className="space-y-4">
              {games.map((game) => (
                <div 
                  key={game.id} 
                  className="bg-gray-800 p-4 rounded-lg border border-gray-700"