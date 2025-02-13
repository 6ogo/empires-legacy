
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/hooks/useAuth";
import { Json } from "@/integrations/supabase/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy, Clock, GamepadIcon, Swords, Coins } from "lucide-react";

const Leaderboard = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("total_wins", { ascending: false })
          .limit(10);

        if (error) throw error;
        
        if (data) {
          // Transform the data to match UserProfile type
          const transformedProfiles: UserProfile[] = data.map(profile => ({
            id: profile.id,
            username: profile.username,
            verified: profile.verified,
            email_verified: profile.email_verified,
            preferences: typeof profile.preferences === 'string' 
              ? JSON.parse(profile.preferences)
              : profile.preferences as { stayLoggedIn: boolean },
            avatar_url: profile.avatar_url,
            created_at: profile.created_at,
            total_gametime: profile.total_gametime,
            total_games_played: profile.total_games_played,
            total_wins: profile.total_wins,
            economic_wins: profile.economic_wins,
            domination_wins: profile.domination_wins,
          }));
          setProfiles(transformedProfiles);
        }
      } catch (error) {
        console.error("Error fetching profiles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const formatGametime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (loading) {
    return <div>Loading leaderboard...</div>;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-game-gold flex items-center gap-2">
          <Trophy className="h-6 w-6" /> Leaderboard
        </CardTitle>
        <CardDescription>Top players in Empire's Legacy</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="wins" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="wins">Total Wins</TabsTrigger>
            <TabsTrigger value="games">Games Played</TabsTrigger>
            <TabsTrigger value="economic">Economic Wins</TabsTrigger>
            <TabsTrigger value="domination">Domination Wins</TabsTrigger>
          </TabsList>

          <TabsContent value="wins">
            <LeaderboardTable
              data={profiles.sort((a, b) => (b.total_wins || 0) - (a.total_wins || 0))}
              columns={["#", "Username", "Total Wins", "Win Rate"]}
              renderRow={(profile, index) => (
                <TableRow key={profile.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{profile.username}</TableCell>
                  <TableCell>{profile.total_wins}</TableCell>
                  <TableCell>
                    {profile.total_games_played
                      ? `${((profile.total_wins / profile.total_games_played) * 100).toFixed(1)}%`
                      : "0%"}
                  </TableCell>
                </TableRow>
              )}
            />
          </TabsContent>

          <TabsContent value="games">
            <LeaderboardTable
              data={profiles.sort((a, b) => (b.total_games_played || 0) - (a.total_games_played || 0))}
              columns={["#", "Username", "Games", "Playtime"]}
              renderRow={(profile, index) => (
                <TableRow key={profile.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{profile.username}</TableCell>
                  <TableCell>{profile.total_games_played}</TableCell>
                  <TableCell>{formatGametime(profile.total_gametime || 0)}</TableCell>
                </TableRow>
              )}
            />
          </TabsContent>

          <TabsContent value="economic">
            <LeaderboardTable
              data={profiles.sort((a, b) => (b.economic_wins || 0) - (a.economic_wins || 0))}
              columns={["#", "Username", "Economic Wins", "% of Wins"]}
              renderRow={(profile, index) => (
                <TableRow key={profile.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{profile.username}</TableCell>
                  <TableCell>{profile.economic_wins}</TableCell>
                  <TableCell>
                    {profile.total_wins
                      ? `${((profile.economic_wins / profile.total_wins) * 100).toFixed(1)}%`
                      : "0%"}
                  </TableCell>
                </TableRow>
              )}
            />
          </TabsContent>

          <TabsContent value="domination">
            <LeaderboardTable
              data={profiles.sort((a, b) => (b.domination_wins || 0) - (a.domination_wins || 0))}
              columns={["#", "Username", "Domination Wins", "% of Wins"]}
              renderRow={(profile, index) => (
                <TableRow key={profile.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{profile.username}</TableCell>
                  <TableCell>{profile.domination_wins}</TableCell>
                  <TableCell>
                    {profile.total_wins
                      ? `${((profile.domination_wins / profile.total_wins) * 100).toFixed(1)}%`
                      : "0%"}
                  </TableCell>
                </TableRow>
              )}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface LeaderboardTableProps {
  data: UserProfile[];
  columns: string[];
  renderRow: (profile: UserProfile, index: number) => React.ReactNode;
}

const LeaderboardTable = ({ data, columns, renderRow }: LeaderboardTableProps) => (
  <Table>
    <TableHeader>
      <TableRow>
        {columns.map((column) => (
          <TableHead key={column}>{column}</TableHead>
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((profile, index) => renderRow(profile, index))}
    </TableBody>
  </Table>
);

export default Leaderboard;
