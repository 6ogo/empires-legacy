import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Trophy, Skull, Clock, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { GameState, GameUpdate } from "@/types/game";

interface CombatHistoryProps {
  gameState: GameState;
  onClose: () => void;
}

interface CombatHistoryEntry {
  id: string;
  action: string;
  territory_from?: string;
  territory_to?: string;
  attacker: string;
  defender: string;
  result: 'victory' | 'defeat' | 'ongoing';
  damage_dealt: number;
  units_lost: number;
  timestamp: string;
}

const CombatHistory = ({ gameState, onClose }: CombatHistoryProps) => {
  const { user } = useAuth();
  
  // Filter combat-related updates from gameState
  const combatUpdates = gameState.updates.filter(
    update => update.type === 'combat'
  ).sort((a, b) => b.timestamp - a.timestamp);

  // Query for persistent combat history from database
  const { data: historicalCombats, isLoading } = useQuery({
    queryKey: ['combatHistory', user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('combat_history')
        .select('*')
        .or(`attacker.eq.${user.id},defender.eq.${user.id}`)
        .order('timestamp', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching combat history:', error);
        throw error;
      }
      return data as CombatHistoryEntry[];
    },
    enabled: !!user,
    retry: 1,
  });

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getCombatResult = (combat: CombatHistoryEntry) => {
    if (!user) return null;
    if (combat.result === 'ongoing') return "In Progress";
    return combat.attacker === user.id ? 
      (combat.result === 'victory' ? "Victory" : "Defeat") : 
      (combat.result === 'victory' ? "Defeat" : "Victory");
  };

  const renderCombatUpdate = (update: GameUpdate, index: number) => (
    <div 
      key={`current-${index}`} 
      className="bg-gray-800 p-4 rounded-lg border border-gray-700"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">
          {formatDistanceToNow(new Date(update.timestamp), { addSuffix: true })}
        </span>
        <div className="flex items-center text-yellow-500">
          <Clock className="w-4 h-4 mr-1" />
          <span>In Progress</span>
        </div>
      </div>
      <div className="text-sm text-gray-300">
        {update.message}
      </div>
    </div>
  );

  const renderHistoricalCombat = (combat: CombatHistoryEntry) => (
    <div 
      key={combat.id} 
      className="bg-gray-800 p-4 rounded-lg border border-gray-700"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">
          {formatDistanceToNow(new Date(combat.timestamp), { addSuffix: true })}
        </span>
        {getCombatResult(combat) === "In Progress" ? (
          <div className="flex items-center text-yellow-500">
            <Clock className="w-4 h-4 mr-1" />
            <span>In Progress</span>
          </div>
        ) : getCombatResult(combat) === "Victory" ? (
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
        <div>Action: {combat.action}</div>
        {combat.territory_from && combat.territory_to && (
          <div>Location: {combat.territory_from} → {combat.territory_to}</div>
        )}
        <div>Damage Dealt: {combat.damage_dealt}</div>
        <div>Units Lost: {combat.units_lost}</div>
      </div>
    </div>
  );

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
          ) : (
            <div className="space-y-4">
              {/* Current game combat updates */}
              {combatUpdates.map((update, index) => renderCombatUpdate(update, index))}
              
              {/* Historical combat records */}
              {historicalCombats?.map(combat => renderHistoricalCombat(combat))}
              
              {combatUpdates.length === 0 && (!historicalCombats || historicalCombats.length === 0) && (
                <div className="text-center text-white">No combat history yet</div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default CombatHistory;
