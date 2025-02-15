
import { LucideIcon } from "lucide-react";

interface VictoryCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const VictoryCard = ({ icon: Icon, title, description }: VictoryCardProps) => (
  <div className="game-card text-center group">
    <div className="relative">
      <div className="absolute inset-0 bg-[#ffd02f]/10 rounded-full blur-xl transition-opacity group-hover:opacity-100 opacity-0" />
      <Icon className="w-16 h-16 text-[#ffd02f] mx-auto mb-4 relative z-10" />
    </div>
    <h3 className="text-xl font-bold mb-2 text-[#ffd02f]">{title}</h3>
    <p className="text-gray-200">{description}</p>
  </div>
);

export default VictoryCard;
