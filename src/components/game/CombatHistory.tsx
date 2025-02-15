
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Trophy, Skull, Clock } from "lucide-react";
import { toast } from "sonner";

interface CombatHistoryProps {
  onClose: () => void;
}

const CombatHistory: React.FC<CombatHistoryProps> = ({ onClose }) => {
  const { data: games, isLoading } = useQuery({
    queryKey: ['combatHistory'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('games')
        .select('*')
        .contains('players_info', [{ player_id: user.user.id }])
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  const getGameResult = (game: any) => {
    const { data: user } = supabase.auth.getUser();
    if (!user.user) return null;

    if (!game.winner_id) return "In Progress";
    return game.winner_id === user.user.id ? "Victory" : "Defeat";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Combat History</h2>
          <Button variant="ghost" onClick={onClose}>Close</Button>
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
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">
                      {formatDistanceToNow(new Date(game.created_at), { addSuffix: true })}
                    </span>
                    {getGameResult(game) === "In Progress" ? (
                      <div className="flex items-center text-yellow-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>In Progress</span>
                      </div>
                    ) : getGameResult(game) === "Victory" ? (
                      <div className="flex items-center text-green-500">
                        <Trophy className="w-4 h-4 mr-1" />
                        <span>Victory</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-500">
                        <Skull className="w-4 h-4 mr-1" />
                        <span>Defeat</span>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-300">
                    Players: {game.num_players}
                    {game.game_summary && (
                      <div className="mt-2 text-xs text-gray-400">
                        {typeof game.game_summary === 'string' 
                          ? game.game_summary 
                          : JSON.stringify(game.game_summary)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default CombatHistory;
