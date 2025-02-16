
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tournament, TournamentPlayer } from '@/types/tournament';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
      return data as Tournament;
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
      return data as Tournament[];
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
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as TournamentPlayer | null;
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
