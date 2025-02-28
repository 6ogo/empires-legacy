
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tournament } from '@/types/tournament';

export function useTournament() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all tournaments
  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;
      
      // Transform data to match Tournament type
      const formattedTournaments: Tournament[] = data.map(tournament => ({
        id: tournament.id,
        status: tournament.status as "upcoming" | "signups" | "verification" | "in_progress" | "completed",
        stage: tournament.stage as "country" | "regional" | "continental" | "world",
        regionId: tournament.region_id,
        startTime: tournament.start_time,
        signupStartTime: tournament.signup_start_time,
        verificationStartTime: tournament.verification_start_time,
        maxPlayers: tournament.max_players,
        currentPlayers: tournament.current_players,
        createdAt: tournament.created_at,
        updatedAt: tournament.updated_at,
      }));
      
      setTournaments(formattedTournaments);
    } catch (err) {
      console.error('Error fetching tournaments:', err);
      setError('Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  // Register for a tournament
  const registerForTournament = async (tournamentId: string) => {
    try {
      // Implementation will depend on your database structure and requirements
      console.log(`Registering for tournament ${tournamentId}`);
      
      // Example implementation:
      // const { data, error } = await supabase
      //   .from('tournament_registrations')
      //   .insert([{ tournament_id: tournamentId, user_id: currentUser.id }]);
      
      // if (error) throw error;
      
      return { success: true };
    } catch (err) {
      console.error('Error registering for tournament:', err);
      return { success: false, error: 'Failed to register for tournament' };
    }
  };

  // Fetch tournaments on component mount
  useEffect(() => {
    fetchTournaments();
  }, []);

  return {
    tournaments,
    loading,
    error,
    fetchTournaments,
    registerForTournament
  };
}
