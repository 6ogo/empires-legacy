
import React from 'react';
import { useTournament } from '@/hooks/useTournament';
import TournamentCard from './TournamentCard';
import { ScrollArea } from '@/components/ui/scroll-area';

const TournamentsList = () => {
  const {
    tournaments,
    loading,
    error,
    registerForTournament
  } = useTournament();

  if (!tournaments) return null;

  return (
    <ScrollArea className="h-[600px] w-full p-4">
      <div className="space-y-4">
        {tournaments.map((tournament) => {
          return (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              canSignup={tournament.status === 'signups'}
              canVerify={tournament.status === 'verification'}
              onSignup={() => registerForTournament(tournament.id)}
              onVerify={() => registerForTournament(tournament.id)}
            />
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default TournamentsList;
