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
  Trophy,
  Shield,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePlayNowClick = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-[#141B2C] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 right-0 z-50 p-4 flex items-center gap-4">
        {user ? (
          <Button 
            onClick={() => navigate('/game')}
            className="bg-[#F5D547] text-black hover:bg-[#F5D547]/90"
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

      {/* Hero Section */}
      <div 
        className="relative min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed"
        }}
      >
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-bold mb-4 text-[#F5D547] animate-float">
            Empire's Legacy
          </h1>
          <p className="text-2xl md:text-3xl mb-8 text-gray-200">
            A Turn-Based Strategy Game of Conquest and Empire Building
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handlePlayNowClick}
              className="game-button-primary text-lg px-8 py-6"
            >
              Play Now <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="game-section bg-[#1a2237]">
        <div className="game-container">
          <h2 className="game-title">Strategic Gameplay Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
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

      {/* Game Modes Section */}
      <section className="game-section bg-[#141B2C]">
        <div className="game-container">
          <h2 className="game-title">Multiple Ways to Play</h2>
          <div className="grid md:grid-cols-2 gap-8">
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
        </div>
      </section>

      {/* Victory Conditions */}
      <section className="game-section bg-[#1a2237]">
        <div className="game-container">
          <h2 className="game-title">Paths to Victory</h2>
          <div className="grid md:grid-cols-3 gap-8">
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

      {/* CTA Section */}
      <section className="game-section bg-[#141B2C]">
        <div className="game-container text-center">
          <h2 className="text-4xl font-bold mb-6 text-[#F5D547]">
            Ready to Begin Your Conquest?
          </h2>
          <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
            Join thousands of players in epic battles for territory and resources. 
            Your empire awaits!
          </p>
          <Button
            onClick={handlePlayNowClick}
            className="game-button-primary text-lg px-12 py-6 transform hover:scale-105 transition-transform"
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
    <Icon className="w-12 h-12 text-[#F5D547] mb-4" />
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </div>
);

const GameModeCard = ({ icon: Icon, title, features }: {
  icon: any;
  title: string;
  features: string[];
}) => (
  <div className="game-card">
    <Icon className="w-12 h-12 text-[#F5D547] mb-4" />
    <h3 className="text-xl font-bold mb-4">{title}</h3>
    <ul className="space-y-3">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center gap-2 text-gray-300">
          <ChevronRight className="w-4 h-4 text-[#F5D547]" />
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
      <div className="absolute inset-0 bg-[#F5D547]/10 rounded-full blur-xl transition-opacity group-hover:opacity-100 opacity-0" />
      <Icon className="w-16 h-16 text-[#F5D547] mx-auto mb-4 relative z-10" />
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </div>
);

export default Landing;
