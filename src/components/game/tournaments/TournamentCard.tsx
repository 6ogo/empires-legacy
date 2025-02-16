
import React from 'react';
import { Tournament } from '@/types/tournament';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Sword, Trophy, Clock, Users } from 'lucide-react';

interface TournamentCardProps {
  tournament: Tournament;
  canSignup: boolean;
  canVerify: boolean;
  onSignup: () => void;
  onVerify: () => void;
}

const TournamentCard = ({
  tournament,
  canSignup,
  canVerify,
  onSignup,
  onVerify
}: TournamentCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500';
      case 'signups': return 'bg-green-500';
      case 'verification': return 'bg-yellow-500';
      case 'in_progress': return 'bg-purple-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'country': return '🏠';
      case 'regional': return '🌍';
      case 'continental': return '🌎';
      case 'world': return '🌏';
      default: return '🎮';
    }
  };

  return (
    <Card className="w-full max-w-md bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">
            {getStageIcon(tournament.stage)} {tournament.stage.charAt(0).toUpperCase() + tournament.stage.slice(1)} Tournament
          </CardTitle>
          <Badge className={`${getStatusColor(tournament.status)} text-white`}>
            {tournament.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4" />
          <span>Starts: {format(new Date(tournament.startTime), 'PPp')}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4" />
          <span>Players: {tournament.currentPlayers}/{tournament.maxPlayers}</span>
        </div>
        {tournament.status === 'signups' && (
          <div className="text-sm text-muted-foreground">
            Verification starts in: {format(new Date(tournament.verificationStartTime), 'PPp')}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {canSignup && (
          <Button onClick={onSignup} className="bg-green-500 hover:bg-green-600">
            <Sword className="w-4 h-4 mr-2" />
            Sign Up
          </Button>
        )}
        {canVerify && (
          <Button onClick={onVerify} className="bg-yellow-500 hover:bg-yellow-600">
            <Trophy className="w-4 h-4 mr-2" />
            Verify
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TournamentCard;
