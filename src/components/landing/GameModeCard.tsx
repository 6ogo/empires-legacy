
import { LucideIcon, ChevronRight } from "lucide-react";

interface GameModeCardProps {
  icon: LucideIcon;
  title: string;
  features: string[];
}

const GameModeCard = ({ icon: Icon, title, features }: GameModeCardProps) => (
  <div className="game-card">
    <Icon className="w-12 h-12 text-[#ffd02f] mb-4" />
    <h3 className="text-xl font-bold mb-4 text-[#ffd02f]">{title}</h3>
    <ul className="space-y-3">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center gap-2 text-gray-200">
          <ChevronRight className="w-4 h-4 text-[#ffd02f]" />
          {feature}
        </li>
      ))}
    </ul>
  </div>
);

export default GameModeCard;
