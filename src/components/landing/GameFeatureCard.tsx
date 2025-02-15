
import { LucideIcon } from "lucide-react";

interface GameFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  bgColor: string;
}

const GameFeatureCard = ({ icon: Icon, title, description, bgColor }: GameFeatureCardProps) => (
  <div className={`game-card bg-gradient-to-br ${bgColor} to-transparent`}>
    <Icon className="w-12 h-12 text-[#ffd02f] mb-4" />
    <h3 className="text-xl font-bold mb-2 text-[#ffd02f]">{title}</h3>
    <p className="text-gray-200">{description}</p>
  </div>
);

export default GameFeatureCard;
