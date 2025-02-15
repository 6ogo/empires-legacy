
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
import { Loader2, Trophy, Users } from "lucide-react";

const Stats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['gameStats'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('total_wins', { ascending: false })
        .limit(3);

      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return { profiles, totalPlayers: count };
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!stats || !stats.profiles || stats.profiles.length === 0) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-semibold mb-4">No Statistics Available</h2>
        <p className="text-gray-400">Play some games to see your statistics here!</p>
      </div>
    );
  }

  const chartData = stats.profiles.map(player => ({
    name: player.username || 'Anonymous',
    wins: player.total_wins,
    domination: player.domination_wins,
    economic: player.economic_wins,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Players</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlayers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Players</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.profiles.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Game Statistics</CardTitle>
          <CardDescription>Top 3 players and their achievements</CardDescription>
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
        {stats.profiles.map((player, index) => (
          <Card key={player.id} className={index === 0 ? "border-yellow-400" : ""}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {player.username || 'Anonymous'}
                {index === 0 && <Trophy className="h-4 w-4 text-yellow-400" />}
              </CardTitle>
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
