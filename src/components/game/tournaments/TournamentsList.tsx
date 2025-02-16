
import React from 'react';
import { useTournament } from '@/hooks/useTournament';
import TournamentCard from './TournamentCard';
import { ScrollArea } from '@/components/ui/scroll-area';

const TournamentsList = () => {
  const {
    activeTournaments,
    playerStatus,
    signupForTournament,
    verifyForTournament,
  } = useTournament();

  if (!activeTournaments) return null;

  return (
    <ScrollArea className="h-[600px] w-full p-4">
      <div className="space-y-4">
        {activeTournaments.map((tournament) => {
          const isSignedUp = playerStatus?.tournamentId === tournament.id;
          const canSignup = tournament.status === 'signups' && !isSignedUp;
          const canVerify = tournament.status === 'verification' && isSignedUp && !playerStatus?.verificationTime;

          return (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              canSignup={canSignup}
              canVerify={canVerify}
              onSignup={() => signupForTournament(tournament.id)}
              onVerify={() => verifyForTournament(tournament.id)}
            />
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default TournamentsList;
