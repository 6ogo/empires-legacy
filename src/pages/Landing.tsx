
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  Globe,
  Castle,
  Crown,
  Sword,
} from "lucide-react";
import { useState, useRef } from "react";
import HeroSection from "@/components/landing/HeroSection";
import GameFeatureCard from "@/components/landing/GameFeatureCard";
import GameModeCard from "@/components/landing/GameModeCard";
import VictoryCard from "@/components/landing/VictoryCard";
import WorldWarTournament from "@/components/landing/WorldWarTournament";

const Landing = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const backgroundRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (backgroundRef.current) {
      const { clientX, clientY } = e;
      const { width, height } = backgroundRef.current.getBoundingClientRect();
      const x = (clientX / width - 0.5) * 20;
      const y = (clientY / height - 0.5) * 20;
      setMousePosition({ x, y });
    }
  };

  const handlePlayNowClick = () => {
    if (user) {
      navigate('/game');
    } else {
      navigate('/auth');
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <div 
      className="min-h-screen bg-[#141B2C] text-white overflow-x-hidden w-full"
      onMouseMove={handleMouseMove}
    >
      <HeroSection 
        handlePlayNowClick={handlePlayNowClick}
        mousePosition={mousePosition}
        backgroundRef={backgroundRef}
      />

      <section className="game-section bg-[#1a2237]">
        <div className="game-container">
          <h2 className="text-[#ffd02f] game-title">Strategic Gameplay Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <GameFeatureCard
              icon={Castle}
              title="Empire Building"
              description="Construct cities, manage resources, and expand your territory strategically"
              bgColor="from-purple-900/50"
            />
            <GameFeatureCard
              icon={Sword}
              title="Tactical Combat"
              description="Command armies in hex-based tactical warfare with unique unit abilities"
              bgColor="from-red-900/50"
            />
            <GameFeatureCard
              icon={Crown}
              title="Dynamic Economy"
              description="Balance resources, trade, and development to grow your empire"
              bgColor="from-blue-900/50"
            />
          </div>
        </div>
      </section>

      <section className="game-section bg-[#141B2C]">
        <div className="game-container">
          <h2 className="game-title">Multiple Ways to Play</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
            <GameModeCard
              icon={Users}
              title="Local Multiplayer"
              features={[
                "2-6 players on the same device",
                "Perfect for learning the game",
                "Instant turn-taking",
                "Host local tournaments"
              ]}
            />
            <GameModeCard
              icon={Globe}
              title="Online Multiplayer"
              features={[
                "Create or join game rooms",
                "Real-time synchronization",
                "In-game chat system",
                "Achievement tracking"
              ]}
            />
          </div>
          
          <div className="mt-12">
            <WorldWarTournament />
          </div>
        </div>
      </section>

      <section className="game-section bg-[#1a2237]">
        <div className="game-container">
          <h2 className="text-[#ffd02f] game-title">Paths to Victory</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <VictoryCard
              icon={Shield}
              title="Domination"
              description="Control 75% of the map territories"
            />
            <VictoryCard
              icon={Coins}
              title="Economic"
              description="Accumulate vast wealth and economic power"
            />
            <VictoryCard
              icon={Target}
              title="Military"
              description="Eliminate all enemy forces and capitals"
            />
          </div>
        </div>
      </section>

      <section className="game-section bg-[#141B2C]">
        <div className="game-container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#F5D547]">
            Ready to Begin Your Conquest?
          </h2>
          <p className="text-lg md:text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
            Join players in epic battles for territory and resources. 
            Your empire awaits!
          </p>
          <Button
            onClick={handlePlayNowClick}
            className="game-button-primary text-lg px-8 md:px-12 py-4 md:py-6 transform hover:scale-105 transition-transform"
          >
            Start Your Journey <ChevronRight className="h-6 w-6 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
