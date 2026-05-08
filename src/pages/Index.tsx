import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, Gamepad } from "lucide-react";
import HeroSection from "@/components/landing/HeroSection";

const Index = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const backgroundRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (backgroundRef.current) {
      const rect = backgroundRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.02;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.02;
      setMousePosition({ x, y });
    }
  };

  const handlePlayNowClick = () => navigate('/game');

  return (
    <div
      className="min-h-screen bg-[#141B2C] text-white overflow-x-hidden w-full"
      onMouseMove={handleMouseMove}
    >
      <nav className="fixed top-0 right-0 z-50 p-4 flex items-center gap-4">
        <Button
          onClick={handlePlayNowClick}
          className="bg-[#ffd02f] text-black hover:bg-[#ffd02f]/90"
        >
          <Gamepad className="h-4 w-4 mr-2" />
          Play Now
        </Button>
      </nav>

      <HeroSection
        handlePlayNowClick={handlePlayNowClick}
        mousePosition={mousePosition}
        backgroundRef={backgroundRef}
      />

      <section className="game-section bg-[#1a2237]">
        <div className="game-container">
          <h2 className="text-[#ffd02f] game-title">Strategic Gameplay Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="game-card bg-gradient-to-br from-purple-900/50 to-transparent">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-castle w-12 h-12 text-[#ffd02f] mb-4">
                <path d="M22 20v-9H2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2Z" /><path d="M18 11V4H6v7" /><path d="M15 22v-4a3 3 0 0 0-3-3a3 3 0 0 0-3 3v4" /><path d="M22 11V9" /><path d="M2 11V9" /><path d="M6 4V2" /><path d="M18 4V2" /><path d="M10 4V2" /><path d="M14 4V2" />
              </svg>
              <h3 className="text-xl font-bold mb-2 text-[#ffd02f]">Empire Building</h3>
              <p className="text-gray-200">Construct cities, manage resources, and expand your territory strategically</p>
            </div>
            <div className="game-card bg-gradient-to-br from-red-900/50 to-transparent">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sword w-12 h-12 text-[#ffd02f] mb-4">
                <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" /><line x1="13" x2="19" y1="19" y2="13" /><line x1="16" x2="20" y1="16" y2="20" /><line x1="19" x2="21" y1="21" y2="19" />
              </svg>
              <h3 className="text-xl font-bold mb-2 text-[#ffd02f]">Tactical Combat</h3>
              <p className="text-gray-200">Command armies in hex-based tactical warfare with unique unit abilities</p>
            </div>
            <div className="game-card bg-gradient-to-br from-blue-900/50 to-transparent">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-crown w-12 h-12 text-[#ffd02f] mb-4">
                <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" /><path d="M5 21h14" />
              </svg>
              <h3 className="text-xl font-bold mb-2 text-[#ffd02f]">Dynamic Economy</h3>
              <p className="text-gray-200">Balance resources, trade, and development to grow your empire</p>
            </div>
          </div>
        </div>
      </section>

      <section className="game-section bg-[#141B2C]">
        <div className="game-container">
          <h2 className="game-title">Multiple Ways to Play</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
            <div className="game-card">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users w-12 h-12 text-[#ffd02f] mb-4">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <h3 className="text-xl font-bold mb-4 text-[#ffd02f]">Local Multiplayer</h3>
              <ul className="space-y-3">
                {["2-6 players on the same device", "Perfect for learning the game", "Instant turn-taking", "Host local tournaments"].map(item => (
                  <li key={item} className="flex items-center gap-2 text-gray-200">
                    <ChevronRight className="w-4 h-4 text-[#ffd02f]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="game-card">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe w-12 h-12 text-[#ffd02f] mb-4">
                <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />
              </svg>
              <h3 className="text-xl font-bold mb-4 text-[#ffd02f]">Online Multiplayer</h3>
              <ul className="space-y-3">
                {["Create or join game rooms", "Real-time synchronization", "Play with friends anywhere", "Achievement tracking"].map(item => (
                  <li key={item} className="flex items-center gap-2 text-gray-200">
                    <ChevronRight className="w-4 h-4 text-[#ffd02f]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="game-section bg-[#1a2237]">
        <div className="game-container">
          <h2 className="text-[#ffd02f] game-title">Paths to Victory</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: "shield", label: "Domination", desc: "Control 75% of the map territories" },
              { icon: "coins",  label: "Economic",   desc: "Accumulate 10,000 gold" },
              { icon: "target", label: "Military",   desc: "Eliminate all enemy forces" },
            ].map(({ label, desc }) => (
              <div key={label} className="game-card text-center">
                <h3 className="text-xl font-bold mb-2 text-[#ffd02f]">{label}</h3>
                <p className="text-gray-200">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="game-section bg-[#141B2C]">
        <div className="game-container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#F5D547]">
            Ready to Begin Your Conquest?
          </h2>
          <p className="text-lg md:text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
            Join players in epic battles for territory and resources. Your empire awaits!
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

export default Index;
