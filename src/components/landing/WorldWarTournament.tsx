
import { Crown, ChevronRight, Trophy, Coins, Clock } from "lucide-react";

const WorldWarTournament = () => (
  <div className="game-card bg-gradient-to-br from-[#1a2237] to-transparent border border-[#ffd02f]/20">
    <Crown className="w-16 h-16 text-[#ffd02f] mb-4" />
    <h3 className="text-2xl font-bold mb-4 text-[#ffd02f]">World War Tournament</h3>
    <p className="text-gray-200 mb-6">Longer game-mode where 42 players compete in a structured elimination tournament</p>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="text-[#ffd02f] font-semibold mb-3">Tournament Structure</h4>
        <ul className="space-y-3">
          <li className="flex items-start gap-2 text-gray-200">
            <ChevronRight className="w-4 h-4 text-[#ffd02f] mt-1" />
            Start at national level battles
          </li>
          <li className="flex items-start gap-2 text-gray-200">
            <ChevronRight className="w-4 h-4 text-[#ffd02f] mt-1" />
            Progress to regional conflicts
          </li>
          <li className="flex items-start gap-2 text-gray-200">
            <ChevronRight className="w-4 h-4 text-[#ffd02f] mt-1" />
            Advance to continental warfare
          </li>
          <li className="flex items-start gap-2 text-gray-200">
            <ChevronRight className="w-4 h-4 text-[#ffd02f] mt-1" />
            Compete in World War Finals
          </li>
        </ul>
      </div>
      
      <div>
        <h4 className="text-[#ffd02f] font-semibold mb-3">Victory Rewards</h4>
        <ul className="space-y-3">
          <li className="flex items-start gap-2 text-gray-200">
            <Crown className="w-4 h-4 text-[#ffd02f] mt-1" />
            Earn the prestigious World Emperor badge
          </li>
          <li className="flex items-start gap-2 text-gray-200">
            <Trophy className="w-4 h-4 text-[#ffd02f] mt-1" />
            Unlock World Emperor achievement
          </li>
          <li className="flex items-start gap-2 text-gray-200">
            <Coins className="w-4 h-4 text-[#ffd02f] mt-1" />
            Gain 10,000 XP
          </li>
          <li className="flex items-start gap-2 text-gray-200">
            <Clock className="w-4 h-4 text-[#ffd02f] mt-1" />
            Turn-based battles played over hours
          </li>
        </ul>
      </div>
    </div>
  </div>
);

export default WorldWarTournament;
