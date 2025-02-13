
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from "lucide-react";

const Stats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['gameStats'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('total_wins', { ascending: false })
        .limit(10);

      if (error) throw error;
      return profiles;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const chartData = stats?.map(player => ({
    name: player.username || 'Anonymous',
    wins: player.total_wins,
    domination: player.domination_wins,
    economic: player.economic_wins,
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Game Statistics</CardTitle>
          <CardDescription>Top players and their achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="wins" fill="#F5D547" name="Total Wins" />
                <Bar dataKey="domination" fill="#9F7AEA" name="Domination Wins" />
                <Bar dataKey="economic" fill="#48BB78" name="Economic Wins" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats?.map((player) => (
          <Card key={player.id}>
            <CardHeader>
              <CardTitle className="text-lg">{player.username || 'Anonymous'}</CardTitle>
              <CardDescription>Player Statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">Total Games: {player.total_games_played}</p>
                <p className="text-sm">Total Wins: {player.total_wins}</p>
                <p className="text-sm">Domination Wins: {player.domination_wins}</p>
                <p className="text-sm">Economic Wins: {player.economic_wins}</p>
                <p className="text-sm">Win Rate: {((player.total_wins / (player.total_games_played || 1)) * 100).toFixed(1)}%</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Stats;
