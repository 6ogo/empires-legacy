
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tournament, TournamentPlayer } from '@/types/tournament';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Database } from '@/types/database.types';

type Tables = Database['public']['Tables'];

const mapToTournament = (row: Tables['tournaments']['Row']): Tournament => ({
  id: row.id,
  status: row.status,
  stage: row.stage,
  regionId: row.region_id,
  startTime: row.start_time,
  signupStartTime: row.signup_start_time,
  verificationStartTime: row.verification_start_time,
  maxPlayers: row.max_players,
  currentPlayers: row.current_players,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapToTournamentPlayer = (row: Tables['tournament_players']['Row']): TournamentPlayer => ({
  id: row.id,
  tournamentId: row.tournament_id,
  userId: row.user_id,
  status: row.status,
  signupTime: row.signup_time,
  verificationTime: row.verification_time || undefined,
  eliminated: row.eliminated,
  position: row.position || undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const useTournament = (tournamentId?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: currentTournament, isLoading: isLoadingTournament } = useQuery({
    queryKey: ['tournament', tournamentId],
    queryFn: async () => {
      if (!tournamentId) return null;
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();

      if (error) throw error;
      return data ? mapToTournament(data) : null;
    },
    enabled: !!tournamentId
  });

  const { data: activeTournaments } = useQuery({
    queryKey: ['tournaments', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .in('status', ['upcoming', 'signups', 'verification', 'in_progress'])
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data?.map(mapToTournament) || [];
    }
  });

  const { data: playerStatus } = useQuery({
    queryKey: ['tournament', tournamentId, 'player-status'],
    queryFn: async () => {
      if (!tournamentId || !user) return null;
      const { data, error } = await supabase
        .from('tournament_players')
        .select('*')
        .eq('tournament_id', tournamentId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data ? mapToTournamentPlayer(data) : null;
    },
    enabled: !!tournamentId && !!user
  });

  const signupMutation = useMutation({
    mutationFn: async (tournamentId: string) => {
      if (!user) throw new Error('Must be logged in to sign up');
      
      const { error } = await supabase
        .from('tournament_players')
        .insert({
          tournament_id: tournamentId,
          user_id: user.id,
          status: 'registered',
          signup_time: new Date().toISOString(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournament'] });
      toast.success('Successfully signed up for tournament!');
    },
    onError: (error) => {
      console.error('Tournament signup error:', error);
      toast.error('Failed to sign up for tournament');
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async (tournamentId: string) => {
      if (!user) throw new Error('Must be logged in to verify');
      
      const { error } = await supabase
        .from('tournament_players')
        .update({
          status: 'verified',
          verification_time: new Date().toISOString()
        })
        .eq('tournament_id', tournamentId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournament'] });
      toast.success('Successfully verified for tournament!');
    },
    onError: (error) => {
      console.error('Tournament verification error:', error);
      toast.error('Failed to verify for tournament');
    }
  });

  return {
    currentTournament,
    activeTournaments,
    playerStatus,
    isLoadingTournament,
    signupForTournament: signupMutation.mutate,
    verifyForTournament: verifyMutation.mutate,
  };
};
