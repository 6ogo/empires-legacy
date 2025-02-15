
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
  LogIn
} from "lucide-react";
import { useEffect } from "react";

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Only redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      navigate('/game');
    }
  }, [user, navigate]);

  const handlePlayNowClick = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 right-0 z-50 p-4">
        <Link
          to="/auth"
          className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 border border-gray-700 hover:border-yellow-400 transition-all"
        >
          <LogIn className="w-4 h-4" />
          Login
        </Link>
      </nav>

      {/* Hero Section */}
      <div 
        className="relative min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900"></div>
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-bold mb-4 text-yellow-400">
            Empire's Legacy
          </h1>
          <p className="text-2xl md:text-3xl mb-8 text-gray-200">
            Forge Your Empire, Conquer Your Destiny
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handlePlayNowClick}
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-8 rounded-lg flex items-center gap-2 transform hover:scale-105 transition"
            >
              Play Now <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center text-yellow-400">
            Master the Art of Empire Building
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
              <Compass className="w-8 h-8 text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">eXplore</h3>
              <p className="text-gray-400">Discover vast territories and hidden resources across diverse landscapes</p>
            </div>
            <div className="p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
              <Building2 className="w-8 h-8 text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">eXpand</h3>
              <p className="text-gray-400">Grow your empire through strategic building and territory control</p>
            </div>
            <div className="p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
              <Coins className="w-8 h-8 text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">eXploit</h3>
              <p className="text-gray-400">Manage resources and optimize production for maximum efficiency</p>
            </div>
            <div className="p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
              <Swords className="w-8 h-8 text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">eXterminate</h3>
              <p className="text-gray-400">Build armies and engage in tactical combat to defeat your rivals</p>
            </div>
          </div>
        </div>
      </section>

      {/* Game Modes Section */}
      <section className="py-20 px-4 bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center text-yellow-400">
            Choose Your Battle
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-gray-900 rounded-lg border border-gray-700 hover:border-yellow-400 transition">
              <Users className="w-12 h-12 text-yellow-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Local Multiplayer</h3>
              <ul className="space-y-3">
                {[
                  "2-6 players on the same device",
                  "Perfect for learning the game",
                  "Instant turn-taking",
                  "Host local tournaments"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-300">
                    <ChevronRight className="w-4 h-4 text-yellow-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-8 bg-gray-900 rounded-lg border border-gray-700 hover:border-yellow-400 transition">
              <Globe className="w-12 h-12 text-yellow-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Online Multiplayer</h3>
              <ul className="space-y-3">
                {[
                  "Create or join game rooms",
                  "Real-time synchronization",
                  "In-game chat system",
                  "Achievement tracking"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-300">
                    <ChevronRight className="w-4 h-4 text-yellow-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Game Features Section */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center text-yellow-400">
            Core Game Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-800 rounded-lg">
              <Coins className="w-8 h-8 text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                {["Gold", "Wood", "Stone", "Food"].map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-300">
                    <ChevronRight className="w-4 h-4 text-yellow-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 bg-gray-800 rounded-lg">
              <Mountain className="w-8 h-8 text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold mb-4">Territory Types</h3>
              <ul className="space-y-2">
                {["Plains", "Mountains", "Forests", "Coast", "Capital"].map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-300">
                    <ChevronRight className="w-4 h-4 text-yellow-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 bg-gray-800 rounded-lg">
              <Castle className="w-8 h-8 text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold mb-4">Buildings</h3>
              <ul className="space-y-2">
                {["Lumber Mill", "Mine", "Market", "Farm", "Barracks"].map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-300">
                    <ChevronRight className="w-4 h-4 text-yellow-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Victory Conditions Section */}
      <section className="py-20 px-4 bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center text-yellow-400">
            Path to Victory
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-900 rounded-lg border border-gray-700 hover:border-yellow-400 transition text-center">
              <Crown className="w-12 h-12 text-yellow-400 mb-4 mx-auto" />
              <h3 className="text-xl font-bold mb-2">Domination</h3>
              <p className="text-gray-400">Control 75% of the map and eliminate enemy forces</p>
            </div>
            <div className="p-6 bg-gray-900 rounded-lg border border-gray-700 hover:border-yellow-400 transition text-center">
              <Coins className="w-12 h-12 text-yellow-400 mb-4 mx-auto" />
              <h3 className="text-xl font-bold mb-2">Economic</h3>
              <p className="text-gray-400">Accumulate 10,000 gold and control trade centers</p>
            </div>
            <div className="p-6 bg-gray-900 rounded-lg border border-gray-700 hover:border-yellow-400 transition text-center">
              <Sword className="w-12 h-12 text-yellow-400 mb-4 mx-auto" />
              <h3 className="text-xl font-bold mb-2">Military</h3>
              <p className="text-gray-400">Capture all enemy capitals and hold them</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-yellow-400">
            Ready to Build Your Empire?
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            Join thousands of players in the ultimate strategy experience
          </p>
          <button 
            onClick={handlePlayNowClick}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-4 px-12 rounded-lg flex items-center gap-2 mx-auto w-fit transform hover:scale-105 transition"
          >
            Start Your Journey <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
