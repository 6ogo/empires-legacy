import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Compass,
  Building2,
  Coins,
  Swords,
  Users,
  Globe,
  Mountain,
  Castle,
  Crown,
  Sword,
  ChevronRight,
  LogIn,
  Gamepad,
  Shield,
  Target,
  Trophy,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";

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
      <nav className="fixed top-0 right-0 z-50 p-4 flex items-center gap-4">
        {user ? (
          <Button 
            onClick={() => navigate('/game')}
            className="bg-[#ffd02f] text-black hover:bg-[#ffd02f]/90"
          >
            <Gamepad className="h-4 w-4 mr-2" />
            Play Now
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => navigate('/auth')}
              className="bg-white/10 text-white hover:bg-white/20"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Button>
          </>
        )}
      </nav>

      <div 
        ref={backgroundRef}
        className="relative min-h-screen flex items-center justify-center w-full overflow-hidden"
        style={{
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: `calc(50% + ${mousePosition.x}px) calc(50% + ${mousePosition.y}px)`,
          backgroundAttachment: "fixed",
          transition: "background-position 0.3s ease-out"
        }}
      >
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto w-full flex flex-col items-center justify-center min-h-screen -mt-32">
          <img 
            src="/testLogo.png" 
            alt="Empire's Legacy Logo" 
            className="w-1/4 mb-8 opacity-80"
          />
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-[#ffd02f] animate-float">
            Empire's Legacy
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl mb-8 text-gray-200">
            A Turn-Based Strategy Game of Conquest and Empire Building
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handlePlayNowClick}
              className="bg-[#ffd02f] text-black hover:bg-[#ffd02f]/90 text-lg px-6 md:px-8 py-4 md:py-6"
            >
              Play Now <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

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
          </div>
        </div>
      </section>

      <section className="game-section bg-[#1a2237]">
        <div className="game-container">
          <h2 className="game-title">Paths to Victory</h2>
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

const GameFeatureCard = ({ icon: Icon, title, description, bgColor }: { 
  icon: any; 
  title: string; 
  description: string;
  bgColor: string;
}) => (
  <div className={`game-card bg-gradient-to-br ${bgColor} to-transparent`}>
    <Icon className="w-12 h-12 text-[#ffd02f] mb-4" />
    <h3 className="text-xl font-bold mb-2 text-[#ffd02f]">{title}</h3>
    <p className="text-gray-200">{description}</p>
  </div>
);

const GameModeCard = ({ icon: Icon, title, features }: {
  icon: any;
  title: string;
  features: string[];
}) => (
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

const VictoryCard = ({ icon: Icon, title, description }: {
  icon: any;
  title: string;
  description: string;
}) => (
  <div className="game-card text-center group">
    <div className="relative">
      <div className="absolute inset-0 bg-[#ffd02f]/10 rounded-full blur-xl transition-opacity group-hover:opacity-100 opacity-0" />
      <Icon className="w-16 h-16 text-[#ffd02f] mx-auto mb-4 relative z-10" />
    </div>
    <h3 className="text-xl font-bold mb-2 text-[#ffd02f]">{title}</h3>
    <p className="text-gray-200">{description}</p>
  </div>
);

export default Landing;
